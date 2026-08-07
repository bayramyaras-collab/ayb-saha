from __future__ import annotations

from pathlib import Path
import re
import sys

OLD_APP = "AYB Saha Harita Metraj"
NEW_APP = "BY EDŞ SAHA"
OLD_TITLE = "BY EDŞ Saha v16.57"
NEW_TITLE = "BY EDŞ Saha Programı PERF-25.07-AT-U2"


def remove_tag_by_id(text: str, tag: str, id_value: str) -> tuple[str, int]:
    pattern = re.compile(
        rf"\s*<{tag}\b(?=[^>]*\bid=[\"']{re.escape(id_value)}[\"'])[^>]*>.*?</{tag}>\s*",
        re.IGNORECASE | re.DOTALL,
    )
    return pattern.subn("\n", text)


def find_matching_div(text: str, open_start: int) -> int:
    token_re = re.compile(r"</?div\b[^>]*>", re.IGNORECASE)
    depth = 0
    for m in token_re.finditer(text, open_start):
        token = m.group(0)
        if token.lower().startswith("</div"):
            depth -= 1
            if depth == 0:
                return m.end()
        else:
            depth += 1
    raise RuntimeError("Eşleşen </div> bulunamadı")


def button_key(block: str) -> str:
    checks = [
        (r'data-tool=["\']direk["\']', 'direk'),
        (r'data-tool=["\']trafo["\']', 'trafo'),
        (r'data-tool=["\']yeraltihat["\']', 'yeraltihat'),
        (r'data-tool=["\']hat["\']', 'hat'),
        (r'data-tool=["\']abonehat["\']', 'abonehat'),
        (r'data-tool=["\']kanal["\']', 'kanal'),
        (r'data-tool=["\']kofre["\']', 'kofre'),
        (r'data-tool=["\']bina["\']', 'bina'),
        (r'data-tool=["\']box["\']', 'box'),
        (r'data-tool=["\']sahanot["\']', 'sahanot'),
        (r'id=["\']kfMeasureToolBtn["\']', 'measure'),
        (r'data-tool=["\']cizgi["\']', 'cizgi'),
        (r'data-tool=["\']ok["\']', 'ok'),
    ]
    for pat, key in checks:
        if re.search(pat, block, re.IGNORECASE):
            return key
    return ''


def reorder_draw_buttons(text: str) -> str:
    group_pos = text.find('<div class="ayb-pro-group draw">')
    if group_pos < 0:
        raise RuntimeError("Çizim Araçları grubu bulunamadı")
    row_pos = text.find('<div class="ayb-pro-row">', group_pos)
    if row_pos < 0:
        raise RuntimeError("Çizim Araçları satırı bulunamadı")
    row_end = find_matching_div(text, row_pos)
    row_open_end = text.find('>', row_pos) + 1
    row_close_start = text.rfind('</div>', row_open_end, row_end)
    inner = text[row_open_end:row_close_start]

    blocks = re.findall(r'<button\b[^>]*>.*?</button>', inner, re.IGNORECASE | re.DOTALL)
    keyed: dict[str, str] = {}
    unknown: list[str] = []
    for block in blocks:
        key = button_key(block)
        if key:
            if key in keyed:
                raise RuntimeError(f"Çizim düğmesi tekrarı: {key}")
            keyed[key] = block.strip()
        else:
            unknown.append(block.strip())

    desired = [
        'direk', 'trafo', 'yeraltihat', 'hat', 'abonehat', 'kanal', 'kofre',
        'bina', 'box', 'sahanot', 'measure', 'cizgi', 'ok'
    ]
    missing = [k for k in desired if k not in keyed]
    if missing:
        raise RuntimeError(f"Eksik çizim düğmeleri: {missing}")
    if unknown:
        raise RuntimeError(f"Tanımsız çizim düğmesi sayısı: {len(unknown)}")

    keyed['hat'] = re.sub(r'<small>.*?</small>', '<small>Havai Hat</small>', keyed['hat'], count=1, flags=re.S)
    keyed['yeraltihat'] = re.sub(r'<small>.*?</small>', '<small>Yeraltı Hat</small>', keyed['yeraltihat'], count=1, flags=re.S)

    indent = '          '
    new_inner = '\n' + '\n'.join(indent + keyed[k] for k in desired) + '\n        '
    return text[:row_open_end] + new_inner + text[row_close_start:]


def strip_v28(text: str) -> str:
    """
    v28 kalıntısı, eski bir yamada SheetJS'in HTML sonu sabiti olan
    ``var Wm="</body></html>"`` satırının ortasına yazılmıştır. Yalnızca
    yorum/style/script bloklarını kesmek, SheetJS'i ``var Wm="`` halinde
    bırakıp Excel/KMZ yardımcı motorlarını sözdizimi hatasına düşürür.

    Bu nedenle bozuk ekin iki yanındaki özgün SheetJS bağlantısını fiziksel
    olarak yeniden kuruyoruz:
      var Wm="</body></html>";function Hm(...)
    """
    start = text.find('<!-- === AYB v28:')
    if start < 0:
        raise RuntimeError("AYB v28 başlangıç bloğu bulunamadı")

    wm_start = text.rfind('var Wm="', max(0, start - 256), start)
    if wm_start < 0:
        raise RuntimeError("AYB v28 öncesindeki SheetJS Wm sabiti bulunamadı")

    script_start = text.find('<script id="ayb_v28_same_program_mobile_js">', start)
    if script_start < 0:
        raise RuntimeError("AYB v28 script bloğu bulunamadı")
    script_end = text.find('</script>', script_start)
    if script_end < 0:
        raise RuntimeError("AYB v28 script kapanışı bulunamadı")
    script_end += len('</script>')

    resume_script = text.find('<script>', script_end)
    function_start = text.find('function Hm', resume_script if resume_script >= 0 else script_end)
    if resume_script < 0 or function_start < 0 or function_start - resume_script > 128:
        raise RuntimeError("AYB v28 sonrasındaki SheetJS devamı bulunamadı")

    repaired = 'var Wm="</body></html>";'
    return text[:wm_start] + repaired + text[function_start:]


def strip_service_worker_block(text: str) -> str:
    marker = '/* İSTEK (Bayram YARAŞ): yeni sürüm konunca tablet ESKİ dosyada takılı kalmasın.'
    pos = text.find(marker)
    if pos < 0:
        raise RuntimeError("Eski service worker bloğu bulunamadı")
    start = text.rfind('<script', 0, pos)
    start = text.rfind('\n', 0, start) + 1
    end = text.find('</script>', pos)
    if start < 0 or end < 0:
        raise RuntimeError("Service worker script sınırları bulunamadı")
    end += len('</script>')
    return text[:start] + text[end:]


def clean_html(path: Path) -> dict[str, int]:
    text = path.read_text(encoding='utf-8')
    before = len(text)
    if 'data-tool="sahanot"' not in text or 'aybSahaNotKmzFiles' not in text:
        raise RuntimeError("v16.58 saha notu/KMZ tabanı doğrulanamadı")
    if 'ayb_label_size_settings_v3' not in text:
        raise RuntimeError("v16.58 varsayılan ayar tabanı doğrulanamadı")

    text = strip_v28(text)
    text = strip_service_worker_block(text)
    text = reorder_draw_buttons(text)
    title_pat = re.compile(r'(<div class=["\']title["\']>).*?(</div><span class=["\']small-muted["\'] id=["\']activeProjectName["\']>)', re.S | re.I)
    text, title_n = title_pat.subn(lambda m: m.group(1) + NEW_TITLE + m.group(2), text, count=1)
    if title_n != 1:
        raise RuntimeError("Program başlık satırı bulunamadı")
    text = text.replace(OLD_APP, NEW_APP)
    text = re.sub(r'\n{4,}', '\n\n\n', text)

    forbidden = [
        'ayb_v28_same_program_mobile_css', 'ayb_v28_same_program_mobile_js',
        'aybV28MobileDock', 'aybV28ExportSheet', 'aybV28ImportInput',
        'ayb-v28-mobile', 'ayb-v28-tablet', 'serviceWorker.register(',
        'beforeinstallprompt', OLD_APP,
    ]
    for marker in forbidden[:5] + forbidden[7:]:
        if marker in text:
            raise RuntimeError(f"Eski kalıntı temizlenemedi: {marker}")
    if NEW_TITLE not in text:
        raise RuntimeError("Güncel başlık yazılamadı")

    path.write_text(text, encoding='utf-8')
    return {'before': before, 'after': len(text), 'removed': before - len(text)}


def clean_tablet_js(path: Path) -> dict[str, int]:
    text = path.read_text(encoding='utf-8')
    before = len(text)

    marker = '/* === v16.58: Çizim Araçları sırası sabit === */'
    pos = text.find(marker)
    if pos >= 0:
        text = text[:pos].rstrip() + '\n'

    old = """  if(d.readyState==='loading')d.addEventListener('DOMContentLoaded',boot);else boot();
  window.addEventListener('load',function(){setTimeout(boot,100);setTimeout(boot,800);});
  setInterval(boot,700);
"""
    new = """  function aybYolRenderBagla(){
    var cur=window.renderAll;
    if(typeof cur==='function'&&!cur.__aybYolOlcuRender){
      var wrap=function(){var r=cur.apply(this,arguments);try{setTimeout(tumunuCiz,0);}catch(e){}return r;};
      try{for(var k in cur)if(Object.prototype.hasOwnProperty.call(cur,k))wrap[k]=cur[k];}catch(e){}
      wrap.__aybYolOlcuRender=true; window.renderAll=wrap;
    }
  }
  function aybYolIlkKur(){
    boot(); aybYolRenderBagla();
    var n=0,iv=setInterval(function(){boot();aybYolRenderBagla();if((bagliMap&&d.getElementById(BTN_ID)&&setToolSarildi)||++n>40)clearInterval(iv);},250);
  }
  if(d.readyState==='loading')d.addEventListener('DOMContentLoaded',aybYolIlkKur);else aybYolIlkKur();
  window.addEventListener('load',function(){setTimeout(boot,100);setTimeout(boot,800);});
"""
    if old not in text:
        raise RuntimeError("Yol Ölç sürekli tarama bloğu bulunamadı")
    text = text.replace(old, new, 1)

    text = text.replace(OLD_APP, NEW_APP)
    if 'MutationObserver(function(){fix();})' in text:
        raise RuntimeError("Sıralama MutationObserver kalıntısı kaldı")
    if 'setInterval(boot,700)' in text:
        raise RuntimeError("Yol Ölç sürekli taraması kaldı")

    path.write_text(text, encoding='utf-8')
    return {'before': before, 'after': len(text), 'removed': before - len(text)}


def main() -> None:
    if len(sys.argv) != 2:
        raise SystemExit('Kullanım: patch_v1665_stable_clean.py <app/assets klasörü>')
    app = Path(sys.argv[1])
    html = app / 'AYB_Saha_Harita.html'
    tablet = app / 'ayb-tablet.js'
    if not html.exists() or not tablet.exists():
        raise SystemExit('AYB_Saha_Harita.html veya ayb-tablet.js bulunamadı')
    a = clean_html(html)
    b = clean_tablet_js(tablet)
    sw = app / 'sw.js'
    if sw.exists():
        sw.unlink()
    print(f"HTML: {a['before']} -> {a['after']} (çıkarılan {a['removed']} bayt)")
    print(f"Tablet JS: {b['before']} -> {b['after']} (çıkarılan {b['removed']} bayt)")
    print('v16.65 stabil temizlik tamamlandı')


if __name__ == '__main__':
    main()
