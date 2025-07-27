# Bridge(Ver.4.1-nano) - 한국어 버전

![Bridge(Ver.4.1-nano)](images/icons/icon-192x192.png)

스마트폰과 태블릿에 최적화된 일본어와 한국어 간의 실시간 음성 번역을 수행하는 프로그레시브 웹 애플리케이션(PWA)입니다. GPT-4.1-nano 모델을 활용한 고정밀 번역 기능을 제공합니다.

## 특징

- **GPT-4.1-nano 탑재**: 최신 OpenAI 언어 모델에 의한 고정밀 번역
- **모바일 퍼스트 디자인**: 스마트폰과 태블릿에 완전 대응
- **실시간 음성 번역**: 일본어에서 한국어, 한국어에서 일본어로의 즉시 번역
- **프로그레시브 웹 앱(PWA)**: 홈 화면에 추가하여 앱처럼 사용 가능
- **스트리밍 응답**: 말하면서 번역 결과가 실시간으로 표시
- **언어 선택 기능**: 입력 언어를 명시적으로 선택하여 인식 정확도 향상
- **조정 가능한 폰트 크기**: 모바일 디바이스에서의 가독성을 중시한 여러 폰트 크기
- **오프라인 기능**: PWA로 설치하면 통신 상황이 나쁠 때도 빠르게 접근 가능
- **터치 최적화 인터페이스**: 큰 버튼과 터치 조작에 적합한 컨트롤

## 데모

[라이브 데모 보기](https://aichirofunakoshi.github.io/Bridge-Korean-Version/)

## 사용 기술

- **Web Speech API**: 실시간 음성 처리를 위한 브라우저 네이티브 음성 인식
- **OpenAI API**: 고품질 번역을 위한 GPT-4.1-nano 모델 사용
- **Fetch Streaming**: 실시간 번역 출력을 위한 스트리밍 응답 구현
- **프로그레시브 웹 앱**: iOS와 Android 디바이스에 설치 대응
- **반응형 디자인**: 최적의 모바일 경험을 위한 CSS 미디어 쿼리

## 이용 시작

### 필요한 준비

- OpenAI API 키([여기서 취득](https://platform.openai.com/api-keys))
- 최신 모바일 브라우저(Chrome, Safari, Edge)

### 설치 방법

#### 모바일에서 PWA로 설치:

1. Safari(iOS) 또는 Chrome(Android)에서 앱 열기
2. iPhone/iPad: 공유 버튼 → "홈 화면에 추가"
3. Android: 메뉴 → "홈 화면에 추가" 또는 "앱 설치"

#### 개발용:

1. 이 리포지토리를 클론:
   ```bash
   git clone https://github.com/AichiroFunakoshi/Bridge-Korean-Version.git
   cd Bridge-Korean-Version
   ```

2. 로컬 HTTPS 서버 시작(마이크 접근에 필요):
   
   Python 사용:
   ```bash
   python3 -m http.server 8443 --ssl
   ```
   
   또는 VS Code의 Live Server with SSL

3. 모바일 브라우저에서 로컬 서버의 HTTPS URL 열기

4. 첫 사용 시 OpenAI API 키 입력

### 배포

이 애플리케이션은 다음 정적 호스팅 서비스에 배포할 수 있습니다:

- GitHub Pages
- Netlify
- Vercel
- Firebase Hosting
- AWS S3

다음 기능에 필요하므로 HTTPS 대응 호스팅을 사용하세요:
- 마이크 접근
- PWA 설치
- Service Worker 기능

## 사용법

1. "일본어 시작" 버튼을 탭하여 일본어 녹음 시작
2. "한국어 시작" 버튼을 탭하여 한국어 녹음 시작
3. 디바이스의 마이크에 향해 명확하게 말하기
4. "원문" 섹션에서 음성의 실시간 텍스트 변환 확인
5. "번역" 섹션에서 번역 결과가 표시됩니다
6. "중지" 버튼을 탭하여 녹음 종료
7. 폰트 크기 버튼(A-, A, A+, A++)으로 문자 크기 조정 가능

## 모바일 전용 기능

- **반응형 레이아웃**: 좁은 화면에서 버튼이 세로로 배열
- **터치 최적화 컨트롤**: 모바일 조작에 적합한 큰 탭 영역
- **세로 화면 모드**: 휴대전화의 세로 방향에 최적화
- **PWA 설치**: 풀스크린 경험을 위한 홈 화면 추가
- **모바일 키보드**: 모바일 키보드에 최적화된 입력 필드
- **제스처 지원**: 터치와 스와이프에 대응하는 인터페이스

## 브라우저 지원 상황

- **iOS Safari**: PWA 설치를 포함한 완전 지원
- **Chrome(Android)**: PWA 설치를 포함한 완전 지원
- **Edge(Android)**: PWA 설치를 포함한 완전 지원
- **Samsung Internet**: 완전 지원
- **Firefox Mobile**: 제한적 지원(Web Speech API 미지원)

## 알려진 제한사항

- API 이용에는 인터넷 연결이 필요
- 번역 품질은 명확한 발화와 좋은 마이크 입력에 의존
- 일본어-한국어 언어 쌍만 지원
- API 이용 요금은 사용량에 따라 발생

## 커스터마이징

모바일 경험을 커스터마이징하려면:

1. **외관**: `style.css`에서 CSS 스타일 수정
2. **터치 타깃**: 모바일 미디어 쿼리에서 버튼 크기 조정
3. **폰트 크기**: 사용 빈도에 따라 폰트 크기 클래스 수정
4. **PWA 설정**: `manifest.json`에서 앱의 메타데이터 업데이트

## 기여

프로젝트에 대한 기여를 환영합니다! 풀 리퀘스트는 언제든지 보내주세요.

1. 리포지토리 포크
2. 피처 브랜치 생성 (`git checkout -b feature/amazing-feature`)
3. 변경사항 커밋 (`git commit -m '멋진 기능 추가'`)
4. 브랜치에 푸시 (`git push origin feature/amazing-feature`)
5. 풀 리퀘스트 열기

## 라이선스

이 프로젝트는 MIT 라이선스 하에 라이선스됩니다. 자세한 내용은 LICENSE 파일을 참조하세요.

## 감사의 말

- 번역 API를 제공하는 OpenAI
- GPT-4.1-nano 모델 사용 허가
- 브라우저 기반 음성 인식을 가능하게 하는 Web Speech API
- 원본 실시간 음성 번역 앱 프로젝트 팀

## 문제 해결

### PWA 설치 문제:
- 사이트가 HTTPS 경유로 배포되고 있는지 확인
- manifest.json이 올바르게 링크되어 있는지 확인
- 필요한 PWA 기준을 충족하는지 확인

### 마이크 접근:
- 브라우저 설정에서 마이크 권한 허용
- HTTPS 경유로 접근하고 있는지 확인
- 권한이 거부된 경우 페이지 새로고침

### 음성 인식:
- 명확하게 천천히 말하기
- 주변 소음을 최소화
- 디바이스의 마이크 설정 확인

---

*주의: 이 애플리케이션은 사용 요금이 발생할 수 있는 API 서비스를 사용합니다. 광범위하게 사용하기 전에 OpenAI API의 요금 세부사항을 확인하세요.*

최신 업데이트 정보와 문서에 대해서는 [GitHub 리포지토리](https://github.com/AichiroFunakoshi/Bridge-Korean-Version)를 참조하세요.