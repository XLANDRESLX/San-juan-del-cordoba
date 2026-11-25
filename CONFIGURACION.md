# CONFIGURACIÓN — WEB SANJUAN

**Fecha:** 24 de noviembre de 2026  
**Versión:** 10.0.0

Este documento describe la conexión del frontend estático con el Web App existente de Google Apps Script y la configuración del panel. Esta demo ya conserva el endpoint; no requiere volver a crear el backend.

---

## 1. GOOGLE SHEETS Y PROYECTO DE APPS SCRIPT

La demostración utiliza la hoja de cálculo y el Web App que ya existen. No es necesario crear otra hoja ni cambiar su identificador.

Si necesitas mantener una instalación nueva o modificar la existente:

1. Abre el proyecto privado de Google Apps Script asociado al Web App.
2. Verifica dentro de `Code.gs` que la constante `SHEET_ID` apunta a la hoja correcta.
3. Comprueba que estén las pestañas que utiliza el backend: `articulos`, `autores`, `comentarios`, `newsletter`, `contacto`, `categorias`, `usuarios`, `configuracion`, `institucional` y `auditoria`.
4. Mantén el código fuente, el ID de la hoja y los secretos fuera del repositorio y del ZIP público de GitHub Pages.

El archivo `Code.gs` no se incluye en este paquete de frontend porque contiene configuración sensible. La página pública consume la implementación Web App existente.

---

## 2. DESPLIEGUE DE GOOGLE APPS SCRIPT

1. En Apps Script, haz clic en **Implementar → Nueva implementación**.
2. Selecciona tipo **App Web**.
3. Configura:
   - **Ejecutar como:** Yo (tu cuenta de Google)
   - **¿Quién tiene acceso:** Cualquier persona
4. Haz clic en **Implementar**.
5. Copia la URL del endpoint (terminada en `/exec`).
6. Configura la URL una sola vez en `js/app-config.js`. Los módulos `js/api.js`, `js/sitio-config.js`, `js/admin/auth.js` y `js/admin/api.js` la reutilizan automáticamente.

---

## 3. PRIMER USUARIO ADMINISTRADOR

El panel de administración requiere al menos un usuario registrado en la pestaña `usuarios` del Google Sheet. Las contraseñas se almacenan como hash SHA-256.

### Opción A: Crear usuario manualmente en Google Sheets

En la pestaña `usuarios`, crea una fila con las siguientes columnas:

| id | usuario | password_hash | rol | activo | fecha_creado |
|----|---------|---------------|-----|--------|--------------|
| 1 | admin | [SHA-256 de tu contraseña] | administrador | si | [fecha] |

Para generar el hash SHA-256 de tu contraseña, puedes usar cualquier herramienta en línea de confianza o ejecutar en la consola del navegador:

```javascript
// Ejemplo en consola del navegador (no enviar contraseña real por internet)
const msgUint8 = new TextEncoder().encode("TU_CONTRASEÑA");
const hashBuffer = await crypto.subtle.digest('SHA-256', msgUint8);
const hashArray = Array.from(new Uint8Array(hashBuffer));
const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
console.log(hashHex);
```

Copia el resultado en la columna `password_hash`.

### Opción B: Script de inicialización (recomendado)

Crea un archivo temporal `init-admin.gs` en Apps Script con este contenido, ejecútalo una vez, luego bórralo:

```javascript
function crearAdminInicial() {
  const ss = SpreadsheetApp.openById('TU_SHEET_ID');
  const sheet = ss.getSheetByName('usuarios');
  
  const usuario = 'admin';
  const password = 'CAMBIAR_ESTA_CONTRASEÑA';
  const hash = Utilities.computeDigest(Utilities.DigestAlgorithm.SHA_256, password);
  const passwordHash = Array.from(hash).map(b => ('0' + (b & 0xFF).toString(16)).slice(-2)).join('');
  
  // Verificar si ya existe
  const values = sheet.getDataRange().getValues();
  for (let i = 1; i < values.length; i++) {
    if (values[i][1] === usuario) {
      Logger.log('El usuario ya existe');
      return;
    }
  }
  
  sheet.appendRow([Date.now(), usuario, passwordHash, 'administrador', 'si', new Date()]);
  Logger.log('Usuario administrador creado. Contraseña: ' + password);
}
```

**IMPORTANTE:** Cambia la contraseña inmediatamente después del primer inicio de sesión.

---

## 4. VARIABLES DE CONFIGURACIÓN

| Archivo | Variable | Descripción |
|---------|----------|-------------|
| `Code.gs` del proyecto privado de Google Apps Script | `SHEET_ID` | ID de tu Google Sheet |
| `Code.gs` del proyecto privado de Google Apps Script | `TOKEN_SECRET` | Secreto para tokens (cambiar en producción) |
| `js/app-config.js` | `API_BASE` | URL `/exec` centralizada de tu Web App de Apps Script |
| Propiedades del script | `MULTIMEDIA_FOLDER_ID` | (Opcional) ID de la carpeta de Drive para multimedia |

---

## 5. GOOGLE DRIVE (BIBLIOTECA MULTIMEDIA)

La biblioteca multimedia guarda las imágenes en Google Drive y registra cada archivo en la pestaña `multimedia` del Google Sheet.

### Cómo funciona

1. Al subir la primera imagen, el backend crea automáticamente la carpeta **`San Juan Multimedia`** en el Drive de la cuenta que ejecuta el Web App.
2. El ID de esa carpeta se guarda en las propiedades del script (`MULTIMEDIA_FOLDER_ID`) para reutilizarla.
3. Cada archivo se comparte como **"Cualquier persona con el enlace" (solo lectura)** para que pueda mostrarse en el sitio público.
4. La URL pública que se guarda y se copia desde el panel es:
   `https://lh3.googleusercontent.com/d/ID_DEL_ARCHIVO`
5. Al eliminar una imagen desde el panel, el archivo se envía a la papelera de Drive y se borra su fila en la hoja `multimedia`.

### Requisitos

- La cuenta que ejecuta el Web App debe tener Google Drive disponible.
- Si modificas y vuelves a desplegar el backend privado con las funciones de Drive, Apps Script puede solicitar autorización para acceder a Drive. Revisa los permisos antes de publicar.
- Si tu cuenta de Google Workspace bloquea compartir archivos con "cualquier persona con el enlace", las imágenes se subirán pero no serán visibles públicamente. En ese caso, un administrador de Workspace debe permitir el uso compartido externo o alojar las imágenes en otro servicio.

### Usar una carpeta existente

Si prefieres usar una carpeta de Drive ya creada:

- **Opción A:** Agrega en la pestaña `configuracion` una fila con `clave = drive_folder_id` y `valor = ID_DE_LA_CARPETA`.
- **Opción B:** En Apps Script, abre **Configuración del proyecto → Propiedades del script** y crea `MULTIMEDIA_FOLDER_ID` con el ID de la carpeta.

La carpeta debe pertenecer (o estar compartida con permiso de edición) a la cuenta que ejecuta el Web App.

### Límites

- Máximo **5 MB por archivo**.
- Máximo **25 MB por lote** de subida desde el panel.
- Formatos permitidos: JPG, PNG, WebP, SVG y GIF.
- La subida viaja como base64 dentro del JSON para evitar problemas de CORS con Apps Script.

### Solución de problemas

| Síntoma | Causa probable | Solución |
|---------|----------------|----------|
| "No se pudo acceder a Google Drive" | Falta autorizar el permiso de Drive | Re-desplegar el Web App y aceptar los permisos |
| La imagen se sube pero no se ve en el sitio | La cuenta/Workspace bloquea el uso compartido público | Revisar la política de uso compartido de Drive |
| "No se pudo hacer pública" en el mensaje | El archivo se guardó, pero `setSharing` falló | Compartir manualmente la carpeta o revisar la política de Workspace |

---

## 6. CONFIGURACIÓN E INFORMACIÓN INSTITUCIONAL

Desde el panel, los módulos **Configuración** e **Institucional** alimentan el sitio público.

### Cómo se aplican los cambios

1. Al guardar, los datos se escriben en las hojas `configuracion` e `institucional` (formato clave/valor).
2. Las páginas públicas cargan `js/sitio-config.js`, que consulta los endpoints públicos `config:get` e `institucional:get`.
3. Los datos se aplican en la página y se cachean **5 minutos** en `localStorage`.
4. Si la API falla o no hay datos, cada página conserva su contenido estático como respaldo.

Para ver un cambio de inmediato, recarga la página o ejecuta en la consola del navegador:

```js
window.sanjuanSitio.recargar();
```

### Campos que se guardan

El backend solo acepta las claves editables del panel (listas blancas `CAMPOS_CONFIGURACION` y `CAMPOS_INSTITUCIONAL`). Cualquier clave técnica (`action`, `type`, `token`) se descarta y se elimina de las hojas al guardar.

### Acciones requeridas después de desplegar `Code.gs` del proyecto privado de Google Apps Script

La documentación histórica indica que estas funciones se añadieron al backend en una etapa anterior. Antes de ejecutarlas, comprueba en el proyecto privado y en el despliegue actual que siguen siendo necesarias y que sus implementaciones están presentes:

1. `invalidarTodasLasSesiones()` — cierra todas las sesiones activas.
2. `limpiarDatosSensiblesConfiguracion()` — elimina filas técnicas antiguas de `configuracion` e `institucional`.

Mientras el backend no esté actualizado, `js/sitio-config.js` filtra esas claves en el cliente, pero la limpieza definitiva debe hacerse en el servidor.

### Valores antiguos de tipografía

Si `font_titulo` estaba guardado como `Merriweather', Georgia, serif`, tanto el panel como el sitio público lo normalizan a `'Merriweather', Georgia, serif`. Para corregir el dato en la hoja, abre `admin/configuracion.html`, guarda de nuevo y el valor quedará limpio.

---

## 7. ACCESO AL PANEL DE ADMINISTRACIÓN

URL: `https://usuario.github.io/repositorio/admin/login.html` (sustituye por tu usuario, repositorio o dominio real)

1. Ingresa con el usuario administrador creado en el paso 3.
2. Tras iniciar sesión, serás redirigido al dashboard del panel bajo la misma ruta base de GitHub Pages.
3. Las sesiones expiran tras 24 horas de inactividad.
4. Todas las operaciones de escritura requieren autenticación verificada en el backend.

---

## 8. SEO Y ANALÍTICA

- Reemplaza `G-XXXXXXXXXX` en el snippet de gtag de cada archivo HTML con tu ID real de Google Analytics 4.
- Envía `sitemap.xml` a Google Search Console tras el despliegue.
- Configura tu favicon en `assets/img/favicon.ico`.

---

## 9. LIMITACIONES CONOCIDAS

- Google Apps Script tiene cuotas de ejecución diarias (límites de Google).
- Google Sheets tiene un límite de 5 millones de celdas.
- La autenticación usa SHA-256 (no bcrypt) y tokens en PropertiesService (válidos 24h).
- No hay servidor propio; todo depende de Google Apps Script y GitHub Pages.
- La subida de imágenes está limitada a 5 MB por archivo y 25 MB por lote.
- Google Apps Script no procesa `multipart/form-data`; la subida se envía en base64 dentro del JSON.

---

## 10. SEGURIDAD

- **No subas contraseñas ni tokens al repositorio.**
- **No incluyas `TOKEN_SECRET` ni `SHEET_ID` en JavaScript público.**
- El panel solo accede mediante un token de sesión enviado en el cuerpo de la solicitud y verificado en el backend (se evita el header `Authorization` para no disparar preflight CORS en Apps Script).
- Todas las operaciones de escritura del panel generan un registro en la pestaña `auditoria`.
- La configuración y la información institucional solo guardan claves permitidas; las claves técnicas (`action`, `type`, `token`) se filtran y eliminan.
- Los endpoints `config:get` e `institucional:get` son públicos de solo lectura; los `save` requieren sesión válida.

---

## Nota sobre el paquete de demostración

El ZIP de frontend no incluye `Code.gs`: el sitio consulta el Web App de Google Apps Script ya desplegado. Mantén el código fuente del backend en el proyecto privado de Apps Script o en una copia privada fuera del repositorio público. El identificador de Google Sheets y los secretos nunca deben quedar en HTML, JavaScript ni documentación pública.
