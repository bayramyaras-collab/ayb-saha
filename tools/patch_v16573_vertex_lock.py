from pathlib import Path
import re,sys

p=Path(sys.argv[1]) if len(sys.argv)>1 else Path('app/src/main/assets/AYB_Saha_Harita.html')
s=p.read_text(encoding='utf-8',errors='replace')

s=re.sub(r'<title>.*?</title>', '<title>BY EDŞ SAHA V57</title>', s, count=1, flags=re.I|re.S)
s=s.replace('<div class="title">BY EDŞ SAHA</div>', '<div class="title">BY EDŞ SAHA V57</div>', 1)
s=s.replace('BY EDŞ SAHA V57 TEMİZ','BY EDŞ SAHA V57').replace('BY EDŞ SAHA V57 TEMIZ','BY EDŞ SAHA V57')
s=s.replace("'Otomat Kapağı Yok - Kablolar Dışarıda'", "'Otomat Kapağı Yok Kablolar Dışarda'")
s=s.replace("'Kablolar Dışarıda'", "'Kablolar Dışarda'")

LOCK_HELPER=r'''/* === V16.57.3: KIRIK NOKTA KORUMASI === */
window.__aybVertexEditState=window.__aybVertexEditState||{kind:'',id:''};
function aybVertexEditIs(kind,id){
  const st=window.__aybVertexEditState||{};
  return String(st.kind||'')===String(kind||'')&&String(st.id||'')===String(id||'');
}
function aybVertexEditStart(kind,id){
  if(!id) return false;
  window.__aybVertexEditState={kind:String(kind||''),id:String(id)};
  try{map.closePopup();}catch(e){}
  try{renderAll();}catch(e){console.error(e);}
  hint('Kırık nokta düzenleme AKTİF. Yalnız seçilen hat/kanalın noktaları sürüklenebilir. Bitir ile kilitlenir.');
  toast('Kırık noktalar aktif. İşin bitince Bitir düğmesine bas.');
  return true;
}
function aybVertexEditStop(silent){
  const st=window.__aybVertexEditState||{};
  if(!st.id) return false;
  window.__aybVertexEditState={kind:'',id:''};
  try{map.closePopup();}catch(e){}
  try{renderAll();}catch(e){console.error(e);}
  if(!silent){hint('Kırık nokta düzenleme bitti. Hat/kanal tekrar kilitlendi.');toast('Kırık noktalar kilitlendi.');}
  return true;
}
window.aybVertexEditStart=aybVertexEditStart;
window.aybVertexEditStop=aybVertexEditStop;
/* === /V16.57.3 KIRIK NOKTA KORUMASI === */
'''

marker='function aybRenderChannelVertexHandles(ch,poly,label){'
pos=s.find(marker)
if pos<0: raise SystemExit('aybRenderChannelVertexHandles bulunamadi')
if 'V16.57.3: KIRIK NOKTA KORUMASI' not in s:s=s[:pos]+LOCK_HELPER+s[pos:]

a=s.find('function aybRenderChannelVertexHandles(ch,poly,label){');b=s.find('var __aybFreeGeometryLayers=',a)
if a<0 or b<0: raise SystemExit('kanal vertex blok siniri bulunamadi')
channel_func=r'''function aybRenderChannelVertexHandles(ch,poly,label){
  if(!ch||!aybVertexEditIs('channel',ch.id)) return;
  const group=[];
  (ch.points||[]).forEach((pt,i)=>{
    if(!Array.isArray(pt)||!Number.isFinite(Number(pt[0]))||!Number.isFinite(Number(pt[1]))) return;
    const mk=L.marker([pt[0],pt[1]],{icon:aybVertexIcon('kanal'),draggable:true,zIndexOffset:1200}).addTo(map);
    mk.on('click',e=>{if(e&&e.originalEvent){L.DomEvent.preventDefault(e.originalEvent);L.DomEvent.stopPropagation(e.originalEvent);}});
    mk.on('drag',e=>{if(!aybVertexEditIs('channel',ch.id)) return;const ll=e.target.getLatLng();ch.points[i]=[ll.lat,ll.lng];poly.setLatLngs(ch.points);if(poly._aybHit)poly._aybHit.setLatLngs(ch.points);const place=aybLineLabelPlacementFromPoints(ch.points);if(label){const len=polyLength(ch.points);label.setLatLng(place.latlng);label.setIcon(makeChannelLabelIcon(ch,len,place.angle));}});
    mk.on('dragend',()=>{if(aybVertexEditIs('channel',ch.id)){saveProject();toast('Kanal kırık noktası güncellendi. Bitir ile kilitle.');}});
    otherLayers.push(mk);group.push(mk);
  });
  poly.__aybKeepHandles=true;aybSetVertexGroupVisible(group,true);
}
'''
s=s[:a]+channel_func+s[b:]

a=s.find('function aybRenderLineVertexHandles(line,pts,poly,label){');b=s.find('\n\nfunction clearEnergyTrace()',a)
if a<0 or b<0: raise SystemExit('hat vertex blok siniri bulunamadi')
line_func=r'''function aybRenderLineVertexHandles(line,pts,poly,label){
  if(!line||!aybIsLineYerAlti(line)||!aybVertexEditIs('line',line.id)) return;
  const __pk=lineLayers.get(line.id);if(__pk&&Array.isArray(__pk.handles)){__pk.handles.forEach(hm=>{try{map.removeLayer(hm);}catch(e){}});__pk.handles=[];}
  if(!Array.isArray(line.points)||line.points.length<=2) return;
  const group=[];
  for(let i=1;i<line.points.length-1;i++){
    const pt=line.points[i];if(!Array.isArray(pt))continue;
    const mk=L.marker([pt[0],pt[1]],{icon:aybVertexIcon('yeraltihat'),draggable:true,zIndexOffset:1200}).addTo(map);
    mk.on('click',e=>{if(e&&e.originalEvent){L.DomEvent.preventDefault(e.originalEvent);L.DomEvent.stopPropagation(e.originalEvent);}});
    mk.on('drag',e=>{if(!aybVertexEditIs('line',line.id))return;const ll=e.target.getLatLng();line.points[i]=[ll.lat,ll.lng];const aa=aybObjById(line.start),bb=aybObjById(line.end);if(aa&&bb){line.points[0]=[aa.lat,aa.lng];line.points[line.points.length-1]=[bb.lat,bb.lng];}const newPts=aybLinePathPoints(line,aa,bb);line.length_m=polyLength(newPts);poly.setLatLngs(newPts);if(poly._aybHit)poly._aybHit.setLatLngs(newPts);if(label){const place=aybLineLabelPlacementFromPoints(newPts);label.setLatLng(place.latlng);label.setIcon(makeLineLabelIcon(line,line.length_m,place.angle));const pack=lineLayers.get(line.id);if(pack)updateLineRegionMarker(line,pack);}});
    mk.on('dragend',()=>{if(aybVertexEditIs('line',line.id)){saveProject();toast('Hat kırık noktası güncellendi. Bitir ile kilitle.');}});
    otherLayers.push(mk);group.push(mk);
  }
  if(__pk)__pk.handles=group;poly.__aybKeepHandles=true;aybSetVertexGroupVisible(group,true);
}
'''
s=s[:a]+line_func+s[b:]

a=s.find('function showLinePopup(line,latlng=null){');b=s.find('function showFreePopup(item,kind,poly,latlng=null){',a)
if a<0 or b<0: raise SystemExit('showLinePopup siniri bulunamadi')
show_line=r'''function showLinePopup(line,latlng=null){
  const bend=aybIsLineYerAlti(line);const editBtn=bend?`<button onclick="aybVertexEditStart('line','${line.id}')">Kırık Nokta Düzenlemeyi Aktif Et</button>`:'';const addBtn=bend?`<button onclick="APP.startBendMode('${line.id}')">Kırık Nokta Ekle</button>`:'';
  const html=`<div class="context-popup"><b>${esc(lineLabels[line.kind]||'Hat')}</b><br>${esc(getLineDisplayText(line))} · ${(line.length_m||0).toFixed(2)} m<br>${editBtn}${addBtn}<button onclick="APP.deleteLine('${line.id}')">Sil</button></div>`;const pack=lineLayers.get(line.id);if(!pack||!pack.poly)return;pack.poly.bindPopup(html,{autoPan:false});if(latlng)pack.poly.openPopup(latlng);else pack.poly.openPopup();
}
'''
s=s[:a]+show_line+s[b:]

a=s.find('function showFreePopup(item,kind,poly,latlng=null){');b=s.find('\n\nfunction autoNumberProjectObjects()',a)
if a<0 or b<0: raise SystemExit('showFreePopup siniri bulunamadi')
show_free=r'''function showFreePopup(item,kind,poly,latlng=null){
  const isCh=(kind==='channel'||item.kind==='kanal');const name=isCh?aybKanalFullNameFromProps(item.props):(item.kind||kind);const geomEdit=(!isCh&&item.kind!=='trafoBolge')?`<button onclick="APP.editFreeGeometry('${item.id}','${kind}')">Köşeleri Düzenle</button>`:'';const editBtn=isCh?`<button onclick="APP.editChannel('${item.id}')">Düzenle</button><button onclick="aybVertexEditStart('channel','${item.id}')">Kırık Nokta Düzenlemeyi Aktif Et</button><button onclick="APP.startChannelBendMode('${item.id}')">Kırık Nokta Ekle</button>`:geomEdit;const html=`<div class="context-popup"><b>${esc(name)}</b><br>${(item.points?polyLength(item.points):0).toFixed(2)} m<br>${editBtn}<button onclick="APP.deleteFree('${item.id}','${kind}')">Sil</button></div>`;const target=poly||null;if(target&&target.bindPopup){target.bindPopup(html,{autoPan:false});if(latlng)target.openPopup(latlng);else target.openPopup();}
}
'''
s=s[:a]+show_free+s[b:]

needle="poly.on('dblclick',onDbl); hit.on('dblclick',onDbl); const place=aybLineLabelPlacementFromPoints(pts);";repl="poly.on('dblclick',onDbl); hit.on('dblclick',onDbl); aybBindLongPress(poly,onCtx); aybBindLongPress(hit,onCtx); const place=aybLineLabelPlacementFromPoints(pts);"
if needle in s:s=s.replace(needle,repl,1)
elif "aybBindLongPress(poly,onCtx); aybBindLongPress(hit,onCtx); const place=aybLineLabelPlacementFromPoints(pts);" not in s:raise SystemExit('renderChannel longpress yeri bulunamadi')

needle='function finishCurrentOperation(){\n'
if needle not in s:raise SystemExit('finishCurrentOperation bulunamadi')
s=s.replace(needle,"function finishCurrentOperation(){\n  if(window.__aybVertexEditState&&window.__aybVertexEditState.id){aybVertexEditStop(false);return true;}\n",1)

needle="function setTool(t,opts){if(t==='not') t=null;"
if needle in s:s=s.replace(needle,"function setTool(t,opts){if(t&&window.__aybVertexEditState&&window.__aybVertexEditState.id)aybVertexEditStop(true);if(t==='not') t=null;",1)
elif 'function setTool(t,opts){' in s and 'aybVertexEditStop(true)' not in s:s=s.replace('function setTool(t,opts){',"function setTool(t,opts){if(t&&window.__aybVertexEditState&&window.__aybVertexEditState.id)aybVertexEditStop(true);",1)

must=['V16.57.3: KIRIK NOKTA KORUMASI',"aybVertexEditStart('line'","aybVertexEditStart('channel'","if(!ch||!aybVertexEditIs('channel',ch.id)) return;","if(!line||!aybIsLineYerAlti(line)||!aybVertexEditIs('line',line.id)) return;",'Kırık Nokta Düzenlemeyi Aktif Et','Kırık noktalar kilitlendi.','<title>BY EDŞ SAHA V57</title>','<div class="title">BY EDŞ SAHA V57</div>','Otomat Kapağı Yok Kablolar Dışarda']
for x in must:
  if x not in s:raise SystemExit('eksik:'+x)
p.write_text(s,encoding='utf-8')
print('v16.57.3 vertex lock patch OK')
