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
