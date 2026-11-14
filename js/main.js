const cards = document.querySelectorAll('.protein-card');

function getPalette(card) {
  if (card.classList.contains('purple')) {
    return ['#d7bafc', '#e6c7ff', '#b986f8', '#945de4', '#cda8ff', '#f3dfff'];
  }

  if (card.classList.contains('green')) {
    return ['#b8f2df', '#d7f9ef', '#7fdfc2', '#4ec2a8', '#a6ead8', '#dffdf6'];
  }

  return ['#afdcff', '#d9f0ff', '#76c7ff', '#39a5f7', '#9ad8ff', '#e3f7ff'];
}

function drawProtein(canvas, palette, offset) {
  const ctx = canvas.getContext('2d');
  const width = canvas.width;
  const height = canvas.height;

  ctx.clearRect(0, 0, width, height);

  const cx = width / 2;
  const cy = height / 2;
  const layers = 9;

  for (let i = 0; i < layers; i++) {
    const baseRadius = 26 + i * 7.5;
    ctx.beginPath();

    for (let step = 0; step <= 180; step++) {
      const angle = (step / 180) * Math.PI * 2;
      const ripple = Math.sin(angle * 2.6 + offset + i * 0.5) * (8 + i * 1.1);
      const x = cx + Math.cos(angle + offset * 0.8) * (baseRadius + ripple);
      const y = cy + Math.sin(angle + offset * 0.8) * (baseRadius * 0.55 + ripple * 0.5);

      if (step === 0) {
        ctx.moveTo(x, y);
      } else {
        ctx.lineTo(x, y);
      }
    }

    ctx.strokeStyle = palette[i % palette.length];
    ctx.lineWidth = 4.5 + (layers - i) * 0.2;
    ctx.stroke();
  }

  ctx.beginPath();
  ctx.arc(cx, cy, 18, 0, Math.PI * 2);
  ctx.fillStyle = 'rgba(255,255,255,0.35)';
  ctx.fill();
}

function setupCard(card, index) {
  const canvas = card.querySelector('canvas');
  const state = {
    angle: index * 25,
    velocity: 0,
    dragging: false,
    lastX: 0,
    pointerId: null,
    idlePhase: index * 1.8,
  };

  const resize = () => {
    const rect = card.getBoundingClientRect();
    const width = Math.max(240, Math.round(rect.width));
    const height = Math.max(180, Math.round(rect.height));
    canvas.width = width;
    canvas.height = height;
    drawProtein(canvas, getPalette(card), state.idlePhase);
  };

  resize();
  card._state = state;

  card.addEventListener('pointerdown', (event) => {
    state.dragging = true;
    state.pointerId = event.pointerId;
    state.lastX = event.clientX;
    card.setPointerCapture(event.pointerId);
  });

  card.addEventListener('pointermove', (event) => {
    if (!state.dragging) return;

    const dx = event.clientX - state.lastX;
    state.lastX = event.clientX;
    state.angle += dx * 0.55;
    state.velocity = dx * 0.12;
    card.style.transform = `rotate(${state.angle}deg)`;
  });

  const stopDragging = () => {
    state.dragging = false;
    state.pointerId = null;
  };

  card.addEventListener('pointerup', stopDragging);
  card.addEventListener('pointercancel', stopDragging);
  card.addEventListener('pointerleave', () => {
    if (state.dragging) {
      stopDragging();
    }
  });

  const tick = () => {
    if (!state.dragging) {
      state.angle += 0.18 + index * 0.04;
      state.velocity *= 0.97;
      state.idlePhase += 0.04;
      if (Math.abs(state.velocity) < 0.02) {
        state.velocity = 0;
      }
      state.angle += state.velocity;
    }

    drawProtein(canvas, getPalette(card), state.idlePhase + index*0.8);
    card.style.transform = `rotate(${state.angle}deg)`;
    requestAnimationFrame(tick);
  };

  requestAnimationFrame(tick);
  window.addEventListener('resize', resize);
}

cards.forEach(setupCard);
