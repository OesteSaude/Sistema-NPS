export const UNIDADES = [
  { id: 'adamantina', nome: 'Adamantina' },
  { id: 'bataguassu', nome: 'Bataguassu' },
  { id: 'campo-grande', nome: 'Campo Grande' },
  { id: 'dracena', nome: 'Dracena' },
  { id: 'nova-andradina', nome: 'Nova Andradina' },
  { id: 'osvaldo-cruz', nome: 'Osvaldo Cruz' },
  { id: 'presidente-epitacio', nome: 'Presidente Epitácio' },
  { id: 'presidente-prudente', nome: 'Presidente Prudente' },
  { id: 'presidente-venceslau', nome: 'Presidente Venceslau' },
];

export function findUnidadeById(id) {
  return UNIDADES.find((unidade) => unidade.id === id) ?? null;
}
