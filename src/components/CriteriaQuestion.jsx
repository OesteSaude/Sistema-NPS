import ScoreScale from './ScoreScale';
import './CriteriaQuestion.css';

export default function CriteriaQuestion({ question, selectedScore, onSelect }) {
  return (
    <div className="criteria-question">
      <p className="criteria-question__label">{question}</p>
      <ScoreScale selectedScore={selectedScore} onSelect={onSelect} />
    </div>
  );
}
