import { loginCustomer } from "../js/auth.js";

function showError(message) {
  const errorEl = document.getElementById("form-error");
  errorEl.textContent = message;
  errorEl.hidden = false;
}

document.getElementById("login-form").addEventListener("submit", (event) => {
  event.preventDefault();

  const email = document.getElementById("email").value.trim();
  const password = document.getElementById("password").value;

  const result = loginCustomer(email, password);
  if (!result.ok) {
    showError(result.error);
    return;
  }

  const params = new URLSearchParams(window.location.search);
  window.location.href = params.get("redirect") || "/index.html";
});
