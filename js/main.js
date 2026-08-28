/* ============================================================
   ICIQSI 2027 — Main JavaScript
   Full-page scroll-snap with page indicators & nav sync
   ============================================================ */

document.addEventListener('DOMContentLoaded', () => {
  initParticles();
  initNavbar();
  initScrollReveal();
  initTrackCards();
  initCommitteeTabs();
  initPageNavigation();
  initCountUp();
  buildPageDots();
  buildScrollIndicator();
});

/* ---------- Particle Canvas ---------- */
function initParticles() {
  const canvas = document.getElementById('particle-canvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  let width, height, particles, animFrame;

  function resize() {
    width = canvas.width = canvas.parentElement.offsetWidth;
    height = canvas.height = canvas.parentElement.offsetHeight;
  }

  class Particle {
    constructor() {
      this.reset();
    }
    reset() {
      this.x = Math.random() * width;
      this.y = Math.random() * height;
      this.size = Math.random() * 2 + 0.5;
      this.speedX = (Math.random() - 0.5) * 0.4;
      this.speedY = (Math.random() - 0.5) * 0.4;
      this.opacity = Math.random() * 0.5 + 0.1;
      this.hue = Math.random() > 0.5 ? 190 : 260; // cyan or violet
    }
    update() {
      this.x += this.speedX;
      this.y += this.speedY;
      if (this.x < 0 || this.x > width) this.speedX *= -1;
      if (this.y < 0 || this.y > height) this.speedY *= -1;
    }
    draw() {
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
      ctx.fillStyle = `hsla(${this.hue}, 80%, 60%, ${this.opacity})`;
      ctx.fill();
    }
  }

  function initParticleArray() {
    const count = Math.min(Math.floor((width * height) / 8000), 120);
    particles = [];
    for (let i = 0; i < count; i++) {
      particles.push(new Particle());
    }
  }

  function drawConnections() {
    for (let i = 0; i < particles.length; i++) {
      for (let j = i + 1; j < particles.length; j++) {
        const dx = particles[i].x - particles[j].x;
        const dy = particles[i].y - particles[j].y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < 120) {
          const opacity = (1 - dist / 120) * 0.15;
          ctx.beginPath();
          ctx.moveTo(particles[i].x, particles[i].y);
          ctx.lineTo(particles[j].x, particles[j].y);
          ctx.strokeStyle = `rgba(0, 180, 216, ${opacity})`;
          ctx.lineWidth = 0.5;
          ctx.stroke();
        }
      }
    }
  }

  function animate() {
    ctx.clearRect(0, 0, width, height);
    particles.forEach(p => {
      p.update();
      p.draw();
    });
    drawConnections();
    animFrame = requestAnimationFrame(animate);
  }

  resize();
  initParticleArray();
  animate();
  window.addEventListener('resize', () => {
    resize();
    initParticleArray();
  });
}

/* ---------- Navbar Scroll Effect ---------- */
function initNavbar() {
  const navbar = document.querySelector('.navbar');
  const toggle = document.querySelector('.nav-toggle');
  const navLinks = document.querySelector('.nav-links');
  const links = document.querySelectorAll('.nav-links a');

  // Scroll style
  function onScroll() {
    if (window.scrollY > 50) {
      navbar.classList.add('scrolled');
    } else {
      navbar.classList.remove('scrolled');
    }
  }
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  // Mobile toggle
  if (toggle) {
    toggle.addEventListener('click', () => {
      toggle.classList.toggle('open');
      navLinks.classList.toggle('open');
    });

    // Close menu on link click
    links.forEach(link => {
      link.addEventListener('click', () => {
        toggle.classList.remove('open');
        navLinks.classList.remove('open');
      });
    });
  }
}

/* ---------- Active nav + page dot highlighting (on scroll) ---------- */
function syncActiveIndicators() {
  const pages = getAllPages();
  const scrollTop = window.scrollY || document.documentElement.scrollTop;
  const viewportH = window.innerHeight;
  const dots = document.querySelectorAll('.page-dot');
  const navLinksAll = document.querySelectorAll('.nav-links a');

  let currentIdx = 0;

  pages.forEach((page, idx) => {
    const rect = page.getBoundingClientRect();
    // The page whose top is closest to 0 (within half-viewport tolerance)
    if (rect.top <= viewportH * 0.5 && rect.bottom > viewportH * 0.25) {
      currentIdx = idx;
    }
  });

  // Update dots
  dots.forEach((dot, idx) => {
    dot.classList.toggle('active', idx === currentIdx);
  });

  // Update nav links
  const currentPage = pages[currentIdx];
  const currentId = currentPage ? currentPage.getAttribute('id') : null;

  navLinksAll.forEach(link => {
    const href = link.getAttribute('href');
    if (!href || !href.startsWith('#')) return;
    const targetId = href.slice(1);
    if (targetId === currentId) {
      link.classList.add('active');
    } else {
      link.classList.remove('active');
    }
  });
}

/* ---------- Scroll Reveal (Intersection Observer) ---------- */
function initScrollReveal() {
  const reveals = document.querySelectorAll('.reveal, .reveal-children');
  if (!reveals.length) return;

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
      }
    });
  }, {
    threshold: 0.1,
    rootMargin: '0px 0px -60px 0px'
  });

  reveals.forEach(el => observer.observe(el));
}

/* ---------- Track Card Expand/Collapse ---------- */
function initTrackCards() {
  document.querySelectorAll('.track-expand-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const card = btn.closest('.track-card');
      card.classList.toggle('expanded');
      const isExpanded = card.classList.contains('expanded');
      btn.querySelector('.btn-text').textContent = isExpanded ? 'Hide Topics' : 'View Topics';
    });
  });
}

/* ---------- Committee Tabs ---------- */
function initCommitteeTabs() {
  const tabs = document.querySelectorAll('.committee-tab');
  const panels = document.querySelectorAll('.committee-panel');

  tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      const target = tab.dataset.tab;

      tabs.forEach(t => t.classList.remove('active'));
      panels.forEach(p => p.classList.remove('active'));

      tab.classList.add('active');
      document.getElementById(target).classList.add('active');
    });
  });
}

/* ---------- Get all snap pages in order ---------- */
function getAllPages() {
  // Collect hero + all sections (not footer)
  const hero = document.querySelector('.hero');
  const sections = Array.from(document.querySelectorAll('.section[id]'));
  const pages = [];
  if (hero) pages.push(hero);
  sections.forEach(s => pages.push(s));
  return pages;
}

/* ---------- Full-page Navigation (snap-aware smooth scroll) ---------- */
function initPageNavigation() {
  // Nav link clicks scroll to the target section
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', (e) => {
      e.preventDefault();
      const hash = anchor.getAttribute('href');
      if (hash === '#') {
        // Scroll to top (hero)
        document.querySelector('.hero').scrollIntoView({ behavior: 'smooth' });
        return;
      }
      const target = document.querySelector(hash);
      if (target) {
        target.scrollIntoView({ behavior: 'smooth' });
      }
    });
  });

  // Listen for scroll events to update active states
  let ticking = false;
  window.addEventListener('scroll', () => {
    if (!ticking) {
      requestAnimationFrame(() => {
        syncActiveIndicators();
        ticking = false;
      });
      ticking = true;
    }
  }, { passive: true });

  // Initial sync
  syncActiveIndicators();
}

/* ---------- Build Page Indicator Dots ---------- */
function buildPageDots() {
  const pages = getAllPages();
  if (!pages.length) return;

  const dotsContainer = document.createElement('div');
  dotsContainer.className = 'page-dots';
  dotsContainer.setAttribute('aria-label', 'Page navigation');

  const labels = {
    'hero': 'Home',
    'about': 'About',
    'tracks': 'Tracks',
    'dates': 'Dates',
    'registration': 'Registration',
    'submission': 'Submission',
    'publication': 'Publication',
    'committee': 'Committee',
    'contact': 'Contact'
  };

  pages.forEach((page, idx) => {
    const id = page.getAttribute('id') || 'hero';
    const dot = document.createElement('button');
    dot.className = 'page-dot' + (idx === 0 ? ' active' : '');
    dot.setAttribute('aria-label', `Go to ${labels[id] || id}`);
    dot.dataset.target = id;

    // Tooltip
    const tooltip = document.createElement('span');
    tooltip.className = 'page-dot-tooltip';
    tooltip.textContent = labels[id] || id;
    dot.appendChild(tooltip);

    dot.addEventListener('click', () => {
      page.scrollIntoView({ behavior: 'smooth' });
    });

    dotsContainer.appendChild(dot);
  });

  document.body.appendChild(dotsContainer);
}

/* ---------- Build Scroll-Down Indicator in Hero ---------- */
function buildScrollIndicator() {
  const hero = document.querySelector('.hero');
  if (!hero) return;

  const indicator = document.createElement('div');
  indicator.className = 'scroll-indicator';
  indicator.innerHTML = `
    <span class="scroll-indicator-text">Scroll</span>
    <div class="scroll-indicator-arrow"></div>
  `;

  // Clicking scrolls to the first section
  indicator.style.cursor = 'pointer';
  indicator.addEventListener('click', () => {
    const firstSection = document.querySelector('.section[id]');
    if (firstSection) {
      firstSection.scrollIntoView({ behavior: 'smooth' });
    }
  });

  hero.appendChild(indicator);
}

/* ---------- Count Up Animation ---------- */
function initCountUp() {
  const counters = document.querySelectorAll('.stat-number');
  if (!counters.length) return;

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting && !entry.target.dataset.counted) {
        entry.target.dataset.counted = 'true';
        const target = parseInt(entry.target.dataset.target) || 0;
        const suffix = entry.target.dataset.suffix || '';
        const prefix = entry.target.dataset.prefix || '';
        const duration = 2000;
        const step = target / (duration / 16);
        let current = 0;

        function update() {
          current += step;
          if (current >= target) {
            entry.target.textContent = prefix + target + suffix;
          } else {
            entry.target.textContent = prefix + Math.floor(current) + suffix;
            requestAnimationFrame(update);
          }
        }
        update();
      }
    });
  }, { threshold: 0.5 });

  counters.forEach(el => observer.observe(el));
}
