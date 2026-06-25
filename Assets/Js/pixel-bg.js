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
const TRAIL_COLORS = ["#ffd44a", "#ff9f1a", "#fff1a8"];

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

  resetParticles();
}

function draw() {
  if (!canvas || !ctx) {
    return;
  }

  state.t += 0.016;

  const bgGradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
  bgGradient.addColorStop(0, "#213a5a");
  bgGradient.addColorStop(0.42, "#10233b");
  bgGradient.addColorStop(1, "#060d18");
  ctx.fillStyle = bgGradient;
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  const leftGlow = ctx.createRadialGradient(
    canvas.width * 0.22,
    canvas.height * 0.2,
    2,
    canvas.width * 0.22,
    canvas.height * 0.2,
    canvas.width * 0.5,
  );
  leftGlow.addColorStop(0, "rgba(120, 165, 220, 0.24)");
  leftGlow.addColorStop(1, "rgba(120, 165, 220, 0)");
  ctx.fillStyle = leftGlow;
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  const rightGlow = ctx.createRadialGradient(
    canvas.width * 0.84,
    canvas.height * 0.35,
    2,
    canvas.width * 0.84,
    canvas.height * 0.35,
    canvas.width * 0.42,
  );
  rightGlow.addColorStop(0, "rgba(48, 108, 182, 0.2)");
  rightGlow.addColorStop(1, "rgba(48, 108, 182, 0)");
  ctx.fillStyle = rightGlow;
  ctx.fillRect(0, 0, canvas.width, canvas.height);

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

  ctx.fillStyle = "rgba(3, 9, 18, 0.2)";
  for (let y = 0; y < canvas.height; y += 2) {
    ctx.fillRect(0, y, canvas.width, 1);
  }

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
