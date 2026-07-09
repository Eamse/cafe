import { getMenus, categories } from "./js/data.js";
import { formatPrice, escapeHtml, renderCartBadge, getOrders } from "./js/utils.js";
import { openCartPanel } from "./js/cartPanel.js";

let activeCategory = "all";
let activeSort = "default";
let activePriceRange = "all";
let searchQuery = "";
let favoritesOnly = false;

const RECENTLY_VIEWED_KEY = "cafe_recently_viewed";
const RECENTLY_VIEWED_MAX = 6;
const FAVORITES_KEY = "cafe_favorites";

function getRecentlyViewed() {
  try {
    return JSON.parse(localStorage.getItem(RECENTLY_VIEWED_KEY)) || [];
  } catch {
    return [];
  }
}

function addRecentlyViewed(menuId) {
  const ids = getRecentlyViewed().filter((id) => id !== menuId);
  ids.unshift(menuId);
  localStorage.setItem(RECENTLY_VIEWED_KEY, JSON.stringify(ids.slice(0, RECENTLY_VIEWED_MAX)));
}

function getFavorites() {
  try {
    return new Set(JSON.parse(localStorage.getItem(FAVORITES_KEY)) || []);
  } catch {
    return new Set();
  }
}

function toggleFavorite(menuId) {
  const favorites = getFavorites();
  if (favorites.has(menuId)) favorites.delete(menuId);
  else favorites.add(menuId);
  localStorage.setItem(FAVORITES_KEY, JSON.stringify([...favorites]));
}

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

function menuCardHtml(menu, popularIds, favorites) {
  const isPopular = !menu.isSoldOut && popularIds && popularIds.has(menu.id);
  const isFavorite = favorites && favorites.has(menu.id);
  const label = `${menu.name}, ${getCategoryName(menu.categoryId)}, ${formatPrice(menu.price)}${menu.isSoldOut ? ", 품절" : ""}`;
  return `
    <div class="menu-card cat-${menu.categoryId} ${menu.isSoldOut ? "is-soldout" : ""}" data-menu-id="${menu.id}" role="button" tabindex="0" aria-label="${escapeHtml(label)}">
      <div class="menu-card-image-wrap">
        <div class="menu-card-image" style="background-image: url('${escapeHtml(menu.image)}')"></div>
        ${menu.isSoldOut ? `<div class="sold-out-tag">품절</div>` : isPopular ? `<div class="popular-tag">인기</div>` : ""}
        <button type="button" class="favorite-btn ${isFavorite ? "is-active" : ""}" data-menu-id="${menu.id}" aria-pressed="${isFavorite ? "true" : "false"}" aria-label="즐겨찾기 ${isFavorite ? "해제" : "추가"}">♥</button>
      </div>
      <div class="menu-card-body">
        <div class="menu-name">${escapeHtml(menu.name)}</div>
        <div class="menu-category">${getCategoryName(menu.categoryId)}</div>
        <div class="menu-card-footer">
          <span class="menu-price">${formatPrice(menu.price)}</span>
          <a href="menus/detail.html?id=${menu.id}" class="menu-detail-link" aria-label="${escapeHtml(menu.name)} 상세보기">🔍</a>
        </div>
      </div>
    </div>
  `;
}

function openMenuCard(cardEl) {
  const menuId = Number(cardEl.dataset.menuId);
  const menu = getMenus().find((m) => m.id === menuId);
  if (!menu) return;
  addRecentlyViewed(menuId);
  renderRecentlyViewedWidget();
  openCartPanel(menu, getCategoryName(menu.categoryId), "basket/list.html");
}

function renderFeatured() {
  const row = document.getElementById("featured-row");
  const menus = getMenus();
  const favorites = getFavorites();

  const featured = categories
    .map((category) => menus.find((menu) => menu.categoryId === category.id && !menu.isSoldOut))
    .filter(Boolean);

  row.innerHTML = featured.map((menu) => menuCardHtml(menu, null, favorites)).join("");
}

function renderRecentlyViewedWidget() {
  const section = document.getElementById("home-viewed-section");
  const row = document.getElementById("recent-viewed-row");
  const viewedIds = getRecentlyViewed();

  if (viewedIds.length === 0) {
    section.hidden = true;
    return;
  }

  const menus = getMenus();
  const items = viewedIds.map((id) => menus.find((m) => m.id === id)).filter(Boolean);

  if (items.length === 0) {
    section.hidden = true;
    return;
  }

  section.hidden = false;
  row.innerHTML = items
    .map(
      (menu) => `
    <div class="recent-item" data-menu-id="${menu.id}" role="button" tabindex="0" aria-label="${escapeHtml(menu.name)} 다시 보기">
      <div class="recent-item-name">${escapeHtml(menu.name)}</div>
      <div class="recent-item-price">${formatPrice(menu.price)}</div>
    </div>
  `
    )
    .join("");

  row.querySelectorAll(".recent-item").forEach((el) => {
    el.addEventListener("click", () => openMenuCard(el));
    el.addEventListener("keydown", (e) => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        openMenuCard(el);
      }
    });
  });
}

function renderTabs() {
  const tabs = document.getElementById("category-tabs");
  const allTabs = [{ id: "all", name: "전체" }, ...categories];

  tabs.innerHTML = allTabs
    .map(
      (tab) => `
    <button class="tab-btn ${tab.id === activeCategory ? "active" : ""}" data-category="${tab.id}" aria-pressed="${tab.id === activeCategory ? "true" : "false"}">
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
  const favorites = getFavorites();

  let filtered = activeCategory === "all" ? menus : menus.filter((menu) => menu.categoryId === activeCategory);
  if (query) filtered = filtered.filter((menu) => menu.name.toLowerCase().includes(query));
  filtered = filtered.filter(isInPriceRange);
  if (favoritesOnly) filtered = filtered.filter((menu) => favorites.has(menu.id));
  filtered = sortMenus(filtered);

  countEl.textContent = `(총 ${filtered.length}개)`;

  if (filtered.length === 0) {
    grid.innerHTML = `<p class="menu-empty">${favoritesOnly ? "즐겨찾기한 메뉴가 없습니다." : query ? "검색 결과가 없습니다." : "등록된 메뉴가 없습니다."}</p>`;
    return;
  }

  const popularIds = getPopularMenuIds();
  grid.innerHTML = filtered.map((menu) => menuCardHtml(menu, popularIds, favorites)).join("");
}

document.addEventListener("click", (e) => {
  const favoriteBtn = e.target.closest(".favorite-btn");
  if (favoriteBtn) {
    e.stopPropagation();
    toggleFavorite(Number(favoriteBtn.dataset.menuId));
    renderMenuGrid();
    renderFeatured();
    return;
  }

  if (e.target.closest(".menu-detail-link")) return;

  const card = e.target.closest(".menu-card[data-menu-id]");
  if (card) openMenuCard(card);
});

document.addEventListener("keydown", (e) => {
  if (e.key !== "Enter" && e.key !== " ") return;
  if (e.target.closest(".favorite-btn")) return;

  const card = e.target.closest(".menu-card[data-menu-id]");
  if (card) {
    e.preventDefault();
    openMenuCard(card);
  }
});

document.getElementById("favorites-toggle").addEventListener("click", () => {
  favoritesOnly = !favoritesOnly;
  const btn = document.getElementById("favorites-toggle");
  btn.classList.toggle("active", favoritesOnly);
  btn.setAttribute("aria-pressed", String(favoritesOnly));
  renderMenuGrid();
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

document.getElementById("viewed-sidebar-toggle").addEventListener("click", () => {
  const sidebar = document.getElementById("home-viewed-section");
  const toggle = document.getElementById("viewed-sidebar-toggle");
  const isOpen = sidebar.classList.toggle("is-open");
  toggle.setAttribute("aria-expanded", isOpen ? "true" : "false");
});

window.addEventListener("cart:updated", renderCartBadge);

renderCartBadge();
renderRecentlyViewedWidget();
renderFeatured();
renderTabs();
renderMenuGrid();
