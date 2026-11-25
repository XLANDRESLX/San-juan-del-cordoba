# Genera páginas de artículo dinamicas (shell + plantilla compartida) a partir de la plantilla existente.
import io
import re

TEMPLATE = r"C:\Users\ANDRES ECHEVERRIA\Documents\web-Sanjuan\articulos\admision-2027.html"
OUT = r"C:\Users\ANDRES ECHEVERRIA\Documents\web-Sanjuan\articulos"

SRC = open(TEMPLATE, encoding="utf-8").read()

COMENTARIOS_MARK = "    <!-- Comentarios -->"

SCRIPT_BLOCK = (
    "  <script src=\"/js/main.js?v=6.0.0\"></script>\n"
    "  <script src=\"/js/sitio-config.js?v=6.0.0\"></script>\n"
    "  <script src=\"/js/api.js?v=7.0.0\"></script>\n"
    "  <script src=\"/js/articulo.js?v=7.0.0\"></script>\n"
    "  <script>\n"
    "    document.addEventListener('DOMContentLoaded', function () {\n"
    "      var partes = window.location.pathname.split('/').filter(Boolean);\n"
    "      var archivo = partes[partes.length - 1] || '';\n"
    "      var slug = archivo.replace('.html', '');\n"
    "      if (window.sanjuanArticulo && window.sanjuanArticulo.cargarArticulo) {\n"
    "        window.sanjuanArticulo.cargarArticulo(slug);\n"
    "      }\n"
    "    });\n"
    "  </script>\n"
    "  <script src=\"/js/comentarios.js?v=7.0.0\"></script>\n"
)


def build(slug, titulo, cat_slug, cat_label, art_id, resumen):
    s = SRC

    # --- Title ---
    s = s.replace("<title>Proceso de admisión 2027 – IE San Juan del Córdoba</title>",
                  "<title>" + titulo + " – IE San Juan del Córdoba</title>")
    # --- Meta description ---
    s = re.sub(r'<meta name="description" content="[^"]*">',
               '<meta name="description" content="' + resumen + '">', s, count=1)
    # --- Canonical ---
    s = s.replace('https://web-sanjuan.github.io/articulos/admision-2027.html',
                  'https://web-sanjuan.github.io/articulos/' + slug + '.html')
    # --- OG ---
    s = s.replace('content="Proceso de admisión 2027 – IE San Juan del Córdoba">',
                  'content="' + titulo + '">')
    s = re.sub(r'<meta property="og:description" content="[^"]*">',
               '<meta property="og:description" content="' + resumen + '">', s, count=1)
    s = s.replace('content="https://web-sanjuan.github.io/articulos/admision-2027.html">',
                  'content="https://web-sanjuan.github.io/articulos/' + slug + '.html">')
    s = s.replace('content="https://web-sanjuan.github.io/assets/img/articulos/admision-2027.jpg">',
                  'content="https://web-sanjuan.github.io/assets/img/articulos/' + slug + '.jpg">')
    # --- JSON-LD ---
    s = s.replace('"headline": "Proceso de admisión 2027 – IE San Juan del Córdoba",',
                  '"headline": "' + titulo + '",')
    s = s.replace('"image": "https://web-sanjuan.github.io/assets/img/articulos/admision-2027.jpg"',
                  '"image": "https://web-sanjuan.github.io/assets/img/articulos/' + slug + '.jpg"')

    # --- Breadcrumb + articulo-root swap ---
    inicio = s.index("    <nav class=\"breadcrumbs\"")
    fin = s.index(COMENTARIOS_MARK)
    nuevo_bloque = (
        "    <nav class=\"breadcrumbs\" aria-label=\"Ruta de navegación\">\n"
        "      <ol>\n"
        "        <li><a href=\"/\">Inicio</a></li>\n"
        "        <li><a href=\"/categorias/" + cat_slug + ".html\">" + cat_label + "</a></li>\n"
        "        <li>" + titulo + "</li>\n"
        "      </ol>\n"
        "    </nav>\n"
        "\n"
        "    <div id=\"articulo-root\"></div>\n"
        "\n"
    )
    s = s[:inicio] + nuevo_bloque + s[fin:]

    # --- articulo_id del formulario de comentarios ---
    s = s.replace('<input type="hidden" name="articulo_id" value="2">',
                  '<input type="hidden" name="articulo_id" value="' + str(art_id) + '">')

    # --- Reemplazar bloque de scripts por la plantilla de articulo + comentarios ---
    inicio_script = s.index('  <script src="/js/main.js?v=6.0.0"></script>')
    fin_script = s.index("</body>")
    s = s[:inicio_script] + SCRIPT_BLOCK + s[fin_script:]

    # --- Corregir rutas absolutas de imagenes (autores y articulos) ---
    s = s.replace('src="assets/', 'src="/assets/')

    return s


items = [
    # slug, titulo, categoria(slug), label, articulo_id, resumen
    ("jornada-siembra-arboles", "Jornada de siembra de árboles en el barrio San José", "actividades", "Actividades", 3, "Jornada de siembra de árboles en el barrio San José"),
    ("guias-fracciones-grado-5", "Guía de estudio: Fracciones para grado 5°", "educativo", "Educativo", 4, "Guía de estudio: Fracciones para grado 5°"),
    ("feria-libro-2026", "Feria del Libro Escolar 2026", "actividades", "Actividades", 5, "Feria del Libro Escolar 2026"),
    ("concurso-oratoria-municipal", "Concurso de Oratoria Municipal", "noticias", "Noticias", 6, "Concurso de Oratoria Municipal"),
    ("tips-medio-ambiente-casa", "Tips para el cuidado del medio ambiente en casa", "educativo", "Educativo", 7, "Tips para el cuidado del medio ambiente en casa"),
    ("dia-familia-escolar", "Día de la Familia Escolar", "actividades", "Actividades", 8, "Día de la Familia Escolar"),
    ("clases-refuerzo-matematicas", "Clases de refuerzo de matemáticas", "educativo", "Educativo", 9, "Clases de refuerzo de matemáticas"),
    ("visita-museo-caribe", "Visita al Museo del Caribe", "actividades", "Actividades", 10, "Visita al Museo del Caribe"),
]

for slug, titulo, cat_slug, cat_label, art_id, resumen in items:
    contenido = build(slug, titulo, cat_slug, cat_label, art_id, resumen)
    with io.open(OUT + "/" + slug + ".html", "w", encoding="utf-8") as f:
        f.write(contenido)
    print("generado:", slug)
