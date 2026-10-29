import {
  useCallback,
  useLayoutEffect,
  useRef,
  useState,
  type KeyboardEvent,
  type TouchEvent,
  type WheelEvent,
} from 'react';

type Anchor = { node: HTMLElement; offset: number };

export function useChatScroll() {
  const viewportRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLOListElement>(null);
  const followingRef = useRef(true);
  const anchorRef = useRef<Anchor | null>(null);
  const lastTopRef = useRef(0);
  const touchYRef = useRef<number | null>(null);
  const [following, setFollowing] = useState(true);

  const changeFollowing = useCallback((value: boolean) => {
    followingRef.current = value;
    setFollowing(value);
  }, []);

  const rememberAnchor = useCallback(() => {
    const viewport = viewportRef.current;
    const content = contentRef.current;
    if (!viewport || !content) return;

    const top = viewport.getBoundingClientRect().top + viewport.clientTop;
    const node = Array.from(content.children).find(
      (child) => child.getBoundingClientRect().bottom > top,
    ) as HTMLElement | undefined;

    anchorRef.current = node
      ? { node, offset: node.getBoundingClientRect().top - top }
      : null;
    lastTopRef.current = viewport.scrollTop;
  }, []);

  const reconcile = useCallback(() => {
    const viewport = viewportRef.current;
    if (!viewport) return;

    if (followingRef.current) {
      viewport.scrollTop = viewport.scrollHeight - viewport.clientHeight;
    } else {
      const anchor = anchorRef.current;
      if (anchor?.node.isConnected) {
        const top = viewport.getBoundingClientRect().top + viewport.clientTop;
        const delta =
          anchor.node.getBoundingClientRect().top - top - anchor.offset;
        viewport.scrollTop += delta;
      }
    }
    // Record our own scroll writes before their scroll event is delivered.
    rememberAnchor();
  }, [rememberAnchor]);

  // Keep React commits from briefly painting the wrong reading position.
  useLayoutEffect(reconcile);

  useLayoutEffect(() => {
    const viewport = viewportRef.current;
    const content = contentRef.current;
    if (!viewport || !content) return;

    const observer = new ResizeObserver(reconcile);
    observer.observe(content);
    observer.observe(viewport);
    return () => observer.disconnect();
  }, [reconcile]);

  const onScroll = useCallback(() => {
    const viewport = viewportRef.current;
    if (!viewport) return;

    const movedUp = viewport.scrollTop < lastTopRef.current - 1;
    const gap =
      viewport.scrollHeight - viewport.clientHeight - viewport.scrollTop;

    if (movedUp) changeFollowing(false);
    else if (gap <= 2) changeFollowing(true);
    rememberAnchor();
  }, [changeFollowing, rememberAnchor]);

  const pauseFollowing = useCallback(() => {
    changeFollowing(false);
    rememberAnchor();
  }, [changeFollowing, rememberAnchor]);

  const jumpToLatest = useCallback(() => {
    changeFollowing(true);
    reconcile();
  }, [changeFollowing, reconcile]);

  const onWheel = useCallback(
    (event: WheelEvent<HTMLDivElement>) => {
      if (event.deltaY < 0) pauseFollowing();
    },
    [pauseFollowing],
  );

  const onTouchStart = useCallback((event: TouchEvent<HTMLDivElement>) => {
    touchYRef.current = event.touches[0]?.clientY ?? null;
  }, []);

  const onTouchMove = useCallback(
    (event: TouchEvent<HTMLDivElement>) => {
      const y = event.touches[0]?.clientY;
      if (
        y !== undefined &&
        touchYRef.current !== null &&
        y > touchYRef.current
      ) {
        pauseFollowing();
      }
      touchYRef.current = y ?? null;
    },
    [pauseFollowing],
  );

  const onKeyDown = useCallback(
    (event: KeyboardEvent<HTMLDivElement>) => {
      if (
        event.target !== event.currentTarget ||
        event.altKey ||
        event.ctrlKey ||
        event.metaKey
      )
        return;
      const viewport = viewportRef.current;
      if (!viewport) return;

      const page = viewport.clientHeight * 0.9;
      const positions: Record<string, number> = {
        ArrowUp: viewport.scrollTop - 40,
        ArrowDown: viewport.scrollTop + 40,
        PageUp: viewport.scrollTop - page,
        PageDown: viewport.scrollTop + page,
        Home: 0,
        End: viewport.scrollHeight,
        ' ': viewport.scrollTop + (event.shiftKey ? -page : page),
      };
      const next = positions[event.key];
      if (next === undefined) return;

      // Focusable regions do not get the same default key scrolling in every browser.
      event.preventDefault();
      viewport.scrollTop = Math.max(0, next);
      onScroll();
    },
    [onScroll],
  );

  return {
    viewportRef,
    contentRef,
    following,
    jumpToLatest,
    viewportProps: { onScroll, onWheel, onTouchStart, onTouchMove, onKeyDown },
  };
}
