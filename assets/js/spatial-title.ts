import {
  Scene,
  PerspectiveCamera,
  WebGLRenderer,
  Mesh,
  PlaneGeometry,
  ShaderMaterial,
  Vector2,
  Vector4,
  Color,
  CanvasTexture,
  LinearFilter,
  Points,
  BufferGeometry,
  Float32BufferAttribute,
} from 'three';
import type { SpatialField } from './spatial-field';
import { createLiquidType } from './liquid-type';
import { createFishShadows, fishShadowShader } from './fish-shadows';

let fishPaused = false;
function syncFishControl(): void {
  const button =
    document.querySelector<HTMLButtonElement>('[data-fish-toggle]');
  if (!button) return;
  button.hidden = !document.querySelector('[data-spatial-ready="true"]');
  button.textContent = fishPaused ? 'Resume fish' : 'Pause fish';
}

// The reference's physical lettering and water response become part of the
// actual blue panels. Native text remains the semantic and fallback content.
function mountPanel(
  host: HTMLElement,
  field: SpatialField,
  seed: number,
): () => void {
  const title = host.querySelector<HTMLElement>(
    '.hero-title, .archive-title, .case-title, .article-title, .footer-top > a',
  );
  if (!title) return () => {};
  let renderer: WebGLRenderer;
  try {
    renderer = new WebGLRenderer({
      alpha: true,
      antialias: true,
      powerPreference: 'low-power',
    });
  } catch {
    return () => {};
  }
  const events = new AbortController();
  const finePointer = matchMedia('(hover: hover) and (pointer: fine)');
  const scene = new Scene();
  const camera = new PerspectiveCamera(35, 1, 0.1, 5000);
  const waveButton = host.classList.contains('hero')
    ? document.querySelector<HTMLButtonElement>('[data-wave-trigger]')
    : null;
  const liquid =
    waveButton && renderer.extensions.has('EXT_color_buffer_float')
      ? createLiquidType(renderer)
      : undefined;
  if (liquid) {
    scene.add(liquid.letters);
    liquid.clear();
  }
  let waveActive = false;
  let dragging = false;
  let fluidEnergy = 0;
  const lastDrag = new Vector2(-10, -10);
  const dragPosition = new Vector2();
  const dragForce = new Vector2();
  const oldTouchAction = host.style.touchAction;
  const help = document.querySelector<HTMLElement>('[data-wave-help]');
  let pixelRatio = Math.min(devicePixelRatio, 2);
  renderer.setPixelRatio(pixelRatio);
  renderer.setClearColor(0x2449ef, 1);
  renderer.domElement.className = host.classList.contains('hero')
    ? 'spatial-surface hero-surface absolute inset-0 z-1 h-full w-full pointer-events-none rounded-[inherit] forced-colors:hidden'
    : host.classList.contains('archive-hero')
      ? 'spatial-surface archive-surface absolute inset-0 z-1 h-full w-full pointer-events-none rounded-[inherit] forced-colors:hidden'
      : host.classList.contains('case-hero')
        ? 'spatial-surface case-surface absolute inset-0 z-1 h-full w-full pointer-events-none rounded-[inherit] forced-colors:hidden'
        : host.classList.contains('article-hero')
          ? 'spatial-surface article-surface absolute inset-0 z-1 h-full w-full pointer-events-none rounded-[inherit] forced-colors:hidden'
          : 'spatial-surface footer-surface absolute inset-0 z-1 h-full w-full pointer-events-none rounded-[inherit] forced-colors:hidden';
  renderer.domElement.setAttribute('aria-hidden', 'true');
  const ripples = Array.from(
    { length: 6 },
    () => new Vector4(0.5, 0.5, 100, 0),
  );
  const fish = createFishShadows(seed);
  const waterUniforms = {
    ...fish.uniforms,
    blue: { value: new Color(0x2449ef) },
    aspect: { value: 1 },
    clock: { value: 0 },
    ripples: { value: ripples },
    flow: liquid?.output || { value: null },
    flowActive: { value: 0 },
  };
  const waterMaterial = new ShaderMaterial({
    uniforms: waterUniforms,
    vertexShader: `varying vec2 waterUV; void main() { waterUV = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }`,
    fragmentShader: `
      uniform vec3 blue;
      uniform float aspect;
      uniform float clock;
      uniform vec4 ripples[6];
      uniform sampler2D flow;
      uniform float flowActive;
      varying vec2 waterUV;
      ${fishShadowShader}
      void main() {
        vec2 inkFlow = flowActive > .5 ? texture2D(flow,waterUV).ba : vec2(0.);
        vec2 p = (waterUV - inkFlow) * vec2(aspect, 1.0) * 5.0;
        float interference = sin(p.x * 1.8 + sin(p.y * 1.65 + clock)) + sin(p.y * 2.1 + sin(p.x * 1.4 - clock * .7));
        float caustic = pow(max(0.0, 1.0 - abs(sin(interference * 1.5))), 14.0);
        float wave = 0.0;
        for (int i = 0; i < 6; i++) {
          vec4 r = ripples[i];
          float distanceToRipple = length((waterUV - r.xy) * vec2(aspect, 1.0));
          float ring = exp(-pow((distanceToRipple - r.z * .2) * 24.0, 2.0));
          wave += ring * sin(distanceToRipple * 65.0 - r.z * 10.0) * exp(-r.z * 2.4) * r.w;
        }
        vec3 color = blue * (.97 + caustic * .035) + vec3(.03, .065, .1) * (caustic * .13 + wave * .7 + length(inkFlow)*3.);
        color *= 1.0 - fishShadows((waterUV - inkFlow * .12) * vec2(aspect, 1.0));
        gl_FragColor = vec4(max(color, vec3(0.0)), 1.0);
        #include <colorspace_fragment>
      }
    `,
  });
  const waterGeometry = new PlaneGeometry(1, 1);
  const water = new Mesh(waterGeometry, waterMaterial);
  water.position.z = -2;
  scene.add(water);
  // Display titles keep continuous, antialiased letterforms at rest.
  // Only the area being disturbed gives way to particles.
  let titleTexture: CanvasTexture | undefined;
  const sharpUniforms = {
    mask: { value: null as CanvasTexture | null },
    panel: { value: new Vector2(1, 1) },
    pointer: { value: new Vector2(-10000, -10000) },
    energy: { value: 0 },
    radius: { value: 100 },
  };
  const sharpMaterial = new ShaderMaterial({
    uniforms: sharpUniforms,
    transparent: true,
    depthWrite: false,
    vertexShader: `varying vec2 titleUV; void main() { titleUV = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }`,
    fragmentShader: `
      uniform sampler2D mask;
      uniform vec2 panel;
      uniform vec2 pointer;
      uniform float energy;
      uniform float radius;
      varying vec2 titleUV;
      void main() {
        float distanceToPointer = length((titleUV - .5) * panel - pointer);
        float force = pow(max(0., 1. - distanceToPointer / radius), 2.) * energy;
        float breakup = smoothstep(.03, .22, force);
        float alpha = texture2D(mask, titleUV).a * (1. - breakup);
        if (alpha < .005) discard;
        gl_FragColor = vec4(1., 1., 1., alpha);
        #include <colorspace_fragment>
      }
    `,
  });
  const sharpGeometry = new PlaneGeometry(1, 1);
  const sharpLetters = new Mesh(sharpGeometry, sharpMaterial);
  sharpLetters.position.z = -0.1;
  sharpLetters.visible = false;
  scene.add(sharpLetters);
  const pointGeometry = new BufferGeometry();
  const pointUniforms = {
    size: { value: 5 },
    ratio: { value: pixelRatio },
    distance: { value: 1000 },
  };
  const pointMaterial = new ShaderMaterial({
    uniforms: pointUniforms,
    transparent: true,
    depthWrite: false,
    vertexShader: `
      uniform float size;
      uniform float ratio;
      uniform float distance;
      attribute float charge;
      varying float roundness;
      void main() {
        roundness = min(1.0, charge * 2.0);
        vec4 point = modelViewMatrix * vec4(position, 1.0);
        gl_Position = projectionMatrix * point;
        gl_PointSize = size * ratio * distance / max(1.0, -point.z);
      }
    `,
    fragmentShader: `
      varying float roundness;
      void main() {
        vec2 p = gl_PointCoord * 2.0 - 1.0;
        float square = max(abs(p.x), abs(p.y));
        float circle = length(p);
        float shape = mix(square, circle, .16 + roundness * .84);
        float alpha = 1.0 - smoothstep(.86, 1.0, shape);
        alpha *= smoothstep(.06, .44, roundness);
        if (alpha < .02) discard;
        vec3 normal = normalize(vec3(p.x, -p.y, sqrt(max(.05, 1.0 - dot(p,p)))));
        float light = .8 + .2 * max(dot(normal, normalize(vec3(-.5, .65, 1.0))), 0.0);
        vec3 color = mix(vec3(.94, .96, 1.0), vec3(.7, .8, 1.0) * light, roundness * .65);
        gl_FragColor = vec4(color, alpha);
        #include <colorspace_fragment>
      }
    `,
  });
  const letters = new Points(pointGeometry, pointMaterial);
  letters.frustumCulled = false;
  scene.add(letters);
  let origins = new Float32Array();
  let positions: Float32Array = new Float32Array();
  let velocities = new Float32Array();
  let charges: Float32Array = new Float32Array();
  let ready = false;
  let visible = true;
  let dirty = true;
  let particleType = true;
  let energy = 0;
  let waterClock = 0;
  let lastFishFrame = -Infinity;
  let rippleIndex = 0;
  let lastRipple = -100;
  let lastInteraction = 0;
  const previousPointer = new Vector2(-10000, -10000);
  function stopWaves() {
    waveActive = false;
    dragging = false;
    fluidEnergy = 0;
    liquid?.clear();
    if (liquid) liquid.letters.visible = false;
    letters.visible = particleType;
    sharpLetters.visible = particleType;
    title!.classList.toggle('is-spatial', particleType);
    waterUniforms.flowActive.value = 0;
    delete host.dataset.waveActive;
    host.style.touchAction = oldTouchAction;
    host.classList.remove('cursor-crosshair');
    if (waveButton) {
      waveButton.setAttribute('aria-pressed', 'false');
      waveButton.querySelector('[data-wave-label]')!.textContent = 'Make waves';
    }
    if (help)
      help.innerHTML =
        '<span class="invisible" aria-hidden="true">Drag across the headline. Press Escape or choose Stop waves to finish.</span><span class="sr-only">Turn on Make waves, then drag across the headline. Press Escape to stop.</span>';
    dirty = true;
    field.request();
  }
  if (liquid && waveButton) {
    waveButton.addEventListener(
      'click',
      () => {
        if (waveActive) {
          stopWaves();
          return;
        }
        waveActive = true;
        liquid.clear();
        liquid.letters.visible = true;
        letters.visible = false;
        sharpLetters.visible = false;
        title!.classList.add('is-spatial');
        host.dataset.waveActive = 'true';
        host.style.touchAction = 'none';
        host.classList.add('cursor-crosshair');
        waterUniforms.flowActive.value = 1;
        waveButton.setAttribute('aria-pressed', 'true');
        waveButton.querySelector('[data-wave-label]')!.textContent =
          'Stop waves';
        if (help)
          help.textContent =
            'Drag across the headline. Press Escape or choose Stop waves to finish.';
        dirty = true;
        field.request();
      },
      { signal: events.signal },
    );
    host.addEventListener(
      'pointerdown',
      (event) => {
        if (
          !waveActive ||
          (event.target as Element).closest('a,button,summary')
        )
          return;
        dragging = true;
        const bounds = host.getBoundingClientRect();
        lastDrag.set(
          (event.clientX - bounds.left) / bounds.width,
          1 - (event.clientY - bounds.top) / bounds.height,
        );
        host.setPointerCapture(event.pointerId);
      },
      { signal: events.signal },
    );
    const release = () => {
      dragging = false;
      field.request();
    };
    window.addEventListener('pointerup', release, { signal: events.signal });
    host.addEventListener('pointercancel', release, { signal: events.signal });
    host.addEventListener('lostpointercapture', release, {
      signal: events.signal,
    });
    document.addEventListener(
      'keydown',
      (event) => {
        if (event.key === 'Escape' && waveActive) {
          stopWaves();
          waveButton.focus({ preventScroll: true });
        }
      },
      { signal: events.signal },
    );
    window.addEventListener('blur', release, { signal: events.signal });
  }
  function print(
    element: HTMLElement,
    text: string,
    rect: DOMRect,
    bounds: DOMRect,
    context: CanvasRenderingContext2D,
  ) {
    const style = getComputedStyle(element);
    context.font = `${style.fontWeight} ${style.fontSize} ${style.fontFamily}`;
    context.letterSpacing = style.letterSpacing;
    context.wordSpacing = style.wordSpacing;
    context.fillStyle = '#fff';
    const metrics = context.measureText(text);
    const ascent =
      metrics.fontBoundingBoxAscent ?? metrics.actualBoundingBoxAscent;
    const descent =
      metrics.fontBoundingBoxDescent ?? metrics.actualBoundingBoxDescent;
    // Match the DOM's measured advance, including browser text zoom and the
    // platform's font shaping. The canvas must never invent a wider line.
    context.save();
    context.translate(rect.left - bounds.left, rect.top - bounds.top);
    context.scale(metrics.width > 0 ? rect.width / metrics.width : 1, 1);
    context.fillText(text, 0, (rect.height - ascent - descent) / 2 + ascent);
    context.restore();
  }
  function rasterTitle(bounds: DOMRect, context: CanvasRenderingContext2D) {
    // A text node can occupy several lines after zoom or text-spacing changes.
    // Discover its real line boxes instead of painting one long string at the
    // union of those boxes (which clipped the footer and oversized headings).
    const walker = document.createTreeWalker(title!, NodeFilter.SHOW_TEXT);
    const range = document.createRange();
    let node: Node | null;
    while ((node = walker.nextNode())) {
      const text = node.textContent || '';
      if (!text.trim()) continue;
      const element = node.parentElement!;
      let lineStart = -1;
      let lineEnd = 0;
      let lineTop = 0;
      const flush = () => {
        if (lineStart < 0) return;
        const content = text.slice(lineStart, lineEnd).trimEnd();
        if (!content) return;
        range.setStart(node!, lineStart);
        range.setEnd(node!, lineStart + content.length);
        print(element, content, range.getBoundingClientRect(), bounds, context);
      };
      let offset = 0;
      for (const character of text) {
        range.setStart(node, offset);
        range.setEnd(node, offset + character.length);
        const rect = range.getBoundingClientRect();
        if (rect.width && rect.height) {
          if (lineStart >= 0 && Math.abs(rect.top - lineTop) > 1) {
            flush();
            lineStart = -1;
          }
          if (lineStart < 0 && character.trim()) {
            lineStart = offset;
            lineTop = rect.top;
          }
          lineEnd = offset + character.length;
        }
        offset += character.length;
      }
      flush();
    }
  }
  function layout() {
    if (!ready || events.signal.aborted) return;
    const bounds = host.getBoundingClientRect();
    if (!bounds.width || !bounds.height) return;
    pixelRatio = Math.min(devicePixelRatio, 2);
    renderer.setPixelRatio(pixelRatio);
    pointUniforms.ratio.value = pixelRatio;
    camera.aspect = bounds.width / bounds.height;
    camera.position.z = bounds.height / (2 * Math.tan((35 * Math.PI) / 360));
    camera.updateProjectionMatrix();
    renderer.setSize(bounds.width, bounds.height, false);
    water.scale.set(bounds.width + 4, bounds.height + 4, 1);
    waterUniforms.aspect.value = camera.aspect;
    fish.update(0, bounds.width, bounds.height);
    pointUniforms.distance.value = camera.position.z;
    particleType = bounds.width >= 600;
    letters.visible = particleType && !waveActive;
    sharpLetters.visible = particleType && !waveActive;
    sharpLetters.scale.set(bounds.width, bounds.height, 1);
    sharpUniforms.panel.value.set(bounds.width, bounds.height);
    if (particleType || liquid) {
      const raster = document.createElement('canvas');
      const density = pixelRatio;
      raster.width = Math.ceil(bounds.width * density);
      raster.height = Math.ceil(bounds.height * density);
      const context = raster.getContext('2d', { willReadFrequently: true })!;
      context.scale(density, density);
      rasterTitle(bounds, context);
      titleTexture?.dispose();
      titleTexture = new CanvasTexture(raster);
      titleTexture.generateMipmaps = false;
      titleTexture.minFilter = LinearFilter;
      sharpUniforms.mask.value = titleTexture;
      const mask = context.getImageData(0, 0, raster.width, raster.height).data;
      liquid?.raster(raster, bounds.width, bounds.height);
      const cell = Math.max(
        1.5,
        Math.min(3, parseFloat(getComputedStyle(title!).fontSize) * 0.025),
      );
      const points: number[] = [];
      for (let y = cell / 2; y < bounds.height; y += cell) {
        for (let x = cell / 2; x < bounds.width; x += cell) {
          const index =
            (Math.floor(y * density) * raster.width + Math.floor(x * density)) *
            4;
          if (mask[index + 3] > 130)
            points.push(x - bounds.width / 2, bounds.height / 2 - y, 0);
        }
      }
      origins = new Float32Array(points);
      positions = new Float32Array(points);
      velocities = new Float32Array(points.length);
      charges = new Float32Array(points.length / 3);
      pointGeometry.setAttribute(
        'position',
        new Float32BufferAttribute(positions, 3),
      );
      // Buffer attributes own their arrays, so animate those exact buffers.
      positions = pointGeometry.getAttribute('position').array as Float32Array;
      pointGeometry.setAttribute(
        'charge',
        new Float32BufferAttribute(charges, 1),
      );
      charges = pointGeometry.getAttribute('charge').array as Float32Array;
      pointUniforms.size.value = cell * 1.03;
    }
    title!.classList.toggle('is-spatial', particleType || waveActive);
    if (waveButton && liquid) waveButton.hidden = false;
    host.dataset.spatialReady = 'true';
    syncFishControl();
    dirty = true;
    field.request();
  }
  const unsubscribe = field.subscribe((state) => {
    if (!ready || !visible || events.signal.aborted) return false;
    const bounds = host.getBoundingClientRect();
    const inside =
      state.pointerX > bounds.left &&
      state.pointerX < bounds.right &&
      state.pointerY > bounds.top &&
      state.pointerY < bounds.bottom;
    const mouse = new Vector2(
      state.pointerX - bounds.left - bounds.width / 2,
      bounds.height / 2 - (state.pointerY - bounds.top),
    );
    const moved = previousPointer.distanceTo(mouse);
    const clicked = state.interaction !== lastInteraction;
    if (inside && (moved > 1 || clicked)) {
      energy = Math.max(energy, clicked ? 1 : Math.min(1, moved / 28));
      if (state.time - lastRipple > 70 || clicked) {
        ripples[rippleIndex].set(
          (state.pointerX - bounds.left) / bounds.width,
          1 - (state.pointerY - bounds.top) / bounds.height,
          0,
          clicked ? 1.2 : 0.8,
        );
        rippleIndex = (rippleIndex + 1) % ripples.length;
        lastRipple = state.time;
      }
    }
    previousPointer.copy(mouse);
    lastInteraction = state.interaction;
    energy *= Math.exp(-4.8 * state.delta);
    waterClock += state.delta * energy * 0.65;
    waterUniforms.clock.value = waterClock;
    let pending = energy > 0.002;
    const swimming = !fishPaused;
    if (swimming)
      fish.update(
        state.delta,
        bounds.width,
        bounds.height,
        inside && finePointer.matches
          ? {
              x: state.pointerX - bounds.left,
              y: bounds.height - (state.pointerY - bounds.top),
            }
          : undefined,
      );
    const fishFrame = swimming && state.time - lastFishFrame >= 1000 / 30;
    if (waveActive && liquid) {
      dragPosition.set(
        (state.pointerX - bounds.left) / bounds.width,
        1 - (state.pointerY - bounds.top) / bounds.height,
      );
      dragForce.set(0, 0);
      if (dragging) {
        dragForce.subVectors(dragPosition, lastDrag).clampLength(0, 0.11);
        if (dragForce.length() > 0.0001) fluidEnergy = 1;
      }
      if (fluidEnergy > 0.001) {
        liquid.step(state.delta, lastDrag, dragPosition, dragForce);
        fluidEnergy *= Math.exp(-2.8 * state.delta);
        if (fluidEnergy < 0.001) {
          liquid.clear();
          fluidEnergy = 0;
        }
        dirty = true;
        pending = true;
      }
      lastDrag.copy(dragPosition);
    }
    ripples.forEach((ripple) => {
      ripple.z += state.delta;
      if (ripple.z < 2.4) pending = true;
    });
    const radius = Math.max(85, Math.min(140, bounds.width * 0.09));
    sharpUniforms.pointer.value.copy(mouse);
    sharpUniforms.energy.value = inside ? energy : 0;
    sharpUniforms.radius.value = radius;
    if (particleType && !waveActive && (pending || dirty)) {
      for (
        let index = 0, point = 0;
        index < positions.length;
        index += 3, point++
      ) {
        const dx = origins[index] - mouse.x;
        const dy = origins[index + 1] - mouse.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        const force = inside
          ? Math.pow(Math.max(0, 1 - distance / radius), 2) * energy
          : 0;
        const normal = Math.max(distance, 1);
        for (let axis = 0; axis < 3; axis++) {
          const target =
            axis === 0
              ? origins[index] + (dx / normal) * force * 52
              : axis === 1
                ? origins[index + 1] + (dy / normal) * force * 52
                : force * 95;
          const slot = index + axis;
          velocities[slot] +=
            ((target - positions[slot]) * 130 - velocities[slot] * 18) *
            state.delta;
          positions[slot] += velocities[slot] * state.delta;
          if (
            Math.abs(positions[slot] - origins[slot]) +
              Math.abs(velocities[slot]) >
            0.025
          )
            pending = true;
        }
        charges[point] +=
          (force - charges[point]) * (1 - Math.exp(-8 * state.delta));
      }
      pointGeometry.getAttribute('position').needsUpdate = true;
      pointGeometry.getAttribute('charge').needsUpdate = true;
    }
    if (dirty || pending || fishFrame) {
      renderer.render(scene, camera);
      lastFishFrame = state.time;
      dirty = false;
    }
    return pending || swimming;
  });
  const resize = new ResizeObserver(layout);
  resize.observe(host);
  resize.observe(title);
  window.addEventListener('resize', layout, { signal: events.signal });
  window.visualViewport?.addEventListener('resize', layout, {
    signal: events.signal,
  });
  const visibility = new IntersectionObserver(([entry]) => {
    visible = entry.isIntersecting;
    if (visible) {
      dirty = true;
      field.request();
    }
  });
  visibility.observe(host);
  renderer.domElement.addEventListener(
    'webglcontextlost',
    () => {
      ready = false;
      stopWaves();
      if (waveButton) waveButton.hidden = true;
      title!.classList.remove('is-spatial');
      delete host.dataset.spatialReady;
      syncFishControl();
      renderer.domElement.hidden = true;
    },
    { signal: events.signal },
  );
  host.appendChild(renderer.domElement);
  void document.fonts.ready.then(() => {
    if (!events.signal.aborted) {
      ready = true;
      layout();
    }
  });
  return () => {
    events.abort();
    stopWaves();
    if (waveButton) waveButton.hidden = true;
    unsubscribe();
    resize.disconnect();
    visibility.disconnect();
    title.classList.remove('is-spatial');
    delete host.dataset.spatialReady;
    syncFishControl();
    waterGeometry.dispose();
    waterMaterial.dispose();
    pointGeometry.dispose();
    pointMaterial.dispose();
    titleTexture?.dispose();
    sharpGeometry.dispose();
    sharpMaterial.dispose();
    liquid?.dispose();
    renderer.dispose();
    renderer.forceContextLoss();
    renderer.domElement.remove();
  };
}
export function mountSpatialTitle(field: SpatialField): () => void {
  const hosts = [
    ...document.querySelectorAll<HTMLElement>(
      '.hero, .archive-hero, .case-hero, .article-hero, .site-footer',
    ),
  ];
  const scenes = new Map<HTMLElement, () => void>();
  let disposed = false;
  const nearby = new IntersectionObserver(
    (entries) => {
      if (disposed) return;
      for (const entry of entries) {
        const host = entry.target as HTMLElement;
        if (!entry.isIntersecting || scenes.has(host)) continue;
        scenes.set(host, mountPanel(host, field, hosts.indexOf(host) * 1.83));
        nearby.unobserve(host);
      }
    },
    { rootMargin: '160px' },
  );
  hosts.forEach((host) => nearby.observe(host));
  const button =
    document.querySelector<HTMLButtonElement>('[data-fish-toggle]');
  const toggleFish = () => {
    fishPaused = !fishPaused;
    syncFishControl();
    field.request();
  };
  button?.addEventListener('click', toggleFish);
  return () => {
    disposed = true;
    nearby.disconnect();
    button?.removeEventListener('click', toggleFish);
    scenes.forEach((dispose) => dispose());
    scenes.clear();
  };
}
