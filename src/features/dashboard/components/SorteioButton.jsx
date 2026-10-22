import { useState } from 'react';
import { sortearParticipante } from '../dashboardExtras';
import { formatMes } from '../nps';
import './SorteioButton.css';

export default function SorteioButton({ mesBase }) {
  const [aberto, setAberto] = useState(false);
  const [estado, setEstado] = useState('confirmar');
  const [resultado, setResultado] = useState(null);
  const [mensagem, setMensagem] = useState('');

  const abrir = () => {
    setEstado('confirmar');
    setResultado(null);
    setAberto(true);
  };

  const sortear = async () => {
    setEstado('sorteando');
    try {
      setResultado(await sortearParticipante(mesBase));
      setEstado('resultado');
    } catch (erro) {
      setMensagem(
        erro.message.includes('Nenhum participante')
          ? 'Não há participantes inscritos neste mês.'
          : 'Não foi possível realizar o sorteio.',
      );
      setEstado('erro');
    }
  };

  return (
    <>
      <button type="button" className="dash-btn" disabled={!mesBase} onClick={abrir}>
        Sortear brinde
      </button>
      {aberto && (
        <div className="sorteio-fundo" role="dialog" aria-modal="true" aria-labelledby="sorteio-titulo">
          <div className="sorteio-caixa">
            <h2 id="sorteio-titulo" className="sorteio-titulo">
              Brinde de {formatMes(mesBase)}
            </h2>
            {estado === 'confirmar' && (
              <>
                <p>O resultado fica registrado e não pode ser refeito para este mês. Deseja sortear agora?</p>
                <div className="sorteio-acoes">
                  <button type="button" className="dash-btn" onClick={sortear}>
                    Sortear
                  </button>
                  <button type="button" className="dash-link" onClick={() => setAberto(false)}>
                    Cancelar
                  </button>
                </div>
              </>
            )}
            {estado === 'sorteando' && <p>Sorteando...</p>}
            {estado === 'erro' && (
              <>
                <p className="dash-erro">{mensagem}</p>
                <button type="button" className="dash-link" onClick={() => setAberto(false)}>
                  Fechar
                </button>
              </>
            )}
            {estado === 'resultado' && resultado && (
              <>
                <p className="sorteio-nome">{resultado.vencedor_nome}</p>
                <p>
                  {resultado.vencedor_cidade} · {resultado.vencedor_telefone}
                </p>
                <p className="dash-muted">
                  {resultado.ja_sorteado ? 'Resultado já registrado' : 'Sorteio realizado'} em{' '}
                  {new Date(resultado.data_sorteio).toLocaleString('pt-BR')} · {resultado.total_participantes}{' '}
                  participantes no mês
                </p>
                <button type="button" className="dash-link" onClick={() => setAberto(false)}>
                  Fechar
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </>
  );
}
