// Nav: sticky backdrop blur on scroll
const nav = document.querySelector('nav');
window.addEventListener('scroll', () => {
  nav?.classList.toggle('scrolled', window.scrollY > 10);
});

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
