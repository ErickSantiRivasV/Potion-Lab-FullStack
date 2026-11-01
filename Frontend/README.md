# Potion Lab - Frontend

Aplicación web de gremios de alquimistas. Los gremios proponen fórmulas, los miembros votan por categoría y la fórmula avanza por `Proposal → VotingOpen → Closed → Distilled`. Las pociones destiladas quedan en el Grimorio.

## URLs públicas

- Frontend (Vercel): URL_DEL_FRONTEND
- Backend (Render): https://backend-entrega-2.onrender.com
- Swagger: https://backend-entrega-2.onrender.com/api-docs

El backend está en un plan gratuito y se duerme: la primera petición puede tardar hasta un minuto.

## Credenciales de prueba

| Rol | Correo | Contraseña |
|---|---|---|
| Usuario | `ana@potionlab.test` | `alquimia123` |
| Administrador | `erick@potionlab.test` | `alquimia123` |

## Tecnologías

React 19, Vite, Tailwind CSS 4, react-router-dom 7, Axios y React Compiler.

## Instalación local

Requisitos: Node 20 o superior y un backend en ejecución (local o el desplegado).

```bash
cd Frontend
npm install
cp .env.example .env
npm run dev
```

La aplicación queda en `http://localhost:5173`. Si cambias el `.env`, reinicia `npm run dev`.

| Variable | Descripción |
|---|---|
| `VITE_API_URL` | URL del backend incluyendo `/api`. Local: `http://localhost:4000/api`. Producción: `https://backend-entrega-2.onrender.com/api` |

Otros comandos: `npm run build`, `npm run preview`, `npm run lint`.

## Despliegue en Vercel

1. Importar el repositorio y usar `Frontend` como Root Directory.
2. Definir `VITE_API_URL` con la URL del backend más `/api` (se lee en el build: si cambia, hay que redesplegar).
3. `vercel.json` ya redirige todas las rutas a `index.html` para react-router.
4. Copiar la URL de Vercel en `FRONTEND_URL` del backend y redesplegarlo.

## Arquitectura

- `src/api/axios.js`: cliente Axios con `VITE_API_URL`, interceptor que adjunta el JWT y limpia la sesión en 401.
- `src/context/AuthContext.jsx`: estado global de sesión (login, registro, logout, verificación con `/auth/me`).
- `src/components/auth/ProtectedRoute.jsx`: protege rutas y valida el rol.
- `src/services/`: una capa por recurso (`authService`, `guildService`, `formulaService`, `userService`).
- `src/utils/mappers.js`: traduce las respuestas del backend al formato de la interfaz.
- `src/pages/`: vistas. Cada una maneja estados de carga, error y vacío.

## Roles y permisos

- Usuario: ver y crear gremios, unirse, proponer fórmulas según su rol de gremio, votar.
- Grandmaster del gremio o administrador: editar y eliminar el gremio, cambiar roles de miembros.
- Creador, Grandmaster, Senior Alchemist o administrador: cambiar el estado de una fórmula.
- Taster Oficial: veto una vez por fórmula en estado `Closed`.
- Administrador: ruta `/admin` con listado y eliminación de usuarios.

## Mapa de endpoints

Todos bajo `/api` y con `Authorization: Bearer <token>`, salvo registro y login.

| Recurso | Endpoints |
|---|---|
| Auth | `POST /auth/register`, `POST /auth/login`, `GET /auth/me` |
| Usuarios (admin) | `GET /users`, `GET /users/:id`, `PUT /users/:id`, `DELETE /users/:id` |
| Gremios | `GET /guilds`, `POST /guilds`, `GET /guilds/:id`, `PUT /guilds/:id`, `DELETE /guilds/:id` |
| Membresía | `POST /guilds/:id/join`, `POST /guilds/:id/leave`, `PATCH /guilds/:id/members/:userId/role` |
| Fórmulas | `GET /formulas`, `POST /formulas`, `GET /formulas/:id`, `PUT /formulas/:id`, `DELETE /formulas/:id` |
| Votación | `POST /formulas/:id/vote`, `PATCH /formulas/:id/state`, `POST /formulas/:id/veto` |

El detalle de cuerpos y respuestas está en el README del backend y en Swagger.
