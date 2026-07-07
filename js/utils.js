/* ==========================================================================
   공통 유틸리티 — 포맷, DOM 헬퍼, 장바구니
   ========================================================================== */

const CART_STORAGE_KEY = "cafe_cart";

/* ---------- 포맷 ---------- */

export function formatPrice(price) {
  return `${price.toLocaleString("ko-KR")}원`;
}

export function formatDate(date) {
  const d = date instanceof Date ? date : new Date(date);
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  const hh = String(d.getHours()).padStart(2, "0");
  const min = String(d.getMinutes()).padStart(2, "0");
  return `${yyyy}.${mm}.${dd} ${hh}:${min}`;
}

export function generateId(prefix = "id") {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

/* ---------- DOM 헬퍼 ---------- */

export function qs(selector, scope = document) {
  return scope.querySelector(selector);
}

export function qsa(selector, scope = document) {
  return Array.from(scope.querySelectorAll(selector));
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

export function addToCart(menuId, quantity = 1) {
  const items = getCart();
  const existing = items.find((item) => item.menuId === menuId);
  if (existing) {
    existing.quantity += quantity;
  } else {
    items.push({ menuId, quantity });
  }
  saveCart(items);
  return items;
}

export function updateCartQuantity(menuId, quantity) {
  let items = getCart();
  if (quantity <= 0) {
    items = items.filter((item) => item.menuId !== menuId);
  } else {
    const target = items.find((item) => item.menuId === menuId);
    if (target) target.quantity = quantity;
  }
  saveCart(items);
  return items;
}

export function removeFromCart(menuId) {
  const items = getCart().filter((item) => item.menuId !== menuId);
  saveCart(items);
  return items;
}

export function clearCart() {
  saveCart([]);
}

/* ---------- 주문 ---------- */

const ORDERS_STORAGE_KEY = "cafe_orders";

export const ORDER_STATUSES = ["주문완료", "조리중", "수령완료", "취소"];

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
