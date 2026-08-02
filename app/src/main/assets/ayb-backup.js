/* ============================================================
   BY EDŞ Saha - Tam veri yedeği (V2)
   Hazırlayan: Bayram YARAŞ

   - localStorage proje listesi + IndexedDB'deki büyük proje gövdeleri
   - sürekli tarama yok: saveProject olayı sonrasında, en çok 2 dakikada bir
   - son 6 tam cihaz içi anlık görüntü
   ============================================================ */
(function () {
  'use strict';
  var PREFIX='ayb', MAX_SNAP=6, MIN_AUTO_MS=120000;
  var lastHash='', lastAuto=0, autoTimer=null, busy=null;

  function bkToast(msg){
    try{
      var t=document.createElement('div'); t.textContent=msg;
      t.style.cssText='position:fixed;left:50%;top:14px;transform:translateX(-50%);z-index:100050;background:#0d1b34;color:#e7eeff;border:1px solid #3a6ad4;border-radius:10px;padding:12px 16px;font:600 14px system-ui;max-width:90vw;text-align:center;white-space:pre-line;word-break:break-word;box-shadow:0 8px 30px rgba(0,0,0,.5)';
      document.body.appendChild(t);
      setTimeout(function(){ try{ t.style.transition='opacity .5s'; t.style.opacity='0'; setTimeout(function(){t.remove();},500); }catch(e){} },5000);
    }catch(e){}
  }

  function collectKeys(){
    var out={};
    try{
      for(var i=0;i<localStorage.length;i++){
        var k=localStorage.key(i);
        if(k&&k.toLowerCase().indexOf(PREFIX)===0) out[k]=localStorage.getItem(k);
      }
    }catch(e){}
    return out;
  }
  function cloneSafe(v){
    try{return JSON.parse(JSON.stringify(v,function(k,x){
      if(typeof x==='function') return undefined;
      if(typeof FileSystemHandle!=='undefined'&&x instanceof FileSystemHandle) return undefined;
      return x;
    }));}catch(e){return null;}
  }
  async function collectProjects(){
    try{ if(typeof window.aybDepoBekle==='function') await window.aybDepoBekle(); }catch(e){}
    var list=[];
    try{ if(typeof window.aybDepoHepsi==='function') list=await window.aybDepoHepsi(); }catch(e){ list=[]; }
    if(!Array.isArray(list)) list=[];
    /* Açık proje, gecikmeli depo yazısından daha yeniyse onu kullan. */
    try{
      var cur=window.project;
      if(cur&&cur.id&&!cur.__buyuk){
        var ix=list.findIndex(function(p){return p&&p.id===cur.id;});
        if(ix<0) list.push(cur);
        else if(String(cur.updated||'')>=String(list[ix].updated||'')) list[ix]=cur;
      }
    }catch(e){}
    var out=[];
    for(var i=0;i<list.length;i++){ var c=cloneSafe(list[i]); if(c&&c.id) out.push(c); }
    return out;
  }
  async function pkg(){
    return {app:'BY EDŞ Saha Programı',imza:'Bayram YARAŞ',format:'AYB-TAM-YEDEK-V2',
      ts:new Date().toISOString(),keys:collectKeys(),projects:await collectProjects()};
  }
  function hashOf(p){
    var m=(p.projects||[]).map(function(x){return [x.id,x.updated,
      (x.objects||[]).length,(x.lines||[]).length,(x.aybImportLayers||[]).length].join(':');}).sort().join('|');
    var s=m+'|'+Object.keys(p.keys||{}).sort().map(function(k){return k+':'+String(p.keys[k]||'').length;}).join('|'), h=0;
    for(var i=0;i<s.length;i++) h=(h*31+s.charCodeAt(i))|0;
    return h+'_'+s.length;
  }
  function nativeBackupSave(name,json){
    try{
      if(window.AYBNative&&typeof AYBNative.saveBackup==='function') return String(AYBNative.saveBackup(name,json)||'');
    }catch(e){}
    return '';
  }

  function openDB(){
    return new Promise(function(res,rej){
      var r=indexedDB.open('ayb_yedek_db',2);
      r.onupgradeneeded=function(){ if(!r.result.objectStoreNames.contains('snaps')) r.result.createObjectStore('snaps',{keyPath:'ts'}); };
      r.onsuccess=function(){res(r.result);}; r.onerror=function(){rej(r.error);};
    });
  }
  function idbPut(snap){
    return openDB().then(function(db){return new Promise(function(res){
      var tx=db.transaction('snaps','readwrite'), st=tx.objectStore('snaps'); st.put(snap);
      st.getAllKeys().onsuccess=function(e){var keys=e.target.result||[];if(keys.length>MAX_SNAP)keys.sort().slice(0,keys.length-MAX_SNAP).forEach(function(k){st.delete(k);});};
      tx.oncomplete=function(){try{db.close();}catch(e){}res(true);}; tx.onerror=tx.onabort=function(){try{db.close();}catch(e){}res(false);};
    });}).catch(function(){return false;});
  }
  function idbList(){
    return openDB().then(function(db){return new Promise(function(res){
      var out=[], tx=db.transaction('snaps','readonly');
      tx.objectStore('snaps').openCursor().onsuccess=function(e){var c=e.target.result;if(c){out.push({ts:c.value.ts,adet:Object.keys(c.value.keys||{}).length,proje:(c.value.projects||[]).length});c.continue();}else{try{db.close();}catch(_){}res(out.sort(function(a,b){return a.ts<b.ts?1:-1;}));}};
    });}).catch(function(){return[];});
  }
  function idbGet(ts){
    return openDB().then(function(db){return new Promise(function(res){var tx=db.transaction('snaps','readonly'),r=tx.objectStore('snaps').get(ts);r.onsuccess=function(){try{db.close();}catch(_){}res(r.result||null);};r.onerror=function(){try{db.close();}catch(_){}res(null);};});});
  }
  function projectDbPut(list){
    if(!Array.isArray(list)||!list.length) return Promise.resolve(true);
    return new Promise(function(res){
      try{
        var r=indexedDB.open('ayb_saha_depo_v1',1);
        r.onupgradeneeded=function(){if(!r.result.objectStoreNames.contains('projeler'))r.result.createObjectStore('projeler',{keyPath:'id'});};
        r.onerror=function(){res(false);};
        r.onsuccess=function(){var db=r.result,tx=db.transaction('projeler','readwrite'),st=tx.objectStore('projeler');list.forEach(function(p){if(p&&p.id)try{st.put(p);}catch(e){}});tx.oncomplete=function(){try{db.close();}catch(_){}res(true);};tx.onerror=tx.onabort=function(){try{db.close();}catch(_){}res(false);};};
      }catch(e){res(false);}
    });
  }
  async function restorePackage(snap){
    if(!snap||typeof snap!=='object') return false;
    try{var once=await pkg();once.ts=new Date().toISOString()+'_restore_oncesi';await idbPut(once);}catch(e){}
    var ok=0, keys=snap.keys||snap;
    if(keys&&typeof keys==='object') for(var k in keys){try{localStorage.setItem(k,keys[k]);ok++;}catch(e){}}
    var pOk=await projectDbPut(snap.projects||[]);
    return ok>0&&pOk;
  }

  async function autoBackup(force){
    if(busy) return busy;
    busy=(async function(){
      var p=await pkg(), h=hashOf(p);
      if(!force&&h===lastHash) return false;
      var ok=await idbPut(p); if(ok){lastHash=h;lastAuto=Date.now();}
      if(ok) nativeBackupSave('AYB_Yedek_SON.json',JSON.stringify(p));
      return ok;
    })();
    try{return await busy;}finally{busy=null;}
  }
  function queueAuto(){
    if(autoTimer) return;
    var wait=Math.max(1200,MIN_AUTO_MS-(Date.now()-lastAuto));
    autoTimer=setTimeout(function(){autoTimer=null;autoBackup(false);},wait);
  }
  function bindSaveHook(){
    var cur=window.saveProject;
    if(typeof cur!=='function'||cur.__aybTamYedek) return false;
    var w=function(){var r=cur.apply(this,arguments);queueAuto();return r;};
    try{for(var k in cur)if(Object.prototype.hasOwnProperty.call(cur,k))w[k]=cur[k];}catch(e){}
    w.__aybTamYedek=true; window.saveProject=w; return true;
  }
  async function downloadNow(){
    try{
      var p=await pkg(), json=JSON.stringify(p,null,2), fname='AYB_Tam_Yedek_'+p.ts.slice(0,10)+'.json';
      await idbPut(p); lastHash=hashOf(p); lastAuto=Date.now();
      var nativeResult=nativeBackupSave(fname,json);
      if(nativeResult.indexOf('OK|')===0){
        nativeBackupSave('AYB_Yedek_SON.json',json);
        bkToast('Tam yedek kaydedildi ✓\n'+nativeResult.slice(3));
      }else{
        var blob=new Blob([json],{type:'application/json'}),a=document.createElement('a');a.href=URL.createObjectURL(blob);a.download=fname;a.style.display='none';document.body.appendChild(a);a.click();setTimeout(function(){try{URL.revokeObjectURL(a.href);a.remove();}catch(e){}},1500);
        bkToast('Tam yedek alındı: '+(p.projects||[]).length+' proje.');
      }
    }catch(err){alert('Yedek hatası: '+(err&&err.message?err.message:err));}
  }
  function restoreFromFile(){
    var inp=document.createElement('input');inp.type='file';inp.accept='.json,application/json';
    inp.onchange=function(){var f=inp.files&&inp.files[0];if(!f)return;var rd=new FileReader();rd.onload=async function(){try{var obj=JSON.parse(rd.result);if(!confirm('Yedekten geri yüklenecek. Mevcut veriler bu yedekle değişecek. Devam?'))return;if(await restorePackage(obj)){alert('Geri yüklendi. Program yenileniyor.');location.reload();}else alert('Geri yükleme başarısız.');}catch(e){alert('Dosya okunamadı / bozuk.');}};rd.readAsText(f);};inp.click();
  }
  function showSnaps(){
    idbList().then(function(list){if(!list.length){alert('Henüz otomatik yedek yok.');return;}var msg=list.map(function(s,i){return(i+1)+') '+new Date(s.ts.slice(0,24)).toLocaleString('tr-TR')+'  ('+s.proje+' proje)';}).join('\n');var n=parseInt(prompt('CİHAZDAKİ TAM YEDEKLER:\n\n'+msg+'\n\nGeri yüklemek için numara yazın:'),10);if(n>=1&&n<=list.length)idbGet(list[n-1].ts).then(async function(s){if(s&&await restorePackage(s)){alert('Geri yüklendi. Yenileniyor.');location.reload();}else alert('Geri yükleme başarısız.');});});
  }

  window.aybBackup={now:function(){return autoBackup(true);},download:downloadNow,restore:restoreFromFile,snaps:showSnaps,lastTime:function(){return lastAuto?new Date(lastAuto).toLocaleTimeString('tr-TR'):'Henüz yok';}};
  window.aybBackupNow=function(){return autoBackup(true);};
  window.addEventListener('load',function(){bindSaveHook();setTimeout(function(){autoBackup(true);},1800);});
  document.addEventListener('visibilitychange',function(){if(document.hidden)autoBackup(false);});
  window.addEventListener('pagehide',function(){try{autoBackup(false);}catch(e){}});
})();
