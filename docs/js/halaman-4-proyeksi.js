/* halaman-4-proyeksi.js — Halaman 4 — Proyeksi & aksi: proyeksi MCV2 + slider skenario laju.
   PEMILIK: Anggota A. Memakai DATA dan fungsi dari grafik.js. */
const START = 76.3, START_YEAR = 2025;
function tahunCapai(target, laju){ return START_YEAR + (target - START) / laju; }
function drawProy(){
  const p = DATA.proyeksi, laju = parseFloat(document.getElementById("laju").value);
  document.getElementById("laju-out").textContent = f1.format(laju);
  document.getElementById("o90").textContent = "≈ " + Math.round(tahunCapai(90, laju));
  document.getElementById("o95").textContent = "≈ " + Math.round(tahunCapai(95, laju));
  document.getElementById("oneed").textContent = f1.format((90 - START) / (2030 - START_YEAR)) + " /thn";
  const idx = p.tahun.map((t,i) => i).filter(i => p.tahun[i] <= 2036);
  const xs = idx.map(i => p.tahun[i]);
  const skenX = [], skenV = []; for (let t = 2025; t <= 2036; t++){ skenX.push(t); skenV.push(Math.min(100, START + laju*(t-2025))); }
  const custom = Math.abs(laju - 2.1) > 0.05;
  legend(document.getElementById("lg-proy"), [{name:"MCV2 aktual", color:"var(--vaksin)"}, {name:"Garis tren + pita 95%", color:"var(--konteks)", dash:true}].concat(custom ? [{name:"Skenario laju pilihan", color:"var(--skenario)", dash:true}] : []));
  const series = [{name:"Garis tren", values:idx.map(i => p.tren[i]), color:"var(--konteks)", width:2, dash:true},
                  {name:"MCV2 aktual", values:idx.map(i => p.aktual[i]), color:"var(--vaksin)", width:2.5, end:true, endLabel:""}];
  if (custom) series.push({name:"Skenario", x:skenX, values:skenV, color:"var(--skenario)", width:1.5, dash:true});
  lineChart(document.getElementById("c-proy"), {label:"Cakupan MCV2 Indonesia aktual dan proyeksi garis tren sampai 2036", x:xs, height:320, xStep:2, right:90,
    y:{min:40, max:100, ticks:[40,50,60,70,80,90,100], fmt:v => v + "%"}, tipFmt:v => f1.format(v) + "%",
    band:{x:xs, lo:idx.map(i => p.lo[i]), hi:idx.map(i => p.hi[i]), color:"var(--konteks)"},
    refs:[{y:95, label:"95% kekebalan kelompok"}, {y:90, label:"90% target IA2030"}], xrefs:[{x:2030, label:"2030"}],
    tipExtra:[{name:"pita 95%", x:xs, color:"var(--konteks)", fmt:j => f0.format(p.lo[idx[j]]) + "–" + f0.format(p.hi[idx[j]]) + "%"}],
    series, notes:[{x:2032, y:90.8, dy:34, lines:["Tren ≈90% sekitar 2032"], anchor:"start"}]});
  table(document.getElementById("tb-proy"), ["Tahun","Aktual (%)","Tren (%)","Batas bawah (%)","Batas atas (%)"],
    idx.map(i => [String(p.tahun[i]), p.aktual[i]==null ? "–" : f0.format(p.aktual[i]), f1.format(p.tren[i]), f1.format(p.lo[i]), f1.format(p.hi[i])]));
}
document.getElementById("laju").addEventListener("input", drawProy);

// daftarkan fungsi gambar halaman ini; dipanggil oleh app.js saat halaman dibuka/di-resize
window.HALAMAN = window.HALAMAN || {};
window.HALAMAN.proyeksi = drawProy;
