// Conversa prévia de um match, com painel do processo de adoção.
import { ArrowLeft, Send } from 'lucide-react';
import { useState, type FormEvent } from 'react';
import { Link, useParams } from 'react-router-dom';
import { currentTime } from '../domain/clock';
import { stageLabel } from '../domain/labels';
import type { MatchStage } from '../domain/types';
import { canAdvance } from '../domain/matching';
import { useApp } from '../state/context';

const STEPS: MatchStage[] = ['conversa_previa', 'aprovado_para_adocao', 'adotado'];

// Marca cada etapa do processo como concluída, atual ou pendente.
function stepClass(step: MatchStage, current: MatchStage): string {
  const at = STEPS.indexOf(current);
  const index = STEPS.indexOf(step);
  if (at === -1) return '';
  if (index < at) return 'done';
  return index === at ? 'current' : '';
}

export function Chat() {
  const { matchId } = useParams();
  const { state, dispatch } = useApp();
  const [text, setText] = useState('');
  const session = state.session;

  const match = state.matches.find((m) => m.id === matchId);
  const participates =
    match && session && (session.role === 'adopter' ? match.adopterId === session.userId : match.ongId === session.userId);

  if (!match || !session || !participates) return <p className="empty">Conversa indisponível.</p>;

  const pet = state.pets.find((p) => p.id === match.petId);
  const adopter = state.adopters.find((a) => a.id === match.adopterId);
  const messages = state.messages.filter((m) => m.matchId === match.id);
  const isOng = session.role === 'ong';

  const send = (event: FormEvent) => {
    event.preventDefault();
    dispatch({ type: 'sendMessage', matchId: match.id, from: session.role, text, now: currentTime() });
    setText('');
  };

  return (
    <section className="chat">
      <div className="chat-head">
        <Link to="/matches" className="link-button" aria-label="Voltar"><ArrowLeft size={22} aria-hidden="true" /></Link>
        <h1>{isOng ? adopter?.name : pet?.name}</h1>
      </div>
      <p className="muted">{isOng ? `Sobre o pet ${pet?.name}` : `Conversa com a ONG sobre ${pet?.name}`}</p>

      <div className="stage-panel">
        <ol className="stepper" aria-hidden="true">
          {STEPS.map((step) => (
            <li key={step} className={stepClass(step, match.stage)}>{stageLabel[step]}</li>
          ))}
        </ol>
        <p>Etapa: {stageLabel[match.stage]}</p>
        {isOng && canAdvance(match.stage, 'aprovado_para_adocao') && (
          <button type="button" onClick={() => dispatch({ type: 'setStage', matchId: match.id, stage: 'aprovado_para_adocao' })}>
            Aprovar para adoção
          </button>
        )}
        {isOng && canAdvance(match.stage, 'adotado') && (
          <button type="button" onClick={() => dispatch({ type: 'setStage', matchId: match.id, stage: 'adotado' })}>
            Marcar como adotado
          </button>
        )}
        {canAdvance(match.stage, 'desistiu') && (
          <button type="button" onClick={() => dispatch({ type: 'setStage', matchId: match.id, stage: 'desistiu' })}>
            {isOng ? 'Encerrar processo' : 'Desistir da adoção'}
          </button>
        )}
      </div>

      <div className="messages">
        {messages.map((m) => (
          <div key={m.id} className={m.from === session.role ? 'bubble bubble-mine' : 'bubble'}>
            {m.text}
          </div>
        ))}
      </div>

      <form className="chat-form" onSubmit={send}>
        <label htmlFor="mensagem" className="sr-only">Mensagem</label>
        <input id="mensagem" type="text" placeholder="Escreva uma mensagem" value={text} onChange={(e) => setText(e.target.value)} />
        <button type="submit" className="primary" aria-label="Enviar"><Send size={20} aria-hidden="true" /></button>
      </form>
    </section>
  );
}
