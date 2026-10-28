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

const GENERICAS = [
  'bom', 'boa', 'bons', 'boas', 'otimo', 'otima', 'otimos', 'excelente', 'excelencia', 'esselente',
  'maravilhoso', 'maravilhosa', 'perfeito', 'ruim', 'pessimo', 'horrivel', 'horroroso',
  'melhor', 'melhorar', 'melhoria', 'melhorias', 'satisfeito', 'satisfeita', 'satisfacao',
  'gosto', 'gosta', 'gostei', 'gostar', 'sempre', 'nunca', 'nada', 'nenhum', 'nenhuma', 'ainda',
  'apenas', 'porem', 'tambem', 'cada', 'vez', 'vezes', 'fui', 'tive', 'tenho', 'tinha', 'estar',
  'ficar', 'ficou', 'fazer', 'faz', 'feito', 'pode', 'podem', 'poder', 'precisa', 'preciso',
  'precisar', 'quero', 'queria', 'acho', 'acredito', 'super', 'pouco', 'poucos', 'algum', 'alguma',
  'alguns', 'algumas', 'outro', 'outra', 'outros', 'outras', 'mesmo', 'mesma', 'tanto', 'tanta',
  'pra', 'pro', 'nao', 'obrigado', 'obrigada', 'parabens', 'plano', 'planos', 'convenio', 'oeste',
  'saude', 'atendida', 'atendido', 'atender', 'atende', 'pessoal',
  'pessoas', 'pessoa', 'gente', 'dia', 'dias', 'hoje', 'sendo', 'seja', 'desde', 'entre', 'sobre',
  'depois', 'antes', 'ate', 'quase', 'sempre', 'nosso', 'nossa', 'voces', 'vocês', 'dele', 'dela',
];

const TERMOS_SAUDE = [
  'consulta', 'exame', 'autorizacao', 'carencia', 'boleto', 'aplicativo', 'whatsapp', 'site',
  'telefone', 'agendamento', 'agenda', 'especialidade', 'especialista', 'medico', 'credenciado',
  'rede', 'clinica', 'hospital', 'laboratorio', 'ressonancia', 'cirurgia', 'reembolso',
  'mensalidade', 'valor', 'preco', 'cobranca', 'pagamento', 'portabilidade', 'cobertura',
  'negativa', 'demora', 'espera', 'fila', 'atraso', 'recepcao', 'enfermagem', 'internacao',
  'urgencia', 'tratamento', 'procedimento', 'guia', 'atendente', 'secretaria', 'sac', 'ouvidoria',
  'rapidez', 'agilidade', 'burocracia', 'cancelamento', 'reajuste', 'dentista', 'pediatra',
];

const ALIAS = { whats: 'whatsapp', zap: 'whatsapp', app: 'aplicativo', apps: 'aplicativo' };

const semAcento = (texto) => texto.normalize('NFD').replace(/[\u0300-\u036f]/g, '');

const raiz = (palavra) => {
  const base = semAcento(palavra);
  if (ALIAS[base]) return ALIAS[base];
  const singular = base.replace(/(oes|aes)$/, 'ao');
  return singular.length > 4 && singular.endsWith('s') ? singular.slice(0, -1) : singular;
};

const PARADAS = new Set([...STOPWORDS, ...GENERICAS].map(raiz));
const RELEVANTES = new Set(TERMOS_SAUDE.map(raiz));

export function contarPalavras(textos, limite = 15) {
  const contagem = new Map();

  textos.forEach((texto) => {
    texto
      .toLowerCase()
      .replace(/[^\p{L}\s]/gu, ' ')
      .split(/\s+/)
      .filter((palavra) => palavra.length > 2)
      .forEach((palavra) => {
        const chave = raiz(palavra);
        if (PARADAS.has(chave)) return;
        const item = contagem.get(chave) ?? { quantidade: 0, formas: new Map() };
        item.quantidade += 1;
        item.formas.set(palavra, (item.formas.get(palavra) ?? 0) + 1);
        contagem.set(chave, item);
      });
  });

  const itens = [...contagem.entries()].map(([chave, item]) => ({
    palavra: [...item.formas.entries()].sort((a, b) => b[1] - a[1])[0][0],
    quantidade: item.quantidade,
    peso: RELEVANTES.has(chave) ? 3 : 1,
  }));

  const repetidas = itens.filter((item) => item.quantidade >= 2);

  return (repetidas.length >= limite ? repetidas : itens)
    .sort((a, b) => b.quantidade * b.peso - a.quantidade * a.peso || b.quantidade - a.quantidade)
    .slice(0, limite)
    .map(({ palavra, quantidade }) => ({ palavra, quantidade }));
}

export const TIPOS = { centro_medico: 'Centros Médicos', operadora: 'Operadora' };