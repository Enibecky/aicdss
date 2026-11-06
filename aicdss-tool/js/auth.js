// Login and registration page
(async function () {
  "use strict";
  const { api, renderAppHeader, demoNotice, hydrateIcons, param } = window.App;

  // Always ask for the email and password on this page: if someone is
  // still logged in from an earlier visit, log them out first.
  if (await api.getUser()) await api.signOut();
  await renderAppHeader();
  const next = param("next") || "dashboard.html";

  document.getElementById("demo-slot").innerHTML = demoNotice();
  hydrateIcons();

  const form = document.getElementById("auth-panel");
  const email = document.getElementById("email");
  const password = document.getElementById("password");
  const submit = document.getElementById("auth-submit");
  const message = document.getElementById("auth-message");
  const tabs = document.querySelectorAll(".tab");
  let mode = param("mode") === "register" ? "register" : "login";

  function setMode(newMode) {
    mode = newMode;
    tabs.forEach(function (t) {
      const on = t.getAttribute("data-mode") === mode;
      t.setAttribute("aria-selected", on ? "true" : "false");
      t.tabIndex = on ? 0 : -1;
      if (on) form.setAttribute("aria-labelledby", t.id);
    });
    const register = mode === "register";
    document.getElementById("auth-title").textContent = register ? "Create your account" : "Welcome back";
    document.getElementById("auth-intro").textContent = register
      ? "Register to start assessing AI-CDSS in your institution."
      : "Log in to continue your assessments.";
    document.getElementById("password-hint").hidden = !register;
    password.setAttribute("autocomplete", register ? "new-password" : "current-password");
    submit.textContent = register ? "Create account" : "Log in";
    message.textContent = "";
    message.className = "form-message";
  }

  tabs.forEach(function (t) {
    t.addEventListener("click", function () { setMode(t.getAttribute("data-mode")); });
    t.addEventListener("keydown", function (e) {
      if (e.key === "ArrowRight" || e.key === "ArrowLeft") {
        const other = mode === "login" ? "register" : "login";
        setMode(other);
        document.querySelector('.tab[data-mode="' + other + '"]').focus();
      }
    });
  });
  setMode(mode);

  function validate() {
    let ok = true;
    const emailOk = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.value.trim());
    document.getElementById("f-email").classList.toggle("invalid", !emailOk);
    email.setAttribute("aria-invalid", emailOk ? "false" : "true");
    if (!emailOk) ok = false;
    const pwOk = password.value.length >= 6;
    document.getElementById("f-password").classList.toggle("invalid", !pwOk);
    password.setAttribute("aria-invalid", pwOk ? "false" : "true");
    if (!pwOk) ok = false;
    return ok;
  }

  email.addEventListener("blur", function () { if (email.value) validate(); });

  form.addEventListener("submit", async function (e) {
    e.preventDefault();
    message.textContent = "";
    if (!validate()) {
      (document.querySelector(".field.invalid input") || email).focus();
      return;
    }
    submit.disabled = true;
    const label = submit.textContent;
    submit.textContent = mode === "register" ? "Creating account…" : "Logging in…";
    try {
      if (mode === "register") {
        const result = await api.signUp(email.value.trim(), password.value);
        if (result.needsConfirmation) {
          message.className = "form-message success";
          message.textContent = "Account created. Check your email for a confirmation link, then log in.";
          setTimeout(function () { setMode("login"); }, 50);
          return;
        }
      } else {
        await api.signIn(email.value.trim(), password.value);
      }
      window.location.href = next;
    } catch (err) {
      message.className = "form-message error";
      message.textContent = err.message;
    } finally {
      submit.disabled = false;
      submit.textContent = label;
    }
  });
})();
