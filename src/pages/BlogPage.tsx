import React, { useState } from 'react';
import { BlogArticle } from '../types';
import { Search, Calendar, User, Clock, Tag, X } from 'lucide-react';

interface Props {
  blogs: BlogArticle[];
}

export const BlogPage: React.FC<Props> = ({ blogs }) => {
  const [selectedBlog, setSelectedBlog] = useState<BlogArticle | null>(null);
  const [search, setSearch] = useState('');

  const filtered = blogs.filter(b => b.title.toLowerCase().includes(search.toLowerCase()) || b.summary.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 py-12 px-4 sm:px-6 lg:px-8 space-y-10">
      
      {/* Header */}
      <div className="max-w-4xl mx-auto text-center space-y-2">
        <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-3 py-1 rounded-full uppercase tracking-wider">
          Health Tips & Articles
        </span>
        <h1 className="text-3xl font-extrabold text-slate-900">
          স্বাস্থ্য সচেতনতা নিবন্ধ ও ডায়াগনস্টিক তথ্য
        </h1>
        <p className="text-xs sm:text-sm text-slate-600">
          অভিজ্ঞ চিকিৎসক ও স্বাস্থ্য বিশেষজ্ঞদের পরামর্শ এবং প্রয়োজনীয় ডায়াগনস্টিক গাইডলাইন।
        </p>
      </div>

      {/* Grid */}
      <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-6">
        {filtered.map(blog => (
          <div
            key={blog.id}
            onClick={() => setSelectedBlog(blog)}
            className="bg-white rounded-3xl overflow-hidden border border-slate-200 shadow-sm hover:shadow-md transition cursor-pointer group flex flex-col justify-between"
          >
            <div>
              <div className="h-48 overflow-hidden relative">
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
                <div className="flex items-center gap-3 text-[10px] text-slate-400 font-mono">
                  <span className="flex items-center gap-1"><Calendar className="w-3 h-3" /> {blog.date}</span>
                  <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> {blog.readTime}</span>
                </div>

                <h3 className="font-bold text-slate-900 text-base group-hover:text-blue-600 transition-colors leading-snug">
                  {blog.title}
                </h3>

                <p className="text-xs text-slate-500 leading-relaxed line-clamp-3">
                  {blog.summary}
                </p>
              </div>
            </div>

            <div className="p-5 pt-0 text-xs font-bold text-blue-600 flex items-center justify-between">
              <span>সম্পূর্ণ পড়ুন →</span>
              <span className="text-[10px] font-normal text-slate-400">{blog.author}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Detail Modal */}
      {selectedBlog && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-2xl w-full border border-slate-200 shadow-2xl p-6 sm:p-8 space-y-5 my-8 max-h-[90vh] overflow-y-auto relative animate-fadeIn">
            <button
              onClick={() => setSelectedBlog(null)}
              className="absolute top-4 right-4 p-2 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-700 cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <span className="inline-block px-2.5 py-0.5 rounded-full bg-blue-100 text-blue-800 font-bold text-[10px]">
              {selectedBlog.category}
            </span>

            <h2 className="text-2xl font-extrabold text-slate-900 leading-snug">{selectedBlog.title}</h2>

            <div className="flex items-center gap-4 text-xs text-slate-500 border-y border-slate-100 py-2">
              <span>লেখক: <strong className="text-slate-800">{selectedBlog.author}</strong></span>
              <span>তারিখ: {selectedBlog.date}</span>
            </div>

            <div className="rounded-2xl overflow-hidden h-60">
              <img src={selectedBlog.imageUrl} alt={selectedBlog.title} className="w-full h-full object-cover" />
            </div>

            <div className="text-xs sm:text-sm text-slate-700 leading-relaxed whitespace-pre-line space-y-3">
              {selectedBlog.content}
            </div>

            <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
              <div className="flex flex-wrap gap-1">
                {selectedBlog.tags.map(t => (
                  <span key={t} className="text-[10px] px-2 py-0.5 rounded bg-slate-100 text-slate-600">
                    #{t}
                  </span>
                ))}
              </div>
              <button
                onClick={() => setSelectedBlog(null)}
                className="px-4 py-2 rounded-xl bg-slate-900 text-white font-bold text-xs cursor-pointer"
              >
                বন্ধ করুন
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
