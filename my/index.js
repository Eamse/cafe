import { formatPrice, formatDate, getOrders } from "../js/utils.js";

const RECENT_COUNT = 3;

function renderSummary(orders) {
  const totalCount = orders.length;
  const totalAmount = orders.reduce((sum, order) => sum + order.total, 0);

  document.getElementById("summary-count").textContent = `${totalCount}건`;
  document.getElementById("summary-total").textContent = formatPrice(totalAmount);
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
    <a class="recent-order-card" href="../orders/detail.html?id=${order.id}">
      <div class="order-date">${formatDate(order.createdAt)}</div>
      <div class="order-summary">${order.items[0].name}${order.items.length > 1 ? ` 외 ${order.items.length - 1}건` : ""}</div>
      <div class="order-status">${order.status}</div>
      <div class="order-total">${formatPrice(order.total)}</div>
    </a>
  `
    )
    .join("");
}

function init() {
  const orders = getOrders();
  renderSummary(orders);
  renderRecentOrders(orders);
}

init();
