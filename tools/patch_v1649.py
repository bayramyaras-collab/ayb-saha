from pathlib import Path

# Remove stale capture listener from ayb-tablet.js
js=Path('app/src/main/assets/ayb-tablet.js')
s=js.read_text(encoding='utf-8')
start=s.find('    /* "Olustur" (yeni proje) -> KLASORSUZ olustur')
if start < 0:
    raise SystemExit('capture start not found')
end=s.find('    ready(killFolder);', start)
if end < 0:
    raise SystemExit('capture end not found')
s=s[:start]+'    /* v16.49: eski #aybCreateProject capture engelleyicisi kaldırıldı.\n       Proje Oluştur tıklaması yalnız ana proje merkezi tarafından yönetilir. */\n'+s[end:]
js.write_text(s,encoding='utf-8')

# Patch project center main handler
html=Path('app/src/main/assets/AYB_Saha_Harita.html')
h=html.read_text(encoding='utf-8')
h=h.replace('<button id="aybCreateProject">Oluştur</button>','<button id="aybCreateProject" type="button">Oluştur</button>',1)
start=h.find('  async function createNewProject(){')
if start < 0:
    raise SystemExit('createNewProject start not found')
end=h.find('\n  async function openExisting(p){',start)
if end < 0:
    raise SystemExit('createNewProject end not found')
newfunc='''  async function createNewProject(){
    const input=$("#aybNewProjectName");
    const name=(input&&input.value.trim()) || ("Saha Projesi "+new Date().toLocaleDateString("tr-TR"));
    const btn=$("#aybCreateProject");
    if(btn && btn.__aybCreating) return;
    if(btn) btn.__aybCreating=true;
    try{
      const makeProject=(typeof newProject==="function")?newProject:window.newProject;
      const doOpen=(typeof openProject==="function")?openProject:window.openProject;
      const doSave=(typeof saveProject==="function")?saveProject:window.saveProject;
      if(typeof makeProject!=="function" || typeof doOpen!=="function"){
        throw new Error("Proje motoru hazır değil (newProject/openProject bulunamadı).");
      }
      const p=makeProject(name);
      doOpen(p);
      hideScreen();
      try{ if(typeof doSave==="function") doSave(); }catch(saveErr){ console.warn("İlk proje kaydı:",saveErr); }
      toast("Yeni proje açıldı: "+name);
      setTimeout(async()=>{
        try{
          const dir=await makeProjectFolder(name);
          if(dir){
            currentHandle=dir;
            try{ await idbSet(String(p.id||p.name),dir); }catch(e){ console.warn("Klasör IDB:",e); }
            try{ await saveToFolder(dir); }catch(e){ console.warn("Klasöre ilk kayıt:",e); }
          }
        }catch(e){ if(!(e&&e.name==="AbortError")) console.warn("Klasör bağlama:",e); }
      },0);
    }catch(err){
      console.error("Yeni proje açılış hatası:",err);
      alert("Yeni proje oluşturulamadı: "+(err&&err.message?err.message:err));
    }finally{
      if(btn) btn.__aybCreating=false;
    }
  }
'''
h=h[:start]+newfunc+h[end:]
old='''    $("#aybContinueLast")?.addEventListener("click",()=>openExisting(last));
    $("#aybCreateProject")?.addEventListener("click",createNewProject);
    $("#aybOpenFromFolder")?.addEventListener("click",openFromFolder);'''
new='''    $("#aybContinueLast")?.addEventListener("click",()=>openExisting(last));
    { const cp=$("#aybCreateProject"); if(cp){
        const go=(e)=>{ if(e){ e.preventDefault(); e.stopPropagation(); } createNewProject(); };
        cp.onclick=go;
        cp.ontouchend=(e)=>{ e.preventDefault(); e.stopPropagation(); go(); };
      }
    }
    $("#aybOpenFromFolder")?.addEventListener("click",openFromFolder);'''
if old not in h:
    raise SystemExit('binding block not found')
h=h.replace(old,new,1)
h=h.replace('$("#aybNewProjectName")?.addEventListener("keydown",e=>{ if(e.key==="Enter") createNewProject(); });','$("#aybNewProjectName")?.addEventListener("keydown",e=>{ if(e.key==="Enter"){ e.preventDefault(); createNewProject(); } });',1)
html.write_text(h,encoding='utf-8')
print('v16.49 patch OK')
