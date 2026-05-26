# app.py
from flask import Flask, request, jsonify
from config import get_connection

app = Flask(__name__)

# ============================================================
#  USUARIOS
# ============================================================

@app.route('/usuarios', methods=['GET'])
def obtener_usuarios():
    conn   = get_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT id, nombre, email, sexo, altura_cm FROM usuarios")
    usuarios = [
        {'id': row[0], 'nombre': row[1], 'email': row[2],
         'sexo': row[3], 'altura_cm': row[4]}
        for row in cursor.fetchall()
    ]
    conn.close()
    return jsonify(usuarios)

@app.route('/usuarios/<int:id>', methods=['GET'])
def obtener_usuario(id):
    conn   = get_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT id, nombre, email, sexo, altura_cm FROM usuarios WHERE id = ?", (id,))
    row = cursor.fetchone()
    conn.close()
    if row:
        return jsonify({'id': row[0], 'nombre': row[1], 'email': row[2],
                        'sexo': row[3], 'altura_cm': row[4]})
    return jsonify({'mensaje': 'Usuario no encontrado'}), 404

@app.route('/usuarios', methods=['POST'])
def crear_usuario():
    data   = request.get_json()
    conn   = get_connection()
    cursor = conn.cursor()
    cursor.execute(
        "INSERT INTO usuarios (nombre, email, password_hash, sexo, altura_cm) VALUES (?, ?, ?, ?, ?)",
        (data['nombre'], data['email'], data.get('password', '1234'),
         data.get('sexo'), data.get('altura_cm'))
    )
    conn.commit()
    conn.close()
    return jsonify({'mensaje': 'Usuario creado'}), 201

@app.route('/usuarios/<int:id>', methods=['PUT'])
def actualizar_usuario(id):
    data   = request.get_json()
    conn   = get_connection()
    cursor = conn.cursor()
    cursor.execute(
        "UPDATE usuarios SET nombre = ?, sexo = ?, altura_cm = ? WHERE id = ?",
        (data['nombre'], data.get('sexo'), data.get('altura_cm'), id)
    )
    conn.commit()
    conn.close()
    return jsonify({'mensaje': 'Usuario actualizado'})

@app.route('/usuarios/<int:id>', methods=['DELETE'])
def eliminar_usuario(id):
    conn   = get_connection()
    cursor = conn.cursor()
    cursor.execute("DELETE FROM usuarios WHERE id = ?", (id,))
    conn.commit()
    conn.close()
    return jsonify({'mensaje': 'Usuario eliminado'})


# ============================================================
#  ALIMENTOS
# ============================================================

@app.route('/alimentos', methods=['GET'])
def obtener_alimentos():
    conn   = get_connection()
    cursor = conn.cursor()
    cursor.execute(
        "SELECT id, nombre, categoria, calorias_por_100g, proteina_g, carbs_g, grasas_g, fibra_g FROM alimentos"
    )
    alimentos = [
        {'id': row[0], 'nombre': row[1], 'categoria': row[2],
         'calorias_por_100g': row[3], 'proteina_g': row[4],
         'carbs_g': row[5], 'grasas_g': row[6], 'fibra_g': row[7]}
        for row in cursor.fetchall()
    ]
    conn.close()
    return jsonify(alimentos)

@app.route('/alimentos/<int:id>', methods=['GET'])
def obtener_alimento(id):
    conn   = get_connection()
    cursor = conn.cursor()
    cursor.execute(
        "SELECT id, nombre, categoria, calorias_por_100g, proteina_g, carbs_g, grasas_g, fibra_g FROM alimentos WHERE id = ?",
        (id,)
    )
    row = cursor.fetchone()
    conn.close()
    if row:
        return jsonify({'id': row[0], 'nombre': row[1], 'categoria': row[2],
                        'calorias_por_100g': row[3], 'proteina_g': row[4],
                        'carbs_g': row[5], 'grasas_g': row[6], 'fibra_g': row[7]})
    return jsonify({'mensaje': 'Alimento no encontrado'}), 404

@app.route('/alimentos', methods=['POST'])
def crear_alimento():
    data   = request.get_json()
    conn   = get_connection()
    cursor = conn.cursor()
    cursor.execute(
        """INSERT INTO alimentos
           (nombre, marca, categoria, calorias_por_100g, proteina_g, carbs_g, grasas_g, fibra_g, es_personalizado)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, 1)""",
        (data['nombre'], data.get('marca'), data.get('categoria', 'otro'),
         data.get('calorias_por_100g', 0), data.get('proteina_g', 0),
         data.get('carbs_g', 0), data.get('grasas_g', 0), data.get('fibra_g', 0))
    )
    conn.commit()
    conn.close()
    return jsonify({'mensaje': 'Alimento creado'}), 201

@app.route('/alimentos/<int:id>', methods=['PUT'])
def actualizar_alimento(id):
    data   = request.get_json()
    conn   = get_connection()
    cursor = conn.cursor()
    cursor.execute(
        """UPDATE alimentos
           SET nombre = ?, categoria = ?, calorias_por_100g = ?,
               proteina_g = ?, carbs_g = ?, grasas_g = ?, fibra_g = ?
           WHERE id = ?""",
        (data['nombre'], data.get('categoria', 'otro'),
         data.get('calorias_por_100g', 0), data.get('proteina_g', 0),
         data.get('carbs_g', 0), data.get('grasas_g', 0),
         data.get('fibra_g', 0), id)
    )
    conn.commit()
    conn.close()
    return jsonify({'mensaje': 'Alimento actualizado'})

@app.route('/alimentos/<int:id>', methods=['DELETE'])
def eliminar_alimento(id):
    conn   = get_connection()
    cursor = conn.cursor()
    cursor.execute("DELETE FROM alimentos WHERE id = ?", (id,))
    conn.commit()
    conn.close()
    return jsonify({'mensaje': 'Alimento eliminado'})


# ============================================================
#  REGISTROS DE COMIDA
# ============================================================

@app.route('/registros', methods=['GET'])
def obtener_registros():
    conn   = get_connection()
    cursor = conn.cursor()
    cursor.execute(
        """SELECT rc.id, u.nombre AS usuario, a.nombre AS alimento,
                  rc.tiempo_comida, rc.cantidad_g, rc.calorias_totales,
                  rc.proteina_total, rc.carbs_total, rc.grasas_total, rc.fecha
           FROM registros_comida rc
           JOIN usuarios u ON rc.usuario_id = u.id
           JOIN alimentos a ON rc.alimento_id = a.id
           ORDER BY rc.fecha DESC"""
    )
    registros = [
        {'id': row[0], 'usuario': row[1], 'alimento': row[2],
         'tiempo_comida': row[3], 'cantidad_g': row[4],
         'calorias_totales': row[5], 'proteina_total': row[6],
         'carbs_total': row[7], 'grasas_total': row[8],
         'fecha': str(row[9]) if row[9] else None}
        for row in cursor.fetchall()
    ]
    conn.close()
    return jsonify(registros)

@app.route('/registros/<int:id>', methods=['GET'])
def obtener_registro(id):
    conn   = get_connection()
    cursor = conn.cursor()
    cursor.execute(
        """SELECT rc.id, rc.usuario_id, rc.alimento_id, rc.tiempo_comida,
                  rc.cantidad_g, rc.calorias_totales, rc.proteina_total,
                  rc.carbs_total, rc.grasas_total, rc.fecha
           FROM registros_comida rc WHERE rc.id = ?""",
        (id,)
    )
    row = cursor.fetchone()
    conn.close()
    if row:
        return jsonify({
            'id': row[0], 'usuario_id': row[1], 'alimento_id': row[2],
            'tiempo_comida': row[3], 'cantidad_g': row[4],
            'calorias_totales': row[5], 'proteina_total': row[6],
            'carbs_total': row[7], 'grasas_total': row[8],
            'fecha': str(row[9]) if row[9] else None
        })
    return jsonify({'mensaje': 'Registro no encontrado'}), 404

@app.route('/registros', methods=['POST'])
def crear_registro():
    data         = request.get_json()
    usuario_id   = data.get('usuario_id')
    alimento_id  = data.get('alimento_id')
    cantidad_g   = data.get('cantidad_g')
    tiempo_comida = data.get('tiempo_comida', 'desayuno')

    conn   = get_connection()
    cursor = conn.cursor()

    cursor.execute(
        "SELECT calorias_por_100g, proteina_g, carbs_g, grasas_g FROM alimentos WHERE id = ?",
        (alimento_id,)
    )
    alimento = cursor.fetchone()
    if not alimento:
        conn.close()
        return jsonify({'mensaje': 'Alimento no encontrado'}), 404

    factor            = float(cantidad_g) / 100
    calorias_totales  = round(alimento[0] * factor, 2)
    proteina_total    = round(alimento[1] * factor, 2)
    carbs_total       = round(alimento[2] * factor, 2)
    grasas_total      = round(alimento[3] * factor, 2)

    cursor.execute(
        """INSERT INTO registros_comida
           (usuario_id, alimento_id, tiempo_comida, cantidad_g,
            calorias_totales, proteina_total, carbs_total, grasas_total, fecha)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, CONVERT(varchar, GETDATE(), 23))""",
        (usuario_id, alimento_id, tiempo_comida, cantidad_g,
         calorias_totales, proteina_total, carbs_total, grasas_total)
    )
    conn.commit()
    conn.close()
    return jsonify({'mensaje': 'Registro creado', 'calorias_totales': calorias_totales}), 201

@app.route('/registros/<int:id>', methods=['DELETE'])
def eliminar_registro(id):
    conn   = get_connection()
    cursor = conn.cursor()
    cursor.execute("DELETE FROM registros_comida WHERE id = ?", (id,))
    conn.commit()
    conn.close()
    return jsonify({'mensaje': 'Registro eliminado'})


# ============================================================
#  HISTORIAL DE PESO
# ============================================================

@app.route('/historial/peso', methods=['GET'])
def obtener_historial_peso():
    conn   = get_connection()
    cursor = conn.cursor()
    cursor.execute(
        """SELECT hp.id, u.nombre, hp.peso_kg, hp.fecha, hp.nota
           FROM historial_peso hp
           JOIN usuarios u ON hp.usuario_id = u.id
           ORDER BY hp.fecha DESC"""
    )
    historial = [
        {'id': row[0], 'usuario': row[1], 'peso_kg': row[2],
         'fecha': str(row[3]) if row[3] else None, 'nota': row[4]}
        for row in cursor.fetchall()
    ]
    conn.close()
    return jsonify(historial)

@app.route('/historial/peso', methods=['POST'])
def registrar_peso():
    data   = request.get_json()
    conn   = get_connection()
    cursor = conn.cursor()
    cursor.execute(
        """INSERT INTO historial_peso (usuario_id, peso_kg, fecha, nota)
           VALUES (?, ?, CONVERT(varchar, GETDATE(), 23), ?)""",
        (data['usuario_id'], data['peso_kg'], data.get('nota'))
    )
    conn.commit()
    conn.close()
    return jsonify({'mensaje': 'Peso registrado'}), 201


# ============================================================
#  RECETAS
# ============================================================

@app.route('/recetas', methods=['GET'])
def obtener_recetas():
    conn   = get_connection()
    cursor = conn.cursor()
    cursor.execute(
        "SELECT id, nombre, descripcion, tiempo_min, calorias_total FROM recetas"
    )
    recetas = [
        {'id': row[0], 'nombre': row[1], 'descripcion': row[2],
         'tiempo_min': row[3], 'calorias_total': row[4]}
        for row in cursor.fetchall()
    ]
    conn.close()
    return jsonify(recetas)

@app.route('/recetas/<int:id>', methods=['GET'])
def obtener_receta(id):
    conn   = get_connection()
    cursor = conn.cursor()
    cursor.execute(
        "SELECT id, nombre, descripcion, tiempo_min, calorias_total FROM recetas WHERE id = ?",
        (id,)
    )
    row = cursor.fetchone()
    conn.close()
    if row:
        return jsonify({'id': row[0], 'nombre': row[1], 'descripcion': row[2],
                        'tiempo_min': row[3], 'calorias_total': row[4]})
    return jsonify({'mensaje': 'Receta no encontrada'}), 404

@app.route('/recetas', methods=['POST'])
def crear_receta():
    data   = request.get_json()
    conn   = get_connection()
    cursor = conn.cursor()
    cursor.execute(
        """INSERT INTO recetas (nombre, descripcion, tiempo_min, calorias_total, creado_por)
           VALUES (?, ?, ?, ?, ?)""",
        (data['nombre'], data.get('descripcion'), data.get('tiempo_min'),
         data.get('calorias_total', 0), data.get('creado_por'))
    )
    conn.commit()
    conn.close()
    return jsonify({'mensaje': 'Receta creada'}), 201

@app.route('/recetas/<int:id>', methods=['DELETE'])
def eliminar_receta(id):
    conn   = get_connection()
    cursor = conn.cursor()
    cursor.execute("DELETE FROM recetas WHERE id = ?", (id,))
    conn.commit()
    conn.close()
    return jsonify({'mensaje': 'Receta eliminada'})


# ============================================================
#  PERFIL FISICO
# ============================================================

@app.route('/perfil/<int:usuario_id>', methods=['GET'])
def obtener_perfil(usuario_id):
    conn   = get_connection()
    cursor = conn.cursor()
    cursor.execute(
        """SELECT u.nombre, u.email, u.altura_cm,
                  p.peso_kg, p.meta_calorias, p.meta_proteina_g, p.meta_carbs_g, p.meta_grasas_g
           FROM usuarios u
           LEFT JOIN perfil_fisico p ON u.id = p.usuario_id
           WHERE u.id = ?""",
        (usuario_id,)
    )
    row = cursor.fetchone()
    conn.close()
    if row:
        return jsonify({
            'nombre': row[0], 'email': row[1], 'altura_cm': row[2],
            'peso_kg': row[3], 'meta_calorias': row[4],
            'meta_proteina_g': row[5], 'meta_carbs_g': row[6], 'meta_grasas_g': row[7]
        })
    return jsonify({'mensaje': 'Usuario no encontrado'}), 404

@app.route('/perfil/<int:usuario_id>', methods=['PUT'])
def actualizar_perfil(usuario_id):
    data   = request.get_json()
    conn   = get_connection()
    cursor = conn.cursor()
    cursor.execute(
        """UPDATE perfil_fisico
           SET peso_kg = ?, meta_calorias = ?, meta_proteina_g = ?, meta_carbs_g = ?, meta_grasas_g = ?
           WHERE usuario_id = ?""",
        (data.get('peso_kg'), data.get('meta_calorias', 2000),
         data.get('meta_proteina_g', 50), data.get('meta_carbs_g', 250),
         data.get('meta_grasas_g', 70), usuario_id)
    )
    conn.commit()
    conn.close()
    return jsonify({'mensaje': 'Perfil actualizado'})


if __name__ == '__main__':
    app.run(debug=True)
