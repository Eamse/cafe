import { getMenus, categories } from "./js/data.js";
import { formatPrice, escapeHtml, renderCartBadge } from "./js/utils.js";

let activeCategory = "all";
let activeSort = "default";

function sortMenus(menus) {
  const sorted = menus.slice();
  if (activeSort === "price-asc") sorted.sort((a, b) => a.price - b.price);
  else if (activeSort === "price-desc") sorted.sort((a, b) => b.price - a.price);
  else if (activeSort === "name") sorted.sort((a, b) => a.name.localeCompare(b.name, "ko"));
  return sorted;
}

function getCategoryName(categoryId) {
  const category = categories.find((c) => c.id === categoryId);
  return category ? category.name : categoryId;
}

function renderTabs() {
  const tabs = document.getElementById("category-tabs");
  const allTabs = [{ id: "all", name: "전체" }, ...categories];

  tabs.innerHTML = allTabs
    .map(
      (tab) => `
    <button class="tab-btn ${tab.id === activeCategory ? "active" : ""}" data-category="${tab.id}">
      ${tab.name}
    </button>
  `
    )
    .join("");

  tabs.querySelectorAll(".tab-btn").forEach((btn) => {
    btn.addEventListener("click", () => {
      activeCategory = btn.dataset.category;
      renderTabs();
      renderMenuGrid();
    });
  });
}

function renderMenuGrid() {
  const grid = document.getElementById("menu-grid");
  const menus = getMenus();
  const filtered = sortMenus(activeCategory === "all" ? menus : menus.filter((m) => m.categoryId === activeCategory));

  if (filtered.length === 0) {
    grid.innerHTML = `<p class="menu-empty">등록된 메뉴가 없습니다.</p>`;
    return;
  }

  grid.innerHTML = filtered
    .map(
      (menu) => `
    <a class="menu-card cat-${menu.categoryId}" href="menus/detail.html?id=${menu.id}">
      ${menu.isSoldOut ? `<div class="sold-out-tag">품절</div>` : ""}
      <div class="menu-name">${escapeHtml(menu.name)}</div>
      <div class="menu-category">${getCategoryName(menu.categoryId)}</div>
      <div class="menu-price">${formatPrice(menu.price)}</div>
    </a>
  `
    )
    .join("");
}

document.getElementById("sort-select").addEventListener("change", (event) => {
  activeSort = event.target.value;
  renderMenuGrid();
});

renderTabs();
renderMenuGrid();
renderCartBadge();

/* ==========================================================================
   문의하기 — 규칙 기반 FAQ 챗봇 (실제 AI 호출 없음, 키워드 매칭)
   ========================================================================== */

const FAQ_RULES = [
  { keywords: ["다시 담", "재주문"], answer: "주문내역에서 각 주문 옆의 \"다시 담기\" 버튼을 누르면 그 주문 메뉴가 장바구니에 다시 담겨요." },
  { keywords: ["주문", "시키"], answer: "메뉴 상세에서 수량을 고르고 \"장바구니 담기\"를 누른 뒤, 장바구니에서 \"주문하기\"를 누르면 주문이 완료돼요." },
  { keywords: ["취소"], answer: "\"주문내역\"에서 주문 상세로 들어가면, \"주문완료\" 상태일 때만 \"주문 취소\" 버튼으로 직접 취소할 수 있어요." },
  { keywords: ["품절"], answer: "품절된 메뉴는 카드에 \"품절\" 표시가 뜨고 장바구니에 담을 수 없어요." },
  { keywords: ["장바구니", "담"], answer: "담은 메뉴는 상단 \"장바구니\" 메뉴에서 확인하고, +/- 버튼으로 수량도 바꿀 수 있어요." },
  { keywords: ["마이페이지", "주문내역", "내역"], answer: "주문 요약은 \"마이페이지\"에서, 전체 주문 내역은 \"주문내역\" 메뉴에서 확인할 수 있어요." },
];

function findAnswer(question) {
  const normalized = question.toLowerCase();
  const rule = FAQ_RULES.find((r) => r.keywords.some((k) => normalized.includes(k)));
  return rule ? rule.answer : "죄송해요, 아직 그 질문엔 답변드리기 어려워요. 다른 방식으로 다시 물어봐주시겠어요?";
}

function appendMessage(role, text) {
  const log = document.getElementById("inquiry-log");
  const bubble = document.createElement("div");
  bubble.className = `inquiry-message inquiry-message-${role}`;
  bubble.textContent = text;
  log.appendChild(bubble);
  log.scrollTop = log.scrollHeight;
}

function initInquiry() {
  const fab = document.getElementById("inquiry-fab");
  const modal = document.getElementById("inquiry-modal");
  const closeBtn = document.getElementById("inquiry-close");
  const form = document.getElementById("inquiry-form");
  const input = document.getElementById("inquiry-input");
  let greeted = false;

  fab.addEventListener("click", () => {
    modal.hidden = false;
    if (!greeted) {
      appendMessage("bot", "안녕하세요! 주문, 취소, 장바구니 등 궁금한 걸 물어보세요.");
      greeted = true;
    }
    input.focus();
  });

  closeBtn.addEventListener("click", () => {
    modal.hidden = true;
  });

  form.addEventListener("submit", (event) => {
    event.preventDefault();
    const question = input.value.trim();
    if (!question) return;
    appendMessage("user", question);
    input.value = "";
    setTimeout(() => appendMessage("bot", findAnswer(question)), 300);
  });
}

initInquiry();
