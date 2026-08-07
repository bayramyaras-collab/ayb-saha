from pathlib import Path
import re

html=Path('app/src/main/assets/AYB_Saha_Harita.html')
js=Path('app/src/main/assets/ayb-tablet.js')
gradle=Path('app/build.gradle')
strings=Path('app/src/main/res/values/strings.xml')

s=html.read_text(encoding='utf-8')

# 1) Eski v28 mobil/tablet dock + eski arayuz scriptini FIZIKSEL olarak sil.
s,n=re.subn(r'\n<!-- === AYB v28:.*?<script id="ayb_v28_same_program_mobile_js">.*?</script>\s*','\n',s,flags=re.S)
if n==0:
    s=re.sub(r'<style id="ayb_v28_same_program_mobile_css">.*?</style>\s*','',s,flags=re.S)
    s=re.sub(r'<input id="aybV28ImportInput".*?<script id="ayb_v28_same_program_mobile_js">.*?</script>\s*','',s,flags=re.S)

# 2) Eski dar-ekran kurali ribbon'u gizliyordu. Bu satiri dosyadan tamamen sil.
lines=[]
for line in s.splitlines():
    if line.lstrip().startswith('@media(max-width:900px){.app{grid-template-rows:32px 0 40px 1fr 0}.ribbon{display:none}'):
        continue
    lines.append(line)
s='\n'.join(lines)

# 3) Eski grup basliklari (PROJE/CIZIM ARACLARI alt basligi) fiziksel olarak kaldirilir.
s=re.sub(r'<div class="ayb-pro-title">.*?</div>','',s,flags=re.S)

# 4) Guncel baslik.
s=s.replace('AYB Saha Harita Metraj v16.40','BY EDŞ Saha Programı')
s=re.sub(r'<div class="title">BY EDŞ Saha v[^<]+</div>', '<div class="title">BY EDŞ Saha Programı PERF-25.07-AT-U2</div>', s, count=1)

# 5) Yesil sekmeler artik HTML'de DOGRAUDAN bulunur; JS sonradan uretmek zorunda degil.
if 'id="aybRibbonTabs"' not in s:
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
    if marker not in s: raise SystemExit('aybOfficeRibbon bulunamadi')
    s=s.replace(marker,marker+tabs,1)

# 6) Guncel tablet arayuzu. Eskiyi gizleyen yama degil; bu ana arayuzun kendi stili.
current_css=r'''<style id="ayb_current_green_ui_v1661">
@media(max-width:1100px){
body .app{grid-template-rows:34px 115px 32px 1fr 34px!important}
body .ribbon{display:block!important;height:115px!important;min-height:115px!important;max-height:115px!important;overflow:hidden!important}
body #aybOfficeRibbon{display:grid!important;grid-template-rows:58px 57px!important;width:100%!important;height:115px!important;overflow:hidden!important;background:#fff!important}
body #aybRibbonTabs{display:grid!important;grid-template-columns:repeat(4,1fr)!important;height:58px!important;gap:2px!important;padding:3px 4px!important;background:linear-gradient(180deg,#f8fafc,#eaf2fb)!important;border-bottom:1px solid #cbd5e1!important}
body .ayb-ribbon-tab{display:flex!important;align-items:center!important;justify-content:center!important;gap:4px!important;min-width:0!important;height:25px!important;border:1px solid #cbd5e1!important;border-radius:5px!important;background:#fff!important;color:#1e293b!important;font-size:11px!important;font-weight:900!important;padding:2px 4px!important}
body .ayb-ribbon-tab.active{color:#fff!important;background:linear-gradient(180deg,#22c55e,#15803d)!important;border-color:#15803d!important}
body #aybRibbonTools{display:flex!important;align-items:center!important;height:57px!important;overflow-x:auto!important;overflow-y:hidden!important;padding:2px 4px!important;background:#f8fbff!important;border-top:3px solid #16a34a!important}
body #aybRibbonTools .ayb-pro-group{display:none!important}
body #aybRibbonTools .ayb-pro-group.ayb-section-visible{display:flex!important;width:max-content!important;min-width:max-content!important;height:52px!important;align-items:center!important}
body #aybRibbonTools .ayb-pro-row{display:flex!important;gap:7px!important;flex-wrap:nowrap!important;align-items:center!important;height:52px!important}
body #aybRibbonTools .ayb-pro-btn{flex:0 0 54px!important;width:54px!important;min-width:54px!important;height:48px!important;border:1px solid rgba(100,116,139,.24)!important;border-radius:10px!important;background:linear-gradient(180deg,#fff,#f1f5f9)!important;box-shadow:0 2px 5px rgba(15,23,42,.06)!important}
body #aybRibbonTools .ayb-pro-btn small{display:block!important;font-size:9px!important;font-weight:900!important;white-space:nowrap!important;overflow:hidden!important;text-overflow:ellipsis!important}
body .workbar{display:flex!important;height:32px!important;min-height:32px!important;max-height:32px!important;overflow-x:auto!important}
}
</style>'''
if 'ayb_current_green_ui_v1661' not in s:
    s=s.replace('</head>',current_css+'\n</head>',1)

# 7) Ana sekme motoru icin saglam fallback. Eski arayuz degil, guncel sekmelerin boot kodu.
fallback=r'''<script id="ayb_current_green_ui_v1661_js">
(function(){
 const d=document;
 const sections=['project','draw','edit','analysis','report','print','symbols','fielddata'];
 function secOf(g){for(const s of sections)if(g.classList.contains(s))return s;return '';}
 function boot(){
  const r=d.getElementById('aybOfficeRibbon'); if(!r)return;
  let tools=d.getElementById('aybRibbonTools');
  if(!tools){tools=d.createElement('div');tools.id='aybRibbonTools';r.appendChild(tools);Array.from(r.children).filter(x=>x.classList&&x.classList.contains('ayb-pro-group')).forEach(g=>tools.appendChild(g));}
  const tabs=d.getElementById('aybRibbonTabs');
  function setSec(id){if(!sections.includes(id))id='project';d.body.dataset.aybSection=id;d.querySelectorAll('.ayb-ribbon-tab').forEach(b=>b.classList.toggle('active',b.dataset.section===id));d.querySelectorAll('#aybRibbonTools .ayb-pro-group').forEach(g=>g.classList.toggle('ayb-section-visible',secOf(g)===id));try{localStorage.setItem('ayb_active_ribbon_section_v21',id)}catch(e){}}
  if(tabs&&!tabs.__v1661){tabs.__v1661=1;tabs.addEventListener('click',e=>{const b=e.target.closest('.ayb-ribbon-tab[data-section]');if(b)setSec(b.dataset.section);});}
  let saved='project';try{saved=localStorage.getItem('ayb_active_ribbon_section_v21')||'project'}catch(e){}
  setSec(saved);
 }
 if(d.readyState==='loading')d.addEventListener('DOMContentLoaded',boot);else boot();
 addEventListener('load',()=>{setTimeout(boot,50);setTimeout(boot,500)});
})();
</script>'''
if 'ayb_current_green_ui_v1661_js' not in s:
    s=s.replace('</body>',fallback+'\n</body>',1)

# 8) Fiziksel kalinti kontrolleri.
compact=s.replace(' ','')
for tok in ['aybV28MobileDock','aybV28ExportSheet','aybV28ImportInput','ayb-v28-mobile','ayb-v28-tablet']:
    if tok in s: raise SystemExit('Eski kalinti kaldı: '+tok)
if '.ribbon{display:none}' in compact: raise SystemExit('Eski ribbon hide kaldi')
for need in ['id="aybRibbonTabs"','ayb_section_tabs_toolbar_v21_js','data-tool="sahanot"','aybSahaNotGit','v16.58: Çizim Araçları sırası sabit']:
    if need not in s and need not in js.read_text(encoding='utf-8'):
        raise SystemExit('Guncel ozellik eksik: '+need)

html.write_text(s,encoding='utf-8')

# Android version
x=gradle.read_text(encoding='utf-8')
x=re.sub(r'(?m)^(\s*)versionCode\s+\d+\s*$',r'\1versionCode 1661',x,count=1)
x=re.sub(r'(?m)^(\s*)versionName\s+"[^"]+"\s*$',r'\1versionName "16.61"',x,count=1)
gradle.write_text(x,encoding='utf-8')
if strings.exists():
    y=strings.read_text(encoding='utf-8')
    y=re.sub(r'<string name="app_name">.*?</string>','<string name="app_name">BY EDŞ SAHA GÜNCEL</string>',y)
    strings.write_text(y,encoding='utf-8')
print('v16.61 yesil arayuz temiz patch OK')
