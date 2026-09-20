// Gesto de arrastar na horizontal com ponteiro, com toque simples tratado como clique.
import { useRef, useState, type PointerEvent } from 'react';
import type { Direction } from '../domain/types';

export const SWIPE_THRESHOLD = 100;
const TAP_DISTANCE = 6;

// Converte o deslocamento horizontal em direção, ou null se foi curto demais.
export function resolveDirection(dx: number): Direction | null {
  if (dx >= SWIPE_THRESHOLD) return 'right';
  if (dx <= -SWIPE_THRESHOLD) return 'left';
  return null;
}

export function useSwipe(onSwipe: (direction: Direction) => void, onTap: () => void) {
  const [dx, setDx] = useState(0);
  const startX = useRef<number | null>(null);
  const maxMove = useRef(0);

  const onPointerDown = (e: PointerEvent<HTMLElement>) => {
    startX.current = e.clientX;
    maxMove.current = 0;
    e.currentTarget.setPointerCapture?.(e.pointerId);
  };

  const onPointerMove = (e: PointerEvent<HTMLElement>) => {
    if (startX.current === null) return;
    const delta = e.clientX - startX.current;
    maxMove.current = Math.max(maxMove.current, Math.abs(delta));
    setDx(delta);
  };

  const onPointerUp = (e: PointerEvent<HTMLElement>) => {
    if (startX.current === null) return;
    const delta = e.clientX - startX.current;
    startX.current = null;
    setDx(0);
    const direction = resolveDirection(delta);
    if (direction) onSwipe(direction);
    else if (maxMove.current < TAP_DISTANCE) onTap();
  };

  const onPointerCancel = () => {
    startX.current = null;
    setDx(0);
  };

  return { dx, handlers: { onPointerDown, onPointerMove, onPointerUp, onPointerCancel } };
}
