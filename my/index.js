import { getMenus } from "../js/data.js";
import {
  formatPrice,
  formatDate,
  escapeHtml,
  renderCartBadge,
  getOrders,
  getFavorites,
  clearFavorites,
  lazyLoadBackgroundImages,
  getNickname,
  saveNickname,
  initThemeToggle,
} from "../js/utils.js";

const RECENT_COUNT = 3;

function renderProfileName() {
  const nickname = getNickname();
  document.getElementById("profile-name").textContent = nickname ? `${nickname}님` : "게스트님";
}

function initProfileNameEditor() {
  const nameEl = document.getElementById("profile-name");
  const editBtn = document.getElementById("profile-name-edit-btn");
  const form = document.getElementById("profile-name-form");
  const input = document.getElementById("profile-name-input");
  const cancelBtn = document.getElementById("profile-name-cancel");

  editBtn.addEventListener("click", () => {
    input.value = getNickname();
    nameEl.hidden = true;
    editBtn.hidden = true;
    form.hidden = false;
    input.focus();
  });

  cancelBtn.addEventListener("click", () => {
    form.hidden = true;
    nameEl.hidden = false;
    editBtn.hidden = false;
  });

  form.addEventListener("submit", (event) => {
    event.preventDefault();
    saveNickname(input.value);
    renderProfileName();
    form.hidden = true;
    nameEl.hidden = false;
    editBtn.hidden = false;
  });
}

function renderSummary(orders, favoriteCount) {
  const totalCount = orders.length;
  const totalAmount = orders.reduce((sum, order) => sum + order.total, 0);

  document.getElementById("summary-count").textContent = `${totalCount}건`;
  document.getElementById("summary-total").textContent = formatPrice(totalAmount);
  document.getElementById("summary-favorites").textContent = `${favoriteCount}개`;
}

function renderFavoriteMenus() {
  const listEl = document.getElementById("favorite-menus-list");
  const clearBtn = document.getElementById("clear-favorites-btn");
  const favoriteIds = getFavorites();

  if (favoriteIds.size === 0) {
    listEl.innerHTML = `<p class="empty-state">아직 즐겨찾기한 메뉴가 없습니다.</p>`;
    clearBtn.hidden = true;
    return 0;
  }

  const menus = getMenus().filter((menu) => favoriteIds.has(menu.id));

  if (menus.length === 0) {
    listEl.innerHTML = `<p class="empty-state">아직 즐겨찾기한 메뉴가 없습니다.</p>`;
    clearBtn.hidden = true;
    return 0;
  }

  clearBtn.hidden = false;

  listEl.innerHTML = menus
    .map(
      (menu) => `
    <a class="favorite-menu-card ${menu.isSoldOut ? "is-soldout" : ""}" href="/menus/detail?id=${menu.id}">
      <div class="favorite-menu-image" data-bg="${escapeHtml(menu.image || "")}"></div>
      <div class="favorite-menu-name">${escapeHtml(menu.name)}</div>
      <div class="favorite-menu-price">${formatPrice(menu.price)}</div>
      ${menu.isSoldOut ? `<div class="favorite-menu-soldout">품절</div>` : ""}
    </a>
  `
    )
    .join("");

  lazyLoadBackgroundImages(listEl);

  return menus.length;
}

function renderRecentOrders(orders) {
  const listEl = document.getElementById("recent-orders-list");
  const recent = orders.slice().reverse().slice(0, RECENT_COUNT);

  if (recent.length === 0) {
    listEl.innerHTML = `<p class="empty-state">아직 주문 내역이 없습니다.</p>`;
    return;
  }

  listEl.innerHTML = recent
    .map(
      (order) => `
    <a class="recent-order-card ${order.status === "취소" ? "is-cancelled" : ""}" href="/orders/detail?id=${order.id}">
      <div class="order-date">${formatDate(order.createdAt)}</div>
      <div class="order-summary">${escapeHtml(order.items[0].name)}${order.items.length > 1 ? ` 외 ${order.items.length - 1}건` : ""}</div>
      <div class="order-status">${order.status}</div>
      <div class="order-total">${formatPrice(order.total)}</div>
    </a>
  `
    )
    .join("");
}

function refreshFavorites() {
  const favoriteCount = renderFavoriteMenus();
  renderSummary(getOrders(), favoriteCount);
}

function init() {
  renderProfileName();
  initProfileNameEditor();
  const orders = getOrders();
  const favoriteCount = renderFavoriteMenus();
  renderSummary(orders, favoriteCount);
  renderRecentOrders(orders);
  renderCartBadge();
  initThemeToggle();

  document.getElementById("clear-favorites-btn").addEventListener("click", () => {
    if (!confirm("즐겨찾기한 메뉴를 전부 삭제하시겠습니까?")) return;
    clearFavorites();
    refreshFavorites();
  });
}

init();
