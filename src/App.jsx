import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { SurveyProvider, useSurvey, SCREEN } from './context/SurveyContext';
import { AuthProvider } from './context/AuthContext';
import UnidadePage from './pages/UnidadePage';
import HomePage01 from './pages/HomePage01';
import NotaCategoriaPage from './pages/NotaCategoriaPage';
import RespostasPage from './pages/RespostasPage';
import ObrigadoPage from './pages/ObrigadoPage';
import OverlayOutrosCriterios from './components/OverlayOutrosCriterios';
import RequireAuth from './features/dashboard/RequireAuth';
import DashboardPage from './features/dashboard/DashboardPage';

const SCREEN_COMPONENTS = {
  [SCREEN.UNIDADE]: UnidadePage,
  [SCREEN.HOME]: HomePage01,
  [SCREEN.NOTA_CATEGORIA]: NotaCategoriaPage,
  [SCREEN.RESPOSTAS]: RespostasPage,
  [SCREEN.OBRIGADO]: ObrigadoPage,
};

function SurveyFlow() {
  const { screen, overlayOpen, chooseAvaliarOutrosCriterios } = useSurvey();
  const CurrentScreen = SCREEN_COMPONENTS[screen];

  return (
    <>
      <CurrentScreen />
      {overlayOpen && (
        <OverlayOutrosCriterios
          onSim={() => chooseAvaliarOutrosCriterios(true)}
          onNao={() => chooseAvaliarOutrosCriterios(false)}
        />
      )}
    </>
  );
}

function PesquisaRoute() {
  return (
    <SurveyProvider>
      <SurveyFlow />
    </SurveyProvider>
  );
}

function DashboardRoute() {
  return (
    <RequireAuth>
      <DashboardPage />
    </RequireAuth>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<PesquisaRoute />} />
          <Route path="/dashboard" element={<DashboardRoute />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
