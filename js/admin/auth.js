// admin/auth.js — Autenticación y gestión de sesión del panel
// ==========================================================================

(function () {
  'use strict';

  const ADMIN_API_BASE = (window.SANJUAN_CONFIG && window.SANJUAN_CONFIG.apiBase) || '';
  const sitePath = (path) => window.sanjuanPath ? window.sanjuanPath(path) : '../' + path;
  const TOKEN_KEY = 'sanjuan_admin_token';
  const USER_KEY = 'sanjuan_admin_user';

  // Escape de datos antes de insertarlos con innerHTML (evita XSS en el panel)
  const ENTIDADES = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;', '`': '&#96;' };
  const aTexto = (v) => String(v === null || v === undefined ? '' : v);
  window.sanjuanEscape = Object.freeze({
    html: (v) => aTexto(v).replace(/[&<>"'`]/g, (c) => ENTIDADES[c]),
    id: (v) => aTexto(v).replace(/[^\w.-]/g, ''),
    cls: (v) => aTexto(v).replace(/[^\w-]/g, ''),
    url: (v) => {
      const raw = aTexto(v).trim();
      return /^https?:\/\//i.test(raw) ? raw.replace(/[&<>"'`]/g, (c) => ENTIDADES[c]) : '';
    }
  });

class Auth {
  constructor() {
    this.token = sessionStorage.getItem(TOKEN_KEY);
    this.user = sessionStorage.getItem(USER_KEY)
      ? JSON.parse(sessionStorage.getItem(USER_KEY))
      : null;
  }

  // Guarda credenciales de sesión
  setSession(token, user) {
    this.token = token;
    this.user = user;
    sessionStorage.setItem(TOKEN_KEY, token);
    sessionStorage.setItem(USER_KEY, JSON.stringify(user));
  }

  // Limpia la sesión
  clearSession() {
    this.token = null;
    this.user = null;
    sessionStorage.removeItem(TOKEN_KEY);
    sessionStorage.removeItem(USER_KEY);
  }

  // Verifica si hay sesión activa
  isAuthenticated() {
    return !!this.token;
  }

  // Obtiene headers de autenticación (sin Authorization para evitar preflight CORS)
  getHeaders() {
    return {
      'Content-Type': 'text/plain'
    };
  }

  // Inicia sesión
  async login(usuario, password) {
    try {
      const res = await fetch(`${ADMIN_API_BASE}?action=login`, {
        method: 'POST',
        headers: { 'Content-Type': 'text/plain' },
        body: JSON.stringify({ usuario, password, type: 'login' })
      });
      const json = await res.json();

      if (json.status === 'success' && json.token) {
        this.setSession(json.token, json.user);
        return { ok: true, user: json.user };
      }
      return { ok: false, message: json.message || 'Credenciales inválidas' };
    } catch (err) {
      return { ok: false, message: 'Error de conexión. Intenta de nuevo.' };
    }
  }

  // Cierra sesión
  logout() {
    const token = this.token;
    if (token && ADMIN_API_BASE) {
      // Invalida el token también en el servidor
      try {
        fetch(ADMIN_API_BASE, {
          method: 'POST',
          headers: { 'Content-Type': 'text/plain' },
          body: JSON.stringify({ type: 'logout', token }),
          keepalive: true
        }).catch(function () {});
      } catch (e) { /* no bloquear el cierre local */ }
    }
    this.clearSession();
    window.location.href = sitePath('admin/login.html');
  }

  // Middleware: redirige al login si no hay sesión
  requireAuth() {
    if (!this.isAuthenticated()) {
      window.location.href = sitePath('admin/login.html');
    }
  }

  // Middleware: redirige al dashboard si ya hay sesión (en login)
  requireNoAuth() {
    if (this.isAuthenticated()) {
      window.location.href = sitePath('admin/dashboard.html');
    }
  }

  // Obtiene el usuario actual
  getCurrentUser() {
    return this.user;
  }
}

const auth = new Auth();

// Exportar para uso global
window.sanjuanAuth = auth;
})();