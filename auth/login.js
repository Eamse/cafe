import { loginCustomer } from "../js/auth.js";
import { appPath } from "../js/utils.js";

function showError(message) {
  const errorEl = document.getElementById("form-error");
  errorEl.textContent = message;
  errorEl.hidden = false;
}

if (new URLSearchParams(window.location.search).get("confirm") === "1") {
  showError("가입 확인 이메일을 보냈어요. 메일함에서 인증 후 로그인해주세요.");
}

document.getElementById("login-form").addEventListener("submit", async (event) => {
  event.preventDefault();

  const email = document.getElementById("email").value.trim();
  const password = document.getElementById("password").value;

  const submitBtn = event.target.querySelector('button[type="submit"]');
  submitBtn.disabled = true;

  const result = await loginCustomer(email, password);
  if (!result.ok) {
    showError(result.error);
    submitBtn.disabled = false;
    return;
  }

  const params = new URLSearchParams(window.location.search);
  const redirect = params.get("redirect");
  window.location.href = redirect ? decodeURIComponent(redirect) : appPath("index.html");
});
