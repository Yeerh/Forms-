import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { loginRequest } from "../api/authApi";
import { apiBaseUrl } from "../api/httpClient";
import { useAuth } from "../context/AuthContext";

function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();
  const [identifier, setIdentifier] = useState("admin");
  const [password, setPassword] = useState("123456");
  const [errors, setErrors] = useState({});
  const [apiError, setApiError] = useState("");
  const [loading, setLoading] = useState(false);

  function validate() {
    const nextErrors = {};

    if (!identifier.trim()) {
      nextErrors.identifier = "Informe usuario ou e-mail.";
    }

    if (!password.trim()) {
      nextErrors.password = "Informe a senha.";
    }

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setApiError("");

    if (!validate()) {
      return;
    }

    try {
      setLoading(true);
      const response = await loginRequest(identifier, password);
      login(response.token, response.user);
      const nextRoute = location.state?.from || "/dashboard";
      navigate(nextRoute, { replace: true });
    } catch (error) {
      if (!error.response) {
        setApiError(
          `Nao foi possivel conectar com a API em ${apiBaseUrl}. Inicie o backend com: cd backend && npm run dev`
        );
      } else if (error.response.status === 401) {
        setApiError("Credenciais invalidas. Use admin / 123456 para teste.");
      } else {
        setApiError(error.response?.data?.message || "Nao foi possivel fazer login.");
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className="login-page">
      <article className="login-card">
        <h2>Entrar no sistema</h2>
        <p className="muted">Use seu usuario ou e-mail para acessar o dashboard.</p>

        <form className="login-form" onSubmit={handleSubmit} noValidate>
          <label className="field-label" htmlFor="identifier">
            Usuario ou e-mail
          </label>
          <input
            id="identifier"
            className={errors.identifier ? "field-input has-error" : "field-input"}
            value={identifier}
            onChange={(event) => {
              setIdentifier(event.target.value);
              setErrors((current) => ({ ...current, identifier: "" }));
            }}
            placeholder="admin ou admin@projetos.local"
          />
          {errors.identifier ? <p className="field-error">{errors.identifier}</p> : null}

          <label className="field-label" htmlFor="password">
            Senha
          </label>
          <input
            id="password"
            type="password"
            className={errors.password ? "field-input has-error" : "field-input"}
            value={password}
            onChange={(event) => {
              setPassword(event.target.value);
              setErrors((current) => ({ ...current, password: "" }));
            }}
            placeholder="******"
          />
          {errors.password ? <p className="field-error">{errors.password}</p> : null}

          {apiError ? <p className="api-error">{apiError}</p> : null}

          <button type="submit" className="primary-button" disabled={loading}>
            {loading ? "Entrando..." : "Entrar"}
          </button>
        </form>

        <div className="login-hint">
          <strong>Credenciais de teste</strong>
          <p>Usuario: admin</p>
          <p>Senha: 123456</p>
          <button
            type="button"
            className="ghost-button"
            onClick={() => {
              setIdentifier("admin");
              setPassword("123456");
            }}
          >
            Usar acesso admin
          </button>
        </div>
      </article>
    </section>
  );
}

export default LoginPage;
