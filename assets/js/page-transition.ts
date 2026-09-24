import {
  Color,
  InstancedBufferAttribute,
  InstancedMesh,
  Matrix4,
  OrthographicCamera,
  PlaneGeometry,
  Scene,
  ShaderMaterial,
  Vector2,
  WebGLRenderer,
} from 'three';

// A band of tiles that passes diagonally across the screen when a link starts
// a visit: each tile grows and shrinks again as the band reaches it, the
// leading edge in the accent and the body in the surface colour.
//
// It is decoration on top of navigation, never part of it. The band never
// covers the whole page and nothing waits for it: Turbo fetches and renders
// exactly as it would without it, and the new page simply appears under the
// band wherever it happens to be. Back and forward, reduced motion, forced
// colours and missing WebGL all get no band at all. The canvas lives outside
// <body>, so Turbo's body swap leaves it alone and one context serves every
// visit.

const DURATION_MS = 560;
const TILE = 64;

const vertexShader = /* glsl */ `
  attribute vec2 aCell;
  attribute float aDelay;
  uniform vec2 uGrid;
  uniform vec2 uSize;
  uniform float uProgress;
  varying float vGrow;
  varying float vLead;

  void main() {
    // Each tile's own moment in the pass, 0 to 1.
    float t = clamp((uProgress * 1.6 - aDelay) / 0.6, 0.0, 1.0);
    float grow = sin(t * 3.14159265);
    vec2 cell = uSize / uGrid;
    vec2 centre = (aCell + 0.5) * cell - uSize * 0.5;
    vec3 p = position * vec3(cell * grow * 0.92, 1.0);
    p.xy += centre;
    vGrow = grow;
    vLead = 1.0 - smoothstep(0.0, 0.45, t);
    gl_Position = projectionMatrix * modelViewMatrix * vec4(p, 1.0);
  }
`;

const fragmentShader = /* glsl */ `
  uniform vec3 uSurface;
  uniform vec3 uAccent;
  varying float vGrow;
  varying float vLead;

  void main() {
    if (vGrow <= 0.001) discard;
    gl_FragColor = vec4(mix(uSurface, uAccent, vLead), 1.0);
    #include <colorspace_fragment>
  }
`;

export function startPageTransitions(): void {
  const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');
  const forcedColors = matchMedia('(forced-colors: active)');
  // Nothing is set up, and no context is taken, for someone who has asked for
  // less motion. If they change the setting later, it is set up then.
  if (reducedMotion.matches || forcedColors.matches) {
    const later = () => {
      if (reducedMotion.matches || forcedColors.matches) return;
      reducedMotion.removeEventListener('change', later);
      setUp();
    };
    reducedMotion.addEventListener('change', later);
    return;
  }
  setUp();

  function setUp(): void {
    const canvas = document.createElement('canvas');
    canvas.setAttribute('aria-hidden', 'true');
    canvas.dataset.pageTransition = '';
    canvas.style.cssText =
      'position:fixed;inset:0;width:100vw;height:100vh;z-index:90;pointer-events:none;visibility:hidden';

    let renderer: WebGLRenderer;
    try {
      renderer = new WebGLRenderer({
        canvas,
        alpha: true,
        antialias: false,
        powerPreference: 'low-power',
      });
    } catch {
      return;
    }
    document.documentElement.append(canvas);

    const scene = new Scene();
    const camera = new OrthographicCamera(-1, 1, 1, -1, 0.1, 10);
    camera.position.z = 5;
    const geometry = new PlaneGeometry(1, 1);
    const uniforms = {
      uGrid: { value: new Vector2(1, 1) },
      uSize: { value: new Vector2(1, 1) },
      uProgress: { value: 0 },
      uSurface: { value: new Color() },
      uAccent: { value: new Color() },
    };
    const material = new ShaderMaterial({
      uniforms,
      vertexShader,
      fragmentShader,
    });
    const MAX = 60 * 40;
    const tiles = new InstancedMesh(geometry, material, MAX);
    tiles.frustumCulled = false;
    const cells = new InstancedBufferAttribute(new Float32Array(MAX * 2), 2);
    const delays = new InstancedBufferAttribute(new Float32Array(MAX), 1);
    geometry.setAttribute('aCell', cells);
    geometry.setAttribute('aDelay', delays);
    const identity = new Matrix4();
    for (let i = 0; i < MAX; i++) tiles.setMatrixAt(i, identity);
    scene.add(tiles);

    let lost = false;
    let frame: number | null = null;

    canvas.addEventListener('webglcontextlost', (event) => {
      event.preventDefault();
      lost = true;
      stop();
    });
    canvas.addEventListener('webglcontextrestored', () => (lost = false));

    function layout(): void {
      const width = innerWidth;
      const height = innerHeight;
      renderer.setPixelRatio(1);
      renderer.setSize(width, height, false);
      camera.left = -width / 2;
      camera.right = width / 2;
      camera.top = height / 2;
      camera.bottom = -height / 2;
      camera.updateProjectionMatrix();
      const columns = Math.min(60, Math.ceil(width / TILE));
      const rows = Math.min(40, Math.ceil(height / TILE));
      uniforms.uGrid.value.set(columns, rows);
      uniforms.uSize.value.set(width, height);
      let i = 0;
      for (let row = 0; row < rows; row++) {
        for (let column = 0; column < columns; column++) {
          cells.setXY(i, column, row);
          // From the bottom-left corner to the top right, a little ragged.
          const noise = Math.sin(column * 12.9898 + row * 78.233) * 43758.5453;
          delays.setX(
            i,
            (column / columns + row / rows) / 2 +
              (noise - Math.floor(noise)) * 0.1,
          );
          i++;
        }
      }
      tiles.count = i;
      cells.needsUpdate = true;
      delays.needsUpdate = true;
    }

    // Read at the start of each pass, so the band always matches the theme.
    function readColors(): void {
      const style = getComputedStyle(document.documentElement);
      uniforms.uSurface.value.set(
        style.getPropertyValue('--color-surface').trim() || '#eaeaec',
      );
      uniforms.uAccent.value.set(
        style.getPropertyValue('--color-accent').trim() || '#b93a1e',
      );
    }

    function stop(): void {
      if (frame !== null) cancelAnimationFrame(frame);
      frame = null;
      canvas.style.visibility = 'hidden';
    }

    function play(): void {
      if (lost || reducedMotion.matches || forcedColors.matches) return;
      stop();
      layout();
      readColors();
      canvas.style.visibility = 'visible';
      const start = performance.now();
      const tick = (now: number) => {
        const progress = Math.min(1, (now - start) / DURATION_MS);
        uniforms.uProgress.value = progress;
        renderer.render(scene, camera);
        if (progress < 1) frame = requestAnimationFrame(tick);
        else stop();
      };
      frame = requestAnimationFrame(tick);
    }

    document.addEventListener('turbo:visit', (event) => {
      const { action } = (event as CustomEvent<{ action: string }>).detail;
      // Back and forward are repeated, rapid moves: they stay instant, and
      // clear any band still on screen.
      if (action === 'restore') stop();
      else play();
    });
    reducedMotion.addEventListener('change', () => {
      if (reducedMotion.matches) stop();
    });
  }
}
