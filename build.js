const fs = require('fs');

// All waypoint data - ASCII safe strings only
const WP = [
  {
    nx: 0.18, ny: 0.30,
    title: 'VOYAGE MMXXVI',
    tag: 'THE TALE',
    sub: 'A 36-Hour Plunder of Innovation',
    secs: [
      { h: 'SAIL BEYOND THE KNOWN WORLD',
        b: 'Plunder the Depths of Innovation. Hoist the sails and chart a course through uncharted waters. Voyage beckons the boldest crews to forge legends across a relentless 36-hour tide where ideas become treasure and innovators become captains of tomorrow.' },
      { h: 'THE NUMBERS',
        b: '36 Hours - The Tide | 3-4 Crew Size | Rs.25,000 Treasure | 26 and 27 September MMXXVI' }
    ],
    footer: 'HOIST THE SAILS - Register now and claim yer place among the legends.',
    hue: 32
  },
  {
    nx: 0.55, ny: 0.18,
    title: 'THE WATERS I-III',
    tag: 'THE WATERS',
    sub: 'Choose Thy Domain',
    secs: [
      { h: 'I - AI / Machine Learning - Devil\'s Triangle',
        b: 'Harness the dark arts of AI and Machine Learning to conquer the unknown. Forge cognitive systems, predictive charting, and intelligent automation that bend the rules of the known world. Tags: LLMs, RAG, Agents, Neural Nets' },
      { h: 'II - Blockchain / Web3 - Tortuga Market',
        b: 'Navigate the future through Blockchain and decentralized waters. Build immutable contracts, token economies, and dApps that answer to no king. Tags: Smart Contracts, DeFi, dApps, Web3' },
      { h: 'III - FinTech - Dead Men\'s Ledger',
        b: 'Redefine the world of gold and ledgers through secure, scalable financial instruments. Where every transaction tells a tale of trust. Tags: Payments, Banking, Fraud, Trading' }
    ],
    footer: 'Six treasure-hunt domains forged to test the boldest crews.',
    hue: 28
  },
  {
    nx: 0.82, ny: 0.22,
    title: 'THE WATERS IV-VI',
    tag: 'THE WATERS',
    sub: 'Domains IV, V and VI',
    secs: [
      { h: 'IV - Healthcare - Fountain of Youth',
        b: 'Leverage the healing arts to build smarter, more accessible Healthcare. Tackle diagnostics, patient experience, and medical lore making care more human. Tags: MedTech, Diagnostics, Telehealth, AI Health' },
      { h: 'V - Cybersecurity - Davy Jones Vault',
        b: 'Fortify the digital realm against the ever-shifting tides of cyber threat. Build armored systems that guard treasure from raiders. Tags: AppSec, Crypto, Network, Forensics' },
      { h: 'VI - Open Innovation - Shipwreck Cove',
        b: 'Explore limitless waters and bring bold ideas to life across any domain. The cove rewards the daring, the creative, and the relentless. Tags: Any Domain, Creative, Bold Ideas' }
    ],
    footer: 'Pick the waters that match yer expertise and set sail toward glory.',
    hue: 24
  },
  {
    nx: 0.22, ny: 0.55,
    title: 'THE TREASURE COVE',
    tag: 'TREASURE',
    sub: 'Bounties and Booty',
    secs: [
      { h: 'FIRST BOUNTY - Rs.10,000 - GOLD HOARD',
        b: 'The finest crew claims the greatest hoard. Build something that shakes the seas and the gold is yours.' },
      { h: 'SECOND BOUNTY - Rs.7,000 - SILVER CACHE',
        b: 'Second only in gold but first in glory among the bold.' },
      { h: 'THIRD BOUNTY - Rs.5,000 - BRONZE COFFER',
        b: 'Every legend starts with a first conquest. The bronze coffer marks the beginning of your saga.' },
      { h: 'EVERY SOUL CLAIMS A SHARE',
        b: 'Crew Garb and T-Shirts, Voyager Certificates, Captain\'s Bounty, Crew Insignia Stickers, The Brotherhood Network, Counsel of Mentors, Audience with Veterans' }
    ],
    footer: 'Total Treasure Pool: Rs.25,000 awaits the finest crews.',
    hue: 38
  },
  {
    nx: 0.70, ny: 0.48,
    title: "CAPTAIN'S LOG",
    tag: "CAPTAIN'S LOG",
    sub: 'The 36-Hour Odyssey',
    secs: [
      { h: 'DAY THE FIRST',
        b: 'Orientation of the Fleet, The Voyage Begins, Morning Watch Session I, The Midday Feast, Evening Rations, Deck Games Round I, The Night Feast, Counsel of Captains Session II, Deck Games Round II' },
      { h: 'DAY THE SECOND',
        b: 'Counsel of Captains Session III, The Judgement and Submission Window, Dawn Meal, The Midday Feast, Closing Ceremony, The Voyage Concludes' },
      { h: 'KEY DATES',
        b: 'The Voyage Sets Sail: 26 September 2026. The Voyage Concludes: 27 September 2026.' }
    ],
    footer: 'From orientation to closing ceremony - 36 relentless hours of tide.',
    hue: 30
  },
  {
    nx: 0.12, ny: 0.70,
    title: "THE CAPTAIN'S CODE",
    tag: 'CODEX',
    sub: 'Rules of the Voyage',
    secs: [
      { h: 'RULE I - Bring Your Arsenal',
        b: 'Each voyager must bring their own laptop, charger, and power backup for the journey ahead.' },
      { h: 'RULE II - No Desertion',
        b: 'None shall depart the arena after registration until the voyage concludes and the tides recede.' },
      { h: 'RULE III - Wear Yer Mark',
        b: 'Wear yer participant insignia at all times within the hackathon arena. It is yer mark of passage.' },
      { h: 'RULE IV - Sail Fair',
        b: 'Wield only permitted resources and APIs in accordance with the captain\'s code of conduct.' }
    ],
    footer: 'The code is law. Sail true or not at all.',
    hue: 34
  },
  {
    nx: 0.48, ny: 0.72,
    title: 'THE BROTHERHOOD',
    tag: 'ALLIES',
    sub: 'The GRID Fleet',
    secs: [
      { h: 'WHO WE ARE',
        b: 'A student-led fellowship of more than 2,000 souls dedicated to empowering students through collaboration, hands-on learning, and real-world opportunities.' },
      { h: 'OUR FLEET',
        b: '2,000+ Souls of the Fleet, 800+ Voyagers Enlisted, AI and Web3 and Cyber Captain\'s Sessions, Pan-India Reach of the Tides' },
      { h: 'OUR MISSION',
        b: 'Bridge the gap between academy and industry through hackathons, workshops, bootcamps, webinars, networking voyages, and technical initiatives that inspire innovation and forge practical skills.' }
    ],
    footer: 'STUDENT-LED, 2000+ SOULS, PAN-INDIA',
    hue: 26
  },
  {
    nx: 0.80, ny: 0.68,
    title: 'THE ALLIES',
    tag: 'ALLIES',
    sub: 'Backed by the Finest',
    secs: [
      { h: 'BLOCKCHAIN ALLY - Algorand',
        b: 'A high-performance Layer-1 blockchain forged for speed, security, and scalability. Near-instant finality, Pure Proof-of-Stake consensus, and energy-efficient architecture for the next generation of Web3.' },
      { h: 'COMMUNITY ALLY - OSEN',
        b: 'A technology-driven fellowship championing hackathons, workshops, and developer crews with sponsorships, mentorship, speakers, swag, and growth opportunities across colleges.' },
      { h: 'AI AND TECH ALLY - Mewayz Global Corporation',
        b: 'AI-powered Business Operating Platform for ventures, creators, and enterprises. AI orchestration, Web3, CRM, website builders, payment management and marketing tools all on one unified deck.' }
    ],
    footer: 'Industry titans powering Voyage with technology, counsel, and resources.',
    hue: 22
  },
  {
    nx: 0.35, ny: 0.82,
    title: 'THE CODEX',
    tag: 'CODEX',
    sub: 'Lore and Answers',
    secs: [
      { h: 'WHO MAY JOIN?',
        b: 'All undergraduate and postgraduate souls (1st Year to Final Year) from any college across the realm. No prior hackathon experience required, only the will to build.' },
      { h: 'CREW AND TOLL',
        b: 'Sail with a crew of 3 to 4 souls. There is no toll to enlist. The Voyage is free to join.' },
      { h: 'HOW ARE VENTURES JUDGED?',
        b: 'Innovation, Technical Execution, Real-World Impact, Presentation Quality, Domain Relevance. Expert captains shall oversee the judgement.' },
      { h: 'WHAT TO BRING?',
        b: 'Yer laptop, charger, and power backup. The arena provides the rest. You bring the fire.' }
    ],
    footer: 'More questions? Send a raven to the organizing crew.',
    hue: 36
  },
  {
    nx: 0.62, ny: 0.30,
    title: 'PARLEY',
    tag: 'PARLEY',
    sub: 'Send a Raven',
    secs: [
      { h: 'THE ORGANIZING CREW',
        b: 'Ganpati Raj: +91 9507542854 | Krishna Raj Barnwal: +91 7320000215 | Ritusree Chanda: +91 7362994375 | Aditya Gaurav: +91 70291 62093' },
      { h: 'MORE CREW',
        b: 'Neeraj Sahu: +91 9336345475 | Moumita Mandal: +91 9229726302 | Omkar Kumar: +91 9631922222 | Mayank Raj: +91 8969212216' },
      { h: 'SEND A RAVEN',
        b: 'Have questions about the Voyage? Reach out to our organizing crew. We stand ready to help ye set sail. Contact: gridcommunity@example.com' }
    ],
    footer: 'We stand ready. Send word and we shall answer.',
    hue: 29
  }
];

// Build waypoint JS array string
function wpToJS(wp) {
  const secs = wp.secs.map(s =>
    `{h:${JSON.stringify(s.h)},b:${JSON.stringify(s.b)}}`
  ).join(',');
  return `{nx:${wp.nx},ny:${wp.ny},title:${JSON.stringify(wp.title)},tag:${JSON.stringify(wp.tag)},sub:${JSON.stringify(wp.sub)},secs:[${secs}],footer:${JSON.stringify(wp.footer)},hue:${wp.hue},done:false}`;
}
const wpArray = '[' + WP.map(wpToJS).join(',\n') + ']';

const voyageJS = `(function(){
'use strict';

function die(msg){var e=document.getElementById('err');e.style.display='block';e.textContent='ERROR: '+msg;console.error(msg);}
if(typeof THREE==='undefined'){die('THREE not loaded');return;}
if(typeof THREE.GLTFLoader==='undefined'){die('GLTFLoader not loaded');return;}

var W=window.innerWidth,H=window.innerHeight;

var bookR=new THREE.WebGLRenderer({antialias:true,alpha:true});
bookR.setPixelRatio(Math.min(devicePixelRatio,2));bookR.setSize(W,H);
bookR.domElement.id='book-canvas';document.body.appendChild(bookR.domElement);

var mapR=new THREE.WebGLRenderer({antialias:true,alpha:true});
mapR.setPixelRatio(Math.min(devicePixelRatio,2));mapR.setSize(W,H);
mapR.domElement.id='map-canvas';document.body.appendChild(mapR.domElement);

var boatR=new THREE.WebGLRenderer({antialias:true,alpha:true});
boatR.setPixelRatio(Math.min(devicePixelRatio,2));boatR.setSize(W,H);
boatR.domElement.id='boat-canvas';document.body.appendChild(boatR.domElement);

var miniR=new THREE.WebGLRenderer({antialias:true,alpha:true,canvas:document.getElementById('mini-canvas')});
miniR.setPixelRatio(1);miniR.setSize(180,130);

var cuR=new THREE.WebGLRenderer({antialias:true,alpha:true,canvas:document.getElementById('closeup-canvas')});
cuR.setPixelRatio(1);cuR.setSize(300,412);

var bookCam=new THREE.PerspectiveCamera(45,W/H,0.01,500);
bookCam.position.set(0,0.8,5.5);bookCam.lookAt(0,0.3,0);
var mapCam=new THREE.PerspectiveCamera(45,W/H,0.01,500);
mapCam.position.set(0,2.5,7);mapCam.lookAt(0,-0.3,0);
var boatCam=new THREE.PerspectiveCamera(45,W/H,0.01,500);
boatCam.position.set(0,2.8,6);boatCam.lookAt(0,0.2,0);
var miniCam=new THREE.PerspectiveCamera(50,180/130,0.01,500);
miniCam.position.set(0,7,9);miniCam.lookAt(0,0,0);
var cuCam=new THREE.PerspectiveCamera(35,300/412,0.01,500);
cuCam.position.set(0,0.5,3.5);cuCam.lookAt(0,0.3,0);

function mkDL(c,i,x,y,z){var l=new THREE.DirectionalLight(c,i);l.position.set(x,y,z);return l;}
var bookS=new THREE.Scene();
bookS.add(new THREE.AmbientLight(0xffffff,0.9));bookS.add(mkDL(0xffd090,0.8,3,5,4));
var mapS=new THREE.Scene();
mapS.add(new THREE.AmbientLight(0xffffff,0.85));
mapS.add(mkDL(0xffffff,0.9,5,10,7));mapS.add(mkDL(0xffd090,0.4,-5,5,-5));
var boatS=new THREE.Scene();
boatS.add(new THREE.AmbientLight(0xffffff,1.0));
boatS.add(mkDL(0xffd090,1.1,3,8,5));boatS.add(mkDL(0xffffff,0.5,-3,4,-2));
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

var WP=${wpArray};

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

function goToMap(){
  if(appState!=='book'||animating)return;
  animating=true;appState='transitioning';
  document.getElementById('book-hint').style.display='none';
  document.getElementById('fade').classList.add('in');
  setTimeout(function(){
    document.body.classList.add('map-mode');
    animateMapIn();
    document.getElementById('fade').classList.remove('in');
    setTimeout(function(){
      document.getElementById('map-title').style.opacity='1';
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
    mapRoot.scale.setScalar(0.001+(1-Math.pow(1-p,3))*(tgt-0.001));
    if(p<1)requestAnimationFrame(tick);
  })();
}

function updateHint(){
  var h=document.getElementById('waypoint-hint');
  if(!h)return;
  h.textContent=visitedCount>=WP.length
    ?'All locations discovered - True Pirate Legend!'
    :'Drag the ship to discover locations ('+visitedCount+'/'+WP.length+')';
}

document.getElementById('mini-canvas').addEventListener('click',function(){
  if(appState==='popup'){
    closePopup();
  } else if(appState==='map'){
    animateMapIn();bx=W/2;by=H*0.52;updateBoatEl();
  }
});

var boatEl=document.getElementById('boat-drag');
function updateBoatEl(){boatEl.style.left=bx+'px';boatEl.style.top=by+'px';}
updateBoatEl();

function s2w(sx,sy){
  var nx=(sx/W)*2-1,ny=-(sy/H)*2+1;
  var v=new THREE.Vector3(nx,ny,0.5).unproject(mapCam);
  var d=v.sub(mapCam.position).normalize();
  if(Math.abs(d.y)<0.0001)return new THREE.Vector3(0,0,0);
  var t2=-mapCam.position.y/d.y;
  return new THREE.Vector3(mapCam.position.x+d.x*t2,0,mapCam.position.z+d.z*t2);
}
function syncBoat(){
  if(!boatRoot)return;
  var w=s2w(bx,by);boatRoot.position.set(w.x,0.22,w.z);
}

boatEl.addEventListener('mousedown',function(e){
  if(appState!=='map')return;
  e.preventDefault();dragging=true;dox=e.clientX-bx;doy=e.clientY-by;
  boatEl.style.cursor='grabbing';
});
document.addEventListener('mousemove',function(e){
  if(!dragging)return;
  bx=Math.max(60,Math.min(W-60,e.clientX-dox));
  by=Math.max(60,Math.min(H-60,e.clientY-doy));
  updateBoatEl();syncBoat();
});
document.addEventListener('mouseup',function(){
  if(!dragging)return;dragging=false;
  boatEl.style.cursor='grab';checkWP();
});
boatEl.addEventListener('touchstart',function(e){
  if(appState!=='map')return;e.preventDefault();
  var t=e.touches[0];dragging=true;dox=t.clientX-bx;doy=t.clientY-by;
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

function checkWP(){
  if(appState!=='map')return;
  for(var i=0;i<WP.length;i++){
    var wp=WP[i];if(wp.done)continue;
    var dx=bx-wp.nx*W,dy=by-wp.ny*H;
    if(Math.sqrt(dx*dx+dy*dy)<150){
      wp.done=true;visitedCount++;doArrival(bx,by,wp);return;
    }
  }
}

function doArrival(sx,sy,wp){
  var cols=['#DAA520','#FF8C00','#ffffff'];
  for(var i=0;i<3;i++){
    (function(delay,col){
      setTimeout(function(){
        var r=document.createElement('div');
        r.className='arr-ring';
        r.style.left=sx+'px';r.style.top=sy+'px';
        r.style.borderColor=col;
        r.style.animationDuration=(1+delay*0.001)+'s';
        document.body.appendChild(r);
        setTimeout(function(){r.remove();},1500);
      },delay);
    })(i*200,cols[i]);
  }
  boatEl.style.transition='transform 0.7s cubic-bezier(0.175,0.885,0.32,1.275)';
  boatEl.style.transform='translate(-50%,-50%) scale(2.8)';
  setTimeout(function(){
    boatEl.style.transition='transform 0.4s ease';
    boatEl.style.transform='translate(-50%,-50%) scale(1)';
    setTimeout(function(){openPopup(wp);},420);
  },730);
  updateHint();
}

function openPopup(wp){
  appState='popup';
  document.body.classList.add('popup-mode');
  var box=document.getElementById('loc-box');
  var ov=document.getElementById('loc-overlay');
  var html='';
  html+='<div class="lp-tag">'+wp.tag+'</div>';
  html+='<h2 class="lp-title">'+wp.title+'</h2>';
  html+='<div class="lp-sub">'+wp.sub+'</div>';
  html+='<div class="lp-deco">~ * ~</div>';
  for(var i=0;i<wp.secs.length;i++){
    html+='<div class="lp-sec">';
    html+='<div class="lp-sh">'+wp.secs[i].h+'</div>';
    html+='<div class="lp-sb">'+wp.secs[i].b+'</div>';
    html+='</div>';
  }
  html+='<div class="lp-footer">'+wp.footer+'</div>';
  html+='<div class="lp-hint">Click the mini-map below to return to the voyage</div>';
  box.innerHTML=html;

  var h=wp.hue;
  box.style.background='radial-gradient(ellipse at 28% 18%,hsl('+(h+16)+',62%,80%) 0%,hsl('+h+',55%,62%) 32%,hsl('+(h-18)+',50%,40%) 100%)';

  ov.style.display='flex';
  box.style.transform='scale(0.03)';
  box.offsetHeight;
  box.style.transition='transform 0.9s cubic-bezier(0.175,0.885,0.32,1.275)';
  setTimeout(function(){
    ov.style.opacity='1';
    box.style.transform='scale(1)';
  },20);
  document.getElementById('mini-hint').textContent='Click to return';
}

function closePopup(){
  var ov=document.getElementById('loc-overlay');
  var box=document.getElementById('loc-box');
  document.body.classList.remove('popup-mode');
  ov.style.opacity='0';
  box.style.transition='transform 0.5s cubic-bezier(0.55,0,1,0.45)';
  box.style.transform='scale(0.03)';
  setTimeout(function(){
    ov.style.display='none';
    appState='map';
    animateMapIn();
    bx=W/2;by=H*0.52;updateBoatEl();
    document.getElementById('mini-hint').textContent='Click to reset';
  },550);
}

document.getElementById('open-rules-btn').addEventListener('click',function(){
  var ov=document.getElementById('rules-overlay');
  var wrap=document.getElementById('rules-wrap');
  ov.style.display='flex';ov.style.opacity='0';
  wrap.style.transform='scale(0.3) rotateY(28deg)';
  wrap.style.transition='transform 0.65s cubic-bezier(0.175,0.885,0.32,1.275)';
  setTimeout(function(){ov.style.opacity='1';wrap.style.transform='scale(1) rotateY(0deg)';},20);
  startCU();
});
document.getElementById('close-rules').addEventListener('click',function(){
  var ov=document.getElementById('rules-overlay');
  ov.style.opacity='0';
  document.getElementById('rules-wrap').style.transform='scale(0.3) rotateY(28deg)';
  setTimeout(function(){ov.style.display='none';stopCU();},480);
});
function startCU(){
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
function stopCU(){if(cuRaf){cancelAnimationFrame(cuRaf);cuRaf=null;}}

function animate(){
  requestAnimationFrame(animate);
  var t=clock.getElapsedTime();
  if(bookRoot&&(appState==='book'||appState==='transitioning')){
    bookRoot.rotation.y=Math.sin(t*0.4)*0.35;
    bookRoot.position.y=Math.sin(t*0.7)*0.08;
    bookR.render(bookS,bookCam);
  }
  if(appState==='map'||appState==='transitioning'||appState==='popup'){
    if(mapRoot)mapRoot.position.y=Math.sin(t*0.3)*0.04;
    mapR.render(mapS,mapCam);
    if(boatRoot){boatRoot.rotation.y=t*0.85;boatRoot.position.y=0.22+Math.sin(t*1.1)*0.05;}
    boatR.render(boatS,boatCam);
    miniR.render(mapS,miniCam);
  }
}

document.addEventListener('click',function(e){
  if(appState==='book'){
    var targ=e.target;
    if(targ.id==='book-canvas'||targ.tagName==='CANVAS'||targ.classList.contains('bg-parchment')||targ.tagName==='BODY'){
      goToMap();
    }
  }
});

window.addEventListener('resize',function(){
  W=window.innerWidth;H=window.innerHeight;
  [bookCam,mapCam,boatCam].forEach(function(c){c.aspect=W/H;c.updateProjectionMatrix();});
  bookR.setSize(W,H);mapR.setSize(W,H);boatR.setSize(W,H);
});

setProgress(0.05);
var loaded=0,total=3;
var fakeP=0.05;
var fakeInt=setInterval(function(){if(fakeP<0.88){fakeP+=0.007;setProgress(fakeP);}},100);

function onLoad(){
  loaded++;setProgress(0.05+(loaded/total)*0.95);
  if(loaded>=total){
    clearInterval(fakeInt);setProgress(1);
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
  mapRoot.position.set(0,-0.5,0);mapRoot.rotation.x=-Math.PI/12;
  mapRoot.scale.setScalar(0.001);
  mapS.add(mapRoot);onLoad();
},null,function(e){console.error('Map:',e);onLoad();});

loader.load('ship_pinnace_aft_diff.glb',function(g){
  var inner=g.scene;fitTo(inner,0.85);
  boatRoot=new THREE.Group();boatRoot.add(inner);
  boatRoot.position.set(0,0.22,0);
  boatS.add(boatRoot);onLoad();
},null,function(e){console.error('Ship:',e);onLoad();});

})();`;

const indexHTML = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8"/>
<meta name="viewport" content="width=device-width,initial-scale=1.0"/>
<title>Voyage of the Black Pearl</title>
<link href="https://fonts.googleapis.com/css2?family=Pirata+One&family=IM+Fell+English:ital@0;1&display=swap" rel="stylesheet">
<style>
*{margin:0;padding:0;box-sizing:border-box}
html,body{width:100%;height:100%;overflow:hidden;background:#100802}
.bg-wood{position:fixed;inset:0;z-index:0;pointer-events:none;
  background:repeating-linear-gradient(90deg,#3d2308 0,#4e2e0a 2px,#61390f 4px,#724418 6px,#61390f 8px,#4e2e0a 12px,#3d2308 38px,#5a3510 40px),
  linear-gradient(180deg,#2a1505,#3a1f08 30%,#2e1806 70%,#1e1004);
  background-size:40px 100%,100% 100%}
.bg-parchment{position:fixed;top:1.5%;left:2%;right:2%;bottom:1.5%;z-index:1;pointer-events:none;
  background:
    repeating-linear-gradient(128deg,transparent 0,transparent 60px,rgba(120,80,20,.06) 60px,rgba(120,80,20,.06) 61px),
    radial-gradient(ellipse at 30% 25%,#e2c98a 0,transparent 50%),
    radial-gradient(ellipse at 70% 75%,#d4b46a 0,transparent 45%),
    radial-gradient(ellipse at 50% 50%,#dbbf7e 0,#c6a050 50%,#9a7230 80%,#7a5520 100%);
  clip-path:polygon(1% 4%,0% 0%,4% 1%,8% 0%,12% 3%,16% 0%,21% 2%,26% 0%,31% 3%,36% 0%,41% 2%,46% 0%,51% 3%,56% 0%,61% 2%,66% 0%,71% 3%,76% 0%,81% 2%,86% 0%,91% 3%,95% 0%,99% 2%,100% 0%,100% 4%,99% 10%,100% 17%,99% 24%,100% 31%,99% 38%,100% 45%,99% 52%,100% 59%,99% 66%,100% 73%,99% 80%,100% 87%,99% 94%,100% 100%,96% 98%,91% 100%,86% 98%,81% 100%,76% 98%,71% 100%,66% 98%,61% 100%,56% 98%,51% 100%,46% 98%,41% 100%,36% 98%,31% 100%,26% 98%,21% 100%,16% 98%,11% 100%,6% 98%,2% 100%,0% 99%,1% 93%,0% 86%,1% 79%,0% 72%,1% 65%,0% 58%,1% 51%,0% 44%,1% 37%,0% 30%,1% 23%,0% 16%,1% 9%,0% 4%)}
.bg-vignette{position:fixed;inset:0;z-index:2;pointer-events:none;
  box-shadow:inset 0 0 90px 45px rgba(8,3,0,.95),inset 0 0 220px 60px rgba(5,2,0,.5)}
#book-canvas{display:block;position:fixed;top:0;left:0;z-index:5}
body.map-mode #book-canvas{display:none!important}
#map-canvas{display:none;position:fixed;top:0;left:0;z-index:5}
body.map-mode #map-canvas{display:block!important}
#boat-canvas{display:none;position:fixed;top:0;left:0;z-index:7;pointer-events:none}
body.map-mode #boat-canvas{display:block}
#mini-wrap{display:none;position:fixed;bottom:20px;right:20px;z-index:120;flex-direction:column;align-items:center;gap:6px;pointer-events:auto}
body.popup-mode #mini-wrap{display:flex}
#mini-canvas{width:180px;height:130px;border:3px solid #8B4513;border-radius:6px;cursor:pointer;
  box-shadow:0 0 0 1px rgba(218,165,32,.4),0 6px 24px rgba(0,0,0,.85);transition:transform .25s,box-shadow .25s;display:block}
#mini-canvas:hover{transform:scale(1.06);box-shadow:0 0 0 2px rgba(218,165,32,.8),0 8px 28px rgba(0,0,0,.9)}
#mini-hint{font-family:'Pirata One',cursive;color:#DAA520;font-size:.7rem;text-shadow:0 1px 5px rgba(0,0,0,.9);text-align:center;pointer-events:none}
#boat-drag{position:fixed;width:110px;height:110px;cursor:grab;z-index:8;transform:translate(-50%,-50%);display:none;user-select:none;touch-action:none}
body.map-mode #boat-drag{display:block}
#boat-drag:active{cursor:grabbing}
#loading{position:fixed;inset:0;z-index:500;background:#07040a;display:flex;flex-direction:column;align-items:center;justify-content:center;transition:opacity 1s}
#loading.out{opacity:0;pointer-events:none}
#loading h1{font-family:'Pirata One',cursive;color:#DAA520;font-size:2.8rem;letter-spacing:6px;margin-bottom:10px;text-shadow:0 0 30px rgba(218,165,32,.45)}
#loading p{color:#7a5a20;font-style:italic;font-family:serif;margin-bottom:32px}
#bar-bg{width:280px;height:4px;background:#1a0d00;border-radius:2px;border:1px solid #3a2000;overflow:hidden}
#bar{height:100%;width:0%;background:linear-gradient(90deg,#8B4513,#DAA520,#8B4513);background-size:200% 100%;animation:barShine 1.5s linear infinite;border-radius:2px;transition:width .4s ease}
@keyframes barShine{0%{background-position:100% 0}100%{background-position:-100% 0}}
#pct{color:#5a3a10;font-size:.78rem;margin-top:8px;font-family:monospace}
#err{display:none;position:fixed;inset:0;z-index:999;background:#000;color:#f44;font-family:monospace;padding:30px;overflow:auto;white-space:pre-wrap}
#fade{position:fixed;inset:0;background:#07040a;z-index:400;opacity:0;pointer-events:none;transition:opacity .9s}
#fade.in{opacity:1}
#book-hint{position:fixed;bottom:9%;left:50%;transform:translateX(-50%);color:#DAA520;font-family:'Pirata One',cursive;font-size:1.5rem;letter-spacing:3px;opacity:0;pointer-events:none;z-index:10;animation:fadeUp 2.2s ease 1.2s forwards;text-shadow:0 0 18px rgba(218,165,32,.5);border-bottom:1px solid rgba(218,165,32,.3);padding-bottom:5px}
@keyframes fadeUp{from{opacity:0;transform:translateX(-50%) translateY(14px)}to{opacity:1;transform:translateX(-50%) translateY(0)}}
#map-title{position:fixed;top:20px;left:50%;transform:translateX(-50%);font-family:'Pirata One',cursive;color:#DAA520;font-size:2.1rem;letter-spacing:6px;opacity:0;transition:opacity .9s;pointer-events:none;z-index:10;text-shadow:0 2px 20px rgba(0,0,0,.95)}
#open-rules-btn{position:fixed;top:20px;left:20px;z-index:10;font-family:'Pirata One',cursive;color:#DAA520;background:rgba(6,3,0,.85);border:2px solid #6B3A0A;padding:8px 18px;font-size:1rem;cursor:pointer;border-radius:4px;opacity:0;pointer-events:none;transition:opacity .6s}
body.map-mode #open-rules-btn{opacity:1;pointer-events:all}
#open-rules-btn:hover{background:rgba(55,25,0,.9);border-color:#DAA520}
#waypoint-hint{position:fixed;top:70px;left:50%;transform:translateX(-50%);font-family:'Pirata One',cursive;color:#c8a030;font-size:.95rem;opacity:0;pointer-events:none;transition:opacity .7s;z-index:10;text-shadow:0 2px 8px rgba(0,0,0,.95);white-space:nowrap}
body.map-mode #waypoint-hint{opacity:1}
@keyframes arrRing{0%{transform:translate(-50%,-50%) scale(.08);opacity:1}100%{transform:translate(-50%,-50%) scale(5.5);opacity:0}}
.arr-ring{position:fixed;width:70px;height:70px;border-radius:50%;border:3px solid #DAA520;pointer-events:none;z-index:50;transform:translate(-50%,-50%);animation:arrRing 1.1s ease-out forwards}
#loc-overlay{position:fixed;inset:0;z-index:100;background:rgba(4,2,0,.65);display:none;align-items:center;justify-content:center;opacity:0;transition:opacity .5s;pointer-events:auto}
#loc-box{
  width:90vw;max-width:1100px;height:85vh;overflow-y:auto;padding:52px 64px 48px;pointer-events:auto;cursor:auto;
  clip-path:polygon(
    0% 1.5%,1% 0%,3% 1%,6% 0%,9% 1.5%,13% 0%,17% 1%,21% 0%,25% 1.5%,29% 0%,33% 1%,37% 0%,41% 1.5%,45% 0%,49% 1%,53% 0%,57% 1.5%,61% 0%,65% 1%,69% 0%,73% 1.5%,77% 0%,81% 1%,85% 0%,89% 1.5%,93% 0%,96% 1%,99% 0%,100% 1.5%,
    99% 4%,100% 9%,99% 14%,100% 20%,99% 26%,100% 32%,99% 38%,100% 44%,99% 50%,100% 56%,99% 62%,100% 68%,99% 74%,100% 80%,99% 86%,100% 92%,99% 97%,100% 100%,
    97% 99%,93% 100%,89% 99%,85% 100%,81% 99%,77% 100%,73% 99%,69% 100%,65% 99%,61% 100%,57% 99%,53% 100%,49% 99%,45% 100%,41% 99%,37% 100%,33% 99%,29% 100%,25% 99%,21% 100%,17% 99%,13% 100%,9% 99%,5% 100%,2% 99%,0% 100%,
    1% 96%,0% 91%,1% 85%,0% 79%,1% 73%,0% 67%,1% 61%,0% 55%,1% 49%,0% 43%,1% 37%,0% 31%,1% 25%,0% 19%,1% 13%,0% 7%,1% 3%);
  background:radial-gradient(ellipse at 28% 18%,#e2c98a,#c9a85a 35%,#8a6028 100%);
  transform:scale(0.03);transition:transform .9s cubic-bezier(.175,.885,.32,1.275);
  box-shadow:0 30px 100px rgba(0,0,0,.98)}
.lp-tag{font-family:'Pirata One',cursive;color:rgba(80,40,8,.65);font-size:.85rem;letter-spacing:4px;text-transform:uppercase;margin-bottom:8px}
.lp-title{font-family:'Pirata One',cursive;color:#1a0900;font-size:3rem;line-height:1.1;margin-bottom:6px}
.lp-sub{font-family:'IM Fell English',serif;font-style:italic;color:#3a1e00;font-size:1.2rem;margin-bottom:18px;padding-bottom:14px;border-bottom:2px solid rgba(90,48,10,.3)}
.lp-deco{text-align:center;font-size:1.4rem;margin:14px 0;color:#7a4510;opacity:.4;letter-spacing:20px}
.lp-sec{margin-bottom:24px}
.lp-sh{font-family:'Pirata One',cursive;color:#2a1000;font-size:1.15rem;margin-bottom:7px;padding-left:14px;border-left:3px solid #8B4513}
.lp-sb{font-family:'IM Fell English',serif;color:#1c0900;font-size:1.05rem;line-height:1.88;padding-left:18px}
.lp-footer{font-family:'IM Fell English',serif;font-style:italic;color:#3a1e00;font-size:1.05rem;padding:16px 20px;margin-top:20px;background:rgba(90,48,10,.12);border-left:4px solid #8B4513;border-radius:0 6px 6px 0}
.lp-hint{font-family:'Pirata One',cursive;color:rgba(80,40,8,.45);font-size:.8rem;text-align:center;margin-top:28px;letter-spacing:2px}
::-webkit-scrollbar{width:5px}::-webkit-scrollbar-track{background:rgba(90,48,10,.1)}::-webkit-scrollbar-thumb{background:#8B4513;border-radius:3px}
#rules-overlay{position:fixed;inset:0;z-index:200;background:rgba(0,0,0,.9);display:none;align-items:center;justify-content:center;opacity:0;transition:opacity .45s}
#rules-wrap{position:relative;display:flex;gap:20px;width:88vw;max-width:960px;max-height:88vh;transform:scale(.3) rotateY(28deg);transition:transform .65s cubic-bezier(.175,.885,.32,1.275)}
#closeup-wrap{flex:0 0 300px;width:300px;position:relative;background:linear-gradient(145deg,#d8ba80,#ba9558,#9a7040);border:3px solid #5a3010;border-radius:8px;overflow:hidden}
#closeup-badge{position:absolute;top:9px;left:50%;transform:translateX(-50%);font-family:'Pirata One',cursive;color:#1c0900;font-size:.75rem;background:rgba(216,186,128,.9);padding:2px 12px;border-radius:12px;white-space:nowrap;pointer-events:none;z-index:1}
#closeup-canvas{display:block;width:100%!important;height:auto!important}
#rules-table-panel{flex:1;overflow-y:auto;background:linear-gradient(145deg,#caa46e,#a8804a);border:3px solid #5a3010;border-radius:8px;padding:22px 24px}
#rules-table-panel h2{font-family:'Pirata One',cursive;color:#1c0900;font-size:1.6rem;text-align:center;margin-bottom:14px}
#rules-table-panel table{width:100%;border-collapse:collapse;font-family:'IM Fell English',serif}
#rules-table-panel th{background:rgba(65,30,0,.55);color:#f0d090;font-size:.88rem;padding:7px 10px;border:1px solid rgba(65,30,0,.4);text-align:left}
#rules-table-panel td{padding:8px 10px;border:1px solid rgba(65,30,0,.2);color:#1c0900;font-size:.9rem;vertical-align:top;line-height:1.5}
#rules-table-panel tr:nth-child(even) td{background:rgba(65,30,0,.1)}
#close-rules{position:absolute;top:-14px;right:-14px;width:34px;height:34px;background:#7a3800;border:2px solid #DAA520;border-radius:50%;color:#DAA520;font-size:1.3rem;cursor:pointer;display:flex;align-items:center;justify-content:center;transition:background .2s,transform .2s}
#close-rules:hover{background:#4a2000;transform:scale(1.15)}
</style>
</head>
<body>
<div class="bg-wood"></div>
<div class="bg-parchment"></div>
<div class="bg-vignette"></div>
<div id="loading"><h1>VOYAGE</h1><p>Charting the Seven Seas...</p><div id="bar-bg"><div id="bar"></div></div><div id="pct">0%</div></div>
<div id="err"></div>
<div id="fade"></div>
<div id="book-hint">Click the Book to Begin Your Voyage</div>
<div id="map-title">THE SEVEN SEAS</div>
<button id="open-rules-btn">Pirate Code</button>
<div id="waypoint-hint">Drag the ship to discover hidden locations!</div>
<div id="mini-wrap">
  <canvas id="mini-canvas" title="Click to return / reset"></canvas>
  <div id="mini-hint">Click to reset</div>
</div>
<div id="boat-drag"></div>
<div id="loc-overlay"><div id="loc-box"></div></div>
<div id="rules-overlay">
  <div id="rules-wrap">
    <button id="close-rules">&times;</button>
    <div id="closeup-wrap">
      <div id="closeup-badge">2x Close-Up View</div>
      <canvas id="closeup-canvas" width="300" height="412"></canvas>
    </div>
    <div id="rules-table-panel">
      <h2>The Pirate Code</h2>
      <table>
        <thead><tr><th>#</th><th>Article</th><th>Penalty</th></tr></thead>
        <tbody>
          <tr><td>I</td><td>Every man shall have an equal vote in affairs of the moment; likewise equal title to fresh provisions and strong liquors seized</td><td>Marooning</td></tr>
          <tr><td>II</td><td>Every man shall be called fairly in turn by list on board for prizes and plunder</td><td>Loss of share</td></tr>
          <tr><td>III</td><td>No person to game at cards or dice for money aboard the ship</td><td>Flogging</td></tr>
          <tr><td>IV</td><td>Lights and candles out at eight o'clock; after that, drink on the open deck</td><td>Fine of rum ration</td></tr>
          <tr><td>V</td><td>Every man shall keep his piece, pistols and cutlass clean and fit for service at all times</td><td>Loss of share</td></tr>
          <tr><td>VI</td><td>No boy or woman allowed; any man found seducing the latter shall suffer death</td><td>Death</td></tr>
          <tr><td>VII</td><td>He that deserts the ship in battle shall be punished with death or marooning</td><td>Death or Marooning</td></tr>
          <tr><td>VIII</td><td>No striking one another on board; quarrels to be ended on shore with sword and pistol</td><td>Moses Law 40 lashes</td></tr>
          <tr><td>IX</td><td>No man shall talk of breaking up their way of living till each has shared a fortune of 1000 pounds</td><td>Marooning</td></tr>
          <tr><td>X</td><td>Captain and quartermaster receive two shares; master, boatswain and gunner one and a half; other officers one and a quarter</td><td>Court Martial</td></tr>
        </tbody>
      </table>
    </div>
  </div>
</div>
<script>
(function(){
  function load(src,cb){
    var s=document.createElement('script');s.src=src;
    s.onload=cb;
    s.onerror=function(){
      document.getElementById('err').style.display='block';
      document.getElementById('err').textContent='Failed to load: '+src;
    };
    document.head.appendChild(s);
  }
  load('https://cdn.jsdelivr.net/npm/three@0.128.0/build/three.min.js',function(){
    load('https://cdn.jsdelivr.net/npm/three@0.128.0/examples/js/loaders/GLTFLoader.js',function(){
      load('voyage.js',function(){console.log('Ready');});
    });
  });
})();
<\/script>
</body>
</html>`;

fs.writeFileSync('voyage.js', voyageJS, 'utf8');
fs.writeFileSync('index.html', indexHTML, 'utf8');
console.log('Done. voyage.js=' + voyageJS.length + ' index.html=' + indexHTML.length);
