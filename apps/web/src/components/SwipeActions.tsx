// Botões de esquerda e direita, alternativa acessível ao gesto de arrastar.
interface Props {
  leftLabel: string;
  rightLabel: string;
  onLeft: () => void;
  onRight: () => void;
}

export function SwipeActions({ leftLabel, rightLabel, onLeft, onRight }: Props) {
  return (
    <div className="swipe-actions">
      <button type="button" className="action-left" onClick={onLeft}>
        {leftLabel}
      </button>
      <button type="button" className="action-right" onClick={onRight}>
        {rightLabel}
      </button>
    </div>
  );
}
