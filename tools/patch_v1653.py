from pathlib import Path

html=Path('app/src/main/assets/AYB_Saha_Harita.html')
s=html.read_text(encoding='utf-8')

css="""\n/* v16.53 - Direk etiketi zeminsiz: sadece yazi */\n.sym-direk .sym-label span{background:transparent!important;border:0!important;border-radius:0!important;box-shadow:none!important;padding:0 2px!important;}\n.sym-direk .sym-label{filter:none!important;text-shadow:-1px -1px 0 #000,1px -1px 0 #000,-1px 1px 0 #000,1px 1px 0 #000,0 0 3px rgba(0,0,0,.9)!important;}\n"""
if 'v16.53 - Direk etiketi zeminsiz' not in s:
    pos=s.find('</style>')
    if pos<0: raise SystemExit('style kapanisi bulunamadi')
    s=s[:pos]+css+s[pos:]

s=s.replace('--ayb-direk-symbol-scale:0.7;','--ayb-direk-symbol-scale:1.5;',1)
s=s.replace("root.style.setProperty('--ayb-direk-symbol-scale','0.62');","root.style.setProperty('--ayb-direk-symbol-scale','1.50');")
s=s.replace('direkSymbol:70,trafoSymbol:200','direkSymbol:150,trafoSymbol:200')
s=s.replace('direkSymbol:Number(s.direkSymbol||70)','direkSymbol:Number(s.direkSymbol||150)')

needle="var KEY='ayb_label_size_settings_v1';"
mig="""var KEY='ayb_label_size_settings_v1';\n  try{\n    if(!localStorage.getItem('ayb_direk_symbol_150_mig1')){\n      var __ds={}; try{__ds=JSON.parse(localStorage.getItem(KEY)||'{}')||{};}catch(_e){__ds={};}\n      __ds.direkSymbol=150;\n      localStorage.setItem(KEY,JSON.stringify(__ds));\n      localStorage.setItem('ayb_direk_symbol_150_mig1','1');\n    }\n  }catch(_e){}"""
if needle not in s: raise SystemExit('label KEY bulunamadi')
s=s.replace(needle,mig,1)

s=s.replace("if(isFinite(eski)&&eski>0&&eski<0.5) localStorage.setItem('ayb_snap_m','0.75');","if(isFinite(eski)&&eski>0&&eski<0.5) localStorage.setItem('ayb_snap_m','2.25');")
s=s.replace('return 0.75;','return 2.25;',1)
needle2='function aybSnapMetre(){'
mig2="""function aybSnapMetre(){\n  try{\n    if(!localStorage.getItem('ayb_snap_225_mig1')){\n      localStorage.setItem('ayb_snap_m','2.25');\n      localStorage.setItem('ayb_snap_225_mig1','1');\n    }\n  }catch(_e){}"""
if needle2 not in s: raise SystemExit('aybSnapMetre bulunamadi')
s=s.replace(needle2,mig2,1)
html.write_text(s,encoding='utf-8')

js=Path('app/src/main/assets/ayb-tablet.js')
t=js.read_text(encoding='utf-8')
t=t.replace('var mev=0.75;','var mev=2.25;',1)
t=t.replace('Varsayılan: 0.75 m.','Varsayılan: 2.25 m.')
t=t.replace("Snap varsayılana döndü (0.75 m)","Snap varsayılana döndü (2.25 m)")
t=t.replace("localStorage.removeItem('ayb_snap_m');","localStorage.setItem('ayb_snap_m','2.25');",1)
t=t.replace("String(parseFloat(rg.value)||0.75)","String(parseFloat(rg.value)||2.25)")
js.write_text(t,encoding='utf-8')
print('v16.53 patch OK')
