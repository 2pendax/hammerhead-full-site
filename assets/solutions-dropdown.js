document.addEventListener('DOMContentLoaded', () => {
  const menus = [...document.querySelectorAll('.solutions-menu')];
  for (const menu of menus) {
    const trigger = menu.querySelector('.solutions-trigger');
    if (!trigger) continue;
    trigger.addEventListener('click', event => {
      event.stopPropagation();
      const opening = !menu.classList.contains('is-open');
      for (const other of menus) {
        other.classList.remove('is-open');
        other.querySelector('.solutions-trigger')?.setAttribute('aria-expanded', 'false');
      }
      menu.classList.toggle('is-open', opening);
      trigger.setAttribute('aria-expanded', String(opening));
    });
  }
  document.addEventListener('click', () => {
    for (const menu of menus) {
      menu.classList.remove('is-open');
      menu.querySelector('.solutions-trigger')?.setAttribute('aria-expanded', 'false');
    }
  });
  document.addEventListener('keydown', event => {
    if (event.key !== 'Escape') return;
    for (const menu of menus) {
      menu.classList.remove('is-open');
      menu.querySelector('.solutions-trigger')?.setAttribute('aria-expanded', 'false');
    }
  });
});
