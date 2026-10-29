alter table respostas_pesquisa add column if not exists cidade text;

alter table respostas_pesquisa drop constraint if exists operadora_exige_cidade;
alter table respostas_pesquisa add constraint operadora_exige_cidade check (
  unidade_id <> 'operadora'
  or origem <> 'sistema'
  or length(trim(coalesce(cidade, ''))) > 0
) not valid;