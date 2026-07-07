import { getMenus, categories } from "./js/data.js";
import { formatPrice, escapeHtml, renderCartBadge } from "./js/utils.js";
import { openCartPanel } from "./js/cartPanel.js";

let activeCategory = "all";
let activeSort = "default";
let searchQuery = "";

function sortMenus(menus) {
  const sorted = menus.slice();
  if (activeSort === "price-asc") sorted.sort((a, b) => a.price - b.price);
  else if (activeSort === "price-desc") sorted.sort((a, b) => b.price - a.price);
  else if (activeSort === "name") sorted.sort((a, b) => a.name.localeCompare(b.name, "ko"));
  return sorted;
}

function getCategoryName(categoryId) {
  const category = categories.find((c) => c.id === categoryId);
  return category ? category.name : categoryId;
}

function menuCardHtml(menu) {
  return `
    <div class="menu-card cat-${menu.categoryId}" data-menu-id="${menu.id}" role="button" tabindex="0">
      <div class="menu-card-image" style="background-image: url('${menu.image}')"></div>
      <div class="menu-card-body">
        <div class="menu-name">${escapeHtml(menu.name)}</div>
        <div class="menu-category">${getCategoryName(menu.categoryId)}</div>
        <div class="menu-price">${formatPrice(menu.price)}</div>
      </div>
    </div>
  `;
}

function openMenuCard(cardEl) {
  const menuId = Number(cardEl.dataset.menuId);
  const menu = getMenus().find((m) => m.id === menuId);
  if (!menu) return;
  openCartPanel(menu, getCategoryName(menu.categoryId), "basket/list.html");
}

function renderFeatured() {
  const row = document.getElementById("featured-row");
  const menus = getMenus();

  const featured = categories
    .map((category) => menus.find((menu) => menu.categoryId === category.id && !menu.isSoldOut))
    .filter(Boolean);

  row.innerHTML = featured.map(menuCardHtml).join("");
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
  const query = searchQuery.trim().toLowerCase();

  let filtered = activeCategory === "all" ? menus : menus.filter((menu) => menu.categoryId === activeCategory);
  if (query) filtered = filtered.filter((menu) => menu.name.toLowerCase().includes(query));
  filtered = sortMenus(filtered);

  if (filtered.length === 0) {
    grid.innerHTML = `<p class="menu-empty">${query ? "검색 결과가 없습니다." : "등록된 메뉴가 없습니다."}</p>`;
    return;
  }

  grid.innerHTML = filtered.map(menuCardHtml).join("");
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

document.getElementById("sort-select").addEventListener("change", (event) => {
  activeSort = event.target.value;
  renderMenuGrid();
});

document.getElementById("menu-search").addEventListener("input", (event) => {
  searchQuery = event.target.value;
  renderMenuGrid();
});

window.addEventListener("cart:updated", renderCartBadge);

renderCartBadge();
renderFeatured();
renderTabs();
renderMenuGrid();
