# ⚽ FútbolApp — Plataforma de Gestión de Torneos de Fútbol

Plataforma profesional para crear y gestionar torneos de fútbol online. 
Hecho en Perú 🇵🇪 con temática de **Ingeniería Electrónica**.

## ✨ Características

- 🏆 **Múltiples formatos:** Liga, Eliminación Directa, Grupos, Doble Eliminación
- ⚽ **Fixture automático** generado al instante
- 📊 **Tabla de posiciones** en tiempo real (GF, GC, DG, PTS)
- 🥅 **Goleadores y tarjetas** con rankings
- 🔗 **Links públicos compartibles** para cada torneo
- 👥 **Gestión de equipos y jugadores** completa
- 💰 **Planes:** Gratis (3 torneos) y PRO (S/ 20/mes)
- 📱 **100% responsive** — funciona perfecto en celulares
- 🇵🇪 **Pagos locales** con Yape/Plin (Perú)

## 🚀 Stack Técnico

- **Backend:** Node.js + Express
- **Base de datos:** MongoDB
- **Auth:** JWT + bcrypt
- **Frontend:** HTML5 + CSS3 + JavaScript vanilla
- **Pagos:** Yape / Plin (Perú)

## 📁 Estructura

```
futbolapp/
├── server/              # Backend Node.js
│   ├── index.js         # Servidor principal
│   ├── models/          # Modelos de MongoDB
│   ├── routes/          # Rutas de la API
│   ├── middleware/      # Middleware (auth)
│   └── utils/           # Utilidades (fixture generator)
├── public/              # Frontend estático
│   ├── index.html       # Landing page
│   ├── login.html       # Login
│   ├── registro.html    # Registro
│   ├── dashboard.html   # Panel del usuario
│   ├── torneo.html      # Gestión de torneo
│   ├── partido.html     # Partido en vivo
│   ├── planes.html      # Planes y pagos
│   ├── publico.html     # Vista pública compartible
│   ├── css/styles.css   # Estilos
│   └── js/api.js        # Cliente API
├── vercel.json          # Configuración Vercel
├── package.json
└── .env.example
```

## 🛠 Instalación Local

```bash
# 1. Clonar e instalar dependencias
git clone <repo>
cd futbolapp
npm install

# 2. Configurar variables de entorno
cp .env.example .env
# Editar .env con tu MONGODB_URI y JWT_SECRET

# 3. Iniciar MongoDB (local o Atlas)
# Opción A: Local
mongod

# Opción B: MongoDB Atlas (gratis)
# Crear cuenta en mongodb.com/atlas y obtener connection string

# 4. Iniciar servidor
npm start
# o con nodemon para desarrollo
npm run dev

# 5. Abrir en el navegador
http://localhost:3000
```

## 🌐 Despliegue

### Vercel (Recomendado)

```bash
# 1. Instalar Vercel CLI
npm i -g vercel

# 2. Login
vercel login

# 3. Desplegar
vercel

# 4. Configurar variables de entorno en Vercel Dashboard:
#    - MONGODB_URI (MongoDB Atlas)
#    - JWT_SECRET (cadena aleatoria segura)
#    - YAPE_NUMBER
#    - PLIN_NUMBER
#    - APP_URL

# 5. Producción
vercel --prod
```

### MongoDB Atlas (Base de datos en la nube)

1. Crear cuenta en [mongodb.com/atlas](https://www.mongodb.com/atlas)
2. Crear cluster gratuito
3. Obtener connection string
4. Configurar IP whitelist (0.0.0.0/0 para desarrollo)
5. Usar el connection string en `MONGODB_URI`

## 📋 Variables de Entorno

```env
MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/futbolapp
JWT_SECRET=cadena_aleatoria_muy_larga_y_segura
JWT_EXPIRE=30d
PORT=3000
FREE_PLAN_LIMIT=3
PRO_PLAN_PRICE=20
YAPE_NUMBER=51936400532
PLIN_NUMBER=51936400532
APP_URL=https://tu-dominio.vercel.app
```

## 🎨 Paleta de Colores (Ing. Electrónica)

- **PCB Dark:** `#0a1929` — Fondo principal
- **Circuit Blue:** `#00b4d8` — Acento principal
- **LED Green:** `#00f5a0` — Éxito
- **LED Red:** `#ff3860` — Error / Peligro
- **Copper:** `#d97706` — Advertencia

## 💰 Sistema de Planes

### 🆓 Plan Gratis
- Hasta 3 torneos activos
- Equipos ilimitados
- Fixture automático
- Tabla en tiempo real
- Links públicos compartibles
- Goleadores y tarjetas

### ⚡ Plan PRO (S/ 20/mes)
- Torneos **ILIMITADOS**
- Todo lo del plan gratis
- Soporte prioritario
- Sin marca de agua
- Estadísticas avanzadas
- Exportar a Excel
- Notificaciones push

## 🔌 API Endpoints

### Auth
- `POST /api/auth/registro` - Registro
- `POST /api/auth/login` - Login
- `GET /api/auth/me` - Usuario actual

### Torneos
- `GET /api/torneos` - Mis torneos
- `POST /api/torneos` - Crear torneo
- `GET /api/torneos/:id` - Obtener torneo
- `PUT /api/torneos/:id` - Actualizar
- `DELETE /api/torneos/:id` - Eliminar
- `POST /api/torneos/:id/generar-fixture` - Generar partidos
- `GET /api/torneos/:id/partidos` - Partidos

### Equipos
- `GET /api/equipos/torneo/:id` - Equipos del torneo
- `POST /api/equipos/torneo/:id` - Crear equipo
- `PUT /api/equipos/:id` - Actualizar
- `DELETE /api/equipos/:id` - Eliminar

### Partidos
- `GET /api/partidos/:id` - Obtener partido
- `PUT /api/partidos/:id` - Actualizar
- `POST /api/partidos/:id/incidencia` - Agregar gol/tarjeta
- `DELETE /api/partidos/:id/incidencia/:id` - Eliminar incidencia

### Pagos
- `POST /api/pagos/solicitar` - Solicitar PRO
- `GET /api/pagos/mis-pagos` - Mis pagos

### Público (sin auth)
- `GET /api/public/t/:publicoId` - Torneo público
- `GET /api/public/t/:publicoId/goleadores` - Goleadores
- `GET /api/public/t/:publicoId/tarjetas` - Tarjetas

## 🤝 Contacto

- 📱 WhatsApp: +51 936 400 532
- 📧 Email: contacto@futbolapp.pe
- 🌐 Web: [futbolapp.pe](https://futbolapp.pe)

## 📄 Licencia

© 2024 FútbolApp · Hecho con ⚡ en Perú 🇵🇪
