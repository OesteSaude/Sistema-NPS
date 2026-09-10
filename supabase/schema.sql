create table if not exists unidades (
  id text primary key,
  nome text not null,
  cidade text not null,
  ativo boolean not null default true
);

create table if not exists respostas_pesquisa (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  origem text not null default 'sistema' check (origem in ('sistema', 'historico')),

  unidade_id text references unidades(id),

  nps_score smallint check (nps_score between 0 and 10),
  categoria text check (categoria in ('negativa', 'neutra', 'positiva')),
  categoria_comentario text,

  avaliou_outros_criterios boolean not null default false,
  nota_centro_medico smallint check (nota_centro_medico between 0 and 10),
  nota_recepcao smallint check (nota_recepcao between 0 and 10),
  nota_medico smallint check (nota_medico between 0 and 10),
  nota_enfermagem smallint check (nota_enfermagem between 0 and 10),
  nota_limpeza smallint check (nota_limpeza between 0 and 10),
  nota_exames_imagem smallint check (nota_exames_imagem between 0 and 10),
  nota_exames_laboratorio smallint check (nota_exames_laboratorio between 0 and 10)
);

alter table unidades enable row level security;
alter table respostas_pesquisa enable row level security;

create policy "unidades visiveis publicamente"
  on unidades for select
  using (true);

create policy "qualquer um pode inserir resposta"
  on respostas_pesquisa for insert
  with check (true);

create table if not exists sorteio_participantes (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  resposta_id uuid references respostas_pesquisa(id),
  nome text not null,
  cidade text not null,
  telefone text not null
);

alter table sorteio_participantes enable row level security;

create policy "qualquer um pode se inscrever no sorteio"
  on sorteio_participantes for insert
  with check (true);

create table if not exists historico_mensal (
  mes date primary key,
  total_respostas integer not null check (total_respostas >= 0),
  coleta_manual integer not null default 0 check (coleta_manual >= 0),
  coleta_digital integer not null default 0 check (coleta_digital >= 0)
);

create table if not exists historico_mensal_notas (
  mes date not null references historico_mensal(mes) on delete cascade,
  nota smallint not null check (nota between 0 and 10),
  quantidade integer not null check (quantidade >= 0),
  primary key (mes, nota)
);

alter table historico_mensal enable row level security;
alter table historico_mensal_notas enable row level security;

create policy "historico mensal visivel publicamente"
  on historico_mensal for select
  using (true);

create policy "historico notas visivel publicamente"
  on historico_mensal_notas for select
  using (true);

create view historico_mensal_resumo as
select
  hm.mes,
  hm.total_respostas,
  hm.coleta_manual,
  hm.coleta_digital,
  sum(hn.quantidade) filter (where hn.nota between 9 and 10) as promotores,
  sum(hn.quantidade) filter (where hn.nota between 7 and 8) as passivos,
  sum(hn.quantidade) filter (where hn.nota between 0 and 6) as detratores,
  round(
    100.0 * sum(hn.quantidade) filter (where hn.nota between 9 and 10) / nullif(hm.total_respostas, 0),
    1
  ) as percentual_promotores,
  round(
    100.0 * sum(hn.quantidade) filter (where hn.nota between 7 and 8) / nullif(hm.total_respostas, 0),
    1
  ) as percentual_passivos,
  round(
    100.0 * sum(hn.quantidade) filter (where hn.nota between 0 and 6) / nullif(hm.total_respostas, 0),
    1
  ) as percentual_detratores,
  round(
    100.0 * sum(hn.quantidade) filter (where hn.nota between 9 and 10) / nullif(hm.total_respostas, 0)
    - 100.0 * sum(hn.quantidade) filter (where hn.nota between 0 and 6) / nullif(hm.total_respostas, 0)
  ) as nps_score
from historico_mensal hm
left join historico_mensal_notas hn on hn.mes = hm.mes
group by hm.mes, hm.total_respostas, hm.coleta_manual, hm.coleta_digital;
