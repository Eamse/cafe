import { menus as seedMenus, categories } from "../../js/data.js";
import { formatPrice } from "../../js/utils.js";

const STORAGE_KEY = "cafe_admin_menus";
let activeCategory = "all";

function loadMenus() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw);
  } catch {
    /* 저장된 값이 손상된 경우 시드 데이터로 복구 */
  }
  saveMenus(seedMenus);
  return seedMenus.slice();
}

function saveMenus(list) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
}

function getCategoryName(categoryId) {
  const category = categories.find((c) => c.id === categoryId);
  return category ? category.name : categoryId;
}

function renderTabs() {
  const tabs = document.getElementById("category-tabs");
  const allTabs = [{ id: "all", name: "전체" }, ...categories];

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
  const menus = loadMenus();
  const filtered = activeCategory === "all" ? menus : menus.filter((m) => m.categoryId === activeCategory);

  if (filtered.length === 0) {
    listEl.innerHTML = `<p class="empty-state">등록된 메뉴가 없습니다.</p>`;
    return;
  }

  listEl.innerHTML = filtered
    .map(
      (menu) => `
    <div class="admin-menu-row glass-card" data-id="${menu.id}">
      <a class="row-main" href="detail.html?id=${menu.id}">
        <div class="row-name">${menu.name}</div>
        <div class="row-category">${getCategoryName(menu.categoryId)}</div>
        <div class="row-price">${formatPrice(menu.price)}</div>
      </a>
      <div class="row-actions">
        <button class="btn-soldout ${menu.isSoldOut ? "is-soldout" : ""}" data-action="toggle" data-id="${menu.id}">
          ${menu.isSoldOut ? "품절" : "판매중"}
        </button>
        <a class="btn-edit" href="edit.html?id=${menu.id}">수정</a>
        <button class="btn-delete" data-action="delete" data-id="${menu.id}">삭제</button>
      </div>
    </div>
  `
    )
    .join("");

  listEl.querySelectorAll('[data-action="toggle"]').forEach((btn) => {
    btn.addEventListener("click", () => toggleSoldOut(Number(btn.dataset.id)));
  });

  listEl.querySelectorAll('[data-action="delete"]').forEach((btn) => {
    btn.addEventListener("click", () => deleteMenu(Number(btn.dataset.id)));
  });
}

function toggleSoldOut(menuId) {
  const menus = loadMenus();
  const target = menus.find((m) => m.id === menuId);
  if (!target) return;
  target.isSoldOut = !target.isSoldOut;
  saveMenus(menus);
  renderList();
}

function deleteMenu(menuId) {
  if (!confirm("이 메뉴를 삭제하시겠습니까?")) return;
  const menus = loadMenus().filter((m) => m.id !== menuId);
  saveMenus(menus);
  renderList();
}

renderTabs();
renderList();
