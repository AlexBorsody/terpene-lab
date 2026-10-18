// Controlled Three surface for lifecycle tests. No GPU or external dependency.
function createThreeStub(makeCanvas, mode = 'success') {
  const stats = { constructors: 0, renders: 0, rendererDisposals: 0, resources: [], canvases: [] };
  class Vector3 {
    constructor(x = 0, y = 0, z = 0) { this.set(x, y, z); }
    set(x, y, z) { Object.assign(this, { x, y, z }); return this; }
    copy(p) { return this.set(p.x, p.y, p.z); }
    clone() { return new Vector3(this.x, this.y, this.z); }
    add(p) { this.x += p.x; this.y += p.y; this.z += p.z; return this; }
    sub(p) { this.x -= p.x; this.y -= p.y; this.z -= p.z; return this; }
    multiplyScalar(n) { this.x *= n; this.y *= n; this.z *= n; return this; }
    distanceTo(p) { return Math.hypot(this.x - p.x, this.y - p.y, this.z - p.z); }
    normalize() { return this.multiplyScalar(1 / (Math.hypot(this.x, this.y, this.z) || 1)); }
  }
  class Object3D {
    constructor() { this.position = new Vector3(); this.rotation = new Vector3(); this.quaternion = { setFromUnitVectors() {} }; this.children = []; }
    add(child) { this.children.push(child); }
    updateProjectionMatrix() {}
  }
  class Resource {
    constructor() { this.disposals = 0; stats.resources.push(this); }
    dispose() { this.disposals++; }
  }
  class WebGLRenderer {
    constructor() {
      stats.constructors++;
      if (mode === 'constructor-failure') throw new Error('WebGL disabled');
      this.domElement = makeCanvas(); stats.canvases.push(this.domElement);
    }
    setPixelRatio() { if (mode === 'init-failure') throw new Error('Renderer initialization failed'); }
    setSize() { if (stats.failResize) throw new Error('Resize failed'); }
    render() {
      stats.renders++;
      if (mode === 'render-failure' || stats.failRender) throw new Error('Render failed');
      // Browser success checks still draw pixels, without relying on WebGL.
      const ctx = this.domElement.getContext?.('2d');
      if (ctx) { ctx.fillStyle = '#72b89a'; ctx.beginPath(); ctx.arc(150, 65, 18, 0, Math.PI * 2); ctx.fill(); }
    }
    dispose() { stats.rendererDisposals++; }
  }
  return {
    stats,
    THREE: { Scene: Object3D, PerspectiveCamera: Object3D, AmbientLight: Object3D, DirectionalLight: Object3D,
      Group: Object3D, Mesh: Object3D, SphereGeometry: Resource, CylinderGeometry: Resource,
      MeshStandardMaterial: Resource, Vector3, WebGLRenderer }
  };
}
module.exports = { createThreeStub };
