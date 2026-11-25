// API pública centralizada. Google Apps Script sigue siendo la fuente de datos.
(function () {
  'use strict';

  const API_BASE = (window.SANJUAN_CONFIG && window.SANJUAN_CONFIG.apiBase) || '';
  const activeControllers = new Map();
  let loadingCount = 0;
  const loadingCallbacks = [];

  function onLoadingChange(callback) {
    if (typeof callback === 'function') loadingCallbacks.push(callback);
  }

  function setLoading(loading) {
    loadingCount = loading ? loadingCount + 1 : Math.max(0, loadingCount - 1);
    loadingCallbacks.forEach((callback) => {
      try { callback(loadingCount > 0); } catch (error) { console.warn('[San Juan] Callback de carga:', error); }
    });
  }

  function urlSegura(value, fallback) {
    const raw = String(value || '').trim();
    if (!raw) return fallback || window.sanjuanPath('assets/img/placeholder.svg');
    if (/^(https?:|mailto:|tel:)/i.test(raw)) return raw;
    if (/^(javascript:|data:|vbscript:|file:)/i.test(raw)) return fallback || window.sanjuanPath('assets/img/placeholder.svg');
    return window.sanjuanPath(raw.replace(/^\/+/, ''));
  }

  function sanitizarHtml(html) {
    if (!html) return '';
    const raw = String(html);
    if (window.DOMPurify && typeof window.DOMPurify.sanitize === 'function') {
      return window.DOMPurify.sanitize(raw, {
        USE_PROFILES: { html: true },
        FORBID_TAGS: ['style', 'iframe', 'object', 'embed', 'form', 'input', 'button'],
        FORBID_ATTR: ['style'],
        ALLOW_UNKNOWN_PROTOCOLS: false
      });
    }

    // Respaldo restrictivo cuando la librería externa no está disponible.
    const template = document.createElement('template');
    template.innerHTML = raw;
    const forbidden = new Set(['SCRIPT', 'STYLE', 'IFRAME', 'OBJECT', 'EMBED', 'FORM', 'INPUT', 'BUTTON', 'META', 'LINK', 'BASE', 'SVG', 'MATH']);
    template.content.querySelectorAll('*').forEach((element) => {
      if (forbidden.has(element.tagName)) {
        element.remove();
        return;
      }
      Array.from(element.attributes).forEach((attribute) => {
        const name = attribute.name.toLowerCase();
        const value = attribute.value.trim();
        if (name.startsWith('on') || name === 'style' || name === 'srcdoc' || name === 'formaction') {
          element.removeAttribute(attribute.name);
        } else if (['href', 'src', 'xlink:href'].includes(name) && /^(javascript:|data:|vbscript:|file:)/i.test(value)) {
          element.removeAttribute(attribute.name);
        }
      });
    });
    return template.innerHTML;
  }

  function cancelarAnterior(key) {
    if (activeControllers.has(key)) {
      activeControllers.get(key).abort();
      activeControllers.delete(key);
    }
  }

  async function apiRequest(key, url, options = {}) {
    if (!API_BASE) return { status: 'error', message: 'La API institucional no está configurada.' };
    cancelarAnterior(key);
    const controller = new AbortController();
    activeControllers.set(key, controller);
    setLoading(true);
    try {
      const response = await fetch(url, {
        ...options,
        signal: controller.signal,
        headers: { 'Content-Type': 'text/plain;charset=utf-8', ...(options.headers || {}) }
      });
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      const json = await response.json();
      if (!json || typeof json !== 'object') throw new Error('Respuesta inválida del servicio');
      return json;
    } catch (error) {
      if (error && error.name === 'AbortError') return { status: 'error', message: 'Solicitud cancelada' };
      console.warn('[San Juan API] No fue posible completar la solicitud:', error && error.message ? error.message : error);
      return { status: 'error', message: 'No se pudo conectar con el servicio institucional. Intenta nuevamente.' };
    } finally {
      // Una solicitud antigua no debe borrar del mapa el controlador de su reemplazo.
      if (activeControllers.get(key) === controller) activeControllers.delete(key);
      setLoading(false);
    }
  }

  const API = {
    getArticulos(params = {}) {
      const query = new URLSearchParams({ action: 'list' });
      if (params.categoria) query.set('categoria', params.categoria);
      if (params.etiqueta) query.set('etiqueta', params.etiqueta);
      if (params.page) query.set('page', params.page);
      return apiRequest('api-list', `${API_BASE}?${query}`, { method: 'GET' });
    },
    getArticulo(slug) {
      return apiRequest('api-single', `${API_BASE}?action=single&slug=${encodeURIComponent(slug)}`, { method: 'GET' });
    },
    getCategorias() {
      return apiRequest('api-categorias', `${API_BASE}?action=categorias`, { method: 'GET' });
    },
    getAutores() {
      return apiRequest('api-autores', `${API_BASE}?action=autores`, { method: 'GET' });
    },
    getComentarios(articuloId) {
      return apiRequest('api-comentarios', `${API_BASE}?action=comentarios&articulo_id=${encodeURIComponent(articuloId)}`, { method: 'GET' });
    },
    getMultimedia() {
      return apiRequest('api-multimedia', `${API_BASE}?action=multimedia:list`, { method: 'GET' });
    },
    enviarContacto(data) {
      return apiRequest('api-contacto', API_BASE, { method: 'POST', body: JSON.stringify({ ...data, type: 'contacto' }) });
    },
    suscribirNewsletter(data) {
      return apiRequest('api-newsletter', API_BASE, { method: 'POST', body: JSON.stringify({ ...data, type: 'newsletter' }) });
    },
    enviarComentario(data) {
      return apiRequest('api-comentario', API_BASE, { method: 'POST', body: JSON.stringify({ ...data, type: 'comentario' }) });
    },
    cancelarTodo() {
      activeControllers.forEach((controller) => controller.abort());
      activeControllers.clear();
    },
    urlSegura,
    sanitizarHtml,
    onLoadingChange,
    setLoading
  };

  window.sanjuanAPI = API;
})();
