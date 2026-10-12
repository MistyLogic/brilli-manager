import { Router } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import rateLimit from 'express-rate-limit';
import { prisma } from '../../lib/prisma.js';
import { requerirAuth } from '../../middlewares/auth.js';

const router = Router();

const DURACION_SESION_MS = 7 * 24 * 60 * 60 * 1000; // 7 días

const opcionesCookie = {
  httpOnly: true,
  sameSite: 'lax',
  secure: process.env.NODE_ENV === 'production',
  maxAge: DURACION_SESION_MS,
};

// Máximo 10 intentos de login cada 15 minutos por IP
const limitarLogin = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Demasiados intentos. Espera unos minutos e inténtalo de nuevo.' },
});

router.post('/login', limitarLogin, async (req, res) => {
  const { username, password } = req.body ?? {};

  if (!username || !password) {
    return res.status(400).json({ error: 'Username y contraseña son obligatorios' });
  }

  const usuario = await prisma.usuario.findFirst({
    where: { username: { equals: String(username).trim(), mode: 'insensitive' } },
  });

  // Mismo mensaje para "no existe" y "contraseña mala": no revela qué correos existen
  const credencialesOk =
    usuario && usuario.activo && (await bcrypt.compare(String(password), usuario.passwordHash));

  if (!credencialesOk) {
    return res.status(401).json({ error: 'Credenciales incorrectas' });
  }

  const token = jwt.sign({ id: usuario.id }, process.env.JWT_SECRET, { expiresIn: '7d' });
  res.cookie('token', token, opcionesCookie);

  res.json({
    usuario: { id: usuario.id, nombre: usuario.nombre, username: usuario.username, rol: usuario.rol },
  });
});

router.post('/logout', (req, res) => {
  res.clearCookie('token', { ...opcionesCookie, maxAge: undefined });
  res.json({ mensaje: 'Sesión cerrada' });
});

// El frontend lo usa al cargar la app para saber si hay sesión activa
router.get('/me', requerirAuth, (req, res) => {
  res.json({ usuario: req.usuario });
});

export default router;