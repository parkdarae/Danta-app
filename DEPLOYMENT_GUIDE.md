# 🚀 Danta Trader App 배포 가이드

이 가이드는 **Danta Trader App**을 GitHub와 Vercel을 통해 배포하는 방법을 설명합니다.

## 📋 사전 준비사항

### 필요한 계정
- [GitHub](https://github.com) 계정
- [Vercel](https://vercel.com) 계정
- [OpenAI](https://openai.com) 계정 (ChatGPT API 사용 시)

### 필요한 도구
- Git (설치되어 있지 않다면 [여기서 다운로드](https://git-scm.com/))
- Node.js (이미 설치됨)

---

## 🌟 1단계: GitHub 저장소 생성

### 1.1 GitHub에서 새 저장소 만들기

1. [GitHub](https://github.com)에 로그인
2. 우상단의 `+` 버튼 클릭 → `New repository` 선택
3. Repository 정보 입력:
   - **Repository name**: `danta-trader-app`
   - **Description**: `단타 매매를 위한 AI 기반 투자 도우미 앱`
   - **Public** 선택 (무료 배포를 위해)
   - ✅ **Add a README file** 체크
4. `Create repository` 클릭

### 1.2 로컬 프로젝트를 GitHub에 업로드

터미널에서 다음 명령어를 **순서대로** 실행하세요:

```bash
# 1. Git 초기화
git init

# 2. 모든 파일 추가
git add .

# 3. 첫 번째 커밋
git commit -m "Initial commit: Danta Trader App 🚀"

# 4. GitHub 저장소와 연결 (YOUR_USERNAME을 본인 계정명으로 변경)
git remote add origin https://github.com/YOUR_USERNAME/danta-trader-app.git

# 5. main 브랜치로 설정
git branch -M main

# 6. GitHub에 업로드
git push -u origin main
```

> ⚠️ **중요**: `YOUR_USERNAME`을 본인의 GitHub 사용자명으로 변경해주세요!

---

## 🎯 2단계: Vercel 배포

### 2.1 Vercel에 로그인

1. [Vercel](https://vercel.com)에 접속
2. `Continue with GitHub` 클릭하여 GitHub 계정으로 로그인

### 2.2 프로젝트 배포

1. Vercel 대시보드에서 `New Project` 클릭
2. `Import Git Repository` 섹션에서 `danta-trader-app` 선택
3. `Import` 클릭
4. 프로젝트 설정:
   - **Project Name**: `danta-trader-app`
   - **Framework Preset**: `Create React App` (자동 감지됨)
   - **Root Directory**: `.` (기본값)
   - **Build Command**: `npm run build` (기본값)
   - **Output Directory**: `build` (기본값)
5. `Deploy` 클릭

### 2.3 환경변수 설정 (선택사항)

ChatGPT 기능을 사용하려면:

1. 배포 완료 후 프로젝트 대시보드에서 `Settings` 탭 클릭
2. `Environment Variables` 섹션에서:
   - **Name**: `REACT_APP_OPENAI_API_KEY`
   - **Value**: OpenAI API 키 입력
   - `Add` 클릭
3. `Redeploy` 버튼 클릭하여 재배포

---

## 📱 3단계: 모바일 웹앱 설정

### 3.1 홈 화면에 추가 (iOS/Android)

배포된 앱에 접속한 후:

**iOS (Safari)**:
1. 공유 버튼 (📤) 탭
2. "홈 화면에 추가" 선택
3. 앱 이름 확인 후 "추가" 탭

**Android (Chrome)**:
1. 메뉴 버튼 (⋮) 탭
2. "홈 화면에 추가" 선택
3. "추가" 탭

### 3.2 PWA 기능

앱은 다음 PWA 기능을 지원합니다:
- 📱 홈 화면 설치
- 🔄 오프라인 캐싱
- 📊 로컬 데이터 저장
- 🌙 다크모드 지원

---

## 🔄 4단계: 업데이트 배포

코드를 수정한 후 업데이트하는 방법:

```bash
# 1. 변경사항 추가
git add .

# 2. 커밋 (메시지는 변경 내용에 맞게 수정)
git commit -m "feat: 새로운 기능 추가 ✨"

# 3. GitHub에 푸시
git push

# Vercel이 자동으로 새 버전을 배포합니다!
```

---

## 🛠️ 5단계: 문제 해결

### 자주 발생하는 문제들

**1. Git push 실패**
```bash
# 해결방법: GitHub 토큰 인증 설정
git config --global user.name "Your Name"
git config --global user.email "your.email@example.com"
```

**2. 빌드 실패**
```bash
# 해결방법: 의존성 재설치
rm -rf node_modules package-lock.json
npm install
```

**3. ChatGPT API 오류**
- OpenAI API 키가 올바른지 확인
- API 사용량 한도 확인
- 환경변수가 정확히 설정되었는지 확인

### 도움이 필요한 경우

**GitHub 이슈**: 버그나 기능 요청은 GitHub 저장소의 Issues 탭에서 작성
**Vercel 문서**: [https://vercel.com/docs](https://vercel.com/docs)

---

## 🎉 완료!

축하합니다! 이제 다음 주소에서 앱에 접속할 수 있습니다:

```
https://danta-trader-app.vercel.app
```

또는 Vercel에서 제공하는 고유 URL을 사용하세요.

### 📊 모니터링

- **Vercel Analytics**: 사용자 통계 확인
- **GitHub Actions**: 자동화된 빌드/테스트
- **Error Monitoring**: 런타임 오류 추적

---

## 💡 추가 기능

### 커스텀 도메인 연결

1. Vercel 프로젝트 설정에서 `Domains` 탭
2. 원하는 도메인 추가
3. DNS 설정 업데이트

### 백업 및 복원

```bash
# 프로젝트 백업
git clone https://github.com/YOUR_USERNAME/danta-trader-app.git

# 데이터 백업 (앱 내 백업 기능 사용)
```

---

**🎯 성공적인 배포를 위한 체크리스트**

- [ ] GitHub 저장소 생성
- [ ] 코드 업로드 완료
- [ ] Vercel 배포 성공
- [ ] 앱 정상 동작 확인
- [ ] 모바일에서 접속 테스트
- [ ] 홈 화면에 추가 테스트
- [ ] 환경변수 설정 (필요시)

**🚀 이제 전 세계 어디서나 당신의 투자 도우미를 사용할 수 있습니다!** 