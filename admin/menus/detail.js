import { categories, getMenus, saveMenus } from "../../js/data.js";
import { formatPrice } from "../../js/utils.js";

function getCategoryName(categoryId) {
  const category = categories.find((c) => c.id === categoryId);
  return category ? category.name : categoryId;
}

function renderDetail() {
  const params = new URLSearchParams(window.location.search);
  const menuId = Number(params.get("id"));
  const menus = getMenus();
  const menu = menus.find((m) => m.id === menuId);
  const container = document.getElementById("menu-detail");

  if (!menu) {
    container.innerHTML = `<p class="empty-state">메뉴를 찾을 수 없습니다.</p>`;
    return;
  }

  container.innerHTML = `
    <div class="detail-card glass-card cat-${menu.categoryId}">
      <div class="menu-category">${getCategoryName(menu.categoryId)}</div>
      <h2 class="menu-name">${menu.name}</h2>
      <div class="menu-price">${formatPrice(menu.price)}</div>
      <div class="menu-status ${menu.isSoldOut ? "is-soldout" : ""}">${menu.isSoldOut ? "품절" : "판매중"}</div>
      <p class="menu-description">${menu.description}</p>
      <div class="detail-actions">
        <a class="btn btn-primary" href="edit.html?id=${menu.id}">수정하기</a>
        <button class="btn btn-delete" id="delete-btn">삭제하기</button>
      </div>
    </div>
  `;

  document.getElementById("delete-btn").addEventListener("click", () => {
    if (!confirm("이 메뉴를 삭제하시겠습니까?")) return;
    saveMenus(menus.filter((m) => m.id !== menuId));
    window.location.href = "list.html";
  });
}

renderDetail();
