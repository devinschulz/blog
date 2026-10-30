import {
  Scene,
  OrthographicCamera,
  WebGLRenderer,
  PlaneGeometry,
  ShaderMaterial,
  Mesh,
  CanvasTexture,
  SRGBColorSpace,
  Vector2,
  Color,
} from 'three';

function createLens(host: HTMLElement, images: HTMLImageElement[]) {
  const renderer = new WebGLRenderer({
    alpha: true,
    antialias: false,
    powerPreference: 'low-power',
  });
  renderer.setPixelRatio(Math.min(devicePixelRatio, 1.5));
  renderer.domElement.className =
    'project-lens pointer-events-none absolute inset-0 z-1 h-full w-full forced-colors:hidden';
  renderer.domElement.setAttribute('aria-hidden', 'true');
  const textures = images.map((image) => {
    // Rasterize the browser's selected responsive source. Its density-corrected
    // natural size can differ from the decoded upload size of an <img srcset>.
    const raster = document.createElement('canvas');
    raster.width = Math.min(1600, image.naturalWidth);
    raster.height = Math.round(
      (raster.width * image.naturalHeight) / image.naturalWidth,
    );
    raster
      .getContext('2d')!
      .drawImage(image, 0, 0, raster.width, raster.height);
    const texture = new CanvasTexture(raster);
    texture.colorSpace = SRGBColorSpace;
    texture.needsUpdate = true;
    return texture;
  });
  const uniforms = {
    first: { value: textures[0] },
    second: { value: textures[1] },
    firstSize: {
      value: new Vector2(images[0].naturalWidth, images[0].naturalHeight),
    },
    secondSize: {
      value: new Vector2(images[1].naturalWidth, images[1].naturalHeight),
    },
    size: { value: new Vector2(1, 1) },
    pointer: { value: new Vector2(0.5, 0.5) },
    visibility: { value: 0 },
    speed: { value: 0 },
    clock: { value: 0 },
    selected: { value: 0 },
    cover: { value: getComputedStyle(images[0]).objectFit === 'cover' ? 1 : 0 },
    background: { value: new Color(getComputedStyle(host).backgroundColor) },
  };
  const material = new ShaderMaterial({
    uniforms,
    vertexShader:
      'varying vec2 vUv; void main(){vUv=uv;gl_Position=vec4(position.xy,0.,1.);}',
    fragmentShader: `
      uniform sampler2D first, second;
      uniform vec2 firstSize, secondSize, size, pointer;
      uniform float visibility, speed, clock, selected, cover;
      uniform vec3 background;
      varying vec2 vUv;
      vec3 picture(sampler2D image, vec2 dimensions, vec2 uv, float crop) {
        float imageAspect=dimensions.x/dimensions.y;
        float frameAspect=size.x/size.y;
        vec2 scale=vec2(1.);
        if(crop>.5) {
          if(imageAspect>frameAspect) scale.x=frameAspect/imageAspect;
          else scale.y=imageAspect/frameAspect;
        } else {
          if(imageAspect>frameAspect) scale.y=imageAspect/frameAspect;
          else scale.x=frameAspect/imageAspect;
        }
        vec2 sampleUV=(uv-.5)*scale+.5;
        if(any(lessThan(sampleUV,vec2(0.))) || any(greaterThan(sampleUV,vec2(1.)))) return background;
        vec3 color=texture2D(image,sampleUV).rgb;
        return color;
      }
      void main(){
        float aspect=size.x/size.y;
        vec2 delta=(vUv-pointer)*vec2(aspect,1.);
        float angle=atan(delta.y,delta.x);
        float radius=min(.17,120./size.y)*visibility;
        float wobble=sin(angle*3.+clock*1.7)*.003*speed;
        float distance=length(delta);
        float boundary=distance-radius-wobble;
        float reveal=(1.-smoothstep(-.018,.018,boundary))*visibility;
        float edge=exp(-pow(boundary*90.,2.))*visibility;
        vec2 normal=normalize(delta+vec2(.00001))/vec2(aspect,1.);
        vec2 refraction=normal*edge*(.003+speed*.003);
        vec2 lensUV=pointer+(vUv-pointer)/1.16-refraction;
        vec3 base=mix(picture(first,firstSize,vUv,cover),picture(second,secondSize,vUv,0.),selected);
        vec3 magnified=mix(picture(first,firstSize,lensUV,cover),picture(second,secondSize,lensUV,0.),selected);
        vec3 color=mix(base,magnified,reveal);
        color+=edge*vec3(.012,.018,.03);
        gl_FragColor=vec4(color,1.);
        #include <colorspace_fragment>
      }`,
  });
  const geometry = new PlaneGeometry(2, 2);
  const scene = new Scene();
  scene.add(new Mesh(geometry, material));
  const camera = new OrthographicCamera(-1, 1, 1, -1, 0, 1);
  host.append(renderer.domElement);
  const resize = new ResizeObserver(() => {
    const bounds = host.getBoundingClientRect();
    uniforms.size.value.set(bounds.width, bounds.height);
    renderer.setSize(bounds.width, bounds.height, false);
  });
  resize.observe(host);
  let frame = 0,
    previous = 0,
    visibility = 0,
    target = 0,
    speed = 0,
    clock = 0;
  const pointer = new Vector2(0.5, 0.5),
    destination = new Vector2(0.5, 0.5);
  let disposed = false;
  function request() {
    if (!frame && !disposed && !document.hidden)
      frame = requestAnimationFrame(draw);
  }
  function draw(time: number) {
    frame = 0;
    const delta = Math.min((time - (previous || time - 16)) / 1000, 0.04);
    previous = time;
    const movement = pointer.distanceTo(destination);
    pointer.lerp(destination, 1 - Math.exp(-16 * delta));
    visibility += (target - visibility) * (1 - Math.exp(-16 * delta));
    speed += (Math.min(1, movement * 18) - speed) * (1 - Math.exp(-12 * delta));
    clock += delta * speed;
    uniforms.pointer.value.copy(pointer);
    uniforms.visibility.value = visibility;
    uniforms.speed.value = speed;
    uniforms.clock.value = clock;
    renderer.render(scene, camera);
    if (
      Math.abs(visibility - target) > 0.001 ||
      movement > 0.0005 ||
      speed > 0.002
    )
      request();
    else if (!target) renderer.domElement.hidden = true;
  }
  function hide() {
    target = 0;
    renderer.domElement.hidden = true;
    cancelAnimationFrame(frame);
    frame = 0;
    previous = 0;
    visibility = 0;
    speed = 0;
  }
  return {
    move(x: number, y: number, selected: boolean) {
      uniforms.selected.value = selected ? 1 : 0;
      if (!target) pointer.set(x, y);
      destination.set(x, y);
      target = 1;
      renderer.domElement.hidden = false;
      request();
    },
    leave() {
      target = 0;
      request();
    },
    hide,
    canvas: renderer.domElement,
    dispose() {
      disposed = true;
      hide();
      resize.disconnect();
      textures.forEach((texture) => texture.dispose());
      material.dispose();
      geometry.dispose();
      renderer.dispose();
      renderer.forceContextLoss();
      renderer.domElement.remove();
    },
  };
}

export function mountProjectPreviews(): () => void {
  const reduce = matchMedia('(prefers-reduced-motion: reduce)');
  const fine = matchMedia('(hover: hover) and (pointer: fine)');
  const disposers = [
    ...document.querySelectorAll<HTMLElement>('[data-project-preview]'),
  ].map((project) => {
    const art = project.querySelector<HTMLElement>('.project-art')!;
    const images = [
      ...art.querySelectorAll<HTMLImageElement>('.project-main img'),
    ];
    const button = project.querySelector<HTMLButtonElement>(
      '[data-preview-toggle]',
    )!;
    const label = button.querySelector<HTMLElement>('[data-preview-label]')!;
    const count = button.querySelector<HTMLElement>('[data-preview-count]')!;
    const status = project.querySelector<HTMLElement>('[data-preview-status]')!;
    const hint = project.querySelector<HTMLElement>('[data-lens-hint]')!;
    const name = project.querySelector('h3')!.textContent;
    const events = new AbortController();
    let selected = false,
      ready: Promise<boolean> | undefined,
      lens: ReturnType<typeof createLens> | undefined;
    let busy = false;
    let failed = false,
      inside = false,
      pointer = { x: 0, y: 0 };
    function hideLens() {
      inside = false;
      lens?.hide();
    }
    function controlsActive() {
      const focused = document.activeElement;
      return (
        button.matches(':hover') ||
        !!(
          focused &&
          project.contains(focused) &&
          focused.matches(':focus-visible')
        )
      );
    }
    function decode() {
      if (!ready) {
        images[1].loading = 'eager';
        ready = Promise.all(images.map((image) => image.decode()))
          .then(() => !events.signal.aborted)
          .catch(() => {
            ready = undefined;
            if (!events.signal.aborted)
              status.textContent =
                'Couldn’t load this view. Try again, or open the project to read the case study.';
            return false;
          });
      }
      return ready;
    }
    function restore() {
      selected = false;
      images[0].hidden = false;
      images[1].hidden = true;
      button.setAttribute('aria-pressed', 'false');
      label.textContent = 'Show other view';
      count.textContent = '01/02';
      lens?.hide();
    }
    function preferences() {
      hint.hidden = reduce.matches || !fine.matches || failed;
      if (reduce.matches || !fine.matches) {
        lens?.dispose();
        lens = undefined;
      }
    }
    button.hidden = false;
    preferences();
    button.addEventListener(
      'click',
      async () => {
        if (busy) return;
        hideLens();
        busy = true;
        button.setAttribute('aria-busy', 'true');
        label.textContent = 'Loading view…';
        if (await decode()) {
          selected = !selected;
          images[0].hidden = selected;
          images[1].hidden = !selected;
          lens?.hide();
          count.textContent = selected ? '02/02' : '01/02';
          button.setAttribute('aria-pressed', String(selected));
          status.textContent = `${name}: view ${selected ? '2' : '1'} of 2. ${images[selected ? 1 : 0].alt}`;
        }
        if (!events.signal.aborted) {
          busy = false;
          button.removeAttribute('aria-busy');
          label.textContent = selected ? 'Show first view' : 'Show other view';
        }
      },
      { signal: events.signal },
    );
    art.addEventListener(
      'pointermove',
      async (event) => {
        if (!event.movementX && !event.movementY) return;
        if (
          reduce.matches ||
          !fine.matches ||
          event.pointerType === 'touch' ||
          failed ||
          controlsActive()
        )
          return;
        inside = true;
        const bounds = art.getBoundingClientRect();
        pointer = {
          x: (event.clientX - bounds.left) / bounds.width,
          y: 1 - (event.clientY - bounds.top) / bounds.height,
        };
        if (
          !(await decode()) ||
          !inside ||
          events.signal.aborted ||
          reduce.matches ||
          !fine.matches ||
          controlsActive()
        )
          return;
        if (!lens) {
          try {
            lens = createLens(art, images);
            lens.canvas.addEventListener(
              'webglcontextlost',
              () => {
                failed = true;
                lens?.hide();
                hint.hidden = true;
              },
              { signal: events.signal },
            );
          } catch {
            failed = true;
            hint.hidden = true;
            return;
          }
        }
        lens.move(pointer.x, pointer.y, selected);
      },
      { signal: events.signal },
    );
    art.addEventListener(
      'pointerleave',
      () => {
        inside = false;
        lens?.leave();
      },
      { signal: events.signal },
    );
    art.addEventListener('pointerdown', () => lens?.hide(), {
      signal: events.signal,
    });
    button.addEventListener('pointerenter', hideLens, {
      signal: events.signal,
    });
    project.addEventListener('focusin', hideLens, { signal: events.signal });
    const offscreen = new IntersectionObserver(([entry]) => {
      if (!entry.isIntersecting) {
        inside = false;
        lens?.hide();
      }
    });
    offscreen.observe(art);
    document.addEventListener(
      'visibilitychange',
      () => {
        if (document.hidden) {
          inside = false;
          lens?.hide();
        }
      },
      { signal: events.signal },
    );
    window.addEventListener(
      'blur',
      () => {
        inside = false;
        lens?.hide();
      },
      { signal: events.signal },
    );
    window.addEventListener(
      'scroll',
      () => {
        inside = false;
        lens?.hide();
      },
      { passive: true, signal: events.signal },
    );
    reduce.addEventListener('change', preferences, { signal: events.signal });
    fine.addEventListener('change', preferences, { signal: events.signal });
    return () => {
      events.abort();
      offscreen.disconnect();
      restore();
      lens?.dispose();
      button.hidden = true;
      button.disabled = false;
      button.removeAttribute('aria-busy');
      hint.hidden = true;
      status.textContent = '';
    };
  });
  return () => disposers.forEach((dispose) => dispose());
}
