import PageShell from '../components/PageShell';
import UnidadeCard from '../components/UnidadeCard';
import { UNIDADES } from '../data/unidades';
import { useSurvey } from '../context/SurveyContext';
import './UnidadePage.css';

export default function UnidadePage() {
  const { selectUnidade } = useSurvey();

  return (
    <PageShell>
      <h1 className="unidade-page__title">
        Qual <span className="unidade-page__title-highlight">unidade</span> você visitou?
      </h1>
      <div className="unidade-page__grid">
        {UNIDADES.map((unidade) => (
          <UnidadeCard key={unidade.id} nome={unidade.nome} onClick={() => selectUnidade(unidade.id)} />
        ))}
      </div>
    </PageShell>
  );
}
