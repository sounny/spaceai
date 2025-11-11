// Global variables
let scene, camera, renderer, earth, earthClouds;
let satellites = [];
// reusable vector for projecting satellite positions to screen coords
let _satProj = new THREE.Vector3();
let mouseX = 0, mouseY = 0;

/* Financial Impacts spotlight: creates an overlay that follows the mouse and makes the
   surrounding area visually solid (radial mask). Respects prefers-reduced-motion. */
function initFinancialSpotlight(){
    try{
        const prefersReduced = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
        if(prefersReduced) return; // don't create motion-heavy effects

        const section = document.getElementById('financial-impacts') || document.querySelector('.financial-section');
        if(!section) return;

        // ensure container ordering (content sits above the spotlight)
        let overlay = section.querySelector('.financial-spotlight');
        if(!overlay){
            overlay = document.createElement('div');
            overlay.className = 'financial-spotlight';
            section.appendChild(overlay);
        }

        let rafId = null;
        let lastPos = {x: 0, y: 0, radius: 200};

        function updateOverlay(){
            rafId = null;
            const {x,y,radius} = lastPos;
            // clamp radius for very small/large sections
            overlay.style.background = `radial-gradient(circle ${radius}px at ${x}px ${y}px, rgba(0,0,0,0.96) 0%, rgba(0,0,0,0) 60%)`;
            overlay.style.opacity = '1';
        }

        function scheduleUpdate(clientX, clientY){
            const rect = section.getBoundingClientRect();
            // compute coordinates relative to section
            const x = Math.round(Math.max(0, Math.min(rect.width, clientX - rect.left)));
            const y = Math.round(Math.max(0, Math.min(rect.height, clientY - rect.top)));
            const base = Math.max(rect.width, rect.height);
            const radius = Math.round(Math.max(140, Math.min(420, Math.floor(base * 0.22))));
            lastPos = {x, y, radius};
            if(rafId) return;
            rafId = requestAnimationFrame(updateOverlay);
        }

        function onMouseMove(e){
            scheduleUpdate(e.clientX, e.clientY);
        }

        function onTouchMove(e){
            if(!e.touches || e.touches.length === 0) return;
            const t = e.touches[0];
            scheduleUpdate(t.clientX, t.clientY);
        }

        function onLeave(){
            if(rafId){ cancelAnimationFrame(rafId); rafId = null; }
            overlay.style.opacity = '0';
        }

        // Wire events on the section
        section.addEventListener('mousemove', onMouseMove, {passive:true});
        section.addEventListener('touchmove', onTouchMove, {passive:true});
        section.addEventListener('mouseleave', onLeave);
        section.addEventListener('touchend', onLeave);
        section.addEventListener('touchcancel', onLeave);

        // Responsive / resize handling
        const ro = new ResizeObserver(()=>{
            // On resize, reset overlay background center to center and hide until next move
            overlay.style.opacity = '0';
        });
        ro.observe(section);

        // Cleanup reference (in case single-page nav unmounts)
        // attach to section for potential cleanup later
        section._financialSpotlight = {overlay, ro};
    }catch(err){
        console.error('[financialSpotlight] init error', err);
    }
}

// Financial cards: flip/scale on click, keyboard accessible
function initFinancialCardInteractions(){
    try{
        const container = document.querySelector('.financial-cards-grid');
        if(!container) return;
        let active = null;
        const cards = Array.from(container.querySelectorAll('.financial-card'));
        const closeActive = () => {
            if(!active) return;
            active.classList.remove('active');
            active.setAttribute('aria-expanded','false');
            const back = active.querySelector('.card-back');
            if(back) back.setAttribute('aria-hidden','true');
            active = null;
        };

        function activate(card){
            if(active && active !== card) closeActive();
            card.classList.add('active');
            card.setAttribute('aria-expanded','true');
            const back = card.querySelector('.card-back');
            if(back) back.setAttribute('aria-hidden','false');
            active = card;
            // move focus to the back content for screen readers
            if(back && typeof back.focus === 'function') back.focus({preventScroll:true});
        }
        function toggle(card){
            if(card.classList.contains('active')){
                card.classList.remove('active');
                card.setAttribute('aria-expanded','false');
                const back = card.querySelector('.card-back');
                if(back) back.setAttribute('aria-hidden','true');
                if(active === card) active = null;
            } else {
                activate(card);
            }
        }

        cards.forEach(card => {
            // ensure roles/aria
            card.setAttribute('role','button');
            card.setAttribute('tabindex','0');
            card.setAttribute('aria-expanded','false');
            const back = card.querySelector('.card-back');
            if(back) back.setAttribute('aria-hidden','true');

            card.addEventListener('click', (e) => {
                e.stopPropagation();
                toggle(card);
            });
            card.addEventListener('keydown', (e) => {
                if(e.key === 'Enter' || e.key === ' ') { e.preventDefault(); toggle(card); }
                if(e.key === 'Escape') { closeActive(); }
            });
        });

        // Close when clicking outside
        document.addEventListener('click', (e) => {
            if(!container.contains(e.target)) closeActive();
        });

        // Close on escape at document level
        document.addEventListener('keydown', (e) => {
            if(e.key === 'Escape') closeActive();
        });
    }catch(err){
        console.error('initFinancialCardInteractions error', err);
    }
}

// Run the card interactions once DOM is ready
if(document.readyState === 'loading'){
    document.addEventListener('DOMContentLoaded', initFinancialCardInteractions);
} else {
    initFinancialCardInteractions();
}

    // Initialize the "Including Launch" cost doughnut here so it runs with other charts
    (function createIncludingLaunchChart(){
        try{
            const el = document.getElementById('costChartIncluding');
            if (!el || typeof Chart === 'undefined') return;

            // destroy previous instance if present
            try{ const prev = Chart.getChart ? Chart.getChart(el) : null; if (prev) prev.destroy(); } catch(e){}

            const ctx = el.getContext('2d');
            const labels = [
                'Launch Cost','Extra Testing Cost','Space Grade Hardware Premium','Networking','Server development cost','Storage','Factory development costs','Building Cost (Translated to Space Center Cost)'
            ];
            const values = [47880, 263.75, 211, 120, 500, 200, 12, 12];
            const colors = ['#ff6b35','#ff9a66','#ffd166','#00d4ff','#00ff88','#7adcff','#b19cd9','#ff6bcb'];
            const total = values.reduce((a,b)=>a+b,0);
            const nf = new Intl.NumberFormat('en-US',{style:'currency',currency:'USD',maximumFractionDigits:2});

            const centerPlugin = {
                id: 'centerText_costIncluding_initCharts',
                afterDraw: function(/* chart */){
                    return; // noop: center text intentionally disabled
                }
            };
            // Register plugin (noop) to avoid duplicate registration errors
            try{ Chart.register(centerPlugin); }catch(e){}

            const chart = new Chart(ctx, {
                type: 'doughnut',
                data: { labels: labels, datasets: [{ data: values, backgroundColor: colors, hoverOffset: 12, borderWidth: 0 }] },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    cutout: '60%',
                    plugins: {
                        legend: { position: 'bottom', labels: { color: '#ffffff', boxWidth: 12, padding: 12 } },
                        tooltip: {
                            callbacks: {
                                    label: function(ctx){
                                        const v = ctx.raw;
                                        const lbl = ctx.label || '';
                                        const pct = (total && total > 0) ? (v / total * 100) : 0;
                                        return lbl + ': ' + nf.format(v) + ' (' + pct.toFixed(2) + '%)';
                                    },
                                footer: function(){ return 'Total: ' + nf.format(total); }
                            },
                            backgroundColor: 'rgba(0,20,84,0.92)', titleColor: '#ffffff', bodyColor: '#ffffff', footerColor: '#ffffff', displayColors: true
                        }
                    }
                }
            });
            window._costChartIncluding = chart;
        }catch(err){ console.error('[createIncludingLaunchChart] failed', err); }
    })();

    // Create the "Excluding Launch" cost doughnut (right-side) — same style as the left chart
    (function createExcludingLaunchChart(){
        try{
            const el = document.getElementById('costChartExcluding');
            if (!el || typeof Chart === 'undefined') return;

            try{ const prev = Chart.getChart ? Chart.getChart(el) : null; if (prev) prev.destroy(); } catch(e){}

            const ctx = el.getContext('2d');
            // Order matches the left chart but omits 'Launch Cost' so slices align visually
            const labels = [
                'Extra Testing Cost',
                'Space Grade Hardware Premium',
                'Networking',
                'Server development cost',
                'Storage',
                'Factory development costs',
                'Building Cost (Translated to Space Center Cost)'
            ];
            const values = [263.75, 211, 120, 500, 200, 12, 12];
            // use the same palette as the left chart (skipping the Launch color)
            const colors = ['#ff9a66','#ffd166','#00d4ff','#00ff88','#7adcff','#b19cd9','#ff6bcb'];
            const total = values.reduce((a,b)=>a+b,0);
            const nf = new Intl.NumberFormat('en-US',{style:'currency',currency:'USD',maximumFractionDigits:2});

            const centerPlugin = { id: 'centerText_costExcluding_init', afterDraw: function(/*chart*/){ return; } };
            try{ Chart.register(centerPlugin); }catch(e){}

            const chart = new Chart(ctx, {
                type: 'doughnut',
                data: { labels: labels, datasets: [{ data: values, backgroundColor: colors, hoverOffset: 12, borderWidth: 0 }] },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    cutout: '60%',
                    plugins: {
                        legend: { position: 'bottom', labels: { color: '#ffffff', boxWidth: 12, padding: 12 } },
                        tooltip: {
                            callbacks: {
                                label: function(ctx){ const v = ctx.raw; const lbl = ctx.label || ''; const pct = (total && total>0) ? (v/total*100) : 0; return lbl + ': ' + nf.format(v) + ' (' + pct.toFixed(2) + '%)'; },
                                footer: function(){ return 'Total: ' + nf.format(total); }
                            },
                            backgroundColor: 'rgba(0,20,84,0.92)', titleColor: '#ffffff', bodyColor: '#ffffff', footerColor: '#ffffff', displayColors: true
                        }
                    }
                }
            });
            window._costChartExcluding = chart;
        }catch(err){ console.error('[createExcludingLaunchChart] failed', err); }
    })();

// Current Projects animated background + interactivity
function initProjectsBackground(){
    try{
        const prefersReduced = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
        const section = document.getElementById('current-projects') || document.querySelector('.current-projects');
        if(!section) return;

        // create overlay if missing
        let overlay = section.querySelector('.projects-bg');
        if(!overlay){
            overlay = document.createElement('div');
            overlay.className = 'projects-bg';
            section.insertBefore(overlay, section.firstChild);
        }

        // If reduced motion, keep a static subtle overlay
        if (prefersReduced) {
            overlay.style.animation = 'none';
            overlay.style.opacity = '0.92';
            return;
        }

        let raf = null;
        let last = {x: '50%', y: '50%', r: 220};

        function update(){
            raf = null;
            overlay.style.setProperty('--cx', typeof last.x === 'number' ? last.x + 'px' : last.x);
            overlay.style.setProperty('--cy', typeof last.y === 'number' ? last.y + 'px' : last.y);
            overlay.style.setProperty('--r', last.r + 'px');
        }

        function schedule(x, y){
            const rect = section.getBoundingClientRect();
            const px = Math.round(Math.max(0, Math.min(rect.width, x - rect.left)));
            const py = Math.round(Math.max(0, Math.min(rect.height, y - rect.top)));
            const base = Math.max(160, Math.min(rect.width, rect.height));
            const r = Math.round(Math.max(120, Math.min(420, Math.floor(base * 0.28))));
            last = { x: px, y: py, r };
            if (raf) return;
            raf = requestAnimationFrame(update);
        }

        function onMouseMove(e){ schedule(e.clientX, e.clientY); }
        function onTouchMove(e){ if(!e.touches || !e.touches.length) return; schedule(e.touches[0].clientX, e.touches[0].clientY); }
        function onLeave(){ overlay.style.setProperty('--cx','50%'); overlay.style.setProperty('--cy','50%'); overlay.style.setProperty('--r','220px'); }

        section.addEventListener('mousemove', onMouseMove, { passive: true });
        section.addEventListener('touchmove', onTouchMove, { passive: true });
        section.addEventListener('mouseleave', onLeave);
        section.addEventListener('touchend', onLeave);

        // When a specific project card is hovered, make the overlay slightly lighter and pause the pulse
        const cards = Array.from(section.querySelectorAll('.financial-card'));
        cards.forEach(c => {
            c.addEventListener('mouseenter', () => { overlay.classList.add('focused'); overlay.style.opacity = '0.72'; });
            c.addEventListener('mouseleave', () => { overlay.classList.remove('focused'); overlay.style.opacity = ''; });
            // Also on focus for keyboard users
            c.addEventListener('focus', () => { overlay.classList.add('focused'); overlay.style.opacity = '0.72'; });
            c.addEventListener('blur', () => { overlay.classList.remove('focused'); overlay.style.opacity = ''; });
        });

        // responsive: hide pulse on small screens to save battery
        const mq = window.matchMedia('(max-width:720px)');
        function handleMq(){ if(mq.matches){ overlay.style.animationPlayState = 'paused'; overlay.style.opacity = '0.92'; } else { overlay.style.animationPlayState = ''; } }
        mq.addEventListener && mq.addEventListener('change', handleMq);
        handleMq();

        // store for cleanup if needed
        section._projectsBg = { overlay };
    }catch(err){ console.error('[projectsBg] init error', err); }
}

// Initialize everything when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    initTypewriter();
    initScrollAnimations();
    initStarfield();
    init3DEarth();
    initOrbitalViewer();
    initCharts();
    initTemperatureChart();
    initAIIntegrationBackground();
    initAIBoxModels();
    initTechCardParallax();
    initSustainabilitySection();
    initFinancialSpotlight();
    initProjectsBackground();
    initInteractiveElements();
    initFinancialNumberInteractions();
    initSphereIdleMotion();
    initSmoothScrolling();
});

    // Make Financial Impacts texts/cards interactive based on mouse proximity and focus
    function initFinancialInteractions(){
        try{
            const section = document.getElementById('financial-impacts') || document.querySelector('.financial-section');
            if(!section) return;
            const cards = Array.from(section.querySelectorAll('.financial-card'));
            if(!cards.length) return;

            // Respect reduced motion preference
            if (window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
                // wire basic focus/hover class toggles for keyboard users
                cards.forEach(c => {
                    c.addEventListener('mouseenter', () => c.classList.add('interactive'));
                    c.addEventListener('mouseleave', () => c.classList.remove('interactive'));
                    c.addEventListener('focus', () => c.classList.add('interactive'));
                    c.addEventListener('blur', () => c.classList.remove('interactive'));
                });
                return;
            }

            let raf = null;

            function applyProximity(mx, my){
                // compute distance to card centers and set intensity
                const maxDist = Math.max(220, Math.min(window.innerWidth, 520));
                cards.forEach(c => {
                    const r = c.getBoundingClientRect();
                    const cx = r.left + r.width/2;
                    const cy = r.top + r.height/2;
                    const dx = cx - mx;
                    const dy = cy - my;
                    const d = Math.sqrt(dx*dx + dy*dy);
                    const intensity = Math.max(0, 1 - (d / maxDist)); // 0..1

                    // Smooth visual mapping
                    const ty = -8 * intensity; // translate up to -8px
                    const scale = 1 + 0.03 * intensity;
                    const shadowAlpha = 0.06 + 0.14 * intensity;

                    c.style.transform = `translateY(${ty.toFixed(2)}px) scale(${scale.toFixed(3)})`;
                    c.style.boxShadow = intensity > 0.03 ? `0 ${Math.round(18 + intensity*30)}px ${Math.round(40 + intensity*60)}px rgba(0,160,220,${shadowAlpha.toFixed(3)})` : '';
                    c.style.filter = `saturate(${(1 + intensity*0.18).toFixed(3)})`;

                    // text emphasis
                    const h = c.querySelector('h4');
                    const p = c.querySelector('p');
                    if(h) h.style.color = intensity > 0.12 ? '#ffffff' : '#9fdcff';
                    if(p) p.style.color = `rgba(255,255,255,${(0.92 + intensity*0.08).toFixed(2)})`;
                });
            }

            function onMove(e){
                const mx = e.clientX;
                const my = e.clientY;
                if (raf) cancelAnimationFrame(raf);
                raf = requestAnimationFrame(()=>{ applyProximity(mx, my); raf = null; });
            }

            function onLeave(){
                // reset styles
                cards.forEach(c => {
                    c.style.transform = '';
                    c.style.boxShadow = '';
                    c.style.filter = '';
                    const h = c.querySelector('h4'); if(h) h.style.color = '';
                    const p = c.querySelector('p'); if(p) p.style.color = '';
                });
            }

            section.addEventListener('mousemove', onMove, { passive: true });
            section.addEventListener('touchmove', (e)=>{ if(e.touches && e.touches[0]) onMove(e.touches[0]); }, { passive: true });
            section.addEventListener('mouseleave', onLeave);
            section.addEventListener('touchend', onLeave);

            // keyboard and pointer accessibility: also toggle persistent class on focus/hover
            cards.forEach(c => {
                c.addEventListener('mouseenter', () => c.classList.add('interactive'));
                c.addEventListener('mouseleave', () => c.classList.remove('interactive'));
                c.addEventListener('focus', () => c.classList.add('interactive'));
                c.addEventListener('blur', () => c.classList.remove('interactive'));
            });

            // store for possible cleanup
            section._financialInteractions = { cards };
        }catch(err){ console.error('[financialInteractions] init error', err); }
    }

// Make numeric financial values interactive: hover/focus tooltip, keyboard support, click/Enter to copy, accessible confirmation
function initFinancialNumberInteractions(){
    try{
        const section = document.querySelector('.financial-section') || document.getElementById('financial-impacts');
        if(!section) return;

    // select any element in the financial section with class "numeric" (table cells and our prominent totals)
    const numericCells = Array.from(section.querySelectorAll('.numeric'));
    // keep selecting summary values specifically as well (older markup)
    const summaryValues = Array.from(section.querySelectorAll('.financial-summary .value'));
        if(!numericCells.length && !summaryValues.length) return;

        // Create tooltip element (single shared) and hidden live region
        let tooltip = document.querySelector('.num-tooltip');
        if (!tooltip) { tooltip = document.createElement('div'); tooltip.className = 'num-tooltip'; document.body.appendChild(tooltip); }
        let live = document.querySelector('.sr-live');
        if (!live) { live = document.createElement('div'); live.className = 'sr-live'; live.setAttribute('aria-live','polite'); document.body.appendChild(live); }

        function showTooltip(target, text){
            try{
                const r = target.getBoundingClientRect();
                tooltip.textContent = text;
                const left = Math.round(r.left + (r.width/2));
                const top = Math.round(r.top - 8);
                tooltip.style.left = left + 'px';
                tooltip.style.top = top + 'px';
                tooltip.style.opacity = '1';
                tooltip.style.transform = 'translate(-50%, -100%)';
                clearTimeout(tooltip._hide);
                tooltip._hide = setTimeout(()=>{ tooltip.style.opacity = '0'; }, 1600);
            }catch(e){}
        }

        function hideTooltip(){ if(tooltip) { tooltip.style.opacity = '0'; } }

        function copyText(text){
            if (!text) return Promise.resolve(false);
            if (navigator.clipboard && navigator.clipboard.writeText) {
                return navigator.clipboard.writeText(text).then(()=>true).catch(()=>false);
            }
            // fallback
            return new Promise((resolve)=>{
                try{
                    const ta = document.createElement('textarea'); ta.value = text; ta.style.position='fixed'; ta.style.left='-9999px'; document.body.appendChild(ta); ta.select(); document.execCommand('copy'); ta.remove(); resolve(true);
                }catch(e){ resolve(false); }
            });
        }

        function activateElement(el){
            // prefer a stable data-copy attribute if present (so animated text doesn't affect copied value)
            const stable = el.getAttribute('data-copy') || el.dataset.copy || el.textContent.trim();
            copyText(stable).then(ok => {
                if(ok){
                    live.textContent = stable + ' copied to clipboard';
                    showTooltip(el, 'Copied: ' + stable);
                } else {
                    live.textContent = 'Copy failed';
                    showTooltip(el, 'Copy failed');
                }
            });
        }

        function makeInteractive(el){
            if(!el) return;
            if (!el.hasAttribute('tabindex')) el.setAttribute('tabindex','0');
            el.setAttribute('role','button');
            // set a helpful aria-label (preserve existing if present)
            const baseLabel = el.getAttribute('aria-label') || '';
            const label = baseLabel + ' Value ' + el.textContent.trim() + '. Press Enter or Space to copy.';
            el.setAttribute('aria-label', label.trim());

            el.addEventListener('click', (ev) => { ev.preventDefault(); activateElement(el); });
            el.addEventListener('keydown', (ev) => { if (ev.key === 'Enter' || ev.key === ' ') { ev.preventDefault(); activateElement(el); } });
            el.addEventListener('focus', ()=> showTooltip(el, 'Press Enter to copy: ' + el.textContent.trim()));
            el.addEventListener('blur', ()=> hideTooltip());
            el.addEventListener('mouseenter', ()=> showTooltip(el, 'Click to copy: ' + el.textContent.trim()));
            el.addEventListener('mouseleave', ()=> hideTooltip());
        }

        numericCells.forEach(el => {
            makeInteractive(el);
            // store stable copy value (final formatted text) so animations can update visible text
            try { el.dataset.copy = el.textContent.trim(); } catch(e){}
        });
        summaryValues.forEach(el => {
            makeInteractive(el);
            try { el.dataset.copy = el.textContent.trim(); } catch(e){}
        });

        // Animate prominent totals if present
        requestAnimationFrame(() => {
            try { animateFinancialTotals(); } catch(e){}
        });

    }catch(err){ console.warn('[financialNumbers] init failed', err); }
}

// Subtle idle motion for benefit spheres (in-place, small offsets)
function initSphereIdleMotion() {
    try {
        if (window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
        const spheres = Array.from(document.querySelectorAll('.benefit-sphere'));
        if (!spheres.length) return;

        // assign unique parameters per sphere
        const params = spheres.map((el, i) => {
            const phase = Math.random() * Math.PI * 2;
            return {
                el,
                phase,
                // larger amplitudes for more noticeable motion (but still subtle)
                ax: 14 + Math.random() * 18,    // px amplitude x (14..32)
                ay: 10 + Math.random() * 18,    // px amplitude y (10..28)
                rot: (Math.random() - 0.5) * 8.0, // deg amplitude (~±4°)
                // slightly higher and varied frequencies for livelier motion
                freq: 0.7 + Math.random() * 1.0,
                freq2: 0.55 + Math.random() * 1.0,
                // slightly stronger scale pulsing
                scaleAmp: 0.02 + Math.random() * 0.05
            };
        });

        let start = performance.now();
        function loop(now) {
            const t = (now - start) / 1000;
            params.forEach(p => {
                const x = Math.sin(t * p.freq + p.phase) * p.ax;
                const y = Math.cos(t * p.freq2 + p.phase * 0.7) * p.ay;
                const r = Math.sin(t * (p.freq * 0.7) + p.phase) * p.rot;
                const s = 1 + Math.sin(t * (p.freq * 0.9) + p.phase * 1.3) * p.scaleAmp;
                try {
                    p.el.style.setProperty('--idle-x', `${x.toFixed(2)}px`);
                    p.el.style.setProperty('--idle-y', `${y.toFixed(2)}px`);
                    p.el.style.setProperty('--idle-rot', `${r.toFixed(2)}deg`);
                    p.el.style.setProperty('--idle-scale', `${s.toFixed(3)}`);
                } catch (e) {}
            });
            window._sphereIdleRaf = requestAnimationFrame(loop);
        }
        window._sphereIdleRaf = requestAnimationFrame(loop);

        // cleanup when navigating away or if spheres removed
        
                window.addEventListener('beforeunload', () => { try { cancelAnimationFrame(window._sphereIdleRaf); } catch(e){} });
    } catch (e) { console.warn('initSphereIdleMotion failed', e); }
}

// Small interactive orbital viewer inside the Orbital Solution section
let orbitalScene, orbitalCamera, orbitalRenderer, orbitalGroup, orbitalSatellites = [];
function initOrbitalViewer() {
    const container = document.querySelector('.orbital-visualization');
    if (!container) return;
    const canvas = document.getElementById('orbitalCanvas');
    if (!canvas) return;

    // Scene + camera + renderer scoped to the small viewer
    orbitalScene = new THREE.Scene();
    const aspect = container.clientWidth / Math.max(300, container.clientHeight);
    orbitalCamera = new THREE.PerspectiveCamera(50, aspect, 0.1, 1000);
    orbitalRenderer = new THREE.WebGLRenderer({ canvas: canvas, alpha: true, antialias: true });
    orbitalRenderer.setPixelRatio(window.devicePixelRatio || 1);
    orbitalRenderer.setSize(container.clientWidth, container.clientHeight);
    orbitalRenderer.setClearColor(0x000000, 0);

    // Create a small group to rotate
    orbitalGroup = new THREE.Group();
    orbitalScene.add(orbitalGroup);

    // Earth / Datacenter sphere (starts as image; morphs into textured sphere on scroll)
    const earthGeo = new THREE.SphereGeometry(1.0, 32, 32);
    const datacenterImage = document.getElementById('datacenterImage');
    let dataTexture = null;
    const earthMat = new THREE.MeshStandardMaterial({ color: 0x2255ff, emissive: 0x001122, metalness: 0.1, roughness: 0.7 });
    const orbitalEarth = new THREE.Mesh(earthGeo, earthMat);
    // start scaled down so it can 'grow' during the morph
    orbitalEarth.scale.setScalar(0.28);
    orbitalGroup.add(orbitalEarth);

    // If a datacenter image exists, create a Three texture from it when loaded
    if (datacenterImage) {
        console.debug('[orbital] datacenterImage element found, complete=', datacenterImage.complete);
        if (datacenterImage.complete && datacenterImage.naturalWidth) {
            try {
                dataTexture = new THREE.Texture(datacenterImage);
                dataTexture.needsUpdate = true;
                earthMat.map = dataTexture;
                earthMat.needsUpdate = true;
                console.debug('[orbital] created texture from datacenter image (synchronous)');
            } catch (e) {
                console.warn('Failed to create texture from datacenter image (sync):', e);
            }
        } else {
            datacenterImage.addEventListener('load', function() {
                try {
                    dataTexture = new THREE.Texture(datacenterImage);
                    dataTexture.needsUpdate = true;
                    earthMat.map = dataTexture;
                    earthMat.needsUpdate = true;
                    console.debug('[orbital] created texture from datacenter image (onload)');
                } catch (e) {
                    console.warn('Failed to create texture from datacenter image (onload):', e);
                }
            });
    
            // Cost chart: "Including Launch" (interactive doughnut)
            function initCostChartIncluding(){
                try{
                    const el = document.getElementById('costChartIncluding');
                    if(!el || typeof Chart === 'undefined') return;

                    // destroy previous instance if present
                    try{ const prev = Chart.getChart ? Chart.getChart(el) : null; if(prev) prev.destroy(); } catch(e){}

                    const ctx = el.getContext('2d');
                    const labels = [
                        'Launch Cost',
                        'Extra Testing Cost',
                        'Space Grade Hardware Premium',
                        'Networking',
                        'Server development cost',
                        'Storage',
                        'Factory development costs',
                        'Building Cost (Translated to Space Center Cost)'
                    ];
                    const values = [47880, 263.75, 211, 120, 500, 200, 12, 12];
                    const colors = ['#ff6b35','#ff9a66','#ffd166','#00d4ff','#00ff88','#7adcff','#b19cd9','#ff6bcb'];
                    const total = values.reduce((a,b)=>a+b,0);
                    const nf = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 2 });

                    // center text plugin (disabled) — removed center total per user request
                    const centerPlugin = {
                        id: 'centerTextPlugin_costIncluding',
                        afterDraw: function(/* chart */){
                            return; // intentionally noop to avoid drawing center text
                        }
                    };
                    try{ Chart.register(centerPlugin); }catch(e){}

                    const chart = new Chart(ctx, {
                        type: 'doughnut',
                        data: { labels: labels, datasets: [{ data: values, backgroundColor: colors, hoverOffset: 12, borderWidth: 0 }] },
                        options: {
                            responsive: true,
                            maintainAspectRatio: false,
                            cutout: '60%',
                            plugins: {
                                legend: { position: 'bottom', labels: { color: '#ffffff', boxWidth: 12, padding: 12 } },
                                tooltip: {
                                    callbacks: {
                                        label: function(ctx){
                                            const v = ctx.raw;
                                            const lbl = ctx.label || '';
                                            const pct = (total && total > 0) ? (v / total * 100) : 0;
                                            return lbl + ': ' + nf.format(v) + ' (' + pct.toFixed(2) + '%)';
                                        },
                                        footer: function(){ return 'Total: ' + nf.format(total); }
                                    },
                                    backgroundColor: 'rgba(0,20,84,0.92)',
                                    titleColor: '#ffffff',
                                    bodyColor: '#ffffff',
                                    footerColor: '#ffffff',
                                    displayColors: true
                                }
                            }
                        }
                    });

                    // expose for debugging
                    window._costChartIncluding = chart;
                }catch(err){ console.error('[costChartIncluding] init failed', err); }
            }
        }
    }

    // Call cost chart initializer (ensure it runs regardless of datacenter image load state)
    try{ initCostChartIncluding(); }catch(e){ console.warn('[costChartIncluding] deferred init failed', e); }

    // Ambient + rim light
    orbitalScene.add(new THREE.AmbientLight(0xffffff, 0.35));
    const rim = new THREE.DirectionalLight(0xffffff, 0.9);
    rim.position.set(5, 3, 5);
    orbitalScene.add(rim);

    // Rings for LEO, MEO, GEO using TorusGeometry for a subtle 3D look
    const ringMaterial = new THREE.MeshBasicMaterial({ color: 0x00d4ff, opacity: 0.14, transparent: true, side: THREE.DoubleSide });
    const ringGeos = [2.0, 2.6, 3.4];
    ringGeos.forEach((r, i) => {
        const torus = new THREE.TorusGeometry(r, 0.02 + i * 0.004, 16, 120);
        const mesh = new THREE.Mesh(torus, ringMaterial.clone());
        mesh.rotation.x = Math.PI / 2.3 + (i * 0.08);
        mesh.material.opacity = 0.12 + i * 0.03;
        orbitalGroup.add(mesh);
    });

    // Create orbital satellites (small stylized models) that orbit at different radii
    function buildOrbitalSat(scale = 0.55) {
        // reuse the same concept as hero satellites but smaller
        const g = new THREE.Group();
        const body = new THREE.SphereGeometry(0.06 * scale, 12, 12);
        const bodyMat = new THREE.MeshStandardMaterial({ color: 0x0fffe0, emissive: 0x00ffd0, emissiveIntensity: 0.55, metalness: 0.2, roughness: 0.25 });
        const bodyMesh = new THREE.Mesh(body, bodyMat);
        g.add(bodyMesh);

        // tiny panel hints
        const panelGeo = new THREE.BoxGeometry(0.02 * scale, 0.05 * scale, 0.002 * scale);
        const panelMat = new THREE.MeshStandardMaterial({ color: 0x05202a, emissive: 0x001122, metalness: 0.1, roughness: 0.45 });
        const p1 = new THREE.Mesh(panelGeo, panelMat);
        p1.position.set(-0.05 * scale, 0, 0.03 * scale);
        const p2 = p1.clone(); p2.position.set(-0.05 * scale, 0, -0.03 * scale);
        g.add(p1); g.add(p2);

        // glow sprite
        const spr = (function(){
            const c = document.createElement('canvas'); const s = 48; c.width = s; c.height = s; const cx = c.getContext('2d');
            const gg = cx.createRadialGradient(s/2,s/2,0,s/2,s/2,s/2); gg.addColorStop(0,'rgba(0,255,220,0.7)'); gg.addColorStop(0.2,'rgba(0,255,220,0.18)'); gg.addColorStop(1,'rgba(0,0,0,0)'); cx.fillStyle = gg; cx.fillRect(0,0,s,s);
        const _satProj = new THREE.Vector3();
            const tex = new THREE.CanvasTexture(c); return new THREE.Sprite(new THREE.SpriteMaterial({ map: tex, transparent: true, blending: THREE.AdditiveBlending }));
        })();
        spr.scale.set(0.45 * scale, 0.45 * scale, 1);
        g.add(spr);

        return g;
    }
    for (let i = 0; i < 9; i++) {
        const sat = buildOrbitalSat(0.7);
                const baseSpeed = 0.01 + (i % 3) * 0.005;
                satellite.userData = {
                    radius: radius,
                    angle: angle,
                    baseSpeed: baseSpeed * 0.1, // run much slower by default
                    currentSpeed: baseSpeed * 0.1,
                    originalY: height
                };
    }

    // Camera position
    orbitalCamera.position.set(0, 0.6, 6);
    orbitalCamera.lookAt(orbitalScene.position);

    // Scroll-driven morph: crossfade image -> 3D sphere and scale sphere
    // Compute progress (0..1) based on how far the container has scrolled into view
    function clamp(v, a=0, b=1) { return Math.max(a, Math.min(b, v)); }
    function updateMorph() {
        const r = container.getBoundingClientRect();
        // progress: when top of container reaches bottom of viewport -> ~0; when container fully in view -> ~0.5-0.7; when near top -> ~1
        const progress = clamp((window.innerHeight - r.top) / (window.innerHeight + r.height));
        // map a sweet spot into 0..1 (start ~0.18, end ~0.78)
        const t = clamp((progress - 0.18) / 0.6, 0, 1);

    // crossfade image and canvas
    if (datacenterImage) datacenterImage.style.opacity = (1 - t).toFixed(3);
    try { orbitalRenderer.domElement.style.opacity = t.toFixed(3); } catch(e){}

    // debug
    if (window.__orbital_debug) console.debug('[orbital] morph t=', t.toFixed(3), 'progress=', progress.toFixed(3));

        // subtle image transform during morph
        if (datacenterImage) datacenterImage.style.transform = `translate(-50%,-50%) scale(${1 - 0.06 * t})`;

        // scale sphere smoothly
        const scale = 0.28 + 0.72 * t; // 0.28 -> 1.0
        orbitalGroup.scale.setScalar(scale);

        // once t passes small threshold, ensure the material uses the texture if available
        if (t > 0.06 && dataTexture && earthMat.map !== dataTexture) {
            earthMat.map = dataTexture;
            earthMat.needsUpdate = true;
            console.debug('[orbital] applied dataTexture to sphere at t=', t.toFixed(3));
        }
    }

    // init morph state and attach scroll/resize listeners
    updateMorph();
    window.addEventListener('scroll', () => { requestAnimationFrame(updateMorph); }, { passive: true });
    window.addEventListener('resize', () => { requestAnimationFrame(updateMorph); }, { passive: true });

    // Simple drag-to-rotate controls
    let isDragging = false;
                const baseSpeed = 0.008 + (i % 3) * 0.002;
                sat.userData = { radius: radius, angle: angle, baseSpeed: baseSpeed * 0.1, currentSpeed: baseSpeed * 0.1 };
    container.addEventListener('mousedown', (e) => { isDragging = true; prevX = e.clientX; prevY = e.clientY; });
    window.addEventListener('mouseup', () => { isDragging = false; });
    window.addEventListener('mousemove', (e) => {
        if (!isDragging) return;
        const dx = (e.clientX - prevX) / container.clientWidth;
        const dy = (e.clientY - prevY) / container.clientHeight;
        prevX = e.clientX; prevY = e.clientY;
        orbitalGroup.rotation.y += dx * 2.5;
        orbitalGroup.rotation.x += dy * 1.5;
        orbitalGroup.rotation.x = Math.max(-0.8, Math.min(0.8, orbitalGroup.rotation.x));
    });

    // Orbit descriptions data (mapped to labels)
    const orbitData = {
        leo: {
            name: 'Low Earth Orbit (LEO)',
            text: 'LEO: 160–2,000 km. Low latency (≈25–88 ms), ideal for real-time edge compute and short revisits. Good for high-throughput, low-latency services.'
        },
        meo: {
            name: 'Medium Earth Orbit (MEO)',
            text: 'MEO: 2,000–35,786 km. Balanced coverage and latency. Often used for navigation and midsize constellations; tradeoffs between coverage and latency.'
        },
        geo: {
            name: 'Geostationary Orbit (GEO)',
            text: 'GEO: ≈35,786 km. Fixed position relative to Earth with wide coverage but higher latency (≈250 ms). Useful for broadcast and persistent coverage.'
        }
    };

    // Orbit description overlays removed — labels/boxes were removed per design

    // Wheel to zoom in/out and show orbit descriptions based on camera distance
    // Make zoom less sensitive to avoid rapid toggling and show descriptions reliably
    container.addEventListener('wheel', (e) => {
        e.preventDefault();
        const delta = Math.sign(e.deltaY) * 0.25; // reduced sensitivity
        // allow a slightly wider camera range so descriptions map cleanly
        orbitalCamera.position.z = Math.max(3, Math.min(14, orbitalCamera.position.z + delta));
        // show description depending on zoom level (closer => LEO, mid => MEO, far => GEO)
        updateOrbitDescriptions();
    }, { passive: false });

    // Also update descriptions on programmatic zoom changes
    function updateOrbitDescriptions() {
        const z = orbitalCamera.position.z;
        // make thresholds wider and more forgiving so quick scrolls don't hide them
        // z <= 6 -> focus LEO; 6 < z <= 9.5 -> MEO; z > 9.5 -> GEO
        if (z <= 6) {
            descLeo.classList.add('show'); descMeo.classList.remove('show'); descGeo.classList.remove('show');
        } else if (z <= 9.5) {
            descLeo.classList.remove('show'); descMeo.classList.add('show'); descGeo.classList.remove('show');
        } else {
            descLeo.classList.remove('show'); descMeo.classList.remove('show'); descGeo.classList.add('show');
        }
        // auto-hide after a longer delay when user stops zooming so it survives fast scrolls
        clearTimeout(window._orbitDescTimer);
        window._orbitDescTimer = setTimeout(() => {
            descLeo.classList.remove('show'); descMeo.classList.remove('show'); descGeo.classList.remove('show');
        }, 3500);
    }

    // Initialize description state (hidden)
    updateOrbitDescriptions();

    // Resize handler for the orbital canvas
    function resizeOrbital() {
        const w = container.clientWidth;
        const h = container.clientHeight;
        orbitalCamera.aspect = w / Math.max(200, h);
        orbitalCamera.updateProjectionMatrix();
        orbitalRenderer.setSize(w, h);
    }
    window.addEventListener('resize', resizeOrbital);
    resizeOrbital();

    // Animate orbital viewer
    function renderOrbital() {
        requestAnimationFrame(renderOrbital);
        // Rotate earth slowly
        orbitalGroup.rotation.y += 0.0012;
        orbitalSatellites.forEach((s) => {
            // proximity-based speed modulation (orbital viewer)
            let target = s.userData.baseSpeed;
            if (typeof orbitalMouse !== 'undefined' && orbitalMouse.active) {
                // project satellite to screen coords
                s.getWorldPosition(_satProj);
                _satProj.project(orbitalCamera);
                const sx = ( _satProj.x + 1 ) / 2 * container.clientWidth;
                const sy = ( 1 - _satProj.y ) / 2 * container.clientHeight;
                const dx = sx - orbitalMouse.x;
                const dy = sy - orbitalMouse.y;
                const d = Math.sqrt(dx*dx + dy*dy);
                const thresh = 120;
                if (d < thresh) {
                    const factor = (thresh - d) / thresh; // 0..1
                    target = s.userData.baseSpeed * (1 + factor * 6); // speed up up to ~7x
                }
            }
            // smooth toward target
            s.userData.currentSpeed += (target - s.userData.currentSpeed) * 0.12;
            s.userData.angle += s.userData.currentSpeed;
            s.position.x = Math.cos(s.userData.angle) * s.userData.radius;
            s.position.z = Math.sin(s.userData.angle) * s.userData.radius;
            s.position.y = Math.sin(Date.now() * 0.001 + s.userData.angle) * 0.12;
        });
        orbitalRenderer.render(orbitalScene, orbitalCamera);
    }
    renderOrbital();

    // track mouse inside orbital container for proximity interactions (scoped)
    window.orbitalMouse = { x: 0, y: 0, active: false };
    container.addEventListener('mousemove', (e) => {
        const r = container.getBoundingClientRect();
        orbitalMouse.x = e.clientX - r.left;
        orbitalMouse.y = e.clientY - r.top;
        orbitalMouse.active = true;
    });
    container.addEventListener('mouseleave', () => { orbitalMouse.active = false; });
}

// Starfield background initialization
function initStarfield() {
    const canvas = document.getElementById('starfield');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let w, h, dpi;
    function resize() {
        dpi = window.devicePixelRatio || 1;
        w = Math.floor(window.innerWidth);
        h = Math.floor(window.innerHeight);
        canvas.width = Math.floor(w * dpi);
        canvas.height = Math.floor(h * dpi);
        canvas.style.width = w + 'px';
        canvas.style.height = h + 'px';
        ctx.setTransform(dpi, 0, 0, dpi, 0, 0);
    }

    // Denser starfield: more stars on larger screens but bounded for performance
    const numStars = Math.min(900, Math.floor((window.innerWidth * window.innerHeight) / 4000));
    const stars = [];
    for (let i = 0; i < numStars; i++) {
        stars.push({
            x: Math.random() * window.innerWidth,
            y: Math.random() * window.innerHeight,
            z: Math.random(),
            size: Math.random() * 1.6 + 0.2,
            twinkle: Math.random() * Math.PI * 2,
            speed: 0.02 + Math.random() * 0.06,
            // velocities reduced so stars move ~10x slower
            vx: (Math.random() - 0.5) * 0.002,
            vy: (Math.random() - 0.5) * 0.002
        });
    }

    // Mouse interaction state for starfield
    const mouse = { x: 0, y: 0, active: false };
    window.addEventListener('mousemove', (e) => {
        mouse.x = e.clientX;
        mouse.y = e.clientY;
        mouse.active = true;
    });
    window.addEventListener('mouseleave', () => { mouse.active = false; });

    let last = performance.now();

    function render(now) {
        const dt = (now - last) / 1000;
        last = now;
        ctx.clearRect(0, 0, w, h);

        // nebula glows
        const g1 = ctx.createRadialGradient(w * 0.18, h * 0.12, 0, w * 0.18, h * 0.12, Math.max(w, h) * 0.6);
        g1.addColorStop(0, 'rgba(60,80,140,0.06)');
        g1.addColorStop(1, 'rgba(0,0,0,0)');
        ctx.fillStyle = g1;
        ctx.fillRect(0, 0, w, h);

        const g2 = ctx.createRadialGradient(w * 0.82, h * 0.82, 0, w * 0.82, h * 0.82, Math.max(w, h) * 0.6);
        g2.addColorStop(0, 'rgba(120,60,130,0.04)');
        g2.addColorStop(1, 'rgba(0,0,0,0)');
        ctx.fillStyle = g2;
        ctx.fillRect(0, 0, w, h);

        // optional cursor halo
        if (mouse.active) {
            const haloR = Math.min(220, Math.max(w, h) * 0.08);
            const hg = ctx.createRadialGradient(mouse.x, mouse.y, 0, mouse.x, mouse.y, haloR);
            hg.addColorStop(0, 'rgba(0,212,255,0.12)');
            hg.addColorStop(0.35, 'rgba(0,212,255,0.03)');
            hg.addColorStop(1, 'rgba(0,0,0,0)');
            ctx.fillStyle = hg;
            ctx.fillRect(mouse.x - haloR, mouse.y - haloR, haloR * 2, haloR * 2);
        }

        // update and draw stars with lightweight interaction
        for (let i = 0; i < stars.length; i++) {
            const s = stars[i];
            // twinkle base (slower)
            s.twinkle += dt * (0.5 + s.z) * 0.1; // 10x slower twinkle
            let alpha = 0.45 + 0.5 * Math.sin(s.twinkle);

            // gentle drift
            s.x += s.vx * (1 + s.z);
            s.y += s.vy * (1 + s.z);

            // parallax based on mouse position (subtle)
            if (mouse.active) {
                const px = (mouse.x - w / 2) * 0.00025 * (1 + s.z);
                const py = (mouse.y - h / 2) * 0.00025 * (1 + s.z);
                s.x += px * 12 * (0.5 + s.z);
                s.y += py * 12 * (0.5 + s.z);
            }

            // repel effect when cursor is near
            if (mouse.active) {
                const dx = s.x - mouse.x;
                const dy = s.y - mouse.y;
                const d2 = dx * dx + dy * dy;
                const thresh = 150 * (1 + (1 - s.z) * 0.5);
                if (d2 < thresh * thresh && d2 > 0.1) {
                    const d = Math.sqrt(d2);
                    const factor = (thresh - d) / thresh; // 0..1
                    // push away proportionally to factor and depth
                    s.x += (dx / d) * factor * (1.2 + s.z);
                    s.y += (dy / d) * factor * (1.2 + s.z);
                    alpha += 0.6 * factor; // brighten close stars
                }
            }

            // wrap-around
            if (s.x < -6) s.x = w + 6;
            if (s.x > w + 6) s.x = -6;
            if (s.y < -6) s.y = h + 6;
            if (s.y > h + 6) s.y = -6;

            ctx.beginPath();
            const r = s.size * (0.6 + s.z * 1.2);
            // amplify brightness (clamped) while keeping subtle mid glow
            const bright = Math.min(1, 10 * alpha);
            const mid = Math.min(1, 3.5 * alpha);
            const gradient = ctx.createRadialGradient(s.x, s.y, 0, s.x, s.y, r * 3);
            gradient.addColorStop(0, `rgba(255,255,255,${bright})`);
            gradient.addColorStop(0.2, `rgba(200,230,255,${mid})`);
            gradient.addColorStop(1, 'rgba(0,0,0,0)');
            ctx.fillStyle = gradient;
            ctx.fillRect(s.x - r * 3, s.y - r * 3, r * 6, r * 6);
        }

        requestAnimationFrame(render);
    }

    resize();
    window.addEventListener('resize', () => {
        // throttle resize
        clearTimeout(window._starfieldResize);
        window._starfieldResize = setTimeout(resize, 120);
    });

    requestAnimationFrame(render);
}

// Create a simple stylized Earth texture using canvas (blue ocean + green land blobs)
function createEarthTexture(width = 2048, height = 1024) {
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d');

    // Ocean base
    ctx.fillStyle = '#0b3b8c'; // deep ocean
    ctx.fillRect(0, 0, width, height);

    // Helper to draw a continent-like blob
    function land(cx, cy, rw, rh, rot, color) {
        ctx.save();
        ctx.translate(cx, cy);
        ctx.rotate(rot);
        ctx.scale(rw, rh);
        ctx.beginPath();
        // draw an organic shape using multiple arcs
        ctx.moveTo(0, -1);
        for (let t = 0; t <= Math.PI * 2 + 0.1; t += Math.PI / 6) {
            const x = Math.cos(t) + 0.3 * Math.cos(3 * t);
            const y = Math.sin(t) + 0.2 * Math.sin(2 * t);
            ctx.lineTo(x, y);
        }
        ctx.closePath();
        ctx.fillStyle = color || '#2ecc71';
        ctx.fill();
        ctx.restore();
    }

    // Paint several continents at different longitudes/latitudes
    land(width * 0.18, height * 0.4, 220, 120, -0.2, '#2fae4f'); // Africa/SA-ish
    land(width * 0.35, height * 0.28, 300, 160, -0.5, '#2fae4f'); // Eurasia-ish
    land(width * 0.75, height * 0.45, 260, 140, 0.3, '#2fae4f'); // Americas-ish
    land(width * 0.55, height * 0.72, 180, 100, 0.2, '#2fae4f'); // Australia-ish
    land(width * 0.88, height * 0.25, 120, 70, -0.3, '#2fae4f'); // small island

    // Add some shading/highlights
    const grad = ctx.createLinearGradient(0, 0, width, 0);
    grad.addColorStop(0, 'rgba(255,255,255,0.03)');
    grad.addColorStop(1, 'rgba(0,0,0,0.06)');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, width, height);

    return new THREE.CanvasTexture(canvas);
}

// Typewriter effect for hero title
function initTypewriter() {
    const typed = new Typed('#typed-title', {
        strings: [
            'AI Orbital Data Centers',
            'The Future of Computing',
            'Sustainable Space Infrastructure'
        ],
        typeSpeed: 80,
        backSpeed: 40,
        backDelay: 2000,
        loop: true,
        showCursor: true,
        cursorChar: '|'
    });
}

// Scroll animations
function initScrollAnimations() {
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');

                // Trigger specific animations when entering
                if (entry.target.classList.contains('current-datacenters')) {
                    animateDataCenterCards();
                } else if (entry.target.classList.contains('orbital-solution')) {
                    animateOrbitalVisualization();
                }
            } else {
                // remove the visible class when leaving so the section fades out
                entry.target.classList.remove('visible');
            }
        });
    }, observerOptions);

    // Observe all sections
    document.querySelectorAll('.section').forEach(section => {
        observer.observe(section);
    });
}

// 3D Earth initialization
function init3DEarth() {
    const canvas = document.getElementById('heroCanvas');
    if (!canvas) return;

    // Scene setup
    scene = new THREE.Scene();
    camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    renderer = new THREE.WebGLRenderer({ canvas: canvas, alpha: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setClearColor(0x000000, 0);
    // Use sRGB output for more accurate colors with PBR materials
    if (THREE && THREE.Color) renderer.outputEncoding = THREE.sRGBEncoding;

    // Create Earth geometry
    const geometry = new THREE.SphereGeometry(2, 64, 64);

    // Start with a neutral PBR material (MeshStandard) and then load high-resolution textures
    const material = new THREE.MeshStandardMaterial({ color: 0x2233ff, roughness: 0.6, metalness: 0.05, emissive: 0x020408, envMapIntensity: 1.0 });
    earth = new THREE.Mesh(geometry, material);
    scene.add(earth);

    // Attempt to load realistic textures from the local `world` folder. Fall back to canvas texture if missing.
    try{
        const loader = new THREE.TextureLoader();
        const base = './world/';

        // PMREM generator for creating an environment map suitable for PBR
        const pmremGenerator = new THREE.PMREMGenerator(renderer);
        pmremGenerator.compileEquirectangularShader();

        // Diffuse / color (equirectangular) map — also used to create an environment
        loader.load(base + 'world5400x2700.jpg', (tex) => {
            try{
                tex.encoding = THREE.sRGBEncoding;
                // create environment from equirectangular map
                tex.mapping = THREE.EquirectangularReflectionMapping;
                const envMap = pmremGenerator.fromEquirectangular(tex).texture;
                scene.environment = envMap;
                material.envMap = envMap;
                material.map = tex;
                material.needsUpdate = true;
            }catch(err){ console.warn('Failed to create envMap from equirectangular texture', err); }
        });

        // Bump / normal map (improves small-scale shading)
        loader.load(base + 'Bump2.jpg', (bump) => { try{ bump.encoding = THREE.LinearEncoding; material.bumpMap = bump; material.bumpScale = 0.08; material.needsUpdate = true; }catch(e){} });

        // Emissive / city lights (used at night)
        loader.load(base + 'earth_lights.jpg', (lights) => { try{ lights.encoding = THREE.sRGBEncoding; material.emissiveMap = lights; material.emissive = new THREE.Color(0x222233); material.emissiveIntensity = 0.9; material.needsUpdate = true; }catch(e){} });

        // Clouds: create a slightly larger sphere with transparent cloud texture
        loader.load(base + 'cloud_combined_2048.jpg', (cloudTex) => {
            try{
                cloudTex.encoding = THREE.sRGBEncoding;
                const cloudGeo = new THREE.SphereGeometry(2.03, 64, 64);
                const cloudMat = new THREE.MeshLambertMaterial({ map: cloudTex, transparent: true, opacity: 0.9, depthWrite: false });
                earthClouds = new THREE.Mesh(cloudGeo, cloudMat);
                scene.add(earthClouds);
            }catch(e){}
        });

        // Dispose PMREM generator when idle
        setTimeout(()=>{ try{ pmremGenerator.dispose(); }catch(e){} }, 1500);

    }catch(e){
        // If anything fails, fallback to the stylized canvas texture generator
        try{ material.map = createEarthTexture(2048,1024); material.needsUpdate = true; }catch(err){}
    }

    // subtle atmosphere halo to make Earth read better against the starfield
    try {
        const atmosphereGeo = new THREE.SphereGeometry(2.06, 48, 48);
        const atmosphereMat = new THREE.MeshBasicMaterial({ color: 0x7ec8ff, transparent: true, opacity: 0.06, blending: THREE.AdditiveBlending, side: THREE.BackSide });
        const atmosphere = new THREE.Mesh(atmosphereGeo, atmosphereMat);
        scene.add(atmosphere);
    } catch (e) {
        // non-fatal: if atmosphere creation fails, continue without it
    }

    // Add satellites
    createSatellites();

    // Lighting
    const ambientLight = new THREE.AmbientLight(0x404040, 0.4);
    scene.add(ambientLight);
    
    const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
    directionalLight.position.set(5, 3, 5);
    scene.add(directionalLight);

    // Camera position
    camera.position.z = 6;

    // Mouse interaction
    document.addEventListener('mousemove', onMouseMove);
    
    // Animation loop
    animate();
}

// Create orbiting satellites
function createSatellites() {
    // Helper: create glow sprite for subtle bloom around satellites
    function createGlowSprite(size = 64, color = 'rgba(0,212,255,0.9)') {
        const c = document.createElement('canvas');
        const s = size;
        c.width = s;
        c.height = s;
        const ctx = c.getContext('2d');
        const g = ctx.createRadialGradient(s/2, s/2, 0, s/2, s/2, s/2);
        g.addColorStop(0, color);
        g.addColorStop(0.2, color.replace(/,[^,]+\)$/, ',0.35)'));
        g.addColorStop(1, 'rgba(0,0,0,0)');
        ctx.fillStyle = g;
        ctx.fillRect(0,0,s,s);
        const tex = new THREE.CanvasTexture(c);
        const mat = new THREE.SpriteMaterial({ map: tex, color: 0xffffff, transparent: true, blending: THREE.AdditiveBlending });
        return new THREE.Sprite(mat);
    }

    // Helper: construct a stylized futuristic satellite group
    function buildSatellite(scale = 1.0) {
        const group = new THREE.Group();

        // central body - rounded capsule using cylinder + sphere caps
        const bodyMat = new THREE.MeshStandardMaterial({ color: 0x121826, emissive: 0x00374d, metalness: 0.6, roughness: 0.2 });
        const cyl = new THREE.CylinderGeometry(0.06 * scale, 0.06 * scale, 0.2 * scale, 12);
        const body = new THREE.Mesh(cyl, bodyMat);
        body.rotation.z = Math.PI / 2;
        group.add(body);

        // small front plate with emissive window
        const windowMat = new THREE.MeshStandardMaterial({ color: 0x00e6ff, emissive: 0x00e6ff, emissiveIntensity: 0.8, metalness: 0.1, roughness: 0.3 });
        const win = new THREE.BoxGeometry(0.04 * scale, 0.02 * scale, 0.02 * scale);
        const winMesh = new THREE.Mesh(win, windowMat);
        winMesh.position.set(0.12 * scale, 0, 0);
        group.add(winMesh);

        // solar panels (thin boxes) on either side
        const panelMat = new THREE.MeshStandardMaterial({ color: 0x072033, emissive: 0x003344, emissiveIntensity: 0.15, metalness: 0.1, roughness: 0.45 });
        const panelGeo = new THREE.BoxGeometry(0.0015 * scale, 0.12 * scale, 0.06 * scale);
        const leftPanel = new THREE.Mesh(panelGeo, panelMat);
        leftPanel.position.set(-0.02 * scale, 0, 0.12 * scale);
        const rightPanel = leftPanel.clone();
        rightPanel.position.set(-0.02 * scale, 0, -0.12 * scale);
        group.add(leftPanel);
        group.add(rightPanel);

        // small antenna
        const antMat = new THREE.MeshStandardMaterial({ color: 0x99f6ff, emissive: 0x66ffff, emissiveIntensity: 0.5, metalness: 0.4, roughness: 0.3 });
        const antStem = new THREE.CylinderGeometry(0.005 * scale, 0.005 * scale, 0.12 * scale, 6);
        const stem = new THREE.Mesh(antStem, antMat);
        stem.position.set(-0.12 * scale, 0, 0);
        stem.rotation.z = Math.PI / 2;
        group.add(stem);
        const antDish = new THREE.SphereGeometry(0.02 * scale, 8, 8);
        const dish = new THREE.Mesh(antDish, antMat);
        dish.position.set(-0.18 * scale, 0, 0);
        group.add(dish);

        // subtle glow sprite behind the satellite
        const glow = createGlowSprite(80 * Math.max(0.6, scale), 'rgba(0,212,255,0.55)');
        glow.scale.set(0.6 * scale, 0.6 * scale, 1);
        glow.position.set(0, 0, 0);
        group.add(glow);

        return group;
    }

    // Create multiple satellites at different orbits
    for (let i = 0; i < 8; i++) {
        const satellite = buildSatellite(1.0);

        // Different orbital radii
        const radius = 3 + (i % 3) * 0.8;
        const angle = (i / 8) * Math.PI * 2;
        const height = Math.sin(i) * 0.5;

        satellite.position.x = Math.cos(angle) * radius;
        satellite.position.z = Math.sin(angle) * radius;
        satellite.position.y = height;

        // use baseSpeed/currentSpeed so the animate() proximity logic works
        const baseSpeed = 0.0015 + (i % 3) * 0.0009; // intentionally slow baseline
        satellite.userData = {
            radius: radius,
            angle: angle,
            baseSpeed: baseSpeed,
            currentSpeed: baseSpeed,
            originalY: height
        };

        satellites.push(satellite);
        scene.add(satellite);
    }
}

// Mouse movement handler
function onMouseMove(event) {
    mouseX = (event.clientX / window.innerWidth) * 2 - 1;
    mouseY = -(event.clientY / window.innerHeight) * 2 + 1;
}

// Animation loop
function animate() {
    requestAnimationFrame(animate);

    if (earth) {
        // Rotate Earth
        earth.rotation.y += 0.005;
        // Rotate cloud layer if present (slightly faster than the planet)
        if (earthClouds) earthClouds.rotation.y += 0.0065;
        
        // Mouse interaction
        earth.rotation.x = mouseY * 0.1;
        earth.rotation.z = mouseX * 0.1;
        
        // Animate satellites
        satellites.forEach((satellite, index) => {
            // proximity-based speed modulation (hero scene)
            let target = satellite.userData.baseSpeed;
            // compute mouse position in screen pixels
            const mx = (mouseX + 1) / 2 * window.innerWidth;
            const my = (1 - mouseY) / 2 * window.innerHeight;
            // project satellite to screen
            satellite.getWorldPosition(_satProj);
            _satProj.project(camera);
            const sx = (_satProj.x + 1) / 2 * window.innerWidth;
            const sy = (1 - _satProj.y) / 2 * window.innerHeight;
            const dx = sx - mx;
            const dy = sy - my;
            const d = Math.sqrt(dx*dx + dy*dy);
            const thresh = 160;
            if (d < thresh) {
                const factor = (thresh - d) / thresh; // 0..1
                target = satellite.userData.baseSpeed * (1 + factor * 6); // up to ~7x
            }
            // smooth toward target
            satellite.userData.currentSpeed += (target - satellite.userData.currentSpeed) * 0.12;

            satellite.userData.angle += satellite.userData.currentSpeed;
            satellite.position.x = Math.cos(satellite.userData.angle) * satellite.userData.radius;
            satellite.position.z = Math.sin(satellite.userData.angle) * satellite.userData.radius;
            satellite.position.y = satellite.userData.originalY + Math.sin(Date.now() * 0.001 + index) * 0.2;

            // small rotation to make them feel alive
            satellite.rotation.y += 0.05;
        });
        
        // Camera movement based on mouse
        camera.position.x = mouseX * 0.5;
        camera.position.y = mouseY * 0.5;
        camera.lookAt(scene.position);
    }

    renderer.render(scene, camera);
}

// Initialize charts
function initCharts() {
    // Cost Structure Chart removed per user request

    // Benefits Comparison Chart
    const benefitsCtx = document.getElementById('benefitsChart');
    if (benefitsCtx) {
        // units per metric (used for tooltip formatting)
        const benefitUnits = ['%', '%', '%', ' ms'];
        new Chart(benefitsCtx, {
            type: 'bar',
            data: {
                labels: ['Water Usage (%)', 'Carbon Emissions (%)', 'Energy Cost (%)', 'Latency (ms)'],
                datasets: [{
                    label: 'Terrestrial Data Centers',
                    data: [100, 100, 100, 100],
                    backgroundColor: 'rgba(255, 107, 53, 0.8)',
                    borderColor: '#ff6b35',
                    borderWidth: 1
                }, {
                    label: 'Orbital Data Centers',
                    data: [0, 10, 20, 30],
                    backgroundColor: 'rgba(0, 212, 255, 0.8)',
                    borderColor: '#00d4ff',
                    borderWidth: 1
                }]
            },
            options: {
                responsive: true,
                scales: {
                    y: {
                        beginAtZero: true,
                        title: { display: true, text: 'Normalized (index / %)', color: '#ffffff' },
                        grid: {
                            color: 'rgba(255, 255, 255, 0.1)'
                        },
                        ticks: {
                            color: '#ffffff'
                        }
                    },
                    x: {
                        grid: {
                            color: 'rgba(255, 255, 255, 0.1)'
                        },
                        ticks: {
                            color: '#ffffff'
                        }
                    }
                },
                plugins: {
                    legend: {
                        labels: {
                            color: '#ffffff'
                        }
                    },
                    tooltip: {
                        backgroundColor: 'rgba(0, 20, 84, 0.9)',
                        titleColor: '#ffffff',
                        bodyColor: '#ffffff',
                        borderColor: '#00d4ff',
                        borderWidth: 1,
                        callbacks: {
                            label: function(context) {
                                const idx = context.dataIndex;
                                const unit = benefitUnits[idx] || '';
                                const value = context.raw;
                                return context.dataset.label + ': ' + value + unit;
                            }
                        }
                    }
                }
            }
        });
    }
}

// Temperature Stability & Cooling Performance chart
function initTemperatureChart(){
    try{
        const el = document.getElementById('tempChart');
        if (!el || typeof Chart === 'undefined') return;

        // If the canvas has no layout size yet (e.g. created while offscreen or before CSS applied), wait until it's measurable.
        function whenSized(cb){
            const rect = el.getBoundingClientRect();
            if (rect.width > 8 && rect.height > 8) return cb();
            // use ResizeObserver when available
            if (window.ResizeObserver){
                const ro = new ResizeObserver(() => {
                    const r2 = el.getBoundingClientRect();
                    if (r2.width > 8 && r2.height > 8){ ro.disconnect(); cb(); }
                });
                ro.observe(el);
                // also fallback to load event
                window.addEventListener('load', function onl(){ window.removeEventListener('load', onl); setTimeout(()=>{ try{ ro.disconnect(); }catch(e){} }, 100); });
            } else {
                window.addEventListener('load', function onl(){ window.removeEventListener('load', onl); setTimeout(cb, 80); });
                // final timeout to avoid never initializing
                setTimeout(cb, 1200);
            }
        }

        const labels = [
            'Radiator Eff (W/m²)',
            'Daily Temp Fluct (°C)',
            'Annual Temp Var (°C)'
        ];

    const datasets = [
            // Order: [Radiator Eff, Daily Temp Fluct, Annual Temp Var]
            // Updated per user: Radiator Eff -> terrestrial 100, orbital 1300, moon no bar (null)
            // Daily Temp Fluct -> terrestrial 5, orbital 0.001, moon 150
            // Annual Temp Var -> terrestrial 12, orbital 0.024, moon 0.1
            { label: 'Terrestrial', data: [100, 5, 12], backgroundColor: '#0B7A75' },
            // Ensure orbital radiator efficiency is the full 1300 W/m² (not 13)
            { label: 'Orbital', data: [1300, 0.001, 0.024], backgroundColor: '#18C2D5' },
            // use null for the missing radiator-eff bar for Moon so Chart.js leaves that slot empty
            { label: 'Moon', data: [null, 150, 0.1], backgroundColor: '#2E7D32' }
        ];

    // only show these explicit tick marks per user request
    // include 2000 so orbital radiator-eff values (e.g. 1300) are within the axis domain
    // include 1000 and larger marks; add 3000 so very large bars are comfortably visible
    const tickValues = [0.001, 0.01, 0.1, 1, 10, 100, 1000, 2000, 3000];

        function formatNumber(n){
            const num = Number(n);
            if (!isFinite(num)) return String(n);
            // avoid scientific notation: use fixed then trim
            // choose decimal places: up to 6 for small values, 0 for ints
            const abs = Math.abs(num);
            let decimals = 0;
            if (abs > 0 && abs < 0.01) decimals = 6;
            else if (abs < 0.1) decimals = 5;
            else if (abs < 1) decimals = 4;
            else if (abs < 10) decimals = 3;
            else if (abs < 100) decimals = 2;
            else if (abs < 1000) decimals = 1;
            else decimals = 0;
            let s = num.toFixed(decimals);
            // strip trailing zeros and optional dot
            s = s.replace(/\.?(0+)$/,'');
            s = s.replace(/\.$/, '');
            return s;
        }

        // plugin: draw numeric labels at the end of each horizontal bar
                const dataLabelPlugin = {
            id: 'tempDataLabels',
            afterDatasetsDraw(chart){
                const ctx = chart.ctx;
                ctx.save();
                ctx.font = '12px Inter, Arial, sans-serif';
                ctx.fillStyle = '#ffffff';
                ctx.textBaseline = 'middle';

                chart.data.datasets.forEach((dataset, dsIndex) => {
                    const meta = chart.getDatasetMeta(dsIndex);
                    meta.data.forEach((bar, i) => {
                        // bar.x is the pixel location of the bar end for horizontal bars
                        try{
                                    const val = dataset.data[i];
                                    if (val === null || val === undefined) return; // skip missing values
                            const x = bar.x || (bar.getProps && bar.getProps(['x']).x) || 0;
                            const y = bar.y || (bar.getProps && bar.getProps(['y']).y) || 0;
                            const label = formatNumber(val);
                            const padding = 8;
                            // draw label to the right of the bar with a small padding
                            ctx.textAlign = 'left';
                            ctx.fillText(label, x + padding, y);
                        }catch(e){}
                    });
                });

                ctx.restore();
            }
        };

        // plugin: draw major gridlines at the provided tickValues (subtle); disable Chart.js x-grid
        const majorGridPlugin = {
            id: 'majorLogGrid',
            beforeDraw(chart){
                const xScale = chart.scales['x'];
                if (!xScale) return;
                const ctx = chart.ctx;
                ctx.save();
                // draw white vertical gridlines for strong contrast against the dark card
                ctx.strokeStyle = 'rgba(255,255,255,0.18)';
                ctx.lineWidth = 1.25;
                tickValues.forEach(v => {
                    // only draw if within scale domain
                    if (v < xScale.min || v > xScale.max) return;
                    const px = xScale.getPixelForValue(v);
                    ctx.beginPath();
                    ctx.moveTo(px, chart.chartArea.top);
                    ctx.lineTo(px, chart.chartArea.bottom);
                    ctx.stroke();
                });
                ctx.restore();
            }
        };

        function createChart(){
            try{
                console.debug('[tempChart] createChart: canvas rect before sizing', el.getBoundingClientRect());
                // ensure canvas is visible and has a usable height; some layouts collapse height when using height:auto
                el.style.display = el.style.display || 'block';
                if (!el.style.width) el.style.width = '100%';
                const crect = el.getBoundingClientRect();
                if (crect.height < 40) {
                    // force a reasonable pixel height so Chart.js doesn't render into a collapsed canvas
                    el.style.height = '540px';
                }
                const ctx = el.getContext('2d');
                // Normalize dataset values to numbers (preserve nulls) to avoid accidental string/scale bugs
                const normalizedDatasets = datasets.map(d => ({
                    label: d.label,
                    backgroundColor: d.backgroundColor,
                    data: (d.data || []).map(v => (v === null || v === undefined) ? null : Number(v))
                }));
                console.debug('[tempChart] normalizedDatasets', normalizedDatasets);
                console.debug('[tempChart] tickValues', tickValues, 'xMax', 3000);
                // clear previous chart if exists
                try{ const prev = Chart.getChart ? Chart.getChart(el) : null; if (prev) { console.debug('[tempChart] destroying previous chart instance'); prev.destroy(); } } catch(e){ console.warn('[tempChart] error destroying prev chart', e); }

                const chart = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: labels,
                datasets: normalizedDatasets.map(d => ({
                    label: d.label,
                    data: d.data,
                    backgroundColor: d.backgroundColor,
                    hoverBackgroundColor: (function(col){
                        // convert hex to rgba with opacity 0.95
                        const r = parseInt(col.substr(1,2),16);
                        const g = parseInt(col.substr(3,2),16);
                        const b = parseInt(col.substr(5,2),16);
                        return `rgba(${r},${g},${b},0.95)`;
                    })(d.backgroundColor),
                    borderRadius: 4,
                    barThickness: 22
                }))
            },
            options: {
                indexAxis: 'y',
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: { position: 'top', align: 'start', labels: { color: '#ffffff' } },
                    tooltip: {
                        mode: 'nearest',
                        intersect: true,
                        callbacks: {
                            label: function(ctx){
                                const v = ctx.raw;
                                const cat = ctx.chart.data.labels[ctx.dataIndex] || '';
                                const m = cat.match(/\(([^)]+)\)/);
                                const unit = m ? (' ' + m[1]) : '';
                                if (v === null || v === undefined) return ctx.dataset.label + ': —';
                                return ctx.dataset.label + ': ' + formatNumber(v) + unit;
                            }
                        },
                        backgroundColor: 'rgba(0,20,84,0.9)',
                        titleColor: '#fff',
                        bodyColor: '#fff'
                    }
                },
                scales: {
                        x: {
                        type: 'logarithmic',
                        position: 'bottom',
                        min: 0.001,
                        // expand max to 3000 so orbital radiator-eff (1300 W/m²) is comfortably visible
                        max: 3000,
                        ticks: {
                            // only show labels at the exact tickValues we defined above (tolerant compare)
                            // format large values (>=1000) as 'k' style (divided by 1000) per user's request
                            callback: function(val){
                                const n = Number(val);
                                const match = tickValues.some(tv => Math.abs(tv - n) < 1e-12);
                                if (!match) return '';
                                // show the full numeric value for ticks (e.g., 1000 -> "1000")
                                return formatNumber(n);
                            },
                            autoSkip: false,
                            maxTicksLimit: tickValues.length,
                            color: '#ffffff'
                        },
                        grid: { display: false }
                    },
                    y: {
                        grid: { display: false },
                        ticks: { color: '#ffffff' }
                    }
                },
                datasets: { bar: { categoryPercentage: 0.7, barPercentage: 0.85 } }
            },
            plugins: [dataLabelPlugin, majorGridPlugin]
        });

            // expose for debugging
            window._tempStabilityChart = chart;
            }catch(err){ console.error('[tempChart] createChart error', err); }
        }

        // Ensure chart is created only once sizes are available
        whenSized(createChart);
    }catch(e){ console.warn('initTemperatureChart failed', e); }
}

// Interactive elements
function initInteractiveElements() {
    // Data center cards hover effects
    const datacenterCards = document.querySelectorAll('.datacenter-card');
    datacenterCards.forEach(card => {
        card.addEventListener('mouseenter', function() {
            const type = this.dataset.type;
            showDetailedInfo(type);
        });
        
        // On leave, schedule hide after a short delay; cancel if user moves into the popup
        card.addEventListener('mouseleave', function() {
            scheduleHide();
        });
        // If user re-enters the card, cancel pending hide
        card.addEventListener('mouseenter', function() {
            cancelHide();
        });
    });

    // Satellite markers
    const satelliteMarkers = document.querySelectorAll('.satellite-marker');
    satelliteMarkers.forEach(marker => {
        marker.addEventListener('click', function() {
            const orbit = this.dataset.orbit;
            showOrbitInfo(orbit);
        });
    });

    // Tech cards
    const techCards = document.querySelectorAll('.tech-card');
    techCards.forEach(card => {
        card.addEventListener('mouseenter', function() {
            this.style.transform = 'translateY(-10px) scale(1.02)';
        });
        
        card.addEventListener('mouseleave', function() {
            this.style.transform = 'translateY(0) scale(1)';
        });
    });
}

// Animate the prominent financial totals with a count-up while keeping a stable copy value
function animateFinancialTotals(){
    const els = Array.from(document.querySelectorAll('.financial-totals .amount'));
    if (!els.length) return;
    // Respect reduced motion
    if (window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches){
        els.forEach(el => el.classList.remove('pulsing'));
        return;
    }

    els.forEach(el => el.classList.add('pulsing'));

    const duration = 900; // ms
    const start = performance.now();

    // parse a numeric target from data-copy or textContent (strip $ and commas)
    const targets = els.map(el => {
        const stable = el.getAttribute('data-copy') || el.dataset.copy || el.textContent.trim();
        // remove anything except digits, dot, minus
        const num = Number((stable || '').replace(/[^0-9.\-]/g,''));
        return isFinite(num) ? num : 0;
    });

    function fmt(n){
        // format with thousands separators and two decimals when needed
        const abs = Math.abs(n);
        if (Math.round(n) === n) return '$' + n.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
        return '$' + n.toLocaleString(undefined, {minimumFractionDigits:2, maximumFractionDigits:2});
    }

    function step(now){
        const t = Math.min(1, (now - start) / duration);
        // easeOutCubic
        const ease = 1 - Math.pow(1 - t, 3);
        els.forEach((el, i) => {
            const val = Math.round(targets[i] * ease * 100) / 100;
            el.textContent = fmt(val);
            // keep stable copy attribute at final target
            try { el.dataset.copy = fmt(targets[i]); } catch(e){}
        });
        if (t < 1) requestAnimationFrame(step);
        else {
            // ensure final values set exactly
            els.forEach((el, i) => { el.textContent = fmt(targets[i]); try { el.dataset.copy = fmt(targets[i]); } catch(e){} });
        }
    }

    requestAnimationFrame(step);
}

// Show detailed information for data center cards
function showDetailedInfo(type) {
    let info = '';

    switch(type) {
        case 'water':
            info = `
                <div class="info-badge">Water</div>
                <h4>Water Usage Crisis</h4>
                <ul>
                    <li>163.7 billion gallons/year (US data centers)</li>
                    <li>450,000 gallons/day per Google site</li>
                    <li>16-33 billion gallons projected by 2028</li>
                    <li>84% consumed by hyperscale facilities</li>
                </ul>
            `;
            break;
        case 'energy':
            info = `
                <div class="info-badge">Energy</div>
                <h4>Energy Consumption</h4>
                <ul>
                    <li>183 TWh in 2024 (4% of US total)</li>
                    <li>Projected 426 TWh by 2030</li>
                    <li>60% for IT equipment, 40% for cooling</li>
                    <li>Equivalent to Pakistan's annual consumption</li>
                </ul>
            `;
            break;
        case 'carbon':
            info = `
                <div class="info-badge">Carbon</div>
                <h4>Carbon Impact</h4>
                <ul>
                    <li>105 million metric tons CO2 in 2024</li>
                    <li>300% increase from 2018</li>
                    <li>548 gCO2e/kWh carbon intensity</li>
                    <li>2% of total US emissions</li>
                </ul>
            `;
            break;
    }

    // Create or update info popup
    let popup = document.querySelector('.info-popup-container');
    if (!popup) {
        popup = document.createElement('div');
        popup.className = 'info-popup-container';
        popup.innerHTML = `
            <div class="info-popup" role="dialog" aria-modal="true">
                <button class="info-close">✕</button>
                <div class="info-popup-inner">${info}</div>
            </div>
        `;
        document.body.appendChild(popup);

        // small delay to trigger CSS animation
        requestAnimationFrame(() => {
            const content = popup.querySelector('.info-popup');
            if (content) content.classList.add('show');
        });

        // close handlers
        popup.querySelector('.info-close').addEventListener('click', hideDetailedInfo);
        popup.addEventListener('click', (e) => {
            if (e.target === popup) hideDetailedInfo();
        });

        // when pointer enters the popup, cancel scheduled hide; when leaves, schedule hide
        popup.addEventListener('mouseenter', cancelHide);
        popup.addEventListener('mouseleave', scheduleHide);
    } else {
        const inner = popup.querySelector('.info-popup-inner');
        if (inner) inner.innerHTML = info;
        const content = popup.querySelector('.info-popup');
        if (content) {
            content.classList.remove('hide');
            requestAnimationFrame(() => content.classList.add('show'));
        }
    }
}

function hideDetailedInfo() {
    const popup = document.querySelector('.info-popup-container');
    if (!popup) return;
    const content = popup.querySelector('.info-popup');
    if (content) {
        content.classList.remove('show');
        content.classList.add('hide');
        setTimeout(() => { if (popup.parentNode) popup.parentNode.removeChild(popup); }, 300);
    } else {
        if (popup.parentNode) popup.parentNode.removeChild(popup);
    }
}

// Schedule/cancel hide helpers so popup doesn't disappear when moving pointer from card -> popup
function scheduleHide(delay = 220) {
    cancelHide();
    window._popupHideTimer = setTimeout(() => {
        hideDetailedInfo();
    }, delay);
}

function cancelHide() {
    if (window._popupHideTimer) {
        clearTimeout(window._popupHideTimer);
        window._popupHideTimer = null;
    }
}

// Show orbit information
function showOrbitInfo(orbit) {
    const orbitData = {
        leo: {
            name: 'Low Earth Orbit (LEO)',
            altitude: '160-2,000 km',
            latency: '25-40ms',
            period: '90-120 minutes',
            benefits: 'Low latency, high resolution, cost-effective'
        },
        meo: {
            name: 'Medium Earth Orbit (MEO)',
            altitude: '2,000-35,786 km',
            latency: '50-150ms',
            period: '2-12 hours',
            benefits: 'Balanced coverage, navigation systems'
        },
        geo: {
            name: 'Geostationary Orbit (GEO)',
            altitude: '35,786 km',
            latency: '250ms',
            period: '24 hours',
            benefits: 'Fixed position, wide coverage'
        }
    };
    
    const data = orbitData[orbit];
    if (!data) return;
    
    const info = `
        <div class="orbit-info">
            <h3>${data.name}</h3>
            <div class="orbit-details">
                <p><strong>Altitude:</strong> ${data.altitude}</p>
                <p><strong>Latency:</strong> ${data.latency}</p>
                <p><strong>Orbital Period:</strong> ${data.period}</p>
                <p><strong>Key Benefits:</strong> ${data.benefits}</p>
            </div>
        </div>
    `;
    
    // Show in a modal or tooltip
    showModal(info);
}

function showModal(content) {
    const modal = document.createElement('div');
    modal.className = 'orbit-modal';
    modal.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0, 0, 0, 0.8);
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 1000;
    `;
    
    const modalContent = document.createElement('div');
    modalContent.style.cssText = `
        background: rgba(0, 20, 84, 0.95);
        border: 2px solid #00d4ff;
        border-radius: 16px;
        padding: 40px;
        max-width: 500px;
        color: white;
        backdrop-filter: blur(10px);
    `;
    
    modalContent.innerHTML = content + '<button onclick="this.closest(\'.orbit-modal\').remove()" style="margin-top: 20px; padding: 10px 20px; background: #00d4ff; color: white; border: none; border-radius: 8px; cursor: pointer;">Close</button>';
    
    modal.appendChild(modalContent);
    document.body.appendChild(modal);
    
    // Close on background click
    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            modal.remove();
        }
    });
}

// Animate data center cards
function animateDataCenterCards() {
    const cards = document.querySelectorAll('.datacenter-card');
    cards.forEach((card, index) => {
        setTimeout(() => {
            card.style.opacity = '0';
            card.style.transform = 'translateY(50px)';
            card.style.transition = 'all 0.6s ease';
            
            setTimeout(() => {
                card.style.opacity = '1';
                card.style.transform = 'translateY(0)';
            }, 100);
        }, index * 200);
    });
}

// Animate orbital visualization
function animateOrbitalVisualization() {
    const orbits = document.querySelectorAll('.orbit');
    const satellites = document.querySelectorAll('.satellite-marker');
    
    orbits.forEach((orbit, index) => {
        setTimeout(() => {
            orbit.style.opacity = '0';
            orbit.style.transform = 'translate(-50%, -50%) scale(0)';
            orbit.style.transition = 'all 0.8s ease';
            
            setTimeout(() => {
                orbit.style.opacity = '1';
                orbit.style.transform = 'translate(-50%, -50%) scale(1)';
            }, 100);
        }, index * 300);
    });
    
    satellites.forEach((satellite, index) => {
        setTimeout(() => {
            satellite.style.opacity = '0';
            satellite.style.transform = 'scale(0)';
            satellite.style.transition = 'all 0.5s ease';
            
            setTimeout(() => {
                satellite.style.opacity = '1';
                satellite.style.transform = 'scale(1)';
            }, 100);
        }, index * 100);
    });
}

// Smooth scrolling for navigation
function initSmoothScrolling() {
    const navLinks = document.querySelectorAll('.nav-links a');
    
    navLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            
            const targetId = this.getAttribute('href');
            const targetElement = document.querySelector(targetId);
            
            if (targetElement) {
                const offsetTop = targetElement.offsetTop - 80; // Account for fixed nav
                
                window.scrollTo({
                    top: offsetTop,
                    behavior: 'smooth'
                });
            }
        });
    });
}

// Window resize handler
window.addEventListener('resize', function() {
    if (camera && renderer) {
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(window.innerWidth, window.innerHeight);
    }
});

// Add CSS for info popups
const additionalStyles = `
    .info-popup h4 {
        color: #00d4ff;
        margin-bottom: 15px;
        font-size: 20px;
    }
    
    .info-popup ul {
        list-style: none;
        padding: 0;
    }
    
    .info-popup li {
        margin-bottom: 10px;
        padding-left: 20px;
        position: relative;
    }
    
    .info-popup li:before {
        content: '▶';
        position: absolute;
        left: 0;
        color: #00ff88;
    }
    
    .orbit-info h3 {
        color: #00d4ff;
        margin-bottom: 20px;
        font-size: 24px;
    }
    
    .orbit-details p {
        margin-bottom: 10px;
        line-height: 1.6;
    }
    
    .orbit-details strong {
        color: #00ff88;
    }
    /* Financial table alignment and highlighted totals */
    .financial-costs .legend { text-align: center; }
    .financial-costs table th,
    .financial-costs table td {
        text-align: center;
        padding: 8px 10px;
        white-space: nowrap;
    }
    .financial-summary { display:flex; gap:18px; justify-content:space-between; align-items:center; }
    .financial-summary .left,
    .financial-summary .center,
    .financial-summary .right { text-align:center; }
    .financial-totals { display:flex; gap:28px; justify-content:center; margin-top:12px; align-items:baseline; }
    .financial-totals .label { font-size:15px; font-weight:800; color: #ffd166; letter-spacing:0.2px; }
    .financial-totals .amount { font-size:36px; font-weight:900; color: #ffd166; }
    /* subtle pulse animation for the amounts */
    @keyframes totalsPulse {
        0% { transform: translateY(0) scale(1); filter: drop-shadow(0 6px 12px rgba(0,0,0,0.45)); }
        50% { transform: translateY(-6px) scale(1.02); filter: drop-shadow(0 12px 20px rgba(0,0,0,0.55)); }
        100% { transform: translateY(0) scale(1); filter: drop-shadow(0 6px 12px rgba(0,0,0,0.45)); }
    }
    .financial-totals .amount.pulsing { animation: totalsPulse 2200ms ease-in-out infinite; }
    /* Ensure numeric table cells get a pointer cursor to indicate interactivity */
    .financial-costs td.numeric, .financial-summary .value, .financial-totals .amount { cursor: pointer; }
    /* Falling datacenters overlay in AI Integration */
    #falling-datacenters {
        pointer-events: none;
        position: absolute;
        inset: 0;
        width: 100%;
        height: 100%;
        z-index: 2; /* above canvas */
        overflow: visible;
    }
    .datacenter-fall {
        position: absolute;
        width: 60px;
        height: 60px;
        background: linear-gradient(135deg, #00d4ff 70%, #0a0a0a 100%);
        box-shadow: 0 8px 24px rgba(0,212,255,0.18);
        border-radius: 14px;
        opacity: 0.88;
        display: flex;
        align-items: center;
        justify-content: center;
        font-weight: 800;
        color: #fff;
        font-size: 15px;
        border: 2px solid #00ff88;
        animation: fall-datacenter 1.8s linear forwards;
        will-change: transform, opacity;
        /* Enforce a 1:1 aspect ratio so elements render as squares even if CSS/transform quirks occur */
        aspect-ratio: 1 / 1;
        box-sizing: border-box;
    }
    @keyframes fall-datacenter {
        0% {
            transform: translateY(-40px) scale(0.85) rotate(-12deg);
            opacity: 0;
        }
        12% {
            opacity: 1;
        }
        100% {
            transform: translateY(110vh) scale(1.12) rotate(8deg);
            opacity: 0.37;
        }
    }
`;

// Inject additional styles
const styleSheet = document.createElement('style');
styleSheet.textContent = additionalStyles;
document.head.appendChild(styleSheet);

// Benefit spheres: small contextual popups on hover / focus / click
(function(){
    const spheres = Array.from(document.querySelectorAll('.benefit-sphere'));
    if (!spheres.length) return;

    let activePopup = null;
    let hideTimer = null;

    function createPopup(title, html) {
        const wrap = document.createElement('div');
        wrap.className = 'benefit-popup';
        wrap.setAttribute('role','dialog');
        wrap.setAttribute('aria-live','polite');
        wrap.style.position = 'absolute';
        wrap.style.zIndex = 2300;
        wrap.style.pointerEvents = 'auto';
        wrap.style.transition = 'transform 220ms cubic-bezier(.2,.9,.2,1), opacity 180ms ease';
        wrap.style.transformOrigin = 'center bottom';
        wrap.style.opacity = '0';
        wrap.innerHTML = `
            <div style="background: linear-gradient(180deg, rgba(2,10,30,0.96), rgba(8,16,40,0.98)); border:1px solid rgba(0,212,255,0.12); padding:14px 16px; border-radius:12px; box-shadow:0 14px 40px rgba(2,12,30,0.6); max-width:360px; color:#eaf4ff;">
                <strong style="display:block;color:#9fdcff;margin-bottom:6px;font-size:15px;">${title}</strong>
                <div style="font-size:14px;line-height:1.45;color:rgba(234,244,255,0.95);">${html}</div>
            </div>
        `;
        // close on pointerdown outside
        wrap.addEventListener('pointerdown', (e)=>{ e.stopPropagation(); });
        return wrap;
    }

    function showPopupForSphere(sphere, immediate) {
        hidePopup();
        const h = sphere.querySelector('h4');
        const p = sphere.querySelector('p');
        if (!h || !p) return;
        const title = h.textContent.trim();
        const html = p.innerHTML.trim();

        const popup = createPopup(title, html);
        document.body.appendChild(popup);
        activePopup = popup;

        // position it above the sphere (or to the side if near top of viewport)
        const r = sphere.getBoundingClientRect();
        const pw = Math.min(360, Math.max(220, Math.floor(window.innerWidth * 0.28)));
        const ph = popup.offsetHeight || 120;
        let left = r.left + (r.width / 2) - (pw / 2);
        left = Math.max(8, Math.min(window.innerWidth - pw - 8, left));
        let top = r.top - ph - 14; // above
        if (top < 12) top = r.bottom + 12; // place below if not enough space above

        popup.style.width = pw + 'px';
        popup.style.left = left + 'px';
        popup.style.top = top + 'px';

        // small entrance animation
        requestAnimationFrame(()=>{
            popup.style.opacity = '1';
            popup.style.transform = 'translateY(0) scale(1)';
        });

        // when pointer enters the popup, cancel hide; when leaves, schedule hide
        popup.addEventListener('mouseenter', cancelHide);
        popup.addEventListener('mouseleave', scheduleHide);

        // close when clicking elsewhere
        setTimeout(()=>{
            window.addEventListener('pointerdown', onOutsidePointer);
        }, 20);
    }

    function hidePopup() {
        if (!activePopup) return;
        try {
            activePopup.style.opacity = '0';
            activePopup.style.transform = 'translateY(6px) scale(0.98)';
        } catch(e){}
        const rem = activePopup;
        activePopup = null;
        window.removeEventListener('pointerdown', onOutsidePointer);
        setTimeout(()=>{ if (rem && rem.parentNode) rem.parentNode.removeChild(rem); }, 240);
    }

    function scheduleHide(delay = 220) { cancelHide(); hideTimer = setTimeout(hidePopup, delay); }
    function cancelHide() { if (hideTimer) { clearTimeout(hideTimer); hideTimer = null; } }

    function onOutsidePointer(e) {
        if (!activePopup) return;
        if (e.target.closest('.benefit-popup')) return;
        if (e.target.closest('.benefit-sphere')) return;
        hidePopup();
    }

    // attach listeners
    spheres.forEach(s => {
        s.addEventListener('mouseenter', () => { cancelHide(); showPopupForSphere(s); });
        s.addEventListener('mouseleave', () => { scheduleHide(); });
        s.addEventListener('focus', () => { cancelHide(); showPopupForSphere(s); });
        s.addEventListener('blur', () => { scheduleHide(); });
        // touch / click to toggle (useful for mobile)
        s.addEventListener('click', (e) => {
            e.preventDefault(); e.stopPropagation();
            // if this is the Low Latency sphere, open the detailed Earth modal
            try {
                const title = (s.querySelector('h4') || {}).textContent || '';
                if (/low latency/i.test(title)) {
                    // hide any small popup and open the large interactive Earth modal
                    hidePopup();
                    openEarthModal();
                    return;
                }
            } catch (err) { /* ignore */ }

            if (activePopup) hidePopup(); else showPopupForSphere(s);
        });
    });
})();

// Small 3D models for AI Integration boxes (minimal, performant, respects prefers-reduced-motion)
function initAIBoxModels() {
    try {
        if (window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
            // render a single frame for each canvas (no animation)
            ['ai-box-routing','ai-box-distributed','ai-box-fault'].forEach(id => {
                const canvas = document.getElementById(id);
                if (!canvas) return;
                try {
                    const scene = new THREE.Scene();
                    const cam = new THREE.PerspectiveCamera(45, canvas.clientWidth / Math.max(120, canvas.clientHeight), 0.1, 1000);
                    cam.position.set(0, 0.6, 2.6);
                    const renderer = new THREE.WebGLRenderer({ canvas: canvas, alpha: true, antialias: true });
                    renderer.setPixelRatio(window.devicePixelRatio || 1);
                    renderer.setSize(canvas.clientWidth, canvas.clientHeight, false);
                    scene.add(new THREE.AmbientLight(0xffffff, 0.6));
                    const dir = new THREE.DirectionalLight(0xffffff, 0.8); dir.position.set(5,3,5); scene.add(dir);
                    // simple placeholder geometry depending on id
                    let mesh;
                    if (id === 'ai-box-routing') {
                        mesh = new THREE.Mesh(new THREE.TorusGeometry(0.45, 0.08, 16, 64), new THREE.MeshStandardMaterial({ color: 0x00d4ff, metalness: 0.2, roughness: 0.35 }));
                        mesh.rotation.x = Math.PI * 0.5;
                    } else if (id === 'ai-box-distributed') {
                        mesh = new THREE.Group();
                        const nmat = new THREE.MeshStandardMaterial({ color: 0x00ff88, metalness:0.2, roughness:0.4 });
                        const nodes = [new THREE.Mesh(new THREE.SphereGeometry(0.12, 12, 12), nmat), new THREE.Mesh(new THREE.SphereGeometry(0.10, 12, 12), nmat), new THREE.Mesh(new THREE.SphereGeometry(0.09, 12, 12), nmat)];
                        nodes[0].position.set(-0.36, 0, 0); nodes[1].position.set(0.18, 0.18, 0); nodes[2].position.set(0.18, -0.18, 0);
                        mesh.add(...nodes);
                        const lineGeo = new THREE.BufferGeometry().setFromPoints([nodes[0].position, nodes[1].position, nodes[2].position]);
                        mesh.add(new THREE.Line(lineGeo, new THREE.LineBasicMaterial({ color: 0x88ffd8, linewidth: 1 })));
                    } else {
                        // fault recognition: box + small rotating torus to imply repair
                        const g = new THREE.Group();
                        const box = new THREE.Mesh(new THREE.BoxGeometry(0.42,0.28,0.18), new THREE.MeshStandardMaterial({ color: 0xff6b35, metalness:0.3, roughness:0.35 }));
                        const tor = new THREE.Mesh(new THREE.TorusGeometry(0.18, 0.04, 10, 40), new THREE.MeshStandardMaterial({ color:0xffd8b6, metalness:0.1, roughness:0.45 }));
                        tor.rotation.x = Math.PI/2; tor.position.set(0, 0.02, 0.1);
                        g.add(box); g.add(tor); mesh = g;
                    }
                    scene.add(mesh);
                    renderer.render(scene, cam);
                    // dispose quickly
                    try { renderer.dispose && renderer.dispose(); } catch(e){}
                } catch(e) { console.warn('aiBox reduced-motion render failed for', id, e); }
            });
            return;
        }

        // active animation mode: create lightweight scenes per canvas
        window._aiBoxModels = window._aiBoxModels || [];
        const configs = [
            { id: 'ai-box-routing' },
            { id: 'ai-box-distributed' },
            { id: 'ai-box-fault' }
        ];

        configs.forEach(cfg => {
            const canvas = document.getElementById(cfg.id);
            if (!canvas) return;
            try {
                const scene = new THREE.Scene();
                const camera = new THREE.PerspectiveCamera(45, canvas.clientWidth / Math.max(120, canvas.clientHeight), 0.1, 1000);
                camera.position.set(0, 0.6, 2.6);
                const renderer = new THREE.WebGLRenderer({ canvas: canvas, alpha: true, antialias: true });
                renderer.setPixelRatio(window.devicePixelRatio || 1);
                renderer.setSize(canvas.clientWidth, canvas.clientHeight, false);
                scene.add(new THREE.AmbientLight(0xffffff, 0.6));
                const dir = new THREE.DirectionalLight(0xffffff, 0.8); dir.position.set(5,3,5); scene.add(dir);

                let group = new THREE.Group();
                scene.add(group);

                if (cfg.id === 'ai-box-routing') {
                    const tor = new THREE.Mesh(new THREE.TorusGeometry(0.45, 0.08, 12, 64), new THREE.MeshStandardMaterial({ color: 0x00d4ff, metalness:0.2, roughness:0.4 }));
                    tor.rotation.x = Math.PI/2; group.add(tor);
                    const pulseMat = new THREE.MeshStandardMaterial({ color: 0x00ffcc, emissive:0x00ffcc, emissiveIntensity:0.6, metalness:0.1, roughness:0.45 });
                    const orb = new THREE.Mesh(new THREE.SphereGeometry(0.06, 10, 10), pulseMat); orb.position.set(0.45, 0, 0); group.add(orb);
                    // store for animation
                    cfg._anim = (t)=>{ orb.position.x = Math.cos(t*1.6) * 0.45; orb.position.z = Math.sin(t*1.6) * 0.18; group.rotation.z = t * 0.08; };
                } else if (cfg.id === 'ai-box-distributed') {
                    const nodeMat = new THREE.MeshStandardMaterial({ color: 0x00ff88, metalness:0.15, roughness:0.45 });
                    const n1 = new THREE.Mesh(new THREE.SphereGeometry(0.12, 10, 10), nodeMat);
                    const n2 = new THREE.Mesh(new THREE.SphereGeometry(0.10, 10, 10), nodeMat);
                    const n3 = new THREE.Mesh(new THREE.SphereGeometry(0.09, 10, 10), nodeMat);
                    n1.position.set(-0.36, 0, 0); n2.position.set(0.18, 0.18, 0); n3.position.set(0.18, -0.18, 0);
                    group.add(n1, n2, n3);
                    const geo = new THREE.BufferGeometry().setFromPoints([n1.position, n2.position, n3.position, n1.position]);
                    const line = new THREE.Line(geo, new THREE.LineBasicMaterial({ color: 0x88ffd8 }));
                    group.add(line);
                    cfg._anim = (t)=>{ group.rotation.y = Math.sin(t*0.6) * 0.22; };
                } else {
                    const box = new THREE.Mesh(new THREE.BoxGeometry(0.42,0.28,0.18), new THREE.MeshStandardMaterial({ color: 0xff6b35, metalness:0.25, roughness:0.38 }));
                    const tor = new THREE.Mesh(new THREE.TorusGeometry(0.18, 0.04, 10, 40), new THREE.MeshStandardMaterial({ color:0xffd8b6, metalness:0.08, roughness:0.5 }));
                    tor.rotation.x = Math.PI/2; tor.position.set(0, 0.02, 0.12);
                    group.add(box); group.add(tor);
                    cfg._anim = (t)=>{ tor.rotation.z = t * 1.6; box.rotation.y = Math.sin(t*0.4) * 0.12; };
                }

                // resize handler
                function resize() {
                    const w = canvas.clientWidth || 120;
                    const h = canvas.clientHeight || 120;
                    camera.aspect = w / Math.max(120, h);
                    camera.updateProjectionMatrix();
                    renderer.setSize(w, h, false);
                }
                window.addEventListener('resize', resize);

                let start = performance.now();
                let rafId = null;
                function animate() {
                    const now = performance.now();
                    const t = (now - start) / 1000;
                    try {
                        if (cfg._anim) cfg._anim(t);
                        group.rotation.x += 0.002;
                        renderer.render(scene, camera);
                    } catch (e) {}
                    rafId = requestAnimationFrame(animate);
                }
                // initial draw + start loop
                resize();
                renderer.render(scene, camera);
                rafId = requestAnimationFrame(animate);

                // push to global for potential cleanup
                window._aiBoxModels.push({ id: cfg.id, canvas, scene, camera, renderer, rafId, resizeHandler: resize });
            } catch (e) {
                console.warn('initAIBoxModels: failed to init', cfg.id, e);
            }
        });

        // cleanup on page unload
        window.addEventListener('beforeunload', function(){
            try {
                (window._aiBoxModels || []).forEach(m => {
                    try { cancelAnimationFrame(m.rafId); } catch(e){}
                    try { window.removeEventListener('resize', m.resizeHandler); } catch(e){}
                    try { m.renderer && m.renderer.dispose && m.renderer.dispose(); } catch(e){}
                });
            } catch(e){}
        });
    } catch (e) {
        console.warn('initAIBoxModels failed', e);
    }
}

// Parallax-on-scroll for tech cards and AI boxes inside the Technology section
function initTechCardParallax(){
    try{
        // respect reduced motion
        if (window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
        const section = document.querySelector('.technology-section');
        if (!section) return;
        const cards = Array.from(section.querySelectorAll('.tech-card, .ai-box-card'));
        if (!cards.length) return;

        // Provide per-card defaults and allow overrides via data attributes:
        // data-parallax-speed (multiplier 0..1+), data-parallax-strength (px max), data-parallax-ease (0..1)
        cards.forEach((c, i)=>{
            const defaultSpeed = 0.20 + (i % 4) * 0.06; // varied pace per card
            const defaultStrength = 60; // px max translate (stronger than before)
            const defaultEase = 0.12 + ((i % 3) * 0.04); // smoothing per card
            if (!c.dataset.parallaxSpeed) c.dataset.parallaxSpeed = String(defaultSpeed);
            if (!c.dataset.parallaxStrength) c.dataset.parallaxStrength = String(defaultStrength);
            if (!c.dataset.parallaxEase) c.dataset.parallaxEase = String(defaultEase);
            // keep an internal current value for smooth lerp
            c._parallaxCurrentY = 0;
        });

        let ticking = false;
        function onScroll(){ if (!ticking){ ticking = true; window.requestAnimationFrame(()=>{ update(); ticking=false; }); } }

        function clamp(v,a,b){ return Math.max(a, Math.min(b, v)); }

        function update(){
            const rect = section.getBoundingClientRect();
            const vh = window.innerHeight || document.documentElement.clientHeight;
            // normalized center offset: -1..1 where 0 = section centered in viewport
            const centerOffset = (rect.top + rect.height/2) - (vh/2);
            const max = (vh/2 + rect.height/2) || 1;
            const n = clamp(centerOffset / max, -1, 1);

            cards.forEach((c)=>{
                const speed = parseFloat(c.dataset.parallaxSpeed || '0.2');
                const strength = parseFloat(c.dataset.parallaxStrength || '60');
                const ease = parseFloat(c.dataset.parallaxEase || '0.14');
                // target Y opposing scroll (gives depth) scaled by speed & strength
                const targetY = -n * speed * strength;
                // smooth toward target (lerp)
                c._parallaxCurrentY = (c._parallaxCurrentY || 0) + (targetY - (c._parallaxCurrentY || 0)) * ease;
                try { c.style.setProperty('--parallax-y', `${c._parallaxCurrentY.toFixed(2)}px`); } catch(e){}
            });
        }

        // initial update & listeners
        update();
        window.addEventListener('scroll', onScroll, { passive: true });
        window.addEventListener('resize', onScroll, { passive: true });

        // cleanup when unloading
        window.addEventListener('beforeunload', ()=>{
            try{ window.removeEventListener('scroll', onScroll); window.removeEventListener('resize', onScroll); }catch(e){}
        });
    }catch(e){ console.warn('initTechCardParallax failed', e); }
}

// Init interactive tilt/move for Sustainability cubes
function initSustainabilitySection(){
    try{
        if (window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
        const cubes = Array.from(document.querySelectorAll('.sustain-cube'));
        if (!cubes.length) return;

        cubes.forEach(c => {
            let rafId = null;
            function onPointerMove(e){
                const clientX = (e.touches && e.touches[0]) ? e.touches[0].clientX : e.clientX;
                const clientY = (e.touches && e.touches[0]) ? e.touches[0].clientY : e.clientY;
                const r = c.getBoundingClientRect();
                const x = (clientX - r.left) / Math.max(1, r.width);
                const y = (clientY - r.top) / Math.max(1, r.height);
                const rx = ( (y - 0.5) * -14 );
                const ry = ( (x - 0.5) * 14 );
                if (rafId) cancelAnimationFrame(rafId);
                rafId = requestAnimationFrame(()=>{
                    try{
                        c.style.setProperty('--rx', rx.toFixed(2) + 'deg');
                        c.style.setProperty('--ry', ry.toFixed(2) + 'deg');
                        c.style.setProperty('--tz', '18px');
                    }catch(e){}
                });
            }
            function onEnter(){ c.classList.add('hover'); }
            function onLeave(){ c.classList.remove('hover'); c.style.setProperty('--rx','0deg'); c.style.setProperty('--ry','0deg'); c.style.setProperty('--tz','0px'); }

            c.addEventListener('pointerenter', onEnter);
            c.addEventListener('pointermove', onPointerMove, { passive: true });
            c.addEventListener('pointerleave', onLeave);
            c.addEventListener('focus', onEnter);
            c.addEventListener('blur', onLeave);

            // keyboard affordances
            // Note: do NOT toggle hover on Enter/Space — interaction should be hover-based.
            // Keep arrow keys to nudge the visual tilt for keyboard users.
            c.addEventListener('keydown', function(ev){
                if (ev.key === 'ArrowLeft') { ev.preventDefault(); c.style.setProperty('--ry','10deg'); }
                if (ev.key === 'ArrowRight') { ev.preventDefault(); c.style.setProperty('--ry','-10deg'); }
                if (ev.key === 'ArrowUp') { ev.preventDefault(); c.style.setProperty('--rx','8deg'); }
                if (ev.key === 'ArrowDown') { ev.preventDefault(); c.style.setProperty('--rx','-8deg'); }
            });
        });
    }catch(e){ console.warn('initSustainabilitySection failed', e); }
}

// AI Integration background: interactive node network for the Technology/AI Integration section
(function(){
    let canvas, ctx, w, h, nodes = [], anchors = [], rafId;
    const config = { nodeCount: 18, linkDist: 140, nodeRadius: 3.5 };

    function init() {
        const el = document.getElementById('aiIntegrationCanvas');
        if (!el) return;
        canvas = el; ctx = canvas.getContext('2d');
        resize();
        buildNodes();
        attachListeners();
        loop();
    }

    function resize(){
        const dpr = window.devicePixelRatio || 1;
        const rect = canvas.getBoundingClientRect();
        w = Math.max(100, rect.width); h = Math.max(100, rect.height);
        canvas.width = Math.floor(w * dpr);
        canvas.height = Math.floor(h * dpr);
        canvas.style.width = w + 'px';
        canvas.style.height = h + 'px';
        ctx.setTransform(dpr,0,0,dpr,0,0);
    }

    function buildNodes(){
        nodes = [];
        anchors = [];
        // Add anchor nodes aligned with the 4 tech cards if present
        const cards = Array.from(document.querySelectorAll('.technology-section .tech-card'));
        cards.forEach((card, i) => {
            const r = card.getBoundingClientRect();
            const parent = document.querySelector('.technology-section');
            const pr = parent.getBoundingClientRect();
            const nx = (r.left + r.width/2) - pr.left;
            const ny = (r.top + r.height/2) - pr.top;
            anchors.push({ x: nx, y: ny, baseRadius: 5 + i*1.4 });
        });

        // Populate nodes randomly across canvas, biasing towards anchors
        for (let i=0;i<config.nodeCount;i++){
            let ax = Math.random()*w, ay = Math.random()*h;
            if (anchors.length && Math.random() < 0.6){
                const a = anchors[Math.floor(Math.random()*anchors.length)];
                ax = a.x + (Math.random()-0.5)*120;
                ay = a.y + (Math.random()-0.5)*80;
            }
            nodes.push({ x: ax, y: ay, vx: (Math.random()-0.5)*0.25, vy: (Math.random()-0.5)*0.25, r: config.nodeRadius, pulse:0 });
        }
    }

    function attachListeners(){
        window.addEventListener('resize', () => { resize(); buildNodes(); });
        const section = document.querySelector('.technology-section');
        if (section){
            section.addEventListener('mousemove', onMove);
            section.addEventListener('mouseleave', () => { section._mouse = null; });
        }

        // pulse nodes when hovering tech cards
        const cards = Array.from(document.querySelectorAll('.technology-section .tech-card'));
        cards.forEach((card)=>{
            card.addEventListener('mouseenter', (e)=>{
                const rect = card.getBoundingClientRect();
                const parent = document.querySelector('.technology-section').getBoundingClientRect();
                const cx = (rect.left + rect.width/2) - parent.left;
                const cy = (rect.top + rect.height/2) - parent.top;
                // find nearest node and pulse it
                let best=null, bd=Infinity;
                nodes.forEach(n=>{ const d = (n.x-cx)*(n.x-cx)+(n.y-cy)*(n.y-cy); if(d<bd){ bd=d; best=n; }});
                if (best) best.pulse = 1.8;
            });
        });
    }

    function onMove(e){
        const parent = document.querySelector('.technology-section').getBoundingClientRect();
        const mx = e.clientX - parent.left; const my = e.clientY - parent.top;
        const section = document.querySelector('.technology-section');
        section._mouse = { x: mx, y: my };
        // softly attract nearest nodes
        let nearest = null, bd = Infinity;
        nodes.forEach(n=>{ const d = (n.x-mx)*(n.x-mx)+(n.y-my)*(n.y-my); if(d<bd){ bd=d; nearest=n; }});
        if (nearest) nearest.pulse = Math.max(nearest.pulse, 1.4);
    }

    function loop(){
        rafId = requestAnimationFrame(loop);
        update(); draw();
    }

    function update(){
        // physics
        nodes.forEach(n=>{
            n.x += n.vx; n.y += n.vy;
            // bounce bounds
            if (n.x < 8 || n.x > w-8) n.vx *= -1.0;
            if (n.y < 8 || n.y > h-8) n.vy *= -1.0;
            // gentle damping
            n.vx *= 0.998; n.vy *= 0.998;
            // pulse decay
            n.pulse = Math.max(0, n.pulse - 0.04);
        });
        // small repulsion from mouse
        const section = document.querySelector('.technology-section');
        if (section && section._mouse){
            const mx = section._mouse.x, my = section._mouse.y;
            nodes.forEach(n=>{
                const dx = n.x - mx, dy = n.y - my; const d2 = dx*dx+dy*dy; const min = 60;
                if (d2 < min*min && d2>0){ const d = Math.sqrt(d2); const f = (min-d)/min * 0.6; n.vx += (dx/d)*f; n.vy += (dy/d)*f; }
            });
        }
    }

    function draw(){
        ctx.clearRect(0,0,w,h);

        // draw links between nearby nodes
        ctx.lineWidth = 1;
        for (let i=0;i<nodes.length;i++){
            const a = nodes[i];
            for (let j=i+1;j<nodes.length;j++){
                const b = nodes[j];
                const dx = a.x-b.x, dy = a.y-b.y; const d2 = dx*dx+dy*dy;
                if (d2 < config.linkDist*config.linkDist){
                    const alpha = 0.28 * (1 - d2/(config.linkDist*config.linkDist));
                    ctx.strokeStyle = `rgba(40,220,255,${alpha})`;
                    ctx.beginPath(); ctx.moveTo(a.x,a.y); ctx.lineTo(b.x,b.y); ctx.stroke();
                }
            }
        }

        // draw nodes
        nodes.forEach(n=>{
            const r = n.r * (1 + n.pulse * 0.45);
            const grad = ctx.createRadialGradient(n.x, n.y, 0, n.x, n.y, r*4);
            grad.addColorStop(0, 'rgba(0,240,255,0.95)');
            grad.addColorStop(0.2, 'rgba(0,210,220,0.55)');
            grad.addColorStop(1, 'rgba(0,0,0,0)');
            ctx.fillStyle = grad;
            ctx.beginPath(); ctx.arc(n.x, n.y, r, 0, Math.PI*2); ctx.fill();
        });
    }

    // Public initializer used during DOMContentLoaded
    window.initAIIntegrationBackground = function(){
        try{ init(); }catch(e){ console.warn('AI Integration background init failed', e); }
    };

})();

    // Open an interactive Earth modal (used for Low Latency detail)
    function openEarthModal() {
        // prevent multiple modals
        if (document.querySelector('.earth-modal-overlay')) return;

        // build modal skeleton
        const overlay = document.createElement('div');
        overlay.className = 'earth-modal-overlay';
        overlay.style.cssText = 'position:fixed;inset:0;z-index:3000;display:flex;align-items:center;justify-content:center;background:rgba(0,0,0,0.7);backdrop-filter:blur(6px);padding:20px;';

        const box = document.createElement('div');
        box.className = 'earth-modal';
        box.style.cssText = 'width:min(1100px,96%);height:min(760px,86%);background:linear-gradient(180deg,rgba(2,8,30,0.98),rgba(4,12,40,0.98));border-radius:14px;position:relative;overflow:hidden;border:1px solid rgba(0,212,255,0.06);box-shadow:0 40px 120px rgba(0,0,0,0.6);display:flex;';

        // left: canvas, right: info panel
        const canvasWrap = document.createElement('div');
        canvasWrap.style.cssText = 'flex:1;position:relative;';
        const canvas = document.createElement('canvas');
        canvas.id = 'earthModalCanvas';
        canvas.style.cssText = 'width:100%;height:100%;display:block;';
        canvasWrap.appendChild(canvas);

        const info = document.createElement('div');
        info.style.cssText = 'width:340px;padding:20px;color:#eaf4ff;overflow:auto;background:linear-gradient(180deg,rgba(0,10,30,0.04),transparent);';
        info.innerHTML = `
            <h3 style="color:#9fdcff;margin-top:0;margin-bottom:12px;">Orbital Regimes</h3>
            <div id="orbitInfo" style="font-size:14px;line-height:1.45;color:rgba(234,244,255,0.95);">
                <div id="orbit-leo"><strong>Low Earth Orbit (LEO)</strong>
                <p>Altitude: 160–2,000 km<br>Latency: ~20–50 ms<br>Notes: Close to Earth; low latency and easy communication; higher atmospheric drag and increased radiation exposure at very low altitudes.</p></div>

                <div id="orbit-meo"><strong>Medium Earth Orbit (MEO)</strong>
                <p>Altitude: 2,000–35,786 km (GNSS ≈20,000 km)<br>Latency: ~100–150 ms<br>Notes: Moderate latency; often used for navigation (GNSS) and medium-coverage constellations; radiation belts can be intense in portions of this band.</p></div>

                <div id="orbit-geo"><strong>Geostationary Orbit (GEO)</strong>
                <p>Altitude: ≈35,786 km<br>Latency: ~250 ms<br>Notes: Fixed relative to Earth (equatorial), wide coverage but higher latency.</p></div>

                <div id="orbit-heo"><strong>Highly Elliptical Orbit (HEO)</strong>
                <p>Examples: Molniya, Tundra<br>Characteristics: Long dwell times over poles or specific regions; useful for extended coverage of high latitudes and targeted monitoring.</p></div>
            </div>
            <div style="margin-top:12px;font-size:13px;color:var(--gray-medium);">Scroll (wheel) or pinch to zoom the view; drag to rotate the globe.</div>
        `;

        const closeBtn = document.createElement('button');
        closeBtn.textContent = 'Close';
        closeBtn.style.cssText = 'position:absolute;right:12px;top:12px;background:transparent;border:1px solid rgba(159,220,255,0.12);color:#9fdcff;padding:8px 10px;border-radius:8px;cursor:pointer;';
        closeBtn.addEventListener('click', closeEarthModal);

        box.appendChild(canvasWrap);
        box.appendChild(info);
        box.appendChild(closeBtn);
        overlay.appendChild(box);
        document.body.appendChild(overlay);

        // init three scene in canvas
        let renderer, scene, camera, earthMesh, animId;
        try {
            scene = new THREE.Scene();
            const aspect = canvas.clientWidth / Math.max(200, canvas.clientHeight);
            camera = new THREE.PerspectiveCamera(45, aspect, 0.1, 2000);
            camera.position.set(0, 0.6, 6);

            renderer = new THREE.WebGLRenderer({ canvas: canvas, antialias: true, alpha: true });
            const dpr = window.devicePixelRatio || 1;
            renderer.setPixelRatio(dpr);
            function resizeRenderer(){
                const rect = canvas.getBoundingClientRect();
                renderer.setSize(rect.width, rect.height, false);
                camera.aspect = rect.width / Math.max(200, rect.height);
                camera.updateProjectionMatrix();
            }
            resizeRenderer();
            window.addEventListener('resize', resizeRenderer);

            // Earth
            const geo = new THREE.SphereGeometry(1.9, 64, 64);
            const mat = new THREE.MeshPhongMaterial({ emissive:0x020814, shininess:8 });
            try { mat.map = createEarthTexture(2048,1024); } catch(e){}
            earthMesh = new THREE.Mesh(geo, mat);
            scene.add(earthMesh);

            // atmosphere
            const atmGeo = new THREE.SphereGeometry(1.94, 48, 48);
            const atmMat = new THREE.MeshBasicMaterial({ color: 0x7ec8ff, transparent:true, opacity:0.06, blending: THREE.AdditiveBlending, side: THREE.BackSide });
            const atm = new THREE.Mesh(atmGeo, atmMat);

            // lights
            scene.add(new THREE.AmbientLight(0x404040, 0.6));
            const dir = new THREE.DirectionalLight(0xffffff, 1.0); dir.position.set(5,3,5); scene.add(dir);

            // simple stars background using a large points cloud (cheap)
            const starsGeo = new THREE.BufferGeometry();
            const starCount = 400;
            const positions = new Float32Array(starCount*3);
            for (let i=0;i<starCount;i++){ positions[i*3]= (Math.random()-0.5)*200; positions[i*3+1]=(Math.random()-0.5)*200; positions[i*3+2]=(Math.random()-0.5)*200; }
            starsGeo.setAttribute('position', new THREE.BufferAttribute(positions,3));
            const starsMat = new THREE.PointsMaterial({ color:0xffffff, size:0.9, sizeAttenuation:true, opacity:0.9, transparent:true });
            const starPoints = new THREE.Points(starsGeo, starsMat); scene.add(starPoints);

            // Orbit visualizations: three circular rings (LEO, MEO, GEO) and one elliptical HEO
            try {
                const orbitsGroup = new THREE.Group();
                // base radii (relative to Earth mesh radius ~1.9)
                const leoR = 2.6;
                const meoR = 4.2;
                const geoR = 6.8;

                // color coding (hex)
                const leoColor = 0x00ff88; // green
                const meoColor = 0x00d4ff; // blue
                const geoColor = 0xff6b35; // orange
                const heoColor = 0x9fdcff; // light cyan

                const torusParams = [ { r: leoR, color: leoColor }, { r: meoR, color: meoColor }, { r: geoR, color: geoColor } ];
                const orbitMeshes = {};
                torusParams.forEach((obj, i) => {
                    const torus = new THREE.TorusGeometry(obj.r, 0.02 + i*0.004, 64, 240);
                    const mat = new THREE.MeshBasicMaterial({ color: obj.color, transparent: true, opacity: 0.12 + i * 0.06, side: THREE.DoubleSide });
                    const mesh = new THREE.Mesh(torus, mat);
                    // rotate into equatorial plane
                    mesh.rotation.x = Math.PI / 2;
                    // stagger small tilts for visual depth
                    mesh.rotation.z = (i - 1) * 0.06;
                    orbitsGroup.add(mesh);
                    if (i === 0) orbitMeshes.leo = mesh;
                    if (i === 1) orbitMeshes.meo = mesh;
                    if (i === 2) orbitMeshes.geo = mesh;
                });

                // HEO - an inclined elliptical orbit (line)
                const pts = [];
                const a = 6.0; // semi-major
                const b = 3.2; // semi-minor
                const segments = 240;
                for (let i = 0; i <= segments; i++) {
                    const t = (i / segments) * Math.PI * 2;
                    const x = Math.cos(t) * a;
                    const z = Math.sin(t) * b;
                    pts.push(new THREE.Vector3(x, 0, z));
                }
                const heoGeom = new THREE.BufferGeometry().setFromPoints(pts);
                const heoMat = new THREE.LineDashedMaterial({ color: heoColor, dashSize: 0.18, gapSize: 0.12, linewidth: 1, transparent: true, opacity: 0.46 });
                const heoLine = new THREE.Line(heoGeom, heoMat);
                heoLine.computeLineDistances && heoLine.computeLineDistances();
                // tilt the ellipse to show inclination / long dwell over poles
                heoLine.rotation.x = 0.9; // tilt about X
                heoLine.rotation.z = 0.28; // slight rotation around Z
                orbitsGroup.add(heoLine);
                orbitMeshes.heo = heoLine;

                // attach rings and HEO to the globe so they rotate together with the Earth
                // remove earth/atm from scene root if present and add them to a globe group
                try {
                    if (scene && earthMesh) scene.remove(earthMesh);
                    if (scene && typeof atm !== 'undefined') scene.remove(atm);
                } catch(e){}
                const globeGroup = new THREE.Group();
                globeGroup.add(earthMesh);
                globeGroup.add(atm);
                globeGroup.add(orbitsGroup);
                scene.add(globeGroup);
                // expose globeGroup and orbit meshes to the outer scope for highlighting
                window.__earthGlobeGroup = globeGroup;
                window.__earthOrbits = orbitMeshes;

                // color the text labels in the info panel to match orbits (if present)
                try {
                    const elLeo = document.getElementById('orbit-leo'); if (elLeo) elLeo.querySelector('strong') && (elLeo.querySelector('strong').style.color = '#00ff88');
                    const elMeo = document.getElementById('orbit-meo'); if (elMeo) elMeo.querySelector('strong') && (elMeo.querySelector('strong').style.color = '#00d4ff');
                    const elGeo = document.getElementById('orbit-geo'); if (elGeo) elGeo.querySelector('strong') && (elGeo.querySelector('strong').style.color = '#ff6b35');
                    const elHeo = document.getElementById('orbit-heo'); if (elHeo) elHeo.querySelector('strong') && (elHeo.querySelector('strong').style.color = '#9fdcff');
                } catch (e) {}
            } catch (errOrbit) {
                console.warn('Failed to create orbit visualizations', errOrbit);
            }

            // interaction state
            let isDown=false, prevX=0, prevY=0; let targetRotX=0, targetRotY=0;

            canvas.addEventListener('pointerdown', (e)=>{ isDown=true; prevX=e.clientX; prevY=e.clientY; canvas.setPointerCapture(e.pointerId); });
            window.addEventListener('pointerup', (e)=>{ isDown=false; try{ canvas.releasePointerCapture(e.pointerId);}catch(e){} });
            window.addEventListener('pointermove', (e)=>{ if(!isDown) return; const dx=(e.clientX-prevX)/200; const dy=(e.clientY-prevY)/200; prevX=e.clientX; prevY=e.clientY; targetRotY += dx; targetRotX += dy; });

            // wheel zoom (desktop)
            // Prevent zooming closer than the LEO threshold (minZ = 6)
            const minZoomZ = 6;
            canvas.addEventListener('wheel', (e)=>{ e.preventDefault(); camera.position.z = Math.max(minZoomZ, Math.min(18, camera.position.z + Math.sign(e.deltaY)*0.6)); updateOrbitInfo(); }, { passive:false });

            // helper: de-emphasize all orbit boxes
            function clearOrbitHighlights(){
                ['leo','meo','geo','heo'].forEach(k=>{
                    const el = document.getElementById('orbit-'+k);
                    if (!el) return;
                    el.style.opacity = 0.38;
                    el.classList && el.classList.remove('active');
                });
            }

            // update info by camera distance and highlight the matching regime
            function updateOrbitInfo(){
                const z = camera.position.z;
                clearOrbitHighlights();
                const elLeo = document.getElementById('orbit-leo');
                const elMeo = document.getElementById('orbit-meo');
                const elGeo = document.getElementById('orbit-geo');
                const elHeo = document.getElementById('orbit-heo');

                // Visual orbit meshes (if present)
                const orbitMeshes = window.__earthOrbits || {};
                const baseline = { leo: 0.12, meo: 0.18, geo: 0.24, heo: 0.46 };
                const highlight = { leo: 0.9, meo: 0.9, geo: 0.9, heo: 0.86 };

                // reset visuals
                try {
                    Object.keys(baseline).forEach(k => {
                        const m = orbitMeshes[k];
                        if (!m) return;
                        if (m.material) {
                            m.material.opacity = baseline[k];
                        }
                        if (m.scale) {
                            m.scale.set(1,1,1);
                        }
                    });
                } catch (e) { /* ignore visual reset failures */ }

                // mapping thresholds (tuned for this camera range)
                if (z <= 6) {
                    if (elLeo) { elLeo.style.opacity = 1; elLeo.classList.add('active'); }
                    try { if (orbitMeshes.leo && orbitMeshes.leo.material) { orbitMeshes.leo.material.opacity = highlight.leo; orbitMeshes.leo.scale.set(1.04,1.04,1.04); } } catch(e){}
                } else if (z <= 10.5) {
                    if (elMeo) { elMeo.style.opacity = 1; elMeo.classList.add('active'); }
                    try { if (orbitMeshes.meo && orbitMeshes.meo.material) { orbitMeshes.meo.material.opacity = highlight.meo; orbitMeshes.meo.scale.set(1.04,1.04,1.04); } } catch(e){}
                } else if (z <= 14.5) {
                    if (elHeo) { elHeo.style.opacity = 1; elHeo.classList.add('active'); }
                    try { if (orbitMeshes.heo && orbitMeshes.heo.material) { orbitMeshes.heo.material.opacity = highlight.heo; } } catch(e){}
                } else {
                    if (elGeo) { elGeo.style.opacity = 1; elGeo.classList.add('active'); }
                    try { if (orbitMeshes.geo && orbitMeshes.geo.material) { orbitMeshes.geo.material.opacity = highlight.geo; orbitMeshes.geo.scale.set(1.04,1.04,1.04); } } catch(e){}
                }

                // auto-hide highlight after a few seconds of idle (and reset visuals)
                clearTimeout(window._orbitInfoHide);
                window._orbitInfoHide = setTimeout(()=>{ clearOrbitHighlights(); try{ Object.keys(baseline).forEach(k=>{ const m = orbitMeshes[k]; if(!m) return; if(m.material) m.material.opacity = baseline[k]; if(m.scale) m.scale.set(1,1,1); }); }catch(e){} }, 3800);
            }
            updateOrbitInfo();

            // Touch pinch-to-zoom support (mobile)
            const pinch = { active:false, startDist:0, startZ: null };
            function getTouchDist(t1, t2){ const dx = t2.clientX - t1.clientX; const dy = t2.clientY - t1.clientY; return Math.sqrt(dx*dx + dy*dy); }
            function onTouchStart(e){
                if (!e.touches) return;
                if (e.touches.length === 2) {
                    pinch.active = true;
                    pinch.startDist = getTouchDist(e.touches[0], e.touches[1]);
                    pinch.startZ = camera.position.z;
                }
            }
            function onTouchMove(e){
                if (!pinch.active || !e.touches || e.touches.length < 2) return;
                e.preventDefault();
                const d = getTouchDist(e.touches[0], e.touches[1]);
                const diff = d - pinch.startDist;
                const scale = diff * 0.02; // tuned sensitivity
                camera.position.z = Math.max(minZoomZ, Math.min(18, pinch.startZ - scale));
                updateOrbitInfo();
            }
            function onTouchEnd(e){ if (!e.touches || e.touches.length < 2) { pinch.active = false; pinch.startDist = 0; pinch.startZ = null; } }
            canvas.addEventListener('touchstart', onTouchStart, { passive:false });
            canvas.addEventListener('touchmove', onTouchMove, { passive:false });
            canvas.addEventListener('touchend', onTouchEnd, { passive:true });

            // animate
            function render(){
                animId = requestAnimationFrame(render);
                // rotate the globeGroup (if present) so orbits move with the Earth; fallback to earthMesh
                const globe = window.__earthGlobeGroup || earthMesh;
                if (globe) {
                    globe.rotation.y += (targetRotY - globe.rotation.y) * 0.08;
                    globe.rotation.x = Math.max(-0.9, Math.min(0.9, globe.rotation.x + (targetRotX - globe.rotation.x) * 0.08));
                    // subtle auto-rotation
                    globe.rotation.y += 0.002;
                }
                renderer.render(scene, camera);
            }
            render();

            // cleanup closure
            function destroy(){
                cancelAnimationFrame(animId);
                try { window.removeEventListener('resize', resizeRenderer); } catch(e){}
                try { canvas.removeEventListener('wheel', ()=>{}); } catch(e){}
                // remove touch handlers we added
                try { canvas.removeEventListener('touchstart', onTouchStart); canvas.removeEventListener('touchmove', onTouchMove); canvas.removeEventListener('touchend', onTouchEnd); } catch(e){}
                // best-effort: release pointer capture and allow GC
                try { overlay.querySelector('canvas') && overlay.querySelector('canvas').releasePointerCapture && overlay.querySelector('canvas').releasePointerCapture(); } catch(e){}
                try { renderer.dispose(); } catch(e){}
                try { if (overlay.parentNode) overlay.parentNode.removeChild(overlay); } catch(e){ overlay.remove(); }
            }

            // expose destroy on close
            overlay._destroy = destroy;

        } catch (e) {
            console.warn('Failed to initialize Earth modal', e);
            overlay.remove();
        }

        // close on outside click
        overlay.addEventListener('pointerdown', (e)=>{ if (e.target === overlay) closeEarthModal(); });

        function closeEarthModal(){
            const ov = document.querySelector('.earth-modal-overlay');
            if (!ov) return;
            if (ov._destroy) ov._destroy(); else ov.remove();
        }

        // also attach global close function
        window.closeEarthModal = closeEarthModal;
    }

    // Falling datacenters: spawn small `.datacenter-fall` nodes into #falling-datacenters
    (function(){
        // Respect reduced motion
        if (window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

        document.addEventListener('DOMContentLoaded', function(){
            const container = document.getElementById('falling-datacenters');
            if (!container) return;

            let intervalId = null;
            let io = null;

            function spawnOne(){
                try{
                    const el = document.createElement('div');
                    el.className = 'datacenter-fall';
                    // random horizontal start
                    el.style.left = (Math.random() * 92 + 4) + '%';
                    // vary size a bit
                    const size = 36 + Math.floor(Math.random() * 38); // 36..74
                    el.style.width = size + 'px';
                    el.style.height = size + 'px';
                    el.style.borderRadius = (8 + Math.floor(Math.random()*12)) + 'px';
                    // random tiny label (optional) — keep empty for now
                    // el.textContent = 'DC';
                    // staggered animation timing
                    el.style.animationDuration = (5 + Math.random() * 6).toFixed(2) + 's';
                    el.style.animationDelay = (Math.random() * 1.25).toFixed(2) + 's';
                    container.appendChild(el);
                    // remove after animation ends
                    const onEnd = function(){ try{ el.removeEventListener('animationend', onEnd); }catch(e){}; try{ if (el.parentNode) el.parentNode.removeChild(el); }catch(e){} };
                    el.addEventListener('animationend', onEnd);
                    // safety: remove after a hard timeout in case animationend didn't fire
                    setTimeout(()=>{ if (el.parentNode) el.parentNode.removeChild(el); }, 14000);
                }catch(e){ /* non-fatal */ }
            }

            function startSpawning(){ if (intervalId) return; intervalId = setInterval(spawnOne, 650); }
            function stopSpawning(){ if (!intervalId) return; clearInterval(intervalId); intervalId = null; }

            // Start only when the container is visible (intersection observer)
            if ('IntersectionObserver' in window){
                io = new IntersectionObserver((entries)=>{
                    entries.forEach(en => {
                        if (en.isIntersecting) startSpawning(); else stopSpawning();
                    });
                }, { threshold: 0.08 });
                io.observe(container);
            } else {
                // fallback: start spawning once page loads and container in viewport
                if (container.getBoundingClientRect().top < window.innerHeight) startSpawning();
                window.addEventListener('scroll', function onS(){ if (container.getBoundingClientRect().top < window.innerHeight){ startSpawning(); window.removeEventListener('scroll', onS); } }, { passive: true });
            }

            // cleanup when navigating away
            window.addEventListener('beforeunload', function(){ try{ if (io) io.disconnect(); stopSpawning(); }catch(e){} });
        });
    })();

// Floating Definitions image: subtle bob + pointer-based parallax for #definitions-image
(function(){
    function init(){
        try{
            if (window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
            const img = document.getElementById('definitions-image');
            if (!img) return;

            let rafId = null;
            let tx = 0, ty = 0, px = 0, py = 0;
            let start = performance.now();

            function onPointer(e){
                const rect = img.getBoundingClientRect();
                const cx = rect.left + rect.width/2;
                const cy = rect.top + rect.height/2;
                const mx = (e.touches && e.touches[0]) ? e.touches[0].clientX : (e.clientX || cx);
                const my = (e.touches && e.touches[0]) ? e.touches[0].clientY : (e.clientY || cy);
                // small normalized offsets based on element size
                tx = (mx - cx) / Math.max(120, rect.width) * 12; // px
                ty = (my - cy) / Math.max(80, rect.height) * 8;  // px
            }

            function animate(now){
                const t = (now - start) / 1000;
                // base bobbing motion
                const bobY = Math.sin(t * 1.15) * 6; // px
                const bobX = Math.sin(t * 0.6) * 2.5; // px
                // smooth toward pointer target
                px += (tx - px) * 0.08;
                py += (ty - py) * 0.08;
                const rot = Math.sin(t * 0.9) * 1.5 + (px * 0.02);
                img.style.transform = `translate3d(${(bobX + px).toFixed(2)}px, ${(bobY + py).toFixed(2)}px, 0) rotate(${rot.toFixed(2)}deg)`;
                rafId = requestAnimationFrame(animate);
            }

            document.addEventListener('mousemove', onPointer, { passive:true });
            document.addEventListener('touchmove', onPointer, { passive:true });
            rafId = requestAnimationFrame(animate);

            window.addEventListener('beforeunload', function(){ try{ cancelAnimationFrame(rafId); }catch(e){} });
        }catch(e){ console.warn('definitions image init failed', e); }
    }

    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init); else init();
})();

// Glossary popups: show futuristic dialog on hover/focus for left/right columns and image
(function(){
    function initTermPopups(){
        try{
            const left = document.querySelector('.terms-left');
            const right = document.querySelector('.terms-right');
            const img = document.getElementById('definitions-image');
            const popLeft = document.getElementById('term-pop-left');
            const popRight = document.getElementById('term-pop-right');
            const defPop = document.getElementById('definitions-popup');
            if (!left && !right && !img) return;

            const prefersReduced = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

            function show(el){ if(!el) return; el.classList.add('show'); el.setAttribute('aria-hidden','false'); }
            function hide(el){ if(!el) return; el.classList.remove('show'); el.setAttribute('aria-hidden','true'); }

            if (left){
                left.addEventListener('mouseenter', ()=> show(popLeft), {passive:true});
                left.addEventListener('mouseleave', ()=> hide(popLeft));
                left.addEventListener('focusin', ()=> show(popLeft));
                left.addEventListener('focusout', ()=> hide(popLeft));
                left.addEventListener('touchstart', (e)=>{ show(popLeft); e.stopPropagation(); }, {passive:true});
            }

            if (right){
                right.addEventListener('mouseenter', ()=> show(popRight), {passive:true});
                right.addEventListener('mouseleave', ()=> hide(popRight));
                right.addEventListener('focusin', ()=> show(popRight));
                right.addEventListener('focusout', ()=> hide(popRight));
                right.addEventListener('touchstart', (e)=>{ show(popRight); e.stopPropagation(); }, {passive:true});
            }

            if (img){
                img.addEventListener('mouseenter', ()=> show(defPop), {passive:true});
                img.addEventListener('mouseleave', ()=> hide(defPop));
                img.addEventListener('focus', ()=> show(defPop));
                img.addEventListener('blur', ()=> hide(defPop));
                img.addEventListener('click', ()=>{ if(defPop) defPop.classList.toggle('show'); });
                img.addEventListener('touchstart', (e)=>{ if(defPop){ defPop.classList.toggle('show'); } e.stopPropagation(); }, {passive:true});
            }

            // Hide when clicking outside
            document.addEventListener('click', function(e){
                try{
                    if (left && !left.contains(e.target)) hide(popLeft);
                    if (right && !right.contains(e.target)) hide(popRight);
                    if (img && e.target !== img && defPop && !defPop.contains(e.target)) hide(defPop);
                }catch(e){}
            }, {passive:true});

            // Auto-hide after short timeout for touch users
            let autoHideTimer = null;
            function scheduleAutoHide(){ clearTimeout(autoHideTimer); autoHideTimer = setTimeout(()=>{ hide(popLeft); hide(popRight); hide(defPop); }, 3200); }
            ['mouseenter','focusin','touchstart'].forEach(evt => { if(left) left.addEventListener(evt, scheduleAutoHide); if(right) right.addEventListener(evt, scheduleAutoHide); if(img) img.addEventListener(evt, scheduleAutoHide); });

            if (prefersReduced){ [popLeft, popRight, defPop].forEach(p => { if(p) p.style.transition = 'none'; }); }
        }catch(e){ console.warn('initTermPopups failed', e); }
    }
    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', initTermPopups); else initTermPopups();
})();