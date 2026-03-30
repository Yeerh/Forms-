import { useEffect, useMemo, useState } from "react";
import { getFormularioById, getFormularios, updateChecklist } from "../api/formularioApi";
import FormulariosTable from "../components/dashboard/FormulariosTable";
import FormularioDetailsModal from "../components/dashboard/FormularioDetailsModal";
import { useAuth } from "../context/AuthContext";

function DashboardPage() {
  const { logout, user } = useAuth();
  const [query, setQuery] = useState("");
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [modalOpen, setModalOpen] = useState(false);
  const [modalLoading, setModalLoading] = useState(false);
  const [modalError, setModalError] = useState("");
  const [savingChecklist, setSavingChecklist] = useState(false);
  const [selectedFormulario, setSelectedFormulario] = useState(null);

  async function fetchFormularios(search = "") {
    try {
      setLoading(true);
      setError("");
      const data = await getFormularios(search);
      setItems(data.items || []);
    } catch (requestError) {
      if (requestError.response?.status === 401) {
        logout();
        return;
      }

      setError(requestError.response?.data?.message || "Nao foi possivel carregar os formularios.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchFormularios();
  }, []);

  const filteredItems = useMemo(() => {
    if (!query.trim()) {
      return items;
    }

    const normalized = query.trim().toLowerCase();
    return items.filter((item) => {
      const nome = String(item.nomePessoa || "").toLowerCase();
      const matricula = String(item.matricula || "").toLowerCase();
      return nome.includes(normalized) || matricula.includes(normalized);
    });
  }, [items, query]);

  async function openDetails(id) {
    try {
      setModalOpen(true);
      setModalLoading(true);
      setModalError("");
      const data = await getFormularioById(id);
      setSelectedFormulario(data.formulario);
    } catch (requestError) {
      if (requestError.response?.status === 401) {
        logout();
        return;
      }

      setModalError(requestError.response?.data?.message || "Nao foi possivel carregar os detalhes.");
    } finally {
      setModalLoading(false);
    }
  }

  function closeModal() {
    setModalOpen(false);
    setModalError("");
    setSelectedFormulario(null);
  }

  function toggleChecklistItem(itemId) {
    setSelectedFormulario((current) => {
      if (!current) {
        return current;
      }

      const nextChecklist = (current.checklist || []).map((item) =>
        item.id === itemId ? { ...item, checked: !item.checked } : item
      );

      return {
        ...current,
        checklist: nextChecklist,
      };
    });
  }

  async function saveChecklist() {
    if (!selectedFormulario) {
      return;
    }

    try {
      setSavingChecklist(true);
      setModalError("");
      const data = await updateChecklist(selectedFormulario.id, selectedFormulario.checklist);
      const updated = data.formulario;
      setSelectedFormulario(updated);

      setItems((current) =>
        current.map((item) =>
          item.id === updated.id
            ? {
                ...item,
                statusVerificacao: updated.statusVerificacao,
                verificado: updated.verificado,
                checklistUpdatedAt: updated.checklistUpdatedAt,
              }
            : item
        )
      );
    } catch (requestError) {
      if (requestError.response?.status === 401) {
        logout();
        return;
      }

      setModalError(requestError.response?.data?.message || "Nao foi possivel salvar o checklist.");
    } finally {
      setSavingChecklist(false);
    }
  }

  return (
    <section className="dashboard-page">
      <header className="dashboard-header">
        <div>
          <h2>Dashboard de formularios</h2>
          <p className="muted">Usuario logado: {user?.name || user?.email || "Usuario"}</p>
        </div>
        <button type="button" className="ghost-button" onClick={() => fetchFormularios()}>
          Atualizar
        </button>
      </header>

      <div className="search-row">
        <input
          className="field-input"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Filtrar por nome ou matricula"
        />
        <span className="muted">{filteredItems.length} resultado(s)</span>
      </div>

      {loading ? <p className="muted">Carregando formularios...</p> : null}
      {error ? <p className="api-error">{error}</p> : null}
      {!loading && !error ? <FormulariosTable items={filteredItems} onOpenDetails={openDetails} /> : null}

      <FormularioDetailsModal
        isOpen={modalOpen}
        loading={modalLoading}
        error={modalError}
        formulario={selectedFormulario}
        onClose={closeModal}
        onToggleChecklist={toggleChecklistItem}
        onSaveChecklist={saveChecklist}
        saving={savingChecklist}
      />
    </section>
  );
}

export default DashboardPage;

