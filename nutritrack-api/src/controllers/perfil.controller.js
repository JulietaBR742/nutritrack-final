const db = require('../config/db');

exports.obtener = async (req, res) => {
  try {
    const [rows] = await db.query(
      `SELECT u.id, u.nombre, u.email, u.fecha_nacimiento, u.sexo, u.altura_cm,
              p.peso_kg, p.meta_calorias, p.meta_proteina_g, p.meta_carbs_g, p.meta_grasas_g
       FROM usuarios u
       LEFT JOIN perfil_fisico p ON u.id = p.usuario_id
       WHERE u.id = ?`,
      [req.usuario.id]
    );
    if (rows.length === 0) return res.status(404).json({ error: 'Usuario no encontrado' });
    res.json(rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.actualizar = async (req, res) => {
  const { nombre, fecha_nacimiento, sexo, altura_cm,
          peso_kg, meta_calorias, meta_proteina_g, meta_carbs_g, meta_grasas_g } = req.body;

  try {
    // Actualizar datos personales
    await db.query(
      'UPDATE usuarios SET nombre = ?, fecha_nacimiento = ?, sexo = ?, altura_cm = ? WHERE id = ?',
      [nombre, fecha_nacimiento || null, sexo || null, altura_cm || null, req.usuario.id]
    );

    // Actualizar perfil físico
    await db.query(
      `UPDATE perfil_fisico
       SET peso_kg = ?, meta_calorias = ?, meta_proteina_g = ?, meta_carbs_g = ?, meta_grasas_g = ?
       WHERE usuario_id = ?`,
      [peso_kg || null, meta_calorias || 2000, meta_proteina_g || 50,
       meta_carbs_g || 250, meta_grasas_g || 70, req.usuario.id]
    );

    // Si hay un nuevo peso, guardarlo en historial
    if (peso_kg) {
      await db.query(
        'INSERT INTO historial_peso (usuario_id, peso_kg, fecha) VALUES (?, ?, CURDATE())',
        [req.usuario.id, peso_kg]
      );
    }

    res.json({ mensaje: 'Perfil actualizado' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
