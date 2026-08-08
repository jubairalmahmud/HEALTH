import React, { useState } from 'react';
import { Search, Percent, CheckCircle2, FileText, ArrowRight } from 'lucide-react';
import { MedicalTest } from '../types';

interface Props {
  tests: MedicalTest[];
  setActiveTab: (tab: string) => void;
}

export const TestPricesPage: React.FC<Props> = ({ tests, setActiveTab }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('ALL');

  const categories = ['ALL', 'Biochemistry', 'Hematology', 'Radiology & Imaging', 'Endocrinology', 'Cardiology', 'Pathology'];

  const filteredTests = tests.filter(t => {
    const matchesSearch = t.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          t.category.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCat = selectedCategory === 'ALL' || t.category === selectedCategory;
    return matchesSearch && matchesCat;
  });

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 py-12 px-4 sm:px-6 lg:px-8 space-y-10">
      
      {/* Header */}
      <div className="max-w-4xl mx-auto text-center space-y-2">
        <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-3 py-1 rounded-full uppercase tracking-wider">
          Transparent Price Directory
        </span>
        <h1 className="text-3xl font-extrabold text-slate-900">
          ডায়াগনস্টিক টেস্ট ফি ও DMB ডিসকাউন্ট মূল্য তালিকা
        </h1>
        <p className="text-xs sm:text-sm text-slate-600">
          স্বচ্ছতার সাথে প্রতিটি প্যাথলজি ও ইমেজিং টেস্টের নিয়মিত রেট ও DMB কার্ডধারীদের জন্য ছাড়কৃত মূল্য নিচে অনুসন্ধান করুন।
        </p>
      </div>

      {/* Search & Filter */}
      <div className="max-w-5xl mx-auto bg-white rounded-2xl p-4 border border-slate-200 shadow-sm flex flex-col md:flex-row gap-4 items-center justify-between">
        
        <div className="relative flex-1 w-full">
          <Search className="w-5 h-5 text-slate-400 absolute left-3.5 top-3" />
          <input
            type="text"
            placeholder="টেস্টের নাম দিয়ে খুঁজুন (e.g. CBC, Lipid, USG)..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full pl-11 pr-4 py-2.5 rounded-xl border border-slate-200 text-xs bg-slate-50 text-slate-900 focus:ring-2 focus:ring-blue-500 focus:outline-none"
          />
        </div>

        <div className="flex items-center gap-2 overflow-x-auto w-full md:w-auto pb-2 md:pb-0">
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition cursor-pointer ${
                selectedCategory === cat ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              {cat === 'ALL' ? 'সকল টেস্ট' : cat}
            </button>
          ))}
        </div>

      </div>

      {/* Price Table */}
      <div className="max-w-5xl mx-auto bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-900 text-slate-200 font-bold uppercase tracking-wider">
              <tr>
                <th className="p-4">টেস্টের নাম (Test Name)</th>
                <th className="p-4">ক্যাটাগরি</th>
                <th className="p-4 text-right">নিয়মিত মূল্য</th>
                <th className="p-4 text-right">DMB বিশেষ মূল্য</th>
                <th className="p-4 text-right">আপনার সাশ্রয়</th>
                <th className="p-4 text-center">আবেদন</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium">
              {filteredTests.map((test, index) => (
                <tr key={test.id} className={index % 2 === 0 ? 'bg-white' : 'bg-slate-50/50'}>
                  <td className="p-4 font-bold text-slate-900">
                    {test.name}
                    {test.popular && (
                      <span className="ml-2 text-[9px] bg-amber-100 text-amber-800 px-1.5 py-0.5 rounded font-semibold">
                        জনপ্রিয়
                      </span>
                    )}
                  </td>
                  <td className="p-4 text-slate-500">{test.category}</td>
                  <td className="p-4 text-right font-mono text-slate-400 line-through">
                    ৳{test.regularPrice}
                  </td>
                  <td className="p-4 text-right font-mono font-black text-emerald-700 text-sm">
                    ৳{test.dmbPrice}
                  </td>
                  <td className="p-4 text-right font-mono font-bold text-blue-700">
                    ৳{test.savings}
                  </td>
                  <td className="p-4 text-center">
                    <button
                      onClick={() => setActiveTab('apply')}
                      className="px-3 py-1.5 rounded-lg bg-emerald-50 text-emerald-700 hover:bg-emerald-600 hover:text-white font-bold text-[11px] border border-emerald-200 transition cursor-pointer"
                    >
                      কার্ড পান
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
};
