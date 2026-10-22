import LoginPage from './LoginPage';
import { useAuth } from '../../context/AuthContext';

export default function RequireAuth({ children }) {
  const { session, loading } = useAuth();

  if (loading) {
    return null;
  }

  if (!session) {
    return <LoginPage />;
  }

  return children;
}
