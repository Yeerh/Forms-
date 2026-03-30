import { apiBaseUrl } from "../../api/httpClient";

function buildFileUrl(fileUrl = "") {
  if (!fileUrl) {
    return "#";
  }

  if (fileUrl.startsWith("http://") || fileUrl.startsWith("https://")) {
    return fileUrl;
  }

  return `${apiBaseUrl}${fileUrl}`;
}

function FormularioDetailsModal({
  isOpen,
  loading,
  error,
  formulario,
  onClose,
  onToggleChecklist,
  onSaveChecklist,
  saving,
}) {
  if (!isOpen) {
    return null;
  }

  return (
    <div className="modal-backdrop" role="dialog" aria-modal="true">
      <div className="modal-card">
        <header className="modal-header">
          <div>
            <h3>Detalhes do formulario</h3>
            {formulario ? (
              <p>
                {formulario.nomePessoa || "-"} | Matricula: {formulario.matricula || "-"}
              </p>
            ) : null}
          </div>
          <button type="button" className="ghost-button" onClick={onClose}>
            Fechar
          </button>
        </header>

        {loading ? <p className="muted">Carregando detalhes...</p> : null}
        {error ? <p className="api-error">{error}</p> : null}

        {!loading && !error && formulario ? (
          <div className="modal-grid">
            <section className="modal-column">
              <h4>Documentos enviados</h4>

              <div className="doc-types">
                <p className="muted">Tipos de documentos:</p>
                <ul>
                  {(formulario.documentosApoio?.tipos || []).map((tipo) => (
                    <li key={tipo}>{tipo}</li>
                  ))}
                </ul>
              </div>

              <div className="doc-list">
                {(formulario.documentos || []).length ? (
                  formulario.documentos.map((doc) => {
                    const file = doc.arquivo || {};
                    const fileUrl = buildFileUrl(file.url);
                    const isImage = file.mimeType === "image/png";

                    return (
                      <article key={doc.id} className="doc-item">
                        <div>
                          <strong>{doc.tipo || "Documento"}</strong>
                          <p>{file.originalName || "Arquivo"}</p>
                        </div>

                        {isImage ? (
                          <img src={fileUrl} alt={file.originalName || "Imagem"} className="doc-preview" />
                        ) : (
                          <a href={fileUrl} target="_blank" rel="noreferrer" className="primary-link">
                            Abrir PDF
                          </a>
                        )}
                      </article>
                    );
                  })
                ) : (
                  <p className="empty-state">Sem documentos anexados.</p>
                )}
              </div>
            </section>

            <section className="modal-column">
              <h4>Checklist de validacao</h4>
              <div className="checklist-list">
                {(formulario.checklist || []).map((item) => (
                  <label key={item.id} className="checklist-item">
                    <input
                      type="checkbox"
                      checked={!!item.checked}
                      onChange={() => onToggleChecklist(item.id)}
                      disabled={saving}
                    />
                    <span>{item.label}</span>
                  </label>
                ))}
              </div>

              <button type="button" className="primary-button" onClick={onSaveChecklist} disabled={saving}>
                {saving ? "Salvando..." : "Salvar verificacao"}
              </button>
            </section>
          </div>
        ) : null}
      </div>
    </div>
  );
}

export default FormularioDetailsModal;

