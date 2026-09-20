// Card do pet exibido no feed do adotante.
import { sizeLabel, temperamentLabel } from '../domain/labels';
import type { Pet } from '../domain/types';

interface Props {
  pet: Pet;
  ongName: string;
  compatibility: { score: number; reasons: string[] };
}

export function PetCard({ pet, ongName, compatibility }: Props) {
  return (
    <article className="card">
      <div className="card-photo photo-pet">
        <span className="photo-initial" aria-hidden="true">{pet.name[0]}</span>
        <span className="chip chip-success card-corner">{compatibility.score}% compatível</span>
      </div>
      <div className="card-body">
        <h2>{pet.name}, {pet.ageYears} {pet.ageYears === 1 ? 'ano' : 'anos'}</h2>
        <p className="muted">{sizeLabel[pet.size]}, {temperamentLabel[pet.temperament].toLowerCase()}. {ongName}</p>
        <div className="chips">
          {compatibility.reasons.map((reason) => (
            <span key={reason} className="chip">{reason}</span>
          ))}
        </div>
      </div>
    </article>
  );
}
