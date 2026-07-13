import { initAdminGuard } from "../../js/auth.js";
initAdminGuard();
import { getEvents, saveEvents, isEventEnded } from "../../js/data.js";
import { escapeHtml, formatDate, generateId, readImageFileAsDataUrl } from "../../js/utils.js";

let imageDataUrl = "";

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
  document.getElementById("event-image-url").value = "";
  try {
    imageDataUrl = await readImageFileAsDataUrl(file);
  } catch {
    showError("이미지를 불러오지 못했어요. 다른 사진으로 시도해주세요.");
    imageDataUrl = "";
  }
  updateImagePreview();
}

function handleImageUrlInput(event) {
  document.getElementById("event-image-file").value = "";
  imageDataUrl = event.target.value.trim();
  updateImagePreview();
}

function handleRemoveImage() {
  imageDataUrl = "";
  document.getElementById("event-image-file").value = "";
  document.getElementById("event-image-url").value = "";
  updateImagePreview();
}

function render() {
  const listEl = document.getElementById("event-list");
  const events = getEvents();

  if (events.length === 0) {
    listEl.innerHTML = `<p class="empty-state">등록된 이벤트가 없습니다.</p>`;
    return;
  }

  listEl.innerHTML = events
    .slice()
    .sort((a, b) => (a.date < b.date ? 1 : -1))
    .map((event) => {
      const ended = isEventEnded(event);
      return `
    <div class="event-row-admin ${ended ? "is-ended" : ""}" data-id="${event.id}">
      <div class="event-thumb-admin" style="${event.image ? `background-image: url('${event.image}')` : ""}">
        ${ended ? `<span class="ended-watermark">종료된 이벤트입니다</span>` : ""}
      </div>
      <div class="event-info-admin">
        <div class="event-title-admin">
          ${escapeHtml(event.title)}
          ${ended ? `<span class="ended-tag">종료된 이벤트입니다</span>` : ""}
        </div>
        <div class="event-date-admin">${formatDate(event.date)}</div>
        <p class="event-desc-admin">${escapeHtml(event.description)}</p>
        <label class="event-end-date-field">
          <span>종료 예정일</span>
          <input type="date" data-action="end-date" value="${event.endDate || ""}" />
        </label>
      </div>
      <div class="event-actions-admin">
        <label class="event-end-toggle">
          <input type="checkbox" data-action="toggle-ended" ${event.isEnded ? "checked" : ""} />
          <span>종료됨(수동)</span>
        </label>
        <button type="button" class="btn-remove" data-action="remove">삭제</button>
      </div>
    </div>
  `;
    })
    .join("");

  listEl.querySelectorAll(".event-row-admin").forEach((row) => {
    const id = row.dataset.id;

    row.querySelector('[data-action="toggle-ended"]').addEventListener("change", (event) => {
      const events = getEvents();
      const target = events.find((e) => e.id === id);
      target.isEnded = event.target.checked;
      saveEvents(events);
      render();
    });

    row.querySelector('[data-action="end-date"]').addEventListener("change", (event) => {
      const events = getEvents();
      const target = events.find((e) => e.id === id);
      target.endDate = event.target.value || null;
      saveEvents(events);
      render();
    });

    row.querySelector('[data-action="remove"]').addEventListener("click", () => {
      if (!confirm("이 이벤트를 삭제하시겠습니까?")) return;
      saveEvents(getEvents().filter((e) => e.id !== id));
      render();
    });
  });
}

document.getElementById("event-form").addEventListener("submit", (event) => {
  event.preventDefault();
  clearError();

  const title = document.getElementById("event-title").value.trim();
  const date = document.getElementById("event-date").value;
  const endDate = document.getElementById("event-end-date").value || null;
  const description = document.getElementById("event-description").value.trim();

  if (!title || !date || !description) {
    showError("제목, 날짜, 내용을 모두 입력해주세요.");
    return;
  }
  if (endDate && endDate < date) {
    showError("종료 예정일은 이벤트 날짜보다 이후여야 해요.");
    return;
  }

  const events = getEvents();
  events.push({
    id: generateId("event"),
    title,
    date,
    endDate,
    description,
    image: imageDataUrl,
    isEnded: false,
  });

  try {
    saveEvents(events);
  } catch {
    showError("저장 공간이 부족해요. 다른 이벤트 사진을 정리하거나 더 작은 사진으로 시도해주세요.");
    return;
  }

  document.getElementById("event-form").reset();
  imageDataUrl = "";
  updateImagePreview();
  render();
});

document.getElementById("event-image-file").addEventListener("change", handleImageFileChange);
document.getElementById("event-image-url").addEventListener("input", handleImageUrlInput);
document.getElementById("image-remove-btn").addEventListener("click", handleRemoveImage);

updateImagePreview();
render();
