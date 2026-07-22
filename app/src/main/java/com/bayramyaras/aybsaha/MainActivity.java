package com.bayramyaras.aybsaha;

// AYB Saha Harita Metraj - Android WebView (veri guvenli)
// Hazirlayan: Bayram YARAS  -  0530 630 05 40

import android.Manifest;
import android.app.Activity;
import android.content.ContentValues;
import android.content.Intent;
import android.content.pm.PackageManager;
import android.net.Uri;
import android.os.Build;
import android.os.Bundle;
import android.os.Environment;
import android.provider.MediaStore;
import android.app.AlertDialog;
import android.content.DialogInterface;
import android.widget.EditText;
import android.webkit.JsResult;
import android.webkit.JsPromptResult;
import android.webkit.GeolocationPermissions;
import android.webkit.JavascriptInterface;
import android.webkit.ValueCallback;
import android.webkit.WebChromeClient;
import android.webkit.WebSettings;
import android.webkit.WebView;
import android.webkit.WebViewClient;
import android.widget.Toast;

import java.io.File;
import java.io.FileOutputStream;
import java.io.OutputStream;
import java.io.InputStream;
import java.io.ByteArrayOutputStream;
import android.util.Base64;
import android.database.Cursor;
import android.provider.OpenableColumns;
import java.nio.charset.StandardCharsets;

public class MainActivity extends Activity {

    private WebView web;
    private String pendingImportB64 = null;
    private String pendingImportName = null;
    private ValueCallback<Uri[]> filePathCallback;
    private Uri cameraOutputUri;
    private static final int REQ_PERM = 1001;
    private static final int REQ_FILE = 1002;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);

        if (Build.VERSION.SDK_INT >= 23) {
            String[] perms = { Manifest.permission.ACCESS_FINE_LOCATION,
                               Manifest.permission.ACCESS_COARSE_LOCATION };
            boolean need = false;
            for (String p : perms)
                if (checkSelfPermission(p) != PackageManager.PERMISSION_GRANTED) need = true;
            if (need) requestPermissions(perms, REQ_PERM);
        }

        web = new WebView(this);
        setContentView(web);

        WebSettings s = web.getSettings();
        s.setJavaScriptEnabled(true);
        s.setDomStorageEnabled(true);       // localStorage (verinin ana deposu) KALICI
        s.setDatabaseEnabled(true);
        s.setGeolocationEnabled(true);
        s.setAllowFileAccess(true);
        s.setAllowContentAccess(true);
        s.setBuiltInZoomControls(true);
        s.setDisplayZoomControls(false);
        s.setUseWideViewPort(true);
        s.setLoadWithOverviewMode(true);
        s.setCacheMode(WebSettings.LOAD_DEFAULT);
        s.setMediaPlaybackRequiresUserGesture(false);
        if (Build.VERSION.SDK_INT >= 21)
            s.setMixedContentMode(WebSettings.MIXED_CONTENT_COMPATIBILITY_MODE);
        try {
            s.getClass().getMethod("setAllowFileAccessFromFileURLs", boolean.class).invoke(s, true);
            s.getClass().getMethod("setAllowUniversalAccessFromFileURLs", boolean.class).invoke(s, true);
        } catch (Exception ignored) {}

        // Veri yedekleme koprusu: JS -> cihaz dosyasi
        web.addJavascriptInterface(new BackupBridge(), "AYBNative");

        web.setWebViewClient(new WebViewClient() {
            @Override public void onPageFinished(WebView v, String url) {
                // Tablet arayuz eklentisini (ekrana sigdir + Programi Kapat) yukle
                v.evaluateJavascript(
                  "(function(){if(document.getElementById('ayb-tablet-loader'))return;" +
                  "var s=document.createElement('script');s.id='ayb-tablet-loader';" +
                  "s.src='file:///android_asset/ayb-tablet.js';document.body.appendChild(s);})();", null);
                // WhatsApp vb. uygulamadan gelen DXF varsa programa aktar
                maybeInjectIncoming();
            }
        });
        web.setWebChromeClient(new WebChromeClient() {
            @Override
            public void onGeolocationPermissionsShowPrompt(String origin,
                    GeolocationPermissions.Callback cb) { cb.invoke(origin, true, false); }
            // --- Tarayici tarzi "file://" pencerelerini temiz Turkce diyaloglarla degistir ---
            @Override
            public boolean onJsAlert(WebView v, String url, String message, final JsResult result) {
                try {
                    new AlertDialog.Builder(MainActivity.this)
                        .setTitle("Körfezim Saha")
                        .setMessage(message)
                        .setCancelable(false)
                        .setPositiveButton("Tamam", new DialogInterface.OnClickListener(){
                            public void onClick(DialogInterface d, int w){ result.confirm(); }})
                        .show();
                } catch (Exception e) { result.confirm(); }
                return true;
            }
            @Override
            public boolean onJsConfirm(WebView v, String url, String message, final JsResult result) {
                try {
                    new AlertDialog.Builder(MainActivity.this)
                        .setTitle("Körfezim Saha")
                        .setMessage(message)
                        .setCancelable(false)
                        .setPositiveButton("Evet", new DialogInterface.OnClickListener(){
                            public void onClick(DialogInterface d, int w){ result.confirm(); }})
                        .setNegativeButton("İptal", new DialogInterface.OnClickListener(){
                            public void onClick(DialogInterface d, int w){ result.cancel(); }})
                        .show();
                } catch (Exception e) { result.confirm(); }
                return true;
            }
            @Override
            public boolean onJsPrompt(WebView v, String url, String message, String defaultValue, final JsPromptResult result) {
                try {
                    final EditText input = new EditText(MainActivity.this);
                    if (defaultValue != null) input.setText(defaultValue);
                    new AlertDialog.Builder(MainActivity.this)
                        .setTitle("Körfezim Saha")
                        .setMessage(message)
                        .setView(input)
                        .setCancelable(false)
                        .setPositiveButton("Tamam", new DialogInterface.OnClickListener(){
                            public void onClick(DialogInterface d, int w){ result.confirm(input.getText().toString()); }})
                        .setNegativeButton("İptal", new DialogInterface.OnClickListener(){
                            public void onClick(DialogInterface d, int w){ result.cancel(); }})
                        .show();
                } catch (Exception e) { result.cancel(); }
                return true;
            }
            @Override
            public boolean onShowFileChooser(WebView w, ValueCallback<Uri[]> cb,
                    FileChooserParams params) {
                if (filePathCallback != null) { try { filePathCallback.onReceiveValue(null); } catch (Exception ex) {} }
                filePathCallback = cb;
                cameraOutputUri = null;

                // Girdi RESIM mi istiyor? (foto) yoksa DOSYA mi? (.mif/.kmz/.json/.kml)
                boolean wantsImage = false; boolean capture = false;
                try {
                    if (params.isCaptureEnabled()) { wantsImage = true; capture = true; }
                    String[] at = params.getAcceptTypes();
                    if (at != null) for (String a : at) if (a != null && a.toLowerCase().contains("image")) wantsImage = true;
                } catch (Exception ex) { wantsImage = false; }

                // DOSYA girdisi: kamera YOK, tum dosyalari goster (.mif/.kmz/.json secilebilsin)
                if (!wantsImage) {
                    Intent get = new Intent(Intent.ACTION_GET_CONTENT);
                    get.addCategory(Intent.CATEGORY_OPENABLE);
                    get.setType("*/*");
                    try { startActivityForResult(Intent.createChooser(get, "Dosya seç"), REQ_FILE); }
                    catch (Exception e) { filePathCallback = null; return false; }
                    return true;
                }

                // KAMERA cikti dosyasi (MediaStore) hazirla
                Intent cameraIntent = null;
                try {
                    android.content.ContentValues cv = new android.content.ContentValues();
                    cv.put(MediaStore.Images.Media.DISPLAY_NAME, "AYB_" + System.currentTimeMillis() + ".jpg");
                    cv.put(MediaStore.Images.Media.MIME_TYPE, "image/jpeg");
                    if (android.os.Build.VERSION.SDK_INT >= 29)
                        cv.put(MediaStore.Images.Media.RELATIVE_PATH, Environment.DIRECTORY_PICTURES + "/AYB_Saha");
                    cameraOutputUri = getContentResolver().insert(MediaStore.Images.Media.EXTERNAL_CONTENT_URI, cv);
                    if (cameraOutputUri != null) {
                        cameraIntent = new Intent(MediaStore.ACTION_IMAGE_CAPTURE);
                        cameraIntent.putExtra(MediaStore.EXTRA_OUTPUT, cameraOutputUri);
                        cameraIntent.addFlags(Intent.FLAG_GRANT_WRITE_URI_PERMISSION);
                        cameraIntent.addFlags(Intent.FLAG_GRANT_READ_URI_PERMISSION);
                    }
                } catch (Exception ex) { cameraIntent = null; cameraOutputUri = null; }

                // capture=environment (foto dugmesi) ise KAMERAYI DOGRUDAN AC
                if (capture && cameraIntent != null) {
                    try { startActivityForResult(cameraIntent, REQ_FILE); return true; }
                    catch (Exception e) { /* kamera acilamadi -> asagida secim ekranina dus */ }
                }

                // Aksi halde: KAMERA + GALERI secim ekrani
                Intent gallery = new Intent(Intent.ACTION_GET_CONTENT);
                gallery.addCategory(Intent.CATEGORY_OPENABLE);
                gallery.setType("image/*");
                Intent chooser = new Intent(Intent.ACTION_CHOOSER);
                chooser.putExtra(Intent.EXTRA_INTENT, gallery);
                chooser.putExtra(Intent.EXTRA_TITLE, "Fotoğraf çek veya seç");
                if (cameraIntent != null)
                    chooser.putExtra(Intent.EXTRA_INITIAL_INTENTS, new Intent[]{ cameraIntent });

                try { startActivityForResult(chooser, REQ_FILE); }
                catch (Exception e) { filePathCallback = null; return false; }
                return true;
            }
        });

        web.loadUrl("file:///android_asset/AYB_Saha_Harita.html");
        readIncoming(getIntent());
    }

    @Override
    protected void onNewIntent(Intent intent) {
        super.onNewIntent(intent);
        setIntent(intent);
        readIncoming(intent);
        maybeInjectIncoming();
    }

    /** WhatsApp vb. uygulamadan gelen DXF/MİF/KML dosyasını oku ve beklet. */
    private void readIncoming(Intent intent) {
        if (intent == null) return;
        try {
            String action = intent.getAction();
            Uri uri = null;
            if (Intent.ACTION_VIEW.equals(action)) {
                uri = intent.getData();
            } else if (Intent.ACTION_SEND.equals(action)) {
                Object ex = intent.getParcelableExtra(Intent.EXTRA_STREAM);
                if (ex instanceof Uri) uri = (Uri) ex;
            }
            if (uri == null) return;
            String name = queryName(uri);
            if (name == null) name = "gelen.dxf";
            // sadece harita altlık türleri
            String low = name.toLowerCase();
            InputStream in = getContentResolver().openInputStream(uri);
            if (in == null) return;
            ByteArrayOutputStream bos = new ByteArrayOutputStream();
            byte[] buf = new byte[65536]; int n;
            while ((n = in.read(buf)) != -1) bos.write(buf, 0, n);
            in.close();
            byte[] data = bos.toByteArray();
            pendingImportB64 = Base64.encodeToString(data, Base64.NO_WRAP);
            pendingImportName = name;
        } catch (Exception e) {
            pendingImportB64 = null; pendingImportName = null;
        }
    }

    private String queryName(Uri uri) {
        String result = null;
        try {
            if ("content".equals(uri.getScheme())) {
                Cursor c = getContentResolver().query(uri, null, null, null, null);
                if (c != null) {
                    int idx = c.getColumnIndex(OpenableColumns.DISPLAY_NAME);
                    if (c.moveToFirst() && idx >= 0) result = c.getString(idx);
                    c.close();
                }
            }
            if (result == null) {
                result = uri.getLastPathSegment();
            }
        } catch (Exception e) {}
        return result;
    }

    /** Beklenen gelen dosyayı programa aktar (sayfa yüklendikten sonra). */
    private void maybeInjectIncoming() {
        if (pendingImportB64 == null || web == null) return;
        final String b64 = pendingImportB64;
        final String nm = (pendingImportName == null ? "gelen.dxf" : pendingImportName).replace("'", "");
        pendingImportB64 = null; pendingImportName = null;
        web.postDelayed(new Runnable() {
            @Override public void run() {
                try {
                    web.evaluateJavascript(
                      "(function(){var t=0;function go(){if(window.aybImportIncomingDxf){window.aybImportIncomingDxf('" +
                      b64 + "','" + nm + "');}else if(++t<30){setTimeout(go,500);}}go();})();", null);
                } catch (Exception e) {}
            }
        }, 1500);
    }

    // ---- JS'ten cagrilan yedekleme koprusu ----
    public class BackupBridge {
        // Yedegi hem uygulama klasorune hem de Belgeler/Indirilenler'e yazar.
        @JavascriptInterface
        public String saveBackup(String filename, String content) {
            String safe = filename == null ? "AYB_Yedek.json" : filename.replaceAll("[^A-Za-z0-9._-]", "_");
            boolean ok = false;
            // 1) Uygulamaya ozel klasor (izin gerektirmez, guncelleme/temizlikte kalir)
            try {
                File dir = new File(getExternalFilesDir(null), "AYB_Yedek");
                if (!dir.exists()) dir.mkdirs();
                FileOutputStream fo = new FileOutputStream(new File(dir, safe));
                fo.write(content.getBytes(StandardCharsets.UTF_8)); fo.close();
                ok = true;
            } catch (Exception e) {}
            // 2) Herkesin gorebilecegi Belgeler/Indirilenler (Android 10+ MediaStore)
            try {
                if (Build.VERSION.SDK_INT >= 29) {
                    ContentValues cv = new ContentValues();
                    cv.put(MediaStore.Downloads.DISPLAY_NAME, safe);
                    cv.put(MediaStore.Downloads.MIME_TYPE, "application/json");
                    cv.put(MediaStore.Downloads.RELATIVE_PATH, Environment.DIRECTORY_DOWNLOADS + "/AYB_Saha_Yedek");
                    Uri u = getContentResolver().insert(MediaStore.Downloads.EXTERNAL_CONTENT_URI, cv);
                    if (u != null) {
                        OutputStream os = getContentResolver().openOutputStream(u, "wt");
                        if (os != null) { os.write(content.getBytes(StandardCharsets.UTF_8)); os.close(); ok = true; }
                    }
                }
            } catch (Exception e) {}
            return ok ? "ok" : "err";
        }

        // Programi tamamen kapat (once JS yedek alir, sonra bunu cagirir)
        @JavascriptInterface
        public void closeApp() {
            runOnUiThread(new Runnable() { public void run() {
                try { finishAndRemoveTask(); } catch (Exception e) { finish(); }
            }});
        }

        // Disa aktarma: dosyayi Belgeler'e KAYDEDER + "nereye gonderilsin?" paylas ekrani (WhatsApp/Dosyalar...)
        @JavascriptInterface
        public void exportFile(final String filename, final String base64, final String mime) {
            runOnUiThread(new Runnable() { public void run() {
                try {
                    byte[] bytes = android.util.Base64.decode(base64, android.util.Base64.DEFAULT);
                    String safe = (filename == null ? "AYB_dosya" : filename).replaceAll("[^A-Za-z0-9._-]", "_");
                    String m = (mime == null || mime.isEmpty()) ? "application/octet-stream" : mime;
                    android.net.Uri shareUri = null;
                    if (Build.VERSION.SDK_INT >= 29) {
                        ContentValues cv = new ContentValues();
                        cv.put(MediaStore.Downloads.DISPLAY_NAME, safe);
                        cv.put(MediaStore.Downloads.MIME_TYPE, m);
                        cv.put(MediaStore.Downloads.RELATIVE_PATH, Environment.DIRECTORY_DOWNLOADS + "/AYB_Saha_Disa");
                        shareUri = getContentResolver().insert(MediaStore.Downloads.EXTERNAL_CONTENT_URI, cv);
                        if (shareUri != null) {
                            OutputStream os = getContentResolver().openOutputStream(shareUri, "wt");
                            if (os != null) { os.write(bytes); os.close(); }
                        }
                    } else {
                        File dir = new File(getExternalFilesDir(null), "AYB_Saha_Disa");
                        if (!dir.exists()) dir.mkdirs();
                        FileOutputStream fo = new FileOutputStream(new File(dir, safe));
                        fo.write(bytes); fo.close();
                    }
                    if (shareUri != null) {
                        Intent sh = new Intent(Intent.ACTION_SEND);
                        sh.setType(m);
                        sh.putExtra(Intent.EXTRA_STREAM, shareUri);
                        sh.addFlags(Intent.FLAG_GRANT_READ_URI_PERMISSION);
                        Intent chooser = Intent.createChooser(sh, "Nereye gönderilsin? (WhatsApp / Dosyalar)");
                        chooser.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK);
                        startActivity(chooser);
                        Toast.makeText(MainActivity.this, "Ayrıca İndirilenler/AYB_Saha_Disa klasörüne kaydedildi.", Toast.LENGTH_SHORT).show();
                    } else {
                        Toast.makeText(MainActivity.this, "Kaydedildi: İndirilenler/AYB_Saha_Disa", Toast.LENGTH_LONG).show();
                    }
                } catch (Exception e) {
                    Toast.makeText(MainActivity.this, "Dışa aktarma hatası: " + e.getMessage(), Toast.LENGTH_LONG).show();
                }
            }});
        }
    }

    @Override
    protected void onActivityResult(int requestCode, int resultCode, Intent data) {
        if (requestCode == REQ_FILE) {
            if (filePathCallback != null) {
                Uri[] r = null;
                if (resultCode == Activity.RESULT_OK) {
                    if (data != null && data.getData() != null) {
                        r = new Uri[]{ data.getData() };           // galeriden secildi
                    } else if (cameraOutputUri != null) {
                        r = new Uri[]{ cameraOutputUri };          // kameradan cekildi
                    }
                }
                filePathCallback.onReceiveValue(r); filePathCallback = null;
            }
            cameraOutputUri = null;
            return;
        }
        super.onActivityResult(requestCode, resultCode, data);
    }

    @Override
    public void onBackPressed() {
        if (web != null && web.canGoBack()) web.goBack(); else super.onBackPressed();
    }
}
