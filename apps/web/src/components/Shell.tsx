// Estrutura da página: cabeçalho, navegação por papel e proteção de rota.
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
      <header className="header">
        <strong>Tinder Pet</strong>
        {role && (
          <button type="button" className="link-button" onClick={logout}>
            Sair
          </button>
        )}
      </header>
      <main className="main">
        <Outlet />
      </main>
      {role === 'adopter' && (
        <nav className="nav" aria-label="Navegação">
          <NavLink to="/adotante" end>Descobrir</NavLink>
          <NavLink to="/matches">Conversas</NavLink>
          <NavLink to="/adotante/perfil">Perfil</NavLink>
        </nav>
      )}
      {role === 'ong' && (
        <nav className="nav" aria-label="Navegação">
          <NavLink to="/ong" end>Adotantes</NavLink>
          <NavLink to="/matches">Conversas</NavLink>
          <NavLink to="/ong/pets/novo">Novo pet</NavLink>
        </nav>
      )}
    </div>
  );
}
