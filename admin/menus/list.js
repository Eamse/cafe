import { getCategories, getMenus, saveMenus, getFeaturedMenuIds, toggleFeaturedMenu } from "../../js/data.js";
import { formatPrice, escapeHtml } from "../../js/utils.js";

const FEATURED_MAX = 6;

let activeCategory = "all";
let searchQuery = "";
const selectedIds = new Set();

function getCategoryName(categoryId) {
  const category = getCategories().find((c) => c.id === categoryId);
  return category ? category.name : categoryId;
}

function renderTabs() {
  const tabs = document.getElementById("category-tabs");
  const allTabs = [{ id: "all", name: "전체" }, ...getCategories()];

  tabs.innerHTML = allTabs
    .map(
      (tab) => `
    <button class="tab-btn ${tab.id === activeCategory ? "active" : ""}" data-category="${tab.id}">
      ${tab.name}
    </button>
  `
    )
    .join("");

  tabs.querySelectorAll(".tab-btn").forEach((btn) => {
    btn.addEventListener("click", () => {
      activeCategory = btn.dataset.category;
      selectedIds.clear();
      renderTabs();
      renderList();
    });
  });
}

function renderBulkBar() {
  const bar = document.getElementById("bulk-action-bar");
  const countEl = document.getElementById("bulk-count");

  if (selectedIds.size === 0) {
    bar.hidden = true;
    return;
  }
  bar.hidden = false;
  countEl.textContent = `${selectedIds.size}개 선택됨`;
}

function updateSelectAllCheckboxState(total) {
  const selectAll = document.getElementById("select-all-checkbox");
  selectAll.checked = total > 0 && selectedIds.size === total;
  selectAll.indeterminate = selectedIds.size > 0 && selectedIds.size < total;
}

function getFilteredMenus() {
  const menus = getMenus();
  const query = searchQuery.trim().toLowerCase();
  let filtered = activeCategory === "all" ? menus : menus.filter((m) => m.categoryId === activeCategory);
  if (query) filtered = filtered.filter((m) => m.name.toLowerCase().includes(query));
  return filtered;
}

function renderList() {
  const listEl = document.getElementById("admin-menu-list");
  const filtered = getFilteredMenus();
  const featuredIds = getFeaturedMenuIds();

  const visibleIds = new Set(filtered.map((m) => m.id));
  selectedIds.forEach((id) => {
    if (!visibleIds.has(id)) selectedIds.delete(id);
  });

  if (filtered.length === 0) {
    listEl.innerHTML = `<p class="empty-state">${searchQuery.trim() ? "검색 결과가 없습니다." : "등록된 메뉴가 없습니다."}</p>`;
    renderBulkBar();
    updateSelectAllCheckboxState(0);
    return;
  }

  listEl.innerHTML = filtered
    .map((menu) => {
      const isFeatured = featuredIds.includes(menu.id);
      return `
    <div class="admin-menu-row glass-card cat-${menu.categoryId} ${selectedIds.has(menu.id) ? "is-selected" : ""}" data-id="${menu.id}">
      <label class="row-checkbox">
        <input type="checkbox" data-select-id="${menu.id}" ${selectedIds.has(menu.id) ? "checked" : ""} />
      </label>
      <a class="row-main" href="detail?id=${menu.id}">
        <div class="row-thumb" style="${menu.image ? `background-image: url('${escapeHtml(menu.image)}')` : ""}"></div>
        <div class="row-name">
          ${escapeHtml(menu.name)}
          ${menu.hasTempOption ? `<span class="row-option-tag">온도</span>` : ""}
          ${menu.hasSizeOption ? `<span class="row-option-tag">사이즈</span>` : ""}
        </div>
        <div class="row-category">${getCategoryName(menu.categoryId)}</div>
        <div class="row-price">${formatPrice(menu.price)}</div>
      </a>
      <div class="row-actions">
        <button class="btn-featured ${isFeatured ? "is-featured" : ""}" data-action="feature" data-id="${menu.id}" title="오늘의 추천 노출 여부">
          ${isFeatured ? "★ 추천중" : "☆ 추천"}
        </button>
        <button class="btn-soldout ${menu.isSoldOut ? "is-soldout" : ""}" data-action="toggle" data-id="${menu.id}">
          ${menu.isSoldOut ? "품절" : "판매중"}
        </button>
        <a class="btn-edit" href="edit?id=${menu.id}">수정</a>
        <button class="btn-delete" data-action="delete" data-id="${menu.id}">삭제</button>
      </div>
    </div>
  `;
    })
    .join("");

  listEl.querySelectorAll('[data-action="toggle"]').forEach((btn) => {
    btn.addEventListener("click", () => toggleSoldOut(Number(btn.dataset.id)));
  });

  listEl.querySelectorAll('[data-action="delete"]').forEach((btn) => {
    btn.addEventListener("click", () => deleteMenu(Number(btn.dataset.id)));
  });

  listEl.querySelectorAll('[data-action="feature"]').forEach((btn) => {
    btn.addEventListener("click", () => toggleFeatured(Number(btn.dataset.id)));
  });

  listEl.querySelectorAll("[data-select-id]").forEach((checkbox) => {
    checkbox.addEventListener("change", () => {
      const id = Number(checkbox.dataset.selectId);
      if (checkbox.checked) selectedIds.add(id);
      else selectedIds.delete(id);
      renderList();
    });
  });

  renderBulkBar();
  updateSelectAllCheckboxState(filtered.length);
}

function toggleFeatured(menuId) {
  const current = getFeaturedMenuIds();
  if (!current.includes(menuId) && current.length >= FEATURED_MAX) {
    alert(`오늘의 추천은 최대 ${FEATURED_MAX}개까지 고를 수 있어요. 다른 메뉴를 먼저 해제해주세요.`);
    return;
  }
  toggleFeaturedMenu(menuId);
  renderList();
}

function toggleSoldOut(menuId) {
  const menus = getMenus();
  const target = menus.find((m) => m.id === menuId);
  if (!target) return;
  target.isSoldOut = !target.isSoldOut;
  saveMenus(menus);
  renderList();
}

function deleteMenu(menuId) {
  if (!confirm("이 메뉴를 삭제하시겠습니까?")) return;
  const menus = getMenus().filter((m) => m.id !== menuId);
  saveMenus(menus);
  renderList();
}

function handleBulkAction(action) {
  if (selectedIds.size === 0) return;

  if (action === "delete") {
    if (!confirm(`선택한 ${selectedIds.size}개 메뉴를 삭제하시겠습니까?`)) return;
    const menus = getMenus().filter((m) => !selectedIds.has(m.id));
    saveMenus(menus);
  } else {
    const menus = getMenus();
    menus.forEach((menu) => {
      if (!selectedIds.has(menu.id)) return;
      menu.isSoldOut = action === "soldout";
    });
    saveMenus(menus);
  }

  selectedIds.clear();
  renderList();
}

document.getElementById("select-all-checkbox").addEventListener("change", (event) => {
  const filtered = getFilteredMenus();
  if (event.target.checked) filtered.forEach((m) => selectedIds.add(m.id));
  else filtered.forEach((m) => selectedIds.delete(m.id));
  renderList();
});

document.getElementById("bulk-clear-btn").addEventListener("click", () => {
  selectedIds.clear();
  renderList();
});

document.querySelectorAll("[data-bulk-action]").forEach((btn) => {
  btn.addEventListener("click", () => handleBulkAction(btn.dataset.bulkAction));
});

document.getElementById("menu-name-search").addEventListener("input", (event) => {
  searchQuery = event.target.value;
  renderList();
});

renderTabs();
renderList();
