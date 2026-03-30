const documentOptions = [
  "Relatórios internos",
  "Fotos da execução",
  "Documentos de licitação/contrato",
  "Outros",
];

function DocumentChecklist({ selected, onToggle, outrosValue, onOutrosChange, errors }) {
  const hasOutros = selected.includes("Outros");

  return (
    <div className="field-wrapper">
      <span className="field-label">
        Tipos de documentos <span className="required-dot">*</span>
      </span>
      <div className="checkbox-grid">
        {documentOptions.map((option) => (
          <label key={option} className={selected.includes(option) ? "checkbox-card selected" : "checkbox-card"}>
            <input type="checkbox" checked={selected.includes(option)} onChange={() => onToggle(option)} />
            <span>{option}</span>
          </label>
        ))}
      </div>

      {errors.tiposDocumentos ? <p className="field-error">{errors.tiposDocumentos}</p> : null}

      {hasOutros ? (
        <div className="field-wrapper compact">
          <label className="field-label" htmlFor="outrosDocumento">
            Detalhar "Outros" <span className="required-dot">*</span>
          </label>
          <input
            id="outrosDocumento"
            name="outrosDocumento"
            value={outrosValue}
            onChange={onOutrosChange}
            className={errors.outrosDocumento ? "field-input has-error" : "field-input"}
            placeholder="Descreva o documento"
          />
          {errors.outrosDocumento ? <p className="field-error">{errors.outrosDocumento}</p> : null}
        </div>
      ) : null}
    </div>
  );
}

export default DocumentChecklist;

