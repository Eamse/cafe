import { initAdminGuard } from "../../js/auth.js";
initAdminGuard();
import { getNotices, createNotice, deleteNotice, getActiveNoticeIds, toggleActiveNotice, MAX_ACTIVE_NOTICES } from "../../js/data.js";
import { escapeHtml, formatDate, generateId } from "../../js/utils.js";

let noticesCache = [];
let activeIdsCache = [];

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

function render() {
  const listEl = document.getElementById("notice-list");

  if (noticesCache.length === 0) {
    listEl.innerHTML = `<p class="empty-state">등록된 공지가 없습니다.</p>`;
    return;
  }

  listEl.innerHTML = noticesCache
    .slice()
    .reverse()
    .map((notice) => {
      const isActive = activeIdsCache.includes(notice.id);
      return `
    <div class="notice-row ${isActive ? "is-active" : ""}" data-id="${notice.id}">
      <label class="notice-toggle">
        <input type="checkbox" data-action="toggle-active" ${isActive ? "checked" : ""} ${!isActive && activeIdsCache.length >= MAX_ACTIVE_NOTICES ? "disabled" : ""} />
        <span>노출</span>
      </label>
      <div class="notice-info">
        <div class="notice-message">${escapeHtml(notice.message)}</div>
        <div class="notice-date">${formatDate(notice.date)}</div>
      </div>
      <button type="button" class="btn-remove" data-action="remove">삭제</button>
    </div>
  `;
    })
    .join("");

  listEl.querySelectorAll(".notice-row").forEach((row) => {
    const id = row.dataset.id;

    row.querySelector('[data-action="toggle-active"]').addEventListener("change", async () => {
      activeIdsCache = await toggleActiveNotice(id);
      render();
    });

    row.querySelector('[data-action="remove"]').addEventListener("click", async () => {
      if (!confirm("이 공지를 삭제하시겠습니까?")) return;
      await deleteNotice(id);
      noticesCache = noticesCache.filter((n) => n.id !== id);
      activeIdsCache = activeIdsCache.filter((activeId) => activeId !== id);
      render();
    });
  });
}

document.getElementById("notice-form").addEventListener("submit", async (event) => {
  event.preventDefault();
  clearError();

  const messageInput = document.getElementById("new-notice-message");
  const dateInput = document.getElementById("new-notice-date");
  const message = messageInput.value.trim();
  const date = dateInput.value;

  if (!message || !date) {
    showError("공지 내용과 날짜를 모두 입력해주세요.");
    return;
  }

  const id = generateId("notice");
  await createNotice({ id, message, date });
  noticesCache.push({ id, message, date });

  messageInput.value = "";
  dateInput.value = "";
  render();
});

async function init() {
  [noticesCache, activeIdsCache] = await Promise.all([getNotices(), getActiveNoticeIds()]);
  render();
}

init();
