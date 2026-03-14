'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { auth } from '@/lib/auth';
import { apiFetch, endpoints } from '@/lib/api';

export default function DrivingLicensePage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    // Personal Information
    full_name: '',
    dob: '',
    gender: 'Male',
    blood_group: '',
    mobile_number: '',
    
    // Identity Verification
    aadhaar_number: '',
    pan_number: '',
    
    // Address
    residential_address: '',
    city: '',
    state: '',
    pin_code: '',
    
    // Driving Details
    vehicle_type: 'two wheeler',
    gear_type: 'with gear',
    license_type: 'Learner License Number',
    
    // Health Declaration
    vision_status: 'clear eyesight',
    is_disabled: 'No',
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
    
    // Validation for Age (Driving License usually requires age > 18)
    if (name === 'dob') {
        const birthDate = new Date(value);
        const today = new Date();
        let age = today.getFullYear() - birthDate.getFullYear();
        const m = today.getMonth() - birthDate.getMonth();
        if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
            age--;
        }
        if (age < 18) {
            setError('You must be at least 18 years old to apply for a driving license.');
        } else {
            setError('');
        }
    }

    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (error) return;

    setIsLoading(true);
    setError('');

    try {
      const data = await apiFetch(endpoints.drivingLicense, {
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
        <h1 className="text-5xl font-black tracking-tighter text-navy uppercase leading-none">Driving License</h1>
        <p className="mt-4 text-sm font-medium text-slate-400">Application for learner or permanent driving license.</p>

        <div className="mt-10 flex items-center gap-5 rounded-2xl bg-amber/5 border border-amber/10 p-5 text-xs text-navy text-left mx-auto max-w-3xl">
          <div className="h-10 w-10 flex items-center justify-center bg-amber text-navy rounded-xl shadow-lg shrink-0">
            <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <p className="font-bold leading-relaxed">
            <span className="text-amber-600 uppercase tracking-widest mr-2 font-black">Important:</span>
            Please ensure all personal details are accurate. Falsification of records is a legal offense.
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

          <form onSubmit={handleSubmit} className="space-y-10">
            {/* -- Personal Information -- */}
            <section className="space-y-8">
              <div className="flex items-center gap-4 border-b border-slate-100 pb-4">
                <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-navy text-white text-xs font-black shadow-lg">01</span>
                <h2 className="text-xs font-black text-navy uppercase tracking-[0.2em]">Personal Details</h2>
              </div>
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-muted mb-2">Full Name*</label>
                  <input type="text" name="full_name" required value={formData.full_name} onChange={handleChange} placeholder="John Doe" className="w-full rounded-xl border border-slate-200 bg-background px-4 py-3 text-sm text-navy focus:border-amber focus:outline-none transition-all" />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-muted mb-2">Date of Birth*</label>
                  <input type="date" name="dob" required value={formData.dob} onChange={handleChange} className="w-full rounded-xl border border-slate-200 bg-background px-4 py-3 text-sm text-navy focus:border-amber focus:outline-none transition-all" />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-muted mb-2">Gender*</label>
                  <select name="gender" required value={formData.gender} onChange={handleChange} className="w-full rounded-xl border border-slate-200 bg-background px-4 py-3 text-sm text-navy focus:border-amber focus:outline-none transition-all">
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-muted mb-2">Blood Group*</label>
                  <input type="text" name="blood_group" required value={formData.blood_group} onChange={handleChange} placeholder="e.g. O+" className="w-full rounded-xl border border-slate-200 bg-background px-4 py-3 text-sm text-navy focus:border-amber focus:outline-none transition-all" />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-muted mb-2">Mobile Number*</label>
                  <input type="tel" name="mobile_number" required value={formData.mobile_number} onChange={handleChange} placeholder="+91 9876543210" className="w-full rounded-xl border border-slate-200 bg-background px-4 py-3 text-sm text-navy focus:border-amber focus:outline-none transition-all" />
                </div>
              </div>
            </section>

            {/* -- Identity Verification -- */}
            <section className="space-y-8">
              <div className="flex items-center gap-4 border-b border-slate-100 pb-4">
                <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-navy text-white text-xs font-black shadow-lg">02</span>
                <h2 className="text-xs font-black text-navy uppercase tracking-[0.2em]">Identity Verification</h2>
              </div>
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-muted mb-2">Aadhaar Number*</label>
                  <input type="text" name="aadhaar_number" required value={formData.aadhaar_number} onChange={handleChange} placeholder="1234 5678 9012" className="w-full rounded-xl border border-slate-200 bg-background px-4 py-3 text-sm text-navy focus:border-amber focus:outline-none transition-all" />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-muted mb-2">PAN Number (Optional)</label>
                  <input type="text" name="pan_number" value={formData.pan_number} onChange={handleChange} placeholder="ABCDE1234F" className="w-full rounded-xl border border-slate-200 bg-background px-4 py-3 text-sm text-navy focus:border-amber focus:outline-none transition-all" />
                </div>
              </div>
            </section>

            {/* -- Address Details -- */}
            <section className="space-y-8">
              <div className="flex items-center gap-4 border-b border-slate-100 pb-4">
                <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-navy text-white text-xs font-black shadow-lg">03</span>
                <h2 className="text-xs font-black text-navy uppercase tracking-[0.2em]">Address Details</h2>
              </div>
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                <div className="sm:col-span-2">
                  <label className="block text-xs font-bold uppercase tracking-wider text-muted mb-2">Residential Address*</label>
                  <textarea name="residential_address" required rows={3} value={formData.residential_address} onChange={handleChange} placeholder="House No, Street, Landmark" className="w-full rounded-xl border border-slate-200 bg-background px-4 py-3 text-sm text-navy focus:border-amber focus:outline-none transition-all" />
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

            {/* -- Driving Details -- */}
            <section className="space-y-8">
              <div className="flex items-center gap-4 border-b border-slate-100 pb-4">
                <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-navy text-white text-xs font-black shadow-lg">04</span>
                <h2 className="text-xs font-black text-navy uppercase tracking-[0.2em]">Driving Details</h2>
              </div>
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-muted mb-2">Vehicle Type*</label>
                  <select name="vehicle_type" value={formData.vehicle_type} onChange={handleChange} className="w-full rounded-xl border border-slate-200 bg-background px-4 py-3 text-sm text-navy focus:border-amber focus:outline-none transition-all">
                    <option value="two wheeler">two wheeler</option>
                    <option value="four wheeler">four wheeler</option>
                    <option value="heavy vehicle">heavy vehicle</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-muted mb-2">Gear Type*</label>
                  <select name="gear_type" value={formData.gear_type} onChange={handleChange} className="w-full rounded-xl border border-slate-200 bg-background px-4 py-3 text-sm text-navy focus:border-amber focus:outline-none transition-all">
                    <option value="with gear">with gear</option>
                    <option value="without gear">without gear</option>
                  </select>
                </div>
                <div className="sm:col-span-2">
                  <label className="block text-xs font-bold uppercase tracking-wider text-muted mb-2">License Type*</label>
                  <select name="license_type" value={formData.license_type} onChange={handleChange} className="w-full rounded-xl border border-slate-200 bg-background px-4 py-3 text-sm text-navy focus:border-amber focus:outline-none transition-all">
                    <option value="Learner License Number">Learner License</option>
                    <option value="permanent license">Permanent License</option>
                  </select>
                </div>
              </div>
            </section>

            {/* -- Health Declaration -- */}
            <section className="space-y-8">
              <div className="flex items-center gap-4 border-b border-slate-100 pb-4">
                <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-navy text-white text-xs font-black shadow-lg">05</span>
                <h2 className="text-xs font-black text-navy uppercase tracking-[0.2em]">Health Declaration</h2>
              </div>
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-muted mb-2">Vision Status</label>
                  <select name="vision_status" value={formData.vision_status} onChange={handleChange} className="w-full rounded-xl border border-slate-200 bg-background px-4 py-3 text-sm text-navy focus:border-amber focus:outline-none transition-all">
                    <option value="clear eyesight">Clear Eyesight</option>
                    <option value="has myopia">Myopia</option>
                    <option value="has hypermeteropia">Hypermetropia</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-muted mb-2">Disabled Person?</label>
                  <select name="is_disabled" value={formData.is_disabled} onChange={handleChange} className="w-full rounded-xl border border-slate-200 bg-background px-4 py-3 text-sm text-navy focus:border-amber focus:outline-none transition-all">
                    <option value="No">No</option>
                    <option value="Yes">Yes</option>
                  </select>
                </div>
              </div>
            </section>

            <button
              type="submit"
              disabled={isLoading || !!error}
              className="group flex w-full items-center justify-center gap-4 rounded-2xl bg-navy py-6 text-sm font-black uppercase tracking-[0.3em] text-white shadow-[0_20px_40px_-10px_rgba(15,23,42,0.3)] transition-all hover:bg-navy-light hover:shadow-[0_30px_60px_-10px_rgba(15,23,42,0.4)] hover:-translate-y-1 active:translate-y-0 disabled:opacity-70 disabled:cursor-not-allowed"
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
    </div>
  );
}
