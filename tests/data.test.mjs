import "./setup.mjs";
import { test, beforeEach } from "node:test";
import assert from "node:assert/strict";

import {
  categories,
  menus,
  getCategories,
  saveCategories,
  getCategoryById,
  getMenus,
  saveMenus,
  getMenuById,
  getMenusByCategory,
  getFeaturedMenuIds,
  saveFeaturedMenuIds,
  toggleFeaturedMenu,
  isEventEnded,
} from "../js/data.js";

beforeEach(() => {
  localStorage.clear();
});

test("getCategories는 처음엔 시드 데이터로 초기화된다", () => {
  const result = getCategories();
  assert.deepEqual(result, categories);
});

test("saveCategories로 저장하면 getCategories가 그 값을 반환한다", () => {
  const custom = [{ id: "brunch", name: "브런치" }];
  saveCategories(custom);
  assert.deepEqual(getCategories(), custom);
});

test("getCategoryById는 존재하지 않는 id면 null을 반환한다", () => {
  assert.equal(getCategoryById("coffee").name, "커피");
  assert.equal(getCategoryById("no-such-category"), null);
});

test("getMenus는 처음엔 시드 데이터로 초기화된다", () => {
  assert.deepEqual(getMenus(), menus);
});

test("saveMenus / getMenuById / getMenusByCategory", () => {
  const custom = [
    { id: 1, categoryId: "coffee", name: "테스트 커피", price: 1000, isSoldOut: false },
    { id: 2, categoryId: "tea", name: "테스트 티", price: 2000, isSoldOut: true },
  ];
  saveMenus(custom);

  assert.deepEqual(getMenus(), custom);
  assert.equal(getMenuById(1).name, "테스트 커피");
  assert.equal(getMenuById(999), null);

  assert.deepEqual(getMenusByCategory("coffee"), [custom[0]]);
  assert.deepEqual(getMenusByCategory("all"), custom);
  assert.deepEqual(getMenusByCategory(), custom);
});

test("오늘의 추천: 토글로 추가/해제", () => {
  assert.deepEqual(getFeaturedMenuIds(), []);

  toggleFeaturedMenu(1);
  assert.deepEqual(getFeaturedMenuIds(), [1]);

  toggleFeaturedMenu(2);
  assert.deepEqual(getFeaturedMenuIds(), [1, 2]);

  toggleFeaturedMenu(1); // 다시 누르면 해제
  assert.deepEqual(getFeaturedMenuIds(), [2]);
});

test("saveFeaturedMenuIds로 직접 저장도 가능하다", () => {
  saveFeaturedMenuIds([3, 4]);
  assert.deepEqual(getFeaturedMenuIds(), [3, 4]);
});

test("isEventEnded: 수동 종료 또는 종료 예정일 경과 여부로 판단한다", () => {
  assert.equal(isEventEnded({ isEnded: false, endDate: null }), false);
  assert.equal(isEventEnded({ isEnded: true, endDate: null }), true);

  const yesterday = new Date(Date.now() - 86400000).toISOString().slice(0, 10);
  const tomorrow = new Date(Date.now() + 86400000).toISOString().slice(0, 10);

  assert.equal(isEventEnded({ isEnded: false, endDate: yesterday }), true);
  assert.equal(isEventEnded({ isEnded: false, endDate: tomorrow }), false);
});
