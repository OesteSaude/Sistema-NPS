import { useEffect, useRef, useState } from 'react';
import { fetchComentariosRelevantes, fetchComentariosFiltrados } from '../dashboardQueries';
import { intervaloPeriodo } from '../dashboardExtras';
import { findUnidadeById, UNIDADES } from '../../../data/unidades';
import AnaliseIA from './AnaliseIA';

const PAGINA = 5;
const PADRAO = { nota: '', unidadeId: '', periodo: '' };
const PERIODOS = [
  { id: '', nome: 'Todo o período' },
  { id: 'mes', nome: 'Mês base' },
  { id: 'ytd', nome: 'Acumulado do ano' },
  { id: '3m', nome: 'Últimos 3 meses' },
  { id: '12m', nome: 'Últimos 12 meses' },
];

export default function ComentariosRelevantes({ tipo, mesBase }) {
  const [filtros, setFiltros] = useState(PADRAO);
  const [itens, setItens] = useState([]);
  const [temMais, setTemMais] = useState(false);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState(false);
  const pedido = useRef(0);

  const filtrosAtivos = filtros.nota !== '' || filtros.unidadeId !== '' || filtros.periodo !== '';

  const filtrosConsulta = {
    tipo,
    nota: filtros.nota,
    unidadeId: filtros.unidadeId,
    ...(filtros.periodo && mesBase ? intervaloPeriodo(filtros.periodo, mesBase) : {}),
  };

    const buscar = (offset) =>
    filtrosAtivos
      ? fetchComentariosFiltrados(offset, PAGINA, filtrosConsulta)
      : fetchComentariosRelevantes(offset, PAGINA, tipo);

  const carregar = async (offset) => {
    const numero = ++pedido.current;
    setCarregando(true);
    setErro(false);
    try {
      const novos = await buscar(offset);
      if (numero !== pedido.current) return;
      setItens((anteriores) => (offset === 0 ? novos : [...anteriores, ...novos]));
      setTemMais(novos.length === PAGINA);
    } catch {
      if (numero === pedido.current) setErro(true);
    }
    if (numero === pedido.current) setCarregando(false);
  };

  useEffect(() => {
    carregar(0);
  }, [filtros, mesBase]);

  const alterar = (campo) => (evento) => setFiltros((anteriores) => ({ ...anteriores, [campo]: evento.target.value }));

  return (
    <>
      <h2 className="dash-titulo">COMENTÁRIOS RELEVANTES</h2>
      <p className="dash-muted dash-sub">
        {filtrosAtivos
          ? 'Todos os comentários que atendem aos filtros · do mais recente ao mais antigo'
          : 'Comentários com mais de 10 palavras · do mais recente ao mais antigo'}
      </p>
      <div className="dash-filtros">
        <select value={filtros.periodo} onChange={alterar('periodo')} aria-label="Período">
          {PERIODOS.map((periodo) => (
            <option key={periodo.id} value={periodo.id}>
              {periodo.nome}
            </option>
          ))}
        </select>
        <select value={filtros.nota} onChange={alterar('nota')} aria-label="Nota">
          <option value="">Todas as notas</option>
          <option value="det">Detratores (0–6)</option>
          <option value="pas">Passivos (7–8)</option>
          <option value="pro">Promotores (9–10)</option>
          {Array.from({ length: 11 }, (_, nota) => (
            <option key={nota} value={String(nota)}>
              Nota {nota}
            </option>
          ))}
        </select>
        {tipo === 'centro_medico' && (
          <select value={filtros.unidadeId} onChange={alterar('unidadeId')} aria-label="Cidade">
            <option value="">Todas as cidades</option>
            {UNIDADES.filter((unidade) => unidade.id !== 'operadora').map((unidade) => (
              <option key={unidade.id} value={unidade.id}>
                {unidade.nome}
              </option>
            ))}
          </select>
        )}
      </div>
      <AnaliseIA filtros={filtrosConsulta} />
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