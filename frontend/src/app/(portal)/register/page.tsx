'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { apiFetch, endpoints } from '@/lib/api';

export default function RegisterPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    full_name: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    setIsLoading(true);
    try {
      await apiFetch(endpoints.register, {
        method: 'POST',
        body: JSON.stringify({
          full_name: formData.full_name,
          email: formData.email,
          password: formData.password,
          role: 'citizen',
        }),
      });
      setSuccess(true);
      setTimeout(() => router.push('/login'), 3000);
    } catch (err: any) {
      setError(err.message || 'Registration failed');
    } finally {
      setIsLoading(false);
    }
  };

  if (success) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50 p-4 text-center">
        <div className="w-full max-w-md rounded-[32px] border border-slate-100 bg-white p-12 shadow-[0_40px_80px_-20px_rgba(15,23,42,0.08)]">
          <div className="mx-auto mb-8 flex h-20 w-20 items-center justify-center rounded-2xl bg-success/10 text-success shadow-inner">
            <svg className="h-10 w-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h2 className="text-3xl font-black tracking-tighter text-navy uppercase">Registration Successful!</h2>
          <p className="mt-4 text-sm font-medium text-slate-400">Your secure account has been created. Redirecting to login...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 p-4">
      <div className="w-full max-w-lg overflow-hidden rounded-[40px] border border-slate-100 bg-white shadow-[0_40px_80px_-20px_rgba(15,23,42,0.08)]">
        <div className="bg-navy p-10 text-center relative overflow-hidden">
          {/* Subtle grid background */}
          <div className="absolute inset-0 opacity-10 pointer-events-none" 
               style={{ backgroundImage: 'radial-gradient(#fff 1px, transparent 1px)', backgroundSize: '20px 20px' }}></div>
          
          <div className="relative z-10 mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-2xl bg-white/10 text-amber shadow-2xl backdrop-blur-sm">
            <svg className="h-10 w-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
            </svg>
          </div>
          <p className="relative z-10 text-[10px] font-black uppercase tracking-[0.3em] text-amber-500 mb-2">Join Service 1 Secure e-Governance</p>
          <h1 className="relative z-10 text-3xl font-black tracking-tighter text-white uppercase">Create Account</h1>
        </div>

        <div className="p-10">
          {error && (
            <div className="mb-6 rounded-2xl bg-danger/5 border border-danger/10 p-4 text-xs font-bold text-danger animate-shake flex items-center gap-3">
              <svg className="h-5 w-5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2 ml-1">Full Name</label>
              <input
                type="text"
                name="full_name"
                required
                value={formData.full_name}
                onChange={handleChange}
                placeholder="John Doe"
                className="w-full rounded-2xl border border-slate-200 bg-background px-5 py-4 text-sm font-medium text-navy focus:border-amber focus:outline-none transition-all placeholder:text-slate-300 shadow-sm"
              />
            </div>

            <div>
              <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2 ml-1">Email Address</label>
              <input
                type="email"
                name="email"
                required
                value={formData.email}
                onChange={handleChange}
                placeholder="name@example.com"
                className="w-full rounded-2xl border border-slate-200 bg-background px-5 py-4 text-sm font-medium text-navy focus:border-amber focus:outline-none transition-all placeholder:text-slate-300 shadow-sm"
              />
            </div>

            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
              <div>
                <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2 ml-1">Password</label>
                <input
                  type="password"
                  name="password"
                  required
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="••••••••"
                  className="w-full rounded-2xl border border-slate-200 bg-background px-5 py-4 text-sm font-medium text-navy focus:border-amber focus:outline-none transition-all placeholder:text-slate-300 shadow-sm"
                />
              </div>
              <div>
                <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2 ml-1">Confirm</label>
                <input
                  type="password"
                  name="confirmPassword"
                  required
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  placeholder="••••••••"
                  className="w-full rounded-2xl border border-slate-200 bg-background px-5 py-4 text-sm font-medium text-navy focus:border-amber focus:outline-none transition-all placeholder:text-slate-300 shadow-sm"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="group relative mt-4 flex w-full items-center justify-center gap-3 rounded-2xl bg-navy py-5 text-sm font-black uppercase tracking-[0.2em] text-white shadow-xl hover:bg-navy-light transition-all disabled:opacity-70 disabled:cursor-not-allowed hover:-translate-y-1 active:translate-y-0"
            >
              {isLoading ? (
                <div className="h-6 w-6 animate-spin rounded-full border-2 border-white/30 border-t-white"></div>
              ) : (
                <>
                  Register Now
                  <svg className="h-5 w-5 text-amber transition-transform group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                  </svg>
                </>
              )}
            </button>
          </form>

          <div className="mt-10 pt-6 border-t border-slate-50 text-center">
            <p className="text-xs font-medium text-slate-400">
              Already have an account? <Link href="/login" className="font-black uppercase tracking-widest text-navy ml-2 hover:text-amber transition-colors">Login here</Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
