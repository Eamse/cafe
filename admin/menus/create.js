import { categories } from "../../js/data.js";

const STORAGE_KEY = "cafe_admin_menus";

function loadMenus() {
  const raw = localStorage.getItem(STORAGE_KEY);
  return raw ? JSON.parse(raw) : [];
}

function saveMenus(list) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
}

function nextId(menus) {
  return menus.reduce((max, menu) => Math.max(max, menu.id), 0) + 1;
}

function renderCategoryOptions() {
  const select = document.getElementById("categoryId");
  select.innerHTML = categories.map((c) => `<option value="${c.id}">${c.name}</option>`).join("");
}

function handleSubmit(event) {
  event.preventDefault();

  const menus = loadMenus();
  const newMenu = {
    id: nextId(menus),
    categoryId: document.getElementById("categoryId").value,
    name: document.getElementById("name").value.trim(),
    price: Number(document.getElementById("price").value),
    description: document.getElementById("description").value.trim(),
    image: "",
    isSoldOut: document.getElementById("isSoldOut").checked,
  };

  if (!newMenu.name || !newMenu.price) return;

  menus.push(newMenu);
  saveMenus(menus);
  window.location.href = "list.html";
}

renderCategoryOptions();
document.getElementById("menu-form").addEventListener("submit", handleSubmit);
