import { forwardRef } from 'react';
import GaugeNps from './GaugeNps';
import HistoricoAnual from './HistoricoAnual';
import RoscaJanela from './RoscaJanela';
import { META_NPS, TIPOS, getZona, formatInt, formatPct, formatMes } from '../nps';
import './RelatorioNps.css';

const RelatorioNps = forwardRef(function RelatorioNps({ mesBase, resumo, anual, janelas, palavras, tipo }, ref) {
  const nps = Number(resumo.nps_score);
  const zona = getZona(nps);

  return (
    <div className="rel" ref={ref}>
      <div className="rel-topo">
        <div className="rel-marca">
          <img src={`${import.meta.env.BASE_URL}logo_oestesaude_svg.svg`} alt="Oeste Saúde" className="rel-logo" />
          <div>
            <div className="rel-titulo">Relatório de NPS</div>
            <div className="rel-muted">Net Promoter Score · {TIPOS[tipo]}</div>
          </div>
        </div>
        <div className="rel-muted rel-direita">
          Mês base: <b>{formatMes(mesBase)}</b> · {TIPOS[tipo]}
          <br />
          Gerado em {new Date().toLocaleDateString('pt-BR')}
        </div>
      </div>

      <div className="rel-kpis">
        <div className="rel-card rel-kpi" style={{ borderColor: '#7fcfc8' }}>
          <span className="rel-muted">TOTAL BASE</span>
          <b>{formatInt(resumo.total)}</b>
        </div>
        <div className="rel-card rel-kpi" style={{ borderColor: '#1aa89a' }}>
          <span className="rel-muted">NPS SCORE · {zona.nome.toUpperCase()} · META {META_NPS}</span>
          <b>{nps}</b>
        </div>
        <div className="rel-card rel-kpi" style={{ borderColor: '#29a9e0' }}>
          <span className="rel-muted">PROMOTORES</span>
          <b>{formatPct(resumo.pct_promotores)}</b>
        </div>
        <div className="rel-card rel-kpi" style={{ borderColor: '#0f2d44' }}>
          <span className="rel-muted">PERÍODO ANALISADO</span>
          <b className="rel-kpi__texto">{formatMes(mesBase)}</b>
        </div>
      </div>

      <div className="rel-meio">
        <div className="rel-card">
          <h2 className="rel-h2">SCORE NPS</h2>
          <GaugeNps nps={nps} />
        </div>
        <div className="rel-card">
          <h2 className="rel-h2">RAIO-X DO NET PROMOTER SCORE</h2>
          <div className="rel-roscas">
            {janelas.map((janela) => (
              <RoscaJanela key={janela.id} janela={janela} />
            ))}
          </div>
        </div>
      </div>

      <div className="rel-base">
        <div className="rel-card">
          <h2 className="rel-h2">HISTÓRICO DE NPS POR ANO</h2>
          <HistoricoAnual anual={anual} />
        </div>
        <div className="rel-card">
          <h2 className="rel-h2">TOP 5 PALAVRAS NOS COMENTÁRIOS</h2>
          <ol className="rel-ranking">
            {palavras.map((item, indice) => (
              <li key={item.palavra}>
                <b>{indice + 1}</b>
                <span>{item.palavra}</span>
                <span className="rel-muted">{item.quantidade}</span>
              </li>
            ))}
            {palavras.length === 0 && <li className="rel-muted">Sem comentários suficientes.</li>}
          </ol>
        </div>
      </div>
    </div>
  );
});

export default RelatorioNps;