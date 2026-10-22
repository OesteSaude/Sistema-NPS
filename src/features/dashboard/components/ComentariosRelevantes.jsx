import { useEffect, useState } from 'react';
import { fetchComentariosRelevantes } from '../dashboardQueries';
import { findUnidadeById } from '../../../data/unidades';

const PAGINA = 5;

export default function ComentariosRelevantes() {
  const [itens, setItens] = useState([]);
  const [temMais, setTemMais] = useState(false);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState(false);

  const carregar = async (offset) => {
    setCarregando(true);
    try {
      const novos = await fetchComentariosRelevantes(offset, PAGINA);
      setItens((anteriores) => [...anteriores, ...novos]);
      setTemMais(novos.length === PAGINA);
    } catch {
      setErro(true);
    }
    setCarregando(false);
  };

  useEffect(() => {
    carregar(0);
  }, []);

  return (
    <>
      <h2 className="dash-titulo">COMENTÁRIOS RELEVANTES</h2>
      <p className="dash-muted dash-sub">Comentários com mais de 10 palavras · do mais recente ao mais antigo</p>
      <div className="dash-lista">
        {itens.map((item) => (
          <div className="dash-comentario" key={item.id}>
            <div>{item.comentario}</div>
            <div className="dash-muted">
              Nota {item.nps_score} · {findUnidadeById(item.unidade_id)?.nome ?? 'Unidade não informada'} ·{' '}
              {new Date(item.created_at).toLocaleDateString('pt-BR')}
            </div>
          </div>
        ))}
        {!carregando && !erro && itens.length === 0 && <p className="dash-muted">Ainda não há comentários nesse critério.</p>}
        {erro && <p className="dash-muted">Não foi possível carregar os comentários.</p>}
      </div>
      {temMais && (
        <button type="button" className="dash-btn" disabled={carregando} onClick={() => carregar(itens.length)}>
          {carregando ? 'Carregando...' : 'Carregar mais +'}
        </button>
      )}
    </>
  );
}
