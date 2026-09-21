// Feed do adotante: mostra um pet por vez, com swipe para curtir ou passar.
import { PawPrint } from 'lucide-react';
import { useState } from 'react';
import { Detail } from '../components/Detail';
import { MatchOverlay } from '../components/MatchOverlay';
import { PetCard } from '../components/PetCard';
import { SwipeActions } from '../components/SwipeActions';
import { SwipeCard } from '../components/SwipeCard';
import { currentTime } from '../domain/clock';
import { compatibility } from '../domain/compatibility';
import { housingLabel, sizeLabel, speciesLabel, temperamentLabel } from '../domain/labels';
import { adopterFeed } from '../domain/matching';
import type { Direction } from '../domain/types';
import { useNewMatch } from '../hooks/useNewMatch';
import { useApp } from '../state/context';

export function AdopterFeed() {
  const { state, dispatch } = useApp();
  const [detailOpen, setDetailOpen] = useState(false);
  const adopter = state.adopters.find((a) => a.id === state.session?.userId);
  const { fresh, dismiss } = useNewMatch((m) => m.adopterId === adopter?.id);

  if (!adopter) return <p>Perfil não encontrado.</p>;

  const pet = adopterFeed(state.pets, adopter, state.adopterDecisions, currentTime())[0];
  const ong = pet && state.ongs.find((o) => o.id === pet.ongId);

  const swipe = (direction: Direction) => {
    if (!pet) return;
    dispatch({ type: 'swipeAdopter', adopterId: adopter.id, petId: pet.id, direction, now: currentTime() });
  };

  return (
    <section className="feed">
      {pet && ong ? (
        <>
          <SwipeCard key={pet.id} onSwipe={swipe} onTap={() => setDetailOpen(true)}>
            <PetCard pet={pet} ongName={ong.name} compatibility={compatibility(pet, adopter)} />
          </SwipeCard>
          <button type="button" className="link-button" onClick={() => setDetailOpen(true)}>
            Ver detalhes
          </button>
          <SwipeActions leftLabel="Passar" rightLabel="Curtir" onLeft={() => swipe('left')} onRight={() => swipe('right')} />
          {detailOpen && (
            <Detail title={pet.name} onClose={() => setDetailOpen(false)}>
              <p>{pet.description}</p>
              <p className="muted">
                {speciesLabel[pet.species]}, {sizeLabel[pet.size]}, {temperamentLabel[pet.temperament]}. ONG {ong.name}, {ong.city}.
              </p>
              <p className="muted">
                Requisitos: {[pet.requiresScreenedHome && 'casa telada', pet.requiresYard && 'quintal'].filter(Boolean).join(', ') || 'nenhum'}.
                Seu perfil: {housingLabel[adopter.housing].toLowerCase()}.
              </p>
            </Detail>
          )}
        </>
      ) : (
        <div className="empty">
          <span className="empty-icon"><PawPrint size={26} aria-hidden="true" /></span>
          <p>Não há pets novos por agora. Volte mais tarde.</p>
        </div>
      )}
      {fresh && (
        <MatchOverlay
          match={fresh}
          subtitle={`Você e a ONG curtiram ${state.pets.find((p) => p.id === fresh.petId)?.name ?? 'o pet'}.`}
          onClose={dismiss}
        />
      )}
    </section>
  );
}
