/* Lucide progressive enhancement with a tiny SVG fallback if the CDN is offline. */
(function () {
  'use strict';
  const paths = {
    'arrow-right':'<path d="M5 12h14M12 5l7 7-7 7"/>',
    'arrow-up-right':'<path d="M7 17 17 7M7 7h10v10"/>',
    'chevron-down':'<path d="m6 9 6 6 6-6"/>',
    'menu':'<path d="M4 6h16M4 12h16M4 18h16"/>',
    'map-pin':'<path d="M20 10c0 5-8 11-8 11S4 15 4 10a8 8 0 1 1 16 0Z"/><circle cx="12" cy="10" r="2.5"/>',
    'mail':'<rect x="3" y="5" width="18" height="14" rx="2"/><path d="m3 7 9 6 9-6"/>',
    'landmark':'<path d="m3 10 9-7 9 7M4 10h16M6 10v9m4-9v9m4-9v9m4-9v9M3 21h18"/>',
    'school':'<path d="m3 10 9-7 9 7M5 10v10h14V10M9 20v-6h6v6"/>',
    'newspaper':'<rect x="3" y="4" width="18" height="16" rx="2"/><path d="M7 8h5v5H7zM15 8h3M15 12h3M7 17h11"/>',
    'images':'<rect x="3" y="3" width="14" height="14" rx="2"/><path d="m17 9 4 2v9H7l-1-4M7 13l3-3 5 5"/>',
    'message-circle':'<path d="M21 11.5a8.5 8.5 0 0 1-8.5 8.5 9 9 0 0 1-4-.9L3 21l1.9-5.5a9 9 0 0 1-.9-4A8.5 8.5 0 0 1 12.5 3h.5a8.5 8.5 0 0 1 8 8z"/>',
    'heart-handshake':'<path d="m12 8 2-2a4 4 0 0 1 6 6l-8 8-8-8a4 4 0 0 1 6-6l2 2Z"/><path d="m8 12 2 2 4-4"/>',
    'book-open':'<path d="M12 7v14M3 5a2 2 0 0 1 2-2h3a4 4 0 0 1 4 4 4 4 0 0 1 4-4h3a2 2 0 0 1 2 2v13h-5a4 4 0 0 0-4 3 4 4 0 0 0-4-3H3z"/>',
    'users':'<path d="M16 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2M10 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8ZM20 8v6m3-3h-6"/>',
    'map-pinned':'<path d="M20 10c0 5-8 11-8 11S4 15 4 10a8 8 0 1 1 16 0Z"/><circle cx="12" cy="10" r="2.5"/>',
    'building-2':'<path d="M3 21h18M5 21V5l7-3 7 3v16M9 9h1m4 0h1M9 13h1m4 0h1M10 21v-4h4v4"/>',
    'file-text':'<path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8zM14 2v6h6M8 13h8M8 17h8"/>',
    'shield-check':'<path d="M12 22s8-4 8-11V5l-8-3-8 3v6c0 7 8 11 8 11Z"/><path d="m9 12 2 2 4-4"/>',
    'camera':'<path d="M14 5 12 3H8L6 5H4a2 2 0 0 0-2 2v11a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2z"/><circle cx="12" cy="12" r="3"/>',
    'info':'<circle cx="12" cy="12" r="10"/><path d="M12 16v-4m0-4h.01"/>',
    'image':'<rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><path d="m21 15-5-5L5 21"/>',
    'cloud-off':'<path d="m2 2 20 20M5 5.5A7 7 0 0 1 19 9a4 4 0 0 1 1 7.9M5 9a4 4 0 0 0 0 8h10"/>',
    'target':'<circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="2"/>',
    'eye':'<path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12Z"/><circle cx="12" cy="12" r="3"/>',
    'gem':'<path d="M6 3h12l4 6-10 13L2 9Z"/><path d="M11 3 8 9l4 13 4-13-3-6M2 9h20"/>',
    'arrow-down':'<path d="M12 5v14m-7-7 7 7 7-7"/>'
  };
  function fallback() {
    document.querySelectorAll('[data-lucide]').forEach(el=>{
      if(el.querySelector('svg')) return;
      const name=el.getAttribute('data-lucide');
      if(!paths[name]) return;
      const svg=document.createElementNS('http://www.w3.org/2000/svg','svg');
      svg.setAttribute('viewBox','0 0 24 24');svg.setAttribute('width','1em');svg.setAttribute('height','1em');
      svg.setAttribute('fill','none');svg.setAttribute('stroke','currentColor');svg.setAttribute('stroke-width','1.8');svg.setAttribute('stroke-linecap','round');svg.setAttribute('stroke-linejoin','round');svg.setAttribute('aria-hidden','true');
      svg.innerHTML=paths[name];el.appendChild(svg);
    });
  }
  function render(){if(window.lucide&&typeof window.lucide.createIcons==='function'){window.lucide.createIcons({attrs:{'stroke-width':1.8}});}else fallback();}
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',render,{once:true});else render();
  window.addEventListener('load',render,{once:true});
})();
