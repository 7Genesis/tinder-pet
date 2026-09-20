// Contexto do aplicativo e o hook para acessar estado e dispatch.
import { createContext, useContext, type Dispatch } from 'react';
import type { AppState } from '../domain/types';
import type { Action } from './reducer';

export interface AppContextValue {
  state: AppState;
  dispatch: Dispatch<Action>;
}

export const AppContext = createContext<AppContextValue | null>(null);

export function useApp(): AppContextValue {
  const value = useContext(AppContext);
  if (!value) throw new Error('useApp deve ser usado dentro do AppProvider');
  return value;
}
