import React, { useState } from 'react';
import { Building2, CheckCircle2, ShieldCheck, Send, AlertCircle } from 'lucide-react';
import { DiagnosticCenter } from '../types';

interface Props {
  centers: DiagnosticCenter[];
}

export const PartnerPage: React.FC<Props> = ({ centers }) => {
  const [formData, setFormData] = useState({
    organizationName: '',
    type: 'Diagnostic Center',
    district: 'Gopalganj',
    upazila: 'Gopalganj Sadar',
    address: '',
    contactPerson: '',
    designation: '',
    mobile: '',
    email: '',
    proposedDiscount: 30,
    servicesOffered: ''
  });

  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.organizationName || !formData.mobile) {
      setErrorMsg('অনুগ্রহ করে সেন্টারের নাম ও মোবাইল নম্বর লিখুন।');
      return;
    }

    setLoading(true);
    setErrorMsg(null);

    try {
      const res = await fetch('/api/partners/apply', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      if (!res.ok) throw new Error('আবেদন জমা দেওয়া যায়নি।');

      setSubmitted(true);
    } catch (err: any) {
      setErrorMsg(err.message || 'ত্রুটি ঘটেছে।');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 py-12 px-4 sm:px-6 lg:px-8 space-y-12">
      
      {/* Header */}
      <div className="max-w-4xl mx-auto text-center space-y-2">
        <span className="text-xs font-bold text-blue-600 bg-blue-50 px-3 py-1 rounded-full uppercase tracking-wider">
          Healthcare Partnership Program
        </span>
        <h1 className="text-3xl font-extrabold text-slate-900">
          DMB পার্টনার হোন (Become a Partner)
        </h1>
        <p className="text-xs sm:text-sm text-slate-600">
          আপনার ডায়াগনস্টিক সেন্টার, হাসপাতাল বা ফার্মেসিকে DMB হেলথ নেটওয়ার্কের সাথে যুক্ত করে নতুন রোগী ও পরিচিতি নিশ্চিত করুন।
        </p>
      </div>

      {/* Partner Benefits Grid */}
      <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-2xl border border-slate-200 space-y-2 text-xs">
          <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center font-bold">
            <Building2 className="w-5 h-5" />
          </div>
          <h3 className="font-bold text-slate-900 text-sm">রোগীর প্রবাহ বৃদ্ধি</h3>
          <p className="text-slate-600 leading-relaxed">
            DMB কার্ডধারীদের সরাসরি আপনার সেন্টারে প্রেরণের মাধ্যমে দৈনিক পরীক্ষার সংখ্যা বৃদ্ধি পাবে।
          </p>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-slate-200 space-y-2 text-xs">
          <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <h3 className="font-bold text-slate-900 text-sm">ডিজিটাল ব্র্যান্ডিং</h3>
          <p className="text-slate-600 leading-relaxed">
            DMB ওয়েবসাইট ও অ্যাপে আপনার ল্যাব ও ডায়াগনস্টিক সেন্টারের প্রচার ও ভেরিফাইড ব্যাজ।
          </p>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-slate-200 space-y-2 text-xs">
          <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center font-bold">
            <CheckCircle2 className="w-5 h-5" />
          </div>
          <h3 className="font-bold text-slate-900 text-sm">সহজ ট্র্যাকিং সফটওয়্যার</h3>
          <p className="text-slate-600 leading-relaxed">
            পার্টনার ড্যাশবোর্ডের মাধ্যমে প্রতিদিন কতজন ছাড় পেলেন এবং বিল বিবরণী সহজেই দেখা যাবে।
          </p>
        </div>
      </div>

      {/* Form Container */}
      <div className="max-w-3xl mx-auto bg-white rounded-3xl p-8 border border-slate-200 shadow-md space-y-6">
        <h2 className="text-2xl font-bold text-slate-900 text-center">পার্টনারশিপ আবেদন ফর্ম</h2>

        {submitted ? (
          <div className="p-6 rounded-2xl bg-emerald-50 border border-emerald-200 text-center space-y-3 text-xs text-emerald-900">
            <CheckCircle2 className="w-12 h-12 text-emerald-600 mx-auto" />
            <h3 className="font-bold text-base">আপনার পার্টনারশিপ আবেদন সফলভাবে গৃহীত হয়েছে!</h3>
            <p>DMB গোপালগঞ্জ অপারেশনস টিম খুব শীঘ্রই আপনার প্রদত্ত মোবাইল নম্বরে যোগাযোগ করে পার্টনারশিপ সম্পন্ন করবে।</p>
            <button
              onClick={() => setSubmitted(false)}
              className="mt-2 px-4 py-2 rounded-xl bg-emerald-600 text-white font-bold"
            >
              আরেকটি ফর্ম পূরণ করুন
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4 text-xs">
            {errorMsg && (
              <div className="p-3 rounded-xl bg-rose-50 text-rose-700 font-medium flex items-center gap-2">
                <AlertCircle className="w-4 h-4" /> {errorMsg}
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="sm:col-span-2">
                <label className="block font-bold text-slate-700 mb-1">প্রতিষ্ঠানের নাম (Organization Name) *</label>
                <input
                  type="text"
                  required
                  placeholder="যেমন: গোপালগঞ্জ মডেল ডিজিটাল ল্যাব"
                  value={formData.organizationName}
                  onChange={e => setFormData({ ...formData, organizationName: e.target.value })}
                  className="w-full p-3 rounded-xl border border-slate-200 bg-slate-50 text-slate-900 text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">প্রতিষ্ঠানের ধরন *</label>
                <select
                  value={formData.type}
                  onChange={e => setFormData({ ...formData, type: e.target.value })}
                  className="w-full p-3 rounded-xl border border-slate-200 bg-slate-50 text-slate-900 text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none"
                >
                  <option value="Diagnostic Center">ডায়াগনস্টিক সেন্টার (Diagnostic)</option>
                  <option value="Hospital">হাসপাতাল / ক্লিনিক (Hospital)</option>
                  <option value="Pharmacy">ফার্মেসি (Pharmacy)</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">প্রস্তাবিত ডিসকাউন্ট হার (%) *</label>
                <input
                  type="number"
                  min="10"
                  max="60"
                  value={formData.proposedDiscount}
                  onChange={e => setFormData({ ...formData, proposedDiscount: Number(e.target.value) })}
                  className="w-full p-3 rounded-xl border border-slate-200 bg-slate-50 text-slate-900 text-xs font-bold text-emerald-700 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">যোগাযোগকারীর নাম *</label>
                <input
                  type="text"
                  required
                  placeholder="যেমন: ডা. মো: জহিরুল ইসলাম"
                  value={formData.contactPerson}
                  onChange={e => setFormData({ ...formData, contactPerson: e.target.value })}
                  className="w-full p-3 rounded-xl border border-slate-200 bg-slate-50 text-slate-900 text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">মোবাইল নম্বর *</label>
                <input
                  type="tel"
                  required
                  placeholder="017XXXXXXXX"
                  value={formData.mobile}
                  onChange={e => setFormData({ ...formData, mobile: e.target.value })}
                  className="w-full p-3 rounded-xl border border-slate-200 bg-slate-50 text-slate-900 text-xs font-mono focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block font-semibold text-slate-700 mb-1">প্রতিষ্ঠানের পূর্ণ ঠিকানা *</label>
                <input
                  type="text"
                  required
                  placeholder="যেমন: কোর্ট মসজিদ সংলগ্ন, পোস্ট অফিস রোড, গোপালগঞ্জ সদর"
                  value={formData.address}
                  onChange={e => setFormData({ ...formData, address: e.target.value })}
                  className="w-full p-3 rounded-xl border border-slate-200 bg-slate-50 text-slate-900 text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block font-semibold text-slate-700 mb-1">উপলব্ধ টেস্ট ও সুবিধাসমূহ</label>
                <textarea
                  rows={2}
                  placeholder="যেমন: ৪ডি আল্ট্রাসনোগ্রাফি, ডিজিটাল এক্স-রে, বায়োকেমিস্ট্রি, ইসিজি"
                  value={formData.servicesOffered}
                  onChange={e => setFormData({ ...formData, servicesOffered: e.target.value })}
                  className="w-full p-3 rounded-xl border border-slate-200 bg-slate-50 text-slate-900 text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow transition cursor-pointer flex items-center justify-center gap-1.5"
            >
              <Send className="w-4 h-4" /> পার্টনারশিপ ফর্ম জমা দিন
            </button>
          </form>
        )}
      </div>

    </div>
  );
};
