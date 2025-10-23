const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

// Rutas
const pagosRoutes = require('./routes/pagos');
app.use('/api/pagos', pagosRoutes);

const auditoriaRoutes = require('./routes/auditoria');
app.use('/api/auditoria', auditoriaRoutes);

module.exports = app;

//Para inttegracion de la apis con lambda
