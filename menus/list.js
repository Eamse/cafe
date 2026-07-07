import { getMenus, categories } from "../js/data.js";
import { formatPrice, escapeHtml, renderCartBadge } from "../js/utils.js";
import { openCartPanel } from "../js/cartPanel.js";

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
    <div class="menu-card cat-${menu.categoryId}" data-menu-id="${menu.id}" role="button" tabindex="0">
      <div class="menu-name">${escapeHtml(menu.name)}</div>
      <div class="menu-category">${getCategoryName(menu.categoryId)}</div>
      <div class="menu-price">${formatPrice(menu.price)}</div>
    </div>
  `
    )
    .join("");
}

function openMenuCard(cardEl) {
  const menuId = Number(cardEl.dataset.menuId);
  const menu = getMenus().find((m) => m.id === menuId);
  if (!menu) return;
  openCartPanel(menu, getCategoryName(menu.categoryId), "../basket/list.html");
}

document.addEventListener("click", (e) => {
  const card = e.target.closest(".menu-card[data-menu-id]");
  if (card) openMenuCard(card);
});

document.addEventListener("keydown", (e) => {
  if (e.key !== "Enter" && e.key !== " ") return;
  const card = e.target.closest(".menu-card[data-menu-id]");
  if (card) {
    e.preventDefault();
    openMenuCard(card);
  }
});

window.addEventListener("cart:updated", renderCartBadge);

renderMenuGrid();
renderCartBadge();
