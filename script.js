// 米蘭米主黨 M.D.P — Campaign Site Interactions

document.addEventListener('DOMContentLoaded', () => {
  // ---- Hero video sound toggle ----
  // 瀏覽器基本上都會擋掉「有聲音自動播放」,所以影片預設仍是 autoplay + muted。
  // 這顆按鈕讓使用者可以「一鍵」開聲音(順便在 autoplay 被擋掉時重新觸發播放)。
  const heroVideo = document.getElementById('heroVideo');
  const soundToggle = document.getElementById('heroSoundToggle');
  if (heroVideo && soundToggle) {
    const soundLabel = soundToggle.querySelector('.hero__sound-label');
    const syncButton = () => {
      const unmuted = !heroVideo.muted;
      soundToggle.classList.toggle('is-unmuted', unmuted);
      soundToggle.setAttribute('aria-pressed', String(unmuted));
      soundToggle.setAttribute('aria-label', unmuted ? '關閉影片聲音' : '開啟影片聲音');
      if (soundLabel) soundLabel.textContent = unmuted ? '靜音' : '開啟聲音';
    };
    soundToggle.addEventListener('click', () => {
      heroVideo.muted = !heroVideo.muted;
      // 如果先前 autoplay 被瀏覽器擋掉,這裡的 play() 是使用者手勢觸發,一定會成功
      heroVideo.play().catch(() => {});
      syncButton();
    });
    syncButton();
  }

  // ---- Marquee: duplicate items within the same track so translateX(-50%)
  // lands exactly on a repeat boundary (seamless infinite scroll) ----
  document.querySelectorAll('[data-marquee]').forEach((track) => {
    const originalItems = Array.from(track.children);
    originalItems.forEach((item) => {
      const clone = item.cloneNode(true);
      clone.setAttribute('aria-hidden', 'true');
      track.appendChild(clone);
    });
  });
  document.querySelectorAll('.marquee').forEach((m) => {
    m.addEventListener('mouseenter', () => {
      m.querySelectorAll('.marquee__track').forEach((t) => (t.style.animationPlayState = 'paused'));
    });
    m.addEventListener('mouseleave', () => {
      m.querySelectorAll('.marquee__track').forEach((t) => (t.style.animationPlayState = 'running'));
    });
  });

  // ---- Scroll reveal + active dot-nav tracking ----
  const sections = Array.from(document.querySelectorAll('main .section, .hero'));
  const reveals = Array.from(document.querySelectorAll('.reveal'));
  const dots = Array.from(document.querySelectorAll('.dot-nav__dot'));

  if ('IntersectionObserver' in window) {
    const revealObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-visible');
            revealObserver.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12, rootMargin: '0px 0px -70px 0px' }
    );
    reveals.forEach((el) => revealObserver.observe(el));

    const dotById = new Map();
    sections.forEach((section, i) => {
      if (dots[i]) dotById.set(section.id, dots[i]);
    });
    const navObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          const dot = dotById.get(entry.target.id);
          if (!dot) return;
          if (entry.isIntersecting) {
            dots.forEach((d) => d.classList.remove('active'));
            dot.classList.add('active');
          }
        });
      },
      { threshold: 0.45 }
    );
    sections.forEach((s) => navObserver.observe(s));
  } else {
    reveals.forEach((el) => el.classList.add('is-visible'));
  }

  // ---- Progress bar + back-to-top (rAF-throttled) ----
  const progressBar = document.getElementById('progressBar');
  const backToTop = document.getElementById('backToTop');
  let ticking = false;
  function onScroll() {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(() => {
      const scrollTop = window.scrollY;
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;
      const pct = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0;
      if (progressBar) progressBar.style.width = pct + '%';
      if (backToTop) backToTop.classList.toggle('visible', scrollTop > window.innerHeight * 0.6);
      ticking = false;
    });
  }
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  if (backToTop) {
    backToTop.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));
  }

  // ---- Roster accordion (分組名單): click header to expand/collapse ----
  document.querySelectorAll('.roster-item__header').forEach((header) => {
    header.addEventListener('click', () => {
      const item = header.closest('.roster-item');
      const isOpen = item.classList.contains('is-open');
      item.classList.toggle('is-open', !isOpen);
      header.setAttribute('aria-expanded', String(!isOpen));
    });
  });
});
