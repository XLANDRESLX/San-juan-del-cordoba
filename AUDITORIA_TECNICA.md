# AUDITORÍA TÉCNICA — WEB SANJUAN

**Fecha:** 06 de noviembre de 2026  
**Proyecto:** web-Sanjuan (Institución Educativa San Juan del Córdoba – Ciénaga, Magdalena)  
**Estado:** Proyecto existente en funcionamiento parcial  
**Stack actual:** HTML5, CSS3, JavaScript Vanilla, Bootstrap (referenciado pero no usado), Google Apps Script, Google Sheets, GitHub Pages

---

## 1. INVENTARIO DE ARCHIVOS EXISTENTES

### Raíz
| Archivo | Descripción |
|---------|-------------|
| `index.html` | Página principal con hero, últimas noticias (carga por JS desde API), newsletter y footer |
| `quienes-somos.html` | Misión, visión, valores, equipo directivo, datos institucionales |
| `contacto.html` | Datos de la institución + formulario de contacto |
| `aviso-legal.html` | Aviso legal institucional |
| `politica-privacidad.html` | Política de privacidad (Ley 1581 de 2012 Colombia) |
| `404.html` | Página de error 404 |
| `Code.gs` | Backend Google Apps Script (endpoints doGet/doPost) |
| `README.md` | Documentación básica del proyecto |
| `robots.txt` | Directivas para crawlers |
| `sitemap.xml` | Sitemap estático con URLs fijas |

### CSS (`css/`)
| Archivo | Descripción |
|---------|-------------|
| `variables.css` | Variables CSS (colores, tipografías, medidas) + reset básico |
| `main.css` | Estilos base: header, footer, botones, utilidades |
| `responsive.css` | Media queries para tablet (768px) y desktop (1024px) |

### JavaScript (`js/`)
| Archivo | Descripción |
|---------|-------------|
| `main.js` | Menú móvil toggle, sticky header, año automático en footer |
| `formulario.js` | Formularios de contacto y newsletter (POST a Apps Script) |
| `busqueda.js` | Buscador interno con debounce y filtro por categoría |
| `comentarios.js` | Carga y envío de comentarios por artículo |

### Páginas de artículos (`articulos/`)
| Archivo | Descripción |
|---------|-------------|
| `feria-ciencias-magdalena.html` | Artículo: Feria de Ciencias Magdalena |
| `admision-2027.html` | Artículo: Proceso de admisión 2027 |
| `<slug>.html` | Shells generados dinámicamente (vía `gen_articulos.py`) para los artículos restantes; el contenido se carga con la plantilla única `js/articulo.js`. |

### Páginas de categorías (`categorias/`)
| Archivo | Descripción |
|---------|-------------|
| `noticias.html` | Listado de artículos filtrado por categoría "noticias" |
| `actividades.html` | Listado de artículos filtrado por categoría "actividades" |
| `educativo.html` | Listado de artículos filtrado por categoría "educativo" |

### Datos (`data/`)
| Archivo | Descripción |
|---------|-------------|
| `articulos.json` | Snapshot estático de 2 artículos de ejemplo |

---

## 2. FUNCIONALIDADES EXISTENTES

### 2.1 Frontend público
- **Navegación:** Header con logo, menú horizontal (desktop) y menú hamburguesa (móvil), dropdown de categorías de artículos.
- **Página de inicio:** Hero institucional, listado de últimas noticias cargado dinámicamente desde Google Apps Script, formulario de newsletter.
- **Artículos:** Páginas HTML estáticas con título, imagen de portada, autor, fecha, cuerpo, etiquetas, navegación anterior/siguiente y sección de comentarios.
- **Categorías:** Páginas que cargan artículos filtrados por categoría desde la API con paginación básica.
- **Formularios:** Contacto y newsletter envían datos a Google Apps Script vía `fetch` POST.
- **Comentarios:** Formulario de comentarios por artículo, cargados desde la API, filtrados por estado aprobado.
- **Buscador:** Búsqueda interna con debounce (300ms) sobre título, resumen y etiquetas.
- **SEO básico:** Meta títulos, meta descriptions, canonical, Open Graph (solo en artículos estáticos), JSON-LD (Article en artículos, EducationalOrganization en index), sitemap.xml, robots.txt.
- **Accesibilidad básica:** `aria-label` en botones de menú, `aria-live` en mensajes, `loading="lazy"` en imágenes.

### 2.2 Backend (Google Apps Script — `Code.gs`)
- **Inicialización automática:** Crea las pestañas de Google Sheets si no existen (`articulos`, `autores`, `comentarios`, `newsletter`, `contacto`, `categorias`).
- **doGet:** Endpoints GET para `list`, `single`, `categorias`, `autores`, `comentarios`.
- **doPost:** Endpoints POST para `contacto`, `newsletter`, `comentario`, `articulo`.
- **Respuesta JSON:** Función `jsonResponse` estandarizada.
- **Paginación:** `getArticulos` soporta paginación (10 por página) y filtros por categoría y etiqueta.
- **Estructura de datos:** Definida en constante `ESTRUCTURA` con columnas por pestaña.

### 2.3 Base de datos (Google Sheets)
Espera 6 pestañas con columnas predefinidas:
- `articulos`: id, titulo, slug, categoria, etiquetas, autor, fecha_publicacion, imagen_url, resumen, contenido_html, estado
- `autores`: id, nombre, cargo, bio, foto_url, email
- `comentarios`: id, articulo_id, nombre, email, comentario, fecha, aprobado
- `newsletter`: id, email, nombre, fecha_suscripcion, activo
- `contacto`: id, nombre, email, telefono, mensaje, fecha, leido
- `categorias`: id, nombre, slug, descripcion

---

## 3. PROBLEMAS ENCONTRADOS

### 3.1 Duplicación de código (CRÍTICO)
- **Header y footer idénticos** en todas las 11 páginas HTML. Cualquier cambio requiere editar 11 archivos.
- **Scripts inline duplicados** en `categorias/*.html` (lógica de carga de artículos y paginación repetida 3 veces).
- **API_BASE hardcodeado** en 5 archivos diferentes (`index.html`, `js/formulario.js`, `js/busqueda.js`, `js/comentarios.js`, y los 3 archivos de categorías).
- **Estilos inline excesivos** en prácticamente todos los elementos HTML.

### 3.2 Seguridad (CRÍTICO)
- **API Key expuesta:** La URL completa de Google Apps Script (`https://script.google.com/macros/s/AKfycbwQ7soneWAlDCtXBEcaRpjOOm7HyD3OrqOaFVpRicdNhygpNWiIkFeRr0ubgayVfWEwHg/exec`) está expuesta en JavaScript público y HTML.
- **Sin autenticación:** El endpoint `doPost` acepta cualquier tipo de operación (`articulo`, `comentario`, `contacto`, `newsletter`) sin validar quien lo llama. Cualquiera puede crear, editar o eliminar artículos.
- **Sin CSRF:** No hay protección contra Cross-Site Request Forgery en endpoints de escritura.
- **Sin validación de entrada:** `doPost` hace `JSON.parse` sin validar tipos, tamaños ni contenido malicioso.
- **XSS en comentarios y artículos:** El contenido HTML se guarda y se muestra sin sanitizar (`innerHTML` en comentarios.js y en artículos cargados desde API).
- **Contraseñas en texto plano:** No existe sistema de autenticación, pero el panel futuro debe evitar esto.
- **Google Sheet ID expuesto:** el identificador real se omite de esta copia distribuible; revisa el proyecto privado de Apps Script y trata ese dato como sensible.
- **Claves técnicas en config/institucional:** Antes del fix, los GET públicos devolvían `action`, `type` y `token` de la hoja `configuracion`. *(Resuelto en FASE 6: filtro `CLAVES_INTERNAS`, listas blancas en escritura y limpieza manual pendiente de ejecutar en el Web App desplegado.)*

### 3.3 Mantenibilidad (ALTO)
- **Artículos con plantilla única:** Los artículos se sirven desde shells que cargan su contenido dinámicamente vía `js/articulo.js` (`window.sanjuanArticulo.cargarArticulo` / `renderArticulo`) desde la API. El contenido proviene de la hoja `articulos` de Google Sheets. *(Resuelto en FASE 9: plantilla única + generador de shells.)*
- **Sin panel de administración:** No existe ruta `/admin/` ni sistema de login.
- **Sin biblioteca multimedia:** No hay gestión de subida de imágenes; las imágenes se asumen como archivos estáticos en `assets/img/`. *(Resuelto en FASE 5: biblioteca con Google Drive.)*
- **Información institucional duplicada:** Nombre, dirección, código DANE, teléfono aparecen hardcodeados en el footer de cada página.
- **CSS no modular:** Todo en 3 archivos sin separación por componentes.

### 3.4 SEO (MEDIO)
- **Sitemap estático:** Solo incluye 7 URLs fijas. No incluye artículos dinámicos creados vía API.
- **Canonical hardcodeado:** Cada página tiene su canonical fijo; no es dinámico.
- **Open Graph incompleto:** Solo en los 2 artículos estáticos; falta en el resto de páginas.
- **Twitter Cards ausentes.**
- **BreadcrumbList ausente.**
- **H1 único por página:** OK, pero no hay control centralizado.
- **Placeholder GA4:** `G-XXXXXXXXXX` sin configurar.

### 3.5 Rendimiento (MEDIO)
- **CSS bloqueante:** 3 archivos CSS cargados en cada página sin minificar.
- **JavaScript bloqueante:** 3-4 archivos JS por página sin defer/async (excepto gtag).
- **Imágenes sin optimización:** Referencias a `assets/img/` sin evidenciar compresión ni WebP.
- **Sin lazy loading consistente:** Solo en algunas imágenes de artículos.
- **Sin srcset:** Imágenes sin variantes de resolución.
- **Carga completa de artículos:** `getArticulos` trae TODA la hoja de cálculo en memoria antes de filtrar y paginar (problema de escalabilidad en Google Sheets).

### 3.6 Accesibilidad (MEDIO)
- **Contraste:** Colores básicos, necesita verificación WCAG AA.
- **Navegación por teclado:** No verificada.
- **Focus visible:** No definido en CSS.
- **Landmarks:** Falta `<main>`, `<nav>`, `<header>`, `<footer>` con roles ARIA en algunas secciones.

### 3.7 Errores y inconsistencias
- **Enlace roto en 404.html:** Línea 81, `<a href="/política-privacidad.html">` tiene acento en el nombre del archivo, pero el archivo real es `politica-privacidad.html` (sin acento).
- **Placeholder de imágenes:** Se referencia `/assets/img/placeholder.jpg` pero no se verifica que exista.
- **Artículos estáticos vs dinámicos:** Los artículos con contenido real en Sheets usan su slug como nombre de archivo (`/articulos/{slug}.html`). Los artículos generados dinámicamente (shells) se crean con los slugs del CMS y cargan el contenido vía API. No hay diferencias de ruta entre estáticos y dinámicos. *(Resuelto en FASE 9: renombrado de `articulo-1/2.html` y generación de shells con slugs correctos.)*
- **Sin fallback si la API falla:** `cargarArticulos()` en index muestra "No hay artículos publicados" si la API falla, sin distinguir error de red.
- **Comentarios sin moderación visible:** El campo `aprobado` existe pero no hay interfaz para moderar.

---

## 4. RIESGOS DE SEGURIDAD

| Riesgo | Severidad | Descripción |
|--------|-----------|-------------|
| Endpoints de escritura sin autenticación | CRÍTICO | `doPost` acepta `type: articulo` sin verificar identidad. Cualquiera puede insertar artículos en la hoja. |
| URL de Apps Script expuesta | CRÍTICO | La URL de implementación está en JS público; cualquiera puede hacer peticiones a los endpoints. |
| XSS reflejado y almacenado | ALTO | Contenido de comentarios y artículos se inserta con `innerHTML` sin sanitizar. |
| CSRF | ALTO | No hay tokens CSRF en formularios POST. |
| Validación de entrada ausente | MEDIO | `JSON.parse` sin validar esquemas; posible inyección de datos malformed. |
| Datos personales en Google Sheets | MEDIO | Formularios de contacto y newsletter almacenan PII sin cifrado ni control de acceso granular. |
| Sheet ID expuesto | BAJO | El ID de la hoja de cálculo está visible en `Code.gs`. |

---

## 5. OPORTUNIDADES DE MEJORA

1. **Extraer header/footer a componentes reutilizables** (o incluir vía JS) para eliminar duplicación.
2. **Crear `js/api.js` centralizado** con `API_BASE` y funciones genéricas de fetch.
3. **Implementar panel `/admin/`** con login y CRUD de artículos, páginas, multimedia y configuración.
4. **Sanitizar HTML** antes de mostrar públicamente (DOMPurify o similar ligero).
5. **Agregar autenticación** en el backend (al menos verificación de token simple para operaciones de escritura).
6. **Generar sitemap.xml dinámicamente** o al menos mantenerlo sincronizado con artículos publicados.
7. **Agregar Open Graph y Twitter Cards** a todas las páginas.
8. **Optimizar imágenes** (WebP, lazy loading, srcset).
9. **Minificar CSS y JS** para producción.
10. **Migrar artículos estáticos a sistema dinámico** basado en la API.

---

## 6. ARQUITECTURA RECOMENDADA

### 6.1 Capas
- **Frontend público:** HTML semántico + CSS modular + JS Vanilla modular. Consume API de Apps Script para datos dinámicos.
- **Panel de administración:** `/admin/` con páginas HTML independientes, autenticación basada en sesión/token, CRUD completo.
- **Backend:** Google Apps Script (`Code.gs`) actuando como API REST ligera sobre Google Sheets.
- **Almacenamiento de archivos:** Google Drive para imágenes multimedia (URLs estables).

### 6.2 Flujo de datos
1. Admin crea artículo en `/admin/articulos.html` → POST a Apps Script → guarda en Google Sheets `articulos`.
2. Visitante ve `index.html` → JS llama `GET ?action=list` → renderiza artículos desde Sheets.
3. Visitante lee artículo → `GET ?action=single&slug=...` → renderiza contenido.

### 6.3 Seguridad recomendada
- Agregar verificación de `Authorization` header o token secreto en `doPost` para operaciones sensibles.
- Sanitizar entrada y salida HTML.
- Implementar rate limiting básico por IP (posible en Apps Script con PropertiesService o CacheService).
- Nunca exponer credenciales en el frontend.

---

## 7. LISTA DE ARCHIVOS QUE DEBERÁN MODIFICARSE

### FASE 2 - Rediseño frontend
- `css/variables.css` — ampliar paleta institucional, tipografía, variables de componentes
- `css/main.css` — reescribir estilos base, componentes reutilizables
- `css/responsive.css` — ampliar breakpoints, mobile-first completo
- `index.html` — rediseño hero, secciones administrables, load dinámico de configuración
- `quienes-somos.html` — rediseño, carga dinámica de datos institucionales
- `contacto.html` — rediseño, formulario mejorado
- `aviso-legal.html` — rediseño visual
- `politica-privacidad.html` — rediseño visual
- `404.html` — rediseño visual
- `js/main.js` — menú móvil mejorado, carga de header/footer dinámicos
- `js/api.js` — NUEVO: módulo centralizado de llamadas a API

### FASE 3 - Panel de administración
- `admin/login.html` — NUEVO
- `admin/dashboard.html` — NUEVO
- `admin/articulos.html` — NUEVO
- `admin/paginas.html` — NUEVO
- `admin/multimedia.html` — NUEVO
- `admin/institucional.html` — NUEVO
- `admin/configuracion.html` — NUEVO
- `admin/usuarios.html` — NUEVO
- `js/admin/` — NUEVO: módulos JS del panel

### FASE 4 - Gestión de artículos y páginas
- `js/api.js` — agregar endpoints CRUD de artículos y páginas
- `Code.gs` — agregar endpoints de actualización y eliminación, autenticación básica

### FASE 5 - Biblioteca multimedia ✅ COMPLETADA
- `Code.gs` — endpoints `multimedia:upload`, `multimedia:list` y `multimedia:delete` con Google Drive
- `admin/multimedia.html` — interfaz de subida por lotes, filtros, copiado de URL y eliminación
- Las imágenes se almacenan en la carpeta `San Juan Multimedia` y se comparten como lectura pública

### FASE 6 - Gestión institucional y configuración ✅ COMPLETADA
- `Code.gs` — endpoints públicos de solo lectura `config:get` e `institucional:get` y de escritura protegida `config:save` / `institucional:save`
- `Code.gs` — listas blancas (`CAMPOS_CONFIGURACION`, `CAMPOS_INSTITUCIONAL`) y `filtrarCamposPermitidos()` para evitar escrituras no autorizadas en las hojas clave/valor
- `Code.gs` — `eliminarClavesInternas()` descarta y elimina filas con claves técnicas (`action`, `type`, `token`); `limpiarDatosSensiblesConfiguracion()` como acción manual de limpieza
- `Code.gs` — funciones manuales de mantenimiento `invalidarTodasLasSesiones()` y `limpiarDatosSensiblesConfiguracion()`
- `admin/institucional.html` y `admin/configuracion.html` — interfaces para datos institucionales y configuración del sitio
- `js/sitio-config.js` — módulo público (IIFE) que aplica configuración e información institucional: apariencia, redes, menús, footer, portada, SEO, "Quiénes Somos" y "Contacto"
- Cache de 5 minutos en `localStorage` con respaldo silencioso; refresco manual vía `window.sanjuanSitio.recargar()`
- Fix de tipografía: opciones de familia simple (`Merriweather`, `Open Sans`, `Playfair Display`, `Lato`) y normalización de valores con comillas

### Token expuesto en datos institucionales/configuración — RESUELTO
- Se detectó que el backend devuelto antes de la corrección incluía las claves técnicas `action`, `type` y `token` en la respuesta pública de `config:get` (filtrado interno de la hoja `configuracion`).
- El despliegue se actualizó con:
  - Filtro en `leerClaveValor()` (`CLAVES_INTERNAS`).
  - Filtro en escritura con listas blancas (`CAMPOS_CONFIGURACION`, `CAMPOS_INSTITUCIONAL`).
  - `eliminarClavesInternas()` y `limpiarDatosSensiblesConfiguracion()` para limpieza de datos ya persistidos.
- El cliente (`js/sitio-config.js`) también filtra estas claves mientras se ejecuta el Web App actualizado.

### FASE 7 - AJAX y optimización JS ✅ COMPLETADA
- `js/api.js` — refactorizado a IIFE con `window.sanjuanAPI` (endpoints públicos, estado de carga, AbortController)
- `js/formulario.js` — migrado a `window.sanjuanAPI.enviarContacto` / `suscribirNewsletter`
- `js/busqueda.js` — migrado a `window.sanjuanAPI.getArticulos`
- `js/comentarios.js` — migrado a `window.sanjuanAPI.getComentarios` / `enviarComentario`
- Scripts inline migrados en `index.html`, `categorias/noticias.html`, `categorias/educativo.html`, `categorias/actividades.html`
- Indicadores de carga en loaders públicos (estado central de `js/api.js`)

### FASE 8 - SEO técnico ✅ COMPLETADA
- `sitemap.xml` — Actualizado con URLs públicas faltantes (`aviso-legal`, `politica-privacidad`) y `lastmod` actualizado
- `robots.txt` — Añadido `Disallow: /admin/` y referencia a sitemap
- `404.html` — Añadidos `canonical` y meta description
- Verificación: las 11 páginas públicas tienen title, description, canonical, OG, Twitter Card y JSON-LD

### FASE 9 - Seguridad y pruebas ✅ COMPLETADA
- `Code.gs` — Middleware de verificación de token en `doPost` ✅ (FASE 3)
- `Code.gs` — Sanitización/validación de inputs y rate limiting para formularios públicos ✅ (FASE 9)
- `js/api.js` — Sanitización de HTML con allowlist (`sanitizarHtml`) y uso en renderizados ✅ (FASE 9)
- Pendiente: Pruebas multi-navegador, Core Web Vitals.

### FASE 10 - Documentación y publicación
- `README.md` — actualizar con nueva estructura
- `PLAN_IMPLEMENTACION.md` — NUEVO
- `CONFIGURACION.md` — NUEVO
- `CHANGELOG.md` — NUEVO

---

## 8. CONCLUSIONES

El proyecto actual es una base funcional y sólida para un sitio institucional pequeño-mediano. Los principales problemas son:

1. **Duplicación masiva de HTML** (header/footer/scripts en cada página).
2. **Ausencia total de panel de administración** y autenticación.
3. **Endpoint de escritura sin protección** (riesgo crítico de seguridad).
4. **Artículos como HTML estáticos** que no se pueden gestionar dinámicamente.
5. **Información institucional hardcodeada** en múltiples archivos.

La arquitectura actual (Google Apps Script + Google Sheets + HTML estático en GitHub Pages) es apropiada para el alcance del proyecto y debe preservarse, evolucionando hacia un CMS ligero con panel de administración protegido.

**No se recomienda migrar a React/Angular/Vue.** La pila actual cumple los requisitos y es mantenible con mejoras progresivas.

---

*Fin de la auditoría técnica. Siguiente paso: entrega de `PLAN_IMPLEMENTACION.md` y espera de aprobación para iniciar la FASE 2.*