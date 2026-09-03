import { useState } from 'react';
import PageShell from '../components/PageShell';
import SurveyHero from '../components/SurveyHero';
import ScoreScale from '../components/ScoreScale';
import SubmitButton from '../components/SubmitButton';
import { useSurvey } from '../context/SurveyContext';
import { getFeedbackPrompt } from '../data/scoreCategories';

const COMMENT_LIMIT = 180;

export default function NotaCategoriaPage() {
  const { homeScore, submitNotaCategoria } = useSurvey();
  const [score, setScore] = useState(homeScore);
  const [comment, setComment] = useState('');

  const feedbackPrompt = score === null ? null : getFeedbackPrompt(score);

  const handleSubmit = (event) => {
    event.preventDefault();
    submitNotaCategoria(comment);
  };

  return (
    <PageShell>
      <SurveyHero />
      <form onSubmit={handleSubmit}>
        <p className="survey-question">
          <strong>Em uma escala de 0 a 10</strong>, o quanto você <strong>recomendaria a Oeste Saúde</strong> para
          um amigo ou familiar?
          <br />
          (Deixe desmarcado para não avaliado).
        </p>

        <div className="survey-scale-wrapper">
          <ScoreScale selectedScore={score} onSelect={setScore} />
        </div>

        {feedbackPrompt && (
          <div className="survey-comment">
            <label htmlFor="nota-comment">
              <strong>{feedbackPrompt.label}</strong> {feedbackPrompt.hint} <em>(Opcional)</em>
            </label>
            <textarea
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
