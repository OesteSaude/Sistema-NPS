import { createContext, useContext, useMemo, useState } from 'react';

export const SCREEN = {
  HOME: 'home',
  NOTA_CATEGORIA: 'nota_categoria',
  RESPOSTAS: 'respostas',
  OBRIGADO: 'obrigado',
};

const SurveyContext = createContext(null);

const initialState = {
  screen: SCREEN.HOME,
  homeScore: null,
  categoriaComment: '',
  criteriaRatings: {},
};

export function SurveyProvider({ children }) {
  const [state, setState] = useState(initialState);
  const [overlayOpen, setOverlayOpen] = useState(false);

  const selectHomeScore = (homeScore) => {
    setState((prev) => ({ ...prev, homeScore, screen: SCREEN.NOTA_CATEGORIA }));
  };

  const submitNotaCategoria = (categoriaComment) => {
    setState((prev) => ({ ...prev, categoriaComment }));
    setOverlayOpen(true);
  };

  const chooseAvaliarOutrosCriterios = (wantsMore) => {
    setOverlayOpen(false);
    setState((prev) => ({
      ...prev,
      screen: wantsMore ? SCREEN.RESPOSTAS : SCREEN.OBRIGADO,
    }));
  };

  const submitRespostas = (criteriaRatings) => {
    setState((prev) => ({ ...prev, criteriaRatings, screen: SCREEN.OBRIGADO }));
  };

  const reset = () => setState(initialState);

  const value = useMemo(
    () => ({
      ...state,
      overlayOpen,
      selectHomeScore,
      submitNotaCategoria,
      chooseAvaliarOutrosCriterios,
      submitRespostas,
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
