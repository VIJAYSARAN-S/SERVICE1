'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { apiFetch, endpoints } from '@/lib/api';
import { auth } from '@/lib/auth';
import Link from 'next/link';

export default function ClerkLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [service, setService] = useState('');
  const [deviceId, setDeviceId] = useState('DEVICE-001'); // Standard device ID
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [riskData, setRiskData] = useState<{ risk_score: number; risk_status: string } | null>(null);
  const [showOtpToast, setShowOtpToast] = useState(false);
  const [demoOtp, setDemoOtp] = useState('');

  React.useEffect(() => {
    if (auth.isAuthenticated() && auth.getRole() === 'clerk') {
      router.push('/clerk');
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

      // Handle direct access_token (standard case)
      if (data.access_token && data.role === 'clerk') {
        auth.setToken(data.access_token);
        auth.setRole(data.role);
        auth.setEmail(email);
        auth.setUser({ full_name: data.full_name, email: email, role: data.role });
        router.push('/clerk');
        return;
      }

      // Handle risk feedback or OTP requirement (secure case)
      if (data.risk_score !== undefined || data.demo_otp) {
        if (data.risk_score !== undefined) {
          setRiskData({ risk_score: data.risk_score, risk_status: data.risk_status });
        }
        
        const isBlocked = data.action_taken === 'BLOCK' || data.risk_status === 'BLOCKED';
        
        if (!isBlocked) {
          if (data.demo_otp) {
            setDemoOtp(data.demo_otp);
            setShowOtpToast(true);
            window.alert(`Security Notice: Your Verification Code is ${data.demo_otp}`);
          }
          auth.setEmail(email);
          // Redirect to common OTP verification
          setTimeout(() => router.push('/verify-otp'), 4000);
        } else {
          setError(data.message || 'Access restricted due to security risk.');
          setIsLoading(false);
        }
      } else if (data.role && data.role !== 'clerk') {
        setError('Unauthorized: This portal is for Administrative Clerks only.');
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
        <div className="bg-slate-50/50 p-10 text-center pb-8 border-b border-slate-100 relative">
          <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-navy text-white shadow-xl">
            <svg className="h-8 w-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
          </div>
          <h1 className="text-3xl font-black text-navy tracking-tight uppercase">Clerk Login</h1>
          <p className="mt-2 text-xs font-black uppercase tracking-widest text-saffron bg-navy/5 inline-block px-3 py-1 rounded-lg">Administrative Authentication</p>
        </div>

        {/* OTP Toast Notification */}
        {showOtpToast && (
          <div className="fixed top-6 right-6 z-[100] animate-in fade-in slide-in-from-top-4 duration-300">
            <div className="flex items-center gap-4 rounded-3xl border-2 border-saffron bg-white p-6 shadow-[0_30px_60px_-15px_rgba(255,153,51,0.2)] ring-8 ring-saffron/10">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-navy text-white shadow-lg">
                <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                </svg>
              </div>
              <div>
                <p className="text-[10px] font-black uppercase tracking-widest text-saffron">Official OTP</p>
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
            <div className="space-y-3">
              <label className="block text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Official Credentials</label>
              <div className="space-y-4">
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none">
                    <svg className="h-5 w-5 text-slate-300 transition-colors group-focus-within:text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                    </svg>
                  </div>
                  <select
                    value={service}
                    onChange={(e) => setService(e.target.value)}
                    className="w-full appearance-none rounded-2xl border border-slate-100 bg-slate-50/50 pl-14 pr-4 py-5 text-xs font-black text-navy uppercase tracking-widest focus:bg-white focus:ring-8 focus:ring-blue-600/5 focus:border-blue-600 focus:outline-none transition-all cursor-pointer"
                  >
                    <option value="" disabled>Select Department...</option>
                    <option value="BIRTH_CERTIFICATE">Birth Certificate</option>
                    <option value="MARRIAGE_CERTIFICATE">Marriage Certificate</option>
                    <option value="INCOME_CERTIFICATE">Income Certificate</option>
                    <option value="COMMUNITY_CERTIFICATE">Community Certificate</option>
                    <option value="PASSPORT_APPLICATION">Passport Application</option>
                    <option value="DRIVING_LICENSE">Driving License</option>
                    <option value="VOTER_ID">Voter ID</option>
                    <option value="BUILDING_PERMIT">Building Permit</option>
                  </select>
                  <div className="absolute inset-y-0 right-0 pr-5 flex items-center pointer-events-none text-slate-400">
                    <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M19 9l-7 7-7-7" />
                    </svg>
                  </div>
                </div>

                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none">
                    <svg className="h-5 w-5 text-slate-300 transition-colors group-focus-within:text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                  </div>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Official Email"
                    disabled={!service}
                    className="w-full rounded-2xl border border-slate-100 bg-slate-50/50 pl-14 pr-4 py-5 text-xs font-bold text-navy focus:bg-white focus:ring-8 focus:ring-blue-600/5 focus:border-blue-600 focus:outline-none transition-all placeholder:text-slate-300 tracking-widest disabled:opacity-50 disabled:cursor-not-allowed"
                  />
                </div>
                
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none">
                    <svg className="h-5 w-5 text-slate-300 transition-colors group-focus-within:text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M8 11V7a4 4 0 118 0m-4 8v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    disabled={!service}
                    className="w-full rounded-2xl border border-slate-100 bg-slate-50/50 pl-14 pr-4 py-5 text-xs font-bold text-navy focus:bg-white focus:ring-8 focus:ring-blue-600/5 focus:border-blue-600 focus:outline-none transition-all placeholder:text-slate-300 tracking-widest disabled:opacity-50 disabled:cursor-not-allowed"
                  />
                </div>
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="mt-6 flex w-full items-center justify-center gap-2 rounded-xl bg-saffron py-4 text-xs font-black uppercase tracking-widest text-white shadow-xl transition-all hover:bg-[#F28B20] hover:shadow-2xl hover:-translate-y-0.5 disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <div className="h-5 w-5 animate-spin rounded-full border-2 border-white/30 border-t-white"></div>
              ) : (
                <>
                  Sign In to Desk
                  <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                  </svg>
                </>
              )}
            </button>
          </form>

          <div className="mt-10 border-t border-border pt-8 text-center text-[10px] font-bold text-muted/60 uppercase tracking-widest leading-relaxed">
             Authorized Personnel Only<br/>
             Governed by Service 1 Node Protocols
          </div>
        </div>
      </div>
    </div>
  );
}
