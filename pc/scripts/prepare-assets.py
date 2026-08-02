#!/usr/bin/env python3
"""PC kurulumuna girecek web kaynaklarını marka/font için hazırlar."""

from pathlib import Path
import re
import sys


ROOT = Path(sys.argv[1]).resolve() if len(sys.argv) > 1 else Path(__file__).resolve().parents[1] / "assets"


def main() -> None:
    if not ROOT.is_dir():
        raise SystemExit(f"PC assets klasörü bulunamadı: {ROOT}")

    replacements = (
        (r"AYB Saha Harita Metraj", "BY EDŞ Saha Programı"),
        (r"AYB Saha Harita", "BY EDŞ Saha Programı"),
        (r"AYB Saha Projesi", "BY EDŞ Saha Projesi"),
        (r"AYB Saha Veri", "BY EDŞ Saha Veri"),
        (r"AYB Saha", "BY EDŞ Saha"),
        (r"AYB Enerji", "Bayram YARAŞ"),
    )
    for path in ROOT.rglob("*"):
        if not path.is_file() or path.suffix.lower() in {".png", ".ico", ".ttf"}:
            continue
        text = path.read_text(encoding="utf-8", errors="ignore")
        for old, new in replacements:
            text = re.sub(old, new, text, flags=re.I)
        text = re.sub(r"PERF-26\.08-U\d+", "PERF-26.08-U8", text)
        path.write_text(text, encoding="utf-8")

    html_path = ROOT / "AYB_Saha_Harita.html"
    html = html_path.read_text(encoding="utf-8")
    if 'href="embedded-bcad.css"' not in html:
        html = html.replace(
            "</head>",
            '<link rel="stylesheet" href="embedded-bcad.css" />\n</head>',
            1,
        )
    html = re.sub(
        r"@font-face\{font-family:'BCAD';src:url\('B_CAD\.ttf'\) "
        r"format\('truetype'\);font-display:swap;\}",
        "/* B_CAD fontu embedded-bcad.css içinde veri olarak gömülüdür. */",
        html,
    )
    html_path.write_text(html, encoding="utf-8")
    print("PC assets U8/BY EDŞ ve gömülü font bağlantısı için hazırlandı.")


if __name__ == "__main__":
    main()
