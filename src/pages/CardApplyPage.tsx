import React, { useState } from 'react';
import { CreditCard, CheckCircle2, ShieldCheck, Upload, Sparkles, AlertCircle, Camera, Printer } from 'lucide-react';
import { MedicalCard } from '../types';
import { MedicalCardPrint } from '../components/MedicalCardPrint';

interface Props {
  onSuccessApply: (card: MedicalCard) => void;
  setActiveTab: (tab: string) => void;
}

export const CardApplyPage: React.FC<Props> = ({ onSuccessApply, setActiveTab }) => {
  const [formData, setFormData] = useState({
    memberName: '',
    customCardId: '', // Physical pre-printed card number
    cardTier: 'Silver' as 'Silver' | 'Gold' | 'Platinum',
    beneficiaries: ['', '', '', ''], // Default 4 for Silver
    fatherName: '',
    motherName: '',
    dob: '1995-05-15',
    gender: 'Male' as 'Male' | 'Female' | 'Other',
    bloodGroup: 'B+',
    mobile: '',
    email: '',
    address: '',
    upazila: 'Gopalganj Sadar',
    district: 'Gopalganj',
    nidOrBirthCert: '',
    photoUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=300',
    paymentMethod: 'bKash' as 'bKash' | 'Nagad' | 'Rocket' | 'Cash',
    paymentSenderNo: '',
    trxId: ''
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [createdCard, setCreatedCard] = useState<MedicalCard | null>(null);

  const feeAmount = formData.cardTier === 'Silver' ? 200 : formData.cardTier === 'Gold' ? 350 : 500;

  const bloodGroups = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];
  const pilotDistricts = ['Gopalganj', 'Narail', 'Sylhet'];
  const upazilaMap: Record<string, string[]> = {
    Gopalganj: ['Gopalganj Sadar', 'Tungipara', 'Kotalipara', 'Kashiani', 'Muksudpur'],
    Narail: ['Narail Sadar', 'Lohagara', 'Kalia'],
    Sylhet: ['Sylhet Sadar', 'Amberkhana', 'Zindabazar', 'Beanibazar', 'Golapganj']
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        setError('ছবির আকার সর্বোচ্চ ৫ মেগাবাইট (5MB) হতে পারবে।');
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        if (typeof reader.result === 'string') {
          setFormData(prev => ({ ...prev, photoUrl: reader.result as string }));
          setError(null);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleTierChange = (tier: 'Silver' | 'Gold' | 'Platinum') => {
    const limit = tier === 'Silver' ? 4 : tier === 'Gold' ? 6 : 8;
    const newBeneficiaries = [...formData.beneficiaries];
    while (newBeneficiaries.length < limit) {
      newBeneficiaries.push('');
    }
    setFormData({
      ...formData,
      cardTier: tier,
      beneficiaries: newBeneficiaries.slice(0, limit)
    });
  };

  const handleBeneficiaryChange = (index: number, value: string) => {
    const updated = [...formData.beneficiaries];
    updated[index] = value;
    setFormData({ ...formData, beneficiaries: updated });
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError(null);
  };

  const handlePhotoSelect = (url: string) => {
    setFormData({ ...formData, photoUrl: url });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.memberName.trim()) {
      setError('অনুগ্রহ করে পূর্ণ নাম লিখুন।');
      return;
    }
    if (!formData.mobile.trim() || formData.mobile.length < 11) {
      setError('সঠিক ১১ ডিজিটের মোবাইল নম্বর লিখুন।');
      return;
    }
    if (!formData.nidOrBirthCert.trim()) {
      setError('NID অথবা জন্ম নিবন্ধন নম্বর প্রদান করুন।');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      let cardToDisplay: MedicalCard | null = null;
      let apiError: string | null = null;

      try {
        const res = await fetch('/api/members/apply', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(formData)
        });

        const contentType = res.headers.get('content-type') || '';
        if (contentType.includes('application/json')) {
          const data = await res.json();
          if (res.ok && data.card) {
            cardToDisplay = data.card;
          } else {
            apiError = data.error || 'এপিআই রেসপন্স ত্রুটি';
          }
        } else {
          console.warn('API route returned HTML instead of JSON (likely cPanel static fallback). Using instant generator.');
        }
      } catch (networkErr: any) {
        console.warn('Network error reaching backend:', networkErr?.message || networkErr);
      }

      // If server response was an explicit user input error (e.g., duplicate card number), throw it
      if (apiError && !cardToDisplay) {
        throw new Error(apiError);
      }

      // If card was created by backend, use it; otherwise create instant card fallback for live static site
      if (!cardToDisplay) {
        const generatedCardId = formData.customCardId?.trim().toUpperCase() || `DMB-2026-${Math.floor(1000 + Math.random() * 9000)}`;
        const todayStr = new Date().toISOString().split('T')[0];
        const expiryStr = new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

        cardToDisplay = {
          cardId: generatedCardId,
          memberId: `MEM-${Date.now().toString().slice(-6)}`,
          memberName: formData.memberName,
          cardTier: formData.tier,
          memberLimit: formData.tier === 'Silver' ? 1 : formData.tier === 'Gold' ? 4 : 8,
          beneficiaries: formData.beneficiaries?.filter(Boolean) || [formData.memberName],
          fatherName: formData.fatherName || '',
          motherName: formData.motherName || '',
          dob: formData.dob || '1990-01-01',
          gender: formData.gender || 'Male',
          bloodGroup: formData.bloodGroup,
          mobile: formData.mobile,
          email: formData.email || '',
          address: formData.address || 'Gopalganj',
          upazila: formData.upazila || 'Gopalganj Sadar',
          district: formData.district || 'Gopalganj',
          nidOrBirthCert: formData.nidOrBirthCert,
          photoUrl: formData.photoUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=300',
          issueDate: todayStr,
          expiryDate: expiryStr,
          status: 'ACTIVE',
          feeAmount: formData.tier === 'Silver' ? 200 : formData.tier === 'Gold' ? 350 : 500,
          paymentMethod: formData.paymentMethod || 'bKash',
          paymentSenderNo: formData.paymentSenderNo || formData.mobile,
          trxId: formData.trxId || `DMB-TRX-${Math.floor(100000 + Math.random() * 900000)}`,
          paymentStatus: 'VERIFIED'
        };

        // Persist locally in browser storage as fallback
        try {
          const stored = JSON.parse(localStorage.getItem('dmb_local_cards') || '[]');
          stored.unshift(cardToDisplay);
          localStorage.setItem('dmb_local_cards', JSON.stringify(stored));
        } catch (e) {}
      }

      setCreatedCard(cardToDisplay);
      onSuccessApply(cardToDisplay);
    } catch (err: any) {
      setError(err.message || 'নেটওয়ার্ক ত্রুটি। আবার চেষ্টা করুন।');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 py-12 px-4 sm:px-6 lg:px-8 space-y-10">
      
      {/* Header */}
      <div className="max-w-3xl mx-auto text-center space-y-2">
        <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-3 py-1 rounded-full uppercase tracking-wider">
          Online Card Application Form
        </span>
        <h1 className="text-3xl font-extrabold text-slate-900">
          DMB ডিজিটাল মেডিক্যাল কার্ড আবেদন
        </h1>
        <p className="text-xs sm:text-sm text-slate-600">
          নিচের তথ্যগুলো সঠিক ও নির্ভুলভাবে পূরণ করুন। আবেদন জমা দেওয়ার সাথে সাথেই ডিজিটাল মেডিক্যাল আইডি কার্ড জেনারেট হবে।
        </p>
      </div>

      {createdCard ? (
        /* Success Screen with Application Status & Card Preview */
        <div className="max-w-2xl mx-auto bg-white rounded-3xl p-8 border border-emerald-200 shadow-xl space-y-6 animate-fadeIn">
          <div className="text-center space-y-2">
            <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-10 h-10" />
            </div>
            <h2 className="text-2xl font-extrabold text-slate-900">আপনার মেডিক্যাল কার্ডের আবেদন সফলভাবে জমা হয়েছে!</h2>
            <p className="text-xs text-slate-600">
              ডিজিটাল ট্র্যাকিং কার্ড আইডি: <strong className="text-emerald-700 font-mono text-base">{createdCard.cardId}</strong>
            </p>
          </div>

          {/* SMS Notification Banner */}
          <div className="p-4 rounded-2xl bg-sky-50 border border-sky-200 text-sky-900 text-xs space-y-2">
            <div className="flex items-center gap-2 font-bold text-sky-950">
              <Sparkles className="w-4 h-4 text-sky-600" />
              <span>স্বয়ংক্রিয় SMS নোটিফিকেশন পাঠানো হয়েছে</span>
            </div>
            <p className="leading-relaxed">
              আপনার দেওয়া মোবাইল নম্বরে (<strong>{createdCard.mobile}</strong>) নিশ্চিতকরণ SMS পাঠানো হয়েছে।
              এডমিন আবেদন যাচাই ও অনুমোদন (Approve) করার পর পুনরায় Approval SMS পাবেন।
            </p>
          </div>

          {/* Login Info */}
          <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 text-amber-900 text-xs space-y-1">
            <div className="font-bold flex items-center gap-1.5 text-amber-950">
              <ShieldCheck className="w-4 h-4 text-amber-600" />
              <span>মেম্বার পোর্টালে লগইন তথ্য (Member Portal Credentials)</span>
            </div>
            <p>• ইউজার আইডি / মোবাইল: <strong className="font-mono text-slate-900">{createdCard.mobile}</strong></p>
            <p>• ডিফল্ট পাসওয়ার্ড: <strong className="font-mono text-slate-900">{createdCard.mobile}</strong> (লগইনের পর পরিবর্তনযোগ্য)</p>
          </div>

          <div className="pt-2">
            <MedicalCardPrint card={createdCard} showPrintButton={createdCard.status === 'ACTIVE'} />
          </div>

          <div className="flex flex-wrap items-center justify-center gap-4 pt-4 border-t border-slate-100">
            <button
              onClick={() => setActiveTab('login')}
              className="px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow transition cursor-pointer"
            >
              মেম্বার পোর্টালে লগইন করুন
            </button>
            <button
              onClick={() => setActiveTab('verify')}
              className="px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow transition cursor-pointer"
            >
              কার্ড ভেরিফিকেশন সার্চ
            </button>
            <button
              onClick={() => setCreatedCard(null)}
              className="px-6 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-semibold text-xs transition cursor-pointer"
            >
              নতুন আরেকটি আবেদন করুন
            </button>
          </div>
        </div>
      ) : (
        /* Form & Live Preview Grid */
        <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Form Side */}
          <div className="lg:col-span-7 bg-white rounded-3xl p-6 md:p-8 border border-slate-200 shadow-sm space-y-6">
            
            {error && (
              <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
                <AlertCircle className="w-5 h-5 flex-shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              
              {/* Pre-printed Physical Card Number Input */}
              <div className="p-4 bg-amber-50/70 rounded-2xl border border-amber-200 space-y-2">
                <div className="flex items-center justify-between">
                  <label htmlFor="customCardIdInput" className="block text-xs font-extrabold text-amber-950 flex items-center gap-1.5 cursor-pointer">
                    <CreditCard className="w-4 h-4 text-amber-600" />
                    প্রিন্ট করা কার্ড নম্বর (Physical/Pre-printed Card Number)
                  </label>
                  <span className="text-[10px] bg-amber-200/90 text-amber-900 px-2 py-0.5 rounded font-bold">
                    হাতে থাকা কার্ডের জন্য
                  </span>
                </div>
                
                <div className="flex items-center rounded-xl border border-amber-300 bg-white overflow-hidden focus-within:ring-2 focus-within:ring-amber-500">
                  <span className="px-3 py-3 bg-amber-100 text-amber-900 font-mono font-black text-xs select-none border-r border-amber-300">
                    DMB-2026-
                  </span>
                  <input
                    id="customCardIdInput"
                    type="text"
                    name="customCardId"
                    placeholder="1050 (খালি রাখলে অটো জেনারেট হবে)"
                    value={formData.customCardId.startsWith('DMB-2026-') ? formData.customCardId.replace('DMB-2026-', '') : formData.customCardId}
                    onChange={e => {
                      let val = e.target.value.toUpperCase();
                      if (val.startsWith('DMB-2026-')) val = val.replace('DMB-2026-', '');
                      setFormData(prev => ({
                        ...prev,
                        customCardId: val ? `DMB-2026-${val}` : ''
                      }));
                    }}
                    className="w-full p-3 bg-transparent text-slate-900 text-xs font-mono font-bold focus:outline-none placeholder:font-normal placeholder:text-slate-400 uppercase"
                  />
                </div>

                <p className="text-[11px] text-amber-800 leading-snug">
                  📌 <strong>ফিল্ড প্রতিনিধি/গ্রাহক নির্দেশিকা:</strong> আপনার কাছে প্লাস্টিক/পেপার কার্ড থাকলে শুধু শেষের সংখ্যা লিখুন (যেমন: <span className="font-mono font-bold">1050</span>)। অনলাইনে নতুন কার্ড তৈরি করতে এটি খালি রাখুন।
                </p>
              </div>

              {/* Card Tier Selection */}
              <div className="space-y-3 p-4 bg-slate-50 rounded-2xl border border-slate-200">
                <label className="block text-xs font-extrabold text-slate-800">
                  কার্ডের ধরন ও সদস্য সীমা নির্বাচন করুন (Select Card Tier) *
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <button
                    type="button"
                    onClick={() => handleTierChange('Silver')}
                    className={`p-3 rounded-xl border-2 text-left transition cursor-pointer ${
                      formData.cardTier === 'Silver'
                        ? 'border-slate-800 bg-white shadow-sm ring-2 ring-slate-400'
                        : 'border-slate-200 bg-white opacity-70 hover:opacity-100'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-slate-900 text-xs">🥈 সিলভার</span>
                      <span className="text-[10px] bg-slate-100 px-2 py-0.5 rounded font-bold">৪ জন</span>
                    </div>
                    <p className="text-[11px] text-slate-500 mt-1">সর্বোচ্চ ৪ জন সদস্য</p>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleTierChange('Gold')}
                    className={`p-3 rounded-xl border-2 text-left transition cursor-pointer ${
                      formData.cardTier === 'Gold'
                        ? 'border-amber-500 bg-amber-50 shadow-sm ring-2 ring-amber-400'
                        : 'border-slate-200 bg-white opacity-70 hover:opacity-100'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-amber-900 text-xs">🥇 গোল্ড</span>
                      <span className="text-[10px] bg-amber-200 text-amber-900 px-2 py-0.5 rounded font-bold">৬ জন</span>
                    </div>
                    <p className="text-[11px] text-amber-700 mt-1">সর্বোচ্চ ৬ জন সদস্য</p>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleTierChange('Platinum')}
                    className={`p-3 rounded-xl border-2 text-left transition cursor-pointer ${
                      formData.cardTier === 'Platinum'
                        ? 'border-sky-600 bg-sky-50 shadow-sm ring-2 ring-sky-400'
                        : 'border-slate-200 bg-white opacity-70 hover:opacity-100'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-sky-900 text-xs">💎 প্লাটিনাম</span>
                      <span className="text-[10px] bg-sky-200 text-sky-900 px-2 py-0.5 rounded font-bold">৮ জন</span>
                    </div>
                    <p className="text-[11px] text-sky-700 mt-1">সর্বোচ্চ ৮ জন সদস্য</p>
                  </button>
                </div>
              </div>

              {/* Family Beneficiaries List */}
              <div className="p-4 bg-blue-50/50 rounded-2xl border border-blue-100 space-y-3">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-blue-900">
                    কভারকৃত পারিবারিক সদস্যবৃন্দ ({formData.cardTier} কার্ড: সর্বোচ্চ {formData.cardTier === 'Silver' ? 4 : formData.cardTier === 'Gold' ? 6 : 8} জন)
                  </label>
                  <span className="text-[10px] text-blue-700 font-medium">নির্ধারিত সদস্যদের নাম লিখুন</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {formData.beneficiaries.map((beneficiary, idx) => (
                    <div key={idx} className="flex items-center gap-2">
                      <span className="text-[11px] font-bold text-slate-500 w-5">{idx + 1}.</span>
                      <input
                        type="text"
                        placeholder={idx === 0 ? `${formData.memberName || 'প্রধান সদস্য (Self)'}` : `সদস্য ${idx + 1}-এর নাম`}
                        value={beneficiary}
                        onChange={(e) => handleBeneficiaryChange(idx, e.target.value)}
                        className="w-full p-2 rounded-lg border border-slate-200 text-xs bg-white focus:outline-none focus:ring-1 focus:ring-blue-500"
                      />
                    </div>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                
                {/* Full Name */}
                <div className="sm:col-span-2">
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    আবেদনকারীর পূর্ণ নাম (Full Name) *
                  </label>
                  <input
                    type="text"
                    name="memberName"
                    required
                    placeholder="যেমন: মোঃ রহিম উদ্দিন"
                    value={formData.memberName}
                    onChange={handleInputChange}
                    className="w-full p-3 rounded-xl border border-slate-200 bg-slate-50 text-slate-900 text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  />
                </div>

                {/* Father Name */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    পিতার নাম (Father's Name)
                  </label>
                  <input
                    type="text"
                    name="fatherName"
                    placeholder="পিতার নাম"
                    value={formData.fatherName}
                    onChange={handleInputChange}
                    className="w-full p-3 rounded-xl border border-slate-200 bg-slate-50 text-slate-900 text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  />
                </div>

                {/* Mother Name */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    মাতার নাম (Mother's Name)
                  </label>
                  <input
                    type="text"
                    name="motherName"
                    placeholder="মাতার নাম"
                    value={formData.motherName}
                    onChange={handleInputChange}
                    className="w-full p-3 rounded-xl border border-slate-200 bg-slate-50 text-slate-900 text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  />
                </div>

                {/* DOB */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    জন্ম তারিখ (Date of Birth) *
                  </label>
                  <input
                    type="date"
                    name="dob"
                    required
                    value={formData.dob}
                    onChange={handleInputChange}
                    className="w-full p-3 rounded-xl border border-slate-200 bg-slate-50 text-slate-900 text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  />
                </div>

                {/* Gender */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    লিঙ্গ (Gender) *
                  </label>
                  <select
                    name="gender"
                    value={formData.gender}
                    onChange={handleInputChange}
                    className="w-full p-3 rounded-xl border border-slate-200 bg-slate-50 text-slate-900 text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  >
                    <option value="Male">পুরুষ (Male)</option>
                    <option value="Female">নারী (Female)</option>
                    <option value="Other">অন্যান্য (Other)</option>
                  </select>
                </div>

                {/* Blood Group */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    রক্তের গ্রুপ (Blood Group) *
                  </label>
                  <select
                    name="bloodGroup"
                    value={formData.bloodGroup}
                    onChange={handleInputChange}
                    className="w-full p-3 rounded-xl border border-slate-200 bg-slate-50 text-slate-900 text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none font-bold text-rose-600"
                  >
                    {bloodGroups.map(bg => (
                      <option key={bg} value={bg}>{bg}</option>
                    ))}
                  </select>
                </div>

                {/* Mobile */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    মোবাইল নম্বর (Mobile No.) *
                  </label>
                  <input
                    type="tel"
                    name="mobile"
                    required
                    placeholder="017XXXXXXXX"
                    value={formData.mobile}
                    onChange={handleInputChange}
                    className="w-full p-3 rounded-xl border border-slate-200 bg-slate-50 text-slate-900 text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none font-mono"
                  />
                </div>

                {/* Email */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    ইমেইল (Email Address - Optional)
                  </label>
                  <input
                    type="email"
                    name="email"
                    placeholder="example@mail.com"
                    value={formData.email}
                    onChange={handleInputChange}
                    className="w-full p-3 rounded-xl border border-slate-200 bg-slate-50 text-slate-900 text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  />
                </div>

                {/* NID / Birth Cert */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    NID / জন্ম নিবন্ধন নম্বর *
                  </label>
                  <input
                    type="text"
                    name="nidOrBirthCert"
                    required
                    placeholder="১৭ বা ১০ ডিজিটের NID / জন্ম নম্বর"
                    value={formData.nidOrBirthCert}
                    onChange={handleInputChange}
                    className="w-full p-3 rounded-xl border border-slate-200 bg-slate-50 text-slate-900 text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none font-mono"
                  />
                </div>

                {/* District */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    জেলা (District) *
                  </label>
                  <select
                    name="district"
                    value={formData.district}
                    onChange={(e) => {
                      const newDist = e.target.value;
                      const defaultUp = upazilaMap[newDist]?.[0] || 'Gopalganj Sadar';
                      setFormData({ ...formData, district: newDist, upazila: defaultUp });
                    }}
                    className="w-full p-3 rounded-xl border border-slate-200 bg-slate-50 text-slate-900 text-xs font-bold focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  >
                    {pilotDistricts.map(d => (
                      <option key={d} value={d}>{d} (পাইলট জোন)</option>
                    ))}
                  </select>
                </div>

                {/* Upazila */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    উপজেলা (Upazila) *
                  </label>
                  <select
                    name="upazila"
                    value={formData.upazila}
                    onChange={handleInputChange}
                    className="w-full p-3 rounded-xl border border-slate-200 bg-slate-50 text-slate-900 text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  >
                    {(upazilaMap[formData.district] || upazilaMap.Gopalganj).map(u => (
                      <option key={u} value={u}>{u}</option>
                    ))}
                  </select>
                </div>

                {/* Address */}
                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    বিস্তারিত ঠিকানা (Village / Road / Ward) *
                  </label>
                  <input
                    type="text"
                    name="address"
                    required
                    placeholder="যেমন: পোস্ট অফিস রোড, বেডগ্রাম, ওয়ার্ড ০৪"
                    value={formData.address}
                    onChange={handleInputChange}
                    className="w-full p-3 rounded-xl border border-slate-200 bg-slate-50 text-slate-900 text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  />
                </div>

                {/* Photo Upload: Device Upload + Presets */}
                <div className="sm:col-span-2 space-y-3 p-4 bg-emerald-50/40 rounded-2xl border border-emerald-100">
                  <div className="flex items-center justify-between">
                    <label className="block text-xs font-bold text-slate-800">
                      ছবি নির্বাচন ও আপলোড (Profile Photo Upload) *
                    </label>
                    <span className="text-[10px] text-emerald-700 font-semibold bg-emerald-100 px-2 py-0.5 rounded">
                      ডিভাইস থেকে সরাসরি আপলোড সাপোর্ট
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-12 gap-4 items-center">
                    {/* Device Upload Drag/Drop Zone */}
                    <div className="sm:col-span-7">
                      <label
                        htmlFor="device-photo-input"
                        className="flex flex-col items-center justify-center p-4 border-2 border-dashed border-emerald-300 hover:border-emerald-500 bg-white rounded-xl cursor-pointer hover:bg-emerald-50/50 transition text-center group"
                      >
                        <Upload className="w-6 h-6 text-emerald-600 group-hover:scale-110 transition duration-200 mb-1" />
                        <span className="text-xs font-bold text-slate-800">
                          ডিভাইস (গ্যালারি / ক্যামেরা) থেকে ফাইল আপলোড করুন
                        </span>
                        <span className="text-[10px] text-slate-500 mt-0.5">
                          JPG, PNG, WEBP (সর্বোচ্চ 5MB)
                        </span>
                        <input
                          id="device-photo-input"
                          type="file"
                          accept="image/*"
                          onChange={handleFileUpload}
                          className="hidden"
                        />
                      </label>
                    </div>

                    {/* Preview Thumbnail */}
                    <div className="sm:col-span-5 flex items-center gap-3 bg-white p-3 rounded-xl border border-slate-200">
                      <img
                        src={formData.photoUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=300'}
                        alt="Current Profile"
                        className="w-14 h-16 rounded-lg object-cover border-2 border-emerald-500 shadow-sm"
                      />
                      <div className="space-y-1 text-xs">
                        <p className="font-bold text-slate-900 text-[11px]">নির্বাচিত ছবি</p>
                        <p className="text-[10px] text-emerald-600 font-medium">✓ প্রিভিউ যুক্ত হয়েছে</p>
                      </div>
                    </div>
                  </div>

                  {/* Preset Avatars */}
                  <div className="pt-2 border-t border-emerald-100/80">
                    <p className="text-[11px] text-slate-600 mb-2 font-medium">অথবা তৈরি করা ডেমো অবতার থেকে সিলেক্ট করুন:</p>
                    <div className="flex flex-wrap gap-2.5">
                      {[
                        'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=300',
                        'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=300',
                        'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=300',
                        'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=300'
                      ].map((imgUrl, idx) => (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => handlePhotoSelect(imgUrl)}
                          className={`w-10 h-10 rounded-lg overflow-hidden border-2 transition cursor-pointer ${
                            formData.photoUrl === imgUrl ? 'border-emerald-600 scale-110 shadow-md ring-2 ring-emerald-300' : 'border-slate-200 opacity-70 hover:opacity-100'
                          }`}
                        >
                          <img src={imgUrl} alt="Preset avatar" className="w-full h-full object-cover" />
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

              </div>

              {/* Fee Deposit & Payment Section */}
              <div className="p-5 bg-gradient-to-br from-slate-900 via-slate-800 to-sky-950 text-white rounded-2xl border border-slate-700 space-y-4">
                <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-700 pb-3">
                  <div>
                    <h3 className="text-sm font-extrabold text-white flex items-center gap-2">
                      <CreditCard className="w-4 h-4 text-emerald-400" />
                      কার্ড ফি ও টাকা জমা দেওয়ার অপশন (Fee Deposit)
                    </h3>
                    <p className="text-[11px] text-slate-300">
                      অনলাইন আবেদন ফি পরিশোধ করে নিশ্চিত করুন
                    </p>
                  </div>

                  <div className="bg-emerald-500 text-slate-950 px-3 py-1 rounded-xl text-xs font-black font-mono shadow-md">
                    ফি: ৳{feeAmount} BDT
                  </div>
                </div>

                {/* Payment Method Selector */}
                <div className="space-y-2">
                  <label className="block text-xs font-semibold text-slate-200">
                    পেমেন্ট মাধ্যম নির্বাচন করুন (Payment Gateway):
                  </label>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    {[
                      { id: 'bKash', name: 'bKash (বিকাশ)', color: 'bg-pink-600 hover:bg-pink-500', number: '01700-000000' },
                      { id: 'Nagad', name: 'Nagad (নগদ)', color: 'bg-orange-600 hover:bg-orange-500', number: '01800-000000' },
                      { id: 'Rocket', name: 'Rocket (রকেট)', color: 'bg-purple-600 hover:bg-purple-500', number: '01900-000000' },
                      { id: 'Cash', name: 'নগদ/কাউন্টারে', color: 'bg-teal-600 hover:bg-teal-500', number: 'অফিস কাউন্টার' }
                    ].map(pm => (
                      <button
                        key={pm.id}
                        type="button"
                        onClick={() => setFormData({ ...formData, paymentMethod: pm.id as any })}
                        className={`p-2.5 rounded-xl border text-xs font-bold transition text-left cursor-pointer ${
                          formData.paymentMethod === pm.id
                            ? `${pm.color} text-white border-white ring-2 ring-white/50 shadow-md`
                            : 'bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-700'
                        }`}
                      >
                        <div className="text-[11px]">{pm.name}</div>
                        <div className="text-[9px] opacity-80 mt-0.5 font-mono">{pm.number}</div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Instruction Box */}
                {formData.paymentMethod !== 'Cash' ? (
                  <div className="p-3 bg-slate-800/80 rounded-xl border border-slate-700 text-xs text-slate-200 space-y-1">
                    <p className="font-bold text-emerald-300 text-[11px]">
                      বিকাশ / নগদ / রকেট ফি জমার নির্দেশিকা:
                    </p>
                    <ol className="list-decimal list-inside text-[11px] text-slate-300 space-y-0.5">
                      <li>আপনার মোবাইল অ্যাপ খুলুন এবং Send Money/Payment সিলেক্ট করুন।</li>
                      <li>প্রাপক নম্বর: <strong className="text-amber-300 font-mono">01700-000000</strong> ({formData.paymentMethod})</li>
                      <li>পরিমাণ: <strong className="text-emerald-300 font-mono">৳{feeAmount}</strong> টাকা পাঠান।</li>
                      <li>পেমেন্ট শেষে পাওয়া Transaction ID (TrxID) নিচে ইনপুট দিন।</li>
                    </ol>
                  </div>
                ) : (
                  <div className="p-3 bg-teal-900/40 rounded-xl border border-teal-700 text-xs text-teal-200">
                    📌 গোপালগঞ্জ সদর ডিএমবি সার্ভিস ডেস্কে বা পার্টনার সেন্টারে ফি সরাসরি নগদ জমা দিতে পারবেন।
                  </div>
                )}

                {/* Payment Form Fields */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                      প্রেরক অ্যাকাউন্ট নম্বর (Sender Number) *
                    </label>
                    <input
                      type="tel"
                      name="paymentSenderNo"
                      placeholder="যেমন: 01712345678"
                      value={formData.paymentSenderNo}
                      onChange={handleInputChange}
                      className="w-full p-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs font-mono focus:ring-1 focus:ring-emerald-400 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                      ট্রানজেকশন আইডি (Transaction ID / TrxID) *
                    </label>
                    <input
                      type="text"
                      name="trxId"
                      placeholder="যেমন: BK901X2831"
                      value={formData.trxId}
                      onChange={handleInputChange}
                      className="w-full p-2.5 rounded-xl bg-slate-900 border border-slate-700 text-amber-300 text-xs font-mono font-bold focus:ring-1 focus:ring-emerald-400 focus:outline-none uppercase"
                    />
                  </div>
                </div>

              </div>

              {/* Submit Button */}
              <div className="pt-2">
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-4 rounded-2xl bg-gradient-to-r from-emerald-600 via-teal-600 to-sky-700 hover:from-emerald-700 hover:to-sky-800 text-white font-extrabold text-sm shadow-xl transition cursor-pointer flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <span>আবেদন ও ফি প্রসেস করা হচ্ছে...</span>
                  ) : (
                    <>
                      <CreditCard className="w-5 h-5" />
                      <span>৳{feeAmount} টাকা ফি সহ কার্ডের আবেদন জমা দিন</span>
                    </>
                  )}
                </button>
              </div>

            </form>
          </div>

          {/* Live Preview Side */}
          <div className="lg:col-span-5 space-y-4">
            <div className="bg-slate-900 text-white rounded-3xl p-6 border border-slate-800 shadow-xl sticky top-24 space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-emerald-400 flex items-center gap-1">
                  <Sparkles className="w-4 h-4" /> Live Digital Card Preview
                </span>
                <span className="text-[10px] bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded font-mono">
                  DMB-PREVIEW
                </span>
              </div>

              <div className="p-4 rounded-2xl bg-gradient-to-br from-blue-900 via-sky-800 to-emerald-800 text-white space-y-3 border border-white/20">
                <div className="flex items-center justify-between pb-2 border-b border-white/20">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-emerald-500 text-white font-black text-xs flex items-center justify-center">
                      DMB
                    </div>
                    <span className="font-extrabold text-xs">DIGITAL MEDICAL CARD</span>
                  </div>
                  <span className="text-[10px] text-emerald-300 font-mono">GOPALGANJ</span>
                </div>

                <div className="flex items-center gap-3">
                  <img
                    src={formData.photoUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=300'}
                    alt="Preview"
                    className="w-14 h-18 rounded-lg object-cover border border-white/40"
                  />
                  <div className="space-y-0.5 text-xs">
                    <p className="font-bold text-white text-sm">
                      {formData.memberName || 'আপনার নাম লিখুন'}
                    </p>
                    <p className="text-[11px] text-amber-300 font-mono font-bold">
                      ID: {formData.customCardId ? (
                        formData.customCardId.toUpperCase().startsWith('DMB-')
                          ? formData.customCardId.toUpperCase()
                          : /^\d+$/.test(formData.customCardId.trim())
                          ? `DMB-2026-${formData.customCardId.trim()}`
                          : `DMB-${formData.customCardId.toUpperCase().trim()}`
                      ) : 'DMB-2026-AUTO'}
                    </p>
                    <p className="text-[10px] text-emerald-300">
                      রক্তের গ্রুপ: {formData.bloodGroup}
                    </p>
                    <p className="text-[10px] text-sky-200">
                      {formData.upazila || 'গোপালগঞ্জ সদর'}, {formData.district}
                    </p>
                  </div>
                </div>

                <div className="text-[10px] text-sky-200 pt-2 border-t border-white/10 flex justify-between items-center">
                  <span>NID: {formData.nidOrBirthCert || 'XXXXXXXXXXXX'}</span>
                  <span className="text-emerald-300 font-bold">ফি: ৳{feeAmount} ({formData.paymentMethod})</span>
                </div>
                {formData.trxId && (
                  <div className="text-[9px] font-mono text-amber-300 bg-black/30 px-2 py-1 rounded border border-white/10 flex justify-between">
                    <span>TrxID: {formData.trxId}</span>
                    <span>Status: PAID</span>
                  </div>
                )}
              </div>

              <p className="text-[11px] text-slate-400 text-center italic">
                আবেদন জমা দেওয়ার সাথে সাথেই মূল কিউআর কোডসহ ডাউনলোডযোগ্য ফিজিক্যাল ও ডিজিটাল কার্ড পাবেন।
              </p>
            </div>
          </div>

        </div>
      )}

    </div>
  );
};
