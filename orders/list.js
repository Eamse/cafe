import { getMenus } from "../js/data.js";
import { formatPrice, formatDate, escapeHtml, renderCartBadge, getOrders, addToCart } from "../js/utils.js";

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

function renderOrders() {
  const listEl = document.getElementById("orders-list");
  const orders = getOrders().slice().reverse();

  if (orders.length === 0) {
    listEl.innerHTML = `<p class="orders-empty">주문 내역이 없습니다.</p>`;
    return;
  }

  const menus = getMenus();

  listEl.innerHTML = orders
    .map(
      (order) => `
    <div class="order-card">
      <a class="order-card-link" href="detail.html?id=${order.id}">
        <div class="order-date">${formatDate(order.createdAt)}</div>
        <div class="order-summary">${escapeHtml(order.items[0].name)}${order.items.length > 1 ? ` 외 ${order.items.length - 1}건` : ""}</div>
        <div class="order-status">${order.status}</div>
        <div class="order-total">${formatPrice(order.total)}</div>
      </a>
      ${
        order.items.some((item) => menus.some((m) => m.id === item.menuId))
          ? `<button type="button" class="btn-reorder" data-id="${order.id}">다시 담기</button>`
          : ""
      }
    </div>
  `
    )
    .join("");

  listEl.querySelectorAll(".btn-reorder").forEach((button) => {
    button.addEventListener("click", () => {
      const order = orders.find((o) => o.id === Number(button.dataset.id));
      reorder(order, button);
    });
  });
}

renderOrders();
renderCartBadge();
