export const SCORE_CATEGORY = {
  NEGATIVA: 'negativa',
  NEUTRA: 'neutra',
  POSITIVA: 'positiva',
};

const FEEDBACK_PROMPTS = {
  [SCORE_CATEGORY.NEGATIVA]: {
    label: 'Sentimos muito por isso.',
    hint: 'O que houve? Conta pra gente para melhorarmos o seu plano.',
  },
  [SCORE_CATEGORY.NEUTRA]: {
    label: 'O que faltou para a nota 10?',
    hint: 'Deixe sua sugestão para o seu plano ser ainda melhor.',
  },
  [SCORE_CATEGORY.POSITIVA]: {
    label: 'Que bom que você curtiu! ;)',
    hint: 'Conta pra gente como está sendo viver esse novo plano.',
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
