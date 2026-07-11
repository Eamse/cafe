/* ==========================================================================
   메뉴 / 카테고리 데이터
   ========================================================================== */

export const categories = [
  { id: "coffee", name: "커피" },
  { id: "tea", name: "티" },
  { id: "ade", name: "에이드" },
  { id: "dessert", name: "디저트" },
];

export const menus = [
  {
    id: 1,
    categoryId: "coffee",
    name: "아메리카노",
    price: 4500,
    description: "깊고 진한 에스프레소에 물을 더한 클래식 커피",
    image: "https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?w=600&auto=format&fit=crop",
    isSoldOut: false,
  },
  {
    id: 2,
    categoryId: "coffee",
    name: "카페라떼",
    price: 5000,
    description: "부드러운 우유 거품과 에스프레소의 조화",
    image: "https://images.unsplash.com/photo-1541167760496-1628856ab772?w=600&auto=format&fit=crop",
    isSoldOut: false,
  },
  {
    id: 3,
    categoryId: "coffee",
    name: "바닐라라떼",
    price: 5500,
    description: "달콤한 바닐라 시럽이 더해진 라떼",
    image: "https://images.unsplash.com/photo-1517701604599-bb29b565090c?w=600&auto=format&fit=crop",
    isSoldOut: false,
  },
  {
    id: 4,
    categoryId: "coffee",
    name: "카페모카",
    price: 5800,
    description: "초콜릿과 에스프레소, 휘핑크림의 만남",
    image: "https://images.unsplash.com/photo-1542990253-0d0f5be5f0ed?w=600&auto=format&fit=crop",
    isSoldOut: false,
  },
  {
    id: 5,
    categoryId: "tea",
    name: "얼그레이",
    price: 4800,
    description: "은은한 베르가못 향의 홍차",
    image: "https://images.unsplash.com/photo-1544787219-7f47ccb76574?w=600&auto=format&fit=crop",
    isSoldOut: false,
  },
  {
    id: 6,
    categoryId: "tea",
    name: "캐모마일",
    price: 4800,
    description: "편안한 휴식을 위한 허브티",
    image: "https://images.unsplash.com/photo-1612706965205-7570f423e339?w=600&auto=format&fit=crop",
    isSoldOut: false,
  },
  {
    id: 7,
    categoryId: "ade",
    name: "자몽에이드",
    price: 5500,
    description: "상큼한 자몽과 탄산의 청량감",
    image: "https://images.unsplash.com/photo-1592858321831-dabeabc2dd65?w=600&auto=format&fit=crop",
    isSoldOut: false,
  },
  {
    id: 8,
    categoryId: "ade",
    name: "청포도에이드",
    price: 5500,
    description: "새콤달콤한 청포도 에이드",
    image: "https://images.unsplash.com/photo-1610622930110-3c076902312a?w=600&auto=format&fit=crop",
    isSoldOut: false,
  },
  {
    id: 9,
    categoryId: "dessert",
    name: "치즈케이크",
    price: 6500,
    description: "진한 크림치즈의 부드러운 케이크",
    image: "https://images.unsplash.com/photo-1533134242443-d4fd215305ad?w=600&auto=format&fit=crop",
    isSoldOut: false,
  },
  {
    id: 10,
    categoryId: "dessert",
    name: "크루아상",
    price: 4200,
    description: "겹겹이 바삭한 버터 크루아상",
    image: "https://images.unsplash.com/photo-1555507036-ab1f4038808a?w=600&auto=format&fit=crop",
    isSoldOut: false,
  },
];

/* ==========================================================================
   카테고리 저장소 — 관리자(admin/categories)와 고객 화면이 함께 사용하는
   단일 소스. 패턴은 아래 메뉴 저장소와 동일(시드 → localStorage 캐시 →
   버전 비교 재시드).
   ========================================================================== */

const CATEGORIES_STORAGE_KEY = "cafe_admin_categories";
const CATEGORIES_VERSION_KEY = "cafe_admin_categories_version";
const CATEGORIES_SEED_VERSION = "1";

export function getCategories() {
  try {
    const raw = localStorage.getItem(CATEGORIES_STORAGE_KEY);
    if (raw && localStorage.getItem(CATEGORIES_VERSION_KEY) === CATEGORIES_SEED_VERSION) {
      return JSON.parse(raw);
    }
  } catch {
    /* 저장된 값이 손상된 경우 시드 데이터로 복구 */
  }
  saveCategories(categories);
  return categories.slice();
}

export function saveCategories(list) {
  localStorage.setItem(CATEGORIES_STORAGE_KEY, JSON.stringify(list));
  localStorage.setItem(CATEGORIES_VERSION_KEY, CATEGORIES_SEED_VERSION);
}

export function getCategoryById(categoryId) {
  return getCategories().find((category) => category.id === categoryId) || null;
}

/* ==========================================================================
   메뉴 저장소 — 관리자(admin/menus)와 고객 화면이 함께 사용하는 단일 소스.
   최초 접근 시 위 시드 데이터(menus)로 초기화되고, 이후로는 localStorage가
   기준(cafe_admin_menus)이 되어 관리자의 CRUD가 고객 화면에도 반영된다.
   시드 데이터(사진 등) 자체가 바뀌면 예전 브라우저에 저장된 캐시가 따라가지
   못하므로, 버전을 함께 저장해 시드가 바뀌면 캐시를 자동으로 재시드한다.
   ========================================================================== */

const MENUS_STORAGE_KEY = "cafe_admin_menus";
const MENUS_VERSION_KEY = "cafe_admin_menus_version";
const MENUS_SEED_VERSION = "2";

export function getMenus() {
  try {
    const raw = localStorage.getItem(MENUS_STORAGE_KEY);
    if (raw && localStorage.getItem(MENUS_VERSION_KEY) === MENUS_SEED_VERSION) {
      return JSON.parse(raw);
    }
  } catch {
    /* 저장된 값이 손상된 경우 시드 데이터로 복구 */
  }
  saveMenus(menus);
  return menus.slice();
}

export function saveMenus(list) {
  localStorage.setItem(MENUS_STORAGE_KEY, JSON.stringify(list));
  localStorage.setItem(MENUS_VERSION_KEY, MENUS_SEED_VERSION);
}

export function getMenuById(menuId) {
  return getMenus().find((menu) => menu.id === menuId) || null;
}

export function getMenusByCategory(categoryId) {
  const list = getMenus();
  if (!categoryId || categoryId === "all") return list;
  return list.filter((menu) => menu.categoryId === categoryId);
}

/* ==========================================================================
   오늘의 추천 — 관리자(admin/menus)가 직접 고른 메뉴 id 목록.
   비어있으면(관리자가 아직 하나도 안 골랐으면) index.js가 카테고리별 자동
   추천으로 대체한다.
   ========================================================================== */

const FEATURED_STORAGE_KEY = "cafe_featured_menus";

export function getFeaturedMenuIds() {
  try {
    return JSON.parse(localStorage.getItem(FEATURED_STORAGE_KEY)) || [];
  } catch {
    return [];
  }
}

export function saveFeaturedMenuIds(ids) {
  localStorage.setItem(FEATURED_STORAGE_KEY, JSON.stringify(ids));
}

export function toggleFeaturedMenu(menuId) {
  const ids = getFeaturedMenuIds();
  const next = ids.includes(menuId) ? ids.filter((id) => id !== menuId) : [...ids, menuId];
  saveFeaturedMenuIds(next);
  return next;
}

/* ==========================================================================
   공지사항 저장소 — 관리자(admin/notices)가 등록한 공지 전체 목록과,
   그중 실제로 홈 화면에 노출할 최대 3개를 고른 id 목록을 따로 둔다.
   (메뉴의 "오늘의 추천"과 동일한 전체 목록 + 노출 선택 패턴)
   ========================================================================== */

const NOTICES_STORAGE_KEY = "cafe_notices";
const ACTIVE_NOTICE_IDS_KEY = "cafe_active_notice_ids";
export const MAX_ACTIVE_NOTICES = 3;

const noticesSeed = [
  { id: "notice-1", message: "여름 시즌 메뉴가 새롭게 출시되었습니다", date: "2026-06-15" },
];

export function getNotices() {
  try {
    const raw = localStorage.getItem(NOTICES_STORAGE_KEY);
    if (raw) return JSON.parse(raw);
  } catch {
    /* 저장된 값이 손상된 경우 시드 데이터로 복구 */
  }
  saveNotices(noticesSeed);
  return noticesSeed.slice();
}

export function saveNotices(list) {
  localStorage.setItem(NOTICES_STORAGE_KEY, JSON.stringify(list));
}

export function getActiveNoticeIds() {
  try {
    return JSON.parse(localStorage.getItem(ACTIVE_NOTICE_IDS_KEY)) || noticesSeed.map((n) => n.id);
  } catch {
    return [];
  }
}

export function saveActiveNoticeIds(ids) {
  localStorage.setItem(ACTIVE_NOTICE_IDS_KEY, JSON.stringify(ids.slice(0, MAX_ACTIVE_NOTICES)));
}

export function toggleActiveNotice(noticeId) {
  const ids = getActiveNoticeIds();
  if (ids.includes(noticeId)) {
    const next = ids.filter((id) => id !== noticeId);
    saveActiveNoticeIds(next);
    return next;
  }
  if (ids.length >= MAX_ACTIVE_NOTICES) return ids;
  const next = [...ids, noticeId];
  saveActiveNoticeIds(next);
  return next;
}

/* ==========================================================================
   이벤트 저장소 — 관리자(admin/events)가 등록/종료 처리하는 카페 앱 이벤트.
   ========================================================================== */

const EVENTS_STORAGE_KEY = "cafe_events";

const eventsSeed = [
  {
    id: "event-1",
    title: "여름맞이 시원한 이벤트",
    description: "에이드 2잔 이상 주문 시 쿠키를 증정해드립니다. 무더운 여름, 시원한 한 잔과 함께 달콤한 쿠키까지 즐겨보세요.",
    date: "2026-07-01",
    image: "https://images.unsplash.com/photo-1461023058943-07fcbe16d735?w=500&auto=format&fit=crop",
    isEnded: false,
  },
  {
    id: "event-2",
    title: "친구 초대 이벤트",
    description: "친구를 초대하면 두 분 모두 아메리카노 한 잔이 무료로 제공됩니다. 지금 친구에게 카페 앱을 소개해보세요.",
    date: "2026-06-15",
    image: "https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=500&auto=format&fit=crop",
    isEnded: false,
  },
  {
    id: "event-3",
    title: "디저트 신메뉴 출시 기념",
    description: "디저트 전 메뉴 1,000원 할인 이벤트를 진행합니다. 새로 나온 디저트도 함께 만나보세요.",
    date: "2026-06-02",
    image: "https://images.unsplash.com/photo-1517686469429-8bdb88b9f907?w=500&auto=format&fit=crop",
    isEnded: true,
  },
];

export function getEvents() {
  try {
    const raw = localStorage.getItem(EVENTS_STORAGE_KEY);
    if (raw) return JSON.parse(raw);
  } catch {
    /* 저장된 값이 손상된 경우 시드 데이터로 복구 */
  }
  saveEvents(eventsSeed);
  return eventsSeed.slice();
}

export function saveEvents(list) {
  localStorage.setItem(EVENTS_STORAGE_KEY, JSON.stringify(list));
}

export function getEventById(eventId) {
  return getEvents().find((event) => event.id === eventId) || null;
}
