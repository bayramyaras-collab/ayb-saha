from pathlib import Path
import re

p = Path('app/src/main/assets/ayb-tablet.js')
s = p.read_text(encoding='utf-8')

old = "s+=g(0,'SECTION')+g(2,'HEADER')+g(9,'$ACADVER')+g(1,'AC1009')+g(9,'$INSUNITS')+g(70,'6')"
new = "s+=g(0,'SECTION')+g(2,'HEADER')+g(9,'$ACADVER')+g(1,'AC1018')+g(9,'$INSUNITS')+g(70,'6')"
if old in s:
    s = s.replace(old, new, 1)
elif "g(1,'AC1018')" not in s:
    raise SystemExit('ACADVER bulunamadi')

old = """  function cizgiEnt(katman,a,b,ltype,renk){\n    return g(0,'LINE')+g(8,katman)+(ltype?g(6,ltype):'')+(renk?g(62,renk):'')\n      +g(10,a.y.toFixed(3))+g(20,a.x.toFixed(3))+g(30,'0.0')\n      +g(11,b.y.toFixed(3))+g(21,b.x.toFixed(3))+g(31,'0.0');\n  }\n"""
new = """  function cizgiEnt(katman,a,b,ltype,renk,lw){\n    return g(0,'LINE')+g(8,katman)+(ltype?g(6,ltype):'')+(renk!=null?g(62,String(renk)):'')+(lw!=null?g(370,String(lw)):'')\n      +g(10,a.y.toFixed(3))+g(20,a.x.toFixed(3))+g(30,'0.0')\n      +g(11,b.y.toFixed(3))+g(21,b.x.toFixed(3))+g(31,'0.0');\n  }\n"""
if old in s:
    s = s.replace(old, new, 1)
elif "function cizgiEnt(katman,a,b,ltype,renk,lw)" not in s:
    raise SystemExit('cizgiEnt bulunamadi')

old = """      var kat='HAT_'+genelH+'_'+(yerH?'YERALTI':'HAVAI')+'_'+bproDurumAdiHat((l.props||{}).durum||'');\n      s+=polyEnt(kat, pts, false, ltH, renkH, lwH); say.l++;\n"""
new = """      var kat='HAT_'+genelH+'_'+(yerH?'YERALTI':'HAVAI')+'_'+bproDurumAdiHat((l.props||{}).durum||'');\n      /* AutoCAD 2004: her hat kirimi gercek LINE entity. */\n      for(var hi=0;hi<pts.length-1;hi++){\n        s+=cizgiEnt(kat,pts[hi],pts[hi+1],ltH,renkH,lwH); say.l++;\n      }\n"""
if old in s:
    s = s.replace(old, new, 1)
elif "for(var hi=0;hi<pts.length-1;hi++)" not in s:
    raise SystemExit('hat LINE donusumu bulunamadi')

old = """    /* Trafo etiketi hatların üstünde / en üst draw-order. */\n    s+=trafoEtiketUst;\n    (p.channels||[]).forEach(function(c2){ if(!c2||!c2.points) return; var pts=[]; c2.points.forEach(function(q){ var t2=tm(q[0],q[1]); if(t2) pts.push({y:t2.y,x:t2.x}); }); if(pts.length>1){ s+=polyEnt('KANAL',pts,false); say.l++; } });\n    (p.freeLines||[]).forEach(function(c2){ if(!c2||!c2.points) return; var pts=[]; c2.points.forEach(function(q){ var t2=tm(q[0],q[1]); if(t2) pts.push({y:t2.y,x:t2.x}); }); if(pts.length>1){ s+=polyEnt('CIZGI',pts,false); say.l++; } });\n    (p.areas||[]).forEach(function(c2){ if(!c2||!c2.points) return; var pts=[]; c2.points.forEach(function(q){ var t2=tm(q[0],q[1]); if(t2) pts.push({y:t2.y,x:t2.x}); }); if(pts.length>2){ s+=polyEnt('ALAN',pts,true); say.l++; } });\n    s+=g(0,'ENDSEC')+g(0,'EOF');\n"""
new = """    (p.channels||[]).forEach(function(c2){ if(!c2||!c2.points) return; var pts=[]; c2.points.forEach(function(q){ var t2=tm(q[0],q[1]); if(t2) pts.push({y:t2.y,x:t2.x}); }); if(pts.length>1){ s+=polyEnt('KANAL',pts,false); say.l++; } });\n    (p.freeLines||[]).forEach(function(c2){ if(!c2||!c2.points) return; var pts=[]; c2.points.forEach(function(q){ var t2=tm(q[0],q[1]); if(t2) pts.push({y:t2.y,x:t2.x}); }); if(pts.length>1){ s+=polyEnt('CIZGI',pts,false); say.l++; } });\n    (p.areas||[]).forEach(function(c2){ if(!c2||!c2.points) return; var pts=[]; c2.points.forEach(function(q){ var t2=tm(q[0],q[1]); if(t2) pts.push({y:t2.y,x:t2.x}); }); if(pts.length>2){ s+=polyEnt('ALAN',pts,true); say.l++; } });\n    /* Trafo etiketi tum geometrilerden sonra: en ust draw-order. */\n    s+=trafoEtiketUst;\n    s+=g(0,'ENDSEC')+g(0,'EOF');\n"""
if old in s:
    s = s.replace(old, new, 1)
elif "Trafo etiketi tum geometrilerden sonra" not in s:
    raise SystemExit('trafo draw order bulunamadi')

p.write_text(s, encoding='utf-8')

b = Path('app/build.gradle')
g = b.read_text(encoding='utf-8')
g, n1 = re.subn(r'(?m)^(\s*)versionCode\s+\d+\s*$', r'\1versionCode 1645', g, count=1)
g, n2 = re.subn(r'(?m)^(\s*)versionName\s+"[^"]+"\s*$', r'\1versionName "16.45"', g, count=1)
if n1 != 1 or n2 != 1:
    raise SystemExit('surum satiri bulunamadi')
b.write_text(g, encoding='utf-8')
