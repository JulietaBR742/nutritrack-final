const db = require('../config/db');

exports.listar = async (req, res) => {
  const { categoria, buscar } = req.query;
  let sql    = 'SELECT * FROM alimentos WHERE (es_personalizado = FALSE OR creado_por = ?)';
  const params = [req.usuario.id];

  if (categoria && categoria !== 'todos') {
    sql += ' AND categoria = ?';
    params.push(categoria);
  }
  if (buscar) {
    sql += ' AND nombre LIKE ?';
    params.push(`%${buscar}%`);
  }
  sql += ' ORDER BY nombre ASC';

  try {
    const [rows] = await db.query(sql, params);
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.obtener = async (req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM alimentos WHERE id = ?', [req.params.id]);
    if (rows.length === 0) return res.status(404).json({ error: 'Alimento no encontrado' });
    res.json(rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.crear = async (req, res) => {
  const { nombre, marca, categoria, calorias_por_100g, proteina_g, carbs_g, grasas_g, fibra_g } = req.body;

  if (!nombre || calorias_por_100g === undefined)
    return res.status(400).json({ error: 'Nombre y calorías son requeridos' });

  try {
    const [result] = await db.query(
      `INSERT INTO alimentos
         (nombre, marca, categoria, calorias_por_100g, proteina_g, carbs_g, grasas_g, fibra_g, es_personalizado, creado_por)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, TRUE, ?)`,
      [nombre, marca || null, categoria || 'otro',
       calorias_por_100g, proteina_g || 0, carbs_g || 0, grasas_g || 0, fibra_g || 0,
       req.usuario.id]
    );
    res.status(201).json({ id: result.insertId, mensaje: 'Alimento creado' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
