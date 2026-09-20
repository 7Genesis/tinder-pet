// Login simulado: escolhe um perfil de demonstração ou abre o cadastro de adotante.
import { Link, useNavigate } from 'react-router-dom';
import type { Role } from '../domain/types';
import { useApp } from '../state/context';

export function Login() {
  const { state, dispatch } = useApp();
  const navigate = useNavigate();

  const enter = (role: Role, userId: string) => {
    dispatch({ type: 'login', role, userId });
    navigate(role === 'adopter' ? '/adotante' : '/ong');
  };

  return (
    <section className="login">
      <h1>Tinder Pet</h1>
      <p className="muted">Protótipo com dados fictícios. Escolha um perfil para entrar.</p>

      <h2>Adotantes</h2>
      {state.adopters.map((a) => (
        <button key={a.id} type="button" onClick={() => enter('adopter', a.id)}>
          {a.name}, {a.city}
        </button>
      ))}

      <h2>ONGs</h2>
      {state.ongs.map((o) => (
        <button key={o.id} type="button" onClick={() => enter('ong', o.id)}>
          {o.name}, {o.city}
        </button>
      ))}

      <Link className="button-link" to="/cadastro">Criar perfil de adotante</Link>
      <button type="button" className="link-button" onClick={() => dispatch({ type: 'reset' })}>
        Restaurar dados de demonstração
      </button>
    </section>
  );
}
