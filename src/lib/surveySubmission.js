import { supabase } from './supabaseClient';
import { getScoreCategory } from '../data/scoreCategories';
import { CRITERIA_COLUMN_MAP } from '../data/criteriaColumnMap';

function buildCriteriaColumns(criteriaRatings) {
  const columns = {};
  Object.entries(criteriaRatings).forEach(([questionId, score]) => {
    const column = CRITERIA_COLUMN_MAP[questionId];
    if (column) {
      columns[column] = score;
    }
  });
  return columns;
}

export async function enviarRespostaPesquisa({
  unidadeId,
  homeScore,
  categoriaComment,
  avaliouOutrosCriterios,
  criteriaRatings,
}) {
  const payload = {
    origem: 'sistema',
    unidade_id: unidadeId,
    nps_score: homeScore,
    categoria: homeScore === null ? null : getScoreCategory(homeScore),
    categoria_comentario: categoriaComment || null,
    avaliou_outros_criterios: avaliouOutrosCriterios,
    ...buildCriteriaColumns(criteriaRatings),
  };

  const { data, error } = await supabase.from('respostas_pesquisa').insert(payload).select('id').single();

  if (error) {
    throw error;
  }

  return data.id;
}

export async function inscreverSorteio({ respostaId, nome, cidade, telefone }) {
  const { error } = await supabase.from('sorteio_participantes').insert({
    resposta_id: respostaId,
    nome,
    cidade,
    telefone,
  });

  if (error) {
    throw error;
  }
}
