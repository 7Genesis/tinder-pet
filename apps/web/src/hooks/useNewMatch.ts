// Detecta quando um novo match do usuário atual aparece no estado.
import { useEffect, useRef, useState } from 'react';
import type { Match } from '../domain/types';
import { useApp } from '../state/context';

export function useNewMatch(isMine: (match: Match) => boolean) {
  const { state } = useApp();
  const seen = useRef(state.matches.length);
  const filter = useRef(isMine);
  const [fresh, setFresh] = useState<Match | null>(null);

  // Mantém o filtro mais recente e compara a lista de matches com a anterior.
  useEffect(() => {
    filter.current = isMine;
    if (state.matches.length > seen.current) {
      const created = state.matches.slice(seen.current).find(filter.current);
      if (created) setFresh(created);
    }
    seen.current = state.matches.length;
  }, [state.matches, isMine]);

  return { fresh, dismiss: () => setFresh(null) };
}
