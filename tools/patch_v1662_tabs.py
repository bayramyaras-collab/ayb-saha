from pathlib import Path
import re

html=Path('app/src/main/assets/AYB_Saha_Harita.html')
s=html.read_text(encoding='utf-8')

# v16.61'de tablette 4 sutun/2 satir buyuk sekme olusturan yanlis katmani fiziksel olarak kaldir.
s,n=re.subn(r'<style id="ayb_current_green_ui_v1661">.*?</style>','',s,flags=re.S)
if n != 1:
    raise SystemExit(f'ayb_current_green_ui_v1661 count={n}')

# Duzgun v16.58 V21 sekme motoru ve 8 sekme mutlaka kalsin.
required=[
    'id="ayb_section_tabs_toolbar_v21_css"',
    'id="ayb_section_tabs_toolbar_v21_js"',
    'data-section="project"',
    'data-section="draw"',
    'data-section="edit"',
    'data-section="analysis"',
    'data-section="report"',
    'data-section="print"',
    'data-section="symbols"',
    'data-section="fielddata"',
    'data-tool="sahanot"'
]
for k in required:
    if k not in s:
        raise SystemExit('Eksik: '+k)

# v28 eski mobil dock geri gelmesin.
for old in ['aybV28MobileDock','ayb-v28-mobile']:
    if old in s:
        raise SystemExit('Eski kalinti var: '+old)

# Build marker.
s=s.replace('</head>','<meta name="ayb-build" content="16.62-tabs-fixed">\n</head>',1)
html.write_text(s,encoding='utf-8')

# Yeni, tamamen ayri paket: eski WebView/cache bu surumu etkileyemez.
g=Path('app/build.gradle')
x=g.read_text(encoding='utf-8')
x=re.sub(r'applicationId\s+"[^"]+"','applicationId "com.bayramyaras.aybsaha.current2"',x,count=1)
x=re.sub(r'(?m)^(\s*)versionCode\s+\d+\s*$',r'\1versionCode 1662',x,count=1)
x=re.sub(r'(?m)^(\s*)versionName\s+"[^"]+"\s*$',r'\1versionName "16.62"',x,count=1)
g.write_text(x,encoding='utf-8')

strings=Path('app/src/main/res/values/strings.xml')
t=strings.read_text(encoding='utf-8')
t=re.sub(r'<string name="app_name">.*?</string>','<string name="app_name">BY EDŞ SAHA GÜNCEL 16.62</string>',t,count=1)
strings.write_text(t,encoding='utf-8')

print('v16.62 sekme duzeltmesi OK')
