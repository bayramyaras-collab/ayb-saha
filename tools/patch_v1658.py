from pathlib import Path
import re

html=Path('app/src/main/assets/AYB_Saha_Harita.html')
js=Path('app/src/main/assets/ayb-tablet.js')
s=html.read_text(encoding='utf-8')

# Varsayilan ayarlar
s=s.replace('ayb_label_size_settings_v2','ayb_label_size_settings_v3')
s=s.replace("var DEFAULTS={direk:13,hat:13,metre:13,hatWeight:3,direkSymbol:70,trafoSymbol:200,kofreSymbol:100,otherSymbol:100,lambaSymbol:100,lambaText:100};",
            "var DEFAULTS={direk:16,hat:13,metre:13,hatWeight:3,direkSymbol:150,trafoSymbol:260,kofreSymbol:100,otherSymbol:115,lambaSymbol:100,lambaText:100};")
s=s.replace("['objects','lines','areas','freeLines','channels','rasters','cadLayers'].forEach(k=>{if(!Array.isArray(p[k])) p[k]=[]});",
            "['objects','lines','areas','freeLines','channels','sahaNotes','rasters','cadLayers'].forEach(k=>{if(!Array.isArray(p[k])) p[k]=[]});")

# Not marker kimligi
s=s.replace("function aybSahaNotIconHtml(){return '<div class=\"ayb-saha-note-icon\"><span></span><i></i><b></b></div>';}",
            "function aybSahaNotIconHtml(id){return '<div class=\"ayb-saha-note-icon\" data-saha-note-id=\"'+aybSahaNotEsc(id||'')+'\"><span></span><i></i><b></b></div>';}")
s=s.replace("html:aybSahaNotIconHtml(),iconSize:[34,34]","html:aybSahaNotIconHtml(n.id),iconSize:[34,34]")

# Notu proje govdesine + IndexedDB'ye aninda yaz, marker kaybolursa tekrar ciz
pat=re.compile(r"modal\.querySelector\('#aybNotKaydet'\)\.onclick=function\(\)\{n\.tur=.*?toast\('Saha notu kaydedildi\.'\);\};")
new="""modal.querySelector('#aybNotKaydet').onclick=function(){n.tur=tur.value||'Diğer';n.objeNo=modal.querySelector('#aybNotObje').value.trim();n.aciklama=modal.querySelector('#aybNotAcik').value.trim();n.foto=foto;n.updated=new Date().toISOString();n.lat=Number(n.lat);n.lng=Number(n.lng);if(!Number.isFinite(n.lat)||!Number.isFinite(n.lng)){toast('Not konumu geçersiz.');return;}const arr=aybSahaNotes();if(!existing&&!arr.some(x=>x&&String(x.id)===String(n.id)))arr.push(n);project.sahaNotes=arr;projects[project.id]=project;try{saveProject();}catch(e){console.warn('Not saveProject:',e);}try{if(typeof aybDepoYaz==='function')aybDepoYaz();}catch(e){console.warn('Not depo:',e);}try{renderAll();}catch(e){console.warn('Not render:',e);try{renderSahaNot(n);}catch(_){}}modal.remove();setTool(null);setTimeout(function(){try{var q=document.querySelector('.ayb-saha-note-icon[data-saha-note-id=\"'+String(n.id).replace(/\"/g,'')+'\"]');if(!q)renderSahaNot(n);}catch(e){}},80);toast('Saha notu kaydedildi.');};"""
s,n=pat.subn(new,s,count=1)
if n!=1: raise SystemExit('Saha notu kaydet blogu bulunamadi')

needle="window.aybSahaNotSil=function(id){const n=aybSahaNotById(id);if(!n)return;if(!confirm('Bu saha notu silinsin mi?'))return;project.sahaNotes=aybSahaNotes().filter(x=>String(x.id)!==String(id));saveProject();renderAll();toast('Saha notu silindi.');};"
if needle not in s: raise SystemExit('Saha notu sil fonksiyonu bulunamadi')
s=s.replace(needle,needle+"\nwindow.aybSahaNotGit=function(id){const n=aybSahaNotById(id);if(!n||!map)return;try{map.setView([+n.lat,+n.lng],Math.max(map.getZoom?map.getZoom():18,19),{animate:true});}catch(e){}try{L.popup({maxWidth:360,autoPan:true}).setLatLng([+n.lat,+n.lng]).setContent(aybSahaNotPopupHtml(n)).openOn(map);}catch(e){}try{const c=L.circleMarker([+n.lat,+n.lng],{radius:18,color:'#f59e0b',weight:4,fill:false,opacity:1}).addTo(map);let k=0;const iv=setInterval(function(){try{c.setRadius(18+(k%2?10:0));}catch(e){}if(++k>10){clearInterval(iv);try{map.removeLayer(c);}catch(e){}}},140);}catch(e){}};")
s=s.replace('<small>Hat</small>','<small>Havai Hat</small>',1)
s=s.replace('<small>Yer Altı</small>','<small>Yeraltı Hat</small>',1)
html.write_text(s,encoding='utf-8')

j=js.read_text(encoding='utf-8')
j=j.replace("var m={direk:'Direk',trafo:'Trafo',box:'Box',kofre:'Kofre',abone:'Abone',ekmuf:'Ek Muf'};", "var m={direk:'Direk',trafo:'Trafo',box:'Box',kofre:'Kofre',abone:'Abone',ekmuf:'Ek Muf',sahanot:'Not'};")
j=j.replace("var m={direk:'📍',trafo:'⚡',box:'🔲',kofre:'🗄️',abone:'🏠',ekmuf:'🔗'};", "var m={direk:'📍',trafo:'⚡',box:'🔲',kofre:'🗄️',abone:'🏠',ekmuf:'🔗',sahanot:'📝'};")

pat2=re.compile(r"  function results\(\)\{.*?\n  \}\n\n  function highlight",re.S)
m=pat2.search(j)
if not m: raise SystemExit('Bul results blogu bulunamadi')
res="""  function results(){
    var p=window.project; if(!p) return [];
    var q=low(curQuery).trim(), out=[];
    if(Array.isArray(p.objects) && curType!=='sahanot'){
      p.objects.forEach(function(o){if(!o||o.lat==null)return;if(curTrafo){if(o.type!==\"direk\")return;var tn=low(o.props&&(o.props.trafo_no||o.props.baslangic_trafo_no||o.props.enerji_direk_no));if(tn!==low(curTrafo))return;}else if(curType!==\"all\"&&o.type!==curType)return;var no=objNo(o),tip=objTip(o);if(!curTrafo&&q){var hay=low(no+\" \"+tip+\" \"+tLabel(o.type)+\" \"+(o.props&&o.props.trafo_no||\"\"));if(hay.indexOf(q)<0)return;}out.push({o:o,no:no,tip:tip,type:o.type});});
    }
    if(!curTrafo&&(curType==='all'||curType==='sahanot')&&Array.isArray(p.sahaNotes)){
      p.sahaNotes.forEach(function(n){if(!n||!isFinite(+n.lat)||!isFinite(+n.lng))return;var no=String(n.objeNo||n.id||''),tip=String(n.tur||'Saha Notu');var hay=low('not '+no+' '+tip+' '+String(n.aciklama||''));if(q&&hay.indexOf(q)<0)return;out.push({o:{lat:+n.lat,lng:+n.lng},no:no||'—',tip:tip,type:'sahanot',id:n.id,n:n});});
    }
    out.sort(function(a,b){if(a.type!==b.type)return a.type<b.type?-1:1;return String(a.no).localeCompare(String(b.no),'tr',{numeric:true});});return out.slice(0,400);
  }

  function highlight"""
j=j[:m.start()]+res+j[m.end():]
j=j.replace("row.addEventListener(\"click\", function(e){ if(e.target && e.target.classList.contains(\"aybBulBagli\")) return; var i=+row.getAttribute(\"data-i\"); var r=box._rs[i]; if(r) flyTo(r.o); });",
            "row.addEventListener(\"click\", function(e){ if(e.target && e.target.classList.contains(\"aybBulBagli\")) return; var i=+row.getAttribute(\"data-i\"); var r=box._rs[i]; if(!r)return; if(r.type==='sahanot'&&window.aybSahaNotGit) window.aybSahaNotGit(r.id); else flyTo(r.o); });")
j=j.replace("+'<button class=\"aybBulChip\" data-t=\"box\" style=\"border:none;border-radius:14px;padding:4px 10px;font-size:12px;font-weight:700;cursor:pointer;\">Box</button>'\n          +'<button class=\"aybBulChip\" data-t=\"kofre\"",
            "+'<button class=\"aybBulChip\" data-t=\"box\" style=\"border:none;border-radius:14px;padding:4px 10px;font-size:12px;font-weight:700;cursor:pointer;\">Box</button>'\n          +'<button class=\"aybBulChip\" data-t=\"sahanot\" style=\"border:none;border-radius:14px;padding:4px 10px;font-size:12px;font-weight:700;cursor:pointer;\">📝 Not</button>'\n          +'<button class=\"aybBulChip\" data-t=\"kofre\"")
j=j.replace('placeholder=\"No veya tip yaz (örn: 12, TR01, box)\"','placeholder=\"No, tip veya not yaz (örn: D-20, TR01, lambası yanmıyor)\"')
j=j.replace("ref.parentNode.insertBefore(b,ref.nextSibling); return true;","ref.parentNode.insertBefore(b,ref); return true;")

j += r'''
/* === v16.58: Çizim Araçları sırası sabit === */
(function(){function fix(){var row=document.querySelector('.ayb-pro-group.draw .ayb-pro-row');if(!row)return false;var find=function(sel){return row.querySelector(sel)||document.querySelector(sel)};var order=['[data-tool="direk"]','[data-tool="trafo"]','[data-tool="yeraltihat"]','[data-tool="hat"]','[data-tool="abonehat"]','[data-tool="kanal"]','[data-tool="kofre"]','[data-tool="bina"]','[data-tool="box"]','[data-tool="sahanot"]','#aybYolOlcBtn','#kfMeasureToolBtn','[data-tool="cizgi"]','[data-tool="ok"]','#aybTopluSilBtn'];order.forEach(function(sel){var el=find(sel);if(el&&el.parentNode===row)row.appendChild(el);});var h=row.querySelector('[data-tool="hat"] small');if(h)h.textContent='Havai Hat';var y=row.querySelector('[data-tool="yeraltihat"] small');if(y)y.textContent='Yeraltı Hat';return true;}var tries=0,iv=setInterval(function(){fix();if(++tries>80)clearInterval(iv);},250);document.addEventListener('DOMContentLoaded',fix);try{new MutationObserver(function(){fix();}).observe(document.documentElement,{childList:true,subtree:true});}catch(e){}})();
'''
js.write_text(j,encoding='utf-8')
print('v16.58 patch OK')
