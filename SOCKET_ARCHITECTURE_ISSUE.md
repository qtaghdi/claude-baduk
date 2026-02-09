# 🐛 Socket.io 아키텍처 문제 분석

## 현재 문제

**증상:** 방 생성은 되지만 다른 플레이어가 참가할 수 없음

## 근본 원인

### 현재 흐름의 문제점

1. **방 생성자:**
   ```
   /game/create → Socket 연결 #1
   ↓
   create-room emit
   ↓
   room-created 받음
   ↓
   router.replace('/game/{roomId}') → 페이지 변경
   ↓
   /game/{roomId} → Socket 연결 #2 (새로운 연결!)
   ↓
   이전 Socket #1이 disconnect됨
   ↓
   서버에서 방 생성자가 disconnect된 것으로 인식
   ↓
   cleanupPlayerRooms() 호출로 방이 삭제됨!
   ```

2. **방 참가자:**
   ```
   /game/{roomId} 직접 접속
   ↓
   join-room emit
   ↓
   "Room not found" 에러 (이미 삭제됨)
   ```

### SocketEventHandler.ts의 문제

```typescript
// 213번 줄
private handleDisconnect(socket: Socket): void {
  logger.info('Client disconnected', { socketId: socket.id });

  const deletedRooms = this.roomManager.cleanupPlayerRooms(socket.id);
  // ↑ 이게 문제! 방 생성자가 페이지 전환할 때 이전 소켓이 disconnect되면서
  // 방이 즉시 삭제됨
}
```

## 해결 방법

### 옵션 1: URL 라우팅 구조 변경 (권장)

`create.tsx`를 제거하고 모든 게임을 `[roomId].tsx`에서 처리:

```typescript
// [roomId].tsx
useEffect(() => {
  if (!roomId || typeof roomId !== 'string') return;

  const socketUrl = process.env.NEXT_PUBLIC_SOCKET_URL || 'http://localhost:3000';
  const newSocket = io(socketUrl, {
    transports: ['websocket'],
  });

  newSocket.on('connect', () => {
    console.log('Connected to server');

    // Query parameter로 생성/참가 구분
    if (router.query.create === 'true') {
      newSocket.emit('create-room');
    } else {
      newSocket.emit('join-room', roomId);
    }
  });

  // ...
}, [roomId, router.query]);
```

그리고 index.tsx에서:
```typescript
const handleCreateRoom = () => {
  const tempId = 'CREATE'; // 임시 ID
  router.push(`/game/${tempId}?create=true`);
};
```

### 옵션 2: Socket 연결 유지

Socket을 전역 상태나 Context로 관리하여 페이지 전환 시에도 유지:

```typescript
// src/contexts/SocketContext.tsx
const SocketContext = createContext<Socket | null>(null);

export const SocketProvider: React.FC = ({ children }) => {
  const [socket, setSocket] = useState<Socket | null>(null);

  useEffect(() => {
    const socketUrl = process.env.NEXT_PUBLIC_SOCKET_URL || 'http://localhost:3000';
    const newSocket = io(socketUrl);
    setSocket(newSocket);

    return () => {
      newSocket.close();
    };
  }, []);

  return (
    <SocketContext.Provider value={socket}>
      {children}
    </SocketContext.Provider>
  );
};
```

### 옵션 3: 방 삭제 로직 개선 (가장 간단)

서버에서 disconnect 시 즉시 삭제하지 않고 지연 삭제:

```typescript
// GameRoomManager.ts에 추가
private roomTimeouts: Map<string, NodeJS.Timeout> = new Map();

scheduleRoomDeletion(roomId: string, delayMs: number = 30000): void {
  // 기존 타이머가 있으면 취소
  const existingTimeout = this.roomTimeouts.get(roomId);
  if (existingTimeout) {
    clearTimeout(existingTimeout);
  }

  // 30초 후 삭제
  const timeout = setTimeout(() => {
    this.deleteRoom(roomId);
    this.roomTimeouts.delete(roomId);
  }, delayMs);

  this.roomTimeouts.set(roomId, timeout);
}

cancelRoomDeletion(roomId: string): void {
  const timeout = this.roomTimeouts.get(roomId);
  if (timeout) {
    clearTimeout(timeout);
    this.roomTimeouts.delete(roomId);
  }
}
```

```typescript
// SocketEventHandler.ts 수정
private handleDisconnect(socket: Socket): void {
  logger.info('Client disconnected', { socketId: socket.id });

  const roomId = this.roomManager.findRoomByPlayer(socket.id);
  if (roomId) {
    // 즉시 삭제하지 않고 30초 유예
    this.roomManager.scheduleRoomDeletion(roomId, 30000);
    this.io.to(roomId).emit(SOCKET_EVENTS.PLAYER_DISCONNECTED);
  }
}

private handleJoinRoom(socket: Socket, roomId: string): void {
  try {
    // 재연결 시 삭제 취소
    this.roomManager.cancelRoomDeletion(roomId);

    const gameState = this.roomManager.joinRoom(roomId, socket.id);
    socket.join(roomId);

    this.io.to(roomId).emit(SOCKET_EVENTS.GAME_START, gameState);
  } catch (error) {
    // ...
  }
}
```

## 권장 해결책

**옵션 3 (지연 삭제)가 가장 간단하고 안전합니다:**

장점:
- 기존 코드 구조 유지
- 페이지 전환, 새로고침, 일시적 연결 끊김 등에 대응
- 사용자 경험 개선

단점:
- 좀비 방이 30초간 메모리에 남음 (하지만 매우 적은 메모리)

## 즉시 적용 가능한 간단한 Fix

서버 코드를 수정하지 않고 클라이언트만 수정:

```typescript
// create.tsx 수정
router.replace(`/game/${roomId}`, undefined, { shallow: true });
// ↓
window.location.href = `/game/${roomId}`;
// 이렇게 하면 완전히 새로고침되면서 새로운 세션으로 처리됨
```

하지만 이것도 socket이 끊기는 문제는 동일하므로 **옵션 3**이 최선입니다.
