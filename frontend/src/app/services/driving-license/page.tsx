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
      <div className="mb-8">
        <h1 className="text-4xl font-extrabold tracking-tight text-navy">Driving License Registration</h1>
        <div className="mt-6 flex items-start gap-4 rounded-xl border-l-4 border-primary bg-primary/5 p-4 text-sm text-navy/80">
          <svg className="mt-0.5 h-5 w-5 flex-shrink-0 text-primary" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
          </svg>
          <p>
            Please provide accurate information for your driving license registration. All fields marked with (*) are mandatory.
          </p>
        </div>
      </div>

      <div className="rounded-2xl border border-border bg-white shadow-xl overflow-hidden">
        <div className="p-8">
          {error && (
            <div className="mb-8 rounded-lg bg-danger/10 p-4 text-sm font-medium text-danger animate-shake">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-10">
            {/* -- Personal Information -- */}
            <div>
              <h3 className="text-lg font-bold text-navy mb-6 pb-2 border-b border-border flex items-center gap-2">
                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-primary text-white text-[10px]">1</span>
                Personal Information
              </h3>
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-muted mb-2">Full Name*</label>
                  <input type="text" name="full_name" required value={formData.full_name} onChange={handleChange} placeholder="John Doe" className="w-full rounded-xl border border-border bg-background px-4 py-3 text-sm text-navy focus:border-primary focus:outline-none transition-all" />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-muted mb-2">Date of Birth*</label>
                  <input type="date" name="dob" required value={formData.dob} onChange={handleChange} className="w-full rounded-xl border border-border bg-background px-4 py-3 text-sm text-navy focus:border-primary focus:outline-none transition-all" />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-muted mb-2">Gender*</label>
                  <select name="gender" required value={formData.gender} onChange={handleChange} className="w-full rounded-xl border border-border bg-background px-4 py-3 text-sm text-navy focus:border-primary focus:outline-none transition-all">
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-muted mb-2">Blood Group*</label>
                  <input type="text" name="blood_group" required value={formData.blood_group} onChange={handleChange} placeholder="e.g. O+" className="w-full rounded-xl border border-border bg-background px-4 py-3 text-sm text-navy focus:border-primary focus:outline-none transition-all" />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-muted mb-2">Mobile Number*</label>
                  <input type="tel" name="mobile_number" required value={formData.mobile_number} onChange={handleChange} placeholder="+91 9876543210" className="w-full rounded-xl border border-border bg-background px-4 py-3 text-sm text-navy focus:border-primary focus:outline-none transition-all" />
                </div>
              </div>
            </div>

            {/* -- Identity Verification -- */}
            <div>
              <h3 className="text-lg font-bold text-navy mb-6 pb-2 border-b border-border flex items-center gap-2">
                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-primary text-white text-[10px]">2</span>
                Identity Verification
              </h3>
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-muted mb-2">Aadhaar Number*</label>
                  <input type="text" name="aadhaar_number" required value={formData.aadhaar_number} onChange={handleChange} placeholder="1234 5678 9012" className="w-full rounded-xl border border-border bg-background px-4 py-3 text-sm text-navy focus:border-primary focus:outline-none transition-all" />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-muted mb-2">PAN Number (Optional)</label>
                  <input type="text" name="pan_number" value={formData.pan_number} onChange={handleChange} placeholder="ABCDE1234F" className="w-full rounded-xl border border-border bg-background px-4 py-3 text-sm text-navy focus:border-primary focus:outline-none transition-all" />
                </div>
              </div>
            </div>

            {/* -- Address Details -- */}
            <div>
              <h3 className="text-lg font-bold text-navy mb-6 pb-2 border-b border-border flex items-center gap-2">
                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-primary text-white text-[10px]">3</span>
                Address Details
              </h3>
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                <div className="sm:col-span-2">
                  <label className="block text-xs font-bold uppercase tracking-wider text-muted mb-2">Residential Address*</label>
                  <textarea name="residential_address" required rows={3} value={formData.residential_address} onChange={handleChange} placeholder="House No, Street, Landmark" className="w-full rounded-xl border border-border bg-background px-4 py-3 text-sm text-navy focus:border-primary focus:outline-none transition-all" />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-muted mb-2">City</label>
                  <input type="text" name="city" value={formData.city} onChange={handleChange} className="w-full rounded-xl border border-border bg-background px-4 py-3 text-sm text-navy focus:border-primary focus:outline-none transition-all" />
                </div>
                <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-muted mb-2">State</label>
                    <input type="text" name="state" value={formData.state} onChange={handleChange} className="w-full rounded-xl border-border bg-background px-4 py-3 text-sm text-navy focus:border-primary focus:outline-none transition-all" />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-muted mb-2">PIN Code</label>
                  <input type="text" name="pin_code" value={formData.pin_code} onChange={handleChange} className="w-full rounded-xl border border-border bg-background px-4 py-3 text-sm text-navy focus:border-primary focus:outline-none transition-all" />
                </div>
              </div>
            </div>

            {/* -- Driving Details -- */}
            <div>
              <h3 className="text-lg font-bold text-navy mb-6 pb-2 border-b border-border flex items-center gap-2">
                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-primary text-white text-[10px]">4</span>
                Driving Details
              </h3>
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-muted mb-2">Vehicle Type*</label>
                  <select name="vehicle_type" value={formData.vehicle_type} onChange={handleChange} className="w-full rounded-xl border border-border bg-background px-4 py-3 text-sm text-navy focus:border-primary focus:outline-none transition-all">
                    <option value="two wheeler">two wheeler</option>
                    <option value="four wheeler">four wheeler</option>
                    <option value="heavy vehicle">heavy vehicle</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-muted mb-2">Gear Type*</label>
                  <select name="gear_type" value={formData.gear_type} onChange={handleChange} className="w-full rounded-xl border border-border bg-background px-4 py-3 text-sm text-navy focus:border-primary focus:outline-none transition-all">
                    <option value="with gear">with gear</option>
                    <option value="without gear">without gear</option>
                  </select>
                </div>
                <div className="sm:col-span-2">
                  <label className="block text-xs font-bold uppercase tracking-wider text-muted mb-2">License Type*</label>
                  <select name="license_type" value={formData.license_type} onChange={handleChange} className="w-full rounded-xl border border-border bg-background px-4 py-3 text-sm text-navy focus:border-primary focus:outline-none transition-all">
                    <option value="Learner License Number">Learner License</option>
                    <option value="permanent license">Permanent License</option>
                  </select>
                </div>
              </div>
            </div>

            {/* -- Health Declaration -- */}
            <div>
              <h3 className="text-lg font-bold text-navy mb-6 pb-2 border-b border-border flex items-center gap-2">
                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-primary text-white text-[10px]">5</span>
                Health Declaration
              </h3>
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-muted mb-2">Vision Status</label>
                  <select name="vision_status" value={formData.vision_status} onChange={handleChange} className="w-full rounded-xl border border-border bg-background px-4 py-3 text-sm text-navy focus:border-primary focus:outline-none transition-all">
                    <option value="clear eyesight">Clear Eyesight</option>
                    <option value="has myopia">Myopia</option>
                    <option value="has hypermeteropia">Hypermetropia</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-muted mb-2">Disabled Person?</label>
                  <select name="is_disabled" value={formData.is_disabled} onChange={handleChange} className="w-full rounded-xl border border-border bg-background px-4 py-3 text-sm text-navy focus:border-primary focus:outline-none transition-all">
                    <option value="No">No</option>
                    <option value="Yes">Yes</option>
                  </select>
                </div>
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading || !!error}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-primary py-4 text-sm font-bold text-white shadow-md transition-all hover:bg-primary-dark hover:shadow-lg disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <div className="h-5 w-5 animate-spin rounded-full border-2 border-white/30 border-t-white"></div>
              ) : (
                <>
                  Submit Driving License Application
                  <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
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
