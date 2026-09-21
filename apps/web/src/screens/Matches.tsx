// Lista as conversas do usuário atual, uma por match.
import { MessageCircle } from 'lucide-react';
import { Link } from 'react-router-dom';
import { stageLabel } from '../domain/labels';
import { useApp } from '../state/context';

export function Matches() {
  const { state } = useApp();
  const session = state.session;

  const mine = state.matches.filter((m) =>
    session?.role === 'adopter' ? m.adopterId === session.userId : m.ongId === session?.userId,
  );

  return (
    <section>
      <h1>Conversas</h1>
      {mine.length === 0 && (
        <div className="empty">
          <span className="empty-icon"><MessageCircle size={26} aria-hidden="true" /></span>
          <p>Nenhuma conversa ainda. Ela abre depois do match.</p>
        </div>
      )}
      {mine.map((m) => {
        const pet = state.pets.find((p) => p.id === m.petId);
        const adopter = state.adopters.find((a) => a.id === m.adopterId);
        const title = session?.role === 'adopter' ? pet?.name : adopter?.name;
        const subtitle =
          session?.role === 'adopter'
            ? `ONG ${state.ongs.find((o) => o.id === m.ongId)?.name ?? ''}`
            : `Pet ${pet?.name ?? ''}`;
        return (
          <Link key={m.id} className="list-item" to={`/matches/${m.id}`}>
            <strong>{title}</strong>
            <div className="muted">{subtitle}</div>
            <div className="chip chip-stage">{stageLabel[m.stage]}</div>
          </Link>
        );
      })}
    </section>
  );
}
