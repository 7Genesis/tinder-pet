// Cadastro e edição do perfil do adotante, incluindo moradia, casa telada e preferências.
import { useState, type FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { sizeLabel, speciesLabel, temperamentLabel } from '../domain/labels';
import type { Adopter, Size, Species, Temperament } from '../domain/types';
import { useApp } from '../state/context';

// Alterna um valor dentro de uma lista de preferências.
function toggle<T>(list: T[], value: T): T[] {
  return list.includes(value) ? list.filter((v) => v !== value) : [...list, value];
}

export function ProfileForm() {
  const { state, dispatch } = useApp();
  const navigate = useNavigate();
  const existing = state.adopters.find((a) => a.id === state.session?.userId && state.session?.role === 'adopter');

  const [name, setName] = useState(existing?.name ?? '');
  const [age, setAge] = useState(existing?.age ?? 18);
  const [city, setCity] = useState(existing?.city ?? '');
  const [housing, setHousing] = useState<Adopter['housing']>(existing?.housing ?? 'apartamento');
  const [screenedHome, setScreenedHome] = useState(existing?.screenedHome ?? false);
  const [hasYard, setHasYard] = useState(existing?.hasYard ?? false);
  const [otherPets, setOtherPets] = useState(existing?.otherPets ?? false);
  const [description, setDescription] = useState(existing?.description ?? '');
  const [species, setSpecies] = useState<Species[]>(existing?.preferences.species ?? []);
  const [sizes, setSizes] = useState<Size[]>(existing?.preferences.sizes ?? []);
  const [temperaments, setTemperaments] = useState<Temperament[]>(existing?.preferences.temperaments ?? []);
  const [errors, setErrors] = useState<{ name?: string; city?: string }>({});

  const submit = (event: FormEvent) => {
    event.preventDefault();
    const found: { name?: string; city?: string } = {};
    if (!name.trim()) found.name = 'Informe seu nome.';
    if (!city.trim()) found.city = 'Informe sua cidade.';
    setErrors(found);
    if (Object.keys(found).length > 0) return;

    const id = existing?.id ?? `a${state.adopters.length + 1}`;
    const adopter: Adopter = {
      id,
      name: name.trim(),
      age,
      city: city.trim(),
      housing,
      screenedHome,
      hasYard,
      otherPets,
      description: description.trim(),
      preferences: { species, sizes, temperaments },
    };
    dispatch({ type: 'saveAdopter', adopter });
    dispatch({ type: 'login', role: 'adopter', userId: id });
    navigate('/adotante');
  };

  return (
    <form className="form" onSubmit={submit} noValidate>
      {!existing && <Link to="/" className="link-button">Voltar ao login</Link>}
      <h1>{existing ? 'Seu perfil' : 'Criar perfil'}</h1>

      <label htmlFor="nome">Nome</label>
      <input id="nome" type="text" value={name} onChange={(e) => setName(e.target.value)} />
      {errors.name && <p className="field-error" role="alert">{errors.name}</p>}

      <label htmlFor="idade">Idade</label>
      <input id="idade" type="number" min={18} value={age} onChange={(e) => setAge(Number(e.target.value))} />

      <label htmlFor="cidade">Cidade</label>
      <input id="cidade" type="text" value={city} onChange={(e) => setCity(e.target.value)} />
      {errors.city && <p className="field-error" role="alert">{errors.city}</p>}

      <label htmlFor="moradia">Moradia</label>
      <select id="moradia" value={housing} onChange={(e) => setHousing(e.target.value as Adopter['housing'])}>
        <option value="apartamento">Apartamento</option>
        <option value="casa">Casa</option>
      </select>

      <label className="check"><input type="checkbox" checked={screenedHome} onChange={(e) => setScreenedHome(e.target.checked)} />Casa telada</label>
      <label className="check"><input type="checkbox" checked={hasYard} onChange={(e) => setHasYard(e.target.checked)} />Tenho quintal</label>
      <label className="check"><input type="checkbox" checked={otherPets} onChange={(e) => setOtherPets(e.target.checked)} />Tenho outros pets</label>

      <label htmlFor="descricao">Sobre você</label>
      <textarea id="descricao" rows={3} value={description} onChange={(e) => setDescription(e.target.value)} />

      <fieldset>
        <legend>Espécies de interesse</legend>
        {(Object.keys(speciesLabel) as Species[]).map((value) => (
          <label key={value} className="check">
            <input type="checkbox" checked={species.includes(value)} onChange={() => setSpecies(toggle(species, value))} />
            {speciesLabel[value]}
          </label>
        ))}
      </fieldset>

      <fieldset>
        <legend>Portes de interesse</legend>
        {(Object.keys(sizeLabel) as Size[]).map((value) => (
          <label key={value} className="check">
            <input type="checkbox" checked={sizes.includes(value)} onChange={() => setSizes(toggle(sizes, value))} />
            {sizeLabel[value]}
          </label>
        ))}
      </fieldset>

      <fieldset>
        <legend>Temperamentos de interesse</legend>
        {(Object.keys(temperamentLabel) as Temperament[]).map((value) => (
          <label key={value} className="check">
            <input type="checkbox" checked={temperaments.includes(value)} onChange={() => setTemperaments(toggle(temperaments, value))} />
            {temperamentLabel[value]}
          </label>
        ))}
      </fieldset>

      <button type="submit" className="primary">Salvar perfil</button>
    </form>
  );
}
