/* app.js — routing hash (#gambaran, #celah, #provinsi, #proyeksi) dan gambar ulang saat resize.
   PEMILIK: Anggota A. Dimuat paling akhir, setelah semua file halaman. */
const PAGES = ["gambaran","celah","provinsi","proyeksi"];
const DRAW = window.HALAMAN;  // diisi oleh file halaman-1..4
let current = null;
function route(){
  const h = location.hash.replace("#",""); const page = PAGES.includes(h) ? h : "gambaran";
  document.querySelectorAll("[data-page]").forEach(s => s.hidden = s.dataset.page !== page);
  document.querySelectorAll("[data-nav]").forEach(a => a.dataset.nav === page ? a.setAttribute("aria-current","page") : a.removeAttribute("aria-current"));
  if (current !== null && current !== page){ window.scrollTo(0,0); document.getElementById("main").scrollTop = 0; }
  current = page; DRAW[page]();
  const cur = document.querySelector(`[data-nav="${page}"] b`); if (cur) document.getElementById("crumb-page").textContent = cur.textContent;
}
window.addEventListener("hashchange", route);
let rt; window.addEventListener("resize", () => { clearTimeout(rt); rt = setTimeout(() => DRAW[current](), 120); });
route();
// Di mode satu layar tinggi grafik mengikuti kotaknya. Kotak bisa berubah ukuran tanpa resize jendela
// (mis. font web selesai dimuat), jadi gambar ulang setiap kali ukuran kotak grafik benar-benar berubah.
if (window.ResizeObserver){
  const ukuran = new Map(); let rk;
  const ro = new ResizeObserver(entri => {
    let berubah = false;
    entri.forEach(e => { const k = Math.round(e.contentRect.width) + "x" + Math.round(e.contentRect.height);
      if (ukuran.get(e.target) !== k){ ukuran.set(e.target, k); berubah = true; } });
    if (berubah){ clearTimeout(rk); rk = setTimeout(() => DRAW[current](), 120); }
  });
  document.querySelectorAll(".chart").forEach(c => ro.observe(c));
}
