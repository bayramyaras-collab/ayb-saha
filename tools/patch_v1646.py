from pathlib import Path
p=Path('app/src/main/assets/ayb-tablet.js')
s=p.read_text(encoding='utf-8')
old="s+=g(0,'SECTION')+g(2,'HEADER')+g(9,'$ACADVER')+g(1,'AC1018')+g(9,'$INSUNITS')+g(70,'6')+g(9,'$PDMODE')+g(70,'34')+g(9,'$PDSIZE')+g(40,'-2.0');"
new="s+=g(0,'SECTION')+g(2,'HEADER')+g(9,'$ACADVER')+g(1,'AC1009')+g(9,'$PDMODE')+g(70,'34')+g(9,'$PDSIZE')+g(40,'-2.0');"
if old not in s: raise SystemExit('AC1018 header pattern not found')
s=s.replace(old,new,1)
old="var s=g(0,'POLYLINE')+g(8,katman)+(ltype?g(6,ltype):'')+(renk!=null?g(62,String(renk)):'')+(lw!=null?g(370,String(lw)):'')+g(66,'1')+g(70,kapali?'1':'0')+g(10,'0.0')+g(20,'0.0')+g(30,'0.0');"
new="var s=g(0,'POLYLINE')+g(8,katman)+(ltype?g(6,ltype):'')+(renk!=null?g(62,String(renk)):'')+g(66,'1')+g(70,kapali?'1':'0')+g(10,'0.0')+g(20,'0.0')+g(30,'0.0');"
if old not in s: raise SystemExit('POLYLINE 370 pattern not found')
s=s.replace(old,new,1)
old="return g(0,'LINE')+g(8,katman)+(ltype?g(6,ltype):'')+(renk!=null?g(62,String(renk)):'')+(lw!=null?g(370,String(lw)):'')"
new="return g(0,'LINE')+g(8,katman)+(ltype?g(6,ltype):'')+(renk!=null?g(62,String(renk)):'')"
if old not in s: raise SystemExit('LINE 370 pattern not found')
s=s.replace(old,new,1)
s=s.replace('function uret(){','/* v16.46: strict AC1009/R12 — AutoCAD APPID table uyumsuzluğu giderildi */\n  function uret(){',1)
p.write_text(s,encoding='utf-8')
print('v16.46 DXF patch OK')
