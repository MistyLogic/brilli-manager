import { Search } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

export default function FiltrosInventario({ valores, onCambio, categorias, esAdmin }) {
  return (
    <div className="space-y-3">
      <div className="flex flex-col gap-3 md:flex-row">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
          <Input
            value={valores.buscarTexto}
            onChange={(e) => onCambio({ buscarTexto: e.target.value })}
            placeholder="Buscar por nombre, marca o SKU"
            className="h-11 pl-10"
          />
        </div>

        {/* Radix Select no admite valores vacíos: "todas" es el valor "sin filtro" */}
        <Select value={valores.categoriaId} onValueChange={(v) => onCambio({ categoriaId: v })}>
          <SelectTrigger className="h-11 w-full md:w-56">
            <SelectValue placeholder="Categoría" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="todas">Todas las categorías</SelectItem>
            {categorias.map((c) => (
              <SelectItem key={c.id} value={String(c.id)}>
                {c.nombre}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="flex flex-wrap gap-x-6 gap-y-2">
        <div className="flex items-center gap-2">
          <Switch
            id="solo-alerta"
            checked={valores.soloAlerta}
            onCheckedChange={(v) => onCambio({ soloAlerta: v })}
          />
          <Label htmlFor="solo-alerta">Solo stock bajo</Label>
        </div>

        {esAdmin && (
          <div className="flex items-center gap-2">
            <Switch
              id="ver-inactivos"
              checked={valores.verInactivos}
              onCheckedChange={(v) => onCambio({ verInactivos: v })}
            />
            <Label htmlFor="ver-inactivos">Ver inactivos</Label>
          </div>
        )}
      </div>
    </div>
  );
}