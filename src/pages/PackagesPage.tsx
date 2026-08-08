import React, { useState } from 'react';
import { Package, CheckCircle2, ShieldCheck, HeartPulse, ArrowRight, Phone } from 'lucide-react';
import { HealthPackage } from '../types';

interface Props {
  packages: HealthPackage[];
  setActiveTab: (tab: string) => void;
}

export const PackagesPage: React.FC<Props> = ({ packages, setActiveTab }) => {
  const [selectedPkg, setSelectedPkg] = useState<HealthPackage | null>(null);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 py-12 px-4 sm:px-6 lg:px-8 space-y-10">
      
      {/* Header */}
      <div className="max-w-4xl mx-auto text-center space-y-2">
        <span className="text-xs font-bold text-blue-600 bg-blue-50 px-3 py-1 rounded-full uppercase tracking-wider">
          Curated Health Checkups
        </span>
        <h1 className="text-3xl font-extrabold text-slate-900">
          DMB বিশেষ হেলথ প্যাকেজসমূহ
        </h1>
        <p className="text-xs sm:text-sm text-slate-600">
          সাধারণ নাগরিক, ডায়াবেটিস রোগী, নারী এবং প্রবীণদের জন্য বিশেষভাবে তৈরিকৃত সম্পূর্ণ চেকআপ প্যাকেজ।
        </p>
      </div>

      {/* Grid */}
      <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {packages.map(pkg => (
          <div
            key={pkg.id}
            className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm hover:shadow-md transition flex flex-col justify-between space-y-4"
          >
            <div className="space-y-3">
              <span className="inline-block px-2.5 py-0.5 rounded-full bg-blue-100 text-blue-800 font-bold text-[10px]">
                {pkg.category} Checkup
              </span>

              <h3 className="font-bold text-slate-900 text-base leading-snug">{pkg.title}</h3>
              <p className="text-xs text-slate-500 leading-relaxed">{pkg.description}</p>

              <div className="pt-2 space-y-1.5">
                <span className="text-[11px] font-bold text-slate-800 block">অন্তর্ভুক্ত পরীক্ষাসমূহ:</span>
                <ul className="text-xs text-slate-600 space-y-1 pl-4 list-disc">
                  {pkg.includedTests.map((test, i) => (
                    <li key={i}>{test}</li>
                  ))}
                </ul>
              </div>
            </div>

            <div className="pt-4 border-t border-slate-100 space-y-3">
              <div className="flex items-baseline justify-between">
                <span className="text-xs text-slate-400 line-through font-mono">৳{pkg.regularPrice}</span>
                <span className="text-2xl font-black text-emerald-700 font-mono">৳{pkg.dmbPrice}</span>
              </div>

              <button
                onClick={() => setSelectedPkg(pkg)}
                className="w-full py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow transition cursor-pointer"
              >
                প্যাকেজ বুকিং করুন
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Booking Modal */}
      {selectedPkg && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-md w-full border border-slate-200 shadow-2xl space-y-5 animate-fadeIn">
            <h3 className="text-xl font-bold text-slate-900">প্যাকেজ বুকিং আবেদন</h3>
            <p className="text-xs text-slate-600">
              আপনি <strong className="text-blue-700">{selectedPkg.title}</strong> নির্বাচন করেছেন। (DMB বিশেষ মূল্য: <strong className="text-emerald-700 font-mono">৳{selectedPkg.dmbPrice}</strong>)
            </p>

            <div className="p-3 rounded-xl bg-sky-50 border border-sky-200 text-xs text-sky-900 space-y-1">
              <p className="font-bold">গোপালগঞ্জ হেল্পলাইন কন্টাক্ট:</p>
              <p>প্যাকেজ সুবিধা গ্রহণ করতে সরাসরি গোপালগঞ্জ হটলাইনে কল করুন অথবা অনলাইন কার্ড সংগ্রহ করুন।</p>
              <p className="font-mono font-bold text-sm text-blue-800 pt-1">+880 1711-000000</p>
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <button
                onClick={() => setSelectedPkg(null)}
                className="px-4 py-2 rounded-xl bg-slate-100 text-slate-700 font-semibold text-xs cursor-pointer"
              >
                বন্ধ করুন
              </button>
              <button
                onClick={() => {
                  setSelectedPkg(null);
                  setActiveTab('apply');
                }}
                className="px-5 py-2 rounded-xl bg-emerald-600 text-white font-bold text-xs shadow cursor-pointer"
              >
                কার্ড নিয়ে বুকিং করুন
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
