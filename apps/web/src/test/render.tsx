// Helpers para renderizar componentes com provider e roteador nos testes.
import { render } from '@testing-library/react';
import type { ReactElement } from 'react';
import { MemoryRouter } from 'react-router-dom';
import { createInitialState } from '../data/mock';
import type { AppState, Role } from '../domain/types';
import { AppProvider } from '../state/AppProvider';

// Estado inicial já com uma sessão aberta.
export function stateWithSession(role: Role, userId: string): AppState {
  return { ...createInitialState(), session: { role, userId } };
}

interface Options {
  state?: AppState;
  route?: string;
}

export function renderWithApp(ui: ReactElement, { state, route = '/' }: Options = {}) {
  return render(
    <MemoryRouter initialEntries={[route]}>
      <AppProvider initialState={state ?? createInitialState()} persist={false}>
        {ui}
      </AppProvider>
    </MemoryRouter>,
  );
}
