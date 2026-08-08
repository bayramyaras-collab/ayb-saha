from pathlib import Path
import re
p=Path('app/src/main/assets/AYB_Saha_Harita.html')
s=p.read_text(encoding='utf-8',errors='replace')

def rm(tag,idv,text):
    return re.sub(rf'<{tag}\s+id=["\']{re.escape(idv)}["\'][^>]*>.*?</{tag}>\s*','',text,flags=re.S|re.I)

s=rm('style','ayb_v28_same_program_mobile_css',s)
s=rm('script','ayb_v28_same_program_mobile_js',s)
s=re.sub(r'\s*<div\s+id=["\']aybV28MobileDock["\'][^>]*>.*?</div>\s*','\n',s,flags=re.S|re.I)
s=re.sub(r'\s*<div\s+id=["\']aybV28ExportSheet["\'][^>]*>.*?</div>\s*','\n',s,flags=re.S|re.I)
s=re.sub(r'\n\s*<div class="left-tools">.*?</div>','',s,flags=re.S)
s=re.sub(r'\n\s*<div class="floating-palette">.*?</div>','',s,flags=re.S)
s=s.replace("$('#btnGpsPoint').onclick=()=>locate(true);", "{const x=$('#btnGpsPoint');if(x)x.onclick=()=>locate(true);}")
s=s.replace("$('#btnCancelTool').onclick=finishCurrentOperation;", "{const x=$('#btnCancelTool');if(x)x.onclick=finishCurrentOperation;}")
old="""  if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',function(){setTimeout(init,500);});\n  if(typeof window!=='undefined'){ window.addEventListener('load',function(){ try{aybApplyMobileUI();}catch(e){} setTimeout(function(){try{aybApplyMobileUI();}catch(e){}},800); }); }\n  else setTimeout(init,500);\n  window.addEventListener('load',function(){setTimeout(init,800);});"""
new="""  if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',init,{once:true});\n  else init();\n  window.addEventListener('load',init,{once:true});"""
if old not in s: raise SystemExit('profesyonel arayuz init blogu bulunamadi')
s=s.replace(old,new,1)
s=s.replace(".ayb-saha-note-icon{width:34px;height:34px;background:#ffdc22;border:2px solid #8b6b00;border-radius:5px;position:relative;box-shadow:0 2px 5px rgba(0,0,0,.35)}", ".ayb-saha-note-icon{width:24px!important;height:24px!important;min-width:24px!important;min-height:24px!important;max-width:24px!important;max-height:24px!important;background:#ffdc22;border:2px solid #8b6b00;border-radius:4px;position:relative;box-shadow:0 1px 3px rgba(0,0,0,.30);transform:none!important;transform-origin:50% 50%!important}")
s=s.replace(".ayb-saha-note-icon:after{content:'';position:absolute;right:1px;top:1px;border-left:9px solid transparent;border-bottom:9px solid #fff59d}", ".ayb-saha-note-icon:after{content:'';position:absolute;right:1px;top:1px;border-left:7px solid transparent;border-bottom:7px solid #fff59d}")
s=s.replace(".ayb-saha-note-icon span,.ayb-saha-note-icon i,.ayb-saha-note-icon b{position:absolute;left:7px;right:7px;height:2px;background:#6b5200;border-radius:2px}", ".ayb-saha-note-icon span,.ayb-saha-note-icon i,.ayb-saha-note-icon b{position:absolute;left:5px;right:5px;height:2px;background:#6b5200;border-radius:2px}")
s=s.replace(".ayb-saha-note-icon span{top:13px} .ayb-saha-note-icon i{top:19px} .ayb-saha-note-icon b{top:25px}", ".ayb-saha-note-icon span{top:9px}.ayb-saha-note-icon i{top:14px}.ayb-saha-note-icon b{top:19px}")
anchor='function aybOpenSahaNotForm(latlng,existing){'
helper="""function aybSahaNotKaliciKaydet(){\n  try{saveProject();}catch(e){}\n  try{if(typeof aybDepoYaz==='function')aybDepoYaz();}catch(e){}\n  try{if(typeof saveProjects==='function')saveProjects();}catch(e){}\n}\nfunction aybSahaNotSilKalici(id){\n  if(!project||!Array.isArray(project.sahaNotes))return false;\n  const sid=String(id),arr=project.sahaNotes;let ix=-1;\n  for(let i=0;i<arr.length;i++){if(arr[i]&&String(arr[i].id)===sid){ix=i;break;}}\n  if(ix<0)return false;arr.splice(ix,1);aybSahaNotKaliciKaydet();try{renderAll();}catch(e){}return true;\n}\n"""
if helper not in s:s=s.replace(anchor,helper+anchor,1)
s=s.replace("const arr=aybSahaNotes(); if(!existing) arr.push(n); saveProject(); renderAll(); modal.remove(); setTool(null); toast('Saha notu kaydedildi.');", "const arr=aybSahaNotes(); if(!existing) arr.push(n); aybSahaNotKaliciKaydet(); renderAll(); modal.remove(); setTool(null); toast('Saha notu kaydedildi.');")
s=s.replace("project.sahaNotes=aybSahaNotes().filter(x=>String(x.id)!==String(n.id)); saveProject();renderAll();modal.remove();toast('Saha notu silindi.');", "if(aybSahaNotSilKalici(n.id)){modal.remove();toast('Saha notu silindi.');}")
marker_re=r"const icon=L\.divIcon\(\{className:'[^']*',html:aybSahaNotIconHtml\(\),iconSize:\[\d+,\d+\],iconAnchor:\[\d+,\d+\]\}\);\s*const m=L\.marker\(\[\+n\.lat,\+n\.lng\],\{icon,zIndexOffset:1100,riseOnHover:true(?:,keyboard:false)?\}\)\.addTo\(map\);"
marker_new="const icon=L.divIcon({className:'ayb-saha-note-leaflet',html:aybSahaNotIconHtml(),iconSize:[24,24],iconAnchor:[12,12]});\n  const m=L.marker([+n.lat,+n.lng],{icon,zIndexOffset:1100,riseOnHover:true,keyboard:false}).addTo(map);\n  try{m._zoomAnimated=false;}catch(e){}"
s,n=re.subn(marker_re,marker_new,s,count=1)
if n!=1:
    # Fallback: force inner visual size even if this source uses a different Leaflet marker declaration.
    s=s.replace("function aybSahaNotIconHtml(){return '<div class=\"ayb-saha-note-icon\"><span></span><i></i><b></b></div>';}", "function aybSahaNotIconHtml(){return '<div class=\"ayb-saha-note-icon\" style=\"width:24px!important;height:24px!important;transform:none!important\"><span></span><i></i><b></b></div>';}")
s=s.replace("window.aybSahaNotSil=function(id){const n=aybSahaNotById(id);if(!n)return;if(!confirm('Bu saha notu silinsin mi?'))return;project.sahaNotes=aybSahaNotes().filter(x=>String(x.id)!==String(id));saveProject();renderAll();toast('Saha notu silindi.');};", "window.aybSahaNotSil=function(id){const n=aybSahaNotById(id);if(!n)return;if(!confirm('Bu saha notu silinsin mi?'))return;if(aybSahaNotSilKalici(id))toast('Saha notu silindi.');};")
s=s.replace("['objects','lines','areas','freeLines','channels','rasters','cadLayers'].forEach(k=>{if(!Array.isArray(p[k])) p[k]=[]});", "['objects','lines','areas','freeLines','channels','sahaNotes','rasters','cadLayers'].forEach(k=>{if(!Array.isArray(p[k])) p[k]=[]});",1)
p.write_text(s,encoding='utf-8')
print('v16.57 clean patch OK')
