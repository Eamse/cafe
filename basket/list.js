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
  estimatePickupMinutes,
  getLastRecipientInfo,
  saveLastRecipientInfo,
  initThemeToggle,
  getCartLineKey,
  getMenuUnitPrice,
  getEffectiveUnitPrice,
  cartHasDrink,
  formatItemOptions,
} from "../js/utils.js";

function nextOrderId(orders) {
  return orders.reduce((max, order) => Math.max(max, order.id), 0) + 1;
}

function renderBasket() {
  const cart = getCart();
  const listEl = document.getElementById("basket-list");
  const totalEl = document.getElementById("basket-total");
  const warningEl = document.getElementById("basket-warning");
  const pickupEl = document.getElementById("pickup-estimate");
  const checkoutBtn = document.getElementById("checkout-btn");

  renderCartBadge();

  if (cart.length === 0) {
    listEl.innerHTML = `<p class="basket-empty">장바구니가 비어있습니다.</p>`;
    totalEl.textContent = "";
    warningEl.hidden = true;
    pickupEl.hidden = true;
    checkoutBtn.disabled = true;
    return;
  }

  const menus = getMenus();
  const hasDrink = cartHasDrink(cart, menus);
  let total = 0;
  let totalQuantity = 0;
  let totalDessertDiscount = 0;
  let hasSoldOutItem = false;

  listEl.innerHTML = cart
    .map((item) => {
      const menu = menus.find((m) => m.id === item.menuId);
      if (!menu) return "";

      const unitPrice = getMenuUnitPrice(menu, item);
      const effectiveUnitPrice = getEffectiveUnitPrice(menu, item, hasDrink);
      const discountPerUnit = unitPrice - effectiveUnitPrice;
      const subtotal = effectiveUnitPrice * item.quantity;
      total += subtotal;
      totalDessertDiscount += discountPerUnit * item.quantity;
      if (!menu.isSoldOut) totalQuantity += item.quantity;
      if (menu.isSoldOut) hasSoldOutItem = true;

      const lineKey = getCartLineKey(item.menuId, item.temp, item.size);
      const options = formatItemOptions(item);

      return `
        <div class="basket-item ${menu.isSoldOut ? "is-soldout" : ""}" data-line-key="${escapeHtml(lineKey)}">
          <div>
            <div class="item-name">
              ${escapeHtml(menu.name)}
              ${menu.isSoldOut ? `<span class="item-soldout-tag">품절</span>` : ""}
            </div>
            ${options ? `<div class="item-options">${escapeHtml(options)}</div>` : ""}
            ${discountPerUnit > 0 ? `<div class="item-discount-tag">음료와 함께 담아 ${formatPrice(discountPerUnit)} 할인</div>` : ""}
            <div class="item-qty-control">
              <button type="button" data-action="decrease" data-key="${escapeHtml(lineKey)}" aria-label="수량 감소" ${menu.isSoldOut ? "disabled" : ""}>-</button>
              <span>${item.quantity}</span>
              <button type="button" data-action="increase" data-key="${escapeHtml(lineKey)}" aria-label="수량 증가" ${menu.isSoldOut ? "disabled" : ""}>+</button>
            </div>
          </div>
          <div class="item-price">${formatPrice(subtotal)}</div>
          <button type="button" data-action="remove" data-key="${escapeHtml(lineKey)}">삭제</button>
        </div>
      `;
    })
    .join("");

  totalEl.innerHTML =
    totalDessertDiscount > 0
      ? `<span class="basket-discount-line">디저트 할인 -${formatPrice(totalDessertDiscount)}</span>총 금액: ${formatPrice(total)}`
      : `총 금액: ${formatPrice(total)}`;

  if (totalQuantity > 0) {
    pickupEl.hidden = false;
    pickupEl.textContent = estimatePickupMinutes(totalQuantity);
  } else {
    pickupEl.hidden = true;
  }

  if (hasSoldOutItem) {
    warningEl.hidden = false;
    warningEl.textContent = "품절된 메뉴가 있어 주문할 수 없어요. 삭제 후 다시 시도해주세요.";
    checkoutBtn.disabled = true;
  } else {
    warningEl.hidden = true;
    checkoutBtn.disabled = false;
  }

  listEl.querySelectorAll("button[data-action='remove']").forEach((button) => {
    button.addEventListener("click", () => {
      const current = getCart().find((item) => getCartLineKey(item.menuId, item.temp, item.size) === button.dataset.key);
      if (!current) return;
      removeFromCart(current.menuId, current);
      renderBasket();
    });
  });

  listEl.querySelectorAll("button[data-action='increase'], button[data-action='decrease']").forEach((button) => {
    button.addEventListener("click", () => {
      const current = getCart().find((item) => getCartLineKey(item.menuId, item.temp, item.size) === button.dataset.key);
      if (!current) return;
      const delta = button.dataset.action === "increase" ? 1 : -1;
      updateCartQuantity(current.menuId, current.quantity + delta, current);
      renderBasket();
    });
  });
}

function showRecipientError(message) {
  const warningEl = document.getElementById("basket-warning");
  warningEl.hidden = false;
  warningEl.textContent = message;
}

function readRecipientInfo() {
  return {
    name: document.getElementById("recipient-name").value.trim(),
    phone: document.getElementById("recipient-phone").value.trim(),
    address: document.getElementById("recipient-address").value.trim(),
  };
}

function fillRecipientInfo() {
  const saved = getLastRecipientInfo();
  if (!saved) return;
  document.getElementById("recipient-name").value = saved.name || "";
  document.getElementById("recipient-phone").value = saved.phone || "";
  document.getElementById("recipient-address").value = saved.address || "";
}

function handleCheckout() {
  const cart = getCart();
  if (cart.length === 0) return;

  const menus = getMenus();
  const hasDrink = cartHasDrink(cart, menus);
  const items = cart
    .map((item) => {
      const menu = menus.find((m) => m.id === item.menuId);
      if (!menu) return null;
      return {
        menuId: menu.id,
        name: menu.name,
        price: getEffectiveUnitPrice(menu, item, hasDrink),
        quantity: item.quantity,
        temp: item.temp || null,
        size: item.size || null,
        isSoldOut: menu.isSoldOut,
      };
    })
    .filter(Boolean);

  // 안전장치: 버튼이 비활성화돼 있어도 혹시 모를 경합 상태(다른 탭에서 방금 품절 처리 등)를 대비해 한 번 더 막는다.
  if (items.some((item) => item.isSoldOut)) {
    renderBasket();
    return;
  }

  const recipient = readRecipientInfo();
  if (!recipient.name || !recipient.phone || !recipient.address) {
    showRecipientError("수령자 이름, 연락처, 주소를 모두 입력해주세요.");
    return;
  }

  const total = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const note = document.getElementById("order-note").value.trim();

  const orders = getOrders();
  const newOrderId = nextOrderId(orders);
  orders.push({
    id: newOrderId,
    createdAt: new Date().toISOString(),
    items: items.map(({ menuId, name, price, quantity, temp, size }) => ({ menuId, name, price, quantity, temp, size })),
    total,
    status: "주문완료",
    note,
    recipient,
  });
  saveOrders(orders);
  saveLastRecipientInfo(recipient);
  clearCart();
  window.location.href = `/orders/detail?id=${newOrderId}&new=1`;
}

document.getElementById("checkout-btn").addEventListener("click", handleCheckout);
fillRecipientInfo();
renderBasket();
initThemeToggle();
