import { createContext, useContext, useMemo, useState } from 'react';
import { findUnidadeById } from '../data/unidades';

export const SCREEN = {
  UNIDADE: 'unidade',
  HOME: 'home',
  NOTA_CATEGORIA: 'nota_categoria',
  RESPOSTAS: 'respostas',
  OBRIGADO: 'obrigado',
};

const SurveyContext = createContext(null);

function resolveUnidadeFromUrl() {
  const params = new URLSearchParams(window.location.search);
  const unidadeId = params.get('unidade');
  return findUnidadeById(unidadeId);
}

function buildInitialState() {
  const unidade = resolveUnidadeFromUrl();
  return {
    screen: unidade ? SCREEN.HOME : SCREEN.UNIDADE,
    unidadeId: unidade?.id ?? null,
    homeScore: null,
    categoriaComment: '',
    criteriaRatings: {},
  };
}

export function SurveyProvider({ children }) {
  const [state, setState] = useState(buildInitialState);
  const [overlayOpen, setOverlayOpen] = useState(false);

  const selectUnidade = (unidadeId) => {
    setState((prev) => ({ ...prev, unidadeId, screen: SCREEN.HOME }));
  };

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

  const reset = () => setState(buildInitialState());

  const value = useMemo(
    () => ({
      ...state,
      overlayOpen,
      selectUnidade,
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
