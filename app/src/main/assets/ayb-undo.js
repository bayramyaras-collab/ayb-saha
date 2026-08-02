/* ============================================================
   BY EDŞ Saha Programı — Kalıcı Silinenler / Geri Al
   Sürüm: PERF-26.08-U4
   Hazırlayan: Bayram YARAŞ

   Performans kuralı:
   - Normal çizim, zoom, GPS ve altlık olaylarına bağlanmaz.
   - Yalnızca silme anında küçük bir kayıt hazırlar.
   - Geçmiş ayrı IndexedDB deposunda tutulur; proje verisini şişirmez.
   ============================================================ */
(function(){
  'use strict';
  if(window.__aybUndoV1) return;
  window.__aybUndoV1=true;

  var DB_NAME='ayb_silinenler_v1', STORE='islemler', DB_VER=1;
  var MAX_RECORDS=20, MAX_PROJECTS=3;
  var history=[], dbPromise=null, toastTimer=null;

  function currentProject(){ try{return window.project||null;}catch(e){return null;} }
  function esc(s){ return String(s==null?'':s).replace(/[&<>"']/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c];}); }
  function clone(v){
    if(v==null) return v;
    try{ if(typeof structuredClone==='function') return structuredClone(v); }catch(e){}
    try{ return JSON.parse(JSON.stringify(v)); }catch(e){ return null; }
  }
  function uid(){ return 'UNDO_'+Date.now()+'_'+Math.floor(Math.random()*1000000); }
  function trTime(ts){ try{return new Date(ts).toLocaleString('tr-TR');}catch(e){return '';} }
  function notify(msg){ try{ if(typeof window.toast==='function') window.toast(msg); else console.log(msg); }catch(e){} }

  function openDB(){
    if(dbPromise) return dbPromise;
    dbPromise=new Promise(function(resolve,reject){
      try{
        var r=indexedDB.open(DB_NAME,DB_VER);
        r.onupgradeneeded=function(){
          var db=r.result, st;
          if(!db.objectStoreNames.contains(STORE)) st=db.createObjectStore(STORE,{keyPath:'id'});
          else st=r.transaction.objectStore(STORE);
          try{ if(!st.indexNames.contains('ts')) st.createIndex('ts','ts',{unique:false}); }catch(e){}
        };
        r.onsuccess=function(){ resolve(r.result); };
        r.onerror=function(){ reject(r.error||new Error('Silinenler deposu açılamadı')); };
      }catch(e){ reject(e); }
    });
    return dbPromise;
  }
  function dbAll(){
    return openDB().then(function(db){ return new Promise(function(resolve){
      try{ var r=db.transaction(STORE,'readonly').objectStore(STORE).getAll(); r.onsuccess=function(){resolve(r.result||[])}; r.onerror=function(){resolve([])}; }
      catch(e){resolve([])}
    }); }).catch(function(){return []});
  }
  function dbDelete(id){
    return openDB().then(function(db){ return new Promise(function(resolve){
      try{ var tx=db.transaction(STORE,'readwrite'); tx.objectStore(STORE).delete(id); tx.oncomplete=function(){resolve(true)}; tx.onerror=function(){resolve(false)}; }
      catch(e){resolve(false)}
    }); }).catch(function(){return false});
  }
  function pruneDB(){
    return dbAll().then(function(all){
      all.sort(function(a,b){return (b.ts||0)-(a.ts||0)});
      var projectCount=0, remove=[];
      all.forEach(function(r,i){
        if(r.kind==='project') projectCount++;
        if(i>=MAX_RECORDS || (r.kind==='project'&&projectCount>MAX_PROJECTS)) remove.push(r.id);
      });
      if(!remove.length) return true;
      return openDB().then(function(db){ return new Promise(function(resolve){
        try{ var tx=db.transaction(STORE,'readwrite'), st=tx.objectStore(STORE); remove.forEach(function(id){st.delete(id)}); tx.oncomplete=function(){resolve(true)}; tx.onerror=function(){resolve(false)}; }
        catch(e){resolve(false)}
      }); });
    }).catch(function(){return false});
  }
  function dbPut(rec){
    return openDB().then(function(db){ return new Promise(function(resolve){
      try{ var tx=db.transaction(STORE,'readwrite'); tx.objectStore(STORE).put(rec); tx.oncomplete=function(){resolve(true)}; tx.onerror=function(){resolve(false)}; tx.onabort=function(){resolve(false)}; }
      catch(e){resolve(false)}
    }); }).then(function(ok){ if(ok) pruneDB(); return ok; }).catch(function(){return false});
  }

  function makeRecord(spec){
    spec=spec||{};
    var p=currentProject();
    var payload=clone(spec.payload||{});
    if(payload==null) return null;
    return {
      id:uid(), ts:Date.now(), kind:spec.kind||'items',
      projectId:spec.projectId||((p&&p.id)||''),
      projectName:spec.projectName||((p&&(p.name||p.id))||''),
      title:spec.title||'Silinen kayıt', payload:payload
    };
  }
  function trimHistory(list){
    var projectsSeen=0;
    return (list||[]).filter(function(r,i){
      if(i>=MAX_RECORDS)return false;
      if(r&&r.kind==='project'&&++projectsSeen>MAX_PROJECTS)return false;
      return true;
    });
  }
  function remember(rec,show){
    if(!rec) return Promise.resolve(false);
    history=history.filter(function(x){return x.id!==rec.id});
    history.unshift(rec); history=trimHistory(history);
    refreshUI();
    if(show!==false) showUndoToast(rec);
    return dbPut(rec);
  }
  function forget(id){
    history=history.filter(function(x){return x.id!==id});
    refreshUI();
    return dbDelete(id);
  }

  function payloadCount(pl){
    var n=0; pl=pl||{};
    ['objects','lines','freeLines','areas','channels','aybNotes','rasters','cadLayers','aybImportLayers','importFeatures','stickyNotes','photos','kmzPhotos'].forEach(function(k){ if(Array.isArray(pl[k])) n+=pl[k].length; });
    if(pl.project) n++;
    return n;
  }
  function addMissing(target,key,items){
    if(!Array.isArray(items)||!items.length) return 0;
    if(!Array.isArray(target[key])) target[key]=[];
    var exists={}; target[key].forEach(function(x){ if(x&&x.id!=null) exists[String(x.id)]=1; });
    var n=0;
    items.forEach(function(x){
      if(!x) return;
      var id=(x.id!=null)?String(x.id):'';
      if(id&&exists[id]) return;
      var c=clone(x); if(c==null) return;
      target[key].push(c); if(id) exists[id]=1; n++;
    });
    return n;
  }
  function redraw(){
    try{ if(typeof window.aybIdxBozul==='function') window.aybIdxBozul(); }catch(e){}
    try{ if(typeof window.saveProject==='function') window.saveProject(); else if(typeof window.saveProjects==='function') window.saveProjects(); }catch(e){}
    try{ if(typeof window.aybNotesRebuild==='function') window.aybNotesRebuild(); }catch(e){}
    try{ if(typeof window.aybImportLayersRedraw==='function') window.aybImportLayersRedraw(); else if(typeof window.aybForceFullRender==='function') window.aybForceFullRender(); else if(typeof window.renderAll==='function') window.renderAll(); }catch(e){}
    try{ if(typeof window.aybArtikTemizle==='function') window.aybArtikTemizle(); }catch(e){}
    try{ if(typeof window.updateSummary==='function') window.updateSummary(); }catch(e){}
  }

  function restoreItems(rec){
    var p=currentProject();
    if(!p){ notify('Önce ilgili projeyi açın.'); return Promise.resolve(false); }
    if(rec.projectId && String(p.id)!==String(rec.projectId)){
      notify('Bu kayıt "'+(rec.projectName||rec.projectId)+'" projesine ait. Önce o projeyi açın.');
      return Promise.resolve(false);
    }
    var pl=rec.payload||{}, n=0;
    window.__aybUndoRestoring=true;
    try{
      n+=addMissing(p,'objects',pl.objects);
      n+=addMissing(p,'lines',pl.lines);
      n+=addMissing(p,'freeLines',pl.freeLines);
      n+=addMissing(p,'areas',pl.areas);
      n+=addMissing(p,'channels',pl.channels);
      n+=addMissing(p,'aybNotes',pl.aybNotes);
      n+=addMissing(p,'rasters',pl.rasters);
      n+=addMissing(p,'cadLayers',pl.cadLayers);
      n+=addMissing(p,'aybImportLayers',pl.aybImportLayers);
      if(Array.isArray(pl.importFeatures)) pl.importFeatures.forEach(function(item){
        if(!item)return;
        var layer=findById(p.aybImportLayers,item.layerId);
        if(!layer)return;
        if(!Array.isArray(layer.features))layer.features=[];
        var ix=Math.max(0,Math.min(layer.features.length,Number(item.index)||0));
        var feature=clone(item.feature); if(feature==null)return;
        layer.features.splice(ix,0,feature); n++;
      });
      p.updated=new Date().toISOString();
      redraw();
    }finally{ window.__aybUndoRestoring=false; }
    if(!n&&payloadCount(pl)){ notify('Kayıt geri getirilemedi; silme geçmişi korundu.'); return Promise.resolve(false); }
    return forget(rec.id).then(function(){ notify((n||payloadCount(pl))+' kayıt geri alındı.'); return true; });
  }
  function restoreSticky(rec){
    try{
      var key='ayb_stickynotes_v1', arr=JSON.parse(localStorage.getItem(key)||'[]');
      var n=addMissing({a:arr},'a',(rec.payload&&rec.payload.stickyNotes)||[]);
      localStorage.setItem(key,JSON.stringify(arr));
      return forget(rec.id).then(function(){ notify((n||1)+' sabit not geri alındı.'); setTimeout(function(){location.reload()},350); return true; });
    }catch(e){ notify('Sabit not geri alınamadı.'); return Promise.resolve(false); }
  }
  function restorePhotoItem(item){
    return new Promise(function(resolve){
      if(!item||item.objectId==null||item.item==null){resolve(0);return;}
      try{
        var r=indexedDB.open('ayb_photos_db',1);
        r.onupgradeneeded=function(){try{if(!r.result.objectStoreNames.contains('photos'))r.result.createObjectStore('photos',{keyPath:'id'})}catch(e){}};
        r.onerror=function(){resolve(0)};
        r.onsuccess=function(){
          try{
            var db=r.result, tx=db.transaction('photos','readwrite'), st=tx.objectStore('photos'), g=st.get(item.objectId), count=0;
            g.onerror=function(){resolve(0)};
            g.onsuccess=function(){
              var rec=g.result||{id:item.objectId,items:[]}; if(!Array.isArray(rec.items))rec.items=[];
              var ix=Math.max(0,Math.min(rec.items.length,Number(item.index)||0));
              rec.items.splice(ix,0,clone(item.item)); count=rec.items.length; st.put(rec);
            };
            tx.oncomplete=function(){
              try{var p=currentProject(),o=findById(p&&p.objects,item.objectId);if(o){o.props=o.props||{};o.props._fotoAdet=count}}catch(e){}
              try{db.close()}catch(e){} resolve(count?1:0);
            };
            tx.onerror=tx.onabort=function(){try{db.close()}catch(e){} resolve(0)};
          }catch(e){resolve(0)}
        };
      }catch(e){resolve(0)}
    });
  }
  function restorePhotos(rec){
    var p=currentProject();
    if(rec.projectId&&(!p||String(p.id)!==String(rec.projectId))){ notify('Bu fotoğraf başka projeye ait. Önce o projeyi açın.'); return Promise.resolve(false); }
    var pl=rec.payload||{}, jobs=(pl.photos||[]).map(restorePhotoItem), memory=0;
    try{
      var gallery=window.aybKmzFotolar;
      if(Array.isArray(gallery)) (pl.kmzPhotos||[]).forEach(function(item){
        if(!item||!item.photo)return;
        var photo=clone(item.photo); if(!photo)return;
        try{if(photo.blob&&(!photo.url||String(photo.url).indexOf('blob:')===0))photo.url=URL.createObjectURL(photo.blob)}catch(e){}
        var ix=Math.max(0,Math.min(gallery.length,Number(item.index)||0)); gallery.splice(ix,0,photo); memory++;
      });
    }catch(e){}
    return Promise.all(jobs).then(function(done){
      var n=memory; done.forEach(function(x){n+=x||0});
      if(!n){notify('Fotoğraf geri getirilemedi; silme geçmişi korundu.');return false;}
      redraw();
      return forget(rec.id).then(function(){notify(n+' fotoğraf geri alındı.');return true});
    });
  }
  function restoreProject(rec){
    var saved=clone(rec.payload&&rec.payload.project);
    if(!saved||!saved.id){ notify('Proje yedeği okunamadı.'); return Promise.resolve(false); }
    var registry=null;
    try{
      if(typeof projects!=='undefined' && projects) registry=projects;
    }catch(e){}
    try{ if(!registry&&window.projects) registry=window.projects; }catch(e){}
    if(registry&&registry[saved.id]){ notify('Aynı kimlikte proje zaten var; üzerine yazılmadı.'); return Promise.resolve(false); }
    try{
      if(registry) registry[saved.id]=saved;
    }catch(e){ notify('Proje geri yüklenemedi: '+(e&&e.message?e.message:e)); return Promise.resolve(false); }
    var write=Promise.resolve(true);
    try{
      if(registry&&typeof window.aybDepoYaz==='function'){
        write=Promise.resolve(window.aybDepoYaz()).then(function(){
          if(typeof window.aybDepoOku!=='function') return true;
          return Promise.resolve(window.aybDepoOku(saved.id)).then(function(p){return !!(p&&p.id)},function(){return false});
        },function(){return false});
      }
    }catch(e){ write=Promise.resolve(false); }
    return write.then(function(ok){
      if(!ok){
        try{if(registry)delete registry[saved.id]}catch(e){}
        try{if(typeof window.aybDepoSil==='function')window.aybDepoSil(saved.id)}catch(e){}
        notify('Proje büyük depoya yazılamadı; işlem iptal edildi.'); return false;
      }
      try{
        if(typeof window.saveProjects==='function') window.saveProjects();
        else {
          var key='ayb_saha_metraj_v16_projects';
          var all=JSON.parse(localStorage.getItem(key)||'{}'); all[saved.id]=saved;
          localStorage.setItem(key,JSON.stringify(all));
        }
      }catch(e){ notify('Proje listesi güncellenemedi: '+(e&&e.message?e.message:e)); return false; }
      return forget(rec.id).then(function(){ notify('"'+(saved.name||saved.id)+'" projesi geri alındı.'); setTimeout(function(){location.reload()},500); return true; });
    });
  }
  function undo(id){
    var rec=null;
    if(id){ history.some(function(x){if(x.id===id){rec=x;return true}return false}); }
    else rec=history[0]||null;
    if(!rec){ notify('Geri alınacak silme kaydı yok.'); return Promise.resolve(false); }
    if(rec.kind==='project') return restoreProject(rec);
    if(rec.kind==='sticky') return restoreSticky(rec);
    if(rec.kind==='photo') return restorePhotos(rec);
    return restoreItems(rec);
  }
  window.aybUndoLast=function(){return undo()};
  window.aybUndoById=undo;
  window.aybUndoKaydet=function(spec){ var r=makeRecord(spec); if(!r) return null; remember(r,true); return r; };

  /* Proje silme sayfayı yenilediği için kalıcı kayıt tamamlanmadan silmeye izin verilmez. */
  window.aybUndoProjectBeforeDelete=function(summary,id){
    var base=summary||null, pid=id||(base&&base.id)||'';
    var full=null, registry=null;
    try{ if(typeof projects!=='undefined'&&projects) registry=projects; }catch(e){}
    try{ if(!registry&&window.projects) registry=window.projects; }catch(e){}
    try{ if(registry&&registry[pid]&&!registry[pid].__buyuk) full=registry[pid]; }catch(e){}
    var get=full?Promise.resolve(full):Promise.resolve(null);
    try{ if(!full&&typeof window.aybDepoOku==='function') get=Promise.resolve(window.aybDepoOku(pid)); }catch(e){}
    return get.then(function(p){
      p=(p&&p.id)?p:base;
      if(!p||!p.id) return false;
      var r=makeRecord({kind:'project',projectId:p.id,projectName:p.name||p.id,title:'Proje: '+(p.name||p.id),payload:{project:p}});
      if(!r) return false;
      return remember(r,false).then(function(ok){ if(!ok){ history=history.filter(function(x){return x.id!==r.id}); refreshUI(); } return ok; });
    }).catch(function(){return false});
  };

  function findById(arr,id){ for(var i=0;i<(arr||[]).length;i++) if(arr[i]&&String(arr[i].id)===String(id)) return arr[i]; return null; }
  function wrapApp(){
    var A=window.APP; if(!A) return false;
    function wrap(name,builder,deleted){
      var inner=A[name]; if(typeof inner!=='function'||inner.__aybUndo) return;
      var w=function(){
        if(window.__aybUndoRestoring) return inner.apply(this,arguments);
        var spec=null; try{spec=builder.apply(this,arguments)}catch(e){}
        var rec=spec?makeRecord(spec):null;
        var out=inner.apply(this,arguments);
        var gone=false; try{gone=deleted.apply(this,arguments)}catch(e){}
        if(rec&&gone) remember(rec,true);
        return out;
      };
      w.__aybUndo=true;
      try{ if(inner.__aybDel)w.__aybDel=true; if(inner.__aybGeo)w.__aybGeo=true; }catch(e){}
      A[name]=w;
    }
    wrap('deleteObject',function(id){
      var p=currentProject(), o=findById(p&&p.objects,id); if(!o)return null;
      var lines=(p.lines||[]).filter(function(l){return l&&(String(l.start)===String(id)||String(l.end)===String(id))});
      var no=''; try{no=(typeof window.getObjectNo==='function'?window.getObjectNo(o):(o.props&&(o.props.direk_no||o.props.no)))||o.type||'Obje'}catch(e){}
      return {kind:'object',title:String(no)+(lines.length?' + '+lines.length+' bağlı hat':''),payload:{objects:[o],lines:lines}};
    },function(id){return !findById(currentProject()&&currentProject().objects,id)});
    wrap('deleteLine',function(id){ var p=currentProject(), l=findById(p&&p.lines,id); return l?{kind:'line',title:'Hat',payload:{lines:[l]}}:null; },function(id){return !findById(currentProject()&&currentProject().lines,id)});
    wrap('deleteFree',function(id){
      var p=currentProject(); if(!p)return null;
      var f=findById(p.freeLines,id), a=findById(p.areas,id), c=findById(p.channels,id);
      return (f||a||c)?{kind:'drawing',title:c?'Kanal':(a?'Alan / bina':'Çizim / ok'),payload:{freeLines:f?[f]:[],areas:a?[a]:[],channels:c?[c]:[]}}:null;
    },function(id){var p=currentProject();return !findById(p&&p.freeLines,id)&&!findById(p&&p.areas,id)&&!findById(p&&p.channels,id)});
    return true;
  }

  function wrapSelection(o){
    if(!o||o.__aybUndoSelection) return;
    function wrap(name){
      var inner=o[name]; if(typeof inner!=='function'||inner.__aybUndo)return;
      var w=function(){
        var p=currentProject(), sel=o.sel, spec=null, rec=null;
        if(p&&sel){
          var ids=sel.objIds||new Set(), objs=(p.objects||[]).filter(function(x){return ids.has(x.id)});
          var lines=name==='deleteAll'?[].concat(sel.connectedLines||[],sel.innerLines||[]):(sel.connectedLines||[]).slice();
          var uniq={}, clean=[]; lines.forEach(function(l){if(l&&!uniq[l.id]){uniq[l.id]=1;clean.push(l)}});
          var channels=name==='deleteAll'?(sel.channels||[]).slice():[];
          spec={kind:'selection',title:name==='deleteAll'?'Çerçeve seçimi':'Seçili objeler',payload:{objects:objs,lines:clean,channels:channels}};
          rec=makeRecord(spec);
        }
        var out=inner.apply(this,arguments);
        if(rec){ var gone=(rec.payload.objects||[]).some(function(x){return !findById(currentProject()&&currentProject().objects,x.id)}); if(gone) remember(rec,true); }
        return out;
      };
      w.__aybUndo=true; w.__aybDel=true; try{if(inner.__aybGeo)w.__aybGeo=true}catch(e){} o[name]=w;
    }
    wrap('deleteObjects'); wrap('deleteAll'); o.__aybUndoSelection=true;
  }
  var oldSar=window.aybSarSilme;
  if(typeof oldSar==='function'){
    window.aybSarSilme=function(o){ var r=oldSar.apply(this,arguments); try{wrapSelection(o)}catch(e){} return r; };
  }

  function showUndoToast(rec){
    ensureUI();
    var el=document.getElementById('aybUndoToast'); if(!el)return;
    el.querySelector('[data-msg]').textContent=rec.title+' silindi.';
    var b=el.querySelector('[data-now]'); b.onclick=function(){undo(rec.id)};
    el.style.display='flex'; clearTimeout(toastTimer); toastTimer=setTimeout(function(){el.style.display='none'},12000);
  }
  function renderPanel(){
    var box=document.getElementById('aybUndoList'); if(!box)return;
    if(!history.length){box.innerHTML='<div class="ayb-undo-empty">Geri alınabilecek silme kaydı yok.</div>';return;}
    box.innerHTML=history.map(function(r){
      var p=currentProject(), uygun=r.kind==='project'||(p&&String(p.id)===String(r.projectId));
      return '<div class="ayb-undo-row"><div><b>'+esc(r.title)+'</b><span>'+esc(r.projectName||'')+' · '+esc(trTime(r.ts))+'</span></div>'+
        '<button data-undo-id="'+esc(r.id)+'" '+(uygun?'':'disabled')+'>'+ (uygun?'Geri Al':'Projeyi Aç') +'</button></div>';
    }).join('');
  }
  function refreshUI(){
    var b=document.getElementById('aybUndoBtn'); if(b){var s=b.querySelector('small'); if(s)s.textContent='Silinenler'+(history.length?' ('+history.length+')':'');}
    renderPanel();
  }
  function ensureButton(){
    if(document.getElementById('aybUndoBtn')) return true;
    var ref=document.getElementById('aybTopluSilBtn')||document.getElementById('aybYenileBtn')||document.getElementById('btnSave');
    if(!ref||!ref.parentNode)return false;
    var b=document.createElement('button'); b.id='aybUndoBtn'; b.type='button'; b.className=ref.className;
    b.title='Silinenler — yanlışlıkla silinen kayıtları geri al';
    b.innerHTML='<div class="ayb-pro-ico" style="color:#16a34a">↶</div><small>Silinenler</small>';
    b.onclick=function(e){try{e.preventDefault();e.stopPropagation()}catch(_){} var m=document.getElementById('aybUndoModal');if(m){renderPanel();m.style.display='flex'}};
    ref.parentNode.insertBefore(b,ref.nextSibling); refreshUI(); return true;
  }
  function ensureUI(){
    if(!document.getElementById('aybUndoCss')){
      var st=document.createElement('style'); st.id='aybUndoCss'; st.textContent=
        '#aybUndoToast{position:fixed;left:50%;bottom:76px;transform:translateX(-50%);z-index:2147483000;display:none;align-items:center;gap:10px;background:#0f172a;color:#fff;border:1px solid #22c55e;border-radius:12px;padding:9px 12px;box-shadow:0 10px 32px #0008;font:700 13px system-ui;max-width:92vw}'+
        '#aybUndoToast button{border:0;border-radius:8px;padding:8px 13px;font-weight:900;cursor:pointer}#aybUndoToast [data-now]{background:#22c55e;color:#052e16}#aybUndoToast [data-list]{background:#334155;color:#fff}'+
        '#aybUndoModal{position:fixed;inset:0;z-index:2147483100;display:none;align-items:center;justify-content:center;background:#0f172acc;padding:12px}'+
        '.ayb-undo-card{width:min(680px,96vw);max-height:86vh;display:flex;flex-direction:column;background:#fff;border-radius:14px;box-shadow:0 24px 70px #0009;overflow:hidden;font:13px system-ui}'+
        '.ayb-undo-head{display:flex;align-items:center;justify-content:space-between;padding:12px 15px;background:#0f172a;color:#fff;font-size:17px;font-weight:900}.ayb-undo-head button{border:0;background:#dc2626;color:#fff;border-radius:8px;width:34px;height:32px;font-size:20px}'+
        '#aybUndoList{padding:10px;overflow:auto}.ayb-undo-row{display:grid;grid-template-columns:1fr 100px;gap:10px;align-items:center;border-bottom:1px solid #e2e8f0;padding:9px 5px}.ayb-undo-row:last-child{border-bottom:0}.ayb-undo-row b{display:block;color:#0f172a}.ayb-undo-row span{display:block;color:#64748b;font-size:11px;margin-top:3px}.ayb-undo-row button{height:34px;border:0;border-radius:8px;background:#16a34a;color:#fff;font-weight:900}.ayb-undo-row button:disabled{background:#cbd5e1;color:#64748b}.ayb-undo-empty{padding:26px;text-align:center;color:#64748b}'+
        '@media(max-width:700px){#aybUndoToast{bottom:112px}.ayb-undo-row{grid-template-columns:1fr 88px}}';
      (document.head||document.documentElement).appendChild(st);
    }
    if(!document.getElementById('aybUndoToast')){
      var t=document.createElement('div'); t.id='aybUndoToast'; t.innerHTML='<span data-msg></span><button data-now>GERİ AL</button><button data-list>Silinenler</button>'; document.body.appendChild(t);
      t.querySelector('[data-list]').onclick=function(){var m=document.getElementById('aybUndoModal');if(m){renderPanel();m.style.display='flex'}};
    }
    if(!document.getElementById('aybUndoModal')){
      var m=document.createElement('div'); m.id='aybUndoModal'; m.innerHTML='<div class="ayb-undo-card"><div class="ayb-undo-head"><span>↶ Silinenler / Geri Al</span><button data-close>×</button></div><div id="aybUndoList"></div></div>'; document.body.appendChild(m);
      m.querySelector('[data-close]').onclick=function(){m.style.display='none'}; m.onclick=function(e){if(e.target===m)m.style.display='none'};
      m.addEventListener('click',function(e){var b=e.target&&e.target.closest&&e.target.closest('[data-undo-id]');if(b&&!b.disabled)undo(b.getAttribute('data-undo-id'))});
    }
    ensureButton();
  }

  function boot(){
    ensureUI(); wrapApp();
    dbAll().then(function(all){ history=trimHistory((all||[]).sort(function(a,b){return (b.ts||0)-(a.ts||0)})); refreshUI();
      if(history[0]&&history[0].kind==='project'&&Date.now()-history[0].ts<180000) showUndoToast(history[0]);
    });
    var n=0, iv=setInterval(function(){wrapApp();ensureButton();if(++n>40)clearInterval(iv)},500);
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot);else boot();
})();
