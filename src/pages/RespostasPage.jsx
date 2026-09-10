import { useState } from 'react';
import PageShell from '../components/PageShell';
import SurveyHero from '../components/SurveyHero';
import CriteriaQuestion from '../components/CriteriaQuestion';
import ProgressBar from '../components/ProgressBar';
import SubmitButton from '../components/SubmitButton';
import { useSurvey } from '../context/SurveyContext';

const QUESTIONS = [
  { id: 'centroMedico', label: 'Qual é o seu grau de satisfação com os serviços do Centro Médico?' },
  { id: 'recepcao', label: 'Como você avalia o atendimento da recepção?' },
  { id: 'medico', label: 'Como você avalia o atendimento do médico?' },
  { id: 'enfermagem', label: 'Como você avalia o atendimento enfermagem?' },
  { id: 'limpeza', label: 'Como você avalia a limpeza?' },
  { id: 'examesImagem', label: 'Como você avalia o atendimento da equipe que realiza os exames de imagem?' },
  { id: 'examesLaboratorio', label: 'Como você avalia o atendimento da equipe que realiza os exames de laboratório?' },
];

export default function RespostasPage() {
  const { submitRespostas } = useSurvey();
  const [ratings, setRatings] = useState({});
  const [currentIndex, setCurrentIndex] = useState(0);

  const currentQuestion = QUESTIONS[currentIndex];
  const isLastQuestion = currentIndex === QUESTIONS.length - 1;
  const currentScore = ratings[currentQuestion.id] ?? null;

  const handleSelect = (score) => {
    setRatings((prev) => ({ ...prev, [currentQuestion.id]: score }));
  };

  const handleAdvance = (event) => {
    event.preventDefault();

    if (isLastQuestion) {
      submitRespostas(ratings);
      return;
    }

    setCurrentIndex((prev) => prev + 1);
  };

  return (
    <PageShell>
      <SurveyHero />
      <ProgressBar current={currentIndex + 1} total={QUESTIONS.length} />
      <form onSubmit={handleAdvance}>
        <CriteriaQuestion
          question={currentQuestion.label}
          selectedScore={currentScore}
          onSelect={handleSelect}
        />
        <SubmitButton disabled={currentScore === null}>{isLastQuestion ? 'ENVIAR' : 'PRÓXIMO'}</SubmitButton>
      </form>
    </PageShell>
  );
}
