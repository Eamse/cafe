import { getMenus } from "../js/data.js";
import {
  formatPrice,
  formatDate,
  escapeHtml,
  renderCartBadge,
  getOrders,
  addToCart,
  estimatePickupMinutes,
} from "../js/utils.js";

function renderRecentOrderWidget() {
  const section = document.getElementById("home-recent-section");
  const row = document.getElementById("recent-order-row");
  const orders = getOrders();

  if (orders.length === 0) {
    section.hidden = true;
    return;
  }

  const menus = getMenus();
  const lastOrder = orders[orders.length - 1];
  const items = lastOrder.items
    .map((item) => ({ item, menu: menus.find((m) => m.id === item.menuId) }))
    .filter(({ menu }) => menu);

  if (items.length === 0) {
    section.hidden = true;
    return;
  }

  section.hidden = false;
  row.innerHTML = items
    .map(
      ({ item, menu }) => `
    <div class="recent-item">
      <div class="recent-item-name">${escapeHtml(menu.name)}</div>
      <div class="recent-item-price">${formatPrice(menu.price)}</div>
      <button type="button" class="btn-reorder-mini" data-menu-id="${menu.id}" data-quantity="${item.quantity}" ${menu.isSoldOut ? "disabled" : ""}>
        ${menu.isSoldOut ? "품절" : "다시 담기"}
      </button>
    </div>
  `
    )
    .join("");

  row.querySelectorAll(".btn-reorder-mini:not(:disabled)").forEach((btn) => {
    btn.addEventListener("click", () => {
      addToCart(Number(btn.dataset.menuId), Number(btn.dataset.quantity));
      renderCartBadge();
      btn.textContent = "담았습니다 ✓";
      btn.disabled = true;
      setTimeout(() => {
        btn.textContent = "다시 담기";
        btn.disabled = false;
      }, 1200);
    });
  });
}

function reorder(order, button) {
  const menus = getMenus();
  const addableItems = order.items.filter((item) => {
    const menu = menus.find((m) => m.id === item.menuId);
    return menu && !menu.isSoldOut;
  });

  if (addableItems.length === 0) {
    button.textContent = "품절되어 담을 수 없어요";
    button.disabled = true;
    return;
  }

  addableItems.forEach((item) => addToCart(item.menuId, item.quantity));
  renderCartBadge();

  const skipped = order.items.length - addableItems.length;
  button.textContent = skipped > 0 ? `일부 품절 제외하고 담았습니다 ✓` : "담았습니다 ✓";
  button.disabled = true;
  setTimeout(() => {
    button.textContent = "다시 담기";
    button.disabled = false;
  }, 1600);
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
        <div class="order-status-cell">
          <div class="order-status">${order.status}</div>
          ${
            order.status === "주문완료"
              ? `<div class="order-pickup-hint">${estimatePickupMinutes(order.items.reduce((sum, item) => sum + item.quantity, 0))}</div>`
              : ""
          }
        </div>
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
renderRecentOrderWidget();
renderCartBadge();
