/* ==========================================================================
   Kerelos Nakhla — Portfolio JavaScript
   Video-Inspired Preloader, Cursor, Motion Reveals, and Interactive Features
   ========================================================================== */

// 1. Rock-Solid Video Preloader & Curtain Reveal
(function initVideoPreloader() {
  const preloader = document.getElementById('preloader');
  const counterEl = document.getElementById('preloader-counter');
  const fillEl = document.getElementById('preloader-bar-fill');
  const statusEl = document.getElementById('preloader-status');

  if (!preloader) return;

  let isDismissed = false;

  function dismiss() {
    if (isDismissed) return;
    isDismissed = true;
    
    if (counterEl) counterEl.textContent = '100%';
    if (fillEl) fillEl.style.width = '100%';
    if (statusEl) statusEl.textContent = 'EXPERIENCE READY';

    preloader.classList.add('fade-out');
    preloader.style.opacity = '0';
    preloader.style.pointerEvents = 'none';
    preloader.style.visibility = 'hidden';
    document.body.style.overflow = '';

    // Remove from DOM render tree after animation completes
    setTimeout(() => {
      preloader.style.display = 'none';
    }, 750);

    // Trigger initial hero and visible scroll reveals
    setTimeout(() => {
      const heroReveals = document.querySelectorAll('#home .reveal, .hero-content .reveal, .reveal');
      heroReveals.forEach((el, idx) => {
        const rect = el.getBoundingClientRect();
        if (rect.top < window.innerHeight) {
          setTimeout(() => el.classList.add('active'), idx * 50);
        }
      });
    }, 150);
  }

  // Tap/click to immediately skip preloader
  preloader.addEventListener('click', dismiss);

  // Safety Hard Timeout — GUARANTEES preloader never gets stuck
  const safetyTimeout = setTimeout(dismiss, 850);

  // Smooth interval-driven counter
  let percent = 0;
  const targetDuration = 700; // ms
  const stepInterval = 25; // ms
  const totalSteps = targetDuration / stepInterval;
  let currentStep = 0;

  const statusMessages = [
    { threshold: 0, text: 'INITIALIZING EXPERIENCE...' },
    { threshold: 30, text: 'LOADING INTERACTIVE DASHBOARDS...' },
    { threshold: 65, text: 'PREPARING MOTION & ANALYTICS...' },
    { threshold: 90, text: 'EXPERIENCE READY' }
  ];

  const intervalId = setInterval(() => {
    currentStep++;
    const progress = Math.min(currentStep / totalSteps, 1);
    // Cubic ease out
    const eased = 1 - Math.pow(1 - progress, 3);
    percent = Math.floor(eased * 100);

    if (counterEl) {
      counterEl.textContent = (percent < 10 ? '0' + percent : percent) + '%';
    }
    if (fillEl) {
      fillEl.style.width = percent + '%';
    }
    if (statusEl) {
      for (let i = statusMessages.length - 1; i >= 0; i--) {
        if (percent >= statusMessages[i].threshold) {
          statusEl.textContent = statusMessages[i].text;
          break;
        }
      }
    }

    if (percent >= 100) {
      clearInterval(intervalId);
      clearTimeout(safetyTimeout);
      setTimeout(dismiss, 200);
    }
  }, stepInterval);

  // Also dismiss when window finishes loading if already over 1s
  window.addEventListener('load', () => {
    setTimeout(dismiss, 500);
  });
})();

document.addEventListener("DOMContentLoaded", () => {
  const root = document.documentElement;
  const toggle = document.getElementById("themeToggle");

  // Theme Management
  const saved = localStorage.getItem("portfolio-theme-v3");
  const initialTheme = saved || "dark";
  root.dataset.theme = initialTheme;

  const syncThemeUI = () => {
    const isDark = root.dataset.theme === "dark";
    if (toggle) {
      const icon = toggle.querySelector(".theme-icon");
      const text = toggle.querySelector(".theme-text");
      if (icon) icon.textContent = isDark ? "☀" : "☾";
      if (text) text.textContent = isDark ? "Light" : "Dark";
    }
    const meta = document.querySelector('meta[name="theme-color"]');
    if (meta) meta.content = isDark ? "#1a1a2e" : "#f7fff7";
  };
  syncThemeUI();

  if (toggle) {
    toggle.addEventListener("click", () => {
      const next = root.dataset.theme === "dark" ? "light" : "dark";
      root.dataset.theme = next;
      localStorage.setItem("portfolio-theme-v3", next);
      syncThemeUI();
    });
  }

  // Lightweight animated background: capped resolution/FPS, fewer nodes, and no work in hidden tabs.
  (function initLiveBackground() {
    const canvas = document.getElementById("liveBackground");
    // Keep the full-viewport animated canvas off small screens; it adds continuous compositing work during pinch zoom.
    if (!canvas || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    if (window.matchMedia("(max-width: 700px)").matches) {
      canvas.style.display = "none";
      return;
    }
    const ctx = canvas.getContext("2d", { alpha: true });
    if (!ctx) return;

    let width = 0, height = 0;
    let dpr = Math.min(window.devicePixelRatio || 1, 1.25);
    let nodes = [], mouseX = 0.5, mouseY = 0.5;
    let raf = 0, resizeTimer = 0, lastFrame = 0, lastTime = 0;
    let stopped = document.hidden;
    const frameInterval = 1000 / 24;
    const isSmallScreen = window.matchMedia("(max-width: 700px)").matches;

    const getTheme = () => document.documentElement.dataset.theme === "light"
      ? { a: [13, 148, 136], b: [225, 29, 72], line: 0.25, glow: 0.22 }
      : { a: [78, 205, 196], b: [255, 107, 107], line: 0.14, glow: 0.14 };

    function resize() {
      width = Math.max(1, window.innerWidth);
      height = Math.max(1, window.innerHeight);
      dpr = Math.min(window.devicePixelRatio || 1, 1.25);
      canvas.width = Math.round(width * dpr);
      canvas.height = Math.round(height * dpr);
      canvas.style.width = width + "px";
      canvas.style.height = height + "px";
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      const areaCount = Math.floor((width * height) / (isSmallScreen ? 42000 : 50000));
      const count = Math.max(14, Math.min(isSmallScreen ? 20 : 34, areaCount));
      nodes = Array.from({ length: count }, (_, i) => ({
        x: Math.random() * width, y: Math.random() * height,
        vx: (Math.random() - 0.5) * 0.12, vy: (Math.random() - 0.5) * 0.12,
        r: 1 + Math.random() * 1.6, phase: Math.random() * Math.PI * 2, group: i % 3 === 0
      }));
      lastFrame = 0;
    }

    function draw(now) {
      raf = 0;
      if (stopped || document.hidden) return;
      if (now - lastFrame < frameInterval) {
        raf = requestAnimationFrame(draw);
        return;
      }
      const dt = lastTime ? Math.min(40, now - lastTime) : 16;
      lastTime = now;
      lastFrame = now;
      const theme = getTheme();
      ctx.clearRect(0, 0, width, height);

      const gridStep = Math.max(90, Math.min(130, width / 12));
      ctx.beginPath();
      for (let x = 0; x <= width; x += gridStep) { ctx.moveTo(x, 0); ctx.lineTo(x, height); }
      for (let y = 0; y <= height; y += gridStep) { ctx.moveTo(0, y); ctx.lineTo(width, y); }
      ctx.strokeStyle = document.documentElement.dataset.theme === "light"
        ? "rgba(13,148,136,0.045)" : "rgba(78,205,196,0.035)";
      ctx.lineWidth = 1;
      ctx.stroke();

      const grad = ctx.createRadialGradient(
        width * (0.35 + mouseX * 0.08), height * (0.28 + mouseY * 0.06), 0,
        width * 0.5, height * 0.45, Math.max(width, height) * 0.7
      );
      grad.addColorStop(0, "rgba(" + theme.a.join(",") + "," + theme.glow + ")");
      grad.addColorStop(0.55, "rgba(" + theme.b.join(",") + ",0.018)");
      grad.addColorStop(1, "rgba(0,0,0,0)");
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, width, height);

      for (const node of nodes) {
        node.x += node.vx * dt; node.y += node.vy * dt;
        if (node.x < -20) node.x = width + 20;
        else if (node.x > width + 20) node.x = -20;
        if (node.y < -20) node.y = height + 20;
        else if (node.y > height + 20) node.y = -20;
      }

      const maxDistance = Math.min(135, width * 0.13);
      const maxDistanceSq = maxDistance * maxDistance;
      for (let i = 0; i < nodes.length; i++) {
        const a = nodes[i];
        for (let j = i + 1; j < nodes.length; j++) {
          const b = nodes[j], dx = a.x - b.x, dy = a.y - b.y;
          const distSq = dx * dx + dy * dy;
          if (distSq < maxDistanceSq) {
            const alpha = (1 - Math.sqrt(distSq) / maxDistance) * theme.line;
            const color = (i + j) % 4 === 0 ? theme.b : theme.a;
            ctx.strokeStyle = "rgba(" + color.join(",") + "," + alpha + ")";
            ctx.lineWidth = 0.65;
            ctx.beginPath(); ctx.moveTo(a.x, a.y); ctx.lineTo(b.x, b.y); ctx.stroke();
          }
        }
      }
      for (const node of nodes) {
        const color = node.group ? theme.b : theme.a;
        ctx.fillStyle = "rgba(" + color.join(",") + ",0.38)";
        ctx.beginPath();
        ctx.arc(node.x, node.y, node.r * (0.85 + Math.sin(now * 0.001 + node.phase) * 0.15), 0, Math.PI * 2);
        ctx.fill();
      }
      raf = requestAnimationFrame(draw);
    }

    function start() {
      if (stopped || document.hidden || raf) return;
      lastTime = 0;
      raf = requestAnimationFrame(draw);
    }
    function stop() {
      stopped = true;
      if (raf) cancelAnimationFrame(raf);
      raf = 0;
    }
    window.addEventListener("resize", () => {
      // Pause expensive animation and visual effects while the browser is resizing or zooming.
      document.documentElement.classList.add("is-resizing");
      stopped = true;
      if (raf) cancelAnimationFrame(raf);
      raf = 0;
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(() => {
        resize();
        document.documentElement.classList.remove("is-resizing");
        stopped = document.hidden;
        if (!stopped) start();
      }, 220);
    }, { passive: true });
    window.addEventListener("pointermove", (event) => {
      mouseX = event.clientX / Math.max(window.innerWidth, 1);
      mouseY = event.clientY / Math.max(window.innerHeight, 1);
    }, { passive: true });
    document.addEventListener("visibilitychange", () => {
      if (document.hidden) { if (raf) cancelAnimationFrame(raf); raf = 0; }
      else start();
    });
    window.addEventListener("pagehide", stop, { once: true });
    resize();
    stopped = false;
    start();
  })();

  // Scroll Progress Bar
  const progressBar = document.querySelector(".scroll-progress");
  let progressTicking = false;
  const updateScrollProgress = () => {
    progressTicking = false;
    const total = document.documentElement.scrollHeight - window.innerHeight;
    if (total > 0 && progressBar) {
      const progress = Math.min(100, Math.max(0, (window.scrollY / total) * 100));
      progressBar.style.width = progress + "%";
    }
  };
  window.addEventListener("scroll", () => {
    if (!progressTicking) {
      progressTicking = true;
      requestAnimationFrame(updateScrollProgress);
    }
  }, { passive: true });
  updateScrollProgress();

  document.querySelectorAll('a[href^="#"]').forEach((link) => {
    link.addEventListener("click", (e) => {
      const id = link.getAttribute("href");
      if (!id || id === "#") return;
      const target = document.querySelector(id);
      if (!target) return;
      e.preventDefault();
      const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      target.scrollIntoView({ behavior: reduced ? "auto" : "smooth", block: "start" });
      history.replaceState(null, "", id);
    });
  });

  // 2. Custom Interactive Cursor with smooth interpolation
  const dot = document.querySelector(".cursor-dot");
  const ring = document.querySelector(".cursor-ring");

  if (dot && ring && window.matchMedia("(pointer: fine)").matches) {
    let mouseX = window.innerWidth / 2;
    let mouseY = window.innerHeight / 2;
    let ringX = mouseX;
    let ringY = mouseY;

    window.addEventListener("mousemove", (e) => {
      mouseX = e.clientX;
      mouseY = e.clientY;
      dot.style.left = mouseX + "px";
      dot.style.top = mouseY + "px";
    }, { passive: true });

    let ringRaf = 0;
    function renderRing() {
      ringRaf = 0;
      ringX += (mouseX - ringX) * 0.28;
      ringY += (mouseY - ringY) * 0.28;
      ring.style.left = ringX + "px";
      ring.style.top = ringY + "px";
      if (Math.abs(mouseX - ringX) > 0.5 || Math.abs(mouseY - ringY) > 0.5) {
        ringRaf = requestAnimationFrame(renderRing);
      }
    }
    window.addEventListener("mousemove", () => {
      if (!ringRaf) ringRaf = requestAnimationFrame(renderRing);
    }, { passive: true });

    // Hover effect on interactive elements
    const interactiveElements = document.querySelectorAll('a, button, .project-card, .certificate-card, .gallery-nav-btn, .project-filter, .filter-btn');
    interactiveElements.forEach((el) => {
      el.addEventListener('mouseenter', () => document.body.classList.add('cursor-hover'));
      el.addEventListener('mouseleave', () => document.body.classList.remove('cursor-hover'));
    });
  } else {
    if (dot) dot.style.display = "none";
    if (ring) ring.style.display = "none";
  }

  // 3. Scroll Reveal Animations (IntersectionObserver)
  const reveals = document.querySelectorAll('.reveal');
  const revealObserver = new IntersectionObserver(
    (entries, obs) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('active');
          obs.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.12, rootMargin: '0px 0px -30px 0px' }
  );

  reveals.forEach((el) => revealObserver.observe(el));

  // Project filters + search
  const filterButtons = document.querySelectorAll(".project-filter");
  const projectCards = document.querySelectorAll(".project-card[data-category]");
  const projectSearch = document.getElementById("projectSearch");
  const projectSearchClear = document.getElementById("projectSearchClear");
  const projectFilterStatus = document.getElementById("projectFilterStatus");
  let activeProjectFilter = "featured";

  const normalizeSearch = (value = "") =>
    value.toString().toLowerCase()
      .normalize("NFD").replace(/[̀-ͯ]/g, "")
      .replace(/[^a-z0-9\s#&-]/g, " ").replace(/\s+/g, " ").trim();

  const projectSearchIndex = new Map([...projectCards].map((card) => {
    const title = card.querySelector(".project-title, h3, h4")?.textContent || "";
    const description = card.querySelector(".project-description, .project-card-body, p")?.textContent || "";
    const altText = [...card.querySelectorAll("img")].map((img) => img.alt || "").join(" ");
    return [card, normalizeSearch([
      card.dataset.project || "", card.dataset.category || "", title,
      description, altText, card.textContent || ""
    ].join(" "))];
  }));

  const applyProjectFilters = () => {
    const rawQuery = projectSearch?.value || "";
    const query = normalizeSearch(rawQuery);
    const terms = query ? query.split(" ").filter(Boolean) : [];
    let visibleCount = 0;

    projectCards.forEach((card) => {
      const rawCategories = (card.dataset.category || "").toLowerCase();
      const categories = rawCategories.split(/\s+/);
      const searchableText = projectSearchIndex.get(card) || "";
      
      const filterKey = activeProjectFilter.toLowerCase();
      let matchesFilter = false;

      if (filterKey === "all") {
        matchesFilter = true;
      } else if (filterKey === "featured") {
        matchesFilter = categories.includes("featured");
      } else if (filterKey === "powerbi") {
        matchesFilter = categories.includes("powerbi") || rawCategories.includes("power");
      } else if (filterKey === "excel") {
        matchesFilter = categories.includes("excel");
      } else {
        matchesFilter = categories.includes(filterKey);
      }

      const matchesSearch = terms.length === 0 || terms.every((term) => searchableText.includes(term));
      const show = matchesFilter && matchesSearch;

      card.classList.toggle("is-filtered-out", !show);
      card.hidden = !show;

      if (show) {
        visibleCount += 1;
        // Ensure shown cards are immediately visible and not blocked by scroll reveal
        card.classList.add("active");
        card.style.opacity = "1";
        card.style.visibility = "visible";
        card.style.transform = "none";
      } else {
        card.style.opacity = "";
        card.style.visibility = "";
        card.style.transform = "";
      }
    });

    if (projectFilterStatus) {
      const label = activeProjectFilter === "all" ? "All projects" :
        activeProjectFilter === "featured" ? "Featured" :
        activeProjectFilter === "powerbi" ? "Power BI" : "Excel";
      projectFilterStatus.textContent = query
        ? visibleCount + " project" + (visibleCount === 1 ? "" : "s") + " match \"" + rawQuery.trim() + "\""
        : label + " · " + visibleCount + " project" + (visibleCount === 1 ? "" : "s") + " shown";
    }

    projectSearchClear?.classList.toggle("visible", Boolean(query));
  };

  filterButtons.forEach((button) => {
    button.addEventListener("click", (e) => {
      e.preventDefault();
      activeProjectFilter = button.dataset.filter || "all";
      filterButtons.forEach((b) => b.classList.toggle("active", b === button));
      applyProjectFilters();
    });
  });

  projectSearch?.addEventListener("input", applyProjectFilters);
  projectSearchClear?.addEventListener("click", () => {
    if (projectSearch) { projectSearch.value = ""; projectSearch.focus(); }
    applyProjectFilters();
  });
  projectSearch?.addEventListener("keydown", (e) => {
    if (e.key === "Escape") {
      projectSearch.value = "";
      applyProjectFilters();
    }
  });

  // Apply the initial state and keep filtering deterministic.
  applyProjectFilters();


  // Interactive Project Galleries
  const galleries = document.querySelectorAll(".project-gallery");

  galleries.forEach((gallery) => {
    const slides = gallery.querySelectorAll(".gallery-slide");
    gallery.setAttribute("tabindex", "0");
    gallery.setAttribute("role", "region");
    gallery.setAttribute("aria-label", "Project screenshot gallery");
    const total = slides.length;
    if (total <= 1) return;

    const prevBtn = gallery.querySelector(".gallery-nav-btn.prev");
    const nextBtn = gallery.querySelector(".gallery-nav-btn.next");
    const badgeIdx = gallery.querySelector(".current-idx");
    const badgeCaption = gallery.querySelector(".current-caption");

    let current = 0;
    let timer = null;
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    const showSlide = (idx) => {
      current = (idx + total) % total;
      slides.forEach((slide, i) => {
        if (i === current) {
          slide.classList.add("active");
        } else {
          slide.classList.remove("active");
        }
      });
      if (badgeIdx) badgeIdx.textContent = current + 1;
      if (badgeCaption) {
        const caption = slides[current].getAttribute("data-caption") || "";
        badgeCaption.textContent = caption;
      }
    };

    const nextSlide = () => showSlide(current + 1);
    const prevSlide = () => showSlide(current - 1);

    const startAuto = () => {
      stopAuto();
      timer = setInterval(nextSlide, 4500);
    };

    const stopAuto = () => {
      if (timer) {
        clearInterval(timer);
        timer = null;
      }
    };

    if (nextBtn) {
      nextBtn.addEventListener("click", (e) => {
        e.preventDefault();
        e.stopPropagation();
        nextSlide();
        startAuto();
      });
    }

    if (prevBtn) {
      prevBtn.addEventListener("click", (e) => {
        e.preventDefault();
        e.stopPropagation();
        prevSlide();
        startAuto();
      });
    }

    gallery.addEventListener("mouseenter", stopAuto);
    gallery.addEventListener("mouseleave", () => {
      if (!reducedMotion && !document.hidden) startAuto();
    });
    gallery.addEventListener("focusin", stopAuto);
    gallery.addEventListener("focusout", () => {
      if (!reducedMotion && !document.hidden) startAuto();
    });
    gallery.addEventListener("keydown", (e) => {
      if (e.key === "ArrowRight") {
        e.preventDefault();
        nextSlide();
      } else if (e.key === "ArrowLeft") {
        e.preventDefault();
        prevSlide();
      }
    });

    if (!reducedMotion) startAuto();

    document.addEventListener("visibilitychange", () => {
      if (document.hidden) {
        stopAuto();
      } else if (!reducedMotion) {
        startAuto();
      }
    });
  });
});

// Certificate Lightbox Modal
window.openCertificate = function(imgSrc, title) {
  const modal = document.getElementById('cert-modal');
  const modalImg = document.getElementById('cert-modal-img');
  const modalTitle = document.getElementById('cert-modal-title');

  if (modal && modalImg && modalTitle) {
    modalImg.src = imgSrc;
    modalTitle.textContent = title;
    modal.classList.add('active');
    document.body.style.overflow = 'hidden';
  }
};

window.closeCertificate = function() {
  const modal = document.getElementById('cert-modal');
  if (modal) {
    modal.classList.remove('active');
    document.body.style.overflow = '';
  }
};

window.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') {
    window.closeCertificate();
  }
});


/* Editorial navigation state */
document.addEventListener("DOMContentLoaded", () => {
  const navLinks = Array.from(document.querySelectorAll(".site-header nav a"));
  const sections = navLinks
    .map(link => document.querySelector(link.getAttribute("href")))
    .filter(Boolean);

  if (!navLinks.length || !sections.length || !("IntersectionObserver" in window)) return;

  const sectionObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      navLinks.forEach((link) => {
        link.classList.toggle(
          "active",
          link.getAttribute("href") === "#" + entry.target.id
        );
      });
    });
  }, {
    rootMargin: "-35% 0px -55% 0px",
    threshold: 0
  });

  sections.forEach(section => sectionObserver.observe(section));

  /* Mobile Navigation Menu Toggle */
  const menuToggle = document.getElementById("menuToggle");
  const siteNav = document.getElementById("siteNav");

  if (menuToggle && siteNav) {
    menuToggle.addEventListener("click", (e) => {
      e.stopPropagation();
      const isOpen = siteNav.classList.toggle("nav-open");
      menuToggle.setAttribute("aria-expanded", isOpen ? "true" : "false");
    });

    siteNav.querySelectorAll("a").forEach((link) => {
      link.addEventListener("click", () => {
        siteNav.classList.remove("nav-open");
        menuToggle.setAttribute("aria-expanded", "false");
      });
    });

    document.addEventListener("click", (e) => {
      if (!siteNav.contains(e.target) && !menuToggle.contains(e.target)) {
        siteNav.classList.remove("nav-open");
        menuToggle.setAttribute("aria-expanded", "false");
      }
    });

    window.addEventListener("keydown", (e) => {
      if (e.key === "Escape") {
        siteNav.classList.remove("nav-open");
        menuToggle.setAttribute("aria-expanded", "false");
      }
    });
  }

});
