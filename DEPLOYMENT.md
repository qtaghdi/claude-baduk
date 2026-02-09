# 🚀 배포 가이드

바둑 Online 게임을 프로덕션 환경에 배포하는 방법입니다.

---

## 📋 배포 전 체크리스트

- [ ] 프로젝트가 로컬에서 정상 작동
- [ ] `npm run build` 성공
- [ ] Git 저장소 생성 및 코드 푸시
- [ ] 배포 플랫폼 계정 생성

---

## 🎯 추천 배포 플랫폼

| 플랫폼 | Socket.io 지원 | 무료 티어 | 난이도 | 추천도 |
|--------|---------------|-----------|--------|--------|
| **Railway** | ✅ 완벽 | ✅ $5 무료 크레딧 | ⭐ 쉬움 | ⭐⭐⭐⭐⭐ |
| **Render** | ✅ 완벽 | ✅ 있음 | ⭐⭐ 보통 | ⭐⭐⭐⭐ |
| **Heroku** | ✅ 완벽 | ❌ 유료만 | ⭐⭐ 보통 | ⭐⭐⭐ |
| **Vercel** | ⚠️ 제한적 | ✅ 있음 | ⭐ 쉬움 | ⚠️ 비추천* |

> *Vercel은 Serverless 환경이라 Socket.io가 제대로 작동하지 않을 수 있습니다.

---

## 1️⃣ Railway 배포 (추천)

### 장점
- Socket.io 완벽 지원
- 자동 HTTPS
- GitHub 통합
- 매월 $5 무료 크레딧

### 배포 단계

#### A. GitHub 저장소 준비

```bash
# Git 초기화 (아직 안 했다면)
git init
git add .
git commit -m "Initial commit"

# GitHub에 푸시
git remote add origin https://github.com/yourusername/baduk-game.git
git branch -M main
git push -u origin main
```

#### B. Railway 배포

**방법 1: 웹 대시보드 (초보자 추천)**

1. [railway.app](https://railway.app) 접속
2. "Start a New Project" 클릭
3. "Deploy from GitHub repo" 선택
4. 저장소 선택 (baduk-game)
5. 자동으로 배포 시작!

**방법 2: CLI (개발자 추천)**

```bash
# Railway CLI 설치
npm install -g @railway/cli

# 로그인
railway login

# 프로젝트 초기화
railway init

# 배포
railway up
```

#### C. 환경 변수 설정

Railway 대시보드 → Variables 탭에서 추가:

```env
NODE_ENV=production
PORT=3000
```

#### D. 도메인 확인

Railway가 자동으로 도메인을 생성합니다:
- 예: `https://baduk-game-production.up.railway.app`

#### E. 클라이언트 환경 변수 업데이트

Railway 대시보드에서 다음 변수 추가:

```env
NEXT_PUBLIC_SOCKET_URL=https://your-app.railway.app
```

> **중요**: 도메인을 정확히 입력하세요! (https:// 포함)

#### F. 재배포

환경 변수 추가 후 자동으로 재배포됩니다.

---

## 2️⃣ Render 배포

### 장점
- 무료 티어 제공
- 자동 HTTPS
- 간단한 설정

### 배포 단계

#### A. GitHub 저장소 연결

1. [render.com](https://render.com) 접속 및 가입
2. Dashboard → New → Web Service
3. GitHub 저장소 연결

#### B. 서비스 설정

**General**:
- Name: `baduk-game`
- Region: 가까운 지역 선택 (Singapore/Tokyo for Asia)
- Branch: `main`

**Build & Deploy**:
```
Build Command: npm install && npm run build
Start Command: npm run start
```

**Environment**:
- Node Version: `18`

#### C. 환경 변수 추가

Environment 탭에서 추가:

```env
NODE_ENV=production
PORT=3000
NEXT_PUBLIC_SOCKET_URL=https://baduk-game.onrender.com
```

> **주의**: `NEXT_PUBLIC_SOCKET_URL`은 실제 Render URL로 교체하세요!

#### D. 배포

"Create Web Service" 클릭하면 자동 배포 시작!

---

## 3️⃣ Docker 배포 (고급)

### Dockerfile 생성

프로젝트 루트에 `Dockerfile` 생성:

```dockerfile
FROM node:18-alpine AS base

# Dependencies
FROM base AS deps
WORKDIR /app
COPY package*.json ./
RUN npm ci

# Builder
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN npm run build

# Production
FROM base AS runner
WORKDIR /app

ENV NODE_ENV=production

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

COPY --from=builder /app/public ./public
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./package.json
COPY --from=builder /app/server.ts ./server.ts
COPY --from=builder /app/src ./src

USER nextjs

EXPOSE 3000

CMD ["npm", "run", "start"]
```

### .dockerignore 생성

```
node_modules
.next
.git
.env.local
npm-debug.log
```

### 빌드 및 실행

```bash
# Docker 이미지 빌드
docker build -t baduk-game .

# 로컬에서 실행
docker run -p 3000:3000 \
  -e NODE_ENV=production \
  -e NEXT_PUBLIC_SOCKET_URL=http://localhost:3000 \
  baduk-game

# Docker Hub에 푸시
docker tag baduk-game yourusername/baduk-game:latest
docker push yourusername/baduk-game:latest
```

---

## 4️⃣ VPS 배포 (완전한 제어)

### 필요한 것
- Ubuntu/Debian 서버
- 도메인 (선택)
- SSL 인증서 (Let's Encrypt)

### 배포 단계

#### A. 서버 준비

```bash
# SSH 접속
ssh user@your-server-ip

# Node.js 설치
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# PM2 설치 (프로세스 관리자)
sudo npm install -g pm2
```

#### B. 프로젝트 업로드

```bash
# Git으로 클론
git clone https://github.com/yourusername/baduk-game.git
cd baduk-game

# 의존성 설치 및 빌드
npm install
npm run build
```

#### C. 환경 변수 설정

```bash
# .env.production 파일 생성
cat > .env.production << EOF
NODE_ENV=production
PORT=3000
NEXT_PUBLIC_SOCKET_URL=https://your-domain.com
EOF
```

#### D. PM2로 실행

```bash
# 앱 시작
pm2 start npm --name "baduk-game" -- run start

# 부팅 시 자동 시작
pm2 startup
pm2 save
```

#### E. Nginx 리버스 프록시 (선택)

```bash
sudo apt install nginx

# Nginx 설정
sudo nano /etc/nginx/sites-available/baduk-game
```

설정 파일 내용:
```nginx
server {
    listen 80;
    server_name your-domain.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }

    location /socket.io/ {
        proxy_pass http://localhost:3000/socket.io/;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host $host;
    }
}
```

```bash
# 설정 활성화
sudo ln -s /etc/nginx/sites-available/baduk-game /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

#### F. SSL 인증서 (Let's Encrypt)

```bash
sudo apt install certbot python3-certbot-nginx
sudo certbot --nginx -d your-domain.com
```

---

## 🔍 배포 후 확인사항

### 1. 서버 작동 확인
```bash
curl https://your-app-url.com
```

### 2. Socket.io 연결 확인
브라우저 콘솔(F12)에서:
```
WebSocket connection to 'wss://your-app-url.com/socket.io/' ...
```

### 3. 게임 테스트
1. 방 생성
2. 다른 브라우저/기기에서 참가
3. 실제 대국 테스트

---

## 🐛 배포 문제 해결

### Socket.io 연결 안 됨

**증상**: "Connecting to server..." 무한 로딩

**해결**:
1. `NEXT_PUBLIC_SOCKET_URL` 환경 변수 확인
2. HTTPS 사용 시 `wss://` 프로토콜 확인
3. CORS 설정 확인

### 빌드 실패

**증상**: 배포 중 빌드 에러

**해결**:
```bash
# 로컬에서 빌드 테스트
npm run build

# TypeScript 에러 확인
npx tsc --noEmit
```

### 메모리 부족

**증상**: 서버가 자주 재시작

**해결**:
- Railway/Render: 유료 플랜으로 업그레이드
- VPS: 서버 RAM 증설

---

## 📊 모니터링

### 로그 확인

**Railway**:
```
대시보드 → Deployments → View Logs
```

**Render**:
```
대시보드 → Logs 탭
```

**PM2 (VPS)**:
```bash
pm2 logs baduk-game
pm2 monit
```

---

## 🔄 업데이트 배포

### Railway/Render (자동)
```bash
git add .
git commit -m "Update: new features"
git push origin main
```
→ 자동으로 재배포됩니다!

### Docker
```bash
docker build -t baduk-game:v2 .
docker push yourusername/baduk-game:v2
```

### VPS
```bash
ssh user@your-server
cd baduk-game
git pull
npm install
npm run build
pm2 restart baduk-game
```

---

## 💰 비용 예상

| 플랫폼 | 무료 티어 | 유료 시작 가격 |
|--------|-----------|----------------|
| Railway | $5 크레딧/월 | $5/월~ |
| Render | 750시간/월 | $7/월~ |
| Heroku | ❌ | $5/월~ |
| VPS (DigitalOcean) | ❌ | $6/월~ |

---

## 🎉 배포 완료!

배포가 완료되면 친구들과 URL을 공유하고 즐기세요!

**예시 URL**:
- Railway: `https://baduk-game-production.up.railway.app`
- Render: `https://baduk-game.onrender.com`
- 커스텀 도메인: `https://baduk.yourdomain.com`

---

<div align="center">

**Happy Deploying! 🚀**

[← README로 돌아가기](README.md)

</div>
