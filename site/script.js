// City tabs
(function(){
  var tabs = document.querySelectorAll('.city-tab');
  var panels = document.querySelectorAll('.city-panel');
  tabs.forEach(function(tab){
    tab.addEventListener('click', function(){
      tabs.forEach(function(t){ t.classList.remove('active'); });
      panels.forEach(function(p){ p.classList.remove('active'); });
      tab.classList.add('active');
      var target = document.querySelector('.city-panel[data-panel="' + tab.dataset.city + '"]');
      if(target) target.classList.add('active');
    });
  });
})();

// Mobile drawer
(function(){
  var drawer = document.getElementById('drawer');
  var overlay = document.getElementById('drawerOverlay');
  var openBtn = document.getElementById('drawerToggle');
  var closeBtn = document.getElementById('drawerClose');
  var bottomMenuBtn = document.getElementById('bottomMenuBtn');

  function openDrawer(){
    drawer.classList.add('open');
    overlay.classList.add('open');
  }
  function closeDrawer(){
    drawer.classList.remove('open');
    overlay.classList.remove('open');
  }

  if(openBtn) openBtn.addEventListener('click', openDrawer);
  if(closeBtn) closeBtn.addEventListener('click', closeDrawer);
  if(overlay) overlay.addEventListener('click', closeDrawer);
  if(bottomMenuBtn) bottomMenuBtn.addEventListener('click', function(e){
    e.preventDefault();
    openDrawer();
  });
  drawer.querySelectorAll('a').forEach(function(a){
    a.addEventListener('click', closeDrawer);
  });
})();

// Mobile search bar toggle
(function(){
  var toggle = document.getElementById('mobileSearchToggle');
  var bar = document.getElementById('mobileSearchBar');
  if(!toggle || !bar) return;
  toggle.addEventListener('click', function(){
    bar.style.display = bar.style.display === 'none' ? 'block' : 'none';
    if(bar.style.display === 'block') bar.querySelector('input').focus();
  });
})();

// Bottom nav active state on scroll-based hash change
(function(){
  var navLinks = document.querySelectorAll('.bottom-nav a[href^="#"]');
  navLinks.forEach(function(link){
    link.addEventListener('click', function(){
      navLinks.forEach(function(l){ l.classList.remove('active'); });
      link.classList.add('active');
    });
  });
})();
