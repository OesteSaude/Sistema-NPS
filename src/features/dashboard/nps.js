export const META_NPS = 84;

export const ZONAS = [
  { id: 'critica', nome: 'Crítica', faixa: '−100 a 0', max: 0, cor: '#d8272d' },
  { id: 'aperfeicoamento', nome: 'Aperfeiçoamento', faixa: '1 a 50', max: 50, cor: '#eea71f' },
  { id: 'qualidade', nome: 'Qualidade', faixa: '51 a 75', max: 75, cor: '#29a9e0' },
  { id: 'excelencia', nome: 'Excelência', faixa: '76 a 100', max: 100, cor: '#4e9e3e' },
];

export const getZona = (nps) => ZONAS.find((zona) => nps <= zona.max) ?? ZONAS[ZONAS.length - 1];

const MESES = ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho', 'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'];

export const formatInt = (value) => Number(value).toLocaleString('pt-BR');
export const formatPct = (value) => `${Number(value).toFixed(1).replace('.', ',')}%`;

export function formatMes(isoDate) {
  const [ano, mes] = isoDate.split('-');
  return `${MESES[Number(mes) - 1]} de ${ano}`;
}

const STOPWORDS = new Set(
  'a o as os um uma uns umas de do da dos das em no na nos nas por para pra com sem e ou mas que se ao aos à às pelo pela pelos pelas eu me meu minha seu sua nosso foi foram ser é são era estou está estão ter tem tinha muito muita mais menos já não sim também só então como quando onde tudo todo toda todos todas isso isto esse essa esses essas este esta aquele aquela lá aqui bem'.split(' '),
);

export function contarPalavras(textos, limite = 15) {
  const contagem = new Map();
  textos.forEach((texto) => {
    texto
      .toLowerCase()
      .replace(/[^\p{L}\s]/gu, ' ')
      .split(/\s+/)
      .filter((palavra) => palavra.length > 2 && !STOPWORDS.has(palavra))
      .forEach((palavra) => contagem.set(palavra, (contagem.get(palavra) ?? 0) + 1));
  });
  return [...contagem.entries()]
    .map(([palavra, quantidade]) => ({ palavra, quantidade }))
    .sort((a, b) => b.quantidade - a.quantidade)
    .slice(0, limite);
}
