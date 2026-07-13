/* ==========================================================================
   메뉴 / 카테고리 / 공지 / 이벤트 데이터 — Supabase(`hnbbenpafqlguwzocwub`)에서
   직접 읽고 쓴다. 모든 조회/저장 함수는 비동기(Promise)다.
   ========================================================================== */

import { supabase } from "./supabaseClient.js";

function mapCategoryRow(row) {
  return { id: row.id, name: row.name };
}

function mapMenuRow(row) {
  return {
    id: row.id,
    categoryId: row.category_id,
    name: row.name,
    price: row.price,
    sizeUpcharge: row.size_upcharge,
    description: row.description,
    image: row.image,
    isSoldOut: row.is_sold_out,
    hasTempOption: row.has_temp_option,
    hasSizeOption: row.has_size_option,
  };
}

function mapNoticeRow(row) {
  return { id: row.id, message: row.message, date: row.date };
}

function mapEventRow(row) {
  return {
    id: row.id,
    title: row.title,
    description: row.description,
    date: row.date,
    endDate: row.end_date,
    image: row.image,
    isEnded: row.is_ended,
  };
}

/* ==========================================================================
   카테고리
   ========================================================================== */

export async function getCategories() {
  const { data, error } = await supabase.from("categories").select("*").order("sort_order").order("created_at");
  if (error) {
    console.error(error);
    return [];
  }
  return data.map(mapCategoryRow);
}

export async function getCategoryById(categoryId) {
  const categories = await getCategories();
  return categories.find((category) => category.id === categoryId) || null;
}

export async function createCategory({ id, name }) {
  const { error } = await supabase.from("categories").insert({ id, name });
  if (error) throw error;
}

export async function renameCategory(categoryId, name) {
  const { error } = await supabase.from("categories").update({ name }).eq("id", categoryId);
  if (error) throw error;
}

export async function deleteCategory(categoryId) {
  const { error } = await supabase.from("categories").delete().eq("id", categoryId);
  if (error) throw error;
}

/* ==========================================================================
   메뉴
   ========================================================================== */

export async function getMenus() {
  const { data, error } = await supabase.from("menus").select("*").order("id");
  if (error) {
    console.error(error);
    return [];
  }
  return data.map(mapMenuRow);
}

export async function getMenuById(menuId) {
  const { data, error } = await supabase.from("menus").select("*").eq("id", menuId).maybeSingle();
  if (error || !data) return null;
  return mapMenuRow(data);
}

export async function getMenusByCategory(categoryId) {
  const list = await getMenus();
  if (!categoryId || categoryId === "all") return list;
  return list.filter((menu) => menu.categoryId === categoryId);
}

export async function createMenu(menu) {
  const { data, error } = await supabase
    .from("menus")
    .insert({
      category_id: menu.categoryId,
      name: menu.name,
      price: menu.price,
      size_upcharge: menu.sizeUpcharge || 0,
      description: menu.description,
      image: menu.image,
      is_sold_out: Boolean(menu.isSoldOut),
      has_temp_option: Boolean(menu.hasTempOption),
      has_size_option: Boolean(menu.hasSizeOption),
    })
    .select()
    .single();
  if (error) throw error;
  return mapMenuRow(data);
}

export async function updateMenu(menuId, menu) {
  const { error } = await supabase
    .from("menus")
    .update({
      category_id: menu.categoryId,
      name: menu.name,
      price: menu.price,
      size_upcharge: menu.sizeUpcharge || 0,
      description: menu.description,
      image: menu.image,
      is_sold_out: Boolean(menu.isSoldOut),
      has_temp_option: Boolean(menu.hasTempOption),
      has_size_option: Boolean(menu.hasSizeOption),
    })
    .eq("id", menuId);
  if (error) throw error;
}

export async function setMenusSoldOut(menuIds, isSoldOut) {
  const { error } = await supabase.from("menus").update({ is_sold_out: isSoldOut }).in("id", menuIds);
  if (error) throw error;
}

export async function deleteMenus(menuIds) {
  const { error } = await supabase.from("menus").delete().in("id", menuIds);
  if (error) throw error;
}

/* ==========================================================================
   오늘의 추천 — 관리자가 직접 고른 메뉴 id 목록(노출 순서 포함).
   ========================================================================== */

export async function getFeaturedMenuIds() {
  const { data, error } = await supabase.from("featured_menus").select("menu_id").order("position");
  if (error) {
    console.error(error);
    return [];
  }
  return data.map((row) => row.menu_id);
}

export async function toggleFeaturedMenu(menuId) {
  const ids = await getFeaturedMenuIds();
  if (ids.includes(menuId)) {
    const { error } = await supabase.from("featured_menus").delete().eq("menu_id", menuId);
    if (error) throw error;
    return ids.filter((id) => id !== menuId);
  }
  const { error } = await supabase.from("featured_menus").insert({ menu_id: menuId, position: ids.length });
  if (error) throw error;
  return [...ids, menuId];
}

/* ==========================================================================
   공지사항 — 전체 목록과, 그중 홈 화면에 노출할 최대 3개를 고른 상태를 함께 관리.
   ========================================================================== */

export const MAX_ACTIVE_NOTICES = 3;

export async function getNotices() {
  const { data, error } = await supabase.from("notices").select("*").order("date", { ascending: false });
  if (error) {
    console.error(error);
    return [];
  }
  return data.map(mapNoticeRow);
}

export async function getActiveNoticeIds() {
  const { data, error } = await supabase
    .from("notices")
    .select("id")
    .eq("is_active", true)
    .order("active_position");
  if (error) {
    console.error(error);
    return [];
  }
  return data.map((row) => row.id);
}

export async function createNotice({ id, message, date }) {
  const { error } = await supabase.from("notices").insert({ id, message, date });
  if (error) throw error;
}

export async function deleteNotice(noticeId) {
  const { error } = await supabase.from("notices").delete().eq("id", noticeId);
  if (error) throw error;
}

export async function toggleActiveNotice(noticeId) {
  const activeIds = await getActiveNoticeIds();
  if (activeIds.includes(noticeId)) {
    const { error } = await supabase
      .from("notices")
      .update({ is_active: false, active_position: null })
      .eq("id", noticeId);
    if (error) throw error;
    return activeIds.filter((id) => id !== noticeId);
  }
  if (activeIds.length >= MAX_ACTIVE_NOTICES) return activeIds;
  const { error } = await supabase
    .from("notices")
    .update({ is_active: true, active_position: activeIds.length })
    .eq("id", noticeId);
  if (error) throw error;
  return [...activeIds, noticeId];
}

/* ==========================================================================
   이벤트
   ========================================================================== */

export async function getEvents() {
  const { data, error } = await supabase.from("events").select("*").order("date", { ascending: false });
  if (error) {
    console.error(error);
    return [];
  }
  return data.map(mapEventRow);
}

export async function getEventById(eventId) {
  const { data, error } = await supabase.from("events").select("*").eq("id", eventId).maybeSingle();
  if (error || !data) return null;
  return mapEventRow(data);
}

export async function createEvent({ id, title, description, date, endDate, image }) {
  const { error } = await supabase
    .from("events")
    .insert({ id, title, description, date, end_date: endDate, image, is_ended: false });
  if (error) throw error;
}

export async function updateEvent(eventId, patch) {
  const dbPatch = {};
  if ("isEnded" in patch) dbPatch.is_ended = patch.isEnded;
  if ("endDate" in patch) dbPatch.end_date = patch.endDate;
  const { error } = await supabase.from("events").update(dbPatch).eq("id", eventId);
  if (error) throw error;
}

export async function deleteEvent(eventId) {
  const { error } = await supabase.from("events").delete().eq("id", eventId);
  if (error) throw error;
}
