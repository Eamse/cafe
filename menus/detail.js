import { menus, categories } from "../js/data.js";
import { formatPrice } from "../js/utils.js";

function getCategoryName(categoryId) {
  const category = categories.find((c) => c.id === categoryId);
  return category ? category.name : categoryId;
}

function renderMenuDetail() {
  const params = new URLSearchParams(window.location.search);
  const menuId = Number(params.get("id"));
  const menu = menus.find((m) => m.id === menuId);
  const container = document.getElementById("menu-detail");

  if (!menu) {
    container.innerHTML = `<p>메뉴를 찾을 수 없습니다.</p>`;
    return;
  }

  container.innerHTML = `
    <div class="detail-card">
      <div class="menu-category">${getCategoryName(menu.categoryId)}</div>
      <h2 class="menu-name">${menu.name}</h2>
      <div class="menu-price">${formatPrice(menu.price)}</div>
      <p class="menu-description">${menu.description}</p>
    </div>
  `;
}

renderMenuDetail();
