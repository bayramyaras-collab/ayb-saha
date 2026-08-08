from pathlib import Path
import re,sys

H=Path('app/src/main/assets/AYB_Saha_Harita.html')
T=Path('app/src/main/assets/ayb-tablet.js')
h=H.read_text(encoding='utf-8',errors='replace')
t=T.read_text(encoding='utf-8',errors='replace')

def cut_between(text,start_marker,end_marker):
    a=text.find(start_marker)
    if a<0: raise SystemExit('baslangic bulunamadi: '+start_marker)
    b=text.find(end_marker,a)
    if b<0: raise SystemExit('bitis bulunamadi: '+end_marker)
    return text[:a]+text[b:]

# YALNIZ kendi kendine gorunen eski acilis katmanlarini fiziksel kaldir.
# Harita, Leaflet, direk/hat cizim ve GPS motorlarina dokunma.
t=cut_between(t,'/* ================= AÇILIŞ EKRANI','/* ================= KISAYOL SİGORTA')
t=cut_between(t,'/* ===================== SÜRÜM YAZISI','/* ===================== SEMBOL FONTU')
t=cut_between(t,'/* ====== UST BASLIK','/* ====== ACILISTA / PROJE ACILINCA GPS KONUMUNA ORTALA')

# Eski yetkili giris ekrani kendi kendine acilmasin; ayar kodlari yerinde kalir.
t=t.replace('function boot(){ relabelBtn(); removeProjeAyar(); renameSahaTab(); showGiris(); }',
            'function boot(){ relabelBtn(); removeProjeAyar(); renameSahaTab(); }')
t=t.replace('if(!girisAcik()) showGiris();','')

# Kalan modal/ayar marka metinleri tek ada gelsin.
t=t.replace('BY EDŞ Saha Programı','BY EDŞ SAHA V57')
t=t.replace("title||'BY EDŞ Saha'","title||'BY EDŞ SAHA V57'")

# Proje merkezi kendi kendine 450/900 ms sonra acilmayacak.
old='''  function boot(){
    overrideProjectFunctions();
    renderProjectCenter();
    if(!booted){
      booted=true;
      setTimeout(showScreen,450);
    }
  }

  if(d.readyState==="loading") d.addEventListener("DOMContentLoaded",boot);
  else boot();
  window.addEventListener("load",()=>{ setTimeout(boot,200); setTimeout(showScreen,900); });
  setInterval(overrideProjectFunctions,2000);'''
new='''  function boot(){
    overrideProjectFunctions();
    renderProjectCenter();
    if(!booted) booted=true;
  }

  if(d.readyState==="loading") d.addEventListener("DOMContentLoaded",boot);
  else boot();
  window.addEventListener("load",()=>{ setTimeout(boot,200); });
  setInterval(overrideProjectFunctions,2000);'''
if old not in h: raise SystemExit('proje merkezi boot blogu bulunamadi')
h=h.replace(old,new,1)
h=h.replace('<span class="small-muted">Hazırlayan Bayram YARAŞ · 0530 630 05 40</span>','')

# Harita sag-alt eski legend DOM'unu tam ve dengeli olarak sil.
m=re.search(r'<div class="legend" style="display:none">',h,re.I)
if not m: raise SystemExit('ana legend DOM bulunamadi')
start=m.start();depth=0;end=None
for x in re.finditer(r'</?div\b[^>]*>',h[start:],re.I):
    z=x.group(0);depth += -1 if z.startswith('</') else 1
    if depth==0:
        end=start+x.end();break
if end is None: raise SystemExit('legend kapanisi bulunamadi')
h=h[:start]+h[end:]

# Eski GPS durum karti gorsel kalinti olarak hic acilmasin; GPS motoru/konum islevi degismez.
css='<style id="ayb_v577_start_clean">#gpsCard{display:none!important}</style>'
if 'id="ayb_v577_start_clean"' not in h:h=h.replace('</head>',css+'\n</head>',1)

h=re.sub(r'<title>.*?</title>','<title>BY EDŞ SAHA V57</title>',h,count=1,flags=re.S|re.I)
h=re.sub(r'(<div class="title">).*?(</div>)',r'\1BY EDŞ SAHA V57\2',h,count=1,flags=re.S)

# Kesin korumalar
for bad in ['aybSplash','PERF-25.07-AT-U2','setTimeout(showScreen,450)','setTimeout(showScreen,900)']:
    if bad in h or bad in t: raise SystemExit('eski acilis kalintisi: '+bad)
for need in ['<div id="map" class="map"></div>','data-tool="direk"','data-tool="hat"','function newProject','function openProject','function saveProject','V16.57.3: KIRIK NOKTA KORUMASI','V16.57.4: GUVENLI OTOMATIK NUMARA SECIMI','id="ayb_toast_core_v575"']:
    if need not in h: raise SystemExit('korunmasi gereken eksik: '+need)

H.write_text(h,encoding='utf-8')
T.write_text(t,encoding='utf-8')
print('v16.57.7 no-flash patch OK')
