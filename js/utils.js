/* ==========================================================================
   공통 유틸리티 — 포맷, DOM 헬퍼, 장바구니(Cart)
   ========================================================================== */

import { getMenuById } from "./data.js";

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

export const Cart = {
  getItems() {
    try {
      const raw = localStorage.getItem(CART_STORAGE_KEY);
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  },

  saveItems(items) {
    localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(items));
  },

  add(menuId, quantity = 1) {
    const items = this.getItems();
    const existing = items.find((item) => item.menuId === menuId);
    if (existing) {
      existing.quantity += quantity;
    } else {
      items.push({ menuId, quantity });
    }
    this.saveItems(items);
    return items;
  },

  updateQuantity(menuId, quantity) {
    let items = this.getItems();
    if (quantity <= 0) {
      items = items.filter((item) => item.menuId !== menuId);
    } else {
      const target = items.find((item) => item.menuId === menuId);
      if (target) target.quantity = quantity;
    }
    this.saveItems(items);
    return items;
  },

  remove(menuId) {
    const items = this.getItems().filter((item) => item.menuId !== menuId);
    this.saveItems(items);
    return items;
  },

  clear() {
    this.saveItems([]);
  },

  getCount() {
    return this.getItems().reduce((sum, item) => sum + item.quantity, 0);
  },

  getTotal() {
    return this.getItems().reduce((sum, item) => {
      const menu = getMenuById(item.menuId);
      return menu ? sum + menu.price * item.quantity : sum;
    }, 0);
  },
};
