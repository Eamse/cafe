/* ==========================================================================
   장바구니 담기 패널 — 메뉴 카드를 클릭하면 페이지 이동 없이
   우측에서 슬라이드로 나타나는 상세/담기 패널 (index.js, menus/list.js 공용)
   ========================================================================== */

import { getMenus } from "./data.js";
import { formatPrice, escapeHtml, addToCart, getCart } from "./utils.js";

let overlayEl;
let bodyEl;
let summaryEl;
let escHandler;
const renderedMenuIds = new Set();

function ensurePanel() {
  if (overlayEl) return;

  overlayEl = document.createElement("div");
  overlayEl.className = "cart-panel-overlay";
  overlayEl.innerHTML = `
    <aside class="cart-panel" role="dialog" aria-modal="true" aria-label="메뉴 담기">
      <button type="button" class="cart-panel-close" aria-label="닫기">✕</button>
      <p class="cart-panel-hint">다른 메뉴도 계속 눌러서 담을 수 있어요.</p>
      <div class="cart-panel-body"></div>
      <div class="cart-panel-summary"></div>
    </aside>
  `;
  document.body.appendChild(overlayEl);

  bodyEl = overlayEl.querySelector(".cart-panel-body");
  summaryEl = overlayEl.querySelector(".cart-panel-summary");

  overlayEl.querySelector(".cart-panel-close").addEventListener("click", closeCartPanel);
}

function renderSummary(basketHref) {
  const cart = getCart();

  if (cart.length === 0) {
    summaryEl.innerHTML = "";
    return;
  }

  const menus = getMenus();
  let total = 0;

  const rows = cart
    .map((item) => {
      const menu = menus.find((m) => m.id === item.menuId);
      if (!menu) return "";
      total += menu.price * item.quantity;
      return `
        <li>
          <span class="cart-panel-summary-name">${escapeHtml(menu.name)} × ${item.quantity}</span>
          <span class="cart-panel-summary-price">${formatPrice(menu.price * item.quantity)}</span>
        </li>
      `;
    })
    .join("");

  summaryEl.innerHTML = `
    <div class="cart-panel-summary-title">지금까지 담은 메뉴 (${cart.length})</div>
    <ul class="cart-panel-summary-list">${rows}</ul>
    <div class="cart-panel-summary-total">총 금액 ${formatPrice(total)}</div>
    <a class="cart-panel-summary-link" href="${basketHref}">장바구니 보기 →</a>
  `;
}

export function closeCartPanel() {
  if (!overlayEl) return;
  overlayEl.classList.remove("is-open");
  document.removeEventListener("keydown", escHandler);
  bodyEl.innerHTML = "";
  renderedMenuIds.clear();
}

export function openCartPanel(menu, categoryName, basketHref = "basket/list.html") {
  ensurePanel();

  if (!renderedMenuIds.has(menu.id)) {
    renderedMenuIds.add(menu.id);

    const itemEl = document.createElement("div");
    itemEl.className = `cart-panel-content cat-${menu.categoryId}`;
    itemEl.innerHTML = `
      ${menu.image ? `<div class="cart-panel-image" style="background-image: url('${menu.image}')"></div>` : ""}
      <div class="cart-panel-category">${escapeHtml(categoryName)}</div>
      <h2 class="cart-panel-name">${escapeHtml(menu.name)}</h2>
      <div class="cart-panel-price">${formatPrice(menu.price)}</div>
      <p class="cart-panel-description">${escapeHtml(menu.description)}</p>
      ${
        menu.isSoldOut
          ? `<div class="cart-panel-sold-out">품절된 메뉴입니다</div>`
          : `
      <div class="cart-panel-qty">
        <button type="button" class="qty-decrease" aria-label="수량 감소">-</button>
        <span class="qty-value">1</span>
        <button type="button" class="qty-increase" aria-label="수량 증가">+</button>
      </div>
      <button type="button" class="cart-panel-add-btn">장바구니 담기</button>
      `
      }
    `;
    bodyEl.prepend(itemEl);

    if (!menu.isSoldOut) {
      let quantity = 1;
      const qtyValueEl = itemEl.querySelector(".qty-value");
      const addBtn = itemEl.querySelector(".cart-panel-add-btn");

      itemEl.querySelector(".qty-decrease").addEventListener("click", () => {
        quantity = Math.max(1, quantity - 1);
        qtyValueEl.textContent = quantity;
      });

      itemEl.querySelector(".qty-increase").addEventListener("click", () => {
        quantity += 1;
        qtyValueEl.textContent = quantity;
      });

      addBtn.addEventListener("click", () => {
        addToCart(menu.id, quantity);
        window.dispatchEvent(new CustomEvent("cart:updated"));
        renderSummary(basketHref);
        addBtn.textContent = "담았습니다 ✓";
        addBtn.disabled = true;
      });
    }
  }

  renderSummary(basketHref);
  overlayEl.classList.add("is-open");

  escHandler = (e) => {
    if (e.key === "Escape") closeCartPanel();
  };
  document.addEventListener("keydown", escHandler);
}
