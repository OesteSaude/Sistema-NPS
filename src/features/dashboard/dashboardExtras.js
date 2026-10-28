import { supabase } from '../../lib/supabaseClient';

export async function fetchResumoMensalCompleto(tipo) {
  const { data, error } = await supabase
    .from('mensal_resumo_nps')
    .select('*')
    .eq('tipo', tipo)
    .order('mes', { ascending: true });
  if (error) throw error;
  return data;
}

export async function sortearParticipante(mes) {
  const { data, error } = await supabase.rpc('sortear_participante', { p_mes: mes });
  if (error) throw error;
  return data[0];
}

const somarMeses = (iso, quantidade) => {
  const [ano, mes] = iso.split('-').map(Number);
  return new Date(Date.UTC(ano, mes - 1 + quantidade, 1)).toISOString().slice(0, 10);
};

const JANELAS = [
  { id: 'mes', rotulo: 'MÊS BASE', inicio: (mes) => mes },
  { id: 'ytd', rotulo: 'ACUM. ANO', inicio: (mes) => `${mes.slice(0, 4)}-01-01` },
  { id: '3m', rotulo: '3 MESES', inicio: (mes) => somarMeses(mes, -2) },
  { id: '12m', rotulo: '12 MESES', inicio: (mes) => somarMeses(mes, -11) },
];

export function calcularJanelas(meses, mesBase) {
  return JANELAS.map((janela) => {
    const inicio = janela.inicio(mesBase);
    const soma = { total: 0, promotores: 0, passivos: 0, detratores: 0 };
    meses
      .filter((item) => item.mes >= inicio && item.mes <= mesBase)
      .forEach((item) => {
        Object.keys(soma).forEach((chave) => {
          soma[chave] += Number(item[chave]);
        });
      });
    const nps = soma.total ? Math.round((100 * (soma.promotores - soma.detratores)) / soma.total) : null;
    return { id: janela.id, rotulo: janela.rotulo, ...soma, nps };
  });
}

export function intervaloPeriodo(periodo, mesBase) {
  const janela = JANELAS.find((item) => item.id === periodo);
  return { inicio: janela.inicio(mesBase), fim: somarMeses(mesBase, 1) };
}

export async function analisarComentarios(comentarios) {
  const { data, error } = await supabase.functions.invoke('analisar-comentarios', { body: { comentarios } });
  if (error) {
    const corpo = await error.context?.json?.().catch(() => null);
    throw new Error(corpo?.erro ?? 'Não foi possível gerar a análise.');
  }
  return data;
}