/* app.js — routing hash (#gambaran, #celah, #provinsi, #proyeksi), gambar ulang saat resize, tombol tema.
   PEMILIK: Anggota A. Dimuat paling akhir, setelah semua file halaman. */
const PAGES = ["gambaran","celah","provinsi","proyeksi"];
const DRAW = window.HALAMAN;  // diisi oleh file halaman-1..4
let current = null;
function route(){
  const h = location.hash.replace("#",""); const page = PAGES.includes(h) ? h : "gambaran";
  document.querySelectorAll("[data-page]").forEach(s => s.hidden = s.dataset.page !== page);
  document.querySelectorAll("[data-nav]").forEach(a => a.dataset.nav === page ? a.setAttribute("aria-current","page") : a.removeAttribute("aria-current"));
  if (current !== null && current !== page) window.scrollTo(0,0);
  current = page; DRAW[page]();
  const cur = document.querySelector(`[data-nav="${page}"] b`); if (cur) document.getElementById("crumb-page").textContent = cur.textContent;
}
window.addEventListener("hashchange", route);
let rt; window.addEventListener("resize", () => { clearTimeout(rt); rt = setTimeout(() => DRAW[current](), 120); });
document.getElementById("themeBtn").addEventListener("click", () => {
  const root = document.documentElement; const dark = root.dataset.theme ? root.dataset.theme === "dark" : matchMedia("(prefers-color-scheme: dark)").matches;
  root.dataset.theme = dark ? "light" : "dark"; });
route();
