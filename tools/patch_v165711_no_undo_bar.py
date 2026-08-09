from pathlib import Path
import re

P=Path('app/src/main/assets/ayb-undo.js')
s=P.read_text(encoding='utf-8',errors='replace')

# 1) Silme kaydini tutmaya devam et, fakat ekranda gecici GERİ AL bari gostermesin.
s=s.replace("    if(show!==false) showUndoToast(rec);\n", "", 1)

# 2) Gecici bar fonksiyonunu fiziksel olarak kaldir.
s,n=re.subn(r"\n  function showUndoToast\(rec\)\{.*?\n  \}\n  function renderPanel\(\)\{", "\n  function renderPanel(){", s, count=1, flags=re.S)
if n!=1:
    raise SystemExit('showUndoToast blogu bulunamadi')

# 3) Bar CSS kurallarini fiziksel olarak kaldir; modal/panel CSS kalir.
s=s.replace("        '#aybUndoToast{position:fixed;left:50%;bottom:76px;transform:translateX(-50%);z-index:2147483000;display:none;align-items:center;gap:10px;background:#0f172a;color:#fff;border:1px solid #22c55e;border-radius:12px;padding:9px 12px;box-shadow:0 10px 32px #0008;font:700 13px system-ui;max-width:92vw}'+\n", "", 1)
s=s.replace("        '#aybUndoToast button{border:0;border-radius:8px;padding:8px 13px;font-weight:900;cursor:pointer}#aybUndoToast [data-now]{background:#22c55e;color:#052e16}#aybUndoToast [data-list]{background:#334155;color:#fff}'+\n", "", 1)
s=s.replace("        '@media(max-width:700px){#aybUndoToast{bottom:112px}.ayb-undo-row{grid-template-columns:1fr 88px}}';\n", "        '@media(max-width:700px){.ayb-undo-row{grid-template-columns:1fr 88px}}';\n", 1)

# 4) Bar DOM olusturma blogunu fiziksel olarak kaldir.
s,n=re.subn(r"\n    if\(!document\.getElementById\('aybUndoToast'\)\)\{.*?\n    \}\n    if\(!document\.getElementById\('aybUndoModal'\)\)\{", "\n    if(!document.getElementById('aybUndoModal')){", s, count=1, flags=re.S)
if n!=1:
    raise SystemExit('aybUndoToast DOM blogu bulunamadi')

# 5) Acilista eski silinen proje icin bari yeniden gosteren satiri da kaldir.
s=s.replace("      if(history[0]&&history[0].kind==='project'&&Date.now()-history[0].ts<180000) showUndoToast(history[0]);\n", "", 1)

# 6) Artik kullanilmayan timer degiskenini kaldir.
s=s.replace("  var history=[], dbPromise=null, toastTimer=null;", "  var history=[], dbPromise=null;", 1)

# Kontrol: gecici bar kaynakta hic kalmasin. Proje menusu/modal ve geri alma motoru kalsin.
for forbidden in ['showUndoToast','aybUndoToast','toastTimer']:
    if forbidden in s:
        raise SystemExit('gecici geri al kalintisi kaldi: '+forbidden)
for required in ['id=\'aybUndoBtn\'','aybUndoModal','Silinenler / Geri Al','window.aybUndoLast','window.aybUndoKaydet']:
    if required not in s:
        raise SystemExit('geri alma motoru eksik: '+required)

P.write_text(s,encoding='utf-8')
print('v16.57.11 gecici geri al bari fiziksel olarak kaldirildi')
