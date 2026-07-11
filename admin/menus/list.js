import { getCategories, getMenus, saveMenus, getFeaturedMenuIds, toggleFeaturedMenu } from "../../js/data.js";
import { formatPrice, escapeHtml } from "../../js/utils.js";

const FEATURED_MAX = 6;

let activeCategory = "all";

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
      renderTabs();
      renderList();
    });
  });
}

function renderList() {
  const listEl = document.getElementById("admin-menu-list");
  const menus = getMenus();
  const filtered = activeCategory === "all" ? menus : menus.filter((m) => m.categoryId === activeCategory);
  const featuredIds = getFeaturedMenuIds();

  if (filtered.length === 0) {
    listEl.innerHTML = `<p class="empty-state">등록된 메뉴가 없습니다.</p>`;
    return;
  }

  listEl.innerHTML = filtered
    .map((menu) => {
      const isFeatured = featuredIds.includes(menu.id);
      return `
    <div class="admin-menu-row glass-card cat-${menu.categoryId}" data-id="${menu.id}">
      <a class="row-main" href="detail.html?id=${menu.id}">
        <div class="row-thumb" style="${menu.image ? `background-image: url('${escapeHtml(menu.image)}')` : ""}"></div>
        <div class="row-name">${escapeHtml(menu.name)}</div>
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

renderTabs();
renderList();
