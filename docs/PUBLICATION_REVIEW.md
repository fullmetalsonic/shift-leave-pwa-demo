# 공개 전 검증 기록

검증일: 2026-08-26 (Asia/Seoul)

## 공개 경계

- 운영 저장소를 복제·Fork하지 않고 빈 디렉터리에서 새로 작성했다.
- 운영 Git 이력, Supabase 연결, DB/RLS/RPC, Edge Function과 내부 문서를 포함하지 않았다.
- 사용자가 승인한 운영 앱 로그인 화면 URL만 서비스 접속 정보로 공개하고, 실제 로그인 이름·비밀번호·사용자 목록은 포함하지 않았다.
- 사이트 데이터는 실제 사람·일정과 무관한 합성 예시다.
- 실제 저장·인증·알림·복구 기능은 제공하지 않고 화면에서도 이를 명시한다.

## 자동 검증

| 검사 | 결과 | 증거 |
| --- | --- | --- |
| JavaScript 구문 | PASS | `node --check site/assets/app.js` |
| Production Build | PASS | Vite 다중 페이지 빌드, `index.html`, `guide.html`, CSS, JS 생성 |
| 데스크톱 | PASS | Chromium 4개 시나리오 |
| 모바일 | PASS | Pixel 7 4개 시나리오 |
| 접근성 | PASS | 6개 내부 보기와 상세 설명서 axe 위반 0 |
| 가로 넘침 | PASS | 데스크톱·모바일 주요 화면 0건 |
| 외부 네트워크 | PASS | 모든 시나리오 외부 요청 0건 |
| 의존성 보안 | PASS | 프로덕션 알려진 취약점 0건 |

### V1.1.0 입력 보강

- 휴가 빠른 단위 1일·반차·반반차와 0.5시간(30분) 단위 직접 입력을 추가했다.
- 근무 형태와 실제 시간을 분리해 지원 근무가 4시간으로 고정되지 않게 했다.
- 휴가·근무변경마다 비워 둘 수 있는 선택 메모 예시를 추가하고 월간·전체·공유 화면 비노출을 설명했다.
- 1.25시간은 저장 불가, 1.5시간·7.5시간은 저장 가능함을 데스크톱·Pixel 7 시험에서 확인했다.
- Vite Build, 데스크톱 4건, 모바일 4건, axe, 가로 넘침, 외부 요청 0건과 프로덕션 취약점 0건을 다시 확인했다.

## 육안 검토

- `docs/images/demo-desktop.png`: 최신 로컬 빌드의 1440px 화면을 확인했다.
- `docs/images/demo-mobile.png`: 최신 로컬 빌드의 Pixel 7 화면을 확인했다.
- 합성 데이터·외부 연결 없음·비저장 한계가 첫 화면에 표시된다.
- 4개 주 메뉴와 근무표/휴가·대근 내부 보기 전환이 명확하다.
- 월간 현황의 월~일, 주간조·야간조, 휴가/대근 이름표와 미충원이 PC·모바일에서 잘리거나 겹치지 않는다.
- 상단 메뉴, 목적 안내, 달력, 선택일 상세와 주요 버튼에 잘림·겹침이 없다.

## 게시 직전 재검사

- 비밀키·토큰·개인키 패턴
- 운영 Supabase project ref와 운영 앱 URL
- 운영 Supabase project ref, 실제 로그인 이름·비밀번호·사용자 목록
- 실제 이름·전화번호·로그인 정보·회사 일정
- `.env`, `node_modules`, `dist`, 시험 결과 폴더 제외
- 새 Git 저장소이며 운영 저장소 이력이 없는지 확인

## 게시 후 확인

게시일: 2026-08-26 (Asia/Seoul)

| 확인 | 결과 | 증거 |
| --- | --- | --- |
| 공개 저장소 | PASS | `fullmetalsonic/shift-leave-pwa-demo`, `PUBLIC` |
| 운영 저장소 분리 | PASS | 새 root commit으로 작성, 운영 Git 이력 없음 |
| 첫 공개 커밋 | PASS | `1cfac0942dbe07f58001c34cda4b355b8e94e0da` |
| GitHub Actions | PASS | [Verify and deploy demo #32951393448](https://github.com/fullmetalsonic/shift-leave-pwa-demo/actions/runs/32951393448) |
| 데모 Pages | PASS | [공개 데모](https://fullmetalsonic.github.io/shift-leave-pwa-demo/) HTTP 200 |
| 상세 설명서 Pages | PASS | [상세 사용설명서](https://fullmetalsonic.github.io/shift-leave-pwa-demo/guide.html) HTTP 200 |
| 제목 일치 | PASS | `교대근무 휴가·대근 공개 데모`, `상세 사용설명서 · 교대근무 데모` |

### V1.1.0 후속 게시 확인

| 확인 | 결과 | 증거 |
| --- | --- | --- |
| 기능 커밋 | PASS | `c45ce7a1100298f7ddd8a1a97e05b08c83d814fa` |
| GitHub Actions | PASS | [Verify and deploy demo #32961783520](https://github.com/fullmetalsonic/shift-leave-pwa-demo/actions/runs/32961783520) |
| Pages 실제 URL E2E | PASS | 데스크톱 4건·Pixel 7 4건, 총 8건 |
| 시간 입력 | PASS | 1.25시간 차단, 1.5·7.5시간 저장 예시 |
| 선택 메모 | PASS | 입력·빈 값 모두 허용, 월간·전체·공유 비노출 설명 |
| Release | PASS | [공개 데모 V1.1.0](https://github.com/fullmetalsonic/shift-leave-pwa-demo/releases/tag/demo-v1.1.0) |

공개 페이지 재검사는 PowerShell에서 다음과 같이 실행한다.

```powershell
$env:DEMO_BASE_URL = "https://fullmetalsonic.github.io/shift-leave-pwa-demo"
pnpm test
Remove-Item Env:DEMO_BASE_URL
```

## V1.2.0 공개 소개 허브 검증

- 첫 화면에서 `실제 앱 로그인`, `합성 데모 체험`, `상세 사용설명서`를 같은 수준의 명확한 선택지로 제공한다.
- 실제 앱은 관리자에게 받은 이름·비밀번호가 필요하고, 데모는 합성 데이터이며 저장되지 않는다는 차이를 첫 화면과 설명서에 항상 표시한다.
- 운영 앱 URL 공개는 사용자 승인 범위이며, 실제 계정·사용자 목록·운영 저장소·Supabase 구조·내부 복구 정보는 계속 제외한다.
- 로컬 Vite Build와 프로덕션 의존성 감사가 PASS했고 알려진 취약점은 0건이다.
- 데스크톱·Pixel 7 총 8개 브라우저 시험에서 소개 허브와 기존 6개 내부 보기의 axe 위반 0건, 가로 넘침 0건, 키보드 이동과 입력 회귀가 PASS했다.
- 1440px·Pixel 7 최신 화면 캡처를 `docs/images`에 갱신하고 육안으로 링크 우선순위, 3열/1열 재배치, 잘림·겹침을 확인했다.
- 운영 앱은 외부 비로그인 요청에서 HTTP 200과 자체 이름·비밀번호 로그인 화면을 반환한다.
- Pages 게시 후 운영 앱·데모·설명서·GitHub Issues 링크와 실제 HTTP 응답을 다시 확인한다.
