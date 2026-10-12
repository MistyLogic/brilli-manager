import jwt from 'jsonwebtoken';
import { prisma } from '../lib/prisma.js';

// Exige sesión iniciada y deja el usuario en req.usuario
export async function requerirAuth(req, res, next) {
  const token = req.cookies?.token;
  if (!token) {
    return res.status(401).json({ error: 'No autenticado' });
  }

  try {
    const { id } = jwt.verify(token, process.env.JWT_SECRET);
    const usuario = await prisma.usuario.findUnique({
      where: { id },
      select: { id: true, nombre: true, username: true, rol: true, activo: true },
    });

    // Se consulta la BD en cada petición: si desactivas a alguien, pierde acceso al instante
    if (!usuario || !usuario.activo) {
      return res.status(401).json({ error: 'Sesión no válida' });
    }

    req.usuario = usuario;
    next();
  } catch {
    return res.status(401).json({ error: 'Sesión expirada o no válida' });
  }
}

// Restringe una ruta a ciertos roles. Uso: requerirRol('admin')
export function requerirRol(...roles) {
  return (req, res, next) => {
    if (!roles.includes(req.usuario.rol)) {
      return res.status(403).json({ error: 'No tienes permiso para esta acción' });
    }
    next();
  };
}