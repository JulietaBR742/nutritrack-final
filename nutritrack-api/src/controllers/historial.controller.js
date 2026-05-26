const db = require('../config/db');

exports.obtenerPeso = async (req, res) => {
  try {
    const [rows] = await db.query(
      'SELECT * FROM historial_peso WHERE usuario_id = ? ORDER BY fecha DESC LIMIT 30',
      [req.usuario.id]
    );
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.registrarPeso = async (req, res) => {
  const { peso_kg, fecha, nota } = req.body;
  if (!peso_kg) return res.status(400).json({ error: 'peso_kg es requerido' });

  try {
    const [result] = await db.query(
      'INSERT INTO historial_peso (usuario_id, peso_kg, fecha, nota) VALUES (?, ?, ?, ?)',
      [req.usuario.id, peso_kg, fecha || new Date().toISOString().split('T')[0], nota || null]
    );
    res.status(201).json({ id: result.insertId, mensaje: 'Peso registrado' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.obtenerAgua = async (req, res) => {
  const fecha = req.query.fecha || new Date().toISOString().split('T')[0];
  try {
    const [rows] = await db.query(
      'SELECT * FROM registro_agua WHERE usuario_id = ? AND fecha = ? ORDER BY hora ASC',
      [req.usuario.id, fecha]
    );
    const [total] = await db.query(
      'SELECT COALESCE(SUM(cantidad_ml), 0) AS total_ml FROM registro_agua WHERE usuario_id = ? AND fecha = ?',
      [req.usuario.id, fecha]
    );
    res.json({ registros: rows, total_ml: total[0].total_ml });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.registrarAgua = async (req, res) => {
  const { cantidad_ml, fecha, hora } = req.body;
  if (!cantidad_ml) return res.status(400).json({ error: 'cantidad_ml es requerido' });

  try {
    const [result] = await db.query(
      'INSERT INTO registro_agua (usuario_id, cantidad_ml, fecha, hora) VALUES (?, ?, ?, ?)',
      [req.usuario.id, cantidad_ml,
       fecha || new Date().toISOString().split('T')[0],
       hora  || null]
    );
    res.status(201).json({ id: result.insertId, mensaje: 'Agua registrada' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
