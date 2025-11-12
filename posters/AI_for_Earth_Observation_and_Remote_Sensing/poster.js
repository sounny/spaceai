// poster.js — Clean implementation with 3D timeline cubes

// Video loop setup
function setupVideoLoop() {
  const topVideo = document.getElementById('top-video');
  const bottomVideo = document.getElementById('bottom-video');
  if (topVideo) {
    topVideo.addEventListener('ended', () => { topVideo.currentTime = 0; topVideo.play(); });
  }
  if (bottomVideo) {
    bottomVideo.addEventListener('ended', () => { bottomVideo.currentTime = 0; bottomVideo.play(); });
  }
}

// 3D Timeline Cubes with Babylon.js
function initTimelineCubes3D() {
  const canvas = document.getElementById('timeline-canvas');
  if (!canvas) {
    console.error('Timeline canvas not found');
    return;
  }
  
  if (typeof BABYLON === 'undefined') {
    console.error('Babylon.js library not loaded');
    return;
  }

  // Create tooltip element
  const tooltip = document.createElement('div');
  tooltip.id = 'cube-tooltip';
  tooltip.style.position = 'absolute';
  tooltip.style.background = 'rgba(0, 0, 0, 0.9)';
  tooltip.style.color = 'white';
  tooltip.style.padding = '10px 15px';
  tooltip.style.borderRadius = '6px';
  tooltip.style.fontSize = '14px';
  tooltip.style.pointerEvents = 'none';
  tooltip.style.display = 'none';
  tooltip.style.zIndex = '1000';
  tooltip.style.border = '1px solid rgba(255, 255, 255, 0.3)';
  document.body.appendChild(tooltip);

  const engine = new BABYLON.Engine(canvas, true);
  const scene = new BABYLON.Scene(engine);
  scene.clearColor = new BABYLON.Color4(0, 0, 0, 0);

  // Camera
  const camera = new BABYLON.ArcRotateCamera('camera', Math.PI / 2, Math.PI / 3, 15, BABYLON.Vector3.Zero(), scene);
  camera.attachControl(canvas, true);
  camera.lowerRadiusLimit = 10;
  camera.upperRadiusLimit = 25;

  // Lighting
  const light = new BABYLON.HemisphericLight('light', new BABYLON.Vector3(0, 1, 0), scene);
  light.intensity = 0.8;

  // Timeline data
  const milestones = [
    { label: 'Data Collection', color: new BABYLON.Color3(0.2, 0.6, 1), info: 'Sentinel-2 imagery acquisition' },
    { label: 'AI Processing', color: new BABYLON.Color3(0.4, 0.8, 0.3), info: 'GEE & AI classification' },
    { label: 'EVI Analysis', color: new BABYLON.Color3(1, 0.6, 0.2), info: 'Vegetation health mapping' }
  ];

  const cubes = [];
  const spacing = 4;
  
  // Phase labels for each cube
  const phaseLabels = [
    'Phase I: Data & Information',
    'Phase II: Innovation & Deployment',
    'Phase III: Application & Impact'
  ];

  milestones.forEach((milestone, i) => {
    const box = BABYLON.MeshBuilder.CreateBox('cube' + i, { size: 2 }, scene);
    box.position.x = (i - milestones.length / 2 + 0.5) * spacing;
    
    const material = new BABYLON.StandardMaterial('mat' + i, scene);
    material.diffuseColor = milestone.color;
    material.specularColor = new BABYLON.Color3(0.3, 0.3, 0.3);
    box.material = material;

    // Create text label below each cube
    const label = BABYLON.MeshBuilder.CreatePlane('label' + i, { width: 5, height: 1 }, scene);
    label.position.x = box.position.x;
    label.position.y = -2.5;
    label.position.z = 0;
    
    const labelTexture = new BABYLON.DynamicTexture('labelTexture' + i, { width: 512, height: 128 }, scene);
    const labelMaterial = new BABYLON.StandardMaterial('labelMat' + i, scene);
    labelMaterial.diffuseTexture = labelTexture;
    labelMaterial.emissiveColor = new BABYLON.Color3(1, 1, 1);
    labelMaterial.backFaceCulling = false;
    label.material = labelMaterial;
    
    // Draw text on texture
    const ctx = labelTexture.getContext();
    ctx.fillStyle = 'white';
    ctx.font = 'bold 32px Arial';
    ctx.textAlign = 'center';
    ctx.fillText(phaseLabels[i], 256, 64);
    labelTexture.update();

    // Animation
    scene.registerBeforeRender(() => {
      box.rotation.y += 0.01;
      box.rotation.x = Math.sin(Date.now() * 0.001 + i) * 0.1;
    });

    // Hover interaction
    box.actionManager = new BABYLON.ActionManager(scene);
    box.actionManager.registerAction(
      new BABYLON.ExecuteCodeAction(BABYLON.ActionManager.OnPointerOverTrigger, () => {
        box.scaling = new BABYLON.Vector3(1.2, 1.2, 1.2);
        canvas.style.cursor = 'pointer';
        
        // Show tooltip for all cubes
        const tooltipTexts = [
          '<table border="1" cellpadding="6" cellspacing="0" style="border-collapse: collapse; width: 100%;"><caption style="caption-side: top; text-align: left; font-weight: bold;">Downstream (2031–2035)</caption><thead><tr><th>Objective</th><th>Action</th><th>End Users / Partners</th></tr></thead><tbody><tr><td>Farmer services</td><td>AI-driven advisories via SMS / WhatsApp on planting, irrigation, and stress alerts</td><td>Farmers / Cooperatives</td></tr><tr><td>Climate-risk finance</td><td>Integrate vegetation indices into micro-insurance and credit tools</td><td>Banks / Insurers</td></tr><tr><td>Policy alignment</td><td>Standardize EO indicators for SDG 2.4 (sustainable agriculture)</td><td>Ministries / AU / FAO</td></tr><tr><td>GeoAI Observatory</td><td>Create a continental innovation hub with open APIs for AgTech startups</td><td>AfSA / UNOOSA / ISU</td></tr></tbody></table><p><strong>Outcome:</strong> GeoAI insights translated into actionable, localized decisions that directly support farmers and national food systems.</p>',
          '<table border="1" cellpadding="6" cellspacing="0" style="border-collapse: collapse; width: 100%;"><caption style="caption-side: top; text-align: left; font-weight: bold;">Midstream (2027–2031)</caption><thead><tr><th>Objective</th><th>Application</th><th>Tools / Outputs</th></tr></thead><tbody><tr><td>Forecast vegetation &amp; yield</td><td>Temporal CNN/Transformer models for crop stress and yield prediction</td><td>TensorFlow + GEE</td></tr><tr><td>Integrate climate &amp; soil</td><td>Fuse Sentinel + CHIRPS + SoilGrids + ET<sub>0</sub> for evapotranspiration &amp; moisture mapping</td><td>GeoAI ET Fusion Models</td></tr><tr><td>Policy dashboards</td><td>Develop interactive dashboards for vegetation and rainfall anomalies</td><td>GEE Apps / Leaflet</td></tr><tr><td>Digital twin</td><td>Simulate agricultural scenarios across Africa</td><td>ESA Φ-Lab / DESTIN-E</td></tr></tbody></table><p><strong>Outcome:</strong> Operational AI systems predicting drought, crop yield, and irrigation demand.</p>',
          '<table border="1" cellpadding="6" cellspacing="0" style="border-collapse: collapse; width: 100%;"><caption style="caption-side: top; text-align: left; font-weight: bold;">Upstream (2025–2027)</caption><thead><tr><th>Objective</th><th>Activity</th><th>Partners / Outputs</th></tr></thead><tbody><tr><td>Build EO–AI foundation</td><td>Integrate Sentinel-1, 2, 3 &amp; 5P into unified African data cubes</td><td>ESA / Copernicus / AfSA</td></tr><tr><td>Scalable processing</td><td>Deploy cloud-native GEE environments hosted in Africa</td><td>GMES &amp; Africa / RCMRD</td></tr></tbody></table>',
        ];
        tooltip.innerHTML = tooltipTexts[i];
        tooltip.style.display = 'block';
      })
    );
    box.actionManager.registerAction(
      new BABYLON.ExecuteCodeAction(BABYLON.ActionManager.OnPointerOutTrigger, () => {
        box.scaling = new BABYLON.Vector3(1, 1, 1);
        canvas.style.cursor = 'default';
        
        // Hide tooltip
        tooltip.style.display = 'none';
      })
    );
    box.actionManager.registerAction(
      new BABYLON.ExecuteCodeAction(BABYLON.ActionManager.OnPickTrigger, () => {
        alert(milestone.label + '\n' + milestone.info);
      })
    );

    cubes.push(box);
  });

  // Track mouse position for tooltip
  canvas.addEventListener('mousemove', (event) => {
    tooltip.style.left = (event.pageX + 15) + 'px';
    tooltip.style.top = (event.pageY + 15) + 'px';
  });

  // Render loop
  engine.runRenderLoop(() => {
    scene.render();
  });

  // Resize handling
  window.addEventListener('resize', () => {
    engine.resize();
  });
  
  console.log('Timeline cubes initialized successfully');
}

// Section navigation highlight
function updateActiveSection() {
  const sections = document.querySelectorAll('.section-box[id^="section-"]');
  const navPoints = document.querySelectorAll('.nav-point');
  
  if (navPoints.length === 0) return;
  
  let currentSection = '';
  sections.forEach(section => {
    const rect = section.getBoundingClientRect();
    if (rect.top <= 150 && rect.bottom >= 150) {
      currentSection = section.id;
    }
  });
  
  navPoints.forEach(point => {
    const href = point.getAttribute('href');
    if (href) {
      const targetId = href.substring(1);
      if (targetId === currentSection) {
        point.classList.add('active');
      } else {
        point.classList.remove('active');
      }
    }
  });
}

// Initialize everything
document.addEventListener('DOMContentLoaded', () => {
  console.log('DOM loaded, initializing...');
  
  setupVideoLoop();
  
  // Wait a bit for Babylon.js to load if needed
  setTimeout(() => {
    initTimelineCubes3D();
  }, 100);
  
  window.addEventListener('scroll', updateActiveSection);
  updateActiveSection();
});
