# Notebook praproses

Notebook mengubah data mentah di `data/raw/` menjadi data bersih di `data/clean/`.
Jalankan dari folder `notebooks/` (atau root repo); path sudah relatif terhadap repo,
jadi tidak perlu Google Drive/Colab.

| Notebook | Membaca (`data/raw/`) | Menulis (`data/clean/`) |
| --- | --- | --- |
| `01_kasus_vaksin_indonesia.ipynb` | `reported-cases-of-measles.csv`, `who_coverage_mcv1_mcv2.csv` | `indonesia_tahun.csv`, `kemenkes_2025_2026.csv` |
| `02_provinsi.ipynb` | `persentase-imunisasi-campak-balita-provinsi-2025.csv`, `indonesia-geojson-topojson-maps-with-38-provinces-main/.../GeoJSON/indonesia-38-provinces.geojson` | `provinsi_2025.csv`, `tabel_padanan_provinsi.csv`, `pratinjau_10_provinsi_terendah.png` |
| `03_asean.ipynb` | `reported-cases-of-measles.csv`, `who_coverage_mcv1_mcv2.csv`, `penduduk_asean.csv`, `pdb_per_kapita_asean.csv` | `asean_tahun.csv` |

Catatan:
- Angka Kemenkes 2025–2026 di `kemenkes_2025_2026.csv` diketik langsung di notebook 01
  (sumbernya tertulis di kolom `sumber`), bukan dibaca dari file mentah.
- Notebook awalnya dijalankan di Google Colab. Versi di repo sudah dijalankan ulang secara lokal
  dan hasil CSV-nya identik dengan isi `data/clean/`.
