import { initAdminGuard } from "../../js/auth.js";
initAdminGuard();
import { getCategories, getMenus, setMenusSoldOut, deleteMenus, getFeaturedMenuIds, toggleFeaturedMenu } from "../../js/data.js";
import { formatPrice, escapeHtml } from "../../js/utils.js";

const FEATURED_MAX = 6;

let activeCategory = "all";
let searchQuery = "";
const selectedIds = new Set();

let categoriesCache = [];
let menusCache = [];
let featuredIdsCache = [];

function getCategoryName(categoryId) {
  const category = categoriesCache.find((c) => c.id === categoryId);
  return category ? category.name : categoryId;
}

function renderTabs() {
  const tabs = document.getElementById("category-tabs");
  const allTabs = [{ id: "all", name: "전체" }, ...categoriesCache];

  tabs.innerHTML = allTabs
    .map(
      (tab) => `
    <button class="tab-btn ${tab.id === activeCategory ? "active" : ""}" data-category="${tab.id}">
      ${escapeHtml(tab.name)}
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
  const query = searchQuery.trim().toLowerCase();
  let filtered = activeCategory === "all" ? menusCache : menusCache.filter((m) => m.categoryId === activeCategory);
  if (query) filtered = filtered.filter((m) => m.name.toLowerCase().includes(query));
  return filtered;
}

function renderList() {
  const listEl = document.getElementById("admin-menu-list");
  const filtered = getFilteredMenus();

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
      const isFeatured = featuredIdsCache.includes(menu.id);
      return `
    <div class="admin-menu-row glass-card cat-${menu.categoryId} ${selectedIds.has(menu.id) ? "is-selected" : ""}" data-id="${menu.id}">
      <label class="row-checkbox">
        <input type="checkbox" data-select-id="${menu.id}" ${selectedIds.has(menu.id) ? "checked" : ""} />
      </label>
      <a class="row-main" href="detail.html?id=${menu.id}">
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
        <a class="btn-edit" href="edit.html?id=${menu.id}">수정</a>
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

async function toggleFeatured(menuId) {
  if (!featuredIdsCache.includes(menuId) && featuredIdsCache.length >= FEATURED_MAX) {
    alert(`오늘의 추천은 최대 ${FEATURED_MAX}개까지 고를 수 있어요. 다른 메뉴를 먼저 해제해주세요.`);
    return;
  }
  featuredIdsCache = await toggleFeaturedMenu(menuId);
  renderList();
}

async function toggleSoldOut(menuId) {
  const target = menusCache.find((m) => m.id === menuId);
  if (!target) return;
  await setMenusSoldOut([menuId], !target.isSoldOut);
  target.isSoldOut = !target.isSoldOut;
  renderList();
}

async function deleteMenu(menuId) {
  if (!confirm("이 메뉴를 삭제하시겠습니까?")) return;
  await deleteMenus([menuId]);
  menusCache = menusCache.filter((m) => m.id !== menuId);
  renderList();
}

async function handleBulkAction(action) {
  if (selectedIds.size === 0) return;

  const ids = [...selectedIds];

  if (action === "delete") {
    if (!confirm(`선택한 ${selectedIds.size}개 메뉴를 삭제하시겠습니까?`)) return;
    await deleteMenus(ids);
    menusCache = menusCache.filter((m) => !selectedIds.has(m.id));
  } else {
    await setMenusSoldOut(ids, action === "soldout");
    menusCache.forEach((menu) => {
      if (selectedIds.has(menu.id)) menu.isSoldOut = action === "soldout";
    });
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

async function init() {
  [categoriesCache, menusCache, featuredIdsCache] = await Promise.all([getCategories(), getMenus(), getFeaturedMenuIds()]);
  renderTabs();
  renderList();
}

init();
