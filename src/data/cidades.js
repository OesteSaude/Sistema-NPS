import { UNIDADES } from './unidades';

export const CIDADES_EXTRAS = [
  'Alfredo Marcondes', 'Álvares Machado', 'Anhumas', 'Caiabu', 'Caiuá',
  'Emilianópolis', 'Estrela do Norte', 'Euclides da Cunha Paulista', 'Flora Rica',
  'Iepê', 'Indiana', 'Marabá Paulista', 'Martinópolis', 'Mirante do Paranapanema',
  'Nantes', 'Narandiba', 'Piquerobi', 'Pirapozinho', 'Presidente Bernardes',
  'Rancharia', 'Regente Feijó', 'Ribeirão dos Índios', 'Rosana', 'Sandovalina',
  'Santo Anastácio', 'Santo Expedito', 'Taciba', 'Tarabai', 'Teodoro Sampaio',

  'Arco-Íris', 'Bastos', 'Flórida Paulista', 'Herculândia', 'Iacri', 'Inúbia Paulista',
  'Irapuru', 'Junqueirópolis', 'Lucélia', 'Mariápolis', 'Monte Castelo',
  'Nova Guataporanga', 'Ouro Verde', 'Pacaembu', 'Panorama', 'Parapuã', 'Paulicéia',
  'Pracinha', 'Queiroz', 'Quintana', 'Rinópolis', 'Sagres', 'Salmourão',
  'Santa Mercedes', "São João do Pau d'Alho", 'Tupã', 'Tupi Paulista',

  'Assis', 'Bernardino de Campos', 'Borá', 'Campos Novos Paulista', 'Cândido Mota',
  'Canitar', 'Chavantes', 'Cruzália', 'Echaporã', 'Espírito Santo do Turvo', 'Fartura',
  'Florínea', 'Ibirarema', 'Ipaussu', 'Lutécia', 'Maracaí', 'Ocauçu', 'Óleo',
  'Oscar Bressane', 'Ourinhos', 'Palmital', 'Paraguaçu Paulista', 'Pedrinhas Paulista',
  'Piraju', 'Platina', 'Quatá', 'Ribeirão do Sul', 'Salto Grande', 'Sarutaiá',
  'Taguaí', 'Tarumã', 'Tejupá', 'Timburi',

  'Alto Alegre', 'Andradina', 'Araçatuba', 'Auriflama', 'Avanhandava', 'Barbosa',
  'Bento de Abreu', 'Bilac', 'Birigui', 'Braúna', 'Brejo Alegre', 'Buritama',
  'Castilho', 'Clementina', 'Coroados', 'Floreal', 'Gabriel Monteiro', 'General Salgado',
  'Glicério', 'Guaraçaí', 'Guararapes', 'Guzolândia', 'Ilha Solteira', 'Itapura',
  'Lavínia', 'Luiziânia', 'Magda', 'Mirandópolis', 'Murutinga do Sul', 'Nova Castilho',
  'Nova Independência', 'Nova Luzitânia', 'Penápolis', 'Pereira Barreto', 'Piacatu',
  'Rubiácea', 'Santo Antônio do Aracanguá', 'Santópolis do Aguapeí', 'São João de Iracema',
  'Sud Mennucci', 'Suzanápolis', 'Turiúba', 'Valparaíso',

  'Água Clara', 'Alcinópolis', 'Anastácio', 'Angélica', 'Anaurilândia', 'Aparecida do Taboado',
  'Aquidauana', 'Bandeirantes', 'Batayporã', 'Bonito', 'Brasilândia', 'Camapuã',
  'Cassilândia', 'Chapadão do Sul', 'Corguinho', 'Costa Rica', 'Deodápolis',
  'Dois Irmãos do Buriti', 'Dourados', 'Figueirão', 'Glória de Dourados', 'Inocência',
  'Itaquiraí', 'Ivinhema', 'Jaraguari', 'Jateí', 'Maracaju', 'Miranda', 'Naviraí',
  'Nioaque', 'Nova Alvorada do Sul', 'Novo Horizonte do Sul', 'Paranaíba',
  'Paraíso das Águas', 'Pedro Gomes', 'Ribas do Rio Pardo', 'Rio Brilhante',
  'Rio Verde de Mato Grosso', 'Rochedo', 'Santa Rita do Pardo', 'São Gabriel do Oeste',
  'Selvíria', 'Sidrolândia', 'Sonora', 'Taquarussu', 'Terenos', 'Três Lagoas', 'Coxim',
];

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