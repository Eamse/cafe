import { initAdminGuard } from "../../js/auth.js";
initAdminGuard();
import { formatPrice, getOrders } from "../../js/utils.js";

// 날짜(YYYY-MM-DD) -> { count, revenue }로 묶는다. 건수는 취소 포함 전체,
// 매출은 대시보드와 같은 기준으로 취소 주문을 뺀 값만 합산한다.
function groupByDate(orders) {
  const map = new Map();
  orders.forEach((order) => {
    const date = order.createdAt.slice(0, 10);
    const entry = map.get(date) || { count: 0, revenue: 0 };
    entry.count += 1;
    if (order.status !== "취소") entry.revenue += order.total;
    map.set(date, entry);
  });
  return map;
}

function renderSummary(orders) {
  const totalRevenue = orders.filter((o) => o.status !== "취소").reduce((sum, o) => sum + o.total, 0);
  const cancelledCount = orders.filter((o) => o.status === "취소").length;

  const stats = [
    { label: "총 매출", value: formatPrice(totalRevenue), sub: "취소 제외" },
    { label: "총 주문", value: `${orders.length}건`, sub: `취소 ${cancelledCount}건 포함` },
  ];

  document.getElementById("stat-grid").innerHTML = stats
    .map(
      (stat) => `
    <div class="stat-card glass-card">
      <div class="stat-label">${stat.label}</div>
      <div class="stat-value">${stat.value}</div>
      <div class="stat-sub">${stat.sub}</div>
    </div>
  `
    )
    .join("");
}

function renderTable(byDate) {
  const tbody = document.getElementById("stats-table-body");
  const dates = [...byDate.keys()].sort((a, b) => (a < b ? 1 : -1));

  if (dates.length === 0) {
    tbody.innerHTML = `<tr><td colspan="3" class="empty-state">주문 내역이 없습니다.</td></tr>`;
    return;
  }

  tbody.innerHTML = dates
    .map((date) => {
      const { count, revenue } = byDate.get(date);
      return `<tr data-date="${date}"><td>${date}</td><td>${count}건</td><td>${formatPrice(revenue)}</td></tr>`;
    })
    .join("");
}

function renderLookup(byDate, date) {
  const resultEl = document.getElementById("stats-lookup-result");
  const clearBtn = document.getElementById("stats-date-clear");

  document.querySelectorAll("#stats-table-body tr").forEach((row) => {
    row.classList.toggle("is-highlighted", row.dataset.date === date);
  });

  if (!date) {
    resultEl.textContent = "";
    clearBtn.hidden = true;
    return;
  }

  clearBtn.hidden = false;
  const entry = byDate.get(date);

  if (!entry) {
    resultEl.innerHTML = `${date}에는 주문이 없어요.`;
    return;
  }

  resultEl.innerHTML = `${date} 매출: <b>${formatPrice(entry.revenue)}</b> (${entry.count}건)`;
}

async function init() {
  const orders = getOrders();
  const byDate = groupByDate(orders);

  renderSummary(orders);
  renderTable(byDate);

  const dateInput = document.getElementById("stats-date");
  const clearBtn = document.getElementById("stats-date-clear");

  dateInput.addEventListener("change", () => renderLookup(byDate, dateInput.value));
  clearBtn.addEventListener("click", () => {
    dateInput.value = "";
    renderLookup(byDate, "");
  });
}

init();
