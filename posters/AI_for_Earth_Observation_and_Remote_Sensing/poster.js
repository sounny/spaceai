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

  const engine = new BABYLON.Engine(canvas, true);
  const scene = new BABYLON.Scene(engine);
  scene.clearColor = new BABYLON.Color4(0.05, 0.05, 0.15, 1);

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
    { label: 'EVI Analysis', color: new BABYLON.Color3(1, 0.6, 0.2), info: 'Vegetation health mapping' },
    { label: 'Deployment', color: new BABYLON.Color3(0.9, 0.3, 0.5), info: 'Community integration' }
  ];

  const cubes = [];
  const spacing = 4;

  milestones.forEach((milestone, i) => {
    const box = BABYLON.MeshBuilder.CreateBox('cube' + i, { size: 2 }, scene);
    box.position.x = (i - milestones.length / 2 + 0.5) * spacing;
    
    const material = new BABYLON.StandardMaterial('mat' + i, scene);
    material.diffuseColor = milestone.color;
    material.specularColor = new BABYLON.Color3(0.3, 0.3, 0.3);
    box.material = material;

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
      })
    );
    box.actionManager.registerAction(
      new BABYLON.ExecuteCodeAction(BABYLON.ActionManager.OnPointerOutTrigger, () => {
        box.scaling = new BABYLON.Vector3(1, 1, 1);
        canvas.style.cursor = 'default';
      })
    );
    box.actionManager.registerAction(
      new BABYLON.ExecuteCodeAction(BABYLON.ActionManager.OnPickTrigger, () => {
        alert(milestone.label + '\n' + milestone.info);
      })
    );

    cubes.push(box);
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
