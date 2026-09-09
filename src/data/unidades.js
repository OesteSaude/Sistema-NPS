export const UNIDADES = [
  { id: 'presidente-prudente', nome: 'Presidente Prudente' },
  { id: 'assis', nome: 'Assis' },
  { id: 'marilia', nome: 'Marília' },
  { id: 'bauru', nome: 'Bauru' },
  { id: 'aracatuba', nome: 'Araçatuba' },
  { id: 'dracena', nome: 'Dracena' },
  { id: 'tupa', nome: 'Tupã' },
  { id: 'ourinhos', nome: 'Ourinhos' },
  { id: 'adamantina', nome: 'Adamantina' },
];

export function findUnidadeById(id) {
  return UNIDADES.find((unidade) => unidade.id === id) ?? null;
}
