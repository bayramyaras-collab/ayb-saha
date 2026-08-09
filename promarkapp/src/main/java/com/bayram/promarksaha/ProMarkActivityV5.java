package com.bayram.promarksaha;

import android.app.*;
import android.os.Bundle;
import android.view.*;
import android.widget.*;
import java.lang.reflect.*;
import java.util.*;

public class ProMarkActivityV5 extends ProMarkActivity {
    private static final String[] ENGELLER = {
        "Tarla Sınırı",
        "Tarla Yolu",
        "Kadastro / Servis Yolu",
        "Köy Yolu",
        "Karayolu",
        "Bölünmüş Yol",
        "Otoyol",
        "Demiryolu",
        "Dere",
        "Kuru Dere",
        "Kanal",
        "Sulama Kanalı",
        "Menfez",
        "Köprü",
        "Vadi Atlaması",
        "Şev / Uçurum",
        "Bina / Yapı",
        "Duvar / Çit",
        "Ağaçlık / Orman",
        "Mevcut ENH",
        "Mevcut OG Hattı",
        "Mevcut AG Hattı",
        "Yeraltı Enerji Kablosu",
        "Telekom / Fiber Hattı",
        "Doğalgaz Hattı",
        "İçme Suyu Hattı",
        "Kanalizasyon Hattı",
        "Boru Hattı",
        "Trafo / Şalt Tesisi",
        "Enerji Tesisi / Direk",
        "Göl / Gölet",
        "Bataklık / Sulak Alan",
        "Taşlık / Kayalık",
        "Heyelan Bölgesi",
        "Maden / Ocak Alanı",
        "Mezarlık",
        "Sit / Koruma Alanı",
        "Özel Mülkiyet Geçişi",
        "Diğer"
    };

    @Override public void onCreate(Bundle b) {
        super.onCreate(b);
        addObstacleButton(getWindow().getDecorView());
    }

    private boolean addObstacleButton(View v) {
        if (v instanceof GridLayout) {
            GridLayout g=(GridLayout)v;
            Button b=new Button(this);
            b.setText("ENGEL"); b.setTextSize(11);
            b.setOnClickListener(x->showObstacleCatalog());
            GridLayout.LayoutParams lp=new GridLayout.LayoutParams();
            lp.width=0; lp.columnSpec=GridLayout.spec(GridLayout.UNDEFINED,1f);
            g.addView(b,lp);
            return true;
        }
        if (v instanceof ViewGroup) {
            ViewGroup vg=(ViewGroup)v;
            for(int i=0;i<vg.getChildCount();i++) if(addObstacleButton(vg.getChildAt(i))) return true;
        }
        return false;
    }

    private void showObstacleCatalog() {
        GnssFix fix=getPrivate("last", GnssFix.class);
        if(fix==null || !fix.valid()) { Toast.makeText(this,"Konum bekleniyor",Toast.LENGTH_LONG).show(); return; }
        new AlertDialog.Builder(this)
            .setTitle("ENGEL TÜRÜ")
            .setItems(ENGELLER,(d,w)->{
                String secim=ENGELLER[w];
                if("Diğer".equals(secim)) askCustomObstacle(); else askObstacleNote(secim);
            })
            .setNegativeButton("İPTAL",null)
            .show();
    }

    private void askCustomObstacle() {
        EditText e=new EditText(this); e.setHint("Engel adını yaz"); e.setSingleLine(true);
        new AlertDialog.Builder(this).setTitle("DİĞER ENGEL").setView(e)
            .setPositiveButton("DEVAM",(d,w)->{
                String s=e.getText().toString().trim();
                if(s.isEmpty()) s="Diğer";
                askObstacleNote(s);
            }).setNegativeButton("İPTAL",null).show();
    }

    private void askObstacleNote(String type) {
        EditText e=new EditText(this); e.setHint("Açıklama (isteğe bağlı)");
        new AlertDialog.Builder(this).setTitle(type).setView(e)
            .setPositiveButton("KAYDET",(d,w)->saveObstacle(type,e.getText().toString().trim()))
            .setNegativeButton("İPTAL",null).show();
    }

    @SuppressWarnings("unchecked")
    private void saveObstacle(String type,String note) {
        GnssFix fix=getPrivate("last", GnssFix.class);
        if(fix==null || !fix.valid()) { Toast.makeText(this,"Konum yok",Toast.LENGTH_LONG).show(); return; }
        String source=getPrivate("source", String.class); if(source==null) source="GPS";
        ArrayList<SurveyPoint> pts=getPrivate("points", ArrayList.class);
        if(pts==null) { Toast.makeText(this,"Kayıt listesine erişilemedi",Toast.LENGTH_LONG).show(); return; }
        GeoMath.TM t=GeoMath.toTM3(fix.lat,fix.lon);
        SurveyPoint p=new SurveyPoint();
        p.name="E"+(countObstacles(pts)+1);
        p.type="ENGEL";
        p.description=note.isEmpty()?type:type+" - "+note;
        p.lat=fix.lat; p.lon=fix.lon; p.x=t.xNorthing; p.y=t.yEasting; p.z=fix.alt; p.cm=t.cm;
        p.hSigma=fix.hSigma; p.vSigma=fix.vSigma; p.solution=source; p.timeMs=System.currentTimeMillis();
        pts.add(p);
        Toast.makeText(this,p.name+"  "+type+" kaydedildi",Toast.LENGTH_LONG).show();
    }

    private int countObstacles(ArrayList<SurveyPoint> pts) {
        int n=0; for(SurveyPoint p:pts) if("ENGEL".equals(p.type)) n++; return n;
    }

    @SuppressWarnings("unchecked")
    private <T> T getPrivate(String name,Class<T> cls) {
        try {
            Field f=ProMarkActivity.class.getDeclaredField(name); f.setAccessible(true);
            Object o=f.get(this); return (T)o;
        } catch(Exception e) { return null; }
    }
}
