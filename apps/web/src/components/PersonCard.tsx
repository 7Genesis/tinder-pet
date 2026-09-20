// Card do adotante exibido no feed da ONG.
import { housingLabel } from '../domain/labels';
import type { Adopter } from '../domain/types';

interface Props {
  adopter: Adopter;
  petName: string;
}

export function PersonCard({ adopter, petName }: Props) {
  return (
    <article className="card">
      <div className="card-photo photo-person">
        <span className="photo-initial" aria-hidden="true">{adopter.name[0]}</span>
        <span className="chip card-corner">Curtiu o {petName}</span>
      </div>
      <div className="card-body">
        <h2>{adopter.name}, {adopter.age} anos</h2>
        <p className="muted">{adopter.city}. {housingLabel[adopter.housing]}</p>
        <div className="chips">
          {adopter.screenedHome && <span className="chip chip-success">Casa telada</span>}
          {adopter.hasYard && <span className="chip">Quintal</span>}
          <span className="chip">{adopter.otherPets ? 'Tem outros pets' : 'Sem outros pets'}</span>
        </div>
      </div>
    </article>
  );
}
