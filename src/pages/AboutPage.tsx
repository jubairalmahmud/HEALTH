import React, { useEffect, useState } from 'react';
import { fetchJsonSafe } from '../utils/api';
import { HeartPulse, Target, Eye, ShieldCheck, Award, MapPin, CheckCircle, Users } from 'lucide-react';
import { DynamicPageContent } from '../types';

interface Props {
  setActiveTab: (tab: string) => void;
}

export const AboutPage: React.FC<Props> = ({ setActiveTab }) => {
  const [content, setContent] = useState<DynamicPageContent['aboutUs']>({
    title: 'আমাদের ডিজিটাল হেলথকেয়ার নেটওয়ার্ক',
    description: 'ডিজিটাল মিডিয়া ব্রিজ (DMB) হলো বাংলাদেশের স্বাস্থ্যখাতে একটি উদ্ভাবনী উদ্যোগ, যার মূল লক্ষ্য ডিজিটাল প্রযুক্তির সাহায্যে দেশের প্রতিটি মানুষের স্বাস্থ্যসেবার খরচ সাশ্রয় করা।',
    mission: 'ডিজিটাল নেটওয়ার্ক ও মেডিক্যাল কার্ড ব্যবস্থার মাধ্যমে ডায়াগনস্টিক টেস্ট ও চিকিৎসাসেবার ব্যয় নির্ধারিত ৩০% কমিয়ে এনে প্রান্তিক ও মধ্যবিত্ত জনগোষ্ঠীর স্বাস্থ্যসেবার স্বাচ্ছন্দ্য ও সক্ষমতা বৃদ্ধি করা।',
    vision: 'বাংলাদেশে একটি সর্বজনীন ও তথ্য-প্রযুক্তি নির্ভর স্মার্ট হেলথকেয়ার ইকোসিস্টেম গড়ে তোলা, যেখানে প্রতিটি নাগরিক নিজের ডিজিটাল মেডিক্যাল কার্ডের মাধ্যমে ন্যায্যমূল্যে সেরা স্বাস্থ্যসেবা পাবেন।',
    mdMessage: 'আমাদের লক্ষ্য হলো স্বাস্থ্যখাতে মধ্যস্বত্বভোগীদের অবসান ঘটিয়ে সরাসরি পপুলার, ইবনে সিনা ও ডিজিটাল হেলথ পার্টনারদের সাথে রোগীদের সংযোগ স্থাপন করা।',
    achievements: [
      { number: '৫,০০০+', label: 'সক্রিয় কার্ডধারী পরিবার' },
      { number: '২০+', label: 'অনুমোদিত ডায়াগনস্টিক ও হাসপাতাল' },
      { number: '৩০%', label: 'ডায়াগনস্টিক টেস্টে ছাড়' },
      { number: '২৪/৭', label: 'জরুরি হেল্পলাইন সাপোর্ট' }
    ]
  });

  useEffect(() => {
    fetchJsonSafe('/api/page-content').then(data => {
      if (data && data.aboutUs && data.aboutUs.title) {
        setContent(data.aboutUs);
      }
    });
  }, []);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 py-12 px-4 sm:px-6 lg:px-8 space-y-12">
      
      {/* Header */}
      <div className="max-w-4xl mx-auto text-center space-y-3">
        <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-3 py-1 rounded-full uppercase tracking-wider">
          About Digital Medi Bridge
        </span>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900">
          {content.title}
        </h1>
        <p className="text-sm text-slate-600 leading-relaxed max-w-2xl mx-auto">
          {content.description}
        </p>
      </div>

      {/* Gopalganj Pilot Section */}
      <div className="max-w-5xl mx-auto bg-gradient-to-br from-blue-900 to-sky-800 text-white rounded-3xl p-8 sm:p-10 shadow-xl space-y-6">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-emerald-500 text-white font-bold flex items-center justify-center text-xl">
            GP
          </div>
          <div>
            <h2 className="text-2xl font-bold">গোপালগঞ্জ জেলা পাইলট প্রজেক্ট</h2>
            <p className="text-xs text-sky-200">Healthcare Network Pilot Phase 1</p>
          </div>
        </div>

        <p className="text-sm text-sky-100 leading-relaxed">
          ডিজিটাল মিডিয়া ব্রিজ (DMB) প্রথম পর্যায়ে গোপালগঞ্জ জেলায় (গোপালগঞ্জ সদর, টুঙ্গিপাড়া, কোটালীপাড়া, কাশিয়ানী ও মুকসুদপুর) পাইলট প্রজেক্ট হিসেবে যাত্রা শুরু করেছে। গোপালগঞ্জবাসীকে ডিজিটাল মেডিক্যাল কার্ডের আওতায় এনে স্থানীয় স্বনামধন্য ডায়াগনস্টিক সেন্টার ও হাসপাতালের মাধ্যমে সাশ্রয়ী প্যাথলজি ও ইমেজিং টেস্ট নিশ্চিত করাই আমাদের প্রাথমিক লক্ষ্য।
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4 border-t border-white/20 text-xs">
          <div className="bg-white/10 p-3 rounded-xl border border-white/15">
            <span className="font-bold text-emerald-300 block mb-1">ফেজ ১ (চলমান):</span>
            <span>গোপালগঞ্জ জেলার সকল উপজেলা ও পার্টনার প্যাথলজি সেন্টার।</span>
          </div>
          <div className="bg-white/10 p-3 rounded-xl border border-white/15">
            <span className="font-bold text-sky-300 block mb-1">ফেজ ২ (আসন্ন):</span>
            <span>বৃহত্তর ফরিদপুর বিভাগ (ফরিদপুর, মাদারীপুর, রাজবাড়ী, শরীয়তপুর)।</span>
          </div>
          <div className="bg-white/10 p-3 rounded-xl border border-white/15">
            <span className="font-bold text-amber-300 block mb-1">ফেজ ৩ (দীর্ঘমেয়াদী):</span>
            <span>সমগ্র বাংলাদেশব্যাপী জাতীয় ডিজিটাল হেলথ কার্ড নেটওয়ার্ক।</span>
          </div>
        </div>
      </div>

      {/* Mission & Vision */}
      <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-8">
        
        <div className="bg-white rounded-2xl p-8 border border-slate-200 shadow-sm space-y-4">
          <div className="w-12 h-12 rounded-2xl bg-blue-100 text-blue-700 flex items-center justify-center">
            <Target className="w-6 h-6" />
          </div>
          <h3 className="text-xl font-bold text-slate-900">আমাদের মিশন (Mission)</h3>
          <p className="text-xs text-slate-600 leading-relaxed">
            {content.mission}
          </p>
        </div>

        <div className="bg-white rounded-2xl p-8 border border-slate-200 shadow-sm space-y-4">
          <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center">
            <Eye className="w-6 h-6" />
          </div>
          <h3 className="text-xl font-bold text-slate-900">আমাদের ভিশন (Vision)</h3>
          <p className="text-xs text-slate-600 leading-relaxed">
            {content.vision}
          </p>
        </div>

      </div>

      {/* Why Choose DMB */}
      <div className="max-w-5xl mx-auto bg-white rounded-2xl p-8 border border-slate-200 shadow-sm space-y-6">
        <h3 className="text-2xl font-bold text-slate-900 text-center">কেন DMB ব্যবহার করবেন?</h3>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 text-xs">
          <div className="flex items-start gap-3 p-4 rounded-xl bg-slate-50 border border-slate-100">
            <CheckCircle className="w-5 h-5 text-emerald-600 flex-shrink-0 mt-0.5" />
            <div>
              <h4 className="font-bold text-slate-900 mb-1">৩০% ডিসকাউন্ট</h4>
              <p className="text-slate-500">সব ধরনের ল্যাব টেস্ট, সিবিসি, আল্ট্রাসনোগ্রাফি, সিটি স্ক্যান ও এমআরআই তে সরাসরি ছাড়।</p>
            </div>
          </div>

          <div className="flex items-start gap-3 p-4 rounded-xl bg-slate-50 border border-slate-100">
            <CheckCircle className="w-5 h-5 text-emerald-600 flex-shrink-0 mt-0.5" />
            <div>
              <h4 className="font-bold text-slate-900 mb-1">ইনস্ট্যান্ট কিউআর ভেরিফিকেশন</h4>
              <p className="text-slate-500">পার্টনার সেন্টারে স্মার্টফোনের মাধ্যমে সাথে সাথে কার্ডের সত্যতা যাচাই।</p>
            </div>
          </div>

          <div className="flex items-start gap-3 p-4 rounded-xl bg-slate-50 border border-slate-100">
            <CheckCircle className="w-5 h-5 text-emerald-600 flex-shrink-0 mt-0.5" />
            <div>
              <h4 className="font-bold text-slate-900 mb-1">স্বচ্ছ ও নির্ভুল ফি</h4>
              <p className="text-slate-500">ওয়েবসাইটে প্রতিটি টেস্টের আসল মূল্য ও DMB মূল্য উন্মুক্তভাবে প্রকা‌শিত।</p>
            </div>
          </div>
        </div>

        <div className="text-center pt-4">
          <button
            onClick={() => setActiveTab('apply')}
            className="px-6 py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow transition cursor-pointer"
          >
            এখনই মেডিক্যাল কার্ডের আবেদন করুন →
          </button>
        </div>
      </div>

    </div>
  );
};
