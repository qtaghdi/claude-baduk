# 🎮 바둑 (Baduk) Online

실시간 멀티플레이어 바둑(Go) 게임 웹 애플리케이션

<div align="center">

![Next.js](https://img.shields.io/badge/Next.js-16-black?style=flat-square&logo=next.js)
![React](https://img.shields.io/badge/React-19-blue?style=flat-square&logo=react)
![TypeScript](https://img.shields.io/badge/TypeScript-5.9-blue?style=flat-square&logo=typescript)
![Socket.io](https://img.shields.io/badge/Socket.io-4.8-green?style=flat-square&logo=socket.io)

</div>

---

## 📋 목차

- [소개](#-소개)
- [주요 기능](#-주요-기능)
- [기술 스택](#-기술-스택)
- [시작하기](#-시작하기)
- [사용 방법](#-사용-방법)
- [게임 규칙](#-게임-규칙)
- [프로젝트 구조](#-프로젝트-구조)
- [배포하기](#-배포하기)
- [문제 해결](#-문제-해결)

---

## 🎯 소개

바둑 Online은 친구와 실시간으로 바둑을 즐길 수 있는 웹 기반 게임입니다. 방 코드만 공유하면 어디서든 함께 바둑을 둘 수 있습니다.

### 특징
- 🚀 **간편한 접속**: 회원가입 없이 방 코드만으로 즉시 플레이
- ⚡ **실시간 대전**: Socket.io를 통한 끊김 없는 실시간 게임
- 🎨 **직관적인 UI**: Canvas 기반의 아름다운 바둑판 렌더링
- 📱 **반응형 디자인**: 데스크톱과 태블릿 모두 지원
- 🛡️ **견고한 구조**: TypeScript와 체계적인 아키텍처

---

## ✨ 주요 기능

### 게임 기능
- ✅ 19×19 표준 바둑판
- ✅ 완전한 바둑 규칙 구현 (포석, 자살수 방지, 패 규칙)
- ✅ 실시간 멀티플레이어 (1:1)
- ✅ 호버 시 돌 미리보기
- ✅ 마지막 착수 위치 표시
- ✅ 패스 및 기권 기능

### 기술 기능
- 🏗️ 관심사 분리 아키텍처
- 🔒 완전한 타입 안전성 (TypeScript)
- ⚡ 성능 최적화 (React.memo, useCallback)
- 🐛 에러 바운더리
- 📊 구조화된 로깅 시스템

---

## 🛠 기술 스택

- **Frontend**: Next.js 16, React 19, TypeScript 5.9
- **Styling**: Tailwind CSS 3.4
- **Real-time**: Socket.io 4.8
- **Rendering**: HTML5 Canvas API

---

## 🚀 시작하기

### 필수 요구사항

- Node.js 18.0 이상
- npm 9.0 이상

### 설치 방법

```bash
# 1. 프로젝트 클론 (또는 다운로드)
git clone <repository-url>
cd baduk-game

# 2. 의존성 설치
npm install

# 3. 개발 서버 실행
npm run dev
```

서버가 시작되면 브라우저에서 **http://localhost:3000** 으로 접속하세요! 🎉

---

## 🎮 사용 방법

### 로컬에서 혼자 테스트하기

#### **방법 1: 브라우저 탭 2개 사용**

1. **첫 번째 탭** - 방 생성
   ```
   1) http://localhost:3000 접속
   2) "Create New Game" 버튼 클릭
   3) 화면에 표시된 6자리 방 코드 복사 (예: ABC123)
   ```

2. **두 번째 탭** - 방 참가 (시크릿 모드 권장)
   ```
   1) http://localhost:3000 접속
   2) 복사한 방 코드 입력
   3) "Join Game" 버튼 클릭
   ```

3. **게임 시작!**
   - 두 창을 나란히 배치하면 편리합니다
   - 흑돌(Black)이 먼저 시작합니다

### 친구와 함께하기

#### 같은 WiFi 네트워크에서
1. 호스트가 게임 생성 후 방 코드 공유
2. 친구가 같은 URL(http://localhost:3000)로 접속
3. 방 코드 입력 후 게임 시작

#### 인터넷을 통해 (배포 후)
1. 배포된 URL 공유 (예: https://your-app.railway.app)
2. 호스트가 방 생성 후 방 코드 공유
3. 친구가 URL 접속 → 방 코드 입력 → 게임 시작

---

## 📖 게임 규칙

### 기본 규칙
1. **교대 착수**: 흑돌과 백돌이 번갈아가며 교차점에 돌을 놓습니다
2. **포석**: 상대방 돌의 활로(빈 교차점)를 모두 막으면 제거합니다
3. **자살수 금지**: 놓는 즉시 자신의 돌이 잡히는 수는 금지
4. **패(Ko) 규칙**: 바로 직전 상태로 되돌리는 수는 금지
5. **게임 종료**: 양 플레이어가 연속으로 패스하면 종료

### 조작 방법

| 동작 | 방법 |
|------|------|
| **착수** | 바둑판의 교차점 클릭 |
| **돌 미리보기** | 마우스를 교차점에 올리기 |
| **패스** | 우측 "Pass" 버튼 클릭 |
| **기권** | 우측 "Resign" 버튼 클릭 |
| **방 코드 복사** | 상단 "Copy" 버튼 클릭 |

---

## 📁 프로젝트 구조

```
baduk-game/
├── src/
│   ├── components/          # React 컴포넌트
│   │   ├── Board.tsx        # Canvas 바둑판
│   │   ├── GameInfo.tsx     # 게임 정보
│   │   ├── Controls.tsx     # 컨트롤 (패스/기권)
│   │   └── ErrorBoundary.tsx
│   ├── constants/           # 상수 정의
│   ├── hooks/               # 커스텀 훅
│   │   └── useGameSocket.ts
│   ├── lib/                 # 핵심 라이브러리
│   │   ├── GameRoomManager.ts
│   │   ├── SocketEventHandler.ts
│   │   └── logger.ts
│   ├── pages/               # Next.js 페이지
│   ├── types/               # TypeScript 타입
│   └── utils/               # 유틸리티
│       └── gameLogic.ts     # 바둑 로직
├── server.ts                # Socket.io 서버
└── package.json
```

---

## 🚢 배포하기

### Railway로 배포 (추천)

Railway는 Socket.io를 완벽하게 지원합니다.

```bash
# 1. Railway CLI 설치
npm install -g @railway/cli

# 2. 로그인
railway login

# 3. 프로젝트 초기화
railway init

# 4. 배포
railway up
```

환경 변수 설정 (Railway 대시보드):
```
NODE_ENV=production
PORT=3000
NEXT_PUBLIC_SOCKET_URL=https://your-app.railway.app
```

### Render로 배포

1. [render.com](https://render.com) 가입
2. New → Web Service
3. GitHub 저장소 연결
4. 설정:
   - Build Command: `npm install && npm run build`
   - Start Command: `npm run start`
   - Environment Variables:
     ```
     NODE_ENV=production
     NEXT_PUBLIC_SOCKET_URL=https://your-app.onrender.com
     ```

---

## 🐛 문제 해결

### 서버가 시작되지 않아요

```bash
# 캐시 삭제 후 재설치
rm -rf node_modules package-lock.json .next
npm install
npm run dev
```

### 500 에러가 나요

```bash
# TypeScript 컴파일 체크
npx tsc --noEmit

# 서버 재시작
npm run dev
```

### Socket 연결이 안 돼요

1. `.env.local` 파일의 `NEXT_PUBLIC_SOCKET_URL` 확인
2. 브라우저 콘솔(F12)에서 에러 메시지 확인
3. 포트 3000이 사용 중인지 확인:
   ```bash
   lsof -ti:3000  # macOS/Linux
   ```

### 방 코드를 입력해도 접속이 안 돼요

- 방 코드를 정확히 입력했는지 확인 (대소문자 무관)
- 호스트가 먼저 나가면 방이 삭제됨
- 서버 재시작 시 모든 방 정보가 초기화됨

---

## 📚 개발 스크립트

```bash
# 개발 서버 실행
npm run dev

# 프로덕션 빌드
npm run build

# 프로덕션 서버 실행
npm run start
```

---

## 📄 라이선스

ISC License

---

<div align="center">

**즐거운 바둑 대국 되세요! 🎮**

Made with ❤️ using Next.js, React, and Socket.io

</div>
