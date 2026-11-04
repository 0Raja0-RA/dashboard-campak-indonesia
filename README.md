# Penyakit yang Bisa Dicegah, Mengapa Campak Masih Naik di Indonesia?

Dashboard storytelling SDG 3 tentang campak di Indonesia, berupa HTML statis untuk GitHub Pages.

**Big Idea:** Campak kembali naik seiring cakupan dosis kedua yang belum merata. Kalau lajunya tetap,
target 90% baru tercapai sekitar 2032, padahal Vietnam dengan pendapatan setara sudah mencapai 95%.

## Alur data

```
data/raw → notebooks/ → data/clean → analisis/analisis_inferensia.py → data/hasil
         → analisis/buat_data_web.py → docs/data/data.js → docs/index.html
```

## Cara menjalankan

```bash
pip install -r requirements.txt
python analisis/analisis_inferensia.py
python analisis/buat_data_web.py
```

Lalu buka `docs/index.html` (klik dua kali) atau jalankan `python -m http.server -d docs`
dan buka http://localhost:8000. Semua perintah dijalankan dari root repo.

Notebook di `notebooks/` hanya perlu dijalankan ulang kalau data mentah berubah.

## Struktur folder

| Folder | Isi |
| --- | --- |
| `data/raw/` | File unduhan asli dari sumber data (tidak diedit) |
| `data/clean/` | CSV bersih keluaran notebook |
| `data/hasil/` | Keluaran `analisis_inferensia.py` (hasil uji statistik dan proyeksi) |
| `notebooks/` | Notebook praproses, lihat [notebooks/README.md](notebooks/README.md) |
| `analisis/` | Script uji statistik dan penyusun data dashboard |
| `docs/` | Situs GitHub Pages (`index.html` + `data/data.js`) |

## Sumber data (`data/raw/`)

| File | Sumber |
| --- | --- |
| `reported-cases-of-measles.csv` | Kasus campak dilaporkan, WHO (lewat Our World in Data) |
| `who_coverage_mcv1_mcv2.csv` | Cakupan imunisasi MCV1/MCV2, WHO/UNICEF (WUENIC) |
| `penduduk_asean.csv` | Jumlah penduduk, World Bank (`SP.POP.TOTL`) |
| `pdb_per_kapita_asean.csv` | PDB per kapita US$, World Bank (`NY.GDP.PCAP.CD`) |
| `persentase-imunisasi-campak-balita-provinsi-2025.csv` | Persentase balita pernah diimunisasi campak per provinsi, BPS |
| `indonesia-geojson-topojson-maps-with-38-provinces-main/` | Batas 38 provinsi (GeoJSON/TopoJSON), lisensi CC BY 4.0 (lihat `DATA_LICENSE.md` di folder itu) |

Angka Kemenkes 2025–2026 (`data/clean/kemenkes_2025_2026.csv`) diambil dari rilis Kemenkes;
tautannya ada di kolom `sumber`.
