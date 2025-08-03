// server.js
const express = require('express');
const cors = require('cors');
require('dotenv').config();


const app = express();


app.use(cors());
app.use(express.json());



// Error genérico
app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ message: 'Error interno del servidor' });
});

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`Servidor corriendo en puerto ${PORT}`);
});
