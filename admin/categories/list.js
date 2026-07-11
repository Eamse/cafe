import { getCategories, saveCategories, getMenus } from "../../js/data.js";
import { escapeHtml, generateId } from "../../js/utils.js";

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
  return getMenus().filter((menu) => menu.categoryId === categoryId).length;
}

function render() {
  const listEl = document.getElementById("category-list");
  const categories = getCategories();

  if (categories.length === 0) {
    listEl.innerHTML = `<p class="empty-state">등록된 카테고리가 없습니다.</p>`;
    return;
  }

  listEl.innerHTML = categories
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
      input.value = getCategories().find((c) => c.id === id).name;
      input.focus();
      input.select();
    });

    row.querySelector('[data-action="cancel"]').addEventListener("click", () => {
      row.classList.remove("is-editing");
    });

    row.querySelector('[data-action="save"]').addEventListener("click", () => {
      const newName = input.value.trim();
      if (!newName) {
        showError("카테고리 이름을 입력해주세요.");
        return;
      }
      clearError();
      const categories = getCategories();
      const target = categories.find((c) => c.id === id);
      target.name = newName;
      saveCategories(categories);
      render();
    });

    const removeBtn = row.querySelector('[data-action="remove"]');
    removeBtn.addEventListener("click", () => {
      if (removeBtn.disabled) return;
      if (!confirm("이 카테고리를 삭제하시겠습니까?")) return;
      const categories = getCategories().filter((c) => c.id !== id);
      saveCategories(categories);
      render();
    });
  });
}

document.getElementById("category-form").addEventListener("submit", (event) => {
  event.preventDefault();
  clearError();

  const input = document.getElementById("new-category-name");
  const name = input.value.trim();
  if (!name) {
    showError("카테고리 이름을 입력해주세요.");
    return;
  }

  const categories = getCategories();
  if (categories.some((c) => c.name === name)) {
    showError("이미 있는 카테고리 이름이에요.");
    return;
  }

  categories.push({ id: generateId("cat"), name });
  saveCategories(categories);
  input.value = "";
  render();
});

render();
