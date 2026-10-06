/**
 * The Story — Sachin Mandawi
 * Apple-Style 60fps Canvas Image Sequence Scrubbing Engine
 * Features:
 *  - Arc flow: Normal (no glasses) -> Sunglasses ON -> Reveal back to Normal
 *  - 100% True Fullscreen Cover on ALL devices (Mobile, Tablet, Desktop)
 *  - Zero cut-off, zero empty void: Full bleed portrait filling the viewport edge-to-edge
 *  - Zero mobile address-bar resize flicker
 */

document.addEventListener('DOMContentLoaded', () => {
  const canvas = document.getElementById('scrubCanvas');
  const ctx = canvas ? canvas.getContext('2d') : null;
  const scrubContainer = document.getElementById('scrubContainer');
  const scrubProgressBar = document.getElementById('scrubProgressBar');
  const scrubPercentText = document.getElementById('scrubPercentText');
  const scrollHint = document.getElementById('scrollHint');

  if (!canvas || !ctx || !scrubContainer) return;

  const TOTAL_FRAMES = 89;
  const frames = [];
  let loadedCount = 0;

  let targetProgress = 0;
  let currentProgress = 0;
  let isTicking = false;

  let lastW = window.innerWidth;
  let lastH = window.innerHeight;

  // Preload all 89 high-resolution frames
  for (let i = 1; i <= TOTAL_FRAMES; i++) {
    const img = new Image();
    const pad = String(i).padStart(3, '0');
    img.src = `frames/ezgif-frame-${pad}.png`;

    img.onload = () => {
      loadedCount++;
      // Render immediately once initial frame is ready
      if (loadedCount === 1 || i === 1) {
        renderFrame();
      }
    };
    frames.push(img);
  }

  // Handle Resize without mobile address-bar jitter
  function resizeCanvas(force = false) {
    const width = window.innerWidth;
    const height = window.innerHeight;

    // Mobile address-bar show/hide fires resize with minor vertical change
    const widthChanged = width !== lastW;
    const heightChanged = Math.abs(height - lastH) > 120;

    if (!force && !widthChanged && !heightChanged) {
      return;
    }

    lastW = width;
    lastH = height;

    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = Math.round(width * dpr);
    canvas.height = Math.round(height * dpr);

    renderFrame();
  }

  window.addEventListener('resize', () => resizeCanvas(false));
  window.addEventListener('orientationchange', () => {
    setTimeout(() => resizeCanvas(true), 150);
  });

  // Calculate scroll progress (0.0 to 1.0)
  function calculateProgress() {
    const rect = scrubContainer.getBoundingClientRect();
    const maxScroll = scrubContainer.offsetHeight - window.innerHeight;

    if (maxScroll <= 0) return 0;
    const scrollInside = -rect.top;
    return Math.max(0, Math.min(1, scrollInside / maxScroll));
  }

  function onScroll() {
    targetProgress = calculateProgress();
    if (!isTicking) {
      requestAnimationFrame(renderLoop);
      isTicking = true;
    }
  }

  window.addEventListener('scroll', onScroll, { passive: true });

  // Main 60fps LERP Render Loop
  function renderLoop() {
    const diff = targetProgress - currentProgress;

    if (Math.abs(diff) > 0.001) {
      currentProgress += diff * 0.16; // buttery smooth organic response
    } else {
      currentProgress = targetProgress;
    }

    renderFrame();

    if (Math.abs(targetProgress - currentProgress) > 0.001) {
      requestAnimationFrame(renderLoop);
    } else {
      isTicking = false;
    }
  }

  function renderFrame() {
    const percent = Math.round(currentProgress * 100);

    // ARC FLOW:
    // 0% -> 50%: Normal face -> Wears sunglasses (Frame 1 -> Frame 89)
    // 50% -> 100%: Sunglasses ON -> Takes them off back to Normal Face Reveal (Frame 89 -> Frame 1)
    const cycleProgress = currentProgress <= 0.5
      ? currentProgress * 2
      : (1 - currentProgress) * 2;

    let frameIdx = Math.round(cycleProgress * (TOTAL_FRAMES - 1));
    frameIdx = Math.max(0, Math.min(TOTAL_FRAMES - 1, frameIdx));
    const img = frames[frameIdx];

    // Draw on Canvas
    if (img && img.complete && img.naturalWidth > 0) {
      drawCanvas(img);
    }

    // Update Progress UI
    if (scrubProgressBar) {
      scrubProgressBar.style.width = `${(currentProgress * 100).toFixed(1)}%`;
    }
    if (scrubPercentText) {
      scrubPercentText.textContent = `${percent}%`;
    }

    // Scroll Hint Cue (fades out as soon as user starts scrolling)
    if (scrollHint) {
      if (currentProgress > 0.03) {
        scrollHint.style.opacity = '0';
        scrollHint.style.transform = 'translateX(-50%) translateY(10px)';
      } else {
        scrollHint.style.opacity = '1';
        scrollHint.style.transform = 'translateX(-50%) translateY(0)';
      }
    }
  }

  function drawCanvas(img) {
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const width = window.innerWidth;
    const height = window.innerHeight;

    const targetWidth = Math.round(width * dpr);
    const targetHeight = Math.round(height * dpr);

    if (canvas.width !== targetWidth || canvas.height !== targetHeight) {
      canvas.width = targetWidth;
      canvas.height = targetHeight;
    }

    ctx.save();
    ctx.scale(dpr, dpr);

    // 1. Solid pure OLED black background fill
    ctx.fillStyle = '#000000';
    ctx.fillRect(0, 0, width, height);

    // 2. 100% Edge-to-Edge Fullscreen Cover on ALL Devices
    const imgW = img.naturalWidth || 1920;
    const imgH = img.naturalHeight || 1080;

    // Cover ratio fills the entire viewport width and height completely
    const ratio = Math.max(width / imgW, height / imgH);

    const drawW = imgW * ratio;
    const drawH = imgH * ratio;

    // Perfect horizontal centering on all screens (mobile & desktop)
    const drawX = (width - drawW) / 2;

    // Vertical positioning:
    // When drawH is taller than viewport (e.g. ultrawide monitors), bias towards upper third (0.35)
    // On mobile portrait, drawH === height, so drawY is 0 (fills edge to edge with zero empty gaps)
    const drawY = drawH > height ? (height - drawH) * 0.35 : (height - drawH) / 2;

    ctx.drawImage(img, drawX, drawY, drawW, drawH);
    ctx.restore();
  }

  // Initial render setup
  resizeCanvas(true);
  targetProgress = calculateProgress();
  currentProgress = targetProgress;
  renderFrame();
});
