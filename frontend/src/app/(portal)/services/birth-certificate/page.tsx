'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { auth } from '@/lib/auth';
import { apiFetch, endpoints } from '@/lib/api';

export default function BirthCertificatePage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    applicant_name: '', // Child's Name
    dob: '',
    father_name: '',
    mother_name: '',
    gender: 'Male',
    place_of_birth: '',
    hospital_name: '',
    address: '',
    phone: '',
    doctor_certificate_base64: '',
    parent_aadhaar_base64: '',
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!auth.isAuthenticated()) {
      router.push('/login');
    }
  }, [router]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, field: string) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => {
      setFormData(prev => ({ ...prev, [field]: reader.result as string }));
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.doctor_certificate_base64 || !formData.parent_aadhaar_base64) {
      setError('Please upload all required verifiable documents.');
      return;
    }
    setIsLoading(true);
    setError('');

    try {
      const data = await apiFetch(endpoints.birthCertificate, {
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
        <h1 className="text-5xl font-black tracking-tighter text-navy uppercase leading-none">Birth Certificate</h1>
        <p className="mt-4 text-sm font-medium text-slate-400">Official government registration for newborn citizens.</p>
      </div>

      <div className="rounded-[32px] border border-slate-100 bg-white p-10 shadow-[0_40px_80px_-20px_rgba(15,23,42,0.08)]">
        <div className="mb-10 flex items-center gap-5 rounded-2xl bg-amber/5 border border-amber/10 p-5 text-xs text-navy">
          <div className="h-10 w-10 flex items-center justify-center bg-amber text-navy rounded-xl shadow-lg shrink-0">
            <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <p className="font-bold leading-relaxed">
            <span className="text-amber-600 uppercase tracking-widest mr-2 font-black">Important:</span>
            Please ensure all details match the hospital discharge summary exactly to avoid delays in processing. Multi-layer verification will be performed.
          </p>
        </div>

        {error && (
          <div className="mb-6 rounded-xl bg-danger/10 p-4 text-sm font-bold text-danger animate-shake">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-10">
          {/* Section 1: Child's Details */}
          <section className="space-y-8">
            <div className="flex items-center gap-4 border-b border-slate-100 pb-4">
              <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-navy text-white text-xs font-black shadow-lg">01</span>
              <h2 className="text-xs font-black text-navy uppercase tracking-[0.2em]">Child's Information</h2>
            </div>
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
              <div className="space-y-1.5">
                <label className="text-[11px] font-black uppercase tracking-widest text-muted/80">Full Name of Child*</label>
                <input required name="applicant_name" value={formData.applicant_name} onChange={handleChange} className="w-full rounded-xl border-2 border-muted/10 bg-muted/5 px-4 py-3 font-bold text-navy transition-all focus:border-primary focus:bg-white outline-none" placeholder="Enter Full Name" />
              </div>
              <div className="space-y-1.5">
                <label className="text-[11px] font-black uppercase tracking-widest text-muted/80">Date of Birth*</label>
                <input required name="dob" type="date" value={formData.dob} onChange={handleChange} className="w-full rounded-xl border-2 border-muted/10 bg-muted/5 px-4 py-3 font-bold text-navy transition-all focus:border-primary focus:bg-white outline-none" />
              </div>
              <div className="space-y-1.5">
                <label className="text-[11px] font-black uppercase tracking-widest text-muted/80">Gender*</label>
                <select name="gender" value={formData.gender} onChange={handleChange} className="w-full rounded-xl border-2 border-muted/10 bg-muted/5 px-4 py-3 font-bold text-navy outline-none focus:border-primary focus:bg-white">
                  <option>Male</option>
                  <option>Female</option>
                  <option>Other</option>
                </select>
              </div>
              <div className="space-y-1.5">
                <label className="text-[11px] font-black uppercase tracking-widest text-muted/80">Hospital Name*</label>
                <input required name="hospital_name" value={formData.hospital_name} onChange={handleChange} className="w-full rounded-xl border-2 border-muted/10 bg-muted/5 px-4 py-3 font-bold text-navy transition-all focus:border-primary focus:bg-white outline-none" placeholder="e.g. City General Hospital" />
              </div>
              <div className="space-y-1.5 sm:col-span-2">
                <label className="text-[11px] font-black uppercase tracking-widest text-muted/80">Place of Birth (City/Town)*</label>
                <input required name="place_of_birth" value={formData.place_of_birth} onChange={handleChange} className="w-full rounded-xl border-2 border-muted/10 bg-muted/5 px-4 py-3 font-bold text-navy transition-all focus:border-primary focus:bg-white outline-none" placeholder="City of birth" />
              </div>
            </div>
          </section>

          {/* Section 2: Parents' Details */}
          <section className="space-y-6">
            <div className="flex items-center gap-3 border-b border-border pb-2">
              <span className="flex h-6 w-6 items-center justify-center rounded-full bg-primary/20 text-xs font-bold text-primary">2</span>
              <h2 className="text-xl font-bold text-navy">Parents' Information</h2>
            </div>
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
              <div className="space-y-1.5">
                <label className="text-[11px] font-black uppercase tracking-widest text-muted/80">Father's Full Name*</label>
                <input required name="father_name" value={formData.father_name} onChange={handleChange} className="w-full rounded-xl border-2 border-muted/10 bg-muted/5 px-4 py-3 font-bold text-navy transition-all focus:border-primary focus:bg-white outline-none" />
              </div>
              <div className="space-y-1.5">
                <label className="text-[11px] font-black uppercase tracking-widest text-muted/80">Mother's Full Name*</label>
                <input required name="mother_name" value={formData.mother_name} onChange={handleChange} className="w-full rounded-xl border-2 border-muted/10 bg-muted/5 px-4 py-3 font-bold text-navy transition-all focus:border-primary focus:bg-white outline-none" />
              </div>
              <div className="space-y-1.5">
                <label className="text-[11px] font-black uppercase tracking-widest text-muted/80">Mobile Number*</label>
                <input required name="phone" type="tel" value={formData.phone} onChange={handleChange} className="w-full rounded-xl border-2 border-muted/10 bg-muted/5 px-4 py-3 font-bold text-navy transition-all focus:border-primary focus:bg-white outline-none" />
              </div>
              <div className="space-y-1.5 sm:col-span-2">
                <label className="text-[11px] font-black uppercase tracking-widest text-muted/80">Permanent Address*</label>
                <textarea required name="address" rows={3} value={formData.address} onChange={handleChange} className="w-full rounded-xl border-2 border-muted/10 bg-muted/5 px-4 py-3 font-bold text-navy transition-all focus:border-primary focus:bg-white outline-none" placeholder="Current residential address" />
              </div>
            </div>
          </section>

          {/* Section 3: Verifiable Documents */}
          <section className="space-y-6">
            <div className="flex items-center gap-3 border-b border-border pb-2">
              <span className="flex h-6 w-6 items-center justify-center rounded-full bg-primary/20 text-xs font-bold text-primary">3</span>
              <h2 className="text-xl font-bold text-navy">Verifiable Documents</h2>
            </div>
            <div className="grid grid-cols-1 gap-8 sm:grid-cols-2">
              <div className="space-y-4">
                <label className="text-[11px] font-black uppercase tracking-widest text-muted/80">Doctor's Certificate (PDF/Image)*</label>
                <div className="flex items-center gap-4">
                   <input type="file" required accept="image/*,application/pdf" onChange={(e) => handleFileChange(e, 'doctor_certificate_base64')} className="block w-full text-xs text-muted file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-[10px] file:font-black file:bg-primary/10 file:text-primary" />
                   {formData.doctor_certificate_base64 && <div className="h-6 w-6 text-success"><svg fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" /></svg></div>}
                </div>
              </div>
              <div className="space-y-4">
                <label className="text-[11px] font-black uppercase tracking-widest text-muted/80">Parent's Aadhaar Scan*</label>
                <div className="flex items-center gap-4">
                   <input type="file" required accept="image/*,application/pdf" onChange={(e) => handleFileChange(e, 'parent_aadhaar_base64')} className="block w-full text-xs text-muted file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-[10px] file:font-black file:bg-primary/10 file:text-primary" />
                   {formData.parent_aadhaar_base64 && <div className="h-6 w-6 text-success"><svg fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" /></svg></div>}
                </div>
              </div>
            </div>
          </section>

          <button
            type="submit"
            disabled={isLoading}
            className="group flex w-full items-center justify-center gap-4 rounded-2xl bg-navy py-6 text-sm font-black uppercase tracking-[0.3em] text-white shadow-[0_20px_40px_-10px_rgba(15,23,42,0.3)] transition-all hover:bg-navy-light hover:shadow-[0_30px_60px_-10px_rgba(15,23,42,0.4)] hover:-translate-y-1 active:translate-y-0 disabled:opacity-70"
          >
            {isLoading ? (
               <div className="h-6 w-6 animate-spin rounded-full border-2 border-white/30 border-t-white"></div>
            ) : (
                <>
                  Submit Application
                  <svg className="h-5 w-5 text-amber group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                  </svg>
                </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
