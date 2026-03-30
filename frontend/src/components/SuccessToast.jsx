function SuccessToast({ message, onClose }) {
  return (
    <div className="success-toast" role="status">
      <div>
        <strong>Envio concluído</strong>
        <p>{message}</p>
      </div>
      <button type="button" className="ghost-button" onClick={onClose}>
        Fechar
      </button>
    </div>
  );
}

export default SuccessToast;

