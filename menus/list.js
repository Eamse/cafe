import { getMenus, getCategories } from "../js/data.js";
import { renderAuthNav } from "../js/auth.js";
import {
  formatPrice,
  escapeHtml,
  renderCartBadge,
  getOrders,
  addToCart,
  getRecentSearches,
  addRecentSearch,
  removeRecentSearch,
  getFavorites,
  toggleFavorite,
  lazyLoadBackgroundImages,
  showToast,
  initThemeToggle,
} from "../js/utils.js";
import { openCartPanel } from "../js/cartPanel.js";

const initialParams = new URLSearchParams(window.location.search);

let activeCategory = initialParams.get("category") || "all";
let activeSort = initialParams.get("sort") || "default";
let activePriceRange = initialParams.get("price") || "all";
let searchQuery = initialParams.get("q") || "";
let favoritesOnly = initialParams.get("favorites") === "1";

let menusCache = [];
let categoriesCache = [];

function syncUrlParams() {
  const params = new URLSearchParams();
  if (activeCategory !== "all") params.set("category", activeCategory);
  if (activeSort !== "default") params.set("sort", activeSort);
  if (activePriceRange !== "all") params.set("price", activePriceRange);
  if (searchQuery.trim()) params.set("q", searchQuery.trim());
  if (favoritesOnly) params.set("favorites", "1");

  const query = params.toString();
  const newUrl = `${window.location.pathname}${query ? `?${query}` : ""}`;
  window.history.replaceState(null, "", newUrl);
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
  const category = categoriesCache.find((c) => c.id === categoryId);
  return category ? category.name : categoryId;
}

function menuCardHtml(menu, popularIds, favorites) {
  const isPopular = !menu.isSoldOut && popularIds && popularIds.has(menu.id);
  const isFavorite = favorites && favorites.has(menu.id);
  const label = `${menu.name}, ${getCategoryName(menu.categoryId)}, ${formatPrice(menu.price)}${menu.isSoldOut ? ", 품절" : ""}`;
  return `
    <div class="menu-card cat-${menu.categoryId} ${menu.isSoldOut ? "is-soldout" : ""}" data-menu-id="${menu.id}" role="button" tabindex="0" aria-label="${escapeHtml(label)}">
      <div class="menu-card-image-wrap">
        <div class="menu-card-image" data-bg="${escapeHtml(menu.image || "")}"></div>
        ${menu.isSoldOut ? `<div class="sold-out-tag">품절</div>` : isPopular ? `<div class="popular-tag">인기</div>` : ""}
        <button type="button" class="favorite-btn ${isFavorite ? "is-active" : ""}" data-menu-id="${menu.id}" aria-pressed="${isFavorite ? "true" : "false"}" aria-label="즐겨찾기 ${isFavorite ? "해제" : "추가"}">♥</button>
      </div>
      <div class="menu-card-body">
        <div class="menu-name">${escapeHtml(menu.name)}</div>
        <div class="menu-category">${getCategoryName(menu.categoryId)}</div>
        <div class="menu-price">${formatPrice(menu.price)}</div>
      </div>
    </div>
  `;
}

function renderRecentOrderWidget() {
  const section = document.getElementById("home-recent-section");
  const row = document.getElementById("recent-order-row");
  const orders = getOrders();

  if (orders.length === 0) {
    section.hidden = true;
    return;
  }

  const lastOrder = orders[orders.length - 1];
  const items = lastOrder.items
    .map((item) => ({ item, menu: menusCache.find((m) => m.id === item.menuId) }))
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
      <button type="button" class="btn-reorder-mini" data-menu-id="${menu.id}" data-quantity="${item.quantity}" data-temp="${item.temp || ''}" data-size="${item.size || ''}" ${menu.isSoldOut ? "disabled" : ""}>
        ${menu.isSoldOut ? "품절" : "다시 담기"}
      </button>
    </div>
  `
    )
    .join("");

  row.querySelectorAll(".btn-reorder-mini:not(:disabled)").forEach((btn) => {
    btn.addEventListener("click", () => {
      addToCart(Number(btn.dataset.menuId), Number(btn.dataset.quantity), { temp: btn.dataset.temp || null, size: btn.dataset.size || null });
      renderCartBadge();
      showToast("장바구니에 담았습니다");
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
  const allTabs = [{ id: "all", name: "전체" }, ...categoriesCache];

  tabs.innerHTML = allTabs
    .map(
      (tab) => `
    <button class="tab-btn ${tab.id === activeCategory ? "active" : ""}" data-category="${tab.id}">
      ${escapeHtml(tab.name)}
    </button>
  `
    )
    .join("");

  tabs.querySelectorAll(".tab-btn").forEach((btn) => {
    btn.addEventListener("click", () => {
      activeCategory = btn.dataset.category;
      renderTabs();
      renderMenuGrid();
      syncUrlParams();
    });
  });
}

function renderMenuGrid() {
  const grid = document.getElementById("menu-grid");
  const countEl = document.getElementById("menu-count");
  const query = searchQuery.trim().toLowerCase();
  const favorites = getFavorites();

  let filtered = activeCategory === "all" ? menusCache : menusCache.filter((menu) => menu.categoryId === activeCategory);
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
  lazyLoadBackgroundImages(grid);
}

function openMenuCard(cardEl) {
  const menuId = Number(cardEl.dataset.menuId);
  const menu = menusCache.find((m) => m.id === menuId);
  if (!menu) return;
  openCartPanel(menu, getCategoryName(menu.categoryId), "../basket/list.html");
}

document.addEventListener("click", (e) => {
  const favoriteBtn = e.target.closest(".favorite-btn");
  if (favoriteBtn) {
    e.stopPropagation();
    toggleFavorite(Number(favoriteBtn.dataset.menuId));
    renderMenuGrid();
    return;
  }

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
  syncUrlParams();
});

document.getElementById("sort-select").addEventListener("change", (event) => {
  activeSort = event.target.value;
  renderMenuGrid();
  syncUrlParams();
});

document.getElementById("price-filter").addEventListener("change", (event) => {
  activePriceRange = event.target.value;
  renderMenuGrid();
  syncUrlParams();
});

function renderRecentSearches() {
  const container = document.getElementById("recent-searches");
  const terms = getRecentSearches();

  if (terms.length === 0) {
    container.hidden = true;
    return;
  }

  container.hidden = false;
  container.innerHTML = `
    <span class="recent-searches-label">최근 검색어</span>
    ${terms
      .map(
        (term) => `
      <button type="button" class="recent-search-chip" data-term="${escapeHtml(term)}">
        ${escapeHtml(term)}
        <span class="recent-search-remove" data-remove-term="${escapeHtml(term)}">✕</span>
      </button>
    `
      )
      .join("")}
  `;

  container.querySelectorAll(".recent-search-remove").forEach((removeBtn) => {
    removeBtn.addEventListener("click", (e) => {
      e.stopPropagation();
      removeRecentSearch(removeBtn.dataset.removeTerm);
      renderRecentSearches();
    });
  });

  container.querySelectorAll(".recent-search-chip").forEach((chip) => {
    chip.addEventListener("click", () => {
      const term = chip.dataset.term;
      const input = document.getElementById("menu-search");
      input.value = term;
      searchQuery = term;
      renderMenuGrid();
    });
  });
}

const SUGGESTION_COUNT = 5;

function renderSearchSuggestions(query) {
  const container = document.getElementById("search-suggestions");
  const trimmed = query.trim();

  if (!trimmed) {
    container.hidden = true;
    return;
  }

  const matches = menusCache
    .filter((menu) => menu.name.toLowerCase().includes(trimmed.toLowerCase()))
    .slice(0, SUGGESTION_COUNT);

  if (matches.length === 0) {
    container.hidden = true;
    return;
  }

  container.hidden = false;
  container.innerHTML = matches
    .map(
      (menu) => `
    <a class="search-suggestion-item" href="detail.html?id=${menu.id}">
      <span class="search-suggestion-name">${escapeHtml(menu.name)}</span>
      <span class="search-suggestion-price">${formatPrice(menu.price)}</span>
    </a>
  `
    )
    .join("");
}

function hideSearchSuggestions() {
  document.getElementById("search-suggestions").hidden = true;
}

const menuSearchInput = document.getElementById("menu-search");

menuSearchInput.addEventListener("input", (event) => {
  searchQuery = event.target.value;
  renderMenuGrid();
  renderSearchSuggestions(event.target.value);
  syncUrlParams();
});

menuSearchInput.addEventListener("focus", (event) => {
  renderSearchSuggestions(event.target.value);
});

menuSearchInput.addEventListener("keydown", (event) => {
  if (event.key === "Escape") {
    hideSearchSuggestions();
    return;
  }
  if (event.key !== "Enter") return;
  addRecentSearch(event.target.value);
  renderRecentSearches();
  hideSearchSuggestions();
});

menuSearchInput.addEventListener("blur", (event) => {
  setTimeout(hideSearchSuggestions, 150);
  if (!event.target.value.trim()) return;
  addRecentSearch(event.target.value);
  renderRecentSearches();
});

window.addEventListener("cart:updated", renderCartBadge);

function applyInitialFilterState() {
  document.getElementById("menu-search").value = searchQuery;
  document.getElementById("sort-select").value = activeSort;
  document.getElementById("price-filter").value = activePriceRange;
  const favBtn = document.getElementById("favorites-toggle");
  favBtn.classList.toggle("active", favoritesOnly);
  favBtn.setAttribute("aria-pressed", String(favoritesOnly));
}

async function init() {
  [menusCache, categoriesCache] = await Promise.all([getMenus(), getCategories()]);

  applyInitialFilterState();
  initThemeToggle();
  renderAuthNav();
  renderCartBadge();
  renderRecentOrderWidget();
  renderRecentSearches();
  renderTabs();
  renderMenuGrid();
}

init();
