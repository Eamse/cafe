/* ==========================================================================
   인증 (임시 — localStorage 기반, 추후 Supabase Auth로 교체 예정)
   고객 회원가입/로그인과 어드민 로그인은 완전히 분리된 별도 세션/저장소를
   사용한다. 비밀번호는 데모 수준(평문 저장)이며, 실제 서비스 전환 시
   Supabase Auth 연동으로 대체되어야 한다.
   ========================================================================== */

import { escapeHtml, generateId } from "./utils.js";

/* ---------- 고객 회원가입/로그인 ---------- */

const CUSTOMERS_KEY = "cafe_customers";
const CUSTOMER_SESSION_KEY = "cafe_customer_session";

export function getCustomers() {
  try {
    return JSON.parse(localStorage.getItem(CUSTOMERS_KEY)) || [];
  } catch {
    return [];
  }
}

function saveCustomers(list) {
  localStorage.setItem(CUSTOMERS_KEY, JSON.stringify(list));
}

export function signupCustomer({ name, email, password, phone }) {
  const customers = getCustomers();
  if (customers.some((c) => c.email === email)) {
    return { ok: false, error: "이미 가입된 이메일이에요." };
  }

  const customer = { id: generateId("customer"), name, email, password, phone, createdAt: new Date().toISOString() };
  customers.push(customer);
  saveCustomers(customers);
  localStorage.setItem(CUSTOMER_SESSION_KEY, customer.id);
  return { ok: true, customer };
}

export function loginCustomer(email, password) {
  const customer = getCustomers().find((c) => c.email === email && c.password === password);
  if (!customer) return { ok: false, error: "이메일 또는 비밀번호가 올바르지 않아요." };
  localStorage.setItem(CUSTOMER_SESSION_KEY, customer.id);
  return { ok: true, customer };
}

export function logoutCustomer() {
  localStorage.removeItem(CUSTOMER_SESSION_KEY);
}

export function getCurrentCustomer() {
  const id = localStorage.getItem(CUSTOMER_SESSION_KEY);
  if (!id) return null;
  return getCustomers().find((c) => c.id === id) || null;
}

// 고객 전용 페이지(마이페이지 등) 최상단에서 호출 — 로그인 안 돼있으면
// 로그인 후 원래 페이지로 돌아올 수 있도록 redirect 파라미터를 붙여 보낸다.
export function requireCustomerAuth() {
  if (!getCurrentCustomer()) {
    const redirect = encodeURIComponent(window.location.pathname + window.location.search);
    window.location.href = `/auth/login.html?redirect=${redirect}`;
    return false;
  }
  return true;
}

/* ---------- 고객 주소 관리 (로그인한 고객에 종속) ---------- */

export function getCustomerAddresses() {
  const customer = getCurrentCustomer();
  return customer?.addresses || [];
}

function updateCurrentCustomer(mutate) {
  const customers = getCustomers();
  const customer = customers.find((c) => c.id === localStorage.getItem(CUSTOMER_SESSION_KEY));
  if (!customer) return [];
  if (!customer.addresses) customer.addresses = [];
  mutate(customer.addresses);
  saveCustomers(customers);
  return customer.addresses;
}

export function addAddress({ label, recipientName, phone, address }) {
  return updateCurrentCustomer((addresses) => {
    addresses.push({
      id: generateId("address"),
      label,
      recipientName,
      phone,
      address,
      isDefault: addresses.length === 0,
    });
  });
}

export function updateAddress(addressId, { label, recipientName, phone, address }) {
  return updateCurrentCustomer((addresses) => {
    const target = addresses.find((a) => a.id === addressId);
    if (target) Object.assign(target, { label, recipientName, phone, address });
  });
}

export function removeAddress(addressId) {
  return updateCurrentCustomer((addresses) => {
    const index = addresses.findIndex((a) => a.id === addressId);
    if (index === -1) return;
    const wasDefault = addresses[index].isDefault;
    addresses.splice(index, 1);
    if (wasDefault && addresses.length > 0) addresses[0].isDefault = true;
  });
}

export function setDefaultAddress(addressId) {
  return updateCurrentCustomer((addresses) => {
    addresses.forEach((a) => {
      a.isDefault = a.id === addressId;
    });
  });
}

/* ---------- 어드민 로그인 (고객과 완전히 분리된 별도 세션) ---------- */

const ADMIN_ACCOUNTS_KEY = "cafe_admin_accounts";
const ADMIN_SESSION_KEY = "cafe_admin_session";

const DEFAULT_ADMIN = { id: "admin-default", email: "admin@cafe.com", password: "admin1234", name: "관리자" };

function getAdminAccounts() {
  try {
    const raw = JSON.parse(localStorage.getItem(ADMIN_ACCOUNTS_KEY));
    if (raw && raw.length > 0) return raw;
  } catch {
    /* 저장된 값이 손상된 경우 기본 계정으로 복구 */
  }
  localStorage.setItem(ADMIN_ACCOUNTS_KEY, JSON.stringify([DEFAULT_ADMIN]));
  return [DEFAULT_ADMIN];
}

export function loginAdmin(email, password) {
  const admin = getAdminAccounts().find((a) => a.email === email && a.password === password);
  if (!admin) return { ok: false, error: "이메일 또는 비밀번호가 올바르지 않아요." };
  localStorage.setItem(ADMIN_SESSION_KEY, admin.id);
  return { ok: true, admin };
}

export function logoutAdmin() {
  localStorage.removeItem(ADMIN_SESSION_KEY);
}

export function getCurrentAdmin() {
  const id = localStorage.getItem(ADMIN_SESSION_KEY);
  if (!id) return null;
  return getAdminAccounts().find((a) => a.id === id) || null;
}

// 어드민 페이지 최상단에서 호출 — 로그인 안 돼있으면 즉시 로그인 페이지로 보냄.
export function requireAdminAuth() {
  if (!getCurrentAdmin()) {
    window.location.href = "/admin/login.html";
    return false;
  }
  return true;
}

// 어드민 페이지 공통 진입점 — 인증 가드 + 사이드바의 이름 표시/로그아웃 버튼 바인딩.
// 각 admin/*.js 최상단에서 requireAdminAuth() 대신 이걸 호출한다.
export function initAdminGuard() {
  if (!requireAdminAuth()) return;

  document.addEventListener("DOMContentLoaded", () => {
    const admin = getCurrentAdmin();
    const nameEl = document.getElementById("admin-name");
    if (nameEl && admin) nameEl.textContent = admin.name;

    const logoutBtn = document.getElementById("admin-logout-btn");
    if (logoutBtn) {
      logoutBtn.addEventListener("click", () => {
        logoutAdmin();
        window.location.href = "/admin/login.html";
      });
    }
  });
}

/* ---------- 고객 페이지 헤더 로그인 상태 표시 ---------- */

// 고객 페이지 header-actions 안의 <div id="auth-nav">를 로그인 상태에 맞춰 채운다.
export function renderAuthNav() {
  const el = document.getElementById("auth-nav");
  if (!el) return;

  const customer = getCurrentCustomer();

  if (!customer) {
    el.innerHTML = `<a href="/auth/login.html" class="auth-link">로그인</a>`;
    return;
  }

  el.innerHTML = `
    <span class="auth-greeting">${escapeHtml(customer.name)}님</span>
    <button type="button" class="auth-logout-btn" id="auth-logout-btn">로그아웃</button>
  `;

  el.querySelector("#auth-logout-btn").addEventListener("click", () => {
    logoutCustomer();
    window.location.reload();
  });
}
