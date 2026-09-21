// Estrutura da página: cabeçalho, navegação por papel e proteção de rota.
import { Compass, MessageCircle, PawPrint, PlusCircle, User, Users } from 'lucide-react';
import { NavLink, Navigate, Outlet, useNavigate } from 'react-router-dom';
import type { Role } from '../domain/types';
import { useApp } from '../state/context';

// Redireciona ao login quando a sessão não tem o papel esperado.
export function RequireRole({ role }: { role: Role }) {
  const { state } = useApp();
  if (state.session?.role !== role) return <Navigate to="/" replace />;
  return <Outlet />;
}

export function Shell() {
  const { state, dispatch } = useApp();
  const navigate = useNavigate();
  const role = state.session?.role;

  const logout = () => {
    dispatch({ type: 'logout' });
    navigate('/');
  };

  return (
    <div className="app">
      {role && (
        <header className="header">
          <span className="brand">
            <span className="brand-mark"><PawPrint size={18} aria-hidden="true" /></span>
            Tinder Pet
          </span>
          <button type="button" className="link-button" onClick={logout}>
            Sair
          </button>
        </header>
      )}
      <main className="main">
        <Outlet />
      </main>
      {role === 'adopter' && (
        <nav className="nav" aria-label="Navegação">
          <NavLink to="/adotante" end><Compass size={22} aria-hidden="true" />Descobrir</NavLink>
          <NavLink to="/matches"><MessageCircle size={22} aria-hidden="true" />Conversas</NavLink>
          <NavLink to="/adotante/perfil"><User size={22} aria-hidden="true" />Perfil</NavLink>
        </nav>
      )}
      {role === 'ong' && (
        <nav className="nav" aria-label="Navegação">
          <NavLink to="/ong" end><Users size={22} aria-hidden="true" />Adotantes</NavLink>
          <NavLink to="/matches"><MessageCircle size={22} aria-hidden="true" />Conversas</NavLink>
          <NavLink to="/ong/pets/novo"><PlusCircle size={22} aria-hidden="true" />Novo pet</NavLink>
        </nav>
      )}
    </div>
  );
}
