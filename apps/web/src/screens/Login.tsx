// Login simulado: escolhe um perfil de demonstração ou abre o cadastro de adotante.
import { ChevronRight, PawPrint } from 'lucide-react';
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
      <div className="login-hero">
        <span className="brand-mark"><PawPrint size={28} aria-hidden="true" /></span>
        <h1>Tinder Pet</h1>
        <p className="muted">Adoção com match entre pessoas e ONGs. Protótipo com dados fictícios: escolha um perfil para entrar.</p>
      </div>

      <h2>Adotantes</h2>
      <div className="roster">
        {state.adopters.map((a) => (
          <button key={a.id} type="button" className="roster-row" onClick={() => enter('adopter', a.id)}>
            <span className="avatar" aria-hidden="true">{a.name[0]}</span>
            <span className="roster-text"><span>{a.name}</span><span>{a.city}</span></span>
            <ChevronRight size={20} aria-hidden="true" />
          </button>
        ))}
      </div>

      <h2>ONGs</h2>
      <div className="roster">
        {state.ongs.map((o) => (
          <button key={o.id} type="button" className="roster-row" onClick={() => enter('ong', o.id)}>
            <span className="avatar avatar-ong" aria-hidden="true">{o.name[0]}</span>
            <span className="roster-text"><span>{o.name}</span><span>{o.city}</span></span>
            <ChevronRight size={20} aria-hidden="true" />
          </button>
        ))}
      </div>

      <h2>Novo por aqui</h2>
      <Link className="button-link" to="/cadastro">Criar perfil de adotante</Link>
      <button type="button" className="link-button" onClick={() => dispatch({ type: 'reset' })}>
        Restaurar dados de demonstração
      </button>
    </section>
  );
}
