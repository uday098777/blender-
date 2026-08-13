(function(){
'use strict';

function die(msg){var e=document.getElementById('err');e.style.display='block';e.textContent='ERROR: '+msg;}
if(typeof THREE==='undefined'){die('THREE not loaded');return;}
if(typeof THREE.GLTFLoader==='undefined'){die('GLTFLoader not loaded');return;}

var W=innerWidth,H=innerHeight;

/* ── renderers ── */
var bookR=new THREE.WebGLRenderer({antialias:true,alpha:true});
bookR.setPixelRatio(Math.min(devicePixelRatio,2));bookR.setSize(W,H);
bookR.domElement.id='book-canvas';document.body.appendChild(bookR.domElement);

var mapR=new THREE.WebGLRenderer({antialias:true,alpha:true});
mapR.setPixelRatio(Math.min(devicePixelRatio,2));mapR.setSize(W,H);
mapR.domElement.id='map-canvas';document.body.appendChild(mapR.domElement);

var boatR=new THREE.WebGLRenderer({antialias:true,alpha:true});
boatR.setPixelRatio(Math.min(devicePixelRatio,2));boatR.setSize(W,H);
boatR.domElement.id='boat-canvas';document.body.appendChild(boatR.domElement);

var miniR=new THREE.WebGLRenderer({antialias:true,alpha:true,canvas:document.getElementById('minimap-canvas')});
miniR.setPixelRatio(1);miniR.setSize(170,128);

var cuR=new THREE.WebGLRenderer({antialias:true,alpha:true,canvas:document.getElementById('closeup-canvas')});
cuR.setPixelRatio(1);cuR.setSize(300,412);

/* ── cameras ── */
var bookCam=new THREE.PerspectiveCamera(45,W/H,0.01,500);
bookCam.position.set(0,0.8,5.5);bookCam.lookAt(0,0.3,0);

var mapCam=new THREE.PerspectiveCamera(45,W/H,0.01,500);
mapCam.position.set(0,2.5,7);mapCam.lookAt(0,-0.3,0);

var boatCam=new THREE.PerspectiveCamera(45,W/H,0.01,500);
boatCam.position.set(0,2.5,7);boatCam.lookAt(0,-0.3,0);

var miniCam=new THREE.PerspectiveCamera(50,170/128,0.01,500);
miniCam.position.set(0,7,9);miniCam.lookAt(0,0,0);

var cuCam=new THREE.PerspectiveCamera(35,300/412,0.01,500);
cuCam.position.set(0,0.5,3.5);cuCam.lookAt(0,0.3,0);

/* ── scenes ── */
function dl(c,i,x,y,z){var l=new THREE.DirectionalLight(c,i);l.position.set(x,y,z);return l;}

var bookS=new THREE.Scene();
bookS.add(new THREE.AmbientLight(0xffffff,0.9));
bookS.add(dl(0xffd090,0.8,3,5,4));

var mapS=new THREE.Scene();
mapS.add(new THREE.AmbientLight(0xffffff,0.85));
mapS.add(dl(0xffffff,0.9,5,10,7));
mapS.add(dl(0xffd090,0.4,-5,5,-5));

var boatS=new THREE.Scene();
boatS.add(new THREE.AmbientLight(0xffffff,1.0));
boatS.add(dl(0xffd090,1.1,3,8,5));
boatS.add(dl(0xffffff,0.5,-3,4,-2));

var cuS=new THREE.Scene();
cuS.add(new THREE.AmbientLight(0xffffff,1.0));
cuS.add(dl(0xffd090,0.8,2,4,3));

/* ── state ── */
var clock=new THREE.Clock();
var loader=new THREE.GLTFLoader();
var ray=new THREE.Raycaster();
var mouse=new THREE.Vector2();
var bookRoot=null,mapRoot=null,boatRoot=null,cuRoot=null;
var state='loading';
var baseMapScale=1,mapMult=2.4;
var bx=W/2,by=H*0.54;      /* boat screen x,y */
var dragging=false,dox=0,doy=0;
var cuRaf=null;
var visited=0;

/* ── waypoints ── */
var WP=[
  {nx:0.20,ny:0.40,title:'Port Royal',sub:'Gateway of the Caribbean',
   body:'The legendary port city where the British Navy held dominion and pirates swung from the gallows. Captain Jack Sparrow arrived in a sinking dinghy yet walked away with a ship.',
   quote:'"The code is more what you\'d call guidelines than actual rules." — Barbossa',
   done:false,hue:32},
  {nx:0.75,ny:0.38,title:'Tortuga',sub:'Isle of Pirates',
   body:'A lawless island beyond any law, where rum flows freely and every scoundrel finds fellowship. The only place in the Caribbean where a pirate is truly free.',
   quote:'"You\'re the worst pirate I\'ve ever heard of." "But you have heard of me." — Will & Jack',
   done:false,hue:28},
  {nx:0.30,ny:0.65,title:'Shipwreck Cove',sub:'Seat of the Brethren Court',
   body:'Hidden behind treacherous reefs, Shipwreck Cove is the secret meeting place of the nine Pirate Lords. Here the Brethren Court convened to face the East India Trading Company.',
   quote:'"The pirates who can face it are truly free." — Captain Teague',
   done:false,hue:36},
  {nx:0.68,ny:0.62,title:'Isla de Muerta',sub:'Isle of the Dead',
   body:'A cursed island that cannot be found except by those who already know where it is. Within golden caverns lies the treasure of Cortés and the curse that doomed an entire crew.',
   quote:'"Blood must pay for blood." — Barbossa',
   done:false,hue:24},
  {nx:0.50,ny:0.28,title:'Singapore',sub:'The Eastern Seas',
   body:'The exotic port ruled by Pirate Lord Sao Feng. Beneath incense and lantern-light, dangerous dealings are struck — and betrayal is always just one bribe away.',
   quote:'"The world used to be a bigger place." — Jack Sparrow',
   done:false,hue:30},
  {nx:0.16,ny:0.57,title:"Rum Runner's Isle",sub:'The Marooning Ground',
   body:'A desolate strip of sand where Jack was marooned with a pistol containing a single shot — a gift he carried ten years, waiting for the perfect moment.',
   quote:'"Why is the rum always gone?" — Captain Jack Sparrow',
   done:false,hue:38},
  {nx:0.83,ny:0.52,title:'Fountain of Youth',sub:'Eternal Waters',
   body:'The legendary spring sought by Ponce de León and Blackbeard alike. Two silver chalices, a mermaid\'s tear — one must sacrifice years to grant another eternal life.',
   quote:'"Not all treasure\'s silver and gold, mate." — Jack Sparrow',
   done:false,hue:34},
  {nx:0.50,ny:0.74,title:"Davy Jones' Locker",sub:'Purgatory of the Seas',
   body:'A vast white desert at the edge of the world — prison of those who die at sea without redemption. Here time moves strangely and a man loses his mind before his life.',
   quote:'"Life is cruel. Why should the afterlife be any different?" — Davy Jones',
   done:false,hue:22}
];

/* ── helpers ── */
function setProgress(f){
  var p=Math.round(Math.min(f,1)*100);
  document.getElementById('bar').style.width=p+'%';
  document.getElementById('pct').textContent=p+'%';
}
function fitTo(obj,size){
  obj.updateWorldMatrix(true,true);
  var box=new THREE.Box3().setFromObject(obj);
  if(box.isEmpty())return;
  var sz=new THREE.Vector3();box.getSize(sz);
  var ct=new THREE.Vector3();box.getCenter(ct);
  var mx=Math.max(sz.x,sz.y,sz.z);if(mx<=0)return;
  var s=size/mx;
  obj.scale.setScalar(s);
  obj.position.set(-ct.x*s,-ct.y*s,-ct.z*s);
}

/* ── go to map (first-time entrance) ── */
function goToMap(){
  if(state!=='book')return;
  state='transitioning';
  document.getElementById('book-hint').style.display='none';
  var fade=document.getElementById('fade');
  fade.classList.add('in');
  setTimeout(function(){
    document.body.classList.add('map-mode');
    animateMapIn();
    fade.classList.remove('in');
    setTimeout(function(){
      document.getElementById('map-title').style.opacity='1';
      state='map';updateHint();
    },750);
  },900);
}

function animateMapIn(){
  if(!mapRoot)return;
  mapRoot.scale.setScalar(0.001);
  mapRoot.rotation.y=0;
  var t0=performance.now(),dur=950,tgt=baseMapScale*mapMult;
  (function tick(){
    var p=Math.min((performance.now()-t0)/dur,1);
    var e=1-Math.pow(1-p,3);
    mapRoot.scale.setScalar(0.001+e*(tgt-0.001));
    if(p<1)requestAnimationFrame(tick);
  })();
}

/* ── mini-map click → replay entrance ── */
document.getElementById('minimap-canvas').addEventListener('click',function(){
  if(state!=='map')return;
  animateMapIn();
  /* reset boat to center */
  bx=W/2;by=H*0.54;
  updateBoatEl();
});

/* ── hint text ── */
function updateHint(){
  var h=document.getElementById('waypoint-hint');
  h.textContent=visited>=WP.length
    ?'All locations discovered — you are a true Pirate Legend!'
    :'Drag the ship to discover locations ('+visited+'/'+WP.length+')';
}

/* ── boat drag ── */
var boatEl=document.getElementById('boat-drag');
function updateBoatEl(){boatEl.style.left=bx+'px';boatEl.style.top=by+'px';}
updateBoatEl();

/* screen → world on y=0 plane using mapCam */
function s2w(sx,sy){
  var nx=(sx/W)*2-1, ny=-(sy/H)*2+1;
  var v=new THREE.Vector3(nx,ny,0.5).unproject(mapCam);
  var d=v.sub(mapCam.position).normalize();
  var t=-mapCam.position.y/d.y;
  return new THREE.Vector3(mapCam.position.x+d.x*t,0,mapCam.position.z+d.z*t);
}
function syncBoat(){
  if(!boatRoot)return;
  var w=s2w(bx,by);
  boatRoot.position.set(w.x,0.28,w.z);
}

boatEl.addEventListener('mousedown',function(e){e.preventDefault();dragging=true;dox=e.clientX-bx;doy=e.clientY-by;boatEl.style.cursor='grabbing';});
document.addEventListener('mousemove',function(e){
  if(!dragging)return;
  bx=Math.max(55,Math.min(W-55,e.clientX-dox));
  by=Math.max(55,Math.min(H-55,e.clientY-doy));
  updateBoatEl();syncBoat();
});
document.addEventListener('mouseup',function(){if(dragging){dragging=false;boatEl.style.cursor='grab';checkWP();}});
boatEl.addEventListener('touchstart',function(e){e.preventDefault();var t=e.touches[0];dragging=true;dox=t.clientX-bx;doy=t.clientY-by;},{passive:false});
document.addEventListener('touchmove',function(e){if(!dragging)return;e.preventDefault();var t=e.touches[0];bx=Math.max(55,Math.min(W-55,t.clientX-dox));by=Math.max(55,Math.min(H-55,t.clientY-doy));updateBoatEl();syncBoat();},{passive:false});
document.addEventListener('touchend',function(){if(dragging){dragging=false;checkWP();}});

/* ── waypoint check ── */
function checkWP(){
  for(var i=0;i<WP.length;i++){
    var w=WP[i];if(w.done)continue;
    var dx=bx-w.nx*W,dy=by-w.ny*H;
    if(Math.sqrt(dx*dx+dy*dy)<98){w.done=true;visited++;doArrival(bx,by,w);break;}
  }
}

/* ── arrival: rings + boat scale-up → show popup ── */
function doArrival(sx,sy,wp){
  /* three ripple rings staggered */
  [0,200,400].forEach(function(delay,i){
    setTimeout(function(){
      var r=document.createElement('div');
      r.className='arr-ring';
      r.style.cssText='left:'+sx+'px;top:'+sy+'px;border-color:'+(i===0?'#DAA520':i===1?'#FF8C00':'#fff')+';animation-duration:'+(0.9+i*0.15)+'s';
      document.body.appendChild(r);
      setTimeout(function(){r.remove();},1200);
    },delay);
  });
  /* boat: small→BIG (2.8x) → back to 1x */
  boatEl.style.transition='transform 0.7s cubic-bezier(0.175,0.885,0.32,1.275)';
  boatEl.style.transform='translate(-50%,-50%) scale(2.8)';
  setTimeout(function(){
    boatEl.style.transform='translate(-50%,-50%) scale(1)';
    boatEl.style.transition='transform 0.35s ease';
    setTimeout(function(){showLocation(wp,sx);},380);
  },720);
  updateHint();
}

/* ── location popup ── */
function showLocation(wp,sx){
  document.getElementById('loc-title').textContent=wp.title;
  document.getElementById('loc-sub').textContent=wp.sub;
  document.getElementById('loc-body').textContent=wp.body;
  document.getElementById('loc-quote').textContent=wp.quote;
  var box=document.getElementById('location-box');
  /* warm parchment tint matching boat drop position */
  var h=wp.hue;
  box.style.background='radial-gradient(ellipse at 35% 25%,hsl('+(h+12)+',60%,74%) 0%,hsl('+h+',54%,58%) 38%,hsl('+(h-14)+',48%,36%) 100%)';
  var ov=document.getElementById('location-overlay');
  ov.style.display='flex';
  requestAnimationFrame(function(){requestAnimationFrame(function(){
    ov.style.opacity='1';
    box.style.transform='scale(1)';
  });});
}
document.getElementById('close-loc').addEventListener('click',function(){
  var ov=document.getElementById('location-overlay');
  var box=document.getElementById('location-box');
  ov.style.opacity='0';box.style.transform='scale(0.04)';
  setTimeout(function(){ov.style.display='none';},500);
});

/* ── pirate code / rules popup ── */
document.getElementById('open-rules-btn').addEventListener('click',function(){
  var ov=document.getElementById('rules-overlay');
  ov.style.display='flex';
  requestAnimationFrame(function(){requestAnimationFrame(function(){ov.style.opacity='1';});});
  startCloseup();
});
document.getElementById('close-rules').addEventListener('click',function(){
  var ov=document.getElementById('rules-overlay');
  ov.style.opacity='0';
  setTimeout(function(){ov.style.display='none';stopCloseup();},480);
});

/* 2× closeup render of book */
function startCloseup(){
  if(cuRaf)return;
  (function tick(){
    cuRaf=requestAnimationFrame(tick);
    if(cuRoot){
      var t=clock.getElapsedTime();
      cuRoot.scale.setScalar(cuRoot._bs*2);   /* 2× size */
      cuRoot.rotation.y=t*0.35;
      cuRoot.position.y=Math.sin(t*0.7)*0.06;
    }
    cuR.render(cuS,cuCam);
  })();
}
function stopCloseup(){if(cuRaf){cancelAnimationFrame(cuRaf);cuRaf=null;}}

/* ── main render loop ── */
function animate(){
  requestAnimationFrame(animate);
  var t=clock.getElapsedTime();
  if(bookRoot&&(state==='book'||state==='transitioning')){
    bookRoot.rotation.y=Math.sin(t*0.4)*0.35;
    bookRoot.position.y=Math.sin(t*0.7)*0.08;
    bookR.render(bookS,bookCam);
  }
  if(state==='map'||state==='transitioning'){
    if(mapRoot)mapRoot.position.y=Math.sin(t*0.3)*0.04;
    mapR.render(mapS,mapCam);
    if(boatRoot){boatRoot.rotation.y=t*0.85;boatRoot.position.y=0.28+Math.sin(t*1.3)*0.07;}
    boatR.render(boatS,boatCam);
    miniR.render(mapS,miniCam);
  }
}

/* ── click book to go to map ── */
bookR.domElement.addEventListener('pointerdown',function(e){
  if(state!=='book'||!bookRoot)return;
  mouse.x=(e.clientX/W)*2-1;mouse.y=-(e.clientY/H)*2+1;
  ray.setFromCamera(mouse,bookCam);
  if(ray.intersectObject(bookRoot,true).length>0)goToMap();
});

/* ── resize ── */
window.addEventListener('resize',function(){
  W=innerWidth;H=innerHeight;
  [bookCam,mapCam,boatCam].forEach(function(c){c.aspect=W/H;c.updateProjectionMatrix();});
  bookR.setSize(W,H);mapR.setSize(W,H);boatR.setSize(W,H);
});

/* ── load models ── */
setProgress(0.05);
var loaded=0,total=3;
function onLoad(){
  loaded++;setProgress(0.05+(loaded/total)*0.95);
  if(loaded>=total){
    setTimeout(function(){
      document.getElementById('loading').classList.add('out');
      setTimeout(function(){document.getElementById('loading').style.display='none';},1100);
      state='book';animate();
    },400);
  }
}

/* book */
loader.load('book_of_pirate_rules_-_week_5.glb',function(g){
  var inner=g.scene;fitTo(inner,2.5);
  bookRoot=new THREE.Group();bookRoot.add(inner);bookS.add(bookRoot);
  /* clone for 2× close-up */
  var i2=inner.clone();fitTo(i2,1.8);
  cuRoot=new THREE.Group();cuRoot.add(i2);
  cuRoot._bs=i2.scale.x;
  cuS.add(cuRoot);
  onLoad();
},null,function(e){die('Book: '+e);});

/* map — centered, slightly down */
loader.load('pirate_map.glb',function(g){
  var inner=g.scene;fitTo(inner,3);
  baseMapScale=inner.scale.x;
  mapRoot=new THREE.Group();mapRoot.add(inner);
  mapRoot.position.set(0,-0.5,0);
  mapRoot.rotation.x=-Math.PI/12;
  mapRoot.scale.setScalar(0.001);
  mapS.add(mapRoot);
  onLoad();
},null,function(e){die('Map: '+e);});

/* ship */
loader.load('ship_pinnace_aft_diff.glb',function(g){
  var inner=g.scene;fitTo(inner,0.9);
  boatRoot=new THREE.Group();boatRoot.add(inner);
  boatRoot.position.set(0,0.28,0);
  boatS.add(boatRoot);
  onLoad();
},null,function(e){die('Ship: '+e);});

})();