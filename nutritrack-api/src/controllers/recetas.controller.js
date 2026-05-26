const db = require('../config/db');

exports.listar = async (req, res) => {
  try {
    const [rows] = await db.query(
      `SELECT r.*, u.nombre AS autor
       FROM recetas r
       LEFT JOIN usuarios u ON r.creado_por = u.id
       ORDER BY r.id DESC`,
    );
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.obtener = async (req, res) => {
  try {
    const [receta] = await db.query('SELECT * FROM recetas WHERE id = ?', [req.params.id]);
    if (receta.length === 0) return res.status(404).json({ error: 'Receta no encontrada' });

    const [ingredientes] = await db.query(
      `SELECT ri.cantidad_g, a.nombre, a.calorias_por_100g,
              a.proteina_g, a.carbs_g, a.grasas_g
       FROM receta_ingredientes ri
       JOIN alimentos a ON ri.alimento_id = a.id
       WHERE ri.receta_id = ?`,
      [req.params.id]
    );

    res.json({ ...receta[0], ingredientes });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.crear = async (req, res) => {
  const { nombre, descripcion, tiempo_min, ingredientes } = req.body;
  // ingredientes = [{ alimento_id, cantidad_g }, ...]

  if (!nombre || !ingredientes || ingredientes.length === 0)
    return res.status(400).json({ error: 'Nombre e ingredientes son requeridos' });

  const conn = await db.getConnection();
  try {
    await conn.beginTransaction();

    // Calcular calorías totales de la receta
    let calorias_total = 0;
    for (const ing of ingredientes) {
      const [alimento] = await conn.query(
        'SELECT calorias_por_100g FROM alimentos WHERE id = ?', [ing.alimento_id]
      );
      if (alimento.length > 0) {
        calorias_total += alimento[0].calorias_por_100g * (ing.cantidad_g / 100);
      }
    }

    const [result] = await conn.query(
      'INSERT INTO recetas (nombre, descripcion, tiempo_min, calorias_total, creado_por) VALUES (?, ?, ?, ?, ?)',
      [nombre, descripcion || null, tiempo_min || null, calorias_total, req.usuario.id]
    );

    const recetaId = result.insertId;

    for (const ing of ingredientes) {
      await conn.query(
        'INSERT INTO receta_ingredientes (receta_id, alimento_id, cantidad_g) VALUES (?, ?, ?)',
        [recetaId, ing.alimento_id, ing.cantidad_g]
      );
    }

    await conn.commit();
    res.status(201).json({ id: recetaId, calorias_total, mensaje: 'Receta creada' });
  } catch (err) {
    await conn.rollback();
    res.status(500).json({ error: err.message });
  } finally {
    conn.release();
  }
};
