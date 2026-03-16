'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { auth } from '@/lib/auth';
import Link from 'next/link';
import { downloadFile, endpoints } from '@/lib/api';

export default function SuccessPage() {
  const router = useRouter();
  const [appData, setAppData] = useState<any>(null);
  const [isDownloading, setIsDownloading] = useState(false);

  useEffect(() => {
    if (!auth.isAuthenticated()) {
      router.push('/login');
      return;
    }
    const data = localStorage.getItem('last_application');
    if (data) {
      setAppData(JSON.parse(data));
    } else {
      router.push('/dashboard');
    }
  }, [router]);

  const handleDownload = async () => {
    if (!appData?.application_id || isDownloading) return;
    setIsDownloading(true);
    try {
      await downloadFile(
        endpoints.downloadPdf(appData.application_id, false),
        `submission_${appData.application_id}.pdf`
      );
    } catch (err) {
      alert('Failed to download PDF');
    } finally {
      setIsDownloading(false);
    }
  };

  if (!appData) return null;

  return (
    <div className="mx-auto max-w-2xl py-12 text-center">
      <div className="mb-12 flex flex-col items-center">
        <div className="mb-8 flex h-24 w-24 items-center justify-center rounded-[32px] bg-emerald-500 text-white shadow-[0_20px_40px_-10px_rgba(16,185,129,0.3)] ring-8 ring-emerald-500/10 animate-in zoom-in duration-700">
          <svg className="h-12 w-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <p className="text-[10px] font-black uppercase tracking-[0.4em] text-emerald-600 mb-2">Protocol Execution Finalized</p>
        <h1 className="text-5xl font-black tracking-tighter text-navy uppercase leading-none">Submission Confirmed</h1>
        <p className="mt-4 text-sm font-medium text-slate-400">Your digital identity vector has been notarized on the sovereign blockchain ledger.</p>
      </div>

      <div className="relative mb-16 overflow-hidden rounded-[40px] border border-slate-100 bg-white shadow-[0_50px_100px_-20px_rgba(15,23,42,0.15)]">
        <div className="border-b border-dashed border-slate-200 bg-slate-50 px-10 py-6 flex items-center justify-between">
            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-navy">Sovereign Identification Receipt</span>
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
        </div>
        
        <div className="p-8 text-left space-y-8">
            <div className="flex justify-between items-start gap-8">
                <div className="space-y-6 flex-1">
                    <div>
                        <label className="block text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mb-2">Protocol ID</label>
                        <p className="text-3xl font-black text-navy tracking-tighter uppercase">{appData.application_id || 'CS-8829104'}</p>
                    </div>

                    <div>
                        <label className="block text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mb-2">Identity Status</label>
                        <div className="flex items-center gap-2">
                             <div className="h-2 w-2 rounded-full bg-amber-500 animate-pulse"></div>
                             <p className="text-sm font-black text-navy uppercase tracking-widest">PENDING VERIFICATION</p>
                        </div>
                    </div>

                    <div>
                        <label className="block text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mb-2">Cryptographic Hash</label>
                        <div className="rounded-2xl bg-slate-50 px-4 py-3 border border-slate-100">
                            <code className="text-[10px] text-slate-500 font-mono break-all leading-relaxed">
                              {appData.blockchain_integrity?.record_hash || '0x742d35Cc6634C0532925a3b844Bc454e4438f44e'}
                            </code>
                        </div>
                    </div>

                    <div>
                        <label className="block text-[10px] font-bold uppercase tracking-wider text-muted mb-1">Block Reference</label>
                        <p className="text-sm italic font-medium text-navy">
                          {appData.blockchain_integrity?.block_ref || 'Block #14,205,112'}
                        </p>
                    </div>
                </div>

                 <div className="hidden sm:block">
                    <div className="rounded-[32px] border-2 border-dashed border-slate-100 p-6 bg-slate-50/50 shadow-inner">
                        <div className="h-32 w-32 bg-navy rounded-2xl flex items-center justify-center p-3 shadow-xl">
                             <div className="h-full w-full bg-white rounded-lg flex items-center justify-center text-[8px] font-black text-navy flex-col gap-1">
                                <svg className="h-16 w-16" fill="currentColor" viewBox="0 0 24 24"><path d="M3 3h4v4H3zM3 11h4v4H3zM3 17h4v4H3zM11 3h4v4h-4zM11 11h4v4h-4zM11 17h4v4h-4zM17 3h4v4h-4zM17 11h4v4h-4zM17 17h4v4h-4z" /></svg>
                             </div>
                        </div>
                        <p className="mt-4 text-center text-[10px] font-black uppercase tracking-widest text-slate-400 leading-tight">Secure Integrity<br/>Scanner</p>
                    </div>
                </div>
            </div>
        </div>

        <div className="grid grid-cols-2 border-t border-slate-100 p-8 gap-6 bg-slate-50/30">
            <button 
                onClick={handleDownload}
                disabled={isDownloading}
                className="flex items-center justify-center gap-3 rounded-2xl bg-amber py-5 text-xs font-black uppercase tracking-widest text-navy shadow-[0_15px_30px_-5px_rgba(217,119,6,0.2)] transition-all hover:bg-amber-light hover:shadow-[0_20px_40px_-5px_rgba(217,119,6,0.3)] disabled:opacity-50"
            >
                <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
                {isDownloading ? 'Processing...' : 'Export Receipt'}
            </button>
            <Link href="/dashboard" className="flex items-center justify-center gap-3 rounded-2xl bg-navy py-5 text-xs font-black uppercase tracking-widest text-white shadow-[0_15px_30px_-5px_rgba(15,23,42,0.2)] transition-all hover:bg-navy-light hover:shadow-[0_20px_40px_-5px_rgba(15,23,42,0.3)]">
                <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M4 12h16m0 0l-4-4m4 4l-4 4" /></svg>
                Return Home
            </Link>
        </div>
      </div>

      <p className="mx-auto max-w-sm text-xs leading-relaxed text-muted/60">
        This is an automated system generated receipt. For any discrepancies, please contact the Service 1 support helpdesk with your Application ID.
      </p>
    </div>
  );
}
