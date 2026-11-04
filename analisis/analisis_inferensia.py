"""
analisis_inferensia.py — tiga uji inferensia untuk dashboard campak SDG 3.

Fungsi : menghitung (1) tren + proyeksi cakupan MCV1/MCV2 Indonesia,
         (2) korelasi PDB per kapita vs MCV2 ASEAN + residual,
         (3) uji beda cakupan imunisasi antarwilayah provinsi,
         lalu menyimpan hasilnya sebagai CSV siap impor ke Power BI.
Folder : analisis/ (repo dashboard)
Masuk  : data/clean/asean_tahun.csv, data/clean/provinsi_2025.csv
Keluar : data/hasil/proyeksi_mcv2.csv, data/hasil/asean_residual_2025.csv,
         data/hasil/provinsi_wilayah.csv, data/hasil/ringkasan_uji.csv
Jalan  : dari root repo  ->  python analisis/analisis_inferensia.py
Butuh  : pandas, numpy, scipy  (pip install pandas numpy scipy)
"""
import sys
from pathlib import Path

import numpy as np
import pandas as pd
from scipy import stats

DATA = Path(sys.argv[1]) if len(sys.argv) > 1 else Path("data/clean")
ASEAN = DATA / "asean_tahun.csv"
PROV = DATA / "provinsi_2025.csv"
OUT = Path(sys.argv[2]) if len(sys.argv) > 2 else Path("data/hasil")
OUT.mkdir(parents=True, exist_ok=True)

TAHUN_PROYEKSI_AKHIR = 2040
ringkasan = []


def catat(analisis, uji, statistik, nilai, p, n, catatan=""):
    ringkasan.append(dict(analisis=analisis, uji=uji, statistik=statistik,
                          nilai=round(float(nilai), 3), p_value=round(float(p), 4),
                          n=int(n), catatan=catatan))


# ---------- 1. Tren + proyeksi cakupan Indonesia ----------
asean = pd.read_csv(ASEAN)
idn = asean[asean["iso3"] == "IDN"].sort_values("tahun")
x = idn["tahun"].to_numpy(float)

for kolom in ["mcv1_wuenic", "mcv2_wuenic"]:
    y = idn[kolom].to_numpy(float)
    reg = stats.linregress(x, y)
    mk = stats.kendalltau(x, y)  # setara uji Mann-Kendall untuk tren monoton
    catat("Tren Indonesia", "Regresi linear", f"kemiringan {kolom} (poin/tahun)",
          reg.slope, reg.pvalue, len(y), f"R2 = {reg.rvalue**2:.2f}")
    catat("Tren Indonesia", "Mann-Kendall (Kendall tau)", f"tau {kolom}",
          mk.statistic, mk.pvalue, len(y))

# proyeksi MCV2 dengan pita kepercayaan 95% garis regresi
y = idn["mcv2_wuenic"].to_numpy(float)
reg = stats.linregress(x, y)
n = len(x)
resid = y - (reg.intercept + reg.slope * x)
s = np.sqrt((resid ** 2).sum() / (n - 2))
sxx = ((x - x.mean()) ** 2).sum()
t = stats.t.ppf(0.975, n - 2)

tahun_semua = np.arange(int(x.min()), TAHUN_PROYEKSI_AKHIR + 1)
fit = reg.intercept + reg.slope * tahun_semua
se = s * np.sqrt(1 / n + (tahun_semua - x.mean()) ** 2 / sxx)
proyeksi = pd.DataFrame({
    "tahun": tahun_semua,
    "mcv2_aktual": pd.Series(y, index=x.astype(int)).reindex(tahun_semua).to_numpy(),
    "mcv2_tren": np.clip(fit, 0, 100).round(1),
    "batas_bawah": np.clip(fit - t * se, 0, 100).round(1),
    "batas_atas": np.clip(fit + t * se, 0, 100).round(1),
})
proyeksi["jenis"] = np.where(proyeksi["tahun"] <= x.max(), "aktual", "proyeksi")
proyeksi.to_csv(OUT / "proyeksi_mcv2.csv", index=False)

for target in (90, 95):
    tahun_capai = (target - reg.intercept) / reg.slope
    tercepat = proyeksi.loc[proyeksi["batas_atas"] >= target, "tahun"].min()
    catat("Proyeksi MCV2", "Ekstrapolasi regresi linear", f"tahun mencapai {target}%",
          tahun_capai, reg.pvalue, n,
          f"paling cepat (batas atas pita 95%): {tercepat}")

# ---------- 2. PDB per kapita vs MCV2, ASEAN 2025 ----------
a25 = asean[asean["tahun"] == 2025].dropna(subset=["mcv2_wuenic", "pdb_per_kapita_usd"]).copy()
rho = stats.spearmanr(a25["pdb_per_kapita_usd"], a25["mcv2_wuenic"])
catat("ASEAN 2025", "Spearman", "rho PDB per kapita vs MCV2", rho.statistic, rho.pvalue, len(a25))
log_pdb = np.log(a25["pdb_per_kapita_usd"])
reg2 = stats.linregress(log_pdb, a25["mcv2_wuenic"])
a25["mcv2_diharapkan"] = (reg2.intercept + reg2.slope * log_pdb).round(1)
a25["residual"] = (a25["mcv2_wuenic"] - a25["mcv2_diharapkan"]).round(1)
catat("ASEAN 2025", "Regresi MCV2 ~ log(PDB)", "kemiringan per log-USD",
      reg2.slope, reg2.pvalue, len(a25), f"R2 = {reg2.rvalue**2:.2f}")
a25[["iso3", "negara", "pdb_per_kapita_usd", "mcv2_wuenic", "mcv2_diharapkan", "residual"]] \
    .sort_values("residual").to_csv(OUT / "asean_residual_2025.csv", index=False)

# ---------- 3. Uji beda antarwilayah provinsi ----------
prov = pd.read_csv(PROV, dtype={"kode_prov": str})
pulau = {"1": "Sumatera", "2": "Sumatera", "3": "Jawa", "5": "Bali-Nusa Tenggara", "6": "Kalimantan",
         "7": "Sulawesi", "8": "Maluku", "9": "Papua"}
prov["wilayah"] = prov["kode_prov"].str[0].map(pulau)
jawa_bali = (prov["wilayah"] == "Jawa") | (prov["provinsi"] == "Bali")
prov["kelompok_uji"] = np.where(jawa_bali, "Jawa-Bali", "Luar Jawa-Bali")
prov.to_csv(OUT / "provinsi_wilayah.csv", index=False)

g1 = prov.loc[jawa_bali, "imunisasi_campak_pct"]
g2 = prov.loc[~jawa_bali, "imunisasi_campak_pct"]
mw = stats.mannwhitneyu(g1, g2, alternative="two-sided")
catat("Provinsi 2025", "Mann-Whitney U", "Jawa-Bali vs luar Jawa-Bali (U)", mw.statistic, mw.pvalue,
      len(prov), f"median {g1.median():.1f}% vs {g2.median():.1f}% (n {len(g1)} vs {len(g2)})")
kw = stats.kruskal(*[d["imunisasi_campak_pct"] for _, d in prov.groupby("wilayah")])
catat("Provinsi 2025", "Kruskal-Wallis", "7 wilayah (H)", kw.statistic, kw.pvalue, len(prov))

hasil = pd.DataFrame(ringkasan)
hasil.to_csv(OUT / "ringkasan_uji.csv", index=False)
print(hasil.to_string(index=False))
print(f"\nFile tersimpan di {OUT.resolve()}")
