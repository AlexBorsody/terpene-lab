/* Sunny's Shield Terpene Lab - responsive embed helper */
(function () {
  var s = document.currentScript;
  if (!s) return;
  var targetId = s.getAttribute("data-target") || "sunnys-terpene-lab";
  var mount = document.getElementById(targetId);
  if (!mount) return;
  var legacyOrigin = "https://alexborsody.github.io";
  var labOrigin = "https://lab.sunnysshield.com";
  // New snippets can use the custom domain. Existing Shopify snippets keep
  // working before cutover and after GitHub Pages redirects the old URL.
  var appUrl = legacyOrigin + "/terpene-lab/";
  if (s.src && new URL(s.src, document.baseURI).origin === labOrigin) {
    appUrl = labOrigin + "/";
  }
  var iframe = document.createElement("iframe");
  iframe.src = appUrl + "?embed=1";
  iframe.style.width = "100%";
  iframe.style.height = "1000px";
  iframe.style.border = "0";
  iframe.style.display = "block";
  iframe.style.background = "#0b1220";
  iframe.setAttribute("loading", "lazy");
  iframe.setAttribute("title", "Sunny's Shield Terpene Lab");
  mount.appendChild(iframe);
  window.addEventListener("message", function (event) {
    if (event.origin !== legacyOrigin && event.origin !== labOrigin) return;
    if (event.source !== iframe.contentWindow) return;
    var d = event.data;
    if (!d || d.type !== "sunnys-terpene-lab:height") return;
    var h = Number(d.height);
    if (!Number.isFinite(h) || h < 400 || h > 20000) return;
    iframe.style.height = Math.ceil(h) + "px";
  });
})();

