import 'dotenv/config';
import express from 'express';
import cookieParser from 'cookie-parser';
import { prisma } from './lib/prisma.js';
import authRoutes from './modules/auth/auth.routes.js';

const app = express();

app.use(express.json());
app.use(cookieParser());

app.get('/api/health', async (req, res) => {
  try {
    await prisma.$queryRaw`SELECT 1`;
    res.json({ status: 'ok', db: 'conectada' });
  } catch (error) {
    res.status(500).json({ status: 'error', db: 'sin conexion' });
  }
});

app.use('/api/auth', authRoutes);

// Manejo de errores no controlados (Express 5 captura los errores de funciones async)
app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ error: 'Error interno del servidor' });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Servidor en http://localhost:${PORT}`));