import { useEffect, useState } from 'react';

export default function App() {
  const [estado, setEstado] = useState('Cargando...');

  useEffect(() => {
    fetch('/api/health')
      .then((r) => r.json())
      .then((d) => setEstado(`API: ${d.status} | BD: ${d.db}`))
      .catch(() => setEstado('No se pudo conectar con la API'));
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center bg-pink-50">
      <div className="bg-white shadow-lg rounded-2xl p-8 text-center">
        <h1 className="text-2xl font-bold text-pink-600">Brilli App</h1>
        <p className="mt-2 text-gray-600">{estado}</p>
      </div>
    </div>
  );
}