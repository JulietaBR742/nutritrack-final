import os
from datetime import date, datetime, time, timedelta
from decimal import Decimal
from functools import wraps

import jwt
from flask import Flask, jsonify, request
from flask_cors import CORS
from werkzeug.security import check_password_hash, generate_password_hash

from config import get_connection


app = Flask(__name__)
app.config["SECRET_KEY"] = os.getenv("JWT_SECRET", "nutritrack_flask_secret_2026")

CORS(
    app,
    resources={r"/api/*": {"origins": [
        "http://35.253.4.191",
        "http://localhost:4200",
    ]}},
)


def normalize_value(value):
    if isinstance(value, Decimal):
        return float(value)
    if isinstance(value, (datetime, date, time)):
        return value.isoformat()
    return value


def rows_to_dicts(cursor):
    columns = [column[0] for column in cursor.description]
    rows = []
    for row in cursor.fetchall():
        rows.append({columns[index]: normalize_value(value) for index, value in enumerate(row)})
    return rows


def fetch_all(query, params=()):
    conn = get_connection()
    try:
        cursor = conn.cursor()
        cursor.execute(query, params)
        return rows_to_dicts(cursor)
    finally:
        conn.close()


def fetch_one(query, params=()):
    rows = fetch_all(query, params)
    return rows[0] if rows else None


def execute_insert(cursor, query, params=()):
    cursor.execute(query, params)
    cursor.execute("SELECT LAST_INSERT_ID()")
    return cursor.fetchone()[0]


def auth_required(view_func):
    @wraps(view_func)
    def wrapper(*args, **kwargs):
        header = request.headers.get("Authorization", "")
        if not header.startswith("Bearer "):
            return jsonify({"error": "Token requerido"}), 401

        token = header.split(" ", 1)[1]
        try:
            request.user = jwt.decode(
                token,
                app.config["SECRET_KEY"],
                algorithms=["HS256"],
            )
        except jwt.PyJWTError:
            return jsonify({"error": "Token invalido o expirado"}), 401

        return view_func(*args, **kwargs)

    return wrapper


@app.get("/")
def health():
    return jsonify({"mensaje": "NutriTrack API Flask funcionando", "version": "2.0.0"})


@app.post("/api/auth/registro")
def registro():
    data = request.get_json(force=True)
    nombre = data.get("nombre")
    email = data.get("email")
    password = data.get("password")

    if not nombre or not email or not password:
        return jsonify({"error": "Nombre, email y contrasena son requeridos"}), 400

    conn = get_connection()
    try:
        cursor = conn.cursor()
        cursor.execute("SELECT id FROM usuarios WHERE email = ?", (email,))
        if cursor.fetchone():
            return jsonify({"error": "El email ya esta registrado"}), 409

        password_hash = generate_password_hash(password)
        user_id = execute_insert(
            cursor,
            """
            INSERT INTO usuarios (nombre, email, password_hash, fecha_nacimiento, sexo, altura_cm)
            VALUES (?, ?, ?, ?, ?, ?)
            """,
            (
                nombre,
                email,
                password_hash,
                data.get("fecha_nacimiento"),
                data.get("sexo"),
                data.get("altura_cm"),
            ),
        )

        execute_insert(
            cursor,
            """
            INSERT INTO perfil_fisico (usuario_id, peso_kg, meta_calorias, meta_proteina_g, meta_carbs_g, meta_grasas_g)
            VALUES (?, NULL, 2000, 50, 250, 70)
            """,
            (user_id,),
        )

        conn.commit()
    except Exception as error:
        conn.rollback()
        return jsonify({"error": str(error)}), 500
    finally:
        conn.close()

    token = jwt.encode(
        {
            "id": user_id,
            "nombre": nombre,
            "email": email,
            "exp": datetime.utcnow() + timedelta(days=7),
        },
        app.config["SECRET_KEY"],
        algorithm="HS256",
    )
    return jsonify({"token": token, "usuario": {"id": user_id, "nombre": nombre, "email": email}}), 201


@app.post("/api/auth/login")
def login():
    data = request.get_json(force=True)
    email = data.get("email")
    password = data.get("password")

    if not email or not password:
        return jsonify({"error": "Email y contrasena requeridos"}), 400

    usuario = fetch_one(
        "SELECT id, nombre, email, password_hash FROM usuarios WHERE email = ?",
        (email,),
    )
    if not usuario or not check_password_hash(usuario["password_hash"], password):
        return jsonify({"error": "Credenciales incorrectas"}), 401

    token = jwt.encode(
        {
            "id": usuario["id"],
            "nombre": usuario["nombre"],
            "email": usuario["email"],
            "exp": datetime.utcnow() + timedelta(days=7),
        },
        app.config["SECRET_KEY"],
        algorithm="HS256",
    )
    return jsonify({
        "token": token,
        "usuario": {"id": usuario["id"], "nombre": usuario["nombre"], "email": usuario["email"]},
    })


@app.get("/api/alimentos")
@auth_required
def listar_alimentos():
    categoria = request.args.get("categoria")
    buscar = request.args.get("buscar")
    sql = "SELECT * FROM alimentos WHERE (es_personalizado = FALSE OR creado_por = ?)"
    params = [request.user["id"]]

    if categoria and categoria != "todos":
        sql += " AND categoria = ?"
        params.append(categoria)
    if buscar:
        sql += " AND nombre LIKE ?"
        params.append(f"%{buscar}%")

    sql += " ORDER BY nombre ASC"
    return jsonify(fetch_all(sql, tuple(params)))


@app.get("/api/alimentos/<int:alimento_id>")
@auth_required
def obtener_alimento(alimento_id):
    alimento = fetch_one("SELECT * FROM alimentos WHERE id = ?", (alimento_id,))
    if not alimento:
        return jsonify({"error": "Alimento no encontrado"}), 404
    return jsonify(alimento)


@app.post("/api/alimentos")
@auth_required
def crear_alimento():
    data = request.get_json(force=True)
    nombre = data.get("nombre")
    calorias = data.get("calorias_por_100g")
    if not nombre or calorias is None:
        return jsonify({"error": "Nombre y calorias son requeridos"}), 400

    conn = get_connection()
    try:
        cursor = conn.cursor()
        alimento_id = execute_insert(
            cursor,
            """
            INSERT INTO alimentos
            (nombre, marca, categoria, calorias_por_100g, proteina_g, carbs_g, grasas_g, fibra_g, es_personalizado, creado_por)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, TRUE, ?)
            """,
            (
                nombre,
                data.get("marca"),
                data.get("categoria", "otro"),
                calorias,
                data.get("proteina_g", 0),
                data.get("carbs_g", 0),
                data.get("grasas_g", 0),
                data.get("fibra_g", 0),
                request.user["id"],
            ),
        )
        conn.commit()
        return jsonify({"id": alimento_id, "mensaje": "Alimento creado"}), 201
    except Exception as error:
        conn.rollback()
        return jsonify({"error": str(error)}), 500
    finally:
        conn.close()


@app.get("/api/registros")
@auth_required
def listar_registros():
    fecha = request.args.get("fecha") or date.today().isoformat()
    registros = fetch_all(
        """
        SELECT rc.*, a.nombre AS alimento_nombre, a.categoria
        FROM registros_comida rc
        JOIN alimentos a ON rc.alimento_id = a.id
        WHERE rc.usuario_id = ? AND rc.fecha = ?
        ORDER BY rc.hora ASC, rc.id ASC
        """,
        (request.user["id"], fecha),
    )
    return jsonify(registros)


@app.post("/api/registros")
@auth_required
def crear_registro():
    data = request.get_json(force=True)
    alimento_id = data.get("alimento_id")
    tiempo_comida = data.get("tiempo_comida")
    cantidad_g = data.get("cantidad_g")

    if not alimento_id or not tiempo_comida or not cantidad_g:
        return jsonify({"error": "alimento_id, tiempo_comida y cantidad_g son requeridos"}), 400

    alimento = fetch_one(
        "SELECT calorias_por_100g, proteina_g, carbs_g, grasas_g FROM alimentos WHERE id = ?",
        (alimento_id,),
    )
    if not alimento:
        return jsonify({"error": "Alimento no encontrado"}), 404

    factor = float(cantidad_g) / 100
    calorias_totales = alimento["calorias_por_100g"] * factor
    proteina_total = alimento["proteina_g"] * factor
    carbs_total = alimento["carbs_g"] * factor
    grasas_total = alimento["grasas_g"] * factor
    fecha_registro = data.get("fecha") or date.today().isoformat()

    conn = get_connection()
    try:
        cursor = conn.cursor()
        registro_id = execute_insert(
            cursor,
            """
            INSERT INTO registros_comida
            (usuario_id, alimento_id, tiempo_comida, cantidad_g, calorias_totales, proteina_total, carbs_total, grasas_total, fecha, hora)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            """,
            (
                request.user["id"],
                alimento_id,
                tiempo_comida,
                cantidad_g,
                calorias_totales,
                proteina_total,
                carbs_total,
                grasas_total,
                fecha_registro,
                data.get("hora"),
            ),
        )
        conn.commit()
        return jsonify({"id": registro_id, "calorias_totales": calorias_totales, "mensaje": "Registro guardado"}), 201
    except Exception as error:
        conn.rollback()
        return jsonify({"error": str(error)}), 500
    finally:
        conn.close()


@app.delete("/api/registros/<int:registro_id>")
@auth_required
def eliminar_registro(registro_id):
    conn = get_connection()
    try:
        cursor = conn.cursor()
        cursor.execute(
            "DELETE FROM registros_comida WHERE id = ? AND usuario_id = ?",
            (registro_id, request.user["id"]),
        )
        conn.commit()
        if cursor.rowcount == 0:
            return jsonify({"error": "Registro no encontrado"}), 404
        return jsonify({"mensaje": "Registro eliminado"})
    except Exception as error:
        conn.rollback()
        return jsonify({"error": str(error)}), 500
    finally:
        conn.close()


@app.get("/api/dashboard")
@auth_required
def dashboard():
    fecha = request.args.get("fecha") or date.today().isoformat()

    consumido = fetch_one(
        """
        SELECT
          COALESCE(SUM(calorias_totales), 0) AS calorias,
          COALESCE(SUM(proteina_total), 0) AS proteina,
          COALESCE(SUM(carbs_total), 0) AS carbs,
          COALESCE(SUM(grasas_total), 0) AS grasas
        FROM registros_comida
        WHERE usuario_id = ? AND fecha = ?
        """,
        (request.user["id"], fecha),
    )
    metas = fetch_one(
        """
        SELECT meta_calorias, meta_proteina_g, meta_carbs_g, meta_grasas_g, peso_kg
        FROM perfil_fisico
        WHERE usuario_id = ?
        """,
        (request.user["id"],),
    ) or {
        "meta_calorias": 2000,
        "meta_proteina_g": 50,
        "meta_carbs_g": 250,
        "meta_grasas_g": 70,
        "peso_kg": None,
    }
    agua = fetch_one(
        """
        SELECT COALESCE(SUM(cantidad_ml), 0) AS total_ml
        FROM registro_agua
        WHERE usuario_id = ? AND fecha = ?
        """,
        (request.user["id"], fecha),
    )
    semana = fetch_all(
        """
        SELECT fecha, COALESCE(SUM(calorias_totales), 0) AS calorias
        FROM registros_comida
        WHERE usuario_id = ? AND fecha >= DATE_SUB(?, INTERVAL 6 DAY)
        GROUP BY fecha
        ORDER BY fecha ASC
        """,
        (request.user["id"], fecha),
    )
    peso_actual = fetch_one(
        """
        SELECT peso_kg, fecha
        FROM historial_peso
        WHERE usuario_id = ?
        ORDER BY fecha DESC, id DESC
        LIMIT 1
        """,
        (request.user["id"],),
    )

    return jsonify({
        "fecha": fecha,
        "consumido": consumido,
        "metas": metas,
        "agua_ml": agua["total_ml"] if agua else 0,
        "semana": semana,
        "peso_actual": peso_actual,
    })


@app.get("/api/perfil")
@auth_required
def obtener_perfil():
    perfil = fetch_one(
        """
        SELECT u.id, u.nombre, u.email, u.fecha_nacimiento, u.sexo, u.altura_cm,
               p.peso_kg, p.meta_calorias, p.meta_proteina_g, p.meta_carbs_g, p.meta_grasas_g
        FROM usuarios u
        LEFT JOIN perfil_fisico p ON u.id = p.usuario_id
        WHERE u.id = ?
        """,
        (request.user["id"],),
    )
    if not perfil:
        return jsonify({"error": "Usuario no encontrado"}), 404
    return jsonify(perfil)


@app.put("/api/perfil")
@auth_required
def actualizar_perfil():
    data = request.get_json(force=True)
    conn = get_connection()
    try:
        cursor = conn.cursor()
        cursor.execute(
            """
            UPDATE usuarios
            SET nombre = ?, fecha_nacimiento = ?, sexo = ?, altura_cm = ?
            WHERE id = ?
            """,
            (
                data.get("nombre"),
                data.get("fecha_nacimiento"),
                data.get("sexo"),
                data.get("altura_cm"),
                request.user["id"],
            ),
        )
        cursor.execute(
            """
            UPDATE perfil_fisico
            SET peso_kg = ?, meta_calorias = ?, meta_proteina_g = ?, meta_carbs_g = ?, meta_grasas_g = ?
            WHERE usuario_id = ?
            """,
            (
                data.get("peso_kg"),
                data.get("meta_calorias", 2000),
                data.get("meta_proteina_g", 50),
                data.get("meta_carbs_g", 250),
                data.get("meta_grasas_g", 70),
                request.user["id"],
            ),
        )
        if data.get("peso_kg"):
            execute_insert(
                cursor,
                "INSERT INTO historial_peso (usuario_id, peso_kg, fecha) VALUES (?, ?, CURDATE())",
                (request.user["id"], data.get("peso_kg")),
            )
        conn.commit()
        return jsonify({"mensaje": "Perfil actualizado"})
    except Exception as error:
        conn.rollback()
        return jsonify({"error": str(error)}), 500
    finally:
        conn.close()


@app.get("/api/historial/peso")
@auth_required
def historial_peso():
    return jsonify(
        fetch_all(
            "SELECT * FROM historial_peso WHERE usuario_id = ? ORDER BY fecha DESC, id DESC LIMIT 30",
            (request.user["id"],),
        )
    )


@app.post("/api/historial/peso")
@auth_required
def registrar_peso():
    data = request.get_json(force=True)
    peso_kg = data.get("peso_kg")
    if not peso_kg:
        return jsonify({"error": "peso_kg es requerido"}), 400

    conn = get_connection()
    try:
        cursor = conn.cursor()
        peso_id = execute_insert(
            cursor,
            "INSERT INTO historial_peso (usuario_id, peso_kg, fecha, nota) VALUES (?, ?, ?, ?)",
            (
                request.user["id"],
                peso_kg,
                data.get("fecha") or date.today().isoformat(),
                data.get("nota"),
            ),
        )
        conn.commit()
        return jsonify({"id": peso_id, "mensaje": "Peso registrado"}), 201
    except Exception as error:
        conn.rollback()
        return jsonify({"error": str(error)}), 500
    finally:
        conn.close()


@app.get("/api/historial/agua")
@auth_required
def historial_agua():
    fecha = request.args.get("fecha") or date.today().isoformat()
    registros = fetch_all(
        """
        SELECT * FROM registro_agua
        WHERE usuario_id = ? AND fecha = ?
        ORDER BY hora ASC, id ASC
        """,
        (request.user["id"], fecha),
    )
    total = fetch_one(
        """
        SELECT COALESCE(SUM(cantidad_ml), 0) AS total_ml
        FROM registro_agua
        WHERE usuario_id = ? AND fecha = ?
        """,
        (request.user["id"], fecha),
    )
    return jsonify({"registros": registros, "total_ml": total["total_ml"] if total else 0})


@app.post("/api/historial/agua")
@auth_required
def registrar_agua():
    data = request.get_json(force=True)
    cantidad_ml = data.get("cantidad_ml")
    if not cantidad_ml:
        return jsonify({"error": "cantidad_ml es requerido"}), 400

    conn = get_connection()
    try:
        cursor = conn.cursor()
        agua_id = execute_insert(
            cursor,
            "INSERT INTO registro_agua (usuario_id, cantidad_ml, fecha, hora) VALUES (?, ?, ?, ?)",
            (
                request.user["id"],
                cantidad_ml,
                data.get("fecha") or date.today().isoformat(),
                data.get("hora"),
            ),
        )
        conn.commit()
        return jsonify({"id": agua_id, "mensaje": "Agua registrada"}), 201
    except Exception as error:
        conn.rollback()
        return jsonify({"error": str(error)}), 500
    finally:
        conn.close()


@app.get("/api/recetas")
@auth_required
def listar_recetas():
    recetas = fetch_all(
        """
        SELECT r.*, u.nombre AS autor
        FROM recetas r
        LEFT JOIN usuarios u ON r.creado_por = u.id
        ORDER BY r.id DESC
        """
    )
    return jsonify(recetas)


@app.get("/api/recetas/<int:receta_id>")
@auth_required
def obtener_receta(receta_id):
    receta = fetch_one("SELECT * FROM recetas WHERE id = ?", (receta_id,))
    if not receta:
        return jsonify({"error": "Receta no encontrada"}), 404
    ingredientes = fetch_all(
        """
        SELECT ri.cantidad_g, a.nombre, a.calorias_por_100g, a.proteina_g, a.carbs_g, a.grasas_g
        FROM receta_ingredientes ri
        JOIN alimentos a ON ri.alimento_id = a.id
        WHERE ri.receta_id = ?
        """,
        (receta_id,),
    )
    receta["ingredientes"] = ingredientes
    return jsonify(receta)


@app.post("/api/recetas")
@auth_required
def crear_receta():
    data = request.get_json(force=True)
    nombre = data.get("nombre")
    ingredientes = data.get("ingredientes", [])
    if not nombre or not ingredientes:
        return jsonify({"error": "Nombre e ingredientes son requeridos"}), 400

    conn = get_connection()
    try:
        cursor = conn.cursor()
        calorias_total = 0
        for ingrediente in ingredientes:
            cursor.execute(
                "SELECT calorias_por_100g FROM alimentos WHERE id = ?",
                (ingrediente["alimento_id"],),
            )
            alimento = cursor.fetchone()
            if alimento:
                calorias_total += float(alimento[0]) * (float(ingrediente["cantidad_g"]) / 100)

        receta_id = execute_insert(
            cursor,
            """
            INSERT INTO recetas (nombre, descripcion, tiempo_min, calorias_total, creado_por)
            VALUES (?, ?, ?, ?, ?)
            """,
            (
                nombre,
                data.get("descripcion"),
                data.get("tiempo_min"),
                calorias_total,
                request.user["id"],
            ),
        )

        for ingrediente in ingredientes:
            execute_insert(
                cursor,
                """
                INSERT INTO receta_ingredientes (receta_id, alimento_id, cantidad_g)
                VALUES (?, ?, ?)
                """,
                (receta_id, ingrediente["alimento_id"], ingrediente["cantidad_g"]),
            )
        conn.commit()
        return jsonify({"id": receta_id, "calorias_total": calorias_total, "mensaje": "Receta creada"}), 201
    except Exception as error:
        conn.rollback()
        return jsonify({"error": str(error)}), 500
    finally:
        conn.close()


@app.get("/api/notificaciones")
@auth_required
def listar_notificaciones():
    notificaciones = fetch_all(
        "SELECT * FROM notificaciones WHERE usuario_id = ? ORDER BY creado_en DESC LIMIT 20",
        (request.user["id"],),
    )
    return jsonify(notificaciones)


@app.put("/api/notificaciones/<int:notificacion_id>/leer")
@auth_required
def marcar_notificacion(notificacion_id):
    conn = get_connection()
    try:
        cursor = conn.cursor()
        cursor.execute(
            "UPDATE notificaciones SET leida = TRUE WHERE id = ? AND usuario_id = ?",
            (notificacion_id, request.user["id"]),
        )
        conn.commit()
        return jsonify({"mensaje": "Notificacion leida"})
    except Exception as error:
        conn.rollback()
        return jsonify({"error": str(error)}), 500
    finally:
        conn.close()


@app.put("/api/notificaciones/leer-todas")
@auth_required
def marcar_todas():
    conn = get_connection()
    try:
        cursor = conn.cursor()
        cursor.execute(
            "UPDATE notificaciones SET leida = TRUE WHERE usuario_id = ?",
            (request.user["id"],),
        )
        conn.commit()
        return jsonify({"mensaje": "Todas leidas"})
    except Exception as error:
        conn.rollback()
        return jsonify({"error": str(error)}), 500
    finally:
        conn.close()


if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000, debug=True)
