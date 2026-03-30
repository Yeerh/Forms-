const statusOptions = [
  "Em andamento",
  "Concluído",
  "Atenção (atraso ou dificuldade)",
  "Não iniciado",
];

function StatusCheckboxGroup({ value, onChange, error }) {
  return (
    <div className="field-wrapper">
      <span className="field-label">
        Situação do projeto <span className="required-dot">*</span>
      </span>
      <div className="checkbox-grid">
        {statusOptions.map((option) => (
          <label key={option} className={value === option ? "checkbox-card selected" : "checkbox-card"}>
            <input
              type="checkbox"
              checked={value === option}
              onChange={() => onChange(value === option ? "" : option)}
            />
            <span>{option}</span>
          </label>
        ))}
      </div>
      {error ? <p className="field-error">{error}</p> : null}
    </div>
  );
}

export default StatusCheckboxGroup;

