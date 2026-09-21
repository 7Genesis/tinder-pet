// Cadastro de pet feito pela ONG, com os requisitos exigidos dos adotantes.
import { useState, type FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { sizeLabel, speciesLabel, temperamentLabel } from '../domain/labels';
import type { Size, Species, Temperament } from '../domain/types';
import { useApp } from '../state/context';

export function NewPet() {
  const { state, dispatch } = useApp();
  const navigate = useNavigate();
  const ongId = state.session?.userId ?? '';

  const [name, setName] = useState('');
  const [species, setSpecies] = useState<Species>('cao');
  const [size, setSize] = useState<Size>('medio');
  const [ageYears, setAgeYears] = useState(1);
  const [temperament, setTemperament] = useState<Temperament>('calmo');
  const [description, setDescription] = useState('');
  const [requiresScreenedHome, setRequiresScreenedHome] = useState(false);
  const [requiresYard, setRequiresYard] = useState(false);
  const [error, setError] = useState('');

  const submit = (event: FormEvent) => {
    event.preventDefault();
    if (!name.trim()) {
      setError('Informe o nome do pet.');
      return;
    }
    dispatch({
      type: 'addPet',
      pet: {
        id: `p${state.pets.length + 1}`,
        ongId,
        name: name.trim(),
        species,
        size,
        ageYears,
        temperament,
        description: description.trim(),
        requiresScreenedHome,
        requiresYard,
        status: 'disponivel',
      },
    });
    navigate('/ong');
  };

  return (
    <form className="form" onSubmit={submit} noValidate>
      <h1>Novo pet</h1>

      <label htmlFor="pet-nome">Nome do pet</label>
      <input id="pet-nome" type="text" value={name} onChange={(e) => setName(e.target.value)} />
      {error && <p className="field-error" role="alert">{error}</p>}

      <label htmlFor="pet-especie">Espécie</label>
      <select id="pet-especie" value={species} onChange={(e) => setSpecies(e.target.value as Species)}>
        {(Object.keys(speciesLabel) as Species[]).map((v) => <option key={v} value={v}>{speciesLabel[v]}</option>)}
      </select>

      <label htmlFor="pet-porte">Porte</label>
      <select id="pet-porte" value={size} onChange={(e) => setSize(e.target.value as Size)}>
        {(Object.keys(sizeLabel) as Size[]).map((v) => <option key={v} value={v}>{sizeLabel[v]}</option>)}
      </select>

      <label htmlFor="pet-idade">Idade em anos</label>
      <input id="pet-idade" type="number" min={0} value={ageYears} onChange={(e) => setAgeYears(Number(e.target.value))} />

      <label htmlFor="pet-temperamento">Temperamento</label>
      <select id="pet-temperamento" value={temperament} onChange={(e) => setTemperament(e.target.value as Temperament)}>
        {(Object.keys(temperamentLabel) as Temperament[]).map((v) => <option key={v} value={v}>{temperamentLabel[v]}</option>)}
      </select>

      <label htmlFor="pet-descricao">Descrição</label>
      <textarea id="pet-descricao" rows={3} value={description} onChange={(e) => setDescription(e.target.value)} />

      <label className="check"><input type="checkbox" checked={requiresScreenedHome} onChange={(e) => setRequiresScreenedHome(e.target.checked)} />Exige casa telada</label>
      <label className="check"><input type="checkbox" checked={requiresYard} onChange={(e) => setRequiresYard(e.target.checked)} />Exige quintal</label>

      <button type="submit" className="primary">Cadastrar pet</button>
    </form>
  );
}
