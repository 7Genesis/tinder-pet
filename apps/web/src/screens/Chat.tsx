// Conversa prévia de um match, com painel do processo de adoção.
import { useState, type FormEvent } from 'react';
import { Link, useParams } from 'react-router-dom';
import { currentTime } from '../domain/clock';
import { stageLabel } from '../domain/labels';
import { canAdvance } from '../domain/matching';
import { useApp } from '../state/context';

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
    <section>
      <Link to="/matches" className="link-button">Voltar</Link>
      <h1>{isOng ? adopter?.name : pet?.name}</h1>
      <p className="muted">{isOng ? `Sobre o pet ${pet?.name}` : `Conversa com a ONG sobre ${pet?.name}`}</p>

      <div className="stage-panel">
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

      <form className="form" onSubmit={send}>
        <label htmlFor="mensagem">Mensagem</label>
        <input id="mensagem" type="text" value={text} onChange={(e) => setText(e.target.value)} />
        <button type="submit" className="primary">Enviar</button>
      </form>
    </section>
  );
}
