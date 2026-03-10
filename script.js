// ── THEME TOGGLE ──
const html = document.documentElement;
const themeBtn = document.getElementById('theme-toggle');

function applyTheme(theme) {
  html.setAttribute('data-theme', theme);
  themeBtn.textContent = theme === 'dark' ? '☀️' : '🌙';
  themeBtn.setAttribute('aria-label', theme === 'dark' ? '切換亮色模式' : '切換深色模式');
  localStorage.setItem('theme', theme);
}

// Apply saved theme on load
const savedTheme = localStorage.getItem('theme') || 'light';
applyTheme(savedTheme);

themeBtn.addEventListener('click', () => {
  const current = html.getAttribute('data-theme');
  applyTheme(current === 'dark' ? 'light' : 'dark');
});

// ── TOC SMOOTH SCROLL ──
document.querySelectorAll('.toc-link, #mobile-toc-menu a').forEach(link => {
  link.addEventListener('click', e => {
    e.preventDefault();
    const target = document.querySelector(link.getAttribute('href'));
    if (target) {
      const isMobile = window.innerWidth < 900;
      const offset = isMobile ? 70 : 0;
      const top = target.getBoundingClientRect().top + window.scrollY - offset - 24;
      window.scrollTo({ top, behavior: 'smooth' });
    }
    // Close mobile menu
    if (link.closest('#mobile-toc-menu')) {
      document.getElementById('mobile-toc-menu').classList.remove('open');
      document.getElementById('mobile-toc-toggle').classList.remove('open');
    }
  });
});

// ── ACTIVE TOC on SCROLL ──
const sections = document.querySelectorAll('section[id]');
const tocLinks = document.querySelectorAll('.toc-link');

const sectionObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      const id = entry.target.id;
      tocLinks.forEach(link => {
        link.classList.toggle('active', link.getAttribute('href') === '#' + id);
      });
    }
  });
}, { rootMargin: '-20% 0px -70% 0px', threshold: 0 });

sections.forEach(s => sectionObserver.observe(s));

// ── MOBILE TOC TOGGLE ──
const mobileToggleBtn = document.getElementById('mobile-toc-toggle');
const mobileTocHeader = document.querySelector('.mobile-toc-header');
const mobileTocMenu = document.getElementById('mobile-toc-menu');

function toggleMobileMenu() {
  const isOpen = mobileTocMenu.classList.toggle('open');
  mobileToggleBtn.classList.toggle('open', isOpen);
  mobileToggleBtn.setAttribute('aria-label', isOpen ? '收起目錄' : '展開目錄');
}

mobileToggleBtn.addEventListener('click', (e) => {
  e.stopPropagation();
  toggleMobileMenu();
});

mobileTocHeader.addEventListener('click', toggleMobileMenu);

// ── FRAMEWORK DIAGRAM — CLONE & RIGHT PANEL ──
const diagram = document.getElementById('framework-diagram');
const rightPanel = document.getElementById('right-panel');
const rightHint = rightPanel.querySelector('.right-panel-hint');

// Inject clone into right panel (before the hint)
const clone = diagram.cloneNode(true);
clone.id = ''; // remove id from clone
clone.setAttribute('aria-hidden', 'true');
rightPanel.insertBefore(clone, rightHint);

// Mobile FAB
const mobileFab = document.getElementById('mobile-diagram-fab');

// Show/hide right panel (desktop) and mobile FAB based on diagram scroll position
const diagramObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (!entry.isIntersecting && entry.boundingClientRect.top < 0) {
      // Diagram has been scrolled past (above viewport)
      rightPanel.classList.add('visible');
      if (mobileFab) mobileFab.classList.add('visible');
    } else {
      // Diagram is visible or below viewport
      rightPanel.classList.remove('visible');
      if (mobileFab) mobileFab.classList.remove('visible');
    }
  });
}, { threshold: 0 });

diagramObserver.observe(diagram);

// Mobile FAB opens lightbox
if (mobileFab) mobileFab.addEventListener('click', openLightbox);

// ── LIGHTBOX ──
const lightbox = document.getElementById('lightbox');
const lightboxContent = document.getElementById('lightbox-content');
const lightboxClose = document.getElementById('lightbox-close');
const lightboxBackdrop = document.getElementById('lightbox-backdrop');

function openLightbox() {
  // Build full-size clone
  const existing = lightboxContent.querySelector('.framework-diagram');
  if (existing) existing.remove();
  const fullClone = diagram.cloneNode(true);
  fullClone.id = '';
  fullClone.style.cursor = 'default';
  fullClone.setAttribute('aria-hidden', 'true');
  lightboxContent.appendChild(fullClone);

  lightbox.classList.add('open');
  document.body.style.overflow = 'hidden';
  lightboxClose.focus();
}

function closeLightbox() {
  lightbox.classList.remove('open');
  document.body.style.overflow = '';
}

// Click on original diagram or its clone in right panel
diagram.addEventListener('click', openLightbox);
clone.addEventListener('click', openLightbox);

lightboxClose.addEventListener('click', closeLightbox);
lightboxBackdrop.addEventListener('click', closeLightbox);

document.addEventListener('keydown', e => {
  if (e.key === 'Escape' && lightbox.classList.contains('open')) {
    closeLightbox();
  }
});

// Trap focus in lightbox
lightbox.addEventListener('keydown', e => {
  if (e.key === 'Tab') {
    const focusable = lightbox.querySelectorAll('button, [tabindex]');
    const first = focusable[0];
    const last = focusable[focusable.length - 1];
    if (e.shiftKey && document.activeElement === first) {
      e.preventDefault();
      last.focus();
    } else if (!e.shiftKey && document.activeElement === last) {
      e.preventDefault();
      first.focus();
    }
  }
});

