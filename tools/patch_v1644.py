from pathlib import Path
p=Path('app/src/main/assets/ayb-tablet.js')
s=p.read_text(encoding='utf-8')
orig=s

def rep(old,new,label,count=1):
    global s
    if old not in s:
        raise SystemExit(f'{label} missing')
    s=s.replace(old,new,count)
    print('patched',label)

rep("s+=g(50,(aci?(+aci):0).toFixed(2))+g(7,stil||'Standard');",
    "var st=(!stil||stil==='Standard')?'Arial':stil; /* tüm normal etiketler gerçek Arial */\n    s+=g(50,(aci?(+aci):0).toFixed(2))+g(7,st);",
    'txt Arial')

rep("  function KAT(){\n",
"""  function aybDxfAciFromColor(color,fallback){
    var c=String(color||'').toLowerCase().replace(/\\s+/g,'');
    var m={'#1f7f00':84,'#1aa260':84,'#008000':84,'#ff0000':1,'#dc2626':1,
           '#00ffff':4,'#06b6d4':4,'#00b8b8':4,'#ff00ff':6,'#0000ff':5,
           '#ffff00':2,'#f59e0b':2,'#b58900':2};
    return m[c]!=null?m[c]:(fallback==null?7:fallback);
  }
  function aybDxfLineweight(px){
    var n=Math.max(1,Math.min(9,Number(px)||3));
    var tab=[13,18,25,30,35,40,50,60,70];
    return tab[Math.max(0,Math.min(tab.length-1,Math.round(n)-1))];
  }
  function aybDxfLtypeFromDash(dash){
    var d=String(dash||'').replace(/,/g,' ').replace(/\\s+/g,' ').trim();
    if(!d) return null;
    if(/^3(?:\\.0+)? 8(?:\\.0+)?$/.test(d)) return 'AYB_SEYREK';
    return 'AYB_KESIK';
  }

  function KAT(){
""",'style helpers')

old_l="s+=g(0,'TABLE')+g(2,'LTYPE')+g(70,'2')+g(0,'LTYPE')+g(2,'CONTINUOUS')+g(70,'0')+g(3,'Solid line')+g(72,'65')+g(73,'0')+g(40,'0.0')+g(0,'LTYPE')+g(2,'DASHED')+g(70,'0')+g(3,'Dashed line')+g(72,'65')+g(73,'2')+g(40,'1.2')+g(49,'0.8')+g(49,'-0.4')+g(0,'ENDTAB');"
new_l="""s+=g(0,'TABLE')+g(2,'LTYPE')+g(70,'3')
      +g(0,'LTYPE')+g(2,'CONTINUOUS')+g(70,'0')+g(3,'Solid line')+g(72,'65')+g(73,'0')+g(40,'0.0')
      +g(0,'LTYPE')+g(2,'AYB_KESIK')+g(70,'0')+g(3,'AYB dashed 7-5')+g(72,'65')+g(73,'2')+g(40,'1.20')+g(49,'0.72')+g(49,'-0.48')
      +g(0,'LTYPE')+g(2,'AYB_SEYREK')+g(70,'0')+g(3,'AYB sparse dashed 3-8')+g(72,'65')+g(73,'2')+g(40,'1.65')+g(49,'0.45')+g(49,'-1.20')
      +g(0,'ENDTAB');"""
rep(old_l,new_l,'LTYPE table')

rep("s+=g(0,'TABLE')+g(2,'STYLE')+g(70,'2');",
    "s+=g(0,'TABLE')+g(2,'STYLE')+g(70,'3');\n    s+=g(0,'STYLE')+g(2,'Arial')+g(70,'0')+g(40,'0.0')+g(41,'1.0')+g(50,'0.0')+g(71,'0')+g(42,'2.5')+g(3,'arial.ttf')+g(4,'');",
    'Arial style table')

start=s.find("    var anaBoy=p.ana.length>=3?58:(p.ana.length===2?72:84);", s.find('function svgHazirla'))
end=s.find("    return svg;", start)
if start<0 or end<0: raise SystemExit('road UI bounds missing')
new_ui="""    var anaBoy=p.ana.length>=3?58:(p.ana.length===2?72:84);
    var ondBoy=p.ana.length>=3?24:(p.ana.length===2?28:30);
    /* Tam sayı + ondalık grubu dairenin tam merkezine göre hesaplanır. */
    var anaW=anaBoy*0.56*Math.max(1,p.ana.length), ondW=ondBoy*0.56*Math.max(2,p.ond.length), gap=8;
    var bas=110-(anaW+gap+ondW)/2, anaX=bas+anaW, ondX=anaX+gap, altSon=ondX+ondW;
    svg.setAttribute('viewBox','0 0 220 220'); svg.setAttribute('preserveAspectRatio','xMidYMid meet'); svg.setAttribute('class','ayb-yol-olcu-svg');
    svg.setAttribute('role','button'); svg.setAttribute('aria-label','Yol genişliği '+metreMetni(r.value_m)+'. Düzenlemek için tıklayın.');
    svg.innerHTML='<title>Yol genişliği: '+esc(metreMetni(r.value_m))+' — düzenlemek için tıkla</title>'+ 
      '<text class=\"ayb-yol-ana\" x=\"'+anaX.toFixed(1)+'\" y=\"143\" text-anchor=\"end\" font-size=\"'+anaBoy+'\">'+esc(p.ana)+'</text>'+ 
      '<text class=\"ayb-yol-ond\" x=\"'+ondX.toFixed(1)+'\" y=\"100\" text-anchor=\"start\" font-size=\"'+ondBoy+'\">'+esc(p.ond)+'</text>'+ 
      '<line class=\"ayb-yol-alt-koyu\" x1=\"'+ondX.toFixed(1)+'\" y1=\"109\" x2=\"'+altSon.toFixed(1)+'\" y2=\"109\"></line>'+ 
      '<line class=\"ayb-yol-alt\" x1=\"'+ondX.toFixed(1)+'\" y1=\"109\" x2=\"'+altSon.toFixed(1)+'\" y2=\"109\"></line>';
"""
s=s[:start]+new_ui+s[end:]
print('patched road UI center')

r0=s.find("      var hAna=Math.max(1.00,yaricap*(String(ana).length>=3?0.50:(String(ana).length===2?0.60:0.66)));", s.find('(p.yolOlculeri||[]).forEach'))
r1=s.find("      s+=daireEnt('YOL_OLCU'", r0)
if r0<0 or r1<0: raise SystemExit('road DXF center bounds missing')
new_road="""      var hAna=Math.max(1.00,yaricap*(String(ana).length>=3?0.50:(String(ana).length===2?0.60:0.66)));
      var hOnd=Math.max(0.56,Math.min(hAna*0.32,yaricap*0.22));
      var anaW=hAna*0.56*Math.max(1,String(ana).length), ondW=hOnd*0.56*2;
      var bosluk=Math.max(0.14,hOnd*0.18), toplamW=anaW+bosluk+ondW;
      var basX=yc.y-toplamW/2, anaX=basX+anaW, ondX=anaX+bosluk;
      var anaY=yc.x, ondY=yc.x+hAna*0.28;
      var altY=yc.x+hAna*0.04;
"""
s=s[:r0]+new_road+s[r1:]
print('patched road DXF center')

rep("var koord={}, minY=Infinity, minX=Infinity, maxY=-Infinity, maxX=-Infinity;",
    "var koord={}, minY=Infinity, minX=Infinity, maxY=-Infinity, maxX=-Infinity;\n    var trafoEtiketUst=''; /* DXF draw order: trafo etiketi hatlardan sonra */",
    'trafo label queue')

rep("if(trBina){ s+=txtEnt('TRAFO_ETIKET',c.y,trY,trBinaH,trBina,'Standard',5,0,1,2); say.t++; trY-=1.65; }",
    "if(trBina){ trafoEtiketUst+=txtEnt('TRAFO_ETIKET',c.y,trY,trBinaH,trBina,'Arial',5,0,1,2); say.t++; trY-=1.65; }",
    'trafo type top')
rep("if(trBaslik){ s+=txtEnt('TRAFO_ETIKET',c.y,trY,1.45,trBaslik,'Standard',5,0,1,2); say.t++; trY-=1.65; }",
    "if(trBaslik){ trafoEtiketUst+=txtEnt('TRAFO_ETIKET',c.y,trY,1.45,trBaslik,'Arial',5,0,1,2); say.t++; trY-=1.65; }",
    'trafo name top')
rep("if(trGuc){ s+=txtEnt('TRAFO_ETIKET',c.y,trY,1.30,trGuc,'Standard',5,0,1,2); say.t++; }",
    "if(trGuc){ trafoEtiketUst+=txtEnt('TRAFO_ETIKET',c.y,trY,1.30,trGuc,'Arial',5,0,1,2); say.t++; }",
    'trafo power top')

old_style="""      var renkH=({AG:84,OG:1,AYD:4,ENH:6,ABONE:2,BOX:5})[genelH]||84;
      var ltH=(yerH||ilerdeH)?'DASHED':null;
      var lwH=(genelH==='OG'||genelH==='ENH')?35:null;
"""
new_style="""      var varsRenk=({AG:84,OG:1,AYD:4,ENH:6,ABONE:2,BOX:5})[genelH]||84;
      var ekranStil=null;
      try{ if(typeof window.aybLineVisualStyle==='function') ekranStil=window.aybLineVisualStyle(l); }catch(e){}
      var renkH=aybDxfAciFromColor(ekranStil&&ekranStil.color,varsRenk);
      var ltH=aybDxfLtypeFromDash(ekranStil&&ekranStil.dashArray);
      if(!ekranStil) ltH=(yerH||ilerdeH)?(ilerdeH?'AYB_SEYREK':'AYB_KESIK'):null;
      var lwH=aybDxfLineweight(ekranStil&&ekranStil.weight!=null?ekranStil.weight:((genelH==='OG'||genelH==='ENH')?4:3));
"""
rep(old_style,new_style,'line screen style')

rep("    (p.channels||[]).forEach(function(c2){",
    "    /* Trafo etiketi hatların üstünde / en üst draw-order. */\n    s+=trafoEtiketUst;\n    (p.channels||[]).forEach(function(c2){",
    'emit trafo labels after lines')

if s==orig: raise SystemExit('nothing changed')
p.write_text(s,encoding='utf-8')
print('DONE',len(orig),len(s))
