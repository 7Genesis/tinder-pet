// Aviso de match com atalho para abrir a conversa.
import { Link } from 'react-router-dom';
import type { Match } from '../domain/types';

interface Props {
  match: Match;
  subtitle: string;
  onClose: () => void;
}

export function MatchOverlay({ match, subtitle, onClose }: Props) {
  return (
    <div className="overlay">
      <div className="dialog match-dialog" role="dialog" aria-label="Deu match">
        <h2>Deu match</h2>
        <p>{subtitle}</p>
        <Link className="button-link" to={`/matches/${match.id}`} onClick={onClose}>Abrir conversa</Link>
        <button type="button" onClick={onClose}>Continuar</button>
      </div>
    </div>
  );
}
