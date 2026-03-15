'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { apiFetch, endpoints } from '@/lib/api';
import { auth } from '@/lib/auth';
import Link from 'next/link';

export default function ManagerLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [deviceId, setDeviceId] = useState('DEVICE-001'); // Standard device ID
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [riskData, setRiskData] = useState<{ risk_score: number; risk_status: string } | null>(null);
  const [showOtpToast, setShowOtpToast] = useState(false);
  const [demoOtp, setDemoOtp] = useState('');

  React.useEffect(() => {
    if (auth.isAuthenticated() && auth.getRole() === 'manager') {
      router.push('/manager');
    }
  }, [router]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    setRiskData(null);

    try {
      const data = await apiFetch(endpoints.login, {
        method: 'POST',
        body: JSON.stringify({ email, password, device_id: deviceId }),
      });

      // Handle direct access_token
      if (data.access_token && data.role === 'manager') {
        auth.setToken(data.access_token);
        auth.setRole(data.role);
        auth.setEmail(email);
        auth.setUser({ full_name: data.full_name, email: email, role: data.role });
        router.push('/manager');
        return;
      }

      // Handle risk or OTP
      if (data.risk_score !== undefined || data.demo_otp) {
        if (data.risk_score !== undefined) {
          setRiskData({ risk_score: data.risk_score, risk_status: data.risk_status });
        }
        
        const isBlocked = data.action_taken === 'BLOCK' || data.risk_status === 'BLOCKED';
        
        if (!isBlocked) {
          if (data.demo_otp) {
            setDemoOtp(data.demo_otp);
            setShowOtpToast(true);
          }
          auth.setEmail(email);
          setTimeout(() => router.push('/verify-otp'), 4000);
        } else {
          setError(data.message || 'Directorate access restricted due to high security risk.');
          setIsLoading(false);
        }
      } else if (data.role && data.role !== 'manager') {
        setError('Unauthorized: This portal is for Regional Managers only.');
        setIsLoading(false);
      } else {
        setError(data.message || 'Login failed.');
        setIsLoading(false);
      }
    } catch (err: any) {
      setError(err.message || 'Login failed. Please check your credentials.');
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-[calc(100vh-64px)] items-center justify-center p-4 bg-slate-50">
      <div className="w-full max-w-md overflow-hidden rounded-[32px] border border-border bg-white shadow-[0_40px_80px_-20px_rgba(15,23,42,0.15)]">
        <div className="bg-slate-900 p-12 text-center relative overflow-hidden">
          <div className="absolute top-0 right-0 p-6 opacity-10">
             <svg className="h-28 w-28 text-white" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
             </svg>
          </div>
          
          <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-2xl bg-slate-800 text-amber-500 shadow-2xl relative z-10 ring-8 ring-slate-800/10">
            <svg className="h-10 w-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
            </svg>
          </div>
          <h1 className="text-3xl font-black text-white tracking-tighter relative z-10 uppercase">Manager Login</h1>
          <p className="mt-2 text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] relative z-10">Directorate Authentication</p>
        </div>

        {/* OTP Toast Notification */}
        {showOtpToast && (
          <div className="fixed top-6 right-6 z-[100] animate-in fade-in slide-in-from-top-4 duration-300">
            <div className="flex items-center gap-4 rounded-3xl border-2 border-amber-600 bg-white p-6 shadow-[0_30px_60px_-15px_rgba(217,119,6,0.2)] ring-8 ring-amber-600/5">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-navy text-white shadow-lg">
                <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                </svg>
              </div>
              <div>
                <p className="text-[10px] font-black uppercase tracking-widest text-amber-600">Verification Code</p>
                <h4 className="text-2xl font-black text-navy tracking-[0.3em] mt-1">{demoOtp}</h4>
              </div>
            </div>
          </div>
        )}

        <div className="p-10 border-t border-slate-50">
          {error && (
            <div className="mb-6 rounded-2xl bg-rose-50 p-5 text-xs font-black text-rose-600 border border-rose-100 flex items-center gap-3">
              <div className="h-6 w-6 rounded-full bg-rose-500 text-white flex items-center justify-center shrink-0">!</div>
              {error}
            </div>
          )}

          {riskData && (
            <div className={`mb-6 rounded-2xl p-5 text-xs font-black border flex items-center gap-3 ${
              riskData.risk_status === 'LOW' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 'bg-amber-50 text-amber-600 border-amber-100'
            }`}>
              <div className={`h-6 w-6 rounded-full flex items-center justify-center text-white shrink-0 ${
                riskData.risk_status === 'LOW' ? 'bg-emerald-500' : 'bg-amber-500'
              }`}>
                {riskData.risk_status === 'LOW' ? '✓' : '!'}
              </div>
              <div>
                <p className="uppercase tracking-widest">Security Status: {riskData.risk_status}</p>
                <p className="mt-0.5 opacity-70 font-bold">Risk Score: {riskData.risk_score}/100</p>
              </div>
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-8">
            <div className="space-y-4">
              <label className="block text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Directorate Credentials</label>
              <div className="space-y-4">
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none">
                    <svg className="h-5 w-5 text-slate-300 transition-colors group-focus-within:text-slate-900" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 h14a7 7 0 00-7-7z" />
                    </svg>
                  </div>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Manager ID / Email"
                    className="w-full rounded-2xl border border-slate-100 bg-slate-50/50 pl-14 pr-4 py-5 text-xs font-bold text-navy focus:bg-white focus:ring-8 focus:ring-slate-900/5 focus:border-slate-900 focus:outline-none transition-all placeholder:text-slate-300 tracking-widest"
                  />
                </div>
                
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none">
                    <svg className="h-5 w-5 text-slate-300 transition-colors group-focus-within:text-slate-900" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M8 11V7a4 4 0 118 0m-4 8v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full rounded-2xl border border-slate-100 bg-slate-50/50 pl-14 pr-4 py-5 text-xs font-bold text-navy focus:bg-white focus:ring-8 focus:ring-slate-900/5 focus:border-slate-900 focus:outline-none transition-all placeholder:text-slate-300 tracking-widest"
                  />
                </div>
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="mt-4 flex w-full items-center justify-center gap-3 rounded-2xl bg-slate-900 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-white shadow-[0_20px_40px_-10px_rgba(15,23,42,0.3)] transition-all hover:bg-black hover:shadow-[0_30px_60px_-10px_rgba(15,23,42,0.4)] hover:-translate-y-1 active:translate-y-0 disabled:opacity-70"
            >
              {isLoading ? (
                <div className="h-5 w-5 animate-spin rounded-full border-2 border-white/30 border-t-white"></div>
              ) : (
                <>
                  Enter Directorate
                  <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                  </svg>
                </>
              )}
            </button>
          </form>

          <div className="mt-10 border-t border-border pt-8 text-center text-[10px] font-bold text-muted/60 uppercase tracking-widest leading-relaxed">
             Secure Directorate Portal<br/>
             Level 4 Access Clearance Required
          </div>
        </div>
      </div>
    </div>
  );
}
