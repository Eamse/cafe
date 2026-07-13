import { getEvents } from "../js/data.js";
import { renderAuthNav } from "../js/auth.js";
import { escapeHtml, renderCartBadge, initThemeToggle } from "../js/utils.js";

function render() {
  const listEl = document.getElementById("event-list");
  const events = getEvents()
    .slice()
    .sort((a, b) => (a.date < b.date ? 1 : -1));

  if (events.length === 0) {
    listEl.innerHTML = `<p class="empty-state">등록된 이벤트가 없습니다.</p>`;
    return;
  }

  listEl.innerHTML = events
    .map((event) => {
      const [year, month, day] = event.date.split("-");
      return `
    <li class="event-row ${event.isEnded ? "is-ended" : ""}">
      <div class="event-date">
        <span class="event-day">${day}</span>
        <span class="event-month">${year}.${month}</span>
      </div>
      <div class="event-info">
        <h3>${escapeHtml(event.title)}${event.isEnded ? `<span class="event-ended-tag">종료된 이벤트입니다</span>` : ""}</h3>
        <p>${escapeHtml(event.description)}</p>
      </div>
      <div class="event-thumb" style="${event.image ? `background-image: url('${event.image}')` : ""}">
        ${event.isEnded ? `<span class="event-ended-watermark">종료된 이벤트입니다</span>` : ""}
      </div>
    </li>
  `;
    })
    .join("");
}

render();
renderCartBadge();
initThemeToggle();
renderAuthNav();
