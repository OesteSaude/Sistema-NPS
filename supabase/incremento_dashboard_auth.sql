create policy "usuarios autenticados leem respostas"
  on respostas_pesquisa for select
  to authenticated
  using (true);

drop policy if exists "historico visivel publicamente" on historico_mensal_notas;

create policy "usuarios autenticados leem historico"
  on historico_mensal_notas for select
  to authenticated
  using (true);
