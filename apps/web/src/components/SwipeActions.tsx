// Botões de esquerda e direita, alternativa acessível ao gesto de arrastar.
import { Check, Heart, X } from 'lucide-react';

interface Props {
  leftLabel: string;
  rightLabel: string;
  onLeft: () => void;
  onRight: () => void;
}

export function SwipeActions({ leftLabel, rightLabel, onLeft, onRight }: Props) {
  // A ONG aceita com um visto e o adotante curte com um coração.
  const RightIcon = rightLabel === 'Aceitar' ? Check : Heart;
  return (
    <div className="swipe-actions">
      <button type="button" className="action-left" onClick={onLeft}>
        <span className="action-icon"><X size={28} strokeWidth={2.25} aria-hidden="true" /></span>
        {leftLabel}
      </button>
      <button type="button" className="action-right" onClick={onRight}>
        <span className="action-icon"><RightIcon size={28} strokeWidth={2.25} aria-hidden="true" /></span>
        {rightLabel}
      </button>
    </div>
  );
}
