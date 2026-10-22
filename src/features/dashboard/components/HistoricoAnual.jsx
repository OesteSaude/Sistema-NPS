import { META_NPS } from '../nps';

const BASE = 170;
const ESCALA = 1.5;
const yDe = (valor) => BASE - Math.min(Math.max(valor, 0), 100) * ESCALA;

export default function HistoricoAnual({ anual }) {
  const faixa = 560 / Math.max(anual.length, 1);
  const larguraBarra = Math.min(90, faixa * 0.5);

  return (
    <svg viewBox="0 0 640 200" className="dash-hist" role="img" aria-label="NPS por ano comparado à meta">
      <g stroke="#e1eaf1">
        {[0, 50, 100].map((valor) => (
          <line key={valor} x1="60" x2="620" y1={yDe(valor)} y2={yDe(valor)} />
        ))}
      </g>
      <g fill="#4a6275" fontSize="11" textAnchor="end">
        {[0, 50, 100].map((valor) => (
          <text key={valor} x="52" y={yDe(valor) + 4}>
            {valor}
          </text>
        ))}
      </g>
      {anual.map((item, indice) => {
        const x = 60 + faixa * indice + (faixa - larguraBarra) / 2;
        const ultimo = indice === anual.length - 1;
        return (
          <g key={item.ano}>
            <rect x={x} y={yDe(item.nps_score)} width={larguraBarra} height={BASE - yDe(item.nps_score)} rx="6" fill={ultimo ? '#0f2d44' : '#29a9e0'} />
            <text x={x + larguraBarra / 2} y={yDe(item.nps_score) - 6} textAnchor="middle" fontSize="13" fontWeight="700" fill="#0f2d44">
              {item.nps_score}
            </text>
            <text x={x + larguraBarra / 2} y="192" textAnchor="middle" fontSize="13" fontWeight="700" fill="#0f2d44">
              {item.ano}
            </text>
          </g>
        );
      })}
      <line x1="60" x2="620" y1={yDe(META_NPS)} y2={yDe(META_NPS)} stroke="#1aa89a" strokeWidth="3" strokeDasharray="8 6" />
      <text x="620" y={yDe(META_NPS) - 8} textAnchor="end" fontSize="12" fontWeight="700" fill="#0f6f66">
        Meta {META_NPS}
      </text>
    </svg>
  );
}
