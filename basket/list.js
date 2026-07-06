import { menus } from "../js/data.js";
import { getCart, removeFromCart, clearCart, formatPrice } from "../js/utils.js";

const ORDERS_STORAGE_KEY = "cafe_orders";

function loadOrders() {
  const raw = localStorage.getItem(ORDERS_STORAGE_KEY);
  return raw ? JSON.parse(raw) : [];
}

function saveOrders(orders) {
  localStorage.setItem(ORDERS_STORAGE_KEY, JSON.stringify(orders));
}

function nextOrderId(orders) {
  return orders.reduce((max, order) => Math.max(max, order.id), 0) + 1;
}

function renderBasket() {
  const cart = getCart();
  const listEl = document.getElementById("basket-list");
  const totalEl = document.getElementById("basket-total");
  const checkoutBtn = document.getElementById("checkout-btn");

  if (cart.length === 0) {
    listEl.innerHTML = `<p class="basket-empty">장바구니가 비어있습니다.</p>`;
    totalEl.textContent = "";
    checkoutBtn.disabled = true;
    return;
  }

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
            <div class="item-name">${menu.name}</div>
            <div class="item-quantity">수량: ${item.quantity}</div>
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
}

function handleCheckout() {
  const cart = getCart();
  if (cart.length === 0) return;

  const items = cart
    .map((item) => {
      const menu = menus.find((m) => m.id === item.menuId);
      if (!menu) return null;
      return { menuId: menu.id, name: menu.name, price: menu.price, quantity: item.quantity };
    })
    .filter(Boolean);

  const total = items.reduce((sum, item) => sum + item.price * item.quantity, 0);

  const orders = loadOrders();
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
