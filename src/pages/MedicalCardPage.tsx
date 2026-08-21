import React, { useEffect, useState } from 'react';
import { fetchJsonSafe } from '../utils/api';
import { CreditCard, ShieldCheck, CheckCircle2, FileText, QrCode, Percent, ArrowRight } from 'lucide-react';
import { DynamicPageContent } from '../types';

interface Props {
  setActiveTab: (tab: string) => void;
}

export const MedicalCardPage: React.FC<Props> = ({ setActiveTab }) => {
  const [content, setContent] = useState<DynamicPageContent['medicalCardInfo']>({
    title: 'DMB ডিজিটাল মেডিক্যাল কার্ড কী এবং কেন নিবেন?',
    description: 'গোপালগঞ্জ, নড়াইল ও সিলেট জেলার প্রতিটি পরিবারের চিকিৎসাকোস্ট সাশ্রয়ে আমাদের প্রস্তুতকৃত অনন্য ডিজিটাল আইডি কার্ড।',
    perks: [],
    coverageDistricts: ['গোপালগঞ্জ সদর', 'নড়াইল', 'সিলেট সদর', 'ঢাকা ধামরাই'],
    terms: 'কার্ডধারী সদস্য ও তার অনুমোদিত ফ্যামিলি মেম্বারগণ নিবন্ধিত পার্টনার হাসপাতাল ও সেন্টারে কিউআর কোড ভেরিফাই করে তাৎক্ষণিক ছাড় পাবেন।'
  });

  useEffect(() => {
    fetchJsonSafe('/api/page-content').then(data => {
      if (data && data.medicalCardInfo && data.medicalCardInfo.title) {
        setContent(data.medicalCardInfo);
      }
    });
  }, []);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 py-12 px-4 sm:px-6 lg:px-8 space-y-12">
      
      {/* Header */}
      <div className="max-w-4xl mx-auto text-center space-y-3">
        <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-3 py-1 rounded-full uppercase tracking-wider">
          Digital Medical Card
        </span>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900">
          {content.title}
        </h1>
        <p className="text-sm text-slate-600 leading-relaxed max-w-2xl mx-auto">
          {content.description}
        </p>
      </div>

      {/* Card Visual Banner */}
      <div className="max-w-5xl mx-auto bg-gradient-to-r from-blue-900 via-sky-800 to-emerald-800 rounded-3xl p-8 sm:p-12 text-white shadow-xl grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
        
        <div className="space-y-4">
          <span className="bg-emerald-500 text-white font-bold text-[10px] uppercase px-2.5 py-1 rounded-full">
            OFFICIAL DIGITAL CARD
          </span>
          <h2 className="text-2xl font-extrabold">আপনার পরিবারের হেলথ সেভিংস কার্ড</h2>
          <p className="text-xs text-sky-100 leading-relaxed">
            এই কার্ড থাকলে গোপালগঞ্জের জনপ্রিয় ডায়াগনস্টিক সেন্টারে গিয়ে সরাসরি ডিসকাউন্ট পাবেন। কোনো তৃতীয় পক্ষের ঝামেলা ছাড়াই বিলের সময় কিউআর কোড দেখালে তাৎক্ষণিক ছাড় পাবেন।
          </p>

          <div className="pt-2 flex flex-wrap gap-3">
            <button
              onClick={() => setActiveTab('apply')}
              className="px-6 py-3 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-xs shadow transition cursor-pointer"
            >
              আজই অনলাইনে কার্ড নিন →
            </button>
            <button
              onClick={() => setActiveTab('verify')}
              className="px-6 py-3 rounded-xl bg-white/10 hover:bg-white/20 text-white border border-white/20 font-semibold text-xs transition cursor-pointer"
            >
              কার্ড ভেরিফাই করুন
            </button>
          </div>
        </div>

        <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20 space-y-4 text-xs">
          <div className="flex items-center justify-between pb-2 border-b border-white/20">
            <span className="font-mono font-bold text-emerald-300">CARD ID: DMB-2026-XXXX</span>
            <span className="bg-emerald-500/30 text-emerald-200 px-2 py-0.5 rounded text-[10px]">VERIFIED</span>
          </div>
          <div className="space-y-1">
            <p className="text-slate-300 font-bold">সুবিধাসমূহ:</p>
            <ul className="space-y-1.5 text-sky-100 list-disc pl-4">
              <li>সকল প্যাথলজি ও ডায়াগনস্টিক টেস্টে নির্ধারিত ৩০% নিশ্চিত ছাড়।</li>
              <li>আল্ট্রাসনোগ্রাফি, ডিজিটাল এক্স-রে ও ইসিজি-তে ৩০% ছাড়।</li>
              <li>স্মার্টফোনে কিউআর কোড ব্যাকআপ এবং মেয়াদ ১ বছর।</li>
              <li>গোপালগঞ্জ, নড়াইল, সিলেট ও ঢাকার স্বনামধন্য সকল পার্টনার ল্যাবে কার্যকর।</li>
            </ul>
          </div>
        </div>

      </div>

      {/* Card Tiers Capacity Section */}
      <div className="max-w-5xl mx-auto space-y-6">
        <div className="text-center space-y-2">
          <span className="text-xs font-bold text-sky-600 bg-sky-50 px-3 py-1 rounded-full uppercase tracking-wider">
            CARD TIERS & COVERAGE LIMITS
          </span>
          <h2 className="text-2xl font-extrabold text-slate-900">আমাদের ৩টি বিশেষ মেডিক্যাল কার্ড ক্যাটাগরি</h2>
          <p className="text-xs text-slate-600">পছন্দ অনুযায়ী কার্ড নির্বাচন করুন এবং পরিবারের নির্ধারিত সদস্য পর্যন্ত ক্যাশলেস ডিসকাউন্ট সুবিধা গ্রহণ করুন</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-xs">
          {/* Silver Tier */}
          <div className="bg-white rounded-2xl border-2 border-slate-200 p-6 shadow-sm hover:border-slate-400 transition space-y-4 relative overflow-hidden">
            <div className="absolute top-0 right-0 bg-slate-200 text-slate-700 font-bold text-[10px] uppercase px-3 py-1 rounded-bl-xl">
              SILVER TIER
            </div>
            <div className="w-12 h-12 rounded-xl bg-slate-100 text-slate-700 font-extrabold flex items-center justify-center text-lg">
              🥈
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-900">সিলভার কার্ড (Silver)</h3>
              <p className="text-slate-500 font-semibold text-xs mt-1">কভারেজ: ৪ জন সদস্য</p>
            </div>
            <p className="text-slate-600 text-xs leading-relaxed">
              ছোট পরিবার বা একক দম্পতিদের জন্য পারফেক্ট ক্যাটাগরি। কার্ডধারী সহ মোট ৪ জন রেজিস্টার্ড সদস্য পার্টনার ল্যাবে ৩০% ছাড় পাবেন।
            </p>
            <div className="bg-slate-50 p-3 rounded-xl space-y-1.5 border border-slate-100">
              <p className="font-bold text-slate-800 text-[11px]">মূল সুবিধা:</p>
              <p className="text-slate-600">• ৪ জনের সেবা নেওয়ার সুযোগ</p>
              <p className="text-slate-600">• ডায়াগনস্টিক টেস্টে ৩০% নিশ্চিত ছাড়</p>
              <p className="text-slate-600">• গোপালগঞ্জ, নড়াইল ও সিলেট কভারেজ</p>
            </div>
            <button
              onClick={() => setActiveTab('apply')}
              className="w-full py-2.5 rounded-xl bg-slate-800 hover:bg-slate-900 text-white font-bold text-xs transition cursor-pointer"
            >
              সিলভার কার্ডের আবেদন →
            </button>
          </div>

          {/* Gold Tier */}
          <div className="bg-gradient-to-b from-amber-50/50 to-white rounded-2xl border-2 border-amber-400 p-6 shadow-md hover:shadow-lg transition space-y-4 relative overflow-hidden">
            <div className="absolute top-0 right-0 bg-amber-500 text-white font-bold text-[10px] uppercase px-3 py-1 rounded-bl-xl">
              POPULAR GOLD
            </div>
            <div className="w-12 h-12 rounded-xl bg-amber-100 text-amber-700 font-extrabold flex items-center justify-center text-lg">
              🥇
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-900">গোল্ড কার্ড (Gold)</h3>
              <p className="text-amber-700 font-bold text-xs mt-1">কভারেজ: ৬ জন সদস্য</p>
            </div>
            <p className="text-slate-600 text-xs leading-relaxed">
              মাঝারি ও যৌথ পরিবারের জন্য সর্বাধিক জনপ্রিয় কার্ড। পরিবারের বাবা-মা ও সন্তান সহ মোট ৬ জন নিবন্ধিত সদস্য সুবিধা পাবেন।
            </p>
            <div className="bg-amber-50/80 p-3 rounded-xl space-y-1.5 border border-amber-100">
              <p className="font-bold text-amber-900 text-[11px]">মূল সুবিধা:</p>
              <p className="text-amber-800">• ৬ জনের সেবা নেওয়ার সুযোগ</p>
              <p className="text-amber-800">• সকল ডায়াগনস্টিক টেস্টে ৩০% ছাড়</p>
              <p className="text-amber-800">• হেলথ প্যাকেজে বিশেষ অগ্রাধিকার</p>
            </div>
            <button
              onClick={() => setActiveTab('apply')}
              className="w-full py-2.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs transition cursor-pointer"
            >
              গোল্ড কার্ডের আবেদন →
            </button>
          </div>

          {/* Platinum Tier */}
          <div className="bg-gradient-to-b from-sky-50/50 to-white rounded-2xl border-2 border-sky-500 p-6 shadow-md hover:shadow-lg transition space-y-4 relative overflow-hidden">
            <div className="absolute top-0 right-0 bg-sky-600 text-white font-bold text-[10px] uppercase px-3 py-1 rounded-bl-xl">
              PREMIUM PLATINUM
            </div>
            <div className="w-12 h-12 rounded-xl bg-sky-100 text-sky-700 font-extrabold flex items-center justify-center text-lg">
              💎
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-900">প্লাটিনাম কার্ড (Platinum)</h3>
              <p className="text-sky-700 font-bold text-xs mt-1">কভারেজ: ৮ জন সদস্য</p>
            </div>
            <p className="text-slate-600 text-xs leading-relaxed">
              বৃহৎ যৌথ পরিবার এবং ভিআইপি হেলথ মেম্বারদের জন্য সর্বোচ্চ ৮ জন সদস্য কভারেজ সম্বলিত প্রিমিয়াম কার্ড সুবিধা।
            </p>
            <div className="bg-sky-50/80 p-3 rounded-xl space-y-1.5 border border-sky-100">
              <p className="font-bold text-sky-900 text-[11px]">মূল সুবিধা:</p>
              <p className="text-sky-800">• ৮ জনের সেবা নেওয়ার সর্বোচ্চ সুযোগ</p>
              <p className="text-sky-800">• ৩০% নির্দিষ্ট ক্যাশলেস ডিসকাউন্ট</p>
              <p className="text-sky-800">• বিশেষ কনসালটেশন ও ২৪/৭ হেল্পলাইন</p>
            </div>
            <button
              onClick={() => setActiveTab('apply')}
              className="w-full py-2.5 rounded-xl bg-sky-600 hover:bg-sky-700 text-white font-bold text-xs transition cursor-pointer"
            >
              প্লাটিনাম কার্ডের আবেদন →
            </button>
          </div>
        </div>
      </div>
      <div className="max-w-5xl mx-auto space-y-6">
        <h3 className="text-2xl font-bold text-slate-900 text-center">মেডিক্যাল কার্ডের মূল সুবিধাসমূহ</h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-xs">
          <div className="bg-white p-6 rounded-2xl border border-slate-200 space-y-2">
            <div className="p-3 w-10 h-10 rounded-xl bg-blue-50 text-blue-600 font-bold flex items-center justify-center">
              <Percent className="w-5 h-5" />
            </div>
            <h4 className="font-bold text-slate-900 text-sm">নির্দিষ্ট মূল্য সাশ্রয়</h4>
            <p className="text-slate-600 leading-relaxed">
              প্রতিটি পরীক্ষায় নিয়মিত রেট থেকে নির্ধারিত ৩০% নির্দিষ্ট ছাড় পান। বছরে হাজার হাজার টাকা সাশ্রয় হয়।
            </p>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-slate-200 space-y-2">
            <div className="p-3 w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 font-bold flex items-center justify-center">
              <QrCode className="w-5 h-5" />
            </div>
            <h4 className="font-bold text-slate-900 text-sm">কিউআর কোড প্রযুক্তি</h4>
            <p className="text-slate-600 leading-relaxed">
              কার্ড হারানো বা নষ্ট হওয়ার কোনো ভয় নেই। আপনার মোবাইলে থাকা ডিজিটাল QR স্ক্যান করে বিল কাউন্টারে নিশ্চিত ছাড় পান।
            </p>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-slate-200 space-y-2">
            <div className="p-3 w-10 h-10 rounded-xl bg-amber-50 text-amber-600 font-bold flex items-center justify-center">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <h4 className="font-bold text-slate-900 text-sm">জরুরি ব্লাড ও প্রোফাইল ডাটা</h4>
            <p className="text-slate-600 leading-relaxed">
              কার্ডের ডাটাবেজে রোগীর রক্তের গ্রুপ ও জরুরি যোগাযোগের মোবাইল নম্বর সংরক্ষিত থাকে।
            </p>
          </div>
        </div>
      </div>

      {/* How to Get Process */}
      <div className="max-w-4xl mx-auto bg-white rounded-2xl p-8 border border-slate-200 space-y-6">
        <h3 className="text-xl font-bold text-slate-900 text-center">কার্ড পাওয়ার ৪টি সহজ ধাপ</h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-100 flex items-start gap-3">
            <span className="w-7 h-7 rounded-full bg-blue-600 text-white font-bold flex items-center justify-center flex-shrink-0 text-xs">১</span>
            <div>
              <p className="font-bold text-slate-900">অনলাইন ফর্ম পূরণ</p>
              <p className="text-slate-500">আপনার নাম, রক্তের গ্রুপ ও ঠিকানা দিন।</p>
            </div>
          </div>

          <div className="p-4 rounded-xl bg-slate-50 border border-slate-100 flex items-start gap-3">
            <span className="w-7 h-7 rounded-full bg-blue-600 text-white font-bold flex items-center justify-center flex-shrink-0 text-xs">২</span>
            <div>
              <p className="font-bold text-slate-900">ছবি ও NID প্রদান</p>
              <p className="text-slate-500">পরিষ্কার ছবি ও জাতীয় পরিচয়পত্র নম্বর দিন।</p>
            </div>
          </div>

          <div className="p-4 rounded-xl bg-slate-50 border border-slate-100 flex items-start gap-3">
            <span className="w-7 h-7 rounded-full bg-blue-600 text-white font-bold flex items-center justify-center flex-shrink-0 text-xs">৩</span>
            <div>
              <p className="font-bold text-slate-900">ইনস্ট্যান্ট আইডি তৈরি</p>
              <p className="text-slate-500">সিস্টেম সাথে সাথে ইউনিক কার্ড আইডি তৈরি করবে।</p>
            </div>
          </div>

          <div className="p-4 rounded-xl bg-slate-50 border border-slate-100 flex items-start gap-3">
            <span className="w-7 h-7 rounded-full bg-blue-600 text-white font-bold flex items-center justify-center flex-shrink-0 text-xs">৪</span>
            <div>
              <p className="font-bold text-slate-900">কার্ড ব্যবহার শুরু</p>
              <p className="text-slate-500">সাথে সাথেই ল্যাবে গিয়ে ছাড় সুবিধা নিন।</p>
            </div>
          </div>
        </div>

        <div className="text-center pt-2">
          <button
            onClick={() => setActiveTab('apply')}
            className="px-8 py-3.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow transition cursor-pointer"
          >
            আবেদন ফর্ম খুলুন →
          </button>
        </div>
      </div>

    </div>
  );
};
