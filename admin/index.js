import { initAdminGuard } from "../js/auth.js";
await initAdminGuard();
import { getMenus, getFeaturedMenuIds, getOrders } from "../js/data.js";
import { formatPrice, formatDate, escapeHtml } from "../js/utils.js";

const RECENT_COUNT = 5;

function renderStats(menus, orders) {
  const soldOutCount = menus.filter((m) => m.isSoldOut).length;
  const cookingCount = orders.filter((o) => o.status === "조리중").length;

  const stats = [
    { icon: "☕", tone: "menu", label: "전체 메뉴", value: `${menus.length}개`, sub: `품절 ${soldOutCount}개` },
    { icon: "🧾", tone: "orders", label: "전체 주문", value: `${orders.length}건`, sub: `조리중 ${cookingCount}건` },
  ];

  document.getElementById("stat-grid").innerHTML = stats
    .map(
      (stat) => `
    <div class="stat-card stat-card--${stat.tone} glass-card">
      <div class="stat-icon">${stat.icon}</div>
      <div class="stat-body">
        <div class="stat-label">${stat.label}</div>
        <div class="stat-value">${stat.value}</div>
        <div class="stat-sub">${stat.sub}</div>
      </div>
    </div>
  `
    )
    .join("");
}

// 날짜(YYYY-MM-DD) -> 그 날 매출(취소 제외) 합계.
function revenueByDate(orders) {
  const map = new Map();
  orders.forEach((order) => {
    if (order.status === "취소") return;
    const date = order.createdAt.slice(0, 10);
    map.set(date, (map.get(date) || 0) + order.total);
  });
  return map;
}

function toDateInputValue(date) {
  return date.toISOString().slice(0, 10);
}

function eachDate(fromStr, toStr) {
  const dates = [];
  const cur = new Date(`${fromStr}T00:00:00`);
  const end = new Date(`${toStr}T00:00:00`);
  while (cur <= end) {
    dates.push(toDateInputValue(cur));
    cur.setDate(cur.getDate() + 1);
  }
  return dates;
}

function renderRevenueChart(orders) {
  const fromInput = document.getElementById("revenue-range-from");
  const toInput = document.getElementById("revenue-range-to");
  const totalEl = document.getElementById("revenue-chart-total");
  const bodyEl = document.getElementById("revenue-chart-body");

  const from = fromInput.value;
  const to = toInput.value;
  if (!from || !to || from > to) return;

  const byDate = revenueByDate(orders);
  const dates = eachDate(from, to);
  const values = dates.map((date) => byDate.get(date) || 0);
  const rangeTotal = values.reduce((sum, v) => sum + v, 0);
  const max = Math.max(...values, 1);

  totalEl.textContent = formatPrice(rangeTotal);

  bodyEl.innerHTML = `
    <div class="revenue-bars" role="img" aria-label="선택한 기간의 날짜별 매출 막대그래프">
      ${dates
        .map((date, i) => {
          const value = values[i];
          const heightPct = Math.max(2, Math.round((value / max) * 100));
          const day = Number(date.slice(8, 10));
          return `
        <div class="revenue-bar-col" data-date="${date}" data-amount="${formatPrice(value)}">
          <div class="revenue-bar-track">
            <div class="revenue-bar" style="height:${heightPct}%"></div>
          </div>
          <span class="revenue-bar-label">${day}</span>
        </div>
      `;
        })
        .join("")}
    </div>
    <div class="revenue-tooltip" id="revenue-tooltip" hidden></div>
  `;

  const tooltip = document.getElementById("revenue-tooltip");
  bodyEl.querySelectorAll(".revenue-bar-col").forEach((col) => {
    col.addEventListener("mouseenter", () => {
      tooltip.innerHTML = `<b>${col.dataset.amount}</b><span>${col.dataset.date}</span>`;
      tooltip.hidden = false;
    });
    col.addEventListener("mousemove", (event) => {
      const wrapRect = bodyEl.getBoundingClientRect();
      tooltip.style.left = `${event.clientX - wrapRect.left}px`;
      tooltip.style.top = `${col.getBoundingClientRect().top - wrapRect.top}px`;
    });
    col.addEventListener("mouseleave", () => {
      tooltip.hidden = true;
    });
  });
}

function initRevenueRangeDefaults() {
  const fromInput = document.getElementById("revenue-range-from");
  const toInput = document.getElementById("revenue-range-to");
  const today = new Date();
  const twoWeeksAgo = new Date();
  twoWeeksAgo.setDate(today.getDate() - 13);
  toInput.value = toDateInputValue(today);
  fromInput.value = toDateInputValue(twoWeeksAgo);
}

function renderFeaturedMenus(menus, featuredIds) {
  const listEl = document.getElementById("featured-menus-list");

  if (featuredIds.length === 0) {
    listEl.innerHTML = `<div class="empty-state"><span class="empty-state-icon">⭐</span>아직 고른 추천 메뉴가 없어요.<br />자동으로 카테고리별 대표 메뉴가 노출됩니다.</div>`;
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

const STATUS_TONE = { 주문완료: "new", 조리중: "progress", 수령완료: "done", 취소: "cancelled" };

function renderRecentOrders(allOrders) {
  const orders = allOrders.slice().reverse().slice(0, RECENT_COUNT);
  const listEl = document.getElementById("recent-orders-list");

  if (orders.length === 0) {
    listEl.innerHTML = `<div class="empty-state"><span class="empty-state-icon">🧾</span>주문이 없습니다.</div>`;
    return;
  }

  listEl.innerHTML = orders
    .map(
      (order) => `
    <a class="recent-order-row" href="orders/detail.html?id=${order.id}">
      <div class="order-date">${formatDate(order.createdAt)}</div>
      <div class="order-summary">${escapeHtml(order.items[0].name)}${order.items.length > 1 ? ` 외 ${order.items.length - 1}건` : ""}</div>
      <span class="order-status-pill is-${STATUS_TONE[order.status] || "new"}">${order.status}</span>
      <div class="order-total">${formatPrice(order.total)}</div>
    </a>
  `
    )
    .join("");
}

async function init() {
  const [menus, featuredIds, orders] = await Promise.all([getMenus(), getFeaturedMenuIds(), getOrders()]);

  renderStats(menus, orders);
  renderFeaturedMenus(menus, featuredIds);
  renderRecentOrders(orders);

  initRevenueRangeDefaults();
  renderRevenueChart(orders);
  document.getElementById("revenue-range-from").addEventListener("change", () => renderRevenueChart(orders));
  document.getElementById("revenue-range-to").addEventListener("change", () => renderRevenueChart(orders));
}

init();
