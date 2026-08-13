(function(){
'use strict';

function die(msg){
  var e=document.getElementById('err');
  e.style.display='block';
  e.textContent='ERROR: '+msg;
  console.error('VOYAGE ERROR:',msg);
}

if(typeof THREE==='undefined'){die('THREE.js not loaded');return;}
if(typeof THREE.GLTFLoader==='undefined'){die('GLTFLoader not loaded');return;}

var W=window.innerWidth, H=window.innerHeight;

/* ═══ RENDERERS ═══ */
var bookR = new THREE.WebGLRenderer({antialias:true, alpha:true});
bookR.setPixelRatio(Math.min(window.devicePixelRatio,2));
bookR.setSize(W,H);
bookR.domElement.id='book-canvas';
document.body.appendChild(bookR.domElement);

var mapR = new THREE.WebGLRenderer({antialias:true, alpha:true});
mapR.setPixelRatio(Math.min(window.devicePixelRatio,2));
mapR.setSize(W,H);
mapR.domElement.id='map-canvas';
document.body.appendChild(mapR.domElement);

var boatR = new THREE.WebGLRenderer({antialias:true, alpha:true});
boatR.setPixelRatio(Math.min(window.devicePixelRatio,2));
boatR.setSize(W,H);
boatR.domElement.id='boat-canvas';
document.body.appendChild(boatR.domElement);

var miniCanvas = document.getElementById('minimap-canvas');
var miniR = new THREE.WebGLRenderer({antialias:true, alpha:true, canvas:miniCanvas});
miniR.setPixelRatio(1);
miniR.setSize(170,128);

var cuCanvas = document.getElementById('closeup-canvas');
var cuR = new THREE.WebGLRenderer({antialias:true, alpha:true, canvas:cuCanvas});
cuR.setPixelRatio(1);
cuR.setSize(300,412);

/* ═══ CAMERAS ═══ */
var bookCam = new THREE.PerspectiveCamera(45, W/H, 0.01, 500);
bookCam.position.set(0, 0.8, 5.5);
bookCam.lookAt(0, 0.3, 0);

var mapCam = new THREE.PerspectiveCamera(45, W/H, 0.01, 500);
mapCam.position.set(0, 2.5, 7);
mapCam.lookAt(0, -0.3, 0);

var boatCam = new THREE.PerspectiveCamera(45, W/H, 0.01, 500);
boatCam.position.set(0, 2.5, 7);
boatCam.lookAt(0, -0.3, 0);

var miniCam = new THREE.PerspectiveCamera(50, 170/128, 0.01, 500);
miniCam.position.set(0, 7, 9);
miniCam.lookAt(0, 0, 0);

var cuCam = new THREE.PerspectiveCamera(35, 300/412, 0.01, 500);
cuCam.position.set(0, 0.5, 3.5);
cuCam.lookAt(0, 0.3, 0);

/* ═══ SCENES ═══ */
function mkDL(col, intensity, x, y, z){
  var l = new THREE.DirectionalLight(col, intensity);
  l.position.set(x,y,z);
  return l;
}

var bookS = new THREE.Scene();
bookS.add(new THREE.AmbientLight(0xffffff, 0.9));
bookS.add(mkDL(0xffd090, 0.8, 3, 5, 4));

var mapS = new THREE.Scene();
mapS.add(new THREE.AmbientLight(0xffffff, 0.85));
mapS.add(mkDL(0xffffff, 0.9, 5, 10, 7));
mapS.add(mkDL(0xffd090, 0.4, -5, 5, -5));

var boatS = new THREE.Scene();
boatS.add(new THREE.AmbientLight(0xffffff, 1.0));
boatS.add(mkDL(0xffd090, 1.1, 3, 8, 5));
boatS.add(mkDL(0xffffff, 0.5, -3, 4, -2));

var cuS = new THREE.Scene();
cuS.add(new THREE.AmbientLight(0xffffff, 1.0));
cuS.add(mkDL(0xffd090, 0.8, 2, 4, 3));

/* ═══ STATE ═══ */
var clock = new THREE.Clock();
var loader = new THREE.GLTFLoader();
var ray = new THREE.Raycaster();
var mouse = new THREE.Vector2();

var bookRoot=null, mapRoot=null, boatRoot=null, cuRoot=null;
var appState = 'loading';
var baseMapScale = 1, mapMult = 2.4;
var bx = W/2, by = H*0.52;
var dragging = false, dox = 0, doy = 0;
var cuRaf = null;
var visitedCount = 0;
var animating = false;

/* ═══ WAYPOINTS ═══ */
var WP = [
  {nx:0.20,ny:0.40,title:'Port Royal',sub:'Gateway of the Caribbean',
   body:'The legendary port city where the British Navy held dominion and pirates swung from the gallows. Captain Jack Sparrow arrived in a sinking dinghy yet walked away with a ship.',
   quote:'"The code is more what you would call guidelines than actual rules." — Barbossa',
   done:false,hue:32},
  {nx:0.75,ny:0.38,title:'Tortuga',sub:'Isle of Pirates',
   body:'A lawless island beyond any law, where rum flows freely and every scoundrel finds fellowship. The only place in the Caribbean where a pirate is truly free.',
   quote:'"You are the worst pirate I have ever heard of." "But you have heard of me." — Will & Jack',
   done:false,hue:28},
  {nx:0.30,ny:0.65,title:'Shipwreck Cove',sub:'Seat of the Brethren Court',
   body:'Hidden behind treacherous reefs, Shipwreck Cove is the secret meeting place of the nine Pirate Lords. Here the Brethren Court convened to face the East India Trading Company.',
   quote:'"The pirates who can face it are truly free." — Captain Teague',
   done:false,hue:36},
  {nx:0.68,ny:0.62,title:'Isla de Muerta',sub:'Isle of the Dead',
   body:'A cursed island that cannot be found except by those who already know where it is. Within golden caverns lies the treasure of Cortes and the curse that doomed an entire crew.',
   quote:'"Blood must pay for blood." — Barbossa',
   done:false,hue:24},
  {nx:0.50,ny:0.28,title:'Singapore',sub:'The Eastern Seas',
   body:'The exotic port ruled by Pirate Lord Sao Feng. Beneath incense and lantern-light, dangerous dealings are struck and betrayal is always just one bribe away.',
   quote:'"The world used to be a bigger place." — Jack Sparrow',
   done:false,hue:30},
  {nx:0.16,ny:0.57,title:"Rum Runner's Isle",sub:'The Marooning Ground',
   body:'A desolate strip of sand where Jack was marooned with a pistol containing a single shot — a gift he carried ten years, waiting for the perfect moment.',
   quote:'"Why is the rum always gone?" — Captain Jack Sparrow',
   done:false,hue:38},
  {nx:0.83,ny:0.52,title:'Fountain of Youth',sub:'Eternal Waters',
   body:'The legendary spring sought by Ponce de Leon and Blackbeard alike. Two silver chalices, a mermaid tear — one must sacrifice years to grant another eternal life.',
   quote:'"Not all treasure is silver and gold, mate." — Jack Sparrow',
   done:false,hue:34},
  {nx:0.50,ny:0.74,title:"Davy Jones Locker",sub:'Purgatory of the Seas',
   body:'A vast white desert at the edge of the world — prison of those who die at sea without redemption. Here time moves strangely and a man loses his mind before his life.',
   quote:'"Life is cruel. Why should the afterlife be any different?" — Davy Jones',
   done:false,hue:22}
];

/* ═══ LOADING ═══ */
function setProgress(f){
  var p = Math.round(Math.min(f,1)*100);
  var bar = document.getElementById('bar');
  var pct = document.getElementById('pct');
  if(bar) bar.style.width = p+'%';
  if(pct) pct.textContent = p+'%';
}

function fitTo(obj, size){
  obj.updateWorldMatrix(true, true);
  var box = new THREE.Box3().setFromObject(obj);
  if(box.isEmpty()) return;
  var sz = new THREE.Vector3(); box.getSize(sz);
  var ct = new THREE.Vector3(); box.getCenter(ct);
  var mx = Math.max(sz.x, sz.y, sz.z);
  if(mx <= 0) return;
  var s = size/mx;
  obj.scale.setScalar(s);
  obj.position.set(-ct.x*s, -ct.y*s, -ct.z*s);
}

/* ═══ TRANSITION: Book → Map ═══ */
function goToMap(){
  if(appState !== 'book' || animating) return;
  animating = true;
  appState = 'transitioning';
  var hint = document.getElementById('book-hint');
  if(hint) hint.style.display = 'none';
  var fade = document.getElementById('fade');
  fade.classList.add('in');
  setTimeout(function(){
    document.body.classList.add('map-mode');
    animateMapIn();
    fade.classList.remove('in');
    setTimeout(function(){
      var t = document.getElementById('map-title');
      if(t) t.style.opacity = '1';
      appState = 'map';
      animating = false;
      updateHint();
    }, 800);
  }, 900);
}

function animateMapIn(){
  if(!mapRoot) return;
  mapRoot.scale.setScalar(0.001);
  mapRoot.rotation.y = 0;
  var t0 = performance.now(), dur = 1000;
  var tgt = baseMapScale * mapMult;
  (function tick(){
    var p = Math.min((performance.now()-t0)/dur, 1);
    var ease = 1 - Math.pow(1-p, 3);
    mapRoot.scale.setScalar(0.001 + ease*(tgt-0.001));
    if(p < 1) requestAnimationFrame(tick);
  })();
}

/* ═══ MINI-MAP CLICK → RESET ═══ */
document.getElementById('minimap-canvas').addEventListener('click', function(){
  if(appState !== 'map') return;
  animateMapIn();
  bx = W/2; by = H*0.52;
  updateBoatEl();
});

/* ═══ HINT ═══ */
function updateHint(){
  var h = document.getElementById('waypoint-hint');
  if(!h) return;
  h.textContent = visitedCount >= WP.length
    ? 'All locations discovered — you are a true Pirate Legend!'
    : 'Drag the ship to discover locations (' + visitedCount + '/' + WP.length + ')';
}

/* ═══ BOAT DRAG ═══ */
var boatEl = document.getElementById('boat-drag');
function updateBoatEl(){
  boatEl.style.left = bx + 'px';
  boatEl.style.top  = by + 'px';
}
updateBoatEl();

function s2w(sx, sy){
  var nx = (sx/W)*2 - 1;
  var ny = -(sy/H)*2 + 1;
  var v = new THREE.Vector3(nx, ny, 0.5).unproject(mapCam);
  var d = v.sub(mapCam.position).normalize();
  if(Math.abs(d.y) < 0.0001) return new THREE.Vector3(0,0,0);
  var t = -mapCam.position.y / d.y;
  return new THREE.Vector3(
    mapCam.position.x + d.x*t,
    0,
    mapCam.position.z + d.z*t
  );
}

function syncBoat(){
  if(!boatRoot) return;
  var w = s2w(bx, by);
  boatRoot.position.set(w.x, 0.28, w.z);
}

boatEl.addEventListener('mousedown', function(e){
  if(appState !== 'map') return;
  e.preventDefault();
  dragging = true;
  dox = e.clientX - bx;
  doy = e.clientY - by;
  boatEl.style.cursor = 'grabbing';
});

document.addEventListener('mousemove', function(e){
  if(!dragging) return;
  bx = Math.max(60, Math.min(W-60, e.clientX - dox));
  by = Math.max(60, Math.min(H-60, e.clientY - doy));
  updateBoatEl();
  syncBoat();
});

document.addEventListener('mouseup', function(){
  if(!dragging) return;
  dragging = false;
  boatEl.style.cursor = 'grab';
  checkWP();
});

boatEl.addEventListener('touchstart', function(e){
  if(appState !== 'map') return;
  e.preventDefault();
  var t = e.touches[0];
  dragging = true;
  dox = t.clientX - bx;
  doy = t.clientY - by;
}, {passive:false});

document.addEventListener('touchmove', function(e){
  if(!dragging) return;
  e.preventDefault();
  var t = e.touches[0];
  bx = Math.max(60, Math.min(W-60, t.clientX - dox));
  by = Math.max(60, Math.min(H-60, t.clientY - doy));
  updateBoatEl();
  syncBoat();
}, {passive:false});

document.addEventListener('touchend', function(){
  if(!dragging) return;
  dragging = false;
  checkWP();
});

/* ═══ WAYPOINT CHECK ═══ */
function checkWP(){
  if(appState !== 'map') return;
  for(var i=0; i<WP.length; i++){
    var wp = WP[i];
    if(wp.done) continue;
    var dx = bx - wp.nx*W;
    var dy = by - wp.ny*H;
    if(Math.sqrt(dx*dx + dy*dy) < 100){
      wp.done = true;
      visitedCount++;
      doArrival(bx, by, wp);
      break;
    }
  }
}

/* ═══ ARRIVAL ANIMATION ═══ */
function doArrival(sx, sy, wp){
  var colors = ['#DAA520','#FF8C00','#ffffff'];
  for(var i=0; i<3; i++){
    (function(delay, color){
      setTimeout(function(){
        var r = document.createElement('div');
        r.className = 'arr-ring';
        r.style.left = sx + 'px';
        r.style.top  = sy + 'px';
        r.style.borderColor = color;
        r.style.animationDuration = (0.9 + delay*0.0005) + 's';
        document.body.appendChild(r);
        setTimeout(function(){ r.remove(); }, 1300);
      }, delay);
    })(i*200, colors[i]);
  }
  /* boat: scale up → scale down → show popup */
  boatEl.style.transition = 'transform 0.7s cubic-bezier(0.175,0.885,0.32,1.275)';
  boatEl.style.transform  = 'translate(-50%,-50%) scale(2.8)';
  setTimeout(function(){
    boatEl.style.transition = 'transform 0.4s ease';
    boatEl.style.transform  = 'translate(-50%,-50%) scale(1)';
    setTimeout(function(){
      showLocation(wp);
    }, 420);
  }, 730);
  updateHint();
}

/* ═══ LOCATION POPUP ═══ */
function showLocation(wp){
  document.getElementById('loc-title').textContent = wp.title;
  document.getElementById('loc-sub').textContent   = wp.sub;
  document.getElementById('loc-body').textContent  = wp.body;
  document.getElementById('loc-quote').textContent = wp.quote;

  var box = document.getElementById('location-box');
  var h = wp.hue;
  box.style.background = 'radial-gradient(ellipse at 35% 25%,hsl('+(h+12)+',60%,74%) 0%,hsl('+h+',54%,58%) 38%,hsl('+(h-14)+',48%,36%) 100%)';

  var ov = document.getElementById('location-overlay');
  ov.style.display = 'flex';
  box.style.transform = 'scale(0.04)';
  /* force reflow */
  box.offsetHeight;
  box.style.transition = 'transform 0.8s cubic-bezier(0.175,0.885,0.32,1.275)';
  setTimeout(function(){
    ov.style.opacity = '1';
    box.style.transform = 'scale(1)';
  }, 20);
}

document.getElementById('close-loc').addEventListener('click', function(){
  var ov  = document.getElementById('location-overlay');
  var box = document.getElementById('location-box');
  ov.style.opacity = '0';
  box.style.transition = 'transform 0.45s ease';
  box.style.transform  = 'scale(0.04)';
  setTimeout(function(){ ov.style.display='none'; }, 500);
});

/* ═══ RULES POPUP ═══ */
document.getElementById('open-rules-btn').addEventListener('click', function(){
  var ov = document.getElementById('rules-overlay');
  ov.style.display  = 'flex';
  ov.style.opacity  = '0';
  var wrap = document.getElementById('rules-wrap');
  wrap.style.transform = 'scale(0.3) rotateY(28deg)';
  wrap.style.transition = 'transform 0.65s cubic-bezier(0.175,0.885,0.32,1.275)';
  setTimeout(function(){
    ov.style.opacity = '1';
    wrap.style.transform = 'scale(1) rotateY(0deg)';
  }, 20);
  startCloseup();
});

document.getElementById('close-rules').addEventListener('click', function(){
  var ov   = document.getElementById('rules-overlay');
  var wrap = document.getElementById('rules-wrap');
  ov.style.opacity = '0';
  wrap.style.transform = 'scale(0.3) rotateY(28deg)';
  setTimeout(function(){
    ov.style.display = 'none';
    stopCloseup();
  }, 480);
});

function startCloseup(){
  if(cuRaf) return;
  (function tick(){
    cuRaf = requestAnimationFrame(tick);
    if(cuRoot){
      var t = clock.getElapsedTime();
      cuRoot.scale.setScalar(cuRoot._bs * 2);
      cuRoot.rotation.y    = t * 0.35;
      cuRoot.position.y    = Math.sin(t*0.7) * 0.06;
    }
    cuR.render(cuS, cuCam);
  })();
}
function stopCloseup(){
  if(cuRaf){ cancelAnimationFrame(cuRaf); cuRaf=null; }
}

/* ═══ RENDER LOOP ═══ */
function animate(){
  requestAnimationFrame(animate);
  var t = clock.getElapsedTime();
  if(bookRoot && (appState==='book' || appState==='transitioning')){
    bookRoot.rotation.y = Math.sin(t*0.4)*0.35;
    bookRoot.position.y = Math.sin(t*0.7)*0.08;
    bookR.render(bookS, bookCam);
  }
  if(appState==='map' || appState==='transitioning'){
    if(mapRoot) mapRoot.position.y = Math.sin(t*0.3)*0.04;
    mapR.render(mapS, mapCam);
    if(boatRoot){
      boatRoot.rotation.y = t * 0.85;
      boatRoot.position.y = 0.28 + Math.sin(t*1.3)*0.07;
    }
    boatR.render(boatS, boatCam);
    miniR.render(mapS, miniCam);
  }
}

/* ═══ BOOK CLICK ═══ */
bookR.domElement.addEventListener('pointerdown', function(e){
  if(appState !== 'book' || !bookRoot) return;
  mouse.x = (e.clientX/W)*2 - 1;
  mouse.y = -(e.clientY/H)*2 + 1;
  ray.setFromCamera(mouse, bookCam);
  var hits = ray.intersectObject(bookRoot, true);
  if(hits.length > 0) goToMap();
  else goToMap(); /* click anywhere in book scene = go to map */
});

/* ═══ RESIZE ═══ */
window.addEventListener('resize', function(){
  W = window.innerWidth; H = window.innerHeight;
  bookCam.aspect = W/H; bookCam.updateProjectionMatrix();
  mapCam.aspect  = W/H; mapCam.updateProjectionMatrix();
  boatCam.aspect = W/H; boatCam.updateProjectionMatrix();
  bookR.setSize(W,H); mapR.setSize(W,H); boatR.setSize(W,H);
});

/* ═══ LOAD MODELS ═══ */
setProgress(0.05);
var loaded = 0;
var total  = 3;

/* fake progress animation so bar moves even without xhr events */
var fakeP = 0.05;
var fakePInterval = setInterval(function(){
  if(fakeP < 0.88){ fakeP += 0.008; setProgress(fakeP); }
}, 120);

function onLoad(){
  loaded++;
  console.log('Loaded', loaded, '/', total);
  setProgress(0.05 + (loaded/total)*0.95);
  if(loaded >= total){
    clearInterval(fakePInterval);
    setProgress(1);
    setTimeout(function(){
      var ldg = document.getElementById('loading');
      ldg.classList.add('out');
      setTimeout(function(){ ldg.style.display='none'; }, 1100);
      /* Show book first */
      appState = 'book';
      var hint = document.getElementById('book-hint');
      if(hint){ hint.style.display=''; }
      console.log('Book ready — click to go to map');
      animate();
    }, 400);
  }
}

/* Book */
loader.load('book_of_pirate_rules_-_week_5.glb',
  function(gltf){
    console.log('Book loaded');
    var inner = gltf.scene;
    fitTo(inner, 2.5);
    bookRoot = new THREE.Group();
    bookRoot.add(inner);
    bookS.add(bookRoot);
    /* closeup: reuse same scene object, just scale 2x at render time */
    cuRoot = bookRoot;
    cuRoot._bs = inner.scale.x;
    onLoad();
  },
  null,
  function(e){ console.error('Book load failed:', e); onLoad(); }
);

/* Map */
loader.load('pirate_map.glb',
  function(gltf){
    console.log('Map loaded');
    var inner = gltf.scene;
    fitTo(inner, 3);
    baseMapScale = inner.scale.x;
    mapRoot = new THREE.Group();
    mapRoot.add(inner);
    mapRoot.position.set(0, -0.5, 0);
    mapRoot.rotation.x = -Math.PI/12;
    mapRoot.scale.setScalar(0.001);
    mapS.add(mapRoot);
    onLoad();
  },
  null,
  function(e){ console.error('Map load failed:', e); onLoad(); }
);

/* Ship */
loader.load('ship_pinnace_aft_diff.glb',
  function(gltf){
    console.log('Ship loaded');
    var inner = gltf.scene;
    fitTo(inner, 0.9);
    boatRoot = new THREE.Group();
    boatRoot.add(inner);
    boatRoot.position.set(0, 0.28, 0);
    boatS.add(boatRoot);
    onLoad();
  },
  null,
  function(e){ console.error('Ship load failed:', e); onLoad(); }
);

})();