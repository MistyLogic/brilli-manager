import { Label } from '@/components/ui/label';

export default function CampoFormulario({ etiqueta, htmlFor, error, ayuda, children }) {
  return (
    <div className="space-y-1.5">
      <Label htmlFor={htmlFor}>{etiqueta}</Label>
      {children}
      {ayuda && !error && <p className="text-xs text-gray-500">{ayuda}</p>}
      {error && <p className="text-sm text-red-600">{error}</p>}
    </div>
  );
}