/* ==========================================================================
   Kerelos Nakhla — Portfolio JavaScript (High-Performance & Touch-Optimized)
   ========================================================================== */

document.addEventListener("DOMContentLoaded", () => {
  "use strict";

  // 1. Theme Management (Dual-Theme with LocalStorage Persistence)
  const root = document.documentElement;
  const themeToggle = document.getElementById("themeToggle");
  const savedTheme = localStorage.getItem("portfolio-theme-v4");
  const systemPrefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
  const initialTheme = savedTheme || (systemPrefersDark ? "dark" : "light");

  root.dataset.theme = initialTheme;

  const updateThemeUI = (theme) => {
    const isDark = theme === "dark";
    if (themeToggle) {
      const icon = themeToggle.querySelector(".theme-icon");
      const text = themeToggle.querySelector(".theme-text");
      if (icon) icon.textContent = isDark ? "☀" : "☾";
      if (text) text.textContent = isDark ? "Light" : "Dark";
    }
    const metaTheme = document.querySelector('meta[name="theme-color"]');
    if (metaTheme) {
      metaTheme.content = isDark ? "#1a1a2e" : "#f7fff7";
    }
  };

  updateThemeUI(initialTheme);

  if (themeToggle) {
    themeToggle.addEventListener("click", () => {
      const nextTheme = root.dataset.theme === "dark" ? "light" : "dark";
      root.dataset.theme = nextTheme;
      localStorage.setItem("portfolio-theme-v4", nextTheme);
      updateThemeUI(nextTheme);
    });
  }

  // 2. Scroll Progress Bar
  const progressBar = document.querySelector(".scroll-progress");
  if (progressBar) {
    let ticking = false;
    const handleScrollProgress = () => {
      const scrollY = window.scrollY;
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;
      if (docHeight > 0) {
        const percent = Math.min(100, Math.max(0, (scrollY / docHeight) * 100));
        progressBar.style.width = percent + "%";
      }
      ticking = false;
    };

    window.addEventListener("scroll", () => {
      if (!ticking) {
        requestAnimationFrame(handleScrollProgress);
        ticking = true;
      }
    }, { passive: true });
  }

  // 3. Smooth In-Page Anchor Navigation
  document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
    anchor.addEventListener("click", (e) => {
      const targetId = anchor.getAttribute("href");
      if (!targetId || targetId === "#") return;
      const targetEl = document.querySelector(targetId);
      if (targetEl) {
        e.preventDefault();
        targetEl.scrollIntoView({ behavior: "smooth", block: "start" });
        history.replaceState(null, "", targetId);
      }
    });
  });

  // 4. Mobile Navigation Menu Toggle
  const menuToggle = document.getElementById("menuToggle");
  const siteNav = document.getElementById("siteNav");

  if (menuToggle && siteNav) {
    menuToggle.addEventListener("click", (e) => {
      e.stopPropagation();
      const isOpen = siteNav.classList.toggle("nav-open");
      menuToggle.setAttribute("aria-expanded", isOpen ? "true" : "false");
    });

    siteNav.querySelectorAll(".nav-link").forEach((link) => {
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
      if (e.key === "Escape" && siteNav.classList.contains("nav-open")) {
        siteNav.classList.remove("nav-open");
        menuToggle.setAttribute("aria-expanded", "false");
      }
    });
  }

  // 5. Active Section Header Highlighting
  const navLinks = Array.from(document.querySelectorAll(".site-nav .nav-link"));
  const sections = navLinks
    .map((link) => document.querySelector(link.getAttribute("href")))
    .filter(Boolean);

  if (navLinks.length && sections.length && "IntersectionObserver" in window) {
    const navObserver = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const currentId = "#" + entry.target.id;
          navLinks.forEach((link) => {
            link.classList.toggle("active", link.getAttribute("href") === currentId);
          });
        }
      });
    }, {
      rootMargin: "-25% 0px -65% 0px",
      threshold: 0
    });

    sections.forEach((sec) => navObserver.observe(sec));
  }

  // 6. Interactive Video Demo Showcase Tabs & Playback
  const demoTabs = document.querySelectorAll(".demo-tab");
  const videoPlayer = document.getElementById("dashboardVideoPlayer");
  const videoPrimarySrc = document.getElementById("videoPrimarySource");
  const videoFallbackSrc = document.getElementById("videoFallbackSource");
  const demoMetaTitle = document.getElementById("demoMetaTitle");
  const demoMetaDesc = document.getElementById("demoMetaDesc");
  const demoRepoLink = document.getElementById("demoRepoLink");
  const demoPlayToggleBtn = document.getElementById("demoPlayToggleBtn");

  if (demoTabs.length && videoPlayer) {
    demoTabs.forEach((tab) => {
      tab.addEventListener("click", () => {
        demoTabs.forEach((t) => {
          t.classList.toggle("active", t === tab);
          t.setAttribute("aria-selected", t === tab ? "true" : "false");
        });

        const videoUrl = tab.dataset.video;
        const fallbackUrl = tab.dataset.fallback;
        const title = tab.dataset.title;
        const desc = tab.dataset.desc;
        const repo = tab.dataset.repo;

        if (videoPrimarySrc) videoPrimarySrc.src = videoUrl;
        if (videoFallbackSrc) videoFallbackSrc.src = fallbackUrl;
        if (demoMetaTitle) demoMetaTitle.textContent = title;
        if (demoMetaDesc) demoMetaDesc.textContent = desc;
        if (demoRepoLink) demoRepoLink.href = repo;

        videoPlayer.load();
        videoPlayer.play().catch(() => {
          // Auto-play was prevented by browser policy, keep paused
        });
        if (demoPlayToggleBtn) demoPlayToggleBtn.textContent = "⏸ Pause Demo";
      });
    });

    if (demoPlayToggleBtn) {
      demoPlayToggleBtn.addEventListener("click", () => {
        if (videoPlayer.paused) {
          videoPlayer.play();
          demoPlayToggleBtn.textContent = "⏸ Pause Demo";
        } else {
          videoPlayer.pause();
          demoPlayToggleBtn.textContent = "▶ Play Demo";
        }
      });

      videoPlayer.addEventListener("play", () => {
        demoPlayToggleBtn.textContent = "⏸ Pause Demo";
      });

      videoPlayer.addEventListener("pause", () => {
        demoPlayToggleBtn.textContent = "▶ Play Demo";
      });
    }
  }

  // 7. Project Filtering and Real-time Search
  const filterButtons = document.querySelectorAll(".project-filter");
  const projectCards = document.querySelectorAll(".project-card[data-category]");
  const projectSearch = document.getElementById("projectSearch");
  const projectSearchClear = document.getElementById("projectSearchClear");
  const projectFilterStatus = document.getElementById("projectFilterStatus");
  let activeFilter = "featured";

  const normalizeStr = (str = "") =>
    str.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").trim();

  const applyFiltering = () => {
    const rawSearch = projectSearch?.value || "";
    const cleanSearch = normalizeStr(rawSearch);
    const searchTerms = cleanSearch ? cleanSearch.split(/\s+/).filter(Boolean) : [];
    let visibleCount = 0;

    projectCards.forEach((card) => {
      const categories = (card.dataset.category || "").toLowerCase().split(/\s+/);
      const title = card.querySelector("h3")?.textContent || "";
      const desc = card.querySelector(".project-info > p")?.textContent || "";
      const tags = Array.from(card.querySelectorAll(".tags span")).map((t) => t.textContent).join(" ");
      const combinedSearchText = normalizeStr(`${title} ${desc} ${tags} ${categories.join(" ")}`);

      let matchesCategory = false;
      if (activeFilter === "all") {
        matchesCategory = true;
      } else if (activeFilter === "featured") {
        matchesCategory = categories.includes("featured");
      } else if (activeFilter === "powerbi") {
        matchesCategory = categories.includes("powerbi");
      } else if (activeFilter === "excel") {
        matchesCategory = categories.includes("excel");
      }

      const matchesSearch =
        searchTerms.length === 0 ||
        searchTerms.every((term) => combinedSearchText.includes(term));

      const isVisible = matchesCategory && matchesSearch;
      card.classList.toggle("is-filtered-out", !isVisible);

      if (isVisible) {
        visibleCount++;
      }
    });

    if (projectFilterStatus) {
      const filterLabel =
        activeFilter === "all" ? "All projects" :
        activeFilter === "featured" ? "Featured" :
        activeFilter === "powerbi" ? "Power BI" : "Excel";

      projectFilterStatus.textContent = cleanSearch
        ? `${visibleCount} project${visibleCount === 1 ? "" : "s"} match "${rawSearch.trim()}"`
        : `${filterLabel} · ${visibleCount} project${visibleCount === 1 ? "" : "s"} shown`;
    }

    if (projectSearchClear) {
      projectSearchClear.classList.toggle("visible", Boolean(cleanSearch));
    }
  };

  filterButtons.forEach((btn) => {
    btn.addEventListener("click", () => {
      activeFilter = btn.dataset.filter || "all";
      filterButtons.forEach((b) => b.classList.toggle("active", b === btn));
      applyFiltering();
    });
  });

  if (projectSearch) {
    projectSearch.addEventListener("input", applyFiltering);
    projectSearch.addEventListener("keydown", (e) => {
      if (e.key === "Escape") {
        projectSearch.value = "";
        applyFiltering();
      }
    });
  }

  if (projectSearchClear) {
    projectSearchClear.addEventListener("click", () => {
      if (projectSearch) {
        projectSearch.value = "";
        projectSearch.focus();
      }
      applyFiltering();
    });
  }

  // 8. Fullscreen Lightbox Modal (For Certificates & Dashboard Screenshots)
  const lightboxModal = document.getElementById("lightboxModal");
  const lightboxBackdrop = document.getElementById("lightboxBackdrop");
  const lightboxCloseBtn = document.getElementById("lightboxCloseBtn");
  const lightboxImg = document.getElementById("lightboxImg");
  const lightboxTitle = document.getElementById("lightboxTitle");
  const lightboxDriveLink = document.getElementById("lightboxDriveLink");

  const openLightbox = (imgSrc, title, driveUrl = "") => {
    if (!lightboxModal || !lightboxImg) return;
    lightboxImg.src = imgSrc;
    lightboxImg.alt = title;
    if (lightboxTitle) lightboxTitle.textContent = title;
    if (lightboxDriveLink) {
      if (driveUrl) {
        lightboxDriveLink.href = driveUrl;
        lightboxDriveLink.style.display = "inline-flex";
      } else {
        lightboxDriveLink.style.display = "none";
      }
    }
    lightboxModal.classList.add("active");
    lightboxModal.setAttribute("aria-hidden", "false");
    document.body.style.overflow = "hidden";
  };

  const closeLightbox = () => {
    if (!lightboxModal) return;
    lightboxModal.classList.remove("active");
    lightboxModal.setAttribute("aria-hidden", "true");
    document.body.style.overflow = "";
    if (lightboxImg) lightboxImg.src = "";
  };

  if (lightboxCloseBtn) lightboxCloseBtn.addEventListener("click", closeLightbox);
  if (lightboxBackdrop) lightboxBackdrop.addEventListener("click", closeLightbox);

  window.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && lightboxModal?.classList.contains("active")) {
      closeLightbox();
    }
  });

  // Attach Lightbox triggers to Certificates
  document.querySelectorAll(".cert-thumb-wrapper, .cert-enlarge-btn").forEach((trigger) => {
    const handleTrigger = () => {
      const imgSrc = trigger.dataset.img || trigger.querySelector("img")?.src || "";
      const title = trigger.dataset.title || trigger.querySelector("img")?.alt || "Certificate Preview";
      const driveUrl = trigger.dataset.drive || "";
      openLightbox(imgSrc, title, driveUrl);
    };

    trigger.addEventListener("click", handleTrigger);
    trigger.addEventListener("keydown", (e) => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        handleTrigger();
      }
    });
  });

  // 9. Interactive Screenshot Galleries with Mobile Touch Swipe
  const galleries = document.querySelectorAll(".project-gallery");

  galleries.forEach((gallery) => {
    const slides = gallery.querySelectorAll(".gallery-slide");
    const total = slides.length;
    if (total <= 1) return;

    const prevBtn = gallery.querySelector(".gallery-nav-btn.prev");
    const nextBtn = gallery.querySelector(".gallery-nav-btn.next");
    const badgeIdx = gallery.querySelector(".current-idx");
    const badgeCaption = gallery.querySelector(".current-caption");
    const enlargeBtn = gallery.querySelector(".gallery-enlarge-btn");

    let current = 0;

    const showSlide = (index) => {
      current = (index + total) % total;
      slides.forEach((slide, i) => {
        slide.classList.toggle("active", i === current);
      });
      if (badgeIdx) badgeIdx.textContent = current + 1;
      if (badgeCaption) {
        const caption = slides[current].getAttribute("data-caption") || "";
        badgeCaption.textContent = caption;
      }
    };

    if (nextBtn) {
      nextBtn.addEventListener("click", (e) => {
        e.preventDefault();
        e.stopPropagation();
        showSlide(current + 1);
      });
    }

    if (prevBtn) {
      prevBtn.addEventListener("click", (e) => {
        e.preventDefault();
        e.stopPropagation();
        showSlide(current - 1);
      });
    }

    // Keyboard navigation when gallery is focused
    gallery.addEventListener("keydown", (e) => {
      if (e.key === "ArrowRight") {
        e.preventDefault();
        showSlide(current + 1);
      } else if (e.key === "ArrowLeft") {
        e.preventDefault();
        showSlide(current - 1);
      }
    });

    // Touch Swipe Support for Mobile Phones
    let touchStartX = 0;
    let touchStartY = 0;

    gallery.addEventListener("touchstart", (e) => {
      if (e.changedTouches.length === 1) {
        touchStartX = e.changedTouches[0].clientX;
        touchStartY = e.changedTouches[0].clientY;
      }
    }, { passive: true });

    gallery.addEventListener("touchend", (e) => {
      if (e.changedTouches.length === 1) {
        const touchEndX = e.changedTouches[0].clientX;
        const touchEndY = e.changedTouches[0].clientY;
        const diffX = touchEndX - touchStartX;
        const diffY = touchEndY - touchStartY;

        // Horizontal swipe detected (prevent conflict with vertical page scroll)
        if (Math.abs(diffX) > 40 && Math.abs(diffX) > Math.abs(diffY)) {
          if (diffX < 0) {
            showSlide(current + 1); // Swiped left -> next slide
          } else {
            showSlide(current - 1); // Swiped right -> prev slide
          }
        }
      }
    }, { passive: true });

    // Enlarge Button triggers fullscreen lightbox
    if (enlargeBtn) {
      enlargeBtn.addEventListener("click", (e) => {
        e.preventDefault();
        e.stopPropagation();
        const activeImg = slides[current].querySelector("img");
        if (activeImg) {
          const caption = slides[current].getAttribute("data-caption") || "Dashboard Screenshot";
          const projectTitle = gallery.closest(".project-card")?.querySelector("h3")?.textContent || "";
          openLightbox(activeImg.src, `${projectTitle} — ${caption}`);
        }
      });
    }

    // Auto-advancing slideshow — 4.5s, pauses on hover/focus
    let autoTimer = null;

    const startAuto = () => {
      if (total <= 1) return;
      autoTimer = setInterval(() => showSlide(current + 1), 4500);
    };

    const stopAuto = () => {
      clearInterval(autoTimer);
      autoTimer = null;
    };

    gallery.addEventListener("mouseenter", stopAuto);
    gallery.addEventListener("mouseleave", startAuto);
    gallery.addEventListener("focusin",    stopAuto);
    gallery.addEventListener("focusout",   startAuto);

    // Also stop on manual nav button click, restart after 8s
    const resetAutoOnManual = () => {
      stopAuto();
      setTimeout(startAuto, 8000);
    };

    if (nextBtn) nextBtn.addEventListener("click", resetAutoOnManual);
    if (prevBtn) prevBtn.addEventListener("click", resetAutoOnManual);

    startAuto();
  });

  // Apply initial filtering state
  applyFiltering();

  // 10. Video Demo Modal — 🎬 Dashboard Demo button handler
  const videoDemoModal  = document.getElementById("videoDemoModal");
  const videoModalClose = document.getElementById("videoModalCloseBtn");
  const videoModalBack  = document.getElementById("videoModalBackdrop");
  const modalPlayer     = document.getElementById("modalVideoPlayer");
  const modalDrivePlayer = document.getElementById("modalDrivePlayer");
  const modalSrc        = document.getElementById("modalVideoSource");
  const modalTitle      = document.getElementById("videoModalTitle");
  const modalSub        = document.getElementById("videoModalSub");
  const modalInteractive = document.getElementById("modalInteractivePreview");
  const modalPreviewImg  = document.getElementById("modalPreviewImg");
  const modalPreviewTitle = document.getElementById("modalPreviewTitle");
  const modalPreviewDesc  = document.getElementById("modalPreviewDesc");
  const modalRepoBtn      = document.getElementById("modalRepoBtn");

  const openVideoModal = (btn) => {
    if (!videoDemoModal) return;

    const driveEmbed = btn.dataset.driveEmbed || "";
    const videoUrl   = btn.dataset.video   || "";
    const fallback   = btn.dataset.fallback || "";
    const projectName = btn.dataset.demoProject || "Dashboard Demo";
    const lead        = btn.dataset.demoLead    || "";
    const preview     = btn.dataset.preview     || "";
    const repo        = btn.dataset.repo        || "#";

    if (modalTitle) modalTitle.textContent = projectName;
    if (modalSub)   modalSub.textContent   = lead;

    if (driveEmbed) {
      if (modalPlayer) { modalPlayer.pause(); modalPlayer.style.display = "none"; }
      if (modalInteractive) modalInteractive.style.display = "none";
      if (modalDrivePlayer) { modalDrivePlayer.src = driveEmbed; modalDrivePlayer.style.display = "block"; }
    } else if (videoUrl || fallback) {
      if (modalDrivePlayer) { modalDrivePlayer.src = ""; modalDrivePlayer.style.display = "none"; }
      if (modalPlayer) modalPlayer.style.display = "";
      if (modalInteractive) modalInteractive.style.display = "none";

      const src = videoUrl || fallback;
      if (modalSrc) { modalSrc.src = src; }
      if (modalPlayer) {
        modalPlayer.load();
        modalPlayer.play().catch(() => {});
      }
    } else {
      if (modalDrivePlayer) { modalDrivePlayer.src = ""; modalDrivePlayer.style.display = "none"; }
      // Show interactive preview mode (no video available)
      if (modalPlayer) modalPlayer.style.display = "none";
      if (modalInteractive) modalInteractive.style.display = "flex";
      if (modalPreviewImg)  modalPreviewImg.src  = preview;
      if (modalPreviewTitle) modalPreviewTitle.textContent = projectName;
      if (modalPreviewDesc)  modalPreviewDesc.textContent  = lead || "Explore full case study and dimensional models on GitHub.";
      if (modalRepoBtn)     modalRepoBtn.href    = repo;
    }

    videoDemoModal.classList.add("active");
    videoDemoModal.setAttribute("aria-hidden", "false");
    document.body.style.overflow = "hidden";
  };

  const closeVideoModal = () => {
    if (!videoDemoModal) return;
    videoDemoModal.classList.remove("active");
    videoDemoModal.setAttribute("aria-hidden", "true");
    document.body.style.overflow = "";
    if (modalPlayer) { modalPlayer.pause(); modalPlayer.currentTime = 0; }
    if (modalSrc) modalSrc.src = "";
    if (modalDrivePlayer) { modalDrivePlayer.src = ""; modalDrivePlayer.style.display = "none"; }
  };

  if (videoModalClose) videoModalClose.addEventListener("click", closeVideoModal);
  if (videoModalBack)  videoModalBack.addEventListener("click",  closeVideoModal);

  window.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && videoDemoModal?.classList.contains("active")) {
      closeVideoModal();
    }
  });

  // Wire up all "🎬 Dashboard Demo" buttons
  document.querySelectorAll(".action-btn-demo").forEach((btn) => {
    btn.addEventListener("click", () => openVideoModal(btn));
  });

  // 11. Scroll Reveal Observer
  if ("IntersectionObserver" in window) {
    const revealObserver = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          revealObserver.unobserve(entry.target);
        }
      });
    }, { threshold: 0.08, rootMargin: "0px 0px -40px 0px" });

    document.querySelectorAll(".reveal").forEach((el) => revealObserver.observe(el));
  } else {
    // Fallback: make all reveals visible immediately
    document.querySelectorAll(".reveal").forEach((el) => el.classList.add("is-visible"));
  }
});
