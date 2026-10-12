import { Link } from 'react-router-dom';
import { LogOut } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { seccionesPara } from '../lib/navegacion';

export default function MasPage() {
  const { usuario, logout } = useAuth();
  const otras = seccionesPara(usuario.rol).filter((s) => !s.principal);

  return (
    <div className="max-w-md">
      <h1 className="text-xl font-bold text-gray-800 mb-4">Más opciones</h1>

      <div className="bg-white rounded-xl border border-gray-200 divide-y divide-gray-100">
        {otras.map(({ ruta, etiqueta, icono: Icono }) => (
          <Link key={ruta} to={ruta} className="flex items-center gap-3 px-4 py-3 text-gray-700">
            <Icono size={20} className="text-pink-600" />
            {etiqueta}
          </Link>
        ))}
        <button onClick={logout} className="flex w-full items-center gap-3 px-4 py-3 text-gray-700">
          <LogOut size={20} className="text-pink-600" />
          Cerrar sesión ({usuario.nombre})
        </button>
      </div>
    </div>
  );
}