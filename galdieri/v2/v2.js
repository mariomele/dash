// ══ v2 · interfaccia da applicazione: barra laterale, ricerca ⌘K, movimento, note richiuse, apertura con foto ══
// Usa i globali del template (NAVA, SEC, ORD, A, ME, M, ST, show, esc). Testi e colori vengono dai dati: niente nomi scritti qui.
(function(){
var d=document,root=d.documentElement,still=matchMedia('(prefers-reduced-motion: reduce)').matches;
var bar=d.querySelector('.bar'),r1=bar&&bar.querySelector('.r1');if(!r1||typeof NAVA==='undefined')return;
var amb=d.createElement('div');amb.id='v2amb';amb.setAttribute('aria-hidden','true');d.body.prepend(amb);
var A2={};NAVA.forEach(function(a){a[2].forEach(function(s){A2[s]=a})});
var nm=function(s){return SEC[s]?SEC[s][0]:s},cur=function(){var h=location.hash.slice(1);return A2[h]?h:ORD[0]};
var nc=A.filter(function(a){return a.id!==ME}).length;
var ic={s:'<svg viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" aria-hidden="true"><circle cx="9" cy="9" r="5.5"/><path d="M13.2 13.2 17 17"/></svg>',
 l:'<svg viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 4 6 10l6 6"/></svg>',
 r:'<svg viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="m8 4 6 6-6 6"/></svg>',
 p:'<svg viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linejoin="round" aria-hidden="true"><rect x="2.5" y="3.5" width="15" height="13" rx="2.5"/><path d="M7.5 3.5v13"/></svg>',
 m:'<svg viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" aria-hidden="true"><path d="M3 5.5h14M3 10h14M3 14.5h14"/></svg>'};
var w=M.nome.split(' '),logo=M.logoData?'<img src="'+M.logoData+'" alt="">':'',
 brand='<span>'+esc(M.logoData?(w.slice(1).join(' ')||'Intelligence'):w[0])+'<em>'+esc(M.logoData?(M.sottotitolo||''):w.slice(1).join(' '))+'</em></span>';

// ── apertura a tutto schermo: c'è solo se render.js ha trovato brand/hero.jpg ──
if(M.heroData&&!location.hash){
 var h=d.createElement('header');h.id='v2h';
 h.innerHTML='<div class="v2bg" role="img" aria-label="'+esc(M.heroAlt||M.nome)+'" style="background-image:url('+M.heroData+')"></div><div class="v2veil"></div>'+
  '<div class="v2top"><a class="sd-logo" href="#'+ORD[0]+'">'+logo+brand+'</a><a class="v2btn" href="#'+ORD[0]+'">Entra</a></div>'+
  '<div class="v2copy"><small>'+esc(M.sottotitolo||'radar concorrenti')+'</small><h1>'+esc(M.titolo||M.nome)+'</h1>'+
  '<p>'+nc+' concorrenti, '+ORD.length+' sezioni, '+((D.news&&D.news.items)||[]).length+' notizie. Stato e fonte per ogni dato.</p><a class="v2btn" href="#'+ORD[0]+'">Apri la dashboard</a></div>';
 d.body.prepend(h);
 var enter=function(){root.classList.add('v2in');scrollTo(0,0)};
 addEventListener('hashchange',enter,{once:true});
 addEventListener('scroll',function sc(){if(scrollY>=h.offsetHeight-2){removeEventListener('scroll',sc);enter()}},{passive:true});
}else root.classList.add('v2in');

// ── barra laterale e percorso ──
var side=d.createElement('aside');side.id='v2side';side.setAttribute('aria-label','Aree e sezioni');
var scrim=d.createElement('div');scrim.id='v2scrim';
var cb=d.createElement('div');cb.id='v2crumb';r1.insertBefore(cb,r1.firstChild);
var slg=d.getElementById('slg');
d.body.appendChild(scrim);d.body.appendChild(side);
var open={};
function build(){
 var id=cur(),G=A2[id];open[G[0]]=true;
 side.innerHTML='<div class="sd-top"><a class="sd-logo" href="#'+ORD[0]+'">'+logo+brand+'</a><button class="sd-tg" type="button" aria-label="Stringi o allarga la barra laterale" title="Stringi o allarga la barra ( [ )">'+ic.p+'</button></div>'+
  '<button class="sd-k" type="button">'+ic.s+'<span>Cerca o vai a…</span><kbd>⌘K</kbd></button>'+
  '<nav class="sd-n" aria-label="Sezioni"><div class="sd-h">'+NAVA.length+' aree · '+ORD.length+' sezioni</div>'+NAVA.map(function(a){
   var gi='<i class="sd-ic" aria-hidden="true">'+esc(a[3]||a[1][0])+'</i>';  // 4° campo di NAVA facoltativo = glifo dell'area
   if(a[2].length===1)return '<a class="sd-1'+(a[2][0]===id?' on" aria-current="page':'')+'" href="#'+a[2][0]+'" title="'+esc(a[1])+'">'+gi+'<span>'+esc(a[1])+'</span></a>';
   return '<div class="sd-g'+(open[a[0]]?' open':'')+(a===G?' cur':'')+'"><button type="button" data-g="'+a[0]+'" data-f="'+a[2][0]+'" title="'+esc(a[1])+'" aria-expanded="'+!!open[a[0]]+'">'+gi+'<span>'+esc(a[1])+'</span><em>'+a[2].length+'</em></button><div>'+
    a[2].map(function(s){return '<a href="#'+s+'"'+(s===id?' class="on" aria-current="page"':'')+'>'+esc(nm(s))+'</a>'}).join('')+'</div></div>'}).join('')+'</nav>'+
  '<div class="sd-f">'+nc+' concorrenti · aggiornato al '+new Date(M.aggiornato).toLocaleDateString('it-IT')+'</div>';
 var k=ORD.indexOf(id),pv=ORD[k-1],nx=ORD[k+1],L=G[2];
 cb.innerHTML='<button class="v2menu" type="button" aria-label="Apri aree e sezioni">'+ic.m+'</button><span>'+esc(G[1])+'</span><i>/</i><b>'+esc(nm(id))+'</b>'+
  (L.length>1?'<em>'+(L.indexOf(id)+1)+' / '+L.length+'</em>':'')+'<span class="c-pn">'+
  (pv?'<a href="#'+pv+'" aria-label="Sezione precedente: '+esc(nm(pv))+'">'+ic.l+'</a>':'')+(nx?'<a href="#'+nx+'" aria-label="Sezione successiva: '+esc(nm(nx))+'">'+ic.r+'</a>':'')+'</span>'+
  '<button class="c-k" type="button" aria-label="Cerca o vai a">'+ic.s+'</button>';
 if(slg)cb.appendChild(slg);
 var on=side.querySelector('a.on');if(on)on.scrollIntoView({block:'nearest'});
}
side.addEventListener('click',function(ev){var g=ev.target.closest('[data-g]');
 if(ev.target.closest('.sd-tg')){mini(!root.classList.contains('v2mini'));return}
 if(g&&root.classList.contains('v2mini')&&innerWidth>1100){location.hash=g.dataset.f;return}
 if(g){var k=g.dataset.g;open[k]=!open[k];g.parentNode.classList.toggle('open',open[k]);g.setAttribute('aria-expanded',open[k]);return}
 if(ev.target.closest('.sd-k')){pal();return}
 if(ev.target.closest('a'))root.classList.remove('v2open')});
cb.addEventListener('click',function(ev){if(ev.target.closest('.v2menu'))root.classList.toggle('v2open');else if(ev.target.closest('.c-k'))pal()});
scrim.addEventListener('click',function(){root.classList.remove('v2open')});
function mini(on){root.classList.toggle('v2mini',on);try{localStorage.setItem('v2mini',on?'1':'0')}catch(x){}setTimeout(function(){dispatchEvent(new Event('resize'))},320)}
try{if(localStorage.getItem('v2mini')==='1')root.classList.add('v2mini')}catch(x){}
build();

// ── ricerca rapida: sezioni e aziende (le aziende aprono il dossier) ──
var P=d.createElement('div');P.id='v2pal';P.hidden=true;
P.innerHTML='<div class="pl-box" role="dialog" aria-modal="true" aria-label="Cerca o vai a"><label class="pl-in">'+ic.s+'<input type="text" placeholder="Sezione o azienda…" autocomplete="off" spellcheck="false" role="combobox" aria-controls="v2pl" aria-expanded="true"><kbd>esc</kbd></label><ul id="v2pl" role="listbox"></ul><div class="pl-ft"><span><kbd>↑</kbd><kbd>↓</kbd> scegli</span><span><kbd>↵</kbd> apri</span><span><kbd>⌘K</kbd> apri e chiudi</span></div></div>';
d.body.appendChild(P);
var inp=P.querySelector('input'),ul=P.querySelector('ul'),hits=[],sel=0,back=null;
var nf=function(s){return String(s).normalize('NFD').replace(/[̀-ͯ]/g,'').toLowerCase()};
var IT=ORD.map(function(s){return{t:nm(s),s:A2[s][1],k:'Sezione',go:function(){location.hash=s}}})
 .concat(A.map(function(a){return{t:a.nome,s:a.id===ME?'la nostra azienda':'dossier',k:'Azienda',go:function(){ST.dz=a.id;if(location.hash==='#dossier')show();else location.hash='dossier'}}}));
function fill(){var q=nf(inp.value.trim());
 hits=(q?IT.filter(function(x){return nf(x.t+' '+x.s).indexOf(q)>-1}).sort(function(a,b){return(nf(b.t).indexOf(q)===0)-(nf(a.t).indexOf(q)===0)}):IT).slice(0,60);if(sel>=hits.length)sel=0;
 ul.innerHTML=hits.length?hits.map(function(x,i){return '<li role="option" id="v2p'+i+'" data-i="'+i+'"'+(i===sel?' aria-selected="true"':'')+'><span class="pl-k">'+x.k+'</span><b>'+esc(x.t)+'</b><small>'+esc(x.s)+'</small></li>'}).join(''):'<li class="pl-0">Nessuna sezione o azienda con «'+esc(inp.value.trim())+'»</li>';
 inp.setAttribute('aria-activedescendant',hits.length?'v2p'+sel:'')}
function mark(){[].forEach.call(ul.children,function(li,i){if(i===sel)li.setAttribute('aria-selected','true');else li.removeAttribute('aria-selected')});var c=ul.children[sel];if(c)c.scrollIntoView({block:'nearest'});inp.setAttribute('aria-activedescendant','v2p'+sel)}
function pal(){back=d.activeElement;P.hidden=false;inp.value='';sel=0;fill();inp.focus();root.classList.remove('v2open')}
function close(){P.hidden=true;if(back&&back.focus)back.focus()}
function pick(i){var x=hits[i];if(!x)return;P.hidden=true;root.classList.add('v2in');x.go()}
inp.addEventListener('input',function(){sel=0;fill()});
P.addEventListener('keydown',function(ev){
 if(ev.key==='ArrowDown'||ev.key==='ArrowUp'){ev.preventDefault();if(hits.length){sel=(sel+(ev.key==='ArrowDown'?1:-1)+hits.length)%hits.length;mark()}}
 else if(ev.key==='Enter'){ev.preventDefault();pick(sel)}
 else if(ev.key==='Escape'){ev.preventDefault();ev.stopPropagation();close()}
 else if(ev.key==='Tab')ev.preventDefault()});
ul.addEventListener('click',function(ev){var li=ev.target.closest('[data-i]');if(li)pick(+li.dataset.i)});
ul.addEventListener('mousemove',function(ev){var li=ev.target.closest('[data-i]');if(li&&+li.dataset.i!==sel){sel=+li.dataset.i;mark()}});
P.addEventListener('mousedown',function(ev){if(ev.target===P)close()});
addEventListener('keydown',function(ev){
 var t=ev.target,typing=t&&(t.tagName==='INPUT'||t.tagName==='TEXTAREA'||t.tagName==='SELECT'||t.isContentEditable);
 if((ev.metaKey||ev.ctrlKey)&&!ev.altKey&&ev.key&&ev.key.toLowerCase()==='k'){ev.preventDefault();P.hidden?pal():close()}
 else if(ev.key==='/'&&!typing&&P.hidden){ev.preventDefault();pal()}
 else if(ev.key==='Escape'&&root.classList.contains('v2open'))root.classList.remove('v2open');
 else if(ev.key==='['&&!typing&&!ev.metaKey&&!ev.ctrlKey&&P.hidden&&innerWidth>1100){ev.preventDefault();mini(!root.classList.contains('v2mini'))}},true);

// ── sezione aperta: occhiello «AREA · n / tot», note lunghe richiuse, movimento ──
// note tecniche (fonti, metodo, avvertenze) di ogni riquadro: richiuse in «Fonti e note», aperte a richiesta (25/11/2026)
function notes(){[].forEach.call(d.querySelectorAll('main .card'),function(c){if(c.querySelector(':scope>details.v2nt'))return;var ns=[].filter.call(c.children,function(x){return x.classList.contains('note')});if(!ns.length)return;
 var dt=d.createElement('details');dt.className='v2nt';dt.innerHTML='<summary>Fonti e note</summary>';ns.forEach(function(x){dt.appendChild(x)});c.appendChild(dt)})}
function fold(){notes();[].forEach.call(d.querySelectorAll('main .note,main .disc'),function(n){if(n.closest('details.v2nt'))return;if(n.dataset.v2f||!n.offsetParent||n.textContent.length<240)return;n.dataset.v2f=1;
 var lh=parseFloat(getComputedStyle(n).fontSize)||13;if(n.scrollHeight<lh*7.5)return;
 n.classList.add('v2fold');var b=d.createElement('button');b.type='button';b.className='v2more';b.setAttribute('aria-expanded','false');b.textContent='Leggi tutto';
 b.addEventListener('click',function(){var o=n.classList.toggle('v2un');b.setAttribute('aria-expanded',o);b.textContent=o?'Chiudi':'Leggi tutto'});
 n.parentNode.insertBefore(b,n.nextSibling)})}
function eyebrow(){var i=d.querySelector('main .sh i'),id=cur(),G=A2[id];if(i&&G){i.setAttribute('data-a',G[1]);i.setAttribute('data-t',('0'+G[2].length).slice(-2))}}
var RV='.card,.kpis,.qg,#pager a',TL='.lt,.lsc';
var ob=('IntersectionObserver' in window)?new IntersectionObserver(function(es){var k=0;es.forEach(function(x){if(!x.isIntersecting)return;ob.unobserve(x.target);var el=x.target;
 if(el.classList.contains('v2t')){el.style.setProperty('--td',Math.min(k++,10)*55+'ms');el.classList.add('in');tile(el);return}
 var sib=[].indexOf.call(el.parentNode.children,el);el.style.transitionDelay=Math.min(sib,8)*70+'ms';el.classList.add('in');
 setTimeout(function(){el.style.transitionDelay=''},1400);[].forEach.call(el.querySelectorAll('.kpi b'),count);grow(el);rows(el)})},{rootMargin:'0px 0px -6% 0px',threshold:.08}):null;
function count(b){var tn=b.firstChild;if(b.dataset.v2n||!tn||tn.nodeType!==3)return;var t=tn.nodeValue,m=/^(\D*?)(\d{1,3}(?:\.\d{3})+|\d+)(?:,(\d+))?(.*)$/.exec(t);if(!m)return;b.dataset.v2n=1;
 var dec=m[3]||'',to=parseFloat(m[2].replace(/\./g,'')+(dec?'.'+dec:'')),t0=performance.now();
 var fmt=function(v){var s=v.toFixed(dec.length),p=s.split('.');return m[1]+p[0].replace(/\B(?=(\d{3})+(?!\d))/g,m[2].indexOf('.')>-1?'.':'')+(p[1]?','+p[1]:'')+m[4]};
 (function tick(now){var k=Math.min(1,(now-t0)/1100);tn.nodeValue=fmt(to*(1-Math.pow(1-k,3)));if(k<1)requestAnimationFrame(tick);else tn.nodeValue=t})(t0)}
function grow(el){var k=0;[].forEach.call(el.querySelectorAll('i[style*="width"]'),function(b){if(b.dataset.v2g||/transform/.test(b.getAttribute('style'))||b.offsetWidth<3)return;b.dataset.v2g=1;
 b.classList.add('v2g');b.style.setProperty('--gd',Math.min(k++,24)*35+'ms');requestAnimationFrame(function(){requestAnimationFrame(function(){b.classList.add('go')})})})}
function rows(el){[].forEach.call(el.querySelectorAll('table'),function(t){if(t.dataset.v2t||!t.tBodies[0])return;t.dataset.v2t=1;[].slice.call(t.tBodies[0].rows,0,40).forEach(function(r,i){r.style.setProperty('--r',i)});t.classList.add('v2tr')})}
// sotto ogni voto delle schede un filo che si riempie; le misure si leggono prima che il numero conti
function tile(t){[].forEach.call(t.querySelectorAll('.lsl img'),function(im,i){im.style.setProperty('--k',i)});
 [].forEach.call(t.querySelectorAll('.lts>span'),function(sp){var b=sp.querySelector('b'),sm=b&&b.querySelector('small');if(!b||!sm||sp.querySelector('.v2m'))return;
  var v=parseFloat((b.firstChild.nodeValue||'').replace(',','.')),mx=parseFloat(sm.textContent.replace(/[^\d,]/g,'').replace(',','.')),f=/°/.test(b.textContent)?(mx-v+1)/mx:v/mx;
  if(!(f>=0))return;var u=d.createElement('u');u.className='v2m';u.style.color=getComputedStyle(b).color;u.innerHTML='<s style="--f:'+Math.max(.04,Math.min(1,f)).toFixed(3)+'"></s>';sp.appendChild(u)});
 [].forEach.call(t.querySelectorAll('.lts b'),count)}
// show() ridisegna tutta la sezione anche per un filtro: il movimento parte solo al cambio di sezione
var fresh=true;
function after(){eyebrow();setTimeout(fold,60);if(still||!ob||!fresh)return;fresh=false;
 var s=d.querySelector('main>section');if(!s)return;s.classList.remove('v2sec');void s.offsetWidth;s.classList.add('v2sec');
 [].forEach.call(s.querySelectorAll(RV),function(el){el.classList.add('v2rv');ob.observe(el)});
 [].forEach.call(s.querySelectorAll(TL),function(el){el.classList.add('v2t');ob.observe(el)})}
new MutationObserver(function(){clearTimeout(after.t);after.t=setTimeout(after,30)}).observe(d.getElementById('main'),{childList:true});
addEventListener('hashchange',function(){fresh=true;root.classList.remove('v2open');build()});
if(!still&&matchMedia('(pointer:fine)').matches)d.addEventListener('pointermove',function(ev){var c=ev.target.closest&&ev.target.closest('.card');if(!c)return;var r=c.getBoundingClientRect();c.style.setProperty('--mx',(ev.clientX-r.left)+'px');c.style.setProperty('--my',(ev.clientY-r.top)+'px')},{passive:true});
after();
})();

// ── percorso cliccabile: l'area apre l'elenco delle aree, la sezione (o «3 / 4») l'elenco delle sezioni dell'area ──
(function(){
var d=document,cb=d.getElementById('v2crumb');if(!cb)return;
var es=function(s){return String(s).replace(/[&<>"]/g,function(c){return{'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]})};
var sn=function(s){return SEC[s]?SEC[s][0]:s};
var dd=d.createElement('div');dd.id='v2dd';dd.hidden=true;dd.setAttribute('role','menu');d.body.appendChild(dd);
var T='#v2crumb>span:not(.c-pn):not(#slg),#v2crumb>b,#v2crumb>em',opener=null;
function mark(){[].forEach.call(cb.querySelectorAll(T),function(x){x.setAttribute('role','button');x.tabIndex=0;x.setAttribute('aria-haspopup','menu');x.title=x.tagName==='SPAN'?'Cambia area':'Altre sezioni di quest\'area'})}
new MutationObserver(mark).observe(cb,{childList:true});mark();
function id(){var h=location.hash.slice(1);return ORD.indexOf(h)>-1?h:ORD[0]}
function close(){if(dd.hidden)return;dd.hidden=true;if(opener)opener.setAttribute('aria-expanded','false')}
function openFor(t){
 var cur=id(),G=NAVA.filter(function(a){return a[2].indexOf(cur)>-1})[0];if(!G)return;
 var L=t.tagName==='SPAN'?NAVA.map(function(a){return '<a role="menuitem" href="#'+(a[2].indexOf(cur)>-1?cur:a[2][0])+'"'+(a===G?' class="on"':'')+'><span>'+es(a[1])+'</span><em>'+a[2].length+'</em></a>'})
  :G[2].map(function(s,i){return '<a role="menuitem" href="#'+s+'"'+(s===cur?' class="on"':'')+'><em>'+(i+1)+'</em><span>'+es(sn(s))+'</span></a>'});
 dd.innerHTML=L.join('');dd.hidden=false;opener=t;t.setAttribute('aria-expanded','true');
 var r=t.getBoundingClientRect();dd.style.top=(r.bottom+6)+'px';dd.style.left=Math.max(8,Math.min(r.left,innerWidth-dd.offsetWidth-8))+'px';
 var on=dd.querySelector('.on')||dd.firstChild;if(on)on.focus()}
cb.addEventListener('click',function(ev){var t=ev.target.closest(T);if(!t)return;ev.stopPropagation();if(!dd.hidden&&opener===t)close();else openFor(t)});
cb.addEventListener('keydown',function(ev){var t=ev.target.closest(T);if(t&&(ev.key==='Enter'||ev.key===' '||ev.key==='ArrowDown')){ev.preventDefault();openFor(t)}});
dd.addEventListener('keydown',function(ev){var a=[].slice.call(dd.querySelectorAll('a')),k=a.indexOf(d.activeElement);
 if(ev.key==='ArrowDown'||ev.key==='ArrowUp'){ev.preventDefault();a[(k+(ev.key==='ArrowDown'?1:-1)+a.length)%a.length].focus()}
 else if(ev.key==='Escape'){ev.preventDefault();ev.stopPropagation();close();if(opener)opener.focus()}});
dd.addEventListener('click',function(ev){if(ev.target.closest('a'))close()});
d.addEventListener('click',function(ev){if(!dd.hidden&&!dd.contains(ev.target))close()});
addEventListener('hashchange',close);addEventListener('resize',close);addEventListener('scroll',close,{passive:true});
})();
