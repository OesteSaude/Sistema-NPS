import { useSurvey, SCREEN } from '../context/SurveyContext';
import './DebugBar.css';

const SCREEN_LABELS = {
  [SCREEN.HOME]: 'home_page_01',
  [SCREEN.NOTA_CATEGORIA]: 'nota (negativa/neutra/positiva)',
  [SCREEN.RESPOSTAS]: 'home_page_pos_respostas',
  [SCREEN.OBRIGADO]: 'home_page_pos_obrigado',
};

export default function DebugBar() {
  const { screen, reset } = useSurvey();

  return (
    <div className="debug-bar">
      <span>
        Tela atual: <strong>{SCREEN_LABELS[screen]}</strong>
      </span>
      <button type="button" onClick={reset}>
        Reiniciar pesquisa
      </button>
    </div>
  );
}
