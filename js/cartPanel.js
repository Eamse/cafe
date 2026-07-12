/* ==========================================================================
   장바구니 담기 패널 — 메뉴 카드를 클릭하면 페이지 이동 없이
   우측에서 슬라이드로 나타나는 상세/담기 패널 (index.js, menus/list.js 공용)
   ========================================================================== */

import { getMenus } from "./data.js";
import {
  formatPrice,
  escapeHtml,
  addToCart,
  getCart,
  getFrequentlyBoughtWith,
  showToast,
  getMenuUnitPrice,
  getEffectiveUnitPrice,
  cartHasDrink,
} from "./utils.js";

const RECOMMEND_COUNT = 2;

function renderOptionPickerHtml(menu) {
  if (!menu.hasTempOption && !menu.hasSizeOption) return "";
  const upcharge = Number(menu.sizeUpcharge) || 0;

  return `
    <div class="cart-panel-options">
      ${
        menu.hasTempOption
          ? `
      <div class="cart-panel-option-group" data-option="temp">
        <span class="cart-panel-option-label">온도</span>
        <div class="cart-panel-option-buttons">
          <button type="button" class="cart-panel-option-btn is-selected" data-value="ICE">아이스</button>
          <button type="button" class="cart-panel-option-btn" data-value="HOT">핫</button>
        </div>
      </div>`
          : ""
      }
      ${
        menu.hasSizeOption
          ? `
      <div class="cart-panel-option-group" data-option="size">
        <span class="cart-panel-option-label">사이즈</span>
        <div class="cart-panel-option-buttons">
          <button type="button" class="cart-panel-option-btn is-selected" data-value="REGULAR">레귤러</button>
          <button type="button" class="cart-panel-option-btn" data-value="LARGE">라지${upcharge > 0 ? ` (+${formatPrice(upcharge)})` : ""}</button>
        </div>
      </div>`
          : ""
      }
    </div>
  `;
}

let overlayEl;
let bodyEl;
let summaryEl;
let bulkBarEl;
let escHandler;
let trapHandler;
let lastFocusedEl;
const renderedMenuIds = new Set();

function getFocusableEls() {
  return Array.from(
    overlayEl.querySelectorAll('button:not([disabled]), a[href], input, [tabindex]:not([tabindex="-1"])')
  ).filter((el) => el.offsetParent !== null);
}

// menuId -> { quantity, itemEl, addBtn, qtyValueEl } — 아직 "장바구니 담기"를
// 누르지 않은, 패널에 떠 있는 항목들. "전체 담기"가 이 목록을 한 번에 처리한다.
const pendingItems = new Map();

function ensurePanel() {
  if (overlayEl) return;

  overlayEl = document.createElement("div");
  overlayEl.className = "cart-panel-overlay";
  overlayEl.innerHTML = `
    <aside class="cart-panel" role="dialog" aria-modal="true" aria-label="메뉴 담기">
      <button type="button" class="cart-panel-close" aria-label="닫기">✕</button>
      <p class="cart-panel-hint">다른 메뉴도 계속 눌러서 담을 수 있어요.</p>
      <div class="cart-panel-bulk-bar" hidden>
        <span class="cart-panel-bulk-count"></span>
        <button type="button" class="cart-panel-bulk-btn">전체 한번에 담기</button>
      </div>
      <div class="cart-panel-body"></div>
      <div class="cart-panel-summary"></div>
    </aside>
  `;
  document.body.appendChild(overlayEl);

  bodyEl = overlayEl.querySelector(".cart-panel-body");
  summaryEl = overlayEl.querySelector(".cart-panel-summary");
  bulkBarEl = overlayEl.querySelector(".cart-panel-bulk-bar");

  overlayEl.querySelector(".cart-panel-close").addEventListener("click", closeCartPanel);
  overlayEl.querySelector(".cart-panel-bulk-btn").addEventListener("click", () => addAllPending());
}

function updateBulkBar(basketHref) {
  const count = pendingItems.size;
  if (count === 0) {
    bulkBarEl.hidden = true;
    return;
  }
  bulkBarEl.hidden = false;
  bulkBarEl.querySelector(".cart-panel-bulk-count").textContent = `담을 메뉴 ${count}개`;
  bulkBarEl.querySelector(".cart-panel-bulk-btn").dataset.basketHref = basketHref;
}

function markAsAdded({ itemEl, addBtn }) {
  addBtn.textContent = "담았습니다 ✓";
  addBtn.disabled = true;
  itemEl.querySelector(".cart-panel-qty")?.classList.add("is-locked");
}

function addAllPending(basketHrefOverride) {
  if (pendingItems.size === 0) return;

  const basketHref =
    basketHrefOverride || bulkBarEl.querySelector(".cart-panel-bulk-btn").dataset.basketHref || "basket/list.html";

  const count = pendingItems.size;
  pendingItems.forEach((entry, menuId) => {
    addToCart(menuId, entry.quantity, { temp: entry.temp, size: entry.size });
    markAsAdded(entry);
  });
  pendingItems.clear();

  window.dispatchEvent(new CustomEvent("cart:updated"));
  updateBulkBar(basketHref);
  renderSummary(basketHref);
  showToast(`${count}개 메뉴를 장바구니에 담았습니다`);
}

function renderRecommendationHtml(menu, allMenus) {
  const ids = getFrequentlyBoughtWith(menu.id, RECOMMEND_COUNT * 3);
  const candidates = ids
    .map((id) => allMenus.find((m) => m.id === id && !m.isSoldOut))
    .filter(Boolean)
    .slice(0, RECOMMEND_COUNT);

  if (candidates.length === 0) return "";

  return `
    <div class="cart-panel-recommend">
      <p class="cart-panel-recommend-title">함께 담으면 좋아요</p>
      <div class="cart-panel-recommend-list">
        ${candidates
          .map(
            (rec) => `
          <div class="cart-panel-recommend-item">
            <span class="cart-panel-recommend-name">${escapeHtml(rec.name)}</span>
            <span class="cart-panel-recommend-price">${formatPrice(rec.price)}</span>
            <button type="button" class="cart-panel-recommend-add" data-menu-id="${rec.id}">+ 담기</button>
          </div>
        `
          )
          .join("")}
      </div>
    </div>
  `;
}

function renderSummary(basketHref) {
  const cart = getCart();

  if (cart.length === 0) {
    summaryEl.innerHTML = "";
    return;
  }

  const menus = getMenus();
  const hasDrink = cartHasDrink(cart, menus);
  let total = 0;

  const rows = cart
    .map((item) => {
      const menu = menus.find((m) => m.id === item.menuId);
      if (!menu) return "";
      const unitPrice = getEffectiveUnitPrice(menu, item, hasDrink);
      total += unitPrice * item.quantity;
      return `
        <li>
          <span class="cart-panel-summary-name">${escapeHtml(menu.name)} × ${item.quantity}</span>
          <span class="cart-panel-summary-price">${formatPrice(unitPrice * item.quantity)}</span>
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
  document.body.classList.remove("cart-panel-open");
  document.removeEventListener("keydown", escHandler);
  document.removeEventListener("keydown", trapHandler);
  bodyEl.innerHTML = "";
  renderedMenuIds.clear();
  pendingItems.clear();
  bulkBarEl.hidden = true;
  if (lastFocusedEl) lastFocusedEl.focus();
}

export function openCartPanel(menu, categoryName, basketHref = "basket/list.html") {
  ensurePanel();

  if (!renderedMenuIds.has(menu.id)) {
    renderedMenuIds.add(menu.id);

    const allMenus = getMenus();
    const itemEl = document.createElement("div");
    itemEl.className = `cart-panel-content cat-${menu.categoryId}`;
    itemEl.innerHTML = `
      ${menu.image ? `<div class="cart-panel-image" style="background-image: url('${escapeHtml(menu.image)}')"></div>` : ""}
      <div class="cart-panel-category">${escapeHtml(categoryName)}</div>
      <h2 class="cart-panel-name">${escapeHtml(menu.name)}</h2>
      <div class="cart-panel-price">${formatPrice(menu.price)}</div>
      <p class="cart-panel-description">${escapeHtml(menu.description)}</p>
      ${
        menu.isSoldOut
          ? `<div class="cart-panel-sold-out">품절된 메뉴입니다</div>`
          : `
      ${renderOptionPickerHtml(menu)}
      <div class="cart-panel-qty">
        <button type="button" class="qty-decrease" aria-label="수량 감소">-</button>
        <span class="qty-value">1</span>
        <button type="button" class="qty-increase" aria-label="수량 증가">+</button>
      </div>
      <button type="button" class="cart-panel-add-btn">장바구니 담기</button>
      ${renderRecommendationHtml(menu, allMenus)}
      `
      }
    `;
    bodyEl.prepend(itemEl);

    if (!menu.isSoldOut) {
      const qtyValueEl = itemEl.querySelector(".qty-value");
      const priceEl = itemEl.querySelector(".cart-panel-price");
      const addBtn = itemEl.querySelector(".cart-panel-add-btn");
      const entry = {
        quantity: 1,
        itemEl,
        addBtn,
        qtyValueEl,
        temp: menu.hasTempOption ? "ICE" : null,
        size: menu.hasSizeOption ? "REGULAR" : null,
      };
      pendingItems.set(menu.id, entry);

      const updatePriceDisplay = () => {
        priceEl.textContent = formatPrice(getMenuUnitPrice(menu, entry));
      };

      itemEl.querySelectorAll(".cart-panel-option-group").forEach((group) => {
        const optionKey = group.dataset.option;
        group.querySelectorAll(".cart-panel-option-btn").forEach((btn) => {
          btn.addEventListener("click", () => {
            group.querySelectorAll(".cart-panel-option-btn").forEach((b) => b.classList.remove("is-selected"));
            btn.classList.add("is-selected");
            entry[optionKey] = btn.dataset.value;
            updatePriceDisplay();
          });
        });
      });

      itemEl.querySelector(".qty-decrease").addEventListener("click", () => {
        entry.quantity = Math.max(1, entry.quantity - 1);
        qtyValueEl.textContent = entry.quantity;
      });

      itemEl.querySelector(".qty-increase").addEventListener("click", () => {
        entry.quantity += 1;
        qtyValueEl.textContent = entry.quantity;
      });

      addBtn.addEventListener("click", () => {
        addToCart(menu.id, entry.quantity, { temp: entry.temp, size: entry.size });
        pendingItems.delete(menu.id);
        markAsAdded(entry);
        window.dispatchEvent(new CustomEvent("cart:updated"));
        updateBulkBar(basketHref);
        renderSummary(basketHref);
        showToast(`${menu.name} 담았습니다`);
      });

      itemEl.querySelectorAll(".cart-panel-recommend-add").forEach((recBtn) => {
        recBtn.addEventListener("click", () => {
          const recMenu = allMenus.find((m) => m.id === Number(recBtn.dataset.menuId));
          const recOptions = {
            temp: recMenu?.hasTempOption ? "ICE" : null,
            size: recMenu?.hasSizeOption ? "REGULAR" : null,
          };
          addToCart(Number(recBtn.dataset.menuId), 1, recOptions);
          recBtn.textContent = "담음 ✓";
          recBtn.disabled = true;
          showToast("장바구니에 담았습니다");
          window.dispatchEvent(new CustomEvent("cart:updated"));
          renderSummary(basketHref);
        });
      });
    }
  }

  updateBulkBar(basketHref);
  renderSummary(basketHref);

  const wasOpen = overlayEl.classList.contains("is-open");
  overlayEl.classList.add("is-open");
  document.body.classList.add("cart-panel-open");

  if (!wasOpen) {
    lastFocusedEl = document.activeElement;
    const closeBtn = overlayEl.querySelector(".cart-panel-close");
    closeBtn.focus();
  }

  document.removeEventListener("keydown", escHandler);
  document.removeEventListener("keydown", trapHandler);

  escHandler = (e) => {
    if (e.key === "Escape") closeCartPanel();
  };

  trapHandler = (e) => {
    if (e.key !== "Tab") return;
    const focusable = getFocusableEls();
    if (focusable.length === 0) return;
    const first = focusable[0];
    const last = focusable[focusable.length - 1];

    if (e.shiftKey && document.activeElement === first) {
      e.preventDefault();
      last.focus();
    } else if (!e.shiftKey && document.activeElement === last) {
      e.preventDefault();
      first.focus();
    }
  };

  document.addEventListener("keydown", escHandler);
  document.addEventListener("keydown", trapHandler);
}
