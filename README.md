# ⚽ Fútbol App — Landing Page

Landing page estática para **Fútbol App**, la plataforma de gestión de torneos de fútbol en Perú.

## 🚀 Deploy

### Opción 1: GitHub Pages

1. Sube este repositorio a GitHub:
   ```bash
   git init
   git add .
   git commit -m "Initial commit - Fútbol App landing page"
   git branch -M main
   git remote add origin https://github.com/TU_USUARIO/TU_REPO.git
   git push -u origin main
   ```

2. Ve a **Settings → Pages** en tu repositorio de GitHub

3. En **Source**, selecciona **Deploy from a branch**

4. Selecciona la rama `main` y carpeta `/ (root)`

5. Tu sitio estará disponible en: `https://TU_USUARIO.github.io/TU_REPO/`

### Opción 2: Vercel

1. Instala Vercel CLI (si no lo tienes):
   ```bash
   npm i -g vercel
   ```

2. Despliega:
   ```bash
   vercel
   ```

3. Para producción:
   ```bash
   vercel --prod
   ```

**Alternativa sin CLI**: Ve a [vercel.com](https://vercel.com), importa tu repositorio de GitHub y Vercel detectará automáticamente que es un sitio estático.

## 🛠 Desarrollo Local

Simplemente abre `index.html` en tu navegador, o usa un servidor local:

```bash
# Con Python
python -m http.server 8000

# Con Node.js
npx serve .
```

## 📁 Estructura

```
├── index.html       → Página principal
├── css/
│   └── styles.css   → Estilos personalizados
├── js/
│   └── main.js      → Interactividad
├── vercel.json      → Config de Vercel
└── README.md        → Este archivo
```

## 🎨 Tecnologías

- **HTML5** semántico con SEO completo
- **CSS3** con glassmorphism, animaciones y diseño responsive
- **JavaScript** vanilla — cero dependencias
- **Google Fonts** (Inter)

## 📱 Responsive

El sitio es completamente responsive y se adapta a:
- 📱 Móviles (< 480px)
- 📱 Tablets (< 768px)
- 💻 Laptops (< 1024px)
- 🖥 Desktop (> 1024px)

## 📄 Licencia

© 2024 Fútbol App. Todos los derechos reservados.

