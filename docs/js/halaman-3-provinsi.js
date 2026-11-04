/* halaman-3-provinsi.js — Halaman 3 — Provinsi: batang cakupan imunisasi per provinsi + filter kelompok.
   PEMILIK: Anggota C. Memakai DATA dan fungsi dari grafik.js. */
let filterProv = "semua";
const TERENDAH = ["Aceh","Papua Pegunungan","Sumatera Barat"];
function drawProv(){
  const rows = DATA.provinsi.map(p => ({label:p.nama, value:p.pct, strong: TERENDAH.includes(p.nama),
    color: TERENDAH.includes(p.nama) ? "var(--kasus)" : p.kelompok==="Jawa-Bali" ? "var(--vaksin)" : "var(--konteks)",
    dim: filterProv !== "semua" && p.kelompok !== filterProv, tipName:p.kelompok + " · " + p.wilayah}));
  barChart(document.getElementById("c-prov"), {label:"Persentase balita pernah diimunisasi campak per provinsi 2025, diurutkan dari terendah", rows, min:0, max:100, ticks:[0,25,50,75,100],
    fmt:v => f1.format(v) + "%", fmtTick:v => v + "%", rowH:20});
  table(document.getElementById("tb-prov"), ["Provinsi","Wilayah","Kelompok uji","Pernah imunisasi campak (%)"], DATA.provinsi.map(p => [p.nama, p.wilayah, p.kelompok, f1.format(p.pct)]));
}
document.querySelectorAll("[data-f]").forEach(b => b.addEventListener("click", () => { filterProv = b.dataset.f;
  document.querySelectorAll("[data-f]").forEach(x => x.setAttribute("aria-pressed", x === b)); drawProv(); }));

// daftarkan fungsi gambar halaman ini; dipanggil oleh app.js saat halaman dibuka/di-resize
window.HALAMAN = window.HALAMAN || {};
window.HALAMAN.provinsi = drawProv;
