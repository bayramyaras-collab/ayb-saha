package com.bayram.promarksaha;

import android.Manifest;
import android.annotation.SuppressLint;
import android.app.*;
import android.bluetooth.*;
import android.content.*;
import android.content.pm.PackageManager;
import android.graphics.Color;
import android.location.*;
import android.os.*;
import android.provider.Settings;
import android.view.*;
import android.widget.*;
import java.io.*;
import java.nio.charset.StandardCharsets;
import java.util.*;

public class ProMarkActivity extends Activity {
    private TextView state, sol, coord, nav, q;
    private Button mapBtn, someBtn, nd2Btn;
    private FieldMapView map;
    private BluetoothGnss bt;
    private LocationManager lm;
    private final NmeaParser parser = new NmeaParser();
    private GnssFix last;
    private SurveyPoint p1, p2, target;
    private final ArrayList<SurveyPoint> points = new ArrayList<>();
    private final ArrayList<SurveyPoint> some = new ArrayList<>();
    private boolean someMode = false, someFinishArmed = false;
    private int someIndex = 0;
    private long promarkLastMs = 0;
    private String source = "Tablet GPS";
    private static final int REQ_PERM = 50, REQ_BT_ON = 51, REQ_EXPORT = 52;
    private BluetoothDevice pendingBond;
    private AlertDialog scanDlg;
    private ArrayAdapter<String> scanAdapter;
    private final LinkedHashMap<String,BluetoothDevice> scanned = new LinkedHashMap<>();

    private final LocationListener deviceListener = loc -> {
        if (System.currentTimeMillis() - promarkLastMs < 3000) return;
        GnssFix f = new GnssFix();
        f.timeMs = System.currentTimeMillis();
        f.lat = loc.getLatitude(); f.lon = loc.getLongitude();
        f.alt = loc.hasAltitude() ? loc.getAltitude() : Double.NaN;
        f.quality = 1;
        f.hSigma = loc.hasAccuracy() ? loc.getAccuracy() : Double.NaN;
        if (Build.VERSION.SDK_INT >= 26 && loc.hasVerticalAccuracy()) f.vSigma = loc.getVerticalAccuracyMeters();
        if (loc.hasSpeed()) f.speedKmh = loc.getSpeed() * 3.6;
        if (loc.hasBearing()) f.courseDeg = loc.getBearing();
        onFix(f, "Tablet GPS");
    };

    private final BroadcastReceiver btReceiver = new BroadcastReceiver() {
        @SuppressLint("MissingPermission") public void onReceive(Context c, Intent i) {
            String a = i.getAction();
            BluetoothDevice d = i.getParcelableExtra(BluetoothDevice.EXTRA_DEVICE);
            if (d == null) return;
            if (BluetoothDevice.ACTION_FOUND.equals(a)) {
                String key = d.getAddress();
                if (!scanned.containsKey(key)) {
                    scanned.put(key, d);
                    String n = d.getName();
                    scanAdapter.add((n == null ? "Adsiz cihaz" : n) + "\n" + key + (d.getBondState()==BluetoothDevice.BOND_BONDED ? "  ✓ Eslesmis" : ""));
                    scanAdapter.notifyDataSetChanged();
                }
            } else if (BluetoothDevice.ACTION_BOND_STATE_CHANGED.equals(a) && pendingBond != null && pendingBond.getAddress().equals(d.getAddress()) && d.getBondState()==BluetoothDevice.BOND_BONDED) {
                pendingBond = null;
                if (scanDlg != null) scanDlg.dismiss();
                toast("Eslesme tamamlandi, baglaniyor");
                connect(d);
            }
        }
    };

    public void onCreate(Bundle b) {
        super.onCreate(b);
        bt = new BluetoothGnss(this);
        lm = (LocationManager)getSystemService(LOCATION_SERVICE);
        build();
        IntentFilter f = new IntentFilter();
        f.addAction(BluetoothDevice.ACTION_FOUND);
        f.addAction(BluetoothDevice.ACTION_BOND_STATE_CHANGED);
        if (Build.VERSION.SDK_INT >= 33) registerReceiver(btReceiver, f, Context.RECEIVER_NOT_EXPORTED); else registerReceiver(btReceiver, f);
        requestPermissionsAll();
    }

    private void build() {
        LinearLayout root = new LinearLayout(this); root.setOrientation(LinearLayout.VERTICAL); root.setBackgroundColor(0xff101316);
        LinearLayout top = new LinearLayout(this);
        state = tv("KAYNAK: Tablet GPS", 14); sol = tv("GPS BEKLENIYOR", 17);
        top.addView(state, new LinearLayout.LayoutParams(0,-2,1)); top.addView(sol); root.addView(top);
        q = tv("H: -   V: -", 13); coord = tv("X: -  Y: -  Z: -  TM: -", 13); nav = tv("Haritada uzun bas: hedef, hat veya SOME noktasi sec", 15); nav.setBackgroundColor(0xff252b30);
        root.addView(q); root.addView(coord); root.addView(nav);
        map = new FieldMapView(this); map.setListener(this::mapLongPress); root.addView(map, new LinearLayout.LayoutParams(-1,0,1));
        GridLayout g = new GridLayout(this); g.setColumnCount(3);
        String[] names = {"BLUETOOTH","HARITA: UYDU","KONUMUMA DON","TEK HEDEF","P1","P2","SOME AT","ND2 / BITIR","APLIKASYON","NOKTA AL","TEMIZLE","XYZ"};
        for (String s : names) {
            Button x = btn(s); if (s.startsWith("HARITA")) mapBtn = x; if (s.equals("SOME AT")) someBtn = x; if (s.startsWith("ND2")) nd2Btn = x;
            GridLayout.LayoutParams lp = new GridLayout.LayoutParams(); lp.width = 0; lp.columnSpec = GridLayout.spec(GridLayout.UNDEFINED,1f); g.addView(x, lp);
        }
        root.addView(g); setContentView(root);
    }

    private TextView tv(String s, int z){ TextView v=new TextView(this); v.setText(s); v.setTextSize(z); v.setTextColor(Color.WHITE); v.setPadding(10,6,10,6); return v; }
    private Button btn(String s){ Button b=new Button(this); b.setText(s); b.setTextSize(11); b.setOnClickListener(v->act(((Button)v).getText().toString())); return b; }

    private void act(String s) {
        if (s.equals("BLUETOOTH")) choose();
        else if (s.startsWith("HARITA")) mapBtn.setText("HARITA: " + map.cycleMode());
        else if (s.equals("KONUMUMA DON")) map.recenter();
        else if (s.equals("SOME AT")) toggleSome();
        else if (s.startsWith("ND2")) armNd2();
        else if (s.equals("TEK HEDEF")) toast("Haritada uzun basip TEK HEDEF sec");
        else if (s.equals("P1")) toast("Haritada uzun basip HAT P1 sec");
        else if (s.equals("P2")) toast("Haritada uzun basip HAT P2 sec");
        else if (s.equals("APLIKASYON")) toast(some.size()>=2 ? "SOME profil aplikasyonu aktif" : target!=null ? "Tek hedef aplikasyonu aktif" : p1!=null&&p2!=null ? "P1-P2 hat aplikasyonu aktif" : "Once hedef sec");
        else if (s.equals("NOKTA AL")) saveCurrentPoint();
        else if (s.equals("TEMIZLE")) clearAll();
        else if (s.equals("XYZ")) exportXYZ();
    }

    private void toggleSome() {
        if (!someMode) {
            someMode = true; someFinishArmed = false; some.clear(); someIndex = 0; target = p1 = p2 = null; map.clearMarks();
            someBtn.setText("SOME ACIK"); nd2Btn.setText("ND2 / BITIR");
            nav.setText("SOME: ilk uzun bas = ND1, sonraki = S1, S2, S3...");
            toast("SOME modu acildi");
        } else {
            someMode = false; someFinishArmed = false; someBtn.setText("SOME AT");
            toast("SOME modu kapandi");
        }
    }

    private void armNd2() {
        if (!someMode || some.isEmpty()) { toast("Once SOME AT ile ND1 ve ara noktalar olustur"); return; }
        someFinishArmed = true; nd2Btn.setText("HARITADA ND2 SEC");
        toast("Simdi haritada son noktaya uzun bas: ND2 olacak");
    }

    private void mapLongPress(double lat, double lon) {
        if (someMode) { addSomePoint(lat, lon); return; }
        String[] opts = {"TEK HEDEF - BURAYA GIT","HAT P1 - BASLANGIC","HAT P2 - BITIS"};
        new AlertDialog.Builder(this).setTitle("Harita noktasi").setMessage(String.format(Locale.US,"%.7f, %.7f",lat,lon)).setItems(opts,(d,w)->{
            if (w==0) setTarget(lat,lon); else setLinePoint(w==1,lat,lon);
        }).setNegativeButton("IPTAL",null).show();
    }

    private SurveyPoint mapPoint(String name, double lat, double lon, int cm) {
        GeoMath.TM t = GeoMath.toTM3(lat,lon,cm);
        SurveyPoint p = new SurveyPoint(); p.name=name; p.type="HARITA"; p.lat=lat; p.lon=lon; p.x=t.xNorthing; p.y=t.yEasting; p.z=Double.NaN; p.cm=cm; p.solution="HARITA"; return p;
    }

    private void addSomePoint(double lat, double lon) {
        int cm = some.isEmpty() ? GeoMath.autoCentralMeridian(lon) : some.get(0).cm;
        String name;
        if (some.isEmpty()) name = "ND1";
        else if (someFinishArmed) name = "ND2";
        else name = "S" + (++someIndex);
        SurveyPoint p = mapPoint(name,lat,lon,cm); p.type="SOME"; some.add(p); points.add(p); map.setProfileMarks(some);
        if ("ND2".equals(name)) {
            someMode=false; someFinishArmed=false; someBtn.setText("SOME AT"); nd2Btn.setText("ND2 / BITIR");
            nav.setText("PROFIL TAMAM: ND1 → " + (someIndex>0 ? "S1...S"+someIndex+" → " : "") + "ND2");
            toast("ND2 alindi, SOME profil tamamlandi");
        } else {
            nav.setText(name + " atildi | sonraki: " + (some.size()==1 ? "S1" : "S"+(someIndex+1)));
            toast(name + " atildi");
        }
        if (last!=null) navigate(last);
    }

    private void setTarget(double lat,double lon) {
        int cm=GeoMath.autoCentralMeridian(lon); target=mapPoint("HEDEF",lat,lon,cm); p1=p2=null; some.clear(); map.setProfileMarks(some); map.setLine(null,null); map.setTarget(target); if(last!=null)navigate(last);
    }

    private void setLinePoint(boolean first,double lat,double lon) {
        target=null; map.setTarget(null); some.clear(); map.setProfileMarks(some);
        if(first){ int cm=GeoMath.autoCentralMeridian(lon); p1=mapPoint("P1",lat,lon,cm); p2=null; }
        else { if(p1==null){ toast("Once P1 sec"); return; } p2=mapPoint("P2",lat,lon,p1.cm); }
        map.setLine(p1,p2); if(last!=null)navigate(last);
    }

    private void navigate(GnssFix f) {
        if (some.size() >= 2) { navigateSome(f); return; }
        if (target != null) { navigateTarget(f,target); return; }
        if (p1!=null && p2!=null) { navigateLine(f,p1,p2,"P2"); return; }
        nav.setText("Haritada uzun bas: hedef, hat veya SOME noktasi sec"); nav.setBackgroundColor(0xff252b30);
    }

    private void navigateTarget(GnssFix f, SurveyPoint t) {
        GeoMath.TM c=GeoMath.toTM3(f.lat,f.lon,t.cm); double dist=GeoMath.distance(c.xNorthing,c.yEasting,t.x,t.y); double bear=GeoMath.bearing(c.xNorthing,c.yEasting,t.x,t.y);
        double course=!Double.isNaN(f.courseDeg)&&f.speedKmh>0.6?f.courseDeg:bear, d=GeoMath.angleDiff(bear,course);
        String turn=Math.abs(d)<8?"DUZ GIT":(d>0?"SAGA DON ":"SOLA DON ")+String.format(Locale.US,"%.0f°",Math.abs(d));
        nav.setText(dist<0.15?String.format(Locale.US,"HEDEFTE %.2f m",dist):String.format(Locale.US,"HEDEFE %.2f m | %s",dist,turn));
        nav.setBackgroundColor(dist<0.15?0xff0d7a36:dist<3?0xff145a32:0xff28455c);
    }

    private void navigateLine(GnssFix f, SurveyPoint a, SurveyPoint b, String endName) {
        GeoMath.TM c=GeoMath.toTM3(f.lat,f.lon,a.cm); GeoMath.LineNav n=GeoMath.lineNav(a.x,a.y,b.x,b.y,c.xNorthing,c.yEasting);
        double h=!Double.isNaN(f.courseDeg)&&f.speedKmh>0.7?f.courseDeg:n.bearing, d=GeoMath.angleDiff(n.bearing,h);
        String side=n.crossTrack<0.08?"HAT UZERINDESIN":String.format(Locale.US,"%.2f m %s",n.crossTrack,n.rightOfLine?"SAGDASIN":"SOLDASIN");
        String steer=n.crossTrack<0.08?"DUZ GIT":n.rightOfLine?"SOLA GEL":"SAGA GEL";
        String rot=Math.abs(d)<8?"":String.format(Locale.US," | %s %.0f°",d>0?"SAGA DON":"SOLA DON",Math.abs(d));
        nav.setText(String.format(Locale.US,"%s | %s | %s %.2f m%s",side,steer,endName,n.remaining,rot));
        nav.setBackgroundColor(n.crossTrack<0.08?0xff176b36:n.crossTrack<0.5?0xff665115:0xff6b2424);
    }

    private void navigateSome(GnssFix f) {
        double best=Double.MAX_VALUE; int bestSeg=0; GeoMath.LineNav bestNav=null;
        for(int i=0;i<some.size()-1;i++){
            SurveyPoint a=some.get(i), b=some.get(i+1); GeoMath.TM c=GeoMath.toTM3(f.lat,f.lon,a.cm); GeoMath.LineNav n=GeoMath.lineNav(a.x,a.y,b.x,b.y,c.xNorthing,c.yEasting);
            if(n.crossTrack<best){best=n.crossTrack;bestSeg=i;bestNav=n;}
        }
        if(bestNav==null)return;
        SurveyPoint end=some.get(bestSeg+1); String side=bestNav.crossTrack<0.08?"HAT UZERINDESIN":String.format(Locale.US,"%.2f m %s",bestNav.crossTrack,bestNav.rightOfLine?"SAGDASIN":"SOLDASIN");
        String steer=bestNav.crossTrack<0.08?"DUZ GIT":bestNav.rightOfLine?"SOLA GEL":"SAGA GEL";
        nav.setText(String.format(Locale.US,"%s | %s | %s %.2f m",side,steer,end.name,bestNav.remaining));
        nav.setBackgroundColor(bestNav.crossTrack<0.08?0xff176b36:bestNav.crossTrack<0.5?0xff665115:0xff6b2424);
    }

    private void saveCurrentPoint() {
        if(last==null){toast("Konum yok");return;} GeoMath.TM t=GeoMath.toTM3(last.lat,last.lon); SurveyPoint p=new SurveyPoint(); p.name="N"+(points.size()+1); p.type="NOKTA"; p.lat=last.lat; p.lon=last.lon; p.x=t.xNorthing; p.y=t.yEasting; p.z=last.alt; p.cm=t.cm; p.solution=source; points.add(p); toast(p.name+" kaydedildi");
    }

    private void clearAll() { target=p1=p2=null; some.clear(); someMode=false; someFinishArmed=false; someIndex=0; map.clearMarks(); someBtn.setText("SOME AT"); nd2Btn.setText("ND2 / BITIR"); nav.setText("Temizlendi"); }

    private void onFix(GnssFix f,String src) {
        last=f; source=src; map.setFix(f); GeoMath.TM t=GeoMath.toTM3(f.lat,f.lon);
        state.setText("KAYNAK: "+src); sol.setText(src.equals("Tablet GPS")?"TABLET GPS":f.solution());
        sol.setTextColor(f.quality==4?0xff38d469:f.quality==2?0xff54b8ff:f.quality==5?0xffffc247:src.equals("Tablet GPS")?0xfff2d35c:0xffff8a00);
        q.setText(String.format(Locale.US,"H %s m  V %s m  HDOP %s",fmt(f.hSigma),fmt(f.vSigma),fmt(f.hdop)));
        coord.setText(String.format(Locale.US,"X %.3f  Y %.3f  Z %.3f  TM%d",t.xNorthing,t.yEasting,f.alt,t.cm));
        navigate(f);
    }

    private void requestPermissionsAll() {
        ArrayList<String> p=new ArrayList<>(); if(checkSelfPermission(Manifest.permission.ACCESS_FINE_LOCATION)!=PackageManager.PERMISSION_GRANTED)p.add(Manifest.permission.ACCESS_FINE_LOCATION);
        if(Build.VERSION.SDK_INT>=31){ if(checkSelfPermission(Manifest.permission.BLUETOOTH_CONNECT)!=PackageManager.PERMISSION_GRANTED)p.add(Manifest.permission.BLUETOOTH_CONNECT); if(checkSelfPermission(Manifest.permission.BLUETOOTH_SCAN)!=PackageManager.PERMISSION_GRANTED)p.add(Manifest.permission.BLUETOOTH_SCAN); }
        if(!p.isEmpty())requestPermissions(p.toArray(new String[0]),REQ_PERM); else startDeviceGps();
    }
    public void onRequestPermissionsResult(int r,String[] p,int[] g){super.onRequestPermissionsResult(r,p,g);if(r==REQ_PERM)startDeviceGps();}
    @SuppressLint("MissingPermission") private void startDeviceGps(){if(checkSelfPermission(Manifest.permission.ACCESS_FINE_LOCATION)!=PackageManager.PERMISSION_GRANTED)return;try{lm.requestLocationUpdates(LocationManager.GPS_PROVIDER,700,0.1f,deviceListener);Location l=lm.getLastKnownLocation(LocationManager.GPS_PROVIDER);if(l!=null)deviceListener.onLocationChanged(l);}catch(Exception e){state.setText("Tablet GPS kullanilamiyor");}}

    @SuppressLint("MissingPermission") private void choose(){requestPermissionsAll();BluetoothAdapter a=bt.adapter();if(a==null){toast("Bluetooth yok, tablet GPS ile devam");return;}if(!a.isEnabled()){startActivityForResult(new Intent(BluetoothAdapter.ACTION_REQUEST_ENABLE),REQ_BT_ON);return;}List<BluetoothDevice>d=bt.paired();ArrayList<String> rows=new ArrayList<>();for(BluetoothDevice x:d)rows.add("✓ "+safeName(x)+"\n"+x.getAddress());rows.add("YENI CIHAZ TARA");rows.add("BLUETOOTH AYARLARI");new AlertDialog.Builder(this).setTitle("ProMark / GNSS Bluetooth").setItems(rows.toArray(new String[0]),(x,w)->{if(w<d.size())connect(d.get(w));else if(w==d.size())scanDevices();else startActivity(new Intent(Settings.ACTION_BLUETOOTH_SETTINGS));}).setNegativeButton("KAPAT",null).show();}
    @SuppressLint("MissingPermission") private void scanDevices(){BluetoothAdapter a=bt.adapter();if(a==null||!a.isEnabled())return;scanned.clear();scanAdapter=new ArrayAdapter<>(this,android.R.layout.simple_list_item_1,new ArrayList<>());ListView list=new ListView(this);list.setAdapter(scanAdapter);scanDlg=new AlertDialog.Builder(this).setTitle("GNSS cihazlari taraniyor...").setView(list).setPositiveButton("YENIDEN TARA",null).setNegativeButton("KAPAT",null).create();scanDlg.setOnShowListener(z->scanDlg.getButton(AlertDialog.BUTTON_POSITIVE).setOnClickListener(v->{scanned.clear();scanAdapter.clear();bt.startDiscovery();}));list.setOnItemClickListener((p,v,pos,id)->{BluetoothDevice d=new ArrayList<>(scanned.values()).get(pos);bt.cancelDiscovery();if(d.getBondState()==BluetoothDevice.BOND_BONDED){scanDlg.dismiss();connect(d);}else{pendingBond=d;if(!d.createBond()){pendingBond=null;toast("Eslesme baslatilamadi");}}});scanDlg.setOnDismissListener(z->bt.cancelDiscovery());scanDlg.show();bt.startDiscovery();}
    @SuppressLint("MissingPermission") private String safeName(BluetoothDevice d){String n=d.getName();return n==null?"Adsiz cihaz":n;}
    @SuppressLint("MissingPermission") private void connect(BluetoothDevice d){state.setText("ProMark baglaniyor: "+safeName(d));bt.connect(d,new BluetoothGnss.Listener(){public void onLine(String l){GnssFix f=parser.parse(l);if(f!=null&&f.valid())runOnUiThread(()->{promarkLastMs=System.currentTimeMillis();String src=(f.quality==2||f.quality==4||f.quality==5)?"CORS/ProMark":"ProMark GPS";onFix(f,src);});}public void onState(String s){runOnUiThread(()->state.setText("ProMark: "+s+(System.currentTimeMillis()-promarkLastMs>3000?" | Tablet GPS yedek":"")));}});}

    private void exportXYZ(){if(points.isEmpty()){toast("Kayit yok");return;}Intent i=new Intent(Intent.ACTION_CREATE_DOCUMENT);i.addCategory(Intent.CATEGORY_OPENABLE);i.setType("text/plain");i.putExtra(Intent.EXTRA_TITLE,"ProMark_XYZ_"+System.currentTimeMillis()+".txt");startActivityForResult(i,REQ_EXPORT);}
    protected void onActivityResult(int r,int c,Intent d){super.onActivityResult(r,c,d);if(r==REQ_BT_ON&&c==RESULT_OK){choose();return;}if(r==REQ_EXPORT&&c==RESULT_OK&&d!=null&&d.getData()!=null)try(OutputStream o=getContentResolver().openOutputStream(d.getData())){for(SurveyPoint p:points)o.write(String.format(Locale.US,"%.3f\t%.3f\t%.3f\n",p.x,p.y,p.z).getBytes(StandardCharsets.UTF_8));toast("XYZ kaydedildi");}catch(Exception e){toast("Hata: "+e.getMessage());}}

    private String fmt(double v){return Double.isNaN(v)?"-":String.format(Locale.US,"%.2f",v);} private void toast(String s){Toast.makeText(this,s,Toast.LENGTH_LONG).show();}
    protected void onDestroy(){super.onDestroy();try{unregisterReceiver(btReceiver);}catch(Exception ignored){}try{lm.removeUpdates(deviceListener);}catch(Exception ignored){}bt.disconnect();}
}
