# IE San Juan del Córdoba — sitio institucional

Sitio informativo de la Institución Educativa San Juan del Córdoba, Ciénaga, Magdalena, Colombia.

**Etapa actual:** demo estática para GitHub Pages.  
**Fuente de datos:** Web App existente de Google Apps Script, conectada a Google Sheets y Google Drive.  
**Futuro:** migración del proveedor de datos a PHP/MySQL, sin reconstruir la interfaz.

## Tecnologías

- HTML5, CSS y JavaScript Vanilla.
- Tailwind CSS 4, compilado a un archivo CSS estático.
- Lucide, Swiper, PhotoSwipe, Motion y DOMPurify para componentes visuales y seguridad en el navegador.
- Google Apps Script como API real de lectura y escritura.
- Google Sheets para datos y Google Drive para multimedia.

GitHub Pages no ejecuta PHP. Esta entrega no contiene servidor PHP ni base de datos local.

## Estructura principal

```text
web-Sanjuan/
├── index.html                 # Portada institucional
├── articulo.html              # Plantilla dinámica por ?slug=
├── quienes-somos.html
├── contacto.html
├── aviso-legal.html
├── politica-privacidad.html
├── 404.html
├── admin/                     # Panel administrativo existente
├── categorias/                # Listados conectados a Apps Script
├── assets/img/                # Logotipo, favicon y placeholder provisional
├── css/                       # Estilos originales + rediseño + Tailwind compilado
├── js/                        # API, configuración, UI y módulos de página
├── data/                      # Datos auxiliares; no sustituyen la API en vivo
├── sitemap.xml
├── robots.txt
├── package.json
├── DEPENDENCIAS.md
└── CONFIGURACION.md
```

## Datos y backend

El frontend conserva la conexión con el despliegue actual de Google Apps Script. La URL se centraliza en `js/app-config.js` y es utilizada por `js/api.js`, `js/sitio-config.js` y los módulos del administrador.

Se preservan los contratos públicos de `window.sanjuanAPI`, el acceso administrativo mediante `window.sanjuanAdminAPI` y `window.sanjuanAuth`, además de la configuración institucional, noticias, categorías, comentarios, formularios y biblioteca multimedia.

Los datos reales continúan llegando desde Apps Script, Google Sheets y Google Drive. Los archivos JSON auxiliares no reemplazan ese flujo.

**Importante:** el ZIP de demostración no incluye el archivo fuente `Code.gs`. El frontend usa el Web App ya desplegado y no necesita el `.gs` para ejecutarse. Mantén el código fuente, el ID de Google Sheets y los secretos dentro del proyecto privado de Apps Script o en un respaldo fuera del repositorio público. Si el código original con secretos estuvo en un repositorio público, considera esos valores expuestos y rótalos.

## Compilar Tailwind

Node.js y npm solo son necesarios para modificar o recompilar los estilos. GitHub Pages sirve el CSS generado y no necesita Node.js.

```bash
npm install
npm run build:css
```

El archivo compilado ya está incluido en `css/tailwind.generated.css`. Las versiones de las dependencias están fijadas en `package.json` y documentadas en `DEPENDENCIAS.md`.

## Publicación en GitHub Pages

1. Descomprime el ZIP y abre el directorio `web-Sanjuan`.
2. Sube el contenido de ese directorio al repositorio que utilizará GitHub Pages.
3. En **Settings → Pages**, selecciona **Deploy from a branch**, la rama correspondiente y la carpeta `/ (root)`.
4. Abre la URL publicada y verifica portada, páginas internas, categorías, una noticia, contacto y el acceso al panel.
5. Comprueba que el endpoint de Apps Script siga desplegado y accesible para las operaciones que corresponden. Las operaciones administrativas deben continuar protegidas en el backend.

La configuración de `js/app-config.js` detecta la ruta base de un repositorio de proyecto (`usuario.github.io/repositorio/`) y de un sitio de usuario (`usuario.github.io/`). Si usas un dominio o una estructura no estándar, revisa `basePath`.

## Fotografías

El proyecto original solo incluía el logotipo como imagen institucional local. `assets/img/placeholder.svg` es una ilustración temporal, no una fotografía real de la escuela. Sustitúyela por imágenes autorizadas de la institución. La galería pública sigue consultando la biblioteca multimedia mediante Apps Script.

## Panel administrativo

El panel existente se conserva en `admin/`. Su autenticación y operaciones siguen utilizando Google Apps Script. No lo consideres una autenticación simulada del navegador: la autorización real debe validarse en el backend.

## Futura migración a PHP/MySQL

La migración queda fuera de esta entrega. Cuando se realice, se podrá reemplazar el proveedor de datos por una API PHP que mantenga los contratos utilizados por el frontend. No será necesario reconstruir el diseño.

## Pruebas realizadas en esta entrega

- Sintaxis de los archivos JavaScript.
- Validez de `package.json` y del JSON auxiliar.
- Existencia de referencias locales (`href` y `src`) en las 28 páginas HTML.
- Ausencia de IDs HTML duplicados.
- Validez sintáctica de bloques JSON-LD.
- Presencia de métodos públicos y globals administrativos esperados.

La integración en vivo de Google Apps Script y el renderizado en un navegador real deben verificarse después de publicar, ya que dependen del despliegue y de permisos externos.
