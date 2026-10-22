import { useEffect, useState } from 'react';
import { fetchTextosComentarios } from '../dashboardQueries';
import { contarPalavras } from '../nps';

const CORES = ['#0f2d44', '#0a6d9c', '#0f6f66', '#3b6e2f'];

export default function PalavrasCitadas() {
  const [palavras, setPalavras] = useState(null);

  useEffect(() => {
    fetchTextosComentarios()
      .then((textos) => setPalavras(contarPalavras(textos)))
      .catch(() => setPalavras([]));
  }, []);

  if (palavras === null) return <p className="dash-muted">Carregando palavras...</p>;
  if (palavras.length === 0) return <p className="dash-muted">Ainda não há comentários suficientes.</p>;

  const maior = palavras[0].quantidade;
  const menor = palavras[palavras.length - 1].quantidade;
  const tamanho = (quantidade) => 16 + (maior === menor ? 0.5 : (quantidade - menor) / (maior - menor)) * 28;

  return (
    <div className="dash-palavras">
      <div className="dash-nuvem">
        {palavras.map((item, indice) => (
          <b key={item.palavra} style={{ fontSize: tamanho(item.quantidade), color: CORES[indice % CORES.length] }}>
            {item.palavra}
          </b>
        ))}
      </div>
      <ol className="dash-ranking">
        {palavras.slice(0, 5).map((item, indice) => (
          <li key={item.palavra}>
            <b className="dash-pos">{indice + 1}</b>
            <span>{item.palavra}</span>
            <span className="dash-muted">{item.quantidade}</span>
          </li>
        ))}
      </ol>
    </div>
  );
}
