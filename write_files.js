const fs = require('fs');

/* ── voyage.js ────────────────────────────────────────────────────────── */
const JS = `(function(){
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

/* renderers */
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

/* cameras */
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

function mkDL(c,i,x,y,z){var l=new THREE.DirectionalLight(c,i);l.position.set(x,y,z);return l;}
var bookS=new THREE.Scene();
bookS.add(new THREE.AmbientLight(0xffffff,0.9));bookS.add(mkDL(0xffd090,0.8,3,5,4));
var mapS=new THREE.Scene();
mapS.add(new THREE.AmbientLight(0xffffff,0.85));mapS.add(mkDL(0xffffff,0.9,5,10,7));mapS.add(mkDL(0xffd090,0.4,-5,5,-5));
var boatS=new THREE.Scene();
boatS.add(new THREE.AmbientLight(0xffffff,1.0));boatS.add(mkDL(0xffd090,1.1,3,8,5));boatS.add(mkDL(0xffffff,0.5,-3,4,-2));
var cuS=new THREE.Scene();
cuS.add(new THREE.AmbientLight(0xffffff,1.0));cuS.add(mkDL(0xffd090,0.8,2,4,3));

var clock=new THREE.Clock();
var loader=new THREE.GLTFLoader();
var ray=new THREE.Raycaster();
var mouse=new THREE.Vector2();
var bookRoot=null,mapRoot=null,boatRoot=null,cuRoot=null;
var appState='loading';
var baseMapScale=1,mapMult=2.4;
var bx=W/2,by=H*0.52;
var dragging=false,dox=0,doy=0;
var cuRaf=null;
var visitedCount=0;
var animating=false;

/* ═══════════════════════════════════════════════════
   10 WAYPOINTS — full content
═══════════════════════════════════════════════════ */
var WP=[
  {nx:0.18,ny:0.38,
   title:'VOYAGE MMXXVI',
   subtitle:'A 36-Hour Plunder of Innovation',
   tag:'THE TALE',
   hue:32,
   sections:[
     {heading:'SAIL BEYOND THE KNOWN WORLD',
      body:'Plunder the Depths of Innovation. Hoist the sails and chart a course through uncharted waters. Voyage beckons the boldest crews to forge legends across a relentless 36-hour tide — where ideas become treasure and innovators become captains of tomorrow.'},
     {heading:'THE VOYAGE',
      body:'36 hours of relentless building, forging, and innovating. Crew size: 3–4 souls. Treasure pool: ₹25,000. Date: 26 | 27 September MMXXVI.'}
   ],
   footer:'HOIST THE SAILS → Register now and claim yer place among the legends.',
   done:false},

  {nx:0.50,ny:0.22,
   title:'THE WATERS',
   subtitle:'Choose Thy Domain',
   tag:'THE WATERS',
   hue:28,
   sections:[
     {heading:'I · AI / Machine Learning — Devil\'s Triangle',
      body:'Harness the dark arts of AI and Machine Learning to conquer the unknown. Forge cognitive systems, predictive charting, and intelligent automation that bend the rules of the known world. Tags: LLMs · RAG · Agents · Neural Nets'},
     {heading:'II · Blockchain / Web3 — Tortuga Market',
      body:'Navigate the future through Blockchain and decentralized waters. Build immutable contracts, token economies, and dApps that answer to no king. Tags: Smart Contracts · DeFi · dApps · Web3'},
     {heading:'III · FinTech — Dead Men\'s Ledger',
      body:'Redefine the world of gold and ledgers through secure, scalable financial instruments. Where every transaction tells a tale of trust. Tags: Payments · Banking · Fraud · Trading'}
   ],
   footer:'Six treasure-hunt domains forged to test the boldest crews.',
   done:false},

  {nx:0.80,ny:0.28,
   title:'MORE WATERS',
   subtitle:'Choose Thy Domain — Continued',
   tag:'THE WATERS',
   hue:36,
   sections:[
     {heading:'IV · Healthcare — Fountain of Youth',
      body:'Leverage the healing arts to build smarter, more accessible Healthcare. Tackle diagnostics, patient experience, and medical lore — making care more human. Tags: MedTech · Diagnostics · Telehealth · AI Health'},
     {heading:'V · Cybersecurity — Davy Jones\' Vault',
      body:'Fortify the digital realm against the ever-shifting tides of cyber threat. Build armored systems that guard treasure from raiders. Tags: AppSec · Crypto · Network · Forensics'},
     {heading:'VI · Open Innovation — Shipwreck Cove',
      body:'Explore limitless waters and bring bold ideas to life across any domain. The cove rewards the daring, the creative, and the relentless. Tags: Any Domain · Creative · Bold Ideas'}
   ],
   footer:'Pick the waters that match yer expertise — weigh anchor and set sail.',
   done:false},

  {nx:0.25,ny:0.60,
   title:'THE TREASURE COVE',
   subtitle:'Bounties & Booty',
   tag:'TREASURE',
   hue:24,
   sections:[
     {heading:'FIRST BOUNTY — ₹10,000 · GOLD HOARD',
      body:'The finest crew claims the greatest hoard. Build something that shakes the seas and the gold is yours.'},
     {heading:'SECOND BOUNTY — ₹7,000 · SILVER CACHE',
      body:'Second only in gold — but first in glory among the bold.'},
     {heading:'THIRD BOUNTY — ₹5,000 · BRONZE COFFER',
      body:'Every legend starts with a first conquest. The bronze coffer marks the beginning of your saga.'},
     {heading:'EVERY SOUL CLAIMS A SHARE',
      body:'Crew Garb & T-Shirts · Voyager Certificates · Captain\'s Bounty · Crew Insignia Stickers · The Brotherhood Network · Counsel of Mentors · Audience with Veterans'}
   ],
   footer:'Total Treasure Pool: ₹25,000 awaits the finest crews.',
   done:false},

  {nx:0.72,ny:0.55,
   title:'CAPTAIN\'S LOG',
   subtitle:'The 36-Hour Odyssey',
   tag:'CAPTAIN\'S LOG',
   hue:30,
   sections:[
     {heading:'DAY THE FIRST',
      body:'Orientation of the Fleet → The Voyage Begins → Morning Watch Session I → The Midday Feast → Evening Rations → Deck Games Round I → The Night Feast → Counsel of Captains Session II → Deck Games Round II'},
     {heading:'DAY THE SECOND',
      body:'Counsel of Captains Session III → The Judgement & Submission Window → Dawn Meal → The Midday Feast → Closing Ceremony → The Voyage Concludes'},
     {heading:'KEY DATES',
      body:'The Voyage Sets Sail: 26 September 2026 · The Voyage Concludes: 27 September 2026'}
   ],
   footer:'From orientation to closing ceremony — 36 hours of relentless tide.',
   done:false},

  {nx:0.15,ny:0.72,
   title:'THE CAPTAIN\'S CODE',
   subtitle:'Rules of the Voyage',
   tag:'CODEX',
   hue:38,
   sections:[
     {heading:'RULE I',
      body:'Each voyager must bring their own laptop, charger, and power backup for the journey ahead.'},
     {heading:'RULE II',
      body:'None shall depart the arena after registration until the voyage concludes and the tides recede.'},
     {heading:'RULE III',
      body:'Wear yer participant insignia at all times within the hackathon arena — it is yer mark of passage.'},
     {heading:'RULE IV',
      body:'Wield only permitted resources and APIs in accordance with the captain\'s code of conduct.'}
   ],
   footer:'The code is law. Sail true or not at all.',
   done:false},

  {nx:0.55,ny:0.75,
   title:'THE BROTHERHOOD',
   subtitle:'The GRID Fleet',
   tag:'ALLIES',
   hue:34,
   sections:[
     {heading:'GRID COMMUNITY',
      body:'A student-led fellowship of more than 2,000 souls dedicated to empowering students through collaboration, hands-on learning, and real-world opportunities. Our mission is to bridge the gap between academy and industry.'},
     {heading:'OUR REACH',
      body:'2,000+ Souls of the Fleet · 800+ Voyagers Enlisted · AI · Web3 · Cyber Captain\'s Sessions · Pan-India Reach of the Tides'},
     {heading:'WHAT WE DO',
      body:'Hackathons, workshops, bootcamps, webinars, networking voyages, and technical initiatives that inspire innovation, forge practical skills, and prepare students for the careers of tomorrow.'}
   ],
   footer:'STUDENT-LED · 2000+ SOULS · PAN-INDIA',
   done:false},

  {nx:0.83,ny:0.70,
   title:'THE ALLIES',
   subtitle:'Backed by the Finest',
   tag:'ALLIES',
   hue:22,
   sections:[
     {heading:'BLOCKCHAIN ALLY — Algorand',
      body:'The leading Layer-1 blockchain for the future of the decentralized seas. A high-performance blockchain forged for speed, security, and scalability — near-instant finality, Pure Proof-of-Stake consensus.'},
     {heading:'COMMUNITY ALLY — OSEN',
      body:'A technology-driven fellowship that champions hackathons, workshops, and developer crews by bestowing sponsorships, mentorship, speakers, swag, and growth opportunities.'},
     {heading:'AI & TECH ALLY — Mewayz Global',
      body:'An AI-powered Business Operating Platform helping ventures, creators, and enterprises scale through intelligent automation. AI orchestration, Web3, CRM, payment management, and marketing tools.'}
   ],
   footer:'Industry titans powering Voyage with technology, counsel, and resources.',
   done:false},

  {nx:0.35,ny:0.82,
   title:'THE CODEX OF QUERIES',
   subtitle:'Lore & Answers',
   tag:'CODEX',
   hue:32,
   sections:[
     {heading:'WHO MAY JOIN?',
      body:'The Voyage is open to all undergraduate and postgraduate souls (1st Year — Final Year) from any college across the realm. No prior hackathon experience required — only the will to build.'},
     {heading:'CREW SIZE & TOLL',
      body:'Sail with a crew of 3–4 souls. There is no toll to enlist — the Voyage is free to join.'},
     {heading:'IN PERSON OR ONLINE?',
      body:'The Voyage is conducted in person at the arena. Bring your laptop, charger, and power backup.'},
     {heading:'HOW ARE VENTURES JUDGED?',
      body:'Projects are evaluated on innovation, technical execution, real-world impact, presentation quality, and domain relevance. Expert captains shall oversee the judgement.'}
   ],
   footer:'More questions? Send a raven to the organizing crew.',
   done:false},

  {nx:0.65,ny:0.32,
   title:'PARLEY',
   subtitle:'Send a Raven',
   tag:'PARLEY',
   hue:26,
   sections:[
     {heading:'THE ORGANIZING CREW',
      body:'Ganpati Raj — +91 9507542854\nKrishna Raj Barnwal — +91 7320000215\nRitusree Chanda — +91 7362994375\nAditya Gaurav — +91 70291 62093'},
     {heading:'MORE CREW',
      body:'Neeraj Sahu — +91 9336345475\nMoumita Mandal — +91 9229726302\nOmkar Kumar — +91 9631922222\nMayank Raj — +91 8969212216'},
     {heading:'SEND A RAVEN',
      body:'Have questions about the Voyage? Reach out to our organizing crew — we stand ready to help ye set sail. Contact any crew member above or find us at the Instagram Tavern and LinkedIn Guild.'}
   ],
   footer:'We stand ready. Send word and we shall answer.',
   done:false}
];

/* helpers */
function setProgress(f){
  var p=Math.round(Math.min(f,1)*100);
  var bar=document.getElementById('bar');
  var pct=document.getElementById('pct');
  if(bar)bar.style.width=p+'%';
  if(pct)pct.textContent=p+'%';
}
function fitTo(obj,size){
  obj.updateWorldMatrix(true,true);
  var box=new THREE.Box3().setFromObject(obj);
  if(box.isEmpty())return;
  var sz=new THREE.Vector3();box.getSize(sz);
  var ct=new THREE.Vector3();box.getCenter(ct);
  var mx=Math.max(sz.x,sz.y,sz.z);if(mx<=0)return;
  var s=size/mx;obj.scale.setScalar(s);obj.position.set(-ct.x*s,-ct.y*s,-ct.z*s);
}

/* book → map */
function goToMap(){
  if(appState!=='book'||animating)return;
  animating=true;appState='transitioning';
  var hint=document.getElementById('book-hint');
  if(hint)hint.style.display='none';
  var fade=document.getElementById('fade');
  fade.classList.add('in');
  setTimeout(function(){
    document.body.classList.add('map-mode');
    animateMapIn();
    fade.classList.remove('in');
    setTimeout(function(){
      var t=document.getElementById('map-title');
      if(t)t.style.opacity='1';
      appState='map';animating=false;updateHint();
    },800);
  },900);
}
function animateMapIn(){
  if(!mapRoot)return;
  mapRoot.scale.setScalar(0.001);mapRoot.rotation.y=0;
  var t0=performance.now(),dur=1000,tgt=baseMapScale*mapMult;
  (function tick(){
    var p=Math.min((performance.now()-t0)/dur,1);
    var e=1-Math.pow(1-p,3);
    mapRoot.scale.setScalar(0.001+e*(tgt-0.001));
    if(p<1)requestAnimationFrame(tick);
  })();
}

/* minimap reset */
document.getElementById('minimap-canvas').addEventListener('click',function(){
  if(appState!=='map')return;
  animateMapIn();bx=W/2;by=H*0.52;updateBoatEl();
});

function updateHint(){
  var h=document.getElementById('waypoint-hint');
  if(!h)return;
  h.textContent=visitedCount>=WP.length
    ?'All locations discovered — True Pirate Legend!'
    :'Drag the ship to discover locations ('+visitedCount+'/'+WP.length+')';
}

/* boat drag */
var boatEl=document.getElementById('boat-drag');
function updateBoatEl(){boatEl.style.left=bx+'px';boatEl.style.top=by+'px';}
updateBoatEl();

function s2w(sx,sy){
  var nx=(sx/W)*2-1,ny=-(sy/H)*2+1;
  var v=new THREE.Vector3(nx,ny,0.5).unproject(mapCam);
  var d=v.sub(mapCam.position).normalize();
  if(Math.abs(d.y)<0.0001)return new THREE.Vector3(0,0,0);
  var t=-mapCam.position.y/d.y;
  return new THREE.Vector3(mapCam.position.x+d.x*t,0,mapCam.position.z+d.z*t);
}
function syncBoat(){
  if(!boatRoot)return;
  var w=s2w(bx,by);boatRoot.position.set(w.x,0.28,w.z);
}

boatEl.addEventListener('mousedown',function(e){
  if(appState!=='map')return;
  e.preventDefault();dragging=true;dox=e.clientX-bx;doy=e.clientY-by;boatEl.style.cursor='grabbing';
});
document.addEventListener('mousemove',function(e){
  if(!dragging)return;
  bx=Math.max(60,Math.min(W-60,e.clientX-dox));
  by=Math.max(60,Math.min(H-60,e.clientY-doy));
  updateBoatEl();syncBoat();
});
document.addEventListener('mouseup',function(){
  if(!dragging)return;
  dragging=false;boatEl.style.cursor='grab';checkWP();
});
boatEl.addEventListener('touchstart',function(e){
  if(appState!=='map')return;
  e.preventDefault();var t=e.touches[0];dragging=true;dox=t.clientX-bx;doy=t.clientY-by;
},{passive:false});
document.addEventListener('touchmove',function(e){
  if(!dragging)return;e.preventDefault();
  var t=e.touches[0];
  bx=Math.max(60,Math.min(W-60,t.clientX-dox));
  by=Math.max(60,Math.min(H-60,t.clientY-doy));
  updateBoatEl();syncBoat();
},{passive:false});
document.addEventListener('touchend',function(){
  if(!dragging)return;dragging=false;checkWP();
});

/* waypoint check */
function checkWP(){
  if(appState!=='map')return;
  for(var i=0;i<WP.length;i++){
    var wp=WP[i];if(wp.done)continue;
    var dx=bx-wp.nx*W,dy=by-wp.ny*H;
    if(Math.sqrt(dx*dx+dy*dy)<100){
      wp.done=true;visitedCount++;doArrival(bx,by,wp);break;
    }
  }
}

/* arrival */
function doArrival(sx,sy,wp){
  var colors=['#DAA520','#FF8C00','#ffffff'];
  for(var i=0;i<3;i++){
    (function(delay,color){
      setTimeout(function(){
        var r=document.createElement('div');
        r.className='arr-ring';
        r.style.left=sx+'px';r.style.top=sy+'px';
        r.style.borderColor=color;
        r.style.animationDuration=(0.9+delay*0.0006)+'s';
        document.body.appendChild(r);
        setTimeout(function(){r.remove();},1400);
      },delay);
    })(i*200,colors[i]);
  }
  boatEl.style.transition='transform 0.7s cubic-bezier(0.175,0.885,0.32,1.275)';
  boatEl.style.transform='translate(-50%,-50%) scale(2.8)';
  setTimeout(function(){
    boatEl.style.transition='transform 0.4s ease';
    boatEl.style.transform='translate(-50%,-50%) scale(1)';
    setTimeout(function(){showLocation(wp);},420);
  },730);
  updateHint();
}

/* ═══ LOCATION TORN PAGE POPUP ═══ */
function showLocation(wp){
  var ov=document.getElementById('location-overlay');
  var box=document.getElementById('location-box');

  /* build inner HTML */
  var html='';
  html+='<button id="close-loc" onclick="closeLoc()">&times;<\\/button>';
  html+='<div class="loc-tag">'+wp.tag+'<\\/div>';
  html+='<h2 class="loc-title">'+wp.title+'<\\/h2>';
  html+='<div class="loc-subtitle">'+wp.subtitle+'<\\/div>';
  html+='<div class="loc-divider">⚓ ☠ ⚓<\\/div>';
  for(var i=0;i<wp.sections.length;i++){
    var s=wp.sections[i];
    html+='<div class="loc-section">';
    html+='<div class="loc-sec-head">'+s.heading+'<\\/div>';
    html+='<div class="loc-sec-body">'+s.body.replace(/\\n/g,'<br>')+'<\\/div>';
    html+='<\\/div>';
  }
  html+='<div class="loc-footer">'+wp.footer+'<\\/div>';
  box.innerHTML=html;

  /* parchment tint */
  var h=wp.hue;
  box.style.background='radial-gradient(ellipse at 30% 20%,hsl('+(h+14)+',62%,78%) 0%,hsl('+h+',55%,60%) 35%,hsl('+(h-16)+',50%,38%) 100%)';

  ov.style.display='flex';
  box.style.transform='scale(0.04)';
  box.offsetHeight;
  box.style.transition='transform 0.85s cubic-bezier(0.175,0.885,0.32,1.275)';
  setTimeout(function(){ov.style.opacity='1';box.style.transform='scale(1)';},20);
}

window.closeLoc=function(){
  var ov=document.getElementById('location-overlay');
  var box=document.getElementById('location-box');
  ov.style.opacity='0';
  box.style.transition='transform 0.45s ease';
  box.style.transform='scale(0.04)';
  setTimeout(function(){ov.style.display='none';},500);
};

/* rules popup */
document.getElementById('open-rules-btn').addEventListener('click',function(){
  var ov=document.getElementById('rules-overlay');
  var wrap=document.getElementById('rules-wrap');
  ov.style.display='flex';ov.style.opacity='0';
  wrap.style.transform='scale(0.3) rotateY(28deg)';
  wrap.style.transition='transform 0.65s cubic-bezier(0.175,0.885,0.32,1.275)';
  setTimeout(function(){ov.style.opacity='1';wrap.style.transform='scale(1) rotateY(0deg)';},20);
  startCloseup();
});
document.getElementById('close-rules').addEventListener('click',function(){
  var ov=document.getElementById('rules-overlay');
  var wrap=document.getElementById('rules-wrap');
  ov.style.opacity='0';wrap.style.transform='scale(0.3) rotateY(28deg)';
  setTimeout(function(){ov.style.display='none';stopCloseup();},480);
});
function startCloseup(){
  if(cuRaf)return;
  (function tick(){
    cuRaf=requestAnimationFrame(tick);
    if(cuRoot){
      var t=clock.getElapsedTime();
      cuRoot.scale.setScalar(cuRoot._bs*2);
      cuRoot.rotation.y=t*0.35;
      cuRoot.position.y=Math.sin(t*0.7)*0.06;
    }
    cuR.render(cuS,cuCam);
  })();
}
function stopCloseup(){if(cuRaf){cancelAnimationFrame(cuRaf);cuRaf=null;}}

/* render loop */
function animate(){
  requestAnimationFrame(animate);
  var t=clock.getElapsedTime();
  if(bookRoot&&(appState==='book'||appState==='transitioning')){
    bookRoot.rotation.y=Math.sin(t*0.4)*0.35;
    bookRoot.position.y=Math.sin(t*0.7)*0.08;
    bookR.render(bookS,bookCam);
  }
  if(appState==='map'||appState==='transitioning'){
    if(mapRoot)mapRoot.position.y=Math.sin(t*0.3)*0.04;
    mapR.render(mapS,mapCam);
    if(boatRoot){boatRoot.rotation.y=t*0.85;boatRoot.position.y=0.28+Math.sin(t*1.3)*0.07;}
    boatR.render(boatS,boatCam);
    miniR.render(mapS,miniCam);
  }
}

/* book click */
bookR.domElement.addEventListener('pointerdown',function(e){
  if(appState!=='book'||!bookRoot)return;
  mouse.x=(e.clientX/W)*2-1;mouse.y=-(e.clientY/H)*2+1;
  ray.setFromCamera(mouse,bookCam);
  if(ray.intersectObject(bookRoot,true).length>0)goToMap();
});

/* click anywhere on book canvas = go to map */
bookR.domElement.addEventListener('click',function(){
  if(appState==='book')goToMap();
});

window.addEventListener('resize',function(){
  W=window.innerWidth;H=window.innerHeight;
  bookCam.aspect=W/H;bookCam.updateProjectionMatrix();
  mapCam.aspect=W/H;mapCam.updateProjectionMatrix();
  boatCam.aspect=W/H;boatCam.updateProjectionMatrix();
  bookR.setSize(W,H);mapR.setSize(W,H);boatR.setSize(W,H);
});

/* load models */
setProgress(0.05);
var loaded=0,total=3;
var fakeP=0.05;
var fakePInt=setInterval(function(){
  if(fakeP<0.88){fakeP+=0.007;setProgress(fakeP);}
},100);

function onLoad(){
  loaded++;
  setProgress(0.05+(loaded/total)*0.95);
  console.log('Loaded '+loaded+'/'+total);
  if(loaded>=total){
    clearInterval(fakePInt);setProgress(1);
    setTimeout(function(){
      var ldg=document.getElementById('loading');
      ldg.classList.add('out');
      setTimeout(function(){ldg.style.display='none';},1100);
      appState='book';animate();
    },400);
  }
}

loader.load('book_of_pirate_rules_-_week_5.glb',function(g){
  var inner=g.scene;fitTo(inner,2.5);
  bookRoot=new THREE.Group();bookRoot.add(inner);bookS.add(bookRoot);
  cuRoot=bookRoot;cuRoot._bs=inner.scale.x;
  onLoad();
},null,function(e){console.error('Book:',e);onLoad();});

loader.load('pirate_map.glb',function(g){
  var inner=g.scene;fitTo(inner,3);
  baseMapScale=inner.scale.x;
  mapRoot=new THREE.Group();mapRoot.add(inner);
  mapRoot.position.set(0,-0.5,0);
  mapRoot.rotation.x=-Math.PI/12;
  mapRoot.scale.setScalar(0.001);
  mapS.add(mapRoot);
  onLoad();
},null,function(e){console.error('Map:',e);onLoad();});

loader.load('ship_pinnace_aft_diff.glb',function(g){
  var inner=g.scene;fitTo(inner,0.9);
  boatRoot=new THREE.Group();boatRoot.add(inner);
  boatRoot.position.set(0,0.28,0);
  boatS.add(boatRoot);
  onLoad();
},null,function(e){console.error('Ship:',e);onLoad();});

})();`;

fs.writeFileSync('voyage.js', JS, 'utf8');
console.log('voyage.js written:', JS.length);
