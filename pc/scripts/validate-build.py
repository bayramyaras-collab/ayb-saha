#!/usr/bin/env python3
"""Windows Actions çıktısının gerçek kurulum ve gömülü font olduğunu doğrular."""

from pathlib import Path


PC_ROOT = Path(__file__).resolve().parents[1]
ASAR = PC_ROOT / "asar-check"
DIST = PC_ROOT / "dist"


def main() -> None:
    css = (ASAR / "assets" / "embedded-bcad.css").read_text(encoding="utf-8")
    html = (ASAR / "assets" / "AYB_Saha_Harita.html").read_text(encoding="utf-8")
    tablet = (ASAR / "assets" / "ayb-tablet.js").read_text(encoding="utf-8")
    setup = DIST / "BY_EDS_Saha_Programi_v16.35_U8_SETUP.exe"

    assert setup.exists() and setup.stat().st_size > 50_000_000, "Setup EXE eksik/küçük"
    assert "data:font/ttf;base64," in css and len(css) > 10_000, "B_CAD gömülü değil"
    assert "src:url('B_CAD.ttf')" not in html, "Harici B_CAD çağrısı kaldı"
    assert 'href="embedded-bcad.css"' in html, "Gömülü font CSS'i bağlı değil"
    assert "PERF-26.08-U8" in tablet and "v16.35" in html, "U8/16.35 değil"

    joined = (html + tablet).lower()
    for term in ("körfezim", "korfezim", "AYB Saha", "AYB Enerji", "portable"):
        assert term.lower() not in joined, f"Yasaklı görünen metin: {term}"
    print("U8 Setup, marka ve gömülü B_CAD fontu doğrulandı.")


if __name__ == "__main__":
    main()
