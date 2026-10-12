export default function EstadoVacio({ icono: Icono, titulo, descripcion, children }) {
  return (
    <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-gray-300 bg-white px-6 py-12 text-center">
      {Icono && <Icono className="mb-3 text-gray-400" size={36} />}
      <h3 className="font-semibold text-gray-800">{titulo}</h3>
      {descripcion && <p className="mt-1 max-w-sm text-sm text-gray-500">{descripcion}</p>}
      {children && <div className="mt-4">{children}</div>}
    </div>
  );
}