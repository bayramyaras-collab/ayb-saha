package com.bayram.promarksaha;
import java.util.Locale;
public class NmeaParser {
 private final GnssFix fix=new GnssFix();
 public synchronized GnssFix parse(String raw){if(raw==null)return null;String s=raw.trim();if(!s.startsWith("$"))return null;int star=s.indexOf('*');if(star>0&&!checksumOk(s))return null;String[] p=s.substring(0,star>0?star:s.length()).split(",",-1);if(p.length==0)return null;String type=p[0].length()>=6?p[0].substring(p[0].length()-3).toUpperCase(Locale.US):p[0];try{if("GGA".equals(type))gga(p);else if("GST".equals(type))gst(p);else if("RMC".equals(type))rmc(p);else return null;fix.timeMs=System.currentTimeMillis();return copy(fix);}catch(Exception e){return null;}}
 private void gga(String[]p){if(p.length<10)return;fix.lat=dm(p[2],p[3]);fix.lon=dm(p[4],p[5]);fix.quality=iv(p[6]);fix.satellites=iv(p[7]);fix.hdop=dv(p[8]);fix.alt=dv(p[9]);}
 private void gst(String[]p){if(p.length<9)return;double a=dv(p[6]),b=dv(p[7]);fix.hSigma=Math.hypot(a,b);fix.vSigma=dv(p[8]);}
 private void rmc(String[]p){if(p.length<9||!"A".equalsIgnoreCase(p[2]))return;double a=dm(p[3],p[4]),b=dm(p[5],p[6]);if(!Double.isNaN(a))fix.lat=a;if(!Double.isNaN(b))fix.lon=b;double k=dv(p[7]);fix.speedKmh=Double.isNaN(k)?Double.NaN:k*1.852;fix.courseDeg=dv(p[8]);}
 private static double dm(String s,String h){if(s==null||s.isEmpty())return Double.NaN;double v=Double.parseDouble(s);int d=(int)(v/100);double r=d+(v-d*100)/60.0;if("S".equalsIgnoreCase(h)||"W".equalsIgnoreCase(h))r=-r;return r;}
 private static boolean checksumOk(String s){int st=s.indexOf('*');if(st<0||st+2>=s.length())return true;int c=0;for(int i=1;i<st;i++)c^=s.charAt(i);try{return c==Integer.parseInt(s.substring(st+1,Math.min(st+3,s.length())),16);}catch(Exception e){return false;}}
 private static double dv(String s){try{return s==null||s.isEmpty()?Double.NaN:Double.parseDouble(s);}catch(Exception e){return Double.NaN;}} private static int iv(String s){try{return Integer.parseInt(s);}catch(Exception e){return 0;}}
 private static GnssFix copy(GnssFix f){GnssFix x=new GnssFix();x.timeMs=f.timeMs;x.lat=f.lat;x.lon=f.lon;x.alt=f.alt;x.speedKmh=f.speedKmh;x.courseDeg=f.courseDeg;x.hdop=f.hdop;x.hSigma=f.hSigma;x.vSigma=f.vSigma;x.satellites=f.satellites;x.quality=f.quality;return x;}
}
