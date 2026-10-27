/* Jackson Bros: booking form → CRM (Firebase), with a backup copy in Netlify Forms.
   Each request is sent to both places. If either one succeeds, the customer goes to
   thank-you.html. If both fail, they see a message with the phone number instead. */
(function () {
  "use strict";
  var form = document.getElementById("booking-form");
  if (!form) return;

  var SDK = "https://www.gstatic.com/firebasejs/10.12.2/";
  var cfg = window.LED_FIREBASE;
  var crmReady = !!(cfg && cfg.apiKey && cfg.apiKey.indexOf("PASTE") !== 0);
  var db = null;

  function val(name, max) {
    var el = form.elements[name];
    return String(el ? el.value : "").trim().slice(0, max);
  }
  function withTimeout(p, ms) {
    return Promise.race([p, new Promise(function (_, reject) {
      setTimeout(function () { reject(new Error("timed out")); }, ms);
    })]);
  }

  function saveToCrm() {
    return Promise.all([import(SDK + "firebase-app.js"), import(SDK + "firebase-firestore.js")])
      .then(function (m) {
        var fbApp = m[0], fs = m[1];
        if (!db) db = fs.getFirestore(fbApp.getApps().length ? fbApp.getApp() : fbApp.initializeApp(cfg));
        return fs.addDoc(fs.collection(db, "leads"), {
          name: val("name", 100),
          phone: val("phone", 30),
          email: val("email", 120),
          vehicle: val("vehicle", 100),
          size: val("size", 60),
          service: val("service", 80),
          date: val("date", 20),
          location: val("location", 200),
          // Add-ons ride in the message so the existing Firestore rules accept the lead unchanged.
          message: ((val("addons", 400) ? "Add-ons: " + val("addons", 400) + "\n" : "") + val("message", 2000)).slice(0, 2000),
          status: "new",
          notes: "",
          source: "website",
          createdAt: fs.serverTimestamp()
        });
      });
  }

  function saveToNetlify() {
    if (location.protocol === "file:") return Promise.reject(new Error("Netlify Forms only works on the live site"));
    return fetch("/", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams(new FormData(form)).toString()
    }).then(function (r) { if (!r.ok) throw new Error("Netlify Forms returned " + r.status); });
  }

  function showError() {
    var box = form.querySelector(".form-error");
    if (!box) {
      box = document.createElement("p");
      box.className = "form-error";
      box.style.cssText = "color:#f07a7a;font-weight:600;margin:12px 0 0";
      form.querySelector("button[type=submit]").insertAdjacentElement("afterend", box);
    }
    box.innerHTML = 'Sorry, that didn\'t go through. Please try again or call/text <a href="tel:5133415374" style="text-decoration:underline">(513) 341-5374</a>.';
  }

  form.addEventListener("submit", function (e) {
    e.preventDefault();
    // Honeypot: bots fill the hidden "company" field. Pretend it worked and save nothing.
    if (form.elements.company && form.elements.company.value) { location.href = "thank-you.html"; return; }

    var btn = form.querySelector("button[type=submit]");
    var label = btn.textContent;
    btn.disabled = true;
    btn.textContent = "Sending…";

    var jobs = [withTimeout(saveToNetlify(), 12000)];
    if (crmReady) jobs.push(withTimeout(saveToCrm(), 12000));

    Promise.allSettled(jobs).then(function (results) {
      results.forEach(function (r) { if (r.status === "rejected") console.warn("[booking form]", r.reason); });
      if (results.some(function (r) { return r.status === "fulfilled"; })) {
        try { sessionStorage.removeItem("jackson-bros-pkg"); localStorage.removeItem("jackson-bros-cart"); } catch (err) {}
        location.href = "thank-you.html";
      } else {
        btn.disabled = false;
        btn.textContent = label;
        showError();
      }
    });
  });
})();
