import { Controller } from '@hotwired/stimulus';
import { examples, measureLayers, selectedLayer } from '../measurements';
import type { Layer } from '../measurements';

const namespace = 'http://www.w3.org/2000/svg';
function svg<K extends keyof SVGElementTagNameMap>(
  tag: K,
  attributes: Record<string, string | number>,
) {
  const element = document.createElementNS(namespace, tag);
  for (const [name, value] of Object.entries(attributes))
    element.setAttribute(name, String(value));
  return element;
}

export default class extends Controller<HTMLElement> {
  static override targets = [
    'controls',
    'scenario',
    'zoom',
    'zoomLabel',
    'scene',
    'selected',
    'compared',
    'measurements',
    'summary',
    'description',
    'canvas',
    'playControls',
    'reset',
    'mover',
    'hitArea',
    'focusRing',
    'handles',
  ];
  declare readonly controlsTarget: HTMLElement;
  declare readonly scenarioTarget: HTMLSelectElement;
  declare readonly zoomTarget: HTMLInputElement;
  declare readonly zoomLabelTarget: HTMLOutputElement;
  declare readonly sceneTarget: SVGGElement;
  declare readonly selectedTarget: SVGRectElement;
  declare readonly comparedTarget: SVGRectElement;
  declare readonly measurementsTarget: SVGGElement;
  declare readonly summaryTarget: HTMLElement;
  declare readonly descriptionTarget: SVGDescElement;
  declare readonly canvasTarget: SVGSVGElement;
  declare readonly playControlsTargets: HTMLElement[];
  declare readonly resetTarget: HTMLButtonElement;
  declare readonly moverTarget: SVGGElement;
  declare readonly hitAreaTarget: SVGRectElement;
  declare readonly focusRingTarget: SVGRectElement;
  declare readonly handlesTarget: SVGGElement;
  private layer = { ...selectedLayer };
  private pointer?: { id: number; x: number; y: number; layer: Layer };
  private resizeObserver?: ResizeObserver;

  override connect(): void {
    this.controlsTarget.hidden = false;
    this.playControlsTargets.forEach((control) => (control.hidden = false));
    this.canvasTarget.setAttribute('role', 'group');
    this.moverTarget.classList.remove('hidden');
    this.moverTarget.setAttribute('tabindex', '0');
    this.resizeObserver = new ResizeObserver(() => this.updateHitArea());
    this.resizeObserver.observe(this.canvasTarget);
    this.update();
  }

  override disconnect(): void {
    this.release();
    this.resizeObserver?.disconnect();
  }

  update(event?: Event): void {
    this.release();
    if (event?.target === this.scenarioTarget)
      this.layer = { ...selectedLayer };
    this.render();
  }

  reset(): void {
    this.release();
    this.layer = { ...selectedLayer };
    this.render();
  }

  private point(event: PointerEvent): DOMPoint | undefined {
    const matrix = this.sceneTarget.getScreenCTM();
    if (!matrix) return;
    return new DOMPoint(event.clientX, event.clientY).matrixTransform(
      matrix.inverse(),
    );
  }

  grab(event: PointerEvent): void {
    if (!event.isPrimary || event.button !== 0 || this.pointer) return;
    const point = this.point(event);
    if (!point) return;
    event.preventDefault();
    this.moverTarget.focus({ preventScroll: true });
    this.pointer = {
      id: event.pointerId,
      x: point.x,
      y: point.y,
      layer: { ...this.layer },
    };
    this.moverTarget.setPointerCapture(event.pointerId);
  }

  drag(event: PointerEvent): void {
    if (!this.pointer || event.pointerId !== this.pointer.id) return;
    const point = this.point(event);
    if (!point) return;
    this.move(
      this.pointer.layer.x + point.x - this.pointer.x,
      this.pointer.layer.y + point.y - this.pointer.y,
      false,
    );
  }

  release(event?: PointerEvent): void {
    if (!this.pointer || (event && event.pointerId !== this.pointer.id)) return;
    const id = this.pointer.id;
    this.pointer = undefined;
    if (this.moverTarget.hasPointerCapture(id))
      this.moverTarget.releasePointerCapture(id);
    this.render();
  }

  cancel(event: PointerEvent): void {
    if (this.pointer?.id !== event.pointerId) return;
    this.layer = { ...this.pointer.layer };
    this.release(event);
  }

  moveWithKeys(event: KeyboardEvent): void {
    if (event.altKey || event.ctrlKey || event.metaKey) return;
    if (event.key === 'Escape' && this.pointer) {
      event.preventDefault();
      this.layer = { ...this.pointer.layer };
      this.release();
      return;
    }
    const direction = {
      ArrowLeft: [-1, 0],
      ArrowRight: [1, 0],
      ArrowUp: [0, -1],
      ArrowDown: [0, 1],
    }[event.key];
    if (!direction || this.pointer) return;
    event.preventDefault();
    const step = event.shiftKey ? 10 : 1;
    this.move(
      this.layer.x + direction[0] * step,
      this.layer.y + direction[1] * step,
    );
  }

  nudge(event: Event): void {
    const direction = {
      left: [-1, 0],
      right: [1, 0],
      up: [0, -1],
      down: [0, 1],
    }[(event.currentTarget as HTMLElement).dataset.direction ?? ''];
    if (!direction) return;
    this.move(
      this.layer.x + direction[0] * 10,
      this.layer.y + direction[1] * 10,
    );
  }

  private move(x: number, y: number, announce = true): void {
    // Reserve room for labels even at 125% zoom; keep the layer reachable.
    this.layer.x = Math.max(96, Math.min(424, Math.round(x)));
    this.layer.y = Math.max(80, Math.min(240, Math.round(y)));
    this.render(announce);
  }

  private updateHitArea(): void {
    const matrix = this.sceneTarget.getScreenCTM();
    if (!matrix) return;
    const width = Math.max(
      this.layer.width,
      44 / Math.hypot(matrix.a, matrix.b),
    );
    const height = Math.max(
      this.layer.height,
      44 / Math.hypot(matrix.c, matrix.d),
    );
    const { x, y } = this.layer;
    for (const [name, value] of Object.entries({
      x: x - (width - this.layer.width) / 2,
      y: y - (height - this.layer.height) / 2,
      width,
      height,
    }))
      this.hitAreaTarget.setAttribute(name, String(value));
    for (const [name, value] of Object.entries({
      x: x - 8,
      y: y - 8,
      width: this.layer.width + 16,
      height: this.layer.height + 16,
    }))
      this.focusRingTarget.setAttribute(name, String(value));
  }

  private render(announce = true): void {
    const key = this.scenarioTarget.value;
    if (!Object.prototype.hasOwnProperty.call(examples, key)) return;
    const example = examples[key as keyof typeof examples];
    const zoom = Number(this.zoomTarget.value);
    this.zoomLabelTarget.value = `${zoom}%`;
    this.sceneTarget.setAttribute(
      'transform',
      `translate(320 210) scale(${zoom / 100}) translate(-320 -210)`,
    );
    const setLayer = (rect: SVGRectElement, layer: Layer) => {
      for (const [name, value] of Object.entries(layer))
        rect.setAttribute(name, String(value));
    };
    setLayer(this.selectedTarget, this.layer);
    setLayer(this.comparedTarget, example.layer);
    this.updateHitArea();
    this.handlesTarget.replaceChildren();
    for (const x of [this.layer.x, this.layer.x + this.layer.width]) {
      for (const y of [this.layer.y, this.layer.y + this.layer.height])
        this.handlesTarget.append(
          svg('rect', { x: x - 4, y: y - 4, width: 8, height: 8 }),
        );
    }
    this.resetTarget.disabled =
      this.layer.x === selectedLayer.x && this.layer.y === selectedLayer.y;
    if (announce)
      this.moverTarget.setAttribute(
        'aria-label',
        `Move selected layer. X: ${this.layer.x}, Y: ${this.layer.y} design pixels`,
      );
    this.measurementsTarget.replaceChildren();
    const measurements = measureLayers(this.layer, example.layer);
    for (const measurement of measurements) {
      const { from, to, edges, value } = measurement;
      const group = svg('g', { 'data-measurement': measurement.name });
      for (const [index, edge] of edges.entries()) {
        const point = index === 0 ? from : to;
        group.append(
          svg('line', {
            x1: edge.x,
            y1: edge.y,
            x2: point.x,
            y2: point.y,
            stroke: 'currentColor',
            'stroke-dasharray': '3 4',
            'stroke-opacity': '0.55',
          }),
        );
      }
      group.append(
        svg('line', {
          x1: from.x,
          y1: from.y,
          x2: to.x,
          y2: to.y,
          stroke: 'currentColor',
          'stroke-width': 1.5,
        }),
      );
      const horizontal = from.y === to.y;
      for (const point of [from, to]) {
        group.append(
          svg('line', {
            x1: point.x - (horizontal ? 0 : 4),
            y1: point.y - (horizontal ? 4 : 0),
            x2: point.x + (horizontal ? 0 : 4),
            y2: point.y + (horizontal ? 4 : 0),
            stroke: 'currentColor',
            'stroke-width': 1.5,
          }),
        );
      }
      const x = (from.x + to.x) / 2;
      const y = (from.y + to.y) / 2;
      const label = `${value} px`;
      const width = label.length * 8 + 12;
      group.append(
        svg('rect', {
          x: x - width / 2,
          y: y - 11,
          width,
          height: 22,
          rx: 3,
          class: 'fill-paper',
        }),
      );
      const text = svg('text', {
        x,
        y: y + 5,
        'text-anchor': 'middle',
        fill: 'currentColor',
        'font-size': 14,
        class: 'font-mono',
      });
      text.textContent = label;
      group.append(text);
      this.measurementsTarget.append(group);
    }
    const values = measurements
      .map((measurement) => `${measurement.name}: ${measurement.value} px`)
      .join('. ');
    const a = this.layer;
    const b = example.layer;
    const contains = (outer: Layer, inner: Layer) =>
      outer.x <= inner.x &&
      outer.y <= inner.y &&
      outer.x + outer.width >= inner.x + inner.width &&
      outer.y + outer.height >= inner.y + inner.height;
    const relationship =
      a.x + a.width <= b.x ||
      b.x + b.width <= a.x ||
      a.y + a.height <= b.y ||
      b.y + b.height <= a.y
        ? 'separated'
        : contains(a, b) || contains(b, a)
          ? 'contained'
          : 'overlapping';
    const result = measurements.length
      ? `${examples[relationship].explanation} ${values}.`
      : 'The layer edges line up. No distance to measure.';
    this.descriptionTarget.textContent = result;
    // Screen readers get the final result rather than a stream while dragging.
    if (announce) this.summaryTarget.textContent = result;
  }
}
