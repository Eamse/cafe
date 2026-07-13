import { getMenus } from "../js/data.js";
import {
  renderAuthNav,
  requireCustomerAuth,
  getCurrentCustomer,
  getCustomerAddresses,
  addAddress,
  updateAddress,
  removeAddress,
  setDefaultAddress,
} from "../js/auth.js";
requireCustomerAuth();
import {
  formatPrice,
  formatDate,
  escapeHtml,
  renderCartBadge,
  getOrders,
  getFavorites,
  clearFavorites,
  lazyLoadBackgroundImages,
  getNickname,
  saveNickname,
  initThemeToggle,
  appPath,
} from "../js/utils.js";

const RECENT_COUNT = 3;

function renderProfileName() {
  const nickname = getNickname();
  const customer = getCurrentCustomer();
  const displayName = nickname || customer?.name || "게스트";
  document.getElementById("profile-name").textContent = `${displayName}님`;
}

function initProfileNameEditor() {
  const nameEl = document.getElementById("profile-name");
  const editBtn = document.getElementById("profile-name-edit-btn");
  const form = document.getElementById("profile-name-form");
  const input = document.getElementById("profile-name-input");
  const cancelBtn = document.getElementById("profile-name-cancel");

  editBtn.addEventListener("click", () => {
    input.value = getNickname();
    nameEl.hidden = true;
    editBtn.hidden = true;
    form.hidden = false;
    input.focus();
  });

  cancelBtn.addEventListener("click", () => {
    form.hidden = true;
    nameEl.hidden = false;
    editBtn.hidden = false;
  });

  form.addEventListener("submit", (event) => {
    event.preventDefault();
    saveNickname(input.value);
    renderProfileName();
    form.hidden = true;
    nameEl.hidden = false;
    editBtn.hidden = false;
  });
}

function renderSummary(orders, favoriteCount) {
  const totalCount = orders.length;
  const totalAmount = orders.reduce((sum, order) => sum + order.total, 0);

  document.getElementById("summary-count").textContent = `${totalCount}건`;
  document.getElementById("summary-total").textContent = formatPrice(totalAmount);
  document.getElementById("summary-favorites").textContent = `${favoriteCount}개`;
}

async function renderFavoriteMenus() {
  const listEl = document.getElementById("favorite-menus-list");
  const clearBtn = document.getElementById("clear-favorites-btn");
  const favoriteIds = getFavorites();

  if (favoriteIds.size === 0) {
    listEl.innerHTML = `<p class="empty-state">아직 즐겨찾기한 메뉴가 없습니다.</p>`;
    clearBtn.hidden = true;
    return 0;
  }

  const allMenus = await getMenus();
  const menus = allMenus.filter((menu) => favoriteIds.has(menu.id));

  if (menus.length === 0) {
    listEl.innerHTML = `<p class="empty-state">아직 즐겨찾기한 메뉴가 없습니다.</p>`;
    clearBtn.hidden = true;
    return 0;
  }

  clearBtn.hidden = false;

  listEl.innerHTML = menus
    .map(
      (menu) => `
    <a class="favorite-menu-card ${menu.isSoldOut ? "is-soldout" : ""}" href="${appPath("menus/detail.html")}?id=${menu.id}">
      <div class="favorite-menu-image" data-bg="${escapeHtml(menu.image || "")}"></div>
      <div class="favorite-menu-name">${escapeHtml(menu.name)}</div>
      <div class="favorite-menu-price">${formatPrice(menu.price)}</div>
      ${menu.isSoldOut ? `<div class="favorite-menu-soldout">품절</div>` : ""}
    </a>
  `
    )
    .join("");

  lazyLoadBackgroundImages(listEl);

  return menus.length;
}

function renderRecentOrders(orders) {
  const listEl = document.getElementById("recent-orders-list");
  const recent = orders.slice().reverse().slice(0, RECENT_COUNT);

  if (recent.length === 0) {
    listEl.innerHTML = `<p class="empty-state">아직 주문 내역이 없습니다.</p>`;
    return;
  }

  listEl.innerHTML = recent
    .map(
      (order) => `
    <a class="recent-order-card ${order.status === "취소" ? "is-cancelled" : ""}" href="${appPath("orders/detail.html")}?id=${order.id}">
      <div class="order-date">${formatDate(order.createdAt)}</div>
      <div class="order-summary">${escapeHtml(order.items[0].name)}${order.items.length > 1 ? ` 외 ${order.items.length - 1}건` : ""}</div>
      <div class="order-status">${order.status}</div>
      <div class="order-total">${formatPrice(order.total)}</div>
    </a>
  `
    )
    .join("");
}

async function refreshFavorites() {
  const favoriteCount = await renderFavoriteMenus();
  renderSummary(getOrders(), favoriteCount);
}

/* ---------- 탭 전환 ---------- */

function initTabs() {
  const tabs = [
    { btn: document.getElementById("tab-btn-info"), panel: document.getElementById("tab-panel-info") },
    { btn: document.getElementById("tab-btn-address"), panel: document.getElementById("tab-panel-address") },
  ];

  tabs.forEach(({ btn, panel }) => {
    btn.addEventListener("click", () => {
      tabs.forEach(({ btn: b, panel: p }) => {
        const isActive = b === btn;
        b.classList.toggle("active", isActive);
        b.setAttribute("aria-selected", String(isActive));
        p.hidden = !isActive;
      });
      if (panel.id === "tab-panel-address") renderAddresses();
    });
  });
}

/* ---------- 주소 관리 ---------- */

let editingAddressId = null;

function resetAddressForm() {
  editingAddressId = null;
  document.getElementById("address-form").reset();
  document.getElementById("address-form-title").textContent = "새 주소 추가";
  document.getElementById("address-submit-btn").textContent = "추가";
  document.getElementById("address-cancel-edit-btn").hidden = true;
  document.getElementById("address-form-error").hidden = true;
}

function renderAddresses() {
  const listEl = document.getElementById("address-list");
  const addresses = getCustomerAddresses();

  if (addresses.length === 0) {
    listEl.innerHTML = `<p class="empty-state">등록된 주소가 없습니다.</p>`;
  } else {
    listEl.innerHTML = addresses
      .map(
        (addr) => `
      <div class="address-card ${addr.isDefault ? "is-default" : ""}" data-id="${addr.id}">
        <div class="address-card-head">
          <span class="address-label">${escapeHtml(addr.label)}</span>
          ${addr.isDefault ? `<span class="address-default-tag">기본 주소</span>` : ""}
        </div>
        <div class="address-recipient">${escapeHtml(addr.recipientName)} · ${escapeHtml(addr.phone)}</div>
        <div class="address-detail">${escapeHtml(addr.address)}</div>
        <div class="address-actions">
          ${addr.isDefault ? "" : `<button type="button" data-action="default">기본으로 설정</button>`}
          <button type="button" data-action="edit">수정</button>
          <button type="button" data-action="delete">삭제</button>
        </div>
      </div>
    `
      )
      .join("");
  }

  listEl.querySelectorAll(".address-card").forEach((card) => {
    const id = card.dataset.id;

    card.querySelector('[data-action="default"]')?.addEventListener("click", () => {
      setDefaultAddress(id);
      renderAddresses();
    });

    card.querySelector('[data-action="delete"]').addEventListener("click", () => {
      if (!confirm("이 주소를 삭제하시겠습니까?")) return;
      removeAddress(id);
      if (editingAddressId === id) resetAddressForm();
      renderAddresses();
    });

    card.querySelector('[data-action="edit"]').addEventListener("click", () => {
      const addr = getCustomerAddresses().find((a) => a.id === id);
      if (!addr) return;
      editingAddressId = id;
      document.getElementById("address-label").value = addr.label;
      document.getElementById("address-recipient").value = addr.recipientName;
      document.getElementById("address-phone").value = addr.phone;
      document.getElementById("address-detail").value = addr.address;
      document.getElementById("address-form-title").textContent = "주소 수정";
      document.getElementById("address-submit-btn").textContent = "저장";
      document.getElementById("address-cancel-edit-btn").hidden = false;
      document.getElementById("address-label").focus();
    });
  });
}

function initAddressForm() {
  document.getElementById("address-form").addEventListener("submit", (event) => {
    event.preventDefault();

    const fields = {
      label: document.getElementById("address-label").value.trim(),
      recipientName: document.getElementById("address-recipient").value.trim(),
      phone: document.getElementById("address-phone").value.trim(),
      address: document.getElementById("address-detail").value.trim(),
    };

    if (!fields.label || !fields.recipientName || !fields.phone || !fields.address) {
      const errorEl = document.getElementById("address-form-error");
      errorEl.textContent = "모든 항목을 입력해주세요.";
      errorEl.hidden = false;
      return;
    }

    if (editingAddressId) {
      updateAddress(editingAddressId, fields);
    } else {
      addAddress(fields);
    }

    resetAddressForm();
    renderAddresses();
  });

  document.getElementById("address-cancel-edit-btn").addEventListener("click", resetAddressForm);
}

async function init() {
  renderProfileName();
  initProfileNameEditor();
  const orders = getOrders();
  const favoriteCount = await renderFavoriteMenus();
  renderSummary(orders, favoriteCount);
  renderRecentOrders(orders);
  renderCartBadge();
  initThemeToggle();
  renderAuthNav();
  initTabs();
  initAddressForm();

  document.getElementById("clear-favorites-btn").addEventListener("click", () => {
    if (!confirm("즐겨찾기한 메뉴를 전부 삭제하시겠습니까?")) return;
    clearFavorites();
    refreshFavorites();
  });
}

init();
