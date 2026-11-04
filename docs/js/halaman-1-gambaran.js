/* halaman-1-gambaran.js — Halaman 1 — Gambaran: KPI Kemenkes, grafik kasus (tombol per 1 juta / jumlah).
   PEMILIK: Anggota A. Memakai DATA dan fungsi dari grafik.js. */
const K = DATA.kemenkes.find(r => r.tahun === 2025);
document.getElementById("k-konf").textContent = f0.format(K.terkonfirmasi);
document.getElementById("k-susp").textContent = f0.format(K.suspek);
document.getElementById("k-mati").textContent = f0.format(K.kematian);
document.getElementById("k-klb").textContent = f0.format(K.jumlah_klb);
let modeKasus = "inc";
function drawKasus(){
  const k = DATA.kasus, host = document.getElementById("c-kasus");
  if (modeKasus === "inc"){
    document.getElementById("s-kasus").textContent = "Kasus per 1 juta penduduk: Indonesia dibanding gabungan 11 negara ASEAN, 2016–2024.";
    legend(document.getElementById("lg-kasus"), [{name:"Indonesia", color:"var(--kasus)"}, {name:"Gabungan ASEAN", color:"var(--konteks)"}]);
    lineChart(host, {label:"Insidensi campak per 1 juta penduduk, Indonesia dan gabungan ASEAN, 2016 sampai 2024", x:k.tahun,
      y:{min:0, max:120, ticks:[0,30,60,90,120], fmt:v => f0.format(v)}, tipFmt:v => f1.format(v),
      shade:[{x0:2019.6, x1:2021.4, label:"Pandemi", pos:"top"}],
      series:[{name:"Gabungan ASEAN", values:k.asean_inc, color:"var(--konteks)", end:true, endLabel:"ASEAN"},
              {name:"Indonesia", values:k.idn_inc, color:"var(--kasus)", width:2.5, end:true, area:true}],
      notes:[{x:2023, y:64.2, dy:-30, lines:["2023: 64,2 per 1 juta", "≈2× gabungan ASEAN"], anchor:"end"}]});
  } else {
    document.getElementById("s-kasus").textContent = "Jumlah kasus campak yang dilaporkan, Indonesia, 2016–2024.";
    legend(document.getElementById("lg-kasus"), []);
    lineChart(host, {label:"Jumlah kasus campak Indonesia, 2016 sampai 2024", x:k.tahun,
      y:{min:0, max:20000, ticks:[0,5000,10000,15000,20000], fmt:v => v ? f0.format(v/1000) + " rb" : "0"}, tipFmt:v => f0.format(v),
      shade:[{x0:2019.6, x1:2021.4, label:"Pandemi", pos:"top"}],
      series:[{name:"Kasus Indonesia", values:k.idn_kasus, color:"var(--kasus)", width:2.5, end:true, endLabel:"6.328 (2024)", area:true}],
      notes:[{x:2021, y:394, dy:-40, lines:["2021: 394 kasus"], anchor:"end"},
             {x:2023, y:18063, dy:16, lines:["2023: 18.063", "46× lipat"], anchor:"end"}]});
  }
  table(document.getElementById("tb-kasus"), ["Tahun","Kasus Indonesia","Indonesia per 1 juta","Gabungan ASEAN per 1 juta"],
    k.tahun.map((t,i) => [String(t), f0.format(k.idn_kasus[i]), f1.format(k.idn_inc[i]), f1.format(k.asean_inc[i])]));
}
function setMode(m){ modeKasus = m; document.getElementById("m-inc").setAttribute("aria-pressed", m==="inc"); document.getElementById("m-abs").setAttribute("aria-pressed", m==="abs"); drawKasus(); }
document.getElementById("m-inc").addEventListener("click", () => setMode("inc"));
document.getElementById("m-abs").addEventListener("click", () => setMode("abs"));

// daftarkan fungsi gambar halaman ini; dipanggil oleh app.js saat halaman dibuka/di-resize
window.HALAMAN = window.HALAMAN || {};
window.HALAMAN.gambaran = drawKasus;
