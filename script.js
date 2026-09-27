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
let countdownInterval = null;
const UNLOCK_DURATION_MS = 5 * 60 * 1000; // 5 minutes
const STORAGE_KEY = "sachin_portfolio_unlock_expiry";

// DOM Elements
const galleryGrid = document.getElementById("galleryGrid");
const vaultGate = document.getElementById("vaultGate");
const btnShowVault = document.getElementById("btnShowVault");
const btnCloseVault = document.getElementById("btnCloseVault");
const vaultFormCard = document.getElementById("vaultFormCard");
const dobDayInput = document.getElementById("dobDayInput");
const dobYearInput = document.getElementById("dobYearInput");
const btnMonthToggle = document.getElementById("btnMonthToggle");
const selectedMonthText = document.getElementById("selectedMonthText");
const monthPickerGrid = document.getElementById("monthPickerGrid");
const monthPills = document.querySelectorAll(".month-pill");
const stepBtns = document.querySelectorAll(".step-btn");
const vaultError = document.getElementById("vaultError");
const btnConfirmUnlock = document.getElementById("btnConfirmUnlock");
const unlockTimerBar = document.getElementById("unlockTimerBar");
const timerCountdown = document.getElementById("timerCountdown");
const btnLockNow = document.getElementById("btnLockNow");

const lightbox = document.getElementById("lightbox");
const lightboxImg = document.getElementById("lightboxImg");
const lightboxTitle = document.getElementById("lightboxTitle");
const lightboxCounter = document.getElementById("lightboxCounter");
const btnClose = document.getElementById("btnClose");
const btnPrev = document.getElementById("btnPrev");
const btnNext = document.getElementById("btnNext");

let selectedMonth = 0; // 1 = Jan ... 5 = May ... 12 = Dec
const MONTH_NAMES = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

// Initialize Gallery & Vault Gate
function initGallery() {
  setupVaultEvents();
  setupLightbox();
  checkExistingUnlockSession();
}

function resetVaultInputs() {
  dobDayInput.value = "";
  dobYearInput.value = "";
  selectedMonth = 0;
  selectedMonthText.textContent = "";
  monthPills.forEach((p) => p.classList.remove("selected"));
  monthPickerGrid.classList.add("hidden");
  btnMonthToggle.classList.remove("active");
  vaultError.classList.add("hidden");
}

function setupVaultEvents() {
  // Clicking "Unlock Photos" hides the trigger button and reveals the smart vault card
  btnShowVault.addEventListener("click", () => {
    resetVaultInputs();
    btnShowVault.classList.add("hidden");
    vaultFormCard.classList.remove("hidden");
  });

  // Clicking "✕" closes the vault card, clears inputs, and restores the "Unlock Photos" button
  btnCloseVault.addEventListener("click", () => {
    resetVaultInputs();
    vaultFormCard.classList.add("hidden");
    btnShowVault.classList.remove("hidden");
  });

  // Month toggle button toggles the custom 12-month pill grid
  btnMonthToggle.addEventListener("click", (e) => {
    e.stopPropagation();
    monthPickerGrid.classList.toggle("hidden");
    btnMonthToggle.classList.toggle("active");
  });

  // Clicking outside the month picker grid closes it automatically
  document.addEventListener("click", (e) => {
    if (
      !monthPickerGrid.classList.contains("hidden") &&
      !monthPickerGrid.contains(e.target) &&
      !btnMonthToggle.contains(e.target)
    ) {
      monthPickerGrid.classList.add("hidden");
      btnMonthToggle.classList.remove("active");
    }
  });

  // Escape key closes month grid first, then vault card
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && !vaultFormCard.classList.contains("hidden")) {
      if (!monthPickerGrid.classList.contains("hidden")) {
        monthPickerGrid.classList.add("hidden");
        btnMonthToggle.classList.remove("active");
      } else {
        resetVaultInputs();
        vaultFormCard.classList.add("hidden");
        btnShowVault.classList.remove("hidden");
      }
    }
  });

  // Month pill selection
  monthPills.forEach((pill) => {
    pill.addEventListener("click", () => {
      selectedMonth = parseInt(pill.getAttribute("data-month"), 10);
      selectedMonthText.textContent = MONTH_NAMES[selectedMonth - 1];
      monthPills.forEach((p) => p.classList.remove("selected"));
      pill.classList.add("selected");
      // Auto-collapse month grid after selecting a month
      monthPickerGrid.classList.add("hidden");
      btnMonthToggle.classList.remove("active");
      vaultError.classList.add("hidden");
    });
  });

  // Stepper buttons (+ / - for Day and Year) with accurate first-click behavior
  stepBtns.forEach((btn) => {
    btn.addEventListener("click", () => {
      const action = btn.getAttribute("data-action");
      vaultError.classList.add("hidden");

      if (action === "day-up" || action === "day-down") {
        const raw = dobDayInput.value.trim();
        let cur;
        if (raw === "") {
          cur = action === "day-up" ? 1 : 31;
        } else {
          cur = parseInt(raw, 10) || 1;
          cur = action === "day-up" ? (cur >= 31 ? 1 : cur + 1) : (cur <= 1 ? 31 : cur - 1);
        }
        dobDayInput.value = String(cur).padStart(2, "0");
      } else if (action === "year-up" || action === "year-down") {
        const raw = dobYearInput.value.trim();
        let cur;
        if (raw === "") {
          cur = 2000;
        } else {
          cur = parseInt(raw, 10) || 2000;
          cur = action === "year-up" ? Math.min(2026, cur + 1) : Math.max(1980, cur - 1);
        }
        dobYearInput.value = String(cur);
      }
    });
  });

  // Numeric input listeners
  dobDayInput.addEventListener("focus", () => {
    monthPickerGrid.classList.add("hidden");
    btnMonthToggle.classList.remove("active");
  });

  dobYearInput.addEventListener("focus", () => {
    monthPickerGrid.classList.add("hidden");
    btnMonthToggle.classList.remove("active");
  });

  dobDayInput.addEventListener("input", () => {
    dobDayInput.value = dobDayInput.value.replace(/\D/g, "").slice(0, 2);
    vaultError.classList.add("hidden");
  });

  dobDayInput.addEventListener("blur", () => {
    if (dobDayInput.value !== "") {
      let d = parseInt(dobDayInput.value, 10);
      if (isNaN(d) || d < 1) d = 1;
      if (d > 31) d = 31;
      dobDayInput.value = String(d).padStart(2, "0");
    }
  });

  dobYearInput.addEventListener("input", () => {
    dobYearInput.value = dobYearInput.value.replace(/\D/g, "").slice(0, 4);
    vaultError.classList.add("hidden");
  });

  [dobDayInput, dobYearInput].forEach((inputEl) => {
    inputEl.addEventListener("keydown", (e) => {
      if (e.key === "Enter") verifyAndUnlock();
    });
  });

  btnConfirmUnlock.addEventListener("click", verifyAndUnlock);

  btnLockNow.addEventListener("click", () => {
    lockGallery();
  });
}

function isBirthdayMatch() {
  const day = parseInt(dobDayInput.value, 10);
  const year = parseInt(dobYearInput.value, 10);
  return day === 21 && selectedMonth === 5 && year === 2003;
}

function verifyAndUnlock() {
  // Target Birthday: 21 May 2003
  if (isBirthdayMatch()) {
    vaultError.classList.add("hidden");
    const expiryTime = Date.now() + UNLOCK_DURATION_MS;
    localStorage.setItem(STORAGE_KEY, String(expiryTime));
    unlockGallery(expiryTime);
  } else {
    vaultError.classList.remove("hidden");
    vaultFormCard.classList.remove("shake");
    void vaultFormCard.offsetWidth; // Trigger reflow for shake animation
    vaultFormCard.classList.add("shake");
  }
}

function checkExistingUnlockSession() {
  const savedExpiry = parseInt(localStorage.getItem(STORAGE_KEY) || "0", 10);
  if (savedExpiry > Date.now()) {
    unlockGallery(savedExpiry);
  } else {
    lockGallery();
  }
}

function unlockGallery(expiryTime) {
  vaultGate.classList.add("hidden");
  unlockTimerBar.classList.remove("hidden");
  galleryGrid.classList.remove("hidden");
  renderGallery(photos);

  if (countdownInterval) clearInterval(countdownInterval);
  updateTimerDisplay(expiryTime);

  countdownInterval = setInterval(() => {
    updateTimerDisplay(expiryTime);
  }, 1000);
}

function updateTimerDisplay(expiryTime) {
  const remainingMs = expiryTime - Date.now();
  if (remainingMs <= 0) {
    lockGallery();
    return;
  }
  const totalSeconds = Math.ceil(remainingMs / 1000);
  const mins = String(Math.floor(totalSeconds / 60)).padStart(2, "0");
  const secs = String(totalSeconds % 60).padStart(2, "0");
  timerCountdown.textContent = `${mins}:${secs}`;
}

function lockGallery() {
  if (countdownInterval) {
    clearInterval(countdownInterval);
    countdownInterval = null;
  }
  localStorage.removeItem(STORAGE_KEY);
  closeLightbox();
  lightboxImg.src = "";
  lightboxTitle.textContent = "";
  galleryGrid.innerHTML = "";
  galleryGrid.classList.add("hidden");
  unlockTimerBar.classList.add("hidden");
  vaultFormCard.classList.add("hidden");
  btnShowVault.classList.remove("hidden");
  vaultGate.classList.remove("hidden");
  resetVaultInputs();
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
  if (!photo) return;
  
  // Fade out image and scale down slightly during swap
  lightboxImg.style.opacity = "0";
  lightboxImg.style.transform = "scale(0.95)";
  
  setTimeout(() => {
    lightboxImg.onload = () => {
      lightboxImg.style.opacity = "1";
      lightboxImg.style.transform = "scale(1)";
    };
    lightboxImg.src = photo.src;
    lightboxImg.alt = photo.title;
    lightboxTitle.textContent = photo.title;
    lightboxCounter.textContent = `${currentPhotoIndex + 1} / ${filteredPhotos.length}`;
  }, 150);
}

// Initialize on DOM Load
document.addEventListener("DOMContentLoaded", initGallery);
