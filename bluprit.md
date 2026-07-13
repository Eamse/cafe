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

> ⚠️ **예외 (2026-07-08)**: `index.html`(메인 페이지)만 **레트로 다이너 톤**으로 따로 스킨됨 — 위 브라운/크림/솔리드 카드 테마는 나머지 페이지(메뉴/장바구니/주문/마이페이지/관리자)에 계속 적용되고, 메인 페이지만 다름. 아래 6단계 항목 참고.

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

> **개선 (2026-07-07) — 메인 페이지 4종 추가**: (1) **인기 메뉴 뱃지** — 진짜 주문 데이터(`getOrders()`)를 집계해서 가장 많이 팔린 상위 3개 메뉴에 `popular-tag`("인기") 표시(가짜 통계 아님, 품절 메뉴는 제외). (2) **다시 담아보세요 위젯**(`#home-recent-section`) — 이 브라우저(게스트)의 가장 최근 주문 항목을 히어로 아래에 보여주고 "다시 담기" 버튼으로 바로 장바구니에 재추가(`orders/list.js`의 다시담기와 같은 패턴). 주문 이력이 없으면 섹션 자체를 숨김(`hidden`). (3) **검색 결과 개수**(`#menu-count`) — "전체 메뉴" 옆에 필터링된 현재 개수 표시. (4) **가격 범위 필터**(`#price-filter`: 전체/5,000원 이하/5,000~6,000원/6,000원 이상) — 검색·카테고리·정렬과 전부 함께 적용됨.

> **디자인 변경 (2026-07-08) — 레트로 다이너 리스킨**: 클로드 아티팩트로 미리보기 시안 여러 개(고급 3종 → 5종 → 레트로 계열 5종)를 만들어본 뒤, 사용자가 처음 5종 시안 중 "레트로 다이너 팝(Retro Diner Pop)"을 최종으로 골라서 `index.css`에 실제로 적용함. **팀 공용 토큰(`css/variables.css`)은 안 건드리고, `index.css` 안에서만 `:root`를 재정의**해서 `index.html` 문서에만 적용되고 다른 페이지엔 영향 없음(각 HTML은 독립 문서라 `:root` 재정의가 그 문서 안에서만 유효).
>
> - 색상: 배경 `#fdf6e3`(크림), 텍스트/테두리 `#2b2118`(잉크), 포인트 `#c1443b`(토마토레드), 보조 포인트 `#d99a2b`(머스타드, 기존 `--color-warning` 재사용), 품절 `#6f6259`(muted)
> - 폰트: 본문/헤드라인 `Georgia`(볼드), 가격만 `"Courier New"` 모노스페이스(영수증/메뉴판 느낌)
> - 카드/버튼: 얇은 그림자 대신 2px 굵은 테두리로 통일, 카테고리 탭 활성 상태는 머스타드 배경, "인기"/"품절" 뱃지는 3도 기울인 리본 스타일
> - 히어로: 기존 배경 사진(Unsplash) 제거하고 크림 배경 + 왼쪽 정렬 텍스트로 단순화(시안 그대로)
> - **공유 컴포넌트(`css/cart-panel.css`)도 후속 반영 (2026-07-08)**: 알고보니 이 파일은 이미 `var(--color-accent)`/`body`의 `font-family` 같은 공용 토큰을 그대로 쓰고 있어서, 홈 화면(레트로 `:root` 재정의)에서 열면 가격 색·폰트가 이미 자동으로 레트로 톤을 따라가고 있었음. 여기에 테두리 두께(2px)와 가격 폰트(`"Courier New"` 모노스페이스)만 구조적으로 통일해서 카드와 완전히 맞춤 — **색상은 하드코딩 안 하고 전부 변수(`var(--color-*)`)로만 손댔기 때문에**, `menus/list.html`/`menus/detail.html`에서 이 패널을 열면 그 페이지 고유의 (팀원) 색 그대로 나오면서 테두리 스타일만 통일되게 적용됨 — 페이지별 색은 안 섞이고 구조만 공통화됨.

> **버그 수정 (2026-07-08) — 메뉴 이미지 5종 오매칭 교정**: 팀원이 넣어둔 Unsplash 실사 이미지(`js/data.js`) 중 5개가 메뉴명과 실제로 다른 사진이었던 것을 발견 — 직접 다운로드해서 육안으로 확인 후 교체.
>
> - 아메리카노: 라떼아트 컵 사진 → 블랙커피(탑뷰) 사진으로 교체
> - 카페모카: 초콜릿 없는 일반 아이스커피 → 초콜릿 붓는 장면 + 카카오닙스 사진으로 교체
> - 캐모마일: 전혀 다른 차 제품(복숭아 우롱차 패키지) 사진 → 꽃이 놓인 golden tea 사진으로 교체
> - 자몽에이드: 망고 조각이 보이는 망고 음료 → 코랄/핑크 톤 음료 사진으로 교체(완벽한 "에이드" 느낌은 아니지만 색감상 자몽에 더 가까운 최선의 대안)
> - 청포도에이드: 초록빛이 전혀 없는 민트라임 모히또 → 실제 초록색 액체가 담기는 사진으로 교체(포도 특유의 반투명함보다는 스무디에 가깝지만, 색상 매칭은 확실히 개선)
> - 나머지 5개(카페라떼/바닐라라떼/얼그레이/치즈케이크/크루아상)는 확인 결과 이름과 잘 맞아서 그대로 둠.
>
> **버그 수정 (2026-07-08) — 이미지 교정이 브라우저에 반영 안 되는 문제**: 위 이미지 교체 후에도 이미 한 번 열어봤던 브라우저에서는 옛날 사진이 계속 보이는 문제 발생 — `getMenus()`가 `localStorage`(`cafe_admin_menus`)에 캐시된 값이 있으면 무조건 그걸 쓰고 `js/data.js`의 최신 시드는 안 보기 때문. `js/data.js`에 `MENUS_SEED_VERSION`(현재 `"2"`)을 추가해서, 저장된 캐시의 버전이 최신 시드 버전과 다르면 자동으로 재시드하도록 수정(`cafe_admin_menus_version` 키로 버전 비교). 이제 시드 데이터(사진 등)를 바꿀 때마다 이 버전만 올려주면 기존 사용자 브라우저도 새로고침 한 번으로 자동 반영됨 — 콘솔에서 수동으로 `localStorage` 지울 필요 없음.
>
> **보안 수정 (2026-07-08) — 메뉴 이미지 URL 미이스케이프**: `index.js`와 `js/cartPanel.js`가 `menu.image`를 이스케이프 없이 `style="background-image: url('...')"`에 그대로 꽂고 있던 것을 발견. 현재는 `admin/menus/create.html`·`edit.html`에 이미지 입력 폼이 없어 시드 데이터로만 채워지므로 실제 악용 경로는 없었지만, 나중에 관리자 폼에 이미지 URL 입력이 추가되면 스토어드 XSS로 이어질 수 있는 패턴이라 미리 `escapeHtml()`을 적용해 차단.
>
> **기능 이식 (2026-07-08) — `menus/list.html`에 홈 화면 기능 통일**: "메인 페이지만 담당"이라는 역할 분담 때문에 검색/정렬/가격필터/USP/인기뱃지/최근주문위젯이 `index.html`에만 있고 `menus/list.html`(팀원 담당 파일)에는 없어서, 홈→메뉴 목록으로 넘어가면 이 기능들이 전부 사라지는 실사용 공백이 있었음. 사용자 확인 후 `menus/list.html/.css`, `menus/list.js`에 동일 기능을 이식(레트로 테마는 `index.html` 전용이라 이식 안 함 — 기존 `list.css`의 브라운/크림 톤 그대로 유지). 카드 스타일은 기존처럼 이미지 없는 텍스트형 유지, `.sold-out-tag`/`.popular-tag`만 추가. 원래 있었지만 안 쓰이던 `#category-tabs` 마크업도 이번에 실제로 연결됨. **팀원 담당 파일을 수정했으므로 push 전 팀원과 조율 필요.**

> **개선 (2026-07-08) — 메인 페이지 4종 추가 (강의 데이터 계약 안 건드리는 범위만 선별)**: (1) **최근 본 메뉴**(`#home-viewed-section`) — 메뉴 카드를 클릭해서 담기 패널을 열 때마다 `localStorage`(`cafe_recently_viewed`, 최대 6개)에 기록, 최신순으로 노출. "다시 담아보세요"(주문 기반)와 별개로 조회 기반. 항목을 클릭하면 담기 패널이 다시 열림. 기록이 없으면 섹션 숨김. (2) **즐겨찾기(찜)** — 카드 좌상단 하트 버튼(`.favorite-btn`)으로 토글, `localStorage`(`cafe_favorites`)에 메뉴 ID만 저장(메뉴 스키마 자체는 안 건드림). 메뉴 검색창 옆 "♥ 즐겨찾기만" 토글로 즐겨찾기한 메뉴만 필터링 가능. 하트 클릭은 `stopPropagation`으로 담기 패널이 안 열리게 분리. (3) **로딩 스켈레톤** — `#featured-row`/`#menu-grid`에 초기 HTML로 시머 애니메이션 스켈레톤 카드를 넣어두고 `index.js` 렌더링 시 실제 콘텐츠로 교체(지금은 데이터가 동기 로컬이라 체감은 적지만, 추후 API 연동 대비). (4) **접근성 개선** — 메뉴 카드/최근 본 메뉴 항목에 종합 `aria-label`, 카테고리 탭·즐겨찾기 버튼에 `aria-pressed`, 검색·정렬·가격필터에 `aria-label`, 인터랙티브 요소 `:focus-visible` 아웃라인, `prefers-reduced-motion: reduce`일 때 카드 호버/스켈레톤 애니메이션 비활성화.

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

| 이름                             | 형태                                                                                                                        | 설명                                                                                                                  |
| -------------------------------- | --------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------- |
| `categories`                     | `{ id: string, name: string }[]`                                                                                            | **시드(초기값)만**. 실제 조회/저장은 아래 `getCategories`/`saveCategories` 사용                                       |
| `menus`                          | `{ id: number, categoryId: string, name: string, price: number, description: string, image: string, isSoldOut: boolean, hasTempOption?: boolean, hasSizeOption?: boolean, sizeUpcharge?: number }[]` | **시드(초기값)만**. 실제 조회/저장은 아래 `getMenus`/`saveMenus` 사용. `hasTempOption`/`hasSizeOption`/`sizeUpcharge`는 2026-07-12 옵션 기능 추가분(어드민이 메뉴별로 설정) |
| `getMenus()`                     | → menu 배열                                                                                                                 | **메뉴 단일 소스.** `cafe_admin_menus`를 읽고, 없으면 `menus`로 시드. 관리자/고객/장바구니 전부 이 함수로 메뉴를 읽음 |
| `saveMenus(list)`                | 저장                                                                                                                        | `admin/menus/*`의 CRUD가 이걸로 저장                                                                                  |
| `getCategories()`                | → category 배열                                                                                                             | **카테고리 단일 소스** (2026-07-11 추가). `cafe_admin_categories`를 읽고, 없으면 `categories`로 시드. `admin/categories/*`의 CRUD와 카테고리 탭/드롭다운 전부 이 함수로 읽음 |
| `saveCategories(list)`           | 저장                                                                                                                        | `admin/categories/list.js`의 추가/수정/삭제가 이걸로 저장                                                             |
| `getCategoryById(categoryId)`    | → category 객체 \| null                                                                                                     | 내부적으로 `getCategories()` 사용                                                                                     |
| `getMenuById(menuId)`            | → menu 객체 \| null                                                                                                         | 내부적으로 `getMenus()` 사용                                                                                          |
| `getMenusByCategory(categoryId)` | → menu 배열                                                                                                                 | `"all"` 또는 미지정 시 전체 반환. 내부적으로 `getMenus()` 사용                                                        |
| `getFeaturedMenuIds()`           | → `number[]` (menu id)                                                                                                       | 관리자가 고른 "오늘의 추천" 메뉴 id 목록 (2026-07-11 추가)                                                            |
| `saveFeaturedMenuIds(ids)`       | 저장                                                                                                                        | `admin/menus/list.js`의 "☆ 추천" 토글이 사용                                                                          |
| `toggleFeaturedMenu(menuId)`     | 추가/해제 토글, → 갱신된 id 배열                                                                                             |                                                                                                                        |
| `getNotices()` / `saveNotices(list)` | → `{ id, message, date }[]` / 저장                                                                                    | **공지 단일 소스** (2026-07-11 추가). `admin/notices/list.js`가 CRUD, 홈(`index.js`)이 `getActiveNoticeIds()`와 함께 읽음 |
| `getActiveNoticeIds()` / `saveActiveNoticeIds(ids)` / `toggleActiveNotice(id)` | → `string[]` (notice id, 최대 `MAX_ACTIVE_NOTICES`개) | 홈 화면에 실제로 노출할 공지 선택 목록. `saveActiveNoticeIds`는 3개 초과분을 자동으로 잘라냄            |
| `MAX_ACTIVE_NOTICES`             | `3`                                                                                                                          | 노출 가능한 공지 최대 개수 상수                                                                                       |
| `getEvents()` / `saveEvents(list)` | → `{ id, title, description, date, image, isEnded }[]` / 저장                                                              | **이벤트 단일 소스** (2026-07-11 추가). `admin/events/list.js`가 등록/종료 처리, 홈(`index.js`)·`events/list.js`가 읽음 |
| `getEventById(eventId)`          | → event 객체 \| null                                                                                                        | 내부적으로 `getEvents()` 사용                                                                                        |
| `isEventEnded(event)`            | → `boolean`                                                                                                                  | `event.isEnded`(수동 종료) 또는 `event.endDate`(종료 예정일)가 오늘 이전이면 true. 이벤트를 표시하는 모든 곳(관리자 목록/홈/이벤트 전체보기)이 `event.isEnded`를 직접 읽지 않고 반드시 이 함수를 거침 (2026-07-13 추가) |

### `js/utils.js` (export)

| 이름                                             | 형태                                             | 설명                                                                                                                                            |
| ------------------------------------------------ | ------------------------------------------------ | ----------------------------------------------------------------------------------------------------------------------------------------------- |
| `formatPrice(price)`                             | → `"4,500원"`                                    |                                                                                                                                                 |
| `formatDate(date)`                               | → `"2026.07.06 12:16"`                           |                                                                                                                                                 |
| `escapeHtml(str)`                                | → HTML 이스케이프된 문자열                       | **관리자가 입력한 메뉴명/설명, 주문 항목명처럼 사용자 입력이 `innerHTML`에 들어가는 모든 곳에서 반드시 거쳐야 함** (XSS 방지, 2026-07-07 추가)  |
| `generateId(prefix)`                             | → `"prefix-..."`                                 |                                                                                                                                                 |
| `readImageFileAsDataUrl(file, maxDimension?, quality?)` | → `Promise<string>` (data URL)             | 업로드한 이미지를 캔버스로 리사이즈+재인코딩해 용량을 줄인 뒤 data URL로 반환. `admin/menus/create.js`/`edit.js`가 사용 (2026-07-11 추가)         |
| `qs(selector, scope?)` / `qsa(selector, scope?)` | DOM 헬퍼                                         |                                                                                                                                                 |
| `getCart()` / `saveCart(items)`                  | 카트 전체 읽기/쓰기                              |                                                                                                                                                 |
| `addToCart(menuId, quantity?)`                   | 담기                                             |                                                                                                                                                 |
| `updateCartQuantity(menuId, quantity)`           | 수량 변경 (0 이하면 제거)                        |                                                                                                                                                 |
| `removeFromCart(menuId)`                         | 제거                                             |                                                                                                                                                 |
| `clearCart()`                                    | 전체 비우기                                      |                                                                                                                                                 |
| `renderCartBadge()`                              | `#cart-badge` 엘리먼트를 찾아 담긴 수량으로 갱신 | 고객용 페이지가 공통으로 쓰는 헤더 nav의 장바구니 뱃지용 (2026-07-07 추가). 카트가 바뀌는 지점(담기/수량변경/체크아웃)과 각 페이지 로드 시 호출 |
| `ORDER_STATUSES`                                 | `["주문완료", "조리중", "수령완료", "취소"]`     | 주문 상태 값 전체 목록                                                                                                                          |
| `getOrders()` / `saveOrders(orders)`             | 주문 전체 읽기/쓰기                              | **주문 단일 소스.** `basket`, `orders/*`, `my/*`, `admin/orders/*` 전부 이 함수로 주문을 읽고 씀                                                |
| `getOrderById(orderId)`                          | → order 객체 \| null                             |                                                                                                                                                 |
| `updateOrderStatus(orderId, status)`             | 상태 변경                                        | `admin/orders/*`가 사용                                                                                                                         |
| `cancelOrderWithReason(orderId, reason)`         | 취소 처리 + `cancelReason` 저장                  | `orders/detail.js`의 취소 사유 선택이 사용 (2026-07-11 추가)                                                                                     |
| `getAvailableStatuses(currentStatus)`            | → `string[]`                                     | 현재 상태 기준 선택 가능한 상태만 반환(주문완료 아니면 취소 제외). `admin/orders/*` 상태 셀렉트가 사용 (2026-07-11 추가)                          |
| `getFavorites()`                                 | → `Set<number>` (menu id)                        | **즐겨찾기 단일 소스** (2026-07-11, `index.js` 로컬 구현을 여기로 이동). `my/index.js`도 이 함수로 즐겨찾기 목록을 읽음                          |
| `toggleFavorite(menuId)`                         | 추가/해제 토글                                   | `index.js`의 하트 버튼이 사용                                                                                                                   |
| `renderStatusSteps(status)`                      | → HTML 문자열                                    | 주문 상태를 진행 단계 표시줄로 렌더링(취소면 배너로 대체). `orders/detail.js`, `admin/orders/detail.js` 공용 (2026-07-11 추가)                  |
| `estimatePickupMinutes(totalQuantity)`           | → `"예상 준비 시간: 약 N~M분"`                    | `basket/list.js`, `orders/list.js`, `orders/detail.js` 공용 (2026-07-11 추가)                                                                    |
| `getFrequentlyBoughtWith(menuId, limit?)`        | → `number[]` (menu id, 빈도순)                    | 실제 주문 데이터 기준 co-occurrence. `menus/detail.js`, `js/cartPanel.js` 공용 (2026-07-11 추가)                                                 |
| `getRecentSearches()`                             | → `string[]`                                     | 최근 검색어 목록(최신순, 최대 6개) (2026-07-11 추가)                                                                                            |
| `addRecentSearch(term)`                           | 추가(중복 제거 후 맨 앞에)                       | `index.js`/`menus/list.js` 검색창이 사용                                                                                                        |
| `removeRecentSearch(term)`                        | 제거                                              | 검색어 칩의 ✕ 버튼이 사용                                                                                                                        |
| `getCartLineKey(menuId, temp, size)`              | → `string`                                        | 장바구니 줄(line) 식별 키(같은 메뉴라도 옵션이 다르면 다른 줄). `addToCart`/`updateCartQuantity`/`removeFromCart`가 내부적으로 사용, `basket/list.js`가 DOM data attribute로도 사용 (2026-07-12 추가) |
| `addToCart(menuId, quantity, options?)` / `updateCartQuantity(menuId, quantity, options?)` / `removeFromCart(menuId, options?)` | `options: { temp, size }` | 옵션(`{temp:"ICE"\|"HOT", size:"REGULAR"\|"LARGE"}`)까지 포함해 특정 장바구니 줄을 담기/수정/삭제. `options` 생략 시 옵션 없는 메뉴처럼 동작(하위 호환) |
| `getMenuUnitPrice(menu, options?)`                | → `number`                                        | 사이즈 라지 업차지(`menu.sizeUpcharge`)까지 반영한 실제 단가 (2026-07-12 추가) |
| `isDessertMenu(menu)` / `cartHasDrink(cart, menus)` | → `boolean`                                     | "디저트+음료 동시 주문 시 할인" 판정에 사용. 카테고리가 `dessert`가 아니면 전부 음료로 취급 (2026-07-12 추가) |
| `getEffectiveUnitPrice(menu, item, hasDrinkInCart)` | → `number`                                       | 사이즈 업차지 반영 후, 디저트+음료 할인(`DESSERT_DRINK_DISCOUNT`, 500원)까지 뺀 최종 단가. `basket/list.js`의 체크아웃이 이 값을 주문 항목의 `price`로 그대로 저장 (2026-07-12 추가) |
| `formatItemOptions(item)`                         | → `"아이스 · 라지"` 형태의 문자열                   | 장바구니/주문 항목의 `temp`/`size`를 표시용 텍스트로 변환 (2026-07-12 추가) |
| `isOrderReadyForPickup(order)`                    | → `boolean`                                       | 주문완료/조리중 상태에서 예상 준비 시각이 지났는지 판단. 홈 화면 픽업 알림 배너가 사용 (2026-07-13 추가) |
| `getNextBarcodeNumber()`                          | → `number` (항상 이전 값 + 1)                       | 매장 수령 주문에 발급하는 고유 바코드 번호. 주문 id와 별개의 전역 카운터(`cafe_barcode_counter`)라 주문이 취소/삭제돼도 번호가 재사용되지 않음 (2026-07-13 추가) |
| `formatBarcodeNumber(number)` / `renderBarcodeBarsHtml(number)` | → `"BC-000123"` / 바코드 막대 HTML       | 바코드 번호 표시용 포맷과, 같은 번호면 항상 같은 모양이 나오는 장식용 막대 패턴(실제 스캔 불가, 시각적 표시 목적) |

### `js/auth.js` (export) — 2026-07-13 추가, localStorage 기반 임시 인증 (추후 Supabase Auth로 교체 예정)

| 이름 | 형태 | 설명 |
| --- | --- | --- |
| `signupCustomer({name, email, password, phone})` | → `{ok, customer}` \| `{ok:false, error}` | 이메일 중복 체크 후 가입, 성공 시 자동 로그인(세션 저장) |
| `loginCustomer(email, password)` / `logoutCustomer()` | → `{ok, customer}` \| `{ok:false, error}` | 고객 로그인/로그아웃. 세션은 `cafe_customer_session`(customer id)만 저장 |
| `getCurrentCustomer()` | → customer 객체 \| null | 현재 로그인한 고객 |
| `renderAuthNav()` | DOM 렌더 | 고객 페이지 헤더의 `#auth-nav`를 로그인 상태에 맞춰 채움(로그인 링크 또는 이름+로그아웃). 전 고객 페이지 8개가 `initThemeToggle()`과 함께 호출 |
| `loginAdmin(email, password)` / `logoutAdmin()` | → `{ok, admin}` \| `{ok:false, error}` | 어드민 로그인/로그아웃. 고객과 완전히 분리된 별도 세션(`cafe_admin_session`). 기본 계정 `admin@cafe.com`/`admin1234`가 최초 접근 시 자동 시드됨 |
| `getCurrentAdmin()` | → admin 객체 \| null | 현재 로그인한 관리자 |
| `requireAdminAuth()` | → `boolean` | 로그인 안 돼있으면 `/admin/login.html`로 즉시 리다이렉트 |
| `initAdminGuard()` | - | `requireAdminAuth()` + 사이드바의 `#admin-name`/`#admin-logout-btn` 바인딩을 한 번에 처리. 전 admin 페이지 10개의 진입 스크립트 최상단에서 호출 |
| `requireCustomerAuth()` | → `boolean` | 로그인 안 돼있으면 `/auth/login.html?redirect=<현재경로>`로 리다이렉트(로그인 후 원래 페이지로 복귀). `my/index.js`가 최상단에서 호출 (2026-07-13 추가) |
| `getCustomerAddresses()` | → `{id, label, recipientName, phone, address, isDefault}[]` | 로그인한 고객의 저장된 배송지 목록. 고객 객체의 `addresses` 배열에 종속 |
| `addAddress({label, recipientName, phone, address})` / `updateAddress(addressId, fields)` / `removeAddress(addressId)` / `setDefaultAddress(addressId)` | → 갱신된 addresses 배열 | 로그인한 고객의 주소록 CRUD. 삭제 시 그 주소가 기본이었으면 남은 것 중 하나를 자동으로 기본 지정 |

### localStorage 키

> 아래 키는 직접 `localStorage.getItem/setItem`으로 만지지 말고, 반드시 위 `getMenus`/`saveMenus`, `getOrders`/`saveOrders` 함수를 통해서만 접근할 것.

| 키                 | 형태                                                                                                                  | 비고                                                                                                               |
| ------------------ | --------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------ |
| `cafe_cart`        | `{ menuId: number, quantity: number, temp: "ICE"\|"HOT"\|null, size: "REGULAR"\|"LARGE"\|null }[]`                    | `js/utils.js`의 카트 함수가 관리. `temp`/`size`는 옵션 없는 메뉴면 `null` (2026-07-12: 옵션 필드 추가)             |
| `cafe_orders`      | `{ id: number, createdAt: string(ISO), items: { menuId, name, price, quantity, temp, size }[], total: number, status: string, note?: string, cancelReason?: string, deliveryType: "pickup"\|"delivery", barcodeNumber: number\|null }[]` | `js/utils.js`의 주문 함수가 관리. `status`는 `ORDER_STATUSES` 중 하나. `note`는 체크아웃 시 입력한 요청사항(선택), `cancelReason`은 고객이 취소할 때 고른 사유(선택, 2026-07-11 추가). `items[].price`는 사이즈 업차지·디저트 할인까지 이미 반영된 최종 단가(2026-07-12 추가). `deliveryType`/`barcodeNumber`는 2026-07-13 추가 — 매장 수령일 때만 바코드 발급 |
| `cafe_barcode_counter` | `number` | `js/utils.js`의 `getNextBarcodeNumber`가 관리하는 전역 증가 카운터. 주문 id와 독립적이라 주문이 삭제돼도 번호가 재사용되지 않음 (2026-07-13 추가) |
| `cafe_admin_menus` | `menus`와 동일한 형태                                                                                                 | `js/data.js`의 `getMenus`/`saveMenus`가 관리. 관리자 CRUD와 고객 메뉴 조회가 동일한 키를 공유(8단계에서 통합 완료) |
| `cafe_admin_categories` | `categories`와 동일한 형태                                                                                       | `js/data.js`의 `getCategories`/`saveCategories`가 관리 (2026-07-11 추가) |
| `cafe_recent_searches` | `string[]`                                                                                                        | `js/utils.js`의 `getRecentSearches`/`addRecentSearch`/`removeRecentSearch`가 관리 (2026-07-11 추가) |
| `cafe_featured_menus` | `number[]` (menu id)                                                                                               | `js/data.js`의 `getFeaturedMenuIds`/`saveFeaturedMenuIds`/`toggleFeaturedMenu`가 관리 (2026-07-11 추가) |
| `cafe_notices` | `{ id: string, message: string, date: string }[]`                                                                  | `js/data.js`의 `getNotices`/`saveNotices`가 관리 (2026-07-11 추가) |
| `cafe_active_notice_ids` | `string[]` (notice id, 최대 3개)                                                                                | `js/data.js`의 `getActiveNoticeIds`/`saveActiveNoticeIds`/`toggleActiveNotice`가 관리 (2026-07-11 추가) |
| `cafe_events` | `{ id: string, title: string, description: string, date: string, endDate?: string, image: string, isEnded: boolean }[]` | `js/data.js`의 `getEvents`/`saveEvents`가 관리 (2026-07-11 추가, `endDate`는 2026-07-13 추가 — 종료 예정일, 표시 여부는 `isEventEnded()`로 판단) |
| `cafe_customers` | `{ id, name, email, password, phone, createdAt, addresses?: {id, label, recipientName, phone, address, isDefault}[] }[]` | `js/auth.js`의 `signupCustomer`가 관리, `addresses`는 주소록 CRUD 함수들이 관리 (2026-07-13 추가) |
| `cafe_customer_session` | `string` (customer id) | `js/auth.js`의 로그인 세션 |
| `cafe_admin_accounts` | `{ id: string, email: string, password: string, name: string }[]` | `js/auth.js`가 관리, 최초 접근 시 기본 계정 1개 자동 시드 (2026-07-13 추가) |
| `cafe_admin_session` | `string` (admin id) | `js/auth.js`의 어드민 로그인 세션 — 고객 세션과 완전히 분리 |

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

### 9단계: 완성도 보강 (2026-07-11)

- [x] **관리자 카테고리 관리 신규 추가**
- [x] **관리자 메뉴 등록/수정에 이미지 URL 입력 추가**
- [x] **폼 검증 UX 개선**
- [x] **README.md 작성**
- [x] **품절 메뉴 재검증 버그 수정**
- [x] **장바구니 담기 패널 — "전체 한번에 담기" 추가**
- [x] **즐겨찾기 로직을 `js/utils.js`로 공용화**
- [x] **마이페이지 — 즐겨찾기한 메뉴 섹션 추가**
- [x] **마이페이지 — 취소된 주문 시각적 구분**
- [x] **최근 본 메뉴 최대 개수 10개로 확대**
- [x] **주문 요청사항 입력 추가**
- [x] **주문 상태 진행 표시줄(스텝바) 추가**
- [x] **메뉴 상세 — "함께 주문하면 좋은 메뉴" 추천**
- [x] **장바구니 — 예상 준비 시간 안내**
- [x] **최근 검색어**
- [x] **검색 자동완성**
- [x] **장바구니 담기 패널 — 미니 추천**
- [x] **주문완료 상태에 예상 준비 시간 재노출**
- [x] **공용 로직 정리**
- [x] **즐겨찾기를 메뉴 목록/상세로 확대**
- [x] **즐겨찾기 하트 팝 애니메이션**
- [x] **히어로 배경 페이드 인/아웃**
- [x] **관리자 — 오늘의 추천 메뉴 직접 지정**
- [x] **준비 시간 실시간 카운트다운**
- [x] **장바구니 패널 — 포커스 트랩**
- [x] **주문 취소 시 사유 선택**
- [x] **관리자가 주문 수락하면 고객 취소 불가 + 관리자 취소 옵션도 사라짐**
- [x] **메뉴 목록/상세 페이지 카드 리디자인**
- [x] **결제 완료 "감사합니다" 배너**
- [x] **관리자 대시보드 — 오늘의 추천 현황 카드**
- [x] **메뉴 필터/정렬/검색/즐겨찾기 상태 URL 쿼리 유지**
- [x] **메뉴 이미지 lazy loading**
- [x] **관리자 페이지를 고객 페이지와 같은 다크 테마로 통일**
- [x] **핵심 함수 유닛 테스트 추가**
- [x] **모바일 반응형 검증 (Playwright로 실제 렌더링 확인)**
- [x] **관리자 메뉴 이미지 — URL 입력 대신 사진 업로드**
- [x] **관리자 주문 관리 — 여러 건 한 번에 상태 변경**
- [x] **메뉴 상세 페이지에 정작 메뉴 사진이 없던 버그 수정**
- [x] **고객 페이지 CSS/JS 경로를 절대경로로 전환 (배포 버그 수정)**
- [x] **관리자 공지사항(Notice) 관리 신규 추가**
- [x] **홈 화면 메뉴 카드 호버 효과가 동작하지 않던 버그 수정**
- [x] **히어로 슬라이드 — 켄번즈(서서히 확대) 효과 추가**
- [x] **히어로 첫 이미지가 로드 시 페이드 없이 바로 나타나던 버그 수정**
- [x] **접근성 — skip link 추가**
- [x] **다크/라이트 테마 수동 토글 — 전 페이지 동작 재검증**
- [x] **관리자 이벤트(Event) 관리 + 이벤트 전체보기 페이지 신규 추가**
- [x] **`.html?쿼리` 링크가 `serve`에서 쿼리스트링째로 사라지는 배포 버그 수정 (1차: 링크에서 `.html` 제거로 우회)**
- [x] **위 수정을 `serve.json`(`cleanUrls: false`)으로 재수정 — `.html` 제거 방식이 VS Code Live Server 등 확장자 없는 경로를 못 찾는 다른 정적 서버에서 404를 내던 문제 발견, 링크는 전부 `.html` 유지로 되돌리고 서버 설정으로 근본 해결**
- [x] **메뉴 옵션(온도/사이즈) + 디저트·음료 동시 주문 할인 기능**
- [x] **테마 토글 버튼을 슬라이딩 스위치 디자인으로 교체**
- [x] **고객 회원가입/로그인 + 어드민 로그인(분리) — localStorage 기반 임시 인증, 추후 Supabase Auth로 교체 예정**
- [x] **관리자 메뉴/이벤트 이미지 등록 — 파일 업로드 + URL 둘 다 지원**
- [x] **이벤트 관리 — 종료 예약 날짜(endDate) 설정, 지나면 자동으로 종료 처리**
- [x] **마이페이지에 "주소 관리" 탭 추가 — 여러 배송지 등록/수정/삭제/기본 설정, 로그인 필수(미들웨어 가드)**
- [x] **관리자 목록 페이지(메뉴/카테고리/주문/공지/이벤트) 전부 flex 세로 목록 → CSS 그리드 카드 레이아웃으로 전환**
- [x] **홈 화면 — 픽업 준비 알림 배너**: 픽업 전(주문완료/조리중) 주문의 예상 준비 시각이 지나면 홈 화면 상단에 알림 배너 표시(30초마다 재확인, 클릭 시 주문 상세로 이동). 배너 CSS의 `display:flex`가 `hidden` 속성을 무력화하던 버그를 `[hidden]` 우선순위 규칙 추가로 수정
- [x] **수령 방법(배달/매장 수령) 선택 + 매장 수령 픽업 바코드 발급**: 체크아웃 시 배달/매장 수령을 고르게 하고(매장 수령이 기본값), 매장 수령이면 절대 겹치지 않는 전역 카운터로 고유 바코드 번호를 발급(`getNextBarcodeNumber`). 고객 주문 상세에 바코드(장식용 패턴+번호) 노출, 어드민 주문 상세에는 바코드 번호 입력/스캔 후 일치하면 자동으로 "수령완료" 처리하는 확인 버튼 추가. 배달 주문은 바코드 미발급, 주소 필드는 매장 수령 선택 시 선택 입력으로 전환

### 추후 구현 (DB 연결 필요, 현재 localStorage 구조로는 보류)

- [ ] **매출 통계 대시보드** — 총 판매금액, 일자별 매출/판매량 조회. 지금은 브라우저별로 `cafe_orders`가 따로 존재해서(다른 사람/다른 기기의 주문을 서로 볼 수 없음) 전체 매출 집계 자체가 불가능함. 실제 DB(`prisma/schema.prisma`)로 옮겨서 주문이 한 곳에 쌓여야 의미 있는 통계가 나옴. DB 연결 시 `admin/index.js` 대시보드에 기간별 필터(일/주/월) + 매출 차트로 구현 예정.
