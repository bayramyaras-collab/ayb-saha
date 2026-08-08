from pathlib import Path
import re

html=Path('app/src/main/assets/AYB_Saha_Harita.html')
s=html.read_text(encoding='utf-8')

# Yalnız eski v28 mobil arayüz katmanını fiziksel olarak kaldır.
s,n1=re.subn(r'\s*<style id="ayb_v28_same_program_mobile_css">.*?</style>\s*','\n',s,count=1,flags=re.S|re.I)
s=re.sub(r'\s*<input id="aybV28ImportInput"[^>]*>\s*','\n',s,count=1,flags=re.I)
s=re.sub(r'\s*<div id="aybV28MobileDock".*?</div>\s*(?=<div id="aybV28ExportSheet">)','\n',s,count=1,flags=re.S|re.I)
s=re.sub(r'\s*<div id="aybV28ExportSheet">.*?</div>\s*(?=<script id="ayb_v28_same_program_mobile_js">)','\n',s,count=1,flags=re.S|re.I)
s,n2=re.subn(r'\s*<script id="ayb_v28_same_program_mobile_js">.*?</script>\s*','\n',s,count=1,flags=re.S|re.I)
s=s.replace('AYB Saha Harita Metraj v16.40','BY EDŞ Saha Programı PERF-25.07-AT-U2')

if n1!=1 or n2!=1:
    raise SystemExit(f'v28 blokları beklenen sayıda bulunamadı: style={n1}, js={n2}')

for token in ['ayb_v28_same_program_mobile_css','ayb_v28_same_program_mobile_js','aybV28MobileDock','aybV28ExportSheet','aybV28ImportInput','ayb-v28-mobile','AYB Saha Harita Metraj v16.40']:
    if token in s:
        raise SystemExit('Eski kalıntı kaldı: '+token)

# Çalışan proje motoru ve ana butonlar kesinlikle yerinde olmalı.
required=['id="btnOpen"','id="btnNew"','id="newProjectBtn"','function newProject(','function openProject(','function saveProject(','data-tool="sahanot"','aybSahaNotGit']
for token in required:
    if token not in s:
        raise SystemExit('Çalışan özellik kayboldu: '+token)

html.write_text(s,encoding='utf-8')

# Ayrı temiz paket: eski uygulama cache/imza zinciri bunu etkileyemez.
g=Path('app/build.gradle')
x=g.read_text(encoding='utf-8')
x=re.sub(r'applicationId\s+"[^"]+"','applicationId "com.bayramyaras.aybsaha.clean"',x,count=1)
x=re.sub(r'(?m)^(\s*)versionCode\s+\d+\s*$',r'\1versionCode 1666',x,count=1)
x=re.sub(r'(?m)^(\s*)versionName\s+"[^"]+"\s*$',r'\1versionName "16.66"',x,count=1)
g.write_text(x,encoding='utf-8')

sp=Path('app/src/main/res/values/strings.xml')
if sp.exists():
    y=sp.read_text(encoding='utf-8')
    y=re.sub(r'<string name="app_name">.*?</string>','<string name="app_name">BY EDŞ SAHA</string>',y,count=1)
    sp.write_text(y,encoding='utf-8')

print('v16.66 stabil temiz patch OK')
