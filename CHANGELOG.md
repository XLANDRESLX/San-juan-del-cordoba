# CHANGELOG — WEB SANJUAN


## [10.2.0] — 2026-11-25 — Endurecimiento de seguridad

### Corregido (frontend)
- XSS en el panel: los datos que llegan de la API (títulos, autores, nombres de visitantes, etc.) ahora se escapan antes de insertarse en las tablas y el dashboard. Antes, el nombre escrito en el formulario público de contacto se ejecutaba en el navegador del administrador.
- Cierre de sesión real: al salir se invalida el token en el servidor; si el token vence o se revoca, el panel vuelve al login.
- Multimedia: se retira SVG de los formatos permitidos.
- Documentos internos (`AUDITORIA_TECNICA.md`, `PLAN_IMPLEMENTACION.md`, `CONFIGURACION.md`) movidos a `docs-internos/`, excluida del repositorio mediante `.gitignore`.

### Corregido (backend, `Code.gs` — se despliega aparte)
- Validación de correo que rechazaba todos los correos válidos (contacto, newsletter y comentarios).
- Control de roles: solo administradores gestionan usuarios y configuración general.
- Freno a fuerza bruta en el login (por usuario y global).
- Contraseñas con HMAC-SHA256, sal aleatoria e iteraciones; los hashes antiguos se migran solos en el siguiente inicio de sesión.
- Tokens de sesión aleatorios firmados (ya no `Math.random()`); logout real e invalidación de sesiones al desactivar, borrar o cambiar la clave de un usuario.
- Límite de envíos de formularios con `CacheService` (expira solo; ya no llena `PropertiesService`) y límite global.
- Los borradores ya no se pueden leer por slug; los comentarios públicos ya no exponen correos.
- Neutralización de fórmulas en Google Sheets; validación de firma real de imágenes; sin SVG; máximo 10 archivos por envío.
- Mensajes de error genéricos al cliente (el detalle queda en el registro de Apps Script).
- No se puede eliminar el propio usuario ni dejar el sistema sin administradores activos.

## [10.1.0] — 2026-11-24 — Correcciones UI/UX

### Corregido
- Navegación unificada en todas las páginas públicas (Inicio, Institución, Publicaciones ▾, Galería, Contacto) con estado activo correcto; antes cada página tenía un menú distinto.
- Botón "Publicaciones" con la misma tipografía que el resto de enlaces.
- Footer unificado (4 columnas) y columna de redes ocultada cuando no hay redes configuradas.
- Campos del newsletter colapsados a 20 px en móvil; icono del botón ya no cae a otra línea.
- Migas de pan con separador duplicado ("Inicio / / Noticias").
- Estados de error/vacío ocupan todo el ancho; botón "Volver a intentar" con estilo propio.
- Contenido interno alineado con el ancho de cabecera y pie; formulario de contacto sin límite de 600 px.
- Portada móvil: botones a todo el ancho y sin tarjeta tapando la ilustración.
- Quiénes somos: emojis reemplazados por iconos, viñetas en valores y eliminada la sección "Equipo Directivo" que nunca se rellenaba.
- Foco visible en enlaces y botones; mayor contraste en el footer.

## [10.0.0] — 2026-11-24 — Rediseño institucional estático para GitHub Pages

### Agregado
- Nueva portada institucional con identidad azul/naranja, navegación adaptable, presentación, accesos rápidos, actualidad, galería, recursos, newsletter y footer.
- Sistema visual responsive y accesible en `css/redesign.css`, con estados de carga, error y contenido vacío.
- Tailwind CSS 4 con CSS compilado incluido para publicación estática y scripts npm para reconstrucción.
- Plantilla universal `articulo.html?slug=...` para consultar publicaciones dinámicas desde GitHub Pages.
- Capa centralizada de ruta base en `js/app-config.js`, compatible con repositorios de GitHub Pages y dominios propios.
- Módulo compartido de carga de categorías desde la API real de Apps Script.
- Documentación de dependencias, compilación y futura migración a PHP.

### Mejorado
- Las páginas históricas duplicadas de `articulos - copia/` dejan de formar parte del paquete de demostración; las publicaciones se abren desde `articulo.html?slug=...`.
- Navegación móvil con control de foco, Escape, submenús y cierre al seleccionar enlaces.
- Noticias y galería conectadas a los métodos actuales de `window.sanjuanAPI`.
- Sanitización del contenido HTML mediante DOMPurify, manteniendo un fallback restrictivo.
- SEO dinámico para URLs, canonical y Open Graph según la ruta real del despliegue.
- Fallback local de iconos e imágenes para evitar que un CDN o recurso externo deje la interfaz inutilizable.
- Rutas relativas del sitio público y panel administrativo para soportar `/repositorio/` en GitHub Pages.

### Seguridad y compatibilidad
- Se conserva la URL y los contratos actuales de Google Apps Script; no se reemplaza el backend por JSON ni se modifica el código desplegado.
- El paquete de frontend no distribuye `Code.gs`; el sitio sigue consumiendo el Web App ya desplegado. Mantener el código fuente y los secretos del backend en un entorno privado, separado del repositorio público.
- Las páginas administrativas incluyen `noindex`; las rutas del panel se adaptan a la subruta del repositorio.

### Pendiente externo
- Sustituir `assets/img/placeholder.svg` por fotografías reales autorizadas de la institución.
- Verificar el dominio final y ajustar `sitemap.xml` y `robots.txt` antes de indexación pública.
- Rotar el secreto del backend si la copia anterior de `Code.gs` estuvo en un repositorio público.

## [9.2.0] — 2026-11-07 — Páginas de artículos dinámicas con plantilla única (FASE 9)

### Agregado
- Plantilla única de artículo para todo el sitio: `js/articulo.js` expone `window.sanjuanArticulo = { renderArticulo, cargarArticulo }`.
  - `cargarArticulo(slug)` obtiene el artículo desde la API (`action=single&slug=...`).
  - `renderArticulo(data, slug, prev, next)` renderiza el artículo completo: categoría, título, autor, fecha, imagen destacada, cuerpo/resumen y etiquetas.
  - Navegación anterior/siguiente calculada desde el listado publicado (`getArticulos`).

### Agregado
- Generador de páginas de artículo: `gen_articulos.py` crea los *shells* HTML a partir de la plantilla `articulos/admision-2027.html` para los artículos que no tenían contenido estático.
- Páginas generadas dinámicamente (contenido vía API):
  - `articulos/jornada-siembra-arboles.html`
  - `articulos/guias-fracciones-grado-5.html`
  - `articulos/feria-libro-2026.html`
  - `articulos/concurso-oratoria-municipal.html`
  - `articulos/tips-medio-ambiente-casa.html`
  - `articulos/dia-familia-escolar.html`
  - `articulos/clases-refuerzo-matematicas.html`
  - `articulos/visita-museo-caribe.html`

### Corregido
- Error 404 al abrir artículos desde categorías (ej. "Educativo"): los slugs del CMS (`guias-fracciones_grado_5`, `tips-medio_ambiente_casa`, `clases-refuerzo_matematicas`) no coincidían con los archivos generados. Se generaron los shells con los slugs correctos (formato unificado con guiones).

## [9.1.0] — 2026-11-07 — Correcciones de URLs de artículos, navbar e integración de galería (FASE 9)

### Corregido
- URLs de artículos con error 404: se renombraron los archivos a los slugs del CMS:
  - `articulos/articulo-1.html` → `articulos/feria-ciencias-magdalena.html`
  - `articulos/articulo-2.html` → `articulos/admision-2027.html`
  - Enlace "Anterior" actualizado en consecuencia.
- Navbar: `js/sitio-config.js` ahora muestra el nombre institucional (`.header__logo-texto`) como respaldo cuando no hay logo configurado.

### Agregado
- Galería pública: nuevo endpoint público `multimedia:list` en `Code.gs`, método `getMultimedia` en `js/api.js` y loader `cargarGaleria()` en el home que renderiza las imágenes desde la biblioteca.
- Indicador de carga del sitio (`#sanjuan-loading` con spinner) mientras se obtienen los datos institucionales desde la base de datos.

## [9.0.0] — 2026-11-07 — Seguridad: sanitización de salida, validación de inputs y rate limiting (FASE 9)

### Agregado
- `js/api.js` — Sanitización de HTML con allowlist (`sanitizarHtml`): elimina `script`, `iframe`, `object`, `embed`, `link`, `meta`, `base`, `style`; elimina atributos `on*` y `javascript:` en `href`/`src`. Expuesta como `window.sanjuanAPI.sanitizarHtml`.
- `Code.gs` — Validación de entradas en `guardarContacto`, `guardarNewsletter` y `guardarComentario` (nombre, correo válido, longitud mínima/máxima).
- `Code.gs` — Rate limiting (`verificarRateLimit`) para formularios públicos: máx. 5 intentos / 10 min por identificador.

### Cambiado
- `js/comentarios.js`, `js/busqueda.js`, `js/api.js` y scripts inline de artículos: contenido inyectado vía `innerHTML` ahora pasa por `sanitizarHtml`.

### Verificado
- `Code.gs` parsea correctamente (`new Function`) tras los cambios.
- Sanitización aplicada correctamente: se eliminan `<script>` y atributos `onclick` remotos.

## [8.0.0] — 2026-11-07 — SEO técnico: sitemap actualizado, robots.txt protegido y 404 corregido (FASE 8)

### Agregado
- `sitemap.xml` — URLs públicas faltantes añadidas (`/aviso-legal.html`, `/politica-privacidad.html`) y `lastmod` actualizado.

### Modificado
- `robots.txt` — Añadido `Disallow: /admin/` y referencia a `Sitemap`.

### Corregido
- `404.html` — Añadidos `canonical` y `meta name="description"` que faltaban.

### Verificado
- Las 11 páginas públicas tienen canonical, Open Graph, Twitter Card y meta description.

## [7.0.0] — 2026-11-07 — Frontend público migrado al módulo centralizado `window.sanjuanAPI` (FASE 7)

### Agregado
- `js/api.js` — Módulo centralizado refactorado a IIFE que expone `window.sanjuanAPI`:
  - Endpoints: `getArticulos`, `getArticulo`, `getCategorias`, `getAutores`, `getComentarios`, `enviarContacto`, `suscribirNewsletter`, `enviarComentario`, `cancelarTodo`.
  - Estado de carga centralizado con `setLoading` / `onLoadingChange`.
  - `AbortController` para cancelar solicitudes duplicadas por endpoint.
- Indicadores de carga en frontend público: "Cargando noticias…", "Buscando…", "Cargando comentarios…", gestionados con el estado central de `js/api.js`.

### Cambiado
- `js/formulario.js` — Contacto y newsletter consumen `window.sanjuanAPI.enviarContacto` / `suscribirNewsletter`.
- `js/busqueda.js` — Buscador consume `window.sanjuanAPI.getArticulos` y filtra localmente.
- `js/comentarios.js` — Carga y envío consumen `window.sanjuanAPI.getComentarios` / `enviarComentario`.
- Scripts inline migrados:
  - `index.html` — `cargarArticulos()` consume `window.sanjuanAPI.getArticulos({ page: 1 })`.
  - `categorias/noticias.html`, `categorias/educativo.html`, `categorias/actividades.html` — consumen `window.sanjuanAPI.getArticulos({ categoria, page })`.

### Verificado
- Home, categorías y artículos cargan sus contenidos sin errores de consola.

## [6.0.0] — 2026-11-06 — Configuración e información institucional conectadas al sitio público (FASE 6)

### Agregado
- `js/sitio-config.js`: módulo público que lee `config:get` e `institucional:get` y aplica los datos guardados en el panel a las 11 páginas del sitio.
  - Apariencia: colores primario/secundario (y hover calculado), tipografía de títulos, tamaño base, favicon y logo.
  - Navegación y redes sociales: oculta los enlaces sociales de ejemplo (`href="#"`) cuando no hay URL real y permite ocultar los menús de artículos/contacto.
  - Datos institucionales: nombre, dirección y DANE en el footer; nombre y año en el pie.
  - Portada: badge DANE, mensaje de bienvenida e imagen de portada.
  - SEO: título, descripción, canonical, Open Graph/Twitter y JSON-LD en la página de inicio.
  - "Quiénes Somos": misión, visión, valores y tabla de datos institucionales.
  - "Contacto": dirección, teléfono, correo y horario.
- Caché en `localStorage` de 5 minutos con respaldo silencioso al HTML estático.
- `window.sanjuanSitio.recargar()` para forzar la recarga de la configuración.
- `invalidarTodasLasSesiones()` en `Code.gs`: cierra todas las sesiones activas.
- `limpiarDatosSensiblesConfiguracion()` en `Code.gs`: elimina claves técnicas de las hojas `configuracion` e `institucional`.

### Cambiado
- `Code.gs`: `config:save` e `institucional:save` ahora filtran contra listas blancas (`CAMPOS_CONFIGURACION`, `CAMPOS_INSTITUCIONAL`) y eliminan filas con claves internas (`action`, `type`, `token`) antes de guardar.
- `leerClaveValor()` filtra las claves internas en las respuestas públicas.
- `admin/configuracion.html`: las opciones de tipografía usan nombres de familia simples; los valores antiguos se normalizan al cargar.
- `index.html`, `quienes-somos.html`, `contacto.html`, `404.html`, `aviso-legal.html`, `politica-privacidad.html`, `categorias/*.html` y `articulos/*.html`: referencia a `js/sitio-config.js?v=6.0.0` y scripts versionados con `?v=6.0.0`.
- Todas las páginas públicas usan la ruta absoluta `/assets/img/logo.png` para el logo, incluidas las de subcarpetas.

### Corregido
- `Identifier 'API_BASE' has already been declared`: `js/formulario.js`, `js/busqueda.js`, `js/comentarios.js` y el script inline de `index.html` se encapsularon en IIFEs. Las noticias del inicio vuelven a cargarse.
- Logo roto en páginas de subcarpetas (`categorias/`, `articulos/`): rutas relativas corregidas a absolutas.
- Respaldo textual `.header__logo-texto` cuando no existe logo o la imagen falla.

### Seguridad
- La configuración pública ya no expone claves técnicas (`action`, `type`, `token`). Mientras el Web App desplegado no se actualice, `js/sitio-config.js` las filtra en el cliente.
- Acciones manuales requeridas tras desplegar: ejecutar `invalidarTodasLasSesiones()` y `limpiarDatosSensiblesConfiguracion()` una vez desde el editor de Apps Script.

### Notas
- El `Code.gs` local incluye los cambios de las FASES 5 y 6; el Web App desplegado debe actualizarse para que `multimedia:*` y el filtrado de configuración funcionen en producción.

## [5.0.0] — 2026-11-06 — Biblioteca multimedia con Google Drive (FASE 5)

### Agregado
- Backend de multimedia en `Code.gs`:
  - `multimedia:upload`: sube imágenes a Google Drive desde base64 (máx. 5 MB por archivo)
  - `multimedia:list`: lista la biblioteca con URL pública, miniatura y URL alternativa
  - `multimedia:delete`: envía el archivo a la papelera de Drive y borra su registro
  - `obtenerCarpetaMultimedia()`: crea o reutiliza la carpeta `San Juan Multimedia`
- Endpoints de panel para el dashboard: `contacto:list`, `newsletter:list`, `comentarios:list`, `mensaje:leido`, `comentario:aprobar`
- Permiso público de lectura por archivo (`ANYONE_WITH_LINK` / `VIEW`) para mostrar imágenes en el sitio
- Filtros funcionales por nombre y formato, y orden por fecha/nombre en `admin/multimedia.html`
- Copiado de URL al portapapeles con fallback para contextos no seguros
- Renderizado con escape de HTML en la galería

### Cambiado
- `js/admin/api.js`: `MultimediaAPI.subir()` ahora envía `{ archivos: [...] }` como JSON en base64 (antes usaba `multipart/form-data`, no soportado por Apps Script)
- `admin/multimedia.html`: subida por lotes con conversión base64 y límite total de 25 MB
- `CONFIGURACION.md`: documentación completa de la configuración de Google Drive

### Corregido
- `Identifier 'ADMIN_API_BASE' has already been declared`: `js/admin/auth.js` y `js/admin/api.js` ahora están encapsulados en IIFEs, por lo que cada uno tiene su propio ámbito y no colisionan entre sí ni con otros scripts.
- Formularios públicos de contacto, newsletter y comentarios: ahora se procesan antes del middleware de autenticación, por lo que vuelven a funcionar sin sesión.

## [4.0.0] — 2026-11-06 — Gestión de artículos y páginas con editor visual (FASE 4)

### Agregado
- Editor visual TinyMCE (vía CDN, sin API key) integrado en `admin/articulos.html` y `admin/paginas.html`
- Toolbar: negrita, cursiva, subrayado, alineación, listas, enlaces, imágenes, tablas, eliminar formato
- Sincronización bidireccional entre el editor y el campo `contenido_html`
- Carga de contenido existente al editar (`setContent`) y limpieza al crear nuevo

## [3.0.0] — 2026-11-06 — Panel de administración y autenticación (FASE 3)

### Corregido
- Error CORS: eliminado header `Authorization` y `Content-Type: application/json` del frontend; token viaja en cuerpo de solicitud; `Content-Type: text/plain` para evitar preflight OPTIONS
- Manejo de preflight `OPTIONS` en `doPost` de `Code.gs`
- `Identifier 'ADMIN_API_BASE' has already been declared`: `const` → `let` en `js/admin/api.js`, `js/admin/auth.js`, `js/api.js`
- `Unexpected token 'var'` en `admin/multimedia.html`: `var(--color-primario)` → `'var(--color-primario)'` (y similares) en JavaScript
- Validación defensiva `if (!data)` en todas las funciones CRUD de `Code.gs`
- Rol por defecto `'editor'` en `handleLogin` y `listarUsuarios` cuando el campo está vacío

### Agregado
- Panel de administración completo en `/admin/` con 8 módulos: login, dashboard, artículos, páginas, multimedia, institucional, configuración, usuarios
- Sistema de autenticación con tokens de sesión (expiración 24h)
- Contraseñas hasheadas con SHA-256 (no texto plano)
- Middleware de autorización en backend para todas las operaciones de escritura
- Registro de auditoría de cambios administrativos (pestaña `auditoria`)
- `css/admin.css` — Estilos independientes del panel
- `js/admin/auth.js` — Gestión de sesión y autenticación
- `js/admin/api.js` — Llamadas al backend con AbortController
- `js/api.js` — Módulo centralizado de API para el frontend público

### Modificado
- `Code.gs` — Reescrito con autenticación, endpoints CRUD protegidos, pestañas `usuarios`, `configuracion`, `institucional`, `auditoria`
- `PLAN_IMPLEMENTACION.md` — Actualizado con estado de FASE 3

### Seguridad
- Endpoints de escritura requieren token de sesión verificado en el backend (enviado en el cuerpo de la solicitud)
- Sesiones almacenadas en PropertiesService de Apps Script
- Auditoría de todas las acciones administrativas

## [2.0.0] — 2026-11-06 — Rediseño UX/UI frontend público (FASE 2)

### Agregado
- `css/components.css` — Componentes reutilizables (header, footer, nav, hero, tarjetas, formularios, paginación, galería, breadcrumbs, etiquetas)
- `css/pages.css` — Estilos específicos por página

### Modificado
- `css/variables.css` — Tokens de diseño institucional (paleta, tipografía, espaciado)
- `css/main.css` — Estilos base simplificados
- `css/responsive.css` — Estrategia Mobile First (breakpoints 480/768/1024/1440px)
- 11 archivos HTML rediseñados con header/footer compartidos visualmente, Open Graph, Twitter Cards, Schema.org, breadcrumbs, skip link, favicon
- `js/main.js` — Menú móvil con aria-expanded, submenús expandibles, sticky header optimizado

### Corregido
- Enlace roto en 404.html (`política-privacidad.html` → `politica-privacidad.html`)

## [1.0.0] — 2026-11-06 — Auditoría y planificación (FASE 1)

### Agregado
- `AUDITORIA_TECNICA.md` — Auditoría técnica completa
- `PLAN_IMPLEMENTACION.md` — Plan de implementación por fases

---