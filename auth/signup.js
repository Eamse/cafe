import { signupCustomer } from "../js/auth.js";

function showError(message) {
  const errorEl = document.getElementById("form-error");
  errorEl.textContent = message;
  errorEl.hidden = false;
}

document.getElementById("signup-form").addEventListener("submit", (event) => {
  event.preventDefault();

  const name = document.getElementById("name").value.trim();
  const email = document.getElementById("email").value.trim();
  const phone = document.getElementById("phone").value.trim();
  const password = document.getElementById("password").value;

  if (!name || !email || !phone || !password) {
    showError("모든 항목을 입력해주세요.");
    return;
  }

  const result = signupCustomer({ name, email, phone, password });
  if (!result.ok) {
    showError(result.error);
    return;
  }

  window.location.href = "/index.html";
});
