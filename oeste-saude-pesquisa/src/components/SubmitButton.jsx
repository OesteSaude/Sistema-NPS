import './SubmitButton.css';

export default function SubmitButton({ children = 'ENVIAR', ...buttonProps }) {
  return (
    <button type="submit" className="submit-button" {...buttonProps}>
      <span>{children}</span>
      <span className="submit-button__icon" aria-hidden="true">→</span>
    </button>
  );
}
