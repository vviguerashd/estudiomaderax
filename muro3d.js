(function(){
  const stage=document.getElementById('stage3d');
  function fail(msg){const d=document.createElement('div');d.className='fallback';d.textContent=msg;stage.appendChild(d);document.getElementById('hint3d').hidden=true;}
  if(!window.THREE||!THREE.OrbitControls){fail('No se pudo cargar el modelo 3D en este dispositivo. El plano con medidas está más abajo.');return;}
  let renderer;
  try{renderer=new THREE.WebGLRenderer({antialias:true,alpha:true});}catch(e){fail('Tu navegador no muestra modelos 3D. El plano con medidas está más abajo.');return;}
  renderer.setPixelRatio(Math.min(window.devicePixelRatio||1,2));
  renderer.shadowMap.enabled=true; renderer.shadowMap.type=THREE.PCFSoftShadowMap;
  
  stage.prepend(renderer.domElement);
  const scene=new THREE.Scene();
  const camera=new THREE.PerspectiveCamera(45,1,0.05,50);
  const controls=new THREE.OrbitControls(camera,renderer.domElement);
  controls.enableDamping=false;
  controls.minDistance=0.8; controls.maxDistance=8; controls.maxPolarAngle=Math.PI*0.495;
  controls.screenSpacePanning=true;

  // luces
  scene.add(new THREE.HemisphereLight(0xfff6ea,0x8a7d6c,0.75));
  const sun=new THREE.DirectionalLight(0xfff1dc,0.75);
  sun.position.set(1.2,3.6,4.5); sun.castShadow=true; sun.shadow.mapSize.set(2048,2048);
  Object.assign(sun.shadow.camera,{left:-3,right:3,top:3,bottom:-3,near:0.5,far:12}); sun.target.position.set(1.9,1,0.5); sun.shadow.camera.updateProjectionMatrix();
  scene.add(sun,sun.target);
  const fill=new THREE.DirectionalLight(0xffffff,0.25); fill.position.set(-2,2,2); scene.add(fill);

  const M=(c,o={})=>new THREE.MeshStandardMaterial(Object.assign({color:c,roughness:.85,metalness:0},o));
  function box(w,h,d,x,y,z,mat,shadow=true){ // x,y,z = esquina mínima
    const m=new THREE.Mesh(new THREE.BoxGeometry(w,h,d),mat);
    m.position.set(x+w/2,y+h/2,z+d/2); m.castShadow=shadow; m.receiveShadow=true; scene.add(m); return m;}

  const H=2.31, Z=0.055;
  const wall=M(0xeceae5), zoc=M(0xdcd8d0), paint=M(0xc9ad8c,{roughness:.95});
  const woods=[M(0xb58556,{roughness:.7}),M(0xae7f50,{roughness:.7}),M(0xba8b5c,{roughness:.7})];
  const base=M(0x7a5536,{roughness:.8});
  const walnut=M(0x5a3a24,{roughness:.55}), walnutD=M(0x3f2818,{roughness:.6});
  const laca=M(0x5a3a24,{roughness:.35});
  const tvM=M(0x0d0d0f,{roughness:.2,metalness:.3}), steel=M(0xb9bcbf,{roughness:.35,metalness:.6});

  // piso con losetas de 60 cm
  const cv=document.createElement('canvas'); cv.width=cv.height=256; const g=cv.getContext('2d');
  g.fillStyle='#d9d3c8'; g.fillRect(0,0,256,256); g.strokeStyle='#c4bdb1'; g.lineWidth=3; g.strokeRect(0,0,256,256);
  const tex=new THREE.CanvasTexture(cv); tex.wrapS=tex.wrapT=THREE.RepeatWrapping; tex.repeat.set(6.2/0.6,3.2/0.6);
  const floor=new THREE.Mesh(new THREE.PlaneGeometry(6.2,3.2),new THREE.MeshStandardMaterial({map:tex,roughness:.6}));
  floor.rotation.x=-Math.PI/2; floor.position.set(2.0,0,1.45); floor.receiveShadow=true; scene.add(floor);

  // muros existentes
  box(4.17,H,0.15,-0.15,0,-0.15,wall);           // fondo
  box(0.15,H,1.5,-0.15,0,0,wall);                 // retorno izquierdo
  box(0.15,H,0.15,3.87,0,0,wall);                 // castillo
  box(0.09,H,1.35,3.87,0,0.15,M(0xd9c6a6));       // bastidor (se ve en el canto)
  box(0.05,H,1.35,3.96,0,0.15,wall);              // triplay pintado lado refri
  // zoclo
  box(3.87,0.05,0.01,0,0,0,zoc,false); box(0.01,0.05,1.5,0,0,0,zoc,false);
  // pintura zona TV
  box(2.08,H-Z,0.004,0.75,Z,0,paint,false);

  // lambrín: tablero base + 4 listones por pieza de 15.5 cm
  const P=0.155, rib=0.026, step=P/4;
  function lambrinX(x0,x1,y0){ // sobre muro de fondo (cara z=0)
    box(x1-x0,H-y0,0.006,x0,y0,0,base,false);
    let i=0; for(let x=x0+0.006;x+rib<=x1+0.001;x+=step,i++) box(rib,H-y0,0.012,x,y0,0.006,woods[i%3]);
  }
  function lambrinZ(z0,z1,y0,xFace,dir){ // sobre retorno, dir=+1 cara mira a +x, -1 mira a -x
    const xb = dir>0? xFace : xFace-0.006;
    box(0.006,H-y0,z1-z0,xb,y0,z0,base,false);
    let i=0; for(let z=z0+0.006;z+rib<=z1+0.001;z+=step,i++){
      const xr = dir>0? xFace+0.006 : xFace-0.018;
      box(0.012,H-y0,rib,xr,y0,z,woods[i%3]);
    }
  }
  lambrinX(0.018,0.75,Z);
  lambrinX(2.83,3.866,Z);
  lambrinZ(0.018,1.5,Z,0,1);
  lambrinZ(0.004,1.5,0,3.87,-1);
  box(0.11,H,0.018,3.852,0,1.5,woods[1]);         // remate en U, canto del retorno derecho

  // repisas flotantes en L
  [1.40,1.75].forEach(top=>{
    box(0.65,0.075,0.25,3.852-0.65,top-0.075,0.018,laca);
    box(0.25,0.075,0.40,3.852-0.25,top-0.075,0.268,laca);
  });
  // mueble existente 2.50 m flotado, frente de listones
  const mx=1.79-1.25, my=0.15, mh=0.53, md=0.43;
  box(2.5,mh,md,mx,my,0.02,walnut);
  for(let x=mx+0.03;x<mx+2.47;x+=0.06) box(0.035,mh-0.06,0.012,x,my+0.03,0.02+md,walnutD,false);
  // TV 85"
  box(1.89,1.07,0.03,1.79-0.945,1.00,0.03,tvM);
  // refri (contexto)
  box(0.75,1.78,0.72,4.03,0,0.3,steel);
  // decoración mínima sobre repisas
  box(0.08,0.18,0.08,3.62,1.40,0.08,M(0xd8d2c6)); box(0.18,0.04,0.12,3.65,1.75,0.06,M(0x2e2a26));

  const views={
    'v-sala':{p:[0.55,1.55,3.55],t:[2.45,1.05,0.35]},
    'v-frente':{p:[1.93,1.25,4.6],t:[1.93,1.15,0.3]},
    'v-repisas':{p:[2.55,1.75,1.75],t:[3.62,1.5,0.25]},
    'v-planta':{p:[1.95,6.2,1.9],t:[1.95,0,0.8]}
  };
  let anim=null, current='v-sala', touched=false;
  function go(id,instant){
    current=id; const v=views[id]; document.querySelectorAll('.vistas3d button').forEach(b=>b.setAttribute('aria-pressed',b.id===id));
    const p0=camera.position.clone(), t0=controls.target.clone(), t1=new THREE.Vector3(...v.t), k=camera.aspect<1.2?Math.min(2.1,1.15/camera.aspect):1, p1=new THREE.Vector3(...v.p).sub(t1).multiplyScalar(k).add(t1);
    const reduce=window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if(instant||reduce){camera.position.copy(p1);controls.target.copy(t1);controls.update();render();return;}
    const start=performance.now(), dur=700;
    anim=function(now){const k=Math.min(1,(now-start)/dur), e=k<.5?2*k*k:1-Math.pow(-2*k+2,2)/2;
      camera.position.lerpVectors(p0,p1,e); controls.target.lerpVectors(t0,t1,e); controls.update(); render(); if(k<1) requestAnimationFrame(anim); else anim=null;};
    requestAnimationFrame(anim);
  }
  Object.keys(views).forEach(id=>document.getElementById(id).addEventListener('click',()=>{touched=false;go(id);}));

  function resize(){const w=stage.clientWidth,h=stage.clientHeight;renderer.setSize(w,h,false);camera.aspect=w/h;camera.fov=w<600?50:45;camera.updateProjectionMatrix();if(!touched&&current)go(current,true);else render();}
  function render(){renderer.render(scene,camera);}
  let raf=null;
  controls.addEventListener('change',()=>{ if(!raf){raf=requestAnimationFrame(()=>{raf=null;controls.update();render();});} });
  controls.addEventListener('start',()=>{touched=true;current=null;document.getElementById('hint3d').hidden=true;document.querySelectorAll('.vistas3d button').forEach(b=>b.setAttribute('aria-pressed','false'));});
  new ResizeObserver(resize).observe(stage);
  resize();
})();
