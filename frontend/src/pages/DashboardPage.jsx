import { useEffect, useState } from "react";
import { getFormularios } from "../api/formularioApi";
import DashboardTable from "../components/DashboardTable";
import SectionCard from "../components/SectionCard";

function DashboardPage() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  async function loadData() {
    setLoading(true);
    setError("");

    try {
      const data = await getFormularios();
      setItems(data.items || []);
    } catch (apiError) {
      const message = apiError.response?.data?.message || "Não foi possível carregar os formulários.";
      setError(message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadData();
  }, []);

  return (
    <section className="page-stack">
      <SectionCard title="Dashboard de envios" subtitle="Visualize rapidamente os formulários já registrados.">
        <div className="dashboard-header">
          <span>{items.length} formulário(s) encontrado(s)</span>
          <button type="button" className="ghost-button" onClick={loadData}>
            Atualizar
          </button>
        </div>

        {loading ? <p className="muted">Carregando dados...</p> : null}
        {error ? <p className="api-error">{error}</p> : null}
        {!loading && !error ? <DashboardTable items={items} /> : null}
      </SectionCard>
    </section>
  );
}

export default DashboardPage;

