// Navegación principal, menú móvil, submenús, header y año del footer.
document.addEventListener('DOMContentLoaded', () => {
  const toggle = document.getElementById('navToggle');
  const nav = document.getElementById('mainNav');
  const header = document.querySelector('.header');

  function closeMenu() {
    if (!nav || !toggle) return;
    nav.classList.remove('nav--open');
    toggle.classList.remove('nav__toggle--active');
    toggle.setAttribute('aria-expanded', 'false');
    nav.querySelectorAll('.nav__dropdown').forEach((item) => {
      item.classList.remove('nav__dropdown--open');
      const trigger = item.querySelector('.nav__dropdown-trigger');
      if (trigger) trigger.setAttribute('aria-expanded', 'false');
    });
  }

  if (toggle && nav) {
    toggle.addEventListener('click', () => {
      const isOpen = nav.classList.toggle('nav--open');
      toggle.classList.toggle('nav__toggle--active', isOpen);
      toggle.setAttribute('aria-expanded', String(isOpen));
      toggle.setAttribute('aria-label', isOpen ? 'Cerrar menú de navegación' : 'Abrir menú de navegación');
    });

    nav.querySelectorAll('.nav__dropdown').forEach((dropdown) => {
      const trigger = dropdown.querySelector('.nav__dropdown-trigger, .nav__link');
      if (!trigger) return;
      trigger.addEventListener('click', (event) => {
        const isSmall = window.matchMedia('(max-width: 900px)').matches;
        if (isSmall || trigger.tagName === 'BUTTON') {
          event.preventDefault();
          const isOpen = dropdown.classList.toggle('nav__dropdown--open');
          trigger.setAttribute('aria-expanded', String(isOpen));
        }
      });
    });

    nav.querySelectorAll('a').forEach((link) => {
      link.addEventListener('click', () => {
        if (window.matchMedia('(max-width: 900px)').matches) closeMenu();
      });
    });

    document.addEventListener('click', (event) => {
      if (!nav.contains(event.target) && !toggle.contains(event.target)) closeMenu();
    });
    document.addEventListener('keydown', (event) => {
      if (event.key === 'Escape') {
        closeMenu();
        toggle.focus();
      }
    });
    window.addEventListener('resize', () => {
      if (window.matchMedia('(min-width: 901px)').matches) closeMenu();
    }, { passive: true });
  }

  if (header) {
    let scheduled = false;
    const updateHeader = () => {
      header.classList.toggle('header--scrolled', window.scrollY > 16);
      scheduled = false;
    };
    window.addEventListener('scroll', () => {
      if (!scheduled) {
        window.requestAnimationFrame(updateHeader);
        scheduled = true;
      }
    }, { passive: true });
    updateHeader();
  }

  const year = document.getElementById('currentYear');
  if (year) year.textContent = String(new Date().getFullYear());
});
