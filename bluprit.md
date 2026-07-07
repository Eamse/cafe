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
- **카드 스타일**: Glass morphism
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

### 4단계: 고객 - 장바구니 관리 시스템

- [x] `basket/list.html` — 장바구니
- [x] `basket/list.css`
- [x] `basket/list.js`

### 5단계: 고객 - 주문 관리 시스템

- [x] `orders/list.html` — 주문 내역 목록
- [x] `orders/list.css`
- [x] `orders/list.js`
- [x] `orders/detail.html` — 주문 상세
- [x] `orders/detail.css`
- [x] `orders/detail.js`

### 6단계: 고객 - 메인 페이지

- [x] `index.html`
- [x] `index.css`
- [x] `index.js`

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
| `generateId(prefix)` | → `"prefix-..."` | |
| `qs(selector, scope?)` / `qsa(selector, scope?)` | DOM 헬퍼 | |
| `getCart()` / `saveCart(items)` | 카트 전체 읽기/쓰기 | |
| `addToCart(menuId, quantity?)` | 담기 | |
| `updateCartQuantity(menuId, quantity)` | 수량 변경 (0 이하면 제거) | |
| `removeFromCart(menuId)` | 제거 | |
| `clearCart()` | 전체 비우기 | |
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

### 주요 CSS 변수 (`css/variables.css`)

색상 `--color-*`(`accent`, `text`, `text-muted`, `surface`, `border`, `success`, `danger` 등), 타이포 `--font-size-{xs,sm,base,lg,xl,2xl}`, 간격 `--spacing-{xs,sm,md,lg,xl,2xl}`, 반경 `--radius-{sm,md,lg,full}`, 글래스 `--glass-bg`, `--glass-border`, `--blur-glass`, `--shadow-glass`, 트랜지션 `--transition-{fast,base}`. 새 변수가 필요하면 `variables.css`에 추가하고 여기 이름도 갱신.

### 7·8단계 결정사항 (전부 구현 완료)

- [x] **마이페이지(7단계) 범위**: `cafe_orders`를 재사용해서 프로필 placeholder + 주문 요약(총 주문/누적 결제) + 최근 주문 3건을 보여준다. → `my/index.js`
- [x] **관리자 주문관리(8단계) 상태값**: `주문완료 → 조리중 → 수령완료 / 취소` 4단계. 관리자가 목록/상세에서 셀렉트로 자유롭게 변경 가능. → `js/utils.js`의 `ORDER_STATUSES`, `admin/orders/*`
- [x] **관리자 메뉴 ↔ 고객 메뉴 동기화**: `js/data.js`에 `getMenus()`/`saveMenus()`를 만들어 `cafe_admin_menus`를 단일 소스로 통합. 관리자 CRUD, 고객 메뉴 조회, 장바구니가 전부 이 함수를 통해 같은 데이터를 본다.
