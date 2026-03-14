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
      
      console.log('Forgot Password Response:', data); // Debugging

      if (data.demo_otp) {
        setDemoOtp(data.demo_otp);
        setShowOtpToast(true);
        // Auto-hide after 10 seconds
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
      <div className="flex min-h-[calc(100vh-64px)] items-center justify-center p-4 text-center">
        <div className="w-full max-w-md rounded-2xl border border-success/20 bg-white p-8 shadow-xl">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-success/10 text-success">
            <svg className="h-8 w-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-navy">Password Reset!</h2>
          <p className="mt-2 text-muted">Your password has been updated securely. Redirecting to login...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-[calc(100vh-64px)] items-center justify-center p-4">
      <div className="w-full max-w-md overflow-hidden rounded-2xl border border-border bg-white shadow-xl">
        <div className="bg-primary/5 p-8 text-center pb-6">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-primary text-white shadow-lg">
            <svg className="h-8 w-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-navy">{step === 1 ? 'Forgot Password' : 'Reset Password'}</h1>
          <p className="mt-2 text-sm text-muted">
            {step === 1 
              ? 'Enter your email to receive a security code.' 
              : `Security code sent to ${email}`}
          </p>
        </div>

        {/* Mock OTP Toast */}
        {showOtpToast && (
          <div className="fixed top-6 right-6 z-[100] transition-all duration-500 ease-in-out">
            <div className="flex items-center gap-4 rounded-2xl border-2 border-primary bg-white p-5 shadow-2xl ring-4 ring-primary/10">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary text-white">
                <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                </svg>
              </div>
              <div className="text-left">
                <p className="text-[10px] font-bold uppercase tracking-widest text-primary">Simulation: Recovery OTP</p>
                <h4 className="text-xl font-black text-navy tracking-widest mt-1">{demoOtp}</h4>
                <p className="text-[10px] text-muted font-medium mt-1">Copy this code to reset password.</p>
              </div>
              <button 
                onClick={() => setShowOtpToast(false)} 
                className="ml-4 text-muted hover:text-navy p-1"
              >
                <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" /></svg>
              </button>
            </div>
            <div className="mt-2 h-1.5 w-full bg-primary/10 rounded-full overflow-hidden">
               <div className="h-full bg-primary w-full animate-shrink-width" style={{ animationDuration: '10s' }}></div>
            </div>
          </div>
        )}

        <div className="p-8 pt-6">
          {error && (
            <div className="mb-6 rounded-lg bg-danger/10 p-4 text-sm font-medium text-danger">
              {error}
            </div>
          )}

          {step === 1 ? (
            <form onSubmit={handleSendOtp} className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-muted mb-1.5">Email Address</label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@example.com"
                  className="w-full rounded-xl border border-border bg-background px-4 py-3 text-sm text-navy focus:border-primary focus:outline-none transition-all"
                />
              </div>
              <button
                type="submit"
                disabled={isLoading}
                className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl bg-primary py-3.5 text-sm font-bold text-white shadow-md hover:bg-primary-dark disabled:opacity-70"
              >
                {isLoading ? 'Sending...' : 'Send Recovery Code'}
              </button>
            </form>
          ) : (
            <form onSubmit={handleResetPassword} className="space-y-6">
              <div>
                <p className="text-center text-xs font-bold uppercase tracking-wider text-muted mb-4 text-[10px]">Enter 6-digit Recovery Code</p>
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
                      className="h-12 w-10 rounded-xl border border-border bg-background text-center text-lg font-bold text-navy focus:border-primary focus:outline-none transition-all"
                    />
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-muted mb-1.5">New Password</label>
                <input
                  type="password"
                  required
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full rounded-xl border border-border bg-background px-4 py-3 text-sm text-navy focus:border-primary focus:outline-none transition-all"
                />
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-primary py-3.5 text-sm font-bold text-white shadow-md hover:bg-primary-dark disabled:opacity-70"
              >
                {isLoading ? 'Updating...' : 'Update Password'}
              </button>
            </form>
          )}

          <div className="mt-8 text-center text-xs text-muted">
            <Link href="/login" className="font-bold text-primary hover:underline">Back to Login</Link>
          </div>
        </div>
      </div>
    </div>
  );
}
