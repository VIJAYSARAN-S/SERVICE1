'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { auth } from '@/lib/auth';
import { apiFetch, endpoints } from '@/lib/api';

export default function MarriageCertificatePage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    groom_name: '',
    groom_dob: '',
    groom_age: 0,
    groom_occupation: '',
    groom_aadhaar: '',
    groom_address: '',
    bride_name: '',
    bride_dob: '',
    bride_age: 0,
    bride_occupation: '',
    bride_aadhaar: '',
    bride_address: '',
    marriage_date: '',
    marriage_place: '',
    marriage_type: 'Hindu',
    registration_district: '',
    witness1_name: '',
    witness1_address: '',
    witness2_name: '',
    witness2_address: '',
  });

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!auth.isAuthenticated()) {
      router.push('/login');
    }
  }, [router]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData({ 
      ...formData, 
      [name]: (name === 'groom_age' || name === 'bride_age') ? parseInt(value) || 0 : value 
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      const data = await apiFetch(endpoints.marriageCertificate, {
        method: 'POST',
        body: JSON.stringify(formData),
      });
      
      localStorage.setItem('last_application', JSON.stringify(data));
      router.push('/services/success');
    } catch (err: any) {
      setError(err.message || 'Failed to submit application. Please try again.');
      setIsLoading(false);
    }
  };

  return (
    <div className="mx-auto max-w-4xl pb-20">
      <div className="mb-12 text-center">
        <p className="text-[10px] font-black uppercase tracking-[0.3em] text-amber-600 mb-2">Service Request</p>
        <h1 className="text-5xl font-black tracking-tighter text-navy uppercase leading-none">Marriage Certificate</h1>
        <p className="mt-4 text-sm font-medium text-slate-400">Official legal registration and state recognition of marriage.</p>

        <div className="mt-10 flex items-center gap-5 rounded-2xl bg-amber/5 border border-amber/10 p-5 text-xs text-navy text-left mx-auto max-w-3xl">
          <div className="h-10 w-10 flex items-center justify-center bg-amber text-navy rounded-xl shadow-lg shrink-0">
            <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <p className="font-bold leading-relaxed">
            <span className="text-amber-600 uppercase tracking-widest mr-2 font-black">Important:</span>
            All details must align with official state identity records. False declarations may have legal consequences.
          </p>
        </div>
      </div>

      <div className="rounded-[32px] border border-slate-100 bg-white p-10 shadow-[0_40px_80px_-20px_rgba(15,23,42,0.08)]">
        <div>
          {error && (
            <div className="mb-8 rounded-lg bg-danger/10 p-4 text-sm font-medium text-danger animate-shake">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-12">
            {/* -- Groom Details -- */}
            <section className="space-y-8">
              <div className="flex items-center gap-4 border-b border-slate-100 pb-4">
                <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-navy text-white text-xs font-black shadow-lg">01</span>
                <h2 className="text-xs font-black text-navy uppercase tracking-[0.2em]">Groom's Details</h2>
              </div>
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-muted mb-2">Full Name*</label>
                  <input type="text" name="groom_name" required value={formData.groom_name} onChange={handleChange} className="w-full rounded-xl border border-slate-200 bg-background px-4 py-3 text-sm text-navy focus:border-amber focus:outline-none transition-all" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-muted mb-2">DOB*</label>
                    <input type="date" name="groom_dob" required value={formData.groom_dob} onChange={handleChange} className="w-full rounded-xl border border-slate-200 bg-background px-4 py-3 text-sm text-navy focus:border-amber focus:outline-none transition-all" />
                  </div>
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-muted mb-2">Age*</label>
                    <input type="number" name="groom_age" required value={formData.groom_age} onChange={handleChange} className="w-full rounded-xl border border-slate-200 bg-background px-4 py-3 text-sm text-navy focus:border-amber focus:outline-none transition-all" />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-muted mb-2">Occupation</label>
                  <input type="text" name="groom_occupation" value={formData.groom_occupation} onChange={handleChange} className="w-full rounded-xl border border-slate-200 bg-background px-4 py-3 text-sm text-navy focus:border-amber focus:outline-none transition-all" />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-muted mb-2">Aadhaar*</label>
                  <input type="text" name="groom_aadhaar" required value={formData.groom_aadhaar} onChange={handleChange} className="w-full rounded-xl border border-slate-200 bg-background px-4 py-3 text-sm text-navy focus:border-amber focus:outline-none transition-all" />
                </div>
                <div className="sm:col-span-2">
                  <label className="block text-xs font-bold uppercase tracking-wider text-muted mb-2">Address*</label>
                  <textarea name="groom_address" required rows={2} value={formData.groom_address} onChange={handleChange} className="w-full rounded-xl border border-slate-200 bg-background px-4 py-3 text-sm text-navy focus:border-amber focus:outline-none transition-all" />
                </div>
              </div>
            </section>

            {/* -- Bride Details -- */}
            <section className="space-y-8">
              <div className="flex items-center gap-4 border-b border-slate-100 pb-4">
                <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-navy text-white text-xs font-black shadow-lg">02</span>
                <h2 className="text-xs font-black text-navy uppercase tracking-[0.2em]">Bride's Details</h2>
              </div>
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-muted mb-2">Full Name*</label>
                  <input type="text" name="bride_name" required value={formData.bride_name} onChange={handleChange} className="w-full rounded-xl border border-slate-200 bg-background px-4 py-3 text-sm text-navy focus:border-amber focus:outline-none transition-all" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-muted mb-2">DOB*</label>
                    <input type="date" name="bride_dob" required value={formData.bride_dob} onChange={handleChange} className="w-full rounded-xl border border-slate-200 bg-background px-4 py-3 text-sm text-navy focus:border-amber focus:outline-none transition-all" />
                  </div>
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-muted mb-2">Age*</label>
                    <input type="number" name="bride_age" required value={formData.bride_age} onChange={handleChange} className="w-full rounded-xl border border-slate-200 bg-background px-4 py-3 text-sm text-navy focus:border-amber focus:outline-none transition-all" />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-muted mb-2">Occupation</label>
                  <input type="text" name="bride_occupation" value={formData.bride_occupation} onChange={handleChange} className="w-full rounded-xl border border-slate-200 bg-background px-4 py-3 text-sm text-navy focus:border-amber focus:outline-none transition-all" />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-muted mb-2">Aadhaar*</label>
                  <input type="text" name="bride_aadhaar" required value={formData.bride_aadhaar} onChange={handleChange} className="w-full rounded-xl border border-slate-200 bg-background px-4 py-3 text-sm text-navy focus:border-amber focus:outline-none transition-all" />
                </div>
                <div className="sm:col-span-2">
                  <label className="block text-xs font-bold uppercase tracking-wider text-muted mb-2">Address*</label>
                  <textarea name="bride_address" required rows={2} value={formData.bride_address} onChange={handleChange} className="w-full rounded-xl border border-slate-200 bg-background px-4 py-3 text-sm text-navy focus:border-amber focus:outline-none transition-all" />
                </div>
              </div>
            </section>

            {/* -- Marriage Details -- */}
            <section className="space-y-8">
              <div className="flex items-center gap-4 border-b border-slate-100 pb-4">
                <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-navy text-white text-xs font-black shadow-lg">03</span>
                <h2 className="text-xs font-black text-navy uppercase tracking-[0.2em]">Marriage Details</h2>
              </div>
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-muted mb-2">Date of Marriage*</label>
                  <input type="date" name="marriage_date" required value={formData.marriage_date} onChange={handleChange} className="w-full rounded-xl border border-slate-200 bg-background px-4 py-3 text-sm text-navy focus:border-amber focus:outline-none transition-all" />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-muted mb-2">Place of Marriage*</label>
                  <input type="text" name="marriage_place" required value={formData.marriage_place} onChange={handleChange} className="w-full rounded-xl border border-slate-200 bg-background px-4 py-3 text-sm text-navy focus:border-amber focus:outline-none transition-all" />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-muted mb-2">Marriage Act*</label>
                  <select name="marriage_type" value={formData.marriage_type} onChange={handleChange} className="w-full rounded-xl border border-slate-200 bg-background px-4 py-3 text-sm text-navy focus:border-amber focus:outline-none transition-all">
                    <option value="Hindu">Hindu Marriage Act</option>
                    <option value="Muslim">Muslim Marriage Act</option>
                    <option value="Christian">Christian Marriage Act</option>
                    <option value="Special Marriage Act">Special Marriage Act</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-muted mb-2">Registration District*</label>
                  <input type="text" name="registration_district" required value={formData.registration_district} onChange={handleChange} className="w-full rounded-xl border border-slate-200 bg-background px-4 py-3 text-sm text-navy focus:border-amber focus:outline-none transition-all" />
                </div>
              </div>
            </section>

            {/* -- Witness Details -- */}
            <section className="space-y-8">
              <div className="flex items-center gap-4 border-b border-slate-100 pb-4">
                <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-navy text-white text-xs font-black shadow-lg">04</span>
                <h2 className="text-xs font-black text-navy uppercase tracking-[0.2em]">Witness Details</h2>
              </div>
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                <div className="space-y-4 p-6 bg-slate-50 rounded-2xl border border-slate-100">
                    <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400">Witness 1</label>
                    <input type="text" name="witness1_name" required placeholder="Legal Name" value={formData.witness1_name} onChange={handleChange} className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-navy focus:border-amber focus:outline-none transition-all" />
                    <textarea name="witness1_address" required rows={2} placeholder="Address" value={formData.witness1_address} onChange={handleChange} className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-navy focus:border-amber focus:outline-none transition-all" />
                </div>
                <div className="space-y-4 p-6 bg-slate-50 rounded-2xl border border-slate-100">
                    <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400">Witness 2</label>
                    <input type="text" name="witness2_name" required placeholder="Legal Name" value={formData.witness2_name} onChange={handleChange} className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-navy focus:border-amber focus:outline-none transition-all" />
                    <textarea name="witness2_address" required rows={2} placeholder="Address" value={formData.witness2_address} onChange={handleChange} className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-navy focus:border-amber focus:outline-none transition-all" />
                </div>
              </div>
            </section>

            <button
              type="submit"
              disabled={isLoading}
              className="group flex w-full items-center justify-center gap-4 rounded-2xl bg-navy py-6 text-sm font-black uppercase tracking-[0.3em] text-white shadow-[0_20px_40px_-10px_rgba(15,23,42,0.3)] transition-all hover:bg-navy-light hover:shadow-[0_30px_60px_-10px_rgba(15,23,42,0.4)] hover:-translate-y-1 active:translate-y-0 disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                 <div className="h-6 w-6 animate-spin rounded-full border-2 border-white/30 border-t-white"></div>
              ) : (
                <>
                  Submit Registration
                  <svg className="h-5 w-5 text-amber group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                  </svg>
                </>
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
