/**
 * The Story — Sachin Mandawi
 * Apple-Style 60fps Canvas Image Sequence Scrubbing Engine
 * 
 * Features:
 *  - High-performance 6.7MB optimized image sequence (.jpg)
 *  - 2-Tier Interleaved Preloader (instant Tier-1 keyframes, seamless Tier-2 60fps fill)
 *  - Smart Closest-Loaded-Frame Fallback: Zero skipped scenes, zero freezing over network
 *  - True 100% Fullscreen Edge-to-Edge Cover on Mobile & Desktop
 *  - Arc flow: Normal (bare face) -> Sunglasses ON -> Reveal back to Normal
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
  const frames = new Array(TOTAL_FRAMES);
  let loadedCount = 0;
  let isInitialReady = false;

  let targetProgress = 0;
  let currentProgress = 0;
  let isTicking = false;

  let lastW = window.innerWidth;
  let lastH = window.innerHeight;

  // Helper to construct frame URL
  function getFrameSrc(index1Based) {
    const pad = String(index1Based).padStart(3, '0');
    return `frames/ezgif-frame-${pad}.jpg`;
  }

  // Two-Tier Priority Preloader
  // Tier 1: Keyframes every 3rd frame (1, 4, 7, ..., 89) for instant interactivity
  // Tier 2: All intermediate frames for buttery smooth 60fps fill
  function loadFrame(idx0Based, onDone) {
    if (frames[idx0Based]) return; // already loaded or loading

    const img = new Image();
    img.src = getFrameSrc(idx0Based + 1);

    img.onload = () => {
      loadedCount++;
      if (!isInitialReady && (loadedCount >= 8 || idx0Based === 0)) {
        isInitialReady = true;
        renderFrame();
      } else {
        renderFrame();
      }
      if (onDone) onDone();
    };

    img.onerror = () => {
      if (onDone) onDone();
    };

    frames[idx0Based] = img;
  }

  // Start preloading: Tier 1 first, then Tier 2
  const tier1Indices = [];
  const tier2Indices = [];

  for (let i = 0; i < TOTAL_FRAMES; i++) {
    if (i % 3 === 0 || i === TOTAL_FRAMES - 1) {
      tier1Indices.push(i);
    } else {
      tier2Indices.push(i);
    }
  }

  // Load Tier 1 immediately
  tier1Indices.forEach(idx => loadFrame(idx));

  // Load Tier 2 right after Tier 1 starts
  setTimeout(() => {
    tier2Indices.forEach(idx => loadFrame(idx));
  }, 100);

  // Resize canvas without mobile address-bar resize jitter
  function resizeCanvas(force = false) {
    const width = window.innerWidth;
    const height = window.innerHeight;

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
      currentProgress += diff * 0.18; // organic, responsive easing
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

  // Find best available frame: exact frame or closest loaded neighbour
  function getBestFrame(targetIdx) {
    const exact = frames[targetIdx];
    if (exact && exact.complete && exact.naturalWidth > 0) {
      return exact;
    }

    // Search outwards for nearest loaded frame so animation NEVER skips or freezes
    for (let offset = 1; offset < TOTAL_FRAMES; offset++) {
      const left = targetIdx - offset;
      if (left >= 0 && frames[left] && frames[left].complete && frames[left].naturalWidth > 0) {
        return frames[left];
      }
      const right = targetIdx + offset;
      if (right < TOTAL_FRAMES && frames[right] && frames[right].complete && frames[right].naturalWidth > 0) {
        return frames[right];
      }
    }
    return null;
  }

  function renderFrame() {
    const percent = Math.round(currentProgress * 100);

    // ARC FLOW:
    // 0% -> 50%: Normal face -> Wears sunglasses (Frame 1 -> Frame 89)
    // 50% -> 100%: Sunglasses ON -> Takes them off back to Normal Face Reveal (Frame 89 -> Frame 1)
    const cycleProgress = currentProgress <= 0.5
      ? currentProgress * 2
      : (1 - currentProgress) * 2;

    let targetIdx = Math.round(cycleProgress * (TOTAL_FRAMES - 1));
    targetIdx = Math.max(0, Math.min(TOTAL_FRAMES - 1, targetIdx));

    // Get exact frame or closest loaded neighbour (guarantees zero missing scenes)
    const img = getBestFrame(targetIdx);

    if (img) {
      drawCanvas(img);
    }

    // Update Progress UI
    if (scrubProgressBar) {
      scrubProgressBar.style.width = `${(currentProgress * 100).toFixed(1)}%`;
    }
    if (scrubPercentText) {
      scrubPercentText.textContent = `${percent}%`;
    }

    // Scroll Hint Cue
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

    // 2. Fullscreen Edge-to-Edge Cover Math across all devices
    const imgW = img.naturalWidth || 1920;
    const imgH = img.naturalHeight || 1080;

    // Cover: fills entire viewport width & height
    const ratio = Math.max(width / imgW, height / imgH);

    const drawW = imgW * ratio;
    const drawH = imgH * ratio;

    // Mathematical horizontal dead-center
    const drawX = (width - drawW) / 2;

    // Vertical positioning:
    // On ultrawide screens (drawH > height), bias towards upper third (0.35)
    // On mobile portrait, drawH === height, so drawY = 0 (fills top-to-bottom edge-to-edge)
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
