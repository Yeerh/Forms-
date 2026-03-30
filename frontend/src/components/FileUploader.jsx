import { useEffect, useMemo } from "react";

function formatFileSize(bytes) {
  if (bytes < 1024) {
    return `${bytes} B`;
  }

  const kilobytes = bytes / 1024;
  if (kilobytes < 1024) {
    return `${kilobytes.toFixed(1)} KB`;
  }

  return `${(kilobytes / 1024).toFixed(2)} MB`;
}

function FileUploader({ files, onFilesSelected, onFileRemove, error }) {
  const previews = useMemo(() => {
    return files.map((file) => ({
      key: `${file.name}-${file.lastModified}`,
      name: file.name,
      size: file.size,
      previewUrl: file.type === "image/png" ? URL.createObjectURL(file) : null,
    }));
  }, [files]);

  useEffect(() => {
    return () => {
      previews.forEach((item) => {
        if (item.previewUrl) {
          URL.revokeObjectURL(item.previewUrl);
        }
      });
    };
  }, [previews]);

  return (
    <div className="field-wrapper">
      <label className="field-label" htmlFor="documentosApoio">
        Upload de arquivos (PDF/PNG) <span className="required-dot">*</span>
      </label>

      <input
        id="documentosApoio"
        type="file"
        multiple
        accept=".pdf,.png,application/pdf,image/png"
        className={error ? "field-input has-error file-input" : "field-input file-input"}
        onChange={(event) => {
          const nextFiles = Array.from(event.target.files || []);
          onFilesSelected(nextFiles);
          event.target.value = "";
        }}
      />

      {error ? <p className="field-error">{error}</p> : null}

      {previews.length > 0 ? (
        <ul className="file-list">
          {previews.map((item) => (
            <li key={item.key} className="file-item">
              <div className="file-item-left">
                {item.previewUrl ? <img src={item.previewUrl} alt={item.name} className="file-thumb" /> : null}
                <div>
                  <p className="file-name">{item.name}</p>
                  <p className="file-size">{formatFileSize(item.size)}</p>
                </div>
              </div>

              <button type="button" className="ghost-button" onClick={() => onFileRemove(item.name)}>
                Remover
              </button>
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}

export default FileUploader;

