import React, { useState, useEffect } from 'react';
import { Search, ShieldCheck, CheckCircle2, XCircle, AlertCircle, RefreshCw, User, Phone, CreditCard, FileText, Check } from 'lucide-react';
import { MedicalCard } from '../types';
import { MedicalCardPrint } from '../components/MedicalCardPrint';

interface Props {
  setActiveTab: (tab: string) => void;
}

type SearchType = 'CARD_ID' | 'NAME' | 'PHONE' | 'NID';

export const CardVerificationPage: React.FC<Props> = ({ setActiveTab }) => {
  const [searchType, setSearchType] = useState<SearchType>('CARD_ID');
  const [inputValue, setInputValue] = useState('');
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const [cardResult, setCardResult] = useState<MedicalCard | null>(null);
  const [matchedCards, setMatchedCards] = useState<MedicalCard[]>([]);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    // Check URL parameters for ?id= or ?verify= or ?card=
    const params = new URLSearchParams(window.location.search);
    const idFromUrl = params.get('id') || params.get('verify') || params.get('card');
    if (idFromUrl) {
      const cleanId = idFromUrl.trim().toUpperCase();
      setSearchType('CARD_ID');
      if (cleanId.startsWith('DMB-2026-')) {
        setInputValue(cleanId.replace('DMB-2026-', ''));
      } else {
        setInputValue(cleanId);
      }
      handleVerify(undefined, cleanId);
    }
  }, []);

  const handleVerify = async (e?: React.FormEvent, rawQueryOverride?: string) => {
    if (e) e.preventDefault();
    let query = rawQueryOverride || inputValue.trim();
    
    if (!query) {
      setErrorMsg('অনুগ্রহ করে অনুসন্ধানের জন্য প্রয়োজনীয় তথ্য টাইপ করুন।');
      return;
    }

    if (searchType === 'CARD_ID' && !rawQueryOverride) {
      const upper = query.toUpperCase();
      if (!upper.startsWith('DMB-2026-') && !upper.startsWith('MEM-')) {
        query = `DMB-2026-${upper}`;
      } else {
        query = upper;
      }
    }

    setLoading(true);
    setErrorMsg(null);
    setSearched(true);
    setCardResult(null);
    setMatchedCards([]);

    try {
      const res = await fetch(`/api/cards/verify/${encodeURIComponent(query)}`);
      const data = await res.json();

      if (!res.ok || (!data.card && (!data.cards || data.cards.length === 0))) {
        setErrorMsg(data.message || 'প্রদত্ত তথ্য অনুযায়ী কোনো সক্রিয় মেডিক্যাল কার্ড পাওয়া যায়নি।');
      } else {
        const results: MedicalCard[] = data.cards || (data.card ? [data.card] : []);
        setMatchedCards(results);
        setCardResult(data.card || results[0]);
      }
    } catch (err) {
      setErrorMsg('সার্ভারে যোগাযোগ করা যায়নি। অনুগ্রহ করে ইন্টারনেট সংযোগ পরীক্ষা করে আবার চেষ্টা করুন।');
    } finally {
      setLoading(false);
    }
  };

  const handleQuickTest = (sampleId: string) => {
    setSearchType('CARD_ID');
    const suffix = sampleId.replace('DMB-2026-', '');
    setInputValue(suffix);
    handleVerify(undefined, sampleId);
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 py-12 px-4 sm:px-6 lg:px-8 space-y-10">
      
      {/* Header */}
      <div className="max-w-3xl mx-auto text-center space-y-2">
        <span className="text-xs font-bold text-blue-600 bg-blue-50 px-3 py-1 rounded-full uppercase tracking-wider inline-flex items-center gap-1.5">
          <ShieldCheck className="w-3.5 h-3.5" /> Medical Card Verification
        </span>
        <h1 className="text-3xl font-extrabold text-slate-900">
          মেডিক্যাল কার্ড সত্যতা ও স্থিতি যাচাই
        </h1>
        <p className="text-xs sm:text-sm text-slate-600">
          কার্ড নম্বর, সদস্যের নাম, মোবাইল নম্বর অথবা এনআইডি দিয়ে আপনার বা রোগীর মেডিক্যাল কার্ডের সত্যতা যাচাই করুন।
        </p>
      </div>

      {/* Main Search Container */}
      <div className="max-w-2xl mx-auto bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-md space-y-6">
        
        {/* Search Type Tabs */}
        <div className="space-y-2">
          <label className="block text-xs font-extrabold text-slate-700">
            কী দিয়ে তথ্য খুঁজতে চান নির্বাচন করুন:
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            <button
              type="button"
              onClick={() => { setSearchType('CARD_ID'); setInputValue(''); }}
              className={`p-2.5 rounded-2xl text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer border ${
                searchType === 'CARD_ID'
                  ? 'bg-blue-600 text-white border-blue-600 shadow-sm'
                  : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
              }`}
            >
              <CreditCard className="w-4 h-4" />
              কার্ড নম্বর
            </button>

            <button
              type="button"
              onClick={() => { setSearchType('NAME'); setInputValue(''); }}
              className={`p-2.5 rounded-2xl text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer border ${
                searchType === 'NAME'
                  ? 'bg-blue-600 text-white border-blue-600 shadow-sm'
                  : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
              }`}
            >
              <User className="w-4 h-4" />
              সদস্যের নাম
            </button>

            <button
              type="button"
              onClick={() => { setSearchType('PHONE'); setInputValue(''); }}
              className={`p-2.5 rounded-2xl text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer border ${
                searchType === 'PHONE'
                  ? 'bg-blue-600 text-white border-blue-600 shadow-sm'
                  : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
              }`}
            >
              <Phone className="w-4 h-4" />
              মোবাইল
            </button>

            <button
              type="button"
              onClick={() => { setSearchType('NID'); setInputValue(''); }}
              className={`p-2.5 rounded-2xl text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer border ${
                searchType === 'NID'
                  ? 'bg-blue-600 text-white border-blue-600 shadow-sm'
                  : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
              }`}
            >
              <FileText className="w-4 h-4" />
              এনআইডি
            </button>
          </div>
        </div>

        {/* Search Input Form */}
        <form onSubmit={e => handleVerify(e)} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-600 mb-1.5">
              {searchType === 'CARD_ID' && 'মেডিক্যাল কার্ড নম্বর (Card ID)'}
              {searchType === 'NAME' && 'সদস্যের পুরো বা আংশিক নাম (Name)'}
              {searchType === 'PHONE' && 'সদস্যের নিবন্ধিত মোবাইল নম্বর (Mobile Phone)'}
              {searchType === 'NID' && 'এনআইডি বা জন্ম সনদ নম্বর (NID / Birth Registration)'}
            </label>

            <div className="flex flex-col sm:flex-row items-stretch gap-2">
              {searchType === 'CARD_ID' ? (
                <div className="flex-1 flex items-center rounded-2xl border border-slate-300 bg-slate-50 overflow-hidden focus-within:ring-2 focus-within:ring-blue-500 focus-within:border-blue-500">
                  <span className="px-3.5 py-3 bg-slate-200 text-slate-700 font-mono font-black text-sm select-none border-r border-slate-300 flex-shrink-0">
                    DMB-2026-
                  </span>
                  <input
                    type="text"
                    placeholder="1001"
                    value={inputValue}
                    onChange={e => {
                      let val = e.target.value.toUpperCase();
                      if (val.startsWith('DMB-2026-')) val = val.replace('DMB-2026-', '');
                      setInputValue(val);
                    }}
                    className="w-full px-3 py-3 bg-transparent font-mono font-extrabold text-slate-900 text-sm focus:outline-none"
                  />
                </div>
              ) : (
                <div className="flex-1 relative">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                  <input
                    type="text"
                    placeholder={
                      searchType === 'NAME' ? 'যেমন: মোঃ রফিকুল ইসলাম' :
                      searchType === 'PHONE' ? 'যেমন: 01712345678' :
                      'যেমন: 19951234567890'
                    }
                    value={inputValue}
                    onChange={e => setInputValue(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 rounded-2xl border border-slate-300 bg-slate-50 font-bold text-slate-900 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  />
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="px-6 py-3 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow transition cursor-pointer flex-shrink-0 flex items-center justify-center gap-2"
              >
                {loading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <ShieldCheck className="w-4 h-4" />}
                খুঁজুন ও ভেরিফাই করুন
              </button>
            </div>
          </div>
        </form>

        {/* Quick Sample Demo Buttons */}
        <div className="pt-3 border-t border-slate-100 flex flex-wrap items-center justify-between text-[11px] text-slate-500 gap-2">
          <span>দ্রুত ডেমো টেস্ট:</span>
          <div className="flex flex-wrap items-center gap-1.5 font-mono">
            <button
              type="button"
              onClick={() => handleQuickTest('DMB-2026-1001')}
              className="px-2 py-1 rounded bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold border border-slate-300 cursor-pointer text-[10px]"
            >
              🥈 1001 (Silver)
            </button>
            <button
              type="button"
              onClick={() => handleQuickTest('DMB-2026-1002')}
              className="px-2 py-1 rounded bg-amber-100 hover:bg-amber-200 text-amber-900 font-bold border border-amber-300 cursor-pointer text-[10px]"
            >
              🥇 1002 (Gold)
            </button>
            <button
              type="button"
              onClick={() => handleQuickTest('DMB-2026-1003')}
              className="px-2 py-1 rounded bg-sky-100 hover:bg-sky-200 text-sky-900 font-bold border border-sky-300 cursor-pointer text-[10px]"
            >
              💎 1003 (Platinum)
            </button>
          </div>
        </div>

      </div>

      {/* Results Display */}
      {searched && (
        <div className="max-w-3xl mx-auto space-y-6">
          {errorMsg ? (
            <div className="bg-rose-50 border border-rose-200 rounded-3xl p-6 text-center space-y-3 shadow-sm animate-fadeIn">
              <XCircle className="w-12 h-12 text-rose-500 mx-auto" />
              <h3 className="font-extrabold text-rose-900 text-base">কার্ড যাচাই অসংগতি!</h3>
              <p className="text-xs text-rose-700 max-w-md mx-auto">{errorMsg}</p>
              <button
                onClick={() => setActiveTab('apply')}
                className="inline-block mt-2 px-5 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs shadow transition cursor-pointer"
              >
                নতুন মেডিক্যাল কার্ডের জন্য আবেদন করুন
              </button>
            </div>
          ) : matchedCards.length > 0 ? (
            <div className="space-y-6 animate-fadeIn">
              
              {/* If multiple cards matched, show list selector */}
              {matchedCards.length > 1 && (
                <div className="bg-sky-50 border border-sky-200 rounded-2xl p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <h4 className="font-extrabold text-sky-900 text-xs sm:text-sm flex items-center gap-1.5">
                      <Check className="w-4 h-4 text-sky-600" />
                      অনুসন্ধানে মোট {matchedCards.length} টি সম্ভাব্য কার্ড পাওয়া গেছে।
                    </h4>
                    <span className="text-[10px] text-sky-700 font-medium">যেকোনো কার্ডে ক্লিক করে তথ্য দেখুন</span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {matchedCards.map(c => (
                      <div
                        key={c.cardId}
                        onClick={() => setCardResult(c)}
                        className={`p-3 rounded-xl border cursor-pointer transition flex items-center gap-3 ${
                          cardResult?.cardId === c.cardId
                            ? 'bg-white border-blue-500 shadow-md ring-2 ring-blue-500/20'
                            : 'bg-white border-slate-200 hover:border-slate-300'
                        }`}
                      >
                        <div className="w-10 h-10 rounded-full bg-blue-100 text-blue-700 border border-blue-200 flex items-center justify-center font-bold flex-shrink-0">
                          <User className="w-5 h-5" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center justify-between">
                            <span className="font-extrabold text-slate-900 text-xs truncate">{c.memberName}</span>
                            <span className={`text-[9px] font-black px-1.5 py-0.5 rounded uppercase ${
                              c.cardTier === 'Platinum' ? 'bg-sky-100 text-sky-800' :
                              c.cardTier === 'Gold' ? 'bg-amber-100 text-amber-800' : 'bg-slate-100 text-slate-800'
                            }`}>
                              {c.cardTier}
                            </span>
                          </div>
                          <p className="text-[10px] font-mono font-bold text-sky-700 mt-0.5">{c.cardId}</p>
                          <p className="text-[10px] text-slate-500 truncate">মেয়াদ: {c.expiryDate || '31-12-2026'}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Selected Card Verified Details Box */}
              {cardResult && (() => {
                const exp = cardResult.expiryDate || cardResult.validUntil;
                const isExpired = cardResult.status === 'EXPIRED' || (exp && !exp.toLowerCase().includes('lifetime') && !exp.includes('আজীবন') && !isNaN(new Date(exp).getTime()) && new Date(exp).getTime() < new Date().setHours(0,0,0,0));
                return (
                  <div className={`bg-white rounded-3xl p-6 sm:p-8 border ${isExpired ? 'border-rose-300' : 'border-emerald-300'} shadow-xl space-y-6`}>
                    
                    {/* Status Banner */}
                    <div className={`flex items-center justify-between gap-3 p-4 rounded-2xl ${isExpired ? 'bg-rose-50 border border-rose-200' : 'bg-emerald-50 border border-emerald-200'} flex-wrap`}>
                      <div className="flex items-center gap-3">
                        {isExpired ? (
                          <AlertCircle className="w-8 h-8 text-rose-600 flex-shrink-0" />
                        ) : (
                          <CheckCircle2 className="w-8 h-8 text-emerald-600 flex-shrink-0" />
                        )}
                        <div>
                          <h3 className={`font-extrabold ${isExpired ? 'text-rose-900' : 'text-emerald-900'} text-sm sm:text-base`}>
                            {isExpired ? 'মেয়াদোত্তীর্ণ কার্ড (EXPIRED CARD)' : 'কার্ড ভেরিফিকেশন সফল (VERIFIED CARD)'}
                          </h3>
                          <p className={`text-xs ${isExpired ? 'text-rose-700' : 'text-emerald-700'}`}>
                            ডিজিটাল মিডিয়া ব্রিজ মেডিক্যাল নেটওয়ার্ক
                          </p>
                        </div>
                      </div>
                      <span className={`px-3.5 py-1.5 rounded-full ${isExpired ? 'bg-rose-600' : 'bg-emerald-600'} text-white font-black text-xs font-mono`}>
                        {isExpired ? '⚠️ EXPIRED' : `✓ ${cardResult.status || 'ACTIVE'}`}
                      </span>
                    </div>

                    {/* Privacy Notice */}
                    <div className="p-3.5 bg-blue-50 rounded-2xl border border-blue-200 text-blue-900 text-xs flex items-center gap-2">
                      <ShieldCheck className="w-4.5 h-4.5 text-blue-600 flex-shrink-0" />
                      <span>
                        <strong>পাবলিক তথ্য সুরক্ষা:</strong> প্রাইভেসি নীতি অনুযায়ী পাবলিক ওয়েবসাইটে শুধুমাত্র সংক্ষেপিত ৩টি তথ্য (নাম, কার্ড নম্বর ও মেয়াদ) দেখানো হয়।
                      </span>
                    </div>

                    {/* Primary Member Only 3 Basic Info Card */}
                    <div className="bg-slate-900 text-white p-6 sm:p-8 rounded-3xl border border-slate-800 shadow-lg space-y-6">
                      
                      <div className="flex items-center justify-between border-b border-slate-800 pb-4">
                        <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider flex items-center gap-1.5">
                          <CreditCard className="w-4 h-4" /> ভেরিফাইড হেলথ কার্ড বিবরণ
                        </span>
                        <span className={`text-[10px] font-extrabold px-2.5 py-1 rounded-full uppercase border ${
                          cardResult.cardTier === 'Platinum' ? 'bg-sky-500/20 text-sky-300 border-sky-500/30' :
                          cardResult.cardTier === 'Gold' ? 'bg-amber-500/20 text-amber-300 border-amber-500/30' :
                          'bg-slate-700 text-slate-200 border-slate-600'
                        }`}>
                          {cardResult.cardTier || 'Silver'} Card
                        </span>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        {/* 1. Card Holder Name */}
                        <div className="bg-slate-800/90 p-4 rounded-2xl border border-slate-700/80 space-y-1">
                          <span className="text-slate-400 text-[11px] font-extrabold block uppercase tracking-wider">
                            CARD HOLDER NAME
                          </span>
                          <p className="text-base sm:text-lg font-black text-white">{cardResult.memberName}</p>
                        </div>

                        {/* 2. Card Number */}
                        <div className="bg-slate-800/90 p-4 rounded-2xl border border-slate-700/80 space-y-1">
                          <span className="text-slate-400 text-[11px] font-extrabold block uppercase tracking-wider">
                            CARD NUMBER
                          </span>
                          <p className="text-base sm:text-lg font-mono font-black text-amber-400">{cardResult.cardId}</p>
                        </div>

                        {/* 3. Expiry Date */}
                        <div className="bg-slate-800/90 p-4 rounded-2xl border border-slate-700/80 space-y-1">
                          <span className="text-slate-400 text-[11px] font-extrabold block uppercase tracking-wider">
                            EXPIRY DATE
                          </span>
                          <p className={`text-base sm:text-lg font-mono font-black ${isExpired ? 'text-rose-400' : 'text-emerald-400'}`}>
                            {cardResult.expiryDate || '31-12-2026'} {isExpired ? '(মেয়াদ শেষ)' : ''}
                          </p>
                        </div>
                      </div>

                    </div>

                  </div>
                );
              })()}

            </div>
          ) : null}
        </div>
      )}

    </div>
  );
};
