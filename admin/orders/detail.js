import { formatPrice, formatDate, escapeHtml, getOrderById, updateOrderStatus, ORDER_STATUSES } from "../../js/utils.js";

const params = new URLSearchParams(window.location.search);
const orderId = Number(params.get("id"));

function render() {
  const order = getOrderById(orderId);
  const container = document.getElementById("order-detail");

  if (!order) {
    container.innerHTML = `<p class="empty-state">주문을 찾을 수 없습니다.</p>`;
    return;
  }

  container.innerHTML = `
    <div class="order-detail-card glass-card">
      <div class="order-meta">
        <div class="order-date">${formatDate(order.createdAt)}</div>
        <select class="status-select" id="status-select">
          ${ORDER_STATUSES.map(
            (status) => `<option value="${status}" ${status === order.status ? "selected" : ""}>${status}</option>`
          ).join("")}
        </select>
      </div>

      <div class="order-items">
        ${order.items
          .map(
            (item) => `
          <div class="order-item">
            <div class="item-name">${escapeHtml(item.name)}</div>
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

  document.getElementById("status-select").addEventListener("change", (event) => {
    updateOrderStatus(orderId, event.target.value);
  });
}

render();
