# Embedding Terpene Lab in Shopify

The tool is hosted on GitHub Pages: `https://alexborsody.github.io/terpene-lab/`
No build step, no server. Pushing to the repo redeploys it automatically.

## Option A: JS widget (recommended, one paste)

In Shopify admin: Online Store > Themes > Customize, add a **Custom liquid**
section on the page you want (e.g. a new "Terpene Lab" page), and paste:

```html
<div id="terpene-lab"></div>
<script src="https://alexborsody.github.io/terpene-lab/embed.js"
        data-target="terpene-lab" data-height="900"></script>
```

Options on the script tag:

- `data-target`: id of the div to mount into (default `terpene-lab`).
- `data-height`: iframe height in px (default `900`).
- `data-border`: set to `0` to remove the border.

## Option B: plain iframe

Same Custom liquid section, no script:

```html
<div style="max-width:1100px;margin:0 auto;">
  <iframe src="https://alexborsody.github.io/terpene-lab/"
          style="width:100%;height:900px;border:1px solid #26334f;border-radius:12px;"
          loading="lazy" title="Terpene Lab"></iframe>
</div>
```

## Option C: theme assets (no iframe, same domain)

1. Upload `styles.css`, `app.js`, `data.js`, `embed.js` content under
   Online Store > Themes > Edit code > Assets.
2. Create a `page.terpene-lab.json` template with a Custom liquid section
   that inlines the body markup from `index.html` and references the assets.

More manual than A/B, but same-domain. Only worth it if the store blocks
third-party iframes.

## Notes

- ECharts loads from jsDelivr CDN. If the store blocks third-party scripts,
  self-host `echarts.min.js` and change the script tag in `index.html`.
- The app is responsive and touch-friendly; on mobile the views stack.
- Content updates: edit `data.js`, push, done. No theme edits needed for A/B.
