'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { auth } from '@/lib/auth';
import { apiFetch, endpoints } from '@/lib/api';

export default function CommunityCertificatePage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    full_name: '',
    dob: '',
    gender: 'Male',
    aadhaar_number: '',
    mobile_number: '',
    residential_address: '',
    district: '',
    state: '',
    pin_code: '',
    father_name: '',
    mother_name: '',
    father_community: '',
    father_caste: '',
    mother_community: '',
    mother_caste: '',
    requested_category: 'OBC',
    parent_certificate_base64: '',
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

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = () => {
      setFormData(prev => ({ ...prev, parent_certificate_base64: reader.result as string }));
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.parent_certificate_base64) {
      setError('Please upload previous community certificate of parents for verification.');
      return;
    }
    setIsLoading(true);
    setError('');

    try {
      const data = await apiFetch(endpoints.communityCertificate, {
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
      <div className="mb-8">
        <h1 className="text-4xl font-extrabold tracking-tight text-navy">Community / Caste Certificate</h1>
        <p className="mt-2 text-muted">Legal verification of social category and caste for official records.</p>
      </div>

      <div className="rounded-2xl border border-border bg-white shadow-xl overflow-hidden">
        <div className="p-8">
          {error && (
            <div className="mb-8 rounded-lg bg-danger/10 p-4 text-sm font-medium text-danger">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-10">
            {/* -- Personal Information -- */}
            <section>
              <h3 className="text-lg font-bold text-navy mb-6 pb-2 border-b border-border flex items-center gap-2">
                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-primary text-white text-[10px]">1</span>
                Personal Information
              </h3>
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-muted mb-2">Full Name*</label>
                  <input type="text" name="full_name" required value={formData.full_name} onChange={handleChange} className="w-full rounded-xl border border-border bg-background px-4 py-3 text-sm focus:border-primary focus:outline-none" />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-muted mb-2">Date of Birth*</label>
                  <input type="date" name="dob" required value={formData.dob} onChange={handleChange} className="w-full rounded-xl border border-border bg-background px-4 py-3 text-sm focus:border-primary focus:outline-none" />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-muted mb-2">Gender*</label>
                   <select name="gender" required value={formData.gender} onChange={handleChange} className="w-full rounded-xl border border-border bg-background px-4 py-3 text-sm focus:border-primary focus:outline-none">
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-muted mb-2">Aadhaar Number*</label>
                  <input type="text" name="aadhaar_number" required value={formData.aadhaar_number} onChange={handleChange} className="w-full rounded-xl border border-border bg-background px-4 py-3 text-sm focus:border-primary focus:outline-none" />
                </div>
                <div className="sm:col-span-2">
                   <label className="block text-xs font-bold uppercase tracking-wider text-muted mb-2">Mobile Number*</label>
                   <input type="tel" name="mobile_number" required value={formData.mobile_number} onChange={handleChange} className="w-full rounded-xl border border-border bg-background px-4 py-3 text-sm focus:border-primary focus:outline-none" />
                </div>
              </div>
            </section>

             {/* -- Address -- */}
             <section>
              <h3 className="text-lg font-bold text-navy mb-6 pb-2 border-b border-border flex items-center gap-2">
                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-primary text-white text-[10px]">2</span>
                Address
              </h3>
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                <div className="sm:col-span-2">
                  <label className="block text-xs font-bold uppercase tracking-wider text-muted mb-2">Residential Address*</label>
                  <textarea name="residential_address" required rows={2} value={formData.residential_address} onChange={handleChange} className="w-full rounded-xl border border-border bg-background px-4 py-3 text-sm focus:border-primary focus:outline-none" />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-muted mb-2">District*</label>
                  <input type="text" name="district" required value={formData.district} onChange={handleChange} className="w-full rounded-xl border border-border bg-background px-4 py-3 text-sm focus:border-primary focus:outline-none" />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-muted mb-2">State*</label>
                  <input type="text" name="state" required value={formData.state} onChange={handleChange} className="w-full rounded-xl border border-border bg-background px-4 py-3 text-sm focus:border-primary focus:outline-none" />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-muted mb-2">PIN Code*</label>
                  <input type="text" name="pin_code" required value={formData.pin_code} onChange={handleChange} className="w-full rounded-xl border border-border bg-background px-4 py-3 text-sm focus:border-primary focus:outline-none" />
                </div>
              </div>
            </section>

            {/* -- Family Details -- */}
            <section>
              <h3 className="text-lg font-bold text-navy mb-6 pb-2 border-b border-border flex items-center gap-2">
                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-primary text-white text-[10px]">3</span>
                Family Details
              </h3>
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-muted mb-2">Father's Name*</label>
                  <input type="text" name="father_name" required value={formData.father_name} onChange={handleChange} className="w-full rounded-xl border border-border bg-background px-4 py-3 text-sm focus:border-primary focus:outline-none" />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-muted mb-2">Mother's Name*</label>
                  <input type="text" name="mother_name" required value={formData.mother_name} onChange={handleChange} className="w-full rounded-xl border border-border bg-background px-4 py-3 text-sm focus:border-primary focus:outline-none" />
                </div>
                <div className="p-4 bg-slate-50 rounded-xl space-y-4">
                  <p className="text-xs font-bold text-navy">Paternal Ancestry</p>
                  <div>
                    <label className="block text-[10px] font-bold text-muted uppercase">Community</label>
                    <input type="text" name="father_community" required value={formData.father_community} onChange={handleChange} className="w-full border-b border-border bg-transparent py-1 text-sm focus:border-primary outline-none" />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-muted uppercase">Caste</label>
                    <input type="text" name="father_caste" required value={formData.father_caste} onChange={handleChange} className="w-full border-b border-border bg-transparent py-1 text-sm focus:border-primary outline-none" />
                  </div>
                </div>
                <div className="p-4 bg-slate-50 rounded-xl space-y-4">
                  <p className="text-xs font-bold text-navy">Maternal Ancestry</p>
                  <div>
                    <label className="block text-[10px] font-bold text-muted uppercase">Community</label>
                    <input type="text" name="mother_community" required value={formData.mother_community} onChange={handleChange} className="w-full border-b border-border bg-transparent py-1 text-sm focus:border-primary outline-none" />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-muted uppercase">Caste</label>
                    <input type="text" name="mother_caste" required value={formData.mother_caste} onChange={handleChange} className="w-full border-b border-border bg-transparent py-1 text-sm focus:border-primary outline-none" />
                  </div>
                </div>
              </div>
            </section>

             {/* -- Community Information -- */}
             <section>
              <h3 className="text-lg font-bold text-navy mb-6 pb-2 border-b border-border flex items-center gap-2">
                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-primary text-white text-[10px]">4</span>
                Community Requested
              </h3>
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-muted mb-2">Requested Community Category*</label>
                  <select name="requested_category" value={formData.requested_category} onChange={handleChange} className="w-full rounded-xl border border-border bg-background px-4 py-3 text-sm focus:border-primary focus:outline-none">
                    <option value="SC">SC</option>
                    <option value="ST">ST</option>
                    <option value="OBC">OBC</option>
                    <option value="General">General</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-muted mb-2">Upload Previous Community Certificate*</label>
                  <input type="file" required onChange={handleFileChange} className="w-full text-xs text-muted file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-[10px] file:font-black file:bg-primary/10 file:text-primary" />
                </div>
              </div>
            </section>

            <button
              type="submit"
              disabled={isLoading}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-primary py-4 text-sm font-bold text-white shadow-md transition-all hover:bg-primary-dark disabled:opacity-70"
            >
              {isLoading ? 'Verifying Credentials...' : 'Submit Community Certificate Application'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
