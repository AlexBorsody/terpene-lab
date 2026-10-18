#!/usr/bin/env python3
"""Stamp a complete, integrity-checked offline release. Run after asset edits."""
import hashlib, json, pathlib, re
root = pathlib.Path(__file__).resolve().parent.parent
# Fresh HTTP-cache URLs also protect first visits before a worker controls them.
html_path = root / 'index.html'
html = html_path.read_text()
for name in ['styles.css', 'app.js', 'chemistry.js', 'research.js', 'data.js', 'pwa.js', 'blend-engine.js', 'blend-builder.js', 'blend-builder.css']:
    digest = hashlib.sha256((root / name).read_bytes()).hexdigest()[:16]
    html = re.sub(re.escape(name) + r'\?v=[a-zA-Z0-9]+', name + '?v=' + digest, html)
html_path.write_text(html)
files = ['index.html', 'styles.css', 'app.js', 'chemistry.js', 'research.js', 'data.js', 'pwa.js', 'blend-engine.js', 'blend-builder.js', 'blend-builder.css',
         'master-data.json', 'manifest.webmanifest', 'shield-icon.svg', 'vendor/echarts-5.5.1.min.js']
files += sorted(str(p.relative_to(root)) for p in (root / 'icons').glob('*.png'))
entries = {name: hashlib.sha256((root / name).read_bytes()).hexdigest() for name in files}
version = hashlib.sha256(json.dumps(entries, sort_keys=True).encode()).hexdigest()[:16]
worker = root / 'sw.js'
source = worker.read_text()
source = re.sub(r'const RELEASE = .*?;', 'const RELEASE = ' + json.dumps(version) + ';', source, count=1)
source = re.sub(r'const ASSETS = .*?;', 'const ASSETS = ' + json.dumps(entries, indent=2) + ';', source, count=1, flags=re.S)
worker.write_text(source)
print('PWA release:', version)
