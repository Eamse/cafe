import { categories } from "../../js/data.js";

const STORAGE_KEY = "cafe_admin_menus";
const params = new URLSearchParams(window.location.search);
const menuId = Number(params.get("id"));

function loadMenus() {
  const raw = localStorage.getItem(STORAGE_KEY);
  return raw ? JSON.parse(raw) : [];
}

function saveMenus(list) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
}

function renderCategoryOptions() {
  const select = document.getElementById("categoryId");
  select.innerHTML = categories.map((c) => `<option value="${c.id}">${c.name}</option>`).join("");
}

function fillForm(menu) {
  document.getElementById("name").value = menu.name;
  document.getElementById("categoryId").value = menu.categoryId;
  document.getElementById("price").value = menu.price;
  document.getElementById("description").value = menu.description;
  document.getElementById("isSoldOut").checked = menu.isSoldOut;
}

function handleSubmit(event) {
  event.preventDefault();

  const menus = loadMenus();
  const target = menus.find((m) => m.id === menuId);
  if (!target) return;

  target.name = document.getElementById("name").value.trim();
  target.categoryId = document.getElementById("categoryId").value;
  target.price = Number(document.getElementById("price").value);
  target.description = document.getElementById("description").value.trim();
  target.isSoldOut = document.getElementById("isSoldOut").checked;

  saveMenus(menus);
  window.location.href = `detail.html?id=${menuId}`;
}

function init() {
  renderCategoryOptions();
  const menus = loadMenus();
  const menu = menus.find((m) => m.id === menuId);

  if (!menu) {
    document.querySelector(".menu-form").innerHTML = `<p class="empty-state">메뉴를 찾을 수 없습니다.</p>`;
    return;
  }

  fillForm(menu);
  document.getElementById("menu-form").addEventListener("submit", handleSubmit);
}

init();
