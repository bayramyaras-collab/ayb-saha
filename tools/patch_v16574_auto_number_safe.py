from pathlib import Path
import re,sys

p=Path(sys.argv[1]) if len(sys.argv)>1 else Path('app/src/main/assets/AYB_Saha_Harita.html')
s=p.read_text(encoding='utf-8',errors='replace')

# --- Otomatik numaralandirma motorunu secenekli ve manuel-veri korumali yap ---
old_sig='function autoNumberProjectObjects(){'
if old_sig not in s: raise SystemExit('autoNumberProjectObjects bulunamadi')
s=s.replace(old_sig,'function autoNumberProjectObjects(options={}){',1)

old_head="""    const objects=project.objects;
    const lines=project.lines;
    const objectType=o=>String(o?.type||o?.kind||'').toLowerCase();
    const isType=(o,t)=>objectType(o)===t;
    const isTrafo=o=>isType(o,'trafo');
    const isDirek=o=>isType(o,'direk');
    /* İSTEK (Bayram YARAŞ): AYD (sokak aydınlatma) direkleri S+kol ile numaralanır: SA01, SB01... */
    const isAydDirek=o=>isDirek(o) && String(o?.props?.genel_tip||'').toLocaleUpperCase('tr').indexOf('AYD')>=0;
    const isNumberable=o=>['direk','box','kofre','abone','ekmuf'].includes(objectType(o));
"""
new_head="""    const objects=project.objects;
    const lines=project.lines;
    const cfg={direk:true,box:true,trafo:false,kofre:false,abone:false,ekmuf:false,...(options||{})};
    const selected={direk:!!cfg.direk,box:!!cfg.box,trafo:!!cfg.trafo,kofre:!!cfg.kofre,abone:!!cfg.abone,ekmuf:!!cfg.ekmuf};
    const objectType=o=>String(o?.type||o?.kind||'').toLowerCase();
    const isType=(o,t)=>objectType(o)===t;
    const isTrafo=o=>isType(o,'trafo');
    const isDirek=o=>isType(o,'direk');
    /* İSTEK (Bayram YARAŞ): AYD (sokak aydınlatma) direkleri S+kol ile numaralanır: SA01, SB01... */
    const isAydDirek=o=>isDirek(o) && String(o?.props?.genel_tip||'').toLocaleUpperCase('tr').indexOf('AYD')>=0;
    const isNumberable=o=>!!selected[objectType(o)];
    const primaryNo=o=>{const p=o?.props||{},t=objectType(o);if(t==='direk')return String(p.direk_no||'').trim();if(t==='trafo')return String(p.trafo_no||'').trim();if(t==='box')return String(p.box_no||'').trim();if(t==='kofre')return String(p.kofre_no||'').trim();return String(p.no||p.numara||p.ad||'').trim();};
    const defaultAutoNo=(t,v)=>{v=String(v||'').trim();if(!v)return true;const r={direk:/^D-\\d{1,4}$/i,box:/^BX-\\d{1,4}$/i,kofre:/^KF-\\d{1,4}$/i,abone:/^AB-\\d{1,4}$/i,ekmuf:/^MF-\\d{1,4}$/i,trafo:/^TR\\d{1,4}$/i}[t];return !!(r&&r.test(v));};
    const canChangeNo=o=>{const t=objectType(o),p=o?.props||{},cur=primaryNo(o);if(!selected[t])return false;if(!cur)return true;if(p._ayb_auto_no===true&&String(p._ayb_auto_no_value||'')===cur)return true;return defaultAutoNo(t,cur);};
    const usedNetwork=new Set(),usedTrafo=new Set();
    objects.forEach(o=>{const cur=primaryNo(o);if(!cur||canChangeNo(o))return;(objectType(o)==='trafo'?usedTrafo:usedNetwork).add(cur.toLocaleUpperCase('tr-TR'));});
    const uniqueNo=(t,val)=>{let c=String(val||''),set=t==='trafo'?usedTrafo:usedNetwork,m=c.match(/^(.*?)(\\d+)$/),prefix=m?m[1]:c,n=m?parseInt(m[2],10):0,w=m?m[2].length:2;while(set.has(c.toLocaleUpperCase('tr-TR'))){n++;c=prefix+String(n).padStart(w,'0');}set.add(c.toLocaleUpperCase('tr-TR'));return c;};
"""
if old_head not in s: raise SystemExit('auto no baslangic blogu uyusmadi')
s=s.replace(old_head,new_head,1)

old_set="""    const setNo=(o,val,trafo=null,kol='')=>{
      if(!o) return;
      if(!o.props) o.props={};
      if(isDirek(o)){ o.props.direk_no=val; o.props.no=val; o.props.numara=val; }
      else if(isTrafo(o)){ o.props.trafo_no=val; o.props.ad=o.props.trafo_adi||o.props.adi||val; o.props.no=val; o.props.numara=val; }
      else if(isType(o,'box')){ o.props.box_no=val; o.props.ad=val; o.props.no=val; o.props.numara=val; }
      else if(isType(o,'kofre')){ o.props.kofre_no=val; o.props.ad=val; o.props.no=val; o.props.numara=val; }
      else { o.props.ad=val; o.props.no=val; o.props.numara=val; }
      if(trafo && !isTrafo(o)){
        o.props.trafo_id=trafo.id;
        o.props.trafo_no=trafo.props?.trafo_no||getObjectNo(trafo);
        o.props.trafo_adi=aybTrafoAdi(trafo)||'';
        o.props.kol=kol||'';
      }
    };
"""
new_set="""    const setNo=(o,val,trafo=null,kol='')=>{
      if(!o) return false;
      if(!o.props) o.props={};
      const p=o.props,t=objectType(o),old=primaryNo(o);
      // Trafo/kol iliskisi teknik bilgidir; manuel obje numarasini degistirmeden de guncellenebilir.
      if(trafo && !isTrafo(o)){
        p.trafo_id=trafo.id;
        p.trafo_no=trafo.props?.trafo_no||getObjectNo(trafo);
        p.trafo_adi=aybTrafoAdi(trafo)||'';
        p.kol=kol||'';
      }
      if(!canChangeNo(o)) return false;
      val=uniqueNo(t,val);
      // ad/isim gibi manuel alanlara DOKUNMA. Yalniz gercek numara alanlari degisir.
      if(isDirek(o)){p.direk_no=val;p.no=val;p.numara=val;}
      else if(isTrafo(o)){p.trafo_no=val;p.no=val;p.numara=val;}
      else if(isType(o,'box')){p.box_no=val;p.no=val;p.numara=val;if(!p.ad||String(p.ad)===old)p.ad=val;}
      else if(isType(o,'kofre')){p.kofre_no=val;p.no=val;p.numara=val;if(!p.ad||String(p.ad)===old)p.ad=val;}
      else {p.no=val;p.numara=val;if(!p.ad||String(p.ad)===old)p.ad=val;}
      p._ayb_auto_no=true;p._ayb_auto_no_value=val;p._ayb_auto_no_version='16.57.4';
      return true;
    };
"""
if old_set not in s: raise SystemExit('setNo blogu uyusmadi')
s=s.replace(old_set,new_set,1)

old_tr="    trafos.forEach((t,i)=>setNo(t,'TR'+pad(i,2)));"
new_tr="    let __trSeq=0; trafos.forEach(t=>{if(canChangeNo(t))setNo(t,'TR'+pad(__trSeq++,2));});"
if old_tr not in s: raise SystemExit('trafo numara satiri bulunamadi')
s=s.replace(old_tr,new_tr,1)

# Secim penceresi: Direk + Box acik, Trafo kapali. Manuel dolu veriler her durumda korunur.
marker='function bindAYBAutoNumberButtons(){'
pos=s.find(marker)
if pos<0: raise SystemExit('bindAYBAutoNumberButtons bulunamadi')
dialog=r'''/* === V16.57.4: GUVENLI OTOMATIK NUMARA SECIMI === */
function aybOpenAutoNumberDialog(){
  if(!project){toast('Önce proje aç.');return;}
  const old=document.getElementById('aybAutoNoSafeModal');if(old)old.remove();
  const d=document.createElement('div');d.id='aybAutoNoSafeModal';d.style.cssText='position:fixed;inset:0;background:rgba(15,23,42,.42);z-index:15000;display:flex;align-items:center;justify-content:center;padding:12px';
  d.innerHTML=`<div style="width:min(520px,96vw);background:#fff;border:1px solid #94a3b8;border-radius:10px;box-shadow:0 18px 60px rgba(0,0,0,.35);font-family:Arial,sans-serif"><div style="padding:11px 14px;background:#eef6ff;border-bottom:1px solid #cbd5e1;font-size:16px;font-weight:900">№ Otomatik Numara — Seçim</div><div style="padding:13px 16px"><div style="font-size:12px;color:#475569;margin-bottom:10px">Numarası değişecek obje türlerini seç. <b>Manuel yazılmış dolu numara ve adlar her durumda korunur.</b></div><label style="display:flex;gap:9px;align-items:center;padding:7px"><input id="aybAnDirek" type="checkbox" checked> <b>Direkleri numaralandır</b></label><label style="display:flex;gap:9px;align-items:center;padding:7px"><input id="aybAnBox" type="checkbox" checked> <b>Box'ları numaralandır</b></label><label style="display:flex;gap:9px;align-items:center;padding:7px;background:#fff7ed;border-radius:7px"><input id="aybAnTrafo" type="checkbox"> <b>Trafo numarası değişsin</b> <span style="font-size:11px;color:#9a3412">(varsayılan kapalı)</span></label><label style="display:flex;gap:9px;align-items:center;padding:7px"><input id="aybAnKofre" type="checkbox"> Kofreleri numaralandır</label><label style="display:flex;gap:9px;align-items:center;padding:7px"><input id="aybAnAbone" type="checkbox"> Aboneleri numaralandır</label><label style="display:flex;gap:9px;align-items:center;padding:7px"><input id="aybAnEkmuf" type="checkbox"> Ek Mufları numaralandır</label><div style="margin-top:9px;padding:9px 10px;background:#ecfdf5;border:1px solid #a7f3d0;border-radius:7px;font-size:12px;color:#065f46"><b>Koruma aktif:</b> Trafo Adı, manuel trafo numarası ve diğer elle girilmiş numaralar silinmez/değişmez.</div></div><div style="display:flex;justify-content:flex-end;gap:8px;padding:10px 14px;border-top:1px solid #e2e8f0"><button id="aybAnCancel" type="button" style="padding:8px 14px">İptal</button><button id="aybAnRun" type="button" style="padding:8px 14px;background:#15803d;color:#fff;border:0;border-radius:5px;font-weight:900">Numaralandır</button></div></div>`;
  document.body.appendChild(d);
  const q=id=>d.querySelector('#'+id);
  q('aybAnCancel').onclick=()=>d.remove();
  d.onclick=e=>{if(e.target===d)d.remove();};
  q('aybAnRun').onclick=()=>{const cfg={direk:q('aybAnDirek').checked,box:q('aybAnBox').checked,trafo:q('aybAnTrafo').checked,kofre:q('aybAnKofre').checked,abone:q('aybAnAbone').checked,ekmuf:q('aybAnEkmuf').checked};if(!Object.values(cfg).some(Boolean)){toast('En az bir obje türü seç.');return;}d.remove();autoNumberProjectObjects(cfg);};
}
window.aybOpenAutoNumberDialog=aybOpenAutoNumberDialog;
/* === /V16.57.4 GUVENLI OTOMATIK NUMARA === */

'''
s=s[:pos]+dialog+s[pos:]

old_run="const run=(e)=>{ if(e){e.preventDefault(); if(e.stopImmediatePropagation)e.stopImmediatePropagation(); else e.stopPropagation();} autoNumberProjectObjects(); return false; };"
new_run="const run=(e)=>{ if(e){e.preventDefault(); if(e.stopImmediatePropagation)e.stopImmediatePropagation(); else e.stopPropagation();} aybOpenAutoNumberDialog(); return false; };"
if old_run not in s: raise SystemExit('auto no button run satiri bulunamadi')
s=s.replace(old_run,new_run,1)

s=s.replace('autoNumber:()=>autoNumberProjectObjects()}','autoNumber:()=>aybOpenAutoNumberDialog()}',1)

must=['V16.57.4: GUVENLI OTOMATIK NUMARA SECIMI','Trafo numarası değişsin','Manuel yazılmış dolu numara ve adlar her durumda korunur.','const cfg={direk:true,box:true,trafo:false','p._ayb_auto_no_version=\'16.57.4\'','else if(isTrafo(o)){p.trafo_no=val;p.no=val;p.numara=val;}','aybOpenAutoNumberDialog(); return false;']
for x in must:
  if x not in s: raise SystemExit('eksik:'+x)

p.write_text(s,encoding='utf-8')
print('v16.57.4 guvenli otomatik numara patch OK')
