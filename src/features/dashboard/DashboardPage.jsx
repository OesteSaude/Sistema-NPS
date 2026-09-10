import PageShell from '../../components/PageShell';
import { useAuth } from '../../context/AuthContext';

export default function DashboardPage() {
  const { signOut } = useAuth();

  return (
    <PageShell>
      <h1>Dashboard</h1>
      <p>Conteúdo em construção — aguardando layout do Figma.</p>
      <button type="button" onClick={signOut}>
        Sair
      </button>
    </PageShell>
  );
}
