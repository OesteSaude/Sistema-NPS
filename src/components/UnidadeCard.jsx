import './UnidadeCard.css';

export default function UnidadeCard({ nome, onClick }) {
  return (
    <button type="button" className="unidade-card" onClick={onClick}>
      {nome}
    </button>
  );
}
