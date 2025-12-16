const yearEl = document.getElementById("year");
yearEl.textContent = new Date().getFullYear();

const trackEl = document.getElementById("track");
const countEl = document.getElementById("count");
const fstatEl = document.getElementById("fstat");
const updatedEl = document.getElementById("updated");

const chips = Array.from(document.querySelectorAll(".chip"));
const qInput = document.getElementById("q");
const shuffleBtn = document.getElementById("shuffle");
const snapBtn = document.getElementById("snap");
const toStartBtn = document.getElementById("toStart");
const toEndBtn = document.getElementById("toEnd");

// Fake data for now — later we replace with Google Sheet fetch
let items = [
  { id: 1, title: "Canal St — Nameplate", category:"signage", line:"J/Z", station:"Canal St", mood:"classic", material:"tile", year:"2024", img:"https://picsum.photos/seed/nycsubway1/1200/900" },
  { id: 2, title: "Platform Edge Texture", category:"tile", line:"Q", station:"Times Sq", mood:"gritty", material:"concrete", year:"2023", img:"https://picsum.photos/seed/nycsubway2/1200/900" },
  { id: 3, title: "Car Ad Frame", category:"ad", line:"F", station:"W 4 St", mood:"glossy", material:"metal", year:"2025", img:"https://picsum.photos/seed/nycsubway3/1200/900" },
  { id: 4, title: "Rush Hour Glance", category:"people", line:"7", station:"Grand Central", mood:"busy", material:"—", year:"2024", img:"https://picsum.photos/seed/nycsubway4/1200/900" },
  { id: 5, title: "Tunnel Rumble", category:"sound", line:"A", station:"125 St", mood:"low", material:"—", year:"2022", img:"https://picsum.photos/seed/nycsubway5/1200/900" },
  { id: 6, title: "Service Change Notice", category:"signage", line:"N/W", station:"14 St", mood:"alert", material:"paper", year:"2025", img:"https://picsum.photos/seed/nycsubway6/1200/900" },
  { id: 7, title: "Mosaic Fragment", category:"tile", line:"2/3", station:"Clark St", mood:"quiet", material:"ceramic", year:"2021", img:"https://picsum.photos/seed/nycsubway7/1200/900" },
];

let activeFilter = "all";
let snapOn = true;

function escapeHtml(str){
  return String(str ?? "")
    .replaceAll("&","&amp;")
    .replaceAll("<","&lt;")
    .replaceAll(">","&gt;")
    .replaceAll('"',"&quot;")
    .replaceAll("'","&#039;");
}

function render(list){
  trackEl.innerHTML = "";

  list.forEach(it => {
    const card = document.createElement("article");
    card.className = "card";
    card.innerHTML = `
      <img class="img" src="${it.img}" alt="${escapeHtml(it.title)}" loading="lazy" />
      <div class="meta">
        <div class="title">${escapeHtml(it.title)}</div>
        <div class="sub">
          ${escapeHtml(it.station)} · ${escapeHtml(it.line)} · ${escapeHtml(it.year)}
        </div>
        <div class="pills" aria-label="Tags">
          <span class="pill">${escapeHtml(it.category)}</span>
          <span class="pill">${escapeHtml(it.mood)}</span>
          <span class="pill">${escapeHtml(it.material)}</span>
        </div>
      </div>
    `;
    trackEl.appendChild(card);
  });

  countEl.textContent = String(list.length);
  updatedEl.textContent = new Date().toLocaleDateString(undefined, { year:"numeric", month:"short", day:"2-digit" });
  fstatEl.textContent = activeFilter === "all" ? "All" : activeFilter;
}

function apply(){
  const q = (qInput.value || "").trim().toLowerCase();

  const filtered = items.filter(it => {
    const passCategory = activeFilter === "all" ? true : it.category === activeFilter;
    const blob = `${it.title} ${it.category} ${it.line} ${it.station} ${it.mood} ${it.material} ${it.year}`.toLowerCase();
    const passQuery = q === "" ? true : blob.includes(q);
    return passCategory && passQuery;
  });

  render(filtered);

  // After filter/search, jump back to start so it feels like “new ride”
  trackEl.scrollTo({ left: 0, behavior: "smooth" });
}

chips.forEach(btn => {
  btn.addEventListener("click", () => {
    chips.forEach(b => b.classList.remove("is-active"));
    btn.classList.add("is-active");
    activeFilter = btn.dataset.filter;
    apply();
  });
});

qInput.addEventListener("input", apply);

shuffleBtn.addEventListener("click", () => {
  const copy = items.slice();
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  render(copy);
  trackEl.scrollTo({ left: 0, behavior: "smooth" });
});

snapBtn.addEventListener("click", () => {
  snapOn = !snapOn;
  snapBtn.setAttribute("aria-pressed", String(snapOn));
  snapBtn.textContent = snapOn ? "Snap: On" : "Snap: Off";
  trackEl.style.scrollSnapType = snapOn ? "x mandatory" : "none";
});

toStartBtn.addEventListener("click", () => {
  trackEl.scrollTo({ left: 0, behavior: "smooth" });
});

toEndBtn.addEventListener("click", () => {
  trackEl.scrollTo({ left: trackEl.scrollWidth, behavior: "smooth" });
});

// Keyboard support on the horizontal track
trackEl.addEventListener("keydown", (e) => {
  const step = 320;
  if (e.key === "ArrowRight") { e.preventDefault(); trackEl.scrollBy({ left: step, behavior: "smooth" }); }
  if (e.key === "ArrowLeft")  { e.preventDefault(); trackEl.scrollBy({ left: -step, behavior: "smooth" }); }
});

// Initial render
apply();

/*
NEXT (Google Sheet):
- Replace `items = [...]` with `items = await fetchSheet(GVIZ_URL)`
- Then call apply()
*/
