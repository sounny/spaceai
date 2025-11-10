// Enhanced AI Orbital Data Centers - Main JavaScript
class EnhancedOrbitalDataCenters {
    constructor() {
        this.scene = null;
        this.camera = null;
        this.renderer = null;
        this.earth = null;
        this.satellites = [];
        this.starfield = null;
        this.isLoaded = false;
        this.currentOrbit = 'leo';
        this.dataLaunchTriggered = false;
        
        this.orbitalData = {
            leo: {
                title: 'Low Earth Orbit (LEO)',
                altitude: '200-2,000 km',
                latency: '25-88ms',
                description: 'Ideal for real-time AI processing, edge computing, and low-latency applications. Starlink and similar constellations operate here, providing global coverage with minimal signal delay for time-sensitive workloads.'
            },
            meo: {
                title: 'Medium Earth Orbit (MEO)',
                altitude: '2,000-35,786 km',
                latency: '125-250ms',
                description: 'Perfect balance between coverage area and latency. GPS and communication satellites use MEO for regional coverage with moderate signal delay, suitable for batch processing and data synchronization.'
            },
            geo: {
                title: 'Geostationary Orbit (GEO)',
                altitude: '35,786 km',
                latency: '250-300ms',
                description: 'Fixed position relative to Earth enables continuous coverage of specific regions. Ideal for data archiving, backup systems, and applications where latency is less critical than persistent availability.'
            }
        };
        
        this.init();
    }
    
    init() {
        this.setupLoading();
        this.setupStarfield();
        this.setup3DEarth();
        this.setupDataCenters();
        this.setupDataLaunch();
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
            }, 2000);
        });
    }
    
    setupStarfield() {
        const starfieldContainer = document.getElementById('starfield');
        
        // Create enhanced starfield using p5.js
        new p5((p) => {
            let stars = [];
            const numStars = 300;
            
            p.setup = () => {
                const canvas = p.createCanvas(p.windowWidth, p.windowHeight);
                canvas.parent('starfield');
                
                // Initialize stars with varying properties
                for (let i = 0; i < numStars; i++) {
                    stars.push({
                        x: p.random(p.width),
                        y: p.random(p.height),
                        size: p.random(1, 4),
                        brightness: p.random(0.2, 1),
                        twinkleSpeed: p.random(0.01, 0.04),
                        color: p.random(['white', 'blue', 'yellow'])
                    });
                }
            };
            
            p.draw = () => {
                p.clear();
                
                // Draw twinkling stars with different colors
                stars.forEach(star => {
                    star.brightness += p.sin(p.frameCount * star.twinkleSpeed) * 0.1;
                    star.brightness = p.constrain(star.brightness, 0.1, 1);
                    
                    let color;
                    switch(star.color) {
                        case 'blue':
                            color = p.color(100, 150, 255, star.brightness * 255);
                            break;
                        case 'yellow':
                            color = p.color(255, 215, 0, star.brightness * 255);
                            break;
                        default:
                            color = p.color(255, 255, 255, star.brightness * 255);
                    }
                    
                    p.fill(color);
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
        const ambientLight = new THREE.AmbientLight(0x404040, 0.4);
        this.scene.add(ambientLight);
        
        const directionalLight = new THREE.DirectionalLight(0xffffff, 1.2);
        directionalLight.position.set(5, 3, 5);
        this.scene.add(directionalLight);
        
        // Create Earth with enhanced textures
        this.createEnhancedEarth();
        
        // Create orbital rings
        this.createOrbitalRings();
        
        // Create satellites
        this.createEnhancedSatellites();
        
        // Position camera
        this.camera.position.set(0, 3, 8);
        this.camera.lookAt(0, 0, 0);
        
        // Start animation loop
        this.animate();
        
        // Setup mouse controls
        this.setupMouseControls();
    }
    
    createEnhancedEarth() {
        const geometry = new THREE.SphereGeometry(1, 128, 128);
        
        // Create more realistic earth texture
        const canvas = document.createElement('canvas');
        canvas.width = 4096;
        canvas.height = 2048;
        const ctx = canvas.getContext('2d');
        
        // Create earth-like texture with continents
        const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
        gradient.addColorStop(0, '#4a90e2');
        gradient.addColorStop(0.3, '#2e5c8a');
        gradient.addColorStop(0.7, '#1e3a5f');
        gradient.addColorStop(1, '#0f1d2f');
        
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        // Add continents
        ctx.fillStyle = '#2d5016';
        for (let i = 0; i < 50; i++) {
            const x = Math.random() * canvas.width;
            const y = Math.random() * canvas.height;
            const radius = Math.random() * 200 + 100;
            ctx.beginPath();
            ctx.arc(x, y, radius, 0, Math.PI * 2);
            ctx.fill();
        }
        
        // Add some clouds
        ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
        for (let i = 0; i < 30; i++) {
            const x = Math.random() * canvas.width;
            const y = Math.random() * canvas.height;
            const radius = Math.random() * 80 + 40;
            ctx.beginPath();
            ctx.arc(x, y, radius, 0, Math.PI * 2);
            ctx.fill();
        }
        
        const texture = new THREE.CanvasTexture(canvas);
        const material = new THREE.MeshPhongMaterial({ 
            map: texture,
            shininess: 50,
            transparent: true,
            opacity: 0.9
        });
        
        this.earth = new THREE.Mesh(geometry, material);
        this.scene.add(this.earth);
        
        // Add atmosphere
        const atmosphereGeometry = new THREE.SphereGeometry(1.05, 64, 64);
        const atmosphereMaterial = new THREE.MeshBasicMaterial({
            color: 0x4a90e2,
            transparent: true,
            opacity: 0.2,
            side: THREE.BackSide
        });
        const atmosphere = new THREE.Mesh(atmosphereGeometry, atmosphereMaterial);
        this.scene.add(atmosphere);
    }
    
    createOrbitalRings() {
        // LEO Ring
        const leoGeometry = new THREE.RingGeometry(1.8, 1.82, 128);
        const leoMaterial = new THREE.MeshBasicMaterial({
            color: 0x00d4ff,
            transparent: true,
            opacity: 0.4,
            side: THREE.DoubleSide
        });
        this.leoRing = new THREE.Mesh(leoGeometry, leoMaterial);
        this.leoRing.rotation.x = Math.PI / 2;
        this.scene.add(this.leoRing);
        
        // MEO Ring
        const meoGeometry = new THREE.RingGeometry(3, 3.02, 128);
        const meoMaterial = new THREE.MeshBasicMaterial({
            color: 0xffd700,
            transparent: true,
            opacity: 0.3,
            side: THREE.DoubleSide
        });
        this.meoRing = new THREE.Mesh(meoGeometry, meoMaterial);
        this.meoRing.rotation.x = Math.PI / 2;
        this.scene.add(this.meoRing);
        
        // GEO Ring
        const geoGeometry = new THREE.RingGeometry(5, 5.02, 128);
        const geoMaterial = new THREE.MeshBasicMaterial({
            color: 0xff6b6b,
            transparent: true,
            opacity: 0.2,
            side: THREE.DoubleSide
        });
        this.geoRing = new THREE.Mesh(geoGeometry, geoMaterial);
        this.geoRing.rotation.x = Math.PI / 2;
        this.scene.add(this.geoRing);
    }
    
    createEnhancedSatellites() {
        this.satellites = { leo: [], meo: [], geo: [] };
        
        // LEO Satellites (more numerous, smaller)
        for (let i = 0; i < 12; i++) {
            const satellite = this.createSatellite(0x00d4ff, 1.8);
            const angle = (i / 12) * Math.PI * 2;
            const inclination = (i % 4) * 0.2;
            satellite.position.x = Math.cos(angle) * 1.8;
            satellite.position.z = Math.sin(angle) * 1.8;
            satellite.position.y = Math.sin(inclination) * 0.1;
            
            this.satellites.leo.push({ 
                mesh: satellite, 
                angle: angle, 
                speed: 0.015,
                radius: 1.8,
                inclination: inclination,
                data: {
                    name: `LEO Data Center ${i + 1}`,
                    capacity: `${(50 + Math.random() * 100).toFixed(0)} PB`,
                    power: `${(100 + Math.random() * 400).toFixed(0)} kW`,
                    altitude: `${(400 + Math.random() * 800).toFixed(0)} km`,
                    latency: `${(25 + Math.random() * 30).toFixed(0)}ms`
                }
            });
            this.scene.add(satellite);
        }
        
        // MEO Satellites (medium number, medium size)
        for (let i = 0; i < 8; i++) {
            const satellite = this.createSatellite(0xffd700, 3);
            const angle = (i / 8) * Math.PI * 2;
            satellite.position.x = Math.cos(angle) * 3;
            satellite.position.z = Math.sin(angle) * 3;
            
            this.satellites.meo.push({ 
                mesh: satellite, 
                angle: angle, 
                speed: 0.008,
                radius: 3,
                data: {
                    name: `MEO Data Center ${i + 1}`,
                    capacity: `${(200 + Math.random() * 300).toFixed(0)} PB`,
                    power: `${(500 + Math.random() * 1000).toFixed(0)} kW`,
                    altitude: `${(10000 + Math.random() * 15000).toFixed(0)} km`,
                    latency: `${(125 + Math.random() * 50).toFixed(0)}ms`
                }
            });
            this.scene.add(satellite);
        }
        
        // GEO Satellites (fewer, larger)
        for (let i = 0; i < 4; i++) {
            const satellite = this.createSatellite(0xff6b6b, 5);
            const angle = (i / 4) * Math.PI * 2;
            satellite.position.x = Math.cos(angle) * 5;
            satellite.position.z = Math.sin(angle) * 5;
            
            this.satellites.geo.push({ 
                mesh: satellite, 
                angle: angle, 
                speed: 0.003,
                radius: 5,
                data: {
                    name: `GEO Data Center ${i + 1}`,
                    capacity: `${(500 + Math.random() * 500).toFixed(0)} PB`,
                    power: `${(1000 + Math.random() * 2000).toFixed(0)} kW`,
                    altitude: '35,786 km',
                    latency: `${(250 + Math.random() * 50).toFixed(0)}ms`
                }
            });
            this.scene.add(satellite);
        }
    }
    
    createSatellite(color, radius) {
        const group = new THREE.Group();
        
        // Main body (different sizes for different orbits)
        const size = radius < 2 ? 0.08 : radius < 4 ? 0.12 : 0.16;
        const bodyGeometry = new THREE.BoxGeometry(size, size * 0.6, size);
        const bodyMaterial = new THREE.MeshPhongMaterial({ 
            color: color,
            shininess: 100,
            emissive: color,
            emissiveIntensity: 0.1
        });
        const body = new THREE.Mesh(bodyGeometry, bodyMaterial);
        group.add(body);
        
        // Solar panels
        const panelWidth = size * 3;
        const panelHeight = size * 1.5;
        const panelGeometry = new THREE.BoxGeometry(panelWidth, 0.02, panelHeight);
        const panelMaterial = new THREE.MeshPhongMaterial({ 
            color: 0x1a4d80,
            shininess: 50,
            emissive: 0x1a4d80,
            emissiveIntensity: 0.05
        });
        const leftPanel = new THREE.Mesh(panelGeometry, panelMaterial);
        const rightPanel = new THREE.Mesh(panelGeometry, panelMaterial);
        leftPanel.position.x = -panelWidth * 0.6;
        rightPanel.position.x = panelWidth * 0.6;
        group.add(leftPanel);
        group.add(rightPanel);
        
        // Antenna/communication array
        const antennaGeometry = new THREE.CylinderGeometry(0.02, 0.02, size * 2);
        const antennaMaterial = new THREE.MeshPhongMaterial({ color: 0xcccccc });
        const antenna = new THREE.Mesh(antennaGeometry, antennaMaterial);
        antenna.position.y = size;
        group.add(antenna);
        
        return group;
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
            this.camera.position.z = Math.max(2, Math.min(12, this.camera.position.z));
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
        
        // Check all satellites
        let allSatellites = [];
        Object.keys(this.satellites).forEach(orbit => {
            allSatellites = allSatellites.concat(this.satellites[orbit]);
        });
        
        const satelliteMeshes = allSatellites.map(s => s.mesh);
        const intersects = raycaster.intersectObjects(satelliteMeshes);
        
        if (intersects.length > 0) {
            const hoveredSatellite = allSatellites.find(s => s.mesh === intersects[0].object.parent);
            if (hoveredSatellite) {
                this.showSatelliteInfo(hoveredSatellite, event);
                document.body.style.cursor = 'pointer';
            }
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
                max-width: 300px;
            `;
            document.body.appendChild(infoPanel);
        }
        
        infoPanel.innerHTML = `
            <div style="font-weight: 600; margin-bottom: 0.5rem; color: #00d4ff;">${satellite.data.name}</div>
            <div>Storage: ${satellite.data.capacity}</div>
            <div>Power: ${satellite.data.power}</div>
            <div>Altitude: ${satellite.data.altitude}</div>
            <div>Latency: ${satellite.data.latency}</div>
        `;
        
        infoPanel.style.left = Math.min(event.clientX + 10, window.innerWidth - 320) + 'px';
        infoPanel.style.top = Math.min(event.clientY + 10, window.innerHeight - 150) + 'px';
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
        Object.keys(this.satellites).forEach(orbitType => {
            this.satellites[orbitType].forEach(satellite => {
                satellite.angle += satellite.speed;
                satellite.mesh.position.x = Math.cos(satellite.angle) * satellite.radius;
                satellite.mesh.position.z = Math.sin(satellite.angle) * satellite.radius;
                
                if (satellite.inclination !== undefined) {
                    satellite.mesh.position.y = Math.sin(satellite.angle * 2 + satellite.inclination) * 0.1;
                }
                
                satellite.mesh.rotation.y += 0.01;
                satellite.mesh.rotation.z += 0.005;
            });
        });
        
        // Animate orbital rings
        if (this.leoRing) this.leoRing.rotation.z += 0.001;
        if (this.meoRing) this.meoRing.rotation.z += 0.0005;
        if (this.geoRing) this.geoRing.rotation.z += 0.0002;
        
        this.renderer.render(this.scene, this.camera);
    }
    
    setupDataCenters() {
        const container = document.getElementById('datacenters-container');
        if (!container) return;
        
        const datacenterCount = 20;
        
        for (let i = 0; i < datacenterCount; i++) {
            const datacenter = document.createElement('div');
            datacenter.className = 'datacenter';
            datacenter.style.left = Math.random() * (window.innerWidth - 80) + 'px';
            datacenter.style.top = Math.random() * (window.innerHeight - 60) + 'px';
            datacenter.style.opacity = '0.7';
            
            container.appendChild(datacenter);
            
            // Animate falling on scroll
            this.animateDatacenterFall(datacenter, i);
        }
    }
    
    animateDatacenterFall(element, index) {
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting && !entry.target.dataset.falling) {
                    entry.target.dataset.falling = 'true';
                    
                    anime({
                        targets: element,
                        translateY: [0, window.innerHeight + 100],
                        rotate: [0, 720],
                        opacity: [0.7, 0],
                        scale: [1, 0.5],
                        duration: 4000,
                        delay: index * 150,
                        easing: 'easeInQuad',
                        complete: () => {
                            element.style.display = 'none';
                            // Trigger data launch animation
                            if (index === 19) { // Last datacenter
                                this.triggerDataLaunch();
                            }
                        }
                    });
                }
            });
        }, { threshold: 0.3 });
        
        observer.observe(element);
    }
    
    setupDataLaunch() {
        const dataLaunch = document.getElementById('data-launch');
        
        // Create data particles (0s and 1s)
        for (let i = 0; i < 100; i++) {
            const particle = document.createElement('div');
            particle.className = 'data-particle';
            particle.textContent = Math.random() > 0.5 ? '0' : '1';
            particle.style.left = Math.random() * window.innerWidth + 'px';
            particle.style.top = window.innerHeight + 'px';
            dataLaunch.appendChild(particle);
        }
    }
    
    triggerDataLaunch() {
        const dataLaunch = document.getElementById('data-launch');
        const particles = dataLaunch.querySelectorAll('.data-particle');
        
        dataLaunch.classList.add('active');
        
        particles.forEach((particle, index) => {
            // Random starting position at bottom
            particle.style.left = Math.random() * window.innerWidth + 'px';
            particle.style.top = window.innerHeight + 'px';
            
            anime({
                targets: particle,
                translateY: [-window.innerHeight * 1.5, 0],
                translateX: [0, (Math.random() - 0.5) * 400],
                opacity: [1, 0.8, 0],
                scale: [0.5, 1, 0.3],
                duration: 4000 + Math.random() * 2000,
                delay: index * 50,
                easing: 'easeOutQuad',
                complete: () => {
                    // Reset particle for potential re-trigger
                    particle.style.top = window.innerHeight + 'px';
                    particle.style.left = Math.random() * window.innerWidth + 'px';
                }
            });
        });
        
        setTimeout(() => {
            dataLaunch.classList.remove('active');
        }, 8000);
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
        document.querySelectorAll('.hero-title, .hero-subtitle, .hero-abstract, .cta-button').forEach(el => {
            observer.observe(el);
        });
        
        document.querySelectorAll('.problem-title, .problem-description, .problem-card, .solution-title, .solution-description, .orbital-visualization, .benefit-card, .ai-title, .ai-description, .ai-feature, .environmental-title, .environmental-card').forEach(el => {
            observer.observe(el);
        });
        
        // Parallax effect for background
        window.addEventListener('scroll', () => {
            const scrolled = window.pageYOffset;
            const parallaxElements = document.querySelectorAll('.starfield');
            
            parallaxElements.forEach(element => {
                const speed = 0.3;
                element.style.transform = `translateY(${scrolled * speed}px)`;
            });
            
            // Trigger data launch on scroll
            if (scrolled > window.innerHeight * 0.5 && !this.dataLaunchTriggered) {
                this.dataLaunchTriggered = true;
                // Small delay to ensure datacenters are falling
                setTimeout(() => {
                    this.triggerDataLaunch();
                }, 2000);
            }
        });
    }
    
    setupInteractions() {
        // Problem card interactions
        document.querySelectorAll('.problem-card').forEach(card => {
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
        
        // Benefit card interactions
        document.querySelectorAll('.benefit-card').forEach(card => {
            card.addEventListener('mouseenter', () => {
                anime({
                    targets: card,
                    scale: [1, 1.02],
                    duration: 300,
                    easing: 'easeOutQuad'
                });
                
                // Add glow effect
                card.classList.add('glow');
            });
            
            card.addEventListener('mouseleave', () => {
                anime({
                    targets: card,
                    scale: [1.02, 1],
                    duration: 300,
                    easing: 'easeOutQuad'
                });
                
                card.classList.remove('glow');
            });
        });
        
        // AI feature interactions
        document.querySelectorAll('.ai-feature').forEach(feature => {
            feature.addEventListener('mouseenter', () => {
                anime({
                    targets: feature,
                    scale: [1, 1.02],
                    duration: 300,
                    easing: 'easeOutQuad'
                });
            });
            
            feature.addEventListener('mouseleave', () => {
                anime({
                    targets: feature,
                    scale: [1.02, 1],
                    duration: 300,
                    easing: 'easeOutQuad'
                });
            });
        });
        
        // Environmental card interactions
        document.querySelectorAll('.environmental-card').forEach(card => {
            card.addEventListener('mouseenter', () => {
                anime({
                    targets: card,
                    scale: [1, 1.02],
                    duration: 300,
                    easing: 'easeOutQuad'
                });
            });
            
            card.addEventListener('mouseleave', () => {
                anime({
                    targets: card,
                    scale: [1.02, 1],
                    duration: 300,
                    easing: 'easeOutQuad'
                });
            });
        });
        
        // Orbital controls
        const orbitButtons = document.querySelectorAll('.orbit-btn');
        const infoPanel = document.getElementById('orbit-info');
        
        orbitButtons.forEach(button => {
            button.addEventListener('click', () => {
                // Update active button
                orbitButtons.forEach(btn => btn.classList.remove('active'));
                button.classList.add('active');
                
                // Update current orbit
                this.currentOrbit = button.dataset.orbit;
                
                // Update info panel
                const data = this.orbitalData[this.currentOrbit];
                infoPanel.innerHTML = `
                    <h3>${data.title}</h3>
                    <p>
                        Altitude: ${data.altitude} | Latency: ${data.latency}<br>
                        ${data.description}
                    </p>
                `;
                infoPanel.classList.add('show');
                
                // Highlight active orbit
                this.highlightOrbit(this.currentOrbit);
                
                // Animate camera to orbit
                this.animateToOrbit(this.currentOrbit);
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
    
    highlightOrbit(orbit) {
        // Reset all rings
        this.leoRing.material.opacity = 0.2;
        this.meoRing.material.opacity = 0.15;
        this.geoRing.material.opacity = 0.1;
        
        // Highlight active ring
        switch(orbit) {
            case 'leo':
                this.leoRing.material.opacity = 0.6;
                break;
            case 'meo':
                this.meoRing.material.opacity = 0.5;
                break;
            case 'geo':
                this.geoRing.material.opacity = 0.4;
                break;
        }
    }
    
    animateToOrbit(orbit) {
        const distances = { leo: 5, meo: 7, geo: 10 };
        const targetDistance = distances[orbit];
        
        anime({
            targets: this.camera.position,
            x: targetDistance * 0.5,
            z: targetDistance,
            duration: 2000,
            easing: 'easeOutQuad',
            update: () => {
                this.camera.lookAt(0, 0, 0);
            }
        });
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
                targets: '.hero-abstract',
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
    new EnhancedOrbitalDataCenters();
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

// Add particle system for enhanced data streams
class EnhancedDataStreamParticles {
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
                for (let i = 0; i < 100; i++) {
                    this.particles.push({
                        x: p.random(p.width),
                        y: p.random(p.height),
                        vx: p.random(-0.5, 0.5),
                        vy: p.random(-0.5, 0.5),
                        life: p.random(0.3, 1),
                        size: p.random(1, 3),
                        color: p.random(['blue', 'yellow', 'white'])
                    });
                }
            };
            
            p.draw = () => {
                p.clear();
                
                // Update and draw particles
                this.particles.forEach((particle, index) => {
                    particle.x += particle.vx;
                    particle.y += particle.vy;
                    particle.life -= 0.005;
                    
                    if (particle.life <= 0) {
                        particle.x = p.random(p.width);
                        particle.y = p.random(p.height);
                        particle.life = 1;
                    }
                    
                    // Wrap around screen
                    if (particle.x < 0) particle.x = p.width;
                    if (particle.x > p.width) particle.x = 0;
                    if (particle.y < 0) particle.y = p.height;
                    if (particle.y > p.height) particle.y = 0;
                    
                    // Draw particle with color
                    let color;
                    switch(particle.color) {
                        case 'blue':
                            color = p.color(0, 212, 255, particle.life * 255);
                            break;
                        case 'yellow':
                            color = p.color(255, 215, 0, particle.life * 255);
                            break;
                        default:
                            color = p.color(255, 255, 255, particle.life * 255);
                    }
                    
                    p.fill(color);
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

// Initialize enhanced particle system
const particleContainer = document.createElement('div');
particleContainer.id = 'particle-container';
document.body.appendChild(particleContainer);
new EnhancedDataStreamParticles();