// Provider que mantém o estado com reducer e o persiste no localStorage.
import { useEffect, useMemo, useReducer, type ReactNode } from 'react';
import { createInitialState } from '../data/mock';
import type { AppState } from '../domain/types';
import { AppContext } from './context';
import { reducer } from './reducer';

const STORAGE_KEY = 'tinder-pet-state';

// Lê o estado salvo, devolvendo null quando não existe ou está ilegível.
function load(): AppState | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as AppState) : null;
  } catch {
    return null;
  }
}

interface Props {
  children: ReactNode;
  initialState?: AppState;
  persist?: boolean;
}

export function AppProvider({ children, initialState, persist = true }: Props) {
  const [state, dispatch] = useReducer(
    reducer,
    undefined,
    () => initialState ?? (persist ? load() : null) ?? createInitialState(),
  );

  useEffect(() => {
    if (!persist) return;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch {
      // Armazenamento indisponível: o protótipo continua sem persistir.
    }
  }, [state, persist]);

  const value = useMemo(() => ({ state, dispatch }), [state]);
  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}
