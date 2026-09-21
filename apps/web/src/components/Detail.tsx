// Painel de detalhe aberto ao tocar na foto do card.
import type { ReactNode } from 'react';

interface Props {
  title: string;
  onClose: () => void;
  children: ReactNode;
}

export function Detail({ title, onClose, children }: Props) {
  return (
    <div className="overlay">
      <div className="dialog" role="dialog" aria-label={title}>
        <h2>{title}</h2>
        {children}
        <button type="button" onClick={onClose}>Fechar</button>
      </div>
    </div>
  );
}
