export interface SpatialFrame {
  time: number;
  delta: number;
  pointerX: number;
  pointerY: number;
  interaction: number;
}
export interface SpatialField {
  subscribe: (draw: (frame: SpatialFrame) => boolean) => () => void;
  request: () => void;
  dispose: () => void;
}

// A render-on-demand pointer field for the printed blue panels.
// Scrolling and project imagery remain entirely native.
export function createSpatialField(): SpatialField {
  const events = new AbortController();
  const clients = new Set<(frame: SpatialFrame) => boolean>();
  let frame = 0;
  let previous = 0;
  const state: SpatialFrame = {
    time: 0,
    delta: 1 / 60,
    pointerX: -10000,
    pointerY: -10000,
    interaction: 0,
  };
  function request() {
    if (!frame && !document.hidden && !events.signal.aborted) {
      previous = 0;
      frame = requestAnimationFrame(tick);
    }
  }
  function tick(time: number) {
    frame = 0;
    if (document.hidden || events.signal.aborted) return;
    state.time = time;
    state.delta = Math.min((time - (previous || time - 16)) / 1000, 0.04);
    previous = time;
    let pending = false;
    clients.forEach((draw) => {
      if (draw(state)) pending = true;
    });
    if (pending) frame = requestAnimationFrame(tick);
  }
  window.addEventListener(
    'pointermove',
    (event) => {
      state.pointerX = event.clientX;
      state.pointerY = event.clientY;
      request();
    },
    { passive: true, signal: events.signal },
  );
  window.addEventListener(
    'pointerdown',
    (event) => {
      state.pointerX = event.clientX;
      state.pointerY = event.clientY;
      state.interaction++;
      request();
    },
    { passive: true, signal: events.signal },
  );
  document.addEventListener(
    'pointerleave',
    () => {
      state.pointerX = -10000;
      state.pointerY = -10000;
      request();
    },
    { signal: events.signal },
  );
  document.addEventListener(
    'visibilitychange',
    () => {
      if (document.hidden) {
        cancelAnimationFrame(frame);
        frame = 0;
      } else request();
    },
    { signal: events.signal },
  );
  return {
    subscribe: (draw) => {
      clients.add(draw);
      request();
      return () => clients.delete(draw);
    },
    request,
    dispose: () => {
      events.abort();
      cancelAnimationFrame(frame);
      clients.clear();
    },
  };
}
