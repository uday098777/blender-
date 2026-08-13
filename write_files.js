const fs = require('fs');

/* ═══════════════════════════════════════════════════════
   voyage.js  – complete game logic
═══════════════════════════════════════════════════════ */
const JS = String.raw`(function(){
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

})();`;

/* ═══════════════════════════════════════════════════════
   index.html  – full markup
═══════════════════════════════════════════════════════ */
const HTML = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8"/>
<meta name="viewport" content="width=device-width,initial-scale=1.0"/>
<title>Voyage of the Black Pearl</title>
<link href="https://fonts.googleapis.com/css2?family=Pirata+One&family=IM+Fell+English:ital@0;1&display=swap" rel="stylesheet">
<script src="https://cdn.jsdelivr.net/npm/three@0.128.0/build/three.min.js"><\/script>
<script src="https://cdn.jsdelivr.net/npm/three@0.128.0/examples/js/loaders/GLTFLoader.js"><\/script>
<style>
*{margin:0;padding:0;box-sizing:border-box}
html,body{width:100%;height:100%;overflow:hidden;background:#100802}

/* ══ WOOD PLANK BACKGROUND ══ */
.bg-wood{
  position:fixed;inset:0;z-index:0;pointer-events:none;
  background:
    repeating-linear-gradient(90deg,
      #3d2308 0px, #4e2e0a 2px, #61390f 4px, #724418 6px,
      #61390f 8px, #4e2e0a 12px, #3d2308 38px, #5a3510 40px),
    linear-gradient(180deg,#2a1505 0%,#3a1f08 30%,#2e1806 70%,#1e1004 100%);
  background-size:40px 100%,100% 100%;
}

/* ══ TORN PARCHMENT PAPER ══
   Full-screen crinkled parchment sitting ON the wood
   Torn/burned irregular edges via clip-path              */
.bg-parchment{
  position:fixed;
  top:1.5%;left:2%;right:2%;bottom:1.5%;
  z-index:1;pointer-events:none;
  background:
    /* crinkle diagonal lines */
    repeating-linear-gradient(128deg,transparent 0,transparent 60px,rgba(120,80,20,0.07) 60px,rgba(120,80,20,0.07) 61px),
    repeating-linear-gradient(52deg, transparent 0,transparent 90px,rgba(90,55,10,0.05) 90px,rgba(90,55,10,0.05) 91px),
    /* base parchment colour */
    radial-gradient(ellipse at 30% 25%,#e2c98a 0%,transparent 50%),
    radial-gradient(ellipse at 70% 75%,#d4b46a 0%,transparent 45%),
    radial-gradient(ellipse at 50% 50%,#dbbf7e 0%,#c6a050 50%,#9a7230 80%,#7a5520 100%);
  /* irregular torn/burned outline */
  clip-path:polygon(
    1% 4%,   0% 0%,   3% 1%,   7% 0%,  11% 3%,  15% 0%,
   19% 2%,  24% 0%,  28% 3%,  33% 0%,  37% 2%,  42% 0%,
   46% 3%,  51% 0%,  55% 2%,  60% 0%,  64% 3%,  69% 0%,
   73% 2%,  78% 0%,  82% 3%,  87% 0%,  91% 2%,  95% 0%,
   99% 2%, 100% 0%,
  100% 4%, 99% 9%,100% 15%, 99% 21%,100% 27%, 99% 33%,
  100% 39%, 99% 45%,100% 51%, 99% 57%,100% 63%, 99% 69%,
  100% 75%, 99% 81%,100% 87%, 99% 93%,100% 99%,
   97% 100%, 93% 98%, 89% 100%, 85% 98%, 81% 100%, 77% 98%,
   73% 100%, 69% 98%, 65% 100%, 61% 98%, 57% 100%, 53% 98%,
   49% 100%, 45% 98%, 41% 100%, 37% 98%, 33% 100%, 29% 98%,
   25% 100%, 21% 98%, 17% 100%, 13% 98%,  9% 100%,  5% 98%,
    1% 100%,  0% 99%,
    1% 94%,  0% 88%,  1% 82%,  0% 76%,  1% 70%,  0% 64%,
    1% 58%,  0% 52%,  1% 46%,  0% 40%,  1% 34%,  0% 28%,
    1% 22%,  0% 16%,  1% 10%,  0%  4%);
  /* burn shadow on edges */
  box-shadow:
    inset  6px  6px 18px rgba(40,15,0,0.55),
    inset -6px  6px 18px rgba(40,15,0,0.55),
    inset  6px -6px 18px rgba(40,15,0,0.55),
    inset -6px -6px 18px rgba(40,15,0,0.55);
}
/* dark outer vignette (wood showing around paper) */
.bg-vignette{
  position:fixed;inset:0;z-index:2;pointer-events:none;
  box-shadow:inset 0 0 90px 45px rgba(8,3,0,0.95),
             inset 0 0 220px 60px rgba(5,2,0,0.5);
}

/* ══ CANVASES ══ */
#book-canvas{display:block;position:fixed;top:0;left:0;z-index:5}
body.map-mode #book-canvas{display:none!important}
#map-canvas{display:none;position:fixed;top:0;left:0;z-index:5}
body.map-mode #map-canvas{display:block!important}
#boat-canvas{display:none;position:fixed;top:0;left:0;z-index:7;pointer-events:none}
body.map-mode #boat-canvas{display:block}

/* ══ MINI-MAP (bottom-right duplicate) ══ */
#minimap-canvas{
  display:none;position:fixed;bottom:20px;right:20px;
  width:170px;height:128px;z-index:12;
  border:3px solid #8B4513;border-radius:6px;cursor:pointer;
  box-shadow:0 0 0 1px rgba(218,165,32,0.4),0 6px 24px rgba(0,0,0,0.85);
  transition:transform .25s,box-shadow .25s;
}
body.map-mode #minimap-canvas{display:block}
#minimap-canvas:hover{transform:scale(1.07);box-shadow:0 0 0 2px rgba(218,165,32,0.8),0 8px 28px rgba(0,0,0,0.9)}
#minimap-label{
  display:none;position:fixed;bottom:152px;right:20px;width:170px;
  font-family:'Pirata One',cursive;color:#DAA520;font-size:0.7rem;
  text-align:center;text-shadow:0 1px 5px rgba(0,0,0,0.95);z-index:12;pointer-events:none;
}
body.map-mode #minimap-label{display:block}

/* ══ BOAT DRAG HANDLE ══ */
#boat-drag{
  position:fixed;width:110px;height:110px;cursor:grab;z-index:8;
  transform:translate(-50%,-50%);display:none;
  user-select:none;-webkit-user-select:none;touch-action:none;
}
body.map-mode #boat-drag{display:block}
#boat-drag:active{cursor:grabbing}

/* ══ LOADING ══ */
#loading{position:fixed;inset:0;z-index:500;background:#07040a;
  display:flex;flex-direction:column;align-items:center;justify-content:center;transition:opacity 1s}
#loading.out{opacity:0;pointer-events:none}
#loading h1{font-family:'Pirata One',cursive;color:#DAA520;font-size:2.8rem;
  letter-spacing:6px;margin-bottom:10px;text-shadow:0 0 30px rgba(218,165,32,0.45)}
#loading p{color:#7a5a20;font-style:italic;font-family:serif;margin-bottom:32px}
#bar-bg{width:280px;height:3px;background:#1a0d00;border-radius:2px;border:1px solid #3a2000}
#bar{height:100%;width:0%;background:linear-gradient(90deg,#8B4513,#DAA520);border-radius:2px;transition:width .3s}
#pct{color:#5a3a10;font-size:.78rem;margin-top:8px;font-family:monospace}
#err{display:none;position:fixed;inset:0;z-index:999;background:#000;color:#f44;
  font-family:monospace;padding:30px;overflow:auto;white-space:pre-wrap}
#fade{position:fixed;inset:0;background:#07040a;z-index:400;opacity:0;pointer-events:none;transition:opacity .9s}
#fade.in{opacity:1}

/* ══ HUD ══ */
#book-hint{position:fixed;bottom:9%;left:50%;transform:translateX(-50%);
  color:#DAA520;font-family:'Pirata One',cursive;font-size:1.5rem;letter-spacing:3px;
  opacity:0;pointer-events:none;z-index:10;
  animation:fadeUp 2.2s ease 1.2s forwards;
  text-shadow:0 0 18px rgba(218,165,32,0.5);
  border-bottom:1px solid rgba(218,165,32,0.3);padding-bottom:5px}
@keyframes fadeUp{
  from{opacity:0;transform:translateX(-50%) translateY(14px)}
  to  {opacity:1;transform:translateX(-50%) translateY(0)}}
#map-title{position:fixed;top:20px;left:50%;transform:translateX(-50%);
  font-family:'Pirata One',cursive;color:#DAA520;font-size:2.1rem;letter-spacing:6px;
  opacity:0;transition:opacity .9s;pointer-events:none;z-index:10;
  text-shadow:0 2px 20px rgba(0,0,0,0.95),0 0 40px rgba(218,165,32,0.15)}
#open-rules-btn{
  position:fixed;top:20px;left:20px;z-index:10;
  font-family:'Pirata One',cursive;color:#DAA520;
  background:rgba(6,3,0,.85);border:2px solid #6B3A0A;
  padding:8px 18px;font-size:1rem;cursor:pointer;border-radius:4px;
  opacity:0;pointer-events:none;transition:opacity .6s,border-color .2s}
body.map-mode #open-rules-btn{opacity:1;pointer-events:all}
#open-rules-btn:hover{background:rgba(55,25,0,.9);border-color:#DAA520}
#waypoint-hint{
  position:fixed;top:70px;left:50%;transform:translateX(-50%);
  font-family:'Pirata One',cursive;color:#c8a030;font-size:.95rem;
  opacity:0;pointer-events:none;transition:opacity .7s;z-index:10;
  text-shadow:0 2px 8px rgba(0,0,0,.95);white-space:nowrap}
body.map-mode #waypoint-hint{opacity:1}

/* ══ ARRIVAL RINGS ══ */
@keyframes arrRing{
  0%  {transform:translate(-50%,-50%) scale(.08);opacity:1}
  100%{transform:translate(-50%,-50%) scale(5.5);opacity:0}}
.arr-ring{
  position:fixed;width:70px;height:70px;border-radius:50%;
  border:3px solid #DAA520;pointer-events:none;z-index:50;
  transform:translate(-50%,-50%);
  animation:arrRing 1.1s ease-out forwards}

/* ══ LOCATION FULL-PAGE POPUP ══ */
#location-overlay{
  position:fixed;inset:0;z-index:100;
  background:rgba(4,2,0,.75);
  display:none;align-items:center;justify-content:center;
  opacity:0;transition:opacity .45s}
#location-box{
  position:relative;
  /* full page minus 2-inch sides = 4in total */
  width:calc(100vw - 4in);max-width:calc(100vw - 4in);min-width:300px;
  max-height:calc(100vh - 50px);overflow-y:auto;
  padding:52px 58px 46px;
  /* torn/burned parchment edges */
  clip-path:polygon(
    0% 2%,  1% 0%,  3% 1.5%, 6% 0%,  9% 2%, 12% 0%, 16% 1.5%,20% 0%,
   24% 2%, 28% 0%, 32% 1.5%,36% 0%, 40% 2%, 44% 0%, 48% 1.5%,52% 0%,
   56% 2%, 60% 0%, 64% 1.5%,68% 0%, 72% 2%, 76% 0%, 80% 1.5%,84% 0%,
   88% 2%, 92% 0%, 96% 1.5%,99% 0%,100% 2%,
   99% 5%,100% 10%, 99% 15%,100% 20%, 99% 26%,100% 32%, 99% 38%,
  100% 44%, 99% 50%,100% 56%, 99% 62%,100% 68%, 99% 74%,100% 80%,
   99% 86%,100% 92%, 99% 97%,100% 100%,
   97% 99%, 92% 100%, 87% 99%, 82% 100%, 77% 99%, 72% 100%, 67% 99%,
   62% 100%, 57% 99%, 52% 100%, 47% 99%, 42% 100%, 37% 99%, 32% 100%,
   27% 99%, 22% 100%, 17% 99%, 12% 100%,  7% 99%,  3% 100%,  0% 99%,
    1% 94%,  0% 88%,  1% 82%,  0% 76%,  1% 70%,  0% 64%,
    1% 58%,  0% 52%,  1% 46%,  0% 40%,  1% 34%,  0% 28%,
    1% 22%,  0% 16%,  1% 10%,  0%  5%);
  background:radial-gradient(ellipse at 35% 25%,#e2c98a 0%,#c9a85a 40%,#8a6028 100%);
  transform:scale(.04);
  transition:transform .8s cubic-bezier(.175,.885,.32,1.275);
  box-shadow:0 20px 80px rgba(0,0,0,.95)}
#location-box.open{transform:scale(1)}
#location-box h2{font-family:'Pirata One',cursive;color:#1c0900;font-size:2.6rem;
  margin-bottom:4px;text-align:center;text-shadow:0 1px 4px rgba(255,180,60,.25)}
.loc-sub{font-family:'IM Fell English',serif;font-style:italic;color:#452200;font-size:1.1rem;
  text-align:center;margin-bottom:22px;border-bottom:2px solid rgba(70,35,5,.3);padding-bottom:12px}
.loc-deco{text-align:center;font-size:1.8rem;margin:8px 0;color:#7a4510;opacity:.42;letter-spacing:14px}
#loc-body{font-family:'IM Fell English',serif;color:#1c0900;font-size:1.15rem;line-height:1.9;margin-bottom:14px}
.loc-quote{font-style:italic;color:#452200;border-left:4px solid #8B4513;
  padding:14px 18px;margin:18px 0;background:rgba(70,35,5,.1);
  border-radius:0 6px 6px 0;font-family:'IM Fell English',serif;font-size:1.05rem;line-height:1.65}
#close-loc{position:absolute;top:14px;right:18px;background:none;border:none;
  color:#452200;font-size:2.5rem;cursor:pointer;line-height:1;
  transition:color .2s,transform .2s}
#close-loc:hover{color:#1c0900;transform:scale(1.15)}

/* ══ RULES POPUP ══ */
#rules-overlay{
  position:fixed;inset:0;z-index:200;background:rgba(0,0,0,.9);
  display:none;align-items:center;justify-content:center;
  opacity:0;transition:opacity .45s}
#rules-wrap{
  position:relative;display:flex;gap:20px;
  width:88vw;max-width:960px;max-height:88vh;
  transform:scale(.3) rotateY(28deg);
  transition:transform .65s cubic-bezier(.175,.885,.32,1.275)}
#rules-overlay.show #rules-wrap{transform:scale(1) rotateY(0deg)}
/* left: 2× close-up canvas (torn parchment shape) */
#closeup-wrap{
  flex:0 0 300px;width:300px;position:relative;
  background:linear-gradient(145deg,#d8ba80,#ba9558,#9a7040);
  border:3px solid #5a3010;border-radius:8px;overflow:hidden;
  clip-path:polygon(
    0% 3%,2% 0%,5% 2%,9% 0%,13% 3%,18% 0%,23% 2%,28% 0%,33% 3%,
   38% 0%,43% 2%,48% 0%,53% 3%,58% 0%,63% 2%,68% 0%,73% 3%,
   78% 0%,83% 2%,88% 0%,93% 3%,97% 0%,100% 2%,
   99% 6%,100% 12%,99% 19%,100% 26%,99% 33%,100% 40%,99% 47%,
  100% 54%,99% 61%,100% 68%,99% 75%,100% 82%,99% 89%,100% 96%,
   99% 100%,95% 98%,90% 100%,85% 98%,80% 100%,75% 98%,70% 100%,
   65% 98%,60% 100%,55% 98%,50% 100%,45% 98%,40% 100%,35% 98%,
   30% 100%,25% 98%,20% 100%,15% 98%,10% 100%,5% 98%,1% 100%,
    0% 97%,1% 90%,0% 83%,1% 76%,0% 69%,1% 62%,0% 55%,1% 48%,
    0% 41%,1% 34%,0% 27%,1% 20%,0% 13%,1% 6%)}
#closeup-badge{
  position:absolute;top:9px;left:50%;transform:translateX(-50%);
  font-family:'Pirata One',cursive;color:#1c0900;font-size:.75rem;
  background:rgba(216,186,128,.9);padding:2px 12px;border-radius:12px;
  white-space:nowrap;pointer-events:none;z-index:1}
#closeup-canvas{display:block;width:100%!important;height:auto!important}
/* right: rules table (also torn parchment shape) */
#rules-table-panel{
  flex:1;overflow-y:auto;
  background:linear-gradient(145deg,#caa46e,#a8804a);
  border:3px solid #5a3010;border-radius:8px;padding:22px 24px;
  clip-path:polygon(
    0% 3%,2% 0%,5% 2%,9% 0%,13% 3%,18% 0%,23% 2%,28% 0%,33% 3%,
   38% 0%,43% 2%,48% 0%,53% 3%,58% 0%,63% 2%,68% 0%,73% 3%,
   78% 0%,83% 2%,88% 0%,93% 3%,97% 0%,100% 2%,
   99% 6%,100% 12%,99% 19%,100% 26%,99% 33%,100% 40%,99% 47%,
  100% 54%,99% 61%,100% 68%,99% 75%,100% 82%,99% 89%,100% 96%,
   99% 100%,95% 98%,90% 100%,85% 98%,80% 100%,75% 98%,70% 100%,
   65% 98%,60% 100%,55% 98%,50% 100%,45% 98%,40% 100%,35% 98%,
   30% 100%,25% 98%,20% 100%,15% 98%,10% 100%,5% 98%,1% 100%,
    0% 97%,1% 90%,0% 83%,1% 76%,0% 69%,1% 62%,0% 55%,1% 48%,
    0% 41%,1% 34%,0% 27%,1% 20%,0% 13%,1% 6%)}
#rules-table-panel h2{font-family:'Pirata One',cursive;color:#1c0900;font-size:1.6rem;
  text-align:center;margin-bottom:14px}
#rules-table-panel table{width:100%;border-collapse:collapse;font-family:'IM Fell English',serif}
#rules-table-panel th{background:rgba(65,30,0,.55);color:#f0d090;font-size:.88rem;
  padding:7px 10px;border:1px solid rgba(65,30,0,.4);text-align:left}
#rules-table-panel td{padding:8px 10px;border:1px solid rgba(65,30,0,.2);
  color:#1c0900;font-size:.9rem;vertical-align:top;line-height:1.5}
#rules-table-panel tr:nth-child(even) td{background:rgba(65,30,0,.1)}
#rules-table-panel tr:hover td{background:rgba(65,30,0,.18)}
#close-rules{position:absolute;top:-14px;right:-14px;width:34px;height:34px;
  background:#7a3800;border:2px solid #DAA520;border-radius:50%;
  color:#DAA520;font-size:1.3rem;cursor:pointer;
  display:flex;align-items:center;justify-content:center;
  transition:background .2s,transform .2s}
#close-rules:hover{background:#4a2000;transform:scale(1.15)}
::-webkit-scrollbar{width:5px}
::-webkit-scrollbar-track{background:rgba(65,30,0,.1)}
::-webkit-scrollbar-thumb{background:#8B4513;border-radius:3px}
</style>
</head>
<body>

<!-- layered background -->
<div class="bg-wood"></div>
<div class="bg-parchment"></div>
<div class="bg-vignette"></div>

<!-- loading -->
<div id="loading">
  <h1>VOYAGE</h1>
  <p>Charting the Seven Seas…</p>
  <div id="bar-bg"><div id="bar"></div></div>
  <div id="pct">0%</div>
</div>
<div id="err"></div>
<div id="fade"></div>

<!-- HUD -->
<div id="book-hint">Click the Book to Begin Your Voyage</div>
<div id="map-title">THE SEVEN SEAS</div>
<button id="open-rules-btn">📜 Pirate Code</button>
<div id="waypoint-hint">Drag the ship to discover hidden locations!</div>
<canvas id="minimap-canvas" title="Click to reset view"></canvas>
<div id="minimap-label">⚓ Click to Reset View</div>
<div id="boat-drag"></div>

<!-- Location full-page popup -->
<div id="location-overlay">
  <div id="location-box">
    <button id="close-loc" aria-label="Close">&times;</button>
    <div class="loc-deco">⚓ ☠ ⚓</div>
    <h2 id="loc-title"></h2>
    <div class="loc-sub" id="loc-sub"></div>
    <p id="loc-body"></p>
    <div class="loc-quote" id="loc-quote"></div>
    <div class="loc-deco">~ ≋ ≋ ~</div>
  </div>
</div>

<!-- Rules of Book popup -->
<div id="rules-overlay">
  <div id="rules-wrap">
    <button id="close-rules" aria-label="Close">&times;</button>
    <div id="closeup-wrap">
      <div id="closeup-badge">2× Close-Up View</div>
      <canvas id="closeup-canvas" width="300" height="412"></canvas>
    </div>
    <div id="rules-table-panel">
      <h2>⚓ The Pirate Code ⚓</h2>
      <table>
        <thead><tr><th>#</th><th>Article</th><th>Penalty</th></tr></thead>
        <tbody>
          <tr><td>I</td><td>Every man shall have an equal vote in affairs of the moment; likewise equal title to fresh provisions and strong liquors seized</td><td>Marooning</td></tr>
          <tr><td>II</td><td>Every man shall be called fairly in turn by list on board for prizes and plunder</td><td>Loss of share</td></tr>
          <tr><td>III</td><td>No person to game at cards or dice for money aboard the ship</td><td>Flogging</td></tr>
          <tr><td>IV</td><td>Lights and candles out at eight o'clock; if any desire to drink after, they do it on the open deck</td><td>Fine of rum ration</td></tr>
          <tr><td>V</td><td>Every man shall keep his piece, pistols and cutlass clean and fit for service at all times</td><td>Loss of share</td></tr>
          <tr><td>VI</td><td>No boy or woman to be allowed amongst them; any man found seducing the latter sex shall suffer death</td><td>Death</td></tr>
          <tr><td>VII</td><td>He that shall desert the ship in battle shall be punished with death or marooning</td><td>Death or Marooning</td></tr>
          <tr><td>VIII</td><td>No striking one another on board; every man's quarrel to be ended on shore with sword and pistol</td><td>Moses' Law (40 lashes)</td></tr>
          <tr><td>IX</td><td>No man shall talk of breaking up their way of living till each has shared a fortune of £1,000</td><td>Marooning</td></tr>
          <tr><td>X</td><td>Captain and quartermaster receive two shares; master, boatswain and gunner one and a half; all other officers one and a quarter</td><td>Court Martial</td></tr>
        </tbody>
      </table>
    </div>
  </div>
</div>

<script src="voyage.js"><\/script>

<!-- popup show-class wiring (runs after voyage.js) -->
<script>
(function(){
  /* location overlay open animation */
  var locOv=document.getElementById('location-overlay');
  var locBox=document.getElementById('location-box');
  var origClose=document.getElementById('close-loc').onclick;

  /* patch voyage.js showLocation to also add show class */
  var _origShow=window.showLocation;

  /* rules overlay wiring */
  var rulesOv=document.getElementById('rules-overlay');
  document.getElementById('open-rules-btn').addEventListener('click',function(){
    rulesOv.style.display='flex';
    requestAnimationFrame(function(){requestAnimationFrame(function(){
      rulesOv.classList.add('show');
    });});
  },true);
  document.getElementById('close-rules').addEventListener('click',function(){
    rulesOv.classList.remove('show');
    setTimeout(function(){rulesOv.style.display='none';},480);
  },true);
})();
<\/script>
</body>
</html>`;

fs.writeFileSync('voyage.js', JS, 'utf8');
fs.writeFileSync('index.html', HTML, 'utf8');
console.log('Done. voyage.js='+JS.length+' index.html='+HTML.length);
