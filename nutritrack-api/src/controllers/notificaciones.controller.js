const db = require('../config/db');

exports.listar = async (req, res) => {
  try {
    const [rows] = await db.query(
      'SELECT * FROM notificaciones WHERE usuario_id = ? ORDER BY creado_en DESC LIMIT 20',
      [req.usuario.id]
    );
    res.json(rows);
  } catch (err) { res.status(500).json({ error: err.message }); }
};

exports.marcarLeida = async (req, res) => {
  try {
    await db.query(
      'UPDATE notificaciones SET leida = TRUE WHERE id = ? AND usuario_id = ?',
      [req.params.id, req.usuario.id]
    );
    res.json({ mensaje: 'Notificación leída' });
  } catch (err) { res.status(500).json({ error: err.message }); }
};

exports.marcarTodas = async (req, res) => {
  try {
    await db.query(
      'UPDATE notificaciones SET leida = TRUE WHERE usuario_id = ?',
      [req.usuario.id]
    );
    res.json({ mensaje: 'Todas leídas' });
  } catch (err) { res.status(500).json({ error: err.message }); }
};
