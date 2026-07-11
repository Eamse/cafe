# ☕ 카페 앱

바닐라 HTML/CSS/JS로 만든 카페 주문 웹앱입니다. 빌드 도구 없이 정적 파일로 동작하며,
데이터는 브라우저 `localStorage`에 저장됩니다 (별도 백엔드 서버 없음).

## 실행 방법

```bash
npm install
npm start
```

`npm start`는 `serve`로 현재 폴더를 정적 서빙합니다 (기본 포트는 `package.json`의 `serve -l` 옵션 참고).
브라우저에서 `http://localhost:<포트>` 로 접속하면 됩니다.

## 테스트

```bash
npm test
```

`js/utils.js`, `js/data.js`의 순수 로직(장바구니, 주문, 즐겨찾기, 최근 검색어, 카테고리/메뉴/추천메뉴 저장소 등)을
Node 내장 테스트 러너(`node --test`)로 검증합니다. `tests/setup.mjs`가 브라우저 `localStorage`를
메모리 기반으로 흉내 내어, DOM 없이도 저장소 함수를 그대로 테스트할 수 있게 해줍니다.

## 폴더 구조

```
cafe-app
├── index.html / .css / .js          # 메인 페이지 (고객)
├── menus/                           # 메뉴 목록·상세 (고객)
├── basket/                          # 장바구니
├── orders/                          # 주문 내역·상세 (고객)
├── my/                              # 마이페이지
├── admin/                           # 관리자
│   ├── index.html                   # 대시보드
│   ├── menus/                       # 메뉴 CRUD (목록/추가/수정/상세)
│   ├── categories/                  # 카테고리 관리
│   └── orders/                      # 주문 목록/상세, 상태 변경
├── css/variables.css                # 전역 디자인 토큰
└── js/
    ├── data.js                      # 메뉴/카테고리 데이터 접근
    ├── utils.js                     # 포맷·장바구니·주문 공통 유틸
    └── cartPanel.js                 # 장바구니 담기 슬라이드 패널
```

## 주요 기능

**고객**
- 메뉴 검색/카테고리 필터/정렬/가격대 필터
- 즐겨찾기, 최근 본 메뉴, 인기 메뉴 뱃지(실제 주문 데이터 기반)
- 장바구니 담기 → 주문 → 주문 상태 확인 → 재주문
- 마이페이지(주문 요약)

**관리자**
- 대시보드(통계, 최근 주문)
- 메뉴 CRUD (이미지 미리보기 포함), 품절 토글
- 카테고리 추가/이름 변경/삭제 (사용 중인 카테고리는 삭제 방지)
- 주문 목록/상세, 주문 상태 변경

## 데이터 모델

`js/data.js`/`js/utils.js`가 관리하는 localStorage 키:

| 키 | 설명 |
| --- | --- |
| `cafe_admin_menus` | 메뉴 목록 (관리자 CRUD ↔ 고객 화면 공유) |
| `cafe_admin_categories` | 카테고리 목록 |
| `cafe_cart` | 장바구니 |
| `cafe_orders` | 주문 내역 |
| `cafe_favorites` | 즐겨찾기한 메뉴 id |
| `cafe_recently_viewed` | 최근 본 메뉴 id |

DB로 옮길 경우의 논리 설계는 `ERD.md`(Peter Chen), `erd.html`(다이어그램), `prisma/schema.prisma`(Prisma 스키마)를 참고하세요.

## 개발 참고

- 코로케이션 원칙과 구현 이력은 `bluprit.md` 참고
- 신규 데이터 접근 함수를 추가할 땐 `bluprit.md`의 "데이터 인터페이스(계약)" 표에도 함께 기록
