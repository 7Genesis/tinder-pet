// Card do pet exibido no feed do adotante, com o nome sobre a foto.
import { Cat, Dog } from 'lucide-react';
import { sizeLabel, temperamentLabel } from '../domain/labels';
import type { Pet } from '../domain/types';

interface Props {
  pet: Pet;
  ongName: string;
  compatibility: { score: number; reasons: string[] };
}

export function PetCard({ pet, ongName, compatibility }: Props) {
  const Icon = pet.species === 'gato' ? Cat : Dog;
  return (
    <article className="card">
      <div className={`card-photo ${pet.species === 'gato' ? 'photo-cat' : 'photo-dog'}`}>
        <Icon className="photo-art" size={120} strokeWidth={1.25} aria-hidden="true" />
        <span className="chip chip-success card-corner">{compatibility.score}% compatível</span>
      </div>
      <div className="card-info">
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
