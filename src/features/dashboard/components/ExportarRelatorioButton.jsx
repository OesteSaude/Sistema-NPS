import { useEffect, useRef, useState } from 'react';
import { toPng } from 'html-to-image';
import * as XLSX from 'xlsx';
import RelatorioNps from './RelatorioNps';
import {
  fetchTextosComentarios,
  fetchRespostasParaExportacao,
  fetchHistoricoNotasMes,
} from '../dashboardQueries';
import { fetchResumoMensalCompleto, calcularJanelas, intervaloPeriodo } from '../dashboardExtras';
import { contarPalavras, formatMes } from '../nps';
import { findUnidadeById } from '../../../data/unidades';

const PERIODOS_EXPORTACAO = [
  { id: 'mes', nome: 'Mês base selecionado' },
  { id: 'tudo', nome: 'Todo o período (Histórico completo)' },
  { id: 'ytd', nome: 'Acumulado do ano' },
  { id: '3m', nome: 'Últimos 3 meses' },
  { id: '12m', nome: 'Últimos 12 meses' },
  { id: 'custom', nome: 'Intervalo de datas personalizado...' },
];

const NOTAS_EXPORTACAO = [
  { id: '', nome: 'Todas as notas (0 a 10)' },
  { id: 'pro', nome: 'Promotores (notas 9 e 10)' },
  { id: 'pas', nome: 'Passivos / Neutros (notas 7 e 8)' },
  { id: 'det', nome: 'Detratores (notas 0 a 6)' },
  ...Array.from({ length: 11 }, (_, i) => 10 - i).map((nota) => ({
    id: String(nota),
    nome: `Apenas Nota ${nota}`,
  })),
];

export default function ExportarRelatorioButton({ mesBase, resumo, anual, tipo }) {
  const relatorioRef = useRef(null);
  const dropdownRef = useRef(null);

  const [dados, setDados] = useState(null);
  const [estado, setEstado] = useState('parado');
  const [menuAberto, setMenuAberto] = useState(false);

  // Controle do modal de exportação Excel
  const [modalExcelAberto, setModalExcelAberto] = useState(false);
  const [filtroPeriodo, setFiltroPeriodo] = useState('mes');
  const [filtroNota, setFiltroNota] = useState('');
  const [dataInicio, setDataInicio] = useState('');
  const [dataFim, setDataFim] = useState('');
  const [erroValidacao, setErroValidacao] = useState('');

  // Estado para confirmação de download do histórico consolidado
  const [confirmacaoHistorico, setConfirmacaoHistorico] = useState(null);

  // Fecha o dropdown se clicar fora
  useEffect(() => {
    function cliqueFora(e) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setMenuAberto(false);
      }
    }
    document.addEventListener('pointerdown', cliqueFora);
    return () => document.removeEventListener('pointerdown', cliqueFora);
  }, []);

  const abrirModalExcel = () => {
    setMenuAberto(false);
    setConfirmacaoHistorico(null);
    setErroValidacao('');
    setModalExcelAberto(true);
  };

  const fecharModalExcel = () => {
    setModalExcelAberto(false);
    setConfirmacaoHistorico(null);
    setErroValidacao('');
    setEstado('parado');
  };

  const iniciarPng = async () => {
    setEstado('gerando-png');
    try {
      const [meses, textos] = await Promise.all([fetchResumoMensalCompleto(tipo), fetchTextosComentarios(tipo)]);
      setDados({ janelas: calcularJanelas(meses, mesBase), palavras: contarPalavras(textos, 5) });
    } catch {
      setEstado('erro');
    }
  };

  const baixarHistoricoConfirmado = () => {
    if (!confirmacaoHistorico) return;
    const { historicoNotas } = confirmacaoHistorico;

    const notasFiltradas = historicoNotas.filter((item) => {
      if (filtroNota === '') return true;
      if (filtroNota === 'pro') return item.nota >= 9;
      if (filtroNota === 'pas') return item.nota >= 7 && item.nota <= 8;
      if (filtroNota === 'det') return item.nota <= 6;
      return item.nota === Number(filtroNota);
    });

    const totalRespostas = notasFiltradas.reduce((acc, curr) => acc + curr.quantidade, 0);

    const linhasHistorico = notasFiltradas.map((item) => {
      const nota = item.nota;
      const classificacao =
        nota >= 9 ? 'Promotor (9 e 10)' : nota >= 7 ? 'Passivo / Neutro (7 e 8)' : 'Detrator (0 a 6)';
      const pct = totalRespostas
        ? `${((100 * item.quantidade) / totalRespostas).toFixed(1).replace('.', ',')}%`
        : '0%';

      return {
        'Nota': nota,
        'Quantidade de Avaliações': item.quantidade,
        'Classificação NPS': classificacao,
        'Percentual no Mês': pct,
      };
    });

    const ws = XLSX.utils.json_to_sheet(linhasHistorico);
    ws['!cols'] = [
      { wch: 12 },
      { wch: 26 },
      { wch: 28 },
      { wch: 20 },
    ];
    ws['!autofilter'] = { ref: `A1:D${linhasHistorico.length + 1}` };

    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Histórico Consolidado');

    const nomeArquivo = `resumo-historico-nps-${tipo}-${mesBase.slice(0, 7)}.xlsx`;
    XLSX.writeFile(wb, nomeArquivo);

    fecharModalExcel();
  };

  const executarExportacaoExcel = async () => {
    setErroValidacao('');
    setEstado('gerando-excel');
    try {
      let datas = {};
      if (filtroPeriodo === 'custom') {
        if (!dataInicio || !dataFim) {
          setErroValidacao('Por favor, informe a data de início e a data de fim.');
          setEstado('parado');
          return;
        }
        const fimDataObj = new Date(dataFim);
        fimDataObj.setDate(fimDataObj.getDate() + 1);
        datas = {
          inicio: dataInicio,
          fim: fimDataObj.toISOString().slice(0, 10),
        };
      } else if (filtroPeriodo !== 'tudo' && mesBase) {
        datas = intervaloPeriodo(filtroPeriodo, mesBase);
      }

      const filtros = {
        tipo,
        nota: filtroNota,
        ...datas,
      };

      const respostas = await fetchRespostasParaExportacao(filtros);

      // Cenário 1: Respostas individuais digitais encontradas
      if (respostas && respostas.length > 0) {
        const linhas = respostas.map((item) => {
          const dataFormatada = new Date(item.created_at).toLocaleString('pt-BR', {
            timeZone: 'America/Sao_Paulo',
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
          });

          const municipio = item.cidade || findUnidadeById(item.unidade_id)?.nome || 'Não informado';

          return {
            'Data do Preenchimento': dataFormatada,
            'Município': municipio,
            'Nota Atribuída': item.nps_score ?? '',
            'Comentário': item.categoria_comentario || '',
          };
        });

        const ws = XLSX.utils.json_to_sheet(linhas);
        ws['!cols'] = [
          { wch: 22 },
          { wch: 26 },
          { wch: 16 },
          { wch: 70 },
        ];
        ws['!autofilter'] = { ref: `A1:D${linhas.length + 1}` };

        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, 'Respostas');

        const rotuloPeriodo =
          filtroPeriodo === 'custom'
            ? `${dataInicio}_a_${dataFim}`
            : filtroPeriodo === 'tudo'
            ? 'completo'
            : filtroPeriodo === 'mes'
            ? mesBase ? mesBase.slice(0, 7) : 'mes'
            : filtroPeriodo;
        const rotuloNota = filtroNota === '' ? 'todas-notas' : `nota-${filtroNota}`;
        const nomeArquivo = `respostas-nps-${tipo}-${rotuloPeriodo}-${rotuloNota}.xlsx`;

        XLSX.writeFile(wb, nomeArquivo);
        fecharModalExcel();
        return;
      }

      // Cenário 2: Histórico consolidado antigo (sem respostas individuais)
      if (filtroPeriodo === 'mes' && mesBase) {
        const historicoNotas = await fetchHistoricoNotasMes(mesBase);
        if (historicoNotas && historicoNotas.length > 0) {
          // Ativa o modal de confirmação em vez de alert!
          setConfirmacaoHistorico({ historicoNotas });
          setEstado('parado');
          return;
        }
      }

      setErroValidacao('Nenhuma resposta encontrada para os filtros selecionados.');
      setEstado('parado');
    } catch (err) {
      console.error(err);
      setEstado('erro');
    }
  };

  useEffect(() => {
    if (!dados || !relatorioRef.current) return;
    (async () => {
      try {
        const imagem = await toPng(relatorioRef.current, { width: 1920, height: 1080, pixelRatio: 1, cacheBust: true });
        const link = document.createElement('a');
        link.download = `relatorio-nps-${mesBase.slice(0, 7)}.png`;
        link.href = imagem;
        link.click();
        setEstado('parado');
      } catch {
        setEstado('erro');
      }
      setDados(null);
    })();
  }, [dados]);

  const emExecucao = estado === 'gerando-png' || estado === 'gerando-excel';

  return (
    <>
      <div className="dash-dropdown" ref={dropdownRef}>
        <button
          type="button"
          className="dash-btn"
          disabled={!resumo || emExecucao}
          onClick={() => setMenuAberto((prev) => !prev)}
        >
          {estado === 'gerando-png' ? 'Gerando PNG...' : 'Exportar relatório ▾'}
        </button>

        {menuAberto && (
          <div className="dash-dropdown__menu">
            <button
              type="button"
              className="dash-dropdown__item"
              onClick={() => {
                setMenuAberto(false);
                iniciarPng();
              }}
            >
              🖼️ Relatório em Imagem (PNG)
            </button>

            <button
              type="button"
              className="dash-dropdown__item"
              onClick={abrirModalExcel}
            >
              📊 Planilha de Dados (Excel)
            </button>
          </div>
        )}
      </div>

      {/* Modal de Exportação para Excel */}
      {modalExcelAberto && (
        <div className="dash-modal-fundo" role="dialog" aria-modal="true" aria-labelledby="modal-excel-titulo">
          <div className="dash-modal-caixa">
            <h2 id="modal-excel-titulo" className="dash-modal-titulo">
              Exportar Respostas (Excel)
            </h2>

            {confirmacaoHistorico ? (
              /* Visual de Confirmação quando o mês for do Histórico Antigo */
              <div className="dash-modal-confirmacao">
                <div className="dash-modal-aviso-box">
                  <span style={{ fontSize: 26, lineHeight: 1 }}>ℹ️</span>
                  <div>
                    <h3 style={{ margin: '0 0 6px', fontSize: 15, fontWeight: 800, color: '#0f2d44' }}>
                      Mês com Histórico Consolidado
                    </h3>
                    <p style={{ margin: 0, fontSize: 13, color: '#4a6275', lineHeight: 1.5 }}>
                      O mês selecionado (<strong>{formatMes(mesBase)}</strong>) faz parte do histórico consolidado antigo. Ele possui a soma das notas, mas não contém comentários individuais nem dados por respondente.
                    </p>
                  </div>
                </div>

                <p style={{ margin: '4px 0 0', fontSize: 14, fontWeight: 700, color: '#0f2d44' }}>
                  Deseja prosseguir e baixar a planilha com o resumo consolidado de notas?
                </p>

                <div className="dash-modal-acoes">
                  <button
                    type="button"
                    className="dash-btn"
                    onClick={baixarHistoricoConfirmado}
                  >
                    OK (Baixar Planilha)
                  </button>
                  <button
                    type="button"
                    className="dash-link"
                    onClick={() => setConfirmacaoHistorico(null)}
                  >
                    Cancelar
                  </button>
                </div>
              </div>
            ) : (
              /* Formulário Normal de Filtros */
              <>
                <p className="dash-modal-desc">
                  Escolha os filtros para gerar a planilha com Data, Município, Nota e Comentário.
                </p>

                <div className="dash-modal-campos">
                  <label className="dash-modal-campo">
                    Período
                    <select
                      value={filtroPeriodo}
                      onChange={(e) => {
                        setFiltroPeriodo(e.target.value);
                        setErroValidacao('');
                      }}
                    >
                      {PERIODOS_EXPORTACAO.map((p) => (
                        <option key={p.id} value={p.id}>
                          {p.id === 'mes' && mesBase ? `Mês base (${formatMes(mesBase)})` : p.nome}
                        </option>
                      ))}
                    </select>
                  </label>

                  {filtroPeriodo === 'custom' && (
                    <div className="dash-modal-datas">
                      <label className="dash-modal-campo">
                        De
                        <input
                          type="date"
                          value={dataInicio}
                          onChange={(e) => {
                            setDataInicio(e.target.value);
                            setErroValidacao('');
                          }}
                        />
                      </label>
                      <label className="dash-modal-campo">
                        Até
                        <input
                          type="date"
                          value={dataFim}
                          onChange={(e) => {
                            setDataFim(e.target.value);
                            setErroValidacao('');
                          }}
                        />
                      </label>
                    </div>
                  )}

                  <label className="dash-modal-campo">
                    Nota NPS
                    <select
                      value={filtroNota}
                      onChange={(e) => {
                        setFiltroNota(e.target.value);
                        setErroValidacao('');
                      }}
                    >
                      {NOTAS_EXPORTACAO.map((n) => (
                        <option key={n.id} value={n.id}>
                          {n.nome}
                        </option>
                      ))}
                    </select>
                  </label>
                </div>

                {erroValidacao && (
                  <p className="dash-erro" role="alert" style={{ margin: '4px 0 0', fontSize: 13 }}>
                    {erroValidacao}
                  </p>
                )}

                <div className="dash-modal-acoes">
                  <button
                    type="button"
                    className="dash-btn"
                    disabled={estado === 'gerando-excel'}
                    onClick={executarExportacaoExcel}
                  >
                    {estado === 'gerando-excel' ? 'Consultando dados...' : 'Baixar Planilha (.xlsx)'}
                  </button>
                  <button
                    type="button"
                    className="dash-link"
                    disabled={estado === 'gerando-excel'}
                    onClick={fecharModalExcel}
                  >
                    Cancelar
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {estado === 'erro' && (
        <span className="dash-erro" role="alert">
          Falha ao gerar o arquivo.
        </span>
      )}

      {dados && resumo && (
        <div className="rel-offscreen" aria-hidden="true">
          <RelatorioNps ref={relatorioRef} mesBase={mesBase} resumo={resumo} anual={anual} tipo={tipo} {...dados} />
        </div>
      )}
    </>
  );
}
