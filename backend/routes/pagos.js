const express = require('express');
const router = express.Router();
const jwtMiddleware = require('../auth/jwtMiddleware');
const db = require('../config/db');
const checkRole = require('../middleware/checkRole');

// Ruta protegida para verificar token
router.get('/me', jwtMiddleware, (req, res) => {
  res.json({
    message: 'Token verificado correctamente',
    user: req.user
  });
});

//Ruta para crear un nuevo pago
//router.post('/', jwtMiddleware, checkRole('estudiante'), (req, res) => {  //Para proteger rutas
router.post('/', jwtMiddleware, (req, res) => {
  const { carne, concepto, monto_Q, email, paypal_transaction_id } = req.body;

  if (!carne || !concepto || !monto_Q || !paypal_transaction_id) {
    return res.status(400).json({ error: 'Faltan datos obligatorios' });
  }

  const status = 'completado';

  const sql = 'INSERT INTO pagos (carne, concepto, monto_Q, email, paypal_transaction_id, status) VALUES (?, ?, ?, ?, ?, ?)';
  db.query(sql, [carne, concepto, monto_Q, email, paypal_transaction_id, status], (err, result) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ error: 'Error al guardar el pago' });
    }
    res.status(201).json({ message: 'Pago creado', id: result.insertId });
  });
});


//Ruta para obtener todos los pagos
//router.get('/', jwtMiddleware, checkRole('estudiante'), (req, res) => {  //Para proteger rutas
router.get('/', jwtMiddleware, (req, res) => {
  const sql = 'SELECT * FROM pagos';
  db.query(sql, (err, results) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ error: 'Error al obtener los pagos' });
    }
    res.json(results);
  });
});

module.exports = router;
