'use client';

import React, { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { apiFetch, endpoints } from '@/lib/api';

export default function ForgotPasswordPage() {
  const router = useRouter();
  const [step, setStep] = useState(1); // 1: Email, 2: OTP & New Password
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [newPassword, setNewPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [demoOtp, setDemoOtp] = useState('');
  const [showOtpToast, setShowOtpToast] = useState(false);
  
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      const data = await apiFetch(endpoints.forgotPassword, {
        method: 'POST',
        body: JSON.stringify({ email }),
      });
      
      if (data.demo_otp) {
        setDemoOtp(data.demo_otp);
        setShowOtpToast(true);
        window.alert(`Security Notice: Your Verification Code is ${data.demo_otp}`);
        setTimeout(() => setShowOtpToast(false), 10000);
      }
      setStep(2);
    } catch (err: any) {
      setError(err.message || 'Failed to send OTP');
    } finally {
      setIsLoading(false);
    }
  };

  const handleOtpChange = (index: number, value: string) => {
    if (value.length > 1) value = value.slice(-1);
    if (!/^\d*$/.test(value)) return;

    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    const otpCode = otp.join('');
    if (otpCode.length < 6) {
      setError('Please enter the 6-digit code');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      await apiFetch(endpoints.resetPassword, {
        method: 'POST',
        body: JSON.stringify({
          email,
          otp_code: otpCode,
          new_password: newPassword
        }),
      });
      setSuccess(true);
      setTimeout(() => router.push('/login'), 3000);
    } catch (err: any) {
      setError(err.message || 'Failed to reset password');
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
          <h2 className="text-3xl font-black tracking-tighter text-navy uppercase">Password Reset Successful!</h2>
          <p className="mt-4 text-sm font-medium text-slate-400">Your password has been successfully reset. Redirecting to login...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 p-4">
      <div className="w-full max-w-md overflow-hidden rounded-[40px] border border-slate-100 bg-white shadow-[0_40px_80px_-20px_rgba(15,23,42,0.08)]">
        <div className="bg-navy p-10 text-center relative overflow-hidden">
          {/* Subtle grid background */}
          <div className="absolute inset-0 opacity-10 pointer-events-none" 
               style={{ backgroundImage: 'radial-gradient(#fff 1px, transparent 1px)', backgroundSize: '20px 20px' }}></div>
          
          <div className="relative z-10 mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-2xl bg-white/10 text-amber shadow-2xl backdrop-blur-sm">
            <svg className="h-10 w-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
            </svg>
          </div>
          <p className="relative z-10 text-[10px] font-black uppercase tracking-[0.3em] text-amber-500 mb-2">Reset Password</p>
          <h1 className="relative z-10 text-3xl font-black tracking-tighter text-white uppercase">{step === 1 ? 'Forgot Password' : 'Verify OTP'}</h1>
        </div>

        {/* Mock OTP Toast */}
        {showOtpToast && (
          <div className="fixed top-10 right-10 z-[100] animate-in fade-in slide-in-from-right-10 duration-500">
            <div className="flex items-center gap-5 rounded-3xl border border-amber/20 bg-white p-6 shadow-2xl shadow-amber/10 ring-1 ring-amber/5">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-amber text-navy shadow-lg">
                <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                </svg>
              </div>
              <div>
                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-amber-600">Simulation Output</p>
                <h4 className="text-2xl font-black text-navy tracking-[0.3em] mt-0.5">{demoOtp}</h4>
              </div>
              <button onClick={() => setShowOtpToast(false)} className="ml-4 h-8 w-8 flex items-center justify-center rounded-full hover:bg-slate-50 transition-colors">
                <svg className="h-4 w-4 text-slate-400" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" /></svg>
              </button>
            </div>
          </div>
        )}

        <div className="p-10">
          {error && (
            <div className="mb-6 rounded-2xl bg-danger/5 border border-danger/10 p-4 text-xs font-bold text-danger animate-shake flex items-center gap-3">
              <svg className="h-5 w-5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              {error}
            </div>
          )}

          {step === 1 ? (
            <form onSubmit={handleSendOtp} className="space-y-6">
              <div>
                <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2 ml-1">Email Address</label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@example.com"
                  className="w-full rounded-2xl border border-slate-200 bg-background px-5 py-4 text-sm font-medium text-navy focus:border-amber focus:outline-none transition-all placeholder:text-slate-300 shadow-sm"
                />
              </div>
              <button
                type="submit"
                disabled={isLoading}
                className="group relative flex w-full items-center justify-center gap-3 rounded-2xl bg-navy py-5 text-sm font-black uppercase tracking-[0.2em] text-white shadow-xl hover:bg-navy-light transition-all disabled:opacity-70 disabled:cursor-not-allowed hover:-translate-y-1 active:translate-y-0"
              >
                {isLoading ? (
                   <div className="h-6 w-6 animate-spin rounded-full border-2 border-white/30 border-t-white"></div>
                ) : (
                  <>
                    Send OTP
                    <svg className="h-5 w-5 text-amber transition-transform group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                    </svg>
                  </>
                )}
              </button>
            </form>
          ) : (
            <form onSubmit={handleResetPassword} className="space-y-8">
              <div className="text-center">
                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mb-6">Enter the 6-digit code sent to your email</p>
                <div className="flex justify-between gap-2">
                  {otp.map((digit, idx) => (
                    <input
                      key={idx}
                      ref={(el) => { inputRefs.current[idx] = el; }}
                      type="text"
                      maxLength={1}
                      value={digit}
                      onChange={(e) => handleOtpChange(idx, e.target.value)}
                      onKeyDown={(e) => handleKeyDown(idx, e)}
                      className="h-14 w-11 rounded-xl border-2 border-slate-100 bg-slate-50 text-center text-xl font-black text-navy focus:border-amber focus:bg-white focus:outline-none transition-all shadow-sm"
                    />
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2 ml-1">New Password</label>
                <input
                  type="password"
                  required
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full rounded-2xl border border-slate-200 bg-background px-5 py-4 text-sm font-medium text-navy focus:border-amber focus:outline-none transition-all placeholder:text-slate-300 shadow-sm"
                />
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="group relative flex w-full items-center justify-center gap-3 rounded-2xl bg-navy py-5 text-sm font-black uppercase tracking-[0.2em] text-white shadow-xl hover:bg-navy-light transition-all disabled:opacity-70 disabled:cursor-not-allowed hover:-translate-y-1 active:translate-y-0"
              >
                {isLoading ? (
                   <div className="h-6 w-6 animate-spin rounded-full border-2 border-white/30 border-t-white"></div>
                ) : (
                  <>
                    Reset Password
                    <svg className="h-5 w-5 text-amber transition-transform group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                    </svg>
                  </>
                )}
              </button>
            </form>
          )}

          <div className="mt-10 pt-6 border-t border-slate-50 text-center">
            <Link href="/login" className="text-[10px] font-black uppercase tracking-widest text-navy bg-slate-50 hover:bg-slate-100 px-6 py-3 rounded-full transition-colors">
              Back to Login
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
