import { formatearSoles } from '@/lib/formato';

function Tarjeta({ titulo, valor, onClick, alerta }) {
  const Componente = onClick ? 'button' : 'div';
  return (
    <Componente
      onClick={onClick}
      className={`rounded-xl border bg-white p-4 text-left ${
        alerta ? 'border-amber-300' : 'border-gray-200'
      } ${onClick ? 'cursor-pointer hover:border-pink-300' : ''}`}
    >
      <p className="text-xs text-gray-500">{titulo}</p>
      <p className="mt-1 text-2xl font-bold text-gray-800">{valor}</p>
    </Componente>
  );
}

export default function ResumenInventario({ resumen, cargando, onVerAlertas }) {
  if (cargando || !resumen) {
    return (
      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        {[1, 2, 3].map((n) => (
          <div key={n} className="h-20 animate-pulse rounded-xl bg-gray-200" />
        ))}
      </div>
    );
  }

  // El valor del inventario solo lo envía la API para admin
  const hayValor = resumen.valorInventario !== undefined;

  return (
    <div className={`grid grid-cols-2 gap-3 ${hayValor ? 'md:grid-cols-4' : 'md:grid-cols-3'}`}>
      <Tarjeta titulo="Productos activos" valor={resumen.totalActivos} />
      <Tarjeta titulo="Stock bajo" valor={resumen.stockBajo} onClick={onVerAlertas} alerta={resumen.stockBajo > 0} />
      <Tarjeta titulo="Agotados" valor={resumen.agotados} onClick={onVerAlertas} alerta={resumen.agotados > 0} />
      {hayValor && <Tarjeta titulo="Valor del inventario" valor={formatearSoles(resumen.valorInventario)} />}
    </div>
  );
}