import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Detail } from './Detail';
import { PersonCard } from './PersonCard';
import { PetCard } from './PetCard';
import { SwipeActions } from './SwipeActions';
import { createInitialState } from '../data/mock';

const { pets, adopters } = createInitialState();

describe('PetCard', () => {
  it('mostra dados do pet, da ONG e a compatibilidade', () => {
    render(<PetCard pet={pets[0]} ongName="Patas do Bem" compatibility={{ score: 92, reasons: ['Porte combina'] }} />);
    expect(screen.getByText('Thor, 2 anos')).toBeInTheDocument();
    expect(screen.getByText('92% compatível')).toBeInTheDocument();
    expect(screen.getByText('Porte combina')).toBeInTheDocument();
    expect(screen.getByText(/Patas do Bem/)).toBeInTheDocument();
  });
});

describe('PersonCard', () => {
  it('mostra o adotante, o pet curtido e as etiquetas de moradia', () => {
    render(<PersonCard adopter={adopters[0]} petName="Thor" />);
    expect(screen.getByText('Marina, 29 anos')).toBeInTheDocument();
    expect(screen.getByText('Curtiu o Thor')).toBeInTheDocument();
    expect(screen.getByText('Casa telada')).toBeInTheDocument();
  });
});

describe('SwipeActions', () => {
  it('chama os callbacks dos botões', async () => {
    const onLeft = vi.fn();
    const onRight = vi.fn();
    render(<SwipeActions leftLabel="Passar" rightLabel="Curtir" onLeft={onLeft} onRight={onRight} />);
    await userEvent.click(screen.getByRole('button', { name: 'Passar' }));
    await userEvent.click(screen.getByRole('button', { name: 'Curtir' }));
    expect(onLeft).toHaveBeenCalledTimes(1);
    expect(onRight).toHaveBeenCalledTimes(1);
  });
});

describe('Detail', () => {
  it('exibe o conteúdo e fecha pelo botão', async () => {
    const onClose = vi.fn();
    render(<Detail title="Thor" onClose={onClose}>Conteúdo</Detail>);
    expect(screen.getByRole('dialog', { name: 'Thor' })).toBeInTheDocument();
    await userEvent.click(screen.getByRole('button', { name: 'Fechar' }));
    expect(onClose).toHaveBeenCalledTimes(1);
  });
});
