import { initAdminGuard } from "../js/auth.js";
initAdminGuard();
import { getMenus, getFeaturedMenuIds } from "../js/data.js";
import { formatPrice, formatDate, escapeHtml, getOrders } from "../js/utils.js";

const RECENT_COUNT = 5;

function renderStats(menus) {
  const orders = getOrders();
  const soldOutCount = menus.filter((m) => m.isSoldOut).length;
  const cookingCount = orders.filter((o) => o.status === "조리중").length;
  const revenue = orders
    .filter((o) => o.status !== "취소")
    .reduce((sum, o) => sum + o.total, 0);

  const stats = [
    { label: "전체 메뉴", value: `${menus.length}개`, sub: `품절 ${soldOutCount}개` },
    { label: "전체 주문", value: `${orders.length}건`, sub: `조리중 ${cookingCount}건` },
    { label: "누적 매출", value: formatPrice(revenue), sub: "취소 제외" },
  ];

  document.getElementById("stat-grid").innerHTML = stats
    .map(
      (stat) => `
    <div class="stat-card glass-card">
      <div class="stat-label">${stat.label}</div>
      <div class="stat-value">${stat.value}</div>
      <div class="stat-sub">${stat.sub}</div>
    </div>
  `
    )
    .join("");
}

function renderFeaturedMenus(menus, featuredIds) {
  const listEl = document.getElementById("featured-menus-list");

  if (featuredIds.length === 0) {
    listEl.innerHTML = `<p class="empty-state">아직 고른 추천 메뉴가 없어요. 자동으로 카테고리별 대표 메뉴가 노출됩니다.</p>`;
    return;
  }

  const featured = featuredIds.map((id) => menus.find((m) => m.id === id)).filter(Boolean);

  listEl.innerHTML = featured
    .map(
      (menu) => `
    <a class="featured-menu-chip ${menu.isSoldOut ? "is-soldout" : ""}" href="menus/detail.html?id=${menu.id}">
      ${escapeHtml(menu.name)}
      ${menu.isSoldOut ? `<span class="featured-menu-soldout">품절중</span>` : ""}
    </a>
  `
    )
    .join("");
}

function renderRecentOrders() {
  const orders = getOrders().slice().reverse().slice(0, RECENT_COUNT);
  const listEl = document.getElementById("recent-orders-list");

  if (orders.length === 0) {
    listEl.innerHTML = `<p class="empty-state">주문이 없습니다.</p>`;
    return;
  }

  listEl.innerHTML = orders
    .map(
      (order) => `
    <a class="recent-order-row" href="orders/detail.html?id=${order.id}">
      <div class="order-date">${formatDate(order.createdAt)}</div>
      <div class="order-summary">${escapeHtml(order.items[0].name)}${order.items.length > 1 ? ` 외 ${order.items.length - 1}건` : ""}</div>
      <div class="order-status">${order.status}</div>
      <div class="order-total">${formatPrice(order.total)}</div>
    </a>
  `
    )
    .join("");
}

async function init() {
  const [menus, featuredIds] = await Promise.all([getMenus(), getFeaturedMenuIds()]);
  renderStats(menus);
  renderFeaturedMenus(menus, featuredIds);
  renderRecentOrders();
}

init();
