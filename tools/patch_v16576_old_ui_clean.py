from pathlib import Path
import re

H=Path('app/src/main/assets/AYB_Saha_Harita.html')
T=Path('app/src/main/assets/ayb-tablet.js')
h=H.read_text(encoding='utf-8',errors='replace')
t=T.read_text(encoding='utf-8',errors='replace')

# 1) Tablet JS icinde basligi tekrar eski PERF/Hazirlayan metnine ceviren iki aktif blogu FIZIKSEL SIL.
patterns=[
  re.compile(r'/\*\s*======\s*UST BASLIK:\s*"BY EDŞ Saha Programı"\s*======\s*\*/\s*\(function\(\)\{.*?\}\)\(\);\s*(?=/\*\s*======\s*ACILISTA)',re.S),
  re.compile(r'/\*\s*=+\s*SÜRÜM YAZISI \(Bayram YARAŞ\)\s*=+.*?\*/\s*\(function\(\)\{.*?\}\)\(\);\s*(?=/\*\s*=+\s*SEMBOL FONTU KONTROLÜ)',re.S),
  re.compile(r'/\*\s*=+\s*\*/\s*/\*\s*BY EDŞ — GPS kartı \+ Lejant:.*?\*/\s*/\*\s*=+\s*\*/\s*\(function\(\)\{.*?\}\)\(\);\s*(?=/\*\s*=+\s*\*/\s*/\*\s*BY EDŞ — Ortadaki)',re.S),
]
for i,p in enumerate(patterns,1):
  t,n=p.subn('',t,count=1)
  if n!=1: raise SystemExit(f'tablet eski blok {i} bulunamadi')

# 2) Eski gorunur marka metinleri tablet JS icinde artik HIC kalmasin.
for x in ['PERF-25.07-AT-U2','Hazırlayan Bayram YARAŞ']:
  if x in t: raise SystemExit('tablet JS eski marka kaldi: '+x)
# Kalan eski Programi ifadeleri baska eski ekran metinleriyse tek marka V57'ye cevir.
t=t.replace('BY EDŞ Saha Programı','BY EDŞ SAHA V57')
t=t.replace('BY EDŞ Saha Programı v16','BY EDŞ SAHA V57')

# 3) Eski surum rozeti kodu ekranda zaten return ile pasifti; bulursak tamamen kaldir.
t=re.sub(r'/\*\s*=+\s*BY EDŞ — SÜRÜM ROZETİ.*?\*/\s*\(function\(\)\{.*?\}\)\(\);\s*','',t,count=1,flags=re.S|re.I)

# 4) Ana HTML'deki SADECE gercek <div class="legend"> DOM'unu fiziksel kaldir.
def balanced_div_remove(s, marker):
  m=re.search(marker,s,re.I)
  if not m: return s,0
  start=m.start(); depth=0
  for x in re.finditer(r'</?div\b[^>]*>',s[start:],re.I):
    z=x.group(0)
    depth += -1 if z.startswith('</') else 1
    if depth==0:
      end=start+x.end()
      return s[:start]+s[end:],1
  raise SystemExit('div kapanisi bulunamadi')

h,n=balanced_div_remove(h,r'<div\b[^>]*class=["\']legend["\'][^>]*>')
if n!=1: raise SystemExit('ana legend DOM bulunamadi')

css='''<style id="ayb_v576_old_ui_cleanup_css">
/* Eski GPS karti acilista gorunmez; GPS gercek veri alininca .gps-live ile acilir. */
#gpsCard:not(.gps-live){display:none!important;}
/* Ana lejant DOM fiziksel olarak silindi. */
.legend{display:none!important;}
</style>'''
if 'id="ayb_v576_old_ui_cleanup_css"' not in h:
  h=h.replace('</head>',css+'\n</head>',1)

# 5) Baslik TEK metin olsun. Tablet JS artik bunu degistirmeyecek.
h=re.sub(r'<title>.*?</title>','<title>BY EDŞ SAHA V57</title>',h,count=1,flags=re.S|re.I)
h=re.sub(r'(<div class="title">).*?(</div>)',r'\1BY EDŞ SAHA V57\2',h,count=1,flags=re.S)

# 6) Eski aktif marka/timer kalintilarinin gercekten gittigini ve yeni ozelliklerin korundugunu dogrula.
for x in ['PERF-25.07-AT-U2','var TAG=\'PERF-25.07-AT-U2\'','data-ayb-marka','aybPerfBadge']:
  if x in t: raise SystemExit('tablet eski surum kalintisi: '+x)
if 'GPS kartı + Lejant: BASILI TUT SÜRÜKLE' in t: raise SystemExit('eski gps/legend timer kaldi')
if re.search(r'<div\b[^>]*class=["\']legend["\'][^>]*>',h,re.I): raise SystemExit('ana legend DOM halen var')
for x in ['function newProject','function openProject','function saveProject','V16.57.3: KIRIK NOKTA KORUMASI','V16.57.4: GUVENLI OTOMATIK NUMARA SECIMI','id="ayb_toast_core_v575"','Otomat Kapağı Yok Kablolar Dışarda','<title>BY EDŞ SAHA V57</title>']:
  if x not in h: raise SystemExit('korunmasi gereken eksik: '+x)

H.write_text(h,encoding='utf-8')
T.write_text(t,encoding='utf-8')
print('v16.57.6 eski arayuz kalintisi temizligi OK')
