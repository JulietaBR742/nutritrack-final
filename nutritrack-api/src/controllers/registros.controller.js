const db = require('../config/db');

exports.listarPorFecha = async (req, res) => {
  const fecha = req.query.fecha || new Date().toISOString().split('T')[0];
  try {
    const [rows] = await db.query(
      `SELECT rc.*, a.nombre AS alimento_nombre, a.categoria
       FROM registros_comida rc
       JOIN alimentos a ON rc.alimento_id = a.id
       WHERE rc.usuario_id = ? AND rc.fecha = ?
       ORDER BY rc.hora ASC`,
      [req.usuario.id, fecha]
    );
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.crear = async (req, res) => {
  const { alimento_id, tiempo_comida, cantidad_g, fecha, hora } = req.body;

  if (!alimento_id || !tiempo_comida || !cantidad_g)
    return res.status(400).json({ error: 'alimento_id, tiempo_comida y cantidad_g son requeridos' });

  try {
    // Obtener datos nutricionales del alimento
    const [alimento] = await db.query(
      'SELECT calorias_por_100g, proteina_g, carbs_g, grasas_g FROM alimentos WHERE id = ?',
      [alimento_id]
    );
    if (alimento.length === 0)
      return res.status(404).json({ error: 'Alimento no encontrado' });

    const factor = cantidad_g / 100;
    const calorias_totales = alimento[0].calorias_por_100g * factor;
    const proteina_total   = alimento[0].proteina_g        * factor;
    const carbs_total      = alimento[0].carbs_g           * factor;
    const grasas_total     = alimento[0].grasas_g          * factor;

    const fechaRegistro = fecha || new Date().toISOString().split('T')[0];

    const [result] = await db.query(
      `INSERT INTO registros_comida
         (usuario_id, alimento_id, tiempo_comida, cantidad_g,
          calorias_totales, proteina_total, carbs_total, grasas_total, fecha, hora)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [req.usuario.id, alimento_id, tiempo_comida, cantidad_g,
       calorias_totales, proteina_total, carbs_total, grasas_total,
       fechaRegistro, hora || null]
    );

    res.status(201).json({ id: result.insertId, calorias_totales, mensaje: 'Registro guardado' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.eliminar = async (req, res) => {
  try {
    const [result] = await db.query(
      'DELETE FROM registros_comida WHERE id = ? AND usuario_id = ?',
      [req.params.id, req.usuario.id]
    );
    if (result.affectedRows === 0)
      return res.status(404).json({ error: 'Registro no encontrado' });
    res.json({ mensaje: 'Registro eliminado' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
