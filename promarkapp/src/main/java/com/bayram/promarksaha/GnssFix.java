package com.bayram.promarksaha;
public class GnssFix {
 public long timeMs; public double lat=Double.NaN,lon=Double.NaN,alt=Double.NaN,speedKmh=Double.NaN,courseDeg=Double.NaN,hdop=Double.NaN,hSigma=Double.NaN,vSigma=Double.NaN; public int satellites=0,quality=0;
 public boolean valid(){return quality>0&&!Double.isNaN(lat)&&!Double.isNaN(lon);} public String solution(){switch(quality){case 1:return "GPS";case 2:return "DGPS";case 4:return "RTK FIX";case 5:return "RTK FLOAT";case 6:return "TAHMIN";default:return quality==0?"NO FIX":"Q"+quality;}}
}
