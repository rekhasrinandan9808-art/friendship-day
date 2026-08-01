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
const stickerDownloadBtn = document.getElementById("stickerDownloadBtn");
const stickerShareBtn = document.getElementById("stickerShareBtn");
const cutoutRow1 = document.getElementById("cutoutRow1");
const cutoutRow2 = document.getElementById("cutoutRow2");
const soundToggle = document.getElementById("soundToggle");

const ctx = confettiCanvas.getContext("2d");

let uploadedImageDataUrl = null;

const state = {
  yourName: "",
  friendName: "",
  isNight: false,
  memoryTimer: null,
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

// --- Background Visual Effects ---
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
    const drift = (Math.random() * 80 - 40) + "px";
    span.style.left = Math.random() * 100 + "vw";
    span.style.fontSize = size + "px";
    span.style.animationDuration = duration + "s";
    span.style.animationDelay = -delay + "s";
    span.style.setProperty("--drift", drift);
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

function spawnMemory() {
  const icons = ["💙", "✨", "⭐"];
  const el = document.createElement("span");
  el.className = "memory";
  el.textContent = icons[Math.floor(Math.random() * icons.length)];
  el.style.left = Math.random() * 100 + "vw";
  el.style.setProperty("--drift", (Math.random() * 60 - 30) + "px");
  el.style.animationDuration = 9 + Math.random() * 6 + "s";
  starsLayer.appendChild(el);
  setTimeout(() => el.remove(), 16000);
}

function startNightMode() {
  if (state.isNight) return;
  state.isNight = true;
  document.body.classList.add("night");
  gradientBg.classList.add("night");
  starsLayer.classList.add("visible");
  spawnMemory();
  state.memoryTimer = setInterval(spawnMemory, 2200);
}

function stopNightMode() {
  state.isNight = false;
  document.body.classList.remove("night");
  gradientBg.classList.remove("night");
  starsLayer.classList.remove("visible");
  clearInterval(state.memoryTimer);
  starsLayer.querySelectorAll(".memory").forEach((m) => m.remove());
}

// --- Photo Polaroid Handler ---
document.getElementById("photoUpload").addEventListener("change", (e) => {
  const file = e.target.files[0];
  if (file) {
    const reader = new FileReader();
    reader.onload = (event) => {
      uploadedImageDataUrl = event.target.result;
      
      const frontImg = document.getElementById("polaroidImg");
      const backImg = document.getElementById("cardBackPolaroidImg");
      
      if (frontImg) frontImg.src = uploadedImageDataUrl;
      if (backImg) backImg.src = uploadedImageDataUrl;
      
      document.getElementById("polaroidPreview").hidden = false;
    };
    reader.readAsDataURL(file);
  }
});

// --- Interactive Scratch-Card Reveal Engine ---
function initScratchCard() {
  const canvas = document.getElementById("scratchCanvas");
  if (!canvas) return;
  const ctxScratch = canvas.getContext("2d");
  const rect = canvas.getBoundingClientRect();
  
  canvas.width = rect.width || 320;
  canvas.height = rect.height || 180;

  const grad = ctxScratch.createLinearGradient(0, 0, canvas.width, canvas.height);
  grad.addColorStop(0, "#d4af37");
  grad.addColorStop(0.5, "#fff2a8");
  grad.addColorStop(1, "#aa7c11");
  ctxScratch.fillStyle = grad;
  ctxScratch.fillRect(0, 0, canvas.width, canvas.height);

  ctxScratch.fillStyle = "#4a3b10";
  ctxScratch.font = "bold 15px Poppins";
  ctxScratch.textAlign = "center";
  ctxScratch.fillText("✨ Scratch to Reveal Message! ✨", canvas.width / 2, canvas.height / 2);

  let isScratching = false;

  function scratch(e) {
    if (!isScratching) return;
    const r = canvas.getBoundingClientRect();
    const x = (e.clientX || (e.touches && e.touches[0].clientX)) - r.left;
    const y = (e.clientY || (e.touches && e.touches[0].clientY)) - r.top;

    ctxScratch.globalCompositeOperation = "destination-out";
    ctxScratch.beginPath();
    ctxScratch.arc(x, y, 22, 0, Math.PI * 2);
    ctxScratch.fill();
  }

  ["mousedown", "touchstart"].forEach(evt => canvas.addEventListener(evt, (e) => { isScratching = true; scratch(e); }));
  ["mousemove", "touchmove"].forEach(evt => canvas.addEventListener(evt, scratch));
  ["mouseup", "touchend"].forEach(evt => canvas.addEventListener(evt, () => { isScratching = false; }));
}

// --- Friendship Coupon Handler ---
function claimCoupon(el) {
  if (!el.classList.contains("claimed")) {
    el.classList.add("claimed");
    el.querySelector(".stamp").textContent = "CLAIMED! 🎟️";
    burstSparkles();
    showToast("Coupon Redeemed! 🥳");
  }
}

// --- Card Rendering & Logic ---
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
    const backPolaroidImg = document.getElementById("cardBackPolaroidImg");
    if (backPolaroidImg) backPolaroidImg.src = uploadedImageDataUrl;
    document.getElementById("cardBackPolaroid").hidden = false;
  }

  if (updateUrl) {
    const url = new URL(window.location.href);
    url.searchParams.set("from", you);
    url.searchParams.set("to", friend);
    window.history.pushState({}, "", url);
  }

  renderMessage(friend, you);
  card.classList.add("flipped");
  playFlipSound();

  setTimeout(() => {
    initScratchCard();
    burstConfetti(window.innerWidth / 2, window.innerHeight / 2.4);
    burstSparkles();
    startNightMode();
  }, 550);
}

function handleGenerate(e) {
  e.preventDefault();
  const you = yourNameInput.value.trim();
  const friend = friendNameInput.value.trim();

  if (!you || !friend) {
    formError.classList.add("visible");
    card.classList.add("shake");
    setTimeout(() => card.classList.remove("shake"), 450);
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

// --- Confetti Canvas System ---
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

function burstSparkles() {
  const rect = cardContainer.getBoundingClientRect();
  const spots = [
    { x: rect.left + 10, y: rect.top + 10 },
    { x: rect.right - 10, y: rect.top + 20 },
    { x: rect.left + 20, y: rect.bottom - 20 },
    { x: rect.right - 20, y: rect.bottom - 10 }
  ];
  spots.forEach((spot, i) => {
    setTimeout(() => {
      const s = document.createElement("span");
      s.className = "sparkle";
      s.textContent = "✨";
      s.style.left = spot.x + "px";
      s.style.top = spot.y + "px";
      document.body.appendChild(s);
      setTimeout(() => s.remove(), 1200);
    }, i * 140);
  });
}

// --- Sharing & Clipboard Utilities ---
function getShareableUrl() {
  const url = new URL(window.location.href);
  url.searchParams.set("from", state.yourName);
  url.searchParams.set("to", state.friendName);
  return url.toString();
}

function plainMessage() {
  return buildMessageLines(state.friendName, state.yourName).join("\n");
}

async function copyMessage() {
  const text = plainMessage();
  try {
    await navigator.clipboard.writeText(text);
    showToast("Message copied 📋");
  } catch (err) {
    const ta = document.createElement("textarea");
    ta.value = text;
    ta.style.position = "fixed";
    ta.style.opacity = "0";
    document.body.appendChild(ta);
    ta.select();
    document.execCommand("copy");
    ta.remove();
    showToast("Message copied 📋");
  }
}

async function shareCard() {
  const shareUrl = getShareableUrl();
  const shareData = {
    title: "Happy Friendship Day 💙",
    text: `${state.yourName} sent you a Friendship Day card!`,
    url: shareUrl
  };

  if (navigator.share) {
    try {
      await navigator.share(shareData);
    } catch (err) {}
  } else {
    try {
      await navigator.clipboard.writeText(shareUrl);
      showToast("Surprise link copied to clipboard! 🔗");
    } catch {
      showToast("Unable to copy share link");
    }
  }
}

// --- Offscreen Canvas Image Exporter ---
function wrapText(context, text, x, y, maxWidth, lineHeight) {
  const words = text.split(" ");
  let line = "";
  let lines = [];
  words.forEach((word) => {
    const test = line + word + " ";
    if (context.measureText(test).width > maxWidth && line !== "") {
      lines.push(line.trim());
      line = word + " ";
    } else {
      line = test;
    }
  });
  lines.push(line.trim());
  lines.forEach((l, i) => context.fillText(l, x, y + i * lineHeight));
  return lines.length * lineHeight;
}

async function downloadCard() {
  await Promise.all([
    document.fonts.load('700 60px "Dancing Script"'),
    document.fonts.load('600 30px "Dancing Script"'),
    document.fonts.load('600 22px "Poppins"'),
    document.fonts.load('500 24px "Poppins"'),
    document.fonts.load('400 22px "Poppins"')
  ]);

  const W = 900, H = 1150;
  const off = document.createElement("canvas");
  off.width = W;
  off.height = H;
  const c = off.getContext("2d");

  let bgGrad;
  if (state.isNight) {
    bgGrad = c.createLinearGradient(0, 0, 0, H);
    bgGrad.addColorStop(0, "#1b1450");
    bgGrad.addColorStop(1, "#0b1030");
    c.fillStyle = bgGrad;
    c.fillRect(0, 0, W, H);
    
    c.fillStyle = "#fdf6e3";
    for (let i = 0; i < 140; i++) {
      const r = Math.random() * 1.6 + 0.4;
      c.globalAlpha = Math.random() * 0.8 + 0.2;
      c.beginPath();
      c.arc(Math.random() * W, Math.random() * H, r, 0, Math.PI * 2);
      c.fill();
    }
    c.globalAlpha = 1;
  } else {
    bgGrad = c.createLinearGradient(0, 0, W, H);
    bgGrad.addColorStop(0, "#e9f1fb");
    bgGrad.addColorStop(0.5, "#ece6fb");
    bgGrad.addColorStop(1, "#fdeaf2");
    c.fillStyle = bgGrad;
    c.fillRect(0, 0, W, H);
  }

  const pad = 60;
  const panelX = pad, panelY = 90, panelW = W - pad * 2, panelH = H - 180;
  const radius = 32;
  
  c.save();
  c.shadowColor = "rgba(46,42,74,0.25)";
  c.shadowBlur = 40;
  c.shadowOffsetY = 18;
  c.fillStyle = state.isNight ? "rgba(255,255,255,0.10)" : "rgba(255,255,255,0.72)";
  roundRect(c, panelX, panelY, panelW, panelH, radius);
  c.fill();
  c.restore();

  c.strokeStyle = state.isNight ? "rgba(255,255,255,0.25)" : "rgba(255,255,255,0.9)";
  c.lineWidth = 2;
  roundRect(c, panelX, panelY, panelW, panelH, radius);
  c.stroke();

  const textColor = state.isNight ? "#f3f0ff" : "#2e2a4a";
  const accent = "#6c63ff";

  c.textAlign = "center";
  c.fillStyle = "#e0567a";
  c.font = "600 22px Poppins";
  c.fillText("✨ Happy Friendship Day ✨", W / 2, panelY + 70);

  c.fillStyle = textColor;
  c.font = "700 56px 'Dancing Script'";
  c.fillText("Happy Friendship Day 💙", W / 2, panelY + 150);

  c.font = "400 22px Poppins";
  c.fillStyle = state.isNight ? "#cfc9f5" : "#6b6490";
  c.fillText("Some friendships make life more beautiful.", W / 2, panelY + 195);

  c.textAlign = "left";
  c.fillStyle = textColor;
  const lines = buildMessageLines(state.friendName, state.yourName);
  let cursorY = panelY + 280;
  const bodyX = panelX + 60;
  const bodyW = panelW - 120;

  lines.forEach((line, i) => {
    if (i === lines.length - 1) {
      c.font = "600 34px 'Dancing Script'";
      c.fillStyle = accent;
    } else if (i === 0) {
      c.font = "600 28px Poppins";
      c.fillStyle = textColor;
    } else {
      c.font = "400 25px Poppins";
      c.fillStyle = textColor;
    }
    cursorY += wrapText(c, line, bodyX, cursorY, bodyW, 38) + 14;
  });

  c.font = "italic 500 24px 'Dancing Script'";
  c.fillStyle = accent;
  cursorY += 20;
  cursorY += wrapText(c, buildQuote(state.friendName), bodyX, cursorY, bodyW, 34);

  c.textAlign = "center";
  c.font = "400 16px Poppins";
  c.fillStyle = state.isNight ? "rgba(243,240,255,0.6)" : "rgba(107,100,144,0.7)";
  c.fillText("made with 💙 for Friendship Day", W / 2, H - 45);

  off.toBlob((blob) => {
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `friendship-day-${(state.friendName || "card").toLowerCase().replace(/\s+/g, "-")}.png`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
    showToast("Card downloaded ⬇️");
  }, "image/png");
}

// --- Scrapbook Sticker Card Module ---
const CUTOUT_SWATCHES = [
  { bg: "#f4e9da", fg: "#1f1b1b" },
  { bg: "#e9553b", fg: "#ffffff" },
  { bg: "#1f1b1b", fg: "#ffffff" },
  { bg: "#a9c9e8", fg: "#1f1b1b" },
  { bg: "#e8b93e", fg: "#1f1b1b" },
  { bg: "#f2a6c0", fg: "#1f1b1b" },
  { bg: "#8fae8b", fg: "#ffffff" },
  { bg: "#ffffff", fg: "#1f1b1b" }
];

const CUTOUT_FONTS = [
  { fontFamily: "'Poppins', sans-serif", fontWeight: 800 },
  { fontFamily: "Georgia, serif", fontWeight: 700, fontStyle: "italic" },
  { fontFamily: "'Courier New', monospace", fontWeight: 700 },
  { fontFamily: "'Dancing Script', cursive", fontWeight: 700 }
];

function buildCutoutRow(container, word) {
  container.innerHTML = "";
  word.split("").forEach((ch) => {
    const span = document.createElement("span");
    if (ch === " ") {
      span.className = "cutout-letter space";
      span.textContent = "\u00A0";
      container.appendChild(span);
      return;
    }
    const swatch = CUTOUT_SWATCHES[Math.floor(Math.random() * CUTOUT_SWATCHES.length)];
    const font = CUTOUT_FONTS[Math.floor(Math.random() * CUTOUT_FONTS.length)];
    span.className = "cutout-letter";
    span.textContent = ch;
    span.style.background = swatch.bg;
    span.style.color = swatch.fg;
    span.style.fontFamily = font.fontFamily;
    span.style.fontWeight = font.fontWeight;
    if (font.fontStyle) span.style.fontStyle = font.fontStyle;
    span.style.setProperty("--rot", (Math.random() * 14 - 7).toFixed(1) + "deg");
    container.appendChild(span);
  });
}

function initStickerSlide() {
  buildCutoutRow(cutoutRow1, "HAPPY");
  buildCutoutRow(cutoutRow2, "FRIENDSHIP DAY");
}

function showStickerSlide() {
  stickerStage.classList.add("active");
  playFlipSound();
}

function hideStickerSlide() {
  stickerStage.classList.remove("active");
}

async function downloadStickerCard() {
  await Promise.all([
    document.fonts.load('800 40px "Poppins"'),
    document.fonts.load('700 40px "Dancing Script"')
  ]);

  const W = 1000, H = 640;
  const off = document.createElement("canvas");
  off.width = W;
  off.height = H;
  const c = off.getContext("2d");

  const grad = c.createLinearGradient(0, 0, W, H);
  grad.addColorStop(0, "#f7f3ec");
  grad.addColorStop(0.55, "#efe9df");
  grad.addColorStop(1, "#f7f3ec");
  c.fillStyle = grad;
  c.fillRect(0, 0, W, H);

  c.textAlign = "center";
  c.font = "40px serif";
  const deco = [
    ["❤️", W * 0.1, H * 0.15],
    ["⭐", W * 0.32, H * 0.1],
    ["⭐", W * 0.72, H * 0.12],
    ["💛", W * 0.92, H * 0.2],
    ["✨", W * 0.1, H * 0.85],
    ["🩷", W * 0.9, H * 0.82]
  ];
  deco.forEach(([emoji, x, y]) => c.fillText(emoji, x, y));

  off.toBlob((blob) => {
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `friendship-scrapbook.png`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
    showToast("Scrapbook downloaded ⬇️");
  }, "image/png");
}

// --- Event Listeners Initialization ---
function initApp() {
  resizeConfettiCanvas();
  window.addEventListener("resize", resizeConfettiCanvas);

  initFloatingAmbient();
  initStars();
  initStickerSlide();

  form.addEventListener("submit", handleGenerate);
  resetBtn.addEventListener("click", resetCard);
  copyBtn.addEventListener("click", copyMessage);
  downloadBtn.addEventListener("click", downloadCard);
  shareBtn.addEventListener("click", shareCard);
  soundToggle.addEventListener("click", toggleSound);

  nextSlideBtn.addEventListener("click", showStickerSlide);
  stickerBackBtn.addEventListener("click", hideStickerSlide);
  stickerResetBtn.addEventListener("click", resetCard);
  stickerDownloadBtn.addEventListener("click", downloadStickerCard);
  stickerShareBtn.addEventListener("click", shareCard);

  // Check URL Params for pre-filled cards
  const urlParams = new URLSearchParams(window.location.search);
  const fromParam = urlParams.get("from");
  const toParam = urlParams.get("to");

  if (fromParam && toParam) {
    yourNameInput.value = fromParam;
    friendNameInput.value = toParam;
    revealSurprise(fromParam, toParam, false);
  }
}

document.addEventListener("DOMContentLoaded", initApp);
