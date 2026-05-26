# NutriTrack API

Backend REST con Node.js + Express + MySQL para la app NutriTrack.

## Requisitos
- Node.js 18+
- MySQL 8 o MariaDB 10.6+

## Instalación

```bash
# 1. Instalar dependencias
npm install

# 2. Copiar el archivo de variables de entorno
cp .env.example .env

# 3. Editar .env con tus datos de MySQL
# DB_HOST, DB_USER, DB_PASSWORD, DB_NAME, JWT_SECRET

# 4. Crear la base de datos (usa el script nutritrack_db.sql)
mysql -u root -p < nutritrack_db.sql

# 5. Arrancar el servidor en modo desarrollo
npm run dev
```

El servidor corre en **http://localhost:3001**

## Endpoints disponibles

| Método | Ruta                      | Descripción                        | Auth |
|--------|---------------------------|------------------------------------|------|
| POST   | /api/auth/registro        | Crear cuenta nueva                 | No   |
| POST   | /api/auth/login           | Iniciar sesión → devuelve token    | No   |
| GET    | /api/dashboard?fecha=     | Resumen del día                    | Sí   |
| GET    | /api/alimentos            | Catálogo (filtros: categoria, buscar) | Sí |
| GET    | /api/alimentos/:id        | Detalle de un alimento             | Sí   |
| POST   | /api/alimentos            | Crear alimento personalizado       | Sí   |
| GET    | /api/registros?fecha=     | Registros del día                  | Sí   |
| POST   | /api/registros            | Agregar registro de comida         | Sí   |
| DELETE | /api/registros/:id        | Eliminar registro                  | Sí   |
| GET    | /api/perfil               | Ver datos del perfil               | Sí   |
| PUT    | /api/perfil               | Actualizar perfil y metas          | Sí   |
| GET    | /api/historial/peso       | Historial de pesajes               | Sí   |
| POST   | /api/historial/peso       | Registrar peso                     | Sí   |
| GET    | /api/historial/agua?fecha=| Agua consumida en el día           | Sí   |
| POST   | /api/historial/agua       | Registrar vaso de agua             | Sí   |
| GET    | /api/historial/logros     | Logros del usuario                 | Sí   |
| GET    | /api/recetas              | Listar recetas                     | Sí   |
| GET    | /api/recetas/:id          | Detalle con ingredientes           | Sí   |
| POST   | /api/recetas              | Crear receta                       | Sí   |

## Autenticación

Los endpoints marcados con **Sí** requieren el header:
```
Authorization: Bearer <token>
```
El token se obtiene al hacer login o registro.

## Estructura del proyecto

```
nutritrack-api/
├── server.js               # Punto de entrada
├── .env.example            # Variables de entorno (copiar a .env)
├── package.json
└── src/
    ├── config/
    │   └── db.js           # Pool de conexión MySQL
    ├── middlewares/
    │   └── auth.js         # Verificación JWT
    ├── routes/
    │   ├── index.js        # Router principal
    │   ├── auth.routes.js
    │   ├── alimentos.routes.js
    │   ├── registros.routes.js
    │   ├── dashboard.routes.js
    │   ├── perfil.routes.js
    │   ├── historial.routes.js
    │   └── recetas.routes.js
    └── controllers/
        ├── auth.controller.js
        ├── alimentos.controller.js
        ├── registros.controller.js
        ├── dashboard.controller.js
        ├── perfil.controller.js
        ├── historial.controller.js
        └── recetas.controller.js
```
