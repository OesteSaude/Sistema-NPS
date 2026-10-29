create or replace function restringir_dominio_email()
returns trigger as $$
begin
  if new.email !~* '@oestesaude\.com\.br$' then
    raise exception 'Cadastro permitido apenas para e-mails @oestesaude.com.br';
  end if;
  return new;
end;
$$ language plpgsql security definer;

create trigger restringir_dominio_email_trigger
before insert on auth.users
for each row execute function restringir_dominio_email();
