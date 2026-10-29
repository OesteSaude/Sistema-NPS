import "./Header.css";

export default function Header() {
  return (
    <header className="header">
      <div className="header__logo">
        <img 
          src="/logo_oestesaude_svg.svg" 
          alt="Oeste Saúde" 
          className="header__logo-img" 
        />
      </div>
      <div className="header__badge">
        Pesquisa de <span className="header__badge-highlight">Satisfação</span> do Usuário
      </div>
    </header>
  );
}