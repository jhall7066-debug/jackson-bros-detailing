/* Jackson Bros: cart. Holds one package + any add-ons, then checks out through the
   booking form (no online payment). State lives in localStorage so it follows the
   customer between pages. */
(function () {
  "use strict";
  var KEY = "jackson-bros-cart";
  var BOOK = document.getElementById("booking-form") ? "#booking-form" : "index.html#booking-form";
  var ADDONS = ["Headlight restoration", "Pet hair removal", "Odor removal", "Stain removal", "Seat shampooing", "Full carpet shampooing", "Engine bay cleaning", "Leather conditioning"];
  /* Estimated add-on prices (typical market rates). Change these numbers to update the whole site's cart. */
  var EST = {}; /* No per-item add-on prices published: add-ons run $10–$75 and are quoted. */ /* No per-item add-on prices published: add-ons run $10–$75 and are quoted. */ /* No per-item add-on prices published: add-ons run $10–$75 and are quoted. */ /* No per-item add-on prices published: add-ons run $10–$75 and are quoted. */
  var range = function () { return "Quoted"; };
  var totals = function () { var lo = price(cart.pkg), hi = lo; cart.addons.forEach(function (a) { var r = EST[a] || [0, 0]; lo += r[0]; hi += r[1]; }); return [lo, hi]; };
  var money = function (t) { return t[0] === t[1] ? "$" + t[0] : "$" + t[0] + "–$" + t[1]; };
  var $ = function (s, c) { return (c || document).querySelector(s); };
  var $$ = function (s, c) { return Array.prototype.slice.call((c || document).querySelectorAll(s)); };
  var esc = function (t) { return String(t).replace(/[&<>"]/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]; }); };

  var cart = { pkg: "", addons: [] };
  try { var saved = JSON.parse(localStorage.getItem(KEY)); if (saved) cart = { pkg: saved.pkg || "", addons: saved.addons || [] }; } catch (e) {}

  var price = function (label) { var m = /\$(\d+)/.exec(label || ""); return m ? +m[1] : 0; };
  var name = function (label) { return String(label).replace(/\s*\(\$\d+\)\s*$/, ""); };
  var count = function () { return (cart.pkg ? 1 : 0) + cart.addons.length; };

  /* ---------- Drawer ---------- */
  var icon = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M3 4h2l2.4 11.2a2 2 0 0 0 2 1.6h7.7a2 2 0 0 0 2-1.5L21 8H6"/><circle cx="10" cy="20.5" r="1.3"/><circle cx="17" cy="20.5" r="1.3"/></svg>';
  var drawer = document.createElement("div");
  drawer.className = "cart";
  drawer.setAttribute("role", "dialog");
  drawer.setAttribute("aria-modal", "true");
  drawer.setAttribute("aria-label", "Your cart");
  drawer.innerHTML =
    '<div class="cart-shade"></div><div class="cart-panel">' +
    '<div class="cart-top"><h2>Your cart</h2><button class="cart-close" type="button" aria-label="Close cart">&times;</button></div>' +
    '<ul class="cart-items"></ul><div class="cart-suggest"></div>' +
    '<div class="cart-total"><span>Estimated total</span><b>$0</b></div>' +
    '<p class="cart-note">Add-ons run $10–$75 and are quoted for your vehicle. We\'ll confirm the exact price when we confirm your time. Nothing is charged online, and you pay after the job.</p>' +
    '<div class="cart-actions"><a class="btn btn-led btn-block cart-go" href="' + BOOK + '">Continue to booking</a>' +
    '<button class="btn btn-ghost btn-block cart-keep" type="button">Keep browsing</button></div></div>';
  document.body.appendChild(drawer);

  var lastFocus;
  function openCart() { lastFocus = document.activeElement; render(); drawer.classList.add("open"); document.documentElement.classList.add("cart-open"); $(".cart-close", drawer).focus(); }
  function closeCart() { drawer.classList.remove("open"); document.documentElement.classList.remove("cart-open"); if (lastFocus && lastFocus.focus) lastFocus.focus(); }
  $(".cart-shade", drawer).addEventListener("click", closeCart);
  $(".cart-close", drawer).addEventListener("click", closeCart);
  $(".cart-keep", drawer).addEventListener("click", closeCart);
  $(".cart-go", drawer).addEventListener("click", function () { closeCart(); });
  document.addEventListener("keydown", function (e) { if (e.key === "Escape" && drawer.classList.contains("open")) closeCart(); });

  /* Header cart button (all pages) */
  var headerWrap = $(".site-header .wrap"), menuBtn = $(".menu-btn");
  var hb = document.createElement("button");
  hb.type = "button"; hb.className = "cart-btn"; hb.setAttribute("aria-label", "Open cart");
  hb.innerHTML = icon + '<span class="count"></span>';
  hb.addEventListener("click", openCart);
  if (headerWrap) headerWrap.insertBefore(hb, menuBtn || null);

  /* Mobile action bar: third button becomes the cart once something's in it */
  var abBook = $(".action-bar .ab-book"), abBookHTML = abBook ? abBook.innerHTML : "";
  if (abBook) abBook.addEventListener("click", function (e) { if (count()) { e.preventDefault(); openCart(); } });

  /* ---------- Render ---------- */
  function save() { try { localStorage.setItem(KEY, JSON.stringify(cart)); } catch (e) {} }
  function render() {
    var n = count();
    $(".count", hb).textContent = n ? n : "";
    hb.setAttribute("aria-label", n ? "Open cart, " + n + " item" + (n > 1 ? "s" : "") : "Open cart");
    if (abBook) abBook.innerHTML = n ? icon + " Cart (" + n + ")" : abBookHTML;

    var items = "";
    if (cart.pkg) items += '<li><span class="ci-name">' + esc(name(cart.pkg)) + '<small>Package</small></span><span class="ci-price">$' + price(cart.pkg) + '</span><button class="ci-remove" type="button" data-rm="pkg" aria-label="Remove ' + esc(name(cart.pkg)) + '">&times;</button></li>';
    cart.addons.forEach(function (a) {
      items += '<li><span class="ci-name">' + esc(a) + '<small>Add-on · estimate</small></span><span class="ci-price q">' + range(a) + '</span><button class="ci-remove" type="button" data-rm="' + esc(a) + '" aria-label="Remove ' + esc(a) + '">&times;</button></li>';
    });
    $(".cart-items", drawer).innerHTML = items || '<li class="cart-empty">Your cart is empty. Pick a package to get started.</li>';
    var left = ADDONS.filter(function (a) { return cart.addons.indexOf(a) < 0; });
    $(".cart-suggest", drawer).innerHTML = left.length ? "<h3>Add to your detail</h3><div class=\"chips-row\">" + left.map(function (a) { return '<button type="button" data-add="' + esc(a) + '">+ ' + esc(a) + " · " + range(a) + "</button>"; }).join("") + "</div>" : "";
    $(".cart-total b", drawer).textContent = n ? money(totals()) : "—";
    $(".cart-total span", drawer).textContent = n ? (cart.addons.length ? "Packages total (add-ons quoted)" : "Total") : "Nothing added yet";
    var go = $(".cart-go", drawer);
    go.textContent = cart.pkg ? "Continue to booking" : (n ? "Continue to booking" : "See packages");
    go.setAttribute("href", n ? BOOK : (document.getElementById("packages") ? "#packages" : "services.html#packages"));

    $$("[data-addon]").forEach(function (b) {
      var on = cart.addons.indexOf(b.getAttribute("data-addon")) > -1;
      b.setAttribute("aria-pressed", on ? "true" : "false");
      b.textContent = on ? "Added" : "Add";
    });
    syncForm();
  }

  $(".cart-items", drawer).addEventListener("click", function (e) {
    var b = e.target.closest("[data-rm]"); if (!b) return;
    var v = b.getAttribute("data-rm");
    if (v === "pkg") cart.pkg = ""; else cart.addons = cart.addons.filter(function (a) { return a !== v; });
    save(); render();
  });
  $(".cart-suggest", drawer).addEventListener("click", function (e) {
    var b = e.target.closest("[data-add]"); if (!b) return;
    cart.addons.push(b.getAttribute("data-add")); save(); render();
  });

  /* ---------- Add buttons on the page ---------- */
  $$(".pkg-book").forEach(function (btn) {
    btn.addEventListener("click", function (e) {
      e.preventDefault();
      cart.pkg = btn.getAttribute("data-book") || ""; save(); openCart();
    });
  });
  $$("[data-addon]").forEach(function (b) {
    b.addEventListener("click", function () {
      var a = b.getAttribute("data-addon"), i = cart.addons.indexOf(a);
      if (i > -1) cart.addons.splice(i, 1); else cart.addons.push(a);
      save(); render();
    });
  });

  /* ---------- Booking form is the checkout ---------- */
  var form = document.getElementById("booking-form");
  var syncing = false;
  function syncForm() {
    if (!form) return;
    syncing = true;
    $$('input[name="service"]', form).forEach(function (i) { i.checked = i.value === cart.pkg; });
    if (!cart.pkg) { var none = $('input[name="service"][value=""]', form); if (none) none.checked = true; }
    $$('input[name="addon"]', form).forEach(function (i) { i.checked = cart.addons.indexOf(i.value) > -1; });
    var hid = form.elements.addons; if (hid) hid.value = cart.addons.map(function (a) { return a + " (est. " + range(a) + ")"; }).join(", ");
    var box = $(".form-cart", form);
    if (box) {
      box.hidden = !count();
      if (count()) box.innerHTML = "<b>In your cart</b>" + esc([cart.pkg ? name(cart.pkg) + " ($" + price(cart.pkg) + ")" : ""].concat(cart.addons).filter(Boolean).join(" + ")) + "<br>Package total: " + money(totals()) + '<br><button type="button">Edit cart</button>';
    }
    syncing = false;
  }
  if (form) {
    form.addEventListener("change", function (e) {
      if (syncing) return;
      if (e.target.name === "service") { cart.pkg = e.target.value; save(); render(); }
      if (e.target.name === "addon") {
        cart.addons = $$('input[name="addon"]:checked', form).map(function (i) { return i.value; });
        save(); render();
      }
    });
    form.addEventListener("click", function (e) { if (e.target.closest(".form-cart button")) openCart(); });
  }

  window.LED_CART = { clear: function () { cart = { pkg: "", addons: [] }; save(); } };
  render();
})();
