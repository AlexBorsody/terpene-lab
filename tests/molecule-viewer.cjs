const fs = require('node:fs');
const vm = require('node:vm');
const assert = require('node:assert/strict');
const { createThreeStub } = require('./molecule-viewer-fixture.cjs');
const source = fs.readFileSync('app.js', 'utf8');
// Run the unchanged production viewer functions, not a test reimplementation.
const viewerSource = source.slice(source.indexOf('const moleculeViewers ='), source.indexOf('\nfunction showCompound('));
const renderSource = source.slice(source.indexOf('function renderCompounds()'), source.indexOf('\ndocument.getElementById("compound-search").addEventListener'));
const compound = { id: 'limonene', name: 'Limonene', formula: 'C10H16', chemicalClass: 'Monoterpene' };
function element() {
  const listeners = new Map();
  return {
    style: {}, attributes: {}, children: [], dataset: {}, isConnected: true, clientWidth: 130, clientHeight: 163,
    setAttribute(name, value) { this.attributes[name] = value; },
    addEventListener(type, fn) { listeners.set(type, fn); },
    removeEventListener(type) { listeners.delete(type); },
    dispatch(type) { listeners.get(type)?.({ preventDefault() {}, stopPropagation() {} }); },
    setPointerCapture() {},
    remove() { this.isConnected = false; if (this.parent) this.parent.children = this.parent.children.filter(child => child !== this); },
    prepend(child) { child.parent = this; this.children.unshift(child); },
    querySelector() { return this.status; }, querySelectorAll() { return []; }, listeners
  };
}
function harness(mode = 'success', { noThree = false, noObservers = false } = {}) {
  const hosts = [], frames = new Map(), observers = [], elements = new Map();
  let frameId = 0;
  const stub = createThreeStub(element, mode);
  class Observer {
    constructor(callback, options) { this.callback = callback; this.options = options; observers.push(this); }
    observe(host) { this.host = host; }
    disconnect() { this.disconnected = true; }
    fire(intersecting = true) { this.callback([{ isIntersecting: intersecting, target: this.host }]); }
  }
  const window = { devicePixelRatio: 2, ...(!noThree && { THREE: stub.THREE }), ...(!noObservers && { IntersectionObserver: Observer, ResizeObserver: Observer }) };
  const context = vm.createContext({
    window, ...(!noObservers && { IntersectionObserver: Observer, ResizeObserver: Observer }),
    compoundById: { limonene: compound },
    document: { querySelectorAll: () => hosts, getElementById: id => { if (!elements.has(id)) elements.set(id, { ...element(), value: '' }); return elements.get(id); } },
    requestAnimationFrame: callback => { frames.set(++frameId, callback); return frameId; },
    cancelAnimationFrame: id => frames.delete(id),
    D: { compounds: [compound, { ...compound, id: 'hidden', showModel: false }] },
    CHEMISTRY: { matches: () => true, matchesCategory: () => true, tags: () => [] },
    oilsWithCompound: () => [], studiesForCompound: () => [], esc: value => String(value), formatFormula: value => value
  });
  vm.runInContext(viewerSource + '\n' + renderSource, context);
  const run = code => vm.runInContext(code, context);
  const host = () => { const h = element(); h.dataset.moleculeId = 'limonene'; h.status = { textContent: 'Loading illustration' }; hosts.push(h); return h; };
  const init = h => { context.host = h; return run('initMolecule3D(host)'); };
  const tick = () => { const callbacks = [...frames.values()]; frames.clear(); callbacks.forEach(callback => callback()); };
  return { ...stub, context, run, host, init, frames, observers, elements, tick };
}
function assertUnavailable(h, env) {
  assert.equal(h.dataset.ready, 'unavailable');
  assert.equal(h.status.textContent, '3D illustration unavailable');
  assert.match(h.attributes['aria-label'], /3D illustration of/);
  assert.doesNotMatch(h.attributes['aria-label'], /drag/i);
  assert.equal(h.children.length, 0);
  assert.equal(env.frames.size, 0);
  assert.equal(env.run('moleculeViewers.size'), 0);
}
function assertDisposed(env) {
  assert.ok(env.stats.resources.every(resource => resource.disposals === 1), 'Every owned geometry/material is disposed exactly once');
  assert.ok(env.observers.every(observer => observer.disconnected));
  assert.ok(env.stats.canvases.every(canvas => canvas.listeners.size === 0));
}
(async () => {
  let env = harness(), host = env.host();
  await Promise.all([env.init(host), env.init(host)]);
  assert.equal(env.stats.constructors, 1, 'Concurrent initialization is deduplicated');
  assert.equal(env.stats.renders, 1);
  assert.equal(host.dataset.ready, '1');
  assert.equal(host.status.textContent, 'Drag to rotate');
  assert.match(host.attributes['aria-label'], /3D illustration of/);
  assert.equal(host.children[0].attributes['aria-hidden'], 'true');
  host.isConnected = false; env.tick();
  assert.equal(env.frames.size, 0);
  assert.equal(env.stats.rendererDisposals, 1); assertDisposed(env);

  for (const mode of ['constructor-failure', 'init-failure', 'render-failure']) {
    env = harness(mode); host = env.host(); await env.init(host);
    assertUnavailable(host, env);
    assert.equal(env.stats.rendererDisposals, mode === 'constructor-failure' ? 0 : 1); assertDisposed(env);
    await env.init(host); assert.equal(env.stats.constructors, 1, 'A failed host does not retry forever');
  }
  // With no import callback, the real dynamic import rejects locally in node:vm.
  // No request can be made to the CDN. The browser suite separately aborts it.
  env = harness('success', { noThree: true }); host = env.host();
  assert.equal(await env.run('loadThree()'), null);
  await env.init(host); assertUnavailable(host, env);

  env = harness(); host = env.host(); host.isConnected = false;
  await env.init(host); assert.equal(env.stats.constructors, 0); assert.equal(env.run('moleculeViewers.size'), 0);
  host = env.host(); env.run('loadThree = () => new Promise(resolve => { globalThis.finishLoad = resolve; })');
  const pending = env.init(host); host.isConnected = false;
  env.run('finishLoad(window.THREE)'); await pending;
  assert.equal(env.stats.constructors, 0); assert.equal(env.run('moleculeViewers.size'), 0);
  assert.equal(host.dataset.ready, undefined);

  env = harness(); host = env.host(); await env.init(host);
  env.stats.failRender = true; env.tick(); assertUnavailable(host, env); assertDisposed(env);
  env = harness(); host = env.host(); await env.init(host);
  env.stats.failResize = true; env.observers.find(observer => !observer.options).fire();
  assertUnavailable(host, env); assertDisposed(env);
  env = harness(); host = env.host(); await env.init(host);
  host.children[0].dispatch('webglcontextlost'); assertUnavailable(host, env); assertDisposed(env);

  // A same-ID replacement must survive cleanup of the detached older host.
  env = harness(); const old = env.host(); await env.init(old);
  host = env.host(); await env.init(host); old.isConnected = false; env.tick();
  assert.equal(env.run('moleculeViewers.size'), 1); assert.equal(host.dataset.ready, '1');
  env.run('disposeMoleculeViewers()'); assert.equal(env.stats.rendererDisposals, 2); assertDisposed(env);

  env = harness(); host = env.host(); env.run('initVisibleMolecules(); initVisibleMolecules()');
  assert.equal(env.observers.length, 1, 'Lazy observers are deduplicated');
  env.run('renderCompounds()'); assert.equal(env.observers[0].disconnected, true);
  const html = env.elements.get('compound-grid').innerHTML;
  assert.equal((html.match(/class="molecule3d"/g) || []).length, 1, 'showModel=false stays respected');
  assert.doesNotMatch(html, /aria-describedby="molecule-note-/);

  assert.doesNotMatch(html, /molecule-note-hidden/);
  assert.doesNotMatch(html, /molecule-disclaimer|Not a validated molecular structure/);
  assert.doesNotMatch(html, /drag to rotate|Interactive 3D model/i, 'Loading markup does not promise a working or validated model');

  env = harness('success', { noObservers: true }); host = env.host(); env.run('initVisibleMolecules()');
  await Promise.resolve(); await Promise.resolve();
  assert.equal(host.dataset.ready, '1'); env.run('disposeMoleculeViewers()'); assertDisposed(env);
  console.log('PASS: illustrative viewer rendering, dependency/WebGL/init/render/resize/context-loss failures, duplicate and detached hosts, and resource cleanup');
})().catch(error => { console.error(error); process.exitCode = 1; });
