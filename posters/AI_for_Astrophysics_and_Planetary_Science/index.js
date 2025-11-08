// Chart.js, THREE, and other dependencies are loaded via the import map in index.html.

import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass.js';

let camera, controls, composer, scene, sceneUI, bloomPass, stars;
let starMesh, planetMesh, keplerModel, jwstModel, tessModel;
let transitChart, atmosphereChart;
let liveTransitDepth = 1.0;
let isKeplerInHold = false;
let isTessInHold = false;
let isJwstInHold = false;
let currentPanelMode = 'system'; // 'system' or 'atmosphere'

// --- NEW ORBITAL SYSTEM CONSTANTS ---
const SCIENTIFIC_MIN_AU = 0.2;
const SCIENTIFIC_MAX_AU = 50.0;
const VISUAL_MAX_ORBIT = 40.0; // Planet's visual orbit will not exceed this radius
const ANIMATION_TIME_SCALE = 250; // Increased to make orbital speed differences more apparent

const starTypes = {
    'm-type': { name: 'Red Dwarf (M-type)', visualRadius: 3.0, radiusSolar: 0.35, color: 0xff8866, intensity: 0.7, bloom: { strength: 0.5, radius: 0.4 }, luminosity: 0.04, tempK: 3200, mass: 0.3 },
    'k-type': { name: 'Orange Dwarf (K-type)', visualRadius: 4.0, radiusSolar: 0.8, color: 0xffcc99, intensity: 0.8, bloom: { strength: 0.6, radius: 0.45 }, luminosity: 0.35, tempK: 5000, mass: 0.8 },
    'g-type': { name: 'Sun-like (G-type)', visualRadius: 5.0, radiusSolar: 1.0, color: 0xffffff, intensity: 0.9, bloom: { strength: 0.7, radius: 0.5 }, luminosity: 1, tempK: 5778, mass: 1 },
    'f-type': { name: 'Procyon-like (F-type)', visualRadius: 6.0, radiusSolar: 1.3, color: 0xf8f8ff, intensity: 1.0, bloom: { strength: 0.9, radius: 0.6 }, luminosity: 7, tempK: 6500, mass: 1.4 },
    'b-type': { name: 'Blue Giant (B-type)', visualRadius: 8.0, radiusSolar: 4.0, color: 0xaaccff, intensity: 1.2, bloom: { strength: 1.1, radius: 0.7 }, luminosity: 100, tempK: 12000, mass: 5.0 },
};

const planetPresets = {
    'mercury': { name: 'Mercury', radius: 0.034, density: 5.43, orbitRadius: 0.387 },
    'earth':   { name: 'Earth', radius: 0.089, density: 5.51, orbitRadius: 1.0 },
    'mars':    { name: 'Mars', radius: 0.047, density: 3.93, orbitRadius: 1.52 },
    'jupiter': { name: 'Jupiter', radius: 1.0,   density: 1.33, orbitRadius: 5.20 },
};

const initialSystemData = {
  id: 'alpha',
  star: {
    type: 'g-type',
  },
  planet: {
    radius: planetPresets.earth.radius,
    density: planetPresets.earth.density,
    orbitRadius: planetPresets.earth.orbitRadius,
    textureType: 'rocky',
    animationSpeed: 1.0
  },
  position: [0, 0, 0]
};

let interactiveSystemState = JSON.parse(JSON.stringify(initialSystemData));

// --- NEW ATMOSPHERE STATE ---
const GAS_PROPERTIES = {
    'N₂':  { molarMass: 28.014, features: [] },
    'O₂':  { molarMass: 31.998, features: [[690, 4, 20], [760, 6, 25]] },
    'H₂O': { molarMass: 18.015, features: [[940, 6, 50], [1130, 8, 60], [1400, 16, 80], [1900, 14, 90], [2700, 25, 120], [3200, 20, 100]] },
    'CO₂': { molarMass: 44.01,  features: [[1600, 10, 40], [2000, 12, 50], [2700, 24, 70], [4250, 30, 100]] },
    'CH₄': { molarMass: 16.04,  features: [[1660, 12, 60], [2200, 18, 80], [3300, 20, 90]] },
};

const atmospherePresets = {
    'earth': {
        albedo: 0.3, surfacePressure: 1.0, cloudOpacity: 0.4, cloudTopPressure: 0.3,
        gases: { 'N₂': { enabled: true, ppm: 780840 }, 'O₂': { enabled: true, ppm: 209460 }, 'H₂O': { enabled: true, ppm: 4000 }, 'CO₂': { enabled: true, ppm: 410 }, 'CH₄': { enabled: true, ppm: 2 } },
        snr: 25, spectralResolution: 300, activeBand: 'NIR',
    },
    'venus': {
        albedo: 0.75, surfacePressure: 92.0, cloudOpacity: 0.95, cloudTopPressure: 0.1,
        gases: { 'N₂': { enabled: true, ppm: 35000 }, 'O₂': { enabled: false, ppm: 0 }, 'H₂O': { enabled: true, ppm: 20 }, 'CO₂': { enabled: true, ppm: 965000 }, 'CH₄': { enabled: false, ppm: 0 } },
        snr: 20, spectralResolution: 300, activeBand: 'NIR',
    },
    'titan': {
        albedo: 0.22, surfacePressure: 1.5, cloudOpacity: 0.8, cloudTopPressure: 0.2,
        gases: { 'N₂': { enabled: true, ppm: 984000 }, 'O₂': { enabled: false, ppm: 0 }, 'H₂O': { enabled: false, ppm: 0 }, 'CO₂': { enabled: false, ppm: 0 }, 'CH₄': { enabled: true, ppm: 14000 } },
        snr: 15, spectralResolution: 300, activeBand: 'NIR',
    }
};

let atmosphereState = JSON.parse(JSON.stringify(atmospherePresets.earth)); // Start with Earth preset
let derivedPlanetData = {};
let derivedAtmosphereData = {};


document.addEventListener('DOMContentLoaded', () => {
    initThreeScene();
    initPanelControls();
    
    document.getElementById('print-button').addEventListener('click', () => window.print());

    window.addEventListener('scroll', handleMainScroll);
    handleMainScroll(); // Initial call to set states
});

function updateStarBrightness() {
    if (!bloomPass) return;
    // The bloom effect is now configured for a constant and intense glow around the star.
    // A low threshold ensures the glow is stable and not affected by the planet's transit.
    bloomPass.strength = 1.5;
    bloomPass.radius = 0.8;
    bloomPass.threshold = 0.1;
}

function handleMainScroll() {
    const scrollY = window.scrollY;
    const vh = window.innerHeight;

    // --- Part 0: UI Visibility (Landing, Interlude, Main Content) ---
    const landingScreen = document.getElementById('landing-screen');
    const interludeScreen = document.getElementById('interlude-screen');
    const interludeSpacer = document.getElementById('interlude-scroll-spacer');
    const header = document.querySelector('header');
    const keplerSection = document.getElementById('kepler-story-section');
    const jwstSection = document.getElementById('jwst-story-section');
    const footer = document.querySelector('footer');
    const contentTab = document.getElementById('content-tab');

    // Landing screen fades out over first 30vh
    const landingFadeEnd = vh * 0.3;
    const landingScrollProgress = Math.min(1, scrollY / landingFadeEnd);
    landingScreen.style.opacity = 1 - landingScrollProgress;
    landingScreen.style.pointerEvents = landingScrollProgress < 1 ? 'auto' : 'none';

    // Interlude screen fades in and out while scrolling over its spacer
    if (interludeScreen && interludeSpacer) {
        const spacerTop = interludeSpacer.offsetTop;
        const spacerHeight = interludeSpacer.offsetHeight;
        
        // Progress is 0 when spacer top hits viewport bottom, 1 when spacer bottom hits viewport bottom
        const progress = (scrollY - (spacerTop - vh)) / spacerHeight;

        const fadeInEnd = 0.3; // Fade in over first 30%
        const fadeOutStart = 0.7; // Fade out over last 30%
        
        let interludeOpacity = 0;
        if (progress > 0 && progress < fadeInEnd) {
            interludeOpacity = progress / fadeInEnd;
        } else if (progress >= fadeInEnd && progress <= fadeOutStart) {
            interludeOpacity = 1;
        } else if (progress > fadeOutStart && progress <= 1) {
            interludeOpacity = (1 - progress) / (1 - fadeOutStart);
        }
        
        interludeScreen.style.opacity = Math.max(0, Math.min(1, interludeOpacity));
        interludeScreen.style.pointerEvents = interludeOpacity > 0 ? 'auto' : 'none';
    }
    
    // Main content fades in as interlude starts fading out
    const contentFadeStart = interludeSpacer.offsetTop + interludeSpacer.offsetHeight * 0.7;
    const contentFadeDuration = vh * 0.5;
    const contentProgress = (scrollY - contentFadeStart) / contentFadeDuration;
    const contentOpacity = Math.max(0, Math.min(1, contentProgress));
    
    header.style.opacity = contentOpacity;
    keplerSection.style.opacity = contentOpacity;
    jwstSection.style.opacity = contentOpacity;
    footer.style.opacity = contentOpacity;
    contentTab.style.opacity = contentOpacity;

    const headerTitle = document.getElementById('header-title');
    if (headerTitle) {
         headerTitle.classList.toggle('hidden', scrollY < vh * 0.8);
    }
    
    // Easing function for smoother animations
    const easeInOutSine = (t) => (1 - Math.cos(t * Math.PI)) / 2;

    // --- Part 1: Kepler & TESS Animation ---
    if (keplerModel) {
        const keplerPanel = document.getElementById('kepler-info-panel');
        const tessPanel = document.getElementById('tess-info-panel');
        const transitPanel = document.getElementById('transit-info-panel');
        const keplerSectionTop = keplerSection.offsetTop;
        const keplerSectionHeight = keplerSection.offsetHeight;
        const keplerAnimStart = keplerSectionTop - vh * 0.8;
        const keplerAnimEnd = keplerSectionTop + keplerSectionHeight;

        // Keyframes
        const KEP_MOVE_IN_END = 0.15;
        const KEP_PANEL_FADEOUT_START = 0.40;
        const TESS_MOVE_IN_END = 0.55;
        const TESS_PANEL_FADEOUT_START = 0.70;
        const MOVE_OUT_START = 0.70; // Telescopes move out before transit panel
        const MOVE_OUT_END = 0.80;
        const TRANSIT_PANEL_FADEIN_START = 0.80; // Transit panel appears after telescopes are gone

        // Kepler positions & rotations
        const kep_pos_start = new THREE.Vector3(50, 25, -30);
        const kep_rot_start = new THREE.Euler(-0.8, 1.0, -0.2);
        const kep_pos_hold = new THREE.Vector3(35, 20, 0);
        const kep_rot_hold = new THREE.Euler(-0.3 + Math.PI, 2.0, -0.1);
        const kep_pos_end = new THREE.Vector3(-60, 15, 30);
        const kep_rot_end = new THREE.Euler(0.2, 3.5, -0.2);

        // TESS positions & rotations
        const tess_pos_start = new THREE.Vector3(60, -15, 10);
        const tess_rot_start = new THREE.Euler(0.4, -0.5, 0.2);
        const tess_pos_hold = new THREE.Vector3(15, -10, 25);
        const tess_rot_hold = new THREE.Euler(0.2, -0.3, 0.1);
        const tess_pos_end = new THREE.Vector3(-70, 10, 20);
        const tess_rot_end = new THREE.Euler(0.1, 2.5, 0.0);
        
        if (scrollY < keplerAnimStart) {
            keplerModel.position.copy(kep_pos_start);
            keplerModel.rotation.copy(kep_rot_start);
            keplerModel.visible = false;
            if (tessModel) {
                tessModel.position.copy(tess_pos_start);
                tessModel.rotation.copy(tess_rot_start);
                tessModel.visible = false;
            }
            isKeplerInHold = false;
            isTessInHold = false;
        } else if (scrollY < keplerAnimEnd) {
            keplerModel.visible = true;
            let progress = (scrollY - keplerAnimStart) / (keplerSectionHeight - vh);
            progress = Math.max(0, Math.min(1, progress));

            // --- Model Animations ---
            // Kepler
            if (progress <= KEP_MOVE_IN_END) {
                isKeplerInHold = false;
                const eased = easeInOutSine(progress / KEP_MOVE_IN_END);
                keplerModel.position.lerpVectors(kep_pos_start, kep_pos_hold, eased);
                keplerModel.rotation.x = kep_rot_start.x + (kep_rot_hold.x - kep_rot_start.x) * eased;
                keplerModel.rotation.y = kep_rot_start.y + (kep_rot_hold.y - kep_rot_start.y) * eased;
                keplerModel.rotation.z = kep_rot_start.z + (kep_rot_hold.z - kep_rot_start.z) * eased;
            } else if (progress <= MOVE_OUT_START) {
                isKeplerInHold = true;
                keplerModel.position.copy(kep_pos_hold); // Holding animation is done in animate() loop
            } else if (progress <= MOVE_OUT_END) {
                isKeplerInHold = false;
                const eased = easeInOutSine((progress - MOVE_OUT_START) / (MOVE_OUT_END - MOVE_OUT_START));
                keplerModel.position.lerpVectors(kep_pos_hold, kep_pos_end, eased);
                keplerModel.rotation.x = kep_rot_hold.x + (kep_rot_end.x - kep_rot_hold.x) * eased;
                keplerModel.rotation.y = kep_rot_hold.y + (kep_rot_end.y - kep_rot_hold.y) * eased;
                keplerModel.rotation.z = kep_rot_hold.z + (kep_rot_end.z - kep_rot_hold.z) * eased;
            } else {
                isKeplerInHold = false;
                keplerModel.position.copy(kep_pos_end);
            }

            // TESS
            if (tessModel) {
                isTessInHold = false; // Reset flag
                if (progress <= KEP_PANEL_FADEOUT_START) {
                    tessModel.visible = false;
                    tessModel.position.copy(tess_pos_start);
                } else if (progress <= TESS_MOVE_IN_END) {
                    tessModel.visible = true;
                    const eased = easeInOutSine((progress - KEP_PANEL_FADEOUT_START) / (TESS_MOVE_IN_END - KEP_PANEL_FADEOUT_START));
                    tessModel.position.lerpVectors(tess_pos_start, tess_pos_hold, eased);
                    tessModel.rotation.x = tess_rot_start.x + (tess_rot_hold.x - tess_rot_start.x) * eased;
                    tessModel.rotation.y = tess_rot_start.y + (tess_rot_hold.y - tess_rot_start.y) * eased;
                    tessModel.rotation.z = tess_rot_start.z + (tess_rot_hold.z - tess_rot_start.z) * eased;
                } else if (progress <= MOVE_OUT_START) {
                    tessModel.visible = true;
                    isTessInHold = true; // Set hold animation flag
                    tessModel.position.copy(tess_pos_hold);
                } else if (progress <= MOVE_OUT_END) {
                    tessModel.visible = true;
                    const eased = easeInOutSine((progress - MOVE_OUT_START) / (MOVE_OUT_END - MOVE_OUT_START));
                    tessModel.position.lerpVectors(tess_pos_hold, tess_pos_end, eased);
                    tessModel.rotation.x = tess_rot_hold.x + (tess_rot_end.x - tess_rot_hold.x) * eased;
                    tessModel.rotation.y = tess_rot_hold.y + (tess_rot_end.y - tess_rot_hold.y) * eased;
                    tessModel.rotation.z = tess_rot_hold.z + (tess_rot_end.z - tess_rot_hold.z) * eased;
                } else {
                    tessModel.visible = false;
                }
            }

            // --- Panel Opacities ---
            const kpFadeInStart = 0.1, kpFadeInEnd = 0.2, kpFadeOutStart = KEP_PANEL_FADEOUT_START, kpFadeOutEnd = 0.5;
            keplerPanel.style.opacity = calculateOpacity(progress, kpFadeInStart, kpFadeInEnd, kpFadeOutStart, kpFadeOutEnd);
            
            const tessFadeInStart = 0.45, tessFadeInEnd = 0.55, tessFadeOutStart = TESS_PANEL_FADEOUT_START, tessFadeOutEnd = 0.8;
            tessPanel.style.opacity = calculateOpacity(progress, tessFadeInStart, tessFadeInEnd, tessFadeOutStart, tessFadeOutEnd);

            const tpFadeInStart = TRANSIT_PANEL_FADEIN_START, tpFadeInEnd = 0.9, tpFadeOutStart = 0.95, tpFadeOutEnd = 1.0;
            transitPanel.style.opacity = calculateOpacity(progress, tpFadeInStart, tpFadeInEnd, tpFadeOutStart, tpFadeOutEnd);
        } else {
            keplerModel.visible = false;
            if(tessModel) tessModel.visible = false;
            isKeplerInHold = false;
            isTessInHold = false;
        }
    }
    
    // --- Part 2: JWST Animation ---
    if (jwstModel) {
        const jwstIntroPanel = document.getElementById('jwst-intro-panel');
        const spectroscopyPanel = document.getElementById('spectroscopy-info-panel');
        const jwstSectionTop = jwstSection.offsetTop;
        const jwstSectionHeight = jwstSection.offsetHeight;
        const jwstAnimStart = jwstSectionTop - vh * 0.8;
        const jwstAnimEnd = jwstSectionTop + jwstSectionHeight;
        
        const keplerSectionTop = keplerSection.offsetTop;
        const keplerSectionHeight = keplerSection.offsetHeight;
        const keplerAnimStart = keplerSectionTop - vh * 0.8;

        const pos_start = new THREE.Vector3(-50, 10, -20);
        const rot_start = new THREE.Euler(0.5, -0.8, 0.2);
        const pos_hold = new THREE.Vector3(-30, 0, 0);
        const rot_hold = new THREE.Euler(0.2, -0.5, 0.1);
        const pos_end = new THREE.Vector3(60, -15, 25);
        const rot_end = new THREE.Euler(-0.3, 0.6, -0.1);
        
        isJwstInHold = false;

        if (scrollY < keplerAnimStart) {
            jwstModel.position.copy(pos_start);
            jwstModel.rotation.copy(rot_start);
            jwstModel.visible = false; // Ensure it's hidden before its section
        } else if (scrollY < jwstAnimStart) {
            const keplerProgress = (scrollY - keplerAnimStart) / (keplerSectionHeight - vh);
            const move_in_end = 0.15; // Kepler's move-in duration
            const jwstExitPos = new THREE.Vector3(-80, 20, -30);
            if (keplerProgress <= move_in_end) {
                const exitProgress = easeInOutSine(keplerProgress / move_in_end);
                jwstModel.position.lerpVectors(pos_start, jwstExitPos, exitProgress);
            } else {
                jwstModel.visible = false;
            }
        } else if (scrollY < jwstAnimEnd) {
            jwstModel.visible = true;
            let jwstProgress = (scrollY - jwstAnimStart) / (jwstSectionHeight - vh);
            jwstProgress = Math.max(0, Math.min(1, jwstProgress));

            const move_in_end = 0.15, jwst_hold_end = 0.45, move_out_end = 0.60;
            if (jwstProgress <= move_in_end) {
                const eased = easeInOutSine(jwstProgress / move_in_end);
                jwstModel.position.lerpVectors(pos_start, pos_hold, eased);
                jwstModel.rotation.x = rot_start.x + (rot_hold.x - rot_start.x) * eased;
                jwstModel.rotation.y = rot_start.y + (rot_hold.y - rot_start.y) * eased;
                jwstModel.rotation.z = rot_start.z + (rot_hold.z - rot_start.z) * eased;
            } else if (jwstProgress <= jwst_hold_end) {
                isJwstInHold = true;
                jwstModel.position.copy(pos_hold);
            } else if (jwstProgress <= move_out_end) {
                const eased = easeInOutSine((jwstProgress - jwst_hold_end) / (move_out_end - jwst_hold_end));
                jwstModel.position.lerpVectors(pos_hold, pos_end, eased);
                jwstModel.rotation.x = rot_hold.x + (rot_end.x - rot_hold.x) * eased;
                jwstModel.rotation.y = rot_hold.y + (rot_end.y - rot_hold.y) * eased;
                jwstModel.rotation.z = rot_hold.z + (rot_end.z - rot_hold.z) * eased;
            } else {
                jwstModel.position.copy(pos_end);
            }
            
            const jpFadeInStart = 0.15, jpFadeInEnd = 0.25, jpFadeOutStart = 0.40, jpFadeOutEnd = 0.50;
            jwstIntroPanel.style.opacity = calculateOpacity(jwstProgress, jpFadeInStart, jpFadeInEnd, jpFadeOutStart, jpFadeOutEnd);
            const spFadeInStart = 0.65, spFadeInEnd = 0.75, spFadeOutStart = 0.90, spFadeOutEnd = 1.0;
            spectroscopyPanel.style.opacity = calculateOpacity(jwstProgress, spFadeInStart, spFadeInEnd, spFadeOutStart, spFadeOutEnd);

        } else {
            jwstModel.position.copy(pos_end);
            jwstModel.rotation.copy(rot_end);
            jwstModel.visible = false;
        }
        
        // Update panel mode based on which section is more visible
        const midwayPoint = jwstSectionTop + (jwstSectionHeight / 2);
        if (scrollY > jwstAnimStart) {
            if (currentPanelMode !== 'atmosphere') {
                currentPanelMode = 'atmosphere';
                contentTab.textContent = 'SPECTROSCOPY';
                contentTab.classList.add('green-mode');
            }
        } else {
             if (currentPanelMode === 'atmosphere') {
                currentPanelMode = 'system';
                contentTab.textContent = 'CONFIGURE';
                contentTab.classList.remove('green-mode');
            }
        }
    }


    // --- Part 3: Camera Zoom ---
    const zoomStartScroll = 0;
    const zoomEndScroll = keplerSection.offsetTop - vh * 0.8;

    const startZ = 120; // Start far away
    const endZ = 45;   // End at a medium distance
    
    let currentZ = camera.position.z;
    if (scrollY <= zoomEndScroll) {
        let zoomProgress = scrollY / zoomEndScroll;
        zoomProgress = Math.max(0, Math.min(1, zoomProgress));
        const easedZoomProgress = easeInOutSine(zoomProgress);
        currentZ = startZ + (endZ - startZ) * easedZoomProgress;
    } else {
        currentZ = endZ; // Stay at the final zoom position
    }
    camera.position.z = currentZ;

    // Enable orbit controls only after Kepler story
    const controlsEnableScroll = jwstSection.offsetTop + jwstSection.offsetHeight * 0.8;
    controls.enabled = scrollY > controlsEnableScroll;
}

function calculateOpacity(progress, fadeInStart, fadeInEnd, fadeOutStart, fadeOutEnd) {
    let opacity = 0;
    if (progress > fadeInStart && progress < fadeInEnd) {
        opacity = (progress - fadeInStart) / (fadeInEnd - fadeInStart);
    } else if (progress >= fadeInEnd && progress <= fadeOutStart) {
        opacity = 1;
    } else if (progress > fadeOutStart && progress < fadeOutEnd) {
        opacity = (fadeOutEnd - progress) / (fadeOutEnd - fadeOutStart);
    }
    return opacity;
}


// --- Definitive Panel Logic ---
function setPanelOpen(panelId, tabId, isOpen) {
    const panel = document.getElementById(panelId);
    const tab = document.getElementById(tabId);
    if (!panel || !tab) return;

    if (isOpen) {
        if (currentPanelMode === 'system') {
            renderContentPanel();
        } else {
            renderAtmospherePanel();
        }
        panel.classList.remove('hidden');
        tab.classList.add('hidden');
        panel.setAttribute('aria-hidden', 'false');
        tab.setAttribute('aria-expanded', 'true');
    } else {
        panel.classList.add('hidden');
        tab.classList.remove('hidden');
        panel.setAttribute('aria-hidden', 'true');
        tab.setAttribute('aria-expanded', 'false');
    }
}


function initPanelControls() {
    makePanelDraggable(document.getElementById('content-panel'));
    setPanelOpen('content-panel', 'content-tab', false);
    
    document.getElementById('content-close-button').addEventListener('click', () => setPanelOpen('content-panel', 'content-tab', false));
    document.getElementById('content-tab').addEventListener('click', () => {
        setPanelOpen('content-panel', 'content-tab', true);
    });
}
// --- End Definitive Panel Logic ---

function makePanelDraggable(panel) {
    const header = panel.querySelector('.panel-header');
    let offsetX = 0, offsetY = 0;

    const onPointerDown = (e) => {
        if (e.target !== header && e.target !== header.querySelector('h2')) return;
        e.preventDefault();
        const rect = panel.getBoundingClientRect();
        offsetX = e.clientX - rect.left;
        offsetY = e.clientY - rect.top;
        document.addEventListener('pointermove', onPointerMove);
        document.addEventListener('pointerup', onPointerUp);
    };

    const onPointerMove = (e) => {
        e.preventDefault();
        let newX = e.clientX - offsetX;
        let newY = e.clientY - offsetY;

        const headerHeight = 80;
        newX = Math.max(0, Math.min(newX, window.innerWidth - panel.offsetWidth));
        newY = Math.max(headerHeight, Math.min(newY, window.innerHeight - panel.offsetHeight));

        panel.style.left = `${newX}px`;
        panel.style.top = `${newY}px`;
        panel.style.right = 'auto';
        panel.style.bottom = 'auto';
    };

    const onPointerUp = () => {
        document.removeEventListener('pointermove', onPointerMove);
        document.removeEventListener('pointerup', onPointerUp);
    };

    header.addEventListener('pointerdown', onPointerDown);
}

function calculateDerivedData() {
    const starData = starTypes[interactiveSystemState.star.type];
    const planetData = interactiveSystemState.planet;
    const distanceAU = planetData.orbitRadius;

    // Physical Constants
    const G = 6.67430e-11; // Gravitational constant
    const R_JUPITER_M = 7.1492e7; // Jupiter's radius in meters
    const M_EARTH_KG = 5.972e24; // Earth's mass in kg

    // Planet Physical Properties
    const planetRadiusM = planetData.radius * R_JUPITER_M;
    const planetVolumeM3 = (4/3) * Math.PI * Math.pow(planetRadiusM, 3);
    const planetMassKg = planetData.density * 1000 * planetVolumeM3; // Convert g/cm^3 to kg/m^3
    const surfaceGravity = (G * planetMassKg) / Math.pow(planetRadiusM, 2);
    
    // Habitable Zone (conservative estimates)
    const hz_inner = Math.sqrt(starData.luminosity / 1.1);
    const hz_outer = Math.sqrt(starData.luminosity / 0.53);
    
    // Planet Equilibrium Temperature (without greenhouse effect)
    const albedo = 0.3; // Base albedo, will be overridden by atmosphere panel
    const starRadiusKm = starData.radiusSolar * 696340;
    const distanceKm = distanceAU * 1.496e8;
    const tempK = starData.tempK * Math.sqrt(starRadiusKm / (2 * distanceKm)) * Math.pow(1 - albedo, 0.25);
    const temperatureC = tempK - 273.15;
    
    // Orbital Period (Kepler's Third Law)
    const periodInYears = Math.sqrt(Math.pow(distanceAU, 3) / starData.mass);
    const orbitalPeriodDays = periodInYears * 365.25;

    // Habitability based on location relative to HZ
    let habitability;
    if (distanceAU < hz_inner) {
        habitability = 'Too Hot';
    } else if (distanceAU >= hz_inner && distanceAU <= hz_outer) {
        habitability = 'Habitable Zone';
    } else {
        habitability = 'Too Cold';
    }
    
    derivedPlanetData = {
        habitability,
        temperatureC,
        tempK,
        orbitalPeriodDays,
        distanceAU,
        planetMassKg,
        surfaceGravity,
        hz_inner,
        hz_outer,
    };
}


function updateSystemParameters(param, value) {
    if (param === 'starType') {
        interactiveSystemState.star.type = value;
        updateStarVisuals();
    } else if (param) { // Check for param to avoid running on initial call
        interactiveSystemState.planet[param] = parseFloat(value);
    }
    
    updatePlanetVisuals();
    calculateDerivedData();
    updateDerivedDataUI();
    updateTransitChartScale();
}

function updateStarVisuals() {
    const starData = starTypes[interactiveSystemState.star.type];
    if (starMesh) {
        const initialRadius = starTypes[initialSystemData.star.type].visualRadius;
        
        // Dispose of the old texture to prevent memory leaks
        if (starMesh.material.map) {
            starMesh.material.map.dispose();
        }

        // Create a new texture with the new color
        const newTexture = createProceduralTexture(starTextureGenerator, { 
            size: 512, 
            isRepeat: true, 
            color: starData.color 
        });

        // Apply the new texture
        starMesh.material.map = newTexture;
        starMesh.material.needsUpdate = true;

        // Update other properties
        starMesh.scale.setScalar(starData.visualRadius / initialRadius);
    }
}

function calculateDistanceScaleMultiplier(distanceAU) {
    const normalizedAU = (distanceAU - SCIENTIFIC_MIN_AU) / (SCIENTIFIC_MAX_AU - SCIENTIFIC_MIN_AU);
    return 1.0 + Math.max(0, Math.min(1, normalizedAU)) * 1.0;
}

function updatePlanetVisuals() {
    if (planetMesh) {
        const baseRadius = interactiveSystemState.planet.radius;
        const distanceAU = interactiveSystemState.planet.orbitRadius;
        const distanceMultiplier = calculateDistanceScaleMultiplier(distanceAU);
        planetMesh.scale.setScalar(baseRadius * distanceMultiplier);
    }
}

function updateTransitChartScale() {
    if (!transitChart) return;
    const starData = starTypes[interactiveSystemState.star.type];
    const planetRadiusKm = interactiveSystemState.planet.radius * 71492; // R_jup to km
    const starRadiusKm = starData.radiusSolar * 696340; // R_sun to km
    const maxDip = Math.pow(planetRadiusKm / starRadiusKm, 2);
    
    const minDisplayDip = 0.0005; // 500 ppm
    
    const chartMin = 1.0 - Math.max(maxDip, minDisplayDip) * 1.5;
    transitChart.options.scales.y.min = chartMin;
    transitChart.update('none');
}


function updateDerivedDataUI() {
    const { habitability, temperatureC, orbitalPeriodDays, distanceAU, planetMassKg, surfaceGravity, hz_inner, hz_outer } = derivedPlanetData;
    const animationSpeed = interactiveSystemState.planet.animationSpeed || 1.0;

    // Update Data Grid
    const M_EARTH_KG = 5.972e24;
    document.getElementById('data-star-type').textContent = starTypes[interactiveSystemState.star.type].name;
    document.getElementById('data-temp').textContent = `${Math.round(temperatureC)} °C`;
    document.getElementById('data-mass').textContent = `${(planetMassKg / M_EARTH_KG).toFixed(2)} M⊕`;
    document.getElementById('data-gravity').textContent = `${(surfaceGravity / 9.81).toFixed(2)} g`;
    
    const effectivePeriodDays = orbitalPeriodDays / animationSpeed;
    document.getElementById('data-period').textContent = `${Math.round(effectivePeriodDays)} days`;
    document.getElementById('data-distance').textContent = `${distanceAU.toFixed(2)} AU`;
    
    // Update slider readouts
    const orbitValueSpan = document.getElementById('orbit-radius-value');
    if (orbitValueSpan) orbitValueSpan.textContent = `${distanceAU.toFixed(2)} AU`;
    

    // --- Update Orbital Distance / Habitability Meter ---
    const indicator = document.getElementById('hab-meter-indicator');
    const status = document.getElementById('hab-status');
    const zoneOverlay = document.getElementById('hab-zone-overlay');

    const LOG_MIN_AU = Math.log10(SCIENTIFIC_MIN_AU);
    const LOG_RANGE_AU = Math.log10(SCIENTIFIC_MAX_AU) - LOG_MIN_AU;

    const auToPercent = (au) => ((Math.log10(au) - LOG_MIN_AU) / LOG_RANGE_AU) * 100;

    const planetPercent = auToPercent(distanceAU);
    indicator.style.left = `${Math.max(0, Math.min(100, planetPercent))}%`;

    const zoneStartPercent = auToPercent(hz_inner);
    const zoneEndPercent = auToPercent(hz_outer);
    zoneOverlay.style.left = `${zoneStartPercent}%`;
    zoneOverlay.style.width = `${zoneEndPercent - zoneStartPercent}%`;

    status.textContent = habitability;
    
    const explanationEl = document.getElementById('habitability-explanation');
    let explanationText = '';
    let explanationColor = 'var(--text-secondary)';

    switch (habitability) {
        case 'Too Hot':
            status.style.color = '#ff6b6b';
            explanationText = `<strong>Too Hot:</strong> At ${distanceAU.toFixed(2)} AU, this planet is closer than the inner edge of the habitable zone (${hz_inner.toFixed(2)} AU). Any surface water would likely boil away.`;
            explanationColor = '#ff6b6b';
            break;
        case 'Habitable Zone':
            status.style.color = '#4dff91';
            explanationText = `<strong>Habitable Zone:</strong> The planet orbits within the "Goldilocks Zone," between ${hz_inner.toFixed(2)} and ${hz_outer.toFixed(2)} AU, where surface temperatures could potentially allow for liquid water.`;
            explanationColor = '#4dff91';
            break;
        case 'Too Cold':
            status.style.color = '#6bffff';
            explanationText = `<strong>Too Cold:</strong> At ${distanceAU.toFixed(2)} AU, the planet is beyond the habitable zone's outer edge (${hz_outer.toFixed(2)} AU), likely causing any surface water to freeze.`;
            explanationColor = '#6bffff';
            break;
    }
    if (explanationEl) {
        explanationEl.innerHTML = explanationText;
        explanationEl.style.borderColor = explanationColor;
    }
}

function applyPlanetPreset(presetName) {
    const preset = planetPresets[presetName];
    if (!preset) return;

    // 1. Update state
    interactiveSystemState.planet.radius = preset.radius;
    interactiveSystemState.planet.density = preset.density;
    interactiveSystemState.planet.orbitRadius = preset.orbitRadius;

    // 2. Update the UI controls that are currently visible
    const panelBody = document.getElementById('content-panel-body');
    const radiusSlider = panelBody.querySelector('#planet-radius-slider');
    if (radiusSlider) radiusSlider.value = preset.radius;
    const orbitSlider = panelBody.querySelector('#orbit-radius-slider');
    if (orbitSlider) orbitSlider.value = preset.orbitRadius;
    
    // 3. Trigger all other visual/data updates
    updateSystemParameters();
}


function renderContentPanel() {
    const panelBody = document.getElementById('content-panel-body');
    
    calculateDerivedData();
    const { star, planet } = interactiveSystemState;

    const starOptions = Object.entries(starTypes).map(([key, value]) => 
        `<option value="${key}" ${star.type === key ? 'selected' : ''}>${value.name}</option>`
    ).join('');
    
    panelBody.innerHTML = `
        <div class="config-section">
            <h3>System Parameters</h3>
            <div class="control-group">
                <label for="star-type-select">Star Type</label>
                <select id="star-type-select">${starOptions}</select>
            </div>
             <div class="control-group">
                <label for="planet-radius-slider">Planet Radius <span id="planet-radius-value">${planet.radius.toFixed(2)} R&#x2097;</span></label>
                <input type="range" id="planet-radius-slider" min="0.1" max="1.5" step="0.05" value="${planet.radius}">
            </div>
            <div class="control-group">
                <label for="orbit-radius-slider">
                    Orbital Distance (Log Scale) 
                    <span id="orbit-radius-value">${derivedPlanetData.distanceAU.toFixed(2)} AU</span>
                </label>
                <input type="range" id="orbit-radius-slider" min="${SCIENTIFIC_MIN_AU}" max="${SCIENTIFIC_MAX_AU}" step="0.1" value="${planet.orbitRadius}">
            </div>

            <div class="control-group">
                <label for="orbital-speed-slider">Animation Speed <span id="orbital-speed-value">${planet.animationSpeed.toFixed(1)}x</span></label>
                <input type="range" id="orbital-speed-slider" min="0.1" max="5.0" step="0.1" value="${planet.animationSpeed}">
            </div>
        </div>
        
        <div class="config-section">
            <h3>Planet Selection</h3>
            <div class="preset-buttons planets">
                <button data-preset="mercury">Mercury</button>
                <button data-preset="earth">Earth</button>
                <button data-preset="mars">Mars</button>
                <button data-preset="jupiter">Jupiter</button>
            </div>
        </div>

        <div class="config-section">
            <h3>Transit Photometry</h3>
            <div class="chart-container"><canvas id="transit-chart"></canvas></div>
        </div>
        
        <div class="config-section">
            <h3>Orbital Distance & Habitable Zone</h3>
            <div class="hab-meter-container">
                <div class="hab-meter-bar">
                    <div id="hab-zone-overlay" class="hab-zone-overlay"></div>
                    <div id="hab-meter-indicator"></div>
                </div>
                <div class="hab-meter-zones">
                    <span>${SCIENTIFIC_MIN_AU} AU</span>
                    <span id="hab-status" style="font-weight: bold;">Habitable</span>
                    <span>${SCIENTIFIC_MAX_AU} AU</span>
                </div>
            </div>

            <div id="habitability-explanation" class="explanation-box"></div>
            
            <div class="planet-data-grid" style="grid-template-columns: repeat(3, 1fr); gap: 0.5rem;">
                <div class="data-item">
                    <div class="data-item-label">Star Type</div>
                    <div class="data-item-value" id="data-star-type">--</div>
                </div>
                <div class="data-item">
                    <div class="data-item-label">Eq. Temp</div>
                    <div class="data-item-value" id="data-temp">--</div>
                </div>
                 <div class="data-item">
                    <div class="data-item-label">Period</div>
                    <div class="data-item-value" id="data-period">--</div>
                </div>
                <div class="data-item">
                    <div class="data-item-label">Distance</div>
                    <div class="data-item-value" id="data-distance">--</div>
                </div>
                <div class="data-item">
                    <div class="data-item-label">Mass</div>
                    <div class="data-item-value" id="data-mass">--</div>
                </div>
                 <div class="data-item">
                    <div class="data-item-label">Gravity</div>
                    <div class="data-item-value" id="data-gravity">--</div>
                </div>
            </div>
        </div>
    `;

    createTransitChart();

    // Event Listeners
    panelBody.querySelector('#star-type-select').addEventListener('change', (e) => updateSystemParameters('starType', e.target.value));
    panelBody.querySelector('#planet-radius-slider').addEventListener('input', (e) => {
        const value = parseFloat(e.target.value);
        panelBody.querySelector('#planet-radius-value').innerHTML = `${value.toFixed(2)} R&#x2097;`;
        updateSystemParameters('radius', value);
    });
    panelBody.querySelector('#orbit-radius-slider').addEventListener('input', (e) => updateSystemParameters('orbitRadius', parseFloat(e.target.value)));
    panelBody.querySelector('#orbital-speed-slider').addEventListener('input', (e) => {
        const value = parseFloat(e.target.value);
        panelBody.querySelector('#orbital-speed-value').textContent = `${value.toFixed(1)}x`;
        updateSystemParameters('animationSpeed', value);
    });
    
    // Planet Preset Buttons
    const presetButtons = panelBody.querySelectorAll('.preset-buttons.planets button');
    presetButtons.forEach(button => {
        button.addEventListener('click', (e) => {
            const presetName = e.target.dataset.preset;
            presetButtons.forEach(btn => btn.classList.remove('active'));
            e.target.classList.add('active');
            applyPlanetPreset(presetName);
        });
    });

    // Set initial active preset button
    let isPresetActive = false;
    presetButtons.forEach(button => {
        const preset = planetPresets[button.dataset.preset];
        if (preset && Math.abs(preset.radius - planet.radius) < 0.001 && Math.abs(preset.orbitRadius - planet.orbitRadius) < 0.001) {
             button.classList.add('active');
             isPresetActive = true;
        } else {
             button.classList.remove('active');
        }
    });

    // Add listener to sliders to remove active class if user modifies values from a preset
    const sliders = panelBody.querySelectorAll('#planet-radius-slider, #orbit-radius-slider');
    sliders.forEach(slider => {
        slider.addEventListener('input', () => {
             presetButtons.forEach(btn => btn.classList.remove('active'));
        });
    });
    
    updateSystemParameters();
}

function renderAtmospherePanel() {
    const panelBody = document.getElementById('content-panel-body');
    calculateDerivedData(); // Ensure base data is fresh
    const starData = starTypes[interactiveSystemState.star.type];
    const planetRadiusEarth = interactiveSystemState.planet.radius * 11.209;
    const { planetMassKg, surfaceGravity } = derivedPlanetData;
    const M_EARTH_KG = 5.972e24;

    const inheritedHeaderParams = `
        Star: ${starData.name.split('(')[1].replace(')','')} | 
        Planet: ${(planetMassKg / M_EARTH_KG).toFixed(2)} M⊕, 
        ${planetRadiusEarth.toFixed(2)} R⊕, 
        ${(surfaceGravity / 9.81).toFixed(2)} g
    `.trim();

    const gasControlsHTML = Object.keys(GAS_PROPERTIES).map(gas => `
        <div class="control-group">
            <label>
                <input type="checkbox" data-gas="${gas}" ${atmosphereState.gases[gas].enabled ? 'checked' : ''}>
                ${gas} Concentration <span id="ppm-value-${gas}">${atmosphereState.gases[gas].ppm.toExponential(1)} ppm</span>
            </label>
            <input type="range" class="log-slider" data-gas="${gas}" min="0" max="100" value="50">
        </div>
    `).join('');

    panelBody.innerHTML = `
        <style>
            .inherited-header { padding: 0.5rem 1rem; background-color: rgba(0,0,0,0.3); border-radius: 4px; margin-bottom: 1rem; font-size: 0.8rem; text-align: center; color: var(--text-secondary); border: 1px solid var(--glass-border); }
            .avi-meter-bar { height: 25px; width: 100%; border-radius: 4px; background: linear-gradient(to right, #ff6b6b, #ffd166, #4dff91); border: 1px solid var(--glass-border); position: relative; }
            .avi-meter-indicator { position: absolute; top: -5px; width: 4px; height: 35px; background-color: white; border-radius: 2px; transform: translateX(-50%); transition: left 0.3s ease-out; box-shadow: 0 0 8px rgba(255, 255, 255, 0.8); }
            .avi-meter-zones { display: flex; justify-content: space-between; font-size: 0.8rem; padding: 0.25rem 0.1rem; color: var(--text-secondary); }
        </style>
        
        <div class="config-section green">
            <div class="inherited-header">${inheritedHeaderParams}</div>
            <div class="preset-buttons">
                <button data-preset="earth">Earth-like</button>
                <button data-preset="venus">Venus-like</button>
                <button data-preset="titan">Titan-like</button>
            </div>
            
            <h3>Atmosphere Properties</h3>
            <div class="control-group">
                <label for="albedo-slider">Albedo (Reflectivity) <span class="tooltip">? <span class="tooltip-text">The fraction of light reflected by the planet. 0 is perfectly black, 1 is perfectly reflective.</span></span> <span id="albedo-value">${atmosphereState.albedo.toFixed(2)}</span></label>
                <input type="range" id="albedo-slider" min="0" max="1" step="0.01" value="${atmosphereState.albedo}">
            </div>
            <div class="control-group">
                <label for="pressure-slider">Surface Pressure <span class="tooltip">? <span class="tooltip-text">The atmospheric pressure at the planet's surface, in bars (1 bar is Earth's sea-level pressure).</span></span><span id="pressure-value">${atmosphereState.surfacePressure.toFixed(2)} bar</span></label>
                <input type="range" id="pressure-slider" min="0.1" max="100" step="0.1" value="${atmosphereState.surfacePressure}">
            </div>
            <div class="control-group">
                <label for="cloud-opacity-slider">Cloud/Haze Opacity <span class="tooltip">? <span class="tooltip-text">How much the clouds or haze block light and mute spectral features. 0 is clear, 1 is completely opaque.</span></span><span id="cloud-opacity-value">${atmosphereState.cloudOpacity.toFixed(2)}</span></label>
                <input type="range" id="cloud-opacity-slider" min="0" max="1" step="0.01" value="${atmosphereState.cloudOpacity}">
            </div>
             <div class="control-group">
                <label for="cloud-top-slider">Cloud-Top Pressure <span class="tooltip">? <span class="tooltip-text">The pressure level where clouds become opaque. Lower pressure means higher clouds. Affects the baseline transit depth.</span></span> <span id="cloud-top-value">${atmosphereState.cloudTopPressure.toFixed(2)} bar</span></label>
                <input type="range" id="cloud-top-slider" min="0.01" max="1" step="0.01" value="${atmosphereState.cloudTopPressure}">
            </div>

            <h3>Gas Composition</h3>
            ${gasControlsHTML}
        </div>

        <div class="config-section green">
             <h3>Instrument Controls</h3>
              <div class="control-group">
                <label for="snr-slider">Signal-to-Noise Ratio <span class="tooltip">? <span class="tooltip-text">The quality of the telescope's signal. Higher SNR means less random noise and clearer data.</span></span> <span id="snr-value">${atmosphereState.snr}</span></label>
                <input type="range" id="snr-slider" min="1" max="50" step="1" value="${atmosphereState.snr}">
            </div>
             <div class="control-group">
                <label for="resolution-slider">Spectral Resolution (R) <span class="tooltip">? <span class="tooltip-text">The instrument's ability to distinguish between close wavelengths. Higher R makes spectral lines sharper and narrower.</span></span><span id="resolution-value">${atmosphereState.spectralResolution}</span></label>
                <input type="range" id="resolution-slider" min="50" max="3000" step="50" value="${atmosphereState.spectralResolution}">
            </div>
        </div>

        <div class="config-section green">
            <h3>Transmission Spectrum</h3>
            <div class="chart-container"><canvas id="atmosphere-chart"></canvas></div>
        </div>

        <div class="config-section green">
            <h3>Atmospheric Viability Index (AVI)</h3>
             <div class="hab-meter-container">
                <div class="avi-meter-bar">
                    <div id="avi-meter-indicator" class="avi-meter-indicator"></div>
                </div>
                <div class="avi-meter-zones">
                    <span>Hostile</span>
                    <span>Marginal</span>
                    <span>Favorable</span>
                </div>
            </div>
             <div id="avi-explanation" class="explanation-box" style="border-color: red; margin-top: 1rem;"></div>
              <div class="planet-data-grid" style="grid-template-columns: 1fr 1fr 1fr; gap: 0.5rem; margin-top: 1rem;">
                <div class="data-item">
                    <div class="data-item-label">Equil. Temp</div>
                    <div class="data-item-value" id="derived-temp">--</div>
                </div>
                 <div class="data-item">
                    <div class="data-item-label">Surface Temp</div>
                    <div class="data-item-value" id="derived-surface-temp">--</div>
                </div>
                 <div class="data-item">
                    <div class="data-item-label">Scale Height</div>
                    <div class="data-item-value" id="derived-scale-height">--</div>
                </div>
            </div>
        </div>
    `;

    createAtmosphereChart();
    addAtmosphereEventListeners();
    updateAtmosphereCalculationsAndUI();
}

function addAtmosphereEventListeners() {
    const panelBody = document.getElementById('content-panel-body');
    if (!panelBody) return;

    const update = () => {
        atmosphereState.albedo = parseFloat(panelBody.querySelector('#albedo-slider').value);
        atmosphereState.surfacePressure = parseFloat(panelBody.querySelector('#pressure-slider').value);
        atmosphereState.cloudOpacity = parseFloat(panelBody.querySelector('#cloud-opacity-slider').value);
        atmosphereState.cloudTopPressure = parseFloat(panelBody.querySelector('#cloud-top-slider').value);
        atmosphereState.snr = parseInt(panelBody.querySelector('#snr-slider').value, 10);
        atmosphereState.spectralResolution = parseInt(panelBody.querySelector('#resolution-slider').value, 10);
        
        Object.keys(GAS_PROPERTIES).forEach(gas => {
            atmosphereState.gases[gas].enabled = panelBody.querySelector(`input[type="checkbox"][data-gas="${gas}"]`).checked;
        });

        updateAtmosphereCalculationsAndUI();
    };

    panelBody.querySelectorAll('input[type="range"], input[type="checkbox"]').forEach(el => el.addEventListener('input', update));
    
    const MIN_PPM = 0.1, MAX_PPM = 1000000;
    const LOG_MIN = Math.log10(MIN_PPM), LOG_MAX = Math.log10(MAX_PPM);

    const sliderToPpm = (sliderVal) => Math.pow(10, LOG_MIN + (sliderVal / 100) * (LOG_MAX - LOG_MIN));
    const ppmToSlider = (ppm) => (Math.log10(Math.max(MIN_PPM, ppm)) - LOG_MIN) / (LOG_MAX - LOG_MIN) * 100;
    
    panelBody.querySelectorAll('.log-slider').forEach(slider => {
        const gas = slider.dataset.gas;
        slider.value = ppmToSlider(atmosphereState.gases[gas].ppm);
        slider.addEventListener('input', () => {
             atmosphereState.gases[gas].ppm = sliderToPpm(slider.value);
             update();
        });
    });

    panelBody.querySelectorAll('.preset-buttons button').forEach(button => {
        button.addEventListener('click', (e) => {
            const presetName = e.target.dataset.preset;
            if (atmospherePresets[presetName]) {
                atmosphereState = JSON.parse(JSON.stringify(atmospherePresets[presetName]));
                renderAtmospherePanel(); 
            }
        });
    });
}

function updateAtmosphereCalculationsAndUI() {
    const panelBody = document.getElementById('content-panel-body');
    if (!panelBody || currentPanelMode !== 'atmosphere') return;

    // --- 1. Update UI Labels from State ---
    panelBody.querySelector('#albedo-value').textContent = atmosphereState.albedo.toFixed(2);
    panelBody.querySelector('#pressure-value').textContent = `${atmosphereState.surfacePressure.toFixed(2)} bar`;
    panelBody.querySelector('#cloud-opacity-value').textContent = atmosphereState.cloudOpacity.toFixed(2);
    panelBody.querySelector('#cloud-top-value').textContent = `${atmosphereState.cloudTopPressure.toFixed(2)} bar`;
    panelBody.querySelector('#snr-value').textContent = atmosphereState.snr;
    panelBody.querySelector('#resolution-value').textContent = atmosphereState.spectralResolution;
    Object.keys(atmosphereState.gases).forEach(gas => {
        panelBody.querySelector(`#ppm-value-${gas}`).textContent = `${atmosphereState.gases[gas].ppm.toExponential(1)} ppm`;
    });

    // --- 2. Physics Calculations ---
    const { surfaceGravity, tempK: equilibriumTempK } = derivedPlanetData;
    const greenhouseEffect = (atmosphereState.gases['CO₂'].ppm * 0.005 + atmosphereState.gases['H₂O'].ppm * 0.002 + atmosphereState.gases['CH₄'].ppm * 0.1) * Math.log1p(atmosphereState.surfacePressure);
    const surfaceTempK = equilibriumTempK + Math.min(350, greenhouseEffect); // Capped greenhouse effect

    let totalPpm = 0, weightedMass = 0;
    Object.entries(atmosphereState.gases).forEach(([gas, props]) => {
        if (props.enabled) { totalPpm += props.ppm; weightedMass += props.ppm * GAS_PROPERTIES[gas].molarMass; }
    });
    const meanMolecularWeight = totalPpm > 0 ? weightedMass / totalPpm : 28.97;
    const mu_kg = meanMolecularWeight * 1.66054e-27;
    const scaleHeight = ((1.38e-23 * surfaceTempK) / (mu_kg * surfaceGravity)) / 1000; // in km

    derivedAtmosphereData = { surfaceTempK, meanMolecularWeight, scaleHeight };

    // --- 3. Calculate AVI Score ---
    const { score, text, color } = calculateAVI();
    panelBody.querySelector('#avi-meter-indicator').style.left = `${score * 100}%`;
    const explanationBox = panelBody.querySelector('#avi-explanation');
    explanationBox.innerHTML = text;
    explanationBox.style.borderColor = color;
    
    // --- 4. Update Derived Data Display ---
    panelBody.querySelector('#derived-temp').textContent = `${(equilibriumTempK - 273.15).toFixed(0)} °C`;
    panelBody.querySelector('#derived-surface-temp').textContent = `${(surfaceTempK - 273.15).toFixed(0)} °C`;
    panelBody.querySelector('#derived-scale-height').textContent = `${scaleHeight.toFixed(1)} km`;

    // --- 5. Update Chart ---
    updateAtmosphereChart();
}

function calculateAVI() {
    let score = 0;
    let diagnostics = [];
    const { surfaceTempK } = derivedAtmosphereData;
    const { surfaceGravity } = derivedPlanetData;
    const { gases, surfacePressure, cloudOpacity } = atmosphereState;
    const tempC = surfaceTempK - 273.15;

    // Temperature: Goldilocks zone for surface
    if (tempC > 0 && tempC < 50) { score += 0.25; diagnostics.push("Ideal surface temperature for liquid water."); }
    else if (tempC > -50 && tempC < 100) { score += 0.1; diagnostics.push("Surface temperature is marginal."); }
    else { diagnostics.push("Extreme surface temperatures."); }
    
    // Water: Crucial for life
    if (gases['H₂O'].enabled && gases['H₂O'].ppm > 100) { score += 0.3; diagnostics.push("Significant water vapor present."); }
    else { diagnostics.push("Atmosphere is very dry."); }
    
    // Pressure: Not too thin, not too thick
    if (surfacePressure > 0.5 && surfacePressure < 5) { score += 0.15; diagnostics.push("Optimal surface pressure."); }
    else if (surfacePressure > 0.1 && surfacePressure < 10) { score += 0.05; diagnostics.push("Marginal surface pressure."); }
    else { diagnostics.push("Extreme surface pressure."); }

    // Biosignatures: O2 + CH4 is a strong indicator
    if (gases['O₂'].enabled && gases['O₂'].ppm > 1000 && gases['CH₄'].enabled && gases['CH₄'].ppm > 0.1) { score += 0.3; diagnostics.push("Strong biosignature pair (O₂ + CH₄) detected."); }
    else if (gases['O₂'].enabled && gases['O₂'].ppm > 1000) { score += 0.1; diagnostics.push("Oxygen is present, a potential biosignature."); }

    // Gravity: Good for retaining atmosphere
    if (surfaceGravity > 5 && surfaceGravity < 20) { score += 0.1; diagnostics.push("Good gravity for retaining atmosphere.");}
    
    // Penalties
    if (gases['CO₂'].enabled && gases['CO₂'].ppm > 100000) { score -= 0.15; diagnostics.push("High CO₂ suggests a runaway greenhouse effect."); }
    if (cloudOpacity > 0.9) { score -= 0.1; diagnostics.push("Very high cloud/haze opacity may block light."); }

    score = Math.max(0, Math.min(1, score)); // Clamp score between 0 and 1
    
    let text, color;
    if (score > 0.65) { text = `<strong>Favorable:</strong> ${diagnostics.join(' ')}`; color = 'var(--accent-green)'; }
    else if (score > 0.3) { text = `<strong>Marginal:</strong> ${diagnostics.join(' ')}`; color = '#ffd166'; }
    else { text = `<strong>Hostile:</strong> ${diagnostics.join(' ')}`; color = '#ff6b6b'; }
    
    return { score, text, color };
}

function createProceduralTexture(generator, { size = 256, isRepeat = false, color = 0xffffff } = {}) {
    const canvas = document.createElement('canvas');
    canvas.width = size;
    canvas.height = size;
    const context = canvas.getContext('2d');
    generator(context, size, size, color);
    const texture = new THREE.CanvasTexture(canvas);
    if (isRepeat) {
        texture.wrapS = THREE.RepeatWrapping;
        texture.wrapT = THREE.RepeatWrapping;
    }
    return texture;
}

function starTextureGenerator(ctx, width, height, starColorHex) {
    const color = new THREE.Color(starColorHex);
    // Create a brighter color for the center of the star by mixing with white
    const centerColor = new THREE.Color().copy(color).lerp(new THREE.Color(0xffffff), 0.4).getStyle();
    const edgeColor = color.getStyle();

    // 1. Base Gradient for the main star body and glow
    const baseGradient = ctx.createRadialGradient(width / 2, height / 2, 0, width / 2, height / 2, width / 2);
    baseGradient.addColorStop(0, centerColor);
    baseGradient.addColorStop(0.7, edgeColor);
    baseGradient.addColorStop(1, edgeColor);
    ctx.fillStyle = baseGradient;
    ctx.fillRect(0, 0, width, height);

    // 2. Granulation/Convection Cells for a "boiling" surface effect
    const numCells = width * 2; // Use a high number of cells for a detailed texture
    const cellColor = new THREE.Color().copy(color).lerp(new THREE.Color(0xffffff), 0.6);
    
    for (let i = 0; i < numCells; i++) {
        const x = Math.random() * width;
        const y = Math.random() * height;
        const radius = Math.random() * (width / 50) + (width / 100);
        // Use very low alpha to build up the texture subtly
        const alpha = Math.random() * 0.2 + 0.05;

        ctx.beginPath();
        ctx.arc(x, y, radius, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${Math.floor(cellColor.r * 255)}, ${Math.floor(cellColor.g * 255)}, ${Math.floor(cellColor.b * 255)}, ${alpha})`;
        ctx.fill();
    }
    
    // 3. Limb Darkening: Apply a transparent-to-dark gradient overlay to make the star look spherical
    const limbDarkening = ctx.createRadialGradient(width / 2, height / 2, width / 2 * 0.7, width / 2, height / 2, width / 2);
    limbDarkening.addColorStop(0, 'rgba(0,0,0,0)');
    limbDarkening.addColorStop(1, 'rgba(0,0,0,0.6)');
    ctx.fillStyle = limbDarkening;
    ctx.fillRect(0, 0, width, height);
}


function rockyTextureGenerator(ctx, width, height) {
    ctx.fillStyle = '#4a4a4a'; ctx.fillRect(0, 0, width, height);
    const numCraters = width * 0.8;
    for (let i = 0; i < numCraters; i++) {
        const x = Math.random() * width, y = Math.random() * height;
        const r = Math.random() * (width / 16) + (width / 50);
        const grey = Math.random() * 50 + 30;
        ctx.fillStyle = `rgb(${grey}, ${grey}, ${grey})`;
        ctx.beginPath(); ctx.arc(x, y, r, 0, Math.PI * 2); ctx.fill();
    }
}

function solarPanelTextureGenerator(ctx, width, height) {
    ctx.fillStyle = '#050a1f'; // A very dark blue, almost black
    ctx.fillRect(0, 0, width, height);
    ctx.strokeStyle = 'rgba(100, 120, 180, 0.4)'; // A faint, brighter blue
    ctx.lineWidth = 2;
    const step = 20; // Size of each cell
    for (let i = 0; i < width; i += step) {
        ctx.beginPath(); ctx.moveTo(i, 0); ctx.lineTo(i, height); ctx.stroke();
    }
    for (let i = 0; i < height; i += step) {
        ctx.beginPath(); ctx.moveTo(0, i); ctx.lineTo(width, i); ctx.stroke();
    }
}

function goldMirrorTextureGenerator(ctx, width, height) {
    // Base gold gradient
    const gradient = ctx.createLinearGradient(0, 0, width, height);
    gradient.addColorStop(0, '#ffe65f'); // Brighter highlight
    gradient.addColorStop(0.5, '#ffd700'); // Mid-tone gold
    gradient.addColorStop(1, '#e6b800'); // Deeper shadow
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, width, height);

    // Draw faint segment lines to suggest the hexagonal mirrors
    ctx.strokeStyle = 'rgba(150, 110, 0, 0.3)'; // Darker gold for lines, slightly transparent
    ctx.lineWidth = Math.max(1, width / 128); // Thin lines, at least 1px

    const numLines = 4;
    const spacingX = width / numLines;
    const spacingY = height / numLines;

    for (let i = 1; i < numLines; i++) {
        // Vertical-ish lines
        ctx.beginPath();
        ctx.moveTo(i * spacingX + (Math.random() - 0.5) * 15, 0);
        ctx.lineTo(i * spacingX + (Math.random() - 0.5) * 15, height);
        ctx.stroke();
    }
    // Add some diagonal lines to simulate hex grid
    ctx.beginPath();
    ctx.moveTo(0, spacingY);
    ctx.lineTo(width, height - spacingY);
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(0, height - spacingY);
    ctx.lineTo(width, spacingY);
    ctx.stroke();


    // Add bright, semi-transparent streaks for reflection effect
    ctx.lineCap = 'round';
    for (let i = 0; i < 7; i++) { // Increased number of streaks
        const startX = Math.random() * width;
        const startY = Math.random() * height;
        const endX = startX + (Math.random() - 0.5) * width * 1.5; // Longer streaks
        const endY = startY + (Math.random() - 0.5) * height * 1.5;

        ctx.strokeStyle = `rgba(255, 255, 240, ${Math.random() * 0.25 + 0.1})`;
        ctx.lineWidth = Math.random() * (width / 60) + (width / 120);
        ctx.beginPath();
        ctx.moveTo(startX, startY);
        ctx.lineTo(endX, endY);
        ctx.stroke();
    }
    
     // Add a subtle vignetting effect to add depth
    const vignette = ctx.createRadialGradient(width/2, height/2, width/3, width/2, height/2, width/1.8);
    vignette.addColorStop(0, 'rgba(0,0,0,0)');
    vignette.addColorStop(1, 'rgba(0,0,0,0.25)');
    ctx.fillStyle = vignette;
    ctx.fillRect(0, 0, width, height);
}

function createCrinkleNormalMap(size = 256, intensity = 1.0) {
    const canvas = document.createElement('canvas');
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext('2d');

    const imgData = ctx.createImageData(size, size);
    const data = imgData.data;
    for (let i = 0; i < data.length; i += 4) {
        const rand = Math.floor(Math.random() * 255);
        data[i] = rand; data[i + 1] = rand; data[i + 2] = rand; data[i + 3] = 255;
    }
    ctx.putImageData(imgData, 0, 0);

    const heightMap = ctx.getImageData(0, 0, size, size).data;
    const normalData = new Uint8ClampedArray(size * size * 4);

    for (let y = 0; y < size; y++) {
        for (let x = 0; x < size; x++) {
            const get = (x, y) => heightMap[(y % size) * size * 4 + (x % size) * 4] / 255.0;
            const sx = get(x + 1, y) - get(x - 1, y);
            const sy = get(x, y + 1) - get(x, y - 1);
            let n = new THREE.Vector3(-sx * intensity, -sy * intensity, 1.0).normalize();
            const idx = (y * size + x) * 4;
            normalData[idx] = (n.x * 0.5 + 0.5) * 255;
            normalData[idx + 1] = (n.y * 0.5 + 0.5) * 255;
            normalData[idx + 2] = n.z * 255;
            normalData[idx + 3] = 255;
        }
    }
    ctx.putImageData(new ImageData(normalData, size, size), 0, 0);
    const texture = new THREE.CanvasTexture(canvas);
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.RepeatWrapping;
    return texture;
}

function createKeplerModel() {
    const modelGroup = new THREE.Group();

    // --- Materials (IMPROVED) ---
    const bodyMaterial = new THREE.MeshStandardMaterial({ color: 0xdddddd, metalness: 0.6, roughness: 0.4 });
    const darkMetalMaterial = new THREE.MeshStandardMaterial({ color: 0x454545, metalness: 0.8, roughness: 0.25, side: THREE.DoubleSide });
    const solarPanelTexture = createProceduralTexture(solarPanelTextureGenerator);
    const panelMaterial = new THREE.MeshStandardMaterial({ 
        map: solarPanelTexture, metalness: 0.6, roughness: 0.4, 
        emissive: 0x3b82f6, emissiveMap: solarPanelTexture, emissiveIntensity: 0.2
    });
    
    const crinkleNormalMap = createCrinkleNormalMap(256, 0.5);
    crinkleNormalMap.repeat.set(4, 4);
    const goldFoilMaterial = new THREE.MeshStandardMaterial({ 
        color: 0xB1882B,      // Darker, less saturated gold
        metalness: 1.0, 
        roughness: 0.25,      // More diffuse reflections
        emissive: 0x654321,      // Very dark brown emissive
        emissiveIntensity: 0.1, // Lower intensity
        normalMap: crinkleNormalMap,
        normalScale: new THREE.Vector2(0.3, 0.3)
    });
    const whiteAntennaMaterial = new THREE.MeshStandardMaterial({ color: 0xf0f0f0, metalness: 0.9, roughness: 0.1 });


    // --- Components ---

    // 1. Photometer (Main Barrel)
    const photometerGroup = new THREE.Group();
    const mainTubeGeo = new THREE.CylinderGeometry(1.1, 1.1, 3.5, 32);
    const mainTube = new THREE.Mesh(mainTubeGeo, goldFoilMaterial);
    
    const frontRingGeo = new THREE.RingGeometry(1.1, 1.25, 32);
    const frontRing = new THREE.Mesh(frontRingGeo, goldFoilMaterial);
    frontRing.position.y = 1.75;
    frontRing.rotation.x = -Math.PI / 2;
    
    for(let i = 0; i < 4; i++) {
        const ringGeo = new THREE.TorusGeometry(1.1, 0.03, 16, 32);
        const ring = new THREE.Mesh(ringGeo, darkMetalMaterial);
        ring.rotation.x = Math.PI / 2;
        ring.position.y = -1.5 + i * 1.0;
        photometerGroup.add(ring);
    }
    
    photometerGroup.add(mainTube, frontRing);
    photometerGroup.rotation.x = Math.PI / 2;
    modelGroup.add(photometerGroup);

    // 2. Spacecraft Bus (Base)
    const busGeo = new THREE.CylinderGeometry(1.4, 1.4, 1.2, 6);
    const bus = new THREE.Mesh(busGeo, bodyMaterial);
    bus.position.z = -2.4;
    for(let i = 0; i < 6; i++) {
        const angle = (i/6) * Math.PI * 2;
        const greebleGeo = new THREE.BoxGeometry(0.5, 0.3, 0.1);
        const greeble = new THREE.Mesh(greebleGeo, darkMetalMaterial);
        greeble.position.set(Math.cos(angle) * 1.3, Math.sin(angle) * 1.3, -2.4);
        greeble.lookAt(bus.position);
        greeble.position.addScaledVector(greeble.position.clone().normalize(), 0.1);
        modelGroup.add(greeble);
    }
    modelGroup.add(bus);

    // 3. Sun Shield Support Structure
    const shieldSupportGeo = new THREE.CylinderGeometry(1.5, 1.5, 0.3, 8);
    const shieldSupport = new THREE.Mesh(shieldSupportGeo, goldFoilMaterial);
    shieldSupport.position.z = -1.65;
    modelGroup.add(shieldSupport);

    // 4. Solar Panel Arrays
    const panelGroup = new THREE.Group();
    for (let i = 0; i < 4; i++) {
        const angle = (i / 4) * Math.PI * 2 + Math.PI / 4;
        const panelAssembly = new THREE.Group();
        
        const armGeo = new THREE.BoxGeometry(0.15, 0.15, 2.5);
        const arm = new THREE.Mesh(armGeo, bodyMaterial);
        arm.position.z = -1.25;

        const panelFrameGeo = new THREE.BoxGeometry(2.2, 2.2, 0.1);
        const panelFrame = new THREE.Mesh(panelFrameGeo, darkMetalMaterial);
        
        // FIX: Inset panel surface to prevent z-fighting
        const panelSurfaceGeo = new THREE.BoxGeometry(2.15, 2.15, 0.12);
        const panelSurface = new THREE.Mesh(panelSurfaceGeo, panelMaterial);

        const panel = new THREE.Group();
        panel.add(panelFrame, panelSurface);
        panel.position.z = -2.5;

        panelAssembly.add(arm, panel);
        panelAssembly.position.set(Math.cos(angle) * 1.2, Math.sin(angle) * 1.2, -2.4);
        panelAssembly.lookAt(bus.position);
        panelAssembly.rotation.y += Math.PI;
        
        panelGroup.add(panelAssembly);
    }
    modelGroup.add(panelGroup);

    // 5. High-Gain Antenna
    const antennaGroup = new THREE.Group();
    const dishPoints = [];
    for (let i = 0; i <= 10; i++) {
        dishPoints.push(new THREE.Vector2(Math.sin(i * 0.157) * 0.8, (1 - Math.cos(i * 0.157)) * 0.4));
    }
    const dishGeo = new THREE.LatheGeometry(dishPoints, 40);
    const dish = new THREE.Mesh(dishGeo, whiteAntennaMaterial);
    
    const feedArmGeo = new THREE.CylinderGeometry(0.03, 0.03, 0.6, 8);
    const feedArm = new THREE.Mesh(feedArmGeo, goldFoilMaterial);
    feedArm.position.y = -0.3;
    
    antennaGroup.add(dish, feedArm);
    antennaGroup.position.z = -3.2;
    antennaGroup.rotation.x = Math.PI * 0.6;
    modelGroup.add(antennaGroup);
    
    // 6. Base plate with gold foil
    const basePlateGeo = new THREE.CylinderGeometry(1.4, 1.4, 0.2, 6);
    const basePlate = new THREE.Mesh(basePlateGeo, goldFoilMaterial);
    basePlate.position.z = -3.1;
    modelGroup.add(basePlate);


    // Final Transformations for initial landing screen view
    modelGroup.rotation.set(-0.8, 1.0, -0.2);
    modelGroup.scale.setScalar(4.0);
    modelGroup.position.set(50, -20, -30);
    
    return modelGroup;
}

function createTESSModel() {
    const modelGroup = new THREE.Group();

    // Materials
    const bodyMaterial = new THREE.MeshStandardMaterial({ color: 0xcccccc, metalness: 0.7, roughness: 0.3 });
    const darkMetalMaterial = new THREE.MeshStandardMaterial({ color: 0x333333, metalness: 0.8, roughness: 0.2 });
    const lensMaterial = new THREE.MeshStandardMaterial({ color: 0x111122, roughness: 0.1, transmission: 0.9, thickness: 0.1, transparent: true, opacity: 0.5 });
    const solarPanelTexture = createProceduralTexture(solarPanelTextureGenerator);
    const panelMaterial = new THREE.MeshStandardMaterial({ 
        map: solarPanelTexture, metalness: 0.6, roughness: 0.4, 
        emissive: 0x3b82f6, emissiveMap: solarPanelTexture, emissiveIntensity: 0.2
    });
    const crinkleNormalMap = createCrinkleNormalMap(256, 0.5);
    const goldFoilMaterial = new THREE.MeshStandardMaterial({ 
        color: 0xDAA520, metalness: 1.0, roughness: 0.15, 
        emissive: 0x8B4513, emissiveIntensity: 0.2,
        normalMap: crinkleNormalMap, normalScale: new THREE.Vector2(0.3, 0.3)
    });

    // Main bus
    const busGeo = new THREE.BoxGeometry(1.5, 1.5, 1.8);
    const bus = new THREE.Mesh(busGeo, bodyMaterial);
    modelGroup.add(bus);

    // Solar Panels
    const panelGeo = new THREE.BoxGeometry(4, 1.5, 0.1);
    const panel1 = new THREE.Mesh(panelGeo, panelMaterial);
    panel1.position.x = 2.75; // Symmetrical positioning
    modelGroup.add(panel1);

    const panel2 = panel1.clone();
    panel2.position.x = -2.75; // Symmetrical positioning
    modelGroup.add(panel2);

    // Camera Assembly
    const cameraPlateGeo = new THREE.BoxGeometry(1.2, 1.2, 0.1);
    const cameraPlate = new THREE.Mesh(cameraPlateGeo, darkMetalMaterial);
    cameraPlate.position.z = 0.95;
    modelGroup.add(cameraPlate);

    const cameraGeo = new THREE.CylinderGeometry(0.3, 0.3, 0.5, 32);
    const lensGeo = new THREE.CylinderGeometry(0.28, 0.28, 0.1, 32);
    const cameraPositions = [[0.4, 0.4], [-0.4, 0.4], [0.4, -0.4], [-0.4, -0.4]];
    cameraPositions.forEach(pos => {
        const camera = new THREE.Mesh(cameraGeo, darkMetalMaterial);
        const lens = new THREE.Mesh(lensGeo, lensMaterial);
        lens.position.z = 0.25;
        camera.add(lens);
        camera.position.set(pos[0], pos[1], 1.2);
        camera.rotation.x = Math.PI / 2;
        modelGroup.add(camera);
    });
    
    // Sun Shade
    const shadeGeo = new THREE.PlaneGeometry(1.6, 1.6);
    const shade = new THREE.Mesh(shadeGeo, goldFoilMaterial);
    shade.position.z = -0.95;
    modelGroup.add(shade);

    // Antenna
    const dishPoints = [];
    for (let i = 0; i <= 10; i++) {
        dishPoints.push(new THREE.Vector2(Math.sin(i * 0.157) * 0.5, (1 - Math.cos(i * 0.157)) * 0.2));
    }
    const dishGeo = new THREE.LatheGeometry(dishPoints, 32);
    const dish = new THREE.Mesh(dishGeo, new THREE.MeshStandardMaterial({color: 0xffffff, metalness: 0.9, roughness: 0.1}));
    dish.position.z = -1.2;
    modelGroup.add(dish);

    modelGroup.scale.setScalar(2.4); // Reduced size by 40%
    return modelGroup;
}


function createJWSTModel() {
    const modelGroup = new THREE.Group();

    // --- Materials (HYPER-REALISM PASS) ---
    const goldMirrorTexture = createProceduralTexture(goldMirrorTextureGenerator);
    const goldMirrorMaterial = new THREE.MeshStandardMaterial({
        map: goldMirrorTexture,
        metalness: 1.0, roughness: 0.1,
        emissive: 0xcc9900,
        emissiveMap: goldMirrorTexture,
        emissiveIntensity: 0.15,
        clearcoat: 0.8,
        clearcoatRoughness: 0.05
    });
    const goldBevelMaterial = new THREE.MeshStandardMaterial({
        color: 0x997a00, metalness: 0.9, roughness: 0.3,
    });
    const mirrorMaterials = [goldMirrorMaterial, goldBevelMaterial];
    
    // Multiple dark materials for visual variety
    const blackStructureMaterial = new THREE.MeshStandardMaterial({ color: 0x222222, metalness: 0.6, roughness: 0.4 });
    const matteBlackMaterial = new THREE.MeshStandardMaterial({ color: 0x111111, metalness: 0.2, roughness: 0.8 });

    // Enhanced Sunshield: Create 5 slightly different materials for layering effect
    const sunshieldNormalMap = createCrinkleNormalMap(256, 0.3); // Slightly more intense crinkle
    sunshieldNormalMap.wrapS = sunshieldNormalMap.wrapT = THREE.RepeatWrapping;
    sunshieldNormalMap.repeat.set(8, 8);
    
    const sunshieldMaterials = Array(5).fill(0).map((_, i) => {
        const progression = i / 4; // 0 to 1
        return new THREE.MeshStandardMaterial({
            color: new THREE.Color().setHSL(0.66, 0.5, 0.85 + progression * 0.15), // Shifts from violet-silver to pure silver
            metalness: 0.9,
            roughness: 0.2 + progression * 0.15, // Gets slightly rougher deeper in
            side: THREE.DoubleSide,
            normalMap: sunshieldNormalMap,
            normalScale: new THREE.Vector2(0.1, 0.1),
            emissive: new THREE.Color(0x4a2d6b).multiplyScalar(0.1 - progression * 0.08), // Emissive fades out
            emissiveIntensity: 1.0
        });
    });

    // Material for Multi-Layer Insulation (MLI) blankets
    const mliNormalMap = createCrinkleNormalMap(128, 0.4);
    mliNormalMap.wrapS = mliNormalMap.wrapT = THREE.RepeatWrapping;
    mliNormalMap.repeat.set(2, 2);
    const mliMaterial = new THREE.MeshStandardMaterial({
        color: 0xcccccc, metalness: 0.8, roughness: 0.3,
        normalMap: mliNormalMap, normalScale: new THREE.Vector2(0.2, 0.2)
    });

    const solarPanelTexture = createProceduralTexture(solarPanelTextureGenerator);
    const solarPanelMaterial = new THREE.MeshStandardMaterial({ 
        map: solarPanelTexture, metalness: 0.5, roughness: 0.5,
        emissive: 0x3b82f6, emissiveMap: solarPanelTexture, emissiveIntensity: 0.3
    });
    const whiteAntennaMaterial = new THREE.MeshStandardMaterial({color: 0xffffff, roughness: 0.2, metalness: 0.8});


    // --- Primary Mirror Assembly ---
    const mirrorAssembly = new THREE.Group();
    const mirrorGroup = new THREE.Group();
    const hexShape = new THREE.Shape();
    const r = 1.0;
    for (let i = 0; i <= 6; i++) {
        const angle = (i / 6) * Math.PI * 2;
        hexShape.lineTo(Math.cos(angle) * r, Math.sin(angle) * r);
    }
    const hexGeo = new THREE.ExtrudeGeometry(hexShape, { depth: 0.1, bevelEnabled: true, bevelThickness: 0.02, bevelSize: 0.03, bevelSegments: 1 });
    hexGeo.center();

    const hexPositions = [
        [0, 0], [1, 1.732], [-1, 1.732], [2, 0], [-2, 0], [1, -1.732], [-1, -1.732],
        [3, 1.732], [-3, 1.732], [4, 0], [-4, 0], [3, -1.732], [-3, -1.732],
        [2, 3.464], [-2, 3.464], [2, -3.464], [-2, -3.464], [0, 3.464*1.5]
    ].map(([x,y]) => [x*r*0.87, y*r*0.5]);
    
    const actuatorGeo = new THREE.CylinderGeometry(0.05, 0.05, 0.2, 8);
    const backingPlateGeo = new THREE.BoxGeometry(1.6, 1.6, 0.1);

    const spacingFactor = 1.03; // Add a 3% gap between mirrors

    hexPositions.forEach((pos) => {
        const hexSegmentGroup = new THREE.Group();
        const hexMesh = new THREE.Mesh(hexGeo, mirrorMaterials);
        hexSegmentGroup.add(hexMesh);

        // Add detailed backing structure
        const backingPlate = new THREE.Mesh(backingPlateGeo, matteBlackMaterial);
        backingPlate.position.z = -0.15;
        hexSegmentGroup.add(backingPlate);

        // Add actuators
        for(let i = 0; i < 3; i++) {
            const actuator = new THREE.Mesh(actuatorGeo, blackStructureMaterial);
            const angle = i * (Math.PI * 2 / 3);
            actuator.position.set(Math.cos(angle) * 0.6, Math.sin(angle) * 0.6, -0.2);
            hexSegmentGroup.add(actuator);
        }
        
        hexSegmentGroup.position.set(pos[0] * spacingFactor, pos[1] * spacingFactor, 0);
        mirrorGroup.add(hexSegmentGroup);
    });
    mirrorGroup.scale.setScalar(0.75);
    mirrorGroup.position.set(0, 0.2, 0);

    // Backplane
    const backplane = new THREE.Group();
    const mainBackplaneGeo = new THREE.BoxGeometry(5.2 * spacingFactor, 7.5 * spacingFactor, 0.3);
    const mainBackplane = new THREE.Mesh(mainBackplaneGeo, blackStructureMaterial);
    mainBackplane.position.z = -0.2;
    // Add some greebles to backplane
    for (let i = 0; i < 20; i++) {
        const greeble = new THREE.Mesh(
            new THREE.BoxGeometry(Math.random()*0.3+0.1, Math.random()*0.3+0.1, Math.random()*0.2+0.05),
            matteBlackMaterial
        );
        greeble.position.set( (Math.random()-0.5) * 5, (Math.random()-0.5)*7, -0.4 );
        backplane.add(greeble);
    }
    backplane.add(mainBackplane);
    
    mirrorAssembly.add(mirrorGroup, backplane);
    modelGroup.add(mirrorAssembly);

    // --- Secondary Mirror Assembly ---
    const secondaryMirrorGroup = new THREE.Group();
    const secondaryMirror = new THREE.Mesh(new THREE.CircleGeometry(0.4, 32), goldMirrorMaterial);
    secondaryMirror.position.z = 0.1
    
    // Thinner, more beam-like struts
    for (let i = 0; i < 3; i++) {
        const strut = new THREE.Mesh(new THREE.BoxGeometry(0.05, 5.5, 0.05), blackStructureMaterial);
        const angle = i * (Math.PI * 2 / 3);
        const startPos = new THREE.Vector3(Math.cos(angle + Math.PI/2) * 2.5, Math.sin(angle + Math.PI/2) * 3.5 - 0.5, -0.5);
        const endPos = new THREE.Vector3(0, 0, 0); // local to secondary mirror group
        strut.position.copy(startPos).lerp(endPos, 0.5);
        strut.lookAt(endPos);
        secondaryMirrorGroup.add(strut);
    }

    secondaryMirrorGroup.add(secondaryMirror);
    secondaryMirrorGroup.position.set(0, 2.7, 4.5);
    modelGroup.add(secondaryMirrorGroup);

    // --- ISIM and Bus Assembly ---
    const bodyAssembly = new THREE.Group();
    const isimGeo = new THREE.BoxGeometry(2.5, 3, 1.5);
    const isim = new THREE.Mesh(isimGeo, mliMaterial); // Use new MLI material
    isim.position.z = -1;
    bodyAssembly.add(isim);

    const busGeo = new THREE.BoxGeometry(1.8, 1.5, 1.2);
    const busMesh = new THREE.Mesh(busGeo, mliMaterial); // Use new MLI material
    busMesh.position.z = -2.5;
    bodyAssembly.add(busMesh);
    
    // Add greebles to the bus
    for(let i=0; i<15; i++) {
        const greebleGeo = new THREE.BoxGeometry(Math.random() * 0.4 + 0.1, Math.random() * 0.4 + 0.1, Math.random() * 0.2 + 0.1);
        const greeble = new THREE.Mesh(greebleGeo, matteBlackMaterial);
        greeble.position.set((Math.random()-0.5)*1.8, (Math.random()-0.5)*1.5, -2.5 + (Math.random()-0.5)*1.2);
        greeble.rotation.set(Math.random()*Math.PI, Math.random()*Math.PI, Math.random()*Math.PI);
        bodyAssembly.add(greeble);
    }


    const solarPanelArmGeo = new THREE.CylinderGeometry(0.08, 0.08, 2, 8);
    const solarPanelArm = new THREE.Mesh(solarPanelArmGeo, blackStructureMaterial);
    solarPanelArm.position.set(0, -0.75, -3.5);
    solarPanelArm.rotation.z = Math.PI/2;
    bodyAssembly.add(solarPanelArm);
    const solarPanelGeo = new THREE.BoxGeometry(1.2, 3, 0.1);
    const solarPanel = new THREE.Mesh(solarPanelGeo, solarPanelMaterial);
    solarPanel.position.set(0, -2.25, -3.5);
    bodyAssembly.add(solarPanel);

    const dishPoints = [];
    for (let i = 0; i <= 10; i++) dishPoints.push(new THREE.Vector2(Math.sin(i * 0.157) * 0.6, (1 - Math.cos(i * 0.157)) * 0.3));
    const dishGeo = new THREE.LatheGeometry(dishPoints, 20);
    const dish = new THREE.Mesh(dishGeo, whiteAntennaMaterial);
    dish.position.set(0, 0.75, -2.5);
    bodyAssembly.add(dish);

    modelGroup.add(bodyAssembly);

    // --- Sunshield Assembly ---
    const sunshieldAssembly = new THREE.Group();
    const shieldShape = new THREE.Shape();
    shieldShape.moveTo(-4, -5.5);
    shieldShape.bezierCurveTo(-5, -2, -5, 2, -1.5, 6);
    shieldShape.bezierCurveTo(5, 2, 5, -2, 4, -5.5);
    shieldShape.closePath();

    for (let i = 0; i < 5; i++) {
        const layerGeo = new THREE.ShapeGeometry(shieldShape);
        // Use the new array of materials
        const layer = new THREE.Mesh(layerGeo, sunshieldMaterials[i]);
        // Increased separation for more definition
        layer.position.z = -1.8 - i * 0.25;
        layer.scale.setScalar(1 + i * 0.04);
        sunshieldAssembly.add(layer);
    }
    
    const boomGeo = new THREE.CylinderGeometry(0.1, 0.1, 12, 8);
    const boom1 = new THREE.Mesh(boomGeo, blackStructureMaterial);
    boom1.rotation.x = Math.PI/2;
    boom1.position.x = -4.5;
    sunshieldAssembly.add(boom1);
    const boom2 = boom1.clone();
    boom2.position.x = 4.5;
    sunshieldAssembly.add(boom2);

    modelGroup.add(sunshieldAssembly);
    
    // Initial state for animation
    modelGroup.scale.setScalar(3.5);
    modelGroup.rotation.set(0.5, -0.8, 0.2);
    modelGroup.position.set(-50, 10, -20);
    
    return modelGroup;
}


function mapScientificToVisualOrbit() {
    const starData = starTypes[interactiveSystemState.star.type];
    const distanceAU = interactiveSystemState.planet.orbitRadius; 

    const visualMinOrbit = starData.visualRadius * 2.5;

    const logMin = Math.log(SCIENTIFIC_MIN_AU);
    const logMax = Math.log(SCIENTIFIC_MAX_AU);
    const logCurrent = Math.log(distanceAU);

    const normalizedLogPos = Math.max(0, Math.min(1, (logCurrent - logMin) / (logMax - logMin)));

    return visualMinOrbit + normalizedLogPos * (VISUAL_MAX_ORBIT - visualMinOrbit);
}


function initThreeScene() {
    const mount = document.getElementById('three-canvas-container');
    if (!mount) return;

    scene = new THREE.Scene();
    sceneUI = new THREE.Scene();
    camera = new THREE.PerspectiveCamera(75, mount.clientWidth / mount.clientHeight, 0.1, 2000);
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(mount.clientWidth, mount.clientHeight);
    renderer.setPixelRatio(window.devicePixelRatio);
    mount.appendChild(renderer.domElement);

    renderer.autoClear = false;
    
    controls = new OrbitControls(camera, renderer.domElement);
    controls.enabled = false;
    camera.position.z = 120;
    
    scene.add(new THREE.AmbientLight(0xffffff, 0.5));

    sceneUI.add(new THREE.AmbientLight(0xffffff, 1.5));
    const dirLight = new THREE.DirectionalLight(0xffffff, 1.0);
    dirLight.position.set(5, 10, 7.5);
    sceneUI.add(dirLight);

    const starData = starTypes[initialSystemData.star.type];

    const renderScene = new RenderPass(scene, camera);
    // A subtle bloom is applied to give stars a gentle glow.
    bloomPass = new UnrealBloomPass(new THREE.Vector2(mount.clientWidth, mount.clientHeight), 1.5, 0.8, 0.1);
    composer = new EffectComposer(renderer);
    composer.addPass(renderScene);
    composer.addPass(bloomPass);

    updateStarBrightness();

    const starVertices = [];
    for (let i = 0; i < 10000; i++) {
        starVertices.push((Math.random() - 0.5) * 2000, (Math.random() - 0.5) * 2000, (Math.random() - 0.5) * 2000);
    }
    const starGeometry = new THREE.BufferGeometry();
    starGeometry.setAttribute('position', new THREE.Float32BufferAttribute(starVertices, 3));
    const starMaterial = new THREE.PointsMaterial({ color: 0xffffff, size: 0.25 });
    stars = new THREE.Points(starGeometry, starMaterial);
    scene.add(stars);

    const textures = {
        star: createProceduralTexture(starTextureGenerator, { size: 512, isRepeat: true, color: starData.color }),
        rocky: createProceduralTexture(rockyTextureGenerator, { size: 512, isRepeat: true }),
    };
    
    const clickableObjects = [];

    const systemGroup = new THREE.Group();
    systemGroup.position.set(...initialSystemData.position);
    
    const starGeo = new THREE.SphereGeometry(starTypes[initialSystemData.star.type].visualRadius, 64, 64);
    const starMat = new THREE.MeshBasicMaterial({
        map: textures.star,
    });
    starMesh = new THREE.Mesh(starGeo, starMat);
    starMesh.userData = { isStar: true };
    systemGroup.add(starMesh);

    const p = initialSystemData.planet;
    const planetGeo = new THREE.SphereGeometry(1, 32, 32); // Start with radius 1, then scale
    const planetMat = new THREE.MeshStandardMaterial({
        map: textures[p.textureType], roughness: 0.9, metalness: 0.1, color: 0xff6633
    });
    planetMesh = new THREE.Mesh(planetGeo, planetMat);
    clickableObjects.push(planetMesh);
    systemGroup.add(planetMesh);
    
    scene.add(systemGroup);

    keplerModel = createKeplerModel();
    sceneUI.add(keplerModel);
    keplerModel.visible = false;

    tessModel = createTESSModel();
    sceneUI.add(tessModel);
    tessModel.visible = false;
    
    jwstModel = createJWSTModel();
    sceneUI.add(jwstModel);
    jwstModel.visible = false;

    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();

    renderer.domElement.addEventListener('click', (event) => {
        if (!controls.enabled) return;
        const rect = renderer.domElement.getBoundingClientRect();
        mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
        mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
        raycaster.setFromCamera(mouse, camera);
        const intersects = raycaster.intersectObjects(clickableObjects);
        if (intersects.length > 0) {
            setPanelOpen('content-panel', 'content-tab', true);
        }
    });
    
    window.addEventListener('resize', () => {
        camera.aspect = mount.clientWidth / mount.clientHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(mount.clientWidth, mount.clientHeight);
        composer.setSize(mount.clientWidth, mount.clientHeight);
    });
    
    calculateDerivedData();
    updateStarVisuals();
    updatePlanetVisuals();

    const clock = new THREE.Clock();
    const animate = () => {
        requestAnimationFrame(animate);
        const elapsedTime = clock.getElapsedTime();

        if (isKeplerInHold) {
            const rot_hold_base = new THREE.Euler(-0.3 + Math.PI, 2.0, -0.1);
            const time = elapsedTime * 0.4;
            keplerModel.rotation.set(
                rot_hold_base.x + Math.cos(time * 0.8) * 0.1,
                rot_hold_base.y + Math.sin(time) * 0.15,
                rot_hold_base.z + Math.sin(time * 1.2) * 0.08
            );
        }

        if (isTessInHold) {
            const rot_hold_base = new THREE.Euler(0.2, -0.3, 0.1);
            const time = elapsedTime * 0.35;
            tessModel.rotation.set(
                rot_hold_base.x + Math.sin(time * 0.9) * 0.05,
                rot_hold_base.y + Math.cos(time) * 0.1,
                rot_hold_base.z + Math.sin(time * 1.1) * 0.05
            );
        }
        
        if (isJwstInHold) {
            const rot_hold_base = new THREE.Euler(0.2, -0.5, 0.1);
             const time = elapsedTime * 0.35;
             jwstModel.rotation.set(
                rot_hold_base.x + Math.cos(time) * 0.1,
                rot_hold_base.y + Math.sin(time * 0.8) * 0.15,
                rot_hold_base.z + Math.cos(time * 1.1) * 0.05
             );
        }
        
        planetMesh.rotation.y += 0.005;

        const angularSpeed = derivedPlanetData.orbitalPeriodDays > 0 ? (2 * Math.PI) / derivedPlanetData.orbitalPeriodDays : 0;
        const animationSpeedMultiplier = interactiveSystemState.planet.animationSpeed || 1.0;
        const orbitAngle = elapsedTime * angularSpeed * ANIMATION_TIME_SCALE * animationSpeedMultiplier;
        
        const visualOrbitRadius = mapScientificToVisualOrbit();
        planetMesh.position.x = Math.cos(orbitAngle) * visualOrbitRadius;
        planetMesh.position.z = Math.sin(orbitAngle) * visualOrbitRadius;


        const starData = starTypes[interactiveSystemState.star.type];
        const planetRadiusKm = interactiveSystemState.planet.radius * 71492;
        const starRadiusKm = starData.radiusSolar * 696340;
        const maxDip = Math.pow(planetRadiusKm / starRadiusKm, 2);

        let fluxDip = 0;
        const starR_visual = starData.visualRadius;
        const planetR_visual = planetMesh.geometry.parameters.radius * planetMesh.scale.x;
        const d_visual = Math.abs(planetMesh.position.x);

        const isTransiting = planetMesh.position.z > 0 && d_visual < starR_visual + planetR_visual;

        if (isTransiting) {
            if (d_visual <= starR_visual - planetR_visual) {
                fluxDip = maxDip;
            } else {
                const overlapDistance = (starR_visual + planetR_visual) - d_visual;
                const maxOverlap = 2 * Math.min(starR_visual, planetR_visual);
                const fraction = overlapDistance / maxOverlap;
                fluxDip = maxDip * Math.min(1.0, fraction * 2.0);
            }
        }
        
        const noise = (Math.random() - 0.5) * 0.0009; // Increased noise
        liveTransitDepth = 1.0 - fluxDip + noise;

        if (transitChart && transitChart.data) {
            const data = transitChart.data.datasets[0].data;
            data.shift();
            data.push(liveTransitDepth);
            transitChart.update('none');
        }

        if (stars) {
            stars.position.copy(camera.position);
        }
        
        if (controls.enabled) controls.update();
        
        renderer.clear();
        composer.render();
        renderer.clearDepth();
        renderer.render(sceneUI, camera);
    };
    animate();
}

function createTransitChart() {
    if (transitChart) { transitChart.destroy(); }
    const ctx = document.getElementById('transit-chart')?.getContext('2d');
    if (!ctx) return;
    const initialData = Array(150).fill(1.0).map(() => 1.0 + (Math.random() - 0.5) * 0.0009);
    transitChart = new Chart(ctx, {
      type: 'line',
      data: {
        labels: Array.from({ length: initialData.length }, (_, i) => i.toString()),
        datasets: [{
          label: 'Relative Flux', data: initialData, borderColor: 'rgb(54, 162, 235)',
          backgroundColor: 'rgba(54, 162, 235, 0.5)', pointRadius: 0, tension: 0.1,
          borderWidth: 2
        }]
      },
      options: {
        animation: false,
        scales: {
          y: { 
              title: { display: true, text: 'Relative Brightness', color: '#ccc' }, 
              min: 0.99, // Will be dynamically updated
              max: 1.001,
              ticks: { color: '#ccc', padding: 10 } 
          },
          x: { display: false }
        },
        plugins: { legend: { display: false }, title: { display: true, text: 'Live Light Curve', color: '#ccc', font: { size: 14 } } }
      }
    });
}

// --- Atmosphere Chart Logic ---
function gaussian(x, mean, stdDev, amplitude) {
    const exponent = -Math.pow(x - mean, 2) / (2 * Math.pow(stdDev, 2));
    return amplitude * Math.exp(exponent);
}

function createAtmosphereChart() {
    if (atmosphereChart) atmosphereChart.destroy();
    const ctx = document.getElementById('atmosphere-chart')?.getContext('2d');
    if (!ctx) return;
    
    const chartData = getAtmosphereSpectrumData();

    atmosphereChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: chartData.labels,
            datasets: [{
                label: 'Transit Depth',
                data: chartData.data,
                borderColor: 'rgb(77, 255, 145)',
                backgroundColor: 'rgba(77, 255, 145, 0.5)',
                pointRadius: 0,
                tension: 0.2,
                borderWidth: 2
            }]
        },
        options: {
            animation: { duration: 300, easing: 'easeOutCubic' },
            scales: {
                y: {
                    title: { display: true, text: 'Transit Depth (ppm)', color: '#ccc' },
                    ticks: { color: '#ccc', padding: 10 },
                },
                x: {
                    title: { display: true, text: 'Wavelength (nm)', color: '#ccc' },
                    ticks: { color: '#ccc', padding: 10, maxTicksLimit: 10 }
                }
            },
            plugins: {
                legend: { display: false },
                title: { display: false }
            }
        }
    });
}

function getAtmosphereSpectrumData() {
    // 1. Get all necessary state variables
    const { scaleHeight } = derivedAtmosphereData; // in km
    const H_meters = scaleHeight * 1000;
    const { gases, snr, cloudOpacity, cloudTopPressure, spectralResolution } = atmosphereState;
    const starRadiusM = starTypes[interactiveSystemState.star.type].radiusSolar * 6.957e8;
    const planetRadiusM = interactiveSystemState.planet.radius * 7.1492e7;

    const numPoints = 200;
    const minWavelength = 500, maxWavelength = 5000;
    
    // 2. Calculate baseline depth based on an opaque cloud deck at cloudTopPressure.
    // The number of scale heights up to the "top" of the atmosphere from the cloud deck.
    // This defines the planet's effective radius at the continuum.
    const N_heights_continuum = 5 * (1 - Math.log10(cloudTopPressure)); // log10(bar) is -2 to 0 -> N is 5 to 15.
    const effective_radius_at_continuum = planetRadiusM + N_heights_continuum * H_meters;
    const baseline_depth = Math.pow(effective_radius_at_continuum / starRadiusM, 2);
    
    const labels = [];
    const raw_data = []; // Data before noise is added

    // 3. Loop through wavelengths and build spectrum
    for (let i = 0; i < numPoints; i++) {
        const wavelength = minWavelength + (i / (numPoints - 1)) * (maxWavelength - minWavelength);
        labels.push(wavelength.toFixed(0));

        let total_feature_contribution = 0;

        // 4. Add spectral features for each enabled gas
        Object.entries(gases).forEach(([gas, props]) => {
            if (props.enabled) {
                GAS_PROPERTIES[gas].features.forEach(([center, depth_factor, intrinsic_width]) => {
                    // Feature amplitude is proportional to scale height and gas abundance.
                    // Using log1p for better sensitivity across many orders of magnitude of PPM.
                    const feature_amplitude = (2 * effective_radius_at_continuum * H_meters / Math.pow(starRadiusM, 2)) * depth_factor * Math.log1p(props.ppm);
                    
                    // 5. Apply spectral resolution broadening. Observed width is a combination of intrinsic and instrumental width.
                    const instrumental_width = center / spectralResolution;
                    const observed_width = Math.sqrt(Math.pow(intrinsic_width, 2) + Math.pow(instrumental_width, 2));
                    
                    total_feature_contribution += gaussian(wavelength, center, observed_width / 2.355, feature_amplitude);
                });
            }
        });
        
        // 6. Apply cloud opacity to mute features. opacity^0.5 provides a nicer feel to the slider.
        const final_feature_depth = total_feature_contribution * (1.0 - Math.sqrt(cloudOpacity));
        
        raw_data.push(baseline_depth + final_feature_depth);
    }
    
    // 7. Add noise based on SNR, scaled to the dynamic range of the signal.
    const data_min = Math.min(...raw_data);
    const data_max = Math.max(...raw_data);
    const signal_range = data_max - data_min > 1e-9 ? data_max - data_min : (data_max || 1e-5); // Avoid division by zero
    
    const final_data = raw_data.map(value => {
        const noise = (Math.random() - 0.5) * (signal_range / snr);
        return (value + noise) * 1e6; // Convert to ppm for display
    });

    return { labels, data: final_data };
}


function updateAtmosphereChart() {
    if (!atmosphereChart) return;
    const { labels, data } = getAtmosphereSpectrumData();
    atmosphereChart.data.labels = labels;
    atmosphereChart.data.datasets[0].data = data;
    atmosphereChart.update();
}