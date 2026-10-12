import { Link, useNavigate } from 'react-router-dom';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import MontoSoles from '@/components/comunes/MontoSoles';
import EstadoStockBadge from './EstadoStockBadge';
import FotoProducto from './FotoProducto';

export default function ListaProductos({ productos }) {
  const navigate = useNavigate();
  // Los costos solo llegan si el usuario es admin: se muestran únicamente si vienen
  const verCostos = productos.some((p) => p.costoPromedio !== undefined);

  return (
    <>
      {/* Escritorio: tabla */}
      <div className="hidden rounded-xl border border-gray-200 bg-white md:block">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-16" />
              <TableHead>Producto</TableHead>
              <TableHead>Categoría</TableHead>
              <TableHead className="text-right">Stock</TableHead>
              <TableHead className="text-right">Mínimo</TableHead>
              <TableHead>Estado</TableHead>
              {verCostos && (
                <>
                  <TableHead className="text-right">Costo prom.</TableHead>
                  <TableHead className="text-right">Valor stock</TableHead>
                </>
              )}
            </TableRow>
          </TableHeader>
          <TableBody>
            {productos.map((p) => (
              <TableRow
                key={p.id}
                onClick={() => navigate(`/inventario/${p.id}`)}
                className={`cursor-pointer ${p.activo ? '' : 'opacity-60'}`}
              >
                <TableCell>
                  <FotoProducto url={p.fotoUrl} className="size-10" />
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-2 font-medium text-gray-800">
                    {p.nombre}
                    {!p.activo && <Badge variant="outline">Inactivo</Badge>}
                  </div>
                  <div className="text-xs text-gray-500">{[p.marca, p.sku].filter(Boolean).join(' · ')}</div>
                </TableCell>
                <TableCell className="text-gray-600">{p.categoria?.nombre ?? '—'}</TableCell>
                <TableCell className="text-right font-semibold">{p.stockActual}</TableCell>
                <TableCell className="text-right text-gray-500">{p.stockMinimo}</TableCell>
                <TableCell>
                  <EstadoStockBadge estado={p.estadoStock} />
                </TableCell>
                {verCostos && (
                  <>
                    <TableCell className="text-right">
                      <MontoSoles valor={p.costoPromedio} precision />
                    </TableCell>
                    <TableCell className="text-right">
                      <MontoSoles valor={p.valorStock} />
                    </TableCell>
                  </>
                )}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Celular: tarjetas */}
      <div className="space-y-2 md:hidden">
        {productos.map((p) => (
          <Link
            key={p.id}
            to={`/inventario/${p.id}`}
            className={`flex items-center gap-3 rounded-xl border border-gray-200 bg-white p-3 ${p.activo ? '' : 'opacity-60'}`}
          >
            <FotoProducto url={p.fotoUrl} className="size-14" />
            <div className="min-w-0 flex-1">
              <p className="truncate font-medium text-gray-800">{p.nombre}</p>
              <p className="truncate text-xs text-gray-500">
                {[p.categoria?.nombre, p.marca].filter(Boolean).join(' · ') || 'Sin categoría'}
                {!p.activo && ' · Inactivo'}
              </p>
              {p.costoPromedio !== undefined && (
                <p className="mt-0.5 text-xs text-gray-500">
                  Costo <MontoSoles valor={p.costoPromedio} precision /> · Valor <MontoSoles valor={p.valorStock} />
                </p>
              )}
            </div>
            <div className="flex flex-col items-end gap-1">
              <span className="text-2xl font-bold leading-none text-gray-800">{p.stockActual}</span>
              <EstadoStockBadge estado={p.estadoStock} />
            </div>
          </Link>
        ))}
      </div>
    </>
  );
}