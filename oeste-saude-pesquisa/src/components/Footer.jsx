import './Footer.css';

const FOOTER_COLUMNS = [
  {
    title: 'Planos',
    links: ['Plano Coletivo por Adesão', 'Plano Empresarial', 'Plano Ouro', 'Plano Premium', 'Plano Exclusivo'],
  },
  {
    title: 'Sobre Nós',
    links: ['Quem Somos', 'Parcerias', 'Blog', 'Seja Parceiro', 'Demonstrações Financeiras', 'Resoluções', 'Programa de Qualificação de Operadoras', 'Política de Privacidade'],
  },
  {
    title: 'Atendimento',
    links: ['Para Beneficiário', 'Para Empresa', 'Para Prestadores', 'Central de Ajuda', 'Ouvidoria', 'Atendimento Abramge', 'Trabalhe Conosco'],
  },
];

export default function Footer() {
  return (
    <footer className="footer">
      <div className="footer__main">
        <div className="footer__brand">
          <span className="footer__brand-icon" aria-hidden="true">S</span>
          <p className="footer__seal">ANS - Nº41673-8</p>
          <p className="footer__legal">
            Oeste Saude Assist a Saude Suplementar SA - CNPJ: 08.708.980/0001-93
          </p>
          <p className="footer__legal">Av. 11 de Maio, 1521 - Parque do Povo - Presidente Prudente/SP</p>
          <div className="footer__social" aria-label="Redes sociais">
            <span className="footer__social-icon" aria-hidden="true" />
            <span className="footer__social-icon" aria-hidden="true" />
            <span className="footer__social-icon" aria-hidden="true" />
          </div>
        </div>

        {FOOTER_COLUMNS.map((column) => (
          <nav className="footer__column" key={column.title} aria-label={column.title}>
            <h3>{column.title}</h3>
            <ul>
              {column.links.map((link) => (
                <li key={link}>{link}</li>
              ))}
            </ul>
          </nav>
        ))}
      </div>
      <div className="footer__bar">Copyright © 2026 Oeste Saúde • Todos os direitos reservados</div>
    </footer>
  );
}
