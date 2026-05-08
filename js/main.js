/* ============================================================
   Igreja Evangélica Congregacional de Pombal — main.js
   ============================================================ */

document.addEventListener('DOMContentLoaded', () => {

  /* ── Navbar scroll effect ──────────────────────────────── */
  const navbar = document.querySelector('.navbar');
  if (navbar) {
    window.addEventListener('scroll', () => {
      navbar.classList.toggle('scrolled', window.scrollY > 40);
    }, { passive: true });
  }

  /* ── Mobile nav toggle ─────────────────────────────────── */
  const toggle = document.querySelector('.nav-toggle');
  const navMenu = document.querySelector('.navbar-nav');

  if (toggle && navMenu) {
    toggle.addEventListener('click', () => {
      const open = navMenu.classList.toggle('open');
      toggle.classList.toggle('open', open);
      toggle.setAttribute('aria-expanded', open);
      document.body.style.overflow = open ? 'hidden' : '';
    });

    navMenu.querySelectorAll('a').forEach(link => {
      link.addEventListener('click', () => {
        navMenu.classList.remove('open');
        toggle.classList.remove('open');
        toggle.setAttribute('aria-expanded', 'false');
        document.body.style.overflow = '';
      });
    });

    document.addEventListener('click', e => {
      if (!navbar.contains(e.target) && navMenu.classList.contains('open')) {
        navMenu.classList.remove('open');
        toggle.classList.remove('open');
        document.body.style.overflow = '';
      }
    });
  }

  /* ── Active nav link ───────────────────────────────────── */
  const current = location.pathname.split('/').pop() || 'index.html';
  document.querySelectorAll('.navbar-nav a').forEach(a => {
    const href = a.getAttribute('href');
    if (href === current || (current === '' && href === 'index.html')) {
      a.classList.add('active');
    }
  });

  /* ── Fade-up on scroll (IntersectionObserver) ──────────── */
  const fadeEls = document.querySelectorAll('.fade-up');
  if (fadeEls.length) {
    const io = new IntersectionObserver(entries => {
      entries.forEach(e => {
        if (e.isIntersecting) {
          e.target.classList.add('visible');
          io.unobserve(e.target);
        }
      });
    }, { threshold: 0.12 });
    fadeEls.forEach(el => io.observe(el));
  }

  /* ── Gallery Lightbox ──────────────────────────────────── */
  const lightbox    = document.getElementById('lightbox');
  const lbImg       = document.getElementById('lightbox-img');
  const lbClose     = document.getElementById('lightbox-close');
  const lbPrev      = document.getElementById('lightbox-prev');
  const lbNext      = document.getElementById('lightbox-next');
  const galItems    = document.querySelectorAll('.gallery-item');

  if (lightbox && galItems.length) {
    let current = 0;

    function openLightbox(index) {
      current = index;
      const item = galItems[index];
      const img = item.querySelector('img');
      const placeholder = item.querySelector('.gal-placeholder');

      if (img) {
        lbImg.src = img.src;
        lbImg.alt = img.alt || '';
      } else if (placeholder) {
        lbImg.src = '';
        lbImg.style.display = 'none';
        lightbox.querySelector('.lightbox-placeholder')?.remove();
        const ph = placeholder.cloneNode(true);
        ph.className = 'lightbox-placeholder';
        ph.style.cssText = 'width:320px;height:320px;border-radius:12px;font-size:5rem;display:flex;align-items:center;justify-content:center;';
        lightbox.querySelector('.lightbox-content').appendChild(ph);
      }
      if (img) lbImg.style.display = '';
      lightbox.classList.add('open');
      document.body.style.overflow = 'hidden';
    }

    function closeLightbox() {
      lightbox.classList.remove('open');
      document.body.style.overflow = '';
    }

    function navigate(dir) {
      current = (current + dir + galItems.length) % galItems.length;
      openLightbox(current);
    }

    galItems.forEach((item, i) => {
      item.addEventListener('click', () => openLightbox(i));
    });

    lbClose?.addEventListener('click', closeLightbox);
    lbPrev?.addEventListener('click', () => navigate(-1));
    lbNext?.addEventListener('click', () => navigate(1));

    lightbox.addEventListener('click', e => {
      if (e.target === lightbox) closeLightbox();
    });

    document.addEventListener('keydown', e => {
      if (!lightbox.classList.contains('open')) return;
      if (e.key === 'Escape') closeLightbox();
      if (e.key === 'ArrowLeft') navigate(-1);
      if (e.key === 'ArrowRight') navigate(1);
    });
  }

  /* ── Sermon filter buttons ─────────────────────────────── */
  const filterBtns = document.querySelectorAll('.filter-btn');
  const sermonCards = document.querySelectorAll('.sermon-card');

  if (filterBtns.length && sermonCards.length) {
    filterBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        filterBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        const cat = btn.dataset.filter;
        sermonCards.forEach(card => {
          const show = cat === 'todos' || card.dataset.category === cat;
          card.style.display = show ? '' : 'none';
          card.style.animation = show ? 'fadeIn .3s ease' : '';
        });
      });
    });
  }

  /* ── Contact form submission ────────────────────────────── */
  const contactForm = document.getElementById('contact-form');
  if (contactForm) {
    contactForm.addEventListener('submit', e => {
      e.preventDefault();
      const success = document.getElementById('form-success');
      if (success) {
        contactForm.style.display = 'none';
        success.style.display = 'block';
      }
    });
  }

  /* ── Visit form submission ──────────────────────────────── */
  const visitForm = document.getElementById('visit-form');
  if (visitForm) {
    visitForm.addEventListener('submit', e => {
      e.preventDefault();
      const success = document.getElementById('visit-success');
      if (success) {
        visitForm.style.display = 'none';
        success.style.display = 'block';
      }
    });
  }

  /* ── Smooth scroll for anchor links ────────────────────── */
  document.querySelectorAll('a[href^="#"]').forEach(a => {
    a.addEventListener('click', e => {
      const target = document.querySelector(a.getAttribute('href'));
      if (target) {
        e.preventDefault();
        const offset = parseInt(getComputedStyle(document.documentElement)
          .getPropertyValue('--nav-h')) || 72;
        const top = target.getBoundingClientRect().top + window.scrollY - offset - 16;
        window.scrollTo({ top, behavior: 'smooth' });
      }
    });
  });

});
