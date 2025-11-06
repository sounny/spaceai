// Global variables
let scene, camera, renderer, earth, satellites = [];
let mouseX = 0, mouseY = 0;

// Initialize everything when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    initTypewriter();
    initScrollAnimations();
    initStarfield();
    init3DEarth();
    initCharts();
    initInteractiveElements();
    initSmoothScrolling();
});

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

    const numStars = Math.min(450, Math.floor((window.innerWidth * window.innerHeight) / 8000));
    const stars = [];
    for (let i = 0; i < numStars; i++) {
        stars.push({
            x: Math.random() * window.innerWidth,
            y: Math.random() * window.innerHeight,
            z: Math.random() * 1.0,
            size: Math.random() * 1.4 + 0.3,
            twinkle: Math.random() * Math.PI * 2,
            speed: 0.02 + Math.random() * 0.04
        });
    }

    let last = performance.now();

    function render(now) {
        const dt = (now - last) / 1000;
        last = now;
        ctx.clearRect(0, 0, w, h);

        // soft nebula glows: draw faint radial gradients occasionally
        // (lightweight) - draw a couple of big radial gradients
        const g1 = ctx.createRadialGradient(w * 0.2, h * 0.15, 0, w * 0.2, h * 0.15, Math.max(w, h) * 0.6);
        g1.addColorStop(0, 'rgba(60,80,140,0.06)');
        g1.addColorStop(1, 'rgba(0,0,0,0)');
        ctx.fillStyle = g1;
        ctx.fillRect(0, 0, w, h);

        const g2 = ctx.createRadialGradient(w * 0.85, h * 0.8, 0, w * 0.85, h * 0.8, Math.max(w, h) * 0.6);
        g2.addColorStop(0, 'rgba(120,60,130,0.04)');
        g2.addColorStop(1, 'rgba(0,0,0,0)');
        ctx.fillStyle = g2;
        ctx.fillRect(0, 0, w, h);

        // update and draw stars
        for (let i = 0; i < stars.length; i++) {
            const s = stars[i];
            // twinkle
            s.twinkle += dt * (0.5 + s.z);
            const alpha = 0.5 + 0.5 * Math.sin(s.twinkle);

            // slight drift for parallax effect based on time
            s.x += (Math.sin(now * 0.0001 + i) * 0.02) * (0.5 + s.z);
            s.y += (Math.cos(now * 0.00013 + i) * 0.02) * (0.5 + s.z);

            // wrap
            if (s.x < -5) s.x = w + 5;
            if (s.x > w + 5) s.x = -5;
            if (s.y < -5) s.y = h + 5;
            if (s.y > h + 5) s.y = -5;

            ctx.beginPath();
            // use radial gradient for a soft star
            const r = s.size * (0.6 + s.z * 1.2);
            const gradient = ctx.createRadialGradient(s.x, s.y, 0, s.x, s.y, r * 3);
            gradient.addColorStop(0, `rgba(255,255,255,${0.8 * alpha})`);
            gradient.addColorStop(0.2, `rgba(200,230,255,${0.35 * alpha})`);
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
                
                // Trigger specific animations based on section
                if (entry.target.classList.contains('current-datacenters')) {
                    animateDataCenterCards();
                } else if (entry.target.classList.contains('orbital-solution')) {
                    animateOrbitalVisualization();
                }
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

    // Create Earth
    const geometry = new THREE.SphereGeometry(2, 64, 64);
    const textureLoader = new THREE.TextureLoader();
    
    // Create a simple earth material if texture fails
    const material = new THREE.MeshPhongMaterial({
        color: 0x2233ff,
        emissive: 0x112244,
        shininess: 30
    });
    
    earth = new THREE.Mesh(geometry, material);
    scene.add(earth);

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
    const satelliteGeometry = new THREE.BoxGeometry(0.1, 0.1, 0.3);
    const satelliteMaterial = new THREE.MeshPhongMaterial({ 
        color: 0x00d4ff,
        emissive: 0x00d4ff,
        emissiveIntensity: 0.3
    });

    // Create multiple satellites at different orbits
    for (let i = 0; i < 8; i++) {
        const satellite = new THREE.Mesh(satelliteGeometry, satelliteMaterial);
        
        // Different orbital radii
        const radius = 3 + (i % 3) * 0.8;
        const angle = (i / 8) * Math.PI * 2;
        const height = Math.sin(i) * 0.5;
        
        satellite.position.x = Math.cos(angle) * radius;
        satellite.position.z = Math.sin(angle) * radius;
        satellite.position.y = height;
        
        satellite.userData = {
            radius: radius,
            angle: angle,
            speed: 0.01 + (i % 3) * 0.005,
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
        
        // Mouse interaction
        earth.rotation.x = mouseY * 0.1;
        earth.rotation.z = mouseX * 0.1;
        
        // Animate satellites
        satellites.forEach((satellite, index) => {
            satellite.userData.angle += satellite.userData.speed;
            satellite.position.x = Math.cos(satellite.userData.angle) * satellite.userData.radius;
            satellite.position.z = Math.sin(satellite.userData.angle) * satellite.userData.radius;
            satellite.position.y = satellite.userData.originalY + Math.sin(Date.now() * 0.001 + index) * 0.2;
            
            satellite.rotation.y += 0.1;
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
    // Cost Structure Chart
    const costCtx = document.getElementById('costChart');
        if (costCtx) {
        new Chart(costCtx, {
            type: 'doughnut',
            data: {
                labels: ['Electrical (35%)', 'Thermal (35%)', 'Shell (15%)', 'Network (15%)'],
                datasets: [{
                    data: [35, 35, 15, 15],
                    backgroundColor: [
                        '#00d4ff',
                        '#00ff88',
                        '#ff6b35',
                        '#ff35a6'
                    ],
                    borderWidth: 0,
                    hoverOffset: 8
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: 'bottom',
                        labels: {
                                color: '#ffffff',
                                padding: 12,
                                boxWidth: 10,
                                usePointStyle: true,
                                font: {
                                    size: 12
                                }
                            }
                    },
                    tooltip: {
                        backgroundColor: 'rgba(0, 20, 84, 0.9)',
                        titleColor: '#ffffff',
                        bodyColor: '#ffffff',
                        borderColor: '#00d4ff',
                        borderWidth: 1
                    }
                }
            }
        });
    }

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
`;

// Inject additional styles
const styleSheet = document.createElement('style');
styleSheet.textContent = additionalStyles;
document.head.appendChild(styleSheet);