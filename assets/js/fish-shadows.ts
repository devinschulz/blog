import { Vector4 } from 'three';

// Soft silhouettes are composited into the water, beneath every text layer.
export const fishShadowShader = `
  uniform vec4 fishPose[3];
  uniform vec4 fishStyle[3];

  float fishCross(vec2 a, vec2 b) { return a.x * b.y - a.y * b.x; }
  float fishTriangle(vec2 p, vec2 a, vec2 b, vec2 c) {
    float winding = sign(fishCross(b - a, c - a));
    float ab = winding * fishCross(b - a, p - a) / length(b - a);
    float bc = winding * fishCross(c - b, p - b) / length(c - b);
    float ca = winding * fishCross(a - c, p - c) / length(a - c);
    return -min(ab, min(bc, ca));
  }

  float fishShadows(vec2 point) {
    float shadow = 0.0;
    for (int i = 0; i < 3; i++) {
      vec2 direction = fishPose[i].zw;
      vec2 offset = point - fishPose[i].xy;
      vec2 p = vec2(dot(offset, direction), dot(offset, vec2(-direction.y, direction.x))) / fishStyle[i].x;
      if (abs(p.x) > 1.2 || abs(p.y) > .65) continue;

      float tail = 1.0 - smoothstep(-.85, .55, p.x);
      p.y -= sin(fishStyle[i].y + p.x * 4.0) * .12 * tail * tail;
      float body = (length((p - vec2(.12, 0.0)) / vec2(.67, .22)) - 1.0) * .22;
      float upperTail = fishTriangle(p, vec2(-.48, 0.0), vec2(-1.02, .31), vec2(-.83, 0.0));
      float lowerTail = fishTriangle(p, vec2(-.48, 0.0), vec2(-.83, 0.0), vec2(-1.02, -.31));
      float upperFin = fishTriangle(p, vec2(.20, .13), vec2(-.23, .35), vec2(-.15, .10));
      float lowerFin = fishTriangle(p, vec2(.20, -.13), vec2(-.15, -.10), vec2(-.23, -.35));
      float silhouette = min(body, min(min(upperTail, lowerTail), min(upperFin, lowerFin)));
      float blur = fishStyle[i].w;
      shadow += (1.0 - smoothstep(-blur, blur, silhouette)) * fishStyle[i].z;
    }
    return min(shadow, .32);
  }
`;

export function createFishShadows(seed: number) {
  const pose = Array.from({ length: 3 }, () => new Vector4());
  const style = Array.from({ length: 3 }, () => new Vector4());
  const swimmers = Array.from({ length: 3 }, () => ({
    x: 0,
    y: 0,
    angle: 0,
    speed: 0,
    alarm: 0,
    escapeX: 1,
    escapeY: 0,
    tail: 0,
  }));
  let elapsed = 0;
  let previousWidth = 0;
  let previousHeight = 0;
  function route(t: number, phase: number) {
    return {
      x: 0.5 + 0.32 * Math.sin(t) + 0.065 * Math.sin(t * 1.7 + phase),
      y: 0.5 + 0.28 * Math.cos(t * 0.83 + phase) + 0.06 * Math.sin(t * 1.4),
    };
  }
  return {
    uniforms: { fishPose: { value: pose }, fishStyle: { value: style } },
    update(
      delta: number,
      width: number,
      height: number,
      pointer?: { x: number; y: number },
    ): void {
      elapsed += delta;
      const size = Math.max(20, Math.min(48, Math.min(width, height) * 0.13));
      for (let i = 0; i < pose.length; i++) {
        const fish = swimmers[i];
        const phase = seed + i * 2.4;
        const t = elapsed * (0.065 + i * 0.012) + phase;
        const radius = size * (1 - i * 0.12);
        const cruise = radius * 0.65;
        const goal = route(t + 0.7, phase);
        if (!previousWidth) {
          const start = route(t, phase);
          fish.x = start.x * width;
          fish.y = start.y * height;
          fish.angle = Math.atan2(
            goal.y * height - fish.y,
            goal.x * width - fish.x,
          );
          fish.speed = cruise;
          fish.tail = phase;
        } else {
          fish.x *= width / previousWidth;
          fish.y *= height / previousHeight;
        }
        fish.alarm *= Math.exp(-1.35 * delta);
        if (pointer) {
          const dx = fish.x - pointer.x;
          const dy = fish.y - pointer.y;
          const distance = Math.hypot(dx, dy);
          if (distance < Math.max(90, radius * 3.4)) {
            fish.alarm = 1;
            // At the exact center, keep moving rather than invent a zero heading.
            fish.escapeX =
              distance > 0.1 ? dx / distance : Math.cos(fish.angle);
            fish.escapeY =
              distance > 0.1 ? dy / distance : Math.sin(fish.angle);
          }
        }
        const dx = goal.x * width - fish.x;
        const dy = goal.y * height - fish.y;
        const distance = Math.max(1, Math.hypot(dx, dy));
        let directionX =
          (dx / distance) * (1 - fish.alarm) + fish.escapeX * fish.alarm;
        let directionY =
          (dy / distance) * (1 - fish.alarm) + fish.escapeY * fish.alarm;
        // Turn before the panel edge instead of bouncing or wrapping through it.
        const margin = Math.min(width * 0.2, height * 0.2, radius * 2.2);
        directionX += (Math.max(0, margin - fish.x) / margin) * 3;
        directionX -= (Math.max(0, fish.x - width + margin) / margin) * 3;
        directionY += (Math.max(0, margin - fish.y) / margin) * 3;
        directionY -= (Math.max(0, fish.y - height + margin) / margin) * 3;
        const target = Math.atan2(directionY, directionX);
        const turn = Math.atan2(
          Math.sin(target - fish.angle),
          Math.cos(target - fish.angle),
        );
        const maxTurn = (1.1 + fish.alarm * 3.2) * delta;
        fish.angle += Math.max(-maxTurn, Math.min(maxTurn, turn));
        const targetSpeed = cruise * (1 + fish.alarm * 3.5);
        fish.speed += (targetSpeed - fish.speed) * (1 - Math.exp(-5 * delta));
        fish.x += Math.cos(fish.angle) * fish.speed * delta;
        fish.y += Math.sin(fish.angle) * fish.speed * delta;
        fish.tail += delta * (3.6 + fish.speed / cruise);
        pose[i].set(
          fish.x / height,
          fish.y / height,
          Math.cos(fish.angle),
          Math.sin(fish.angle),
        );
        style[i].set(
          radius / height,
          fish.tail,
          0.18 - i * 0.025,
          0.045 + i * 0.018,
        );
      }
      previousWidth = width;
      previousHeight = height;
    },
  };
}
