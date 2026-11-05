/* grafik.js — data global + fungsi grafik bersama (util, legend, table, tipRow, lineChart, barChart, scatter).
   Dipakai semua file halaman-N. Perubahan diminta ke integrator (Anggota A). */
const DATA = window.DATA;

/* ---------- util ---------- */
const NS = "http://www.w3.org/2000/svg"; let GID = 0;
const f0 = new Intl.NumberFormat("id-ID", {maximumFractionDigits:0});
const f1 = new Intl.NumberFormat("id-ID", {minimumFractionDigits:1, maximumFractionDigits:1});
function el(tag, attrs, parent){ const e = document.createElementNS(NS, tag); for (const k in (attrs||{})) e.setAttribute(k, attrs[k]); if (parent) parent.appendChild(e); return e; }
function txt(parent, x, y, s, cls, anchor){ const t = el("text", {x, y, "text-anchor": anchor||"start"}, parent); if (cls) t.setAttribute("class", cls); t.textContent = s; return t; }
function div(cls, parent){ const d = document.createElement("div"); if (cls) d.className = cls; if (parent) parent.appendChild(d); return d; }
/* Tinggi grafik: di layar lebar (mode satu layar) kotak .chart diberi tinggi oleh tata letak,
   jadi grafik mengisi kotak itu. Di layar kecil kotaknya tanpa tinggi, jadi dipakai tinggi bawaan. */
function tinggiGrafik(host, bawaan){ const h = host.clientHeight; return h >= 120 ? h : bawaan; }
function legend(host, items){
  host.textContent = "";
  items.forEach(it => { const s = document.createElement("span"); const k = document.createElement("i");
    k.className = "key" + (it.dash ? " dash" : ""); k.style.borderTopColor = it.color; if (it.box){ k.className = "key box"; k.style.background = it.color; }
    s.appendChild(k); s.appendChild(document.createTextNode(it.name)); host.appendChild(s); });
}
function table(host, head, rows){
  host.textContent = ""; const t = document.createElement("table"); const tr = document.createElement("tr");
  head.forEach(h => { const th = document.createElement("th"); th.textContent = h; tr.appendChild(th); }); t.appendChild(tr);
  rows.forEach(r => { const tr2 = document.createElement("tr"); r.forEach(c => { const td = document.createElement("td"); td.textContent = c; tr2.appendChild(td); }); t.appendChild(tr2); });
  host.appendChild(t);
}
function tipRow(tip, color, value, name, dash){
  const r = div("r", tip); const k = document.createElement("i"); k.className = "key" + (dash ? " dash" : ""); k.style.borderTopColor = color;
  const v = document.createElement("strong"); v.textContent = value; const n = document.createElement("span"); n.textContent = name;
  r.appendChild(k); r.appendChild(v); r.appendChild(n);
}

/* ---------- line chart ---------- */
function lineChart(host, cfg){
  host.textContent = "";
  const W = Math.max(300, host.clientWidth), narrow = W < 520;
  const H = tinggiGrafik(host, cfg.height || 300), m = {l:40, r: narrow ? 14 : (cfg.right||118), t:18, b:30};
  const svg = el("svg", {viewBox:`0 0 ${W} ${H}`, role:"img", "aria-label":cfg.label, tabindex:"0"}, host);
  const x0 = cfg.x[0], x1 = cfg.xMax || cfg.x[cfg.x.length-1];
  const sx = v => m.l + (v - x0) / (x1 - x0) * (W - m.l - m.r);
  const sy = v => m.t + (1 - (v - cfg.y.min) / (cfg.y.max - cfg.y.min)) * (H - m.t - m.b);
  (cfg.shade||[]).forEach(s => { el("rect", {x:sx(s.x0), y:m.t, width:sx(s.x1)-sx(s.x0), height:H-m.t-m.b, style:"fill:var(--chip)"}, svg); if (!narrow) txt(svg, sx(s.x0)+6, s.pos==="bottom" ? H-m.b-8 : m.t+14, s.label, "note"); });
  cfg.y.ticks.forEach(t => { el("line", {x1:m.l, x2:W-m.r, y1:sy(t), y2:sy(t), class: t===cfg.y.min ? "axis" : "gridl"}, svg); txt(svg, m.l-8, sy(t)+4, cfg.y.fmt(t), null, "end"); });
  const step = cfg.xStep || (narrow ? 2 : 1);
  for (let v = x0; v <= x1; v += step) txt(svg, sx(v), H-10, String(v), null, "middle");
  if (cfg.band){ const b = cfg.band; let d = "";
    b.x.forEach((xv,i) => d += (i ? "L" : "M") + sx(xv).toFixed(1) + "," + sy(b.hi[i]).toFixed(1));
    for (let i = b.x.length-1; i >= 0; i--) d += "L" + sx(b.x[i]).toFixed(1) + "," + sy(b.lo[i]).toFixed(1);
    el("path", {d: d + "Z", style:`fill:${b.color}; fill-opacity:.12`}, svg); }
  // label garis acuan di atas garisnya; kalau terlalu dekat dengan label sebelumnya (grafik pendek), pindah ke bawah garis
  let yLabelAcuan = -Infinity;
  (cfg.refs||[]).forEach(r => { el("line", {x1:m.l, x2:W-m.r, y1:sy(r.y), y2:sy(r.y), class:"ref"}, svg);
    let ly = sy(r.y) - 6; if (Math.abs(ly - yLabelAcuan) < 14) ly = sy(r.y) + 14; yLabelAcuan = ly;
    txt(svg, m.l+6, ly, r.label, "lbl"); });
  (cfg.xrefs||[]).forEach(r => { el("line", {x1:sx(r.x), x2:sx(r.x), y1:m.t, y2:H-m.b, class:"ref"}, svg); txt(svg, sx(r.x)+5, H-m.b-6, r.label, "lbl"); });
  const g = el("g", {}, svg);
  cfg.series.filter(s => s.area).forEach(s => { const xs = s.x || cfg.x, id = "ga" + (++GID);
    const defs = el("defs", {}, svg), lg = el("linearGradient", {id, x1:"0", y1:"0", x2:"0", y2:"1"}, defs);
    el("stop", {offset:"0%", style:`stop-color:${s.color}; stop-opacity:.26`}, lg); el("stop", {offset:"100%", style:`stop-color:${s.color}; stop-opacity:0`}, lg);
    const pts = s.values.map((v,i) => v == null ? null : [sx(xs[i]), sy(v)]).filter(Boolean);
    if (pts.length > 1){ let d = "M" + pts[0][0] + "," + sy(cfg.y.min); pts.forEach(p => d += "L" + p[0].toFixed(1) + "," + p[1].toFixed(1));
      d += "L" + pts[pts.length-1][0] + "," + sy(cfg.y.min) + "Z"; el("path", {d, style:`fill:url(#${id})`}, g); } });
  cfg.series.forEach(s => { const xs = s.x || cfg.x; let d = "", pen = false;
    s.values.forEach((v,i) => { if (v == null){ pen = false; return; } d += (pen ? "L" : "M") + sx(xs[i]).toFixed(1) + "," + sy(v).toFixed(1); pen = true; });
    el("path", {d, style:`fill:none; stroke:${s.color}; stroke-width:${s.width||2}; stroke-linejoin:round; stroke-linecap:round;${s.dash ? " stroke-dasharray:6 5;" : ""}`}, g);
    if (s.end){ let i = s.values.length-1; while (i > 0 && s.values[i] == null) i--;
      const cx = sx(xs[i]), cy = sy(s.values[i]);
      el("circle", {cx, cy, r:5, style:`fill:${s.color}; stroke:var(--surface); stroke-width:2`}, g);
      if (!narrow && s.endLabel !== "") txt(g, cx+10, cy+4 + (s.endDy||0), s.endLabel || s.name, "lbl"); } });
  (cfg.notes||[]).forEach(n => { if (narrow && n.wide) return; const px = sx(n.x), py = sy(n.y), up = n.dy < 0, k = n.lines.length;
    const yb = up ? py + n.dy - 15*(k-1) : py + n.dy;
    el("line", {x1:px, y1: up ? py-6 : py+6, x2:px, y2: up ? py+n.dy+4 : py+n.dy-12, style:"stroke:var(--ink-2); stroke-width:1"}, svg);
    el("circle", {cx:px, cy:py, r:4, style:`fill:var(--surface); stroke:var(--ink-2); stroke-width:1.5`}, svg);
    n.lines.forEach((ln,j) => txt(svg, px + (n.anchor==="end" ? -4 : 4), yb + j*15, ln, j ? "note" : "lbl", n.anchor||"start")); });
  /* hover */
  const cross = el("line", {y1:m.t, y2:H-m.b, class:"cross", visibility:"hidden"}, svg);
  const tip = div("tip", host); tip.hidden = true; let idx = -1;
  const hx = cfg.hoverX || cfg.x;
  function show(i){ idx = i; const xv = hx[i], px = sx(xv); cross.setAttribute("x1", px); cross.setAttribute("x2", px); cross.setAttribute("visibility","visible");
    tip.textContent = ""; const h = div("h", tip); h.textContent = String(xv);
    cfg.series.forEach(s => { const xs = s.x || cfg.x; const j = xs.indexOf(xv); const v = j >= 0 ? s.values[j] : null; if (v != null) tipRow(tip, s.color, cfg.tipFmt(v), s.name, s.dash); });
    (cfg.tipExtra||[]).forEach(e => { const j = e.x.indexOf(xv); if (j >= 0) tipRow(tip, e.color, e.fmt(j), e.name, e.dash); });
    tip.hidden = false; const tw = tip.offsetWidth, pc = px / W * host.clientWidth; let left = pc + 12; if (left + tw > host.clientWidth) left = pc - tw - 12;
    tip.style.left = Math.max(0, left) + "px"; tip.style.top = "8px"; }
  function hide(){ cross.setAttribute("visibility","hidden"); tip.hidden = true; }
  const hit = el("rect", {x:m.l, y:m.t, width:W-m.l-m.r, height:H-m.t-m.b, style:"fill:transparent"}, svg);
  hit.addEventListener("pointermove", ev => { const r = svg.getBoundingClientRect(); const xv = x0 + ((ev.clientX - r.left) * W / r.width - m.l) / (W - m.l - m.r) * (x1 - x0);
    let best = 0; hx.forEach((v,i) => { if (Math.abs(v - xv) < Math.abs(hx[best] - xv)) best = i; }); show(best); });
  hit.addEventListener("pointerleave", hide);
  svg.addEventListener("keydown", ev => { if (ev.key === "ArrowRight"){ show(Math.min(hx.length-1, idx+1)); ev.preventDefault(); } if (ev.key === "ArrowLeft"){ show(Math.max(0, idx < 0 ? 0 : idx-1)); ev.preventDefault(); } });
  svg.addEventListener("blur", hide);
  return {sx, sy, svg, W, H, m};
}

/* ---------- horizontal bars ---------- */
function barChart(host, cfg){
  host.textContent = "";
  const W = Math.max(300, host.clientWidth), narrow = W < 520;
  const labW = narrow ? 128 : 178, m = {t:6, b:24, r:48};
  const ruang = tinggiGrafik(host, 0);  // di mode satu layar, tinggi baris dibagi rata dari ruang yang ada
  const rowH = ruang ? Math.max(14, Math.min(40, Math.floor((ruang - m.t - m.b) / cfg.rows.length))) : (cfg.rowH || 20);
  const H = m.t + m.b + cfg.rows.length * rowH;
  const svg = el("svg", {viewBox:`0 0 ${W} ${H}`, role:"img", "aria-label":cfg.label}, host);
  const min = narrow && cfg.minNarrow != null ? cfg.minNarrow : cfg.min;
  const sx = v => labW + (v - min) / (cfg.max - min) * (W - labW - m.r);
  cfg.ticks.forEach(t => { el("line", {x1:sx(t), x2:sx(t), y1:m.t, y2:H-m.b, class: t===min ? "axis" : "gridl"}, svg); txt(svg, sx(t), H-6, cfg.fmtTick(t), null, "middle"); });
  const tip = div("tip", host); tip.hidden = true;
  cfg.rows.forEach((r,i) => { const y = m.t + i*rowH, bh = Math.min(14, rowH-6), cy = y + rowH/2;
    const g = el("g", {tabindex:"0", role:"img", "aria-label": r.label + ": " + cfg.fmt(r.value), style: r.dim ? "opacity:.28" : ""}, svg);
    txt(g, labW-10, cy+4, narrow ? r.label.replace("Kepulauan ", "Kep. ").replace("Nusa Tenggara", "NT") : r.label, r.strong ? "lbl" : null, "end");
    const x0 = sx(Math.min(0, r.value)), x1 = sx(Math.max(0, r.value)), w = Math.max(1, x1 - x0), rad = Math.min(4, w/2);
    const right = r.value >= 0;
    const d = right ? `M${x0},${cy-bh/2}H${x1-rad}Q${x1},${cy-bh/2} ${x1},${cy-bh/2+rad}V${cy+bh/2-rad}Q${x1},${cy+bh/2} ${x1-rad},${cy+bh/2}H${x0}Z`
                    : `M${x1},${cy-bh/2}H${x0+rad}Q${x0},${cy-bh/2} ${x0},${cy-bh/2+rad}V${cy+bh/2-rad}Q${x0},${cy+bh/2} ${x0+rad},${cy+bh/2}H${x1}Z`;
    el("path", {d, style:`fill:${r.color}`}, g);
    if (r.showValue !== false) txt(g, right ? x1+6 : x0-6, cy+4, cfg.fmt(r.value), r.strong ? "lbl" : null, right ? "start" : "end");
    const hit = el("rect", {x:0, y, width:W, height:rowH, style:"fill:transparent"}, g);
    const on = () => { tip.textContent = ""; div("h", tip).textContent = r.label; tipRow(tip, r.color, cfg.fmt(r.value), r.tipName || cfg.tipName); tip.hidden = false;
      tip.style.left = Math.min(x1/W*host.clientWidth + 10, host.clientWidth - tip.offsetWidth) + "px"; tip.style.top = (y/H*host.clientHeight - 6) + "px"; };
    hit.addEventListener("pointermove", on); hit.addEventListener("pointerleave", () => tip.hidden = true);
    g.addEventListener("focus", on); g.addEventListener("blur", () => tip.hidden = true); });
  if (cfg.zero) el("line", {x1:sx(0), x2:sx(0), y1:m.t, y2:H-m.b, style:"stroke:var(--ink-2); stroke-width:1"}, svg);
}

/* ---------- scatter (log x) ---------- */
function scatter(host, cfg){
  host.textContent = "";
  const W = Math.max(300, host.clientWidth), narrow = W < 520, H = tinggiGrafik(host, 320), m = {l:40, r:18, t:16, b:34};
  const svg = el("svg", {viewBox:`0 0 ${W} ${H}`, role:"img", "aria-label":cfg.label}, host);
  const lx0 = Math.log10(1000), lx1 = Math.log10(150000);
  const sx = v => m.l + (Math.log10(v) - lx0) / (lx1 - lx0) * (W - m.l - m.r);
  const sy = v => m.t + (1 - (v - 50) / 50) * (H - m.t - m.b);
  [50,60,70,80,90,100].forEach(t => { el("line", {x1:m.l, x2:W-m.r, y1:sy(t), y2:sy(t), class: t===50 ? "axis" : "gridl"}, svg); txt(svg, m.l-8, sy(t)+4, t + "%", null, "end"); });
  [1000,3000,10000,30000,100000].forEach(t => txt(svg, sx(t), H-14, (narrow && (t===3000 || t===30000)) ? "" : "$" + f0.format(t), null, "middle"));
  el("line", {x1:m.l, x2:W-m.r, y1:sy(95), y2:sy(95), class:"ref"}, svg); txt(svg, m.l+6, sy(95)-6, "95%", "lbl");
  let d = ""; for (let i = 0; i <= 60; i++){ const v = Math.pow(10, lx0 + (lx1-lx0)*i/60); const y = Math.min(100, cfg.a + cfg.b*Math.log(v)); d += (i ? "L" : "M") + sx(v).toFixed(1) + "," + sy(y).toFixed(1); }
  el("path", {d, style:"fill:none; stroke:var(--konteks); stroke-width:1.5; stroke-dasharray:4 4"}, svg);
  const tip = div("tip", host); tip.hidden = true;
  const pts = [...cfg.points].sort((a,b) => (a.hl?1:0) - (b.hl?1:0));
  pts.forEach(p => { const cx = sx(p.pdb), cy = sy(p.mcv2);
    const g = el("g", {tabindex:"0", role:"img", "aria-label": `${p.negara}: PDB per kapita $${f0.format(p.pdb)}, MCV2 ${p.mcv2}%`}, svg);
    el("circle", {cx, cy, r: p.hl ? 6.5 : 5, style:`fill:${p.color}; stroke:var(--surface); stroke-width:2`}, g);
    if (p.hl || !narrow){ const left = p.labelLeft;
      if (p.below) txt(g, cx, cy + 20, p.negara, null, "middle"); else if (p.above) txt(g, cx, cy - 12, p.negara, "lbl", "middle"); else txt(g, cx + (left ? -10 : 10), cy + 4, p.negara, p.hl ? "lbl" : null, left ? "end" : "start"); }
    const hit = el("circle", {cx, cy, r:14, style:"fill:transparent"}, g);
    const on = () => { tip.textContent = ""; div("h", tip).textContent = p.negara; tipRow(tip, p.color, p.mcv2 + "%", "cakupan MCV2");
      tipRow(tip, "var(--konteks)", f1.format(p.harapan) + "%", "yang diharapkan", true); tipRow(tip, "transparent", "$" + f0.format(p.pdb), "PDB per kapita");
      tip.hidden = false; tip.style.left = Math.min(cx/W*host.clientWidth + 12, host.clientWidth - tip.offsetWidth) + "px"; tip.style.top = Math.max(0, cy/H*host.clientHeight - 70) + "px"; };
    hit.addEventListener("pointermove", on); hit.addEventListener("pointerleave", () => tip.hidden = true); g.addEventListener("focus", on); g.addEventListener("blur", () => tip.hidden = true); });
}
