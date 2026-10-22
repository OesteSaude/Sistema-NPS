import { useEffect, useRef, useState } from 'react';
import { toPng } from 'html-to-image';
import RelatorioNps from './RelatorioNps';
import { fetchTextosComentarios } from '../dashboardQueries';
import { fetchResumoMensalCompleto, calcularJanelas } from '../dashboardExtras';
import { contarPalavras } from '../nps';

export default function ExportarRelatorioButton({ mesBase, resumo, anual }) {
  const relatorioRef = useRef(null);
  const [dados, setDados] = useState(null);
  const [estado, setEstado] = useState('parado');

  const iniciar = async () => {
    setEstado('gerando');
    try {
      const [meses, textos] = await Promise.all([fetchResumoMensalCompleto(), fetchTextosComentarios()]);
      setDados({ janelas: calcularJanelas(meses, mesBase), palavras: contarPalavras(textos, 5) });
    } catch {
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

  return (
    <>
      <button type="button" className="dash-btn" disabled={!resumo || estado === 'gerando'} onClick={iniciar}>
        {estado === 'gerando' ? 'Gerando...' : 'Exportar relatório'}
      </button>
      {estado === 'erro' && (
        <span className="dash-erro" role="alert">
          Falha ao gerar o relatório.
        </span>
      )}
      {dados && resumo && (
        <div className="rel-offscreen" aria-hidden="true">
          <RelatorioNps ref={relatorioRef} mesBase={mesBase} resumo={resumo} anual={anual} {...dados} />
        </div>
      )}
    </>
  );
}
