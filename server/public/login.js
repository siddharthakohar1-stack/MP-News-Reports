(function () {
  var form = document.getElementById("loginForm");
  var errorBox = document.getElementById("errorBox");
  var btn = document.getElementById("loginBtn");

  // If already logged in, skip straight to admin panel.
  fetch("/api/auth/me", { credentials: "same-origin" })
    .then(function (r) { return r.ok ? r.json() : null; })
    .then(function (data) {
      if (data && data.user) window.location.href = "admin.html";
    });

  form.addEventListener("submit", function (e) {
    e.preventDefault();
    errorBox.style.display = "none";
    btn.disabled = true;
    btn.textContent = "लॉगिन हो रहा है...";

    fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "same-origin",
      body: JSON.stringify({
        email: document.getElementById("email").value.trim(),
        password: document.getElementById("password").value,
      }),
    })
      .then(function (r) { return r.json().then(function (data) { return { ok: r.ok, data: data }; }); })
      .then(function (res) {
        if (!res.ok) {
          errorBox.textContent = res.data.error || "लॉगिन विफल";
          errorBox.style.display = "block";
          btn.disabled = false;
          btn.textContent = "लॉगिन करें";
          return;
        }
        window.location.href = "admin.html";
      })
      .catch(function () {
        errorBox.textContent = "सर्वर से संपर्क नहीं हो सका";
        errorBox.style.display = "block";
        btn.disabled = false;
        btn.textContent = "लॉगिन करें";
      });
  });
})();
