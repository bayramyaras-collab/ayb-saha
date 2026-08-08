from pathlib import Path
import re, hashlib

R=Path('.')
H=R/'app/src/main/assets/AYB_Saha_Harita.html'
T=R/'app/src/main/assets/ayb-tablet.js'
J=R/'app/src/main/java/com/bayramyaras/aybsaha/MainActivity.java'
TH=R/'app/src/main/res/values/themes.xml'

h=H.read_text(encoding='utf-8',errors='replace')
t=T.read_text(encoding='utf-8',errors='replace')
j=J.read_text(encoding='utf-8',errors='replace')
th=TH.read_text(encoding='utf-8',errors='replace')

def cut(s,a,b):
    i=s.find(a); k=s.find(b,i)
    if i<0 or k<0: raise SystemExit('kritik motor siniri bulunamadi: '+a)
    return s[i:k]

# Calisan v16.57.8 harita motorunu kilitle: acilis islemi bunlara dokunamaz.
critical_before={
 'init':hashlib.sha256(cut(h,'function initMap(){','function toolNeedsCrosshair').encode()).hexdigest(),
 'setup':hashlib.sha256(cut(h,'function setup(){',"window.addEventListener('load',setup);").encode()).hexdigest(),
 'click':hashlib.sha256(cut(h,'function handleMapClick(e){','function handleLineObject').encode()).hexdigest(),
 'base':hashlib.sha256(cut(h,'function switchBase(v){','function aybFmtGps').encode()).hexdigest(),
}

BOOT_CSS=r'''<style id="ayb_v579_boot_css">
html,body{background:#050b14!important}
#aybBootFlow{position:fixed;inset:0;z-index:2147483640;background:radial-gradient(circle at 50% 38%,#123b61 0,#071524 37%,#03070d 76%);display:flex;align-items:center;justify-content:center;font-family:system-ui,-apple-system,"Segoe UI",Arial,sans-serif;color:#fff;opacity:1;transition:opacity .24s ease}
#aybBootFlow.ayb-boot-leave{opacity:0;pointer-events:none}
#aybBootEnergy,#aybBootLogin{width:min(360px,88vw);text-align:center}
#aybBootEnergy{display:flex;flex-direction:column;align-items:center;gap:14px}
.ayb-energy-ring{width:112px;height:112px;border-radius:50%;position:relative;border:2px solid rgba(56,189,248,.22);box-shadow:0 0 42px rgba(14,165,233,.18),inset 0 0 38px rgba(14,165,233,.08)}
.ayb-energy-ring:before,.ayb-energy-ring:after{content:"";position:absolute;inset:10px;border-radius:50%;border:3px solid transparent;border-top-color:#38bdf8;border-right-color:#22c55e;animation:aybSpin 1s linear infinite;filter:drop-shadow(0 0 8px #38bdf8)}
.ayb-energy-ring:after{inset:22px;animation-direction:reverse;animation-duration:.72s;border-top-color:#facc15;border-right-color:#60a5fa}
.ayb-energy-bolt{position:absolute;inset:0;display:flex;align-items:center;justify-content:center;font-size:48px;filter:drop-shadow(0 0 12px #facc15);animation:aybPulse .7s ease-in-out infinite alternate}
.ayb-energy-line{height:3px;width:210px;overflow:hidden;border-radius:999px;background:#0b253b;box-shadow:0 0 12px rgba(56,189,248,.25)}
.ayb-energy-line:before{content:"";display:block;height:100%;width:42%;background:linear-gradient(90deg,transparent,#38bdf8,#22c55e,#facc15,transparent);animation:aybFlow .85s linear infinite}
.ayb-boot-title{font-size:22px;font-weight:900;letter-spacing:.4px}.ayb-boot-sub{font-size:12px;color:#94a3b8}
#aybBootLogin{display:none;background:rgba(255,255,255,.98);color:#0f172a;border:1px solid rgba(148,163,184,.55);border-radius:18px;padding:22px;box-shadow:0 24px 70px rgba(0,0,0,.5)}
#aybBootLogin .ayb-login-title{font-size:21px;font-weight:900;color:#0f766e;margin-bottom:3px}#aybBootLogin .ayb-login-sub{font-size:12px;color:#64748b;margin-bottom:15px}
#aybBootPass{width:100%;box-sizing:border-box;border:1px solid #cbd5e1;border-radius:11px;padding:12px;font-size:17px;text-align:center;letter-spacing:4px;outline:none}#aybBootPass:focus{border-color:#0ea5e9;box-shadow:0 0 0 3px rgba(14,165,233,.14)}
#aybBootErr{height:18px;color:#dc2626;font-size:12px;margin:5px 0}.ayb-login-actions{display:grid;grid-template-columns:1fr;gap:8px}
#aybBootEnter,#aybBootClose{width:100%;border:0;border-radius:10px;padding:12px;font-weight:900;font-size:15px}#aybBootEnter{background:#15803d;color:#fff}#aybBootClose{background:#fff1f2;color:#9f1239;border:1px solid #fecdd3}
@keyframes aybSpin{to{transform:rotate(360deg)}}@keyframes aybPulse{from{transform:scale(.92);opacity:.8}to{transform:scale(1.08);opacity:1}}@keyframes aybFlow{from{transform:translateX(-120%)}to{transform:translateX(340%)}}
</style>'''

BOOT_HTML=r'''<div id="aybBootFlow" aria-live="polite">
  <div id="aybBootEnergy"><div class="ayb-energy-ring"><div class="ayb-energy-bolt">⚡</div></div><div class="ayb-boot-title">BY EDŞ SAHA V57</div><div class="ayb-energy-line"></div><div class="ayb-boot-sub">Enerji sistemi hazırlanıyor…</div></div>
  <div id="aybBootLogin"><div class="ayb-login-title">BY EDŞ SAHA V57</div><div class="ayb-login-sub">Yetkili Girişi</div><input id="aybBootPass" type="password" inputmode="numeric" autocomplete="off" placeholder="Şifre"><div id="aybBootErr"></div><div class="ayb-login-actions"><button id="aybBootEnter" type="button">Giriş</button><button id="aybBootClose" type="button">Programı Kapat</button></div></div>
</div>
<script id="ayb_v579_boot_js">
(function(){
  "use strict";
  var d=document,started=Date.now(),minMs=1350,loginShown=false;
  var boot=d.getElementById("aybBootFlow"),energy=d.getElementById("aybBootEnergy"),login=d.getElementById("aybBootLogin"),pass=d.getElementById("aybBootPass"),err=d.getElementById("aybBootErr");
  try{sessionStorage.removeItem("ayb_giris_ok");}catch(e){} window.__aybGirisOk=false;
  function sifre(){var p="";try{p=(localStorage.getItem("ayb_giris_sifre")||"").trim();if(!p){p="1234";localStorage.setItem("ayb_giris_sifre",p);}}catch(e){p="1234";}return p;}
  function showLogin(){if(loginShown||!boot)return;var left=minMs-(Date.now()-started);if(left>0){setTimeout(showLogin,left);return;}loginShown=true;if(energy)energy.style.display="none";if(login)login.style.display="block";setTimeout(function(){try{pass.focus();}catch(e){}},80);}
  function tamam(){try{sessionStorage.setItem("ayb_giris_ok","1");}catch(e){}window.__aybGirisOk=true;if(boot){boot.classList.add("ayb-boot-leave");setTimeout(function(){try{boot.remove();}catch(e){}},260);}}
  function dene(){if(!pass)return;if(String(pass.value||"").trim()===sifre()){err.textContent="";tamam();}else{err.textContent="Şifre yanlış.";pass.value="";try{pass.focus();}catch(e){}}}
  function kapat(){try{if(window.AYBNative&&typeof window.AYBNative.closeApp==="function"){window.AYBNative.closeApp();return;}}catch(e){}try{window.close();}catch(e){}}
  window.aybStartLogin=showLogin;window.aybStartClose=kapat;
  d.getElementById("aybBootEnter").onclick=dene;d.getElementById("aybBootClose").onclick=kapat;pass.addEventListener("keydown",function(e){if(e.key==="Enter")dene();});setTimeout(showLogin,minMs);
})();
</script>'''

if 'id="ayb_v579_boot_css"' in h or 'id="aybBootFlow"' in h: raise SystemExit('v579 acilis zaten ekli')
h=h.replace('</head>',BOOT_CSS+'\n</head>',1)
m=re.search(r'<body\b[^>]*>',h,re.I)
if not m: raise SystemExit('body bulunamadi')
h=h[:m.end()]+BOOT_HTML+h[m.end():]

# Eski 3 saniyelik Programi Ac/Kapat splash kodunu fiziksel olarak sil.
start='/* ================= AÇILIŞ EKRANI (İSTEK: Bayram YARAŞ) ================='
end='/* ================= KISAYOL SİGORTA (İSTEK: Bayram YARAŞ) ================='
a=t.find(start); b=t.find(end,a)
if a<0 or b<0: raise SystemExit('eski splash blogu bulunamadi')
t=t[:a]+t[b:]

# Eski sifre penceresinin HTML uretimini fiziksel olarak kaldir; mevcut Ayarlar/şifre saklama motoru korunur.
pat=re.compile(r'function showGiris\(\)\{.*?\n  \}\n  function esc\(x\)\{',re.S)
rep='''function showGiris(){\n    if(girisAcik()) return;\n    try{ if(typeof window.aybStartLogin==="function"){ window.aybStartLogin(); return; } }catch(e){}\n  }\n  function esc(x){'''
t,n=pat.subn(rep,t,count=1)
if n!=1: raise SystemExit('eski sifre ekran fonksiyonu bulunamadi')
t=t.replace("h.textContent=title||'BY EDŞ Saha';","h.textContent=title||'BY EDŞ SAHA V57';")

# Android native ilk kare: WebView ve sistem penceresi SIYAH. Beyaz flash olmasin.
if 'import android.graphics.Color;' not in j:
    j=j.replace('import android.content.Intent;','import android.content.Intent;\nimport android.graphics.Color;',1)
if 'getWindow().setStatusBarColor(Color.BLACK);' not in j:
    j=j.replace('super.onCreate(savedInstanceState);','super.onCreate(savedInstanceState);\n        try { getWindow().setStatusBarColor(Color.BLACK); getWindow().setNavigationBarColor(Color.BLACK); } catch (Exception ignored) {}',1)
if 'web.setBackgroundColor(Color.BLACK);' not in j:
    j=j.replace('web = new WebView(this);','web = new WebView(this);\n        web.setBackgroundColor(Color.BLACK);',1)
if 'android:windowDisablePreview' not in th:
    th=th.replace('<item name="android:windowBackground">@android:color/black</item>','<item name="android:windowBackground">@android:color/black</item>\n        <item name="android:windowDisablePreview">true</item>',1)

# Kritik harita/uydu/direk motoru degismedi mi?
critical_after={
 'init':hashlib.sha256(cut(h,'function initMap(){','function toolNeedsCrosshair').encode()).hexdigest(),
 'setup':hashlib.sha256(cut(h,'function setup(){',"window.addEventListener('load',setup);").encode()).hexdigest(),
 'click':hashlib.sha256(cut(h,'function handleMapClick(e){','function handleLineObject').encode()).hexdigest(),
 'base':hashlib.sha256(cut(h,'function switchBase(v){','function aybFmtGps').encode()).hexdigest(),
}
if critical_before!=critical_after: raise SystemExit('KRITIK HARITA MOTORU DEGISTI')

for x in ['id="ayb_v579_boot_css"','id="ayb_v579_boot_js"','Enerji sistemi hazırlanıyor…','id="aybBootClose"','Programı Kapat']:
    if x not in h: raise SystemExit('v579 eksik: '+x)
for x in ['Programı Aç','aybSplash','aybGirisSifre']:
    if x in t: raise SystemExit('eski acilis kalintisi: '+x)
for x in ["baseLayers.sat=L.tileLayer('https://mt{s}.google.com/vt/lyrs=s","map.on('click',handleMapClick)",'data-tool="direk"','data-tool="hat"']:
    if x not in h: raise SystemExit('calisan harita parcasi eksik: '+x)

H.write_text(h,encoding='utf-8');T.write_text(t,encoding='utf-8');J.write_text(j,encoding='utf-8');TH.write_text(th,encoding='utf-8')
for k,v in critical_after.items(): print(k,v)
print('v16.57.9 enerji+sifre acilisi OK')
