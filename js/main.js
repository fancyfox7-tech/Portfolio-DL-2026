// Nav: sticky backdrop blur on scroll
const nav = document.querySelector('nav');
window.addEventListener('scroll', () => {
  nav?.classList.toggle('scrolled', window.scrollY > 10);
});

// ─── Mobile nav menu ───
(function () {
  const btn  = document.getElementById('mobile-menu-btn');
  const menu = document.getElementById('mobile-menu');
  if (!btn || !menu) return;

  function openMenu() {
    menu.classList.remove('hidden');
    menu.classList.add('flex');
    btn.setAttribute('aria-expanded', 'true');
  }

  function closeMenu() {
    menu.classList.add('hidden');
    menu.classList.remove('flex');
    btn.setAttribute('aria-expanded', 'false');
  }

  btn.addEventListener('click', () => {
    const isOpen = btn.getAttribute('aria-expanded') === 'true';
    isOpen ? closeMenu() : openMenu();
  });

  menu.querySelectorAll('a').forEach(a => a.addEventListener('click', closeMenu));

  document.addEventListener('click', e => {
    if (btn.getAttribute('aria-expanded') === 'true' && !menu.contains(e.target) && !btn.contains(e.target)) {
      closeMenu();
    }
  });

  document.addEventListener('keydown', e => {
    if (e.key === 'Escape' && btn.getAttribute('aria-expanded') === 'true') closeMenu();
  });

  window.addEventListener('resize', () => {
    if (window.innerWidth >= 640) closeMenu();
  });
})();

// ─── CV Preview Modal ───
(function () {
  const modal    = document.getElementById('cv-modal');
  const backdrop = document.getElementById('cv-backdrop');
  const card     = document.getElementById('cv-card');
  const closeBtn = document.getElementById('cv-close');
  if (!modal) return;

  function openModal(e) {
    e.preventDefault();
    modal.classList.remove('opacity-0', 'pointer-events-none');
    // Slight delay lets the opacity transition start before the card moves
    requestAnimationFrame(() => {
      card.classList.remove('translate-y-4', 'opacity-0');
    });
    document.body.style.overflow = 'hidden';
  }

  function closeModal() {
    card.classList.add('translate-y-4', 'opacity-0');
    modal.classList.add('opacity-0');
    setTimeout(() => {
      modal.classList.add('pointer-events-none');
      document.body.style.overflow = '';
    }, 300);
  }

  document.querySelectorAll('.cv-trigger').forEach(el => {
    el.addEventListener('click', openModal);
  });
  backdrop.addEventListener('click', closeModal);
  closeBtn.addEventListener('click', closeModal);
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape' && !modal.classList.contains('pointer-events-none')) {
      closeModal();
    }
  });
})();
