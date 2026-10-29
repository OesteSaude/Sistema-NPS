import { supabase } from '../../lib/supabaseClient';

async function run(query) {
  const { data, error } = await query;
  if (error) throw error;
  return data;
}

export const fetchMesesDisponiveis = (tipo) =>
  run(supabase.from('mensal_resumo_nps').select('mes').eq('tipo', tipo).order('mes', { ascending: false }));

export const fetchResumoMes = (mes, tipo) =>
  run(supabase.from('mensal_resumo_nps').select('*').eq('mes', mes).eq('tipo', tipo).maybeSingle());

export const fetchHistoricoAnual = (tipo) =>
  run(supabase.from('anual_resumo_nps').select('*').eq('tipo', tipo).order('ano', { ascending: true }));

export const fetchComentariosRelevantes = (offset, limite = 5, tipo) =>
  run(
    supabase
      .from('comentarios_relevantes')
      .select('*')
      .eq('tipo', tipo)
      .order('created_at', { ascending: false })
      .range(offset, offset + limite - 1),
  );

export const fetchTextosComentarios = async (tipo) => {
  let consulta = supabase
    .from('respostas_pesquisa')
    .select('categoria_comentario')
    .not('categoria_comentario', 'is', null)
    .order('created_at', { ascending: false })
    .limit(1000);

  consulta =
    tipo === 'operadora'
      ? consulta.eq('unidade_id', 'operadora')
      : consulta.or('unidade_id.is.null,unidade_id.neq.operadora');

  const data = await run(consulta);
  return data.map((linha) => linha.categoria_comentario);
};

const aplicarFiltros = (consulta, { tipo, nota, unidadeId, cidade, inicio, fim }) => {
  let resultado = consulta;

  if (inicio) resultado = resultado.gte('created_at', `${inicio}T00:00:00-03:00`).lt('created_at', `${fim}T00:00:00-03:00`);

  if (unidadeId) resultado = resultado.eq('unidade_id', unidadeId);
  else if (tipo === 'operadora') resultado = resultado.eq('unidade_id', 'operadora');
  else resultado = resultado.or('unidade_id.is.null,unidade_id.neq.operadora');

  if (tipo === 'operadora' && cidade) resultado = resultado.eq('cidade', cidade);

  if (nota === 'det') resultado = resultado.lte('nps_score', 6);
  else if (nota === 'pas') resultado = resultado.gte('nps_score', 7).lte('nps_score', 8);
  else if (nota === 'pro') resultado = resultado.gte('nps_score', 9);
  else if (nota !== '') resultado = resultado.eq('nps_score', Number(nota));

  return resultado;
};

export const fetchComentariosFiltrados = async (offset, limite, filtros) => {
  const consulta = supabase
    .from('respostas_pesquisa')
    .select('id, created_at, nps_score, unidade_id, cidade, categoria_comentario')
    .not('categoria_comentario', 'is', null)
    .neq('categoria_comentario', '')
    .order('created_at', { ascending: false })
    .range(offset, offset + limite - 1);

  const data = await run(aplicarFiltros(consulta, filtros));
  return data.map((linha) => ({ ...linha, comentario: linha.categoria_comentario }));
};

const mesLocal = (data) => new Date(data).toLocaleDateString('en-CA', { timeZone: 'America/Sao_Paulo' }).slice(0, 7);
export const fetchComentariosParaAnalise = async (filtros) => {
  const consulta = supabase
    .from('respostas_pesquisa')
    .select('created_at, categoria_comentario')
    .not('categoria_comentario', 'is', null)
    .neq('categoria_comentario', '')
    .order('created_at', { ascending: false })
    .limit(300);

  const data = await run(aplicarFiltros(consulta, filtros));
  return data.map((linha) => ({ mes: mesLocal(linha.created_at), texto: linha.categoria_comentario }));
};