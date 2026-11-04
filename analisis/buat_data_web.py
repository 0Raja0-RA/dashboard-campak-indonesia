"""
buat_data_web.py — menyusun data dashboard menjadi satu file JavaScript.

Fungsi : menggabungkan CSV bersih + hasil uji menjadi docs/data/data.js
         (window.DATA = {...}) yang dibaca docs/index.html.
Folder : analisis/ (repo dashboard)
Masuk  : data/clean/asean_tahun.csv, data/clean/kemenkes_2025_2026.csv,
         data/hasil/proyeksi_mcv2.csv, data/hasil/asean_residual_2025.csv,
         data/hasil/provinsi_wilayah.csv
Keluar : docs/data/data.js
Jalan  : dari root repo, SETELAH analisis_inferensia.py
         python analisis/buat_data_web.py
"""
import json
import sys
from pathlib import Path

import numpy as np
import pandas as pd
from scipy import stats

CLEAN = Path(sys.argv[1]) if len(sys.argv) > 1 else Path("data/clean")
HASIL = Path(sys.argv[2]) if len(sys.argv) > 2 else Path("data/hasil")
KELUAR = Path(sys.argv[3]) if len(sys.argv) > 3 else Path("docs/data/data.js")


def bersih(v):
    """NaN menjadi null di JSON, angka lain dibulatkan 2 desimal."""
    if v is None or (isinstance(v, float) and np.isnan(v)):
        return None
    return round(float(v), 2)


asean = pd.read_csv(CLEAN / "asean_tahun.csv")
kemenkes = pd.read_csv(CLEAN / "kemenkes_2025_2026.csv")
proyeksi = pd.read_csv(HASIL / "proyeksi_mcv2.csv")
residual = pd.read_csv(HASIL / "asean_residual_2025.csv")
provinsi = pd.read_csv(HASIL / "provinsi_wilayah.csv")

# kasus: 2016-2024 (2025 belum ada di data WHO)
tahun_kasus = list(range(2016, 2025))
idn = asean[asean["iso3"] == "IDN"].set_index("tahun")
asean_inc = []
for t in tahun_kasus:
    d = asean[(asean["tahun"] == t) & asean["kasus_dilaporkan"].notna()]
    asean_inc.append(round(d["kasus_dilaporkan"].sum() / d["penduduk"].sum() * 1e6, 1))

tahun_cakupan = list(range(2016, 2026))
fit = stats.linregress(np.log(residual["pdb_per_kapita_usd"]), residual["mcv2_wuenic"])

DATA = {
    "kasus": {
        "tahun": tahun_kasus,
        "idn_kasus": [int(idn.loc[t, "kasus_dilaporkan"]) for t in tahun_kasus],
        "idn_inc": [bersih(idn.loc[t, "kasus_per_1juta"]) for t in tahun_kasus],
        "asean_inc": asean_inc,
    },
    "cakupan": {
        "tahun": tahun_cakupan,
        "mcv1": [bersih(idn.loc[t, "mcv1_wuenic"]) for t in tahun_cakupan],
        "mcv2": [bersih(idn.loc[t, "mcv2_wuenic"]) for t in tahun_cakupan],
        "tren": [bersih(v) for v in proyeksi[proyeksi["tahun"] <= 2025]["mcv2_tren"]],
    },
    "asean": [
        {"negara": r.negara, "pdb": round(r.pdb_per_kapita_usd, 0), "mcv2": r.mcv2_wuenic,
         "harapan": r.mcv2_diharapkan, "residual": r.residual}
        for r in residual.itertuples()
    ],
    "logfit": {"a": round(fit.intercept, 4), "b": round(fit.slope, 4)},
    "provinsi": [
        {"nama": r.provinsi, "pct": r.imunisasi_campak_pct, "kelompok": r.kelompok_uji, "wilayah": r.wilayah}
        for r in provinsi.sort_values("imunisasi_campak_pct").itertuples()
    ],
    "proyeksi": {
        "tahun": proyeksi["tahun"].tolist(),
        "aktual": [bersih(v) for v in proyeksi["mcv2_aktual"]],
        "tren": proyeksi["mcv2_tren"].tolist(),
        "lo": proyeksi["batas_bawah"].tolist(),
        "hi": proyeksi["batas_atas"].tolist(),
    },
    "kemenkes": kemenkes[["tahun", "periode", "suspek", "terkonfirmasi", "kematian", "jumlah_klb"]].to_dict("records"),
}

KELUAR.parent.mkdir(parents=True, exist_ok=True)
KELUAR.write_text("window.DATA = " + json.dumps(DATA, ensure_ascii=False) + ";\n", encoding="utf-8")
print(f"Tersimpan: {KELUAR.resolve()}")
