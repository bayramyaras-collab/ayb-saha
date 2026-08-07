from pathlib import Path
import re

html=Path('app/src/main/assets/AYB_Saha_Harita.html')
s=html.read_text(encoding='utf-8')
pat=r"function getLineDisplayText\(line\)\{.*?\}"
new="function getLineDisplayText(line){const p=line?.props||{}; const main=(p.main_hat_tipi||p.og_hat_tipi||p.hat_tipi||'').trim(); const ag=(p.ag_hat_aktif?(p.ag_hat_tipi||'').trim():''); let base=''; if(main&&ag) base=main+'+'+ag; else base=main||ag||(p.hat_tipi||p.tip||'Hat'); const d=String(p.durum||p.Durumu||'').toLocaleUpperCase('tr').replace(/\\s+/g,' '); if(d.includes('BYSK')||d.includes('BSYK')) return '['+base+']'; if(d.includes('YENİ')||d.includes('YENI')) return base; if(d.includes('MEVCUT')) return '('+base+')'; return base}"
s,n=re.subn(pat,lambda m:new,s,count=1,flags=re.S)
if n!=1: raise SystemExit('getLineDisplayText bulunamadi')
html.write_text(s,encoding='utf-8')

js=Path('app/src/main/assets/ayb-tablet.js')
s=js.read_text(encoding='utf-8')
old="""      if(!kesit){ var lp=l.props||{};\n        kesit=String(lp.main_hat_tipi||lp.og_hat_tipi||lp.hat_tipi||lp.kesit||lp.cins||'').trim();\n        if(lp.ag_hat_aktif&&lp.ag_hat_tipi){ kesit=kesit?(kesit+'+('+lp.ag_hat_tipi+')'):String(lp.ag_hat_tipi); }\n      }\n"""
new2="""      if(!kesit){ var lp=l.props||{};\n        var anaKesit=String(lp.main_hat_tipi||lp.og_hat_tipi||lp.hat_tipi||lp.kesit||lp.cins||'').trim();\n        var agKesit=(lp.ag_hat_aktif&&lp.ag_hat_tipi)?String(lp.ag_hat_tipi).trim():'';\n        kesit=anaKesit&&agKesit?(anaKesit+'+'+agKesit):(anaKesit||agKesit);\n        var kd=String(lp.durum||lp.Durumu||'').toLocaleUpperCase('tr').replace(/\\s+/g,' ');\n        if(kesit&&(kd.indexOf('BYSK')>=0||kd.indexOf('BSYK')>=0)) kesit='['+kesit+']';\n        else if(kesit&&(kd.indexOf('YENİ')>=0||kd.indexOf('YENI')>=0)) kesit=kesit;\n        else if(kesit&&kd.indexOf('MEVCUT')>=0) kesit='('+kesit+')';\n      }\n"""
if old not in s: raise SystemExit('DXF fallback blogu bulunamadi')
s=s.replace(old,new2,1)
js.write_text(s,encoding='utf-8')
print('v16.47 patch OK')
