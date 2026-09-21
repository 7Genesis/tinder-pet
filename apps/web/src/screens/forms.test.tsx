import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Route, Routes } from 'react-router-dom';
import { NewPet } from './NewPet';
import { ProfileForm } from './ProfileForm';
import { renderWithApp, stateWithSession } from '../test/render';

describe('ProfileForm', () => {
  it('cria um adotante novo com casa telada e entra no feed', async () => {
    renderWithApp(
      <Routes>
        <Route path="/cadastro" element={<ProfileForm />} />
        <Route path="/adotante" element={<p>Feed do adotante</p>} />
      </Routes>,
      { route: '/cadastro' },
    );
    await userEvent.type(screen.getByLabelText('Nome'), 'Paulo');
    await userEvent.clear(screen.getByLabelText('Idade'));
    await userEvent.type(screen.getByLabelText('Idade'), '33');
    await userEvent.type(screen.getByLabelText('Cidade'), 'Campinas');
    await userEvent.click(screen.getByLabelText('Casa telada'));
    await userEvent.click(screen.getByLabelText('Cão'));
    await userEvent.click(screen.getByRole('button', { name: 'Salvar perfil' }));
    expect(screen.getByText('Feed do adotante')).toBeInTheDocument();
  });

  it('exige nome e cidade', async () => {
    renderWithApp(<ProfileForm />, { route: '/cadastro' });
    await userEvent.click(screen.getByRole('button', { name: 'Salvar perfil' }));
    expect(screen.getByText('Informe seu nome.')).toBeInTheDocument();
    expect(screen.getByText('Informe sua cidade.')).toBeInTheDocument();
  });

  it('carrega o perfil existente para edição', () => {
    renderWithApp(<ProfileForm />, { state: stateWithSession('adopter', 'a1'), route: '/adotante/perfil' });
    expect(screen.getByLabelText('Nome')).toHaveValue('Marina');
    expect(screen.getByLabelText('Casa telada')).toBeChecked();
  });
});

describe('NewPet', () => {
  it('cadastra um pet da ONG e volta ao feed', async () => {
    renderWithApp(
      <Routes>
        <Route path="/ong/pets/novo" element={<NewPet />} />
        <Route path="/ong" element={<p>Feed da ONG</p>} />
      </Routes>,
      { state: stateWithSession('ong', 'ong1'), route: '/ong/pets/novo' },
    );
    await userEvent.type(screen.getByLabelText('Nome do pet'), 'Rex');
    await userEvent.type(screen.getByLabelText('Descrição'), 'Muito dócil.');
    await userEvent.click(screen.getByLabelText('Exige casa telada'));
    await userEvent.click(screen.getByRole('button', { name: 'Cadastrar pet' }));
    expect(screen.getByText('Feed da ONG')).toBeInTheDocument();
  });

  it('exige o nome do pet', async () => {
    renderWithApp(<NewPet />, { state: stateWithSession('ong', 'ong1'), route: '/ong/pets/novo' });
    await userEvent.click(screen.getByRole('button', { name: 'Cadastrar pet' }));
    expect(screen.getByText('Informe o nome do pet.')).toBeInTheDocument();
  });
});
