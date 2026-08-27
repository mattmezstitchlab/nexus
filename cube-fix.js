// NEXUS V15 — visible central intelligence cube enhancement.
// Runs after the existing constellation has been created.
(function(){
  if (!window.THREE || !window.scene || !window.root) return;

  const cube = new THREE.Group();
  cube.name = 'NEXUS_CENTRAL_CUBE';
  cube.position.set(0, 0, 0);
  root.add(cube);

  const frame = new THREE.LineSegments(
    new THREE.EdgesGeometry(new THREE.BoxGeometry(62,62,62)),
    new THREE.LineBasicMaterial({ color:0xeaf7ff, transparent:true, opacity:.9 })
  );
  cube.add(frame);

  const inner = new THREE.Mesh(
    new THREE.BoxGeometry(42,42,42),
    new THREE.MeshBasicMaterial({ color:0x9fdcff, transparent:true, opacity:.045, wireframe:true })
  );
  cube.add(inner);

  const core = new THREE.Mesh(
    new THREE.IcosahedronGeometry(12,2),
    new THREE.MeshBasicMaterial({ color:0xf5fbff, transparent:true, opacity:.96 })
  );
  cube.add(core);

  const glow = new THREE.Mesh(
    new THREE.SphereGeometry(25,32,32),
    new THREE.MeshBasicMaterial({ color:0x8fd8ff, transparent:true, opacity:.075, wireframe:true })
  );
  cube.add(glow);

  const beams = new THREE.Group();
  root.add(beams);
  ['lea','marco','claire','photo','ceremony'].forEach(id=>{
    const target = window.objects && window.objects[id];
    if (!target) return;
    const geo = new THREE.BufferGeometry().setFromPoints([
      new THREE.Vector3(0,0,0), target.position.clone()
    ]);
    const line = new THREE.Line(geo,new THREE.LineBasicMaterial({
      color:0x9fdcff,transparent:true,opacity:.16
    }));
    beams.add(line);
  });

  window.nexusCube = cube;
  window.addEventListener('nexus-cube-focus',()=>{
    if (window.controls) window.controls.target.set(0,0,0);
  });

  // Make the cube continuously readable without dominating the constellation.
  function animateCube(){
    if (!window.nexusCube) return;
    const t=performance.now()*.001;
    cube.rotation.x=t*.11;
    cube.rotation.y=t*.17;
    inner.rotation.x=-t*.08;
    inner.rotation.z=t*.12;
    glow.scale.setScalar(1+Math.sin(t*1.8)*.06);
    core.scale.setScalar(1+Math.sin(t*2.2)*.07);
    requestAnimationFrame(animateCube);
  }
  animateCube();
})();
