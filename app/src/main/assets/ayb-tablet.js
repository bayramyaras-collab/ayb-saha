/* ============================================================
   AYB Saha - Tablet Arayuz Eklentisi (v3)
   Hazirlayan: Bayram YARAS  -  0530 630 05 40
   - Ekrana sigdir (kucultmeden)
   - Uydu Ac/Kapat duzeltmesi
   - Eklenen dugmeler TEK toplanabilir kutuda (sag alt), cizim akisini bozmaz
   - Temiz Ekran (bilgi katmanlarini gizle/ac, tam ekran)
   - Yapiskan not (sari not) ekleme
   - Direk formundan Durdurucu ve Kafes alanlarini kaldirma
   - Disa aktarma -> "nereye gonderilsin?" (WhatsApp/Dosyalar) + Belgeler'e kaydet
   - Programi Kapat (Proje grubunda): once yedek sonra kapat
   ** Bundan sonra tablet arayuz degisikligi icin SADECE bu dosyayi guncelleyin **
   ============================================================ */
(function () {
  'use strict';
  if(window.__aybTabletInit) return; window.__aybTabletInit=true;
  function $(s){ return document.querySelector(s); }
  function ready(fn){ if(document.body) fn(); else window.addEventListener('load', fn); }
  // Sembollu KMZ modulunu yukle
  ready(function(){ try{ if(!document.getElementById('ayb-kmz-loader')){ var k=document.createElement('script'); k.id='ayb-kmz-loader'; k.src='ayb-kmz.js'; document.body.appendChild(k); } }catch(e){} });

  /* ---------- 1) EKRANA SIGDIR (kucultmeden) ---------- */
  (function(){
    var css=document.createElement('style'); css.id='ayb-tablet-fit';
    css.textContent=[
      'html,body{max-width:100%!important;overflow-x:hidden!important;}',
      '.app{max-width:100vw!important;}',
      '.app>*{min-width:0!important;}',
      '.titlebar{flex-wrap:wrap!important;}',
      /* UST MENULER: kucultme YOK -> parmakla yana kaydir (swipe) */
      '.workbar,.ayb-native-clean-workbar{flex-wrap:nowrap!important;overflow-x:auto!important;overflow-y:hidden!important;-webkit-overflow-scrolling:touch;max-width:100vw!important;width:100%!important;min-width:0!important;box-sizing:border-box!important;scroll-snap-type:none;}',
      '.workbar::-webkit-scrollbar,.ayb-native-clean-workbar::-webkit-scrollbar{height:8px;}',
      '.workbar::-webkit-scrollbar-thumb,.ayb-native-clean-workbar::-webkit-scrollbar-thumb{background:#8aa0c8;border-radius:4px;}',
      '.ayb-native-clean-workbar>*{flex:0 0 auto!important;}',
      '.ayb-pro-group{flex:0 0 auto!important;}',
      '.ayb-pro-row{flex-wrap:nowrap!important;}',
      /* sekme cubugu (Proje/Cizim/Duzenle...) da kaysin */
      '.tabs{flex-wrap:nowrap!important;overflow-x:auto!important;overflow-y:hidden!important;-webkit-overflow-scrolling:touch;width:100%!important;min-width:0!important;box-sizing:border-box!important;}',
      /* UST SEKME CUBUGU (Proje/Cizim/Duzenle/Analiz/Rapor/Baski) - grid yerine yana kaydir */
      '#aybRibbonTabs{display:flex!important;flex-wrap:nowrap!important;grid-template-columns:none!important;overflow-x:auto!important;overflow-y:hidden!important;-webkit-overflow-scrolling:touch;height:auto!important;min-height:31px!important;width:100%!important;min-width:0!important;box-sizing:border-box!important;}',
      '#aybRibbonTabs>*{flex:0 0 auto!important;min-width:78px!important;}',
      '#aybRibbonTabs::-webkit-scrollbar{height:7px;}',
      '#aybRibbonTabs::-webkit-scrollbar-thumb{background:#8aa0c8;border-radius:4px;}',
      '.ayb-ribbon-tab{overflow:visible!important;text-overflow:clip!important;}',
      /* alet cubugu (aybRibbonTools) da kaysin */
      '#aybRibbonTools{display:flex!important;flex-wrap:nowrap!important;overflow-x:auto!important;overflow-y:hidden!important;-webkit-overflow-scrolling:touch;min-width:0!important;max-width:100vw!important;}',
      '.tabs::-webkit-scrollbar{height:6px;}',
      /* Temiz Ekran: bilgi katmanlarini gizle */
      'body.ayb-temiz .coord-overlay,body.ayb-temiz .hint,body.ayb-temiz #kfMeasureInfo,body.ayb-temiz #aybSahaImza{display:none!important;}'
    ].join('');
    (document.head||document.documentElement).appendChild(css);
    setTimeout(function(){ try{ window.dispatchEvent(new Event('resize')); }catch(e){} },400);
  })();

  /* ---------- 2) UYDU AC/KAPAT DUZELTMESI ---------- */
  function fixSat(){
    var b=$('#btnBaseOffToggle'), s=$('#baseMapSelect');
    if(!b||!s) return false;
    b.onclick=function(){
      try{
        if(s.value==='none'){
          s.value=localStorage.getItem('ayb_last_real_base_map_v1')||'sat';
        } else {
          localStorage.setItem('ayb_last_real_base_map_v1', s.value);
          s.value='none';
        }
        s.dispatchEvent(new Event('change',{bubbles:true}));   // switchBase calissin
        if(window.aybSyncBaseToggleButton) window.aybSyncBaseToggleButton();
      }catch(e){}
    };
    return true;
  }

  /* ---------- 3) ARAC BITIRME / OLCU DURDURMA ---------- */
  function measureBtn(){ return $('#kfMeasureBtn')||$('#kfMeasureToolBtn'); }
  function measureOn(){ var b=measureBtn(); return !!(b&&b.classList.contains('on')); }
  function stopMeasure(){ try{ var b=measureBtn(); if(b&&b.classList.contains('on')) b.click(); }catch(e){} }
  function finishAll(){
    try{ if(window.setTool) window.setTool(null); }catch(e){}
    try{ ['keydown','keyup'].forEach(function(t){ document.dispatchEvent(new KeyboardEvent(t,{key:'Escape',code:'Escape',keyCode:27,which:27,bubbles:true})); }); }catch(e){}
    stopMeasure();
  }
  // Yeni cizim aracina gecince Olcu dursun; Olcu'ye basinca cizim dursun
  document.addEventListener('click', function(e){
    var t=e.target.closest?e.target.closest('[data-tool]'):null;
    if(t){ window.__aybEditId=null; if(measureOn()) stopMeasure(); return; }
    var mb=e.target.closest?e.target.closest('#kfMeasureToolBtn,#kfMeasureBtn'):null;
    if(mb){ try{ if(window.setTool) window.setTool(null); }catch(_){ } }
  }, true);

  /* ---------- 4) TEMIZ KUTU + DISA AKTAR (once WhatsApp, sonra kaydet) ---------- */
  /* Uygulama-ici TEMIZ kutu (file:// ASLA cikmaz) */
  function aybModal(msg, title){
    try{
      var ov=document.createElement('div');
      ov.style.cssText='position:fixed;inset:0;z-index:2147483000;background:rgba(4,10,22,.55);display:flex;align-items:center;justify-content:center;padding:22px;';
      var box=document.createElement('div');
      box.style.cssText='max-width:430px;width:100%;background:#fff;border-radius:16px;box-shadow:0 18px 50px rgba(0,0,0,.42);overflow:hidden;font-family:system-ui,Arial;';
      var h=document.createElement('div');
      h.style.cssText='background:linear-gradient(90deg,#123a6b,#1769c4);color:#fff;font-weight:800;font-size:15px;padding:12px 16px;';
      h.textContent=title||'Körfezim Saha';
      var b=document.createElement('div');
      b.style.cssText='padding:16px 16px 6px;color:#14243c;font-size:14px;line-height:1.5;white-space:pre-wrap;';
      b.textContent=String(msg==null?'':msg);
      var ft=document.createElement('div'); ft.style.cssText='padding:10px 16px 16px;text-align:right;';
      var ok=document.createElement('button'); ok.textContent='Tamam';
      ok.style.cssText='background:#1769c4;color:#fff;border:0;border-radius:10px;font-weight:700;font-size:14px;padding:10px 24px;';
      ok.onclick=function(){ try{ov.remove();}catch(e){} };
      ft.appendChild(ok); box.appendChild(h); box.appendChild(b); box.appendChild(ft); ov.appendChild(box);
      ov.addEventListener('click',function(e){ if(e.target===ov) ov.remove(); });
      (document.body||document.documentElement).appendChild(ov);
    }catch(e){}
  }
  window.aybModal=aybModal;
  /* TUM alert'leri temiz kutuya cevir; klasor uyarilarini yut */
  try{
    window.alert=function(m){
      try{ if(typeof m==='string' && /(klas[oö]r seçmeyi desteklemiyor|doğrudan klasör|Windows Chrome veya Edge|klasör yazma izni)/i.test(m)) return; }catch(e){}
      aybModal(m);
    };
    window.__aybAlertPatched=true; window.__aybAlertClean=true;
  }catch(e){}

  function aybHasNative(){ return !!(window.AYBNative && window.AYBNative.exportFile); }
  function aybNativeSend(filename, blob, mime){
    try{
      var fr=new FileReader();
      fr.onload=function(){ var str=String(fr.result||''); var i=str.indexOf(','); var b64=i>=0?str.slice(i+1):str;
        try{ AYBNative.exportFile(filename, b64, mime||blob.type||'application/octet-stream'); }
        catch(err){ aybModal('Kaydedilemedi: '+(err&&err.message?err.message:err)); } };
      fr.onerror=function(){ aybModal('Dosya okunamadi.'); };
      fr.readAsDataURL(blob);
    }catch(e){ aybModal('Disa aktarma hatasi: '+(e&&e.message?e.message:e)); }
  }
  /* ANA DISA-AKTARMA: 1) WhatsApp (Web Share, Java gerekmez) 2) Native kaydet 3) indir */
  function aybShareFile(filename, blob, mime){
    var m=mime||blob.type||'application/octet-stream';
    try{
      var file=new File([blob], filename, {type:m});
      if(navigator.canShare && navigator.canShare({files:[file]})){
        navigator.share({files:[file], title:filename}).catch(function(err){
          if(err && /abort|cancel/i.test(err.name||'')) return;
          if(aybHasNative()) aybNativeSend(filename, blob, m);
        });
        return;
      }
    }catch(e){}
    if(aybHasNative()){ aybNativeSend(filename, blob, m); return; }
    try{ var url=URL.createObjectURL(blob); var a=document.createElement('a');
      a.href=url; a.download=filename; a.style.display='none'; document.body.appendChild(a); a.click();
      setTimeout(function(){ try{URL.revokeObjectURL(url); a.remove();}catch(_){} },800);
    }catch(e){ aybModal('Disa aktarma hatasi: '+(e&&e.message?e.message:e)); }
  }
  window.aybShareFile=aybShareFile;

  try{ window.aybDownloadFile=function(filename, content, mime){
    var blob = content instanceof Blob ? content : new Blob([content], {type:mime||'application/octet-stream'});
    aybShareFile(filename, blob, mime);
  }; }catch(e){}

  /* METRAJ EXCEL */
  try{ if(window.XLSX && typeof XLSX.write==='function'){
    XLSX.writeFile=function(wb, filename, opts){
      try{ var name=filename||'metraj.xlsx';
        var b64=XLSX.write(wb, {bookType:'xlsx', type:'base64'});
        var mm='application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';
        var bin=atob(b64); var arr=new Uint8Array(bin.length); for(var i=0;i<bin.length;i++) arr[i]=bin.charCodeAt(i);
        aybShareFile(name, new Blob([arr],{type:mm}), mm);
      }catch(e){ aybModal('Excel hatasi: '+(e&&e.message?e.message:e)); }
    };
  } }catch(e){}

  /* a[download] tiklamalari (KMZ-sembollu vb.) -> aybShareFile */
  document.addEventListener('click', function(e){
    var a=null;
    if(e.target){ if(e.target.tagName==='A'&&e.target.hasAttribute('download')) a=e.target;
      else if(e.target.closest) a=e.target.closest('a[download]'); }
    if(!a) return;
    var href=a.href||''; if(href.indexOf('blob:')!==0&&href.indexOf('data:')!==0) return;
    var name=a.getAttribute('download')||'AYB_dosya';
    e.preventDefault(); e.stopImmediatePropagation();
    fetch(href).then(function(r){return r.blob();}).then(function(blob){ aybShareFile(name, blob, blob.type); })
      .catch(function(err){ aybModal('Dosya hazirlanamadi: '+(err&&err.message?err.message:err)); });
  }, true);

  /* ---------- 5) DIREK FORMU: Durdurucu + Kafes alanlarini kaldir ---------- */
  /* Direk/Trafo alanlari KAYNAKTAN silindi; arka plan gozlemcisi kaldirildi. */


  /* ---------- 6) PROGRAMI KAPAT (Proje grubu) ---------- */
  function addCloseBtn(){
    if($('#aybCloseBtn')) return true;
    var save=$('#btnSave'); if(!save) return false;
    var b=document.createElement('button');
    b.id='aybCloseBtn'; b.className=save.className; b.title='Programi Kapat';
    b.innerHTML='<div class="ayb-pro-ico">⏻</div><small>Kapat</small>';
    b.onclick=function(){
      try{ if(window.aybBackup) window.aybBackup.now(); else if(window.aybBackupNow) window.aybBackupNow(); }catch(e){}
      setTimeout(function(){ try{ if(window.AYBNative&&AYBNative.closeApp){ AYBNative.closeApp(); return; } }catch(e){} try{ window.close(); }catch(e){} }, 500);
    };
    save.parentNode.insertBefore(b, save.nextSibling);
    return true;
  }

  /* ---------- 7) YAPISKAN NOTLAR (sari not) ---------- */
  var NKEY='ayb_stickynotes_v1';
  function loadNotes(){ try{ return JSON.parse(localStorage.getItem(NKEY)||'[]'); }catch(e){ return []; } }
  function saveNotes(a){ try{ localStorage.setItem(NKEY, JSON.stringify(a)); }catch(e){} }
  function renderNote(n){
    var el=document.createElement('div'); el.className='ayb-note'; el.dataset.id=n.id;
    el.style.cssText='position:fixed;z-index:99970;left:'+n.x+'%;top:'+n.y+'%;width:170px;min-height:90px;'
      +'background:#fff59d;border:1px solid #d4b106;border-radius:6px;box-shadow:0 6px 18px rgba(0,0,0,.35);'
      +'font:600 13px system-ui;color:#3a2f00;display:flex;flex-direction:column;overflow:hidden';
    var bar=document.createElement('div');
    bar.style.cssText='display:flex;align-items:center;justify-content:space-between;background:#ffe082;padding:3px 6px;cursor:move;touch-action:none';
    bar.innerHTML='<span>📌 Not</span>';
    var del=document.createElement('span'); del.textContent='✕'; del.title='Notu sil'; del.style.cssText='cursor:pointer;font-weight:900;font-size:18px;line-height:1;padding:2px 8px;color:#b30000';
    del.onclick=function(){ el.remove(); var a=loadNotes().filter(function(x){return x.id!==n.id;}); saveNotes(a); };
    bar.appendChild(del);
    var ta=document.createElement('textarea'); ta.value=n.text||''; ta.placeholder='Bilgi yaz...';
    ta.style.cssText='flex:1;border:0;background:transparent;resize:none;padding:6px;font:600 13px system-ui;color:#3a2f00;outline:none';
    ta.oninput=function(){ var a=loadNotes(); var f=a.filter(function(x){return x.id===n.id;})[0]; if(f){ f.text=ta.value; saveNotes(a); } };
    el.appendChild(bar); el.appendChild(ta); document.body.appendChild(el);
    // suruklenebilir (dokunmatik + fare)
    var drag=null;
    function down(e){ var p=e.touches?e.touches[0]:e; drag={dx:p.clientX-el.offsetLeft, dy:p.clientY-el.offsetTop}; e.preventDefault(); }
    function move(e){ if(!drag) return; var p=e.touches?e.touches[0]:e;
      var x=p.clientX-drag.dx, y=p.clientY-drag.dy;
      el.style.left=Math.max(0,Math.min(window.innerWidth-40,x))/window.innerWidth*100+'%';
      el.style.top=Math.max(0,Math.min(window.innerHeight-30,y))/window.innerHeight*100+'%'; }
    function up(){ if(!drag) return; drag=null; var a=loadNotes(); var f=a.filter(function(x){return x.id===n.id;})[0];
      if(f){ f.x=parseFloat(el.style.left); f.y=parseFloat(el.style.top); saveNotes(a); } }
    bar.addEventListener('mousedown',down); bar.addEventListener('touchstart',down,{passive:false});
    window.addEventListener('mousemove',move); window.addEventListener('touchmove',move,{passive:false});
    window.addEventListener('mouseup',up); window.addEventListener('touchend',up);
  }
  function aybToast(msg){
    try{
      var t=document.createElement('div'); t.textContent=msg;
      t.style.cssText='position:fixed;left:50%;top:13%;transform:translateX(-50%);z-index:100050;'
        +'background:#0d1b34;color:#e7eeff;border:1px solid #3a6ad4;border-radius:10px;padding:12px 16px;'
        +'font:600 14px system-ui;max-width:88vw;text-align:center;box-shadow:0 8px 30px rgba(0,0,0,.5)';
      document.body.appendChild(t);
      setTimeout(function(){ try{ t.style.transition='opacity .5s'; t.style.opacity='0'; setTimeout(function(){t.remove();},500);}catch(e){} },3600);
    }catch(e){}
  }
  function addNote(){
    /* Haritaya SABIT not: uygulamanin kendi 'not' araci (koordinata baglanir, zoom/kaydirmada yerinde kalir, disa aktarima girer) */
    var ok=false;
    try{ if(typeof window.setTool==='function'){ window.setTool('not'); ok=true; } }catch(e){}
    try{ var p=document.getElementById('aybToolboxPanel'); if(p) p.style.display='none'; }catch(e){}
    if(ok){ aybToast('📝 Notu koymak istediğiniz yere haritada DOKUNUN. Not oraya sabitlenir; yakınlaştırıp kaydırınca yerinde kalır. Silmek için nota dokunup açılan formdan silin.'); }
    else { var a=loadNotes(); var n={id:'n'+Date.now(), text:'', x:40, y:30}; a.push(n); saveNotes(a); renderNote(n); }
  }
  ready(function(){ loadNotes().forEach(renderNote); });

  /* ---------- 8) TEMIZ EKRAN ---------- */
  function toggleTemiz(){ document.body.classList.toggle('ayb-temiz');
    setTimeout(function(){ try{ window.dispatchEvent(new Event('resize')); }catch(e){} },100);
    return document.body.classList.contains('ayb-temiz');
  }

  /* ---------- 9) TEK TOPLANABILIR KUTU (sag alt) + BITIR ---------- */
  ready(function(){
    // Programi Kapat'i Proje grubuna ekle
    if(!addCloseBtn()){ var t1=setInterval(function(){ if(addCloseBtn()) clearInterval(t1); },500); setTimeout(function(){clearInterval(t1);},10000); }
    // Uydu duzeltmesini bagla
    if(!fixSat()){ var t2=setInterval(function(){ if(fixSat()) clearInterval(t2); },500); setTimeout(function(){clearInterval(t2);},10000); }

    var wrap=document.createElement('div');
    wrap.style.cssText='position:fixed;right:8px;bottom:8px;z-index:99960;display:flex;flex-direction:column;align-items:flex-end;gap:6px';
    // BITIR (kucuk, sag alt)
    var fin=document.createElement('button'); fin.textContent='✕ Bitir';
    fin.style.cssText='font:700 13px system-ui;padding:8px 12px;border:0;border-radius:20px;background:#c62828;color:#fff;box-shadow:0 3px 10px rgba(0,0,0,.35)';
    fin.onclick=finishAll;
    // Panel
    var panel=document.createElement('div'); panel.id='aybToolboxPanel';
    panel.style.cssText='display:none;flex-direction:column;gap:6px;background:#0d1b34;border:1px solid #24406e;border-radius:12px;padding:8px;box-shadow:0 8px 30px rgba(0,0,0,.5);max-height:70vh;overflow-y:auto';
    function item(txt,fn,col){ var x=document.createElement('button'); x.textContent=txt; x.onclick=fn;
      x.style.cssText='font:600 13px system-ui;padding:9px 12px;border-radius:9px;border:1px solid #24406e;background:'+(col||'#12213f')+';color:#e7eeff;text-align:left;white-space:nowrap'; return x; }
    var temizBtn=item('👁️ Temiz Ekran', function(){ var on=toggleTemiz(); temizBtn.textContent=on?'👁️ Ekrani Goster':'👁️ Temiz Ekran'; });
    panel.appendChild(temizBtn);
    panel.appendChild(item('🆕 Yeni Proje', function(){
      try{
        var name = (typeof prompt==='function') ? prompt('Yeni projenin adı:', 'Saha Metraj ' + new Date().toLocaleDateString('tr-TR')) : null;
        if(name===null){ return; }
        name = String(name).trim() || 'Saha Metraj Projesi';
        if(typeof window.newProject==='function' && typeof window.openProject==='function'){ window.openProject(window.newProject(name)); }
        else if(typeof window.showProjectScreen==='function'){ window.showProjectScreen(); }
      }catch(e){ try{ if(window.showProjectScreen) window.showProjectScreen(); }catch(_){} }
      try{ var p=document.getElementById('aybToolboxPanel'); if(p) p.style.display='none'; }catch(e){}
    }, '#123a2a'));
    panel.appendChild(item('📂 Proje Aç (kayıtlılar)', function(){
      try{ if(typeof window.showProjectScreen==='function') window.showProjectScreen(); var p=document.getElementById('aybToolboxPanel'); if(p) p.style.display='none'; }catch(e){}
    }, '#123049'));
    panel.appendChild(item('📄 Dosyadan Aç (.json)', function(){
      try{ if(typeof window.aybMobileOpenFile==='function') window.aybMobileOpenFile(); else alert('Dosyadan açma bu sürümde yok.'); var p=document.getElementById('aybToolboxPanel'); if(p) p.style.display='none'; }catch(e){}
    }, '#123049'));
    panel.appendChild(item('📝 Not Ekle (haritaya)', addNote, '#3a3300'));
    panel.appendChild(item('🌍 Sembollü KMZ (Kurum)', function(){ try{ if(window.aybExportKmzSym) window.aybExportKmzSym(); else alert('KMZ modülü yükleniyor, birkaç saniye sonra tekrar deneyin.'); }catch(e){} }, '#1a3a1a'));
    panel.appendChild(item('🗑️ Şekil Sil (ok/çizgi/bina)', function(){ try{ shapeDeleteUI(); }catch(e){} }, '#3a1414'));
    panel.appendChild(item('📛 Ekip Adı (merkez için)', function(){ var cur=localStorage.getItem('ayb_ekip_adi')||''; var v=prompt('Bu tabletin EKİP ADI (merkez raporlarında görünür):', cur); if(v!=null){ localStorage.setItem('ayb_ekip_adi', String(v).trim()); alert('Ekip adı: '+(String(v).trim()||'(boş)')); } }, '#26324a'));
    panel.appendChild(item('🛡️ Yedekle / Gonder', function(){ try{ window.aybBackup && window.aybBackup.download(); }catch(e){} }, '#0e2a1e'));
    panel.appendChild(item('♻️ Geri Yukle', function(){ try{ window.aybBackup && window.aybBackup.restore(); }catch(e){} }));
    panel.appendChild(item('⏱️ Otomatik Yedekler', function(){ try{ window.aybBackup && window.aybBackup.snaps(); }catch(e){} }));
    // Kutu ac/kapa dugmesi
    var tog=document.createElement('button'); tog.textContent='🧰 Araçlar';
    tog.style.cssText='font:700 13px system-ui;padding:8px 12px;border:0;border-radius:20px;background:#388cff;color:#fff;box-shadow:0 3px 10px rgba(0,0,0,.35)';
    tog.onclick=function(){ panel.style.display = panel.style.display==='none'?'flex':'none'; };
    /* Kullanici istegi: sag alttaki 'Araclar' paneli+dugmesi KALDIRILDI. Sadece Bitir kalir. */
    wrap.appendChild(fin);
    document.body.appendChild(wrap);
  });

  /* ---------- 10) FOTOGRAF (nokta nesnelere, koordinatli) ---------- */
  // Duzenlenen nesnenin id'sini yakala
  try{
    if(window.APP && typeof window.APP.editObject==='function' && !window.APP.__aybFotoWrap){
      var _edit=window.APP.editObject;
      window.APP.editObject=function(id){ window.__aybEditId=id; var r=_edit.apply(this,arguments);
        var n=0, iv=setInterval(function(){ try{ injectFotoBtn(); }catch(e){} if(++n>12) clearInterval(iv); }, 200); return r; };
      window.APP.__aybFotoWrap=true;
    }
  }catch(e){}
  function pdb(){ return new Promise(function(res,rej){ var r=indexedDB.open('ayb_photos_db',1);
    r.onupgradeneeded=function(){ r.result.createObjectStore('photos',{keyPath:'id'}); };
    r.onsuccess=function(){res(r.result);}; r.onerror=function(){rej(r.error);}; }); }
  function pget(id){ return pdb().then(function(db){ return new Promise(function(res){
    var t=db.transaction('photos','readonly'); t.objectStore('photos').get(id).onsuccess=function(e){ res(e.target.result||{id:id,items:[]}); }; }); }); }
  function pput(rec){ return pdb().then(function(db){ return new Promise(function(res){
    var t=db.transaction('photos','readwrite'); t.objectStore('photos').put(rec); t.oncomplete=function(){res(true);}; }); }); }
  function curObj(){ try{ var id=window.__aybEditId; if(!id||!window.project) return null;
    return (window.project.objects||[]).find(function(o){return o.id===id;})||null; }catch(e){ return null; } }
  function downscale(file, cb){
    try{ var img=new Image(); var url=URL.createObjectURL(file);
      img.onload=function(){ var max=1280,w=img.width,h=img.height,sc=Math.min(1,max/Math.max(w,h));
        var c=document.createElement('canvas'); c.width=Math.round(w*sc); c.height=Math.round(h*sc);
        c.getContext('2d').drawImage(img,0,0,c.width,c.height); URL.revokeObjectURL(url); cb(c.toDataURL('image/jpeg',0.6)); };
      img.onerror=function(){ URL.revokeObjectURL(url); cb(null); }; img.src=url;
    }catch(e){ cb(null); }
  }
  function fotoName(o){ return (o.props&&(o.props.direk_no||o.props.trafo_no||o.props.kofre_no||o.props.box_no||o.props.ad))||'nesne'; }
  function openPhotoUI(o){
    var id=o.id;
    pget(id).then(function(rec){
      var items=(rec&&rec.items)||[];
      var ov=document.createElement('div'); ov.style.cssText='position:fixed;inset:0;z-index:100000;background:rgba(0,0,0,.6);display:flex;align-items:center;justify-content:center';
      var box=document.createElement('div'); box.style.cssText='background:#0d1b34;border:1px solid #24406e;border-radius:14px;padding:14px;max-width:92vw;max-height:86vh;overflow:auto;color:#e7eeff;min-width:290px';
      var head=document.createElement('div'); head.style.cssText='display:flex;justify-content:space-between;align-items:center;margin-bottom:10px';
      head.innerHTML='<b>📷 '+fotoName(o)+' — Fotoğraflar</b>'; var x=document.createElement('span'); x.textContent='✕'; x.style.cssText='cursor:pointer;font-weight:800;font-size:18px'; head.appendChild(x); box.appendChild(head);
      var grid=document.createElement('div'); grid.style.cssText='display:grid;grid-template-columns:repeat(3,1fr);gap:8px'; box.appendChild(grid);
      function persist(){ try{ pput({id:id,lat:o.lat,lng:o.lng,type:o.type,ad:fotoName(o),items:items});
        o.props=o.props||{}; o.props._fotoAdet=items.length; if(window.saveProject) window.saveProject(); }catch(e){} }
      function refresh(){ grid.innerHTML=''; items.forEach(function(src,idx){
        var w=document.createElement('div'); w.style.cssText='position:relative';
        var im=document.createElement('img'); im.src=src; im.style.cssText='width:100%;height:92px;object-fit:cover;border-radius:8px;border:1px solid #24406e';
        var d=document.createElement('span'); d.textContent='✕'; d.style.cssText='position:absolute;top:3px;right:3px;background:#c62828;color:#fff;border-radius:50%;width:22px;height:22px;line-height:22px;text-align:center;cursor:pointer;font-weight:800';
        d.onclick=function(){ items.splice(idx,1); persist(); refresh(); };
        w.appendChild(im); w.appendChild(d); grid.appendChild(w); }); }
      var add=document.createElement('button'); add.textContent='📷 Fotoğraf Ekle (kamera/galeri)';
      add.style.cssText='margin-top:12px;width:100%;padding:12px;border:0;border-radius:9px;background:#388cff;color:#fff;font-weight:700';
      var inp=document.createElement('input'); inp.type='file'; inp.accept='image/*'; inp.setAttribute('capture','environment'); inp.style.display='none';
      add.onclick=function(){ inp.click(); };
      inp.onchange=function(){ var f=inp.files&&inp.files[0]; if(!f) return; downscale(f,function(dataURL){ if(dataURL){ items.push(dataURL); persist(); refresh(); } inp.value=''; }); };
      box.appendChild(add); box.appendChild(inp);
      ov.appendChild(box); document.body.appendChild(ov);
      x.onclick=function(){ ov.remove(); }; ov.onclick=function(e){ if(e.target===ov) ov.remove(); };
      refresh();
    });
  }
  function injectFotoBtn(){
    var o=curObj(); if(!o) return;
    var save=document.querySelector('#saveDirek');
    var modal=document.querySelector('.direk-modal') || (save&&save.closest('.modal,.win,[class*="modal"],[class*="win"]')) || (save&&save.parentNode);
    if(!modal) return;
    if(modal.querySelector('#aybFotoBtn')) { var b0=modal.querySelector('#aybFotoBtn'); var n=(o.props&&o.props._fotoAdet)||0; b0.textContent='📷 Fotoğraf'+(n?(' ('+n+')'):''); return; }
    var b=document.createElement('button'); b.id='aybFotoBtn'; b.type='button';
    var n=(o.props&&o.props._fotoAdet)||0; b.textContent='📷 Fotoğraf'+(n?(' ('+n+')'):'');
    b.style.cssText='margin:6px;padding:10px 14px;border:0;border-radius:9px;background:#0e7a3a;color:#fff;font-weight:800';
    b.onclick=function(e){ e.preventDefault(); openPhotoUI(o); };
    var target = save ? save.parentNode : modal;
    target.insertBefore(b, save || target.firstChild);
  }
  /* Foto dugmesi: sadece 'Düzenle' aninda eklenir (kalici gozlemci yok). */


  /* ---------- 11) SEKIL SIL (ok / cizgi / bina) ---------- */
  function shapeDeleteUI(){
    var pr=window.project; if(!pr){ alert('Önce bir proje açın.'); return; }
    function collect(){
      var arr=[];
      (pr.freeLines||[]).forEach(function(f){ arr.push({id:f.id, ad:(f.kind==='ok'?'➜ Ok':'╱ Çizgi'), det:((f.points&&f.points.length)||0)+' nokta'}); });
      (pr.areas||[]).forEach(function(a){ arr.push({id:a.id, ad:'□ Bina/Alan', det:((a.points&&a.points.length)||0)+' nokta'}); });
      (pr.channels||[]).forEach(function(c){ arr.push({id:c.id, ad:'▭ Kanal', det:((c.points&&c.points.length)||0)+' nokta'}); });
      return arr;
    }
    var list=collect();
    if(!list.length){ alert('Silinecek ok / çizgi / bina yok.'); return; }
    var ov=document.createElement('div'); ov.style.cssText='position:fixed;inset:0;z-index:100000;background:rgba(0,0,0,.6);display:flex;align-items:center;justify-content:center';
    var box=document.createElement('div'); box.style.cssText='background:#0d1b34;border:1px solid #24406e;border-radius:14px;padding:14px;max-width:92vw;max-height:82vh;overflow:auto;color:#e7eeff;min-width:280px';
    var head=document.createElement('div'); head.style.cssText='display:flex;justify-content:space-between;align-items:center;margin-bottom:8px';
    head.innerHTML='<b>🗑️ Şekil Sil (ok / çizgi / bina)</b>'; var x=document.createElement('span'); x.textContent='✕'; x.style.cssText='cursor:pointer;font-weight:800;font-size:18px'; head.appendChild(x); box.appendChild(head);
    var hint=document.createElement('div'); hint.style.cssText='color:#9fb4dd;font-size:12px;margin-bottom:8px'; hint.textContent='Silmek için satıra dokunun.'; box.appendChild(hint);
    var listEl=document.createElement('div'); box.appendChild(listEl);
    function render(){
      list=collect();
      if(!list.length){ ov.remove(); return; }
      listEl.innerHTML='';
      list.forEach(function(it){
        var row=document.createElement('button');
        row.style.cssText='display:flex;justify-content:space-between;width:100%;gap:10px;align-items:center;padding:11px 12px;margin:5px 0;border:1px solid #24406e;border-radius:10px;background:#12213f;color:#e7eeff;text-align:left';
        row.innerHTML='<span style="font-weight:700">'+it.ad+'</span><span style="color:#9fb4dd;font-size:12px">'+it.det+'</span><span style="color:#ff6b6b;font-weight:800">Sil ✕</span>';
        row.onclick=function(){
          try{ if(window.APP && window.APP.deleteFree){ window.APP.deleteFree(it.id, null); } }catch(e){}
          setTimeout(render, 150);   // APP.deleteFree kendi onayini sorar + renderAll yapar
        };
        listEl.appendChild(row);
      });
    }
    box.appendChild(listEl); ov.appendChild(box); document.body.appendChild(ov);
    x.onclick=function(){ ov.remove(); }; ov.onclick=function(e){ if(e.target===ov) ov.remove(); };
    render();
  }
  window.aybShapeDelete=shapeDeleteUI;


  /* ---------- BASLIK YANINA KORFEZIM LOGOSU ---------- */
  (function(){
    if(window.__aybHeaderLogo) return; window.__aybHeaderLogo=true;
    var LOGO='data:image/png;base64,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';
    function setLogo(){ var el=document.querySelector('.titlebar .logo'); if(!el) return false;
      if(el.querySelector('img.ayb-korfezim')) return true;
      el.innerHTML='<img class="ayb-korfezim" src="'+LOGO+'" alt="Körfezim" style="width:26px;height:26px;border-radius:6px;display:block;object-fit:contain;background:#fff;padding:1px">';
      el.style.display='flex'; el.style.alignItems='center'; el.style.marginRight='8px';
      return true;
    }
    ready(function(){ if(!setLogo()){ var t=setInterval(function(){ if(setLogo()) clearInterval(t); },400); setTimeout(function(){clearInterval(t);},6000); } });
  })();

  /* ---------- 11) DISA AKTARIM: klasor seticiyi KAPAT, DUZ INDIR (sadece APK) ---------- */
  (function(){
    if(!window.AYBNative) return; /* sadece tablet APK icinde */
    /* File System Access API'yi devre disi birak -> uygulama klasor seCTIRMEZ, blob indirir; interceptor Indirilenler'e kaydeder + paylas ekrani acar */
    try{ Object.defineProperty(window,'showDirectoryPicker',{value:undefined,configurable:true}); }catch(e){ try{ window.showDirectoryPicker=undefined; }catch(_){} }
    try{ Object.defineProperty(window,'showSaveFilePicker',{value:undefined,configurable:true}); }catch(e){ try{ window.showSaveFilePicker=undefined; }catch(_){} }
    try{ Object.defineProperty(window,'FileSystemDirectoryHandle',{value:undefined,configurable:true}); }catch(e){ try{ window.FileSystemDirectoryHandle=undefined; }catch(_){} }
    function proj(){ return window.project||{}; }
    function objs(){ var p=proj(); return Array.isArray(p.objects)?p.objects:[]; }
    function sname(){ return String(proj().name||'saha_projesi').replace(/[^0-9A-Za-zÇĞİÖŞÜçğıöşü _-]+/g,'_').replace(/\s+/g,'_').slice(0,60)||'saha_projesi'; }
    function dl(name,text,mime){ try{ var b=new Blob([text],{type:mime||'text/plain'}); var a=document.createElement('a'); a.href=URL.createObjectURL(b); a.download=name; a.style.display='none'; document.body.appendChild(a); a.click(); setTimeout(function(){ try{URL.revokeObjectURL(a.href);a.remove();}catch(_){} },1200); }catch(e){} }
    function toGeoJson(){
      var fs=[];
      objs().forEach(function(o){ if(isFinite(+o.lng)&&isFinite(+o.lat)) fs.push({type:'Feature',geometry:{type:'Point',coordinates:[+o.lng,+o.lat]},properties:Object.assign({type:o.type},o.props||{})}); });
      (proj().lines||[]).forEach(function(l){ var pts=[]; (l.points||[]).forEach(function(p){ if(p&&isFinite(+p.lng)&&isFinite(+p.lat)) pts.push([+p.lng,+p.lat]); }); if(l.start&&l.end&&pts.length<2){ if(isFinite(+l.start.lng)&&isFinite(+l.end.lng)) pts=[[+l.start.lng,+l.start.lat],[+l.end.lng,+l.end.lat]]; } if(pts.length>1) fs.push({type:'Feature',geometry:{type:'LineString',coordinates:pts},properties:Object.assign({kind:l.kind||'hat'},l.props||{})}); });
      return JSON.stringify({type:'FeatureCollection',features:fs},null,2);
    }
    function toCsv(){
      var rows=[['Tip','No/Ad','Enlem','Boylam']];
      objs().forEach(function(o){ var pr=o.props||{}; var no=pr.direk_no||pr.trafo_no||pr.kofre_no||pr.box_no||pr.abone_no||pr.ad||''; rows.push([o.type||'',no,o.lat,o.lng]); });
      return '\ufeff'+rows.map(function(r){ return r.map(function(v){ return '"'+String(v==null?'':v).replace(/"/g,'""')+'"'; }).join(';'); }).join('\r\n');
    }
    function hook(sel,fn){ var b=document.querySelector(sel); if(b&&!b.__aybDl){ b.__aybDl=1; b.addEventListener('click',function(e){ try{e.preventDefault();e.stopImmediatePropagation();}catch(_){} fn(); }, true); } }
    function wire(){
      hook('#btnKML', function(){ try{ if(window.aybExportKmzSym){ window.aybExportKmzSym(); return; } }catch(e){} dl(sname()+'.geojson',toGeoJson(),'application/geo+json'); });
      hook('#btnGeo', function(){ dl(sname()+'.geojson',toGeoJson(),'application/geo+json'); });
      hook('#btnExcel', function(){ dl(sname()+'_metraj.csv',toCsv(),'text/csv;charset=utf-8'); });
      hook('#btnAYB', function(){ dl(sname()+'_proje.json',JSON.stringify({app:'AYB Saha Harita',preparedBy:'Bayram YARAS',phone:'0530 630 05 40',savedAt:new Date().toISOString(),project:proj()},null,2),'application/json'); });
    }
    ready(wire); setTimeout(wire,1500); setTimeout(wire,4000); setTimeout(wire,8000);
  })();

  /* ---------- 12) ACILIS: son projeyle OTOMATIK DEVAM ---------- */
  (function(){
    function contLast(){
      try{
        if(window.project && window.project.id) return true;  /* zaten bir proje acik */
        var last = localStorage.getItem('ayb_saha_metraj_v16_last');
        if(!last) return false;
        var all = {};
        try{ all = JSON.parse(localStorage.getItem('ayb_saha_metraj_v16_projects')||'{}')||{}; }catch(e){ all={}; }
        if(all[last] && typeof window.openProject==='function'){
          window.openProject(all[last]);
          try{ var ps=document.getElementById('projectScreen'); if(ps) ps.classList.remove('show'); }catch(e){}
          return true;
        }
      }catch(e){}
      return false;
    }
    /* Kullanici acilista SECIM ekranini istiyor -> otomatik devam KAPALI */
    void contLast;
  })();

  /* ---------- 13) KLASOR BAGLAMA ozelligini TAMAMEN KALDIR ---------- */
  (function(){
    /* Klasor destekleme uyarilarini yut (yeni proje olustururken cikan rahatsiz edici popup) */
    try{
      if(!window.__aybAlertPatched){
        window.__aybAlertPatched=true;
        var _al=window.alert ? window.alert.bind(window) : null;
        window.alert=function(m){
          try{ if(typeof m==='string' && /(klas[oö]r seçmeyi desteklemiyor|doğrudan klasör seçmeyi|Windows Chrome veya Edge|klasör yazma izni)/i.test(m)) return; }catch(e){}
          if(_al) return _al(m);
        };
      }
    }catch(e){}
    /* File System Access API'yi HER YERDE kapat (freeze/klasor secici olmasin) */
    try{ Object.defineProperty(window,'showDirectoryPicker',{value:undefined,configurable:true}); }catch(e){ try{ window.showDirectoryPicker=undefined; }catch(_){} }
    try{ Object.defineProperty(window,'showSaveFilePicker',{value:undefined,configurable:true}); }catch(e){ try{ window.showSaveFilePicker=undefined; }catch(_){} }
    try{ Object.defineProperty(window,'FileSystemDirectoryHandle',{value:undefined,configurable:true}); }catch(e){ try{ window.FileSystemDirectoryHandle=undefined; }catch(_){} }
    /* Klasor-baglama arayuz ogelerini gizle */
    try{
      var css=document.createElement('style');
      css.textContent='#btnProjectFolder,#aybFolderStatus,#aybBindFolderPanelBtn,#aybPanelFolder,#aybOpenFromFolder,.ayb-ico-folderlink{display:none!important;}';
      (document.head||document.documentElement).appendChild(css);
    }catch(e){}
    /* Kalan klasor dugmelerini etkisizlestir (statik + dinamik) */
    function killFolder(){
      try{
        ['#btnProjectFolder','#aybBindFolderPanelBtn','#aybOpenFromFolder','#aybPanelFolder','#aybFolderStatus'].forEach(function(sel){
          var el=document.querySelector(sel);
          if(el){ el.style.display='none'; try{ el.onclick=function(ev){ try{ev.preventDefault();ev.stopImmediatePropagation();}catch(_){} return false; }; }catch(_){ } }
        });
        var btns=document.querySelectorAll('button,.ayb-pro-btn,.toolbtn,.palette-btn');
        for(var i=0;i<btns.length;i++){
          var t=(btns[i].textContent||'').trim();
          if(/Klas[oö]r bağla|Klas[oö]r seç|Klas[oö]re kaydet|Klasöre Yaz/i.test(t)){ btns[i].style.display='none'; }
        }
      }catch(e){}
    }
    /* Proje Acilis Merkezi'ndeki klasor yazilarini/dugmesini gizle */
    try{
      var css2=document.createElement('style');
      css2.textContent='.ayb-project-folder-status,.ayb-project-note,#aybOpenFromFolder{display:none!important;}';
      (document.head||document.documentElement).appendChild(css2);
    }catch(e){}
    /* "Olustur" (yeni proje) -> KLASORSUZ olustur (window.newProject + openProject) */
    try{
      document.addEventListener('click', function(e){
        var btn = e.target && e.target.closest ? e.target.closest('#aybCreateProject') : null;
        if(!btn) return;
        e.preventDefault(); e.stopImmediatePropagation();
        var inp=document.getElementById('aybNewProjectName');
        var name=(inp && inp.value ? inp.value.trim() : '') || 'Saha Projesi';
        try{
          if(typeof window.newProject==='function' && typeof window.openProject==='function'){
            window.openProject(window.newProject(name));
            var ps=document.getElementById('projectScreen'); if(ps) ps.classList.remove('show');
          }
        }catch(err){}
      }, true);
    }catch(e){}
    ready(killFolder);
    setTimeout(killFolder,600); setTimeout(killFolder,1800); setTimeout(killFolder,4000); setTimeout(killFolder,8000);
  })();

})();

/* ====== EK DUZELTMELER (v: direk-tasima + direkt silme) ====== */
(function(){
  'use strict';
  function ready(fn){ if(document.readyState!=='loading') fn(); else document.addEventListener('DOMContentLoaded',fn); }

  /* 1) DIREK TASININCA HAT UCU TAKIP ETSIN
     Yer Alti Hat, kayitli line.points kullaniyordu -> uclar eski kaliyordu.
     Ilk/son noktayi canli direk konumuna sabitle (kirik noktalar korunur). */
  function patchLinePoints(){
    if(typeof window.aybNormalizeLinePoints!=='function' || window.__aybLinePtsPatched) return;
    window.__aybLinePtsPatched=true;
    window.aybNormalizeLinePoints=function(points,start,end){
      var arr=(Array.isArray(points)?points:[]).map(function(p){
        try{ return window.aybNormalizeLinePoint?window.aybNormalizeLinePoint(p):p; }catch(e){ return p; }
      }).filter(function(p){ return p&&isFinite(p[0])&&isFinite(p[1]); });
      if(arr.length>=2){
        if(start&&isFinite(+start.lat)&&isFinite(+start.lng)) arr[0]=[Number(start.lat),Number(start.lng)];
        if(end&&isFinite(+end.lat)&&isFinite(+end.lng)) arr[arr.length-1]=[Number(end.lat),Number(end.lng)];
        return arr;
      }
      return (start&&end)?[[Number(start.lat),Number(start.lng)],[Number(end.lat),Number(end.lng)]]:arr;
    };
    try{ if(window.project && window.renderAll) window.renderAll(); }catch(e){}
  }
  ready(patchLinePoints);
  setTimeout(patchLinePoints,800); setTimeout(patchLinePoints,2500); setTimeout(patchLinePoints,6000);

  /* 2) "SIL" DEDIGINDE DIREKT SILSIN (silme onaylarinda otomatik EVET)
     Diger onaylar temiz Android diyaloguna gider (MainActivity). */
  try{
    var _confirm = window.confirm ? window.confirm.bind(window) : function(){return true;};
    window.confirm=function(msg){
      try{
        var s=String(msg||'');
        if(/sil(in|me|di)|kaldır|kaldir|temizle/i.test(s)) return true; /* direkt sil */
      }catch(e){}
      try{ return _confirm(msg); }catch(e){ return true; }
    };
  }catch(e){}
})();

/* ====== UST BASLIK: "Korfezim Saha Metraj" ====== */
(function(){
  function setTitle(){
    try{
      var t=document.querySelector('.titlebar .title')||document.querySelector('.title');
      if(t && t.textContent.indexOf('Körfezim')===-1){ t.textContent='Körfezim Saha Metraj'; }
    }catch(e){}
    try{ if(document.title.indexOf('Pafta')===-1) document.title='Körfezim Saha Metraj'; }catch(e){}
  }
  if(document.readyState!=='loading') setTitle(); else document.addEventListener('DOMContentLoaded',setTitle);
  setTimeout(setTitle,600); setTimeout(setTitle,2000);
})();

/* ====== ACILISTA / PROJE ACILINCA GPS KONUMUNA ORTALA ====== */
(function(){
  var moved=false;
  function hookMove(){
    var map=window.__aybMap;
    if(map && !map.__aybMoveHook){ map.__aybMoveHook=true; try{ map.on('dragstart',function(){ moved=true; }); }catch(e){} }
  }
  function goGps(){
    hookMove();
    if(!navigator.geolocation) return;
    try{ window.__aybBestAcc=Infinity; window.__aybGpsLockStart=Date.now(); }catch(e){}
    try{
      navigator.geolocation.getCurrentPosition(function(pos){
        try{
          if(!moved && window.__aybMap && pos && pos.coords && typeof window.aybShowGpsPosition==='function'){
            window.aybShowGpsPosition(pos,true);   /* haritayi GPS konumuna ortala */
          }
        }catch(e){}
      }, function(err){
        try{ if(window.toast) toast('GPS konumu alınamadı. Konum iznini ve GPS\'i açık tut.'); }catch(e){}
      }, {enableHighAccuracy:true, maximumAge:0, timeout:30000});
    }catch(e){}
  }
  function hookOpen(){
    if(window.__aybGpsOpenHook) return true;
    if(typeof window.openProject!=='function') return false;
    window.__aybGpsOpenHook=true;
    var _op=window.openProject;
    window.openProject=function(){
      moved=false;                         /* yeni proje acildi -> GPS'e izin */
      var r=_op.apply(this,arguments);
      setTimeout(goGps, 1300);             /* proje ciziminden SONRA GPS'e ortala */
      return r;
    };
    return true;
  }
  function ready(fn){ if(document.readyState!=='loading') fn(); else document.addEventListener('DOMContentLoaded',fn); }
  ready(function(){
    var n=0, iv=setInterval(function(){ n++; if(hookOpen() || n>80) clearInterval(iv); }, 400);
    /* Proje otomatik acilmasa bile, harita gorunur olunca bir kez dene */
    var m=0, im=setInterval(function(){ m++; if(window.__aybMap){ hookMove(); setTimeout(goGps,1600); clearInterval(im); } if(m>80) clearInterval(im); }, 500);
  });
})();

/* ====== CIZIM ARACI ETIKETLERI: Hat->Havai Hat, Yer Altı->Yeraltı Hat + yan yana ====== */
(function(){
  function ready(fn){ if(document.readyState!=='loading') fn(); else document.addEventListener('DOMContentLoaded',fn); }
  function relabel(){
    try{
      document.querySelectorAll('button[data-tool="hat"] small').forEach(function(s){ if(s.textContent.trim()!=='Havai Hat') s.textContent='Havai Hat'; });
      document.querySelectorAll('button[data-tool="yeraltihat"] small').forEach(function(s){ if(s.textContent.trim()!=='Yeraltı Hat') s.textContent='Yeraltı Hat'; });
    }catch(e){}
  }
  function css(){
    try{
      if(document.getElementById('aybToolLblCss')) return;
      var st=document.createElement('style'); st.id='aybToolLblCss';
      st.textContent='button[data-tool] small{white-space:nowrap!important;} .ayb-pro-btn.toolbtn{flex:0 0 auto!important;}';
      (document.head||document.documentElement).appendChild(st);
    }catch(e){}
  }
  ready(function(){ css(); relabel(); var n=0, iv=setInterval(function(){ relabel(); if(++n>25) clearInterval(iv); }, 400); });
})();

/* ====== KMZ CIKTISI: kucuk ikon + direk TIPI + LAMBA(95 W) + yeralti/tum hatlar ====== */
(function(){
  function ready(fn){ if(document.readyState!=="loading") fn(); else document.addEventListener("DOMContentLoaded",fn); }
  function applyKmzOverride(){
   try{
    if(typeof aybXml!=="function" || typeof project==="undefined"){ return false; }
    window.aybKmlLampList=function(o){
      var p=(o&&o.props)||{};
      var arr=Array.isArray(p.lambalar)?p.lambalar.slice():[];
      if(arr.length===0){
        var g=p.lamba_guc||p.lamba_manual||p.konsol_manual||p.lambaGuc||'';
        var ad=parseInt(p.lamba_adet||p.lamba_sayisi||1,10)||1;
        if(g){ arr.push({guc:g, adet:ad}); }
      }
      return arr;
    }
    window.aybKmlLampLabel=function(o){
      var arr=window.aybKmlLampList(o);
      var parts=[];
      arr.forEach(function(l){
        if(!l) return;
        var guc=String(l.guc||'').trim();
        var adet=Math.max(1, parseInt(l.adet||1,10)||1);
        if(guc){ parts.push((adet>1?(adet+'x'):'')+guc+' W'); }
        else if(l.armatur||l.cins){ parts.push(String(l.armatur||l.cins).trim()); }
        else if(adet>0){ parts.push(adet+' lamba'); }
      });
      var out=[]; parts.forEach(function(v){ if(v && out.indexOf(v)<0) out.push(v); });
      return out.join(', ');
    }
    window.aybKmlPoleHasLamp=function(o){
      if(!o||o.type!=='direk') return false;
      var arr=window.aybKmlLampList(o);
      return arr.some(function(l){ return l&&(String(l.guc||'').trim()||Number(l.adet||0)>0||l.armatur||l.cins); });
    }
    window.exportKMLString=function(){
      if(!project) return '';
      const styles = `
        <Style id="st_direk"><IconStyle><scale>0.48</scale><color>${aybKmlColor('#111827')}</color><Icon><href>http://maps.google.com/mapfiles/kml/shapes/placemark_circle.png</href></Icon></IconStyle><LabelStyle><scale>0.7</scale></LabelStyle></Style>
        <Style id="st_trafo"><IconStyle><scale>0.72</scale><color>${aybKmlColor('#e37a00')}</color><Icon><href>http://maps.google.com/mapfiles/kml/shapes/volcano.png</href></Icon></IconStyle><LabelStyle><scale>0.75</scale></LabelStyle></Style>
        <Style id="st_box"><IconStyle><scale>0.55</scale><color>${aybKmlColor('#7c3aed')}</color><Icon><href>http://maps.google.com/mapfiles/kml/shapes/square.png</href></Icon></IconStyle><LabelStyle><scale>0.64</scale></LabelStyle></Style>
        <Style id="st_kofre"><IconStyle><scale>0.55</scale><color>${aybKmlColor('#f59e0b')}</color><Icon><href>http://maps.google.com/mapfiles/kml/shapes/square.png</href></Icon></IconStyle><LabelStyle><scale>0.64</scale></LabelStyle></Style>
        <Style id="st_abone"><IconStyle><scale>0.5</scale><color>${aybKmlColor('#22c55e')}</color><Icon><href>http://maps.google.com/mapfiles/kml/shapes/homegardenbusiness.png</href></Icon></IconStyle><LabelStyle><scale>0.65</scale></LabelStyle></Style>
        <Style id="st_ekmuf"><IconStyle><scale>0.55</scale><color>${aybKmlColor('#06b6d4')}</color><Icon><href>http://maps.google.com/mapfiles/kml/shapes/target.png</href></Icon></IconStyle><LabelStyle><scale>0.65</scale></LabelStyle></Style>
        <Style id="st_not"><IconStyle><scale>0.5</scale><color>${aybKmlColor('#64748b')}</color><Icon><href>http://maps.google.com/mapfiles/kml/shapes/info-i.png</href></Icon></IconStyle><LabelStyle><scale>0.65</scale></LabelStyle></Style>
        <Style id="ln_ag"><LineStyle><color>${aybKmlColor('#1aa260')}</color><width>3</width></LineStyle></Style>
        <Style id="ln_abone"><LineStyle><color>${aybKmlColor('#f59e0b')}</color><width>3</width></LineStyle></Style>
        <Style id="ln_og"><LineStyle><color>${aybKmlColor('#dc2626')}</color><width>4</width></LineStyle></Style>
        <Style id="ln_enh"><LineStyle><color>${aybKmlColor('#111827')}</color><width>4</width></LineStyle></Style>
        <Style id="ln_ayd"><LineStyle><color>${aybKmlColor('#06b6d4')}</color><width>3</width></LineStyle></Style>
        <Style id="ln_yeralti"><LineStyle><color>${aybKmlColor('#1aa260')}</color><width>3</width></LineStyle></Style>
        <Style id="ln_kanal"><LineStyle><color>${aybKmlColor('#facc15')}</color><width>4</width></LineStyle></Style>
        <Style id="ln_free"><LineStyle><color>${aybKmlColor('#f97316')}</color><width>3</width></LineStyle></Style>
        <Style id="st_lamba"><IconStyle><scale>0.5</scale><color>${aybKmlColor('#fde047')}</color><Icon><href>http://maps.google.com/mapfiles/kml/shapes/star.png</href></Icon></IconStyle><LabelStyle><scale>0.72</scale></LabelStyle></Style>
        <Style id="poly_area"><LineStyle><color>${aybKmlColor('#22c55e')}</color><width>2</width></LineStyle><PolyStyle><color>${aybKmlColor('#22c55e','35')}</color></PolyStyle></Style>
      `;
      const objPlacemarks=(project.objects||[]).map(o=>`
        <Placemark>
          <name>${aybXml(aybKmlObjectName(o))}</name>
          <styleUrl>#${aybObjectStyleId(o)}</styleUrl>
          <description>${aybObjectDescription(o)}</description>
          <Point><coordinates>${Number(o.lng).toFixed(8)},${Number(o.lat).toFixed(8)},0</coordinates></Point>
        </Placemark>`).join('\n');
    
      const linePlacemarks=(project.lines||[]).map(l=>{
        const a=project.objects.find(o=>o.id===l.start), b=project.objects.find(o=>o.id===l.end);
        let pts;
        if(a&&b){ pts=aybLinePathPoints(l,a,b); }
        if((!pts||pts.length<2) && Array.isArray(l.points)&&l.points.length>=2){ pts=l.points.map(aybNormalizeLinePoint).filter(p=>Number.isFinite(p[0])&&Number.isFinite(p[1])); }
        if((!pts||pts.length<2) && a&&b){ pts=[[Number(a.lat),Number(a.lng)],[Number(b.lat),Number(b.lng)]]; }
        if(!pts||pts.length<2) return '';
        const nm=(a&&b)?((lineLabels[l.kind]||'Hat')+' '+getObjectNo(a)+' - '+getObjectNo(b)):(lineLabels[l.kind]||'Hat');
        return `<Placemark>
          <name>${aybXml(nm)}</name>
          <styleUrl>#${aybLineStyleId(l)}</styleUrl>
          <description>${(a&&b)?aybLineDescription(l,a,b,pts):''}</description>
          <LineString><tessellate>1</tessellate><coordinates>${aybKmlCoords(pts)}</coordinates></LineString>
        </Placemark>`;
      }).join('\n');
      const lampPlacemarks=(project.objects||[]).filter(aybKmlPoleHasLamp).map(o=>{
        const label=aybKmlLampLabel(o)||'Lamba';
        const dLat=0.000032;   /* ~3.5m kuzey: direk sembolu ile cakismasin */
        return `<Placemark>
          <name>${aybXml(label)}</name>
          <styleUrl>#st_lamba</styleUrl>
          <description><![CDATA[Direk ${aybHtml(getObjectNo(o))} lambasi: ${aybHtml(label)}]]></description>
          <Point><coordinates>${Number(o.lng).toFixed(8)},${(Number(o.lat)+dLat).toFixed(8)},0</coordinates></Point>
        </Placemark>`;
      }).join('\n');
    
      const channelPlacemarks=(project.channels||[]).map(c=>{
        const pts=(c.points||[]).map(aybNormalizeLinePoint).filter(p=>Number.isFinite(p[0])&&Number.isFinite(p[1]));
        if(pts.length<2) return '';
        return `<Placemark>
          <name>${aybXml('Kanal '+aybKanalFullNameFromProps(c.props))}</name>
          <styleUrl>#ln_kanal</styleUrl>
          <description>${aybChannelDescription(c,pts)}</description>
          <LineString><tessellate>1</tessellate><coordinates>${aybKmlCoords(pts)}</coordinates></LineString>
        </Placemark>`;
      }).join('\n');
    
      const freePlacemarks=(project.freeLines||[]).map(f=>{
        const pts=(f.points||[]).map(aybNormalizeLinePoint).filter(p=>Number.isFinite(p[0])&&Number.isFinite(p[1]));
        if(pts.length<2) return '';
        return `<Placemark><name>${aybXml(f.kind||'Çizgi')}</name><styleUrl>#ln_free</styleUrl><LineString><tessellate>1</tessellate><coordinates>${aybKmlCoords(pts)}</coordinates></LineString></Placemark>`;
      }).join('\n');
    
      const areaPlacemarks=(project.areas||[]).map(a=>{
        const pts=(a.points||[]).map(aybNormalizeLinePoint).filter(p=>Number.isFinite(p[0])&&Number.isFinite(p[1]));
        if(pts.length<3) return '';
        const closed=pts.concat([pts[0]]);
        return `<Placemark><name>${aybXml(a.kind||'Alan')}</name><styleUrl>#poly_area</styleUrl><Polygon><outerBoundaryIs><LinearRing><coordinates>${aybKmlCoords(closed)}</coordinates></LinearRing></outerBoundaryIs></Polygon></Placemark>`;
      }).join('\n');
    
      return `<?xml version="1.0" encoding="UTF-8"?>
    <kml xmlns="http://www.opengis.net/kml/2.2">
    <Document>
      <name>${aybXml(project.name||'AYB Saha Projesi')}</name>
      <description>AYB Saha Harita Metraj dışa aktarımı. Objelere tıklayınca direk/travers/izolatör/hırdavat/poz listeleri görünür.</description>
      ${styles}
      <Folder><name>Objeler</name>${objPlacemarks}</Folder>
      <Folder><name>Hatlar</name>${linePlacemarks}</Folder>
      <Folder><name>Lambalar</name>${lampPlacemarks}</Folder>
      <Folder><name>Kanallar</name>${channelPlacemarks}</Folder>
      <Folder><name>Çizimler</name>${freePlacemarks}${areaPlacemarks}</Folder>
    </Document>
    </kml>`;
    }
    /* direk etiketi = TIP (yoksa no) */
    try{
      var _on = window.aybKmlObjectName;
      window.aybKmlObjectName=function(o){
        try{ if(o && o.type==="direk"){ var t=(typeof getObjectTip==="function")?String(getObjectTip(o)||"").trim():""; var n=(typeof getObjectNo==="function")?String(getObjectNo(o)||"").trim():""; return t||n; } }catch(e){}
        return _on?_on(o):"";
      };
    }catch(e){}
    return true;
   }catch(e){ return false; }
  }
  ready(function(){ var n=0, iv=setInterval(function(){ n++; if(applyKmzOverride()||n>60) clearInterval(iv); }, 500); });
})();


/* ===================================================================== */
/* KÖRFEZİM — KAPSAMLI TRAFO BAZLI + GENEL METRAJ (lamba güce göre sayılı) */
/* ===================================================================== */
(function(){
  "use strict";
  function S(v){ return String(v==null?"":v).trim(); }
  function N(v,d){ var x=parseFloat(String(v==null?"":v).replace(",",".")); return isFinite(x)?x:(d||0); }
  function objNo(o){ try{ return (typeof getObjectNo==="function")?getObjectNo(o):(o&&o.props&&(o.props.direk_no||o.props.trafo_no))||o.id; }catch(e){ return o&&o.id; } }
  function objTip(o){ try{ return (typeof getObjectTip==="function")?getObjectTip(o):(o&&o.props&&(o.props.direk_tipi||o.type))||""; }catch(e){ return ""; } }
  /* Bir gücü "95 W" gibi normalize et */
  function gucNorm(g){
    var t=S(g);
    if(!t) return "Belirsiz";
    var m=t.match(/(\d+[.,]?\d*)/);
    if(m) return m[1].replace(",",".")+" W";
    return t;
  }
  /* Bir direğin lamba listesi: [{guc, adet}] */
  function lampsOf(o){
    var p=(o&&o.props)||{};
    var arr=Array.isArray(p.lambalar)?p.lambalar:[];
    var out=[];
    arr.forEach(function(l){
      if(!l) return;
      var g=gucNorm(l.guc!=null?l.guc:(l.watt!=null?l.watt:l.güç));
      var ad=Math.max(1, N(l.adet,1)||1);
      out.push({guc:g, adet:ad});
    });
    return out;
  }
  /* Direğin bağlı olduğu trafoyu bul (trafo_id -> trafo_no -> en yakın) */
  function findTrafo(o){
    var project=window.project;
    if(!project||!o) return null;
    if(o.type==="trafo") return o;
    var p=o.props||{};
    var trafolar=(project.objects||[]).filter(function(x){return x.type==="trafo";});
    if(p.trafo_id){ var t=trafolar.find(function(x){return String(x.id)===String(p.trafo_id);}); if(t) return t; }
    var tno=S(p.trafo_no||p.baslangic_trafo_no);
    if(tno){ var t2=trafolar.find(function(x){return S(objNo(x))===tno;}); if(t2) return t2; }
    var best=null, bd=Infinity;
    trafolar.forEach(function(t){
      var d=Math.hypot((+o.lat||0)-(+t.lat||0),(+o.lng||0)-(+t.lng||0));
      if(d<bd){ bd=d; best=t; }
    });
    return best;
  }
  function trafoName(t){ return t?(S(t.props&&t.props.trafo_no)||S(objNo(t))||"TRAFO"):"TRAFOSUZ"; }
  /* Trafo objesi yoksa direğin props.trafo_no'suna göre grupla (MİF içe aktarımı için) */
  function groupKeyForDirek(o){
    var nm=trafoName(findTrafo(o));
    if((nm==="TRAFOSUZ"||!nm) && o && o.props && S(o.props.trafo_no)) return S(o.props.trafo_no);
    return nm;
  }
  function lineLen(l){
    try{
      var project=window.project;
      var a=project.objects.find(function(o){return o.id===l.start;});
      var b=project.objects.find(function(o){return o.id===l.end;});
      if(typeof aybLinePathLength==="function" && a && b) return +(aybLinePathLength(l,a,b)||0).toFixed(2);
      if(typeof polyLength==="function" && l.points && l.points.length>1)
        return +(polyLength(l.points.map(function(p){return [p.lat,p.lng];}))||0).toFixed(2);
    }catch(e){}
    return N(l.length_m,0);
  }

  window.exportKorfezimMetraj = function(){
    var project=window.project;
    if(!project){ (window.aybModal||alert)("Önce bir proje açın."); return; }
    if(!window.XLSX){ (window.aybModal||alert)("Excel kütüphanesi yüklenemedi."); return; }
    var XLSX=window.XLSX;

    var objects=project.objects||[];
    var direkler=objects.filter(function(o){return o.type==="direk";});
    var trafolar=objects.filter(function(o){return o.type==="trafo";});

    /* --- Lamba toplama: trafo -> güç -> adet, ve genel --- */
    var perTrafo={};   /* {trafoAd: {guc: adet}} */
    var genel={};      /* {guc: adet} */
    var trafoLampTop={}; /* {trafoAd: toplamAdet} */

    direkler.forEach(function(o){
      var tad=groupKeyForDirek(o);
      var lst=lampsOf(o);
      if(!perTrafo[tad]) perTrafo[tad]={};
      lst.forEach(function(l){
        perTrafo[tad][l.guc]=(perTrafo[tad][l.guc]||0)+l.adet;
        genel[l.guc]=(genel[l.guc]||0)+l.adet;
        trafoLampTop[tad]=(trafoLampTop[tad]||0)+l.adet;
      });
    });

    /* SAYFA 1: Trafo bazlı lamba özeti */
    var s1=[["Trafo No","Lamba Gücü","Adet"]];
    Object.keys(perTrafo).sort().forEach(function(tad){
      var gucler=Object.keys(perTrafo[tad]).sort(function(a,b){return N(a)-N(b);});
      if(gucler.length===0){ return; }
      gucler.forEach(function(g){ s1.push([tad, g, perTrafo[tad][g]]); });
      s1.push([tad+" TOPLAM","", trafoLampTop[tad]||0]);
      s1.push(["","",""]);
    });
    if(s1.length===1) s1.push(["(Lamba bulunamadı)","",""]);

    /* SAYFA 2: Genel lamba özeti (güce göre) */
    var s2=[["Lamba Gücü","Toplam Adet"]];
    var genelTop=0;
    Object.keys(genel).sort(function(a,b){return N(a)-N(b);}).forEach(function(g){
      s2.push([g, genel[g]]); genelTop+=genel[g];
    });
    s2.push(["GENEL TOPLAM", genelTop]);

    /* SAYFA 3: Direk aksam listesi (No / Tip / Trafo / Lamba özeti) */
    var s3=[["Direk No","Direk Tipi","Bağlı Trafo","Lamba (adet x güç)","Lamba Toplam","Enlem","Boylam"]];
    direkler.forEach(function(o){
      var t=findTrafo(o);
      var lst=lampsOf(o);
      var grp={}; lst.forEach(function(l){ grp[l.guc]=(grp[l.guc]||0)+l.adet; });
      var parts=Object.keys(grp).sort(function(a,b){return N(a)-N(b);}).map(function(g){ return grp[g]+" x "+g; });
      var top=lst.reduce(function(a,l){return a+l.adet;},0);
      s3.push([ S(objNo(o)), S(objTip(o)), groupKeyForDirek(o), parts.join(", "), top, o.lat, o.lng ]);
    });

    /* SAYFA 4: Trafo listesi */
    var s4=[["Trafo No","Adı","Bağlı Direk","Lamba Toplam","Enlem","Boylam"]];
    trafolar.forEach(function(t){
      var tad=trafoName(t);
      var bagli=direkler.filter(function(o){return trafoName(findTrafo(o))===tad;}).length;
      s4.push([ tad, S((t.props&&(t.props.trafo_adi||t.props.adi))||""), bagli, trafoLampTop[tad]||0, t.lat, t.lng ]);
    });
    if(trafolar.length===0) s4.push(["(Trafo yok)","","","","",""]);

    /* SAYFA 5: Hatlar */
    var s5=[["Hat Tipi","Nereden","Nereye","Uzunluk (m)","Kesit/Bilgi"]];
    (project.lines||[]).forEach(function(l){
      var a=objects.find(function(o){return o.id===l.start;});
      var b=objects.find(function(o){return o.id===l.end;});
      var tip=(typeof lineLabels!=="undefined" && lineLabels[l.kind])?lineLabels[l.kind]:(l.kind||"Hat");
      var kesit=(l.props&&(l.props.hat_tipi||l.props.kesit))||"";
      s5.push([ tip, a?S(objNo(a)):S(l.start), b?S(objNo(b)):S(l.end), lineLen(l), S(kesit) ]);
    });

    /* SAYFA 6: Tüm koordinatlar */
    var s6=[["Tip","No/Ad","Enlem","Boylam"]];
    objects.forEach(function(o){ s6.push([ o.type, S(objNo(o)), o.lat, o.lng ]); });

    var wb=XLSX.utils.book_new();
    function add(aoa,name){ XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet(aoa), name); }
    add(s1,"Trafo_Lamba_Ozeti");
    add(s2,"Genel_Lamba_Ozeti");
    add(s3,"Direk_Aksam");
    add(s4,"Trafo_Listesi");
    add(s5,"Hatlar");
    add(s6,"Koordinatlar");

    var fname=(S(project.name)||"Korfezim_Saha")+"_metraj.xlsx";
    try{ XLSX.writeFile(wb, fname); }
    catch(e){ (window.aybModal||alert)("Metraj oluşturulamadı: "+e); return; }
    try{ if(window.toast) toast("Trafo bazlı + genel metraj Excel hazır."); }catch(e){}
  };

  /* Metraj düğmesini (btnExcel) bu kapsamlı metraja bağla */
  function bindMetrajBtn(){
    try{
      window.exportProfessionalMetraj = window.exportKorfezimMetraj;
      var b=document.getElementById("btnExcel");
      if(b){ b.onclick=window.exportKorfezimMetraj; }
    }catch(e){}
  }
  if(document.readyState==="loading") document.addEventListener("DOMContentLoaded",function(){ setTimeout(bindMetrajBtn,900); });
  setTimeout(bindMetrajBtn, 900);
  setTimeout(bindMetrajBtn, 2000);
})();


/* ===================================================================== */
/* KÖRFEZİM — GPS KONUM KARTI GİZLE / GÖSTER (ekranı kapatmasın)          */
/* ===================================================================== */
(function(){
  "use strict";
  /* Başlangıçta kart GİZLİ olsun (ekranı kapatmasın); kullanıcı isterse açar */
  var HIDDEN = true;

  function injectStyle(){
    if(document.getElementById("ayb_gps_toggle_style")) return;
    var st=document.createElement("style");
    st.id="ayb_gps_toggle_style";
    st.textContent =
      "#gpsCard.ayb-gps-hidden{display:none!important;}" +
      "#gpsCard.gps-live{top:56px!important;}" +   /* düğmenin altına insin */
      "#aybGpsToggle{position:fixed;top:14px;right:14px;z-index:1300;" +
        "background:#2563eb;color:#fff;border:none;border-radius:20px;" +
        "padding:8px 14px;font-size:14px;font-weight:700;box-shadow:0 4px 12px rgba(15,23,42,.3);" +
        "cursor:pointer;font-family:inherit;line-height:1;}" +
      "#aybGpsToggle:active{transform:scale(.96);}";
    document.head.appendChild(st);
  }

  function card(){ return document.getElementById("gpsCard"); }

  function apply(){
    var c=card();
    if(c){
      if(HIDDEN) c.classList.add("ayb-gps-hidden");
      else c.classList.remove("ayb-gps-hidden");
    }
    var b=document.getElementById("aybGpsToggle");
    if(b){ b.textContent = HIDDEN ? "📍 Konum" : "📍 Gizle"; }
  }

  function makeButton(){
    if(document.getElementById("aybGpsToggle")) return;
    var b=document.createElement("button");
    b.id="aybGpsToggle";
    b.type="button";
    b.textContent="📍 Konum";
    b.onclick=function(ev){
      try{ ev&&ev.preventDefault&&ev.preventDefault(); ev&&ev.stopPropagation&&ev.stopPropagation(); }catch(e){}
      HIDDEN=!HIDDEN;
      apply();
    };
    document.body.appendChild(b);
  }

  function setup(){
    injectStyle();
    makeButton();
    apply();
  }

  if(document.readyState==="loading") document.addEventListener("DOMContentLoaded",function(){ setTimeout(setup,700); });
  setTimeout(setup, 700);
  setTimeout(setup, 1800);
  /* GPS her güncellendiğinde kart gizli kalsın istiyorsak sınıfı koru */
  setInterval(function(){
    var c=card();
    if(c && HIDDEN && !c.classList.contains("ayb-gps-hidden")) c.classList.add("ayb-gps-hidden");
  }, 1500);
})();


/* ===================================================================== */
/* KÖRFEZİM — MİF (MapInfo) İÇE AKTARMA: proje gibi çizili + düzenlenebilir */
/* ===================================================================== */
(function(){
  "use strict";
  var d=document;

  /* ---------- 1) Ters TM33 -> WGS84 (GRS80, cm=33, fe=500000, k0=1) ---------- */
  function tmToLatLon(E,N,cm){
    var a=6378137.0, f=1/298.257222101, k0=1.0, fe=500000;
    var e2=f*(2-f), ep2=e2/(1-e2);
    var x=E-fe, y=N;
    var M=y/k0;
    var mu=M/(a*(1-e2/4-3*e2*e2/64-5*e2*e2*e2/256));
    var e1=(1-Math.sqrt(1-e2))/(1+Math.sqrt(1-e2));
    var phi1=mu+(3*e1/2-27*e1*e1*e1/32)*Math.sin(2*mu)
      +(21*e1*e1/16-55*e1*e1*e1*e1/32)*Math.sin(4*mu)
      +(151*e1*e1*e1/96)*Math.sin(6*mu)
      +(1097*e1*e1*e1*e1/512)*Math.sin(8*mu);
    var sp=Math.sin(phi1), cp=Math.cos(phi1), tp=Math.tan(phi1);
    var N1=a/Math.sqrt(1-e2*sp*sp);
    var T1=tp*tp;
    var C1=ep2*cp*cp;
    var R1=a*(1-e2)/Math.pow(1-e2*sp*sp,1.5);
    var D=x/(N1*k0);
    var lat=phi1-(N1*tp/R1)*(D*D/2-(5+3*T1+10*C1-4*C1*C1-9*ep2)*Math.pow(D,4)/24
      +(61+90*T1+298*C1+45*T1*T1-252*ep2-3*C1*C1)*Math.pow(D,6)/720);
    var lon=(D-(1+2*T1+C1)*Math.pow(D,3)/6
      +(5-2*C1+28*T1-3*C1*C1+8*ep2+24*T1*T1)*Math.pow(D,5)/120)/cp;
    return {lat:lat*180/Math.PI, lng:cm+lon*180/Math.PI};
  }

  /* ---------- 2) Küçük inflate (raw DEFLATE) — tinf portu ---------- */
  function Tree(){ this.table=new Uint16Array(16); this.trans=new Uint16Array(288); }
  var sltree=new Tree(), sdtree=new Tree();
  var length_bits=new Uint8Array(30), length_base=new Uint16Array(30);
  var dist_bits=new Uint8Array(30), dist_base=new Uint16Array(30);
  var clcidx=new Uint8Array([16,17,18,0,8,7,9,6,10,5,11,4,12,3,13,2,14,1,15]);
  var code_tree=new Tree(), lengths=new Uint8Array(288+32);
  function bbb(bits,base,delta,first){var i,sum=first;for(i=0;i<delta;++i)bits[i]=0;for(i=0;i<30-delta;++i)bits[i+delta]=(i/delta)|0;for(i=0;i<30;++i){base[i]=sum;sum+=1<<bits[i];}}
  function bft(lt,dt){var i;for(i=0;i<7;++i)lt.table[i]=0;lt.table[7]=24;lt.table[8]=152;lt.table[9]=112;for(i=0;i<24;++i)lt.trans[i]=256+i;for(i=0;i<144;++i)lt.trans[24+i]=i;for(i=0;i<8;++i)lt.trans[24+144+i]=280+i;for(i=0;i<112;++i)lt.trans[24+144+8+i]=144+i;for(i=0;i<5;++i)dt.table[i]=0;dt.table[5]=32;for(i=0;i<32;++i)dt.trans[i]=i;}
  function bt(t,ln,off,num){var i,offs=new Uint16Array(16),sum;for(i=0;i<16;++i)t.table[i]=0;for(i=0;i<num;++i)t.table[ln[off+i]]++;t.table[0]=0;for(sum=0,i=0;i<16;++i){offs[i]=sum;sum+=t.table[i];}for(i=0;i<num;++i)if(ln[off+i])t.trans[offs[ln[off+i]]++]=i;}
  bbb(length_bits,length_base,4,3); length_bits[28]=0; length_base[28]=258;
  bbb(dist_bits,dist_base,2,1);
  bft(sltree,sdtree);
  function rb(d,num,base){while(d.bc<24){d.tag|=d.s[d.i++]<<d.bc;d.bc+=8;}var val=d.tag&(0xffff>>>(16-num));d.tag>>>=num;d.bc-=num;return val+base;}
  function ds(d,t){while(d.bc<24){d.tag|=d.s[d.i++]<<d.bc;d.bc+=8;}var sum=0,cur=0,len=0,tag=d.tag;do{cur=2*cur+(tag&1);tag>>>=1;++len;sum+=t.table[len];cur-=t.table[len];}while(cur>=0);d.tag=tag;d.bc-=len;return t.trans[sum+cur];}
  function dt(d,lt,dtr){var hlit,hdist,hclen,i,num,length;hlit=rb(d,5,257);hdist=rb(d,5,1);hclen=rb(d,4,4);for(i=0;i<19;++i)lengths[i]=0;for(i=0;i<hclen;++i)lengths[clcidx[i]]=rb(d,3,0);bt(code_tree,lengths,0,19);for(num=0;num<hlit+hdist;){var sym=ds(d,code_tree);switch(sym){case 16:var prev=lengths[num-1];for(length=rb(d,2,3);length;--length)lengths[num++]=prev;break;case 17:for(length=rb(d,3,3);length;--length)lengths[num++]=0;break;case 18:for(length=rb(d,7,11);length;--length)lengths[num++]=0;break;default:lengths[num++]=sym;break;}}bt(lt,lengths,0,hlit);bt(dtr,lengths,hlit,hdist);}
  function ibd(d,lt,dtr){for(;;){var sym=ds(d,lt);if(sym===256)return;if(sym<256){d.dest[d.dl++]=sym;}else{sym-=257;var length=rb(d,length_bits[sym],length_base[sym]);var dist=ds(d,dtr);var offs=d.dl-rb(d,dist_bits[dist],dist_base[dist]);for(var i=offs;i<offs+length;++i)d.dest[d.dl++]=d.dest[i];}}}
  function iub(d){while(d.bc>8){d.i--;d.bc-=8;}var length=d.s[d.i+1];length=256*length+d.s[d.i];d.i+=4;for(var i=length;i;--i)d.dest[d.dl++]=d.s[d.i++];d.bc=0;d.tag=0;}
  function inflateRaw(src,outLen){
    var d={s:src,i:0,tag:0,bc:0,dest:new Uint8Array(outLen),dl:0};
    var bfinal;
    do{ bfinal=(function(){while(d.bc<1){d.tag|=d.s[d.i++]<<d.bc;d.bc+=8;}var b=d.tag&1;d.tag>>>=1;d.bc--;return b;})();
      var btype=rb(d,2,0);
      if(btype===0) iub(d);
      else if(btype===1) ibd(d,sltree,sdtree);
      else if(btype===2){ var lt=new Tree(),dtr=new Tree(); dt(d,lt,dtr); ibd(d,lt,dtr); }
      else throw new Error("MIF: sıkıştırma bloğu okunamadı");
    } while(!bfinal);
    return d.dest.subarray(0,d.dl);
  }

  /* ---------- 3) ZIP okuyucu (merkezi dizin) ---------- */
  function u16(a,o){return a[o]|(a[o+1]<<8);}
  function u32(a,o){return (a[o]|(a[o+1]<<8)|(a[o+2]<<16)|(a[o+3]<<24))>>>0;}
  function asciiName(a,o,n){var s="";for(var k=0;k<n;k++)s+=String.fromCharCode(a[o+k]);return s;}
  function unzip(buf){
    var a=new Uint8Array(buf);
    var i=a.length-22;
    for(;i>=0;i--){ if(u32(a,i)===0x06054b50) break; }
    if(i<0) throw new Error("Geçerli bir ZIP değil");
    var cnt=u16(a,i+10), cdOff=u32(a,i+16);
    var files={}, p=cdOff, n;
    for(n=0;n<cnt;n++){
      if(u32(a,p)!==0x02014b50) break;
      var method=u16(a,p+10);
      var compSize=u32(a,p+20), uncompSize=u32(a,p+24);
      var nameLen=u16(a,p+28), extraLen=u16(a,p+30), commentLen=u16(a,p+32);
      var lho=u32(a,p+42);
      var name=asciiName(a,p+46,nameLen);
      var lnameLen=u16(a,lho+26), lextraLen=u16(a,lho+28);
      var dataStart=lho+30+lnameLen+lextraLen;
      var comp=a.subarray(dataStart,dataStart+compSize);
      var out;
      try{ out = (method===0) ? comp.slice() : inflateRaw(comp, uncompSize); }
      catch(e){ out=new Uint8Array(0); }
      var base=name.split("/").pop();
      if(base) files[base]=out;
      p+=46+nameLen+extraLen+commentLen;
    }
    return files;
  }

  /* ---------- 4) Metin çözme (WindowsTurkish / cp1254) ---------- */
  function decodeText(bytes){
    try{ return new TextDecoder("windows-1254").decode(bytes); }catch(e){}
    try{ return new TextDecoder("utf-8").decode(bytes); }catch(e){}
    var s=""; for(var k=0;k<bytes.length;k++) s+=String.fromCharCode(bytes[k]); return s;
  }

  /* ---------- 5) MIF ve MID ayrıştırma ---------- */
  function parseMifText(text){
    var lines=String(text||"").replace(/\r/g,"").split("\n");
    var cols=[], i=0;
    for(i=0;i<lines.length;i++){
      var m=lines[i].trim().match(/^Columns\s+(\d+)/i);
      if(m){ var nc=+m[1]; for(var c=1;c<=nc && i+c<lines.length;c++){ var nm=lines[i+c].trim().split(/\s+/)[0]; cols.push(nm); } break; }
    }
    var di=lines.findIndex(function(l){return /^Data\b/i.test(l.trim());});
    if(di<0) di=0;
    var feats=[]; i=di+1;
    while(i<lines.length){
      var line=lines[i].trim();
      if(!line){ i++; continue; }
      var mp=line.match(/^Point\s+([-\d.]+)\s+([-\d.]+)/i);
      if(mp){ feats.push({geom:"point",coords:[[+mp[1],+mp[2]]]}); i++; continue; }
      var ml=line.match(/^Line\s+([-\d.]+)\s+([-\d.]+)\s+([-\d.]+)\s+([-\d.]+)/i);
      if(ml){ feats.push({geom:"line",coords:[[+ml[1],+ml[2]],[+ml[3],+ml[4]]]}); i++; continue; }
      var mpl=line.match(/^PLine\s+(\d+)/i);
      if(mpl){ var nn=+mpl[1], pts=[]; i++; for(var j=0;j<nn && i<lines.length;j++,i++){ var arr=lines[i].trim().split(/\s+/).map(Number); if(arr.length>=2 && isFinite(arr[0]) && isFinite(arr[1])) pts.push([arr[0],arr[1]]); } if(pts.length) feats.push({geom:"line",coords:pts}); continue; }
      i++;
    }
    return {columns:cols, features:feats};
  }
  function parseMidText(text){
    var rows=[]; var lines=String(text||"").replace(/\r/g,"").split("\n");
    lines.forEach(function(ln){
      if(ln==="" ) return;
      var out=[], cur="", q=false;
      for(var k=0;k<ln.length;k++){
        var ch=ln[k];
        if(q){ if(ch==='"'){ if(ln[k+1]==='"'){cur+='"';k++;} else q=false; } else cur+=ch; }
        else { if(ch==='"') q=true; else if(ch===','){ out.push(cur); cur=""; } else cur+=ch; }
      }
      out.push(cur);
      rows.push(out);
    });
    return rows;
  }

  /* ---------- 6) Yardımcılar ---------- */
  function colIndex(cols,names){
    for(var n=0;n<names.length;n++){
      var want=names[n].toLowerCase();
      for(var c=0;c<cols.length;c++){ if(String(cols[c]||"").toLowerCase()===want) return c; }
    }
    return -1;
  }
  function num(v){ var x=parseFloat(String(v==null?"":v).replace(",",".")); return isFinite(x)?x:0; }
  function distM(a,b){ var dlat=(a.lat-b.lat)*111320, dlng=(a.lng-b.lng)*111320*Math.cos(a.lat*Math.PI/180); return Math.sqrt(dlat*dlat+dlng*dlng); }
  function nearest(pt,objs,maxM){ var best=null,bd=maxM==null?Infinity:maxM; objs.forEach(function(o){ var dd=distM(pt,{lat:o.lat,lng:o.lng}); if(dd<bd){bd=dd;best=o;} }); return best; }

  /* ---------- 7) Proje kur ---------- */
  function buildProject(fileMap, projName, cm){
    var UID=(typeof window.uid==="function")?window.uid:function(p){return p+"_"+Math.random().toString(36).slice(2,8)+"_"+Date.now().toString(36);};

    /* --- Direkler --- */
    var direkObjs=[];
    if(fileMap.mif && fileMap.mid){
      var dm=parseMifText(fileMap.mif), dd=parseMidText(fileMap.mid), C=dm.columns;
      var iNo=colIndex(C,["DirekNo","Direk_No","No"]);
      var iTip=colIndex(C,["TipAdi","Tip_Adi","DirekTipi","Tip"]);
      var iGen=colIndex(C,["GenelTip"]);
      var iAlt=colIndex(C,["AltCins","Alt_Cins"]);
      var iGuc=colIndex(C,["LambaGucu1","LambaGucu","Lamba_Gucu"]);
      var iAd =colIndex(C,["LambaCount1","LambaSayisi1","LambaAdet1","LambaCount"]);
      var iTr =colIndex(C,["BagliTrafoNo","TrafoNo","Bagli_Trafo"]);
      dm.features.forEach(function(ft,idx){
        if(ft.geom!=="point") return;
        var row=dd[idx]||[];
        var ll=tmToLatLon(ft.coords[0][0], ft.coords[0][1], cm);
        var lambalar=[];
        var g=iGuc>=0?num(row[iGuc]):0, ad=iAd>=0?num(row[iAd]):0;
        if(g>0 && ad>0){ for(var q=0;q<1;q++){} lambalar.push({guc:String(g),adet:ad,cins:"LED",armatur:"",status:"MEVCUT"}); }
        var props={
          direk_no: iNo>=0?String(row[iNo]||("DRK"+(idx+1))):("DRK"+(idx+1)),
          direk_tipi: iTip>=0?String(row[iTip]||""):"",
          genel_tip: iGen>=0?String(row[iGen]||"AG"):"AG",
          alt_tip: iAlt>=0?String(row[iAlt]||""):"",
          trafo_no: iTr>=0?String(row[iTr]||""):"",
          durum:"MEVCUT", ithal_kaynak:"MIF",
          lambalar: lambalar
        };
        direkObjs.push({ id:UID("DIREK"), type:"direk", lat:ll.lat, lng:ll.lng, props:props });
      });
    }

    /* --- Trafolar (varsa) --- */
    var trafoObjs=[];
    if(fileMap.tmif && fileMap.tmid){
      var tm=parseMifText(fileMap.tmif), tmd=parseMidText(fileMap.tmid), TC=tm.columns;
      var tNo=colIndex(TC,["TrafoNo","Trafo_No"]);
      var tGuc=colIndex(TC,["TrafoGucu","Trafo_Gucu","Gucu"]);
      tm.features.forEach(function(ft,idx){
        if(ft.geom!=="point") return;
        var row=tmd[idx]||[];
        var ll=tmToLatLon(ft.coords[0][0], ft.coords[0][1], cm);
        trafoObjs.push({ id:UID("TRAFO"), type:"trafo", lat:ll.lat, lng:ll.lng,
          props:{ trafo_no: tNo>=0?String(row[tNo]||("TR"+(idx+1))):("TR"+(idx+1)),
                  trafo_gucu: tGuc>=0?String(row[tGuc]||""):"", durum:"MEVCUT", ithal_kaynak:"MIF" } });
      });
    }

    var allObjs=direkObjs.concat(trafoObjs);

    /* --- Hatlar --- */
    var hatLines=[];
    if(fileMap.hmif){
      var hm=parseMifText(fileMap.hmif), hmd=fileMap.hmid?parseMidText(fileMap.hmid):[], HC=hm.columns;
      var iAg=colIndex(HC,["AGTip","AG_Tip","Kesit"]);
      var iGt=colIndex(HC,["GenelTip"]);
      hm.features.forEach(function(ft,idx){
        if(ft.geom!=="line") return;
        var row=hmd[idx]||[];
        var pts=ft.coords.map(function(c){ return tmToLatLon(c[0],c[1],cm); });
        if(pts.length<2) return;
        var s=nearest(pts[0], direkObjs, 30);
        var e=nearest(pts[pts.length-1], direkObjs, 30);
        if(!s){ s={ id:UID("DIREK"), type:"direk", lat:pts[0].lat, lng:pts[0].lng, props:{direk_no:"", direk_tipi:"", genel_tip:"AG", lambalar:[], durum:"MEVCUT", ithal_kaynak:"MIF"} }; direkObjs.push(s); allObjs.push(s); }
        if(!e){ e={ id:UID("DIREK"), type:"direk", lat:pts[pts.length-1].lat, lng:pts[pts.length-1].lng, props:{direk_no:"", direk_tipi:"", genel_tip:"AG", lambalar:[], durum:"MEVCUT", ithal_kaynak:"MIF"} }; direkObjs.push(e); allObjs.push(e); }
        var kesit=iAg>=0?String(row[iAg]||""):"";
        var line={ id:UID("HAT"), kind:"hat", start:s.id, end:e.id,
          props:{ hat_tipi:kesit, ag_hat_tipi:kesit, hy:"HAVAİ", durum:"MEVCUT", kaynak:"MIF", ithal_kaynak:"MIF" } };
        if(pts.length>2){ line.points=pts.map(function(p){return [p.lat,p.lng];}); }
        hatLines.push(line);
      });
    }

    return { objects: allObjs.length?allObjs:direkObjs, lines:hatLines, count:{direk:direkObjs.length,trafo:trafoObjs.length,hat:hatLines.length} };
  }

  function openBuilt(built, projName){
    if(typeof window.newProject!=="function" || typeof window.openProject!=="function"){
      (window.aybModal||alert)("Program hazır değil, tekrar deneyin."); return;
    }
    var pr=window.newProject(projName||"MİF Projesi");
    pr.objects=built.objects; pr.lines=built.lines;
    pr.freeLines=pr.freeLines||[]; pr.channels=pr.channels||[]; pr.areas=pr.areas||[];
    window.openProject(pr);
    setTimeout(function(){
      try{ if(typeof window.renderAll==="function") window.renderAll(); }catch(e){}
      try{
        var m=window.__aybMap||window.map;
        if(m && built.objects.length){
          var lat0=built.objects[0].lat, lng0=built.objects[0].lng, latN=lat0, latX=lat0, lngN=lng0, lngX=lng0;
          built.objects.forEach(function(o){ if(o.lat<latN)latN=o.lat; if(o.lat>latX)latX=o.lat; if(o.lng<lngN)lngN=o.lng; if(o.lng>lngX)lngX=o.lng; });
          m.fitBounds([[latN,lngN],[latX,lngX]], {padding:[40,40], maxZoom:18});
        }
      }catch(e){}
    }, 500);
    (window.aybModal||function(x){try{window.toast&&toast(x);}catch(e){}})(
      "MİF yüklendi — Direk: "+built.count.direk+", Trafo: "+built.count.trafo+", Hat: "+built.count.hat+
      ".\nHaritada çizili olarak açıldı; direğe dokunup lamba ekle/çıkar yapabilirsin.","MİF İçe Aktarma");
  }

  /* ---------- 8) Dosya seç + işle ---------- */
  /* Ekranda adım adım durum mesajı göster */
  function status(msg){
    var el=d.getElementById("aybMifStatus");
    if(!el){
      el=d.createElement("div"); el.id="aybMifStatus";
      el.style.cssText="position:fixed;left:50%;top:12px;transform:translateX(-50%);z-index:4000;background:#0f172a;"+
        "color:#fff;padding:10px 16px;border-radius:10px;font-family:inherit;font-size:14px;font-weight:600;"+
        "box-shadow:0 6px 20px rgba(0,0,0,.35);max-width:92vw;text-align:center;";
      d.body.appendChild(el);
    }
    el.textContent=msg; el.style.display="block";
    clearTimeout(el._t); el._t=setTimeout(function(){ if(el) el.style.display="none"; }, 6000);
  }
  function readAB(file){ return new Promise(function(res,rej){ var r=new FileReader(); r.onload=function(){res(r.result);}; r.onerror=function(){rej(new Error("okunamadı"));}; r.readAsArrayBuffer(file); }); }
  function isZip(buf){ var u=new Uint8Array(buf); return u.length>3 && u[0]===0x50 && u[1]===0x4B && (u[2]===0x03||u[2]===0x05||u[2]===0x07); }

  function finishMap(map, projName){
    var cm=33;
    var probe=map.mif||map.hmif||"";
    var mm=String(probe).match(/Projection\s+\d+\s*,\s*\d+\s*,\s*"[^"]*"\s*,\s*(\d+)/i);
    if(mm) cm=+mm[1];
    if(!map.mif && !map.hmif){ status("Direkler.mif / Hatlar.mif bulunamadı."); (window.aybModal||alert)("ZIP içinde Direkler.mif ve Direkler.mid bulunamadı. Doğru MİF zip'ini seçtiğinden emin ol."); return; }
    var built;
    try{ built=buildProject(map, projName, cm); }
    catch(e){ status("İşlenemedi: "+(e&&e.message?e.message:e)); (window.aybModal||alert)("MİF işlenemedi: "+(e&&e.message?e.message:e)); return; }
    if(!built.objects.length && !built.lines.length){ status("İçinde direk/hat yok."); (window.aybModal||alert)("MİF içinde direk/hat bulunamadı."); return; }
    status("Direk: "+built.count.direk+" · Hat: "+built.count.hat+" yükleniyor…");
    openBuilt(built, projName);
  }

  function classifyInto(map, name, txt){
    var low=(name||"").toLowerCase();
    var looksMif = /\.mif$/.test(low) || /(^|\n)\s*Columns\s+\d+/i.test(txt) || /(^|\n)\s*Version\s+\d+/i.test(txt) || /(^|\n)\s*Data\b/i.test(txt);
    var looksMid = /\.mid$/.test(low) || (!looksMif && /^\s*"/.test(txt));
    if(/hatlar/.test(low)){ if(looksMid) map.hmid=txt; else map.hmif=txt; return; }
    if(/(direktrafolar|trafolar|trafo)/.test(low)){ if(looksMid) map.tmid=txt; else map.tmif=txt; return; }
    if(/direkler/.test(low)){ if(looksMid) map.mid=txt; else map.mif=txt; return; }
    /* isim belirsiz: içeriğe göre */
    if(looksMif){ if(!map.mif) map.mif=txt; else if(!map.hmif && /(^|\n)\s*P?Line\b/i.test(txt)) map.hmif=txt; }
    else if(looksMid){ if(!map.mid) map.mid=txt; else if(!map.hmid) map.hmid=txt; }
  }

  async function handleFiles(fileList){
    var files=Array.prototype.slice.call(fileList||[]);
    if(!files.length){ status("Dosya seçilmedi."); return; }
    status(files.length+" dosya alındı, işleniyor…");
    var projName=(files[0].name||"MİF").replace(/\.(zip|rar|mif|mid)$/i,"") || "MİF Projesi";

    var bufs=[];
    for(var i=0;i<files.length;i++){
      try{ bufs.push({ name:files[i].name||("dosya"+i), buf: await readAB(files[i]) }); }
      catch(e){}
    }
    if(!bufs.length){ status("Dosya okunamadı."); return; }

    var zipItem=null;
    for(var k=0;k<bufs.length;k++){ if(isZip(bufs[k].buf)){ zipItem=bufs[k]; break; } }

    var map={};
    if(zipItem){
      status("ZIP açılıyor…");
      var files2;
      try{ files2=unzip(zipItem.buf); }
      catch(e){ status("ZIP açılamadı: "+(e&&e.message?e.message:e)); (window.aybModal||alert)("ZIP açılamadı: "+(e&&e.message?e.message:e)); return; }
      var names=Object.keys(files2);
      status("ZIP içinde "+names.length+" dosya bulundu.");
      names.forEach(function(name){ classifyInto(map, name, decodeText(files2[name])); });
    } else {
      /* ZIP değil: seçilen .mif/.mid dosyaları */
      bufs.forEach(function(b){ classifyInto(map, b.name, decodeText(new Uint8Array(b.buf))); });
    }
    finishMap(map, projName);
  }

  function pickAndImport(){
    var inp=d.getElementById("aybMifZipInput");
    if(!inp){
      inp=d.createElement("input");
      inp.type="file"; inp.id="aybMifZipInput";
      inp.accept="*/*";            /* her dosya seçilebilsin (ZIP dahil) */
      inp.multiple=true;
      inp.style.display="none";
      inp.addEventListener("change",function(){ var fl=inp.files; handleFiles(fl); inp.value=""; });
      d.body.appendChild(inp);
    }
    status("Dosya seç: MİF .zip dosyasını göster");
    inp.click();
  }

  /* ---------- 9) Butonu yakalama modunda bağla (eski işleve kaçmasın) ---------- */
  window.aybImportMifZip = pickAndImport;
  try{ window.importMIF = pickAndImport; }catch(e){}
  d.addEventListener("click", function(ev){
    var t=ev.target;
    while(t && t!==d){
      if(t.id==="btnMIFImport"){
        try{ ev.preventDefault(); ev.stopPropagation(); if(ev.stopImmediatePropagation) ev.stopImmediatePropagation(); }catch(e){}
        pickAndImport();
        return;
      }
      t=t.parentNode;
    }
  }, true);
})();


/* ===================================================================== */
/* KÖRFEZİM — SAHA TAKİP PANELİ (günlük plan + bugün/genel takılan lamba) */
/* ===================================================================== */
(function(){
  "use strict";
  var d=document;
  var LSKEY="aybTakip_";

  function proj(){ return window.project; }
  function pid(){ var p=proj(); return (p&&p.id)?String(p.id):"default"; }
  function pname(){ var p=proj(); return (p&&p.name)?String(p.name):"Proje"; }
  function today(){ var t=new Date(); return t.getFullYear()+"-"+("0"+(t.getMonth()+1)).slice(-2)+"-"+("0"+t.getDate()).slice(-2); }

  function load(){
    try{ var s=localStorage.getItem(LSKEY+pid()); if(s){ var o=JSON.parse(s); if(!o.days)o.days={}; if(!o.plan)o.plan=50; return o; } }catch(e){}
    return { plan:50, days:{} };
  }
  function save(st){ try{ localStorage.setItem(LSKEY+pid(), JSON.stringify(st)); }catch(e){} }

  function poleCount(){ var p=proj(); if(!p||!p.objects) return 0; return p.objects.filter(function(o){return o.type==="direk";}).length; }
  function totalLamps(){
    var p=proj(); if(!p||!p.objects) return 0; var t=0;
    p.objects.forEach(function(o){
      if(o.type==="direk" && o.props && Array.isArray(o.props.lambalar)){
        o.props.lambalar.forEach(function(l){ var a=parseInt(l&&l.adet,10); t+=(isFinite(a)&&a>0)?a:1; });
      }
    });
    return t;
  }
  function cumInstalled(st){ var t=0, k; for(k in (st.days||{})) t+=(+st.days[k]||0); return t; }

  function injectStyle(){
    if(d.getElementById("ayb_takip_style")) return;
    var st=d.createElement("style"); st.id="ayb_takip_style";
    st.textContent=
      "#aybTakipToggle{position:fixed;top:56px;right:14px;z-index:1290;background:#0f766e;color:#fff;border:none;"+
        "border-radius:20px;padding:8px 14px;font-size:14px;font-weight:700;box-shadow:0 4px 12px rgba(15,23,42,.3);"+
        "cursor:pointer;font-family:inherit;line-height:1;}"+
      "#aybTakipToggle:active{transform:scale(.96);}"+
      "#aybTakipPanel{position:fixed;top:96px;right:14px;z-index:1291;width:290px;max-width:92vw;background:#fff;"+
        "border:1px solid #0f766e;border-radius:14px;box-shadow:0 12px 32px rgba(15,23,42,.28);padding:14px 14px 12px;"+
        "font-family:inherit;color:#0f172a;display:none;}"+
      "#aybTakipPanel.show{display:block;}"+
      "#aybTakipPanel h4{margin:0 0 8px;font-size:15px;color:#0f766e;display:flex;justify-content:space-between;align-items:center;}"+
      "#aybTakipPanel .tk-close{cursor:pointer;font-size:18px;color:#64748b;font-weight:700;line-height:1;padding:0 4px;}"+
      "#aybTakipPanel .tk-row{display:flex;justify-content:space-between;align-items:center;margin:6px 0;font-size:14px;}"+
      "#aybTakipPanel .tk-row b{font-size:16px;color:#0f172a;}"+
      "#aybTakipPanel .tk-sep{height:1px;background:#e2e8f0;margin:9px 0;}"+
      "#aybTakipPanel input.tk-inp{width:74px;text-align:center;font-size:16px;font-weight:700;padding:6px;border:1px solid #cbd5e1;"+
        "border-radius:8px;font-family:inherit;color:#0f172a;}"+
      "#aybTakipPanel .tk-btns{display:flex;gap:6px;align-items:center;}"+
      "#aybTakipPanel .tk-pm{width:38px;height:38px;border:none;border-radius:9px;background:#0f766e;color:#fff;font-size:20px;"+
        "font-weight:800;cursor:pointer;line-height:1;}"+
      "#aybTakipPanel .tk-pm.minus{background:#b91c1c;}"+
      "#aybTakipPanel .tk-bar{height:10px;background:#e2e8f0;border-radius:6px;overflow:hidden;margin-top:4px;}"+
      "#aybTakipPanel .tk-bar>span{display:block;height:100%;background:#16a34a;width:0;}"+
      "#aybTakipPanel .tk-muted{color:#64748b;font-size:12px;}";
    d.head.appendChild(st);
  }

  var panel, els={};
  function buildPanel(){
    if(d.getElementById("aybTakipPanel")) return;
    panel=d.createElement("div"); panel.id="aybTakipPanel";
    panel.innerHTML=
      '<h4><span id="aybTkTitle">Saha Takip</span><span class="tk-close" id="aybTkClose">✕</span></h4>'+
      '<div class="tk-row"><span>Toplam Direk</span><b id="aybTkDirek">0</b></div>'+
      '<div class="tk-row"><span>Projedeki Lamba</span><b id="aybTkLamba">0</b></div>'+
      '<div class="tk-sep"></div>'+
      '<div class="tk-row"><span>Günlük Plan</span><input class="tk-inp" id="aybTkPlan" type="number" min="0" inputmode="numeric"></div>'+
      '<div class="tk-row"><span>Bugün Takılan</span>'+
        '<span class="tk-btns"><button class="tk-pm minus" id="aybTkMinus">−</button>'+
        '<input class="tk-inp" id="aybTkToday" type="number" min="0" inputmode="numeric">'+
        '<button class="tk-pm" id="aybTkPlus">+</button></span></div>'+
      '<div class="tk-bar"><span id="aybTkBar"></span></div>'+
      '<div class="tk-row tk-muted"><span id="aybTkProgress">0 / 50</span><span id="aybTkDate"></span></div>'+
      '<div class="tk-sep"></div>'+
      '<div class="tk-row"><span>Genel Takılan</span><b id="aybTkGenel">0</b></div>'+
      '<div class="tk-row"><span>Kalan (projede)</span><b id="aybTkKalan">0</b></div>';
    d.body.appendChild(panel);
    els.title=d.getElementById("aybTkTitle");
    els.direk=d.getElementById("aybTkDirek");
    els.lamba=d.getElementById("aybTkLamba");
    els.plan=d.getElementById("aybTkPlan");
    els.today=d.getElementById("aybTkToday");
    els.minus=d.getElementById("aybTkMinus");
    els.plus=d.getElementById("aybTkPlus");
    els.bar=d.getElementById("aybTkBar");
    els.progress=d.getElementById("aybTkProgress");
    els.date=d.getElementById("aybTkDate");
    els.genel=d.getElementById("aybTkGenel");
    els.kalan=d.getElementById("aybTkKalan");

    d.getElementById("aybTkClose").onclick=function(){ panel.classList.remove("show"); syncToggle(); };
    els.plan.onchange=function(){ var st=load(); st.plan=Math.max(0, parseInt(els.plan.value,10)||0); save(st); refresh(); };
    els.today.onchange=function(){ var st=load(); st.days[today()]=Math.max(0, parseInt(els.today.value,10)||0); save(st); refresh(); };
    els.plus.onclick=function(){ var st=load(); var t=today(); st.days[t]=(+st.days[t]||0)+1; save(st); refresh(); };
    els.minus.onclick=function(){ var st=load(); var t=today(); st.days[t]=Math.max(0,(+st.days[t]||0)-1); save(st); refresh(); };
  }

  function refresh(){
    if(!panel) return;
    var st=load();
    var tCount=(+ (st.days[today()]||0));
    var plan=(+st.plan||50);
    var tot=totalLamps();
    var gen=cumInstalled(st);
    els.title.textContent="Saha Takip — "+pname();
    els.direk.textContent=poleCount();
    els.lamba.textContent=tot;
    if(d.activeElement!==els.plan) els.plan.value=plan;
    if(d.activeElement!==els.today) els.today.value=tCount;
    els.genel.textContent=gen;
    els.kalan.textContent=Math.max(0, tot-gen);
    var pct=plan>0?Math.min(100, Math.round(tCount/plan*100)):0;
    els.bar.style.width=pct+"%";
    els.progress.textContent=tCount+" / "+plan+"  (%"+pct+")";
    els.date.textContent=today();
  }

  function syncToggle(){
    var b=d.getElementById("aybTakipToggle");
    if(b) b.textContent = (panel && panel.classList.contains("show")) ? "📋 Kapat" : "📋 Takip";
  }
  function makeToggle(){
    if(d.getElementById("aybTakipToggle")) return;
    var b=d.createElement("button"); b.id="aybTakipToggle"; b.type="button"; b.textContent="📋 Takip";
    b.onclick=function(ev){ try{ev.preventDefault();ev.stopPropagation();}catch(e){}
      buildPanel();
      if(panel.classList.contains("show")){ panel.classList.remove("show"); }
      else { refresh(); panel.classList.add("show"); }
      syncToggle();
    };
    d.body.appendChild(b);
  }

  function setup(){ injectStyle(); makeToggle(); buildPanel(); }
  if(d.readyState==="loading") d.addEventListener("DOMContentLoaded",function(){ setTimeout(setup,900); });
  setTimeout(setup, 900);
  setTimeout(setup, 2200);
  /* proje açıldığında panel açıksa güncelle; gün değişimini de yakala */
  setInterval(function(){ if(panel && panel.classList.contains("show")) refresh(); }, 4000);
  window.aybTakipRefresh=refresh;
})();


/* ===================================================================== */
/* KÖRFEZİM — SÜRÜM DAMGASI (yeni build aktif mi anında görünür)          */
/* ===================================================================== */
(function(){
  "use strict";
  var d=document;
  var SURUM="v8";
  var TARIH="16.07.2026";
  function make(){
    if(d.getElementById("aybSurumBadge")) return;
    var b=d.createElement("div");
    b.id="aybSurumBadge";
    b.textContent="KÖRFEZİM "+SURUM;
    b.style.cssText="position:fixed;left:8px;bottom:8px;z-index:3000;background:rgba(15,118,110,.92);color:#fff;"+
      "padding:5px 10px;border-radius:8px;font-family:inherit;font-size:12px;font-weight:800;letter-spacing:.3px;"+
      "box-shadow:0 3px 10px rgba(0,0,0,.3);cursor:pointer;";
    b.onclick=function(){
      var mesaj="Körfezim Saha "+SURUM+" ("+TARIH+")\n\nBu sürümde olması gerekenler:\n"+
        "• Metraj → Excel (.xlsx), trafo bazlı + genel lamba özeti\n"+
        "• GPS konum → sağ üst 📍 ile gizle/göster\n"+
        "• MİF İç → ZIP seçince proje gibi çizili gelir (direk+hat+lamba)\n"+
        "• 📋 Takip → günlük plan (50), bugün/genel takılan lamba\n"+
        "• KMZ → direkler siyah daire, lambalar sarı yıldız, yer altı hat dahil\n\n"+
        "Bu yazıyı görüyorsan YENİ sürüm kuruldu demektir.";
      (window.aybModal||alert)(mesaj,"Sürüm Bilgisi");
    };
    d.body.appendChild(b);
  }
  if(d.readyState==="loading") d.addEventListener("DOMContentLoaded",function(){ setTimeout(make,800); });
  setTimeout(make,800);
  setTimeout(make,2000);
})();
