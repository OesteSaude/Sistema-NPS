import { useState } from 'react';
import { fetchComentariosParaAnalise } from '../dashboardQueries';
import { analisarComentarios } from '../dashboardExtras';
import './AnaliseIA.css';

const ROTULO = {
  diminuiu: 'Diminuiu ao longo do período',
  aumentou: 'Aumentou ao longo do período',
  estavel: 'Estável no período',
  insuficiente: 'Dados insuficientes para ver a tendência',
};
const COR = { diminuiu: '#1f5f27', aumentou: '#b5202d', estavel: '#4a6275', insuficiente: '#4a6275' };

const formatarMes = (mes) => `${mes.slice(5)}/${mes.slice(2, 4)}`;

export default function AnaliseIA({ filtros }) {
  const [aberto, setAberto] = useState(false);
  const [estado, setEstado] = useState('parado');
  const [relatorio, setRelatorio] = useState(null);
  const [mensagem, setMensagem] = useState('');

  const gerar = async () => {
    setAberto(true);
    setEstado('gerando');
    setRelatorio(null);
    try {
      const comentarios = await fetchComentariosParaAnalise(filtros);
      if (comentarios.length === 0) {
        setMensagem('Não há comentários nesse critério para analisar.');
        setEstado('erro');
        return;
      }
      setRelatorio(await analisarComentarios(comentarios));
      setEstado('pronto');
    } catch (erro) {
      setMensagem(erro.message || 'Não foi possível gerar a análise.');
      setEstado('erro');
    }
  };

  return (
    <>
      <button type="button" className="dash-btn ia-botao" onClick={gerar} disabled={estado === 'gerando'}>
        {estado === 'gerando' ? 'Analisando...' : 'Analisar com IA'}
      </button>
      {aberto && (
        <div className="ia-fundo" role="dialog" aria-modal="true" aria-labelledby="ia-titulo">
          <div className="ia-caixa">
            <h2 id="ia-titulo" className="dash-titulo">
              ANÁLISE DOS COMENTÁRIOS
            </h2>
            {estado === 'gerando' && <p>Lendo os comentários e montando o relatório. Isso leva alguns segundos...</p>}
            {estado === 'erro' && <p className="dash-erro">{mensagem}</p>}
            {estado === 'pronto' && relatorio && (
              <>
                <p>{relatorio.resumo}</p>
                <p className="dash-muted">{relatorio.total_analisado} comentários analisados (os mais recentes do filtro, até 300)</p>
                {relatorio.temas.length === 0 && <p className="dash-muted">Nenhum problema recorrente foi identificado.</p>}
                {relatorio.temas.map((tema) => (
                  <div className="ia-tema" key={tema.nome}>
                    <div className="ia-tema__topo">
                      <b>{tema.nome}</b>
                      <span className="dash-muted">{tema.quantidade} comentários</span>
                    </div>
                    <p>{tema.descricao}</p>
                    <span className="ia-tendencia" style={{ color: COR[tema.tendencia] }}>
                      {ROTULO[tema.tendencia]}
                    </span>
                    <div className="ia-meses">
                      {Object.entries(tema.por_mes).map(([mes, quantidade]) => (
                        <span key={mes}>
                          {formatarMes(mes)}: {quantidade}
                        </span>
                      ))}
                    </div>
                    <ul>
                      {tema.plano_acao.map((acao) => (
                        <li key={acao}>{acao}</li>
                      ))}
                    </ul>
                  </div>
                ))}
                <p className="dash-muted ia-aviso">
                  Relatório gerado por IA a partir do texto dos comentários. Nome, telefone e cidade não são enviados. Revise antes
                  de agir.
                </p>
              </>
            )}
            <div className="ia-acoes">
              <button type="button" className="dash-link" onClick={() => setAberto(false)}>
                Fechar
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}