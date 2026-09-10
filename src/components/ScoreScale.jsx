import { getScoreColor } from '../data/scoreColors';
import './ScoreScale.css';

const SCORES = Array.from({ length: 11 }, (_, index) => index);

export default function ScoreScale({ selectedScore, onSelect }) {
  const highlightSelection = selectedScore !== null;

  return (
    <div className="score-scale" role="radiogroup" aria-label="Nota de 0 a 10">
      {SCORES.map((score) => {
        const isSelected = score === selectedScore;
        const showColor = !highlightSelection || isSelected;

        return (
          <button
            key={score}
            type="button"
            role="radio"
            aria-checked={isSelected}
            className="score-scale__item"
            style={{ backgroundColor: showColor ? getScoreColor(score) : undefined }}
            onClick={() => onSelect(score)}
          >
            {score}
          </button>
        );
      })}
    </div>
  );
}
