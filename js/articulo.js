// Plantilla de artículo: los datos siempre proceden de Google Apps Script.
(function () {
  'use strict';
  const root = document.getElementById('articulo-root');
  if (!root) return;
  const cleanText = (value) => String(value == null ? '' : value);
  const dateLabel = (value) => { const d=new Date(value); return value && !Number.isNaN(d.getTime()) ? d.toLocaleDateString('es-CO',{day:'numeric',month:'long',year:'numeric'}) : ''; };
  const safeUrl = (value) => window.sanjuanAPI.urlSegura(value, window.sanjuanPath('assets/img/placeholder.svg'));

  function setMeta(name, content, property=false) {
    if(!content) return;
    const selector = property ? `meta[property="${name}"]` : `meta[name="${name}"]`;
    let meta=document.head.querySelector(selector);
    if(!meta){meta=document.createElement('meta');meta.setAttribute(property?'property':'name',name);document.head.append(meta);}
    meta.content=content;
  }
  function make(tag, cls, value) { const e=document.createElement(tag); if(cls)e.className=cls; if(value!==undefined)e.textContent=value; return e; }
  function renderArticulo(data, slug, prev, next) {
    root.replaceChildren();
    const article=make('article','articulo');
    const header=make('header','articulo__header');
    const cat=make('a','articulo__categoria',cleanText(data.categoria||'Institucional'));
    const category=(cleanText(data.categoria||'noticias')).toLowerCase();
    cat.href=window.sanjuanPath('categorias/'+( ['noticias','actividades','educativo'].includes(category)?category:'noticias')+'.html');
    header.append(cat);
    header.append(make('h1','articulo__titulo',cleanText(data.titulo||slug)));
    const meta=make('div','articulo__meta');
    if(data.autor) meta.append(make('span','articulo__autor',cleanText(data.autor)));
    const date=dateLabel(data.fecha_publicacion); if(date) meta.append(make('time','',date));
    header.append(meta);
    if(data.imagen_url){const img=make('img','articulo__imagen-destacada');img.src=safeUrl(data.imagen_url);img.alt=data.titulo?'Imagen de '+data.titulo:'Imagen de publicación';img.loading='eager';img.addEventListener('error',()=>{img.src=window.sanjuanPath('assets/img/placeholder.svg');},{once:true});header.append(img);}
    article.append(header);
    const body=make('div','articulo__cuerpo');
    const html=cleanText(data.contenido_html||'');
    if(html && window.sanjuanAPI.sanitizarHtml) body.innerHTML=window.sanjuanAPI.sanitizarHtml(html);
    else body.append(make('p','',cleanText(data.resumen||'El contenido de esta publicación estará disponible próximamente.')));
    article.append(body);
    const footer=make('footer','articulo__footer');
    const tags=cleanText(data.etiquetas||'').split(',').map(x=>x.trim()).filter(Boolean);
    if(tags.length){const wrap=make('div','articulo__etiquetas');tags.forEach(tag=>{const a=make('a','tag',tag);a.href=window.sanjuanPath('categorias/noticias.html');wrap.append(a);});footer.append(wrap);}
    if(prev||next){const nav=make('nav','articulo__navegacion');nav.setAttribute('aria-label','Navegación entre publicaciones');
      if(prev){const a=make('a','prev link','← '+cleanText(prev.titulo||'Anterior'));a.href=window.sanjuanArticleUrl(prev.slug);nav.append(a);}else nav.append(make('span','prev link','← Anterior'));
      if(next){const a=make('a','next link',cleanText(next.titulo||'Siguiente')+' →');a.href=window.sanjuanArticleUrl(next.slug);nav.append(a);}else nav.append(make('span','next link','Siguiente →'));
      footer.append(nav);
    }
    article.append(footer); root.append(article);
    document.title=cleanText(data.titulo||'Publicación')+' | IE San Juan del Córdoba';
    let canonical=document.querySelector('link[rel="canonical"]');
    if(!canonical){canonical=document.createElement('link');canonical.rel='canonical';document.head.append(canonical);}
    canonical.href=window.location.href;
    setMeta('og:url',window.location.href,true);
    setMeta('description',cleanText(data.resumen||data.titulo));
    setMeta('og:title',cleanText(data.titulo),true);setMeta('og:description',cleanText(data.resumen||''),true);
    if(data.imagen_url)setMeta('og:image',safeUrl(data.imagen_url),true);
    const form=document.getElementById('formComentario');
    if(form){const hidden=form.querySelector('[name="articulo_id"]');if(hidden)hidden.value=cleanText(data.id||data.articulo_id||slug);}
    if(window.sanjuanComentarios && window.sanjuanComentarios.cargar) window.sanjuanComentarios.cargar();
  }
  async function cargarArticulo(slug) {
    if(!window.sanjuanAPI){root.textContent='El servicio de publicaciones no está disponible en este momento.';return;}
    const safeSlug=cleanText(slug).trim();
    if(!safeSlug){root.textContent='No se indicó qué publicación deseas consultar.';return;}
    root.textContent='Cargando publicación…';
    try {
      const json=await window.sanjuanAPI.getArticulo(safeSlug);
      if(!json||json.status!=='success'||!json.data) throw new Error('Publicación no encontrada');
      // Defensa adicional: no mostrar borradores aunque el endpoint público los devuelva por slug.
      if (json.data.estado && String(json.data.estado).toLowerCase() !== 'publicado') throw new Error('Publicación no disponible');
      let prev=null,next=null;
      try {const list=await window.sanjuanAPI.getArticulos({page:1});const items=(list.data||[]).filter(a=>!a.estado||a.estado==='publicado');const i=items.findIndex(a=>a.slug===safeSlug);if(i>0)prev=items[i-1];if(i>=0&&i<items.length-1)next=items[i+1];}catch(e){}
      renderArticulo(json.data,safeSlug,prev,next);
    } catch(err) {
      root.replaceChildren(make('div','gallery-empty','No se pudo cargar esta publicación. Comprueba tu conexión o vuelve a consultar más tarde.'));
    }
  }
  const params=new URLSearchParams(window.location.search);
  const pathParts=window.location.pathname.split('/').filter(Boolean);
  const lastPart=pathParts[pathParts.length-1] || '';
  const slug=params.get('slug') || (lastPart && lastPart !== 'articulo.html' && lastPart.endsWith('.html') ? lastPart.replace(/\.html$/i,'') : '');
  window.sanjuanArticulo={renderArticulo,cargarArticulo};
  if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',()=>cargarArticulo(slug),{once:true}); else cargarArticulo(slug);
})();
