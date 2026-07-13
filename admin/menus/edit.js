import { initAdminGuard } from "../../js/auth.js";
initAdminGuard();
import { getCategories, getMenus, saveMenus } from "../../js/data.js";
import { readImageFileAsDataUrl, escapeHtml } from "../../js/utils.js";

const params = new URLSearchParams(window.location.search);
const menuId = Number(params.get("id"));

let imageDataUrl = "";

function renderCategoryOptions() {
  const select = document.getElementById("categoryId");
  select.innerHTML = getCategories().map((c) => `<option value="${c.id}">${escapeHtml(c.name)}</option>`).join("");
}

function fillForm(menu) {
  document.getElementById("name").value = menu.name;
  document.getElementById("categoryId").value = menu.categoryId;
  document.getElementById("price").value = menu.price;
  document.getElementById("description").value = menu.description;
  document.getElementById("isSoldOut").checked = menu.isSoldOut;
  document.getElementById("hasTempOption").checked = Boolean(menu.hasTempOption);
  document.getElementById("hasSizeOption").checked = Boolean(menu.hasSizeOption);
  document.getElementById("sizeUpcharge").value = menu.sizeUpcharge || 0;
  updateSizeUpchargeVisibility();
  imageDataUrl = menu.image || "";
  document.getElementById("image-url").value = imageDataUrl.startsWith("data:") ? "" : imageDataUrl;
  updateImagePreview();
}

function updateSizeUpchargeVisibility() {
  document.getElementById("size-upcharge-field").hidden = !document.getElementById("hasSizeOption").checked;
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
  document.getElementById("image-url").value = "";
  try {
    imageDataUrl = await readImageFileAsDataUrl(file);
  } catch {
    showError("이미지를 불러오지 못했어요. 다른 사진으로 시도해주세요.");
  }
  updateImagePreview();
}

function handleImageUrlInput(event) {
  document.getElementById("image-file").value = "";
  imageDataUrl = event.target.value.trim();
  updateImagePreview();
}

function handleRemoveImage() {
  imageDataUrl = "";
  document.getElementById("image-file").value = "";
  document.getElementById("image-url").value = "";
  updateImagePreview();
}

function handleSubmit(event) {
  event.preventDefault();
  clearError();

  const menus = getMenus();
  const target = menus.find((m) => m.id === menuId);
  if (!target) return;

  const name = document.getElementById("name").value.trim();
  const price = Number(document.getElementById("price").value);

  if (!name) {
    showError("메뉴명을 입력해주세요.");
    return;
  }
  if (!price || price <= 0) {
    showError("가격은 0보다 큰 숫자로 입력해주세요.");
    return;
  }

  const hasSizeOption = document.getElementById("hasSizeOption").checked;

  target.name = name;
  target.categoryId = document.getElementById("categoryId").value;
  target.price = price;
  target.description = document.getElementById("description").value.trim();
  target.image = imageDataUrl;
  target.isSoldOut = document.getElementById("isSoldOut").checked;
  target.hasTempOption = document.getElementById("hasTempOption").checked;
  target.hasSizeOption = hasSizeOption;
  target.sizeUpcharge = hasSizeOption ? Number(document.getElementById("sizeUpcharge").value) || 0 : 0;

  try {
    saveMenus(menus);
  } catch {
    showError("저장 공간이 부족해요. 다른 메뉴 사진을 정리하거나 더 작은 사진으로 시도해주세요.");
    return;
  }

  window.location.href = `detail.html?id=${menuId}`;
}

function init() {
  renderCategoryOptions();
  const menus = getMenus();
  const menu = menus.find((m) => m.id === menuId);

  if (!menu) {
    document.querySelector(".menu-form").innerHTML = `<p class="empty-state">메뉴를 찾을 수 없습니다.</p>`;
    return;
  }

  fillForm(menu);
  document.getElementById("image-file").addEventListener("change", handleImageFileChange);
  document.getElementById("image-url").addEventListener("input", handleImageUrlInput);
  document.getElementById("image-remove-btn").addEventListener("click", handleRemoveImage);
  document.getElementById("hasSizeOption").addEventListener("change", updateSizeUpchargeVisibility);
  document.getElementById("menu-form").addEventListener("submit", handleSubmit);
}

init();
