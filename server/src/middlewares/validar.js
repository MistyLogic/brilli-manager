// Convierte el primer error de zod en un mensaje legible
function mensajeDe(issue) {
  const campo = issue.path.join('.');
  const genericos = ['invalid_type', 'invalid_value', 'invalid_enum_value'];
  if (genericos.includes(issue.code) && !issue.message.startsWith('El ') && !issue.message.startsWith('La ')) {
    return campo
      ? `El campo "${campo}" es obligatorio o tiene un formato incorrecto`
      : 'Datos no válidos';
  }
  return issue.message;
}

// origen: 'body' o 'query'. El resultado validado queda en req.datos
// (en Express 5 req.query es de solo lectura, por eso no se sobrescribe)
export function validar(schema, origen = 'body') {
  return (req, res, next) => {
    const resultado = schema.safeParse(req[origen] ?? {});
    if (!resultado.success) {
      return res.status(400).json({ error: mensajeDe(resultado.error.issues[0]) });
    }
    req.datos = resultado.data;
    next();
  };
}