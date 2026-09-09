import { useState } from 'react';
import PageShell from '../components/PageShell';
import './ObrigadoPage.css';

const STAR_COUNT = 5;
const HIGHLIGHTED_STAR_INDEX = 2;

export default function ObrigadoPage() {
  const [formData, setFormData] = useState({
    nome: '',
    cidade: '',
    telefone: '',
  });

  const [status, setStatus] = useState('form');

  const formatPhone = (value) => {
    const numbers = value.replace(/\D/g, '');
    const truncated = numbers.slice(0, 11);

    if (truncated.length <= 2) return truncated ? `(${truncated}` : '';
    if (truncated.length <= 6) return `(${truncated.slice(0, 2)}) ${truncated.slice(2)}`;
    if (truncated.length <= 10) return `(${truncated.slice(0, 2)}) ${truncated.slice(2, 6)}-${truncated.slice(6)}`;
    return `(${truncated.slice(0, 2)}) ${truncated.slice(2, 7)}-${truncated.slice(7, 11)}`;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === 'telefone' ? formatPhone(value) : value,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // Envia os dados para a API se necessário
    console.log('Inscrição no sorteio:', formData);
    setStatus('success_sorteio');
  };

  const handleSkip = () => {
    setStatus('skipped');
  };

  return (
    <PageShell>
      <div className="obrigado">
        {/* Estrelas do Topo */}
        <div className="obrigado__stars" aria-hidden="true">
          {Array.from({ length: STAR_COUNT }, (_, index) => (
            <span
              key={index}
              className={
                index === HIGHLIGHTED_STAR_INDEX
                  ? 'obrigado__star obrigado__star--active'
                  : 'obrigado__star'
              }
            >
              ★
            </span>
          ))}
        </div>

        {/* Título Principal */}
        <p className="obrigado__title">
          <strong>Obrigado</strong> por participar
          <br />
          da nossa pesquisa!
        </p>

        {status === 'form' && (
          <div className="obrigado__content">
            <p className="obrigado__subtitle">
              Quer concorrer a prêmios? Preencha os dados abaixo para participar do sorteio:
            </p>

            <form className="obrigado__form" onSubmit={handleSubmit}>
              <div className="obrigado__field">
                <input
                  type="text"
                  name="nome"
                  placeholder="NOME"
                  value={formData.nome}
                  onChange={handleChange}
                  className="obrigado__input"
                  required
                />
              </div>

              <div className="obrigado__field">
                <input
                  type="text"
                  name="cidade"
                  placeholder="CIDADE"
                  value={formData.cidade}
                  onChange={handleChange}
                  className="obrigado__input"
                  required
                />
              </div>

              <div className="obrigado__field">
                <input
                  type="tel"
                  name="telefone"
                  placeholder="TELEFONE PARA CONTATO"
                  value={formData.telefone}
                  onChange={handleChange}
                  className="obrigado__input"
                  maxLength={15}
                  required
                />
              </div>

              <div className="obrigado__actions">
                <button type="submit" className="obrigado__button obrigado__button--primary">
                  Garantir minha participação
                </button>

                <button
                  type="button"
                  onClick={handleSkip}
                  className="obrigado__button-skip"
                >
                  Não quero participar, apenas finalizar
                </button>
              </div>
            </form>
          </div>
        )}

        {status === 'success_sorteio' && (
          <div className="obrigado__feedback obrigado__feedback--success">
            <div className="obrigado__check-icon">✓</div>
            <h3>Inscrição Confirmada!</h3>
            <p>
              Sua participação no sorteio foi computada com sucesso. Boa sorte!
            </p>
          </div>
        )}

        {status === 'skipped' && (
          <div className="obrigado__feedback">
            <p className="obrigado__finished-text">
              Sua avaliação foi registrada com sucesso.
              <br />
              A Oeste Saúde agradece a sua colaboração!
            </p>
          </div>
        )}
      </div>
    </PageShell>
  );
}