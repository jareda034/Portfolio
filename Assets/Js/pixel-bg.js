const canvas = document.getElementById("hero-pixel-canvas");
const ctx = canvas ? canvas.getContext("2d") : null;

const state = {
  mx: 0,
  my: 0,
  pmx: 0,
  pmy: 0,
  t: 0,
  ready: false,
  hovering: false,
};
const PIXEL_SCALE = 6;
const MAX_TRAIL_PARTICLES = 760;
const TRAIL_LIFE_BASE = 46;
const TRAIL_LIFE_VARIANCE = 40;
const particles = [];
const TRAIL_COLORS = ["#6dff6a", "#b8ff72", "#ecff9d"];

function wrap(value, max) {
  return ((value % max) + max) % max;
}

function resetParticles() {
  particles.length = 0;
}

function addTrailParticle(x, y, flowX = 0, flowY = 0) {
  const life = TRAIL_LIFE_BASE + Math.random() * TRAIL_LIFE_VARIANCE;
  particles.push({
    x,
    y,
    life,
    maxLife: life,
    size: Math.random() > 0.72 ? 2 : 1,
    color: TRAIL_COLORS[Math.floor(Math.random() * TRAIL_COLORS.length)],
    vx: (Math.random() - 0.5) * 0.35 + flowX,
    vy: (Math.random() - 0.5) * 0.5 + flowY,
  });

  if (particles.length > MAX_TRAIL_PARTICLES) {
    particles.splice(0, particles.length - MAX_TRAIL_PARTICLES);
  }
}

function emitTrail(x1, y1, x2, y2) {
  const distance = Math.hypot(x2 - x1, y2 - y1);
  const steps = Math.max(1, Math.floor(distance / 1.3));
  const dragVX = (x2 - x1) / steps;
  const dragVY = (y2 - y1) / steps;
  for (let i = 0; i <= steps; i += 1) {
    const t = i / steps;
    const x = x1 + (x2 - x1) * t + (Math.random() - 0.5) * 1.3;
    const y = y1 + (y2 - y1) * t + (Math.random() - 0.5) * 1.3;
    addTrailParticle(x, y, -dragVX * 0.9, -dragVY * 0.9);
  }
}

function resizeCanvas() {
  if (!canvas) {
    return;
  }

  const rect = canvas.getBoundingClientRect();
  canvas.width = Math.max(1, Math.floor(rect.width / PIXEL_SCALE));
  canvas.height = Math.max(1, Math.floor(rect.height / PIXEL_SCALE));

  canvas.style.width = `${Math.floor(rect.width)}px`;
  canvas.style.height = `${Math.floor(rect.height)}px`;

  if (ctx) {
    ctx.imageSmoothingEnabled = false;
  }

  resetParticles();
}

function drawArcadeScene(targetCtx, width, height) {
  const bgGradient = targetCtx.createLinearGradient(0, 0, 0, height);
  bgGradient.addColorStop(0, "#102317");
  bgGradient.addColorStop(0.45, "#07140d");
  bgGradient.addColorStop(1, "#020704");
  targetCtx.fillStyle = bgGradient;
  targetCtx.fillRect(0, 0, width, height);

  const screenGlow = targetCtx.createRadialGradient(
    width * 0.5,
    height * 0.48,
    2,
    width * 0.5,
    height * 0.48,
    width * 0.72,
  );
  screenGlow.addColorStop(0, "rgba(88, 210, 110, 0.24)");
  screenGlow.addColorStop(0.6, "rgba(44, 123, 70, 0.12)");
  screenGlow.addColorStop(1, "rgba(0, 0, 0, 0)");
  targetCtx.fillStyle = screenGlow;
  targetCtx.fillRect(0, 0, width, height);

  const topReflection = targetCtx.createLinearGradient(0, 0, 0, height * 0.35);
  topReflection.addColorStop(0, "rgba(140, 255, 166, 0.14)");
  topReflection.addColorStop(1, "rgba(140, 255, 166, 0)");
  targetCtx.fillStyle = topReflection;
  targetCtx.fillRect(0, 0, width, height * 0.35);

  const vignette = targetCtx.createRadialGradient(
    width * 0.5,
    height * 0.5,
    width * 0.2,
    width * 0.5,
    height * 0.5,
    width * 0.82,
  );
  vignette.addColorStop(0, "rgba(0, 0, 0, 0)");
  vignette.addColorStop(1, "rgba(0, 0, 0, 0.5)");
  targetCtx.fillStyle = vignette;
  targetCtx.fillRect(0, 0, width, height);
}

function draw() {
  if (!canvas || !ctx) {
    return;
  }

  state.t += 0.016;

  drawArcadeScene(ctx, canvas.width, canvas.height);

  for (let i = particles.length - 1; i >= 0; i -= 1) {
    const p = particles[i];

    p.life -= 1;
    if (p.life <= 0) {
      particles.splice(i, 1);
      continue;
    }

    const lifeProgress = 1 - p.life / p.maxLife;
    const alpha = Math.sin(lifeProgress * Math.PI) * 0.95;
    p.x = wrap(p.x + p.vx, canvas.width);
    p.y = wrap(p.y + p.vy, canvas.height);
    p.vx *= 0.99;
    p.vy *= 0.99;

    ctx.globalAlpha = alpha;
    ctx.fillStyle = p.color;
    ctx.fillRect(Math.floor(p.x), Math.floor(p.y), p.size, p.size);
  }

  ctx.globalAlpha = 1;

  const scanlineFlicker = 0.18 + ((Math.sin(state.t * 9.6) + 1) * 0.5) * 0.08;
  ctx.fillStyle = `rgba(4, 10, 6, ${scanlineFlicker.toFixed(3)})`;
  for (let y = 0; y < canvas.height; y += 2) {
    ctx.fillRect(0, y, canvas.width, 1);
  }

  ctx.fillStyle = "rgba(120, 255, 150, 0.05)";
  for (let y = 1; y < canvas.height; y += 6) {
    ctx.fillRect(0, y, canvas.width, 1);
  }

  ctx.save();
  ctx.globalCompositeOperation = "screen";
  ctx.globalAlpha = 0.13;
  ctx.filter = "blur(1.2px)";
  ctx.drawImage(canvas, 0, 0);
  ctx.restore();

  const glassSheen = ctx.createLinearGradient(0, 0, canvas.width, canvas.height * 0.65);
  glassSheen.addColorStop(0, "rgba(210, 255, 225, 0.16)");
  glassSheen.addColorStop(0.28, "rgba(175, 255, 206, 0.06)");
  glassSheen.addColorStop(0.55, "rgba(160, 250, 196, 0)");
  ctx.fillStyle = glassSheen;
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  const glassHotspot = ctx.createRadialGradient(
    canvas.width * 0.28,
    canvas.height * 0.16,
    2,
    canvas.width * 0.28,
    canvas.height * 0.16,
    canvas.width * 0.36,
  );
  glassHotspot.addColorStop(0, "rgba(210, 255, 228, 0.1)");
  glassHotspot.addColorStop(1, "rgba(210, 255, 228, 0)");
  ctx.fillStyle = glassHotspot;
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  requestAnimationFrame(draw);
}

window.addEventListener("mousemove", (e) => {
  if (!canvas) {
    return;
  }

  const rect = canvas.getBoundingClientRect();
  const isInside =
    e.clientX >= rect.left &&
    e.clientX <= rect.right &&
    e.clientY >= rect.top &&
    e.clientY <= rect.bottom;

  if (!isInside) {
    state.hovering = false;
    return;
  }

  state.hovering = true;

  const nextMx =
    ((e.clientX - rect.left) / Math.max(1, rect.width)) * canvas.width;
  const nextMy =
    ((e.clientY - rect.top) / Math.max(1, rect.height)) * canvas.height;

  if (!state.ready) {
    state.mx = nextMx;
    state.my = nextMy;
    state.pmx = nextMx;
    state.pmy = nextMy;
    state.ready = true;
    addTrailParticle(nextMx, nextMy);
    return;
  }

  emitTrail(state.pmx, state.pmy, nextMx, nextMy);
  state.pmx = nextMx;
  state.pmy = nextMy;
  state.mx = nextMx;
  state.my = nextMy;
});

window.addEventListener("resize", resizeCanvas);

if (canvas) {
  resizeCanvas();
  draw();
}
