// Error que el manejador global convierte en una respuesta { error: "mensaje" }
export class ErrorHttp extends Error {
  constructor(status, mensaje) {
    super(mensaje);
    this.status = status;
  }
}

// Convierte el parámetro :id de la URL en un entero válido
export function leerId(valor) {
  const id = Number(valor);
  if (!Number.isInteger(id) || id <= 0) {
    throw new ErrorHttp(400, 'ID no válido');
  }
  return id;
}