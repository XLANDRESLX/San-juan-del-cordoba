// js/sitio-config.js — Conecta la configuración y la información institucional
// del panel de administración con el sitio público.
//
// Fuentes de datos (endpoints públicos de solo lectura):
//   ?action=config:get
//   ?action=institucional:get
//
// Si la API no responde, la página conserva su contenido estático como respaldo.
(function () {
  'use strict';

  const API_BASE = (window.SANJUAN_CONFIG && window.SANJUAN_CONFIG.apiBase) || '';
  const LOGO_LOCAL = window.sanjuanPath ? window.sanjuanPath('assets/img/logo.png') : 'assets/img/logo.png';
  const CACHE_KEY = 'sanjuan_sitio_datos_v1';
  const CACHE_TTL = 5 * 60 * 1000; // 5 minutos
  const CLAVES_INTERNAS = ['action', 'type', 'token'];

  const FALLBACK_NOMBRE = 'Institución Educativa San Juan del Córdoba';
  const FALLBACK_DIRECCION = 'Ciénaga, Magdalena, Colombia';
  const FALLBACK_DANE = '147189001186';

  const REDES = {
    facebook: 'Facebook',
    instagram: 'Instagram',
    youtube: 'YouTube'
  };

  let ejecutando = false;

  // ==========================================================================
  // Utilidades
  // ==========================================================================
  function texto(valor) {
    return typeof valor === 'string' ? valor.trim() : '';
  }

  function esUrl(valor) {
    return /^https?:\/\//i.test(texto(valor));
  }

  function esColor(valor) {
    return /^#(?:[0-9a-f]{3}|[0-9a-f]{6})$/i.test(texto(valor));
  }

  function ajustarColor(hex, delta) {
    const limpio = hex.replace('#', '');
    const completo = limpio.length === 3
      ? limpio.split('').map(function (c) { return c + c; }).join('')
      : limpio;
    const numero = parseInt(completo, 16);
    if (isNaN(numero)) return hex;

    const canales = [
      (numero >> 16) & 255,
      (numero >> 8) & 255,
      numero & 255
    ].map(function (canal) {
      return Math.max(0, Math.min(255, canal + delta));
    });

    return '#' + canales.map(function (canal) {
      return canal.toString(16).padStart(2, '0');
    }).join('');
  }

  function extraerFamilia(valor) {
    const cadena = texto(valor);
    if (!cadena) return '';
    return cadena
      .split(',')[0]
      .trim()
      .replace(/^['"]+|['"]+$/g, '')
      .replace(/\\/g, '')
      .trim();
  }

  function normalizarFuente(valor) {
    const familia = extraerFamilia(valor);
    if (!familia) return '';
    const esSerif = /serif|merriweather|playfair|georgia/i.test(texto(valor));
    return "'" + familia + "', " + (esSerif ? 'Georgia, serif' : 'Arial, sans-serif');
  }

  function limpiarDatos(data) {
    const limpio = {};
    if (!data || typeof data !== 'object') return limpio;
    Object.keys(data).forEach(function (clave) {
      if (CLAVES_INTERNAS.indexOf(clave) === -1) {
        limpio[clave] = data[clave];
      }
    });
    return limpio;
  }

  // ==========================================================================
  // Lectura de API + caché local
  // ==========================================================================
  async function pedir(action) {
    const respuesta = await fetch(API_BASE + '?action=' + encodeURIComponent(action), {
      method: 'GET',
      cache: 'no-store'
    });

    if (!respuesta.ok) {
      throw new Error('HTTP ' + respuesta.status);
    }

    const json = await respuesta.json();
    if (!json || json.status !== 'success') {
      throw new Error((json && json.message) || 'Respuesta inválida de la API');
    }

    return limpiarDatos(json.data);
  }

  function leerCache() {
    try {
      const guardado = window.localStorage.getItem(CACHE_KEY);
      if (!guardado) return null;

      const cache = JSON.parse(guardado);
      if (!cache || typeof cache.t !== 'number' || Date.now() - cache.t > CACHE_TTL) {
        window.localStorage.removeItem(CACHE_KEY);
        return null;
      }

      return cache.d;
    } catch (error) {
      return null;
    }
  }

  function guardarCache(datos) {
    try {
      window.localStorage.setItem(CACHE_KEY, JSON.stringify({ t: Date.now(), d: datos }));
    } catch (error) {
      // Almacenamiento no disponible: se ignora.
    }
  }

  async function obtenerDatos() {
    const cache = leerCache();
    if (cache) return cache;

    const resultados = await Promise.allSettled([
      pedir('config:get'),
      pedir('institucional:get')
    ]);

    const datos = {
      config: resultados[0].status === 'fulfilled' ? resultados[0].value : {},
      institucional: resultados[1].status === 'fulfilled' ? resultados[1].value : {}
    };

    if (resultados[0].status === 'fulfilled' || resultados[1].status === 'fulfilled') {
      guardarCache(datos);
    }

    return datos;
  }

  // ==========================================================================
  // Apariencia
  // ==========================================================================
  function cargarFuentes(fuenteTitulo) {
    if (document.querySelector('link[data-sanjuan-fonts]')) return;

    const familias = ['Open+Sans:wght@400;600;700'];
    const familia = extraerFamilia(fuenteTitulo) || 'Merriweather';
    const mapa = {
      'merriweather': 'Merriweather:wght@400;700',
      'open sans': 'Open+Sans:wght@400;600;700',
      'playfair display': 'Playfair+Display:wght@400;700',
      'lato': 'Lato:wght@400;700'
    };

    const fuenteGoogle = mapa[familia.toLowerCase()] || mapa['merriweather'];
    if (familias.indexOf(fuenteGoogle) === -1) familias.push(fuenteGoogle);

    const enlace = document.createElement('link');
    enlace.rel = 'stylesheet';
    enlace.setAttribute('data-sanjuan-fonts', '1');
    enlace.href = 'https://fonts.googleapis.com/css2?family=' + familias.join('&family=') + '&display=swap';
    document.head.appendChild(enlace);
  }

  function aplicarFavicon(url) {
    let enlace = document.querySelector('link[rel="icon"]');
    if (!enlace) {
      enlace = document.createElement('link');
      enlace.rel = 'icon';
      document.head.appendChild(enlace);
    }

    const minuscula = url.toLowerCase();
    if (/\.svg($|\?)/.test(minuscula)) {
      enlace.type = 'image/svg+xml';
    } else if (/\.png($|\?)/.test(minuscula)) {
      enlace.type = 'image/png';
    } else if (/\.ico($|\?)/.test(minuscula)) {
      enlace.type = 'image/x-icon';
    } else {
      enlace.removeAttribute('type');
    }

    enlace.href = url;
  }

  function aplicarApariencia(config, institucional) {
    const raiz = document.documentElement;

    if (esColor(config.color_primario)) {
      raiz.style.setProperty('--color-primario', config.color_primario);
      raiz.style.setProperty('--color-primario-hover', ajustarColor(config.color_primario, -18));
    }

    if (esColor(config.color_secundario)) {
      raiz.style.setProperty('--color-secundario', config.color_secundario);
      raiz.style.setProperty('--color-secundario-hover', ajustarColor(config.color_secundario, -18));
    }

    const fuente = normalizarFuente(config.font_titulo);
    if (fuente) raiz.style.setProperty('--font-titulo', fuente);
    cargarFuentes(config.font_titulo);

    const tamano = texto(config.tamano_texto);
    if (/^\d+(?:\.\d+)?(?:rem|px|%)$/.test(tamano)) {
      raiz.style.fontSize = tamano;
    }

    const favicon = esUrl(config.favicon)
      ? config.favicon
      : (esUrl(institucional.escudo_url) ? institucional.escudo_url : '');

    if (favicon) aplicarFavicon(favicon);
  }

  // ==========================================================================
  // SEO / metadatos
  // ==========================================================================
  function esPaginaInicio() {
    const ruta = window.location.pathname;
    return ruta === '' || ruta === '/' || /\/index\.html?$/i.test(ruta) || /\/$/.test(ruta);
  }

  function setMeta(atributo, nombre, contenido) {
    let etiqueta = document.querySelector('meta[' + atributo + '="' + nombre + '"]');
    if (!etiqueta) {
      etiqueta = document.createElement('meta');
      etiqueta.setAttribute(atributo, nombre);
      document.head.appendChild(etiqueta);
    }
    etiqueta.setAttribute('content', contenido);
  }

  function aplicarSeo(config) {
    // La URL canónica se calcula en el dominio y subruta reales del despliegue.
    // Así no queda fijada accidentalmente a la raíz cuando GitHub Pages usa /repositorio/.
    let canonica = document.querySelector('link[rel="canonical"]');
    if (!canonica) {
      canonica = document.createElement('link');
      canonica.rel = 'canonical';
      document.head.appendChild(canonica);
    }
    const canonicalConfig = texto(config.canonical);
    canonica.href = esUrl(canonicalConfig)
      ? canonicalConfig
      : (window.location.origin + window.location.pathname);
    setMeta('property', 'og:url', canonica.href);

    const imagenOpenGraph = esUrl(config.og_image)
      ? config.og_image
      : new URL(LOGO_LOCAL, window.location.href).href;
    setMeta('property', 'og:image', imagenOpenGraph);
    setMeta('name', 'twitter:image', imagenOpenGraph);

    if (texto(config.nombre_sitio)) {
      setMeta('property', 'og:site_name', config.nombre_sitio);
    }

    if (!esPaginaInicio()) return;

    if (texto(config.seo_titulo)) {
      document.title = config.seo_titulo;
    }

    if (texto(config.seo_descripcion)) {
      setMeta('name', 'description', config.seo_descripcion);
      setMeta('property', 'og:description', config.seo_descripcion);
    }

  }

  function aplicarJsonLd(institucional, config) {
    const scripts = document.querySelectorAll('script[type="application/ld+json"]');
    const nombre = texto(institucional.nombre_institucional) || texto(config.nombre_sitio);
    const direccion = texto(institucional.direccion) || texto(config.direccion_institucional);
    const telefono = texto(institucional.telefono) || texto(config.telefono_institucional);

    scripts.forEach(function (script) {
      try {
        const original = JSON.parse(script.textContent);
        const objetos = Array.isArray(original) ? original : [original];
        let cambio = false;

        objetos.forEach(function (objeto) {
          if (!objeto || objeto['@type'] !== 'EducationalOrganization') return;

          if (nombre) {
            objeto.name = nombre;
            cambio = true;
          }
          if (objeto.url) {
            objeto.url = window.location.origin + window.location.pathname;
            cambio = true;
          }
          if (esUrl(institucional.logo_url)) {
            objeto.logo = institucional.logo_url;
            cambio = true;
          }
          if (direccion && objeto.address) {
            objeto.address.streetAddress = direccion;
            cambio = true;
          }
          if (telefono && objeto.contactPoint) {
            objeto.contactPoint.telephone = telefono;
            cambio = true;
          }
          if (esUrl(config.canonical)) {
            objeto.url = config.canonical;
            cambio = true;
          }
        });

        if (cambio) script.textContent = JSON.stringify(original);
      } catch (error) {
        // JSON-LD ajeno o inválido: se ignora.
      }
    });
  }

  // ==========================================================================
  // Logo
  // ==========================================================================
  function reemplazarLogoPorTexto(imagen, nombre) {
    if (!imagen.parentNode) return;
    const textoLogo = document.createElement('span');
    textoLogo.className = 'header__logo-texto';
    textoLogo.textContent = nombre;
    imagen.parentNode.replaceChild(textoLogo, imagen);
  }

  function aplicarLogo(institucional, config) {
    const nombre = texto(institucional.nombre_institucional)
      || texto(config.nombre_sitio)
      || FALLBACK_NOMBRE;

    document.querySelectorAll('.header__logo img, .footer__brand img').forEach(function (imagen) {
      const enlace = imagen.closest('.header__logo');
      imagen.alt = nombre;
      if (enlace) enlace.setAttribute('title', nombre);

      // El logo local se conserva como respaldo. Solo se reemplaza cuando
      // Apps Script entrega una URL externa válida.
      imagen.addEventListener('error', function () {
        if (imagen.dataset.logoFallbackApplied !== '1') {
          imagen.dataset.logoFallbackApplied = '1';
          imagen.src = LOGO_LOCAL;
        }
      }, { once: true });

      if (esUrl(institucional.logo_url)) {
        imagen.src = institucional.logo_url;
      } else if (!imagen.getAttribute('src')) {
        imagen.src = LOGO_LOCAL;
      }

      if (imagen.complete && imagen.naturalWidth === 0 && imagen.getAttribute('src') !== LOGO_LOCAL) {
        imagen.src = LOGO_LOCAL;
      }
    });
  }

  // ==========================================================================
  // Redes sociales
  // ==========================================================================
  function parseRedesInstitucionales(valor) {
    const redes = {};
    texto(valor).split(/\r?\n/).forEach(function (linea) {
      const separador = linea.indexOf(',');
      if (separador < 1) return;

      const nombre = linea.slice(0, separador).trim().toLowerCase();
      const url = linea.slice(separador + 1).trim();
      if (!esUrl(url)) return;

      if (nombre.indexOf('face') !== -1) redes.facebook = url;
      else if (nombre.indexOf('insta') !== -1) redes.instagram = url;
      else if (nombre.indexOf('you') !== -1) redes.youtube = url;
    });
    return redes;
  }

  function redesCombinadas(config, institucional) {
    const redes = parseRedesInstitucionales(institucional.redes_sociales);

    Object.keys(REDES).forEach(function (clave) {
      const url = texto(config[clave]);
      if (esUrl(url)) redes[clave] = url;
    });

    return redes;
  }

  function aplicarRedes(redes) {
    const contenedor = document.querySelector('.footer__social');
    if (!contenedor) return;

    const titulo = contenedor.querySelector('h4');
    contenedor.textContent = '';
    if (titulo) contenedor.appendChild(titulo);

    let visibles = 0;
    Object.keys(REDES).forEach(function (clave) {
      const url = redes[clave];
      if (!esUrl(url)) return;

      const enlace = document.createElement('a');
      enlace.href = url;
      enlace.className = 'link';
      enlace.setAttribute('aria-label', REDES[clave]);
      enlace.target = '_blank';
      enlace.rel = 'noopener noreferrer';
      enlace.textContent = REDES[clave];
      contenedor.appendChild(enlace);
      visibles += 1;
    });

    contenedor.hidden = visibles === 0;
  }

  // ==========================================================================
  // Navegación
  // ==========================================================================
  function aplicarMenu(config) {
    if (texto(config.menu_articulos).toLowerCase() === 'no') {
      document.querySelectorAll('.nav__dropdown').forEach(function (elemento) {
        if (/art[ií]culos/i.test(elemento.textContent)) elemento.remove();
      });
    }

    if (texto(config.menu_contacto).toLowerCase() === 'no') {
      document.querySelectorAll('.nav .nav__link[href$="contacto.html"]').forEach(function (enlace) {
        const item = enlace.closest('li');
        if (item) item.remove();
      });
    }
  }

  // ==========================================================================
  // Footer
  // ==========================================================================
  function aplicarInstitucionEnFooter(institucional, config) {
    const columnas = Array.from(document.querySelectorAll('.footer .footer__col'));
    const columna = columnas.find(function (elemento) {
      const titulo = elemento.querySelector('h4');
      return titulo && /instituci[oó]n/i.test(titulo.textContent);
    });

    if (!columna) return;
    const parrafo = columna.querySelector('p');
    if (!parrafo) return;

    const nombre = texto(institucional.nombre_institucional)
      || texto(config.nombre_sitio)
      || FALLBACK_NOMBRE;
    const direccion = texto(institucional.direccion)
      || texto(config.direccion_institucional)
      || FALLBACK_DIRECCION;
    const dane = texto(institucional.codigo_dane) || FALLBACK_DANE;

    const lineas = [nombre, direccion];
    if (dane) lineas.push('Código DANE: ' + dane);

    parrafo.textContent = '';
    lineas.forEach(function (linea, indice) {
      if (indice > 0) parrafo.appendChild(document.createElement('br'));
      parrafo.appendChild(document.createTextNode(linea));
    });
  }

  function aplicarPie(institucional, config) {
    const nombre = texto(institucional.nombre_institucional) || texto(config.nombre_sitio);
    if (!nombre) return;

    const parrafo = document.querySelector('.footer__bottom p');
    if (!parrafo) return;

    const anioExistente = parrafo.querySelector('#currentYear');
    const anio = anioExistente || document.createElement('span');
    if (!anioExistente) {
      anio.id = 'currentYear';
      anio.textContent = new Date().getFullYear();
    }

    parrafo.textContent = '';
    parrafo.appendChild(document.createTextNode('\u00A9 '));
    parrafo.appendChild(anio);
    parrafo.appendChild(document.createTextNode(' ' + nombre + ' – Ciénaga, Magdalena. Todos los derechos reservados.'));
  }

  // ==========================================================================
  // Portada (inicio)
  // ==========================================================================
  function aplicarPortada(config, institucional) {
    const hero = document.querySelector('#hero') || document.querySelector('.hero');
    if (!hero) return;

    const dane = texto(institucional.codigo_dane);
    const badge = hero.querySelector('.hero__badge');
    if (badge && dane) {
      badge.textContent = 'Institución Oficial • Código DANE ' + dane;
    }

    const mensaje = texto(institucional.mensaje_bienvenida) || texto(config.descripcion_sitio);
    const lead = hero.querySelector('.hero__lead');
    if (lead && mensaje) lead.textContent = mensaje;

    const imagen = texto(config.imagen_portada) || texto(institucional.imagen_portada);
    const overlay = hero.querySelector('.hero__overlay');
    if (overlay && esUrl(imagen)) {
      const urlSegura = imagen.replace(/"/g, '%22');
      overlay.style.background = 'linear-gradient(135deg, rgba(0, 0, 0, 0.45) 0%, rgba(0, 0, 0, 0.62) 100%), url("' + urlSegura + '") center/cover no-repeat';
    }
  }

  // ==========================================================================
  // Página Quiénes Somos
  // ==========================================================================
  function actualizarTablaInstitucional(tabla, institucional) {
    if (!tabla) return;
    const filas = Array.from(tabla.rows);
    const cuerpo = tabla.tBodies[0] || tabla;

    function set(label, valor) {
      if (!valor) return;

      const fila = filas.find(function (tr) {
        return tr.cells.length >= 2 && tr.cells[0].textContent.trim().toLowerCase() === label.toLowerCase();
      });

      if (fila) {
        fila.cells[1].textContent = valor;
        return;
      }

      const nueva = document.createElement('tr');
      const celdaLabel = document.createElement('td');
      const celdaValor = document.createElement('td');
      celdaLabel.textContent = label;
      celdaValor.textContent = valor;
      nueva.appendChild(celdaLabel);
      nueva.appendChild(celdaValor);
      cuerpo.appendChild(nueva);
      filas.push(nueva);
    }

    set('Código DANE', texto(institucional.codigo_dane));
    set('Nombre', texto(institucional.nombre_institucional));
    set('Niveles', texto(institucional.niveles));
    set('Dirección', texto(institucional.direccion));
    set('Teléfono', texto(institucional.telefono));
    set('Correo', texto(institucional.email));
    set('Horario', texto(institucional.horarios));
  }

  function aplicarPaginaQuienes(institucional) {
    const pagina = document.querySelector('.pagina-quienes');
    if (!pagina) return;

    const descripcion = texto(institucional.descripcion);
    const nombre = texto(institucional.nombre_institucional);
    const dane = texto(institucional.codigo_dane);
    const lead = pagina.querySelector('.lead');

    if (lead && (descripcion || dane)) {
      const partes = [];
      if (descripcion) {
        partes.push(descripcion);
      } else if (nombre) {
        partes.push(nombre + ', institución educativa oficial.');
      }
      if (dane) partes.push('Código DANE: ' + dane + '.');
      lead.textContent = partes.join(' ');
    }

    pagina.querySelectorAll('.mis-vision__card').forEach(function (tarjeta) {
      const titulo = tarjeta.querySelector('h2');
      if (!titulo) return;

      const tipo = titulo.textContent.toLowerCase();

      if (tipo.indexOf('misi') !== -1) {
        const parrafo = tarjeta.querySelector('p');
        if (parrafo && texto(institucional.mision)) parrafo.textContent = institucional.mision;
        return;
      }

      if (tipo.indexOf('visi') !== -1) {
        const parrafo = tarjeta.querySelector('p');
        if (parrafo && texto(institucional.vision)) parrafo.textContent = institucional.vision;
        return;
      }

      if (tipo.indexOf('valores') !== -1) {
        const lista = tarjeta.querySelector('ul');
        const valores = texto(institucional.valores);
        if (!lista || !valores) return;

        const items = valores.split(/[\n,;]+/).map(function (valor) {
          return valor.trim();
        }).filter(Boolean);

        lista.textContent = '';
        items.forEach(function (valor) {
          const item = document.createElement('li');
          item.textContent = valor;
          lista.appendChild(item);
        });
      }
    });

    actualizarTablaInstitucional(pagina.querySelector('.datos-institucionales table'), institucional);
  }

  // ==========================================================================
  // Página Contacto
  // ==========================================================================
  function aplicarPaginaContacto(institucional, config) {
    const direccion = document.querySelector('.contacto__datos address');
    if (!direccion) return;

    const valores = {
      'Dirección': texto(institucional.direccion) || texto(config.direccion_institucional),
      'Teléfono': texto(institucional.telefono) || texto(config.telefono_institucional),
      'Correo': texto(institucional.email) || texto(config.email_institucional),
      'Horario': texto(institucional.horarios)
    };

    direccion.querySelectorAll('p').forEach(function (parrafo) {
      const etiqueta = parrafo.querySelector('strong');
      if (!etiqueta) return;

      const nombreCampo = etiqueta.textContent.replace(/:$/, '').trim();
      const valor = valores[nombreCampo];
      if (!valor) return;

      parrafo.textContent = '';
      const negrita = document.createElement('strong');
      negrita.textContent = nombreCampo + ': ';
      parrafo.appendChild(negrita);

      if (nombreCampo === 'Correo') {
        const enlace = document.createElement('a');
        enlace.href = 'mailto:' + valor;
        enlace.textContent = valor;
        parrafo.appendChild(enlace);
      } else if (nombreCampo === 'Teléfono') {
        const enlace = document.createElement('a');
        enlace.href = 'tel:' + valor.replace(/[^\d+]/g, '');
        enlace.textContent = valor;
        parrafo.appendChild(enlace);
      } else {
        parrafo.appendChild(document.createTextNode(valor));
      }
    });
  }

  // ==========================================================================
  // Indicador de carga mientras se obtienen los datos desde la base de datos
  // ==========================================================================
  function mostrarIndicadorCarga() {
    if (document.getElementById('sanjuan-loading')) return;

    const overlay = document.createElement('div');
    overlay.id = 'sanjuan-loading';
    overlay.setAttribute('role', 'status');
    overlay.setAttribute('aria-live', 'polite');
    overlay.innerHTML = '<div class="sanjuan-spinner" aria-hidden="true"></div><p class="sanjuan-cargando-texto">Cargando información del sitio…</p>';
    document.body.appendChild(overlay);
  }

  function ocultarIndicadorCarga() {
    const overlay = document.getElementById('sanjuan-loading');
    if (overlay && overlay.parentNode) {
      overlay.parentNode.removeChild(overlay);
    }
  }

  // ==========================================================================
  // Inicio
  // ==========================================================================
  async function iniciar() {
    if (ejecutando) return;
    ejecutando = true;

    mostrarIndicadorCarga();

    try {
      // Quita de inmediato los enlaces sociales de ejemplo (href="#")
      // mientras se cargan las URLs reales configuradas.
      aplicarRedes({});

      const datos = await obtenerDatos();
      const config = datos.config || {};
      const institucional = datos.institucional || {};

      aplicarApariencia(config, institucional);
      aplicarSeo(config);
      aplicarLogo(institucional, config);
      aplicarRedes(redesCombinadas(config, institucional));
      aplicarMenu(config);
      aplicarInstitucionEnFooter(institucional, config);
      aplicarPie(institucional, config);
      aplicarPortada(config, institucional);
      aplicarPaginaQuienes(institucional);
      aplicarPaginaContacto(institucional, config);
      aplicarJsonLd(institucional, config);
    } catch (error) {
      // Respaldo silencioso: se conserva el contenido estático de la página.
      if (window.console && console.warn) {
        console.warn('[San Juan] No se pudo aplicar la configuración del sitio:', error.message);
      }
    } finally {
      ocultarIndicadorCarga();
      ejecutando = false;
    }
  }

  window.sanjuanSitio = {
    recargar: function () {
      try {
        window.localStorage.removeItem(CACHE_KEY);
      } catch (error) {
        // Almacenamiento no disponible.
      }
      return iniciar();
    }
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', iniciar);
  } else {
    iniciar();
  }
})();
