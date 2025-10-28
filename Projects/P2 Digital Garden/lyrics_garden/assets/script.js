
(function () {

  let enterEmojiBtn = document.getElementById("enter-emoji");
  let enterTextBtn  = document.getElementById("enter-text");
  let belt          = document.getElementById("emoji-belt");
  let body          = document.body;
  let pageTitle     = document.querySelector(".prose h1");
  let article       = document.querySelector("article");


  let albums = [
    { slug: "lover",     emoji: "💗", text: "Lover",     href: "entries/1.html" },
    { slug: "folklore",  emoji: "🪵", text: "folklore",  href: "entries/2.html" },
    { slug: "evermore",  emoji: "🍂", text: "evermore",  href: "entries/3.html" },
    { slug: "midnights", emoji: "🌙", text: "Midnights", href: "entries/4.html" },
    { slug: "ttpd",      emoji: "🖋️", text: "TTPD",      href: "entries/5.html" }
  ];


  function buildBelt() {
    if (!belt) return;
    belt.innerHTML = "";
    for (let i = 0; i < albums.length; i++) {
      let a = document.createElement("a");
      a.classList.add("item");
      a.classList.add(albums[i].slug); 
      a.href = albums[i].href;
      a.title = albums[i].text;

      let g = document.createElement("span");
      g.classList.add("g");
      g.textContent = albums[i].emoji;

      let t = document.createElement("span");
      t.classList.add("t");
      t.textContent = albums[i].text;

      a.appendChild(g);
      a.appendChild(t);
      belt.appendChild(a);
    }

  
    let info = document.createElement("p");
    info.className = "muted info-line";
    belt.after(info);

    belt.addEventListener("mouseover", function(ev){
      let item = ev.target.closest(".item");
      if(!item) return;
      info.textContent = "→ " + (item.getAttribute("title") || "");
    });
    belt.addEventListener("mouseleave", function(){
      info.textContent = "";
    });
  }

  function toEmojiMode() {
    if (belt) belt.classList.remove("mode-text"); 
    body.classList.remove("mode-text");           
    try { localStorage.setItem("mode", "emoji"); } catch {}
  }
  function toTextMode() {
    if (belt) belt.classList.add("mode-text");  
    body.classList.add("mode-text");              
    try { localStorage.setItem("mode", "text"); } catch {}
  }

  function initMode() {
    try {
      let saved = localStorage.getItem("mode");
      if (saved === "text") toTextMode(); else toEmojiMode();
    } catch { toEmojiMode(); }
  }

 
  function attachTitleToggle() {
    if (!pageTitle) return;
    pageTitle.addEventListener("click", function(){
      pageTitle.classList.toggle("big");
    });
  }

  
  function insertNowReading() {
    if (!article) return;
    let msg = document.createElement("div");
    msg.className = "muted";
    msg.textContent = "Now reading: " + (document.title.split("·")[0].trim());
    article.prepend(msg);
  }


  if (enterEmojiBtn) enterEmojiBtn.addEventListener("click", toEmojiMode);
  if (enterTextBtn)  enterTextBtn.addEventListener("click", toTextMode);


  buildBelt();
  initMode();
  attachTitleToggle();
  insertNowReading();
})();