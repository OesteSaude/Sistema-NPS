import { SurveyProvider, useSurvey, SCREEN } from './context/SurveyContext';
import HomePage01 from './pages/HomePage01';
import NotaCategoriaPage from './pages/NotaCategoriaPage';
import RespostasPage from './pages/RespostasPage';
import ObrigadoPage from './pages/ObrigadoPage';
import OverlayOutrosCriterios from './components/OverlayOutrosCriterios';
import DebugBar from './components/DebugBar';

const SCREEN_COMPONENTS = {
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
      <DebugBar />
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

export default function App() {
  return (
    <SurveyProvider>
      <SurveyFlow />
    </SurveyProvider>
  );
}
