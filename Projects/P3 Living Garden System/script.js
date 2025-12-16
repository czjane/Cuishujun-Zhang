const SHEET_GVIZ_URL =
  "https://docs.google.com/spreadsheets/d/e/2PACX-1vQ2WNYAgf0_AMy1fco5VEQGg1k-wec0YcXOO50ERCxCaFM4K8Gm38gOzWsbUBkz71j1VfIafXi8VmiX/gviz/tq?gid=0&tqx=out:json";


const grid = document.getElementById("grid");
const filtersEl = document.getElementById("filters");
const qInput = document.getElementById("q");
const countEl = document.getElementById("count");
const updatedEl = document.getElementById("updated");

let items = [];
let activeFilter = "all";

function escapeHtml(str) {
  return String(str ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}


function parseGviz(text) {
  const start = text.indexOf("{");
  const end = text.lastIndexOf("}");
  if (start === -1 || end === -1) throw new Error("GVIZ payload not found. Check publish settings.");
  const json = JSON.parse(text.slice(start, end + 1));

  const cols = json.table.cols.map(c => (c.label || "").trim());
  const rows = json.table.rows.map(r => {
    const obj = {};
    r.c.forEach((cell, i) => {
      const key = cols[i]; 
      obj[key] = cell ? (cell.f ?? cell.v ?? "") : "";
    });
    return obj;
  });
  return rows;
}

function renderFilters(categories) {
  filtersEl.innerHTML = "";


  const allBtn = document.createElement("button");
  allBtn.className = "chip is-active";
  allBtn.dataset.filter = "all";
  allBtn.textContent = "All";
  filtersEl.appendChild(allBtn);

  categories.forEach(cat => {
    const btn = document.createElement("button");
    btn.className = "chip";
    btn.dataset.filter = cat;
    btn.textContent = cat;
    filtersEl.appendChild(btn);
  });

  const chips = Array.from(filtersEl.querySelectorAll(".chip"));
  chips.forEach(btn => {
    btn.addEventListener("click", () => {
      chips.forEach(b => b.classList.remove("is-active"));
      btn.classList.add("is-active");
      activeFilter = btn.dataset.filter;
      render();
    });
  });
}

function render() {
  const q = (qInput.value || "").trim().toLowerCase();

  const filtered = items.filter(it => {
    const passFilter = activeFilter === "all" ? true : String(it.category).trim() === activeFilter;
    const blob = `${it.station} ${it.line} ${it.description} ${it.category}`.toLowerCase();
    const passSearch = q ? blob.includes(q) : true;
    return passFilter && passSearch;
  });

  grid.innerHTML = "";
  filtered.forEach(it => {
    const card = document.createElement("article");
    card.className = "card";
    card.innerHTML = `
      <img src="${escapeHtml(it.image)}" alt="${escapeHtml(it.station || "tile")}" loading="lazy" />
      <div class="meta">
        <div class="title">${escapeHtml(it.station || "Untitled")}</div>
        <div class="subline">${escapeHtml(it.line || "—")}</div>
        <div class="pills">
          <span class="pill">${escapeHtml(it.category || "—")}</span>
        </div>
      </div>
    `;
    grid.appendChild(card);
  });

  countEl.textContent = String(filtered.length);
}

qInput.addEventListener("input", render);


fetch(SHEET_GVIZ_URL)
  .then(res => res.text())
  .then(text => {
    const rows = parseGviz(text);

 
    // Normalize common header-name variants so small typos or different casing won't break the UI.
    items = rows.map(r => ({
      id: r.id || r.ID || "",
      image: r.image || r.Image || "",
      category: r.category || r.Category || "",
      // Accept 'Survices' (typo), 'Services', 'Line', or 'line'
      line: r.Survices || r.Services || r.Line || r.line || "",
      station: r.Station || r.station || r.Name || "",
      description: r.description || r.Description || ""
    }));

    
    const cats = Array.from(new Set(items.map(it => String(it.category).trim()).filter(Boolean)));
    cats.sort((a, b) => a.localeCompare(b));
    renderFilters(cats);

    updatedEl.textContent = new Date().toLocaleDateString();
    render();
  })
  .catch(err => {
    console.error(err);
    grid.innerHTML = `
  });
