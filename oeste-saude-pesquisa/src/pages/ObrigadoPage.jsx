import PageShell from '../components/PageShell';
import './ObrigadoPage.css';

const STAR_COUNT = 5;
const HIGHLIGHTED_STAR_INDEX = 2;

export default function ObrigadoPage() {
  return (
    <PageShell>
      <div className="obrigado">
        <div className="obrigado__stars" aria-hidden="true">
          {Array.from({ length: STAR_COUNT }, (_, index) => (
            <span
              key={index}
              className={index === HIGHLIGHTED_STAR_INDEX ? 'obrigado__star obrigado__star--active' : 'obrigado__star'}
            >
              ★
            </span>
          ))}
        </div>
        <p className="obrigado__title">
          <strong>Obrigado</strong> por participar
          <br />
          da nossa pesquisa!
        </p>
      </div>
    </PageShell>
  );
}
