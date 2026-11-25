# Dependencias del proyecto

El sitio sigue siendo HTML/CSS/JavaScript estático y se publica en GitHub Pages. Google Apps Script sigue siendo el backend de datos de la demo.

## Herramienta de compilación

| Dependencia | Versión fijada | Uso |
|---|---:|---|
| `tailwindcss` | 4.3.5 | Framework CSS |
| `@tailwindcss/cli` | 4.3.5 | Compilar CSS estático |

Comandos: `npm install` y `npm run build:css`. El CSS ya compilado se entrega en `css/tailwind.generated.css`. Ese artefacto se generó con Tailwind CLI 4.1.10 disponible en el entorno de preparación; al reconstruir el proyecto se usará la versión 4.3.5 fijada en `package.json`.

## Librerías de frontend (CDN, versiones fijadas)

| Librería | Versión | Uso |
|---|---:|---|
| Lucide | 1.79.0 | Iconografía SVG |
| DOMPurify | 3.5.0 | Sanitización del HTML de publicaciones |
| Swiper | 14.4.0 | Carrusel de noticias |
| PhotoSwipe | 5.4.4 | Ampliación y navegación de imágenes |
| Motion | 14.14.0 | Animaciones progresivas opcionales |
| TinyMCE | 7.x, ya existente | Editor del panel administrativo |

Las librerías remotas pueden no cargar si hay bloqueo de CDN o falta de conexión. Los componentes principales tienen estados de respaldo para que navegación y lectura no dependan de iconos o animaciones. La API de datos de Apps Script sí requiere conexión.

## Fuente de datos

No es una librería: el sitio utiliza el despliegue existente de Google Apps Script, junto con Google Sheets y Google Drive. Su URL se centraliza en `js/app-config.js`. No se debe cambiar ni duplicar esta conexión al publicar en GitHub Pages.

## Opcionales no instalados

Chart.js, Leaflet y Fuse.js no se incluyen porque la demo actual no necesita gráficas estadísticas, mapas interactivos ni búsqueda difusa. Se podrán incorporar si se define un uso concreto.
