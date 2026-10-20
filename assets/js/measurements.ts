export interface Layer {
  x: number;
  y: number;
  width: number;
  height: number;
}

interface Point {
  x: number;
  y: number;
}

export interface Measurement {
  name: string;
  value: number;
  from: Point;
  to: Point;
  // Layer edges projected onto the measurement line become helper lines.
  edges: [Point, Point];
}

export const selectedLayer: Layer = { x: 180, y: 150, width: 120, height: 100 };

export const examples = {
  separated: {
    layer: { x: 360, y: 170, width: 120, height: 100 },
    explanation: 'Separated layers: measure the gap between the nearest edges.',
  },
  overlapping: {
    layer: { x: 250, y: 200, width: 120, height: 100 },
    explanation:
      'Overlapping layers: compare corresponding edges instead of treating the shared area as a gap.',
  },
  contained: {
    layer: { x: 130, y: 100, width: 250, height: 200 },
    explanation:
      'Contained layer: measure the inset from each surrounding edge.',
  },
} satisfies Record<string, { layer: Layer; explanation: string }>;

// This is a small demonstration of the approach, rather than the original
// Inspect implementation. Geometry stays independent of SVG and display zoom.
export function measureLayers(a: Layer, b: Layer): Measurement[] {
  const ar = a.x + a.width;
  const ab = a.y + a.height;
  const br = b.x + b.width;
  const bb = b.y + b.height;
  const result: Measurement[] = [];
  const horizontal = (name: string, first: Point, second: Point, y: number) => {
    result.push({
      name,
      value: Math.abs(second.x - first.x),
      from: { x: first.x, y },
      to: { x: second.x, y },
      edges: [first, second],
    });
  };
  const vertical = (name: string, first: Point, second: Point, x: number) => {
    result.push({
      name,
      value: Math.abs(second.y - first.y),
      from: { x, y: first.y },
      to: { x, y: second.y },
      edges: [first, second],
    });
  };
  if (ar <= b.x || br <= a.x || ab <= b.y || bb <= a.y) {
    if (ar <= b.x || br <= a.x) {
      const y = (Math.max(a.y, b.y) + Math.min(ab, bb)) / 2;
      horizontal(
        'Horizontal gap',
        { x: ar <= b.x ? ar : a.x, y: a.y + a.height / 2 },
        { x: ar <= b.x ? b.x : br, y: b.y + b.height / 2 },
        y,
      );
    }
    if (ab <= b.y || bb <= a.y) {
      const x = (Math.max(a.x, b.x) + Math.min(ar, br)) / 2;
      vertical(
        'Vertical gap',
        { x: a.x + a.width / 2, y: ab <= b.y ? ab : a.y },
        { x: b.x + b.width / 2, y: ab <= b.y ? b.y : bb },
        x,
      );
    }
  } else {
    const right = Math.max(ar, br) + 28;
    horizontal(
      'Left edge',
      { x: a.x, y: a.y },
      { x: b.x, y: b.y },
      Math.min(a.y, b.y) - 28,
    );
    horizontal(
      'Right edge',
      { x: ar, y: ab },
      { x: br, y: bb },
      Math.max(ab, bb) + 28,
    );
    vertical('Top edge', { x: ar, y: a.y }, { x: br, y: b.y }, right);
    vertical('Bottom edge', { x: ar, y: ab }, { x: br, y: bb }, right);
  }
  return result.filter((measurement) => measurement.value > 0);
}
