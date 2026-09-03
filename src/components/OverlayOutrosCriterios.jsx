import './OverlayOutrosCriterios.css';

export default function OverlayOutrosCriterios({ onSim, onNao }) {
  return (
    <div className="overlay" role="dialog" aria-modal="true" aria-labelledby="overlay-title">
      <div className="overlay__card">
        <p id="overlay-title" className="overlay__title">
          Deseja <span className="overlay__title-highlight">avaliar</span> outros critérios?
        </p>
        <div className="overlay__actions">
          <button type="button" className="overlay__button overlay__button--sim" onClick={onSim}>
            SIM
          </button>
          <button type="button" className="overlay__button overlay__button--nao" onClick={onNao}>
            NÃO
          </button>
        </div>
      </div>
    </div>
  );
}
