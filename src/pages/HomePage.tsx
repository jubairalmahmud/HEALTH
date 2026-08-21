import React, { useState, useEffect } from 'react';
import {
  CreditCard,
  ShieldCheck,
  Search,
  Building2,
  HeartPulse,
  Award,
  CheckCircle2,
  ArrowRight,
  TrendingUp,
  Percent,
  Sparkles,
  Users,
  MapPin,
  Clock,
  PhoneCall,
  Calendar,
  FileText
} from 'lucide-react';
import { DiagnosticCenter, MedicalTest, HealthPackage, BlogArticle, Testimonial, HeroBannerSettings } from '../types';
import { GallerySection } from '../components/GallerySection';

interface Props {
  setActiveTab: (tab: string) => void;
  centers: DiagnosticCenter[];
  tests: MedicalTest[];
  packages: HealthPackage[];
  blogs: BlogArticle[];
  testimonials: Testimonial[];
}

export const HomePage: React.FC<Props> = ({
  setActiveTab,
  centers,
  tests,
  packages,
  blogs,
  testimonials
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  // Dynamic Hero Banner State
  const [heroData, setHeroData] = useState<HeroBannerSettings>({
    badgeText: 'গোপালগঞ্জ জেলায় পাইলট প্রজেক্ট ফেজ ১ চালু',
    title: 'ডিজিটাল মেডিক্যাল কার্ডের মাধ্যমে',
    titleHighlight: 'স্বাস্থ্যসেবা ও ডায়াগনস্টিক খরচে সাশ্রয়',
    description: 'Digital Medi Bridge (DMB) হলো একটি আধুনিক Healthcare Network Platform। আমাদের ডিজিটাল মেডিক্যাল কার্ড ব্যবহার করে গোপালগঞ্জ সহ সারাদেশের পার্টনার ডায়াগনস্টিক সেন্টার ও হাসপাতাল থেকে পাচ্ছেন নির্ধারিত ৩০% বিশেষ ছাড়।',
    primaryBtnText: 'মেডিক্যাল কার্ডের আবেদন করুন',
    secondaryBtnText: 'কার্ড ভেরিফাই করুন',
    heroImage: '',
    stat1Value: '৩০% ছাড়',
    stat1Label: 'ডায়াগনস্টিক টেস্টে নিশ্চিত ছাড়',
    stat2Value: '১০,০০০+',
    stat2Label: 'নিবন্ধিত পরিবার',
    stat3Value: '১০০%',
    stat3Label: 'যাচাইকৃত পার্টনার ল্যাব'
  });

  useEffect(() => {
    fetch('/api/hero-banner')
      .then(res => res.ok ? res.json() : null)
      .then(data => {
        if (data && data.title) {
          setHeroData(prev => ({ ...prev, ...data }));
        }
      })
      .catch(() => {});
  }, []);

  // Savings calculator state
  const [calcSelectedTest, setCalcSelectedTest] = useState<string>(tests[0]?.id || '');
  const foundTest = tests.find(t => t.id === calcSelectedTest) || tests[0];

  const featuredCenters = centers.filter(c => c.featured).slice(0, 3);
  const featuredPackages = packages.slice(0, 3);
  const featuredBlogs = blogs.slice(0, 3);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 space-y-16 pb-16">
      
      {/* HERO SECTION */}
      <section className="relative overflow-hidden bg-gradient-to-br from-blue-950 via-sky-900 to-emerald-900 text-white pt-12 pb-20 px-4 sm:px-6 lg:px-8">
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#fff_1px,transparent_1px)] [background-size:16px_16px]"></div>
        
        <div className="max-w-7xl mx-auto relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          
          {/* Hero Left Copy */}
          <div className="lg:col-span-7 space-y-6">
            {heroData.badgeText && (
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-500/20 border border-emerald-400/30 text-emerald-300 text-xs font-semibold">
                <Sparkles className="w-4 h-4 text-emerald-400" />
                <span>{heroData.badgeText}</span>
              </div>
            )}

            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-white leading-tight">
              {heroData.title} <br />
              {heroData.titleHighlight && (
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-300 via-sky-200 to-amber-200">
                  {heroData.titleHighlight}
                </span>
              )}
            </h1>

            <p className="text-base text-sky-100 leading-relaxed max-w-2xl whitespace-pre-line">
              {heroData.description}
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-wrap items-center gap-4 pt-2">
              <button
                onClick={() => setActiveTab('apply')}
                className="px-6 py-3.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white font-bold text-sm shadow-lg shadow-emerald-900/40 transition cursor-pointer flex items-center gap-2"
              >
                <CreditCard className="w-5 h-5" />
                {heroData.primaryBtnText || 'মেডিক্যাল কার্ডের আবেদন করুন'}
              </button>

              <button
                onClick={() => setActiveTab('verify')}
                className="px-6 py-3.5 rounded-xl bg-white/10 hover:bg-white/20 text-white border border-white/20 font-semibold text-sm transition cursor-pointer flex items-center gap-2"
              >
                <ShieldCheck className="w-5 h-5 text-sky-300" />
                {heroData.secondaryBtnText || 'কার্ড ভেরিফাই করুন'}
              </button>
            </div>

            {/* Metrics Bar */}
            <div className="grid grid-cols-3 gap-4 pt-6 border-t border-white/10 text-center sm:text-left">
              <div>
                <p className="text-2xl font-extrabold text-emerald-300 font-mono">{heroData.stat1Value}</p>
                <p className="text-xs text-sky-200">{heroData.stat1Label}</p>
              </div>
              <div>
                <p className="text-2xl font-extrabold text-sky-300 font-mono">{heroData.stat2Value}</p>
                <p className="text-xs text-sky-200">{heroData.stat2Label}</p>
              </div>
              <div>
                <p className="text-2xl font-extrabold text-amber-300 font-mono">{heroData.stat3Value}</p>
                <p className="text-xs text-sky-200">{heroData.stat3Label}</p>
              </div>
            </div>
          </div>

          {/* Hero Right Visual Banner / Sample Card */}
          <div className="lg:col-span-5 flex justify-center">
            {heroData.heroImage ? (
              <div className="w-full max-w-md rounded-3xl bg-white/10 backdrop-blur-xl p-3 border border-white/20 shadow-2xl overflow-hidden space-y-3">
                <img
                  src={heroData.heroImage}
                  alt="Hero Banner"
                  className="w-full h-64 sm:h-72 object-cover rounded-2xl shadow-md border border-white/10"
                  onError={(e) => {
                    (e.target as HTMLElement).style.display = 'none';
                  }}
                />
                <div className="p-3 bg-slate-900/60 rounded-xl text-center space-y-1">
                  <p className="text-xs font-bold text-emerald-300">DMB Healthcare Official Network</p>
                  <button
                    onClick={() => setActiveTab('apply')}
                    className="mt-2 w-full py-2 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-xs transition cursor-pointer"
                  >
                    ডিজিটাল হেলথ মেম্বারশিপ নিন →
                  </button>
                </div>
              </div>
            ) : (
              <div className="w-full max-w-sm rounded-2xl bg-white/10 backdrop-blur-xl p-6 border border-white/20 shadow-2xl text-white space-y-5">
                <div className="flex items-center justify-between pb-3 border-b border-white/15">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-emerald-500 text-white font-black flex items-center justify-center text-xs">
                      DMB
                    </div>
                    <div>
                      <p className="font-bold text-xs uppercase tracking-wider text-white">Digital Medical Card</p>
                      <p className="text-[10px] text-sky-200">Healthcare Network ID</p>
                    </div>
                  </div>
                  <span className="text-[10px] font-mono bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded border border-emerald-400/30">
                    ACTIVE
                  </span>
                </div>

                <div className="flex items-center gap-4">
                  <img
                    src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=200"
                    alt="Member"
                    className="w-16 h-20 rounded-lg object-cover border-2 border-emerald-400"
                  />
                  <div className="space-y-1 text-xs">
                    <p className="font-bold text-sm text-white">Rahim Uddin Sheikh</p>
                    <p className="text-sky-200 font-mono">ID: DMB-2026-1001</p>
                    <p className="text-[11px] text-emerald-300 font-medium">BLOOD GROUP: B+ (Positive)</p>
                    <p className="text-[10px] text-sky-300">ADDRESS: Bedgram, Gopalganj Sadar</p>
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-slate-900/60 border border-white/10 text-[11px] space-y-1">
                  <div className="flex items-center justify-between text-slate-300">
                    <span>পপুলার ডায়াগনস্টিক গোপালগঞ্জ:</span>
                    <span className="font-bold text-emerald-400">৩০% ছাড়</span>
                  </div>
                  <div className="flex items-center justify-between text-slate-300">
                    <span>সেবা ডায়াগনস্টিক ও লাব:</span>
                    <span className="font-bold text-emerald-400">৩০% ছাড়</span>
                  </div>
                </div>

                <button
                  onClick={() => setActiveTab('medical-card')}
                  className="w-full py-2.5 rounded-xl bg-sky-500 hover:bg-sky-600 text-white font-bold text-xs transition cursor-pointer text-center"
                >
                  কার্ডের পূর্ণাঙ্গ সুবিধা দেখুন →
                </button>
              </div>
            )}
          </div>

        </div>
      </section>

      {/* QUICK SAVINGS CALCULATOR WIDGET */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-12 relative z-20">
        <div className="bg-white rounded-2xl shadow-xl border border-sky-100 p-6 md:p-8">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
            
            <div className="md:col-span-5 space-y-2">
              <div className="flex items-center gap-2 text-emerald-600 font-bold text-xs uppercase tracking-wider">
                <Percent className="w-4 h-4" /> DMB Savings Calculator
              </div>
              <h3 className="text-xl font-bold text-slate-900">
                জানুন যেকোনো টেস্টে আপনার কত টাকা সাশ্রয় হবে!
              </h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                আপনার কাঙ্ক্ষিত প্যাথলজি বা ইমেজিং টেস্টটি নির্বাচন করুন এবং দেখুন DMB কার্ড থাকলে কত টাকা সরাসরি ছাড় পাবেন।
              </p>
            </div>

            <div className="md:col-span-4">
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                ডায়াগনস্টিক টেস্ট নির্বাচন করুন:
              </label>
              <select
                value={calcSelectedTest}
                onChange={e => setCalcSelectedTest(e.target.value)}
                className="w-full p-3 rounded-xl border border-slate-200 bg-slate-50 text-slate-800 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none font-medium"
              >
                {tests.map(t => (
                  <option key={t.id} value={t.id}>
                    {t.name} ({t.category})
                  </option>
                ))}
              </select>
            </div>

            <div className="md:col-span-3 bg-gradient-to-br from-emerald-50 to-teal-50 p-4 rounded-xl border border-emerald-200 text-center space-y-1">
              <span className="text-[10px] uppercase font-bold text-emerald-700 tracking-wider">নিয়মিত বনাম DMB মূল্য</span>
              <div className="flex items-baseline justify-center gap-2">
                <span className="text-xs text-slate-400 line-through font-mono">৳{foundTest?.regularPrice}</span>
                <span className="text-2xl font-black text-emerald-700 font-mono">৳{foundTest?.dmbPrice}</span>
              </div>
              <span className="inline-block px-2 py-0.5 rounded-full bg-emerald-600 text-white font-extrabold text-[11px]">
                আপনার সাশ্রয়: ৳{foundTest?.savings} BDT
              </span>
            </div>

          </div>
        </div>
      </section>

      {/* HOW IT WORKS SECTION */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
        <div className="text-center space-y-2 max-w-2xl mx-auto">
          <span className="text-xs font-bold text-blue-600 uppercase tracking-widest bg-blue-50 px-3 py-1 rounded-full border border-blue-100">
            ৩টি সহজ ধাপ
          </span>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900">
            DMB মেডিক্যাল কার্ড কীভাবে কাজ করে?
          </h2>
          <p className="text-xs sm:text-sm text-slate-600">
            খুব সহজেই অনলাইনে কার্ডের জন্য আবেদন করে গোপালগঞ্জের যেকোনো পার্টনার সেন্টারে ছাড় সুবিধা পান।
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          
          <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-sm hover:shadow-md transition space-y-4 relative">
            <div className="w-12 h-12 rounded-2xl bg-blue-100 text-blue-700 font-black flex items-center justify-center text-xl">
              ১
            </div>
            <h3 className="font-bold text-base text-slate-900">অনলাইনে আবেদন করুন</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              আপনার নাম, মোবাইল নম্বর, রক্তের গ্রুপ ও ছবি দিয়ে মাত্র ২ মিনিটে DMB ডিজিটাল কার্ডের আবেদন সম্পন্ন করুন।
            </p>
            <button
              onClick={() => setActiveTab('apply')}
              className="text-xs font-bold text-blue-600 hover:underline flex items-center gap-1"
            >
              আবেদন করুন →
            </button>
          </div>

          <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-sm hover:shadow-md transition space-y-4 relative">
            <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-700 font-black flex items-center justify-center text-xl">
              ২
            </div>
            <h3 className="font-bold text-base text-slate-900">ডিজিটাল কার্ড সংগ্রহ করুন</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              তাৎক্ষণিকভাবে আপনার ইউনিক Card ID ও QR Code জেনারেট হবে। আপনার মোবাইলে ডাউনলোড বা প্রিন্ট করে রাখুন।
            </p>
            <button
              onClick={() => setActiveTab('verify')}
              className="text-xs font-bold text-emerald-600 hover:underline flex items-center gap-1"
            >
              ভেরিফাই করুন →
            </button>
          </div>

          <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-sm hover:shadow-md transition space-y-4 relative">
            <div className="w-12 h-12 rounded-2xl bg-amber-100 text-amber-700 font-black flex items-center justify-center text-xl">
              ৩
            </div>
            <h3 className="font-bold text-base text-slate-900">পার্টনার লাবে ছাড় উপভোগ করুন</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              গোপালগঞ্জ বা ঢাকার যেকোনো পার্টনার ডায়াগনস্টিক সেন্টারে কার্ড ও QR কোড দেখিয়ে সরাসরি ৩০% ছাড় পান।
            </p>
            <button
              onClick={() => setActiveTab('diagnostic')}
              className="text-xs font-bold text-amber-600 hover:underline flex items-center gap-1"
            >
              পার্টনার তালিকা →
            </button>
          </div>

        </div>
      </section>

      {/* FEATURED DIAGNOSTIC PARTNERS */}
      <section className="bg-slate-100/80 py-12 border-y border-slate-200/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
          
          <div className="flex flex-col sm:flex-row items-start sm:items-end justify-between gap-4">
            <div>
              <span className="text-xs font-bold text-emerald-600 uppercase tracking-widest">
                গোপালগঞ্জ ও ঢাকা পার্টনার নেটওয়ার্ক
              </span>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 mt-1">
                আমাদের পার্টনার ডায়াগনস্টিক সেন্টারসমূহ
              </h2>
            </div>
            <button
              onClick={() => setActiveTab('diagnostic')}
              className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs transition cursor-pointer"
            >
              সকল পার্টনার দেখুন ({centers.length})
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {featuredCenters.map(center => (
              <div
                key={center.id}
                className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-4 hover:border-blue-300 transition"
              >
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <span className="inline-block px-2 py-0.5 rounded bg-blue-100 text-blue-800 font-mono font-bold text-[10px] mb-1">
                      {center.upazila}, {center.district}
                    </span>
                    <h3 className="font-bold text-slate-900 text-base leading-snug">
                      {center.name}
                    </h3>
                  </div>
                  <span className="px-2.5 py-1 rounded-full bg-emerald-500 text-white font-extrabold text-xs shadow-sm flex-shrink-0">
                    {center.discountPercentage}% ছাড়
                  </span>
                </div>

                <p className="text-xs text-slate-500 flex items-start gap-1">
                  <MapPin className="w-3.5 h-3.5 text-slate-400 flex-shrink-0 mt-0.5" />
                  <span>{center.address}</span>
                </p>

                <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs">
                  <span className="text-slate-500 font-mono">মোবাইল: {center.mobile}</span>
                  <span className="text-emerald-600 font-semibold text-[11px]">ভেরিফাইড পার্টনার</span>
                </div>
              </div>
            ))}
          </div>

        </div>
      </section>

      {/* HEALTH PACKAGES PREVIEW */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <div className="text-center space-y-2 max-w-2xl mx-auto">
          <span className="text-xs font-bold text-blue-600 uppercase tracking-widest bg-blue-50 px-3 py-1 rounded-full">
            সস্তা ও নির্ভুল চেকআপ
          </span>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900">
            DMB বিশেষ হেলথ চেকআপ প্যাকেজ
          </h2>
          <p className="text-xs sm:text-sm text-slate-600">
            পরিবারের সকল বয়সের মানুষের জন্য নির্ধারিত বিশেষ প্যাথলজিক্যাল ও ক্লিনিক্যাল চেকআপ প্যাকেজ।
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {featuredPackages.map(pkg => (
            <div
              key={pkg.id}
              className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-4 flex flex-col justify-between hover:shadow-md transition"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="px-2.5 py-0.5 rounded-full bg-sky-100 text-sky-800 font-bold text-[10px]">
                    {pkg.category} Package
                  </span>
                  {pkg.popular && (
                    <span className="px-2 py-0.5 rounded bg-amber-100 text-amber-800 text-[10px] font-bold">
                      জনপ্রিয়
                    </span>
                  )}
                </div>

                <h3 className="font-bold text-slate-900 text-lg">{pkg.title}</h3>
                <p className="text-xs text-slate-500 leading-relaxed">{pkg.description}</p>

                <div className="pt-2 space-y-1">
                  <p className="text-[11px] font-bold text-slate-700">অন্তর্ভুক্ত পরীক্ষাসমূহ:</p>
                  <ul className="text-xs text-slate-600 space-y-1 pl-4 list-disc">
                    {pkg.includedTests.slice(0, 4).map((test, i) => (
                      <li key={i}>{test}</li>
                    ))}
                    {pkg.includedTests.length > 4 && (
                      <li className="text-blue-600 font-medium">and {pkg.includedTests.length - 4} more tests...</li>
                    )}
                  </ul>
                </div>
              </div>

              <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
                <div>
                  <span className="text-xs text-slate-400 line-through font-mono">৳{pkg.regularPrice}</span>
                  <p className="text-2xl font-black text-emerald-700 font-mono">৳{pkg.dmbPrice}</p>
                </div>
                <button
                  onClick={() => setActiveTab('packages')}
                  className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs transition cursor-pointer"
                >
                  প্যাকেজ বুক করুন
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* TESTIMONIALS SECTION */}
      <section className="bg-slate-900 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
          <div className="text-center space-y-2">
            <span className="text-xs font-bold text-emerald-400 uppercase tracking-widest">
              গোপালগঞ্জবাসীর মতামত
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-white">
              আমাদের সদস্যরা কী বলছেন?
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {testimonials.map(t => (
              <div key={t.id} className="bg-slate-800/80 rounded-2xl p-6 border border-slate-700 space-y-4">
                <div className="flex items-center gap-3">
                  <img src={t.avatar} alt={t.name} className="w-12 h-12 rounded-full object-cover border-2 border-emerald-400" />
                  <div>
                    <h4 className="font-bold text-white text-sm">{t.name}</h4>
                    <p className="text-xs text-sky-300">{t.role} • {t.location}</p>
                  </div>
                </div>
                <p className="text-xs text-slate-300 italic leading-relaxed">
                  "{t.comment}"
                </p>
                <div className="flex items-center gap-1 text-amber-400 text-xs font-bold">
                  ★★★★★ 5.0 Rating
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* HEALTH TIPS / BLOG PREVIEW */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <div className="flex items-center justify-between">
          <div>
            <span className="text-xs font-bold text-blue-600 uppercase tracking-widest">স্বাস্থ্য পরামর্শ</span>
            <h2 className="text-2xl font-extrabold text-slate-900">সর্বশেষ স্বাস্থ্য টিপস ও আর্টিকেল</h2>
          </div>
          <button
            onClick={() => setActiveTab('blog')}
            className="text-xs font-bold text-blue-600 hover:underline"
          >
            সব নিবন্ধ দেখুন →
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {featuredBlogs.map(blog => (
            <div
              key={blog.id}
              onClick={() => setActiveTab('blog')}
              className="bg-white rounded-2xl overflow-hidden border border-slate-200 shadow-sm hover:shadow-md transition cursor-pointer group space-y-3"
            >
              <div className="h-44 overflow-hidden relative">
                <img
                  src={blog.imageUrl}
                  alt={blog.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
                <span className="absolute top-3 left-3 bg-blue-600 text-white font-bold text-[10px] px-2.5 py-1 rounded-full shadow">
                  {blog.category}
                </span>
              </div>
              <div className="p-5 space-y-2">
                <span className="text-[10px] text-slate-400 font-mono">{blog.date} • {blog.readTime}</span>
                <h3 className="font-bold text-slate-900 text-base group-hover:text-blue-600 transition-colors line-clamp-2">
                  {blog.title}
                </h3>
                <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed">
                  {blog.summary}
                </p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* GALLERY SECTION */}
      <GallerySection />

      {/* CTA BANNER */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="rounded-3xl bg-gradient-to-r from-blue-900 via-sky-800 to-emerald-800 text-white p-8 sm:p-12 text-center space-y-6 shadow-2xl relative overflow-hidden">
          <div className="max-w-2xl mx-auto space-y-3 relative z-10">
            <h2 className="text-2xl sm:text-3xl font-extrabold">
              আজই আপনার পরিবারের জন্য DMB ডিজিটাল মেডিক্যাল কার্ড সংগ্রহ করুন!
            </h2>
            <p className="text-xs sm:text-sm text-sky-100">
              কম খরচে মানসম্মত ডায়াগনস্টিক সেবার শতভাগ নিশ্চিয়তা। কার্ড নেওয়ার সাথে সাথেই সেবা উপভোগ করতে পারবেন।
            </p>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-4 relative z-10">
            <button
              onClick={() => setActiveTab('apply')}
              className="px-8 py-3.5 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-sm shadow-lg transition cursor-pointer"
            >
              মেডিক্যাল কার্ডের অনলাইন আবেদন
            </button>
            <button
              onClick={() => setActiveTab('contact')}
              className="px-8 py-3.5 rounded-xl bg-white/10 hover:bg-white/20 text-white font-semibold text-sm border border-white/20 transition cursor-pointer"
            >
              গোপালগঞ্জ অফিসে যোগাযোগ
            </button>
          </div>
        </div>
      </section>

    </div>
  );
};
