from pathlib import Path
import re

html=Path('app/src/main/assets/AYB_Saha_Harita.html')
js=Path('app/src/main/assets/ayb-tablet.js')
java=Path('app/src/main/java/com/bayramyaras/aybsaha/MainActivity.java')
strings=Path('app/src/main/res/values/strings.xml')
gradle=Path('app/build.gradle')

# --- HTML: eski sürüm başlığı/marka kalıntıları temizlenir. Proje verisine dokunulmaz. ---
s=html.read_text(encoding='utf-8')
s=s.replace('AYB Saha Harita Metraj v16.40','BY EDŞ Saha Programı PERF-25.07-AT-U2')
s=s.replace('AYB Saha Harita Metraj','BY EDŞ Saha Programı')
s=s.replace('AYB SAHA HARİTA METRAJ','BY EDŞ SAHA PROGRAMI')
s=s.replace('AYB SAHA HARITA METRAJ','BY EDS SAHA PROGRAMI')
s=s.replace('v16.40','v16.59')
s=s.replace('<div class="title">BY EDŞ Saha v16.57</div>','<div class="title">BY EDŞ Saha Programı PERF-25.07-AT-U2</div>')
# Erken çalışma işareti: yanlış/önbellekte eski başlık kalırsa anında güncel başlığa zorlar.
marker='<!-- AYB_V1659_LEGACY_CLEAN -->'
if marker not in s:
    guard="""\n<!-- AYB_V1659_LEGACY_CLEAN -->\n<script>\n(function(){\n  try{ document.title='BY EDŞ Saha Programı'; }catch(e){}\n  function temiz(){\n    try{\n      var t=document.querySelector('.title');\n      if(t && /AYB Saha Harita Metraj|v16\\.40/i.test(t.textContent||'')) t.textContent='BY EDŞ Saha Programı PERF-25.07-AT-U2';\n      document.querySelectorAll('[data-ayb-legacy-ui]').forEach(function(x){x.remove();});\n      try{localStorage.setItem('ayb_ui_mode_v1','office');}catch(e){}\n    }catch(e){}\n  }\n  if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',temiz,{once:true}); else temiz();\n})();\n</script>\n"""
    s=s.replace('</head>',guard+'</head>',1)
html.write_text(s,encoding='utf-8')

# --- Tablet JS: eski marka/metin kalıntıları temizlenir, sürüm etiketi güncellenir. ---
j=js.read_text(encoding='utf-8')
j=j.replace('AYB Saha Harita Metraj','BY EDŞ Saha Programı')
j=j.replace('AYB SAHA HARİTA METRAJ','BY EDŞ SAHA PROGRAMI')
j=j.replace('AYB SAHA HARITA METRAJ','BY EDS SAHA PROGRAMI')
j=j.replace('v16.40','v16.59')
js.write_text(j,encoding='utf-8')

# --- Android WebView: yalnız statik web cache temizlenir; localStorage/IndexedDB/projeler korunur. ---
x=java.read_text(encoding='utf-8')
x=x.replace('s.setCacheMode(WebSettings.LOAD_DEFAULT);','s.setCacheMode(WebSettings.LOAD_NO_CACHE);')
needle='web = new WebView(this);\n        setContentView(web);'
repl='web = new WebView(this);\n        try { web.clearCache(true); } catch (Exception ignored) {}  // v16.59: eski statik arayüz cache temizliği; proje verisini silmez\n        setContentView(web);'
if needle in x and 'v16.59: eski statik arayüz cache temizliği' not in x:
    x=x.replace(needle,repl,1)
# Enjekte edilen tablet JS için cache-buster.
x=x.replace("s.src='file:///android_asset/ayb-tablet.js';","s.src='file:///android_asset/ayb-tablet.js?rev=1659';")
java.write_text(x,encoding='utf-8')

# Uygulama adı eski kurulumla karışmasın.
strings.write_text('<resources>\n    <string name="app_name">BY EDŞ SAHA GÜNCEL</string>\n</resources>\n',encoding='utf-8')

# Sürüm
g=gradle.read_text(encoding='utf-8')
g=re.sub(r'(?m)^(\s*)versionCode\s+\d+\s*$',r'\1versionCode 1659',g,count=1)
g=re.sub(r'(?m)^(\s*)versionName\s+"[^"]+"\s*$',r'\1versionName "16.59"',g,count=1)
gradle.write_text(g,encoding='utf-8')

# Kritik kontrol: eski kullanıcıya görünen v16.40/marka kalmasın.
check=html.read_text(encoding='utf-8')+js.read_text(encoding='utf-8')
if 'AYB Saha Harita Metraj v16.40' in check:
    raise SystemExit('Eski v16.40 başlığı hâlâ mevcut')
print('v16.59 legacy cleanup OK')
