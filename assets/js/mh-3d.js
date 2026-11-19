/* Mother Hospitals — interactive 3D model (Anatomy · Cycle · Conception · Pregnancy).
 * Ported from the SNR concept build (Dr-Pallavi-Prasad-Website v1.16, 3D scene only — no photos or personal details).
 * Loaded lazily after the page by a small inline loader; needs the "three" import map in <head>. */
import * as THREE from 'three';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/addons/postprocessing/UnrealBloomPass.js';
import { OutputPass } from 'three/addons/postprocessing/OutputPass.js';
import { MarchingCubes } from 'three/addons/objects/MarchingCubes.js';
import { mergeGeometries } from 'three/addons/utils/BufferGeometryUtils.js';

const stage = document.getElementById('stage');
const labelsEl = document.getElementById('labels');
const infoEl = document.getElementById('info');
const scrub = document.getElementById('scrub');
const range = document.getElementById('range');
const playBtn = document.getElementById('play');
const hormSvg = document.getElementById('horm'), hWrap = document.getElementById('hwrap'), hLbl = document.getElementById('hlbl'), hLegend = document.getElementById('hlegend');
const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;

const INFO = {
  uterus:{k:'Organ',t:'Uterus',p:'A muscular organ the size of a pear that stretches to hold a full-term baby. Fibroids, adenomyosis and pregnancy all live here.',a:'/fibroids-treatment-hyderabad.html',l:'Fibroids & heavy periods'},
  lining:{k:'Tissue',t:'Endometrium — the lining',p:'Thickens every month and sheds as your period. Bleeding between periods, or any bleeding after menopause, should always be checked.',a:'/endometriosis-treatment-hyderabad.html',l:'Endometriosis & bleeding'},
  ovary:{k:'Organ',t:'Ovaries',p:'They hold your eggs and make oestrogen and progesterone. In PMOS (formerly PCOS/PCOD), many small follicles stall instead of one maturing — so ovulation skips.',a:'/pcos-treatment-hyderabad.html',l:'PMOS (PCOD) care'},
  tube:{k:'Organ',t:'Fallopian tubes',p:'Where egg meets sperm. A tube blocked by infection or endometriosis is a common, treatable reason for not conceiving.',a:'/fertility-assessment.html',l:'Fertility evaluation'},
  cervix:{k:'Organ',t:'Cervix',p:'The neck of the uterus. Regular Pap or HPV tests, and the HPV vaccine, prevent most cervical cancer.',a:'/pap-smear-hyderabad.html',l:'Screening & vaccines'},
  vagina:{k:'Organ',t:'Vagina',p:'The birth canal, from the cervix to the outside — and the route sperm take towards the egg. Unusual discharge, itching, dryness or pain here are common and easy to treat; there is no need to feel shy about asking.',a:'/pap-smear-hyderabad.html',l:'Check-ups & screening'},
  vessels:{k:'Circulation',t:'Blood supply',p:'Uterine and ovarian arteries (red) bring blood in; veins (violet) carry it back. Doppler scans read this flow to check the placenta and baby\'s growth.',a:'/pregnancy-care-hyderabad.html',l:'Pregnancy scans'},
  placenta:{k:'Pregnancy',t:'Placenta',p:'Baby\'s lungs, kidneys and food supply in one, attached to the wall of the uterus. Its position is checked on the anomaly scan.',a:'/pregnancy-care-hyderabad.html',l:'Antenatal care'},
  cord:{k:'Pregnancy',t:'Umbilical cord',p:'Two arteries carry blood from baby to the placenta (violet); one vein brings oxygen and food back (red). Doppler of this flow tells us how well baby is fed.',a:'/high-risk-pregnancy-hyderabad.html',l:'High-risk pregnancy'},
  fluid:{k:'Pregnancy',t:'Amniotic fluid',p:'Cushions baby and lets lungs and limbs develop. Too little or too much changes how closely we monitor you.',a:'/high-risk-pregnancy-hyderabad.html',l:'High-risk pregnancy'},
  baby:{k:'Pregnancy',t:'Baby',p:'',a:'/pregnancy-care-hyderabad.html',l:'Week-by-week care'},
  follicle:{k:'Cycle',t:'Dominant follicle',p:'Each month one follicle outgrows the rest and releases an egg around day 14 of a 28-day cycle. Follicle scans track this when you are trying to conceive.',a:'/fertility-assessment.html',l:'Ovulation tracking'},
};

function showInfo(key, extraP){
  const d = INFO[key]; if(!d) return;
  infoEl.innerHTML = `<p class="label">${d.k}</p><p class="t">${d.t}</p><p>${extraP||d.p}</p><a href="${d.a}">${d.l} →</a>`;
}

const ok = (()=>{ try{ const c=document.createElement('canvas'); return !!(c.getContext('webgl2')||c.getContext('webgl')); }catch(e){ return false; } })();
// The scene is built in steps, letting the browser paint between them, so the page text and photo appear at once
// and the page never looks frozen while the 3D is prepared.
const idle = ()=> new Promise(r=>{ let done=false; const go=()=>{ if(!done){ done=true; setTimeout(r,0); } }; requestAnimationFrame(go); setTimeout(go, 60); });
const loaderEl = document.getElementById('loader'), loaderP = document.getElementById('loaderP'), loaderB = document.getElementById('loaderB');
function progress(f){ const pc = Math.round(f*100); loaderB.style.transform = `scaleX(${f})`; loaderP.textContent = pc + '%'; loaderEl.setAttribute('aria-valuenow', pc); }
const step = (f)=>{ progress(f); return idle(); };
progress(0.12);   // the 3D library has arrived; building starts
if(ok) init().catch(err=>{ console.error(err); loaderEl.remove(); }); else { labelsEl.remove(); loaderEl.remove(); }

async function init(){
  await step(0.18);
  const renderer = new THREE.WebGLRenderer({antialias:true, alpha:true, powerPreference:'high-performance'});
  renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 0.92;
  renderer.setClearColor(0x000000, 0);
  const canvas = renderer.domElement;
  canvas.tabIndex = 0;
  canvas.setAttribute('role','img');
  canvas.setAttribute('aria-label','3D female reproductive system. Use left and right arrow keys to rotate.');
  stage.prepend(canvas);

  const scene = new THREE.Scene();
  const pmrem = new THREE.PMREMGenerator(renderer);
  scene.environment = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;

  const camera = new THREE.PerspectiveCamera(30, 1, 0.1, 60);
  // cinematic ground: radial gradient painted once, plus bloom so the glowing tissue and blood flow bleed light
  { const c=document.createElement('canvas'); c.width=c.height=512; const g=c.getContext('2d');
    const r=g.createRadialGradient(330,190,10,300,250,420); r.addColorStop(0,'#2e0c44'); r.addColorStop(.5,'#16061f'); r.addColorStop(1,'#07030b');
    g.fillStyle=r; g.fillRect(0,0,512,512); const t=new THREE.CanvasTexture(c); t.colorSpace=THREE.SRGBColorSpace; scene.background=t; }
  const closeCam = new THREE.PerspectiveCamera(30, 1, 0.005, 20);
  const lensEl = document.getElementById('lens');
  const composer = new EffectComposer(renderer);
  composer.addPass(new RenderPass(scene, camera));
  const bloom = new UnrealBloomPass(new THREE.Vector2(512,512), 0.5, 0.6, 0.92);
  composer.addPass(bloom);
  composer.addPass(new OutputPass());
  const target = new THREE.Vector3(0, -0.2, 0);

  scene.add(new THREE.HemisphereLight(0xffe6ef, 0x1a0a14, 0.75));
  const key = new THREE.DirectionalLight(0xffe6dc, 2.4); key.position.set(3, 4, 5); scene.add(key);
  const rim = new THREE.DirectionalLight(0xff6f9f, 2.6); rim.position.set(-4, 1.5, -4); scene.add(rim);
  const fill = new THREE.DirectionalLight(0x8fa0ff, 0.7); fill.position.set(-3, -2, 3); scene.add(fill);
  const flash = new THREE.PointLight(0xfff2c0, 0, 3); scene.add(flash);

  const rig = new THREE.Group(); scene.add(rig);
  const anatomy = new THREE.Group(); rig.add(anatomy);
  const preg = new THREE.Group(); rig.add(preg); preg.visible = false;

  // ---------- helpers ----------
  const fadeMats = {anatomy:[], preg:[]};
  function track(groupName, mat){ mat.transparent = true; mat.userData.base = mat.userData.base ?? (mat.uniforms ? mat.uniforms.uOpacity.value : mat.opacity); fadeMats[groupName].push(mat); return mat; }

  function shellMat(base, rimC, op=1){
    return new THREE.ShaderMaterial({
      uniforms:{uBase:{value:new THREE.Color(base)}, uRim:{value:new THREE.Color(rimC)}, uOpacity:{value:op}, uGlow:{value:0}},
      vertexShader:`varying vec3 vN; varying vec3 vV;
        void main(){ vec4 mv = modelViewMatrix*vec4(position,1.0); vN = normalize(normalMatrix*normal); vV = normalize(-mv.xyz); gl_Position = projectionMatrix*mv; }`,
      fragmentShader:`uniform vec3 uBase; uniform vec3 uRim; uniform float uOpacity; uniform float uGlow; varying vec3 vN; varying vec3 vV;
        void main(){ float f = pow(1.0 - abs(dot(normalize(vN), normalize(vV))), 2.2);
          vec3 c = mix(uBase, uRim, f) + uGlow*0.35*uRim;
          float a = clamp((0.07 + 0.88*f + uGlow*0.12) * uOpacity, 0.0, 1.0);
          gl_FragColor = vec4(c, a); }`,
      transparent:true, depthWrite:false, side:THREE.DoubleSide
    });
  }
  const phys = (o)=> new THREE.MeshPhysicalMaterial(Object.assign({roughness:.45, metalness:0, clearcoat:.4, clearcoatRoughness:.3, sheen:1, sheenRoughness:.5, sheenColor:new THREE.Color(0xffc2d4)}, o));

  function taperTube(curve, segs, radial, rFn, cFn){
    const frames = curve.computeFrenetFrames(segs, false);
    const pos=[], nor=[], idx=[], col=[]; const P=new THREE.Vector3(), N=new THREE.Vector3(); const C=new THREE.Color();
    for(let i=0;i<=segs;i++){
      const t=i/segs; curve.getPointAt(t,P); const r=rFn(t); const n=frames.normals[i], b=frames.binormals[i];
      for(let j=0;j<=radial;j++){
        const v=j/radial*Math.PI*2, s=Math.sin(v), c=-Math.cos(v);
        N.set(c*n.x+s*b.x, c*n.y+s*b.y, c*n.z+s*b.z).normalize();
        pos.push(P.x+r*N.x, P.y+r*N.y, P.z+r*N.z); nor.push(N.x,N.y,N.z); if(cFn){ cFn(t,C); col.push(C.r,C.g,C.b); }
      }
    }
    for(let i=0;i<segs;i++) for(let j=0;j<radial;j++){ const a=i*(radial+1)+j, b=a+radial+1; idx.push(a,b,a+1, b,b+1,a+1); }
    const g=new THREE.BufferGeometry();
    g.setAttribute('position', new THREE.Float32BufferAttribute(pos,3));
    g.setAttribute('normal', new THREE.Float32BufferAttribute(nor,3));
    if(cFn) g.setAttribute('color', new THREE.Float32BufferAttribute(col,3));
    g.setIndex(idx); return g;
  }
  const V = (x,y,z)=> new THREE.Vector3(x,y,z);
  const curveOf = (pts)=> new THREE.CatmullRomCurve3(pts.map(p=>V(...p)), false, 'centripetal');
  const mirror = (pts)=> pts.map(([x,y,z])=>[-x,y,z]);
  let seed = 7; const rnd = ()=> (seed = (seed*16807) % 2147483647) / 2147483647;

  await step(0.32);
  // ---------- ANATOMY ----------
  // Modelled on medical 3D references: a broad, front-to-back flattened body with a domed fundus,
  // rounded horns (cornua) where the tubes join, a long narrow cervix, a forward bend (anteflexion)
  // and a slight lean to the right. Nothing is mirror-perfect: left and right tubes, ovaries and
  // vessels are built separately.
  const latheG = (pts, zs)=>{ const g=new THREE.LatheGeometry(pts.map(([r,y])=>new THREE.Vector2(r,y)), 72); g.scale(1,1,zs); g.computeVertexNormals(); return g; };

  const pickables = [];
  const glowables = {}; // key -> list of {mat, kind}
  function addGlow(key, mat, kind){ if(kind==='emis') mat.userData.ei ??= mat.emissiveIntensity; (glowables[key] ||= []).push({mat, kind}); }

  // --- procedural tissue textures: surface veins (colour + bump) and mottling ---
  function tissueTex(w, h, veins, base, tint){
    const cv=document.createElement('canvas'); cv.width=w; cv.height=h; const g=cv.getContext('2d');
    const bv=document.createElement('canvas'); bv.width=w; bv.height=h; const b=bv.getContext('2d');
    g.fillStyle=base; g.fillRect(0,0,w,h); b.fillStyle='#000'; b.fillRect(0,0,w,h);
    for(let i=0;i<260;i++){ const x=rnd()*w, y=rnd()*h, r=8+rnd()*46; const gr=g.createRadialGradient(x,y,0,x,y,r); gr.addColorStop(0,tint); gr.addColorStop(1,'rgba(0,0,0,0)'); g.fillStyle=gr; g.fillRect(x-r,y-r,2*r,2*r);
      const gb=b.createRadialGradient(x,y,0,x,y,r); gb.addColorStop(0,'rgba(255,255,255,.18)'); gb.addColorStop(1,'rgba(0,0,0,0)'); b.fillStyle=gb; b.fillRect(x-r,y-r,2*r,2*r); }
    const branch=(x,y,ang,wid,len,depth)=>{
      for(let s=0;s<len;s++){ const nx=x+Math.cos(ang)*6, ny=y+Math.sin(ang)*6;
        g.strokeStyle=`rgba(150,30,70,${0.25+wid*0.09})`; g.lineWidth=wid; g.lineCap='round'; g.beginPath(); g.moveTo(x,y); g.lineTo(nx,ny); g.stroke();
        b.strokeStyle='rgba(255,255,255,.9)'; b.lineWidth=wid*1.3; b.lineCap='round'; b.beginPath(); b.moveTo(x,y); b.lineTo(nx,ny); b.stroke();
        x=nx; y=ny; ang+=(rnd()-0.5)*0.5; wid*=0.985;
        if(depth<4 && rnd()<0.07) branch(x,y,ang+(rnd()<.5?-1:1)*(0.5+rnd()*0.6),wid*0.7,len*0.6,depth+1);
      } };
    for(const [x,a] of veins) for(let k=0;k<6;k++) branch(x*w, h*(0.1+0.8*k/5+rnd()*0.05), a+(rnd()-0.5)*0.6, 4.5, 30+rnd()*40, 0);
    const t=new THREE.CanvasTexture(cv); t.colorSpace=THREE.SRGBColorSpace; t.anisotropy=4;
    const bt=new THREE.CanvasTexture(bv); return [t, bt];
  }
  function fibreTex(){
    const c=document.createElement('canvas'); c.width=c.height=256; const g=c.getContext('2d');
    g.fillStyle='#fff'; g.fillRect(0,0,256,256);
    for(let i=0;i<140;i++){ const y=rnd()*256; g.strokeStyle=`rgba(150,40,70,${0.06+rnd()*0.12})`; g.lineWidth=0.6+rnd()*1.6; g.beginPath(); g.moveTo(0,y);
      for(let x=0;x<=256;x+=16) g.lineTo(x, y+Math.sin(x*0.03+i)*6); g.stroke(); }
    const t=new THREE.CanvasTexture(c); t.wrapS=t.wrapT=THREE.RepeatWrapping; t.repeat.set(1.4,1.4); t.colorSpace=THREE.SRGBColorSpace; return t;
  }
  function glowTex(){
    const c=document.createElement('canvas'); c.width=c.height=64; const g=c.getContext('2d');
    const r=g.createRadialGradient(32,32,0,32,32,32); r.addColorStop(0,'rgba(255,255,255,1)'); r.addColorStop(.35,'rgba(255,255,255,.35)'); r.addColorStop(1,'rgba(255,255,255,0)');
    g.fillStyle=r; g.fillRect(0,0,64,64); const t=new THREE.CanvasTexture(c); t.colorSpace=THREE.SRGBColorSpace; return t;
  }
  // texture u runs round the organ from the right side (u=0) via the back to the left (u=.5) and the front
  const [uTex, uBump] = tissueTex(1024, 512, [[0,0],[0.5,0],[0.5,Math.PI],[1,Math.PI]], '#f6c9d3', 'rgba(214,96,128,.16)');
  const [oTex, oBump] = tissueTex(512, 256, [], '#f7dce2', 'rgba(220,140,160,.35)');

  // --- shape: half-width profile, bottom (external os, with its dimple) to top (fundus) ---
  const UP = [[0.0,-1.49],[0.06,-1.53],[0.17,-1.545],[0.26,-1.515],[0.305,-1.44],[0.315,-1.2],[0.31,-0.95],[0.33,-0.72],[0.39,-0.55],[0.53,-0.38],[0.71,-0.18],[0.85,0.05],[0.945,0.3],[0.99,0.5],[0.985,0.66],[0.89,0.82],[0.67,0.95],[0.37,1.03],[0.0,1.06]];
  const upCurve = new THREE.CatmullRomCurve3(UP.map(([w,y])=>V(w,y,0)), false, 'centripetal');
  const RINGS = upCurve.getSpacedPoints(120);
  const wAt = (y)=>{ for(let i=5;i<RINGS.length-1;i++){ const a=RINGS[i], b=RINGS[i+1]; if(y>=a.y && y<=b.y) return a.x+(b.x-a.x)*(y-a.y)/((b.y-a.y)||1); } return y<0 ? 0.31 : 0.2; };
  function ringPt(w, y, phi, out){
    const c=Math.cos(phi), s=Math.sin(phi);
    const k = y<-0.6 ? 0.92 : y>-0.3 ? 0.6 : 0.92 - 0.32*((y+0.6)/0.3);     // round cervix, flat body
    const right = c>=0;
    const horn = 0.11*Math.exp(-Math.pow((y-(right?0.6:0.66))/0.13,2))*Math.pow(Math.abs(c),6);  // cornua, left a touch higher
    const asym = 1 + (right ? 0.035 : 0)*Math.max(0,(y+0.4)/1.4);
    const n = 1 + 0.022*Math.sin(3.1*c+2.3*y)*Math.cos(2.7*s-1.3*y) + 0.012*Math.sin(9*y+4*phi);
    const ww = w*(1+horn)*asym*n;
    return out.set(c*ww, y, s*ww*k);
  }
  const Y0=-0.5, YT=1.06, BEND=0.42, LEAN=0.07;
  function D(v){   // anteflexion + right lean
    if(v.y<=Y0) return v;
    const dy=v.y-Y0, t=Math.min(1,dy/(YT-Y0)), a=BEND*t, z=v.z;
    v.x += LEAN*dy*t; v.y = Y0 + dy*Math.cos(a) - z*Math.sin(a); v.z = dy*Math.sin(a) + z*Math.cos(a);
    return v;
  }
  const DV = (x,y,z)=> D(V(x,y,z));
  function organGeo(phiA, phiB, segs){
    const pos=[], uv=[], idx=[]; const P=V(); const R=RINGS.length;
    for(let i=0;i<R;i++){ const {x:w,y}=RINGS[i];
      for(let j=0;j<=segs;j++){ const phi=phiA+(phiB-phiA)*j/segs; ringPt(w,y,phi,P); D(P); pos.push(P.x,P.y,P.z); uv.push(j/segs, i/(R-1)); } }
    for(let i=0;i<R-1;i++) for(let j=0;j<segs;j++){ const a=i*(segs+1)+j, b=a+segs+1; idx.push(a,a+1,b, b,a+1,b+1); }
    const g=new THREE.BufferGeometry(); g.setAttribute('position',new THREE.Float32BufferAttribute(pos,3)); g.setAttribute('uv',new THREE.Float32BufferAttribute(uv,2)); g.setIndex(idx); g.computeVertexNormals(); return g;
  }
  function deformGeo(g, z){ const p=g.attributes.position, v=V(); for(let i=0;i<p.count;i++){ v.set(p.getX(i),p.getY(i),z); D(v); p.setXYZ(i,v.x,v.y,v.z); } g.computeVertexNormals(); return g; }

  const sectionG = new THREE.Group(); anatomy.add(sectionG);   // Cycle + Conception: textbook frontal section
  const wholeG = new THREE.Group(); anatomy.add(wholeG);       // Anatomy: the whole organ

  // whole organ
  const skinMat = track('anatomy', phys({color:0xeba5b4, map:uTex, bumpMap:uBump, bumpScale:1.4, roughness:.52, clearcoat:.4, clearcoatRoughness:.4, sheen:1, sheenRoughness:.45, sheenColor:new THREE.Color(0xffc9d4), emissive:0x2a0610, emissiveIntensity:.3, side:THREE.DoubleSide, opacity:1}));
  addGlow('uterus', skinMat, 'emis');
  const whole = new THREE.Mesh(organGeo(0, Math.PI*2, 128), skinMat); whole.userData.key='uterus'; wholeG.add(whole); pickables.push(whole);

  // section: back half + cut face + lining + cavity
  const wallMat = track('anatomy', phys({color:0xe8909f, map:uTex, bumpMap:uBump, bumpScale:2, roughness:.42, clearcoat:.85, clearcoatRoughness:.28, sheen:1, sheenColor:new THREE.Color(0xffd0dc), emissive:0x3a0614, emissiveIntensity:.35, side:THREE.DoubleSide, opacity:1}));
  addGlow('uterus', wallMat, 'emis');
  const uWall = new THREE.Mesh(organGeo(Math.PI, Math.PI*2, 64), wallMat); uWall.userData.key='uterus'; sectionG.add(uWall); pickables.push(uWall);
  const P2 = V();
  const outerOutline = [...RINGS.map(r=>{ ringPt(r.x,r.y,0,P2); return new THREE.Vector2(P2.x,r.y); }),
                        ...RINGS.slice(1,-1).reverse().map(r=>{ ringPt(r.x,r.y,Math.PI,P2); return new THREE.Vector2(P2.x,r.y); })];
  const LIN = [[0,-1.43],[0.035,-1.41],[0.06,-1.2],[0.075,-0.95],[0.05,-0.62],[0.09,-0.48],[0.3,-0.05],[0.5,0.38],[0.6,0.6],[0.64,0.68],[0.45,0.7],[0.2,0.73],[0,0.74]];
  const outline = (pts)=> [...pts.map(([r,y])=>new THREE.Vector2(r,y)), ...pts.slice(1,-1).reverse().map(([r,y])=>new THREE.Vector2(-r,y))];
  const cutShape = new THREE.Shape(outerOutline); cutShape.holes.push(new THREE.Path(outline(LIN)));
  const cutMat = track('anatomy', phys({color:0xd8697f, map:fibreTex(), roughness:.58, clearcoat:.35, sheen:.5, sheenColor:new THREE.Color(0xff9fb5), emissive:0x3a0614, emissiveIntensity:.3, side:THREE.DoubleSide, opacity:1}));
  addGlow('uterus', cutMat, 'emis');
  const cut = new THREE.Mesh(deformGeo(new THREE.ShapeGeometry(cutShape, 24), 0), cutMat); cut.userData.key='uterus'; sectionG.add(cut); pickables.push(cut);
  const liningMat = track('anatomy', phys({color:0xc0163f, emissive:0x7a0a26, emissiveIntensity:1, roughness:.35, clearcoat:.9, side:THREE.DoubleSide, opacity:1}));
  const cavityMat = track('anatomy', phys({color:0xdc6680, emissive:0x4a0a1c, emissiveIntensity:.6, roughness:.32, clearcoat:.9, clearcoatRoughness:.2, side:THREE.DoubleSide, opacity:1}));
  addGlow('lining', liningMat, 'emis'); addGlow('lining', cavityMat, 'emis');
  // the endometrium is drawn as a band hugging the cavity; the cavity behind it is a hollow trough you can see into
  const LOOP = outline(LIN), NL = LOOP.length, CY = 0.12;
  const innerOf = (x, y, sx, sy, out)=> y < -0.5 ? out.set(x*0.42, y) : out.set(x*sx, CY+(y-CY)*sy);
  const bandG = new THREE.BufferGeometry();
  bandG.setAttribute('position', new THREE.Float32BufferAttribute(new Float32Array(NL*2*3), 3));
  { const idx=[]; for(let k=0;k<NL;k++){ const k2=(k+1)%NL; idx.push(2*k,2*k+1,2*k2, 2*k2,2*k+1,2*k2+1); } bandG.setIndex(idx); }
  const lining = new THREE.Mesh(bandG, liningMat); lining.userData.key='lining'; sectionG.add(lining); pickables.push(lining);
  const TS = 24, troughG = new THREE.BufferGeometry();
  troughG.setAttribute('position', new THREE.Float32BufferAttribute(new Float32Array(LIN.length*(TS+1)*3), 3));
  { const idx=[]; for(let i=0;i<LIN.length-1;i++) for(let j=0;j<TS;j++){ const a=i*(TS+1)+j, b=a+TS+1; idx.push(a,b,a+1, b,b+1,a+1); } troughG.setIndex(idx); }
  const lumen = new THREE.Mesh(troughG, cavityMat); lumen.userData.key='lining'; sectionG.add(lumen); pickables.push(lumen);
  function setLumen(sx, sy){   // thinner lining = wider cavity
    const v=V(), q=new THREE.Vector2(), bp=bandG.attributes.position, tp=troughG.attributes.position;
    for(let k=0;k<NL;k++){ const o=LOOP[k];
      v.set(o.x, o.y, 0.004); D(v); bp.setXYZ(2*k, v.x, v.y, v.z);
      innerOf(o.x, o.y, sx, sy, q); v.set(q.x, q.y, 0.004); D(v); bp.setXYZ(2*k+1, v.x, v.y, v.z); }
    for(let i=0;i<LIN.length;i++){ const [r,y]=LIN[i]; innerOf(r, y, sx, sy, q); const deep = y < -0.5 ? 0.9 : 0.5;
      for(let j=0;j<=TS;j++){ const phi=Math.PI+Math.PI*j/TS; v.set(Math.cos(phi)*q.x, q.y, 0.004 + Math.sin(phi)*q.x*deep); D(v); tp.setXYZ(i*(TS+1)+j, v.x, v.y, v.z); } }
    bp.needsUpdate = tp.needsUpdate = true; bandG.computeVertexNormals(); troughG.computeVertexNormals();
    bandG.computeBoundingSphere(); troughG.computeBoundingSphere();
  }
  setLumen(0.55, 0.9);
  const glowLight = new THREE.PointLight(0xff8a6a, 1.2, 2.2); glowLight.position.copy(DV(0,0.2,0.45)); sectionG.add(glowLight);

  // vagina (section only): flattened back wall plus two cut walls; the cervix projects into its vault
  const VW = [[0.36,-2.35],[0.38,-2.0],[0.41,-1.7],[0.42,-1.48],[0.37,-1.34],[0.31,-1.29]];
  const vCurve = new THREE.CatmullRomCurve3(VW.map(([w,y])=>V(w,y,0)));
  const vagMat = track('anatomy', phys({color:0xe79aab, map:uTex, roughness:.45, clearcoat:.7, emissive:0x3a0614, emissiveIntensity:.35, side:THREE.DoubleSide, opacity:1}));
  addGlow('vagina', vagMat, 'emis');
  { const pos=[], idx=[], R=40, S=32; const vr=vCurve.getSpacedPoints(R);
    for(let i=0;i<=R;i++) for(let j=0;j<=S;j++){ const phi=Math.PI+Math.PI*j/S; pos.push(Math.cos(phi)*vr[i].x, vr[i].y, Math.sin(phi)*vr[i].x*0.7); }
    for(let i=0;i<R;i++) for(let j=0;j<S;j++){ const a=i*(S+1)+j, b=a+S+1; idx.push(a,a+1,b, b,a+1,b+1); }
    const g=new THREE.BufferGeometry(); g.setAttribute('position',new THREE.Float32BufferAttribute(pos,3)); g.setIndex(idx); g.computeVertexNormals();
    const m=new THREE.Mesh(g, vagMat); m.userData.key='vagina'; sectionG.add(m); pickables.push(m);
    const strip = [[0.31,-1.29],[0.37,-1.34],[0.42,-1.48],[0.41,-1.7],[0.38,-2.0],[0.36,-2.35],[0.2,-2.35],[0.19,-2.0],[0.2,-1.7],[0.24,-1.5],[0.315,-1.37]];
    for(const sgn of [1,-1]){ const sh=new THREE.Shape(strip.map(([x,y])=>new THREE.Vector2(sgn*x,y))); const mm=new THREE.Mesh(new THREE.ShapeGeometry(sh,8), cutMat); mm.userData.key='vagina'; sectionG.add(mm); pickables.push(mm); }
  }

  // raised vessel network on the whole organ (dense at the sides, where the uterine arteries arrive)
  const sVesMat = track('anatomy', phys({color:0xc8304f, roughness:.3, clearcoat:1, clearcoatRoughness:.2, emissive:0x5a0716, emissiveIntensity:.6, sheen:0, opacity:1}));
  addGlow('vessels', sVesMat, 'emis');
  function vesselWalk(th, y, steps, rad, depth, ymin, ymax, grp=wholeG, back=false){
    const pts=[]; let dTh=(rnd()-0.5)*0.5, dY=(rnd()-0.5)*0.14;
    for(let i=0;i<steps;i++){
      pts.push(D(ringPt(wAt(y)*1.014, y, th, V())));
      dTh += (rnd()-0.5)*0.22; dY += (rnd()-0.5)*0.08; dTh=Math.max(-0.35,Math.min(0.35,dTh)); dY=Math.max(-0.1,Math.min(0.1,dY));
      th += dTh*0.6; if(back) th = Math.max(Math.PI+0.12, Math.min(2*Math.PI-0.12, th)); y = Math.max(ymin, Math.min(ymax, y+dY));
      if(depth<2 && i>2 && rnd()<0.18) vesselWalk(th, y, Math.floor(steps*0.5), rad*0.65, depth+1, ymin, ymax, grp, back);
    }
    if(pts.length<3) return;
    const m = new THREE.Mesh(taperTube(new THREE.CatmullRomCurve3(pts), pts.length*6, 6, t=>rad*(1-0.55*t)), sVesMat); m.userData.key='vessels'; grp.add(m);
  }
  for(let k=0;k<28;k++){ const side = k%2 ? 0 : Math.PI; vesselWalk(side + (rnd()-0.5)*0.6, -0.9+rnd()*1.75, 9+Math.floor(rnd()*7), 0.016+rnd()*0.008, 0, -1.3, 0.98); }
  for(let k=0;k<14;k++){ vesselWalk(rnd()*Math.PI*2, -0.6+rnd()*1.4, 7+Math.floor(rnd()*5), 0.011+rnd()*0.006, 1, -1.3, 0.98); }
  for(let k=0;k<22;k++){ const st = k%3===0 ? Math.PI*1.5+(rnd()-0.5)*0.8 : k%3===1 ? Math.PI+0.15+rnd()*0.45 : 2*Math.PI-0.15-rnd()*0.45;
    vesselWalk(st, -0.9+rnd()*1.75, 8+Math.floor(rnd()*6), 0.015+rnd()*0.007, 0, -1.3, 0.98, sectionG, true); }

  // --- tubes, fimbriae, ovaries: built per side, not mirrored ---
  const tubeMat = track('anatomy', phys({color:0xf08aa2, map:oTex, bumpMap:oBump, bumpScale:1.2, roughness:.38, clearcoat:.8, opacity:1, emissive:0x3a0614, emissiveIntensity:.4}));
  addGlow('tube', tubeMat, 'emis');
  const fimbMat = track('anatomy', phys({color:0xffffff, vertexColors:true, roughness:.4, clearcoat:.7, sheen:1, sheenColor:new THREE.Color(0xffc0a0), opacity:1, emissive:0x2a0a00, emissiveIntensity:.4}));
  addGlow('tube', fimbMat, 'emis');
  const fimbCol = (t,C)=> C.setRGB(0.93+0.07*t, 0.62-0.12*t, 0.68-0.36*t).convertSRGBToLinear();
  const tipGeo = new THREE.SphereGeometry(0.018, 10, 8);
  const fimbTipMat = track('anatomy', phys({color:0xff8a4c, roughness:.35, clearcoat:.8, emissive:0x5a1a00, emissiveIntensity:.5, opacity:1}));
  const ovaryMat = track('anatomy', phys({color:0xf2c4cf, map:oTex, bumpMap:oBump, bumpScale:3, roughness:.5, clearcoat:.6, opacity:1, emissive:0x2a0814}));
  addGlow('ovary', ovaryMat, 'emis');
  const follMat = track('anatomy', phys({color:0xfff0f4, roughness:.15, clearcoat:1, opacity:.85, emissive:0x553344, emissiveIntensity:.6}));
  const smooth = (a,b,x)=>{ const t=Math.max(0,Math.min(1,(x-a)/(b-a))); return t*t*(3-2*t); };
  const cornu = { 1: D(ringPt(0.95,0.6,0,V())), [-1]: D(ringPt(0.95,0.66,Math.PI,V())) };
  const SIDE = {  // offsets from each cornu: tube path, ovary centre — the left sits lower and further back
     1: {tube:[[0,0,0],[0.34,0.09,-0.02],[0.74,0.07,-0.1],[1.04,-0.12,-0.26],[1.1,-0.45,-0.42],[0.93,-0.66,-0.5],[0.72,-0.73,-0.43]], ovary:[0.56,-0.98,-0.44], tilt:0.55},
    [-1]:{tube:[[0,0,0],[-0.3,0.13,0],[-0.68,0.11,-0.12],[-0.98,-0.08,-0.3],[-1.04,-0.42,-0.46],[-0.84,-0.64,-0.52],[-0.62,-0.7,-0.42]], ovary:[-0.5,-1.02,-0.5], tilt:-0.45},
  };
  const tubeCurves = {}, ovaries = {};
  const tubeClosedG = new THREE.Group(), tubeOpenG = new THREE.Group(); anatomy.add(tubeClosedG, tubeOpenG);
  const tubeInMat = track('anatomy', phys({color:0xd2546f, emissive:0x40081a, emissiveIntensity:.7, roughness:.35, clearcoat:.8, side:THREE.DoubleSide, opacity:1}));
  addGlow('tube', tubeInMat, 'emis');
  function openTube(curve, segs, rO, rI){   // back half of the wall, its inner lining, and the two cut edges
    const ZW=V(0,0,1), P=V(), T=V(), u=V(), w=V(), d=V();
    const o=[], on=[], ii=[], inn=[], rim=[], rimn=[], uv=[], uvr=[], idx=[], ridx=[]; const RS=10;
    for(let i=0;i<=segs;i++){ const t=i/segs; curve.getPointAt(t,P); curve.getTangentAt(t,T);
      u.crossVectors(T, ZW); if(u.lengthSq()<1e-6) u.set(1,0,0); u.normalize(); w.crossVectors(u, T).normalize(); if(w.z>0) w.negate();
      const ro=rO(t), ri=rI(t);
      for(let j=0;j<=RS;j++){ const a=Math.PI*j/RS; d.copy(u).multiplyScalar(Math.cos(a)).addScaledVector(w, Math.sin(a));
        o.push(P.x+d.x*ro, P.y+d.y*ro, P.z+d.z*ro); on.push(d.x,d.y,d.z);
        ii.push(P.x+d.x*ri, P.y+d.y*ri, P.z+d.z*ri); inn.push(-d.x,-d.y,-d.z); uv.push(t, j/RS); }
      for(const sgn of [1,-1]){ for(const r of [ro, ri]){ rim.push(P.x+u.x*sgn*r, P.y+u.y*sgn*r, P.z+u.z*sgn*r); rimn.push(-w.x,-w.y,-w.z); uvr.push(t, r===ro?0:1); } }
    }
    for(let i=0;i<segs;i++){ for(let j=0;j<RS;j++){ const a=i*(RS+1)+j, b=a+RS+1; idx.push(a,b,a+1, b,b+1,a+1); }
      for(let sIdx=0;sIdx<2;sIdx++){ const a=i*4+sIdx*2, b=a+4; ridx.push(a,b,a+1, b,b+1,a+1); } }
    const mk=(pos,nor,uvs,ix,mat,key)=>{ const g=new THREE.BufferGeometry(); g.setAttribute('position',new THREE.Float32BufferAttribute(pos,3)); g.setAttribute('normal',new THREE.Float32BufferAttribute(nor,3)); g.setAttribute('uv',new THREE.Float32BufferAttribute(uvs,2)); g.setIndex(ix); const m=new THREE.Mesh(g,mat); m.userData.key=key; return m; };
    return [mk(o,on,uv,idx,tubeMat,'tube'), mk(ii,inn,uv,idx,tubeInMat,'tube'), mk(rim,rimn,uvr,ridx,cutMat,'tube')];
  }
  for(const side of [1,-1]){
    const c0 = cornu[side], sd = SIDE[side];
    const c = new THREE.CatmullRomCurve3(sd.tube.map(([x,y,z],i)=> i===0 ? V(c0.x*0.96,c0.y,c0.z) : V(c0.x+x,c0.y+y,c0.z+z)), false, 'centripetal');
    tubeCurves[side] = c;
    const tr = t=>0.034+0.03*Math.pow(t,1.4)+0.05*smooth(0.82,1,t);
    const m = new THREE.Mesh(taperTube(c, 140, 14, tr), tubeMat);
    m.userData.key='tube'; tubeClosedG.add(m); pickables.push(m);
    for(const om of openTube(c, 140, tr, t=>tr(t)*0.55)){ tubeOpenG.add(om); pickables.push(om); }
    const ovPos = V(c0.x+sd.ovary[0], c0.y+sd.ovary[1], c0.z+sd.ovary[2]);
    // fimbriae fan out of the trumpet end and reach towards the ovary
    const end = c.getPointAt(1), tan = c.getTangentAt(1), toOv = ovPos.clone().sub(end).normalize();
    const axis = tan.clone().lerp(toOv, 0.45).normalize();
    const s1 = V().crossVectors(axis, V(0,1,0)).normalize(), s2 = V().crossVectors(axis, s1).normalize();
    for(let k=0;k<30;k++){
      const a = k/30*Math.PI*2 + rnd()*0.3, spread = 0.55 + rnd()*0.4;
      const dir = axis.clone().add(s1.clone().multiplyScalar(Math.cos(a)*spread)).add(s2.clone().multiplyScalar(Math.sin(a)*spread)).normalize();
      const len = 0.14 + rnd()*0.18, curl = (rnd()-0.5)*0.14;
      const p0 = end.clone().add(dir.clone().multiplyScalar(0.04));
      const p1 = end.clone().add(dir.clone().multiplyScalar(len*0.55)).add(s1.clone().multiplyScalar(curl));
      const p2 = end.clone().add(dir.clone().multiplyScalar(len)).add(s2.clone().multiplyScalar(curl*1.6));
      const fc = new THREE.CatmullRomCurve3([end.clone(), p0, p1, p2]);
      const f = new THREE.Mesh(taperTube(fc, 14, 7, t=>0.032*(1-0.55*t)+0.006, fimbCol), fimbMat); f.userData.key='tube'; anatomy.add(f);
      const tip = new THREE.Mesh(tipGeo, fimbTipMat); tip.position.copy(fc.getPointAt(1)); anatomy.add(tip);
    }
    // ovary: lumpy almond with follicles
    const g = new THREE.SphereGeometry(1, 56, 36); const p = g.attributes.position;
    for(let i=0;i<p.count;i++){ const x=p.getX(i), y=p.getY(i), z=p.getZ(i); const n = 1 + 0.045*Math.sin(x*9+y*5+side)*Math.cos(z*8-y*3) + 0.02*Math.sin(17*x*z); p.setXYZ(i,x*n,y*n,z*n); }
    g.computeVertexNormals();
    const o = new THREE.Mesh(g, ovaryMat);
    o.scale.set(0.33,0.2,0.23); o.position.copy(ovPos); o.rotation.set(0.25, side*0.3, sd.tilt);
    o.userData.key='ovary'; anatomy.add(o); pickables.push(o); ovaries[side]=o;
    for(let k=0;k<8;k++){
      const th = rnd()*Math.PI*2, ph = (rnd()*0.8+0.1)*Math.PI;
      const d = V(Math.sin(ph)*Math.cos(th), Math.cos(ph), Math.sin(ph)*Math.sin(th));
      const f = new THREE.Mesh(new THREE.SphereGeometry(1,16,12), follMat);
      f.scale.setScalar((0.035 + rnd()*0.03)/0.28); f.position.copy(d.multiplyScalar(0.94)); o.add(f);
    }
    // ovarian ligament to the back of the uterus, just below the tube
    const lig = new THREE.CatmullRomCurve3([ovPos.clone().add(V(-side*0.28,0.05,0)), D(ringPt(0.9,0.38,side>0?-0.45:Math.PI+0.45,V())) ]);
    anatomy.add(new THREE.Mesh(taperTube(lig, 20, 8, t=>0.03+0.01*t), ovaryMat));
  }
  // dominant follicle, corpus luteum, egg (right ovary)
  const domFol = new THREE.Mesh(new THREE.SphereGeometry(1,24,18), track('anatomy', phys({color:0xfff6f8, emissive:0xff8fb5, emissiveIntensity:.35, roughness:.1, clearcoat:1, opacity:.9})));
  domFol.position.set(0.3,0.55,0.62); domFol.scale.setScalar(0.18); ovaries[1].add(domFol);
  const corpus = new THREE.Mesh(new THREE.SphereGeometry(1,24,18), track('anatomy', phys({color:0xffc35a, emissive:0xb06a00, emissiveIntensity:.6, roughness:.5, opacity:1})));
  corpus.position.copy(domFol.position); corpus.scale.setScalar(0.001); ovaries[1].add(corpus);
  const egg = new THREE.Mesh(new THREE.SphereGeometry(0.05,20,14), new THREE.MeshBasicMaterial({color:0xfff4d6}));
  const eggGlow = new THREE.Sprite(new THREE.SpriteMaterial({map:glowTex(), color:0xffe3a0, transparent:true, depthWrite:false, blending:THREE.AdditiveBlending}));
  eggGlow.scale.setScalar(0.42); egg.add(eggGlow); egg.visible=false; anatomy.add(egg);

  // --- vessels + flow: uterine arteries climb the side of the uterus, ovarian arteries come from above ---
  const artMat = track('anatomy', new THREE.MeshStandardMaterial({color:0xb0183c, emissive:0x6a0a1e, emissiveIntensity:1, roughness:.35, opacity:1}));
  const veinMat = track('anatomy', new THREE.MeshStandardMaterial({color:0x3c3f9e, emissive:0x1a1d5a, emissiveIntensity:1, roughness:.35, opacity:1}));
  addGlow('vessels', artMat, 'emis'); addGlow('vessels', veinMat, 'emis');
  const flows = [];
  function addFlow(curve, {color, n, size=0.06, dir=1, group='anatomy', klass='art', speed=0.55}){
    const S=160, lut=new Float32Array((S+1)*3); const P=new THREE.Vector3();
    for(let i=0;i<=S;i++){ curve.getPointAt(i/S,P); lut.set([P.x,P.y,P.z], i*3); }
    const offs = Float32Array.from({length:n}, (_,i)=> (i + rnd()*0.6)/n);
    flows.push({lut, S, len:curve.getLength(), n, offs, color:new THREE.Color(color), size, dir, group, klass, speed});
  }
  const vesselPts = {};
  for(const side of [1,-1]){
    const phi = side>0 ? 0.32 : Math.PI-0.32, ov = ovaries[side].position;
    const climb = (off, dz)=>{ const pts=[V(side*(0.82+off), -1.3, 0.04+dz)];
      for(const y of [-1.0,-0.75,-0.45,-0.15,0.15,0.42]){ const q=ringPt(wAt(y)+0.07+off, y, phi, V()); q.z += 0.05*Math.sin(y*9+side) + dz; pts.push(D(q)); }
      pts.push(cornu[side].clone().add(V(side*0.12, -0.12, -0.12+dz)), ov.clone().add(V(-side*0.2, 0.12, 0.02+dz)), ov.clone().add(V(-side*0.05, 0.05, 0.06+dz)));
      return new THREE.CatmullRomCurve3(pts); };
    const ua = climb(0, 0), uv = climb(0.06, -0.09);
    const oa = new THREE.CatmullRomCurve3([ov.clone().add(V(side*0.95,1.35,-0.55)), ov.clone().add(V(side*0.75,0.8,-0.35)), ov.clone().add(V(side*0.42,0.3,-0.12)), ov.clone().add(V(side*0.12,0.08,0.02))]);
    const ovn = new THREE.CatmullRomCurve3(oa.points.map(p=>p.clone().add(V(side*0.08,0,-0.1))));
    vesselPts[side] = ua;
    for(const [c,m,r] of [[ua,artMat,0.022],[oa,artMat,0.019],[uv,veinMat,0.026],[ovn,veinMat,0.022]]){
      const mesh = new THREE.Mesh(new THREE.TubeGeometry(c, 90, r, 8, false), m); mesh.userData.key='vessels'; anatomy.add(mesh); pickables.push(mesh);
    }
    addFlow(ua,{color:0xff4d6d, n:34}); addFlow(oa,{color:0xff4d6d, n:22});
    addFlow(uv,{color:0x8c92ff, n:30, dir:-1, klass:'vein', speed:0.38}); addFlow(ovn,{color:0x8c92ff, n:20, dir:-1, klass:'vein', speed:0.38});
  }
  // menstrual flow path (cycle mode, days 1–5)
  const mensCurve = new THREE.CatmullRomCurve3([DV(0,0.25,0.02),DV(0,-0.3,0.02),DV(0,-0.9,0.02),DV(0,-1.45,0.02),DV(0,-1.9,0.02),DV(0,-2.3,0.02)]);
  addFlow(mensCurve,{color:0xd0103a, n:26, size:0.07, group:'mens', klass:'mens', speed:0.45});

  // --- label anchors, derived from the model so they stay on it ---
  const TP = {
    uterus: D(ringPt(wAt(0.3)*1.02, 0.3, 2.0, V())),
    lining: DV(0.02, 0.25, 0.03),
    tube: tubeCurves[1].getPointAt(0.42).add(V(0,0.08,0.02)),
    ovaryL: ovaries[-1].position.clone().add(V(0,0,0.25)),
    ovaryR: ovaries[1].position.clone().add(V(0.05,0.12,0.25)),
    cervix: D(ringPt(0.31,-1.25,Math.PI/2,V())).add(V(0,0,0.04)),
    cervixSec: DV(0,-1.18,0.05),
    vagina: V(0.24,-1.95,0.06),
    vessels: vesselPts[1].getPointAt(0.35).add(V(0.02,0,0.04)),
  };

  await step(0.52);
  // ---------- CONCEPTION: ovulation → sperm journey → fertilisation → cleavage → implantation ----------
  const concG = new THREE.Group(); anatomy.add(concG); concG.visible = false;
  const CP = { // timeline marks (0..1 of a 30-second story)
    ovuEnd:0.16, spermStart:0.10, spermEnd:0.44, fert:0.50, cleaveEnd:0.76, toSite:0.82, implanted:0.9 };
  const TUBE_T = 0.72; // ampulla: where fertilisation happens
  // sperm paths: vagina → cervical canal → cavity → tubal ostium → tube
  function spermPath(side, tEnd){
    const sx = side;
    const low = [DV(0.01,-2.3,0.03),DV(-0.02,-1.95,0.03),DV(0,-1.55,0.03),DV(0,-1.2,0.03),DV(0,-0.8,0.03),DV(sx*0.04,-0.45,0.03),DV(sx*0.18,-0.05,0.03),DV(sx*0.38,0.33,0.03),DV(sx*0.56,0.6,0.03)];
    const tc = tubeCurves[side]; const tube=[]; for(let i=1;i<=14;i++) tube.push(tc.getPointAt(0.02+(tEnd-0.02)*i/14));
    const c = new THREE.CatmullRomCurve3([...low, ...tube], false, 'centripetal');
    // where along the path each region starts (by nearest sample)
    const pts = c.getSpacedPoints(400); const near = (q)=>{ let b=0,bd=1e9; pts.forEach((p,i)=>{ const d=p.distanceToSquared(q); if(d<bd){bd=d;b=i;} }); return b/400; };
    return {c, uCanal:near(low[2]), uCavity:near(low[5]), uOstium:near(low[8]), pts};
  }
  const pathR = spermPath(1, TUBE_T), pathL = spermPath(-1, 0.6);
  const halfLin = (y)=>{ for(let i=0;i<LIN.length-1;i++){ const [r0,y0]=LIN[i],[r1,y1]=LIN[i+1]; if(y>=y0&&y<=y1) return r0+(r1-r0)*(y-y0)/((y1-y0)||1); } return 0.03; };
  function spreadAt(path, u){ if(u<path.uCanal) return 0.1; if(u<path.uCavity) return 0.03; if(u<path.uOstium){ const y=-0.45+0.95*(u-path.uCavity)/(path.uOstium-path.uCavity); return Math.max(0.04, halfLin(y)*0.55); } return 0.018; }
  // sperm: head + midpiece + wavy tail, instanced
  const NS = 72;
  const headGeo = new THREE.SphereGeometry(1, 14, 10); headGeo.scale(0.02, 0.032, 0.014);
  const tailPts = []; for(let k=0;k<=10;k++) tailPts.push(V(0.014*Math.sin(k*1.1), -0.028-k*0.02, 0));
  const tailGeo = taperTube(new THREE.CatmullRomCurve3(tailPts), 24, 5, t=>0.007*(1-t)+0.0015);
  const heads = new THREE.InstancedMesh(headGeo, track('anatomy', phys({color:0xfff3e6, emissive:0xffb070, emissiveIntensity:.9, roughness:.25, clearcoat:1, opacity:1})), NS);
  const tails = new THREE.InstancedMesh(tailGeo, track('anatomy', new THREE.MeshBasicMaterial({color:0xf6ecff, opacity:.85})), NS);
  heads.frustumCulled = tails.frustumCulled = false; concG.add(heads, tails);
  const sperm = Array.from({length:NS}, (_,i)=>{ const r=rnd();
    const fate = r<0.34 ? 'canal' : r<0.62 ? 'cavity' : r<0.8 ? 'left' : 'egg';
    const path = fate==='left' ? pathL : pathR;
    const stop = fate==='canal' ? 0.04+rnd()*(path.uCavity-0.04) : fate==='cavity' ? path.uCavity+rnd()*(path.uOstium-path.uCavity) : fate==='left' ? path.uOstium+rnd()*(1-path.uOstium) : 1;
    return {fate, path, stop, speed:0.82+rnd()*0.4, delay:rnd()*0.06, lane:(rnd()-0.5)*2, phase:rnd()*6.28, orbit:V(rnd()-0.5,rnd()-0.5,rnd()-0.5).normalize()}; });
  const winner = sperm.findIndex(s=>s.fate==='egg');
  // close-up sperm, to scale with the egg (head ~1/20 of the egg), only drawn inside the lens
  const MS = 14;
  const mHeadGeo = new THREE.SphereGeometry(1, 12, 8); mHeadGeo.scale(0.0065, 0.0095, 0.0045);
  const mTailPts = []; for(let k=0;k<=12;k++) mTailPts.push(V(0.006*Math.sin(k*0.9), -0.008-k*0.0062, 0));
  const mTailGeo = taperTube(new THREE.CatmullRomCurve3(mTailPts), 30, 5, t=>0.0022*(1-t)+0.0005);
  // egg in the zona pellucida with its corona of cells
  const ovum = new THREE.Group(); concG.add(ovum);
  const eggCore = new THREE.Mesh(new THREE.SphereGeometry(0.055, 32, 24), track('anatomy', phys({color:0xffb27a, emissive:0xff7a3a, emissiveIntensity:.7, roughness:.3, clearcoat:1, opacity:1})));
  const zona = new THREE.Mesh(new THREE.SphereGeometry(0.085, 32, 24), track('anatomy', shellMat(0x10203a, 0x9fd0ff, .9)));
  const corona = new THREE.InstancedMesh(new THREE.SphereGeometry(0.0075, 8, 6), track('anatomy', phys({color:0xffe2a8, emissive:0x8a6a20, emissiveIntensity:.5, roughness:.5, opacity:.8})), 70);
  { const m=new THREE.Matrix4(); for(let i=0;i<70;i++){ const d=V(rnd()-0.5,rnd()-0.5,rnd()-0.5).normalize().multiplyScalar(0.092+rnd()*0.03); m.makeTranslation(d.x,d.y,d.z); corona.setMatrixAt(i,m); } }
  const ovumGlow = new THREE.Sprite(new THREE.SpriteMaterial({map:glowTex(), color:0xffb27a, transparent:true, depthWrite:false, blending:THREE.AdditiveBlending, opacity:.8}));
  ovumGlow.scale.setScalar(0.45); ovum.add(eggCore, zona, corona, ovumGlow);
  const mHeads = new THREE.InstancedMesh(mHeadGeo, heads.material, MS), mTails = new THREE.InstancedMesh(mTailGeo, tails.material, MS);
  mHeads.frustumCulled = mTails.frustumCulled = false; mHeads.visible = mTails.visible = false; ovum.add(mHeads, mTails);
  const mDirs = Array.from({length:MS}, ()=>{ const d=V(rnd()-0.5,rnd()-0.5,(rnd()-0.2)*0.8).normalize(); return {d, ph:rnd()*6.28, lag:rnd()*0.03}; });
  function updateMicro(p, clk){
    const on = p>0.36 && p<0.56; mHeads.visible = mTails.visible = on; if(!on) return;
    const mp=V(), dir=V(), q=new THREE.Quaternion(), qw=new THREE.Quaternion(), sc=V(), m=new THREE.Matrix4();
    for(let i=0;i<MS;i++){ const o=mDirs[i];
      const a = smooth(0.37+o.lag, 0.46+o.lag, p);
      let dist = 0.26 - 0.165*a + 0.003*Math.sin(clk*8+o.ph), s = 1;
      if(i===0){ dist -= 0.03*smooth(0.47,0.5,p); if(p>=0.5) s=0; }
      else if(p>=0.5) s = Math.max(0, 1-(p-0.5)/0.05);
      mp.copy(o.d).multiplyScalar(dist); dir.copy(o.d).negate();
      q.setFromUnitVectors(UPV, dir); qw.setFromAxisAngle(ZAX, 0.4*Math.sin(clk*18+o.ph)); q.multiply(qw);
      m.compose(mp, q, sc.set(s,s,s)); mHeads.setMatrixAt(i,m); mTails.setMatrixAt(i,m);
    }
    mHeads.instanceMatrix.needsUpdate = mTails.instanceMatrix.needsUpdate = true;
  }
  // embryo: cells that divide 1 → 2 → 4 → 8 → 16, then a blastocyst
  const cells = new THREE.InstancedMesh(new THREE.SphereGeometry(1, 20, 14), track('anatomy', phys({color:0xffc4b0, emissive:0xff8a6a, emissiveIntensity:.5, roughness:.3, clearcoat:1, opacity:1})), 16);
  cells.frustumCulled=false; ovum.add(cells);
  const blasto = new THREE.Mesh(new THREE.SphereGeometry(0.075, 32, 24), track('anatomy', shellMat(0x3a0a1c, 0xffb0a0, .9))); ovum.add(blasto);
  const fib = (n,r)=> Array.from({length:n},(_,i)=>{ const y=1-2*(i+0.5)/n, rr=Math.sqrt(1-y*y), th=i*2.39996; return [Math.cos(th)*rr*r, y*r, Math.sin(th)*rr*r]; });
  const ARR = {1:[[0,0,0]], 2:[[-0.03,0,0],[0.03,0,0]], 4:[[0.025,0.025,0.025],[-0.025,-0.025,0.025],[-0.025,0.025,-0.025],[0.025,-0.025,-0.025]],
               8:[-1,1].flatMap(a=>[-1,1].flatMap(b=>[-1,1].map(c=>[a*0.024,b*0.024,c*0.024]))), 16:fib(16,0.042), icm:fib(8,0.022).map(([x,y,z])=>[x,y+0.045,z])};
  const RAD = {1:0.055, 2:0.042, 4:0.034, 8:0.028, 16:0.021, icm:0.016};
  const implantSite = DV(0.24,0.66,0.012), siteApproach = DV(0.26,0.42,0.03), ostiumR = DV(0.56,0.6,0.03);
  const implantGlow = new THREE.Sprite(new THREE.SpriteMaterial({map:glowTex(), color:0xff6a8a, transparent:true, depthWrite:false, blending:THREE.AdditiveBlending, opacity:0}));
  implantGlow.scale.setScalar(0.5); implantGlow.position.copy(implantSite); concG.add(implantGlow);
  const STAGES = [
    [0.0,  'Ovulation','Day 14','Ovulation','An LH surge bursts the ripest follicle. The egg — the largest cell in the body, about 0.1 mm — is swept into the tube by the fimbriae. It can be fertilised for only 12–24 hours.'],
    [0.10, 'Sperm journey','Minutes to hours','The journey','Of 200–300 million sperm, only a few hundred reach the egg. Cervical mucus, the uterus and the tubes filter them out. Sperm can live up to 5 days, so the fertile window opens before ovulation.'],
    [0.45, 'Fertilisation','Within 24 hours','Fertilisation','In the widest part of the tube (the ampulla) one sperm breaks through the egg\'s shell, the zona pellucida. The shell then hardens so no other sperm can enter.'],
    [0.52, 'Cell division','Day 1–3','Cleavage','The fertilised egg divides every 12–24 hours — 2 cells, 4, then 8 — while tiny hairs in the tube move it towards the uterus. If it stalls in the tube, it becomes an ectopic pregnancy, an emergency.'],
    [0.72, 'Morula','Day 3–4','Morula','A solid ball of 16 or more cells enters the uterus through the tubal opening.'],
    [0.78, 'Blastocyst','Day 5','Blastocyst','A hollow ball of cells. The inner cluster becomes the baby; the outer layer becomes the placenta. It hatches out of its shell.'],
    [0.82, 'Implantation','Day 6–10','Implantation','It burrows into the thick, nourished lining. The new placenta starts making hCG — the hormone a pregnancy test detects, around the day the period is missed.'],
  ];
  const stageAt = (p)=>{ let s=STAGES[0]; for(const st of STAGES) if(p>=st[0]) s=st; return s; };
  const M4=new THREE.Matrix4(), Q=new THREE.Quaternion(), Qw=new THREE.Quaternion(), S3=V(1,1,1), Z0=V(0,0,0), UPV=V(0,1,0), ZAX=V(0,0,1);
  const sp=V(), st=V(), nrm=V(), fpos=V(), ampulla = tubeCurves[1].getPointAt(TUBE_T), fimbEnd = tubeCurves[1].getPointAt(1);
  function cellsShow(key, r){ const arr = ARR[key]; cells.count = arr.length; for(let i=0;i<arr.length && i<16;i++){ const [x,y,z]=arr[i]; M4.compose(V(x,y,z), Q.identity(), S3.set(r,r,r)); cells.setMatrixAt(i,M4); } cells.instanceMatrix.needsUpdate=true; }
  function updateConception(p, clk){
    concG.visible = true;
    // --- egg / embryo position ---
    let pos;
    if(p < 0.05){ domFol.getWorldPosition(fpos); anatomy.worldToLocal(fpos); pos = fpos.clone(); domFol.scale.setScalar(0.2 + 0.08*smooth(0,0.04,p)); }
    else if(p < 0.09){ domFol.scale.setScalar(0.001); domFol.getWorldPosition(fpos); anatomy.worldToLocal(fpos); pos = fpos.clone().lerp(fimbEnd, smooth(0.05,0.09,p)); }
    else if(p < CP.ovuEnd){ pos = tubeCurves[1].getPointAt(1-(1-TUBE_T)*smooth(0.09,CP.ovuEnd,p)); }
    else if(p < 0.52){ pos = ampulla.clone(); }
    else if(p < CP.cleaveEnd){ pos = tubeCurves[1].getPointAt(TUBE_T*(1-smooth(0.52,CP.cleaveEnd,p))); }
    else if(p < CP.toSite){ const t=smooth(CP.cleaveEnd,CP.toSite,p); pos = tubeCurves[1].getPointAt(0).lerp(ostiumR, Math.min(1,t*2)).lerp(siteApproach, Math.max(0,t*2-1)); }
    else { pos = siteApproach.clone().lerp(implantSite, smooth(CP.toSite, CP.implanted, p)); }
    if(p>=0.05) domFol.scale.setScalar(0.001);
    ovum.position.copy(pos);
    flash.intensity = p>0.03 && p<0.06 ? 7*Math.sin((p-0.03)/0.03*Math.PI) : p>0.495 && p<0.52 ? 5*Math.sin((p-0.495)/0.025*Math.PI) : 0;
    if(flash.intensity>0) concG.localToWorld(flash.position.copy(p<0.1 ? fpos : pos));
    ovum.visible = p >= 0.03;
    const fertilised = p >= CP.fert;
    eggCore.visible = !fertilised; corona.visible = !fertilised || p<0.56;
    zona.visible = p < 0.8; zona.material.uniforms.uGlow.value = fertilised ? 0.4 : 0;
    blasto.visible = p >= 0.78;
    if(!fertilised) cells.count = 0;
    else if(p<0.57) cellsShow(1, RAD[1]); else if(p<0.62) cellsShow(2, RAD[2]); else if(p<0.67) cellsShow(4, RAD[4]);
    else if(p<0.72) cellsShow(8, RAD[8]); else if(p<0.78) cellsShow(16, RAD[16]); else cellsShow('icm', RAD.icm);
    if(p>=0.78){ const s=1-0.25*smooth(CP.toSite,CP.implanted,p); blasto.scale.setScalar(s); }
    ovumGlow.material.opacity = fertilised ? 0.5 : 0.85;
    implantGlow.material.opacity = p>CP.toSite ? (0.35+0.35*Math.sin(clk*3))*smooth(CP.toSite,CP.implanted,p) : 0;
    // --- sperm ---
    let vis = 0;
    for(let i=0;i<NS;i++){
      const s = sperm[i]; const t0 = CP.spermStart + s.delay;
      let show = p >= t0 && p < 0.56, scale = 1;
      let u = Math.min(s.stop, Math.max(0, (p - t0)/(CP.spermEnd - CP.spermStart - 0.06)*s.speed));
      const doneAt = t0 + s.stop*(CP.spermEnd - CP.spermStart - 0.06)/s.speed;
      if(s.fate!=='egg' && u>=s.stop){ const k=(p-doneAt)/0.03; scale = Math.max(0, 1-k); if(scale<=0) show=false; }
      if(!show){ M4.compose(Z0, Q.identity(), S3.set(0,0,0)); heads.setMatrixAt(i,M4); tails.setMatrixAt(i,M4); continue; }
      vis++;
      const path = s.path; const fu = Math.min(0.999, u);
      path.c.getPointAt(fu, sp); path.c.getTangentAt(fu, st);
      nrm.set(-st.y, st.x, 0).normalize();
      sp.addScaledVector(nrm, s.lane*spreadAt(path, fu) + 0.012*Math.sin(clk*7+s.phase));
      if(s.fate==='egg' && u>=1){   // arrived: crowd the egg, nose in
        const k = i===winner ? smooth(0.47,0.5,p) : 0;
        sp.copy(ovum.position).addScaledVector(s.orbit, 0.1 - 0.05*k + 0.006*Math.sin(clk*9+s.phase));
        st.copy(ovum.position).sub(sp).normalize();
        if(i===winner && p>=CP.fert) scale=0;
        if(i!==winner && p>=CP.fert) scale = Math.max(0, 1-(p-CP.fert)/0.05);
      }
      Q.setFromUnitVectors(UPV, st); Qw.setFromAxisAngle(ZAX, 0.35*Math.sin(clk*16+s.phase)); Q.multiply(Qw);
      M4.compose(sp, Q, S3.set(scale,scale,scale)); heads.setMatrixAt(i,M4); tails.setMatrixAt(i,M4);
    }
    heads.instanceMatrix.needsUpdate = tails.instanceMatrix.needsUpdate = true;
    updateMicro(p, clk);
    mHeads.visible = mTails.visible = false;   // shown only for the lens pass
    return vis;
  }
  function hideConception(){ concG.visible=false; }

  await step(0.62);
  // ---------- PREGNANCY ----------
  const PU = [[0,-1.75],[0.28,-1.7],[0.33,-1.45],[0.62,-1.25],[1.06,-0.95],[1.36,-0.5],[1.48,0],[1.45,0.5],[1.3,0.95],[1.0,1.3],[0.55,1.52],[0,1.58]];
  const pug = latheG(PU, 0.85);
  const pShell = new THREE.Mesh(pug, track('preg', shellMat(0x4a0c28, 0xff8fb5))); pShell.renderOrder=6; preg.add(pShell);
  const pWall = new THREE.Mesh(pug, track('preg', phys({color:0xd9466e, opacity:.16, depthWrite:false, clearcoat:1, roughness:.3}))); pWall.renderOrder=5; preg.add(pWall);
  const sac = new THREE.Mesh(new THREE.SphereGeometry(1.24,48,32), track('preg', shellMat(0x2a0e18, 0xffc2a0, .6)));
  sac.scale.set(1,1.04,0.8); sac.position.y=0.05; sac.renderOrder=4; sac.userData.key='fluid'; preg.add(sac); pickables.push(sac); addGlow('fluid', sac.material, 'shell');
  const plG = new THREE.SphereGeometry(1,48,24); { const p=plG.attributes.position; for(let i=0;i<p.count;i++){ const x=p.getX(i),y=p.getY(i),z=p.getZ(i); const n=1+0.06*Math.sin(x*11)*Math.sin(z*11); p.setXYZ(i,x*n,y,z*n);} plG.computeVertexNormals(); }
  const placentaMat = track('preg', phys({color:0x9e1638, emissive:0x3a0010, emissiveIntensity:1, roughness:.6, clearcoat:.2, opacity:1}));
  const placenta = new THREE.Mesh(plG, placentaMat); placenta.scale.set(0.72,0.2,0.62); placenta.position.set(0.12,1.15,-0.28); placenta.rotation.x = 0.35;
  placenta.userData.key='placenta'; preg.add(placenta); pickables.push(placenta); addGlow('placenta', placentaMat, 'emis');

  // Fetus: one continuous skin built from an implicit surface (marching cubes over blended balls),
  // posed in the curled fetal position — head down, chin tucked, spine in a C, knees drawn up,
  // hands near the face. Designed head-up facing +x, then flipped and turned to a 3/4 profile.
  const fetus = new THREE.Group(); fetus.position.set(0,0.02,0.05); fetus.rotation.y = 0.65; preg.add(fetus);
  const skin = track('preg', phys({color:0xf0b4a0, emissive:0x5a2414, emissiveIntensity:.18, roughness:.5, clearcoat:.25, clearcoatRoughness:.4, sheen:.55, sheenRoughness:.45, sheenColor:new THREE.Color(0xffd0c0), opacity:1}));
  addGlow('baby', skin, 'emis');
  const body = new THREE.Group(); body.rotation.z = Math.PI; body.scale.setScalar(1.45); fetus.add(body);
  const mc = new MarchingCubes(110, skin, false, false, 160000);
  mc.isolation = 80; mc.frustumCulled = false; mc.scale.setScalar(1/1.4); mc.userData.key='baby';
  const PARTS = []; let part = 5;   // 0 body, 1 right leg, 2 left leg, 3 right forearm, 4 left forearm, 5 head
  const ball = (x,y,z,r,sub=30,sign=1)=>{ const rn=r*0.7; mc.addBall(0.5+x*0.7, 0.5+y*0.7, 0.5+z*0.7, sign*(80+sub)*rn*rn, sub); if(sign>0) PARTS.push([x,y,z,r,part]); };
  const chain = (a,b,ra,rb,n=7,sub=45)=>{ for(let i=0;i<=n;i++){ const t=i/n; ball(a[0]+(b[0]-a[0])*t, a[1]+(b[1]-a[1])*t, a[2]+(b[2]-a[2])*t, ra+(rb-ra)*t, sub); } };
  mc.reset();
  // head: cranium and occiput, brow, closed eyes, nose, lips, chin, cheeks, jaw, ears
  ball(-0.01,0.41,0,.212,22); ball(-0.085,0.44,0,.178,22); ball(0.05,0.48,0,.168,24); ball(0.15,0.43,0,.098,40);
  for(const z of [0.066,-0.066]){ ball(0.205,0.372,z,.036,62); ball(0.226,0.382,z,.024,85,-1); }   // puffy closed eyelids, a soft crease
  ball(0.205,0.36,0,.046,50); ball(0.232,0.352,0,.026,75); ball(0.246,0.328,0,.05,46); for(const z of [0.024,-0.024]) ball(0.217,0.309,z,.028,62);
  ball(0.218,0.284,0,.042,55); ball(0.208,0.254,0,.038,55); ball(0.238,0.27,0,.017,85,-1);
  ball(0.178,0.222,0,.048,52);
  for(const z of [0.085,-0.085]){ ball(0.15,0.312,z,.082,42); ball(0.09,0.25,z,.066,42); }
  for(const z of [0.19,-0.19]){ ball(-0.02,0.35,z,.048,62); ball(-0.035,0.385,z*1.02,.033,72); }
  // neck, chest, belly, curved spine, buttocks, shoulders
  part=0; ball(0.02,0.18,0,.088,40);
  ball(0.0,0.06,0,.158,28); ball(0.03,-0.08,0,.162,28); ball(0.07,-0.2,0,.148,28);
  ball(-0.1,0.04,0,.12,34); ball(-0.12,-0.1,0,.12,34); ball(-0.08,-0.25,0,.12,34);
  for(const z of [0.06,-0.06]) ball(-0.04,-0.33,z,.1,36);
  for(const z of [0.12,-0.12]) ball(0.0,0.11,z,.068,46);
  // arms folded up, hands by the face (left a little lower), fingers curled towards the mouth
  chain([0.0,0.1,0.15],[0.11,-0.04,0.19],.048,.042,7,55); part=3; chain([0.11,-0.04,0.19],[0.24,0.14,0.13],.04,.032,7,55);
  ball(0.262,0.168,0.118,.036,55);
  part=0; chain([0.0,0.1,-0.15],[0.13,-0.03,-0.19],.048,.042,7,55); part=4; chain([0.13,-0.03,-0.19],[0.21,0.12,-0.13],.04,.032,7,55);
  ball(0.235,0.15,-0.1,.036,55);
  // legs drawn up: knees to the chest, shins folded back, feet tucked and crossed in front of the bottom
  part=1; chain([0.02,-0.3,0.085],[0.22,-0.02,0.13],.068,.056,8,50); chain([0.22,-0.02,0.13],[0.16,-0.27,0.11],.052,.038,7,55);
  ball(0.17,-0.29,0.11,.03,60); chain([0.16,-0.28,0.11],[0.12,-0.33,0.0],.034,.025,5,62);
  part=2; chain([0.02,-0.3,-0.085],[0.24,0.01,-0.14],.068,.056,8,50); chain([0.24,0.01,-0.14],[0.18,-0.25,-0.12],.052,.038,7,55);
  ball(0.19,-0.27,-0.12,.03,60); chain([0.18,-0.26,-0.12],[0.15,-0.3,-0.01],.034,.025,5,62);
  mc.update(); mc.geometry.computeBoundingSphere();
  body.add(mc); pickables.push(mc);
  // Movement. The baby is one blended surface, so limbs are bent in the vertex shader: each skin vertex gets a
  // weight per limb (soft nearest-part, so the skin stretches smoothly at hips and elbows), and the shader turns
  // legs about the hips and forearms about the elbows. Weights are computed once; motion costs nothing per frame.
  function skinWeights(geo, n){
    // one pass over the parts per vertex, plain sqrt, and each distinct vertex only once (the blended surface
    // repeats every vertex for each triangle that shares it) — this runs before the page can finish loading
    const P = geo.attributes.position.array, W = new Float32Array(n*4), H = new Float32Array(n), K = 0.007;
    const m = PARTS.length, px = new Float32Array(m), py = new Float32Array(m), pz = new Float32Array(m), pr = new Float32Array(m), pg = new Uint8Array(m);
    PARTS.forEach((q,j)=>{ px[j]=q[0]; py[j]=q[1]; pz[j]=q[2]; pr[j]=q[3]; pg[j]=q[4]; });
    const d = new Float32Array(6), e = new Float32Array(6), seen = new Map();
    for(let i=0;i<n;i++){
      const key = P[i*3] + ',' + P[i*3+1] + ',' + P[i*3+2], hit = seen.get(key);
      if(hit !== undefined){ if(hit >= 0){ W.copyWithin(i*4, hit*4, hit*4+4); H[i] = H[hit]; } continue; }
      const x=P[i*3]/1.4, y=P[i*3+1]/1.4, z=P[i*3+2]/1.4;
      d.fill(9);
      for(let j=0;j<m;j++){ const dx=x-px[j], dy=y-py[j], dz=z-pz[j], v=Math.sqrt(dx*dx+dy*dy+dz*dz)-pr[j], g=pg[j]; if(v<d[g]) d[g]=v; }
      if(Math.min(d[1],d[2],d[3],d[4],d[5]) > 0.08){ seen.set(key, -1); continue; }   // nowhere near a limb or the head: weights stay 0
      let lo = 9; for(let g=0; g<6; g++) if(d[g]<lo) lo=d[g];
      let sum = 0; for(let g=0; g<6; g++){ e[g] = Math.exp(-(d[g]-lo)/K); sum += e[g]; }
      for(let g=0; g<4; g++) W[i*4+g] = e[g+1]/sum;
      H[i] = e[5]/sum; seen.set(key, i);
    }
    geo.setAttribute('aW', new THREE.BufferAttribute(W, 4)); geo.setAttribute('aH', new THREE.BufferAttribute(H, 1));
  }
  await step(0.78);
  skinWeights(mc.geometry, mc.count);
  // fingers and toes: too fine for the blended surface's grid, so they are separate curled shapes on the same skin
  {
    const groups = {1:[], 2:[], 3:[], 4:[]}; let parts = null; const up = V(0,1,0);   // 1/2 right/left leg, 3/4 right/left forearm
    const seg = (a, dir, len, r)=>{ const d = dir.clone().normalize(), g = new THREE.CapsuleGeometry(r, len, 4, 10);
      g.applyQuaternion(new THREE.Quaternion().setFromUnitVectors(up, d)); const c = a.clone().addScaledVector(d, len/2); g.translate(c.x, c.y, c.z); parts.push(g.toNonIndexed()); return a.clone().addScaledVector(d, len); };
    const finger = (base, d1, d2, len, r)=>{ const mid = seg(base, d1, len, r); seg(mid, d2, len*0.6, r*0.92); };
    for(const sz of [1, -1]){                         // right hand (by the chin), left hand (below the chin)
      parts = groups[sz>0 ? 3 : 4];
      const H = sz>0 ? V(0.262,0.168,0.118) : V(0.235,0.15,-0.1);
      [[-0.022,0.032],[-0.008,0.04],[0.006,0.038],[0.019,0.03]].forEach(([dx,len],i)=>
        finger(H.clone().add(V(dx, 0.024, -0.004*sz)), V(0.08*(i-1.5), 1, -0.3*sz), V(0.1, 0.5, -1*sz), len, i===3 ? 0.0078 : 0.0088));
      finger(H.clone().add(V(0.026, 0.0, -0.012*sz)), V(0.6, 0.6, -0.5*sz), V(0.3, 0.9, -0.6*sz), 0.026, 0.0098);   // thumb
    }
    for(const [from, tip, g] of [[V(0.16,-0.28,0.11), V(0.12,-0.33,0.0), 1], [V(0.18,-0.26,-0.12), V(0.15,-0.3,-0.01), 2]]){
      parts = groups[g];
      const n = tip.clone().sub(from).normalize(), side = n.clone().cross(V(1,0,0)).normalize();
      [0.0115,0.0095,0.009,0.0085,0.008].forEach((r,i)=>{ const p = tip.clone().addScaledVector(n, 0.014 - i*i*0.0012).addScaledVector(side, (i-1.6)*0.017);
        const sg = new THREE.SphereGeometry(r, 12, 9); sg.translate(p.x, p.y, p.z); parts.push(sg.toNonIndexed()); });
    }
    const merged = Object.entries(groups).map(([gi, list])=>{ const m = mergeGeometries(list), n = m.attributes.position.count;
      const W = new Float32Array(n*4); for(let i=0;i<n;i++) W[i*4 + (+gi) - 1] = 1;
      m.setAttribute('aW', new THREE.BufferAttribute(W, 4)); m.setAttribute('aH', new THREE.BufferAttribute(new Float32Array(n), 1)); return m; });
    const digits = mergeGeometries(merged); digits.scale(1.4, 1.4, 1.4);   // into the blended surface's space
    const dm = new THREE.Mesh(digits, skin); dm.userData.key = 'baby'; mc.add(dm); pickables.push(dm);
  }
  const limbU = { value: new THREE.Vector4() };   // right leg, left leg, right forearm, left forearm (radians)
  const headU = { value: new THREE.Vector2() };   // nod, turn (radians)
  const hairU = { value: 0 }, eyeU = { value: 0 };   // by week: hair fills in from 20, eyes open from 28
  skin.onBeforeCompile = (sh)=>{
    sh.uniforms.uLimb = limbU; sh.uniforms.uHead = headU; sh.uniforms.uHair = hairU; sh.uniforms.uEye = eyeU;
    sh.vertexShader = sh.vertexShader
      .replace('#include <common>', `#include <common>
        attribute vec4 aW; attribute float aH; uniform vec4 uLimb; uniform vec2 uHead; varying vec3 vRest;
        const vec3 NECK = vec3(0.02,0.2,0.0);
        const vec3 HIP_R = vec3(0.02,-0.3,0.085), HIP_L = vec3(0.02,-0.3,-0.085), ELB_R = vec3(0.11,-0.04,0.19), ELB_L = vec3(0.13,-0.03,-0.19);
        vec3 rotZ(vec3 q, float a){ float s=sin(a), c=cos(a); return vec3(q.x*c-q.y*s, q.x*s+q.y*c, q.z); }
        vec3 rotY(vec3 q, float a){ float s=sin(a), c=cos(a); return vec3(q.x*c+q.z*s, q.y, -q.x*s+q.z*c); }
        vec3 headR(vec3 q){ return rotY(rotZ(q, uHead.x), uHead.y); }
        vec3 bendP(vec3 b){ return b
          + aW.x*(HIP_R + rotZ(b-HIP_R, -uLimb.x) - b) + aW.y*(HIP_L + rotZ(b-HIP_L, -uLimb.y) - b)
          + aW.z*(ELB_R + rotZ(b-ELB_R,  uLimb.z) - b) + aW.w*(ELB_L + rotZ(b-ELB_L,  uLimb.w) - b)
          + aH*(NECK + headR(b-NECK) - b); }
        vec3 bendN(vec3 n){ return normalize(n
          + aW.x*(rotZ(n,-uLimb.x)-n) + aW.y*(rotZ(n,-uLimb.y)-n) + aW.z*(rotZ(n,uLimb.z)-n) + aW.w*(rotZ(n,uLimb.w)-n) + aH*(headR(n)-n)); }`)
      .replace('#include <beginnormal_vertex>', '#include <beginnormal_vertex>\n        objectNormal = bendN(objectNormal);')
      .replace('#include <begin_vertex>', '#include <begin_vertex>\n        vRest = position/1.4; transformed = bendP(vRest)*1.4;');
    // features are painted from the rest-pose position, so they stay sharp at any size and move with the skin
    sh.fragmentShader = sh.fragmentShader
      .replace('#include <common>', `#include <common>
        varying vec3 vRest; uniform float uHair, uEye;
        float hash3(vec3 p){ return fract(sin(dot(p, vec3(127.1,311.7,74.7)))*43758.5453); }
        float band(float d, float w){ return 1.0 - smoothstep(w*0.5, w, abs(d)); }`)
      .replace('#include <color_fragment>', `#include <color_fragment>
        float hairM = 0.0;
        {
          vec3 b = vRest; float az = abs(b.z);
          vec3 hairC = vec3(0.16,0.10,0.075);
          // hair: crown and back of the head down to a hairline, strands fanning from the crown, fuller with the weeks
          float hairline = mix(0.30, 0.53, smoothstep(-0.2, 0.14, b.x));
          float onHead = smoothstep(0.0, 0.025, b.y - hairline) * step(0.27, b.y);
          float grain = hash3(floor(b*420.0)), feather = hash3(floor(b*180.0) + 7.0);
          float fill = smoothstep(1.0 - uHair, 1.3 - uHair, 0.5 + 0.5*feather) * smoothstep(0.0, 0.02 + 0.03*feather, b.y - hairline);
          hairM = onHead*fill*0.93*min(1.0, uHair*1.6);
          diffuseColor.rgb = mix(diffuseColor.rgb, hairC*(0.8 + 0.45*grain), hairM);
          // eyebrows
          float by = (b.y-0.407)/0.007, bz = (az-0.07)/0.034;
          float brow = (1.0 - smoothstep(0.55, 1.0, by*by + bz*bz)) * step(0.17, b.x);
          diffuseColor.rgb = mix(diffuseColor.rgb, hairC*1.6, brow*0.6*smoothstep(0.1, 0.6, uHair));
          // eyes: a closed lash line, opening to an almond with a dark iris from week 28
          float front = smoothstep(0.205, 0.222, b.x) * step(az, 0.1) * step(0.03, az);
          float ez = az - 0.066, ey = b.y - 0.371;
          float lash = band(ey + 0.006 - 22.0*ez*ez, 0.006) * step(abs(ez), 0.027);
          float almond = ez*ez/(0.021*0.021) + ey*ey/(0.0095*0.0095);
          float openE = 1.0 - smoothstep(0.85, 1.0, almond);
          float rim = band(almond - 1.0, 0.45);
          vec3 eyeC = mix(vec3(0.36,0.24,0.22), vec3(0.06,0.035,0.03), 1.0 - smoothstep(0.006, 0.0115, length(vec2(ez, ey*1.3))));
          eyeC += vec3(0.5)*(1.0 - smoothstep(0.0, 0.0028, length(vec2(ez + 0.004, ey - 0.003))));   // catch-light
          vec3 closedC = mix(diffuseColor.rgb, vec3(0.28,0.15,0.13), lash*0.85);
          vec3 openC = mix(mix(diffuseColor.rgb, eyeC, openE), vec3(0.3,0.16,0.14), rim*0.55);
          diffuseColor.rgb = mix(diffuseColor.rgb, mix(closedC, openC, uEye), front);
          // lips, mouth line, nostrils, a touch of colour in the cheeks
          float lipz = 1.0 - smoothstep(0.024, 0.034, az);
          float lips = lipz * smoothstep(0.196, 0.206, b.x) * (1.0 - smoothstep(0.287, 0.297, b.y)) * smoothstep(0.243, 0.252, b.y);
          diffuseColor.rgb = mix(diffuseColor.rgb, vec3(0.78,0.38,0.38), lips*0.62);
          diffuseColor.rgb = mix(diffuseColor.rgb, vec3(0.45,0.2,0.19), band(b.y - 0.27, 0.0045) * (1.0 - smoothstep(0.02, 0.028, az)) * step(0.215, b.x) * 0.75);
          float nost = 1.0 - smoothstep(0.004, 0.0068, length(vec3(b.x - 0.243, b.y - 0.309, az - 0.016)));
          diffuseColor.rgb = mix(diffuseColor.rgb, vec3(0.5,0.26,0.22), nost*0.65);
          diffuseColor.rgb = mix(diffuseColor.rgb, vec3(0.95,0.55,0.52), (1.0 - smoothstep(0.0, 0.05, length(vec3(b.x-0.17, b.y-0.3, az-0.1))))*0.18);
        }`)
      .replace('#include <lights_physical_fragment>', `#include <lights_physical_fragment>
        material.sheenColor *= 1.0 - hairM; material.clearcoat *= 1.0 - hairM; material.roughness = mix(material.roughness, 0.85, hairM);   // hair is matte`);
  };
  skin.customProgramCacheKey = ()=> 'fetus-limbs-face';
  const kickS = { t:-9, next:2.5, leg:0, amp:0.4 };
  const wombLight = new THREE.PointLight(0xffa070, 2.6, 3.2); wombLight.position.set(0.35,0.3,-0.55); preg.add(wombLight);
  const heart = new THREE.Mesh(new THREE.SphereGeometry(0.035,20,14), new THREE.MeshBasicMaterial({color:0xff2a55}));
  const heartGlow = new THREE.Sprite(new THREE.SpriteMaterial({map:glowTex(), color:0xff3b66, transparent:true, depthWrite:false, blending:THREE.AdditiveBlending}));
  heartGlow.scale.setScalar(0.32); heart.add(heartGlow); heart.position.set(0.14,0.03,0.0); body.add(heart);

  // Umbilical cord, modelled on real cords: a pearly, see-through jelly (Wharton's jelly) that is itself
  // coiled like a telephone cable; inside it one wide vein runs near the middle and two narrower arteries
  // spiral around it, raising spiral ridges on the surface. It flares a little where it joins baby and placenta.
  function helix(base, phase, rad, turns){
    const fr = base.computeFrenetFrames(200,false), pts=[]; const P=V();
    for(let i=0;i<=200;i++){ const t=i/200; base.getPointAt(t,P); const a=phase+t*turns*Math.PI*2; const n=fr.normals[i], b=fr.binormals[i];
      pts.push(V(P.x+rad*(Math.cos(a)*n.x+Math.sin(a)*b.x), P.y+rad*(Math.cos(a)*n.y+Math.sin(a)*b.y), P.z+rad*(Math.cos(a)*n.z+Math.sin(a)*b.z))); }
    return new THREE.CatmullRomCurve3(pts);
  }
  const cordBase = curveOf([[-0.17,0.2,0.2],[-0.42,0.12,0.42],[-0.66,0.5,0.28],[-0.45,0.95,0.02],[-0.1,1.08,-0.15],[0.12,1.08,-0.22]]);
  const cordPath = helix(cordBase, 0, 0.022, 6);              // the whole cord coils
  const ART_TURNS = 11, ART_PH = [0, Math.PI];               // arteries wind around the vein
  const cordR = (t)=> 0.068*(1 + 0.05*Math.sin(t*13+0.5)) * (1 + 0.35*Math.exp(-t/0.025) + 0.5*Math.exp(-(1-t)/0.03));
  function cordGeo(scale){
    const SEG=200, RAD=30, fr=cordPath.computeFrenetFrames(SEG,false), pos=[], idx=[], P=V();
    for(let i=0;i<=SEG;i++){
      const t=i/SEG; cordPath.getPointAt(t,P); const n=fr.normals[i], b=fr.binormals[i], R=cordR(t)*scale;
      for(let j=0;j<=RAD;j++){
        const th=j/RAD*Math.PI*2; let bump=0;
        for(const ph of ART_PH){ const c=Math.cos(th-(ph+t*ART_TURNS*Math.PI*2)); if(c>0) bump+=0.15*Math.pow(c,3); }
        const r=R*(1+bump), cx=Math.cos(th), sx=Math.sin(th);
        pos.push(P.x+r*(cx*n.x+sx*b.x), P.y+r*(cx*n.y+sx*b.y), P.z+r*(cx*n.z+sx*b.z));
      }
    }
    for(let i=0;i<SEG;i++) for(let j=0;j<RAD;j++){ const a=i*(RAD+1)+j, c=a+RAD+1; idx.push(a,a+1,c, c,a+1,c+1); } // outward-facing
    const g=new THREE.BufferGeometry(); g.setAttribute('position', new THREE.Float32BufferAttribute(pos,3)); g.setIndex(idx); g.computeVertexNormals();
    const nm=g.attributes.normal; // close the seam
    for(let i=0;i<=SEG;i++){ const a=i*(RAD+1), z=a+RAD; const x=(nm.getX(a)+nm.getX(z))/2, y=(nm.getY(a)+nm.getY(z))/2, w=(nm.getZ(a)+nm.getZ(z))/2, l=Math.hypot(x,y,w)||1; nm.setXYZ(a,x/l,y/l,w/l); nm.setXYZ(z,x/l,y/l,w/l); }
    return g;
  }
  const cordMat = track('preg', phys({color:0xb8b6cc, emissive:0x14121e, emissiveIntensity:.25, roughness:.22, clearcoat:.8, clearcoatRoughness:.15, sheen:.4, sheenRoughness:.4, sheenColor:new THREE.Color(0xdfe4ff), opacity:.3, depthWrite:false}));
  addGlow('cord', cordMat, 'emis');
  const cord = new THREE.Mesh(cordGeo(1), cordMat); cord.userData.key='cord'; cord.renderOrder=7; preg.add(cord); pickables.push(cord);
  const cordRim = new THREE.Mesh(cordGeo(1.02), track('preg', shellMat(0x4a4870, 0xe8e6ff, .3))); cordRim.renderOrder=8; preg.add(cordRim);
  const cordVein = helix(cordPath, 0.8, 0.006, 2), cordA1 = helix(cordPath, ART_PH[0], 0.03, ART_TURNS), cordA2 = helix(cordPath, ART_PH[1], 0.03, ART_TURNS);
  const cVeinMat = new THREE.MeshStandardMaterial({color:0x9a1a36, emissive:0x40061a, emissiveIntensity:.8, roughness:.4, opacity:1});
  const cArtMat  = new THREE.MeshStandardMaterial({color:0x56559e, emissive:0x1a1a46, emissiveIntensity:.8, roughness:.4, opacity:1});
  for(const [c,m,r] of [[cordVein,cVeinMat,0.02],[cordA1,cArtMat,0.0135],[cordA2,cArtMat,0.0135]]){ const t=new THREE.Mesh(new THREE.TubeGeometry(c,400,r,10,false), m); t.renderOrder=6; preg.add(t); }
  track('preg', cVeinMat); track('preg', cArtMat);
  addFlow(cordVein,{color:0xff4d6d, n:40, dir:-1, group:'preg', size:0.055, speed:0.5});
  addFlow(cordA1,{color:0x8c92ff, n:34, group:'preg', klass:'vein', size:0.05, speed:0.5});
  addFlow(cordA2,{color:0x8c92ff, n:34, group:'preg', klass:'vein', size:0.05, speed:0.5});
  // where the cord meets the placenta, its vessels branch out across the placenta's surface
  {
    preg.updateMatrixWorld(true);
    const ray = new THREE.Raycaster(), end = cordBase.getPointAt(1), X = V(1,0,0), Zp = V(0,-Math.sin(0.35),Math.cos(0.35)), nOut = V(0,-Math.cos(0.35),-Math.sin(0.35));
    const onPlacenta = (q)=>{ const o = preg.localToWorld(q.clone().addScaledVector(nOut,0.35)), d = nOut.clone().negate().transformDirection(preg.matrixWorld);
      ray.set(o,d); const h = ray.intersectObject(placenta,false)[0]; return h ? preg.worldToLocal(h.point.clone()).addScaledVector(nOut,0.01) : null; };
    for(let k=0;k<5;k++) for(const [dA,m,col] of [[-0.07,artMat,0xff4d6d],[0.07,veinMat,0x8c92ff]]){
      const a = k*1.26 + 0.4 + dA, pts=[end.clone()];
      for(let s=1;s<=9;s++){ const d=s*0.045, w=a+0.25*Math.sin(s*1.3+k); const q=end.clone().addScaledVector(X,Math.cos(w)*d).addScaledVector(Zp,Math.sin(w)*d); const h=onPlacenta(q); if(!h) break; pts.push(h); }
      if(pts.length<4) continue;
      const c = new THREE.CatmullRomCurve3(pts), mat = m.clone(); track('preg', mat);
      preg.add(new THREE.Mesh(taperTube(c, 48, 8, (t)=>0.013*(1-0.65*t)), mat));
      addFlow(c,{color:col, n:6, group:'preg', klass: col===0x8c92ff ? 'vein' : undefined, size:0.04, speed:0.35, dir: col===0x8c92ff ? 1 : -1});
    }
  }
  // spiral arteries feeding the placenta
  for(let k=0;k<6;k++){
    const a = -1.2 + k*0.48; const x=Math.sin(a)*0.85, z=-0.62+Math.cos(a)*0.2;
    const c = curveOf([[x*1.25,1.5,z-0.25],[x*1.1,1.38,z-0.12],[x*0.95,1.28,z],[x*0.8,1.18,z+0.06]]);
    addFlow(c,{color:0xff6b85, n:6, group:'preg', size:0.05, speed:0.35});
  }

  // ---------- particles ----------
  const total = flows.reduce((s,f)=>s+f.n,0);
  const pPos = new Float32Array(total*3), pCol = new Float32Array(total*3), pSize = new Float32Array(total), pAlpha = new Float32Array(total);
  { let o=0; for(const f of flows){ f.start=o; for(let i=0;i<f.n;i++){ pCol.set([f.color.r,f.color.g,f.color.b],(o+i)*3); pSize[o+i]=f.size*(0.8+rnd()*0.5); } o+=f.n; } }
  const pg = new THREE.BufferGeometry();
  pg.setAttribute('position', new THREE.BufferAttribute(pPos,3).setUsage(THREE.DynamicDrawUsage));
  pg.setAttribute('color', new THREE.BufferAttribute(pCol,3));
  pg.setAttribute('aSize', new THREE.BufferAttribute(pSize,1));
  pg.setAttribute('aAlpha', new THREE.BufferAttribute(pAlpha,1).setUsage(THREE.DynamicDrawUsage));
  const pMat = new THREE.ShaderMaterial({
    uniforms:{uScale:{value:600}},
    vertexShader:`attribute float aSize; attribute float aAlpha; attribute vec3 color; varying vec3 vC; varying float vA; uniform float uScale;
      void main(){ vC=color; vA=aAlpha; vec4 mv=modelViewMatrix*vec4(position,1.0); gl_PointSize=aSize*uScale/max(0.1,-mv.z); gl_Position=projectionMatrix*mv; }`,
    fragmentShader:`varying vec3 vC; varying float vA; void main(){ vec2 p=gl_PointCoord-0.5; float d=length(p); float a=smoothstep(0.5,0.0,d); if(a<0.01) discard; gl_FragColor=vec4(vC*(0.7+0.9*a), a*vA); }`,
    transparent:true, depthWrite:false, blending:THREE.AdditiveBlending
  });
  pg.boundingSphere = new THREE.Sphere(new THREE.Vector3(), 6);
  const points = new THREE.Points(pg, pMat); points.frustumCulled=false; points.renderOrder=10; rig.add(points);

  await step(0.92);
  // ---------- labels ----------
  const TAGS = {
    anatomy:[['uterus','Uterus wall',null,DV(-0.74,0.12,0.03)],['lining','Lining',null,TP.lining],['tube','Fallopian tube',null,TP.tube],
             ['ovary','Ovary',null,TP.ovaryL],['cervix','Cervix',null,TP.cervix],['vagina','Vagina',null,TP.vagina],['vessels','Blood supply',null,TP.vessels]],
    cycle:[['follicle','Follicle',null,TP.ovaryR],['lining','Lining',null,TP.lining],['tube','Fallopian tube',null,TP.tube]],
    conception:[['ovary','Ovary',null,TP.ovaryR],['tube','Fallopian tube',null,TP.tube],['lining','Lining',null,TP.lining],['cervix','Cervix',null,TP.cervixSec],['vagina','Vagina',null,TP.vagina]],
    pregnancy:[['placenta','Placenta',null,V(0.2,1.3,-0.1)],['cord','Umbilical cord',null,V(-0.66,0.42,0.36)],['baby','Baby',null,V(-0.3,0.05,0.55)],['fluid','Amniotic fluid',null,V(0.82,0.6,0.32)]],
  };
  const tagEls = [];
  for(const mode of Object.keys(TAGS)) for(const [k,txt,,pos] of TAGS[mode]){
    const b=document.createElement('button'); b.type='button'; b.className='tag off'; b.textContent=txt; b.dataset.key=k; b.dataset.mode=mode;
    b.addEventListener('click', ()=> select(k)); labelsEl.appendChild(b); tagEls.push({el:b, pos, mode, key:k});
  }

  // ---------- state ----------
  let lumenKey='', openView=true, faceView=false, fv=0;
  let mode='anatomy', selected=null, day=1, week=24, weekF=24, playing=!reduced, lastInteract=performance.now();
  const fade = {anatomy:1, preg:0}; const fadeTo = {anatomy:1, preg:0};
  let yaw=-0.35, pitch=0.12, yawVel=0, turn=0, dragging=false, px=0, py=0, moved=0;

  function select(k){
    faceView = k==='baby' ? !(faceView && selected==='baby') : false;   // tap Baby: turn to the face; tap again: back
    selected = k;
    for(const t of tagEls) t.el.classList.toggle('on', t.key===k && t.mode===mode);
    if(k==='baby') showInfo('baby', babyText());
    else showInfo(k);
    lastInteract = performance.now(); kick();
  }
  // the vagina is only drawn in the opened (section) view, so its label hides with the whole organ
  const tagOff = (t, m)=> t.mode!==m || (t.key==='vagina' && m==='anatomy' && !openView);
  function setMode(m){
    mode = m; selected = null; faceView = false; lastInteract = 0; fit();
    document.querySelectorAll('.modes button').forEach(b=> b.setAttribute('aria-pressed', String(b.dataset.mode===m)));
    fadeTo.anatomy = m==='pregnancy' ? 0 : 1; fadeTo.preg = m==='pregnancy' ? 1 : 0;
    for(const t of tagEls){ t.el.classList.toggle('off', tagOff(t, m)); t.el.classList.remove('on'); }
    scrub.hidden = m==='anatomy'; cutBtn.hidden = m!=='anatomy';
    hWrap.style.display=''; hLbl.innerHTML=''; hLegend.innerHTML='';
    if(m==='cycle'){ range.min=1; range.max=28; range.step=0.1; range.value=day; range.setAttribute('aria-label','Day of cycle'); drawHormones(); updateCycleUI(); }
    if(m==='conception'){ range.min=0; range.max=1000; range.step=1; range.value=Math.round(cp*1000); range.setAttribute('aria-label','Conception timeline'); drawTimeline(); lastStage=null; updateConcUI(); }
    if(m==='pregnancy'){ range.min=12; range.max=40; range.step=1; range.value=week; range.setAttribute('aria-label','Week of pregnancy'); hormSvg.innerHTML=''; hWrap.style.display='none'; updatePregUI(); }
    if(m==='anatomy'){ infoEl.innerHTML = `<p class="label">Tap any label</p><p class="t">Inside the pelvis</p><p>Uterus, tubes, ovaries and their blood supply — the organs behind almost every visit to a gynaecologist.</p><a href="/#services">See what we treat →</a>`; }
    playBtn.textContent = playing ? 'Pause' : 'Play';
    kick();
  }
  document.querySelectorAll('.modes button').forEach(b=> b.addEventListener('click', ()=> setMode(b.dataset.mode)));
  const cutBtn = document.getElementById('cutBtn');
  cutBtn.addEventListener('click', ()=>{ openView = !openView; cutBtn.setAttribute('aria-pressed', String(openView)); cutBtn.textContent = openView ? 'Opened view' : 'Whole organ'; for(const t of tagEls) t.el.classList.toggle('off', tagOff(t, mode)); if(selected==='vagina' && !openView) setMode(mode); lastInteract = 0; kick(); });
  range.addEventListener('input', ()=>{ playing=false; playBtn.textContent='Play'; if(mode==='cycle'){ day=+range.value; updateCycleUI(); } else if(mode==='conception'){ cp=+range.value/1000; updateConcUI(); } else { week=+range.value; weekF=week; updatePregUI(); } kick(); });
  playBtn.addEventListener('click', ()=>{ playing=!playing; playBtn.textContent = playing?'Pause':'Play'; kick(); });

  // conception story UI
  let cp = 0, lastStage = null;
  function drawTimeline(){
    const marks = [[0,'Ovulate'],[0.10,'Sperm'],[0.45,'Fertilise'],[0.52,'Divide'],[0.78,'Blastocyst'],[0.82,'Implant']];
    const dot = (x, id, c, w)=> `<line ${id?`id="${id}" `:''}x1="${x}" x2="${x}" y1="23" y2="23" stroke="${c}" stroke-width="${w}" stroke-linecap="round" vector-effect="non-scaling-stroke"/>`;
    hormSvg.innerHTML = `<line x1="4" x2="276" y1="23" y2="23" stroke="rgba(255,255,255,.25)" stroke-width="1.5" vector-effect="non-scaling-stroke"/>` +
      marks.map(([p])=> dot((4+p*272).toFixed(1), '', '#FF8FB5', 7)).join('') + dot(4, 'hm', '#fff', 11);
    hLbl.innerHTML = marks.map(([p,l],i)=> `<span class="${i%2?'dn':'up'}${i===0?' first':''}" style="left:${((4+p*272)/280*100).toFixed(2)}%">${l}</span>`).join('');
  }
  function updateConcUI(){
    const s = stageAt(cp);
    document.getElementById('scrubTitle').textContent = s[1];
    document.getElementById('scrubSub').textContent = s[2];
    const hm = document.getElementById('hm'); if(hm){ const x=(4+cp*272).toFixed(1); hm.setAttribute('x1', x); hm.setAttribute('x2', x); }
    if(s!==lastStage && !selected){ lastStage = s; infoEl.innerHTML = `<p class="label">How a pregnancy begins</p><p class="t">${s[3]}</p><p>${s[4]}</p><a href="/fertility-assessment.html">Trying to conceive? →</a>`; }
  }

  // cycle model
  const E = d=> 0.15 + 0.85*Math.exp(-Math.pow((d-13)/2.6,2)) + 0.42*Math.exp(-Math.pow((d-21.5)/3.4,2));
  const Pg = d=> 0.06 + 0.94*Math.exp(-Math.pow((d-21.5)/3.6,2))*(d>14?1:0.15);
  const LH = d=> 0.05 + 0.95*Math.exp(-Math.pow((d-13.6)/0.55,2));
  function drawHormones(){
    const path = f=>{ let s=''; for(let i=0;i<=56;i++){ const d=1+i*27/56; const x=(d-1)/27*280; const y=44-f(d)*38; s+=(i?'L':'M')+x.toFixed(1)+' '+y.toFixed(1); } return s; };
    hormSvg.innerHTML = `<rect x="${(8/27*280).toFixed(1)}" y="0" width="${(6/27*280).toFixed(1)}" height="46" fill="#FF8FB5" opacity=".1"/>
      <path d="${path(LH)}" fill="none" stroke="#FFE3A0" stroke-width="1.5" stroke-dasharray="3 4" opacity=".85" vector-effect="non-scaling-stroke"/>
      <path d="${path(E)}" fill="none" stroke="#FF8FB5" stroke-width="2.2" vector-effect="non-scaling-stroke"/>
      <path d="${path(Pg)}" fill="none" stroke="#9EA4FF" stroke-width="2.2" vector-effect="non-scaling-stroke"/>
      <line id="hm" x1="0" x2="0" y1="0" y2="46" stroke="#fff" stroke-width="1.5" vector-effect="non-scaling-stroke"/>`;
    hLegend.innerHTML = '<span class="e">Oestrogen</span><span class="p">Progesterone</span><span class="l">LH surge</span><span class="f">Fertile window</span>';
  }
  function phase(d){
    if(d<6) return ['Menstrual phase','The lining sheds as your period. Normal is 2–7 days, every 21–35 days. Soaking a pad every hour, or bleeding beyond 7 days, needs a check.'];
    if(d<13.4) return ['Follicular phase','Oestrogen rises and one follicle outgrows the rest. In PMOS (PCOD) this growth often stalls mid-way — so ovulation skips and periods turn irregular.'];
    if(d<14.8) return ['Ovulation','An LH surge releases the egg, which the tube\'s fimbriae sweep inside. The fertile window is the 5 days before and the day of ovulation.'];
    return ['Luteal phase','The empty follicle becomes the corpus luteum and makes progesterone to ready the lining. No pregnancy? It fades, and a period starts about 14 days after ovulation.'];
  }
  function updateCycleUI(){
    const [ph, txt] = phase(day);
    document.getElementById('scrubTitle').textContent = 'Day ' + Math.floor(day);
    document.getElementById('scrubSub').textContent = ph + (day>=9 && day<15 ? ' · fertile window' : '');
    const hm = document.getElementById('hm'); if(hm){ const x=((day-1)/27*280).toFixed(1); hm.setAttribute('x1',x); hm.setAttribute('x2',x); }
    if(selected!=='follicle' && selected!=='tube' && selected!=='lining') infoEl.innerHTML = `<p class="label">28-day cycle · day ${Math.floor(day)}</p><p class="t">${ph}</p><p>${txt}</p><a href="/pcos-treatment-hyderabad.html">Irregular cycles? PMOS (PCOD) care →</a>`;
  }
  // pregnancy model
  const WT = [[12,14],[16,100],[20,300],[24,600],[28,1000],[32,1700],[36,2600],[40,3100]];
  const weight = w=>{ for(let i=0;i<WT.length-1;i++){ const [a,x]=WT[i],[b,y]=WT[i+1]; if(w>=a&&w<=b) return x+(y-x)*(w-a)/(b-a); } return 3100; };
  const MILES = [
    [14,'First scan & screening','Nuchal translucency (NT) scan and first-trimester screening, 11–13⁺⁶ weeks.'],
    [18,'Second trimester','Iron and calcium start; energy usually returns.'],
    [23,'The anomaly scan','Anomaly scan (TIFFA), 18–22 weeks — the detailed check of baby\'s organs and the placenta\'s position.'],
    [29,'Sugar test & movements','Glucose test (OGTT) at 24–28 weeks for gestational diabetes. Start noticing baby\'s daily pattern of movements.'],
    [35,'Growth, Doppler & Tdap','Growth and Doppler scans when advised. Tdap vaccine between 27 and 36 weeks protects your newborn from whooping cough.'],
    [37,'Baby turns head-down','Most babies settle head-down now. Time to plan the birth and your hospital bag.'],
    [99,'Ready for birth','Full term. Come in for regular pains, leaking water, bleeding — or fewer movements than usual.'],
  ];
  const mile = w=> MILES.find(m=> w<m[0]);
  const milestone = w=> mile(w)[2];
  function babyText(){ const g=weight(week); return `Week ${week}: about ${g>=1000?(g/1000).toFixed(1)+' kg':Math.round(g/10)*10+' g'}. Heartbeat around 140 a minute — normal is 110 to 160. ${week>=28 ? 'Eyes open from about 28 weeks.' : 'Eyes stay closed until about 28 weeks.'}${faceView ? ' Tap “Baby” again to zoom out.' : ''}`; }
  function updatePregUI(){
    document.getElementById('scrubTitle').textContent = 'Week ' + week;
    document.getElementById('scrubSub').textContent = (week<14?'First':week<28?'Second':'Third') + ' trimester';
    if(selected==='baby') showInfo('baby', babyText());
    else if(!selected) infoEl.innerHTML = `<p class="label">Week ${week} · this week's check</p><p class="t">${mile(week)[1]}</p><p>${milestone(week)}</p><a href="/pregnancy-care-hyderabad.html">Antenatal care →</a>`;
  }

  // ---------- interaction ----------
  canvas.addEventListener('pointerdown', e=>{ dragging=true; moved=0; px=e.clientX; py=e.clientY; canvas.setPointerCapture(e.pointerId); lastInteract=performance.now(); kick(); });
  canvas.addEventListener('pointermove', e=>{
    if(!dragging){ hover(e); return; }
    const dx=e.clientX-px, dy=e.clientY-py; px=e.clientX; py=e.clientY; moved+=Math.abs(dx)+Math.abs(dy);
    if(moved>6) faceView=false; yaw += dx*0.008; pitch = Math.max(-0.5, Math.min(0.6, pitch + dy*0.005)); yawVel = dx*0.008*60*0.5 + yawVel*0.5; lastInteract=performance.now();
  });
  const endDrag = e=>{ if(!dragging) return; dragging=false; if(moved<6) pick(e); };
  canvas.addEventListener('pointerup', endDrag); canvas.addEventListener('pointercancel', ()=>{ dragging=false; });
  canvas.addEventListener('keydown', e=>{ if(e.key==='ArrowLeft'){ turn-=0.4; e.preventDefault(); } if(e.key==='ArrowRight'){ turn+=0.4; e.preventDefault(); } lastInteract=performance.now(); kick(); });
  const ray = new THREE.Raycaster(), ndc = new THREE.Vector2();
  function hit(e){
    const r=canvas.getBoundingClientRect(); ndc.set(((e.clientX-r.left)/r.width)*2-1, -((e.clientY-r.top)/r.height)*2+1);
    ray.setFromCamera(ndc, camera);
    const vis = pickables.filter(m=> m.parent.visible && ((mode==='pregnancy') ? m.parent===preg || m.parent===fetus : m.parent===anatomy || m.parent.parent===anatomy));
    const hs = ray.intersectObjects(vis, false);
    const h = hs.find(x=> !(x.object.material instanceof THREE.ShaderMaterial)) || hs[0];
    return h ? h.object.userData.key : null;
  }
  let hoverT=0; function hover(e){ const n=performance.now(); if(n-hoverT<60) return; hoverT=n; canvas.style.cursor = hit(e) ? 'pointer' : 'grab'; }
  function pick(e){ const k=hit(e); if(k){ select(mode==='cycle' && k==='ovary' ? 'follicle' : k); } }

  // ---------- size ----------
  let FIT_R = 2.3, narrow = false;
  // where the camera aims, per mode: below the model's centre so it clears the info panel at the bottom
  const aimY = ()=>{ const sec = mode==='cycle' || mode==='conception';
    if(narrow) return mode==='pregnancy' ? 0.35 : sec ? 0.1 : -0.25;     // scrubber sits on top of the view
    return mode==='pregnancy' ? -0.35 : sec ? -1.05 : -0.5; };            // panels sit along the bottom
  function fit(){
    const half = Math.tan(THREE.MathUtils.degToRad(camera.fov)/2);
    const R = (!narrow && (mode==='cycle' || mode==='conception')) ? 2.75 : FIT_R;   // the section needs the vagina in frame
    const dist = Math.max(R/half, R/(half*camera.aspect)) * 1.04;
    camera.position.set(0, target.y + dist*0.12, dist); camera.lookAt(target); camBase.copy(camera.position);
  }
  const camBase = new THREE.Vector3(), faceT = new THREE.Vector3(), faceP = new THREE.Vector3(), lookT = new THREE.Vector3(), fDir = new THREE.Vector3(), headUp = new THREE.Vector3(), camR = new THREE.Vector3(), camUp = new THREE.Vector3();
  new ResizeObserver(()=>{
    const w=canvas.clientWidth, h=canvas.clientHeight; if(!w||!h) return;   // canvas is shorter than the stage on narrow screens
    renderer.setSize(w,h,false); camera.aspect=w/h; camera.updateProjectionMatrix();
    composer.setPixelRatio(Math.min(devicePixelRatio, w<700 ? 1.5 : 2)); composer.setSize(w,h);
    // narrow stages put the UI on top and bottom, so the model sits a touch lower and smaller
    narrow = matchMedia('(max-width: 1000px)').matches;   // same breakpoint as the stacked CSS layout FIT_R = narrow ? 2.7 : 2.3; target.y = aimY(); fit();
    pMat.uniforms.uScale.value = renderer.getDrawingBufferSize(new THREE.Vector2()).y / (2*Math.tan(THREE.MathUtils.degToRad(camera.fov)/2));
    kick();
  }).observe(stage);

  // ---------- full screen ----------
  // Native Fullscreen API where the browser allows it on an element (desktop, Android, iPad);
  // iPhone Safari does not, so there the stage becomes a fixed overlay over the page. Esc or Close exits either way.
  const fsBtn = document.getElementById('fsBtn');
  const fsEl = ()=> document.fullscreenElement || document.webkitFullscreenElement || null;
  const canNative = !!(stage.requestFullscreen || stage.webkitRequestFullscreen) && (document.fullscreenEnabled ?? document.webkitFullscreenEnabled ?? false);
  function setFull(on){
    stage.classList.toggle('is-full', on); document.documentElement.classList.toggle('fs-lock', on);
    fsBtn.setAttribute('aria-pressed', String(on));
    fsBtn.setAttribute('aria-label', on ? 'Close full screen' : 'View the 3D model full screen');
    fsBtn.title = on ? 'Close full screen (Esc)' : 'Full screen';
    fsBtn.focus({preventScroll:true}); kick();
  }
  function enterFull(){
    setFull(true);   // switch at once; never wait on the browser (some in-app browsers leave the request pending forever)
    if(canNative){ try{ const r = stage.requestFullscreen ? stage.requestFullscreen({navigationUI:'hide'}) : stage.webkitRequestFullscreen(); if(r && r.catch) r.catch(()=>{}); }catch(err){ /* the overlay alone is fine */ } }
  }
  function exitFull(){
    if(fsEl()){ const x = document.exitFullscreen || document.webkitExitFullscreen; if(x) x.call(document); }
    setFull(false);
  }
  fsBtn.addEventListener('click', ()=> stage.classList.contains('is-full') ? exitFull() : enterFull());
  for(const ev of ['fullscreenchange','webkitfullscreenchange'])     // browser Esc / back gesture leaves native full screen
    document.addEventListener(ev, ()=>{ if(!fsEl() && stage.classList.contains('is-full')) setFull(false); });
  document.addEventListener('keydown', e=>{ if(e.key==='Escape' && stage.classList.contains('is-full') && !fsEl()) exitFull(); });

  // ---------- loop ----------
  let onScreen=true, lost=false, raf=0, prev=performance.now(), clock=0, artS=0, veinS=0;
  new IntersectionObserver(([e])=>{ onScreen=e.isIntersecting; if(onScreen) kick(); }, {threshold:0.02}).observe(stage);
  document.addEventListener('visibilitychange', ()=>{ if(!document.hidden) kick(); });
  canvas.addEventListener('webglcontextlost', e=>{ e.preventDefault(); lost=true; cancelAnimationFrame(raf); raf=0; canvas.style.display='none'; labelsEl.style.display='none'; stage.classList.remove('is-live'); console.warn('WebGL context lost — static illustration restored'); });
  const busy = ()=> dragging || ((mode==='cycle'||mode==='conception') && Math.abs(Math.atan2(Math.sin(yaw),Math.cos(yaw))+0.12)>0.003) || Math.abs(yawVel)>0.002 || Math.abs(turn)>0.002 || Math.abs(fade.anatomy-fadeTo.anatomy)>0.002 || Math.abs(target.y-aimY())>0.002;
  function kick(){ if(!raf && !lost) { prev=performance.now(); raf=requestAnimationFrame(frame); } }
  const tmp=V(), center=V(), tmpW=V();

  function applyFade(dt){
    for(const g of ['anatomy','preg']){
      const k = 1-Math.pow(0.002, dt); fade[g] += (fadeTo[g]-fade[g])*k; if(Math.abs(fadeTo[g]-fade[g])<0.003) fade[g]=fadeTo[g];
      for(const m of fadeMats[g]){ if(m.uniforms) m.uniforms.uOpacity.value = m.userData.base*fade[g]; else m.opacity = m.userData.base*fade[g]; }
    }
    anatomy.visible = fade.anatomy>0.001; preg.visible = fade.preg>0.001;
    anatomy.scale.setScalar(0.9+0.1*fade.anatomy);
  }

  function frame(now){
    raf=0;
    const dt = Math.max(0, Math.min((now-prev)/1000, 0.05)); prev=now;  // rAF stamps can precede the kick time
    const animate = !reduced;
    if(animate) clock += dt;

    // rotation
    if(!dragging){
      yaw += yawVel*dt; yawVel *= Math.pow(0.03, dt);
      const step = turn*(1-Math.pow(0.0008, dt)); yaw += step; turn -= step;
      const secMode = mode==='cycle' || mode==='conception';
      if(secMode && now-lastInteract>1200){   // the cut face must face the viewer
        yaw = Math.atan2(Math.sin(yaw), Math.cos(yaw)); yaw += (-0.12 - yaw)*(1-Math.pow(0.03, dt)); pitch += (0.08 - pitch)*(1-Math.pow(0.03, dt));
      } else if(faceView && mode==='pregnancy'){
        fDir.set(1,0,0).applyQuaternion(body.quaternion).applyQuaternion(fetus.quaternion).applyQuaternion(preg.quaternion);
        const want = Math.atan2(-fDir.x, fDir.z) + 0.35; let dY = want - yaw; dY = Math.atan2(Math.sin(dY), Math.cos(dY));
        yaw += dY*(reduced ? 1 : 1-Math.pow(0.03, dt)); pitch += (0.04 - pitch)*(reduced ? 1 : 1-Math.pow(0.03, dt));
      } else if(!secMode && animate && now-lastInteract>2500) yaw += 0.16*dt;
    }
    rig.rotation.y = yaw; rig.rotation.x = pitch*0.6;
    applyFade(dt);
    const sec = mode==='cycle' || mode==='conception';
    const opened = sec || (mode==='anatomy' && openView);
    sectionG.visible = opened; wholeG.visible = !opened; tubeOpenG.visible = opened; tubeClosedG.visible = !opened;
    const ty = aimY(); if(Math.abs(target.y-ty)>0.001){ target.y += (ty-target.y)*(1-Math.pow(0.004, dt)); fit(); }
    const fvWant = faceView && mode==='pregnancy' ? 1 : 0, fvWas = fv;
    fv = reduced ? fvWant : fv + (fvWant - fv)*(1-Math.pow(0.015, dt)); if(Math.abs(fv-fvWant)<0.002) fv = fvWant;
    if(fv>0){
      rig.updateMatrixWorld(true);
      body.localToWorld(faceT.set(0.12, 0.33, 0)); const sc = body.getWorldScale(faceP).x;
      faceP.set(faceT.x, faceT.y + 0.05*sc, faceT.z + 1.75*sc);
      camera.up.set(0,1,0); camera.position.lerpVectors(camBase, faceP, fv); lookT.lerpVectors(target, faceT, fv); camera.lookAt(lookT); camera.updateMatrixWorld();
      headUp.set(0,1,0).transformDirection(body.matrixWorld); camR.setFromMatrixColumn(camera.matrixWorld, 0); camUp.setFromMatrixColumn(camera.matrixWorld, 1);
      camera.rotateZ(fv * Math.atan2(headUp.dot(camR), headUp.dot(camUp)));
      camera.updateMatrixWorld();
      for(const m of [sac.material, pShell.material]) m.uniforms.uOpacity.value = m.userData.base*fade.preg*(1-0.92*fv);   // see the face, not the sac wall
      wombLight.intensity = 2.6*(1-0.45*fv);
      bloom.strength = 0.5*(1-0.8*fv); renderer.toneMappingExposure = 0.92*(1-0.22*fv);   // keep the face from washing out
    } else if(fvWas>0){ camera.up.set(0,1,0); camera.position.copy(camBase); camera.lookAt(target); wombLight.intensity = 2.6; bloom.strength = 0.5; renderer.toneMappingExposure = 0.92; }

    // heartbeat-driven pulsatile flow
    const beat = Math.pow(Math.max(0, Math.sin(clock*Math.PI*2*1.15)), 3);
    if(animate){ artS += dt*(0.6+0.9*beat); veinS += dt*0.7; }

    // cycle
    if(mode==='cycle'){
      if(playing && animate){ day += dt*1.4; if(day>=29) day=1; range.value=day; updateCycleUI(); }
      const d=day;
      const th = d<6 ? 0.75-0.5*(d-1)/5 : d<14 ? 0.25+0.45*(d-6)/8 : 0.7+0.3*Math.min(1,(d-14)/9);
      setLumen(Math.max(0.12, 0.82-0.62*th), Math.max(0.5, 0.95-0.25*th)); lumenKey='cycle'; glowLight.intensity = d<6 ? 2.2 : 0.8+1.4*th;
      lining.material.emissiveIntensity = d<6 ? 1.8 : 1;
      const fs = d<7 ? 0.1+0.03*(d-1)/6 : d<13.6 ? 0.13+0.17*(d-7)/6.6 : d<14.2 ? 0.3*(1-(d-13.6)/0.6) : 0.001;
      domFol.scale.setScalar(Math.max(0.001, fs));
      const cs = d<14.2 ? 0.001 : d<21 ? 0.08+0.14*(d-14.2)/6.8 : 0.22-0.15*(d-21)/7;
      corpus.scale.setScalar(Math.max(0.001, cs));
      flash.intensity = d>13.5 && d<14.6 ? 6*Math.sin((d-13.5)/1.1*Math.PI) : 0;
      domFol.getWorldPosition(flash.position);
      if(d>=14 && d<19){ egg.visible=true; const u=Math.min(1,(d-14)/4); tubeCurves[1].getPointAt(1-u, tmp); egg.position.copy(tmp); egg.scale.setScalar(d>18?1-(d-18):1); }
      else egg.visible=false;
      hideConception();
    } else if(mode==='conception'){
      if(playing && animate){ cp += dt/30; if(cp>=1) cp=0; range.value=Math.round(cp*1000); updateConcUI(); }
      if(lumenKey!=='conc'){ setLumen(0.32, 0.8); lumenKey='conc'; }
      lining.material.emissiveIntensity=1; glowLight.intensity=1.6; corpus.scale.setScalar(0.001); egg.visible=false;
      updateConception(cp, clock);
    } else {
      if(lumenKey!=='rest'){ setLumen(0.55,0.9); lumenKey='rest'; }
      glowLight.intensity=1.2; domFol.scale.setScalar(0.001); corpus.scale.setScalar(0.001); egg.visible=false; flash.intensity=0;
      if(mode==='anatomy'){ domFol.scale.setScalar(0.18); }
      hideConception();
    }
    // pregnancy growth (auto-advances a week every ~1.4s until the visitor takes the slider)
    if(mode==='pregnancy' && playing && animate){ weekF += dt*0.7; if(weekF>=41) weekF=12; const w=Math.floor(weekF); if(w!==week){ week=w; range.value=week; updatePregUI(); } }
    const gw = (week-12)/28;
    const targetS = 0.86 + 0.44*gw;
    preg.scale.setScalar(targetS * (0.85+0.15*fade.preg));
    fetus.scale.setScalar(0.42 + 0.58*Math.pow(gw,0.8));
    hairU.value += (Math.min(1, Math.max(0, (week-20)/16)) - hairU.value)*0.08; eyeU.value += ((week>=28 ? 1 : 0) - eyeU.value)*0.08;
    // the baby is never still: floats and turns slowly in the fluid, kicks every few seconds, moves its hands by the face
    if(mode==='pregnancy' && animate){
      if(clock > kickS.next){ const r=Math.random(); kickS.t=clock; kickS.next=clock+2.2+Math.random()*4; kickS.leg = r<0.4?0 : r<0.8?1 : 2; kickS.amp=0.16+0.1*Math.random(); }
      const kt = clock-kickS.t, sm = x=> x*x*(3-2*x);
      const env = kt<0 ? 0 : kt<0.18 ? 1-Math.pow(1-kt/0.18,3) : kt<0.3 ? 1 : kt<1.2 ? 1-sm((kt-0.3)/0.9) : 0;
      limbU.value.set(kickS.leg!==1 ? env*kickS.amp : 0, kickS.leg!==0 ? env*kickS.amp*0.9 : 0,
        0.24*Math.sin(clock*0.8)+0.08*Math.sin(clock*1.9), 0.2*Math.sin(clock*0.65+1.2)+0.07*Math.sin(clock*1.7));
      headU.value.set(0.07*Math.sin(clock*0.45) - 0.05*env, 0.16*Math.sin(clock*0.3) + 0.05*Math.sin(clock*0.83));
      fetus.position.y = 0.02 + 0.015*Math.sin(clock*0.5);
      fetus.rotation.set(0.035*Math.sin(clock*0.33) + 0.05*env, 0.65 + 0.07*Math.sin(clock*0.21), 0.03*Math.sin(clock*0.27));
      body.rotation.z = Math.PI - 0.035*env;   // a small jolt of the whole body with each kick
    } else if(limbU.value.lengthSq()>0 || headU.value.lengthSq()>0){ limbU.value.set(0,0,0,0); headU.value.set(0,0); fetus.position.y=0.02; fetus.rotation.set(0,0.65,0); body.rotation.z=Math.PI; }
    const hb = Math.pow(Math.max(0, Math.sin(clock*Math.PI*2*2.33)), 6);
    heart.scale.setScalar(0.8+0.6*hb); heartGlow.material.opacity = (0.5+0.5*hb)*(1-0.9*fv);   // dimmed when looking at the face

    // glow highlight on selected
    for(const [kk, list] of Object.entries(glowables)){
      const on = kk===selected ? (0.5+0.5*Math.sin(clock*4))*(kk==='baby' ? 1-fv : 1) : 0;   // no pulse while looking at the face
      for(const {mat,kind} of list){ if(kind==='shell') mat.uniforms.uGlow.value = on; else mat.emissiveIntensity = (mat===lining.material && mode==='cycle' ? (day<6?1.8:1) : mat.userData.ei) + on*1.4; }
    }

    // particles
    const P = pPos, A = pAlpha;
    for(const f of flows){
      const vis = f.group==='preg' ? fade.preg : f.group==='mens' ? (mode==='cycle' && day<6 ? fade.anatomy : 0) : fade.anatomy;
      const s = f.klass==='art' ? artS : veinS;
      const adv = s*f.speed/Math.max(0.3,f.len);
      for(let i=0;i<f.n;i++){
        let u = (((f.offs[i] + adv) % 1) + 1) % 1; if(f.dir<0) u = 1-u;
        const x = u*f.S, i0 = Math.floor(x), i1 = Math.min(f.S, i0+1), fr = x-i0, o=(f.start+i)*3;
        P[o]   = f.lut[i0*3]  +(f.lut[i1*3]  -f.lut[i0*3])*fr;
        P[o+1] = f.lut[i0*3+1]+(f.lut[i1*3+1]-f.lut[i0*3+1])*fr;
        P[o+2] = f.lut[i0*3+2]+(f.lut[i1*3+2]-f.lut[i0*3+2])*fr;
        if(f.group==='preg'){ tmp.set(P[o],P[o+1],P[o+2]).multiplyScalar(preg.scale.x); P[o]=tmp.x; P[o+1]=tmp.y; P[o+2]=tmp.z; }
        else { const sc=anatomy.scale.x; P[o]*=sc; P[o+1]*=sc; P[o+2]*=sc; }
        A[f.start+i] = vis * Math.min(1, Math.min(u,1-u)*12);
      }
    }
    pg.attributes.position.needsUpdate = true; pg.attributes.aAlpha.needsUpdate = true;

    composer.render();
    // magnified close-up of the egg / embryo, drawn into the lens box
    const showLens = mode==='conception' && concG.visible && ovum.visible && fade.anatomy>0.9;
    lensEl.classList.toggle('on', showLens);
    if(showLens && !narrow){ const b = stage.clientHeight - infoEl.offsetTop + 14; if(lensEl._b!==b){ lensEl.style.bottom = b+'px'; lensEl._b=b; } } else if(narrow && lensEl._b){ lensEl.style.bottom=''; lensEl._b=0; }
    if(showLens){
      const cr = canvas.getBoundingClientRect(), lr = lensEl.getBoundingClientRect();
      const lx = lr.left-cr.left, lyb = cr.bottom-lr.bottom, lw = lr.width, lh = lr.height;
      ovum.getWorldPosition(tmpW);
      closeCam.position.copy(camera.position).sub(tmpW).normalize().multiplyScalar(0.55).add(tmpW);
      closeCam.aspect = lw/lh; closeCam.updateProjectionMatrix(); closeCam.lookAt(tmpW);
      renderer.setScissorTest(true); renderer.setViewport(lx, lyb, lw, lh); renderer.setScissor(lx, lyb, lw, lh);
      const microOn = cp>0.36 && cp<0.56; heads.visible = tails.visible = false; mHeads.visible = mTails.visible = microOn;
      renderer.render(scene, closeCam);
      heads.visible = tails.visible = true; mHeads.visible = mTails.visible = false;
      renderer.setScissorTest(false); renderer.setViewport(0, 0, cr.width, cr.height);
    }
    if(!stage.classList.contains('is-live')) stage.classList.add('is-live');
    if(!stage.classList.contains('ready')){ progress(1); stage.classList.add('ready'); }

    // labels
    const r = canvas.getBoundingClientRect(); rig.updateMatrixWorld();
    rig.getWorldPosition(center); center.project(camera);
    for(const t of tagEls){
      if(t.mode!==mode){ continue; }
      const grp = t.mode==='pregnancy' ? preg : anatomy;
      tmp.copy(t.pos).applyMatrix4(grp.matrixWorld);
      const vz = tmp.clone().applyMatrix4(camera.matrixWorldInverse).z;
      tmp.project(camera);
      const tw = t.w || (t.w = t.el.offsetWidth || 100);
      const x=Math.min(Math.max((tmp.x*0.5+0.5)*r.width, 14), r.width-tw-2), y=(-tmp.y*0.5+0.5)*r.height;
      t.el.style.transform = `translate(${x.toFixed(1)}px,${y.toFixed(1)}px) translate(-12px,-50%)`;
      const behind = vz < -camera.position.length()-0.35;
      t.el.style.opacity = behind ? 0.35 : 1;
    }

    const should = onScreen && !document.hidden && !lost && (!reduced || busy());
    if(should) raf = requestAnimationFrame(frame);
  }

  // public hook for the due-date tool
  window.__hero = { setMode, setWeek(w){ week=Math.max(12,Math.min(40,Math.round(w))); weekF=week; playing=false; playBtn.textContent='Play'; range.value=week; if(mode!=='pregnancy') setMode('pregnancy'); else updatePregUI(); kick(); } };
  setMode(['anatomy','cycle','conception','pregnancy'].includes(stage.dataset.mode) ? stage.dataset.mode : 'anatomy');
  kick();
}
