# 공개 전 검증 기록

검증일: 2026-08-26 (Asia/Seoul)

## 공개 경계

- 운영 저장소를 복제·Fork하지 않고 빈 디렉터리에서 새로 작성했다.
- 운영 Git 이력, Supabase 연결, DB/RLS/RPC, Edge Function, 운영 URL과 내부 문서를 포함하지 않았다.
- 사이트 데이터는 실제 사람·일정과 무관한 합성 예시다.
- 실제 저장·인증·알림·복구 기능은 제공하지 않고 화면에서도 이를 명시한다.

## 자동 검증

| 검사 | 결과 | 증거 |
| --- | --- | --- |
| JavaScript 구문 | PASS | `node --check site/assets/app.js` |
| Production Build | PASS | Vite 다중 페이지 빌드, `index.html`, `guide.html`, CSS, JS 생성 |
| 데스크톱 | PASS | Chromium 4개 시나리오 |
| 모바일 | PASS | Pixel 7 4개 시나리오 |
| 접근성 | PASS | 5개 주요 화면과 상세 설명서 axe 위반 0 |
| 가로 넘침 | PASS | 데스크톱·모바일 주요 화면 0건 |
| 외부 네트워크 | PASS | 모든 시나리오 외부 요청 0건 |
| 의존성 보안 | PASS | 프로덕션 알려진 취약점 0건 |

## 육안 검토

- `docs/images/demo-desktop.png`: 최신 로컬 빌드의 1440px 화면을 확인했다.
- `docs/images/demo-mobile.png`: 최신 로컬 빌드의 Pixel 7 화면을 확인했다.
- 합성 데이터·외부 연결 없음·비저장 한계가 첫 화면에 표시된다.
- 상단 메뉴, 목적 안내, 달력, 선택일 상세와 주요 버튼에 잘림·겹침이 없다.

## 게시 직전 재검사

- 비밀키·토큰·개인키 패턴
- 운영 Supabase project ref와 운영 앱 URL
- 실제 이름·전화번호·로그인 정보·회사 일정
- `.env`, `node_modules`, `dist`, 시험 결과 폴더 제외
- 새 Git 저장소이며 운영 저장소 이력이 없는지 확인

## 게시 후 확인

- 저장소 `Public` 표시
- GitHub Actions 성공
- Pages 주소 HTTP 200
- 저장소와 Pages의 제목·설명·버전 일치
- 데모 페이지에서 외부 API 요청이 없는지 재확인
