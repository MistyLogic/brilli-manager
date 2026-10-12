import { Navigate, Route, Routes } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import RutaProtegida from './components/comunes/RutaProtegida';
import PaginaPendiente from './components/comunes/PaginaPendiente';
import AppLayout from './layouts/AppLayout';
import LoginPage from './pages/LoginPage';
import MasPage from './pages/MasPage';

// "/" es el Dashboard para admin; el ayudante va directo a Ventas
function Inicio() {
  const { usuario } = useAuth();
  if (usuario.rol !== 'admin') return <Navigate to="/ventas" replace />;
  return <PaginaPendiente titulo="Dashboard" />;
}

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />

      <Route element={<RutaProtegida />}>
        <Route element={<AppLayout />}>
          <Route index element={<Inicio />} />
          <Route path="ventas" element={<PaginaPendiente titulo="Ventas" />} />
          <Route path="pedidos" element={<PaginaPendiente titulo="Pedidos" />} />
          <Route path="clientes" element={<PaginaPendiente titulo="Clientes" />} />
          <Route path="inventario" element={<PaginaPendiente titulo="Inventario" />} />
          <Route path="mas" element={<MasPage />} />

          {/* Solo admin */}
          <Route element={<RutaProtegida roles={['admin']} />}>
            <Route path="compras" element={<PaginaPendiente titulo="Compras" />} />
            <Route path="caja" element={<PaginaPendiente titulo="Caja y cuentas" />} />
            <Route path="finanzas" element={<PaginaPendiente titulo="Finanzas" />} />
            <Route path="reportes" element={<PaginaPendiente titulo="Reportes" />} />
            <Route path="config" element={<PaginaPendiente titulo="Configuración" />} />
          </Route>
        </Route>
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}