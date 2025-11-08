// poster.js — interactive behaviors for the EO poster

document.addEventListener('DOMContentLoaded', () => {
  // Toggle layers and datasets
  const resetBtn = document.getElementById('reset-view');
  const aiABtn = document.getElementById('toggle-aiA');
  const aiBBtn = document.getElementById('toggle-aiB');
  const aiA = document.getElementById('ai-a');
  const aiB = document.getElementById('ai-b');

  function setPressed(btn, pressed) {
    if (!btn) return;
    btn.setAttribute('aria-pressed', pressed ? 'true' : 'false');
  }

  function showLayer(el, show) {
    if (!el) return;
    el.style.display = show ? '' : 'none';
    el.setAttribute('data-hidden', show ? 'false' : 'true');
  }

  if (aiABtn) aiABtn.addEventListener('click', () => {
    // toggle AI A on/off
    const hidden = aiA && aiA.getAttribute('data-hidden') === 'true';
    showLayer(aiA, hidden);
    setPressed(aiABtn, hidden);
  });

  if (aiBBtn) aiBBtn.addEventListener('click', () => {
    const hidden = aiB && aiB.getAttribute('data-hidden') === 'true';
    showLayer(aiB, hidden);
    setPressed(aiBBtn, hidden);
  });

  if (resetBtn) resetBtn.addEventListener('click', () => resetTransform());

  // Simple carousel
  const frame = document.querySelector('.carousel-frame');
  const slides = Array.from(document.querySelectorAll('.carousel-slide'));
  const prev = document.getElementById('prev');
  const next = document.getElementById('next');
  let idx = 0;

  function showIndex(i) {
    idx = (i + slides.length) % slides.length;
    const offset = -idx * 100;
    if (frame) frame.style.transform = `translateX(${offset}%)`;
    slides.forEach(s => s.setAttribute('aria-hidden', s.dataset.index != idx));
  }

  if (prev) prev.addEventListener('click', () => showIndex(idx - 1));
  if (next) next.addEventListener('click', () => showIndex(idx + 1));

  // initialize carousel layout
  if (frame) {
    frame.style.display = 'flex';
    frame.style.transition = 'transform 300ms ease';
    slides.forEach(s => {
      s.style.minWidth = '100%';
      s.style.flexShrink = '0';
    });
    showIndex(0);
  }

  // Simple SVG zoom & pan
  const svg = document.getElementById('visual-svg');
  let isPanning = false;
  let start = {x:0, y:0};
  let view = {x:0, y:0, k:1};

  if (svg) {
    svg.style.cursor = 'grab';
    svg.addEventListener('wheel', (ev) => {
      ev.preventDefault();
      const delta = -ev.deltaY * 0.001;
      const newK = Math.min(6, Math.max(0.5, view.k * (1 + delta)));
      view.k = newK;
      applyTransform();
    }, {passive: false});

    svg.addEventListener('pointerdown', (ev) => {
      isPanning = true;
      svg.setPointerCapture(ev.pointerId);
      start = {x: ev.clientX, y: ev.clientY};
      svg.style.cursor = 'grabbing';
    });

    svg.addEventListener('pointermove', (ev) => {
      if (!isPanning) return;
      const dx = (ev.clientX - start.x) / view.k;
      const dy = (ev.clientY - start.y) / view.k;
      start = {x: ev.clientX, y: ev.clientY};
      view.x += dx;
      view.y += dy;
      applyTransform();
    });

    svg.addEventListener('pointerup', (ev) => {
      isPanning = false;
      svg.releasePointerCapture(ev.pointerId);
      svg.style.cursor = 'grab';
    });

    svg.addEventListener('pointercancel', () => {
      isPanning = false;
      svg.style.cursor = 'grab';
    });
  }

  function applyTransform() {
    if (!svg) return;
    // Use a simple group transform. Wrap in a <g id="viewport"> if advanced control is needed.
    svg.style.transformOrigin = 'center center';
    svg.style.transform = `translate(${view.x}px, ${view.y}px) scale(${view.k})`;
  }

  function resetTransform() {
    view = {x:0, y:0, k:1};
    applyTransform();
  }

  // Accessibility: keyboard controls
  document.addEventListener('keydown', (ev) => {
    if (ev.key === 'ArrowRight') showIndex(idx + 1);
    if (ev.key === 'ArrowLeft') showIndex(idx - 1);
    if (ev.key === '+') { view.k = Math.min(6, view.k * 1.1); applyTransform(); }
    if (ev.key === '-') { view.k = Math.max(0.5, view.k / 1.1); applyTransform(); }
    if (ev.key === '0') resetTransform();
  });

});
