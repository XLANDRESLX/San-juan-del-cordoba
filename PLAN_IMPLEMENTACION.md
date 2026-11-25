# PLAN DE IMPLEMENTACIÓN — WEB SANJUAN

**Versión:** 1.2  
**Fecha:** 06 de noviembre de 2026  
**Estado:** FASE 3 completada, lista para FASE 4  
**Referencia:** Ver `AUDITORIA_TECNICA.md` para el diagnóstico completo

---

## 0. PRERREQUISITOS Y CONFIGURACIÓN NECESARIA

Antes de iniciar cualquier desarrollo, el propietario del proyecto debe:

1. **Google Sheet:** Tener una hoja de cálculo de Google Sheets con el ID configurado en `Code.gs` (línea 1).
2. **Google Apps Script:** Desplegar `Code.gs` como Web App (Ejecutar como: Cuenta propia, Acceso: Cualquier persona) y obtener la URL `/exec`.
3. **Usuario administrador inicial:** Crear al menos un usuario en la pestaña `usuarios` del Google Sheet con contraseña hasheada SHA-256 (ver `CONFIGURACION.md`).
4. **Google Drive (opcional pero recomendado):** Carpeta de Drive para almacenar imágenes de la biblioteca multimedia.
5. **Dominio:** `https://web-sanjuan.github.io/` o dominio propio configurado en GitHub Pages.

**Ningún secreto, token o contraseña debe incluirse en el repositorio ni en la documentación pública.**

---

## RESUMEN DE FASES

| Fase | Objetivo | Estado |
|------|----------|--------|
| FASE 1 | Auditoría y planificación | ✅ Completada |
| FASE 2 | Rediseño UX/UI frontend público | ✅ Completada |
| FASE 3 | Panel de administración y autenticación | ✅ Completada |
| FASE 4 | Gestión de artículos y páginas | ✅ Completada |
| FASE 5 | Biblioteca multimedia | ✅ Completada (Google Drive) |
| FASE 6 | Gestión institucional y configuración | ✅ Completada (panel + integración con sitio público) |
| FASE 7 | AJAX y optimización JavaScript | ✅ Completada (frontend público migrado a `window.sanjuanAPI`) |
| FASE 8 | SEO técnico | ✅ Completada (Open Graph y Schema en FASE 2; sitemap y robots actualizados) |
| FASE 9 | Seguridad y pruebas | ✅ Completada (sanitización, validación, rate limit) |
| FASE 10 | Documentación y publicación | Pendiente |

---

## FASE 1 — AUDITORÍA Y PLANIFICACIÓN ✅ COMPLETADA

**Entregables:**
- `AUDITORIA_TECNICA.md` — Análisis completo del proyecto existente
- `PLAN_IMPLEMENTACION.md` — Este documento

**Hallazgos críticos:**
- Duplicación de header/footer en 11 archivos HTML
- API_URL expuesta en JavaScript público
- Endpoint de escritura sin autenticación
- Artículos como HTML estáticos (no gestionables dinámicamente)
- Sin panel de administración
- Sin biblioteca multimedia
- Información institucional hardcodeada

---

## FASE 2 — REDISEÑO UX/UI FRONTEND PÚBLICO ✅ COMPLETADA

**Estado:** ✅ Completada el 06 de noviembre de 2026

### Archivos creados
- `css/components.css` — Componentes reutilizables
- `css/pages.css` — Estilos específicos por página

### Archivos modificados
- `css/variables.css`, `css/main.css`, `css/responsive.css`
- `index.html`, `quienes-somos.html`, `contacto.html`, `aviso-legal.html`, `politica-privacidad.html`, `404.html`
- `categorias/noticias.html`, `categorias/actividades.html`, `categorias/educativo.html`
- `articulos/feria-ciencias-magdalena.html`, `articulos/admision-2027.html`, `articulos/<slug>.html` (shells generados dinámicamente)
- `js/main.js`

### Nuevas funciones implementadas
- Header institucional, hero, últimas noticias desde API, galería, documentos, newsletter
- Breadcrumbs, tarjetas de artículo, paginación, formularios con validación
- Schema.org EducationalOrganization / NewsArticle, Open Graph, Twitter Cards
- Skip link, menú móvil con aria-expanded, sticky header optimizado
- **Enlace roto corregido** en 404.html

---

## FASE 3 — PANEL DE ADMINISTRACIÓN Y AUTENTICACIÓN ✅ COMPLETADA

**Estado:** ✅ Completada el 06 de noviembre de 2026

### Archivos creados
- `css/admin.css` — Estilos del panel (sidebar, dashboard, formularios, tablas, login, responsive)
- `js/admin/auth.js` — Autenticación, sesión (sessionStorage), requireAuth, logout, headers Bearer
- `js/admin/api.js` — Llamadas al backend desde el panel (ArticulosAPI, PaginasAPI, ConfiguracionAPI, InstitucionalAPI, UsuariosAPI, MultimediaAPI, MensajesAPI) con AbortController
- `js/api.js` — Módulo centralizado para el frontend público (getArticulos, getArticulo, getCategorias, getAutores, getComentarios, enviarContacto, suscribirNewsletter, enviarComentario) con loading state, sanitización, AbortController
- `admin/login.html` — Página de inicio de sesión
- `admin/dashboard.html` — Dashboard con tarjetas de resumen y actividad reciente
- `admin/articulos.html` — CRUD de artículos con filtros, paginación, modal crear/editar
- `admin/paginas.html` — CRUD de páginas institucionales
- `admin/multimedia.html` — Biblioteca multimedia con drag & drop, subida, eliminación, vista previa
- `admin/institucional.html` — Gestión de información institucional (nombre, misión, visión, valores, contacto, redes, etc.)
- `admin/configuracion.html` — Configuración de apariencia, navegación, redes sociales, SEO, legal
- `admin/usuarios.html` — Gestión de usuarios (crear, editar, eliminar, roles, estado)

### Archivos modificados
- `Code.gs` — Reescrito completo preservando funciones existentes:
  - Estructura ESTRUCTURA ampliada con pestañas: `usuarios`, `configuracion`, `institucional`, `auditoria`
  - Funciones de seguridad: `hashPassword` (SHA-256), `generarToken`, `guardarSesion`, `validarToken`, `eliminarSesion`, `obtenerTokenDeHeaders`, `verificarAutenticacion`, `registrarAuditoria`
  - Endpoint `login` para autenticación del panel
  - Middleware de autenticación en `doPost` para todas las operaciones de escritura
  - Endpoints CRUD: `articulos:list/get/create/update/delete/estado`, `paginas:list/get/create/update/delete/estado`
  - Endpoints: `config:get/save`, `institucional:get/save`, `usuarios:list/create/update/delete`
  - Formularios públicos (`contacto`, `newsletter`, `comentario`) mantienen acceso sin autenticación
  - Todas las funciones originales preservadas (`getArticulos`, `getArticuloPorSlug`, `getCategorias`, `getAutores`, `getComentarios`, `guardarContacto`, `guardarNewsletter`, `guardarComentario`, `guardarArticulo`)

### Funcionalidades de seguridad implementadas
- Autenticación obligatoria para todas las operaciones de escritura del panel
- Tokens de sesión almacenados en PropertiesService (expiración 24h)
- Contraseñas hasheadas con SHA-256 (no texto plano)
- Token de sesión enviado en el cuerpo de la solicitud (sin header `Authorization`, para evitar preflight CORS)
- Auditoría de cambios administrativos en pestaña `auditoria`
- Middleware `requireAuth()` en frontend para proteger rutas del panel

---

## FASE 4 — GESTIÓN DE ARTÍCULOS Y PÁGINAS ✅ COMPLETADA

**Estado:** ✅ Completada el 06 de noviembre de 2026

### Archivos modificados
- `admin/articulos.html` — Editor visual TinyMCE integrado para el campo de contenido, sincronización automática con el textarea, inicialización y limpieza del editor al abrir/cerrar modal
- `admin/paginas.html` — Editor visual TinyMCE integrado para el campo de contenido, sincronización automática con el textarea, inicialización y limpieza del editor al abrir/cerrar modal

### Funcionalidades implementadas
- Editor visual TinyMCE (vía CDN, sin API key requerida) con toolbar: negrita, cursiva, subrayado, alineación, listas, enlaces, imágenes, tablas, eliminar formato
- Sincronización bidireccional entre el editor TinyMCE y el textarea oculto (`contenido_html`)
- Al abrir modal de edición: `tinymce.get().setContent()` carga el contenido existente
- Al crear nuevo: `tinymce.get().setContent('')` limpia el editor
- Al guardar: `tinymce.get().getContent()` obtiene el HTML formateado para enviarlo al backend
- Backend: todos los endpoints CRUD ya estaban implementados en `Code.gs` (FASE 3)

### Editor TinyMCE configurado
- Altura: 400px
- Sin menubar (interfaz más limpia)
- Plugin: lists, link, image, table
- Barra de herramientas: deshacer/rehacer, negrita/cursiva/subrayado, alineación, listas, sangría, enlace, imagen, tabla, eliminar formato
- Sin branding de TinyMCE
- Estilos de contenido personalizados (Open Sans, color institucional)

**No se requirió API key** — se usa el modo "no-api-key" de TinyMCE Cloud que es gratuito para uso básico.

---

## FASE 5 — BIBLIOTECA MULTIMEDIA ✅ COMPLETADA

**Estado:** ✅ Completada el 06 de noviembre de 2026

### Backend (`Code.gs`)
- `multimedia:upload` — Recibe archivos en base64 dentro del JSON, valida formato (JPG, PNG, WebP, SVG, GIF) y tamaño (5 MB por archivo), crea el archivo en Google Drive, aplica permiso público de lectura y registra la fila en la hoja `multimedia`.
- `multimedia:list` — Devuelve la biblioteca ordenada por fecha, con URL pública, miniatura y URL alternativa.
- `multimedia:delete` — Envía el archivo a la papelera de Drive y elimina su registro.
- `obtenerCarpetaMultimedia()` — Crea o reutiliza la carpeta `San Juan Multimedia` en Drive; permite configurar otra carpeta con `drive_folder_id` en `configuracion` o `MULTIMEDIA_FOLDER_ID` en propiedades del script.
- Endpoints adicionales para el dashboard: `contacto:list`, `newsletter:list`, `comentarios:list`, `mensaje:leido`, `comentario:aprobar`.

### Frontend
- `admin/multimedia.html` — Conversión de archivos a base64, subida por lotes, filtros funcionales por nombre y formato, orden por fecha/nombre, copiado de URL, eliminación con confirmación y renderizado seguro (escape HTML).
- `js/admin/api.js` — `MultimediaAPI.subir()` envía `{ archivos: [{ nombre, mimeType, base64 }] }` por POST sin preflight CORS.

### Notas
- La subida usa base64 en el cuerpo JSON porque Google Apps Script no procesa `multipart/form-data` de forma nativa.
- Las imágenes se comparten como "cualquier persona con el enlace" para poder mostrarse en el sitio público.
- Si la política de Google Workspace bloquea el uso compartido público, la subida funciona pero las imágenes no serán visibles externamente.

---

## FASE 6 — GESTIÓN INSTITUCIONAL Y CONFIGURACIÓN ✅ COMPLETADA

**Estado:** ✅ Completada el 06 de noviembre de 2026

### Backend (`Code.gs`)
- Endpoints `config:get`, `config:save`, `institucional:get`, `institucional:save` (los GET son públicos de solo lectura; los save requieren token).
- Listas blancas `CAMPOS_CONFIGURACION` y `CAMPOS_INSTITUCIONAL`: solo se guardan las claves editables del panel.
- `filtrarCamposPermitidos()` y `guardarClaveValor()` centralizan el guardado tipo clave/valor.
- `eliminarClavesInternas()` y `CLAVES_INTERNAS`: descartan y eliminan filas técnicas (`action`, `type`, `token`) que pudieran haberse almacenado en `configuracion`/`institucional`.
- Funciones manuales de mantenimiento: `invalidarTodasLasSesiones()` y `limpiarDatosSensiblesConfiguracion()`.

### Panel de administración
- `admin/configuracion.html` — Apariencia (colores, tipografía, tamaño de texto, favicon, portada), navegación, redes sociales, SEO y datos de contacto. Normaliza valores antiguos de tipografía.
- `admin/institucional.html` — Nombre, descripción, misión, visión, valores, dirección, teléfono, correo, horarios, DANE, niveles, redes, mensaje de bienvenida, portada, logo y escudo.

### Integración con el sitio público
- `js/sitio-config.js` — Módulo público que lee `config:get` e `institucional:get` y aplica los datos a las 11 páginas sin duplicar lógica.
- Aplica: colores primario/secundario y sus hover, tipografía de títulos, tamaño base, favicon, logo (con respaldo textual), enlaces sociales, visibilidad de menús, datos institucionales del footer, año y nombre en el pie, mensaje/portada/DANE del hero, título y metadatos SEO, imagen Open Graph, canonical, JSON-LD, misión/visión/valores y tabla de datos de "Quiénes Somos", y dirección/teléfono/correo/horario de "Contacto".
- Caché en `localStorage` de 5 minutos y respaldo silencioso al HTML estático si la API falla. Refresco manual con `window.sanjuanSitio.recargar()`.
- Se filtran del lado del cliente las claves internas (`action`, `type`, `token`) mientras el backend desplegado no esté actualizado.
- Los formularios sociales de ejemplo (`href="#"`) se ocultan cuando no hay URL real configurada.

### Correcciones asociadas
- `js/formulario.js`, `js/busqueda.js`, `js/comentarios.js` y el script inline de `index.html` se envolvieron en IIFE para evitar la colisión global de `API_BASE` que impedía cargar las noticias del inicio.
- Logos con ruta absoluta (`/assets/img/logo.png`) en todas las páginas públicas, incluidas las de subcarpetas.
- `.header__logo-texto` en `css/components.css` como respaldo cuando no hay logo o la imagen falla.
- Referencias de scripts del sitio público versionadas con `?v=6.0.0`.

### Notas de despliegue
- El `Code.gs` local es más reciente que el Web App desplegado: hay que redesplegar para que `multimedia:*` y el filtrado de configuración funcionen en producción.
- Ejecutar una vez desde el editor de Apps Script: `invalidarTodasLasSesiones()` y `limpiarDatosSensiblesConfiguracion()`.

---

## FASE 7 — AJAX Y OPTIMIZACIÓN DE JAVASCRIPT ✅ COMPLETADA

**Estado:** ✅ Completada el 07 de noviembre de 2026

### Módulo central
- `js/api.js` — Refactorizado a IIFE que expone `window.sanjuanAPI` con:
  - Endpoints públicos: `getArticulos`, `getArticulo`, `getCategorias`, `getAutores`, `getComentarios`, `enviarContacto`, `suscribirNewsletter`, `enviarComentario`, `cancelarTodo`.
  - Estado de carga centralizado (`setLoading`, `onLoadingChange`).

### Migración completada
- `js/formulario.js` — Contacto y newsletter ahora usan `window.sanjuanAPI.enviarContacto` / `suscribirNewsletter`.
- `js/busqueda.js` — Buscador usa `window.sanjuanAPI.getArticulos` y filtra localmente.
- `js/comentarios.js` — Carga y envío de comentarios usan `window.sanjuanAPI.getComentarios` / `enviarComentario`.
- Scripts inline migrados:
  - `index.html` — `cargarArticulos()` usa `window.sanjuanAPI.getArticulos({ page: 1 })`.
  - `categorias/noticias.html`, `categorias/educativo.html`, `categorias/actividades.html` — usan `window.sanjuanAPI.getArticulos({ categoria, page })`.

### Indicadores de carga
- `js/api.js` — `apiRequest` gestiona estado de carga centralizado (`setLoading`) y cancelación con `AbortController`.
- Loaders públicos muestran indicadores: "Cargando noticias…", "Buscando…", "Cargando comentarios…".

### Verificación
- `window.sanjuanAPI` expone los 9 endpoints + helpers sin colisiones globales.
- Home, categorías y artículos cargan sus contenidos sin errores de consola.

---

## FASE 8 — SEO TÉCNICO ✅ COMPLETADA

**Estado:** ✅ Completada el 07 de noviembre de 2026

### Implementado
- `sitemap.xml` — Actualizado con las URLs públicas faltantes (`/aviso-legal.html`, `/politica-privacidad.html`) y fechas de última modificación (`lastmod`) actualizadas.
- URLs de artículos incluidas (`/articulos/feria-ciencias-magdalena.html`, `/articulos/admision-2027.html`) con `changefreq` y `priority`.
- `robots.txt` — Añadido `Disallow: /admin/` y referencia a `Sitemap: https://web-sanjuan.github.io/sitemap.xml`.
- `404.html` — Añadidos `canonical` y `meta name="description"` que faltaban.

### Verificado
- Las 11 páginas públicas tienen: `<title>`, `meta description`, `canonical`, Open Graph completo, Twitter Card y JSON-LD.

### Pendiente
- Generación dinámica del `sitemap.xml` a partir de artículos publicados (requiere endpoint/backend o script de generación).

---

## FASE 9 — SEGURIDAD Y PRUEBAS ✅ COMPLETADA

**Estado:** ✅ Completada el 07 de noviembre de 2026

### Implementado
- Sanitización de HTML de salida en frontend público vía `window.sanjuanAPI.sanitizarHtml()` (allowlist: elimina `script`, `iframe`, `object`, `embed`, `link`, `meta`, `base`, `style`; elimina atributos `on*` y `javascript:` en `href`/`src`).
- Aplicada en: comentarios (`js/comentarios.js`), resultados de búsqueda (`js/busqueda.js`) y tarjetas de artículos (`index.html`, `categorias/*.html`).
- Validación de entradas en backend para formularios públicos (`guardarContacto`, `guardarNewsletter`, `guardarComentario`): nombre, correo válido, longitud mínima/máxima.
- Rate limiting en backend para formularios públicos vía `verificarRateLimit()` (máx. 5 intentos / 10 min por identificador).

### Pendiente
- Pruebas multi-navegador, Core Web Vitals, ajustes de rate limiting en producción.

---

## FASE 10 — DOCUMENTACIÓN Y PUBLICACIÓN (PENDIENTE)

**Pendiente:** `README.md` actualizado, `CONFIGURACION.md`, `CHANGELOG.md`, despliegue final.

---

## ESTIMACIÓN DE TIEMPO RESTANTE

| Fase | Tiempo estimado | Dependencias |
|------|----------------|--------------|
| FASE 4 | Ya funcional (UI + backend) | FASE 3 |
| FASE 5 | 1 semana | FASE 3 |
| FASE 6 | Completada | FASE 3 |
| FASE 7 | Ya funcional (frontend público migrado) | FASE 2, FASE 4 |
| FASE 8 | Completada | FASE 2 |
| FASE 9 | Completada (seguridad: sanitización, validación, rate limit) | Todas las fases anteriores |
| FASE 10 | 2-3 días | Todas las fases anteriores |

**Tiempo total estimado restante:** 2-3 semanas

---

## CRITERIOS DE APROBACIÓN POR FASE

1. No hay errores JavaScript en consola
2. Las páginas cargan correctamente
3. Las rutas funcionan
4. Los formularios funcionan
5. La API responde correctamente
6. No se eliminaron funciones existentes
7. Responsive verificado
8. Permisos administrativos funcionan
9. Carga de imágenes funciona
10. SEO verificado
11. Rendimiento verificado

---

**Estado actual:** FASE 3 completada. El panel de administración está operativo en `/admin/`. Se requiere crear el primer usuario administrador en el Google Sheet (ver `CONFIGURACION.md`) antes de usar el panel.