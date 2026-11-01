# Potion Lab - Backend Entrega 3

Backend de Potion Lab realizado con Node.js, Express, MongoDB, Mongoose y JWT.

## Tecnologías

- Node.js
- Express
- MongoDB + Mongoose
- JWT
- bcryptjs
- express-validator
- Swagger

## Instalación

```bash
npm install
```

Crear un archivo `.env` a partir de `.env.example` y configurar:

```env
PORT=4000
MONGO_URI=...
JWT_SECRET=...
JWT_EXPIRES_IN=7d
NODE_ENV=development
FRONTEND_URL=http://localhost:5173
CORS_ORIGIN=http://localhost:5173
PUBLIC_URL=https://tu-backend.onrender.com
```

| Variable | Descripción |
|---|---|
| `PORT` | Puerto del servidor (en producción lo asigna Render/Railway) |
| `MONGO_URI` | Cadena de conexión de MongoDB Atlas (obligatoria) |
| `JWT_SECRET` | Clave para firmar los tokens (obligatoria) |
| `JWT_EXPIRES_IN` | Duración del token, por ejemplo `7d` |
| `NODE_ENV` | `development` o `production` |
| `FRONTEND_URL` | URL pública del frontend permitido por CORS |
| `CORS_ORIGIN` | Origen adicional permitido por CORS (compatibilidad) |
| `PUBLIC_URL` | URL pública del backend, se muestra en Swagger |

Si falta `MONGO_URI` o `JWT_SECRET`, el servidor avisa y no arranca.

## Ejecutar

Desarrollo:

```bash
npm run dev
```

Producción:

```bash
npm start
```

## Despliegue

- API desplegada: https://backend-entrega-2.onrender.com
- Swagger en producción: https://backend-entrega-2.onrender.com/api-docs
- Build command: `npm install`
- Start command: `npm start`
- Configurar en el servicio las mismas variables del `.env`.
- En MongoDB Atlas permitir el acceso desde cualquier IP.

## Swagger

En producción: https://backend-entrega-2.onrender.com/api-docs
- En local, con el servidor ejecutándose: `http://localhost:4000/api-docs`

## Cuentas de prueba

Ejecutar `npm run seed` para crear las cuentas si todavía no existen. El script no elimina ni modifica usuarios existentes, gremios ni fórmulas.

| Rol | Correo | Contraseña inicial |
|---|---|---|
| Usuario | `ana@potionlab.test` | `alquimia123` |
| Administrador | `erick@potionlab.test` | `alquimia123` |

## Persona A

### Autenticación

- `POST /api/auth/register`: registra un usuario y devuelve el token.
- `POST /api/auth/login`: inicia sesión y devuelve el token.
- `GET /api/auth/me`: devuelve el usuario autenticado (requiere JWT).

### Usuarios

Todas las rutas de usuarios requieren JWT y rol `admin`.

- `GET /api/users`
- `GET /api/users/:id`
- `PUT /api/users/:id`: solo permite editar `nombre`, `email`, `password`, `specialty`, `avatar` y `role`.
- `DELETE /api/users/:id`: un admin no puede eliminarse a sí mismo.

Para usar el token en Swagger o en el frontend se manda el header:

```
Authorization: Bearer <token>
```

## Persona B

Todas las rutas de gremios y fórmulas requieren JWT (`Authorization: Bearer <token>`).

### Gremios

- `GET /api/guilds`: lista los gremios (filtro opcional `?type=Public|Private`).
- `POST /api/guilds`: crea un gremio; quien lo crea queda como `Grandmaster`. Si es `Private` se envía `inviteCode`.
- `GET /api/guilds/:id`: detalle con miembros. El `inviteCode` solo lo ven el Grandmaster y los admin.
- `PUT /api/guilds/:id`: edita el gremio (solo Grandmaster o admin).
- `DELETE /api/guilds/:id`: elimina el gremio y sus fórmulas (solo Grandmaster o admin).
- `POST /api/guilds/:id/join`: unirse como `Apprentice` (en gremios privados se envía `inviteCode` en el body).
- `POST /api/guilds/:id/leave`: salir del gremio (el Grandmaster no puede salir).
- `PATCH /api/guilds/:id/members/:userId/role`: cambia el rol de un miembro (solo Grandmaster o admin). Asignar `Grandmaster` a otro miembro pasa al anterior a `Senior Alchemist`.

### Fórmulas

- `GET /api/formulas`: lista las fórmulas (filtros opcionales `?guildId=` y `?state=`). Las de gremios privados solo las ven sus miembros y los admin.
- `POST /api/formulas`: propone una fórmula (`guild`, `name`, `effect`, `difficulty` 1-5, `endDate`); solo miembros del gremio. Queda en `Proposal`.
- `GET /api/formulas/:id`: detalle de la fórmula.
- `PUT /api/formulas/:id`: edita la fórmula mientras esté en `Proposal` (creador, Grandmaster o admin).
- `DELETE /api/formulas/:id`: elimina la fórmula (creador, Grandmaster o admin).
- `POST /api/formulas/:id/vote`: vota en una categoría (`ingredient`, `method` o `flask`) con una opción válida. Solo miembros y solo en `VotingOpen`. Un usuario tiene un voto por categoría; si vota de nuevo, se reemplaza.
- `PATCH /api/formulas/:id/state`: avanza el estado (`Proposal` → `VotingOpen` → `Closed` → `Distilled`) y registra el cambio en `stateHistory`. Pueden hacerlo el creador, el Grandmaster, los Senior Alchemist y los admin.

- `POST /api/formulas/:id/veto`: veto del Taster Oficial del gremio (`category`, `option`). Solo una vez por fórmula y solo en `Closed`. La categoría vetada toma la opción elegida al destilar.

Las fórmulas en `VotingOpen` pasan solas a `Closed` cuando se consultan después de su `endDate`.

Al pasar a `Distilled` el backend calcula la poción final. Cada voto pesa 1; los miembros con especialidad Brewing pesan x1.2 en todas las categorías, Botany x1.2 en `ingredient`, Runes x1.2 en `method` y Alchemy x1.2 en `flask`; el rol de gremio `Taster` multiplica el peso por 2. En cada categoría gana la opción con más peso; el empate lo decide el voto del Taster Oficial, luego el del Grandmaster y, si ninguno votó, al azar. Para destilar debe haber votos en las tres categorías (o un veto). Se guardan en `finalPotion`: `finalName`, `winners`, `realDifficulty` (dificultad base + peso ganador de ingrediente + peso ganador de método) y `rarity` (`realDifficulty` x 10 + peso ingrediente x 3 + peso método x 2).

### Cuentas de prueba (seed)

```bash
npm run seed
```

Crea o actualiza únicamente las dos cuentas de prueba indicadas en la sección anterior. No elimina ni modifica otros usuarios, gremios ni fórmulas. La contraseña de esas dos cuentas queda en `alquimia123`.

Las especialidades que utiliza la interfaz se traducen a los valores aceptados por el modelo: Brewmaster → Brewing, Herbalist → Botany, Runist → Runes y Taster → Alchemy.

## Roles

El rol global de usuario es:

- `user` (por defecto al registrarse)
- `admin`

El script de cuentas de prueba crea un usuario estándar y un administrador. El registro público siempre crea cuentas con el rol `user`; el cliente no puede asignarse permisos de administrador.

Los roles de miembros de gremios (`Grandmaster`, `Senior Alchemist`, `Apprentice`, `Taster`) pertenecen al dominio de Guild y los maneja la Persona B.

## Estructura

```text
config/        # Conexión a la base de datos y Swagger
controllers/   # Manejo de req/res
middlewares/   # Auth (JWT y roles), validaciones y errores
models/        # Schemas de Mongoose (Usuario, Gremio, Formula)
routes/        # Definición de endpoints
scripts/       # Seed de cuentas de prueba
services/      # Lógica de negocio
utils/         # Funciones auxiliares y constantes
app.js         # Configuración de Express
index.js       # Arranque del servidor
```
