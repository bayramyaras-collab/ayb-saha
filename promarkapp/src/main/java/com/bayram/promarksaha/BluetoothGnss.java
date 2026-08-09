package com.bayram.promarksaha;
import android.annotation.SuppressLint;import android.bluetooth.*;import android.content.Context;import java.io.*;import java.util.*;import java.util.concurrent.*;
public class BluetoothGnss { public interface Listener{void onLine(String l);void onState(String s);} private final BluetoothAdapter adapter;private BluetoothSocket socket;private ExecutorService ex=Executors.newSingleThreadExecutor();private volatile boolean running;private static final UUID SPP=UUID.fromString("00001101-0000-1000-8000-00805F9B34FB");
 public BluetoothGnss(Context c){BluetoothManager m=(BluetoothManager)c.getSystemService(Context.BLUETOOTH_SERVICE);adapter=m==null?null:m.getAdapter();}
 public BluetoothAdapter adapter(){return adapter;}
 @SuppressLint("MissingPermission") public List<BluetoothDevice> paired(){return adapter==null?Collections.emptyList():new ArrayList<>(adapter.getBondedDevices());}
 @SuppressLint("MissingPermission") public boolean startDiscovery(){if(adapter==null)return false;if(adapter.isDiscovering())adapter.cancelDiscovery();return adapter.startDiscovery();}
 @SuppressLint("MissingPermission") public void cancelDiscovery(){if(adapter!=null&&adapter.isDiscovering())adapter.cancelDiscovery();}
 @SuppressLint("MissingPermission") public void connect(BluetoothDevice d,Listener l){disconnect();cancelDiscovery();running=true;ex=Executors.newSingleThreadExecutor();ex.submit(()->{try{l.onState("BAGLANIYOR");socket=d.createRfcommSocketToServiceRecord(SPP);socket.connect();l.onState("BAGLI: "+d.getName());BufferedReader r=new BufferedReader(new InputStreamReader(socket.getInputStream()));String s;while(running&&(s=r.readLine())!=null)l.onLine(s);}catch(Exception e){l.onState("BAGLANTI HATASI: "+e.getMessage());}finally{close();}});}
 public void disconnect(){running=false;close();if(ex!=null)ex.shutdownNow();} private void close(){try{if(socket!=null)socket.close();}catch(Exception ignored){}socket=null;}}
