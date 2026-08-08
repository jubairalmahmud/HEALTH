import React, { useState } from 'react';
import { Search, MapPin, Phone, Mail, Percent, Building2, CheckCircle2, ExternalLink, Globe } from 'lucide-react';
import { DiagnosticCenter } from '../types';
import { BANGLADESH_GEO_DATA } from '../data/bangladeshGeo';

interface Props {
  centers: DiagnosticCenter[];
}

export const DiagnosticCentersPage: React.FC<Props> = ({ centers }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDivision, setSelectedDivision] = useState('ALL');
  const [selectedDistrict, setSelectedDistrict] = useState('ALL');

  // Selected Division object to populate district options dynamically
  const activeGeoDivision = BANGLADESH_GEO_DATA.find(d => d.nameEn === selectedDivision);

  const filteredCenters = centers.filter(c => {
    const matchesSearch = c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          c.address.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          c.upazila.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesDivision = selectedDivision === 'ALL' || c.division === selectedDivision;
    const matchesDistrict = selectedDistrict === 'ALL' || c.district === selectedDistrict;
    
    return matchesSearch && matchesDivision && matchesDistrict;
  });

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 py-10 px-4 sm:px-6 lg:px-8 space-y-8">
      
      {/* Header */}
      <div className="max-w-4xl mx-auto text-center space-y-2">
        <span className="text-xs font-bold text-sky-700 bg-sky-100 px-3.5 py-1 rounded-full uppercase tracking-wider inline-flex items-center gap-1.5">
          <Globe className="w-3.5 h-3.5" /> HEALTH PARTNER NETWORK
        </span>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900">
          সারাদেশের পার্টনার ডায়াগনস্টিক সেন্টার নেটওয়ার্ক
        </h1>
        <p className="text-xs sm:text-sm text-slate-600 max-w-2xl mx-auto">
          বিভাগ ও জেলা অনুযায়ী আপনার নিকটস্থ নিবন্ধিত হাসপাতাল ও প্যাথলজি ল্যাব খুঁজে নিন এবং DMB মেডিক্যাল কার্ডে ৩০% নিশ্চিত মূল্যছাড় পান।
        </p>
      </div>

      {/* Search & Dynamic Division & District Filter Bar */}
      <div className="max-w-5xl mx-auto bg-white rounded-2xl p-4 border border-slate-200 shadow-sm flex flex-col md:flex-row gap-3 items-center justify-between">
        
        {/* Search Input */}
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
          <input
            type="text"
            placeholder="সেন্টারের নাম, এলাকা বা থানা দিয়ে খুঁজুন..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 rounded-xl border border-slate-200 text-xs bg-slate-50 text-slate-900 focus:ring-2 focus:ring-sky-500 focus:outline-none"
          />
        </div>

        {/* Division & District Select Dropdowns */}
        <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
          
          {/* Division Filter */}
          <div className="flex items-center gap-1.5 flex-1 sm:flex-initial">
            <span className="text-xs font-bold text-slate-700 flex-shrink-0">বিভাগ:</span>
            <select
              value={selectedDivision}
              onChange={e => {
                setSelectedDivision(e.target.value);
                setSelectedDistrict('ALL');
              }}
              className="p-2 rounded-xl border border-slate-200 text-xs bg-slate-50 text-slate-900 font-bold focus:ring-2 focus:ring-sky-500 focus:outline-none cursor-pointer w-full sm:w-auto"
            >
              <option value="ALL">সকল বিভাগ (All Divisions)</option>
              {BANGLADESH_GEO_DATA.map(div => (
                <option key={div.id} value={div.nameEn}>
                  {div.nameBn} ({div.nameEn})
                </option>
              ))}
            </select>
          </div>

          {/* District Filter */}
          <div className="flex items-center gap-1.5 flex-1 sm:flex-initial">
            <span className="text-xs font-bold text-slate-700 flex-shrink-0">জেলা:</span>
            <select
              value={selectedDistrict}
              onChange={e => setSelectedDistrict(e.target.value)}
              className="p-2 rounded-xl border border-slate-200 text-xs bg-slate-50 text-slate-900 font-bold focus:ring-2 focus:ring-sky-500 focus:outline-none cursor-pointer w-full sm:w-auto"
            >
              <option value="ALL">সকল জেলা (All Districts)</option>
              {activeGeoDivision ? (
                activeGeoDivision.districts.map(dist => (
                  <option key={dist.nameEn} value={dist.nameEn}>
                    {dist.nameBn} ({dist.nameEn})
                  </option>
                ))
              ) : (
                // Show all districts if ALL divisions selected
                BANGLADESH_GEO_DATA.flatMap(d => d.districts).map(dist => (
                  <option key={dist.nameEn} value={dist.nameEn}>
                    {dist.nameBn} ({dist.nameEn})
                  </option>
                ))
              )}
            </select>
          </div>

        </div>

      </div>

      {/* Results Count & Quick Reset */}
      <div className="max-w-5xl mx-auto flex items-center justify-between text-xs text-slate-500">
        <p>মোট নিবন্ধিত সেন্টার পাওয়া গেছে: <span className="font-bold text-slate-900">{filteredCenters.length} টি</span></p>
        {(selectedDivision !== 'ALL' || selectedDistrict !== 'ALL' || searchQuery) && (
          <button
            onClick={() => {
              setSelectedDivision('ALL');
              setSelectedDistrict('ALL');
              setSearchQuery('');
            }}
            className="text-sky-600 hover:underline font-bold cursor-pointer"
          >
            ফিল্টার রিসেট করুন ↺
          </button>
        )}
      </div>

      {/* Centers Grid */}
      <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredCenters.map(center => (
          <div
            key={center.id}
            className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm hover:shadow-md transition flex flex-col justify-between space-y-4"
          >
            <div className="space-y-3">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <span className="inline-block px-2 py-0.5 rounded bg-sky-100 text-sky-900 font-mono font-bold text-[10px] mb-1">
                    {center.upazila}, {center.district} {center.division ? `(${center.division})` : ''}
                  </span>
                  <h3 className="font-bold text-slate-900 text-base leading-snug">
                    {center.name}
                  </h3>
                </div>
                <div className="text-center px-2.5 py-1.5 rounded-xl bg-emerald-500 text-white font-black text-sm shadow-sm flex-shrink-0">
                  {center.discountPercentage}%
                  <span className="block text-[9px] font-normal uppercase">ছাড়</span>
                </div>
              </div>

              <p className="text-xs text-slate-600 flex items-start gap-1.5">
                <MapPin className="w-4 h-4 text-slate-400 flex-shrink-0 mt-0.5" />
                <span>{center.address}</span>
              </p>

              <div className="space-y-1 pt-2 border-t border-slate-100">
                <span className="text-[11px] font-bold text-slate-700 block">উপলব্ধ সেবাসমূহ:</span>
                <div className="flex flex-wrap gap-1">
                  {center.availableServices.map((service, i) => (
                    <span key={i} className="text-[10px] px-2 py-0.5 rounded bg-slate-100 text-slate-700">
                      {service}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            <div className="pt-3 border-t border-slate-100 space-y-2 text-xs">
              <div className="flex items-center justify-between text-slate-500">
                <span className="flex items-center gap-1 font-mono">
                  <Phone className="w-3.5 h-3.5 text-sky-600" /> {center.mobile}
                </span>
                <span className="text-emerald-600 font-semibold text-[11px] flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" /> DMB Partner
                </span>
              </div>

              {center.googleMapUrl && (
                <a
                  href={center.googleMapUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="w-full py-2 rounded-xl bg-slate-50 hover:bg-slate-100 text-sky-700 font-bold text-[11px] flex items-center justify-center gap-1 transition"
                >
                  <MapPin className="w-3.5 h-3.5" /> গুগল ম্যাপে লোকেশন দেখুন <ExternalLink className="w-3 h-3" />
                </a>
              )}
            </div>

          </div>
        ))}
      </div>

    </div>
  );
};
