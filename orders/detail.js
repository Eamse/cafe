import { getMenus } from "../js/data.js";
import {
  formatPrice,
  formatDate,
  escapeHtml,
  renderCartBadge,
  getOrderById,
  updateOrderStatus,
  addToCart,
} from "../js/utils.js";

const params = new URLSearchParams(window.location.search);
const orderId = Number(params.get("id"));

function reorder(order, button) {
  order.items.forEach((item) => addToCart(item.menuId, item.quantity));
  renderCartBadge();
  button.textContent = "담았습니다 ✓";
  button.disabled = true;
  setTimeout(() => {
    button.textContent = "다시 담기";
    button.disabled = false;
  }, 1200);
}

function cancelOrder() {
  if (!confirm("이 주문을 취소하시겠습니까?")) return;
  updateOrderStatus(orderId, "취소");
  renderDetail();
}

function renderDetail() {
  const order = getOrderById(orderId);
  const container = document.getElementById("order-detail");

  if (!order) {
    container.innerHTML = `<p class="orders-empty">주문을 찾을 수 없습니다.</p>`;
    return;
  }

  const menus = getMenus();
  const hasValidItems = order.items.some((item) => menus.some((m) => m.id === item.menuId));

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
            <div class="item-name">${escapeHtml(item.name)}</div>
            <div class="item-quantity">수량: ${item.quantity}</div>
            <div class="item-price">${formatPrice(item.price * item.quantity)}</div>
          </div>
        `
          )
          .join("")}
      </div>

      <div class="order-total">총 금액: ${formatPrice(order.total)}</div>

      <div class="order-actions">
        ${hasValidItems ? `<button type="button" id="reorder-btn" class="btn-reorder">다시 담기</button>` : ""}
        ${order.status === "주문완료" ? `<button type="button" id="cancel-btn" class="btn-cancel-order">주문 취소</button>` : ""}
      </div>
    </div>
  `;

  const reorderBtn = document.getElementById("reorder-btn");
  if (reorderBtn) reorderBtn.addEventListener("click", () => reorder(order, reorderBtn));

  const cancelBtn = document.getElementById("cancel-btn");
  if (cancelBtn) cancelBtn.addEventListener("click", cancelOrder);
}

renderDetail();
renderCartBadge();
