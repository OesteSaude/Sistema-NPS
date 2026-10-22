export default function KpiCard({ rotulo, valor, detalhe, cor, destaque }) {
  return (
    <div className="dash-card dash-kpi" style={{ borderColor: cor }}>
      <span className="dash-muted">{rotulo}</span>
      <b className={destaque ? 'dash-kpi__valor dash-kpi__valor--texto' : 'dash-kpi__valor'}>{valor}</b>
      {detalhe}
    </div>
  );
}
