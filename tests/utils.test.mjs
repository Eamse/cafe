import "./setup.mjs";
import { test, beforeEach } from "node:test";
import assert from "node:assert/strict";

import {
  formatPrice,
  escapeHtml,
  formatDate,
  generateId,
  getCart,
  saveCart,
  addToCart,
  updateCartQuantity,
  removeFromCart,
  clearCart,
  getPickupEstimateRange,
  estimatePickupMinutes,
  isOrderReadyForPickup,
  formatBarcodeNumber,
  getFrequentlyBoughtWith,
  getFavorites,
  toggleFavorite,
  getRecentSearches,
  addRecentSearch,
  removeRecentSearch,
  getCartLineKey,
  getMenuUnitPrice,
  formatItemOptions,
} from "../js/utils.js";

// 주문 저장/조회/상태변경(getOrders 등)은 이제 js/data.js가 Supabase를 직접
// 호출하는 방식이라, 네트워크 없이 도는 단위 테스트로는 검증할 수 없다.

beforeEach(() => {
  localStorage.clear();
});

test("formatPrice는 천 단위 콤마와 '원'을 붙인다", () => {
  assert.equal(formatPrice(4500), "4,500원");
  assert.equal(formatPrice(0), "0원");
});

test("escapeHtml은 스크립트 삽입을 막기 위해 특수문자를 이스케이프한다", () => {
  assert.equal(escapeHtml(`<img src=x onerror=alert(1)>`), "&lt;img src=x onerror=alert(1)&gt;");
  assert.equal(escapeHtml(`"quote" & 'apos'`), "&quot;quote&quot; &amp; &#39;apos&#39;");
});

test("formatDate는 YYYY.MM.DD HH:mm 형태로 포맷한다", () => {
  const formatted = formatDate("2026-07-11T09:05:00");
  assert.match(formatted, /^\d{4}\.\d{2}\.\d{2} \d{2}:\d{2}$/);
});

test("generateId는 매번 다른 값을 반환한다", () => {
  const a = generateId("cat");
  const b = generateId("cat");
  assert.notEqual(a, b);
  assert.match(a, /^cat-/);
});

test("장바구니: 담기 → 수량 변경 → 삭제", () => {
  assert.deepEqual(getCart(), []);

  addToCart(1, 2);
  assert.deepEqual(getCart(), [{ menuId: 1, quantity: 2, temp: null, size: null }]);

  addToCart(1, 1); // 같은 메뉴면 수량이 더해져야 함
  assert.equal(getCart()[0].quantity, 3);

  updateCartQuantity(1, 5);
  assert.equal(getCart()[0].quantity, 5);

  updateCartQuantity(1, 0); // 0 이하면 제거되어야 함
  assert.deepEqual(getCart(), []);

  addToCart(2, 1);
  removeFromCart(2);
  assert.deepEqual(getCart(), []);

  addToCart(3, 1);
  clearCart();
  assert.deepEqual(getCart(), []);
});

test("장바구니: 같은 메뉴라도 온도/사이즈 옵션이 다르면 별도 줄로 담긴다", () => {
  addToCart(1, 1, { temp: "ICE", size: "REGULAR" });
  addToCart(1, 1, { temp: "HOT", size: "REGULAR" }); // 옵션이 다르므로 별도 줄
  addToCart(1, 2, { temp: "ICE", size: "REGULAR" }); // 기존 줄과 같은 옵션이므로 수량만 증가

  const cart = getCart();
  assert.equal(cart.length, 2);
  assert.equal(cart.find((i) => i.temp === "ICE").quantity, 3);
  assert.equal(cart.find((i) => i.temp === "HOT").quantity, 1);

  updateCartQuantity(1, 0, { temp: "HOT", size: "REGULAR" });
  assert.equal(getCart().length, 1);

  removeFromCart(1, { temp: "ICE", size: "REGULAR" });
  assert.deepEqual(getCart(), []);
});

test("getMenuUnitPrice: 사이즈 업차지 반영", () => {
  const drink = { id: 1, categoryId: "coffee", price: 4500, sizeUpcharge: 500 };

  assert.equal(getMenuUnitPrice(drink, { size: "REGULAR" }), 4500);
  assert.equal(getMenuUnitPrice(drink, { size: "LARGE" }), 5000);
});

test("getCartLineKey / formatItemOptions", () => {
  assert.equal(getCartLineKey(1, "ICE", "LARGE"), getCartLineKey(1, "ICE", "LARGE"));
  assert.notEqual(getCartLineKey(1, "ICE", "LARGE"), getCartLineKey(1, "HOT", "LARGE"));
  assert.equal(formatItemOptions({ temp: "ICE", size: "LARGE" }), "아이스 · 라지");
  assert.equal(formatItemOptions({}), "");
});

test("getPickupEstimateRange / estimatePickupMinutes", () => {
  const { min, max } = getPickupEstimateRange(3);
  assert.equal(min, 8);
  assert.equal(max, 13);
  assert.equal(estimatePickupMinutes(3), "예상 준비 시간: 약 8~13분");
});

test("isOrderReadyForPickup: 예상 준비 시각이 지났는지로 판단한다", () => {
  const items = [{ menuId: 1, name: "아메리카노", price: 4500, quantity: 1 }];

  const justOrdered = { status: "주문완료", items, createdAt: new Date().toISOString() };
  assert.equal(isOrderReadyForPickup(justOrdered), false);

  const longAgo = { status: "조리중", items, createdAt: new Date(Date.now() - 60 * 60000).toISOString() };
  assert.equal(isOrderReadyForPickup(longAgo), true);

  const pickedUp = { status: "수령완료", items, createdAt: new Date(Date.now() - 60 * 60000).toISOString() };
  assert.equal(isOrderReadyForPickup(pickedUp), false);

  const cancelled = { status: "취소", items, createdAt: new Date(Date.now() - 60 * 60000).toISOString() };
  assert.equal(isOrderReadyForPickup(cancelled), false);
});

test("formatBarcodeNumber는 BC-000123 형태로 통일한다", () => {
  assert.equal(formatBarcodeNumber(3), "BC-000003");
  assert.equal(formatBarcodeNumber(123), "BC-000123");
});

test("getFrequentlyBoughtWith는 넘겨받은 주문에서 함께 나온 메뉴만 빈도순으로 반환한다", () => {
  const orders = [
    { id: 1, items: [{ menuId: 1, quantity: 1 }, { menuId: 2, quantity: 1 }], total: 0, status: "주문완료" },
    { id: 2, items: [{ menuId: 1, quantity: 1 }, { menuId: 2, quantity: 1 }], total: 0, status: "주문완료" },
    { id: 3, items: [{ menuId: 1, quantity: 1 }, { menuId: 3, quantity: 1 }], total: 0, status: "주문완료" },
  ];

  const result = getFrequentlyBoughtWith(1, orders, 5);
  assert.deepEqual(result, [2, 3]); // menuId 2가 2번, 3이 1번 함께 나옴 → 빈도순
  assert.deepEqual(getFrequentlyBoughtWith(999, orders), []); // 주문 기록 없는 메뉴는 빈 배열
});

test("즐겨찾기: 토글하면 켜지고 다시 누르면 꺼진다", () => {
  assert.equal(getFavorites().has(1), false);
  toggleFavorite(1);
  assert.equal(getFavorites().has(1), true);
  toggleFavorite(1);
  assert.equal(getFavorites().has(1), false);
});

test("최근 검색어: 추가/중복 제거/최대 개수/삭제", () => {
  assert.deepEqual(getRecentSearches(), []);

  addRecentSearch("아메리카노");
  addRecentSearch("라떼");
  addRecentSearch("아메리카노"); // 중복이면 맨 앞으로 이동, 개수는 그대로

  assert.deepEqual(getRecentSearches(), ["아메리카노", "라떼"]);

  removeRecentSearch("라떼");
  assert.deepEqual(getRecentSearches(), ["아메리카노"]);

  addRecentSearch("   "); // 공백만 있으면 무시
  assert.deepEqual(getRecentSearches(), ["아메리카노"]);
});
