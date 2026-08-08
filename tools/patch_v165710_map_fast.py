from pathlib import Path
import re, hashlib

R=Path('.')
H=R/'app/src/main/assets/AYB_Saha_Harita.html'
J=R/'app/src/main/java/com/bayramyaras/aybsaha/MainActivity.java'

s=H.read_text(encoding='utf-8',errors='replace')
j=J.read_text(encoding='utf-8',errors='replace')

# Ana harita motoru gövdesine dokunmuyoruz. Performans ayarları, initMap scriptinden
# hemen önce Leaflet fabrika fonksiyonlarını saran küçük bir katmanla uygulanır.
scripts=list(re.finditer(r'<script(?:\s[^>]*)?>(.*?)</script>',s,re.S|re.I))
core=next((m for m in scripts if 'function initMap()' in m.group(1) and 'function handleMapClick(e)' in m.group(1) and 'function switchBase(v)' in m.group(1)),None)
if not core:
    raise SystemExit('ana harita motor scripti bulunamadi')
core_hash_before=hashlib.sha256(core.group(1).encode()).hexdigest()

perf=r'''<script id="ayb_v5710_map_fast">
(function(){
  if(!window.L || !L.map || !L.tileLayer) return;
  if(window.__aybMapFast5710) return;
  window.__aybMapFast5710=true;

  const _map=L.map;
  L.map=function(id,opt){
    opt=Object.assign({},opt||{});
    /* LED SAHA ile aynı hissiyat: tekerlek 4x daha seri, GPU-dostu zoom. */
    opt.wheelPxPerZoomLevel=60;
    opt.zoomAnimation=true;
    opt.markerZoomAnimation=false;
    opt.fadeAnimation=false;
    /* BY EDŞ çizgileri için Canvas korunur; yalnız aşırı büyük tampon küçültülür. */
    try{
      if(opt.renderer && opt.renderer.options && Number(opt.renderer.options.padding)>0.35)
        opt.renderer.options.padding=0.35;
    }catch(e){}
    return _map.call(L,id,opt);
  };

  const _tile=L.tileLayer;
  L.tileLayer=function(url,opt){
    opt=Object.assign({},opt||{});
    const u=String(url||'');
    if(/google\.com\/vt|arcgisonline\.com|openstreetmap\.org|opentopomap\.org/i.test(u)){
      /* LED SAHA: keepBuffer=2. Eski BY EDŞ değeri 6 idi ve gereğinden çok karo yüklüyordu. */
      opt.keepBuffer=2;
      opt.updateWhenIdle=true;
      opt.updateWhenZooming=false;
    }
    return _tile.call(L,url,opt);
  };
})();
</script>
'''

s=s[:core.start()]+perf+s[core.start():]

# Android WebView zaten manifestte hardwareAccelerated=true. Katmanı da açıkça GPU'ya sabitle.
if 'web.setLayerType(android.view.View.LAYER_TYPE_HARDWARE, null);' not in j:
    needle='        web = new WebView(this);\n        setContentView(web);\n'
    if needle not in j:
        raise SystemExit('WebView olusturma satiri bulunamadi')
    j=j.replace(needle, needle+'        web.setLayerType(android.view.View.LAYER_TYPE_HARDWARE, null);\n',1)

H.write_text(s,encoding='utf-8')
J.write_text(j,encoding='utf-8')

# Core script gövdesi birebir korunmuş olmalı.
s2=H.read_text(encoding='utf-8')
core2=next((m for m in re.finditer(r'<script(?:\s[^>]*)?>(.*?)</script>',s2,re.S|re.I) if 'function initMap()' in m.group(1) and 'function handleMapClick(e)' in m.group(1) and 'function switchBase(v)' in m.group(1)),None)
if not core2:
    raise SystemExit('patch sonrasi ana motor yok')
core_hash_after=hashlib.sha256(core2.group(1).encode()).hexdigest()
if core_hash_before!=core_hash_after:
    raise SystemExit('ana harita motoru degisti')

for x in [
    'id="ayb_v5710_map_fast"',
    'opt.wheelPxPerZoomLevel=60',
    'opt.markerZoomAnimation=false',
    'opt.fadeAnimation=false',
    'opt.renderer.options.padding=0.35',
    'opt.keepBuffer=2',
    'web.setLayerType(android.view.View.LAYER_TYPE_HARDWARE, null);',
]:
    if x not in (s2+j): raise SystemExit('eksik: '+x)

print('core',core_hash_after)
print('v16.57.10 map fast patch OK')
