import Header from './Header';
import Footer from './Footer';
import './PageShell.css';

export default function PageShell({ children, wide = false }) {
  return (
    <div className="page-shell">
      <Header />
      <main className={wide ? 'page-shell__content page-shell__content--wide' : 'page-shell__content'}>{children}</main>
      <Footer />
    </div>
  );
}
