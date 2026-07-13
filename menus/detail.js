import { getMenus, getCategories } from "../js/data.js";
import { renderAuthNav } from "../js/auth.js";
import {
  formatPrice,
  addToCart,
  escapeHtml,
  renderCartBadge,
  getFrequentlyBoughtWith,
  getFavorites,
  toggleFavorite,
  lazyLoadBackgroundImages,
  showToast,
  initThemeToggle,
  getMenuUnitPrice,
} from "../js/utils.js";
import { openCartPanel } from "../js/cartPanel.js";

const RECOMMEND_COUNT = 4;

let menusCache = [];
let categoriesCache = [];

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

function getCategoryName(categoryId) {
  const category = categoriesCache.find((c) => c.id === categoryId);
  return category ? category.name : categoryId;
}

// 실제 주문 데이터를 기준으로 "이 메뉴와 함께 주문된 메뉴"를 우선 추천한다.
// 주문 데이터가 부족하면 같은 카테고리 → 나머지 메뉴 순으로 채운다.
function getRecommendedMenus(currentMenu, allMenus) {
  const byCoOccurrence = getFrequentlyBoughtWith(currentMenu.id, allMenus.length);
  const isBasedOnOrders = byCoOccurrence.length > 0;
  const picked = [];
  const usedIds = new Set([currentMenu.id]);

  const addCandidates = (ids) => {
    ids.forEach((id) => {
      if (picked.length >= RECOMMEND_COUNT || usedIds.has(id)) return;
      const menu = allMenus.find((m) => m.id === id && !m.isSoldOut);
      if (!menu) return;
      picked.push(menu);
      usedIds.add(id);
    });
  };

  addCandidates(byCoOccurrence);

  const sameCategoryIds = allMenus
    .filter((m) => m.categoryId === currentMenu.categoryId && m.id !== currentMenu.id)
    .map((m) => m.id);
  addCandidates(sameCategoryIds);

  const restIds = allMenus.filter((m) => m.id !== currentMenu.id).map((m) => m.id);
  addCandidates(restIds);

  return { menus: picked, isBasedOnOrders };
}

function renderMoreMenus(currentMenu) {
  const grid = document.getElementById("more-menu-grid");
  const heading = document.getElementById("more-menu-heading");
  const { menus: recommended, isBasedOnOrders } = getRecommendedMenus(currentMenu, menusCache);

  heading.textContent = isBasedOnOrders ? "함께 주문하면 좋은 메뉴" : "다른 메뉴도 담아보세요";

  if (recommended.length === 0) {
    grid.innerHTML = "";
    return;
  }

  grid.innerHTML = recommended
    .map(
      (menu) => `
    <div class="menu-card cat-${menu.categoryId}" data-menu-id="${menu.id}" role="button" tabindex="0">
      <div class="menu-card-image-wrap">
        <div class="menu-card-image" data-bg="${escapeHtml(menu.image || "")}"></div>
      </div>
      <div class="menu-card-body">
        <div class="menu-name">${escapeHtml(menu.name)}</div>
        <div class="menu-category">${getCategoryName(menu.categoryId)}</div>
        <div class="menu-price">${formatPrice(menu.price)}</div>
      </div>
    </div>
  `
    )
    .join("");

  lazyLoadBackgroundImages(grid);

  grid.querySelectorAll(".menu-card[data-menu-id]").forEach((card) => {
    card.addEventListener("click", () => openOtherMenu(card));
    card.addEventListener("keydown", (e) => {
      if (e.key !== "Enter" && e.key !== " ") return;
      e.preventDefault();
      openOtherMenu(card);
    });
  });
}

function openOtherMenu(cardEl) {
  const menuId = Number(cardEl.dataset.menuId);
  const menu = menusCache.find((m) => m.id === menuId);
  if (!menu) return;
  openCartPanel(menu, getCategoryName(menu.categoryId), "../basket/list.html");
}

function renderMenuDetail() {
  const params = new URLSearchParams(window.location.search);
  const menuId = Number(params.get("id"));
  const menu = menusCache.find((m) => m.id === menuId);
  const container = document.getElementById("menu-detail");

  if (!menu) {
    container.innerHTML = `<p>메뉴를 찾을 수 없습니다.</p>`;
    return;
  }

  const isFavorite = getFavorites().has(menu.id);

  container.innerHTML = `
    <div class="detail-card cat-${menu.categoryId}">
      ${menu.image ? `<div class="detail-image" data-bg="${escapeHtml(menu.image)}"></div>` : ""}
      <button type="button" class="favorite-btn ${isFavorite ? "is-active" : ""}" id="detail-favorite-btn" aria-pressed="${isFavorite ? "true" : "false"}" aria-label="즐겨찾기 ${isFavorite ? "해제" : "추가"}">♥</button>
      <div class="menu-category">${getCategoryName(menu.categoryId)}</div>
      <h2 class="menu-name">${escapeHtml(menu.name)}</h2>
      <div class="menu-price">${formatPrice(menu.price)}</div>
      <p class="menu-description">${escapeHtml(menu.description)}</p>
      ${
        menu.isSoldOut
          ? `<div class="sold-out-badge">품절된 메뉴입니다</div>`
          : `
      ${renderOptionPickerHtml(menu)}
      <div class="quantity-control">
        <button type="button" id="qty-decrease" aria-label="수량 감소">-</button>
        <span id="qty-value">1</span>
        <button type="button" id="qty-increase" aria-label="수량 증가">+</button>
      </div>
      <button type="button" id="add-to-cart-btn" class="btn-add-cart">장바구니 담기</button>
      `
      }
    </div>
  `;

  lazyLoadBackgroundImages(container);
  renderMoreMenus(menu);

  document.getElementById("detail-favorite-btn").addEventListener("click", () => {
    toggleFavorite(menu.id);
    renderMenuDetail();
  });

  if (menu.isSoldOut) return;

  let quantity = 1;
  let selectedTemp = menu.hasTempOption ? "ICE" : null;
  let selectedSize = menu.hasSizeOption ? "REGULAR" : null;
  const qtyValueEl = document.getElementById("qty-value");
  const priceEl = container.querySelector(".menu-price");
  const addBtn = document.getElementById("add-to-cart-btn");

  container.querySelectorAll(".cart-panel-option-group").forEach((group) => {
    const optionKey = group.dataset.option;
    group.querySelectorAll(".cart-panel-option-btn").forEach((btn) => {
      btn.addEventListener("click", () => {
        group.querySelectorAll(".cart-panel-option-btn").forEach((b) => b.classList.remove("is-selected"));
        btn.classList.add("is-selected");
        if (optionKey === "temp") selectedTemp = btn.dataset.value;
        else selectedSize = btn.dataset.value;
        priceEl.textContent = formatPrice(getMenuUnitPrice(menu, { size: selectedSize }));
      });
    });
  });

  document.getElementById("qty-decrease").addEventListener("click", () => {
    quantity = Math.max(1, quantity - 1);
    qtyValueEl.textContent = quantity;
  });

  document.getElementById("qty-increase").addEventListener("click", () => {
    quantity += 1;
    qtyValueEl.textContent = quantity;
  });

  addBtn.addEventListener("click", () => {
    addToCart(menu.id, quantity, { temp: selectedTemp, size: selectedSize });
    renderCartBadge();
    showToast(`${menu.name} 담았습니다`);
    addBtn.textContent = "담았습니다 ✓";
    addBtn.disabled = true;
    setTimeout(() => {
      addBtn.textContent = "장바구니 담기";
      addBtn.disabled = false;
    }, 1200);
  });
}

window.addEventListener("cart:updated", renderCartBadge);

async function init() {
  [menusCache, categoriesCache] = await Promise.all([getMenus(), getCategories()]);
  renderMenuDetail();
  renderCartBadge();
  initThemeToggle();
  renderAuthNav();
}

init();
