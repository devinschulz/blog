import {
  Scene,
  OrthographicCamera,
  Mesh,
  PlaneGeometry,
  ShaderMaterial,
  WebGLRenderTarget,
  HalfFloatType,
  Vector2,
  CanvasTexture,
  Color,
} from 'three';
import type { WebGLRenderer, Texture } from 'three';

// A small advected displacement field: the lettering follows the same ink-like
// flow that bends the blue panel's highlights. Nothing in the document moves.
export function createLiquidType(renderer: WebGLRenderer) {
  const geometry = new PlaneGeometry(2, 2);
  const targets = [0, 1].map(
    () =>
      new WebGLRenderTarget(256, 256, {
        type: HalfFloatType,
        depthBuffer: false,
        stencilBuffer: false,
      }),
  );
  const uniforms = {
    previous: { value: targets[0].texture },
    start: { value: new Vector2(-10, -10) },
    end: { value: new Vector2(-10, -10) },
    force: { value: new Vector2() },
    aspect: { value: 1 },
    delta: { value: 1 / 60 },
  };
  const material = new ShaderMaterial({
    uniforms,
    vertexShader:
      'varying vec2 vUv; void main(){ vUv=uv; gl_Position=vec4(position.xy,0.,1.); }',
    fragmentShader: `
      uniform sampler2D previous;
      uniform vec2 start, end, force;
      uniform float aspect, delta;
      varying vec2 vUv;
      void main() {
        vec4 field = texture2D(previous, vUv);
        vec2 velocity = field.rg;
        vec4 carried = texture2D(previous, clamp(vUv - velocity * delta, .002, .998));
        vec2 a = (vUv-start)*vec2(aspect,1.);
        vec2 b = (end-start)*vec2(aspect,1.);
        float along = clamp(dot(a,b)/max(dot(b,b),.00001),0.,1.);
        float distance = length(a - b*along);
        float brush = exp(-distance*distance/0.0035);
        velocity = carried.rg * exp(-delta*5.5) + force*brush*3.8;
        vec2 curl = vec2(-(vUv-end).y, (vUv-end).x) * length(force) * brush * 9.;
        vec2 offset = carried.ba * exp(-delta*2.7) + (velocity+curl)*delta*1.8;
        gl_FragColor = vec4(clamp(velocity,vec2(-.8),vec2(.8)), clamp(offset,vec2(-.14),vec2(.14)));
      }`,
  });
  const simulation = new Scene();
  const camera = new OrthographicCamera(-1, 1, 1, -1, 0, 1);
  simulation.add(new Mesh(geometry, material));
  let current = 0;
  const output = { value: targets[0].texture };
  const ink = { value: null as Texture | null };
  const inkMaterial = new ShaderMaterial({
    uniforms: { flow: output, ink, strength: { value: 1 } },
    transparent: true,
    depthWrite: false,
    vertexShader:
      'varying vec2 vUv; void main(){vUv=uv; gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}',
    fragmentShader: `
      uniform sampler2D flow, ink;
      uniform float strength;
      varying vec2 vUv;
      void main(){
        vec2 offset=texture2D(flow,vUv).ba*strength;
        float alpha=texture2D(ink,vUv-offset).a;
        gl_FragColor=vec4(1.,1.,1.,alpha);
      }`,
  });
  const inkGeometry = new PlaneGeometry(1, 1);
  const letters = new Mesh(inkGeometry, inkMaterial);
  letters.position.z = 0.1;
  letters.visible = false;
  function clear() {
    if (renderer.getContext().isContextLost()) return;
    const color = renderer.getClearColor(new Color()).clone();
    // Render targets start at neutral displacement, including after a resize.
    const alpha = renderer.getClearAlpha();
    renderer.setClearColor(0, 0);
    targets.forEach((target) => {
      renderer.setRenderTarget(target);
      renderer.clear();
    });
    renderer.setRenderTarget(null);
    renderer.setClearColor(color, alpha);
  }
  return {
    letters,
    output,
    raster(canvas: HTMLCanvasElement, width: number, height: number) {
      ink.value?.dispose();
      ink.value = new CanvasTexture(canvas);
      letters.scale.set(width, height, 1);
      uniforms.aspect.value = width / height;
    },
    step(delta: number, start: Vector2, end: Vector2, force: Vector2) {
      uniforms.delta.value = delta;
      uniforms.start.value.copy(start);
      uniforms.end.value.copy(end);
      uniforms.force.value.copy(force);
      uniforms.previous.value = targets[current].texture;
      current = 1 - current;
      renderer.setRenderTarget(targets[current]);
      renderer.render(simulation, camera);
      renderer.setRenderTarget(null);
      output.value = targets[current].texture;
    },
    clear,
    dispose() {
      ink.value?.dispose();
      targets.forEach((target) => target.dispose());
      geometry.dispose();
      material.dispose();
      inkGeometry.dispose();
      inkMaterial.dispose();
    },
  };
}
