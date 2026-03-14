'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { apiFetch, endpoints } from '@/lib/api';
import { auth } from '@/lib/auth';
import Link from 'next/link';
import StatusCard from '@/components/StatusCard';

export default function PDSDashboard() {
  const router = useRouter();
  const [stock, setStock] = useState<any[]>([]);
  const [transactions, setTransactions] = useState<any[]>([]);
  const [isOnline, setIsOnline] = useState(true);
  const [pendingSync, setPendingSync] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!auth.isAuthenticated() || auth.getRole() !== 'pds_admin') {
      router.push('/pds/login');
      return;
    }

    const checkOnline = () => setIsOnline(navigator.onLine);
    window.addEventListener('online', checkOnline);
    window.addEventListener('offline', checkOnline);
    checkOnline();

    // Load metrics
    const loadData = async () => {
      try {
        const stockData = await apiFetch(endpoints.pdsStock + '?shop_id=Shop-VLS-001');
        setStock(stockData);
        
        const txData = await apiFetch(endpoints.pdsTransactions + '?shop_id=Shop-VLS-001');
        setTransactions(txData);

        // Check offline queue
        const queue = JSON.parse(localStorage.getItem('pds_offline_queue') || '[]');
        setPendingSync(queue.length);
      } catch (err) {
        console.error('Failed to load PDS data:', err);
      } finally {
        setIsLoading(false);
      }
    };

    loadData();

    return () => {
      window.removeEventListener('online', checkOnline);
      window.removeEventListener('offline', checkOnline);
    };
  }, [router]);

  const handleSync = async () => {
    const queue = JSON.parse(localStorage.getItem('pds_offline_queue') || '[]');
    if (queue.length === 0) return;

    try {
      await apiFetch(endpoints.pdsBulkSync, {
        method: 'POST',
        body: JSON.stringify({ transactions: queue })
      });
      localStorage.setItem('pds_offline_queue', '[]');
      setPendingSync(0);
      alert('Sync successful!');
      // Refresh transactions
      const txData = await apiFetch(endpoints.pdsTransactions + '?shop_id=Shop-VLS-001');
      setTransactions(txData);
    } catch (err) {
      alert('Sync failed. Please try again when online.');
    }
  };

  if (isLoading) return (
    <div className="flex h-screen items-center justify-center">
      <div className="h-12 w-12 animate-spin rounded-full border-4 border-navy/20 border-t-navy"></div>
    </div>
  );

  return (
    <div className="space-y-8 pb-20">
      {/* PDS Header */}
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-8 bg-white p-10 rounded-[32px] shadow-[0_40px_80px_-20px_rgba(15,23,42,0.08)] border border-slate-100">
        <div>
          <div className="flex items-center gap-4 mb-3">
            <div className="bg-navy text-amber p-2.5 rounded-2xl shadow-lg ring-4 ring-navy/5">
              <svg className="h-7 w-7" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2L2 7l10 5 10-5-10-5zM2 12l10 5 10-5M2 17l10 5 10-5" />
              </svg>
            </div>
            <div>
              <p className="text-[10px] font-black uppercase tracking-[0.2em] text-amber-600 mb-1">Ration Shop Dashboard</p>
              <h1 className="text-4xl font-black text-navy tracking-tighter uppercase leading-none">PDS Management</h1>
            </div>
          </div>
          <div className="flex items-center gap-4">
             <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Node ID: <span className="text-navy">Shop-VLS-001</span></span>
             <span className="h-3 w-px bg-slate-200"></span>
             <div className={`flex items-center gap-2 px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border ${isOnline ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 'bg-rose-50 text-rose-600 border-rose-100'}`}>
                <div className={`h-2 w-2 rounded-full ${isOnline ? 'bg-emerald-500' : 'bg-rose-500'} animate-pulse`}></div>
                {isOnline ? 'Online' : 'Offline Mode'}
             </div>
          </div>
        </div>
        
        <div className="flex items-center gap-3">
          {pendingSync > 0 && (
            <button 
              onClick={handleSync}
              className="px-6 py-3 bg-amber text-navy text-xs font-black uppercase tracking-widest rounded-2xl shadow-lg hover:shadow-xl transition-all flex items-center gap-2"
            >
              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              Sync {pendingSync} Pending
            </button>
          )}
          <Link 
            href="/pds/distribute"
            className="px-8 py-4 bg-navy text-white text-sm font-black uppercase tracking-widest rounded-2xl shadow-xl hover:bg-navy-light hover:shadow-2xl transition-all flex items-center gap-3"
          >
            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z" />
            </svg>
            Issue Ration
          </Link>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Metrics & Pending */}
        <div className="lg:col-span-1 space-y-8">
          <section className="bg-white p-8 rounded-[32px] shadow-soft border border-slate-100">
            <h2 className="text-xs font-black text-navy uppercase tracking-[0.2em] mb-8">Stock Inventory</h2>
            <div className="space-y-6">
              {stock.map((item: any) => (
                <div key={item.id} className="p-4 rounded-2xl bg-slate-50 border border-slate-100 group hover:border-amber/30 transition-all">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-xs font-black text-navy uppercase tracking-tight">{item.item_name}</span>
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{item.unit}</span>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="flex-1 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                      <div 
                        className={`h-full rounded-full ${item.quantity < 50 ? 'bg-rose-500' : 'bg-amber'}`} 
                        style={{ width: `${Math.min(100, (item.quantity / 500) * 100)}%` }}
                      ></div>
                    </div>
                    <span className={`text-xs font-black ${item.quantity < 50 ? 'text-rose-600' : 'text-navy'}`}>
                      {item.quantity}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </section>

          <section className="bg-navy p-8 rounded-3xl shadow-xl text-white relative overflow-hidden">
             <div className="relative z-10">
                <h2 className="text-xl font-bold mb-2">Daily Summary</h2>
                <p className="text-xs text-white/60 font-medium mb-6 uppercase tracking-widest">Today's Performance</p>
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 rounded-2xl bg-white/5 border border-white/10">
                    <p className="text-[10px] font-black text-amber uppercase tracking-widest">Issued Today</p>
                    <p className="text-3xl font-black mt-1">24</p>
                  </div>
                  <div className="p-4 rounded-2xl bg-white/5 border border-white/10">
                    <p className="text-[10px] font-black text-amber uppercase tracking-widest">Queue Status</p>
                    <p className="text-3xl font-black mt-1 text-success">CLEAR</p>
                  </div>
                </div>
             </div>
             {/* Decorative circle */}
             <div className="absolute -bottom-10 -right-10 h-40 w-40 bg-amber/10 rounded-full blur-3xl"></div>
          </section>
        </div>

        {/* Right Column: Transactions */}
        <div className="lg:col-span-2">
          <section className="bg-white rounded-3xl shadow-soft border border-border h-full overflow-hidden flex flex-col">
            <div className="p-8 border-b border-border flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold text-navy">Recent Transactions</h2>
                <p className="text-xs text-muted font-medium mt-1">Distribution History</p>
              </div>
              <Link href="#" className="text-xs font-black text-primary uppercase tracking-widest hover:underline">View All</Link>
            </div>
            
            <div className="flex-1 overflow-auto max-h-[600px]">
              {transactions.length === 0 ? (
                <div className="p-20 text-center">
                  <div className="mx-auto w-16 h-16 bg-slate-50 rounded-2xl flex items-center justify-center text-muted/30 mb-4">
                    <svg className="h-8 w-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                    </svg>
                  </div>
                  <p className="text-sm font-bold text-navy">No transactions recorded</p>
                  <p className="text-xs text-muted mt-1 font-medium">Distribution history will appear here</p>
                </div>
              ) : (
                <table className="w-full text-left">
                  <thead className="bg-slate-50 text-[10px] font-black text-muted uppercase tracking-widest">
                    <tr>
                      <th className="px-8 py-4">Beneficiary</th>
                      <th className="px-8 py-4">Ration Card</th>
                      <th className="px-8 py-4">Verification</th>
                      <th className="px-8 py-4">Status</th>
                      <th className="px-8 py-4 text-right">Items</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {transactions.map((tx: any) => (
                      <tr key={tx.id} className="group hover:bg-slate-50/50 transition-colors">
                        <td className="px-8 py-5">
                          <p className="text-sm font-bold text-navy">{tx.beneficiary_name}</p>
                          <p className="text-[10px] font-medium text-muted mt-0.5">{tx.citizen_code}</p>
                        </td>
                        <td className="px-8 py-5">
                          <p className="text-xs font-bold text-navy">{tx.ration_card_number}</p>
                          <p className="text-[10px] font-medium text-muted mt-0.5">{tx.card_type}</p>
                        </td>
                        <td className="px-8 py-5">
                          <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-[9px] font-black uppercase tracking-widest ${
                            tx.verification_mode === 'QR_VERIFIED' ? 'bg-primary/10 text-primary' : 'bg-amber/10 text-amber-600'
                          }`}>
                            {tx.verification_mode.replace('_', ' ')}
                          </span>
                        </td>
                        <td className="px-8 py-5">
                          <div className="flex items-center gap-1.5">
                            <div className={`h-1.5 w-1.5 rounded-full ${tx.sync_status === 'SYNCED' ? 'bg-success' : 'bg-warning'}`}></div>
                            <span className="text-[10px] font-bold text-navy uppercase tracking-tight">{tx.sync_status}</span>
                          </div>
                        </td>
                        <td className="px-8 py-5 text-right">
                          <button className="p-2 text-muted/40 hover:text-navy transition-colors">
                            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                            </svg>
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
