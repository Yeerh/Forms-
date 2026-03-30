import { NavLink, Route, Routes } from "react-router-dom";
import OrientacoesPage from "./pages/OrientacoesPage";
import FormularioPage from "./pages/FormularioPage";
import DashboardPage from "./pages/DashboardPage";

const links = [
  { to: "/", label: "Orientações" },
  { to: "/formulario", label: "Formulário" },
  { to: "/dashboard", label: "Dashboard" },
];

function App() {
  return (
    <div className="app-shell">
      <div className="bg-shape bg-shape-top" />
      <div className="bg-shape bg-shape-bottom" />

      <header className="topbar">
        <div>
          <p className="topbar-eyebrow">Gestão de Projetos</p>
          <h1>Acompanhamento Institucional</h1>
        </div>

        <nav className="topbar-nav">
          {links.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              className={({ isActive }) => (isActive ? "nav-link active" : "nav-link")}
            >
              {link.label}
            </NavLink>
          ))}
        </nav>
      </header>

      <main className="main-content">
        <Routes>
          <Route path="/" element={<OrientacoesPage />} />
          <Route path="/formulario" element={<FormularioPage />} />
          <Route path="/dashboard" element={<DashboardPage />} />
        </Routes>
      </main>
    </div>
  );
}

export default App;

