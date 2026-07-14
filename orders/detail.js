import { getMenus, getOrderById, cancelOrderWithReason } from "../js/data.js";
import { renderAuthNav } from "../js/auth.js";
import {
  formatPrice,
  formatDate,
  escapeHtml,
  renderCartBadge,
  addToCart,
  renderStatusSteps,
  getPickupEstimateRange,
  showToast,
  initThemeToggle,
  formatItemOptions,
  formatBarcodeNumber,
  renderBarcodeBarsHtml,
  formatDineType,
  formatPaymentMethod,
} from "../js/utils.js";

const params = new URLSearchParams(window.location.search);
const orderId = Number(params.get("id"));
const isJustOrdered = params.get("new") === "1";

const CANCEL_REASONS = ["단순 변심", "주문 실수", "너무 늦게 준비돼요", "기타"];

let countdownTimer = null;

function startPickupCountdown(order) {
  clearInterval(countdownTimer);

  const el = document.getElementById("pickup-countdown");
  if (!el) return;

  const totalQuantity = order.items.reduce((sum, item) => sum + item.quantity, 0);
  const { min, max } = getPickupEstimateRange(totalQuantity);
  const avgMinutes = (min + max) / 2;
  const targetTime = new Date(order.createdAt).getTime() + avgMinutes * 60000;

  function update() {
    const remainingMinutes = Math.ceil((targetTime - Date.now()) / 60000);
    el.textContent =
      remainingMinutes > 0 ? `약 ${remainingMinutes}분 후 준비 완료 예정` : "곧 준비 완료될 예정이에요 ☕";
  }

  update();
  countdownTimer = setInterval(update, 30000);
}

function reorder(order, button, menus) {
  const addableItems = order.items.filter((item) => {
    const menu = menus.find((m) => m.id === item.menuId);
    return menu && !menu.isSoldOut;
  });

  if (addableItems.length === 0) {
    button.textContent = "품절되어 담을 수 없어요";
    button.disabled = true;
    return;
  }

  addableItems.forEach((item) => addToCart(item.menuId, item.quantity, { temp: item.temp || null, size: item.size || null }));
  renderCartBadge();

  const skipped = order.items.length - addableItems.length;
  showToast(skipped > 0 ? "일부 품절 메뉴는 제외하고 담았습니다" : "장바구니에 담았습니다");
  button.textContent = skipped > 0 ? "일부 품절 제외하고 담았습니다 ✓" : "담았습니다 ✓";
  button.disabled = true;
  setTimeout(() => {
    button.textContent = "다시 담기";
    button.disabled = false;
  }, 1600);
}

function showCancelReasonPanel() {
  const panel = document.getElementById("cancel-reason-panel");
  const cancelBtn = document.getElementById("cancel-btn");
  panel.hidden = false;
  cancelBtn.hidden = true;
}

function hideCancelReasonPanel() {
  const panel = document.getElementById("cancel-reason-panel");
  const cancelBtn = document.getElementById("cancel-btn");
  panel.hidden = true;
  cancelBtn.hidden = false;
}

async function confirmCancel(reason, menus) {
  if (!reason) return;
  const result = await cancelOrderWithReason(orderId, reason);
  if (!result.ok) {
    showToast("이미 조리가 시작되어 취소할 수 없어요. 매장으로 문의해주세요.", { type: "error" });
  }
  renderDetail(menus);
}

async function renderDetail(menus) {
  clearInterval(countdownTimer);

  const order = await getOrderById(orderId);
  const container = document.getElementById("order-detail");

  if (!order) {
    container.innerHTML = `<p class="orders-empty">주문을 찾을 수 없습니다.</p>`;
    return;
  }

  const hasValidItems = order.items.some((item) => menus.some((m) => m.id === item.menuId));

  container.innerHTML = `
    ${
      isJustOrdered && order.status !== "취소"
        ? `
    <div class="order-thanks-banner">
      <div class="order-thanks-icon">☕</div>
      <h2 class="order-thanks-title">주문이 접수됐어요!</h2>
      <p class="order-thanks-sub">주문번호 #${order.id} · 준비되면 상태가 바뀌니 이 페이지에서 확인해주세요.</p>
    </div>
    `
        : ""
    }
    <div class="order-detail-card glass-card">
      <div class="order-meta">
        <div class="order-date">${formatDate(order.createdAt)}</div>
        <div class="order-status">${order.status}</div>
      </div>

      ${renderStatusSteps(order.status)}

      ${order.status === "주문완료" ? `<p class="order-pickup-estimate" id="pickup-countdown"></p>` : ""}

      ${
        order.barcodeNumber && order.status !== "취소"
          ? `<div class="pickup-barcode">
              <p class="pickup-barcode-label">매장에서 이 바코드를 보여주세요</p>
              ${renderBarcodeBarsHtml(order.barcodeNumber)}
              <p class="pickup-barcode-number">${formatBarcodeNumber(order.barcodeNumber)}</p>
            </div>`
          : ""
      }

      <div class="order-items">
        ${order.items
          .map(
            (item) => `
          <div class="order-item">
            <div class="item-name">${escapeHtml(item.name)}${formatItemOptions(item) ? ` <span class="item-options">(${escapeHtml(formatItemOptions(item))})</span>` : ""}</div>
            <div class="item-quantity">수량: ${item.quantity}</div>
            <div class="item-price">${formatPrice(item.price * item.quantity)}</div>
          </div>
        `
          )
          .join("")}
      </div>

      ${
        order.recipient
          ? `<div class="order-recipient">
              <span class="order-note-label">${order.deliveryType === "delivery" ? "배달 정보" : "매장 수령 정보"}</span>
              ${order.deliveryType === "pickup" && order.dineType ? `<div>${escapeHtml(formatDineType(order.dineType))}</div>` : ""}
              <div>${escapeHtml(order.recipient.name)} · ${escapeHtml(order.recipient.phone)}</div>
              ${order.recipient.address ? `<div>${escapeHtml(order.recipient.address)}</div>` : ""}
            </div>`
          : ""
      }

      ${order.paymentMethod ? `<div class="order-note"><span class="order-note-label">결제 수단</span>${escapeHtml(formatPaymentMethod(order.paymentMethod))}</div>` : ""}

      ${order.note ? `<div class="order-note"><span class="order-note-label">요청사항</span>${escapeHtml(order.note)}</div>` : ""}

      ${
        order.status === "취소" && order.cancelReason
          ? `<div class="order-note"><span class="order-note-label">취소 사유</span>${escapeHtml(order.cancelReason)}</div>`
          : ""
      }

      <div class="order-total">총 금액: ${formatPrice(order.total)}</div>

      <div class="order-actions">
        ${hasValidItems ? `<button type="button" id="reorder-btn" class="btn-reorder">다시 담기</button>` : ""}
        ${order.status === "주문완료" ? `<button type="button" id="cancel-btn" class="btn-cancel-order">주문 취소</button>` : ""}
      </div>

      ${
        order.status === "주문완료"
          ? `
      <div class="cancel-reason-panel" id="cancel-reason-panel" hidden>
        <p class="cancel-reason-title">취소 사유를 선택해주세요</p>
        <div class="cancel-reason-options">
          ${CANCEL_REASONS.map((reason) => `<button type="button" class="cancel-reason-btn" data-reason="${escapeHtml(reason)}">${escapeHtml(reason)}</button>`).join("")}
        </div>
        <button type="button" class="cancel-reason-back" id="cancel-reason-back">돌아가기</button>
      </div>
      `
          : ""
      }
    </div>
  `;

  const reorderBtn = document.getElementById("reorder-btn");
  if (reorderBtn) reorderBtn.addEventListener("click", () => reorder(order, reorderBtn, menus));

  const cancelBtn = document.getElementById("cancel-btn");
  if (cancelBtn) cancelBtn.addEventListener("click", showCancelReasonPanel);

  const cancelBackBtn = document.getElementById("cancel-reason-back");
  if (cancelBackBtn) cancelBackBtn.addEventListener("click", hideCancelReasonPanel);

  document.querySelectorAll(".cancel-reason-btn").forEach((btn) => {
    btn.addEventListener("click", () => confirmCancel(btn.dataset.reason, menus));
  });

  if (order.status === "주문완료") startPickupCountdown(order);
}

async function init() {
  const menus = await getMenus();
  await renderDetail(menus);
  renderCartBadge();
  initThemeToggle();
  await renderAuthNav();
}

init();

// 새로고침하면 배너가 다시 뜨지 않도록, 한 번 보여준 뒤 주소에서 new=1을 지운다.
if (isJustOrdered) {
  params.delete("new");
  const newUrl = `${window.location.pathname}${params.toString() ? `?${params.toString()}` : ""}`;
  window.history.replaceState(null, "", newUrl);
}
