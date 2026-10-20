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

  override connect(): void {
    this.controlsTarget.hidden = false;
    this.update();
  }

  update(): void {
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
    setLayer(this.selectedTarget, selectedLayer);
    setLayer(this.comparedTarget, example.layer);
    this.measurementsTarget.replaceChildren();
    const measurements = measureLayers(selectedLayer, example.layer);
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
    this.descriptionTarget.textContent = `${example.explanation} ${values}.`;
    this.summaryTarget.textContent = `${example.explanation} ${values}.`;
  }
}
