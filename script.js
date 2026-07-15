// Portfolio Photos Data
const photos = [
  {
    id: 1,
    title: "Golden Hour Mood",
    category: "Portraits",
    src: "images/IMG_20240817_194908_798.jpg",
    sizeClass: "tall"
  },
  {
    id: 2,
    title: "Vibrant Cyan",
    category: "Creative",
    src: "images/Picsart_24-08-19_09-52-39-872.jpg",
    sizeClass: "normal"
  },
  {
    id: 3,
    title: "Neon Reflections",
    category: "Creative",
    src: "images/Picsart_24-08-19_09-58-24-028.jpg",
    sizeClass: "wide"
  },
  {
    id: 4,
    title: "Warm Silhouette",
    category: "Portraits",
    src: "images/Picsart_24-08-19_10-04-30-992.jpg",
    sizeClass: "normal"
  },
  {
    id: 5,
    title: "Urban Shadow",
    category: "Portraits",
    src: "images/Picsart_24-08-19_10-22-45-925.jpg",
    sizeClass: "large"
  },
  {
    id: 6,
    title: "Dreamy Overlay",
    category: "Creative",
    src: "images/Picsart_24-08-19_19-01-46-603.jpg",
    sizeClass: "normal"
  },
  {
    id: 7,
    title: "Sunlit Portrait",
    category: "Portraits",
    src: "images/Picsart_24-08-19_19-04-31-440.jpg",
    sizeClass: "normal"
  },
  {
    id: 8,
    title: "Midnight Blue",
    category: "Creative",
    src: "images/Picsart_24-08-19_19-20-37-794.jpg",
    sizeClass: "wide"
  },
  {
    id: 9,
    title: "Crimson Hue",
    category: "Creative",
    src: "images/Picsart_24-08-19_19-31-10-183.jpg",
    sizeClass: "normal"
  },
  {
    id: 10,
    title: "Ethereal Light",
    category: "Creative",
    src: "images/Picsart_26-04-30_13-45-27-417.jpg",
    sizeClass: "normal"
  },
  {
    id: 11,
    title: "Contrast Play",
    category: "Portraits",
    src: "images/new2.jpg",
    sizeClass: "normal"
  },
  {
    id: 12,
    title: "Scooty Ride",
    category: "Portraits",
    src: "images/media__1784133569099.jpg",
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

// Initialize Gallery
function initGallery() {
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
    
    itemEl.innerHTML = `
      <img src="${photo.src}" alt="${photo.title}" class="photo-img" loading="lazy">
      <div class="photo-overlay">
        <h3 class="photo-title">${photo.title}</h3>
        <span class="photo-category">${photo.category}</span>
      </div>
    `;
    
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

// Update Lightbox Visuals
function updateLightboxContent() {
  const photo = filteredPhotos[currentPhotoIndex];
  
  // Fade out image and scale down slightly during swap
  lightboxImg.style.opacity = 0;
  lightboxImg.style.transform = "scale(0.95)";
  
  setTimeout(() => {
    lightboxImg.src = photo.src;
    lightboxImg.alt = photo.title;
    lightboxTitle.textContent = photo.title;
    lightboxCounter.textContent = `${currentPhotoIndex + 1} / ${filteredPhotos.length}`;
    
    // Fade in image and scale to normal
    lightboxImg.onload = () => {
      lightboxImg.style.opacity = 1;
      lightboxImg.style.transform = "scale(1)";
    };
  }, 150);
}

// Initialize on DOM Load
document.addEventListener("DOMContentLoaded", initGallery);
