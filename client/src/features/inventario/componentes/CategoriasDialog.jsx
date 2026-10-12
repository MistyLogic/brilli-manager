import { useState } from 'react';
import { Check, Pencil, Trash2, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import {
  useCategorias,
  useCrearCategoria,
  useEliminarCategoria,
  useRenombrarCategoria,
} from '../hooks';

export default function CategoriasDialog({ abierto, onCerrar }) {
  const { data: categorias = [], isLoading } = useCategorias();
  const crear = useCrearCategoria();
  const renombrar = useRenombrarCategoria();
  const eliminar = useEliminarCategoria();

  const [nuevo, setNuevo] = useState('');
  const [editando, setEditando] = useState(null); // { id, nombre }
  const [confirmandoId, setConfirmandoId] = useState(null);

  async function agregar(e) {
    e.preventDefault();
    if (!nuevo.trim()) return;
    try {
      await crear.mutateAsync(nuevo.trim());
      setNuevo('');
    } catch {
      // toast de error ya mostrado
    }
  }

  async function guardarNombre() {
    try {
      await renombrar.mutateAsync({ id: editando.id, nombre: editando.nombre.trim() });
      setEditando(null);
    } catch {
      // toast de error ya mostrado
    }
  }

  async function borrar(id) {
    try {
      await eliminar.mutateAsync(id);
      setConfirmandoId(null);
    } catch {
      // toast de error ya mostrado
    }
  }

  return (
    <Dialog open={abierto} onOpenChange={(abrir) => !abrir && onCerrar()}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Categorías</DialogTitle>
          <DialogDescription>Solo se puede eliminar una categoría que no tenga productos.</DialogDescription>
        </DialogHeader>

        <form onSubmit={agregar} className="flex gap-2">
          <Input
            value={nuevo}
            onChange={(e) => setNuevo(e.target.value)}
            placeholder="Nueva categoría (ej: Labiales)"
            className="h-11"
          />
          <Button type="submit" className="h-11" disabled={crear.isPending}>
            Agregar
          </Button>
        </form>

        {isLoading ? (
          <p className="text-sm text-gray-500">Cargando...</p>
        ) : categorias.length === 0 ? (
          <p className="text-sm text-gray-500">Aún no hay categorías.</p>
        ) : (
          <ul className="divide-y divide-gray-100 rounded-lg border border-gray-200">
            {categorias.map((c) => (
              <li key={c.id} className="flex items-center gap-2 px-3 py-2">
                {editando?.id === c.id ? (
                  <>
                    <Input
                      value={editando.nombre}
                      onChange={(e) => setEditando({ ...editando, nombre: e.target.value })}
                      className="h-10"
                      autoFocus
                    />
                    <Button size="icon" className="size-10 shrink-0" onClick={guardarNombre} disabled={renombrar.isPending} aria-label="Guardar">
                      <Check size={16} />
                    </Button>
                    <Button size="icon" variant="outline" className="size-10 shrink-0" onClick={() => setEditando(null)} aria-label="Cancelar">
                      <X size={16} />
                    </Button>
                  </>
                ) : confirmandoId === c.id ? (
                  <>
                    <span className="flex-1 text-sm text-gray-700">¿Eliminar "{c.nombre}"?</span>
                    <Button size="sm" variant="destructive" onClick={() => borrar(c.id)} disabled={eliminar.isPending}>
                      Sí, eliminar
                    </Button>
                    <Button size="sm" variant="outline" onClick={() => setConfirmandoId(null)}>
                      No
                    </Button>
                  </>
                ) : (
                  <>
                    <span className="flex-1 text-sm text-gray-800">{c.nombre}</span>
                    <span className="text-xs text-gray-500">{c.cantidadProductos} prod.</span>
                    <Button size="icon" variant="ghost" className="size-9" onClick={() => setEditando({ id: c.id, nombre: c.nombre })} aria-label="Renombrar">
                      <Pencil size={16} />
                    </Button>
                    <Button
                      size="icon"
                      variant="ghost"
                      className="size-9"
                      disabled={c.cantidadProductos > 0}
                      title={c.cantidadProductos > 0 ? 'Tiene productos: no se puede eliminar' : 'Eliminar'}
                      onClick={() => setConfirmandoId(c.id)}
                      aria-label="Eliminar"
                    >
                      <Trash2 size={16} />
                    </Button>
                  </>
                )}
              </li>
            ))}
          </ul>
        )}
      </DialogContent>
    </Dialog>
  );
}