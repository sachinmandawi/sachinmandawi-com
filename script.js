// Portfolio Photos Data
const photos = [
  {
    id: 1,
    title: "Golden Hour Mood",
    category: "Portraits",
    src: "images/IMG_20240817_194908_798.jpg?v=5",
    width: 1800,
    height: 1800,
    sizeClass: "tall"
  },
  {
    id: 2,
    title: "Vibrant Cyan",
    category: "Creative",
    src: "images/Picsart_24-08-19_09-52-39-872.jpg?v=5",
    width: 1800,
    height: 1200,
    sizeClass: "normal"
  },
  {
    id: 3,
    title: "Neon Reflections",
    category: "Creative",
    src: "images/Picsart_24-08-19_09-58-24-028.jpg?v=5",
    width: 1800,
    height: 1200,
    sizeClass: "wide"
  },
  {
    id: 4,
    title: "Warm Silhouette",
    category: "Portraits",
    src: "images/Picsart_24-08-19_10-04-30-992.jpg?v=5",
    width: 1800,
    height: 1200,
    sizeClass: "normal"
  },
  {
    id: 5,
    title: "Urban Shadow",
    category: "Portraits",
    src: "images/Picsart_24-08-19_10-22-45-925.jpg?v=5",
    width: 1200,
    height: 1800,
    sizeClass: "large"
  },
  {
    id: 6,
    title: "Dreamy Overlay",
    category: "Creative",
    src: "images/Picsart_24-08-19_19-01-46-603.jpg?v=5",
    width: 1800,
    height: 1200,
    sizeClass: "normal"
  },
  {
    id: 7,
    title: "Sunlit Portrait",
    category: "Portraits",
    src: "images/Picsart_24-08-19_19-04-31-440.jpg?v=5",
    width: 1800,
    height: 1200,
    sizeClass: "normal"
  },
  {
    id: 8,
    title: "Midnight Blue",
    category: "Creative",
    src: "images/Picsart_24-08-19_19-20-37-794.jpg?v=5",
    width: 1800,
    height: 1200,
    sizeClass: "wide"
  },
  {
    id: 9,
    title: "Crimson Hue",
    category: "Creative",
    src: "images/Picsart_24-08-19_19-31-10-183.jpg?v=5",
    width: 1200,
    height: 1800,
    sizeClass: "normal"
  },
  {
    id: 10,
    title: "Ethereal Light",
    category: "Creative",
    src: "images/Picsart_26-04-30_13-45-27-417.jpg?v=5",
    width: 1800,
    height: 1800,
    sizeClass: "normal"
  },
  {
    id: 11,
    title: "Contrast Play",
    category: "Portraits",
    src: "images/new2.jpg?v=5",
    width: 1800,
    height: 1200,
    sizeClass: "normal"
  },
  {
    id: 12,
    title: "Scooty Ride",
    category: "Portraits",
    src: "images/media__1784133569099.jpg?v=5",
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
const lightboxTitle = document.getElementById("lightboxTitle");
const lightboxCounter = document.getElementById("lightboxCounter");
const btnClose = document.getElementById("btnClose");
const btnPrev = document.getElementById("btnPrev");
const btnNext = document.getElementById("btnNext");

// Initialize Open Gallery & Lightbox
function initGallery() {
  try {
    localStorage.removeItem("sachin_portfolio_unlock_expiry");
  } catch (_) {}
  renderGallery(photos);
  setupLightbox();
}

// Render Photos in Grid
function renderGallery(items) {
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
    
    // Open lightbox on click
    itemEl.addEventListener("click", () => {
      openLightbox(index);
    });
    
    galleryGrid.appendChild(itemEl);
  });
}

// Lightbox Core Logic
function setupLightbox() {
  // Close Lightbox
  btnClose.addEventListener("click", closeLightbox);
  lightbox.addEventListener("click", (e) => {
    if (e.target === lightbox || e.target.classList.contains("lightbox-content")) {
      closeLightbox();
    }
  });

  // Next / Prev Buttons
  btnNext.addEventListener("click", (e) => {
    e.stopPropagation();
    nextPhoto();
  });
  
  btnPrev.addEventListener("click", (e) => {
    e.stopPropagation();
    prevPhoto();
  });

  // Keyboard navigation
  document.addEventListener("keydown", (e) => {
    if (!lightbox.classList.contains("active")) return;
    
    if (e.key === "ArrowRight") nextPhoto();
    if (e.key === "ArrowLeft") prevPhoto();
    if (e.key === "Escape") closeLightbox();
  });

  // Touch/Swipe gestures for mobile devices
  let touchStartX = 0;
  let touchEndX = 0;
  let touchStartY = 0;
  let touchEndY = 0;

  lightbox.addEventListener("touchstart", (e) => {
    touchStartX = e.changedTouches[0].screenX;
    touchStartY = e.changedTouches[0].screenY;
  }, { passive: true });

  lightbox.addEventListener("touchend", (e) => {
    touchEndX = e.changedTouches[0].screenX;
    touchEndY = e.changedTouches[0].screenY;
    handleSwipe();
  }, { passive: true });

  function handleSwipe() {
    const thresholdX = 50; // Minimum swipe distance horizontally
    const thresholdY = 80; // Allow vertical swipes to close lightbox
    
    const diffX = touchEndX - touchStartX;
    const diffY = touchEndY - touchStartY;

    if (Math.abs(diffX) > Math.abs(diffY)) {
      // Horizontal Swipes
      if (Math.abs(diffX) > thresholdX) {
        if (diffX > 0) {
          prevPhoto(); // Swiped right -> previous photo
        } else {
          nextPhoto(); // Swiped left -> next photo
        }
      }
    } else {
      // Vertical Swipes
      if (Math.abs(diffY) > thresholdY) {
        closeLightbox(); // Swipe up or down -> close lightbox
      }
    }
  }
}

// Open Lightbox
function openLightbox(index) {
  currentPhotoIndex = index;
  updateLightboxContent();
  lightbox.classList.add("active");
  document.body.style.overflow = "hidden"; // Prevent scrolling
}

// Close Lightbox
function closeLightbox() {
  lightbox.classList.remove("active");
  document.body.style.overflow = ""; // Restore scrolling
}

// Next Image
function nextPhoto() {
  currentPhotoIndex = (currentPhotoIndex + 1) % filteredPhotos.length;
  updateLightboxContent();
}

// Previous Image
function prevPhoto() {
  currentPhotoIndex = (currentPhotoIndex - 1 + filteredPhotos.length) % filteredPhotos.length;
  updateLightboxContent();
}

let lightboxSwapTimeout = null;

function preloadAdjacentPhotos(index) {
  if (!filteredPhotos || filteredPhotos.length <= 1) return;
  const prevIdx = (index - 1 + filteredPhotos.length) % filteredPhotos.length;
  const nextIdx = (index + 1) % filteredPhotos.length;
  [prevIdx, nextIdx].forEach((idx) => {
    const img = new Image();
    img.src = filteredPhotos[idx].src;
  });
}

// Update Lightbox Visuals
function updateLightboxContent() {
  const photo = filteredPhotos[currentPhotoIndex];
  if (!photo) return;
  
  if (lightboxSwapTimeout) {
    clearTimeout(lightboxSwapTimeout);
    lightboxSwapTimeout = null;
  }

  // Fade out image and scale down slightly during swap
  lightboxImg.style.opacity = "0";
  lightboxImg.style.transform = "scale(0.95)";
  
  lightboxSwapTimeout = setTimeout(() => {
    const showLightboxImg = () => {
      lightboxImg.style.opacity = "1";
      lightboxImg.style.transform = "scale(1)";
    };
    lightboxImg.onload = showLightboxImg;
    lightboxImg.src = photo.src;
    lightboxImg.alt = photo.title;
    if (lightboxImg.complete && lightboxImg.naturalWidth > 0) {
      showLightboxImg();
    }
    lightboxTitle.textContent = photo.title;
    lightboxCounter.textContent = `${currentPhotoIndex + 1} / ${filteredPhotos.length}`;
    preloadAdjacentPhotos(currentPhotoIndex);
  }, 140);
}

// Initialize on DOM Load
document.addEventListener("DOMContentLoaded", initGallery);
