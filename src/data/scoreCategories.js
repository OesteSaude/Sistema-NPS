export const SCORE_CATEGORY = {
  NEGATIVA: 'negativa',
  NEUTRA: 'neutra',
  POSITIVA: 'positiva',
};

const FEEDBACK_PROMPTS = {
  [SCORE_CATEGORY.NEGATIVA]: {
    label: 'O que motivou a sua nota?',
    hint: 'Conte para nós como podemos melhorar.',
  },
  [SCORE_CATEGORY.NEUTRA]: {
    label: 'O que motivou a sua nota?',
    hint: 'Conte para nós como podemos melhorar.',
  },
  [SCORE_CATEGORY.POSITIVA]: {
    label: 'O que motivou a sua nota?',
    hint: 'Sua experiência conosco foi boa? Como podemos melhorar.',
  },
};

export function getScoreCategory(score) {
  if (score <= 6) return SCORE_CATEGORY.NEGATIVA;
  if (score <= 8) return SCORE_CATEGORY.NEUTRA;
  return SCORE_CATEGORY.POSITIVA;
}

export function getFeedbackPrompt(score) {
  const category = getScoreCategory(score);
  return FEEDBACK_PROMPTS[category];
}
