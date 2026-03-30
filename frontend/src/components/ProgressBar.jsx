function ProgressBar({ value }) {
  return (
    <div className="progress-wrapper" role="progressbar" aria-valuemin={0} aria-valuemax={100} aria-valuenow={value}>
      <div className="progress-track">
        <div className="progress-fill" style={{ width: `${value}%` }} />
      </div>
      <span className="progress-label">{value}% concluído</span>
    </div>
  );
}

export default ProgressBar;

