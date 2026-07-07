import { formatPrice, formatDate, getOrders, updateOrderStatus, ORDER_STATUSES } from "../../js/utils.js";

let activeStatus = "all";

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
      renderTabs();
      renderList();
    });
  });
}

function renderList() {
  const listEl = document.getElementById("admin-order-list");
  const orders = getOrders().slice().reverse();
  const filtered = activeStatus === "all" ? orders : orders.filter((o) => o.status === activeStatus);

  if (filtered.length === 0) {
    listEl.innerHTML = `<p class="empty-state">주문이 없습니다.</p>`;
    return;
  }

  listEl.innerHTML = filtered
    .map(
      (order) => `
    <div class="admin-order-row glass-card">
      <a class="row-main" href="detail.html?id=${order.id}">
        <div class="row-date">${formatDate(order.createdAt)}</div>
        <div class="row-summary">${order.items[0].name}${order.items.length > 1 ? ` 외 ${order.items.length - 1}건` : ""}</div>
        <div class="row-total">${formatPrice(order.total)}</div>
      </a>
      <select class="status-select" data-id="${order.id}">
        ${ORDER_STATUSES.map(
          (status) => `<option value="${status}" ${status === order.status ? "selected" : ""}>${status}</option>`
        ).join("")}
      </select>
    </div>
  `
    )
    .join("");

  listEl.querySelectorAll(".status-select").forEach((select) => {
    select.addEventListener("change", () => {
      updateOrderStatus(Number(select.dataset.id), select.value);
      renderList();
    });
  });
}

renderTabs();
renderList();
