import { initAdminGuard } from "../../js/auth.js";
initAdminGuard();
import {
  formatPrice,
  formatDate,
  escapeHtml,
  getOrderById,
  updateOrderStatus,
  getAvailableStatuses,
  renderStatusSteps,
  formatItemOptions,
  formatBarcodeNumber,
  formatDineType,
} from "../../js/utils.js";

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
          ${getAvailableStatuses(order.status)
            .map((status) => `<option value="${status}" ${status === order.status ? "selected" : ""}>${status}</option>`)
            .join("")}
        </select>
      </div>

      ${renderStatusSteps(order.status)}

      <div class="order-delivery-type">${order.deliveryType === "delivery" ? "🚚 배달" : `🏠 매장 수령${order.dineType ? ` · ${formatDineType(order.dineType)}` : ""}`}</div>

      ${
        order.barcodeNumber
          ? `<div class="pickup-barcode-admin">
              <span class="order-note-label">픽업 바코드</span>
              <div class="pickup-barcode-admin-number">${formatBarcodeNumber(order.barcodeNumber)}</div>
              ${
                order.status === "주문완료" || order.status === "조리중"
                  ? `
              <div class="barcode-verify-row">
                <input type="text" id="barcode-verify-input" placeholder="바코드 스캔 또는 번호 입력" />
                <button type="button" id="barcode-verify-btn">확인 후 수령 처리</button>
              </div>
              <p class="barcode-verify-error" id="barcode-verify-error" hidden></p>
              `
                  : ""
              }
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
          ? `<div class="order-note">
              <span class="order-note-label">${order.deliveryType === "delivery" ? "배달 정보" : "매장 수령 정보"}</span>
              <div>${escapeHtml(order.recipient.name)} · ${escapeHtml(order.recipient.phone)}</div>
              ${order.recipient.address ? `<div>${escapeHtml(order.recipient.address)}</div>` : ""}
            </div>`
          : ""
      }

      ${order.note ? `<div class="order-note"><span class="order-note-label">고객 요청사항</span>${escapeHtml(order.note)}</div>` : ""}

      ${
        order.status === "취소" && order.cancelReason
          ? `<div class="order-note"><span class="order-note-label">고객 취소 사유</span>${escapeHtml(order.cancelReason)}</div>`
          : ""
      }

      <div class="order-total">총 금액: ${formatPrice(order.total)}</div>
    </div>
  `;

  document.getElementById("status-select").addEventListener("change", (event) => {
    updateOrderStatus(orderId, event.target.value);
    render();
  });

  const verifyBtn = document.getElementById("barcode-verify-btn");
  if (verifyBtn) {
    verifyBtn.addEventListener("click", () => {
      const input = document.getElementById("barcode-verify-input").value.trim();
      const normalized = input.replace(/^BC-0*/i, "") || input;
      const matches = Number(normalized) === order.barcodeNumber || input === formatBarcodeNumber(order.barcodeNumber);

      if (!matches) {
        const errorEl = document.getElementById("barcode-verify-error");
        errorEl.textContent = "바코드 번호가 이 주문과 일치하지 않아요.";
        errorEl.hidden = false;
        return;
      }

      updateOrderStatus(orderId, "수령완료");
      render();
    });
  }
}

render();
