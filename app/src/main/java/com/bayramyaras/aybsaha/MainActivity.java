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
import java.nio.charset.StandardCharsets;

public class MainActivity extends Activity {

    private WebView web;
    private ValueCallback<Uri[]> filePathCallback;
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
            }
        });
        web.setWebChromeClient(new WebChromeClient() {
            @Override
            public void onGeolocationPermissionsShowPrompt(String origin,
                    GeolocationPermissions.Callback cb) { cb.invoke(origin, true, false); }
            @Override
            public boolean onShowFileChooser(WebView w, ValueCallback<Uri[]> cb,
                    FileChooserParams params) {
                filePathCallback = cb;
                try { startActivityForResult(Intent.createChooser(params.createIntent(), "Dosya Seç"), REQ_FILE); }
                catch (Exception e) { filePathCallback = null; return false; }
                return true;
            }
        });

        web.loadUrl("file:///android_asset/AYB_Saha_Harita.html");
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
                    cv.put(MediaStore.Downloads.RELATIVE_PATH, Environment.DIRECTORY_DOCUMENTS + "/AYB_Saha_Yedek");
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
                        cv.put(MediaStore.Downloads.RELATIVE_PATH, Environment.DIRECTORY_DOCUMENTS + "/AYB_Saha_Disa");
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
                        Toast.makeText(MainActivity.this, "Ayrıca Belgeler/AYB_Saha_Disa klasörüne kaydedildi.", Toast.LENGTH_SHORT).show();
                    } else {
                        Toast.makeText(MainActivity.this, "Kaydedildi: Belgeler/AYB_Saha_Disa", Toast.LENGTH_LONG).show();
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
                if (resultCode == Activity.RESULT_OK && data != null && data.getData() != null)
                    r = new Uri[]{ data.getData() };
                filePathCallback.onReceiveValue(r); filePathCallback = null;
            }
            return;
        }
        super.onActivityResult(requestCode, resultCode, data);
    }

    @Override
    public void onBackPressed() {
        if (web != null && web.canGoBack()) web.goBack(); else super.onBackPressed();
    }
}
