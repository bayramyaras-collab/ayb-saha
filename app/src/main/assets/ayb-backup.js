/* ============================================================
   AYB Saha - Veri Guvenligi / Otomatik Yedekleme
   Hazirlayan: Bayram YARAS  -  0530 630 05 40
   Veriyi KAYBETMEMEK icin uc katman:
     1) localStorage (programin ana kaydi)
     2) IndexedDB'de son 15 otomatik yedek (farkli depo = ekstra guvence)
     3) Cihazda DOSYA yedek (Android koprusu varsa Belgeler/Indirilenler)
   ============================================================ */
(function () {
  var PREFIX = 'ayb';               // ayb_saha_* anahtarlarini yedekle
  var MAX_SNAP = 15;                // IndexedDB'de saklanacak yedek sayisi
  var AUTO_MS = 120000;             // 2 dakikada bir otomatik yedek
  var lastHash = '';

  // ---------- veri toplama ----------
  function collect() {
    var out = {};
    try {
      for (var i = 0; i < localStorage.length; i++) {
        var k = localStorage.key(i);
        if (k && k.toLowerCase().indexOf(PREFIX) === 0) out[k] = localStorage.getItem(k);
      }
    } catch (e) {}
    return out;
  }
  function pkg() {
    return { app: 'AYB Saha Harita Metraj', imza: 'Bayram YARAS 0530 630 05 40',
             ts: new Date().toISOString(), keys: collect() };
  }
  function hashOf(obj) { var s = JSON.stringify(obj.keys || {}); var h = 0;
    for (var i = 0; i < s.length; i++) { h = (h * 31 + s.charCodeAt(i)) | 0; } return h + '_' + s.length; }

  // ---------- IndexedDB yedek deposu (kendi ayrik veritabanimiz) ----------
  function openDB() {
    return new Promise(function (res, rej) {
      var r = indexedDB.open('ayb_yedek_db', 1);
      r.onupgradeneeded = function () { r.result.createObjectStore('snaps', { keyPath: 'ts' }); };
      r.onsuccess = function () { res(r.result); };
      r.onerror = function () { rej(r.error); };
    });
  }
  function idbPut(snap) {
    return openDB().then(function (db) {
      return new Promise(function (res) {
        var tx = db.transaction('snaps', 'readwrite'); var st = tx.objectStore('snaps');
        st.put(snap);
        // fazlalari sil (en eskiden)
        st.getAllKeys().onsuccess = function (e) {
          var keys = e.target.result || [];
          if (keys.length > MAX_SNAP) keys.sort().slice(0, keys.length - MAX_SNAP).forEach(function (k) { st.delete(k); });
        };
        tx.oncomplete = function () { res(true); };
        tx.onerror = function () { res(false); };
      });
    }).catch(function () { return false; });
  }
  function idbList() {
    return openDB().then(function (db) {
      return new Promise(function (res) {
        var out = []; var tx = db.transaction('snaps', 'readonly');
        tx.objectStore('snaps').openCursor().onsuccess = function (e) {
          var c = e.target.result; if (c) { out.push({ ts: c.value.ts, adet: Object.keys(c.value.keys || {}).length }); c.continue(); }
          else res(out.sort().reverse());
        };
      });
    }).catch(function () { return []; });
  }
  function idbGet(ts) {
    return openDB().then(function (db) {
      return new Promise(function (res) {
        var tx = db.transaction('snaps', 'readonly');
        tx.objectStore('snaps').get(ts).onsuccess = function (e) { res(e.target.result); };
      });
    });
  }

  // ---------- geri yukleme ----------
  function restoreKeys(keys) {
    if (!keys || typeof keys !== 'object') return false;
    // once mevcut durumu guvenlik icin yedekle
    try { idbPut(Object.assign(pkg(), { ts: new Date().toISOString() + '_restore_oncesi' })); } catch (e) {}
    var ok = 0;
    for (var k in keys) { try { localStorage.setItem(k, keys[k]); ok++; } catch (e) {} }
    return ok > 0;
  }

  // ---------- otomatik yedek ----------
  function autoBackup(force) {
    var p = pkg(); var h = hashOf(p);
    if (!force && h === lastHash) return;   // degisiklik yoksa gecme
    lastHash = h;
    idbPut(p);
    // cihaz dosyasina da yaz (Android koprusu varsa) - sessiz
    try {
      if (window.AYBNative && AYBNative.saveBackup) {
        AYBNative.saveBackup('AYB_Yedek_' + p.ts.replace(/[:.]/g, '-') + '.json', JSON.stringify(p));
        AYBNative.saveBackup('AYB_Yedek_SON.json', JSON.stringify(p)); // her zaman en guncel
      }
    } catch (e) {}
    updateInfo();
  }

  // ---------- dosya indir (tarayici / PWA) ----------
  function download(p) {
    try {
      var blob = new Blob([JSON.stringify(p, null, 2)], { type: 'application/json' });
      var a = document.createElement('a');
      a.href = URL.createObjectURL(blob);
      a.download = 'AYB_Yedek_' + p.ts.slice(0, 10) + '.json';
      document.body.appendChild(a); a.click(); a.remove();
    } catch (e) { alert('Dosya indirilemedi.'); }
  }

  // ---------- arayuz ----------
  var info = null;
  function updateInfo() { if (info) info.textContent = 'Son yedek: ' + new Date().toLocaleTimeString('tr-TR'); }
  function ui() {
    var wrap = document.createElement('div');
    wrap.style.cssText = 'position:fixed;left:6px;bottom:34px;z-index:99998;display:flex;flex-direction:column;gap:6px;align-items:flex-start';
    var btn = document.createElement('button');
    btn.textContent = '🛡️ Yedek';
    btn.style.cssText = 'font:700 13px system-ui;padding:9px 13px;border-radius:10px;border:1px solid #24406e;background:#12213f;color:#cfe0ff;cursor:pointer';
    var panel = document.createElement('div');
    panel.style.cssText = 'display:none;flex-direction:column;gap:6px;background:#0d1b34;border:1px solid #24406e;border-radius:12px;padding:10px;box-shadow:0 8px 30px rgba(0,0,0,.5);min-width:210px';
    function b(txt, fn, col) { var x = document.createElement('button');
      x.textContent = txt; x.onclick = fn;
      x.style.cssText = 'font:600 13px system-ui;padding:10px 12px;border-radius:9px;border:1px solid #24406e;background:' + (col || '#12213f') + ';color:#e7eeff;cursor:pointer;text-align:left';
      return x; }
    info = document.createElement('div');
    info.style.cssText = 'color:#9fb4dd;font:600 11px system-ui;padding:2px 2px';
    info.textContent = 'Otomatik yedek acik';
    panel.appendChild(b('💾 Şimdi Yedekle (dosya)', function () { var p = pkg(); autoBackup(true); download(p); }, '#0e2a1e'));
    panel.appendChild(b('📂 Yedekten Geri Yükle (dosya)', restoreFromFile));
    panel.appendChild(b('⏱️ Cihazdaki Otomatik Yedekler', showSnaps));
    panel.appendChild(info);
    btn.onclick = function () { panel.style.display = panel.style.display === 'none' ? 'flex' : 'none'; };
    wrap.appendChild(btn); wrap.appendChild(panel);
    document.body.appendChild(wrap);
  }
  function restoreFromFile() {
    var inp = document.createElement('input'); inp.type = 'file'; inp.accept = '.json,application/json';
    inp.onchange = function () {
      var f = inp.files[0]; if (!f) return;
      var rd = new FileReader();
      rd.onload = function () {
        try {
          var obj = JSON.parse(rd.result);
          var keys = obj.keys || obj;
          if (!confirm('Yedekten geri yüklenecek. Mevcut veriler bu yedekle değişecek. Devam?')) return;
          if (restoreKeys(keys)) { alert('Geri yüklendi. Program yenileniyor.'); location.reload(); }
          else alert('Geri yükleme başarısız (dosya uygun değil).');
        } catch (e) { alert('Dosya okunamadı / bozuk.'); }
      };
      rd.readAsText(f);
    };
    inp.click();
  }
  function showSnaps() {
    idbList().then(function (list) {
      if (!list.length) { alert('Henüz otomatik yedek yok.'); return; }
      var msg = list.slice(0, 10).map(function (s, i) {
        return (i + 1) + ') ' + new Date(s.ts.slice(0, 24)).toLocaleString('tr-TR') + '  (' + s.adet + ' kayıt)';
      }).join('\n');
      var sec = prompt('CIHAZDAKI OTOMATIK YEDEKLER:\n\n' + msg + '\n\nGeri yüklemek için numara yazın (iptal için boş):');
      var n = parseInt(sec, 10);
      if (n >= 1 && n <= list.length) {
        idbGet(list[n - 1].ts).then(function (snap) {
          if (snap && restoreKeys(snap.keys)) { alert('Geri yüklendi. Yenileniyor.'); location.reload(); }
          else alert('Geri yükleme başarısız.');
        });
      }
    });
  }

  // ---------- baslat ----------
  window.addEventListener('load', function () {
    ui();
    autoBackup(true);
    setInterval(function () { autoBackup(false); }, AUTO_MS);
  });
  // uygulamadan cikarken/arka plana alinca da yedekle (veri kaybini onler)
  document.addEventListener('visibilitychange', function () { if (document.hidden) autoBackup(true); });
  window.addEventListener('pagehide', function () { autoBackup(true); });
  window.aybBackupNow = function () { autoBackup(true); };
})();
