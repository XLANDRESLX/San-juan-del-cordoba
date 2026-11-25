// admin/api.js — Llamadas al backend desde el panel de administración
// ==========================================================================

(function () {
  'use strict';

  const ADMIN_API_BASE = (window.SANJUAN_CONFIG && window.SANJUAN_CONFIG.apiBase) || '';
  if (!ADMIN_API_BASE) console.error('[San Juan] No se encontró la URL de Google Apps Script.');

let activeControllers = new Map();

// Cancela solicitudes previas del mismo endpoint
function cancelPrevious(endpointKey) {
  if (activeControllers.has(endpointKey)) {
    activeControllers.get(endpointKey).abort();
    activeControllers.delete(endpointKey);
  }
}

async function adminRequest(endpointKey, action, data = {}, method = 'POST') {
  cancelPrevious(endpointKey);

  const controller = new AbortController();
  activeControllers.set(endpointKey, controller);

  const token = sessionStorage.getItem('sanjuan_admin_token');

  // No usamos header Authorization para evitar preflight CORS en Google Apps Script
  const headers = {
    'Content-Type': 'text/plain'
  };

  // El token se envía en el cuerpo de la solicitud
  const body = JSON.stringify({ action, type: action, token, ...data });

  try {
    const res = await fetch(ADMIN_API_BASE, {
      method,
      headers,
      body,
      signal: controller.signal
    });
    const json = await res.json();
    activeControllers.delete(endpointKey);
    return json;
  } catch (err) {
    activeControllers.delete(endpointKey);
    if (err.name === 'AbortError') {
      return { status: 'error', message: 'Solicitud cancelada' };
    }
    return { status: 'error', message: 'Error de red. Intenta de nuevo.' };
  }
}

// ===== Artículos =====
const ArticulosAPI = {
  listar: (filtros = {}) => adminRequest('articulos-list', 'articulos:list', filtros),
  obtener: (id) => adminRequest('articulos-get', 'articulos:get', { id }),
  crear: (data) => adminRequest('articulos-create', 'articulos:create', data),
  actualizar: (id, data) => adminRequest('articulos-update', 'articulos:update', { id, ...data }),
  eliminar: (id) => adminRequest('articulos-delete', 'articulos:delete', { id }),
  cambiarEstado: (id, estado) => adminRequest('articulos-estado', 'articulos:estado', { id, estado })
};

// ===== Páginas =====
const PaginasAPI = {
  listar: () => adminRequest('paginas-list', 'paginas:list'),
  obtener: (id) => adminRequest('paginas-get', 'paginas:get', { id }),
  crear: (data) => adminRequest('paginas-create', 'paginas:create', data),
  actualizar: (id, data) => adminRequest('paginas-update', 'paginas:update', { id, ...data }),
  eliminar: (id) => adminRequest('paginas-delete', 'paginas:delete', { id }),
  cambiarEstado: (id, estado) => adminRequest('paginas-estado', 'paginas:estado', { id, estado })
};

// ===== Configuración =====
const ConfiguracionAPI = {
  obtener: () => adminRequest('config-get', 'config:get'),
  guardar: (data) => adminRequest('config-save', 'config:save', data)
};

// ===== Institucional =====
const InstitucionalAPI = {
  obtener: () => adminRequest('institucional-get', 'institucional:get'),
  guardar: (data) => adminRequest('institucional-save', 'institucional:save', data)
};

// ===== Usuarios =====
const UsuariosAPI = {
  listar: () => adminRequest('usuarios-list', 'usuarios:list'),
  crear: (data) => adminRequest('usuarios-create', 'usuarios:create', data),
  actualizar: (id, data) => adminRequest('usuarios-update', 'usuarios:update', { id, ...data }),
  eliminar: (id) => adminRequest('usuarios-delete', 'usuarios:delete', { id })
};

// ===== Multimedia =====
const MultimediaAPI = {
  listar: () => adminRequest('multimedia-list', 'multimedia:list'),
  // archivos: [{ nombre, mimeType, base64, descripcion }]
  subir: (archivos) => adminRequest('multimedia-upload', 'multimedia:upload', { archivos }),
  eliminar: (id) => adminRequest('multimedia-delete', 'multimedia:delete', { id })
};

// ===== Contacto / Newsletter / Comentarios =====
const MensajesAPI = {
  listarContacto: () => adminRequest('contacto-list', 'contacto:list'),
  listarNewsletter: () => adminRequest('newsletter-list', 'newsletter:list'),
  listarComentarios: () => adminRequest('comentarios-list', 'comentarios:list'),
  marcarLeido: (id, tipo) => adminRequest('mensaje-leido', 'mensaje:leido', { id, tipo }),
  aprobarComentario: (id, aprobado) => adminRequest('comentario-aprobar', 'comentario:aprobar', { id, aprobado })
};

// Exportar
window.sanjuanAdminAPI = {
  ArticulosAPI,
  PaginasAPI,
  ConfiguracionAPI,
  InstitucionalAPI,
  UsuariosAPI,
  MultimediaAPI,
  MensajesAPI
};
})();