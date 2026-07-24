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
  function aybDesktopPicker(){ try{ return (typeof window.showSaveFilePicker==='function') && !/Android/i.test(navigator.userAgent||''); }catch(e){ return false; } }
  function aybShareFile(filename, blob, mime){
    var m=mime||blob.type||'application/octet-stream';
    /* MASAÜSTÜ (PC/Chrome/Electron): "Farklı Kaydet" penceresi aç, kullanıcı yeri seçsin. Tablet/Android'de çalışmaz -> eski davranış. */
    if(aybDesktopPicker()){
      (async function(){
        try{
          var h=await window.showSaveFilePicker({ suggestedName: filename });
          var w=await h.createWritable(); await w.write(blob); await w.close();
          try{ if(window.toast) toast('Kaydedildi: '+filename); }catch(e){}
        }catch(err){
          if(err && /abort|cancel/i.test(err.name||'')) return; /* kullanıcı vazgeçti */
          try{ var url=URL.createObjectURL(blob); var a=document.createElement('a'); a.href=url; a.download=filename; a.style.display='none'; document.body.appendChild(a); a.click(); setTimeout(function(){ try{URL.revokeObjectURL(url);a.remove();}catch(_){} },800); }catch(e){ try{ aybModal('Kaydetme hatası: '+(e&&e.message?e.message:e)); }catch(_){} }
        }
      })();
      return;
    }
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

  /* MASAÜSTÜ: "KMZ Dış" (#btnKML) programın klasör-kaydetmesini atla -> Sembollü KMZ + Farklı Kaydet */
  document.addEventListener('click', function(ev){
    if(!aybDesktopPicker()) return;
    var t=ev.target; while(t && t!==document){ if(t.id==='btnKML'){
        if(window.aybExportKmzSym){ try{ ev.preventDefault(); ev.stopPropagation(); if(ev.stopImmediatePropagation) ev.stopImmediatePropagation(); }catch(e){} try{ window.aybExportKmzSym(); }catch(e){} }
        return; } t=t.parentNode; }
  }, true);

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
        var im=document.createElement('img'); im.src=src; im.className='ayb-obj-foto'; im.style.cssText='width:100%;height:92px;object-fit:cover;border-radius:8px;border:1px solid #24406e;cursor:zoom-in';
        im.onclick=function(ev){ try{ev.preventDefault();ev.stopPropagation();}catch(_){}
          try{ if(window.aybFotoAc && window.aybKmzFotolar){ window.aybKmzFotolar.push({name:fotoName(o)+' ('+(idx+1)+')',lat:o.lat,lng:o.lng,file:'foto'+(idx+1)+'.jpg',blob:null,url:src,objId:o.id,objIdx:idx}); window.aybFotoAc(window.aybKmzFotolar.length-1); } }catch(e){} };
        var d=document.createElement('button'); d.type='button'; d.textContent='🗑 Sil';
        d.style.cssText='position:absolute;bottom:4px;left:4px;right:4px;height:30px;background:#c62828;color:#fff;border:0;border-radius:7px;cursor:pointer;font:700 12px system-ui';
        d.onclick=function(ev){ try{ev.preventDefault();ev.stopPropagation();}catch(_){}
          var ok=true; try{ ok=window.confirm('Bu fotoğraf silinsin mi?'); }catch(e){}
          if(!ok) return;
          items.splice(idx,1); persist(); refresh();
          try{ if(window.toast) toast('Fotoğraf silindi ('+items.length+' kaldı).'); }catch(e){} };
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
      /* #btnExcel KAPSAMLI METRAJA bağlı (aşağıda), CSV kancası KALDIRILDI */
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
    /* File System Access API'yi SADECE TABLET'te kapat; PC'de showSaveFilePicker açık kalmalı (kaydet penceresi) */
    if(window.AYBNative){
      try{ Object.defineProperty(window,'showDirectoryPicker',{value:undefined,configurable:true}); }catch(e){ try{ window.showDirectoryPicker=undefined; }catch(_){} }
      try{ Object.defineProperty(window,'showSaveFilePicker',{value:undefined,configurable:true}); }catch(e){ try{ window.showSaveFilePicker=undefined; }catch(_){} }
      try{ Object.defineProperty(window,'FileSystemDirectoryHandle',{value:undefined,configurable:true}); }catch(e){ try{ window.FileSystemDirectoryHandle=undefined; }catch(_){} }
    }
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
      var ver=window.AYB_SURUM||'';
      var want='Körfezim Saha Metraj'+(ver?(' '+ver):'')+'\u00A0\u00A0\u00A0Hazırlayan Bayram YARAŞ';
      if(t && t.textContent!==want){ t.textContent=want; }
      try{ var imza=document.getElementById('aybSahaImza'); if(imza) imza.style.display='none'; }catch(e){}
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
        <Style id="st_direk"><IconStyle><scale>0.7</scale><color>${aybKmlColor('#111827')}</color><Icon><href>http://maps.google.com/mapfiles/kml/shapes/placemark_circle.png</href></Icon></IconStyle><LabelStyle><scale>0.75</scale></LabelStyle></Style>
        <Style id="st_trafo"><IconStyle><scale>1.0</scale><color>${aybKmlColor('#e37a00')}</color><Icon><href>http://maps.google.com/mapfiles/kml/shapes/volcano.png</href></Icon></IconStyle><LabelStyle><scale>0.8</scale></LabelStyle></Style>
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
      /* Direk etiketi = DİREK TİPİ (kullanıcı isteği). Diğer objeler = ad/no */
      function aybKmlObjLabel(o){
        if(o && o.type==='direk'){
          var t=(o.props&&o.props.direk_tipi)?String(o.props.direk_tipi).trim():'';
          return t || aybKmlObjectName(o);
        }
        return aybKmlObjectName(o);
      }
      const objPlacemarks=(project.objects||[]).map(o=>`
        <Placemark>
          <name>${aybXml(aybKmlObjLabel(o))}</name>
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
    /* KMZ butonu: GERÇEK PROGRAM SEMBOLLERİ (AYBSYMBOLS SVG->PNG) + saha FOTOĞRAFLARI gömülü çok-dosyalı KMZ */
    window.aybExportKmzSym=async function(){
      try{
        var project=window.project;
        if(!project){ (window.toast||window.alert)("Önce proje aç."); return; }
        if(typeof window.AYBSYMBOLS==="undefined"){ (window.aybModal||window.alert)("Sembol kütüphanesi yüklenmedi."); return; }
        try{ if(window.toast) toast("Sembollü KMZ hazırlanıyor..."); }catch(e){}
        function _safe(s){ return String(s==null?"":s).replace(/[^A-Za-z0-9_]/g,"_"); }
        function _u8(u){ try{ var i=String(u).indexOf(","); var bin=atob(String(u).slice(i+1)); var a=new Uint8Array(bin.length); for(var k=0;k<bin.length;k++)a[k]=bin.charCodeAt(k); return a; }catch(e){ return new Uint8Array(0); } }
        function _svgPng(svg,size){ return new Promise(function(res){ try{
          var s=String(svg||""); if(s.indexOf("<svg")>=0 && s.indexOf(" width=")===-1){ s=s.replace("<svg","<svg width=\""+size+"\" height=\""+size+"\""); }
          var img=new Image();
          img.onload=function(){ try{ var c=document.createElement("canvas"); c.width=size; c.height=size; var x=c.getContext("2d"); x.clearRect(0,0,size,size); x.drawImage(img,0,0,size,size); res(c.toDataURL("image/png")); }catch(e){ res(null); } };
          img.onerror=function(){ res(null); };
          img.src="data:image/svg+xml;charset=utf-8,"+encodeURIComponent(s);
        }catch(e){ res(null); } }); }
        function _pget(id){ return new Promise(function(res){ try{ var r=indexedDB.open("ayb_photos_db",1);
          r.onupgradeneeded=function(){ try{ r.result.createObjectStore("photos",{keyPath:"id"}); }catch(e){} };
          r.onerror=function(){ res([]); };
          r.onsuccess=function(){ try{ var db=r.result; var t=db.transaction("photos","readonly"); var g=t.objectStore("photos").get(id);
            g.onsuccess=function(e){ var v=e.target.result; res((v&&v.items)||[]); }; g.onerror=function(){res([]);}; }catch(e){ res([]); } };
        }catch(e){ res([]); } }); }
        function _symId(o){ try{ var m=o.props&&o.props.symbol_id; var f=(typeof defaultSymbolIdForObject==="function")?defaultSymbolIdForObject(o):null; return m||f||null; }catch(e){ return null; } }
        function _label(o){ try{ if(o&&o.type==="direk"){ var t=(o.props&&o.props.direk_tipi)?String(o.props.direk_tipi).trim():""; if(t) return t; } return (typeof getObjectNo==="function")?String(getObjectNo(o)||""):""; }catch(e){ return ""; } }
        function _kmz(files){
          var U16=aybU16,U32=aybU32,CRC=aybCrc32,DT=aybZipDateTime();
          var locals=[],centrals=[],offset=0;
          for(var i=0;i<files.length;i++){
            var nb=new TextEncoder().encode(files[i].name), data=files[i].bytes, crc=CRC(data);
            var lh=[].concat(U32(0x04034b50),U16(20),U16(0),U16(0),U16(DT.time),U16(DT.date),U32(crc),U32(data.length),U32(data.length),U16(nb.length),U16(0));
            var la=new Uint8Array(lh.length+nb.length+data.length); la.set(lh,0); la.set(nb,lh.length); la.set(data,lh.length+nb.length); locals.push(la);
            var ch=[].concat(U32(0x02014b50),U16(20),U16(20),U16(0),U16(0),U16(DT.time),U16(DT.date),U32(crc),U32(data.length),U32(data.length),U16(nb.length),U16(0),U16(0),U16(0),U16(0),U32(0),U32(offset));
            var ca=new Uint8Array(ch.length+nb.length); ca.set(ch,0); ca.set(nb,ch.length); centrals.push(ca);
            offset+=la.length;
          }
          var csize=0; centrals.forEach(function(c){csize+=c.length;});
          var end=new Uint8Array([].concat(U32(0x06054b50),U16(0),U16(0),U16(files.length),U16(files.length),U32(csize),U32(offset),U16(0)));
          return new Blob(locals.concat(centrals).concat([end]),{type:"application/vnd.google-earth.kmz"});
        }
        var files=[], styleMap={}, styleXml="";
        var objects=project.objects||[];
        var uniq={}; objects.forEach(function(o){ var s=_symId(o); if(s) uniq[s]=true; });
        var ids=Object.keys(uniq);
        for(var i=0;i<ids.length;i++){
          var sid=ids[i], sym=window.AYBSYMBOLS.getById(sid);
          if(!sym||!sym.svg) continue;
          var png=await _svgPng(sym.svg,96); if(!png) continue;
          var fn="files/sym_"+_safe(sid)+".png"; files.push({name:fn,bytes:_u8(png)});
          var stid="s_"+_safe(sid); styleMap[sid]=stid;
          var _sc=(sym.objectType==="trafo")?0.8:0.6;
          styleXml+='<Style id="'+stid+'"><IconStyle><scale>'+_sc+'</scale><Icon><href>'+fn+'</href></Icon></IconStyle><LabelStyle><scale>0.7</scale></LabelStyle></Style>\n';
        }
        /* PROGRAM LAMBA sembolleri — HAZIR PNG (cihaz canvas gerekmez, garanti) */
        var _lampPng={
          yeni:"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",
          mevcut:"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",
          sokulen:"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"
        };
        var _lampStyle={};
        for(var lk in _lampPng){ if(!_lampPng.hasOwnProperty(lk)) continue;
          try{ var lfn="files/lamp_"+lk+".png"; files.push({name:lfn,bytes:_u8(_lampPng[lk])});
            styleXml+='<Style id="lamp_'+lk+'"><IconStyle><scale>0.6</scale><Icon><href>'+lfn+'</href></Icon></IconStyle><LabelStyle><scale>0.7</scale></LabelStyle></Style>\n';
            _lampStyle[lk]=true;
          }catch(e){}
        }
        function _lampTip(o){ try{ var dd=(o.props&&o.props.durum)?String(o.props.durum).toUpperCase():""; if(dd==="MEVCUT") return "mevcut"; if(dd.indexOf("DM")>=0||dd.indexOf("SÖK")>=0||dd.indexOf("SOK")>=0) return "sokulen"; return "yeni"; }catch(e){ return "yeni"; } }
        styleXml+=
          '<Style id="ln_ag"><LineStyle><color>'+aybKmlColor('#1aa260')+'</color><width>3</width></LineStyle></Style>'
         +'<Style id="ln_abone"><LineStyle><color>'+aybKmlColor('#f59e0b')+'</color><width>3</width></LineStyle></Style>'
         +'<Style id="ln_og"><LineStyle><color>'+aybKmlColor('#dc2626')+'</color><width>4</width></LineStyle></Style>'
         +'<Style id="ln_enh"><LineStyle><color>'+aybKmlColor('#111827')+'</color><width>4</width></LineStyle></Style>'
         +'<Style id="ln_ayd"><LineStyle><color>'+aybKmlColor('#06b6d4')+'</color><width>3</width></LineStyle></Style>'
         +'<Style id="ln_yeralti"><LineStyle><color>'+aybKmlColor('#1aa260')+'</color><width>3</width></LineStyle></Style>'
         +'<Style id="ln_kanal"><LineStyle><color>'+aybKmlColor('#facc15')+'</color><width>4</width></LineStyle></Style>'
         +'<Style id="ln_free"><LineStyle><color>'+aybKmlColor('#f97316')+'</color><width>3</width></LineStyle></Style>'
         +'<Style id="st_lamba"><IconStyle><scale>0.5</scale><color>'+aybKmlColor('#fde047')+'</color><Icon><href>http://maps.google.com/mapfiles/kml/shapes/star.png</href></Icon></IconStyle><LabelStyle><scale>0.72</scale></LabelStyle></Style>'
         +'<Style id="poly_area"><LineStyle><color>'+aybKmlColor('#22c55e')+'</color><width>2</width></LineStyle><PolyStyle><color>'+aybKmlColor('#22c55e','35')+'</color></PolyStyle></Style>';
        var objPm="";
        for(var j=0;j<objects.length;j++){
          var o=objects[j]; if(o.lat==null||o.lng==null) continue;
          var sid2=_symId(o); var su=(sid2&&styleMap[sid2])?("<styleUrl>#"+styleMap[sid2]+"</styleUrl>"):"";
          var base=""; try{ base=(typeof aybObjectDescription==="function")?aybObjectDescription(o):""; }catch(e){}
          var inner=String(base).replace(/^\s*<!\[CDATA\[/,"").replace(/\]\]>\s*$/,"");
          var items=await _pget(o.id);
          if(items&&items.length){
            inner+='<div style="margin-top:8px"><b>Foto&#287;raflar ('+items.length+')</b><br>';
            for(var p=0;p<items.length;p++){ var ff="files/foto_"+_safe(o.id)+"_"+p+".jpg"; files.push({name:ff,bytes:_u8(items[p])}); inner+='<img src="'+ff+'" width="260" style="margin:4px 0;border:1px solid #bbb;border-radius:4px"/><br>'; }
            inner+='</div>';
          }
          objPm+='<Placemark><name>'+aybXml(_label(o))+'</name>'+su+'<description><![CDATA['+inner+']]></description>'
            +'<Point><coordinates>'+Number(o.lng).toFixed(8)+','+Number(o.lat).toFixed(8)+',0</coordinates></Point></Placemark>\n';
        }
        var linePm=(project.lines||[]).map(function(l){
          var a=objects.find(function(o){return o.id===l.start;}), b=objects.find(function(o){return o.id===l.end;});
          var pts; if(a&&b){ pts=aybLinePathPoints(l,a,b); }
          if((!pts||pts.length<2)&&Array.isArray(l.points)&&l.points.length>=2){ pts=l.points.map(aybNormalizeLinePoint).filter(function(p){return isFinite(p[0])&&isFinite(p[1]);}); }
          if((!pts||pts.length<2)&&a&&b){ pts=[[Number(a.lat),Number(a.lng)],[Number(b.lat),Number(b.lng)]]; }
          if(!pts||pts.length<2) return "";
          var nm=(a&&b)?((lineLabels[l.kind]||"Hat")+" "+getObjectNo(a)+" - "+getObjectNo(b)):(lineLabels[l.kind]||"Hat");
          return '<Placemark><name>'+aybXml(nm)+'</name><styleUrl>#'+aybLineStyleId(l)+'</styleUrl><description>'+((a&&b)?aybLineDescription(l,a,b,pts):"")+'</description><LineString><tessellate>1</tessellate><coordinates>'+aybKmlCoords(pts)+'</coordinates></LineString></Placemark>';
        }).join("\n");
        var lampPm=(project.objects||[]).filter(window.aybKmlPoleHasLamp).map(function(o){
          var label=window.aybKmlLampLabel(o)||"Lamba"; var dLat=0.000032;
          var _t=_lampTip(o); var _su=_lampStyle[_t]?("#lamp_"+_t):"#st_lamba";
          return '<Placemark><name>'+aybXml(label)+'</name><styleUrl>'+_su+'</styleUrl><description><![CDATA[Direk '+aybHtml(getObjectNo(o))+' lambasi: '+aybHtml(label)+']]></description><Point><coordinates>'+Number(o.lng).toFixed(8)+','+(Number(o.lat)+dLat).toFixed(8)+',0</coordinates></Point></Placemark>';
        }).join("\n");
        var chanPm=(project.channels||[]).map(function(c){ var pts=(c.points||[]).map(aybNormalizeLinePoint).filter(function(p){return isFinite(p[0])&&isFinite(p[1]);}); if(pts.length<2) return ""; return '<Placemark><name>'+aybXml("Kanal "+aybKanalFullNameFromProps(c.props))+'</name><styleUrl>#ln_kanal</styleUrl><description>'+aybChannelDescription(c,pts)+'</description><LineString><tessellate>1</tessellate><coordinates>'+aybKmlCoords(pts)+'</coordinates></LineString></Placemark>'; }).join("\n");
        var freePm=(project.freeLines||[]).map(function(f){ var pts=(f.points||[]).map(aybNormalizeLinePoint).filter(function(p){return isFinite(p[0])&&isFinite(p[1]);}); if(pts.length<2) return ""; return '<Placemark><name>'+aybXml(f.kind||"Çizgi")+'</name><styleUrl>#ln_free</styleUrl><LineString><tessellate>1</tessellate><coordinates>'+aybKmlCoords(pts)+'</coordinates></LineString></Placemark>'; }).join("\n");
        var areaPm=(project.areas||[]).map(function(a){ var pts=(a.points||[]).map(aybNormalizeLinePoint).filter(function(p){return isFinite(p[0])&&isFinite(p[1]);}); if(pts.length<3) return ""; var closed=pts.concat([pts[0]]); return '<Placemark><name>'+aybXml(a.kind||"Alan")+'</name><styleUrl>#poly_area</styleUrl><Polygon><outerBoundaryIs><LinearRing><coordinates>'+aybKmlCoords(closed)+'</coordinates></LinearRing></outerBoundaryIs></Polygon></Placemark>'; }).join("\n");
        var kml='<?xml version="1.0" encoding="UTF-8"?>\n<kml xmlns="http://www.opengis.net/kml/2.2"><Document>'
          +'<name>'+aybXml(project.name||"AYB Saha Projesi")+'</name>'
          +'<description>Korfezim Saha Metraj - program sembolleri ve saha fotograflari gomulu.</description>'
          +styleXml
          +'<Folder><name>Objeler</name>'+objPm+'</Folder>'
          +'<Folder><name>Hatlar</name>'+linePm+'</Folder>'
          +'<Folder><name>Lambalar</name>'+lampPm+'</Folder>'
          +'<Folder><name>Kanallar</name>'+chanPm+'</Folder>'
          +'<Folder><name>Cizimler</name>'+freePm+areaPm+'</Folder>'
          +'</Document></kml>';
        files.unshift({name:"doc.kml", bytes:new TextEncoder().encode(kml)});
        var blob=_kmz(files);
        var nm=((window.aybFileTag?window.aybFileTag():((project.name)||"Korfezim_Saha"))+"_sembollu.kmz");
        if(window.aybShareFile){ window.aybShareFile(nm, blob, "application/vnd.google-earth.kmz"); }
        else if(typeof aybDownloadFile==="function"){ aybDownloadFile(nm, blob, "application/vnd.google-earth.kmz"); }
        try{ if(window.toast) toast("Sembollu KMZ hazir ("+files.length+" dosya): "+nm); }catch(e){}
      }catch(e){ (window.aybModal||window.alert)("KMZ hata: "+(e&&e.message?e.message:e)); }
    };
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

    /* SAYFA 7: Otomat Değişimi (direk hırdavat) */
    function otomatsOf(o){
      var arr=(o&&o.props&&o.props.otomatlar)||[];
      if(!Array.isArray(arr)) return [];
      return arr.map(function(x){ return {tip:S((x&&x.tip)||"").trim(), adet:N((x&&x.adet)||0)}; }).filter(function(x){ return x.tip && x.adet>0; });
    }
    var otoGenel={}, otoTotal=0, otoAny=false;
    var s7=[["Direk No","Otomat Tipi","Adet"]];
    direkler.forEach(function(o){
      otomatsOf(o).forEach(function(x){
        s7.push([ S(objNo(o)), x.tip, x.adet ]);
        otoGenel[x.tip]=(otoGenel[x.tip]||0)+x.adet; otoTotal+=x.adet; otoAny=true;
      });
    });
    if(!otoAny) s7.push(["(Otomat değişimi girilmemiş)","",""]);
    s7.push(["","",""]); s7.push(["ÖZET — Tipe Göre","",""]); s7.push(["Otomat Tipi","Toplam Adet",""]);
    Object.keys(otoGenel).sort().forEach(function(t){ s7.push([t, otoGenel[t], ""]); });
    s7.push(["GENEL TOPLAM", otoTotal, ""]);

    var sheets=[
      {name:"Trafo_Lamba_Ozeti", rows:s1},
      {name:"Genel_Lamba_Ozeti", rows:s2},
      {name:"Direk_Aksam", rows:s3},
      {name:"Trafo_Listesi", rows:s4},
      {name:"Hatlar", rows:s5},
      {name:"Otomat_Degisimi", rows:s7},
      {name:"Koordinatlar", rows:s6}
    ];
    var fname=(window.aybFileTag?window.aybFileTag():(S(project.name)||"Korfezim_Saha"))+"_metraj.xlsx";
    try{
      if(typeof window.aybBuildXlsx!=="function"){ (window.aybModal||alert)("Excel üretici hazır değil, birkaç saniye sonra tekrar deneyin."); return; }
      var blob=window.aybBuildXlsx(sheets);
      var mime="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet";
      if(window.aybShareFile) window.aybShareFile(fname, blob, mime);
      else if(typeof aybDownloadFile==="function") aybDownloadFile(fname, blob, mime);
      try{ if(window.toast) toast("Metraj Excel hazır: "+fname); }catch(e){}
    }catch(e){ (window.aybModal||alert)("Metraj oluşturulamadı: "+(e&&e.message?e.message:e)); return; }
  };

  /* Metraj düğmesini (btnExcel) bu kapsamlı metraja bağla (YAKALAMA fazı = garanti) */
  function bindMetrajBtn(){
    try{
      window.exportProfessionalMetraj = window.exportKorfezimMetraj;
      if(!window.__aybMetrajBound){
        window.__aybMetrajBound=true;
        document.addEventListener("click", function(ev){
          var t=ev.target;
          while(t && t!==document){
            if(t.id==="btnExcel"){
              try{ ev.preventDefault(); ev.stopPropagation(); if(ev.stopImmediatePropagation) ev.stopImmediatePropagation(); }catch(e){}
              window.exportKorfezimMetraj();
              return;
            }
            t=t.parentNode;
          }
        }, true);
      }
    }catch(e){}
  }
  if(document.readyState==="loading") document.addEventListener("DOMContentLoaded",function(){ setTimeout(bindMetrajBtn,900); });
  setTimeout(bindMetrajBtn, 900);
  setTimeout(bindMetrajBtn, 2000);
})();


/* ===================================================================== */
/* KÖRFEZİM — ALT ÇUBUK + GPS KONUM (küçük, altta, haritayı kapatmaz)     */
/* ===================================================================== */
(function(){
  "use strict";
  function injectStyle(){
    if(document.getElementById("ayb_gps_toggle_style")) return;
    var st=document.createElement("style"); st.id="ayb_gps_toggle_style";
    st.textContent =
      /* GPS kartı: SAĞ ALT köşe, DAHA KÜÇÜK, haritayı kapatmaz */
      "#gpsCard.gps-live{top:auto!important;left:auto!important;right:6px!important;bottom:74px!important;"+
        "max-width:168px!important;font-size:9.5px!important;line-height:1.25!important;padding:5px 7px!important;border-radius:9px!important;opacity:.94;}"+
      /* ÜST ARAÇ SATIRLARI (butonlar + uydu ayar) YATAY kaydırılsın */
      ".ayb-office-native-ribbon{display:flex!important;flex-wrap:nowrap!important;overflow-x:auto!important;overflow-y:hidden!important;-webkit-overflow-scrolling:touch;}"+
      ".ayb-office-native-ribbon>*{flex:0 0 auto!important;}"+
      ".ayb-native-clean-workbar,.workbar{display:flex!important;flex-wrap:nowrap!important;overflow-x:auto!important;"+
        "overflow-y:hidden!important;-webkit-overflow-scrolling:touch;scrollbar-width:thin;max-width:100vw!important;width:100%!important;box-sizing:border-box!important;}"+
      ".ayb-native-clean-workbar>*,.workbar>*{flex:0 0 auto!important;}"+
      ".ayb-office-native-ribbon::-webkit-scrollbar,.ayb-native-clean-workbar::-webkit-scrollbar,.workbar::-webkit-scrollbar{height:5px;}"+
      ".ayb-office-native-ribbon::-webkit-scrollbar-thumb,.ayb-native-clean-workbar::-webkit-scrollbar-thumb,.workbar::-webkit-scrollbar-thumb{background:#94a3b8;border-radius:3px;}"+
      /* Saha Veri grubu artık AYARLAR düğmesi (görünür) */
      ".ayb-pro-group.fielddata{display:inline-flex!important;}"+
      "#btnFieldDataToggle{display:inline-flex!important;}";
    document.head.appendChild(st);
  }
  /* Geriye dönük uyumluluk için gizli kapsayıcı (artık düğme yok) */
  window.aybBottomBar=function(){ var b=document.getElementById("aybBottomBar"); if(!b){ b=document.createElement("div"); b.id="aybBottomBar"; b.style.display="none"; document.body.appendChild(b);} return b; };
  function setup(){ injectStyle(); }
  if(document.readyState==="loading") document.addEventListener("DOMContentLoaded",setup);
  setup();
  setTimeout(setup, 1500);
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
        var mifGenel=iGen>=0?String(row[iGen]||"AG"):"AG";
        var genelTip=(lambalar.length>0)?"AYD":mifGenel;   /* lambalı direk = AYDINLATMA (AG değil) */
        var props={
          direk_no: iNo>=0?String(row[iNo]||("DRK"+(idx+1))):("DRK"+(idx+1)),
          direk_tipi: iTip>=0?String(row[iTip]||""):"",
          genel_tip: genelTip,
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
      var tTur=colIndex(TC,["TrafoTuru","Trafo_Turu","Turu"]);
      var tDur=colIndex(TC,["Durumu","Durum"]);
      var tTip=colIndex(TC,["TrafoTipi","Trafo_Tipi","Tipi"]);
      tm.features.forEach(function(ft,idx){
        if(ft.geom!=="point") return;
        var row=tmd[idx]||[];
        var ll=tmToLatLon(ft.coords[0][0], ft.coords[0][1], cm);
        var _guc=tGuc>=0?String(row[tGuc]||""):"";
        trafoObjs.push({ id:UID("TRAFO"), type:"trafo", lat:ll.lat, lng:ll.lng,
          props:{ trafo_no: tNo>=0?String(row[tNo]||("TR"+(idx+1))):("TR"+(idx+1)),
                  trafo_gucu:_guc, trafo_guc:_guc,
                  trafo_turu: tTur>=0?String(row[tTur]||""):"",
                  trafo_tipi: tTip>=0?String(row[tTip]||""):"",
                  durum: (tDur>=0?(String(row[tDur]||"MEVCUT")||"MEVCUT"):"MEVCUT"),
                  ithal_kaynak:"MIF" } });
      });
    }

    /* Box/Kofre/Abone/EkMuf katmanları (varsa) */
    function noktaParse(mifTxt, midTxt, tip, noCols, defPrefix, noKey){
      var out=[];
      if(!mifTxt) return out;
      try{
        var pm=parseMifText(mifTxt), pmd=midTxt?parseMidText(midTxt):[], PC=pm.columns;
        var iNo=colIndex(PC,noCols), iDur=colIndex(PC,["Durumu","Durum"]), iTp=colIndex(PC,["Tipi","Tip"]);
        pm.features.forEach(function(ft,idx){
          if(ft.geom!=="point") return;
          var row=pmd[idx]||[];
          var ll=tmToLatLon(ft.coords[0][0], ft.coords[0][1], cm);
          var props={ durum:(iDur>=0?(String(row[iDur]||"MEVCUT")||"MEVCUT"):"MEVCUT"), ithal_kaynak:"MIF" };
          var noVal=iNo>=0?String(row[iNo]||""):""; if(!noVal) noVal=defPrefix+(idx+1);
          props[noKey]=noVal;
          if(iTp>=0&&row[iTp]) props.tipi=String(row[iTp]);
          out.push({ id:UID(tip.toUpperCase()), type:tip, lat:ll.lat, lng:ll.lng, props:props });
        });
      }catch(e){}
      return out;
    }
    var boxObjs  =noktaParse(fileMap.bxmif, fileMap.bxmid, "box",   ["BoxNo","Box_No","No"],   "BX", "box_no");
    var kofreObjs=noktaParse(fileMap.kfmif, fileMap.kfmid, "kofre", ["KofreNo","Kofre_No","No"],"KF", "kofre_no");
    var aboneObjs=noktaParse(fileMap.abmif, fileMap.abmid, "abone", ["AboneNo","Abone_No","No"],"AB", "abone_no");
    var ekmufObjs=noktaParse(fileMap.emmif, fileMap.emmid, "ekmuf", ["MufNo","EkMufNo","No"],  "EM", "ekmuf_no");

    var allObjs=direkObjs.concat(trafoObjs, boxObjs, kofreObjs, aboneObjs, ekmufObjs);

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
        var hatGenel=iGt>=0?String(row[iGt]||"").toUpperCase():"";
        var isAyd=hatGenel.indexOf("AYD")>=0;
        /* Kesit SADECE hat_tipi'ne yazılır; ag_hat_tipi/ag_hat_aktif YOK -> "(4x10)+(4x10)" çiftlenmesi biter */
        var lprops={ hat_tipi:kesit, hy:"HAVAİ", durum:"MEVCUT", kaynak:"MIF", ithal_kaynak:"MIF" };
        lprops.genel_tip = isAyd ? "AYD" : "AG";
        var line={ id:UID("HAT"), kind:"hat", start:s.id, end:e.id, props:lprops };
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
    /* Yükleniyor perdesi (donuk görünmesin, kullanıcı beklesin) */
    var ov=d.getElementById("aybLoadOverlay");
    if(!ov){
      ov=d.createElement("div"); ov.id="aybLoadOverlay";
      ov.style.cssText="position:fixed;inset:0;z-index:5000;background:rgba(15,23,42,.72);color:#fff;"+
        "display:flex;align-items:center;justify-content:center;text-align:center;font-family:inherit;"+
        "font-size:16px;font-weight:700;padding:24px;";
      d.body.appendChild(ov);
    }
    ov.innerHTML="MİF çiziliyor…<br><span style='font-weight:400;font-size:13px'>"+
      built.count.direk+" direk · "+built.count.hat+" hat · büyük projede birkaç saniye sürebilir, lütfen bekleyin.</span>";
    ov.style.display="flex";

    var pr=window.newProject(projName||"MİF Projesi");
    pr.objects=built.objects; pr.lines=built.lines;
    pr.freeLines=pr.freeLines||[]; pr.channels=pr.channels||[]; pr.areas=pr.areas||[];

    /* Perde boyansın diye kısa gecikme, sonra: ÖNCE haritayı veriye götür (boş harita = anında),
       SONRA tek renderAll doğru zoom'da çalışsın (çift çizim yok = daha hızlı, daha az donma) */
    setTimeout(function(){
      try{
        var m=window.__aybMap||window.map;
        if(m && built.objects.length){
          var lat0=built.objects[0].lat, lng0=built.objects[0].lng, latN=lat0, latX=lat0, lngN=lng0, lngX=lng0;
          built.objects.forEach(function(o){ if(o.lat<latN)latN=o.lat; if(o.lat>latX)latX=o.lat; if(o.lng<lngN)lngN=o.lng; if(o.lng>lngX)lngX=o.lng; });
          m.fitBounds([[latN,lngN],[latX,lngX]], {padding:[40,40], maxZoom:18, animate:false});
        }
      }catch(e){}
      try{ if(window.aybApplyLabelZoom) window.aybApplyLabelZoom(); }catch(e){}  /* uzaktaysa etiketler baştan kapalı = hafif */
      window.openProject(pr);   /* tek render */
      setTimeout(function(){ if(ov) ov.style.display="none"; }, 400);
      (window.aybModal||function(x){try{window.toast&&toast(x);}catch(e){}})(
        "MİF yüklendi — Direk: "+built.count.direk+", Trafo: "+built.count.trafo+", Hat: "+built.count.hat+
        ".\nHaritada çizili olarak açıldı; direğe dokunup lamba ekle/çıkar yapabilirsin.","MİF İçe Aktarma");
    }, 80);
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
    /* JSON ÖNCELİĞİ (Bayram YARAŞ): pakette aybproje.json varsa MİF katmanları yerine
       TAM VERİ kullanılır — koordinat dönüşümü ve kolon kaybı olmaz. */
    if(map.pjson){
      try{
        var pj=JSON.parse(map.pjson);
        /* Hem MİF zip'indeki aybproje.json hem de tabletin "Proje Paketi" (PAKET_*.json)
           dosyası tanınır — ekip yanlışlıkla paketi atsa bile veri kaybolmaz. */
        var kok=(pj&&pj.proje&&Array.isArray(pj.proje.objects))?pj.proje:pj;
        var objs=Array.isArray(kok.objects)?kok.objects:[];
        var lns=Array.isArray(kok.lines)?kok.lines:[];
        if(pj.ekip||kok.ekip) window.__aybImportEkip=pj.ekip||kok.ekip;
        if(pj.gun||kok.gun) window.__aybImportGun=pj.gun||kok.gun;
        var _nt=(Array.isArray(kok.aybNotes)&&kok.aybNotes.length)?kok.aybNotes:((Array.isArray(pj.aybNotes)&&pj.aybNotes.length)?pj.aybNotes:null);
        if(_nt) window.__aybPendingNotes=_nt;
        var cnt={direk:0,trafo:0,hat:lns.length};
        objs.forEach(function(o){ if(!o)return; if(o.type==='direk')cnt.direk++; else if(o.type==='trafo')cnt.trafo++; });
        var builtJ={objects:objs, lines:lns, count:cnt, fromJson:true};
        status("JSON (tam veri): Direk "+cnt.direk+" · Trafo "+cnt.trafo+" · Hat "+cnt.hat);
        if(window.__aybPCMerge||window.__aybMergeOnce){ window.__aybMergeOnce=false; window.aybMergeBuilt(builtJ, (pj.name||projName)+" [JSON]"); return; }
        askImportMode(builtJ, (pj.name||projName));
        return;
      }catch(e){ status("aybproje.json okunamadı ("+(e&&e.message?e.message:e)+"), MİF katmanlarına dönülüyor…"); }
    }
    var cm=33;
    var probe=map.mif||map.hmif||"";
    var mm=String(probe).match(/Projection\s+\d+\s*,\s*\d+\s*,\s*"[^"]*"\s*,\s*(\d+)/i);
    if(mm) cm=+mm[1];
    if(!map.mif && !map.hmif){ status("Direkler.mif / Hatlar.mif bulunamadı."); (window.aybModal||alert)("ZIP içinde Direkler.mif ve Direkler.mid bulunamadı. Doğru MİF zip'ini seçtiğinden emin ol."); return; }
    var built;
    try{ built=buildProject(map, projName, cm); }
    catch(e){ status("İşlenemedi: "+(e&&e.message?e.message:e)); (window.aybModal||alert)("MİF işlenemedi: "+(e&&e.message?e.message:e)); return; }
    if(!built.objects.length && !built.lines.length){ status("İçinde direk/hat yok."); (window.aybModal||alert)("MİF içinde direk/hat bulunamadı."); return; }
    status("Direk: "+built.count.direk+" · Hat: "+built.count.hat+" hazır.");
    if(window.__aybPCMerge||window.__aybMergeOnce){ window.__aybMergeOnce=false; window.aybMergeBuilt(built, projName); return; }
    askImportMode(built, projName);
  }

  /* ---- PC: gelen MİF'i mevcut projeye BİRLEŞTİR + koordinat mükerrer kontrolü ---- */
  window.aybMergeBuilt=function(built, projName){
    try{
      var p=window.project;
      if(!p || !Array.isArray(p.objects)){ openBuilt(built, projName); return; }
      var TOL=0.00002; /* ~2 m */
      function near(a,b){ return Math.abs((a.lat||0)-(b.lat||0))<TOL && Math.abs((a.lng||0)-(b.lng||0))<TOL; }
      var existing=p.objects, idMap={}, added=0, dup=0, lamp=0;
      var EKIP=(window.__aybImportEkip||"(bilinmiyor)");
      function _gun2(){ var t=new Date(); return t.getFullYear()+"-"+("0"+(t.getMonth()+1)).slice(-2)+"-"+("0"+t.getDate()).slice(-2); }
      var GUN=(window.__aybImportGun||_gun2());
      (built.objects||[]).forEach(function(o){
        var m=null;
        for(var i=0;i<existing.length;i++){ if(existing[i].type===o.type && near(existing[i],o)){ m=existing[i]; break; } }
        if(m){
          /* İSTEK (Bayram YARAŞ): MÜKERRERDE GÜNCEL KAZANIR — sahadan gelen paket
             en güncel durumdur; aynı koordinattaki objenin ESKİ bilgileri silinir,
             yerine GELEN verinin tamamı yazılır (lambalar dahil). Kimlik (id)
             korunur ki bağlı hatlar kopmasın. */
          dup++; idMap[o.id]=m.id;
          try{
            m.lat=o.lat; m.lng=o.lng;
            m.props=o.props||{};
            m.props._ekip=EKIP; m.props._gun=GUN;
            if(Array.isArray(m.props.lambalar)) m.props.lambalar.forEach(function(l){ l._ekip=EKIP; l._gun=GUN; });
          }catch(_){}
        } else { try{ o.props=o.props||{}; o.props._ekip=EKIP; o.props._gun=GUN; if(Array.isArray(o.props.lambalar)) o.props.lambalar.forEach(function(l){ l._ekip=EKIP; l._gun=GUN; }); }catch(_){} existing.push(o); idMap[o.id]=o.id; added++; }
      });
      p.lines=Array.isArray(p.lines)?p.lines:[];
      var addedL=0;
      var updL=0;
      (built.lines||[]).forEach(function(l){
        var ns=idMap[l.start]||l.start, ne=idMap[l.end]||l.end;
        var el=null;
        for(var li=0; li<p.lines.length; li++){ var cand=p.lines[li]; if((cand.start===ns&&cand.end===ne)||(cand.start===ne&&cand.end===ns)){ el=cand; break; } }
        if(el){
          /* GÜNCEL KAZANIR: aynı iki direk arasındaki hattın bilgileri gelenle değiştirilir */
          try{ if(l.props) el.props=l.props; if(l.length_m!=null) el.length_m=l.length_m; if(Array.isArray(l.points)&&l.points.length>1) el.points=l.points; if(l.kind) el.kind=l.kind; updL++; }catch(_){}
        }
        else { l.start=ns; l.end=ne; p.lines.push(l); addedL++; }
      });
      try{ if(typeof saveProjects==="function") saveProjects(); }catch(e){}
      try{ if(typeof renderAll==="function") renderAll(); }catch(e){}
      var msg="Birleştirildi ✓  +"+added+" yeni obje, +"+addedL+" yeni hat · "+dup+" obje ve "+updL+" hat GÜNCELLENDİ (güncel veri kazandı)";
      status(msg);
      try{ if(window.aybPCLog) window.aybPCLog(projName, msg); }catch(e){}
      return {added:added, dup:dup, addedL:addedL, lamp:lamp};
    }catch(e){ status("Birleştirme hatası: "+(e&&e.message?e.message:e)); }
  };
  window.aybHandleFiles=handleFiles;

  /* ---- MİF: Altlık mı Çizim mi? ---- */
  function askImportMode(built, projName){
    var old=d.getElementById("aybMifModeDlg"); if(old) old.remove();
    var wrap=d.createElement("div"); wrap.id="aybMifModeDlg";
    wrap.style.cssText="position:fixed;inset:0;z-index:6000;background:rgba(15,23,42,.55);display:flex;"+
      "align-items:center;justify-content:center;padding:20px;font-family:inherit;";
    wrap.innerHTML=
      '<div style="background:#fff;border-radius:16px;max-width:360px;width:100%;padding:18px 18px 16px;box-shadow:0 18px 50px rgba(0,0,0,.4);">'+
        '<div style="font-size:16px;font-weight:800;color:#0f172a;margin-bottom:4px;">MİF nasıl açılsın?</div>'+
        '<div style="font-size:13px;color:#475569;margin-bottom:14px;">'+built.count.direk+' direk · '+built.count.hat+' hat</div>'+
        '<button id="aybModeAltlik" style="width:100%;border:none;border-radius:11px;background:#0f766e;color:#fff;'+
          'padding:13px;font-size:15px;font-weight:800;cursor:pointer;margin-bottom:9px;font-family:inherit;">'+
          '🗺️ Altlık (hafif) — önerilen<br><span style="font-weight:400;font-size:12px;">Sadece görüntü: direk tipi + lamba. Tableti yormaz.</span></button>'+
        '<button id="aybModeCizim" style="width:100%;border:none;border-radius:11px;background:#2563eb;color:#fff;'+
          'padding:13px;font-size:15px;font-weight:800;cursor:pointer;margin-bottom:9px;font-family:inherit;">'+
          '✏️ Çizim (düzenlenebilir)<br><span style="font-weight:400;font-size:12px;">Düzenle/metraj yapılır ama ağır olabilir.</span></button>'+
        '<button id="aybModeCancel" style="width:100%;border:1px solid #cbd5e1;border-radius:11px;background:#fff;color:#475569;'+
          'padding:10px;font-size:14px;font-weight:600;cursor:pointer;font-family:inherit;">Vazgeç</button>'+
      '</div>';
    d.body.appendChild(wrap);
    d.getElementById("aybModeAltlik").onclick=function(){ wrap.remove(); openAltlik(built, projName); };
    d.getElementById("aybModeCizim").onclick=function(){ wrap.remove(); openBuilt(built, projName); };
    d.getElementById("aybModeCancel").onclick=function(){ wrap.remove(); };
  }

  /* ---- Hafif ALTLIK (canvas) : obje oluşturmaz, tableti yormaz ---- */
  function openAltlik(built, projName){
    var m=window.__aybMap||window.map;
    if(!m || typeof L==="undefined"){ (window.aybModal||alert)("Harita hazır değil."); return; }
    /* built -> hafif veri */
    var idMap={};
    (built.objects||[]).forEach(function(o){ idMap[o.id]={lat:o.lat,lng:o.lng}; });
    var poles=[];
    (built.objects||[]).forEach(function(o){
      if(o.type!=="direk") return;
      var p=o.props||{}, watt="";
      if(Array.isArray(p.lambalar)&&p.lambalar.length){ var l=p.lambalar[0]; watt=String(l.guc||"").trim(); }
      poles.push({ lat:o.lat, lng:o.lng, no:String(p.direk_no||""), tip:String(p.direk_tipi||""),
        watt:watt, ayd:(String(p.genel_tip||"").toUpperCase().indexOf("AYD")>=0) });
    });
    var lines=[];
    (built.lines||[]).forEach(function(ln){
      var pts=[];
      if(Array.isArray(ln.points)&&ln.points.length>=2){ pts=ln.points.map(function(pp){ return [pp[0],pp[1]]; }); }
      else { var a=idMap[ln.start], b=idMap[ln.end]; if(a&&b){ pts=[[a.lat,a.lng],[b.lat,b.lng]]; } }
      if(pts.length>=2){ var pr=ln.props||{}; lines.push({ pts:pts, ayd:(String(pr.genel_tip||"").toUpperCase().indexOf("AYD")>=0), kesit:String(pr.hat_tipi||"") }); }
    });

    if(window.__aybAltlikLayer){ try{ m.removeLayer(window.__aybAltlikLayer); }catch(e){} window.__aybAltlikLayer=null; }
    var layer=aybMakeAltlikLayer(poles, lines);
    layer.addTo(m);
    window.__aybAltlikLayer=layer;
    window.aybClearAltlik=function(){ try{ m.removeLayer(layer); }catch(e){} window.__aybAltlikLayer=null; };

    /* haritayı veriye sığdır */
    try{
      if(poles.length){ var la0=poles[0].lat,ln0=poles[0].lng,laN=la0,laX=la0,lnN=ln0,lnX=ln0;
        poles.forEach(function(p){ if(p.lat<laN)laN=p.lat; if(p.lat>laX)laX=p.lat; if(p.lng<lnN)lnN=p.lng; if(p.lng>lnX)lnX=p.lng; });
        m.fitBounds([[laN,lnN],[laX,lnX]],{padding:[40,40],maxZoom:18,animate:false});
      }
    }catch(e){}
    status("Altlık çizildi: "+poles.length+" direk, "+lines.length+" hat (hafif).");
  }

  /* Canvas tabanlı hafif katman (obje yok) */
  function aybMakeAltlikLayer(poles, lines){
    var THRESH=17;
    var Lyr=L.Layer.extend({
      onAdd:function(map){
        this._map=map;
        var c=this._canvas=L.DomUtil.create("canvas","ayb-altlik-canvas");
        c.style.position="absolute"; c.style.pointerEvents="none"; c.style.zIndex=200;
        map.getPanes().overlayPane.appendChild(c);
        map.on("moveend",this._redraw,this);
        map.on("zoomstart",this._hide,this);
        map.on("zoomend",this._redraw,this);
        map.on("resize",this._redraw,this);
        this._redraw();
        return this;
      },
      onRemove:function(map){
        map.off("moveend",this._redraw,this); map.off("zoomstart",this._hide,this);
        map.off("zoomend",this._redraw,this); map.off("resize",this._redraw,this);
        if(this._canvas&&this._canvas.parentNode) this._canvas.parentNode.removeChild(this._canvas);
      },
      _hide:function(){ if(this._canvas) this._canvas.style.visibility="hidden"; },
      _redraw:function(){
        var map=this._map; if(!map) return;
        var c=this._canvas, size=map.getSize();
        var tl=map.containerPointToLayerPoint([0,0]);
        L.DomUtil.setPosition(c, tl);
        if(c.width!==size.x) c.width=size.x;
        if(c.height!==size.y) c.height=size.y;
        c.style.visibility="visible";
        var ctx=c.getContext("2d"); ctx.clearRect(0,0,size.x,size.y);
        var z=map.getZoom(), showLbl=(z>=THRESH);
        /* hatlar */
        for(var i=0;i<lines.length;i++){
          var ln=lines[i]; ctx.beginPath();
          for(var j=0;j<ln.pts.length;j++){ var q=map.latLngToContainerPoint(ln.pts[j]); if(j===0) ctx.moveTo(q.x,q.y); else ctx.lineTo(q.x,q.y); }
          ctx.strokeStyle=ln.ayd?"#06b6d4":"#1aa260"; ctx.lineWidth=2.5; ctx.stroke();
          if(showLbl && ln.kesit){ var mid=map.latLngToContainerPoint(ln.pts[(ln.pts.length/2)|0]);
            ctx.font="11px sans-serif"; ctx.fillStyle="#e0f2fe"; ctx.strokeStyle="#0f172a"; ctx.lineWidth=3; ctx.textAlign="center";
            ctx.strokeText(ln.kesit, mid.x, mid.y-3); ctx.fillText(ln.kesit, mid.x, mid.y-3); }
        }
        /* direkler + lamba + etiket */
        ctx.textAlign="left";
        for(var k=0;k<poles.length;k++){
          var po=poles[k], pt=map.latLngToContainerPoint([po.lat,po.lng]);
          if(pt.x<-60||pt.y<-60||pt.x>size.x+60||pt.y>size.y+60) continue; /* görünmeyeni atla */
          ctx.beginPath(); ctx.arc(pt.x,pt.y,4,0,Math.PI*2); ctx.fillStyle="#111827"; ctx.fill();
          ctx.lineWidth=1.6; ctx.strokeStyle=po.ayd?"#06b6d4":"#f59e0b"; ctx.stroke();
          if(po.watt){ ctx.beginPath(); ctx.arc(pt.x,pt.y-10,3,0,Math.PI*2); ctx.fillStyle="#fde047"; ctx.fill(); ctx.lineWidth=1; ctx.strokeStyle="#a16207"; ctx.stroke(); }
          if(showLbl){
            ctx.font="bold 11px sans-serif";
            if(po.watt){ ctx.fillStyle="#facc15"; ctx.strokeStyle="#0f172a"; ctx.lineWidth=3; ctx.strokeText(po.watt+"W", pt.x+7, pt.y-8); ctx.fillText(po.watt+"W", pt.x+7, pt.y-8); }
            var t=(po.no?po.no+" ":"")+(po.tip||"");
            if(t.trim()){ ctx.fillStyle="#ffffff"; ctx.strokeStyle="#0f172a"; ctx.lineWidth=3; ctx.strokeText(t, pt.x+7, pt.y+5); ctx.fillText(t, pt.x+7, pt.y+5); }
          }
        }
      }
    });
    return new Lyr();
  }

  function classifyInto(map, name, txt){
    var low=(name||"").toLowerCase();
    var looksMif = /\.mif$/.test(low) || /(^|\n)\s*Columns\s+\d+/i.test(txt) || /(^|\n)\s*Version\s+\d+/i.test(txt) || /(^|\n)\s*Data\b/i.test(txt);
    var looksMid = /\.mid$/.test(low) || (!looksMif && /^\s*"/.test(txt));
    if(/hatlar/.test(low)){ if(looksMid) map.hmid=txt; else map.hmif=txt; return; }
    if(/(direktrafolar|trafolar|trafo)/.test(low)){ if(looksMid) map.tmid=txt; else map.tmif=txt; return; }
    if(/direkler/.test(low)){ if(looksMid) map.mid=txt; else map.mif=txt; return; }
    if(/kofre/.test(low)){ if(looksMid) map.kfmid=txt; else map.kfmif=txt; return; }
    if(/box/.test(low)){ if(looksMid) map.bxmid=txt; else map.bxmif=txt; return; }
    if(/abone/.test(low)){ if(looksMid) map.abmid=txt; else map.abmif=txt; return; }
    if(/muf/.test(low)){ if(looksMid) map.emmid=txt; else map.emmif=txt; return; }
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
      names.forEach(function(name){
        if(/aybproje\.json$/i.test(name)){ try{ map.pjson=new TextDecoder().decode(files2[name]); }catch(e){} return; }
        if(/aybnotes\.json$/i.test(name)){ try{ window.__aybPendingNotes=JSON.parse(new TextDecoder().decode(files2[name])); }catch(e){} return; }
        if(/aybekip\.json$/i.test(name)){ try{ var _ek=JSON.parse(new TextDecoder().decode(files2[name])); window.__aybImportEkip=(_ek&&_ek.ekip)||window.__aybImportEkip; window.__aybImportGun=(_ek&&_ek.gun)||window.__aybImportGun; }catch(e){} return; }
        classifyInto(map, name, decodeText(files2[name]));
      });
    } else {
      /* ZIP değil: seçilen .mif/.mid dosyaları */
      bufs.forEach(function(b){
        var _nm=(b.name||'').toLowerCase();
        if(/\.json$/.test(_nm)){
          try{
            var _txt=new TextDecoder().decode(new Uint8Array(b.buf));
            if(/aybnotes/.test(_nm)){ window.__aybPendingNotes=JSON.parse(_txt); }
            else if(/aybekip/.test(_nm)){ var _ek=JSON.parse(_txt); window.__aybImportEkip=(_ek&&_ek.ekip)||window.__aybImportEkip; window.__aybImportGun=(_ek&&_ek.gun)||window.__aybImportGun; }
            else { map.pjson=_txt; }
          }catch(e){}
          return;
        }
        classifyInto(map, b.name, decodeText(new Uint8Array(b.buf)));
      });
    }
    finishMap(map, projName);
    if(window.__aybPendingNotes && window.__aybPCMerge && window.aybMergeNotes){
      try{ window.aybMergeNotes(window.__aybPendingNotes); window.__aybPendingNotes=null; }catch(e){}
    }
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
      "#aybTakipPanel{position:fixed;bottom:56px;right:8px;z-index:1291;width:290px;max-width:92vw;background:#fff;"+
        "border:1px solid #0f766e;border-radius:14px;box-shadow:0 12px 32px rgba(15,23,42,.28);padding:14px 14px 12px;"+
        "font-family:inherit;color:#0f172a;display:none;max-height:74vh;overflow:auto;}"+
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
    var b=d.getElementById("aybTakipBtn");
    if(b) b.textContent = (panel && panel.classList.contains("show")) ? "📋 Kapat" : "📋 Takip";
  }
  function togglePanel(){
    buildPanel();
    if(panel.classList.contains("show")){ panel.classList.remove("show"); }
    else { refresh(); panel.classList.add("show"); }
    syncToggle();
  }
  function openPanel(){ buildPanel(); refresh(); panel.classList.add("show"); syncToggle(); }
  function makeToggle(){
    /* Alt çubuğa "📋 Takip" düğmesi (üst menüleri kapatmaz) */
    if(!d.getElementById("aybTakipBtn") && typeof window.aybBottomBar==="function"){
      var b=d.createElement("button"); b.id="aybTakipBtn"; b.type="button";
      b.className="ayb-barbtn"; b.textContent="📋 Takip";
      b.onclick=function(ev){ try{ev.preventDefault();ev.stopPropagation();}catch(e){} togglePanel(); };
      window.aybBottomBar().appendChild(b);
    }
    /* "Saha Veri" menüsünden de açılsın (takip saha veri içinde) */
    if(!window.__aybTakipSahaVeriBound){
      window.__aybTakipSahaVeriBound=true;
      d.addEventListener("click", function(ev){
        var t=ev.target;
        while(t && t!==d){ if(t.id==="btnFieldDataToggle"){ setTimeout(openPanel, 60); return; } t=t.parentNode; }
      }, false);
    }
  }

  function setup(){ /* TAKİP KALDIRILDI: artık düğme/panel/saha-veri kancası oluşturulmuyor */ }
  /* eski takip localStorage'ı Günün Özeti'ne bırakıldı; burada hiçbir UI kurulmuyor */
  window.aybTakipRefresh=function(){};
})();


/* ===================================================================== */
/* KÖRFEZİM — SÜRÜM DAMGASI (yeni build aktif mi anında görünür)          */
/* ===================================================================== */
(function(){
  "use strict";
  var d=document;
  var SURUM="v111";
  var TARIH="16.07.2026";
  window.AYB_SURUM=SURUM;
  function make(){
    return; /* görünür rozet kaldırıldı; sürüm artık başlıkta "Körfezim Saha Metraj v16" */
    if(d.getElementById("aybSurumBadge")) return;
    var b=d.createElement("div");
    b.id="aybSurumBadge";
    b.textContent="KÖRFEZİM "+SURUM;
    b.style.cssText="position:fixed;right:8px;top:132px;z-index:3000;background:rgba(15,118,110,.95);color:#fff;"+
      "padding:5px 10px;border-radius:8px;font-family:inherit;font-size:12px;font-weight:800;letter-spacing:.3px;"+
      "box-shadow:0 3px 10px rgba(0,0,0,.3);cursor:pointer;";
    b.onclick=function(){
      var mesaj="Körfezim Saha "+SURUM+" ("+TARIH+")\n\nBu sürümde olması gerekenler:\n"+
        "• Metraj → Excel (.xlsx), trafo bazlı + genel lamba özeti\n"+
        "• GPS konum → sağ üst 📍 ile gizle/göster\n"+
        "• MİF İç → ZIP seçince proje gibi çizili gelir (direk+hat+lamba)\n"+
        "• 📋 Takip → günlük plan (50), bugün/genel takılan lamba\n"+
        "• KMZ → direkler siyah daire, lambalar sarı yıldız, yer altı hat dahil\n"+"• Konum ve Takip SAĞ kenarda (üst menü ve alt imzayı kapatmaz)\n"+"• Üst araç satırı (Google Uydu vb.) YATAY kayar\n"+"• MİF: aydınlatma (AYD) hatları AG değil, camgöbeği gösterilir\n"+"• MİF hat kesiti artık TEK yazılır (çiftlenme düzeltildi)\n"+"• MİF yüklerken 'çiziliyor' perdesi + tek çizim (daha az donma)\n"+"• Etiketler zoom'a göre: UZAKTA gizli, YAKINDA görünür (tablet rahat)\n"+"• MİF alırken 'Altlık (hafif)' / 'Çizim (düzenlenebilir)' seçimi\n"+"• Altlık: canvas ile hafif çizim, direk tipi + lamba, DONMAZ\n"+"• KMZ artık DOĞRU çalışır: yer altı hat + lamba + doğru ölçek/etiket\n"+"• KMZ: direk sembol 0.7, trafo 1.0, etiket=direk tipi + lamba\n"+"• MİF Dışa Aktar: tüm katmanlar .mif/.mid, tek ZIP (birebir şema)\n"+"• Metraj artık gerçek EXCEL (.xlsx), detaylı — CSV değil\n"+"• Günün Özeti (Rapor/Veri): bugün takılan lamba OTOMATİK\n"+"• GPS bilgisi sağ-alt köşede küçük; Takip ve Saha Veri kaldırıldı\n"+"• Offline hız: karo yükü azaltıldı (6→2), boş karo anında geçilir\n"+"• İnternet yokken çizim/altlık/GPS hızlı; Uydu Kapat en hızlısı\n\n"+
        "Bu yazıyı görüyorsan YENİ sürüm kuruldu demektir.";
      (window.aybModal||alert)(mesaj,"Sürüm Bilgisi");
    };
    d.body.appendChild(b);
  }
  if(d.readyState==="loading") d.addEventListener("DOMContentLoaded",function(){ setTimeout(make,800); });
  setTimeout(make,800);
  setTimeout(make,2000);
})();


/* ===================================================================== */
/* KÖRFEZİM — ZOOM'A GÖRE ETİKET AÇ/KAPAT (uzakken kapalı = tablet rahat) */
/* ===================================================================== */
(function(){
  "use strict";
  var d=document;
  var THRESH=17;   /* bu zoom'un ALTINDA yazılar gizli, ÜSTÜNDE görünür */

  function injectCss(){
    if(d.getElementById("ayb_label_zoom_css")) return;
    var st=d.createElement("style"); st.id="ayb_label_zoom_css";
    /* Uzaktayken SADECE metin etiketleri gizlenir; direk/lamba/hat şekilleri görünür kalır */
    st.textContent=
      "body.ayb-labels-off .symbol .sym-label,"+
      "body.ayb-labels-off .sym-label,"+
      "body.ayb-labels-off .sym-label-trafo,"+
      "body.ayb-labels-off .ayb-line-label,"+
      "body.ayb-labels-off .ayb-lamp-watt{display:none!important;}";
    d.head.appendChild(st);
  }
  function theMap(){ return window.__aybMap||window.map; }
  function apply(){
    var m=theMap(); if(!m||!m.getZoom) return;
    var z=0; try{ z=m.getZoom(); }catch(e){ return; }
    if(z<THRESH) d.body.classList.add("ayb-labels-off");
    else d.body.classList.remove("ayb-labels-off");
  }
  function bind(){
    var m=theMap();
    if(!m||!m.on){ return; }
    if(m.__aybLblZoomBound) { apply(); return; }
    m.__aybLblZoomBound=true;
    m.on("zoomend", apply);
    m.on("zoomstart", function(){ /* zoom sırasında da hafiflet */ });
    apply();
  }
  injectCss();
  bind();
  setTimeout(bind, 900);
  setTimeout(bind, 2200);
  setTimeout(bind, 4000);
  window.aybApplyLabelZoom=apply;
})();


/* ===================================================================== */
/* KÖRFEZİM — OFFLINE HIZ: karo yükünü azalt, başarısız karoyu boş geç    */
/* ===================================================================== */
(function(){
  "use strict";
  /* 1x1 saydam GIF: internet yokken karo takılmadan boş görünsün (gri/broken ikon yok) */
  var BLANK="data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7";

  function patchTile(l){
    if(!l||!l.options) return;
    try{
      l.options.keepBuffer=2;              /* 6 -> 2 : görüntü başına çok daha az karo isteği */
      l.options.updateWhenIdle=true;
      l.options.updateWhenZooming=false;
      if(!l._aybBlank){ l.options.errorTileUrl=BLANK; l._aybBlank=true; }
    }catch(e){}
  }
  function tune(){
    var m=window.__aybMap||window.map;
    if(!m||!m.eachLayer||typeof L==="undefined") return false;
    m.eachLayer(function(l){ if(l instanceof L.TileLayer) patchTile(l); });
    if(!m.__aybTileHook){
      m.__aybTileHook=true;
      m.on("layeradd", function(e){ if(e.layer instanceof L.TileLayer){ patchTile(e.layer); } });
    }
    return true;
  }
  var tr=0; (function loop(){ if(tune()||tr++>25) return; setTimeout(loop,600); })();

  /* İnternet yok uyarısı (kısa süre görünür) */
  function note(){
    if(navigator.onLine) return;
    var el=document.getElementById("aybNetNote");
    if(!el){
      el=document.createElement("div"); el.id="aybNetNote";
      el.style.cssText="position:fixed;left:50%;top:8px;transform:translateX(-50%);z-index:2600;background:#b45309;"+
        "color:#fff;padding:6px 12px;border-radius:14px;font-family:inherit;font-size:12px;font-weight:700;"+
        "box-shadow:0 3px 10px rgba(0,0,0,.3);max-width:92vw;text-align:center;";
      document.body.appendChild(el);
    }
    el.textContent="İnternet yok — uydu sınırlı. Çizim/Altlık/GPS hızlı çalışır. (Uydu Kapat = daha da hızlı)";
    el.style.display="block";
    clearTimeout(el._t); el._t=setTimeout(function(){ if(el) el.style.display="none"; }, 7000);
  }
  window.addEventListener("offline", note);
  window.addEventListener("online", function(){ var el=document.getElementById("aybNetNote"); if(el) el.style.display="none"; });
  setTimeout(note, 1800);
})();


/* ===================================================================== */
/* KÖRFEZİM — GÜNÜN ÖZETİ (Rapor/Veri altında; bugün takılan lamba OTO)   */
/* ===================================================================== */
(function(){
  "use strict";
  var d=document;
  var LSK="aybGun_";
  function proj(){ return window.project; }
  function pid(){ var p=proj(); return (p&&p.id)?String(p.id):"default"; }
  function pname(){ var p=proj(); return (p&&p.name)?String(p.name):"Proje"; }
  function today(){ var t=new Date(); return t.getFullYear()+"-"+("0"+(t.getMonth()+1)).slice(-2)+"-"+("0"+t.getDate()).slice(-2); }
  function norm(s){ try{ return String(s==null?"":s).toLocaleUpperCase("tr").trim(); }catch(e){ return String(s==null?"":s).toUpperCase().trim(); } }

  /* Lamba "yeni mi"? MEVCUT ise HAYIR; YENİ/DM/DM+MON ise EVET */
  function isNewLamp(l, pole){
    var s=norm(l&&(l.durum||l.status));
    if(!s) s="YENİ";
    return s.indexOf("MEVCUT")<0;
  }
  function poleNewCount(o){
    if(o.type!=="direk"||!o.props||!Array.isArray(o.props.lambalar)) return 0;
    var t=0; o.props.lambalar.forEach(function(l){ if(isNewLamp(l,o)){ var a=parseInt(l&&l.adet,10); t+=(isFinite(a)&&a>0)?a:1; } });
    return t;
  }
  function load(){ try{ var s=localStorage.getItem(LSK+pid()); if(s){ var o=JSON.parse(s); o.base=o.base||{}; o.days=o.days||{}; return o; } }catch(e){} return {base:{},days:{},init:false}; }
  function save(st){ try{ localStorage.setItem(LSK+pid(), JSON.stringify(st)); }catch(e){} }

  function lampWatt(l){ var w=l&&(l.guc||l.watt||l.w||l.güc); w=(w==null||w==="")?"":String(w).replace(/[^0-9.]/g,""); return w?(w+"W"):"?W"; }
  function lampCins(l){ var c=l&&(l.cins||l.armatur_cinsi||l.armatur||l.tip); c=(c==null)?"":String(c).trim(); return c||"Armatür"; }
  function matKey(l){ return lampCins(l)+" || "+lampWatt(l); }
  /* bir direğin YENİ lambalarını malzeme (cins||güç) bazında say: {key: adet} */
  function poleNewMats(o){ var m={}; if(o.type==="direk"&&o.props&&Array.isArray(o.props.lambalar)){ o.props.lambalar.forEach(function(l){ if(isNewLamp(l,o)){ var a=parseInt(l&&l.adet,10); a=(isFinite(a)&&a>0)?a:1; var k=matKey(l); m[k]=(m[k]||0)+a; } }); } if(o.type==="direk"&&o.props&&Array.isArray(o.props.otomatlar)){ o.props.otomatlar.forEach(function(x){ var tip=(x&&x.tip!=null)?String(x.tip).trim():""; if(!tip)return; var a=parseInt(x&&x.adet,10); a=(isFinite(a)&&a>0)?a:1; var k=("Otomat "+tip)+" || "; m[k]=(m[k]||0)+a; }); } return m; }
  function poleOtoCount(o){ var t=0; if(o.type==="direk"&&o.props&&Array.isArray(o.props.otomatlar)){ o.props.otomatlar.forEach(function(x){ var tip=(x&&x.tip!=null)?String(x.tip).trim():""; if(!tip)return; var a=parseInt(x&&x.adet,10); t+=(isFinite(a)&&a>0)?a:1; }); } return t; }
  function projectNewMats(){ var p=proj(), m={}; if(p&&p.objects) p.objects.forEach(function(o){ if(o.type!=="direk")return; var pm=poleNewMats(o); Object.keys(pm).forEach(function(k){ m[k]=(m[k]||0)+pm[k]; }); }); return m; }
  function splitKey(k){ var i=String(k).indexOf(" || "); return { cins:(i>=0?k.slice(0,i):k), guc:(i>=0?k.slice(i+4):"") }; }
  function poleNewWatts(o){ var m={}; if(o.type==="direk"&&o.props&&Array.isArray(o.props.lambalar)){ o.props.lambalar.forEach(function(l){ if(isNewLamp(l,o)){ var a=parseInt(l&&l.adet,10); a=(isFinite(a)&&a>0)?a:1; var w=lampWatt(l); m[w]=(m[w]||0)+a; } }); } return m; }
  function projectNewByWatt(){ var p=proj(), m={}; if(p&&p.objects) p.objects.forEach(function(o){ if(o.type!=="direk")return; var pm=poleNewWatts(o); Object.keys(pm).forEach(function(w){ m[w]=(m[w]||0)+pm[w]; }); }); return m; }
  function ekipAdi(){ try{ return (localStorage.getItem("ayb_ekip_adi")||"").trim()||"(ekip adı yok)"; }catch(e){ return "(ekip)"; } }

  /* Otomatik takip: lamba ekledikçe bugüne yazılır (adet + W kırılımı) */
  function track(){
    var p=proj(); if(!p||!p.objects) return;
    var st=load(), cur={}, curW={}, curM={};
    p.objects.forEach(function(o){ if(o.type==="direk"){ var c=poleNewCount(o); var oc=poleOtoCount(o); if(c>0||oc>0){ cur[o.id]=c; curW[o.id]=poleNewWatts(o); curM[o.id]=poleNewMats(o); } } });
    st.baseW=st.baseW||{}; st.daysW=st.daysW||{}; st.baseM=st.baseM||{}; st.daysM=st.daysM||{};
    if(!st.init){ st.base=cur; st.baseW=curW; st.baseM=curM; st.days=st.days||{}; st.init=true; save(st); return; }
    var t=today();
    Object.keys(cur).forEach(function(id){
      var prev=st.base[id]||0;
      if(cur[id]>prev){ st.days[t]=(st.days[t]||0)+(cur[id]-prev); }
      var pW=st.baseW[id]||{}, cW=curW[id]||{};
      Object.keys(cW).forEach(function(w){ var dd=(cW[w]||0)-(pW[w]||0); if(dd>0){ st.daysW[t]=st.daysW[t]||{}; st.daysW[t][w]=(st.daysW[t][w]||0)+dd; } });
      var pM=st.baseM[id]||{}, cM=curM[id]||{};
      Object.keys(cM).forEach(function(k){ var dd2=(cM[k]||0)-(pM[k]||0); if(dd2>0){ st.daysM[t]=st.daysM[t]||{}; st.daysM[t][k]=(st.daysM[t][k]||0)+dd2; } });
      st.base[id]=cur[id]; st.baseW[id]=cW; st.baseM[id]=cM;
    });
    Object.keys(st.base).forEach(function(id){ if(!(id in cur)){ st.base[id]=0; st.baseW[id]={}; st.baseM[id]={}; } });
    save(st);
  }
  function stats(){
    var p=proj(), st=load(), direk=0, yeni=0, mevcut=0;
    if(p&&p.objects) p.objects.forEach(function(o){ if(o.type!=="direk")return; direk++;
      if(o.props&&Array.isArray(o.props.lambalar)) o.props.lambalar.forEach(function(l){ var a=parseInt(l&&l.adet,10); a=(isFinite(a)&&a>0)?a:1; if(isNewLamp(l,o)) yeni+=a; else mevcut+=a; });
    });
    var genel=0; Object.keys(st.days||{}).forEach(function(k){ genel+=(+st.days[k]||0); });
    return { direk:direk, yeni:yeni, mevcut:mevcut, bugun:(+(st.days[today()]||0)), genel:genel };
  }

  function panelEl(){
    var el=d.getElementById("aybGunPanel");
    if(el) return el;
    el=d.createElement("div"); el.id="aybGunPanel";
    el.style.cssText="position:fixed;inset:0;z-index:6100;background:rgba(15,23,42,.5);display:none;"+
      "align-items:center;justify-content:center;padding:20px;font-family:inherit;";
    el.innerHTML=
      '<div style="background:#fff;border-radius:16px;max-width:360px;width:100%;padding:18px;box-shadow:0 18px 50px rgba(0,0,0,.4);">'+
        '<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:10px;">'+
          '<div style="font-size:17px;font-weight:800;color:#0f766e;">📅 Günün Özeti</div>'+
          '<div id="aybGunClose" style="cursor:pointer;font-size:20px;color:#64748b;font-weight:800;">✕</div></div>'+
        '<div id="aybGunProj" style="font-size:12px;color:#64748b;margin-bottom:12px;"></div>'+
        '<div style="background:#ecfdf5;border:1px solid #10b981;border-radius:12px;padding:12px;text-align:center;margin-bottom:10px;">'+
          '<div style="font-size:13px;color:#065f46;font-weight:600;">Bugün Takılan Lamba</div>'+
          '<div id="aybGunBugun" style="font-size:34px;font-weight:800;color:#059669;line-height:1.1;">0</div>'+
          '<div id="aybGunTarih" style="font-size:11px;color:#065f46;"></div></div>'+
        '<div class="ayb-gun-row"><span>Genel Takılan (tüm günler)</span><b id="aybGunGenel">0</b></div>'+
        '<div class="ayb-gun-row"><span>Projede Yeni Lamba</span><b id="aybGunYeni">0</b></div>'+
        '<div class="ayb-gun-row"><span>Projede Mevcut Lamba</span><b id="aybGunMevcut">0</b></div>'+
        '<div class="ayb-gun-row"><span>Toplam Direk</span><b id="aybGunDirek">0</b></div>'+
        '<div style="display:flex;gap:8px;margin-top:14px;">'+
          '<button id="aybGunExcel" style="flex:1;border:none;border-radius:10px;background:#16a34a;color:#fff;padding:11px;font-size:14px;font-weight:700;cursor:pointer;font-family:inherit;">Excel İndir</button>'+
          '<button id="aybGunKapat" style="flex:1;border:1px solid #cbd5e1;border-radius:10px;background:#fff;color:#475569;padding:11px;font-size:14px;font-weight:700;cursor:pointer;font-family:inherit;">Kapat</button></div>'+
      '</div>';
    d.body.appendChild(el);
    if(!d.getElementById("aybGunCss")){ var st=d.createElement("style"); st.id="aybGunCss";
      st.textContent="#aybGunPanel .ayb-gun-row{display:flex;justify-content:space-between;align-items:center;padding:6px 0;font-size:14px;color:#0f172a;border-bottom:1px solid #f1f5f9;}#aybGunPanel .ayb-gun-row b{font-size:16px;}";
      d.head.appendChild(st);
    }
    d.getElementById("aybGunClose").onclick=hide;
    d.getElementById("aybGunKapat").onclick=hide;
    d.getElementById("aybGunExcel").onclick=excel;
    return el;
  }
  function fill(){
    track();
    var s=stats();
    d.getElementById("aybGunProj").textContent=pname();
    d.getElementById("aybGunBugun").textContent=s.bugun;
    d.getElementById("aybGunTarih").textContent=today();
    d.getElementById("aybGunGenel").textContent=s.genel;
    d.getElementById("aybGunYeni").textContent=s.yeni;
    d.getElementById("aybGunMevcut").textContent=s.mevcut;
    d.getElementById("aybGunDirek").textContent=s.direk;
  }
  function show(){ panelEl(); fill(); d.getElementById("aybGunPanel").style.display="flex"; }
  function hide(){ var el=d.getElementById("aybGunPanel"); if(el) el.style.display="none"; }
  function excel(){
    try{
      if(typeof window.aybBuildXlsx!=="function"){ (window.aybModal||alert)("Excel üretici hazır değil."); return; }
      track();
      var st=load(), s=stats();
      var days=st.days||{}, daysM=st.daysM||{};
      var ekip=ekipAdi(), tgun=today();
      function matRows(mObj){
        var keys=Object.keys(mObj||{}).sort(function(a,b){ var A=splitKey(a),B=splitKey(b); if(A.cins!==B.cins) return A.cins<B.cins?-1:1; return (parseFloat(A.guc)||0)-(parseFloat(B.guc)||0); });
        var rows=[], tot=0; keys.forEach(function(k){ var sp=splitKey(k); var c=mObj[k]||0; tot+=c; rows.push([sp.cins, sp.guc, c]); });
        return {rows:rows, total:tot};
      }
      /* SAYFA 1: GENEL + MALZEME TOPLAM */
      var projM=projectNewMats();
      var s1=[["KÖRFEZİM — GÜNÜN ÖZETİ / GENEL","",""],
        ["Proje",pname(),""],["Ekip",ekip,""],["Rapor Tarihi",tgun,""],["",""],
        ["Bugün Takılan Lamba (toplam)",s.bugun,""],
        ["Genel Takılan (tüm günler)",s.genel,""],
        ["Projede Takılan/Yeni Lamba",s.yeni,""],
        ["Projede Mevcut Lamba",s.mevcut,""],
        ["Toplam Direk",s.direk,""],["",""],
        ["GENEL TOPLAM — TAKILAN LAMBA (MALZEME)","",""],
        ["Malzeme Cinsi","Güç (W)","Miktar (Adet)"]];
      var pm=matRows(projM);
      pm.rows.forEach(function(r){ s1.push(r); });
      if(pm.rows.length===0) s1.push(["(Takılan lamba kaydı yok)","",""]);
      s1.push(["TOPLAM","",pm.total]);
      /* SAYFA 2: BUGÜN (malzeme) */
      var bM=daysM[tgun]||{};
      var s2=[["BUGÜN TAKILAN LAMBA (MALZEME)","",""],["Tarih",tgun,""],["Ekip",ekip,""],["",""],
        ["Malzeme Cinsi","Güç (W)","Miktar (Adet)"]];
      var bm=matRows(bM);
      bm.rows.forEach(function(r){ s2.push(r); });
      if(bm.rows.length===0) s2.push(["(Bugün henüz kayıt yok)","",""]);
      s2.push(["TOPLAM","",bm.total]);
      /* SAYFA 3: TARİH TARİH (malzeme, uzun form) */
      var allDates=Object.keys(days); Object.keys(daysM).forEach(function(dk){ if(allDates.indexOf(dk)<0) allDates.push(dk); }); allDates.sort();
      var s3=[["TARİH TARİH TAKILAN LAMBA (MALZEME)","","",""],["Tarih","Malzeme Cinsi","Güç (W)","Miktar (Adet)"]];
      var grand=0;
      allDates.forEach(function(dt){
        var dm=daysM[dt]||{}; var dr=matRows(dm);
        if(dr.rows.length){ dr.rows.forEach(function(r){ s3.push([dt, r[0], r[1], r[2]]); }); s3.push([dt+" — GÜN TOPLAM","","",dr.total]); grand+=dr.total; }
        else { var dt2=(+days[dt]||0); s3.push([dt,"(malzeme dağılımı yok)","",dt2]); grand+=dt2; }
      });
      if(allDates.length===0) s3.push(["(Kayıt yok)","","",""]);
      s3.push(["GENEL TOPLAM","","",grand]);
      /* SAYFA 4: EKİP PERFORMANS */
      var calisan=allDates.filter(function(dt){ return (+days[dt]||0)>0 || Object.keys(daysM[dt]||{}).length; });
      var gunSay=calisan.length;
      var ortalama=gunSay?Math.round((grand/gunSay)*10)/10:0;
      var enIyi={dt:"-",n:0}; calisan.forEach(function(dt){ var dm=daysM[dt]||{}; var tot=0; Object.keys(dm).forEach(function(k){tot+=dm[k];}); if(tot===0) tot=(+days[dt]||0); if(tot>enIyi.n) enIyi={dt:dt,n:tot}; });
      var s4=[["EKİP PERFORMANS"],["Ekip",ekip],["Proje",pname()],["",""],
        ["Toplam Takılan Lamba",grand],["Çalışılan Gün Sayısı",gunSay],["Günlük Ortalama (lamba/gün)",ortalama],["En Verimli Gün",enIyi.dt+" ("+enIyi.n+" adet)"],["",""],
        ["Gün","Takılan Lamba"]];
      calisan.forEach(function(dt){ var dm=daysM[dt]||{}; var tot=0; Object.keys(dm).forEach(function(k){tot+=dm[k];}); if(tot===0) tot=(+days[dt]||0); s4.push([dt,tot]); });
      if(gunSay===0) s4.push(["(Kayıt yok)",""]);

      var blob=window.aybBuildXlsx([
        {name:"Genel_Ozet", rows:s1},
        {name:"Bugun_Malzeme", rows:s2},
        {name:"Tarih_Tarih", rows:s3},
        {name:"Ekip_Performans", rows:s4}
      ]);
      var nm=(typeof window.aybFileTag==="function")? (window.aybFileTag()+"_gunun_ozeti.xlsx") : (pname()+"_gunun_ozeti.xlsx");
      var mime="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet";
      if(window.aybShareFile) window.aybShareFile(nm, blob, mime);
      else if(typeof aybDownloadFile==="function") aybDownloadFile(nm, blob, mime);
      try{ if(window.toast) toast("Günün Özeti Excel hazır."); }catch(e){}
    }catch(e){ (window.aybModal||alert)("Hata: "+(e&&e.message?e.message:e)); }
  }

  /* Rapor/Veri satırına "Günün Özeti" düğmesi ekle */
  function injectBtn(){
    if(d.getElementById("btnGunOzeti")) return true;
    var row=d.querySelector(".ayb-pro-group.report .ayb-pro-row");
    if(!row) return false;
    var b=d.createElement("button");
    b.id="btnGunOzeti"; b.className="ayb-pro-btn toolbtn"; b.type="button"; b.title="Günün Özeti — bugün takılan lamba";
    b.innerHTML='<div class="ayb-pro-ico" style="color:#059669;">📅</div><small>Günün Özeti</small>';
    b.onclick=function(ev){ try{ev.preventDefault();ev.stopPropagation();}catch(e){} show(); };
    row.appendChild(b);
    return true;
  }
  var n=0, iv=setInterval(function(){ if(injectBtn()||++n>60) clearInterval(iv); }, 500);
  setTimeout(injectBtn, 1200);
  /* arka planda otomatik takip (lamba ekledikçe bugüne yazsın) */
  setInterval(function(){ try{ track(); }catch(e){} }, 20000);
  window.aybGunOzeti=show;
})();


/* ===================================================================== */
/* KÖRFEZİM — MİF DIŞA AKTAR (tüm katmanlar .mif/.mid, tek ZIP)           */
/* ===================================================================== */
(function(){
  "use strict";
  var d=document;
  var CM=33;
  var COORD='CoordSys Earth Projection 8, 33, "m", 33, 0, 1, 500000, 0 Bounds (-7749530.45909, -10002288.2992) (8749530.45909, 10002288.2992)';

  function tm(lat,lng){ var p=window.latLonToTm3(lat,lng,CM); return {e:p.easting, n:p.northing}; }
  function q(v){ return '"'+String(v==null?'':v).replace(/"/g,'""')+'"'; }
  /* WindowsTurkish (cp1254) baytları */
  function encWin(str){
    var map={'ğ':0xF0,'Ğ':0xD0,'ş':0xFE,'Ş':0xDE,'ı':0xFD,'İ':0xDD,'ç':0xE7,'Ç':0xC7,'ö':0xF6,'Ö':0xD6,'ü':0xFC,'Ü':0xDC};
    var out=[]; for(var i=0;i<str.length;i++){ var ch=str[i], c=str.charCodeAt(i);
      if(map[ch]!=null) out.push(map[ch]); else if(c<256) out.push(c); else out.push(63); }
    return new Uint8Array(out);
  }
  /* ZIP (store) — global aybU16/aybU32/aybCrc32/aybZipDateTime ile */
  function buildZip(files){
    var U16=window.aybU16, U32=window.aybU32, CRC=window.aybCrc32, DT=window.aybZipDateTime();
    var locals=[], centrals=[], offset=0;
    files.forEach(function(f){
      var nameB=encWin(f.name), data=f.bytes, c=CRC(data);
      var lh=[].concat(U32(0x04034b50),U16(20),U16(0),U16(0),U16(DT.time),U16(DT.date),U32(c),U32(data.length),U32(data.length),U16(nameB.length),U16(0));
      var head=new Uint8Array(lh);
      var chunk=new Uint8Array(head.length+nameB.length+data.length);
      chunk.set(head,0); chunk.set(nameB,head.length); chunk.set(data,head.length+nameB.length);
      locals.push(chunk);
      var ch=[].concat(U32(0x02014b50),U16(20),U16(20),U16(0),U16(0),U16(DT.time),U16(DT.date),U32(c),U32(data.length),U32(data.length),U16(nameB.length),U16(0),U16(0),U16(0),U16(0),U32(0),U32(offset));
      var chd=new Uint8Array(ch);
      var cc=new Uint8Array(chd.length+nameB.length); cc.set(chd,0); cc.set(nameB,chd.length);
      centrals.push(cc);
      offset+=chunk.length;
    });
    var cSize=centrals.reduce(function(a,c){return a+c.length;},0);
    var end=new Uint8Array([].concat(U32(0x06054b50),U16(0),U16(0),U16(files.length),U16(files.length),U32(cSize),U32(offset),U16(0)));
    return new Blob(locals.concat(centrals).concat([end]),{type:'application/zip'});
  }

  function header(cols){
    var s='Version 300\r\nCharset "WindowsTurkish"\r\nDelimiter ","\r\nIndex 1\r\n'+COORD+'\r\nColumns '+cols.length+'\r\n';
    cols.forEach(function(c){ s+='  '+c+'\r\n'; });
    s+='Data\r\n\r\n';
    return s;
  }

  var DIREK_COLS=['GenelTip Char(20)','AltCins Char(20)','TipAdi Char(20)','DirekNo Char(20)','Durumu Char(20)','MevcutDurum Integer','KorumaTopraklama Char(20)','IsletmeTopraklama Char(20)','Kafes Char(20)','Lente Char(20)','Durdurucu Char(20)','Potans Char(20)','Boy Integer','TopluYuk Integer','CosQ Decimal(5, 1)','Diversite Integer','LambaTipi1 Char(20)','LambaGucu1 Integer','LambaCount1 Integer','BagliTrafoNo Char(20)'];
  var HAT_COLS=['Tip Integer','GenelTip Char(20)','OGTip Char(20)','AGTip Char(20)','Konsumasyon Integer','J1 Char(20)','J2 Char(20)','J12 Char(20)','J Decimal(5, 1)','JGerilimDusumu Decimal(5, 1)','HatKullanimTipi Integer','OGDurum Char(20)','AGDurum Char(20)','MesafeDeger Integer','TrafoCikisTip Char(20)','TrafoCikisMesafe Decimal(5, 1)','Uzunluk Integer','Color Integer','Diversite Integer','AnaRing Char(20)','IsiYuku Decimal(5, 1)','MaxIsiYuku Decimal(5, 1)','IsletmeVoltaji Char(20)','AnmaVoltaji Char(20)','BaslangicX Decimal(5, 1)','BaslangicY Decimal(5, 1)','BitisX Decimal(5, 1)','BitisY Decimal(5, 1)','KolAdi Char(3)'];

  function buildDirekler(direks){
    var mif=header(DIREK_COLS), mid='';
    direks.forEach(function(o){
      var p=o.props||{}, t=tm(o.lat,o.lng);
      var lamp=(Array.isArray(p.lambalar)&&p.lambalar[0])?p.lambalar[0]:{};
      mif+='Point '+t.e.toFixed(2)+' '+t.n.toFixed(2)+'\r\n    Symbol(34,255,6)\r\n';
      var row=[ p.genel_tip||'AG', p.alt_tip||p.alt_cins||'', p.direk_tipi||'', p.direk_no||(window.getObjectNo?getObjectNo(o):''),
        p.durum||'MEVCUT', '0','False','False','False','False','False','False','0','0','0.8','100',
        (lamp.cins||lamp.armatur||''), (lamp.guc||'0'), (lamp.adet||'0'), (p.trafo_no||'') ];
      mid+=row.map(q).join(',')+'\r\n';
    });
    return {mif:mif, mid:mid};
  }

  /* İSTEK (Bayram YARAŞ): TRAFO KATMANI — sahadan MİF verirken Trafolar.mif/mid de çıkar.
     (İçeri alma tarafı bu dosya adını zaten tanıyordu; eksik olan dışa yazmaktı.) */
  var TRAFO_COLS=['TrafoNo Char(20)','TrafoGucu Char(20)','TrafoTuru Char(20)','Durumu Char(20)','TrafoTipi Char(30)'];
  function buildTrafolar(trafos){
    var mif=header(TRAFO_COLS), mid='';
    trafos.forEach(function(o){
      var p=o.props||{}, t=tm(o.lat,o.lng);
      mif+='Point '+t.e.toFixed(2)+' '+t.n.toFixed(2)+'\r\n    Symbol(35,255,8)\r\n';
      var row=[ p.trafo_no||(window.getObjectNo?getObjectNo(o):'')||'',
        String(p.trafo_guc||p.trafo_gucu||''), p.trafo_turu||'', p.durum||'MEVCUT',
        p.trafo_tipi||p.tipi||'' ];
      mid+=row.map(q).join(',')+'\r\n';
    });
    return {mif:mif, mid:mid};
  }

  /* İSTEK (Bayram YARAŞ): TABLETTE ÇİZİLEN HER OBJENİN MİF'İ OLUŞUR —
     Box, Kofre, Abone, EkMuf nokta katmanları + Kanallar çizgi katmanı. */
  function buildNokta(list, cols, rowFn, sym){
    var mif=header(cols), mid='';
    list.forEach(function(o){
      var t=tm(o.lat,o.lng);
      mif+='Point '+t.e.toFixed(2)+' '+t.n.toFixed(2)+'\r\n    Symbol('+(sym||'34,255,6')+')\r\n';
      mid+=rowFn(o).map(q).join(',')+'\r\n';
    });
    return {mif:mif, mid:mid};
  }
  var BOX_COLS=['BoxNo Char(20)','Tipi Char(30)','Durumu Char(20)'];
  var KOFRE_COLS=['KofreNo Char(20)','Tipi Char(30)','Durumu Char(20)'];
  var ABONE_COLS=['AboneNo Char(20)','Durumu Char(20)'];
  var EKMUF_COLS=['MufNo Char(20)','Durumu Char(20)'];
  var KANAL_COLS=['Uzunluk Integer','Durumu Char(20)'];
  function buildKanallar(chs){
    var mif=header(KANAL_COLS), mid='';
    chs.forEach(function(c2){
      if(!c2||!Array.isArray(c2.points)||c2.points.length<2) return;
      var tp=c2.points.map(function(pp){ return tm(pp[0],pp[1]); });
      mif+='Pline '+tp.length+'\r\n';
      tp.forEach(function(t){ mif+=t.e.toFixed(2)+' '+t.n.toFixed(2)+'\r\n'; });
      mif+='    Pen (1,2,0)\r\n';
      var uz=0; try{ uz=Math.round(c2.length_m || (typeof window.polyLength==='function'?window.polyLength(c2.points):0) || 0); }catch(e){}
      mid+=[String(uz), ((c2.props&&c2.props.durum)||'MEVCUT')].map(q).join(',')+'\r\n';
    });
    return {mif:mif, mid:mid};
  }

  function buildHatlar(lines, objs){
    var idMap={}; objs.forEach(function(o){ idMap[o.id]={lat:o.lat,lng:o.lng}; });
    var mif=header(HAT_COLS), mid='';
    lines.forEach(function(l){
      var pts=[];
      if(Array.isArray(l.points)&&l.points.length>=2) pts=l.points.map(function(p){return [p[0],p[1]];});
      else { var a=idMap[l.start], b=idMap[l.end]; if(a&&b) pts=[[a.lat,a.lng],[b.lat,b.lng]]; }
      if(pts.length<2) return;
      var tmpts=pts.map(function(pp){ return tm(pp[0],pp[1]); });
      mif+='Pline '+tmpts.length+'\r\n';
      tmpts.forEach(function(t){ mif+=t.e.toFixed(2)+' '+t.n.toFixed(2)+'\r\n'; });
      mif+='    Pen (1,2,0)\r\n';
      var p=l.props||{};
      var s0=tmpts[0], s1=tmpts[tmpts.length-1];
      var kesit=p.hat_tipi||p.ag_hat_tipi||'';
      var row=[ '1', (p.genel_tip||'AG'), (p.og_hat_tipi||''), kesit, '1','BOŞ','BOŞ','BOŞ','0','0','0',
        (p.durum||'MEVCUT'),(p.durum||'MEVCUT'),'0','','0', String(Math.round(l.length_m||0)),'0','100','False','0','0','0.4','0.4',
        s0.e.toFixed(2), s0.n.toFixed(2), s1.e.toFixed(2), s1.n.toFixed(2), 'D' ];
      mid+=row.map(q).join(',')+'\r\n';
    });
    return {mif:mif, mid:mid};
  }

  function doExport(){
    try{
      var p=window.project;
      if(!p||!p.objects){ (window.aybModal||alert)("Önce proje aç."); return; }
      var direks=(p.objects||[]).filter(function(o){return o.type==='direk';});
      var trafos=(p.objects||[]).filter(function(o){return o.type==='trafo';});
      var boxes =(p.objects||[]).filter(function(o){return o.type==='box';});
      var kofres=(p.objects||[]).filter(function(o){return o.type==='kofre';});
      var abones=(p.objects||[]).filter(function(o){return o.type==='abone';});
      var ekmufs=(p.objects||[]).filter(function(o){return o.type==='ekmuf';});
      var kanallar=(p.channels||[]);
      var lines=(p.lines||[]);
      if(!direks.length && !trafos.length && !boxes.length && !kofres.length && !abones.length && !ekmufs.length && !kanallar.length && !lines.length && !((p.aybNotes||[]).length)){ (window.aybModal||alert)("Dışa aktarılacak obje yok."); return; }
      var files=[];
      if(direks.length){ var dd=buildDirekler(direks); files.push({name:'Direkler.mif',bytes:encWin(dd.mif)}); files.push({name:'Direkler.mid',bytes:encWin(dd.mid)}); }
      if(trafos.length){ var tt=buildTrafolar(trafos); files.push({name:'Trafolar.mif',bytes:encWin(tt.mif)}); files.push({name:'Trafolar.mid',bytes:encWin(tt.mid)}); }
      if(lines.length){ var hh=buildHatlar(lines, p.objects); files.push({name:'Hatlar.mif',bytes:encWin(hh.mif)}); files.push({name:'Hatlar.mid',bytes:encWin(hh.mid)}); }
      if(boxes.length){ var bb=buildNokta(boxes, BOX_COLS, function(o){var pr=o.props||{}; return [pr.box_no||(window.getObjectNo?getObjectNo(o):'')||'', pr.tipi||pr.box_tipi||pr.tip||'', pr.durum||'MEVCUT'];}, '34,16711935,7'); files.push({name:'Boxlar.mif',bytes:encWin(bb.mif)}); files.push({name:'Boxlar.mid',bytes:encWin(bb.mid)}); }
      if(kofres.length){ var kk=buildNokta(kofres, KOFRE_COLS, function(o){var pr=o.props||{}; return [pr.kofre_no||(window.getObjectNo?getObjectNo(o):'')||'', pr.tipi||pr.kofre_tipi||pr.tip||'', pr.durum||'MEVCUT'];}, '34,65535,7'); files.push({name:'Kofreler.mif',bytes:encWin(kk.mif)}); files.push({name:'Kofreler.mid',bytes:encWin(kk.mid)}); }
      if(abones.length){ var aa=buildNokta(abones, ABONE_COLS, function(o){var pr=o.props||{}; return [pr.abone_no||(window.getObjectNo?getObjectNo(o):'')||'', pr.durum||'MEVCUT'];}, '34,32768,6'); files.push({name:'Aboneler.mif',bytes:encWin(aa.mif)}); files.push({name:'Aboneler.mid',bytes:encWin(aa.mid)}); }
      if(ekmufs.length){ var ee=buildNokta(ekmufs, EKMUF_COLS, function(o){var pr=o.props||{}; return [pr.ekmuf_no||pr.muf_no||(window.getObjectNo?getObjectNo(o):'')||'', pr.durum||'MEVCUT'];}, '34,8421504,6'); files.push({name:'EkMufler.mif',bytes:encWin(ee.mif)}); files.push({name:'EkMufler.mid',bytes:encWin(ee.mid)}); }
      if(kanallar.length){ var kn=buildKanallar(kanallar); files.push({name:'Kanallar.mif',bytes:encWin(kn.mif)}); files.push({name:'Kanallar.mid',bytes:encWin(kn.mid)}); }
      var _notes=(p.aybNotes||[]);
      if(_notes.length){ try{ files.push({name:'aybnotes.json', bytes:new TextEncoder().encode(JSON.stringify(_notes.map(function(n){return {id:n.id,lat:n.lat,lng:n.lng,text:n.text};})))}); }catch(e){} }
      try{ var _ekip=(localStorage.getItem('ayb_ekip_adi')||'').trim()||'(ekip adı yok)'; var _gn=new Date(); var _gs=_gn.getFullYear()+'-'+('0'+(_gn.getMonth()+1)).slice(-2)+'-'+('0'+_gn.getDate()).slice(-2); files.push({name:'aybekip.json', bytes:new TextEncoder().encode(JSON.stringify({ekip:_ekip, gun:_gs, proje:(p.name||'')}))}); }catch(e){}
      /* İSTEK (Bayram YARAŞ): TAM VERİ JSON — MİF'in taşıyamadığı her şeyi taşır
         (lamba detayları, izolatör/hırdavat, trafo türü, box/kofre, kanallar, notlar).
         PC'de içeri alma JSON'u görürse MİF yerine BUNU kullanır. */
      try{
        var _ekipAdi=(localStorage.getItem('ayb_ekip_adi')||'').trim()||'(ekip adı yok)';
        var _t=new Date(); var _gun=_t.getFullYear()+'-'+('0'+(_t.getMonth()+1)).slice(-2)+'-'+('0'+_t.getDate()).slice(-2);
        var fullJson={ formatVersion:1, kaynak:'AYB_SAHA', name:(p.name||''), ekip:_ekipAdi, gun:_gun,
          objects:(p.objects||[]), lines:(p.lines||[]), channels:(p.channels||[]),
          freeLines:(p.freeLines||[]), areas:(p.areas||[]), aybNotes:(p.aybNotes||[]) };
        files.push({name:'aybproje.json', bytes:new TextEncoder().encode(JSON.stringify(fullJson))});
      }catch(e){}
      var blob=buildZip(files);
      var nm=((window.aybFileTag?window.aybFileTag():(p.name||'Korfezim'))+'_MIF.zip');
      if(window.aybShareFile) window.aybShareFile(nm, blob, 'application/zip');
      else if(typeof aybDownloadFile==='function') aybDownloadFile(nm, blob, 'application/zip');
      (window.aybModal||function(){})("MİF dışa aktarıldı: "+direks.length+" direk, "+trafos.length+" trafo, "+lines.length+" hat, "+boxes.length+" box, "+kofres.length+" kofre, "+abones.length+" abone, "+ekmufs.length+" ekmüf, "+kanallar.length+" kanal.\nDosya: "+nm,"MİF Dış");
    }catch(e){ (window.aybModal||alert)("MİF dışa hata: "+(e&&e.message?e.message:e)); }
  }

  window.aybExportMif=doExport;
  window.aybZipStore=buildZip;

  /* ---- XLSX üretici (SheetJS'siz, offline) ---- */
  function xmlEsc(s){ return String(s==null?'':s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;'); }
  function colRef(i){ var s=''; i++; while(i>0){ var m=(i-1)%26; s=String.fromCharCode(65+m)+s; i=(i-m-1)/26|0; } return s; }
  function sheetXml(rows){
    var body='';
    for(var r=0;r<rows.length;r++){
      var cells='', row=rows[r]||[];
      for(var c=0;c<row.length;c++){
        var v=row[c], ref=colRef(c)+(r+1);
        if(v==null||v==='') continue;
        if(typeof v==='number' && isFinite(v)){ cells+='<c r="'+ref+'"><v>'+v+'</v></c>'; }
        else { cells+='<c r="'+ref+'" t="inlineStr"><is><t xml:space="preserve">'+xmlEsc(v)+'</t></is></c>'; }
      }
      body+='<row r="'+(r+1)+'">'+cells+'</row>';
    }
    return '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>\n<worksheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main"><sheetData>'+body+'</sheetData></worksheet>';
  }
  window.aybBuildXlsx=function(sheets){
    var enc=function(s){ return new TextEncoder().encode(s); };
    var files=[];
    var ct='<?xml version="1.0" encoding="UTF-8" standalone="yes"?>\n<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types">'+
      '<Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/>'+
      '<Default Extension="xml" ContentType="application/xml"/>'+
      '<Override PartName="/xl/workbook.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet.main+xml"/>';
    sheets.forEach(function(s,i){ ct+='<Override PartName="/xl/worksheets/sheet'+(i+1)+'.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.worksheet+xml"/>'; });
    ct+='</Types>';
    files.push({name:'[Content_Types].xml', bytes:enc(ct)});
    files.push({name:'_rels/.rels', bytes:enc('<?xml version="1.0" encoding="UTF-8" standalone="yes"?>\n<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="xl/workbook.xml"/></Relationships>')});
    var wbSheets='', wbRels='';
    sheets.forEach(function(s,i){
      var nm=xmlEsc(String(s.name||('Sayfa'+(i+1))).substring(0,31).replace(/[\\\/\?\*\[\]:]/g,'_'));
      wbSheets+='<sheet name="'+nm+'" sheetId="'+(i+1)+'" r:id="rId'+(i+1)+'"/>';
      wbRels+='<Relationship Id="rId'+(i+1)+'" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/worksheet" Target="worksheets/sheet'+(i+1)+'.xml"/>';
    });
    files.push({name:'xl/workbook.xml', bytes:enc('<?xml version="1.0" encoding="UTF-8" standalone="yes"?>\n<workbook xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships"><sheets>'+wbSheets+'</sheets></workbook>')});
    files.push({name:'xl/_rels/workbook.xml.rels', bytes:enc('<?xml version="1.0" encoding="UTF-8" standalone="yes"?>\n<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">'+wbRels+'</Relationships>')});
    sheets.forEach(function(s,i){ files.push({name:'xl/worksheets/sheet'+(i+1)+'.xml', bytes:enc(sheetXml(s.rows||[]))}); });
    var blob=buildZip(files);
    return new Blob([blob], {type:'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'});
  };
  /* btnMIFExport'a yakalama fazında bağla */
  d.addEventListener("click", function(ev){
    var t=ev.target;
    while(t && t!==d){
      if(t.id==="btnMIFExport"){
        try{ ev.preventDefault(); ev.stopPropagation(); if(ev.stopImmediatePropagation) ev.stopImmediatePropagation(); }catch(e){}
        doExport(); return;
      }
      t=t.parentNode;
    }
  }, true);
})();


/* ===================================================================== */
/* KÖRFEZİM — METRAJ GARANTİ: butonu offline üreticiye kesin bağla        */
/* app'in kendi metrajı XLSX yok deyip hata veriyordu; artık bizimki çalışır */
/* ===================================================================== */
(function(){
  "use strict";
  var d=document;
  function runMetraj(){
    try{
      if(typeof window.exportKorfezimMetraj==="function"){ window.exportKorfezimMetraj(); return; }
    }catch(e){ (window.aybModal||alert)("Metraj hatası: "+(e&&e.message?e.message:e)); return; }
    (window.aybModal||alert)("Metraj hazırlanıyor, birkaç saniye sonra tekrar deneyin.");
  }
  /* menüler de bizimkini kullansın */
  try{ window.exportProfessionalMetraj=function(){ runMetraj(); }; }catch(e){}
  /* app 'load' anında btnExcel.onclick'i kendi (bozuk) metrajına bağlıyor -> biz SONRA ezelim */
  function rebind(){
    var b=d.getElementById("btnExcel");
    if(b){ b.onclick=function(ev){ try{ev.preventDefault();ev.stopPropagation();}catch(e){} runMetraj(); }; }
  }
  var n=0, iv=setInterval(function(){ rebind(); if(++n>25) clearInterval(iv); }, 600);
  if(d.readyState==="loading") d.addEventListener("DOMContentLoaded",rebind); else rebind();
  /* yakalama fazı yedek */
  d.addEventListener("click", function(ev){
    var t=ev.target;
    while(t && t!==d){
      if(t.id==="btnExcel"){ try{ ev.preventDefault(); ev.stopPropagation(); if(ev.stopImmediatePropagation) ev.stopImmediatePropagation(); }catch(e){} runMetraj(); return; }
      t=t.parentNode;
    }
  }, true);
})();


/* ===================================================================== */
/* KÖRFEZİM — GPS kartı + Lejant: BASILI TUT SÜRÜKLE, TEK DOKUN kenara gizle */
/* ===================================================================== */
(function(){
  "use strict";
  var d=document;
  function css(){
    if(d.getElementById("aybDragCss")) return;
    var st=d.createElement("style"); st.id="aybDragCss";
    st.textContent=
      "#gpsCard.gps-live{cursor:grab;touch-action:none;}"+
      ".legend{cursor:grab;touch-action:none;}"+
      ".ayb-draggable{transition:transform .2s ease,opacity .2s ease;}"+
      ".ayb-draggable.ayb-drag-hidden{opacity:.92;}"+
      ".ayb-draggable.ayb-drag-hidden::after{content:'';}";
    (d.head||d.documentElement).appendChild(st);
  }
  function toggleHide(el){
    if(el.classList.contains("ayb-drag-hidden")){
      el.classList.remove("ayb-drag-hidden"); el.style.transform="none"; return;
    }
    var r=el.getBoundingClientRect(); var center=r.left+r.width/2;
    var toLeft=center < (window.innerWidth/2); var vis=22;
    el.classList.add("ayb-drag-hidden");
    el.style.transform = toLeft ? ("translateX(calc(-100% + "+vis+"px))") : ("translateX(calc(100% - "+vis+"px))");
  }
  function makeDraggable(el, tapHide){
    if(!el || el.__aybDrag) return; el.__aybDrag=true;
    el.classList.add("ayb-draggable");
    var pressing=false, moved=false, sx=0, sy=0, gx=0, gy=0;
    el.addEventListener("pointerdown", function(e){
      /* gizliyken tek dokunuş = geri aç (sürükleme başlatma) */
      if(el.classList.contains("ayb-drag-hidden")){ el.classList.remove("ayb-drag-hidden"); el.style.transform="none"; pressing=false; return; }
      pressing=true; moved=false; sx=e.clientX; sy=e.clientY;
      var r=el.getBoundingClientRect(); gx=e.clientX-r.left; gy=e.clientY-r.top;
      el.style.position="fixed"; el.style.left=r.left+"px"; el.style.top=r.top+"px";
      el.style.right="auto"; el.style.bottom="auto"; el.style.transform="none"; el.style.transition="none";
      try{ el.setPointerCapture(e.pointerId); }catch(_){}
    });
    el.addEventListener("pointermove", function(e){
      if(!pressing) return;
      var dx=e.clientX-sx, dy=e.clientY-sy;
      if(Math.abs(dx)+Math.abs(dy)>6) moved=true;
      if(moved){
        try{ e.preventDefault(); }catch(_){}
        var nx=e.clientX-gx, ny=e.clientY-gy;
        nx=Math.max(0, Math.min(window.innerWidth-24, nx));
        ny=Math.max(0, Math.min(window.innerHeight-24, ny));
        el.style.left=nx+"px"; el.style.top=ny+"px";
      }
    });
    function endDrag(e){
      if(!pressing) return; pressing=false; el.style.transition="";
      try{ el.releasePointerCapture(e.pointerId); }catch(_){}
      if(!moved && tapHide){ toggleHide(el); }
    }
    el.addEventListener("pointerup", endDrag);
    el.addEventListener("pointercancel", endDrag);
  }
  function bind(){
    css();
    makeDraggable(d.getElementById("gpsCard"), true);
    d.querySelectorAll(".legend, .leaflet-control-scale").forEach(function(el){ makeDraggable(el, true); });
  }
  var n=0, iv=setInterval(function(){ bind(); if(++n>40) clearInterval(iv); }, 500);
  if(d.readyState!=="loading") bind(); else d.addEventListener("DOMContentLoaded", bind);
})();


/* ===================================================================== */
/* KÖRFEZİM — Ortadaki "GPS konum gösterildi / Hassasiyet" yazısını gizle  */
/* (bilgi zaten GPS konum kartında var)                                   */
/* ===================================================================== */
(function(){
  "use strict";
  function patch(){
    if(window.__aybHintPatched || typeof window.hint!=="function") return false;
    var _h=window.hint;
    window.hint=function(msg){
      try{ if(msg!=null && /GPS konum g[öo]sterildi|Hassasiyet\s*:/i.test(String(msg))){
        var h=document.getElementById("hint"); if(h) h.textContent="";
        var sr=document.getElementById("statusReady"); if(sr) sr.textContent="";
        return;
      } }catch(e){}
      return _h.apply(this, arguments);
    };
    window.__aybHintPatched=true;
    return true;
  }
  if(!patch()){ var n=0, iv=setInterval(function(){ if(patch()||++n>60) clearInterval(iv); }, 300); }
})();


/* ===================================================================== */
/* KÖRFEZİM — Ekip adı (açılış ekranı) + dosya adı etiketi (proje_ekip_tarih) */
/* ===================================================================== */
(function(){
  "use strict";
  var d=document;
  function dstr(){ var t=new Date(); return t.getFullYear()+"-"+("0"+(t.getMonth()+1)).slice(-2)+"-"+("0"+t.getDate()).slice(-2); }
  function getEkip(){ try{ return (localStorage.getItem("ayb_ekip_adi")||"").trim(); }catch(e){ return ""; } }
  function setEkip(v){ try{ localStorage.setItem("ayb_ekip_adi", String(v==null?"":v).trim()); }catch(e){} }
  window.aybFileTag=function(){
    var p=window.project; var proj=(p&&p.name)?String(p.name):"Saha";
    var ekip=getEkip(); var parts=[proj]; if(ekip) parts.push(ekip); parts.push(dstr());
    return parts.join("_").replace(/[\\/:*?"<>|]+/g,"_").replace(/\s+/g,"_").replace(/_+/g,"_");
  };
  /* Açılış ekranına "Ekip Adı" alanı ekle */
  function injectEkipInput(){
    var scr=d.getElementById("projectScreen"); if(!scr) return;
    if(d.getElementById("aybEkipInput")) return;
    var nameRow=null;
    var inp=d.getElementById("projectNameInput");
    if(inp){ nameRow=inp.closest(".project-new-row")||inp.parentNode; }
    if(!nameRow) return;
    var row=d.createElement("div");
    row.className="project-new-row";
    row.innerHTML='<label>Ekip adı</label><input id="aybEkipInput" autocomplete="off" placeholder="Örn: Bayram Ekibi">';
    nameRow.parentNode.insertBefore(row, nameRow.nextSibling);
    var ei=d.getElementById("aybEkipInput"); if(ei){ ei.value=getEkip(); ei.addEventListener("input", function(){ setEkip(ei.value); }); ei.addEventListener("change", function(){ setEkip(ei.value); }); }
  }
  /* Yeni proje / aç düğmelerine basınca ekip adını kaydet */
  d.addEventListener("click", function(ev){
    var t=ev.target; while(t && t!==d){ if(t.id==="newProjectBtn" || (t.className&&String(t.className).indexOf("project-open")>=0)){ var ei=d.getElementById("aybEkipInput"); if(ei) setEkip(ei.value); break; } t=t.parentNode; }
  }, true);
  var n=0, iv=setInterval(function(){ injectEkipInput(); if(++n>60) clearInterval(iv); }, 500);
  if(d.readyState!=="loading") injectEkipInput(); else d.addEventListener("DOMContentLoaded", injectEkipInput);
})();


/* ===================================================================== */
/* KÖRFEZİM — GİRİŞ ŞİFRESİ + AYARLAR (kullanıcı/firma bilgileri)          */
/* Varsayılan şifre: 1234  (Ayarlar'dan değiştirilebilir)                  */
/* ===================================================================== */
(function(){
  "use strict";
  var d=document;
  var LS={sifre:"ayb_giris_sifre", yetkili:"ayb_yetkili_ad", firma:"ayb_firma_ad", tel:"ayb_firma_tel", adres:"ayb_firma_adres", ekip:"ayb_ekip_adi"};
  function g(k){ try{ return (localStorage.getItem(k)||"").trim(); }catch(e){ return ""; } }
  function s(k,v){ try{ localStorage.setItem(k, String(v==null?"":v).trim()); }catch(e){} }
  function sifre(){ var p=g(LS.sifre); if(!p){ s(LS.sifre,"1234"); p="1234"; } return p; }

  /* ---------------- GİRİŞ EKRANI ---------------- */
  function girisAcik(){ try{ return sessionStorage.getItem("ayb_giris_ok")==="1"; }catch(e){ return window.__aybGirisOk===true; } }
  function girisTamam(){ try{ sessionStorage.setItem("ayb_giris_ok","1"); }catch(e){} window.__aybGirisOk=true; var o=d.getElementById("aybGiris"); if(o) o.parentNode.removeChild(o); }
  function showGiris(){
    if(girisAcik()) return;
    if(d.getElementById("aybGiris")) return;
    var yet=g(LS.yetkili);
    var ov=d.createElement("div"); ov.id="aybGiris";
    ov.style.cssText="position:fixed;inset:0;z-index:2147483000;background:linear-gradient(160deg,#0b3b6f,#0f766e);display:flex;align-items:center;justify-content:center;padding:20px;font-family:inherit;";
    ov.innerHTML=
      '<div style="background:#fff;border-radius:18px;max-width:340px;width:100%;padding:22px;box-shadow:0 20px 60px rgba(0,0,0,.5);text-align:center;">'+
        '<div style="font-size:20px;font-weight:800;color:#0f766e;margin-bottom:4px;">Körfezim Saha Metraj</div>'+
        '<div style="font-size:12px;color:#64748b;margin-bottom:16px;">Yetkili Personel Girişi</div>'+
        (yet? '<div style="font-size:14px;color:#0f172a;margin-bottom:10px;">👤 <b>'+esc(yet)+'</b></div>' : '<input id="aybGirisAd" placeholder="Yetkili personel adı" style="width:100%;box-sizing:border-box;border:1px solid #cbd5e1;border-radius:10px;padding:11px;font-size:15px;margin-bottom:10px;font-family:inherit;">')+
        '<input id="aybGirisSifre" type="password" inputmode="numeric" placeholder="Şifre" style="width:100%;box-sizing:border-box;border:1px solid #cbd5e1;border-radius:10px;padding:11px;font-size:15px;margin-bottom:6px;font-family:inherit;text-align:center;letter-spacing:3px;">'+
        '<div id="aybGirisErr" style="color:#dc2626;font-size:12px;height:16px;margin-bottom:6px;"></div>'+
        '<button id="aybGirisBtn" style="width:100%;border:none;border-radius:10px;background:#16a34a;color:#fff;padding:12px;font-size:16px;font-weight:800;cursor:pointer;font-family:inherit;">Giriş</button>'+
        '<div style="font-size:11px;color:#94a3b8;margin-top:12px;">İlk şifre: 1234 — Ayarlar\'dan değiştirebilirsiniz</div>'+
      '</div>';
    d.body.appendChild(ov);
    var inp=d.getElementById("aybGirisSifre");
    function dene(){
      var v=(inp.value||"").trim();
      if(v===sifre()){ var ad=d.getElementById("aybGirisAd"); if(ad && ad.value.trim()) s(LS.yetkili, ad.value); girisTamam(); }
      else { var e=d.getElementById("aybGirisErr"); if(e) e.textContent="Şifre yanlış."; inp.value=""; inp.focus(); }
    }
    d.getElementById("aybGirisBtn").onclick=dene;
    inp.addEventListener("keydown", function(ev){ if(ev.key==="Enter") dene(); });
    setTimeout(function(){ try{ inp.focus(); }catch(e){} }, 200);
  }
  function esc(x){ return String(x==null?"":x).replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;"); }

  /* ---------------- AYARLAR PANELİ ---------------- */
  function fld(id,label,val,ph,type){ return '<div style="text-align:left;margin-bottom:10px;"><label style="display:block;font-size:12px;color:#475569;font-weight:600;margin-bottom:3px;">'+label+'</label>'+
    '<input id="'+id+'" '+(type?('type="'+type+'"'):'')+' value="'+esc(val)+'" placeholder="'+esc(ph||"")+'" style="width:100%;box-sizing:border-box;border:1px solid #cbd5e1;border-radius:9px;padding:9px;font-size:14px;font-family:inherit;"></div>'; }
  function openSettings(){
    var el=d.getElementById("aybAyarlar");
    if(el){ el.style.display="flex"; return; }
    el=d.createElement("div"); el.id="aybAyarlar";
    el.style.cssText="position:fixed;inset:0;z-index:2147482000;background:rgba(15,23,42,.55);display:flex;align-items:center;justify-content:center;padding:16px;font-family:inherit;overflow:auto;";
    el.innerHTML=
      '<div style="background:#fff;border-radius:16px;max-width:400px;width:100%;padding:18px;box-shadow:0 18px 50px rgba(0,0,0,.4);max-height:92vh;overflow:auto;">'+
        '<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:12px;">'+
          '<div style="font-size:17px;font-weight:800;color:#0f766e;">⚙️ Ayarlar</div>'+
          '<div id="aybAyarKapat" style="cursor:pointer;font-size:20px;color:#64748b;font-weight:800;">✕</div></div>'+
        '<div style="font-size:12px;font-weight:700;color:#0f766e;margin:4px 0 8px;border-bottom:1px solid #e2e8f0;padding-bottom:4px;">Kullanıcı / Firma Bilgileri</div>'+
        fld("aybSetYetkili","Yetkili Personel Adı",g(LS.yetkili),"Örn: Bayram YARAŞ")+
        fld("aybSetEkip","Ekip Adı",g(LS.ekip),"Örn: Bayram Ekibi")+
        fld("aybSetFirma","Firma Adı",g(LS.firma),"Örn: Körfezim Elektrik")+
        fld("aybSetTel","Telefon",g(LS.tel),"Örn: 0530 630 05 40")+
        fld("aybSetAdres","Adres",g(LS.adres),"")+
        '<div style="font-size:12px;font-weight:700;color:#0f766e;margin:12px 0 8px;border-bottom:1px solid #e2e8f0;padding-bottom:4px;">Giriş Şifresi</div>'+
        fld("aybSetSifre","Yeni Şifre (boş bırakılırsa değişmez)","","","password")+
        fld("aybSetSifre2","Yeni Şifre (tekrar)","","","password")+
        '<div id="aybSetErr" style="color:#dc2626;font-size:12px;min-height:16px;margin:2px 0;"></div>'+
        '<div style="display:flex;gap:8px;margin-top:10px;">'+
          '<button id="aybSetKaydet" style="flex:1;border:none;border-radius:10px;background:#16a34a;color:#fff;padding:11px;font-size:15px;font-weight:800;cursor:pointer;font-family:inherit;">Kaydet</button>'+
          '<button id="aybSetKapat2" style="flex:1;border:1px solid #cbd5e1;border-radius:10px;background:#fff;color:#475569;padding:11px;font-size:15px;font-weight:700;cursor:pointer;font-family:inherit;">Kapat</button></div>'+
      '</div>';
    d.body.appendChild(el);
    function kapat(){ el.style.display="none"; }
    d.getElementById("aybAyarKapat").onclick=kapat;
    d.getElementById("aybSetKapat2").onclick=kapat;
    d.getElementById("aybSetKaydet").onclick=function(){
      var err=d.getElementById("aybSetErr"); err.textContent="";
      var sf=d.getElementById("aybSetSifre").value.trim(), sf2=d.getElementById("aybSetSifre2").value.trim();
      if(sf || sf2){ if(sf!==sf2){ err.textContent="Şifreler aynı değil."; return; } if(sf.length<3){ err.textContent="Şifre en az 3 karakter olmalı."; return; } s(LS.sifre, sf); }
      s(LS.yetkili, d.getElementById("aybSetYetkili").value);
      s(LS.ekip, d.getElementById("aybSetEkip").value);
      s(LS.firma, d.getElementById("aybSetFirma").value);
      s(LS.tel, d.getElementById("aybSetTel").value);
      s(LS.adres, d.getElementById("aybSetAdres").value);
      try{ var ei=d.getElementById("aybEkipInput"); if(ei) ei.value=g(LS.ekip); }catch(e){}
      try{ if(window.toast) toast("Ayarlar kaydedildi."); }catch(e){}
      kapat();
    };
  }
  window.aybAyarlar=openSettings;

  /* ---------------- "Saha Veri" düğmesini AYARLAR yap ---------------- */
  function relabelBtn(){
    var b=d.getElementById("btnFieldDataToggle");
    if(!b) return;
    if(!b.__aybAyar){
      b.__aybAyar=true;
      b.title="Ayarlar — kullanıcı/firma bilgileri ve şifre";
      var ico=b.querySelector(".ayb-pro-ico"); if(ico) ico.textContent="⚙️";
      var sm=b.querySelector("small"); if(sm) sm.textContent="Ayarlar";
    }
    try{ var grp=b.closest?b.closest(".ayb-pro-group"):null; if(!grp){ grp=b; while(grp&&grp!==d&&!(grp.className&&String(grp.className).indexOf("ayb-pro-group")>=0)) grp=grp.parentNode; } if(grp&&grp.querySelector){ var tt=grp.querySelector(".ayb-pro-title"); if(tt&&tt.textContent!=="Ayarlar") tt.textContent="Ayarlar"; } }catch(e){}
  }
  /* app'in kendi Saha paneli açılmasın: yakalama fazında Ayarlar aç */
  d.addEventListener("click", function(ev){
    var t=ev.target; while(t && t!==d){ if(t.id==="btnFieldDataToggle"){ try{ ev.preventDefault(); ev.stopPropagation(); if(ev.stopImmediatePropagation) ev.stopImmediatePropagation(); }catch(e){} openSettings(); return; } t=t.parentNode; }
  }, true);

  function removeProjeAyar(){
    try{ var b=d.getElementById("btnAybAyarlar"); if(b&&b.parentNode) b.parentNode.removeChild(b); }catch(e){}
  }
  function renameSahaTab(){
    try{
      var t=d.querySelector('.ayb-ribbon-tab[data-section="fielddata"]');
      if(t && t.getAttribute("data-ayb-ren")!=="1"){
        t.innerHTML='<span>⚙️</span>Ayarlar';
        t.setAttribute("data-ayb-ren","1");
        /* SEKME sadece alt menüyü açsın; Ayarlar penceresi alt menüdeki "⚙️ Ayarlar" düğmesiyle açılır */
      }
    }catch(e){}
  }
  function boot(){ relabelBtn(); removeProjeAyar(); renameSahaTab(); showGiris(); }
  if(d.readyState!=="loading") boot(); else d.addEventListener("DOMContentLoaded", boot);
  var n=0, iv=setInterval(function(){ relabelBtn(); removeProjeAyar(); renameSahaTab(); if(!girisAcik()) showGiris(); if(++n>60) clearInterval(iv); }, 500);
})();

/* ===================== YAPIŞKAN NOT (koordinata sabit + ok + zoom ölçek, tablet) ===================== */
(function(){
  "use strict";
  var d=document;
  function M(){ return window.__aybMap || window.map || null; }
  var layer=null, curPid="__none__", mkById={}, zbound=false;
  var REF=18, MINS=0.10, MAXS=1.0; /* 1/500 = tam boy (en büyük); daha yakın = aynı; uzaklaştıkça küçülür */
  function appScaleN(){ try{ var el=d.getElementById("statusScale"); if(el){ var m=String(el.textContent||"").replace(/\./g,"").match(/1\s*\/\s*(\d+)/); if(m) return parseFloat(m[1]); } }catch(e){} return null; }
  function zScale(){
    var N=appScaleN();
    if(N&&isFinite(N)&&N>0){ var s=500/N; if(s<MINS)s=MINS; if(s>MAXS)s=MAXS; return s; }
    var map=M(); if(!map||typeof map.getZoom!=='function') return 1; var s2=Math.pow(2,(map.getZoom()-REF)); if(s2<MINS)s2=MINS; if(s2>MAXS)s2=MAXS; return s2;
  }

  function getNotes(){ var p=window.project; if(!p) return null; if(!Array.isArray(p.aybNotes)) p.aybNotes=[]; return p.aybNotes; }
  function findNote(id){ var a=getNotes(); if(!a) return null; for(var i=0;i<a.length;i++){ if(a[i].id===id) return a[i]; } return null; }
  function save(){ try{ if(typeof window.saveProjects==="function") window.saveProjects(); }catch(e){} }
  function esc(s){ return String(s==null?"":s).replace(/[&<>]/g,function(c){return c==="&"?"&amp;":c==="<"?"&lt;":"&gt;";}); }
  function aLL(n){ return [n.lat, n.lng]; }
  function bLL(n){ return [ (n.noteLat!=null?n.noteLat:n.lat), (n.noteLng!=null?n.noteLng:n.lng) ]; }

  var _asRaf=0;
  function applyScale(){                     /* zoom sirasinda kare basina EN FAZLA bir kez calis */
    if(_asRaf) return;
    _asRaf=(window.requestAnimationFrame||function(f){ return setTimeout(f,16); })(function(){ _asRaf=0; applyScaleNow(); });
  }
  function applyScaleNow(){
    /* HIZLANDIRMA (Bayram YARAŞ): notlar GİZLİYKEN hiç hesap yapma (her harita
       hareketinde yüzlerce not için dönüp duruyordu, gizliyken bile). */
    if(_notKapaliBayrak) return;
    if(_notOtoGizli) return;   /* 1/500 kuralıyla kapalıyken hesap yapma */
    var s=zScale(), map=M(); if(!map) return;
    var b=null; try{ b=map.getBounds().pad(0.3); }catch(e){}
    var ids=Object.keys(mkById);
    for(var i=0;i<ids.length;i++){
      var id=ids[i], g=mkById[id]; if(!g) continue;
      var n=findNote(id);
      /* GORUS ALANI DISINDA: gizle, hesap yapma (yuzlerce notta zoom donmasin) */
      if(b && n){
        var la=(n.noteLat!=null?n.noteLat:n.lat), ln=(n.noteLng!=null?n.noteLng:n.lng);
        if(la!=null && !b.contains([la,ln])){
          if(g._el===undefined) g._el=(g.body&&g.body.getElement)?g.body.getElement():null;
          try{ if(g._el) g._el.style.display='none'; }catch(e){}
          try{ var ea=(g.arrow&&g.arrow.getElement)?g.arrow.getElement():null; if(ea) ea.style.display='none'; }catch(e){}
          continue;
        }
      }
      /* DOM ogesini onbellekle; katman yeniden eklendiyse onbellek gecersiz -> tekrar bul */
      var gecersiz = (!g._note) || (g._note.isConnected===false) || (g._el && g._el.isConnected===false);
      if(gecersiz){
        var el=(g.body&&g.body.getElement)?g.body.getElement():null;
        g._el=el; g._note=null;
        if(el){ try{ g._note=el.querySelector(".ayb-note"); }catch(e){} }
      }
      try{ if(!_notKapaliBayrak && g._el && g._el.style.display==='none') g._el.style.display=''; }catch(e){}
      if(g._note){ g._note.style.transformOrigin="top left"; g._note.style.transform="scale("+s+")"; }
      else if(g._el){ g._el.style.transformOrigin="top left"; g._el.style.zoom=''; g._el.style.transform="scale("+s+")"; }   /* yedek: iç kutu bulunamazsa dış kutuyu ölçekle */
      updateArrow(id,s);
    }
  }
  function updateArrow(id,s){
    var g=mkById[id]; if(!g||!g.arrow) return; var map=M(); var L=window.L; if(!map||!L) return;
    var n=findNote(id); if(!n) return;
    if(s==null) s=zScale();
    var pa=map.latLngToLayerPoint(L.latLng(aLL(n)[0],aLL(n)[1]));
    var pb=map.latLngToLayerPoint(L.latLng(bLL(n)[0],bLL(n)[1]));
    var dx=pa.x-pb.x, dy=pa.y-pb.y; var near=(dx*dx+dy*dy)<100;
    var ang=Math.atan2(dy,dx)*180/Math.PI;
    var el=g.arrow.getElement?g.arrow.getElement():null;
    if(el){ var a=el.querySelector(".ayb-note-arrow"); if(a){ a.style.transform="rotate("+(ang+90)+"deg) scale("+s+")"; } el.style.display=near?"none":""; }
    if(g.line){ try{ g.line.setStyle({opacity:near?0:0.9}); }catch(e){} }
  }

  function noteHtml(n){
    return '<div class="ayb-note">'
      +'<div class="ayb-note-bar"><span class="ayb-note-grip" title="Taşı">✥</span><button class="ayb-note-del" title="Sil">×</button></div>'
      +'<div class="ayb-note-text" contenteditable="false" spellcheck="false">'+esc(n.text)+'</div>'
      +'</div>';
  }
  function addMarker(n){
    var L=window.L, map=M(); if(!L||!map||!layer) return;
    var line=L.polyline([bLL(n),aLL(n)], {color:"#b45309",weight:2,opacity:.9,dashArray:"5,4",interactive:false,className:"ayb-note-line"}).addTo(layer);
    var arrow=L.marker(aLL(n), {icon:L.divIcon({className:"ayb-note-arrowwrap",html:'<div class="ayb-note-arrow">▲</div>',iconSize:[20,20],iconAnchor:[10,10]}),interactive:false,keyboard:false,zIndexOffset:11000}).addTo(layer);
    var body=L.marker(bLL(n), {icon:L.divIcon({className:"ayb-note-wrap",html:noteHtml(n),iconSize:[168,72],iconAnchor:[0,0]}),interactive:true,keyboard:false,zIndexOffset:12000}).addTo(layer);
    mkById[n.id]={body:body,line:line,arrow:arrow};
    wire(n); setTimeout(function(){ applyScale(); },30);
  }
  function wire(n){
    var g=mkById[n.id]; if(!g||!g.body) return;
    var mk=g.body, el=mk.getElement?mk.getElement():null;
    if(!el){ setTimeout(function(){wire(n);},60); return; }
    var L=window.L, map=M();
    try{ L.DomEvent.disableClickPropagation(el); L.DomEvent.disableScrollPropagation(el); }catch(e){}
    var txt=el.querySelector(".ayb-note-text"), del=el.querySelector(".ayb-note-del"), grip=el.querySelector(".ayb-note-grip");
    if(txt){
      txt.addEventListener("input",function(){ n.text=txt.innerText; save(); });
      /* dokununca düzenleme aç, çıkınca kapat -> zoom/kaydırma çok daha hızlı */
      txt.addEventListener("click",function(){ try{ if(txt.getAttribute("contenteditable")!=="true"){ txt.setAttribute("contenteditable","true"); txt.focus(); } }catch(e){} });
      txt.addEventListener("blur",function(){ try{ txt.setAttribute("contenteditable","false"); }catch(e){} });
      txt.addEventListener("pointerdown",function(e){ e.stopPropagation(); });
      txt.addEventListener("dblclick",function(e){ e.stopPropagation(); });
    }
    if(del){ del.addEventListener("click",function(e){ e.stopPropagation(); e.preventDefault(); removeNote(n); }); }
    if(grip){
      var drag=false;
      grip.addEventListener("pointerdown",function(e){ e.preventDefault(); e.stopPropagation(); drag=true; try{map.dragging.disable();}catch(_){}
        try{grip.setPointerCapture(e.pointerId);}catch(_){}
      });
      grip.addEventListener("pointermove",function(e){ if(!drag) return; var pt; try{ pt=map.mouseEventToLatLng(e); }catch(_){ pt=null; }
        if(pt){ n.noteLat=pt.lat; n.noteLng=pt.lng; mk.setLatLng(pt);
          if(g.line){ try{ g.line.setLatLngs([[pt.lat,pt.lng],aLL(n)]); }catch(_){} }
          updateArrow(n.id);
        }
      });
      function end(){ if(!drag) return; drag=false; try{map.dragging.enable();}catch(_){} save(); }
      grip.addEventListener("pointerup",end); grip.addEventListener("pointercancel",end);
    }
  }
  function removeNote(n){
    try{ var g=mkById[n.id]; if(g&&layer){ if(g.body)layer.removeLayer(g.body); if(g.line)layer.removeLayer(g.line); if(g.arrow)layer.removeLayer(g.arrow); } delete mkById[n.id]; }catch(e){}
    var arr=getNotes(); if(arr){ for(var i=0;i<arr.length;i++){ if(arr[i].id===n.id){ arr.splice(i,1); break; } } }
    save();
  }
  function rebuild(){
    var L=window.L, map=M(); if(!L||!map) return;
    /* HIZLANDIRMA (Bayram YARAŞ): notlar GİZLİYKEN yeniden çizme. Arka plandaki
       periyodik rebuild çağrıları (watch/boot/import) notları geri getiriyordu;
       bu yüzden "Notları Gizle" kalıcı çalışmıyordu. Artık gizliyse boşalt ve çık. */
    if(_notKapaliBayrak){ try{ if(layer){ layer.clearLayers(); if(map.hasLayer&&map.hasLayer(layer)) map.removeLayer(layer); } }catch(e){} mkById={}; return; }
    if(!layer){ layer=L.layerGroup().addTo(map); }
    layer.clearLayers(); mkById={};
    bindZoom();
    var arr=getNotes(); if(!arr) return;
    arr.forEach(function(n){ addMarker(n); });
    try{ notOtoUygula(); }catch(e){}
    applyScaleNow(); setTimeout(applyScaleNow,60);
  }
  function notKabi(){ try{ return layer && layer.getPane ? layer.getPane() : null; }catch(e){ return null; } }
  var _notKapaliBayrak=false;
  /* OTOMATİK NOT GÖRÜNÜMÜ (Bayram YARAŞ): yapışkan notlar 1/500 ölçeğine
     yaklaşınca AÇILIR, zoom- yapıp uzaklaşınca KAPANIR. Gizle/Aç düğmesi üstündür:
     düğmeyle gizlendiyse otomatik sistem karışmaz. CSS ile aç/kapa yapıldığı için
     hiçbir şey silinip yeniden çizilmez — programı hiç yormaz. */
  var _notOtoGizli=false;
  function notDenom(){
    try{
      var map=M();
      if(typeof window.scaleDenominatorAtZoom==='function') return window.scaleDenominatorAtZoom(map.getZoom(), map.getCenter().lat);
      var mpp=156543.03392*Math.cos(map.getCenter().lat*Math.PI/180)/Math.pow(2,map.getZoom());
      return mpp*3779.53;
    }catch(e){ return 999999; }
  }
  function notOtoUygula(){
    try{
      var map=M(); if(!map) return;
      if(_notKapaliBayrak){ try{ map.getContainer().classList.remove('ayb-not-oto-gizli'); }catch(e){} _notOtoGizli=false; return; }
      var gizli = notDenom() > 620;   /* 1/500 gösteriminden uzaktaysa kapalı */
      if(gizli===_notOtoGizli) return;
      _notOtoGizli=gizli;
      try{ map.getContainer().classList.toggle('ayb-not-oto-gizli', gizli); }catch(e){}
      if(!gizli){ try{ applyScaleNow(); }catch(e){} }
    }catch(e){}
  }
  function notGoster(gorunsun){
    if(gorunsun && _notKapaliBayrak) return;         /* kullanıcı notları kapattıysa açma */
    try{
      var map=M();
      var ids=Object.keys(mkById);
      for(var i=0;i<ids.length;i++){
        var g=mkById[ids[i]]; if(!g) continue;
        var el=(g.body&&g.body.getElement)?g.body.getElement():null;
        if(el) el.style.display=gorunsun?'':'none';
        var ea=(g.arrow&&g.arrow.getElement)?g.arrow.getElement():null;
        if(ea) ea.style.display=gorunsun?'':'none';
        /* bağlantı çizgisi SVG'dir: zoom sırasında haritadan tamamen çıkar (donmanın asıl sebebi buydu).
           Çizgide olay dinleyicisi yok, tekrar eklemek güvenli. */
        if(g.line && layer){
          try{
            if(gorunsun){ if(!layer.hasLayer || !layer.hasLayer(g.line)) layer.addLayer(g.line); }
            else { layer.removeLayer(g.line); }
          }catch(e){}
        }
      }
    }catch(e){}
  }
  var _katmanCikti=false;
  var _zoomCikti=false;
  function katmanKaldir(){ try{ var map=M(); if(map&&layer&&map.hasLayer(layer)){ map.removeLayer(layer); return true; } }catch(e){} return false; }
  function katmanEkle(){ try{ var map=M(); if(map&&layer&&!map.hasLayer(layer)){ layer.addTo(map); return true; } }catch(e){} return false; }
  var _zbTry=0;
  setInterval(function(){ if(!zbound && _zbTry++<120){ try{ bindZoom(); }catch(e){} } }, 800);
  function bindZoom(){
    var map=M(); if(!map||zbound) return;
    try{
      /* ===== NOT-ZOOM KESİN ÇÖZÜMÜ (Bayram YARAŞ) =====
         ESKİDEN: her zoom kademesinde TÜM notlar haritadan SÖKÜLÜP zoom bitince
         SIFIRDAN yeniden kuruluyordu (DOM sil + baştan oluştur + tüm dokunma/taşıma/
         silme bağlantılarını yeniden bağla). Notlar açıkken zoom'un donması buydu.
         ARTIK: notlar yerinde kalır — zoom animasyonu sırasında CSS onları zaten
         gizliyor (leaflet-zoom-anim kuralı), zoom bitince SADECE ölçek güncellenir.
         Hiçbir şey sökülüp yeniden kurulmaz; bağlantılar hiç kopmaz. */
      map.on("zoomend", function(){
        if(_notKapaliBayrak) return;
        notOtoUygula();                     /* 1/500 kuralı: yaklaşınca aç, uzaklaşınca kapat */
        if(!_notOtoGizli) applyScaleNow();
      });
      map.on("moveend", applyScale);
      zbound=true;
    }catch(e){}
  }
  function placeAt(latlng){
    var arr=getNotes(); if(!arr){ (window.aybModal||alert)("Önce bir proje aç."); return; }
    var n={ id:"note_"+Date.now()+"_"+Math.floor(Math.random()*1000), lat:latlng.lat, lng:latlng.lng, noteLat:latlng.lat, noteLng:latlng.lng, text:"" };
    arr.push(n); addMarker(n); save();
    setTimeout(function(){ try{ var tx=mkById[n.id].body.getElement().querySelector(".ayb-note-text"); tx.setAttribute("contenteditable","true"); tx.focus(); }catch(e){} },160);
  }
  function startPlace(){
    var map=M(); if(!map) return;
    if(!getNotes()){ (window.aybModal||alert)("Önce bir proje aç."); return; }
    try{ if(typeof window.setTool==="function") window.setTool(null); }catch(e){}
    try{ if(typeof window.hint==="function") window.hint("Yapışkan not için haritaya dokun."); }catch(e){}
    try{ map.getContainer().style.cursor="crosshair"; }catch(e){}
    map.once("click", function(e){ try{ map.getContainer().style.cursor=""; }catch(_){} placeAt(e.latlng); });
  }
  function css(){
    if(d.getElementById("aybNoteCss")) return;
    var s=d.createElement("style"); s.id="aybNoteCss";
    s.textContent=
      ".ayb-note-wrap{background:transparent!important;border:none!important;}"
      +".ayb-note{width:168px;background:#fff9c4;border:1px solid #e6d54a;border-radius:7px;box-shadow:0 4px 12px rgba(0,0,0,.35);font:13px system-ui,Arial;overflow:hidden;transform-origin:top left;}"
      +".ayb-note-bar{display:flex;align-items:center;justify-content:space-between;background:#fde68a;padding:3px 5px;}"
      +".ayb-note-grip{cursor:move;font-size:15px;color:#92400e;padding:0 4px;touch-action:none;user-select:none;}"
      +".ayb-note-del{border:none;background:#ef4444;color:#fff;width:20px;height:20px;border-radius:5px;font-size:15px;line-height:1;cursor:pointer;}"
      +".ayb-note-text{padding:7px 8px;min-height:36px;color:#3b2f00;outline:none;white-space:pre-wrap;word-break:break-word;}"
      +".ayb-note-arrowwrap{background:transparent!important;border:none!important;}"
      +".ayb-note-arrow{color:#b45309;font-size:18px;line-height:1;transform-origin:center;text-shadow:0 0 3px #fff,0 0 3px #fff;}"
      +".ayb-not-oto-gizli .ayb-note-wrap,.ayb-not-oto-gizli .ayb-note-arrowwrap,.ayb-not-oto-gizli .ayb-note-line{display:none!important;}";
    (d.head||d.documentElement).appendChild(s);
  }
  function injectBtn2(){
    if(d.getElementById("aybNotGizleBtn")) return true;
    var a=d.getElementById("aybNoteBtn")||d.getElementById("aybYenileBtn")||d.getElementById("aybTfBtn")||d.getElementById("btnCadTop");
    if(!a||!a.parentNode) return false;
    var b=d.createElement("button"); b.id="aybNotGizleBtn"; b.type="button"; b.className=a.className;
    b.title="Yapışkan notları gizle/göster (yoğun bölgede haritayı hızlandırır)";
    b.innerHTML='<div class="ayb-pro-ico" style="color:#ca8a04;">📝</div><small>Notları Gizle</small>';
    b.addEventListener("click", function(e){ try{e.preventDefault();e.stopPropagation();}catch(_){} window.aybNotlarAcKapa(); });
    a.parentNode.insertBefore(b, a.nextSibling);
    return true;
  }
  setTimeout(function(){ var t2=0, iv2=setInterval(function(){ if(injectBtn2()|| ++t2>60) clearInterval(iv2); }, 700); }, 1500);
  function injectBtn(){
    if(d.getElementById("aybNoteBtn")) return true;
    var row=d.querySelector(".ayb-pro-group.draw .ayb-pro-row");
    if(!row) return false;
    var b=d.createElement("button");
    b.type="button"; b.id="aybNoteBtn"; b.className="ayb-pro-btn toolbtn"; b.title="Yapışkan Not (koordinata sabit, ok ile, zoomla küçülür)";
    b.innerHTML='<div class="ayb-pro-ico" style="font-size:18px">📝</div><small>Yap. Not</small>';
    b.addEventListener("click", function(e){ e.preventDefault(); e.stopPropagation(); startPlace(); });
    row.appendChild(b);
    return true;
  }
  function mergeNotes(arr){
    var notes=getNotes(); if(!notes||!Array.isArray(arr)) return 0;
    var byId={}; notes.forEach(function(n){ byId[n.id]=n; });
    var add=0;
    arr.forEach(function(nn){
      if(!nn || nn.lat==null || nn.lng==null) return;
      if(nn.id && byId[nn.id]){ var e=byId[nn.id]; e.lat=nn.lat; e.lng=nn.lng; if(nn.noteLat!=null)e.noteLat=nn.noteLat; if(nn.noteLng!=null)e.noteLng=nn.noteLng; if(nn.text!=null) e.text=nn.text; }
      else {
        var dup=notes.some(function(n){ return Math.abs(n.lat-nn.lat)<0.00002 && Math.abs(n.lng-nn.lng)<0.00002 && (n.text||"")===(nn.text||""); });
        if(!dup){ notes.push({ id:nn.id||("note_"+Date.now()+"_"+Math.floor(Math.random()*1000)), lat:nn.lat, lng:nn.lng, noteLat:(nn.noteLat!=null?nn.noteLat:nn.lat), noteLng:(nn.noteLng!=null?nn.noteLng:nn.lng), text:nn.text||"" }); add++; }
      }
    });
    save(); rebuild(); return add;
  }
  window.aybMergeNotes=mergeNotes;
  /* Notları tamamen aç/kapat (yoğun bölgede hız için) */
  var _notKapali=false;
  window.aybNotlarAcKapa=function(){
    try{
      var map=M();
      if(!layer && map && window.L){ try{ layer=window.L.layerGroup().addTo(map); }catch(e){} }
      _notKapaliBayrak=!_notKapaliBayrak;
      /* İKİNCİ KİLİT (Bayram YARAŞ): gizliyken CSS ile de zorla gizle — hangi kod
         yeniden çizerse çizsin notlar GÖRÜNEMEZ. Açınca kural kaldırılır. */
      try{
        var kcss=d.getElementById('aybNotKillCss');
        if(_notKapaliBayrak){
          if(!kcss){ kcss=d.createElement('style'); kcss.id='aybNotKillCss';
            kcss.textContent='.ayb-note-wrap,.ayb-note-arrowwrap{display:none!important;}';
            (d.head||d.documentElement).appendChild(kcss); }
        } else if(kcss){ kcss.remove(); }
      }catch(e){}
      if(_notKapaliBayrak){
        katmanKaldir();
        /* katman yakalanamadıysa tek tek de gizle (garanti) */
        try{ Object.keys(mkById).forEach(function(id){ var g=mkById[id]; if(!g) return;
          var el=(g.body&&g.body.getElement)?g.body.getElement():null; if(el) el.style.display='none';
          var ea=(g.arrow&&g.arrow.getElement)?g.arrow.getElement():null; if(ea) ea.style.display='none';
          if(g.line&&layer){ try{ layer.removeLayer(g.line); }catch(e){} } }); }catch(e){}
      }
      else {
        katmanEkle();
        try{ Object.keys(mkById).forEach(function(id){ var g=mkById[id]; if(!g) return;
          var el=(g.body&&g.body.getElement)?g.body.getElement():null; if(el) el.style.display='';
          var ea=(g.arrow&&g.arrow.getElement)?g.arrow.getElement():null; if(ea) ea.style.display=''; }); }catch(e){}
        try{ rebuild(); }catch(e){}
      }
      try{ notOtoUygula(); }catch(e){}
      try{ if(window.toast) toast(_notKapaliBayrak?'Yapışkan notlar gizlendi (harita hızlanır).':(_notOtoGizli?'Notlar açık — 1/500 ölçeğine yaklaşınca görünür.':'Yapışkan notlar açıldı.')); }catch(e){}
      var b=d.getElementById('aybNotGizleBtn');
      if(b){ var sm=b.querySelector('small'); var yz=_notKapaliBayrak?'Notları Göster':'Notları Gizle'; if(sm) sm.textContent=yz; else b.textContent='📝 '+yz; }
    }catch(e){}
  };;
  window.aybNotlariGizliMi=function(){ return _notKapaliBayrak; };
  window.aybNotesRebuild=rebuild;
  /* Veri ile ekranı birebir eşitle: listede olmayan hiçbir not ekranda kalamaz */
  window.aybNotesSenkron=function(){
    try{
      var arr=getNotes()||[], canli={};
      arr.forEach(function(n){ if(n&&n.id!=null) canli[n.id]=1; });
      Object.keys(mkById).forEach(function(id){
        if(canli[id]) return;
        var g=mkById[id]; if(!g) { delete mkById[id]; return; }
        try{ if(g.body&&layer) layer.removeLayer(g.body); }catch(e){}
        try{ if(g.arrow&&layer) layer.removeLayer(g.arrow); }catch(e){}
        try{ if(g.line&&layer) layer.removeLayer(g.line); }catch(e){}
        var map=M();
        try{ if(map){ if(g.body) map.removeLayer(g.body); if(g.arrow) map.removeLayer(g.arrow); if(g.line) map.removeLayer(g.line); } }catch(e){}
        delete mkById[id];
      });
      /* eksik kalan not varsa ekle */
      arr.forEach(function(n){ if(n&&n.id!=null && !mkById[n.id]) { try{ addMarker(n); }catch(e){} } });
      if(_notKapaliBayrak){ katmanKaldir(); return true; }
      applyScaleNow();
      return true;
    }catch(e){ return false; }
  };
  window.aybNotesRemoveByIds=function(ids){
    try{
      var arr=getNotes(); if(!arr||!ids||!ids.length) return 0;
      var kume={}; ids.forEach(function(x){ kume[x]=1; });
      var n=0;
      for(var i=arr.length-1;i>=0;i--){ if(kume[arr[i].id]){ arr.splice(i,1); n++; } }
      if(!n){                                   /* id tutmadıysa: aynı konumdaki notu sil */
        for(var j=arr.length-1;j>=0;j--){
          var a2=arr[j];
          for(var k=0;k<ids.length;k++){
            var hedef=ids[k];
            if(hedef && typeof hedef==='object' && a2 && Math.abs((a2.lat||0)-(hedef.lat||0))<1e-7 && Math.abs((a2.lng||0)-(hedef.lng||0))<1e-7){ arr.splice(j,1); n++; break; }
          }
        }
      }
      /* haritadaki not katmanlarını da kaldır */
      Object.keys(mkById).forEach(function(id){
        if(!kume[id]) return;
        var g=mkById[id];
        try{ if(g.body) layer.removeLayer(g.body); }catch(e){}
        try{ if(g.arrow) layer.removeLayer(g.arrow); }catch(e){}
        try{ if(g.line) layer.removeLayer(g.line); }catch(e){}
        delete mkById[id];
      });
      save();
      try{ rebuild(); }catch(e){}
      return n;
    }catch(e){ return 0; }
  };

  function watch(){
    var pid=(window.project&&window.project.id)||"__none__";
    if(pid!==curPid){ curPid=pid; rebuild(); }
    if(window.__aybPendingNotes && getNotes()){ try{ mergeNotes(window.__aybPendingNotes); }catch(e){} window.__aybPendingNotes=null; }
  }
  function boot(){
    css();
    var t=0, iv=setInterval(function(){ var ok=injectBtn(); if(M()&&window.L){ bindZoom(); rebuild(); } if((ok&&M())|| ++t>40) clearInterval(iv); },500);
    setInterval(watch,1200);
  }
  if(d.readyState!=="loading") boot(); else d.addEventListener("DOMContentLoaded", boot);
})();

/* ===================== DİREK OTOMAT DEĞİŞİMİ (Hırdavat sekmesi) ===================== */
(function(){
  "use strict";
  var d=document;
  var OTO_TIPLER=["B6","B10","B16","B20","B25","B32","B40","C6","C10","C16","C20","C25","C32","C40","C50","C63",
    "3x16","3x25","3x32","3x40","3x50","3x63","1x16","1x25","1x32"];
  function save(){ try{ if(typeof window.saveProjects==="function") window.saveProjects(); }catch(e){} }
  function S(v){ return v==null?"":String(v); }

  function ensureDatalist(){
    if(d.getElementById("aybOtoList")) return;
    var dl=d.createElement("datalist"); dl.id="aybOtoList";
    OTO_TIPLER.forEach(function(t){ var o=d.createElement("option"); o.value=t; dl.appendChild(o); });
    (d.body||d.documentElement).appendChild(dl);
  }

  function render(obj, listEl){
    listEl.innerHTML="";
    var arr=obj.props.otomatlar;
    arr.forEach(function(row,i){
      var r=d.createElement("div");
      r.style.cssText="display:grid;grid-template-columns:1fr 66px 30px;gap:6px;align-items:center;margin:3px 0;";
      var tip=d.createElement("input"); tip.type="text"; tip.setAttribute("list","aybOtoList");
      tip.placeholder="Tip (örn: B6, C16, 3x25)"; tip.value=S(row.tip);
      tip.style.cssText="height:28px;padding:2px 6px;border:1px solid #c8ced8;border-radius:4px;min-width:0;";
      var adet=d.createElement("input"); adet.type="number"; adet.min="1"; adet.step="1"; adet.value=(row.adet||1);
      adet.style.cssText="height:28px;padding:2px 4px;border:1px solid #c8ced8;border-radius:4px;text-align:center;min-width:0;";
      var del=d.createElement("button"); del.type="button"; del.textContent="×"; del.title="Sil";
      del.style.cssText="height:28px;border:none;background:#ef4444;color:#fff;border-radius:5px;font-size:16px;cursor:pointer;";
      tip.addEventListener("input",function(){ row.tip=tip.value; save(); });
      adet.addEventListener("input",function(){ var n=parseInt(adet.value,10); row.adet=(isNaN(n)||n<1)?1:n; save(); });
      del.addEventListener("click",function(){ arr.splice(i,1); save(); render(obj,listEl); });
      r.appendChild(tip); r.appendChild(adet); r.appendChild(del);
      listEl.appendChild(r);
    });
    if(!arr.length){
      var empty=d.createElement("div"); empty.textContent="Otomat değişimi girilmedi.";
      empty.style.cssText="color:#7a8699;font-size:12px;padding:3px 2px;"; listEl.appendChild(empty);
    }
  }

  function injectOtomat(obj){
    if(!obj || !obj.props) return;
    var tab=d.getElementById("tab_hirdavat");
    if(!tab) return;
    obj.props.otomatlar=Array.isArray(obj.props.otomatlar)?obj.props.otomatlar:[];
    ensureDatalist();
    var old=d.getElementById("aybOtoBox"); if(old&&old.parentNode) old.parentNode.removeChild(old);
    var box=d.createElement("div"); box.id="aybOtoBox";
    box.style.cssText="border:1px solid #d9a441;background:#fff7e6;border-radius:8px;padding:8px 10px;margin:4px 0 10px;";
    var head=d.createElement("div");
    head.style.cssText="display:flex;align-items:center;justify-content:space-between;margin-bottom:4px;";
    var title=d.createElement("div"); title.innerHTML="⚡ <b>Otomat Değişimi</b>";
    title.style.cssText="font-size:13px;color:#92400e;";
    var add=d.createElement("button"); add.type="button"; add.textContent="+ Otomat Ekle";
    add.style.cssText="height:30px;padding:0 12px;border:none;border-radius:6px;background:#2563eb;color:#fff;font-weight:700;font-size:12px;cursor:pointer;";
    head.appendChild(title); head.appendChild(add);
    var list=d.createElement("div"); list.id="aybOtoList_rows";
    box.appendChild(head); box.appendChild(list);
    tab.insertBefore(box, tab.firstChild);
    add.addEventListener("click",function(){ obj.props.otomatlar.push({tip:"",adet:1}); save(); render(obj,list);
      setTimeout(function(){ var ins=list.querySelectorAll('input[type=text]'); if(ins.length) ins[ins.length-1].focus(); },40);
    });
    render(obj, list);
  }

  function tryInjectPoll(o){
    if(!o) return;
    var tries=0;
    var iv=setInterval(function(){
      var tab=d.getElementById("tab_hirdavat");
      if(tab){ injectOtomat(o); clearInterval(iv); }
      if(++tries>30) clearInterval(iv); /* ~3 sn */
    },100);
  }
  function wrap(){
    if(window.__aybOtoWrapped) return false;
    if(typeof window.openPointForm!=="function") return false;
    var orig=window.openPointForm;
    window.openPointForm=function(type,latlng,existing){
      var r=orig.apply(this,arguments);
      try{ if(type==="direk" && existing){ tryInjectPoll(existing); } }catch(e){}
      return r;
    };
    window.__aybOtoWrapped=true;
    return true;
  }
  var t=0, iv=setInterval(function(){ if(wrap()|| ++t>60) clearInterval(iv); },500);
})();

/* ===================== BUL (arama: trafo/direk/box/kofre no + trafoya bağlı direkler) ===================== */
(function(){
  "use strict";
  var d=document;
  function M(){ return window.__aybMap||window.map||null; }
  var hl=null, curType="all", curQuery="", curTrafo="";

  function objNo(o){ try{ return String((window.getObjectNo?window.getObjectNo(o):null) || (o.props&&(o.props.direk_no||o.props.trafo_no||o.props.kofre_no||o.props.box_no||o.props.ad)) || o.id); }catch(e){ return String(o.id||""); } }
  function objTip(o){ try{ return String((window.getObjectTip?window.getObjectTip(o):null) || o.type || ""); }catch(e){ return String(o.type||""); } }
  function tLabel(t){ var m={direk:'Direk',trafo:'Trafo',box:'Box',kofre:'Kofre',abone:'Abone',ekmuf:'Ek Muf',not:'Not'}; return m[t]||t; }
  function tIcon(t){ var m={direk:'📍',trafo:'⚡',box:'🔲',kofre:'🗄️',abone:'🏠',ekmuf:'🔗',not:'📝'}; return m[t]||'•'; }
  function low(s){ return String(s==null?"":s).toLocaleLowerCase("tr"); }

  function results(){
    var p=window.project; if(!p||!Array.isArray(p.objects)) return [];
    var q=low(curQuery).trim(), out=[];
    p.objects.forEach(function(o){
      if(!o||o.lat==null) return;
      if(curTrafo){ if(o.type!=="direk") return; var tn=low(o.props&&(o.props.trafo_no||o.props.baslangic_trafo_no||o.props.enerji_direk_no)); if(tn!==low(curTrafo)) return; }
      else if(curType!=="all" && o.type!==curType) return;
      var no=objNo(o), tip=objTip(o);
      if(!curTrafo && q){ var hay=low(no+" "+tip+" "+tLabel(o.type)+" "+(o.props&&o.props.trafo_no||"")); if(hay.indexOf(q)<0) return; }
      out.push({o:o,no:no,tip:tip,type:o.type});
    });
    out.sort(function(a,b){ if(a.type!==b.type) return a.type<b.type?-1:1; return String(a.no).localeCompare(String(b.no),'tr',{numeric:true}); });
    return out.slice(0,400);
  }

  function highlight(o){
    var map=M(), L=window.L; if(!map||!L) return;
    try{ if(hl){ map.removeLayer(hl); hl=null; } }catch(e){}
    var c=L.circleMarker([o.lat,o.lng], {radius:20,color:"#ff2d55",weight:4,fill:false,opacity:1}).addTo(map); hl=c;
    var r=20,grow=true,n=0;
    var iv=setInterval(function(){ r+=grow?3:-3; if(r>34)grow=false; if(r<14)grow=true; try{c.setRadius(r);}catch(e){} if(++n>50){ clearInterval(iv); try{ map.removeLayer(c);}catch(e){} if(hl===c)hl=null; } },80);
  }
  function flyTo(o){ var map=M(); if(!map||typeof map.setView!=='function') return; try{ map.setView([o.lat,o.lng], Math.max((map.getZoom&&map.getZoom())||0,18), {animate:true}); }catch(e){} highlight(o); }

  function render(){
    var box=d.getElementById("aybBulList"); if(!box) return;
    var rs=results();
    var head=d.getElementById("aybBulHead");
    if(head) head.textContent = curTrafo ? ('“'+curTrafo+'” trafosuna bağlı direkler: '+rs.length) : (rs.length+' sonuç');
    if(!rs.length){ box.innerHTML='<div style="padding:12px;color:#7a8699;font-size:13px;">Sonuç yok.</div>'; return; }
    var h="";
    rs.forEach(function(r,i){
      h+='<div class="aybBulRow" data-i="'+i+'" style="display:flex;align-items:center;gap:8px;padding:8px 10px;border-bottom:1px solid #eef1f6;cursor:pointer;">'
        +'<span style="font-size:16px;">'+tIcon(r.type)+'</span>'
        +'<span style="font-weight:800;color:#0f2c66;min-width:70px;">'+tLabel(r.type)+'</span>'
        +'<span style="font-weight:700;">No: '+r.no+'</span>'
        +'<span style="color:#64748b;font-size:12px;flex:1;text-align:right;">'+(r.tip||"")+'</span>'
        +(r.type==="trafo"?'<button class="aybBulBagli" data-i="'+i+'" style="border:none;border-radius:6px;background:#0e7490;color:#fff;padding:4px 8px;font-size:11px;font-weight:700;cursor:pointer;">Bağlı direkler</button>':'')
        +'</div>';
    });
    box.innerHTML=h;
    box._rs=rs;
    Array.prototype.forEach.call(box.querySelectorAll(".aybBulRow"), function(row){
      row.addEventListener("click", function(e){ if(e.target && e.target.classList.contains("aybBulBagli")) return; var i=+row.getAttribute("data-i"); var r=box._rs[i]; if(r) flyTo(r.o); });
    });
    Array.prototype.forEach.call(box.querySelectorAll(".aybBulBagli"), function(btn){
      btn.addEventListener("click", function(e){ e.stopPropagation(); var i=+btn.getAttribute("data-i"); var r=box._rs[i]; if(r){ curTrafo=r.no; curType="direk"; curQuery=""; var inp=d.getElementById("aybBulInput"); if(inp) inp.value=""; syncChips(); render(); } });
    });
  }
  function syncChips(){
    Array.prototype.forEach.call(d.querySelectorAll(".aybBulChip"), function(c){
      var on=(c.getAttribute("data-t")===curType && !curTrafo);
      c.style.background=on?"#2563eb":"#e8edf5"; c.style.color=on?"#fff":"#33415a";
    });
    var clr=d.getElementById("aybBulClrTrafo"); if(clr) clr.style.display=curTrafo?"inline-block":"none";
  }

  function panel(){
    if(d.getElementById("aybBulPanel")) return d.getElementById("aybBulPanel");
    var el=d.createElement("div"); el.id="aybBulPanel";
    el.style.cssText="position:fixed;top:96px;left:10px;z-index:2147481000;width:340px;max-width:92vw;background:#fff;border:1px solid #c7d0de;border-radius:12px;box-shadow:0 16px 40px rgba(0,0,0,.35);font:13px system-ui,Arial;display:none;overflow:hidden;";
    el.innerHTML=
      '<div style="display:flex;align-items:center;gap:8px;background:#0f2c66;color:#fff;padding:9px 12px;">'
        +'<span style="font-weight:800;">🔍 Bul</span>'
        +'<span id="aybBulHead" style="font-size:11px;opacity:.85;flex:1;"></span>'
        +'<button id="aybBulClose" style="border:none;background:#ef4444;color:#fff;border-radius:6px;width:24px;height:24px;font-size:15px;cursor:pointer;">×</button>'
      +'</div>'
      +'<div style="padding:8px 10px;">'
        +'<input id="aybBulInput" type="text" placeholder="No veya tip yaz (örn: 12, TR01, box)" style="width:100%;height:34px;padding:4px 10px;border:1px solid #c7d0de;border-radius:8px;box-sizing:border-box;">'
        +'<div style="display:flex;gap:5px;flex-wrap:wrap;margin-top:7px;">'
          +'<button class="aybBulChip" data-t="all" style="border:none;border-radius:14px;padding:4px 10px;font-size:12px;font-weight:700;cursor:pointer;">Tümü</button>'
          +'<button class="aybBulChip" data-t="direk" style="border:none;border-radius:14px;padding:4px 10px;font-size:12px;font-weight:700;cursor:pointer;">Direk</button>'
          +'<button class="aybBulChip" data-t="trafo" style="border:none;border-radius:14px;padding:4px 10px;font-size:12px;font-weight:700;cursor:pointer;">Trafo</button>'
          +'<button class="aybBulChip" data-t="box" style="border:none;border-radius:14px;padding:4px 10px;font-size:12px;font-weight:700;cursor:pointer;">Box</button>'
          +'<button class="aybBulChip" data-t="kofre" style="border:none;border-radius:14px;padding:4px 10px;font-size:12px;font-weight:700;cursor:pointer;">Kofre</button>'
          +'<button id="aybBulClrTrafo" style="display:none;border:none;border-radius:14px;padding:4px 10px;font-size:12px;font-weight:700;cursor:pointer;background:#f59e0b;color:#fff;">↩ Trafo filtresini kaldır</button>'
        +'</div>'
      +'</div>'
      +'<div id="aybBulList" style="max-height:52vh;overflow:auto;border-top:1px solid #eef1f6;"></div>';
    d.body.appendChild(el);
    d.getElementById("aybBulClose").onclick=function(){ el.style.display="none"; };
    var inp=d.getElementById("aybBulInput");
    inp.addEventListener("input", function(){ curQuery=inp.value; curTrafo=""; syncChips(); render(); });
    Array.prototype.forEach.call(el.querySelectorAll(".aybBulChip"), function(c){
      c.addEventListener("click", function(){ curType=c.getAttribute("data-t"); curTrafo=""; syncChips(); render(); });
    });
    d.getElementById("aybBulClrTrafo").onclick=function(){ curTrafo=""; curType="all"; syncChips(); render(); };
    return el;
  }
  function openBul(){ var el=panel(); el.style.display="block"; curTrafo=""; syncChips(); render(); var inp=d.getElementById("aybBulInput"); setTimeout(function(){ try{inp.focus();}catch(e){} },60); }
  window.aybOpenBul=openBul;

  function injectBtn(){
    if(d.getElementById("aybBulBtn")) return true;
    var bar=d.querySelector(".workbar")||d.querySelector(".ayb-native-clean-workbar");
    if(!bar) return false;
    var b=d.createElement("button");
    b.id="aybBulBtn"; b.type="button";
    b.textContent="🔍 Bul";
    b.style.cssText="height:26px;padding:0 12px;border:none;border-radius:7px;background:#0f2c66;color:#fff;font-weight:800;font-size:12px;cursor:pointer;margin-right:6px;";
    b.onclick=function(e){ try{e.preventDefault();e.stopPropagation();}catch(_){} openBul(); };
    bar.insertBefore(b, bar.firstChild);
    return true;
  }
  var t=0, iv=setInterval(function(){ if(injectBtn()|| ++t>60) clearInterval(iv); },500);
})();

/* ===================== SEMBOL ÖLÇEĞİ (baskı ölçeğine 1/N göre, sabit/kapaklı) ===================== */
(function(){
  "use strict";
  var d=document;
  function M(){ return window.__aybMap||window.map||null; }
  var REF=1000, MIN=0.30, MAX=1.0; /* 1/1000 ve daha yakın = tam boy; uzaklaştıkça küçülür; 1.0'ı ASLA aşmaz */
  function appScaleN(){ try{ var el=d.getElementById("statusScale"); if(el){ var m=String(el.textContent||"").replace(/\./g,"").match(/1\s*\/\s*(\d+)/); if(m) return parseFloat(m[1]); } }catch(e){} return null; }
  function symScale(){
    var N=appScaleN();
    if(N&&isFinite(N)&&N>0){ var s=REF/N; if(s<MIN)s=MIN; if(s>MAX)s=MAX; return s; }
    var map=M(); if(map&&typeof map.getZoom==='function'){ var s2=Math.pow(2,((map.getZoom()||18)-18)); if(s2<MIN)s2=MIN; if(s2>MAX)s2=MAX; return s2; }
    return 1;
  }
  function css(){
    if(d.getElementById("aybSymScaleCss")) return;
    var st=d.createElement("style"); st.id="aybSymScaleCss";
    st.textContent=
      ".leaflet-marker-pane .symbol{ transform: scale(var(--ayb-sym-scale,1)) !important; transform-origin:30px 20px !important; }"+
      ".leaflet-marker-pane .symbol .hit{ transform: translate(-50%,-50%) scale(calc(1 / var(--ayb-sym-scale,1))) !important; }";
    (d.head||d.documentElement).appendChild(st);
  }
  var _sonOlcek=null, _symRaf=0;
  function applyNow(){
    _symRaf=0;
    try{
      var v=symScale();
      var yv=(typeof v==='number')? v.toFixed(3) : String(v);
      if(yv===_sonOlcek) return;              /* değişmediyse dokunma (tüm sayfa yeniden hesaplanmasın) */
      _sonOlcek=yv;
      d.documentElement.style.setProperty("--ayb-sym-scale", v);
    }catch(e){}
  }
  function apply(){ if(_symRaf) return; _symRaf=(window.requestAnimationFrame||function(f){return setTimeout(f,16);})(applyNow); }
  var bound=false;
  function bind(){ var map=M(); if(!map||bound) return; try{ map.on("zoomend",apply); map.on("moveend",apply); bound=true; }catch(e){} }
  function boot(){ css(); apply(); var t=0, iv=setInterval(function(){ css(); bind(); apply(); if(++t>40) clearInterval(iv); },500); setInterval(apply,1500); }
  if(d.readyState!=="loading") boot(); else d.addEventListener("DOMContentLoaded", boot);
})();


/* ===================== DXF FONT GÖMME + ORİJİNAL RENKLER ===================== */
(function(){
  "use strict";
  var d=document;
  /* --- gömülü TTF fontlar (AutoCAD T_Romans + B_Cad) --- */
  function fonts(){
    if(d.getElementById("aybCadFontCss")) return;
    var st=d.createElement("style"); st.id="aybCadFontCss";
    st.textContent=
      "@font-face{font-family:'AYB_TRomans';font-display:swap;src:url(data:font/ttf;base64,AAEAAAAPAIAAAwBwT1MvMnvYQKwAAAF4AAAAYFBDTFTBAaCgAACnbAAAADZjbWFwToMHlQAABqwAAAZuY3Z0IAGm/jcAAA/8AAAADGZwZ20iUD7FAAANHAAAArVnYXNwABcAAwAAp1wAAAAQZ2x5ZhJKLIkAABJ0AACOAGhlYWTY9Na8AAAA/AAAADZoaGVhD9gHswAAATQAAAAkaG10eJxWCU8AAAHYAAAE1GxvY2Gjf8bQAAAQCAAAAmxtYXhwA1ADEgAAAVgAAAAgbmFtZawTUGkAAKB0AAAB5HBvc3RWMPFXAACiWAAABQRwcmVwywI4HgAAD9QAAAAlAAEAAAABAAA9tRswXw889QAZCAAAAAAAsvdOaQAAAAC/Hj2LAAT9/AewB9cAAAAAAAAAAAAAAAAAAQAAB5z9/ACFCIcABP/6B7AAAQAAAAAAAAAAAAAAAAAAATUAAQAAATUAXAAGAAAAAAABAAAAAAAUAAACAAK1AAAAAAACBPMBkAAFAAEFmgUzAAABJQWaBTMAAAOgAGYCEgAAAgAEAAAAAAAAAAAAAgcAAAAAAAAAAAAAAABBTFRTAEAAIOECBfL9+gCFB5wCBAAAAf8AAAAAA/YF8gAAACAAAAYCAAAHaAEKBboABAW6AJMCXgEfAu4BGQQMARkGAgDnBboA1wchAR8HaADXAu4BGQQMAR8EDADbBJwA3wdoAS8C7gEZAu4BGQZKAJEFugDXBboBtgW6AMEFugDZBboAxwW6ANkFugEfBboA5wW6ANcFugEfAu4BGQLuARkG2QEOB2gBLwbZAScFKwEfB7AA1wUrAEoHIQEfByEA1wYCAR8FcwEfBSsBHwYCANcGkQEfAl4BHwScAI8GSgEfBJwBHwbZAR8GSgEfBkoA1wYCAR8GSgDXBgIBHwW6AR8EnABYBkoBHwUrAEoG2QCPBboA2QUrAEwFugDJA30A1wZKAJEDfQCgBkoA3wchAKAC7gEfBXMA1wVzAR8FKwDXBXMA1wUrANcDfQCgBXMA1wVzAR8CXgDRAu4AXATjAR8CXgEfCIcBHwVzAR8FcwDXBXMBHwVzANcDxQEfBOMA1QN9AKAFcwEfBJwAkQZKANcE4wDbBJwAWATjAMcEDAEKAl4BHwQMAScHIQDXA8UBGQUrANcFKwDBBkoATAW6ANcDxQEfBSsA0QKmAEgHaAEvA8UBHwUrANsFKwDXBSsASgUrAEoFKwBKBSsASgUrAEoFKwBKBXMASgchANcFcwEfBXMBHwVzAR8FcwEfAl4AkwJeAR8CXgCTAl4AQgZKAR8GAgCPBgIAjwYCAI8GSgDXBkoA1wZKANcGSgEfBkoBHwZKAR8GSgEfBSsA2wVzANcFcwDXBXMA1wVzANcFcwDXBXMA1wW6ANcFKwDXBSsA1wUrANcFKwDXBSsA1wM1AN8DNQDfAzUA3QM1ANEFcwEfBXMA1wVzANcFcwDXBXMA1wVzANcFKwEvBboA1wVzAR8FcwEfBXMBHwVzARkEnABYBkoA1wdoAS8GSgDXB0gBDwdIAR8GAgAABSsAkwM1ASEFugEfBOMA1QW6AMkGSgEfBgIA1wUrANcHaAEvBSsASgUrANcGAgDTBOMAxwdoAS8FmwBICCEAAAf4AScH+AEnCCEAAAYCAFgFKwBMBgIBHwVzANcEnABYBXMBHwVzANcGAgEfBXMA1wVzAR8FKwDXBXMBHwUrANcGSgEfBXMBHwZKAR8FcwEfBkoA1wVzANcGAgEfA8UA2wW6ANcE4wDTBJwAWAN9AKAGSgEfBXMBHwZKAR8FcwEfBboAyQTjAMcFugDJBOMAxwUrAEoGAgEfBkoBHwTjAR8G2QCPBXMBHwbZAEwFKwBQBkoBHwZKAR8FugEfBboAUAbZAR8GSgEfBkoA1wZKAR8FugEfBboA1wScAFgEnABKB2gA1wScAEoGSgEfBgIA1wg/AR8IPwEfBgIAWAbZAR8FugEfBXMAkwdoAR8FugCPBXMA1wVzAR8FcwEfBOMA1wVzANcFKwDXBkoATAQMAFIFcwEfBXMBHwScAR8FKwDnBkoBHwVzAR8FcwDXBXMBHwVzAR8E4wDXB/gBHwQMABAGSgDXA8UATAVzAR8FKwDXB/gBHwf4AR8FKwBYBgIBHwUrAR8E4wCTBtkBHwTjANcGSgDXBXMA1wW6AR8DFACIBZkAxwUKADgFmQDHAxQAiAa4AMYGuAEOBikAPgdIAR8GuAEOBnEBDgcBAQ4E/ADgBcMA4AXDAOYF3ADmA9gBPgAAAAQAAAADAAAAJAABAAAAAAJcAAMAAQAABBIAAwAKAAAGXgAEAjgAAAByAEAABQAyACAALAAtAH4AgACNAKMApQCnAKsArQCyALUAvgDPANYA3ADeAO8A8AD8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BDEAAAADAR//8gRUBawABQALAB0AJbgACiu6AAAAAgANKwC4AAQvuAAOL7gAHC+6AAwADgAEERI5MDEBByc1NxcHNScHFRcBDwEjLwERMxEfATM/AREzESMDfaCgoKAhf39/AVa8lt+aSSBGhc+J0SEhBLlQUKRPT5B7QEB7P/xqvkhK4QLP/TXNQ0XPAsf8FAAAAAADAR//8gUrB9cAAwAHABsAG7gACiu6AAAABQANKwC4AAIvuAAGL7gACy8wMQEjETMBIxEzAQ8CIy8CETMRHwIzPwIRMwPFISH+4SEhAoVKld2U3ZZJIEaJ0YvRikUhBnEBZv6aAWb51d2VSEiV3QQ2+8/RikVFitEEMQAAAwEf//IEVAYpAAMABwAZACm4AAorugAAAAUADSsAuAACL7gABi+4AAovuAAYL7oACAAKAAIREjkwMQEjETMBIxEzAQ8BIy8BETMRHwEzPwERMxEjA30hIf6aISECHLyW35pJIEaFz4nRISEFCwEe/uIBHvrPvkhK4QLP/TXNQ0XPAsf8FAAAAAIAyf/yBPIHnAAHAAsALbgACisAuAADL7gACS+6AAAAAwAJERI5ugABAAMACRESOboABQADAAkREjkwMQkBIRUhASE1LQEXBQTy/BQDzfv2A+v8MwFdAR4V/uEF8vofHwXfIdPXGdcAAgDH//IEHQUZAAcACwAtuAAKKwC4AAkvuAADL7oAAAADAAkREjm6AAEAAwAJERI5ugAFAAMACRESOTAxCQEhFSEBITUlNxcHBB386wL0/MsDFP0MARfXENcD/PwVHwPqII6PHY8AAAACAMn/8gTyBzQABwARAC24AAorALgAAy+4AAovugAAAAMAChESOboAAQADAAoREjm6AAUAAwAKERI5MDEJASEVIQEhNSU0MzIWFRQGIyIE8vwUA8379gPr/DMBr0ceKioeRwXy+h8fBd8h+kgqHh4qAAAAAAIAx//yBB0FCwAHABEALbgACisAuAALL7gAAy+6AAAAAwALERI5ugABAAMACxESOboABQADAAsREjkwMQkBIRUhASE1JTQ2MzIVFCMiJgQd/OsC9PzLAxT9DAFEKh5HRx4qA/z8FR8D6iDHHipISCoAAAAAAgBK//wE4QXiAAcACgAxuAAKKwC4AAEvuAAEL7gABi+6AAgAAQAGERI5ugAJAAEABhES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AFQAXwBSAE8ATQBBAE4AUwA6AFYAZQByAHMAaQBvAG4AIAAxAC4AMAAwAFYAZQByAHMAaQBvAG4AIAAxAC4AMAAwACAAQQB1AGcAdQBzAHQAIAA5ACwAIAAyADAAMAA1ACwAIABpAG4AaQB0AGkAYQBsACAAcgBlAGwAZQBhAHMAZQBUAF8AUgBvAG0AYQBuAFMAUgBlAGcAdQBsAGEAcgACAAAAAAAA/3sAFAAAAAAAAAAAAAAAAAAAAAAAAAAAATUAAACUAJcAuwDXAAQABQAGAAcACAAJAAoACwAMAA0ADgAPABEAEgATABQAFQAWABcAGAAZABoAGwAcAB0AHgAfACAAIQAiACMAJAAlACYAJwAoACkAKgArACwALQAuAC8AMAAxADIAMwA0ADUANgA3ADgAOQA6ADsAPAA9AD4APwBAAEEAQgBDAEQARQBGAEcASABJAEoASwBMAE0ATgBPAFAAUQBSAFMAVABVAFYAVwBYAFkAWgBbAFwAXQBeAF8AYABhAKMAhACFAJYAhgCdAKkAgwCTAJ4AqgCiAK0AyQDHAK4AYgBjAJAAZADLAGUAyADKAM8AzADNAM4AZgDTANAA0QCvAGcAkQDWANQA1QBoAIkAagBpAGsAbQBsAG4AoABvAHEAcAByAHMAdQB0AHYAdwB4AHoAeQB7AH0AfAC4AKEAfwB+AIAAgQC6AQIAEACSAKcAjwADAOIA4wDkAOUA5gCfAP8BAADvAQMA/gD9AOcBBAEFAQYA9QD0APYA6QDrAO0A6gDsAO4BBwEIAQkBCgELAQwBDQEOAQ8BEAERARIBEwEUARUBFgEXARgBGQEaARsBHAEdAR4BHwEgASEBIgEjASQBJQEmAScBKAEpASoBKwEsAS0BLgEvATABMQEyATMBNAE1ATYBNwE4ATkBOgE7ATwBPQE+AT8BQAFBAUIBQwFEAUUBRgFHAUgBSQFKAUsBTAFNAU4BTwFQAVEBUgFTAVQBVQFWAVcBWAFZAVoBWwFcAV0BXgFfAWABYQFiAWMBZADyAWUAqAFmAWcBaAFpAWoBawFsAW0BbgD7APwA+AD5AW8Db2htB0FvZ29uZWsLaHlwaGVubWludXMHdW5pMjBBQwRjMTQxB2FvZ29uZWsGRGNhcm9uBmRjYXJvbgdFb2dvbmVrB2VvZ29uZWsGRWNhcm9uBmVjYXJvbgZOYWN1dGUGbmFjdXRlBk5jYXJvbgZuY2Fyb24JT2RibGFjdXRlCW9kYmxhY3V0ZQZSY2Fyb24GcmNhcm9uBlNhY3V0ZQZzYWN1dGUGVGNhcm9uBnRjYXJvbgVVcmluZwV1cmluZwlVZGJsYWN1dGUJdWRibGFjdXRlBlphY3V0ZQZ6YWN1dGUEWmRvdAR6ZG90BkFjeXJpbAJCZQJWZQJHZQJEZQJJZQNaaGUCWmUCSWkHSWlicmV2ZQJLYQJFbAJFbQJFbgZPY3lyaWwHUGVjeXJpbAJFcgJFcwJUZQZVY3lyaWwCRWYDS2hhA1RzZQNDaGUDU2hhBVNoY2hhBEhhcmQEWWVyaQRTb2Z0CUVjeXJpbHJldgJJdQJJYQZhY3lyaWwCYmUCdmUCZ2UCZGUCaWUDemhlAnplAmlpB2lpYnJldmUCa2ECZWwCZW0CZW4Gb2N5cmlsB3BlY3lyaWwCZXICZXMCdGUGdWN5cmlsAmVmA2toYQN0c2UDY2hlA3NoYQVzaGNoYQRoYXJkBHllcmkEc29mdAllY3lyaWxyZXYCaXUCaWEHcGVzZXRhcwhlbXB0eXNldAVob3VzZQhwaGlsYXRpbgNwaGkLdHdvaW5mZXJpb3ICQ0wMcHJvcGVydHlsaW5lBWFuZ2xlC2VxdWl2YWxlbmNlDGJvdW5kYXJ5bGluZQhmbG93bGluZQxtb251bWVudGxpbmUB3QAAAAMACAAAABAAAP//AAAAAQAAAAAAAAAAAAAAQAAAAAAAACAgICAgICAgICAgICAgICAAAAAAAAAAACAgICAgIAAAAAAAAA==) format('truetype');}"+
      "@font-face{font-family:'AYB_BCad';font-display:swap;src:url(data:font/ttf;base64,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UgBpAGcAaAB0AHMAIABSAGUAcwBlAHIAdgBlAGQALgAgAKkAIAAyADAAMAA1ACAAQgBNAFUASAAuAEwAVABEAFMAVABJACwAIABJAG4AYwAuACAAQQBsAGwAIABSAGkAZwBoAHQAcwAgAFIAZQBzAGUAcgB2AGUAZAAuAFIAZQBnAHUAbABhAHIAQgBfAEMAQQBEADoAVgBlAHIAcwBpAG8AbgAgADEALgAwADAAVgBlAHIAcwBpAG8AbgAgADEALgAwADAAIABTAGUAcAB0AGUAbQBiAGUAcgAgADEAMQAsACAAMgAwADEANQAsACAAaQBuAGkAdABpAGEAbAAgAHIAZQBsAGUAYQBzAGUAQgBfAEMAQQBEACAAaQBzACAAYQAgAHQAcgBhAGQAZQBtAGEAcgBrACAAbwBmACAAQgBNAFUASAAgAEwAVABEACAAUwBUAEkALgBUAGgAaQBzACAAZgBvAG4AdAAgAGkAcwAgAG0AYQBkAGUAIAB3AGkAdABoACAAdABoAGUAIABoAG8AbQBlACAAZQBkAGkAdABpAG8AbgAgAG8AZgAgAEYAbwBuAHQAQwByAGUAYQB0AG8AcgAuACAAWQBvAHUAIABtAGEAeQAgAG4AbwB0ACAAdQBzAGUAIAB0AGgAaQBzACAAZgBvAG4AdAAgAGYAbwByACAAYwBvAG0AbQBlAHIAYwBpAGEAbAAgAHAAdQByAHAAbwBzAGUAcwAuAGgAdAB0AHAAOgAvAC8AdwB3AHcALgBoAGkAZwBoAC0AbABvAGcAaQBjAC4AYwBvAG0ALwBmAG8AbgB0AGMAcgBlAGEAdABvAHIALwBmAG8AbgB0AGwAaQBjAGUAbgBzAGUALgBoAHQAbQBsAAACAAAAAAAA/zgAZAAAAAAAAAAAAAAAAAAAAAAAAAAAADMBAgEDAQQBBQADAQYBBwEIAQkBCgELAQwBDQEOAQ8BEAERARIBEwEUARUBFgEXARgBGQEaARsBHAEdAR4BHwEgASEBIgEjASQBJQEmAScBKAEpASoBKwEsAS0BLgEvATABMQEyAEkCXzAHTEVEWUVOSQdDSVZBTUVWBkxFRE1FVg1GTE9SQVNBTkxBTUJBEENJVkFCVUhBUkxJTEFNQkESU09EWVVNQlVIQVJMSUxBTUJBBVlfQVlEBUJfQVlEBUlfQVlEBFlfT0cETV9PRwRCX09HBVlBX09HBElfT0cGWUFfQk9YBU1fQk9YBVlfQk9YBUlfQk9YBllBX0FZRAVNX0FZRARZX0FHBE1fQUcEQl9BRwVZQV9BRwRJX0FHC1lBX0FHX0tBRkVTCk1fQUdfS0FGRVMKQl9BR19LQUZFUwpZX0FHX0tBRkVTCklfQUdfS0FGRVMKVE9QUkFLTEFNQQZjcm9zczUKTV9PR19LQUZFUwpCX09HX0tBRkVTCklfT0dfS0FGRVMKWV9PR19LQUZFUwtZQV9PR19LQUZFUwZBX0tPTFUCeDcFQl9CT1gHTV9LT0ZSRQdZX0tPRlJFEElTTF9UT1BSQUtMQU1BU0kHQl9LT0ZSRQdJX0tPRlJFCFlBX0tPRlJFA180NwlTT0RZVU1NRVYAAAAAAAH//wAA) format('truetype');}"+
      ".ayb-cad-text{white-space:nowrap;}";
    (d.head||d.documentElement).appendChild(st);
  }

  /* --- ACI (AutoCAD renk indeksi) -> RGB --- */
  var ACI={1:'#ff3b30',2:'#ffe000',3:'#34e04a',4:'#00e5ff',5:'#2b8cff',6:'#ff45c8',7:'#ffffff',8:'#c8c8c8',9:'#ffe000',
    10:'#ff3b30',12:'#ff6a4d',30:'#ff9500',32:'#ff5a3c',40:'#ffb300',50:'#eaff00',
    60:'#9dff00',70:'#34e04a',90:'#00ff9d',130:'#00d0ff',140:'#00b3ff',150:'#00d0ff',
    160:'#7c5cff',170:'#c04cff',190:'#ff5ecb',200:'#ff3b8e',
    250:'#d0d0d0',251:'#dcdcdc',252:'#e6e6e6',253:'#efefef',254:'#f6f6f6',255:'#ffffff'};
  function aci(n){ n=parseInt(n,10); if(!isFinite(n)) return null; if(ACI[n]) return ACI[n]; if(n<1) return null; var h=(n*47)%360; return 'hsl('+h+',95%,62%)'; }

  /* --- DXF parser (renk okuyan sürüm) — orijinal aybCadToLatLng kullanır --- */
  function parseDxfColor(text,meridian){
    var raw=String(text||'').replace(/\r/g,'').split('\n');
    var pairs=[]; for(var i=0;i<raw.length-1;i+=2){ pairs.push({code:raw[i].trim(), value:(raw[i+1]||'').trim()}); }
    var features=[], layerColors={}, curPoly=null, blocks={}, inBlock=null, styleFonts={};
    var num=function(v){ var n=parseFloat(String(v||'').replace(',','.')); return isFinite(n)?n:0; };
    function cleanTxt(s){ s=String(s==null?'':s);
      s=s.replace(/\\P/g,' ').replace(/\\~/g,' ');
      s=s.replace(/\\[A-Za-z][^;\\]*;/g,'');   /* \fArial|..; \H2.5x; \A1; vb. */
      s=s.replace(/[{}]/g,'');
      s=s.replace(/%%[dD]/g,'°').replace(/%%[cC]/g,'Ø').replace(/%%[pP]/g,'±').replace(/%%%/g,'%').replace(/%%\d+/g,'');
      s=s.replace(/\s+/g,' ').trim();
      s=s.replace(/^\?+/,'').replace(/\?+$/,'').trim();   /* dışa aktarımda kaybolan özel karakterin yerine gelen '?' artıklarını temizle */
      return s;
    }
    function readEntity(start){ var type=pairs[start].value, arr=[], j=start+1; while(j<pairs.length && pairs[j].code!=='0'){ arr.push(pairs[j]); j++; } return {type:type,arr:arr,next:j}; }
    function first(arr,code){ for(var k=0;k<arr.length;k++){ if(arr[k].code===String(code)) return arr[k].value; } return ''; }
    function imarRenk(){ try{ var el=document.getElementById('cadColor'); if(el&&el.value) return el.value; }catch(e){} return '#2b6bff'; }
    function isDrawing(nm){ var kw=['DIREK','TRAFO','HAT_','LAMBA','ETIKET','REGLAJ','EUD','KOFRE','SDK','PANO','AYDINLAT','KULLANICI']; for(var q=0;q<kw.length;q++){ if(nm.indexOf(kw[q])>=0) return true; } return false; }
    function colorOf(arr,layer){
      var nm=String(layer||'').toLocaleUpperCase('tr');
      if(!isDrawing(nm)) return imarRenk();     /* imar -> tek renk (arka plan) */
      var e=parseInt(first(arr,62),10);
      var acv=(isFinite(e)&&e>0)?e:layerColors[layer];
      return aci(acv) || '#ffe000';             /* çizim -> ORİJİNAL ACI rengi (AutoCAD gibi) */
    }
    function LW(arr){ var pts=[], lastX=null; arr.forEach(function(p){ if(p.code==='10') lastX=num(p.value); if(p.code==='20'&&lastX!=null){ pts.push(window.aybCadToLatLng(lastX,num(p.value),meridian)); lastX=null; } }); return pts; }
    function circle(cx,cy,r,sd,ed){ var pts=[], s=(sd||0)*Math.PI/180, e=(ed==null?360:ed)*Math.PI/180; if(e<s)e+=Math.PI*2; var steps=Math.max(18,Math.ceil(Math.abs(e-s)/(Math.PI*2)*72)); for(var k=0;k<=steps;k++){ var a=s+(e-s)*k/steps; pts.push(window.aybCadToLatLng(cx+Math.cos(a)*r,cy+Math.sin(a)*r,meridian)); } return pts; }
    function finalize(){ if(curPoly && curPoly.points && curPoly.points.length>=2) features.push(curPoly); curPoly=null; }
    function cadPtsOf(type,arr){
      if(type==='LINE'){ return {type:'LINE', cad:[[num(first(arr,10)),num(first(arr,20))],[num(first(arr,11)),num(first(arr,21))]]}; }
      if(type==='LWPOLYLINE'){ var pts=[], lx=null; arr.forEach(function(p){ if(p.code==='10') lx=num(p.value); else if(p.code==='20'&&lx!=null){ pts.push([lx,num(p.value)]); lx=null; } }); if((num(first(arr,70))&1)&&pts.length>2)pts.push(pts[0]); return {type:'LWPOLYLINE', cad:pts}; }
      if(type==='CIRCLE'){ var cx=num(first(arr,10)),cy=num(first(arr,20)),r=num(first(arr,40)),cd=[]; for(var k=0;k<=36;k++){ var a=k/36*2*Math.PI; cd.push([cx+Math.cos(a)*r,cy+Math.sin(a)*r]); } return {type:'CIRCLE', cad:cd}; }
      if(type==='ARC'){ var ax=num(first(arr,10)),ay=num(first(arr,20)),ar=num(first(arr,40)),s=num(first(arr,50))*Math.PI/180,e=num(first(arr,51))*Math.PI/180; if(e<s)e+=2*Math.PI; var st=Math.max(8,Math.ceil((e-s)/(2*Math.PI)*36)),cd=[]; for(var k=0;k<=st;k++){ var a=s+(e-s)*k/st; cd.push([ax+Math.cos(a)*ar,ay+Math.sin(a)*ar]); } return {type:'ARC', cad:cd}; }
      if(type==='SOLID'||type==='3DFACE'){ var p0=[num(first(arr,10)),num(first(arr,20))],p1=[num(first(arr,11)),num(first(arr,21))],p2=[num(first(arr,12)),num(first(arr,22))],p3f=first(arr,13),p3=(p3f!=='')?[num(p3f),num(first(arr,23))]:p2; return {type:'SOLID', cad:[p0,p1,p3,p2,p0]}; }
      return null;
    }
    function toLL(cad){ return cad.map(function(p){ return window.aybCadToLatLng(p[0],p[1],meridian); }); }
    var i2=0;
    while(i2<pairs.length){
      if(pairs[i2].code!=='0'){ i2++; continue; }
      var ent=readEntity(i2), type=String(ent.type||'').toUpperCase(), arr=ent.arr; i2=ent.next;
      if(type==='EOF'){ finalize(); break; }
      if(type==='LAYER'){ var ln=first(arr,2), lc=parseInt(first(arr,62),10); if(ln) layerColors[ln]=isFinite(lc)?Math.abs(lc):null; continue; }
      if(type==='STYLE'){ var sn=first(arr,2), sf=first(arr,3); if(sn) styleFonts[String(sn).toLocaleUpperCase('tr')]=String(sf||'').toLocaleUpperCase('tr'); continue; }
      var lay=first(arr,8)||'';
      if(type==='BLOCK'){ inBlock=first(arr,2)||('blk'+i2); blocks[inBlock]={base:[num(first(arr,10)),num(first(arr,20))], ents:[]}; continue; }
      if(type==='ENDBLK'){ inBlock=null; continue; }
      if(inBlock){ var cp0=cadPtsOf(type,arr); if(cp0 && cp0.cad && cp0.cad.length>=2) blocks[inBlock].ents.push(cp0); continue; }
      if(type==='INSERT'){
        var bn=first(arr,2), bd=blocks[bn]; if(!bd) continue;
        var ix=num(first(arr,10)), iy=num(first(arr,20)), sx=num(first(arr,41))||1, sy=num(first(arr,42))||1, ro=num(first(arr,50))*Math.PI/180, cs=Math.cos(ro), sn=Math.sin(ro), col=colorOf(arr,lay);
        bd.ents.forEach(function(e){
          var wp=e.cad.map(function(pt){ var x=(pt[0]-bd.base[0])*sx, y=(pt[1]-bd.base[1])*sy; return window.aybCadToLatLng(ix+(x*cs-y*sn), iy+(x*sn+y*cs), meridian); });
          if(wp.length>=2) features.push({type:e.type,layer:lay,color:col,points:wp});
        });
        continue;
      }
      if(type==='POLYLINE'){ finalize(); curPoly={type:'POLYLINE',layer:lay,color:colorOf(arr,lay),points:[]}; continue; }
      if(type==='VERTEX' && curPoly){ var vx=first(arr,10), vy=first(arr,20); if(vx!==''&&vy!=='') curPoly.points.push(window.aybCadToLatLng(num(vx),num(vy),meridian)); continue; }
      if(type==='SEQEND'){ finalize(); continue; }
      if(type==='LINE'){ var x1=first(arr,10),y1=first(arr,20),x2=first(arr,11),y2=first(arr,21); if(x1!==''&&y1!==''&&x2!==''&&y2!=='') features.push({type:'LINE',layer:lay,color:colorOf(arr,lay),points:[window.aybCadToLatLng(num(x1),num(y1),meridian),window.aybCadToLatLng(num(x2),num(y2),meridian)]}); }
      else if(type==='LWPOLYLINE'){ var pts=LW(arr); var flags=num(first(arr,70)); if((flags&1)&&pts.length>2)pts.push(pts[0]); if(pts.length>=2) features.push({type:'LWPOLYLINE',layer:lay,color:colorOf(arr,lay),points:pts}); }
      else if(type==='CIRCLE'){ var cx=first(arr,10),cy=first(arr,20),r=first(arr,40); if(cx!==''&&cy!==''&&r!=='') features.push({type:'CIRCLE',layer:lay,color:colorOf(arr,lay),points:circle(num(cx),num(cy),num(r),0,360)}); }
      else if(type==='ARC'){ var ax=first(arr,10),ay=first(arr,20),ar=first(arr,40),as=first(arr,50),ae=first(arr,51); if(ax!==''&&ay!==''&&ar!=='') features.push({type:'ARC',layer:lay,color:colorOf(arr,lay),points:circle(num(ax),num(ay),num(ar),num(as||0),num(ae||360))}); }
      else if(type==='POINT'){ var ppx=first(arr,10),ppy=first(arr,20); if(ppx!==''&&ppy!==''){ var pcx=num(ppx),pcy=num(ppy),pr=1.1,pcp=[]; for(var pk=0;pk<=8;pk++){ var pa=pk/8*2*Math.PI; pcp.push(window.aybCadToLatLng(pcx+Math.cos(pa)*pr,pcy+Math.sin(pa)*pr,meridian)); } features.push({type:'LWPOLYLINE',layer:lay,color:colorOf(arr,lay),points:pcp}); } }
      else if(type==='SOLID'||type==='3DFACE'){ var cs2=cadPtsOf(type,arr); if(cs2){ var sp=toLL(cs2.cad); if(sp.length>=3) features.push({type:'LWPOLYLINE',layer:lay,color:colorOf(arr,lay),points:sp}); } }
      else if(type==='TEXT'||type==='MTEXT'){
        var tx=first(arr,10),ty=first(arr,20);
        var hj=parseInt(first(arr,72),10)||0, vj=parseInt(first(arr,73),10)||0;
        var ax=first(arr,11), ay=first(arr,21);
        var useA=((hj!==0||vj!==0)&&ax!==''&&ay!=='');
        var fx=useA?num(ax):num(tx), fy=useA?num(ay):num(ty);
        var raw3=''; for(var k3=0;k3<arr.length;k3++){ if(arr[k3].code==='3') raw3+=arr[k3].value; }
        var txt=raw3+(first(arr,1)||'');
        var th=parseFloat(String(first(arr,40)).replace(',','.'))||0;
        var tr=parseFloat(String(first(arr,50)).replace(',','.'))||0;
        txt=cleanTxt(txt);
        var stName=String(first(arr,7)||'STANDARD').toLocaleUpperCase('tr');
        var sfont=styleFonts[stName]||'';
        var fkind = (sfont.indexOf('B_CAD')>=0||sfont.indexOf('BCAD')>=0||stName.indexOf('DIREK')>=0||stName.indexOf('SEMBOL')>=0) ? 'bcad'
                  : (sfont.indexOf('ROMANS')>=0 ? 'romans' : 'normal');
        if(txt && (useA || (tx!==''&&ty!=='')) ) features.push({type:type,layer:lay,color:colorOf(arr,lay),point:window.aybCadToLatLng(fx,fy,meridian),text:txt,h:th,rot:tr,font:fkind,hj:hj,vj:vj});
      }
    }
    finalize();
    return features;
  }
  /* override: renk okuyan parser */
  try{ if(typeof window.aybParseDxfFeatures==='function'){ window.aybParseDxfFeatures=parseDxfColor; } }catch(e){}

  /* Not: renderCadLayers override KALDIRILDI — uygulamanın kendi (test edilmiş) render'ı kullanılıyor.
     Orijinal renkler için içe-aktarma sonrası katman renge göre bölünür (aşağıdaki kanca). */
  function boot(){ fonts(); try{ if(window.project && window.renderAll) window.renderAll(); }catch(e){} }
  if(d.readyState!=="loading") boot(); else d.addEventListener("DOMContentLoaded", boot);
  setTimeout(boot,1500);
})();


/* DXF içe alınca DOĞRU yere zoom: aybCadBounds'u uç-nokta elemeli (robust) yap */
(function(){
  "use strict";
  function pct(arr,q){ return arr[Math.max(0,Math.min(arr.length-1,Math.floor(arr.length*q)))]; }
  function robustBounds(features){
    if(typeof L==="undefined") return null;
    var pts=[];
    (features||[]).forEach(function(f){
      if(Array.isArray(f.points)) f.points.forEach(function(p){ pts.push(p); });
      if(f.point) pts.push(f.point);
    });
    pts=pts.filter(function(p){ return p && isFinite(p[0]) && isFinite(p[1]) && Math.abs(p[0])<=85 && Math.abs(p[1])<=180 && !(p[0]===0&&p[1]===0); });
    if(!pts.length) return null;
    var lats=pts.map(function(p){return p[0];}).sort(function(a,b){return a-b;});
    var lngs=pts.map(function(p){return p[1];}).sort(function(a,b){return a-b;});
    var la1=pct(lats,0.02), la2=pct(lats,0.98), ln1=pct(lngs,0.02), ln2=pct(lngs,0.98);
    if(!(isFinite(la1)&&isFinite(la2)&&isFinite(ln1)&&isFinite(ln2))) return null;
    var pLa=(la2-la1)*0.06||0.0006, pLn=(ln2-ln1)*0.06||0.0006;
    try{ return L.latLngBounds([[la1-pLa,ln1-pLn],[la2+pLa,ln2+pLn]]); }catch(e){ return null; }
  }
  function install(){ try{ if(typeof window.aybCadBounds==="function" && !window.__aybCadBoundsOvr){ window.aybCadBounds=robustBounds; window.__aybCadBoundsOvr=true; } }catch(e){} }
  window.aybZoomToCad=function(){
    try{
      var mp=window.__aybMap||window.map;
      if(!window.project||!Array.isArray(window.project.cadLayers)||!mp||typeof mp.fitBounds!=='function') return;
      var all=[]; window.project.cadLayers.forEach(function(l){ (l.features||[]).forEach(function(f){ all.push(f); }); });
      var b=robustBounds(all); if(b) mp.fitBounds(b,{padding:[40,40]});
    }catch(e){}
  };
  var t=0, iv=setInterval(function(){ install(); if(window.__aybCadBoundsOvr || ++t>40) clearInterval(iv); },500);
})();

/* "İçeri Al" (#btnCadImport) sonrası DXF'e otomatik zoom (yedek) */
(function(){
  "use strict";
  document.addEventListener("click", function(e){
    var t=e.target; while(t && t!==document){ if(t.id==="btnCadImport"){ hook(); return; } t=t.parentNode; }
  }, false);
  function splitByColor(){
    try{
      var p=window.project; if(!p||!Array.isArray(p.cadLayers)) return;
      var out=[];
      p.cadLayers.forEach(function(layer){
        if(layer.__split){ out.push(layer); return; }
        var groups={}, order=[];
        (layer.features||[]).forEach(function(f){
          var c=(f && f.color) ? f.color : (layer.color||'#0055ff');
          if(!groups[c]){ groups[c]=[]; order.push(c); }
          groups[c].push(f);
        });
        if(order.length<=1){ layer.color=order[0]||layer.color; layer.__split=true; out.push(layer); return; }
        order.forEach(function(c,i){
          var w=layer.weight;
          if(String(c).toLowerCase()==='#ffe000'){ w=(Number(layer.weight||1.4)*1.5); } /* çizim (sarı) daha belirgin */
          out.push({ id:layer.id+'_c'+i, name:layer.name, color:c, weight:w, opacity:layer.opacity, hidden:layer.hidden, features:groups[c], __split:true });
        });
      });
      p.cadLayers=out;
    }catch(e){}
  }
  function hook(){
    var before=(window.project&&window.project.cadLayers)?window.project.cadLayers.length:0, tries=0;
    var iv=setInterval(function(){
      var now=(window.project&&window.project.cadLayers)?window.project.cadLayers.length:0;
      if(now>before){ clearInterval(iv); setTimeout(function(){ try{ splitByColor(); if(window.saveProject) window.saveProject(); if(window.renderAll) window.renderAll(); if(window.aybZoomToCad) window.aybZoomToCad(); }catch(e){} },350); }
      if(++tries>40) clearInterval(iv);
    },500);
  }
})();

/* ===================== DXF YAZI: gerçek boyut (m) + açı + CAD font ===================== */
(function(){
  "use strict";
  function esc2(s){ return String(s==null?'':s).replace(/[&<>]/g,function(x){return x==='&'?'&amp;':x==='<'?'&lt;':'&gt;';}); }
  function mppFn(map){ try{ var c=map.getCenter(), p=map.latLngToContainerPoint(c), l2=map.containerPointToLatLng(L.point(p.x+80,p.y)); var m=map.distance(c,l2)/80; return (m>0)?m:1; }catch(e){ return 1; } }
  function render(){
    var map=window.__aybMap||window.map, project=window.project;
    if(!map||typeof map.getZoom!=='function'||!project||!Array.isArray(project.cadLayers)||typeof L==='undefined') return;
    if(!window.__aybCadTextMarkers) window.__aybCadTextMarkers=[];
    for(var i=0;i<window.__aybCadTextMarkers.length;i++){ try{ map.removeLayer(window.__aybCadTextMarkers[i]); }catch(e){} }
    window.__aybCadTextMarkers=[];
    var z=map.getZoom(); if(z<16) return;
    var mpp=mppFn(map);
    var b=map.getBounds().pad(0.10), shown=0, LIMIT=(z>=19?900:(z>=17?600:350));
    var hasPane=false; try{ hasPane=!!(map.getPane&&map.getPane('aybCadPane')); }catch(e){}
    /* iki geçiş: önce ÇİZİM (imar-mavi olmayan) yazılar, sonra imar */
    function draw(onlyDrawing){
      for(var li=0; li<project.cadLayers.length && shown<LIMIT; li++){
        var layer=project.cadLayers[li]; if(layer.hidden) continue;
        var isImarLayer=(String(layer.color||'').toLowerCase()==='#2b6bff');
        if(onlyDrawing && isImarLayer) continue;
        if(!onlyDrawing && !isImarLayer) continue;
        var feats=layer.features||[];
        for(var fi=0; fi<feats.length && shown<LIMIT; fi++){
          var f=feats[fi];
          if((f.type==='TEXT'||f.type==='MTEXT') && f.point && f.text){
            var ll=L.latLng(f.point[0],f.point[1]); if(!b.contains(ll)) continue;
            var hm=(f.h && f.h>0)?f.h:2.5;
            var px=hm/mpp;
            var minpx=isImarLayer?9:5;   /* imar yazısı sadece yeterince büyükse; çizim yazısı erken */
            if(px<minpx) continue; if(px>60) px=60;
            var col=f.color||layer.color||'#ffe000';
            var rot=-(f.rot||0);
            var fam=(f.font==='bcad') ? "'AYB_BCad','B_Cad',monospace" : (f.font==='romans' ? "'AYB_TRomans','T_Romans',Arial,sans-serif" : "Arial,'Segoe UI',sans-serif");
            var hj=f.hj||0, vj=f.vj||0;
            var ox=(hj===1||hj===4)?'50%':(hj===2?'100%':'0%');
            var oy=(vj===2||vj===4)?'50%':(vj===3?'0%':'100%');
            var shx=(hj===1||hj===4)?'-50%':(hj===2?'-100%':'0');
            var shy=(vj===2||vj===4)?'-50%':(vj===3?'0':'-100%');
            var html='<div class="ayb-cad-text" style="font-family:'+fam+';color:'+esc2(col)+';font-size:'+px.toFixed(1)+'px;line-height:1;transform:translate('+shx+','+shy+') rotate('+rot+'deg);transform-origin:'+ox+' '+oy+';white-space:nowrap;text-shadow:0 0 2px rgba(0,0,0,.9),0 0 2px rgba(0,0,0,.9);">'+esc2(f.text)+'</div>';
            var opt={interactive:false,icon:L.divIcon({className:'',html:html,iconSize:[1,1],iconAnchor:[0,0]})};
            if(hasPane) opt.pane='aybCadPane';
            try{ var mk=L.marker(ll,opt).addTo(map); window.__aybCadTextMarkers.push(mk); if(window.cadDisplayLayers) window.cadDisplayLayers.push(mk); shown++; }catch(e){}
          }
        }
      }
    }
    draw(true); draw(false);
  }
  function install(){ if(window.__aybCadTextOvr2) return; window.__aybCadTextOvr2=true; window.aybRenderCadTexts=render;
    var t=0, iv=setInterval(function(){ var m=window.__aybMap||window.map; if(m && typeof m.on==='function' && !window.__aybCadTextBound2){ window.__aybCadTextBound2=true; try{ m.on('zoomend moveend', render); }catch(e){} } if(window.__aybCadTextBound2 || ++t>60) clearInterval(iv); },500);
  }
  install();
})();

/* ===================== UYDU AÇ/KAPAT KESİN ÇÖZÜM (tile katmanını sıfırdan kur) ===================== */
(function(){
  "use strict";
  var d=document;
  function M(){ return window.__aybMap||window.map||null; }
  var URLS={
    sat:'https://mt{s}.google.com/vt/lyrs=s&x={x}&y={y}&z={z}',
    hybrid:'https://mt{s}.google.com/vt/lyrs=y&x={x}&y={y}&z={z}',
    esri:'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
    osm:'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
    topo:'https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png'
  };
  function removeAllBase(map){
    var L=window.L;
    try{ var bl=window.baseLayers; if(bl){ Object.keys(bl).forEach(function(k){ try{ if(bl[k]&&map.hasLayer(bl[k])) map.removeLayer(bl[k]); }catch(e){} }); } }catch(e){}
    try{ if(window.__aybBaseLayer && map.hasLayer(window.__aybBaseLayer)) map.removeLayer(window.__aybBaseLayer); }catch(e){}
    try{ map.eachLayer(function(l){ if(L&&l instanceof L.TileLayer && l._url && /google\.com|arcgisonline|openstreetmap|opentopomap/i.test(l._url)){ try{ map.removeLayer(l); }catch(e){} } }); }catch(e){}
  }
  function createBase(mode,map){
    var L=window.L; if(!L) return null;
    var goog=(mode==='sat'||mode==='hybrid');
    var opts={ maxZoom:24, maxNativeZoom: goog?21:19, keepBuffer:6, crossOrigin:true, updateWhenIdle:false, attribution: goog?'Google':'' };
    if(goog) opts.subdomains=['0','1','2','3'];
    else if(mode==='osm'||mode==='topo') opts.subdomains=['a','b','c'];
    else opts.subdomains=[];
    var nb=L.tileLayer(URLS[mode]||URLS.sat, opts);
    try{ nb.addTo(map); }catch(e){ return null; }
    window.__aybBaseLayer=nb;
    try{ if(window.baseLayers) window.baseLayers[mode]=nb; }catch(e){}
    try{ if(window.aybGetBaseMapOpacity && nb.setOpacity) nb.setOpacity(window.aybGetBaseMapOpacity()); }catch(e){}
    return nb;
  }
  function aybSetBase(mode){
    var map=M(); if(!map||!window.L||typeof map.addLayer!=='function') return;
    mode=mode||'sat';
    try{ localStorage.setItem('ayb_base_map_mode_v1',mode); }catch(e){}
    removeAllBase(map);
    var s=d.getElementById('baseMapSelect'); if(s) s.value=mode;
    if(mode==='none'){ d.body.classList.add('ayb-base-map-off'); }
    else{
      d.body.classList.remove('ayb-base-map-off');
      createBase(mode,map);
      setTimeout(function(){ try{ map.invalidateSize(false); }catch(e){} },120);
      setTimeout(function(){ try{ map.invalidateSize(false); if(window.__aybBaseLayer&&window.__aybBaseLayer.redraw) window.__aybBaseLayer.redraw(); }catch(e){} },500);
    }
    try{ if(window.aybSyncBaseToggleButton) window.aybSyncBaseToggleButton(); }catch(e){}
  }
  window.aybSetBase=aybSetBase;
  /* dropdown (switchBase) da sağlam sürümü kullansın */
  try{ window.switchBase=function(v){ aybSetBase(v||'sat'); }; }catch(e){}

  function toggleBtn(){
    var s=d.getElementById('baseMapSelect');
    var cur=s?s.value:(localStorage.getItem('ayb_base_map_mode_v1')||'sat');
    if(cur==='none'){ var last=localStorage.getItem('ayb_last_real_base_map_v1')||'sat'; if(last==='none')last='sat'; aybSetBase(last); }
    else{ try{ localStorage.setItem('ayb_last_real_base_map_v1',cur); }catch(e){} aybSetBase('none'); }
  }
  /* "Uydu Kapat/Aç" düğmesini yakalama-fazında ele al (uygulamanın kendi onclick'ini geç) */
  d.addEventListener('click', function(e){
    var t=e.target; while(t && t!==d){ if(t.id==='btnBaseOffToggle'){ try{ e.preventDefault(); e.stopPropagation(); if(e.stopImmediatePropagation) e.stopImmediatePropagation(); }catch(_){} toggleBtn(); return; } t=t.parentNode; }
  }, true);
  /* dropdown değişimini de sağlam sürüme bağla */
  var t0=0, iv=setInterval(function(){ var s=d.getElementById('baseMapSelect'); if(s && !s.__aybBound){ s.__aybBound=true; s.addEventListener('change', function(){ aybSetBase(s.value||'sat'); }); } if((s&&s.__aybBound)|| ++t0>60) clearInterval(iv); },500);
})();

/* ===================== TRAFO BUL (imar/DXF trafo etiketi ara -> zoom -> Google Maps navigasyon) ===================== */
(function(){
  "use strict";
  var d=document;
  function M(){ return window.__aybMap||window.map||null; }
  var hl=null, lastHit=null;

  function openMaps(lat,lng){
    var url='https://www.google.com/maps/dir/?api=1&destination='+lat+','+lng+'&travelmode=driving';
    try{ if(window.aybPC && window.aybPC.openUrl){ window.aybPC.openUrl(url); return; } }catch(e){}
    try{ if(window.AYBNative && window.AYBNative.openUrl){ window.AYBNative.openUrl(url); return; } }catch(e){}
    try{ var w=window.open(url,'_blank'); if(w) return; }catch(e){}
    try{ location.href=url; }catch(e){}
  }
  function highlight(o){
    var map=M(), L=window.L; if(!map||!L||typeof map.getZoom!=='function') return;
    try{ if(hl){ map.removeLayer(hl); hl=null; } }catch(e){}
    var c=L.circleMarker([o.lat,o.lng],{radius:22,color:'#ff2d55',weight:4,fill:false,opacity:1}).addTo(map); hl=c;
    var r=22,grow=true,n=0;
    var iv=setInterval(function(){ r+=grow?3:-3; if(r>36)grow=false; if(r<16)grow=true; try{c.setRadius(r);}catch(e){} if(++n>60){clearInterval(iv); try{map.removeLayer(c);}catch(e){} if(hl===c)hl=null;} },80);
  }
  function search(q){
    q=String(q||'').trim().toLocaleUpperCase('tr'); if(!q) return [];
    var p=window.project; if(!p||!Array.isArray(p.cadLayers)) return [];
    var out=[];
    for(var li=0; li<p.cadLayers.length; li++){
      var feats=p.cadLayers[li].features||[];
      for(var fi=0; fi<feats.length; fi++){
        var f=feats[fi];
        if(f && f.text && f.point){
          var tt=String(f.text).toLocaleUpperCase('tr').replace(/\s+/g,'');
          if(tt.indexOf(q.replace(/\s+/g,''))>=0){ out.push({text:f.text, lat:f.point[0], lng:f.point[1]}); if(out.length>=50) return out; }
        }
      }
    }
    return out;
  }
  function flyTo(o){ var map=M(); if(!map||typeof map.setView!=='function') return; try{ map.setView([o.lat,o.lng], Math.max((map.getZoom&&map.getZoom())||0,18), {animate:true}); }catch(e){} highlight(o); lastHit=o; syncGo(); }

  function panel(){
    if(d.getElementById('aybTfPanel')) return d.getElementById('aybTfPanel');
    var el=d.createElement('div'); el.id='aybTfPanel';
    el.style.cssText="position:fixed;top:100px;left:10px;z-index:2147481200;width:320px;max-width:92vw;background:#fff;border:1px solid #c7d0de;border-radius:12px;box-shadow:0 16px 40px rgba(0,0,0,.35);font:13px system-ui,Arial;display:none;overflow:hidden;";
    el.innerHTML=
      '<div style="display:flex;align-items:center;gap:8px;background:#0e7490;color:#fff;padding:9px 12px;">'
        +'<span style="font-weight:800;">⚡ Trafo Bul</span><span style="flex:1;"></span>'
        +'<button id="aybTfClose" style="border:none;background:#ef4444;color:#fff;border-radius:6px;width:24px;height:24px;font-size:15px;cursor:pointer;">×</button>'
      +'</div>'
      +'<div style="padding:9px 10px;">'
        +'<input id="aybTfInput" type="text" placeholder="Trafo adı yaz (örn: TFB837)" style="width:100%;height:34px;padding:4px 10px;border:1px solid #c7d0de;border-radius:8px;box-sizing:border-box;text-transform:uppercase;">'
        +'<button id="aybTfGo" disabled style="margin-top:8px;width:100%;height:38px;border:none;border-radius:8px;background:#16a34a;color:#fff;font-weight:800;font-size:14px;cursor:pointer;opacity:.5;">🧭 Bu Trafoya Git (Google Maps)</button>'
      +'</div>'
      +'<div id="aybTfList" style="max-height:46vh;overflow:auto;border-top:1px solid #eef1f6;"></div>';
    d.body.appendChild(el);
    d.getElementById('aybTfClose').onclick=function(){ el.style.display='none'; };
    var inp=d.getElementById('aybTfInput');
    var tmr=null;
    inp.addEventListener('input', function(){ clearTimeout(tmr); tmr=setTimeout(function(){ render(inp.value); }, 250); });
    inp.addEventListener('keydown', function(e){ if(e.key==='Enter'){ var rs=search(inp.value); if(rs.length){ flyTo(rs[0]); render(inp.value); } } });
    d.getElementById('aybTfGo').onclick=function(){ if(lastHit) openMaps(lastHit.lat,lastHit.lng); };
    return el;
  }
  function syncGo(){ var b=d.getElementById('aybTfGo'); if(b){ b.disabled=!lastHit; b.style.opacity=lastHit?'1':'.5'; b.style.cursor=lastHit?'pointer':'default'; } }
  function render(q){
    var box=d.getElementById('aybTfList'); if(!box) return;
    var rs=search(q);
    if(!rs.length){ box.innerHTML='<div style="padding:12px;color:#7a8699;">Sonuç yok. Trafo adının tamamını/başını yaz.</div>'; return; }
    box._rs=rs;
    box.innerHTML=rs.map(function(r,i){ return '<div class="aybTfRow" data-i="'+i+'" style="padding:9px 12px;border-bottom:1px solid #eef1f6;cursor:pointer;display:flex;align-items:center;gap:8px;"><span style="font-size:15px;">⚡</span><b style="color:#0e7490;">'+String(r.text)+'</b><span style="flex:1;"></span><span style="color:#16a34a;font-size:12px;">Git ›</span></div>'; }).join('');
    Array.prototype.forEach.call(box.querySelectorAll('.aybTfRow'), function(row){ row.addEventListener('click', function(){ var r=box._rs[+row.getAttribute('data-i')]; if(r) flyTo(r); }); });
  }
  function open(){ var el=panel(); el.style.display='block'; lastHit=null; syncGo(); var inp=d.getElementById('aybTfInput'); setTimeout(function(){ try{inp.focus();}catch(e){} },60); render(''); }
  window.aybOpenTrafoBul=open;

  function injectBtn(){
    if(d.getElementById('aybTfBtn')) return true;
    var cad=d.getElementById('btnCadTop'); if(!cad || !cad.parentNode) return false;
    var b=d.createElement('button'); b.id='aybTfBtn'; b.type='button'; b.className=cad.className; b.title='Trafo Bul - ada/isim ile trafo bul, Google Maps ile git';
    b.innerHTML='<div class="ayb-pro-ico" style="color:#0e7490;">⚡</div><small>Trafo Bul</small>';
    b.addEventListener('click', function(e){ try{e.preventDefault();e.stopPropagation();}catch(_){} open(); });
    cad.parentNode.insertBefore(b, cad.nextSibling);
    return true;
  }
  var t=0, iv=setInterval(function(){ if(injectBtn()|| ++t>60) clearInterval(iv); },500);
})();

/* "Düzenle" sekmesinin adını GPS yap (işlev aynı) */
(function(){
  "use strict";
  var d=document;
  function rename(){
    var b=d.querySelector('.ayb-ribbon-tab[data-section="edit"]');
    if(!b) return false;
    var sm=b.textContent||'';
    if(sm.indexOf('GPS')>=0) return true;
    b.innerHTML='<span>📍</span>GPS';
    b.title='GPS / Düzenle';
    return true;
  }
  var t=0, iv=setInterval(function(){ rename(); if(++t>80) clearInterval(iv); },500);
})();

/* ===================== DXF TÜRKÇE KODLAMA DÜZELTME (windows-1254) ===================== */
(function(){
  "use strict";
  try{
    if(window.FileReader && FileReader.prototype && !FileReader.prototype.__aybEncPatched){
      var orig=FileReader.prototype.readAsText;
      FileReader.prototype.readAsText=function(blob, enc){
        try{ if(blob && blob.name && /\.(dxf|mif|mid)$/i.test(blob.name)){ enc='windows-1254'; } }catch(e){}
        return orig.call(this, blob, enc);
      };
      FileReader.prototype.__aybEncPatched=true;
    }
  }catch(e){}
  /* Blob.text() de DXF için 1254 olsun (bazı yollar bunu kullanır) */
  try{
    if(window.Blob && Blob.prototype && Blob.prototype.text && !Blob.prototype.__aybEncPatched){
      var origText=Blob.prototype.text;
      Blob.prototype.text=function(){
        try{
          if(this && this.name && /\.(dxf|mif|mid)$/i.test(this.name)){
            var self=this;
            return self.arrayBuffer().then(function(buf){ try{ return new TextDecoder('windows-1254').decode(buf); }catch(e){ return origText.call(self); } });
          }
        }catch(e){}
        return origText.call(this);
      };
      Blob.prototype.__aybEncPatched=true;
    }
  }catch(e){}
})();

/* ===================== BÜYÜK DXF: cadLayers'ı IndexedDB'ye taşı (localStorage kota hatasını çöz) ===================== */
(function(){
  "use strict";
  function idb(){ return new Promise(function(res,rej){ var r=indexedDB.open('aybCadStore',1); r.onupgradeneeded=function(){ try{ r.result.createObjectStore('cad'); }catch(e){} }; r.onsuccess=function(){ res(r.result); }; r.onerror=function(){ rej(r.error); }; }); }
  function idbSet(k,v){ return idb().then(function(db){ return new Promise(function(res,rej){ var tx=db.transaction('cad','readwrite'); tx.objectStore('cad').put(v,k); tx.oncomplete=function(){res();}; tx.onerror=function(){rej(tx.error);}; }); }); }
  function idbGet(k){ return idb().then(function(db){ return new Promise(function(res,rej){ var tx=db.transaction('cad','readonly'); var rq=tx.objectStore('cad').get(k); rq.onsuccess=function(){res(rq.result);}; rq.onerror=function(){rej(rq.error);}; }); }); }
  window.aybCadIdbSet=idbSet; window.aybCadIdbGet=idbGet;

  var origSet=localStorage.setItem.bind(localStorage);
  function pid(p){ try{ return String((p&&(p.id||p.projectId||p.name))||'active'); }catch(e){ return 'active'; } }
  function offload(key,val){
    /* val içinde cadLayers varsa: IndexedDB'ye kaydet, localStorage'a cadLayers'sız (slim) kaydet */
    var obj=JSON.parse(val);
    var p=obj.project||obj;
    if(!p || !Array.isArray(p.cadLayers) || !p.cadLayers.length) return false;
    var id=pid(p);
    try{ idbSet('cad::'+id, JSON.stringify(p.cadLayers)).catch(function(){}); }catch(e){}
    var savedCad=p.cadLayers; delete p.cadLayers; p.__cadInIdb=id;
    var ok=false;
    try{ origSet(key, JSON.stringify(obj)); ok=true; }catch(e){}
    p.cadLayers=savedCad; /* bellekte geri koy (harita bozulmasın) */
    return ok;
  }
  localStorage.setItem=function(key,val){
    try{
      if(typeof val==='string' && val.length>1500000 && val.indexOf('"cadLayers"')>=0){
        if(offload(key,val)) return;
      }
    }catch(e){}
    try{ return origSet(key,val); }
    catch(err){
      try{ if(typeof val==='string' && val.indexOf('"cadLayers"')>=0 && offload(key,val)) return; }catch(e2){}
      throw err;
    }
  };

  /* boot: proje IndexedDB işaretliyse cadLayers'ı geri yükle */
  var tries=0, iv=setInterval(function(){
    try{
      var p=window.project;
      if(p && p.__rastInIdb && !p.__rastRestoring && Array.isArray(p.rasters) && p.rasters.some(function(x){ return x && x.__urlInIdb && !x.url; })){
        p.__rastRestoring=true;
        idbGet('rast::'+p.__rastInIdb).then(function(txt){
          try{ if(txt){ p.rasters=JSON.parse(txt); if(window.renderAll) window.renderAll(); } }catch(e){}
        }).catch(function(){});
      }
      if(p && p.__cadInIdb && (!Array.isArray(p.cadLayers)||!p.cadLayers.length) && !p.__cadRestoring){
        p.__cadRestoring=true;
        idbGet('cad::'+p.__cadInIdb).then(function(txt){
          try{ if(txt){ p.cadLayers=JSON.parse(txt); if(window.renderAll) window.renderAll(); if(window.aybZoomToCad) window.aybZoomToCad(); } }catch(e){}
        }).catch(function(){});
      }
    }catch(e){}
    if(++tries>60) clearInterval(iv);
  }, 700);
})();

/* ===================== DXF KATMAN LİSTESİNE RENK SEÇİCİ ===================== */
(function(){
  "use strict";
  var d=document;
  function findLayer(id){ try{ var ls=(window.project&&window.project.cadLayers)||[]; for(var i=0;i<ls.length;i++){ if(String(ls[i].id)===String(id)) return ls[i]; } }catch(e){} return null; }
  function inject(){
    var rows=d.querySelectorAll('.ayb-cad-row[data-id]');
    Array.prototype.forEach.call(rows, function(row){
      if(row.__aybColorAdded) return;
      var id=row.getAttribute('data-id'); var layer=findLayer(id); if(!layer) return;
      row.__aybColorAdded=true;
      var ci=d.createElement('input'); ci.type='color';
      ci.value=(layer.color&&/^#[0-9a-f]{6}$/i.test(layer.color))?layer.color:'#2b6bff';
      ci.title='Bu katmanın rengini değiştir';
      ci.style.cssText='width:32px;height:26px;min-width:32px;border:1px solid #c7d0de;border-radius:6px;padding:0;cursor:pointer;background:transparent;';
      ci.addEventListener('input', function(){
        try{
          var c=ci.value; layer.color=c; layer.original=false;
          var fs=layer.features||[]; for(var k=0;k<fs.length;k++){ fs[k].color=c; }
          if(window.renderAll) window.renderAll();
          try{ if(window.saveProject) window.saveProject(); }catch(_){}
        }catch(e){}
      });
      /* göz (aç/kapat) düğmesi */
      var eye=d.createElement('button'); eye.type='button';
      eye.style.cssText='width:34px;height:26px;min-width:34px;border:1px solid #c7d0de;border-radius:6px;cursor:pointer;background:#fff;font-size:15px;line-height:1;padding:0;';
      function paintEye(){ eye.textContent=layer.hidden?'🚫':'👁'; eye.title=layer.hidden?'Katman kapalı - açmak için bas':'Katmanı gizle/kapat'; eye.style.background=layer.hidden?'#fee2e2':'#fff'; }
      paintEye();
      eye.addEventListener('click', function(ev){
        try{ ev.preventDefault(); ev.stopPropagation(); }catch(_){}
        try{
          if(!layer.hidden){ layer._savedOpacity=(layer.opacity==null?0.9:layer.opacity); layer.hidden=true; layer.opacity=0; }
          else { layer.hidden=false; layer.opacity=(layer._savedOpacity==null?0.9:layer._savedOpacity); }
          paintEye();
          if(window.renderAll) window.renderAll();
          try{ if(window.saveProject) window.saveProject(); }catch(_){}
        }catch(e){}
      });
      var zoomBtn=row.querySelector('[data-cad-zoom]');
      if(zoomBtn && zoomBtn.parentNode===row){ row.insertBefore(ci, zoomBtn); row.insertBefore(eye, zoomBtn); } else { row.appendChild(ci); row.appendChild(eye); }
    });
  }
  setInterval(function(){ try{ var b=document.getElementById('cadLayerList'); if(b && b.offsetParent!==null) inject(); }catch(e){} }, 1200);
})();

/* ===================== OTOMATİK TRAFO BÖLGESİ ÇİZ (besleme bölgesi, kalın kesik çizgi) ===================== */
(function(){
  "use strict";
  var d=document;
  function M(){ return window.__aybMap||window.map||null; }
  var grp=null, shown=false;

  function convexHull(pts){
    if(pts.length<3) return pts.slice();
    pts=pts.slice().sort(function(a,b){ return a[0]-b[0]||a[1]-b[1]; });
    function cr(o,a,b){ return (a[0]-o[0])*(b[1]-o[1])-(a[1]-o[1])*(b[0]-o[0]); }
    var lo=[],i; for(i=0;i<pts.length;i++){ while(lo.length>=2&&cr(lo[lo.length-2],lo[lo.length-1],pts[i])<=0) lo.pop(); lo.push(pts[i]); }
    var up=[]; for(i=pts.length-1;i>=0;i--){ while(up.length>=2&&cr(up[up.length-2],up[up.length-1],pts[i])<=0) up.pop(); up.push(pts[i]); }
    lo.pop(); up.pop(); return lo.concat(up);
  }
  function buffer(hull,m){
    if(hull.length<3) return hull;
    var cx=0,cy=0; hull.forEach(function(p){cx+=p[0];cy+=p[1];}); cx/=hull.length; cy/=hull.length;
    var latm=m/111320, lngm=m/((111320*Math.cos(cy*Math.PI/180))||1);
    return hull.map(function(p){ var dx=p[0]-cx,dy=p[1]-cy,l=Math.sqrt(dx*dx+dy*dy)||1; return [p[0]+dx/l*lngm, p[1]+dy/l*latm]; });
  }
  function compute(){
    var p=window.project; if(!p) return [];
    var objs=Array.isArray(p.objects)?p.objects:[], lines=Array.isArray(p.lines)?p.lines:[];
    var byId={}; objs.forEach(function(o){ byId[o.id]=o; });
    var adj={}; objs.forEach(function(o){ adj[o.id]=[]; });
    lines.forEach(function(l){ if(adj[l.start]&&adj[l.end]){ adj[l.start].push(l.end); adj[l.end].push(l.start); } });
    var trafos=objs.filter(function(o){ return String(o.type||'').toLowerCase()==='trafo'; });
    if(!trafos.length) return [];
    var owner={}, q=[];
    trafos.forEach(function(t){ owner[t.id]=t.id; q.push(t.id); });
    while(q.length){ var id=q.shift(); (adj[id]||[]).forEach(function(n){ if(owner[n]===undefined){ owner[n]=owner[id]; q.push(n); } }); }
    var groups={};
    objs.forEach(function(o){ var ow=owner[o.id]; if(ow!==undefined && o.lat!=null && o.lng!=null){ (groups[ow]=groups[ow]||[]).push(o); } });
    var regions=[];
    Object.keys(groups).forEach(function(ow){
      var members=groups[ow]; var pts=members.map(function(o){ return [o.lng,o.lat]; });
      if(pts.length<3) return;
      var hull=buffer(convexHull(pts),22);
      regions.push({ trafo:byId[ow], hull:hull.map(function(pt){ return [pt[1],pt[0]]; }), count:members.length });
    });
    return regions;
  }
  var palette=['#1d4ed8','#e11d48','#059669','#d97706','#7c3aed','#0891b2','#be185d','#4d7c0f','#0369a1','#b91c1c'];
  function draw(){
    var map=M(), L=window.L; if(!map||!L){ return; }
    if(!grp) grp=L.layerGroup().addTo(map); grp.clearLayers();
    var regions=compute();
    if(!regions.length){ try{ if(window.toast) toast('Trafo veya trafoya bağlı hat/direk bulunamadı. Önce trafo koy, hatlarla direklere bağla.'); }catch(e){} return; }
    regions.forEach(function(r,i){
      var col=palette[i%palette.length];
      var poly=L.polygon(r.hull,{color:col,weight:5,opacity:0.95,dashArray:'16 10',fill:true,fillColor:col,fillOpacity:0.05,interactive:false});
      grp.addLayer(poly);
      try{
        var tno=(r.trafo&&r.trafo.props&&(r.trafo.props.trafo_no||r.trafo.props.no))||(r.trafo&&window.getObjectNo?window.getObjectNo(r.trafo):'')||'Trafo';
        var c=poly.getBounds().getCenter();
        grp.addLayer(L.marker(c,{interactive:false,icon:L.divIcon({className:'',html:'<div style="background:'+col+';color:#fff;font:700 12px system-ui;padding:2px 9px;border-radius:11px;white-space:nowrap;box-shadow:0 1px 5px rgba(0,0,0,.45);">⬡ '+tno+' bölgesi</div>',iconSize:[0,0]})}));
      }catch(e){}
    });
    shown=true;
    try{ if(window.toast) toast(regions.length+' trafo bölgesi otomatik çizildi.'); }catch(e){}
  }
  function clear(){ if(grp) grp.clearLayers(); shown=false; try{ if(window.toast) toast('Trafo bölgeleri kaldırıldı.'); }catch(e){} }
  function toggle(){ if(shown) clear(); else draw(); }
  window.aybTrafoBolgeCiz=draw; window.aybTrafoBolgeToggle=toggle;

  function injectBtn(){
    if(d.getElementById('aybTbBtn')) return true;
    var anchor=d.getElementById('aybTfBtn')||d.getElementById('btnCadTop'); if(!anchor||!anchor.parentNode) return false;
    var b=d.createElement('button'); b.id='aybTbBtn'; b.type='button'; b.className=anchor.className;
    b.title='Trafo Bölgesi Çiz - her trafonun beslediği bölgeyi otomatik kalın kesik çizgiyle kapatır (tekrar bas: kaldır)';
    b.innerHTML='<div class="ayb-pro-ico" style="color:#1d4ed8;">⬡</div><small>Trafo Bölgesi</small>';
    b.addEventListener('click', function(e){ try{e.preventDefault();e.stopPropagation();}catch(_){} toggle(); });
    anchor.parentNode.insertBefore(b, anchor.nextSibling);
    return true;
  }
  var t=0, iv=setInterval(function(){ if(injectBtn()|| ++t>60) clearInterval(iv); },500);
})();

/* ===================== WhatsApp/başka uygulamadan gelen DXF/KML/KMZ/MİF'i içeri al ===================== */
(function(){
  "use strict";
  var d=document;
  var pending=null;
  function b64ToU8(b64){ try{ var bin=atob(b64); var a=new Uint8Array(bin.length); for(var i=0;i<bin.length;i++)a[i]=bin.charCodeAt(i); return a; }catch(e){ return new Uint8Array(0); } }
  function ready(){ var map=window.__aybMap||window.map; return !!(map && typeof map.getZoom==='function' && d.getElementById('cadFile')); }
  function setCadAndChange(file){
    var tries=0;(function a(){
      var inp=d.getElementById('cadFile'); var btn=d.getElementById('btnCadImport');
      if(inp && btn){
        try{ var dt=new DataTransfer(); dt.items.add(file); try{ inp.files=dt.files; }catch(e){} try{ Object.defineProperty(inp,'files',{configurable:true,get:function(){return dt.files;}}); }catch(e){} }catch(e){}
        try{ inp.dispatchEvent(new Event('change',{bubbles:true})); }catch(e){}
        try{ btn.click(); }catch(e){}
        return;
      }
      if(++tries<25) setTimeout(a,400);
    })();
  }
  function routeViaButton(inputId, btnId, accept, file){
    var inp=d.getElementById(inputId);
    if(!inp){ inp=d.createElement('input'); inp.type='file'; inp.id=inputId; inp.accept=accept; inp.style.display='none'; d.body.appendChild(inp); }
    var dt=new DataTransfer(); dt.items.add(file);
    try{ Object.defineProperty(inp,'files',{configurable:true,get:function(){return dt.files;}}); }catch(e){ try{ inp.files=dt.files; }catch(_){} }
    inp.click=function(){ setTimeout(function(){ try{ if(typeof inp.onchange==='function') inp.onchange({target:inp}); }catch(e){} try{ inp.dispatchEvent(new Event('change',{bubbles:true})); }catch(e){} },10); };
    var btn=d.getElementById(btnId);
    if(btn){ try{ btn.click(); }catch(e){ inp.click(); } } else { inp.click(); }
    setTimeout(function(){ try{ delete inp.click; }catch(e){} },4000);
  }
  function doImport(b64,name){
    try{
      var ext=(String(name).split('.').pop()||'').toLowerCase();
      var file=new File([b64ToU8(b64)], name);
      if(ext==='kml'||ext==='kmz'){ routeViaButton('aybKmzInput','btnKMZImport','.kml,.kmz',file); try{ if(window.toast) toast('KML/KMZ içeri alınıyor: '+name); }catch(e){} }
      else if(ext==='mif'){ routeViaButton('aybMifInput','btnMIFImport','.mif,.txt',file); try{ if(window.toast) toast('MİF içeri alınıyor: '+name); }catch(e){} }
      else if(ext==='json'||ext==='zip'){
        /* İSTEK (Bayram YARAŞ): WhatsApp'tan gelen JSON (aybproje/PAKET) veya MİF zip'i
           AÇIK PROJEYE OTOMATİK BİRLEŞTİRİLİR — soru sormadan. */
        if(typeof window.aybHandleFiles==='function'){
          window.__aybMergeOnce=true;
          window.aybHandleFiles([file]);
          try{ if(window.toast) toast((ext==='json'?'JSON (tam veri)':'MİF paketi')+' açık projeye birleştiriliyor: '+name); }catch(e){}
        } else { try{ if(window.toast) toast('İçe aktarma modülü henüz hazır değil, tekrar deneyin.'); }catch(e){} }
      }
      else { var dn=/\.dxf$/i.test(name)?name:(String(name).replace(/\.[^.]*$/,'')+'.dxf'); var df=new File([b64ToU8(b64)], dn); setCadAndChange(df); try{ if(window.toast) toast('DXF içeri alınıyor: '+dn); }catch(e){} }
    }catch(e){ try{ if(window.toast) toast('Dosya alınamadı: '+(e&&e.message?e.message:e)); }catch(_){} }
  }
  function startPoll(){
    if(window.__aybIncPolling) return; window.__aybIncPolling=true;
    var n=0;
    var iv=setInterval(function(){
      if(!pending){ clearInterval(iv); window.__aybIncPolling=false; return; }
      if(ready()){ var p=pending; pending=null; clearInterval(iv); window.__aybIncPolling=false; setTimeout(function(){ doImport(p.b64,p.name); }, 600); }
      else if(++n>1200){ clearInterval(iv); window.__aybIncPolling=false; }  /* ~10 dk bekle */
    }, 500);
  }
  window.aybImportIncomingDxf=function(b64, name){
    pending={ b64:b64, name:name||'gelen.dxf' };
    try{ if(window.toast) toast(ready()?'Dosya alındı, içeri alınıyor...':'Dosya alındı. Giriş yapıp proje açınca otomatik gelecek.'); }catch(e){}
    startPoll();
  };
  window.aybImportIncomingFile=window.aybImportIncomingDxf;
})();

/* ===================== HIZLI SAHA MODU (direk/trafo ekleme hızlandırma) =====================
   Sorun: her obje eklemede (1) TÜM DXF yeniden çiziliyor, (2) 60 MB proje tümüyle kaydediliyor.
   Çözüm: (1) DXF değişmediyse çizimi yeniden yapma (önbellek), (2) kayıtta DXF'i hariç tut. */
(function(){
  "use strict";
  function M(){ return window.__aybMap||window.map||null; }
  function cadSig(){
    var p=window.project; if(!p||!Array.isArray(p.cadLayers)) return 'yok';
    var s=p.cadLayers.length+'#';
    for(var i=0;i<p.cadLayers.length;i++){
      var l=p.cadLayers[i]||{};
      s+=(l.id||i)+':'+((l.features&&l.features.length)||0)+':'+(l.color||'')+':'+(l.hidden?1:0)+':'+(l.opacity==null?'':l.opacity)+':'+(l.weight==null?'':l.weight)+';';
    }
    return s;
  }
  window.aybCadSig=cadSig;

  /* ---------- 1) DXF çizim önbelleği: değişmediyse yeniden çizme ---------- */
  var origCad=null, lastSig=null, cache=[];
  function installCad(){
    var cur=window.renderCadLayers;
    if(typeof cur!=='function' || cur.__aybFast) return;
    origCad=cur;
    var fast=function(){
      var map=M(), L=window.L;
      if(!map||!L||typeof map.addLayer!=='function') return origCad.apply(this,arguments);
      if(window.__aybCadFast){          /* DXF tuvale alındı: ağır Leaflet katmanı oluşturma */
        for(var q=0;q<cache.length;q++){ try{ map.removeLayer(cache[q]); }catch(e){} }
        cache=[]; lastSig=null;
        try{ if(typeof window.aybRenderCadTexts==='function') window.aybRenderCadTexts(); }catch(e){}
        return;
      }
      var s=cadSig();
      if(s===lastSig && cache.length){
        for(var i=0;i<cache.length;i++){ try{ if(!map.hasLayer(cache[i])) map.addLayer(cache[i]); }catch(e){} }
        try{ if(typeof window.aybRenderCadTexts==='function') window.aybRenderCadTexts(); }catch(e){}
        return;
      }
      for(var j=0;j<cache.length;j++){ try{ map.removeLayer(cache[j]); }catch(e){} }
      cache=[];
      var captured=[], origAdd=map.addLayer;
      try{
        map.addLayer=function(l){ try{ captured.push(l); }catch(e){} return origAdd.call(this,l); };
        origCad.apply(this,arguments);
      } finally { map.addLayer=origAdd; }
      try{ cache=captured.filter(function(l){ return L.Path && (l instanceof L.Path); }); }catch(e){ cache=[]; }
      lastSig=s;
    };
    fast.__aybFast=true;
    window.renderCadLayers=fast;
  }

  /* ---------- 2) Kayıt: DXF katmanlarını hariç tut (60 MB yerine küçük kayıt) ---------- */
  var origSave=null, lastCadSaved=null;
  function installSave(){
    var cur=window.saveProject;
    if(typeof cur!=='function' || cur.__aybFast) return;
    origSave=cur;
    var lastRastSaved=null;
    function rastSig(){ try{ var rr=window.project.rasters||[]; return rr.length+':'+rr.map(function(x){ return (x.id||'')+','+((x.url||'').length)+','+(x.opacity||'')+','+(x.hidden?1:0); }).join('|'); }catch(e){ return 'x'; } }
    function agir(p){ try{ var rr=p.rasters||[]; for(var i=0;i<rr.length;i++){ if(rr[i] && typeof rr[i].url==='string' && rr[i].url.length>200000) return true; } }catch(e){} return false; }
    var fast=function(){
      try{ return fastIc.apply(this,arguments); }
      catch(e){ try{ return origSave.apply(this,arguments); }catch(e2){ return false; } }
    };
    var fastIc=function(){
      var p=window.project;
      if(!p) return origSave.apply(this,arguments);
      var hasCad=Array.isArray(p.cadLayers)&&p.cadLayers.length, hasRast=agir(p);
      if(!hasCad && !hasRast) return origSave.apply(this,arguments);
      var id=String(p.id||p.name||'active'), r;
      var keepCad=null, keepRast=null, sCad=null, sRast=null;
      if(hasCad){ keepCad=p.cadLayers; sCad=cadSig(); p.cadLayers=[]; p.__cadInIdb=id; }
      if(hasRast){ keepRast=p.rasters; sRast=rastSig(); p.rasters=keepRast.map(function(x){ var c={}; for(var k in x){ if(k!=='url') c[k]=x[k]; } c.__urlInIdb=true; return c; }); p.__rastInIdb=id; }
      try{ r=origSave.apply(this,arguments); }
      finally{ if(hasCad) p.cadLayers=keepCad; if(hasRast) p.rasters=keepRast; }
      if(hasCad && sCad!==lastCadSaved){
        lastCadSaved=sCad;
        setTimeout(function(){ try{ if(window.aybCadIdbSet) window.aybCadIdbSet('cad::'+id, JSON.stringify(keepCad)).catch(function(){}); }catch(e){} }, 400);
      }
      if(hasRast && sRast!==lastRastSaved){
        lastRastSaved=sRast;
        setTimeout(function(){ try{ if(window.aybCadIdbSet) window.aybCadIdbSet('rast::'+id, JSON.stringify(keepRast)).catch(function(){}); }catch(e){} }, 900);
      }
      return r;
    };
    fast.__aybFast=true;
    window.saveProject=fast;
  }

  /* ---------- 3) DXF yazıları: aynı görünümde tekrar çizme + gecikmeli topla ---------- */
  var txtInner=null, txtWrap=null, txtTmr=null, txtKey='';
  function installTxt(){
    var cur=window.aybRenderCadTexts;
    if(typeof cur!=='function' || cur===txtWrap) return;
    txtInner=cur;
    txtWrap=function(){
      if(txtTmr) clearTimeout(txtTmr);
      txtTmr=setTimeout(function(){
        txtTmr=null;
        var map=M();
        if(!map||typeof map.getZoom!=='function'){ try{ txtInner(); }catch(e){} return; }
        var c, key;
        try{ c=map.getCenter(); key=map.getZoom()+'|'+c.lat.toFixed(5)+'|'+c.lng.toFixed(5)+'|'+cadSig(); }catch(e){ key=Math.random()+''; }
        var have=(window.__aybCadTextMarkers&&window.__aybCadTextMarkers.length)||0;
        if(key===txtKey && have) return;
        txtKey=key;
        try{ txtInner(); }catch(e){}
      }, 130);
    };
    txtWrap.__aybFast=true;
    window.aybRenderCadTexts=txtWrap;
  }

  function installAll(){ try{ installCad(); }catch(e){} try{ installSave(); }catch(e){} try{ installTxt(); }catch(e){} }
  installAll();
  var _t=0, _i=setInterval(function(){
    installAll();
    var done=(window.renderCadLayers&&window.renderCadLayers.__aybFast)&&(window.saveProject&&window.saveProject.__aybFast)&&(window.aybRenderCadTexts&&window.aybRenderCadTexts.__aybFast);
    if(done || ++_t>60) clearInterval(_i);
  }, 700);
})();

/* ===================== HIZLI VERİ GİRİŞİ: ARTIMLI ÇİZİM =====================
   Sorun: her direk/hat eklemede TÜM objeler+hatlar silinip yeniden çiziliyordu (obje arttıkça katlanarak yavaşlar).
   Çözüm: sadece YENİ eklenenleri çiz. Bir şey silinir/düzenlenirse otomatik tam çizime döner (güvenli). */
(function(){
  "use strict";
  var origAll=null, prev=null, busy=false;

  function visObjs(){ var p=window.project, a=(p&&p.objects)||[]; try{ return (typeof window.aybViewObjectVisible==='function')?a.filter(window.aybViewObjectVisible):a; }catch(e){ return a; } }
  function visLines(){ var p=window.project, a=(p&&p.lines)||[]; try{ return (typeof window.aybViewLineVisible==='function')?a.filter(window.aybViewLineVisible):a; }catch(e){ return a; } }

  function objSig(o){
    var no='',tip='',lbl='',sid='';
    try{ no=window.getObjectNo?window.getObjectNo(o):''; }catch(e){}
    try{ tip=window.getObjectTip?window.getObjectTip(o):''; }catch(e){}
    try{ lbl=window.getObjectLabelHTML?window.getObjectLabelHTML(o,no,tip):''; }catch(e){}
    try{ var sy=window.getObjectSymbol?window.getObjectSymbol(o):null; sid=(o.props&&o.props.symbol_id)||(sy&&sy.id)||''; }catch(e){}
    return o.id+'|'+o.lat+','+o.lng+'|'+o.type+'|'+sid+'|'+lbl;
  }
  function lineSig(l){ try{ return JSON.stringify(l, function(k,v){ return (k==='length_m') ? undefined : v; }); }catch(e){ return String(l&&l.id); } }
  function kisa(k,v){ return (typeof v==='string' && v.length>400) ? ('#'+v.length) : v; }   /* base64 gibi dev metinleri imzada kullanma */
  function otherSig(){
    var p=window.project||{}, s='';
    try{ s=JSON.stringify(p.areas||[],kisa)+'#'+JSON.stringify(p.freeLines||[],kisa)+'#'+JSON.stringify(p.channels||[],kisa)+'#'+JSON.stringify(p.rasters||[],kisa); }
    catch(e){ s=((p.areas||[]).length)+'/'+((p.freeLines||[]).length)+'/'+((p.channels||[]).length)+'/'+((p.rasters||[]).length); }
    try{ s+='#'+JSON.stringify(p.aybImportLayers||[]); }catch(e){}
    try{ s+='#'+(window.aybCadSig?window.aybCadSig():''); }catch(e){}
    try{ s+='#'+(window.aybEnergyHoverMode?1:0); }catch(e){}
    return s;
  }

  function fast(){
    var p=window.project, map=window.__aybMap||window.map;
    if(!p||!map||typeof origAll!=='function'){ return origAll?origAll.apply(this,arguments):undefined; }
    var ov,lv,os,ls,ot;
    try{ ov=visObjs(); lv=visLines(); os=ov.map(objSig); ls=lv.map(lineSig); ot=otherSig(); }
    catch(e){ prev=null; return origAll.apply(this,arguments); }

    var anyHidden=false;
    try{ var il=p.aybImportLayers||[]; for(var h=0;h<il.length;h++){ if(il[h] && il[h].mode==='project' && il[h].visible===false){ anyHidden=true; break; } } }catch(e){ anyHidden=true; }
    if(!anyHidden && prev && prev.ot===ot && os.length>=prev.objs.length && ls.length>=prev.lines.length &&
       typeof window.renderObject==='function' && typeof window.renderLine==='function'){
      var ok=true, i;
      for(i=0;i<prev.objs.length;i++){ if(prev.objs[i]!==os[i]){ ok=false; break; } }
      if(ok) for(i=0;i<prev.lines.length;i++){ if(prev.lines[i]!==ls[i]){ ok=false; break; } }
      var addO=os.length-prev.objs.length, addL=ls.length-prev.lines.length;
      if(ok && (addO+addL)>0 && (addO+addL)<=30){
        try{
          for(i=prev.objs.length;i<os.length;i++) window.renderObject(ov[i]);
          for(i=prev.lines.length;i<ls.length;i++) window.renderLine(lv[i]);
          try{ if(window.updateSummary) window.updateSummary(); }catch(e){}
          try{ if(window.repositionPointLabels) window.repositionPointLabels(); }catch(e){}
          prev={objs:os,lines:ls,ot:ot};
          try{ if(window.aybArtikTemizle) window.aybArtikTemizle(); }catch(e){}
          return;
        }catch(e){ /* sorun olursa tam çizime düş */ }
      }
      if(ok && addO===0 && addL===0){ prev={objs:os,lines:ls,ot:ot}; return; }  /* hiçbir şey değişmedi */
    }
    if(busy) return;
    busy=true; prev=null;
    try{ origAll.apply(this,arguments); } finally { busy=false; }
    try{ prev={objs:visObjs().map(objSig), lines:visLines().map(lineSig), ot:otherSig()}; }catch(e){ prev=null; }
    try{ if(window.aybArtikTemizle) window.aybArtikTemizle(); }catch(e){}
  }

  var installed=false;
  function install(){
    if(installed) return;
    var cur=window.renderAll;
    if(typeof cur!=='function') return;
    if(cur.__aybInc){ installed=true; return; }
    origAll=cur;
    /* programın kendi sarmalayıcı bayraklarını taşı -> tekrar tekrar sarmasın (sonsuz iç içe sarma önlenir) */
    try{ for(var k in cur){ try{ if(Object.prototype.hasOwnProperty.call(cur,k) && !(k in fast)) fast[k]=cur[k]; }catch(e){} } }catch(e){}
    fast.__aybInc=true;
    window.renderAll=fast;
    installed=true;
  }
  install();
  var _n=0, _iv=setInterval(function(){ install(); if(installed || ++_n>60) clearInterval(_iv); }, 500);
  window.aybForceFullRender=function(){ prev=null; try{ if(origAll) origAll(); }catch(e){} };
})();

/* ===================== HAT ÇİZERKEN AKICILIK: yakalama taraması sınırlandır =====================
   Sorun: hat çizerken her fare/parmak hareketinde TÜM objeler taranıyordu (obje çoksa takılma). */
(function(){
  "use strict";
  var inner=null, wrap=null, last=0, pend=null, tmr=null;
  function run(){ tmr=null; last=Date.now(); try{ if(inner) inner(pend); }catch(e){} }
  function install(){
    var cur=window.updateSnap;
    if(typeof cur!=='function' || cur===wrap) return;
    inner=cur;
    wrap=function(ll){
      pend=ll;
      var now=Date.now(), gap=now-last;
      if(gap>=45){ run(); return; }
      if(!tmr) tmr=setTimeout(run, 45-gap);
    };
    window.updateSnap=wrap;
  }
  install();
  var n=0, iv=setInterval(function(){ install(); if((window.updateSnap===wrap) || ++n>60) clearInterval(iv); }, 500);
})();

/* ===================== VERİ KAYBI ÖNLEME: HER KAYITTA IndexedDB YEDEĞİ + AÇILIŞTA KURTARMA =====================
   Sorun: tarayıcı kayıt alanı (localStorage ~5MB) dolunca program SESSİZCE kaydedemiyordu -> direkler kayboluyordu. */
(function(){
  "use strict";
  function idb(){ return new Promise(function(res,rej){ var r=indexedDB.open('aybCadStore',1); r.onupgradeneeded=function(){ try{ r.result.createObjectStore('cad'); }catch(e){} }; r.onsuccess=function(){ res(r.result); }; r.onerror=function(){ rej(r.error); }; }); }
  function idbSet(k,v){ return idb().then(function(db){ return new Promise(function(res,rej){ var tx=db.transaction('cad','readwrite'); tx.objectStore('cad').put(v,k); tx.oncomplete=function(){res(true);}; tx.onerror=function(){rej(tx.error);}; }); }); }
  function idbGet(k){ return idb().then(function(db){ return new Promise(function(res,rej){ var tx=db.transaction('cad','readonly'); var rq=tx.objectStore('cad').get(k); rq.onsuccess=function(){res(rq.result);}; rq.onerror=function(){rej(rq.error);}; }); }); }

  function slim(p){
    var o={};
    ['id','name','stage','user','created','updated','meta','settings'].forEach(function(k){ if(p[k]!==undefined) o[k]=p[k]; });
    ['objects','lines','areas','freeLines','channels','aybNotes','aybImportLayers'].forEach(function(k){ if(Array.isArray(p[k])) o[k]=p[k]; });
    try{ o.rasters=(p.rasters||[]).map(function(x){ var c={}; for(var k in x){ if(k!=='url') c[k]=x[k]; } return c; }); }catch(e){}
    return o;
  }
  var tmr=null, warned=false;
  function backupNow(){
    tmr=null;
    var p=window.project; if(!p||!p.id) return;
    try{ idbSet('proj::'+p.id, JSON.stringify(slim(p))).catch(function(){}); }catch(e){}
  }
  function queueBackup(){ if(tmr) clearTimeout(tmr); tmr=setTimeout(backupNow, 700); }
  window.aybYedekle=backupNow;

  /* kaydetmeye ek olarak yedek al; kayıt başarısızsa KULLANICIYI UYAR */
  var installed=false;
  function install(){
    if(installed) return;
    var cur=window.saveProject;
    if(typeof cur!=='function') return;
    if(cur.__aybBkp){ installed=true; return; }
    var inner=cur;
    var w=function(){
      var r;
      try{ r=inner.apply(this,arguments); }catch(e){ try{ if(window.toast) toast('Kayıt uyarısı: '+(e&&e.message?e.message:e)); }catch(_){} r=false; }
      try{ queueBackup(); }catch(e){}
      if(r===false && !warned){
        warned=true;
        try{ if(window.toast) toast('DİKKAT: Cihaz kayıt alanı dolu! Veriler yedeğe alınıyor, DXF altlıklarını silip tekrar deneyin.'); }catch(e){}
        setTimeout(function(){ warned=false; }, 20000);
        backupNow();
      }
      return r;
    };
    try{ for(var k in inner){ try{ if(Object.prototype.hasOwnProperty.call(inner,k) && !(k in w)) w[k]=inner[k]; }catch(e){} } }catch(e){}
    w.__aybBkp=true;
    window.saveProject=w;
    installed=true;
  }
  install();
  var n=0, iv=setInterval(function(){ install(); if(installed || ++n>60) clearInterval(iv); }, 500);

  /* uygulama arka plana alınırken/kapanırken hemen yedekle */
  try{
    document.addEventListener('visibilitychange', function(){ if(document.visibilityState==='hidden') backupNow(); });
    window.addEventListener('pagehide', backupNow);
    window.addEventListener('blur', function(){ queueBackup(); });
  }catch(e){}

  /* AÇILIŞTA KURTARMA: yedek, kayıtlı projeden DAHA YENİ ise (yani son kayıt yapılamamışsa) geri yükle */
  var checked={}, t=0;
  var boot=setInterval(function(){
    var p=window.project;
    if(p && p.id && !checked[p.id]){
      checked[p.id]=true;
      idbGet('proj::'+p.id).then(function(txt){
        if(!txt) return;
        var b; try{ b=JSON.parse(txt); }catch(e){ return; }
        if(!b || !b.updated) return;
        var tb=new Date(b.updated).getTime()||0, tp=new Date(p.updated||0).getTime()||0;
        if(tb<=tp) return;                       /* yedek eski/aynı -> dokunma */
        var addO=((b.objects||[]).length)-((p.objects||[]).length);
        var addL=((b.lines||[]).length)-((p.lines||[]).length);
        ['objects','lines','areas','freeLines','channels','rasters','aybNotes','aybImportLayers'].forEach(function(k){ if(Array.isArray(b[k])) p[k]=b[k]; });
        p.updated=b.updated;
        try{ if(window.renderAll) window.renderAll(); }catch(e){}
        try{ if(window.toast) toast('Kaydedilemeyen veriler yedekten kurtarıldı'+(addO>0?(' (+'+addO+' obje'+(addL>0?', +'+addL+' hat':'')+')'):'')); }catch(e){}
      }).catch(function(){});
    }
    if(++t>90) clearInterval(boot);
  }, 800);
})();

/* ===================== HAYALET (ESKİ YERDE KALAN) HAT/DİREK DÜZELTMESİ =====================
   1) updateConnectedLines programda TANIMSIZ -> direk taşınırken hatlar takip etmiyordu (hata veriyordu).
   2) Aynı obje/hat iki kez çizilirse eskisi haritada "hayalet" olarak kalıyordu -> kendi kaydımızla temizliyoruz. */
(function(){
  "use strict";
  function M(){ return window.__aybMap||window.map||null; }
  var objLayers={}, lineLayers2={}, freeLayers={}, areaLayers={}, chanLayers={};
  window.__aybKatmanKayit={obj:objLayers, line:lineLayers2, free:freeLayers, area:areaLayers, chan:chanLayers};

  function capture(fnName, store, keyOf){
    var cur=window[fnName];
    if(typeof cur!=='function' || cur.__aybGhost) return false;
    var inner=cur;
    var w=function(item){
      var map=M(), key=null;
      try{ key=keyOf(item); }catch(e){}
      /* aynı id tekrar çiziliyorsa, önceki katman hâlâ haritadaysa HAYALETTİR -> kaldır */
      if(map && key && store[key]){
        for(var i=0;i<store[key].length;i++){ try{ if(map.hasLayer(store[key][i])) map.removeLayer(store[key][i]); }catch(e){} }
        delete store[key];
      }
      if(!map || typeof map.addLayer!=='function' || !key) return inner.apply(this,arguments);
      var cap=[], oa=map.addLayer;
      try{
        map.addLayer=function(l){ try{ cap.push(l); }catch(e){} return oa.call(this,l); };
        return inner.apply(this,arguments);
      } finally { map.addLayer=oa; store[key]=cap; }
    };
    w.__aybGhost=true;
    try{ for(var k in inner){ try{ if(Object.prototype.hasOwnProperty.call(inner,k) && !(k in w)) w[k]=inner[k]; }catch(e){} } }catch(e){}
    window[fnName]=w;
    return true;
  }

  /* direk taşınırken bağlı hatlar canlı takip etsin (marker'a dokunmadan) */
  window.updateConnectedLines=function(objId){
    var p=window.project; if(!p||!Array.isArray(p.lines)) return;
    var byId={}; (p.objects||[]).forEach(function(o){ byId[o.id]=o; });
    for(var i=0;i<p.lines.length;i++){
      var l=p.lines[i];
      if(!l || (l.start!==objId && l.end!==objId)) continue;
      var a=byId[l.start], b=byId[l.end]; if(!a||!b) continue;
      var lay=lineLayers2[l.id]; if(!lay) continue;
      for(var j=0;j<lay.length;j++){
        try{
          if(lay[j].setLatLngs) lay[j].setLatLngs([[a.lat,a.lng],[b.lat,b.lng]]);
          else if(lay[j].setLatLng) lay[j].setLatLng([(a.lat+b.lat)/2,(a.lng+b.lng)/2]);
        }catch(e){}
      }
    }
  };

  var kid=function(x){ return x&&x.id; };
  function hepsiniKur(){
    var a=capture('renderObject', objLayers, kid);
    var b=capture('renderLine', lineLayers2, kid);
    capture('renderFreeLine', freeLayers, kid);
    capture('renderArea', areaLayers, kid);
    capture('renderChannel', chanLayers, kid);
    return a||b;
  }
  hepsiniKur();
  var n=0, iv=setInterval(function(){
    hepsiniKur();
    var t=(window.renderObject&&window.renderObject.__aybGhost)&&(window.renderLine&&window.renderLine.__aybGhost)
        &&(!window.renderFreeLine||window.renderFreeLine.__aybGhost)&&(!window.renderArea||window.renderArea.__aybGhost)
        &&(!window.renderChannel||window.renderChannel.__aybGhost);
    if(t || ++n>60) clearInterval(iv);
  }, 400);
})();

/* ===================== KMZ FOTOĞRAFLARI: ÇIKAR + BÜYÜT + İNDİR/PAYLAŞ =====================
   Program KMZ'den sadece KML alıyordu, içindeki fotoğrafları atıyordu. Artık fotoğraflar
   çıkarılıp haritada 📷 olarak gösteriliyor; tıklayınca tam ekran büyüteç, indirme ve paylaşma var. */
(function(){
  "use strict";
  var d=document;
  function M(){ return window.__aybMap||window.map||null; }
  var photos=[], grp=null, shown=false;
  window.aybKmzFotolar=photos;

  /* ---------- ZIP (KMZ) okuma ---------- */
  function u16(b,o){ return b[o]|(b[o+1]<<8); }
  function u32(b,o){ return (b[o]|(b[o+1]<<8)|(b[o+2]<<16)|(b[o+3]<<24))>>>0; }
  async function inflateRaw(bytes){
    if(typeof DecompressionStream==='undefined') throw new Error('sıkıştırma açılamıyor');
    var st=new Blob([bytes]).stream().pipeThrough(new DecompressionStream('deflate-raw'));
    return new Uint8Array(await new Response(st).arrayBuffer());
  }
  async function unzip(ab){
    var b=new Uint8Array(ab), out={}, eocd=-1;
    for(var i=b.length-22;i>=0 && i>b.length-70000;i--){ if(u32(b,i)===0x06054b50){ eocd=i; break; } }
    if(eocd<0) throw new Error('KMZ okunamadı');
    var n=u16(b,eocd+10), off=u32(b,eocd+16);
    for(var k=0;k<n;k++){
      if(u32(b,off)!==0x02014b50) break;
      var method=u16(b,off+10), comp=u32(b,off+20), nl=u16(b,off+28), el=u16(b,off+30), cl=u16(b,off+32), lo=u32(b,off+42);
      var name=new TextDecoder('utf-8').decode(b.slice(off+46,off+46+nl));
      var lfn=u16(b,lo+26), lfe=u16(b,lo+28), st=lo+30+lfn+lfe;
      out[name]={method:method, data:b.slice(st,st+comp)};
      off+=46+nl+el+cl;
    }
    return out;
  }
  function bytesOf(e){ return e.method===0 ? Promise.resolve(e.data) : inflateRaw(e.data); }
  function base(s){ return String(s||'').split('?')[0].split('#')[0].replace(/\\/g,'/').split('/').pop().toLowerCase(); }
  function mimeOf(f){ return /\.png$/i.test(f)?'image/png':/\.webp$/i.test(f)?'image/webp':/\.gif$/i.test(f)?'image/gif':'image/jpeg'; }

  async function extract(ab){
    var files=await unzip(ab), keys=Object.keys(files);
    var kmlKey=null, imgs={};
    keys.forEach(function(k){
      if(/\.kml$/i.test(k) && !kmlKey) kmlKey=k;
      if(/\.(jpe?g|png|webp|gif)$/i.test(k)) imgs[base(k)]=k;
    });
    if(!Object.keys(imgs).length) return [];
    var found=[], used={};
    if(kmlKey){
      var kml=new TextDecoder('utf-8').decode(await bytesOf(files[kmlKey]));
      var xml=new DOMParser().parseFromString(kml,'text/xml');
      var pms=Array.prototype.slice.call(xml.getElementsByTagName('Placemark'));
      for(var i=0;i<pms.length;i++){
        var pm=pms[i];
        var nEl=pm.getElementsByTagName('name')[0];
        var nm=nEl?String(nEl.textContent||'').trim():'';
        var dEl=pm.getElementsByTagName('description')[0];
        var desc=dEl?String(dEl.textContent||''):'';
        var cEl=pm.getElementsByTagName('coordinates')[0];
        var lat=null,lng=null;
        if(cEl){ var p0=String(cEl.textContent||'').trim().split(/\s+/)[0]||''; var pr=p0.split(','); if(pr.length>=2){ lng=parseFloat(pr[0]); lat=parseFloat(pr[1]); } }
        var re=/<img[^>]+src\s*=\s*["']?([^"'>\s]+)/gi, m;
        while((m=re.exec(desc))){
          var bn=base(m[1]);
          if(imgs[bn]){ found.push({name:nm||('Fotoğraf '+(found.length+1)), lat:lat, lng:lng, file:bn, key:imgs[bn], fromDesc:true}); used[bn]=true; }
        }
      }
    }
    Object.keys(imgs).forEach(function(bn){ if(!used[bn]) found.push({name:bn, lat:null, lng:null, file:bn, key:imgs[bn]}); });
    for(var j=0;j<found.length;j++){
      try{
        var by=await bytesOf(files[found[j].key]);
        found[j].blob=new Blob([by],{type:mimeOf(found[j].file)});
        try{ found[j].url=URL.createObjectURL(found[j].blob); }catch(e){ found[j].url=''; }
      }catch(e){ found[j].bad=true; }
    }
    var okList=found.filter(function(f){ return !f.bad; });
    var real=okList.filter(function(f){ return f.fromDesc || (f.blob && f.blob.size>=20000); });   /* <20 KB = büyük ihtimalle simge/ikon */
    return real.length ? real : okList;
  }

  window.aybZipOku=unzip; window.aybZipBayt=bytesOf;
  window.aybKmzFotoTara=async function(src, nameHint){
    try{
      var ab = (src && src.arrayBuffer) ? await src.arrayBuffer() : src;
      var list=await extract(ab);
      if(!list.length) return 0;
      list.forEach(function(f){ photos.push(f); });
      try{ if(window.toast) toast(list.length+' fotoğraf bulundu (📷 Fotoğraflar)'); }catch(e){}
      try{ injectBtn(); drawMarkers(); }catch(e){}
      return list.length;
    }catch(e){ return 0; }
  };

  /* ---------- BÜYÜTEÇ (tam ekran görüntüleyici) ---------- */
  var cur=-1, sc=1, tx=0, ty=0;
  function lb(){
    var el=d.getElementById('aybKmzFotoLb'); if(el) return el;
    el=d.createElement('div'); el.id='aybKmzFotoLb';
    el.style.cssText='position:fixed;inset:0;z-index:2147483000;background:rgba(8,12,20,.96);display:none;flex-direction:column;';
    el.innerHTML=
      '<div style="display:flex;align-items:center;gap:6px;padding:8px 10px;background:#0f172a;color:#fff;flex-wrap:wrap;">'
        +'<b id="aybKmzFotoAd" style="flex:1;min-width:120px;font:600 14px system-ui;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;"></b>'
        +'<button id="aybKmzFotoOut" title="Küçült" style="width:38px;height:34px;border:none;border-radius:8px;background:#334155;color:#fff;font-size:19px;cursor:pointer;">−</button>'
        +'<button id="aybKmzFotoIn" title="Büyüt" style="width:38px;height:34px;border:none;border-radius:8px;background:#334155;color:#fff;font-size:19px;cursor:pointer;">+</button>'
        +'<button id="aybKmzFotoFit" title="Sığdır" style="height:34px;padding:0 10px;border:none;border-radius:8px;background:#334155;color:#fff;font-size:13px;cursor:pointer;">Sığdır</button>'
        +'<button id="aybKmzFotoDl" style="height:34px;padding:0 12px;border:none;border-radius:8px;background:#16a34a;color:#fff;font:700 13px system-ui;cursor:pointer;">⤓ İndir / Paylaş</button>'
        +'<button id="aybKmzFotoSil" style="height:34px;padding:0 12px;border:none;border-radius:8px;background:#dc2626;color:#fff;font:700 13px system-ui;cursor:pointer;">🗑 Sil</button>'
        +'<button id="aybKmzFotoGo" style="height:34px;padding:0 12px;border:none;border-radius:8px;background:#0e7490;color:#fff;font:700 13px system-ui;cursor:pointer;">🧭 Haritada</button>'
        +'<button id="aybKmzFotoX" style="width:38px;height:34px;border:none;border-radius:8px;background:#ef4444;color:#fff;font-size:19px;cursor:pointer;">×</button>'
      +'</div>'
      +'<div id="aybKmzFotoWrap" style="flex:1;overflow:hidden;position:relative;touch-action:none;display:flex;align-items:center;justify-content:center;">'
        +'<img id="aybKmzFotoImg" alt="" style="max-width:100%;max-height:100%;transform-origin:center center;user-select:none;-webkit-user-drag:none;">'
      +'</div>'
      +'<div style="display:flex;gap:8px;justify-content:center;padding:6px;background:#0f172a;">'
        +'<button id="aybKmzFotoPrev" style="height:34px;padding:0 14px;border:none;border-radius:8px;background:#334155;color:#fff;cursor:pointer;">‹ Önceki</button>'
        +'<span id="aybKmzFotoNo" style="color:#cbd5e1;font:600 13px system-ui;line-height:34px;"></span>'
        +'<button id="aybKmzFotoNext" style="height:34px;padding:0 14px;border:none;border-radius:8px;background:#334155;color:#fff;cursor:pointer;">Sonraki ›</button>'
      +'</div>';
    d.body.appendChild(el);
    var img=el.querySelector('#aybKmzFotoImg'), wrap=el.querySelector('#aybKmzFotoWrap');
    function apply(){ img.style.transform='translate('+tx+'px,'+ty+'px) scale('+sc+')'; }
    function fit(){ sc=1; tx=0; ty=0; apply(); }
    el.querySelector('#aybKmzFotoX').onclick=function(){ el.style.display='none'; };
    el.querySelector('#aybKmzFotoIn').onclick=function(){ sc=Math.min(8,sc*1.35); apply(); };
    el.querySelector('#aybKmzFotoOut').onclick=function(){ sc=Math.max(0.2,sc/1.35); apply(); };
    el.querySelector('#aybKmzFotoFit').onclick=fit;
    el.querySelector('#aybKmzFotoPrev').onclick=function(){ if(photos.length) open((cur-1+photos.length)%photos.length); };
    el.querySelector('#aybKmzFotoNext').onclick=function(){ if(photos.length) open((cur+1)%photos.length); };
    el.querySelector('#aybKmzFotoDl').onclick=function(){
      var f=photos[cur]; if(!f||!f.blob) return;
      var nm=(String(f.name||'foto').replace(/[^\wğüşıöçĞÜŞİÖÇ .-]/g,'_').slice(0,50))+'_'+f.file;
      if(window.aybShareFile){ try{ window.aybShareFile(nm, f.blob, f.blob.type); return; }catch(e){} }
      try{ var a=d.createElement('a'); a.href=f.url; a.download=nm; d.body.appendChild(a); a.click(); setTimeout(function(){ a.remove(); },500); }catch(e){}
    };
    function idbFotoSil(objId, idx, cb){
      try{
        var r=indexedDB.open('ayb_photos_db',1);
        r.onupgradeneeded=function(){ try{ r.result.createObjectStore('photos',{keyPath:'id'}); }catch(e){} };
        r.onsuccess=function(){
          var db=r.result;
          try{
            var t=db.transaction('photos','readwrite'), st=t.objectStore('photos');
            var g=st.get(objId);
            g.onsuccess=function(){
              var rec=g.result; if(!rec||!rec.items){ cb&&cb(0); return; }
              rec.items.splice(idx,1); st.put(rec);
              t.oncomplete=function(){ cb&&cb(rec.items.length); };
            };
            g.onerror=function(){ cb&&cb(-1); };
          }catch(e){ cb&&cb(-1); }
        };
        r.onerror=function(){ cb&&cb(-1); };
      }catch(e){ cb&&cb(-1); }
    }
    el.querySelector('#aybKmzFotoSil').onclick=function(){
      var f=photos[cur]; if(!f) return;
      var ok=true; try{ ok=window.confirm('Bu fotoğraf silinsin mi?'); }catch(e){}
      if(!ok) return;
      if(f.objId!=null && f.objIdx!=null){
        idbFotoSil(f.objId, f.objIdx, function(kalan){
          try{
            var p=window.project;
            if(p&&Array.isArray(p.objects)){ for(var i=0;i<p.objects.length;i++){ if(p.objects[i].id===f.objId){ p.objects[i].props=p.objects[i].props||{}; if(kalan>=0) p.objects[i].props._fotoAdet=kalan; break; } } }
            if(window.saveProject) window.saveProject();
            if(window.renderAll) window.renderAll();
          }catch(e){}
          try{ if(window.toast) toast('Fotoğraf silindi'+(kalan>=0?(' ('+kalan+' kaldı)'):'')+'.'); }catch(e){}
        });
      } else {
        try{ if(window.toast) toast('Fotoğraf listeden kaldırıldı.'); }catch(e){}
      }
      photos.splice(cur,1);
      try{ drawMarkers(); }catch(e){}
      if(!photos.length){ el.style.display='none'; return; }
      open(Math.min(cur, photos.length-1));
    };
    el.querySelector('#aybKmzFotoGo').onclick=function(){
      var f=photos[cur], map=M();
      if(!f||f.lat==null||!map||typeof map.setView!=='function'){ try{ if(window.toast) toast('Bu fotoğrafın konumu yok'); }catch(e){} return; }
      el.style.display='none';
      try{ map.setView([f.lat,f.lng], Math.max((map.getZoom&&map.getZoom())||0,19), {animate:true}); }catch(e){}
    };
    /* fare tekeri + parmakla yakınlaştırma/kaydırma */
    wrap.addEventListener('wheel', function(e){ e.preventDefault(); sc=Math.max(0.2,Math.min(8, sc*(e.deltaY<0?1.15:0.87))); apply(); }, {passive:false});
    var drag=false, sx=0, sy=0, pinch=0, base0=1;
    wrap.addEventListener('pointerdown', function(e){ drag=true; sx=e.clientX-tx; sy=e.clientY-ty; try{ wrap.setPointerCapture(e.pointerId); }catch(_){} });
    wrap.addEventListener('pointermove', function(e){ if(!drag) return; tx=e.clientX-sx; ty=e.clientY-sy; apply(); });
    wrap.addEventListener('pointerup', function(){ drag=false; });
    wrap.addEventListener('touchstart', function(e){ if(e.touches.length===2){ pinch=Math.hypot(e.touches[0].clientX-e.touches[1].clientX, e.touches[0].clientY-e.touches[1].clientY); base0=sc; } }, {passive:true});
    wrap.addEventListener('touchmove', function(e){
      if(e.touches.length===2 && pinch){ e.preventDefault();
        var dd=Math.hypot(e.touches[0].clientX-e.touches[1].clientX, e.touches[0].clientY-e.touches[1].clientY);
        sc=Math.max(0.2,Math.min(8, base0*(dd/pinch))); apply(); }
    }, {passive:false});
    wrap.addEventListener('touchend', function(e){ if(e.touches.length<2) pinch=0; });
    wrap.addEventListener('dblclick', function(){ sc = sc>1.2 ? 1 : 2.5; tx=0; ty=0; apply(); });
    el.__fit=fit;
    return el;
  }
  function open(i){
    if(!photos.length) return;
    cur=Math.max(0,Math.min(photos.length-1,i));
    var el=lb(), f=photos[cur];
    var imgEl=el.querySelector('#aybKmzFotoImg');
    imgEl.src=f.url||'';
    var adEl=el.querySelector('#aybKmzFotoAd');
    function bilgi(){
      var kb=f.blob?Math.round(f.blob.size/1024):0;
      var boyut=(imgEl.naturalWidth?(imgEl.naturalWidth+'×'+imgEl.naturalHeight+' piksel'):'');
      adEl.textContent=(f.name||'Fotoğraf')+'  ('+f.file+(boyut?' • '+boyut:'')+(kb?' • '+kb+' KB':'')+')';
    }
    imgEl.onload=bilgi; bilgi();
    el.querySelector('#aybKmzFotoNo').textContent=(cur+1)+' / '+photos.length;
    el.querySelector('#aybKmzFotoGo').style.display=(f.lat==null?'none':'');
    el.style.display='flex';
    try{ el.__fit(); }catch(e){}
  }
  window.aybFotoAc=open;

  /* ---------- haritada 📷 işaretleri ---------- */
  function drawMarkers(){
    var map=M(), L=window.L; if(!map||!L) return;
    if(!grp) grp=L.layerGroup().addTo(map);
    grp.clearLayers();
    photos.forEach(function(f,i){
      if(f.lat==null||f.lng==null) return;
      var mk=L.marker([f.lat,f.lng],{zIndexOffset:1200,icon:L.divIcon({className:'',iconSize:[30,30],iconAnchor:[15,15],
        html:'<div style="width:28px;height:28px;border-radius:8px;background:#f59e0b;border:2px solid #fff;box-shadow:0 2px 6px rgba(0,0,0,.5);display:flex;align-items:center;justify-content:center;font-size:15px;">📷</div>'})});
      mk.on('click', function(e){ try{ if(e&&e.originalEvent&&window.L) L.DomEvent.stopPropagation(e.originalEvent); }catch(_){} open(i); });
      grp.addLayer(mk);
    });
    shown=true;
  }

  /* ---------- galeri paneli ---------- */
  function panel(){
    var el=d.getElementById('aybKmzFotoPanel');
    if(!el){
      el=d.createElement('div'); el.id='aybKmzFotoPanel';
      el.style.cssText='position:fixed;top:100px;right:10px;z-index:2147481300;width:330px;max-width:94vw;max-height:70vh;overflow:auto;background:#fff;border:1px solid #c7d0de;border-radius:12px;box-shadow:0 16px 40px rgba(0,0,0,.35);font:13px system-ui;display:none;';
      d.body.appendChild(el);
    }
    el.innerHTML='<div style="display:flex;align-items:center;gap:8px;background:#f59e0b;color:#111;padding:9px 12px;position:sticky;top:0;">'
      +'<b style="flex:1;">📷 KMZ Fotoğrafları ('+photos.length+')</b>'
      +'<button id="aybKmzFotoAll" title="Tüm fotoğrafları indir" style="border:none;background:#16a34a;color:#fff;border-radius:6px;height:24px;padding:0 8px;font:700 11px system-ui;cursor:pointer;margin-right:4px;">⤓ Tümü</button>'
      +'<button id="aybKmzFotoPX" style="border:none;background:#ef4444;color:#fff;border-radius:6px;width:24px;height:24px;font-size:15px;cursor:pointer;">×</button></div>'
      +'<div id="aybKmzFotoGrid" style="display:grid;grid-template-columns:1fr 1fr;gap:8px;padding:10px;"></div>';
    el.querySelector('#aybKmzFotoPX').onclick=function(){ el.style.display='none'; };
    el.querySelector('#aybKmzFotoAll').onclick=function(){
      photos.forEach(function(f,i){
        setTimeout(function(){
          try{
            var nm=(String(f.name||'foto').replace(/[^\wğüşıöçĞÜŞİÖÇ .-]/g,'_').slice(0,40))+'_'+f.file;
            var a=d.createElement('a'); a.href=f.url; a.download=nm; d.body.appendChild(a); a.click();
            setTimeout(function(){ a.remove(); },800);
          }catch(e){}
        }, i*350);
      });
      try{ if(window.toast) toast(photos.length+' fotoğraf indiriliyor...'); }catch(e){}
    };
    var g=el.querySelector('#aybKmzFotoGrid');
    photos.forEach(function(f,i){
      var c=d.createElement('div');
      c.style.cssText='cursor:pointer;border:1px solid #e2e8f0;border-radius:8px;overflow:hidden;background:#f8fafc;';
      c.innerHTML='<img src="'+(f.url||'')+'" style="width:100%;height:88px;object-fit:cover;display:block;">'
        +'<div style="padding:4px 6px;font:600 11px system-ui;color:#334155;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">'+(f.name||f.file)+'</div>';
      c.onclick=function(){ open(i); };
      g.appendChild(c);
    });
    return el;
  }
  function togglePanel(){ if(!photos.length){ try{ if(window.toast) toast('Henüz KMZ fotoğrafı yok. KMZ dosyası içeri alın.'); }catch(e){} return; } var el=panel(); el.style.display=(el.style.display==='none'?'block':'none'); drawMarkers(); }
  window.aybFotoGaleri=togglePanel;

  function injectBtn(){
    if(d.getElementById('aybKmzFotoBtn')) return true;
    var a=d.getElementById('aybTbBtn')||d.getElementById('aybTfBtn')||d.getElementById('btnCadTop');
    if(!a||!a.parentNode) return false;
    var b=d.createElement('button'); b.id='aybKmzFotoBtn'; b.type='button'; b.className=a.className;
    b.title='KMZ Fotoğrafları - büyüt, indir, paylaş';
    b.innerHTML='<div class="ayb-pro-ico" style="color:#f59e0b;">📷</div><small>Fotoğraflar</small>';
    b.addEventListener('click', function(e){ try{ e.preventDefault(); e.stopPropagation(); }catch(_){} togglePanel(); });
    a.parentNode.insertBefore(b, a.nextSibling);
    return true;
  }
  try{ var t=0, iv=setInterval(function(){ if(injectBtn()|| ++t>60) clearInterval(iv); },600); }catch(e){}

  /* ---------- KMZ seçilince otomatik tara ---------- */
  try{
    d.addEventListener('change', function(e){
      var inp=e.target;
      if(!inp || inp.tagName!=='INPUT' || (inp.type||'').toLowerCase()!=='file') return;
      var fs=inp.files; if(!fs||!fs.length) return;
      for(var i=0;i<fs.length;i++){ if(/\.kmz$/i.test(fs[i].name)) window.aybKmzFotoTara(fs[i], fs[i].name); }
    }, true);
  }catch(e){}

  /* ---------- her resme tıklayınca büyüteç (popup içindeki fotoğraflar dahil) ---------- */
  try{
    d.addEventListener('click', function(e){
      var t2=e.target;
      if(!t2 || t2.tagName!=='IMG') return;
      if(d.getElementById('aybKmzFotoLb') && d.getElementById('aybKmzFotoLb').contains(t2)) return;
      if(d.getElementById('aybKmzFotoPanel') && d.getElementById('aybKmzFotoPanel').contains(t2)) return;
      /* obje fotoğraf penceresine ve diğer uygulama pencerelerine karışma (silme düğmeleri çalışsın) */
      try{ if(t2.className && String(t2.className).indexOf('ayb-obj-foto')>=0) return; }catch(_){}
      try{ if(!t2.closest || !t2.closest('.leaflet-popup')) return; }catch(_){ return; }
      var src=t2.getAttribute('src')||'';
      if(!src || /^data:image\/svg/i.test(src)) return;
      if((t2.naturalWidth||t2.width||0) < 90) return;   /* ikon/simge değil, gerçek fotoğraf */
      try{ e.preventDefault(); e.stopPropagation(); }catch(_){}
      var idx=-1; for(var i=0;i<photos.length;i++){ if(photos[i].url===src){ idx=i; break; } }
      if(idx>=0){ open(idx); return; }
      fetch(src).then(function(r){ return r.blob(); }).then(function(bl){
        photos.push({name:(t2.getAttribute('alt')||'Fotoğraf'), lat:null, lng:null, file:(src.split('/').pop()||'foto.jpg').split('?')[0], blob:bl, url:src});
        open(photos.length-1);
      }).catch(function(){ photos.push({name:'Fotoğraf', lat:null,lng:null,file:'foto.jpg', blob:null, url:src}); open(photos.length-1); });
    }, true);
  }catch(e){}
})();

/* ===================== PC'DE CANLI HAT ÖNİZLEME (fare ucunda hat + canlı metre) =====================
   PC'de hat çizerken fare ucunda hat görünmüyordu. Artık fareyle birlikte hat ve uzunluk canlı gelir. */
(function(){
  "use strict";
  var d=document;
  function M(){ return window.__aybMap||window.map||null; }
  var pend=null, raf=0, prevLayer=null, tip=null, lastXY=null, snapT=0, snapCache=null;

  function tipEl(){
    if(tip && tip.parentNode) return tip;
    tip=d.createElement('div');
    tip.style.cssText='position:fixed;z-index:2147481000;pointer-events:none;background:rgba(15,23,42,.92);color:#fff;'
      +'font:700 12px system-ui;padding:3px 8px;border-radius:6px;white-space:nowrap;display:none;box-shadow:0 2px 8px rgba(0,0,0,.4);';
    d.body.appendChild(tip);
    return tip;
  }
  function hideTip(){ if(tip) tip.style.display='none'; }

  function uzunluk(map, pts){
    var t=0;
    for(var i=1;i<pts.length;i++){
      try{ t+=map.distance(pts[i-1], pts[i]); }catch(e){}
    }
    return t;
  }

  function tick(){
    var ll=pend; pend=null;
    var map=M(); if(!ll||!map) return;
    /* en yakın objeye yapış (hata verirse yine de önizleme çizilsin) */
    var snapObj=null;
    try{
      if(typeof window.findNearestObject==='function'){
        var now=Date.now();
        if(now-snapT>60){                         /* yakalama aramasi en fazla ~16/sn (tablette akicilik) */
          snapT=now;
          var px=14;
          try{ if(typeof window.aybObjectSnapPx==='function') px=window.aybObjectSnapPx(window.activeTool)||14; }catch(e){}
          snapCache=window.findNearestObject(ll,px)||null;
        }
        snapObj=snapCache;
      }
    }catch(e){ snapObj=null; }
    /* önizlemeyi çiz + oluşturulan katmanı yakala */
    var oa=map.addLayer, captured=null;
    try{
      map.addLayer=function(l){ try{ if(!captured && window.L && window.L.Polyline && (l instanceof window.L.Polyline)) captured=l; }catch(_){} return oa.call(this,l); };
      if(typeof window.updateLinePreview==='function') window.updateLinePreview(ll, snapObj);
    }catch(e){ }
    finally{ map.addLayer=oa; }
    if(captured) prevLayer=captured;
    /* canlı metre */
    try{
      var pts=(prevLayer && map.hasLayer(prevLayer) && prevLayer.getLatLngs) ? prevLayer.getLatLngs() : null;
      if(pts && pts.length>1 && lastXY){
        var tot=uzunluk(map, pts);
        var son=uzunluk(map, [pts[pts.length-2], pts[pts.length-1]]);
        var e=tipEl();
        e.textContent = (pts.length>2 ? (son.toFixed(1)+' m  •  toplam '+tot.toFixed(1)+' m') : (tot.toFixed(1)+' m'));
        e.style.left=(lastXY[0]+16)+'px'; e.style.top=(lastXY[1]+16)+'px'; e.style.display='block';
      } else hideTip();
    }catch(e){ hideTip(); }
  }

  function onMove(e){
    if(!e||!e.latlng) return;
    pend=e.latlng;
    try{ if(e.originalEvent) lastXY=[e.originalEvent.clientX, e.originalEvent.clientY]; }catch(_){}
    if(raf) return;
    raf=1;
    var rq=window.requestAnimationFrame||function(f){ return setTimeout(f,16); };
    rq(function(){ raf=0; tick(); });
  }

  var n=0, iv=setInterval(function(){
    var m=M();
    if(m && typeof m.on==='function' && !m.__aybLivePrev){
      m.__aybLivePrev=true;
      try{
        m.on('mousemove', onMove);
        m.on('mouseout', hideTip);
        m.on('click', function(){ setTimeout(function(){ pend=null; hideTip(); },10); });
      }catch(e){}
      clearInterval(iv); return;
    }
    if(++n>80) clearInterval(iv);
  }, 400);
})();

/* ===================== SİLME KESİNLEŞTİRME (silinen direk/hat ekranda kalmasın) =====================
   Silinen objenin/hattın katmanı programın kaydında yoksa haritada asılı kalıyordu.
   Artık her silmeden sonra o kimliğe ait tüm katmanlar haritadan kesin kaldırılır. */
(function(){
  "use strict";
  function M(){ return window.__aybMap||window.map||null; }
  function temizle(){
    var map=M(), st=window.__aybKatmanKayit, p=window.project;
    if(!map||!st||!p) return 0;
    var oid={}, lid={}, fid={}, aid={}, cid={}, n=0;
    (p.objects||[]).forEach(function(o){ if(o&&o.id!=null) oid[o.id]=1; });
    (p.lines||[]).forEach(function(l){ if(l&&l.id!=null) lid[l.id]=1; });
    (p.freeLines||[]).forEach(function(l){ if(l&&l.id!=null) fid[l.id]=1; });
    (p.areas||[]).forEach(function(l){ if(l&&l.id!=null) aid[l.id]=1; });
    (p.channels||[]).forEach(function(l){ if(l&&l.id!=null) cid[l.id]=1; });
    function sil(store, canli){
      Object.keys(store).forEach(function(id){
        if(canli[id]) return;
        (store[id]||[]).forEach(function(l){ try{ if(map.hasLayer(l)){ map.removeLayer(l); n++; } }catch(e){} });
        delete store[id];
      });
    }
    try{ sil(st.obj, oid); }catch(e){}
    try{ sil(st.line, lid); }catch(e){}
    try{ if(st.free) sil(st.free, fid); }catch(e){}
    try{ if(st.area) sil(st.area, aid); }catch(e){}
    try{ if(st.chan) sil(st.chan, cid); }catch(e){}
    return n;
  }
  window.aybArtikTemizle=temizle;

  function sonrasi(){
    /* devam eden hat/çizim varsa bitir: yoksa son direkten imlece uzanan ÖNİZLEME ekranda kalıp
       "hat silinmedi" gibi görünüyor */
    try{ if(typeof window.finishCurrentOperation==='function') window.finishCurrentOperation(); }catch(e){}
    try{ if(typeof window.clearLinePreview==='function') window.clearLinePreview(); }catch(e){}
    try{ if(typeof window.aybRubberTemizle==='function') window.aybRubberTemizle(); }catch(e){}
    setTimeout(function(){
      try{ temizle(); }catch(e){}
      /* silmeden sonra HER ZAMAN tam yeniden çizim: ekran veriyle birebir olsun */
      try{ if(window.aybForceFullRender) window.aybForceFullRender(); else if(window.renderAll) window.renderAll(); }catch(e){}
      try{ temizle(); }catch(e){}
    }, 0);
  }
  function sar(hedef, ad){
    try{
      var o=hedef&&hedef.obj; if(!o||typeof o[ad]!=='function'||o[ad].__aybDel) return false;
      var inner=o[ad];
      var w=function(){ var r; try{ r=inner.apply(this,arguments); } finally { sonrasi(); } return r; };
      w.__aybDel=true; o[ad]=w; return true;
    }catch(e){ return false; }
  }
  function kur(){
    sar({obj:window.APP},'deleteLine');
    sar({obj:window.APP},'deleteObject');
    sar({obj:window.APP},'deleteChannel');
    sar({obj:window.APP},'deleteFree');        /* ok / bina / çizgi / kanal silme */
    sar({obj:window.AYBSelectDelete},'deleteObjects');   /* seçimle toplu silme (her seçimde yeniden oluşur) */
    sar({obj:window.AYBSelectDelete},'deleteAll');
  }
  /* elle "Ekranı Yenile": takılan/kalıntı çizim varsa tek dokunuşla temizler */
  function yenile(){
    try{ if(typeof window.finishCurrentOperation==='function') window.finishCurrentOperation(); }catch(e){}
    try{ if(typeof window.clearLinePreview==='function') window.clearLinePreview(); }catch(e){}
    try{ if(typeof window.aybRubberTemizle==='function') window.aybRubberTemizle(); }catch(e){}
    var n=0; try{ n=temizle(); }catch(e){}
    try{ if(window.aybForceFullRender) window.aybForceFullRender(); else if(window.renderAll) window.renderAll(); }catch(e){}
    try{ n+=temizle(); }catch(e){}
    try{ if(window.toast) toast(n? ('Ekran yenilendi, '+n+' kalıntı temizlendi.') : 'Ekran yenilendi.'); }catch(e){}
  }
  window.aybEkraniYenile=yenile;
  function btn(){
    if(document.getElementById('aybYenileBtn')) return true;
    var a=document.getElementById('aybKmzFotoBtn')||document.getElementById('aybTbBtn')||document.getElementById('aybTfBtn')||document.getElementById('btnCadTop');
    if(!a||!a.parentNode) return false;
    var b=document.createElement('button'); b.id='aybYenileBtn'; b.type='button'; b.className=a.className;
    b.title='Ekranı Yenile - takılan çizim veya kalıntı varsa temizler';
    b.innerHTML='<div class="ayb-pro-ico" style="color:#0ea5e9;">🧹</div><small>Ekranı Yenile</small>';
    b.addEventListener('click', function(e){ try{e.preventDefault();e.stopPropagation();}catch(_){} yenile(); });
    a.parentNode.insertBefore(b, a.nextSibling);
    return true;
  }
  var bt=0, biv=setInterval(function(){ if(btn()|| ++bt>80) clearInterval(biv); }, 600);

  kur();
  setInterval(kur, 1500);
  setInterval(function(){ try{ temizle(); }catch(e){} try{ if(window.aybNotesSenkron) window.aybNotesSenkron(); }catch(e){} }, 2500);   /* güvenlik ağı */
})();

/* ===================== ÇİZİM ARAÇLARI DÜZELTMESİ (çizgi / ok / ölçüm) =====================
   1) Sağ tık artık ÖLÇÜM dahil her çizimi bitirir.
   2) Çift tıkta fazladan nokta/çizgi eklenmesi engellendi (ikinci tık yutulur, çizim biter).
   3) Çizim sürerken ekranda büyük "✔ Bitir / ✖ İptal" düğmesi çıkar (tablette parmakla kolay).
   4) Çizgi/ok/kanal çizerken imleçte canlı çizgi + uzunluk görünür. */
(function(){
  "use strict";
  var d=document;
  function M(){ return window.__aybMap||window.map||null; }
  var tempCap=null, rubber=null, tip=null, lastXY=null;

  /* ---- programın geçici çizim katmanını yakala (son noktayı bilmek için) ---- */
  function wrapDrawTemp(){
    var cur=window.drawTemp;
    if(typeof cur!=='function' || cur.__aybTmp) return false;
    var inner=cur;
    var w=function(){
      var map=M(), oa=null, cap=null;
      if(map && typeof map.addLayer==='function'){
        oa=map.addLayer;
        map.addLayer=function(l){ try{ if(!cap && window.L && window.L.Polyline && (l instanceof window.L.Polyline)) cap=l; }catch(_){} return oa.call(this,l); };
      }
      try{ return inner.apply(this,arguments); }
      finally{ if(oa && map) map.addLayer=oa; if(cap) tempCap=cap; }
    };
    w.__aybTmp=true; window.drawTemp=w; return true;
  }
  function tempPts(){
    var map=M();
    if(!tempCap||!map||!map.hasLayer(tempCap)||!tempCap.getLatLngs) return null;
    var a=tempCap.getLatLngs();
    if(a && a.length && Array.isArray(a[0])) a=a[0];      /* poligon */
    return (a && a.length) ? a : null;
  }
  function olcumAktif(){ return window.__kfMeasureActive===true; }
  function cizimAktif(){ return !!tempPts() || olcumAktif(); }

  /* ---- imleçte canlı çizgi + uzunluk ---- */
  function tipEl(){
    if(tip && tip.parentNode) return tip;
    tip=d.createElement('div');
    tip.style.cssText='position:fixed;z-index:2147481000;pointer-events:none;background:rgba(15,23,42,.92);color:#fff;font:700 12px system-ui;padding:3px 8px;border-radius:6px;white-space:nowrap;display:none;';
    d.body.appendChild(tip); return tip;
  }
  function temizleRubber(){
    var map=M();
    try{ if(rubber&&map&&map.hasLayer(rubber)) map.removeLayer(rubber); }catch(e){}
    rubber=null;
    if(tip) tip.style.display='none';
  }
  function rubberCiz(latlng){
    var map=M(), L=window.L, pts=tempPts();
    if(!map||!L||!pts||!latlng){ temizleRubber(); return; }
    var son=pts[pts.length-1];
    var arr=[[son.lat,son.lng],[latlng.lat,latlng.lng]];
    try{
      if(!rubber) rubber=L.polyline(arr,{color:'#f97316',weight:3,dashArray:'7 6',opacity:.9,interactive:false}).addTo(map);
      else rubber.setLatLngs(arr);
    }catch(e){ return; }
    try{
      var m1=map.distance(son, latlng), tot=0;
      for(var i=1;i<pts.length;i++) tot+=map.distance(pts[i-1],pts[i]);
      tot+=m1;
      if(lastXY){
        var e2=tipEl();
        e2.textContent=(pts.length>1? (m1.toFixed(1)+' m  •  toplam '+tot.toFixed(1)+' m') : (m1.toFixed(1)+' m'));
        e2.style.left=(lastXY[0]+16)+'px'; e2.style.top=(lastXY[1]+16)+'px'; e2.style.display='block';
      }
    }catch(e){}
  }

  /* ---- bitirme ---- */
  function bitir(){
    if(olcumAktif()){
      var map=M(); if(!map) return;
      try{
        var c=map.getContainer(), r=c.getBoundingClientRect();
        var x=(lastXY?lastXY[0]:r.left+r.width/2), y=(lastXY?lastXY[1]:r.top+r.height/2);
        c.dispatchEvent(new MouseEvent('dblclick',{bubbles:true,cancelable:true,view:window,clientX:x,clientY:y}));
      }catch(e){}
      temizleRubber();
      return;
    }
    try{ if(typeof window.finishCurrentOperation==='function') window.finishCurrentOperation(); }catch(e){}
    temizleRubber();
  }
  function iptal(){
    if(olcumAktif()){ try{ var b=d.getElementById('kfMeasureClear'); if(b) b.click(); }catch(e){} temizleRubber(); return; }
    try{ if(typeof window.cancelTool==='function') window.cancelTool(); else if(typeof window.finishCurrentOperation==='function') window.finishCurrentOperation(); }catch(e){}
    temizleRubber();
  }
  window.aybCizimBitir=bitir; window.aybCizimIptal=iptal; window.aybRubberTemizle=temizleRubber;

  /* ---- çift tıkta fazladan nokta eklenmesini engelle (ikinci tıkı yut) ---- */
  var lt=0, lx=0, ly=0;
  d.addEventListener('click', function(e){
    if(!cizimAktif()) return;
    var map=M(); if(!map) return;
    try{ var c=map.getContainer(); if(!c || !c.contains(e.target)) return; }catch(_){ return; }
    var t=Date.now();
    if(t-lt<340 && Math.abs(e.clientX-lx)<16 && Math.abs(e.clientY-ly)<16){
      try{ e.stopImmediatePropagation(); e.stopPropagation(); e.preventDefault(); }catch(_){}
      lt=0; return;                       /* ikinci tık yutuldu -> sadece 'çift tık' bitirir */
    }
    lt=t; lx=e.clientX; ly=e.clientY;
  }, true);

  /* ---- ekranda Bitir / İptal düğmeleri ---- */
  function bar(){
    var el=d.getElementById('aybCizimBar');
    if(el) return el;
    el=d.createElement('div'); el.id='aybCizimBar';
    el.style.cssText='position:fixed;left:50%;transform:translateX(-50%);bottom:74px;z-index:2147481500;display:none;gap:8px;';
    el.innerHTML='<button id="aybCizBitir" style="height:44px;padding:0 18px;border:none;border-radius:10px;background:#16a34a;color:#fff;font:800 15px system-ui;box-shadow:0 4px 14px rgba(0,0,0,.35);cursor:pointer;">✔ Bitir</button>'
      +'<button id="aybCizIptal" style="height:44px;padding:0 16px;border:none;border-radius:10px;background:#ef4444;color:#fff;font:800 15px system-ui;box-shadow:0 4px 14px rgba(0,0,0,.35);cursor:pointer;">✖ İptal</button>';
    d.body.appendChild(el);
    el.querySelector('#aybCizBitir').addEventListener('click', function(ev){ try{ev.preventDefault();ev.stopPropagation();}catch(_){} bitir(); });
    el.querySelector('#aybCizIptal').addEventListener('click', function(ev){ try{ev.preventDefault();ev.stopPropagation();}catch(_){} iptal(); });
    return el;
  }
  setInterval(function(){
    try{
      var el=bar(), a=cizimAktif();
      el.style.display=a?'flex':'none';
      if(!a) temizleRubber();
    }catch(e){}
  }, 400);

  /* ---- harita olaylarını bağla ---- */
  var n=0, iv=setInterval(function(){
    var m=M();
    if(m && typeof m.on==='function' && !m.__aybDrawFix){
      m.__aybDrawFix=true;
      try{
        m.on('mousemove', function(e){
          try{ if(e.originalEvent) lastXY=[e.originalEvent.clientX,e.originalEvent.clientY]; }catch(_){}
          if(cizimAktif() && !olcumAktif()) rubberCiz(e.latlng); else if(!cizimAktif()) temizleRubber();
        });
        m.on('contextmenu', function(e){
          try{ if(e.originalEvent){ e.originalEvent.preventDefault(); } }catch(_){}
          if(olcumAktif()) bitir();          /* ölçüm: sağ tık artık bitiriyor */
        });
        m.on('mouseout', function(){ if(tip) tip.style.display='none'; });
      }catch(e){}
      clearInterval(iv); return;
    }
    if(++n>80) clearInterval(iv);
  }, 400);

  var t2=0, iv2=setInterval(function(){ if(wrapDrawTemp() || ++t2>60) clearInterval(iv2); }, 500);
})();

/* ===================== 1) MİF/KMZ ALTLIK HIZLANDIRMA (canvas) =====================
   İçe aktarılan altlık binlerce ayrı SVG katmanı olarak çiziliyordu -> zoom/kaydırmada donma.
   Aynı veriler artık tek bir canvas üzerine çizilir (çok daha hızlı). */
(function(){
  "use strict";
  var canv=null;
  function R(){ try{ if(!canv && window.L && window.L.canvas) canv=window.L.canvas({padding:0.4}); }catch(e){} return canv||undefined; }
  function patch(){
    var L=window.L; if(!L) return false;
    var ok=false;
    ['circleMarker','polyline','polygon'].forEach(function(fn){
      var orig=L[fn];
      if(typeof orig!=='function' || orig.__aybCanvas) return;
      var w=function(a,opts){
        try{
          /* içe aktarılan altlık çizimleri (turuncu) ve serbest çizimler canvas'a gitsin */
          if(opts && !opts.renderer && (opts.color==='#f97316' || opts.fillColor==='#fef3c7')){
            var o2={}; for(var k in opts) o2[k]=opts[k]; o2.renderer=R(); opts=o2;
          }
        }catch(e){}
        return orig.call(this,a,opts);
      };
      w.__aybCanvas=true;
      try{ for(var k2 in orig){ if(Object.prototype.hasOwnProperty.call(orig,k2)) w[k2]=orig[k2]; } }catch(e){}
      L[fn]=w; ok=true;
    });
    return ok;
  }
  patch();
  var n=0, iv=setInterval(function(){ if(patch() || ++n>40) clearInterval(iv); }, 300);
})();

/* ===================== 2) TOPLU SİLME: alan çiz -> içindekileri sil ===================== */
(function(){
  "use strict";
  var d=document;
  function M(){ return window.__aybMap||window.map||null; }
  var aktif=false, pts=[], poly=null, marks=[], bar=null;

  function icinde(lat,lng,ring){
    var inside=false;
    for(var i=0,j=ring.length-1;i<ring.length;j=i++){
      var xi=ring[i][1], yi=ring[i][0], xj=ring[j][1], yj=ring[j][0];
      if(((yi>lat)!==(yj>lat)) && (lng < (xj-xi)*(lat-yi)/((yj-yi)||1e-12)+xi)) inside=!inside;
    }
    return inside;
  }
  function ciz(){
    var map=M(), L=window.L; if(!map||!L) return;
    var arr=pts.map(function(p){ return [p.lat,p.lng]; });
    if(poly){ try{ map.removeLayer(poly); }catch(e){} poly=null; }
    if(arr.length>=2){
      poly = (arr.length>=3 ? L.polygon(arr,{color:'#ef4444',weight:3,dashArray:'8 6',fillColor:'#ef4444',fillOpacity:.12,interactive:false})
                            : L.polyline(arr,{color:'#ef4444',weight:3,dashArray:'8 6',interactive:false})).addTo(map);
    }
    marks.forEach(function(m){ try{ map.removeLayer(m); }catch(e){} }); marks=[];
    arr.forEach(function(a){
      try{ marks.push(L.circleMarker(a,{radius:5,color:'#ef4444',weight:2,fillColor:'#fff',fillOpacity:1,interactive:false}).addTo(map)); }catch(e){}
    });
    if(bar){ var c=bar.querySelector('#aybSilSay'); if(c) c.textContent=pts.length+' nokta'; }
  }
  function kapat(){
    var map=M();
    aktif=false; pts=[];
    if(poly){ try{ map&&map.removeLayer(poly); }catch(e){} poly=null; }
    marks.forEach(function(m){ try{ map&&map.removeLayer(m); }catch(e){} }); marks=[];
    if(bar) bar.style.display='none';
    try{ d.body.style.cursor=''; }catch(e){}
  }
  function uygula(){
    var p=window.project;
    if(!p||pts.length<3){ try{ if(window.toast) toast('En az 3 nokta ile kapalı alan çizin.'); }catch(e){} return; }
    var ring=pts.map(function(q){ return [q.lat,q.lng]; });
    var silObj=(p.objects||[]).filter(function(o){ return o && o.lat!=null && o.lng!=null && icinde(o.lat,o.lng,ring); });
    /* yapışkan notlar + serbest çizim / alan / kanal da alan içindeyse silinsin */
    function ortada(pts){
      if(!pts||!pts.length) return false;
      var say=0; for(var i=0;i<pts.length;i++){ var q=pts[i]; var la=(q&&q.length)?q[0]:q.lat, ln=(q&&q.length)?q[1]:q.lng; if(icinde(la,ln,ring)) say++; }
      return say>=Math.max(1,Math.ceil(pts.length/2));       /* noktalarının yarısı içerideyse */
    }
    var silNot=(p.aybNotes||[]).filter(function(n){ if(!n) return false; var la=(n.noteLat!=null?n.noteLat:n.lat), ln=(n.noteLng!=null?n.noteLng:n.lng); return la!=null && (icinde(la,ln,ring)||icinde(n.lat,n.lng,ring)); });
    var silFree=(p.freeLines||[]).filter(function(x){ return x && ortada(x.points); });
    var silAlan=(p.areas||[]).filter(function(x){ return x && ortada(x.points); });
    var silKanal=(p.channels||[]).filter(function(x){ return x && ortada(x.points); });
    if(!silObj.length && !silNot.length && !silFree.length && !silAlan.length && !silKanal.length){
      try{ if(window.toast) toast('Alan içinde silinecek bir şey yok.'); }catch(e){} return;
    }
    var ids={}; silObj.forEach(function(o){ ids[o.id]=1; });
    var silHat=(p.lines||[]).filter(function(l){ return l && (ids[l.start]||ids[l.end]); });
    var parca=[];
    if(silObj.length) parca.push(silObj.length+' obje');
    if(silHat.length) parca.push(silHat.length+' bağlı hat');
    if(silNot.length) parca.push(silNot.length+' yapışkan not');
    if(silFree.length) parca.push(silFree.length+' çizim');
    if(silKanal.length) parca.push(silKanal.length+' kanal');
    if(silAlan.length) parca.push(silAlan.length+' alan');
    var mesaj=parca.join(', ')+' silinecek. Onaylıyor musun?';
    var ok=true; try{ ok=window.confirm(mesaj); }catch(e){ ok=true; }
    if(!ok) return;
    try{
      p.objects=(p.objects||[]).filter(function(o){ return !ids[o.id]; });
      p.lines=(p.lines||[]).filter(function(l){ return !(ids[l.start]||ids[l.end]); });
      if(silNot.length){
        var notIds=silNot.map(function(n){ return n.id; });
        var silindi=0;
        try{ if(window.aybNotesRemoveByIds) silindi=window.aybNotesRemoveByIds(notIds); }catch(e){}
        if(!silindi){                                  /* modül yoksa doğrudan listeden çıkar */
          var nid={}; notIds.forEach(function(x){ nid[x]=1; });
          p.aybNotes=(p.aybNotes||[]).filter(function(n){ return !nid[n.id]; });
        }
        /* HER DURUMDA not katmanını veriyle eşitle (ekranda kalmasın) */
        try{ if(window.aybNotesSenkron) window.aybNotesSenkron(); else if(window.aybNotesRebuild) window.aybNotesRebuild(); }catch(e){}
        setTimeout(function(){ try{ if(window.aybNotesSenkron) window.aybNotesSenkron(); }catch(e){} }, 120);
      }
      var fid={}; silFree.forEach(function(x){ fid[x.id]=1; });
      if(silFree.length) p.freeLines=(p.freeLines||[]).filter(function(x){ return !fid[x.id]; });
      var aid={}; silAlan.forEach(function(x){ aid[x.id]=1; });
      if(silAlan.length) p.areas=(p.areas||[]).filter(function(x){ return !aid[x.id]; });
      var cid={}; silKanal.forEach(function(x){ cid[x.id]=1; });
      if(silKanal.length) p.channels=(p.channels||[]).filter(function(x){ return !cid[x.id]; });
      try{ if(silNot.length && window.aybNotesRebuild) window.aybNotesRebuild(); }catch(e){}
      if(window.saveProject) window.saveProject();
      if(window.aybArtikTemizle) window.aybArtikTemizle();
      if(window.aybForceFullRender) window.aybForceFullRender(); else if(window.renderAll) window.renderAll();
      if(window.aybArtikTemizle) window.aybArtikTemizle();
      if(window.toast) toast(parca.join(', ')+' silindi.');
    }catch(e){ try{ if(window.toast) toast('Silme sırasında sorun: '+(e&&e.message?e.message:e)); }catch(_){} }
    kapat();
  }
  function barEl(){
    if(bar && bar.parentNode) return bar;
    bar=d.createElement('div'); bar.id='aybSilBar';
    bar.style.cssText='position:fixed;left:50%;transform:translateX(-50%);bottom:130px;z-index:2147481600;display:none;gap:8px;align-items:center;background:rgba(15,23,42,.95);padding:8px 10px;border-radius:12px;box-shadow:0 6px 20px rgba(0,0,0,.45);';
    bar.innerHTML='<span style="color:#fff;font:700 13px system-ui;">🗑 Alanı çiz</span>'
      +'<span id="aybSilSay" style="color:#fca5a5;font:700 12px system-ui;">0 nokta</span>'
      +'<button id="aybSilGeri" style="height:38px;padding:0 12px;border:none;border-radius:9px;background:#475569;color:#fff;font:700 13px system-ui;cursor:pointer;">↶ Geri</button>'
      +'<button id="aybSilOk" style="height:38px;padding:0 14px;border:none;border-radius:9px;background:#dc2626;color:#fff;font:800 14px system-ui;cursor:pointer;">✔ Alanı Kapat ve Sil</button>'
      +'<button id="aybSilIptal" style="height:38px;padding:0 12px;border:none;border-radius:9px;background:#334155;color:#fff;font:700 13px system-ui;cursor:pointer;">✖ İptal</button>';
    d.body.appendChild(bar);
    bar.querySelector('#aybSilOk').addEventListener('click', function(e){ try{e.preventDefault();e.stopPropagation();}catch(_){} uygula(); });
    bar.querySelector('#aybSilIptal').addEventListener('click', function(e){ try{e.preventDefault();e.stopPropagation();}catch(_){} kapat(); try{ if(window.toast) toast('Toplu silme iptal edildi.'); }catch(_){} });
    bar.querySelector('#aybSilGeri').addEventListener('click', function(e){ try{e.preventDefault();e.stopPropagation();}catch(_){} pts.pop(); ciz(); });
    return bar;
  }
  function basla(){
    /* açık araç varsa kapat (tıklamalar alan çizimine gitsin) */
    try{ if(typeof window.finishCurrentOperation==='function') window.finishCurrentOperation(); }catch(e){}
    try{ if(typeof window.cancelTool==='function') window.cancelTool(); }catch(e){}
    aktif=true; pts=[];
    barEl().style.display='flex';
    ciz();
    try{ if(window.toast) toast('Silinecek alanın köşelerine dokun. Bitirince "Alanı Kapat ve Sil" (veya sağ tık).'); }catch(e){}
    try{ if(window.hint) window.hint('Toplu silme: alan köşelerine dokun, sonra Alanı Kapat ve Sil.'); }catch(e){}
  }
  window.aybTopluSilBasla=basla;

  /* harita tıklamalarını alan çizimine al */
  var n=0, iv=setInterval(function(){
    var m=M();
    if(m && typeof m.on==='function' && !m.__aybBulkDel){
      m.__aybBulkDel=true;
      try{
        m.on('click', function(e){
          if(!aktif||!e||!e.latlng) return;
          try{ if(e.originalEvent && window.L) window.L.DomEvent.stopPropagation(e.originalEvent); }catch(_){}
          pts.push({lat:e.latlng.lat,lng:e.latlng.lng}); ciz();
        });
        m.on('contextmenu', function(e){
          if(!aktif) return;
          try{ if(e.originalEvent) e.originalEvent.preventDefault(); }catch(_){}
          uygula();
        });
      }catch(e){}
      clearInterval(iv); return;
    }
    if(++n>80) clearInterval(iv);
  }, 400);

  /* Çizim Araçları grubuna düğme */
  function btn(){
    if(d.getElementById('aybTopluSilBtn')) return true;
    var a=d.querySelector('[data-tool="not"]') || d.querySelector('[data-tool="ok"]') || d.querySelector('[data-tool="cizgi"]');
    if(!a||!a.parentNode) return false;
    var b=d.createElement('button'); b.id='aybTopluSilBtn'; b.type='button'; b.className=a.className;
    b.removeAttribute&&b.removeAttribute('data-tool');
    b.title='Toplu Sil - alan çiz, içine düşen tüm objeleri ve bağlı hatları sil';
    b.innerHTML='<div class="ayb-pro-ico" style="color:#dc2626;">🗑</div><small>Toplu Sil</small>';
    b.addEventListener('click', function(e){ try{e.preventDefault();e.stopPropagation();}catch(_){} basla(); });
    a.parentNode.insertBefore(b, a.nextSibling);
    return true;
  }
  var t=0, biv=setInterval(function(){ if(btn()|| ++t>80) clearInterval(biv); }, 600);
})();

/* ===================== KATMANLI DIŞA AKTARIM (MİF + KMZ): tüm obje tipleri =====================
   Eskiden tüm nesneler tek karışık dosyaya yazılıyordu; trafo/lamba/kofre ayrı KATMAN olarak gelmiyordu.
   Artık her tip ayrı katman: MİF'te ayrı dosya (TRAFO.mif, DIREK.mif...), KMZ'de ayrı klasör. */
(function(){
  "use strict";
  var d=document;

  /* ---------- küçük ZIP yazıcı (sıkıştırmasız / STORE) ---------- */
  var CRCT=null;
  function crcTab(){ if(CRCT) return CRCT; CRCT=new Int32Array(256);
    for(var i=0;i<256;i++){ var c=i; for(var k=0;k<8;k++) c=(c&1)?(0xEDB88320^(c>>>1)):(c>>>1); CRCT[i]=c; } return CRCT; }
  function crc32(u8){ var t=crcTab(), c=-1; for(var i=0;i<u8.length;i++) c=(c>>>8)^t[(c^u8[i])&0xFF]; return (c^(-1))>>>0; }
  function str2u8(s){ return new TextEncoder().encode(s); }
  function zip(files){   /* files: [{name, data(Uint8Array)}] */
    var chunks=[], central=[], off=0;
    function u16(v){ return [v&255,(v>>8)&255]; }
    function u32(v){ return [v&255,(v>>8)&255,(v>>16)&255,(v>>24)&255]; }
    files.forEach(function(f){
      var nm=str2u8(f.name), c=crc32(f.data), n=f.data.length;
      var lh=[].concat([0x50,0x4b,0x03,0x04], u16(20), u16(0), u16(0), u16(0), u16(0), u32(c), u32(n), u32(n), u16(nm.length), u16(0));
      chunks.push(new Uint8Array(lh)); chunks.push(nm); chunks.push(f.data);
      central.push({nm:nm, c:c, n:n, off:off});
      off += lh.length + nm.length + n;
    });
    var cdStart=off, cd=[];
    central.forEach(function(e){
      var h=[].concat([0x50,0x4b,0x01,0x02], u16(20), u16(20), u16(0), u16(0), u16(0), u16(0), u32(e.c), u32(e.n), u32(e.n),
        u16(e.nm.length), u16(0), u16(0), u16(0), u16(0), u32(0), u32(e.off));
      cd.push(new Uint8Array(h)); cd.push(e.nm); off += h.length + e.nm.length;
    });
    var eocd=new Uint8Array([].concat([0x50,0x4b,0x05,0x06], u16(0), u16(0), u16(central.length), u16(central.length),
      u32(off-cdStart), u32(cdStart), u16(0)));
    var all=chunks.concat(cd, [eocd]);
    var total=all.reduce(function(a,b){ return a+b.length; },0);
    var out=new Uint8Array(total), pos=0;
    all.forEach(function(a){ out.set(a,pos); pos+=a.length; });
    return out;
  }

  /* ---------- veri toplama: tipe göre katmanlar ---------- */
  function esc(s){ return String(s==null?'':s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;'); }
  function no(o){ try{ if(window.getObjectNo) return window.getObjectNo(o)||o.id; }catch(e){} var p=o.props||{}; return p.direk_no||p.trafo_no||p.box_no||p.kofre_no||p.abone_no||p.ad||o.id; }
  function tipAd(t){
    var m={direk:'DIREK',trafo:'TRAFO',box:'BOX',kofre:'KOFRE',abone:'ABONE',ekmuf:'EK_MUF',not:'NOT',lamba:'LAMBA',bina:'BINA'};
    return m[String(t||'').toLowerCase()] || String(t||'DIGER').toLocaleUpperCase('tr').replace(/[^A-Z0-9_]/g,'_');
  }
  function hatTipAd(l){
    var k=String((l&&(l.kind||l.type))||'hat').toLowerCase();
    var m={hat:'HAT_HAVAI',yeraltihat:'HAT_YERALTI',abonehat:'HAT_ABONE',kanal:'KANAL',cizgi:'CIZGI',ok:'OK',bina:'BINA'};
    return m[k] || ('HAT_'+k.toLocaleUpperCase('tr').replace(/[^A-Z0-9_]/g,'_'));
  }
  function katmanlar(){
    var p=window.project||{}, K={};
    function ek(ad,f){ (K[ad]=K[ad]||[]).push(f); }
    (p.objects||[]).forEach(function(o){
      if(o==null||o.lat==null||o.lng==null) return;
      ek(tipAd(o.type), {kind:'point', ad:no(o), tip:o.type, id:o.id, pts:[[o.lat,o.lng]], props:o.props||{}});
    });
    var byId={}; (p.objects||[]).forEach(function(o){ byId[o.id]=o; });
    (p.lines||[]).forEach(function(l){
      var a=byId[l.start], b=byId[l.end]; if(!a||!b) return;
      var pts;
      try{ pts=(window.aybLinePathPoints? window.aybLinePathPoints(l,a,b) : [[a.lat,a.lng],[b.lat,b.lng]]); }
      catch(e){ pts=[[a.lat,a.lng],[b.lat,b.lng]]; }
      ek(hatTipAd(l), {kind:'line', ad:(no(a)+'-'+no(b)), tip:(l.kind||'hat'), id:l.id, pts:pts, props:l.props||{}, uzunluk:l.length_m||null});
    });
    (p.freeLines||[]).forEach(function(l){ if(!l||!l.points||l.points.length<2) return; ek(hatTipAd(l), {kind:'line', ad:(l.props&&l.props.ad)||l.id, tip:l.kind||'cizgi', id:l.id, pts:l.points, props:l.props||{}}); });
    (p.channels||[]).forEach(function(c){ if(!c||!c.points||c.points.length<2) return; ek('KANAL', {kind:'line', ad:(c.props&&c.props.ad)||c.id, tip:'kanal', id:c.id, pts:c.points, props:c.props||{}}); });
    (p.areas||[]).forEach(function(a){ if(!a||!a.points||a.points.length<3) return; ek('ALAN', {kind:'polygon', ad:(a.props&&a.props.ad)||a.id, tip:'alan', id:a.id, pts:a.points, props:a.props||{}}); });
    (p.aybNotes||[]).forEach(function(nt){ if(!nt||nt.lat==null) return; ek('NOT', {kind:'point', ad:(nt.text||'Not').slice(0,60), tip:'not', id:nt.id||'', pts:[[nt.lat,nt.lng]], props:{metin:nt.text||''}}); });
    return K;
  }
  function pname(){ try{ return (window.project&&(window.project.name||window.project.id))||'Saha_Projesi'; }catch(e){ return 'Saha_Projesi'; } }
  function damga(){ var n2=new Date(), p=function(x){ return String(x).padStart(2,'0'); }; return n2.getFullYear()+'-'+p(n2.getMonth()+1)+'-'+p(n2.getDate())+'_'+p(n2.getHours())+p(n2.getMinutes()); }

  /* ---------- MİF/MID: her katman ayrı dosya ---------- */
  function mifCift(ad, feats){
    var mif=[], mid=[];
    mif.push('Version 300');
    mif.push('Charset "WindowsTurkish"');
    mif.push('Delimiter ","');
    mif.push('CoordSys Earth Projection 1, 104');
    mif.push('Columns 7');
    mif.push('  KATMAN Char(40)');
    mif.push('  ID Char(80)');
    mif.push('  TIP Char(40)');
    mif.push('  AD Char(120)');
    mif.push('  UZUNLUK Char(20)');
    mif.push('  KAYNAK Char(40)');
    mif.push('  JSON Char(250)');
    mif.push('Data');
    feats.forEach(function(f){
      if(f.kind==='point'){
        mif.push('Point '+(+f.pts[0][1]).toFixed(8)+' '+(+f.pts[0][0]).toFixed(8));
        mif.push('  Symbol (35,0,12)');
      }else if(f.kind==='polygon'){
        mif.push('Region 1'); mif.push('  '+f.pts.length);
        f.pts.forEach(function(p){ mif.push('  '+(+p[1]).toFixed(8)+' '+(+p[0]).toFixed(8)); });
        mif.push('  Pen (2,2,255)'); mif.push('  Brush (1,0,16777215)');
      }else{
        mif.push('Pline '+f.pts.length);
        f.pts.forEach(function(p){ mif.push('  '+(+p[1]).toFixed(8)+' '+(+p[0]).toFixed(8)); });
        mif.push('  Pen (2,2,255)');
      }
      var q=function(s){ return '"'+String(s==null?'':s).replace(/"/g,'""')+'"'; };
      mid.push([q(ad),q(f.id),q(f.tip),q(f.ad),q(f.uzunluk!=null?Number(f.uzunluk).toFixed(2):''),q('AYB'),q(JSON.stringify(f.props||{}).slice(0,248))].join(','));
    });
    return { mif: mif.join('\r\n')+'\r\n', mid: mid.join('\r\n')+'\r\n' };
  }
  function mifCiftCok(feats, adlar){
    var tek=mifCift('TUMU', []);            /* baslik satirlarini al */
    var basHead=tek.mif.split('Data\r\n')[0]+'Data\r\n';
    var mif=[], mid=[];
    feats.forEach(function(f,i){
      var ad=adlar[i]||'DIGER';
      var c=mifCift(ad,[f]);
      var govde=c.mif.split('Data\r\n')[1]||'';
      mif.push(govde.replace(/\r\n$/,''));
      mid.push((c.mid||'').replace(/\r\n$/,''));
    });
    return { mif: basHead+mif.join('\r\n')+'\r\n', mid: mid.join('\r\n')+'\r\n' };
  }
  function mifZip(){
    var K=katmanlar(), files=[], adet=0, kat=0;
    Object.keys(K).forEach(function(ad){
      var c=mifCift(ad,K[ad]);
      files.push({name:ad+'.mif', data:str2u8(c.mif)});
      files.push({name:ad+'.mid', data:str2u8(c.mid)});
      adet+=K[ad].length; kat++;
    });
    if(!files.length) return null;
    /* BİRLEŞİK dosya: tüm katmanlar tek dosyada (KATMAN kolonu ile) -> programa geri içeri alınabilir */
    var tumFe=[], tumAd=[];
    Object.keys(K).forEach(function(ad){ K[ad].forEach(function(f){ tumFe.push(f); tumAd.push(ad); }); });
    var tc=mifCiftCok(tumFe, tumAd);
    files.push({name:'TUMU.mif', data:str2u8(tc.mif)});
    files.push({name:'TUMU.mid', data:str2u8(tc.mid)});
    /* TAM veri: form bilgileri kırpılmadan (programa geri alırken birebir aynı gelsin) */
    try{
      var tam=[];
      Object.keys(K).forEach(function(ad){
        K[ad].forEach(function(f){
          tam.push({katman:ad, kind:f.kind, ad:f.ad, tip:f.tip, id:f.id, uzunluk:f.uzunluk||null,
                    pts:f.pts.map(function(q){ return [+q[0], +q[1]]; }), props:f.props||{}});
        });
      });
      files.push({name:'TUMU.json', data:str2u8(JSON.stringify({proje:pname(), tarih:new Date().toISOString(), veri:tam}))});
    }catch(e){}
    files.push({name:'OKUBENI.txt', data:str2u8('Körfezim Saha - MİF/MID katmanli disa aktarim\r\nProje: '+pname()+'\r\nKatman sayisi: '+kat+'\r\nNesne sayisi: '+adet+'\r\nKoordinat: WGS84 (Earth Projection 1, 104)\r\n')});
    return { data: zip(files), kat: kat, adet: adet };
  }

  /* ---------- KMZ: her tip ayrı KLASÖR ---------- */
  function kmlMetni(){
    var K=katmanlar(), out=[];
    out.push('<?xml version="1.0" encoding="UTF-8"?>');
    out.push('<kml xmlns="http://www.opengis.net/kml/2.2"><Document><name>'+esc(pname())+'</name>');
    out.push('<Style id="pt"><IconStyle><scale>0.9</scale><Icon><href>http://maps.google.com/mapfiles/kml/shapes/placemark_circle.png</href></Icon></IconStyle></Style>');
    out.push('<Style id="ln"><LineStyle><color>ff00a2ff</color><width>3</width></LineStyle></Style>');
    out.push('<Style id="pg"><LineStyle><color>ff22c55e</color><width>2</width></LineStyle><PolyStyle><color>3522c55e</color></PolyStyle></Style>');
    var adet=0;
    Object.keys(K).forEach(function(ad){
      out.push('<Folder><name>'+esc(ad)+' ('+K[ad].length+')</name><open>0</open>');
      K[ad].forEach(function(f){
        adet++;
        var tablo='<table border="1" cellpadding="3" cellspacing="0">';
        tablo+='<tr><th>Katman</th><td>'+esc(ad)+'</td></tr><tr><th>Ad/No</th><td>'+esc(f.ad)+'</td></tr><tr><th>Tip</th><td>'+esc(f.tip)+'</td></tr>';
        if(f.uzunluk!=null) tablo+='<tr><th>Uzunluk</th><td>'+Number(f.uzunluk).toFixed(2)+' m</td></tr>';
        try{ Object.keys(f.props||{}).forEach(function(k){ var v=f.props[k]; if(v==null||typeof v==='object') return; tablo+='<tr><th>'+esc(k)+'</th><td>'+esc(v)+'</td></tr>'; }); }catch(e){}
        tablo+='</table>';
        out.push('<Placemark><name>'+esc(f.ad)+'</name><description><![CDATA['+tablo+']]></description>');
        var ext='<ExtendedData><Data name="KATMAN"><value>'+esc(ad)+'</value></Data><Data name="TIP"><value>'+esc(f.tip)+'</value></Data>'
          +'<Data name="AD"><value>'+esc(f.ad)+'</value></Data>';
        try{
          var kk=Object.keys(f.props||{}), say=0;
          for(var ki=0; ki<kk.length && say<24; ki++){
            var k2=kk[ki], v2=f.props[k2];
            if(v2==null || typeof v2==='object') continue;
            ext+='<Data name="'+esc(k2)+'"><value>'+esc(v2)+'</value></Data>'; say++;
          }
        }catch(e){}
        ext+='</ExtendedData>';
        out.push(ext);
        if(f.kind==='point'){ out.push('<styleUrl>#pt</styleUrl><Point><coordinates>'+(+f.pts[0][1]).toFixed(8)+','+(+f.pts[0][0]).toFixed(8)+',0</coordinates></Point>'); }
        else if(f.kind==='polygon'){
          var ring=f.pts.map(function(p){ return (+p[1]).toFixed(8)+','+(+p[0]).toFixed(8)+',0'; });
          ring.push(ring[0]);
          out.push('<styleUrl>#pg</styleUrl><Polygon><outerBoundaryIs><LinearRing><coordinates>'+ring.join(' ')+'</coordinates></LinearRing></outerBoundaryIs></Polygon>');
        } else {
          out.push('<styleUrl>#ln</styleUrl><LineString><tessellate>1</tessellate><coordinates>'+f.pts.map(function(p){ return (+p[1]).toFixed(8)+','+(+p[0]).toFixed(8)+',0'; }).join(' ')+'</coordinates></LineString>');
        }
        out.push('</Placemark>');
      });
      out.push('</Folder>');
    });
    out.push('</Document></kml>');
    return { kml: out.join('\r\n'), kat: Object.keys(K).length, adet: adet };
  }
  function kmzZip(){
    var r=kmlMetni();
    if(!r.adet) return null;
    return { data: zip([{name:'doc.kml', data:str2u8(r.kml)}]), kat:r.kat, adet:r.adet };
  }

  /* ---------- paylaş/kaydet ---------- */
  function ver(adi, u8, mime){
    var blob=new Blob([u8],{type:mime||'application/octet-stream'});
    try{ if(window.aybShareFile){ window.aybShareFile(adi, blob, blob.type); return true; } }catch(e){}
    try{ var a=d.createElement('a'); a.href=URL.createObjectURL(blob); a.download=adi; d.body.appendChild(a); a.click(); setTimeout(function(){ a.remove(); },800); return true; }catch(e){}
    return false;
  }
  function mifDisari(){
    var r=mifZip();
    if(!r){ try{ if(window.toast) toast('Dışa aktarılacak nesne yok.'); }catch(e){} return; }
    ver('MIF_'+pname().replace(/[^\wğüşıöçĞÜŞİÖÇ.-]/g,'_')+'_'+damga()+'.zip', r.data, 'application/zip');
    try{ if(window.toast) toast('MİF/MID hazır: '+r.kat+' katman, '+r.adet+' nesne (zip içinde).'); }catch(e){}
  }
  function kmzDisari(){
    var r=kmzZip();
    if(!r){ try{ if(window.toast) toast('Dışa aktarılacak nesne yok.'); }catch(e){} return; }
    ver('KMZ_'+pname().replace(/[^\wğüşıöçĞÜŞİÖÇ.-]/g,'_')+'_'+damga()+'.kmz', r.data, 'application/vnd.google-earth.kmz');
    try{ if(window.toast) toast('KMZ hazır: '+r.kat+' katman (klasör), '+r.adet+' nesne.'); }catch(e){}
  }
  window.aybMifDisari=mifDisari; window.aybKmzDisari=kmzDisari;

  /* mevcut düğmeleri katmanlı sürüme yönlendir */
  d.addEventListener('click', function(e){
    var t=e.target; while(t && t!==d){
      if(t.id==='btnMIFExport'){ try{e.preventDefault();e.stopPropagation();if(e.stopImmediatePropagation)e.stopImmediatePropagation();}catch(_){} mifDisari(); return; }
      if(t.id==='btnKML'){ try{e.preventDefault();e.stopPropagation();if(e.stopImmediatePropagation)e.stopImmediatePropagation();}catch(_){} kmzDisari(); return; }
      t=t.parentNode;
    }
  }, true);
})();

/* ===================== MİF ZIP'İNİ DOĞRUDAN İÇERİ AL =====================
   Katmanlı dışa aktarım zip üretir. Program .mif metni beklediği için, zip seçildiğinde
   içindeki TUMU.mif otomatik okunur (PC ve tablette aynı). */
(function(){
  "use strict";
  try{
    if(!window.Blob || !Blob.prototype || Blob.prototype.__aybZipMif) return;
    var origText=Blob.prototype.text;
    Blob.prototype.text=function(){
      var self=this;
      var ad='';
      try{ ad=String(self.name||''); }catch(e){}
      if(/\.zip$/i.test(ad)){
        return self.arrayBuffer().then(function(ab){
          try{
            if(!window.aybZipOku) return origText.call(self);
            return window.aybZipOku(ab).then(function(files){
              var keys=Object.keys(files||{});
              var key=keys.find(function(k){ return /(^|\/)TUMU\.mif$/i.test(k); }) || keys.find(function(k){ return /\.mif$/i.test(k); });
              if(!key) return origText.call(self);
              return window.aybZipBayt(files[key]).then(function(by){
                try{ if(window.toast) toast('Zip içinden okundu: '+key); }catch(e){}
                try{ return new TextDecoder('windows-1254').decode(by); }catch(e){ return new TextDecoder('utf-8').decode(by); }
              });
            });
          }catch(e){ return origText.call(self); }
        });
      }
      return origText.call(self);
    };
    Blob.prototype.__aybZipMif=true;
  }catch(e){}
})();

/* ===================== İÇE ALINAN NESNELERİN TİP + SEMBOLÜNÜ DÜZELT =====================
   KMZ/MİF içe alınırken tip ada göre tahmin ediliyordu -> trafo/kofre/box yanlış sembolle geliyordu.
   Artık KATMAN/TIP bilgisinden doğru tip ve sembol atanır, numara alanı da doldurulur. */
(function(){
  "use strict";
  var TIPMAP={ 'DIREK':'direk','TRAFO':'trafo','KOFRE':'kofre','BOX':'box','ABONE':'abone','EK_MUF':'ekmuf','EKMUF':'ekmuf','MUF':'ekmuf','NOT':'not',
               'direk':'direk','trafo':'trafo','kofre':'kofre','box':'box','abone':'abone','ekmuf':'ekmuf','not':'not' };
  var NOALAN={ direk:'direk_no', trafo:'trafo_no', kofre:'kofre_no', box:'box_no', abone:'abone_no', ekmuf:'muf_no' };
  function tipBul(pr){
    if(!pr) return null;
    var aday=[pr.TIP,pr.tip,pr.KATMAN,pr.katman,pr.Tip,pr.Katman];
    for(var i=0;i<aday.length;i++){
      var v=aday[i]; if(v==null) continue;
      var k=String(v).trim();
      if(TIPMAP[k]) return TIPMAP[k];
      var U=k.toLocaleUpperCase('tr');
      if(TIPMAP[U]) return TIPMAP[U];
      if(U.indexOf('TRAFO')>=0) return 'trafo';
      if(U.indexOf('KOFRE')>=0) return 'kofre';
      if(U.indexOf('BOX')>=0) return 'box';
      if(U.indexOf('ABONE')>=0) return 'abone';
      if(U.indexOf('MUF')>=0) return 'ekmuf';
      if(U.indexOf('DIREK')>=0) return 'direk';
    }
    return null;
  }
  var ANAHTAR=['_fotoAdet','alt_tip','direk_no','trafo_no','kofre_no','box_no','abone_no','muf_no','durum','genel_tip',
               'isletme','jet_trvs','koruma','kullanim','mevcut_durum','sayac','symbol_id','trafo_guc','trafo_turu',
               'trafo_tipi','lamba_gucu','guc','kesit','aciklama','ad','kod'];
  /* Eski KMZ'lerde bilgiler açıklama metninde: "Tip: Direk ... direk_no D-001 ... symbol_id YENI_AG_DIREK" */
  function metindenOku(o){
    var pr=o.props||{}; if(pr.__aybMetinOk) return false;
    var m=String(pr.description||pr.aciklama||pr.not||'');
    if(!m || m.length<8) { pr.__aybMetinOk=true; return false; }
    var degisti=false;
    /* tip */
    var t=null, mt=m.match(/Tip\s*:\s*([A-Za-zÇĞİÖŞÜçğıöşü ]{2,14})/);
    if(mt){
      var v=mt[1].trim().toLocaleUpperCase('tr');
      if(v.indexOf('TRAFO')>=0) t='trafo'; else if(v.indexOf('KOFRE')>=0) t='kofre';
      else if(v.indexOf('BOX')>=0) t='box'; else if(v.indexOf('ABONE')>=0) t='abone';
      else if(v.indexOf('MUF')>=0||v.indexOf('MÜF')>=0) t='ekmuf'; else if(v.indexOf('DIREK')>=0||v.indexOf('DİREK')>=0) t='direk';
    }
    /* form alanlarını çıkar */
    var yer=[];
    ANAHTAR.forEach(function(k){
      var re=new RegExp('(^|\\s)'+k.replace(/[.*+?^${}()|[\]\\]/g,'\\$&')+'\\s', 'g'), mm;
      while((mm=re.exec(m))) yer.push({k:k, i:mm.index+(mm[1]?mm[1].length:0), son:re.lastIndex});
    });
    yer.sort(function(a,b){ return a.i-b.i; });
    for(var i=0;i<yer.length;i++){
      var bas=yer[i].son, bit=(i+1<yer.length)?yer[i+1].i:m.length;
      var deger=m.slice(bas,bit).trim().replace(/\s*Fotoğraflar.*$/,'').trim();
      if(!deger) continue;
      if(pr[yer[i].k]==null || pr[yer[i].k]===''){ pr[yer[i].k]=deger; degisti=true; }
    }
    if(!t){
      if(pr.trafo_no||pr.trafo_guc||pr.trafo_turu) t='trafo';
      else if(pr.kofre_no) t='kofre'; else if(pr.box_no) t='box';
      else if(pr.abone_no) t='abone'; else if(pr.muf_no) t='ekmuf'; else if(pr.direk_no) t='direk';
    }
    if(t && o.type!==t){ o.type=t; degisti=true; }
    /* orijinal sembolü geri koy */
    if(pr.symbol_id){ pr.symbol_id_manual=true; degisti=true; }
    pr.__aybMetinOk=true;
    return degisti;
  }
  function duzelt(){
    var p=window.project; if(!p||!Array.isArray(p.objects)) return 0;
    var n=0;
    for(var i=0;i<p.objects.length;i++){
      var o=p.objects[i]; if(!o||!o.props) continue;
      var pr=o.props;
      if(pr.__aybTipOk) continue;
      /* sadece içe alınmış nesnelere dokun */
      var ithal=(pr.ithal_kaynak!=null)||(pr.KATMAN!=null)||(pr.TIP!=null)||(pr.katman!=null)||(pr.description!=null);
      if(!ithal) continue;
      try{ if(metindenOku(o)) n++; }catch(e){}
      var t=tipBul(pr);
      if(t && o.type!==t){ o.type=t; n++; }
      var tip2=o.type;
      /* dışa aktarımda saklanan sembol varsa geri koy, yoksa tipe göre varsayılan sembol */
      try{
        if(pr.symbol_id){ pr.symbol_id_manual=pr.symbol_id_manual||false; }
        else if(window.applyDefaultSymbolIfNeeded){ window.applyDefaultSymbolIfNeeded(o,true); }
      }catch(e){}
      /* numara alanını doldur (AD/name -> direk_no/trafo_no...) */
      try{
        var alan=NOALAN[tip2];
        if(alan && !pr[alan]){
          var ad=pr.AD||pr.ad||pr.name||pr.NAME;
          if(ad) pr[alan]=String(ad);
        }
      }catch(e){}
      pr.__aybTipOk=true;
    }
    if(n){
      try{ if(window.saveProject) window.saveProject(); }catch(e){}
      try{ if(window.aybForceFullRender) window.aybForceFullRender(); else if(window.renderAll) window.renderAll(); }catch(e){}
      try{ if(window.toast) toast(n+' içe alınan nesnenin tipi/sembolü düzeltildi.'); }catch(e){}
    }
    return n;
  }
  window.aybIthalTipDuzelt=duzelt;
  setInterval(function(){ try{ duzelt(); }catch(e){} }, 2000);
})();

/* ===================== SİLİNEN HATTI/OBJEYİ KOORDİNATINDAN BULUP KALDIR =====================
   Çizim yenilenmese bile, silinen nesnenin haritadaki kalıntısı koordinat eşleşmesiyle kaldırılır. */
(function(){
  "use strict";
  function M(){ return window.__aybMap||window.map||null; }
  function eq(a,b){ return Math.abs(a-b)<1e-8; }
  function llEq(p,q){ return p&&q&&eq(p.lat,q.lat)&&eq(p.lng,q.lng); }
  function duz(pts){ if(!pts) return []; if(Array.isArray(pts[0])) pts=pts[0]; return pts; }
  function dizEsit(a,b){
    if(!a.length||a.length!==b.length) return false;
    for(var i=0;i<a.length;i++){ if(!llEq(a[i],b[i])) return false; }
    return true;
  }
  function yolEsit(a,b){
    a=duz(a); if(!a.length) return false;
    if(dizEsit(a,b)) return true;
    var ters=b.slice().reverse();
    if(dizEsit(a,ters)) return true;
    /* kapalı alan: son nokta ilk noktaya eşitse onu çıkarıp dene */
    if(a.length===b.length+1 && llEq(a[a.length-1],a[0]) && dizEsit(a.slice(0,-1),b)) return true;
    if(b.length===a.length+1 && llEq(b[b.length-1],b[0]) && dizEsit(a,b.slice(0,-1))) return true;
    return false;
  }
  function hatYolu(l){
    var p=window.project; if(!p) return null;
    var A=null,B=null;
    (p.objects||[]).forEach(function(o){ if(o.id===l.start)A=o; if(o.id===l.end)B=o; });
    if(!A||!B) return null;
    var pts;
    try{ pts=(window.aybLinePathPoints? window.aybLinePathPoints(l,A,B):[[A.lat,A.lng],[B.lat,B.lng]]); }
    catch(e){ pts=[[A.lat,A.lng],[B.lat,B.lng]]; }
    return pts.map(function(q){ return {lat:+q[0], lng:+q[1]}; });
  }
  function kaldirYol(yol){
    var map=M(), L=window.L; if(!map||!L||!yol||!yol.length) return 0;
    var sil=[], n=0;
    try{
      map.eachLayer(function(l){
        try{
          if(L.Polyline && (l instanceof L.Polyline) && l.getLatLngs && yolEsit(l.getLatLngs(), yol)) sil.push(l);
        }catch(e){}
      });
    }catch(e){}
    sil.forEach(function(l){ try{ map.removeLayer(l); n++; }catch(e){} });
    return n;
  }
  function kaldirNokta(lat,lng){
    var map=M(), L=window.L; if(!map||!L) return 0;
    var sil=[], hedef={lat:+lat,lng:+lng}, n=0;
    try{
      map.eachLayer(function(l){
        try{
          if(L.Marker && (l instanceof L.Marker) && l.getLatLng && llEq(l.getLatLng(), hedef)) sil.push(l);
          else if(L.CircleMarker && (l instanceof L.CircleMarker) && l.getLatLng && llEq(l.getLatLng(), hedef)) sil.push(l);
        }catch(e){}
      });
    }catch(e){}
    sil.forEach(function(l){ try{ map.removeLayer(l); n++; }catch(e){} });
    return n;
  }

  /* APP.deleteLine / deleteObject sarmala: silme onaylandıysa kalıntıyı koordinattan temizle */
  var kurulu=false;
  function sar(){
    var A=window.APP; if(!A) return false;
    if(typeof A.deleteLine==='function' && !A.deleteLine.__aybGeo){
      var iL=A.deleteLine;
      var wL=function(id){
        var p=window.project, hedef=null, yol=null;
        try{ (p&&p.lines||[]).forEach(function(l){ if(l.id===id){ hedef=l; } }); if(hedef) yol=hatYolu(hedef); }catch(e){}
        var r; try{ r=iL.apply(this,arguments); } finally {
          setTimeout(function(){
            try{
              var hala=false; (window.project&&window.project.lines||[]).forEach(function(l){ if(l.id===id) hala=true; });
              if(!hala && yol){ var n=kaldirYol(yol); if(n){ try{ if(window.toast) toast('Hat kaldırıldı.'); }catch(_){ } } }
            }catch(e){}
          }, 60);
        }
        return r;
      };
      wL.__aybGeo=true; A.deleteLine=wL;
    }
    if(typeof A.deleteObject==='function' && !A.deleteObject.__aybGeo){
      var iO=A.deleteObject;
      var wO=function(id){
        var p=window.project, o=null, yollar=[];
        try{
          (p&&p.objects||[]).forEach(function(x){ if(x.id===id) o=x; });
          (p&&p.lines||[]).forEach(function(l){ if(l.start===id||l.end===id){ var y=hatYolu(l); if(y) yollar.push(y); } });
        }catch(e){}
        var r; try{ r=iO.apply(this,arguments); } finally {
          setTimeout(function(){
            try{
              var hala=false; (window.project&&window.project.objects||[]).forEach(function(x){ if(x.id===id) hala=true; });
              if(!hala){ if(o) kaldirNokta(o.lat,o.lng); yollar.forEach(function(y){ kaldirYol(y); }); }
            }catch(e){}
          }, 60);
        }
        return r;
      };
      wO.__aybGeo=true; A.deleteObject=wO;
    }
    return true;
  }
  /* ok / bina / çizgi / kanal (deleteFree) için de koordinattan kaldırma */
  function sarFree(){
    var A=window.APP; if(!A||typeof A.deleteFree!=='function'||A.deleteFree.__aybGeo) return;
    var iF=A.deleteFree;
    var wF=function(id, kind){
      var p=window.project, yol=null;
      try{
        var bul=function(arr){ for(var i=0;i<(arr||[]).length;i++){ if(arr[i]&&arr[i].id===id) return arr[i]; } return null; };
        var it=bul(p&&p.freeLines)||bul(p&&p.areas)||bul(p&&p.channels);
        if(it&&it.points&&it.points.length) yol=it.points.map(function(q){ return {lat:+q[0], lng:+q[1]}; });
      }catch(e){}
      var r; try{ r=iF.apply(this,arguments); } finally {
        setTimeout(function(){
          try{
            var hala=false, pp=window.project;
            [(pp&&pp.freeLines)||[],(pp&&pp.areas)||[],(pp&&pp.channels)||[]].forEach(function(arr){
              arr.forEach(function(x){ if(x&&x.id===id) hala=true; });
            });
            if(!hala){
              if(yol) kaldirYol(yol);
              try{ if(window.aybArtikTemizle) window.aybArtikTemizle(); }catch(e){}
              try{ if(window.aybForceFullRender) window.aybForceFullRender(); }catch(e){}
              try{ if(window.toast) toast('Çizim kaldırıldı.'); }catch(e){}
            }
          }catch(e){}
        }, 60);
      }
      return r;
    };
    wF.__aybGeo=true; A.deleteFree=wF;
  }
  sar(); sarFree();
  setInterval(function(){ sar(); sarFree(); }, 1500);
  window.aybGeoKaldir={ yol:kaldirYol, nokta:kaldirNokta };
})();

/* ===================== MİF/KMZ ALTLIK: TEK KATMANDA HIZLI ÇİZİM =====================
   Binlerce nesne tek tek Leaflet katmanı olarak duruyordu -> zoom kademe kademe, donarak geliyordu.
   Artık tüm altlık TEK bir tuval (canvas) üzerine çizilir: on binlerce nesnede bile akıcı. */
(function(){
  "use strict";
  function M(){ return window.__aybMap||window.map||null; }
  var canvas=null, ctx=null, ciz=null, kaldirilan=0, sonSay=-1, rafId=0;

  function altlikKatmanlari(){
    var p=window.project, out=[];
    try{
      (p&&p.aybImportLayers||[]).forEach(function(l){
        if(l && l.mode==='background' && l.visible!==false && Array.isArray(l.features) && l.features.length) out.push(l);
      });
    }catch(e){}
    return out;
  }
  /* DXF katmanları (imar/altlık): çok nesnede tuvale al */
  function dxfKatmanlari(){
    var p=window.project, out=[];
    try{
      (p&&p.cadLayers||[]).forEach(function(l){
        if(l && !l.hidden && Array.isArray(l.features) && l.features.length) out.push(l);
      });
    }catch(e){}
    return out;
  }
  function dxfSay(){ var n=0; dxfKatmanlari().forEach(function(l){ n+=l.features.length; }); return n; }
  function dxfCiz(map, b, z){
    var ls=dxfKatmanlari(); if(!ls.length) return 0;
    var toplam=dxfSay();
    var atla=Math.max(1, Math.ceil(toplam/30000));
    if(z>=18) atla=1;
    var n=0;
    for(var li=0; li<ls.length; li++){
      var lay=ls[li], fs=lay.features, op=(lay.opacity==null?0.9:lay.opacity);
      if(op<=0) continue;
      ctx.globalAlpha=op;
      ctx.lineWidth=(lay.weight||1);
      for(var fi=0; fi<fs.length; fi+=atla){
        var f=fs[fi], pts=f.points;
        if(!pts||pts.length<2) continue;
        var gorunur=false, adim=Math.max(1, Math.floor(pts.length/400));
        ctx.strokeStyle=f.color||lay.color||'#2b6bff';
        ctx.beginPath();
        for(var k=0;k<pts.length;k+=adim){
          var pp=pts[k]; if(!pp) continue;
          var la=(pp.length?pp[0]:pp.lat), ln=(pp.length?pp[1]:pp.lng);
          if(!gorunur && b.contains([la,ln])) gorunur=true;
          var c2=map.latLngToContainerPoint([la,ln]);
          if(k===0) ctx.moveTo(c2.x,c2.y); else ctx.lineTo(c2.x,c2.y);
        }
        if(gorunur){ ctx.stroke(); n++; }
      }
      ctx.globalAlpha=1;
    }
    return n;
  }
  function toplamNesne(ls){ var n=0; ls.forEach(function(l){ n+=l.features.length; }); return n; }

  /* programın kendi ağır katmanlarını (turuncu SVG grupları) haritadan kaldır */
  function eskileriKaldir(){
    var map=M(), L=window.L; if(!map||!L) return 0;
    var sil=[], n=0;
    try{
      map.eachLayer(function(g){
        try{
          if(!(g instanceof L.LayerGroup)) return;
          var bul=false, say=0;
          g.eachLayer(function(c){
            say++;
            if(bul||say>6) return;
            var o=c&&c.options;
            if(o && (o.color==='#f97316' || o.fillColor==='#fef3c7')) bul=true;
          });
          if(bul) sil.push(g);
        }catch(e){}
      });
    }catch(e){}
    sil.forEach(function(g){ try{ map.removeLayer(g); n++; }catch(e){} });
    return n;
  }

  function tuvalKur(){
    var map=M(), L=window.L; if(!map||!L||canvas) return;
    canvas=L.DomUtil.create('canvas','ayb-fast-bg');
    canvas.style.position='absolute';
    canvas.style.pointerEvents='none';
    canvas.style.zIndex='250';
    try{ (map.getPane('overlayPane')||map.getPanes().overlayPane).appendChild(canvas); }catch(e){ canvas=null; return; }
    ctx=canvas.getContext('2d');
    var yenile=function(){ if(rafId) return; rafId=(window.requestAnimationFrame||function(f){return setTimeout(f,16);})(function(){ rafId=0; ciz&&ciz(); }); };
    try{
      map.on('moveend zoomend resize', yenile);
      map.on('move', yenile);                      /* kaydırırken de dolu kalsın (tuval çizimi hızlı) */
      map.on('zoomstart', function(){ if(ctx&&canvas) try{ ctx.clearRect(0,0,canvas.width,canvas.height); }catch(e){} });
    }catch(e){}
  }

  ciz=function(){
    var map=M(), L=window.L; if(!map||!L) return;
    var ls=altlikKatmanlari();
    var dxfVar=(dxfSay()>=400);
    if(!ls.length && !dxfVar){ if(canvas){ try{ ctx.clearRect(0,0,canvas.width,canvas.height); }catch(e){} } return; }
    tuvalKur(); if(!canvas||!ctx) return;
    var boyut=map.getSize();
    var sol=map.containerPointToLayerPoint([0,0]);
    try{ L.DomUtil.setPosition(canvas, sol); }catch(e){}
    var dpr=Math.min(2, window.devicePixelRatio||1);
    if(canvas.width!==Math.round(boyut.x*dpr) || canvas.height!==Math.round(boyut.y*dpr)){
      canvas.width=Math.round(boyut.x*dpr); canvas.height=Math.round(boyut.y*dpr);
      canvas.style.width=boyut.x+'px'; canvas.style.height=boyut.y+'px';
    }
    ctx.setTransform(dpr,0,0,dpr,0,0);
    ctx.clearRect(0,0,boyut.x,boyut.y);
    var b=map.getBounds().pad(0.15);
    var z=map.getZoom();
    var r=(z>=17?4:(z>=15?3:2));
    ctx.lineWidth=(z>=16?2:1.2);
    ctx.strokeStyle='#f97316'; ctx.fillStyle='#fde68a';
    if(dxfVar){ try{ dxfCiz(map, b, z); }catch(e){} }
    var toplam=0; for(var ti=0;ti<ls.length;ti++) toplam+=ls[ti].features.length;
    var atla=Math.max(1, Math.ceil(toplam/25000));      /* çok nesnede seyrelt: kare başına ~25.000 çizim */
    if(z>=17) atla=1;                                    /* yakınken hepsini çiz */
    var cizilen=0, LIMIT=120000;
    for(var li=0; li<ls.length && cizilen<LIMIT; li++){
      var fs=ls[li].features;
      for(var fi=0; fi<fs.length && cizilen<LIMIT; fi+=atla){
        var f=fs[fi], pts=f.points;
        if(!pts||!pts.length) continue;
        if(f.kind==='point'){
          var p0=pts[0];
          if(!b.contains([p0.lat,p0.lng])) continue;
          var q=map.latLngToContainerPoint([p0.lat,p0.lng]);
          ctx.beginPath(); ctx.arc(q.x,q.y,r,0,6.2832); ctx.fill(); ctx.stroke(); cizilen++;
        }else{
          var ilk=true, gorunur=false;
          ctx.beginPath();
          for(var k=0;k<pts.length;k++){
            var pp=pts[k];
            if(!gorunur && b.contains([pp.lat,pp.lng])) gorunur=true;
            var c2=map.latLngToContainerPoint([pp.lat,pp.lng]);
            if(ilk){ ctx.moveTo(c2.x,c2.y); ilk=false; } else ctx.lineTo(c2.x,c2.y);
          }
          if(gorunur){ if(f.kind==='polygon') ctx.closePath(); ctx.stroke(); cizilen++; }
        }
      }
    }
  };

  /* tıklayınca en yakın altlık nesnesinin bilgisini göster */
  function tikla(e){
    var map=M(); if(!map||!e||!e.latlng) return;
    var ls=altlikKatmanlari(); if(!ls.length) return;
    var hedef=map.latLngToContainerPoint(e.latlng), enIyi=null, enD=14;
    ls.forEach(function(l){
      l.features.forEach(function(f){
        var pts=f.points; if(!pts||!pts.length) return;
        for(var k=0;k<pts.length;k+=(f.kind==='point'?1:Math.max(1,Math.floor(pts.length/20)))){
          var c=map.latLngToContainerPoint([pts[k].lat,pts[k].lng]);
          var d=Math.hypot(c.x-hedef.x, c.y-hedef.y);
          if(d<enD){ enD=d; enIyi={f:f, l:l}; }
        }
      });
    });
    if(!enIyi) return;
    var html='<b>'+String(enIyi.l.name||'Altlık')+'</b><br>'+String(enIyi.f.name||'');
    try{
      var pr=enIyi.f.props||{}, kk=Object.keys(pr), t='';
      for(var i=0;i<kk.length && i<12;i++){ var v=pr[kk[i]]; if(v==null||typeof v==='object') continue; t+='<tr><th>'+kk[i]+'</th><td>'+String(v)+'</td></tr>'; }
      if(t) html+='<table border="1" cellpadding="3" style="margin-top:6px;font-size:11px">'+t+'</table>';
    }catch(e2){}
    try{ window.L.popup().setLatLng(e.latlng).setContent(html).openOn(map); }catch(e3){}
  }

  var t=0, iv=setInterval(function(){
    var map=M();
    if(!map){ if(++t>80) clearInterval(iv); return; }
    var ls=altlikKatmanlari(), say=toplamNesne(ls);
    /* DXF çok nesneliyse programın kendi ağır çizimini kapat, tuvale al */
    try{
      var dsay=dxfSay();
      if(dsay>=400 && !window.__aybCadFast){ window.__aybCadFast=true; ciz();
        try{ if(window.aybForceFullRender) window.aybForceFullRender(); }catch(e){}
        try{ if(window.toast) toast('DXF hızlı moda alındı ('+dsay+' çizim).'); }catch(e){}
      } else if(dsay<400 && window.__aybCadFast){ window.__aybCadFast=false; try{ if(window.aybForceFullRender) window.aybForceFullRender(); }catch(e){} }
      if(window.__aybCadFast && window.aybCadSig){ var sg=window.aybCadSig(); if(sg!==window.__aybCadSigSon){ window.__aybCadSigSon=sg; ciz(); } }
    }catch(e){}
    if(say>=300){
      var kaldi=eskileriKaldir();
      if(kaldi||say!==sonSay){ sonSay=say; ciz();
        if(kaldi){ try{ if(window.toast) toast('Altlık hızlı moda alındı ('+say+' nesne).'); }catch(e){} } }
      if(!map.__aybFastBgClick){ map.__aybFastBgClick=true; try{ map.on('click', tikla); }catch(e){} }
    }
  }, 1200);
  window.aybAltlikYenile=function(){ try{ eskileriKaldir(); ciz(); }catch(e){} };
})();

/* ===================== TAM İÇE ALMA (MİF zip / KMZ) + MÜKERRER KORUMASI =====================
   MİF içe alınırken form bilgileri (direk tipi, lamba, durum...) gelmiyordu; lambalar ayrı nesne oluyordu.
   Artık dışa aktarımdaki TAM veri okunur: tipler, form alanları ve lambalar direğe bağlı gelir. */
(function(){
  "use strict";
  var d=document;
  var TIPMAP={ DIREK:'direk', TRAFO:'trafo', KOFRE:'kofre', BOX:'box', ABONE:'abone', EK_MUF:'ekmuf', NOT:'not' };
  var NOALAN={ direk:'direk_no', trafo:'trafo_no', kofre:'kofre_no', box:'box_no', abone:'abone_no', ekmuf:'muf_no' };

  function m2(a,b){ /* iki nokta arası metre (yaklaşık) */
    var dy=(b[0]-a[0])*111320, dx=(b[1]-a[1])*111320*Math.cos((a[0]||39)*Math.PI/180);
    return Math.sqrt(dx*dx+dy*dy);
  }
  function uid(pre){ try{ if(window.uid) return window.uid(pre); }catch(e){} return pre+'_'+Date.now()+'_'+Math.floor(Math.random()*9999); }

  /* ---------- MÜKERRER: aynı yerde aynı tipte nesne varsa ekleme/temizle ---------- */
  function mukerrerBul(tol){
    tol=tol||1.5;
    var p=window.project; if(!p||!Array.isArray(p.objects)) return [];
    var kova={}, sil=[];
    for(var i=0;i<p.objects.length;i++){
      var o=p.objects[i]; if(!o||o.lat==null) continue;
      var k=o.type+'|'+o.lat.toFixed(4)+'|'+o.lng.toFixed(4);
      var liste=kova[k]=kova[k]||[];
      var esles=null;
      for(var j=0;j<liste.length;j++){ if(m2([liste[j].lat,liste[j].lng],[o.lat,o.lng])<=tol){ esles=liste[j]; break; } }
      if(esles){
        /* daha az bilgi içeren kopyayı sil */
        var a=Object.keys(esles.props||{}).length, b=Object.keys(o.props||{}).length;
        sil.push(b>a?esles:o);
        if(b>a){ liste[liste.indexOf(esles)]=o; }
      } else liste.push(o);
    }
    return sil;
  }
  function mukerrerTemizle(sessiz){
    var p=window.project; if(!p) return 0;
    var sil=mukerrerBul(1.5);
    if(!sil.length){ if(!sessiz){ try{ if(window.toast) toast('Üst üste (mükerrer) nesne bulunamadı.'); }catch(e){} } return 0; }
    var ids={}; sil.forEach(function(o){ ids[o.id]=1; });
    p.objects=p.objects.filter(function(o){ return !ids[o.id]; });
    p.lines=(p.lines||[]).filter(function(l){ return !(ids[l.start]||ids[l.end]); });
    try{ if(window.saveProject) window.saveProject(); }catch(e){}
    try{ if(window.aybArtikTemizle) window.aybArtikTemizle(); }catch(e){}
    try{ if(window.aybForceFullRender) window.aybForceFullRender(); else if(window.renderAll) window.renderAll(); }catch(e){}
    try{ if(window.toast) toast(sil.length+' üst üste nesne temizlendi.'); }catch(e){}
    return sil.length;
  }
  window.aybMukerrerTemizle=mukerrerTemizle;
  /* otomatik koruma: art arda ekleme/çift dokunuşta oluşan kopyaları sessizce temizle */
  var sonSayim=-1;
  setInterval(function(){
    try{
      var p=window.project; if(!p||!Array.isArray(p.objects)) return;
      if(p.objects.length===sonSayim) return;
      sonSayim=p.objects.length;
      var sil=mukerrerBul(0.8);          /* çok yakın (80 cm) = kesin kopya */
      if(sil.length) mukerrerTemizle(true);
    }catch(e){}
  }, 2500);

  /* ---------- TAM İÇE ALMA ---------- */
  function objeEkle(f, sayac){
    var p=window.project;
    var tip=TIPMAP[String(f.katman||'').toLocaleUpperCase('tr')] || TIPMAP[String(f.tip||'').toLocaleUpperCase('tr')] || String(f.tip||'direk').toLowerCase();
    if(!NOALAN[tip] && tip!=='not') tip='direk';
    var pr={}; try{ for(var k in (f.props||{})) pr[k]=f.props[k]; }catch(e){}
    pr.ithal_kaynak=pr.ithal_kaynak||'IMPORT';
    var alan=NOALAN[tip];
    if(alan && !pr[alan] && f.ad) pr[alan]=String(f.ad);
    var o={ id:uid(tip.toUpperCase()), type:tip, lat:+f.pts[0][0], lng:+f.pts[0][1], props:pr };
    /* aynı yerde aynı tipte varsa EKLEME (mükerrer koruması) */
    var v=(p.objects||[]).find(function(x){ return x && x.type===tip && m2([x.lat,x.lng],[o.lat,o.lng])<=1.5; });
    if(v){ sayac.atlanan++; return v; }
    try{ if(!pr.symbol_id && window.applyDefaultSymbolIfNeeded) window.applyDefaultSymbolIfNeeded(o,true); else if(pr.symbol_id) pr.symbol_id_manual=true; }catch(e){}
    p.objects.push(o); sayac.obje++;
    return o;
  }
  function lambaBagla(f, sayac){
    /* LAMBA katmanı: en yakın direğe lamba olarak ekle (ayrı nesne oluşturmaz) */
    var p=window.project, en=null, enD=8;
    (p.objects||[]).forEach(function(o){
      if(o.type!=='direk') return;
      var dd=m2([o.lat,o.lng],[+f.pts[0][0],+f.pts[0][1]]);
      if(dd<enD){ enD=dd; en=o; }
    });
    if(!en) return false;
    en.props=en.props||{};
    var arr=Array.isArray(en.props.lambalar)?en.props.lambalar:[];
    var pr=f.props||{};
    var metin=String(pr.lamba_tipi||pr.cins||pr.guc||f.ad||'');
    var gm=metin.match(/(\d+)\s*[wW]?/);
    var durum=pr.durum||pr.lamba_durum||(en.props&&en.props.durum)||'';   /* boşsa direğin durumu geçerli olur */
    var yeni={ armatur:pr.armatur||pr.armatür||'LED', cins:metin, guc:(pr.guc!=null&&String(pr.guc).match(/\d/))?String(pr.guc).match(/\d+/)[0]:(gm?gm[1]:''),
               durum:durum, adet:Number(pr.adet||1)||1 };
    var ayni=arr.some(function(l){ return l && String(l.cins)===String(yeni.cins) && String(l.armatur)===String(yeni.armatur); });
    if(!ayni){ arr.push(yeni); en.props.lambalar=arr; sayac.lamba++; }
    return true;
  }
  function hatEkle(f, sayac){
    var p=window.project;
    var a=f.pts[0], b=f.pts[f.pts.length-1];
    function bul(pt){ var en=null, enD=2.5; (p.objects||[]).forEach(function(o){ var dd=m2([o.lat,o.lng],[+pt[0],+pt[1]]); if(dd<enD){ enD=dd; en=o; } }); return en; }
    var A=bul(a), B=bul(b);
    if(A&&B&&A!==B){
      var var2=(p.lines||[]).some(function(l){ return (l.start===A.id&&l.end===B.id)||(l.start===B.id&&l.end===A.id); });
      if(var2){ sayac.atlanan++; return; }
      var kind=(String(f.katman||'').indexOf('YERALTI')>=0)?'yeraltihat':(String(f.katman||'').indexOf('ABONE')>=0?'abonehat':'hat');
      var l2={ id:uid('HAT'), start:A.id, end:B.id, kind:kind, props:f.props||{} };
      if(f.pts.length>2) l2.points=f.pts.map(function(q){ return [+q[0],+q[1]]; });
      p.lines.push(l2); sayac.hat++;
    } else {
      p.freeLines=p.freeLines||[];
      var vv=(p.freeLines||[]).some(function(x){ return x.points&&x.points.length===f.pts.length&&m2(x.points[0],[+a[0],+a[1]])<1; });
      if(vv){ sayac.atlanan++; return; }
      p.freeLines.push({ id:uid('CIZ'), kind:(String(f.katman||'').indexOf('KANAL')>=0?'kanal':'cizgi'), points:f.pts.map(function(q){ return [+q[0],+q[1]]; }), props:f.props||{} });
      sayac.cizgi++;
    }
  }
  function tamIceAl(veri){
    var p=window.project;
    if(!p){ try{ if(window.toast) toast('Önce proje aç.'); }catch(e){} return; }
    p.objects=p.objects||[]; p.lines=p.lines||[];
    var sayac={obje:0,hat:0,cizgi:0,lamba:0,atlanan:0};
    var noktalar=veri.filter(function(f){ return f.kind==='point' && String(f.katman||'').toLocaleUpperCase('tr')!=='LAMBA'; });
    var lambalar=veri.filter(function(f){ return f.kind==='point' && String(f.katman||'').toLocaleUpperCase('tr')==='LAMBA'; });
    var cizgiler=veri.filter(function(f){ return f.kind!=='point'; });
    noktalar.forEach(function(f){ try{ objeEkle(f,sayac); }catch(e){} });
    lambalar.forEach(function(f){ try{ if(!lambaBagla(f,sayac)) objeEkle(f,sayac); }catch(e){} });
    cizgiler.forEach(function(f){ try{ hatEkle(f,sayac); }catch(e){} });
    try{ if(window.saveProject) window.saveProject(); }catch(e){}
    try{ if(window.aybForceFullRender) window.aybForceFullRender(); else if(window.renderAll) window.renderAll(); }catch(e){}
    try{ if(window.toast) toast('İçe alındı: '+sayac.obje+' nesne, '+sayac.hat+' hat, '+sayac.cizgi+' çizim, '+sayac.lamba+' lamba'+(sayac.atlanan?(' • '+sayac.atlanan+' mükerrer atlandı'):'')); }catch(e){}
  }
  window.aybTamIceAl=tamIceAl;

  /* zip içinden TUMU.json oku */
  async function zipTamOku(file){
    if(!window.aybZipOku) return null;
    var ab=await file.arrayBuffer();
    var files=await window.aybZipOku(ab);
    var key=Object.keys(files||{}).find(function(k){ return /(^|\/)TUMU\.json$/i.test(k); });
    if(!key) return null;
    var by=await window.aybZipBayt(files[key]);
    var txt=new TextDecoder('utf-8').decode(by);
    var j=JSON.parse(txt);
    return (j&&Array.isArray(j.veri))?j.veri:null;
  }

  /* ---------- MİF + MID okuyucu (form bilgileri MID dosyasındadır) ---------- */
  function csvSatir(sat){
    var out=[], cur='', q=false;
    for(var i=0;i<sat.length;i++){
      var c=sat[i];
      if(q){ if(c==='"'){ if(sat[i+1]==='"'){ cur+='"'; i++; } else q=false; } else cur+=c; }
      else { if(c==='"') q=true; else if(c===','){ out.push(cur); cur=''; } else cur+=c; }
    }
    out.push(cur); return out;
  }
  function mifParse(mifTxt, midTxt, katmanAdi){
    var sat=String(mifTxt||'').split(/\r?\n/), kolon=[], i=0, veri=[];
    for(; i<sat.length; i++){
      var t=sat[i].trim();
      var mc=t.match(/^Columns\s+(\d+)/i);
      if(mc){ var adet=+mc[1]; for(var k=1;k<=adet;k++){ var kk=(sat[i+k]||'').trim().split(/\s+/)[0]; kolon.push(kk||('K'+k)); } i+=adet; continue; }
      if(/^Data\s*$/i.test(t)){ i++; break; }
    }
    var kayit=[];
    for(; i<sat.length; i++){
      var t2=sat[i].trim(); if(!t2) continue;
      var mp=t2.match(/^Point\s+([-\d.eE]+)\s+([-\d.eE]+)/i);
      if(mp){ kayit.push({kind:'point', pts:[[+mp[2], +mp[1]]]}); continue; }
      var ml=t2.match(/^(Pline|Line|Region)\s*(\d*)/i);
      if(ml){
        var tip=ml[1].toLowerCase();
        if(tip==='line'){ var pl=t2.split(/\s+/); if(pl.length>=5) kayit.push({kind:'line', pts:[[+pl[2],+pl[1]],[+pl[4],+pl[3]]]}); continue; }
        var n=+(ml[2]||0);
        if(tip==='region'){ n=+((sat[++i]||'').trim()); }
        var pts=[];
        for(var j=0;j<n;j++){ var pr=(sat[++i]||'').trim().split(/\s+/); if(pr.length>=2) pts.push([+pr[1], +pr[0]]); }
        if(pts.length>=2) kayit.push({kind:(tip==='region'?'polygon':'line'), pts:pts});
        continue;
      }
    }
    var midSat=String(midTxt||'').split(/\r?\n/).filter(function(x){ return x.trim()!==''; });
    kayit.forEach(function(r, idx){
      var props={}, ad='', tipAd='', katman=katmanAdi||'';
      if(midSat[idx]){
        var hu=csvSatir(midSat[idx]);
        for(var c=0;c<kolon.length;c++){
          var ad2=String(kolon[c]||'').toUpperCase(), deg=hu[c];
          if(deg==null||deg==='') continue;
          if(ad2==='KATMAN') katman=deg;
          else if(ad2==='AD') ad=deg;
          else if(ad2==='TIP') tipAd=deg;
          else if(ad2==='JSON'){ try{ var jj=JSON.parse(deg); for(var kx in jj) props[kx]=jj[kx]; }catch(e){} }
          else if(ad2!=='ID' && ad2!=='KAYNAK' && ad2!=='UZUNLUK') props[kolon[c]]=deg;
        }
      }
      veri.push({ katman:katman||katmanAdi||'DIGER', kind:r.kind, ad:ad||props.direk_no||props.trafo_no||'', tip:tipAd||'', pts:r.pts, props:props });
    });
    return veri;
  }
  async function dosyalardanVeri(files){
    var mif={}, mid={}, veri=null;
    for(var i=0;i<files.length;i++){
      var f=files[i], ad=String(f.name||'');
      if(/\.json$/i.test(ad)){
        try{
          var j=JSON.parse(await f.text());
          if(window.aybPaketMi && window.aybPaketMi(j)){ await window.aybPaketIceri(j); return []; }   /* proje paketi: birebir */
          if(j&&Array.isArray(j.veri)) return j.veri;
          if(Array.isArray(j)) return j;
        }catch(e){}
      }
      else if(/\.(zip|kmz)$/i.test(ad)){
        var t=await zipTamOku(f); if(t) return t;
        /* zip içinde TUMU.json yoksa .mif/.mid çiftlerini oku */
        try{
          var ab=await f.arrayBuffer(), zf=await window.aybZipOku(ab);
          for(var k in zf){
            if(/\.mif$/i.test(k)) mif[k.replace(/\.mif$/i,'')]=new TextDecoder('windows-1254').decode(await window.aybZipBayt(zf[k]));
            if(/\.mid$/i.test(k)) mid[k.replace(/\.mid$/i,'')]=new TextDecoder('windows-1254').decode(await window.aybZipBayt(zf[k]));
          }
        }catch(e){}
      }
      else if(/\.mif$/i.test(ad)) mif[ad.replace(/\.mif$/i,'')]=await f.text();
      else if(/\.mid$/i.test(ad)) mid[ad.replace(/\.mid$/i,'')]=await f.text();
    }
    var keys=Object.keys(mif);
    if(keys.length){
      veri=[];
      keys.forEach(function(k){
        var kat=k.split('/').pop().split('\\').pop().toLocaleUpperCase('tr');
        if(kat==='TUMU') kat='';
        veri=veri.concat(mifParse(mif[k], mid[k]||'', kat));
      });
    }
    return veri;
  }
  /* dosya seçici + düğme */
  function sec(){
    var inp=d.getElementById('aybTamIceInp');
    if(!inp){ inp=d.createElement('input'); inp.type='file'; inp.id='aybTamIceInp'; inp.multiple=true; inp.accept='.zip,.kmz,.json,.mif,.mid'; inp.style.display='none'; d.body.appendChild(inp); }
    inp.value='';
    inp.onchange=function(){
      var fs2=inp.files; if(!fs2||!fs2.length) return;
      (async function(){
        try{
          var veri=await dosyalardanVeri(fs2);
          if(!veri||!veri.length){ try{ if(window.toast) toast('Dosyada okunabilir veri bulunamadı. MİF ile birlikte MID dosyasını da seçin.'); }catch(e){} return; }
          tamIceAl(veri);
        }catch(e){ try{ if(window.toast) toast('İçe alma hatası: '+(e&&e.message?e.message:e)); }catch(_){} }
      })();
    };
    inp.click();
  }
  function btn(){
    if(d.getElementById('aybTamIceBtn')) return true;
    var a=d.getElementById('btnAYB')||d.getElementById('btnMIFExport')||d.getElementById('btnKML')||d.getElementById('aybYenileBtn');
    if(!a||!a.parentNode) return false;
    var b=d.createElement('button'); b.id='aybTamIceBtn'; b.type='button'; b.className=a.className;
    b.title='Tam İçe Al - dışa aktarılan MİF zip / KMZ paketini form bilgileri ve lambalarla birlikte içe alır';
    b.innerHTML='<div class="ayb-pro-ico" style="color:#16a34a;">📥</div><small>Tam İçe Al</small>';
    b.addEventListener('click', function(e){ try{e.preventDefault();e.stopPropagation();}catch(_){} sec(); });
    a.parentNode.insertBefore(b, a.nextSibling);
    return true;
  }
  var t=0, iv=setInterval(function(){ if(btn()|| ++t>80) clearInterval(iv); }, 600);
})();

/* ===================== DİREK FORMU: "Direk Tip Adı" boş kalmasın =====================
   Formdaki tip listesi iç KOD ile çalışıyor; içe aktarılan nesnelerde sadece tip ADI var
   ("1-100/10") -> liste eşleşmiyor ve "Seçiniz" görünüyordu. Artık ADA göre eşleştirilir. */
(function(){
  "use strict";
  var d=document;
  function norm(x){ return String(x==null?'':x).toLocaleUpperCase('tr').replace(/\s+/g,'').replace(/İ/g,'I'); }
  function tablo(){ try{ return (window.AYB&&Array.isArray(window.AYB.direkTypes))?window.AYB.direkTypes:null; }catch(e){ return null; } }
  function kayitBul(ad){
    var t=tablo(); if(!t||!ad) return null;
    var a=norm(ad);
    for(var i=0;i<t.length;i++){
      var r=t[i];
      if(norm(r['Sade Tip'])===a || norm(r['AYB Tip Adı'])===a) return r;
    }
    return null;
  }
  function objeBul(no){
    try{
      var p=window.project; if(!p||!Array.isArray(p.objects)||!no) return null;
      var n=norm(no);
      for(var i=0;i<p.objects.length;i++){
        var o=p.objects[i]; if(!o||o.type!=='direk'||!o.props) continue;
        if(norm(o.props.direk_no)===n) return o;
      }
    }catch(e){}
    return null;
  }
  function secText(sel, metin){
    if(!sel||!metin) return false;
    var m=norm(metin);
    for(var i=0;i<sel.options.length;i++){
      var op=sel.options[i];
      if(norm(op.textContent)===m || norm(op.value)===m){ sel.selectedIndex=i; return true; }
    }
    return false;
  }
  function duzelt(){
    var tip=d.getElementById('dr_tip'); if(!tip) return;
    var form=tip.closest ? (tip.closest('.win-modal')||tip.closest('form')||d) : d;
    if(tip.getAttribute('data-ayb-fix')==='1' && tip.value) return;
    var noEl=(form.querySelector?form.querySelector('#dr_no'):null)||d.getElementById('dr_no');
    var o=objeBul(noEl?noEl.value:'');
    var ad=o&&o.props?(o.props.direk_tipi||o.props.tip||o.props.direk_tip||''):'';
    if(!ad) return;
    if(tip.value){ tip.setAttribute('data-ayb-fix','1'); return; }        /* zaten seçili */
    var rec=kayitBul(ad);
    /* önce genel tip + alt cins'i kaydın değerine getir (liste ona göre doluyor) */
    if(rec){
      var g=(form.querySelector?form.querySelector('#dr_genel'):null)||d.getElementById('dr_genel');
      var a=(form.querySelector?form.querySelector('#dr_alt'):null)||d.getElementById('dr_alt');
      var degisti=false;
      if(g && secText(g, rec['Genel Tip'])) degisti=true;
      if(a && secText(a, rec['Alt Tip'])) degisti=true;
      if(degisti){
        try{ if(g) g.dispatchEvent(new Event('change',{bubbles:true})); }catch(e){}
        try{ if(a) a.dispatchEvent(new Event('change',{bubbles:true})); }catch(e){}
      }
    }
    /* listeyi tazeledikten sonra tip adını seç */
    setTimeout(function(){
      var t2=d.getElementById('dr_tip'); if(!t2) return;
      var ok=secText(t2, ad) || (rec && (secText(t2, rec['Sade Tip']) || secText(t2, rec['AYB Tip Adı']) || secText(t2, rec['Kod'])));
      if(ok){
        t2.setAttribute('data-ayb-fix','1');
        try{ t2.dispatchEvent(new Event('change',{bubbles:true})); }catch(e){}
        try{ if(o&&o.props&&rec){ o.props.genel_tip=o.props.genel_tip||rec['Genel Tip']; o.props.alt_tip=o.props.alt_tip||rec['Alt Tip']; } }catch(e){}
      }
    }, 120);
  }
  setInterval(function(){ try{ duzelt(); }catch(e){} }, 500);
  window.aybDirekTipDuzelt=duzelt;
})();

/* ===================== PROJE PAKETİ (.json) — BİREBİR AKTARIM =====================
   MİF/KMZ harita formatıdır; form alanlarını, lambaları, fotoğrafları tam taşıyamaz.
   Proje Paketi ise projenin AYNISINI taşır: objeler, hatlar, formlar, notlar, fotoğraflar. */
(function(){
  "use strict";
  var d=document;
  function pname(){ try{ return (window.project&&(window.project.name||window.project.id))||'Saha_Projesi'; }catch(e){ return 'Saha_Projesi'; } }
  function damga(){ var n=new Date(), p=function(x){ return String(x).padStart(2,'0'); }; return n.getFullYear()+'-'+p(n.getMonth()+1)+'-'+p(n.getDate())+'_'+p(n.getHours())+p(n.getMinutes()); }
  function uid(pre){ try{ if(window.uid) return window.uid(pre); }catch(e){} return pre+'_'+Date.now()+'_'+Math.floor(Math.random()*99999); }
  function m2(a,b){ var dy=(b[0]-a[0])*111320, dx=(b[1]-a[1])*111320*Math.cos((a[0]||39)*Math.PI/180); return Math.sqrt(dx*dx+dy*dy); }

  /* ---- fotoğraf deposu (IndexedDB) ---- */
  function fdb(){ return new Promise(function(res,rej){ var r=indexedDB.open('ayb_photos_db',1);
    r.onupgradeneeded=function(){ try{ r.result.createObjectStore('photos',{keyPath:'id'}); }catch(e){} };
    r.onsuccess=function(){ res(r.result); }; r.onerror=function(){ rej(r.error); }; }); }
  function fotoHepsi(){ return fdb().then(function(db){ return new Promise(function(res){
      try{ var t=db.transaction('photos','readonly'), st=t.objectStore('photos'), out={};
        var c=st.openCursor();
        c.onsuccess=function(){ var cur=c.result; if(!cur){ res(out); return; } try{ if(cur.value&&cur.value.items&&cur.value.items.length) out[cur.value.id]=cur.value.items; }catch(e){} cur.continue(); };
        c.onerror=function(){ res(out); };
      }catch(e){ res({}); } }); }).catch(function(){ return {}; }); }
  function fotoYaz(map2){ return fdb().then(function(db){ return new Promise(function(res){
      try{ var t=db.transaction('photos','readwrite'), st=t.objectStore('photos');
        Object.keys(map2||{}).forEach(function(id){ try{ st.put({id:id, items:map2[id]}); }catch(e){} });
        t.oncomplete=function(){ res(true); }; t.onerror=function(){ res(false); };
      }catch(e){ res(false); } }); }).catch(function(){ return false; }); }

  /* ---- DIŞA: proje paketi ---- */
  async function disari(){
    var p=window.project;
    if(!p){ try{ if(window.toast) toast('Önce proje aç.'); }catch(e){} return; }
    var fotoVar=false;
    try{ fotoVar=window.confirm('Fotoğraflar da pakete eklensin mi?\n\nTamam = fotoğraflarla (dosya büyür)\nİptal = fotoğrafsız (küçük dosya)'); }catch(e){}
    try{ if(window.toast) toast('Paket hazırlanıyor…'); }catch(e){}
    var paket={ ayb:'proje-paketi', surum:1, tarih:new Date().toISOString(), proje:{} };
    try{
      ['id','name','stage','user','created','updated','meta','settings'].forEach(function(k){ if(p[k]!==undefined) paket.proje[k]=p[k]; });
      /* SADECE programın kendi çizimleri: içe alınan imar/DXF/MİF altlıkları ve raster görüntüleri PAKETE GİRMEZ */
      ['objects','lines','areas','freeLines','channels','aybNotes'].forEach(function(k){ if(Array.isArray(p[k])) paket.proje[k]=p[k]; });
    }catch(e){}
    if(fotoVar){ try{ paket.fotolar=await fotoHepsi(); }catch(e){ paket.fotolar={}; } }
    var say={o:(paket.proje.objects||[]).length, h:(paket.proje.lines||[]).length, n:(paket.proje.aybNotes||[]).length,
             f:Object.keys(paket.fotolar||{}).reduce(function(a,k){ return a+paket.fotolar[k].length; },0)};
    var metin=JSON.stringify(paket);
    var ad='PAKET_'+pname().replace(/[^\wğüşıöçĞÜŞİÖÇ.-]/g,'_')+'_'+damga()+'.json';
    var blob=new Blob([metin],{type:'application/json'});
    try{ if(metin.length>15*1024*1024 && window.toast) toast('Dikkat: paket '+Math.round(metin.length/1048576)+' MB. WhatsApp büyük dosyayı reddedebilir; fotoğrafsız paket deneyin.'); }catch(e){}
    try{ if(window.aybShareFile){ window.aybShareFile(ad, blob, 'application/json'); } else { var a=d.createElement('a'); a.href=URL.createObjectURL(blob); a.download=ad; d.body.appendChild(a); a.click(); setTimeout(function(){a.remove();},800); } }catch(e){}
    try{ if(window.toast) toast('Paket hazır (sadece kendi çizimlerin): '+say.o+' obje, '+say.h+' hat, '+say.n+' not'+(fotoVar?(', '+say.f+' fotoğraf'):'')+' • '+Math.round(metin.length/1024)+' KB'); }catch(e){}
  }

  /* ---- İÇERİ: paketi birebir yükle veya birleştir ---- */
  async function iceri(paket){
    var p=window.project;
    if(!p){ try{ if(window.toast) toast('Önce proje aç.'); }catch(e){} return; }
    var pr=paket.proje||{};
    var birlestir=true;
    try{ birlestir=window.confirm('Paket nasıl alınsın?\n\nTamam = MEVCUT PROJEYE EKLE (birleştir)\nİptal = MEVCUT PROJEYİ DEĞİŞTİR (her şey silinir)'); }catch(e){}
    var say={o:0,h:0,n:0,d:0,f:0};
    if(!birlestir){
      ['objects','lines','areas','freeLines','channels','aybNotes'].forEach(function(k){ p[k]=Array.isArray(pr[k])?pr[k]:[]; });
      say.o=(p.objects||[]).length; say.h=(p.lines||[]).length; say.n=(p.aybNotes||[]).length;
    } else {
      p.objects=p.objects||[]; p.lines=p.lines||[]; p.aybNotes=p.aybNotes||[];
      var idMap={};
      (pr.objects||[]).forEach(function(o){
        if(!o||o.lat==null) return;
        var v=p.objects.find(function(x){ return x && x.type===o.type && m2([x.lat,x.lng],[o.lat,o.lng])<=1.5; });
        if(v){ idMap[o.id]=v.id; say.d++; return; }                 /* aynı yerde var -> mükerrer, ekleme */
        var yeni=JSON.parse(JSON.stringify(o)); var eski=yeni.id; yeni.id=uid((o.type||'OBJ').toUpperCase());
        idMap[eski]=yeni.id; p.objects.push(yeni); say.o++;
      });
      (pr.lines||[]).forEach(function(l){
        if(!l) return;
        var s=idMap[l.start]||l.start, e2=idMap[l.end]||l.end;
        var varmi=p.lines.some(function(x){ return (x.start===s&&x.end===e2)||(x.start===e2&&x.end===s); });
        if(varmi){ say.d++; return; }
        var yl=JSON.parse(JSON.stringify(l)); yl.id=uid('HAT'); yl.start=s; yl.end=e2; p.lines.push(yl); say.h++;
      });
      ['areas','freeLines','channels'].forEach(function(k){
        p[k]=p[k]||[];
        (pr[k]||[]).forEach(function(x){ if(!x) return; var y=JSON.parse(JSON.stringify(x)); y.id=uid(k.toUpperCase()); p[k].push(y); });
      });
      (pr.aybNotes||[]).forEach(function(n){
        if(!n) return;
        var v=p.aybNotes.some(function(x){ return x && x.lat!=null && Math.abs(x.lat-n.lat)<1e-6 && Math.abs(x.lng-n.lng)<1e-6 && String(x.text||'')===String(n.text||''); });
        if(v){ say.d++; return; }
        var yn=JSON.parse(JSON.stringify(n)); yn.id='note_'+Date.now()+'_'+Math.floor(Math.random()*9999); p.aybNotes.push(yn); say.n++;
      });
      /* fotoğrafları yeni obje kimliklerine taşı */
      if(paket.fotolar){ var yeniFoto={}; Object.keys(paket.fotolar).forEach(function(k){ yeniFoto[idMap[k]||k]=paket.fotolar[k]; }); paket.fotolar=yeniFoto; }
    }
    if(paket.fotolar && Object.keys(paket.fotolar).length){
      try{ await fotoYaz(paket.fotolar); say.f=Object.keys(paket.fotolar).reduce(function(a,k){ return a+paket.fotolar[k].length; },0); }catch(e){}
    }
    try{ if(window.saveProject) window.saveProject(); }catch(e){}
    try{ if(window.aybNotesRebuild) window.aybNotesRebuild(); }catch(e){}
    try{ if(window.aybForceFullRender) window.aybForceFullRender(); else if(window.renderAll) window.renderAll(); }catch(e){}
    try{ if(window.toast) toast('Paket alındı: '+say.o+' obje, '+say.h+' hat, '+say.n+' not'+(say.f?(', '+say.f+' fotoğraf'):'')+(say.d?(' • '+say.d+' mükerrer atlandı'):'')); }catch(e){}
  }
  window.aybPaketDisari=disari;
  window.aybPaketIceri=iceri;

  /* dosya seçince paket mi diye bak (Tam İçe Al düğmesi de bunu kullanır) */
  window.aybPaketMi=function(j){ return !!(j && j.ayb==='proje-paketi' && j.proje); };

  function btn(){
    if(d.getElementById('aybPaketBtn')) return true;
    var a=d.getElementById('aybTamIceBtn')||d.getElementById('btnAYB')||d.getElementById('btnMIFExport')||d.getElementById('btnKML');
    if(!a||!a.parentNode) return false;
    var b=d.createElement('button'); b.id='aybPaketBtn'; b.type='button'; b.className=a.className;
    b.title='Proje Paketi - projenin AYNISINI tek dosyada dışa ver (formlar, lambalar, notlar, fotoğraflar)';
    b.innerHTML='<div class="ayb-pro-ico" style="color:#7c3aed;">📦</div><small>Paket Dış</small>';
    b.addEventListener('click', function(e){ try{e.preventDefault();e.stopPropagation();}catch(_){} disari(); });
    a.parentNode.insertBefore(b, a.nextSibling);
    return true;
  }
  var t=0, iv=setInterval(function(){ if(btn()|| ++t>80) clearInterval(iv); }, 600);
})();

/* ===================== LAMBA SEMBOLÜ: forma girmeden düzgün görünsün =====================
   Lamba çizimi "guc" alanını kullanıyor; içe alınan kayıtlarda bu alan boş kalınca
   sembol/etiket ancak direk formu açılıp kapanınca düzeliyordu. Artık otomatik tamamlanır. */
(function(){
  "use strict";
  function gucCikar(txt){
    var m=String(txt==null?'':txt).match(/(\d{1,4})\s*[wW]/);
    if(m) return m[1];
    m=String(txt==null?'':txt).match(/(\d{1,4})/);
    return m?m[1]:'';
  }
  function duzelt(){
    var p=window.project; if(!p||!Array.isArray(p.objects)) return 0;
    var n=0;
    for(var i=0;i<p.objects.length;i++){
      var o=p.objects[i];
      if(!o||o.type!=='direk'||!o.props) continue;
      var pr=o.props;
      var imza=(pr.durum||'')+'|'+((pr.lambalar||[]).map(function(l){ return (l&&l.durum||'')+':'+(l&&l.guc||''); }).join(','));
      if(pr.__aybLambaOk===imza) continue;
      var arr=Array.isArray(pr.lambalar)?pr.lambalar:null;
      /* lambalar dizisi yoksa ama lamba bilgisi varsa oluştur */
      if(!arr){
        var kaynak=pr.lamba_gucu||pr.lamba||pr.armatur_tipi||pr.LAMBA||null;
        if(kaynak){
          arr=[{ armatur:String(pr.armatur||pr.armatur_tipi||'LED'), cins:String(kaynak), guc:gucCikar(kaynak),
                 durum:String(pr.lamba_durum||pr.durum||''), adet:Number(pr.lamba_adet||1)||1 }];
          pr.lambalar=arr; n++;
        }
      }
      if(Array.isArray(arr)){
        for(var k=0;k<arr.length;k++){
          var l=arr[k]; if(!l) continue;
          if(!l.guc || !String(l.guc).match(/\d/)){
            var g=gucCikar(l.cins||l.lamba_tipi||l.tip||l.ad||'');
            if(g){ l.guc=g; n++; }
          }
          if(!l.armatur && l.cins) { l.armatur='LED'; }
          if(!l.adet) l.adet=1;
          /* lamba durumu yoksa direğin durumunu kullan (tahmin yok, sadece eksik tamamlama) */
          if(!l.durum && pr.durum){ l.durum=pr.durum; n++; }
        }
      }
      pr.__aybLambaOk=(pr.durum||'')+'|'+((pr.lambalar||[]).map(function(l){ return (l&&l.durum||'')+':'+(l&&l.guc||''); }).join(','));
    }
    if(n){
      try{ if(window.saveProject) window.saveProject(); }catch(e){}
      try{ if(window.aybForceFullRender) window.aybForceFullRender(); else if(window.renderAll) window.renderAll(); }catch(e){}
      try{ if(window.toast) toast(n+' lamba bilgisi tamamlandı (sembol düzeldi).'); }catch(e){}
    }
    return n;
  }
  window.aybLambaDuzelt=duzelt;
  setInterval(function(){ try{ duzelt(); }catch(e){} }, 2000);
})();

/* ===================== MENÜYE BASINCA HARİTAYA OBJE ATILMASIN =====================
   Menü/sekme/düğmeye dokunulduğunda bu dokunuş haritaya da geçebiliyor ve (Direk aracı açıksa)
   yeni direk atılıp form açılıyordu. Menü dokunuşundan hemen sonraki harita tıklaması yok sayılır. */
(function(){
  "use strict";
  var d=document, sonUi=0;
  function menuIci(el){
    try{
      var t=el;
      while(t && t!==d){
        var c=(t.className&&String(t.className))||'', id=(t.id||'');
        if(t.tagName==='BUTTON'||t.tagName==='SELECT'||t.tagName==='INPUT'||t.tagName==='LABEL') return true;
        if(c.indexOf('ayb-ribbon')>=0||c.indexOf('ayb-pro-')>=0||c.indexOf('toolbar')>=0||c.indexOf('win-modal')>=0||c.indexOf('modal')>=0) return true;
        if(id==='aybRibbonTabs'||id==='aybTopbar'||id==='topbar'||id==='workbar') return true;
        t=t.parentNode;
      }
    }catch(e){}
    return false;
  }
  d.addEventListener('pointerdown', function(e){ if(menuIci(e.target)) sonUi=Date.now(); }, true);
  d.addEventListener('click', function(e){ if(menuIci(e.target)) sonUi=Date.now(); }, true);

  var kurulu=false;
  function kur(){
    if(kurulu) return;
    var f=window.handleMapClick;
    if(typeof f!=='function' || f.__aybGhost2) return;
    var inner=f;
    var w=function(e){
      if(Date.now()-sonUi < 400){          /* menü dokunuşunun devamı -> haritaya işlem yapma */
        try{ if(window.hint) window.hint('Menü dokunuşu — haritaya işlem yapılmadı.'); }catch(_){}
        return;
      }
      return inner.apply(this, arguments);
    };
    w.__aybGhost2=true;
    try{ for(var k in inner){ if(Object.prototype.hasOwnProperty.call(inner,k)) w[k]=inner[k]; } }catch(e){}
    window.handleMapClick=w; kurulu=true;
  }
  kur();
  var n=0, iv=setInterval(function(){ kur(); if(kurulu || ++n>80) clearInterval(iv); }, 400);
})();

/* ===================== DXF DIŞA AKTAR (B_CAD sembol fontuyla) =====================
   İçe alırken B_CAD stilini nasıl okuyorsak, dışa verirken de aynı şekilde yazıyoruz:
   STYLE tablosunda 'Direk' -> B_CAD, semboller o stille TEXT olarak, yazılar Standard ile. */
(function(){
  "use strict";
  var d=document;

  /* --- Türkçe (windows-1254) kodlayıcı: AutoCAD Türkçe karakterleri doğru görsün --- */
  var TR={'Ğ':0xD0,'ğ':0xF0,'İ':0xDD,'ı':0xFD,'Ş':0xDE,'ş':0xFE,'Ö':0xD6,'ö':0xF6,'Ü':0xDC,'ü':0xFC,'Ç':0xC7,'ç':0xE7,
          'Â':0xC2,'â':0xE2,'Î':0xCE,'î':0xEE,'Û':0xDB,'û':0xFB};
  function cp1254(str){
    var s=String(str==null?'':str), out=new Uint8Array(s.length), n=0;
    for(var i=0;i<s.length;i++){
      var c=s.charCodeAt(i), ch=s[i];
      if(c<128) out[n++]=c;
      else if(c<=0xFF && TR[ch]==null) out[n++]=c;   /* B_CAD sembol kodları (128-255) aynen yazılır */
      else if(TR[ch]!=null) out[n++]=TR[ch];
      else out[n++]=63;
    }
    return out.slice(0,n);
  }
  /* --- koordinat: WGS84 -> ITRF96 TM3 (metre) --- */
  function meridyen(lng){
    var izin=[27,30,33,36,39,42,45], en=izin[0];
    for(var i=0;i<izin.length;i++){ if(Math.abs(izin[i]-lng)<Math.abs(en-lng)) en=izin[i]; }
    return en;
  }
  function tm(lat,lng){
    try{
      if(typeof window.latLonToTm3==='function'){
        var r=window.latLonToTm3(lat,lng,meridyen(lng));
        if(r){
          var y=(r.easting!=null?r.easting:(r.y!=null?r.y:r.Y));
          var x=(r.northing!=null?r.northing:(r.x!=null?r.x:r.X));
          if(isFinite(y)&&isFinite(x)) return {y:+y, x:+x};
        }
      }
    }catch(e){}
    return null;
  }
  /* --- B-pro LEJANT sembolleri (lejant DXF'inden birebir çıkarıldı) --- */
  var AYB_LEJANT={"DIREK_AG_MEVCUT":{"boyut":[2.25,2.25],"c":[{"t":"C","c":[0.0,0.0],"r":1.124}]},"DIREK_AG_YENI":{"boyut":[2.45,2.45],"c":[{"t":"A","c":[0.0,0.0],"r":1.225,"a":[0.0,180.0]},{"t":"A","c":[0.0,0.0],"r":1.225,"a":[180.0,0.0]}]},"DIREK_AYD_MEVCUT":{"boyut":[2.02,2.02],"c":[{"t":"C","c":[0.0,0.0],"r":1.012}]},"DIREK_AYD_YENI":{"boyut":[2.2,2.2],"c":[{"t":"A","c":[0.0,0.0],"r":1.103,"a":[0.0,180.0]},{"t":"A","c":[0.0,0.0],"r":1.103,"a":[180.0,0.0]}]},"DIREK_OG_MEVCUT":{"boyut":[2.97,2.23],"c":[{"t":"L","p":[[0.703,0.045],[0.081,-1.113]],"k":false},{"t":"L","p":[[-0.081,0.045],[-0.703,-1.113]],"k":false},{"t":"L","p":[[0.311,1.113],[0.311,0.045]],"k":false},{"t":"L","p":[[1.487,0.045],[0.865,-1.113]],"k":false},{"t":"L","p":[[-0.865,0.045],[-1.487,-1.113]],"k":false},{"t":"L","p":[[-0.865,0.045],[1.487,0.045]],"k":false}]},"DIREK_OG_YENI":{"boyut":[2.94,3.8],"c":[{"t":"A","c":[0.0,0.43],"r":1.47,"a":[0.0,180.0]},{"t":"A","c":[0.0,0.43],"r":1.47,"a":[180.0,0.0]},{"t":"L","p":[[-1.205,-1.9],[1.147,-1.9]],"k":false},{"t":"L","p":[[-0.029,-0.832],[-0.029,-1.9]],"k":false}]},"TRAFO_YENI":{"boyut":[4.7,4.12],"c":[{"t":"S","p":[[0.0,2.058],[-2.352,-2.058],[2.352,-2.058],[2.352,-2.058]],"k":false}]},"BOX_MEVCUT":{"boyut":[4.59,2.82],"c":[{"t":"P","p":[[-2.294,1.41],[2.294,1.41],[2.294,-1.41],[-2.294,-1.41]],"k":true},{"t":"L","p":[[-2.294,-1.41],[2.294,1.41]],"k":false}]},"BOX_YENI":{"boyut":[4.59,2.82],"c":[{"t":"L","p":[[-2.294,-1.41],[2.294,1.41]],"k":false},{"t":"P","p":[[-2.294,1.41],[2.294,1.41],[2.294,-1.41],[-2.294,-1.41]],"k":true}]},"TOPRAK_KORUMA":{"boyut":[3.72,3.33],"c":[{"t":"L","p":[[1.858,-0.221],[1.082,-1.667]],"k":false},{"t":"L","p":[[-0.102,-0.221],[-0.878,-1.667]],"k":false},{"t":"L","p":[[0.878,-0.221],[0.102,-1.667]],"k":false},{"t":"L","p":[[-1.082,-0.221],[-1.858,-1.667]],"k":false},{"t":"L","p":[[0.388,1.667],[0.388,-0.221]],"k":false}]},"TOPRAK_ISLETME":{"boyut":[1.91,2.74],"c":[{"t":"L","p":[[0.0,1.37],[0.0,-0.14]],"k":false},{"t":"L","p":[[-0.953,-0.782],[0.953,-0.782]],"k":false},{"t":"L","p":[[-0.416,-1.37],[0.416,-1.37]],"k":false}]},"PARAFUDR":{"boyut":[3.24,3.36],"c":[{"t":"L","p":[[1.62,1.678],[-0.109,1.678]],"k":false},{"t":"L","p":[[1.539,-0.448],[0.879,-1.678]],"k":false},{"t":"L","p":[[-0.127,-0.448],[-0.787,-1.678]],"k":false},{"t":"L","p":[[0.706,-0.448],[0.046,-1.678]],"k":false},{"t":"L","p":[[-0.96,-0.448],[-1.62,-1.678]],"k":false},{"t":"L","p":[[-0.96,-0.448],[1.539,-0.448]],"k":false},{"t":"L","p":[[1.62,1.678],[0.29,-0.448]],"k":false},{"t":"S","p":[[1.226,0.357],[0.324,-0.431],[0.717,0.234],[0.565,0.748]],"k":false}]}};
  /* --- lamba karakterleri: lejanttan kesin eşleşme (mevcut / yeni) --- */
  function lambaKarakter(l, direkDurum){
    var a=String((l&&(l.armatur||l.cins))||'').toLocaleUpperCase('tr');
    var dm=String((l&&l.durum)||direkDurum||'').toLocaleUpperCase('tr');
    var yeni=(dm.indexOf('YEN')===0);
    if(a.indexOf('SODYUM')>=0) return yeni?'C':'h';
    if(a.indexOf('CIVA')>=0||a.indexOf('CİVA')>=0) return yeni?'X':'r';
    if(a.indexOf('FLOR')>=0) return 'Z';
    return yeni?'q':'z';             /* LED */
  }
  /* --- lejant sembolünü BLOCK olarak yaz --- */
  function blokTanim(ad){
    var sm=AYB_LEJANT[ad]; if(!sm) return '';
    var s=g(0,'BLOCK')+g(8,'0')+g(2,ad)+g(70,'0')+g(10,'0.0')+g(20,'0.0')+g(30,'0.0')+g(3,ad);
    sm.c.forEach(function(e){
      if(e.t==='L') s+=g(0,'LINE')+g(8,'0')+g(10,e.p[0][0].toFixed(3))+g(20,e.p[0][1].toFixed(3))+g(30,'0.0')+g(11,e.p[1][0].toFixed(3))+g(21,e.p[1][1].toFixed(3))+g(31,'0.0');
      else if(e.t==='C') s+=g(0,'CIRCLE')+g(8,'0')+g(10,e.c[0].toFixed(3))+g(20,e.c[1].toFixed(3))+g(30,'0.0')+g(40,e.r.toFixed(3));
      else if(e.t==='A') s+=g(0,'ARC')+g(8,'0')+g(10,e.c[0].toFixed(3))+g(20,e.c[1].toFixed(3))+g(30,'0.0')+g(40,e.r.toFixed(3))+g(50,e.a[0].toFixed(2))+g(51,e.a[1].toFixed(2));
      else if(e.t==='P'){
        s+=g(0,'POLYLINE')+g(8,'0')+g(66,'1')+g(70,e.k?'1':'0')+g(10,'0.0')+g(20,'0.0')+g(30,'0.0');
        e.p.forEach(function(q){ s+=g(0,'VERTEX')+g(8,'0')+g(10,q[0].toFixed(3))+g(20,q[1].toFixed(3))+g(30,'0.0')+g(70,'0'); });
        s+=g(0,'SEQEND')+g(8,'0');
      }
      else if(e.t==='S') s+=g(0,'SOLID')+g(8,'0')+g(10,e.p[0][0].toFixed(3))+g(20,e.p[0][1].toFixed(3))+g(30,'0.0')+g(11,e.p[1][0].toFixed(3))+g(21,e.p[1][1].toFixed(3))+g(31,'0.0')+g(12,e.p[2][0].toFixed(3))+g(22,e.p[2][1].toFixed(3))+g(32,'0.0')+g(13,(e.p[3]||e.p[2])[0].toFixed(3))+g(23,(e.p[3]||e.p[2])[1].toFixed(3))+g(33,'0.0');
    });
    return s+g(0,'ENDBLK')+g(8,'0');
  }
  function insertEnt(katman,ad,x,y,olcek){
    if(!AYB_LEJANT[ad]) return '';
    return g(0,'INSERT')+g(8,katman)+g(2,ad)+g(10,x.toFixed(3))+g(20,y.toFixed(3))+g(30,'0.0')+g(41,(olcek||1).toFixed(3))+g(42,(olcek||1).toFixed(3))+g(43,'1.0');
  }
  /* ===== B_CAD FONTUNUN TAM DURUM TABLOSU (Bayram YARAŞ) =====
     Fontta her sembolün 5 durum hali var: M_(MEVCUT) Y_(YENİ) YA_(YAKIN)
     I_(İLERDE) B_(TADILAT BYSK / SÖKÜLEN). Karakterler fontun Windows
     tablosundan glif adı eşleştirilerek çıkarıldı — tahmin yok. */
  function durumOneki(durum){
    var d=String(durum||'').toLocaleUpperCase('tr');
    if(d.indexOf('YENİ')>=0||d.indexOf('YENI')>=0) return 'Y';
    if(d.indexOf('YAKIN')>=0) return 'YA';
    if(d.indexOf('İLER')>=0||d.indexOf('ILER')>=0) return 'I';
    if(d.indexOf('BYSK')>=0||d.indexOf('SÖK')>=0||d.indexOf('SOK')>=0||d.indexOf('TEKRAR')>=0||d.indexOf('TADILAT')>=0) return 'B';
    return 'M';
  }
  var KARAKTER_TABLO={
    AG:       {M:'R', Y:'E', B:'T', YA:'Y', I:'U'},
    AG_KAFES: {M:'P', Y:'2', B:'1', YA:'O', I:'3'},
    OG:       {M:'A', Y:'M', B:'S', YA:'D', I:'F'},
    OG_KAFES: {M:'6', Y:'8', B:'7', YA:'0', I:'9'},
    AYD:      {M:'W', Y:'V', B:'B', YA:'Q', I:'N'},
    BOX:      {M:'H', Y:'J', B:'L', YA:'G', I:'K'},
    KOFRE:    {M:'k', Y:'l', B:'m', YA:'o', I:'n'}
  };
  function direkKarakter(pr,durum){
    var gt=String(pr.genel_tip||pr.GENEL_TIP||'').toLocaleUpperCase('tr');
    var alt=String(pr.alt_tip||pr.ALT_TIP||'').toLocaleUpperCase('tr');
    var kafes=(alt.indexOf('KAFES')>=0);
    var grup;
    if(gt.indexOf('OG')>=0||gt.indexOf('MUS')>=0||gt.indexOf('MÜŞ')>=0) grup=kafes?'OG_KAFES':'OG';
    else if(gt.indexOf('AYD')>=0) grup='AYD';
    else grup=kafes?'AG_KAFES':'AG';
    var t=KARAKTER_TABLO[grup];
    return t[durumOneki(durum)]||t.M;
  }
  function boxKarakter(durum){ var t=KARAKTER_TABLO.BOX; return t[durumOneki(durum)]||t.M; }
  function kofreKarakter(durum){ var t=KARAKTER_TABLO.KOFRE; return t[durumOneki(durum)]||t.M; }
  function direkBlok(o,pr,yeni){
    var gt=String(pr.genel_tip||pr.GENEL_TIP||'').toLocaleUpperCase('tr');
    if(gt.indexOf('AYD')>=0) return yeni?'DIREK_AYD_YENI':'DIREK_AYD_MEVCUT';
    if(gt.indexOf('OG')>=0||gt.indexOf('MUS')>=0) return yeni?'DIREK_OG_YENI':'DIREK_OG_MEVCUT';
    return yeni?'DIREK_AG_YENI':'DIREK_AG_MEVCUT';
  }

  function KAT(){
    return [
      ['DIREK_MEVCUT',4],['DIREK_YENI',3],['TRAFO_MEVCUT',5],['TRAFO_YENI',5],['KOFRE_MEVCUT',6],['BOX_MEVCUT',5],
      ['ABONE_MEVCUT',2],['EK_MUF',8],['LAMBA_SEMBOL',4],['LAMBA_GUCU',4],['ETIKET_OK',7],
      ['HAT_AYD_HAVAI',150],['HAT_AYD_YERALTI',5],['HAT_ABONE',2],['KANAL',40],['CIZGI',7],['ALAN',3],['NOT',2],['TOPRAKLAMA',1]
    ];
  }
  function g(kod,deger){ return kod+'\n'+deger+'\n'; }
  function txtEnt(katman,x,y,h,metin,stil,renk,aci){
    var s=g(0,'TEXT')+g(8,katman);
    if(renk!=null) s+=g(62,renk);
    s+=g(10,x.toFixed(3))+g(20,y.toFixed(3))+g(30,'0.0')+g(40,(h||2).toFixed(3))+g(1,String(metin));
    s+=g(50,(aci?(+aci):0).toFixed(2))+g(7,stil||'Standard');
    s+=g(72,'1')+g(11,x.toFixed(3))+g(21,y.toFixed(3))+g(31,'0.0')+g(73,'2');
    return s;
  }
  function noktaEnt(katman,x,y){ return g(0,'POINT')+g(8,katman)+g(10,x.toFixed(3))+g(20,y.toFixed(3))+g(30,'0.0'); }
  function daireEnt(katman,x,y,r){ return g(0,'CIRCLE')+g(8,katman)+g(10,x.toFixed(3))+g(20,y.toFixed(3))+g(30,'0.0')+g(40,(r||0.6).toFixed(3)); }
  function kareEnt(katman,x,y,r){
    r=r||0.8;
    var pts=[{y:x-r,x:y-r},{y:x+r,x:y-r},{y:x+r,x:y+r},{y:x-r,x:y+r}];
    return polyEnt(katman, pts, true);
  }
  function polyEnt(katman,pts,kapali,ltype){
    /* R12 uyumlu: POLYLINE + VERTEX + SEQEND (LWPOLYLINE R13+ olduğu için AutoCAD boş açıyordu) */
    var s=g(0,'POLYLINE')+g(8,katman)+(ltype?g(6,ltype):'')+g(66,'1')+g(70,kapali?'1':'0')+g(10,'0.0')+g(20,'0.0')+g(30,'0.0');
    for(var i=0;i<pts.length;i++){
      s+=g(0,'VERTEX')+g(8,katman)+g(10,pts[i].y.toFixed(3))+g(20,pts[i].x.toFixed(3))+g(30,'0.0')+g(70,'0');
    }
    s+=g(0,'SEQEND')+g(8,katman);
    return s;
  }
  /* Lejant PDF'indeki TRAFO POSTASI sembolü: ÜÇGEN (mevcut=boş, yeni=dolu) */
  function trafoUcgen(katman,c,dolu,ltype){
    var tw=2.35, th=2.06;
    var s2=polyEnt(katman,[{y:c.y,x:c.x+th},{y:c.y-tw,x:c.x-th},{y:c.y+tw,x:c.x-th}],true,ltype);
    if(dolu){
      s2+=g(0,'SOLID')+g(8,katman)
        +g(10,c.y.toFixed(3))+g(20,(c.x+th).toFixed(3))+g(30,'0.0')
        +g(11,(c.y-tw).toFixed(3))+g(21,(c.x-th).toFixed(3))+g(31,'0.0')
        +g(12,(c.y+tw).toFixed(3))+g(22,(c.x-th).toFixed(3))+g(32,'0.0')
        +g(13,(c.y+tw).toFixed(3))+g(23,(c.x-th).toFixed(3))+g(33,'0.0');
    }
    return s2;
  }
  function solidQuad(katman,p1,p2,p3,p4){
    return g(0,'SOLID')+g(8,katman)
      +g(10,p1.y.toFixed(3))+g(20,p1.x.toFixed(3))+g(30,'0.0')
      +g(11,p2.y.toFixed(3))+g(21,p2.x.toFixed(3))+g(31,'0.0')
      +g(12,p3.y.toFixed(3))+g(22,p3.x.toFixed(3))+g(32,'0.0')
      +g(13,p4.y.toFixed(3))+g(23,p4.x.toFixed(3))+g(33,'0.0');
  }
  function cizgiEnt(katman,a,b,ltype){
    return g(0,'LINE')+g(8,katman)+(ltype?g(6,ltype):'')
      +g(10,a.y.toFixed(3))+g(20,a.x.toFixed(3))+g(30,'0.0')
      +g(11,b.y.toFixed(3))+g(21,b.x.toFixed(3))+g(31,'0.0');
  }
  /* TRAFO TÜRÜNE GÖRE SEMBOL — B PRO LEJANT DXF'İNDEN BİREBİR ÇIKARILDI (Bayram YARAŞ):
     DİREK      -> üçgen 4.71x4.11 (lejanttaki "DIREK TIPI TRAFO POSTASI")
     BINA       -> kare 4.71x4.71  (lejanttaki "BINA TIPI TRAFO POSTASI")
     BETONKÖŞK  -> çatılı köşk     (lejanttaki "MBK: MODULER BETON KOSK")
     MEVCUT = boş çizgi, YENİ = dolu. */
  function trafoSembol(katman,c,durum,tur){
    var on=durumOneki(durum), dolu=(on==='Y'), lt=(on==='I')?'DASHED':null;
    var t=String(tur||'').toLocaleUpperCase('tr').replace(/\s+/g,'');
    if(t.indexOf('DİREK')>=0||t.indexOf('DIREK')>=0) return trafoUcgen(katman,c,dolu,lt);
    var s2='';
    function P(dx,dy){ return {y:c.y+dx, x:c.x+dy}; }
    if(t.indexOf('KÖŞK')>=0||t.indexOf('KOSK')>=0||t.indexOf('KULE')>=0){
      /* B Pro MBK sembolü (lejanttan birebir, merkeze oturtuldu) */
      s2+=cizgiEnt(katman,P(2.99,1.06),P(1.58,1.06),lt);    /* sağ saçak */
      s2+=cizgiEnt(katman,P(0,2.47),P(2.99,1.06),lt);       /* sağ çatı  */
      s2+=cizgiEnt(katman,P(1.58,1.06),P(1.58,-2.47),lt);   /* sağ duvar */
      s2+=cizgiEnt(katman,P(-1.59,1.06),P(-3.0,1.06),lt);   /* sol saçak */
      s2+=cizgiEnt(katman,P(-1.59,-2.47),P(-1.59,1.06),lt); /* sol duvar */
      s2+=cizgiEnt(katman,P(-3.0,1.06),P(0,2.47),lt);       /* sol çatı  */
      s2+=cizgiEnt(katman,P(-1.59,-2.47),P(1.58,-2.47),lt); /* taban     */
      s2+=cizgiEnt(katman,P(0,2.47),P(0,-2.47),lt);         /* orta dikme (lejanttaki gibi) */
      if(dolu){
        s2+=solidQuad(katman,P(0,2.47),P(2.99,1.06),P(0,1.06),P(0,1.06));
        s2+=solidQuad(katman,P(-3.0,1.06),P(0,2.47),P(0,1.06),P(0,1.06));
        s2+=solidQuad(katman,P(0,1.06),P(1.58,1.06),P(0,-2.47),P(1.58,-2.47));
        s2+=solidQuad(katman,P(-1.59,1.06),P(0,1.06),P(-1.59,-2.47),P(0,-2.47));
      }
    } else {
      /* bina: 4.71'lik kare (lejant ölçüsü) */
      var w=2.355;
      s2+=polyEnt(katman,[P(-w,-w),P(w,-w),P(w,w),P(-w,w)],true,lt);
      if(dolu){ s2+=solidQuad(katman,P(-w,w),P(w,w),P(-w,-w),P(w,-w)); }
    }
    return s2;
  }

  function uret(){
    var p=window.project;
    if(!p){ try{ if(window.toast) toast('Önce proje aç.'); }catch(e){} return null; }
    var objs=(p.objects||[]), lines=(p.lines||[]);
    var say={n:0,l:0,t:0};
    var s='';
    /* HEADER */
    s+=g(0,'SECTION')+g(2,'HEADER')+g(9,'$ACADVER')+g(1,'AC1009')+g(9,'$INSUNITS')+g(70,'6')+g(9,'$PDMODE')+g(70,'34')+g(9,'$PDSIZE')+g(40,'-2.0');
    s+='__SINIR__'+g(0,'ENDSEC');
    /* TABLES: LTYPE + LAYER + STYLE(B_CAD) */
    s+=g(0,'SECTION')+g(2,'TABLES');
    s+=g(0,'TABLE')+g(2,'LTYPE')+g(70,'2')+g(0,'LTYPE')+g(2,'CONTINUOUS')+g(70,'0')+g(3,'Solid line')+g(72,'65')+g(73,'0')+g(40,'0.0')+g(0,'LTYPE')+g(2,'DASHED')+g(70,'0')+g(3,'Dashed line')+g(72,'65')+g(73,'2')+g(40,'1.2')+g(49,'0.8')+g(49,'-0.4')+g(0,'ENDTAB');
    var kats=KAT();
    s+=g(0,'TABLE')+g(2,'LAYER')+g(70,String(kats.length));
    kats.forEach(function(k){ s+=g(0,'LAYER')+g(2,k[0])+g(70,'0')+g(62,String(k[1]))+g(6,'CONTINUOUS'); });
    s+=g(0,'ENDTAB');
    /* STYLE: Direk -> B_CAD (sembol fontu), Standard -> arial */
    s+=g(0,'TABLE')+g(2,'STYLE')+g(70,'2');
    s+=g(0,'STYLE')+g(2,'Standard')+g(70,'0')+g(40,'0.0')+g(41,'1.0')+g(50,'0.0')+g(71,'0')+g(42,'2.5')+g(3,'arial.ttf')+g(4,'');
    s+=g(0,'STYLE')+g(2,'Direk')+g(70,'0')+g(40,'0.0')+g(41,'1.0')+g(50,'0.0')+g(71,'0')+g(42,'2.5')+g(3,'B_CAD')+g(4,'');
    s+=g(0,'ENDTAB')+g(0,'ENDSEC');
    /* BLOCKS: lejant sembolleri */
    s+=g(0,'SECTION')+g(2,'BLOCKS');
    Object.keys(AYB_LEJANT).forEach(function(ad){ s+=blokTanim(ad); });
    s+=g(0,'ENDSEC');
    /* ENTITIES */
    s+=g(0,'SECTION')+g(2,'ENTITIES');
    var koord={}, minY=Infinity, minX=Infinity, maxY=-Infinity, maxX=-Infinity;
    function sinirGuncelle(c){ if(!c) return; if(c.y<minY)minY=c.y; if(c.y>maxY)maxY=c.y; if(c.x<minX)minX=c.x; if(c.x>maxX)maxX=c.x; }
    objs.forEach(function(o){
      if(!o||o.lat==null) return;
      var c=tm(o.lat,o.lng); if(!c) return;
      koord[o.id]=c; sinirGuncelle(c);
      var pr=o.props||{}, yeni=(String(pr.durum||'').toLocaleUpperCase('tr').indexOf('YENİ')>=0||String(pr.durum||'').toLocaleUpperCase('tr').indexOf('YENI')>=0);
      var no=''; try{ no=(window.getObjectNo?window.getObjectNo(o):'')||''; }catch(e){}
      if(o.type==='direk'){
        var dkat=yeni?'DIREK_YENI':'DIREK_MEVCUT';
        /* DÜZELTME: genel tipi TR/TRAFO olan kayıtlar direk sembolü değil TRAFO ÜÇGENİ alır */
        var gtTR=String(pr.genel_tip||pr.GENEL_TIP||'').toLocaleUpperCase('tr');
        if(gtTR==='TR'||gtTR.indexOf('TRAFO')>=0){
          s+=trafoSembol(yeni?'TRAFO_YENI':'TRAFO_MEVCUT', c, pr.durum||'', 'DİREK'); say.n++;
        } else {
          var kar=direkKarakter(pr, pr.durum||pr.Durumu||'');
          if(kar){ s+=txtEnt(dkat, c.y, c.x, 2.5, kar, 'Direk', null, 0); say.t++; }
          else { var blk=direkBlok(o,pr,yeni); s+= (insertEnt(dkat, blk, c.y, c.x, 1) || (daireEnt(dkat,c.y,c.x,0.6)+noktaEnt(dkat,c.y,c.x))); say.n++; }
        }

        /* lambalar: B_CAD sembolü + güç yazısı */
        var lm=Array.isArray(pr.lambalar)?pr.lambalar:[];
        lm.forEach(function(l,idx){
          if(!l) return;
          var kar=lambaKarakter(l, pr.durum), dy=2.2+idx*2.6;
          s+=txtEnt('LAMBA_SEMBOL', c.y, c.x+dy, 2.0, kar, 'Direk', null, 0); say.t++;
          var guc=String(l.guc||'').replace(/\D/g,'');
          if(guc){ s+=txtEnt('LAMBA_GUCU', c.y+2.6, c.x+dy, 1.4, guc+'W', 'Standard', null, 0); say.t++; }
        });
        if(pr.koruma||pr.isletme){
          s+=txtEnt('TOPRAKLAMA', c.y-2.8, c.x, 2.5, pr.isletme?'5':'4', 'Direk', null, 0);   /* ISL_TOPRAKLAMASI / TOPRAKLAMA */
          say.t++;
        }
      } else if(o.type==='trafo'){
        /* DÜZELTME (Bayram YARAŞ): trafo, TÜRÜNE göre lejant sembolüyle çizilir:
           DİREK=üçgen, BINA=kare, BETONKÖŞK=çatılı köşk. MEVCUT=boş, YENİ=dolu. */
        s+=trafoSembol(yeni?'TRAFO_YENI':'TRAFO_MEVCUT', c, pr.durum||'', pr.trafo_turu||pr.TRAFO_TURU||'');
        say.n++;
      }
      else if(o.type==='kofre'){ s+=txtEnt('KOFRE_MEVCUT', c.y, c.x, 2.5, kofreKarakter(pr.durum||''), 'Direk', null, 0); say.t++; }
      else if(o.type==='box'){ s+=txtEnt('BOX_MEVCUT', c.y, c.x, 2.5, boxKarakter(pr.durum||''), 'Direk', null, 0); say.t++; }
      else if(o.type==='abone'){ s+=daireEnt('ABONE_MEVCUT', c.y, c.x, 0.7); say.n++; }
      else { s+=kareEnt('EK_MUF', c.y, c.x, 0.6); say.n++; }
      /* numara + tip etiketi */
      var tip=''; try{ tip=(window.getObjectTip?window.getObjectTip(o):'')||''; }catch(e){}
      if(no){ s+=txtEnt('ETIKET_OK', c.y, c.x-2.2, 1.8, String(no), 'Standard', null, 0); say.t++; }
      if(tip && tip!==no){ s+=txtEnt('ETIKET_OK', c.y, c.x-4.2, 1.5, String(tip), 'Standard', null, 0); say.t++; }
    });
    lines.forEach(function(l){
      if(!l) return;
      var a=koord[l.start], b=koord[l.end]; if(!a||!b) return;
      var kind=String(l.kind||l.type||'hat').toLowerCase();
      var kat=(kind.indexOf('yeralti')>=0)?'HAT_AYD_YERALTI':(kind.indexOf('abone')>=0?'HAT_ABONE':'HAT_AYD_HAVAI');
      var pts=[{y:a.y,x:a.x},{y:b.y,x:b.x}];
      if(Array.isArray(l.points)&&l.points.length>2){
        pts=[]; l.points.forEach(function(q){ var c2=tm(q[0],q[1]); if(c2) pts.push({y:c2.y,x:c2.x}); });
        if(pts.length<2) pts=[{y:a.y,x:a.x},{y:b.y,x:b.x}];
      }
      s+=polyEnt(kat, pts, false); say.l++;
      /* DÜZELTME (Bayram YARAŞ): HAT KESİTİ artık programın haritada gösterdiği
         metinle aynı alınır (main_hat_tipi/og_hat_tipi/hat_tipi + AG eki).
         Eski kod var olmayan 'kesit'/'cins' anahtarlarına bakıyordu → hep boştu. */
      var kesit='';
      try{ if(typeof window.getLineDisplayText==='function') kesit=String(window.getLineDisplayText(l)||'').trim(); }catch(e){}
      if(!kesit){ var lp=l.props||{};
        kesit=String(lp.main_hat_tipi||lp.og_hat_tipi||lp.hat_tipi||lp.kesit||lp.cins||'').trim();
        if(lp.ag_hat_aktif&&lp.ag_hat_tipi){ kesit=kesit?(kesit+'+('+lp.ag_hat_tipi+')'):String(lp.ag_hat_tipi); }
      }
      var uz=(l.length_m!=null)?(Number(l.length_m).toFixed(1)+' m'):'';
      var uzSayi=(l.length_m!=null)?Number(l.length_m):0;
      /* İSTEK (Bayram YARAŞ): programdaki gibi — KESİT hattın ÜSTÜNDE, METRE ALTINDA */
      var uzTxt=(uzSayi>0.5?uzSayi.toFixed(1)+' m':'');
      if(kesit||uzTxt){
        var mx=(pts[0].y+pts[pts.length-1].y)/2, my=(pts[0].x+pts[pts.length-1].x)/2;
        var ang=Math.atan2(pts[pts.length-1].x-pts[0].x, pts[pts.length-1].y-pts[0].y)*180/Math.PI;
        while(ang>90) ang-=180; while(ang<-90) ang+=180;      /* yazı hiç ters dönmesin */
        var rad=ang*Math.PI/180;
        var px=-Math.sin(rad), pyv=Math.cos(rad);             /* hatta dik birim vektör (üst yön) */
        if(kesit){ s+=txtEnt('ETIKET_OK', mx+px*1.6, my+pyv*1.6, 1.4, kesit, 'Standard', null, ang); say.t++; }
        if(uzTxt){ s+=txtEnt('ETIKET_OK', mx-px*1.6, my-pyv*1.6, 1.4, uzTxt, 'Standard', null, ang); say.t++; }
      }
    });
    (p.channels||[]).forEach(function(c2){ if(!c2||!c2.points) return; var pts=[]; c2.points.forEach(function(q){ var t2=tm(q[0],q[1]); if(t2) pts.push({y:t2.y,x:t2.x}); }); if(pts.length>1){ s+=polyEnt('KANAL',pts,false); say.l++; } });
    (p.freeLines||[]).forEach(function(c2){ if(!c2||!c2.points) return; var pts=[]; c2.points.forEach(function(q){ var t2=tm(q[0],q[1]); if(t2) pts.push({y:t2.y,x:t2.x}); }); if(pts.length>1){ s+=polyEnt('CIZGI',pts,false); say.l++; } });
    (p.areas||[]).forEach(function(c2){ if(!c2||!c2.points) return; var pts=[]; c2.points.forEach(function(q){ var t2=tm(q[0],q[1]); if(t2) pts.push({y:t2.y,x:t2.x}); }); if(pts.length>2){ s+=polyEnt('ALAN',pts,true); say.l++; } });
    (p.aybNotes||[]).forEach(function(n){ if(!n||n.lat==null) return; var c2=tm(n.lat,n.lng); if(!c2) return; s+=txtEnt('NOT', c2.y, c2.x, 2.0, String(n.text||'Not').replace(/\n/g,' '), 'Standard', null, 0); say.t++; });
    s+=g(0,'ENDSEC')+g(0,'EOF');
    var sinir='';
    if(isFinite(minY)&&isFinite(minX)){
      sinir=g(9,'$EXTMIN')+g(10,minY.toFixed(3))+g(20,minX.toFixed(3))+g(30,'0.0')
           +g(9,'$EXTMAX')+g(10,maxY.toFixed(3))+g(20,maxX.toFixed(3))+g(30,'0.0');
    }
    s=s.replace('__SINIR__', sinir);
    return {metin:s, say:say};
  }

  function disari(){
    var r=uret(); if(!r) return;
    if(!r.say.n && !r.say.l && !r.say.t){ try{ if(window.toast) toast('Dışa aktarılacak çizim yok.'); }catch(e){} return; }
    var bayt=cp1254(r.metin);
    var ad='DXF_'+String((window.project&&(window.project.name||window.project.id))||'Saha').replace(/[^\wğüşıöçĞÜŞİÖÇ.-]/g,'_')+'_'+(new Date().toISOString().slice(0,10))+'.dxf';
    var blob=new Blob([bayt],{type:'application/dxf'});
    try{ if(window.aybShareFile){ window.aybShareFile(ad, blob, 'application/dxf'); } else { var a=d.createElement('a'); a.href=URL.createObjectURL(blob); a.download=ad; d.body.appendChild(a); a.click(); setTimeout(function(){a.remove();},800); } }catch(e){}
    try{ if(window.toast) toast('DXF hazır (B_CAD sembollü): '+r.say.n+' nokta, '+r.say.l+' çizgi, '+r.say.t+' yazı/sembol'); }catch(e){}
  }
  window.aybDxfDisari=disari;

  function btn(){
    if(d.getElementById('aybDxfBtn')) return true;
    var a=d.getElementById('aybPaketBtn')||d.getElementById('btnAYB')||d.getElementById('btnMIFExport')||d.getElementById('btnKML');
    if(!a||!a.parentNode) return false;
    var b=d.createElement('button'); b.id='aybDxfBtn'; b.type='button'; b.className=a.className;
    b.title='DXF Dışarı Ver - AutoCAD için, B_CAD sembol fontu ve katmanlarla';
    b.innerHTML='<div class="ayb-pro-ico" style="color:#0891b2;">📐</div><small>DXF Dış</small>';
    b.addEventListener('click', function(e){ try{e.preventDefault();e.stopPropagation();}catch(_){} disari(); });
    a.parentNode.insertBefore(b, a.nextSibling);
    return true;
  }
  var t=0, iv=setInterval(function(){ if(btn()|| ++t>80) clearInterval(iv); }, 600);
})();

/* ===================== LAMBA DURUMU TOPLU AYAR (yeni / mevcut / sökülen) ===================== */
(function(){
  "use strict";
  var d=document;
  function uygula(durum, hepsi){
    var p=window.project; if(!p||!Array.isArray(p.objects)){ try{ if(window.toast) toast('Önce proje aç.'); }catch(e){} return; }
    var n=0, dn=0;
    p.objects.forEach(function(o){
      if(!o||o.type!=='direk'||!o.props) return;
      var arr=Array.isArray(o.props.lambalar)?o.props.lambalar:null;
      if(!arr||!arr.length) return;
      arr.forEach(function(l){
        if(!l) return;
        if(!hepsi && String(l.durum||'').toLocaleUpperCase('tr')===String(durum).toLocaleUpperCase('tr')) return;
        l.durum=durum; n++;
      });
      if(hepsi && o.props.durum!==durum){ /* direk durumuna dokunma */ }
      dn++;
      try{ delete o.props.__aybLambaOk; }catch(e){}
    });
    if(!n){ try{ if(window.toast) toast('Değiştirilecek lamba bulunamadı.'); }catch(e){} return; }
    try{ if(window.saveProject) window.saveProject(); }catch(e){}
    try{ if(window.aybForceFullRender) window.aybForceFullRender(); else if(window.renderAll) window.renderAll(); }catch(e){}
    try{ if(window.toast) toast(dn+' direkteki '+n+' lamba "'+durum+'" yapıldı.'); }catch(e){}
  }
  window.aybLambaDurumuTopluAyar=function(){
    var sec='';
    try{ sec=window.prompt('Tüm lambaların durumu ne olsun?\n\n1 = YENİ\n2 = MEVCUT\n3 = SÖKÜLECEK\n\n(numara yazıp Tamam)','1'); }catch(e){ sec='1'; }
    if(sec==null) return;
    sec=String(sec).trim();
    var durum = (sec==='2') ? 'MEVCUT' : (sec==='3' ? 'SÖKÜLECEK' : 'YENİ');
    uygula(durum, true);
  };
  function btn(){
    if(d.getElementById('aybLambaDurBtn')) return true;
    var a=d.getElementById('aybYenileBtn')||d.getElementById('aybKmzFotoBtn')||d.getElementById('aybTbBtn')||d.getElementById('btnCadTop');
    if(!a||!a.parentNode) return false;
    var b=d.createElement('button'); b.id='aybLambaDurBtn'; b.type='button'; b.className=a.className;
    b.title='Lamba Durumu - tüm lambaları tek seferde YENİ / MEVCUT / SÖKÜLECEK yap';
    b.innerHTML='<div class="ayb-pro-ico" style="color:#eab308;">💡</div><small>Lamba Durumu</small>';
    b.addEventListener('click', function(e){ try{e.preventDefault();e.stopPropagation();}catch(_){} window.aybLambaDurumuTopluAyar(); });
    a.parentNode.insertBefore(b, a.nextSibling);
    return true;
  }
  var t=0, iv=setInterval(function(){ if(btn()|| ++t>80) clearInterval(iv); }, 700);
})();

/* ===================== SÜRÜM ROZETİ (Bayram YARAŞ) =====================
   Hangi sürümün çalıştığını anlamak için: ekranın sol alt köşesinde küçük
   "PERF-24.07" yazısı görünür. Bu yazı YOKSA eski sürüm çalışıyor demektir. */
(function(){
  try{
    function ekle(){
      try{
        if(document.getElementById('aybPerfBadge')) return;
        var b=document.createElement('div');
        b.id='aybPerfBadge'; b.textContent='PERF-24.07-M';
        b.style.cssText='position:fixed;left:4px;bottom:4px;z-index:2147483000;font:700 10px system-ui;color:#fff;background:rgba(15,23,42,.55);padding:2px 6px;border-radius:6px;pointer-events:none;';
        document.body.appendChild(b);
      }catch(e){}
    }
    if(document.body) ekle(); else document.addEventListener('DOMContentLoaded', ekle);
    setTimeout(ekle, 3000);
  }catch(e){}
})();
