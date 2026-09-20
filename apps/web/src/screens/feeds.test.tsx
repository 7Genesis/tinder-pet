import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { AdopterFeed } from './AdopterFeed';
import { Login } from './Login';
import { OngFeed } from './OngFeed';
import { renderWithApp, stateWithSession } from '../test/render';

describe('Login', () => {
  it('lista os perfis de demonstração', () => {
    renderWithApp(<Login />);
    expect(screen.getByRole('button', { name: /Marina/ })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Patas do Bem/ })).toBeInTheDocument();
  });
});

describe('AdopterFeed', () => {
  it('mostra o pet mais compatível primeiro', () => {
    renderWithApp(<AdopterFeed />, { state: stateWithSession('adopter', 'a1') });
    expect(screen.getByText('Thor, 2 anos')).toBeInTheDocument();
    expect(screen.getByText('100% compatível')).toBeInTheDocument();
  });

  it('avança para o próximo pet ao curtir', async () => {
    renderWithApp(<AdopterFeed />, { state: stateWithSession('adopter', 'a1') });
    await userEvent.click(screen.getByRole('button', { name: 'Curtir' }));
    expect(screen.queryByText('Thor, 2 anos')).not.toBeInTheDocument();
    expect(screen.getByText('Nina, 5 anos')).toBeInTheDocument();
  });

  it('não mostra pet que exige quintal para quem não tem', async () => {
    renderWithApp(<AdopterFeed />, { state: stateWithSession('adopter', 'a1') });
    for (let i = 0; i < 6; i += 1) {
      const pass = screen.queryByRole('button', { name: 'Passar' });
      if (!pass) break;
      expect(screen.queryByText(/Bob/)).not.toBeInTheDocument();
      await userEvent.click(pass);
    }
    expect(screen.getByText(/Não há pets novos/)).toBeInTheDocument();
  });

  it('abre o detalhe ao tocar no botão de detalhes', async () => {
    renderWithApp(<AdopterFeed />, { state: stateWithSession('adopter', 'a1') });
    await userEvent.click(screen.getByRole('button', { name: 'Ver detalhes' }));
    expect(screen.getByRole('dialog', { name: 'Thor' })).toBeInTheDocument();
    expect(screen.getByText(/Adora correr e brincar de bola/)).toBeInTheDocument();
  });

  it('avisa o match quando a ONG já tinha curtido o adotante', async () => {
    const state = stateWithSession('adopter', 'a1');
    state.ongDecisions.push({ adopterId: 'a1', petId: 'p1', direction: 'right', at: 1 });
    renderWithApp(<AdopterFeed />, { state });
    await userEvent.click(screen.getByRole('button', { name: 'Curtir' }));
    expect(screen.getByRole('dialog', { name: 'Deu match' })).toBeInTheDocument();
  });
});

describe('OngFeed', () => {
  it('mostra o primeiro adotante que curtiu um pet da ONG', () => {
    renderWithApp(<OngFeed />, { state: stateWithSession('ong', 'ong1') });
    expect(screen.getByText('Carlos, 41 anos')).toBeInTheDocument();
    expect(screen.getByText('Curtiu o Thor')).toBeInTheDocument();
  });

  it('aceita e avança para o próximo adotante', async () => {
    renderWithApp(<OngFeed />, { state: stateWithSession('ong', 'ong1') });
    await userEvent.click(screen.getByRole('button', { name: 'Aceitar' }));
    expect(screen.queryByText('Carlos, 41 anos')).not.toBeInTheDocument();
    expect(screen.getByText('Julia, 34 anos')).toBeInTheDocument();
  });

  it('mostra o perfil completo no detalhe', async () => {
    renderWithApp(<OngFeed />, { state: stateWithSession('ong', 'ong1') });
    await userEvent.click(screen.getByRole('button', { name: 'Ver detalhes' }));
    expect(screen.getByText(/Família com quintal grande/)).toBeInTheDocument();
  });

  it('mostra estado vazio quando não há adotantes', async () => {
    renderWithApp(<OngFeed />, { state: stateWithSession('ong', 'ong2') });
    await userEvent.click(screen.getByRole('button', { name: 'Recusar' }));
    expect(screen.getByText(/Nenhum adotante aguardando/)).toBeInTheDocument();
  });
});
