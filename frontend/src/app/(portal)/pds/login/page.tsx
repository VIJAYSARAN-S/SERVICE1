'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { apiFetch, endpoints } from '@/lib/api';
import { auth } from '@/lib/auth';
import Link from 'next/link';

export default function PDSLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [demoOtp, setDemoOtp] = useState('');
  const [showOtpToast, setShowOtpToast] = useState(false);

  React.useEffect(() => {
    if (auth.isAuthenticated() && auth.getRole() === 'pds_admin') {
      router.push('/pds/dashboard');
    }
  }, [router]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      console.log('Attempting PDS Admin Login...');
      const data = await apiFetch(endpoints.pdsLogin, {
        method: 'POST',
        body: JSON.stringify({ email, password, device_id: 'PDS-TERMINAL-01' }),
      });

      console.log('Login Response:', data);

      if (data.access_token) {
        // Direct Login (No OTP for PDS Admin)
        auth.setToken(data.access_token);
        auth.setRole(data.role);
        auth.setEmail(email);
        auth.setUser({ full_name: data.full_name, email: email, role: data.role });
        router.push('/pds/dashboard');
      } else if (data.demo_otp) {
        // Fallback for demo OTP if returned
        setDemoOtp(data.demo_otp);
        setShowOtpToast(true);
        auth.setEmail(email);
        setTimeout(() => router.push('/verify-otp'), 3000);
      } else {
        setError(data.message || 'Login failed or additional verification required.');
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
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
            </svg>
          </div>
          <h1 className="text-3xl font-black text-navy tracking-tight uppercase">PDS Login</h1>
          <p className="mt-2 text-xs font-black uppercase tracking-widest text-saffron bg-navy/5 inline-block px-3 py-1 rounded-lg">Ration Shop Authentication</p>
        </div>

        {/* OTP Toast (Reused from standard login for consistency) */}
        {showOtpToast && (
          <div className="fixed top-6 right-6 z-[100] animate-in fade-in slide-in-from-top-4 duration-300">
            <div className="flex items-center gap-4 rounded-3xl border-2 border-saffron bg-white p-6 shadow-[0_30px_60px_-15px_rgba(255,153,51,0.2)] ring-8 ring-saffron/10">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-navy text-white shadow-lg">
                <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                </svg>
              </div>
              <div>
                <p className="text-[10px] font-black uppercase tracking-widest text-saffron">Verification Code Sent</p>
                <h4 className="text-2xl font-black text-navy tracking-widest mt-0.5">{demoOtp}</h4>
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

          <form onSubmit={handleLogin} className="space-y-8">
            <div className="space-y-3">
              <label className="block text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Login Credentials</label>
              <div className="space-y-4">
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none">
                    <svg className="h-5 w-5 text-slate-300 transition-colors group-focus-within:text-amber" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                  </div>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Email Address"
                    className="w-full rounded-2xl border border-slate-100 bg-slate-50/50 pl-14 pr-4 py-5 text-xs font-bold text-navy focus:bg-white focus:ring-8 focus:ring-navy/5 focus:border-navy focus:outline-none transition-all placeholder:text-slate-300 tracking-widest"
                  />
                </div>
                
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none">
                    <svg className="h-5 w-5 text-slate-300 transition-colors group-focus-within:text-amber" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M8 11V7a4 4 0 118 0m-4 8v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full rounded-2xl border border-slate-100 bg-slate-50/50 pl-14 pr-4 py-5 text-xs font-bold text-navy focus:bg-white focus:ring-8 focus:ring-navy/5 focus:border-navy focus:outline-none transition-all placeholder:text-slate-300 tracking-widest"
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
                  Login
                  <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                  </svg>
                </>
              )}
            </button>
          </form>

          <div className="mt-10 border-t border-border pt-8 text-center">
            <p className="text-[10px] font-bold text-muted/60 uppercase tracking-widest leading-relaxed">
              Public Distribution System Admin<br/>
              Secure Admin Portal
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
