import { formatPrice, formatDate, getOrders } from "../js/utils.js";

function renderOrders() {
  const listEl = document.getElementById("orders-list");
  const orders = getOrders().slice().reverse();

  if (orders.length === 0) {
    listEl.innerHTML = `<p class="orders-empty">주문 내역이 없습니다.</p>`;
    return;
  }

  listEl.innerHTML = orders
    .map(
      (order) => `
    <a class="order-card" href="detail.html?id=${order.id}">
      <div class="order-date">${formatDate(order.createdAt)}</div>
      <div class="order-summary">${order.items[0].name}${order.items.length > 1 ? ` 외 ${order.items.length - 1}건` : ""}</div>
      <div class="order-status">${order.status}</div>
      <div class="order-total">${formatPrice(order.total)}</div>
    </a>
  `
    )
    .join("");
}

renderOrders();
