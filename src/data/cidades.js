import { UNIDADES } from './unidades';

export const CIDADES_EXTRAS = [];

const nomesUnidades = UNIDADES.filter((unidade) => unidade.id !== 'operadora').map((unidade) => unidade.nome);

export const CIDADES = [...new Set([...nomesUnidades, ...CIDADES_EXTRAS])]
  .sort((a, b) => a.localeCompare(b, 'pt-BR'));

const normalizar = (texto) =>
  texto
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim();

export function encontrarCidade(texto) {
  const alvo = normalizar(texto);
  return CIDADES.find((cidade) => normalizar(cidade) === alvo) ?? null;
}