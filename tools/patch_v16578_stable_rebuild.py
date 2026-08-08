from pathlib import Path
import re,sys,hashlib
R=Path(sys.argv[1]);A=(R/'app/src/main/assets') if (R/'app/src/main/assets').exists() else R/'app';H=A/'AYB_Saha_Harita.html';T=A/'ayb-tablet.js';h=H.read_text('utf-8',errors='replace');t=T.read_text('utf-8',errors='replace')
def cut(s,a,b):
 i=s.find(a);j=s.find(b,i)
 if i<0 or j<0:raise SystemExit('yok '+a)
 return s[i:j]
core={k:cut(h,a,b) for k,a,b in [('init','function initMap(){','function toolNeedsCrosshair'),('setup','function setup(){',"window.addEventListener('load',setup);"),('click','function handleMapClick(e){','function handleLineObject'),('base','function switchBase(v){','function aybFmtGps')]}
# isim + imza
h=re.sub(r'<title>.*?</title>','<title>BY EDŞ SAHA V57</title>',h,1,flags=re.S|re.I);h=re.sub(r'(<div class="title">).*?(</div>)',r'\1BY EDŞ SAHA V57\2',h,1,flags=re.S);h=re.sub(r'\s*<div id="aybSahaImza">.*?</div>\s*','\n',h,1,flags=re.S|re.I);h=h.replace('<span class="small-muted">Hazırlayan Bayram YARAŞ · 0530 630 05 40</span>','')
# NOT 24px + hazir liste
h=h.replace('.ayb-saha-note-icon{width:34px;height:34px;','.ayb-saha-note-icon{width:24px;height:24px;',1).replace('.ayb-saha-note-icon span{top:13px} .ayb-saha-note-icon i{top:19px} .ayb-saha-note-icon b{top:25px}','.ayb-saha-note-icon span{top:8px} .ayb-saha-note-icon i{top:13px} .ayb-saha-note-icon b{top:18px}',1)
opts='<option>Lamba Arızalı</option><option>Lambası Yanmıyor</option><option>Direk Hasarlı</option><option>Otomat Kapağı Yok</option><option>Otomat Kapağı Yok Kablolar Dışarda</option><option>Kablolar Dışarda</option><option>Armatür Hasarlı</option><option>Hat / Kablo Hasarı</option><option>Saha Engeli</option><option>Diğer</option>'
h=h.replace('<option>Lambası Yanmıyor</option><option>Armatür Arızalı</option><option>Direk Sorunu</option><option>Hat / Kablo Sorunu</option><option>Saha Engeli</option><option>Diğer</option>',opts,1)
# note temp preview + seri + kalici sil
needle="let foto=String(n.foto||'');\n  const modal=document.createElement('div');"
rep="let foto=String(n.foto||''),__pv=null; if(!existing&&map){try{const ic=L.divIcon({className:'ayb-saha-note-marker',html:aybSahaNotIconHtml(),iconSize:[24,24],iconAnchor:[12,12]});__pv=L.marker([+n.lat,+n.lng],{icon:ic,interactive:false,keyboard:false,zoomAnimation:false,zIndexOffset:1600}).addTo(map);}catch(e){}}\n  const modal=document.createElement('div');"
if needle not in h:raise SystemExit('not preview yeri yok');h=h.replace(needle,rep,1)
h=h.replace("modal.querySelectorAll('[data-nclose]').forEach(b=>b.onclick=()=>modal.remove());","modal.querySelectorAll('[data-nclose]').forEach(b=>b.onclick=()=>{if(__pv){try{map.removeLayer(__pv)}catch(e){}__pv=null;}modal.remove();});",1)
h=h.replace("const arr=aybSahaNotes(); if(!existing) arr.push(n); saveProject(); renderAll(); modal.remove(); setTool(null); toast('Saha notu kaydedildi.');","const arr=aybSahaNotes(); if(!existing) arr.push(n); try{projects[project.id]=project;saveProjects();}catch(e){} if(__pv){try{map.removeLayer(__pv)}catch(e){}__pv=null;} saveProject(); renderAll(); modal.remove(); setTool('sahanot',{repeat:true}); toast('Saha notu kaydedildi. NOT aracı açık.');",1)
h=h.replace("const del=modal.querySelector('#aybNotSil'); if(del) del.onclick=function(){ if(!confirm('Bu saha notu silinsin mi?'))return; project.sahaNotes=aybSahaNotes().filter(x=>String(x.id)!==String(n.id)); saveProject();renderAll();modal.remove();toast('Saha notu silindi.'); };","const del=modal.querySelector('#aybNotSil'); if(del) del.onclick=function(){ if(window.aybSahaNotSil(n.id)!==false){modal.remove();} };",1)
old="const icon=L.divIcon({className:'',html:aybSahaNotIconHtml(),iconSize:[34,34],iconAnchor:[17,17]});\n  const m=L.marker([+n.lat,+n.lng],{icon,zIndexOffset:1100,riseOnHover:true}).addTo(map);"
new="const icon=L.divIcon({className:'ayb-saha-note-marker',html:aybSahaNotIconHtml(),iconSize:[24,24],iconAnchor:[12,12]});\n  const m=L.marker([+n.lat,+n.lng],{icon,zIndexOffset:1100,riseOnHover:true,zoomAnimation:false}).addTo(map);"
if old not in h:raise SystemExit('render note yok');h=h.replace(old,new,1)
h=re.sub(r"window\.aybSahaNotSil=function\(id\)\{.*?\};", "window.aybSahaNotSil=function(id){const n=aybSahaNotById(id);if(!n)return false;if(!confirm('Bu saha notu silinsin mi?'))return false;project.sahaNotes=aybSahaNotes().filter(x=>String(x.id)!==String(id));try{projects[project.id]=project;saveProjects();}catch(e){}saveProject();renderAll();try{map.closePopup();}catch(e){}toast('Saha notu silindi.');return true;};",h,count=1,flags=re.S)
h=h.replace('</head>','<style id="ayb_v578_note">.ayb-saha-note-marker{width:24px!important;height:24px!important;background:transparent!important;border:0!important}.ayb-saha-note-marker .ayb-saha-note-icon{width:24px!important;height:24px!important}</style>\n</head>',1)
# kirik nokta kilidi helper
p=h.find('function aybRenderChannelVertexHandles(ch,poly,label){');helper="""window.__aybVE=window.__aybVE||{k:'',id:''};function aybVE(k,id){return window.__aybVE.k===k&&String(window.__aybVE.id)===String(id)}function aybVEStart(k,id){window.__aybVE={k:k,id:String(id)};try{map.closePopup();renderAll()}catch(e){}toast('Kırık noktalar aktif. Bitir ile kilitle.')}function aybVEStop(s){if(!window.__aybVE.id)return false;window.__aybVE={k:'',id:''};try{map.closePopup();renderAll()}catch(e){}if(!s)toast('Kırık noktalar kilitlendi.');return true}window.aybVEStart=aybVEStart;window.aybVEStop=aybVEStop;\n""";h=h[:p]+helper+h[p:]
# kanal func ilk satir guard
h=h.replace("function aybRenderChannelVertexHandles(ch,poly,label){\n  const group=[];","function aybRenderChannelVertexHandles(ch,poly,label){\n  if(!ch||!aybVE('channel',ch.id))return;\n  const group=[];",1)
# line func guard
h=h.replace("function aybRenderLineVertexHandles(line,pts,poly,label){\n  if(!line||!aybIsLineYerAlti(line)) return;","function aybRenderLineVertexHandles(line,pts,poly,label){\n  if(!line||!aybIsLineYerAlti(line)||!aybVE('line',line.id)) return;",1)
# popup buttons
h=h.replace("${aybIsLineYerAlti(line)?`<button onclick=\"APP.startBendMode('${line.id}')\">Kırık Nokta Ekle</button>`:''}","${aybIsLineYerAlti(line)?`<button onclick=\"aybVEStart('line','${line.id}')\">Kırık Nokta Düzenlemeyi Aktif Et</button><button onclick=\"APP.startBendMode('${line.id}')\">Kırık Nokta Ekle</button>`:''}",1)
h=h.replace("const editBtn=isCh?`<button onclick=\"APP.editChannel('${item.id}')\">Düzenle</button><button onclick=\"APP.startChannelBendMode('${item.id}')\">Kırık Nokta Ekle</button>`:geomEdit;","const editBtn=isCh?`<button onclick=\"APP.editChannel('${item.id}')\">Düzenle</button><button onclick=\"aybVEStart('channel','${item.id}')\">Kırık Nokta Düzenlemeyi Aktif Et</button><button onclick=\"APP.startChannelBendMode('${item.id}')\">Kırık Nokta Ekle</button>`:geomEdit;",1)
h=h.replace('function finishCurrentOperation(){\n','function finishCurrentOperation(){\n  if(window.__aybVE&&window.__aybVE.id){aybVEStop(false);return true;}\n',1)
h=h.replace("function setTool(t,opts){if(t==='not') t=null;","function setTool(t,opts){if(t&&window.__aybVE&&window.__aybVE.id)aybVEStop(true);if(t==='not') t=null;",1)
# guvenli oto numara: secim + bos alan koruma
h=h.replace('function autoNumberProjectObjects(){','function autoNumberProjectObjects(options={}){',1)
h=h.replace("    const objects=project.objects;\n    const lines=project.lines;","    const objects=project.objects;\n    const lines=project.lines;\n    const __sel={direk:true,box:true,trafo:false,kofre:false,abone:false,ekmuf:false,...(options||{})};",1)
h=h.replace("    const isNumberable=o=>['direk','box','kofre','abone','ekmuf'].includes(objectType(o));","    const isNumberable=o=>!!__sel[objectType(o)];\n    const __no=o=>{const p=o.props||{},t=objectType(o);return String(t==='direk'?p.direk_no:t==='trafo'?p.trafo_no:t==='box'?p.box_no:t==='kofre'?p.kofre_no:(p.no||p.numara||p.ad||'')).trim()};\n    const __can=o=>!!__sel[objectType(o)]&&(!__no(o)||(o.props&&o.props._ayb_auto_no===true));",1)
# setNo protect: insert before mutation and remove trafo ad mutation
h=h.replace("      if(!o.props) o.props={};\n      if(isDirek(o))","      if(!o.props) o.props={};\n      if(trafo && !isTrafo(o)){o.props.trafo_id=trafo.id;o.props.trafo_no=trafo.props?.trafo_no||getObjectNo(trafo);o.props.trafo_adi=aybTrafoAdi(trafo)||'';o.props.kol=kol||'';}\n      if(!__can(o)) return false;\n      if(isDirek(o))",1)
h=h.replace("else if(isTrafo(o)){ o.props.trafo_no=val; o.props.ad=o.props.trafo_adi||o.props.adi||val; o.props.no=val; o.props.numara=val; }","else if(isTrafo(o)){ o.props.trafo_no=val; o.props.no=val; o.props.numara=val; }",1)
# prevent duplicate association block by replacing original with auto marker
orig="""      if(trafo && !isTrafo(o)){
        o.props.trafo_id=trafo.id;
        o.props.trafo_no=trafo.props?.trafo_no||getObjectNo(trafo);
        o.props.trafo_adi=aybTrafoAdi(trafo)||'';
        o.props.kol=kol||'';
      }
    };"""
if orig not in h:raise SystemExit('setNo association yok');h=h.replace(orig,"      o.props._ayb_auto_no=true;o.props._ayb_auto_no_value=val;return true;\n    };",1)
h=h.replace("    trafos.forEach((t,i)=>setNo(t,'TR'+pad(i,2)));","    let __ti=0;trafos.forEach(t=>{if(__can(t))setNo(t,'TR'+pad(__ti++,2));});",1)
# dialog before bind
pos=h.find('function bindAYBAutoNumberButtons(){');dlg="""function aybAutoNoDlg(){if(!project){toast('Önce proje aç.');return}const d=document.createElement('div');d.id='aybAutoNoDlg';d.style.cssText='position:fixed;inset:0;z-index:16000;background:#0006;display:flex;align-items:center;justify-content:center';d.innerHTML=`<div style=\"background:#fff;padding:14px;border-radius:10px;min-width:300px\"><b>Otomatik Numara</b><p style=\"font-size:12px\">Yalnız boş numara alanları değiştirilir. Manuel dolu alanlar korunur.</p><label><input id=\"ad\" type=\"checkbox\" checked> Direk</label><br><label><input id=\"ab\" type=\"checkbox\" checked> Box</label><br><label><input id=\"at\" type=\"checkbox\"> Trafo değişsin (Trafo Adı değişmez)</label><br><label><input id=\"ak\" type=\"checkbox\"> Kofre</label><br><label><input id=\"aa\" type=\"checkbox\"> Abone</label><br><label><input id=\"am\" type=\"checkbox\"> Ek Muf</label><div style=\"text-align:right;margin-top:10px\"><button id=\"ac\">İptal</button> <button id=\"ar\">Numaralandır</button></div></div>`;document.body.appendChild(d);const q=x=>d.querySelector('#'+x);q('ac').onclick=()=>d.remove();q('ar').onclick=()=>{const c={direk:q('ad').checked,box:q('ab').checked,trafo:q('at').checked,kofre:q('ak').checked,abone:q('aa').checked,ekmuf:q('am').checked};d.remove();autoNumberProjectObjects(c)}}window.aybAutoNoDlg=aybAutoNoDlg;\n""";h=h[:pos]+dlg+h[pos:]
h=h.replace("autoNumberProjectObjects(); return false;","aybAutoNoDlg(); return false;",1)
# tablet: splash/login pasif, title sade, arac sirasi
if "window.__aybSplashKuruldu=true;" not in t:raise SystemExit('splash yok');t=t.replace("window.__aybSplashKuruldu=true;","window.__aybSplashKuruldu=true; return;",1)
t=t.replace('function showGiris(){\n','function showGiris(){\n    return; /* v16.57.8 */\n',1)
t=t.replace("var TAG='PERF-25.07-AT-U2';","var TAG='';",1);t=t.replace('BY EDŞ Saha Programı','BY EDŞ SAHA V57').replace("'  Hazırlayan Bayram YARAŞ'","''")
order="""\n(function(){function o(){var r=document.querySelector('.ayb-pro-group.draw .ayb-pro-row');if(!r)return false;['[data-tool=\"direk\"]','[data-tool=\"trafo\"]','[data-tool=\"yeraltihat\"]','[data-tool=\"hat\"]','[data-tool=\"abonehat\"]','[data-tool=\"kanal\"]','[data-tool=\"kofre\"]','[data-tool=\"bina\"]','[data-tool=\"box\"]','[data-tool=\"sahanot\"]','#aybYolOlcBtn','#kfMeasureToolBtn','[data-tool=\"cizgi\"]','[data-tool=\"ok\"]','#aybTopluSilBtn'].forEach(s=>{var e=r.querySelector(s)||document.querySelector(s);if(e&&e.parentElement===r)r.appendChild(e)});return true}var n=0,i=setInterval(()=>{if(o()||++n>30)clearInterval(i)},300);if(document.readyState!=='loading')o();else document.addEventListener('DOMContentLoaded',o)})();\n""";t+=order
# critical core unchanged
for k,a,b in [('init','function initMap(){','function toolNeedsCrosshair'),('setup','function setup(){',"window.addEventListener('load',setup);"),('click','function handleMapClick(e){','function handleLineObject'),('base','function switchBase(v){','function aybFmtGps')]:
 if core[k]!=cut(h,a,b):raise SystemExit('KRITIK DEGISTI '+k)
for x in ['BY EDŞ SAHA V57','Otomat Kapağı Yok Kablolar Dışarda','Kırık Nokta Düzenlemeyi Aktif Et','Yalnız boş numara alanları değiştirilir.']:
 if x not in h+t:raise SystemExit('eksik '+x)
if 'id="aybSahaImza"' in h:raise SystemExit('imza kaldi')
H.write_text(h,'utf-8');T.write_text(t,'utf-8');print('OK');[print(k,hashlib.sha256(v.encode()).hexdigest()) for k,v in core.items()]
