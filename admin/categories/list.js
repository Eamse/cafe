import { initAdminGuard } from "../../js/auth.js";
await initAdminGuard();
import { getCategories, createCategory, renameCategory, deleteCategory, getMenus } from "../../js/data.js";
import { escapeHtml, generateId } from "../../js/utils.js";

let categoriesCache = [];
let menusCache = [];

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

function menuCountFor(categoryId) {
  return menusCache.filter((menu) => menu.categoryId === categoryId).length;
}

function render() {
  const listEl = document.getElementById("category-list");

  if (categoriesCache.length === 0) {
    listEl.innerHTML = `<p class="empty-state">등록된 카테고리가 없습니다.</p>`;
    return;
  }

  listEl.innerHTML = categoriesCache
    .map((category) => {
      const count = menuCountFor(category.id);
      return `
    <div class="category-row" data-id="${category.id}">
      <div class="category-name">
        ${escapeHtml(category.name)}
        <span class="category-count">메뉴 ${count}개</span>
      </div>
      <input type="text" class="category-edit-input" value="${escapeHtml(category.name)}" maxlength="20" />
      <div class="category-actions">
        <button type="button" class="btn-rename" data-action="rename">수정</button>
        <button type="button" class="btn-remove" data-action="remove" ${count > 0 ? "disabled title=\"이 카테고리를 쓰는 메뉴가 있어서 삭제할 수 없어요\"" : ""}>삭제</button>
        <button type="button" class="category-save" data-action="save">저장</button>
        <button type="button" class="category-cancel" data-action="cancel">취소</button>
      </div>
    </div>
  `;
    })
    .join("");

  listEl.querySelectorAll(".category-row").forEach((row) => {
    const id = row.dataset.id;
    const input = row.querySelector(".category-edit-input");

    row.querySelector('[data-action="rename"]').addEventListener("click", () => {
      row.classList.add("is-editing");
      input.value = categoriesCache.find((c) => c.id === id).name;
      input.focus();
      input.select();
    });

    row.querySelector('[data-action="cancel"]').addEventListener("click", () => {
      row.classList.remove("is-editing");
    });

    row.querySelector('[data-action="save"]').addEventListener("click", async () => {
      const newName = input.value.trim();
      if (!newName) {
        showError("카테고리 이름을 입력해주세요.");
        return;
      }
      clearError();
      await renameCategory(id, newName);
      categoriesCache.find((c) => c.id === id).name = newName;
      render();
    });

    const removeBtn = row.querySelector('[data-action="remove"]');
    removeBtn.addEventListener("click", async () => {
      if (removeBtn.disabled) return;
      if (!confirm("이 카테고리를 삭제하시겠습니까?")) return;
      await deleteCategory(id);
      categoriesCache = categoriesCache.filter((c) => c.id !== id);
      render();
    });
  });
}

document.getElementById("category-form").addEventListener("submit", async (event) => {
  event.preventDefault();
  clearError();

  const input = document.getElementById("new-category-name");
  const name = input.value.trim();
  if (!name) {
    showError("카테고리 이름을 입력해주세요.");
    return;
  }

  if (categoriesCache.some((c) => c.name === name)) {
    showError("이미 있는 카테고리 이름이에요.");
    return;
  }

  // 네트워크가 느릴 때 두 번 제출하면 카테고리가 중복 생성될 수 있어 잠근다.
  const submitBtn = event.target.querySelector('button[type="submit"]');
  submitBtn.disabled = true;

  const id = generateId("cat");
  await createCategory({ id, name });
  categoriesCache.push({ id, name });
  input.value = "";
  render();

  submitBtn.disabled = false;
});

async function init() {
  [categoriesCache, menusCache] = await Promise.all([getCategories(), getMenus()]);
  render();
}

init();
