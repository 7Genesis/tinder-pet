// Rótulos em português para exibir valores de domínio na interface.
import type { MatchStage, Size, Species, Temperament } from './types';

export const speciesLabel: Record<Species, string> = { cao: 'Cão', gato: 'Gato' };

export const sizeLabel: Record<Size, string> = {
  pequeno: 'Pequeno',
  medio: 'Médio',
  grande: 'Grande',
};

export const temperamentLabel: Record<Temperament, string> = {
  calmo: 'Calmo',
  brincalhao: 'Brincalhão',
  independente: 'Independente',
};

export const housingLabel: Record<'apartamento' | 'casa', string> = {
  apartamento: 'Apartamento',
  casa: 'Casa',
};

export const stageLabel: Record<MatchStage, string> = {
  conversa_previa: 'Conversa prévia',
  aprovado_para_adocao: 'Aprovado para adoção',
  adotado: 'Adotado',
  desistiu: 'Desistiu',
};
