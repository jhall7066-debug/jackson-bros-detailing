/* Jackson Bros — site interactions (no dependencies) */
(function () {
  "use strict";
  var doc = document.documentElement;
  doc.classList.remove("no-js");
  var $ = function (s, c) { return (c || document).querySelector(s); };
  var $$ = function (s, c) { return Array.prototype.slice.call((c || document).querySelectorAll(s)); };

  /* ---------- Mobile menu ---------- */
  var menuBtn = $(".menu-btn");
  if (menuBtn) {
    var setMenu = function (open) {
      doc.classList.toggle("menu-open", open);
      menuBtn.setAttribute("aria-expanded", open ? "true" : "false");
    };
    menuBtn.addEventListener("click", function () { setMenu(!doc.classList.contains("menu-open")); });
    $$(".menu a").forEach(function (a) { a.addEventListener("click", function () { setMenu(false); }); });
    document.addEventListener("keydown", function (e) { if (e.key === "Escape") setMenu(false); });
  }

  /* ---------- Reveal on scroll ---------- */
  var reveals = $$(".reveal");
  if ("IntersectionObserver" in window) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add("in"); io.unobserve(e.target); } });
    }, { threshold: 0.1, rootMargin: "0px 0px -40px 0px" });
    reveals.forEach(function (el) { io.observe(el); });
  } else {
    reveals.forEach(function (el) { el.classList.add("in"); });
  }

  /* ---------- Before/after sliders ---------- */
  function initBA(s) {
    var r = $("input[type=range]", s);
    if (!r) return;
    var set = function () { s.style.setProperty("--pos", r.value + "%"); };
    r.addEventListener("input", set);
    set();
  }
  $$(".ba").forEach(initBA);

  /* Home page: one slider, chips swap which before/after pair it shows */
  var sw = $(".ba-switch");
  if (sw) {
    var ba = $(sw.getAttribute("data-target"));
    var cap = $(sw.getAttribute("data-caption"));
    $$("button", sw).forEach(function (b) {
      b.addEventListener("click", function () {
        $$("button", sw).forEach(function (x) { x.setAttribute("aria-pressed", x === b ? "true" : "false"); });
        var n = b.getAttribute("data-pair");
        var after = $("img:not(.ba-before)", ba), before = $(".ba-before", ba);
        after.srcset = "assets/img/after-" + n + "-600.webp 600w, assets/img/after-" + n + "-1000.webp 1000w";
        after.src = "assets/after-" + n + ".jpg";
        after.alt = b.getAttribute("data-after-alt");
        before.srcset = "assets/img/before-" + n + "-600.webp 600w, assets/img/before-" + n + "-1000.webp 1000w";
        before.src = "assets/before-" + n + ".jpg";
        before.alt = b.getAttribute("data-before-alt");
        if (cap) cap.textContent = b.getAttribute("data-cap");
        var r = $("input", ba); r.value = 50; ba.style.setProperty("--pos", "50%");
      });
    });
  }

  /* ---------- Packages: option toggles + book buttons ---------- */
  var KEY = "jackson-bros-pkg";
  function pickPackage(label) {
    if (!label) return;
    $$('#booking-form input[name="service"]').forEach(function (i) { i.checked = i.value === label; });
  }
  $$(".pkg").forEach(function (card) {
    var btns = $$(".seg button", card), opts = $$(".opt", card), cta = $(".pkg-book", card);
    function show(key) {
      var active;
      opts.forEach(function (o) { var on = o.getAttribute("data-opt") === key; o.hidden = !on; if (on) active = o; });
      btns.forEach(function (b) { b.setAttribute("aria-pressed", b.getAttribute("data-opt") === key ? "true" : "false"); });
      if (active && cta) {
        cta.setAttribute("data-book", active.getAttribute("data-book"));
        cta.textContent = active.getAttribute("data-cta");
      }
    }
    btns.forEach(function (b) { b.addEventListener("click", function () { show(b.getAttribute("data-opt")); }); });
    if (btns[0]) show(btns[0].getAttribute("data-opt"));
    if (cta) cta.addEventListener("click", function () {
      var v = cta.getAttribute("data-book");
      try { sessionStorage.setItem(KEY, v); } catch (e) {}
      pickPackage(v);
    });
  });
  try { pickPackage(sessionStorage.getItem(KEY)); } catch (e) {}

  /* Swipe dots under the package carousel (phones) */
  var track = $(".pkgs"), dots = $(".dots");
  if (track && dots) {
    var cards = $$(".pkg", track);
    // Visual order on phones puts the featured card first (CSS order:-1)
    cards.sort(function (a, b) { return a.getBoundingClientRect().left - b.getBoundingClientRect().left; });
    dots.innerHTML = cards.map(function () { return "<span></span>"; }).join("");
    var ds = $$("span", dots);
    var mark = function () {
      var mid = track.scrollLeft + track.clientWidth / 2, best = 0, bestD = Infinity;
      cards.forEach(function (c, i) {
        var d = Math.abs(c.offsetLeft + c.offsetWidth / 2 - mid);
        if (d < bestD) { bestD = d; best = i; }
      });
      ds.forEach(function (d, i) { d.classList.toggle("on", i === best); });
    };
    track.addEventListener("scroll", function () { window.requestAnimationFrame(mark); }, { passive: true });
    mark();
  }

  /* ---------- Gallery filters ---------- */
  var filterBtns = $$(".filters button");
  filterBtns.forEach(function (btn) {
    btn.addEventListener("click", function () {
      var f = btn.getAttribute("data-filter");
      filterBtns.forEach(function (b) { b.setAttribute("aria-pressed", b === btn ? "true" : "false"); });
      $$(".gallery .shot").forEach(function (it) { it.hidden = !(f === "all" || it.getAttribute("data-cat") === f); });
    });
  });

  /* ---------- Lightbox with swipe ---------- */
  var lb = $(".lightbox");
  if (lb) {
    var lbImg = $("img", lb), lbCount = $(".lb-count", lb), list = [], idx = 0, lastFocus;
    var visible = function () { return $$("[data-full]").filter(function (el) { return !el.hidden && el.offsetParent !== null; }); };
    var show = function (i) {
      idx = (i + list.length) % list.length;
      var el = list[idx];
      lbImg.src = el.getAttribute("data-full");
      lbImg.alt = ($("img", el) || {}).alt || "";
      if (lbCount) lbCount.textContent = (idx + 1) + " / " + list.length;
    };
    var open = function (el) {
      list = visible(); lastFocus = el;
      show(list.indexOf(el));
      lb.classList.add("open"); doc.style.overflow = "hidden";
      $(".lb-close", lb).focus();
    };
    var close = function () { lb.classList.remove("open"); doc.style.overflow = ""; if (lastFocus) lastFocus.focus(); };
    $$("[data-full]").forEach(function (el) {
      el.setAttribute("tabindex", "0"); el.setAttribute("role", "button");
      el.addEventListener("click", function () { open(el); });
      el.addEventListener("keydown", function (e) { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); open(el); } });
    });
    $(".lb-close", lb).addEventListener("click", close);
    $(".lb-prev", lb).addEventListener("click", function () { show(idx - 1); });
    $(".lb-next", lb).addEventListener("click", function () { show(idx + 1); });
    lb.addEventListener("click", function (e) { if (e.target === lb) close(); });
    document.addEventListener("keydown", function (e) {
      if (!lb.classList.contains("open")) return;
      if (e.key === "Escape") close();
      if (e.key === "ArrowLeft") show(idx - 1);
      if (e.key === "ArrowRight") show(idx + 1);
    });
    var x0 = null;
    lb.addEventListener("touchstart", function (e) { x0 = e.touches[0].clientX; }, { passive: true });
    lb.addEventListener("touchend", function (e) {
      if (x0 === null) return;
      var dx = e.changedTouches[0].clientX - x0; x0 = null;
      if (Math.abs(dx) > 45) show(idx + (dx < 0 ? 1 : -1));
    });
  }

  /* ---------- Mobile action bar: get out of the way of the form & keyboard ---------- */
  var bar = $(".action-bar"), form = $("#booking-form");
  if (bar) {
    var inForm = false, typing = false;
    var update = function () { bar.classList.toggle("hide", inForm || typing); };
    if (form && "IntersectionObserver" in window) {
      new IntersectionObserver(function (en) { inForm = en[0].isIntersecting; update(); }, { threshold: 0.15 }).observe(form);
    }
    document.addEventListener("focusin", function (e) { if (e.target.matches("input, textarea, select")) { typing = true; update(); } });
    document.addEventListener("focusout", function () { typing = false; update(); });
  }

  /* ---------- Form niceties ---------- */
  var d = $('#booking-form input[type="date"]');
  if (d) {
    var t = new Date(); t.setMinutes(t.getMinutes() - t.getTimezoneOffset());
    d.min = t.toISOString().split("T")[0];
  }

  var yr = $("#year");
  if (yr) yr.textContent = new Date().getFullYear();
})();
