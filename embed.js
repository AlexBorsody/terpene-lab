/* Sunny's Shield Terpene Lab - Shopify/static embed helper.
 *
 * Shopify Custom liquid:
 * <div id="sunnys-terpene-lab"></div>
 * <script src="https://alexborsody.github.io/terpene-lab/embed.js"
 *         data-target="sunnys-terpene-lab"></script>
 *
 * The iframe reports its content height to this parent script so the lab feels
 * like part of the page instead of a fixed-height box.
 */
(function () {
  var s = document.currentScript;
  if (!s) return;
  var targetId = s.getAttribute("data-target") || "sunnys-terpene-lab";
  var border = s.getAttribute("data-border") === "1";
  var mount = document.getElementById(targetId);
  if (!mount) return;

  var iframe = document.createElement("iframe");
  iframe.src = "https://alexborsody.github.io/terpene-lab/?embed=1";
  iframe.style.width = "100%";
  iframe.style.height = "1000px";
  iframe.style.border = border ? "1px solid #26334f" : "0";
  iframe.style.borderRadius = border ? "12px" : "0";
  iframe.style.display = "block";
  iframe.style.background = "#0b1220";
  iframe.setAttribute("loading", "lazy");
  iframe.setAttribute("title", "Sunny's Shield Terpene Lab");
  iframe.setAttribute("scrolling", "no");
  mount.appendChild(iframe);

  window.addEventListener("message", function (event) {
    if (event.origin !== "https://alexborsody.github.io") return;
    if (event.source !== iframe.contentWindow) return;
    var d = event.data;
    if (!d || d.type !== "sunnys-terpene-lab:height") return;
    var h = Number(d.height);
    if (!Number.isFinite(h) || h < 400 || h > 20000) return;
    iframe.style.height = Math.ceil(h) + "px";
  });
})();
