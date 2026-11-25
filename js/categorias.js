// Carga categorías desde la API pública de Google Apps Script.
(function () {
  'use strict';
  const main = document.querySelector('[data-category]');
  const grid = document.getElementById('listaArticulos');
  const status = document.getElementById('categoryStatus');
  const pagination = document.getElementById('paginacion');
  if (!main || !grid || !window.sanjuanAPI) return;
  const category = main.dataset.category;
  const allowed = new Set(['noticias', 'actividades', 'educativo']);
  if (!allowed.has(category)) return;
  const placeholder = window.sanjuanPath('assets/img/placeholder.svg');
  const params = new URLSearchParams(location.search);
  const initialPage = Math.max(1, Number.parseInt(params.get('page') || '1', 10) || 1);

  function node(tag, className, text) {
    const el = document.createElement(tag);
    if (className) el.className = className;
    if (text !== undefined) el.textContent = text;
    return el;
  }
  function formatDate(value) {
    const d = new Date(value);
    return value && !Number.isNaN(d.getTime()) ? d.toLocaleDateString('es-CO', {day:'numeric',month:'short',year:'numeric'}) : 'Fecha no disponible';
  }
  function createCard(item) {
    const card = node('article', 'card-articulo');
    const link = node('a', 'link');
    link.href = window.sanjuanArticleUrl ? window.sanjuanArticleUrl(item.slug || '') : 'articulo.html?slug=' + encodeURIComponent(item.slug || '');
    const img = node('img', 'card-articulo__imagen');
    img.src = window.sanjuanAPI.urlSegura(item.imagen_url, placeholder);
    img.alt = item.titulo ? 'Imagen de ' + item.titulo : 'Imagen de publicación institucional';
    img.loading = 'lazy'; img.decoding = 'async'; img.width = 720; img.height = 440;
    img.addEventListener('error', () => { img.src = placeholder; }, {once:true});
    const body = node('div','card-articulo__body');
    const meta = node('div','card-articulo__meta');
    meta.append(node('span','card-articulo__categoria',item.categoria || category),node('time','',formatDate(item.fecha_publicacion)));
    const title = node('h2','',item.titulo || 'Publicación institucional');
    const summary = node('p','',item.resumen || 'Consulta esta publicación para conocer más información.');
    const more = node('span','card-articulo__read','Leer publicación →');
    body.append(meta,title,summary,more); link.append(img,body); card.append(link);
    return card;
  }
  function renderPagination(total, page, perPage) {
    pagination.replaceChildren();
    const pages = Math.ceil((Number(total)||0) / Math.max(1,Number(perPage)||10));
    for(let n=1;n<=pages;n++) {
      const a = document.createElement('a'); a.href = '?page='+n; a.textContent=String(n);
      if(n===Number(page)){a.classList.add('actual');a.setAttribute('aria-current','page');}
      pagination.append(a);
    }
  }
  async function load(page) {
    status.textContent = 'Consultando publicaciones…';
    grid.replaceChildren();
    try {
      const response = await window.sanjuanAPI.getArticulos({categoria:category,page});
      if(!response || response.status!=='success') throw new Error(response && response.message || 'Servicio no disponible');
      const articles = Array.isArray(response.data) ? response.data : [];
      if(!articles.length) {
        status.textContent = 'No hay publicaciones disponibles en esta categoría.';
        grid.append(node('p','gallery-empty','Las publicaciones aparecerán aquí cuando se publiquen desde el administrador.'));
        pagination.replaceChildren(); return;
      }
      status.textContent = articles.length + ' publicaciones encontradas.';
      articles.forEach(item=>grid.append(createCard(item)));
      renderPagination(response.total,response.page || page,response.perPage || 10);
    } catch(err) {
      status.textContent = 'No se pudo conectar con el servicio institucional. Intenta nuevamente.';
      const retry = node('button','button button--secondary','Volver a intentar');
      retry.type='button'; retry.addEventListener('click',()=>load(page)); grid.append(retry);
    }
  }
  load(initialPage);
})();
