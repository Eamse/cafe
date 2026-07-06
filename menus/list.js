import { menus, categories } from "../js/data.js";
import { formatPrice } from "../js/utils.js";

function getCategoryName(categoryId) {
  const category = categories.find((c) => c.id === categoryId);
  return category ? category.name : categoryId;
}

function renderMenuGrid() {
  const grid = document.getElementById("menu-grid");

  grid.innerHTML = menus
    .map(
      (menu) => `
    <a class="menu-card" href="detail.html?id=${menu.id}">
      <div class="menu-name">${menu.name}</div>
      <div class="menu-category">${getCategoryName(menu.categoryId)}</div>
      <div class="menu-price">${formatPrice(menu.price)}</div>
    </a>
  `
    )
    .join("");
}

renderMenuGrid();
