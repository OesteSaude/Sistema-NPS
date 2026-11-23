import { useEffect, useRef, useState } from 'react';
import { toPng } from 'html-to-image';
import * as XLSX from 'xlsx';
import RelatorioNps from './RelatorioNps';
import { fetchTextosComentarios, fetchRespostasParaExportacao } from '../dashboardQueries';
import { fetchResumoMensalCompleto, calcularJanelas, intervaloPeriodo } from '../dashboardExtras';
import { contarPalavras, formatMes } from '../nps';
import { findUnidadeById } from '../../../data/unidades';

const PERIODOS_EXPORTACAO = [
  { id: 'mes', nome: 'Mês base selecionado' },
  { id: 'tudo', nome: 'Todo o período (Histórico completo)' },
  { id: 'ytd', nome: 'Acumulado do ano' },
  { id: '3m', nome: 'Últimos 3 meses' },
  { id: '12m', nome: 'Últimos 12 meses' },
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

  const iniciarPng = async () => {
    setEstado('gerando-png');
    try {
      const [meses, textos] = await Promise.all([fetchResumoMensalCompleto(tipo), fetchTextosComentarios(tipo)]);
      setDados({ janelas: calcularJanelas(meses, mesBase), palavras: contarPalavras(textos, 5) });
    } catch {
      setEstado('erro');
    }
  };

  const executarExportacaoExcel = async () => {
    setEstado('gerando-excel');
    try {
      let datas = {};
      if (filtroPeriodo !== 'tudo' && mesBase) {
        datas = intervaloPeriodo(filtroPeriodo, mesBase);
      }

      const filtros = {
        tipo,
        nota: filtroNota,
        ...datas,
      };

      const respostas = await fetchRespostasParaExportacao(filtros);

      if (!respostas || respostas.length === 0) {
        alert('Nenhuma resposta encontrada para os filtros selecionados.');
        setEstado('parado');
        return;
      }

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

      // Largura das colunas
      ws['!cols'] = [
        { wch: 22 }, // Data do Preenchimento
        { wch: 26 }, // Município
        { wch: 16 }, // Nota Atribuída
        { wch: 70 }, // Comentário
      ];

      // Ativa AutoFilter nativo do Excel
      ws['!autofilter'] = { ref: `A1:D${linhas.length + 1}` };

      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, 'Respostas');

      const rotuloPeriodo =
        filtroPeriodo === 'tudo'
          ? 'completo'
          : filtroPeriodo === 'mes'
          ? mesBase ? mesBase.slice(0, 7) : 'mes'
          : filtroPeriodo;
      const rotuloNota = filtroNota === '' ? 'todas-notas' : `nota-${filtroNota}`;
      const nomeArquivo = `respostas-nps-${tipo}-${rotuloPeriodo}-${rotuloNota}.xlsx`;

      XLSX.writeFile(wb, nomeArquivo);
      setModalExcelAberto(false);
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
              onClick={() => {
                setMenuAberto(false);
                setModalExcelAberto(true);
              }}
            >
              📊 Planilha de Dados (Excel)
            </button>
          </div>
        )}
      </div>

      {/* Modal de Configuração do Filtro do Excel */}
      {modalExcelAberto && (
        <div className="dash-modal-fundo" role="dialog" aria-modal="true" aria-labelledby="modal-excel-titulo">
          <div className="dash-modal-caixa">
            <h2 id="modal-excel-titulo" className="dash-modal-titulo">
              Exportar Respostas (Excel)
            </h2>
            <p className="dash-modal-desc">
              Escolha os filtros para gerar a planilha com Data, Município, Nota e Comentário.
            </p>

            <div className="dash-modal-campos">
              <label className="dash-modal-campo">
                Período
                <select value={filtroPeriodo} onChange={(e) => setFiltroPeriodo(e.target.value)}>
                  {PERIODOS_EXPORTACAO.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.id === 'mes' && mesBase ? `Mês base (${formatMes(mesBase)})` : p.nome}
                    </option>
                  ))}
                </select>
              </label>

              <label className="dash-modal-campo">
                Nota NPS
                <select value={filtroNota} onChange={(e) => setFiltroNota(e.target.value)}>
                  {NOTAS_EXPORTACAO.map((n) => (
                    <option key={n.id} value={n.id}>
                      {n.nome}
                    </option>
                  ))}
                </select>
              </label>
            </div>

            <div className="dash-modal-acoes">
              <button
                type="button"
                className="dash-btn"
                disabled={estado === 'gerando-excel'}
                onClick={executarExportacaoExcel}
              >
                {estado === 'gerando-excel' ? 'Baixando Excel...' : 'Baixar Planilha (.xlsx)'}
              </button>
              <button
                type="button"
                className="dash-link"
                disabled={estado === 'gerando-excel'}
                onClick={() => setModalExcelAberto(false)}
              >
                Cancelar
              </button>
            </div>
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
