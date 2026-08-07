from pathlib import Path
import re

p=Path('app/src/main/assets/AYB_Saha_Harita.html')
s=p.read_text(encoding='utf-8')

# v16.54 varsayilanlar + program geneli etikette kutu/zemin yok
repls={
'--ayb-direk-font:13px;':'--ayb-direk-font:16px;',
'--ayb-hat-metre-font:12px;':'--ayb-hat-metre-font:13px;',
'--ayb-trafo-symbol-scale:2;':'--ayb-trafo-symbol-scale:2.6;',
'--ayb-other-symbol-scale:1;':'--ayb-other-symbol-scale:1.15;',
'.sym-label span{display:block;background:rgba(15,23,42,.82);border:1px solid rgba(255,255,255,.6);border-radius:5px;margin-top:1px;padding:1px 4px}':'.sym-label span{display:block;background:transparent!important;border:none!important;border-radius:0!important;box-shadow:none!important;margin-top:1px;padding:0!important}.sym-label,.sym-label-trafo,.line-label,.line-label-main,.line-label-sub,.line-region-row{text-shadow:-1px -1px 0 #000,1px -1px 0 #000,-1px 1px 0 #000,1px 1px 0 #000,0 0 3px rgba(0,0,0,.9)!important}',
'.ayb-hat-flat-main{display:block;font-size:var(--hf,13px);background:rgba(15,23,42,.85);border:1px solid rgba(255,255,255,.6);border-radius:5px;padding:1px 6px}':'.ayb-hat-flat-main{display:block;font-size:var(--hf,13px);background:transparent!important;border:none!important;border-radius:0!important;box-shadow:none!important;padding:0!important}',
'.ayb-hat-flat-sub{display:block;font-size:var(--mf,12px);background:rgba(15,23,42,.85);border:1px solid rgba(255,255,255,.6);border-radius:5px;padding:1px 6px;margin-top:2px}':'.ayb-hat-flat-sub{display:block;font-size:var(--mf,12px);background:transparent!important;border:none!important;border-radius:0!important;box-shadow:none!important;padding:0!important;margin-top:2px}',
'.line-region-text{font-size:10px;line-height:1;padding:2px 6px;border-radius:4px;border:1px solid rgba(255,255,255,.65);background:rgba(15,23,42,.78);letter-spacing:.5px}':'.line-region-text{font-size:10px;line-height:1;padding:0!important;border-radius:0!important;border:none!important;background:transparent!important;box-shadow:none!important;letter-spacing:.5px}',
'.ayb-lamp-watt{position:absolute;left:50%;transform:translateX(-50%);font:700 12px/1 system-ui,Arial;color:#fde047;background:rgba(0,0,0,.78);padding:2px 5px;border-radius:4px;white-space:nowrap;pointer-events:none}':'.ayb-lamp-watt{position:absolute;left:50%;transform:translateX(-50%);font:700 12px/1 system-ui,Arial;color:#fde047;background:transparent!important;padding:0!important;border-radius:0!important;box-shadow:none!important;text-shadow:-1px -1px 0 #000,1px -1px 0 #000,-1px 1px 0 #000,1px 1px 0 #000,0 0 3px #000;white-space:nowrap;pointer-events:none}',
"'ayb_label_size_settings_v1'":"'ayb_label_size_settings_v2'",
'var DEFAULTS={direk:13,hat:13,metre:13,hatWeight:3,direkSymbol:150,trafoSymbol:200,kofreSymbol:100,otherSymbol:100,lambaSymbol:100,lambaText:100};':'var DEFAULTS={direk:16,hat:13,metre:13,hatWeight:3,direkSymbol:150,trafoSymbol:260,kofreSymbol:100,otherSymbol:115,lambaSymbol:100,lambaText:100};',
'return {direk:13,hat:13,metre:13,hatWeight:3,direkSymbol:150,trafoSymbol:200,kofreSymbol:100,otherSymbol:100,lambaSymbol:100,lambaText:100};':'return {direk:16,hat:13,metre:13,hatWeight:3,direkSymbol:150,trafoSymbol:260,kofreSymbol:100,otherSymbol:115,lambaSymbol:100,lambaText:100};',
'const s={direk:13,hat:13,metre:13,hatWeight:3,direkSymbol:150,trafoSymbol:200,kofreSymbol:100,otherSymbol:100,lambaSymbol:100,lambaText:100};':'const s={direk:16,hat:13,metre:13,hatWeight:3,direkSymbol:150,trafoSymbol:260,kofreSymbol:100,otherSymbol:115,lambaSymbol:100,lambaText:100};',
'Varsayılan 0.75 m':'Varsayılan 2.25 m'
}
for a,b in repls.items(): s=s.replace(a,b)

old="""function aybBindVertexHover(poly,group){
  if(!poly||!group||!group.length) return;
  let inside=false;
  const show=()=>{inside=true; aybSetVertexGroupVisible(group,true);};
  const hide=()=>{setTimeout(()=>{if(!inside) aybSetVertexGroupVisible(group,false);},120);};
  poly.on('mouseover',show); poly.on('mouseout',()=>{inside=false; hide();});
  group.forEach(m=>{
    m.on('mouseover',show);
    m.on('mouseout',()=>{inside=false; hide();});
    m.on('dragstart',show);
    m.on('dragend',()=>{inside=false; hide();});
  });
  aybSetVertexGroupVisible(group,false);
}
"""
new=old.replace("if(!inside) aybSetVertexGroupVisible(group,false);","if(!inside&&!poly.__aybKeepHandles) aybSetVertexGroupVisible(group,false);").replace("aybSetVertexGroupVisible(group,false);\n}","aybSetVertexGroupVisible(group,!!poly.__aybKeepHandles);\n}")
if old not in s: raise SystemExit('aybBindVertexHover bulunamadi')
s=s.replace(old,new,1)

anchor='function aybRenderLineVertexHandles(line,pts,poly,label){\n'
insert=r'''var __aybFreeGeometryLayers=window.__aybFreeGeometryLayers||new Map();
window.__aybFreeGeometryLayers=__aybFreeGeometryLayers;
function aybFreeArrowIcon(f,color){try{const pts=f&&f.points||[];if(pts.length<2)return null;const A=pts[pts.length-2],B=pts[pts.length-1];const la1=Array.isArray(A)?+A[0]:+A.lat,lo1=Array.isArray(A)?+A[1]:+A.lng,la2=Array.isArray(B)?+B[0]:+B.lat,lo2=Array.isArray(B)?+B[1]:+B.lng;const ang=Math.atan2(-(la2-la1),(lo2-lo1))*180/Math.PI;return L.divIcon({className:'',iconSize:[28,28],iconAnchor:[14,14],html:'<div style="transform:rotate('+ang+'deg);font-size:24px;line-height:28px;color:'+color+';text-shadow:0 0 2px #fff,0 0 2px #fff,0 0 2px #fff">➜</div>'});}catch(e){return null;}}
function aybDeactivateFreeGeometryEdit(exceptId){try{__aybFreeGeometryLayers.forEach(function(pk,id){if(exceptId!=null&&String(id)===String(exceptId))return;if(pk&&pk.poly){pk.poly.__aybKeepHandles=false;aybSetVertexGroupVisible(pk.handles,false);}});}catch(e){}}
function aybActivateFreeGeometryEdit(id){const pk=__aybFreeGeometryLayers.get(String(id));if(!pk){toast('Çizim köşeleri hazır değil. Haritayı bir kez yenile.');return;}aybDeactivateFreeGeometryEdit(id);pk.poly.__aybKeepHandles=true;aybSetVertexGroupVisible(pk.handles,true);try{map.closePopup();}catch(e){}hint('Köşe düzenleme aktif. Turuncu noktayı tutup istediğin yere sürükle.');toast('Köşeler aktif. Noktayı tutup sürükle.');}
function aybRenderFreeVertexHandles(item,kind,poly,hit,arrowMarker){if(!item||!poly||!Array.isArray(item.points))return;const group=[];item.points=item.points.map(aybNormalizeLinePoint).filter(p=>Number.isFinite(p[0])&&Number.isFinite(p[1]));item.points.forEach((pt,i)=>{const mk=L.marker([pt[0],pt[1]],{icon:aybVertexIcon(kind==='area'?'area':'freeLine'),draggable:true,zIndexOffset:950}).addTo(map);mk.on('click',e=>{if(e&&e.originalEvent){L.DomEvent.preventDefault(e.originalEvent);L.DomEvent.stopPropagation(e.originalEvent);}});mk.on('dragstart',()=>{poly.__aybKeepHandles=true;aybSetVertexGroupVisible(group,true);});mk.on('drag',e=>{const ll=e.target.getLatLng();item.points[i]=[ll.lat,ll.lng];poly.setLatLngs(item.points);if(hit&&hit.setLatLngs)hit.setLatLngs(item.points);if(arrowMarker&&item.kind==='ok'){const last=item.points[item.points.length-1];if(last)arrowMarker.setLatLng(last);const ic=aybFreeArrowIcon(item,'#fb923c');if(ic)arrowMarker.setIcon(ic);}});mk.on('dragend',()=>{saveProject();poly.__aybKeepHandles=true;aybSetVertexGroupVisible(group,true);toast(kind==='area'?'Bina / çokgen köşesi güncellendi.':'Çizgi köşesi güncellendi.');});otherLayers.push(mk);group.push(mk);});poly.__aybKeepHandles=false;aybBindVertexHover(poly,group);if(hit)aybBindVertexHover(hit,group);__aybFreeGeometryLayers.set(String(item.id),{item,kind,poly,hit,handles:group,arrowMarker});}
'''
if anchor not in s: raise SystemExit('vertex anchor bulunamadi')
s=s.replace(anchor,insert+anchor,1)

pat=re.compile(r"function renderFreeLine\(f\)\{.*?\n\}\nfunction updateSummary",re.S)
if not pat.search(s): raise SystemExit('renderFreeLine/renderArea bulunamadi')
replacement=r'''function renderFreeLine(f){const color=f.kind==='ok'?'#fb923c':'#f97316';f.points=(f.points||[]).map(aybNormalizeLinePoint).filter(p=>Number.isFinite(p[0])&&Number.isFinite(p[1]));if(f.points.length<2)return;const poly=L.polyline(f.points,{color,weight:4}).addTo(map);const hit=L.polyline(f.points,{color:'#000',weight:28,opacity:0,interactive:true}).addTo(map);poly._aybHit=hit;const onClick=e=>{if(e&&e.originalEvent){L.DomEvent.preventDefault(e.originalEvent);L.DomEvent.stopPropagation(e.originalEvent);}showFreePopup(f,'freeLine',poly,e&&e.latlng);};const onCtx=e=>{if(e&&e.originalEvent){L.DomEvent.preventDefault(e.originalEvent);L.DomEvent.stopPropagation(e.originalEvent);}showFreePopup(f,'freeLine',poly,e&&e.latlng);};poly.on('click',onClick);hit.on('click',onClick);poly.on('contextmenu',onCtx);hit.on('contextmenu',onCtx);aybBindLongPress(poly,onCtx);aybBindLongPress(hit,onCtx);otherLayers.push(poly,hit);let amk=null;if(f.kind==='ok'){try{const last=f.points[f.points.length-1],ic=aybFreeArrowIcon(f,color);if(last&&ic){amk=L.marker(last,{icon:ic,interactive:false,keyboard:false,zIndexOffset:800}).addTo(map);otherLayers.push(amk);}}catch(e){}}aybRenderFreeVertexHandles(f,'freeLine',poly,hit,amk);}
function renderArea(a){const isTrafoRegion=a&&a.kind==='trafoBolge';const color=isTrafoRegion?(a.props?.color||'#2563eb'):'#22c55e';a.points=(a.points||[]).map(aybNormalizeLinePoint).filter(p=>Number.isFinite(p[0])&&Number.isFinite(p[1]));if(a.points.length<3)return;const poly=L.polygon(a.points,{color,fillOpacity:isTrafoRegion?.10:.15,weight:isTrafoRegion?5:3,dashArray:null}).addTo(map);const onClick=e=>{if(e&&e.originalEvent){L.DomEvent.preventDefault(e.originalEvent);L.DomEvent.stopPropagation(e.originalEvent);}showFreePopup(a,'area',poly,e&&e.latlng);};const onCtx=e=>{if(e&&e.originalEvent){L.DomEvent.preventDefault(e.originalEvent);L.DomEvent.stopPropagation(e.originalEvent);}showFreePopup(a,'area',poly,e&&e.latlng);};poly.on('click',onClick);poly.on('contextmenu',onCtx);aybBindLongPress(poly,onCtx);otherLayers.push(poly);if(!isTrafoRegion)aybRenderFreeVertexHandles(a,'area',poly,null,null);if(isTrafoRegion){const pts=(a.points||[]).filter(p=>Array.isArray(p));if(pts.length){const c=L.latLngBounds(pts).getCenter();const txt=esc(a.props?.trafo_no||a.props?.trafo_adi||'Trafo Bölgesi');const lab=L.marker(c,{interactive:false,icon:L.divIcon({className:'',iconSize:[160,26],iconAnchor:[80,13],html:`<div style="background:${color};color:#fff;border:2px solid #fff;border-radius:7px;padding:4px 9px;font:900 12px Arial;text-align:center;box-shadow:0 2px 8px #0008;white-space:nowrap">${txt} BÖLGESİ</div>`})}).addTo(map);otherLayers.push(lab);}}}
function updateSummary'''
s=pat.sub(lambda m:replacement,s,count=1)

old="""function showFreePopup(item,kind,poly){const isCh=(kind==='channel'||item.kind==='kanal'); const name=isCh?aybKanalFullNameFromProps(item.props):(item.kind||kind); const editBtn=isCh?`<button onclick="APP.editChannel('${item.id}')">Düzenle</button><button onclick="APP.startChannelBendMode('${item.id}')">Kırık Nokta Ekle</button>`:''; const html=`<div class="context-popup"><b>${esc(name)}</b><br>${(item.points?polyLength(item.points):0).toFixed(2)} m<br>${editBtn}<button onclick="APP.deleteFree('${item.id}','${kind}')">Sil</button></div>`; const target=poly||null; if(target&&target.bindPopup) target.bindPopup(html).openPopup();}
"""
new="""function showFreePopup(item,kind,poly,latlng=null){const isCh=(kind==='channel'||item.kind==='kanal');const name=isCh?aybKanalFullNameFromProps(item.props):(item.kind||kind);const geomEdit=(!isCh&&item.kind!=='trafoBolge')?`<button onclick="APP.editFreeGeometry('${item.id}','${kind}')">Köşeleri Düzenle</button>`:'';const editBtn=isCh?`<button onclick="APP.editChannel('${item.id}')">Düzenle</button><button onclick="APP.startChannelBendMode('${item.id}')">Kırık Nokta Ekle</button>`:geomEdit;const html=`<div class="context-popup"><b>${esc(name)}</b><br>${(item.points?polyLength(item.points):0).toFixed(2)} m<br>${editBtn}<button onclick="APP.deleteFree('${item.id}','${kind}')">Sil</button></div>`;const target=poly||null;if(target&&target.bindPopup){target.bindPopup(html,{autoPan:false});if(latlng)target.openPopup(latlng);else target.openPopup();}}
"""
if old not in s: raise SystemExit('showFreePopup bulunamadi')
s=s.replace(old,new,1)
needle="  editLine:id=>{const l=project.lines.find(x=>x.id===id);"
if needle not in s: raise SystemExit('APP editLine bulunamadi')
s=s.replace(needle,"  editFreeGeometry:(id,kind)=>{aybActivateFreeGeometryEdit(id)},\n"+needle,1)
old="deleteFree:(id,kind)=>{if(!confirm('Seçili çizim silinsin mi?')) return; clearEnergyTrace(); project.channels=project.channels.filter(x=>x.id!==id); project.freeLines=project.freeLines.filter(x=>x.id!==id); project.areas=project.areas.filter(x=>x.id!==id); saveProject(); renderAll();}"
new="deleteFree:(id,kind)=>{if(!confirm('Seçili çizim silinsin mi?')) return; clearEnergyTrace(); try{__aybFreeGeometryLayers.delete(String(id));}catch(e){} project.channels=project.channels.filter(x=>x.id!==id); project.freeLines=project.freeLines.filter(x=>x.id!==id); project.areas=project.areas.filter(x=>x.id!==id); saveProject(); renderAll();}"
if old not in s: raise SystemExit('deleteFree bulunamadi')
s=s.replace(old,new,1)
p.write_text(s,encoding='utf-8')

j=Path('app/src/main/assets/ayb-tablet.js')
t=j.read_text(encoding='utf-8')
t=t.replace("var mev=0.75; try{ var v=parseFloat(localStorage.getItem('ayb_snap_m')||''); if(isFinite(v)&&v>0) mev=v; }catch(e){}","var mev=2.25; try{ var v=parseFloat(localStorage.getItem('ayb_snap_m')||''); if(isFinite(v)&&v>0) mev=v; }catch(e){}")
t=t.replace('Snap varsayılana döndü (0.75 m)','Snap varsayılana döndü (2.25 m)').replace('String(parseFloat(rg.value)||0.75)','String(parseFloat(rg.value)||2.25)').replace('Varsayılan: 0.75 m.','Varsayılan: 2.25 m.')
j.write_text(t,encoding='utf-8')
print('v16.55 patch OK')
