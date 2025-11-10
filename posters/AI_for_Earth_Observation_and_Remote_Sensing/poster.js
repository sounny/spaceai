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

  // Hero video handling: fade to loop behavior
  function setupHeroVideo(id){
    const v = document.getElementById(id);
    if (!v) return;
    // don't rely on native loop; implement gentle fade between end and restart
    v.removeAttribute('loop');
    v.addEventListener('loadeddata', () => {
      // ensure playback (muted allows autoplay in most browsers)
      v.play().catch(()=>{});
    });
    v.addEventListener('ended', () => {
      // fade out, then rewind and fade in
      v.classList.add('fade-out');
      setTimeout(() => {
        try{ v.currentTime = 0; v.play(); } catch(e){}
        // force reflow then remove fade-out to fade back in
        requestAnimationFrame(()=> v.classList.remove('fade-out'));
      }, 600);
    });
    // slight initial fade-in
    v.classList.add('fade-out');
    setTimeout(()=> v.classList.remove('fade-out'), 120);
  }

  setupHeroVideo('top-video');
  setupHeroVideo('bottom-video');

  // Image compare (vertical slider) wiring
  const compareRange = document.getElementById('compare-range');
  const imgA = document.querySelector('.image-compare .img-a');
  const imgB = document.querySelector('.image-compare .img-b');
  const divider = document.getElementById('compare-divider');
  function updateCompare(val){
    const v = Number(val);
    // clip right side so that left image A shows v% width
    const clipRight = 100 - v;
    if (imgA) imgA.style.clipPath = `inset(0 ${clipRight}% 0 0)`;
    if (divider) divider.style.left = `${v}%`;
    if (compareRange) compareRange.setAttribute('aria-valuenow', String(v));
  }
  if (compareRange){
    compareRange.addEventListener('input', (e)=> updateCompare(e.target.value));
    // initialize
    updateCompare(compareRange.value);
  }

  // Divider dragging and click-to-move behavior for image compare
  const compareContainer = document.querySelector('.image-compare');
  const dividerEl = document.getElementById('compare-divider');
  let compareDragging = false;

  function setCompareFromClientX(clientX){
    if (!compareContainer) return;
    const rect = compareContainer.getBoundingClientRect();
    let x = clientX - rect.left;
    x = Math.max(0, Math.min(rect.width, x));
    const pct = (x / rect.width) * 100;
    if (compareRange) {
      compareRange.value = Math.round(pct);
      // fire input handlers
      updateCompare(compareRange.value);
    } else {
      updateCompare(pct);
    }
    // update aria on divider as well
    if (dividerEl) dividerEl.setAttribute('aria-valuenow', String(Math.round(pct)));
  }

  if (dividerEl && compareContainer){
    // make divider accessible as a slider-like control
    dividerEl.setAttribute('role', 'slider');
    dividerEl.setAttribute('aria-orientation', 'horizontal');
    dividerEl.setAttribute('aria-valuemin', '0');
    dividerEl.setAttribute('aria-valuemax', '100');

    dividerEl.addEventListener('pointerdown', (ev)=>{
      ev.preventDefault();
      compareDragging = true;
      compareContainer.classList.add('dragging');
      dividerEl.classList.add('dragging');
      try{ dividerEl.setPointerCapture(ev.pointerId); } catch(e){}
      setCompareFromClientX(ev.clientX);
    });

    window.addEventListener('pointermove', (ev)=>{
      if (!compareDragging) return;
      ev.preventDefault();
      setCompareFromClientX(ev.clientX);
    }, {passive:false});

    function stopCompareDrag(ev){
      if (!compareDragging) return;
      compareDragging = false;
      compareContainer.classList.remove('dragging');
      dividerEl.classList.remove('dragging');
      try{ if (ev && ev.pointerId) dividerEl.releasePointerCapture(ev.pointerId); } catch(e){}
    }

    window.addEventListener('pointerup', stopCompareDrag);
    window.addEventListener('pointercancel', stopCompareDrag);

    // allow clicking on the compare container to jump the divider
    compareContainer.addEventListener('click', (ev)=>{
      // ignore clicks on the divider itself (pointerdown handles drag start)
      if (ev.target === dividerEl) return;
      setCompareFromClientX(ev.clientX);
    });
  }

  // Timeline: position milestone cubes along the SVG curve and update on scroll/resize
  const timelineWrap = document.querySelector('.timeline-wrap');
  const timeline = document.querySelector('.timeline');
  let timelineSvg = timelineWrap ? timelineWrap.querySelector('svg') : null;
  let timelinePath = timelineSvg ? timelineSvg.querySelector('path') : null;

  function positionTimelineCubes(){
    if (!timeline || !timelineSvg || !timelinePath) return;
    // parse viewBox to scale SVG coordinates to pixel coordinates
    const vb = (timelineSvg.getAttribute('viewBox') || '0 0 1000 200').split(/\s+/).map(Number);
    const vbW = vb[2] || 1000;
    const vbH = vb[3] || 200;

    const pathLength = timelinePath.getTotalLength();
    const svgRect = timelineSvg.getBoundingClientRect();
    const timelineRect = timeline.getBoundingClientRect();
    const wrapRect = timelineWrap.getBoundingClientRect();

    const cubes = Array.from(timeline.querySelectorAll('.cube[data-pos]'));
    cubes.forEach(cube => {
      const pos = Math.max(0, Math.min(100, Number(cube.dataset.pos || 0)));
      const length = (pos / 100) * pathLength;
      let pt;
      try{ pt = timelinePath.getPointAtLength(length); } catch(e){ pt = {x: (pos/100)*vbW, y: vbH/2}; }

      // map SVG point to pixel coordinates in the document
      const scaleX = svgRect.width / vbW;
      const scaleY = svgRect.height / vbH;
      const pixelX = svgRect.left + pt.x * scaleX;
      const pixelY = svgRect.top + pt.y * scaleY;

      // compute left relative to the scrolling .timeline element (account for scrollLeft)
      const leftWithinTimeline = pixelX - timelineRect.left + timeline.scrollLeft;
      const topWithinWrap = pixelY - wrapRect.top; // position relative to wrap's top

      // apply positions (cubes are positioned absolute inside .timeline)
      cube.style.position = 'absolute';
      cube.style.left = `${Math.round(leftWithinTimeline)}px`;
      // center vertically around the path point
      const offsetY = Math.round(topWithinWrap - (cube.offsetHeight / 2));
      cube.style.top = `${offsetY}px`;
    });
  }

  // Optimize updates with RAF
  let rafId = null;
  function schedulePosition(){
    if (rafId) return;
    rafId = requestAnimationFrame(()=>{ positionTimelineCubes(); rafId = null; });
  }

  // initial positioning
  schedulePosition();
  // reposition on scroll of the timeline (horizontal) and on resize
  if (timeline) timeline.addEventListener('scroll', schedulePosition, {passive:true});
  window.addEventListener('resize', schedulePosition);

  // also reposition when images/videos load that can change layout
  window.addEventListener('load', schedulePosition);

  // Page scroll indicator (right-edge tiny white square)
  const pageIndicator = document.getElementById('page-scroll-indicator');
  function updatePageIndicator(){
    if (!pageIndicator) return;
    const doc = document.documentElement;
    const scrollTop = window.scrollY || doc.scrollTop;
    const scrollHeight = Math.max(doc.scrollHeight, document.body.scrollHeight);
    const clientH = window.innerHeight || doc.clientHeight;
    const maxScroll = Math.max(0, scrollHeight - clientH);
    const progress = maxScroll > 0 ? (scrollTop / maxScroll) : 0;
    const indH = pageIndicator.offsetHeight || 12;
    const y = Math.round(progress * (clientH - indH));
    // position relative to viewport
    pageIndicator.style.top = `${y}px`;
    const val = Math.round(progress * 100);
    pageIndicator.setAttribute('aria-valuenow', String(val));
  }

  // initial update and handlers
  updatePageIndicator();
  window.addEventListener('scroll', updatePageIndicator, {passive:true});
  window.addEventListener('resize', updatePageIndicator);

  // Make the indicator clickable/draggable to control scroll position
  if (pageIndicator){
    let isDragging = false;
    function clientYToProgress(clientY){
      const indH = pageIndicator.offsetHeight || 12;
      const available = window.innerHeight - indH;
      const y = Math.max(0, Math.min(available, clientY));
      return available > 0 ? (y / available) : 0;
    }

    function setScrollFromProgress(progress){
      const doc = document.documentElement;
      const scrollHeight = Math.max(doc.scrollHeight, document.body.scrollHeight);
      const clientH = window.innerHeight || doc.clientHeight;
      const maxScroll = Math.max(0, scrollHeight - clientH);
      const top = Math.round(progress * maxScroll);
      window.scrollTo({ top, left: 0, behavior: 'auto' });
      // Update indicator position/aria after programmatic scroll
      updatePageIndicator();
    }

    pageIndicator.addEventListener('pointerdown', (ev)=>{
      ev.preventDefault();
      isDragging = true;
      pageIndicator.classList.add('dragging');
      pageIndicator.setPointerCapture(ev.pointerId);
      // Immediately respond to where the user clicked
      const rect = pageIndicator.getBoundingClientRect();
      const progress = clientYToProgress(ev.clientY - (rect.height/2));
      setScrollFromProgress(progress);
    });

    pageIndicator.addEventListener('pointermove', (ev)=>{
      if (!isDragging) return;
      ev.preventDefault();
      const progress = clientYToProgress(ev.clientY);
      setScrollFromProgress(progress);
    });

    function endDrag(ev){
      if (!isDragging) return;
      isDragging = false;
      pageIndicator.classList.remove('dragging');
      try{ pageIndicator.releasePointerCapture(ev.pointerId); } catch(e){}
      updatePageIndicator();
    }

    pageIndicator.addEventListener('pointerup', endDrag);
    pageIndicator.addEventListener('pointercancel', endDrag);
    // allow keyboard arrow/page keys to nudge the scroll when indicator focused
    pageIndicator.addEventListener('keydown', (ev)=>{
      if (ev.key === 'ArrowDown' || ev.key === 'PageDown') { ev.preventDefault(); window.scrollBy({ top: window.innerHeight * 0.15, behavior: 'smooth' }); }
      if (ev.key === 'ArrowUp' || ev.key === 'PageUp') { ev.preventDefault(); window.scrollBy({ top: -window.innerHeight * 0.15, behavior: 'smooth' }); }
      if (ev.key === 'Home') { ev.preventDefault(); window.scrollTo({ top:0, behavior:'smooth'}); }
      if (ev.key === 'End') { ev.preventDefault(); window.scrollTo({ top: document.body.scrollHeight, behavior:'smooth'}); }
    });
  }
});
