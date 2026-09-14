// Mobile drawer
(function () {
  var drawer = document.getElementById("drawer");
  var overlay = document.getElementById("drawerOverlay");
  var openBtn = document.getElementById("drawerToggle");
  var closeBtn = document.getElementById("drawerClose");
  var bottomMenuBtn = document.getElementById("bottomMenuBtn");

  function openDrawer() {
    drawer.classList.add("open");
    overlay.classList.add("open");
  }
  function closeDrawer() {
    drawer.classList.remove("open");
    overlay.classList.remove("open");
  }

  if (openBtn) openBtn.addEventListener("click", openDrawer);
  if (closeBtn) closeBtn.addEventListener("click", closeDrawer);
  if (overlay) overlay.addEventListener("click", closeDrawer);
  if (bottomMenuBtn) bottomMenuBtn.addEventListener("click", function (e) {
    e.preventDefault();
    openDrawer();
  });
  drawer.querySelectorAll("a").forEach(function (a) {
    a.addEventListener("click", closeDrawer);
  });
})();

// Mobile search bar toggle
(function () {
  var toggle = document.getElementById("mobileSearchToggle");
  var bar = document.getElementById("mobileSearchBar");
  if (!toggle || !bar) return;
  toggle.addEventListener("click", function () {
    bar.style.display = bar.style.display === "none" ? "block" : "none";
    if (bar.style.display === "block") bar.querySelector("input").focus();
  });
})();

// Bottom nav active state
(function () {
  var navLinks = document.querySelectorAll(".bottom-nav a[href^='#']");
  navLinks.forEach(function (link) {
    link.addEventListener("click", function () {
      navLinks.forEach(function (l) { l.classList.remove("active"); });
      link.classList.add("active");
    });
  });
})();

// ===================== LIVE CMS DATA =====================
(function () {
  function esc(s) {
    return (s || "").replace(/[&<>"']/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c];
    });
  }

  function fetchJSON(url) {
    return fetch(url).then(function (r) { return r.json(); });
  }

  function chipStyle(category) {
    if (!category) return "";
    var v = category.color_var || "--blue";
    return 'style="background:color-mix(in srgb, var(' + v + ') 12%, white);color:var(' + v + ')"';
  }

  function feedItemHTML(a) {
    var chip = a.category ? '<span class="cat-chip" ' + chipStyle(a.category) + '>' + esc(a.category.name) + "</span>" : "";
    return (
      '<article class="feed-item">' +
      '<div class="flex-1">' + chip +
      "<h3>" + esc(a.title) + "</h3>" +
      '<div class="meta"><span>' + esc(a.time_ago) + "</span></div>" +
      "</div>" +
      '<div class="thumb"><img src="' + esc(a.image_url) + '" alt="" loading="lazy">' +
      (a.video_duration ? '<span class="play-pill"><span class="material-symbols-outlined">play_arrow</span>' + esc(a.video_duration) + "</span>" : "") +
      "</div>" +
      "</article>"
    );
  }

  function storyCardHTML(a) {
    var chip = a.category ? '<span class="cat-chip" ' + chipStyle(a.category) + '>' + esc(a.category.name) + "</span>" : "";
    return (
      '<div class="card story-card">' +
      '<div class="thumb"><img src="' + esc(a.image_url) + '" alt="" loading="lazy">' +
      (a.video_duration ? '<span class="play-pill"><span class="material-symbols-outlined">play_arrow</span>' + esc(a.video_duration) + "</span>" : "") +
      "</div>" +
      '<div class="body">' + chip +
      "<h3>" + esc(a.title) + "</h3>" +
      '<div class="meta" style="margin-top:6px"><span>' + esc(a.time_ago) + "</span></div>" +
      "</div></div>"
    );
  }

  // ---- Breaking ticker ----
  function loadTicker() {
    fetchJSON("/api/articles?breaking=1&limit=8").then(function (list) {
      var track = document.getElementById("tickerTrack");
      if (!track) return;
      if (!list.length) {
        track.innerHTML = '<span class="ticker-item">फिलहाल कोई ब्रेकिंग न्यूज़ नहीं</span>';
        return;
      }
      var items = list.map(function (a) {
        return '<span class="ticker-item"><span class="ticker-time">' + esc(a.time_ago) + "</span>" + esc(a.title) + "</span>";
      }).join("");
      track.innerHTML = items + items; // duplicate for seamless scroll
    });
  }

  // ---- Top headlines rail ----
  function loadTopHeadlines() {
    fetchJSON("/api/articles?limit=5").then(function (list) {
      var el = document.getElementById("topHeadlinesFeed");
      if (!el) return;
      el.innerHTML = list.map(feedItemHTML).join("");
    });
  }

  // ---- Hero featured article ----
  function loadHero() {
    fetchJSON("/api/articles?featured=1&limit=1").then(function (list) {
      var card = document.getElementById("heroCard");
      if (!card) return;
      if (!list.length) return; // keep hidden if no featured article set
      var a = list[0];
      document.getElementById("heroImg").src = a.image_url;
      document.getElementById("heroCatBadge").textContent = a.category ? a.category.name : "एक्सक्लूसिव";
      document.getElementById("heroTitle").innerHTML = '<span class="lead">आज का एक्सप्लेनर:</span> ' + esc(a.title);
      document.getElementById("heroSummary").textContent = a.summary || "";
      document.getElementById("heroTime").textContent = a.time_ago;
      var durPill = document.getElementById("heroDurPill");
      if (a.video_duration) {
        document.getElementById("heroDurVal").textContent = a.video_duration;
        durPill.style.display = "flex";
      } else {
        durPill.style.display = "none";
      }
      card.style.display = "block";
    });
  }

  // ---- Category grids ----
  function loadGrid(elId, categorySlugs, limitEach) {
    var el = document.getElementById(elId);
    if (!el) return;
    var slugs = Array.isArray(categorySlugs) ? categorySlugs : [categorySlugs];
    Promise.all(
      slugs.map(function (slug) {
        return fetchJSON("/api/articles?category=" + encodeURIComponent(slug) + "&limit=" + limitEach);
      })
    ).then(function (results) {
      var merged = [].concat.apply([], results);
      if (!merged.length) {
        el.closest(".wide-section").style.display = "none";
        return;
      }
      el.innerHTML = merged.map(storyCardHTML).join("");
    });
  }

  // ---- City tabs + panels ----
  function loadCityTabs() {
    var tabsEl = document.getElementById("cityTabs");
    var panelsEl = document.getElementById("cityPanels");
    if (!tabsEl || !panelsEl) return;

    fetchJSON("/api/cities").then(function (cities) {
      if (!cities.length) return;
      Promise.all(
        cities.map(function (c) {
          return fetchJSON("/api/articles?city=" + encodeURIComponent(c.slug) + "&limit=4");
        })
      ).then(function (results) {
        tabsEl.innerHTML = cities.map(function (c, i) {
          return '<button class="city-tab' + (i === 0 ? " active" : "") + '" data-city="' + c.slug + '">' + esc(c.name) + "</button>";
        }).join("");

        panelsEl.innerHTML = cities.map(function (c, i) {
          var articles = results[i];
          var body = articles.length
            ? articles.map(feedItemHTML).join("")
            : '<p style="padding:16px 0;color:var(--subtle);font-size:13px">इस शहर में अभी कोई खबर प्रकाशित नहीं हुई</p>';
          return '<div class="city-panel' + (i === 0 ? " active" : "") + '" data-panel="' + c.slug + '">' + body + "</div>";
        }).join("");

        var tabs = tabsEl.querySelectorAll(".city-tab");
        var panels = panelsEl.querySelectorAll(".city-panel");
        tabs.forEach(function (tab) {
          tab.addEventListener("click", function () {
            tabs.forEach(function (t) { t.classList.remove("active"); });
            panels.forEach(function (p) { p.classList.remove("active"); });
            tab.classList.add("active");
            panelsEl.querySelector('.city-panel[data-panel="' + tab.dataset.city + '"]').classList.add("active");
          });
        });
      });
    });
  }

  loadTicker();
  loadTopHeadlines();
  loadHero();
  loadCityTabs();
  loadGrid("grid-national", ["national", "world"], 2);
  loadGrid("grid-sports", "sports", 4);
  loadGrid("grid-business", "business", 4);
  loadGrid("grid-entertainment", "entertainment", 4);
  loadGrid("grid-jobs", "jobs", 4);
  loadGrid("grid-lifestyle", ["lifestyle", "astrology", "opinion"], 2);
})();
