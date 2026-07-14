import { getMenus, createOrder } from "../js/data.js";
import { renderAuthNav } from "../js/auth.js";
import {
  getCart,
  removeFromCart,
  updateCartQuantity,
  clearCart,
  formatPrice,
  escapeHtml,
  renderCartBadge,
  estimatePickupMinutes,
  getLastRecipientInfo,
  saveLastRecipientInfo,
  initThemeToggle,
  getCartLineKey,
  getMenuUnitPrice,
  getEffectiveUnitPrice,
  cartHasDrink,
  formatItemOptions,
  appPath,
} from "../js/utils.js";

// 배달 주문은 최소 주문 금액 미만이면 접수하지 않는다(매장 수령은 제한 없음).
const MIN_DELIVERY_ORDER = 15000;

async function renderBasket() {
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

  const menus = await getMenus();
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

function showMinOrderModal() {
  document.getElementById("min-order-modal").hidden = false;
}

function hideMinOrderModal() {
  document.getElementById("min-order-modal").hidden = true;
}

document.getElementById("min-order-modal-close").addEventListener("click", hideMinOrderModal);
document.getElementById("min-order-modal").addEventListener("click", (event) => {
  if (event.target.id === "min-order-modal") hideMinOrderModal();
});
document.addEventListener("keydown", (event) => {
  if (event.key === "Escape") hideMinOrderModal();
});

function getSelectedDeliveryType() {
  return document.querySelector('input[name="deliveryType"]:checked').value;
}

function getSelectedDineType() {
  return document.querySelector('input[name="dineType"]:checked').value;
}

function getSelectedPaymentMethod() {
  return document.querySelector('input[name="paymentMethod"]:checked').value;
}

// 매장 수령이면 배달 주소가 필요 없으니, 선택에 따라 주소 필드 자체를
// 선택 입력으로 바꾸고 라벨/문구도 맞춰준다. 매장 수령일 때만 포장/매장취식
// 선택지를 보여준다(배달은 해당 사항이 없으므로 숨김).
function updateDeliveryTypeUI() {
  const isDelivery = getSelectedDeliveryType() === "delivery";
  const addressInput = document.getElementById("recipient-address");
  const addressLabel = document.getElementById("recipient-address-label");

  addressInput.required = isDelivery;
  addressInput.placeholder = isDelivery ? "배송받으실 주소" : "매장 근처면 참고용으로 적어주세요 (선택)";
  addressLabel.textContent = isDelivery ? "배달 주소 *" : "참고 주소 (선택)";

  document.getElementById("dine-type-fields").hidden = isDelivery;
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

async function handleCheckout() {
  const cart = getCart();
  if (cart.length === 0) return;

  // getMenus()가 네트워크를 타는 동안 버튼을 다시 누르면 주문이 중복 생성될
  // 수 있어서, 함수 시작과 동시에 잠그고 검증에 걸리는 경우에만 다시 푼다
  // (성공 시에는 바로 다른 페이지로 이동하므로 풀 필요가 없다).
  const checkoutBtn = document.getElementById("checkout-btn");
  checkoutBtn.disabled = true;

  const menus = await getMenus();
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

  const total = items.reduce((sum, item) => sum + item.price * item.quantity, 0);

  const deliveryType = getSelectedDeliveryType();
  const recipient = readRecipientInfo();
  const missingAddress = deliveryType === "delivery" && !recipient.address;

  if (deliveryType === "delivery" && total < MIN_DELIVERY_ORDER) {
    showMinOrderModal();
    checkoutBtn.disabled = false;
    return;
  }

  if (!recipient.name || !recipient.phone || missingAddress) {
    showRecipientError(
      deliveryType === "delivery"
        ? "수령자 이름, 연락처, 배달 주소를 모두 입력해주세요."
        : "수령자 이름과 연락처를 입력해주세요."
    );
    checkoutBtn.disabled = false;
    return;
  }

  const note = document.getElementById("order-note").value.trim();

  let newOrderId;
  try {
    newOrderId = await createOrder({
      items: items.map(({ menuId, name, price, quantity, temp, size }) => ({ menuId, name, price, quantity, temp, size })),
      total,
      note,
      recipient,
      deliveryType,
      // 매장 수령일 때만 의미 있는 값(포장/매장에서 먹기). 배달 주문은 해당 없음.
      dineType: deliveryType === "pickup" ? getSelectedDineType() : null,
      paymentMethod: getSelectedPaymentMethod(),
    });
  } catch {
    showRecipientError("주문 접수에 실패했어요. 다시 시도해주세요.");
    checkoutBtn.disabled = false;
    return;
  }

  saveLastRecipientInfo(recipient);
  clearCart();
  window.location.href = `${appPath("orders/detail.html")}?id=${newOrderId}&new=1`;
}

document.getElementById("checkout-btn").addEventListener("click", handleCheckout);
document.querySelectorAll('input[name="deliveryType"]').forEach((el) => {
  el.addEventListener("change", updateDeliveryTypeUI);
});
updateDeliveryTypeUI();
fillRecipientInfo();
renderBasket();
initThemeToggle();
await renderAuthNav();
