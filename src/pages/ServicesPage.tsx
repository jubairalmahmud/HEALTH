import React from 'react';
import { CreditCard, Percent, Package, Heart, Home, PhoneCall, ShieldCheck, ArrowRight } from 'lucide-react';

interface Props {
  setActiveTab: (tab: string) => void;
}

export const ServicesPage: React.FC<Props> = ({ setActiveTab }) => {
  const services = [
    {
      icon: <CreditCard className="w-8 h-8 text-blue-600" />,
      title: 'Digital Medical Card Service',
      description: 'প্রত্যেক সদস্যকে একটি অনন্য QR-Code সম্বলিত ডিজিটাল মেডিক্যাল আইডি দেওয়া হয়, যা আমাদের নিবন্ধিত সব সেন্টারে প্রযোজ্য।',
      status: 'Active (গোপালগঞ্জ প্রজেক্ট)',
      action: 'apply',
      btnLabel: 'কার্ডের আবেদন'
    },
    {
      icon: <Percent className="w-8 h-8 text-emerald-600" />,
      title: 'Diagnostic Discount Service',
      description: 'পপুলার, সেবা সহ গোপালগঞ্জ ও ঢাকার তালিকাভুক্ত সেন্টারে প্যাথলজি ও রেডিওলজি টেস্টে নির্ধারিত ৩০% ডিসকাউন্ট।',
      status: 'Active',
      action: 'diagnostic',
      btnLabel: 'পার্টনার সেন্টারসমূহ'
    },
    {
      icon: <Package className="w-8 h-8 text-amber-600" />,
      title: 'Health Checkup Package',
      description: 'বেসিক চেকআপ, ডায়াবেটিস কেয়ার, নারী স্বাস্থ্য ও বয়স্কদের জন্য সাশ্রয়ী প্যাকেজ।',
      status: 'Active',
      action: 'packages',
      btnLabel: 'হেলথ প্যাকেজ দেখুন'
    },
    {
      icon: <Heart className="w-8 h-8 text-rose-600" />,
      title: 'Health Awareness Program',
      description: 'গোপালগঞ্জের গ্রাম ও উপশহরে বিনামূল্যে ব্লাড সুগার, প্রেশার চেকআপ এবং স্বাস্থ্য সচেতনতা শিবির পরিচালনা।',
      status: 'Active Campaign',
      action: 'blog',
      btnLabel: 'স্বাস্থ্য পরামর্শ'
    },
    {
      icon: <Home className="w-8 h-8 text-purple-600" />,
      title: 'Home Sample Collection (Future)',
      description: 'বাড়িতে বসেই রক্ত ও প্রস্রাবের নমুনা সংগ্রহের আধুনিক ডিজিটাল হোম ল্যাব সার্ভিস।',
      status: 'Upcoming (আসন্ন সেবাসমূহ)',
      action: 'contact',
      btnLabel: 'বিস্তারিত জানুন'
    },
    {
      icon: <PhoneCall className="w-8 h-8 text-teal-600" />,
      title: 'Telemedicine Service (Future)',
      description: 'অভিজ্ঞ স্পেশালিস্ট ডাক্তারদের সাথে ভিডিও কলে ঘরে বসে প্রেসক্রিপশন ও চিকিৎসা সুবিধা।',
      status: 'Upcoming (আসন্ন সেবাসমূহ)',
      action: 'contact',
      btnLabel: 'পরবর্তী আপডেট'
    }
  ];

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 py-12 px-4 sm:px-6 lg:px-8 space-y-12">
      
      <div className="max-w-4xl mx-auto text-center space-y-3">
        <span className="text-xs font-bold text-blue-600 bg-blue-50 px-3 py-1 rounded-full uppercase tracking-wider">
          Our Healthcare Services
        </span>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900">
          DMB স্বাস্থ্যসেবাসমূহ
        </h1>
        <p className="text-sm text-slate-600 leading-relaxed max-w-2xl mx-auto">
          কম খরচে মানসম্মত স্বাস্থ্য পরীক্ষা থেকে শুরু করে ডিজিটাল ভেরিফিকেশন ও হেলথ প্যাকেজ— আমাদের সেবাসমূহ এক নজরে দেখুন।
        </p>
      </div>

      <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {services.map((s, idx) => (
          <div
            key={idx}
            className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm hover:shadow-md transition flex flex-col justify-between space-y-4"
          >
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="p-3 rounded-2xl bg-slate-50 border border-slate-100">
                  {s.icon}
                </div>
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                  s.status.includes('Active') ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                }`}>
                  {s.status}
                </span>
              </div>

              <h3 className="text-lg font-bold text-slate-900">{s.title}</h3>
              <p className="text-xs text-slate-600 leading-relaxed">{s.description}</p>
            </div>

            <div className="pt-4 border-t border-slate-100">
              <button
                onClick={() => setActiveTab(s.action)}
                className="w-full py-2.5 rounded-xl bg-slate-100 hover:bg-blue-600 hover:text-white text-slate-800 font-bold text-xs transition cursor-pointer flex items-center justify-center gap-1"
              >
                {s.btnLabel} <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        ))}
      </div>

    </div>
  );
};
