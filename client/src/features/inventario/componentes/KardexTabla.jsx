import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { formatearFechaHora } from '@/lib/formato';
import { useKardex } from '../hooks';

const TIPOS = { compra: 'Compra', venta: 'Venta', ajuste: 'Ajuste', anulacion: 'Anulación' };

export default function KardexTabla({ productoId }) {
  const [pagina, setPagina] = useState(1);
  const { data, isLoading, isError, error, refetch } = useKardex(productoId, pagina);

  if (isLoading) return <div className="h-32 animate-pulse rounded-xl bg-gray-200" />;

  if (isError) {
    return (
      <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
        {error.message}{' '}
        <button onClick={() => refetch()} className="font-medium underline">
          Reintentar
        </button>
      </div>
    );
  }

  const { movimientos, total, limite } = data;
  const totalPaginas = Math.max(1, Math.ceil(total / limite));

  if (total === 0) {
    return <p className="rounded-xl border border-dashed border-gray-300 bg-white p-6 text-center text-sm text-gray-500">Este producto aún no tiene movimientos.</p>;
  }

  return (
    <div className="space-y-3">
      <div className="overflow-x-auto rounded-xl border border-gray-200 bg-white">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Fecha</TableHead>
              <TableHead>Tipo</TableHead>
              <TableHead className="text-right">Cantidad</TableHead>
              <TableHead className="text-right">Stock resultante</TableHead>
              <TableHead>Detalle</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {movimientos.map((m) => (
              <TableRow key={m.id}>
                <TableCell className="whitespace-nowrap">{formatearFechaHora(m.fecha)}</TableCell>
                <TableCell>{TIPOS[m.tipo] ?? m.tipo}</TableCell>
                <TableCell className={`text-right font-semibold ${m.cantidad > 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {m.cantidad > 0 ? `+${m.cantidad}` : m.cantidad}
                </TableCell>
                <TableCell className="text-right">{m.stockResultante}</TableCell>
                <TableCell className="text-gray-600">
                  {m.motivo ?? (m.ventaId ? `Venta #${m.ventaId}` : m.compraId ? `Compra #${m.compraId}` : '—')}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {totalPaginas > 1 && (
        <div className="flex items-center justify-between">
          <Button variant="outline" className="h-10" disabled={pagina <= 1} onClick={() => setPagina((p) => p - 1)}>
            Anterior
          </Button>
          <span className="text-sm text-gray-500">
            Página {pagina} de {totalPaginas}
          </span>
          <Button variant="outline" className="h-10" disabled={pagina >= totalPaginas} onClick={() => setPagina((p) => p + 1)}>
            Siguiente
          </Button>
        </div>
      )}
    </div>
  );
}