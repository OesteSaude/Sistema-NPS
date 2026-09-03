import './Header.css';

export default function Header() {
  return (
    <header className="header">
      <div className="header__logo">
        Oeste Saúde
        <span className="header__logo-icon" aria-hidden="true">S</span>
      </div>
      <div className="header__badge">
        Pesquisa de <span className="header__badge-highlight">Satisfação</span> do Usuário
      </div>
    </header>
  );
}
