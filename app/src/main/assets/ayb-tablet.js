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
  ready(function(){ try{ if(!document.getElementById('ayb-kmz-loader')){ var k=document.createElement('script'); k.id='ayb-kmz-loader'; k.src='ayb-kmz.js';
    /* İSTEK (Bayram YARAŞ): KMZ sembolleri HARİTA/DXF ile BİREBİR (B_CAD). Eski APK'daki
       ayb-kmz.js yüklense bile tabletteki güncel B_CAD sembollü dışa aktarım geçerli kalır. */
    k.onload=function(){ try{ if(window.__aybKmzTabletFn) window.aybExportKmzSym=window.__aybKmzTabletFn; }catch(e){} };
    document.body.appendChild(k); } }catch(e){} });

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
      h.textContent=title||'BY EDŞ Saha';
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
    fin.style.display='none';   /* İSTEK (Bayram YARAŞ): sağ altta Bitir İSTENMİYOR — Bitir, Çizim Araçları şeridinde ve üst mod çubuğunda zaten var */
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


  /* ---------- BASLIK YANINA BY EDS LOGOSU (Bayram YARAŞ) ---------- */
  (function(){
    if(window.__aybHeaderLogo) return; window.__aybHeaderLogo=true;
    var LOGO='data:image/png;base64,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'; /* İSTEK (Bayram YARAŞ): BY EDŞ PRO logo */
    function setLogo(){ var el=document.querySelector('.titlebar .logo'); if(!el) return false;
      if(el.querySelector('img.ayb-by-logo')) return true;
      el.innerHTML='<img class="ayb-by-logo" src="'+LOGO+'" alt="BY EDŞ" style="width:26px;height:26px;border-radius:6px;display:block;object-fit:contain;background:#fff;padding:1px">';
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

/* ====== UST BASLIK: "BY EDŞ Saha Programı" ====== */
(function(){
  function setTitle(){
    try{
      var t=document.querySelector('.titlebar .title')||document.querySelector('.title');
      var ver=window.AYB_SURUM||'';
      var want='BY EDŞ Saha Programı'+(ver?(' '+ver):'')+'\u00A0\u00A0\u00A0Hazırlayan Bayram YARAŞ';
      if(t && t.textContent!==want){ t.textContent=want; }
      try{ var imza=document.getElementById('aybSahaImza'); if(imza) imza.style.display='none'; }catch(e){}
    }catch(e){}
    try{ if(document.title.indexOf('Pafta')===-1) document.title='BY EDŞ Saha Programı'; }catch(e){}
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
    /* ==== İSTEK (Bayram YARAŞ): KMZ/KML "TAM İÇE AL" ile BİREBİR geri alınsın ====
       Dışa verilen her yer imine ExtendedData (KATMAN/TIP/AD/ID/JSON) eklenir.
       Google Earth görünümünü değiştirmez; okuyucu bunları doğrudan nesneye çevirir. */
    var _XD_ATLA={fotolar:1,fotograflar:1,foto:1,_leaflet_id:1};
    window.aybXdPj=function(pr){
      try{
        var y={}, n=0;
        for(var k in (pr||{})){ if(!Object.prototype.hasOwnProperty.call(pr,k)) continue; if(_XD_ATLA[k]) continue;
          var v=pr[k]; if(v==null||v==='') continue; y[k]=v; n++; }
        return n?JSON.stringify(y):'';
      }catch(e){ return ''; }
    };
    window.aybXd=function(d){
      var s2='';
      try{
        for(var k in d){ if(!Object.prototype.hasOwnProperty.call(d,k)) continue;
          var v=d[k]; if(v==null||v==='') continue;
          s2+='<Data name="'+k+'"><value>'+aybXml(String(v))+'</value></Data>'; }
      }catch(e){}
      return s2?('<ExtendedData>'+s2+'</ExtendedData>'):'';
    };
    var _XD_KATO={direk:'DIREK',trafo:'TRAFO',box:'BOX',kofre:'KOFRE',abone:'ABONE',ekmuf:'EK_MUF',not:'NOT',lamba:'LAMBA',bina:'BINA'};
    var _XD_KATH={hat:'HAT_HAVAI',yeraltihat:'HAT_YERALTI',abonehat:'HAT_ABONE',kanal:'KANAL',cizgi:'CIZGI',ok:'OK',bina:'BINA'};
    window.aybXdKatObj=function(o){ return _XD_KATO[String((o&&o.type)||'').toLowerCase()]||'DIREK'; };
    window.aybXdKatHat=function(l){ return _XD_KATH[String((l&&l.kind)||'hat').toLowerCase()]||'HAT_HAVAI'; };
    window.aybXdNo=function(o){ try{ return getObjectNo(o)||''; }catch(e){ return ''; } };
    window.aybXdObj=function(o){ return window.aybXd({KATMAN:window.aybXdKatObj(o),TIP:window.aybXdKatObj(o),AD:window.aybXdNo(o),ID:o&&o.id,JSON:window.aybXdPj(o&&o.props)}); };
    window.aybXdHat=function(l,nm){ return window.aybXd({KATMAN:window.aybXdKatHat(l),TIP:window.aybXdKatHat(l),AD:nm||'',ID:l&&l.id,JSON:window.aybXdPj(l&&l.props)}); };
    window.aybXdLamba=function(o,label){
      var lj=''; try{ var a=(o&&o.props&&o.props.lambalar)||[]; for(var i=0;i<a.length;i++){ if(a[i]){ lj=JSON.stringify(a[i]); break; } } }catch(e){}
      return window.aybXd({KATMAN:'LAMBA',TIP:'LAMBA',AD:label||'',ID:(o&&o.id)?(o.id+'_LAMBA'):'',JSON:lj});
    };
    window.aybXdKanal=function(c){ return window.aybXd({KATMAN:'KANAL',TIP:'KANAL',AD:(c&&c.props&&(c.props.ad||c.props.kanal_tipi))||'Kanal',ID:c&&c.id,JSON:window.aybXdPj(c&&c.props)}); };
    window.aybXdAlan=function(a){ return window.aybXd({KATMAN:'ALAN',TIP:String((a&&a.kind)||'ALAN'),AD:(a&&a.props&&(a.props.ad||a.props.trafo_no))||'',ID:a&&a.id,JSON:window.aybXdPj(a&&a.props)}); };

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
          ${window.aybXdObj(o)}
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
          ${window.aybXdHat(l,nm)}
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
          ${window.aybXdLamba(o,label)}
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
          ${window.aybXdKanal(c)}
          <LineString><tessellate>1</tessellate><coordinates>${aybKmlCoords(pts)}</coordinates></LineString>
        </Placemark>`;
      }).join('\n');
    
      const freePlacemarks=(project.freeLines||[]).map(f=>{
        const pts=(f.points||[]).map(aybNormalizeLinePoint).filter(p=>Number.isFinite(p[0])&&Number.isFinite(p[1]));
        if(pts.length<2) return '';
        return `<Placemark><name>${aybXml(f.kind||'Çizgi')}</name><styleUrl>#ln_free</styleUrl>${window.aybXdHat(f,(f.props&&f.props.ad)||'')}<LineString><tessellate>1</tessellate><coordinates>${aybKmlCoords(pts)}</coordinates></LineString></Placemark>`;
      }).join('\n');
    
      const areaPlacemarks=(project.areas||[]).map(a=>{
        const pts=(a.points||[]).map(aybNormalizeLinePoint).filter(p=>Number.isFinite(p[0])&&Number.isFinite(p[1]));
        if(pts.length<3) return '';
        const closed=pts.concat([pts[0]]);
        return `<Placemark><name>${aybXml(a.kind||'Alan')}</name><styleUrl>#poly_area</styleUrl>${window.aybXdAlan(a)}<Polygon><outerBoundaryIs><LinearRing><coordinates>${aybKmlCoords(closed)}</coordinates></LinearRing></outerBoundaryIs></Polygon></Placemark>`;
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
    window.aybExportKmzSym=window.__aybKmzTabletFn=async function(){
      try{
        var project=window.project;
        if(!project){ (window.toast||window.alert)("Önce proje aç."); return; }
        if(typeof window.AYBSYMBOLS==="undefined"){ (window.aybModal||window.alert)("Sembol kütüphanesi yüklenmedi."); return; }
        try{ if(window.toast) toast("Sembollü KMZ hazırlanıyor..."); }catch(e){}
        function _safe(s){ return String(s==null?"":s).replace(/[^A-Za-z0-9_]/g,"_"); }
        function _u8(u){ try{ var i=String(u).indexOf(","); var bin=atob(String(u).slice(i+1)); var a=new Uint8Array(bin.length); for(var k=0;k<bin.length;k++)a[k]=bin.charCodeAt(k); return a; }catch(e){ return new Uint8Array(0); } }
        function _svgPng(svg,size){ return new Promise(function(res){ try{
          var s=String(svg||""); if(s.indexOf("<svg")>=0 && s.indexOf(" width=")===-1){ s=s.replace("<svg","<svg width=\""+size+"\" height=\""+size+"\""); }
          if(s.indexOf("xmlns=")===-1){ s=s.replace("<svg","<svg xmlns=\"http://www.w3.org/2000/svg\""); }
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
        /* İSTEK (Bayram YARAŞ): KMZ'de semboller HARİTA/DXF ile BİREBİR — B_CAD fontu glifi
           canvas ile PNG'ye çizilir. Durum glifi (M/Y/YA/I/B) aynen; SOKULEN = temel + KIRMIZI ÇARPI. */
        function _bcadInfo(o){ try{ return (typeof window.aybBcadChar==='function')?window.aybBcadChar(o):null; }catch(e){ return null; } }
        function _bcadKey(b){ if(b&&b.tkey) return 'bc_'+String(b.tkey).replace(/[^A-Za-z0-9_]/g,''); return 'bc_'+String(b.ch).charCodeAt(0)+'_'+String(b.renk||'').replace('#','')+(b.sokulen?'_X':''); }
        function _bcadPng(b,size){ try{
          var c=document.createElement('canvas'); c.width=size; c.height=size; var x=c.getContext('2d');
          var F=size*36/44, C=size/2;
          var OFS=(typeof AYB_BCAD_OFS!=='undefined')?AYB_BCAD_OFS:(window.AYB_BCAD_OFS||{});
          var of=OFS[b.ch]||[0.33,0.37];
          var px=C-of[0]*F, py=C+of[1]*F;
          x.font=F+'px BCAD'; x.textBaseline='alphabetic'; x.textAlign='left'; x.lineJoin='round'; x.lineCap='round';
          x.lineWidth=size*1.8/44; x.strokeStyle='#000'; x.strokeText(b.ch,px,py);
          x.fillStyle=b.renk||'#ffffff'; x.fillText(b.ch,px,py);
          if(b.sokulen){
            var m=size*11/44, n=size-m;
            x.lineWidth=size*4.4/44; x.strokeStyle='#000';
            x.beginPath(); x.moveTo(m,m); x.lineTo(n,n); x.moveTo(n,m); x.lineTo(m,n); x.stroke();
            x.lineWidth=size*2.5/44; x.strokeStyle='#ff3131';
            x.beginPath(); x.moveTo(m,m); x.lineTo(n,n); x.moveTo(n,m); x.lineTo(m,n); x.stroke();
          }
          return c.toDataURL('image/png');
        }catch(e){ return null; } }
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
        try{ if(document.fonts&&document.fonts.load){ await document.fonts.load('36px BCAD'); } }catch(e){}
        var bcadStyle={};
        for(var bi=0;bi<objects.length;bi++){
          var bo=objects[bi], bb=_bcadInfo(bo); if(!bb) continue;
          var bk=_bcadKey(bb); if(bcadStyle[bk]) continue;
          var bp=bb.tsvg?await _svgPng(bb.tsvg,96):_bcadPng(bb,96); if(!bp) continue;
          var bfn="files/"+bk+".png"; files.push({name:bfn,bytes:_u8(bp)});
          styleXml+='<Style id="'+bk+'"><IconStyle><scale>'+(bb.tsvg?0.9:0.7)+'</scale><Icon><href>'+bfn+'</href></Icon></IconStyle><LabelStyle><scale>0.7</scale></LabelStyle></Style>\n';
          bcadStyle[bk]=true;
        }
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
        function _lampTip(o){ try{ var dd=(o.props&&o.props.durum)?String(o.props.durum).toLocaleUpperCase('tr'):""; if(dd==="MEVCUT") return "mevcut"; if(dd.indexOf("DM+MON")>=0||dd.indexOf("BYSK")>=0||dd.indexOf("TADILAT")>=0||dd.indexOf("TADİLAT")>=0) return "yeni"; if(dd==="DM"||dd.indexOf("SÖK")>=0||dd.indexOf("SOK")>=0) return "sokulen"; return "yeni"; }catch(e){ return "yeni"; } }
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
          var b2=_bcadInfo(o); var bk2=b2?_bcadKey(b2):null;
          var sid2=_symId(o);
          var su=(bk2&&bcadStyle[bk2])?("<styleUrl>#"+bk2+"</styleUrl>"):((sid2&&styleMap[sid2])?("<styleUrl>#"+styleMap[sid2]+"</styleUrl>"):"");
          var base=""; try{ base=(typeof aybObjectDescription==="function")?aybObjectDescription(o):""; }catch(e){}
          var inner=String(base).replace(/^\s*<!\[CDATA\[/,"").replace(/\]\]>\s*$/,"");
          var items=await _pget(o.id);
          if(items&&items.length){
            inner+='<div style="margin-top:8px"><b>Foto&#287;raflar ('+items.length+')</b><br>';
            for(var p=0;p<items.length;p++){ var ff="files/foto_"+_safe(o.id)+"_"+p+".jpg"; files.push({name:ff,bytes:_u8(items[p])}); inner+='<img src="'+ff+'" width="260" style="margin:4px 0;border:1px solid #bbb;border-radius:4px"/><br>'; }
            inner+='</div>';
          }
          objPm+='<Placemark><name>'+aybXml(_label(o))+'</name>'+su+'<description><![CDATA['+inner+']]></description>'
            +window.aybXdObj(o)
            +'<Point><coordinates>'+Number(o.lng).toFixed(8)+','+Number(o.lat).toFixed(8)+',0</coordinates></Point></Placemark>\n';
        }
        /* İSTEK (Bayram YARAŞ): KMZ hat renkleri de lejantla BİREBİR (haritadaki aybLineVisualStyle). */
        var lnv={};
        function _lnvId(l){ try{ if(typeof window.aybLineVisualStyle!=='function') return null; var vs=window.aybLineVisualStyle(l); var id='lv_'+String(vs.color||'#1f7f00').replace('#','')+'_'+(vs.weight||3); if(!lnv[id]) lnv[id]='<Style id="'+id+'"><LineStyle><color>'+aybKmlColor(vs.color||'#1f7f00')+'</color><width>'+(vs.weight||3)+'</width></LineStyle></Style>'; return id; }catch(e){ return null; } }
        var linePm=(project.lines||[]).map(function(l){
          var a=objects.find(function(o){return o.id===l.start;}), b=objects.find(function(o){return o.id===l.end;});
          var pts; if(a&&b){ pts=aybLinePathPoints(l,a,b); }
          if((!pts||pts.length<2)&&Array.isArray(l.points)&&l.points.length>=2){ pts=l.points.map(aybNormalizeLinePoint).filter(function(p){return isFinite(p[0])&&isFinite(p[1]);}); }
          if((!pts||pts.length<2)&&a&&b){ pts=[[Number(a.lat),Number(a.lng)],[Number(b.lat),Number(b.lng)]]; }
          if(!pts||pts.length<2) return "";
          var nm=(a&&b)?((lineLabels[l.kind]||"Hat")+" "+getObjectNo(a)+" - "+getObjectNo(b)):(lineLabels[l.kind]||"Hat");
          return '<Placemark><name>'+aybXml(nm)+'</name><styleUrl>#'+(_lnvId(l)||aybLineStyleId(l))+'</styleUrl><description>'+((a&&b)?aybLineDescription(l,a,b,pts):"")+'</description>'+window.aybXdHat(l,nm)+'<LineString><tessellate>1</tessellate><coordinates>'+aybKmlCoords(pts)+'</coordinates></LineString></Placemark>';
        }).join("\n");
        styleXml+=Object.keys(lnv).map(function(k){ return lnv[k]; }).join('');
        var lampPm=(project.objects||[]).filter(window.aybKmlPoleHasLamp).map(function(o){
          var label=window.aybKmlLampLabel(o)||"Lamba"; var dLat=0.000032;
          var _t=_lampTip(o); var _su=_lampStyle[_t]?("#lamp_"+_t):"#st_lamba";
          /* İSTEK (Bayram YARAŞ): KMZ lamba ikonu da LEJANT B_CAD glifi (C/h, X/r, q/z, Z) */
          try{
            if(localStorage.getItem('ayb_bpro_sembol')!=='0'){
              var _ls=(o.props&&o.props.lambalar)||[], _l0=null;
              for(var _i=0;_i<_ls.length;_i++){ if(_ls[_i]){ _l0=_ls[_i]; break; } }
              var _cn=String((_l0&&(_l0.cins||_l0.armatur))||'').toLocaleUpperCase('tr');
              var _yeni=(_t==='yeni');
              var _ch=(_cn.indexOf('SODYUM')>=0)?(_yeni?'C':'h'):((_cn.indexOf('CIVA')>=0||_cn.indexOf('CİVA')>=0)?(_yeni?'X':'r'):((_cn.indexOf('FLOR')>=0)?'Z':(_yeni?'q':'z')));
              var _rk=_yeni?'#00ffff':'#ffbf00';
              var _key='lb_'+_ch.charCodeAt(0)+'_'+_rk.replace('#','')+(_t==='sokulen'?'_X':'');
              if(!bcadStyle[_key]){
                var _pp=_bcadPng({ch:_ch,renk:_rk,sokulen:(_t==='sokulen')},64);
                if(_pp){ var _fn='files/'+_key+'.png'; files.push({name:_fn,bytes:_u8(_pp)});
                  styleXml+='<Style id="'+_key+'"><IconStyle><scale>0.5</scale><Icon><href>'+_fn+'</href></Icon></IconStyle><LabelStyle><scale>0.7</scale></LabelStyle></Style>';
                  bcadStyle[_key]=true; }
              }
              if(bcadStyle[_key]) _su='#'+_key;
            }
          }catch(e){}
          return '<Placemark><name>'+aybXml(label)+'</name><styleUrl>'+_su+'</styleUrl><description><![CDATA[Direk '+aybHtml(getObjectNo(o))+' lambasi: '+aybHtml(label)+']]></description>'+window.aybXdLamba(o,label)+'<Point><coordinates>'+Number(o.lng).toFixed(8)+','+(Number(o.lat)+dLat).toFixed(8)+',0</coordinates></Point></Placemark>';
        }).join("\n");
        var chanPm=(project.channels||[]).map(function(c){ var pts=(c.points||[]).map(aybNormalizeLinePoint).filter(function(p){return isFinite(p[0])&&isFinite(p[1]);}); if(pts.length<2) return ""; return '<Placemark><name>'+aybXml("Kanal "+aybKanalFullNameFromProps(c.props))+'</name><styleUrl>#ln_kanal</styleUrl><description>'+aybChannelDescription(c,pts)+'</description>'+window.aybXdKanal(c)+'<LineString><tessellate>1</tessellate><coordinates>'+aybKmlCoords(pts)+'</coordinates></LineString></Placemark>'; }).join("\n");
        var freePm=(project.freeLines||[]).map(function(f){ var pts=(f.points||[]).map(aybNormalizeLinePoint).filter(function(p){return isFinite(p[0])&&isFinite(p[1]);}); if(pts.length<2) return ""; return '<Placemark><name>'+aybXml(f.kind||"Çizgi")+'</name><styleUrl>#ln_free</styleUrl>'+window.aybXdHat(f,(f.props&&f.props.ad)||'')+'<LineString><tessellate>1</tessellate><coordinates>'+aybKmlCoords(pts)+'</coordinates></LineString></Placemark>'; }).join("\n");
        var areaPm=(project.areas||[]).map(function(a){ var pts=(a.points||[]).map(aybNormalizeLinePoint).filter(function(p){return isFinite(p[0])&&isFinite(p[1]);}); if(pts.length<3) return ""; var closed=pts.concat([pts[0]]); return '<Placemark><name>'+aybXml(a.kind||"Alan")+'</name><styleUrl>#poly_area</styleUrl>'+window.aybXdAlan(a)+'<Polygon><outerBoundaryIs><LinearRing><coordinates>'+aybKmlCoords(closed)+'</coordinates></LinearRing></outerBoundaryIs></Polygon></Placemark>'; }).join("\n");
        var kml='<?xml version="1.0" encoding="UTF-8"?>\n<kml xmlns="http://www.opengis.net/kml/2.2"><Document>'
          +'<name>'+aybXml(project.name||"AYB Saha Projesi")+'</name>'
          +'<description>BY EDS Saha Programi - program sembolleri ve saha fotograflari gomulu.</description>'
          +styleXml
          +'<Folder><name>Objeler</name>'+objPm+'</Folder>'
          +'<Folder><name>Hatlar</name>'+linePm+'</Folder>'
          +'<Folder><name>Lambalar</name>'+lampPm+'</Folder>'
          +'<Folder><name>Kanallar</name>'+chanPm+'</Folder>'
          +'<Folder><name>Cizimler</name>'+freePm+areaPm+'</Folder>'
          +'</Document></kml>';
        files.unshift({name:"doc.kml", bytes:new TextEncoder().encode(kml)});
        var blob=_kmz(files);
        var nm=((window.aybFileTag?window.aybFileTag():((project.name)||"BY_EDS_Saha"))+"_sembollu.kmz");
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
/* BY EDŞ — KAPSAMLI TRAFO BAZLI + GENEL METRAJ (lamba güce göre sayılı) */
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

  window.exportBYMetraj = function(){
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
    var fname=(window.aybFileTag?window.aybFileTag():(S(project.name)||"BY_EDS_Saha"))+"_metraj.xlsx";
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
      window.exportProfessionalMetraj = window.exportBYMetraj;
      if(!window.__aybMetrajBound){
        window.__aybMetrajBound=true;
        document.addEventListener("click", function(ev){
          var t=ev.target;
          while(t && t!==document){
            if(t.id==="btnExcel"){
              try{ ev.preventDefault(); ev.stopPropagation(); if(ev.stopImmediatePropagation) ev.stopImmediatePropagation(); }catch(e){}
              window.exportBYMetraj();
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
/* BY EDŞ — ALT ÇUBUK + GPS KONUM (küçük, altta, haritayı kapatmaz)     */
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
/* BY EDŞ — MİF (MapInfo) İÇE AKTARMA: proje gibi çizili + düzenlenebilir */
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
      var iAd =colIndex(C,["LambaSayisi","LambaCount1","LambaSayisi1","LambaAdet1","LambaCount"]);
      var iLCins=colIndex(C,["LambaTipi1","LambaTipi","LambaCinsi"]);
      var iLDur=colIndex(C,["LambaDurumu","LambaDurum","Lamba_Durum"]);
      var iTr =colIndex(C,["BagliTrafoNo","TrafoNo","Bagli_Trafo"]);
      dm.features.forEach(function(ft,idx){
        if(ft.geom!=="point") return;
        var row=dd[idx]||[];
        var ll=tmToLatLon(ft.coords[0][0], ft.coords[0][1], cm);
        var lambalar=[];
        var g=iGuc>=0?num(row[iGuc]):0, ad=iAd>=0?num(row[iAd]):0;
        if(g>0 && ad>0){
          var lcins=iLCins>=0?String(row[iLCins]||"LED"):"LED";
          var ldur=iLDur>=0?String(row[iLDur]||"").trim().toLocaleUpperCase("tr-TR"):"";
          if(ldur.indexOf("MEVCUT")>=0) ldur="MEVCUT"; else if(ldur) ldur="YENİ";
          lambalar.push({guc:String(g),adet:ad,cins:(lcins||"LED"),armatur:"",durum:(ldur||"MEVCUT"),status:(ldur||"MEVCUT")});
        }
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
        var builtJ={objects:objs, lines:lns, count:cnt, fromJson:true,
          channels:Array.isArray(kok.channels)?kok.channels:[],
          freeLines:Array.isArray(kok.freeLines)?kok.freeLines:[],
          areas:Array.isArray(kok.areas)?kok.areas:[]};
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
    /* İSTEK (Bayram YARAŞ): paket zip ama içinde aybproje.json YOK = paketi atan tablet ESKİ sürüm.
       Veri MİF katmanlarından (eksik detayla) alınır ve kullanıcı net uyarılır. */
    if(map.__zipti && !map.pjson){
      try{ (window.aybModal||alert)("DİKKAT: Bu paket ESKİ tablet sürümünden geliyor (içinde aybproje.json tam veri dosyası YOK).\nVeri MİF katmanlarından alınacak; lamba detayları ve bazı bilgiler EKSİK olabilir.\nO tabletin programını (APK) güncelle — yeni sürüm paketleri tam veriyle gelir.","Eski Paket Uyarısı"); }catch(e){}
    }
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
      /* İSTEK (Bayram YARAŞ): JSON tam veride kanal / serbest çizim / alanlar da birleşir (id'ye göre güncel kazanır) */
      function _mrgList(dst, src){ dst=Array.isArray(dst)?dst:[]; src=Array.isArray(src)?src:[]; var by={}; dst.forEach(function(x){ if(x&&x.id) by[x.id]=x; }); src.forEach(function(x){ if(!x) return; if(x.id&&by[x.id]){ try{ var h=by[x.id]; Object.keys(x).forEach(function(k){ h[k]=x[k]; }); }catch(_){} } else dst.push(x); }); return dst; }
      try{ p.channels=_mrgList(p.channels, built.channels); p.freeLines=_mrgList(p.freeLines, built.freeLines); p.areas=_mrgList(p.areas, built.areas); }catch(e){}
      try{ if(typeof saveProjects==="function") saveProjects(); }catch(e){}
      try{ if(typeof renderAll==="function") renderAll(); }catch(e){}
      /* İSTEK (Bayram YARAŞ): içeri veri alınınca ekran OTOMATİK gelen verinin bölgesine gider, sığdırır */
      try{ if(window.aybIceriSigdir) window.aybIceriSigdir(built); }catch(e){}
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
      map.__zipti=true;
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
/* BY EDŞ — SAHA TAKİP PANELİ (günlük plan + bugün/genel takılan lamba) */
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
/* BY EDŞ — SÜRÜM DAMGASI (yeni build aktif mi anında görünür)          */
/* ===================================================================== */
(function(){
  "use strict";
  var d=document;
  var SURUM="v111";
  var TARIH="16.07.2026";
  window.AYB_SURUM=SURUM;
  function make(){
    return; /* görünür rozet kaldırıldı; sürüm artık başlıkta "BY EDŞ Saha Programı v16" */
    if(d.getElementById("aybSurumBadge")) return;
    var b=d.createElement("div");
    b.id="aybSurumBadge";
    b.textContent="BY EDŞ "+SURUM;
    b.style.cssText="position:fixed;right:8px;top:132px;z-index:3000;background:rgba(15,118,110,.95);color:#fff;"+
      "padding:5px 10px;border-radius:8px;font-family:inherit;font-size:12px;font-weight:800;letter-spacing:.3px;"+
      "box-shadow:0 3px 10px rgba(0,0,0,.3);cursor:pointer;";
    b.onclick=function(){
      var mesaj="BY EDŞ Saha "+SURUM+" ("+TARIH+")\n\nBu sürümde olması gerekenler:\n"+
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
/* BY EDŞ — ZOOM'A GÖRE ETİKET AÇ/KAPAT (uzakken kapalı = tablet rahat) */
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
/* BY EDŞ — OFFLINE HIZ: karo yükünü azalt, başarısız karoyu boş geç    */
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
/* BY EDŞ — GÜNÜN ÖZETİ (Rapor/Veri altında; bugün takılan lamba OTO)   */
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

  /* Lamba "yeni mi"? MEVCUT ve SOKULEN ise HAYIR; YENI / TADILAT BYSK ise EVET */
  function isNewLamp(l, pole){
    var s=norm(l&&(l.durum||l.status));
    if(!s) s="YENI";
    if(s.indexOf("MEVCUT")>=0) return false;
    if(s==="DM"||s.indexOf("SÖK")>=0||s.indexOf("SOK")>=0||s.indexOf("DEMONT")>=0) return false;
    return true;
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
  /* İSTEK (Bayram YARAŞ): TRAFO BAZINDA döküm — hangi trafoda kaç direk, kaç adet hangi güçte lamba takıldı */
  /* KURAL (Bayram YARAŞ): Sayım SADECE HAT BAĞLANTISINA göre yapılır.
     Her trafo, kendisinden çıkan kollar/dallar (hatlar) ile ULAŞILAN direkleri sayar.
     Direk kartındaki trafo_no yazısı sayımda KULLANILMAZ — Oto No tüm projeye tek
     trafoyu damgalayabildiği için 312 direğin tamamı TR00'a yazılıyordu.
     Hatla hiçbir trafoya bağlı olmayan direkler "(trafo olmayan bölge)" olarak AYRI sayılır. */
  var BOLGESIZ="(trafo olmayan bölge)";
  function trafoAtama(){
    var p=proj(), out={atama:{},adlar:[]};
    if(!p||!p.objects) return out;
    var byId={}; p.objects.forEach(function(o){ if(o&&o.id) byId[o.id]=o; });
    var trafos=p.objects.filter(function(o){ return o&&o.type==='trafo'; });
    var tAd={}; trafos.forEach(function(t){ var no=(t.props&&(t.props.trafo_no||t.props.ad))||''; tAd[t.id]=String(no||'').trim()||'TR?'; });
    var adj={};
    (p.lines||[]).forEach(function(l){
      if(!l||!l.start||!l.end) return;
      (adj[l.start]=adj[l.start]||[]).push(l.end);
      (adj[l.end]=adj[l.end]||[]).push(l.start);
    });
    var sahip={}, q=[];
    trafos.forEach(function(t){ sahip[t.id]=t.id; q.push(t.id); });
    while(q.length){
      var cur=q.shift();
      (adj[cur]||[]).forEach(function(nx){
        if(sahip[nx]) return;
        var oo=byId[nx]; if(oo&&oo.type==='trafo') return;
        sahip[nx]=sahip[cur]; q.push(nx);
      });
    }
    var seen={};
    p.objects.forEach(function(o){
      if(!o||o.type!=='direk') return;
      var sid=sahip[o.id], tno=(sid&&tAd[sid])?tAd[sid]:BOLGESIZ;
      out.atama[o.id]=tno;
      if(!seen[tno]){ seen[tno]=1; out.adlar.push(tno); }
    });
    out.adlar.sort();
    return out;
  }
  function trafoBazinda(){
    var g={}, p=proj();
    if(!p||!p.objects) return g;
    var at=trafoAtama();
    p.objects.forEach(function(o){
      if(!o||o.type!=='direk') return;
      var tno=at.atama[o.id]||BOLGESIZ;
      var gg=g[tno]||(g[tno]={direk:0,watts:{},toplam:0});
      gg.direk++;
      var pw=poleNewWatts(o);
      Object.keys(pw).forEach(function(w){ gg.watts[w]=(gg.watts[w]||0)+pw[w]; gg.toplam+=pw[w]; });
    });
    return g;
  }
  /* Bölgeleri haritada renklendir: her trafonun SAYDIĞI direkler kendi renginde,
     trafosuz bölge GRİ. Yanlış bağlayan (köprü) hat varsa gözle bulunur. */
  var BOLGE_RENK=["#e11d48","#2563eb","#d97706","#7c3aed","#0d9488","#be185d","#65a30d","#0369a1"];
  var _bolgeLayer=null;
  function bolgeRenkMap(adlar){
    var m={}, ci=0;
    adlar.forEach(function(ad){ m[ad]=(ad===BOLGESIZ)?"#94a3b8":BOLGE_RENK[(ci++)%BOLGE_RENK.length]; });
    return m;
  }
  function bolgeKapat(){
    if(_bolgeLayer){ try{ var m=window.__aybMap||window.map; if(m) m.removeLayer(_bolgeLayer); }catch(e){} _bolgeLayer=null; }
    var b=d.getElementById("aybGunBolge"); if(b) b.textContent="🎨 Bölgeleri Haritada Göster";
  }
  function bolgeGoster(){
    try{
      var m=window.__aybMap||window.map, L=window.L, p=proj();
      if(!m||!L||!p||!p.objects) return;
      if(_bolgeLayer){ bolgeKapat(); return; }
      var at=trafoAtama(), renk=bolgeRenkMap(at.adlar);
      _bolgeLayer=L.layerGroup();
      p.objects.forEach(function(o){
        if(!o||o.type!=='direk') return;
        var ad=at.atama[o.id]; if(!ad) return;
        var la=+o.lat, ln=+o.lng; if(!isFinite(la)||!isFinite(ln)) return;
        L.circleMarker([la,ln],{radius:11,color:renk[ad]||"#94a3b8",weight:3,fill:true,fillColor:renk[ad]||"#94a3b8",fillOpacity:.25,interactive:false}).addTo(_bolgeLayer);
      });
      _bolgeLayer.addTo(m);
      var b=d.getElementById("aybGunBolge"); if(b) b.textContent="🎨 Renkleri Kaldır";
      hide();
      try{ (window.hint||function(){})("Bölgeler renklendirildi — kaldırmak için Günün Özeti → Renkleri Kaldır"); }catch(e){}
    }catch(e){}
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
        '<div style="margin-top:10px;font-size:13px;font-weight:800;color:#0f766e;">TRAFO BAZINDA — takılan lamba</div>'+
        '<div id="aybGunTrafo" style="max-height:180px;overflow:auto;font-size:12.5px;color:#0f172a;border:1px solid #e2e8f0;border-radius:10px;padding:8px;margin-top:6px;line-height:1.55;">(hesaplanıyor)</div>'+
        '<button id="aybGunBolge" style="width:100%;margin-top:8px;border:1px solid #0f766e;border-radius:10px;background:#f0fdfa;color:#0f766e;padding:9px;font-size:13px;font-weight:800;cursor:pointer;font-family:inherit;">🎨 Bölgeleri Haritada Göster</button>'+
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
    var bb=d.getElementById("aybGunBolge"); if(bb) bb.onclick=bolgeGoster;
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
    try{
      var g=trafoBazinda(), keys=Object.keys(g).sort(function(a,b){ if(a===BOLGESIZ) return 1; if(b===BOLGESIZ) return -1; return a<b?-1:(a>b?1:0); });
      var rmap=bolgeRenkMap(keys);
      var el=d.getElementById("aybGunTrafo");
      if(el){
        var html="";
        keys.forEach(function(t){
          var gg=g[t];
          var ws=Object.keys(gg.watts).sort(function(a,b){ return (parseFloat(a)||0)-(parseFloat(b)||0); });
          var parca=ws.map(function(w){ return gg.watts[w]+" ad "+w; }).join(", ");
          html+="<div style='border-bottom:1px dashed #e2e8f0;padding:3px 0;'><span style='display:inline-block;width:10px;height:10px;border-radius:50%;background:"+(rmap[t]||"#94a3b8")+";margin-right:6px;'></span><b>"+t+"</b> · "+gg.direk+" direk"+(parca?(" — "+parca):" — (takılan yok)")+"</div>";
        });
        var tw=projectNewByWatt();
        var tws=Object.keys(tw).sort(function(a,b){ return (parseFloat(a)||0)-(parseFloat(b)||0); });
        var tp=tws.map(function(w){ return tw[w]+" ad "+w; }).join(", ");
        html+="<div style='padding:6px 0 2px;font-weight:800;color:#065f46;'>TOPLAM · "+s.direk+" direk"+(tp?(" — "+tp):"")+"</div>";
        el.innerHTML=html||"(kayıt yok)";
      }
      var bb2=d.getElementById("aybGunBolge"); if(bb2) bb2.textContent=_bolgeLayer?"🎨 Renkleri Kaldır":"🎨 Bölgeleri Haritada Göster";
    }catch(e){}
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
      var s1=[["BY EDŞ — GÜNÜN ÖZETİ / GENEL","",""],
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

      /* SAYFA 5: TRAFO BAZINDA (direk + takılan lamba güç kırılımı) */
      var g5=trafoBazinda(), s5=[["TRAFO BAZINDA — DİREK VE TAKILAN LAMBA","","",""],
        ["Trafo","Direk Adedi","Güç (W)","Takılan Adet"]];
      Object.keys(g5).sort(function(a,b){ if(a===BOLGESIZ) return 1; if(b===BOLGESIZ) return -1; return a<b?-1:(a>b?1:0); }).forEach(function(t){
        var gg=g5[t];
        var ws=Object.keys(gg.watts).sort(function(a,b){ return (parseFloat(a)||0)-(parseFloat(b)||0); });
        if(!ws.length){ s5.push([t, gg.direk, "(takılan yok)", 0]); }
        else ws.forEach(function(w,i){ s5.push([t, i===0?gg.direk:"", w, gg.watts[w]]); });
        s5.push([t+" — TOPLAM","","",gg.toplam]);
      });
      var tw5=projectNewByWatt(), gt=0;
      Object.keys(tw5).sort(function(a,b){ return (parseFloat(a)||0)-(parseFloat(b)||0); }).forEach(function(w){ s5.push(["GENEL", "", w, tw5[w]]); gt+=tw5[w]; });
      s5.push(["GENEL TOPLAM", s.direk, "", gt]);
      var blob=window.aybBuildXlsx([
        {name:"Genel_Ozet", rows:s1},
        {name:"Bugun_Malzeme", rows:s2},
        {name:"Tarih_Tarih", rows:s3},
        {name:"Ekip_Performans", rows:s4},
        {name:"Trafo_Bazinda", rows:s5}
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
/* BY EDŞ — MİF DIŞA AKTAR (tüm katmanlar .mif/.mid, tek ZIP)           */
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

  var DIREK_COLS=['GenelTip Char(20)','AltCins Char(20)','TipAdi Char(20)','DirekNo Char(20)','Durumu Char(20)','MevcutDurum Integer','KorumaTopraklama Char(20)','IsletmeTopraklama Char(20)','Kafes Char(20)','Lente Char(20)','Durdurucu Char(20)','Potans Char(20)','Boy Integer','TopluYuk Integer','CosQ Decimal(5, 1)','Diversite Integer','LambaTipi1 Char(20)','LambaGucu1 Integer','LambaSayisi Integer','LambaDurumu Char(20)','BagliTrafoNo Char(20)'];
  var HAT_COLS=['Tip Integer','GenelTip Char(20)','OGTip Char(20)','AGTip Char(20)','Konsumasyon Integer','J1 Char(20)','J2 Char(20)','J12 Char(20)','J Decimal(5, 1)','JGerilimDusumu Decimal(5, 1)','HatKullanimTipi Integer','OGDurum Char(20)','AGDurum Char(20)','MesafeDeger Integer','TrafoCikisTip Char(20)','TrafoCikisMesafe Decimal(5, 1)','Uzunluk Integer','Color Integer','Diversite Integer','AnaRing Char(20)','IsiYuku Decimal(5, 1)','MaxIsiYuku Decimal(5, 1)','IsletmeVoltaji Char(20)','AnmaVoltaji Char(20)','BaslangicX Decimal(5, 1)','BaslangicY Decimal(5, 1)','BitisX Decimal(5, 1)','BitisY Decimal(5, 1)','KolAdi Char(3)'];

  /* ====== B PRO LAMBA EŞLEŞME (İSTEK: Bayram YARAŞ) ======
     B Pro, MIF'teki lamba cinsini kendi LAMBA tablosundaki AD ile birebir arar.
     Saha "LED + 51" yazınca B Pro'da LED yalnız 47/68/90/128/150W kayıtlı olduğundan
     eşleşmez, her direk LED 47W görünürdü. Çözüm: güç -> B Pro cins eşlemesi
     (51 -> LED-S14) ve MIF'e tam seri adının yazılması. Eşleme düzenlenebilir,
     Rapor/Veri -> 💡 B Pro Lamba. */
  var ESLKEY='ayb_bpro_lamba_eslesme_v1';
  var BPRO_CINSLER=['LED','LED-S3','LED-S10','LED-S11','LED-S12','LED-S13','LED-S14','LED-S15'];
  function eslesmeOku(){
    var m=null; try{ m=JSON.parse(localStorage.getItem(ESLKEY)||'null'); }catch(e){}
    if(!m||typeof m!=='object'||Array.isArray(m)) m={};
    if(!m['51']) m['51']='LED-S14';   /* Bayram YARAŞ: 51W = LED-S14 standart */
    return m;
  }
  function eslesmeYaz(m){ try{ localStorage.setItem(ESLKEY, JSON.stringify(m)); }catch(e){} }
  function lambaWattNo(l){ var w=l&&(l.guc||l.watt||l.w); w=(w==null)?'':String(w).replace(/[^0-9.]/g,''); var n=parseFloat(w); return (isFinite(n)&&n>0)?Math.round(n):0; }
  /* İSTEK (Bayram YARAŞ): MIF'e durum, B Pro veritabanı (GEN_DURUM_KOD) ORİJİNAL yazımıyla gider —
     eski DM -> SOKULEN, DM+MON -> TADILAT BYSK. B Pro içeri alırken birebir tanır. */
  function mifDurum(v){
    try{ if(typeof window.normalizeDurumValue==='function') return window.normalizeDurumValue(v); }catch(e){}
    var d=norm(v||''); if(!d) return 'YENI';
    if(d.indexOf('DM+MON')>=0||d.indexOf('BYSK')>=0||d.indexOf('TADILAT')>=0||d.indexOf('TADİLAT')>=0||d.indexOf('BASKA')>=0||d.indexOf('BAŞKA')>=0||d.indexOf('GELEN')>=0||d.split('DEMONTAJ').join('').indexOf('MONTAJ')>=0) return 'TADILAT BYSK';
    if(d==='DM'||d.indexOf('SOK')>=0||d.indexOf('SÖK')>=0||d.indexOf('DEMONT')>=0) return 'SOKULEN';
    if(d.indexOf('DIGER')>=0||d.indexOf('DİĞER')>=0) return 'DIGER';
    if(d.indexOf('MEVCUT')>=0) return 'MEVCUT';
    if(d.indexOf('YAKIN')>=0) return 'YAKIN';
    if(d.indexOf('ILER')>=0||d.indexOf('İLER')>=0) return 'ILERDE';
    return 'YENI';
  }
  function durumKod(v){ /* GEN_DURUM_KOD birebir: 1 MEVCUT, 2 YENI, 3 YAKIN, 4 ILERDE, 5 TADILAT BYSK, 7 SOKULEN, 8 DIGER */
    var a=mifDurum(v);
    return ({MEVCUT:1,YENI:2,YAKIN:3,ILERDE:4,'TADILAT BYSK':5,SOKULEN:7,DIGER:8})[a]||2;
  }
  function direkLambaOzet(pr){
    var arr=Array.isArray(pr&&pr.lambalar)?pr.lambalar:[];
    var toplam=0, sayim={}, dsay={}, gdur={};
    arr.forEach(function(l){
      var a=parseInt(l&&l.adet,10); a=(isFinite(a)&&a>0)?a:1;
      var w=lambaWattNo(l);
      /* İSTEK (Bayram YARAŞ): lamba durumu (MEVCUT/YENİ) MIF'e AYRI kolon gider.
         Durum girilmemişse YENİ sayılır (Günün Özeti ile aynı kural). */
      var du=mifDurum((l&&(l.durum||l.status))||'YENI');
      if(du==='SOKULEN') return; /* SOKULEN lamba MIF toplamına girmez — B Pro sayıyı doğru alsın */
      du=(du==='MEVCUT')?'MEVCUT':'YENI';
      toplam+=a; gdur[du]=(gdur[du]||0)+a;
      if(w>0){ sayim[w]=(sayim[w]||0)+a; (dsay[w]=dsay[w]||{})[du]=(dsay[w][du]||0)+a; }
    });
    var enW=0, enA=-1;
    Object.keys(sayim).forEach(function(w){ if(sayim[w]>enA){ enA=sayim[w]; enW=+w; } });
    var durum='', kaynak=(enW>0&&dsay[enW])?dsay[enW]:gdur, enD=-1;
    Object.keys(kaynak).forEach(function(k){ if(kaynak[k]>enD){ enD=kaynak[k]; durum=k; } });
    return {toplam:toplam, watt:enW, durum:durum};
  }
  function projeLambaWattlari(){
    var ws={}, p=window.project;
    if(p&&p.objects) p.objects.forEach(function(o){
      if(!o||o.type!=='direk'||!o.props||!Array.isArray(o.props.lambalar)) return;
      o.props.lambalar.forEach(function(l){ var w=lambaWattNo(l); if(w>0) ws[w]=1; });
    });
    return Object.keys(ws).map(Number).sort(function(a,b){return a-b;});
  }
  window.aybLambaEslesmePanel=function(devamFn){
    var eski=document.getElementById('aybEslPanel'); if(eski) eski.remove();
    var m=eslesmeOku(), watts=projeLambaWattlari();
    Object.keys(m).forEach(function(w){ if(watts.indexOf(+w)<0) watts.push(+w); });
    watts.sort(function(a,b){return a-b;});
    if(!watts.length) watts=[51];
    var el=document.createElement('div'); el.id='aybEslPanel';
    el.style.cssText='position:fixed;inset:0;z-index:6300;background:rgba(15,23,42,.55);display:flex;align-items:center;justify-content:center;padding:16px;';
    var rowsHtml=watts.map(function(w){
      return '<div style="display:flex;align-items:center;gap:10px;margin:6px 0;">'+
        '<div style="width:70px;font-weight:800;color:#0f172a;">'+w+' W</div>'+
        '<input data-esl-w="'+w+'" list="aybBproCinsList" value="'+(m[String(w)]||'')+'" placeholder="örn. LED-S14" style="flex:1;border:1px solid #cbd5e1;border-radius:8px;padding:9px;font-size:14px;font-family:inherit;">'+
      '</div>';
    }).join('');
    el.innerHTML='<div style="background:#fff;border-radius:16px;max-width:430px;width:100%;padding:18px;box-shadow:0 18px 50px rgba(0,0,0,.45);">'+
      '<div style="font-size:16px;font-weight:800;color:#0f766e;margin-bottom:6px;">💡 B Pro Lamba Eşleştirme</div>'+
      '<div style="font-size:12.5px;color:#475569;margin-bottom:10px;line-height:1.5;">MIF dışa verirken lamba cinsi bu tabloya göre yazılır. Cins adı, B Pro Lamba Seçimi listesindeki adın <b>BİREBİR AYNISI</b> olmalı (örn. 51 W → LED-S14). Bir kez kaydet, hep kullanılır.</div>'+
      '<datalist id="aybBproCinsList">'+BPRO_CINSLER.map(function(c){return '<option value="'+c+'">';}).join('')+'</datalist>'+
      rowsHtml+
      '<div style="display:flex;gap:8px;margin-top:14px;">'+
        '<button id="aybEslKaydet" style="flex:1;border:none;border-radius:10px;background:#16a34a;color:#fff;padding:11px;font-size:14px;font-weight:800;cursor:pointer;font-family:inherit;">Kaydet'+(devamFn?' ve Devam Et':'')+'</button>'+
        '<button id="aybEslKapat" style="flex:1;border:1px solid #cbd5e1;border-radius:10px;background:#fff;color:#475569;padding:11px;font-size:14px;font-weight:700;cursor:pointer;font-family:inherit;">Kapat</button>'+
      '</div></div>';
    document.body.appendChild(el);
    el.querySelector('#aybEslKapat').onclick=function(){ el.remove(); };
    el.querySelector('#aybEslKaydet').onclick=function(){
      var yeni=eslesmeOku();
      el.querySelectorAll('[data-esl-w]').forEach(function(inp){
        var w=inp.getAttribute('data-esl-w'), v=(inp.value||'').trim();
        if(v) yeni[w]=v; else delete yeni[w];
      });
      eslesmeYaz(yeni);
      el.remove();
      if(typeof devamFn==='function') devamFn();
      else try{ (window.hint||function(){})('B Pro lamba eşleşmesi kaydedildi'); }catch(e){}
    };
  };

  function buildDirekler(direks){
    var mif=header(DIREK_COLS), mid='';
    direks.forEach(function(o){
      var p=o.props||{}, t=tm(o.lat,o.lng);
      /* İSTEK (Bayram YARAŞ): B Pro lambayı otomatik algılasın —
         cins EŞLEMEDEN yazılır (51->LED-S14), güç SAYI olarak,
         LambaCount1 kolonuna direkteki TOPLAM lamba adedi yazılır. */
      var oz=direkLambaOzet(p), esl=eslesmeOku();
      var cins='', guc='0', say='0', lamDurum='';
      if(oz.toplam>0){
        say=String(oz.toplam);
        lamDurum=oz.durum||'YENI';
        if(oz.watt>0){ guc=String(oz.watt); cins=esl[String(oz.watt)]||'LED'; }
        else cins='LED';
      }
      mif+='Point '+t.e.toFixed(2)+' '+t.n.toFixed(2)+'\r\n    Symbol(34,255,6)\r\n';
      var row=[ p.genel_tip||'AG', p.alt_tip||p.alt_cins||'', p.direk_tipi||'', p.direk_no||(window.getObjectNo?getObjectNo(o):''),
        mifDurum(p.durum||'MEVCUT'), String(durumKod(p.durum||'MEVCUT')),'False','False','False','False','False','False','0','0','0.8','100',
        cins, guc, say, lamDurum, (p.trafo_no||'') ];
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
        String(p.trafo_guc||p.trafo_gucu||''), p.trafo_turu||'', mifDurum(p.durum||'MEVCUT'),
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
      mid+=[String(uz), mifDurum((c2.props&&c2.props.durum)||'MEVCUT')].map(q).join(',')+'\r\n';
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
        (mifDurum(p.durum||'MEVCUT')),(mifDurum(p.durum||'MEVCUT')),'0','','0', String(Math.round(l.length_m||0)),'0','100','False','0','0','0.4','0.4',
        s0.e.toFixed(2), s0.n.toFixed(2), s1.e.toFixed(2), s1.n.toFixed(2), 'D' ];
      mid+=row.map(q).join(',')+'\r\n';
    });
    return {mif:mif, mid:mid};
  }

  function doExport(){
    try{
      var p=window.project;
      if(!p||!p.objects){ (window.aybModal||alert)("Önce proje aç."); return; }
      /* İSTEK (Bayram YARAŞ): eşleşmemiş lamba gücü varsa önce eşleme penceresi açılır,
         kaydedince MIF otomatik devam eder. (Bir kez sorar; kapatıp tekrar basarsan
         eşlemesizler düz LED yazılır.) */
      try{
        var _esl=eslesmeOku();
        var _eksik=projeLambaWattlari().filter(function(w){ return !_esl[String(w)]; });
        if(_eksik.length && !doExport.__eslSoruldu){
          doExport.__eslSoruldu=true;
          window.aybLambaEslesmePanel(function(){ doExport(); });
          return;
        }
      }catch(e){}
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
      if(boxes.length){ var bb=buildNokta(boxes, BOX_COLS, function(o){var pr=o.props||{}; return [pr.box_no||(window.getObjectNo?getObjectNo(o):'')||'', pr.tipi||pr.box_tipi||pr.tip||'', mifDurum(pr.durum||'MEVCUT')];}, '34,16711935,7'); files.push({name:'Boxlar.mif',bytes:encWin(bb.mif)}); files.push({name:'Boxlar.mid',bytes:encWin(bb.mid)}); }
      if(kofres.length){ var kk=buildNokta(kofres, KOFRE_COLS, function(o){var pr=o.props||{}; return [pr.kofre_no||(window.getObjectNo?getObjectNo(o):'')||'', pr.tipi||pr.kofre_tipi||pr.tip||'', mifDurum(pr.durum||'MEVCUT')];}, '34,65535,7'); files.push({name:'Kofreler.mif',bytes:encWin(kk.mif)}); files.push({name:'Kofreler.mid',bytes:encWin(kk.mid)}); }
      if(abones.length){ var aa=buildNokta(abones, ABONE_COLS, function(o){var pr=o.props||{}; return [pr.abone_no||(window.getObjectNo?getObjectNo(o):'')||'', mifDurum(pr.durum||'MEVCUT')];}, '34,32768,6'); files.push({name:'Aboneler.mif',bytes:encWin(aa.mif)}); files.push({name:'Aboneler.mid',bytes:encWin(aa.mid)}); }
      if(ekmufs.length){ var ee=buildNokta(ekmufs, EKMUF_COLS, function(o){var pr=o.props||{}; return [pr.ekmuf_no||pr.muf_no||(window.getObjectNo?getObjectNo(o):'')||'', mifDurum(pr.durum||'MEVCUT')];}, '34,8421504,6'); files.push({name:'EkMufler.mif',bytes:encWin(ee.mif)}); files.push({name:'EkMufler.mid',bytes:encWin(ee.mid)}); }
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
      var nm=((window.aybFileTag?window.aybFileTag():(p.name||'BY_EDS'))+'_MIF.zip');
      if(window.aybShareFile) window.aybShareFile(nm, blob, 'application/zip');
      else if(typeof aybDownloadFile==='function') aybDownloadFile(nm, blob, 'application/zip');
      (window.aybModal||function(){})("MİF dışa aktarıldı: "+direks.length+" direk, "+trafos.length+" trafo, "+lines.length+" hat, "+boxes.length+" box, "+kofres.length+" kofre, "+abones.length+" abone, "+ekmufs.length+" ekmüf, "+kanallar.length+" kanal.\nDosya: "+nm,"MİF Dış");
    }catch(e){ (window.aybModal||alert)("MİF dışa hata: "+(e&&e.message?e.message:e)); }
  }

  window.aybExportMif=doExport;
  window.aybZipStore=buildZip;

  /* Rapor/Veri şeridine eşleme düğmesi */
  (function(){
    function inj(){
      if(document.getElementById('aybBproLambaBtn')) return true;
      /* İSTEK (Bayram YARAŞ): ayar işlemleri AYARLAR sekmesinde */
      var r=document.querySelector('.ayb-pro-group.fielddata .ayb-pro-row');
      if(!r) return false;
      var b=document.createElement('button');
      b.type='button'; b.id='aybBproLambaBtn'; b.className='ayb-pro-btn toolbtn';
      b.title='B Pro lamba cins eşleştirme (MIF dışa aktarımda kullanılır)';
      b.innerHTML='<div class="ayb-pro-ico" style="font-size:18px">💡</div><small>B Pro Lamba</small>';
      b.addEventListener('click', function(e){ e.preventDefault(); e.stopPropagation(); window.aybLambaEslesmePanel(); });
      r.appendChild(b);
      return true;
    }
    var n=0, iv=setInterval(function(){ if(inj()||++n>60) clearInterval(iv); }, 700);
  })();

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
/* BY EDŞ — METRAJ GARANTİ: butonu offline üreticiye kesin bağla        */
/* app'in kendi metrajı XLSX yok deyip hata veriyordu; artık bizimki çalışır */
/* ===================================================================== */
(function(){
  "use strict";
  var d=document;
  function runMetraj(){
    try{
      if(typeof window.exportBYMetraj==="function"){ window.exportBYMetraj(); return; }
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
/* BY EDŞ — GPS kartı + Lejant: BASILI TUT SÜRÜKLE, TEK DOKUN kenara gizle */
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
/* BY EDŞ — Ortadaki "GPS konum gösterildi / Hassasiyet" yazısını gizle  */
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
/* BY EDŞ — Ekip adı (açılış ekranı) + dosya adı etiketi (proje_ekip_tarih) */
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
/* BY EDŞ — GİRİŞ ŞİFRESİ + AYARLAR (kullanıcı/firma bilgileri)          */
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
        '<div style="font-size:20px;font-weight:800;color:#0f766e;margin-bottom:4px;">BY EDŞ Saha Programı</div>'+
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
        fld("aybSetFirma","Firma Adı",g(LS.firma),"Örn: BY EDŞ")+
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
  /* ===== AYNI NOKTAYA ÇİFT NOT KORUMASI (Bayram YARAŞ) =====
     Aynı dokunuştan gelen ikinci çağrı santimi santimine aynı koordinattadır.
     1,5 saniye içinde aynı noktaya ikinci not açılmaz. Maliyeti 3 sayı
     karşılaştırmasıdır; döngü/zamanlayıcı eklenmemiştir. */
  var _sonNotT=0, _sonNotY=null, _sonNotX=null;
  function placeAt(latlng){
    var arr=getNotes(); if(!arr){ (window.aybModal||alert)("Önce bir proje aç."); return; }
    var _t=Date.now();
    if(_t-_sonNotT<1500 && _sonNotY!==null && Math.abs(_sonNotY-latlng.lat)<1e-7 && Math.abs(_sonNotX-latlng.lng)<1e-7){
      try{ if(window.toast) toast("Aynı yere ikinci not atılmadı."); }catch(e){}
      return;
    }
    _sonNotT=_t; _sonNotY=latlng.lat; _sonNotX=latlng.lng;
    var n={ id:"note_"+Date.now()+"_"+Math.floor(Math.random()*1000), lat:latlng.lat, lng:latlng.lng, noteLat:latlng.lat, noteLng:latlng.lng, text:"" };
    arr.push(n); addMarker(n); save();
    setTimeout(function(){ try{ var tx=mkById[n.id].body.getElement().querySelector(".ayb-note-text"); tx.setAttribute("contenteditable","true"); tx.focus(); }catch(e){} },160);
  }
  /* ===== ÇİFT KANCA KORUMASI (Bayram YARAŞ) =====
     ESKİDEN: "Yap. Not" düğmesine her basışta AYRI bir bekleyen harita kancası
     kuruluyordu. Tablet yavaş olduğu için kullanıcı ikinci kez basıyor, sonra
     haritaya bir kez dokunduğunda bekleyen kancaların HEPSİ birden ateşleyip
     aynı noktaya 2-3 not atıyordu.
     ARTIK: yeni kanca kurulmadan önce bekleyen kanca sökülür. Kaç kez basılırsa
     basılsın TEK kanca kalır. Tek değişken kontrolüdür; program yavaşlamaz. */
  var _notKanca=null;
  function startPlace(){
    var map=M(); if(!map) return;
    if(!getNotes()){ (window.aybModal||alert)("Önce bir proje aç."); return; }
    try{ if(_notKanca) map.off("click", _notKanca); }catch(e){}
    _notKanca=function h(e){
      try{ map.off("click", h); }catch(_){}
      if(_notKanca===h) _notKanca=null;
      try{ map.getContainer().style.cursor=""; }catch(_){}
      placeAt(e.latlng);
    };
    try{ if(typeof window.setTool==="function") window.setTool(null); }catch(e){}
    try{ if(typeof window.hint==="function") window.hint("Yapışkan not için haritaya dokun."); }catch(e){}
    try{ map.getContainer().style.cursor="crosshair"; }catch(e){}
    map.on("click", _notKanca);
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
      ".leaflet-marker-pane .symbol{ transform: scale(var(--ayb-sym-scale,1)) !important; transform-origin: var(--ayb-sym-ox,30px) var(--ayb-sym-oy,20px) !important; }"+
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
      "@font-face{font-family:'AYB_BCad';font-display:swap;src:url(data:font/ttf;base64,AAEAAAALAIAAAwAwT1MvMkx46mwAAAE4AAAAVmNtYXBlsmg0AAACXAAAA25nYXNw//8AAQAAJFgAAAAIZ2x5ZnwU6fQAAAY0AAAW9GhlYWQLrN/6AAAAvAAAADZoaGVhD6cB4gAAAPQAAAAkaG10eCMsBNcAAAGQAAAAzGxvY2GgXqYiAAAFzAAAAGhtYXhwCG8AlgAAARgAAAAgbmFtZW5j66kAAB0oAAAFE3Bvc3TssMxzAAAiPAAAAhoAAQAAAAEAAFzymjBfDzz1ABsIAAAAAAC+7F64AAAAAOaGNNgAAP7PBwwImgAAAAwAAQAAAAAAAAABAAAImP7UAAAIAAAA+toHDAABAAAAAAAAAAAAAAAAAAAAMwABAAAAMwCAAAoAAAAAAAIAEAAUADkAAAfoAAAAAAAAAAEGhQGQAAUADgTOBM4AAAMWBM4EzgAAAxYAZAMgDAAFAgEJAQUHBwcHAAAAAAAAAAAAAAAAAAAAAE1TICAAQAAw8NMImP7UAM0ImAEsgAAAAAAAAAAAAAaKASoFDQAABQ0AAAUNAAAIAAAABOoAAAUUAAAFFAAABH4AAAR+AAAEfgAABwgAAAcIAAAHCAAABwgAAAcIAAAHCAAABwgAAAcIAAAHCAAABH4AAAR+AAAF3AAABdwAAAXcAAAF3AAABdwAAAVGAAAFRgAABUYAAAVGAAAFRgAABqQAAAfQAQQGpAAABqQAAAakAAAGpAAABqQAAAaFAAAH0ADEBwgAAAOEAAADhAAABqQAyAOEAAADhAAAA4QAAAAAADwFIAAABqQA4QAAAAIAAQAAAAAAFAADAAAAAAGGAAYBcgAAACAAtAAEAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAACAAMABQAGAAcAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAIAAkACgALAAwADQAOAAAAAAAPAAAAAAAQABEAEgATABQAFQAWABcAGAAZAAAAGgAAAAAAAAAAAAAAAAAAABsAAAAcAB0AHgAfAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAACAAMQABAAAAIQAAAAAAAAAAAAAAAAAAAAAAKAAEAegAAABKAEAABQAKACAAOQBaAGEAZgBoAG8AcgB6AIwAjwCbAJ0ApQCqAMgAygDT8CDwOfBa8GHwZvBo8G/wcvB68Izwj/Cb8J3wpfCq8MjwyvDT//8AAAAgADAAQQBhAGYAaABrAHEAegCGAI8AkgCdAKUApwDGAMoA0/Ag8DDwQfBh8GbwaPBr8HHwevCG8I/wkvCd8KXwp/DG8Mrw0////+QAAAAA/8b/zP/JAAD/kP+J/4L/gP9+/33/dv91AAD/V/9VD+QAAAAAD8YPzA/JAAAPkA+JD4IPgA9+D30Pdg91AAAPVw9VAAEAAABIAFoAAAAAAAAAhgAAAAAAAAAAAAAAAAAAAAAAfgAAAAAAAAB8AI4AAAAAAAAAugAAAAAAAAAAAAAAAAAAAAAAsgAAAAAAAAAmAB0AHgAfACAALAAiACMAJQAkAAwACQAHAA4AFgAPABAAEQAoABIAEwApAAsACgAbABwAFAAXAAIAAwAFAAYABwAGABkABQAqACsALQAuAC8AIAAxAAEAJgAdAB4AHwAgACwAIgAjACUAJAAMAAkABwAOABYADwAQABEAKAASABMAKQALAAoAGwAcABQAFwACAAMABQAGAAcABgAZAAUAKgArAC0ALgAvACAAMQABAAAAAAAeAJYA6AGiAaIB5gIuAmICfAKoA1YDdAOmA+IEEgTCBPgFFAUwBZIFwgXsBgoGPAZsBpoHOAdOB4AHngesB/gIKghECHYIlAjmCPQJCglQCY4JrgnSCewKFAo6CowKsAr0CzILegABASoAAAU9BZoACgAACQEXASEBFwURFwECEwLBaf47AYX8/tD+X2gCBwLZAsFp/jv8/WgBAaHQAggAAAAFAAAAdgUNBXgADwAfAC8APwBPAAABMgQSFRQCBCMiJAI1NBIkFyIOARUUHgEzMj4BNTQuAQEyHgEVFA4BIyIuATU0PgEhMh4BFRQOASMiLgE1ND4BITIeARUUDgEjIi4BNTQ+AQKGowE1r6r+y6in/suqrgE0pYL4jIn2h4b3iYz4/iMpTSwrTSoqTSsrTgGEKU0sK00qKk0rK04BhilNLCtNKipNKytOBXil/sunp/7PqakBMaenATWlj4P0hITxhobxhIT0g/63Kk4rK00rK00rK04qKk4rK00rK00rK04qKk4rK00rK00rK04qAAAFAAAAdgUNBXgADwAfACUAKwAxAAABMgQSFRQCBCMiJAI1NBIkFyIOARUUHgEzMj4BNTQuAQUBFSMBNyUzFQcjNQczFQcjNQKGowE1r6r+y6in/suqrgE0pYL4jIn2h4b3iYz4/psCGz795gECPEXnR4tH70kFeKX+y6en/s+pqQExp6cBNaWLg/SEhPGGhvGEhPSDuf3dPAIiPRdH30GJSutIAAgAAAB2BQ0FeAAPAB8ALwA/AE8AXwBvAH8AAAEyBBIVFAIEIyIkAjU0EiQXIg4BFRQeATMyPgE1NC4BATIeARUUDgEjIi4BNTQ+ARciDgEVFB4BMzI+ATU0LgElMh4BFRQOASMiLgE1ND4BFyIOARUUHgEzMj4BNTQuASUyHgEVFA4BIyIuATU0PgEXIg4BFRQeATMyPgE1NC4BAoajATWvqv7LqKf+y6quATSlgviMifaHhveJjPj+IylNLCtNKipNKytOKBowHBswGxoxGxwwAUIpTSwrTSoqTSsrTigaMBwbMBsaMRscMAFEKU0sK00qKk0rK04oGjAcGzAbGjEbHDAFeKX+y6en/s+pqQExp6cBNaWPg/SEhPGGhvGEhPSD/rcqTisrTSsrTSsrTio/GjEbGjAbGzAaGzEaPypOKytNKytNKytOKj8aMRsaMBsbMBobMRo/Kk4rK00rK00rK04qPxoxGxowGxswGhsxGgAAAAQAAAA+BOoFFwANABsAHwAjAAABEAAhIAARNBIkMzIEEgUUADMyADU0LgEjIg4BASERIQcjETME6v6Q/vr+/f6PqQEvnJ8BL6j7rAEYx8YBGYDneHnnfwKV/pQBbDj8/AKr/v7+lQFrAQKgASygoP7Wmcn+5QEbyX/nfX3n/aUDuzT8uQAAAAAFAAAAZAUUBXgABQALABEAFwAjAAABFjMyNwEFNjU0JwETJiMiBwElBhUUFwETIAAREAAhIAAREAABZYClpn/+2wGvWVn+25uApaJ9AR/+WmJaASOL/vL+hAF8AQ4BDgF8/oQBQFpaASSbgKWlgP7bAa5aVf7YpoStpYABJf12AXwBDgEOAXz+hP7y/vL+hAADAAAAZAUUBXgABQALABcAAAEWMzI3CQEmIyIHAREgABEQACEgABEQAAEztKWqvP6YAVKrpaG4AVf+8v6EAXwBDgEOAXz+hAGBma8BYAF1jIz+i/1tAXwBDgEOAXz+hP7y/vL+hAAAAAEAAAC5BH4FNwALAAARNAAzMgAVFAAjIgABUe7uAVH+r+7u/q8C+O4BUf6v7u7+rwFRAAACAAAAuQR+BTcACAAYAAABBgcGFRQXFhcVJicmNTQ3NjczMgAVFAAjAjapeXx8eanopamppegJ7gFR/q/uBKIDeXuvr3x4A50Dpanu7qimA/6v7u7+rwAABQAAALkEfgU3ABUALQBJAGUAegAAATMWHQEUIxQHBgcGBwYrASInNDc2NwEzFhUUBwYPAQYrASI9ATQ3Mxc2NzY3NgEyFxUHMhUWFxYXFh8BFRQjJiciJzQnJj0BNDclMxYXFhcUHwEVFAcGIwcjJjUiJyY1JzU0PwE2JTMyFxYVMhUGKwEiJzUnJicmPQE2AjAHO3FRpCQeJx0KDCMHbI9sAkoXJjoLeFRnWh86Oi8DritnFA/8YhwXCQkbJg47AWsIN0MVGEgbYSYCAC5FJTkpGQlWTh80HIIYNR8JSk0iAUkMOIhwCA8fDyQHHDqJJwYFNwskDzAGDENCF0IUMzJxdBT9BBUfLz4bXCsrKw8kCwQxKFMxHAETNi8KGXEuJzYKSxgPKxEhWQkYl5cXMQnQChghQAksNStPYjUJER1IMxE+ElhZNgz9mJmWMjIyG32dWBofCCsAAAAAAQAA/2AHCAZoAAsAABEQACEgABEQACEgAAIPAXUBdQIP/fH+i/6L/fEC5AF1Ag/98f6L/ov98QIPAAAAAgAA/2AHCAZoAAsAFwAAERAAISAAERAAISAAARQAMzIANTQAIyIAAg8BdQF1Ag/98f6L/ov98QFjAT/i4wFA/sDj4v7BAuQBdQIP/fH+i/6L/fECDwF14v7BAT/i4wFA/sAAAAIAAP9gBwgGaAAIABwAAAEEBwYREBcWBRUkAQAREAEAJTMgABEQACEiJyIHA3X++LzBwbwBCP6U/v/++AEIAQEBbA8BdQIP/fH+iwcGAQEFfga7wf7v/u3AvAb1BQECAQcBdQF1AQgBAQb98f6L/ov98QEBAAAAAAIAAP9gBwgGaAALABcAAAEUFjMyNjUuAQciBgUSACEgABEQACEgAAID4qCh4wHulaDi/f0DAg4BdAF1Ag798v6L/oz98gLkoeLioZztBeOYAWwCD/3x/ov+i/3xAg8AAAUAAP9gBwgGaAAVAC0ASQBlAHoAAAEzFh0BFCMUBwQHBgcGKwEiJzQ3NjcBMxYVFAcGDwEGKwEiPQE0NzMXJDc2NzYBMhcVBzIVFhcWFxYfARUUIyYnIic0JyY9ATQ3ATMWFxYXFB8BFRQHBiMHIyY1IicmNSc1ND8BNgEzMhcWFTIVBisBIic1JyYnJj0BNgNsDFuwfv7+OS4+LBATNgyp4agDlSU8WxK7hKKMMVpaSQUBEUKjHhn6ViskDQ0rOxVdAqgLVGohJXErlzwDIUlrOFtAJg+HeTBTK8onUzAOdHkzAgMSWdWwDBkwGDcLK1vZPAkGaBI3GEoKFGpkJWcfT06ytCD7Uh8wSmArkUJERBg3EQZMQIJNLAGuVUoRJbJIPVQQdiQYQxk1jA0k7uwlTQ4BQw4nMmUORFRDe5pTDxwucFAaYR2IjlIUAYzt8elPT08qw/eIKzANQgAAAAAEAAD/BgcIBzoABgAMAA8AGwAAESERBzMVIRsBESETEQElEQMnIQMzBxUhBzU3AwcIAQH4+McBBXcB/pH9WFYBA2EEAQH8owEBAQc6+VzIyAds/tT6iAFEBWD+igH8qANdRPwYJz0BPQEDywADAAD/BgcIBzoAAgAFAAsAAAEhERchERMhET0BIQX/+rlSBTHN+PgHCAZ/+cWeBkX5GweSSlgAAAIAAP8GBwkHOgACAAwAAAEFEQM9ASEDHQEhNScGS/peqQcJAfj5AQadAflLBqoLnvh0Cp6CCgAACgAA/wYHCAc6AAIACgAQABQAGgAeACIAJgAsADUAAAElEQE1FxEzER0BAyM1IREjExEjEQEzFSERMxkBIxEBIRcFAyEVKQETIxEhFRMnIREhBzU3EQTz/VkDLMjIyMgBkMjIyPqIyP5wyMgCxQGOAf5xDAGP/nH+DgHIAZBmAgNr/JUBAQT8Afyq/WDIAQFF/u0xyAdryP31/rn+cQGP++fIAg0C1P5xAY/758gBCDTI/rsCDcj+kET7tQE9AQPKAAAAAAIAAAC5BH4FNwALABsAABE0ADMyABUUACMiCAEOARUUHgEzMj4BNTQuASMBUe7uAVH+r+7u/q8CCmM4N2M2NmM3OGQ0AvjuAVH+r+7u/q8BUQG+NmQ2NmM3N2M2NmQ2AAIAAAC5BH4FNwALABcAABMUFjMyNjU0JiMiBgc0ADMyABUUACMiAObMkZDNzZCRzOYBUe7uAVH+r+7u/q8C8pDNzZCQzs6K7gFR/q/u7v6vAVEAAAEAAAAUBdwF8AALAAAREAAhIAAREAAhIAABtwE3ATcBt/5J/sn+yf5JAwIBNwG3/kn+yf7J/kkBtwAAAAIAAAAUBdwF8AALABcAAAEUADMyADU0ACMiAAUQACEgABEQACEgAAEnAQq9vQEL/vW9vf72/tkBtwE3ATcBt/5J/sn+yf5JAwK9/vYBCr29AQv+9b0BNwG3/kn+yf7J/kkBtwACAAAAFAXcBfAACAAYAAABBgcGFRQXFhcVJCcmERA3NiUzIAAREAAhAuLcnaGhndz+0dfc3NcBLwwBNwG3/kn+yQUtBJ2h5OShnQTNBNjbATcBN9zXBP5J/sn+yf5JAAACAAAAFAXcBfAACwAXAAABFBYzMjY1NCYjIgYFEAAhIAAREAAhIAABxa57fK6ufHuu/jsBtwE3ATcBt/5J/sn+yf5JAwJ7rq57fK6ufAE3Abf+Sf7J/sn+SQG3AAUAAAAUBdwF8AAVAC0ASQBeAG4AAAEzFh0BFCMUBwYHBgcGKwEiJzQ3NjcBMxYVFAcGDwEGKwEiPQE0NzMXNjc2NzYBMhcVBzIVFhcWFxYfARUUIyYnJic0JyY9ATQ3ATMyFxYVMhUGKwEiJzUnJicmPQE2ATIeARUUDgEjIi4BNTQ+AQLaCkyTadYwJjQlDRAtCo27jAL9HjJMD5xth3UpS0s9BeM3hxoU+0gkHgEBJCwXTQKLCkdVGyBgJH4yBAMQSbKSChQoFC8JJEyzMwj+5lajXVqjWVmjWlyjBfAPLhQ+CBBYVR5WGkJBlJca/BsbKD5QJHg4ODgULw4CPDVsQCUBZkY9DiCUPjFGDWIfFDghFxJsCx/GxR5ACwJMxsjDQUJCI6PNciMoCzf+x1mkWVmiW1uiWVmkWQACAAAAUAVGBZYAAwAHAAABIREhAREhEQGVAhz95P5rBUYB5QIc/E8FRvq6AAUAAABQBUYFlgAEAAkADAAPABMAAAE3IRcJAQchLwEBEQkBEQkBESERA7eN/L57ASf++ZkDQK3y/e0BtwJr/kz9AAVGBGSgjP7Y/kKwxvICEvyTAbb+TQNm/k39WwVG+roAAAADAAAAUAVGBZYAAgAFAAkAAAEhCQEhCQERIREEyvvIAhH97wQ3/dr9XQVGBRr92f3vAhH9XQVG+roAAAABAAAAUAVGBZYAAwAANREhEQVGUAVG+roAAAAACQAAAFAFRgWWAAUACQANABMAGwAfACUAKQAtAAABFSMVIxElMxUjETMVIwEjNSM1IREVITUzNTMRAxUjNQEzFSERMxEVIzUBESERAXbpjQI7ysrKygMFjekBdv6Q6Y0Gjfva4v6RjY0BUAKmBZGJ3QFmBYj7y4gD3eCI+sAGieH+nALvxMT9lIkBbQGIxMT+XQKn/VkAAAABAAAAZAakCDQAGQAAAQMjEyEDIxM3IREzESEHAyMTIQMjEyEDIxMCYq5Xrv77r1euLAJppwK6LK5Xrv77r1ev/vquWK8DXv0GAvr9BgL6vgQY++i+/QYC+v0GAvr9BgL6AAAAAQEEAWgGzAcwAAsAAAERIREhESERIREhEQNUASgCUP2w/tj9sATgAlD9sP7Y/bACUAEoAAUAAP+mBqQGSgAEAAkADAAPABMAAAE3IRcJAQchJwkBEQkBEQkBESERBK6y++SbAXT+tL8EF9r+z/1kAigDDP3b/DkGpATIyrD+jP3N3fkBMAKd+68CKP3bBEj93PysBqT5XAADAAD/pgakBkoAAgAFAAkAAAEhCQEhCQERIREGB/qxApr9ZgVN/U38rgakBa79Sv1mApr8rgak+VwAAAAJAAD/pgakBkoABwALAA8AFQAZACEAJwArAC8AABMhFSERIxEzExEhEQEVIzUTIRUhETMBFSM1ExUhNSERMxEDIxEhNSEBMxUjETMVI7EBJv7asbH2A1b7tLGxAR7+MbEF67Ky/jABJ7EIsv7bAdf8M/7+/v4GQ6z+6QHE+wsDWPyoAhD39/zzrAHLAe739/xPCKwBHf4/BNYBGqz6CKoGoqwAAAEAAP+mBqQGSgADAAAVESERBqRaBqT5XAAAAAACAAD/pgakBkoAAwAHAAABIREhAREhEQH+Aqj9WP4CBqQBpAKo+1oGpPlcAAIAAP7PBoUImgALACIAAAEgABEQACEgABEQACcEFxYREAAhIAAREDc2JREFIwExASMlA0H+2P5hAZ8BKAEnAaD+YuYBM9vz/hj+pP6o/hfz1wEr/uaWAf4B6pb+7QTZ/mH+2P7Z/mEBnwEnASgBn3gW3PX+pf6n/hkB5wFZAVv12RgBku0Cpf1b7gAAAQDEAY0HDAcLABkAAAkBFwEXARcBBwkBJwkBNwEXARcBFwEXARcBBCYB7zH+EZUB7zH+EXz+ov3gXwIh/nN8Ae8x/hKUAe8x/hKUAe8x/hEDkAEpMf7XlQEpMf7XSgFe/eBeAiEBjEoBKTH+15UBKTH+15UBKTH+1wAAAAMAAP8GBwgHOgACAAYADAAAASERCQEhEQEVIyERIQQwAkb8cgLX+tMGdgX4/QcIA0ACvP1EA2/8kfvSDAg0AAADAAAASwOEBZEAAwAHABMAAAEzESsCETMTIREhFSM1IREhNTMCM8bG4cbG4QFR/q/h/q4BUuEBiwLG/ToDKfx03d0DjN0AAAABAAAASwOEBZEACwAAASERIRcjJyERITUzAjMBUf6vAeEB/q4BUuEEtPx03d0DjN0AAAAABADI//0GpAg0AAcACwAPABMAABM1IREzESEVASEVIQEhFSEBMxUjyAJxsQK6/AMCOf3H/t4EiPt4Agt6egNSyAQa++jK/lFvAYhv/it7AAADAAAASwOEBZEAAwAHABMAAAERIxEjESMRASERIRUjNSERITUzAvnG4cYBpwFR/q/h/q4BUuEDDQFE/rwBRP68Aaf8dN3dA4zdAAAABgAAAEsDhAWRAAUACQAPACsAMQA7AAABIzUjNTMBNTMVAzUzFSMVJTMRIxUzFSMVIzUjNTM1IxEzNSM1MzUzFTMVIwEjNTMVMwERIzUzNTM1IzUDhItK1fx8jIzZTQGnZ2ceHuEcHGBgGxvhHh7+pdiMTAKs1UqLiwQETWP+FIaGAUCsY0kS/a49Y93dYz0CUjdj3d1j/NfmgwG//d5jhLqBAAADAAAASwOEBZEAAwAHABMAAAEzESsCETMTIREhFSM1IREhNTMB+2NjcWNjqQFR/q/h/q4BUuECPAFj/p0CePx03d0DjN0AAAAEADwAPgUmBRcADQAbAB8AIwAAARAAISAAETQSJDMyBBIFFAAzMgA1NC4BIyIOAQEhESEHIxEzBSb+kP76/v3+j6kBL5yfAS+o+6wBGMfGARmA53h5538Clf6UAWw4/PwCq/7+/pUBawECoAEsoKD+1pnJ/uUBG8l/53195/2lA7s0/LkAAAAAAwAAAF4FIAV+AAUACwAXAAABADc2CQIABwYJAQUCACUkABMSAAUEAAPIAR4EBP7d/rz+v/76BQQBIAEwApMG/nv+8v7y/o0GBgGFAQ4BDgFzARcBKKWqAUT+HAHK/umlof68AdcP/vL+jQYGAYUBDgEOAXMGBv57AAAAAAIA4QAwBioHvgAZACQAAAEDIxMjAyMTNyE3FzchBwMjEyMDIxMjAyMTEQEXASUBFwUDFwECw4pEic6KRYkjAecCgQECJyOJRYrOi0SKz4lGigHhfv7MAW799N/+d22ZAWEB8v4+AcL+PgHCcAECAXD+PgHC/j4Bwv4+AcIC1wL1K/4agfzGCIwBNXcCLQAAAAAAFAD2AAEAAAAAAAAAUQAAAAEAAAAAAAEABQAAAAEAAAAAAAIABwBRAAEAAAAAAAMAEgBYAAEAAAAAAAQABQAAAAEAAAAAAAUAMABqAAEAAAAAAAYABQAAAAEAAAAAAAcAJQCaAAEAAAAAAA0AagC/AAEAAAAAAA4ANgEpAAMAAAQJAAAAogFfAAMAAAQJAAEACgFfAAMAAAQJAAIADgIBAAMAAAQJAAMAJAIPAAMAAAQJAAQACgFfAAMAAAQJAAUAYAIzAAMAAAQJAAYACgFfAAMAAAQJAAcASgKTAAMAAAQJAA0A1ALdAAMAAAQJAA4AbAOxQl9DQURfT0JKRUxFUi4gQWxsIFJpZ2h0cyBSZXNlcnZlZC4gqSAyMDA1IEJNVUguTFREU1RJLCBJbmMuIEFsbCBSaWdodHMgUmVzZXJ2ZWQuUmVndWxhckJfQ0FEOlZlcnNpb24gMS4wMFZlcnNpb24gMS4wMCBTZXB0ZW1iZXIgMTEsIDIwMTUsIGluaXRpYWwgcmVsZWFzZUJfQ0FEIGlzIGEgdHJhZGVtYXJrIG9mIEJNVUggTFREIFNUSS5UaGlzIGZvbnQgaXMgbWFkZSB3aXRoIHRoZSBob21lIGVkaXRpb24gb2YgRm9udENyZWF0b3IuIFlvdSBtYXkgbm90IHVzZSB0aGlzIGZvbnQgZm9yIGNvbW1lcmNpYWwgcHVycG9zZXMuaHR0cDovL3d3dy5oaWdoLWxvZ2ljLmNvbS9mb250Y3JlYXRvci9mb250bGljZW5zZS5odG1sAEIAXwBDAEEARABfAE8AQgBKAEUATABFAFIALgAgAEEAbABsACAAUgBpAGcAaAB0AHMAIABSAGUAcwBlAHIAdgBlAGQALgAgAKkAIAAyADAAMAA1ACAAQgBNAFUASAAuAEwAVABEAFMAVABJACwAIABJAG4AYwAuACAAQQBsAGwAIABSAGkAZwBoAHQAcwAgAFIAZQBzAGUAcgB2AGUAZAAuAFIAZQBnAHUAbABhAHIAQgBfAEMAQQBEADoAVgBlAHIAcwBpAG8AbgAgADEALgAwADAAVgBlAHIAcwBpAG8AbgAgADEALgAwADAAIABTAGUAcAB0AGUAbQBiAGUAcgAgADEAMQAsACAAMgAwADEANQAsACAAaQBuAGkAdABpAGEAbAAgAHIAZQBsAGUAYQBzAGUAQgBfAEMAQQBEACAAaQBzACAAYQAgAHQAcgBhAGQAZQBtAGEAcgBrACAAbwBmACAAQgBNAFUASAAgAEwAVABEACAAUwBUAEkALgBUAGgAaQBzACAAZgBvAG4AdAAgAGkAcwAgAG0AYQBkAGUAIAB3AGkAdABoACAAdABoAGUAIABoAG8AbQBlACAAZQBkAGkAdABpAG8AbgAgAG8AZgAgAEYAbwBuAHQAQwByAGUAYQB0AG8AcgAuACAAWQBvAHUAIABtAGEAeQAgAG4AbwB0ACAAdQBzAGUAIAB0AGgAaQBzACAAZgBvAG4AdAAgAGYAbwByACAAYwBvAG0AbQBlAHIAYwBpAGEAbAAgAHAAdQByAHAAbwBzAGUAcwAuAGgAdAB0AHAAOgAvAC8AdwB3AHcALgBoAGkAZwBoAC0AbABvAGcAaQBjAC4AYwBvAG0ALwBmAG8AbgB0AGMAcgBlAGEAdABvAHIALwBmAG8AbgB0AGwAaQBjAGUAbgBzAGUALgBoAHQAbQBsAAACAAAAAAAA/zgAZAAAAAAAAAAAAAAAAAAAAAAAAAAAADMBAgEDAQQBBQADAQYBBwEIAQkBCgELAQwBDQEOAQ8BEAERARIBEwEUARUBFgEXARgBGQEaARsBHAEdAR4BHwEgASEBIgEjASQBJQEmAScBKAEpASoBKwEsAS0BLgEvATABMQEyAEkCXzAHTEVEWUVOSQdDSVZBTUVWBkxFRE1FVg1GTE9SQVNBTkxBTUJBEENJVkFCVUhBUkxJTEFNQkESU09EWVVNQlVIQVJMSUxBTUJBBVlfQVlEBUJfQVlEBUlfQVlEBFlfT0cETV9PRwRCX09HBVlBX09HBElfT0cGWUFfQk9YBU1fQk9YBVlfQk9YBUlfQk9YBllBX0FZRAVNX0FZRARZX0FHBE1fQUcEQl9BRwVZQV9BRwRJX0FHC1lBX0FHX0tBRkVTCk1fQUdfS0FGRVMKQl9BR19LQUZFUwpZX0FHX0tBRkVTCklfQUdfS0FGRVMKVE9QUkFLTEFNQQZjcm9zczUKTV9PR19LQUZFUwpCX09HX0tBRkVTCklfT0dfS0FGRVMKWV9PR19LQUZFUwtZQV9PR19LQUZFUwZBX0tPTFUCeDcFQl9CT1gHTV9LT0ZSRQdZX0tPRlJFEElTTF9UT1BSQUtMQU1BU0kHQl9LT0ZSRQdJX0tPRlJFCFlBX0tPRlJFA180NwlTT0RZVU1NRVYAAAAAAAH//wAA) format('truetype');}"+
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
  /* ===== HAT İMZASI (Bayram YARAŞ) — çizimin en pahalı kalemiydi =====
     Eskiden JSON.stringify'a bir değiştirici geri-çağrı veriliyordu; o geri-çağrı
     hattın HER anahtarı için ayrı çalışıyordu (39.000 hatta her çizimde 390.000
     JavaScript çağrısı). Ölçülen: 67 ms yerine 17 ms — yaklaşık 2,5 kat hızlı.
     length_m yine imzaya girmez: metraj yeniden hesaplandığında imza boşuna
     değişip gereksiz tam çizim tetiklemesin diye. Bunun için alan bir an için
     undefined yapılır (JSON.stringify undefined değerli anahtarı zaten yazmaz)
     ve finally ile hemen geri konur. Üretilen metin birebir aynıdır. */
  function lineSig(l){
    if(!l) return '';
    var u;
    try{ u=l.length_m; }catch(e){ u=undefined; }
    if(u===undefined){ try{ return JSON.stringify(l); }catch(e){ return String(l&&l.id); } }
    try{ l.length_m=undefined; return JSON.stringify(l); }
    catch(e){ return String(l&&l.id); }
    finally{ try{ l.length_m=u; }catch(e){} }
  }
  function kisa(k,v){ return (typeof v==='string' && v.length>400) ? ('#'+v.length) : v; }   /* base64 gibi dev metinleri imzada kullanma */
  function otherSig(){
    var p=window.project||{}, s='';
    try{ s=JSON.stringify(p.areas||[],kisa)+'#'+JSON.stringify(p.freeLines||[],kisa)+'#'+JSON.stringify(p.channels||[],kisa)+'#'+JSON.stringify(p.rasters||[],kisa); }
    catch(e){ s=((p.areas||[]).length)+'/'+((p.freeLines||[]).length)+'/'+((p.channels||[]).length)+'/'+((p.rasters||[]).length); }
    try{ s+='#'+JSON.stringify(p.aybImportLayers||[]); }catch(e){}
    try{ s+='#'+(window.aybCadSig?window.aybCadSig():''); }catch(e){}
    try{ s+='#'+(window.aybEnergyHoverMode?1:0); }catch(e){}
    /* EKRAN IMZASI (Bayram YARAS): gorunum cizili alanin disina cikinca imza degisir.
       Boylece artimli sarmalayici GERCEK bir gorunum degisikligini asla atlayamaz. */
    try{ s+='#'+(window.aybEkranImza?window.aybEkranImza():''); }catch(e){}
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
          try{ if(window.aybRefreshPoleLamps) window.aybRefreshPoleLamps(); }catch(e){}
          return;
        }catch(e){ /* sorun olursa tam çizime düş */ }
      }
      if(ok && addO===0 && addL===0){ prev={objs:os,lines:ls,ot:ot};
        /* DÜZELTME (Bayram YARAŞ): tam çizim atlansa bile LAMBA imzaları karşılaştırılır —
           direğe sonradan eklenen lamba, direğin durumu ne olursa olsun ANINDA görünür. */
        try{ if(window.aybRefreshPoleLamps) window.aybRefreshPoleLamps(); }catch(e){}
        return; }  /* hiçbir şey değişmedi */
    }
    if(busy) return;
    busy=true; prev=null;
    try{ origAll.apply(this,arguments); } finally { busy=false; }
    /* KANVAS SİGORTASI (Bayram YARAŞ): tam çizim sonrası çizgi kanvası bazı makinelerde
       boş kalabiliyordu (ekran oynatılınca geliyordu) — sonraki karede zorla tazelenir. */
    try{ setTimeout(function(){ try{ var mp=window.__aybMap||window.map; if(mp&&mp._renderer&&mp._renderer._update) mp._renderer._update(); }catch(e){} }, 60); }catch(e){}
    /* ===== HIZ (Bayram YARAŞ): imzalar ikinci kez hesaplanmaz =====
       Bu imzalar çizimden HEMEN ÖNCE zaten üretilmişti; eskiden aynı iş burada
       bir daha yapılıyordu (40.000 direkte çizim başına 79.000 gereksiz imza).
       Yalnızca GÖRÜNÜM imzası yeniden alınır — çizilen alan çizim sırasında
       değiştiği için eski değer kalırsa program her defasında tam çizime
       zorlanırdı. Sayı değişmişse (beklenmedik durum) eski yol aynen işler.
       Çizim bir şeyi değiştirdiyse elde kalan imza ESKİ olur; o zaman bir
       sonraki çizim farkı görüp tam çizim yapar — yani sapma her zaman
       "fazladan çizim" yönündedir, hiçbir değişiklik ekranda eksik kalmaz. */
    try{
      var ov2=visObjs(), lv2=visLines();
      prev = (ov2.length===os.length && lv2.length===ls.length)
           ? {objs:os, lines:ls, ot:otherSig()}
           : {objs:ov2.map(objSig), lines:lv2.map(lineSig), ot:otherSig()};
    }catch(e){ prev=null; }
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
  window.aybForceFullRender=function(){ prev=null; try{ if(origAll) origAll(); }catch(e){} try{ setTimeout(function(){ try{ var mp=window.__aybMap||window.map; if(mp&&mp._renderer&&mp._renderer._update) mp._renderer._update(); }catch(e){} }, 60); }catch(e){} };
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
    var fid={}, aid={}, cid={}, n=0;
    (p.freeLines||[]).forEach(function(l){ if(l&&l.id!=null) fid[l.id]=1; });
    (p.areas||[]).forEach(function(l){ if(l&&l.id!=null) aid[l.id]=1; });
    (p.channels||[]).forEach(function(l){ if(l&&l.id!=null) cid[l.id]=1; });
    /* ===== HIZ (Bayram YARAŞ): büyük dizilerde sözlük kurulmaz =====
       Eskiden her çizimde projedeki BÜTÜN objelerin ve hatların kimliğinden
       sıfırdan sözlük kuruluyordu (40.000 direkte 79.000 gereksiz yazım,
       ölçülen 139 ms). Süpürge yalnızca EKRANA ÇİZİLMİŞ katmanları sorar;
       görünüm kırpması sayesinde bunlar yüzler mertebesindedir. Programın
       zaten hazır tuttuğu kimlik haritalarına doğrudan sorulur — sonuç
       birebir aynı, tarama yok. Harita yoksa eski yol aynen çalışır. */
    function hazirSozluk(dizi){ var h={}; (dizi||[]).forEach(function(x){ if(x&&x.id!=null) h[x.id]=1; }); return h; }
    function bulucuYap(fn, dizi){
      if(typeof fn!=='function'){ var h=hazirSozluk(dizi); return function(id){ return !!h[id]; }; }
      return function(id){
        try{
          if(fn(id)!==undefined) return true;
          /* katman deposunun anahtarları metindir; kimlik sayısal ise ayrıca denenir */
          if(id!=='' && id!=null && !isNaN(id) && fn(Number(id))!==undefined) return true;
        }catch(e){ return true; }   /* şüphe varsa SİLME — veri güvenliği önce gelir */
        return false;
      };
    }
    var objVar=bulucuYap(window.aybObjById, p.objects);
    var hatVar=bulucuYap(window.aybHatById, p.lines);
    function sil(store, varMi){
      Object.keys(store).forEach(function(id){
        if(varMi(id)) return;
        (store[id]||[]).forEach(function(l){ try{ if(map.hasLayer(l)){ map.removeLayer(l); n++; } }catch(e){} });
        delete store[id];
      });
    }
    try{ sil(st.obj, objVar); }catch(e){}
    try{ sil(st.line, hatVar); }catch(e){}
    try{ if(st.free) sil(st.free, function(id){ return !!fid[id]; }); }catch(e){}
    try{ if(st.area) sil(st.area, function(id){ return !!aid[id]; }); }catch(e){}
    try{ if(st.chan) sil(st.chan, function(id){ return !!cid[id]; }); }catch(e){}
    /* HAYALET SÜPÜRME (Bayram YARAŞ): haritada karşılığı kalmayan işaretçi DOM'ları kaldır —
       toplu silmede "silindi ama ekranda kaldı" görüntüsünün kökten çözümü. */
    try{
      var canli=[];
      map.eachLayer(function(l){ try{ if(l&&l._icon) canli.push(l._icon); if(l&&l._shadow) canli.push(l._shadow); }catch(e){} });
      var pane=map.getPanes&&map.getPanes().markerPane;
      if(pane){ Array.prototype.slice.call(pane.children).forEach(function(el){
        if(el&&el.classList&&el.classList.contains('leaflet-marker-icon')&&canli.indexOf(el)<0){ try{ el.remove(); n++; }catch(e){} }
      }); }
    }catch(e){}
    return n;
  }
  window.aybArtikTemizle=temizle;

  function sonrasi(ad){
    /* devam eden hat/çizim varsa bitir: yoksa son direkten imlece uzanan ÖNİZLEME ekranda kalıp
       "hat silinmedi" gibi görünüyor */
    try{ if(typeof window.finishCurrentOperation==='function') window.finishCurrentOperation(); }catch(e){}
    try{ if(typeof window.clearLinePreview==='function') window.clearLinePreview(); }catch(e){}
    try{ if(typeof window.aybRubberTemizle==='function') window.aybRubberTemizle(); }catch(e){}
    /* İSTEK (Bayram YARAŞ): TEK hat/obje silmede TAM YENİDEN ÇİZİM YAPILMAZ —
       deleteLine katmanı hedefli kaldırıyor, deleteObject kendi çizimini kendisi yapıyor.
       "Tüm hatlar silinip geri geliyor" görüntüsünün sebebi buradaki zorunlu tam çizimdi. */
    var hedefli=(ad==='deleteLine'||ad==='deleteObject');
    setTimeout(function(){
      try{ temizle(); }catch(e){}
      if(!hedefli){
        try{ if(window.aybForceFullRender) window.aybForceFullRender(); else if(window.renderAll) window.renderAll(); }catch(e){}
        try{ temizle(); }catch(e){}
      }
    }, 0);
  }
  function sar(hedef, ad){
    try{
      var o=hedef&&hedef.obj; if(!o||typeof o[ad]!=='function'||o[ad].__aybDel) return false;
      var inner=o[ad];
      var w=function(){ var r; try{ r=inner.apply(this,arguments); } finally { sonrasi(ad); } return r; };
      w.__aybDel=true;
      try{ if(inner.__aybGeo) w.__aybGeo=true; }catch(e){}   /* bayrak korunur: sarmalayıcılar birbirini tekrar sarmaz */
      o[ad]=w; return true;
    }catch(e){ return false; }
  }
  window.aybSarSilme=function(o){ try{ sar({obj:o},'deleteObjects'); sar({obj:o},'deleteAll'); }catch(e){} };
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

  /* ---- MOD ÇUBUĞU (İSTEK: Bayram YARAŞ) ----
     Bitir/İptal araç şeridinden KALDIRILDI. Taşıma Modu'ndaki TURUNCU çubuğun
     aynısı, HANGİ ARAÇ AKTİFSE haritanın üst ortasında açılır:
     Direk'e tıkla -> "DİREK MODU" çubuğu; ✔ Bitir -> işlem biter, araç kapanır. */
  var ARAC_AD={direk:'DİREK',trafo:'TRAFO',hat:'HAT ÇİZİMİ',abonehat:'ABONE HAT',
    yeraltihat:'YERALTI HAT',kanal:'KANAL',kofre:'KOFRE',box:'BOX',abone:'LAMBA',
    not:'NOT',bina:'BİNA/ALAN',cizgi:'ÇİZGİ',ok:'OK',olcum:'ÖLÇÜM'};
  function aracKodu(){
    try{ if(typeof activeTool!=='undefined'&&activeTool) return String(activeTool); }catch(e){}
    if(olcumAktif()) return 'olcum';
    return '';
  }
  var modBar=null;
  function modBarKur(){
    if(modBar&&modBar.parentNode) return modBar;
    modBar=d.createElement('div'); modBar.id='aybCizimModBar';
    modBar.style.cssText='position:fixed;left:50%;transform:translateX(-50%);top:150px;z-index:2147482900;display:none;gap:10px;align-items:center;background:rgba(15,23,42,.92);border:1px solid #f59e0b;border-radius:999px;padding:6px 8px 6px 16px;box-shadow:0 8px 24px rgba(0,0,0,.45);font:700 13px system-ui;color:#fde68a;';
    modBar.innerHTML='<span id="aybCizimModAd">✏ ÇİZİM MODU</span>'+
      '<button id="aybCizBitir" style="height:32px;padding:0 16px;border:none;border-radius:999px;background:#f59e0b;color:#111;font:800 13px system-ui;cursor:pointer;">✔ Bitir</button>'+
      '<button id="aybCizIptal" style="height:32px;padding:0 12px;border:1px solid #64748b;border-radius:999px;background:transparent;color:#e2e8f0;font:800 13px system-ui;cursor:pointer;">✖ İptal</button>';
    var bb=modBar.querySelector('#aybCizBitir'), ii=modBar.querySelector('#aybCizIptal');
    function tetik(fn){ return function(e){ try{e.preventDefault();e.stopPropagation();}catch(_){}
      var t=Date.now(); if(modBar.__son&&t-modBar.__son<400) return; modBar.__son=t; fn(); }; }
    ['pointerdown','click','touchend'].forEach(function(ev){
      bb.addEventListener(ev,tetik(function(){ bitir(); setTimeout(function(){ if(!tempPts()) iptal(); },80); }),true);
      ii.addEventListener(ev,tetik(iptal),true);
    });
    d.body.appendChild(modBar);
    return modBar;
  }
  setInterval(function(){
    try{
      var eski=d.getElementById('aybCizimBar'); if(eski){ try{ eski.remove(); }catch(_){} }
      var bar=modBarKur();
      var kod=aracKodu(), ciz=cizimAktif();
      var goster=(!!kod||ciz)&&!window.__aybTasimaModu;
      bar.style.display=goster?'flex':'none';
      if(goster){
        var ad=ARAC_AD[kod]||(kod?String(kod).toUpperCase():'ÇİZİM');
        var ek='';
        /* İSTEK (Bayram YARAŞ): hangi snap kuralı canlı — çubukta görünsün */
        if(kod==='yeraltihat'||kod==='abonehat'){
          try{ if(typeof window.aybSnapMetre==='function') ek=' · 🧲 '+window.aybSnapMetre()+' m İÇİ: BAĞLA · DIŞI: KIRIK'; }catch(e){}
        } else if(kod==='hat'){ ek=' · bağla: TEK TIK'; }
        var sp=bar.querySelector('#aybCizimModAd'); if(sp) sp.textContent='✏ '+ad+' MODU'+ek;
      }
      if(!ciz) temizleRubber();
    }catch(e){}
  }, 350);

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
    files.push({name:'OKUBENI.txt', data:str2u8('BY EDS Saha - MIF/MID katmanli disa aktarim\r\nProje: '+pname()+'\r\nKatman sayisi: '+kat+'\r\nNesne sayisi: '+adet+'\r\nKoordinat: WGS84 (Earth Projection 1, 104)\r\n')});
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
      wL.__aybGeo=true; try{ if(iL.__aybDel) wL.__aybDel=true; }catch(e){} A.deleteLine=wL;
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
      wO.__aybGeo=true; try{ if(iO.__aybDel) wO.__aybDel=true; }catch(e){} A.deleteObject=wO;
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
    /* KMZ/KML: direk zaten kendi lambalarıyla birlikte geldiyse ayrı LAMBA yer imi tekrar eklemez */
    if(en.props.ithal_kaynak==='IMPORT' && Array.isArray(en.props.lambalar) && en.props.lambalar.length){ sayac.atlanan++; return true; }
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
      var kat=String(f.katman||'').toLocaleUpperCase('tr');
      var noktalar=f.pts.map(function(q){ return [+q[0],+q[1]]; });
      /* BİREBİR geri alma: KANAL kendi koleksiyonuna, ALAN/BİNA poligonu alanlara */
      if(kat.indexOf('KANAL')>=0){
        p.channels=p.channels||[];
        var vk=p.channels.some(function(x){ return x.points&&x.points.length===noktalar.length&&m2(x.points[0],noktalar[0])<1; });
        if(vk){ sayac.atlanan++; return; }
        p.channels.push({ id:uid('KANAL'), kind:'kanal', points:noktalar, props:f.props||{} });
        sayac.cizgi++; return;
      }
      if(f.kind==='polygon'||kat.indexOf('ALAN')>=0||kat==='BINA'){
        p.areas=p.areas||[];
        var va=p.areas.some(function(x){ return x.points&&x.points.length===noktalar.length&&m2(x.points[0],noktalar[0])<1; });
        if(va){ sayac.atlanan++; return; }
        p.areas.push({ id:uid('ALAN'), kind:((f.props&&f.props.kind)||(kat==='BINA'?'bina':'alan')), points:noktalar, props:f.props||{} });
        sayac.cizgi++; return;
      }
      p.freeLines=p.freeLines||[];
      var vv=p.freeLines.some(function(x){ return x.points&&x.points.length===f.pts.length&&m2(x.points[0],[+a[0],+a[1]])<1; });
      if(vv){ sayac.atlanan++; return; }
      p.freeLines.push({ id:uid('CIZ'), kind:((f.props&&f.props.kind)||'cizgi'), points:noktalar, props:f.props||{} });
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
    var toplam=sayac.obje+sayac.hat+sayac.cizgi+sayac.lamba;
    /* İSTEK (Bayram YARAŞ): dosya nereye aitse harita O BÖLGEYE gitsin ve sığdırsın.
       Kaynak olarak okunan kayıtların kendisi verilir; böylece projenin başka
       yerindeki eski veriler çerçeveyi bozmaz. Hepsi mükerrer çıksa bile o bölgeye gider. */
    try{
      var _kk=(window.aybKoordlariTopla?window.aybKoordlariTopla(veri):[]);
      if(_kk.length) setTimeout(function(){ try{ window.aybIceriSigdir(_kk.map(function(q){ return {lat:q[0],lng:q[1]}; })); }catch(e){} }, 350);
    }catch(e){}
    try{
      if(window.toast){
        if(toplam) toast('İçe alındı: '+sayac.obje+' nesne, '+sayac.hat+' hat, '+sayac.cizgi+' çizim, '+sayac.lamba+' lamba'+(sayac.atlanan?(' • '+sayac.atlanan+' mükerrer atlandı'):''));
        else if(sayac.atlanan) toast('Yeni veri eklenmedi: '+sayac.atlanan+' nesnenin hepsi zaten bu projede mevcut (mükerrer).');
        else toast('Dosya okundu ancak eklenebilir nesne çıkmadı ('+veri.length+' kayıt).');
      }
    }catch(e){}
  }
  window.aybTamIceAl=tamIceAl;

  /* ===================== EVRENSEL OKUYUCU (BY EDŞ) =====================
     İSTEK (Bayram YARAŞ): "TAM İÇE AL dediğimde JSON / MİF dosyası boş dosya gibi
     içeri hiçbir veri almıyor." Sebep: okuyucu YALNIZ proje paketini ve {veri:[...]}
     biçimini tanıyordu; programın kendi ürettiği düz proje JSON'u, {app,...,project}
     yedeği, GeoJSON ve KMZ/KML dosyaları "boş" görünüyordu. Artık HEPSİ okunur. */
  function baytMetin(u){
    try{ return new TextDecoder('utf-8',{fatal:true}).decode(u); }catch(e){}
    try{ return new TextDecoder('windows-1254').decode(u); }catch(e){}
    try{ return new TextDecoder('utf-8').decode(u); }catch(e){}
    return '';
  }
  async function dosyaMetin(f){
    try{ return baytMetin(new Uint8Array(await f.arrayBuffer())); }
    catch(e){ try{ return await f.text(); }catch(_){ return ''; } }
  }
  function trUp(x){
    return String(x==null?'':x).toLocaleUpperCase('tr')
      .replace(/İ/g,'I').replace(/Ş/g,'S').replace(/Ğ/g,'G').replace(/Ü/g,'U').replace(/Ö/g,'O').replace(/Ç/g,'C');
  }
  var KATNORM={ DIREK:'DIREK', DIREKLER:'DIREK', TRAFO:'TRAFO', TRAFOLAR:'TRAFO', KOFRE:'KOFRE', KOFRELER:'KOFRE',
    BOX:'BOX', PANO:'BOX', ABONE:'ABONE', ABONELER:'ABONE', EKMUF:'EK_MUF', EK_MUF:'EK_MUF', MUF:'EK_MUF', EKMUFU:'EK_MUF',
    NOT:'NOT', NOTLAR:'NOT', LAMBA:'LAMBA', LAMBALAR:'LAMBA', AYDINLATMA:'LAMBA', ARMATUR:'LAMBA',
    HAT:'HAT_HAVAI', HATLAR:'HAT_HAVAI', HAT_HAVAI:'HAT_HAVAI', HATHAVAI:'HAT_HAVAI', HAVAIHAT:'HAT_HAVAI', HAVAI:'HAT_HAVAI',
    HAT_YERALTI:'HAT_YERALTI', HATYERALTI:'HAT_YERALTI', YERALTIHAT:'HAT_YERALTI', YERALTI:'HAT_YERALTI',
    HAT_ABONE:'HAT_ABONE', HATABONE:'HAT_ABONE', ABONEHAT:'HAT_ABONE',
    KANAL:'KANAL', KANALLAR:'KANAL', CIZGI:'CIZGI', CIZGILER:'CIZGI', CIZIMLER:'CIZGI', CIZIM:'CIZGI', SERBESTCIZGI:'CIZGI',
    ALAN:'ALAN', ALANLAR:'ALAN', OK:'OK', BINA:'BINA' };
  function katNorm(x){
    var t=trUp(x).replace(/\s*\(\s*\d+\s*\)\s*$/,'').replace(/[^A-Z0-9_]/g,'');
    if(!t) return '';
    if(KATNORM[t]) return KATNORM[t];
    if(t.indexOf('YERALTI')>=0) return 'HAT_YERALTI';
    if(t.indexOf('ABONEHAT')>=0) return 'HAT_ABONE';
    if(t.indexOf('HAT')===0) return t;
    return '';
  }
  function propKat(pr, nokta){
    pr=pr||{};
    if(!nokta){
      var hy=trUp(pr.hy||pr.hat_yapisi||pr.yapi||pr.hat_tipi||'');
      if(hy.indexOf('YERALTI')>=0||hy.indexOf('YER ALTI')>=0) return 'HAT_YERALTI';
      return 'HAT_HAVAI';
    }
    if(pr.trafo_no||pr.trafo_turu) return 'TRAFO';
    if(pr.kofre_no) return 'KOFRE';
    if(pr.box_no) return 'BOX';
    if(pr.abone_no) return 'ABONE';
    if(pr.muf_no) return 'EK_MUF';
    if(pr.metin!=null && pr.direk_no==null) return 'NOT';
    return 'DIREK';
  }
  function propAd(pr){
    pr=pr||{};
    return String(pr.direk_no||pr.trafo_no||pr.kofre_no||pr.box_no||pr.abone_no||pr.muf_no||pr.ad||pr.no||'');
  }
  function kopya(o){ var y={}; try{ for(var k in (o||{})) y[k]=o[k]; }catch(e){} return y; }
  var ATIL={ obj_type:1, objType:1, poz_baglanti:1, itrf96_nokta_listesi:1, start:1, end:1, id:1, length_m:1 };

  /* ---------- GeoJSON ---------- */
  function geoVeri(j){
    var fs=Array.isArray(j)?j:(j&&Array.isArray(j.features)?j.features:null);
    if(!fs||!fs.length) return [];
    var out=[];
    function xy(c){ if(!c||c.length<2) return null; var lng=+c[0], lat=+c[1]; return (isFinite(lat)&&isFinite(lng))?[lat,lng]:null; }
    function dz(cs){ var a=[]; (cs||[]).forEach(function(c){ var q=xy(c); if(q) a.push(q); }); return a; }
    function ekle(kind, pts, sp){
      if(!pts||!pts.length) return;
      if(kind!=='point' && pts.length<2) return;
      var pr={}; try{ for(var k in (sp||{})){ if(ATIL[k]) continue; var v=sp[k]; if(v==null||v==='') continue; pr[k]=v; } }catch(e){}
      var tip=String((sp&&(sp.obj_type||sp.tip))||'');
      var kat=katNorm(tip)||katNorm(sp&&(sp.katman||sp.KATMAN||sp.layer))||propKat(pr, kind==='point');
      out.push({ katman:kat, kind:kind, ad:propAd(pr)||String((sp&&sp.name)||''), tip:tip, pts:pts, props:pr });
    }
    fs.forEach(function(f){
      if(!f) return;
      var g=f.geometry||((f.type&&f.coordinates)?f:null); if(!g||!g.type) return;
      var sp=f.properties||f.props||{};
      var t=String(g.type).toLowerCase(), c=g.coordinates;
      if(t==='point'){ var q=xy(c); if(q) ekle('point',[q],sp); }
      else if(t==='multipoint'){ (c||[]).forEach(function(cc){ var q2=xy(cc); if(q2) ekle('point',[q2],sp); }); }
      else if(t==='linestring'){ ekle('line', dz(c), sp); }
      else if(t==='multilinestring'){ (c||[]).forEach(function(l){ ekle('line', dz(l), sp); }); }
      else if(t==='polygon'){ ekle('polygon', dz((c||[])[0]), sp); }
      else if(t==='multipolygon'){ (c||[]).forEach(function(pg){ ekle('polygon', dz((pg||[])[0]), sp); }); }
    });
    return out;
  }

  /* ---------- KML / KMZ ---------- */
  function yerelAd(n){ return String(n.localName||n.nodeName||'').replace(/^.*:/,''); }
  function cocukEl(el, ad){
    if(!el||!el.childNodes) return null;
    for(var i=0;i<el.childNodes.length;i++){ var c=el.childNodes[i]; if(c.nodeType===1 && yerelAd(c)===ad) return c; }
    return null;
  }
  function cocukMetin(el, ad){ var c=cocukEl(el,ad); return c?String(c.textContent||'').trim():''; }
  function altHepsi(kok, ad){
    var out=[];
    (function yur(n){
      if(!n||!n.childNodes) return;
      for(var i=0;i<n.childNodes.length;i++){ var c=n.childNodes[i]; if(c.nodeType!==1) continue; if(yerelAd(c)===ad) out.push(c); yur(c); }
    })(kok);
    return out;
  }
  function htmlSade(x){
    return String(x==null?'':x).replace(/<[^>]*>/g,' ')
      .replace(/&nbsp;/gi,' ').replace(/&lt;/gi,'<').replace(/&gt;/gi,'>')
      .replace(/&quot;/gi,'"').replace(/&#39;/g,"'").replace(/&apos;/gi,"'").replace(/&amp;/gi,'&')
      .replace(/\s+/g,' ').trim();
  }
  function kmlKoord(el){
    if(!el) return [];
    var t=String(el.textContent||'').trim(); if(!t) return [];
    var out=[];
    t.split(/\s+/).forEach(function(x){
      var q=x.split(','); if(q.length<2) return;
      var lng=+q[0], lat=+q[1];
      if(isFinite(lat)&&isFinite(lng)&&(lat!==0||lng!==0)) out.push([lat,lng]);
    });
    return out;
  }
  function kmlVeri(txt){
    var out=[], doc=null;
    try{ doc=new DOMParser().parseFromString(String(txt||''),'text/xml'); }catch(e){ return out; }
    if(!doc||!doc.documentElement) return out;
    function pmOku(pm, klasor){
      var pr={}, kat='', tip='', ad=cocukMetin(pm,'name');
      function kaydet(k,v){
        if(k==null||v==null||v==='') return;
        var K=trUp(k).replace(/[^A-Z0-9_]/g,'');
        if(K==='KATMAN'||K==='LAYER'){ if(!kat) kat=String(v); return; }
        if(K==='TIP'||K==='TYPE'||K==='OBJTYPE'||K==='OBJ_TYPE'){ if(!tip) tip=String(v); return; }
        if(K==='AD'||K==='ADNO'||K==='NO'||K==='NAME'){ if(!ad) ad=String(v); return; }
        if(K==='ID'||K==='KAYNAK'||K==='UZUNLUK'||K==='KOORDINAT'||K==='FOTOGRAFLAR') return;
        if(K==='JSON'){ try{ var jj=JSON.parse(v); for(var x in jj) pr[x]=jj[x]; }catch(e){} return; }
        if(pr[k]==null) pr[k]=v;
      }
      altHepsi(pm,'Data').forEach(function(dt){ try{ kaydet(dt.getAttribute('name'), cocukMetin(dt,'value')||String(dt.textContent||'').trim()); }catch(e){} });
      altHepsi(pm,'SimpleData').forEach(function(dt){ try{ kaydet(dt.getAttribute('name'), String(dt.textContent||'').trim()); }catch(e){} });
      var desc=cocukMetin(pm,'description');
      if(desc){
        var re=/<tr[^>]*>\s*<th[^>]*>([\s\S]*?)<\/th>\s*<td[^>]*>([\s\S]*?)<\/td>\s*<\/tr>/gi, m;
        while((m=re.exec(desc))){ kaydet(htmlSade(m[1]), htmlSade(m[2])); }
        if(!tip){ var mt=desc.match(/<b>\s*Tip\s*:\s*<\/b>\s*([^<]+)/i); if(mt) tip=htmlSade(mt[1]); }
      }
      var geo=[];
      altHepsi(pm,'Point').forEach(function(g){ var c=kmlKoord(cocukEl(g,'coordinates')); if(c.length) geo.push({kind:'point',pts:[c[0]]}); });
      altHepsi(pm,'LineString').forEach(function(g){ var c=kmlKoord(cocukEl(g,'coordinates')); if(c.length>=2) geo.push({kind:'line',pts:c}); });
      altHepsi(pm,'Polygon').forEach(function(g){
        var ob=cocukEl(g,'outerBoundaryIs'), lr=ob?cocukEl(ob,'LinearRing'):altHepsi(g,'LinearRing')[0];
        var c=lr?kmlKoord(cocukEl(lr,'coordinates')):[];
        if(c.length>=3) geo.push({kind:'polygon',pts:c});
      });
      if(!geo.length) return;
      var kk=katNorm(kat)||katNorm(tip)||katNorm(klasor);
      geo.forEach(function(g){
        out.push({ katman:(kk||propKat(pr, g.kind==='point')), kind:g.kind, ad:(ad||propAd(pr)), tip:tip, pts:g.pts, props:kopya(pr) });
      });
    }
    (function yur(n, klasor){
      if(!n||!n.childNodes) return;
      for(var i=0;i<n.childNodes.length;i++){
        var c=n.childNodes[i]; if(c.nodeType!==1) continue;
        var a=yerelAd(c);
        if(a==='Placemark'){ try{ pmOku(c, klasor); }catch(e){} }
        else if(a==='Folder'||a==='Document'){ yur(c, (cocukMetin(c,'name')||klasor)); }
        else yur(c, klasor);
      }
    })(doc.documentElement, '');
    return out;
  }

  /* ---------- JSON: proje paketi / düz proje / yedek sarmalı / GeoJSON / TUMU.json ---------- */
  function projeGibiMi(o){
    if(!o||typeof o!=='object'||Array.isArray(o)) return false;
    var A=['objects','lines','freeLines','channels','areas','aybNotes'];
    for(var i=0;i<A.length;i++){ if(Array.isArray(o[A[i]])) return true; }
    return false;
  }
  function projeCikar(j){
    if(!j||typeof j!=='object') return null;
    if(projeGibiMi(j)) return j;
    var yol=['proje','project','data','payload','icerik','content'];
    for(var i=0;i<yol.length;i++){ if(projeGibiMi(j[yol[i]])) return j[yol[i]]; }
    return null;
  }
  function veriDizisiMi(a){ return Array.isArray(a) && a.length && a[0] && Array.isArray(a[0].pts); }
  async function jsonVeri(j, sonuc){
    if(j==null) return [];
    /* 1) proje paketi -> birebir */
    try{ if(window.aybPaketMi && window.aybPaketMi(j)){ await window.aybPaketIceri(j); sonuc.paket++; return []; } }catch(e){}
    /* 2) TUMU.json ve {veri:[...]} */
    if(j && veriDizisiMi(j.veri)) return j.veri;
    if(veriDizisiMi(j)) return j;
    /* 3) GeoJSON */
    if(j && (String(j.type||'')==='FeatureCollection' || Array.isArray(j.features))){ var g=geoVeri(j); if(g.length) return g; }
    if(Array.isArray(j) && j.length && j[0] && (j[0].geometry||j[0].coordinates)){ var g2=geoVeri(j); if(g2.length) return g2; }
    /* 4) düz proje JSON'u ya da {app,...,project:{...}} yedeği */
    var c=projeCikar(j);
    if(c && window.aybPaketIceri){
      await window.aybPaketIceri({ ayb:'proje-paketi', surum:1, proje:c, fotolar:(j&&j.fotolar)||null });
      sonuc.paket++; return [];
    }
    return [];
  }
  function mifMi(t){ t=String(t||''); return /^\s*Version\s+\d/i.test(t) && /\bColumns\s+\d+/i.test(t); }
  function kmlMi(t){ t=String(t||''); return /<\s*kml[\s>]/i.test(t) || /<\s*Placemark[\s>]/i.test(t); }

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
    var mif={}, mid={}, veri=[], sonuc={paket:0};

    async function zipIsle(f){
      if(!window.aybZipOku||!window.aybZipBayt) return null;
      var zf=null;
      try{ zf=await window.aybZipOku(await f.arrayBuffer()); }catch(e){ return null; }
      var adlar=Object.keys(zf||{});
      if(!adlar.length) return null;
      async function metin(k){ try{ return baytMetin(await window.aybZipBayt(zf[k])); }catch(e){ return ''; } }
      /* a) TAM veri: TUMU.json (form bilgileri kırpılmamış) */
      var tk=null;
      adlar.forEach(function(k){ if(!tk && /(^|\/)TUMU\.json$/i.test(k)) tk=k; });
      if(tk){
        try{ var r=await jsonVeri(JSON.parse(await metin(tk)), sonuc); if(r&&r.length) return r; if(sonuc.paket) return []; }catch(e){}
      }
      /* b) zip içindeki diğer json / geojson (proje yedeği, GeoJSON...) */
      for(var i=0;i<adlar.length;i++){
        var k2=adlar[i];
        if(!/\.(json|geojson)$/i.test(k2) || /(^|\/)TUMU\.json$/i.test(k2)) continue;
        try{ var r2=await jsonVeri(JSON.parse(await metin(k2)), sonuc); if(r2&&r2.length) return r2; if(sonuc.paket) return []; }catch(e){}
      }
      /* c) KMZ içindeki KML */
      var kml=adlar.filter(function(k){ return /\.kml$/i.test(k); });
      if(kml.length){
        var kv=[];
        for(var q=0;q<kml.length;q++){ try{ kv=kv.concat(kmlVeri(await metin(kml[q]))); }catch(e){} }
        if(kv.length) return kv;
      }
      /* d) MİF/MID: TUMU.mif varsa SADECE o okunur (katman dosyaları onun kopyasıdır) */
      var mifAd=adlar.filter(function(k){ return /\.mif$/i.test(k); });
      var tumM=mifAd.filter(function(k){ return /(^|\/)TUMU\.mif$/i.test(k); });
      if(tumM.length) mifAd=tumM;
      for(var m=0;m<mifAd.length;m++){
        var mk=mifAd[m], ana=mk.replace(/\.mif$/i,'');
        mif[ana]=await metin(mk);
        var dk=null;
        adlar.forEach(function(x){ if(!dk && x.toLowerCase()===(ana+'.mid').toLowerCase()) dk=x; });
        if(dk) mid[ana]=await metin(dk);
      }
      return null;
    }

    for(var i=0;i<files.length;i++){
      var f=files[i], ad=String(f.name||''), txt=null;
      try{
        if(/\.(zip|kmz)$/i.test(ad)){
          var z=await zipIsle(f);
          if(z&&z.length) veri=veri.concat(z);
          continue;
        }
        if(/\.(json|geojson)$/i.test(ad)){
          txt=await dosyaMetin(f);
          var j=null; try{ j=JSON.parse(txt); }catch(e){ j=null; }
          if(j!=null){ var r=await jsonVeri(j, sonuc); if(r&&r.length) veri=veri.concat(r); continue; }
          if(kmlMi(txt)){ veri=veri.concat(kmlVeri(txt)); }
          continue;
        }
        if(/\.(kml|xml)$/i.test(ad)){ veri=veri.concat(kmlVeri(await dosyaMetin(f))); continue; }
        if(/\.mif$/i.test(ad)){ mif[ad.replace(/\.mif$/i,'')]=await dosyaMetin(f); continue; }
        if(/\.mid$/i.test(ad)){ mid[ad.replace(/\.mid$/i,'')]=await dosyaMetin(f); continue; }
        /* uzantı bilinmiyor -> içeriğe bak (txt, yedek, adı bozulmuş dosya...) */
        txt=await dosyaMetin(f);
        if(mifMi(txt)){ mif[ad.replace(/\.[^.]*$/,'')]=txt; continue; }
        if(kmlMi(txt)){ veri=veri.concat(kmlVeri(txt)); continue; }
        try{ var j2=JSON.parse(txt); var r2=await jsonVeri(j2, sonuc); if(r2&&r2.length) veri=veri.concat(r2); }catch(e){}
      }catch(e){}
    }

    var keys=Object.keys(mif);
    if(keys.length){
      var tum=keys.filter(function(k){ return /(^|[\/\\])TUMU$/i.test(k); });
      if(tum.length) keys=tum;
      keys.forEach(function(k){
        var kat=k.split('/').pop().split('\\').pop().toLocaleUpperCase('tr');
        if(kat==='TUMU') kat='';
        try{ veri=veri.concat(mifParse(mif[k], mid[k]||'', kat)); }catch(e){}
      });
    }
    return { veri:veri, paket:sonuc.paket };
  }
  window.aybDosyalardanVeri=dosyalardanVeri;
  window.aybKmlVeri=kmlVeri;
  window.aybGeoVeri=geoVeri;
  /* dosya seçici + düğme */
  function sec(){
    var inp=d.getElementById('aybTamIceInp');
    if(!inp){ inp=d.createElement('input'); inp.type='file'; inp.id='aybTamIceInp'; inp.multiple=true; inp.style.display='none'; d.body.appendChild(inp); }
    inp.accept='.zip,.kmz,.kml,.json,.geojson,.mif,.mid,.txt,.xml';
    inp.value='';
    inp.onchange=function(){
      var fs2=inp.files; if(!fs2||!fs2.length) return;
      (async function(){
        try{
          try{ if(window.toast) toast('Dosya okunuyor…'); }catch(e){}
          var r=await dosyalardanVeri(fs2);
          var veri=(r&&r.veri)||[];
          if(veri.length){ tamIceAl(veri); return; }
          if(r&&r.paket) return;                                  /* proje paketi/yedeği zaten alındı */
          try{ if(window.toast) toast('Dosyada okunabilir veri bulunamadı. Desteklenenler: MİF zip, KMZ/KML, GeoJSON, proje yedeği (.json), MİF+MID (ikisini birlikte seçin).'); }catch(e){}
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
    b.title='Tam İçe Al - MİF zip, KMZ/KML, GeoJSON, proje yedeği (.json) ve MİF+MID dosyalarını form bilgileri ve lambalarla birlikte içe alır';
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
      /* çizim/kanal/alan da mükerrer kontrolünden geçsin (aynı paket 2. kez alınırsa kopyalanmasın) */
      ['areas','freeLines','channels'].forEach(function(k){
        p[k]=p[k]||[];
        (pr[k]||[]).forEach(function(x){
          if(!x||!Array.isArray(x.points)||!x.points.length) return;
          var v=p[k].some(function(z){
            return z && Array.isArray(z.points) && z.points.length===x.points.length
              && m2(z.points[0],x.points[0])<1 && m2(z.points[z.points.length-1],x.points[x.points.length-1])<1;
          });
          if(v){ say.d++; return; }
          var y=JSON.parse(JSON.stringify(x)); y.id=uid(k.toUpperCase()); p[k].push(y);
        });
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
    /* İSTEK (Bayram YARAŞ): paket/yedek içeri alınınca harita gelen verinin bölgesine gitsin */
    try{ setTimeout(function(){ try{ if(window.aybIceriSigdir) window.aybIceriSigdir(pr); }catch(e){} }, 350); }catch(e){}
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
     I_(İLERDE) B_(TADILAT BYSK). SOKULEN = temel sembol + KIRMIZI ÇARPI. Karakterler fontun Windows
     tablosundan glif adı eşleştirilerek çıkarıldı — tahmin yok. */
  function durumOneki(durum){
    var d=String(durum||'').toLocaleUpperCase('tr');
    if(d.indexOf('YENİ')>=0||d.indexOf('YENI')>=0) return 'Y';
    if(d.indexOf('YAKIN')>=0) return 'YA';
    if(d.indexOf('İLER')>=0||d.indexOf('ILER')>=0) return 'I';
    if(d.indexOf('DM+MON')>=0||d.indexOf('BYSK')>=0||d.indexOf('TADILAT')>=0||d.indexOf('TEKRAR')>=0||d.split('DEMONTAJ').join('').indexOf('MONTAJ')>=0) return 'B';
    if(d==='DM'||d.indexOf('SÖK')>=0||d.indexOf('SOK')>=0||d.indexOf('DEMONT')>=0) return 'S';
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
    /* LEJANT KURALI (Bayram YARAŞ): DEMİR/GALV.DEMİR/KAFES/ÇELİK = KARE aile;
       BETON/AĞAÇ = YUVARLAK; ENH-BAHH = OG ailesi; AYD küçük yuvarlak.
       Harita sembolleriyle BİREBİR aynı kural. */
    var gt=String(pr.genel_tip||pr.GENEL_TIP||'').toLocaleUpperCase('tr');
    var alt=String(pr.alt_tip||pr.ALT_TIP||pr.alt_cins||'').toLocaleUpperCase('tr');
    var kafes=(alt.indexOf('KAFES')>=0||alt.indexOf('DEMIR')>=0||alt.indexOf('DEMİR')>=0||alt.indexOf('CELIK')>=0||alt.indexOf('ÇELİK')>=0);
    var grup;
    if(gt.indexOf('AYD')>=0) grup='AYD';
    else if(gt.indexOf('OG')>=0||gt.indexOf('MUS')>=0||gt.indexOf('MÜŞ')>=0||gt.indexOf('ENH')>=0||gt.indexOf('BAH')>=0) grup=kafes?'OG_KAFES':'OG';
    else grup=kafes?'AG_KAFES':'AG';
    var t=KARAKTER_TABLO[grup];
    return t[durumOneki(durum)]||t.M;
  }
  function boxKarakter(durum){ var t=KARAKTER_TABLO.BOX; return t[durumOneki(durum)]||t.M; }
  function sokulenmi(durum){ return durumOneki(durum)==='S'; }
  function sokulenX(katman,c,r){
    /* SOKULEN (eski DM): sembol üstüne KIRMIZI ÇARPI (ACI 1) — B Pro demontaj işareti */
    r=r||2.0;
    function P(dx,dy){ return {y:c.y+dx, x:c.x+dy}; }
    return cizgiEnt(katman,P(-r,-r),P(r,r),null,1)+cizgiEnt(katman,P(-r,r),P(r,-r),null,1);
  }
  function kofreKarakter(durum){ var t=KARAKTER_TABLO.KOFRE; return t[durumOneki(durum)]||t.M; }
  /* ===== B PRO KATMAN ŞEMASI BİREBİR (Bayram YARAŞ) =====
     bprojedatabase LAYER + DIREK_DRAWING_PROPERTY tablolarından okundu:
     DIREK_{AG|OG|AYD|ENH|BOX}_{DURUM}, HAT_{GRUP}_{HAVAI|YERALTI}_{DURUM(BYSK)},
     KOFRE_AG_{DURUM}; BASKI renkleri: AG 120/108, OG 16/10, AYD 190/152, ENH 6, BOX 5. */
  function bproDurumAdi(durum){
    var d=String(durum||'').toLocaleUpperCase('tr');
    if(d.indexOf('DİĞER')>=0||d.indexOf('DIGER')>=0) return 'DIGER';
    var on=durumOneki(durum);
    return ({M:'MEVCUT',Y:'YENI',YA:'YAKIN',I:'ILERDE',B:'TADILAT_BYSK',S:'SOKULEN'})[on]||'MEVCUT';
  }
  function bproDurumAdiHat(durum){ var a=bproDurumAdi(durum); return a==='TADILAT_BYSK'?'BYSK':a; }
  function bproDirekGrup(pr){
    var gt=String(pr.genel_tip||pr.GENEL_TIP||'').toLocaleUpperCase('tr');
    if(gt.indexOf('AYD')>=0) return 'AYD';
    if(gt.indexOf('ENH')>=0||gt.indexOf('BAH')>=0) return 'ENH';
    if(gt.indexOf('OG')>=0||gt.indexOf('MUS')>=0||gt.indexOf('MÜŞ')>=0) return 'OG';
    if(gt.indexOf('BOX')>=0) return 'BOX';
    return 'AG';
  }
  var BPRO_DIREK_BASKI={AG:{MEVCUT:120,YENI:108,VARS:3},OG:{MEVCUT:16,YENI:10,VARS:1},AYD:{MEVCUT:190,YENI:152,VARS:4},ENH:{MEVCUT:6,YENI:6,VARS:6},BOX:{MEVCUT:5,YENI:5,VARS:5}};
  function bproDirekRenk(pr,durum){
    var t=BPRO_DIREK_BASKI[bproDirekGrup(pr)]||BPRO_DIREK_BASKI.AG;
    var ad=bproDurumAdi(durum);
    return (ad==='MEVCUT')?t.MEVCUT:(ad==='YENI'?t.YENI:t.VARS);
  }
  function bproTrafoKatman(durum){ var a=bproDurumAdi(durum); if(a==='SOKULEN'||a==='DIGER') a='MEVCUT'; return 'TRAFO_'+a; }
  function direkBlok(o,pr,yeni){
    var gt=String(pr.genel_tip||pr.GENEL_TIP||'').toLocaleUpperCase('tr');
    if(gt.indexOf('AYD')>=0) return yeni?'DIREK_AYD_YENI':'DIREK_AYD_MEVCUT';
    if(gt.indexOf('OG')>=0||gt.indexOf('MUS')>=0) return yeni?'DIREK_OG_YENI':'DIREK_OG_MEVCUT';
    return yeni?'DIREK_AG_YENI':'DIREK_AG_MEVCUT';
  }

  function KAT(){
    var L=[
      ['DIREK_MEVCUT',4],['DIREK_YENI',3],['TRAFO_MEVCUT',5],['TRAFO_YENI',5],['TRAFO_YAKIN',5],['TRAFO_ILERDE',5],['TRAFO_TADILAT_BYSK',5],['KOFRE_MEVCUT',6],['BOX_MEVCUT',5],
      ['ABONE_MEVCUT',2],['EK_MUF',8],['LAMBA_SEMBOL',4],['LAMBA_GUCU',4],['ETIKET_OK',7],
      ['HAT_AYD_HAVAI',150],['HAT_AYD_YERALTI',5],['HAT_ABONE',2],['KANAL',40],['CIZGI',7],['ALAN',3],['NOT',2],['TOPRAKLAMA',1]
    ];
    /* B PRO KATMANLARI BİREBİR (LAYER tablosu) — B Pro içeri alırken kendi katmanlarını tanır */
    var DUR=['MEVCUT','YENI','YAKIN','ILERDE','TADILAT_BYSK','SOKULEN','DIGER'];
    var GR={AG:3,OG:1,AYD:4,ENH:6,BOX:5};
    Object.keys(GR).forEach(function(gk){ DUR.forEach(function(du){ L.push(['DIREK_'+gk+'_'+du, GR[gk]]); }); });
    var HG={AG:84,OG:1,AYD:4,ENH:6,ABONE:2,BOX:5};
    Object.keys(HG).forEach(function(gk){ DUR.forEach(function(du){ var d2=(du==='TADILAT_BYSK')?'BYSK':du;
      L.push(['HAT_'+gk+'_HAVAI_'+d2, HG[gk]]); L.push(['HAT_'+gk+'_YERALTI_'+d2, HG[gk]]); }); });
    DUR.forEach(function(du){ L.push(['KOFRE_AG_'+du,184]); });
    return L;
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
  function polyEnt(katman,pts,kapali,ltype,renk,lw){
    /* R12 uyumlu: POLYLINE + VERTEX + SEQEND. renk=ACI (62), lw=çizgi kalınlığı (370). */
    var s=g(0,'POLYLINE')+g(8,katman)+(ltype?g(6,ltype):'')+(renk!=null?g(62,String(renk)):'')+(lw!=null?g(370,String(lw)):'')+g(66,'1')+g(70,kapali?'1':'0')+g(10,'0.0')+g(20,'0.0')+g(30,'0.0');
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
  function cizgiEnt(katman,a,b,ltype,renk){
    return g(0,'LINE')+g(8,katman)+(ltype?g(6,ltype):'')+(renk?g(62,renk):'')
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
    if(!(t.indexOf('KÖŞK')>=0||t.indexOf('KOSK')>=0||t.indexOf('KULE')>=0)){
      /* İSTEK (Bayram YARAŞ): BİNA (ve varsayılan) = ÇATILI posta sembolü — lejant yeniden analiz edildi */
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
      /* İSTEK (Bayram YARAŞ): BETONKÖŞK / KULE = KARE (4.71 lejant ölçüsü) */
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
        /* B PRO KATMANI BİREBİR: DIREK_{AG|OG|AYD|ENH|BOX}_{DURUM} */
        var dkat='DIREK_'+bproDirekGrup(pr)+'_'+bproDurumAdi(pr.durum||pr.Durumu||'');
        /* DÜZELTME: genel tipi TR/TRAFO olan kayıtlar direk sembolü değil TRAFO ÜÇGENİ alır */
        var gtTR=String(pr.genel_tip||pr.GENEL_TIP||'').toLocaleUpperCase('tr');
        if(gtTR==='TR'||gtTR.indexOf('TRAFO')>=0){
          var tkatD=bproTrafoKatman(pr.durum||'');
          s+=trafoSembol(tkatD, c, pr.durum||'', 'DİREK'); if(sokulenmi(pr.durum||'')) s+=sokulenX(tkatD,c,2.6); say.n++;
        } else {
          var kar=direkKarakter(pr, pr.durum||pr.Durumu||'');
          if(kar){
            /* B PRO BASKI RENGİ BİREBİR (DIREK_DRAWING_PROPERTY): MEVCUT/YENI ayrı ton */
            var aciA=bproDirekRenk(pr, pr.durum||pr.Durumu||'');
            s+=txtEnt(dkat, c.y, c.x, 2.5, kar, 'Direk', aciA, 0); if(sokulenmi(pr.durum||pr.Durumu||'')) s+=sokulenX(dkat,c,2.0); say.t++;
          }
          else { var blk=direkBlok(o,pr,yeni); s+= (insertEnt(dkat, blk, c.y, c.x, 1) || (daireEnt(dkat,c.y,c.x,0.6)+noktaEnt(dkat,c.y,c.x))); say.n++; }
        }

        /* lambalar: B_CAD sembolü + güç yazısı */
        var lm=Array.isArray(pr.lambalar)?pr.lambalar:[];
        lm.forEach(function(l,idx){
          if(!l) return;
          var kar=lambaKarakter(l, pr.durum), dy=2.2+idx*2.6;
          /* LEJANT LAMBA RENGİ: YENI=ACI 4, MEVCUT=ACI 40; SOKULEN=mevcut glif + KIRMIZI çarpı */
          var lOn=durumOneki(String((l&&l.durum)||pr.durum||''));
          s+=txtEnt('LAMBA_SEMBOL', c.y, c.x+dy, 2.0, kar, 'Direk', (lOn==='Y')?4:40, 0); say.t++;
          if(lOn==='S') s+=sokulenX('LAMBA_SEMBOL', {y:c.y, x:c.x+dy}, 1.1);
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
        var tkat=bproTrafoKatman(pr.durum||'');
        s+=trafoSembol(tkat, c, pr.durum||'', pr.trafo_turu||pr.TRAFO_TURU||'');
        if(sokulenmi(pr.durum||'')) s+=sokulenX(tkat,c,2.8);
        say.n++;
      }
      else if(o.type==='kofre'){ var kkat='KOFRE_AG_'+bproDurumAdi(pr.durum||''); s+=txtEnt(kkat, c.y, c.x, 2.5, kofreKarakter(pr.durum||''), 'Direk', null, 0); if(sokulenmi(pr.durum||'')) s+=sokulenX(kkat,c,1.4); say.t++; }
      else if(o.type==='box'){ var xkat='DIREK_BOX_'+bproDurumAdi(pr.durum||''); s+=txtEnt(xkat, c.y, c.x, 2.5, boxKarakter(pr.durum||''), 'Direk', null, 0); if(sokulenmi(pr.durum||'')) s+=sokulenX(xkat,c,2.0); say.t++; }
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
      var pts=[{y:a.y,x:a.x},{y:b.y,x:b.x}];
      if(Array.isArray(l.points)&&l.points.length>2){
        pts=[]; l.points.forEach(function(q){ var c2=tm(q[0],q[1]); if(c2) pts.push({y:c2.y,x:c2.x}); });
        if(pts.length<2) pts=[{y:a.y,x:a.x},{y:b.y,x:b.x}];
      }
      /* LEJANT RENKLERİ (Bayram YARAŞ): AG=84 yeşil, OG=1 kırmızı+kalın, AYD=4 cyan,
         ENH=6 magenta+kalın, ABONE=2 sarı; YERALTI=GENEL TİP RENGİNDE KESİK
         (İSTEK: AG yeraltı kırmızı DEĞİL, sadece OG kırmızı); İLERDE=kendi renginde KESİK. */
      var genelH='AG';
      try{ if(typeof window.aybLineGenelFromProps==='function') genelH=window.aybLineGenelFromProps(l.props||{})||'AG'; }catch(e){}
      if(kind.indexOf('abone')>=0) genelH='ABONE';
      var hyH=String((l.props||{}).hy||'').toLocaleUpperCase('tr');
      var yerH=(kind.indexOf('yeralti')>=0)||hyH.indexOf('YER')>=0;
      var duH=String((l.props||{}).durum||'').toLocaleUpperCase('tr');
      var ilerdeH=(duH.indexOf('İLER')>=0||duH.indexOf('ILER')>=0);
      var renkH=({AG:84,OG:1,AYD:4,ENH:6,ABONE:2,BOX:5})[genelH]||84;
      var ltH=(yerH||ilerdeH)?'DASHED':null;
      var lwH=(genelH==='OG'||genelH==='ENH')?35:null;
      /* B PRO HAT KATMANI BİREBİR: HAT_{GRUP}_{HAVAI|YERALTI}_{DURUM} (TADILAT BYSK -> BYSK) */
      var kat='HAT_'+genelH+'_'+(yerH?'YERALTI':'HAVAI')+'_'+bproDurumAdiHat((l.props||{}).durum||'');
      s+=polyEnt(kat, pts, false, ltH, renkH, lwH); say.l++;
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
  /* İSTEK (Bayram YARAŞ): BASKI'daki Pafta DXF de ana üreticiyi kullansın — sembol/katman BİREBİR */
  window.aybDxfUret=function(){ return uret(); };
  window.aybDxfTm=function(la,ln){ try{ return tm(la,ln); }catch(e){ return null; } };
  window.aybCp1254=cp1254;

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
    try{ sec=window.prompt('Tüm lambaların durumu ne olsun?\n\n1 = YENI\n2 = MEVCUT\n3 = SOKULEN\n\n(numara yazıp Tamam)','1'); }catch(e){ sec='1'; }
    if(sec==null) return;
    sec=String(sec).trim();
    var durum = (sec==='2') ? 'MEVCUT' : (sec==='3' ? 'SOKULEN' : 'YENI');
    uygula(durum, true);
  };
  function btn(){
    if(d.getElementById('aybLambaDurBtn')) return true;
    var a=d.getElementById('aybYenileBtn')||d.getElementById('aybKmzFotoBtn')||d.getElementById('aybTbBtn')||d.getElementById('btnCadTop');
    if(!a||!a.parentNode) return false;
    var b=d.createElement('button'); b.id='aybLambaDurBtn'; b.type='button'; b.className=a.className;
    b.title='Lamba Durumu - tüm lambaları tek seferde YENI / MEVCUT / SOKULEN yap';
    b.innerHTML='<div class="ayb-pro-ico" style="color:#eab308;">💡</div><small>Lamba Durumu</small>';
    b.addEventListener('click', function(e){ try{e.preventDefault();e.stopPropagation();}catch(_){} window.aybLambaDurumuTopluAyar(); });
    a.parentNode.insertBefore(b, a.nextSibling);
    return true;
  }
  var t=0, iv=setInterval(function(){ if(btn()|| ++t>80) clearInterval(iv); }, 700);
})();

/* ================= ARAÇ SIRALAMA (İSTEK: Bayram YARAŞ) =================
   Çizim Araçları düğmelerini BASILI TUTUP SÜRÜKLEYEREK yerleri değiştirilir,
   sıra hafızada tutulur (localStorage) ve her açılışta aynen uygulanır. */
(function(){
  var d=document, KEY="ayb_arac_sira_draw_v1", drag=null;
  function row(){ return d.querySelector(".ayb-pro-group.draw .ayb-pro-row"); }
  function items(r){ return Array.prototype.slice.call(r.children).filter(function(c){ return c.id!=="aybCizimBar"; }); }
  function kimlik(el){
    try{ if(el.dataset&&el.dataset.tool) return "t:"+el.dataset.tool; }catch(e){}
    if(el.id) return "i:"+el.id;
    var sm=el.querySelector?el.querySelector("small"):null;
    return "s:"+((sm&&sm.textContent)||el.textContent||"").trim();
  }
  function kaydet(){ var r=row(); if(!r) return; try{ localStorage.setItem(KEY, JSON.stringify(items(r).map(kimlik))); }catch(e){} }
  function uygula(){
    var r=row(); if(!r) return;
    var sira=null; try{ sira=JSON.parse(localStorage.getItem(KEY)||"null"); }catch(e){}
    if(!sira||!sira.length) return;
    var mevcut=items(r), map={};
    mevcut.forEach(function(el){ var k=kimlik(el); if(!(k in map)) map[k]=el; });
    sira.forEach(function(k){ if(map[k]) r.appendChild(map[k]); });
    mevcut.forEach(function(el){ if(sira.indexOf(kimlik(el))<0) r.appendChild(el); });
    var cb=d.getElementById("aybCizimBar"); if(cb&&cb.parentElement===r) r.appendChild(cb);
  }
  function hedefBul(r,x){
    var its=items(r);
    for(var i=0;i<its.length;i++){ if(its[i]===drag.el) continue;
      var b=its[i].getBoundingClientRect();
      if(x < b.left+b.width/2) return its[i];
    }
    return null;
  }
  function blokla(e){ if(drag&&drag.aktif&&e.cancelable) e.preventDefault(); }
  function aktifEt(){
    if(!drag||drag.aktif) return; drag.aktif=true;
    try{ clearTimeout(drag.timer); }catch(e){}
    try{ if(navigator.vibrate) navigator.vibrate(25); }catch(e){}
    try{ if(drag.pid!=null&&drag.el.setPointerCapture) drag.el.setPointerCapture(drag.pid); }catch(e){}
    var el=drag.el;
    el.style.transform="scale(1.08)"; el.style.boxShadow="0 6px 16px rgba(0,0,0,.35)";
    el.style.position="relative"; el.style.zIndex="99"; el.style.opacity="0.9"; el.style.cursor="grabbing";
    d.addEventListener("touchmove", blokla, {passive:false});
  }
  function tasi(x){
    var r=row(); if(!r||!drag||!drag.aktif) return;
    var hedef=hedefBul(r,x);
    if(hedef){ if(drag.el.nextElementSibling!==hedef) r.insertBefore(drag.el,hedef); }
    else { var cb=d.getElementById("aybCizimBar");
      if(cb&&cb.parentElement===r){ if(drag.el.nextElementSibling!==cb) r.insertBefore(drag.el,cb); }
      else if(r.lastElementChild!==drag.el) r.appendChild(drag.el);
    }
  }
  function birak(){
    if(!drag) return;
    try{ clearTimeout(drag.timer); }catch(e){}
    var aktifti=drag.aktif, el=drag.el;
    try{ if(drag.pid!=null&&drag.el.releasePointerCapture) drag.el.releasePointerCapture(drag.pid); }catch(e){}
    if(aktifti){
      el.style.transform=""; el.style.boxShadow=""; el.style.position=""; el.style.zIndex=""; el.style.opacity=""; el.style.cursor="";
      kaydet();
      var yut=function(ev){ try{ ev.stopPropagation(); ev.preventDefault(); }catch(e){} kaldir(); };
      var kaldir=function(){ try{ d.removeEventListener("click",yut,true); }catch(e){} };
      d.addEventListener("click",yut,true);
      setTimeout(kaldir,400);
      try{ (window.hint||function(){})("Araç sırası kaydedildi"); }catch(e){}
    }
    try{ d.removeEventListener("touchmove", blokla); }catch(e){}
    drag=null;
  }
  d.addEventListener("pointerdown", function(e){
    if(e.button!==undefined && e.button!==0) return;
    var r=row(); if(!r) return;
    var el=(e.target&&e.target.closest)?e.target.closest(".ayb-pro-btn"):null;
    if(!el||el.parentElement!==r) return;
    var mouse=(e.pointerType!=='touch');
    drag={el:el,startX:e.clientX,startY:e.clientY,aktif:false,pid:e.pointerId,mouse:mouse,
      timer:setTimeout(aktifEt,mouse?300:350)};
  }, true);
  d.addEventListener("pointermove", function(e){
    if(!drag) return;
    if(!drag.aktif){
      var dx=Math.abs(e.clientX-drag.startX), dy=Math.abs(e.clientY-drag.startY);
      /* PC (fare/kalem): bekleme YOK — 6px hareketle sürükleme hemen başlar.
         Dokunmatik: erken kayma = şerit kaydırma; sürükleme için basılı tut. */
      if(drag.mouse){ if(dx>6||dy>6) aktifEt(); }
      else if(dx>12||dy>12){ try{clearTimeout(drag.timer);}catch(_){} drag=null; }
      return;
    }
    if(e.cancelable) e.preventDefault();
    tasi(e.clientX);
  }, true);
  d.addEventListener("pointerup", birak, true);
  d.addEventListener("pointercancel", birak, true);
  d.addEventListener("contextmenu", function(e){ if(drag&&drag.aktif){ e.preventDefault(); } }, true);
  if(!d.getElementById("aybSiralaCss")){
    var st=d.createElement("style"); st.id="aybSiralaCss";
    st.textContent=".ayb-pro-group.draw .ayb-pro-btn{-webkit-user-select:none;user-select:none;cursor:grab;-webkit-app-region:no-drag;}"+
      "#aybOfficeRibbon,.ayb-pro-row,.ayb-pro-btn,#aybRibbonTabs{-webkit-app-region:no-drag;}";
    (d.head||d.documentElement).appendChild(st);
  }
  var lastN=-1, n=0, iv=setInterval(function(){
    try{
      var r=row(); if(!r){ if(++n>80) clearInterval(iv); return; }
      if(!drag){ var c=r.children.length; if(c!==lastN){ lastN=c; uygula(); } }
      if(++n>80) clearInterval(iv);
    }catch(e){}
  }, 700);
})();

/* ================= KULLANIM KILAVUZU (İSTEK: Bayram YARAŞ) =================
   Kısayol tuşları + kullanım kılavuzu PROGRAM İÇİNDE: Rapor/Veri şeridinde
   📖 Kılavuz düğmesi; pencereden TXT olarak da kaydedilebilir.
   Ayrıca PC klasöründe KULLANIM_KILAVUZU.txt hazır gelir. */
(function(){
  var d=document;
  var B=[
    ["KISAYOL TUŞLARI (PC KLAVYE)",[
      "D  : Son direk bilgisiyle direk atma (seri giriş)   |   Ctrl+D : Menüyle direk",
      "T  : Son trafo bilgisiyle trafo atma                |   Ctrl+T : Menüyle trafo",
      "H  : Havai hat çekme (son hat bilgisiyle)           |   Ctrl+H : Menüyle hat",
      "A / M : Yeraltı kablosu çekme                       |   Ctrl+A : Menüyle yeraltı",
      "K  : Kofre atma          |  Ctrl+K : Menüyle kofre",
      "L  : Lamba atma          |  Ctrl+L : Menüyle lamba",
      "N  : Not atma            |  Ctrl+N : Menüyle not",
      "G  : Hat etiketlerini gizle / göster      Y : Etiketleri aç",
      "Q  : Kesit değiştirme (başlangıç ve bitiş objesine tıkla, form açılır)",
      "Enter : Serbest çizimi bitir (kanal, bina, çizgi, ok)",
      "ESC   : Aktif işlemi iptal et",
      "NOT: İmleç bir yazı kutusundayken kısayollar çalışmaz; önce haritaya tıkla."
    ]],
    ["ÇİZİM VE BİTİRME",[
      "Tüm çizim araçları Çizim Araçları sekmesindedir.",
      "Bir araca tıklayınca haritanın üst ortasında TURUNCU MOD ÇUBUĞU açılır",
      "(Taşıma Modu'ndaki çubuğun aynısı): ✏ DİREK MODU ✔ Bitir ✖ İptal.",
      "✔ Bitir: işlemi bitirir ve aracı kapatır. ✖ İptal / ESC: yarım işlemi iptal eder.",
      "Hat ve kanal çizerken ÇİFT TIK da çizimi bitirir."
    ]],
    ["ARAÇLARIN YERİNİ ÖZELLEŞTİRME",[
      "PC: Çizim Araçları'nda bir düğmeyi FARE İLE TUTUP hemen sağa-sola sürükle.",
      "Tablet: düğmeyi yarım saniye basılı tut, sonra sürükle.",
      "Bıraktığın yer kaydedilir; program her açılışta senin sıranla gelir."
    ]],
    ["TAŞIMA MODU",[
      "Objeye tıkla, Taşı de: taşıma modu açılır, menü bir daha gelmez.",
      "Peş peşe istediğin kadar direk/trafo/obje taşı.",
      "Direk taşırken bağlı hatlar CANLI birlikte hareket eder.",
      "Bitirmek için: farede SAĞ TIK, tablette UZUN BAS, üstteki ✔ Bitir veya ESC."
    ]],
    ["NUMARALANDIRMA (OTO NO)",[
      "Normal şebeke direkleri: A01, A02... B01... (kol harfi + sıra).",
      "AYD (aydınlatma) direkleri: SA01, SB01... (S + kol harfi + sıra)."
    ]],
    ["GÜNÜN ÖZETİ VE TRAFO BAZINDA SAYIM",[
      "Rapor/Veri sekmesinde Günün Özeti: bugün ve toplam takılan lamba, direk sayısı.",
      "TRAFO BAZINDA sayım SADECE HAT BAĞLANTISINA göre yapılır:",
      "her trafo kendi kollarındaki ve dallarındaki direkleri sayar.",
      "Hatla hiçbir trafoya bağlı olmayan direkler (trafo olmayan bölge) olarak ayrı yazılır.",
      "🎨 Bölgeleri Haritada Göster: her trafonun saydığı direkler kendi renginde,",
      "trafosuz bölge gri görünür. Excel İndir 5 sayfalı rapor verir."
    ]],
    ["SAHA - OFİS VERİ ALIŞVERİŞİ",[
      "Paket Dış: gönderilecek paket (MIF katmanları + aybproje.json tam veri).",
      "Tablette WhatsApp tan gelen json/zip dosyasına dokun, BY EDŞ Saha ile aç:",
      "açık projeye OTOMATİK BİRLEŞİR. Mükerrer kayıtta GÜNCEL VERİ KAZANIR.",
      "PC de Belgeler\\BY_EDS_Saha\\Gelen klasörüne bırakılan dosya otomatik alınır."
    ]],
    ["TAM İÇE AL (HER TÜRDEN DOSYA OKUMA)",[
      "Rapor/Veri sekmesindeki 📥 Tam İçe Al TEK düğmedir; dosya ne olursa olsun",
      "tanır ve AÇIK PROJEYE BİRLEŞTİRİR. Desteklenen dosyalar:",
      "  • MIF paketi (.zip)     : Paket Dış ile üretilen katman arşivinin tamamı.",
      "  • MIF + MID çifti       : İkisini BİRLİKTE seç (Ctrl ile iki dosyayı işaretle).",
      "                            Tek başına .mif seçilirse öznitelikler gelmez.",
      "  • Proje paketi (.json)  : Paket Dış / Gelen klasörü dosyaları.",
      "  • Proje yedeği (.json)  : Yedek klasörü dosyaları ve {app,project} sarmalı.",
      "  • GeoJSON (.geojson)    : Direk, hat, kanal, serbest çizim ve alanların hepsi.",
      "  • KML / KMZ (.kml/.kmz) : Programın kendi ürettiği dosyalar BİREBİR geri gelir.",
      "  • Sembollü KMZ          : Sembollerle dışa verilen dosya da birebir geri gelir.",
      "Dosyayı sürükleyip harita üzerine bırakmak da aynı işi yapar."
    ]],
    ["İÇE ALINCA OTOMATİK O BÖLGEYE GİTME",[
      "İçe alma biter bitmez harita KENDİLİĞİNDEN dosyanın bölgesine gider ve",
      "gelen verinin tamamını ekrana sığdırır; veriyi haritada aramazsın.",
      "Odak SADECE YENİ GELEN veriye göre kurulur: projede başka bölgede eski",
      "veri olsa bile ekran onlara göre uzaklaşmaz.",
      "Tüm yollarda aynıdır: Tam İçe Al (MIF zip, MIF+MID, .json paket/yedek,",
      "GeoJSON, KML/KMZ, sembollü KMZ), sürükle-bırak, WhatsApp ile açma ve",
      "PC deki Gelen klasörü otomatik alımı.",
      "Tek noktalı dosyada en fazla 19 kademeye yaklaşır, boş ekranda kalmaz.",
      "Hepsi mükerrer çıksa bile harita yine o bölgeye gider."
    ]],
    ["SEMBOLLER ZOOM DA YERİNDE DURUR",[
      "Uzaklaştıkça semboller küçülür ama BULUNDUKLARI NOKTADAN AYRILMAZ.",
      "Her sembol kendi tutunma noktasına göre küçülüp büyür",
      "(trafo tabanı, direk merkezi).",
      "Trafo, direk, kofre, box, abone ve ek muf her zoom kademesinde tam yerinde."
    ]],
    ["SEMBOL FONTU (B_CAD.ttf) — 3. DOSYA",[
      "GitHub paketinde 3 dosya vardır: AYB_Saha_Harita.html, ayb-tablet.js ve",
      "B_CAD.ttf. Üçü de gereklidir.",
      "B_CAD.ttf direk / trafo / kofre / box sembollerinin B Pro ile BİREBİR aynı",
      "görünmesini sağlayan fonttur; programın içine gömülü DEĞİLDİR.",
      "AYB_Saha_Harita.html ile AYNI KLASÖRDE durmak zorundadır.",
      "Güncellerken üç dosyayı da aynı klasöre, eskilerin üzerine kopyala.",
      "Font eksikse açılışta kırmızı uyarı çıkar; kapatıp çalışabilirsin ama",
      "semboller doğru görünmez. Dosyayı yerine koyup programı yeniden aç."
    ]],
    ["ÇEVRİMDIŞI ÖNBELLEK VE GÜNCELLEME (TABLET)",[
      "Tablet, internetsiz çalışabilmek için program dosyalarını cihazda saklar.",
      "Saklanan dosyalara sembol fontu ve ayb-tablet.js de dahildir; internetsiz",
      "ilk açılışta bile semboller B Pro fontuyla gelir.",
      "Önbellek sürüm damgalıdır: yeni sürüm kurulunca eski önbellek silinir,",
      "tablet ESKİ programda takılı kalmaz.",
      "Harita kareleri önbelleğe yazılmaz; depo boşuna dolmaz.",
      "Yeni sürüm inince bildirim çıkar. İş yarıda kesilmesin diye program",
      "kendiliğinden yenilenmez; kapatıp açınca yeni sürüm çalışır."
    ]],
    ["BİREBİR GERİ ALMA VE MÜKERRER KONTROLÜ",[
      "Dışa verilen her yer imine görünmeyen öznitelik bloğu (KATMAN/TIP/AD/ID/JSON)",
      "yazılır. Google Earth görüntüsü DEĞİŞMEZ; dosyayı geri aldığında direk no,",
      "genel tip, alt tip, kesit, durum, lamba gibi TÜM alanlar kaybolmadan gelir.",
      "Kanal çizgisi kanal, bina/alan poligonu alan olarak geri döner.",
      "Aynı dosya ikinci kez alınırsa hiçbir şey kopyalanmaz: noktalar konum ve",
      "numaraya, hatlar uç noktalarına, çizim/kanal/alan başlangıç-bitişine bakılır.",
      "Sonuçta '... • N mükerrer atlandı' bilgisi ekranda görünür."
    ]],
    ["YEDEK VE SİLME",[
      "Otomatik yedek: Belgeler\\BY_EDS_Saha\\Yedek klasörü, günde 1 dosya, en çok 30 adet.",
      "Proje ekranındaki Sil düğmesi ONAY sorar; açık proje silinemez."
    ]],
    ["DIŞA AKTARIM (DXF / MIF)",[
      "DXF: direk sembolleri B_CAD fontuyla B Pro ile birebir aynıdır;",
      "MEVCUT/YENI/YAKIN/ILERDE/TADILAT BYSK durumuna göre sembol değişir;",
      "SOKULEN sembolün üstüne KIRMIZI ÇARPI koyar.",
      "Trafo sembolü türe göre çizilir: direk tipi, bina tipi, beton köşk.",
      "Hat yazısı: KESİT hattın üstünde, METRE altında.",
      "MIF: çizilen HER obje tipi katman olarak dışa verilir (direk, hat, trafo,",
      "box, kofre, abone, ek müf, kanal).",
      "GeoJSON: noktalar ve hatlarla birlikte kanal, serbest çizim ve alanlar da yazılır.",
      "Baskı ekranındaki DXF Dışa Ver ile normal DXF aracı BİREBİR aynı çıktıyı verir.",
      "Dışa verilen her dosya 📥 Tam İçe Al ile aynen geri okunabilir."
    ]],
    ["SÜRÜM KONTROLÜ",[
      "Kurulu sürüm program başlığında yazar (PERF-... etiketi).",
      "Yeni paket kurduktan sonra başlıktan doğrula; eski yazıyorsa eski klasör açılmıştır."
    ]]
  ];
  function duzMetin(){
    var L=[];
    L.push("BY EDŞ SAHA PROGRAMI — KULLANIM KILAVUZU VE KISAYOLLAR");
    L.push("Hazırlayan: Bayram YARAŞ   ·   Sürüm: "+(window.AYB_SURUM||"(başlıkta yazar)"));
    L.push("");
    B.forEach(function(bl){
      L.push(bl[0]); L.push(new Array(bl[0].length+1).join("="));
      bl[1].forEach(function(x){ L.push(x); });
      L.push("");
    });
    return L.join("\r\n");
  }
  function panel(){
    var el=d.getElementById("aybKilavuzPanel");
    if(el) return el;
    el=d.createElement("div"); el.id="aybKilavuzPanel";
    el.style.cssText="position:fixed;inset:0;z-index:6200;background:rgba(15,23,42,.55);display:none;align-items:center;justify-content:center;padding:16px;";
    var html=
      '<div style="background:#fff;border-radius:16px;max-width:760px;width:100%;max-height:88vh;display:flex;flex-direction:column;box-shadow:0 18px 50px rgba(0,0,0,.45);overflow:hidden;">'+
        '<div style="display:flex;justify-content:space-between;align-items:center;padding:14px 18px;border-bottom:1px solid #e2e8f0;">'+
          '<div style="font-size:17px;font-weight:800;color:#0f766e;">📖 Kullanım Kılavuzu ve Kısayollar</div>'+
          '<div id="aybKlvzKapaX" style="cursor:pointer;font-size:20px;color:#64748b;font-weight:800;">✕</div></div>'+
        '<div id="aybKlvzGovde" style="overflow:auto;padding:14px 18px;font-size:13.5px;line-height:1.6;color:#0f172a;"></div>'+
        '<div style="display:flex;gap:8px;padding:12px 18px;border-top:1px solid #e2e8f0;">'+
          '<button id="aybKlvzTxt" style="flex:1;border:none;border-radius:10px;background:#16a34a;color:#fff;padding:11px;font-size:14px;font-weight:700;cursor:pointer;">📄 TXT Olarak Kaydet</button>'+
          '<button id="aybKlvzKapat" style="flex:1;border:1px solid #cbd5e1;border-radius:10px;background:#fff;color:#475569;padding:11px;font-size:14px;font-weight:700;cursor:pointer;">Kapat</button></div>'+
      '</div>';
    el.innerHTML=html;
    d.body.appendChild(el);
    var g=el.querySelector("#aybKlvzGovde"), parca="";
    parca+='<div style="font-size:12px;color:#64748b;margin-bottom:10px;">Hazırlayan: Bayram YARAŞ · Sürüm: '+(window.AYB_SURUM||"")+'</div>';
    B.forEach(function(bl){
      parca+='<div style="font-weight:800;color:#0f766e;margin:12px 0 4px;border-bottom:2px solid #ccfbf1;padding-bottom:2px;">'+bl[0]+'</div>';
      bl[1].forEach(function(x){ parca+='<div style="padding:1.5px 0;white-space:pre-wrap;">'+x+'</div>'; });
    });
    g.innerHTML=parca;
    function kapat(){ el.style.display="none"; }
    el.querySelector("#aybKlvzKapaX").onclick=kapat;
    el.querySelector("#aybKlvzKapat").onclick=kapat;
    el.querySelector("#aybKlvzTxt").onclick=function(){
      var metin=duzMetin();
      try{ if(window.aybShareFile){ window.aybShareFile("KULLANIM_KILAVUZU.txt", new Blob(["\ufeff"+metin],{type:"text/plain;charset=utf-8"}), "text/plain"); return; } }catch(e){}
      try{
        var b=new Blob(["\ufeff"+metin],{type:"text/plain;charset=utf-8"});
        var a=d.createElement("a"); a.href=URL.createObjectURL(b); a.download="KULLANIM_KILAVUZU.txt";
        d.body.appendChild(a); a.click();
        setTimeout(function(){ try{ URL.revokeObjectURL(a.href); a.remove(); }catch(e){} },1500);
      }catch(e){}
    };
    return el;
  }
  window.aybKilavuzAc=function(){ panel().style.display="flex"; };
  function injectBtn(){
    if(d.getElementById("aybKilavuzBtn")) return true;
    var r=d.querySelector(".ayb-pro-group.report .ayb-pro-row");
    if(!r) return false;
    var b=d.createElement("button");
    b.type="button"; b.id="aybKilavuzBtn"; b.className="ayb-pro-btn toolbtn"; b.title="Kullanım kılavuzu ve kısayol tuşları";
    b.innerHTML='<div class="ayb-pro-ico" style="font-size:18px">📖</div><small>Kılavuz</small>';
    b.addEventListener("click", function(e){ e.preventDefault(); e.stopPropagation(); window.aybKilavuzAc(); });
    r.appendChild(b);
    return true;
  }
  var n=0, iv=setInterval(function(){ if(injectBtn()||++n>60) clearInterval(iv); }, 700);
})();

/* ================= SNAP AYARI (İSTEK: Bayram YARAŞ) =================
   Snap artık METRE cinsinden: direğe gerçek dünyada bu mesafeden fazla
   yaklaşmadan hat YAPIŞMAZ (zoom ne olursa olsun). Rapor/Veri -> 🧲 Snap. */
(function(){
  var d=document;
  window.aybSnapPanel=function(){
    var eski=d.getElementById('aybSnapPanel'); if(eski) eski.remove();
    var mev=0.75; try{ var v=parseFloat(localStorage.getItem('ayb_snap_m')||''); if(isFinite(v)&&v>0) mev=v; }catch(e){}
    var el=d.createElement('div'); el.id='aybSnapPanel';
    el.style.cssText='position:fixed;inset:0;z-index:6300;background:rgba(15,23,42,.55);display:flex;align-items:center;justify-content:center;padding:16px;';
    el.innerHTML='<div style="background:#fff;border-radius:16px;max-width:380px;width:100%;padding:18px;box-shadow:0 18px 50px rgba(0,0,0,.45);">'+
      '<div style="font-size:16px;font-weight:800;color:#0f766e;margin-bottom:6px;">🧲 Snap (Yapışma) Ayarı</div>'+
      '<div style="font-size:12.5px;color:#475569;margin-bottom:12px;line-height:1.5;">Hat çizerken direğe YAPIŞMA mesafesi — GERÇEK METRE cinsinden, zoomdan bağımsız. Bu mesafenin İÇİNE tek tık = direğe bağlanır; DIŞINA tek tık = kırık nokta. Varsayılan: 0.75 m.</div>'+
      '<div style="display:flex;align-items:center;gap:12px;margin-bottom:6px;">'+
        '<input id="aybSnapRange" type="range" min="0.25" max="5" step="0.25" value="'+mev+'" style="flex:1;">'+
        '<div id="aybSnapVal" style="width:64px;text-align:center;font-weight:800;font-size:16px;color:#0f172a;">'+mev+' m</div>'+
      '</div>'+
      '<div style="display:flex;gap:8px;margin-top:12px;">'+
        '<button id="aybSnapKaydet" style="flex:1;border:none;border-radius:10px;background:#16a34a;color:#fff;padding:11px;font-size:14px;font-weight:800;cursor:pointer;font-family:inherit;">Kaydet</button>'+
        '<button id="aybSnapSifirla" style="flex:1;border:1px solid #cbd5e1;border-radius:10px;background:#fff;color:#475569;padding:11px;font-size:14px;font-weight:700;cursor:pointer;font-family:inherit;">Varsayılan</button>'+
        '<button id="aybSnapKapat" style="flex:1;border:1px solid #cbd5e1;border-radius:10px;background:#fff;color:#475569;padding:11px;font-size:14px;font-weight:700;cursor:pointer;font-family:inherit;">Kapat</button>'+
      '</div></div>';
    d.body.appendChild(el);
    var rg=el.querySelector('#aybSnapRange'), vl=el.querySelector('#aybSnapVal');
    rg.addEventListener('input', function(){ vl.textContent=rg.value+' m'; });
    el.querySelector('#aybSnapKapat').onclick=function(){ el.remove(); };
    el.querySelector('#aybSnapSifirla').onclick=function(){ try{ localStorage.removeItem('ayb_snap_m'); }catch(e){} el.remove(); try{ (window.hint||function(){})('Snap varsayılana döndü (0.75 m)'); }catch(e){} };
    el.querySelector('#aybSnapKaydet').onclick=function(){ try{ localStorage.setItem('ayb_snap_m', String(parseFloat(rg.value)||0.75)); }catch(e){} el.remove(); try{ (window.hint||function(){})('Snap: '+rg.value+' metre olarak kaydedildi'); }catch(e){} };
  };
  function inj(){
    if(d.getElementById('aybSnapBtn')) return true;
    /* İSTEK (Bayram YARAŞ): ayar işlemleri Rapor/Veri'de DEĞİL, AYARLAR sekmesinde durur */
    var r=d.querySelector('.ayb-pro-group.fielddata .ayb-pro-row');
    if(!r) return false;
    var b=d.createElement('button');
    b.type='button'; b.id='aybSnapBtn'; b.className='ayb-pro-btn toolbtn'; b.title='Hat çizerken direğe yapışma mesafesi (metre)';
    b.innerHTML='<div class="ayb-pro-ico" style="font-size:18px">🧲</div><small>Snap</small>';
    b.addEventListener('click', function(e){ e.preventDefault(); e.stopPropagation(); window.aybSnapPanel(); });
    r.appendChild(b);
    return true;
  }
  var n=0, iv=setInterval(function(){ if(inj()||++n>60) clearInterval(iv); }, 700);
})();

/* ================= B PRO SEMBOL AYARI (İSTEK: Bayram YARAŞ) =================
   Haritadaki direk/box/kofre sembolleri B_CAD fontundan (B Pro ile birebir).
   Ayarlar sekmesindeki bu düğme aç/kapat yapar. */
(function(){
  var d=document;
  function durum(){ try{ return localStorage.getItem('ayb_bpro_sembol')!=='0'; }catch(e){ return true; } }
  function etiket(b){ var sm=b.querySelector('small'); if(sm) sm.textContent=durum()?'B Pro: AÇIK':'B Pro: KAPALI'; }
  function inj(){
    if(d.getElementById('aybBcadBtn')) return true;
    var r=d.querySelector('.ayb-pro-group.fielddata .ayb-pro-row');
    if(!r) return false;
    var b=d.createElement('button');
    b.type='button'; b.id='aybBcadBtn'; b.className='ayb-pro-btn toolbtn';
    b.title='Direk/box/kofre sembolleri B Pro (B_CAD) fontuyla çizilsin';
    b.innerHTML='<div class="ayb-pro-ico" style="font-family:BCAD,Arial;font-size:20px">R</div><small></small>';
    etiket(b);
    b.addEventListener('click', function(e){
      e.preventDefault(); e.stopPropagation();
      try{ localStorage.setItem('ayb_bpro_sembol', durum()?'0':'1'); }catch(err){}
      etiket(b);
      try{ if(window.aybForceFullRender) window.aybForceFullRender(); else if(window.renderAll) renderAll(); }catch(err){}
      try{ (window.hint||function(){})('B Pro sembolleri: '+(durum()?'AÇIK':'KAPALI')); }catch(err){}
    });
    r.appendChild(b);
    return true;
  }
  var n=0, iv=setInterval(function(){ if(inj()||++n>60) clearInterval(iv); }, 700);
})();

/* ================= CAD EKRANI (İSTEK: Bayram YARAŞ) =================
   AutoCAD ekranına geçiş: tek düğmeyle uydu görüntüsü kapanır, zemin SİYAH olur —
   imar/altlık üzerinde AutoCAD'deki gibi çalışılır. GPS, çizim, altlık ve tüm
   araçlar aynen çalışmaya devam eder. Tekrar basınca uyduya dönülür. */
(function(){
  var d=document, KEY='ayb_cad_ekran';
  function acikMi(){ try{ return localStorage.getItem(KEY)==='1'; }catch(e){ return false; } }
  function cssKur(){
    if(d.getElementById('aybCadEkranCss')) return;
    var st=d.createElement('style'); st.id='aybCadEkranCss';
    st.textContent='#map.ayb-cad-ekran{background:#000!important;}'+
      '#map.ayb-cad-ekran .leaflet-tile-pane{display:none!important;}'+
      'body.ayb-cad-ekran-body{background:#000!important;}';
    (d.head||d.documentElement).appendChild(st);
  }
  function uygula(){
    cssKur();
    var mc=d.getElementById('map');
    var ac=acikMi();
    if(mc) mc.classList.toggle('ayb-cad-ekran', ac);
    try{ d.body.classList.toggle('ayb-cad-ekran-body', ac); }catch(e){}
    var b=d.getElementById('aybCadEkranBtn');
    if(b){ b.textContent=ac?'🖥 CAD: AÇIK':'🖥 CAD Ekranı'; b.classList.toggle('ayb-cad-acik', ac); }
  }
  function inj(){
    if(d.getElementById('aybCadEkranBtn')) return true;
    var uy=d.getElementById('btnBaseOffToggle');
    if(!uy||!uy.parentNode) return false;
    var b=d.createElement('button');
    b.type='button'; b.id='aybCadEkranBtn'; b.className=uy.className||'palette-btn';
    b.title='AutoCAD ekranı: uydu kapanır, zemin siyah olur — imar/altlık üzerinde çalış. GPS çalışmaya devam eder.';
    b.textContent='🖥 CAD Ekranı';
    b.style.cssText='background:#111;color:#7dd3fc;border:1px solid #334155;font-weight:800;';
    b.addEventListener('click', function(e){
      e.preventDefault(); e.stopPropagation();
      try{ localStorage.setItem(KEY, acikMi()?'0':'1'); }catch(err){}
      uygula();
      try{ (window.hint||function(){})(acikMi()?'CAD ekranı AÇIK — siyah zemin, GPS çalışıyor. Uyduya dönmek için tekrar bas.':'CAD ekranı kapandı — uydu görüntüsüne dönüldü.'); }catch(err){}
    });
    uy.parentNode.insertBefore(b, uy.nextSibling);
    uygula();
    return true;
  }
  var n=0, iv=setInterval(function(){ if(inj()||++n>60) clearInterval(iv); }, 700);
})();

/* ================= AÇILIŞ EKRANI (İSTEK: Bayram YARAŞ) =================
   3 saniyelik kişisel açılış: BY logosu, program adı, sürüm, hazırlayan imzası
   ve "Programı Aç / Programı Kapat" düğmeleri (yanlışlıkla açıldıysa kapatılır).
   3 sn sonra kendiliğinden kapanır, şifre/giriş ekranı normal akışında gelir. */
(function(){
  var d=document;
  if(window.__aybSplashKuruldu) return; window.__aybSplashKuruldu=true;
  function kur(){
    if(d.getElementById('aybSplash')) return;
    if(!d.body) return setTimeout(kur,60);
    var el=d.createElement('div'); el.id='aybSplash';
    el.style.cssText='position:fixed;inset:0;z-index:2147483600;background:#0b1220;display:flex;align-items:center;justify-content:center;';
    el.innerHTML='<div style="text-align:center;font-family:system-ui,Arial;max-width:420px;padding:24px;">'+
      '<img src="data:image/png;base64,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" style="width:150px;height:150px;border-radius:26px;box-shadow:0 12px 40px rgba(0,0,0,.6);" alt="BY">'+
      '<div style="margin-top:16px;font-size:24px;font-weight:900;color:#ffd43b;letter-spacing:.5px;">BY EDŞ Saha Programı</div>'+
      '<div id="aybSplashVer" style="margin-top:4px;font-size:13px;color:#7dd3fc;font-weight:700;"></div>'+
      '<div style="margin-top:14px;font-size:15px;color:#e2e8f0;">Hazırlayan</div>'+
      '<div style="font-family:\'Segoe Script\',\'Brush Script MT\',cursive;font-size:30px;color:#fff;margin-top:2px;">Bayram YARAŞ</div>'+
      '<div style="margin-top:10px;font-size:11px;color:#64748b;">© 2026 Bayram YARAŞ — Tüm hakları saklıdır. İzinsiz kopyalanamaz.</div>'+
      '<div style="display:flex;gap:10px;margin-top:20px;justify-content:center;">'+
        '<button id="aybSplashAc" style="border:none;border-radius:10px;background:#16a34a;color:#fff;padding:12px 26px;font-size:15px;font-weight:800;cursor:pointer;">▶ Programı Aç</button>'+
        '<button id="aybSplashKapat" style="border:1px solid #7f1d1d;border-radius:10px;background:#450a0a;color:#fecaca;padding:12px 20px;font-size:15px;font-weight:800;cursor:pointer;">✖ Programı Kapat</button>'+
      '</div>'+
      '<div id="aybSplashSayac" style="margin-top:12px;font-size:11px;color:#475569;">3 sn içinde otomatik açılır…</div>'+
    '</div>';
    d.body.appendChild(el);
    var kalan=3, bitti=false;
    function ac(){ if(bitti) return; bitti=true; try{ el.remove(); }catch(e){} }
    function kapat(){
      bitti=true;
      try{ el.querySelector('#aybSplashSayac').textContent='Kapatılıyor…'; }catch(e){}
      try{ window.close(); }catch(e){}
      setTimeout(function(){
        /* tablet WebView kapatamazsa bilgi ver */
        try{ el.innerHTML='<div style="color:#e2e8f0;font-family:system-ui;font-size:16px;text-align:center;padding:30px;">Pencere kapatılamadı.<br>Tablette GERİ tuşu ile çıkabilirsin.<br><br><button onclick="location.reload()" style="border:none;border-radius:10px;background:#16a34a;color:#fff;padding:10px 20px;font-weight:800;">Programı Aç</button></div>'; }catch(e){}
      }, 700);
    }
    var vN=0, vIv=setInterval(function(){ try{ var vv=window.AYB_SURUM||''; if(vv&&vv.indexOf('PERF')===0){ el.querySelector('#aybSplashVer').textContent=vv; clearInterval(vIv); } }catch(e){} if(++vN>20) clearInterval(vIv); }, 150);
    el.querySelector('#aybSplashAc').addEventListener('click', ac);
    el.querySelector('#aybSplashKapat').addEventListener('click', kapat);
    var iv=setInterval(function(){
      if(bitti){ clearInterval(iv); return; }
      kalan--;
      if(kalan<=0){ clearInterval(iv); ac(); }
      else try{ el.querySelector('#aybSplashSayac').textContent=kalan+' sn içinde otomatik açılır…'; }catch(e){}
    }, 1000);
  }
  kur();
})();

/* ================= KISAYOL SİGORTA (İSTEK: Bayram YARAŞ) =================
   PC'de T=Trafo, D=Direk, H=Hat kısayolları çalışmıyordu: setup() içinde
   tanımsız openAYBInfo referansı hata verip bindAYBShortcutKeys() satırına
   hiç ulaşılamıyordu. Ana hata düzeltildi; bu modül ayrıca SİGORTA:
   kısayollar herhangi bir sebeple bağlanmadıysa kendisi bağlar. */
(function(){
  function kur(){
    try{
      if(window.__aybShortcutBound) return true;
      if(typeof window.bindAYBShortcutKeys==='function'){ window.bindAYBShortcutKeys(); return !!window.__aybShortcutBound; }
    }catch(e){}
    return false;
  }
  var n=0, iv=setInterval(function(){ if(kur()||++n>20) clearInterval(iv); }, 700);
  kur();
})();

/* ===================== SÜRÜM YAZISI (Bayram YARAŞ) =====================
   Sol alttaki rozet KALDIRILDI. Sürüm etiketi üst başlıkta "BY EDŞ Saha Programı"
   yanında görünür (eski v111'in yerinde). */
(function(){
  var TAG='PERF-25.07-AS';
  window.AYB_SURUM=TAG;
  function uygula(){
    try{
      var eski=document.getElementById('aybPerfBadge'); if(eski) eski.remove();
      var t=document.querySelector('.titlebar .title')||document.querySelector('.title');
      if(t){
        /* İSTEK (Bayram YARAŞ): marka BY EDŞ Saha Programı + özel logo */
        var want='BY EDŞ Saha Programı '+TAG+'\u00A0\u00A0\u00A0Hazırlayan Bayram YARAŞ';
        if(t.getAttribute('data-ayb-marka')!==TAG){
          t.textContent=want; /* İSTEK (Bayram YARAŞ): başlıkta TEK logo — köşe logosu yeterli */
          t.setAttribute('data-ayb-marka',TAG);
        }
        /* İSTEK (Bayram YARAŞ): pencere düğmeleri yalnız PC'de görünür ve çalışır */
        try{ var wc=document.querySelector('.titlebar .win-controls'); if(wc) wc.style.display=(window.aybPC&&window.aybPC.pencere)?'flex':'none'; }catch(e){}
      }
    }catch(e){}
  }
  uygula();
  var n=0, iv=setInterval(function(){ uygula(); if(++n>20) clearInterval(iv); }, 700);
})();


/* ===================== SEMBOL FONTU KONTROLÜ (Bayram YARAŞ) =====================
   İSTEK (Bayram YARAŞ): "GİTHUB İÇİNDE SEMBOL FONTU VAR, BUNU DA YÜKLÜYOR MUYUZ?"
   EVET — B_CAD.ttf SEMBOL FONTUDUR ve AYB_Saha_Harita.html ile AYNI KLASÖRDE
   durmak zorundadır; program onu göreceli adresle çağırır:
       @font-face{font-family:'BCAD';src:url('B_CAD.ttf') format('truetype');}
   Font eksik ya da bozuk olursa direk / trafo / kofre / box sembolleri B Pro ile
   AYNI görünmez ve bu SESSİZCE olur — kullanıcı yanlış sembolle metraj çıkarır.
   Bu modül fontu yüklemeyi dener, GERÇEKTEN yüklendi mi diye harf genişliği ölçer
   (B_CAD içinde gerçekten bulunan harflerle) ve yüklenmemişse ekranda net uyarı verir. */
(function(){
  "use strict";
  var HARF='ABCDEFGHKLMNOPQRSTUVWYZ0123456789'; /* B_CAD cmap'inde bulunan harfler */
  var uyarildi=false;
  function yuklendiMi(){
    try{
      var c=document.createElement('canvas'), x=c&&c.getContext&&c.getContext('2d');
      if(!x||!x.measureText) return true;               /* ölçemiyorsak boşuna uyarma */
      function w(f){ x.font='64px '+f; return x.measureText(HARF).width; }
      var m=w('monospace'), sf=w('serif');
      if(!(m>0)||!(sf>0)) return true;                  /* ölçüm yok — uyarma */
      if(Math.abs(m-sf)<0.5) return true;               /* tüm fontlar aynı ölçülüyor — güvenilmez */
      if(Math.abs(w('"BCAD", monospace')-m)>0.5) return true;
      if(Math.abs(w('"BCAD", serif')-sf)>0.5) return true;
      return false;
    }catch(e){ return true; }
  }
  function uyar(){
    if(uyarildi) return; uyarildi=true;
    try{ console.warn('BY EDŞ: SEMBOL FONTU B_CAD.ttf YÜKLENEMEDİ — semboller B Pro ile aynı olmayacak.'); }catch(e){}
    try{
      if(document.getElementById('aybFontUyari')) return;
      var d=document.createElement('div');
      d.id='aybFontUyari';
      d.style.cssText='position:fixed;left:50%;top:70px;transform:translateX(-50%);z-index:100000;'
        +'max-width:660px;width:94vw;padding:12px 42px 12px 14px;border-radius:12px;'
        +'background:#b3261e;color:#fff;font:600 13px/1.5 system-ui,Segoe UI,Arial;'
        +'box-shadow:0 8px 26px rgba(0,0,0,.45)';
      d.innerHTML='<div style="font-size:14px;margin-bottom:4px">SEMBOL FONTU BULUNAMADI: <b>B_CAD.ttf</b></div>'
        +'Direk / trafo / kofre / box sembolleri B Pro ile <b>aynı görünmez</b>.<br>'
        +'<b>B_CAD.ttf</b> dosyasını <b>AYB_Saha_Harita.html</b> ile <b>aynı klasöre</b> koyup programı yeniden açın.';
      var k=document.createElement('button');
      k.type='button'; k.textContent='\u2715';
      k.style.cssText='position:absolute;right:8px;top:8px;width:26px;height:26px;border:0;border-radius:8px;'
        +'background:rgba(255,255,255,.2);color:#fff;font:700 13px system-ui;cursor:pointer';
      k.onclick=function(){ try{ d.remove(); }catch(e){} };
      d.appendChild(k);
      (document.body||document.documentElement).appendChild(d);
    }catch(e){}
  }
  function dene(kalan){
    var bitir=function(){
      if(yuklendiMi()){ window.AYB_SEMBOL_FONTU=true; window.__aybBcadOk=true; return; }
      if(kalan>0){ setTimeout(function(){ dene(kalan-1); }, 1500); return; }
      window.AYB_SEMBOL_FONTU=false; window.__aybBcadOk=false; uyar();
    };
    try{
      if(document.fonts&&document.fonts.load) document.fonts.load('64px "BCAD"','A').then(bitir,bitir);
      else bitir();
    }catch(e){ bitir(); }
  }
  function basla(){ setTimeout(function(){ dene(3); }, 2000); }
  if(document.readyState==='complete') basla(); else window.addEventListener('load', basla);
  /* Elle kontrol: konsoldan aybFontKontrol() */
  window.aybFontKontrol=function(){ uyarildi=false; dene(0); return window.AYB_SEMBOL_FONTU; };
})();


/* ===================== CANLI TAŞIMA v2 — LASTİK BANT (Bayram YARAŞ) =====================
   Direk/trafo/box sürüklenirken bağlı hatlar PARLAK LASTİK BANT olarak objeyle birlikte
   CANLI akar (kayıt sisteminden bağımsız, garantili görünür). Bırakınca bant kalkar,
   gerçek hat yeni yerine oturur. Sürükleme başında "CANLI taşıma: X bağlı hat" bildirimi çıkar. */
(function(){
  "use strict";
  var temps=[], gizli=[];
  function P(){ try{ if(typeof project!=='undefined'&&project) return project; }catch(e){} return window.project||null; }
  function REG(){ try{ if(typeof lineLayers!=='undefined') return lineLayers; }catch(e){} return null; }
  function M(){ return window.__aybMap||window.map||null; }
  function pts(l,p){
    var a=p.objects.find(function(x){return x.id===l.start;}), b=p.objects.find(function(x){return x.id===l.end;});
    if(!a||!b) return null;
    if(Array.isArray(l.points)&&l.points.length>=2){
      var q=l.points.map(function(z){return [+z[0],+z[1]];});
      q[0]=[+a.lat,+a.lng]; q[q.length-1]=[+b.lat,+b.lng];
      return q;
    }
    return [[+a.lat,+a.lng],[+b.lat,+b.lng]];
  }
  function basla(id){
    temizle();
    var p=P(), map=M(); if(!p||!map||!window.L) return 0;
    var n=0;
    (p.lines||[]).forEach(function(l){
      if(!l||(l.start!==id&&l.end!==id)) return;
      var q=pts(l,p); if(!q) return;
      var t=window.L.polyline(q,{color:'#22d3ee',weight:4,opacity:.95,interactive:false}).addTo(map);
      t.__l=l; temps.push(t); n++;
      try{
        var reg=REG(); var pk=reg&&reg.get?reg.get(l.id):null;
        if(pk&&pk.poly&&pk.poly.setStyle){ gizli.push([pk.poly, pk.poly.options.opacity]); pk.poly.setStyle({opacity:0.12}); }
      }catch(e){}
    });
    return n;
  }
  function guncelle(){
    var p=P(); if(!p) return;
    temps.forEach(function(t){ var q=pts(t.__l,p); if(q){ try{ t.setLatLngs(q); }catch(e){} } });
  }
  function temizle(){
    var map=M();
    temps.forEach(function(t){ try{ if(map) map.removeLayer(t); }catch(e){} }); temps=[];
    gizli.forEach(function(g){ try{ g[0].setStyle({opacity:(g[1]==null?1:g[1])}); }catch(e){} }); gizli=[];
  }
  function kur(){
    try{
      if(typeof markers==='undefined'||!markers||!markers.forEach) return;
      markers.forEach(function(m,id){
        if(!m||m.__aybLive2||typeof m.on!=='function') return;
        m.__aybLive2=1;
        m.on('dragstart',function(){
          var n=basla(id);
          try{ if(window.toast) toast('CANLI taşıma: '+n+' bağlı hat takipte'); }catch(e){}
        });
        m.on('drag',function(){
          try{
            var p=P(); var o=p&&p.objects.find(function(x){return x.id===id;});
            if(o){ var ll=m.getLatLng(); o.lat=ll.lat; o.lng=ll.lng; }
            guncelle();
            try{ if(typeof window.updateConnectedLines==='function') window.updateConnectedLines(id); }catch(e){}
          }catch(e){}
        });
        m.on('dragend',function(){
          try{ temizle(); }catch(e){}
          /* KESİN OTURTMA (Bayram YARAŞ): bağlı hatlar 'ekranı yenile' ile aynı
             çizim yolundan, ama SADECE o hatlar için baştan çizilir — geri kaçamaz. */
          try{
            var p=P(); if(!p) return;
            var o=p.objects.find(function(x){return x.id===id;});
            if(o){ var ll=m.getLatLng(); o.lat=ll.lat; o.lng=ll.lng; }
            var map=M(), reg=REG();
            (p.lines||[]).forEach(function(l){
              if(!l||(l.start!==id&&l.end!==id)) return;
              try{
                var q=pts(l,p);
                if(q&&Array.isArray(l.points)&&l.points.length>=2){ l.points[0]=q[0]; l.points[l.points.length-1]=q[q.length-1]; }
                if(q&&typeof window.polyLength==='function') l.length_m=window.polyLength(q);
              }catch(e){}
              try{
                var pk=reg&&reg.get?reg.get(l.id):null;
                if(pk&&map){
                  try{ map.removeLayer(pk.poly); }catch(e){}
                  try{ if(pk.hit) map.removeLayer(pk.hit); }catch(e){}
                  try{ if(pk.label) map.removeLayer(pk.label); }catch(e){}
                  try{ if(pk.region) map.removeLayer(pk.region); }catch(e){}
                  try{ if(Array.isArray(pk.handles)) pk.handles.forEach(function(hm){ try{ map.removeLayer(hm); }catch(_){} }); }catch(e){}
                  try{ reg.delete(l.id); }catch(e){}
                }
                if(typeof window.renderLine==='function') window.renderLine(l);
              }catch(e){}
            });
            try{ if(typeof window.refreshLineLabels==='function') window.refreshLineLabels(); }catch(e){}
            try{ if(typeof window.aybRefreshLampsFor==='function') window.aybRefreshLampsFor([id]); }catch(e){}
            try{ if(typeof window.updateSummary==='function') window.updateSummary(); }catch(e){}
            try{ if(typeof window.saveProject==='function') window.saveProject(); }catch(e){}
            /* TAŞIMA MODU açıkken: bir sonraki obje için sürükleme aktif kalsın */
            try{ if(window.__aybTasimaModu && m.dragging){ setTimeout(function(){ try{ m.dragging.enable(); }catch(e){} }, 30); } }catch(e){}
          }catch(e){}
        });
      });
    }catch(e){}
  }
  setInterval(kur, 1000);
})();


/* ===================== TAŞIMA MODU (Bayram YARAŞ) =====================
   "Taşı" bir kez tıklanır: menü kapanır ve MOD AÇIK kalır — birden fazla obje
   art arda sürüklenip taşınır. Mod boyunca Taşı/Sil menüsü AÇILMAZ.
   Bitirme: PC'de SAĞ TIK, tablette haritaya BASILI TUT, ya da ✔ Taşımayı Bitir. */
(function(){
  "use strict";
  var aktif=false, btn=null, bagli=false;
  function MK(){ try{ if(typeof markers!=='undefined') return markers; }catch(e){} return null; }
  function M(){ return window.__aybMap||window.map||null; }
  function popKapat(){ try{ var map=M(); map&&map.closePopup(); }catch(e){} }
  function tumunuAyarla(ac){
    var mk=MK(); if(!mk||!mk.forEach) return;
    mk.forEach(function(m){
      try{
        if(ac){ if(m.getPopup&&m.getPopup()) m.unbindPopup(); if(m.dragging) m.dragging.enable(); }
        else { if(m.dragging) m.dragging.disable(); }
      }catch(e){}
    });
  }
  function btnGoster(g){
    if(g){
      if(btn) return;
      /* Mod çubuğu: harita ÜST ORTASINDA sabit — her sekmede görünür, tıklaması garanti */
      btn=document.createElement('div');
      btn.id='aybTasiBitirBar';
      btn.style.cssText='position:fixed;left:50%;transform:translateX(-50%);top:150px;z-index:2147483000;display:flex;gap:10px;align-items:center;background:rgba(15,23,42,.92);border:1px solid #f59e0b;border-radius:999px;padding:6px 8px 6px 16px;box-shadow:0 8px 24px rgba(0,0,0,.45);font:700 13px system-ui;color:#fde68a;';
      btn.innerHTML='🖐 TAŞIMA MODU AÇIK <button id="aybTasiBitirBtn" style="height:32px;padding:0 16px;border:none;border-radius:999px;background:#f59e0b;color:#111;font:800 13px system-ui;cursor:pointer;">✔ Bitir</button>';
      var bb=btn.querySelector('#aybTasiBitirBtn');
      ['pointerdown','click','touchend'].forEach(function(ev){
        bb.addEventListener(ev,function(e){ try{e.preventDefault();e.stopPropagation();}catch(_){} kapat(); },true);
      });
      document.body.appendChild(btn);
      if(!window.__aybTasiEsc){
        window.__aybTasiEsc=true;
        document.addEventListener('keydown',function(e){ if(aktif&&(e.key==='Escape'||e.key==='Esc')) kapat(); },true);
      }
    } else if(btn){ try{ btn.remove(); }catch(e){} btn=null; }
  }
  function ac(){
    if(aktif) return;
    aktif=true; window.__aybTasimaModu=true;
    popKapat(); tumunuAyarla(true); btnGoster(true); bagla();
    try{ if(window.hint) hint('TAŞIMA MODU AÇIK: objeleri sürükle-bırak. Bitir: SAĞ TIK / basılı tut / ✔ Taşımayı Bitir.'); }catch(e){}
    try{ if(window.toast) toast('Taşıma modu AÇIK — art arda taşıyabilirsin. Sağ tık = bitir.'); }catch(e){}
  }
  function kapat(){
    if(!aktif) return;
    aktif=false; window.__aybTasimaModu=false;
    tumunuAyarla(false); btnGoster(false); popKapat();
    try{ if(window.hint) hint('Hazır. Direk / Hat / Kanal aracını seç.'); }catch(e){}
    try{ if(window.toast) toast('Taşıma modu kapatıldı.'); }catch(e){}
  }
  function bagla(){
    if(bagli) return; var map=M(); if(!map) return; bagli=true;
    map.on('contextmenu', function(e){
      if(!aktif) return;
      try{ if(e.originalEvent){ e.originalEvent.preventDefault(); e.originalEvent.stopPropagation(); } }catch(_){}
      kapat();
    });
    try{
      var c=map.getContainer(), t=null, sx=0, sy=0;
      c.addEventListener('touchstart', function(ev){
        if(!aktif) return; if(!ev.touches||ev.touches.length!==1) return;
        var p=ev.touches[0]; sx=p.clientX; sy=p.clientY;
        t=setTimeout(function(){ t=null; kapat(); }, 700);
      }, {passive:true});
      c.addEventListener('touchmove', function(ev){
        if(!t) return; var p=ev.touches&&ev.touches[0];
        if(p&&(Math.abs(p.clientX-sx)>14||Math.abs(p.clientY-sy)>14)){ clearTimeout(t); t=null; }
      }, {passive:true});
      c.addEventListener('touchend', function(){ if(t){ clearTimeout(t); t=null; } }, {passive:true});
    }catch(e){}
  }
  var n=0, iv=setInterval(function(){
    try{
      if(window.APP && typeof window.APP.moveObject==='function' && !window.APP.__aybTasiModu){
        window.APP.__aybTasiModu=true;
        window.APP.moveObject=function(id){ popKapat(); ac(); };
      }
      if(typeof window.showObjectPopup==='function' && !window.showObjectPopup.__aybTasi){
        var orij=window.showObjectPopup;
        var yeni=function(obj){ if(aktif){ return; } return orij.apply(this,arguments); };
        yeni.__aybTasi=true; window.showObjectPopup=yeni;
      }
    }catch(e){}
    if(++n>240) clearInterval(iv);
  }, 500);
  setInterval(function(){ if(aktif) tumunuAyarla(true); }, 1200);   /* yeni çizilen objeler de moda dahil olsun */
  window.aybTasimaModuKapat=kapat;
})();


/* Sağ alttaki eski '× Bitir' (btnCancelTool): pro şerit varken CSS ile KALICI gizlenir —
   uygulama araç açılınca onu yeniden gösteriyordu, CSS kuralı hepsini bastırır (Bayram YARAŞ). */
(function(){
  var n=0, iv=setInterval(function(){
    try{
      if(!document.getElementById('aybCancelGizle')){
        /* İSTEK (Bayram YARAŞ): GPS sekmesindeki Bitir ve eski palet Bitir'i KOŞULSUZ gizli —
           bitirme artık turuncu mod çubuğundan yapılır */
        var st=document.createElement('style'); st.id='aybCancelGizle';
        st.textContent='#btnCancelTool{display:none!important;}#btnFinish{display:none!important;}';
        (document.head||document.documentElement).appendChild(st);
      }
    }catch(e){}
    if(document.getElementById('aybCancelGizle')||++n>80) clearInterval(iv);
  }, 600);
})();
