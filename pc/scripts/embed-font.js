const fs = require('fs');
const path = require('path');

const projectRoot = path.resolve(__dirname, '..');
const fontPath = path.join(projectRoot, 'assets', 'B_CAD.ttf');
const outputPath = path.join(projectRoot, 'assets', 'embedded-bcad.css');

if (!fs.existsSync(fontPath)) {
  throw new Error('Gerekli B_CAD.ttf sembol fontu bulunamadı. Kurulum oluşturulmadı.');
}
const fontBytes = fs.readFileSync(fontPath);
if (fontBytes.length < 1024) {
  throw new Error('B_CAD.ttf geçersiz veya eksik. Kurulum oluşturulmadı.');
}
const css = [
  '/* Otomatik üretildi: B_CAD sembol fontu kurulum içine gömülüdür. */',
  "@font-face{font-family:'BCAD';font-style:normal;font-weight:400;font-display:block;src:url(data:font/ttf;base64," + fontBytes.toString('base64') + ") format('truetype');}",
  ".ayb-bcad-font-ready{font-family:'BCAD';position:absolute;left:-99999px;top:-99999px;visibility:hidden;}"
].join('\n');
fs.writeFileSync(outputPath, css, 'utf8');
console.log('B_CAD.ttf uygulama içine gömüldü: ' + fontBytes.length + ' bayt');
