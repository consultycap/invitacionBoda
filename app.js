/* ==========================================================================
   JAVASCRIPT LOGIC - BODA DE CRISTHIAN Y XIMENA
   ========================================================================== */

// Config & State
const WEDDING_DATE = new Date('August 15, 2026 19:00:00').getTime();
const WHATSAPP_PHONE = '593939880336'; // Destination phone for RSVP (Ecuador format)
let audioContext = null;
let currentLightboxIndex = 0;
// Galería manejada dinámicamente por el carrusel

// Seed wishes for the guestbook if empty
const SEED_WISHES = [
  { name: 'Sofía & Fernando', text: '¡Muchísimas felicidades, queridos amigos! Estamos contando los días para celebrar con ustedes su gran amor. Les deseamos una vida llena de risas y complicidad.', date: 'Hace 2 días' },
  { name: 'Tía Elena', text: 'Qué gran alegría verlos dar este hermoso paso. Que Dios bendiga su unión siempre. Con todo mi cariño.', date: 'Hace 1 día' },
  { name: 'Carlos Mendoza', text: '¡Se nos casa Cristhian! Un fuerte abrazo para ambos, les deseo lo mejor en esta nueva etapa. ¡A celebrar en grande!', date: 'Hace 3 horas' }
];

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

  // Wishes Wall Loading
  loadWishes();

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
    threshold: 0.15, // Trigger when 15% of the card is visible
    rootMargin: "0px 0px -50px 0px" // Slight offset
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
      this.y = canvas.height + 20;
      this.radius = Math.random() * 2.5 + 0.5;
      this.speedY = Math.random() * 0.4 + 0.2;
      this.speedX = Math.random() * 0.2 - 0.1;
      this.opacity = Math.random() * 0.5 + 0.1;
      this.fadeSpeed = Math.random() * 0.005 + 0.002;
    }

    update() {
      this.y -= this.speedY;
      this.x += this.speedX;
      
      // Floating side movements
      this.speedX += Math.random() * 0.02 - 0.01;
      
      // Reset if out of bounds or invisible
      if (this.y < -20 || this.opacity <= 0) {
        this.reset();
      }
    }

    draw() {
      ctx.beginPath();
      // Light gold sparkle color depending on theme
      const isDark = document.body.classList.contains('dark');
      ctx.fillStyle = isDark ? `rgba(232, 195, 90, ${this.opacity})` : `rgba(212, 175, 55, ${this.opacity})`;
      ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  // Populate particles
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
   LIGHTBOX GALLERY
   ========================================================================== */
function initCarousel() {
  const track = document.getElementById('gallery-carousel-track');
  const btnLeft = document.getElementById('carousel-left');
  const btnRight = document.getElementById('carousel-right');
  
  if (!track || !btnLeft || !btnRight) return;

  const totalImages = 32;
  
  // Inject images
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
    currentIndex++;
    if (currentIndex >= totalImages) {
      currentIndex = 0;
    }
    updateCarousel();
  }

  function prevSlide() {
    currentIndex--;
    if (currentIndex < 0) {
      currentIndex = totalImages - 1;
    }
    updateCarousel();
  }

  btnRight.addEventListener('click', () => {
    nextSlide();
    resetAutoPlay();
  });

  btnLeft.addEventListener('click', () => {
    prevSlide();
    resetAutoPlay();
  });

  function startAutoPlay() {
    autoPlayInterval = setInterval(nextSlide, 3500); // 3.5 segundos
  }

  function resetAutoPlay() {
    clearInterval(autoPlayInterval);
    startAutoPlay();
  }

  startAutoPlay();
}

/* ==========================================================================
   RSVP SUBMISSION & WHATSAPP
   ========================================================================== */
let pendingRSVPData = null;

window.handleRSVPSubmit = function(event) {
  event.preventDefault();
  
  const name = document.getElementById('rsvp-name').value.trim();
  const companions = document.getElementById('rsvp-companions').value;
  const phone = document.getElementById('rsvp-phone').value.trim();
  const attendance = document.querySelector('input[name="rsvp-attendance"]:checked').value;
  const notes = document.getElementById('rsvp-notes').value.trim();

  if (!name || !phone) {
    showToast('Por favor completa todos los campos requeridos.');
    return;
  }

  pendingRSVPData = { name, companions, phone, attendance, notes };

  // Save to simulated database
  const rsvps = JSON.parse(localStorage.getItem('wedding-rsvps') || '[]');
  rsvps.push({ ...pendingRSVPData, timestamp: new Date().toISOString() });
  localStorage.setItem('wedding-rsvps', JSON.stringify(rsvps));

  // Show Success Confirmation Modal
  const successModal = document.getElementById('success-modal');
  const successMsg = document.getElementById('success-msg');
  
  if (successMsg) {
    successMsg.innerText = attendance === 'Si' 
      ? `¡Gracias, ${name}! Hemos registrado tu confirmación de asistencia.`
      : `Lamentamos que no puedas asistir, ${name}. Tu respuesta ha sido guardada.`;
  }

  if (successModal) {
    successModal.classList.add('active');
  }

  // Clear RSVP form
  document.getElementById('rsvp-form').reset();
};

window.closeSuccessModal = function() {
  const successModal = document.getElementById('success-modal');
  if (successModal) {
    successModal.classList.remove('active');
  }
};

window.redirectToWhatsApp = function() {
  if (!pendingRSVPData) return;

  const { name, companions, phone, attendance, notes } = pendingRSVPData;
  const emojiAtt = attendance === 'Si' ? '✅ Sí, asistiré con gusto' : '❌ Lamentablemente no podré asistir';
  
  let message = `*CONFIRMACIÓN DE ASISTENCIA A LA BODA* 🤵👰\n\n`;
  message += `👤 *Invitado:* ${name}\n`;
  message += `📞 *Teléfono:* ${phone}\n`;
  message += `💍 *Asistencia:* ${emojiAtt}\n`;
  if (attendance === 'Si') {
    message += `👥 *Acompañantes:* +${companions}\n`;
  }
  if (notes) {
    message += `📝 *Mensaje:* ${notes}\n`;
  }

  const encodedMsg = encodeURIComponent(message);
  const waUrl = `https://wa.me/${WHATSAPP_PHONE}?text=${encodedMsg}`;
  
  window.open(waUrl, '_blank');
  closeSuccessModal();
};

/* ==========================================================================
   GIFT TABLE CLABE COPY
   ========================================================================== */
window.copyClabe = function(clabe) {
  navigator.clipboard.writeText(clabe).then(() => {
    showToast('<i class="fa-solid fa-check"></i> Cuenta copiada al portapapeles');
  }).catch(err => {
    console.error('Could not copy text: ', err);
    showToast('Error al copiar. Por favor, cópiala manualmente.');
  });
};

/* ==========================================================================
   GUESTBOOK / WISHES WALL
   ========================================================================== */
function loadWishes() {
  const wall = document.getElementById('wishes-wall');
  if (!wall) return;

  let wishes = JSON.parse(localStorage.getItem('wedding-wishes') || '[]');

  // Seed data if empty
  if (wishes.length === 0) {
    wishes = [...SEED_WISHES];
    localStorage.setItem('wedding-wishes', JSON.stringify(wishes));
  }

  // Render wishes
  wall.innerHTML = '';
  wishes.forEach(wish => {
    const wishCard = document.createElement('div');
    wishCard.className = 'wish-card';
    wishCard.innerHTML = `
      <div class="wish-meta">
        <span class="wish-author">${wish.name}</span>
        <span class="wish-date">${wish.date || 'Hace un momento'}</span>
      </div>
      <p class="wish-text">"${wish.text}"</p>
    `;
    wall.prepend(wishCard);
  });
}

window.handleGuestbookSubmit = function(event) {
  event.preventDefault();

  const nameInput = document.getElementById('gb-name');
  const messageInput = document.getElementById('gb-message');

  const name = nameInput.value.trim();
  const text = messageInput.value.trim();

  if (!name || !text) {
    showToast('Por favor completa todos los campos.');
    return;
  }

  const newWish = {
    name,
    text,
    date: 'Hace un momento'
  };

  const wishes = JSON.parse(localStorage.getItem('wedding-wishes') || '[]');
  wishes.push(newWish);
  localStorage.setItem('wedding-wishes', JSON.stringify(wishes));

  // Reload Wishes Wall
  loadWishes();

  // Reset inputs
  nameInput.value = '';
  messageInput.value = '';

  showToast('<i class="fa-solid fa-heart"></i> ¡Mensaje publicado!');
};

/* ==========================================================================
   SHARE MODAL & QR CODE GENERATION
   ========================================================================== */
function initShare() {
  const shareBtn = document.getElementById('share-controller');
  const nativeShareBtn = document.getElementById('btn-native-share');
  
  if (!shareBtn) return;

  // Render QR Codes using QRServer API inside layout containers
  const currentUrl = window.location.href;
  const qrBaseUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=`;
  
  const giftQr = document.getElementById('gift-qr-code');
  if (giftQr) {
    giftQr.innerHTML = `<img src="${qrBaseUrl}${encodeURIComponent('https://cuentadebanco.cristhianyximena.com')}" alt="QR Transferencia" style="max-width:100%">`;
  }

  const shareQr = document.getElementById('share-qr-code');
  if (shareQr) {
    shareQr.innerHTML = `<img src="${qrBaseUrl}${encodeURIComponent(currentUrl)}" alt="QR Compartir Sitio" style="max-width:100%">`;
  }

  // Open Modal triggers
  shareBtn.addEventListener('click', () => {
    const shareModal = document.getElementById('share-modal');
    if (shareModal) {
      shareModal.classList.add('active');
    }
  });

  // Native Web Share API trigger
  if (nativeShareBtn) {
    nativeShareBtn.addEventListener('click', () => {
      if (navigator.share) {
        navigator.share({
          title: 'Boda de Cristhian & Ximena',
          text: 'Te invitamos a celebrar nuestra unión matrimonial el próximo 15 de Agosto de 2026. Abre nuestra invitación digital:',
          url: currentUrl
        }).then(() => {
          console.log('Compartido exitosamente');
          closeShareModal();
        }).catch(err => {
          console.warn('Error al compartir o cancelado:', err);
        });
      } else {
        // Fallback: Copy Link
        copyLink();
      }
    });
  }
}

window.closeShareModal = function() {
  const shareModal = document.getElementById('share-modal');
  if (shareModal) {
    shareModal.classList.remove('active');
  }
};

window.copyLink = function() {
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
