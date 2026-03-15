'use client';

import React, { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { apiFetch, endpoints } from '@/lib/api';
import { auth } from '@/lib/auth';
import Link from 'next/link';
import { Html5Qrcode } from 'html5-qrcode';

export default function PDSDistribute() {
  const router = useRouter();
  const [citizenCode, setCitizenCode] = useState('');
  const [citizenData, setCitizenData] = useState<any>(null);
  const [isVerifying, setIsVerifying] = useState(false);
  const [isOnline, setIsOnline] = useState(true);
  const [isScanning, setIsScanning] = useState(false);
  const [scannerError, setScannerError] = useState('');
  const [distributionList, setDistributionList] = useState<any[]>([
    { item_name: 'Rice', quantity: 0, unit: 'KG', entitled: 15 },
    { item_name: 'Wheat', quantity: 0, unit: 'KG', entitled: 10 },
    { item_name: 'Sugar', quantity: 0, unit: 'KG', entitled: 2 },
    { item_name: 'Palm Oil', quantity: 0, unit: 'Litre', entitled: 5 },
    { item_name: 'Salt', quantity: 0, unit: 'KG', entitled: 1 },
  ]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [statusMsg, setStatusMsg] = useState({ type: '', text: '' });
  
  const html5QrCodeRef = useRef<Html5Qrcode | null>(null);

  useEffect(() => {
    if (!auth.isAuthenticated() || auth.getRole() !== 'pds_admin') {
      router.push('/pds/login');
      return;
    }

    const checkOnline = () => setIsOnline(navigator.onLine);
    window.addEventListener('online', checkOnline);
    window.addEventListener('offline', checkOnline);
    checkOnline();

    return () => {
      window.removeEventListener('online', checkOnline);
      window.removeEventListener('offline', checkOnline);
      stopScanner();
    };
  }, [router]);

  const startScanner = async () => {
    setScannerError('');
    setIsScanning(true);
    setStatusMsg({ type: '', text: '' });
    
    try {
      const devices = await Html5Qrcode.getCameras();
      if (!devices || devices.length === 0) {
        throw new Error("No camera detected on this device.");
      }

      const html5QrCode = new Html5Qrcode("reader");
      html5QrCodeRef.current = html5QrCode;

      const config = { fps: 10, qrbox: { width: 250, height: 250 } };
      
      await html5QrCode.start(
        { facingMode: "environment" }, 
        config,
        (decodedText) => {
          setCitizenCode(decodedText);
          stopScanner();
          verifyCitizen(decodedText);
        },
        (errorMessage) => {
          // Silent for scan failures
        }
      );
    } catch (err: any) {
      setIsScanning(false);
      if (err.name === 'NotAllowedError' || err.message?.includes('Permission denied')) {
        setScannerError("Camera access denied. Please allow camera permission to scan QR.");
      } else if (err.message?.includes('No camera detected')) {
        setScannerError("No camera detected on this device.");
      } else {
        setScannerError("Unable to start camera. Please retry or use manual citizen code entry.");
      }
      console.error("Scanner Error:", err);
    }
  };

  const stopScanner = async () => {
    if (html5QrCodeRef.current && html5QrCodeRef.current.isScanning) {
      try {
        await html5QrCodeRef.current.stop();
        html5QrCodeRef.current.clear();
      } catch (e) {
        console.error("Error stopping scanner", e);
      }
    }
    setIsScanning(false);
  };

  const verifyCitizen = async (code: string) => {
    if (!code) {
      setStatusMsg({ type: 'danger', text: 'Please enter a valid citizen code.' });
      return;
    }

    setIsVerifying(true);
    setStatusMsg({ type: '', text: '' });
    setCitizenData(null);

    try {
      if (navigator.onLine) {
        const data = await apiFetch(endpoints.pdsCitizen(code));
        if (!data || !data.citizen_code) {
          throw new Error('Citizen not registered. Please verify the code or register the citizen first.');
        }
        setCitizenData(data);
        setStatusMsg({ type: 'success', text: 'Citizen verified successfully.' });
        
        // Cache citizen data locally
        const cache = JSON.parse(localStorage.getItem('pds_citizen_cache') || '{}');
        cache[code] = data;
        localStorage.setItem('pds_citizen_cache', JSON.stringify(cache));
      } else {
        const cache = JSON.parse(localStorage.getItem('pds_citizen_cache') || '{}');
        if (cache[code]) {
          setCitizenData({ ...cache[code], verification_mode: 'OFFLINE' });
          setStatusMsg({ type: 'success', text: 'Citizen verified from local cache (Offline Mode)' });
        } else {
          throw new Error('Citizen not available in offline records. Internet required for first-time verification.');
        }
      }
    } catch (err: any) {
      let msg = err.message;
      if (msg.includes('404') || msg.toLowerCase().includes('not found')) {
        msg = "Citizen not registered. Please verify the code or register the citizen first.";
      }
      setStatusMsg({ type: 'danger', text: msg });
      setCitizenData(null);
    } finally {
      setIsVerifying(false);
    }
  };

  const handleManualInput = (e: React.FormEvent) => {
    e.preventDefault();
    verifyCitizen(citizenCode);
  };

  const updateQuantity = (index: number, val: string) => {
    const newList = [...distributionList];
    newList[index].quantity = parseFloat(val) || 0;
    setDistributionList(newList);
  };

  const handleSubmit = async () => {
    if (!citizenData) return;
    
    setIsSubmitting(true);
    const transaction = {
      transaction_id: crypto.randomUUID(),
      citizen_code: citizenData.citizen_code,
      beneficiary_name: citizenData.beneficiary_name,
      ration_card_number: citizenData.ration_card_number,
      card_type: citizenData.card_type,
      shop_id: 'Shop-VLS-001',
      issued_month: new Date().toLocaleString('default', { month: 'long', year: 'numeric' }),
      issued_date: new Date().toISOString().split('T')[0],
      verification_mode: isOnline ? 'QR_VERIFIED' : 'OFFLINE',
      items: distributionList.filter(i => i.quantity > 0).map(i => ({
        item_name: i.item_name,
        quantity: i.quantity,
        unit: i.unit
      })),
      sync_status: isOnline ? 'SYNCED' : 'PENDING_SYNC'
    };

    try {
      if (isOnline) {
        await apiFetch(endpoints.pdsDistribute, {
          method: 'POST',
          body: JSON.stringify(transaction)
        });
        setStatusMsg({ type: 'success', text: 'Distribution recorded and synced successfully!' });
      } else {
        const queue = JSON.parse(localStorage.getItem('pds_offline_queue') || '[]');
        queue.push(transaction);
        localStorage.setItem('pds_offline_queue', JSON.stringify(queue));
        setStatusMsg({ type: 'warning', text: 'Offline: Transaction saved to local sync queue.' });
      }
      
      // Reset form
      setTimeout(() => {
        setCitizenData(null);
        setCitizenCode('');
        setDistributionList(distributionList.map(i => ({ ...i, quantity: 0 })));
        setStatusMsg({ type: '', text: '' });
      }, 3000);

    } catch (err: any) {
      setStatusMsg({ type: 'danger', text: `Error: ${err.message}` });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-20">
      <div className="flex items-center justify-between bg-white p-8 rounded-[32px] shadow-[0_40px_80px_-20px_rgba(15,23,42,0.08)] border border-slate-100">
        <div className="flex items-center gap-5">
          <Link href="/pds/dashboard" className="h-12 w-12 flex items-center justify-center bg-slate-50 text-navy hover:bg-white hover:shadow-lg rounded-2xl transition-all border border-slate-100 group">
            <svg className="h-6 w-6 group-hover:-translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
          </Link>
          <div>
            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-amber-600 mb-1">Ration Distribution</p>
            <h1 className="text-3xl font-black text-navy tracking-tighter uppercase leading-none">Distribute Goods</h1>
          </div>
        </div>
        <div className={`flex items-center gap-2 px-5 py-2 rounded-full text-[10px] font-black uppercase tracking-widest border ${isOnline ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 'bg-rose-50 text-rose-600 border-rose-100'}`}>
          <div className={`h-2 w-2 rounded-full ${isOnline ? 'bg-emerald-500' : 'bg-rose-500'} animate-pulse`}></div>
          {isOnline ? 'Network Active' : 'Offline Buffer'}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Step 1: Verification */}
        <section className="space-y-6">
          <div className="bg-white p-10 rounded-[32px] shadow-soft border border-slate-100">
            <h2 className="text-xs font-black text-navy uppercase tracking-[0.2em] mb-8 flex items-center gap-3">
              <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-navy text-white text-[10px] shadow-lg">01</span>
              Beneficiary Identification
            </h2>

            {!isScanning && !scannerError ? (
              <div className="space-y-6">
                <button 
                  onClick={startScanner}
                  className="w-full aspect-video rounded-3xl bg-slate-50 border-2 border-dashed border-slate-200 flex flex-col items-center justify-center gap-4 hover:bg-slate-100 transition-all group overflow-hidden relative"
                >
                  <div className="absolute inset-0 bg-navy/5 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                  <div className="relative h-20 w-20 rounded-2xl bg-white shadow-xl flex items-center justify-center text-navy group-hover:scale-110 transition-transform duration-500">
                    <svg className="h-10 w-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z" />
                    </svg>
                  </div>
                  <span className="relative text-xs font-black uppercase tracking-[0.2em] text-navy">Scan QR Code</span>
                </button>

                <div className="relative">
                  <div className="absolute inset-0 flex items-center"><span className="w-full border-t border-border"></span></div>
                  <div className="relative flex justify-center text-xs uppercase tracking-widest font-black text-muted"><span className="bg-white px-4">OR</span></div>
                </div>

                <form onSubmit={handleManualInput} className="space-y-4">
                  <div>
                    <label className="text-[10px] font-black text-muted uppercase tracking-widest mb-2 block">Citizen Code</label>
                    <input 
                      type="text" 
                      value={citizenCode}
                      onChange={(e) => setCitizenCode(e.target.value)}
                      placeholder="Enter Beneficiary Code"
                      className="w-full rounded-xl border border-border bg-background px-4 py-3 text-xs font-bold text-navy focus:border-navy focus:outline-none transition-all placeholder:font-medium"
                    />
                  </div>
                  <button type="submit" className="w-full bg-navy text-white px-6 py-4 rounded-xl font-bold text-xs hover:bg-navy-light transition-all shadow-md">Verify Beneficiary</button>
                </form>
              </div>
            ) : isScanning ? (
              <div className="space-y-4">
                <div id="reader" className="overflow-hidden rounded-2xl border-2 border-primary/20 aspect-square bg-black"></div>
                <div className="flex gap-2">
                  <button 
                    onClick={stopScanner}
                    className="flex-1 py-3 bg-danger/10 text-danger text-[10px] font-black uppercase tracking-widest rounded-xl hover:bg-danger/20 transition-all border border-danger/20"
                  >
                    Stop Scanner
                  </button>
                  <button 
                    onClick={() => { stopScanner(); startScanner(); }}
                    className="flex-1 py-3 bg-navy/10 text-navy text-[10px] font-black uppercase tracking-widest rounded-xl hover:bg-navy/20 transition-all border border-navy/20"
                  >
                    Retry Camera
                  </button>
                </div>
              </div>
            ) : (
              <div className="bg-danger/5 border border-danger/20 p-8 rounded-2xl text-center space-y-4">
                <div className="h-12 w-12 rounded-full bg-danger/10 flex items-center justify-center text-danger mx-auto">
                  <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                </div>
                <p className="text-sm font-bold text-danger">{scannerError}</p>
                <div className="flex gap-2">
                  <button 
                    onClick={startScanner}
                    className="flex-1 py-3 bg-navy text-white text-[10px] font-black uppercase tracking-widest rounded-xl hover:bg-navy-light transition-all shadow-sm"
                  >
                    Retry Camera
                  </button>
                  <button 
                    onClick={() => setScannerError('')}
                    className="flex-1 py-3 bg-slate-100 text-navy text-[10px] font-black uppercase tracking-widest rounded-xl hover:bg-slate-200 transition-all"
                  >
                    Manual Entry
                  </button>
                </div>
              </div>
            )}
          </div>

          {isVerifying && (
            <div className="bg-white p-12 rounded-3xl shadow-soft border border-border text-center">
              <div className="h-10 w-10 animate-spin rounded-full border-4 border-navy/20 border-t-navy mx-auto mb-4"></div>
              <p className="text-xs font-black text-navy uppercase tracking-widest animate-pulse">Verifying Identification...</p>
            </div>
          )}

          {statusMsg.text && (
             <div className={`p-4 rounded-2xl text-xs font-bold border flex items-start gap-3 ${
               statusMsg.type === 'success' ? 'bg-success/10 text-success border-success/20' : 
               statusMsg.type === 'warning' ? 'bg-amber/10 text-amber-700 border-amber-200' :
               statusMsg.type === 'info' ? 'bg-primary/10 text-primary border-primary/20' :
               'bg-danger/10 text-danger border-danger/20'
             } animate-in fade-in zoom-in duration-200`}>
               <span className="mt-0.5">
                 {statusMsg.type === 'success' ? '✓' : statusMsg.type === 'warning' ? '⚠' : 'ℹ'}
               </span>
               <p>{statusMsg.text}</p>
             </div>
          )}

          {citizenData && (
            <div className="bg-white p-8 rounded-3xl shadow-soft border border-border space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500 ring-2 ring-success/20">
              <div className="flex items-center gap-5">
                 <div className="h-16 w-16 rounded-2xl bg-navy text-white flex items-center justify-center shadow-xl">
                   <svg className="h-10 w-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                     <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                   </svg>
                 </div>
                 <div>
                   <h3 className="text-xl font-black text-navy uppercase tracking-tighter">{citizenData.beneficiary_name}</h3>
                   <p className="text-[10px] font-black text-amber-600 uppercase tracking-widest mt-1">Verified Beneficiary</p>
                 </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100">
                  <p className="text-[10px] font-black text-muted uppercase tracking-widest">Ration Card</p>
                  <p className="text-sm font-bold text-navy mt-1">{citizenData.ration_card_number}</p>
                </div>
                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100">
                  <p className="text-[10px] font-black text-muted uppercase tracking-widest">Card Type</p>
                  <p className="text-sm font-bold text-navy mt-1">{citizenData.card_type}</p>
                </div>
              </div>

              <div className="flex items-center justify-between p-5 rounded-2xl bg-emerald-50 border border-emerald-100">
                <span className="text-xs font-black text-emerald-800 uppercase tracking-widest">Status</span>
                <span className="px-4 py-1.5 bg-emerald-500 text-white text-[10px] font-black rounded-lg uppercase tracking-[0.2em] shadow-lg">VERIFIED</span>
              </div>
            </div>
          )}
        </section>

        {/* Step 2: Distribution Form */}
        <section className="space-y-6">
          <div className={`bg-white p-8 rounded-3xl shadow-soft border border-border h-full flex flex-col transition-all duration-500 ${!citizenData ? 'opacity-40 grayscale pointer-events-none' : ''}`}>
            <h2 className="text-lg font-bold text-navy mb-6 flex items-center gap-2">
              <span className="flex h-6 w-6 items-center justify-center rounded-full bg-navy text-white text-[10px]">2</span>
              Items to Issue
            </h2>

            <div className="flex-1 space-y-4">
              {distributionList.map((item, idx) => (
                <div key={item.item_name} className="flex items-center justify-between p-4 rounded-2xl bg-slate-50 border border-slate-100 group transition-all">
                  <div className="flex-1">
                    <p className="text-sm font-bold text-navy">{item.item_name}</p>
                    <p className="text-[10px] font-bold text-muted uppercase tracking-widest mt-0.5">Entitled: {item.entitled} {item.unit}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <input 
                      type="number" 
                      value={item.quantity || ''}
                      onChange={(e) => updateQuantity(idx, e.target.value)}
                      placeholder="0.0"
                      className="w-20 rounded-xl border border-border bg-white px-3 py-2 text-right text-sm font-bold text-navy focus:ring-2 focus:ring-navy focus:outline-none transition-all"
                    />
                    <span className="text-xs font-black text-muted/50 uppercase w-8">{item.unit}</span>
                  </div>
                </div>
              ))}

              <div className="mt-8 space-y-4">
                 <div className="p-4 rounded-2xl bg-amber/5 border border-amber/20">
                    <p className="text-[10px] font-black text-amber-700 uppercase tracking-widest mb-1">Stock Verification</p>
                    <p className="text-xs font-medium text-navy/80">System will verify available stock for Shop-VLS-001.</p>
                 </div>

                 <button 
                  onClick={handleSubmit}
                  disabled={!citizenData || isSubmitting}
                  className="w-full py-5 bg-amber text-navy text-sm font-black uppercase tracking-widest rounded-2xl shadow-xl hover:bg-amber-light hover:shadow-2xl hover:-translate-y-0.5 transition-all disabled:opacity-30 disabled:translate-y-0 disabled:shadow-none"
                 >
                   {isSubmitting ? (
                     <div className="flex items-center justify-center gap-3">
                       <div className="h-5 w-5 animate-spin rounded-full border-2 border-navy/30 border-t-navy"></div>
                       {isOnline ? 'Processing Sync...' : 'Saving Locally...'}
                     </div>
                   ) : (
                     'Confirm Distribution'
                   )}
                 </button>
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
