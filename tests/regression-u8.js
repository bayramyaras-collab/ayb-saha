"use strict";

const assert = require("assert");
const fs = require("fs");
const vm = require("vm");

const html = fs.readFileSync("app/src/main/assets/AYB_Saha_Harita.html", "utf8");
const tablet = fs.readFileSync("app/src/main/assets/ayb-tablet.js", "utf8");

function scriptBody(id) {
  const tag = `<script id="${id}">`;
  const start = html.indexOf(tag);
  assert(start >= 0, `${id} bulunamadı`);
  const body = start + tag.length;
  const end = html.indexOf("</script>", body);
  assert(end > body, `${id} kapanışı bulunamadı`);
  return html.slice(body, end);
}

const layerCode = scriptBody("ayb_layer_manager_v16_js");
assert.doesNotThrow(() => new Function(layerCode), "aktif KMZ katman betiği sözdizimi");

const document = {
  readyState: "loading",
  addEventListener() {},
  querySelector() { return null; },
  body: { classList: { contains() { return false; }, toggle() {} }, appendChild() {} }
};
const window = { document, addEventListener() {}, console };
window.window = window;
const context = {
  window, document, console, TextDecoder, TextEncoder, Map, Set, Float64Array,
  Date, Math, JSON, Number, String, Array, Object, Promise, Blob, Response,
  CustomEvent: function CustomEvent() {}, setTimeout() {}, clearTimeout() {}
};
vm.createContext(context);
vm.runInContext(layerCode, context);

assert.strictEqual(typeof window.aybKmzHazirla, "function", "KMZ hazırlayıcı dışa açılmalı");
const lat = 40.98765432;
const lng = 32.12345678;
const features = [
  { kind: "point", name: "D1", props: { KATMAN: "DIREK", ID: "D1", JSON: '{"direk_no":"D1"}' }, points: [{ lat, lng }] },
  { kind: "point", name: "100 W", props: { KATMAN: "LAMBA", ID: "D1_LAMBA", JSON: '{"guc":"100"}', _kml_style_url: "#st_lamba" }, points: [{ lat: lat + 0.000032, lng }] },
  { kind: "line", name: "H1", props: { KATMAN: "HAT" }, points: [{ lat, lng }, { lat: lat + 0.0001, lng: lng + 0.0001 }] }
];
const prepared = window.aybKmzHazirla(features);
assert.strictEqual(prepared.length, 2, "ofsetli lamba bağımsız direk olmamalı");
assert.strictEqual(prepared.__aybLambaSay, 1);
assert.strictEqual(prepared.__aybLambaBaglanan, 1);
assert.strictEqual(prepared[0].points[0].lat, lat, "direk enlemi değişmemeli");
assert.strictEqual(prepared[0].points[0].lng, lng, "direk boylamı değişmemeli");
assert.strictEqual(prepared[1].points[0].lat, lat, "hat başlangıcı direkle çakışmalı");
assert.strictEqual(prepared[1].points[0].lng, lng, "hat başlangıcı direkle çakışmalı");
assert.strictEqual(prepared[0].props.lambalar[0].guc, "100");
assert.throws(() => window.aybKmzHazirla([
  { kind: "point", props: {}, points: [{ lat: 190, lng: 32 }] }
]), /geçersiz WGS84/);

assert(!tablet.includes("0.000032"), "KMZ dışa aktarımı koordinata görsel ofset eklememeli");
assert(tablet.includes("map.on('zoomanim', canliZoom)"), "büyük KMZ tuvali canlı zoom yapmalı");
assert(!tablet.includes("map.on('move', yenile)"), "KMZ tuvali her hareket karesinde yeniden çizilmemeli");
assert(tablet.includes("importFeatures:silImport"), "toplu silme KMZ kayıtlarını geri almaya yazmalı");
assert(tablet.includes("window.aybImportLayersRedraw"), "toplu silme KMZ tuvalini tazelemeli");

const bulkStart = tablet.indexOf("/* ===================== 2) TOPLU SİLME:");
const bulkEnd = tablet.indexOf("/* ===================== KATMANLI DIŞA AKTARIM", bulkStart);
assert(bulkStart >= 0 && bulkEnd > bulkStart, "toplu silme betiği bulunmalı");
const bulkWindow = {};
const bulkDocument = {
  getElementById() { return null; },
  querySelector() { return null; },
  createElement() { return { style: {}, querySelector() { return null; } }; },
  body: { style: {}, appendChild() {} }
};
const bulkContext = {
  window: bulkWindow, document: bulkDocument, console, Number, Math, Array, Object,
  setInterval() { return 1; }, clearInterval() {}, setTimeout() { return 1; }
};
bulkWindow.window = bulkWindow;
vm.createContext(bulkContext);
vm.runInContext(tablet.slice(bulkStart, bulkEnd), bulkContext);
assert.strictEqual(typeof bulkWindow.aybTopluSilImportSec, "function");
const ring = [[40, 32], [40, 33], [41, 33], [41, 32]];
const bulkLayers = [{
  id: "KMZ-1", visible: true, features: [
    { kind: "point", points: [{ lat: 40.5, lng: 32.5 }] },
    { kind: "line", points: [{ lat: 40.2, lng: 32.2 }, { lat: 40.8, lng: 32.8 }] },
    { kind: "point", points: [{ lat: 42, lng: 35 }] }
  ]
}, {
  id: "GIZLI", visible: false,
  features: [{ kind: "point", points: [{ lat: 40.5, lng: 32.5 }] }]
}];
const selected = bulkWindow.aybTopluSilImportSec(bulkLayers, ring);
assert.deepStrictEqual(Array.from(selected, x => [x.layerId, x.index]), [["KMZ-1", 0], ["KMZ-1", 1]]);
assert(layerCode.includes("#btnKMZImport,#btnMIFImport,#btnLayerManager"), "yenilenen menü düğmeleri olay delegasyonu ile çalışmalı");
assert(!layerCode.includes("__aybV16ButtonsCloned"), "tek kullanımlık KMZ düğme kilidi kalmamalı");
assert(layerCode.includes("function altlikTazele(){}"), "küçük KMZ katmanı zoomda yeniden kurulmamalı");

console.log("U8 regresyonları: KMZ koordinat, zoom, tekrar açma ve toplu silme OK");
