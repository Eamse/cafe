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
    image: "https://images.unsplash.com/photo-1497935586351-b67a49e012bf?w=600&auto=format&fit=crop",
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
    image: "https://images.unsplash.com/photo-1578314675249-a6910f80cc4e?w=600&auto=format&fit=crop",
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
    image: "https://images.unsplash.com/photo-1597481499750-3e6b22637e12?w=600&auto=format&fit=crop",
    isSoldOut: false,
  },
  {
    id: 7,
    categoryId: "ade",
    name: "자몽에이드",
    price: 5500,
    description: "상큼한 자몽과 탄산의 청량감",
    image: "https://images.unsplash.com/photo-1546173159-315724a31696?w=600&auto=format&fit=crop",
    isSoldOut: false,
  },
  {
    id: 8,
    categoryId: "ade",
    name: "청포도에이드",
    price: 5500,
    description: "새콤달콤한 청포도 에이드",
    image: "https://images.unsplash.com/photo-1556881286-fc6915169721?w=600&auto=format&fit=crop",
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

export function getCategoryById(categoryId) {
  return categories.find((category) => category.id === categoryId) || null;
}

/* ==========================================================================
   메뉴 저장소 — 관리자(admin/menus)와 고객 화면이 함께 사용하는 단일 소스.
   최초 접근 시 위 시드 데이터(menus)로 초기화되고, 이후로는 localStorage가
   기준(cafe_admin_menus)이 되어 관리자의 CRUD가 고객 화면에도 반영된다.
   ========================================================================== */

const MENUS_STORAGE_KEY = "cafe_admin_menus";

export function getMenus() {
  try {
    const raw = localStorage.getItem(MENUS_STORAGE_KEY);
    if (raw) return JSON.parse(raw);
  } catch {
    /* 저장된 값이 손상된 경우 시드 데이터로 복구 */
  }
  saveMenus(menus);
  return menus.slice();
}

export function saveMenus(list) {
  localStorage.setItem(MENUS_STORAGE_KEY, JSON.stringify(list));
}

export function getMenuById(menuId) {
  return getMenus().find((menu) => menu.id === menuId) || null;
}

export function getMenusByCategory(categoryId) {
  const list = getMenus();
  if (!categoryId || categoryId === "all") return list;
  return list.filter((menu) => menu.categoryId === categoryId);
}
