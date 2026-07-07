import { getMenus, categories } from "../js/data.js";
import { formatPrice, escapeHtml } from "../js/utils.js";

function getCategoryName(categoryId) {
  const category = categories.find((c) => c.id === categoryId);
  return category ? category.name : categoryId;
}

function renderMenuGrid() {
  const grid = document.getElementById("menu-grid");
  const menus = getMenus();

  if (menus.length === 0) {
    grid.innerHTML = `<p class="menu-empty">등록된 메뉴가 없습니다.</p>`;
    return;
  }

  grid.innerHTML = menus
    .map(
      (menu) => `
    <a class="menu-card cat-${menu.categoryId}" href="detail.html?id=${menu.id}">
      <div class="menu-name">${escapeHtml(menu.name)}</div>
      <div class="menu-category">${getCategoryName(menu.categoryId)}</div>
      <div class="menu-price">${formatPrice(menu.price)}</div>
    </a>
  `
    )
    .join("");
}

renderMenuGrid();
