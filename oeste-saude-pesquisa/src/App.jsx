import { SurveyProvider, useSurvey, SCREEN } from './context/SurveyContext';
import QuestionarioPage from './pages/QuestionarioPage';
import NotaPage from './pages/NotaPage';
import RespostasExtraPage from './pages/RespostasExtraPage';
import ObrigadoPage from './pages/ObrigadoPage';
import OverlayOutrosCriterios from './components/OverlayOutrosCriterios';

const SCREEN_COMPONENTS = {
  [SCREEN.QUESTIONARIO]: QuestionarioPage,
  [SCREEN.NOTA]: NotaPage,
  [SCREEN.RESPOSTAS_EXTRA]: RespostasExtraPage,
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

export default function App() {
  return (
    <SurveyProvider>
      <SurveyFlow />
    </SurveyProvider>
  );
}
