create table if not exists historico_mensal_notas (
  id uuid primary key default gen_random_uuid(),
  mes date not null,
  unidade_id text references unidades(id),
  nota smallint not null check (nota between 0 and 10),
  quantidade integer not null check (quantidade >= 0),
  unique (mes, unidade_id, nota)
);

alter table historico_mensal_notas enable row level security;

create policy "historico visivel publicamente"
  on historico_mensal_notas for select
  using (true);

create or replace view historico_mensal_resumo as
select
  mes,
  unidade_id,
  sum(quantidade) as total_avaliacoes,
  sum(quantidade) filter (where nota between 9 and 10) as positivas,
  sum(quantidade) filter (where nota between 7 and 8) as neutras,
  sum(quantidade) filter (where nota between 0 and 6) as negativas
from historico_mensal_notas
group by mes, unidade_id;
