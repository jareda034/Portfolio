const xpFill = document.getElementById("xp-fill");
const toast = document.getElementById("achievement-toast");
const cursorDot = document.getElementById("cursor-dot");
const cursorRing = document.getElementById("cursor-ring");

function updateXpBar() {
  if (!xpFill) {
    return;
  }

  const maxScroll = Math.max(1, document.documentElement.scrollHeight - window.innerHeight);
  const progress = Math.min(100, Math.max(0, (window.scrollY / maxScroll) * 100));
  xpFill.style.width = `${progress.toFixed(1)}%`;
}

function showToast(message) {
  if (!toast) {
    return;
  }

  toast.textContent = message;
  toast.classList.add("is-visible");
  window.setTimeout(() => {
    toast.classList.remove("is-visible");
  }, 1800);
}

function initRevealAnimations() {
  const revealTargets = document.querySelectorAll(".hero-section, .content-section");
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
        }
      });
    },
    { threshold: 0.18 },
  );

  revealTargets.forEach((el) => observer.observe(el));
}

function initAchievements() {
  const unlocks = [
    { id: "about", message: "Achievement Unlocked: Backstory Loaded" },
    { id: "projects", message: "Achievement Unlocked: Mission Deck Found" },
    { id: "contact", message: "Achievement Unlocked: Comms Channel Open" },
  ];

  const seen = new Set();
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) {
          return;
        }

        const match = unlocks.find((item) => item.id === entry.target.id);
        if (match && !seen.has(match.id)) {
          seen.add(match.id);
          showToast(match.message);
        }
      });
    },
    { threshold: 0.45 },
  );

  unlocks.forEach((item) => {
    const section = document.getElementById(item.id);
    if (section) {
      observer.observe(section);
    }
  });
}

function initGameCursor() {
  if (!window.matchMedia("(pointer: fine)").matches || !cursorDot || !cursorRing) {
    return;
  }

  document.body.classList.add("game-cursor");

  let rx = window.innerWidth / 2;
  let ry = window.innerHeight / 2;
  let tx = rx;
  let ty = ry;

  const tick = () => {
    rx += (tx - rx) * 0.2;
    ry += (ty - ry) * 0.2;

    cursorDot.style.left = `${tx}px`;
    cursorDot.style.top = `${ty}px`;
    cursorRing.style.left = `${rx}px`;
    cursorRing.style.top = `${ry}px`;

    requestAnimationFrame(tick);
  };

  document.addEventListener("mousemove", (event) => {
    tx = event.clientX;
    ty = event.clientY;
  });

  document.querySelectorAll("a, button, .project-tile").forEach((el) => {
    el.addEventListener("mouseenter", () => cursorRing.classList.add("is-hot"));
    el.addEventListener("mouseleave", () => cursorRing.classList.remove("is-hot"));
  });

  tick();
}

function initProjectTileButtons() {
  const clickableTiles = document.querySelectorAll(".project-tile[data-project-url]");

  clickableTiles.forEach((tile) => {
    const targetUrl = tile.getAttribute("data-project-url");
    if (!targetUrl) {
      return;
    }

    const title = tile.querySelector("h3")?.textContent?.trim();
    tile.setAttribute("role", "button");
    tile.setAttribute("tabindex", "0");
    tile.setAttribute("aria-label", title ? `Open ${title} project page` : "Open project page");

    const navigateToProject = () => {
      window.location.href = targetUrl;
    };

    tile.addEventListener("click", (event) => {
      const interactiveTarget = event.target.closest("a, button, input, select, textarea, [role='button']");
      if (interactiveTarget && interactiveTarget !== tile) {
        return;
      }

      navigateToProject();
    });

    tile.addEventListener("keydown", (event) => {
      if (event.key === "Enter" || event.key === " ") {
        event.preventDefault();
        navigateToProject();
      }
    });
  });
}

window.addEventListener("scroll", updateXpBar, { passive: true });

function initImageLightbox() {
  let currentImageIndex = 0;
  let currentGalleryImages = [];

  const modal = document.getElementById("image-lightbox");
  if (!modal) return;

  const modalImage = modal.querySelector(".lightbox-image-container img");
  const closeBtn = modal.querySelector(".lightbox-close-button");
  const prevBtn = modal.querySelector(".lightbox-prev-button");
  const nextBtn = modal.querySelector(".lightbox-next-button");
  const counter = modal.querySelector(".lightbox-counter");

  function openLightbox(imageElement) {
    const gallery = imageElement.closest(".screenshot-gallery");
    if (!gallery) return;

    currentGalleryImages = Array.from(gallery.querySelectorAll("img"));
    currentImageIndex = currentGalleryImages.indexOf(imageElement);

    showImage(currentImageIndex);
    modal.classList.add("is-open");
    document.body.style.overflow = "hidden";
  }

  function closeLightbox() {
    modal.classList.remove("is-open");
    document.body.style.overflow = "";
  }

  function showImage(index) {
    if (index < 0 || index >= currentGalleryImages.length) return;

    currentImageIndex = index;
    const img = currentGalleryImages[index];
    modalImage.src = img.src;
    modalImage.alt = img.alt;

    prevBtn.disabled = index === 0;
    nextBtn.disabled = index === currentGalleryImages.length - 1;

    counter.textContent = `${index + 1} / ${currentGalleryImages.length}`;
  }

  // Event listeners
  document.querySelectorAll(".screenshot-gallery img").forEach((img) => {
    img.addEventListener("click", () => openLightbox(img));
  });

  closeBtn.addEventListener("click", closeLightbox);
  prevBtn.addEventListener("click", () => showImage(currentImageIndex - 1));
  nextBtn.addEventListener("click", () => showImage(currentImageIndex + 1));

  // Keyboard navigation
  document.addEventListener("keydown", (e) => {
    if (!modal.classList.contains("is-open")) return;

    if (e.key === "Escape") closeLightbox();
    if (e.key === "ArrowLeft" && currentImageIndex > 0) showImage(currentImageIndex - 1);
    if (e.key === "ArrowRight" && currentImageIndex < currentGalleryImages.length - 1) {
      showImage(currentImageIndex + 1);
    }
  });

  // Close on background click
  modal.addEventListener("click", (e) => {
    if (e.target === modal) closeLightbox();
  });
}
window.addEventListener("resize", updateXpBar);

updateXpBar();
initRevealAnimations();
initAchievements();
initProjectTileButtons();
initGameCursor();
initImageLightbox();
