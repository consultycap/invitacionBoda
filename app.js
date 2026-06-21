/* ==========================================================================
   JAVASCRIPT LOGIC - BODA DE CRISTHIAN Y XIMENA
   ========================================================================== */

// Config & State
const WEDDING_DATE = new Date('August 15, 2026 19:00:00').getTime();
const WHATSAPP_PHONE = '593939880336'; // Destination phone for RSVP (Ecuador format)

document.addEventListener('DOMContentLoaded', () => {
  initApp();
});

// Initialize all features
function initApp() {
  // Service Worker Registration for PWA
  registerServiceWorker();

  // Welcome Gate
  const btnOpen = document.getElementById('btn-open-invite');
  if (btnOpen) {
    btnOpen.addEventListener('click', openInvitation);
  }

  // Audio Controllers
  initAudio();

  // Countdown timer
  initCountdown();

  // Scroll Reveal Observer
  initScrollReveal();

  // Canvas Sparkles Effect
  initCanvasSparkles();

  // QR Code & Native Share Setup
  initShare();

  // Theme Initial Setup (Listen to local preferences)
  initTheme();

  // Initial Carousel
  initCarousel();
}

/* ==========================================================================
   SERVICE WORKER REGISTRATION
   ========================================================================== */
function registerServiceWorker() {
  if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
      navigator.serviceWorker.register('./sw.js')
        .then(reg => console.log('Service Worker registered successfully.', reg.scope))
        .catch(err => console.log('Service Worker registration failed: ', err));
    });
  }
}

/* ==========================================================================
   WELCOME GATE & TRANSITION
   ========================================================================== */
function openInvitation() {
  const gate = document.getElementById('welcome-gate');
  const body = document.body;
  const audio = document.getElementById('bg-music');

  // Fade out gate
  if (gate) {
    gate.classList.add('fade-out');
  }

  // Enable scrolling
  body.classList.remove('loading');

  // Play Music with user gesture
  if (audio) {
    audio.play().then(() => {
      console.log("Audio playing successfully.");
      document.getElementById('music-controller').classList.add('music-playing');
    }).catch(err => {
      console.warn("Autoplay blocked by browser. Music will load paused.", err);
      document.getElementById('music-controller').classList.remove('music-playing');
    });
  }

  // Fire initial reveals for elements above the fold
  setTimeout(() => {
    window.dispatchEvent(new Event('scroll'));
  }, 100);
}

/* ==========================================================================
   AUDIO PLAYER MANAGEMENT
   ========================================================================== */
function initAudio() {
  const audio = document.getElementById('bg-music');
  const controller = document.getElementById('music-controller');

  if (!audio || !controller) return;

  controller.addEventListener('click', () => {
    if (audio.paused) {
      audio.play().then(() => {
        controller.classList.add('music-playing');
        showToast('<i class="fa-solid fa-volume-high"></i> Música activada');
      });
    } else {
      audio.pause();
      controller.classList.remove('music-playing');
      showToast('<i class="fa-solid fa-volume-xmark"></i> Música silenciada');
    }
  });
}

/* ==========================================================================
   COUNTDOWN TIMER
   ========================================================================== */
function initCountdown() {
  const dSpan = document.getElementById('days');
  const hSpan = document.getElementById('hours');
  const mSpan = document.getElementById('minutes');
  const sSpan = document.getElementById('seconds');

  if (!dSpan) return;

  function updateTimer() {
    const now = new Date().getTime();
    const distance = WEDDING_DATE - now;

    if (distance < 0) {
      dSpan.innerText = "00";
      hSpan.innerText = "00";
      mSpan.innerText = "00";
      sSpan.innerText = "00";
      return;
    }

    const days = Math.floor(distance / (1000 * 60 * 60 * 24));
    const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((distance % (1000 * 60)) / 1000);

    dSpan.innerText = days.toString().padStart(2, '0');
    hSpan.innerText = hours.toString().padStart(2, '0');
    mSpan.innerText = minutes.toString().padStart(2, '0');
    sSpan.innerText = seconds.toString().padStart(2, '0');
  }

  updateTimer();
  setInterval(updateTimer, 1000);
}

/* ==========================================================================
   THEME TOGGLER (Light/Dark mode)
   ========================================================================== */
function initTheme() {
  const themeToggle = document.getElementById('theme-toggle');
  const body = document.body;
  const currentTheme = localStorage.getItem('wedding-theme');

  if (currentTheme === 'dark') {
    body.classList.add('dark');
    themeToggle.innerHTML = '<i class="fa-solid fa-sun"></i>';
  } else {
    body.classList.remove('dark');
    themeToggle.innerHTML = '<i class="fa-solid fa-moon"></i>';
  }

  themeToggle.addEventListener('click', () => {
    if (body.classList.contains('dark')) {
      body.classList.remove('dark');
      localStorage.setItem('wedding-theme', 'light');
      themeToggle.innerHTML = '<i class="fa-solid fa-moon"></i>';
      showToast('<i class="fa-solid fa-sun"></i> Modo Claro activado');
    } else {
      body.classList.add('dark');
      localStorage.setItem('wedding-theme', 'dark');
      themeToggle.innerHTML = '<i class="fa-solid fa-sun"></i>';
      showToast('<i class="fa-solid fa-moon"></i> Modo Oscuro activado');
    }
  });
}

/* ==========================================================================
   SCROLL REVEAL (Intersection Observer)
   ========================================================================== */
function initScrollReveal() {
  const reveals = document.querySelectorAll('.reveal');

  const revealCallback = (entries, observer) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('revealed');
        // Once revealed, no need to watch it anymore
        observer.unobserve(entry.target);
      }
    });
  };

  const observerOptions = {
    root: null,
    threshold: 0.15,
    rootMargin: "0px 0px -50px 0px"
  };

  const observer = new IntersectionObserver(revealCallback, observerOptions);

  reveals.forEach(el => {
    observer.observe(el);
  });
}

/* ==========================================================================
   CANVAS SPARKLES / PARTICLES
   ========================================================================== */
function initCanvasSparkles() {
  const canvas = document.getElementById('sparkles-canvas');
  if (!canvas) return;

  const ctx = canvas.getContext('2d');
  let particles = [];
  const particleCount = 45;

  function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
  }

  resizeCanvas();
  window.addEventListener('resize', resizeCanvas);

  class Particle {
    constructor() {
      this.reset();
      this.y = Math.random() * canvas.height; // Stagger initial load
    }

    reset() {
      this.x = Math.random() * canvas.width;
      this.y = -20;
      this.size = Math.random() * 6 + 4; // Petal size
      this.speedY = Math.random() * 1.5 + 0.5; // Falling speed
      this.speedX = Math.random() * 1.5 - 0.75;
      this.rotation = Math.random() * 360;
      this.rotationSpeed = Math.random() * 2 - 1;
      
      const colors = ['#ffb6c1', '#ffc0cb', '#ffe4e1', '#ffffff'];
      this.color = colors[Math.floor(Math.random() * colors.length)];
      this.opacity = Math.random() * 0.6 + 0.3;
    }

    update() {
      this.y += this.speedY;
      this.x += Math.sin(this.y / 50) * this.speedX;
      this.rotation += this.rotationSpeed;

      if (this.y > canvas.height + 20) {
        this.reset();
      }
    }

    draw() {
      ctx.save();
      ctx.globalAlpha = this.opacity;
      ctx.translate(this.x, this.y);
      ctx.rotate(this.rotation * Math.PI / 180);
      
      ctx.beginPath();
      ctx.fillStyle = this.color;
      ctx.moveTo(0, 0);
      ctx.quadraticCurveTo(this.size, -this.size, 0, -this.size * 2);
      ctx.quadraticCurveTo(-this.size, -this.size, 0, 0);
      ctx.fill();
      
      ctx.restore();
    }
  }

  for (let i = 0; i < particleCount; i++) {
    particles.push(new Particle());
  }

  function animate() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    particles.forEach(p => {
      p.update();
      p.draw();
    });
    requestAnimationFrame(animate);
  }

  animate();
}

/* ==========================================================================
   CAROUSEL / GALERÍA
   ========================================================================== */
function initCarousel() {
  const track = document.getElementById('gallery-carousel-track');
  const btnLeft = document.getElementById('carousel-left');
  const btnRight = document.getElementById('carousel-right');

  if (!track || !btnLeft || !btnRight) return;

  const totalImages = 32;

  // Inject images dynamically
  for (let i = 1; i <= totalImages; i++) {
    const li = document.createElement('li');
    li.className = 'carousel-slide';
    const img = document.createElement('img');
    img.src = `assets/foto${i}.jpeg`;
    img.alt = `Fotografía ${i}`;
    img.loading = 'lazy';
    li.appendChild(img);
    track.appendChild(li);
  }

  let currentIndex = 0;
  let autoPlayInterval;

  function updateCarousel() {
    track.style.transform = `translateX(-${currentIndex * 100}%)`;
  }

  function nextSlide() {
    currentIndex = (currentIndex + 1) >= totalImages ? 0 : currentIndex + 1;
    updateCarousel();
  }

  function prevSlide() {
    currentIndex = (currentIndex - 1) < 0 ? totalImages - 1 : currentIndex - 1;
    updateCarousel();
  }

  function startAutoPlay() {
    autoPlayInterval = setInterval(nextSlide, 3500);
  }

  function resetAutoPlay() {
    clearInterval(autoPlayInterval);
    startAutoPlay();
  }

  btnRight.addEventListener('click', () => { nextSlide(); resetAutoPlay(); });
  btnLeft.addEventListener('click', () => { prevSlide(); resetAutoPlay(); });

  startAutoPlay();
}

/* ==========================================================================
   GIFT TABLE - COPY ACCOUNT NUMBER
   ========================================================================== */
window.copyClabe = function (clabe) {
  navigator.clipboard.writeText(clabe).then(() => {
    showToast('<i class="fa-solid fa-check"></i> Cuenta copiada al portapapeles');
  }).catch(err => {
    console.error('Could not copy text: ', err);
    showToast('Error al copiar. Por favor, cópiala manualmente.');
  });
};

/* ==========================================================================
   SHARE MODAL & QR CODE GENERATION
   ========================================================================== */
function initShare() {
  const shareBtn = document.getElementById('share-controller');
  const nativeShareBtn = document.getElementById('btn-native-share');

  if (!shareBtn) return;

  const currentUrl = window.location.href;
  const qrBaseUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=`;

  const shareQr = document.getElementById('share-qr-code');
  if (shareQr) {
    shareQr.innerHTML = `<img src="${qrBaseUrl}${encodeURIComponent(currentUrl)}" alt="QR Compartir Sitio" style="max-width:100%">`;
  }

  shareBtn.addEventListener('click', () => {
    const shareModal = document.getElementById('share-modal');
    if (shareModal) shareModal.classList.add('active');
  });

  if (nativeShareBtn) {
    nativeShareBtn.addEventListener('click', () => {
      if (navigator.share) {
        navigator.share({
          title: 'Boda de Cristhian & Ximena',
          text: 'Te invitamos a celebrar nuestra unión matrimonial el próximo 15 de Agosto de 2026. Abre nuestra invitación digital:',
          url: currentUrl
        }).then(() => {
          closeShareModal();
        }).catch(err => {
          console.warn('Error al compartir o cancelado:', err);
        });
      } else {
        copyLink();
      }
    });
  }
}

window.closeShareModal = function () {
  const shareModal = document.getElementById('share-modal');
  if (shareModal) shareModal.classList.remove('active');
};

window.copyLink = function () {
  const currentUrl = window.location.href;
  navigator.clipboard.writeText(currentUrl).then(() => {
    showToast('<i class="fa-solid fa-link"></i> Enlace copiado al portapapeles');
    closeShareModal();
  }).catch(err => {
    console.error('Could not copy link: ', err);
  });
};

/* ==========================================================================
   TOAST NOTIFICATION HELPER
   ========================================================================== */
function showToast(message) {
  const toast = document.getElementById('toast');
  if (!toast) return;

  toast.innerHTML = message;
  toast.classList.add('active');

  setTimeout(() => {
    toast.classList.remove('active');
  }, 3000);
}
