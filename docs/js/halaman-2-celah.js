/* halaman-2-celah.js — Halaman 2 — Celah imunitas: cakupan MCV1/MCV2, sebaran PDB vs MCV2 ASEAN, residual.
   PEMILIK: Anggota B. Memakai DATA dan fungsi dari grafik.js. */
function drawCakupan(){
  const c = DATA.cakupan;
  legend(document.getElementById("lg-cakupan"), [{name:"Dosis 2 (MCV2)", color:"var(--vaksin)"}, {name:"Dosis 1 (MCV1)", color:"var(--konteks)"}, {name:"Tren MCV2", color:"var(--vaksin)", dash:true}]);
  lineChart(document.getElementById("c-cakupan"), {label:"Cakupan dosis 1 dan dosis 2 campak Indonesia 2016 sampai 2025 dengan target 95 persen", x:c.tahun, height:300,
    y:{min:40, max:100, ticks:[40,50,60,70,80,90,100], fmt:v => v + "%"}, tipFmt:v => f1.format(v) + "%",
    refs:[{y:95, label:"Target 95% (kekebalan kelompok)"}], shade:[{x0:2019.6, x1:2021.4, label:"Pandemi", pos:"bottom"}],
    series:[{name:"Dosis 1 (MCV1)", values:c.mcv1, color:"var(--konteks)", end:true, endLabel:"MCV1 85%"},
            {name:"Tren MCV2", values:c.tren, color:"var(--vaksin)", width:1.5, dash:true},
            {name:"Dosis 2 (MCV2)", values:c.mcv2, color:"var(--vaksin)", width:2.5, end:true, endLabel:"MCV2 78%", area:true}],
    notes:[{x:2021, y:53, dy:30, lines:["2021: dosis 2 hanya 53%"], anchor:"start"}]});
  table(document.getElementById("tb-cakupan"), ["Tahun","MCV1 (%)","MCV2 (%)","Tren MCV2 (%)"], c.tahun.map((t,i) => [String(t), f0.format(c.mcv1[i]), f0.format(c.mcv2[i]), f1.format(c.tren[i])]));
  const pts = DATA.asean.map(p => ({...p, hl: p.negara==="Indonesia" || p.negara==="Vietnam",
    color: p.negara==="Indonesia" ? "var(--kasus)" : p.negara==="Vietnam" ? "var(--vaksin)" : "var(--konteks)",
    labelLeft: ["Indonesia","Singapura","Brunei","Thailand"].includes(p.negara), below: p.negara==="Timor-Leste", above: p.negara==="Vietnam"}));
  scatter(document.getElementById("c-scatter"), {label:"Diagram sebar PDB per kapita terhadap cakupan MCV2, 11 negara ASEAN, 2025", points:pts, a:DATA.logfit.a, b:DATA.logfit.b});
  table(document.getElementById("tb-scatter"), ["Negara","PDB per kapita (USD)","MCV2 (%)","Diharapkan (%)","Selisih (poin)"],
    [...DATA.asean].sort((a,b) => b.residual - a.residual).map(p => [p.negara, f0.format(p.pdb), f0.format(p.mcv2), f1.format(p.harapan), (p.residual>0 ? "+" : p.residual<0 ? "\u2212" : "") + f1.format(Math.abs(p.residual))]));
  const rows = [...DATA.asean].sort((a,b) => b.residual - a.residual).map(p => ({label:p.negara, value:p.residual, strong: p.negara==="Indonesia" || p.negara==="Vietnam",
    color: p.negara==="Indonesia" ? "var(--kasus)" : p.negara==="Vietnam" ? "var(--vaksin)" : "var(--konteks)"}));
  barChart(document.getElementById("c-resid"), {label:"Selisih cakupan MCV2 aktual dengan yang diharapkan per negara", rows, min:-15, minNarrow:-26, max:22, ticks:[-10,0,10,20], zero:true,
    fmt:v => (v>0 ? "+" : v<0 ? "\u2212" : "") + f1.format(Math.abs(v)), fmtTick:v => (v>0 ? "+" : v<0 ? "\u2212" : "") + Math.abs(v), tipName:"poin dari harapan", rowH:24});
}

// daftarkan fungsi gambar halaman ini; dipanggil oleh app.js saat halaman dibuka/di-resize
window.HALAMAN = window.HALAMAN || {};
window.HALAMAN.celah = drawCakupan;
