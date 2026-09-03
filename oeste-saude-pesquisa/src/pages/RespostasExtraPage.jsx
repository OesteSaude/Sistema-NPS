import { useState } from 'react';
import PageShell from '../components/PageShell';
import SurveyHero from '../components/SurveyHero';
import ScoreScale from '../components/ScoreScale';
import SubmitButton from '../components/SubmitButton';
import { useSurvey } from '../context/SurveyContext';

export default function RespostasExtraPage() {
  const { submitRespostasExtra } = useSurvey();
  const [score, setScore] = useState(null);

  const handleSubmit = (event) => {
    event.preventDefault();
    submitRespostasExtra(score);
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

        <SubmitButton />
      </form>
    </PageShell>
  );
}
