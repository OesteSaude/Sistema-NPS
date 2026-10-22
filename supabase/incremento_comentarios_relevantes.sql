create or replace view comentarios_relevantes
with (security_invoker = true) as
select id, created_at, nps_score, categoria, unidade_id, categoria_comentario as comentario
from respostas_pesquisa
where categoria_comentario is not null
  and array_length(regexp_split_to_array(trim(categoria_comentario), '\s+'), 1) > 10;

revoke all on comentarios_relevantes from anon;
grant select on comentarios_relevantes to authenticated;
