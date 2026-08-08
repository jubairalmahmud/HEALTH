import React, { useState } from 'react';
import { ChevronDown, HelpCircle, Search } from 'lucide-react';
import { FaqItem } from '../types';

interface Props {
  faqs: FaqItem[];
}

export const FaqPage: React.FC<Props> = ({ faqs }) => {
  const [activeCategory, setActiveCategory] = useState<string>('ALL');
  const [openId, setOpenId] = useState<string | null>(faqs[0]?.id || null);
  const [search, setSearch] = useState('');

  const categories = ['ALL', 'Medical Card', 'Discount', 'Partner', 'General'];

  const filtered = faqs.filter(f => {
    const matchCat = activeCategory === 'ALL' || f.category === activeCategory;
    const matchSearch = f.question.toLowerCase().includes(search.toLowerCase()) || f.answer.toLowerCase().includes(search.toLowerCase());
    return matchCat && matchSearch;
  });

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 py-12 px-4 sm:px-6 lg:px-8 space-y-10">
      
      {/* Header */}
      <div className="max-w-3xl mx-auto text-center space-y-2">
        <span className="text-xs font-bold text-blue-600 bg-blue-50 px-3 py-1 rounded-full uppercase tracking-wider">
          Frequently Asked Questions
        </span>
        <h1 className="text-3xl font-extrabold text-slate-900">
          সাধারণ জিজ্ঞাসাসমূহ (FAQ)
        </h1>
        <p className="text-xs sm:text-sm text-slate-600">
          DMB ডিজিটাল মেডিক্যাল কার্ড, ডিসকাউন্ট প্রক্রিয়া এবং পার্টনার সম্পর্কিত সাধারণ প্রশ্নের উত্তরসমূহ।
        </p>
      </div>

      {/* Filter Tabs */}
      <div className="max-w-2xl mx-auto flex flex-wrap justify-center gap-2">
        {categories.map(cat => (
          <button
            key={cat}
            onClick={() => setActiveCategory(cat)}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition cursor-pointer ${
              activeCategory === cat ? 'bg-blue-600 text-white' : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'
            }`}
          >
            {cat === 'ALL' ? 'সব প্রশ্ন' : cat}
          </button>
        ))}
      </div>

      {/* Accordion List */}
      <div className="max-w-3xl mx-auto space-y-3">
        {filtered.map(faq => {
          const isOpen = openId === faq.id;
          return (
            <div
              key={faq.id}
              className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden transition"
            >
              <button
                onClick={() => setOpenId(isOpen ? null : faq.id)}
                className="w-full text-left p-5 flex items-center justify-between gap-4 font-bold text-slate-900 text-sm hover:bg-slate-50 transition cursor-pointer"
              >
                <div className="flex items-center gap-2">
                  <HelpCircle className="w-4 h-4 text-blue-600 flex-shrink-0" />
                  <span>{faq.question}</span>
                </div>
                <ChevronDown className={`w-5 h-5 text-slate-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
              </button>

              {isOpen && (
                <div className="px-5 pb-5 text-xs text-slate-600 leading-relaxed border-t border-slate-100 pt-3 bg-slate-50/50">
                  {faq.answer}
                </div>
              )}
            </div>
          );
        })}
      </div>

    </div>
  );
};
