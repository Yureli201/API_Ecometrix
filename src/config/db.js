const mysql = require('mysql2');
require('dotenv').config();

const dbConfig = {
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_DATABASE,
  port: process.env.PORT
};

console.log('Intentando conectar con configuración:', dbConfig);

const db = mysql.createConnection(dbConfig);

db.connect((err) => {
  if (err) {
    console.error('🚨 Error de conexión a MySQL:');
    console.error('Código de error:', err.code);
    console.error('Número de error:', err.errno);
    console.error('Mensaje:', err.message);
    console.error('Stack:', err.stack);
    return;
  }
  console.log('✅ Conectado a MySQL como ID:', db.threadId);
});

module.exports = db;