import { useState } from 'react';
import PageShell from '../components/PageShell';
import SurveyHero from '../components/SurveyHero';
import CriteriaQuestion from '../components/CriteriaQuestion';
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

  const handleSelect = (questionId, score) => {
    setRatings((prev) => ({ ...prev, [questionId]: score }));
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    submitRespostas(ratings);
  };

  return (
    <PageShell>
      <SurveyHero />
      <form onSubmit={handleSubmit}>
        {QUESTIONS.map((question) => (
          <CriteriaQuestion
            key={question.id}
            question={question.label}
            selectedScore={ratings[question.id] ?? null}
            onSelect={(score) => handleSelect(question.id, score)}
          />
        ))}
        <SubmitButton />
      </form>
    </PageShell>
  );
}
