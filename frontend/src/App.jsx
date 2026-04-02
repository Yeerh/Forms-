import { Navigate, Route, Routes, useLocation } from "react-router-dom";
import Grainient from "./components/Grainient";
import PillNav from "./components/PillNav";
import ProtectedRoute from "./components/ProtectedRoute";
import AvisoPage from "./pages/AvisoPage";
import ComplementsPage from "./pages/ComplementsPage";
import DashboardPage from "./pages/DashboardPage";
import FormularioPage from "./pages/FormularioPage";
import LoginPage from "./pages/LoginPage";

function App() {
  const location = useLocation();

  const navItems = [
    { label: "Avisos", href: "/" },
    { label: "Formulario", href: "/formulario" },
    { label: "Complements", href: "/complements" },
    { label: "Login", href: "/login" },
  ];

  const activeHref = location.pathname === "/aviso" ? "/" : location.pathname;

  return (
    <div className="app-shell">
      <div className="grainient-stage">
        <Grainient
          color1="#4f78d8"
          color2="#f5f5f5"
          color3="#0f33e6"
          timeSpeed={0.25}
          colorBalance={0}
          warpStrength={1}
          warpFrequency={5}
          warpSpeed={2}
          warpAmplitude={50}
          blendAngle={0}
          blendSoftness={0.05}
          rotationAmount={500}
          noiseScale={2}
          grainAmount={0.1}
          grainScale={2}
          grainAnimated={false}
          contrast={1.5}
          gamma={1}
          saturation={1}
          centerX={0}
          centerY={0}
          zoom={0.9}
        />
      </div>

      <div className="bg-shape bg-shape-top" />
      <div className="bg-shape bg-shape-bottom" />

      <header className="topbar">
        <PillNav
          items={navItems}
          activeHref={activeHref}
          className="custom-nav"
          ease="power2.easeOut"
          baseColor="#0A1222"
          pillColor="#1E88FF"
          hoveredPillTextColor="#FFFFFF"
          pillTextColor="#E8F3FF"
          theme="color"
          initialLoadAnimation={false}
        />
      </header>

      <main className="main-content">
        <Routes>
          <Route path="/" element={<AvisoPage />} />
          <Route path="/aviso" element={<Navigate to="/" replace />} />
          <Route path="/formulario" element={<FormularioPage />} />
          <Route
            path="/complements"
            element={
              <ProtectedRoute allowIncompleteProfile>
                <ComplementsPage />
              </ProtectedRoute>
            }
          />
          <Route path="/login" element={<LoginPage />} />
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <DashboardPage />
              </ProtectedRoute>
            }
          />
        </Routes>
      </main>
    </div>
  );
}

export default App;
