# ☕ 카페 앱 - 프로젝트 청사진

## 📁 폴더 구조 (완전 코로케이션)

```1
cafe-app
│
├── index.html                        # 메인 (고객)
├── index.css                         # 메인 페이지 스타일
└── index.js                          # 메인 페이지 로직
│
├── 👤 고객 - 메뉴
│   └── menus/
│       ├── list.html                 # 메뉴 목록
│       ├── list.css
│       ├── list.js
│       ├── detail.html               # 메뉴 상세
│       ├── detail.css
│       └── detail.js
│
├── 👤 고객 - 마이페이지
│   └── my/
│       ├── index.html                # 마이페이지 메인
│       ├── index.css
│       └── index.js
│
├── 👤 고객 - 장바구니
│   └── basket/
│       ├── list.html                 # 장바구니
│       ├── list.css
│       └── list.js
│
├── 👤 고객 - 주문 내역
│   └── orders/
│       ├── list.html                 # 주문 내역 목록
│       ├── list.css
│       ├── list.js
│       ├── detail.html               # 주문 상세
│       ├── detail.css
│       └── detail.js
│
├── 🔴 관리자/사장
│   └── admin/
│       ├── index.html                # 대시보드
│       ├── index.css
│       ├── index.js
│       │
│       ├── menus/
│       │   ├── list.html             # 메뉴 목록
│       │   ├── list.css
│       │   ├── list.js
│       │   ├── detail.html           # 메뉴 상세
│       │   ├── detail.css
│       │   ├── detail.js
│       │   ├── create.html           # 메뉴 추가
│       │   ├── create.css
│       │   ├── create.js
│       │   ├── edit.html             # 메뉴 수정
│       │   ├── edit.css
│       │   └── edit.js
│       │
│       └── orders/
│           ├── list.html             # 주문 목록
│           ├── list.css
│           ├── list.js
│           ├── detail.html           # 주문 상세
│           ├── detail.css
│           └── detail.js
│
├── 📦 공유 자원
│   ├── css/
│   │   └── variables.css             # CSS 변수 (전역)
│   └── js/
│       ├── data.js                   # 메뉴/카테고리 데이터
│       └── utils.js                  # 공통 유틸리티
```

## 👥 역할별 기능

| 역할            | 경로                                           | 주요 기능                                        |
| --------------- | ---------------------------------------------- | ------------------------------------------------ |
| **고객**        | `/`, `/menus/`, `/my/`, `/basket/`, `/orders/` | 메인, 메뉴 조회, 마이페이지, 장바구니, 주문 내역 |
| **관리자/사장** | `/admin/`, `/admin/menus/`, `/admin/orders/`   | 대시보드, 메뉴 CRUD, 주문 관리                   |

## 🎨 디자인

- **테마**: 라이트 + 따뜻한 브라운/크림 톤
- **분위기**: 미니멀 + 모던
- **카드 스타일**: Solid 카드 (배경 `--color-surface` + `--shadow-md`). ~~Glass morphism~~은 2026-07-07에 걷어냄 — 반투명/블러 대신 또렷한 대비로 정돈된 느낌을 우선함
- **카테고리 포인트 컬러**: 메뉴 카드는 `cat-${categoryId}` 클래스로 카테고리별 강조색(왼쪽 보더 + 라벨 색)을 가짐. 커피/티/에이드/디저트마다 다른 색이라 사진 없이도 카드가 다 똑같아 보이지 않음
- **레이아웃**: 반응형 (모바일/데스크톱)

## 📐 코로케이션 원칙

- **HTML과 동일한 디렉토리에 css, js 파일을 평탄하게 배치** (별도 하위 폴더 없음)
- **파일명은 HTML 파일명과 동일하게 매칭** (`index.html` → `index.css`, `index.js`)
- 전역 공통 자원만 `/css/`, `/js/` 폴더에 분리
- 역할별 독립 폴더로 관심사를 분리

---

## ✅ 구현 TODO

### 1단계: 공유 자원

- [x] `css/variables.css` — 전역 CSS 변수, 리셋
- [x] `js/data.js` — 메뉴/카테고리 데이터
- [x] `js/utils.js` — 공통 유틸리티 (카트, 포맷 등)

### 2단계: 관리자 - 메뉴 관리 시스템

- [x] `admin/menus/list.html` — 메뉴 목록
- [x] `admin/menus/list.css`
- [x] `admin/menus/list.js`
- [x] `admin/menus/detail.html` — 메뉴 상세
- [x] `admin/menus/detail.css`
- [x] `admin/menus/detail.js`
- [x] `admin/menus/create.html` — 메뉴 추가
- [x] `admin/menus/create.css`
- [x] `admin/menus/create.js`
- [x] `admin/menus/edit.html` — 메뉴 수정
- [x] `admin/menus/edit.css`
- [x] `admin/menus/edit.js`

### 3단계: 고객 - 메뉴 조회 시스템

- [x] `menus/list.html` — 메뉴 목록
- [x] `menus/list.css`
- [x] `menus/list.js`
- [x] `menus/detail.html` — 메뉴 상세
- [x] `menus/detail.css`
- [x] `menus/detail.js`

> **개선 (2026-07-07)**: 메뉴 목록/홈 카드에 품절(`isSoldOut`) 뱃지가 전혀 안 보여서 클릭해서 상세로 들어가야만 품절 여부를 알 수 있던 문제 수정 — `index.js`/`menus/list.js` 카드에 "품절" 뱃지 추가. 또한 두 페이지 다 전체 메뉴를 필터 없이 쭉 나열만 하던 것을, `admin/menus/list.js`와 동일한 패턴의 카테고리 탭(`category-tabs`)으로 필터링 가능하게 함.

### 4단계: 고객 - 장바구니 관리 시스템

- [x] `basket/list.html` — 장바구니
- [x] `basket/list.css`
- [x] `basket/list.js`

> **버그 수정 (2026-07-07)**: 고객이 장바구니에 담을 방법 자체가 없던 문제 발견. `js/utils.js`의 `addToCart()`는 정의만 있고 어디서도 호출되지 않아 `basket`이 항상 비어있었음. `menus/detail.html/js`에 수량 선택(+/-)과 "장바구니 담기" 버튼을 추가해 `addToCart(menuId, quantity)`를 연결. 품절(`isSoldOut`) 메뉴는 버튼 대신 "품절된 메뉴입니다" 뱃지로 대체.

> **버그 수정 (2026-07-07, 2차)**: 같은 이유로 `updateCartQuantity()`도 정의만 있고 UI에서 호출되지 않아, 장바구니에 담은 뒤 수량을 바꾸려면 삭제 후 다시 담아야 했음. `basket/list.js`에 항목별 +/- 버튼을 추가해 `updateCartQuantity(menuId, quantity)`를 연결 (0 이하로 내리면 항목 자동 제거, 기존 함수 동작 그대로 재사용).

### 5단계: 고객 - 주문 관리 시스템

- [x] `orders/list.html` — 주문 내역 목록
- [x] `orders/list.css`
- [x] `orders/list.js`
- [x] `orders/detail.html` — 주문 상세
- [x] `orders/detail.css`
- [x] `orders/detail.js`

> **개선 (2026-07-07)**: 주문 상태 변경을 관리자만 할 수 있어서, 고객이 잘못 주문해도 취소할 방법이 없던 문제 보완 — `orders/detail.html`에서 주문 상태가 `주문완료`일 때만 "주문 취소" 버튼 노출(`updateOrderStatus(orderId, "취소")` 재사용, 관리자 쪽과 동일 함수). 또한 `orders/list.html`/`orders/detail.html` 양쪽에 "다시 담기" 버튼을 추가해 그 주문의 메뉴들을 한번에 장바구니로 재추가 가능(주문 당시 메뉴가 삭제된 경우엔 버튼 자체를 숨김). `orders/list.js`의 카드는 `<a>` 하나로 감싸던 구조를 `<div class="order-card">` + `display:contents`인 내부 `<a class="order-card-link">` + 별도 `<button class="btn-reorder">`로 바꿔서, 버튼과 상세이동 링크가 서로 안 겹치게 함.

### 6단계: 고객 - 메인 페이지

- [x] `index.html` — 헤더(스티키, 장바구니 뱃지) + 히어로(배경 사진) + 차별점(USP) 3종 + 오늘의 추천 + 검색/정렬 + 카테고리 탭 + 전체 메뉴 그리드(실사 이미지) + 매장 안내 + 푸터로 재구성
- [x] `index.css`
- [x] `index.js`

> **재설계 완료 (2026-07-07)**: "메뉴 보러가기" 이동 버튼을 없애고, 헤더/히어로 아래에 `getMenus()`(`js/data.js`)로 렌더링한 전체 메뉴 그리드를 바로 노출. 각 메뉴는 `menus/detail.html?id=`로 연결.

> **버그 발견/수정 (2026-07-07)**: 홈을 포함한 고객용 페이지 전체에 장바구니·주문내역·마이페이지로 가는 링크가 **하나도 없어서**, 메뉴 상세에서 장바구니에 담아도 그 장바구니 화면 자체에 도달할 방법이 URL 직접 입력밖에 없던 문제 발견. ~~고객용 7개 페이지 헤더에 공통 `<nav class="main-nav">`(홈/메뉴/장바구니/주문내역/마이페이지)를 추가~~ → 아래 "팀원 디자인 병합" 항목에서 팀원의 더 단순한 nav(마이페이지/장바구니)로 대체됨.

> ~~**개선 (2026-07-07)**: `index.html`/`menus/list.html`에 정렬 옵션(`#sort-select`) 추가~~ — 아래 "팀원 디자인 병합" 때 충돌 해결하면서 제거됨(팀원 버전에는 없는 기능).

> ~~**신규 기능 (2026-07-07) — 문의하기 챗봇**: 홈 화면에 규칙 기반 FAQ 챗봇(`#inquiry-fab`)~~ — 아래 "팀원 디자인 병합" 때 `index.html`을 팀원 버전으로 교체하면서 제거됨. 되살리려면 `js/utils.js`의 `escapeHtml`/`renderCartBadge`처럼 다시 구현 필요.

> **팀원 디자인 병합 (2026-07-07, PR #19 `feature/homepage-redesign`)**: 팀원이 홈 화면을 히어로 배경사진 + "오늘의 추천" + 카테고리 탭 + 실사 이미지 메뉴 그리드 + 매장 안내 + 푸터로 재설계하고, 메뉴 카드를 클릭하면 페이지 이동 없이 우측에서 슬라이드로 열리는 **장바구니 담기 패널**(`js/cartPanel.js`, `css/cart-panel.css`, `openCartPanel()`)을 새로 추가함. `index.css/html/js`, `menus/detail.html/js`, `menus/list.js`가 충돌해서 **팀원 버전으로 맞춤** — 그 결과 위 두 항목(정렬 옵션, 문의 챗봇)과 5개짜리 nav는 없어짐.
>
> 병합 직후 팀원 코드 자체의 버그 2건 발견/수정: `menus/detail.html` 헤더 홈 링크가 `href="inede.html"`(오타, 존재하지 않는 파일)로 깨져있던 것을 `../index.html`로 수정, `menus/list.html`에 연결된 JS 없이 죽어있던 정렬 `<select>` 제거.
>
> 이어서 **네비게이션을 사이트 전체에 통일**함 — 팀원이 만든 홈 화면의 nav(마이페이지 / 장바구니+뱃지, 워드마크 클릭 시 홈으로)를 `menus/detail.html`(기존엔 nav 자체가 없었음), `basket/list.html`, `orders/list.html`, `orders/detail.html`, `my/index.html`(자기 자신 링크는 제외)에도 동일하게 적용. `js/utils.js`의 `renderCartBadge()`도 팀원 방식(`hidden` 속성 토글)으로 통일해서, `cart:updated` 이벤트나 페이지 로드 시 어느 페이지에서든 같은 방식으로 뱃지가 갱신됨. 주문내역 링크는 헤더에서 빠졌지만 마이페이지의 "전체보기 →"로 계속 접근 가능.

> **팀 역할 분담 (2026-07-07)**: 정식 협업 시작 — **사용자가 메인 페이지(`index.html`/`index.css`/`index.js`) 담당, 팀원은 마이페이지(`my/`) 담당.** 이후 메인 페이지 관련 변경은 이 담당 구조 하에 진행됨.

> **개선 (2026-07-07, 실제 카페 웹 리서치 기반) — 메인 페이지 4종 추가**: (1) **메뉴 검색**(`#menu-search`) — 이름 기준 실시간 필터링, 카테고리 탭·정렬과 함께 조합 적용됨. (2) **모바일 스티키 헤더** — `.home-header`에 `position: sticky`, 스크롤해도 장바구니 링크가 항상 보임. (3) **차별점(USP) 섹션**(`.home-usp`, 히어로 바로 아래) — "매일 로스팅 / 빠른 픽업 / 간편한 주문" 3개 항목. (4) **정렬 옵션 재도입**(`#sort-select`: 기본순/가격 낮은순/가격 높은순/이름순) — 팀원 디자인 병합 때 없어졌던 기능을 메인 페이지가 사용자 담당이 된 뒤 다시 추가함(이번엔 `index.html`에만 적용, `menus/list.html`은 팀원 영역이라 손대지 않음).

> **버그 발견/수정 (2026-07-07)**: 위 4종 점검 중 홈 화면 전체 메뉴 카드에 품절(`isSoldOut`) 표시가 아예 없는 걸 발견 — 팀원 디자인 병합 때 없어진 기능(3단계 개선 항목 참고)이 `index.js`에는 복구가 안 됐던 것. `menuCardHtml()`에 `sold-out-tag` 뱃지 + `is-soldout` 클래스(카드 반투명 처리)를 다시 추가해서 고침. "오늘의 추천"(`renderFeatured`)은 애초에 품절 메뉴를 후보에서 제외하고 뽑아서 영향 없음.

### 7단계: 고객 - 마이페이지

- [x] `my/index.html`
- [x] `my/index.css`
- [x] `my/index.js`

### 8단계: 관리자 - 대시보드 & 주문 관리

- [x] `admin/index.html` — 대시보드
- [x] `admin/index.css`
- [x] `admin/index.js`
- [x] `admin/orders/list.html` — 주문 목록
- [x] `admin/orders/list.css`
- [x] `admin/orders/list.js`
- [x] `admin/orders/detail.html` — 주문 상세
- [x] `admin/orders/detail.css`
- [x] `admin/orders/detail.js`

---

## 🔒 데이터 인터페이스 (계약)

> 여기 적힌 이름/형태는 전체 코드(1~8단계)가 실제로 쓰고 있는 것이므로 **임의로 바꾸지 말고 그대로 재사용**할 것. 새 이름이 필요하면 추가만 하고, 여기에도 같이 적을 것.

### `js/data.js` (export)

| 이름 | 형태 | 설명 |
| --- | --- | --- |
| `categories` | `{ id: string, name: string }[]` | 카테고리 목록 |
| `menus` | `{ id: number, categoryId: string, name: string, price: number, description: string, image: string, isSoldOut: boolean }[]` | **시드(초기값)만**. 실제 조회/저장은 아래 `getMenus`/`saveMenus` 사용 |
| `getMenus()` | → menu 배열 | **메뉴 단일 소스.** `cafe_admin_menus`를 읽고, 없으면 `menus`로 시드. 관리자/고객/장바구니 전부 이 함수로 메뉴를 읽음 |
| `saveMenus(list)` | 저장 | `admin/menus/*`의 CRUD가 이걸로 저장 |
| `getCategoryById(categoryId)` | → category 객체 \| null | |
| `getMenuById(menuId)` | → menu 객체 \| null | 내부적으로 `getMenus()` 사용 |
| `getMenusByCategory(categoryId)` | → menu 배열 | `"all"` 또는 미지정 시 전체 반환. 내부적으로 `getMenus()` 사용 |

### `js/utils.js` (export)

| 이름 | 형태 | 설명 |
| --- | --- | --- |
| `formatPrice(price)` | → `"4,500원"` | |
| `formatDate(date)` | → `"2026.07.06 12:16"` | |
| `escapeHtml(str)` | → HTML 이스케이프된 문자열 | **관리자가 입력한 메뉴명/설명, 주문 항목명처럼 사용자 입력이 `innerHTML`에 들어가는 모든 곳에서 반드시 거쳐야 함** (XSS 방지, 2026-07-07 추가) |
| `generateId(prefix)` | → `"prefix-..."` | |
| `qs(selector, scope?)` / `qsa(selector, scope?)` | DOM 헬퍼 | |
| `getCart()` / `saveCart(items)` | 카트 전체 읽기/쓰기 | |
| `addToCart(menuId, quantity?)` | 담기 | |
| `updateCartQuantity(menuId, quantity)` | 수량 변경 (0 이하면 제거) | |
| `removeFromCart(menuId)` | 제거 | |
| `clearCart()` | 전체 비우기 | |
| `renderCartBadge()` | `#cart-badge` 엘리먼트를 찾아 담긴 수량으로 갱신 | 고객용 페이지가 공통으로 쓰는 헤더 nav의 장바구니 뱃지용 (2026-07-07 추가). 카트가 바뀌는 지점(담기/수량변경/체크아웃)과 각 페이지 로드 시 호출 |
| `ORDER_STATUSES` | `["주문완료", "조리중", "수령완료", "취소"]` | 주문 상태 값 전체 목록 |
| `getOrders()` / `saveOrders(orders)` | 주문 전체 읽기/쓰기 | **주문 단일 소스.** `basket`, `orders/*`, `my/*`, `admin/orders/*` 전부 이 함수로 주문을 읽고 씀 |
| `getOrderById(orderId)` | → order 객체 \| null | |
| `updateOrderStatus(orderId, status)` | 상태 변경 | `admin/orders/*`가 사용 |

### localStorage 키

> 아래 키는 직접 `localStorage.getItem/setItem`으로 만지지 말고, 반드시 위 `getMenus`/`saveMenus`, `getOrders`/`saveOrders` 함수를 통해서만 접근할 것.

| 키 | 형태 | 비고 |
| --- | --- | --- |
| `cafe_cart` | `{ menuId: number, quantity: number }[]` | `js/utils.js`의 카트 함수가 관리 |
| `cafe_orders` | `{ id: number, createdAt: string(ISO), items: { menuId, name, price, quantity }[], total: number, status: string }[]` | `js/utils.js`의 주문 함수가 관리. `status`는 `ORDER_STATUSES` 중 하나 |
| `cafe_admin_menus` | `menus`와 동일한 형태 | `js/data.js`의 `getMenus`/`saveMenus`가 관리. 관리자 CRUD와 고객 메뉴 조회가 동일한 키를 공유(8단계에서 통합 완료) |

### 보안/검증 노트

- **XSS 수정 (2026-07-07)**: 관리자가 메뉴명/설명에 `<img src=x onerror=...>` 같은 스크립트를 넣으면 이스케이프 없이 그대로 `innerHTML`에 렌더링되어 실제로 스크립트가 실행되는 문제 발견. 메뉴명·설명·주문 항목명을 렌더링하는 모든 곳(`index.js`, `menus/*`, `admin/menus/*`, `basket/list.js`, `orders/*`, `admin/orders/*`, `my/index.js`)에서 `escapeHtml()`을 거치도록 수정. **앞으로 사용자 입력 문자열을 새로 `innerHTML`에 넣을 땐 반드시 `escapeHtml()`로 감쌀 것.**
- **가격 입력 검증 (2026-07-07)**: `admin/menus/create.html`/`edit.html`의 가격 입력에 있던 `step="100"`이 100원 단위 아닌 값(예: 1234원) 입력 시 브라우저 기본 검증에 걸려 저장 버튼이 아무 피드백 없이 안 눌리는 문제가 있었음. `step` 제한을 제거해 임의의 정수 가격을 저장 가능하도록 함 (`min="0"`은 유지).
- **빈 메뉴 목록 처리 (2026-07-07)**: 메뉴가 0개일 때 `index.html`/`menus/list.html`이 빈 화면만 보여주던 문제 수정 — "등록된 메뉴가 없습니다." 안내 문구 추가 (`orders`/`admin` 쪽 빈 상태 처리와 동일한 패턴).

### 주요 CSS 변수 (`css/variables.css`)

색상 `--color-*`(`accent`, `text`, `text-muted`, `surface`, `border`, `success`, `danger` 등), 카테고리 포인트 컬러 `--color-cat-{coffee,tea,ade,dessert}`, 타이포 `--font-size-{xs,sm,base,lg,xl,2xl}`, 간격 `--spacing-{xs,sm,md,lg,xl,2xl}`, 반경 `--radius-{sm,md,lg,full}`, 그림자 `--shadow-{sm,md}`, 트랜지션 `--transition-{fast,base}`. 새 변수가 필요하면 `variables.css`에 추가하고 여기 이름도 갱신.

> **디자인 리뉴얼 (2026-07-07)**: 글래스모피즘(`--glass-bg`/`--glass-border`/`--blur-glass`/`--shadow-glass`) 전부 제거하고 solid 카드(`--color-surface` + `--shadow-md`)로 교체. `.glass-card` 유틸리티 클래스 이름은 기존 HTML/JS와의 호환을 위해 그대로 유지하되, 실제 스타일은 solid로 바뀜. 메뉴 카드에는 `cat-${categoryId}` 클래스(`variables.css`에 정의)로 카테고리별 포인트 컬러(왼쪽 보더 + 라벨 색)를 추가함.

### 7·8단계 결정사항 (전부 구현 완료)

- [x] **마이페이지(7단계) 범위**: `cafe_orders`를 재사용해서 프로필 placeholder + 주문 요약(총 주문/누적 결제) + 최근 주문 3건을 보여준다. → `my/index.js`
- [x] **관리자 주문관리(8단계) 상태값**: `주문완료 → 조리중 → 수령완료 / 취소` 4단계. 관리자가 목록/상세에서 셀렉트로 자유롭게 변경 가능. → `js/utils.js`의 `ORDER_STATUSES`, `admin/orders/*`
- [x] **관리자 메뉴 ↔ 고객 메뉴 동기화**: `js/data.js`에 `getMenus()`/`saveMenus()`를 만들어 `cafe_admin_menus`를 단일 소스로 통합. 관리자 CRUD, 고객 메뉴 조회, 장바구니가 전부 이 함수를 통해 같은 데이터를 본다.
