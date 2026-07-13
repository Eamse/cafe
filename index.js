import { getMenus, getCategories, getFeaturedMenuIds, getNotices, getActiveNoticeIds, getEvents, isEventEnded } from "./js/data.js";
import { renderAuthNav } from "./js/auth.js";
import {
  formatPrice,
  escapeHtml,
  renderCartBadge,
  getOrders,
  getFavorites,
  toggleFavorite,
  getRecentSearches,
  addRecentSearch,
  removeRecentSearch,
  lazyLoadBackgroundImages,
  initThemeToggle,
} from "./js/utils.js";
import { openCartPanel } from "./js/cartPanel.js";

const initialParams = new URLSearchParams(window.location.search);

let activeCategory = initialParams.get("category") || "all";
let activeSort = initialParams.get("sort") || "default";
let activePriceRange = initialParams.get("price") || "all";
let searchQuery = initialParams.get("q") || "";
let favoritesOnly = initialParams.get("favorites") === "1";

// 필터/정렬/검색 상태를 주소창에 반영해, 새로고침·뒤로가기·링크 공유 시에도
// 같은 화면을 다시 볼 수 있게 한다. 방문 기록이 지저분해지지 않도록 push가
// 아닌 replace만 사용.
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

const RECENTLY_VIEWED_KEY = "cafe_recently_viewed";
const RECENTLY_VIEWED_MAX = 10;

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

function clearRecentlyViewed() {
  localStorage.removeItem(RECENTLY_VIEWED_KEY);
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
  const category = getCategories().find((c) => c.id === categoryId);
  return category ? category.name : categoryId;
}

function menuCardHtml(menu, popularIds, favorites) {
  const isPopular = !menu.isSoldOut && popularIds && popularIds.has(menu.id);
  const isFavorite = favorites && favorites.has(menu.id);
  const label = `${menu.name}, ${getCategoryName(menu.categoryId)}, ${formatPrice(menu.price)}${menu.isSoldOut ? ", 품절" : ""}`;
  return `
    <div class="menu-card cat-${menu.categoryId} ${menu.isSoldOut ? "is-soldout" : ""}" data-menu-id="${menu.id}" role="button" tabindex="0" aria-label="${escapeHtml(label)}">
      <div class="menu-card-image-wrap">
        <div class="menu-card-image" data-bg="${escapeHtml(menu.image)}"></div>
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
  const featuredIds = getFeaturedMenuIds();

  // 관리자가 "오늘의 추천"으로 직접 고른 메뉴가 있으면 그걸 우선 사용하고,
  // 하나도 안 골랐으면 기존처럼 카테고리별 대표 메뉴로 자동 채운다.
  const featured =
    featuredIds.length > 0
      ? featuredIds.map((id) => menus.find((menu) => menu.id === id && !menu.isSoldOut)).filter(Boolean)
      : getCategories()
          .map((category) => menus.find((menu) => menu.categoryId === category.id && !menu.isSoldOut))
          .filter(Boolean);

  row.innerHTML = featured.map((menu) => menuCardHtml(menu, null, favorites)).join("");
  lazyLoadBackgroundImages(row);
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
  const allTabs = [{ id: "all", name: "전체" }, ...getCategories()];

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
      syncUrlParams();
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
  lazyLoadBackgroundImages(grid);
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

  const matches = getMenus()
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
    <a class="search-suggestion-item" href="menus/detail.html?id=${menu.id}">
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
  // 제안 목록 클릭이 blur보다 먼저 처리되도록 살짝 지연 후 닫는다.
  setTimeout(hideSearchSuggestions, 150);
  if (!event.target.value.trim()) return;
  addRecentSearch(event.target.value);
  renderRecentSearches();
});

document.getElementById("viewed-sidebar-toggle").addEventListener("click", () => {
  const sidebar = document.getElementById("home-viewed-section");
  const toggle = document.getElementById("viewed-sidebar-toggle");
  const isOpen = sidebar.classList.toggle("is-open");
  toggle.setAttribute("aria-expanded", isOpen ? "true" : "false");
});

window.addEventListener("cart:updated", renderCartBadge);

function initHeroSlider() {
  const track = document.getElementById("hero-slide-track");
  const slides = track ? track.querySelectorAll(".hero-slide") : [];
  const dots = document.querySelectorAll("#hero-dots .hero-dot");
  const prevBtn = document.getElementById("hero-arrow-left");
  const nextBtn = document.getElementById("hero-arrow-right");
  if (!track || dots.length === 0) return;

  const slideCount = dots.length;
  let current = 0;
  let timer = null;

  function goTo(index) {
    current = (index + slideCount) % slideCount;
    slides.forEach((slide, i) => slide.classList.toggle("is-active", i === current));
    dots.forEach((dot, i) => dot.classList.toggle("active", i === current));
  }

  function next() {
    goTo(current + 1);
  }

  function prev() {
    goTo(current - 1);
  }

  function startAutoplay() {
    stopAutoplay();
    timer = setInterval(next, 5000);
  }

  function stopAutoplay() {
    if (timer) clearInterval(timer);
  }

  prevBtn.addEventListener("click", () => {
    prev();
    startAutoplay();
  });

  nextBtn.addEventListener("click", () => {
    next();
    startAutoplay();
  });

  dots.forEach((dot) => {
    dot.addEventListener("click", () => {
      goTo(Number(dot.dataset.index));
      startAutoplay();
    });
  });

  const hero = document.getElementById("home-hero");
  hero.addEventListener("mouseenter", stopAutoplay);
  hero.addEventListener("mouseleave", startAutoplay);

  dots[0].classList.add("active");
  requestAnimationFrame(() => {
    requestAnimationFrame(() => goTo(0));
  });
  startAutoplay();
}

let noticeRotationTimer = null;

function renderNoticeBar() {
  const section = document.getElementById("notice-bar");
  const activeIds = getActiveNoticeIds();
  const notices = getNotices().filter((notice) => activeIds.includes(notice.id));

  clearInterval(noticeRotationTimer);

  if (notices.length === 0) {
    section.hidden = true;
    return;
  }

  section.hidden = false;
  const messageEl = document.getElementById("notice-bar-message");
  const dateEl = document.getElementById("notice-bar-date");

  let current = 0;
  function show(index) {
    current = index;
    const notice = notices[current];
    messageEl.textContent = notice.message;
    dateEl.textContent = notice.date.replace(/-/g, ".");
  }

  show(0);
  if (notices.length > 1) {
    noticeRotationTimer = setInterval(() => show((current + 1) % notices.length), 4000);
  }
}

function renderHomeEvents() {
  const listEl = document.getElementById("home-event-list");
  const events = getEvents()
    .slice()
    .sort((a, b) => (a.date < b.date ? 1 : -1))
    .slice(0, 3);

  if (events.length === 0) {
    listEl.innerHTML = `<p class="empty-state">등록된 이벤트가 없습니다.</p>`;
    return;
  }

  listEl.innerHTML = events
    .map((event) => {
      const [year, month, day] = event.date.split("-");
      const ended = isEventEnded(event);
      return `
    <li class="event-row ${ended ? "is-ended" : ""}">
      <div class="event-date">
        <span class="event-day">${day}</span>
        <span class="event-month">${year}.${month}</span>
      </div>
      <div class="event-info">
        <h3>${escapeHtml(event.title)}${ended ? `<span class="event-ended-tag">종료된 이벤트입니다</span>` : ""}</h3>
        <p>${escapeHtml(event.description)}</p>
      </div>
      <div class="event-thumb" style="${event.image ? `background-image: url('${event.image}')` : ""}">
        ${ended ? `<span class="event-ended-watermark">종료된 이벤트입니다</span>` : ""}
      </div>
    </li>
  `;
    })
    .join("");
}

function applyInitialFilterState() {
  document.getElementById("menu-search").value = searchQuery;
  document.getElementById("sort-select").value = activeSort;
  document.getElementById("price-filter").value = activePriceRange;
  const favBtn = document.getElementById("favorites-toggle");
  favBtn.classList.toggle("active", favoritesOnly);
  favBtn.setAttribute("aria-pressed", String(favoritesOnly));
}

document.getElementById("clear-recently-viewed-btn").addEventListener("click", () => {
  if (!confirm("최근 본 메뉴를 전부 삭제하시겠습니까?")) return;
  clearRecentlyViewed();
  renderRecentlyViewedWidget();
});

applyInitialFilterState();
initHeroSlider();
initThemeToggle();
renderAuthNav();
renderCartBadge();
renderRecentlyViewedWidget();
renderRecentSearches();
renderFeatured();
renderTabs();
renderMenuGrid();
renderNoticeBar();
renderHomeEvents();
