import PageShell from '../components/PageShell';
import SurveyHero from '../components/SurveyHero';
import ScoreScale from '../components/ScoreScale';
import { useSurvey } from '../context/SurveyContext';

export default function HomePage01() {
  const { homeScore, selectHomeScore } = useSurvey();

  return (
    <PageShell>
      <SurveyHero />
      <p className="survey-question">
        <strong>Em uma escala de 0 a 10</strong>, o quanto você <strong>recomendaria a Oeste Saúde</strong> para
        um amigo ou familiar?
        <br />
        (Deixe desmarcado para não avaliado).
      </p>

      <div className="survey-scale-wrapper">
        <ScoreScale selectedScore={homeScore} onSelect={selectHomeScore} />
      </div>
    </PageShell>
  );
}
