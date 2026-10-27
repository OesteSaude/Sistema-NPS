import ExportarRelatorioButton from './components/ExportarRelatorioButton';
import SorteioButton from './components/SorteioButton';
import { useEffect, useState } from 'react';
import PageShell from '../../components/PageShell';
import { useAuth } from '../../context/AuthContext';
import { fetchMesesDisponiveis, fetchResumoMes } from './dashboardQueries';
import { fetchResumoMensalCompleto } from './dashboardExtras';
import { META_NPS, TIPOS, getZona, formatInt, formatPct, formatMes } from './nps';
import KpiCard from './components/KpiCard';
import GaugeNps from './components/GaugeNps';
import DonutRespostas from './components/DonutRespostas';
import HistoricoMensal from './components/HistoricoMensal';
import ComentariosRelevantes from './components/ComentariosRelevantes';
import PalavrasCitadas from './components/PalavrasCitadas';
import './DashboardPage.css';


export default function DashboardPage() {
  const [tipo, setTipo] = useState('centro_medico');
  const { signOut } = useAuth();
  const [meses, setMeses] = useState([]);
  const [mesBase, setMesBase] = useState(null);
  const [resumo, setResumo] = useState(null);
  const [anual, setAnual] = useState([]);
  const [status, setStatus] = useState('carregando');

    useEffect(() => {
    setStatus('carregando');
    setMesBase(null);
    setResumo(null);
    Promise.all([fetchMesesDisponiveis(tipo), fetchResumoMensalCompleto(tipo)])
      .then(([listaMeses, historico]) => {
        setMeses(listaMeses.map((item) => item.mes));
        setAnual(historico);
        if (listaMeses.length === 0) setStatus('vazio');
        else setMesBase(listaMeses[0].mes);
      })
      .catch(() => setStatus('erro'));
  }, [tipo]);

  useEffect(() => {
    if (!mesBase) return;
    fetchResumoMes(mesBase, tipo)
      .then((dados) => {
        setResumo(dados);
        setStatus('ok');
      })
      .catch(() => setStatus('erro'));
  }, [mesBase]);

  const pronto = status === 'ok' && resumo;
  const nps = pronto ? Number(resumo.nps_score) : 0;
  const zona = getZona(nps);

  return (
    <PageShell wide>
      <div className="dash">
        <div className="dash-header">
          <div>
            <h1 className="dash-h1">Dashboard de NPS</h1>
            <p className="dash-muted">Visão geral · {TIPOS[tipo]}</p>
          </div>
          <div className="dash-controles">
            <label>
              Segmento
              <select value={tipo} onChange={(evento) => setTipo(evento.target.value)}>
                {Object.entries(TIPOS).map(([id, nome]) => (
                  <option key={id} value={id}>
                    {nome}
                  </option>
                ))}
              </select>
            </label>
            <label>
              Mês base
              <select value={mesBase ?? ''} onChange={(evento) => setMesBase(evento.target.value)} disabled={!mesBase}>
                {meses.map((mes) => (
                  <option key={mes} value={mes}>
                    {formatMes(mes)}
                  </option>
                ))}
              </select>
            </label>
            {tipo === 'centro_medico' && <SorteioButton mesBase={mesBase} />}
            <ExportarRelatorioButton mesBase={mesBase} resumo={resumo} anual={anual} tipo={tipo} />
            <button type="button" className="dash-link" onClick={signOut}>
              Sair
            </button>
          </div>
        </div>

        {status === 'carregando' && <p className="dash-muted">Carregando dados...</p>}
        {status === 'erro' && <p className="dash-erro">Não foi possível carregar os dados do dashboard.</p>}
        {status === 'vazio' && <p className="dash-muted">Ainda não há respostas para exibir.</p>}

        {pronto && (
          <>
            <div className="dash-kpis">
              <KpiCard rotulo="TOTAL BASE" valor={formatInt(resumo.total)} cor="#7fcfc8" detalhe={<span className="dash-muted">respostas válidas no mês</span>} />
              <KpiCard
                rotulo="NPS SCORE"
                valor={nps}
                cor="#1aa89a"
                detalhe={
                  <span className="dash-chip" style={{ background: zona.cor, color: zona.id === 'critica' ? '#fff' : '#0f2d44' }}>
                    {zona.nome} · {nps >= META_NPS ? `meta ${META_NPS} atingida` : `meta ${META_NPS}`}
                  </span>
                }
              />
              <KpiCard rotulo="PROMOTORES" valor={formatPct(resumo.pct_promotores)} cor="#29a9e0" detalhe={<span className="dash-muted">notas 9 e 10</span>} />
              <KpiCard rotulo="PERÍODO ANALISADO" valor={formatMes(mesBase)} cor="#0f2d44" destaque detalhe={<span className="dash-muted">{TIPOS[tipo]}</span>} />
            </div>

            <div className="dash-grid">
              <section className="dash-card dash-gauge-card">
                <h2 className="dash-titulo">SCORE NPS</h2>
                <GaugeNps nps={nps} />
              </section>
              <section className="dash-card dash-donut-card">
                <h2 className="dash-titulo">RESPOSTAS</h2>
                <DonutRespostas
                  promotores={Number(resumo.promotores)}
                  passivos={Number(resumo.passivos)}
                  detratores={Number(resumo.detratores)}
                  total={Number(resumo.total)}
                />
              </section>
              <section className="dash-card dash-coment-card">
                <ComentariosRelevantes key={tipo} tipo={tipo} mesBase={mesBase} />
              </section>
              <section className="dash-card dash-hist-card">
                <h2 className="dash-titulo">EVOLUÇÃO MENSAL DO NPS</h2>
                <HistoricoMensal meses={anual} mesBase={mesBase} />
              </section>
              <section className="dash-card dash-words-card">
                <h2 className="dash-titulo">PALAVRAS MAIS CITADAS NOS COMENTÁRIOS</h2>
                <PalavrasCitadas key={tipo} tipo={tipo} />
              </section>
            </div>
          </>
        )}
      </div>
    </PageShell>
  );
}
