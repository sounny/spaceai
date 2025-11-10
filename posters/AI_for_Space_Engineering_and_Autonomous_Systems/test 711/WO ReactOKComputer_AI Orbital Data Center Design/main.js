// AI Orbital Data Centers - Main JavaScript
class OrbitalDataCenters {
    constructor() {
        this.scene = null;
        this.camera = null;
        this.renderer = null;
        this.earth = null;
        this.satellites = [];
        this.starfield = null;
        this.isLoaded = false;
        
        this.init();
    }
    
    init() {
        this.setupLoading();
        this.setupStarfield();
        this.setup3DEarth();
        this.setupScrollAnimations();
        this.setupInteractions();
        this.setupResponsive();
    }
    
    setupLoading() {
        window.addEventListener('load', () => {
            setTimeout(() => {
                const loading = document.getElementById('loading');
                loading.style.opacity = '0';
                setTimeout(() => {
                    loading.style.display = 'none';
                    this.startAnimations();
                }, 500);
            }, 1500);
        });
    }
    
    setupStarfield() {
        const starfieldContainer = document.getElementById('starfield');
        
        // Create starfield using p5.js
        new p5((p) => {
            let stars = [];
            const numStars = 200;
            
            p.setup = () => {
                const canvas = p.createCanvas(p.windowWidth, p.windowHeight);
                canvas.parent('starfield');
                
                // Initialize stars
                for (let i = 0; i < numStars; i++) {
                    stars.push({
                        x: p.random(p.width),
                        y: p.random(p.height),
                        size: p.random(1, 3),
                        brightness: p.random(0.3, 1),
                        twinkleSpeed: p.random(0.01, 0.03)
                    });
                }
            };
            
            p.draw = () => {
                p.clear();
                
                // Draw twinkling stars
                stars.forEach(star => {
                    star.brightness += p.sin(p.frameCount * star.twinkleSpeed) * 0.1;
                    star.brightness = p.constrain(star.brightness, 0.2, 1);
                    
                    p.fill(255, 255, 255, star.brightness * 255);
                    p.noStroke();
                    p.ellipse(star.x, star.y, star.size);
                });
            };
            
            p.windowResized = () => {
                p.resizeCanvas(p.windowWidth, p.windowHeight);
            };
        });
    }
    
    setup3DEarth() {
        const container = document.getElementById('earth-container');
        if (!container) return;
        
        // Scene setup
        this.scene = new THREE.Scene();
        this.camera = new THREE.PerspectiveCamera(75, container.clientWidth / container.clientHeight, 0.1, 1000);
        this.renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
        
        this.renderer.setSize(container.clientWidth, container.clientHeight);
        this.renderer.setClearColor(0x000000, 0);
        container.appendChild(this.renderer.domElement);
        
        // Lighting
        const ambientLight = new THREE.AmbientLight(0x404040, 0.3);
        this.scene.add(ambientLight);
        
        const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
        directionalLight.position.set(5, 3, 5);
        this.scene.add(directionalLight);
        
        // Create Earth
        this.createEarth();
        
        // Create Satellites
        this.createSatellites();
        
        // Position camera
        this.camera.position.z = 3;
        
        // Start animation loop
        this.animate();
        
        // Setup mouse controls
        this.setupMouseControls();
    }
    
    createEarth() {
        const geometry = new THREE.SphereGeometry(1, 64, 64);
        
        // Create earth texture
        const canvas = document.createElement('canvas');
        canvas.width = 2048;
        canvas.height = 1024;
        const ctx = canvas.getContext('2d');
        
        // Create a simple earth-like texture
        const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
        gradient.addColorStop(0, '#4a90e2');
        gradient.addColorStop(0.3, '#2e5c8a');
        gradient.addColorStop(0.7, '#1e3a5f');
        gradient.addColorStop(1, '#0f1d2f');
        
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        // Add some landmasses
        ctx.fillStyle = '#2d5016';
        for (let i = 0; i < 20; i++) {
            const x = Math.random() * canvas.width;
            const y = Math.random() * canvas.height;
            const radius = Math.random() * 100 + 50;
            ctx.beginPath();
            ctx.arc(x, y, radius, 0, Math.PI * 2);
            ctx.fill();
        }
        
        const texture = new THREE.CanvasTexture(canvas);
        const material = new THREE.MeshPhongMaterial({ 
            map: texture,
            shininess: 30
        });
        
        this.earth = new THREE.Mesh(geometry, material);
        this.scene.add(this.earth);
        
        // Add atmosphere
        const atmosphereGeometry = new THREE.SphereGeometry(1.05, 32, 32);
        const atmosphereMaterial = new THREE.MeshBasicMaterial({
            color: 0x4a90e2,
            transparent: true,
            opacity: 0.1,
            side: THREE.BackSide
        });
        const atmosphere = new THREE.Mesh(atmosphereGeometry, atmosphereMaterial);
        this.scene.add(atmosphere);
    }
    
    createSatellites() {
        const satelliteCount = 12;
        const orbitRadius = 1.5;
        
        for (let i = 0; i < satelliteCount; i++) {
            // Satellite body
            const bodyGeometry = new THREE.BoxGeometry(0.05, 0.02, 0.05);
            const bodyMaterial = new THREE.MeshPhongMaterial({ 
                color: 0xcccccc,
                shininess: 100
            });
            const satellite = new THREE.Mesh(bodyGeometry, bodyMaterial);
            
            // Solar panels
            const panelGeometry = new THREE.BoxGeometry(0.15, 0.01, 0.08);
            const panelMaterial = new THREE.MeshPhongMaterial({ 
                color: 0x1a4d80,
                shininess: 50
            });
            const leftPanel = new THREE.Mesh(panelGeometry, panelMaterial);
            const rightPanel = new THREE.Mesh(panelGeometry, panelMaterial);
            
            leftPanel.position.x = -0.1;
            rightPanel.position.x = 0.1;
            satellite.add(leftPanel);
            satellite.add(rightPanel);
            
            // Position in orbit
            const angle = (i / satelliteCount) * Math.PI * 2;
            const inclination = (i % 3) * 0.3;
            
            satellite.position.x = Math.cos(angle) * orbitRadius;
            satellite.position.z = Math.sin(angle) * orbitRadius;
            satellite.position.y = Math.sin(inclination) * 0.2;
            
            // Store satellite data
            this.satellites.push({
                mesh: satellite,
                angle: angle,
                speed: 0.005 + Math.random() * 0.01,
                radius: orbitRadius + Math.random() * 0.2,
                inclination: inclination,
                data: {
                    name: `Orbital Data Center ${i + 1}`,
                    capacity: `${(10 + Math.random() * 90).toFixed(0)} PB`,
                    power: `${(50 + Math.random() * 450).toFixed(0)} kW`,
                    altitude: `${(500 + Math.random() * 1000).toFixed(0)} km`
                }
            });
            
            this.scene.add(satellite);
        }
    }
    
    setupMouseControls() {
        const container = document.getElementById('earth-container');
        let isDragging = false;
        let previousMousePosition = { x: 0, y: 0 };
        
        container.addEventListener('mousedown', (e) => {
            isDragging = true;
            previousMousePosition = { x: e.clientX, y: e.clientY };
        });
        
        container.addEventListener('mousemove', (e) => {
            if (!isDragging) {
                this.checkSatelliteHover(e);
                return;
            }
            
            const deltaMove = {
                x: e.clientX - previousMousePosition.x,
                y: e.clientY - previousMousePosition.y
            };
            
            if (this.earth) {
                this.earth.rotation.y += deltaMove.x * 0.01;
                this.earth.rotation.x += deltaMove.y * 0.01;
            }
            
            previousMousePosition = { x: e.clientX, y: e.clientY };
        });
        
        container.addEventListener('mouseup', () => {
            isDragging = false;
        });
        
        container.addEventListener('mouseleave', () => {
            isDragging = false;
        });
        
        // Zoom with scroll
        container.addEventListener('wheel', (e) => {
            e.preventDefault();
            const zoomSpeed = 0.1;
            this.camera.position.z += e.deltaY * zoomSpeed;
            this.camera.position.z = Math.max(1.5, Math.min(5, this.camera.position.z));
        });
    }
    
    checkSatelliteHover(event) {
        const rect = this.renderer.domElement.getBoundingClientRect();
        const mouse = new THREE.Vector2(
            ((event.clientX - rect.left) / rect.width) * 2 - 1,
            -((event.clientY - rect.top) / rect.height) * 2 + 1
        );
        
        const raycaster = new THREE.Raycaster();
        raycaster.setFromCamera(mouse, this.camera);
        
        const satelliteMeshes = this.satellites.map(s => s.mesh);
        const intersects = raycaster.intersectObjects(satelliteMeshes);
        
        if (intersects.length > 0) {
            const hoveredSatellite = this.satellites.find(s => s.mesh === intersects[0].object);
            this.showSatelliteInfo(hoveredSatellite, event);
            document.body.style.cursor = 'pointer';
        } else {
            this.hideSatelliteInfo();
            document.body.style.cursor = 'default';
        }
    }
    
    showSatelliteInfo(satellite, event) {
        let infoPanel = document.getElementById('satellite-info');
        
        if (!infoPanel) {
            infoPanel = document.createElement('div');
            infoPanel.id = 'satellite-info';
            infoPanel.style.cssText = `
                position: fixed;
                background: rgba(0, 5, 20, 0.95);
                backdrop-filter: blur(10px);
                border: 1px solid rgba(0, 212, 255, 0.3);
                border-radius: 10px;
                padding: 1rem;
                color: white;
                font-size: 0.9rem;
                z-index: 1000;
                pointer-events: none;
                transition: opacity 0.3s ease;
            `;
            document.body.appendChild(infoPanel);
        }
        
        infoPanel.innerHTML = `
            <div style="font-weight: 600; margin-bottom: 0.5rem; color: #00d4ff;">${satellite.data.name}</div>
            <div>Storage: ${satellite.data.capacity}</div>
            <div>Power: ${satellite.data.power}</div>
            <div>Altitude: ${satellite.data.altitude}</div>
        `;
        
        infoPanel.style.left = Math.min(event.clientX + 10, window.innerWidth - 200) + 'px';
        infoPanel.style.top = Math.min(event.clientY + 10, window.innerHeight - 100) + 'px';
        infoPanel.style.opacity = '1';
    }
    
    hideSatelliteInfo() {
        const infoPanel = document.getElementById('satellite-info');
        if (infoPanel) {
            infoPanel.style.opacity = '0';
        }
    }
    
    animate() {
        requestAnimationFrame(() => this.animate());
        
        // Rotate earth
        if (this.earth) {
            this.earth.rotation.y += 0.002;
        }
        
        // Animate satellites
        this.satellites.forEach(satellite => {
            satellite.angle += satellite.speed;
            satellite.mesh.position.x = Math.cos(satellite.angle) * satellite.radius;
            satellite.mesh.position.z = Math.sin(satellite.angle) * satellite.radius;
            satellite.mesh.position.y = Math.sin(satellite.angle * 2 + satellite.inclination) * 0.1;
            
            // Rotate satellite
            satellite.mesh.rotation.y += 0.01;
        });
        
        this.renderer.render(this.scene, this.camera);
    }
    
    setupScrollAnimations() {
        const observerOptions = {
            threshold: 0.1,
            rootMargin: '0px 0px -50px 0px'
        };
        
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('fade-in');
                }
            });
        }, observerOptions);
        
        // Observe elements for animation
        document.querySelectorAll('.hero-title, .hero-subtitle, .hero-description, .cta-button').forEach(el => {
            observer.observe(el);
        });
        
        document.querySelectorAll('.section-text, .stat-card, .solution-content, .solution-card').forEach(el => {
            observer.observe(el);
        });
        
        // Parallax effect for background
        window.addEventListener('scroll', () => {
            const scrolled = window.pageYOffset;
            const parallaxElements = document.querySelectorAll('.starfield');
            
            parallaxElements.forEach(element => {
                const speed = 0.5;
                element.style.transform = `translateY(${scrolled * speed}px)`;
            });
        });
    }
    
    setupInteractions() {
        // Animate statistics on hover
        document.querySelectorAll('.stat-card').forEach(card => {
            card.addEventListener('mouseenter', () => {
                const value = card.querySelector('.stat-value');
                anime({
                    targets: value,
                    scale: [1, 1.2, 1],
                    duration: 600,
                    easing: 'easeOutElastic(1, .8)'
                });
            });
        });
        
        // Solution cards hover effects
        document.querySelectorAll('.solution-card').forEach(card => {
            card.addEventListener('mouseenter', () => {
                anime({
                    targets: card,
                    scale: [1, 1.05],
                    duration: 300,
                    easing: 'easeOutQuad'
                });
            });
            
            card.addEventListener('mouseleave', () => {
                anime({
                    targets: card,
                    scale: [1.05, 1],
                    duration: 300,
                    easing: 'easeOutQuad'
                });
            });
        });
        
        // Split text animations
        if (typeof Splitting !== 'undefined') {
            Splitting();
            
            document.querySelectorAll('[data-splitting]').forEach(element => {
                const chars = element.querySelectorAll('.char');
                anime({
                    targets: chars,
                    opacity: [0, 1],
                    translateY: [50, 0],
                    delay: anime.stagger(50),
                    duration: 800,
                    easing: 'easeOutExpo'
                });
            });
        }
    }
    
    startAnimations() {
        // Hero section animations
        anime.timeline()
            .add({
                targets: '.hero-title',
                opacity: [0, 1],
                translateY: [50, 0],
                duration: 1000,
                easing: 'easeOutExpo'
            })
            .add({
                targets: '.hero-subtitle',
                opacity: [0, 1],
                translateY: [30, 0],
                duration: 800,
                easing: 'easeOutExpo'
            }, '-=500')
            .add({
                targets: '.hero-description',
                opacity: [0, 1],
                translateY: [20, 0],
                duration: 600,
                easing: 'easeOutExpo'
            }, '-=400')
            .add({
                targets: '.cta-button',
                opacity: [0, 1],
                translateY: [20, 0],
                scale: [0.8, 1],
                duration: 500,
                easing: 'easeOutBack'
            }, '-=300');
    }
    
    setupResponsive() {
        window.addEventListener('resize', () => {
            // Update 3D renderer size
            if (this.renderer && this.camera) {
                const container = document.getElementById('earth-container');
                this.camera.aspect = container.clientWidth / container.clientHeight;
                this.camera.updateProjectionMatrix();
                this.renderer.setSize(container.clientWidth, container.clientHeight);
            }
        });
    }
}

// Initialize the application
document.addEventListener('DOMContentLoaded', () => {
    new OrbitalDataCenters();
});

// Smooth scrolling for navigation links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            target.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        }
    });
});

// Add particle system for data streams
class DataStreamParticles {
    constructor() {
        this.particles = [];
        this.init();
    }
    
    init() {
        new p5((p) => {
            p.setup = () => {
                const canvas = p.createCanvas(p.windowWidth, p.windowHeight);
                canvas.parent('particle-container');
                canvas.style('position', 'fixed');
                canvas.style('top', '0');
                canvas.style('left', '0');
                canvas.style('pointer-events', 'none');
                canvas.style('z-index', '5');
                
                // Initialize particles
                for (let i = 0; i < 50; i++) {
                    this.particles.push({
                        x: p.random(p.width),
                        y: p.random(p.height),
                        vx: p.random(-1, 1),
                        vy: p.random(-1, 1),
                        life: p.random(0.5, 1),
                        size: p.random(2, 6)
                    });
                }
            };
            
            p.draw = () => {
                p.clear();
                
                // Update and draw particles
                this.particles.forEach((particle, index) => {
                    particle.x += particle.vx;
                    particle.y += particle.vy;
                    particle.life -= 0.01;
                    
                    if (particle.life <= 0) {
                        particle.x = p.random(p.width);
                        particle.y = p.random(p.height);
                        particle.life = 1;
                    }
                    
                    // Draw particle
                    p.fill(0, 212, 255, particle.life * 255);
                    p.noStroke();
                    p.ellipse(particle.x, particle.y, particle.size);
                });
            };
            
            p.windowResized = () => {
                p.resizeCanvas(p.windowWidth, p.windowHeight);
            };
        });
    }
}

// Initialize particle system
const particleContainer = document.createElement('div');
particleContainer.id = 'particle-container';
document.body.appendChild(particleContainer);
new DataStreamParticles();