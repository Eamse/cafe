import { loginAdmin, getCurrentAdmin } from "../js/auth.js";
import { appPath } from "../js/utils.js";

// 이미 로그인된 관리자가 로그인 페이지에 들어오면 바로 대시보드로.
if (await getCurrentAdmin()) {
  window.location.href = appPath("admin/index.html");
}

function showError(message) {
  const errorEl = document.getElementById("form-error");
  errorEl.textContent = message;
  errorEl.hidden = false;
}

document.getElementById("admin-login-form").addEventListener("submit", async (event) => {
  event.preventDefault();

  const email = document.getElementById("email").value.trim();
  const password = document.getElementById("password").value;

  const submitBtn = event.target.querySelector('button[type="submit"]');
  submitBtn.disabled = true;

  const result = await loginAdmin(email, password);
  if (!result.ok) {
    showError(result.error);
    submitBtn.disabled = false;
    return;
  }

  window.location.href = appPath("admin/index.html");
});
