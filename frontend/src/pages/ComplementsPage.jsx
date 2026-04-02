import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { saveComplementsRequest } from "../api/authApi";
import { useAuth } from "../context/AuthContext";

function createInitialState(user) {
  return {
    name: user?.name || "",
    email: user?.email || "",
    cpf: user?.cpf || "",
    phone: user?.phone || "",
  };
}

function formatCpf(value) {
  const digits = value.replace(/\D/g, "").slice(0, 11);

  return digits
    .replace(/^(\d{3})(\d)/, "$1.$2")
    .replace(/^(\d{3})\.(\d{3})(\d)/, "$1.$2.$3")
    .replace(/\.(\d{3})(\d{1,2})$/, ".$1-$2");
}

function formatPhone(value) {
  const digits = value.replace(/\D/g, "").slice(0, 11);

  if (digits.length <= 10) {
    return digits.replace(/^(\d{2})(\d)/, "($1) $2").replace(/(\d{4})(\d{1,4})$/, "$1-$2");
  }

  return digits.replace(/^(\d{2})(\d)/, "($1) $2").replace(/(\d{5})(\d{1,4})$/, "$1-$2");
}

function ComplementsPage() {
  const navigate = useNavigate();
  const { user, updateSession, token } = useAuth();
  const [formData, setFormData] = useState(() => createInitialState(user));
  const [apiError, setApiError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setFormData(createInitialState(user));
  }, [user]);

  useEffect(() => {
    if (user?.complemented) {
      navigate("/dashboard", { replace: true });
    }
  }, [navigate, user]);

  function updateField(field, value) {
    setFormData((current) => ({
      ...current,
      [field]: value,
    }));
    setApiError("");
    setSuccessMessage("");
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setApiError("");
    setSuccessMessage("");

    if (!formData.name.trim() || !formData.email.trim() || !formData.cpf.trim() || !formData.phone.trim()) {
      setApiError("Preencha nome, email, CPF e telefone.");
      return;
    }

    try {
      setLoading(true);
      const response = await saveComplementsRequest({
        name: formData.name.trim(),
        email: formData.email.trim(),
        cpf: formData.cpf.trim(),
        phone: formData.phone.trim(),
      });

      updateSession(response.token || token, response.user);
      setSuccessMessage("Dados complementares salvos com sucesso.");
      navigate("/dashboard", { replace: true });
    } catch (error) {
      setApiError(error.response?.data?.message || "Nao foi possivel salvar os dados complementares.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className="complements-page">
      <article className="complements-card">
        <header className="complements-header">
          <p className="complements-eyebrow">Primeiro acesso</p>
          <h2>Complements</h2>
          <p className="muted">Antes de entrar no dashboard, preencha nome, email, CPF e telefone.</p>
        </header>

        <form className="complements-form" onSubmit={handleSubmit} noValidate>
          <label className="field-label" htmlFor="complements-name">
            Nome
            <input
              id="complements-name"
              className="field-input"
              value={formData.name}
              onChange={(event) => updateField("name", event.target.value)}
              placeholder="Digite o nome completo"
            />
          </label>

          <label className="field-label" htmlFor="complements-email">
            Email
            <input
              id="complements-email"
              type="email"
              className="field-input"
              value={formData.email}
              onChange={(event) => updateField("email", event.target.value)}
              placeholder="nome@dominio.com"
            />
          </label>

          <label className="field-label" htmlFor="complements-cpf">
            CPF
            <input
              id="complements-cpf"
              className="field-input"
              value={formData.cpf}
              onChange={(event) => updateField("cpf", formatCpf(event.target.value))}
              placeholder="000.000.000-00"
            />
          </label>

          <label className="field-label" htmlFor="complements-phone">
            Telefone
            <input
              id="complements-phone"
              className="field-input"
              value={formData.phone}
              onChange={(event) => updateField("phone", formatPhone(event.target.value))}
              placeholder="(00) 00000-0000"
            />
          </label>

          {apiError ? <p className="api-error">{apiError}</p> : null}
          {successMessage ? <p className="success-box">{successMessage}</p> : null}

          <div className="complements-actions">
            <button type="submit" className="primary-button" disabled={loading}>
              {loading ? "Salvando..." : "Salvar"}
            </button>
          </div>
        </form>
      </article>
    </section>
  );
}

export default ComplementsPage;
