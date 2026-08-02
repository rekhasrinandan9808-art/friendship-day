/* =========================================================
   FRIENDSHIP DAY — friendship.js
   ========================================================= */

const gradientBg = document.getElementById("gradientBg");
const starsLayer = document.getElementById("starsLayer");
const floatingLayer = document.getElementById("floatingLayer");
const confettiCanvas = document.getElementById("confettiCanvas");
const card = document.getElementById("card");
const cardContainer = document.getElementById("cardContainer");
const form = document.getElementById("surpriseForm");
const yourNameInput = document.getElementById("yourName");
const friendNameInput = document.getElementById("friendName");
const formError = document.getElementById("formError");
const messageContent = document.getElementById("messageContent");
const quoteEl = document.getElementById("quote");
const copyBtn = document.getElementById("copyBtn");
const downloadBtn = document.getElementById("downloadBtn");
const shareBtn = document.getElementById("shareBtn");
const resetBtn = document.getElementById("resetBtn");
const toastEl = document.getElementById("toast");
const nextSlideBtn = document.getElementById("nextSlideBtn");
const stickerStage = document.getElementById("stickerStage");
const stickerBackBtn = document.getElementById("stickerBackBtn");
const stickerResetBtn = document.getElementById("stickerResetBtn");
const soundToggle = document.getElementById("soundToggle");

const ctx = confettiCanvas.getContext("2d");

let uploadedImageDataUrl = null;

const state = {
  yourName: "",
  friendName: "",
  isNight: false,
  soundEnabled: true
};

// --- Web Audio Synthesizer ---
const audioCtx = new (window.AudioContext || window.webkitAudioContext)();

function playTone(freq, type, duration, gainValue = 0.1) {
  if (!state.soundEnabled) return;
  try {
    if (audioCtx.state === "suspended") {
      audioCtx.resume();
    }
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(freq, audioCtx.currentTime);
    gain.gain.setValueAtTime(gainValue, audioCtx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.0001, audioCtx.currentTime + duration);
    osc.connect(gain);
    gain.connect(audioCtx.destination);
    osc.start();
    osc.stop(audioCtx.currentTime + duration);
  } catch (e) {}
}

function playFlipSound() {
  playTone(440, "sine", 0.3, 0.08);
  setTimeout(() => playTone(880, "sine", 0.4, 0.05), 100);
}

function playPopSound() {
  playTone(523.25, "triangle", 0.15, 0.12);
  setTimeout(() => playTone(659.25, "triangle", 0.2, 0.1), 80);
}

function toggleSound() {
  state.soundEnabled = !state.soundEnabled;
  soundToggle.textContent = state.soundEnabled ? "🔊" : "🔇";
  showToast(state.soundEnabled ? "Sound enabled 🔊" : "Sound muted 🔇");
}

// --- Lightbox Image Maximizer ---
function createLightbox() {
  let lightbox = document.getElementById("imageLightbox");
  if (!lightbox) {
    lightbox = document.createElement("div");
    lightbox.id = "imageLightbox";
    lightbox.className = "image-lightbox";
    lightbox.innerHTML = `
      <img id="lightboxImg" src="" alt="Maximized Memory Photo" />
      <span class="lightbox-close-hint">Click anywhere to close</span>
    `;
    document.body.appendChild(lightbox);

    lightbox.addEventListener("click", () => {
      lightbox.classList.remove("active");
    });
  }
}

function maximizeImage(src) {
  if (!src) return;
  createLightbox();
  const lightbox = document.getElementById("imageLightbox");
  const lightboxImg = document.getElementById("lightboxImg");
  lightboxImg.src = src;
  lightbox.classList.add("active");
}

document.addEventListener("click", (e) => {
  const polaroid = e.target.closest(".polaroid-frame");
  if (polaroid) {
    const img = polaroid.querySelector("img");
    if (img && img.src) {
      maximizeImage(img.src);
    }
  }
});

// --- Helper Utilities ---
function roundRect(c, x, y, w, h, r) {
  c.beginPath();
  c.moveTo(x + r, y);
  c.arcTo(x + w, y, x + w, y + h, r);
  c.arcTo(x + w, y + h, x, y + h, r);
  c.arcTo(x, y + h, x, y, r);
  c.arcTo(x, y, x + w, y, r);
  c.closePath();
}

function showToast(msg) {
  toastEl.textContent = msg;
  toastEl.classList.add("visible");
  clearTimeout(showToast._t);
  showToast._t = setTimeout(() => toastEl.classList.remove("visible"), 2200);
}

// --- Ambient FX ---
function initFloatingAmbient() {
  const icons = ["💙", "💕", "✨", "⭐", "🙂", "💫", "🎀", "🌸", "🦋", "💌", "🧸", "🌟"];
  const count = 22;
  for (let i = 0; i < count; i++) {
    const span = document.createElement("span");
    span.className = "floaty";
    span.textContent = icons[Math.floor(Math.random() * icons.length)];
    const size = 14 + Math.random() * 18;
    const duration = 10 + Math.random() * 10;
    const delay = Math.random() * 14;
    span.style.left = Math.random() * 100 + "vw";
    span.style.fontSize = size + "px";
    span.style.animationDuration = duration + "s";
    span.style.animationDelay = -delay + "s";
    floatingLayer.appendChild(span);
  }
}

function initStars() {
  const count = 90;
  for (let i = 0; i < count; i++) {
    const star = document.createElement("div");
    star.className = "star";
    const size = Math.random() * 2.4 + 1;
    star.style.width = size + "px";
    star.style.height = size + "px";
    star.style.top = Math.random() * 100 + "%";
    star.style.left = Math.random() * 100 + "%";
    star.style.animationDuration = 2 + Math.random() * 3 + "s";
    star.style.animationDelay = Math.random() * 4 + "s";
    starsLayer.appendChild(star);
  }
}

function startNightMode() {
  if (state.isNight) return;
  state.isNight = true;
  document.body.classList.add("night");
  gradientBg.classList.add("night");
  starsLayer.classList.add("visible");
}

function stopNightMode() {
  state.isNight = false;
  document.body.classList.remove("night");
  gradientBg.classList.remove("night");
  starsLayer.classList.remove("visible");
}

// --- High-Performance Image Compression ---
function compressImage(dataUrl, maxWidth = 320, quality = 0.5) {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement("canvas");
      let width = img.width;
      let height = img.height;

      if (width > maxWidth) {
        height = Math.round((height * maxWidth) / width);
        width = maxWidth;
      }

      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext("2d");
      ctx.drawImage(img, 0, 0, width, height);

      resolve(canvas.toDataURL("image/webp", quality));
    };
    img.src = dataUrl;
  });
}

function setPhotoSource(dataUrl) {
  uploadedImageDataUrl = dataUrl;
  const frontImg = document.getElementById("polaroidImg");
  const backImg = document.getElementById("cardBackPolaroidImg");
  if (frontImg) frontImg.src = dataUrl;
  if (backImg) backImg.src = dataUrl;

  document.getElementById("polaroidPreview").hidden = false;
  const cardBackPolaroid = document.getElementById("cardBackPolaroid");
  if (cardBackPolaroid) cardBackPolaroid.hidden = false;
}

document.getElementById("photoUpload").addEventListener("change", async (e) => {
  const file = e.target.files[0];
  if (file) {
    const reader = new FileReader();
    reader.onload = async (event) => {
      const compressed = await compressImage(event.target.result);
      setPhotoSource(compressed);
      showToast("Photo processed successfully! ✨");
    };
    reader.readAsDataURL(file);
  }
});

// --- Scratch-Card Engine ---
function initScratchCard() {
  const canvas = document.getElementById("scratchCanvas");
  if (!canvas) return;
  const ctxScratch = canvas.getContext("2d");
  const rect = canvas.getBoundingClientRect();

  canvas.style.opacity = "1";
  canvas.style.pointerEvents = "auto";
  canvas.width = rect.width || 360;
  canvas.height = rect.height || 200;

  const grad = ctxScratch.createLinearGradient(0, 0, canvas.width, canvas.height);
  grad.addColorStop(0, "#d4af37");
  grad.addColorStop(0.5, "#fff2a8");
  grad.addColorStop(1, "#aa7c11");
  ctxScratch.fillStyle = grad;
  ctxScratch.fillRect(0, 0, canvas.width, canvas.height);

  ctxScratch.fillStyle = "#4a3b10";
  ctxScratch.font = "bold 16px Poppins";
  ctxScratch.textAlign = "center";
  ctxScratch.fillText("✨ Scratch to Reveal Message! ✨", canvas.width / 2, canvas.height / 2);

  let isScratching = false;

  function checkScratchPercentage() {
    const imgData = ctxScratch.getImageData(0, 0, canvas.width, canvas.height);
    const pixels = imgData.data;
    let clearedCount = 0;

    for (let i = 3; i < pixels.length; i += 4) {
      if (pixels[i] === 0) clearedCount++;
    }

    const percentageScratched = clearedCount / (pixels.length / 4);

    if (percentageScratched >= 0.60) {
      canvas.style.transition = "opacity 0.6s ease";
      canvas.style.opacity = "0";
      setTimeout(() => {
        canvas.style.pointerEvents = "none";
      }, 600);
    }
  }

  function scratch(e) {
    if (!isScratching) return;
    const r = canvas.getBoundingClientRect();
    const x = (e.clientX || (e.touches && e.touches[0].clientX)) - r.left;
    const y = (e.clientY || (e.touches && e.touches[0].clientY)) - r.top;

    ctxScratch.globalCompositeOperation = "destination-out";
    ctxScratch.beginPath();
    ctxScratch.arc(x, y, 26, 0, Math.PI * 2);
    ctxScratch.fill();

    checkScratchPercentage();
  }

  ["mousedown", "touchstart"].forEach(evt => canvas.addEventListener(evt, (e) => { isScratching = true; scratch(e); }));
  ["mousemove", "touchmove"].forEach(evt => canvas.addEventListener(evt, scratch));
  ["mouseup", "touchend"].forEach(evt => canvas.addEventListener(evt, () => { isScratching = false; }));
}

function claimCoupon(el) {
  if (!el.classList.contains("claimed")) {
    el.classList.add("claimed");
    el.querySelector(".stamp").textContent = "CLAIMED! 🎟️";
    showToast("Coupon Redeemed! 🥳");
  }
}

// --- Card Logic ---
function buildMessageLines(friend, you) {
  return [
    `Dear ${friend},`,
    "Thank you for being an amazing friend.",
    "Wishing you endless happiness and unforgettable memories.",
    "Happy Friendship Day! 💙",
    `— ${you}`
  ];
}

function buildQuote(friend) {
  return `“No matter where life takes us, ${friend}, our friendship will always be one of my favorite constellations.”`;
}

function renderMessage(friend, you) {
  messageContent.innerHTML = "";
  const lines = buildMessageLines(friend, you);

  lines.forEach((text, i) => {
    const div = document.createElement("div");
    div.className = "line" + (i === lines.length - 1 ? " signature" : "");
    div.textContent = text;
    div.style.animationDelay = 0.25 + i * 0.28 + "s";
    messageContent.appendChild(div);
  });

  quoteEl.textContent = buildQuote(friend);
  quoteEl.classList.remove("visible");
  setTimeout(() => quoteEl.classList.add("visible"), (0.25 + lines.length * 0.28 + 0.3) * 1000);
}

function revealSurprise(you, friend, updateUrl = true) {
  state.yourName = you;
  state.friendName = friend;

  if (uploadedImageDataUrl) {
    setPhotoSource(uploadedImageDataUrl);
  }

  if (updateUrl) {
    const url = new URL(window.location.href);
    url.searchParams.set("from", you);
    url.searchParams.set("to", friend);
    if (uploadedImageDataUrl) {
      url.searchParams.set("imgData", uploadedImageDataUrl);
    }
    window.history.pushState({}, "", url);
  }

  renderMessage(friend, you);
  card.classList.add("flipped");
  playFlipSound();

  setTimeout(() => {
    initScratchCard();
    burstConfetti(window.innerWidth / 2, window.innerHeight / 2.4);
    startNightMode();
  }, 550);
}

function handleGenerate(e) {
  e.preventDefault();
  const you = yourNameInput.value.trim();
  const friend = friendNameInput.value.trim();

  if (!you || !friend) {
    formError.classList.add("visible");
    return;
  }
  formError.classList.remove("visible");
  revealSurprise(you, friend, true);
}

function resetCard() {
  hideStickerSlide();
  card.classList.remove("flipped");
  playFlipSound();
  stopNightMode();

  const url = new URL(window.location.href);
  url.searchParams.delete("from");
  url.searchParams.delete("to");
  url.searchParams.delete("imgData");
  window.history.pushState({}, "", url);

  setTimeout(() => {
    form.reset();
    document.getElementById("polaroidPreview").hidden = true;
    document.getElementById("cardBackPolaroid").hidden = true;
    uploadedImageDataUrl = null;
    formError.classList.remove("visible");
    messageContent.innerHTML = "";
    quoteEl.classList.remove("visible");
    quoteEl.textContent = "";
    yourNameInput.focus();
  }, 500);
}

// --- Confetti Engine ---
function resizeConfettiCanvas() {
  confettiCanvas.width = window.innerWidth;
  confettiCanvas.height = window.innerHeight;
}

function burstConfetti(originX, originY) {
  playPopSound();
  const colors = ["#6C63FF", "#FF8FB1", "#FFC978", "#9AD1FF", "#C9B8FF", "#ffffff"];
  const particles = [];
  const count = 90;

  for (let i = 0; i < count; i++) {
    const angle = Math.random() * Math.PI * 2;
    const speed = 3 + Math.random() * 7;
    particles.push({
      x: originX,
      y: originY,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed - 3,
      size: 4 + Math.random() * 5,
      color: colors[Math.floor(Math.random() * colors.length)],
      rotation: Math.random() * Math.PI,
      vr: (Math.random() - 0.5) * 0.3,
      life: 1
    });
  }

  function tick() {
    ctx.clearRect(0, 0, confettiCanvas.width, confettiCanvas.height);
    let alive = false;

    particles.forEach((p) => {
      if (p.life <= 0) return;
      alive = true;
      p.vy += 0.12;
      p.x += p.vx;
      p.y += p.vy;
      p.rotation += p.vr;
      p.life -= 0.012;
      ctx.save();
      ctx.globalAlpha = Math.max(p.life, 0);
      ctx.translate(p.x, p.y);
      ctx.rotate(p.rotation);
      ctx.fillStyle = p.color;
      ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size * 0.6);
      ctx.restore();
    });

    if (alive) {
      requestAnimationFrame(tick);
    } else {
      ctx.clearRect(0, 0, confettiCanvas.width, confettiCanvas.height);
    }
  }
  tick();
}

function getShareableUrl() {
  const url = new URL(window.location.href);
  url.searchParams.set("from", state.yourName);
  url.searchParams.set("to", state.friendName);
  if (uploadedImageDataUrl) {
    url.searchParams.set("imgData", uploadedImageDataUrl);
  }
  return url.toString();
}

async function shareCard() {
  const shareUrl = getShareableUrl();

  if (navigator.share) {
    try {
      await navigator.share({
        title: "Happy Friendship Day 💙",
        text: `${state.yourName} sent you a Friendship Day card!`,
        url: shareUrl
      });
    } catch (err) {}
  } else {
    try {
      await navigator.clipboard.writeText(shareUrl);
      showToast("Link copied to clipboard! 🔗");
    } catch {
      showToast("Unable to copy share link");
    }
  }
}

async function downloadCard() {
  const hasPhoto = !!uploadedImageDataUrl;
  const W = 900;
  const H = hasPhoto ? 1300 : 1100;
  const off = document.createElement("canvas");
  off.width = W;
  off.height = H;
  const c = off.getContext("2d");

  const bgGrad = c.createLinearGradient(0, 0, W, H);
  bgGrad.addColorStop(0, "#e9f1fb");
  bgGrad.addColorStop(0.5, "#ece6fb");
  bgGrad.addColorStop(1, "#fdeaf2");
  c.fillStyle = bgGrad;
  c.fillRect(0, 0, W, H);

  const pad = 60;
  const panelX = pad, panelY = 80, panelW = W - pad * 2, panelH = H - 160;

  c.fillStyle = "rgba(255,255,255,0.85)";
  roundRect(c, panelX, panelY, panelW, panelH, 32);
  c.fill();

  c.textAlign = "center";
  c.fillStyle = "#2e2a4a";
  c.font = "700 52px 'Dancing Script'";
  c.fillText("Happy Friendship Day 💙", W / 2, panelY + 110);

  let startBodyY = panelY + 180;

  if (hasPhoto) {
    await new Promise((resolve) => {
      const img = new Image();
      img.onload = () => {
        const pWidth = 300;
        const pHeight = 220;
        const pX = (W - pWidth) / 2;
        const pY = panelY + 150;

        c.fillStyle = "#ffffff";
        roundRect(c, pX, pY, pWidth, pHeight + 40, 10);
        c.fill();
        c.drawImage(img, pX + 10, pY + 10, pWidth - 20, pHeight - 20);

        c.fillStyle = "#333333";
        c.font = "700 24px 'Dancing Script'";
        c.fillText("Besties ✨", W / 2, pY + pHeight + 24);

        startBodyY = pY + pHeight + 80;
        resolve();
      };
      img.onerror = () => resolve();
      img.src = uploadedImageDataUrl;
    });
  }

  c.font = "600 36px 'Dancing Script'";
  c.fillStyle = "#6c63ff";
  const lines = buildMessageLines(state.friendName, state.yourName);
  lines.forEach((line, i) => {
    c.fillText(line, W / 2, startBodyY + (i * 48));
  });

  off.toBlob((blob) => {
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `friendship-card.png`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
    showToast("Card downloaded ⬇️");
  }, "image/png");
}

function showStickerSlide() {
  stickerStage.classList.add("active");
  playFlipSound();
}

function hideStickerSlide() {
  stickerStage.classList.remove("active");
}

function initApp() {
  resizeConfettiCanvas();
  window.addEventListener("resize", resizeConfettiCanvas);

  initFloatingAmbient();
  initStars();

  form.addEventListener("submit", handleGenerate);
  resetBtn.addEventListener("click", resetCard);
  copyBtn.addEventListener("click", () => {
    navigator.clipboard.writeText(buildMessageLines(state.friendName, state.yourName).join("\n"));
    showToast("Message copied 📋");
  });
  downloadBtn.addEventListener("click", downloadCard);
  shareBtn.addEventListener("click", shareCard);
  soundToggle.addEventListener("click", toggleSound);

  nextSlideBtn.addEventListener("click", showStickerSlide);
  stickerBackBtn.addEventListener("click", hideStickerSlide);
  stickerResetBtn.addEventListener("click", resetCard);

  const urlParams = new URLSearchParams(window.location.search);
  const fromParam = urlParams.get("from");
  const toParam = urlParams.get("to");
  const imgDataParam = urlParams.get("imgData");

  if (imgDataParam) {
    setPhotoSource(imgDataParam);
  }

  if (fromParam && toParam) {
    yourNameInput.value = fromParam;
    friendNameInput.value = toParam;
    revealSurprise(fromParam, toParam, false);
  }
}

document.addEventListener("DOMContentLoaded", initApp);
