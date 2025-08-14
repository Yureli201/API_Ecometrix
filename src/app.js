const express = require('express');
const cors = require('cors');
const db = require('./config/db');

const app = express();

// Middlewares básicos
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Conexión a la base de datos
db.connect(err => {
  if (err) {
    console.error('Error conectando a la DB:', err.stack);
    return;
  }
  console.log('Conectado a la base de datos MySQL como ID:', db.threadId);
});

// Importar rutas
const authRoutes = require('./routes/authRoutes');
const ActividadRoutes = require('./routes/ActividadRoutes');
const userRoutes = require('./routes/userRoutes');
const huellaRoutes = require('./routes/huellaRoutes');
const predictionRoutes = require('./routes/predictionRoutes');

// Usar rutas
app.use('/api/auth', authRoutes);
app.use('/api/data', ActividadRoutes);
app.use('/api/user', userRoutes);
app.use('/api/huella', huellaRoutes);
app.use('/api/prediction', predictionRoutes);

// Ruta de prueba básica
app.get('/', (req, res) => {
  res.send('API funcionando correctamente');
});

module.exports = app;