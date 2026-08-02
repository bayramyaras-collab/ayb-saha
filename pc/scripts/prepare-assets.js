const fs = require('fs');
const path = require('path');

const pcRoot = path.resolve(__dirname, '..');
const repoRoot = path.resolve(pcRoot, '..');
const source = path.join(repoRoot, 'app', 'src', 'main', 'assets');
const target = path.join(pcRoot, 'assets');

fs.rmSync(target, { recursive: true, force: true });
fs.cpSync(source, target, { recursive: true });

const fontPath = path.join(target, 'B_CAD.ttf');
if (!fs.existsSync(fontPath)) {
  throw new Error('Gerekli B_CAD.ttf sembol fontu bulunamadı. Kurulum oluşturulmadı.');
}
const fontBytes = fs.readFileSync(fontPath);
if (fontBytes.length < 1024) {
  throw new Error('B_CAD.ttf geçersiz veya eksik. Kurulum oluşturulmadı.');
}

const embeddedCss = [
  '/* Otomatik üretildi: B_CAD sembol fontu kurulum içine gömülüdür. */',
  "@font-face{font-family:'BCAD';font-style:normal;font-weight:400;font-display:block;src:url(data:font/ttf;base64," + fontBytes.toString('base64') + ") format('truetype');}",
  ".ayb-bcad-font-ready{font-family:'BCAD';position:absolute;left:-99999px;top:-99999px;visibility:hidden;}"
].join('\n');
fs.writeFileSync(path.join(target, 'embedded-bcad.css'), embeddedCss, 'utf8');

const htmlPath = path.join(target, 'AYB_Saha_Harita.html');
let html = fs.readFileSync(htmlPath, 'utf8');
if (!html.includes('embedded-bcad.css')) {
  html = html.replace(
    '<link rel="apple-touch-icon" href="icons/apple-touch-icon.png" />',
    '<link rel="apple-touch-icon" href="icons/apple-touch-icon.png" />\n<link rel="stylesheet" href="embedded-bcad.css" />'
  );
}
html = html.replace(
  /\/\* İSTEK \(Bayram YARAŞ\): B PRO FONTU BİREBİR[\s\S]*?@font-face\{font-family:'BCAD';src:url\('B_CAD\.ttf'\) format\('truetype'\);font-display:swap;\}/,
  '/* B PRO fontu embedded-bcad.css içinde veri olarak uygulamaya gömülüdür. */'
);
html = html.replace(/BY EDŞ Saha Programı v16\.33/g, 'BY EDŞ Saha Programı v16.34');
fs.writeFileSync(htmlPath, html, 'utf8');

const tabletPath = path.join(target, 'ayb-tablet.js');
let tablet = fs.readFileSync(tabletPath, 'utf8');
tablet = tablet.replace(/PERF-26\.08-U6/g, 'PERF-26.08-U7');
tablet = tablet.replace(
  /\["SEMBOL FONTU \(B_CAD\.ttf\) — 3\. DOSYA",\[[\s\S]*?\]\],\n    \["ÇEVRİMDIŞI ÖNBELLEK/,
  '["SEMBOL FONTU — KURULUMA GÖMÜLÜ",[\n' +
  '      "B_CAD sembol fontu BY EDŞ Saha Programı kurulumunun içine gömülüdür.",\n' +
  '      "Ayrı font dosyası kopyalaman veya Windows\'a font kurman gerekmez.",\n' +
  '      "Direk / trafo / kofre / box sembolleri program açılmadan önce yüklenir.",\n' +
  '      "Kurulum dosyası eksik ya da bozuksa program bunu açılışta bildirir."\n' +
  '    ]],\n    ["ÇEVRİMDIŞI ÖNBELLEK'
);
tablet = tablet.replace(
  /\/\* ===================== SEMBOL FONTU KONTROLÜ[\s\S]*?\*\//,
  '/* ===================== GÖMÜLÜ SEMBOL FONTU KONTROLÜ (Bayram YARAŞ) =====================\n' +
  '   B_CAD fontu kurulum sırasında veri URI olarak uygulamanın içine gömülür.\n' +
  '   Kullanıcıdan ayrı font dosyası istenmez. Açılış kontrolü yalnız bozuk kurulumu bildirir. */'
);
tablet = tablet.replace(
  /d\.innerHTML='<div style="font-size:14px;margin-bottom:4px">SEMBOL FONTU BULUNAMADI:[\s\S]*?programı yeniden açın\.';/,
  "d.innerHTML='<div style=\"font-size:14px;margin-bottom:4px\">GÖMÜLÜ SEMBOL FONTU YÜKLENEMEDİ</div>'\n" +
  "        +'Kurulum dosyası eksik veya bozuk olabilir. BY EDŞ Saha Programı kurulumunu yeniden çalıştırın.';"
);
tablet = tablet.replace(
  "document.fonts.load('64px \"BCAD\"','A').then(bitir,bitir)",
  "document.fonts.load('64px \"BCAD\"','A').then(function(){return document.fonts.ready;}).then(bitir,bitir)"
);
fs.writeFileSync(tabletPath, tablet, 'utf8');

const swPath = path.join(target, 'sw.js');
let sw = fs.readFileSync(swPath, 'utf8').replace(/PERF-26\.08-U6/g, 'PERF-26.08-U7');
fs.writeFileSync(swPath, sw, 'utf8');

const finalHtml = fs.readFileSync(htmlPath, 'utf8');
const finalCss = fs.readFileSync(path.join(target, 'embedded-bcad.css'), 'utf8');
if (!finalHtml.includes('embedded-bcad.css')) throw new Error('Gömülü font CSS bağlantısı kurulamadı.');
if (/src:url\('B_CAD\.ttf'\)/.test(finalHtml)) throw new Error('Harici B_CAD font bağlantısı kaldı.');
if (!finalCss.includes('data:font/ttf;base64,')) throw new Error('B_CAD fontu veri olarak gömülemedi.');

console.log('PC U7 kaynakları hazır: B_CAD.ttf ' + fontBytes.length + ' bayt olarak uygulamaya gömüldü.');
