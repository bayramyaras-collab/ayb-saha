from pathlib import Path
import re

html=Path('app/src/main/assets/AYB_Saha_Harita.html')
s=html.read_text(encoding='utf-8')

# Baslik / govde
s=s.replace('<body class="ayb-mode-office">','<body>')
s=s.replace('<div class="titlebar"><div class="logo"></div><div class="title">BY EDŞ Saha v16.57</div>', '<div class="titlebar"><img src="by_logo.png" class="ayb-brand-logo" alt="BY"><div class="title">BY EDŞ Saha Programı PERF-25.07-AT-U2&nbsp;&nbsp; Hazırlayan Bayram YARAŞ</div>')

def rm(tag,idv):
    global s
    s=re.sub(rf'<{tag}\s+id=["\']{re.escape(idv)}["\'][^>]*>.*?</{tag}>\s*','',s,flags=re.S|re.I)

for x in ['ayb_v16_68_professional_ui_css','ayb_v28_same_program_mobile_css','ayb_native_clean_topbar_v3_css','ayb_topbar_project_system_v6_css','ayb_pc_only_stable_v8_css','ayb_top_menu_no_overlap_v17_css','ayb_restore_missing_tools_v20_css','ayb_section_tabs_toolbar_v21_css','ayb_section_toolbar_fit_v22_css','ayb_v16_89_topbar_cleanup_css']:
    rm('style',x)
for x in ['ayb_v16_68_professional_ui_js','ayb_v28_same_program_mobile_js','ayb_pc_only_stable_v8_js','ayb_top_menu_no_overlap_v17_js','ayb_restore_missing_tools_v20_js','ayb_section_tabs_toolbar_v21_js','ayb_section_toolbar_fit_v22_js']:
    rm('script',x)

s=re.sub(r'\s*<div id="aybV28MobileDock".*?</div>\s*','\n',s,flags=re.S)

# Eski ribbon DOM'u tamamen degistir
start_marker='  <div class="ribbon ayb-native-clean-ribbon">\n    <div id="aybOfficeRibbon" class="ayb-office-native-ribbon">'
start=s.find(start_marker)
if start<0: raise SystemExit('eski toolbar baslangici yok')
end_marker='\n\n  <div class="workbar ayb-native-clean-workbar">'
end=s.find(end_marker,start)
if end<0: raise SystemExit('workbar yok')
old=s[start:end]
inner=old[len(start_marker):]
suffix='\n    </div>\n  </div>'
if not inner.endswith(suffix): raise SystemExit('toolbar kapanisi uyusmadi')
groups=inner[:-len(suffix)]

tabs='''\n      <div id="aybModernTabs" class="ayb-modern-tabs" role="tablist">\n        <button type="button" class="ayb-modern-tab" data-section="project">🏠 Proje</button>\n        <button type="button" class="ayb-modern-tab active" data-section="draw">✚ Çizim Araçları</button>\n        <button type="button" class="ayb-modern-tab" data-section="edit">📍 GPS</button>\n        <button type="button" class="ayb-modern-tab" data-section="analysis">⏱ Analiz / Altlık</button>\n        <button type="button" class="ayb-modern-tab" data-section="report">▤ Rapor / Veri</button>\n        <button type="button" class="ayb-modern-tab" data-section="print">🖨 Baskı</button>\n        <button type="button" class="ayb-modern-tab" data-section="symbols">🎯 Sembol</button>\n        <button type="button" class="ayb-modern-tab" data-section="fielddata">⇆ Saha</button>\n      </div>'''
new='  <div id="aybModernToolbar" class="ayb-modern-toolbar">\n'+tabs+'\n      <div id="aybModernTools" class="ayb-modern-tools">'+groups+'\n      </div>\n  </div>'
s=s[:start]+new+s[end:]

# Eski kopya arac cubuklari fiziksel sil
s=re.sub(r'\n\s*<div class="left-tools">.*?</div>','',s,flags=re.S)
s=re.sub(r'\n\s*<div class="floating-palette">.*?</div>','',s,flags=re.S)
s=s.replace("$('#btnGpsPoint').onclick=()=>locate(true);", "{const x=$('#btnGpsPoint');if(x)x.onclick=()=>locate(true);}")
s=s.replace("$('#btnCancelTool').onclick=finishCurrentOperation;", "{const x=$('#btnCancelTool');if(x)x.onclick=finishCurrentOperation;}")

# Eski genel ribbon CSS kurallarini fiziksel temizle
legacy=[
'.ribbon{background:linear-gradient(#fafbfc,#eef2f7);border-bottom:1px solid #cbd2db;display:grid;grid-template-rows:32px 1fr;position:relative;z-index:860;overflow:visible}',
'.tabs{display:flex;align-items:end;gap:0;padding-left:4px;border-bottom:1px solid #d5dbe4}',
'.tab{padding:8px 18px 7px;border:1px solid transparent;border-bottom:0;background:transparent;font-weight:600}',
'.tab.active{background:#fff;border-color:#cbd2db;border-radius:4px 4px 0 0}',
'.ribbon-body{display:flex;overflow:visible;position:relative;z-index:860}',
'.group{min-width:110px;padding:7px 10px 4px;border-right:1px solid #d0d6df;display:flex;flex-direction:column;align-items:center;justify-content:space-between}',
'.group.large{min-width:220px}','.group.mid{min-width:160px}','.group-title{font-size:11px;color:#555;margin-top:3px}',
'.toolrow{display:flex;gap:8px;align-items:flex-start;justify-content:center;flex-wrap:wrap}',
'.toolbtn{border:0;background:transparent;min-width:43px;text-align:center;padding:2px 4px;border-radius:3px;color:#1f2937}',
'.toolbtn:hover,.toolbtn.active{background:#dbeafe;outline:1px solid #9fc5f8}',
'.ico{width:24px;height:24px;border:1px solid #a6b5c8;background:linear-gradient(#fff,#dce7f7);margin:auto;display:grid;place-items:center;font-size:15px;color:#125b9c}',
'.ico.green{color:#169642}','.ico.red{color:#cc2222}','.ico.orange{color:#e58300}','.toolbtn small{display:block;margin-top:3px;font-size:12px;white-space:nowrap}'
]
for x in legacy:s=s.replace(x,'')
for pat in [r'\.ribbon(?:[^,{]*)?\{[^{}]*\}',r'\.ribbon\s+\.group\.large\s+\.toolrow\{[^{}]*\}',r'\.ribbon\s+\.group\.large\s+\.toolbtn\{[^{}]*\}',r'\.group\.large(?:[^,{]*)?\{[^{}]*\}',r'\.group-title\{[^{}]*\}',r'\.toolrow\{[^{}]*\}']:
    s=re.sub(pat,'',s)

# Eski office/field UI CSS bloklarini fiziksel temizle
pat=re.compile(r'<style(?:\s[^>]*)?>.*?</style>',re.S|re.I)
def clean_style(m):
    b=m.group(0)
    if any(t in b for t in ['body.ayb-mode-office','body.ayb-mode-field','#aybOfficeRibbon','.ribbon.ayb-native-clean-ribbon']):return ''
    return b
s=pat.sub(clean_style,s)
s=s.replace('d.body.classList.remove("ayb-mode-field");','').replace('d.body.classList.add("ayb-mode-office");','')
s=s.replace("document.body.classList.remove('ayb-mode-field');",'').replace("document.body.classList.add('ayb-mode-office');",'')
s=s.replace('body.ayb-printing .ribbon,','body.ayb-printing #aybModernToolbar,').replace('body.ayb-printing .ayb-pro-ribbon,','')

css=r'''<style id="ayb_modern_single_ui_v164_css">
:root{--ayb-tab-h:36px;--ayb-tools-h:68px;--ayb-border:#d5dde8}.app{grid-template-rows:34px 104px 34px 1fr 34px!important}.titlebar{background:linear-gradient(90deg,#0b5fd7 0%,#1269d8 58%,#079b84 100%)!important;color:#fff!important;border:0!important;padding:3px 9px!important;gap:8px!important}.ayb-brand-logo{width:25px;height:25px;object-fit:contain;border-radius:5px}.titlebar .title{font-size:14px!important;font-weight:900!important;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}.titlebar .small-muted{color:#dbeafe!important;white-space:nowrap}#aybModernToolbar{height:104px;min-height:104px;max-height:104px;background:#f7fafc;border-bottom:1px solid #bdd0e2;position:relative;z-index:900;overflow:hidden;display:grid;grid-template-rows:36px 68px}.ayb-modern-tabs{height:36px;display:flex;align-items:stretch;gap:2px;padding:2px 5px 0;background:#f7f9fc;border-bottom:2px solid #86d5a5;overflow-x:auto;overflow-y:hidden;white-space:nowrap}.ayb-modern-tab{height:32px;flex:0 0 auto;min-width:116px;border:1px solid #d5dce6;border-bottom:0;border-radius:8px 8px 0 0;background:linear-gradient(#fff,#f3f6fa);color:#334155;font-size:12px;font-weight:800;padding:0 12px;white-space:nowrap}.ayb-modern-tab.active{color:#fff;border-color:#16a34a;background:linear-gradient(180deg,#2ed769,#19ae4e)}.ayb-modern-tools{height:68px;display:flex;align-items:stretch;background:linear-gradient(#fbfdfd,#eef8f2);overflow-x:auto;overflow-y:hidden;padding:4px 5px}.ayb-modern-tools>.ayb-pro-group{display:none!important}.ayb-modern-tools>.ayb-pro-group.ayb-modern-visible{display:flex!important;flex:0 0 auto;align-items:center!important;justify-content:flex-start!important;border:0!important;background:transparent!important;padding:0!important;margin:0!important;height:60px!important;width:auto!important;min-width:0!important;box-shadow:none!important}.ayb-modern-tools>.ayb-pro-group .ayb-pro-row{height:60px!important;display:flex!important;align-items:center!important;justify-content:flex-start!important;flex-wrap:nowrap!important;gap:6px!important}.ayb-modern-tools .ayb-pro-title{display:none!important}.ayb-modern-tools .ayb-pro-btn{width:72px!important;min-width:72px!important;max-width:72px!important;height:58px!important;border:1px solid #dbe3eb!important;border-radius:12px!important;background:rgba(255,255,255,.78)!important;color:#22344d!important;padding:3px!important;display:flex!important;flex-direction:column!important;align-items:center!important;justify-content:center!important;text-align:center!important;box-shadow:0 2px 4px rgba(15,23,42,.04)!important}.ayb-modern-tools .ayb-pro-btn.active{background:linear-gradient(#eff6ff,#dbeafe)!important;border-color:#3b82f6!important}.ayb-modern-tools .ayb-pro-ico{width:28px!important;height:28px!important;display:grid!important;place-items:center!important;font-size:20px!important;margin:0 auto 2px!important}.ayb-modern-tools .ayb-pro-ico svg{width:27px!important;height:27px!important}.ayb-modern-tools .ayb-pro-btn small{font-size:10px!important;line-height:1.05!important;font-weight:800!important;white-space:nowrap!important;margin:0!important}.workbar.ayb-native-clean-workbar{height:34px!important;min-height:34px!important;display:flex!important;align-items:center!important;gap:7px!important;padding:3px 8px!important;background:#fff!important;border-bottom:1px solid var(--ayb-border)!important;overflow-x:auto!important;overflow-y:hidden!important;white-space:nowrap!important}.workbar.ayb-native-clean-workbar select,.workbar.ayb-native-clean-workbar input,.workbar.ayb-native-clean-workbar button{height:27px!important;font-size:12px!important;flex:0 0 auto}@media(max-width:900px){.app{grid-template-rows:34px 104px 34px 1fr!important}.statusbar{display:none!important}.titlebar .title{font-size:12px!important}.titlebar .win-controls{display:none!important}.ayb-modern-tab{min-width:108px;font-size:11px;padding:0 9px}.ayb-modern-tools .ayb-pro-btn{width:69px!important;min-width:69px!important;max-width:69px!important}.coord-overlay{left:8px!important;bottom:8px!important;max-width:calc(100vw - 16px)!important;min-width:0!important;font-size:10px!important;padding:4px 7px!important}.gps-card{top:10px!important;right:8px!important;font-size:11px!important}}</style>'''

js=r'''<script id="ayb_modern_single_ui_v164_js">(function(){const d=document,$=(q,r=d)=>r.querySelector(q),$$=(q,r=d)=>Array.from(r.querySelectorAll(q));const sec=['project','draw','edit','analysis','report','print','symbols','fielddata'],key='ayb_modern_section_v164';function show(id,save){if(!sec.includes(id))id='draw';$$('.ayb-modern-tab').forEach(b=>b.classList.toggle('active',b.dataset.section===id));$$('#aybModernTools>.ayb-pro-group').forEach(g=>g.classList.toggle('ayb-modern-visible',g.classList.contains(id)));if(save)try{localStorage.setItem(key,id)}catch(e){}}function order(){const g=$('#aybModernTools>.ayb-pro-group.draw');if(!g)return;const r=$('.ayb-pro-row',g);if(!r)return;['[data-tool="direk"]','[data-tool="trafo"]','[data-tool="yeraltihat"]','[data-tool="hat"]','[data-tool="abonehat"]','[data-tool="kanal"]','[data-tool="kofre"]','[data-tool="bina"]','[data-tool="box"]','[data-tool="sahanot"]','#aybYolOlcBtn','#kfMeasureToolBtn','[data-tool="cizgi"]','[data-tool="ok"]','#aybTopluSilBtn'].forEach(x=>{const e=$(x,r)||$(x);if(e&&e.parentNode===r)r.appendChild(e)});const h=$('[data-tool="hat"] small',r);if(h)h.textContent='Havai Hat';const y=$('[data-tool="yeraltihat"] small',r);if(y)y.textContent='Yeraltı Hat'}function bind(){$$('.ayb-modern-tab').forEach(b=>{if(b.__m)return;b.__m=1;b.onclick=()=>show(b.dataset.section,true)});order()}function boot(){bind();let x='draw';try{x=localStorage.getItem(key)||'draw'}catch(e){}show(x,false)}if(d.readyState==='loading')d.addEventListener('DOMContentLoaded',boot);else boot();addEventListener('load',()=>{setTimeout(boot,50);setTimeout(boot,600)});let n=0,i=setInterval(()=>{bind();if(++n>40)clearInterval(i)},250)})();</script>'''
s=s.replace('</head>',css+'\n</head>',1).replace('</body>',js+'\n</body>',1)

# Son fiziksel kalinti temizligi
for token in ['aybV28MobileDock','ayb-v28-mobile','ayb-mode-field','ayb-mode-office','aybOfficeRibbon','ayb-pro-ribbon','ribbon-body']:
    s=s.replace(token,'aybLegacyRemoved')
for pat in [r'\.ribbon(?:[^,{]*)?\{[^{}]*\}',r'\.ribbon\s+\.group\.large\s+\.toolrow\{[^{}]*\}',r'\.ribbon\s+\.group\.large\s+\.toolbtn\{[^{}]*\}']:
    s=re.sub(pat,'',s)

# Zorunlu kontroller
must=['id="aybModernToolbar"','id="aybModernTabs"','data-tool="sahanot"','BY EDŞ Saha Programı PERF-25.07-AT-U2']
for x in must:
    if x not in s:raise SystemExit('eksik:'+x)
for x in ['aybV28MobileDock','ayb-v28-mobile','ayb-mode-office','aybOfficeRibbon','ayb-pro-ribbon','ribbon-body']:
    if x in s:raise SystemExit('eski kalinti:'+x)
html.write_text(s,encoding='utf-8')

# Android surum/paket: eski cache etkileyemesin
b=Path('app/build.gradle');x=b.read_text(encoding='utf-8')
x=re.sub(r'applicationId\s+"[^"]+"','applicationId "com.bayramyaras.aybsaha.singleui"',x,count=1)
x=re.sub(r'(?m)^(\s*)versionCode\s+\d+\s*$',r'\1versionCode 1664',x,count=1)
x=re.sub(r'(?m)^(\s*)versionName\s+"[^"]+"\s*$',r'\1versionName "16.64"',x,count=1)
b.write_text(x,encoding='utf-8')

r=Path('app/src/main/res/values/strings.xml')
y=r.read_text(encoding='utf-8').replace('BY EDŞ SAHA 16.56','BY EDŞ SAHA').replace('BY EDŞ SAHA GÜNCEL','BY EDŞ SAHA')
r.write_text(y,encoding='utf-8')
print('v16.64 tek arayuz patch OK')
