/* halaman-2-celah.js — Halaman 2 — Celah imunitas: cakupan MCV1/MCV2, sebaran PDB vs MCV2 ASEAN, residual.
   PEMILIK: Anggota B. Memakai DATA dan fungsi dari grafik.js. */

// warna sorotan hanya untuk Indonesia; Vietnam cukup abu-abu yang lebih tegas dari negara lain
function warnaNegara(negara){
  if (negara === "Indonesia") return "var(--vaksin)";
  if (negara === "Vietnam") return "var(--muted)";
  return "var(--konteks)";
}

function formatSelisih(v){
  return (v > 0 ? "+" : v < 0 ? "−" : "") + f1.format(Math.abs(v));
}

function negaraMenurutSelisih(){
  return [...DATA.asean].sort((a, b) => b.residual - a.residual);
}

function gambarCakupan(){
  const c = DATA.cakupan;
  const host = document.getElementById("c-cakupan");
  const sempit = host.clientWidth < 520;  // batas yang sama dengan lineChart: di bawah ini label ujung garis disembunyikan

  // label langsung di grafik sudah cukup; legenda hanya dipakai saat label itu hilang
  const lg = document.getElementById("lg-cakupan");
  lg.style.display = sempit ? "" : "none";
  legend(lg, [
    {name:"Dosis 2 (MCV2)", color:"var(--vaksin)"},
    {name:"Dosis 1 (MCV1)", color:"var(--konteks)"},
  ]);

  const grafik = lineChart(host, {
    label:"Cakupan dosis 1 dan dosis 2 campak Indonesia 2016 sampai 2025 dengan target 95 persen",
    x:c.tahun, height:300,
    y:{min:40, max:100, ticks:[40,60,80,100], fmt:v => v + "%"},
    tipFmt:v => f1.format(v) + "%",
    refs:[{y:95, label:"Target 95%"}],
    shade:[{x0:2019.6, x1:2021.4, label:"Pandemi", pos:"bottom"}],
    series:[
      {name:"Dosis 1 (MCV1)", values:c.mcv1, color:"var(--konteks)", end:true, endLabel:"MCV1 85%"},
      {name:"Tren MCV2", values:c.tren, color:"var(--vaksin)", width:1.25},
      {name:"Dosis 2 (MCV2)", values:c.mcv2, color:"var(--vaksin)", width:3, end:true, endLabel:"MCV2 78%"},
    ],
  });
  txt(grafik.svg, grafik.sx(2017.3), grafik.sy(c.tren[1]) + 18, "Tren MCV2", "note");

  table(document.getElementById("tb-cakupan"),
    ["Tahun","MCV1 (%)","MCV2 (%)","Tren MCV2 (%)"],
    c.tahun.map((t, i) => [String(t), f0.format(c.mcv1[i]), f0.format(c.mcv2[i]), f1.format(c.tren[i])]));
}

function gambarSebaran(){
  const host = document.getElementById("c-scatter");
  const titik = DATA.asean.map(p => ({...p,
    hl: p.negara === "Indonesia" || p.negara === "Vietnam",
    color: warnaNegara(p.negara),
    labelLeft: ["Indonesia","Singapura","Brunei","Thailand"].includes(p.negara),
    below: p.negara === "Timor-Leste",
    above: p.negara === "Vietnam",
  }));
  scatter(host, {
    label:"Diagram sebar PDB per kapita terhadap cakupan MCV2, 11 negara ASEAN, 2025",
    points:titik, a:DATA.logfit.a, b:DATA.logfit.b,
  });

  // scatter() tidak mengembalikan skalanya, jadi posisi label diambil dari garis lengkungnya
  const svg = host.querySelector("svg");
  const kurva = svg.querySelector('path[style*="dasharray"]');
  if (kurva){
    const kotak = kurva.getBBox();
    const p = kurva.getPointAtLength(kurva.getTotalLength() * 0.68);
    txt(svg, kotak.x + kotak.width, p.y + 24, host.clientWidth < 400 ? "Harapan" : "Cakupan yang diharapkan", "note", "end");
  }

  table(document.getElementById("tb-scatter"),
    ["Negara","PDB per kapita (USD)","MCV2 (%)","Diharapkan (%)","Selisih (poin)"],
    negaraMenurutSelisih().map(p => [p.negara, f0.format(p.pdb), f0.format(p.mcv2), f1.format(p.harapan), formatSelisih(p.residual)]));
}

function gambarResidual(){
  const rows = negaraMenurutSelisih().map(p => ({
    label:p.negara, value:p.residual,
    strong: p.negara === "Indonesia" || p.negara === "Vietnam",
    color: warnaNegara(p.negara),
  }));
  // ticks kosong: nilai sudah tertulis di tiap batang, jadi sumbu dan garis bantu tidak diperlukan
  barChart(document.getElementById("c-resid"), {
    label:"Selisih cakupan MCV2 aktual dengan yang diharapkan per negara",
    rows, min:-15, minNarrow:-26, max:22, ticks:[], zero:true,
    fmt:formatSelisih, tipName:"poin dari harapan", rowH:28,
  });
}

function drawCelah(){
  gambarCakupan();
  gambarSebaran();
  gambarResidual();
}

// daftarkan fungsi gambar halaman ini; dipanggil oleh app.js saat halaman dibuka/di-resize
window.HALAMAN = window.HALAMAN || {};
window.HALAMAN.celah = drawCelah;
