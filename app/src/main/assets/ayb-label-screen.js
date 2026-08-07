/* ============================================================
   BY EDŞ Saha Programı — Hafif Ekran Etiket Çakışma Önleyici
   Sürüm: PERF-25.07-AT-U4

   - Haritayı veya katmanları yeniden çizmez.
   - Sürekli tarama yapmaz; yalnız zoom/kaydırma bittikten veya çizilmiş
     etiket DOM'u değiştikten sonra tek geçiş çalışır.
   - Ekrandaki etiketleri sabit boyutlu bir hücre dizininde O(N) yakın
     maliyetle yerleştirir; proje verisini değiştirmez.
   ============================================================ */
(function(){
  'use strict';
  if(window.__aybScreenLabelV4)return;
  window.__aybScreenLabelV4=true;

  var CELL=72, PAD=5, timer=0, idleId=0, busy=false, again=false, solveRuns=0;
  var observer=null, boundMap=null, adjusted=[];
  var WATT_CLASSES=['ayb-watt-screen-up','ayb-watt-screen-right','ayb-watt-screen-left','ayb-watt-screen-down'];

  /* Lamba gücü (51W/95W) etiketi, direk bilgisinin üstüne binmesin.
     Lamba sembolü yerinden oynatılmaz; yalnız güç etiketi kendi sembolünün
     çevresindeki dört güvenli konumdan en boş olana alınır. */
  function injectWattStyle(){
    if(document.getElementById('ayb-screen-watt-u4-style'))return;
    var st=document.createElement('style');st.id='ayb-screen-watt-u4-style';
    st.textContent=
      '.ayb-lamp-watt.ayb-watt-screen-up{left:50%!important;right:auto!important;top:auto!important;bottom:100%!important;margin:0 0 2px 0!important;transform:translate(calc(-50% + var(--ayb-watt-sx,0px)),var(--ayb-watt-sy,0px))!important;}'+
      '.ayb-lamp-watt.ayb-watt-screen-down{left:50%!important;right:auto!important;top:100%!important;bottom:auto!important;margin:2px 0 0 0!important;transform:translate(calc(-50% + var(--ayb-watt-sx,0px)),var(--ayb-watt-sy,0px))!important;}'+
      '.ayb-lamp-watt.ayb-watt-screen-right{left:100%!important;right:auto!important;top:50%!important;bottom:auto!important;margin:0 0 0 2px!important;transform:translate(var(--ayb-watt-sx,0px),calc(-50% + var(--ayb-watt-sy,0px)))!important;}'+
      '.ayb-lamp-watt.ayb-watt-screen-left{left:auto!important;right:100%!important;top:50%!important;bottom:auto!important;margin:0 2px 0 0!important;transform:translate(var(--ayb-watt-sx,0px),calc(-50% + var(--ayb-watt-sy,0px)))!important;}';
    (document.head||document.documentElement).appendChild(st);
  }
  function wattSet(el,pos,sx,sy){
    for(var i=0;i<WATT_CLASSES.length;i++)el.classList.remove(WATT_CLASSES[i]);
    el.classList.add('ayb-watt-screen-'+pos);
    el.style.setProperty('--ayb-watt-sx',(sx||0)+'px');
    el.style.setProperty('--ayb-watt-sy',(sy||0)+'px');
  }
  function overlapList(r,list){var t=0;for(var i=0;i<list.length;i++)t+=overlap(r,list[i]);return t}
  function uniquePush(a,v){if(a.indexOf(v)<0)a.push(v)}
  function placeWattLabels(v){
    injectWattStyle();
    var m=M();if(!m||!m.getContainer)return 0;
    var root=null;try{root=m.getPanes&&m.getPanes().markerPane}catch(e){}if(!root)root=m.getContainer();
    var obstacles=[],placedWatts=[],changed=0;
    try{
      var obs=root.querySelectorAll('.symbol .sym-label,.line-label-wrap,.ayb-line-label,.line-region-wrap,.ayb-region-label-svg,.ayb-print-frame-label');
      for(var oi=0;oi<obs.length;oi++){var or=rect(obs[oi]);if(or&&visible(or,v))obstacles.push(expanded(or,PAD));}
    }catch(e){}
    var watts=[];try{watts=root.querySelectorAll('.ayb-lamp-watt')}catch(e){}
    for(var wi=0;wi<watts.length;wi++){
      var w=watts[wi];
      for(var ci=0;ci<WATT_CLASSES.length;ci++)w.classList.remove(WATT_CLASSES[ci]);
      w.style.removeProperty('--ayb-watt-sx');w.style.removeProperty('--ayb-watt-sy');
      var wr0=rect(w);if(!wr0||!visible(wr0,v))continue;
      var lamp=w.closest?w.closest('.ayb-pole-lamp'):w.parentElement;
      var marker=w.closest?w.closest('.leaflet-marker-icon'):null;
      var ownLabel=marker&&marker.querySelector?marker.querySelector('.symbol .sym-label'):null;
      var lr=rect(lamp),orr=rect(ownLabel),order=[];
      if(lr&&orr){
        var lx=(lr.left+lr.right)/2,ly=(lr.top+lr.bottom)/2,ox=(orr.left+orr.right)/2,oy=(orr.top+orr.bottom)/2;
        /* Direk etiketi çoğunlukla aşağıdadır: alt yarıdaki lambalarda sağ/sol
           önce denenir; üstteki lambada güç yazısı yukarı alınır. */
        if(ly<oy-8)uniquePush(order,'up');
        if(lx<ox-3)uniquePush(order,'left');else if(lx>ox+3)uniquePush(order,'right');
        if(ly>=oy-8){uniquePush(order,lx<=ox?'left':'right');uniquePush(order,lx<=ox?'right':'left');}
      }
      if(w.classList.contains('up'))uniquePush(order,'up');
      if(w.classList.contains('down'))uniquePush(order,'down');
      uniquePush(order,'right');uniquePush(order,'left');uniquePush(order,'up');uniquePush(order,'down');
      var shifts=[[0,0],[0,-10],[0,10],[-10,0],[10,0],[0,-18],[0,18],[-18,0],[18,0]],best=null;
      for(var pi=0;pi<order.length;pi++){
        for(var si=0;si<shifts.length;si++){
          wattSet(w,order[pi],shifts[si][0],shifts[si][1]);
          var rr=rect(w);if(!rr)continue;
          var er=expanded(rr,PAD),ov=overlapList(er,obstacles)+overlapList(er,placedWatts),out=viewportPenalty(rr,v);
          var score=ov*100000+out*20+pi*5+Math.hypot(shifts[si][0],shifts[si][1]);
          if(!best||score<best.score)best={pos:order[pi],sx:shifts[si][0],sy:shifts[si][1],r:rr,er:er,ov:ov,out:out,score:score};
          if(ov===0&&out===0)break;
        }
        if(best&&best.ov===0&&best.out===0)break;
      }
      if(best){wattSet(w,best.pos,best.sx,best.sy);placedWatts.push(best.er);if(best.pos!==(w.classList.contains('up')?'up':'down')||best.sx||best.sy)changed++;}
    }
    return changed;
  }
  var objectOffsets=(function(){
    var out=[[0,0]], rings=[16,30,46,64,84,106], dirs=[[0,-1],[1,0],[0,1],[-1,0],[1,-1],[1,1],[-1,1],[-1,-1]];
    rings.forEach(function(r){dirs.forEach(function(d){out.push([d[0]*r,d[1]*r])})});
    return out;
  })();
  var lineOffsets=(function(){
    var out=[[0,0]], rings=[14,28,44,62,82,104], dirs=[[0,-1],[0,1],[1,0],[-1,0],[1,-1],[-1,-1],[1,1],[-1,1]];
    rings.forEach(function(r){dirs.forEach(function(d){out.push([d[0]*r,d[1]*r])})});
    return out;
  })();

  function M(){try{return (typeof map!=='undefined'&&map)||window.__aybMap||window.map||null}catch(e){return null}}
  function P(){try{return (typeof project!=='undefined'&&project)||window.project||null}catch(e){return null}}
  function px(v){v=parseFloat(String(v||'0').replace('px',''));return isFinite(v)?v:0}
  function cloneLL(ll){return ll&&window.L?L.latLng(ll.lat,ll.lng):ll}
  function rect(el){
    if(!el)return null;
    var cs=null;try{cs=getComputedStyle(el);if(cs.display==='none'||cs.visibility==='hidden'||(cs.opacity!==''&&Number(cs.opacity)===0))return null}catch(e){}
    var r=el.getBoundingClientRect();
    if(!r||r.width<2||r.height<2)return null;
    return {left:r.left,top:r.top,right:r.right,bottom:r.bottom,width:r.width,height:r.height};
  }
  function shifted(r,dx,dy){return {left:r.left+dx,top:r.top+dy,right:r.right+dx,bottom:r.bottom+dy,width:r.width,height:r.height}}
  function expanded(r,p){return {left:r.left-p,top:r.top-p,right:r.right+p,bottom:r.bottom+p,width:r.width+p*2,height:r.height+p*2}}
  function overlap(a,b){var w=Math.max(0,Math.min(a.right,b.right)-Math.max(a.left,b.left)),h=Math.max(0,Math.min(a.bottom,b.bottom)-Math.max(a.top,b.top));return w*h}
  function viewportPenalty(r,v){
    var p=0, gap=5;
    if(r.left<v.left+gap)p+=(v.left+gap-r.left)*400;
    if(r.top<v.top+gap)p+=(v.top+gap-r.top)*400;
    if(r.right>v.right-gap)p+=(r.right-(v.right-gap))*400;
    if(r.bottom>v.bottom-gap)p+=(r.bottom-(v.bottom-gap))*400;
    return p;
  }
  function visible(r,v){return r.right>=v.left&&r.left<=v.right&&r.bottom>=v.top&&r.top<=v.bottom}
  function key(x,y){return x+','+y}
  function cells(r,fn){
    var x1=Math.floor(r.left/CELL),x2=Math.floor(r.right/CELL),y1=Math.floor(r.top/CELL),y2=Math.floor(r.bottom/CELL);
    for(var y=y1;y<=y2;y++)for(var x=x1;x<=x2;x++)fn(key(x,y));
  }
  function addGrid(grid,placed,r){
    var ix=placed.length;placed.push(r);
    cells(r,function(k){var a=grid.get(k);if(!a){a=[];grid.set(k,a)}a.push(ix)});
  }
  function overlapGrid(grid,placed,r,seen,stamp){
    var total=0;
    cells(r,function(k){var a=grid.get(k);if(!a)return;for(var i=0;i<a.length;i++){var ix=a[i];if(seen[ix]===stamp)continue;seen[ix]=stamp;total+=overlap(r,placed[ix])}});
    return total;
  }
  function objectById(id){try{if(typeof aybObjById==='function')return aybObjById(id)}catch(e){}var p=P(),a=p&&p.objects||[];for(var i=0;i<a.length;i++)if(a[i]&&String(a[i].id)===String(id))return a[i];return null}
  function lineById(id){try{if(typeof aybHatById==='function')return aybHatById(id)}catch(e){}var p=P(),a=p&&p.lines||[];for(var i=0;i<a.length;i++)if(a[i]&&String(a[i].id)===String(id))return a[i];return null}
  function lineBase(line,marker){
    var base=null;
    try{
      var a=objectById(line.start),b=objectById(line.end);
      if(a&&b&&typeof aybLinePathPoints==='function'&&typeof aybLineLabelPlacementFromPoints==='function')base=aybLineLabelPlacementFromPoints(aybLinePathPoints(line,a,b)).latlng;
    }catch(e){}
    try{if(!base&&marker&&marker.__aybScreenBaseLatLng)base=marker.__aybScreenBaseLatLng}catch(e){}
    try{if(!base&&marker&&marker.getLatLng)base=marker.getLatLng()}catch(e){}
    if(marker&&base&&!marker.__aybScreenBaseLatLng)marker.__aybScreenBaseLatLng=cloneLL(base);
    return base;
  }
  function clearClass(el){if(!el)return;el.classList.remove('ayb-screen-label-moved');el.classList.remove('ayb-screen-label-hidden')}
  function resetAdjusted(){
    for(var i=0;i<adjusted.length;i++){
      var it=adjusted[i];
      try{
        if(it.kind==='object'){
          it.sym.style.setProperty('--lbl-dx',it.baseDx+'px');it.sym.style.setProperty('--lbl-dy',it.baseDy+'px');clearClass(it.label);
        }else if(it.marker&&it.base&&it.marker.setLatLng){it.marker.setLatLng(it.base);clearClass(it.el)}
      }catch(e){}
    }
    adjusted=[];
  }
  window.aybScreenLabelReset=resetAdjusted;

  function collect(){
    var m=M(),p=P(),items=[];
    if(!m||!p||!m.getContainer)return items;
    resetAdjusted();
    try{
      var markerStore=null;try{if(typeof markers!=='undefined')markerStore=markers}catch(e){}if(!markerStore)markerStore=window.markers||window.__aybMarkers||null;
      if(markerStore&&markerStore.forEach)markerStore.forEach(function(mk,id){
        if(!mk||!mk._icon)return;var o=objectById(id);if(!o)return;
        var sym=mk._icon.querySelector('.symbol'),label=sym&&sym.querySelector('.sym-label');if(!sym||!label)return;
        if(sym.__aybScreenBaseDx==null){sym.__aybScreenBaseDx=px(sym.style.getPropertyValue('--lbl-dx'));sym.__aybScreenBaseDy=px(sym.style.getPropertyValue('--lbl-dy'))}
        sym.style.setProperty('--lbl-dx',sym.__aybScreenBaseDx+'px');sym.style.setProperty('--lbl-dy',sym.__aybScreenBaseDy+'px');clearClass(label);
        items.push({kind:'object',priority:o.type==='trafo'?0:1,sym:sym,label:label,el:label,baseDx:sym.__aybScreenBaseDx,baseDy:sym.__aybScreenBaseDy,obj:o});
      });
    }catch(e){}
    try{
      var lineStore=null;try{if(typeof lineLayers!=='undefined')lineStore=lineLayers}catch(e){}if(!lineStore)lineStore=window.lineLayers||window.__aybLineLayers||null;
      if(lineStore&&lineStore.forEach)lineStore.forEach(function(pack,id){
        var line=lineById(id);if(!line||!pack)return;
        var base=lineBase(line,pack.label);
        if(pack.label&&base){pack.label.setLatLng(base);var el=pack.label._icon&&pack.label._icon.querySelector('.line-label-wrap,.ayb-line-label,.line-region-wrap');if(el){clearClass(el);items.push({kind:'line',priority:2,marker:pack.label,el:el,base:cloneLL(base)})}}
        if(pack.region){var rb=base||lineBase(line,pack.region);if(rb){pack.region.setLatLng(rb);var re=pack.region._icon&&pack.region._icon.querySelector('.line-region-wrap,.ayb-region-label-svg');if(re){clearClass(re);items.push({kind:'region',priority:3,marker:pack.region,el:re,base:cloneLL(rb)})}}}
      });
    }catch(e){}
    try{
      var others=null;try{if(typeof otherLayers!=='undefined')others=otherLayers}catch(e){}if(!others)others=window.otherLayers||null;
      if(Array.isArray(others))others.forEach(function(mk){
        if(!mk||!mk._icon||!mk.getLatLng||!mk.setLatLng)return;var el=mk._icon.querySelector('.line-label-wrap,.ayb-line-label');if(!el)return;
        if(!mk.__aybScreenBaseLatLng)mk.__aybScreenBaseLatLng=cloneLL(mk.getLatLng());mk.setLatLng(mk.__aybScreenBaseLatLng);clearClass(el);
        items.push({kind:'channel',priority:4,marker:mk,el:el,base:cloneLL(mk.__aybScreenBaseLatLng)});
      });
    }catch(e){}
    return items;
  }
  function apply(it,dx,dy,hidden){
    if(hidden){it.el.classList.add('ayb-screen-label-hidden');adjusted.push(it);return}
    if(it.kind==='object'){
      it.sym.style.setProperty('--lbl-dx',(it.baseDx+dx).toFixed(1)+'px');it.sym.style.setProperty('--lbl-dy',(it.baseDy+dy).toFixed(1)+'px');
    }else if(it.marker&&it.base){
      try{var m=M(),pt=m.latLngToLayerPoint(it.base);it.marker.setLatLng(m.layerPointToLatLng(L.point(pt.x+dx,pt.y+dy)))}catch(e){}
    }
    if(dx||dy)it.el.classList.add('ayb-screen-label-moved');
    adjusted.push(it);
  }
  function solve(){
    var m=M(),p=P();if(!m||!p||document.body.classList.contains('ayb-printing'))return;
    var started=performance.now?performance.now():Date.now(),items=collect(),v=m.getContainer().getBoundingClientRect();
    var measured=[];
    for(var i=0;i<items.length;i++){var r=rect(items[i].el);if(r&&visible(r,v)){items[i].baseRect=r;measured.push(items[i])}}
    measured.sort(function(a,b){return a.priority-b.priority});
    var grid=new Map(),placed=[],seen=[],stamp=0,moved=0,hidden=0;
    for(var n=0;n<measured.length;n++){
      var it=measured[n],cands=it.kind==='object'?objectOffsets:lineOffsets,best=null;
      for(var c=0;c<cands.length;c++){
        var dx=cands[c][0],dy=cands[c][1],r=shifted(it.baseRect,dx,dy),rr=expanded(r,PAD),ov=overlapGrid(grid,placed,rr,seen,++stamp),outside=viewportPenalty(r,v);
        var score=ov*100000+outside*20+Math.hypot(dx,dy);
        if(!best||score<best.score)best={dx:dx,dy:dy,r:r,rr:rr,ov:ov,outside:outside,score:score};
        if(ov===0&&outside===0)break;
      }
      var mustHide=best&&best.ov>0&&it.priority>0;
      if(mustHide){apply(it,0,0,true);hidden++;continue}
      if(!best)continue;
      apply(it,best.dx,best.dy,false);if(best.dx||best.dy)moved++;
      addGrid(grid,placed,best.rr);
    }
    var wattAdjusted=placeWattLabels(v);
    var ended=performance.now?performance.now():Date.now();
    window.aybScreenLabelStats={total:measured.length,moved:moved,hidden:hidden,wattAdjusted:wattAdjusted,ms:Math.round((ended-started)*10)/10,at:Date.now(),runs:++solveRuns};
  }
  function run(){
    timer=0;idleId=0;if(busy){again=true;return}busy=true;
    try{solve()}catch(e){window.aybScreenLabelError=String(e&&e.stack||e);try{console.warn('Etiket yerleşimi',e)}catch(_){}}
    busy=false;if(again){again=false;schedule(120)}
  }
  function schedule(ms){
    if(document.body.classList.contains('ayb-printing'))return;
    if(timer)clearTimeout(timer);
    if(idleId&&typeof cancelIdleCallback==='function'){try{cancelIdleCallback(idleId)}catch(e){}idleId=0}
    timer=setTimeout(function(){
      if(typeof requestIdleCallback==='function')idleId=requestIdleCallback(run,{timeout:350});else run();
    },ms==null?150:ms);
  }
  window.aybScreenLabelsRefresh=function(){schedule(20)};
  window.aybScreenLabelsRunNow=run;

  function bind(){
    var m=M();if(!m||boundMap===m)return !!m;
    boundMap=m;
    try{m.on('moveend zoomend',function(){schedule(140)});m.on('zoomstart',resetAdjusted)}catch(e){}
    try{
      var pane=m.getPanes&&m.getPanes().markerPane;
      if(pane&&typeof MutationObserver!=='undefined'){
        if(observer)observer.disconnect();observer=new MutationObserver(function(list){for(var i=0;i<list.length;i++)if(list[i].addedNodes.length||list[i].removedNodes.length){schedule(180);break}});
        observer.observe(pane,{childList:true,subtree:true});
      }
    }catch(e){}
    schedule(80);return true;
  }
  function boot(){injectWattStyle();if(bind())return;setTimeout(bind,400);setTimeout(bind,1200)}
  window.addEventListener('afterprint',function(){schedule(100)});
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot);else boot();
})();
