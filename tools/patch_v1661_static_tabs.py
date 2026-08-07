from pathlib import Path
p=Path('app/src/main/assets/AYB_Saha_Harita.html')
s=p.read_text(encoding='utf-8')
if '<div id="aybRibbonTabs"' not in s:
    marker='<div id="aybOfficeRibbon" class="ayb-office-native-ribbon">'
    tabs='''<div id="aybRibbonTabs">
<button type="button" class="ayb-ribbon-tab active" data-section="project"><span>🏠</span>Proje</button>
<button type="button" class="ayb-ribbon-tab" data-section="draw"><span>✚</span>Çizim Araçları</button>
<button type="button" class="ayb-ribbon-tab" data-section="edit"><span>📍</span>GPS / Düzenle</button>
<button type="button" class="ayb-ribbon-tab" data-section="analysis"><span>🧭</span>Analiz / Altlık</button>
<button type="button" class="ayb-ribbon-tab" data-section="report"><span>▤</span>Rapor / Veri</button>
<button type="button" class="ayb-ribbon-tab" data-section="print"><span>🖨</span>Baskı</button>
<button type="button" class="ayb-ribbon-tab" data-section="symbols"><span>🎯</span>Sembol</button>
<button type="button" class="ayb-ribbon-tab" data-section="fielddata"><span>⇆</span>Saha</button>
</div>'''
    if marker not in s: raise SystemExit('aybOfficeRibbon yok')
    s=s.replace(marker,marker+tabs,1)
if s.count('<div id="aybRibbonTabs"')!=1:
    raise SystemExit('Static tabs count hatali')
for tok in ['aybV28MobileDock','aybV28ExportSheet','aybV28ImportInput','ayb-v28-mobile','ayb-v28-tablet']:
    if tok in s: raise SystemExit('Eski kalinti: '+tok)
if '.ribbon{display:none}' in s.replace(' ',''):
    raise SystemExit('Eski ribbon hide kaldi')
p.write_text(s,encoding='utf-8')
print('static tabs OK')
