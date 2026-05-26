const db = require('../config/db');

exports.resumen = async (req, res) => {
  const usuarioId = req.usuario.id;
  const fecha     = req.query.fecha || new Date().toISOString().split('T')[0];

  try {
    // Totales del día
    const [totales] = await db.query(
      `SELECT
         COALESCE(SUM(calorias_totales), 0) AS calorias,
         COALESCE(SUM(proteina_total),   0) AS proteina,
         COALESCE(SUM(carbs_total),      0) AS carbs,
         COALESCE(SUM(grasas_total),     0) AS grasas
       FROM registros_comida
       WHERE usuario_id = ? AND fecha = ?`,
      [usuarioId, fecha]
    );

    // Meta calórica del usuario
    const [perfil] = await db.query(
      'SELECT meta_calorias, meta_proteina_g, meta_carbs_g, meta_grasas_g, peso_kg FROM perfil_fisico WHERE usuario_id = ?',
      [usuarioId]
    );

    // Agua del día
    const [agua] = await db.query(
      'SELECT COALESCE(SUM(cantidad_ml), 0) AS total_ml FROM registro_agua WHERE usuario_id = ? AND fecha = ?',
      [usuarioId, fecha]
    );

    // Últimos 7 días de calorías (para la gráfica)
    const [semana] = await db.query(
      `SELECT fecha, COALESCE(SUM(calorias_totales), 0) AS calorias
       FROM registros_comida
       WHERE usuario_id = ? AND fecha >= DATE_SUB(?, INTERVAL 6 DAY)
       GROUP BY fecha
       ORDER BY fecha ASC`,
      [usuarioId, fecha]
    );

    // Peso más reciente
    const [pesoReciente] = await db.query(
      'SELECT peso_kg, fecha FROM historial_peso WHERE usuario_id = ? ORDER BY fecha DESC LIMIT 1',
      [usuarioId]
    );

    res.json({
      fecha,
      consumido:    totales[0],
      metas:        perfil[0]   || { meta_calorias: 2000, meta_proteina_g: 50, meta_carbs_g: 250, meta_grasas_g: 70 },
      agua_ml:      agua[0].total_ml,
      semana:       semana,
      peso_actual:  pesoReciente[0] || null,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
