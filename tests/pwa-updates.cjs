const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');

function target(extra = {}) {
  const listeners = new Map();
  return Object.assign({
    addEventListener(type, handler) {
      if (!listeners.has(type)) listeners.set(type, []);
      listeners.get(type).push(handler);
    },
    async emit(type) {
      for (const handler of listeners.get(type) || []) await handler();
    }
  }, extra);
}

async function scenario({ alreadyInstalling, controlled, alreadyWaiting = false }) {
  const messages = [];
  const worker = target({ state: alreadyWaiting ? 'installed' : 'installing', postMessage: data => messages.push(data) });
  const registration = target({ installing: alreadyInstalling ? worker : null, waiting: alreadyWaiting ? worker : null });
  const serviceWorker = target({
    controller: controlled ? {} : null,
    getRegistration: async () => registration,
    // The browser has already fired updatefound before this promise resolves.
    register: async () => registration,
    ready: Promise.resolve(registration)
  });
  const elements = Object.fromEntries(['status', 'install', 'update'].map(id => ['pwa-' + id, target({ hidden: id !== 'status' })]));
  const window = target();
  const document = target({ documentElement: { classList: { contains: () => false } }, getElementById: id => elements[id] });
  let reloads = 0;
  vm.runInNewContext(fs.readFileSync('pwa.js', 'utf8'), {
    navigator: { serviceWorker, onLine: true }, window, document,
    location: { reload: () => { reloads++; } }, setInterval() {}, console
  });
  await window.emit('load');
  const button = elements['pwa-update'];
  if (!alreadyWaiting) {
    assert.equal(button.hidden, true, 'No prompt before a waiting worker exists');
    if (!alreadyInstalling) {
      registration.installing = worker;
      await registration.emit('updatefound');
    }
    registration.installing = null;
    registration.waiting = worker;
    worker.state = 'installed';
    await worker.emit('statechange');
    assert.equal(button.hidden, true, 'Updates activate without a manual prompt');
  } else {
    assert.equal(button.hidden, true, 'Legacy waiting workers activate automatically');
  }
  if (controlled) {
    assert.equal(reloads, 0, 'Wait for the new controller before reloading');
    assert.deepEqual(messages.map(message => message.type), ['ACTIVATE_UPDATE']);

  }
  registration.waiting = null;
  worker.state = 'activated';
  await worker.emit('statechange');
  await serviceWorker.emit('controllerchange');
  if (controlled) await serviceWorker.emit('controllerchange');
  assert.equal(button.hidden, true, 'Activation leaves no manual update action');
  assert.equal(reloads, controlled ? 1 : 0, 'First installation must not reload; automatic update reloads once');
}
(async () => {
  for (const alreadyInstalling of [true, false]) {
    for (const controlled of [true, false]) await scenario({ alreadyInstalling, controlled });
  }
  await scenario({ alreadyInstalling: false, controlled: true, alreadyWaiting: true });
  console.log('PASS: deterministic already-installing, future updatefound and already-waiting updates; automatic activation, single reload and first-install behavior');
})().catch(error => { console.error(error); process.exit(1); });
