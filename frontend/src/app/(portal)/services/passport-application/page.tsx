'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { auth } from '@/lib/auth';
import { apiFetch, endpoints } from '@/lib/api';

export default function PassportApplicationPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    // Personal Info
    full_name_aadhaar: '',
    dob: '',
    gender: '',
    marital_status: '',
    nationality: '',
    aadhaar_number: '',
    pan_number: '',
    mobile_number: '',
    email_address: '',
    
    // Address
    permanent_address: '',
    city: '',
    state: '',
    pin_code: '',
    
    // Parent Details
    father_name: '',
    mother_name: '',
    
    // Contact & Type
    emergency_contact: '',
    passport_type: 'Normal',
    
    // Files
    photo_base64: '',
    signature_base64: '',
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
    setIsLoading(true);
    setError('');

    try {
      const data = await apiFetch(endpoints.passportApplication, {
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
        <h1 className="text-5xl font-black tracking-tighter text-navy uppercase leading-none">Passport Application</h1>
        <p className="mt-4 text-sm font-medium text-slate-400">Official government application for international travel documentation.</p>

        <div className="mt-10 flex items-center gap-5 rounded-2xl bg-amber/5 border border-amber/10 p-5 text-xs text-navy text-left mx-auto max-w-3xl">
          <div className="h-10 w-10 flex items-center justify-center bg-amber text-navy rounded-xl shadow-lg shrink-0">
            <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <p className="font-bold leading-relaxed">
            <span className="text-amber-600 uppercase tracking-widest mr-2 font-black">Important:</span>
            Please ensure all documents are valid. Biometric verification may be required later.
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
            {/* -- Personal Information -- */}
            <section className="space-y-8">
              <div className="flex items-center gap-4 border-b border-slate-100 pb-4">
                <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-navy text-white text-xs font-black shadow-lg">01</span>
                <h2 className="text-xs font-black text-navy uppercase tracking-[0.2em]">Personal Details</h2>
              </div>
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-muted mb-2">Full Name (as per Aadhaar)*</label>
                  <input type="text" name="full_name_aadhaar" required value={formData.full_name_aadhaar} onChange={handleChange} placeholder="John Doe" className="w-full rounded-xl border border-slate-200 bg-background px-4 py-3 text-sm text-navy focus:border-amber focus:outline-none transition-all" />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-muted mb-2">DOB*</label>
                  <input type="date" name="dob" required value={formData.dob} onChange={handleChange} className="w-full rounded-xl border border-slate-200 bg-background px-4 py-3 text-sm text-navy focus:border-amber focus:outline-none transition-all" />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-muted mb-2">Gender*</label>
                  <select name="gender" required value={formData.gender} onChange={handleChange} className="w-full rounded-xl border border-slate-200 bg-background px-4 py-3 text-sm text-navy focus:border-amber focus:outline-none transition-all">
                    <option value="">Select Gender</option>
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-muted mb-2">Status*</label>
                  <select name="marital_status" required value={formData.marital_status} onChange={handleChange} className="w-full rounded-xl border border-slate-200 bg-background px-4 py-3 text-sm text-navy focus:border-amber focus:outline-none transition-all">
                    <option value="">Select Status</option>
                    <option value="Single">Single</option>
                    <option value="Married">Married</option>
                    <option value="Divorced">Divorced</option>
                    <option value="Widowed">Widowed</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-muted mb-2">Nationality*</label>
                  <input type="text" name="nationality" required value={formData.nationality} onChange={handleChange} placeholder="Indian" className="w-full rounded-xl border border-slate-200 bg-background px-4 py-3 text-sm text-navy focus:border-amber focus:outline-none transition-all" />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-muted mb-2">Aadhaar*</label>
                  <input type="text" name="aadhaar_number" required value={formData.aadhaar_number} onChange={handleChange} placeholder="1234 5678 9012" className="w-full rounded-xl border border-slate-200 bg-background px-4 py-3 text-sm text-navy focus:border-amber focus:outline-none transition-all" />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-muted mb-2">PAN*</label>
                  <input type="text" name="pan_number" value={formData.pan_number} onChange={handleChange} placeholder="ABCDE1234F" className="w-full rounded-xl border border-slate-200 bg-background px-4 py-3 text-sm text-navy focus:border-amber focus:outline-none transition-all" />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-muted mb-2">Mobile*</label>
                  <input type="tel" name="mobile_number" required value={formData.mobile_number} onChange={handleChange} placeholder="+91 9876543210" className="w-full rounded-xl border border-slate-200 bg-background px-4 py-3 text-sm text-navy focus:border-amber focus:outline-none transition-all" />
                </div>
                <div className="sm:col-span-2">
                  <label className="block text-xs font-bold uppercase tracking-wider text-muted mb-2">Email Address*</label>
                  <input type="email" name="email_address" required value={formData.email_address} onChange={handleChange} placeholder="john.doe@example.com" className="w-full rounded-xl border border-slate-200 bg-background px-4 py-3 text-sm text-navy focus:border-amber focus:outline-none transition-all" />
                </div>
                <div className="sm:col-span-2">
                  <label className="block text-xs font-bold uppercase tracking-wider text-muted mb-2">Passport Size Photo*</label>
                  <div className="mt-1 flex items-center gap-6 p-4 rounded-2xl bg-slate-50 border border-slate-100">
                    {formData.photo_base64 && (
                      <div className="relative h-24 w-20 overflow-hidden rounded-xl border-2 border-white shadow-lg">
                        <img src={formData.photo_base64} alt="Preview" className="h-full w-full object-cover" />
                      </div>
                    )}
                    <input type="file" accept="image/*" required onChange={(e) => handleFileChange(e, 'photo_base64')} className="block w-full text-xs text-slate-400 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-[10px] file:font-black file:uppercase file:tracking-widest file:bg-navy file:text-white hover:file:bg-navy-light transition-all" />
                  </div>
                </div>
              </div>
            </section>

            {/* -- Address Details -- */}
            <section className="space-y-8">
              <div className="flex items-center gap-4 border-b border-slate-100 pb-4">
                <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-navy text-white text-xs font-black shadow-lg">02</span>
                <h2 className="text-xs font-black text-navy uppercase tracking-[0.2em]">Address Details</h2>
              </div>
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                <div className="sm:col-span-2">
                  <label className="block text-xs font-bold uppercase tracking-wider text-muted mb-2">Permanent Address*</label>
                  <textarea name="permanent_address" required rows={3} value={formData.permanent_address} onChange={handleChange} placeholder="House No, Street, Landmark" className="w-full rounded-xl border border-slate-200 bg-background px-4 py-3 text-sm text-navy focus:border-amber focus:outline-none transition-all" />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-muted mb-2">City</label>
                  <input type="text" name="city" value={formData.city} onChange={handleChange} className="w-full rounded-xl border border-slate-200 bg-background px-4 py-3 text-sm text-navy focus:border-amber focus:outline-none transition-all" />
                </div>
                <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-muted mb-2">State</label>
                    <input type="text" name="state" value={formData.state} onChange={handleChange} className="w-full rounded-xl border border-slate-200 bg-background px-4 py-3 text-sm text-navy focus:border-amber focus:outline-none transition-all" />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-muted mb-2">PIN Code</label>
                  <input type="text" name="pin_code" value={formData.pin_code} onChange={handleChange} className="w-full rounded-xl border border-slate-200 bg-background px-4 py-3 text-sm text-navy focus:border-amber focus:outline-none transition-all" />
                </div>
              </div>
            </section>

            {/* -- Parent Details -- */}
            <section className="space-y-8">
              <div className="flex items-center gap-4 border-b border-slate-100 pb-4">
                <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-navy text-white text-xs font-black shadow-lg">03</span>
                <h2 className="text-xs font-black text-navy uppercase tracking-[0.2em]">Parent Details</h2>
              </div>
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-muted mb-2">Father's Name*</label>
                  <input type="text" name="father_name" required value={formData.father_name} onChange={handleChange} className="w-full rounded-xl border border-slate-200 bg-background px-4 py-3 text-sm text-navy focus:border-amber focus:outline-none transition-all" />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-muted mb-2">Mother's Name*</label>
                  <input type="text" name="mother_name" required value={formData.mother_name} onChange={handleChange} className="w-full rounded-xl border border-slate-200 bg-background px-4 py-3 text-sm text-navy focus:border-amber focus:outline-none transition-all" />
                </div>
              </div>
            </section>

             {/* -- Application Details -- */}
             <section className="space-y-8">
              <div className="flex items-center gap-4 border-b border-slate-100 pb-4">
                <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-navy text-white text-xs font-black shadow-lg">04</span>
                <h2 className="text-xs font-black text-navy uppercase tracking-[0.2em]">Application Details</h2>
              </div>
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-muted mb-2">Emergency Contact Name & Number*</label>
                  <input type="tel" name="emergency_contact" required value={formData.emergency_contact} onChange={handleChange} placeholder="Phone Number" className="w-full rounded-xl border border-slate-200 bg-background px-4 py-3 text-sm text-navy focus:border-amber focus:outline-none transition-all" />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-muted mb-2">Application Type*</label>
                  <div className="flex gap-4 mt-2">
                    <label className="flex items-center gap-3 text-xs font-black uppercase tracking-widest text-navy cursor-pointer">
                      <input type="radio" name="passport_type" value="Normal" checked={formData.passport_type === 'Normal'} onChange={handleChange} className="accent-navy h-4 w-4" />
                      Standard
                    </label>
                    <label className="flex items-center gap-3 text-xs font-black uppercase tracking-widest text-navy cursor-pointer">
                      <input type="radio" name="passport_type" value="Tatkal" checked={formData.passport_type === 'Tatkal'} onChange={handleChange} className="accent-amber h-4 w-4" />
                      Express (Tatkal)
                    </label>
                  </div>
                </div>
                <div className="sm:col-span-2">
                  <label className="block text-xs font-bold uppercase tracking-wider text-muted mb-2">Signature Scan*</label>
                  <div className="mt-1 flex items-center gap-6 p-4 rounded-2xl bg-slate-50 border border-slate-100">
                    {formData.signature_base64 && (
                      <div className="relative h-12 w-32 overflow-hidden rounded-xl border-dashed border-2 border-slate-200 bg-white">
                        <img src={formData.signature_base64} alt="Signature Preview" className="h-full w-full object-contain" />
                      </div>
                    )}
                    <input type="file" accept="image/*" required onChange={(e) => handleFileChange(e, 'signature_base64')} className="block w-full text-xs text-slate-400 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-[10px] file:font-black file:uppercase file:tracking-widest file:bg-navy file:text-white hover:file:bg-navy-light transition-all" />
                  </div>
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
                  Submit Application
                  <svg className="h-5 w-5 text-amber group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
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
