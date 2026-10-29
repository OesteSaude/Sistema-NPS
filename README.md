# Sistema NPS · Oeste Saúde

Sistema de pesquisa de satisfação (NPS) da Oeste Saúde, com painel de análise protegido por login.

- **Pesquisa pública:** o beneficiário avalia de 0 a 10 a unidade (Centros Médicos) ou a operadora, deixa um comentário e pode concorrer a um brinde.
- **Dashboard interno:** NPS, comparativos, comentários, palavras mais citadas, análise por IA, sorteio e exportação de relatório em imagem.

> Projeto feito com React + Vite no navegador e Supabase (banco, login e função de servidor). Não existe servidor próprio.

---

## Sumário

1. [Funcionalidades](#1-funcionalidades)
2. [Tecnologias](#2-tecnologias)
3. [Como rodar o projeto](#3-como-rodar-o-projeto)
4. [Estrutura de pastas](#4-estrutura-de-pastas)
5. [Como a pesquisa funciona](#5-como-a-pesquisa-funciona)
6. [Como o dashboard funciona](#6-como-o-dashboard-funciona)
7. [Banco de dados (Supabase)](#7-banco-de-dados-supabase)
8. [Análise com IA (Edge Function)](#8-análise-com-ia-edge-function)
9. [Onde mexer para alterar cada coisa](#9-onde-mexer-para-alterar-cada-coisa)
10. [Segurança e LGPD](#10-segurança-e-lgpd)
11. [Fluxo de trabalho com Git](#11-fluxo-de-trabalho-com-git)
12. [Solução de problemas](#12-solução-de-problemas)
13. [Pendências conhecidas](#13-pendências-conhecidas)

---

## 1. Funcionalidades

### Pesquisa (pública, rota `/`)

- Escolha da unidade em cards, ou direto pelo link `?unidade=<id>` (exemplo: `/?unidade=adamantina`).
- Nota de 0 a 10 com escala colorida e pergunta de comentário que muda conforme a nota (negativa, neutra ou positiva).
- Centros Médicos: depois da nota, uma janela pergunta se a pessoa quer avaliar outros critérios (7 perguntas de 0 a 10).
- **Operadora** (`?unidade=operadora`): só nota, comentário **obrigatório** e **cidade** obrigatória, sem os outros critérios.
- Cadastro no sorteio de brinde (nome, cidade e telefone), com cidade escolhida em lista com sugestões.

### Dashboard (protegido, rota `/dashboard`)

- **Segmento:** Centros Médicos ou Operadora.
- **Mês base:** todos os números acompanham o mês escolhido.
- Indicadores: total de respostas, NPS, % de promotores e período.
- Velocímetro do NPS com as zonas (Crítica, Aperfeiçoamento, Qualidade, Excelência) e meta.
- Rosca de promotores, neutros e detratores.
- Evolução mês a mês do NPS, comparando o ano do mês base com o ano anterior, com a linha da meta.
- Comentários relevantes, com filtros de período, nota e cidade, e botão **Analisar com IA**.
- Palavras mais citadas, com filtro de palavras genéricas e peso para termos de plano de saúde.
- **Sortear brinde** (uma vez por mês, resultado registrado) e **Exportar relatório** em PNG 1920×1080 para apresentações.

### Regras do NPS

| Nota | Grupo |
|---|---|
| 9 e 10 | Promotores |
| 7 e 8 | Neutros (passivos) |
| 0 a 6 | Detratores |

**NPS = % de promotores − % de detratores**, arredondado. Meta atual: **84**.

---

## 2. Tecnologias

| Parte | Tecnologia |
|---|---|
| Interface | React 19, Vite, react-router-dom |
| Banco e login | Supabase (PostgreSQL, Auth, RLS) |
| Função de servidor | Supabase Edge Function (Deno) |
| IA | Google Gemini (API chamada só pelo servidor) |
| Exportar imagem | html-to-image |
| Gráficos | SVG escrito à mão (sem biblioteca) |
| Qualidade de código | Oxlint (`npm run lint`) |

---

## 3. Como rodar o projeto

### Pré-requisitos

- Node.js (versão LTS) e npm
- Acesso ao projeto no Supabase

### Instalação

```bash
git clone <endereço-do-repositório>
cd Sistema-NPS
npm install
```

### Variáveis de ambiente

Crie um arquivo `.env` na raiz (junto do `package.json`):

```
VITE_SUPABASE_URL=https://SEU-PROJETO.supabase.co
VITE_SUPABASE_ANON_KEY=sua-chave-anon-publica
```

- Os dois valores ficam no painel do Supabase, em **Project Settings → API**.
- Use somente a chave **anon**. A `service_role` **nunca** entra neste projeto.
- O `.env` **não deve ser versionado** (veja [Pendências](#13-pendências-conhecidas)).

### Comandos

| Comando | O que faz |
|---|---|
| `npm run dev` | Abre o projeto em modo de desenvolvimento (normalmente `http://localhost:5173`) |
| `npm run build` | Gera a versão para publicar, na pasta `dist` |
| `npm run preview` | Testa a versão gerada pelo build |
| `npm run lint` | Verifica problemas no código |

---

## 4. Estrutura de pastas

```
Sistema-NPS/
├── public/                     Imagens públicas (logo, ícones)
├── supabase/
│   ├── schema.sql              Estrutura inicial do banco
│   ├── incremento_*.sql        Mudanças aplicadas em ordem (veja seção 7)
│   ├── seed_historico.sql      Histórico mensal importado
│   └── functions/
│       └── analisar-comentarios/index.ts   Função de IA
├── docs/
│   └── LGPD.md                 Tratamento de dados pessoais
└── src/
    ├── App.jsx                 Rotas e fluxo de telas
    ├── main.jsx                Ponto de entrada
    ├── index.css               Estilos gerais da pesquisa
    ├── context/
    │   ├── SurveyContext.jsx   Estado e etapas da pesquisa
    │   └── AuthContext.jsx     Login do dashboard
    ├── pages/                  Telas da pesquisa
    │   ├── UnidadePage.jsx         Escolha da unidade
    │   ├── HomePage01.jsx          Primeira nota
    │   ├── NotaCategoriaPage.jsx   Comentário (e cidade, na Operadora)
    │   ├── RespostasPage.jsx       Perguntas dos outros critérios
    │   └── ObrigadoPage.jsx        Agradecimento e cadastro no brinde
    ├── components/             Peças visuais da pesquisa
    ├── data/                   Listas e regras editáveis
    │   ├── unidades.js
    │   ├── cidades.js
    │   ├── scoreCategories.js
    │   ├── scoreColors.js
    │   └── criteriaColumnMap.js
    ├── lib/
    │   ├── supabaseClient.js       Conexão com o Supabase
    │   └── surveySubmission.js     Envio da resposta e do brinde
    └── features/dashboard/
        ├── DashboardPage.jsx       Tela principal do painel
        ├── LoginPage.jsx           Login
        ├── RequireAuth.jsx         Bloqueia quem não está logado
        ├── dashboardQueries.js     Consultas ao banco
        ├── dashboardExtras.js      Janelas de tempo, sorteio, chamada da IA
        ├── nps.js                  Meta, zonas, formatação, nuvem de palavras
        └── components/             Cards, gráficos e relatório
```

> A pasta `src/dashboard/` é uma cópia antiga e **não é usada**. Veja [Pendências](#13-pendências-conhecidas).

---

## 5. Como a pesquisa funciona

### Etapas

O arquivo `src/context/SurveyContext.jsx` controla em que tela a pessoa está:

```
UNIDADE → HOME (nota) → NOTA_CATEGORIA (comentário) → [janela: avaliar outros critérios?]
        → RESPOSTAS (7 perguntas, opcional) → OBRIGADO (brinde)
```

- Se a URL tem `?unidade=<id>`, a etapa UNIDADE é pulada.
- **Operadora:** depois do comentário, a resposta é enviada direto, sem a janela e sem as 7 perguntas.
- O envio acontece quando a pesquisa termina (`finalizarPesquisa`), gravando na tabela `respostas_pesquisa` (arquivo `src/lib/surveySubmission.js`).
- A tela de agradecimento aparece mesmo se o envio falhar. O erro aparece no console do navegador (F12).

### Onde está cada coisa

| Parte da pesquisa | Arquivo |
|---|---|
| Ordem das telas e envio | `src/context/SurveyContext.jsx` |
| Textos por faixa de nota | `src/data/scoreCategories.js` |
| Perguntas dos outros critérios | `src/pages/RespostasPage.jsx` (lista `QUESTIONS`) |
| Ligação pergunta → coluna do banco | `src/data/criteriaColumnMap.js` |
| Cores da escala 0–10 | `src/data/scoreColors.js` |
| Lista de unidades | `src/data/unidades.js` |
| Lista de cidades | `src/data/cidades.js` |

---

## 6. Como o dashboard funciona

### Acesso

- Rota `/dashboard`, protegida por `RequireAuth.jsx`.
- O cadastro de usuários é limitado a e-mails **@oestesaude.com.br** (regra no banco, arquivo `incremento_signup_dominio.sql`).
- Se o e-mail de confirmação não chegar ou o link falhar, o acesso pode ser liberado pelo SQL Editor do Supabase (confirmando o usuário em `auth.users`).

### Segmentos

O dashboard separa duas visões:

- **Operadora:** respostas da unidade `operadora`.
- **Centros Médicos:** todas as outras unidades.

Essa divisão é calculada **dentro das views do banco**, pela coluna `tipo` (`operadora` ou `centro_medico`), a partir do `unidade_id`. Não existe coluna `tipo` na tabela `unidades`.

O **histórico antigo** (unidade `geral`) é contado **nos dois segmentos**, porque as notas eram as mesmas até a divisão.

### De onde vêm os números

| O quê | De onde |
|---|---|
| NPS do mês, total, promotores | view `mensal_resumo_nps` |
| Evolução mensal | view `mensal_resumo_nps` (todos os meses do segmento) |
| Janelas (3 e 12 meses, acumulado) | calculadas em `dashboardExtras.js` a partir do mensal |
| Comentários | tabela `respostas_pesquisa` (e a view `comentarios_relevantes`, quando não há filtro) |
| Palavras | textos dos comentários, tratados em `nps.js` (`contarPalavras`) |

Os meses são agrupados pelo **horário de Brasília**.

### Exportar relatório

`ExportarRelatorioButton.jsx` monta o relatório fora da tela (`RelatorioNps.jsx`), no tamanho 1920×1080, e o converte em PNG com a biblioteca html-to-image. O layout do relatório está em `RelatorioNps.jsx` e `RelatorioNps.css`.

### Sorteio de brinde

- A função `sortear_participante` (banco) sorteia **um participante por mês**, entre os inscritos do mês.
- O resultado é gravado em `sorteio_resultados` e não pode ser refeito para o mesmo mês.
- O botão aparece apenas no segmento Centros Médicos, mas o sorteio considera **todos** os inscritos do mês.

---

## 7. Banco de dados (Supabase)

### Tabelas principais

| Tabela | Para quê |
|---|---|
| `unidades` | Cadastro de unidades (`id`, `nome`, `cidade`, `ativo`) |
| `respostas_pesquisa` | Uma linha por resposta: nota, categoria, comentário, cidade, critérios, origem |
| `sorteio_participantes` | Nome, cidade e telefone de quem entrou no brinde |
| `sorteio_resultados` | Vencedor de cada mês |
| `historico_mensal_notas` | Notas agregadas dos meses antigos (quantidade por nota) |

### Origem das respostas (`origem`)

| Valor | Significado |
|---|---|
| `sistema` | Respondida pelo sistema |
| `manual` | Importada à mão (planilha anterior) |
| `historico` | Reservado para histórico detalhado |

O dashboard conta `sistema` e `manual`.

### Regras que o banco garante

- Operadora (`origem = sistema`): **comentário e cidade obrigatórios**, e sem outros critérios.
- Cadastro de usuário só com e-mail `@oestesaude.com.br`.
- Visitantes podem **apenas gravar** resposta e brinde. A leitura é só para usuários logados.

### Views usadas pelo dashboard

`mensal_notas_combinado` → `mensal_resumo` → `mensal_resumo_nps`, além de `comentarios_relevantes` (comentários com mais de 10 palavras) e `anual_resumo_nps` (hoje sem uso na tela).

### Ordem para montar um banco novo

Rode no **SQL Editor** do Supabase, nesta ordem:

1. `schema.sql`
2. `incremento_historico.sql`
3. `seed_historico.sql` (dados históricos)
4. `incremento_comentarios_relevantes.sql`
5. `incremento_dashboard_auth.sql`
6. `incremento_signup_dominio.sql`
7. `incremento_sorteio.sql`
8. `incremento_operadora.sql`
9. `incremento_historico_compartilhado.sql`
10. `incremento_cidade_operadora.sql`
11. `incremento_sorteio_policy.sql`
12. `incremento_seguranca_leitura.sql`
13. `incremento_importacao_operadora.sql` (respostas importadas da Operadora)

> Cada arquivo foi feito para ser seguro em banco já existente (usa `if not exists`, `drop ... if exists`, `create or replace`). Mesmo assim, **faça backup** antes de rodar em produção.

---

## 8. Análise com IA (Edge Function)

O botão **Analisar com IA** (card de comentários) envia os comentários filtrados para a função `analisar-comentarios`, que consulta o Gemini e devolve um relatório com:

- resumo geral;
- até 6 temas de problema, com plano de ação sugerido;
- quantidade de comentários por mês em cada tema e a **tendência** (diminuiu, estável ou aumentou).

A contagem por mês e a tendência são **calculadas pelo servidor**, e não pela IA. A IA apenas agrupa os comentários por tema.

### Segurança da função

- Só aceita usuários logados com e-mail `@oestesaude.com.br`.
- A chave do Gemini fica como **segredo no Supabase**, nunca no código.
- Antes de enviar, remove e-mail, CPF e telefone dos textos.
- Envia **somente o texto dos comentários**, sem cidade, nome, telefone ou data.
- Se o Gemini estiver sobrecarregado, a função tenta de novo e depois usa um modelo reserva.

### Publicar ou atualizar a função

```bash
supabase login
supabase link --project-ref SEU-CODIGO-DO-PROJETO
supabase secrets set GEMINI_API_KEY=sua-chave-aqui
supabase functions deploy analisar-comentarios --no-verify-jwt
```

O `--no-verify-jwt` é intencional: a própria função confere o login e o domínio do e-mail.

Ajustes comuns (no topo do arquivo `supabase/functions/analisar-comentarios/index.ts`):

| Constante | O que faz |
|---|---|
| `MODELO` | Modelo principal do Gemini |
| `MODELO_RESERVA` | Modelo usado na última tentativa |
| `MAX_COMENTARIOS` | Quantos comentários entram numa análise |
| `INSTRUCOES` | Texto que orienta a IA (formato e tipo de análise) |

> Os comentários podem conter informação de saúde (dado sensível pela LGPD). Veja `docs/LGPD.md` antes de usar a análise em produção.

---

## 9. Onde mexer para alterar cada coisa

| Quero... | Onde mexer |
|---|---|
| Mudar a **meta do NPS** (hoje 84) | `src/features/dashboard/nps.js` → `META_NPS` |
| Mudar nomes, faixas ou cores das **zonas** do NPS | `src/features/dashboard/nps.js` → `ZONAS` |
| **Adicionar uma unidade** | 1) `src/data/unidades.js` (nova linha) 2) tabela `unidades` no Supabase (mesmo `id`) |
| Adicionar **cidades** ao cadastro do brinde e à pesquisa da Operadora | `src/data/cidades.js` → `CIDADES_EXTRAS` |
| Mudar os **textos** de cada faixa de nota | `src/data/scoreCategories.js` |
| Mudar as **faixas** de promotor/neutro/detrator | `getScoreCategory` em `scoreCategories.js` **e** as views no banco (`nota >= 9`, `between 7 and 8`, `<= 6`) |
| Editar as **perguntas** dos critérios | `src/pages/RespostasPage.jsx` (`QUESTIONS`) |
| Adicionar um **critério novo** | `RespostasPage.jsx`, `criteriaColumnMap.js` e uma coluna nova em `respostas_pesquisa` |
| Mudar o **limite de caracteres** do comentário | `COMMENT_LIMIT` em `src/pages/NotaCategoriaPage.jsx` |
| Mudar a regra de **comentário relevante** (mais de 10 palavras) | View `comentarios_relevantes` (SQL) |
| Ajustar a **nuvem de palavras** | `src/features/dashboard/nps.js` → `GENERICAS` (palavras a ocultar) e `TERMOS_SAUDE` (palavras a destacar) |
| Mudar o **layout do relatório** exportado | `components/RelatorioNps.jsx` e `RelatorioNps.css` |
| Mudar o **período** dos gráficos (12 meses, ano) | `components/HistoricoMensal.jsx` |
| Mudar o **texto de privacidade** do brinde | `src/pages/ObrigadoPage.jsx` (parágrafo `obrigado__aviso`) |
| Mudar o **domínio de e-mail** permitido | SQL `incremento_signup_dominio.sql` (função `restringir_dominio_email`) **e** `DOMINIO` na Edge Function |
| Mudar o **modelo ou o comportamento da IA** | `supabase/functions/analisar-comentarios/index.ts` (depois, `supabase functions deploy`) |
| Mudar **cores gerais e fontes** | `src/index.css` e `DashboardPage.css` |
| Trocar o **logo** | `public/logo_oestesaude_svg.svg` |

---

## 10. Segurança e LGPD

- O acesso ao dashboard exige login e e-mail corporativo.
- O público só consegue **gravar** respostas e inscrições. Não consegue ler nada (regras de segurança por linha, RLS).
- Nome e telefone **não aparecem** em comentários, filtros, relatórios nem na análise com IA. O único lugar em que aparecem é o resultado do sorteio, para a equipe contatar o vencedor.
- No segmento Operadora, a cidade do beneficiário é gravada na resposta para permitir filtros.
- Documento completo, com os pontos ainda a definir pelo jurídico e pelo encarregado de dados: **`docs/LGPD.md`**.

Boas práticas do projeto:

- Nunca colocar chaves de serviço (`service_role`, chave do Gemini) em código, `.env` versionado ou conversas.
- Se uma chave for exposta, apagar e criar outra.

---

## 11. Fluxo de trabalho com Git

Branches usadas no projeto:

| Branch | Uso |
|---|---|
| `main` | Versão publicada |
| `develop` | Integração |
| `feature/...` | Trabalho de cada entrega (coleta, dashboard, operadora e IA) |

Rotina sugerida:

```bash
git checkout -b feature/nome-da-mudanca
git add -A
git commit -m "Descrição curta da mudança"
git push -u origin feature/nome-da-mudanca
```

Depois do push, abra um **Pull Request** no GitHub para revisão.

**Atenção:** as mudanças de banco (SQL) valem para **todos** os ambientes de uma vez, pois existe um único projeto no Supabase. Branches isolam só o código do site.

### Manter o Supabase ativo

No plano gratuito, o Supabase pausa o projeto após 7 dias de baixa atividade. Opções: plano Pro (não pausa) ou um agendamento diário que faça uma consulta leve ao banco (por exemplo, GitHub Actions com `curl` em `/rest/v1/unidades?select=id&limit=1`).

---

## 12. Solução de problemas

| Sintoma | Causa provável | O que fazer |
|---|---|---|
| Tela branca ao abrir | Variáveis do `.env` ausentes | Confira `VITE_SUPABASE_URL` e `VITE_SUPABASE_ANON_KEY` e reinicie o `npm run dev` |
| `.env` com `<<<<<<< HEAD` | Conflito de merge dentro do `.env` | Deixe uma só cópia de cada variável e apague as marcas |
| Agradecimento aparece, mas nada grava | Erro de envio engolido pela tela | Abra o console (F12) e veja a mensagem em vermelho |
| `new row violates row-level security policy` | Falta permissão no banco (ou o código pede o registro de volta com `.select()`) | Revise as regras (policies) e remova `.select()` dos envios públicos |
| `violates check constraint "operadora_exige_comentario"` | Resposta da Operadora sem comentário | O comentário é obrigatório. Confira o campo na tela |
| `crypto.randomUUID is not a function` | Teste em endereço `http://` que não é `localhost` | Use `localhost`/`https` ou a função `novoId` de `surveySubmission.js` |
| Import não encontrado (`does not provide an export named ...`) | Arquivo da alteração não foi salvo no lugar certo | Confira o nome da pasta (`features/dashboard`, não `dashboard`) |
| Análise com IA demora ou dá 503 | Gemini sobrecarregado | A função já tenta de novo. Tente novamente em instantes |
| NPS "0 / Crítica" com dados | Layout ou consulta quebrada | Veja o console e confira se a view retorna o mês e o segmento |
| Dashboard sem dados no segmento | Não há respostas ou o histórico não foi importado | Rode o `select` de conferência nas views |

---

## 13. Pendências conhecidas

- [ ] **Criar um `.gitignore`.** O repositório não tem `.gitignore` e hoje versiona `node_modules` (mais de mil arquivos) e possivelmente o `.env`. Passos:
  ```bash
  printf "node_modules\ndist\n.vite\n.env\nsupabase/.temp\n.DS_Store\n" > .gitignore
  git rm -r --cached node_modules .env
  git add .gitignore
  git commit -m "Adiciona .gitignore e remove node_modules do versionamento"
  ```
- [ ] Remover a pasta antiga `src/dashboard/` (cópia sem uso de `features/dashboard`).
- [ ] Versionar o SQL original das views (o arquivo `incremento_dashboard_views.sql` não está no repositório; as definições vigentes estão nos incrementos da Operadora).
- [ ] Remover `HistoricoAnual.jsx` e a view `anual_resumo_nps`, hoje sem uso na tela.
- [ ] Definir com o jurídico os itens `[DEFINIR]` de `docs/LGPD.md` (base legal, retenção, encarregado).
- [ ] Limite de envios por origem (proteção contra abuso e spam na pesquisa pública).
- [ ] Avisar o participante na tela quando o envio da resposta falhar.
- [ ] Plano Pro do Supabase ou agendamento para manter o banco ativo.
- [ ] Confirmar os nomes oficiais das unidades.