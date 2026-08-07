from pathlib import Path
import re

html=Path('app/src/main/assets/AYB_Saha_Harita.html')
s=html.read_text(encoding='utf-8')

# v16.61'in yanlis 4 sutunlu tablet CSS'ini fiziksel kaldir.
s,_=re.subn(r'<style id="ayb_current_green_ui_v1661">.*?</style>','',s,flags=re.S)

# V21 icindeki eski 4 sutun / 115px tablet medya blogunu fiziksel kaldir.
pat=r'/\* Çok dar ekranlarda sekmeler daha kompakt olur ama kaydırma yok \*/\s*@media\(max-width:1100px\)\{\s*#aybRibbonTabs\{\s*grid-template-columns:repeat\(4,1fr\);\s*height:58px;\s*\}\s*body #aybOfficeRibbon\.ayb-office-native-ribbon\{\s*grid-template-rows:58px 57px!important;\s*height:115px!important;\s*\}\s*body \.ribbon\.ayb-native-clean-ribbon\{\s*height:115px!important;\s*min-height:115px!important;\s*max-height:115px!important;\s*\}\s*body \.app\{\s*grid-template-rows:34px 115px 32px 1fr 34px!important;\s*\}\s*\}'
s,n=re.subn(pat,'',s,flags=re.S)
if n != 1:
    raise SystemExit(f'Eski 4-sutun tablet blogu sayisi={n}')

# Tablet: 8 sekme tek satir, araclar hemen altinda. Cok dar cihazda sekme satiri yatay kayabilir ama ikinci satira dusmez.
fix='''\n<style id="ayb_v1663_tablet_tabs_fix">\n@media(max-width:1100px){\n body .app{grid-template-rows:34px 88px 32px 1fr 34px!important;}\n body .ribbon.ayb-native-clean-ribbon{height:88px!important;min-height:88px!important;max-height:88px!important;}\n body #aybOfficeRibbon.ayb-office-native-ribbon{height:88px!important;grid-template-rows:31px 57px!important;}\n body #aybRibbonTabs{display:flex!important;flex-wrap:nowrap!important;height:31px!important;overflow-x:auto!important;overflow-y:hidden!important;padding:5px 4px 0!important;gap:3px!important;}\n body #aybRibbonTabs .ayb-ribbon-tab{flex:1 0 92px!important;min-width:92px!important;height:26px!important;font-size:10px!important;border-radius:9px 9px 0 0!important;}\n body #aybRibbonTools{height:57px!important;min-height:57px!important;max-height:57px!important;overflow-x:auto!important;overflow-y:hidden!important;}\n}\n</style>\n'''
s=s.replace('</head>',fix+'<meta name="ayb-build" content="16.63-single-row-tabs">\n</head>',1)

for k in ['id="ayb_section_tabs_toolbar_v21_css"','id="ayb_section_tabs_toolbar_v21_js"','data-section="project"','data-section="draw"','data-section="edit"','data-section="analysis"','data-section="report"','data-section="print"','data-section="symbols"','data-section="fielddata"','data-tool="sahanot"']:
    if k not in s: raise SystemExit('Eksik '+k)
if 'Çok dar ekranlarda sekmeler daha kompakt olur ama kaydırma yok' in s:
    raise SystemExit('Eski tablet blogu kaldi')
if '<style id="ayb_current_green_ui_v1661">' in s:
    raise SystemExit('Yanlis v1661 CSS kaldi')
html.write_text(s,encoding='utf-8')

# Tamamen ayri uygulama kimligi: eski WebView/cache karisamaz.
g=Path('app/build.gradle')
x=g.read_text(encoding='utf-8')
x=re.sub(r'applicationId\s+"[^"]+"','applicationId "com.bayramyaras.aybsaha.current3"',x,count=1)
x=re.sub(r'(?m)^(\s*)versionCode\s+\d+\s*$',r'\1versionCode 1663',x,count=1)
x=re.sub(r'(?m)^(\s*)versionName\s+"[^"]+"\s*$',r'\1versionName "16.63"',x,count=1)
g.write_text(x,encoding='utf-8')

strings=Path('app/src/main/res/values/strings.xml')
t=strings.read_text(encoding='utf-8')
t=re.sub(r'<string name="app_name">.*?</string>','<string name="app_name">BY EDŞ SAHA GÜNCEL 16.63</string>',t,count=1)
strings.write_text(t,encoding='utf-8')
print('v16.63 tek satir sekme patch OK')
