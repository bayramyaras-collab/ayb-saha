from pathlib import Path
import re

html=Path('app/src/main/assets/AYB_Saha_Harita.html')
s=html.read_text(encoding='utf-8')
needle='.sym-label-trafo{top:56px!important}'
style=(needle+
       '.sym-label-trafo span{background:transparent!important;border:0!important;border-radius:0!important;box-shadow:none!important;'
       'padding:0 2px!important;margin-top:1px!important;color:#fff!important;'
       'text-shadow:-1px -1px 0 #000,1px -1px 0 #000,-1px 1px 0 #000,1px 1px 0 #000,0 0 4px #000!important}')
if style not in s:
    if needle not in s: raise SystemExit('sym-label-trafo CSS bulunamadi')
    s=s.replace(needle,style,1)
html.write_text(s,encoding='utf-8')

p=Path('app/src/main/assets/ayb-label-screen.js')
s=p.read_text(encoding='utf-8')

obj_block="""  var objectOffsets=(function(){
    var out=[[0,0]], rings=[16,30,46,64,84,106], dirs=[[0,-1],[1,0],[0,1],[-1,0],[1,-1],[1,1],[-1,1],[-1,-1]];
    rings.forEach(function(r){dirs.forEach(function(d){out.push([d[0]*r,d[1]*r])})});
    return out;
  })();
"""
trafo_block=obj_block+"""  var trafoOffsets=(function(){
    /* Trafo etiketi uzun olabildiği için daha geniş çevrede boş yer aranır. */
    var out=[[0,0]], rings=[18,34,52,72,96,124,154,188], dirs=[[0,-1],[1,0],[0,1],[-1,0],[1,-1],[1,1],[-1,1],[-1,-1]];
    rings.forEach(function(r){dirs.forEach(function(d){out.push([d[0]*r,d[1]*r])})});
    return out;
  })();
"""
if 'var trafoOffsets=' not in s:
    if obj_block not in s: raise SystemExit('objectOffsets blogu bulunamadi')
    s=s.replace(obj_block,trafo_block,1)

old="items.push({kind:'object',priority:o.type==='trafo'?0:1,sym:sym,label:label,el:label,baseDx:sym.__aybScreenBaseDx,baseDy:sym.__aybScreenBaseDy,obj:o});"
new="items.push({kind:'object',priority:o.type==='trafo'?5:1,sym:sym,label:label,el:label,baseDx:sym.__aybScreenBaseDx,baseDy:sym.__aybScreenBaseDy,obj:o});"
if old in s: s=s.replace(old,new,1)
elif new not in s: raise SystemExit('object priority satiri bulunamadi')

s=s.replace("items.push({kind:'line',priority:2,marker:pack.label,el:el,base:cloneLL(base)})","items.push({kind:'line',priority:0,marker:pack.label,el:el,base:cloneLL(base)})",1)
s=s.replace("items.push({kind:'region',priority:3,marker:pack.region,el:re,base:cloneLL(rb)})","items.push({kind:'region',priority:0,marker:pack.region,el:re,base:cloneLL(rb)})",1)
s=s.replace("items.push({kind:'channel',priority:4,marker:mk,el:el,base:cloneLL(mk.__aybScreenBaseLatLng)})","items.push({kind:'channel',priority:0,marker:mk,el:el,base:cloneLL(mk.__aybScreenBaseLatLng)})",1)

oldc="var it=measured[n],cands=it.kind==='object'?objectOffsets:lineOffsets,best=null;"
newc="var it=measured[n],cands=it.kind==='object'?(it.obj&&it.obj.type==='trafo'?trafoOffsets:objectOffsets):lineOffsets,best=null;"
if oldc in s: s=s.replace(oldc,newc,1)
elif newc not in s: raise SystemExit('candidate satiri bulunamadi')

oldh="var mustHide=best&&best.ov>0&&it.priority>0;"
newh="var mustHide=best&&best.ov>0&&it.priority>0&&!(it.kind==='object'&&it.obj&&it.obj.type==='trafo');"
if oldh in s: s=s.replace(oldh,newh,1)
elif newh not in s: raise SystemExit('mustHide satiri bulunamadi')

p.write_text(s,encoding='utf-8')
print('v16.52 trafo label patch OK')
