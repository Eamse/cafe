import { signupCustomer } from "../js/auth.js";
import { appPath } from "../js/utils.js";

function showError(message) {
  const errorEl = document.getElementById("form-error");
  errorEl.textContent = message;
  errorEl.hidden = false;
}

document.getElementById("signup-form").addEventListener("submit", async (event) => {
  event.preventDefault();

  const name = document.getElementById("name").value.trim();
  const email = document.getElementById("email").value.trim();
  const phone = document.getElementById("phone").value.trim();
  const password = document.getElementById("password").value;

  if (!name || !email || !phone || !password) {
    showError("모든 항목을 입력해주세요.");
    return;
  }

  const submitBtn = event.target.querySelector('button[type="submit"]');
  submitBtn.disabled = true;

  const result = await signupCustomer({ name, email, phone, password });
  if (!result.ok) {
    showError(result.error);
    submitBtn.disabled = false;
    return;
  }

  if (result.needsEmailConfirm) {
    window.location.href = `${appPath("auth/login.html")}?confirm=1`;
    return;
  }

  window.location.href = appPath("index.html");
});
