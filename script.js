// Portfolio Photos Data
const photos = [
  {
    id: 1,
    title: "Golden Hour Mood",
    category: "Portraits",
    src: "images/IMG_20240817_194908_798.jpg?v=15",
    width: 1800,
    height: 1800,
    sizeClass: "tall"
  },
  {
    id: 2,
    title: "Vibrant Cyan",
    category: "Creative",
    src: "images/Picsart_24-08-19_09-52-39-872.jpg?v=15",
    width: 1800,
    height: 1200,
    sizeClass: "normal"
  },
  {
    id: 3,
    title: "Neon Reflections",
    category: "Creative",
    src: "images/Picsart_24-08-19_09-58-24-028.jpg?v=15",
    width: 1800,
    height: 1200,
    sizeClass: "wide"
  },
  {
    id: 4,
    title: "Warm Silhouette",
    category: "Portraits",
    src: "images/Picsart_24-08-19_10-04-30-992.jpg?v=15",
    width: 1800,
    height: 1200,
    sizeClass: "normal"
  },
  {
    id: 5,
    title: "Urban Shadow",
    category: "Portraits",
    src: "images/Picsart_24-08-19_10-22-45-925.jpg?v=15",
    width: 1200,
    height: 1800,
    sizeClass: "large"
  },
  {
    id: 6,
    title: "Dreamy Overlay",
    category: "Creative",
    src: "images/Picsart_24-08-19_19-01-46-603.jpg?v=15",
    width: 1800,
    height: 1200,
    sizeClass: "normal"
  },
  {
    id: 7,
    title: "Sunlit Portrait",
    category: "Portraits",
    src: "images/Picsart_24-08-19_19-04-31-440.jpg?v=15",
    width: 1800,
    height: 1200,
    sizeClass: "normal"
  },
  {
    id: 8,
    title: "Midnight Blue",
    category: "Creative",
    src: "images/Picsart_24-08-19_19-20-37-794.jpg?v=15",
    width: 1800,
    height: 1200,
    sizeClass: "wide"
  },
  {
    id: 9,
    title: "Crimson Hue",
    category: "Creative",
    src: "images/Picsart_24-08-19_19-31-10-183.jpg?v=15",
    width: 1200,
    height: 1800,
    sizeClass: "normal"
  },
  {
    id: 10,
    title: "Ethereal Light",
    category: "Creative",
    src: "images/Picsart_26-04-30_13-45-27-417.jpg?v=15",
    width: 1800,
    height: 1800,
    sizeClass: "normal"
  },
  {
    id: 11,
    title: "Contrast Play",
    category: "Portraits",
    src: "images/new2.jpg?v=15",
    width: 1800,
    height: 1200,
    sizeClass: "normal"
  },
  {
    id: 12,
    title: "Scooty Ride",
    category: "Portraits",
    src: "images/media__1784133569099.jpg?v=15",
    width: 682,
    height: 1024,
    sizeClass: "tall"
  }
];

// Active State Variables
let currentPhotoIndex = 0;
let filteredPhotos = [...photos];

// DOM Elements
const galleryGrid = document.getElementById("galleryGrid");
const lightbox = document.getElementById("lightbox");
const lightboxImg = document.getElementById("lightboxImg");
const lightboxAmbient = document.getElementById("lightboxAmbient");
const lightboxProgress = document.getElementById("lightboxProgress");
const lightboxTitle = document.getElementById("lightboxTitle");
const lightboxCounter = document.getElementById("lightboxCounter");
const btnClose = document.getElementById("btnClose");

// Zoom & Pan State
let zoomScale = 1;
let panX = 0;
let panY = 0;

// Initialize Open Gallery & Lightbox
function initGallery() {
  try {
    localStorage.removeItem("sachin_portfolio_unlock_expiry");
  } catch (_) {}
  renderGallery(photos);
  renderProgressPills();
  setupLightbox();
}

// Render Top Story Progress Pills
function renderProgressPills() {
  if (!lightboxProgress) return;
  lightboxProgress.innerHTML = "";
  filteredPhotos.forEach((photo, idx) => {
    const pill = document.createElement("div");
    pill.className = "lightbox-progress-pill";
    pill.title = photo.title;
    pill.addEventListener("click", (e) => {
      e.stopPropagation();
      resetZoom();
      currentPhotoIndex = idx;
      updateLightboxContent(0);
    });
    lightboxProgress.appendChild(pill);
  });
}

function updateProgressPills() {
  if (!lightboxProgress) return;
  const pills = lightboxProgress.querySelectorAll(".lightbox-progress-pill");
  pills.forEach((pill, idx) => {
    pill.classList.toggle("passed", idx < currentPhotoIndex);
    pill.classList.toggle("active", idx === currentPhotoIndex);
  });
}

function resetZoom() {
  zoomScale = 1;
  panX = 0;
  panY = 0;
  if (lightboxImg) {
    lightboxImg.classList.remove("is-zoomed");
    lightboxImg.style.transition = "opacity 0.22s ease, transform 0.34s cubic-bezier(0.22, 1, 0.36, 1)";
    lightboxImg.style.transform = "translate3d(0, 0, 0) scale(1)";
  }
}

function applyTransform(withTransition = false) {
  if (!lightboxImg) return;
  lightboxImg.style.transition = withTransition
    ? "opacity 0.22s ease, transform 0.34s cubic-bezier(0.22, 1, 0.36, 1)"
    : "none";
  lightboxImg.style.transform = `translate3d(${panX}px, ${panY}px, 0) scale(${zoomScale})`;
  lightboxImg.classList.toggle("is-zoomed", zoomScale > 1.02);
}

function toggleDoubleTapZoom(clientX, clientY) {
  if (!lightboxImg) return;
  if (zoomScale > 1.05) {
    resetZoom();
  } else {
    const rect = lightboxImg.getBoundingClientRect();
    const offsetX = clientX - (rect.left + rect.width / 2);
    const offsetY = clientY - (rect.top + rect.height / 2);
    zoomScale = 2.25;
    panX = -offsetX * 0.85;
    panY = -offsetY * 0.85;
    applyTransform(true);
  }
}

// Render or Hydrate Photos in Grid
function renderGallery(items) {
  const existingItems = galleryGrid.querySelectorAll(".photo-item");
  if (existingItems.length === items.length) {
    existingItems.forEach((itemEl, index) => {
      const imgEl = itemEl.querySelector(".photo-img");
      if (imgEl) {
        const cleanFile = items[index].src.split("?")[0];
        const fallbackUrl = "https://raw.githubusercontent.com/sachinmandawi/sachinmandawi-com/main/" + cleanFile;
        const markLoaded = () => imgEl.classList.add("loaded");
        imgEl.onload = markLoaded;
        imgEl.onerror = () => {
          if (imgEl.src !== fallbackUrl) {
            imgEl.src = fallbackUrl;
          }
        };
        if (imgEl.complete && imgEl.naturalWidth > 0) {
          markLoaded();
        } else if (imgEl.complete && imgEl.naturalWidth === 0) {
          imgEl.src = fallbackUrl;
        }
      }
      itemEl.addEventListener("click", () => {
        openLightbox(index);
      });
    });
    return;
  }

  galleryGrid.innerHTML = "";
  
  items.forEach((photo, index) => {
    const itemEl = document.createElement("div");
    itemEl.className = `photo-item ${photo.sizeClass}`;
    itemEl.setAttribute("data-category", photo.category);
    
    const imgEl = document.createElement("img");
    imgEl.src = photo.src;
    imgEl.alt = `Sachin Mandawi - ${photo.title}`;
    imgEl.title = `Sachin Mandawi - ${photo.title}`;
    imgEl.width = photo.width;
    imgEl.height = photo.height;
    imgEl.className = "photo-img";
    imgEl.loading = index < 4 ? "eager" : "lazy";
    imgEl.decoding = "async";

    const markLoaded = () => imgEl.classList.add("loaded");
    imgEl.onload = markLoaded;
    if (imgEl.complete) markLoaded();

    itemEl.appendChild(imgEl);
    
    itemEl.addEventListener("click", () => {
      openLightbox(index);
    });
    
    galleryGrid.appendChild(itemEl);
  });
}

// Lightbox Core Logic (Live Finger Drag + Double-Tap/Pinch Zoom + Story Progress + Counter)
function setupLightbox() {
  if (btnClose) {
    btnClose.addEventListener("click", closeLightbox);
  }
  lightbox.addEventListener("click", (e) => {
    if (e.target === lightbox || e.target.classList.contains("lightbox-content")) {
      closeLightbox();
    }
  });

  // Keyboard navigation
  document.addEventListener("keydown", (e) => {
    if (!lightbox.classList.contains("active")) return;
    if (e.key === "ArrowRight") nextPhoto();
    if (e.key === "ArrowLeft") prevPhoto();
    if (e.key === "Escape") closeLightbox();
  });

  // Desktop Double-Click to Zoom & Mouse Drag Pan when zoomed
  let isMouseDown = false;
  let mouseStartX = 0;
  let mouseStartY = 0;
  let startPanX = 0;
  let startPanY = 0;

  lightboxImg.addEventListener("dblclick", (e) => {
    e.preventDefault();
    toggleDoubleTapZoom(e.clientX, e.clientY);
  });

  lightboxImg.addEventListener("mousedown", (e) => {
    if (zoomScale <= 1.02) return;
    e.preventDefault();
    isMouseDown = true;
    mouseStartX = e.clientX;
    mouseStartY = e.clientY;
    startPanX = panX;
    startPanY = panY;
  });

  window.addEventListener("mousemove", (e) => {
    if (!isMouseDown || zoomScale <= 1.02) return;
    panX = startPanX + (e.clientX - mouseStartX);
    panY = startPanY + (e.clientY - mouseStartY);
    applyTransform(false);
  });

  window.addEventListener("mouseup", () => {
    if (isMouseDown) {
      isMouseDown = false;
      clampPan();
    }
  });

  // Mobile Touch Physics: Live Drag Swipe, Double-Tap Zoom, and Pinch-to-Zoom
  let touchStartX = 0;
  let touchStartY = 0;
  let lastTouchX = 0;
  let lastTouchY = 0;
  let isDragging = false;
  let isPinching = false;
  let initialPinchDist = 0;
  let initialPinchScale = 1;
  let lastTapTime = 0;

  function getDistance(t1, t2) {
    const dx = t1.clientX - t2.clientX;
    const dy = t1.clientY - t2.clientY;
    return Math.hypot(dx, dy);
  }

  lightbox.addEventListener("touchstart", (e) => {
    if (e.target.closest(".lightbox-btn") || e.target.closest(".lightbox-progress")) return;

    if (e.touches.length === 2) {
      isPinching = true;
      isDragging = false;
      initialPinchDist = getDistance(e.touches[0], e.touches[1]);
      initialPinchScale = zoomScale;
      return;
    }

    if (e.touches.length === 1) {
      const t = e.touches[0];
      touchStartX = t.clientX;
      touchStartY = t.clientY;
      lastTouchX = t.clientX;
      lastTouchY = t.clientY;
      startPanX = panX;
      startPanY = panY;
      isDragging = true;
    }
  }, { passive: true });

  lightbox.addEventListener("touchmove", (e) => {
    if (!lightbox.classList.contains("active")) return;

    if (isPinching && e.touches.length === 2) {
      const dist = getDistance(e.touches[0], e.touches[1]);
      if (initialPinchDist > 0) {
        zoomScale = Math.min(3.5, Math.max(1, initialPinchScale * (dist / initialPinchDist)));
        applyTransform(false);
      }
      return;
    }

    if (!isDragging || e.touches.length !== 1) return;
    const t = e.touches[0];
    lastTouchX = t.clientX;
    lastTouchY = t.clientY;
    const dx = lastTouchX - touchStartX;
    const dy = lastTouchY - touchStartY;

    // If zoomed in, pan around the image
    if (zoomScale > 1.02) {
      panX = startPanX + dx;
      panY = startPanY + dy;
      applyTransform(false);
      return;
    }

    // Real-Time Finger Drag Physics (Instagram-Style)
    lightboxImg.style.transition = "none";
    if (Math.abs(dx) >= Math.abs(dy)) {
      const tilt = Math.max(-6, Math.min(6, dx * 0.024));
      lightboxImg.style.transform = `translate3d(${dx}px, ${dy * 0.18}px, 0) rotate(${tilt}deg) scale(0.985)`;
    } else {
      const shrink = Math.max(0.76, 1 - Math.abs(dy) / 850);
      lightboxImg.style.transform = `translate3d(${dx * 0.25}px, ${dy}px, 0) scale(${shrink})`;
    }
  }, { passive: true });

  lightbox.addEventListener("touchend", (e) => {
    if (isPinching) {
      if (e.touches.length < 2) {
        isPinching = false;
        if (zoomScale <= 1.05) {
          resetZoom();
        } else {
          clampPan();
        }
      }
      return;
    }

    if (!isDragging) return;
    isDragging = false;

    const dx = lastTouchX - touchStartX;
    const dy = lastTouchY - touchStartY;
    const moveDist = Math.hypot(dx, dy);

    // Check for Double-Tap on the image when tap movement is small
    const now = Date.now();
    if (moveDist < 12 && e.target === lightboxImg) {
      if (now - lastTapTime < 280) {
        toggleDoubleTapZoom(lastTouchX, lastTouchY);
        lastTapTime = 0;
        return;
      }
      lastTapTime = now;
    }

    if (zoomScale > 1.02) {
      clampPan();
      return;
    }

    const thresholdX = 48;
    const thresholdY = 82;

    if (Math.abs(dx) > Math.abs(dy) && Math.abs(dx) > thresholdX) {
      if (dx > 0) {
        prevPhoto(1);
      } else {
        nextPhoto(-1);
      }
    } else if (Math.abs(dy) > Math.abs(dx) && Math.abs(dy) > thresholdY) {
      closeLightbox();
    } else {
      // Spring back to center
      lightboxImg.style.transition = "transform 0.32s cubic-bezier(0.22, 1, 0.36, 1)";
      lightboxImg.style.transform = "translate3d(0, 0, 0) scale(1)";
    }
  }, { passive: true });
}

function clampPan() {
  if (!lightboxImg) return;
  const maxPanX = ((lightboxImg.clientWidth || 300) * (zoomScale - 1)) / 2;
  const maxPanY = ((lightboxImg.clientHeight || 300) * (zoomScale - 1)) / 2;
  panX = Math.max(-maxPanX, Math.min(maxPanX, panX));
  panY = Math.max(-maxPanY, Math.min(maxPanY, panY));
  applyTransform(true);
}

// Open Lightbox
function openLightbox(index) {
  currentPhotoIndex = index;
  resetZoom();
  updateLightboxContent(0);
  lightbox.classList.add("active");
  document.body.style.overflow = "hidden";
}

// Close Lightbox
function closeLightbox() {
  resetZoom();
  lightbox.classList.remove("active");
  document.body.style.overflow = "";
}

// Next Image (direction = -1 means swiped left, incoming enters from right)
function nextPhoto(direction = -1) {
  resetZoom();
  currentPhotoIndex = (currentPhotoIndex + 1) % filteredPhotos.length;
  updateLightboxContent(direction);
}

// Previous Image (direction = 1 means swiped right, incoming enters from left)
function prevPhoto(direction = 1) {
  resetZoom();
  currentPhotoIndex = (currentPhotoIndex - 1 + filteredPhotos.length) % filteredPhotos.length;
  updateLightboxContent(direction);
}

function preloadAdjacentPhotos(index) {
  if (!filteredPhotos || filteredPhotos.length <= 1) return;
  const prevIdx = (index - 1 + filteredPhotos.length) % filteredPhotos.length;
  const nextIdx = (index + 1) % filteredPhotos.length;
  [prevIdx, nextIdx].forEach((idx) => {
    const img = new Image();
    img.src = filteredPhotos[idx].src;
  });
}

// Update Lightbox Visuals with Spring Slide & Ambilight Sync
function updateLightboxContent(direction = 0) {
  const photo = filteredPhotos[currentPhotoIndex];
  if (!photo) return;

  const domItems = galleryGrid ? galleryGrid.querySelectorAll(".photo-item") : [];
  const domImg = domItems[currentPhotoIndex] ? domItems[currentPhotoIndex].querySelector(".photo-img") : null;
  const targetSrc = (domImg && (domImg.currentSrc || domImg.src)) ? (domImg.currentSrc || domImg.src) : photo.src;

  lightboxImg.src = targetSrc;
  lightboxImg.alt = `Sachin Mandawi - ${photo.title}`;
  lightboxImg.style.opacity = "1";

  // Sync Ambilight Background Glow
  if (lightboxAmbient) {
    lightboxAmbient.src = targetSrc;
  }

  // Sync Top Story Progress Bar & Bottom Info Pill
  updateProgressPills();
  if (lightboxTitle) lightboxTitle.textContent = photo.title;
  if (lightboxCounter) lightboxCounter.textContent = `${currentPhotoIndex + 1} / ${filteredPhotos.length}`;

  // Smooth spring slide-in when swiping left/right
  if (direction !== 0) {
    const enterFromX = direction < 0 ? 72 : -72;
    lightboxImg.style.transition = "none";
    lightboxImg.style.transform = `translate3d(${enterFromX}px, 0, 0) scale(0.96)`;
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        lightboxImg.style.transition = "opacity 0.22s ease, transform 0.34s cubic-bezier(0.22, 1, 0.36, 1)";
        lightboxImg.style.transform = "translate3d(0, 0, 0) scale(1)";
      });
    });
  } else {
    lightboxImg.style.transition = "opacity 0.22s ease, transform 0.34s cubic-bezier(0.22, 1, 0.36, 1)";
    lightboxImg.style.transform = "translate3d(0, 0, 0) scale(1)";
  }

  preloadAdjacentPhotos(currentPhotoIndex);
}

// Initialize on DOM Load
document.addEventListener("DOMContentLoaded", initGallery);

