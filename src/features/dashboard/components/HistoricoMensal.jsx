import { META_NPS } from '../nps';

const X0 = 60;
const X1 = 580;
const TOPO = 34;
const BASE = 160;
const MESES = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];
const COR_ATUAL = 'rgb(224, 41, 41)';
const COR_ANTERIOR = '#8aa0b3';

const trechosDe = (valores, xDe, yDe) => {
  const trechos = [];
  let atual = [];
  valores.forEach((valor, indice) => {
    if (valor === null) {
      if (atual.length) trechos.push(atual);
      atual = [];
    } else {
      atual.push(`${xDe(indice)},${yDe(valor)}`);
    }
  });
  if (atual.length) trechos.push(atual);
  return trechos.filter((trecho) => trecho.length > 1);
};

export default function HistoricoMensal({ meses, mesBase }) {
  const ano = Number(mesBase.slice(0, 4));
  const mesAtual = Number(mesBase.slice(5, 7));
  const porMes = new Map(
    meses.map((item) => [item.mes, item.nps_score === null ? null : Number(item.nps_score)]),
  );

  const serie = (anoSerie, ate) =>
    Array.from({ length: 12 }, (_, indice) => {
      const mes = `${anoSerie}-${String(indice + 1).padStart(2, '0')}-01`;
      return indice < ate ? (porMes.get(mes) ?? null) : null;
    });

  const atual = serie(ano, mesAtual);
  const anterior = serie(ano - 1, 12);
  const valores = [...atual, ...anterior].filter((valor) => valor !== null);

  if (valores.length === 0) return <p className="dash-muted">Sem dados para comparar.</p>;

  const piso = Math.max(-100, Math.floor((Math.min(...valores, META_NPS) - 10) / 10) * 10);
  const teto = Math.min(100, Math.ceil((Math.max(...valores, META_NPS) + 5) / 10) * 10);
  const yDe = (valor) => BASE - ((valor - piso) / (teto - piso)) * (BASE - TOPO);
  const passo = (X1 - X0) / 12;
  const xDe = (indice) => X0 + passo * (indice + 0.5);
  const marcas = [piso, (piso + teto) / 2, teto];

  return (
    <svg viewBox="0 0 640 200" className="dash-hist" role="img" aria-label={`NPS mensal de ${ano} comparado a ${ano - 1} e à meta`}>
      <g fontSize="12" fontWeight="700">
        <circle cx="66" cy="12" r="5" fill={COR_ATUAL} />
        <text x="76" y="16" fill="#0f2d44">
          {ano}
        </text>
        <circle cx="126" cy="12" r="5" fill={COR_ANTERIOR} />
        <text x="136" y="16" fill="#4a6275">
          {ano - 1}
        </text>
      </g>
      <g stroke="#e1eaf1">
        {marcas.map((valor) => (
          <line key={valor} x1={X0} x2={X1} y1={yDe(valor)} y2={yDe(valor)} />
        ))}
      </g>
      <g fill="#4a6275" fontSize="11" textAnchor="end">
        {marcas.map((valor) => (
          <text key={valor} x="52" y={yDe(valor) + 4}>
            {valor}
          </text>
        ))}
      </g>
      <line x1={X0} x2={X1} y1={yDe(META_NPS)} y2={yDe(META_NPS)} stroke="#1aa89a" strokeWidth="3" strokeDasharray="8 6" />
      <text x={X1 + 6} y={yDe(META_NPS) + 4} fontSize="12" fontWeight="700" fill="#0f6f66">
        Meta {META_NPS}
      </text>

      {trechosDe(anterior, xDe, yDe).map((trecho) => (
        <polyline key={`a${trecho[0]}`} points={trecho.join(' ')} fill="none" stroke={COR_ANTERIOR} strokeWidth="2.5" strokeLinejoin="round" />
      ))}
      {trechosDe(atual, xDe, yDe).map((trecho) => (
        <polyline key={`b${trecho[0]}`} points={trecho.join(' ')} fill="none" stroke={COR_ATUAL} strokeWidth="3" strokeLinejoin="round" />
      ))}

      {anterior.map((valor, indice) =>
        valor === null ? null : (
          <g key={`pa${indice}`}>
            <circle cx={xDe(indice)} cy={yDe(valor)} r="3.5" fill={COR_ANTERIOR} />
            <text x={xDe(indice)} y={yDe(valor) + 16} textAnchor="middle" fontSize="10" fontWeight="600" fill="#4a6275">
              {valor}
            </text>
          </g>
        ),
      )}
      {atual.map((valor, indice) => {
        if (valor === null) return null;
        const destaque = indice === mesAtual - 1;
        return (
          <g key={`pb${indice}`}>
            <circle cx={xDe(indice)} cy={yDe(valor)} r={destaque ? 5.5 : 4} fill={destaque ? '#0f2d44' : COR_ATUAL} />
            <text x={xDe(indice)} y={yDe(valor) - 10} textAnchor="middle" fontSize="11" fontWeight="700" fill="#0f2d44">
              {valor}
            </text>
          </g>
        );
      })}

      {MESES.map((nome, indice) => (
        <text key={nome} x={xDe(indice)} y="190" textAnchor="middle" fontSize="11" fontWeight={indice === mesAtual - 1 ? 800 : 500} fill="#0f2d44">
          {nome}
        </text>
      ))}
    </svg>
  );
}