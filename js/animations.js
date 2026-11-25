// Animaciones discretas. Motion se carga bajo demanda; CSS mantiene el fallback.
const revealItems = document.querySelectorAll('.institution-intro__visual, .institution-intro__copy, .quicklink, .resource-card, .section-header');
revealItems.forEach((item) => item.classList.add('reveal'));

if ('IntersectionObserver' in window) {
  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-visible');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12, rootMargin: '0px 0px -30px 0px' });
  revealItems.forEach((item) => observer.observe(item));
} else {
  revealItems.forEach((item) => item.classList.add('is-visible'));
}

// Motion se usa solo si el módulo está disponible; cualquier fallo conserva el sitio funcional.
if (!window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
  import('https://cdn.jsdelivr.net/npm/motion@14.14.0/+esm')
    .then(({ inView, animate }) => {
      if (typeof inView !== 'function' || typeof animate !== 'function') return;
      inView('.hero__content', () => {
        animate('.hero__content', { opacity: [0, 1], y: [18, 0] }, { duration: .65, ease: 'easeOut' });
      }, { once: true });
    })
    .catch(() => { /* La animación CSS sigue disponible. */ });
}
