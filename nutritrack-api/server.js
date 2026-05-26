require('dotenv').config();
const express = require('express');
const cors    = require('cors');
const routes  = require('./src/routes');

const app  = express();
const PORT = process.env.PORT || 3001;
const corsOrigin = process.env.CORS_ORIGIN || 'http://localhost:5173';

// Middlewares globales
app.use(cors({ origin: corsOrigin }));
app.use(express.json());

// Rutas
app.use('/api', routes);

// Ruta de salud
app.get('/', (req, res) => {
  res.json({ mensaje: 'NutriTrack API funcionando', version: '1.0.0' });
});

// Manejador de errores global
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(err.status || 500).json({
    error: err.message || 'Error interno del servidor'
  });
});

app.listen(PORT, () => {
  console.log(`Servidor corriendo en puerto ${PORT}`);
});
