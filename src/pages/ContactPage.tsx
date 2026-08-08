import React, { useState } from 'react';
import { MapPin, Phone, Mail, Clock, Send, CheckCircle2, ShieldCheck } from 'lucide-react';

export const ContactPage: React.FC = () => {
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    subject: '',
    message: ''
  });

  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      setSubmitted(true);
      setFormData({ name: '', phone: '', email: '', subject: '', message: '' });
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 py-12 px-4 sm:px-6 lg:px-8 space-y-12">
      
      {/* Header */}
      <div className="max-w-4xl mx-auto text-center space-y-2">
        <span className="text-xs font-bold text-blue-600 bg-blue-50 px-3 py-1 rounded-full uppercase tracking-wider">
          Gopalganj, Narail & Sylhet Project Helpdesk
        </span>
        <h1 className="text-3xl font-extrabold text-slate-900">
          যোগাযোগ করুন (Contact Us)
        </h1>
        <p className="text-xs sm:text-sm text-slate-600">
          DMB গোপালগঞ্জ, নড়াইল ও সিলেট প্রজেক্ট হেল্পডেস্ক অথবা ২৪/৭ হটলাইনে সরাসরি যোগাযোগ করতে পারেন।
        </p>
      </div>

      <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Info Column */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-slate-900 text-white rounded-3xl p-8 space-y-6 shadow-xl border border-slate-800">
            <h2 className="text-2xl font-bold">DMB পাইলট প্রজেক্ট অফিস</h2>

            <div className="space-y-4 text-xs">
              <div className="flex items-start gap-3">
                <MapPin className="w-5 h-5 text-emerald-400 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-bold text-white text-sm">ঠিকানা:</p>
                  <p className="text-slate-300">
                    গোপালগঞ্জ প্রধান কার্যালয়: পোস্ট অফিস রোড, বেডগ্রাম, গোপালগঞ্জ সদর।<br />
                    নড়াইল আঞ্চলিক কেন্দ্র: হাসপাতাল রোড, নড়াইল Sadar।<br />
                    সিলেট আঞ্চলিক সাপোর্ট ডেস্ক: জিন্দাবাজার, সিলেট।
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Phone className="w-5 h-5 text-emerald-400 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-bold text-white text-sm">হটলাইন (২৪/৭):</p>
                  <p className="text-emerald-300 font-mono text-lg font-extrabold">+8809658887470</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Mail className="w-5 h-5 text-emerald-400 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-bold text-white text-sm">ইমেইল:</p>
                  <p className="text-sky-300 font-mono text-sm font-bold">health@nit.bd</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Clock className="w-5 h-5 text-emerald-400 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-bold text-white text-sm">অফিস সময়সূচী:</p>
                  <p className="text-slate-300">শনিবার - বৃহস্পতিবার: সকাল ৯:০০ - রাত ৮:০০</p>
                </div>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-slate-800/80 border border-slate-700 text-xs space-y-1">
              <span className="text-emerald-400 font-bold flex items-center gap-1">
                <ShieldCheck className="w-4 h-4" /> জাতীয় হেলথ নেটওয়ার্ক
              </span>
              <p className="text-slate-400">গোপালগঞ্জ ছাড়া ঢাকার পার্টনার অফিস ধানমণ্ডি ও গ্রিন রোডে অবস্থিত।</p>
            </div>
          </div>
        </div>

        {/* Contact Form Column */}
        <div className="lg:col-span-7 bg-white rounded-3xl p-8 border border-slate-200 shadow-sm space-y-6">
          <h2 className="text-2xl font-bold text-slate-900">সরাসরি বার্তা পাঠান</h2>

          {submitted ? (
            <div className="p-6 rounded-2xl bg-emerald-50 border border-emerald-200 text-center space-y-2 text-xs text-emerald-900">
              <CheckCircle2 className="w-10 h-10 text-emerald-600 mx-auto" />
              <h3 className="font-bold text-base">আপনার বার্তাটি সফলভাবে পাঠানো হয়েছে!</h3>
              <p>আমাদের প্রতিনিধি খুব শীঘ্রই আপনার সাথে ফোনে যোগাযোগ করবে।</p>
              <button
                onClick={() => setSubmitted(false)}
                className="mt-2 px-4 py-2 rounded-xl bg-emerald-600 text-white font-bold"
              >
                আরেকটি বার্তা লিখুন
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">আপনার নাম *</label>
                  <input
                    type="text"
                    required
                    placeholder="আপনার পূর্ণ নাম"
                    value={formData.name}
                    onChange={e => setFormData({ ...formData, name: e.target.value })}
                    className="w-full p-3 rounded-xl border border-slate-200 bg-slate-50 text-slate-900 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">মোবাইল নম্বর *</label>
                  <input
                    type="tel"
                    required
                    placeholder="017XXXXXXXX"
                    value={formData.phone}
                    onChange={e => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full p-3 rounded-xl border border-slate-200 bg-slate-50 text-slate-900 font-mono focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block font-semibold text-slate-700 mb-1">বিষয় (Subject)</label>
                  <input
                    type="text"
                    placeholder="যেমন: কার্ড বিতরণ কেন্দ্র বা ডিসকাউন্ট সংক্রান্ত প্রশ্ন"
                    value={formData.subject}
                    onChange={e => setFormData({ ...formData, subject: e.target.value })}
                    className="w-full p-3 rounded-xl border border-slate-200 bg-slate-50 text-slate-900 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block font-semibold text-slate-700 mb-1">আপনার বার্তা/প্রশ্ন *</label>
                  <textarea
                    rows={4}
                    required
                    placeholder="আপনার বার্তা বিস্তারিত লিখুন..."
                    value={formData.message}
                    onChange={e => setFormData({ ...formData, message: e.target.value })}
                    className="w-full p-3 rounded-xl border border-slate-200 bg-slate-50 text-slate-900 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow transition cursor-pointer flex items-center justify-center gap-1.5"
              >
                <Send className="w-4 h-4" /> বার্তা পাঠান
              </button>
            </form>
          )}
        </div>

      </div>

    </div>
  );
};
