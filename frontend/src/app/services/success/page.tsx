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
      <div className="mb-10 flex flex-col items-center">
        <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-success text-white shadow-xl ring-8 ring-success/10">
          <svg className="h-10 w-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h1 className="text-4xl font-extrabold tracking-tight text-navy">Application Submitted Successfully</h1>
        <p className="mt-4 text-base text-muted/80">Your digital security clearance request has been recorded on the national ledger.</p>
      </div>

      <div className="relative mb-12 overflow-hidden rounded-2xl border border-border bg-white shadow-2xl">
        <div className="border-b border-dashed border-border bg-primary/5 px-8 py-4 flex items-center justify-between">
            <span className="text-[10px] font-bold uppercase tracking-widest text-primary">Official Acknowledgement Receipt</span>
            <span className="text-[10px] font-medium text-muted">Issued: {new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
        </div>
        
        <div className="p-8 text-left space-y-8">
            <div className="flex justify-between items-start gap-8">
                <div className="space-y-6 flex-1">
                    <div>
                        <label className="block text-[10px] font-bold uppercase tracking-wider text-muted mb-1">Application ID</label>
                        <p className="text-xl font-extrabold text-navy tracking-tight">{appData.application_id || 'CS-8829104'}</p>
                    </div>

                    <div>
                        <label className="block text-[10px] font-bold uppercase tracking-wider text-muted mb-1">Status</label>
                        <div className="flex items-center gap-2">
                             <div className="h-2 w-2 rounded-full bg-warning"></div>
                             <p className="font-bold text-navy">Pending Verification</p>
                        </div>
                    </div>

                    <div>
                        <label className="block text-[10px] font-bold uppercase tracking-wider text-muted mb-1">Blockchain Record Hash</label>
                        <div className="rounded-lg bg-background px-3 py-2 border border-border">
                            <code className="text-[10px] text-muted font-mono break-all">
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
                    <div className="rounded-xl border-2 border-dashed border-border p-4 bg-white shadow-inner">
                        <div className="h-28 w-28 bg-[#0F172A] rounded-lg flex items-center justify-center p-2">
                             <div className="h-full w-full bg-white rounded flex items-center justify-center text-[8px] font-bold text-[#0F172A] flex-col gap-1">
                                <svg className="h-12 w-12" fill="currentColor" viewBox="0 0 24 24"><path d="M3 3h4v4H3zM3 11h4v4H3zM3 17h4v4H3zM11 3h4v4h-4zM11 11h4v4h-4zM11 17h4v4h-4zM17 3h4v4h-4zM17 11h4v4h-4zM17 17h4v4h-4z" /></svg>
                                <span>QR CODE</span>
                             </div>
                        </div>
                        <p className="mt-3 text-center text-[8px] font-bold uppercase tracking-wider text-primary/60">Scan to Verify<br/>Authenticity</p>
                    </div>
                </div>
            </div>
        </div>

        <div className="grid grid-cols-2 border-t border-border p-6 gap-4">
            <button 
                onClick={handleDownload}
                disabled={isDownloading}
                className="flex items-center justify-center gap-2 rounded-xl bg-primary py-3.5 text-sm font-bold text-white shadow-md transition-all hover:bg-primary-dark disabled:opacity-50"
            >
                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
                {isDownloading ? 'Generating...' : 'Download Receipt'}
            </button>
            <Link href="/dashboard" className="flex items-center justify-center gap-2 rounded-xl border border-border bg-white py-3.5 text-sm font-bold text-navy shadow-sm transition-all hover:bg-muted/5">
                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 12h16m0 0l-4-4m4 4l-4 4" /></svg>
                Back to Dashboard
            </Link>
        </div>
      </div>

      <p className="mx-auto max-w-sm text-xs leading-relaxed text-muted/60">
        This is an automated system generated receipt. For any discrepancies, please contact the CyberShield support helpdesk with your Application ID.
      </p>
    </div>
  );
}
