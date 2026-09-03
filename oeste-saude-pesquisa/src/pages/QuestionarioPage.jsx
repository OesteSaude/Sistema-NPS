import { useState } from 'react';
import PageShell from '../components/PageShell';
import SurveyHero from '../components/SurveyHero';
import CriteriaQuestion from '../components/CriteriaQuestion';
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

export default function QuestionarioPage() {
  const { submitQuestionario } = useSurvey();
  const [ratings, setRatings] = useState({});

  const handleSelect = (questionId, score) => {
    const nextRatings = { ...ratings, [questionId]: score };
    setRatings(nextRatings);

    const allAnswered = QUESTIONS.every((question) => nextRatings[question.id] !== undefined);
    if (allAnswered) {
      submitQuestionario(nextRatings);
    }
  };

  return (
    <PageShell>
      <SurveyHero />
      {QUESTIONS.map((question) => (
        <CriteriaQuestion
          key={question.id}
          question={question.label}
          selectedScore={ratings[question.id] ?? null}
          onSelect={(score) => handleSelect(question.id, score)}
        />
      ))}
    </PageShell>
  );
}
