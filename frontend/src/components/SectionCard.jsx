function SectionCard({ title, subtitle, children }) {
  return (
    <section className="section-card">
      <div className="section-header">
        <h3>{title}</h3>
        {subtitle ? <p>{subtitle}</p> : null}
      </div>
      <div className="section-content">{children}</div>
    </section>
  );
}

export default SectionCard;

