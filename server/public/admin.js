(function () {
  var state = {
    user: null,
    categories: [],
    cities: [],
    editingArticleId: null,
  };

  var VIEW_TITLES = {
    dashboard: "डैशबोर्ड",
    articles: "आर्टिकल्स",
    "article-form": "आर्टिकल एडिट करें",
    categories: "श्रेणियां",
    cities: "शहर",
    users: "यूज़र्स",
  };

  function api(url, opts) {
    opts = opts || {};
    opts.credentials = "same-origin";
    if (opts.body) {
      opts.headers = Object.assign({ "Content-Type": "application/json" }, opts.headers || {});
    }
    return fetch(url, opts).then(function (r) {
      return r.json().then(function (data) {
        if (!r.ok) throw new Error(data.error || "अनजान त्रुटि");
        return data;
      });
    });
  }

  function toast(msg, isError) {
    var t = document.createElement("div");
    t.className = "toast" + (isError ? " error" : "");
    t.textContent = msg;
    document.body.appendChild(t);
    requestAnimationFrame(function () { t.classList.add("show"); });
    setTimeout(function () {
      t.classList.remove("show");
      setTimeout(function () { t.remove(); }, 300);
    }, 2600);
  }

  function esc(s) {
    return (s || "").replace(/[&<>"']/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c];
    });
  }

  // ===== AUTH GUARD =====
  api("/api/auth/me")
    .then(function (data) {
      state.user = data.user;
      document.getElementById("userName").textContent = state.user.name;
      document.getElementById("userRole").textContent = state.user.roleLabel;
      applyRoleVisibility();
      init();
    })
    .catch(function () {
      window.location.href = "login.html";
    });

  function applyRoleVisibility() {
    document.querySelectorAll("[data-role]").forEach(function (el) {
      var allowed = el.getAttribute("data-role").split(",");
      if (allowed.indexOf(state.user.role) === -1) el.style.display = "none";
    });
    var canPublish = state.user.role === "super_admin" || state.user.role === "editor";
    document.getElementById("publisherFieldsWrap").style.display = canPublish ? "flex" : "none";
    document.getElementById("reporterHint").style.display = canPublish ? "none" : "block";
  }

  // ===== NAV / VIEW SWITCHING =====
  function showView(name) {
    document.querySelectorAll(".view").forEach(function (v) { v.style.display = "none"; });
    document.getElementById("view-" + name).style.display = "block";
    document.getElementById("viewTitle").textContent = VIEW_TITLES[name] || "";
    document.querySelectorAll(".admin-nav a[data-view]").forEach(function (a) {
      a.classList.toggle("active", a.getAttribute("data-view") === name);
    });
    closeSidebarMobile();

    if (name === "dashboard") loadDashboard();
    if (name === "articles") loadArticles();
    if (name === "categories") loadCategories();
    if (name === "cities") loadCitiesView();
    if (name === "users") loadUsers();
  }

  function routeFromHash() {
    var h = (window.location.hash || "#dashboard").replace("#", "");
    if (h.indexOf("edit-") === 0) {
      openArticleForm(h.replace("edit-", ""));
      return;
    }
    if (!VIEW_TITLES[h]) h = "dashboard";
    showView(h);
  }

  window.addEventListener("hashchange", routeFromHash);

  // ===== SIDEBAR MOBILE =====
  var sidebar = document.getElementById("sidebar");
  var overlay = document.getElementById("sidebarOverlay");
  document.getElementById("sidebarToggle").addEventListener("click", function () {
    sidebar.classList.add("open");
    overlay.classList.add("open");
  });
  overlay.addEventListener("click", closeSidebarMobile);
  function closeSidebarMobile() {
    sidebar.classList.remove("open");
    overlay.classList.remove("open");
  }

  // ===== LOGOUT =====
  document.getElementById("logoutBtn").addEventListener("click", function () {
    api("/api/auth/logout", { method: "POST" }).then(function () {
      window.location.href = "login.html";
    });
  });

  // ===== INIT =====
  function init() {
    Promise.all([api("/api/categories"), api("/api/cities")]).then(function (res) {
      state.categories = res[0];
      state.cities = res[1];
      fillCategorySelects();
      fillCitySelects();
      routeFromHash();
    });

    document.getElementById("newArticleBtn").addEventListener("click", function () {
      window.location.hash = "article-form";
      openArticleForm(null);
    });
    document.getElementById("articleCancelBtn").addEventListener("click", function () {
      window.location.hash = "articles";
    });
    document.getElementById("articleForm").addEventListener("submit", onArticleFormSubmit);
    document.getElementById("fImage").addEventListener("input", updateImagePreview);

    document.getElementById("filterCategory").addEventListener("change", loadArticles);
    document.getElementById("filterCity").addEventListener("change", loadArticles);
    document.getElementById("filterStatus").addEventListener("change", loadArticles);

    document.getElementById("categoryForm").addEventListener("submit", onCategoryFormSubmit);
    document.getElementById("cityForm").addEventListener("submit", onCityFormSubmit);
    document.getElementById("userForm").addEventListener("submit", onUserFormSubmit);
  }

  function fillCategorySelects() {
    var opts = state.categories.map(function (c) {
      return '<option value="' + c.id + '">' + esc(c.name) + "</option>";
    }).join("");
    document.getElementById("fCategory").innerHTML = opts;
    document.getElementById("filterCategory").innerHTML =
      '<option value="">सभी श्रेणियां</option>' +
      state.categories.map(function (c) { return '<option value="' + c.slug + '">' + esc(c.name) + "</option>"; }).join("");
  }

  function fillCitySelects() {
    var opts = '<option value="">—</option>' + state.cities.map(function (c) {
      return '<option value="' + c.id + '">' + esc(c.name) + "</option>";
    }).join("");
    document.getElementById("fCity").innerHTML = opts;
    document.getElementById("filterCity").innerHTML =
      '<option value="">सभी शहर</option>' +
      state.cities.map(function (c) { return '<option value="' + c.slug + '">' + esc(c.name) + "</option>"; }).join("");
  }

  // ===== DASHBOARD =====
  function loadDashboard() {
    var calls = [api("/api/articles?all=1")];
    if (state.user.role === "super_admin") calls.push(api("/api/users"));
    Promise.all(calls).then(function (res) {
      var articles = res[0];
      var published = articles.filter(function (a) { return a.is_published; }).length;
      var drafts = articles.length - published;
      var breaking = articles.filter(function (a) { return a.is_breaking; }).length;

      var cards = [
        { icon: "article", val: articles.length, label: "कुल आर्टिकल्स" },
        { icon: "check_circle", val: published, label: "प्रकाशित" },
        { icon: "edit_note", val: drafts, label: "ड्राफ्ट" },
        { icon: "bolt", val: breaking, label: "ब्रेकिंग न्यूज़" },
        { icon: "category", val: state.categories.length, label: "श्रेणियां" },
        { icon: "location_city", val: state.cities.length, label: "शहर" },
      ];
      if (res[1]) cards.push({ icon: "group", val: res[1].length, label: "यूज़र्स" });

      document.getElementById("statGrid").innerHTML = cards.map(function (c) {
        return '<div class="stat-card"><span class="material-symbols-outlined">' + c.icon + "</span>" +
          '<span class="val">' + c.val + '</span><span class="label">' + c.label + "</span></div>";
      }).join("");
    });
  }

  // ===== ARTICLES =====
  function loadArticles() {
    var params = new URLSearchParams();
    params.set("all", "1");
    var cat = document.getElementById("filterCategory").value;
    var city = document.getElementById("filterCity").value;
    var status = document.getElementById("filterStatus").value;
    if (cat) params.set("category", cat);
    if (city) params.set("city", city);

    api("/api/articles?" + params.toString()).then(function (articles) {
      if (status === "published") articles = articles.filter(function (a) { return a.is_published; });
      if (status === "draft") articles = articles.filter(function (a) { return !a.is_published; });

      var tbody = document.getElementById("articlesTableBody");
      document.getElementById("articlesEmpty").style.display = articles.length ? "none" : "block";

      tbody.innerHTML = articles.map(function (a) {
        var canEdit = state.user.role === "super_admin" || state.user.role === "editor" ||
          (a.author && a.author.id === state.user.id);
        var canDelete = state.user.role === "super_admin" || state.user.role === "editor";
        return "<tr>" +
          "<td><span class=\"ttl\">" + esc(a.title) + "</span></td>" +
          "<td>" + (a.category ? esc(a.category.name) : "—") + "</td>" +
          "<td>" + (a.city ? esc(a.city.name) : "—") + "</td>" +
          "<td>" +
            '<span class="status-badge ' + (a.is_published ? "status-published" : "status-draft") + '">' + (a.is_published ? "प्रकाशित" : "ड्राफ्ट") + "</span>" +
            (a.is_breaking ? '<span class="status-badge status-breaking">ब्रेकिंग</span>' : "") +
            (a.is_featured ? '<span class="status-badge status-featured">हीरो</span>' : "") +
          "</td>" +
          "<td>" + (a.author ? esc(a.author.name) : "—") + "</td>" +
          "<td>" + esc(a.time_ago) + "</td>" +
          '<td><div class="row-actions">' +
            (canEdit ? '<button data-edit="' + a.id + '" title="एडिट"><span class="material-symbols-outlined">edit</span></button>' : "") +
            (canDelete ? '<button data-delete="' + a.id + '" class="danger" title="डिलीट"><span class="material-symbols-outlined">delete</span></button>' : "") +
          "</div></td>" +
        "</tr>";
      }).join("");

      tbody.querySelectorAll("[data-edit]").forEach(function (btn) {
        btn.addEventListener("click", function () {
          window.location.hash = "edit-" + btn.getAttribute("data-edit");
        });
      });
      tbody.querySelectorAll("[data-delete]").forEach(function (btn) {
        btn.addEventListener("click", function () {
          if (!confirm("यह आर्टिकल हमेशा के लिए डिलीट करें?")) return;
          api("/api/articles/" + btn.getAttribute("data-delete"), { method: "DELETE" })
            .then(function () { toast("आर्टिकल डिलीट हो गया"); loadArticles(); })
            .catch(function (e) { toast(e.message, true); });
        });
      });
    });
  }

  function updateImagePreview() {
    var url = document.getElementById("fImage").value.trim();
    var wrap = document.getElementById("fImagePreviewWrap");
    var img = document.getElementById("fImagePreview");
    if (url) {
      img.src = url;
      wrap.style.display = "block";
    } else {
      wrap.style.display = "none";
    }
  }

  function openArticleForm(id) {
    showView("article-form");
    state.editingArticleId = id;
    var form = document.getElementById("articleForm");
    form.reset();
    document.getElementById("fImagePreviewWrap").style.display = "none";

    if (!id) {
      document.getElementById("articleFormTitle").textContent = "नया आर्टिकल";
      document.getElementById("articleId").value = "";
      return;
    }
    document.getElementById("articleFormTitle").textContent = "आर्टिकल एडिट करें";
    api("/api/articles/" + id).then(function (a) {
      document.getElementById("articleId").value = a.id;
      document.getElementById("fTitle").value = a.title;
      document.getElementById("fSummary").value = a.summary || "";
      document.getElementById("fBody").value = a.body || "";
      document.getElementById("fCategory").value = a.category ? a.category.id : "";
      document.getElementById("fCity").value = a.city ? a.city.id : "";
      document.getElementById("fImage").value = a.image_url || "";
      document.getElementById("fVideoDuration").value = a.video_duration || "";
      document.getElementById("fPublished").checked = a.is_published;
      document.getElementById("fBreaking").checked = a.is_breaking;
      document.getElementById("fFeatured").checked = a.is_featured;
      updateImagePreview();
    });
  }

  function onArticleFormSubmit(e) {
    e.preventDefault();
    var id = document.getElementById("articleId").value;
    var payload = {
      title: document.getElementById("fTitle").value.trim(),
      summary: document.getElementById("fSummary").value.trim(),
      body: document.getElementById("fBody").value.trim(),
      category_id: document.getElementById("fCategory").value || null,
      city_id: document.getElementById("fCity").value || null,
      image_url: document.getElementById("fImage").value.trim(),
      video_duration: document.getElementById("fVideoDuration").value.trim() || null,
      is_published: document.getElementById("fPublished").checked,
      is_breaking: document.getElementById("fBreaking").checked,
      is_featured: document.getElementById("fFeatured").checked,
    };
    var req = id ? api("/api/articles/" + id, { method: "PUT", body: JSON.stringify(payload) })
                 : api("/api/articles", { method: "POST", body: JSON.stringify(payload) });
    req.then(function () {
      toast("आर्टिकल सेव हो गया");
      window.location.hash = "articles";
    }).catch(function (e2) { toast(e2.message, true); });
  }

  // ===== CATEGORIES =====
  function loadCategories() {
    api("/api/categories").then(function (cats) {
      state.categories = cats;
      fillCategorySelects();
      var canManage = state.user.role === "super_admin" || state.user.role === "editor";
      document.getElementById("categoriesTableBody").innerHTML = cats.map(function (c) {
        return "<tr><td>" + esc(c.name) + "</td><td>" + esc(c.slug) + "</td><td>" +
          (canManage ? '<div class="row-actions"><button data-del-cat="' + c.id + '" class="danger"><span class="material-symbols-outlined">delete</span></button></div>' : "") +
          "</td></tr>";
      }).join("");
      document.querySelectorAll("[data-del-cat]").forEach(function (btn) {
        btn.addEventListener("click", function () {
          if (!confirm("इस श्रेणी को व उसके सभी आर्टिकल्स को डिलीट करें?")) return;
          api("/api/categories/" + btn.getAttribute("data-del-cat"), { method: "DELETE" })
            .then(function () { toast("श्रेणी डिलीट हो गई"); loadCategories(); })
            .catch(function (e) { toast(e.message, true); });
        });
      });
    });
  }

  function onCategoryFormSubmit(e) {
    e.preventDefault();
    var name = document.getElementById("catName").value.trim();
    var slug = document.getElementById("catSlug").value.trim();
    api("/api/categories", { method: "POST", body: JSON.stringify({ name: name, slug: slug }) })
      .then(function () {
        toast("श्रेणी जोड़ी गई");
        document.getElementById("categoryForm").reset();
        loadCategories();
      })
      .catch(function (e2) { toast(e2.message, true); });
  }

  // ===== CITIES =====
  function loadCitiesView() {
    api("/api/cities").then(function (cities) {
      state.cities = cities;
      fillCitySelects();
      var canManage = state.user.role === "super_admin" || state.user.role === "editor";
      document.getElementById("citiesTableBody").innerHTML = cities.map(function (c) {
        return "<tr><td>" + esc(c.name) + "</td><td>" + esc(c.slug) + "</td><td>" +
          (canManage ? '<div class="row-actions"><button data-del-city="' + c.id + '" class="danger"><span class="material-symbols-outlined">delete</span></button></div>' : "") +
          "</td></tr>";
      }).join("");
      document.querySelectorAll("[data-del-city]").forEach(function (btn) {
        btn.addEventListener("click", function () {
          if (!confirm("इस शहर को डिलीट करें?")) return;
          api("/api/cities/" + btn.getAttribute("data-del-city"), { method: "DELETE" })
            .then(function () { toast("शहर डिलीट हो गया"); loadCitiesView(); })
            .catch(function (e) { toast(e.message, true); });
        });
      });
    });
  }

  function onCityFormSubmit(e) {
    e.preventDefault();
    var name = document.getElementById("cityName").value.trim();
    var slug = document.getElementById("citySlug").value.trim();
    api("/api/cities", { method: "POST", body: JSON.stringify({ name: name, slug: slug }) })
      .then(function () {
        toast("शहर जोड़ा गया");
        document.getElementById("cityForm").reset();
        loadCitiesView();
      })
      .catch(function (e2) { toast(e2.message, true); });
  }

  // ===== USERS =====
  var ROLE_LABELS = {
    super_admin: "सुपर एडमिन",
    editor: "एडिटर",
    reporter: "रिपोर्टर",
    video_editor: "वीडियो एडिटर",
    photo_editor: "फोटो एडिटर",
    seo_manager: "SEO मैनेजर",
    ad_manager: "विज्ञापन मैनेजर",
    moderator: "मॉडरेटर",
  };

  function loadUsers() {
    api("/api/users/roles").then(function (roles) {
      document.getElementById("uRole").innerHTML = roles.map(function (r) {
        return '<option value="' + r + '">' + (ROLE_LABELS[r] || r) + "</option>";
      }).join("");
    });
    api("/api/users").then(function (users) {
      document.getElementById("usersTableBody").innerHTML = users.map(function (u) {
        var isSelf = u.id === state.user.id;
        return "<tr><td>" + esc(u.name) + "</td><td>" + esc(u.email) + "</td><td>" + (ROLE_LABELS[u.role] || u.role) + "</td>" +
          '<td><div class="row-actions">' +
          (isSelf ? "" : '<button data-del-user="' + u.id + '" class="danger"><span class="material-symbols-outlined">delete</span></button>') +
          "</div></td></tr>";
      }).join("");
      document.querySelectorAll("[data-del-user]").forEach(function (btn) {
        btn.addEventListener("click", function () {
          if (!confirm("इस यूज़र को डिलीट करें?")) return;
          api("/api/users/" + btn.getAttribute("data-del-user"), { method: "DELETE" })
            .then(function () { toast("यूज़र डिलीट हो गया"); loadUsers(); })
            .catch(function (e) { toast(e.message, true); });
        });
      });
    });
  }

  function onUserFormSubmit(e) {
    e.preventDefault();
    var payload = {
      name: document.getElementById("uName").value.trim(),
      email: document.getElementById("uEmail").value.trim(),
      password: document.getElementById("uPassword").value,
      role: document.getElementById("uRole").value,
    };
    api("/api/users", { method: "POST", body: JSON.stringify(payload) })
      .then(function () {
        toast("यूज़र जोड़ा गया");
        document.getElementById("userForm").reset();
        loadUsers();
      })
      .catch(function (e2) { toast(e2.message, true); });
  }
})();
