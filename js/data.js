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
    image: "",
    isSoldOut: false,
  },
  {
    id: 2,
    categoryId: "coffee",
    name: "카페라떼",
    price: 5000,
    description: "부드러운 우유 거품과 에스프레소의 조화",
    image: "",
    isSoldOut: false,
  },
  {
    id: 3,
    categoryId: "coffee",
    name: "바닐라라떼",
    price: 5500,
    description: "달콤한 바닐라 시럽이 더해진 라떼",
    image: "",
    isSoldOut: false,
  },
  {
    id: 4,
    categoryId: "coffee",
    name: "카페모카",
    price: 5800,
    description: "초콜릿과 에스프레소, 휘핑크림의 만남",
    image: "",
    isSoldOut: false,
  },
  {
    id: 5,
    categoryId: "tea",
    name: "얼그레이",
    price: 4800,
    description: "은은한 베르가못 향의 홍차",
    image: "",
    isSoldOut: false,
  },
  {
    id: 6,
    categoryId: "tea",
    name: "캐모마일",
    price: 4800,
    description: "편안한 휴식을 위한 허브티",
    image: "",
    isSoldOut: false,
  },
  {
    id: 7,
    categoryId: "ade",
    name: "자몽에이드",
    price: 5500,
    description: "상큼한 자몽과 탄산의 청량감",
    image: "",
    isSoldOut: false,
  },
  {
    id: 8,
    categoryId: "ade",
    name: "청포도에이드",
    price: 5500,
    description: "새콤달콤한 청포도 에이드",
    image: "",
    isSoldOut: false,
  },
  {
    id: 9,
    categoryId: "dessert",
    name: "치즈케이크",
    price: 6500,
    description: "진한 크림치즈의 부드러운 케이크",
    image: "",
    isSoldOut: false,
  },
  {
    id: 10,
    categoryId: "dessert",
    name: "크루아상",
    price: 4200,
    description: "겹겹이 바삭한 버터 크루아상",
    image: "",
    isSoldOut: false,
  },
];

export function getCategoryById(categoryId) {
  return categories.find((category) => category.id === categoryId) || null;
}

export function getMenuById(menuId) {
  return menus.find((menu) => menu.id === menuId) || null;
}

export function getMenusByCategory(categoryId) {
  if (!categoryId || categoryId === "all") return menus;
  return menus.filter((menu) => menu.categoryId === categoryId);
}
