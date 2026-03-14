'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { auth } from '@/lib/auth';
import { apiFetch, endpoints } from '@/lib/api';
import DataTable from '@/components/DataTable';
import SummaryCard from '@/components/SummaryCard';

export default function ManagerDashboard() {
  const router = useRouter();
  const [applications, setApplications] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [actionState, setActionState] = useState<Record<string, { remark: string; loading: boolean }>>({});
  const [selectedReport, setSelectedReport] = useState<string | null>(null);

  useEffect(() => {
    const role = auth.getRole();
    if (!auth.isAuthenticated() || (role !== 'manager' && role !== 'admin')) {
      router.push('/login');
      return;
    }
    loadApplications();
  }, [router]);

  const loadApplications = () => {
    setIsLoading(true);
    apiFetch(endpoints.managerApplications)
      .then((data) => setApplications(data.applications || []))
      .catch(() => setApplications([]))
      .finally(() => setIsLoading(false));
  };

  const setRemark = (appId: string, remark: string) => {
    setActionState((prev) => ({
      ...prev,
      [appId]: { ...prev[appId], remark },
    }));
  };

  const handleDecision = async (appId: string, type: 'approve' | 'reject') => {
    const remark = actionState[appId]?.remark || '';
    setActionState((prev) => ({ ...prev, [appId]: { ...prev[appId], loading: true } }));
    try {
      const url = type === 'approve' ? endpoints.managerApprove(appId) : endpoints.managerReject(appId);
      const result = await apiFetch(url, {
        method: 'POST',
        body: JSON.stringify({ remark }),
      });
      if (type === 'approve' && result.final_report) {
        setSelectedReport(result.final_report);
      }
      loadApplications();
    } catch (err: any) {
      alert(err.message || 'Action failed');
    } finally {
      setActionState((prev) => ({ ...prev, [appId]: { ...prev[appId], loading: false } }));
    }
  };

  const confidenceBadge = (level: string) => {
    const map: Record<string, string> = {
      HIGH:   'bg-emerald-50 text-emerald-600 border-emerald-100',
      MEDIUM: 'bg-amber-50 text-amber-600 border-amber-100',
      LOW:    'bg-rose-50 text-rose-600 border-rose-100',
    };
    return (
      <span className={`rounded-full px-3 py-1 text-[10px] font-black uppercase tracking-widest border ${map[level] || 'bg-slate-50 text-slate-400 border-slate-100'}`}>
        {level === 'HIGH' ? 'VERIFIED' : level === 'MEDIUM' ? 'PENDING' : 'FLAGGED'}
      </span>
    );
  };

  const columns = [
    {
      header: 'Application ID',
      accessor: 'application_id',
      render: (val: string) => <span className="font-bold text-primary text-xs">{val}</span>,
    },
    {
      header: 'Service',
      accessor: 'service_type',
      render: (val: string) => (
        <span className="rounded-md bg-muted/10 px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-muted-foreground border border-border/50">
          {val.replace(/_/g, ' ')}
        </span>
      ),
    },
    {
      header: 'Applicant',
      accessor: 'applicant_name',
      render: (val: string) => (
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-navy text-white flex items-center justify-center text-xs font-black shadow-md">
            {val.charAt(0).toUpperCase()}
          </div>
          <div>
            <p className="font-black text-navy text-xs uppercase tracking-tight">{val}</p>
          </div>
        </div>
      ),
    },
    {
      header: 'Phone',
      accessor: 'phone',
      render: (val: string) => <span className="text-sm font-mono">{val}</span>,
    },
    {
      header: 'Address',
      accessor: 'address',
      render: (val: string) => <span className="text-xs text-muted max-w-[150px] block truncate" title={val}>{val}</span>,
    },
    {
      header: 'Verification Score',
      accessor: 'risk_score',
      render: (val: number) => (
        <div className="flex items-center gap-3">
          <div className="h-1.5 w-20 overflow-hidden rounded-full bg-muted/10">
            <div
              className={`h-full ${val <= 20 ? 'bg-success' : val <= 40 ? 'bg-warning' : 'bg-danger'}`}
              style={{ width: `${Math.min(val, 100)}%` }}
            />
          </div>
          <span className="text-xs font-bold text-navy">{val}</span>
        </div>
      ),
    },
    {
      header: 'Status',
      accessor: 'confidence_level',
      render: (val: string) => confidenceBadge(val),
    },
    {
      header: 'Clerk Note',
      accessor: 'clerk_remark',
      render: (val: string) => (
        <span className="text-xs text-muted italic">{val || '—'}</span>
      ),
    },
    {
      header: 'Actions',
      accessor: 'application_id',
      render: (appId: string) => {
        const state = actionState[appId] || { remark: '', loading: false };
        return (
          <div className="flex flex-col gap-2 min-w-[180px]">
            <input
              type="text"
              placeholder="Final remark (optional)"
              value={state.remark || ''}
              onChange={(e) => setRemark(appId, e.target.value)}
              className="rounded-lg border border-border bg-background px-2 py-1 text-xs focus:border-primary focus:outline-none"
            />
            <div className="flex gap-2">
              <button
                disabled={state.loading}
                onClick={() => handleDecision(appId, 'approve')}
                className="flex-1 rounded-lg bg-success/10 px-2 py-1.5 text-[10px] font-bold text-success hover:bg-success/20 transition-all disabled:opacity-50"
              >
                ✓ Approve
              </button>
              <button
                disabled={state.loading}
                onClick={() => handleDecision(appId, 'reject')}
                className="flex-1 rounded-lg bg-danger/10 px-2 py-1.5 text-[10px] font-bold text-danger hover:bg-danger/20 transition-all disabled:opacity-50"
              >
                ✕ Reject
              </button>
            </div>
            <button
              onClick={() => router.push(`/report/${appId}`)}
              className="mt-1 w-full rounded-lg border border-primary/20 bg-primary/5 px-2 py-1.5 text-[10px] font-bold text-primary hover:bg-primary/10 transition-all"
            >
              👁 View Details
            </button>
          </div>
        );
      },
    },
  ];

  if (isLoading) return (
    <div className="flex h-[calc(100vh-200px)] items-center justify-center">
      <div className="h-12 w-12 animate-spin rounded-full border-4 border-primary/20 border-t-primary"></div>
    </div>
  );

  return (
    <div className="space-y-12 pb-20">
      <div className="flex items-center justify-between gap-8 flex-wrap lg:flex-nowrap">
        <div className="space-y-1">
          <p className="text-[10px] font-black uppercase tracking-[0.2em] text-amber-600">Manager Panel</p>
          <h1 className="text-4xl font-black tracking-tighter text-navy uppercase leading-none">Manager Dashboard</h1>
          <p className="text-sm font-medium text-slate-400">Final approval and oversight of applications.</p>
        </div>
        <button
          onClick={() => router.push('/manager/infrastructure')}
          className="group flex items-center gap-3 rounded-2xl bg-navy px-8 py-4 text-xs font-black uppercase tracking-[0.2em] text-white shadow-[0_20px_40px_-10px_rgba(15,23,42,0.3)] hover:shadow-[0_30px_60px_-10px_rgba(15,23,42,0.4)] transition-all hover:-translate-y-1"
        >
          <svg className="h-5 w-5 text-amber group-hover:rotate-180 transition-transform duration-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
          </svg>
          Monitor Infrastructure
        </button>
      </div>

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
        <SummaryCard
          title="Awaiting Final Approval"
          value={String(applications.length)}
          status="Clerk-approved requests"
          icon={<svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" /></svg>}
        />
        <SummaryCard
          title="High Confidence"
          value={String(applications.filter((a) => a.confidence_level === 'HIGH').length)}
          status="Low risk applications"
          icon={<svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg>}
        />
        <SummaryCard
          title="Needs Scrutiny"
          value={String(applications.filter((a) => a.confidence_level !== 'HIGH').length)}
          change="Review carefully before approving"
          icon={<svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>}
        />
      </div>

      <div className="rounded-[24px] border border-amber/10 bg-amber/5 px-8 py-5 flex items-center gap-4">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-amber text-white shadow-lg">
           <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
           </svg>
        </div>
        <p className="text-xs font-bold text-navy leading-loose">
          <span className="text-amber-600 uppercase tracking-widest mr-2 font-black">Security Notice:</span>
          All applicant data is fully accessible for final review. Approval will generate the official certificate.
        </p>
      </div>

      <DataTable
        title="Applications Pending Approval"
        columns={columns}
        data={applications}
      />

      {/* Report Preview Modal */}
      {selectedReport && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-navy/40 backdrop-blur-sm p-4"
          onClick={() => setSelectedReport(null)}
        >
          <div
            className="relative w-full max-w-2xl max-h-[80vh] overflow-y-auto rounded-2xl bg-white shadow-xl border border-border"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-border px-6 py-4 bg-success/5">
              <div className="flex items-center gap-3">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-success/10 text-success">
                  <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <h3 className="text-lg font-bold text-navy">Final Report Generated</h3>
              </div>
              <button
                onClick={() => setSelectedReport(null)}
                className="text-muted hover:text-navy transition-colors"
              >
                <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="p-6">
              <p className="text-xs text-muted mb-4">This report is now visible in the citizen's dashboard under "Application Outcome".</p>
              <pre className="whitespace-pre-wrap font-mono text-xs text-navy leading-relaxed bg-background rounded-xl p-4 border border-border overflow-x-auto">
                {selectedReport}
              </pre>
            </div>
            <div className="border-t border-border px-6 py-4 flex justify-end">
              <button
                onClick={() => setSelectedReport(null)}
                className="rounded-xl bg-primary px-6 py-2 text-sm font-bold text-white hover:bg-primary-dark transition-all"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
