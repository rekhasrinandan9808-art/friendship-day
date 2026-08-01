/* =========================================================
   FRIENDSHIP DAY — script.js
   No frameworks, no build step — just DOM + Canvas + a few
   small Web APIs (Clipboard, Web Share, Web Animations).
   ========================================================= */

// ---------- Grab elements we'll reuse ----------
const gradientBg      = document.getElementById("gradientBg");
const starsLayer      = document.getElementById("starsLayer");
const floatingLayer   = document.getElementById("floatingLayer");
const confettiCanvas  = document.getElementById("confettiCanvas");
const card            = document.getElementById("card");
const cardContainer   = document.getElementById("cardContainer");
const form            = document.getElementById("surpriseForm");
const yourNameInput   = document.getElementById("yourName");
const friendNameInput = document.getElementById("friendName");
const formError       = document.getElementById("formError");
const messageContent  = document.getElementById("messageContent");
const quoteEl         = document.getElementById("quote");
const copyBtn         = document.getElementById("copyBtn");
const downloadBtn     = document.getElementById("downloadBtn");
const shareBtn        = document.getElementById("shareBtn");
const resetBtn        = document.getElementById("resetBtn");
const toastEl         = document.getElementById("toast");
const nextSlideBtn    = document.getElementById("nextSlideBtn");
const stickerStage    = document.getElementById("stickerStage");
const stickerBackBtn  = document.getElementById("stickerBackBtn");
const stickerResetBtn = document.getElementById("stickerResetBtn");
const stickerDownloadBtn = document.getElementById("stickerDownloadBtn");
const stickerShareBtn = document.getElementById("stickerShareBtn");
const cutoutRow1      = document.getElementById("cutoutRow1");
const cutoutRow2      = document.getElementById("cutoutRow2");

const ctx = confettiCanvas.getContext("2d");

// Small bit of shared state so download/share/copy always match what's on screen
const state = { yourName: "", friendName: "", isNight: false, memoryTimer: null };

/* =========================================================
   1. AMBIENT FLOATING ICONS (hearts / stars / smileys)
   ========================================================= */
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
    span.style.animationDelay = -delay + "s"; // negative delay = already mid-flight on load
    span.style.setProperty("--drift", drift);
    floatingLayer.appendChild(span);
  }
}

/* =========================================================
   2. STARRY SKY (built once, faded in after reveal)
   ========================================================= */
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

// Small drifting "memory" bubbles once night mode kicks in
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

/* =========================================================
   3. FORM VALIDATION + FLIP REVEAL
   ========================================================= */
function buildMessageLines(friend, you) {
  return [
    `Dear ${friend},`,
    "Thank you for being an amazing friend.",
    "Wishing you endless happiness and unforgettable memories.",
    "Happy Friendship Day! 💙",
    `— ${you}`,
  ];
}

function buildQuote(friend) {
  return `“No matter where life takes us, ${friend}, our friendship will always be one of my favorite constellations.”`;
}

function renderMessage(friend, you) {
  messageContent.innerHTML = ""; // safe: only our own template strings + escaped names go in via textContent below
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
  setTimeout(() => quoteEl.classList.add("visible"), 0.25 + lines.length * 280 + 300);
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

  state.yourName = you;
  state.friendName = friend;

  renderMessage(friend, you);
  card.classList.add("flipped");

  // Once the flip has visually happened, layer on the celebration
  setTimeout(() => {
    burstConfetti(window.innerWidth / 2, window.innerHeight / 2.4);
    burstSparkles();
    startNightMode();
  }, 550);
}

function resetCard() {
  hideStickerSlide();
  card.classList.remove("flipped");
  stopNightMode();
  setTimeout(() => {
    form.reset();
    formError.classList.remove("visible");
    messageContent.innerHTML = "";
    quoteEl.classList.remove("visible");
    quoteEl.textContent = "";
    yourNameInput.focus();
  }, 500);
}

/* =========================================================
   4. CONFETTI BURST (canvas-based particle system)
   ========================================================= */
function resizeConfettiCanvas() {
  confettiCanvas.width = window.innerWidth;
  confettiCanvas.height = window.innerHeight;
}
resizeConfettiCanvas();
window.addEventListener("resize", resizeConfettiCanvas);

function burstConfetti(originX, originY) {
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
      life: 1,
    });
  }

  function tick() {
    ctx.clearRect(0, 0, confettiCanvas.width, confettiCanvas.height);
    let alive = false;

    particles.forEach((p) => {
      if (p.life <= 0) return;
      alive = true;
      p.vy += 0.12; // gravity
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
    { x: rect.right - 20, y: rect.bottom - 10 },
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

/* =========================================================
   5. COPY / SHARE
   ========================================================= */
function plainMessage() {
  return buildMessageLines(state.friendName, state.yourName).join("\n");
}

function showToast(msg) {
  toastEl.textContent = msg;
  toastEl.classList.add("visible");
  clearTimeout(showToast._t);
  showToast._t = setTimeout(() => toastEl.classList.remove("visible"), 2200);
}

async function copyMessage() {
  const text = plainMessage();
  try {
    await navigator.clipboard.writeText(text);
    showToast("Message copied 📋");
  } catch (err) {
    // Fallback for older browsers / no clipboard permission
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
  const text = plainMessage();
  if (navigator.share) {
    try {
      await navigator.share({ title: "Happy Friendship Day 💙", text });
    } catch (err) {
      // user cancelled the share sheet — no action needed
    }
  } else {
    try {
      await navigator.clipboard.writeText(text);
      showToast("Sharing isn't supported here — message copied instead 📋");
    } catch {
      showToast("Sharing isn't supported on this browser");
    }
  }
}

/* =========================================================
   6. DOWNLOAD CARD AS PNG (drawn fresh on an offscreen canvas)
   ========================================================= */
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
  // make sure the custom fonts are actually ready before we measure/draw text
  await Promise.all([
    document.fonts.load('700 60px "Dancing Script"'),
    document.fonts.load('600 30px "Dancing Script"'),
    document.fonts.load('600 22px "Poppins"'),
    document.fonts.load('500 24px "Poppins"'),
    document.fonts.load('400 22px "Poppins"'),
  ]);

  const W = 900, H = 1150;
  const off = document.createElement("canvas");
  off.width = W;
  off.height = H;
  const c = off.getContext("2d");

  // Background — matches whichever mode the card is currently in
  let bgGrad;
  if (state.isNight) {
    bgGrad = c.createLinearGradient(0, 0, 0, H);
    bgGrad.addColorStop(0, "#1b1450");
    bgGrad.addColorStop(1, "#0b1030");
    c.fillStyle = bgGrad;
    c.fillRect(0, 0, W, H);
    // simple stars
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

  // Glass card panel
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

  // Heading
  c.textAlign = "center";
  c.fillStyle = "#e0567a";
  c.font = "600 22px Poppins";
  c.fillText("✨ Happy Friendship Day ✨", W / 2, panelY + 70);

  c.fillStyle = textColor;
  c.font = "700 56px 'Dancing Script'";
  c.fillText(`Happy Friendship Day 💙`, W / 2, panelY + 150);

  c.font = "400 22px Poppins";
  c.fillStyle = state.isNight ? "#cfc9f5" : "#6b6490";
  c.fillText("Some friendships make life more beautiful.", W / 2, panelY + 195);

  // Message body
  c.textAlign = "left";
  c.font = "400 26px Poppins";
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

  // Quote
  c.font = "italic 500 24px 'Dancing Script'";
  c.fillStyle = accent;
  cursorY += 20;
  cursorY += wrapText(c, buildQuote(state.friendName), bodyX, cursorY, bodyW, 34);

  // Footer mark
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

function roundRect(c, x, y, w, h, r) {
  c.beginPath();
  c.moveTo(x + r, y);
  c.arcTo(x + w, y, x + w, y + h, r);
  c.arcTo(x + w, y + h, x, y + h, r);
  c.arcTo(x, y + h, x, y, r);
  c.arcTo(x, y, x + w, y, r);
  c.closePath();
}

/* =========================================================
   7. SLIDE 3 — SCRAPBOOK STICKER CARD
   ========================================================= */

// A handful of paper-cutout "swatches" (bg + text colour) and font treatments,
// mixed together so each letter looks like it was snipped from a different magazine.
const CUTOUT_SWATCHES = [
  { bg: "#f4e9da", fg: "#1f1b1b" },
  { bg: "#e9553b", fg: "#ffffff" },
  { bg: "#1f1b1b", fg: "#ffffff" },
  { bg: "#a9c9e8", fg: "#1f1b1b" },
  { bg: "#e8b93e", fg: "#1f1b1b" },
  { bg: "#f2a6c0", fg: "#1f1b1b" },
  { bg: "#8fae8b", fg: "#ffffff" },
  { bg: "#ffffff", fg: "#1f1b1b" },
];
const CUTOUT_FONTS = [
  { fontFamily: "'Poppins', sans-serif", fontWeight: 800 },
  { fontFamily: "Georgia, serif", fontWeight: 700, fontStyle: "italic" },
  { fontFamily: "'Courier New', monospace", fontWeight: 700 },
  { fontFamily: "'Dancing Script', cursive", fontWeight: 700 },
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
}

function hideStickerSlide() {
  stickerStage.classList.remove("active");
}

async function downloadStickerCard() {
  await Promise.all([
    document.fonts.load('800 40px "Poppins"'),
    document.fonts.load('700 40px "Dancing Script"'),
  ]);

  const W = 1000, H = 640;
  const off = document.createElement("canvas");
  off.width = W;
  off.height = H;
  const c = off.getContext("2d");

  // paper base
  const grad = c.createLinearGradient(0, 0, W, H);
  grad.addColorStop(0, "#f7f3ec");
  grad.addColorStop(0.55, "#efe9df");
  grad.addColorStop(1, "#f7f3ec");
  c.fillStyle = grad;
  c.fillRect(0, 0, W, H);
  c.fillStyle = "rgba(0,0,0,0.04)";
  for (let i = 0; i < 40; i++) {
    c.beginPath();
    c.arc(Math.random() * W, Math.random() * H, Math.random() * 60 + 10, 0, Math.PI * 2);
    c.fill();
  }

  // decorative emoji
  c.textAlign = "center";
  c.font = "40px serif";
  const deco = [
    ["❤️", W * 0.1, H * 0.15], ["⭐", W * 0.32, H * 0.1], ["⭐", W * 0.72, H * 0.12],
    ["💛", W * 0.92, H * 0.2], ["✨", W * 0.1, H * 0.85], ["🩷", W * 0.9, H * 0.82],
  ];
  deco.forEach(([emoji, x, y]) => c.fillText(emoji, x, y));

  function drawCutoutWord(word, centerY, fontSize) {
    // measure total width first so the word can be centred
    c.font = `800 ${fontSize}px Poppins`;
    const letters = word.split("");
    const gap = fontSize * 0.18;
    const widths = letters.map((ch) => (ch === " " ? fontSize * 0.5 : c.measureText(ch).width + fontSize * 0.5));
    const totalW = widths.reduce((a, b) => a + b + gap, -gap);
    let x = W / 2 - totalW / 2;

    letters.forEach((ch, i) => {
      const w = widths[i];
      if (ch !== " ") {
        const swatch = CUTOUT_SWATCHES[Math.floor(Math.random() * CUTOUT_SWATCHES.length)];
        const rot = (Math.random() * 12 - 6) * (Math.PI / 180);
        c.save();
        c.translate(x + w / 2, centerY);
        c.rotate(rot);
        c.fillStyle = "rgba(0,0,0,0.18)";
        roundRect(c, -w / 2, -fontSize * 0.62, w, fontSize * 1.05, 4);
        c.shadowColor = "rgba(0,0,0,0.25)";
        c.shadowBlur = 6;
        c.shadowOffsetY = 3;
        c.fillStyle = swatch.bg;
        roundRect(c, -w / 2, -fontSize * 0.65, w, fontSize * 1.05, 4);
        c.fill();
        c.shadowColor = "transparent";
        c.fillStyle = swatch.fg;
        c.textAlign = "center";
        c.textBaseline = "middle";
        c.font = `800 ${fontSize}px Poppins`;
        c.fillText(ch, 0, -fontSize * 0.08);
        c.restore();
      }
      x += w + gap;
    });
  }

  drawCutoutWord("HAPPY", H * 0.4, 100);
  drawCutoutWord("FRIENDSHIP DAY", H * 0.62, 62);

  off.toBlob((blob) => {
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "friendship-day-sticker-card.png";
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
    showToast("Sticker card downloaded ⬇️");
  }, "image/png");
}

/* =========================================================
   8. WIRE EVERYTHING UP
   ========================================================= */
form.addEventListener("submit", handleGenerate);
resetBtn.addEventListener("click", resetCard);
copyBtn.addEventListener("click", copyMessage);
shareBtn.addEventListener("click", shareCard);
downloadBtn.addEventListener("click", downloadCard);

nextSlideBtn.addEventListener("click", showStickerSlide);
stickerBackBtn.addEventListener("click", hideStickerSlide);
stickerResetBtn.addEventListener("click", () => {
  hideStickerSlide();
  resetCard();
});
stickerDownloadBtn.addEventListener("click", downloadStickerCard);
stickerShareBtn.addEventListener("click", shareCard);

initFloatingAmbient();
initStars();
initStickerSlide();
