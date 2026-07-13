/* ==========================================================================
   공통 유틸리티 — 포맷, DOM 헬퍼, 장바구니
   ========================================================================== */

const CART_STORAGE_KEY = 'cafe_cart';

// 이 파일은 항상 "<앱 루트>/js/utils.js"에 위치하므로, 여기서 한 단계 위로 올라가면
// 배포 위치(도메인 루트든 서브패스든)와 무관하게 실제 앱 루트 URL을 구할 수 있다.
// window.location.href = "/admin/login.html" 같은 절대경로 리다이렉트는 앱이
// 도메인 루트가 아닌 서브패스에 배포되면 깨지므로, 런타임 리다이렉트/링크는
// 이 헬퍼로 앱 루트 기준 상대 경로를 계산해서 써야 한다.
const APP_ROOT_URL = new URL('../', import.meta.url);

export function appPath(path) {
  return new URL(path, APP_ROOT_URL).pathname;
}

// 관리자가 수동으로 "종료됨"을 켰거나, 종료 예정일(endDate)이 이미 지났으면
// 종료된 것으로 취급한다. 화면에 표시할 때는 항상 이 함수를 거쳐야 한다.
// (순수 함수라 js/data.js의 Supabase 호출과 분리해 여기 둔다 — 네트워크 없이 단위 테스트하려면 필요)
export function isEventEnded(event) {
  if (event.isEnded) return true;
  if (!event.endDate) return false;
  const today = new Date().toISOString().slice(0, 10);
  return event.endDate <= today;
}

/* ---------- 포맷 ---------- */

export function formatPrice(price) {
  return `${price.toLocaleString('ko-KR')}원`;
}

const HTML_ESCAPE_MAP = {
  '&': '&amp;',
  '<': '&lt;',
  '>': '&gt;',
  '"': '&quot;',
  "'": '&#39;',
};

export function escapeHtml(str) {
  return String(str).replace(/[&<>"']/g, (ch) => HTML_ESCAPE_MAP[ch]);
}

export function formatDate(date) {
  const d = date instanceof Date ? date : new Date(date);
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const dd = String(d.getDate()).padStart(2, '0');
  const hh = String(d.getHours()).padStart(2, '0');
  const min = String(d.getMinutes()).padStart(2, '0');
  return `${yyyy}.${mm}.${dd} ${hh}:${min}`;
}

export function generateId(prefix = 'id') {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

/* ---------- 이미지 업로드 ---------- */

// 관리자가 업로드한 사진 파일을 localStorage에 저장 가능한 data URL로 변환한다.
// 원본 사진(특히 폰 카메라 사진)은 몇 MB씩 되는 경우가 많아 그대로 저장하면
// localStorage 용량(브라우저당 5~10MB)을 몇 개만 등록해도 넘길 수 있으므로,
// 캔버스로 한 변의 최대 길이를 제한하고 JPEG로 재인코딩해 용량을 크게 줄인다.
export function readImageFileAsDataUrl(
  file,
  maxDimension = 800,
  quality = 0.82,
) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () =>
      reject(reader.error || new Error('파일을 읽을 수 없어요'));
    reader.onload = () => {
      const img = new Image();
      img.onerror = () => reject(new Error('이미지를 불러올 수 없어요'));
      img.onload = () => {
        let { width, height } = img;
        if (width > maxDimension || height > maxDimension) {
          const scale = maxDimension / Math.max(width, height);
          width = Math.round(width * scale);
          height = Math.round(height * scale);
        }
        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        canvas.getContext('2d').drawImage(img, 0, 0, width, height);
        resolve(canvas.toDataURL('image/jpeg', quality));
      };
      img.src = reader.result;
    };
    reader.readAsDataURL(file);
  });
}

/* ---------- DOM 헬퍼 ---------- */

export function qs(selector, scope = document) {
  return scope.querySelector(selector);
}

export function qsa(selector, scope = document) {
  return Array.from(scope.querySelectorAll(selector));
}

// 화면 하단에 잠깐 떴다 사라지는 공용 알림. "담았습니다 ✓"처럼 버튼 텍스트를
// 임시로 바꾸던 여러 곳의 피드백 방식을 하나로 통일한다.
let toastTimer = null;

export function showToast(message, { type = 'success', duration = 2200 } = {}) {
  let container = document.querySelector('.toast-container');
  if (!container) {
    container = document.createElement('div');
    container.className = 'toast-container';
    document.body.appendChild(container);
  }

  container.innerHTML = '';
  const toast = document.createElement('div');
  toast.className = `toast ${type === 'error' ? 'toast-error' : ''}`;
  toast.textContent = message;
  container.appendChild(toast);

  requestAnimationFrame(() => toast.classList.add('is-visible'));

  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => {
    toast.classList.remove('is-visible');
    setTimeout(() => toast.remove(), 250);
  }, duration);
}

// 카드 이미지를 즉시 다 불러오지 않고, 화면에 가까워질 때만 background-image를
// 채워 넣는다. 카드 HTML은 style 대신 data-bg="URL"로 렌더링하고, 렌더링 직후
// 이 함수를 호출하면 된다.
export function lazyLoadBackgroundImages(root = document) {
  const targets = qsa('[data-bg]:not([data-bg-loaded])', root);
  if (targets.length === 0) return;

  const load = (el) => {
    if (el.dataset.bg) el.style.backgroundImage = `url('${el.dataset.bg}')`;
    el.dataset.bgLoaded = 'true';
  };

  if (!('IntersectionObserver' in window)) {
    targets.forEach(load);
    return;
  }

  const observer = new IntersectionObserver(
    (entries, obs) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        load(entry.target);
        obs.unobserve(entry.target);
      });
    },
    { rootMargin: '200px' },
  );

  targets.forEach((el) => observer.observe(el));
}

/* ---------- 장바구니 ---------- */

export function getCart() {
  try {
    const raw = localStorage.getItem(CART_STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function saveCart(items) {
  localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(items));
}

// 같은 메뉴라도 온도/사이즈 옵션이 다르면 서로 다른 장바구니 줄(line)로 취급해야
// 해서, menuId만으로는 항목을 특정할 수 없다. temp/size까지 합쳐 하나의 키로 본다.
export function getCartLineKey(menuId, temp, size) {
  return `${menuId}::${temp || ''}::${size || ''}`;
}

export function addToCart(menuId, quantity = 1, options = {}) {
  const { temp = null, size = null } = options;
  const items = getCart();
  const key = getCartLineKey(menuId, temp, size);
  const existing = items.find(
    (item) => getCartLineKey(item.menuId, item.temp, item.size) === key,
  );
  if (existing) {
    existing.quantity += quantity;
  } else {
    items.push({ menuId, quantity, temp, size });
  }
  saveCart(items);
  return items;
}

export function updateCartQuantity(menuId, quantity, options = {}) {
  const { temp = null, size = null } = options;
  const key = getCartLineKey(menuId, temp, size);
  let items = getCart();
  if (quantity <= 0) {
    items = items.filter(
      (item) => getCartLineKey(item.menuId, item.temp, item.size) !== key,
    );
  } else {
    const target = items.find(
      (item) => getCartLineKey(item.menuId, item.temp, item.size) === key,
    );
    if (target) target.quantity = quantity;
  }
  saveCart(items);
  return items;
}

export function removeFromCart(menuId, options = {}) {
  const { temp = null, size = null } = options;
  const key = getCartLineKey(menuId, temp, size);
  const items = getCart().filter(
    (item) => getCartLineKey(item.menuId, item.temp, item.size) !== key,
  );
  saveCart(items);
  return items;
}

// 사이즈 업차지까지 반영한 실제 단가.
export function getMenuUnitPrice(menu, options = {}) {
  const upcharge =
    options.size === 'LARGE' ? Number(menu.sizeUpcharge) || 0 : 0;
  return menu.price + upcharge;
}

export const DESSERT_DRINK_DISCOUNT = 500;

// "디저트 + 음료를 같은 장바구니에 담으면 디저트를 500원 할인" 규칙의 판정 기준.
// 카테고리 체계가 coffee/tea/ade/dessert 뿐이라 "dessert가 아니면 음료"로 본다
// (어드민이 새 카테고리를 추가해도 디저트로 지정하지 않는 한 음료 취급).
export function isDessertMenu(menu) {
  return menu.categoryId === 'dessert';
}

export function cartHasDrink(cart, menus) {
  return cart.some((item) => {
    const menu = menus.find((m) => m.id === item.menuId);
    return menu && !isDessertMenu(menu);
  });
}

const TEMP_OPTION_LABEL = { ICE: '아이스', HOT: '핫' };
const SIZE_OPTION_LABEL = { REGULAR: '레귤러', LARGE: '라지' };
const DINE_TYPE_LABEL = { takeout: '포장(테이크아웃)', 'eat-in': '매장에서 먹고 가기' };

// 매장 수령 주문의 dineType(포장/매장취식)을 표시용 문자열로. 배달 주문이거나
// 값이 없으면 빈 문자열(주문 시점 기준이 아닌 옛 주문 호환을 위해 필수는 아님).
export function formatDineType(dineType) {
  return dineType ? DINE_TYPE_LABEL[dineType] || dineType : '';
}

// 장바구니/주문 항목에 저장된 temp/size를 "아이스 · 라지" 같은 표시용 문자열로.
export function formatItemOptions(item) {
  const parts = [];
  if (item.temp) parts.push(TEMP_OPTION_LABEL[item.temp] || item.temp);
  if (item.size) parts.push(SIZE_OPTION_LABEL[item.size] || item.size);
  return parts.join(' · ');
}

// 장바구니 한 줄(cart item)의 실제 결제 단가 — 사이즈 업차지 반영 후,
// 디저트+음료 동시 주문 할인까지 뺀 값(0원 밑으로는 내려가지 않음).
export function getEffectiveUnitPrice(menu, item, hasDrinkInCart) {
  const unitPrice = getMenuUnitPrice(menu, item);
  if (isDessertMenu(menu) && hasDrinkInCart) {
    return Math.max(0, unitPrice - DESSERT_DRINK_DISCOUNT);
  }
  return unitPrice;
}

export function clearCart() {
  saveCart([]);
}

export function renderCartBadge() {
  const badge = document.getElementById('cart-badge');
  if (!badge) return;
  const count = getCart().reduce((sum, item) => sum + item.quantity, 0);

  if (count === 0) {
    badge.hidden = true;
    return;
  }

  badge.hidden = false;
  badge.textContent = count > 99 ? '99+' : String(count);
}

/* ---------- 주문 ---------- */

const ORDERS_STORAGE_KEY = 'cafe_orders';

export const ORDER_STATUSES = ['주문완료', '조리중', '수령완료', '취소'];

// 관리자가 주문을 "수락"(주문완료 → 조리중 이상으로 진행)하면 더 이상 취소를
// 선택할 수 없도록, 현재 상태 기준으로 고를 수 있는 상태 목록만 반환한다.
export function getAvailableStatuses(currentStatus) {
  const allowed =
    currentStatus === '주문완료'
      ? ORDER_STATUSES
      : ORDER_STATUSES.filter((status) => status !== '취소');
  if (!allowed.includes(currentStatus)) allowed.push(currentStatus);
  return allowed;
}

const BARCODE_COUNTER_KEY = 'cafe_barcode_counter';

// 매장 수령 주문에 발급하는 픽업 바코드 번호 — 절대 겹치면 안 되므로, 주문
// id와는 별개로 오직 한 방향으로만 증가하는 카운터를 따로 둔다(주문이 취소·
// 삭제되어도 이미 발급된 번호는 재사용하지 않음).
export function getNextBarcodeNumber() {
  const current = Number(localStorage.getItem(BARCODE_COUNTER_KEY)) || 0;
  const next = current + 1;
  localStorage.setItem(BARCODE_COUNTER_KEY, String(next));
  return next;
}

// 바코드 번호를 "BC-000123" 형태로 통일해서 보여준다.
export function formatBarcodeNumber(number) {
  return `BC-${String(number).padStart(6, '0')}`;
}

// 실제 스캔되는 바코드는 아니고, 번호마다 막대 굵기가 달라지는 장식용
// 패턴 — 화면에 "바코드처럼" 보이게 하는 용도. 같은 번호는 항상 같은
// 패턴을 만들어낸다.
export function renderBarcodeBarsHtml(number) {
  // 숫자를 여러 자리로 늘려 얇은 줄이 여러 개 있는 실제 바코드에 가깝게 보이게 한다.
  const seed =
    String(number).padStart(6, '0') + String(number * 7 + 13).padStart(6, '0');
  const digits = seed.split('').map(Number);
  const bars = digits
    .map((d, i) => {
      const isBlack = i % 2 === 0;
      const width = isBlack ? 1 + (d % 3) : 1;
      return `<span class="barcode-bar ${isBlack ? 'is-black' : ''}" style="flex-grow:${width}"></span>`;
    })
    .join('');
  return `<div class="barcode-bars" aria-hidden="true">${bars}</div>`;
}

export function getOrders() {
  try {
    const raw = localStorage.getItem(ORDERS_STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function saveOrders(orders) {
  localStorage.setItem(ORDERS_STORAGE_KEY, JSON.stringify(orders));
}

export function getOrderById(orderId) {
  return getOrders().find((order) => order.id === orderId) || null;
}

export function updateOrderStatus(orderId, status) {
  const orders = getOrders();
  const target = orders.find((order) => order.id === orderId);
  if (target) target.status = status;
  saveOrders(orders);
  return orders;
}

// 고객이 직접 취소할 때 사유를 함께 남긴다. 관리자 쪽 상태 변경(updateOrderStatus)과는
// 별도 경로 — 취소는 항상 사유가 있어야 하므로 한 함수로 묶어 누락을 방지한다.
// 취소는 오직 "주문완료" 상태에서만 허용한다 — 관리자가 이미 조리를 시작한
// (또는 그 이후로 넘긴) 주문은 여기서도 다시 한번 막아서, 취소 버튼이 그려진
// 뒤 화면을 새로고침하지 않은 채로 눌러도 실제로는 취소되지 않도록 한다.
export function cancelOrderWithReason(orderId, reason) {
  const orders = getOrders();
  const target = orders.find((order) => order.id === orderId);
  if (!target || target.status !== '주문완료') {
    return { ok: false };
  }
  target.status = '취소';
  target.cancelReason = reason;
  saveOrders(orders);
  return { ok: true };
}

/* ---------- 수령자 정보 ---------- */

const RECIPIENT_KEY = 'cafe_recipient_info';

// 마지막으로 입력한 수령자 정보를 기억해서, 다음 주문 때 자동으로 채워준다
// (매번 이름/연락처/주소를 새로 입력하지 않도록).
export function getLastRecipientInfo() {
  try {
    return JSON.parse(localStorage.getItem(RECIPIENT_KEY)) || null;
  } catch {
    return null;
  }
}

export function saveLastRecipientInfo(info) {
  localStorage.setItem(RECIPIENT_KEY, JSON.stringify(info));
}

/* ---------- 닉네임 ---------- */

const NICKNAME_KEY = 'cafe_nickname';

export function getNickname() {
  return localStorage.getItem(NICKNAME_KEY) || '';
}

export function saveNickname(name) {
  const trimmed = name.trim();
  if (trimmed) localStorage.setItem(NICKNAME_KEY, trimmed);
  else localStorage.removeItem(NICKNAME_KEY);
  return trimmed;
}

// 담긴/주문된 메뉴 총 수량 기준 예상 준비 시간(분) 범위. 카운트다운 계산에도 재사용.
export function getPickupEstimateRange(totalQuantity) {
  const min = 5 + totalQuantity * 1;
  const max = min + 5;
  return { min, max };
}

// 예상 준비 시간 문구. basket(체크아웃 전)과 orders(체크아웃 후 확인)가
// 공용으로 사용해 문구·계산식을 하나로 유지한다.
export function estimatePickupMinutes(totalQuantity) {
  const { min, max } = getPickupEstimateRange(totalQuantity);
  return `예상 준비 시간: 약 ${min}~${max}분`;
}

// 아직 픽업 전(주문완료/조리중)인 주문의 예상 준비 시각이 지났으면 true.
// 홈 화면의 "픽업 준비됐어요" 알림 배너가 이 함수로 판단한다.
export function isOrderReadyForPickup(order) {
  if (order.status !== '주문완료' && order.status !== '조리중') return false;
  const totalQuantity = order.items.reduce(
    (sum, item) => sum + item.quantity,
    0,
  );
  const { min, max } = getPickupEstimateRange(totalQuantity);
  const avgMinutes = (min + max) / 2;
  const targetTime = new Date(order.createdAt).getTime() + avgMinutes * 60000;
  return Date.now() >= targetTime;
}

// 특정 메뉴와 실제로 함께 주문된 적 있는 다른 메뉴 id를 빈도순으로 반환.
// menus/detail.js(상세 추천), js/cartPanel.js(담기 패널 미니 추천)가 공용으로 사용.
export function getFrequentlyBoughtWith(menuId, limit = 4) {
  const counts = {};
  getOrders().forEach((order) => {
    const menuIds = order.items.map((item) => item.menuId);
    if (!menuIds.includes(menuId)) return;
    menuIds.forEach((id) => {
      if (id === menuId) return;
      counts[id] = (counts[id] || 0) + 1;
    });
  });

  return Object.entries(counts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, limit)
    .map(([id]) => Number(id));
}

const ORDER_PROGRESS_STEPS = ['주문완료', '조리중', '수령완료'];

// 주문 상태를 진행 단계 표시줄(HTML)로 렌더링. 취소된 주문은 단계 대신 배너로 보여줌.
// 고객(orders/detail.js)과 관리자(admin/orders/detail.js) 양쪽에서 공용으로 사용.
export function renderStatusSteps(status) {
  if (status === '취소') {
    return `<div class="status-cancelled-banner">이 주문은 취소되었습니다</div>`;
  }

  const currentIndex = ORDER_PROGRESS_STEPS.indexOf(status);

  return `
    <ol class="status-steps">
      ${ORDER_PROGRESS_STEPS.map((step, index) => {
        const state =
          index < currentIndex
            ? 'done'
            : index === currentIndex
              ? 'active'
              : '';
        return `<li class="${state}">${step}</li>`;
      }).join('')}
    </ol>
  `;
}

/* ---------- 즐겨찾기 ---------- */

const FAVORITES_KEY = 'cafe_favorites';

export function getFavorites() {
  try {
    return new Set(JSON.parse(localStorage.getItem(FAVORITES_KEY)) || []);
  } catch {
    return new Set();
  }
}

export function toggleFavorite(menuId) {
  const favorites = getFavorites();
  if (favorites.has(menuId)) favorites.delete(menuId);
  else favorites.add(menuId);
  localStorage.setItem(FAVORITES_KEY, JSON.stringify([...favorites]));
  return favorites;
}

export function clearFavorites() {
  localStorage.removeItem(FAVORITES_KEY);
}

/* ---------- 다크/라이트 테마 토글 ---------- */

const THEME_KEY = 'cafe_theme';

export function getTheme() {
  return localStorage.getItem(THEME_KEY) || 'dark';
}

export function applyTheme(theme) {
  document.documentElement.dataset.theme = theme;
  localStorage.setItem(THEME_KEY, theme);
}

// 헤더의 테마 토글 버튼을 초기화한다. 각 페이지 <head>에 이미
// `document.documentElement.dataset.theme = localStorage.getItem("cafe_theme") || "dark"`
// 를 넣어둔 인라인 스크립트가 있어서(깜빡임 방지), 여기서는 버튼 라벨/이벤트만 연결한다.
export function initThemeToggle(buttonId = 'theme-toggle-btn') {
  const btn = document.getElementById(buttonId);
  if (!btn) return;

  btn.setAttribute('role', 'switch');

  const updateState = (theme) => {
    btn.classList.toggle('is-dark', theme === 'dark');
    btn.setAttribute('aria-checked', theme === 'dark' ? 'true' : 'false');
    btn.setAttribute(
      'aria-label',
      theme === 'dark' ? '라이트 모드로 전환' : '다크 모드로 전환',
    );
  };

  updateState(getTheme());

  btn.addEventListener('click', () => {
    const next = getTheme() === 'dark' ? 'light' : 'dark';
    applyTheme(next);
    updateState(next);
  });
}

/* ---------- 최근 검색어 ---------- */

const RECENT_SEARCHES_KEY = 'cafe_recent_searches';
const RECENT_SEARCHES_MAX = 6;

export function getRecentSearches() {
  try {
    return JSON.parse(localStorage.getItem(RECENT_SEARCHES_KEY)) || [];
  } catch {
    return [];
  }
}

export function addRecentSearch(term) {
  const trimmed = term.trim();
  if (!trimmed) return getRecentSearches();

  const list = getRecentSearches().filter((t) => t !== trimmed);
  list.unshift(trimmed);
  const sliced = list.slice(0, RECENT_SEARCHES_MAX);
  localStorage.setItem(RECENT_SEARCHES_KEY, JSON.stringify(sliced));
  return sliced;
}

export function removeRecentSearch(term) {
  const list = getRecentSearches().filter((t) => t !== term);
  localStorage.setItem(RECENT_SEARCHES_KEY, JSON.stringify(list));
  return list;
}
