const canvas = document.getElementById("hero-pixel-canvas");
const ctx = canvas ? canvas.getContext("2d") : null;

const state = { mx: 0, my: 0, t: 0 };
const PIXEL_SCALE = 6;
const PARTICLE_COUNT = 560;
const particles = [];

function wrap(value, max) {
  return ((value % max) + max) % max;
}

function resetParticles() {
  if (!canvas) {
    return;
  }

  particles.length = 0;
  for (let i = 0; i < PARTICLE_COUNT; i += 1) {
    particles.push({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      speed: 0.16 + Math.random() * 0.55,
      wobble: Math.random() * Math.PI * 2,
      drift: Math.random() * 0.9 + 0.2,
      size: Math.random() > 0.82 ? 2 : 1,
    });
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

  state.t += 0.018;

  ctx.fillStyle = "#081018";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  const normMouseX = state.mx / Math.max(1, window.innerWidth);
  const normMouseY = state.my / Math.max(1, window.innerHeight);
  const mouseFlowX = normMouseX * 1.8;
  const mouseFlowY = normMouseY * 1.2;

  for (let i = 0; i < particles.length; i += 1) {
    const p = particles[i];

    const wave = Math.sin(state.t * 1.8 + p.wobble + p.y * 0.08) * p.drift;
    const curl = Math.cos(state.t * 1.1 + p.wobble + p.x * 0.06) * 0.35;

    p.x = wrap(p.x + p.speed + wave + mouseFlowX, canvas.width);
    p.y = wrap(p.y + curl + mouseFlowY, canvas.height);

    const colorMix = (Math.sin(state.t + p.wobble) + 1) * 0.5;
    if (colorMix > 0.5) {
      ctx.fillStyle = "#27e0a9";
    } else {
      ctx.fillStyle = "#2e9dff";
    }

    ctx.fillRect(Math.floor(p.x), Math.floor(p.y), p.size, p.size);
  }

  ctx.fillStyle = "rgba(2, 8, 14, 0.16)";
  for (let y = 0; y < canvas.height; y += 2) {
    ctx.fillRect(0, y, canvas.width, 1);
  }

  requestAnimationFrame(draw);
}

window.addEventListener("mousemove", (e) => {
  state.mx = e.clientX - window.innerWidth / 2;
  state.my = e.clientY - window.innerHeight / 2;
});

window.addEventListener("resize", resizeCanvas);

if (canvas) {
  resizeCanvas();
  draw();
}
