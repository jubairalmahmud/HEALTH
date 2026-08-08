import React, { useState, useEffect } from 'react';
import { UserCheck, ShieldCheck, CheckCircle2, AlertCircle, FileText, ArrowRight, User, Phone, Mail, MapPin, Calendar, Award, Upload, Briefcase, Eye, Trash2, Check, ExternalLink } from 'lucide-react';
import { RepresentativeApplication, JobCircular } from '../types';

interface Props {
  setActiveTab: (tab: string) => void;
}

export const RepresentativeRegisterPage: React.FC<Props> = ({ setActiveTab }) => {
  const [circulars, setCirculars] = useState<JobCircular[]>([]);
  const [selectedCircular, setSelectedCircular] = useState<JobCircular | null>(null);
  
  const [formData, setFormData] = useState({
    circularId: '',
    circularTitle: '',
    name: '',
    fatherName: '',
    motherName: '',
    dob: '',
    gender: 'Male' as 'Male' | 'Female' | 'Other',
    mobile: '',
    email: '',
    nidNo: '',
    educationalQualification: 'HSC Passed',
    experienceYears: 'Fresh Candidate / 0-1 Year',
    address: '',
    upazila: 'Gopalganj Sadar',
    district: 'Gopalganj',
    photoUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=300',
    nidDocUrl: '',
    educationDocUrl: '',
    cvDocUrl: '',
    assignedArea: 'Gopalganj Sadar Upazila',
    notes: ''
  });

  const [loading, setLoading] = useState(false);
  const [submittedApp, setSubmittedApp] = useState<RepresentativeApplication | null>(null);
  const [errorMsg, setErrorMsg] = useState('');

  // File Upload State previews & loading
  const [photoPreview, setPhotoPreview] = useState<string>('');
  const [nidDocPreview, setNidDocPreview] = useState<string>('');
  const [educationDocPreview, setEducationDocPreview] = useState<string>('');
  const [cvDocName, setCvDocName] = useState<string>('');

  useEffect(() => {
    fetchCirculars();
  }, []);

  const fetchCirculars = async () => {
    try {
      const res = await fetch('/api/job-circulars');
      if (res.ok) {
        const data = await res.json();
        setCirculars(data);
        if (data.length > 0) {
          const openCircular = data.find((c: JobCircular) => c.status === 'OPEN') || data[0];
          setSelectedCircular(openCircular);
          setFormData(prev => ({
            ...prev,
            circularId: openCircular.id,
            circularTitle: openCircular.title
          }));
        }
      }
    } catch (err) {
      console.error('Failed to load job circulars', err);
    }
  };

  const handleSelectCircular = (circular: JobCircular) => {
    setSelectedCircular(circular);
    setFormData(prev => ({
      ...prev,
      circularId: circular.id,
      circularTitle: circular.title
    }));
    // Scroll to form
    const formEl = document.getElementById('rep-application-form');
    if (formEl) {
      formEl.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // Helper to handle file conversions to Base64
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>, fieldName: 'photoUrl' | 'nidDocUrl' | 'educationDocUrl' | 'cvDocUrl') => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      alert('ফাইলের সাইজ সর্বোচ্চ 5MB হতে পারবে।');
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      const base64String = reader.result as string;
      setFormData(prev => ({ ...prev, [fieldName]: base64String }));

      if (fieldName === 'photoUrl') setPhotoPreview(base64String);
      if (fieldName === 'nidDocUrl') setNidDocPreview(base64String);
      if (fieldName === 'educationDocUrl') setEducationDocPreview(base64String);
      if (fieldName === 'cvDocUrl') setCvDocName(file.name);
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (!formData.name || !formData.mobile || !formData.nidNo || !formData.fatherName) {
      setErrorMsg('অনুগ্রহ করে নাম, মোবাইল নম্বর, এনআইডি এবং পিতার নাম প্রদান করুন।');
      return;
    }

    setLoading(true);

    try {
      const res = await fetch('/api/representatives/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      const data = await res.json();

      if (res.ok) {
        setSubmittedApp(data.application);
      } else {
        setErrorMsg(data.error || 'নিবন্ধন জমা নেওয়া সম্ভব হয়নি।');
      }
    } catch (err) {
      setErrorMsg('সার্ভারে যোগাযোগ করা যাচ্ছে না। পুনরায় চেষ্টা করুন।');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="py-10 px-4 sm:px-6 lg:px-8 bg-slate-50 min-h-screen">
      <div className="max-w-4xl mx-auto space-y-8">
        
        {/* Banner */}
        <div className="bg-gradient-to-r from-blue-900 via-sky-800 to-emerald-800 rounded-3xl p-6 sm:p-8 text-white shadow-xl">
          <div className="flex items-center gap-3 mb-2">
            <span className="bg-amber-400 text-slate-900 font-extrabold text-[10px] px-2.5 py-1 rounded-full uppercase tracking-wider">
              FIELD REPRESENTATIVE & CAREER PORTAL
            </span>
            <span className="text-sky-200 text-xs font-semibold">DMB Healthcare Field Force Recruitment</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
            প্রতিনিধি নিয়োগ ও জব সার্কুলার পোর্টাল
          </h1>
          <p className="mt-2 text-sky-100 text-xs sm:text-sm max-w-2xl leading-relaxed">
            ডিজিটাল মিডিয়া ব্রিজের ফিল্ড প্রতিনিধি পদে আবেদন করুন। সার্কুলার দেখে পছন্দসই পদে প্রয়োজনীয় পেপারস (ছবি, এনআইডি, সার্টিফিকেট ও সিভি) আপলোড করে আবেদন জমা দিন।
          </p>
        </div>

        {/* Section 1: Active Job Circulars */}
        <div className="space-y-4">
          <div className="flex items-center justify-between border-b border-slate-200 pb-3">
            <h2 className="text-lg font-black text-slate-900 flex items-center gap-2">
              <Briefcase className="w-5 h-5 text-emerald-600" />
              চলতি নিয়োগ বিজ্ঞপ্তিসমূহ (Active Job Circulars)
            </h2>
            <span className="bg-emerald-100 text-emerald-800 font-extrabold text-xs px-3 py-1 rounded-full">
              {circulars.filter(c => c.status === 'OPEN').length} টি সার্কুলার চালু
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {circulars.map(circular => (
              <div 
                key={circular.id}
                className={`bg-white rounded-2xl p-5 border-2 transition-all shadow-sm flex flex-col justify-between space-y-4 ${
                  selectedCircular?.id === circular.id 
                    ? 'border-emerald-500 ring-2 ring-emerald-500/20 bg-emerald-50/20' 
                    : 'border-slate-200 hover:border-slate-300'
                }`}
              >
                <div className="space-y-2">
                  <div className="flex items-start justify-between gap-2">
                    <span className={`text-[10px] font-extrabold px-2.5 py-0.5 rounded-full ${
                      circular.status === 'OPEN' ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-600'
                    }`}>
                      {circular.status === 'OPEN' ? '✓ আবেদন চলছে (OPEN)' : 'মাসিক কোটা পূর্ণ'}
                    </span>
                    <span className="font-mono text-xs text-slate-400 font-bold">{circular.id}</span>
                  </div>

                  <h3 className="font-black text-slate-900 text-base leading-snug">{circular.title}</h3>
                  <p className="text-xs font-bold text-sky-800">পদবী: {circular.position}</p>
                  
                  <div className="grid grid-cols-2 gap-2 pt-2 text-[11px] text-slate-600">
                    <div className="bg-slate-50 p-2 rounded-xl">
                      <span className="block text-[10px] text-slate-400">এলাকা/জেলা:</span>
                      <strong className="text-slate-800">{circular.district}</strong>
                    </div>
                    <div className="bg-slate-50 p-2 rounded-xl">
                      <span className="block text-[10px] text-slate-400">পদ সংখ্যা:</span>
                      <strong className="text-emerald-700">{circular.vacancyCount} জন</strong>
                    </div>
                    <div className="bg-slate-50 p-2 rounded-xl col-span-2">
                      <span className="block text-[10px] text-slate-400">বেতন ও ভাতা:</span>
                      <strong className="text-slate-800">{circular.salaryAllowance}</strong>
                    </div>
                    <div className="bg-slate-50 p-2 rounded-xl col-span-2">
                      <span className="block text-[10px] text-slate-400">শিক্ষাগত যোগ্যতা:</span>
                      <strong className="text-slate-800">{circular.educationRequirement}</strong>
                    </div>
                  </div>

                  <div className="text-xs text-slate-600 pt-1">
                    <p className="font-semibold text-slate-700 mb-1">প্রয়োজনীয় শর্তাবলী:</p>
                    <ul className="list-disc pl-4 space-y-0.5 text-[11px] text-slate-600">
                      {circular.requirements.map((req, i) => (
                        <li key={i}>{req}</li>
                      ))}
                    </ul>
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                  <span className="text-[11px] text-rose-600 font-bold">
                    আবেদনের শেষ তারিখ: {circular.deadline}
                  </span>
                  <button
                    onClick={() => handleSelectCircular(circular)}
                    className={`px-4 py-2 rounded-xl font-extrabold text-xs transition cursor-pointer flex items-center gap-1.5 ${
                      selectedCircular?.id === circular.id 
                        ? 'bg-emerald-600 text-white shadow' 
                        : 'bg-slate-900 text-white hover:bg-slate-800'
                    }`}
                  >
                    {selectedCircular?.id === circular.id ? (
                      <>
                        <Check className="w-4 h-4" /> নির্বাচিত পদ
                      </>
                    ) : (
                      <>
                        আবেদন করুন <ArrowRight className="w-3.5 h-3.5" />
                      </>
                    )}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {submittedApp ? (
          /* Success Screen */
          <div className="bg-white rounded-3xl p-8 border border-emerald-200 shadow-xl space-y-6 text-center animate-fadeIn">
            <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto shadow-inner">
              <CheckCircle2 className="w-10 h-10" />
            </div>
            
            <div className="space-y-2">
              <h2 className="text-2xl font-black text-slate-900">
                আপনার আবেদন ও পেপারস সফলভাবে জমা হয়েছে!
              </h2>
              <p className="text-xs text-slate-600 max-w-md mx-auto">
                এডমিন প্যানেল থেকে আপনার এনআইডি, ছবি ও পেপারস যাচাই করা হচ্ছে। অনুমোদন শেষে আপনার মোবাইল নম্বরে নিশ্চিতকরণ SMS পাঠানো হবে।
              </p>
            </div>

            <div className="bg-slate-50 p-5 rounded-2xl border border-slate-200 text-left max-w-lg mx-auto space-y-2.5 text-xs">
              <div className="flex justify-between border-b pb-1.5">
                <span className="text-slate-500">আবেদন ট্র্যাকিং নম্বর:</span>
                <span className="font-mono font-bold text-blue-700">{submittedApp.id}</span>
              </div>
              <div className="flex justify-between border-b pb-1.5">
                <span className="text-slate-500">আবেদনের পদ:</span>
                <span className="font-bold text-emerald-800">{submittedApp.circularTitle || 'ফিল্ড রিপ্রেজেন্টেটিভ'}</span>
              </div>
              <div className="flex justify-between border-b pb-1.5">
                <span className="text-slate-500">আবেদনকারীর নাম:</span>
                <span className="font-bold text-slate-800">{submittedApp.name}</span>
              </div>
              <div className="flex justify-between border-b pb-1.5">
                <span className="text-slate-500">মোবাইল (ইউজার আইডি):</span>
                <span className="font-mono font-bold text-slate-800">{submittedApp.mobile}</span>
              </div>
              <div className="flex justify-between border-b pb-1.5">
                <span className="text-slate-500">এনআইডি নম্বর:</span>
                <span className="font-mono font-bold text-slate-800">{submittedApp.nidNo}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">স্ট্যাটাস:</span>
                <span className="bg-amber-100 text-amber-800 px-2.5 py-0.5 rounded-full font-extrabold text-[11px]">
                  {submittedApp.status} (এডমিন যাচাইয়ের অপেক্ষায়)
                </span>
              </div>
            </div>

            <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-3">
              <button
                onClick={() => setActiveTab('login')}
                className="w-full sm:w-auto px-6 py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow cursor-pointer"
              >
                লগইন পোর্টালে যান
              </button>
              <button
                onClick={() => setSubmittedApp(null)}
                className="w-full sm:w-auto px-6 py-3 rounded-xl bg-slate-100 text-slate-700 font-bold text-xs hover:bg-slate-200 cursor-pointer"
              >
                নতুন আরেকটি আবেদন করুন
              </button>
            </div>
          </div>
        ) : (
          /* Registration Form with File Uploads */
          <form id="rep-application-form" onSubmit={handleSubmit} className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-xl space-y-8">
            
            <div className="border-b pb-4 flex items-center justify-between">
              <div>
                <span className="text-[10px] font-extrabold uppercase bg-emerald-100 text-emerald-800 px-2.5 py-0.5 rounded-full">
                  JOB APPLICATION FORM
                </span>
                <h2 className="text-xl font-black text-slate-900 mt-1">
                  {selectedCircular ? selectedCircular.title : 'প্রতিনিধি আবেদন ফর্ম'}
                </h2>
              </div>
              {selectedCircular && (
                <span className="text-xs font-bold text-slate-500 bg-slate-100 px-3 py-1.5 rounded-xl">
                  ID: {selectedCircular.id}
                </span>
              )}
            </div>

            {errorMsg && (
              <div className="p-4 bg-rose-50 border border-rose-200 rounded-2xl text-rose-800 text-xs flex items-center gap-2">
                <AlertCircle className="w-5 h-5 flex-shrink-0 text-rose-600" />
                <span>{errorMsg}</span>
              </div>
            )}

            {/* Step 1: Personal Information */}
            <div className="space-y-4">
              <h3 className="font-extrabold text-slate-900 text-base border-b pb-2 flex items-center gap-2">
                <User className="w-5 h-5 text-blue-600" />
                ১. ব্যক্তিগত ও পারিবারিক তথ্যাবলী (Personal Info)
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">আবেদনকারীর নাম (Applicant Name) *</label>
                  <input
                    type="text"
                    name="name"
                    required
                    placeholder="যেমন: মো: রফিকুল ইসলাম"
                    value={formData.name}
                    onChange={handleChange}
                    className="w-full p-3 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-blue-600 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">পিতার নাম (Father's Name) *</label>
                  <input
                    type="text"
                    name="fatherName"
                    required
                    placeholder="পিতার পুরো নাম"
                    value={formData.fatherName}
                    onChange={handleChange}
                    className="w-full p-3 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-blue-600 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">মাতার নাম (Mother's Name)</label>
                  <input
                    type="text"
                    name="motherName"
                    placeholder="মাতার পুরো নাম"
                    value={formData.motherName}
                    onChange={handleChange}
                    className="w-full p-3 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-blue-600 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">জন্ম তারিখ (Date of Birth)</label>
                  <input
                    type="date"
                    name="dob"
                    value={formData.dob}
                    onChange={handleChange}
                    className="w-full p-3 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-blue-600 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">লিঙ্গ (Gender)</label>
                  <select
                    name="gender"
                    value={formData.gender}
                    onChange={handleChange}
                    className="w-full p-3 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-blue-600 focus:outline-none"
                  >
                    <option value="Male">পুরুষ (Male)</option>
                    <option value="Female">নারী (Female)</option>
                    <option value="Other">অন্যান্য (Other)</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">জাতীয় পরিচয়পত্র (NID Number) *</label>
                  <input
                    type="text"
                    name="nidNo"
                    required
                    placeholder="যেমন: 19923512345678901"
                    value={formData.nidNo}
                    onChange={handleChange}
                    className="w-full p-3 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-blue-600 focus:outline-none font-mono"
                  />
                </div>
              </div>
            </div>

            {/* Step 2: Contact & Location */}
            <div className="space-y-4">
              <h3 className="font-extrabold text-slate-900 text-base border-b pb-2 flex items-center gap-2">
                <Phone className="w-5 h-5 text-blue-600" />
                ২. যোগাযোগ ও এলাকা (Contact & Location)
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">মোবাইল নম্বর (User ID/Login) *</label>
                  <input
                    type="tel"
                    name="mobile"
                    required
                    placeholder="01712345678"
                    value={formData.mobile}
                    onChange={handleChange}
                    className="w-full p-3 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-blue-600 focus:outline-none font-mono font-bold"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">ইমেইল (Email)</label>
                  <input
                    type="email"
                    name="email"
                    placeholder="rep@example.com"
                    value={formData.email}
                    onChange={handleChange}
                    className="w-full p-3 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-blue-600 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">জেলা (District)</label>
                  <select
                    name="district"
                    value={formData.district}
                    onChange={handleChange}
                    className="w-full p-3 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-blue-600 focus:outline-none"
                  >
                    <option value="Gopalganj">গোপালগঞ্জ (Gopalganj)</option>
                    <option value="Narail">নড়াইল (Narail)</option>
                    <option value="Sylhet">সিলেট (Sylhet)</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">উপজেলা/থানা (Upazila)</label>
                  <input
                    type="text"
                    name="upazila"
                    placeholder="যেমন: গোপালগঞ্জ সদর"
                    value={formData.upazila}
                    onChange={handleChange}
                    className="w-full p-3 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-blue-600 focus:outline-none"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block font-bold text-slate-700 mb-1">দায়িত্বপ্রাপ্ত কাজের এলাকা (Assigned Work Area)</label>
                  <input
                    type="text"
                    name="assignedArea"
                    placeholder="যেমন: গোপালগঞ্জ সদর পৌরসভা ও ২নং ওয়ার্ড"
                    value={formData.assignedArea}
                    onChange={handleChange}
                    className="w-full p-3 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-blue-600 focus:outline-none"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block font-bold text-slate-700 mb-1">পূর্ণাঙ্গ ঠিকানা (Full Address)</label>
                  <textarea
                    name="address"
                    rows={2}
                    placeholder="গ্রাম/মহল্লা, রোড, পোস্ট অফিস"
                    value={formData.address}
                    onChange={handleChange}
                    className="w-full p-3 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-blue-600 focus:outline-none"
                  />
                </div>
              </div>
            </div>

            {/* Step 3: Education & Experience */}
            <div className="space-y-4">
              <h3 className="font-extrabold text-slate-900 text-base border-b pb-2 flex items-center gap-2">
                <Award className="w-5 h-5 text-blue-600" />
                ৩. শিক্ষা ও অভিজ্ঞতা (Education & Experience)
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">সর্বোচ্চ শিক্ষাগত যোগ্যতা *</label>
                  <select
                    name="educationalQualification"
                    value={formData.educationalQualification}
                    onChange={handleChange}
                    className="w-full p-3 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-blue-600 focus:outline-none"
                  >
                    <option value="HSC Passed">এইচএসসি / সমমান (HSC / Equivalent)</option>
                    <option value="Bachelor Degree">স্নাতক / ডিগ্রি (BA / BSc / BCom)</option>
                    <option value="Masters Degree">স্নাতকোত্তর (MA / MSc / MBA)</option>
                    <option value="Diploma">ডিপ্লোমা (Diploma in Medical/Tech)</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">কাজের অভিজ্ঞতা</label>
                  <input
                    type="text"
                    name="experienceYears"
                    placeholder="যেমন: ১ বছর (ফার্মাসিউটিক্যাল / ফিল্ড মার্কেটিং)"
                    value={formData.experienceYears}
                    onChange={handleChange}
                    className="w-full p-3 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-blue-600 focus:outline-none"
                  />
                </div>
              </div>
            </div>

            {/* Step 4: Paper & File Uploads Section */}
            <div className="space-y-4 bg-sky-50/50 p-6 rounded-3xl border border-sky-100">
              <div className="border-b border-sky-200 pb-2 flex items-center justify-between">
                <h3 className="font-extrabold text-slate-900 text-base flex items-center gap-2">
                  <Upload className="w-5 h-5 text-sky-700" />
                  ৪. প্রয়োজনীয় পেপারস ও ডকুমেন্ট ফাইল আপলোড (Documents Upload)
                </h3>
                <span className="text-[10px] text-sky-800 font-bold bg-sky-100 px-2.5 py-1 rounded-full">
                  সর্বোচ্চ ফাইল সাইজ 5MB
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5 text-xs">
                
                {/* 1. Passport Photo */}
                <div className="bg-white p-4 rounded-2xl border border-slate-200 space-y-2">
                  <label className="block font-extrabold text-slate-800">
                    ১. প্রার্থীর পাসপোর্ট সাইজ ছবি (Photo) *
                  </label>
                  <p className="text-[11px] text-slate-500">পরিষ্কার ছবি আপলোড করুন</p>
                  
                  <div className="flex items-center gap-3 pt-2">
                    {photoPreview ? (
                      <img src={photoPreview} alt="Preview" className="w-16 h-16 rounded-xl object-cover border-2 border-emerald-500 shadow-sm" />
                    ) : (
                      <div className="w-16 h-16 rounded-xl bg-slate-100 border border-dashed border-slate-300 flex items-center justify-center text-slate-400">
                        <User className="w-8 h-8" />
                      </div>
                    )}
                    <label className="px-3.5 py-2 rounded-xl bg-sky-50 text-sky-700 hover:bg-sky-100 font-bold text-xs cursor-pointer border border-sky-200 flex items-center gap-1.5 transition">
                      <Upload className="w-4 h-4" />
                      ছবি আপলোড
                      <input 
                        type="file" 
                        accept="image/*" 
                        className="hidden" 
                        onChange={(e) => handleFileUpload(e, 'photoUrl')} 
                      />
                    </label>
                  </div>
                </div>

                {/* 2. NID Document */}
                <div className="bg-white p-4 rounded-2xl border border-slate-200 space-y-2">
                  <label className="block font-extrabold text-slate-800">
                    ২. এনআইডি / স্মার্ট কার্ডের কপি (NID Document) *
                  </label>
                  <p className="text-[11px] text-slate-500">এনআইডির সামনের ও পিছনের ছবি</p>
                  
                  <div className="flex items-center gap-3 pt-2">
                    {nidDocPreview ? (
                      <img src={nidDocPreview} alt="NID" className="w-20 h-14 rounded-xl object-cover border-2 border-emerald-500 shadow-sm" />
                    ) : (
                      <div className="w-20 h-14 rounded-xl bg-slate-100 border border-dashed border-slate-300 flex items-center justify-center text-slate-400">
                        <FileText className="w-6 h-6" />
                      </div>
                    )}
                    <label className="px-3.5 py-2 rounded-xl bg-sky-50 text-sky-700 hover:bg-sky-100 font-bold text-xs cursor-pointer border border-sky-200 flex items-center gap-1.5 transition">
                      <Upload className="w-4 h-4" />
                      NID আপলোড
                      <input 
                        type="file" 
                        accept="image/*,.pdf" 
                        className="hidden" 
                        onChange={(e) => handleFileUpload(e, 'nidDocUrl')} 
                      />
                    </label>
                  </div>
                </div>

                {/* 3. Educational Certificate */}
                <div className="bg-white p-4 rounded-2xl border border-slate-200 space-y-2">
                  <label className="block font-extrabold text-slate-800">
                    ৩. শিক্ষাগত যোগ্যতার সনদপত্র (Certificate)
                  </label>
                  <p className="text-[11px] text-slate-500">এইচএসসি / ডিগ্রি সার্টিফিকেট বা মার্কশীট</p>
                  
                  <div className="flex items-center gap-3 pt-2">
                    {educationDocPreview ? (
                      <img src={educationDocPreview} alt="Certificate" className="w-20 h-14 rounded-xl object-cover border-2 border-emerald-500 shadow-sm" />
                    ) : (
                      <div className="w-20 h-14 rounded-xl bg-slate-100 border border-dashed border-slate-300 flex items-center justify-center text-slate-400">
                        <Award className="w-6 h-6" />
                      </div>
                    )}
                    <label className="px-3.5 py-2 rounded-xl bg-sky-50 text-sky-700 hover:bg-sky-100 font-bold text-xs cursor-pointer border border-sky-200 flex items-center gap-1.5 transition">
                      <Upload className="w-4 h-4" />
                      সনদপত্র আপলোড
                      <input 
                        type="file" 
                        accept="image/*,.pdf" 
                        className="hidden" 
                        onChange={(e) => handleFileUpload(e, 'educationDocUrl')} 
                      />
                    </label>
                  </div>
                </div>

                {/* 4. CV File */}
                <div className="bg-white p-4 rounded-2xl border border-slate-200 space-y-2">
                  <label className="block font-extrabold text-slate-800">
                    ৪. সিভি / জীবনবৃত্তান্ত (CV / Resume File)
                  </label>
                  <p className="text-[11px] text-slate-500">PDF বা ইমেজ ফরম্যাটের সিভি</p>
                  
                  <div className="flex items-center gap-3 pt-2">
                    <div className="flex-1 p-2 bg-slate-50 rounded-xl border border-slate-200 font-mono text-[11px] text-slate-600 truncate">
                      {cvDocName || 'কোনো সিভি ফাইল সিলেক্ট করা হয়নি'}
                    </div>
                    <label className="px-3.5 py-2 rounded-xl bg-sky-50 text-sky-700 hover:bg-sky-100 font-bold text-xs cursor-pointer border border-sky-200 flex items-center gap-1.5 transition flex-shrink-0">
                      <Upload className="w-4 h-4" />
                      সিভি আপলোড
                      <input 
                        type="file" 
                        accept="image/*,.pdf,.doc,.docx" 
                        className="hidden" 
                        onChange={(e) => handleFileUpload(e, 'cvDocUrl')} 
                      />
                    </label>
                  </div>
                </div>

              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-4 rounded-2xl bg-gradient-to-r from-emerald-600 via-teal-700 to-sky-700 hover:from-emerald-700 hover:to-sky-800 text-white font-black text-sm shadow-xl transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
            >
              {loading ? (
                <span>আবেদন ও পেপারস প্রসেস হচ্ছে...</span>
              ) : (
                <>
                  <UserCheck className="w-5 h-5" />
                  আবেদন ও পেপারস জমা দিন (Submit Application)
                </>
              )}
            </button>
          </form>
        )}
      </div>
    </div>
  );
};
