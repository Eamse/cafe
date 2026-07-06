import { formatPrice, formatDate } from "../js/utils.js";

const ORDERS_STORAGE_KEY = "cafe_orders";

function loadOrders() {
  const raw = localStorage.getItem(ORDERS_STORAGE_KEY);
  return raw ? JSON.parse(raw) : [];
}

function renderDetail() {
  const params = new URLSearchParams(window.location.search);
  const orderId = Number(params.get("id"));
  const order = loadOrders().find((o) => o.id === orderId);
  const container = document.getElementById("order-detail");

  if (!order) {
    container.innerHTML = `<p class="orders-empty">주문을 찾을 수 없습니다.</p>`;
    return;
  }

  container.innerHTML = `
    <div class="order-detail-card glass-card">
      <div class="order-meta">
        <div class="order-date">${formatDate(order.createdAt)}</div>
        <div class="order-status">${order.status}</div>
      </div>

      <div class="order-items">
        ${order.items
          .map(
            (item) => `
          <div class="order-item">
            <div class="item-name">${item.name}</div>
            <div class="item-quantity">수량: ${item.quantity}</div>
            <div class="item-price">${formatPrice(item.price * item.quantity)}</div>
          </div>
        `
          )
          .join("")}
      </div>

      <div class="order-total">총 금액: ${formatPrice(order.total)}</div>
    </div>
  `;
}

renderDetail();
