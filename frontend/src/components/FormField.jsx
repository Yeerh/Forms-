function FormField({
  label,
  name,
  value,
  onChange,
  error,
  required = false,
  textarea = false,
  className = "",
  ...props
}) {
  const fieldId = `field-${name}`;

  return (
    <div className={`field-wrapper ${className}`.trim()}>
      <label htmlFor={fieldId} className="field-label">
        {label}
        {required ? <span className="required-dot">*</span> : null}
      </label>

      {textarea ? (
        <textarea
          id={fieldId}
          name={name}
          value={value}
          onChange={onChange}
          className={error ? "field-input has-error" : "field-input"}
          {...props}
        />
      ) : (
        <input
          id={fieldId}
          name={name}
          value={value}
          onChange={onChange}
          className={error ? "field-input has-error" : "field-input"}
          {...props}
        />
      )}

      {error ? <p className="field-error">{error}</p> : null}
    </div>
  );
}

export default FormField;

