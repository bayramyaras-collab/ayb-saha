from pathlib import Path

html=Path('app/src/main/assets/AYB_Saha_Harita.html')
s=html.read_text(encoding='utf-8')
old='''  async function createNewProject(){
    const input=$("#aybNewProjectName");
    const name=(input&&input.value.trim()) || ("Saha Projesi "+new Date().toLocaleDateString("tr-TR"));
    try{
      if(typeof window.newProject!=="function" || typeof window.openProject!=="function"){
        alert("Proje motoru yüklenmedi. Sayfa tamamen açılınca tekrar dene.");
        return;
      }
      const p=window.newProject(name);
      window.openProject(p);
      const dir=await makeProjectFolder(name);
      currentHandle=dir;
      await idbSet(String(p.id||p.name),dir);
      await saveToFolder(dir);
      hideScreen();
      toast("Yeni proje açıldı ve klasörüne kaydedildi.");
    }catch(err){
      if(err && err.name==="AbortError") toast("Klasör seçimi iptal edildi.");
      else alert("Yeni proje oluşturulamadı: "+(err&&err.message?err.message:err));
    }
  }
'''
new='''  async function createNewProject(){
    const input=$("#aybNewProjectName");
    const name=(input&&input.value.trim()) || ("Saha Projesi "+new Date().toLocaleDateString("tr-TR"));
    try{
      if(typeof window.newProject!=="function" || typeof window.openProject!=="function"){
        alert("Proje motoru yüklenmedi. Sayfa tamamen açılınca tekrar dene.");
        return;
      }
      const p=window.newProject(name);
      window.openProject(p);
      hideScreen();
      try{ if(typeof window.saveProject==="function") window.saveProject(); }catch(_){}
      toast("Yeni proje açıldı: "+name);
      try{
        const dir=await makeProjectFolder(name);
        if(dir){
          currentHandle=dir;
          try{ await idbSet(String(p.id||p.name),dir); }catch(_){}
          try{ await saveToFolder(dir); }catch(_){}
        }
      }catch(_){ }
    }catch(err){
      console.error("Yeni proje açılış hatası:",err);
      alert("Yeni proje oluşturulamadı: "+(err&&err.message?err.message:err));
    }
  }
'''
if old not in s:
    raise SystemExit('createNewProject block not found')
s=s.replace(old,new,1)
html.write_text(s,encoding='utf-8')
print('v16.48 project opening patch OK')
