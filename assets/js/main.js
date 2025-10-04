// Main JS for D&R Fried Chicken
(() => {
  const qs = (s, o = document) => o.querySelector(s);
  const qsa = (s, o = document) => [...o.querySelectorAll(s)];

  // Dynamic year
  const y = qs('#year');
  if (y) y.textContent = new Date().getFullYear();

  // Mobile nav toggle
  const navToggle = qs('.nav-toggle');
  const navMenu = qs('#nav-menu');
  if (navToggle && navMenu) {
    navToggle.addEventListener('click', () => {
      const expanded = navToggle.getAttribute('aria-expanded') === 'true';
      navToggle.setAttribute('aria-expanded', String(!expanded));
      navMenu.classList.toggle('show');
      if (!expanded) {
        navMenu.querySelector('a,button')?.focus();
      }
    });
    navMenu.addEventListener('click', e => {
      if (e.target.closest('a')) {
        navMenu.classList.remove('show');
        navToggle.setAttribute('aria-expanded', 'false');
      }
    });
  }

  // Scroll active link highlight
  const sections = qsa('section[id]');
  const navLinks = qsa('.nav-links a[href^="#"]');
  const onScroll = () => {
    const scrollPos = window.scrollY + 120;
    sections.forEach(sec => {
      if (scrollPos >= sec.offsetTop && scrollPos < sec.offsetTop + sec.offsetHeight) {
        navLinks.forEach(l => l.classList.remove('active'));
        const active = qs(`.nav-links a[href='#${sec.id}']`);
        active && active.classList.add('active');
      }
    });
  };
  window.addEventListener('scroll', onScroll, { passive: true });

  // Intersection Observer animations
  const animateEls = qsa('[data-animate]');
  if ('IntersectionObserver' in window) {
    const io = new IntersectionObserver(entries => {
      entries.forEach(ent => {
        if (ent.isIntersecting) {
          ent.target.classList.add('in');
          io.unobserve(ent.target);
        }
      });
    }, { threshold: 0.12 });
    animateEls.forEach(el => io.observe(el));
  } else {
    animateEls.forEach(el => el.classList.add('in'));
  }

  // Testimonials slider
  const slides = qsa('.slide');
  const dots = qsa('.dot');
  let slideIndex = 0;
  const showSlide = i => {
    slides.forEach(s => s.classList.remove('active'));
    dots.forEach(d => d.classList.remove('active'));
    slides[i].classList.add('active');
    dots[i].classList.add('active');
    dots[i].setAttribute('aria-selected', 'true');
  };
  const nextSlide = () => { slideIndex = (slideIndex + 1) % slides.length; showSlide(slideIndex); };
  let slideTimer = setInterval(nextSlide, 5000);
  dots.forEach((d, i) => d.addEventListener('click', () => { slideIndex = i; showSlide(i); clearInterval(slideTimer); slideTimer = setInterval(nextSlide, 6000); }));

  // Dark mode toggle
  const modeToggle = qs('#modeToggle');
  const prefersDark = window.matchMedia('(prefers-color-scheme: dark)');
  const applyTheme = theme => {
    if (theme === 'dark') document.documentElement.setAttribute('data-theme', 'dark');
    else document.documentElement.removeAttribute('data-theme');
    if (modeToggle) modeToggle.textContent = theme === 'dark' ? '☀️' : '🌙';
  };
  let savedTheme = localStorage.getItem('theme');
  if (!savedTheme) savedTheme = prefersDark.matches ? 'dark' : 'light';
  applyTheme(savedTheme);
  modeToggle?.addEventListener('click', () => {
    savedTheme = savedTheme === 'dark' ? 'light' : 'dark';
    localStorage.setItem('theme', savedTheme); applyTheme(savedTheme);
  });
  prefersDark.addEventListener('change', e => { if (!localStorage.getItem('theme')) applyTheme(e.matches ? 'dark' : 'light'); });

  // Smooth scroll (native behavior, fallback)
  if ('scrollBehavior' in document.documentElement.style === false) {
    navLinks.forEach(a => a.addEventListener('click', e => {
      const id = a.getAttribute('href').slice(1); const tgt = qs('#' + id); if (tgt) { e.preventDefault(); window.scrollTo(0, tgt.offsetTop - 80); }
    }));
  }

  // Lightweight typewriter effect for hero title (progressive enhancement)
  const heroTitle = qs('#hero-title');
  if (heroTitle) {
    const original = heroTitle.innerHTML; // Keep markup
    heroTitle.classList.add('typing');
    // Remove markup for effect then restore gradually
    const tmp = heroTitle.textContent.trim();
    heroTitle.textContent = '';
    let idx = 0;
    const type = () => {
      heroTitle.textContent = tmp.slice(0, idx++);
      if (idx <= tmp.length) requestAnimationFrame(type);
      else heroTitle.innerHTML = original; // restore styled spans
    };
    requestAnimationFrame(type);
  }

  // Performance: lazy load map after interaction or after delay
  const mapWrapper = qs('.map-wrapper iframe');
  if (mapWrapper) {
    const src = mapWrapper.getAttribute('src');
    mapWrapper.setAttribute('data-src', src);
    mapWrapper.removeAttribute('src');
    const loadMap = () => {
      if (!mapWrapper.getAttribute('src')) mapWrapper.setAttribute('src', mapWrapper.getAttribute('data-src'));
      window.removeEventListener('scroll', mapScroll);
    };
    const mapScroll = () => { if (window.scrollY + window.innerHeight >= mapWrapper.parentElement.offsetTop - 200) loadMap(); };
    window.addEventListener('scroll', mapScroll, { passive: true });
    setTimeout(loadMap, 8000); // fallback load
  }
})();
