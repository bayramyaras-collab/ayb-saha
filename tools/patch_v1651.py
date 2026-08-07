from pathlib import Path
import re

html=Path('app/src/main/assets/AYB_Saha_Harita.html')
s=html.read_text(encoding='utf-8')
start=s.find('function getLineDisplayText(line)')
end=s.find('function getLineLabelScale()', start)
if start < 0 or end < 0:
    raise SystemExit('getLineDisplayText blogu bulunamadi')
new="""function getLineDisplayText(line){
  const p=line?.props||{};
  const main=(p.main_hat_tipi||p.og_hat_tipi||p.hat_tipi||'').trim();
  const ag=(p.ag_hat_aktif?(p.ag_hat_tipi||'').trim():'');
  let base='';
  if(main&&ag) base=main+'+'+ag; else base=main||ag||(p.hat_tipi||p.tip||'Hat');
  const d=String(p.durum||p.Durumu||'').toLocaleUpperCase('tr').replace(/\\s+/g,' ');
  if(d.includes('BYSK')||d.includes('BSYK')) return '['+base+']';
  if(d.includes('YENİ')||d.includes('YENI')) return base;
  if(d.includes('MEVCUT')) return '('+base+')';
  return base;
}
"""
s=s[:start]+new+s[end:]
if '})+(${ag})`' in s:
    raise SystemExit('eski bozuk getLineDisplayText parcasi kaldi')
html.write_text(s,encoding='utf-8')

# Surum
gradle=Path('app/build.gradle')
g=gradle.read_text(encoding='utf-8')
g,n1=re.subn(r'(?m)^(\s*)versionCode\s+\d+\s*$',r'\1versionCode 1651',g,count=1)
g,n2=re.subn(r'(?m)^(\s*)versionName\s+"[^"]+"\s*$',r'\1versionName "16.51"',g,count=1)
if n1!=1 or n2!=1:
    raise SystemExit('surum satiri bulunamadi')
gradle.write_text(g,encoding='utf-8')

# Ana uygulama scriptini ayikla; workflow node --check ile GERCEK ana motoru kontrol edecek.
s=html.read_text(encoding='utf-8')
pos=s.find('function getLineDisplayText(line)')
a=s.rfind('<script',0,pos)
gt=s.find('>',a)
b=s.find('</script>',pos)
if min(a,gt,b) < 0:
    raise SystemExit('ana script ayiklanamadi')
Path('/tmp/ayb_core_v1651.js').write_text(s[gt+1:b],encoding='utf-8')
print('v16.51 core syntax patch OK')
