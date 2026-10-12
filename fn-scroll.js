(()=>{
  'use strict';
  const seq=document.getElementById('fn-sequence');
  const stage=document.getElementById('fn-stage');
  const frame=document.getElementById('fn-frame');
  const grid=document.getElementById('fn-grid');
  const modules=[...document.querySelectorAll('.fn-module')];
  const slots=[...document.querySelectorAll('.fn-slot')];
  const label=document.getElementById('fn-stage-label');
  const bootState=document.getElementById('fn-boot-state');
  const uploadPct=document.getElementById('fn-upload-pct');
  const uploadTrack=document.getElementById('fn-upload-track');
  const loadStatus=document.getElementById('fn-load-status');
  const reduced=window.matchMedia('(prefers-reduced-motion: reduce)');
  const clamp=(v,min=0,max=1)=>Math.max(min,Math.min(max,v));
  const smooth=t=>t*t*(3-2*t);
  // A controlled, reversible landing with a small overshoot near the destination.
  const land=t=>1+1.7*Math.pow(t-1,3)+.7*Math.pow(t-1,2);
  // Each module gets a separate slice of scroll travel (one at a time).
  const sections=[ [.08,.26], [.29,.47], [.50,.68], [.71,.89] ];
  const phases=['IDEA','DESIGN','BUILD','ONLINE'];
  let ticking=false;
  function paint(p){
    const reveal=smooth(clamp(p/.12));
    const progresses=sections.map(([a,b])=>clamp((p-a)/(b-a)));
    const assembled=progresses.reduce((total,v)=>total+v,0)/4;
    const finished=clamp((p-.89)/.05);
    frame.style.setProperty('--frame-alpha',(.22+.78*reveal).toFixed(3));
    frame.style.setProperty('--frame-scale',(.94+.06*reveal).toFixed(3));
    frame.style.setProperty('--frame-y',((1-reveal)*15).toFixed(1)+'px');
    frame.style.setProperty('--halo',(.014+.14*finished).toFixed(3));
    frame.style.setProperty('--frame-border',(.24+.62*finished).toFixed(3));
    grid.style.setProperty('--grid-alpha',(.2+.22*reveal).toFixed(3));
    grid.style.setProperty('--grid-scale',(1.08-.08*reveal).toFixed(3));
    const w=frame.getBoundingClientRect().width;
    const h=frame.getBoundingClientRect().height;
    const entrance=[
      {x:0,y:-h*1.28,rot:-9},
      {x:w*1.16,y:0,rot:10},
      {x:0,y:h*1.20,rot:7},
      {x:-w*1.18,y:0,rot:-11}
    ];
    modules.forEach((el,i)=>{
      const t=progresses[i];
      const arrived=land(t);
      const from=entrance[i];
      const x=from.x*(1-arrived);
      const y=from.y*(1-arrived);
      const r=from.rot*(1-arrived);
      const size=.81+.19*arrived;
      const opacity=smooth(clamp(t/.19));
      el.style.transform=`translate3d(${x.toFixed(1)}px,${y.toFixed(1)}px,0) rotate(${r.toFixed(2)}deg) scale(${size.toFixed(3)})`;
      el.style.opacity=opacity.toFixed(3);
      el.style.boxShadow=t>.9?'0 0 0 1px rgba(94,230,241,.12),0 7px 30px rgba(0,0,0,.32)':'0 7px 30px rgba(0,0,0,.32)';
      slots[i].style.opacity=(.70-.56*t).toFixed(3);
    });
    const percent=Math.round(assembled*100);
    const value=String(percent).padStart(3,'0')+'%';
    seq.style.setProperty('--fn-progress-percent',(assembled*100).toFixed(2)+'%');
    uploadPct.textContent=value;
    uploadTrack.setAttribute('aria-valuenow',String(percent));
    const active=progresses.findIndex(v=>v<1);
    if(percent===100){
      label.textContent='04 / ONLINE';
      bootState.textContent='ACTIVATED';
      loadStatus.textContent='✓ SYSTEM ACTIVATED';
      loadStatus.classList.add('done');
    }else if(percent===0){
      label.textContent='00 / STANDBY';
      bootState.textContent='INITIALIZING';
      loadStatus.textContent='AWAITING INPUT';
      loadStatus.classList.remove('done');
    }else{
      label.textContent=String(active+1).padStart(2,'0')+' / '+phases[active];
      bootState.textContent='INITIALIZING';
      loadStatus.textContent='ASSEMBLING '+phases[active]+' / 04';
      loadStatus.classList.remove('done');
    }
    stage.dataset.progress=String(percent);
  }
  function scrollProgress(){
    if(reduced.matches)return 1;
    const rect=seq.getBoundingClientRect();
    const travel=Math.max(1,rect.height-window.innerHeight);
    return clamp(-rect.top/travel);
  }
  function update(){ticking=false;paint(scrollProgress());}
  function request(){if(!ticking){ticking=true;requestAnimationFrame(update);}}
  window.addEventListener('scroll',request,{passive:true});
  window.addEventListener('resize',request,{passive:true});
  reduced.addEventListener?.('change',request);
  seq.classList.add('fn-motion-ready');
  update();
  // Read-only proof instrumentation for desktop/mobile browser testing.
  window.__siteScrollAssemblyProof=()=>({scroll:scrollProgress(),upload:Number(stage.dataset.progress),parts:modules.map(el=>({opacity:Number(el.style.opacity),transform:el.style.transform}))});
})();
