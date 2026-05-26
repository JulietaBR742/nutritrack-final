const bcrypt = require('bcryptjs');
const jwt    = require('jsonwebtoken');
const db     = require('../config/db');

exports.registro = async (req, res) => {
  const { nombre, email, password, fecha_nacimiento, sexo, altura_cm } = req.body;

  if (!nombre || !email || !password)
    return res.status(400).json({ error: 'Nombre, email y contraseña son requeridos' });

  try {
    const [existe] = await db.query('SELECT id FROM usuarios WHERE email = ?', [email]);
    if (existe.length > 0)
      return res.status(409).json({ error: 'El email ya está registrado' });

    const hash = await bcrypt.hash(password, 10);

    const [result] = await db.query(
      `INSERT INTO usuarios (nombre, email, password_hash, fecha_nacimiento, sexo, altura_cm)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [nombre, email, hash, fecha_nacimiento || null, sexo || null, altura_cm || null]
    );

    // Crear perfil físico vacío
    await db.query(
      'INSERT INTO perfil_fisico (usuario_id) VALUES (?)',
      [result.insertId]
    );

    const token = jwt.sign(
      { id: result.insertId, email, nombre },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
    );

    res.status(201).json({ token, usuario: { id: result.insertId, nombre, email } });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.login = async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password)
    return res.status(400).json({ error: 'Email y contraseña requeridos' });

  try {
    const [rows] = await db.query(
      'SELECT id, nombre, email, password_hash FROM usuarios WHERE email = ?',
      [email]
    );

    if (rows.length === 0)
      return res.status(401).json({ error: 'Credenciales incorrectas' });

    const usuario = rows[0];
    const valida  = await bcrypt.compare(password, usuario.password_hash);

    if (!valida)
      return res.status(401).json({ error: 'Credenciales incorrectas' });

    const token = jwt.sign(
      { id: usuario.id, email: usuario.email, nombre: usuario.nombre },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
    );

    res.json({
      token,
      usuario: { id: usuario.id, nombre: usuario.nombre, email: usuario.email }
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
