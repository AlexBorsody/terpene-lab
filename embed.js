/* Terpene Lab - embeddable widget.
 *
 * Paste this into a Shopify Custom liquid section:
 *
 *   <div id="terpene-lab"></div>
 *   <script src="https://alexborsody.github.io/terpene-lab/embed.js"
 *           data-target="terpene-lab" data-height="900"></script>
 *
 * Options (data attributes on the script tag):
 *   data-target : id of the div to mount into (default "terpene-lab")
 *   data-height : iframe height in px (default 900)
 *   data-border : "0" to remove the border, anything else keeps it
 */
(function () {
  var s = document.currentScript;
  if (!s) return;
  var targetId = s.getAttribute("data-target") || "terpene-lab";
  var height = s.getAttribute("data-height") || "900";
  var border = s.getAttribute("data-border") !== "0";
  var mount = document.getElementById(targetId);
  if (!mount) return;

  var iframe = document.createElement("iframe");
  iframe.src = "https://alexborsody.github.io/terpene-lab/";
  iframe.style.width = "100%";
  iframe.style.height = /^\d+$/.test(height) ? height + "px" : height;
  iframe.style.border = border ? "1px solid #26334f" : "0";
  iframe.style.borderRadius = "12px";
  iframe.style.display = "block";
  iframe.setAttribute("loading", "lazy");
  iframe.setAttribute("title", "Terpene Lab");
  mount.appendChild(iframe);
})();
