// admin/auth.js — Autenticación y gestión de sesión del panel
// ==========================================================================

(function () {
  'use strict';

  const ADMIN_API_BASE = (window.SANJUAN_CONFIG && window.SANJUAN_CONFIG.apiBase) || '';
  const sitePath = (path) => window.sanjuanPath ? window.sanjuanPath(path) : '../' + path;
  const TOKEN_KEY = 'sanjuan_admin_token';
  const USER_KEY = 'sanjuan_admin_user';

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