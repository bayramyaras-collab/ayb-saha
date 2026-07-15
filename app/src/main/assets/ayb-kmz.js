/* ============================================================
   AYB Saha - Sembollu KMZ (Kurum) dışa aktarma
   Hazirlayan: Bayram YARAS  -  0530 630 05 40
   Programdaki BIREBIR sembolleri (SVG->PNG) icons/ klasorune gomer,
   nokta nesnelerin FOTOGRAFLARINI baloncuga ekler.
   Google Earth'te program gorunumunun aynisi + fotograflar.
   ============================================================ */
(function () {
  'use strict';

  /* ---- CRC32 + ZIP (store) yazici ---- */
  var CRC=(function(){var t=[];for(var n=0;n<256;n++){var c=n;for(var k=0;k<8;k++)c=(c&1)?(0xEDB88320^(c>>>1)):(c>>>1);t[n]=c>>>0;}return t;})();
  function crc32(u8){var c=0xFFFFFFFF;for(var i=0;i<u8.length;i++)c=CRC[(c^u8[i])&0xFF]^(c>>>8);return (c^0xFFFFFFFF)>>>0;}
  function u16(n){return [n&255,(n>>>8)&255];}
  function u32(n){return [n&255,(n>>>8)&255,(n>>>16)&255,(n>>>24)&255];}
  function strBytes(s){var a=[];for(var i=0;i<s.length;i++)a.push(s.charCodeAt(i)&255);return a;}
  function buildZip(files){
    var chunks=[], central=[], offset=0;
    var d=new Date(), dosDate=((d.getFullYear()-1980)<<9)|((d.getMonth()+1)<<5)|d.getDate();
    var dosTime=(d.getHours()<<11)|(d.getMinutes()<<5)|(d.getSeconds()>>1);
    files.forEach(function(f){
      var nameB=strBytes(f.name), data=f.bytes, crc=crc32(data), len=data.length;
      var local=[].concat(u32(0x04034b50),u16(20),u16(0),u16(0),u16(dosTime),u16(dosDate),u32(crc),u32(len),u32(len),u16(nameB.length),u16(0),nameB);
      chunks.push(new Uint8Array(local)); chunks.push(data);
      central=central.concat([].concat(u32(0x02014b50),u16(20),u16(20),u16(0),u16(0),u16(dosTime),u16(dosDate),u32(crc),u32(len),u32(len),u16(nameB.length),u16(0),u16(0),u16(0),u16(0),u32(0),u32(offset),nameB));
      offset += local.length + len;
    });
    var cd=new Uint8Array(central), cdSize=cd.length, cdOffset=offset;
    var end=new Uint8Array([].concat(u32(0x06054b50),u16(0),u16(0),u16(files.length),u16(files.length),u32(cdSize),u32(cdOffset),u16(0)));
    var total=offset+cdSize+end.length, out=new Uint8Array(total), pos=0;
    chunks.forEach(function(c){ out.set(c,pos); pos+=c.length; });
    out.set(cd,pos); pos+=cd.length; out.set(end,pos);
    return out;
  }

  /* ---- yardimcilar ---- */
  function esc(s){ return String(s==null?'':s).replace(/[&<>"']/g,function(m){return{'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m];}); }
  function safe(s){ return String(s==null?'x':s).replace(/[^A-Za-z0-9._-]/g,'_'); }
  function addWH(svg,px){ return /<svg[^>]*\swidth=/.test(svg)?svg:svg.replace('<svg','<svg width="'+px+'" height="'+px+'"'); }
  function svgToPng(svg,size){ return new Promise(function(res){
    try{ var img=new Image(); img.crossOrigin='anonymous';
      img.onload=function(){ try{ var c=document.createElement('canvas'); c.width=size;c.height=size;
        var ctx=c.getContext('2d'); ctx.clearRect(0,0,size,size); ctx.drawImage(img,0,0,size,size);
        if(c.toBlob){ c.toBlob(function(b){ if(!b){res(null);return;} b.arrayBuffer().then(function(ab){res(new Uint8Array(ab));}); },'image/png'); }
        else { res(dataURLtoBytes(c.toDataURL('image/png'))); }
      }catch(e){ res(null); } };
      img.onerror=function(){ res(null); };
      img.src='data:image/svg+xml;base64,'+btoa(unescape(encodeURIComponent(addWH(svg,size))));
    }catch(e){ res(null); }
  }); }
  function dataURLtoBytes(d){ var i=d.indexOf(','); var bin=atob(d.slice(i+1)); var u=new Uint8Array(bin.length); for(var j=0;j<bin.length;j++)u[j]=bin.charCodeAt(j); return u; }
  function getPhotos(id){ return new Promise(function(res){ try{ var r=indexedDB.open('ayb_photos_db',1);
    r.onsuccess=function(){ var db=r.result; if(!db.objectStoreNames.contains('photos')){res([]);return;}
      var t=db.transaction('photos','readonly'); t.objectStore('photos').get(id).onsuccess=function(e){ var rec=e.target.result; res((rec&&rec.items)||[]); }; };
    r.onerror=function(){res([]);}; }catch(e){res([]);} }); }

  function symOf(o){
    try{ var id=(o.props&&o.props.symbol_id)||'';
      if(id && window.AYBSYMBOLS && window.AYBSYMBOLS.getById){ var s=window.AYBSYMBOLS.getById(id); if(s&&s.svg) return {id:id, svg:s.svg}; }
      if(window.AYBSYMBOLS && window.AYBSYMBOLS.getByObjectType){ var arr=window.AYBSYMBOLS.getByObjectType(o.type); if(arr&&arr[0]&&arr[0].svg) return {id:arr[0].id, svg:arr[0].svg}; }
    }catch(e){}
    return {id:'gen_'+(o.type||'x'), svg:'<svg viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg"><circle cx="16" cy="16" r="12" fill="#2b71c8" stroke="#fff" stroke-width="2.5"/></svg>'};
  }
  function objName(o){ var p=o.props||{}; return p.direk_no||p.trafo_no||p.kofre_no||p.box_no||p.ad||(o.type||'nesne'); }
  function descHtml(o,imgs){
    var p=o.props||{}, rows='';
    for(var k in p){ if(k.charAt(0)==='_'||k==='symbol_id'||p[k]==null||p[k]==='') continue;
      rows+='<tr><td style="color:#555;padding:2px 8px 2px 0">'+esc(k)+'</td><td style="font-weight:600">'+esc(p[k])+'</td></tr>'; }
    return '<div style="font-family:Arial,sans-serif;font-size:12px;min-width:240px">'
      +'<div style="font-weight:700;font-size:14px;margin-bottom:4px">'+esc(objName(o))+' <span style="color:#888">('+esc(o.type||'')+')</span></div>'
      +'<table>'+rows+'<tr><td style="color:#555">Koordinat</td><td>'+(+o.lat).toFixed(6)+', '+(+o.lng).toFixed(6)+'</td></tr></table>'
      +(imgs||'')
      +'<div style="margin-top:6px;color:#888;font-size:10px">AYB Saha · Bayram YARAŞ</div></div>';
  }
  function ptsCoords(points){ return (points||[]).filter(function(p){return p&&isFinite(p.lat)&&isFinite(p.lng);}).map(function(p){return p.lng+','+p.lat+',0';}).join(' '); }

  function toast(msg){ try{ var t=document.createElement('div'); t.textContent=msg;
    t.style.cssText='position:fixed;left:50%;top:16px;transform:translateX(-50%);z-index:100001;background:#0d1b34;color:#e7eeff;padding:10px 16px;border-radius:10px;border:1px solid #388cff;font:700 14px system-ui';
    document.body.appendChild(t); setTimeout(function(){t.remove();},3500); }catch(e){} }

  /* ---- ANA: Sembollu KMZ uret ---- */
  async function exportKmzSym(){
    var pr=window.project;
    if(!pr){ alert('Önce bir proje açın.'); return; }
    toast('Sembollü KMZ hazırlanıyor... (fotoğraflarla biraz sürebilir)');
    try{
      var files=[];
      var pts=(pr.objects||[]).filter(function(o){return typeof o.lat==='number'&&typeof o.lng==='number';});
      // 1) benzersiz semboller -> PNG + Style
      var symMap={}, styleXml='';
      pts.forEach(function(o){ var s=symOf(o); o.__sym=s.id; if(!(s.id in symMap)) symMap[s.id]=s.svg; });
      for(var sid in symMap){
        var png=await svgToPng(symMap[sid],128);
        if(png){ files.push({name:'icons/'+safe(sid)+'.png', bytes:png});
          styleXml+='<Style id="sym_'+safe(sid)+'"><IconStyle><scale>1.15</scale><Icon><href>icons/'+safe(sid)+'.png</href></Icon><hotSpot x="0.5" y="0.5" xunits="fraction" yunits="fraction"/></IconStyle><LabelStyle><scale>0.85</scale></LabelStyle></Style>';
        }
      }
      // 2) nokta placemark + fotograflar
      var placemarks='';
      for(var i=0;i<pts.length;i++){ var o=pts[i];
        var photos=await getPhotos(o.id), imgs='';
        for(var j=0;j<photos.length;j++){ try{ var b=dataURLtoBytes(photos[j]); var pn='photos/'+safe(o.id)+'_'+j+'.jpg';
          files.push({name:pn,bytes:b}); imgs+='<div><img src="'+pn+'" width="320" style="margin:4px 0;border:1px solid #ccc"/></div>'; }catch(e){} }
        var styleUrl=o.__sym?('#sym_'+safe(o.__sym)):'';
        placemarks+='<Placemark><name>'+esc(objName(o))+'</name>'
          +(styleUrl?'<styleUrl>'+styleUrl+'</styleUrl>':'')
          +'<description><![CDATA['+descHtml(o,imgs)+']]></description>'
          +'<Point><coordinates>'+o.lng+','+o.lat+',0</coordinates></Point></Placemark>';
      }
      // 3) hatlar / kanallar / serbest / alanlar
      function lineStyle(color){ return '<Style><LineStyle><color>'+color+'</color><width>3</width></LineStyle></Style>'; }
      (pr.lines||[]).forEach(function(l){
        var pts2=l.points; if(!(pts2&&pts2.length>=2)){ var a=(pr.objects||[]).find(function(x){return x.id===l.start;}); var b=(pr.objects||[]).find(function(x){return x.id===l.end;}); if(a&&b) pts2=[{lat:a.lat,lng:a.lng},{lat:b.lat,lng:b.lng}]; }
        var c=ptsCoords(pts2); if(!c) return;
        placemarks+='<Placemark><name>'+esc((l.props&&l.props.ad)||'Hat')+'</name>'+lineStyle('ff37ff9e')+'<LineString><tessellate>1</tessellate><coordinates>'+c+'</coordinates></LineString></Placemark>';
      });
      (pr.channels||[]).forEach(function(ch){ var c=ptsCoords(ch.points); if(!c) return;
        placemarks+='<Placemark><name>Kanal</name>'+lineStyle('ff4f8fff')+'<LineString><tessellate>1</tessellate><coordinates>'+c+'</coordinates></LineString></Placemark>'; });
      (pr.freeLines||[]).forEach(function(fl){ var c=ptsCoords(fl.points); if(!c) return;
        placemarks+='<Placemark><name>Çizgi</name>'+lineStyle('ffcfcfcf')+'<LineString><tessellate>1</tessellate><coordinates>'+c+'</coordinates></LineString></Placemark>'; });
      (pr.areas||[]).forEach(function(ar){ var c=ptsCoords(ar.points); if(!c) return; var first=(ar.points[0]); c=c+' '+first.lng+','+first.lat+',0';
        placemarks+='<Placemark><name>Alan</name><Style><LineStyle><color>ff00a5ff</color><width>2</width></LineStyle><PolyStyle><color>3300a5ff</color></PolyStyle></Style><Polygon><outerBoundaryIs><LinearRing><coordinates>'+c+'</coordinates></LinearRing></outerBoundaryIs></Polygon></Placemark>'; });

      var kml='<?xml version="1.0" encoding="UTF-8"?><kml xmlns="http://www.opengis.net/kml/2.2"><Document><name>'+esc(pr.name||'AYB Saha Projesi')+'</name>'+styleXml+placemarks+'</Document></kml>';
      files.unshift({name:'doc.kml', bytes:new TextEncoder().encode(kml)});

      var zip=buildZip(files);
      var blob=new Blob([zip],{type:'application/vnd.google-earth.kmz'});
      var a=document.createElement('a'); a.href=URL.createObjectURL(blob); a.download=safe(pr.name||'proje')+'_sembollu.kmz'; a.style.display='none';
      document.body.appendChild(a); a.click(); setTimeout(function(){ URL.revokeObjectURL(a.href); a.remove(); },1000);
      toast('Sembollü KMZ hazır. "Nereye gönderilsin?" ekranından kaydedin/gönderin.');
    }catch(e){ alert('KMZ hatası: '+(e&&e.message||e)); }
  }
  window.aybExportKmzSym=exportKmzSym;
})();
