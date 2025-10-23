const express = require('express');
const router = express.Router();
const jwtMiddleware = require('../auth/jwtMiddleware');
const checkRole = require('../middleware/checkRole');
const db = require('../config/db');

//router.get('/auditoria', jwtMiddleware, checkRole('auditor'), (req, res) => {    //Con proteccion de rutas
router.get('/', jwtMiddleware, (req, res) => {  
  const sql = 'SELECT * FROM pagos ORDER BY id DESC';
  db.query(sql, (err, results) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ error: 'Error al obtener los pagos' });
    }
    res.json(results);
  });
});

module.exports = router;
