export class ApiError extends Error {
  constructor(mensaje, status) {
    super(mensaje);
    this.status = status;
  }
}

async function peticion(metodo, url, cuerpo) {
  const res = await fetch(`/api${url}`, {
    method: metodo,
    headers: cuerpo ? { 'Content-Type': 'application/json' } : undefined,
    body: cuerpo ? JSON.stringify(cuerpo) : undefined,
    credentials: 'include',
  });

  let datos = null;
  try {
    datos = await res.json();
  } catch {
    // respuesta sin JSON
  }

  if (!res.ok) {
    // Sesión vencida en cualquier ruta distinta de auth: avisa a la app
    if (res.status === 401 && !url.startsWith('/auth/')) {
      window.dispatchEvent(new Event('sesion-expirada'));
    }
    throw new ApiError(datos?.error || 'No se pudo completar la solicitud', res.status);
  }
  return datos;
}

export const api = {
  get: (url) => peticion('GET', url),
  post: (url, cuerpo) => peticion('POST', url, cuerpo),
  put: (url, cuerpo) => peticion('PUT', url, cuerpo),
  patch: (url, cuerpo) => peticion('PATCH', url, cuerpo),
  delete: (url) => peticion('DELETE', url),
};