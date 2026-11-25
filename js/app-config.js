/* Configuración común del sitio. Mantiene centralizada la URL de Apps Script
   y resuelve la ruta base tanto en dominio propio como en GitHub Pages. */
(function () {
  'use strict';

  const API_BASE = 'https://script.google.com/macros/s/AKfycbwQ7soneWAlDCtXBEcaRpjOOm7HyD3OrqOaFVpRicdNhygpNWiIkFeRr0ubgayVfWEwHg/exec';
  const pathParts = window.location.pathname.split('/').filter(Boolean);
  const firstPart = pathParts[0] || '';
  const knownRootPaths = new Set([
    'index.html', 'quienes-somos.html', 'contacto.html', 'aviso-legal.html',
    'politica-privacidad.html', '404.html', 'articulo.html', 'categorias',
    'articulos', 'admin', 'assets', 'css', 'js', 'data'
  ]);
  const metaBase = document.querySelector('meta[name="site-base-path"]');
  const configuredBase = metaBase && metaBase.content ? metaBase.content.trim() : '';
  const isGitHubProjectSite = window.location.hostname.endsWith('.github.io') &&
    firstPart && !knownRootPaths.has(firstPart);
  const BASE_PATH = configuredBase
    ? (configuredBase.endsWith('/') ? configuredBase : configuredBase + '/')
    : (isGitHubProjectSite ? `/${firstPart}/` : '/');

  function sitePath(path) {
    const clean = String(path || '').replace(/^\/+/, '');
    return BASE_PATH + clean;
  }

  function safeExternalOrLocalUrl(value, fallback) {
    const raw = String(value || '').trim();
    if (!raw) return sitePath(fallback || 'assets/img/placeholder.svg');
    if (/^(https?:|mailto:|tel:)/i.test(raw)) return raw;
    if (/^(javascript:|data:|vbscript:)/i.test(raw)) return sitePath(fallback || 'assets/img/placeholder.svg');
    return sitePath(raw.replace(/^\/+/, ''));
  }

  window.SANJUAN_CONFIG = Object.freeze({ apiBase: API_BASE, basePath: BASE_PATH });
  window.sanjuanPath = sitePath;
  window.sanjuanUrl = safeExternalOrLocalUrl;
  window.sanjuanArticleUrl = function (slug) {
    return sitePath('articulo.html?slug=' + encodeURIComponent(String(slug || '')));
  };
})();
