import { supabase } from '../../lib/supabaseClient';

async function run(query) {
  const { data, error } = await query;
  if (error) throw error;
  return data;
}

export const fetchMesesDisponiveis = () =>
  run(supabase.from('mensal_resumo_nps').select('mes').order('mes', { ascending: false }));

export const fetchResumoMes = (mes) =>
  run(supabase.from('mensal_resumo_nps').select('*').eq('mes', mes).maybeSingle());

export const fetchHistoricoAnual = () =>
  run(supabase.from('anual_resumo_nps').select('*').order('ano', { ascending: true }));

export const fetchComentariosRelevantes = (offset, limite = 5) =>
  run(
    supabase
      .from('comentarios_relevantes')
      .select('*')
      .order('created_at', { ascending: false })
      .range(offset, offset + limite - 1),
  );

export const fetchTextosComentarios = async () => {
  const data = await run(
    supabase
      .from('respostas_pesquisa')
      .select('categoria_comentario')
      .not('categoria_comentario', 'is', null)
      .order('created_at', { ascending: false })
      .limit(1000),
  );
  return data.map((linha) => linha.categoria_comentario);
};
