-- ============================================================
--  NutriTrack — Script de base de datos MySQL
--  Generado para uso con Node.js + Express
-- ============================================================

CREATE DATABASE IF NOT EXISTS nutritrack
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE nutritrack;

-- ============================================================
--  1. USUARIOS
-- ============================================================
CREATE TABLE usuarios (
  id               INT           NOT NULL AUTO_INCREMENT,
  nombre           VARCHAR(100)  NOT NULL,
  email            VARCHAR(150)  NOT NULL UNIQUE,
  password_hash    VARCHAR(255)  NOT NULL,
  fecha_nacimiento DATE,
  sexo             ENUM('masculino','femenino','otro'),
  altura_cm        FLOAT,
  creado_en        TIMESTAMP     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id)
);

-- ============================================================
--  2. PERFIL FÍSICO  (metas y medidas actuales)
-- ============================================================
CREATE TABLE perfil_fisico (
  id               INT    NOT NULL AUTO_INCREMENT,
  usuario_id       INT    NOT NULL UNIQUE,
  peso_kg          FLOAT,
  meta_calorias    FLOAT  NOT NULL DEFAULT 2000,
  meta_proteina_g  FLOAT  NOT NULL DEFAULT 50,
  meta_carbs_g     FLOAT  NOT NULL DEFAULT 250,
  meta_grasas_g    FLOAT  NOT NULL DEFAULT 70,
  actualizado_en   TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
                             ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  CONSTRAINT fk_perfil_usuario
    FOREIGN KEY (usuario_id) REFERENCES usuarios(id)
    ON DELETE CASCADE
);

-- ============================================================
--  3. ALIMENTOS  (catálogo base + personalizados)
-- ============================================================
CREATE TABLE alimentos (
  id                INT           NOT NULL AUTO_INCREMENT,
  nombre            VARCHAR(150)  NOT NULL,
  marca             VARCHAR(100),
  categoria         ENUM(
                      'verduras','frutas','cereales',
                      'proteinas','lacteos','grasas','bebidas','otro'
                    ) NOT NULL DEFAULT 'otro',
  calorias_por_100g FLOAT         NOT NULL DEFAULT 0,
  proteina_g        FLOAT         NOT NULL DEFAULT 0,
  carbs_g           FLOAT         NOT NULL DEFAULT 0,
  grasas_g          FLOAT         NOT NULL DEFAULT 0,
  fibra_g           FLOAT         NOT NULL DEFAULT 0,
  es_personalizado  BOOLEAN       NOT NULL DEFAULT FALSE,
  creado_por        INT,
  PRIMARY KEY (id),
  CONSTRAINT fk_alimento_usuario
    FOREIGN KEY (creado_por) REFERENCES usuarios(id)
    ON DELETE SET NULL
);

-- ============================================================
--  4. REGISTROS DE COMIDA
-- ============================================================
CREATE TABLE registros_comida (
  id               INT    NOT NULL AUTO_INCREMENT,
  usuario_id       INT    NOT NULL,
  alimento_id      INT    NOT NULL,
  tiempo_comida    ENUM('desayuno','almuerzo','cena','colacion') NOT NULL,
  cantidad_g       FLOAT  NOT NULL,
  calorias_totales FLOAT  NOT NULL,
  proteina_total   FLOAT  NOT NULL DEFAULT 0,
  carbs_total      FLOAT  NOT NULL DEFAULT 0,
  grasas_total     FLOAT  NOT NULL DEFAULT 0,
  fecha            DATE   NOT NULL,
  hora             TIME,
  PRIMARY KEY (id),
  CONSTRAINT fk_registro_usuario
    FOREIGN KEY (usuario_id) REFERENCES usuarios(id)
    ON DELETE CASCADE,
  CONSTRAINT fk_registro_alimento
    FOREIGN KEY (alimento_id) REFERENCES alimentos(id)
    ON DELETE RESTRICT
);

-- ============================================================
--  5. RECETAS
-- ============================================================
CREATE TABLE recetas (
  id               INT           NOT NULL AUTO_INCREMENT,
  nombre           VARCHAR(150)  NOT NULL,
  descripcion      TEXT,
  tiempo_min       INT,
  calorias_total   FLOAT         NOT NULL DEFAULT 0,
  creado_por       INT,
  PRIMARY KEY (id),
  CONSTRAINT fk_receta_usuario
    FOREIGN KEY (creado_por) REFERENCES usuarios(id)
    ON DELETE SET NULL
);

-- ============================================================
--  6. RECETA — INGREDIENTES  (tabla pivote)
-- ============================================================
CREATE TABLE receta_ingredientes (
  id          INT   NOT NULL AUTO_INCREMENT,
  receta_id   INT   NOT NULL,
  alimento_id INT   NOT NULL,
  cantidad_g  FLOAT NOT NULL,
  PRIMARY KEY (id),
  CONSTRAINT fk_ri_receta
    FOREIGN KEY (receta_id) REFERENCES recetas(id)
    ON DELETE CASCADE,
  CONSTRAINT fk_ri_alimento
    FOREIGN KEY (alimento_id) REFERENCES alimentos(id)
    ON DELETE RESTRICT
);

-- ============================================================
--  7. HISTORIAL DE PESO
-- ============================================================
CREATE TABLE historial_peso (
  id         INT    NOT NULL AUTO_INCREMENT,
  usuario_id INT    NOT NULL,
  peso_kg    FLOAT  NOT NULL,
  fecha      DATE   NOT NULL,
  nota       TEXT,
  PRIMARY KEY (id),
  CONSTRAINT fk_peso_usuario
    FOREIGN KEY (usuario_id) REFERENCES usuarios(id)
    ON DELETE CASCADE
);

-- ============================================================
--  8. REGISTRO DE AGUA
-- ============================================================
CREATE TABLE registro_agua (
  id          INT    NOT NULL AUTO_INCREMENT,
  usuario_id  INT    NOT NULL,
  cantidad_ml FLOAT  NOT NULL,
  fecha       DATE   NOT NULL,
  hora        TIME,
  PRIMARY KEY (id),
  CONSTRAINT fk_agua_usuario
    FOREIGN KEY (usuario_id) REFERENCES usuarios(id)
    ON DELETE CASCADE
);

-- ============================================================
--  9. LOGROS  (catálogo)
-- ============================================================
CREATE TABLE logros (
  id          INT           NOT NULL AUTO_INCREMENT,
  nombre      VARCHAR(100)  NOT NULL,
  descripcion TEXT,
  icono       VARCHAR(10),
  tipo        ENUM(
                'racha','calorias','peso','agua','recetas','registros'
              ) NOT NULL,
  valor_meta  INT           NOT NULL DEFAULT 1,
  PRIMARY KEY (id)
);

-- ============================================================
--  10. USUARIO — LOGROS  (tabla pivote)
-- ============================================================
CREATE TABLE usuario_logros (
  id               INT       NOT NULL AUTO_INCREMENT,
  usuario_id       INT       NOT NULL,
  logro_id         INT       NOT NULL,
  desbloqueado_en  TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uq_usuario_logro (usuario_id, logro_id),
  CONSTRAINT fk_ul_usuario
    FOREIGN KEY (usuario_id) REFERENCES usuarios(id)
    ON DELETE CASCADE,
  CONSTRAINT fk_ul_logro
    FOREIGN KEY (logro_id) REFERENCES logros(id)
    ON DELETE CASCADE
);

-- ============================================================
--  11. NOTIFICACIONES
-- ============================================================
CREATE TABLE notificaciones (
  id         INT           NOT NULL AUTO_INCREMENT,
  usuario_id INT           NOT NULL,
  titulo     VARCHAR(150)  NOT NULL,
  mensaje    TEXT,
  tipo       ENUM('logro','recordatorio','sistema','meta') NOT NULL DEFAULT 'sistema',
  leida      BOOLEAN       NOT NULL DEFAULT FALSE,
  creado_en  TIMESTAMP     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  CONSTRAINT fk_noti_usuario
    FOREIGN KEY (usuario_id) REFERENCES usuarios(id)
    ON DELETE CASCADE
);

-- ============================================================
--  ÍNDICES  (para acelerar las consultas más frecuentes)
-- ============================================================
CREATE INDEX idx_registros_fecha     ON registros_comida (usuario_id, fecha);
CREATE INDEX idx_historial_fecha     ON historial_peso   (usuario_id, fecha);
CREATE INDEX idx_agua_fecha          ON registro_agua    (usuario_id, fecha);
CREATE INDEX idx_noti_usuario_leida  ON notificaciones   (usuario_id, leida);
CREATE INDEX idx_alimentos_categoria ON alimentos        (categoria);

-- ============================================================
--  DATOS SEMILLA — Catálogo base de alimentos
-- ============================================================
INSERT INTO alimentos (nombre, categoria, calorias_por_100g, proteina_g, carbs_g, grasas_g, fibra_g, es_personalizado) VALUES
  ('Brócoli',          'verduras',  34,  2.8,  6.6,  0.4, 2.6, FALSE),
  ('Espinaca',         'verduras',  23,  2.9,  3.6,  0.4, 2.2, FALSE),
  ('Jitomate',         'verduras',  18,  0.9,  3.9,  0.2, 1.2, FALSE),
  ('Manzana verde',    'frutas',    52,  0.3, 14.0,  0.2, 2.4, FALSE),
  ('Plátano',          'frutas',    89,  1.1, 22.8,  0.3, 2.6, FALSE),
  ('Arándanos',        'frutas',    57,  0.7, 14.5,  0.3, 2.4, FALSE),
  ('Arroz integral',   'cereales', 111,  2.6, 23.0,  0.9, 1.8, FALSE),
  ('Avena',            'cereales', 389, 17.0, 66.0,  7.0,10.6, FALSE),
  ('Tortilla de maíz', 'cereales', 218,  5.7, 44.6,  2.8, 4.1, FALSE),
  ('Pechuga de pollo', 'proteinas',165, 31.0,  0.0,  3.6, 0.0, FALSE),
  ('Huevo entero',     'proteinas',155, 13.0,  1.1, 11.0, 0.0, FALSE),
  ('Frijoles negros',  'proteinas',132,  8.9, 23.7,  0.5, 8.7, FALSE),
  ('Atún en agua',     'proteinas', 86, 19.0,  0.0,  0.6, 0.0, FALSE),
  ('Leche entera',     'lacteos',   61,  3.2,  4.8,  3.3, 0.0, FALSE),
  ('Yogur griego',     'lacteos',   59, 10.0,  3.6,  0.4, 0.0, FALSE),
  ('Aguacate',         'grasas',   160,  2.0,  9.0, 15.0, 6.7, FALSE),
  ('Almendras',        'grasas',   579, 21.2, 21.7, 49.9,12.5, FALSE),
  ('Aceite de oliva',  'grasas',   884,  0.0,  0.0,100.0, 0.0, FALSE),
  ('Agua',             'bebidas',    0,  0.0,  0.0,  0.0, 0.0, FALSE),
  ('Leche de avena',   'bebidas',   46,  1.0,  7.4,  1.5, 0.8, FALSE);

-- ============================================================
--  DATOS SEMILLA — Logros
-- ============================================================
INSERT INTO logros (nombre, descripcion, icono, tipo, valor_meta) VALUES
  ('Primer registro',    'Registra tu primer alimento',              '🌱', 'registros', 1),
  ('Una semana seguida', 'Registra alimentos 7 días consecutivos',   '🔥', 'racha',     7),
  ('Mes completo',       'Registra alimentos 30 días consecutivos',  '🏆', 'racha',    30),
  ('Hidratado',          'Alcanza tu meta de agua un día',           '💧', 'agua',      1),
  ('Semana hidratada',   'Alcanza tu meta de agua 7 días seguidos',  '🌊', 'agua',      7),
  ('Meta cumplida',      'Cierra un día dentro de tu meta calórica', '🎯', 'calorias',  1),
  ('Chef NutriTrack',    'Crea tu primera receta personalizada',     '👨‍🍳','recetas',   1),
  ('Progreso real',      'Registra 5 pesajes en historial',          '⚖️', 'peso',      5);
