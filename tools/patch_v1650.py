from pathlib import Path
import re

html = Path('app/src/main/assets/AYB_Saha_Harita.html')
s = html.read_text(encoding='utf-8')

# 1) Core proje motorunu window uzerine acikca bagla.
anchor = "function newProject(name='Saha Metraj Projesi'){const id='P'+Date.now(); return normalizeProject({id,name:name||'Saha Metraj Projesi',stage:'Etap 1',user:'Bayram YARAŞ',created:new Date().toISOString(),updated:new Date().toISOString(),objects:[],lines:[],areas:[],freeLines:[],channels:[]})}\nfunction openProject(p){"
insert = "function newProject(name='Saha Metraj Projesi'){const id='P'+Date.now(); return normalizeProject({id,name:name||'Saha Metraj Projesi',stage:'Etap 1',user:'Bayram YARAŞ',created:new Date().toISOString(),updated:new Date().toISOString(),objects:[],lines:[],areas:[],freeLines:[],channels:[]})}\ntry{ window.newProject=newProject; window.openProject=openProject; window.saveProject=saveProject; }catch(e){}\nfunction openProject(p){"
if anchor not in s:
    raise SystemExit('core proje motor anchor bulunamadi')
s = s.replace(anchor, insert, 1)

# openProject govdesinden sonra exportu bir kez daha tazele.
anchor2 = "function startNewProjectFromScreen(){"
if anchor2 not in s:
    raise SystemExit('startNewProjectFromScreen anchor bulunamadi')
s = s.replace(anchor2, "try{ window.newProject=newProject; window.openProject=openProject; window.saveProject=saveProject; }catch(e){}\n" + anchor2, 1)

# 2) Tablet/WebView ortaminda klasor secici yoksa proje acildiktan sonra bekleme/uyari verme.
needle = """      if(typeof window.newProject===\"function\" && typeof window.openProject===\"function\"){\n        window.openProject(window.newProject(name.trim()));\n      }else{\n        alertLong(\"Proje motoru hazır değil. Sayfa tamamen yüklendikten sonra tekrar dene.\");\n        return;\n      }\n      currentProjectDir=null;\n      currentProjectFolderName=\"\";\n      await pickProjectFolder(name.trim());\n"""
repl = """      if(typeof window.newProject!==\"function\" || typeof window.openProject!==\"function\"){\n        try{ window.newProject=newProject; window.openProject=openProject; window.saveProject=saveProject; }catch(_e){}\n      }\n      if(typeof window.newProject!==\"function\" || typeof window.openProject!==\"function\") throw new Error(\"Proje motoru yüklenemedi\");\n      window.openProject(window.newProject(name.trim()));\n      currentProjectDir=null;\n      currentProjectFolderName=\"\";\n      if(!window.showDirectoryPicker){\n        try{ if(typeof window.saveProject===\"function\") window.saveProject(); }catch(_e){}\n        const apn=$(\"#activeProjectName\"); if(apn) apn.textContent=name.trim();\n        toast(\"Yeni proje açıldı: \"+name.trim());\n        return;\n      }\n      await pickProjectFolder(name.trim());\n"""
if needle not in s:
    raise SystemExit('createNewProjectWithFolder blogu bulunamadi')
s = s.replace(needle, repl, 1)

html.write_text(s, encoding='utf-8')

# 3) Tablet tarafinda tum Yeni Proje dugmelerini tek, klasorsuz motorla yakala.
js = Path('app/src/main/assets/ayb-tablet.js')
t = js.read_text(encoding='utf-8')
start_mark = "/* v16.49: eski #aybCreateProject capture engelleyicisi kaldırıldı."
start = t.find(start_mark)
if start < 0:
    raise SystemExit('v16.49 create block baslangici bulunamadi')
end = t.find('ready(killFolder);', start)
if end < 0:
    raise SystemExit('create block sonu bulunamadi')
block = r'''/* v16.50: TABLET yeni proje motoru — klasorsuz ve tek akis. */
    try{
      function aybTabletYeniProje(name){
        name=String(name||'Saha Projesi').trim()||'Saha Projesi';
        try{
          if(typeof window.newProject!=='function' && typeof newProject==='function') window.newProject=newProject;
          if(typeof window.openProject!=='function' && typeof openProject==='function') window.openProject=openProject;
          if(typeof window.saveProject!=='function' && typeof saveProject==='function') window.saveProject=saveProject;
        }catch(_){}
        if(typeof window.newProject!=='function' || typeof window.openProject!=='function') throw new Error('Proje motoru yüklenemedi');
        var p=window.newProject(name);
        window.openProject(p);
        try{ if(typeof window.saveProject==='function') window.saveProject(); }catch(_){}
        var ps=document.getElementById('projectScreen'); if(ps) ps.classList.remove('show');
        return p;
      }
      window.aybTabletYeniProje=aybTabletYeniProje;
      document.addEventListener('click', function(e){
        var btn=e.target&&e.target.closest?e.target.closest('#aybCreateProject,#newProjectBtn,#btnNew'):null;
        if(!btn) return;
        try{ e.preventDefault(); e.stopPropagation(); if(e.stopImmediatePropagation)e.stopImmediatePropagation(); }catch(_){}
        var inp=document.getElementById('aybNewProjectName')||document.getElementById('projectNameInput');
        var name=(inp&&inp.value?inp.value.trim():'')||'Saha Projesi';
        try{ aybTabletYeniProje(name); if(window.toast) toast('Yeni proje açıldı: '+name); }
        catch(err){ alert('Yeni proje oluşturulamadı: '+(err&&err.message?err.message:err)); }
      },true);
    }catch(e){}
    '''
t = t[:start] + block + t[end:]
js.write_text(t, encoding='utf-8')

# 4) Statik dogrulamalar
s2 = html.read_text(encoding='utf-8')
t2 = js.read_text(encoding='utf-8')
for q in ["window.newProject=newProject", "window.openProject=openProject", "if(!window.showDirectoryPicker)"]:
    if q not in s2: raise SystemExit('HTML kontrol eksik: '+q)
for q in ["window.aybTabletYeniProje=aybTabletYeniProje", "#aybCreateProject,#newProjectBtn,#btnNew"]:
    if q not in t2: raise SystemExit('JS kontrol eksik: '+q)
print('v16.50 proje motoru patch OK')
