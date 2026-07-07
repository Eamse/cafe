import { getMenus, categories } from "../js/data.js";
import { formatPrice, addToCart } from "../js/utils.js";

function getCategoryName(categoryId) {
  const category = categories.find((c) => c.id === categoryId);
  return category ? category.name : categoryId;
}

function renderMenuDetail() {
  const params = new URLSearchParams(window.location.search);
  const menuId = Number(params.get("id"));
  const menu = getMenus().find((m) => m.id === menuId);
  const container = document.getElementById("menu-detail");

  if (!menu) {
    container.innerHTML = `<p>메뉴를 찾을 수 없습니다.</p>`;
    return;
  }

  container.innerHTML = `
    <div class="detail-card cat-${menu.categoryId}">
      <div class="menu-category">${getCategoryName(menu.categoryId)}</div>
      <h2 class="menu-name">${menu.name}</h2>
      <div class="menu-price">${formatPrice(menu.price)}</div>
      <p class="menu-description">${menu.description}</p>
      ${
        menu.isSoldOut
          ? `<div class="sold-out-badge">품절된 메뉴입니다</div>`
          : `
      <div class="quantity-control">
        <button type="button" id="qty-decrease" aria-label="수량 감소">-</button>
        <span id="qty-value">1</span>
        <button type="button" id="qty-increase" aria-label="수량 증가">+</button>
      </div>
      <button type="button" id="add-to-cart-btn" class="btn-add-cart">장바구니 담기</button>
      `
      }
    </div>
  `;

  if (menu.isSoldOut) return;

  let quantity = 1;
  const qtyValueEl = document.getElementById("qty-value");
  const addBtn = document.getElementById("add-to-cart-btn");

  document.getElementById("qty-decrease").addEventListener("click", () => {
    quantity = Math.max(1, quantity - 1);
    qtyValueEl.textContent = quantity;
  });

  document.getElementById("qty-increase").addEventListener("click", () => {
    quantity += 1;
    qtyValueEl.textContent = quantity;
  });

  addBtn.addEventListener("click", () => {
    addToCart(menu.id, quantity);
    addBtn.textContent = "담았습니다 ✓";
    addBtn.disabled = true;
    setTimeout(() => {
      addBtn.textContent = "장바구니 담기";
      addBtn.disabled = false;
    }, 1200);
  });
}

renderMenuDetail();
