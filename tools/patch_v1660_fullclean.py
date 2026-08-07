from pathlib import Path
import re

html=Path('app/src/main/assets/AYB_Saha_Harita.html')
js=Path('app/src/main/assets/ayb-tablet.js')
s=html.read_text(encoding='utf-8')

# Eski AYB v28 mobil/tablet arayuzunu DOSYADAN fiziksel kaldır.
start=s.find('<!-- === AYB v28: AYNI PROGRAM - MOBIL/TABLET APK HAZIRLIK EKİ ===')
if start!=-1:
    em=s.find('window.aybV28ShareWhatsapp=shareWhatsapp;',start)
    if em==-1: raise SystemExit('v28 sonu bulunamadi')
    end=s.find('</script>',em)
    if end==-1: raise SystemExit('v28 script sonu bulunamadi')
    end+=len('</script>')
    s=s[:start]+'\n<!-- Eski v28 mobil arayüzü kalıcı olarak kaldırıldı. -->\n'+s[end:]

# Geçici v16.59 legacy temizleme/gizleme shimini kaldır.
s=re.sub(r'\n<!-- AYB_V1659_LEGACY_CLEAN -->\s*<script>.*?</script>\s*','\n',s,count=1,flags=re.S)

# Eski <=900px mobil kuralı ribbonu kapatıyordu; fiziksel kaldır ve güncel tablet kuralı koy.
old='@media(max-width:900px){.app{grid-template-rows:32px 0 40px 1fr 0}.ribbon{display:none}.workbar{overflow-x:auto}.left-tools{display:none}.floating-palette{left:8px;right:8px;top:auto;bottom:calc(8px + env(safe-area-inset-bottom));display:grid;grid-template-columns:repeat(4,1fr);gap:5px}.palette-btn{height:44px;padding:0 4px;font-size:12px}.statusbar{display:none}.coord-overlay{left:8px;bottom:220px}.hint{bottom:178px}.legend{display:none}.gps-card{font-size:11px}.win-modal{width:100%;max-height:96dvh}.win-body{padding:10px}.form-row{grid-template-columns:1fr;gap:3px}.cols3,.cols2{grid-template-columns:1fr}.seq-item{grid-template-columns:30px 1fr}.seq-desc,.seq-field{grid-column:2}.mobile-tools{display:flex}.title{font-size:13px}.titlebar{padding:4px 7px}.win-tabs{overflow-x:auto}.win-tab{white-space:nowrap}.form-row input,.form-row select,.form-row textarea{height:42px;font-size:16px}.win-footer{flex-wrap:wrap}.win-footer button{flex:1;min-width:130px;height:42px}.leaflet-control-layers{margin-top:54px!important}}'
new='''@media(max-width:900px){
  .app{grid-template-rows:32px 115px 40px 1fr 0!important}
  .ribbon.ayb-native-clean-ribbon{display:grid!important;height:115px!important;min-height:115px!important;max-height:115px!important;overflow:hidden!important}
  #aybOfficeRibbon.ayb-office-native-ribbon{display:grid!important;grid-template-rows:58px 57px!important;height:115px!important;min-height:115px!important;visibility:visible!important;opacity:1!important}
  #aybRibbonTabs{display:grid!important;grid-template-columns:repeat(4,minmax(0,1fr))!important;height:58px!important;visibility:visible!important;opacity:1!important;overflow:hidden!important}
  #aybRibbonTools{display:flex!important;height:57px!important;visibility:visible!important;opacity:1!important;overflow-x:auto!important;overflow-y:hidden!important}
  .workbar{overflow-x:auto!important}.statusbar{display:none!important}
  .coord-overlay{left:8px!important;bottom:12px!important;max-width:calc(100vw - 16px)!important}.hint{bottom:64px!important}.legend{display:none!important}.gps-card{font-size:11px!important}
  .win-modal{width:calc(100vw - 12px)!important;max-width:calc(100vw - 12px)!important;max-height:96dvh!important}.win-body{padding:10px!important}.form-row{grid-template-columns:1fr!important;gap:3px!important}.cols3,.cols2{grid-template-columns:1fr!important}.seq-item{grid-template-columns:30px 1fr!important}.seq-desc,.seq-field{grid-column:2!important}.title{font-size:13px!important}.titlebar{padding:4px 7px!important}.win-tabs{overflow-x:auto!important}.win-tab{white-space:nowrap!important}.form-row input,.form-row select,.form-row textarea{height:42px!important;font-size:16px!important}.win-footer{flex-wrap:wrap!important}.win-footer button{flex:1!important;min-width:130px!important;height:42px!important}
}'''
if old in s: s=s.replace(old,new,1)
else:
    # Safety: remove only the exact legacy one-line media if already partly patched.
    s=re.sub(r'@media\(max-width:900px\)\{\.app\{grid-template-rows:32px 0 40px 1fr 0\}\.ribbon\{display:none\}.*?\}\n',new+'\n',s,count=1,flags=re.S)

# Eski field/saha modunun CSS ve JS kalıntıları.
s=re.sub(r'(?ms)^\s*body\.ayb-mode-field[^\{]*\{[^\}]*\}\s*','',s)
s=re.sub(r'(?ms)^\s*body\.ayb-mode-field \.ribbon\.ayb-native-clean-ribbon,\s*body\.ayb-mode-field \.workbar\.ayb-native-clean-workbar\s*\{[^\}]*\}\s*','',s)
s=re.sub(r'(?ms)^\s*body\.ayb-mode-field \.ribbon,\s*body\.ayb-mode-field \.workbar\s*\{[^\}]*\}\s*','',s)
s=s.replace('  const MODE_KEY="ayb_ui_mode_v1";\n','')
s=s.replace('    d.body.classList.remove("ayb-mode-field");\n','')
s=s.replace('    try{ localStorage.setItem("ayb_ui_mode_v1","office"); }catch(_){}\n','')
s=s.replace('    const shells=["#aybFieldShell","#aybGlobalModeSwitch","#aybModeSwitch"];\n    shells.forEach(s=>{ const el=$(s); if(el) el.style.display="none"; });\n','')
s=s.replace('body.ayb-mode-office ','body ')
s=s.replace('<body class="ayb-mode-office">','<body>')

marker='<!-- BY_EDS_V1660_ONLY_CURRENT_UI: legacy mobile/field UI physically removed -->'
if marker not in s:s=s.replace('<body>','<body>\n'+marker,1)

# Fail build if old UI residue remains.
for bad in ['aybV28MobileDock','ayb-v28-mobile','AYB Saha Harita Metraj v16.40','ayb-mode-field','ayb_ui_mode_v1']:
    if bad in s: raise SystemExit('Eski arayuz kalintisi kaldi: '+bad)
if '.ribbon{display:none}' in s: raise SystemExit('Eski ribbon hide kaldi')
if 'id="aybOfficeRibbon"' not in s or 'data-tool="sahanot"' not in s: raise SystemExit('Guncel ribbon/not eksik')
html.write_text(s,encoding='utf-8')

# Tablet JS: eski mode kalintilarini sil, guncel kodu koru.
t=js.read_text(encoding='utf-8')
for oldjs in ["document.body.classList.add('ayb-mode-field');",'document.body.classList.add("ayb-mode-field");',"localStorage.setItem('ayb_ui_mode_v1','field');",'localStorage.setItem("ayb_ui_mode_v1","field");']:
    t=t.replace(oldjs,'')
js.write_text(t,encoding='utf-8')
print('v16.60 full clean OK')
