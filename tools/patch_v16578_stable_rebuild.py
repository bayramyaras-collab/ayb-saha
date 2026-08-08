from pathlib import Path
import re,sys,hashlib
R=Path(sys.argv[1])
A=(R/'app/src/main/assets') if (R/'app/src/main/assets').exists() else R/'app'
H=A/'AYB_Saha_Harita.html'; T=A/'ayb-tablet.js'
h=H.read_text('utf-8',errors='replace'); t=T.read_text('utf-8',errors='replace')

def cut(s,a,b):
    i=s.find(a); j=s.find(b,i)
    if i<0 or j<0: raise SystemExit('kritik bolum yok: '+a)
    return s[i:j]

# KRITIK HARITA MOTORU: PATCH ONCESI
core={k:cut(h,a,b) for k,a,b in [
 ('init','function initMap(){','function toolNeedsCrosshair'),
 ('setup','function setup(){',"window.addEventListener('load',setup);"),
 ('click','function handleMapClick(e){','function handleLineObject'),
 ('base','function switchBase(v){','function aybFmtGps')
]}

# 1) GORUNUR AD / ESKI ALT IMZA
h=re.sub(r'<title>.*?</title>','<title>BY EDŞ SAHA V57</title>',h,count=1,flags=re.S|re.I)
h=re.sub(r'(<div class="title">).*?(</div>)',r'\1BY EDŞ SAHA V57\2',h,count=1,flags=re.S)
h,n=re.subn(r'\s*<div\s+id="aybSahaImza">.*?</div>\s*','\n',h,count=1,flags=re.S|re.I)
h=h.replace('<span class="small-muted">Hazırlayan Bayram YARAŞ · 0530 630 05 40</span>','')

# 2) PROJE MERKEZI KENDI KENDINE ACILMASIN; YENI/AC BUTONUNDAN ACILMAYA DEVAM
h=h.replace('      setTimeout(showScreen,450);','      /* v16.57.8: otomatik acilis kapali */',1)
h=h.replace('  window.addEventListener("load",()=>{ setTimeout(boot,200); setTimeout(showScreen,900); });','  window.addEventListener("load",()=>{ setTimeout(boot,200); });',1)

# 3) NOT: HAZIR LISTE + 24px + ANLIK ONIZLEME + SERI + KALICI SIL
h=h.replace('.ayb-saha-note-icon{width:34px;height:34px;','.ayb-saha-note-icon{width:24px;height:24px;',1)
h=h.replace('.ayb-saha-note-icon span{top:13px} .ayb-saha-note-icon i{top:19px} .ayb-saha-note-icon b{top:25px}',
            '.ayb-saha-note-icon span{top:8px} .ayb-saha-note-icon i{top:13px} .ayb-saha-note-icon b{top:18px}',1)
old_opts='<option>Lambası Yanmıyor</option><option>Armatür Arızalı</option><option>Direk Sorunu</option><option>Hat / Kablo Sorunu</option><option>Saha Engeli</option><option>Diğer</option>'
new_opts='<option>Lamba Arızalı</option><option>Lambası Yanmıyor</option><option>Direk Hasarlı</option><option>Otomat Kapağı Yok</option><option>Otomat Kapağı Yok Kablolar Dışarda</option><option>Kablolar Dışarda</option><option>Armatür Hasarlı</option><option>Hat / Kablo Hasarı</option><option>Saha Engeli</option><option>Diğer</option>'
if old_opts not in h: raise SystemExit('NOT secenek listesi bulunamadi')
h=h.replace(old_opts,new_opts,1)
pat=re.compile(r"let\s+foto=String\(n\.foto\|\|''\);\s*const\s+modal=document\.createElement\('div'\);")
rep="let foto=String(n.foto||''),__pv=null;if(!existing&&map){try{const __ic=L.divIcon({className:'ayb-saha-note-marker',html:aybSahaNotIconHtml(),iconSize:[24,24],iconAnchor:[12,12]});__pv=L.marker([+n.lat,+n.lng],{icon:__ic,interactive:false,keyboard:false,zoomAnimation:false,zIndexOffset:1600}).addTo(map);}catch(e){}}const modal=document.createElement('div');"
h,c=pat.subn(rep,h,count=1)
if c!=1: raise SystemExit('NOT preview yeri bulunamadi')
old="modal.querySelectorAll('[data-nclose]').forEach(b=>b.onclick=()=>modal.remove());"
new="modal.querySelectorAll('[data-nclose]').forEach(b=>b.onclick=()=>{if(__pv){try{map.removeLayer(__pv)}catch(e){}__pv=null;}modal.remove();});"
if old not in h: raise SystemExit('NOT kapat yeri yok')
h=h.replace(old,new,1)
pat=re.compile(r"const\s+arr=aybSahaNotes\(\);\s*if\(!existing\)\s*arr\.push\(n\);\s*saveProject\(\);\s*renderAll\(\);\s*modal\.remove\(\);\s*setTool\(null\);\s*toast\('Saha notu kaydedildi\.'\);")
rep="const arr=aybSahaNotes();if(!existing)arr.push(n);try{projects[project.id]=project;saveProjects();}catch(e){}if(__pv){try{map.removeLayer(__pv)}catch(e){}__pv=null;}saveProject();renderAll();modal.remove();setTool('sahanot',{repeat:true});toast('Saha notu kaydedildi. NOT aracı açık.');"
h,c=pat.subn(rep,h,count=1)
if c!=1: raise SystemExit('NOT kaydet yeri yok')
pat=re.compile(r"const\s+del=modal\.querySelector\('#aybNotSil'\);\s*if\(del\)\s*del\.onclick=function\(\)\{.*?toast\('Saha notu silindi\.'\);\s*\};",re.S)
h,c=pat.subn("const del=modal.querySelector('#aybNotSil');if(del)del.onclick=function(){if(window.aybSahaNotSil(n.id)!==false){if(__pv){try{map.removeLayer(__pv)}catch(e){}__pv=null;}modal.remove();}};",h,count=1)
if c!=1: raise SystemExit('NOT modal sil yeri yok')
pat=re.compile(r"const\s+icon=L\.divIcon\(\{className:'',html:aybSahaNotIconHtml\(\),iconSize:\[34,34\],iconAnchor:\[17,17\]\}\);\s*const\s+m=L\.marker\(\[\+n\.lat,\+n\.lng\],\{icon,zIndexOffset:1100,riseOnHover:true\}\)\.addTo\(map\);")
rep="const icon=L.divIcon({className:'ayb-saha-note-marker',html:aybSahaNotIconHtml(),iconSize:[24,24],iconAnchor:[12,12]});const m=L.marker([+n.lat,+n.lng],{icon,zIndexOffset:1100,riseOnHover:true,zoomAnimation:false}).addTo(map);"
h,c=pat.subn(rep,h,count=1)
if c!=1: raise SystemExit('NOT render marker yeri yok')
pat=re.compile(r"window\.aybSahaNotSil=function\(id\)\{.*?\};",re.S)
rep="window.aybSahaNotSil=function(id){const n=aybSahaNotById(id);if(!n)return false;if(!confirm('Bu saha notu silinsin mi?'))return false;project.sahaNotes=aybSahaNotes().filter(x=>String(x.id)!==String(id));try{projects[project.id]=project;saveProjects();}catch(e){}saveProject();renderAll();try{map.closePopup();}catch(e){}toast('Saha notu silindi.');return true;};"
h,c=pat.subn(rep,h,count=1)
if c!=1: raise SystemExit('NOT global sil yok')
h=h.replace('</head>',"<style id=\"ayb_v578_note_css\">.ayb-saha-note-marker{width:24px!important;height:24px!important;background:transparent!important;border:0!important}.ayb-saha-note-marker .ayb-saha-note-icon{width:24px!important;height:24px!important}</style>\n</head>",1)

# 4) KIRIK NOKTA KORUMASI: VARSAYILAN KILITLI
p=h.find('function aybRenderChannelVertexHandles(ch,poly,label){')
if p<0: raise SystemExit('kanal vertex fonksiyonu yok')
helper="""window.__aybVE=window.__aybVE||{k:'',id:''};
function aybVE(k,id){return window.__aybVE.k===k&&String(window.__aybVE.id)===String(id)}
function aybVEStart(k,id){if(!id)return false;window.__aybVE={k:k,id:String(id)};try{map.closePopup();renderAll()}catch(e){}toast('Kırık noktalar aktif. Bitir ile kilitle.');return true}
function aybVEStop(s){if(!window.__aybVE.id)return false;window.__aybVE={k:'',id:''};try{map.closePopup();renderAll()}catch(e){}if(!s)toast('Kırık noktalar kilitlendi.');return true}
window.aybVEStart=aybVEStart;window.aybVEStop=aybVEStop;
"""
h=h[:p]+helper+h[p:]
h,c=re.subn(r"function\s+aybRenderChannelVertexHandles\(ch,poly,label\)\{", "function aybRenderChannelVertexHandles(ch,poly,label){if(!ch||!aybVE('channel',ch.id))return;",h,count=1)
if c!=1: raise SystemExit('kanal guard yok')
h,c=re.subn(r"function\s+aybRenderLineVertexHandles\(line,pts,poly,label\)\{\s*if\(!line\|\|!aybIsLineYerAlti\(line\)\)\s*return;", "function aybRenderLineVertexHandles(line,pts,poly,label){if(!line||!aybIsLineYerAlti(line)||!aybVE('line',line.id))return;",h,count=1)
if c!=1: raise SystemExit('hat guard yok')
old="${aybIsLineYerAlti(line)?`<button onclick=\"APP.startBendMode('${line.id}')\">Kırık Nokta Ekle</button>`:''}"
new="${aybIsLineYerAlti(line)?`<button onclick=\"aybVEStart('line','${line.id}')\">Kırık Nokta Düzenlemeyi Aktif Et</button><button onclick=\"APP.startBendMode('${line.id}')\">Kırık Nokta Ekle</button>`:''}"
if old not in h: raise SystemExit('hat popup kirik butonu yok')
h=h.replace(old,new,1)
old="const editBtn=isCh?`<button onclick=\"APP.editChannel('${item.id}')\">Düzenle</button><button onclick=\"APP.startChannelBendMode('${item.id}')\">Kırık Nokta Ekle</button>`:geomEdit;"
new="const editBtn=isCh?`<button onclick=\"APP.editChannel('${item.id}')\">Düzenle</button><button onclick=\"aybVEStart('channel','${item.id}')\">Kırık Nokta Düzenlemeyi Aktif Et</button><button onclick=\"APP.startChannelBendMode('${item.id}')\">Kırık Nokta Ekle</button>`:geomEdit;"
if old not in h: raise SystemExit('kanal popup kirik butonu yok')
h=h.replace(old,new,1)
h,c=re.subn(r"function\s+finishCurrentOperation\(\)\{", "function finishCurrentOperation(){if(window.__aybVE&&window.__aybVE.id){aybVEStop(false);return true;}",h,count=1)
if c!=1: raise SystemExit('Bitir guard yok')
h,c=re.subn(r"function\s+setTool\(t,opts\)\{", "function setTool(t,opts){if(t&&window.__aybVE&&window.__aybVE.id)aybVEStop(true);",h,count=1)
if c!=1: raise SystemExit('setTool guard yok')

# 5) GUVENLI OTOMATIK NUMARA
h,c=re.subn(r'function\s+autoNumberProjectObjects\(\)\{','function autoNumberProjectObjects(options={}){',h,count=1)
if c!=1: raise SystemExit('auto no fonksiyon yok')
needle='    const objects=project.objects;\n    const lines=project.lines;'
if needle not in h: raise SystemExit('auto no objects blogu yok')
h=h.replace(needle,needle+"\n    const __sel={direk:true,box:true,trafo:false,kofre:false,abone:false,ekmuf:false,...(options||{})};",1)
old="    const isNumberable=o=>['direk','box','kofre','abone','ekmuf'].includes(objectType(o));"
new="    const isNumberable=o=>!!__sel[objectType(o)];\n    const __no=o=>{const p=o.props||{},t=objectType(o);return String(t==='direk'?p.direk_no:t==='trafo'?p.trafo_no:t==='box'?p.box_no:t==='kofre'?p.kofre_no:(p.no||p.numara||p.ad||'')).trim()};\n    const __can=o=>!!__sel[objectType(o)]&&(!__no(o)||(o.props&&o.props._ayb_auto_no===true));"
if old not in h: raise SystemExit('isNumberable yok')
h=h.replace(old,new,1)
pat=re.compile(r"    const setNo=\(o,val,trafo=null,kol=''\)=>\{.*?\n    \};",re.S)
rep="""    const setNo=(o,val,trafo=null,kol='')=>{
      if(!o) return false;
      if(!o.props) o.props={};
      if(trafo && !isTrafo(o)){o.props.trafo_id=trafo.id;o.props.trafo_no=trafo.props?.trafo_no||getObjectNo(trafo);o.props.trafo_adi=aybTrafoAdi(trafo)||'';o.props.kol=kol||'';}
      if(!__can(o)) return false;
      const old=__no(o);
      if(isDirek(o)){o.props.direk_no=val;o.props.no=val;o.props.numara=val;}
      else if(isTrafo(o)){o.props.trafo_no=val;o.props.no=val;o.props.numara=val;}
      else if(isType(o,'box')){o.props.box_no=val;o.props.no=val;o.props.numara=val;if(!o.props.ad||String(o.props.ad)===old)o.props.ad=val;}
      else if(isType(o,'kofre')){o.props.kofre_no=val;o.props.no=val;o.props.numara=val;if(!o.props.ad||String(o.props.ad)===old)o.props.ad=val;}
      else {o.props.no=val;o.props.numara=val;if(!o.props.ad||String(o.props.ad)===old)o.props.ad=val;}
      o.props._ayb_auto_no=true;o.props._ayb_auto_no_value=val;return true;
    };"""
h,c=pat.subn(rep,h,count=1)
if c!=1: raise SystemExit('setNo replace olmadi')
h=h.replace("    trafos.forEach((t,i)=>setNo(t,'TR'+pad(i,2)));","    let __ti=0;trafos.forEach(t=>{if(__can(t))setNo(t,'TR'+pad(__ti++,2));});",1)
pos=h.find('function bindAYBAutoNumberButtons(){')
if pos<0: raise SystemExit('bind auto no yok')
dlg="""function aybAutoNoDlg(){if(!project){toast('Önce proje aç.');return}const d=document.createElement('div');d.id='aybAutoNoDlg';d.style.cssText='position:fixed;inset:0;z-index:16000;background:#0006;display:flex;align-items:center;justify-content:center;padding:12px';d.innerHTML=`<div style=\"background:#fff;padding:14px;border-radius:10px;min-width:300px;max-width:94vw\"><b>Otomatik Numara</b><p style=\"font-size:12px\">Yalnız boş numara alanları değiştirilir. Manuel dolu alanlar korunur.</p><label><input id=\"ad\" type=\"checkbox\" checked> Direk</label><br><label><input id=\"ab\" type=\"checkbox\" checked> Box</label><br><label><input id=\"at\" type=\"checkbox\"> Trafo değişsin (Trafo Adı değişmez)</label><br><label><input id=\"ak\" type=\"checkbox\"> Kofre</label><br><label><input id=\"aa\" type=\"checkbox\"> Abone</label><br><label><input id=\"am\" type=\"checkbox\"> Ek Muf</label><div style=\"text-align:right;margin-top:10px\"><button id=\"ac\">İptal</button> <button id=\"ar\">Numaralandır</button></div></div>`;document.body.appendChild(d);const q=x=>d.querySelector('#'+x);q('ac').onclick=()=>d.remove();q('ar').onclick=()=>{const c={direk:q('ad').checked,box:q('ab').checked,trafo:q('at').checked,kofre:q('ak').checked,abone:q('aa').checked,ekmuf:q('am').checked};d.remove();autoNumberProjectObjects(c)}}
window.aybAutoNoDlg=aybAutoNoDlg;
"""
h=h[:pos]+dlg+h[pos:]
old="const run=(e)=>{ if(e){e.preventDefault(); if(e.stopImmediatePropagation)e.stopImmediatePropagation(); else e.stopPropagation();} autoNumberProjectObjects(); return false; };"
new="const run=(e)=>{ if(e){e.preventDefault(); if(e.stopImmediatePropagation)e.stopImmediatePropagation(); else e.stopPropagation();} aybAutoNoDlg(); return false; };"
if old not in h: raise SystemExit('auto no run yok')
h=h.replace(old,new,1)

# 6) TABLET: SPLASH VE GIRIS GORUNMESIN; BASLIK SADE; MOTORU SILME
needle="if(window.__aybSplashKuruldu) return; window.__aybSplashKuruldu=true;"
if needle not in t: raise SystemExit('splash guard yok')
t=t.replace(needle,needle+' return; /* v16.57.8 splash kapali */',1)
t,c=re.subn(r'function\s+showGiris\(\)\{',"function showGiris(){return; /* v16.57.8 giris overlay kapali */",t,count=1)
if c!=1: raise SystemExit('showGiris yok')
t=t.replace("var TAG='PERF-25.07-AT-U2';","var TAG='';",1)
t=re.sub(r"var want='BY EDŞ Saha Programı'\+\(ver\?\(' '\+ver\):''\)\+'\\u00A0\\u00A0\\u00A0Hazırlayan Bayram YARAŞ';","var want='BY EDŞ SAHA V57';",t,count=1)
t=re.sub(r"var want='BY EDŞ Saha Programı '\+TAG\+'\\u00A0\\u00A0\\u00A0Hazırlayan Bayram YARAŞ';","var want='BY EDŞ SAHA V57';",t,count=1)
t=t.replace("document.title='BY EDŞ Saha Programı'","document.title='BY EDŞ SAHA V57'")
t=t.replace('BY EDŞ Saha Programı','BY EDŞ SAHA V57')
order="""
(function(){function aybV578Order(){var r=document.querySelector('.ayb-pro-group.draw .ayb-pro-row');if(!r)return false;['[data-tool=\"direk\"]','[data-tool=\"trafo\"]','[data-tool=\"yeraltihat\"]','[data-tool=\"hat\"]','[data-tool=\"abonehat\"]','[data-tool=\"kanal\"]','[data-tool=\"kofre\"]','[data-tool=\"bina\"]','[data-tool=\"box\"]','[data-tool=\"sahanot\"]','#aybYolOlcBtn','#kfMeasureToolBtn','[data-tool=\"cizgi\"]','[data-tool=\"ok\"]','#aybTopluSilBtn'].forEach(function(s){var e=r.querySelector(s)||document.querySelector(s);if(e&&e.parentElement===r)r.appendChild(e)});return true}var n=0,iv=setInterval(function(){if(aybV578Order()||++n>30)clearInterval(iv)},300);if(document.readyState!=='loading')aybV578Order();else document.addEventListener('DOMContentLoaded',aybV578Order)})();
"""
t += order

# 7) KRITIK MOTOR PATCH SONRASI BIREBIR AYNI OLMALI
for k,a,b in [
 ('init','function initMap(){','function toolNeedsCrosshair'),
 ('setup','function setup(){',"window.addEventListener('load',setup);"),
 ('click','function handleMapClick(e){','function handleLineObject'),
 ('base','function switchBase(v){','function aybFmtGps')
]:
    after=cut(h,a,b)
    if core[k]!=after: raise SystemExit('KRITIK HARITA MOTORU DEGISTI: '+k)

need=['BY EDŞ SAHA V57','Otomat Kapağı Yok Kablolar Dışarda','Kırık Nokta Düzenlemeyi Aktif Et','Yalnız boş numara alanları değiştirilir.','function initMap()','function setup()','function handleMapClick(e)','function switchBase(v)']
for x in need:
    if x not in h+t: raise SystemExit('eksik: '+x)
if 'id="aybSahaImza"' in h: raise SystemExit('alt imza kaldi')

H.write_text(h,'utf-8'); T.write_text(t,'utf-8')
print('PATCH_OK')
for k,v in core.items(): print(k,hashlib.sha256(v.encode()).hexdigest())
