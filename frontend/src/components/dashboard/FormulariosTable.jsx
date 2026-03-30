function statusLabel(status) {
  if (status === "aprovado") {
    return "Aprovado";
  }

  if (status === "em_analise") {
    return "Em analise";
  }

  return "Pendente";
}

function FormulariosTable({ items, onOpenDetails }) {
  if (!items.length) {
    return <p className="empty-state">Nenhum formulario encontrado.</p>;
  }

  return (
    <div className="table-wrapper">
      <table>
        <thead>
          <tr>
            <th>Nome da pessoa</th>
            <th>Matricula</th>
            <th>Status</th>
            <th>Acao</th>
          </tr>
        </thead>
        <tbody>
          {items.map((item) => (
            <tr key={item.id}>
              <td>{item.nomePessoa || "-"}</td>
              <td>{item.matricula || "-"}</td>
              <td>
                <span className={`status-badge ${item.statusVerificacao || "pendente"}`}>
                  {statusLabel(item.statusVerificacao)}
                </span>
              </td>
              <td>
                <button type="button" className="ghost-button" onClick={() => onOpenDetails(item.id)}>
                  Ver detalhes
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default FormulariosTable;

