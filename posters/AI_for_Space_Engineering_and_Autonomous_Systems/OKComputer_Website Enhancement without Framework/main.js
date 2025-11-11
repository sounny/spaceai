// Main JavaScript for AI Orbital Data Centers Website

// Initialize everything when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    initializeAnimations();
    initializeCounters();
    initializeCharts();
    initializeOrbitalSimulator();
    initializeScrollReveal();
    initializeParticles();
});

// Typewriter effect for hero heading
function initializeAnimations() {
    const typed = new Typed('#typed-heading', {
        strings: [
            'AI Orbital Data Centers',
            'The Future of Computing',
            'Sustainable Space Infrastructure',
            'Next-Generation Cloud'
        ],
        typeSpeed: 60,
        backSpeed: 30,
        backDelay: 2000,
        loop: true,
        showCursor: true,
        cursorChar: '|'
    });
}

// Animated counters
function initializeCounters() {
    const counters = document.querySelectorAll('.counter');
    const observerOptions = {
        threshold: 0.5,
        rootMargin: '0px 0px -100px 0px'
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const counter = entry.target;
                const target = parseInt(counter.getAttribute('data-target'));
                animateCounter(counter, target);
                observer.unobserve(counter);
            }
        });
    }, observerOptions);

    counters.forEach(counter => observer.observe(counter));
}

function animateCounter(element, target) {
    let current = 0;
    const increment = target / 60; // 60 frames for smooth animation
    
    const timer = setInterval(() => {
        current += increment;
        if (current >= target) {
            current = target;
            clearInterval(timer);
        }
        element.textContent = Math.floor(current);
    }, 16); // ~60fps
}

// Initialize charts
function initializeCharts() {
    initializeLatencyChart();
    initializeSustainabilityChart();
    initializeNetworkVisualization();
}

// Latency comparison chart
function initializeLatencyChart() {
    const chartDom = document.getElementById('latency-chart');
    if (!chartDom) return;
    
    const myChart = echarts.init(chartDom);
    
    const option = {
        backgroundColor: 'transparent',
        title: {
            text: 'Latency Comparison (ms)',
            textStyle: {
                color: '#F4A261',
                fontSize: 18
            }
        },
        tooltip: {
            trigger: 'axis',
            backgroundColor: 'rgba(0, 0, 0, 0.8)',
            borderColor: '#F4A261',
            textStyle: {
                color: '#fff'
            }
        },
        legend: {
            data: ['Terrestrial Fiber', 'LEO Orbital', 'GEO Satellite'],
            textStyle: {
                color: '#fff'
            }
        },
        xAxis: {
            type: 'category',
            data: ['New York ↔ London', 'Los Angeles ↔ Tokyo', 'Sydney ↔ Mumbai', 'São Paulo ↔ Lagos'],
            axisLabel: {
                color: '#fff',
                rotate: 45
            },
            axisLine: {
                lineStyle: {
                    color: '#6B7280'
                }
            }
        },
        yAxis: {
            type: 'value',
            name: 'Latency (ms)',
            nameTextStyle: {
                color: '#fff'
            },
            axisLabel: {
                color: '#fff'
            },
            axisLine: {
                lineStyle: {
                    color: '#6B7280'
                }
            },
            splitLine: {
                lineStyle: {
                    color: 'rgba(255, 255, 255, 0.1)'
                }
            }
        },
        series: [
            {
                name: 'Terrestrial Fiber',
                type: 'bar',
                data: [75, 150, 180, 210],
                itemStyle: {
                    color: '#E76F51'
                }
            },
            {
                name: 'LEO Orbital',
                type: 'bar',
                data: [25, 45, 65, 55],
                itemStyle: {
                    color: '#F4A261'
                }
            },
            {
                name: 'GEO Satellite',
                type: 'bar',
                data: [250, 280, 320, 290],
                itemStyle: {
                    color: '#6B7280'
                }
            }
        ]
    };
    
    myChart.setOption(option);
    
    // Responsive resize
    window.addEventListener('resize', () => {
        myChart.resize();
    });
}

// Sustainability impact chart
function initializeSustainabilityChart() {
    const chartDom = document.getElementById('sustainability-chart');
    if (!chartDom) return;
    
    const myChart = echarts.init(chartDom);
    
    const option = {
        backgroundColor: 'transparent',
        title: {
            text: 'Environmental Impact Comparison',
            textStyle: {
                color: '#F4A261',
                fontSize: 18
            }
        },
        tooltip: {
            trigger: 'axis',
            backgroundColor: 'rgba(0, 0, 0, 0.8)',
            borderColor: '#F4A261',
            textStyle: {
                color: '#fff'
            }
        },
        legend: {
            data: ['Ground Stations', 'Orbital Network'],
            textStyle: {
                color: '#fff'
            }
        },
        radar: {
            indicator: [
                { name: 'Energy Usage', max: 100 },
                { name: 'Water Consumption', max: 100 },
                { name: 'Carbon Emissions', max: 100 },
                { name: 'Land Usage', max: 100 },
                { name: 'Maintenance', max: 100 }
            ],
            axisName: {
                color: '#fff'
            },
            axisLine: {
                lineStyle: {
                    color: 'rgba(255, 255, 255, 0.3)'
                }
            },
            splitLine: {
                lineStyle: {
                    color: 'rgba(255, 255, 255, 0.1)'
                }
            }
        },
        series: [{
            name: 'Environmental Impact',
            type: 'radar',
            data: [
                {
                    value: [85, 95, 80, 90, 75],
                    name: 'Ground Stations',
                    itemStyle: {
                        color: '#E76F51'
                    },
                    areaStyle: {
                        color: 'rgba(231, 111, 81, 0.3)'
                    }
                },
                {
                    value: [20, 5, 15, 10, 30],
                    name: 'Orbital Network',
                    itemStyle: {
                        color: '#F4A261'
                    },
                    areaStyle: {
                        color: 'rgba(244, 162, 97, 0.3)'
                    }
                }
            ]
        }]
    };
    
    myChart.setOption(option);
    
    window.addEventListener('resize', () => {
        myChart.resize();
    });
}

// Network visualization
function initializeNetworkVisualization() {
    const chartDom = document.getElementById('network-viz');
    if (!chartDom) return;
    
    const myChart = echarts.init(chartDom);
    
    // Generate network nodes
    const nodes = [];
    const links = [];
    
    // Create satellite nodes
    for (let i = 0; i < 20; i++) {
        nodes.push({
            id: `sat-${i}`,
            name: `SAT-${i}`,
            x: Math.random() * 800,
            y: Math.random() * 300,
            symbolSize: Math.random() * 20 + 10,
            itemStyle: {
                color: '#F4A261'
            }
        });
    }
    
    // Create ground stations
    for (let i = 0; i < 5; i++) {
        nodes.push({
            id: `ground-${i}`,
            name: `Ground-${i}`,
            x: Math.random() * 800,
            y: 350 + Math.random() * 50,
            symbolSize: 25,
            itemStyle: {
                color: '#E76F51'
            }
        });
    }
    
    // Create links
    for (let i = 0; i < nodes.length; i++) {
        for (let j = i + 1; j < nodes.length; j++) {
            if (Math.random() > 0.8) {
                links.push({
                    source: nodes[i].id,
                    target: nodes[j].id,
                    lineStyle: {
                        color: 'rgba(244, 162, 97, 0.3)',
                        width: Math.random() * 3 + 1
                    }
                });
            }
        }
    }
    
    const option = {
        backgroundColor: 'transparent',
        series: [{
            type: 'graph',
            layout: 'none',
            animation: true,
            roam: true,
            data: nodes,
            links: links,
            emphasis: {
                focus: 'adjacency',
                lineStyle: {
                    width: 5
                }
            }
        }]
    };
    
    myChart.setOption(option);
    
    window.addEventListener('resize', () => {
        myChart.resize();
    });
}

// Orbital simulator
function initializeOrbitalSimulator() {
    const simContainer = document.getElementById('orbital-sim');
    if (!simContainer) return;
    
    let satellites = [];
    let connections = [];
    
    // Initialize satellites
    function createSatellite(id, x, y) {
        const sat = document.createElement('div');
        sat.className = 'satellite-node';
        sat.style.left = x + 'px';
        sat.style.top = y + 'px';
        sat.id = 'sat-' + id;
        simContainer.appendChild(sat);
        
        return {
            id: id,
            element: sat,
            x: x,
            y: y,
            vx: (Math.random() - 0.5) * 2,
            vy: (Math.random() - 0.5) * 2,
            active: true
        };
    }
    
    // Create initial satellites
    for (let i = 0; i < 15; i++) {
        const x = Math.random() * (simContainer.offsetWidth - 20);
        const y = Math.random() * (simContainer.offsetHeight - 20);
        satellites.push(createSatellite(i, x, y));
    }
    
    // Animation loop
    function animate() {
        satellites.forEach(sat => {
            if (sat.active) {
                sat.x += sat.vx;
                sat.y += sat.vy;
                
                // Bounce off walls
                if (sat.x <= 0 || sat.x >= simContainer.offsetWidth - 20) {
                    sat.vx *= -1;
                }
                if (sat.y <= 0 || sat.y >= simContainer.offsetHeight - 20) {
                    sat.vy *= -1;
                }
                
                // Keep in bounds
                sat.x = Math.max(0, Math.min(simContainer.offsetWidth - 20, sat.x));
                sat.y = Math.max(0, Math.min(simContainer.offsetHeight - 20, sat.y));
                
                sat.element.style.left = sat.x + 'px';
                sat.element.style.top = sat.y + 'px';
            }
        });
        
        requestAnimationFrame(animate);
    }
    
    animate();
    
    // Update metrics periodically
    setInterval(() => {
        const activeCount = satellites.filter(sat => sat.active).length;
        document.getElementById('active-satellites').textContent = activeCount;
        
        const throughput = (Math.random() * 5 + 1).toFixed(1);
        document.getElementById('data-throughput').textContent = throughput + ' GB/s';
        
        const efficiency = (Math.random() * 10 + 90).toFixed(1);
        document.getElementById('network-efficiency').textContent = efficiency + '%';
    }, 2000);
    
    // Make functions global for button controls
    window.simulateFault = function() {
        const inactiveSats = satellites.filter(sat => !sat.active);
        if (inactiveSats.length > 0) {
            const sat = inactiveSats[Math.floor(Math.random() * inactiveSats.length)];
            sat.active = true;
            sat.element.style.backgroundColor = '#F4A261';
        } else {
            const activeSats = satellites.filter(sat => sat.active);
            if (activeSats.length > 5) {
                const sat = activeSats[Math.floor(Math.random() * activeSats.length)];
                sat.active = false;
                sat.element.style.backgroundColor = '#6B7280';
            }
        }
    };
    
    window.optimizeNetwork = function() {
        satellites.forEach(sat => {
            if (sat.active) {
                sat.vx *= 0.8;
                sat.vy *= 0.8;
            }
        });
    };
    
    window.addSatellite = function() {
        if (satellites.length < 25) {
            const x = Math.random() * (simContainer.offsetWidth - 20);
            const y = Math.random() * (simContainer.offsetHeight - 20);
            satellites.push(createSatellite(satellites.length, x, y));
        }
    };
}

// Scroll reveal animation
function initializeScrollReveal() {
    const revealElements = document.querySelectorAll('.scroll-reveal');
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('revealed');
            }
        });
    }, {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    });
    
    revealElements.forEach(element => {
        observer.observe(element);
    });
}

// Particles system
function initializeParticles() {
    const container = document.getElementById('particles-container');
    if (!container) return;
    
    for (let i = 0; i < 50; i++) {
        createParticle(container);
    }
}

function createParticle(container) {
    const particle = document.createElement('div');
    particle.className = 'orbital-particle';
    
    // Random position
    particle.style.left = Math.random() * 100 + '%';
    particle.style.top = Math.random() * 100 + '%';
    
    // Random animation delay
    particle.style.animationDelay = Math.random() * 6 + 's';
    particle.style.animationDuration = (Math.random() * 4 + 4) + 's';
    
    container.appendChild(particle);
    
    // Remove and recreate particle after animation
    setTimeout(() => {
        if (particle.parentNode) {
            particle.parentNode.removeChild(particle);
            createParticle(container);
        }
    }, (Math.random() * 4000 + 4000));
}

// Smooth scrolling function
function scrollToSection(sectionId) {
    const element = document.getElementById(sectionId);
    if (element) {
        element.scrollIntoView({
            behavior: 'smooth',
            block: 'start'
        });
    }
}

// Add hover effects to cards
document.addEventListener('DOMContentLoaded', function() {
    const cards = document.querySelectorAll('.card-hover');
    
    cards.forEach(card => {
        card.addEventListener('mouseenter', function() {
            anime({
                targets: this,
                scale: 1.05,
                rotateX: 5,
                duration: 300,
                easing: 'easeOutCubic'
            });
        });
        
        card.addEventListener('mouseleave', function() {
            anime({
                targets: this,
                scale: 1,
                rotateX: 0,
                duration: 300,
                easing: 'easeOutCubic'
            });
        });
    });
});

// Add click effects to buttons
document.addEventListener('click', function(e) {
    if (e.target.tagName === 'BUTTON') {
        anime({
            targets: e.target,
            scale: [1, 0.95, 1],
            duration: 200,
            easing: 'easeOutCubic'
        });
    }
});

// Navigation highlighting
window.addEventListener('scroll', function() {
    const sections = document.querySelectorAll('section[id]');
    const navLinks = document.querySelectorAll('nav a[href^="#"]');
    
    let current = '';
    sections.forEach(section => {
        const sectionTop = section.offsetTop;
        const sectionHeight = section.clientHeight;
        if (scrollY >= (sectionTop - 200)) {
            current = section.getAttribute('id');
        }
    });
    
    navLinks.forEach(link => {
        link.classList.remove('text-white');
        link.classList.add('text-gray-300');
        if (link.getAttribute('href') === '#' + current) {
            link.classList.remove('text-gray-300');
            link.classList.add('text-white');
        }
    });
});