'use client';

import React, { useEffect, useState, useRef } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Script from 'next/script';
import { auth } from '@/lib/auth';
import { apiFetch, endpoints } from '@/lib/api';

// ─── Helpers ─────────────────────────────────────────────────────────────────
function fmt(val: string | null | undefined, fallback = '—') {
  return val || fallback;
}

function fmtDate(iso: string | null | undefined) {
  if (!iso) return '—';
  return new Date(iso).toLocaleString('en-IN', {
    day: '2-digit', month: 'long', year: 'numeric',
    hour: '2-digit', minute: '2-digit', hour12: true,
  });
}

function serviceLabel(type: string) {
  return type.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
}

// ─── Status / decision badge ──────────────────────────────────────────────────
function Badge({ text, variant }: { text: string; variant: 'success' | 'danger' | 'warning' | 'info' | 'gray' }) {
  const map = {
    success: 'bg-emerald-50 text-emerald-600 border-emerald-100',
    danger:  'bg-rose-50  text-rose-600  border-rose-100',
    warning: 'bg-amber-50 text-amber-600 border-amber-100',
    info:    'bg-sky-50    text-sky-600 border-sky-100',
    gray:    'bg-slate-50   text-slate-400   border-slate-100',
  };
  return (
    <span className={`inline-flex items-center rounded-full border px-4 py-1.5 text-[10px] font-black uppercase tracking-widest ${map[variant]}`}>
      {text}
    </span>
  );
}

function statusVariant(status: string): 'success' | 'danger' | 'warning' | 'info' | 'gray' {
  if (status === 'APPROVED') return 'success';
  if (status.includes('REJECTED')) return 'danger';
  if (status === 'UNDER_MANAGER_REVIEW') return 'info';
  if (status === 'UNDER_CLERK_REVIEW') return 'warning';
  return 'gray';
}

function decisionVariant(dec: string | undefined): 'success' | 'danger' | 'gray' {
  if (dec === 'APPROVED') return 'success';
  if (dec === 'REJECTED') return 'danger';
  return 'gray';
}

function confidenceVariant(level: string | undefined): 'success' | 'warning' | 'danger' | 'gray' {
  if (level === 'HIGH') return 'success';
  if (level === 'MEDIUM') return 'warning';
  if (level === 'LOW') return 'danger';
  return 'gray';
}

function Section({ title, icon, children }: { title: string; icon: React.ReactNode; children: React.ReactNode }) {
  return (
    <div className="rounded-3xl border border-slate-100 overflow-hidden shadow-sm bg-white">
      <div className="flex items-center gap-4 border-b border-slate-50 bg-slate-50/50 px-8 py-5">
        <span className="text-navy">{icon}</span>
        <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-navy">{title}</h3>
      </div>
      <div className="grid grid-cols-1 divide-y divide-slate-100 sm:grid-cols-2 sm:divide-y-0 sm:divide-x">
        {children}
      </div>
    </div>
  );
}

function Field({ label, value, wide = false }: { label: string; value: React.ReactNode; wide?: boolean }) {
  return (
    <div className={`px-8 py-6 ${wide ? 'sm:col-span-2' : ''}`}>
      <p className="text-[10px] font-black uppercase tracking-wider text-slate-400 mb-2">{label}</p>
      <div className="text-sm font-bold text-navy leading-relaxed">{value}</div>
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────
export default function ReportPage() {
  const router = useRouter();
  const params = useParams();
  const applicationId = params?.applicationId as string;
  const reportRef = useRef<HTMLDivElement>(null);

  const [report, setReport] = useState<any>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!auth.isAuthenticated()) {
      router.push('/login');
      return;
    }
    if (!applicationId) return;

    apiFetch(endpoints.report(applicationId))
      .then(setReport)
      .catch((err) => setError(err.message || 'Failed to load report'))
      .finally(() => setIsLoading(false));
  }, [applicationId, router]);

  const handleDownloadPdf = async () => {
    if (!reportRef.current || isGenerating) return;
    
    setIsGenerating(true);
    try {
      const htmlToImage = (window as any).htmlToImage;
      const jspdfLib = (window as any).jspdf;

      if (!htmlToImage || !jspdfLib) {
        throw new Error('PDF libraries are still loading. Please try again in a moment.');
      }

      const { jsPDF } = jspdfLib;
      const width = reportRef.current.scrollWidth;
      const height = reportRef.current.scrollHeight;

      const dataUrl = await htmlToImage.toJpeg(reportRef.current, {
        quality: 0.9,
        pixelRatio: 2, 
        backgroundColor: '#F8FAFC',
        width,
        height,
      });

      const pdf = new jsPDF('p', 'mm', 'a4');
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();
      
      const img = new Image();
      img.src = dataUrl;
      await new Promise((resolve) => (img.onload = resolve));
      
      const margin = 10;
      const maxWidth = pdfWidth - (margin * 2);
      const maxHeight = pdfHeight - (margin * 2);

      let finalWidth = maxWidth;
      let finalHeight = (img.height * finalWidth) / img.width;

      if (finalHeight > maxHeight) {
        finalHeight = maxHeight;
        finalWidth = (img.width * finalHeight) / img.height;
      }
      
      const xOffset = (pdfWidth - finalWidth) / 2;
      
      pdf.addImage(dataUrl, 'JPEG', xOffset, margin, finalWidth, finalHeight);
      pdf.save(`Service_1_Report_${applicationId}.pdf`);
    } catch (err: any) {
      console.error('PDF Generation Error:', err);
      alert('PDF generation failed. Using browser print as fallback.');
      window.print();
    } finally {
      setIsGenerating(false);
    }
  };

  if (isLoading) return (
    <div className="flex h-[calc(100vh-200px)] items-center justify-center">
      <div className="h-10 w-10 animate-spin rounded-full border-4 border-slate-100 border-t-navy" />
    </div>
  );

  if (error || !report) return (
    <div className="flex flex-col items-center justify-center gap-6 rounded-[32px] border border-danger/10 bg-danger/5 py-24 text-center mx-auto max-w-xl">
      <div className="h-16 w-16 flex items-center justify-center rounded-2xl bg-danger/10 text-danger shadow-sm">
        <svg className="h-8 w-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
        </svg>
      </div>
      <div>
        <h2 className="text-xl font-black text-navy uppercase tracking-tight">Report Not Found</h2>
        <p className="mt-2 text-sm font-medium text-slate-400">{error || 'The requested application report is not available at this time.'}</p>
      </div>
      <button onClick={() => router.back()} className="text-[10px] font-black uppercase tracking-widest text-navy bg-white border border-slate-100 px-6 py-3 rounded-full hover:bg-slate-50 transition-all">Go back</button>
    </div>
  );

  const isApproved = report.status === 'APPROVED';

  return (
    <div className="mx-auto max-w-4xl space-y-8 pb-32 pt-8">
      {/* Load PDF libraries via CDN */}
      <Script src="https://cdnjs.cloudflare.com/ajax/libs/html-to-image/1.11.11/html-to-image.min.js" strategy="lazyOnload" />
      <Script src="https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js" strategy="lazyOnload" />

      <div ref={reportRef} className="space-y-8 bg-slate-50/50 p-10 rounded-[48px] border border-slate-100 shadow-[0_40px_80px_-20px_rgba(15,23,42,0.05)]">

      {/* ── Official Header ─────────────────────────────────────────────────── */}
      <div className="rounded-[40px] border border-slate-100 bg-white shadow-xl overflow-hidden shadow-slate-200/50">
        <div className="h-2 bg-navy" />

        <div className="flex flex-col items-center gap-2 px-10 py-12 text-center relative overflow-hidden">
          <div className="absolute top-0 right-0 p-8 opacity-5 pointer-events-none">
             <svg className="h-40 w-40" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2L4.5 20.29l.71.71L12 18l6.79 3 .71-.71z" />
             </svg>
          </div>
          
          <div className="flex h-20 w-20 items-center justify-center rounded-[24px] bg-navy text-amber shadow-2xl mb-6 ring-4 ring-navy/5">
            <svg className="h-10 w-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5}
                d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
            </svg>
          </div>
          
          <p className="text-[10px] font-black uppercase tracking-[0.4em] text-amber-600 mb-2">Service 1 Official Report</p>
          <h1 className="text-5xl font-black tracking-tighter text-navy uppercase leading-none mb-1">Service 1</h1>
          <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Government Service Application Receipt</p>
          
          <div className="mt-8">
            <Badge
              text={report.status.replace(/_/g, ' ')}
              variant={statusVariant(report.status)}
            />
          </div>
        </div>

        <div className="flex items-center justify-between border-t border-slate-50 bg-slate-50/50 px-10 py-6">
          <div className="flex items-center gap-4">
            <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Application ID</span>
            <span className="text-xl font-black text-navy tracking-widest leading-none">{report.application_id}</span>
          </div>
          <div className="text-[10px] font-black uppercase tracking-widest text-slate-400">
            {isApproved
              ? `Finalized: ${fmtDate(report.updated_at)}`
              : `Submitted: ${fmtDate(report.created_at)}`}
          </div>
        </div>
      </div>

      {/* ── Details Grid ─────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 gap-8">
        <Section
          title="Service Details"
          icon={<svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>}
        >
          <Field label="Service Type" value={serviceLabel(report.service_type)} />
          <Field label="Submission Date" value={fmtDate(report.created_at)} />
        </Section>

        <Section
          title="Applicant Details"
          icon={<svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>}
        >
          <Field label="Full Name" value={fmt(report.applicant_name)} />
          <Field label="Date of Birth" value={fmt(report.dob)} />
          <Field label="Guardian's Name" value={fmt(report.parent_name)} />
          <Field label="Mobile Number" value={fmt(report.phone)} />
          <Field label="Address" value={fmt(report.address)} wide />

          {report.extra_data && (
            <div className="sm:col-span-2 divide-y divide-slate-100 border-t border-slate-100">
              <div className="bg-slate-50/50 px-8 py-4">
                <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-400 underline decoration-amber decoration-2 underline-offset-4">Additional Information</h4>
              </div>
              <div className="grid grid-cols-1 divide-y divide-slate-100 sm:grid-cols-2 sm:divide-y-0 sm:divide-x">
                {Object.entries(JSON.parse(report.extra_data)).map(([key, value]) => {
                  if (key.includes('base64')) return null;
                  const label = key.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
                  return <Field key={key} label={label} value={String(value)} />;
                })}
              </div>
              
              {(() => {
                const extra = JSON.parse(report.extra_data);
                if (extra.photo_base64 || extra.signature_base64) {
                  return (
                    <div className="grid grid-cols-1 divide-y divide-slate-100 sm:grid-cols-2 sm:divide-y-0 sm:divide-x bg-white">
                      {extra.photo_base64 && (
                        <div className="px-8 py-8">
                          <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-6">Passport Size Photo</p>
                          <div className="w-32 h-40 border-2 border-slate-100 rounded-3xl overflow-hidden bg-slate-50 shadow-inner ring-4 ring-white">
                            <img src={extra.photo_base64} alt="Passport Photo" className="w-full h-full object-cover" />
                          </div>
                        </div>
                      )}
                      {extra.signature_base64 && (
                        <div className="px-8 py-8">
                          <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-6">Signature</p>
                          <div className="w-56 h-28 border-2 border-slate-100 rounded-3xl flex items-center justify-center p-6 bg-slate-50 shadow-inner ring-4 ring-white">
                            <img src={extra.signature_base64} alt="Signature" className="max-w-full max-h-full object-contain" />
                          </div>
                        </div>
                      )}
                    </div>
                  );
                }
                return null;
              })()}
            </div>
          )}
        </Section>

        <Section
          title="System Verification"
          icon={<svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg>}
        >
          <Field
            label="Verification Score"
            value={
              <div className="flex items-center gap-4">
                <div className="h-2 w-32 overflow-hidden rounded-full bg-slate-100 border border-slate-50 shadow-inner">
                  <div
                    className={`h-full transition-all duration-1000 ${(report.risk_score ?? 0) <= 20 ? 'bg-emerald-500' : (report.risk_score ?? 0) <= 40 ? 'bg-amber-500' : 'bg-rose-500'}`}
                    style={{ width: `${Math.min(report.risk_score ?? 0, 100)}%` }}
                  />
                </div>
                <span className="font-black text-navy text-base">{fmt(String(report.risk_score))}%</span>
              </div>
            }
          />
          <Field
            label="Status"
            value={
              <Badge
                text={fmt(report.confidence_level)}
                variant={confidenceVariant(report.confidence_level)}
              />
            }
          />
        </Section>

        <Section
          title="Review History"
          icon={<svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" /></svg>}
        >
          <Field
            label="Clerk Decision"
            value={
              report.clerk_decision
                ? <Badge text={report.clerk_decision} variant={decisionVariant(report.clerk_decision)} />
                : <span className="text-[10px] font-black uppercase text-slate-300 tracking-widest">Pending</span>
            }
          />
          <Field label="Clerk Remark" value={fmt(report.clerk_remark)} />
          <Field
            label="Manager Decision"
            value={
              report.manager_decision
                ? <Badge text={report.manager_decision} variant={decisionVariant(report.manager_decision)} />
                : <span className="text-[10px] font-black uppercase text-slate-300 tracking-widest">Pending</span>
            }
          />
          <Field label="Manager Remark" value={fmt(report.manager_remark)} />
        </Section>

        {report.blockchain && (
          <Section
            title="Security Verification"
            icon={<svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" /></svg>}
          >
            <Field label="Database Status" value={<Badge text={report.blockchain.integrity_status} variant={report.blockchain.integrity_status === 'VALID' ? 'success' : 'danger'} />} />
            <Field label="Reference Code" value={<span className="font-mono text-[10px] bg-slate-100 px-2 py-1 rounded-md text-navy">{fmt(report.blockchain.block_ref)}</span>} />
            <Field label="Security Hash" value={<span className="font-mono text-[10px] break-all bg-slate-100 p-3 rounded-2xl block text-navy leading-loose">{fmt(report.blockchain.record_hash)}</span>} wide />
          </Section>
        )}

        {/* ── Final Decision ───────────────────────────────────────────────────── */}
        <div className={`rounded-[40px] border p-10 flex flex-col items-center text-center ${isApproved ? 'border-emerald-100 bg-emerald-50/20' : 'border-slate-100 bg-white'} shadow-xl`}>
          <div className={`flex h-20 w-20 items-center justify-center rounded-[24px] mb-6 shadow-2xl ${isApproved ? 'bg-emerald-500 text-white' : 'bg-slate-100 text-slate-300'}`}>
            {isApproved ? (
              <svg className="h-10 w-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            ) : (
              <svg className="h-10 w-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            )}
          </div>
          
          <div className="space-y-2">
            <p className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400">Application Status</p>
            <h2 className={`text-4xl font-black tracking-tighter uppercase ${isApproved ? 'text-emerald-500' : 'text-navy'}`}>
              {isApproved ? 'Approved' : `Status: ${report.status.replace(/_/g, ' ')}`}
            </h2>
          </div>
          
          {isApproved && report.updated_at && (
            <div className="mt-8 p-6 rounded-3xl bg-white border border-emerald-100/50 shadow-sm max-w-lg">
              <p className="text-sm font-medium text-slate-500 leading-relaxed italic">
                Application processed on <strong className="text-navy">{fmtDate(report.updated_at)}</strong>. 
                Processed by Service 1 Portal.
              </p>
            </div>
          )}
        </div>
      </div>

      </div>

      {/* ── Actions ─────────────────────────────────────────────────────────── */}
      <div className="flex flex-wrap items-center justify-center gap-4 relative z-50">
        <button
          onClick={() => router.back()}
          className="group flex items-center gap-3 rounded-2xl border border-slate-100 bg-white px-8 py-4 text-xs font-black uppercase tracking-widest text-navy hover:bg-slate-50 transition-all shadow-xl hover:-translate-y-1 active:translate-y-0"
        >
          <svg className="h-4 w-4 transition-transform group-hover:-translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
          Back to Dashboard
        </button>
        <button
          onClick={() => window.print()}
          className="group flex items-center gap-3 rounded-2xl bg-navy px-8 py-4 text-xs font-black uppercase tracking-widest text-white hover:bg-navy-light transition-all shadow-xl hover:-translate-y-1 active:translate-y-0"
        >
          <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" /></svg>
          Print Report
        </button>
        <button
          onClick={handleDownloadPdf}
          disabled={isGenerating}
          className={`group flex items-center gap-3 rounded-2xl border border-slate-100 px-8 py-4 text-xs font-black uppercase tracking-widest transition-all shadow-xl hover:-translate-y-1 active:translate-y-0 ${
            isGenerating ? 'bg-slate-50 text-slate-300 cursor-wait' : 'bg-white text-navy hover:bg-slate-50'
          }`}
        >
          {isGenerating ? (
            <div className="h-4 w-4 animate-spin rounded-full border-2 border-navy/20 border-t-navy" />
          ) : (
            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
          )}
          {isGenerating ? 'Generating PDF...' : 'Download PDF'} 
        </button>
      </div>

      {/* ── Footer ──────────────────────────────────────────────────────────── */}
      <div className="text-center pt-8">
        <p className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-300">
          Service 1 Official Document · Secure Verification
        </p>
        <div className="mt-4 flex items-center justify-center gap-4">
           <div className="h-px w-12 bg-slate-100"></div>
           <p className="text-[9px] font-bold text-slate-200 uppercase tracking-widest">
             Ref: {report.application_id} · Timestamp: {new Date().getTime()}
           </p>
           <div className="h-px w-12 bg-slate-100"></div>
        </div>
      </div>

    </div>
  );
}
