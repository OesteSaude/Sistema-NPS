import Header from './Header';
import Footer from './Footer';
import './PageShell.css';

export default function PageShell({ children }) {
  return (
    <div className="page-shell">
      <Header />
      <main className="page-shell__content">{children}</main>
      <Footer />
    </div>
  );
}
