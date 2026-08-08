import React, { useState, useEffect } from 'react';
import { TeamMember } from '../types';
import { 
  Users, 
  Mail, 
  Linkedin, 
  Phone, 
  MapPin, 
  Award, 
  Search, 
  Briefcase, 
  HeartHandshake, 
  ShieldCheck,
  ChevronRight,
  UserCheck
} from 'lucide-react';

const DEFAULT_TEAM_MEMBERS: TeamMember[] = [
  // Section 1: নেতৃত্বে ও ব্যবস্থাপনায়
  {
    id: 'm1',
    name: 'ড. রফিকুল ইসলাম',
    designation: 'নির্বাহী পরিচালক (Executive Director)',
    category: 'management',
    image: 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?auto=format&fit=crop&q=80&w=400',
    education: 'MBBS (DMC), MPH (DU)',
    email: 'director@nit.bd',
    phone: '+880 1711-000001',
    linkedin: 'https://linkedin.com',
    experience: '১৫+ বছরের জনস্বাস্থ্য ব্যবস্থাপনা অভিজ্ঞতা',
    bio: 'প্রান্তিক জনগোষ্ঠীর দৌড়গোড়ায় আধুনিক ডিজিটাল স্বাস্থ্যসেবা পৌঁছে দেওয়ার ব্রত নিয়ে DMB প্রজেক্টের নেতৃত্ব দিচ্ছেন।'
  },
  {
    id: 'm2',
    name: 'মাহফুজ আহমেদ',
    designation: 'প্রজেক্ট ডিরেক্টর (Project Director)',
    category: 'management',
    image: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&q=80&w=400',
    education: 'M.Sc in Health Economics (DU)',
    email: 'project.lead@nit.bd',
    phone: '+880 1711-000002',
    linkedin: 'https://linkedin.com',
    experience: '১২+ বছরের প্রজেক্ট কো-অর্ডিনেশন অভিজ্ঞতা',
    bio: 'মাঠপর্যায়ে হাসপাতাল ও ডায়াগনস্টিক সেন্টারের সাথে অংশীদারিত্ব প্রতিষ্ঠা ও নেটওয়ার্ক সচল রাখায় নিয়োজিত।'
  },
  {
    id: 'm3',
    name: 'ডা. ফারহানা শারমিন',
    designation: 'চিফ মেডিকেল অফিসার (Chief Medical Officer)',
    category: 'management',
    image: 'https://images.unsplash.com/photo-1594824813566-78a0505f5737?auto=format&fit=crop&q=80&w=400',
    education: 'MBBS, DGO, FCPS (Part-2)',
    email: 'cmo@nit.bd',
    phone: '+880 1711-000003',
    linkedin: 'https://linkedin.com',
    experience: '১০+ বছরের ক্লিনিক্যাল অভিজ্ঞতা',
    bio: 'মেডিক্যাল কার্ডধারীদের সর্বোচ্চ মানের সেবা নিশ্চিতকরণ ও কোয়ালিটি কন্ট্রোল টিম পরিচালনা করেন।'
  },
  {
    id: 'm4',
    name: 'এস. এম. রেজওয়ান',
    designation: 'হেড অফ অপারেশনস (Head of Operations)',
    category: 'management',
    image: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&q=80&w=400',
    education: 'MBA (DU)',
    email: 'operations@nit.bd',
    phone: '+880 1711-000004',
    linkedin: 'https://linkedin.com',
    experience: '৮+ বছরের অপারেশনাল লজিস্টিকস পরিচালনা',
    bio: 'ডিজিটাল কার্ড ইস্যুয়েন্স, ভেরিফিকেশন ও অ্যাডমিন নেটওয়ার্কের নির্বিঘ্ন অপারেশন পরিচালনা করছেন।'
  },
  {
    id: 'm5',
    name: 'জসিম উদ্দিন',
    designation: 'কো-অর্ডিনেটর, হেলথ কেয়ার নেটওয়ার্ক',
    category: 'management',
    image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=400',
    education: 'B.Sc in Public Health',
    email: 'network@nit.bd',
    phone: '+880 1711-000005',
    linkedin: 'https://linkedin.com',
    experience: '৭+ বছরের পার্টনারশিপ কো-অর্ডিনেশন',
    bio: 'গোপালগঞ্জ, সিলেট ও নড়াইলের পার্টনার ল্যাব ও হাসপাতালের টেস্ট ফি ও ডিসকাউন্ট মনিটরিংয়ে দায়িত্বপ্রাপ্ত।'
  },
  {
    id: 'm6',
    name: 'তানজিনা বেগম',
    designation: 'হেড অফ আইটি ও ডিজিটাল পোর্টাল',
    category: 'management',
    image: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=400',
    education: 'B.Sc in CSE (BUET)',
    email: 'it@nit.bd',
    phone: '+880 1711-000006',
    linkedin: 'https://linkedin.com',
    experience: '৬+ বছরের সফটওয়্যার ও হেলথ-টেক ডেভেলপমেন্ট',
    bio: 'ডিজিটাল কার্ডের QR কোড সিকিউরিটি, সার্ভার ডাটাবেজ এবং মোবাইল পোর্টাইবিলিটি ডেভেলপমেন্টে নিয়োজিত।'
  },

  // Section 2: মাঠপর্যায়ে ও সেবাদানে
  {
    id: 'f1',
    name: 'মোঃ শামসুল হক',
    designation: 'সিনিয়র ফিল্ড অফিসার',
    category: 'field',
    image: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=400',
    locationServed: 'গোপালগঞ্জ সদর, গোপালগঞ্জ',
    phone: '+880 1812-100001',
    email: 'shamsul.field@nit.bd',
    experience: '৫ বছরের ফিল্ড ক্যাম্প অভিজ্ঞতা',
    bio: 'গোপালগঞ্জ সদরে মাঠপর্যায়ে কার্ড বিতরণ ও ডায়াগনস্টিক সেন্টারে রোগীদের তথ্য সহায়তা প্রদানে দায়িত্ব পালন করছেন।'
  },
  {
    id: 'f2',
    name: 'সুমাইয়া সুলতানা',
    designation: 'কমিউনিটি হেলথ ওয়ার্কার',
    category: 'field',
    image: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&q=80&w=400',
    locationServed: 'টুঙ্গিপাড়া, গোপালগঞ্জ',
    phone: '+880 1812-100002',
    email: 'sumaiya.field@nit.bd',
    experience: '৪ বছরের স্বাস্থ্য সচেতনতা কার্যক্রম',
    bio: 'গ্রামাঞ্চলে মা ও শিশুদের বিনামূল্যে স্বাস্থ্যসেবা পরামর্শ দেওয়া এবং কার্ড গ্রহণে উদ্বুদ্ধ করতে কাজ করছেন।'
  },
  {
    id: 'f3',
    name: 'মোঃ নাজমুল হোসেন',
    designation: 'ফিল্ড সুপারভাইজার',
    category: 'field',
    image: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&q=80&w=400',
    locationServed: 'কোটালিপাড়া, গোপালগঞ্জ',
    phone: '+880 1812-100003',
    email: 'nazmul.field@nit.bd',
    experience: '৬ বছরের প্রজেক্ট এক্সিকিউশন',
    bio: 'কোটালিপাড়া এলাকার পার্টনার ফার্মেসি ও প্যাথলজি ল্যাবে কার্ড ভেরিফিকেশন ও ডিসকাউন্ট সুবিধা তদারকি করেন।'
  },
  {
    id: 'f4',
    name: 'রাবেয়া খাতুন',
    designation: 'স্বাস্থ্যসেবা কর্মী ও কেয়ার অ্যাসিস্ট্যান্ট',
    category: 'field',
    image: 'https://images.unsplash.com/photo-1567532939604-b6b5b0db2604?auto=format&fit=crop&q=80&w=400',
    locationServed: 'সিলেট সদর, সিলেট',
    phone: '+880 1812-100004',
    email: 'rabeya.field@nit.bd',
    experience: '৪ বছরের নার্সিং ও পেশেন্ট কেয়ার',
    bio: 'সিলেট অঞ্চলে বয়স্ক ও অসচ্ছল রোগীদের পরীক্ষা-নিরীক্ষায় সরাসরি হেল্পডেস্ক থেকে সার্বিক সহযোগিতা করেন।'
  },
  {
    id: 'f5',
    name: 'আতিকুর রহমান',
    designation: 'মেডিক্যাল রিপ্রেজেন্টেটিভ ও ফিল্ড অফিসার',
    category: 'field',
    image: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=400',
    locationServed: 'নড়াইল সদর, নড়াইল',
    phone: '+880 1812-100005',
    email: 'atik.field@nit.bd',
    experience: '৫ বছরের ফার্মাসিউটিক্যালস ও হেলথ ফিল্ড ওয়ার্ক',
    bio: 'নড়াইল জেলার হাসপাতাল ও চিকিৎসকদের সাথে যোগাযোগ রক্ষা এবং হেলথ কার্ড ক্যাম্পেইন পরিচালনা করেন।'
  },
  {
    id: 'f6',
    name: 'ফাতিমা আক্তার',
    designation: 'স্বাস্থ্য সংগঠক',
    category: 'field',
    image: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=400',
    locationServed: 'কাসিয়ানী, গোপালগঞ্জ',
    phone: '+880 1812-100006',
    email: 'fatema.field@nit.bd',
    experience: '৩ বছরের সামাজিক স্বাস্থ্য ক্যাম্প',
    bio: 'কাসিয়ানী উপজেলার বিভিন্ন ইউনিয়নে ফ্রি মেডিক্যাল ক্যাম্পের আয়োজন ও স্থানীয় মানুষদের স্বাস্থ্য সচেতনতা বৃদ্ধিতে সক্রিয়।'
  },
  {
    id: 'f7',
    name: 'কামরুল হাসান',
    designation: 'ল্যাব ও ডায়াগনস্টিক হেল্প ডেস্ক প্রতিনিধি',
    category: 'field',
    image: 'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?auto=format&fit=crop&q=80&w=400',
    locationServed: 'পপুলার ও সেবা ডায়াগনস্টিক, গোপালগঞ্জ',
    phone: '+880 1812-100007',
    email: 'kamrul.lab@nit.bd',
    experience: '৪ বছরের ডায়াগনস্টিক বুথ হেল্প ডেস্ক',
    bio: 'পার্টনার ডায়াগনস্টিক সেন্টারে আগত DMB কার্ডধারীদের সরাসরি ৩০% ডিসকাউন্ট ভাউচার ও সিরিয়াল পেতে সাহায্য করেন।'
  },
  {
    id: 'f8',
    name: 'নাসরিন জাহান',
    designation: 'ফিল্ড কেয়ার কো-অর্ডিনেটর',
    category: 'field',
    image: 'https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?auto=format&fit=crop&q=80&w=400',
    locationServed: 'মৌলভীবাজার ও সিলেট জোন',
    phone: '+880 1812-100008',
    email: 'nasrin.field@nit.bd',
    experience: '৫ বছরের হেলথ ভলান্টিয়ার কো-অর্ডিনেশন',
    bio: 'সিলেট বিভাগে প্রজেক্টের বিস্তার ও ফিল্ড ওয়ার্কারদের ট্রেনিং এবং সাপ্তাহিক রিপোর্ট সংগ্রহে দায়িত্ব পালন করেন।'
  }
];

interface TeamPageProps {
  setActiveTab: (tab: string) => void;
}

export const TeamPage: React.FC<TeamPageProps> = ({ setActiveTab }) => {
  const [teamList, setTeamList] = useState<TeamMember[]>(DEFAULT_TEAM_MEMBERS);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFilter, setSelectedFilter] = useState<'all' | 'management' | 'field'>('all');

  useEffect(() => {
    fetch('/api/team-members')
      .then(res => {
        if (!res.ok) return null;
        return res.json();
      })
      .then(data => {
        if (Array.isArray(data) && data.length > 0) {
          setTeamList(data);
        }
      })
      .catch(() => {
        // Fallback to DEFAULT_TEAM_MEMBERS
      });
  }, []);

  const managementMembers = teamList.filter(
    m => m.category === 'management' && 
    (m.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
     m.designation.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const fieldMembers = teamList.filter(
    m => m.category === 'field' && 
    (m.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
     m.designation.toLowerCase().includes(searchQuery.toLowerCase()) ||
     (m.locationServed && m.locationServed.toLowerCase().includes(searchQuery.toLowerCase())))
  );

  return (
    <div className="min-h-screen bg-slate-50/60 pb-20">
      {/* Top Banner / Hero Header Section */}
      <section className="bg-gradient-to-r from-blue-900 via-indigo-900 to-sky-950 text-white relative overflow-hidden py-14 md:py-20 shadow-lg">
        {/* Decorative Grid Overlay */}
        <div className="absolute inset-0 bg-[radial-gradient(#38bdf8_1px,transparent_1px)] [background-size:24px_24px] opacity-10 pointer-events-none"></div>
        <div className="absolute -top-24 -right-24 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-blue-500/20 rounded-full blur-3xl pointer-events-none"></div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-cyan-300 font-semibold text-xs mb-5 shadow-inner">
            <Users className="w-4 h-4 text-cyan-300" />
            <span>আমাদের নিবেদিতপ্রাণ টিম (Our Team)</span>
          </div>

          <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight text-white mb-5">
            আমাদের টিম
          </h1>

          <p className="max-w-3xl mx-auto text-slate-200 text-sm sm:text-base leading-relaxed font-normal">
            জনগণের দোরগোড়ায় মানসম্মত স্বাস্থ্যসেবা পৌঁছে দিতে নিরলসভাবে কাজ করে যাচ্ছে আমাদের দক্ষ কর্মীদল। অভিজ্ঞ জনবল ও নিবেদিতপ্রাণ মাঠকর্মীদের সমন্বয়ে গঠিত এই টিম মাঠপর্যায়ে প্রজেক্টের সফল বাস্তবায়ন এবং স্বাস্থ্য সুরক্ষায় সবসময় আপনার পাশে রয়েছে। পরিচিত হোন আমাদের পেছনের মূল চালিকাশক্তিদের সাথে।
          </p>

          {/* Search and Category Filter Bar */}
          <div className="mt-8 max-w-xl mx-auto flex flex-col sm:flex-row items-center gap-3 bg-white/10 backdrop-blur-md p-2 rounded-2xl border border-white/15 shadow-xl">
            <div className="relative flex-1 w-full">
              <Search className="w-4 h-4 text-slate-300 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="নাম, পদবি বা এলাকা লিখে খুঁজুন..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white/10 text-white placeholder-slate-300 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-cyan-400 border border-transparent"
              />
            </div>
            <div className="flex items-center gap-1.5 w-full sm:w-auto justify-center">
              <button
                onClick={() => setSelectedFilter('all')}
                className={`px-3 py-2 rounded-xl text-xs font-semibold transition cursor-pointer ${
                  selectedFilter === 'all'
                    ? 'bg-cyan-500 text-slate-950 shadow-md font-bold'
                    : 'text-slate-200 hover:bg-white/10'
                }`}
              >
                সকল
              </button>
              <button
                onClick={() => setSelectedFilter('management')}
                className={`px-3 py-2 rounded-xl text-xs font-semibold transition cursor-pointer ${
                  selectedFilter === 'management'
                    ? 'bg-cyan-500 text-slate-950 shadow-md font-bold'
                    : 'text-slate-200 hover:bg-white/10'
                }`}
              >
                ব্যবস্থাপনা
              </button>
              <button
                onClick={() => setSelectedFilter('field')}
                className={`px-3 py-2 rounded-xl text-xs font-semibold transition cursor-pointer ${
                  selectedFilter === 'field'
                    ? 'bg-cyan-500 text-slate-950 shadow-md font-bold'
                    : 'text-slate-200 hover:bg-white/10'
                }`}
              >
                মাঠপর্যায়
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Main Content Area */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-12 space-y-16">

        {/* SECTION 1: নেতৃত্বে ও ব্যবস্থাপনায় (Top Management & Officers) */}
        {(selectedFilter === 'all' || selectedFilter === 'management') && (
          <section className="space-y-6">
            <div className="border-b border-slate-200 pb-4 flex flex-col sm:flex-row sm:items-end justify-between gap-3">
              <div>
                <div className="inline-flex items-center gap-2 text-blue-700 font-extrabold text-xs tracking-wider uppercase mb-1">
                  <Briefcase className="w-4 h-4 text-blue-600" />
                  <span>Leadership & Governance</span>
                </div>
                <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 flex items-center gap-2.5">
                  নেতৃত্বে ও ব্যবস্থাপনায়
                </h2>
              </div>
              <span className="text-xs font-bold text-slate-500 bg-slate-200/70 px-3 py-1 rounded-full w-fit">
                {managementMembers.length} জন প্রশাসনিক কর্মকর্তা
              </span>
            </div>

            {managementMembers.length === 0 ? (
              <div className="bg-white rounded-2xl p-8 text-center text-slate-500 border border-slate-200">
                এই ক্যাটাগরিতে কোনো সদস্য পাওয়া যায়নি।
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 xl:grid-cols-3 gap-6">
                {managementMembers.map(member => (
                  <div
                    key={member.id}
                    className="group bg-white rounded-2xl border border-slate-200/90 shadow-sm hover:shadow-xl hover:border-blue-300 transition-all duration-300 overflow-hidden flex flex-col"
                  >
                    {/* Header accent strip */}
                    <div className="h-2 bg-gradient-to-r from-blue-600 via-indigo-600 to-sky-500"></div>

                    <div className="p-6 flex flex-col items-center text-center flex-1">
                      {/* Avatar container with status pulse badge */}
                      <div className="relative mb-4">
                        <img
                          src={member.image}
                          alt={member.name}
                          className="w-28 h-28 sm:w-32 sm:h-32 rounded-2xl object-cover shadow-md group-hover:scale-105 transition-transform duration-300 border-2 border-slate-100"
                        />
                        <div className="absolute -bottom-2 -right-2 bg-blue-600 text-white p-1.5 rounded-xl shadow-md" title="প্রশাসনিক কর্মকর্তা">
                          <ShieldCheck className="w-4 h-4" />
                        </div>
                      </div>

                      {/* Name & Designation */}
                      <h3 className="text-lg font-extrabold text-slate-900 group-hover:text-blue-700 transition-colors">
                        {member.name}
                      </h3>
                      <p className="text-xs font-bold text-blue-600 mt-1 mb-2">
                        {member.designation}
                      </p>

                      {member.education && (
                        <div className="inline-block bg-slate-100 text-slate-700 text-[11px] font-semibold px-2.5 py-1 rounded-md mb-3">
                          🎓 {member.education}
                        </div>
                      )}

                      {member.bio && (
                        <p className="text-slate-600 text-xs leading-relaxed mb-4 line-clamp-3 font-normal">
                          {member.bio}
                        </p>
                      )}

                      {/* Spacer */}
                      <div className="mt-auto w-full pt-4 border-t border-slate-100 flex items-center justify-center gap-2">
                        {member.email && (
                          <a
                            href={`mailto:${member.email}`}
                            className="p-2 rounded-xl bg-slate-100 hover:bg-blue-100 hover:text-blue-700 text-slate-600 transition cursor-pointer"
                            title={`ইমেইল: ${member.email}`}
                          >
                            <Mail className="w-4 h-4" />
                          </a>
                        )}

                        {member.phone && (
                          <a
                            href={`tel:${member.phone}`}
                            className="p-2 rounded-xl bg-slate-100 hover:bg-emerald-100 hover:text-emerald-700 text-slate-600 transition cursor-pointer"
                            title={`ফোন: ${member.phone}`}
                          >
                            <Phone className="w-4 h-4" />
                          </a>
                        )}

                        {member.linkedin && (
                          <a
                            href={member.linkedin}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-2 rounded-xl bg-slate-100 hover:bg-sky-100 hover:text-sky-700 text-slate-600 transition cursor-pointer"
                            title="LinkedIn প্রোফাইল"
                          >
                            <Linkedin className="w-4 h-4" />
                          </a>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>
        )}

        {/* SECTION 2: মাঠপর্যায়ে ও সেবাদানে (Field Workers & Healthcare Staff) */}
        {(selectedFilter === 'all' || selectedFilter === 'field') && (
          <section className="space-y-6">
            <div className="border-b border-slate-200 pb-4 flex flex-col sm:flex-row sm:items-end justify-between gap-3">
              <div>
                <div className="inline-flex items-center gap-2 text-emerald-700 font-extrabold text-xs tracking-wider uppercase mb-1">
                  <HeartHandshake className="w-4 h-4 text-emerald-600" />
                  <span>Grassroots & Community Healthcare</span>
                </div>
                <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 flex items-center gap-2.5">
                  মাঠপর্যায়ে ও সেবাদানে
                </h2>
              </div>
              <span className="text-xs font-bold text-slate-500 bg-slate-200/70 px-3 py-1 rounded-full w-fit">
                {fieldMembers.length} জন নিবেদিতপ্রান মাঠকর্মী
              </span>
            </div>

            {fieldMembers.length === 0 ? (
              <div className="bg-white rounded-2xl p-8 text-center text-slate-500 border border-slate-200">
                এই ক্যাটাগরিতে কোনো সদস্য পাওয়া যায়নি।
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
                {fieldMembers.map(member => (
                  <div
                    key={member.id}
                    className="group bg-white rounded-2xl border border-slate-200/90 shadow-sm hover:shadow-lg hover:border-emerald-300 transition-all duration-300 overflow-hidden flex flex-col"
                  >
                    {/* Top image and badge */}
                    <div className="relative h-48 overflow-hidden bg-slate-100">
                      <img
                        src={member.image}
                        alt={member.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 via-transparent to-transparent"></div>

                      {member.locationServed && (
                        <div className="absolute bottom-3 left-3 right-3 flex items-center gap-1.5 text-white bg-slate-900/70 backdrop-blur-md px-2.5 py-1 rounded-lg text-[11px] font-semibold border border-white/20">
                          <MapPin className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                          <span className="truncate">{member.locationServed}</span>
                        </div>
                      )}
                    </div>

                    {/* Body Info */}
                    <div className="p-5 flex flex-col flex-1">
                      <h3 className="text-base font-extrabold text-slate-900 group-hover:text-emerald-700 transition-colors">
                        {member.name}
                      </h3>
                      <p className="text-xs font-bold text-emerald-600 mt-0.5 mb-2">
                        {member.designation}
                      </p>

                      {member.bio && (
                        <p className="text-slate-600 text-xs leading-relaxed mb-3 line-clamp-3 font-normal">
                          {member.bio}
                        </p>
                      )}

                      {/* Footer Actions */}
                      <div className="mt-auto pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                        {member.phone ? (
                          <a
                            href={`tel:${member.phone}`}
                            className="inline-flex items-center gap-1.5 text-slate-700 font-semibold hover:text-emerald-700 transition"
                          >
                            <Phone className="w-3.5 h-3.5 text-emerald-600" />
                            <span>{member.phone}</span>
                          </a>
                        ) : (
                          <span>ফিল্ড স্টাফ</span>
                        )}

                        <span className="inline-flex items-center gap-1 text-[11px] text-emerald-800 font-semibold bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-100">
                          <UserCheck className="w-3 h-3 text-emerald-600" />
                          সক্রিয়
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>
        )}

        {/* Commitment Banner / Call to Action */}
        <section className="bg-gradient-to-r from-emerald-800 via-teal-900 to-slate-900 rounded-3xl p-8 sm:p-10 text-white shadow-xl relative overflow-hidden flex flex-col md:flex-row items-center justify-between gap-8 border border-emerald-700/40">
          <div className="space-y-3 max-w-2xl text-center md:text-left z-10">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-bold border border-emerald-400/30">
              <Award className="w-3.5 h-3.5" />
              আমাদের সামাজিক অঙ্গীকার
            </span>
            <h3 className="text-2xl sm:text-3xl font-extrabold text-white">
              আপনার এলাকায় স্বাস্থ্যসেবার সহায়তা প্রয়োজন?
            </h3>
            <p className="text-slate-200 text-xs sm:text-sm leading-relaxed">
              আমাদের টিম সার্বক্ষণিক মাঠে নিয়োজিত রয়েছে। ডিজিটাল মেডিক্যাল কার্ড সম্পর্কিত যেকোনো তথ্যের জন্য বা স্থানীয় হেলথ ক্যাম্পের বিষয়ে আমাদের টিমের সাথে সরাসরি যোগাযোগ করুন।
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-3 shrink-0 z-10 w-full sm:w-auto">
            <button
              onClick={() => setActiveTab('apply')}
              className="w-full sm:w-auto px-6 py-3 rounded-2xl bg-emerald-400 hover:bg-emerald-300 text-slate-950 font-extrabold text-xs sm:text-sm shadow-lg transition transform active:scale-95 cursor-pointer flex items-center justify-center gap-2"
            >
              <span>কার্ডের আবেদন করুন</span>
              <ChevronRight className="w-4 h-4" />
            </button>
            <button
              onClick={() => setActiveTab('contact')}
              className="w-full sm:w-auto px-6 py-3 rounded-2xl bg-white/10 hover:bg-white/20 text-white font-bold text-xs sm:text-sm border border-white/20 transition cursor-pointer flex items-center justify-center gap-2"
            >
              <span>যোগাযোগ ফর্ম</span>
            </button>
          </div>
        </section>

      </div>
    </div>
  );
};
