/* ==========================================================================
   장바구니 담기 패널 — 메뉴 카드를 클릭하면 페이지 이동 없이
   우측에서 슬라이드로 나타나는 상세/담기 패널 (index.js, menus/list.js 공용)
   ========================================================================== */

import { getMenus, getOrders } from "./data.js";
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
let topOrderBtnEl;
let escHandler;
let trapHandler;
let lastFocusedEl;
// 패널에 열려있는 칸들 중 아직 "장바구니 담기"를 누르지 않은 것들을 추적한다.
// "바로 주문하기"를 누르면 이 목록을 순회하며 전부 장바구니에 담은 뒤 이동한다.
let openEntries = [];

function getFocusableEls() {
  return Array.from(
    overlayEl.querySelectorAll('button:not([disabled]), a[href], input, [tabindex]:not([tabindex="-1"])')
  ).filter((el) => el.offsetParent !== null);
}

function ensurePanel() {
  if (overlayEl) return;

  overlayEl = document.createElement("div");
  overlayEl.className = "cart-panel-overlay";
  overlayEl.innerHTML = `
    <aside class="cart-panel" role="dialog" aria-modal="true" aria-label="메뉴 담기">
      <button type="button" class="cart-panel-close" aria-label="닫기">✕</button>
      <a class="cart-panel-top-order-btn" href="basket/list.html">
        <span class="cart-panel-top-order-icon">🛍️</span>
        <span class="cart-panel-top-order-text">
          <span class="cart-panel-top-order-title">바로 주문하기</span>
          <span class="cart-panel-top-order-sub">지금 고른 메뉴도 담아서 이동</span>
        </span>
        <span class="cart-panel-top-order-arrow">→</span>
      </a>
      <p class="cart-panel-hint"><span class="cart-panel-hint-icon">💡</span>같은 메뉴도 다시 누르면 새 칸이 열려서, 온도/사이즈를 다르게 골라 따로따로 담을 수 있어요.</p>
      <div class="cart-panel-body"></div>
      <div class="cart-panel-summary"></div>
    </aside>
  `;
  document.body.appendChild(overlayEl);

  bodyEl = overlayEl.querySelector(".cart-panel-body");
  summaryEl = overlayEl.querySelector(".cart-panel-summary");
  topOrderBtnEl = overlayEl.querySelector(".cart-panel-top-order-btn");

  overlayEl.querySelector(".cart-panel-close").addEventListener("click", closeCartPanel);

  topOrderBtnEl.addEventListener("click", (e) => {
    e.preventDefault();
    openEntries.forEach(({ menu, entry, addBtn }) => {
      if (addBtn.disabled) return;
      addToCart(menu.id, entry.quantity, { temp: entry.temp, size: entry.size });
      markAsAdded(addBtn);
    });
    window.dispatchEvent(new CustomEvent("cart:updated"));
    window.location.href = topOrderBtnEl.href;
  });
}

// 한 번 담은 칸은 계속 눌러도 또 담기지 않도록 영구히 잠근다(수량을 더
// 담고 싶으면 +버튼으로 늘린 뒤 담아야 함). 다른 조합으로 새로 담고 싶으면
// 메뉴를 다시 눌러 새 칸을 열면 되고, 이 칸의 옵션을 바꾸면 그때만 다시 풀린다.
function markAsAdded(addBtn) {
  const originalLabel = addBtn.dataset.originalLabel || addBtn.textContent;
  addBtn.dataset.originalLabel = originalLabel;
  addBtn.textContent = "담았습니다 ✓";
  addBtn.disabled = true;
}

function renderRecommendationHtml(menu, allMenus, orders) {
  const ids = getFrequentlyBoughtWith(menu.id, orders, RECOMMEND_COUNT * 3);
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

async function renderSummary(basketHref) {
  const cart = getCart();

  if (cart.length === 0) {
    summaryEl.innerHTML = "";
    return;
  }

  const menus = await getMenus();
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
    <a class="cart-panel-summary-link cart-panel-order-btn" href="${basketHref}">주문하기 →</a>
  `;
}

export function closeCartPanel() {
  if (!overlayEl) return;
  overlayEl.classList.remove("is-open");
  document.body.classList.remove("cart-panel-open");
  document.removeEventListener("keydown", escHandler);
  document.removeEventListener("keydown", trapHandler);
  bodyEl.innerHTML = "";
  openEntries = [];
  if (lastFocusedEl) lastFocusedEl.focus();
}

// 메뉴를 누를 때마다(같은 메뉴라도) 새 칸을 하나씩 추가한다 — 온도/사이즈가
// 있는 메뉴는 "나는 아이스, 친구는 핫"처럼 같은 메뉴를 다른 옵션으로 여러 번
// 담아야 하는 경우가 흔해서, 한 칸을 재사용하면 옵션을 헷갈리기 쉽다.
export async function openCartPanel(menu, categoryName, basketHref = "basket/list.html") {
  ensurePanel();
  topOrderBtnEl.href = basketHref;

  const [allMenus, orders] = await Promise.all([getMenus(), getOrders()]);
  const itemEl = document.createElement("div");
  itemEl.className = `cart-panel-content cat-${menu.categoryId}`;
  itemEl.innerHTML = `
    <button type="button" class="cart-panel-remove-btn" aria-label="${escapeHtml(menu.name)} 칸 닫기" title="이 칸 닫기">✕</button>
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
    ${renderRecommendationHtml(menu, allMenus, orders)}
    `
    }
  `;
  bodyEl.prepend(itemEl);

  itemEl.querySelector(".cart-panel-remove-btn").addEventListener("click", () => {
    openEntries = openEntries.filter((e) => e.itemEl !== itemEl);
    itemEl.remove();
  });

  if (!menu.isSoldOut) {
    const qtyValueEl = itemEl.querySelector(".qty-value");
    const priceEl = itemEl.querySelector(".cart-panel-price");
    const addBtn = itemEl.querySelector(".cart-panel-add-btn");
    const entry = {
      quantity: 1,
      temp: menu.hasTempOption ? "ICE" : null,
      size: menu.hasSizeOption ? "REGULAR" : null,
    };
    openEntries.push({ itemEl, menu, entry, addBtn });

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

          // 옵션을 바꿨다는 건 이 칸을 다른 조합으로 새로 담고 싶다는 뜻이니,
          // 이미 담아서 잠겨있던 버튼이면 다시 누를 수 있게 풀어준다.
          if (addBtn.disabled) {
            addBtn.textContent = addBtn.dataset.originalLabel || "장바구니 담기";
            addBtn.disabled = false;
          }
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

    addBtn.addEventListener("click", async () => {
      addToCart(menu.id, entry.quantity, { temp: entry.temp, size: entry.size });
      markAsAdded(addBtn);
      window.dispatchEvent(new CustomEvent("cart:updated"));
      await renderSummary(basketHref);
      showToast(`${menu.name} 담았습니다`);
    });

    itemEl.querySelectorAll(".cart-panel-recommend-add").forEach((recBtn) => {
      recBtn.addEventListener("click", async () => {
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
        await renderSummary(basketHref);
      });
    });
  }

  await renderSummary(basketHref);

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
