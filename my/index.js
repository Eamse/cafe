import { getMenus } from "../js/data.js";
import {
  formatPrice,
  formatDate,
  escapeHtml,
  renderCartBadge,
  getOrders,
  getFavorites,
  lazyLoadBackgroundImages,
} from "../js/utils.js";

const RECENT_COUNT = 3;

function renderSummary(orders, favoriteCount) {
  const totalCount = orders.length;
  const totalAmount = orders.reduce((sum, order) => sum + order.total, 0);

  document.getElementById("summary-count").textContent = `${totalCount}건`;
  document.getElementById("summary-total").textContent = formatPrice(totalAmount);
  document.getElementById("summary-favorites").textContent = `${favoriteCount}개`;
}

function renderFavoriteMenus() {
  const listEl = document.getElementById("favorite-menus-list");
  const favoriteIds = getFavorites();

  if (favoriteIds.size === 0) {
    listEl.innerHTML = `<p class="empty-state">아직 즐겨찾기한 메뉴가 없습니다.</p>`;
    return 0;
  }

  const menus = getMenus().filter((menu) => favoriteIds.has(menu.id));

  if (menus.length === 0) {
    listEl.innerHTML = `<p class="empty-state">아직 즐겨찾기한 메뉴가 없습니다.</p>`;
    return 0;
  }

  listEl.innerHTML = menus
    .map(
      (menu) => `
    <a class="favorite-menu-card ${menu.isSoldOut ? "is-soldout" : ""}" href="../menus/detail.html?id=${menu.id}">
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
    <a class="recent-order-card ${order.status === "취소" ? "is-cancelled" : ""}" href="../orders/detail.html?id=${order.id}">
      <div class="order-date">${formatDate(order.createdAt)}</div>
      <div class="order-summary">${escapeHtml(order.items[0].name)}${order.items.length > 1 ? ` 외 ${order.items.length - 1}건` : ""}</div>
      <div class="order-status">${order.status}</div>
      <div class="order-total">${formatPrice(order.total)}</div>
    </a>
  `
    )
    .join("");
}

function init() {
  const orders = getOrders();
  const favoriteCount = renderFavoriteMenus();
  renderSummary(orders, favoriteCount);
  renderRecentOrders(orders);
  renderCartBadge();
}

init();
