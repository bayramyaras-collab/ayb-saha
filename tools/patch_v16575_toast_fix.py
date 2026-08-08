from pathlib import Path
import re,sys

p=Path(sys.argv[1]) if len(sys.argv)>1 else Path('app/src/main/assets/AYB_Saha_Harita.html')
s=p.read_text(encoding='utf-8',errors='replace')

old='<div class="toast" id="toast"></div>'
if old not in s:
    raise SystemExit('toast DOM elemani bulunamadi')

core=r'''<div class="toast" id="aybToast" role="status" aria-live="polite"></div>
<script id="ayb_toast_core_v575">
(function(){
  var timer=null;
  function aybToastShow(msg){
    try{
      var el=document.getElementById('aybToast');
      if(!el){ try{console.log(msg);}catch(_){} return; }
      el.textContent=String(msg==null?'':msg);
      el.classList.add('show');
      if(timer) clearTimeout(timer);
      timer=setTimeout(function(){ try{el.classList.remove('show');}catch(_){} },2400);
    }catch(e){ try{console.log(msg);}catch(_){} }
  }
  window.toast=aybToastShow;
  window.aybToast=aybToastShow;
})();
</script>'''
s=s.replace(old,core,1)

# Eski id secicilerini yeni kimlige cevir; .toast sinifi aynen kalir.
s=s.replace('body.kf-mobile #toast, body.kf-mobile .toast','body.kf-mobile #aybToast, body.kf-mobile .toast')
s=s.replace('body.ayb-printing #toast,','body.ayb-printing #aybToast,')
s=s.replace('#hint,#toast,.toast,.hint','#hint,#aybToast,.toast,.hint')

# Proje merkezi local bildirimi de global fonksiyona guvenli sekilde baglansin.
# Ayni isimli local wrapperlar sorun cikarmasa da isim cakismasini tamamen kaldiriyoruz.
s=s.replace('function toast(msg){ if(typeof window.toast==="function") window.toast(msg); else console.log(msg); }',
            'function aybNotify(msg){ if(typeof window.toast==="function") window.toast(msg); else console.log(msg); }')
s=s.replace('function toast(msg){\n    if(typeof window.toast==="function") window.toast(msg);\n    else console.log(msg);\n  }',
            'function aybNotify(msg){\n    if(typeof window.toast==="function") window.toast(msg);\n    else console.log(msg);\n  }')
s=s.replace('function toast(msg){ if(typeof window.toast==="function") window.toast(msg); else alert(msg); }',
            'function aybNotify(msg){ if(typeof window.toast==="function") window.toast(msg); else alert(msg); }')

# Yalnizca IIFE icindeki local wrapper cagrilarini degistirmek icin ilgili script bloklarini hedefle.
for sid in ['ayb_project_folder_save_v7_js','ayb_real_tracking_reports_v10_js','ayb_project_center_v13_js','ayb_kmz_mif_import_export_v15_js','ayb_layer_manager_v16_js']:
    pat=re.compile(r'(<script\b[^>]*id=["\']'+re.escape(sid)+r'["\'][^>]*>)(.*?)(</script>)',re.S|re.I)
    m=pat.search(s)
    if not m: continue
    body=m.group(2)
    body=re.sub(r'\btoast\s*\(', 'aybNotify(', body)
    # Global window.toast cagrisini geri al; wrapper icinde recursive olmasin.
    body=body.replace('window.aybNotify(', 'window.toast(')
    s=s[:m.start()]+m.group(1)+body+m.group(3)+s[m.end():]

# Proje motorundaki global toast artik gercek window.toast fonksiyonuna gider.
# Ayrica createNewProject hatasi tekrar olusursa toast bildirim hatasi proje olusturmayi durdurmasin.
pat=re.compile(r'(<script\b[^>]*id=["\']ayb_project_center_v13_js["\'][^>]*>)(.*?)(</script>)',re.S|re.I)
m=pat.search(s)
if not m:
    raise SystemExit('proje merkezi scripti bulunamadi')
body=m.group(2)
body=body.replace('aybNotify("Yeni proje açıldı: "+name);','try{aybNotify("Yeni proje açıldı: "+name);}catch(e){console.warn("Bildirim:",e);}')
body=body.replace('aybNotify("Proje açıldı: "+p.name+" / klasör bağlı");','try{aybNotify("Proje açıldı: "+p.name+" / klasör bağlı");}catch(e){}')
body=body.replace('aybNotify("Proje açıldı: "+p.name);','try{aybNotify("Proje açıldı: "+p.name);}catch(e){}')
s=s[:m.start()]+m.group(1)+body+m.group(3)+s[m.end():]

must=[
  'id="aybToast"',
  'id="ayb_toast_core_v575"',
  'window.toast=aybToastShow',
  'window.aybToast=aybToastShow',
  'function aybNotify(msg)',
  'try{aybNotify("Yeni proje açıldı: "+name);}',
]
for x in must:
    if x not in s: raise SystemExit('eksik:'+x)
if 'id="toast"' in s:
    raise SystemExit('eski id=toast halen var')

p.write_text(s,encoding='utf-8')
print('v16.57.5 toast fix OK')
