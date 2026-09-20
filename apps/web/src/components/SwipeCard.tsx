// Envolve um card para que possa ser arrastado, inclinado e solto para decidir.
import type { ReactNode } from 'react';
import type { Direction } from '../domain/types';
import { SWIPE_THRESHOLD, useSwipe } from '../hooks/useSwipe';

interface Props {
  onSwipe: (direction: Direction) => void;
  onTap: () => void;
  children: ReactNode;
}

export function SwipeCard({ onSwipe, onTap, children }: Props) {
  const { dx, handlers } = useSwipe(onSwipe, onTap);
  const style = { transform: `translateX(${dx}px) rotate(${dx / 20}deg)` };
  return (
    <div className="swipe-card" style={style} {...handlers}>
      {dx >= SWIPE_THRESHOLD && <span className="swipe-badge swipe-badge-right">Sim</span>}
      {dx <= -SWIPE_THRESHOLD && <span className="swipe-badge swipe-badge-left">Não</span>}
      {children}
    </div>
  );
}
