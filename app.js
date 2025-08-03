const express = require('express');
const cors = require('cors');
const db = require('./config/db');

const app = express();

// Middlewares básicos
app.use(cors());
app.use(express.json()); // Middleware incorporado para JSON
app.use(express.urlencoded({ extended: true })); // Para datos de formularios

// Conexión a la base de datos
db.connect(err => {
  if (err) {
    console.error('Error conectando a la DB:', err.stack);
    return;
  }
  console.log('Conectado a la base de datos MySQL como ID:', db.threadId);
});

// Ruta de prueba básica
app.get('/', (req, res) => {
  res.send('API funcionando correctamente');
});

module.exports = app;