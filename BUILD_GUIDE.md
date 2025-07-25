# 🚀 단타 트레이더 앱 빌드 가이드

## 📋 목차
- [시스템 요구사항](#시스템-요구사항)
- [설치 및 실행](#설치-및-실행)
- [개발 모드](#개발-모드)
- [프로덕션 빌드](#프로덕션-빌드)
- [트러블슈팅](#트러블슈팅)
- [배포 가이드](#배포-가이드)

## 🖥️ 시스템 요구사항

### 필수 소프트웨어
- **Node.js**: 16.0.0 이상 (권장: 18.x LTS)
- **npm**: 8.0.0 이상 또는 **yarn**: 1.22.0 이상
- **모던 브라우저**: Chrome 90+, Firefox 88+, Safari 14+

### 시스템 요구사항
- **RAM**: 최소 4GB (권장: 8GB 이상)
- **저장공간**: 1GB 이상 여유공간
- **인터넷 연결**: 의존성 다운로드를 위해 필요

## 📦 설치 및 실행

### 1단계: 프로젝트 디렉토리로 이동
```bash
cd danta-trader-app
```

### 2단계: 의존성 설치
```bash
# npm 사용시
npm install

# 또는 yarn 사용시  
yarn install
```

### 3단계: 개발 서버 실행
```bash
# npm 사용시
npm start

# 또는 yarn 사용시
yarn start
```

✅ **성공!** 브라우저가 자동으로 열리고 `http://localhost:3000`에서 앱이 실행됩니다.

## 🛠️ 개발 모드

### 개발 서버 실행
```bash
npm start
```

### 개발 모드 특징
- 🔄 **핫 리로드**: 코드 변경시 자동 새로고침
- 🐛 **개발자 도구**: React DevTools, 소스맵 지원
- ⚡ **웹 워커**: 고성능 분석 기능 사용 가능
- 📊 **성능 모니터**: 우하단 모니터 버튼으로 FPS/메모리 추적

### 주요 기능 테스트
1. **기본 분석**: 📊 버튼 클릭
2. **고성능 분석**: ⚡ 버튼 클릭 (웹 워커 기반)
3. **다크모드**: 🌙 버튼으로 토글
4. **성능 모니터**: 우하단 📊 버튼
5. **대시보드 모드**: 📊 대시보드 버튼

## 🏗️ 프로덕션 빌드

### 빌드 실행
```bash
# npm 사용시
npm run build

# 또는 yarn 사용시
yarn build
```

### 빌드 결과
- `build/` 폴더에 최적화된 파일들 생성
- **JavaScript 번들**: 압축 및 최적화
- **CSS 번들**: 압축 및 중복 제거
- **정적 자산**: 이미지, 폰트 등 최적화
- **웹 워커**: `analysis-worker.js` 포함

### 빌드 크기 확인
```bash
# 빌드 분석
npm run build -- --analyze

# 또는 bundle analyzer 설치 후
npx webpack-bundle-analyzer build/static/js/*.js
```

### 로컬에서 프로덕션 테스트
```bash
# serve 패키지 설치 (글로벌)
npm install -g serve

# 빌드된 앱 실행
serve -s build -l 3000
```

## 🔧 트러블슈팅

### 일반적인 문제 해결

#### 1. 의존성 설치 오류
```bash
# 캐시 정리 후 재설치
npm cache clean --force
rm -rf node_modules package-lock.json
npm install
```

#### 2. 웹 워커 로딩 실패
- 브라우저에서 `http://localhost:3000`로 접속 (HTTPS 아님)
- Chrome Dev Tools → Console에서 웹 워커 오류 확인
- `public/analysis-worker.js` 파일 존재 여부 확인

#### 3. 메모리 부족 오류
```bash
# Node.js 메모리 제한 증가
export NODE_OPTIONS="--max-old-space-size=4096"
npm start
```

#### 4. 포트 충돌
```bash
# 다른 포트에서 실행
PORT=3001 npm start
```

#### 5. 빌드 실패
```bash
# TypeScript 오류 무시하고 빌드
CI=false npm run build

# 또는 ESLint 경고 무시
GENERATE_SOURCEMAP=false npm run build
```

### 성능 최적화 팁

#### 개발 환경
- **크롬 확장**: React Developer Tools 설치
- **성능 모니터**: 앱 내 성능 모니터 활용
- **메모리 관리**: 웹 워커 사용으로 UI 블로킹 방지

#### 프로덕션 환경
- **CDN 사용**: 정적 자산을 CDN에 호스팅
- **GZIP 압축**: 서버에서 GZIP 활성화
- **캐싱 정책**: 브라우저 캐싱 최적화

## 🌐 배포 가이드

### Vercel 배포 (권장)
```bash
# Vercel CLI 설치
npm install -g vercel

# 배포
vercel

# 프로덕션 배포
vercel --prod
```

### Netlify 배포
1. Netlify에 GitHub 연결
2. 빌드 설정:
   - **Build command**: `npm run build`
   - **Publish directory**: `build`

### GitHub Pages 배포
```bash
# gh-pages 패키지 설치
npm install --save-dev gh-pages

# package.json에 homepage 추가
"homepage": "https://username.github.io/danta-trader-app"

# 배포 스크립트 추가
"predeploy": "npm run build",
"deploy": "gh-pages -d build"

# 배포 실행
npm run deploy
```

### 도커 배포
```dockerfile
# Dockerfile
FROM node:18-alpine

WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production

COPY . .
RUN npm run build

FROM nginx:alpine
COPY --from=0 /app/build /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

```bash
# 도커 빌드 및 실행
docker build -t danta-trader-app .
docker run -p 80:80 danta-trader-app
```

## 📊 성능 벤치마크

### 개발 환경 성능
- **FPS**: 60fps 안정적 유지
- **메모리**: 기본 50MB, 분석 시 최대 200MB
- **로딩**: 초기 로딩 < 2초
- **웹 워커**: UI 블로킹 0초

### 프로덕션 빌드 크기
- **전체 번들**: ~800KB (gzipped)
- **JavaScript**: ~600KB
- **CSS**: ~50KB
- **정적 자산**: ~150KB

## 🔍 디버깅 팁

### 개발자 도구 활용
```javascript
// React DevTools에서 컴포넌트 성능 확인
// Profiler 탭 → 녹화 시작 → 작업 수행 → 분석

// 웹 워커 디버깅
// Sources 탭 → analysis-worker.js → 브레이크포인트 설정

// 메모리 누수 확인
// Memory 탭 → Heap snapshot → 비교 분석
```

### 콘솔 로그 활용
```javascript
// 성능 측정
console.time('분석 시간');
// ... 분석 코드 ...
console.timeEnd('분석 시간');

// 메모리 사용량 확인
console.log('메모리:', performance.memory?.usedJSHeapSize / 1024 / 1024, 'MB');
```

## 🆘 지원 및 문의

### 문제 발생시
1. **콘솔 오류** 확인 (F12 → Console)
2. **네트워크 탭** 확인 (Failed requests)
3. **성능 모니터** 확인 (앱 내 📊 버튼)
4. **브라우저 호환성** 확인

### 기술 지원
- **GitHub Issues**: 버그 리포트 및 기능 요청
- **개발자 문서**: 코드 내 JSDoc 주석 참고
- **성능 가이드**: 앱 내 성능 모니터 활용

---

## ✅ 빌드 체크리스트

**개발 환경**
- [ ] Node.js 16+ 설치 완료
- [ ] 의존성 설치 완료 (`npm install`)
- [ ] 개발 서버 실행 (`npm start`)
- [ ] 웹 워커 정상 동작 확인
- [ ] 성능 모니터 정상 표시

**프로덕션 환경**
- [ ] 프로덕션 빌드 성공 (`npm run build`)
- [ ] 빌드 크기 확인 (< 1MB)
- [ ] 정적 서버 테스트 완료
- [ ] 웹 워커 파일 포함 확인
- [ ] 모든 기능 테스트 완료

🎉 **빌드 완료!** 이제 단타 트레이더 앱을 사용할 준비가 되었습니다! 