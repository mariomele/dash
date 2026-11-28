// ===== Plastico 3D (three.js, incorporato da render.js): la terra in rilievo con una torre per azienda, oppure il campus.
// Legge window.P3D = {mode:'map'|'campus', vb, home, cam, items:[{id,x,y,h,f,c,me}]} preparato dalla Partita.
// Il renderer resta vivo fra un ridisegno e l'altro: cambiando lente le torri crescono o calano, cambiando scena la camera gira.
const P3={};
const p3ok=()=>{if(P3.gl!=null)return P3.gl;try{P3.gl=!!(window.THREE&&document.createElement('canvas').getContext('webgl2'))}catch(e){P3.gl=false}return P3.gl};
function p3col(c){const m=/^var\((--[\w-]+)\)$/.exec(c||'');return m?getComputedStyle(document.documentElement).getPropertyValue(m[1]).trim()||'#5b9cf0':c||'#5b9cf0'}
function p3(){
  const host=document.querySelector('.pbd .p3'),S=window.P3D;if(!host||!S||!p3ok())return;
  const T=THREE;
  if(!P3.r){
    const r=P3.r=new T.WebGLRenderer({antialias:true,alpha:true});r.setPixelRatio(Math.min(devicePixelRatio||1,2));r.shadowMap.enabled=true;r.shadowMap.type=T.PCFShadowMap;
    r.toneMapping=T.ACESFilmicToneMapping;r.toneMappingExposure=1.05;r.outputColorSpace=T.SRGBColorSpace;r.localClippingEnabled=true;
    const sc=P3.sc=new T.Scene(),cam=P3.cam=new T.PerspectiveCamera(32,1,1,2000);
    sc.add(new T.HemisphereLight(0xfff6e8,0xb8c4c8,1.25));
    const sun=P3.sun=new T.DirectionalLight(0xfff1dc,2.2);sun.position.set(-60,110,50);sun.castShadow=true;sun.shadow.mapSize.set(2048,2048);
    Object.assign(sun.shadow.camera,{left:-90,right:90,top:90,bottom:-90,near:10,far:400});sun.shadow.bias=-.0004;sun.shadow.radius=4;sc.add(sun);
    P3.ground=new T.Group();P3.tw=new T.Group();sc.add(P3.ground,P3.tw);P3.T={};
    const oc=P3.oc=new T.OrbitControls(cam,r.domElement);oc.enableDamping=true;oc.dampingFactor=.08;oc.maxPolarAngle=1.25;oc.minPolarAngle=.35;oc.minDistance=30;oc.maxDistance=320;oc.enablePan=false;
    oc.addEventListener('start',()=>{P3.user=1});
    // clic su una torre = scheda dell'azienda
    const rc=new T.Raycaster(),pt=new T.Vector2();let dn=null;
    r.domElement.addEventListener('pointerdown',e=>dn=[e.clientX,e.clientY]);
    r.domElement.addEventListener('pointerup',e=>{if(!dn||Math.hypot(e.clientX-dn[0],e.clientY-dn[1])>5)return;const b=r.domElement.getBoundingClientRect();pt.set((e.clientX-b.left)/b.width*2-1,-(e.clientY-b.top)/b.height*2+1);rc.setFromCamera(pt,cam);
      const h=rc.intersectObjects(P3.tw.children,true)[0];let o=h&&h.object;while(o&&!o.userData.id)o=o.parent;if(o){ST.foc=o.userData.id;ST.giro='0';show()}});
    r.domElement.addEventListener('pointermove',e=>{const b=r.domElement.getBoundingClientRect();pt.set((e.clientX-b.left)/b.width*2-1,-(e.clientY-b.top)/b.height*2+1);rc.setFromCamera(pt,cam);r.domElement.style.cursor=rc.intersectObjects(P3.tw.children,true).length?'pointer':'grab'});
  }
  const r=P3.r;host.appendChild(r.domElement);
  if(P3.seaM)P3.seaM.color.set(document.documentElement.dataset.tema==='scuro'?0x2b3a4a:0xbfd0d4);
  // terreno: ricostruito solo quando cambia inquadratura o modo
  const key=S.mode+(S.vb||[]).map(v=>v.toFixed(1)).join(',');
  if(P3.key!==key){P3.key=key;P3.ground.clear();P3.camGoal=null;
    const cream=new T.MeshStandardMaterial({color:0xefe8da,roughness:.9}),edge=new T.MeshStandardMaterial({color:0xd9cfbd,roughness:.95});
    if(S.mode==='map'){const[vx0,vy0,vw,vh]=S.vb,s=100/vw,cx=vx0+vw/2,cy=vy0+vh/2,X=x=>(x-cx)*s,Z=y=>(y-cy)*s,hw=50,hd=vh*s/2;P3.s=s;P3.c=[cx,cy];
      const sea=new T.Mesh(new T.RoundedBoxGeometry(hw*2+6,3,hd*2+6,4,1.2),P3.seaM=new T.MeshStandardMaterial({color:0xbfd0d4,roughness:.6}));sea.position.y=-1.6;sea.receiveShadow=true;P3.ground.add(sea);
      const clip=[new T.Plane(new T.Vector3(1,0,0),hw),new T.Plane(new T.Vector3(-1,0,0),hw),new T.Plane(new T.Vector3(0,0,1),hd),new T.Plane(new T.Vector3(0,0,-1),hd)];
      const lm=new T.MeshStandardMaterial({color:0xefe8da,roughness:.9,clippingPlanes:clip}),hm=new T.MeshStandardMaterial({color:new T.Color(p3col('var(--me)')).lerp(new T.Color(0xefe8da),.55),roughness:.9,clippingPlanes:clip}),sm=new T.MeshStandardMaterial({color:0xd6ccb8,roughness:.95,clippingPlanes:clip});
      D.world.c.forEach(c=>{c.d.split('M').filter(Boolean).forEach(seg=>{const P=seg.replace(/Z/g,'').split('L').map(q=>q.split(',').map(Number));if(P.length<3)return;
        const bx=P.map(p=>p[0]),by=P.map(p=>p[1]);if(Math.max(...bx)<vx0-vw*.1||Math.min(...bx)>vx0+vw*1.1||Math.max(...by)<vy0-vh*.1||Math.min(...by)>vy0+vh*1.1)return;
        const sh=new T.Shape(P.map(p=>new T.Vector2(X(p[0]),-Z(p[1]))));const g=new T.ExtrudeGeometry(sh,{depth:1.1,bevelEnabled:true,bevelThickness:.25,bevelSize:.18,bevelSegments:1});g.rotateX(-Math.PI/2);
        const m=new T.Mesh(g,[c.a===S.home?hm:lm,sm]);m.castShadow=m.receiveShadow=true;P3.ground.add(m)})});
      // la camera inquadra il gruppo delle sedi, non tutta la terra: torri e distanze restano in proporzione
      const xs=S.items.map(i=>X(i.x)),zs=S.items.map(i=>Z(i.y));P3.sp=Math.max(14,Math.max(...xs)-Math.min(...xs),Math.max(...zs)-Math.min(...zs));
      P3.ctr=[(Math.max(...xs)+Math.min(...xs))/2,(Math.max(...zs)+Math.min(...zs))/2];P3.camGoal={r:P3.sp*3+34,el:.88};
    }else{const n=S.items.length,cols=Math.ceil(Math.sqrt(n)),rows=Math.ceil(n/cols),sp=16,w=cols*sp+10,d=rows*sp+10;P3.s=1;
      const base=new T.Mesh(new T.RoundedBoxGeometry(w,3,d,4,1.4),cream);base.position.y=-1.5;base.receiveShadow=true;P3.ground.add(base);
      for(let i=0;i<cols;i++)for(let j=0;j<rows;j++){const t=new T.Mesh(new T.BoxGeometry(sp-2.5,.3,sp-2.5),edge);t.position.set((i-(cols-1)/2)*sp,.15,(j-(rows-1)/2)*sp);t.receiveShadow=true;P3.ground.add(t)}
      P3.camGoal={r:Math.max(110,w*2.7),el:.78};P3.sp=0;P3.ctr=[0,0]}
    P3.oc.target.set(P3.ctr[0],S.mode==='map'?P3.sp*.12:4,P3.ctr[1]);P3.user=0;
  }
  // torri: una per azienda, altezza animata verso il valore della scena
  const seen={};S.items.forEach(it=>{seen[it.id]=1;let t=P3.T[it.id];
    if(!t){t=P3.T[it.id]={g:new T.Group(),h:0};t.g.userData.id=it.id;
      const body=new T.Mesh(new T.RoundedBoxGeometry(1,1,1,3,.06),new T.MeshStandardMaterial({color:0xf3ede1,roughness:.7}));body.castShadow=body.receiveShadow=true;
      const cap=new T.Mesh(new T.RoundedBoxGeometry(1.06,.5,1.06,3,.08),new T.MeshStandardMaterial({color:0xffffff,roughness:.45}));cap.castShadow=true;
      const ring=new T.Mesh(new T.RingGeometry(.75,1,40),new T.MeshBasicMaterial({color:0xffffff,transparent:true,opacity:.55,side:T.DoubleSide}));ring.rotation.x=-Math.PI/2;ring.position.y=.12;
      t.g.add(body,cap,ring);Object.assign(t,{body,cap,ring});P3.tw.add(t.g)}
    const col=new T.Color(p3col(it.c));t.cap.material.color.copy(col);t.ring.material.color.copy(col);t.me=it.me;
    const sp=P3.sp,fw=S.mode==='map'?sp*(.035+.05*it.f):5+6*it.f;t.fw=fw;t.goal=S.mode==='map'?.6+sp*.55*Math.max(.03,it.h):3+34*Math.max(.05,it.h);
    const x=S.mode==='map'?(it.x-P3.c[0])*P3.s:it.x*16,z=S.mode==='map'?(it.y-P3.c[1])*P3.s:it.y*16;t.g.position.set(x,0,z)});
  Object.keys(P3.T).forEach(id=>{if(!seen[id]){P3.tw.remove(P3.T[id].g);delete P3.T[id]}});
  if(S.cam!=null&&!P3.user)P3.az=S.cam;
  const fit=()=>{const w=host.clientWidth||1,h=host.clientHeight||1;r.setSize(w,h,false);r.domElement.style.width='100%';r.domElement.style.height='100%';P3.cam.aspect=w/h;if(host.closest('.pcmd'))P3.cam.setViewOffset(w,h,-w*.08,-h*.1,w,h);else P3.cam.clearViewOffset();P3.cam.updateProjectionMatrix()};fit();
  if(!P3.ro){P3.ro=new ResizeObserver(()=>{const h=r.domElement.parentNode;if(h){const w=h.clientWidth,hh=h.clientHeight;r.setSize(w,hh,false);P3.cam.aspect=w/Math.max(1,hh);if(h.closest('.pcmd'))P3.cam.setViewOffset(w,hh,-w*.08,-hh*.1,w,hh);P3.cam.updateProjectionMatrix()}})}P3.ro.disconnect();P3.ro.observe(host);
  if(!P3.run){P3.run=1;P3.az0=P3.az0??.6;const v=new T.Vector3(),still=matchMedia('(prefers-reduced-motion:reduce)').matches;
    const loop=t=>{if(!r.domElement.isConnected){P3.run=0;return}requestAnimationFrame(loop);
      // camera: si avvicina dolcemente all'inquadratura della scena, finché l'utente non la prende in mano
      if(P3.camGoal&&!P3.user){const g=P3.camGoal,az=P3.az??.6;P3.az0+=(az-P3.az0)*(still?1:.025);const tg=P3.oc.target;
        P3.cam.position.lerp(v.set(tg.x+g.r*Math.sin(P3.az0)*Math.cos(g.el),tg.y+g.r*Math.sin(g.el),tg.z+g.r*Math.cos(P3.az0)*Math.cos(g.el)),still?1:.06)}
      P3.oc.update();
      const box=host.getBoundingClientRect(),put=[];
      Object.entries(P3.T).forEach(([id,o])=>{o.h+=(o.goal-o.h)*(still?1:.08);o.body.scale.set(o.fw,o.h,o.fw);o.body.position.y=o.h/2;o.cap.scale.set(o.fw,1,o.fw);o.cap.position.y=o.h+.25;
        const k=o.me?1+.25*Math.sin(t/300):1;o.ring.scale.set(o.fw*.9*k,o.fw*.9*k,1);o.ring.material.opacity=o.me?.75:.45;
        // il vessillo HTML segue la cima della torre
        const e=host.parentNode&&host.parentNode.querySelector(`.pb[data-id="${CSS.escape(id)}"]`);if(!e)return;v.set(o.g.position.x,o.h+1.2,o.g.position.z).project(P3.cam);
        put.push([e,(v.x+1)/2*box.width,(1-v.y)/2*box.height,v.z>1])});
      put.sort((a,b)=>a[2]-b[2]).forEach((p,i)=>{let y=p[2];for(let k=0;k<i;k++){const q=put[k];if(Math.abs(q[1]-p[1])<110&&Math.abs(q[4]-y)<24)y=q[4]+24}p[4]=y;
        p[0].style.left=(p[1]/box.width*100).toFixed(2)+'%';p[0].style.top=(y/box.height*100).toFixed(2)+'%';p[0].style.visibility=p[3]?'hidden':''});
      r.render(P3.sc,P3.cam)};requestAnimationFrame(loop)}
}
