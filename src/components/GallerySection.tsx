import React, { useState } from 'react';
import { Image, Eye, X, ChevronRight, Award, CheckCircle2 } from 'lucide-react';

interface GalleryItem {
  id: string;
  title: string;
  category: 'card' | 'lab' | 'camp' | 'patient';
  categoryLabel: string;
  location: string;
  date: string;
  imageUrl: string;
  description: string;
}

export const GallerySection: React.FC = () => {
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [selectedImage, setSelectedImage] = useState<GalleryItem | null>(null);

  const galleryItems: GalleryItem[] = [
    {
      id: 'g1',
      title: 'দেশব্যাপী মেডিক্যাল কার্ড বিতরণ কার্যক্রম',
      category: 'card',
      categoryLabel: 'কার্ড বিতরণ',
      location: 'খুলনা ও ঢাকা বিভাগীয় অফিস',
      date: '১৫ ফেব্রুয়ারি, ২০২৬',
      imageUrl: 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?auto=format&fit=crop&q=80&w=800',
      description: 'ডিজিটাল মিডিয়া ব্রিজ (DMB) এর উদ্যোগে নতুন ডিজিটাল হেলথ মেম্বারদের মাঝে সিলভার, গোল্ড ও প্লাটিনাম মেডিক্যাল কার্ড আনুষ্ঠানিকভাবে হস্তান্তর করা হচ্ছে।'
    },
    {
      id: 'g2',
      title: 'পার্টনার ডায়াগনস্টিক সেন্টারে আধুনিক ৩T MRI ও প্যাথলজি',
      category: 'lab',
      categoryLabel: 'পার্টনার ল্যাব',
      location: 'পপুলার ও ইবনে সিনা ল্যাব',
      date: '১০ ফেব্রুয়ারি, ২০২৬',
      imageUrl: 'https://images.unsplash.com/photo-1516549655169-df83a0774514?auto=format&fit=crop&q=80&w=800',
      description: 'ডিএমবি হেলথ কার্ডধারী রোগীরা পপুলার ও ইবনে সিনার আধুনিক ডায়াগনস্টিক ল্যাবে ৩০% নিশ্চিত ডিসকাউন্ট সুবিধা উপভোগ করছেন।'
    },
    {
      id: 'g3',
      title: 'বিনামূল্যে স্বাস্থ্য পরীক্ষা ও ব্লাড গ্রুপ নির্ণয় ক্যাম্প',
      category: 'camp',
      categoryLabel: 'স্বাস্থ্য ক্যাম্প',
      location: 'সিলেট, নড়াইল ও গোপালগঞ্জ',
      date: '২৮ জানুয়ারি, ২০২৬',
      imageUrl: 'https://images.unsplash.com/photo-1584515979956-d9f6e5d09982?auto=format&fit=crop&q=80&w=800',
      description: 'সারাদেশে পর্যায়ক্রমে প্রান্তিক মানুষের স্বাস্থ্যসেবা নিশ্চিত করতে ফ্রি মেডিকেল চেকআপ ক্যাম্প ও তাৎক্ষণিক মেডিক্যাল কার্ড রেজিস্ট্রেশন কার্যক্রম।'
    },
    {
      id: 'g4',
      title: 'ক্যাশলেস বিলিং হেল্পডেস্ক ও কিউআর কোড স্ক্যান',
      category: 'patient',
      categoryLabel: 'রোগী সেবা',
      location: 'ডিএমবি পার্টনার কাউন্টার',
      date: '০৫ জানুয়ারি, ২০২৬',
      imageUrl: 'https://images.unsplash.com/photo-1538108149393-fbbd81895907?auto=format&fit=crop&q=80&w=800',
      description: 'হাসপাতাল ও ল্যাব কাউন্টারে ডিজিটাল কিউআর কোড স্ক্যান করে তাত্ক্ষণিক ছাড় ও রসিদ গ্রহণের সহজ ও নিরাপদ পদ্ধতি।'
    },
    {
      id: 'g5',
      title: 'পার্টনার প্যাথলজি সেন্টারের প্রতিনিধি সম্মেলন',
      category: 'lab',
      categoryLabel: 'পার্টনার ল্যাব',
      location: 'ডিএমবি প্রধান কার্যালয়',
      date: '১২ ডিসেম্বর, ২০২৫',
      imageUrl: 'https://images.unsplash.com/photo-1527613426441-4da17471b66d?auto=format&fit=crop&q=80&w=800',
      description: 'বাংলাদেশের আটটি বিভাগের সেরা ডায়াগনস্টিক সেন্টারের সাথে স্বাস্থ্যসেবার মান বৃদ্ধি ও সর্বোচ্চ ডিসকাউন্ট বাস্তবায়নের দ্বিপাক্ষিক আলোচনা।'
    },
    {
      id: 'g6',
      title: 'পারিবারিক হেলথ প্যাকেজ গ্রহণকারী সম্মানিত পরিবার',
      category: 'card',
      categoryLabel: 'কার্ড বিতরণ',
      location: 'সিলেট জিন্দাবাজার সার্ভিস ডেস্ক',
      date: '১৮ ডিসেম্বর, ২০২৫',
      imageUrl: 'https://images.unsplash.com/photo-1581595220892-b0739db3ba8c?auto=format&fit=crop&q=80&w=800',
      description: '৮ জন সদস্য কভারেজ সম্বলিত প্লাটিনাম কার্ড পেয়ে ডিজিটাল স্বাস্থ্যসেবা গ্রহণের অভিপ্রায়ে গ্রাহক পরিবারের বিশেষ প্রতিক্রিয়া।'
    }
  ];

  const filteredItems = activeCategory === 'all'
    ? galleryItems
    : galleryItems.filter(item => item.category === activeCategory);

  return (
    <section className="py-12 bg-gradient-to-b from-slate-900 to-slate-950 text-white relative overflow-hidden border-t border-slate-800">
      
      {/* Decorative backdrop */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-sky-500/10 rounded-full blur-3xl pointer-events-none"></div>
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none"></div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 space-y-8">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-slate-800/80 pb-6">
          <div className="space-y-2 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-sky-500/10 border border-sky-400/30 text-sky-300 text-xs font-bold uppercase tracking-wider">
              <Image className="w-3.5 h-3.5" /> DMB HEALTHCARE GALLERY
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-white">
              কার্যক্রম ও ইভেন্ট গ্যালারি
            </h2>
            <p className="text-xs sm:text-sm text-slate-300">
              সারাদেশে ডিজিটাল মিডিয়া ব্রিজের চিকিৎসা সেবা বিস্তার, মেডিক্যাল কার্ড বিতরণ ও স্বাস্থ্য ক্যাম্পের বাস্তব মুহূর্তসমূহ।
            </p>
          </div>

          {/* Filter Chips */}
          <div className="flex flex-wrap items-center gap-1.5">
            {[
              { id: 'all', label: 'সকল ছবি' },
              { id: 'card', label: 'কার্ড বিতরণ' },
              { id: 'lab', label: 'পার্টনার ল্যাব' },
              { id: 'camp', label: 'স্বাস্থ্য ক্যাম্প' },
              { id: 'patient', label: 'রোগী সেবা' }
            ].map(cat => (
              <button
                key={cat.id}
                onClick={() => setActiveCategory(cat.id)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer ${
                  activeCategory === cat.id
                    ? 'bg-sky-500 text-white shadow-lg shadow-sky-500/20 ring-2 ring-sky-300'
                    : 'bg-slate-800/80 hover:bg-slate-700 text-slate-300 border border-slate-700'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>
        </div>

        {/* Gallery Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredItems.map(item => (
            <div
              key={item.id}
              onClick={() => setSelectedImage(item)}
              className="group bg-slate-800/60 rounded-2xl overflow-hidden border border-slate-700/60 hover:border-sky-500/50 transition duration-300 shadow-md hover:shadow-xl cursor-pointer flex flex-col"
            >
              <div className="relative aspect-video overflow-hidden bg-slate-900">
                <img
                  src={item.imageUrl}
                  alt={item.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
                  loading="lazy"
                  referrerPolicy="no-referrer"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent opacity-60 group-hover:opacity-40 transition"></div>
                
                <span className="absolute top-3 left-3 bg-slate-900/80 backdrop-blur-md text-sky-300 text-[10px] font-bold px-2.5 py-1 rounded-full border border-sky-500/30">
                  {item.categoryLabel}
                </span>

                <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition">
                  <span className="w-10 h-10 rounded-full bg-sky-500 text-white flex items-center justify-center shadow-lg transform scale-75 group-hover:scale-100 transition duration-300">
                    <Eye className="w-5 h-5" />
                  </span>
                </div>
              </div>

              <div className="p-4 space-y-2 flex-1 flex flex-col justify-between">
                <div>
                  <h3 className="text-sm font-bold text-white group-hover:text-sky-300 transition line-clamp-1">
                    {item.title}
                  </h3>
                  <p className="text-xs text-slate-400 line-clamp-2 mt-1">
                    {item.description}
                  </p>
                </div>

                <div className="pt-3 border-t border-slate-700/50 flex items-center justify-between text-[11px] text-slate-400 font-medium">
                  <span>📍 {item.location}</span>
                  <span className="text-slate-500 font-mono">{item.date}</span>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Modal Lightbox */}
        {selectedImage && (
          <div className="fixed inset-0 z-50 bg-slate-950/90 backdrop-blur-md flex items-center justify-center p-4">
            <div className="bg-slate-900 border border-slate-700 rounded-3xl max-w-3xl w-full overflow-hidden shadow-2xl relative animate-in fade-in zoom-in duration-200">
              
              <button
                onClick={() => setSelectedImage(null)}
                className="absolute top-4 right-4 z-10 w-9 h-9 rounded-full bg-slate-800 text-white hover:bg-rose-600 flex items-center justify-center transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="aspect-video w-full bg-black relative">
                <img
                  src={selectedImage.imageUrl}
                  alt={selectedImage.title}
                  className="w-full h-full object-contain"
                />
              </div>

              <div className="p-6 space-y-3">
                <div className="flex items-center gap-2">
                  <span className="bg-sky-500/20 text-sky-300 text-xs font-bold px-3 py-0.5 rounded-full border border-sky-500/40">
                    {selectedImage.categoryLabel}
                  </span>
                  <span className="text-xs text-slate-400 font-mono">📍 {selectedImage.location} • {selectedImage.date}</span>
                </div>

                <h3 className="text-xl font-bold text-white">
                  {selectedImage.title}
                </h3>

                <p className="text-xs text-slate-300 leading-relaxed">
                  {selectedImage.description}
                </p>

                <div className="pt-3 border-t border-slate-800 flex items-center justify-between">
                  <div className="flex items-center gap-1.5 text-xs text-emerald-400 font-semibold">
                    <CheckCircle2 className="w-4 h-4" /> DMB Verified Official Activity
                  </div>
                  <button
                    onClick={() => setSelectedImage(null)}
                    className="px-4 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs transition cursor-pointer"
                  >
                    বন্ধ করুন
                  </button>
                </div>
              </div>

            </div>
          </div>
        )}

      </div>
    </section>
  );
};
