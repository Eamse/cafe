import { initAdminGuard } from "../../js/auth.js";
await initAdminGuard();
import { getOrders, updateOrderStatus, ORDER_STATUSES, getAvailableStatuses } from "../../js/data.js";
import { formatPrice, formatDate, escapeHtml, formatDineType, formatPaymentMethod } from "../../js/utils.js";

let activeStatus = "all";
let searchQuery = "";
const selectedIds = new Set();
let ordersCache = [];

function getFilteredOrders() {
  const orders = ordersCache.slice().reverse();
  let filtered = activeStatus === "all" ? orders : orders.filter((o) => o.status === activeStatus);

  const query = searchQuery.trim().toLowerCase();
  if (query) {
    filtered = filtered.filter((order) => {
      const haystack = [
        String(order.id),
        order.recipient?.name || "",
        order.recipient?.phone || "",
      ]
        .join(" ")
        .toLowerCase();
      return haystack.includes(query);
    });
  }

  return filtered;
}

function renderTabs() {
  const tabs = document.getElementById("status-tabs");
  const allTabs = ["all", ...ORDER_STATUSES];

  tabs.innerHTML = allTabs
    .map(
      (status) => `
    <button class="tab-btn ${status === activeStatus ? "active" : ""}" data-status="${status}">
      ${status === "all" ? "전체" : status}
    </button>
  `
    )
    .join("");

  tabs.querySelectorAll(".tab-btn").forEach((btn) => {
    btn.addEventListener("click", () => {
      activeStatus = btn.dataset.status;
      selectedIds.clear();
      renderTabs();
      renderList();
    });
  });
}

// 선택된 주문들 중 하나라도 이미 "주문완료"를 벗어났으면 일괄 옵션에서 취소를 뺀다.
// (개별 셀렉트의 getAvailableStatuses와 동일한 규칙을 여러 건에 함께 적용)
function getBulkAvailableStatuses(selectedOrders) {
  const allStillPending = selectedOrders.every((order) => order.status === "주문완료");
  return allStillPending ? ORDER_STATUSES : ORDER_STATUSES.filter((status) => status !== "취소");
}

function renderBulkBar(orders) {
  const bar = document.getElementById("bulk-action-bar");
  const countEl = document.getElementById("bulk-count");
  const statusSelect = document.getElementById("bulk-status-select");

  if (selectedIds.size === 0) {
    bar.hidden = true;
    return;
  }

  const selectedOrders = orders.filter((o) => selectedIds.has(o.id));
  bar.hidden = false;
  countEl.textContent = `${selectedIds.size}건 선택됨`;
  statusSelect.innerHTML = getBulkAvailableStatuses(selectedOrders)
    .map((status) => `<option value="${status}">${status}</option>`)
    .join("");
}

function updateSelectAllCheckboxState(total) {
  const selectAll = document.getElementById("select-all-checkbox");
  selectAll.checked = total > 0 && selectedIds.size === total;
  selectAll.indeterminate = selectedIds.size > 0 && selectedIds.size < total;
}

function renderList() {
  const listEl = document.getElementById("admin-order-list");
  const filtered = getFilteredOrders();

  // 필터를 바꿔서 화면에 없는 주문의 선택 상태는 정리한다.
  const visibleIds = new Set(filtered.map((o) => o.id));
  selectedIds.forEach((id) => {
    if (!visibleIds.has(id)) selectedIds.delete(id);
  });

  if (filtered.length === 0) {
    listEl.innerHTML = `<p class="empty-state">${searchQuery.trim() ? "검색 결과가 없습니다." : "주문이 없습니다."}</p>`;
    renderBulkBar(ordersCache);
    updateSelectAllCheckboxState(0);
    return;
  }

  listEl.innerHTML = filtered
    .map(
      (order) => `
    <div class="admin-order-row glass-card ${selectedIds.has(order.id) ? "is-selected" : ""}">
      <label class="row-checkbox">
        <input type="checkbox" data-select-id="${order.id}" ${selectedIds.has(order.id) ? "checked" : ""} />
      </label>
      <a class="row-main" href="detail.html?id=${order.id}">
        <div class="row-date">
          ${formatDate(order.createdAt)}
          <span class="row-delivery-type ${order.deliveryType === "delivery" ? "is-delivery" : "is-pickup"}">${
            order.deliveryType === "delivery"
              ? "🚚 배달"
              : `🏠 매장 수령${order.dineType ? ` · ${formatDineType(order.dineType)}` : ""}`
          }</span>
        </div>
        <div class="row-summary">${escapeHtml(order.items[0].name)}${order.items.length > 1 ? ` 외 ${order.items.length - 1}건` : ""}</div>
        <div class="row-meta">
          ${order.recipient ? `<span>주문자 ${escapeHtml(order.recipient.name)}</span>` : ""}
          ${order.paymentMethod ? `<span>${escapeHtml(formatPaymentMethod(order.paymentMethod))}</span>` : ""}
        </div>
        <div class="row-total">${formatPrice(order.total)}</div>
      </a>
      <select class="status-select" data-id="${order.id}">
        ${getAvailableStatuses(order.status)
          .map((status) => `<option value="${status}" ${status === order.status ? "selected" : ""}>${status}</option>`)
          .join("")}
      </select>
    </div>
  `
    )
    .join("");

  listEl.querySelectorAll(".status-select").forEach((select) => {
    select.addEventListener("change", async () => {
      select.disabled = true;
      await updateOrderStatus(Number(select.dataset.id), select.value);
      await refresh();
    });
  });

  listEl.querySelectorAll("[data-select-id]").forEach((checkbox) => {
    checkbox.addEventListener("change", () => {
      const id = Number(checkbox.dataset.selectId);
      if (checkbox.checked) selectedIds.add(id);
      else selectedIds.delete(id);
      renderList();
    });
  });

  renderBulkBar(ordersCache);
  updateSelectAllCheckboxState(filtered.length);
}

async function refresh() {
  ordersCache = await getOrders();
  renderList();
}

document.getElementById("select-all-checkbox").addEventListener("change", (event) => {
  const filtered = getFilteredOrders();
  if (event.target.checked) {
    filtered.forEach((o) => selectedIds.add(o.id));
  } else {
    filtered.forEach((o) => selectedIds.delete(o.id));
  }
  renderList();
});

document.getElementById("order-search").addEventListener("input", (event) => {
  searchQuery = event.target.value;
  renderList();
});

document.getElementById("bulk-clear-btn").addEventListener("click", () => {
  selectedIds.clear();
  renderList();
});

document.getElementById("bulk-apply-btn").addEventListener("click", async () => {
  if (selectedIds.size === 0) return;
  const status = document.getElementById("bulk-status-select").value;
  if (!confirm(`선택한 ${selectedIds.size}건을 "${status}" 상태로 한 번에 변경할까요?`)) return;

  await Promise.all([...selectedIds].map((id) => updateOrderStatus(id, status)));
  selectedIds.clear();
  await refresh();
});

renderTabs();
refresh();
