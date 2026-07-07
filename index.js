import { getMenus, categories } from "./js/data.js";
import { formatPrice, escapeHtml, renderCartBadge, getOrders, addToCart } from "./js/utils.js";
import { openCartPanel } from "./js/cartPanel.js";

let activeCategory = "all";
let activeSort = "default";
let activePriceRange = "all";
let searchQuery = "";

function sortMenus(menus) {
  const sorted = menus.slice();
  if (activeSort === "price-asc") sorted.sort((a, b) => a.price - b.price);
  else if (activeSort === "price-desc") sorted.sort((a, b) => b.price - a.price);
  else if (activeSort === "name") sorted.sort((a, b) => a.name.localeCompare(b.name, "ko"));
  return sorted;
}

function isInPriceRange(menu) {
  if (activePriceRange === "under5000") return menu.price <= 5000;
  if (activePriceRange === "5000to6000") return menu.price >= 5000 && menu.price <= 6000;
  if (activePriceRange === "over6000") return menu.price >= 6000;
  return true;
}

function getPopularMenuIds() {
  const counts = {};
  getOrders().forEach((order) => {
    order.items.forEach((item) => {
      counts[item.menuId] = (counts[item.menuId] || 0) + item.quantity;
    });
  });

  return new Set(
    Object.entries(counts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3)
      .map(([menuId]) => Number(menuId))
  );
}

function getCategoryName(categoryId) {
  const category = categories.find((c) => c.id === categoryId);
  return category ? category.name : categoryId;
}

function menuCardHtml(menu, popularIds) {
  const isPopular = !menu.isSoldOut && popularIds && popularIds.has(menu.id);
  return `
    <div class="menu-card cat-${menu.categoryId} ${menu.isSoldOut ? "is-soldout" : ""}" data-menu-id="${menu.id}" role="button" tabindex="0">
      <div class="menu-card-image" style="background-image: url('${escapeHtml(menu.image)}')"></div>
      ${menu.isSoldOut ? `<div class="sold-out-tag">품절</div>` : isPopular ? `<div class="popular-tag">인기</div>` : ""}
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

  row.innerHTML = featured.map((menu) => menuCardHtml(menu)).join("");
}

function renderRecentOrderWidget() {
  const section = document.getElementById("home-recent-section");
  const row = document.getElementById("recent-order-row");
  const orders = getOrders();

  if (orders.length === 0) {
    section.hidden = true;
    return;
  }

  const menus = getMenus();
  const lastOrder = orders[orders.length - 1];
  const items = lastOrder.items
    .map((item) => ({ item, menu: menus.find((m) => m.id === item.menuId) }))
    .filter(({ menu }) => menu);

  if (items.length === 0) {
    section.hidden = true;
    return;
  }

  section.hidden = false;
  row.innerHTML = items
    .map(
      ({ item, menu }) => `
    <div class="recent-item">
      <div class="recent-item-name">${escapeHtml(menu.name)}</div>
      <div class="recent-item-price">${formatPrice(menu.price)}</div>
      <button type="button" class="btn-reorder-mini" data-menu-id="${menu.id}" data-quantity="${item.quantity}">다시 담기</button>
    </div>
  `
    )
    .join("");

  row.querySelectorAll(".btn-reorder-mini").forEach((btn) => {
    btn.addEventListener("click", () => {
      addToCart(Number(btn.dataset.menuId), Number(btn.dataset.quantity));
      renderCartBadge();
      btn.textContent = "담았습니다 ✓";
      btn.disabled = true;
      setTimeout(() => {
        btn.textContent = "다시 담기";
        btn.disabled = false;
      }, 1200);
    });
  });
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
  const countEl = document.getElementById("menu-count");
  const menus = getMenus();
  const query = searchQuery.trim().toLowerCase();

  let filtered = activeCategory === "all" ? menus : menus.filter((menu) => menu.categoryId === activeCategory);
  if (query) filtered = filtered.filter((menu) => menu.name.toLowerCase().includes(query));
  filtered = filtered.filter(isInPriceRange);
  filtered = sortMenus(filtered);

  countEl.textContent = `(총 ${filtered.length}개)`;

  if (filtered.length === 0) {
    grid.innerHTML = `<p class="menu-empty">${query ? "검색 결과가 없습니다." : "등록된 메뉴가 없습니다."}</p>`;
    return;
  }

  const popularIds = getPopularMenuIds();
  grid.innerHTML = filtered.map((menu) => menuCardHtml(menu, popularIds)).join("");
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

document.getElementById("price-filter").addEventListener("change", (event) => {
  activePriceRange = event.target.value;
  renderMenuGrid();
});

document.getElementById("menu-search").addEventListener("input", (event) => {
  searchQuery = event.target.value;
  renderMenuGrid();
});

window.addEventListener("cart:updated", renderCartBadge);

renderCartBadge();
renderRecentOrderWidget();
renderFeatured();
renderTabs();
renderMenuGrid();
