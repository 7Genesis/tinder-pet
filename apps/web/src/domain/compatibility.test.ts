import { compatibility, meetsRequirements } from './compatibility';
import { createInitialState } from '../data/mock';

const { pets, adopters } = createInitialState();
const thor = pets.find((p) => p.id === 'p1')!;
const mia = pets.find((p) => p.id === 'p2')!;
const bob = pets.find((p) => p.id === 'p3')!;
const marina = adopters.find((a) => a.id === 'a1')!;

describe('meetsRequirements', () => {
  it('aceita pet sem requisitos', () => {
    expect(meetsRequirements(thor, marina)).toBe(true);
  });

  it('exige casa telada quando o pet pede', () => {
    expect(meetsRequirements(mia, { ...marina, screenedHome: false })).toBe(false);
    expect(meetsRequirements(mia, marina)).toBe(true);
  });

  it('exige quintal quando o pet pede', () => {
    expect(meetsRequirements(bob, marina)).toBe(false);
    expect(meetsRequirements(bob, { ...marina, hasYard: true })).toBe(true);
  });
});

describe('compatibility', () => {
  it('pontua 100 quando tudo combina', () => {
    expect(compatibility(thor, marina).score).toBe(100);
  });

  it('perde 40 quando a espécie não combina', () => {
    const prefereGato = { ...marina, preferences: { ...marina.preferences, species: ['gato' as const] } };
    expect(compatibility(thor, prefereGato).score).toBe(60);
  });

  it('trata lista vazia como sem preferência', () => {
    const semPreferencias = { ...marina, preferences: { species: [], sizes: [], temperaments: [] } };
    expect(compatibility(thor, semPreferencias).score).toBe(100);
  });

  it('lista os motivos que combinam', () => {
    const { reasons } = compatibility(thor, marina);
    expect(reasons).toEqual(['Espécie combina', 'Porte combina', 'Temperamento combina']);
  });

  it('informa casa telada quando o pet exige e o adotante tem', () => {
    expect(compatibility(mia, marina).reasons).toContain('Casa telada');
  });
});
