import { META_NPS, getZona, formatInt, formatPct } from '../nps';

const RAIO = 50;
const CIRCUNFERENCIA = 2 * Math.PI * RAIO;

const percentual = (parte, total) => (total ? formatPct((100 * parte) / total) : '—');

export default function RoscaJanela({ janela }) {
  const { rotulo, nps, promotores, passivos, detratores, total } = janela;
  const grupos = [
    { id: 'pro', sigla: 'PRO', quantidade: promotores, cor: '#4e9e3e' },
    { id: 'neu', sigla: 'NEU', quantidade: passivos, cor: '#eea71f' },
    { id: 'det', sigla: 'DET', quantidade: detratores, cor: '#d8272d' },
  ];
  const zona = nps === null ? null : getZona(nps);
  const atingiu = nps !== null && nps >= META_NPS;
  let acumulado = 0;

  return (
    <div className="rel-rosca">
      <div className="rel-rosca__titulo">{rotulo}</div>
      <svg viewBox="0 0 120 120" className="rel-rosca__grafico" role="img" aria-label={`${rotulo}: NPS ${nps ?? 'sem dados'}`}>
        <g fill="none" strokeWidth="14" transform="rotate(-90 60 60)">
          <circle cx="60" cy="60" r={RAIO} stroke="#e1eaf1" />
          {total > 0 &&
            grupos.map((grupo) => {
              const tamanho = (CIRCUNFERENCIA * grupo.quantidade) / total;
              const deslocamento = -acumulado;
              acumulado += tamanho;
              return (
                <circle
                  key={grupo.id}
                  cx="60"
                  cy="60"
                  r={RAIO}
                  stroke={grupo.cor}
                  strokeDasharray={`${tamanho} ${CIRCUNFERENCIA - tamanho}`}
                  strokeDashoffset={deslocamento}
                />
              );
            })}
        </g>
        <text x="60" y="50" textAnchor="middle" fontSize="9" fontWeight="700" fill="#4a6275">
          NPS
        </text>
        <text x="60" y="76" textAnchor="middle" fontSize="32" fontWeight="800" fill={zona ? zona.cor : '#4a6275'}>
          {nps ?? '—'}
        </text>
      </svg>
      <div className="rel-rosca__linhas">
        {grupos.map((grupo) => (
          <div className="rel-rosca__linha" key={grupo.id}>
            <i style={{ background: grupo.cor }} />
            <b>{grupo.sigla}</b>
            <span>{formatInt(grupo.quantidade)}</span>
            <span className="rel-muted">{percentual(grupo.quantidade, total)}</span>
          </div>
        ))}
      </div>
      <div className="rel-rosca__total">TOTAL {formatInt(total)}</div>
      {nps !== null && (
        <div className={atingiu ? 'rel-rosca__meta rel-rosca__meta--ok' : 'rel-rosca__meta rel-rosca__meta--falta'}>
          {atingiu ? `Meta ${META_NPS} atingida` : `Faltam ${META_NPS - nps} pts para a meta`}
        </div>
      )}
    </div>
  );
}