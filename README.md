# FutsalFixture ⚡

**Creador de fixtures de futsal con compartición via URL**

Plataforma web para crear fixtures de torneos de futsal de forma rápida y sencilla. Los resultados se comparten via link y se ven en tiempo real.

## ✨ Características

- ⚡ **Generación automática** de fixtures (liga, eliminación, grupos)
- 🔗 **Compartición via URL** - cualquier persona con el link puede ver los resultados
- 📊 **Tabla de posiciones** en tiempo real
- 📱 **100% responsive** - funciona en celulares
- 💾 **Sin registro obligatorio** - los datos se guardan en tu navegador
- 🇵🇪 **Hecho en Perú**

## 🚀 Despliegue en Vercel

### Opción 1: Desde la web (más fácil)

1. Sube este repositorio a GitHub
2. Ve a [vercel.com](https://vercel.com)
3. "New Project" → Importa tu repositorio
4. Click **Deploy** ✅

### Opción 2: Desde CLI

```bash
npm i -g vercel
vercel login
vercel --prod
```

## 🛠️ Desarrollo local

```bash
# Instalar dependencias
npm install

# Iniciar desarrollo
npm run dev

# Abrir http://localhost:3000
```

## 📁 Estructura

```
futsalfixture/
├── app/                    # Next.js App Router
│   ├── page.tsx           # Landing page
│   ├── login/             # Login
│   ├── registro/          # Registro
│   ├── dashboard/         # Panel de usuario
│   ├── torneo/[id]/       # Gestión de torneo
│   └── publico/[hash]/    # Vista pública
├── lib/
│   ├── types.ts           # Tipos TypeScript
│   ├── fixture.ts        # Generador de fixtures
│   └── hooks.ts          # Hooks de React
└── vercel.json            # Config Vercel
```

## 🎨 Paleta de Colores (Ing. Electrónica)

| Color | Hex | Uso |
|-------|-----|-----|
| PCB Dark | `#0a1929` | Fondo principal |
| Circuit Blue | `#00b4d8` | Acento principal |
| LED Green | `#00f5a0` | Éxito / Destacados |
| LED Red | `#ff3860` | Error / Alerta |
| Copper | `#d97706` | Advertencia |

## 💡 Cómo funciona

1. **Sin registro:** Puedes crear fixtures sin crear cuenta
2. **Con registro:** Regístrate para guardar tus fixtures en el navegador
3. **Compartir:** Cada fixture tiene un link único para compartir
4. **Tiempo real:** Cuando actualizas resultados, todos los que ven el link los ven al instante

## 📝 Licencia

© 2024 FutsalFixture · Hecho con ⚡ en Perú 🇵🇪
