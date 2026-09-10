import { useState } from 'react';
import PageShell from '../../components/PageShell';
import { useAuth } from '../../context/AuthContext';
import './LoginPage.css';

export default function LoginPage() {
  const { signIn, signUp } = useAuth();
  const [mode, setMode] = useState('entrar');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);
  const [confirmationSent, setConfirmationSent] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);
    setError(null);

    if (mode === 'entrar') {
      const { error: signInError } = await signIn(email, password);
      if (signInError) {
        setError('E-mail ou senha inválidos.');
      }
    } else {
      const { error: signUpError } = await signUp(email, password);
      if (signUpError) {
        setError(
          signUpError.message.includes('oestesaude.com.br')
            ? 'Cadastro permitido apenas para e-mails @oestesaude.com.br.'
            : signUpError.message,
        );
      } else {
        setConfirmationSent(true);
      }
    }

    setLoading(false);
  };

  const toggleMode = () => {
    setMode((prev) => (prev === 'entrar' ? 'criar' : 'entrar'));
    setError(null);
    setConfirmationSent(false);
  };

  if (confirmationSent) {
    return (
      <PageShell>
        <div className="login-page">
          <h1 className="login-page__title">Quase lá!</h1>
          <p>Enviamos um e-mail de confirmação para {email}. Clique no link para ativar sua conta.</p>
        </div>
      </PageShell>
    );
  }

  return (
    <PageShell>
      <div className="login-page">
        <h1 className="login-page__title">
          {mode === 'entrar' ? (
            <>
              Acesso ao <span className="login-page__title-highlight">Dashboard</span>
            </>
          ) : (
            <>
              Criar <span className="login-page__title-highlight">conta</span>
            </>
          )}
        </h1>
        <form className="login-page__form" onSubmit={handleSubmit}>
          <label>
            E-mail
            <input
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="seunome@oestesaude.com.br"
              required
            />
          </label>
          <label>
            Senha
            <input
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              minLength={6}
              required
            />
          </label>
          {error && <p className="login-page__error">{error}</p>}
          <button type="submit" disabled={loading}>
            {loading ? 'Aguarde...' : mode === 'entrar' ? 'Entrar' : 'Criar conta'}
          </button>
        </form>
        <button type="button" className="login-page__toggle" onClick={toggleMode}>
          {mode === 'entrar' ? 'Ainda não tem conta? Criar agora' : 'Já tem conta? Entrar'}
        </button>
      </div>
    </PageShell>
  );
}
