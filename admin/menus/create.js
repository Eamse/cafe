import { initAdminGuard } from "../../js/auth.js";
initAdminGuard();
import { getCategories, getMenus, saveMenus } from "../../js/data.js";
import { readImageFileAsDataUrl } from "../../js/utils.js";

let imageDataUrl = "";

function nextId(menus) {
  return menus.reduce((max, menu) => Math.max(max, menu.id), 0) + 1;
}

function renderCategoryOptions() {
  const select = document.getElementById("categoryId");
  select.innerHTML = getCategories().map((c) => `<option value="${c.id}">${c.name}</option>`).join("");
}

function showError(message) {
  const errorEl = document.getElementById("form-error");
  errorEl.textContent = message;
  errorEl.hidden = false;
}

function clearError() {
  const errorEl = document.getElementById("form-error");
  errorEl.hidden = true;
  errorEl.textContent = "";
}

function updateImagePreview() {
  const preview = document.getElementById("image-preview");
  const removeBtn = document.getElementById("image-remove-btn");
  preview.classList.remove("is-broken");

  if (imageDataUrl) {
    preview.style.backgroundImage = `url('${imageDataUrl}')`;
    preview.classList.add("has-image");
    preview.textContent = "";
    removeBtn.hidden = false;
  } else {
    preview.style.backgroundImage = "";
    preview.classList.remove("has-image");
    preview.textContent = "미리보기";
    removeBtn.hidden = true;
  }
}

async function handleImageFileChange(event) {
  const file = event.target.files[0];
  if (!file) return;

  if (!file.type.startsWith("image/")) {
    showError("이미지 파일만 선택할 수 있어요.");
    event.target.value = "";
    return;
  }

  clearError();
  try {
    imageDataUrl = await readImageFileAsDataUrl(file);
  } catch {
    showError("이미지를 불러오지 못했어요. 다른 사진으로 시도해주세요.");
    imageDataUrl = "";
  }
  updateImagePreview();
}

function handleRemoveImage() {
  imageDataUrl = "";
  document.getElementById("image-file").value = "";
  updateImagePreview();
}

function handleSubmit(event) {
  event.preventDefault();
  clearError();

  const menus = getMenus();
  const hasSizeOption = document.getElementById("hasSizeOption").checked;
  const newMenu = {
    id: nextId(menus),
    categoryId: document.getElementById("categoryId").value,
    name: document.getElementById("name").value.trim(),
    price: Number(document.getElementById("price").value),
    description: document.getElementById("description").value.trim(),
    image: imageDataUrl,
    isSoldOut: document.getElementById("isSoldOut").checked,
    hasTempOption: document.getElementById("hasTempOption").checked,
    hasSizeOption,
    sizeUpcharge: hasSizeOption ? Number(document.getElementById("sizeUpcharge").value) || 0 : 0,
  };

  if (!newMenu.name) {
    showError("메뉴명을 입력해주세요.");
    return;
  }
  if (!newMenu.price || newMenu.price <= 0) {
    showError("가격은 0보다 큰 숫자로 입력해주세요.");
    return;
  }

  menus.push(newMenu);

  try {
    saveMenus(menus);
  } catch {
    showError("저장 공간이 부족해요. 다른 메뉴 사진을 정리하거나 더 작은 사진으로 시도해주세요.");
    return;
  }

  window.location.href = "list.html";
}

function updateSizeUpchargeVisibility() {
  document.getElementById("size-upcharge-field").hidden = !document.getElementById("hasSizeOption").checked;
}

renderCategoryOptions();
updateImagePreview();
updateSizeUpchargeVisibility();
document.getElementById("image-file").addEventListener("change", handleImageFileChange);
document.getElementById("image-remove-btn").addEventListener("click", handleRemoveImage);
document.getElementById("hasSizeOption").addEventListener("change", updateSizeUpchargeVisibility);
document.getElementById("menu-form").addEventListener("submit", handleSubmit);
