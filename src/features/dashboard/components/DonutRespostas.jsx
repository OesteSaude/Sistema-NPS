import { formatInt, formatPct } from '../nps';

const RAIO = 50;
const CIRCUNFERENCIA = 2 * Math.PI * RAIO;

export default function DonutRespostas({ promotores, passivos, detratores, total }) {
  const grupos = [
    { id: 'pro', nome: 'promotores', quantidade: promotores, cor: '#4e9e3e' },
    { id: 'neu', nome: 'neutros', quantidade: passivos, cor: '#eea71f' },
    { id: 'det', nome: 'detratores', quantidade: detratores, cor: '#d8272d' },
  ];
  let acumulado = 0;

  return (
    <div className="dash-donut">
      <svg viewBox="0 0 120 120" width="150" height="150" role="img" aria-label="Rosca de respostas por tipo">
        <g fill="none" strokeWidth="16" transform="rotate(-90 60 60)">
          {grupos.map((grupo) => {
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
        <text x="60" y="64" textAnchor="middle" fontSize="16" fontWeight="800" fill="#0f2d44">
          {formatInt(total)}
        </text>
      </svg>
      <div className="dash-donut__lista">
        {grupos.map((grupo) => (
          <span className="dash-item" key={grupo.id}>
            <i className="dash-dot" style={{ background: grupo.cor }} />
            <b>{formatInt(grupo.quantidade)}</b> {grupo.nome} · {formatPct((100 * grupo.quantidade) / total)}
          </span>
        ))}
      </div>
    </div>
  );
}
