import iconeSeta from '../assets/elements/icone-seta.svg';
import './SubmitButton.css';

export default function SubmitButton({ children = 'ENVIAR', ...buttonProps }) {
  return (
    <button type="submit" className="submit-button" {...buttonProps}>
      <span>{children}</span>
      <img className="submit-button__icon" src={iconeSeta} alt="" aria-hidden="true" />
    </button>
  );
}
