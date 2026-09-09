import './ProgressBar.css';

export default function ProgressBar({ current, total }) {
  const percentage = Math.round((current / total) * 100);

  return (
    <div className="progress-bar" role="progressbar" aria-valuenow={current} aria-valuemin={1} aria-valuemax={total}>
      <div className="progress-bar__track">
        <div className="progress-bar__fill" style={{ width: `${percentage}%` }} />
      </div>
      <span className="progress-bar__label">
        {current} de {total}
      </span>
    </div>
  );
}
