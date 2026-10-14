(function(){
  var root=document.documentElement;
  root.classList.add('js');
  var reduce=matchMedia('(prefers-reduced-motion: reduce)').matches;
  function $(id){return document.getElementById(id)}
  function $$(sel,ctx){return [].slice.call((ctx||document).querySelectorAll(sel))}

  /* Real photographs, when they exist, replace the rendered light plates.
     Put files in images/ and list them here, e.g. hero:'images/hero.jpg'. */
  var PHOTOS={};

  /* ---------- theme ---------- */
  var themeBtn=$('theme');
  if(themeBtn) themeBtn.addEventListener('click',function(){
    var dark=getComputedStyle(root).colorScheme.indexOf('dark')>-1;
    var next=dark?'light':'dark';
    root.setAttribute('data-site-theme',next);
    try{localStorage.setItem('genesis-theme',next)}catch(e){}
  });

  /* ---------- scroll position ----------
     A reload always starts at the top. Following a link to #section still lands on it,
     re-aligned after layout settles (the pinned section changes page height). */
  function toTop(){scrollTo({top:0,left:0,behavior:'instant'})}
  var navEntry=(performance.getEntriesByType&&performance.getEntriesByType('navigation')[0])||{};
  if(navEntry.type==='reload'||!location.hash){
    if(location.hash){try{history.replaceState(null,'',location.pathname+location.search)}catch(e){}}
    toTop();
    addEventListener('load',function(){toTop();setTimeout(toTop,60)});
  } else {
    var jump=function(){var t=document.getElementById(location.hash.slice(1));if(t)t.scrollIntoView({behavior:'instant',block:'start'})};
    addEventListener('load',function(){jump();setTimeout(jump,120)});
  }

  /* ---------- mobile menu ---------- */
  var burger=$('burger');
  function setMenu(open){
    if(!burger) return;
    document.body.classList.toggle('menu-open',open);document.body.classList.toggle('lock',open);
    burger.setAttribute('aria-expanded',open);burger.setAttribute('aria-label',open?'Close menu':'Open menu');
    $$('.mmenu a').forEach(function(a,i){a.style.transitionDelay=open?(150+i*50)+'ms':'0ms'});
  }
  if(burger){
    burger.addEventListener('click',function(){setMenu(!document.body.classList.contains('menu-open'))});
    $$('.mmenu a').forEach(function(a){a.addEventListener('click',function(){setMenu(false)})});
    addEventListener('keydown',function(e){if(e.key==='Escape')setMenu(false)});
  }

  /* ---------- nav hides on scroll down ---------- */
  var nav=$('nav'),lastY=scrollY;
  if(nav) addEventListener('scroll',function(){
    var y=scrollY;
    if(!document.body.classList.contains('menu-open')) nav.classList.toggle('hide',y>lastY&&y>160);
    lastY=y;
  },{passive:true});

  /* ---------- headline lines ---------- */
  $$('.lines').forEach(function(h){
    $$('.ln>span',h).forEach(function(s,i){s.style.transitionDelay=(i*120)+'ms'});
    requestAnimationFrame(function(){requestAnimationFrame(function(){h.classList.add('ready')})});
  });

  /* ---------- reveals (only below the fold at load) ---------- */
  var io=new IntersectionObserver(function(es){es.forEach(function(e){if(e.isIntersecting){e.target.classList.remove('pre');io.unobserve(e.target)}})},{rootMargin:'0px 0px -10% 0px'});
  $$('.rv,.wipe').forEach(function(el){
    if(reduce) return;
    if(el.classList.contains('first')){el.classList.add('pre');setTimeout(function(){el.classList.remove('pre')},350);return}
    if(el.getBoundingClientRect().top>innerHeight*.95){el.classList.add('pre');io.observe(el)}
  });

  /* ---------- active section in nav ---------- */
  var navLinks=$$('.links a');
  var sio=new IntersectionObserver(function(es){es.forEach(function(e){
    if(e.isIntersecting) navLinks.forEach(function(a){a.classList.toggle('on',a.getAttribute('href').split('#')[1]===e.target.id)});
  })},{rootMargin:'-50% 0px -50% 0px'});
  $$('main section[id]').forEach(function(s){sio.observe(s)});

  /* ---------- statement words light up ---------- */
  var stmt=$('stmt'),mws=[];
  if(stmt){
    stmt.innerHTML=stmt.textContent.split(/(\s+)/).map(function(w){return /^\s+$/.test(w)?w:'<span class="mw">'+w+'</span>'}).join('');
    mws=$$('.mw',stmt);
  }
  function stmtScroll(){
    if(!stmt) return;
    var r=stmt.getBoundingClientRect(),vh=innerHeight;
    var p=(vh*.85-r.top)/(r.height+vh*.3);p=Math.max(0,Math.min(1,p));
    var n=Math.round(p*mws.length);
    for(var i=0;i<mws.length;i++) mws[i].classList.toggle('lit',i<n);
  }

  /* ---------- horizontal principles ---------- */
  var hs=document.querySelector('.hs'),track=$('hsTrack'),hsProg=$('hsProg'),hsCount=$('hsCount');
  var panels=track?$$('.panel',track):[],hsOn=false,hsDist=0;
  function hsSize(){
    if(!hs) return;
    hsOn=innerWidth>900;
    if(!hsOn){hs.style.height='';track.style.transform='';return}
    hsDist=Math.max(0,track.scrollWidth-innerWidth);
    hs.style.height=(hsDist+innerHeight)+'px';
  }
  function hsScroll(){
    if(!hs||!hsOn) return;
    var r=hs.getBoundingClientRect(),p=Math.max(0,Math.min(1,-r.top/(hs.offsetHeight-innerHeight||1)));
    track.style.transform='translate3d('+(-p*hsDist)+'px,0,0)';
    hsProg.style.transform='scaleX('+p+')';
    var k=Math.min(panels.length,Math.max(1,Math.ceil(p*panels.length+.001)));
    hsCount.textContent=p<.02?'Five rules':(k+' / '+panels.length);
  }
  function onScroll(){stmtScroll();hsScroll()}
  addEventListener('scroll',onScroll,{passive:true});
  var rsT;
  addEventListener('resize',function(){clearTimeout(rsT);rsT=setTimeout(function(){hsSize();onScroll();sizePlates()},120)});

  /* ---------- light plates ---------- */
  (function(){ /* film grain overlay, generated once */
    var g=document.createElement('canvas');g.width=g.height=200;var gx=g.getContext('2d'),d=gx.createImageData(200,200);
    for(var i=0;i<d.data.length;i+=4){var v=Math.random()*255|0;d.data[i]=d.data[i+1]=d.data[i+2]=v;d.data[i+3]=36}
    gx.putImageData(d,0,0);root.style.setProperty('--grain','url('+g.toDataURL()+')');
  })();
  /* plaster texture: soft low-frequency mottling, shared by every plate */
  var plaster=(function(){
    var s=512,t=document.createElement('canvas');t.width=t.height=s;var x=t.getContext('2d');
    x.fillStyle='rgb(128,128,128)';x.fillRect(0,0,s,s);
    for(var i=0;i<140;i++){
      var r=8+Math.random()*60,v=Math.random()<.5?0:255;
      x.save();x.shadowColor='rgba('+v+','+v+','+v+','+(0.05+Math.random()*.08)+')';x.shadowBlur=r*1.6;x.shadowOffsetX=4000;
      x.beginPath();x.arc(Math.random()*s-4000,Math.random()*s,r,0,7);x.fillStyle='#000';x.fill();x.restore();
    }
    return t;
  })();
  var TONES={
    stone:{a:'#D4D1CB',b:'#BAB6AF',f:'#A8A39B',l:'252,250,245',la:.95,s:.18,tx:.55},
    fog:{a:'#C9CED2',b:'#AFB5BA',f:'#9AA1A6',l:'248,250,251',la:.92,s:.18,tx:.5},
    sand:{a:'#D1C7B8',b:'#B8AD9D',f:'#A39783',l:'255,249,238',la:.95,s:.18,tx:.55},
    graphite:{a:'#303134',b:'#202123',f:'#18191B',l:'214,208,197',la:.5,s:.3,tx:.35},
    ink:{a:'#1C1D1F',b:'#111213',f:'#0B0C0D',l:'170,168,162',la:.36,s:.35,tx:.3}
  };
  function shapes(kind,p,W,H){
    var r=[],i,j;
    if(kind==='window'){var pw=.085*W,ph=.27*H,g=.013*W,x0=W*(.2+.3*p),y0=H*.1;
      for(j=0;j<2;j++)for(i=0;i<3;i++)r.push({x:x0+i*(pw+g),y:y0+j*(ph+g),w:pw,h:ph});
      return {r:r,sk:-(.25+.35*p)};}
    if(kind==='slit'){return {r:[{x:W*(.22+.42*p),y:-.2*H,w:.04*W,h:1.5*H}],sk:-(.2+.3*p)};}
    if(kind==='blinds'){for(i=0;i<13;i++)r.push({x:W*(.08+.22*p),y:H*(.08+i*.05),w:.6*W,h:.026*H});return {r:r,sk:-(.3+.25*p)};}
    if(kind==='arch'){return {r:[{x:W*(.26+.3*p),y:.1*H,w:.24*W,h:.9*H,arch:1}],sk:-(.15+.3*p)};}
    if(kind==='arch-r'){return {r:[{x:W*(.5+.12*p),y:.08*H,w:.16*W,h:.95*H,arch:1}],sk:-(.2+.15*p)};}
    if(kind==='steps'){for(i=0;i<5;i++)r.push({x:W*(.08+.15*i+.12*p),y:H*(.62-.12*i),w:.13*W,h:H*(.12*i+.5)});return {r:r,sk:-(.18+.2*p)};}
    if(kind==='grid'){var s=.06*W,gg=.012*W,gx=W*(.22+.25*p);for(j=0;j<4;j++)for(i=0;i<4;i++)r.push({x:gx+i*(s+gg),y:H*.12+j*(s+gg),w:s,h:s});return {r:r,sk:-(.2+.3*p)};}
    return {r:[],sk:0};
  }
  function lightPass(ctx,list,m,color,blur,OFF){
    ctx.save();ctx.setTransform(m[0],m[1],m[2],m[3],m[4],m[5]);
    ctx.shadowColor=color;ctx.shadowBlur=blur;ctx.shadowOffsetX=OFF;ctx.fillStyle='#000';ctx.beginPath();
    list.forEach(function(q){
      var x=q.x-OFF;
      if(q.arch){var rr=q.w/2;ctx.moveTo(x,q.y+q.h);ctx.lineTo(x,q.y+rr);ctx.arc(x+rr,q.y+rr,rr,Math.PI,0);ctx.lineTo(x+q.w,q.y+q.h);ctx.closePath()}
      else ctx.rect(x,q.y,q.w,q.h);
    });
    ctx.fill();ctx.restore();
  }
  function render(pl){
    var c=pl.c,ctx=pl.ctx,W=c.width,H=c.height;if(!W||!H) return;
    var T=TONES[pl.tone]||TONES.stone,hz=H*.76,p=pl.p;
    ctx.setTransform(1,0,0,1,0,0);ctx.shadowColor='transparent';ctx.globalAlpha=1;ctx.globalCompositeOperation='source-over';
    var g=ctx.createLinearGradient(0,0,0,hz);g.addColorStop(0,T.a);g.addColorStop(1,T.b);ctx.fillStyle=g;ctx.fillRect(0,0,W,hz);
    var gf=ctx.createLinearGradient(0,hz,0,H);gf.addColorStop(0,T.f);gf.addColorStop(1,T.b);ctx.fillStyle=gf;ctx.fillRect(0,hz,W,H-hz);
    /* plaster mottling */
    ctx.globalCompositeOperation='soft-light';ctx.globalAlpha=T.tx;
    ctx.drawImage(plaster,pl.ox,pl.oy,256,256,0,0,W,H);
    ctx.globalCompositeOperation='source-over';ctx.globalAlpha=1;
    var S=shapes(pl.kind,p,W,H),sk=S.sk,k2=sk-1.1,m=.42,OFF=W*3+2000;
    var wallM=[1,0,sk,1,0,0],floorM=[1,0,k2,m,hz*(sk-k2),hz*(1-m)];
    var col='rgba('+T.l+','+T.la+')',core='rgba('+T.l+','+(T.la*.55)+')',bounce='rgba('+T.l+','+(T.la*.1)+')';
    ctx.save();ctx.beginPath();ctx.rect(0,0,W,hz);ctx.clip();
    lightPass(ctx,S.r,wallM,bounce,W*.08,OFF); /* faint bounce light around the patch */
    lightPass(ctx,S.r,wallM,col,W*.012,OFF);lightPass(ctx,S.r,wallM,core,W*.0025,OFF);ctx.restore();
    ctx.save();ctx.beginPath();ctx.rect(0,hz,W,H-hz);ctx.clip();
    lightPass(ctx,S.r,floorM,col,W*.02,OFF);ctx.restore();
    var ao=ctx.createLinearGradient(0,hz-H*.05,0,hz+H*.04);
    ao.addColorStop(0,'rgba(0,0,0,0)');ao.addColorStop(.55,'rgba(0,0,0,'+(T.s*.9)+')');ao.addColorStop(1,'rgba(0,0,0,0)');
    ctx.fillStyle=ao;ctx.fillRect(0,hz-H*.05,W,H*.09);
    var v=ctx.createRadialGradient(W*.5,H*.45,Math.min(W,H)*.25,W*.5,H*.5,Math.max(W,H)*.75);
    v.addColorStop(0,'rgba(0,0,0,0)');v.addColorStop(1,'rgba(0,0,0,'+T.s+')');ctx.fillStyle=v;ctx.fillRect(0,0,W,H);
  }
  var plates=$$('.plate').map(function(el){
    var c=el.querySelector('canvas');
    if(PHOTOS[el.dataset.photo]){
      var img=new Image();img.alt='';img.decoding='async';img.className='photo';
      img.onload=function(){el.classList.add('has-photo')};img.src=PHOTOS[el.dataset.photo];el.insertBefore(img,c);
    }
    return {el:el,c:c,ctx:c.getContext('2d'),kind:el.dataset.kind,tone:el.dataset.tone,live:!!el.dataset.live,h:!!el.closest('.hs-track'),
            p:-1,vis:false,seed:Math.random()*6,ox:Math.random()*256|0,oy:Math.random()*256|0};
  });
  /* phones and tablets: each scene is drawn once when it appears, at a lighter resolution,
     with no scroll-linked redraws (keeps scrolling smooth and saves battery) */
  var liteMQ=matchMedia('(max-width: 900px), (pointer: coarse)'),lite=liteMQ.matches;
  function sizePlates(){
    lite=liteMQ.matches;
    var dpr=Math.min(devicePixelRatio||1,2);
    plates.forEach(function(pl){
      var r=pl.el.getBoundingClientRect(),sc=lite?Math.min(Math.max(dpr*.5,.75),900/Math.max(1,r.width)):Math.min(dpr*.75,1800/Math.max(1,r.width));
      var w=Math.max(1,Math.round(r.width*sc)),h=Math.max(1,Math.round(r.height*sc));
      /* ignore small height-only changes, e.g. the mobile address bar showing and hiding */
      if(Math.abs(pl.c.width-w)<2&&Math.abs(pl.c.height-h)<=pl.c.height*.15) return;
      pl.c.width=w;pl.c.height=h;pl.p=-1;
    });
  }
  var pio=new IntersectionObserver(function(es){es.forEach(function(e){plates.forEach(function(x){if(x.el===e.target)x.vis=e.isIntersecting})})},{rootMargin:'120px'});
  plates.forEach(function(pl){pio.observe(pl.el)});
  sizePlates();
  function tick(now){
    requestAnimationFrame(tick);
    var t=now/1000,vh=innerHeight;
    for(var i=0;i<plates.length;i++){
      var pl=plates[i];if(!pl.vis||pl.el.classList.contains('has-photo')) continue;
      if(lite){if(pl.p<0){pl.p=.45;render(pl)}continue}
      var r=pl.el.getBoundingClientRect();
      var p=(vh-r.top)/(vh+r.height);
      if(pl.h&&hsOn) p=1-(r.left+r.width/2)/innerWidth;
      p=Math.max(0,Math.min(1,p));
      if(pl.live&&!reduce) p=p*.6+.2+Math.sin(t*.25+pl.seed)*.04;
      if(Math.abs(p-pl.p)>.0015){pl.p=p;render(pl)}
    }
  }
  if(!lite) plates.forEach(function(pl){pl.p=.5;render(pl)});
  requestAnimationFrame(tick);
  hsSize();onScroll();
  addEventListener('load',function(){hsSize();sizePlates();onScroll()});
  if(document.fonts&&document.fonts.ready) document.fonts.ready.then(function(){hsSize();onScroll()});

  /* ---------- demo window ---------- */
  var typed=$('typed');
  if(typed){
    var scen=[
      {i:'Analyse the European e-scooter market and build an investor deck',
       s:[['Clarifying the goal','audience: investors'],['Researching the market','48 sources'],['Building the model','3 scenarios'],['Designing the deck','10 slides'],['Checking every claim','all cited']],
       r:'market-report.deck · 10 slides'},
      {i:'Move the payments module to the new API and cover it with tests',
       s:[['Reading the repository','214 files'],['Planning the change','7 files'],['Writing code','+412 / −380'],['Running tests','58 / 58'],['Writing the summary','ready for review']],
       r:'payments-v2 · ready for review'},
      {i:'Compare these three lease agreements and flag the risky clauses',
       s:[['Reading documents','3 PDFs · 64 pp'],['Matching terms','31 clauses'],['Finding risks','5 found'],['Writing the brief','1 page'],['Marking items for legal','2 items']],
       r:'lease-compare.doc · 5 risks'}
    ];
    var stepsEl=$('steps'),bar=$('bar'),res=$('result'),resText=$('resText'),clock=$('clock'),scn=$('scn');
    var idx=0,clockT=0,clockI;
    var wait=function(ms){return new Promise(function(r){setTimeout(r,reduce?Math.min(ms,300):ms)})};
    var fmt=function(s){return String(Math.floor(s/60)).padStart(2,'0')+':'+String(s%60).padStart(2,'0')};
    var run=async function(){
      var sc=scen[idx];scn.textContent=(idx+1)+'/'+scen.length;
      typed.textContent='';res.classList.remove('show');bar.style.transform='scaleX(0)';
      stepsEl.innerHTML=sc.s.map(function(s){return '<li><span class="ic"></span><span>'+s[0]+'</span><span class="t">—</span></li>'}).join('');
      clockT=0;clock.textContent='00:00';
      for(var c=0;c<sc.i.length;c++){typed.textContent+=sc.i[c];await wait(20+Math.random()*28)}
      await wait(500);
      clearInterval(clockI);clockI=setInterval(function(){clockT+=3;clock.textContent=fmt(clockT)},120);
      var lis=stepsEl.children;
      for(var k=0;k<lis.length;k++){
        lis[k].classList.add('on');await wait(900+Math.random()*700);
        lis[k].classList.remove('on');lis[k].classList.add('done');
        lis[k].querySelector('.t').textContent=sc.s[k][1];
        bar.style.transform='scaleX('+((k+1)/lis.length)+')';
      }
      clearInterval(clockI);
      resText.textContent=sc.r;res.classList.add('show');
      await wait(3600);
      idx=(idx+1)%scen.length;run();
    };
    run();
  }

  /* ---------- autonomy ---------- */
  var lvl=$('lvl');
  if(lvl){
    var L=[
      ['Advisor','Takes no action on its own. Proposes a plan and waits for your decision at every step.'],
      ['Assistant','Reads and searches freely. Anything that changes your data is shown to you first.'],
      ['Operator','Works independently inside the project. Asks before acting in the outside world.'],
      ['Autopilot','Finishes the task within the limits you set. Money always needs your confirmation.']
    ];
    var M=[['ask','auto','auto','auto'],['ask','auto','auto','auto'],['ask','ask','auto','auto'],['no','ask','auto','auto'],['no','no','ask','auto'],['no','no','no','ask']];
    var lab={auto:'On its own',ask:'Asks you',no:'Blocked'};
    var chips=$$('#perm .chip'),ticks=$('ticks').children,lvlName=$('lvlName'),cur=1;
    var setLvl=function(v,anim){
      $('lvlDesc').textContent=L[v][1];
      for(var i=0;i<ticks.length;i++) ticks[i].classList.toggle('on',i==v);
      chips.forEach(function(c,i){var s=M[i][v];if(c.dataset.s!==s){c.dataset.s=s;c.textContent=lab[s]}});
      if(anim&&!reduce&&v!==cur){
        var dir=v>cur?-1:1;
        lvlName.animate([{transform:'none',opacity:1},{transform:'translateY('+(dir*60)+'%)',opacity:0}],{duration:180,easing:'ease-in'}).onfinish=function(){
          lvlName.textContent=L[v][0];
          lvlName.animate([{transform:'translateY('+(-dir*60)+'%)',opacity:0},{transform:'none',opacity:1}],{duration:500,easing:'cubic-bezier(.22,.8,.12,1)'});
        };
      } else lvlName.textContent=L[v][0];
      cur=v;
    };
    lvl.addEventListener('input',function(){setLvl(+lvl.value,true)});
    [].forEach.call(ticks,function(b,i){b.addEventListener('click',function(){lvl.value=i;setLvl(i,true)})});
    setLvl(1,false);
  }

  /* ---------- pricing ---------- */
  var bills=$$('.bill button');
  bills.forEach(function(b){b.addEventListener('click',function(){
    var y=b.dataset.b==='y';
    bills.forEach(function(x){x.setAttribute('aria-pressed',x===b)});
    $$('.pv').forEach(function(p){
      var to=+p.dataset[b.dataset.b],from=+p.textContent.replace('$',''),t0=performance.now();
      if(reduce){p.textContent='$'+to;return}
      (function step(now){var k=Math.min(1,(now-t0)/600);k=1-Math.pow(1-k,3);p.textContent='$'+Math.round(from+(to-from)*k);if(k<1)requestAnimationFrame(step)})(t0);
    });
    $('proOld').style.visibility=y?'visible':'hidden';
    $('proPer').innerHTML=y?'per month,<br>billed yearly':'per month,<br>billed monthly';
    $('proSave').textContent=y?'Save $96 a year':'Switch to yearly, save $96';
    var bf=$('billing');if(bf) bf.value=y?'yearly':'monthly';
  })});
  /* plan buttons carry the chosen plan into the waitlist form */
  $$('[data-plan]').forEach(function(a){a.addEventListener('click',function(){
    var f=$('plan'),n=$('planNote');
    if(f) f.value=a.dataset.plan;
    if(n){n.hidden=false;n.textContent='Selected plan: '+a.dataset.plan+(a.dataset.plan==='Pro'?' · first month free':'')}
    setTimeout(function(){var e=$('email');if(e)e.focus({preventScroll:true})},700);
  })});

  /* ---------- cookies ---------- */
  var ck=$('cookie');
  function showCookie(){ck.hidden=false;requestAnimationFrame(function(){requestAnimationFrame(function(){ck.classList.add('show')})})}
  if(ck){
    var ckSaved=null;try{ckSaved=localStorage.getItem('genesis-cookies')}catch(e){}
    if(!ckSaved) setTimeout(showCookie,1400);
    $$('button[data-c]',ck).forEach(function(b){b.addEventListener('click',function(){
      try{localStorage.setItem('genesis-cookies',b.dataset.c)}catch(e){}
      ck.classList.remove('show');setTimeout(function(){ck.hidden=true},700);
    })});
    $$('[data-cookie-settings]').forEach(function(b){b.addEventListener('click',showCookie)});
  }

  /* ---------- faq: one open at a time ---------- */
  var dets=$$('.faq details');
  dets.forEach(function(d){d.addEventListener('toggle',function(){if(d.open)dets.forEach(function(o){if(o!==d)o.open=false})})});

  /* ---------- contact topic from the link (#sales, #press, #careers, #support) ---------- */
  var topic=$('topic');
  if(topic&&location.hash){var want=location.hash.slice(1);[].forEach.call(topic.options,function(o){if(o.value===want)topic.value=want})}

  /* ---------- forms: sent to Netlify Forms on the live site ---------- */
  /* submissions are stored by Netlify Forms; on any other host nothing can be sent yet */
  var live=/netlify\.app$/.test(location.hostname);
  $$('form.nf').forEach(function(form){
    var msg=form.parentNode.querySelector('.form-msg');
    form.addEventListener('submit',function(e){
      e.preventDefault();
      var bad=null;
      $$('[required]',form).forEach(function(f){
        if(bad) return;
        var v=f.value.trim();
        if(!v||(f.type==='email'&&!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(v))) bad=f;
      });
      if(bad){msg.textContent=bad.type==='email'?'Enter an email like name@company.com':'Please fill in '+(bad.dataset.label||'this field')+'.';bad.focus();return}
      if(!live){msg.textContent=form.dataset.off||'Thanks. Sign-ups open soon; nothing was sent yet.';form.reset();return}
      var btn=form.querySelector('[type=submit]');btn.disabled=true;msg.textContent='Sending…';
      fetch('/',{method:'POST',headers:{'Content-Type':'application/x-www-form-urlencoded'},body:new URLSearchParams(new FormData(form)).toString()})
        .then(function(r){if(!r.ok) throw 0;msg.textContent=form.dataset.ok||'Thank you.';form.reset()})
        .catch(function(){msg.textContent='We could not send this right now. Please try again in a minute.'})
        .finally(function(){btn.disabled=false});
    });
  });

  /* ---------- copy buttons ---------- */
  $$('[data-copy]').forEach(function(b){b.addEventListener('click',function(){
    var src=$(b.dataset.copy);if(!src) return;var txt=src.innerText,old=b.textContent;
    var done=function(){b.textContent='Copied';setTimeout(function(){b.textContent=old},1600)};
    if(navigator.clipboard) navigator.clipboard.writeText(txt).then(done,function(){selectText(src)}); else selectText(src);
  })});
  function selectText(el){var r=document.createRange();r.selectNodeContents(el);var s=getSelection();s.removeAllRanges();s.addRange(r)}
})();
