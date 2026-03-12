'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { auth } from '@/lib/auth';
import { apiFetch, endpoints } from '@/lib/api';
import SummaryCard from '@/components/SummaryCard';
import DataTable from '@/components/DataTable';

export default function AdminDashboard() {
  const router = useRouter();
  const [stats, setStats] = useState({
    applications: [],
    loginLogs: [],
    auditLogs: [],
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const role = auth.getRole();
    if (!auth.isAuthenticated() || (role !== 'admin' && role !== 'manager')) {
      router.push('/login');
      return;
    }

    const fetchData = async () => {
      try {
        const [apps, logins, audits] = await Promise.all([
          apiFetch(endpoints.adminApplications).catch(() => []),
          apiFetch(endpoints.adminLoginLogs).catch(() => []),
          apiFetch(endpoints.adminAuditLogs).catch(() => []),
        ]);

        setStats({
          applications: apps,
          loginLogs: logins,
          auditLogs: audits,
        });
      } catch (err) {
        console.error('Failed to fetch admin data', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [router]);

  if (isLoading) return (
    <div className="flex h-[calc(100vh-200px)] items-center justify-center">
      <div className="h-12 w-12 animate-spin rounded-full border-4 border-primary/20 border-t-primary"></div>
    </div>
  );

  const appColumns = [
    { header: 'ID', accessor: 'id', render: (val: string) => <span className="font-bold text-primary">{val}</span> },
    { header: 'Applicant', accessor: 'applicant_name', render: (val: string) => (
      <div className="flex items-center gap-3">
        <div className="h-8 w-8 rounded-full bg-muted/20 flex items-center justify-center text-[10px] font-bold">
           {val.charAt(0)}
        </div>
        <span className="font-medium text-navy">{val}</span>
      </div>
    )},
    { header: 'Status', accessor: 'status', render: (val: string) => (
      <span className={`rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider ${
        val === 'Approved' ? 'bg-success/10 text-success' : 
        val === 'Rejected' ? 'bg-danger/10 text-danger' : 'bg-warning/10 text-warning'
      }`}>
        {val}
      </span>
    )},
    { header: 'Integrity', accessor: 'integrity_score', render: (val: number) => (
      <div className="flex items-center gap-3">
        <div className="h-1.5 w-24 overflow-hidden rounded-full bg-muted/10">
          <div className="h-full bg-primary" style={{ width: `${val}%` }}></div>
        </div>
        <span className="text-xs font-bold text-navy">{val}</span>
      </div>
    )},
    { header: 'Actions', accessor: 'actions', render: () => (
      <button className="text-muted hover:text-navy">
        <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20"><path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z" /></svg>
      </button>
    )}
  ];

  return (
    <div className="space-y-8 pb-20">
      <div>
        <h1 className="text-3xl font-extrabold tracking-tight text-navy">Admin Dashboard</h1>
        <p className="mt-1 text-base text-muted/80">Real-time oversight of security protocols and application integrity.</p>
      </div>

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        <SummaryCard 
            title="Total Applications" 
            value="1,284" 
            change="+12% from last month" 
            icon={<svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" /></svg>}
        />
        <SummaryCard 
            title="Risk Alerts" 
            value="23" 
            change="+5 new today" 
            icon={<svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>}
        />
        <SummaryCard 
            title="Avg Integrity" 
            value="94.2%" 
            status="Stable since last week" 
            icon={<svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg>}
        />
        <SummaryCard 
            title="Active Sessions" 
            value="412" 
            status="System operational" 
            icon={<svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>}
        />
      </div>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
        <div className="lg:col-span-2">
            <DataTable 
                title="Recent Applications" 
                columns={appColumns} 
                data={stats.applications.length > 0 ? stats.applications : [
                    { id: 'APP-001', applicant_name: 'John Doe', status: 'Pending', integrity_score: 85 },
                    { id: 'APP-002', applicant_name: 'Alice Smith', status: 'Approved', integrity_score: 98 },
                    { id: 'APP-003', applicant_name: 'Bob Johnson', status: 'Rejected', integrity_score: 45 },
                ]} 
                onViewAll={() => {}}
            />
        </div>

        <div className="space-y-8">
            <div className="rounded-xl border border-border bg-white shadow-soft overflow-hidden">
                <div className="flex items-center justify-between border-b border-border bg-white/50 px-6 py-4">
                    <h3 className="text-sm font-bold text-navy uppercase tracking-wider">Login Risk Logs</h3>
                    <button className="text-muted"><svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" /></svg></button>
                </div>
                <div className="divide-y divide-border">
                    {(stats.loginLogs.length > 0 ? stats.loginLogs : [
                        { email: 'm.garcia@corp.com', risk_score: '89/100', status: 'BLOCKED' },
                        { email: 'k.white@sys.io', risk_score: '42/100', status: 'MFA REQ' },
                        { email: 'j.smith@partner.net', risk_score: '08/100', status: 'VERIFIED' },
                    ]).map((log: any, i) => (
                        <div key={i} className="flex items-center justify-between px-6 py-4 hover:bg-muted/5 transition-colors">
                            <span className="text-xs font-medium text-navy">{log.email}</span>
                            <div className="flex items-center gap-4">
                                <span className={`text-[10px] font-bold ${parseInt(log.risk_score) > 70 ? 'text-danger' : parseInt(log.risk_score) > 30 ? 'text-warning' : 'text-success'}`}>{log.risk_score}</span>
                                <span className={`rounded px-1.5 py-0.5 text-[8px] font-bold ${
                                    log.status === 'BLOCKED' ? 'bg-danger/10 text-danger' : 
                                    log.status === 'VERIFIED' ? 'bg-success/10 text-success' : 'bg-warning/10 text-warning'
                                }`}>{log.status}</span>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            <div className="rounded-xl border border-border bg-white shadow-soft overflow-hidden">
                <div className="flex items-center justify-between border-b border-border bg-white/50 px-6 py-4">
                    <h3 className="text-sm font-bold text-navy uppercase tracking-wider">Security Audit Logs</h3>
                    <div className="flex items-center gap-1.5 text-[8px] font-bold text-primary">
                        <span className="h-1 w-1 rounded-full bg-primary animate-pulse"></span>
                        LIVE MONITOR
                    </div>
                </div>
                <div className="p-4 space-y-4">
                    {(stats.auditLogs.length > 0 ? stats.auditLogs : [
                        { icon: 'key', title: 'SSH Access Attempt', detail: 'User \'admin\' attempted login from IP 192.168.1.1', time: '2 mins ago' },
                        { icon: 'settings', title: 'Policy Updated', detail: 'Firewall rule #42 modified by SecurityBot', time: '14 mins ago' },
                        { icon: 'shield', title: 'Integrity Check Failure', detail: 'Node cluster-B reported checksum mismatch', time: '45 mins ago' },
                    ]).map((log: any, i) => (
                        <div key={i} className="flex gap-4">
                            <div className="mt-1 flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                                </svg>
                            </div>
                            <div className="min-w-0 flex-1">
                                <p className="text-xs font-bold text-navy truncate">{log.title}</p>
                                <p className="mt-0.5 text-[10px] text-muted leading-relaxed">{log.detail}</p>
                                <p className="mt-1 text-[8px] font-medium text-muted/60">{log.time}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
      </div>
    </div>
  );
}
