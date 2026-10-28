import { useState } from 'react';
import PageShell from '../components/PageShell';
import SurveyHero from '../components/SurveyHero';
import ScoreScale from '../components/ScoreScale';
import SubmitButton from '../components/SubmitButton';
import { useSurvey } from '../context/SurveyContext';
import { getFeedbackPrompt } from '../data/scoreCategories';
import { isOperadora } from '../data/unidades';
import { CIDADES, encontrarCidade } from '../data/cidades';

const COMMENT_LIMIT = 180;

export default function NotaCategoriaPage() {
  const { homeScore, unidadeId, submitNotaCategoria } = useSurvey();
  const obrigatorio = isOperadora(unidadeId);
  const [score, setScore] = useState(homeScore);
  const [comment, setComment] = useState('');
  const [cidade, setCidade] = useState('');

  const feedbackPrompt = score === null ? null : getFeedbackPrompt(score);

  const handleCidade = (event) => {
  const { value } = event.target;
  const encontrada = encontrarCidade(value);
  setCidade(encontrada ?? value);
  event.target.setCustomValidity(encontrada ? '' : 'Escolha uma cidade da lista.');
  };

  const handleSubmit = (event) => {
    event.preventDefault();
        if (obrigatorio && !comment.trim()) return;
    submitNotaCategoria(comment, obrigatorio ? cidade : null);
  };

  return (
    <PageShell>
      <SurveyHero />
      <form onSubmit={handleSubmit}>
        <p className="survey-question">
          <strong>Em uma escala de 0 a 10</strong>, o quanto você <strong>recomendaria a Oeste Saúde</strong> para
          um amigo ou familiar?
        </p>

        <div className="survey-scale-wrapper">
          <ScoreScale selectedScore={score} onSelect={setScore} />
        </div>

        {obrigatorio && (
          <div className="survey-comment">
            <label htmlFor="nota-cidade">
              <strong>Em qual cidade você mora?</strong>
            </label>
            <input
              id="nota-cidade"
              type="text"
              list="lista-cidades-pesquisa"
              value={cidade}
              onChange={handleCidade}
              autoComplete="off"
              required
            />
            <datalist id="lista-cidades-pesquisa">
              {CIDADES.map((nome) => (
                <option key={nome} value={nome} />
              ))}
            </datalist>
          </div>
        )}

        {feedbackPrompt && (
          <div className="survey-comment">
            <label htmlFor="nota-comment">
              <strong>{feedbackPrompt.label}</strong> {feedbackPrompt.hint} {!obrigatorio && <em>(Opcional)</em>}
            </label>
            <textarea
              required={obrigatorio}
              id="nota-comment"
              maxLength={COMMENT_LIMIT}
              value={comment}
              onChange={(event) => setComment(event.target.value)}
            />
            <span className="survey-comment__limit">Limite de {COMMENT_LIMIT} caracteres.</span>
          </div>
        )}

        <SubmitButton />
      </form>
    </PageShell>
  );
}
