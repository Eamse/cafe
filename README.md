# ☕ 카페 앱

바닐라 HTML/CSS/JS로 만든 카페 주문 웹앱입니다. 빌드 도구 없이 정적 파일로 동작하며,
메뉴/카테고리/공지/이벤트/주문/회원 데이터는 [Supabase](https://supabase.com)(PostgreSQL + Auth)에
저장됩니다. 장바구니, 테마, 즐겨찾기, 최근 검색어처럼 기기별 개인 설정에 가까운 것들만
브라우저 `localStorage`에 남아있습니다.

## 실행 방법

```bash
npm install
npm start
```

`npm start`는 `serve`로 현재 폴더를 정적 서빙합니다 (기본 포트는 `package.json`의 `serve -l` 옵션 참고).
브라우저에서 `http://localhost:<포트>` 로 접속하면 됩니다.

Supabase 프로젝트 연결 정보는 `js/supabaseClient.js`에 있습니다.

## 테스트

```bash
npm test
```

`js/utils.js`의 순수 로직(장바구니, 즐겨찾기, 최근 검색어, 픽업 예상 시간 등)을
Node 내장 테스트 러너(`node --test`)로 검증합니다. `tests/setup.mjs`가 브라우저 `localStorage`를
메모리 기반으로 흉내 내어, DOM 없이도 저장소 함수를 그대로 테스트할 수 있게 해줍니다.
Supabase를 직접 호출하는 함수(`js/data.js`, `js/auth.js`)는 네트워크가 필요해서
단위 테스트 대상에서 제외했습니다.

## 폴더 구조

```
cafe-app
├── index.html / .css / .js          # 메인 페이지 (고객)
├── menus/                           # 메뉴 목록·상세 (고객)
├── basket/                          # 장바구니
├── orders/                          # 주문 내역·상세 (고객)
├── my/                              # 마이페이지 (주문 요약, 즐겨찾기, 배송지 관리)
├── events/                          # 이벤트 목록 (고객)
├── auth/                            # 손님 회원가입·로그인
├── admin/                           # 관리자
│   ├── index.html                   # 대시보드 (통계, 매출 그래프, 최근 주문)
│   ├── login.html                   # 관리자 로그인
│   ├── menus/                       # 메뉴 CRUD (목록/추가/수정/상세)
│   ├── categories/                  # 카테고리 관리
│   ├── notices/                     # 공지 관리
│   ├── events/                      # 이벤트 관리
│   ├── orders/                      # 주문 목록/상세, 상태 변경
│   └── stats/                       # 매출 통계 (날짜별 조회)
├── css/variables.css                # 전역 디자인 토큰
└── js/
    ├── supabaseClient.js            # Supabase 클라이언트 초기화
    ├── data.js                      # 메뉴/카테고리/공지/이벤트/주문 — Supabase 조회·저장
    ├── auth.js                      # 손님/관리자 로그인 — Supabase Auth
    ├── utils.js                     # 포맷·장바구니·즐겨찾기 등 순수 유틸(로컬 상태)
    └── cartPanel.js                 # 장바구니 담기 슬라이드 패널
```

## 주요 기능

**고객**
- 메뉴 검색/카테고리 필터/정렬/가격대 필터, 즐겨찾기, 최근 본 메뉴, 인기 메뉴 뱃지
- 장바구니 담기(같은 메뉴도 옵션 다르게 여러 번 담기) → 배달/매장수령 선택 → 주문 → 상태 확인 → 재주문
- 매장 수령 주문은 픽업 바코드 발급
- 회원가입/로그인(비회원 주문도 가능), 마이페이지(주문 요약, 배송지 관리)

**관리자**
- 대시보드(통계, 매출 그래프), 매출 통계(날짜별 조회)
- 메뉴 CRUD(이미지 미리보기 포함), 품절 토글, 카테고리 관리
- 공지/이벤트 관리, 주문 목록/상세 및 상태 변경

## 데이터 저장 위치

| 데이터 | 저장 위치 |
| --- | --- |
| 메뉴, 카테고리, 공지, 이벤트 | Supabase (`menus`, `categories`, `notices`, `events`, `featured_menus`) |
| 주문, 주문 항목 | Supabase (`orders`, `order_items`) — 로그인 고객은 본인 주문만, 비회원은 마지막 입력 연락처로 조회 |
| 회원/관리자 계정, 배송지 | Supabase Auth + `customers`, `admin_accounts`, `addresses` |
| 장바구니, 테마, 닉네임, 즐겨찾기, 최근 검색어/본 메뉴 | 브라우저 `localStorage` (기기별 개인 설정) |

## 참고

- 배포 시 이 저장소를 도메인 루트가 아닌 하위 경로에 올려도 동작하도록, 페이지 간 이동은
  전부 상대경로 또는 `js/utils.js`의 `appPath()` 헬퍼를 통해 계산합니다.
- 신규 데이터 접근 함수를 추가할 땐 `js/data.js`(Supabase) 또는 `js/utils.js`(로컬 상태) 중
  어디에 속하는지 구분해서 넣어주세요.
