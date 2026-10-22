import { ZONAS } from '../nps';

const ARCOS = [
  'M30 150A120 120 0 0 1 150 30',
  'M150 30A120 120 0 0 1 234.85 65.15',
  'M234.85 65.15A120 120 0 0 1 260.87 104.08',
  'M260.87 104.08A120 120 0 0 1 270 150',
];

export default function GaugeNps({ nps }) {
  const fracao = Math.min(Math.max((nps + 100) / 200, 0), 1);
  const angulo = Math.PI * (1 - fracao);
  const x = 150 + 95 * Math.cos(angulo);
  const y = 150 - 95 * Math.sin(angulo);

  return (
    <>
      <svg viewBox="0 0 300 190" className="dash-gauge" role="img" aria-label={`Velocímetro NPS ${nps}`}>
        <g fill="none" strokeWidth="22">
          {ARCOS.map((arco, indice) => (
            <path key={arco} d={arco} stroke={ZONAS[indice].cor} />
          ))}
        </g>
        <line x1="150" y1="150" x2={x} y2={y} stroke="#0f2d44" strokeWidth="5" strokeLinecap="round" />
        <circle cx="150" cy="150" r="9" fill="#0f2d44" />
        <text x="150" y="184" textAnchor="middle" fontSize="40" fontWeight="800" fill="#0f2d44">
          {nps}
        </text>
      </svg>
      <div className="dash-legend">
        {ZONAS.map((zona) => (
          <span className="dash-item" key={zona.id}>
            <i className="dash-dot" style={{ background: zona.cor }} />
            {zona.nome} {zona.faixa}
          </span>
        ))}
      </div>
    </>
  );
}
