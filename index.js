import { getMenus, categories } from "./js/data.js";
import { formatPrice, escapeHtml, renderCartBadge } from "./js/utils.js";

let activeCategory = "all";

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
      renderMenuGrid();
    });
  });
}

function renderMenuGrid() {
  const grid = document.getElementById("menu-grid");
  const menus = getMenus();
  const filtered = activeCategory === "all" ? menus : menus.filter((m) => m.categoryId === activeCategory);

  if (filtered.length === 0) {
    grid.innerHTML = `<p class="menu-empty">등록된 메뉴가 없습니다.</p>`;
    return;
  }

  grid.innerHTML = filtered
    .map(
      (menu) => `
    <a class="menu-card cat-${menu.categoryId}" href="menus/detail.html?id=${menu.id}">
      ${menu.isSoldOut ? `<div class="sold-out-tag">품절</div>` : ""}
      <div class="menu-name">${escapeHtml(menu.name)}</div>
      <div class="menu-category">${getCategoryName(menu.categoryId)}</div>
      <div class="menu-price">${formatPrice(menu.price)}</div>
    </a>
  `
    )
    .join("");
}

renderTabs();
renderMenuGrid();
renderCartBadge();
