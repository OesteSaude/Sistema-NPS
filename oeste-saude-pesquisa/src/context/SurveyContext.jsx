import { createContext, useContext, useMemo, useState } from 'react';

export const SCREEN = {
  QUESTIONARIO: 'questionario',
  NOTA: 'nota',
  RESPOSTAS_EXTRA: 'respostas_extra',
  OBRIGADO: 'obrigado',
};

const SurveyContext = createContext(null);

const initialState = {
  screen: SCREEN.QUESTIONARIO,
  criteriaRatings: {},
  npsScore: null,
  npsComment: '',
  extraScore: null,
};

export function SurveyProvider({ children }) {
  const [state, setState] = useState(initialState);
  const [overlayOpen, setOverlayOpen] = useState(false);

  const submitQuestionario = (criteriaRatings) => {
    setState((prev) => ({ ...prev, criteriaRatings, screen: SCREEN.NOTA }));
  };

  const submitNota = ({ npsScore, npsComment }) => {
    setState((prev) => ({ ...prev, npsScore, npsComment }));
    setOverlayOpen(true);
  };

  const chooseAvaliarOutrosCriterios = (wantsMore) => {
    setOverlayOpen(false);
    setState((prev) => ({
      ...prev,
      screen: wantsMore ? SCREEN.RESPOSTAS_EXTRA : SCREEN.OBRIGADO,
    }));
  };

  const submitRespostasExtra = (extraScore) => {
    setState((prev) => ({ ...prev, extraScore, screen: SCREEN.OBRIGADO }));
  };

  const reset = () => setState(initialState);

  const value = useMemo(
    () => ({
      ...state,
      overlayOpen,
      submitQuestionario,
      submitNota,
      chooseAvaliarOutrosCriterios,
      submitRespostasExtra,
      reset,
    }),
    [state, overlayOpen],
  );

  return <SurveyContext.Provider value={value}>{children}</SurveyContext.Provider>;
}

export function useSurvey() {
  const context = useContext(SurveyContext);
  if (!context) {
    throw new Error('useSurvey deve ser usado dentro de um SurveyProvider');
  }
  return context;
}
