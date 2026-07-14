/* ==========================================================================
   인증 — Supabase Auth 기반. 고객 회원가입/로그인과 어드민 로그인은 같은
   auth.users를 쓰지만, admin_accounts 테이블에 등록된 사람만 관리자로 취급한다
   (완전히 분리된 별도 세션이던 이전 방식과 달리 로그인 자체는 공용 Auth).
   ========================================================================== */

import { supabase } from "./supabaseClient.js";
import { escapeHtml, appPath } from "./utils.js";

function humanizeAuthError(error) {
  if (error.message?.includes("already registered")) return "이미 가입된 이메일이에요.";
  if (error.message?.includes("Password")) return "비밀번호는 6자 이상이어야 해요.";
  return "처리 중 문제가 발생했어요. 잠시 후 다시 시도해주세요.";
}

/* ---------- 고객 회원가입/로그인 ---------- */

export async function signupCustomer({ name, email, password, phone }) {
  const { data, error } = await supabase.auth.signUp({ email, password });
  if (error) return { ok: false, error: humanizeAuthError(error) };
  if (!data.user) return { ok: false, error: "가입 처리 중 문제가 발생했어요." };

  const { error: insertError } = await supabase.from("customers").insert({ id: data.user.id, name, email, phone });
  if (insertError) return { ok: false, error: "가입 처리 중 문제가 발생했어요." };

  // 프로젝트 설정에서 이메일 인증이 켜져있으면 가입 직후엔 세션이 없다.
  if (!data.session) return { ok: true, needsEmailConfirm: true };
  return { ok: true };
}

export async function loginCustomer(email, password) {
  const { error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) return { ok: false, error: "이메일 또는 비밀번호가 올바르지 않아요." };
  return { ok: true };
}

export async function logoutCustomer() {
  await supabase.auth.signOut();
}

export async function getCurrentCustomer() {
  const {
    data: { session },
  } = await supabase.auth.getSession();
  if (!session) return null;

  const { data } = await supabase.from("customers").select("*").eq("id", session.user.id).maybeSingle();
  if (!data) return null;
  return { id: data.id, name: data.name, email: data.email, phone: data.phone };
}

// 고객 전용 페이지(마이페이지 등) 최상단에서 호출 — 로그인 안 돼있으면
// 로그인 후 원래 페이지로 돌아올 수 있도록 redirect 파라미터를 붙여 보낸다.
export async function requireCustomerAuth() {
  const customer = await getCurrentCustomer();
  if (!customer) {
    const redirect = encodeURIComponent(window.location.pathname + window.location.search);
    window.location.href = `${appPath("auth/login.html")}?redirect=${redirect}`;
    return null;
  }
  return customer;
}

/* ---------- 고객 주소 관리 (로그인한 고객에 종속) ---------- */

function mapAddressRow(row) {
  return {
    id: row.id,
    label: row.label,
    recipientName: row.recipient_name,
    phone: row.phone,
    address: row.address,
    isDefault: row.is_default,
  };
}

export async function getCustomerAddresses() {
  const {
    data: { session },
  } = await supabase.auth.getSession();
  if (!session) return [];

  const { data } = await supabase
    .from("addresses")
    .select("*")
    .eq("customer_id", session.user.id)
    .order("is_default", { ascending: false });
  return (data || []).map(mapAddressRow);
}

export async function addAddress({ label, recipientName, phone, address }) {
  const {
    data: { session },
  } = await supabase.auth.getSession();
  if (!session) return [];

  const existing = await getCustomerAddresses();
  await supabase.from("addresses").insert({
    customer_id: session.user.id,
    label,
    recipient_name: recipientName,
    phone,
    address,
    is_default: existing.length === 0,
  });
  return getCustomerAddresses();
}

export async function updateAddress(addressId, { label, recipientName, phone, address }) {
  await supabase
    .from("addresses")
    .update({ label, recipient_name: recipientName, phone, address })
    .eq("id", addressId);
  return getCustomerAddresses();
}

export async function removeAddress(addressId) {
  const addresses = await getCustomerAddresses();
  const target = addresses.find((a) => a.id === addressId);
  await supabase.from("addresses").delete().eq("id", addressId);

  const remaining = await getCustomerAddresses();
  if (target?.isDefault && remaining.length > 0) {
    await setDefaultAddress(remaining[0].id);
    return getCustomerAddresses();
  }
  return remaining;
}

export async function setDefaultAddress(addressId) {
  const {
    data: { session },
  } = await supabase.auth.getSession();
  if (!session) return [];

  await supabase.from("addresses").update({ is_default: false }).eq("customer_id", session.user.id);
  await supabase.from("addresses").update({ is_default: true }).eq("id", addressId);
  return getCustomerAddresses();
}

/* ---------- 어드민 로그인 (같은 Auth, admin_accounts에 등록된 사람만) ---------- */

export async function loginAdmin(email, password) {
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) return { ok: false, error: "이메일 또는 비밀번호가 올바르지 않아요." };

  const { data: adminRow } = await supabase.from("admin_accounts").select("*").eq("id", data.user.id).maybeSingle();
  if (!adminRow) {
    await supabase.auth.signOut();
    return { ok: false, error: "관리자 계정이 아니에요." };
  }
  return { ok: true, admin: adminRow };
}

export async function logoutAdmin() {
  await supabase.auth.signOut();
}

export async function getCurrentAdmin() {
  const {
    data: { session },
  } = await supabase.auth.getSession();
  if (!session) return null;

  const { data } = await supabase.from("admin_accounts").select("*").eq("id", session.user.id).maybeSingle();
  if (!data) return null;
  return { id: data.id, email: data.email, name: data.name };
}

// 어드민 페이지 최상단에서 호출 — 로그인 안 돼있으면 즉시 로그인 페이지로 보냄.
export async function requireAdminAuth() {
  const admin = await getCurrentAdmin();
  if (!admin) {
    window.location.href = appPath("admin/login.html");
    return null;
  }
  return admin;
}

// 어드민 페이지 공통 진입점 — 인증 가드 + 사이드바의 이름 표시/로그아웃 버튼 바인딩.
// 각 admin/*.js 최상단에서 requireAdminAuth() 대신 `await initAdminGuard()`를 호출한다.
export async function initAdminGuard() {
  const admin = await requireAdminAuth();
  if (!admin) return null;

  const nameEl = document.getElementById("admin-name");
  if (nameEl) nameEl.textContent = admin.name;

  const logoutBtn = document.getElementById("admin-logout-btn");
  if (logoutBtn) {
    logoutBtn.addEventListener("click", async () => {
      await logoutAdmin();
      window.location.href = appPath("admin/login.html");
    });
  }
  return admin;
}

/* ---------- 고객 페이지 헤더 로그인 상태 표시 ---------- */

// 고객 페이지 header-actions 안의 <div id="auth-nav">를 로그인 상태에 맞춰 채운다.
export async function renderAuthNav() {
  const el = document.getElementById("auth-nav");
  if (!el) return;

  const customer = await getCurrentCustomer();

  if (!customer) {
    el.innerHTML = `<a href="${appPath("auth/login.html")}" class="auth-link">로그인</a>`;
    return;
  }

  el.innerHTML = `
    <span class="auth-greeting">${escapeHtml(customer.name)}님</span>
    <button type="button" class="auth-logout-btn" id="auth-logout-btn">로그아웃</button>
  `;

  el.querySelector("#auth-logout-btn").addEventListener("click", async () => {
    await logoutCustomer();
    window.location.reload();
  });
}
