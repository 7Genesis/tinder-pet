// Feed da ONG: mostra um adotante por vez entre quem curtiu um pet da ONG.
import { useState } from 'react';
import { Detail } from '../components/Detail';
import { MatchOverlay } from '../components/MatchOverlay';
import { PersonCard } from '../components/PersonCard';
import { SwipeActions } from '../components/SwipeActions';
import { SwipeCard } from '../components/SwipeCard';
import { currentTime } from '../domain/clock';
import { housingLabel, sizeLabel, speciesLabel, temperamentLabel } from '../domain/labels';
import { ongQueue } from '../domain/matching';
import type { Direction } from '../domain/types';
import { useNewMatch } from '../hooks/useNewMatch';
import { useApp } from '../state/context';

export function OngFeed() {
  const { state, dispatch } = useApp();
  const [detailOpen, setDetailOpen] = useState(false);
  const ongId = state.session?.userId ?? '';
  const { fresh, dismiss } = useNewMatch((m) => m.ongId === ongId);

  const current = ongQueue(state.adopterDecisions, state.ongDecisions, state.pets, ongId, currentTime())[0];
  const adopter = current && state.adopters.find((a) => a.id === current.adopterId);
  const pet = current && state.pets.find((p) => p.id === current.petId);

  const swipe = (direction: Direction) => {
    if (!current) return;
    dispatch({ type: 'swipeOng', adopterId: current.adopterId, petId: current.petId, direction, now: currentTime() });
  };

  return (
    <section className="feed">
      {adopter && pet ? (
        <>
          <SwipeCard key={`${adopter.id}-${pet.id}`} onSwipe={swipe} onTap={() => setDetailOpen(true)}>
            <PersonCard adopter={adopter} petName={pet.name} />
          </SwipeCard>
          <button type="button" className="link-button" onClick={() => setDetailOpen(true)}>
            Ver detalhes
          </button>
          <SwipeActions leftLabel="Recusar" rightLabel="Aceitar" onLeft={() => swipe('left')} onRight={() => swipe('right')} />
          {detailOpen && (
            <Detail title={adopter.name} onClose={() => setDetailOpen(false)}>
              <p>{adopter.description}</p>
              <p className="muted">
                {adopter.city}. {housingLabel[adopter.housing]}. {adopter.screenedHome ? 'Casa telada' : 'Sem tela de proteção'}.{' '}
                {adopter.hasYard ? 'Com quintal' : 'Sem quintal'}. {adopter.otherPets ? 'Tem outros pets' : 'Sem outros pets'}.
              </p>
              <p className="muted">
                Pet de interesse: {pet.name} ({speciesLabel[pet.species]}, {sizeLabel[pet.size]}, {temperamentLabel[pet.temperament]}).
              </p>
            </Detail>
          )}
        </>
      ) : (
        <p className="empty">Nenhum adotante aguardando avaliação.</p>
      )}
      {fresh && (
        <MatchOverlay
          match={fresh}
          subtitle={`${state.adopters.find((a) => a.id === fresh.adopterId)?.name ?? 'O adotante'} também curtiu ${state.pets.find((p) => p.id === fresh.petId)?.name ?? 'o pet'}.`}
          onClose={dismiss}
        />
      )}
    </section>
  );
}
