/* ============================================
   Fútbol App — Main JavaScript
   ============================================ */

document.addEventListener('DOMContentLoaded', () => {
  initNavbar();
  initMobileMenu();
  initScrollReveal();
  initCounters();
  initSmoothScroll();
});

/* ---------- Navbar scroll effect ---------- */
function initNavbar() {
  const navbar = document.querySelector('.navbar');
  if (!navbar) return;

  const onScroll = () => {
    if (window.scrollY > 50) {
      navbar.classList.add('scrolled');
    } else {
      navbar.classList.remove('scrolled');
    }
  };

  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll(); // Initial check
}

/* ---------- Mobile menu ---------- */
function initMobileMenu() {
  const toggle = document.querySelector('.menu-toggle');
  const navLinks = document.querySelector('.nav-links');
  if (!toggle || !navLinks) return;

  toggle.addEventListener('click', () => {
    toggle.classList.toggle('active');
    navLinks.classList.toggle('open');
    document.body.style.overflow = navLinks.classList.contains('open') ? 'hidden' : '';
  });

  // Close menu when clicking a link
  navLinks.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', () => {
      toggle.classList.remove('active');
      navLinks.classList.remove('open');
      document.body.style.overflow = '';
    });
  });

  // Close menu when clicking outside
  document.addEventListener('click', (e) => {
    if (!toggle.contains(e.target) && !navLinks.contains(e.target) && navLinks.classList.contains('open')) {
      toggle.classList.remove('active');
      navLinks.classList.remove('open');
      document.body.style.overflow = '';
    }
  });
}

/* ---------- Scroll reveal animations ---------- */
function initScrollReveal() {
  const revealElements = document.querySelectorAll('.reveal');
  if (revealElements.length === 0) return;

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          observer.unobserve(entry.target); // Only animate once
        }
      });
    },
    {
      threshold: 0.1,
      rootMargin: '0px 0px -50px 0px'
    }
  );

  revealElements.forEach(el => observer.observe(el));
}

/* ---------- Animated counters ---------- */
function initCounters() {
  const counters = document.querySelectorAll('[data-count]');
  if (counters.length === 0) return;

  const animateCounter = (el) => {
    const target = parseInt(el.getAttribute('data-count'), 10);
    const suffix = el.getAttribute('data-suffix') || '';
    const prefix = el.getAttribute('data-prefix') || '';
    const duration = 2000;
    const startTime = performance.now();

    function update(currentTime) {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);

      // Ease out cubic
      const eased = 1 - Math.pow(1 - progress, 3);
      const current = Math.floor(eased * target);

      el.textContent = prefix + current.toLocaleString('es-PE') + suffix;

      if (progress < 1) {
        requestAnimationFrame(update);
      } else {
        el.textContent = prefix + target.toLocaleString('es-PE') + suffix;
      }
    }

    requestAnimationFrame(update);
  };

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          animateCounter(entry.target);
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.3 }
  );

  counters.forEach(el => observer.observe(el));
}

/* ---------- Smooth scroll ---------- */
function initSmoothScroll() {
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', (e) => {
      const targetId = anchor.getAttribute('href');
      if (targetId === '#') return;

      const targetEl = document.querySelector(targetId);
      if (!targetEl) return;

      e.preventDefault();
      targetEl.scrollIntoView({ behavior: 'smooth' });
    });
  });
}

/* ---------- Modal functions ---------- */
function openModal(e) {
  if (e) {
    e.preventDefault();
  }
  const modal = document.getElementById('registerModal');
  if (modal) {
    modal.classList.add('active');
    document.body.style.overflow = 'hidden';
  }
}

function closeModal() {
  const modal = document.getElementById('registerModal');
  if (modal) {
    modal.classList.remove('active');
    document.body.style.overflow = '';
  }
}

/* ---------- Form handling ---------- */
function handleRegister(e) {
  e.preventDefault();
  
  const form = e.target;
  const nombre = form.querySelector('#nombre').value;
  const celular = form.querySelector('#celular').value;
  const torneo = form.querySelector('#torneo').value;
  const plan = form.querySelector('#planSeleccionado').value;
  
  if (!nombre || !celular || !torneo) {
    alert('Por favor completa todos los campos requeridos');
    return;
  }
  
  if (celular.length !== 9 || !/^[0-9]+$/.test(celular)) {
    alert('Por favor ingresa un número de celular válido (9 dígitos)');
    return;
  }
  
  const step1 = document.getElementById('modalStep1');
  const step2 = document.getElementById('modalStep2');
  if (step1 && step2) {
    step1.style.display = 'none';
    step2.style.display = 'block';
    
    document.getElementById('torneoNombre').textContent = torneo;
    document.getElementById('summaryTorneo').textContent = torneo;
    document.getElementById('summaryCelular').textContent = `+51 ${celular.substring(0, 3)} ${celular.substring(3, 6)} ${celular.substring(6)}`;
    
    const equipos = form.querySelector('#equipos').value;
    const formato = form.querySelector('#formato').value;
    document.getElementById('summaryEquipos').textContent = equipos;
    document.getElementById('summaryFormato').textContent = formato === 'liga' ? 'Liga (todos contra todos)' : formato === 'grupos' ? 'Fase de grupos' : 'Eliminación directa';
    
    const whatsappLink = document.getElementById('whatsappLink');
    if (whatsappLink) {
      whatsappLink.href = `https://wa.me/51936400532?text=Hola,%20he%20creado%20mi%20torneo%20%22${encodeURIComponent(torneo)}%22%20con%20${equipos}%20equipos.%20%F0%9F%91%89`;
    }
  }
}

