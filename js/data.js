/* ==========================================================================
   메뉴 / 카테고리 / 공지 / 이벤트 데이터 — Supabase(`hnbbenpafqlguwzocwub`)에서
   직접 읽고 쓴다. 모든 조회/저장 함수는 비동기(Promise)다.
   ========================================================================== */

import { supabase as customerClient } from "./supabaseClient.js";
import { supabaseAdmin } from "./supabaseAdminClient.js";
import { getLastRecipientInfo } from "./utils.js";

// 관리자 페이지(/admin/*)에서 호출되면 관리자 세션이 실린 클라이언트를,
// 고객 페이지에서 호출되면 고객 세션이 실린 클라이언트를 쓴다. 이 파일의
// 함수들은 양쪽에서 공유해 쓰기 때문에, RLS가 올바른 세션으로 통과하려면
// 요청이 실제로 로그인된 세션과 같은 클라이언트를 타야 한다.
const supabase = window.location.pathname.includes("/admin/") ? supabaseAdmin : customerClient;

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

/* ==========================================================================
   주문 — 로그인 고객은 본인 주문만, 관리자는 전체를 볼 수 있다(RLS).
   비회원 주문은 로그인 세션이 없어 주문번호를 아는 사람이면 조회 가능(데모 수준
   트레이드오프 — 전화번호로 재조회하려면 getGuestOrder를 쓴다).
   ========================================================================== */

export const ORDER_STATUSES = ["주문완료", "조리중", "수령완료", "취소"];

function mapOrderRow(row) {
  return {
    id: row.id,
    createdAt: row.created_at,
    items: (row.order_items || [])
      .slice()
      .sort((a, b) => a.id - b.id)
      .map((i) => ({ menuId: i.menu_id, name: i.name, price: i.price, quantity: i.quantity, temp: i.temp, size: i.size })),
    total: row.total,
    status: row.status,
    note: row.note || "",
    recipient: { name: row.recipient_name, phone: row.recipient_phone, address: row.recipient_address || "" },
    deliveryType: row.delivery_type,
    dineType: row.dine_type,
    paymentMethod: row.payment_method,
    barcodeNumber: row.barcode_number,
    cancelReason: row.cancel_reason,
  };
}

// 관리자는 전체 주문, 로그인 고객은 본인 주문만 돌아온다(RLS가 알아서 걸러줌).
// 비회원은 세션이 없어 RLS로 "본인 것"을 가릴 수 없으므로, 마지막으로 입력한
// 연락처(주문 시 저장됨)로 본인 확인된 주문만 서버 함수로 조회한다.
export async function getOrders() {
  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (session) {
    const { data, error } = await supabase
      .from("orders")
      .select("*, order_items(*)")
      .order("created_at", { ascending: true });
    if (error) {
      console.error(error);
      return [];
    }
    return data.map(mapOrderRow);
  }

  const phone = getLastRecipientInfo()?.phone;
  if (!phone) return [];
  const { data, error } = await supabase.rpc("get_guest_orders_by_phone", { p_phone: phone });
  if (error || !data) return [];
  return data.map((row) => mapOrderRow({ ...row, order_items: row.items }));
}

export async function getOrderById(orderId) {
  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (session) {
    const { data, error } = await supabase.from("orders").select("*, order_items(*)").eq("id", orderId).maybeSingle();
    if (error || !data) return null;
    return mapOrderRow(data);
  }

  const phone = getLastRecipientInfo()?.phone;
  if (!phone) return null;
  return getGuestOrder(orderId, phone);
}

// 전화번호로 본인 확인 후 비회원 주문 하나를 조회.
export async function getGuestOrder(orderId, phone) {
  const { data, error } = await supabase.rpc("get_guest_order_full", { p_order_id: orderId, p_phone: phone });
  if (error || !data) return null;
  return mapOrderRow({ ...data, order_items: data.items });
}

// 매장 수령이면 픽업 바코드까지 함께 발급해서 주문을 생성한다.
// 서버 함수(create_order)로 처리한다 — 방금 만든 주문을 곧바로 select()로
// 돌려받아야 하는데, 비회원 주문은 일부러 SELECT 정책을 열어두지 않아서
// (전체 노출 방지) 일반 insert().select()로는 RLS에 막힌다.
export async function createOrder({ items, total, note, recipient, deliveryType, dineType, paymentMethod }) {
  const { data: orderId, error } = await supabase.rpc("create_order", {
    p_items: items.map((item) => ({
      menuId: item.menuId,
      name: item.name,
      price: item.price,
      quantity: item.quantity,
      temp: item.temp,
      size: item.size,
    })),
    p_total: total,
    p_note: note,
    p_recipient_name: recipient.name,
    p_recipient_phone: recipient.phone,
    p_recipient_address: recipient.address || null,
    p_delivery_type: deliveryType,
    p_dine_type: dineType,
    p_payment_method: paymentMethod,
  });
  if (error) throw error;
  return orderId;
}

export async function updateOrderStatus(orderId, status) {
  const { error } = await supabase.from("orders").update({ status }).eq("id", orderId);
  if (error) throw error;
}

// 취소는 오직 "주문완료" 상태에서만 허용한다 — 관리자가 이미 조리를 시작한
// (또는 그 이후로 넘긴) 주문은 여기서도 다시 한번 막아서, 취소 버튼이 그려진
// 뒤 화면을 새로고침하지 않은 채로 눌러도 실제로는 취소되지 않도록 한다.
export async function cancelOrderWithReason(orderId, reason) {
  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session) {
    const phone = getLastRecipientInfo()?.phone;
    if (!phone) return { ok: false };
    const { data, error } = await supabase.rpc("guest_cancel_order", {
      p_order_id: orderId,
      p_phone: phone,
      p_reason: reason,
    });
    return { ok: !error && data === true };
  }

  const { data, error } = await supabase
    .from("orders")
    .update({ status: "취소", cancel_reason: reason })
    .eq("id", orderId)
    .eq("status", "주문완료")
    .select()
    .maybeSingle();
  if (error || !data) return { ok: false };
  return { ok: true };
}

// 관리자가 주문을 "수락"(주문완료 → 조리중 이상으로 진행)하면 더 이상 취소를
// 선택할 수 없도록, 현재 상태 기준으로 고를 수 있는 상태 목록만 반환한다.
export function getAvailableStatuses(currentStatus) {
  const allowed =
    currentStatus === "주문완료" ? ORDER_STATUSES : ORDER_STATUSES.filter((status) => status !== "취소");
  if (!allowed.includes(currentStatus)) allowed.push(currentStatus);
  return allowed;
}
