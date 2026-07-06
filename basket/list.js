import { menus } from "../js/data.js";
import { getCart, removeFromCart, formatPrice } from "../js/utils.js";

function renderBasket() {
  const cart = getCart();
  const listEl = document.getElementById("basket-list");
  const totalEl = document.getElementById("basket-total");

  if (cart.length === 0) {
    listEl.innerHTML = `<p class="basket-empty">장바구니가 비어있습니다.</p>`;
    totalEl.textContent = "";
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

  listEl.querySelectorAll("button[data-action='remove']").forEach((button) => {
    button.addEventListener("click", () => {
      const menuId = Number(button.dataset.id);
      removeFromCart(menuId);
      renderBasket();
    });
  });
}

renderBasket();
