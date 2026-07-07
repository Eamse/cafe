import { getMenus } from "../js/data.js";
import {
  getCart,
  removeFromCart,
  updateCartQuantity,
  clearCart,
  formatPrice,
  escapeHtml,
  renderCartBadge,
  getOrders,
  saveOrders,
} from "../js/utils.js";

function nextOrderId(orders) {
  return orders.reduce((max, order) => Math.max(max, order.id), 0) + 1;
}

function renderBasket() {
  const cart = getCart();
  const listEl = document.getElementById("basket-list");
  const totalEl = document.getElementById("basket-total");
  const checkoutBtn = document.getElementById("checkout-btn");

  renderCartBadge();

  if (cart.length === 0) {
    listEl.innerHTML = `<p class="basket-empty">장바구니가 비어있습니다.</p>`;
    totalEl.textContent = "";
    checkoutBtn.disabled = true;
    return;
  }

  const menus = getMenus();
  let total = 0;

  listEl.innerHTML = cart
    .map((item) => {
      const menu = menus.find((m) => m.id === item.menuId);
      if (!menu) return "";

      const subtotal = menu.price * item.quantity;
      total += subtotal;

      return `
        <div class="basket-item" data-menu-id="${menu.id}">
          <div>
            <div class="item-name">${escapeHtml(menu.name)}</div>
            <div class="item-qty-control">
              <button type="button" data-action="decrease" data-id="${menu.id}" aria-label="수량 감소">-</button>
              <span>${item.quantity}</span>
              <button type="button" data-action="increase" data-id="${menu.id}" aria-label="수량 증가">+</button>
            </div>
          </div>
          <div class="item-price">${formatPrice(subtotal)}</div>
          <button type="button" data-action="remove" data-id="${menu.id}">삭제</button>
        </div>
      `;
    })
    .join("");

  totalEl.textContent = `총 금액: ${formatPrice(total)}`;
  checkoutBtn.disabled = false;

  listEl.querySelectorAll("button[data-action='remove']").forEach((button) => {
    button.addEventListener("click", () => {
      const menuId = Number(button.dataset.id);
      removeFromCart(menuId);
      renderBasket();
    });
  });

  listEl.querySelectorAll("button[data-action='increase'], button[data-action='decrease']").forEach((button) => {
    button.addEventListener("click", () => {
      const menuId = Number(button.dataset.id);
      const current = getCart().find((item) => item.menuId === menuId);
      if (!current) return;
      const delta = button.dataset.action === "increase" ? 1 : -1;
      updateCartQuantity(menuId, current.quantity + delta);
      renderBasket();
    });
  });
}

function handleCheckout() {
  const cart = getCart();
  if (cart.length === 0) return;

  const menus = getMenus();
  const items = cart
    .map((item) => {
      const menu = menus.find((m) => m.id === item.menuId);
      if (!menu) return null;
      return { menuId: menu.id, name: menu.name, price: menu.price, quantity: item.quantity };
    })
    .filter(Boolean);

  const total = items.reduce((sum, item) => sum + item.price * item.quantity, 0);

  const orders = getOrders();
  orders.push({
    id: nextOrderId(orders),
    createdAt: new Date().toISOString(),
    items,
    total,
    status: "주문완료",
  });
  saveOrders(orders);
  clearCart();
  window.location.href = "../orders/list.html";
}

document.getElementById("checkout-btn").addEventListener("click", handleCheckout);
renderBasket();
