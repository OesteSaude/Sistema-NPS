drop policy if exists "Permitir leitura anonima" on respostas_pesquisa;
drop policy if exists "permitir leitura em respostas" on respostas_pesquisa;
drop policy if exists "Enable read access for all users" on sorteio_participantes;
drop policy if exists "Enable read access for all users deixar" on sorteio_participantes;

drop policy if exists "usuarios autenticados leem respostas" on respostas_pesquisa;
create policy "usuarios autenticados leem respostas"
  on respostas_pesquisa for select
  to authenticated
  using (true);