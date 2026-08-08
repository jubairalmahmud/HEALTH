import React, { useEffect, useState } from 'react';
import { fetchJsonSafe } from '../utils/api';
import { ImageIcon, Calendar, MapPin, Sparkles, Filter } from 'lucide-react';
import { DynamicPageContent } from '../types';

interface Props {
  setActiveTab: (tab: string) => void;
}

export const EventGalleryPage: React.FC<Props> = ({ setActiveTab }) => {
  const [events, setEvents] = useState<DynamicPageContent['eventGallery']>([
    {
      id: 'EVT-01',
      title: 'গোপালগঞ্জ ফ্রী মেডিক্যাল এন্ড হেলথ ক্যাম্প ২০২৬',
      imageUrl: 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?auto=format&fit=crop&w=800&q=80',
      date: '১৫ জানুয়ারি ২০২৬',
      location: 'গোপালগঞ্জ সদর হাসপাতাল রোড',
      category: 'Medical Camp'
    },
    {
      id: 'EVT-02',
      title: 'ডিজিটাল মেডিক্যাল কার্ড বিতরণ উদ্বোধনী অনুষ্ঠান',
      imageUrl: 'https://images.unsplash.com/photo-1584515979956-d9f6e5d09982?auto=format&fit=crop&w=800&q=80',
      date: '২০ ফেব্রুয়ারি ২০২৬',
      location: 'টুঙ্গিপাড়া উপজেলা পরিষদ অডিটোরিয়াম',
      category: 'Card Distribution'
    },
    {
      id: 'EVT-03',
      title: 'পার্টনার ডায়াগনস্টিক ও প্যাথলজিস্ট সম্মেলন',
      imageUrl: 'https://images.unsplash.com/photo-1516549655169-df83a0774514?auto=format&fit=crop&w=800&q=80',
      date: '১০ মার্চ ২০২৬',
      location: 'ফরিদপুর মেডিকেল ক্লাব অডিটোরিয়াম',
      category: 'Conference'
    }
  ]);

  const [filterCategory, setFilterCategory] = useState<string>('ALL');

  useEffect(() => {
    fetchJsonSafe('/api/page-content').then(data => {
      if (data && data.eventGallery && Array.isArray(data.eventGallery)) {
        setEvents(data.eventGallery);
      }
    });
  }, []);

  const categories = ['ALL', ...Array.from(new Set(events.map(e => e.category || 'General')))];

  const filteredEvents = filterCategory === 'ALL'
    ? events
    : events.filter(e => (e.category || 'General') === filterCategory);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 py-12 px-4 sm:px-6 lg:px-8 space-y-10">
      
      {/* Header */}
      <div className="max-w-4xl mx-auto text-center space-y-3">
        <span className="text-xs font-bold text-purple-600 bg-purple-50 px-3 py-1 rounded-full uppercase tracking-wider">
          Event & Activity Photo Gallery
        </span>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900">
          আমাদের ইভেন্ট ও ফটো গ্যালারি
        </h1>
        <p className="text-sm text-slate-600 leading-relaxed max-w-2xl mx-auto">
          ডিজিটাল মিডিয়া ব্রিজের ফ্রী মেডিক্যাল ক্যাম্প, ডিজিটাল কার্ড বিতরণ সভা ও পার্টনার প্যাথলজি সম্মেলনের কিছু স্মরণীয় মুহূর্ত।
        </p>
      </div>

      {/* Category Filter */}
      <div className="max-w-6xl mx-auto flex flex-wrap items-center justify-center gap-2">
        {categories.map(cat => (
          <button
            key={cat}
            onClick={() => setFilterCategory(cat)}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition cursor-pointer ${
              filterCategory === cat
                ? 'bg-purple-700 text-white shadow-md'
                : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-100'
            }`}
          >
            {cat === 'ALL' ? 'সকল ইভেন্ট' : cat}
          </button>
        ))}
      </div>

      {/* Grid */}
      <div className="max-w-6xl mx-auto grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
        {filteredEvents.map(evt => (
          <div
            key={evt.id}
            className="bg-white rounded-3xl overflow-hidden border border-slate-200 shadow-sm hover:shadow-lg transition-all duration-300 group flex flex-col justify-between"
          >
            <div>
              <div className="h-52 overflow-hidden relative">
                <img
                  src={evt.imageUrl}
                  alt={evt.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <span className="absolute top-3 left-3 bg-purple-600 text-white font-bold text-[10px] px-3 py-1 rounded-full shadow">
                  {evt.category || 'Event'}
                </span>
              </div>

              <div className="p-5 space-y-2">
                <h3 className="font-extrabold text-slate-900 text-base group-hover:text-purple-700 transition-colors leading-snug">
                  {evt.title}
                </h3>
                <div className="flex flex-col gap-1 text-xs text-slate-500 font-medium pt-1">
                  <span className="flex items-center gap-1.5"><Calendar className="w-3.5 h-3.5 text-purple-600" /> {evt.date}</span>
                  <span className="flex items-center gap-1.5"><MapPin className="w-3.5 h-3.5 text-rose-500" /> {evt.location}</span>
                </div>
              </div>
            </div>

            <div className="p-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between text-xs">
              <span className="text-[10px] font-mono text-slate-400">ID: {evt.id}</span>
              <span className="text-purple-700 font-bold flex items-center gap-1 text-[11px]">
                <Sparkles className="w-3.5 h-3.5" /> DMB Event
              </span>
            </div>
          </div>
        ))}
      </div>

    </div>
  );
};
