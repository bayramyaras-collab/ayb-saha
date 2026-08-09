from pathlib import Path
import re, hashlib

R=Path('.')
H=R/'app/src/main/assets/AYB_Saha_Harita.html'
s=H.read_text(encoding='utf-8',errors='replace')

scripts=list(re.finditer(r'<script(?:\s[^>]*)?>(.*?)</script>',s,re.S|re.I))
core=next((m for m in scripts if 'function initMap()' in m.group(1) and 'function handleMapClick(e)' in m.group(1) and 'function switchBase(v)' in m.group(1)),None)
if not core: raise SystemExit('ana harita motoru bulunamadi')
core_before=hashlib.sha256(core.group(1).encode()).hexdigest()

if 'opt.markerZoomAnimation=false;' not in s:
    raise SystemExit('v16.57.10 marker zoom ayari bulunamadi')
s=s.replace('opt.markerZoomAnimation=false;','opt.markerZoomAnimation=true;',1)
if 'opt.zoomSnap=0.25;' not in s:
    s=s.replace('opt.wheelPxPerZoomLevel=60;','opt.wheelPxPerZoomLevel=60;\n    opt.zoomSnap=0.25;\n    opt.zoomDelta=0.5;',1)

css=r'''<style id="ayb_v5711_marker_stable_css">
/* Direk/trafo/etiket boyutu zoom boyunca sabit; Leaflet yalniz konumu tasir. */
.leaflet-marker-icon .symbol,
.leaflet-marker-icon .sym-label,
.leaflet-marker-icon .sym-label-trafo,
.leaflet-marker-icon .line-label-wrap,
.leaflet-marker-icon .line-region-wrap,
.leaflet-marker-icon .ayb-hat-flat,
.leaflet-marker-icon .kf-measure-label{transition:none!important;}
</style>'''
if 'id="ayb_v5711_marker_stable_css"' not in s:
    s=s.replace('</head>',css+'\n</head>',1)

js=r'''<script id="ayb_v5711_marker_stable_js">
(function(){
  "use strict";
  if(window.__aybStableLabels5711) return;
  window.__aybStableLabels5711=true;
  var original=(typeof window.repositionPointLabels==='function')?window.repositionPointLabels:null;
  if(!original) return;
  var busy=false;
  function rect(el){if(!el)return null;var r=el.getBoundingClientRect();if(!r||r.width<2||r.height<2)return null;return {l:r.left,t:r.top,r:r.right,b:r.bottom};}
  function ov(a,b,p){p=p||2;return !(a.r+p<=b.l||b.r+p<=a.l||a.b+p<=b.t||b.b+p<=a.t);}
  function onlyIfOverlap(){
    if(busy) return;
    var syms=Array.prototype.slice.call(document.querySelectorAll('.leaflet-marker-icon .symbol'));
    if(!syms.length||syms.length>180) return;
    var placed=[],dirty=[];
    syms.forEach(function(sym){
      var rr=rect(sym.querySelector('.sym-label')); if(!rr)return;
      for(var i=0;i<placed.length;i++){if(ov(rr,placed[i],3)){dirty.push(sym);break;}}
      placed.push(rr);
    });
    var lineRects=Array.prototype.slice.call(document.querySelectorAll('.leaflet-marker-icon .line-label-wrap,.leaflet-marker-icon .line-region-wrap,.leaflet-marker-icon .ayb-hat-flat')).map(rect).filter(Boolean);
    if(lineRects.length){
      syms.forEach(function(sym){
        if(dirty.indexOf(sym)>=0)return;
        var rr=rect(sym.querySelector('.sym-label'));if(!rr)return;
        for(var i=0;i<lineRects.length;i++){if(ov(rr,lineRects[i],3)){dirty.push(sym);break;}}
      });
    }
    if(!dirty.length)return;
    dirty.forEach(function(sym){try{sym.__aybLblK='';}catch(e){}});
    busy=true;try{original();}catch(e){}busy=false;
  }
  function stableReposition(){
    if(busy)return original();
    original();
    try{requestAnimationFrame(function(){requestAnimationFrame(onlyIfOverlap);});}catch(e){setTimeout(onlyIfOverlap,0);}
  }
  window.repositionPointLabels=stableReposition;
  try{repositionPointLabels=stableReposition;}catch(e){}
})();
</script>'''
if 'id="ayb_v5711_marker_stable_js"' not in s:
    s=s.replace('</body>',js+'\n</body>',1)

H.write_text(s,encoding='utf-8')

s2=H.read_text(encoding='utf-8')
core2=next((m for m in re.finditer(r'<script(?:\s[^>]*)?>(.*?)</script>',s2,re.S|re.I) if 'function initMap()' in m.group(1) and 'function handleMapClick(e)' in m.group(1) and 'function switchBase(v)' in m.group(1)),None)
if not core2: raise SystemExit('patch sonrasi ana harita motoru yok')
core_after=hashlib.sha256(core2.group(1).encode()).hexdigest()
if core_before!=core_after: raise SystemExit('ana harita motoru degisti')

for x in ['opt.markerZoomAnimation=true;','opt.zoomSnap=0.25;','opt.zoomDelta=0.5;','id="ayb_v5711_marker_stable_css"','id="ayb_v5711_marker_stable_js"','onlyIfOverlap']:
    if x not in s2: raise SystemExit('eksik: '+x)
if 'opt.markerZoomAnimation=false;' in s2: raise SystemExit('eski ziplama ayari kaldi')
print('core',core_after)
print('v16.57.11 marker/etiket stabil patch OK')
