create table if not exists sorteio_resultados (
  id uuid primary key default gen_random_uuid(),
  mes date not null unique,
  participante_id uuid not null references sorteio_participantes(id),
  sorteado_em timestamptz not null default now(),
  sorteado_por uuid default auth.uid()
);

alter table sorteio_resultados enable row level security;

create or replace function sortear_participante(p_mes date)
returns table (
  vencedor_nome text,
  vencedor_cidade text,
  vencedor_telefone text,
  data_sorteio timestamptz,
  ja_sorteado boolean,
  total_participantes bigint
)
language plpgsql
security definer
set search_path = public
as $$
declare
  v_mes date := date_trunc('month', p_mes)::date;
  v_total bigint;
  v_id uuid;
begin
  if auth.uid() is null then
    raise exception 'Acesso restrito';
  end if;

  select count(*) into v_total
  from sorteio_participantes sp
  where (sp.created_at at time zone 'America/Sao_Paulo')::date >= v_mes
    and (sp.created_at at time zone 'America/Sao_Paulo')::date < (v_mes + interval '1 month')::date;

  select sr.participante_id into v_id from sorteio_resultados sr where sr.mes = v_mes;

  if v_id is null then
    if v_total = 0 then
      raise exception 'Nenhum participante em %', v_mes;
    end if;

    select sp.id into v_id
    from sorteio_participantes sp
    where (sp.created_at at time zone 'America/Sao_Paulo')::date >= v_mes
      and (sp.created_at at time zone 'America/Sao_Paulo')::date < (v_mes + interval '1 month')::date
    order by random()
    limit 1;

    insert into sorteio_resultados (mes, participante_id) values (v_mes, v_id);

    return query
      select sp.nome, sp.cidade, sp.telefone, sr.sorteado_em, false, v_total
      from sorteio_resultados sr
      join sorteio_participantes sp on sp.id = sr.participante_id
      where sr.mes = v_mes;
    return;
  end if;

  return query
    select sp.nome, sp.cidade, sp.telefone, sr.sorteado_em, true, v_total
    from sorteio_resultados sr
    join sorteio_participantes sp on sp.id = sr.participante_id
    where sr.mes = v_mes;
end;
$$;

revoke all on function sortear_participante(date) from public, anon;
grant execute on function sortear_participante(date) to authenticated;
