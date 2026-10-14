(() => {
  const D = window.PORTFOLIO;
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const fine = matchMedia("(hover:hover) and (pointer:fine)").matches;
  const still = matchMedia("(prefers-reduced-motion:reduce)").matches;
  const pad = n => String(n).padStart(2, "0");
  const esc = s => String(s).replace(/[&<>"]/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
  const G = {}; // lightbox galleries

  /* ---------- build: marquee ---------- */
  const mq = D.brands.map(b => `<span>${esc(b)}</span><i></i>`).join("");
  $("#marquee").innerHTML = mq + mq;

  /* ---------- build: key visuals ---------- */
  G.kv = D.kv.map(([n, brand, cap]) => ({ src: `img/kv/${n}.jpg`, cap: `${brand} — ${cap}` }));
  $("#kvTrack").innerHTML = D.kv.map(([n, brand, cap], i) => `
    <figure class="kv-card" data-g="kv" data-i="${i}" data-view tabindex="0">
      <div class="frame"><img src="img/kv/${n}.jpg" alt="${esc(brand)} key visual — ${esc(cap)}" loading="${i < 3 ? "eager" : "lazy"}" width="2178" height="1228"></div>
      <figcaption><span><b>${esc(brand)}</b> · ${esc(cap)}</span><span class="n">${pad(i + 1)}</span></figcaption>
    </figure>`).join("");
  $("#kvTotal").textContent = pad(D.kv.length);

  /* ---------- build: index ---------- */
  $("#indexList").innerHTML = D.index.map(([t, m, href, img], i) => {
    const [first, ...rest] = t.split(" ");
    return `<li><a href="${href}" data-img="${img}" data-hover>
      <span class="i">${pad(i + 1)}</span>
      <span class="t">${rest.length ? `${esc(first)} <em>${esc(rest.join(" "))}</em>` : `<em>${esc(first)}</em>`}</span>
      <span class="m">${esc(m)}</span><span class="ar-i">→</span></a></li>`;
  }).join("");

  /* ---------- build: social ---------- */
  const posts = [];
  D.social.forEach(([page, brand, count]) => {
    for (let k = 1; k <= count; k++) posts.push({ src: `img/post/${page}-${k}.jpg`, brand, cap: brand });
  });
  // interleave brands so the "All" view feels curated rather than grouped
  const byBrand = {};
  posts.forEach(p => (byBrand[p.brand] ||= []).push(p));
  const mixed = [];
  const queues = Object.values(byBrand).map(a => [...a]);
  while (queues.some(q => q.length)) queues.forEach(q => q.length && mixed.push(q.shift()));
  const brands = ["All", ...Object.keys(byBrand)];
  $("#chips").innerHTML = brands.map((b, i) =>
    `<button class="chip${i ? "" : " on"}" data-brand="${esc(b)}" data-hover aria-pressed="${!i}">${esc(b)}<sup>${i ? byBrand[b].length : posts.length}</sup></button>`).join("");

  let filter = "All", shown = 0;
  const STEP = 24;
  const masonry = $("#masonry"), more = $("#more");
  function list() { return filter === "All" ? mixed : byBrand[filter]; }
  function renderSocial(reset) {
    const L = list();
    G.social = L.map(p => ({ src: p.src, cap: p.cap }));
    if (reset) { masonry.innerHTML = ""; shown = 0; }
    const next = L.slice(shown, shown + STEP);
    masonry.insertAdjacentHTML("beforeend", next.map((p, j) => `
      <figure class="post" data-g="social" data-i="${shown + j}" data-view tabindex="0" style="animation-delay:${(j % 12) * 40}ms">
        <img src="${p.src}" alt="${esc(p.cap)} social post" loading="lazy" decoding="async"><span class="lbl">${esc(p.cap)}</span>
      </figure>`).join(""));
    shown += next.length;
    const left = L.length - shown;
    more.parentElement.style.display = left > 0 ? "" : "none";
    $("#moreN").textContent = left > 0 ? `+${left}` : "";
    bindTilt();
  }
  $("#chips").addEventListener("click", e => {
    const b = e.target.closest(".chip"); if (!b) return;
    $$(".chip").forEach(c => { c.classList.toggle("on", c === b); c.setAttribute("aria-pressed", c === b); });
    filter = b.dataset.brand; renderSocial(true);
  });
  more.addEventListener("click", () => renderSocial(false));
  renderSocial(true);

  /* ---------- build: AI ---------- */
  G.ai = D.ai.map(([src, cap]) => ({ src, cap: `AI still — ${cap}` }));
  $("#aiStack").innerHTML = D.ai.map(([src, cap], i) => `
    <figure class="ai-card" data-g="ai" data-i="${i}" data-view tabindex="0">
      <img src="${src}" alt="AI-crafted ${esc(cap.toLowerCase())} image" loading="lazy" decoding="async"><figcaption><span>${pad(i + 1)}</span><span>${esc(cap)}</span></figcaption>
    </figure>`).join("");

  /* ---------- build: logos / cases / type / print ---------- */
  G.logos = D.logos.map(([f, n, k]) => ({ src: `img/logo/${f}.jpg`, cap: `${n} — ${k}` }));
  $("#logos").innerHTML = D.logos.map(([f, n, k], i) => `
    <figure class="logo" data-g="logos" data-i="${i}" data-view tabindex="0">
      <img src="img/logo/${f}.jpg" alt="${esc(n)} logo" loading="lazy"><span><b>${esc(n)}</b><span>${esc(k)}</span></span>
    </figure>`).join("");

  G.cases = D.cases.map(([src, n, d]) => ({ src, cap: `${n} — ${d}` }));
  $("#cases").innerHTML = D.cases.map(([src, n, d], i) => `
    <article class="case" data-g="cases" data-i="${i}" data-view tabindex="0">
      <div class="frame"><img src="${src}" alt="${esc(n)} brand identity" loading="lazy"></div>
      <div><div class="k">${pad(i + 1)} / ${pad(D.cases.length)}</div><h4><em>${esc(n)}</em></h4><p>${esc(d)}</p></div>
    </article>`).join("");

  G.type = D.type.map(([n, b, c]) => ({ src: `img/type/${n}.jpg`, cap: `${b} — ${c}` }));
  $("#typeRow").innerHTML = D.type.map(([n, b, c], i) => `
    <figure class="type-card" data-g="type" data-i="${i}" data-view tabindex="0">
      <img src="img/type/${n}.jpg" alt="${esc(b)} tagline — ${esc(c)}" loading="lazy"><figcaption>${esc(b)}</figcaption>
    </figure>`).join("");

  G.print = D.print.map(([src, b, c]) => ({ src, cap: `${b} — ${c}` }));
  $("#print").innerHTML = D.print.map(([src, b, c], i) => `
    <figure data-g="print" data-i="${i}" data-view tabindex="0">
      <img src="${src}" alt="${esc(b)} — ${esc(c)}" loading="lazy"><figcaption>${esc(b)} · ${esc(c)}</figcaption>
    </figure>`).join("");

  $("#exp").innerHTML = D.exp.map(([a, r, d, w]) =>
    `<li><b>${esc(a)}</b><span class="r">${esc(r)}</span><span class="d">${esc(d)}</span><span class="w">${esc(w)}</span></li>`).join("");
  $("#yr").textContent = new Date().getFullYear();

  /* ---------- loader ---------- */
  const count = $("#count"), t0 = performance.now(), MIN = still ? 0 : 1100;
  const heroImgs = $$("#kvTrack img").slice(0, 2);
  let ready = false;
  Promise.all([document.fonts?.ready, ...heroImgs.map(i => i.complete ? 0 : new Promise(r => { i.onload = i.onerror = r; }))])
    .then(() => { ready = true; });
  setTimeout(() => { ready = true; }, 4000); // never hang on a slow network
  (function tick() {
    const p = Math.min(1, (performance.now() - t0) / MIN || 1);
    const v = Math.floor((ready ? p : Math.min(p, .9)) * 100);
    count.textContent = pad(v);
    if (v < 100) return requestAnimationFrame(tick);
    $(".loader").classList.add("done");
    document.body.classList.remove("is-loading");
    setTimeout(() => $(".hero-title").classList.add("in"), 250);
  })();

  /* ---------- reveal on scroll ---------- */
  const io = new IntersectionObserver(es => es.forEach(e => {
    if (!e.isIntersecting) return;
    e.target.classList.add("in"); io.unobserve(e.target);
  }), { rootMargin: "0px 0px -12% 0px" });
  $$(".reveal, .contact-title, .case").forEach(el => io.observe(el));

  // count-up stats
  const so = new IntersectionObserver(es => es.forEach(e => {
    if (!e.isIntersecting) return; so.unobserve(e.target);
    const el = e.target, to = +el.dataset.count, from = to > 1000 ? to - 40 : 0, t = performance.now();
    (function step(now) {
      const p = Math.min(1, (now - t) / 1600), k = 1 - Math.pow(1 - p, 4);
      el.textContent = Math.round(from + (to - from) * k);
      if (p < 1) requestAnimationFrame(step);
    })(t);
  }), { threshold: .6 });
  $$("[data-count]").forEach(el => so.observe(el));

  /* ---------- rotator + clock ---------- */
  const rot = $$(".rotator b"); let ri = 0;
  rot[0].classList.add("on");
  setInterval(() => {
    rot[ri].classList.replace("on", "off");
    const old = rot[ri]; setTimeout(() => old.classList.remove("off"), 800);
    ri = (ri + 1) % rot.length; rot[ri].classList.add("on");
  }, 2200);
  const clock = $("#clock");
  const fmt = new Intl.DateTimeFormat("en-GB", { hour: "2-digit", minute: "2-digit", timeZone: "Africa/Cairo" });
  const tickClock = () => { clock.textContent = `Cairo ${fmt.format(new Date())}`; };
  tickClock(); setInterval(tickClock, 20000);

  /* ---------- cursor ---------- */
  const cur = $(".cursor"), curLbl = $(".cursor-label");
  let mx = innerWidth / 2, my = innerHeight / 2, cx = mx, cy = my;
  addEventListener("pointermove", e => { mx = e.clientX; my = e.clientY; }, { passive: true });
  if (fine) {
    (function loop() {
      cx += (mx - cx) * .22; cy += (my - cy) * .22;
      cur.style.transform = `translate(${cx}px,${cy}px)`;
      requestAnimationFrame(loop);
    })();
    document.addEventListener("pointerover", e => {
      const v = e.target.closest("[data-view]"), h = e.target.closest("[data-hover]");
      cur.classList.toggle("view", !!v);
      cur.classList.toggle("hover", !v && !!h);
      curLbl.textContent = v ? "View" : (h && h.dataset.label) || "";
      if (h && h.dataset.label) { cur.classList.add("view"); }
    });
    document.addEventListener("pointerleave", () => cur.style.opacity = 0);
    document.addEventListener("pointerenter", () => cur.style.opacity = 1);
  }

  /* ---------- magnetic buttons ---------- */
  if (fine && !still) {
    $$(".magnetic").forEach(el => {
      el.addEventListener("pointermove", e => {
        const r = el.getBoundingClientRect();
        const x = (e.clientX - r.left - r.width / 2) * .35, y = (e.clientY - r.top - r.height / 2) * .45;
        el.style.transform = `translate(${x}px,${y}px)`;
      });
      el.addEventListener("pointerleave", () => {
        el.style.transition = "transform .8s cubic-bezier(.16,1,.3,1)"; el.style.transform = "";
        setTimeout(() => el.style.transition = "", 800);
      });
    });
  }

  /* ---------- tilt on social posts ---------- */
  function bindTilt() {
    if (!fine || still) return;
    $$(".post:not([data-t])").forEach(el => {
      el.dataset.t = 1;
      el.addEventListener("pointermove", e => {
        const r = el.getBoundingClientRect(), x = (e.clientX - r.left) / r.width - .5, y = (e.clientY - r.top) / r.height - .5;
        el.style.transform = `perspective(900px) rotateY(${x * 8}deg) rotateX(${-y * 8}deg)`;
      });
      el.addEventListener("pointerleave", () => { el.style.transform = ""; });
    });
  }

  /* ---------- hero image trail ---------- */
  if (fine && !still) {
    const hero = $("#hero"), trail = $("#trail");
    const pool = mixed.filter((_, i) => i % 2 === 0).slice(0, 40).map(p => p.src);
    pool.forEach(s => { const i = new Image(); i.src = s; });
    let lx = 0, ly = 0, pi = 0, z = 1;
    hero.addEventListener("pointermove", e => {
      const r = hero.getBoundingClientRect(), x = e.clientX - r.left, y = e.clientY - r.top;
      if (Math.hypot(x - lx, y - ly) < 110) return;
      lx = x; ly = y;
      const img = document.createElement("img");
      img.src = pool[pi++ % pool.length]; img.alt = "";
      img.style.left = x + "px"; img.style.top = y + "px"; img.style.zIndex = z++;
      img.style.setProperty("--r", (Math.random() * 10 - 5).toFixed(1) + "deg");
      trail.appendChild(img);
      requestAnimationFrame(() => img.classList.add("show"));
      setTimeout(() => img.classList.add("hide"), 750);
      setTimeout(() => img.remove(), 1700);
    });
  }

  /* ---------- index hover preview ---------- */
  const prev = $(".index-preview"), prevImg = prev.querySelector("img");
  let px = 0, py = 0, tx = 0, ty = 0, prevOn = false;
  if (fine) {
    $$("#indexList a").forEach(a => {
      a.addEventListener("pointerenter", () => { prevImg.src = a.dataset.img; prev.classList.add("on"); prevOn = true; });
      a.addEventListener("pointerleave", () => { prev.classList.remove("on"); prevOn = false; });
    });
    (function follow() {
      tx += (mx - tx) * .12; ty += (my - ty) * .12;
      if (prevOn || prev.classList.contains("on")) {
        const rot = Math.max(-10, Math.min(10, (mx - px) * .4));
        prev.style.left = tx + "px"; prev.style.top = ty + "px";
        prev.firstElementChild.style.transform = `rotate(${rot}deg)`;
      }
      px = mx; py = my;
      requestAnimationFrame(follow);
    })();
  }

  /* ---------- scroll-driven: KV reel, AI stack, nav ---------- */
  const kv = $("#kv"), track = $("#kvTrack"), vp = $(".kv-viewport"), bar = $("#kvBar"), now = $("#kvNow");
  const native = () => !fine || innerWidth < 900;
  function sizeKV() {
    if (native()) {
      kv.style.height = ""; vp.style.overflowX = "auto"; vp.style.scrollSnapType = "x mandatory";
      track.style.transform = ""; $$(".kv-card").forEach(c => c.style.scrollSnapAlign = "center");
      $(".kv-sticky").style.position = "relative"; $(".kv-sticky").style.height = "auto";
      return;
    }
    vp.style.overflowX = ""; $(".kv-sticky").style.position = ""; $(".kv-sticky").style.height = "";
    const dist = track.scrollWidth - innerWidth;
    kv.style.height = (innerHeight + dist) + "px";
  }
  vp.addEventListener("scroll", () => {
    if (!native()) return;
    const p = vp.scrollLeft / (vp.scrollWidth - vp.clientWidth || 1);
    bar.style.width = p * 100 + "%";
    now.textContent = pad(Math.min(D.kv.length, Math.round(p * (D.kv.length - 1)) + 1));
  }, { passive: true });

  const nav = $(".nav");
  const navLinks = $$(".nav-links a");
  let lastY = scrollY;
  function onScroll() {
    const y = scrollY;
    // nav
    nav.classList.toggle("scrolled", y > 40);
    nav.classList.toggle("hide", y > lastY && y > innerHeight * .8 && !document.body.classList.contains("lb-open"));
    lastY = y;
    // KV reel
    if (!native()) {
      const r = kv.getBoundingClientRect(), dist = kv.offsetHeight - innerHeight;
      const p = Math.min(1, Math.max(0, -r.top / (dist || 1)));
      track.style.transform = `translate3d(${-p * (track.scrollWidth - innerWidth)}px,0,0)`;
      bar.style.width = p * 100 + "%";
      now.textContent = pad(Math.min(D.kv.length, Math.round(p * (D.kv.length - 1)) + 1));
      $$(".kv-card img").forEach((im, i) => {
        const cr = im.getBoundingClientRect(), c = (cr.left + cr.width / 2) / innerWidth - .5;
        im.style.transform = `scale(1.06) translateX(${c * -2.5}%)`;
      });
    }
    // active nav
    let act = null;
    navLinks.forEach(a => { const s = $(a.hash); if (s && s.getBoundingClientRect().top < innerHeight * .4) act = a; });
    navLinks.forEach(a => a.classList.toggle("on", a === act));
  }
  let raf = 0;
  addEventListener("scroll", () => { if (!raf) raf = requestAnimationFrame(() => { raf = 0; onScroll(); }); }, { passive: true });
  addEventListener("resize", () => { sizeKV(); onScroll(); });
  addEventListener("load", () => { sizeKV(); onScroll(); });
  sizeKV(); onScroll();

  /* ---------- lightbox ---------- */
  const lb = $("#lb"), lbImg = $("#lbImg"), lbCap = $("#lbCap"), lbNum = $("#lbNum");
  let gal = null, gi = 0, lastFocus = null;
  function show(i) {
    gi = (i + gal.length) % gal.length;
    lbImg.classList.remove("ready");
    lbImg.onload = () => lbImg.classList.add("ready");
    lbImg.src = gal[gi].src; lbImg.alt = gal[gi].cap;
    lbCap.textContent = gal[gi].cap; lbNum.textContent = `${pad(gi + 1)} / ${pad(gal.length)}`;
  }
  function open(g, i) {
    gal = G[g]; if (!gal) return;
    lastFocus = document.activeElement;
    lb.hidden = false; requestAnimationFrame(() => lb.classList.add("open"));
    document.body.style.overflow = "hidden"; document.body.classList.add("lb-open");
    show(i); $(".lb-close").focus();
  }
  function close() {
    lb.classList.remove("open"); document.body.style.overflow = ""; document.body.classList.remove("lb-open");
    setTimeout(() => { lb.hidden = true; }, 400); lastFocus && lastFocus.focus();
  }
  document.addEventListener("click", e => {
    const t = e.target.closest("[data-g]"); if (t) open(t.dataset.g, +t.dataset.i);
  });
  document.addEventListener("keydown", e => {
    const t = e.target.closest && e.target.closest("[data-g]");
    if (t && (e.key === "Enter" || e.key === " ") && lb.hidden) { e.preventDefault(); open(t.dataset.g, +t.dataset.i); return; }
    if (lb.hidden) return;
    if (e.key === "Escape") close();
    if (e.key === "ArrowRight") show(gi + 1);
    if (e.key === "ArrowLeft") show(gi - 1);
  });
  $(".lb-close").onclick = close;
  $(".lb-prev").onclick = () => show(gi - 1);
  $(".lb-next").onclick = () => show(gi + 1);
  $(".lb-stage").addEventListener("click", e => { if (e.target !== lbImg) close(); });
  let sx = null;
  lb.addEventListener("touchstart", e => { sx = e.touches[0].clientX; }, { passive: true });
  lb.addEventListener("touchend", e => {
    if (sx == null) return; const dx = e.changedTouches[0].clientX - sx;
    if (Math.abs(dx) > 50) show(gi + (dx < 0 ? 1 : -1)); sx = null;
  });

  /* ---------- copy email ---------- */
  const toast = $("#toast");
  $("#mail").addEventListener("click", async () => {
    const mail = "mahsamak999@gmail.com";
    try { await navigator.clipboard.writeText(mail); }
    catch { const t = document.createElement("textarea"); t.value = mail; document.body.appendChild(t); t.select(); document.execCommand("copy"); t.remove(); }
    toast.classList.add("on"); setTimeout(() => toast.classList.remove("on"), 1800);
  });
})();
