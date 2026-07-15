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
      '.titlebar{flex-wrap:wrap!important;}',
      '.ayb-native-clean-workbar{flex-wrap:wrap!important;max-width:100%!important;row-gap:4px;}',
      '.ayb-pro-row{flex-wrap:wrap!important;row-gap:4px;}',
      '[class*="ayb-pro-group"]{max-width:100%!important;}',
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

  /* ---------- 4) DISA AKTAR -> paylas ekrani ---------- */
  if(window.AYBNative && window.AYBNative.exportFile){
    document.addEventListener('click', function(e){
      var a=null;
      if(e.target){ if(e.target.tagName==='A'&&e.target.hasAttribute('download')) a=e.target;
        else if(e.target.closest) a=e.target.closest('a[download]'); }
      if(!a) return;
      var href=a.href||''; if(href.indexOf('blob:')!==0&&href.indexOf('data:')!==0) return;
      var name=a.getAttribute('download')||'AYB_dosya';
      e.preventDefault(); e.stopImmediatePropagation();
      fetch(href).then(function(r){return r.blob();}).then(function(blob){
        var mime=blob.type||'application/octet-stream'; var fr=new FileReader();
        fr.onload=function(){ var s=String(fr.result||''); var i=s.indexOf(','); var b64=i>=0?s.slice(i+1):s;
          try{ AYBNative.exportFile(name,b64,mime); }catch(err){} };
        fr.readAsDataURL(blob);
      }).catch(function(){});
    }, true);
  }

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
    var del=document.createElement('span'); del.textContent='✕'; del.style.cssText='cursor:pointer;font-weight:800;padding:0 4px';
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
  function addNote(){
    var a=loadNotes(); var n={id:'n'+Date.now(), text:'', x:40, y:30};
    a.push(n); saveNotes(a); renderNote(n);
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
    var panel=document.createElement('div');
    panel.style.cssText='display:none;flex-direction:column;gap:6px;background:#0d1b34;border:1px solid #24406e;border-radius:12px;padding:8px;box-shadow:0 8px 30px rgba(0,0,0,.5)';
    function item(txt,fn,col){ var x=document.createElement('button'); x.textContent=txt; x.onclick=fn;
      x.style.cssText='font:600 13px system-ui;padding:9px 12px;border-radius:9px;border:1px solid #24406e;background:'+(col||'#12213f')+';color:#e7eeff;text-align:left;white-space:nowrap'; return x; }
    var temizBtn=item('👁️ Temiz Ekran', function(){ var on=toggleTemiz(); temizBtn.textContent=on?'👁️ Ekrani Goster':'👁️ Temiz Ekran'; });
    panel.appendChild(temizBtn);
    panel.appendChild(item('📝 Not Ekle', addNote, '#3a3300'));
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
    wrap.appendChild(panel); wrap.appendChild(fin); wrap.appendChild(tog);
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

})();
