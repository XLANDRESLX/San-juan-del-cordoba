// busqueda.js - Buscador interno con filtros
(function () {
  'use strict';

  let debounceTimer;

  const input = document.getElementById('buscadorInput');
  const filtroCategoria = document.getElementById('filtroCategoria');
  const container = document.getElementById('resultadosBusqueda');

  if (input && container) {
    async function buscar(query, categoria = '') {
      const consulta = (query || '').trim();
      if (!consulta) {
        container.innerHTML = '';
        return;
      }

      container.innerHTML = '<p class="resultado-vacio">Buscando…</p>';

      try {
        const json = await window.sanjuanAPI.getArticulos({ categoria: categoria || undefined });
        const q = consulta.toLowerCase();
        const filtrados = (json.data || []).filter(a =>
          (a.titulo || '').toLowerCase().includes(q) ||
          (a.resumen || '').toLowerCase().includes(q) ||
          (a.etiquetas || '').toLowerCase().includes(q)
        );

        container.replaceChildren();
        if (!filtrados.length) {
          const empty = document.createElement('p');
          empty.className = 'resultado-vacio';
          empty.textContent = `Sin resultados para "${consulta}"`;
          container.appendChild(empty);
          return;
        }
        filtrados.forEach((articulo) => {
          const link = document.createElement('a');
          link.className = 'resultado';
          link.href = window.sanjuanArticleUrl(articulo.slug || '');
          const title = document.createElement('strong');
          title.textContent = articulo.titulo || 'Publicación institucional';
          const date = document.createElement('span');
          const published = new Date(articulo.fecha_publicacion);
          date.textContent = Number.isNaN(published.getTime()) ? '' : published.toLocaleDateString('es-CO');
          link.append(title, date);
          container.appendChild(link);
        });
      } catch {
        container.innerHTML = '<p class="resultado-vacio">Error al buscar.</p>';
      }
    }

    input.addEventListener('input', (e) => {
      clearTimeout(debounceTimer);
      debounceTimer = setTimeout(() => buscar(e.target.value, filtroCategoria ? filtroCategoria.value : ''), 300);
    });
  }

  if (filtroCategoria) {
    filtroCategoria.addEventListener('change', (e) => {
      if (input) buscar(input.value, e.target.value);
    });
  }
})();
