// Carga noticias y galería desde la API real de Google Apps Script.
(function () {
  'use strict';
  const PLACEHOLDER = window.sanjuanPath('assets/img/placeholder.svg');

  function fechaBonita(value) {
    if (!value) return 'Fecha no disponible';
    const date = new Date(value);
    return Number.isNaN(date.getTime()) ? 'Fecha no disponible' : date.toLocaleDateString('es-CO', { day: 'numeric', month: 'short', year: 'numeric' });
  }

  function cardArticulo(item) {
    const article = document.createElement('article');
    article.className = 'card-articulo swiper-slide';
    const link = document.createElement('a');
    link.href = window.sanjuanArticleUrl(item.slug || '');
    const image = document.createElement('img');
    image.className = 'card-articulo__imagen';
    image.src = window.sanjuanAPI.urlSegura(item.imagen_url, PLACEHOLDER);
    image.alt = item.titulo ? `Imagen de ${item.titulo}` : 'Imagen de publicación institucional';
    image.loading = 'lazy';
    image.decoding = 'async';
    image.width = 720;
    image.height = 440;
    image.addEventListener('error', () => { image.src = PLACEHOLDER; }, { once: true });

    const body = document.createElement('div');
    body.className = 'card-articulo__body';
    const meta = document.createElement('div');
    meta.className = 'card-articulo__meta';
    const category = document.createElement('span');
    category.className = 'card-articulo__categoria';
    category.textContent = item.categoria || 'Institucional';
    const date = document.createElement('time');
    date.textContent = fechaBonita(item.fecha_publicacion);
    if (item.fecha_publicacion) date.dateTime = item.fecha_publicacion;
    meta.append(category, date);
    const title = document.createElement('h3');
    title.textContent = item.titulo || 'Publicación institucional';
    const summary = document.createElement('p');
    summary.textContent = item.resumen || 'Consulta esta publicación para conocer más información.';
    const read = document.createElement('span');
    read.className = 'card-articulo__read';
    read.innerHTML = 'Leer publicación <i data-lucide="arrow-right" aria-hidden="true"></i>';
    body.append(meta, title, summary, read);
    link.append(image, body);
    article.append(link);
    return article;
  }

  async function cargarNoticias() {
    const grid = document.getElementById('listaArticulos');
    const status = document.getElementById('newsStatus');
    if (!grid || !window.sanjuanAPI) return;
    try {
      const response = await window.sanjuanAPI.getArticulos({ page: 1 });
      if (response.status !== 'success') throw new Error(response.message || 'Servicio no disponible');
      const articles = Array.isArray(response.data) ? response.data : [];
      grid.replaceChildren();
      if (!articles.length) {
        grid.innerHTML = '<div class="gallery-empty"><div><i data-lucide="newspaper" aria-hidden="true"></i><strong>Aún no hay publicaciones visibles</strong><p>Las noticias aparecerán aquí cuando se publiquen desde el administrador.</p></div></div>';
        if (status) status.textContent = 'No hay publicaciones disponibles.';
        return;
      }
      articles.slice(0, 8).forEach((item) => grid.appendChild(cardArticulo(item)));
      if (window.lucide) window.lucide.createIcons();
      const container = document.getElementById('newsSwiper');
      if (window.Swiper && articles.length > 3) {
        grid.classList.remove('grid-articulos');
        if (container) container.classList.remove('news-swiper--static');
        const prev = container && container.querySelector('.swiper-button-prev');
        const next = container && container.querySelector('.swiper-button-next');
        const pagination = container && container.querySelector('.swiper-pagination');
        if (container) {
          new window.Swiper(container, {
            slidesPerView: 1,
            spaceBetween: 16,
            watchOverflow: true,
            navigation: { prevEl: prev, nextEl: next },
            pagination: { el: pagination, clickable: true },
            breakpoints: { 680: { slidesPerView: 2, spaceBetween: 18 }, 1024: { slidesPerView: 3, spaceBetween: 22 } }
          });
        }
      } else {
        grid.classList.add('grid-articulos');
        if (container) container.classList.add('news-swiper--static');
      }
      if (status) status.textContent = `${articles.length} publicaciones cargadas.`;
    } catch (error) {
      grid.innerHTML = '<div class="gallery-empty"><div><i data-lucide="cloud-off" aria-hidden="true"></i><strong>No se pudo consultar la actualidad</strong><p>El servicio institucional no respondió. Puedes volver a intentarlo más tarde.</p></div></div>';
      if (status) status.textContent = 'Error al consultar las publicaciones.';
      if (window.lucide) window.lucide.createIcons();
    }
  }

  function initPhotoSwipe() {
    const container = document.getElementById('galeriaInstitucional');
    if (!container || !container.querySelector('a[data-pswp-width]')) return;
    import('https://cdn.jsdelivr.net/npm/photoswipe@5.4.4/dist/photoswipe-lightbox.esm.js')
      .then((module) => {
        const Lightbox = module.default;
        const lightbox = new Lightbox({
          gallery: '#galeriaInstitucional',
          children: 'a[data-pswp-width]',
          pswpModule: () => import('https://cdn.jsdelivr.net/npm/photoswipe@5.4.4/dist/photoswipe.esm.js')
        });
        lightbox.init();
      })
      .catch((error) => console.warn('[San Juan] PhotoSwipe no está disponible; las imágenes se abrirán directamente.', error));
  }

  async function cargarGaleria() {
    const gallery = document.getElementById('galeriaInstitucional');
    if (!gallery || !window.sanjuanAPI) return;
    try {
      const response = await window.sanjuanAPI.getMultimedia();
      if (response.status !== 'success') throw new Error(response.message || 'No fue posible obtener la galería');
      const images = Array.isArray(response.data) ? response.data : [];
      gallery.replaceChildren();
      if (!images.length) {
        gallery.innerHTML = '<div class="gallery-empty"><div><i data-lucide="images" aria-hidden="true"></i><strong>La galería se actualizará próximamente</strong><p>Las fotografías se mostrarán aquí cuando estén publicadas en la biblioteca multimedia.</p></div></div>';
        if (window.lucide) window.lucide.createIcons();
        return;
      }
      images.slice(0, 12).forEach((item) => {
        const figure = document.createElement('figure');
        figure.className = 'galeria__item';
        const link = document.createElement('a');
        const src = window.sanjuanAPI.urlSegura(item.url || item.imagen_url, PLACEHOLDER);
        link.href = src;
        link.setAttribute('aria-label', `Ampliar ${item.nombre || item.descripcion || 'fotografía institucional'}`);
        const img = document.createElement('img');
        img.src = src;
        img.alt = item.descripcion || item.nombre || 'Fotografía de la comunidad educativa';
        img.loading = 'lazy';
        img.decoding = 'async';
        img.addEventListener('error', () => { img.src = PLACEHOLDER; link.href = PLACEHOLDER; }, { once: true });
        img.addEventListener('load', () => {
          link.dataset.pswpWidth = String(img.naturalWidth || 1200);
          link.dataset.pswpHeight = String(img.naturalHeight || 800);
        }, { once: true });
        link.appendChild(img);
        figure.appendChild(link);
        if (item.descripcion || item.nombre) {
          const caption = document.createElement('figcaption');
          caption.textContent = item.descripcion || item.nombre;
          figure.appendChild(caption);
        }
        gallery.appendChild(figure);
      });
      initPhotoSwipe();
    } catch (error) {
      gallery.innerHTML = '<div class="gallery-empty"><div><i data-lucide="cloud-off" aria-hidden="true"></i><strong>La galería no está disponible</strong><p>No fue posible conectar con la biblioteca multimedia. Inténtalo nuevamente más tarde.</p></div></div>';
      if (window.lucide) window.lucide.createIcons();
    }
  }

  document.addEventListener('DOMContentLoaded', () => {
    cargarNoticias();
    cargarGaleria();
  });
})();
