const DATA_URL="data.json";

const homeView=document.getElementById("homeView");
const stationsView=document.getElementById("stationsView");
const homeStage=document.getElementById("homeStage");
const track=document.getElementById("track");

const btnHome=document.getElementById("btnHome");
const btnStations=document.getElementById("btnStations");
const backHomeBtn=document.getElementById("backHome");

const btnClear=document.getElementById("btnClear");
const btnOpenList=document.getElementById("btnOpenList");

const qInput=document.getElementById("q");
const countEl=document.getElementById("count");
const activeEl=document.getElementById("active");
const colorFiltersEl=document.getElementById("colorFilters");

const lightbox=document.getElementById("lightbox");
const lbImg=document.getElementById("lb-img");
const lbCaption=document.getElementById("lb-caption");

let allItems=[];
let activeService="ALL";
let activeColor="ALL";
let view="HOME";

function escapeHtml(str){return String(str??"").replaceAll("&","&amp;").replaceAll("<","&lt;").replaceAll(">","&gt;").replaceAll('"',"&quot;").replaceAll("'","&#039;")}
function norm(s){return String(s??"").trim()}
function upper(s){return norm(s).toUpperCase()}

function parseServices(lineField){
  const raw=norm(lineField);
  if(!raw) return [];
  return raw
    .replaceAll(",", "/")
    .replaceAll("·","/")
    .replaceAll("•","/")
    .replace(/\s+/g,"/")
    .split("/")
    .map(s=>s.trim())
    .filter(Boolean)
    .map(s=>s.toUpperCase());
}

const serviceColor={
  "1":"#c4161c","2":"#c4161c","3":"#c4161c",
  "4":"#00933c","5":"#00933c","6":"#00933c",
  "7":"#b933ad",
  "A":"#0039a6","C":"#0039a6","E":"#0039a6",
  "B":"#ff6319","D":"#ff6319","F":"#ff6319","M":"#ff6319",
  "N":"#f2c200","Q":"#f2c200","R":"#f2c200","W":"#f2c200",
  "J":"#996633","Z":"#996633",
  "L":"#a7a9ac",
  "G":"#6cbe45",
  "S":"#808183"
};

function getTagStyle(category){
  const key=norm(category).toLowerCase();
  if(!key) return {label:"UNKNOWN",className:"tag tag-neutral",style:""};
  const colorMap={red:"#c4161c",yellow:"#f2c200",blue:"#0039a6",green:"#00933c",orange:"#ff6319",purple:"#b933ad",brown:"#996633",gray:"#a7a9ac",grey:"#a7a9ac"};
  if(colorMap[key]){
    const bright=["yellow","gray","grey"].includes(key);
    return {label:key.toUpperCase(),className:"tag tag-color",style:`background:${colorMap[key]}; color:${bright?"#000":"#fff"};`};
  }
  return {label:key.toUpperCase(),className:"tag tag-neutral",style:""};
}

function refreshBackBtn(){backHomeBtn.classList.toggle("hidden",view==="HOME")}

function setView(next){
  view=next;
  const homeOn=view==="HOME";
  homeView.classList.toggle("hidden",!homeOn);
  stationsView.classList.toggle("hidden",homeOn);
  btnHome.classList.toggle("is-active",homeOn);
  btnStations.classList.toggle("is-active",!homeOn);
  btnOpenList.classList.toggle("hidden",!homeOn);
  refreshBackBtn();
  if(!homeOn) renderStations();
}

function updateColorActive(){
  const btns=Array.from(colorFiltersEl.querySelectorAll(".colorBtn"));
  btns.forEach(b=>b.classList.remove("active"));
  if(activeColor==="ALL") btns[0]?.classList.add("active");
  else btns.forEach(b=>{if(b.dataset.color===activeColor) b.classList.add("active")});
}

function updateActiveLabel(){
  const parts=[];
  parts.push(`SERVICE: ${activeService}`);
  parts.push(`COLOR: ${activeColor==="ALL"?"ALL":activeColor.toUpperCase()}`);
  const q=norm(qInput.value);
  if(q) parts.push(`SEARCH: "${q}"`);
  activeEl.textContent="Filter: "+parts.join(" • ");
}

function renderColorFilters(){
  const colors=Array.from(new Set(allItems.map(it=>norm(it.category).toLowerCase()).filter(Boolean))).sort((a,b)=>a.localeCompare(b));
  colorFiltersEl.innerHTML="";

  const allBtn=document.createElement("div");
  allBtn.className="colorBtn neutral active";
  allBtn.addEventListener("click",()=>{
    activeColor="ALL";
    updateColorActive();
    updateActiveLabel();
    if(view==="HOME") renderHomeBullets();
    else renderStations();
  });
  colorFiltersEl.appendChild(allBtn);

  colors.forEach(c=>{
    const btn=document.createElement("div");
    btn.className="colorBtn";
    btn.dataset.color=c;

    const sw=getTagStyle(c);
    if(sw.className.includes("tag-color")){
      const m=sw.style.match(/background:([^;]+)/);
      btn.style.background=m?m[1]:"";
    }else{
      btn.classList.add("neutral");
    }

    btn.addEventListener("click",()=>{
      activeColor=c;
      updateColorActive();
      updateActiveLabel();
      if(view==="HOME") renderHomeBullets();
      else renderStations();
    });

    colorFiltersEl.appendChild(btn);
  });

  updateColorActive();
}

function getFilteredItems(){
  const q=norm(qInput.value).toLowerCase();
  return allItems.filter(it=>{
    const services=parseServices(it.line);
    const passService=(activeService==="ALL")?true:services.includes(activeService);
    const cat=norm(it.category).toLowerCase();
    const passColor=(activeColor==="ALL")?true:(cat===activeColor);
    const blob=`${it.station??""} ${it.line??""} ${it.description??""} ${it.category??""} ${it.title??""}`.toLowerCase();
    const passSearch=q?blob.includes(q):true;
    return passService && passColor && passSearch;
  });
}

function renderHomeBullets(){
  homeStage.innerHTML="";
  const ripple=document.createElement("div");
  ripple.className="ripple";
  homeStage.appendChild(ripple);

  let services=[];
  if(activeColor==="ALL"){
    allItems.forEach(it=>{parseServices(it.line).forEach(s=>services.push(s))});
  }else{
    allItems.forEach(it=>{
      if(norm(it.category).toLowerCase()===activeColor){
        parseServices(it.line).forEach(s=>services.push(s));
      }
    });
  }
  services=services.filter(Boolean);

  const W=homeStage.clientWidth||window.innerWidth;
  const H=homeStage.clientHeight||500;

  const bullets=[];
  const N=260;

  for(let i=0;i<N;i++){
    const s=services.length?services[Math.floor(Math.random()*services.length)]:"";
    const bg=serviceColor[s]||"#111";
    const bright=["#f2c200","#a7a9ac","#6cbe45"].includes(bg);

    const el=document.createElement("div");
    el.className="bullet";
    el.textContent=s||"•";
    el.style.background=bg;
    el.style.color=bright?"#000":"#fff";

    const x=Math.random()*(W-60)+30;
    const y=Math.random()*(H-60)+30;
    el.style.left=`${x}px`;
    el.style.top=`${y}px`;

    if(s){
      el.addEventListener("click",()=>{
        activeService=s;
        updateActiveLabel();
        setView("STATIONS");
      });
    }

    homeStage.appendChild(el);
    bullets.push({el,s,x,y,vx:0,vy:0,ox:x,oy:y});
  }

  let mx=W/2,my=H/2;
  let inside=false;

  homeStage.addEventListener("mousemove",(e)=>{
    const r=homeStage.getBoundingClientRect();
    mx=e.clientX-r.left;
    my=e.clientY-r.top;
    ripple.style.left=`${mx}px`;
    ripple.style.top=`${my}px`;
    inside=true;
  });

  homeStage.addEventListener("mouseleave",()=>{inside=false});

  function tick(){
    const radius=150;
    const push=0.18;
    const spring=0.02;
    const damp=0.86;

    for(const b of bullets){
      b.vx+=(b.ox-b.x)*spring;
      b.vy+=(b.oy-b.y)*spring;

      if(inside){
        const dx=b.x-mx;
        const dy=b.y-my;
        const d=Math.hypot(dx,dy);
        if(d<radius && d>0.001){
          const f=(1-d/radius)*push;
          b.vx+=(dx/d)*(f*22);
          b.vy+=(dy/d)*(f*22);
        }
      }

      b.vx*=damp;
      b.vy*=damp;
      b.x+=b.vx;
      b.y+=b.vy;
      b.x=Math.max(20,Math.min(W-20,b.x));
      b.y=Math.max(20,Math.min(H-20,b.y));
      b.el.style.left=`${b.x}px`;
      b.el.style.top=`${b.y}px`;
    }
    requestAnimationFrame(tick);
  }
  requestAnimationFrame(tick);

  updateActiveLabel();
  countEl.textContent=String(getFilteredItems().length);
}

function groupByStation(items){
  const map=new Map();
  for(const it of items){
    const station=norm(it.station||"Unknown Station")||"Unknown Station";
    if(!map.has(station)) map.set(station,[]);
    map.get(station).push(it);
  }
  return Array.from(map.entries()).sort((a,b)=>a[0].localeCompare(b[0]));
}

function openLightbox(it){
  lbImg.src=it.image||"";
  const s=upper(it.station||"");
  const l=upper(it.line||"");
  const d=norm(it.description||"");
  lbCaption.textContent=`${s}${l?` · ${l}`:""}${d?` — ${d}`:""}`;
  lightbox.classList.remove("hidden");
}

function renderStations(){
  const filtered=getFilteredItems();
  countEl.textContent=String(filtered.length);

  const stations=groupByStation(filtered);
  track.innerHTML="";

  stations.forEach(([stationName,stationItems])=>{
    const stationUpper=upper(stationName);

    let repStyle="";
    for(const it of stationItems){
      const t=getTagStyle(it.category);
      if(t.className.includes("tag-color")){repStyle=t.style;break}
    }

    const panel=document.createElement("section");
    panel.className="station";

    panel.innerHTML=`
      <div class="marquee">
        <div class="marquee__inner">
          <span>${escapeHtml(stationUpper)} · ${escapeHtml(stationUpper)} · ${escapeHtml(stationUpper)} · </span>
          <span>${escapeHtml(stationUpper)} · ${escapeHtml(stationUpper)} · ${escapeHtml(stationUpper)} · </span>
        </div>
      </div>

      <div class="signage">
        <div class="left">
          <button class="badge btnNav" data-nav="prev"><span class="arrow left"></span> UPTOWN</button>
          <button class="badge btnNav" data-nav="home">EXIT</button>
          <button class="badge btnNav" data-nav="next">DOWNTOWN <span class="arrow right"></span></button>
        </div>
        <div class="right"><span>SERVICE INFORMATION</span></div>
      </div>

      <div class="station-meta">
        <div>${escapeHtml(stationUpper)}</div>
        <div class="right">
          <span>${stationItems.length} TILES</span>
          <span class="dot" style="${escapeHtml(repStyle)}"></span>
        </div>
      </div>

      <div class="tilegrid"></div>
    `;

    const grid=panel.querySelector(".tilegrid");

    stationItems.forEach(it=>{
      const tag=getTagStyle(it.category);
      const lineText=upper(it.line||"—");
      const titleText=upper(it.title||it.station||"");
      const card=document.createElement("article");
      card.className="card";
      card.innerHTML=`
        <img src="${escapeHtml(it.image||"")}" alt="${escapeHtml(titleText||stationUpper||"tile")}" loading="lazy" />
        <div class="meta">
          <div class="title">${escapeHtml(titleText||stationUpper)}</div>
          <div class="subline">${escapeHtml(lineText)}</div>
          <span class="${escapeHtml(tag.className)}" style="${escapeHtml(tag.style)}">${escapeHtml(tag.label)}</span>
        </div>
      `;
      const img=card.querySelector("img");
      img.addEventListener("click",()=>openLightbox(it));
      grid.appendChild(card);
    });

    track.appendChild(panel);

    panel.querySelectorAll(".btnNav").forEach(btn=>{
      btn.addEventListener("click",()=>{
        const type=btn.dataset.nav;
        if(type==="home"){
          activeService="ALL";
          updateActiveLabel();
          setView("HOME");
          renderHomeBullets();
          return;
        }
        const panels=[...track.querySelectorAll(".station")];
        const i=panels.indexOf(panel);
        const nextI=type==="prev"?Math.max(0,i-1):Math.min(panels.length-1,i+1);
        panels[nextI].scrollIntoView({behavior:"smooth",inline:"start",block:"nearest"});
      });
    });
  });

  updateActiveLabel();
}

btnHome.addEventListener("click",()=>{
  setView("HOME");
  renderHomeBullets();
});

btnStations.addEventListener("click",()=>{
  setView("STATIONS");
});

btnOpenList.addEventListener("click",()=>{
  setView("STATIONS");
});

backHomeBtn.addEventListener("click",()=>{
  activeService="ALL";
  updateActiveLabel();
  setView("HOME");
  renderHomeBullets();
});

btnClear.addEventListener("click",()=>{
  activeService="ALL";
  activeColor="ALL";
  qInput.value="";
  updateColorActive();
  updateActiveLabel();
  setView("HOME");
  renderHomeBullets();
});

qInput.addEventListener("input",()=>{
  updateActiveLabel();
  if(view==="STATIONS") renderStations();
  else countEl.textContent=String(getFilteredItems().length);
});

lightbox.querySelector(".lb-bg").addEventListener("click",()=>lightbox.classList.add("hidden"));
lbImg.addEventListener("click",()=>lightbox.classList.add("hidden"));
window.addEventListener("keydown",(e)=>{
  if(e.key==="Escape") lightbox.classList.add("hidden");
});

fetch(DATA_URL)
  .then(res=>{
    if(!res.ok) throw new Error(`Could not load ${DATA_URL} (HTTP ${res.status})`);
    return res.json();
  })
  .then(data=>{
    allItems=(Array.isArray(data)?data:[]).map((r,idx)=>({
      id:r.id??idx+1,
      image:r.image??"",
      category:norm(r.category),
      line:r.line??"",
      station:r.station??"",
      description:r.description??"",
      title:r.title??""
    }));
    renderColorFilters();
    renderHomeBullets();
    setView("HOME");
  })
  .catch(err=>{
    homeStage.innerHTML=`<p style="color:#b0b0b0;padding:12px">Error loading data.json. Use Live Server. (${escapeHtml(err.message)})</p>`;
  });
