import { useState } from 'react';
import { Package } from 'lucide-react';

export default function FotoProducto({ url, className = 'size-12' }) {
  const [fallo, setFallo] = useState(false);

  if (!url || fallo) {
    return (
      <div className={`${className} flex shrink-0 items-center justify-center rounded-lg bg-pink-50 text-pink-300`}>
        <Package size={20} />
      </div>
    );
  }
  return (
    <img
      src={url}
      alt=""
      loading="lazy"
      onError={() => setFallo(true)}
      className={`${className} shrink-0 rounded-lg object-cover`}
    />
  );
}