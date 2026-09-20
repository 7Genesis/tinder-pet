import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Route, Routes } from 'react-router-dom';
import { Chat } from './Chat';
import { Matches } from './Matches';
import { renderWithApp, stateWithSession } from '../test/render';

function chatRoutes() {
  return (
    <Routes>
      <Route path="/matches" element={<Matches />} />
      <Route path="/matches/:matchId" element={<Chat />} />
    </Routes>
  );
}

describe('Matches', () => {
  it('lista as conversas do adotante com o estado do processo', () => {
    renderWithApp(chatRoutes(), { state: stateWithSession('adopter', 'a3'), route: '/matches' });
    expect(screen.getByText('Mia')).toBeInTheDocument();
    expect(screen.getByText('Conversa prévia')).toBeInTheDocument();
  });

  it('mostra estado vazio quando não há conversas', () => {
    renderWithApp(chatRoutes(), { state: stateWithSession('adopter', 'a1'), route: '/matches' });
    expect(screen.getByText(/Nenhuma conversa ainda/)).toBeInTheDocument();
  });
});

describe('Chat', () => {
  it('mostra as mensagens e envia uma nova', async () => {
    renderWithApp(chatRoutes(), { state: stateWithSession('adopter', 'a3'), route: '/matches/match-a3-p2' });
    expect(screen.getByText('Oi, Julia! Vamos conversar sobre a Mia?')).toBeInTheDocument();
    await userEvent.type(screen.getByLabelText('Mensagem'), 'Posso visitar no sábado?');
    await userEvent.click(screen.getByRole('button', { name: 'Enviar' }));
    expect(screen.getByText('Posso visitar no sábado?')).toBeInTheDocument();
  });

  it('bloqueia o acesso de quem não participa do match', () => {
    renderWithApp(chatRoutes(), { state: stateWithSession('adopter', 'a1'), route: '/matches/match-a3-p2' });
    expect(screen.getByText('Conversa indisponível.')).toBeInTheDocument();
  });

  it('permite que a ONG aprove para adoção e conclua', async () => {
    renderWithApp(chatRoutes(), { state: stateWithSession('ong', 'ong1'), route: '/matches/match-a3-p2' });
    await userEvent.click(screen.getByRole('button', { name: 'Aprovar para adoção' }));
    expect(screen.getByText('Etapa: Aprovado para adoção')).toBeInTheDocument();
    await userEvent.click(screen.getByRole('button', { name: 'Marcar como adotado' }));
    expect(screen.getByText('Etapa: Adotado')).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Aprovar para adoção' })).not.toBeInTheDocument();
  });

  it('não oferece ações de aprovação ao adotante, apenas desistir', async () => {
    renderWithApp(chatRoutes(), { state: stateWithSession('adopter', 'a3'), route: '/matches/match-a3-p2' });
    expect(screen.queryByRole('button', { name: 'Aprovar para adoção' })).not.toBeInTheDocument();
    await userEvent.click(screen.getByRole('button', { name: 'Desistir da adoção' }));
    expect(screen.getByText('Etapa: Desistiu')).toBeInTheDocument();
  });
});
