function DashboardTable({ items }) {
  if (!items.length) {
    return <p className="empty-state">Ainda não há formulários enviados.</p>;
  }

  return (
    <div className="table-wrapper">
      <table>
        <thead>
          <tr>
            <th>Data envio</th>
            <th>Secretaria</th>
            <th>Projeto</th>
            <th>Situação</th>
            <th>Execução</th>
            <th>Anexos</th>
          </tr>
        </thead>
        <tbody>
          {items.map((item) => (
            <tr key={item.id}>
              <td>{item.envio?.dataEnvio || "-"}</td>
              <td>{item.identificador?.secretaria || "-"}</td>
              <td>{item.projetoAcao?.nomeProjeto || "-"}</td>
              <td>{item.situacaoProjeto?.status || "-"}</td>
              <td>{item.situacaoProjeto?.percentualExecucao ?? "-"}%</td>
              <td>{item.documentosApoio?.arquivos?.length || 0}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default DashboardTable;

