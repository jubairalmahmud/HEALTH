import React, { useState, useEffect } from 'react';
import { fetchJsonSafe } from '../utils/api';
import { MedicalCard, CardDesignSettings } from '../types';
import { ShieldCheck, QrCode, Phone, HeartPulse, Award, Printer } from 'lucide-react';

export const TIER_PRESETS: Record<string, Record<string, {
  name: string;
  bgClass: string;
  badgeClass: string;
  borderClass: string;
  accentText: string;
  badgeEmoji: string;
}>> = {
  Silver: {
    classic_silver: {
      name: 'ক্লাসিক সিলভার (Classic Silver)',
      bgClass: 'bg-gradient-to-br from-slate-700 via-slate-600 to-slate-800 text-white',
      badgeClass: 'bg-slate-200 text-slate-950 border-slate-300',
      borderClass: 'border-slate-400/50',
      accentText: 'text-slate-200',
      badgeEmoji: '🥈'
    },
    bright_metallic_silver: {
      name: 'ব্রাইট মেটালিক সিলভার (Bright Metallic)',
      bgClass: 'bg-gradient-to-br from-slate-600 via-zinc-500 to-slate-700 text-white',
      badgeClass: 'bg-white text-slate-900 border-slate-200',
      borderClass: 'border-slate-300/60',
      accentText: 'text-zinc-100',
      badgeEmoji: '🥈'
    },
    dark_chrome_silver: {
      name: 'ডার্ক ক্রোম সিলভার (Dark Chrome Silver)',
      bgClass: 'bg-gradient-to-br from-slate-900 via-slate-800 to-zinc-900 text-slate-100',
      badgeClass: 'bg-zinc-300 text-zinc-900 border-zinc-400',
      borderClass: 'border-zinc-500/50',
      accentText: 'text-slate-300',
      badgeEmoji: '🥈'
    }
  },
  Gold: {
    royal_gold: {
      name: 'রয়েল গোল্ড (Royal Gold)',
      bgClass: 'bg-gradient-to-br from-amber-800 via-amber-700 to-yellow-800 text-amber-50',
      badgeClass: 'bg-amber-300 text-slate-950 border-amber-200',
      borderClass: 'border-amber-400/60',
      accentText: 'text-amber-200',
      badgeEmoji: '🏆'
    },
    sunrise_gold: {
      name: 'সানরাইজ গোল্ড (Sunrise Bright Gold)',
      bgClass: 'bg-gradient-to-br from-amber-700 via-yellow-600 to-amber-800 text-white',
      badgeClass: 'bg-yellow-300 text-slate-950 border-yellow-200',
      borderClass: 'border-yellow-300/70',
      accentText: 'text-yellow-100',
      badgeEmoji: '🏆'
    },
    metallic_amber_gold: {
      name: 'ডিপ আম্বার গোল্ড (Deep Amber Gold)',
      bgClass: 'bg-gradient-to-br from-amber-950 via-amber-800 to-yellow-900 text-amber-100',
      badgeClass: 'bg-amber-400 text-slate-950 border-amber-300',
      borderClass: 'border-amber-500/60',
      accentText: 'text-amber-300',
      badgeEmoji: '🏆'
    }
  },
  Platinum: {
    royal_platinum: {
      name: 'রয়েল সাইবার প্লাটিনাম (Royal Cyber Platinum)',
      bgClass: 'bg-gradient-to-br from-slate-950 via-cyan-950 to-indigo-950 text-cyan-50',
      badgeClass: 'bg-cyan-400 text-slate-950 border-cyan-200',
      borderClass: 'border-cyan-400/60',
      accentText: 'text-cyan-200',
      badgeEmoji: '👑'
    },
    dark_titanium_platinum: {
      name: 'ডার্ক টাইটেনিয়াম প্লাটিনাম (Dark Titanium Black)',
      bgClass: 'bg-gradient-to-br from-black via-slate-900 to-slate-950 text-slate-100',
      badgeClass: 'bg-cyan-300 text-slate-950 border-cyan-100',
      borderClass: 'border-slate-600/70',
      accentText: 'text-slate-300',
      badgeEmoji: '👑'
    },
    platinum_chrome_blue: {
      name: 'প্লাটিনাম ক্রোম প্রিমিয়াম (Platinum Chrome Blue)',
      bgClass: 'bg-gradient-to-br from-sky-950 via-slate-900 to-blue-950 text-sky-100',
      badgeClass: 'bg-sky-300 text-slate-950 border-sky-100',
      borderClass: 'border-sky-400/60',
      accentText: 'text-sky-200',
      badgeEmoji: '👑'
    }
  }
};

interface Props {
  card: MedicalCard;
  showPrintButton?: boolean;
  cardDesignSettings?: CardDesignSettings;
}

export const MedicalCardPrint: React.FC<Props> = ({ card, showPrintButton = true, cardDesignSettings }) => {
  const [settings, setSettings] = useState<CardDesignSettings | null>(cardDesignSettings || null);

  useEffect(() => {
    if (cardDesignSettings) {
      setSettings(cardDesignSettings);
      return;
    }
    fetchJsonSafe('/api/card-design-settings').then(data => {
      if (data) setSettings(data);
    });
  }, [cardDesignSettings]);

  const handlePrint = () => {
    window.print();
  };

  // Determine normalized Tier ('Silver' | 'Gold' | 'Platinum')
  const tierKey = (card.cardTier || 'Silver').charAt(0).toUpperCase() + (card.cardTier || 'Silver').slice(1).toLowerCase();
  const activeTierKey = (['Silver', 'Gold', 'Platinum'].includes(tierKey) ? tierKey : 'Silver') as 'Silver' | 'Gold' | 'Platinum';

  // Retrieve Theme Config for active tier
  const tierConfig = activeTierKey === 'Gold'
    ? settings?.goldTheme
    : activeTierKey === 'Platinum'
    ? settings?.platinumTheme
    : settings?.silverTheme;

  const presetKey = tierConfig?.presetKey || (activeTierKey === 'Gold' ? 'royal_gold' : activeTierKey === 'Platinum' ? 'royal_platinum' : 'classic_silver');
  const presetStyle = TIER_PRESETS[activeTierKey]?.[presetKey] || TIER_PRESETS[activeTierKey]?.[Object.keys(TIER_PRESETS[activeTierKey])[0]];

  const cardBgClass = tierConfig?.customGradient && tierConfig.customGradient.trim().length > 0
    ? tierConfig.customGradient
    : presetStyle?.bgClass || 'bg-gradient-to-br from-slate-700 via-slate-600 to-slate-800 text-white';

  const badgeClass = presetStyle?.badgeClass || 'bg-slate-200 text-slate-950 border-slate-300';
  const borderClass = presetStyle?.borderClass || 'border-slate-400/50';
  const accentTextClass = presetStyle?.accentText || 'text-slate-200';
  const badgeEmoji = presetStyle?.badgeEmoji || '🥈';

  const badgeText = tierConfig?.badgeText || `${activeTierKey} Card`;
  const headerTitle = settings?.headerTitle || 'DIGITAL MEDI BRIDGE';
  const headerSubtitle = settings?.headerSubtitle || 'Healthcare Service Platform & Medical Network';
  const logoText = settings?.logoText || 'DMB';
  const logoUrl = settings?.logoUrl;
  const helpline = settings?.helpline || card.hotline || '+8809658887470';
  const slogan = settings?.slogan || 'স্মার্ট স্বাস্থ্য সেবায় আপনার নির্ভরযোগ্য ডিজিটাল হেলথ পার্টনার';
  const footerText = settings?.footerText || 'DMB Healthcare Network, Bangladesh';
  const websiteUrl = settings?.websiteUrl || 'www.health.nit.bd';
  const disclaimerText = settings?.disclaimerText || '⚠️ এই কার্ডটি হস্তান্তরযোগ্য নয়। সেবার সময়ে মূল কার্ড ও ভেরিফিকেশন প্রযোজ্য।';

  const memberLimit = card.memberLimit || (activeTierKey === 'Platinum' ? 8 : activeTierKey === 'Gold' ? 6 : 4);

  const isVisible = (fieldKey: string) => {
    if (!settings || !settings.fieldVisibility) return true;
    return settings.fieldVisibility[fieldKey as keyof typeof settings.fieldVisibility] !== false;
  };

  return (
    <div className="flex flex-col items-center gap-4">
      {/* Front & Back Card View Container */}
      <div
        id={showPrintButton ? "printable-medical-card" : undefined}
        className={`${showPrintButton ? "printable-card-area" : ""} w-full max-w-[85.6mm] space-y-3`}
      >
        
        {/* CARD FRONT SIDE (Standard CR80 International Card Size: 85.6mm x 53.98mm) */}
        <div
          className={`relative overflow-hidden rounded-xl ${cardBgClass} p-2.5 sm:p-3 w-[85.6mm] max-w-full h-[53.98mm] flex flex-col justify-between shadow-xl border ${borderClass} print:shadow-none cr80-card-box`}
          style={{ width: '323px', height: '204px', minWidth: '323px', minHeight: '204px', maxWidth: '323px', maxHeight: '204px', boxSizing: 'border-box' }}
        >
          
          {/* Subtle Background Watermark Pattern */}
          <div className="absolute -right-8 -bottom-8 opacity-10 pointer-events-none">
            <HeartPulse className="w-48 h-48 text-white" />
          </div>

          {/* Top Bar */}
          <div className="flex items-center justify-between pb-1 border-b border-white/20 flex-shrink-0">
            <div className="flex items-center gap-1.5 min-w-0">
              {isVisible('logo') && (
                logoUrl ? (
                  <img
                    src={logoUrl}
                    alt="Logo"
                    className="w-6 h-6 rounded-md object-cover border border-white/30 bg-white/10"
                    style={{ width: '24px', height: '24px', minWidth: '24px', minHeight: '24px', maxWidth: '24px', maxHeight: '24px', objectFit: 'cover' }}
                  />
                ) : (
                  <div className="w-6 h-6 rounded-md bg-white/10 backdrop-blur-md flex items-center justify-center border border-white/30 text-emerald-300 font-black text-[10px] flex-shrink-0" style={{ width: '24px', height: '24px' }}>
                    {logoText}
                  </div>
                )
              )}
              {(isVisible('headerTitle') || isVisible('headerSubtitle')) && (
                <div className="min-w-0 leading-tight">
                  {isVisible('headerTitle') && (
                    <h3 className="font-extrabold text-[10px] sm:text-[11px] tracking-wide leading-tight text-white truncate">
                      {headerTitle}
                    </h3>
                  )}
                  {isVisible('headerSubtitle') && (
                    <p className="text-[7px] uppercase text-slate-200/90 font-medium tracking-wider truncate">
                      {headerSubtitle}
                    </p>
                  )}
                </div>
              )}
            </div>
            
            {(isVisible('tierBadge') || isVisible('district')) && (
              <div className="flex flex-col items-end flex-shrink-0 ml-1">
                {isVisible('tierBadge') && (
                  <span className={`inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded-full ${badgeClass} text-[7.5px] font-extrabold uppercase shadow-sm border`}>
                    {badgeEmoji} {badgeText} ({memberLimit}P)
                  </span>
                )}
                {isVisible('district') && (
                  <span className="text-[7.5px] text-slate-200/80 mt-0.5 font-mono">
                    Pilot: {card.district || 'Gopalganj'}
                  </span>
                )}
              </div>
            )}
          </div>

          {/* Main Card Content */}
          <div className="my-auto py-0.5 flex gap-2 items-center min-h-0 flex-1">
            {/* Member Photo */}
            {isVisible('photoUrl') && (
              <div className="relative flex-shrink-0">
                <div
                  className="w-12 h-14 sm:w-13 sm:h-15 rounded-md overflow-hidden border-2 border-white/40 shadow-sm bg-slate-950 flex items-center justify-center"
                  style={{ width: '48px', height: '56px', minWidth: '48px', minHeight: '56px', maxWidth: '48px', maxHeight: '56px' }}
                >
                  <img
                    src={card.photoUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=300'}
                    alt={card.memberName || 'Member'}
                    className="w-full h-full object-cover"
                    style={{ width: '100%', height: '100%', maxWidth: '100%', maxHeight: '100%', objectFit: 'cover' }}
                    onError={(e) => {
                      (e.target as HTMLElement).setAttribute('src', 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=300');
                    }}
                  />
                </div>
                {isVisible('bloodGroup') && (card.bloodGroup) && (
                  <div className="absolute -bottom-1 -right-1 bg-rose-600 text-white text-[7.5px] font-extrabold px-1 py-0.2 rounded shadow border border-white/50">
                    {card.bloodGroup}
                  </div>
                )}
              </div>
            )}
            {!isVisible('photoUrl') && isVisible('bloodGroup') && (card.bloodGroup) && (
              <div className="flex-shrink-0">
                <div className="bg-rose-600 text-white text-[9px] font-extrabold px-1.5 py-0.5 rounded shadow border border-white/50">
                  {card.bloodGroup}
                </div>
              </div>
            )}

            {/* Details */}
            <div className="flex-1 space-y-0.5 min-w-0">
              {isVisible('memberName') && (
                <div>
                  <span className={`text-[7.5px] ${accentTextClass} uppercase tracking-wider block font-medium leading-none`}>Member Name / নাম:</span>
                  <p className="font-bold text-[11px] leading-tight text-white truncate">
                    {card.memberName || 'ব্ল্যাঙ্ক মেম্বারশিপ কার্ড'}
                  </p>
                </div>
              )}

              {(isVisible('cardId') || isVisible('memberId') || isVisible('upazila')) && (
                <div className="grid grid-cols-2 gap-1 text-[9px]">
                  {(isVisible('cardId') || isVisible('memberId')) && (
                    <div>
                      {isVisible('cardId') && (
                        <>
                          <span className={`text-[7.5px] ${accentTextClass} block leading-none`}>CARD ID:</span>
                          <span className="font-mono font-extrabold text-amber-300 text-[9.5px] block truncate leading-tight">
                            {card.cardId}
                          </span>
                        </>
                      )}
                      {isVisible('memberId') && card.memberId && (
                        <>
                          <span className={`text-[7.5px] ${accentTextClass} block leading-none mt-0.5`}>MEMBER ID:</span>
                          <span className="font-mono text-white text-[8.5px] block truncate leading-tight">
                            {card.memberId}
                          </span>
                        </>
                      )}
                    </div>
                  )}
                  {isVisible('upazila') && (
                    <div>
                      <span className={`text-[7.5px] ${accentTextClass} block leading-none`}>UPAZILA:</span>
                      <span className="font-semibold text-white truncate block text-[8.5px] leading-tight">
                        {card.upazila || 'Gopalganj Sadar'}
                      </span>
                    </div>
                  )}
                </div>
              )}

              {(isVisible('issueDate') || isVisible('expiryDate')) && (
                <div className="grid grid-cols-2 gap-1 text-[8.5px] pt-0.5 border-t border-white/15">
                  {isVisible('issueDate') && (
                    <div>
                      <span className={`text-[7px] ${accentTextClass} block leading-none`}>ISSUE:</span>
                      <span className="font-medium text-white leading-tight">{card.issueDate || '2026-08-08'}</span>
                    </div>
                  )}
                  {isVisible('expiryDate') && (
                    <div>
                      <span className={`text-[7px] ${accentTextClass} block leading-none`}>EXPIRY:</span>
                      <span className="font-medium text-amber-300 leading-tight">{card.expiryDate || card.validUntil || '2027-08-08'}</span>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Bottom Bar / Security Stamp */}
          {(isVisible('helpline') || isVisible('footerText')) && (
            <div className="pt-0.5 border-t border-white/20 flex items-center justify-between text-[7.5px] text-white/90 flex-shrink-0">
              {isVisible('helpline') ? (
                <div className="flex items-center gap-0.5">
                  <Phone className="w-2.5 h-2.5 text-emerald-300" />
                  <span className="font-mono">Helpline: {helpline}</span>
                </div>
              ) : <div />}
              {isVisible('footerText') && (
                <div className="flex items-center gap-0.5 font-semibold text-emerald-300">
                  <Award className="w-2.5 h-2.5" /> DMB HEALTH NETWORK
                </div>
              )}
            </div>
          )}
        </div>

        {/* CARD BACK SIDE (Standard CR80 International Card Size: 85.6mm x 53.98mm) */}
        <div
          className={`relative overflow-hidden rounded-xl ${cardBgClass} p-2.5 sm:p-3 w-[85.6mm] max-w-full h-[53.98mm] flex flex-col justify-between shadow-xl border ${borderClass} print:shadow-none cr80-card-box`}
          style={{ width: '323px', height: '204px', minWidth: '323px', minHeight: '204px', maxWidth: '323px', maxHeight: '204px', boxSizing: 'border-box' }}
        >
          
          {/* Subtle Background Watermark Pattern */}
          <div className="absolute -left-8 -top-8 opacity-10 pointer-events-none">
            <HeartPulse className="w-48 h-48 text-white" />
          </div>

          {/* Top Bar for Back Side */}
          {(isVisible('tierBadge') || isVisible('nidOrBirthCert')) && (
            <div className="flex items-center justify-between pb-1 border-b border-white/20 print:border-gray-300 flex-shrink-0">
              {isVisible('tierBadge') ? (
                <div className="flex items-center gap-1 text-emerald-300 font-bold text-[8.5px] uppercase tracking-wider">
                  <ShieldCheck className="w-3 h-3 text-emerald-300" /> Covered Beneficiaries ({memberLimit} Persons)
                </div>
              ) : <div />}
              {isVisible('nidOrBirthCert') && card.nidOrBirthCert && (
                <div className={`text-[7.5px] ${accentTextClass} font-mono`}>
                  NID: {card.nidOrBirthCert}
                </div>
              )}
            </div>
          )}

          {/* Main Card Back Content */}
          <div className="my-auto py-0.5 flex items-center justify-between gap-2 flex-1 min-h-0">
            <div className="space-y-0.5 flex-1 text-[9px] min-w-0">
              {/* Beneficiaries List */}
              {isVisible('beneficiaries') && (
                <div className="bg-black/30 backdrop-blur-md p-1 rounded-md border border-white/20 text-[8px] space-y-0.5">
                  <p className="font-bold text-amber-300 text-[7.5px] uppercase leading-none">নিবন্ধিত সেবাপ্রাপ্ত সদস্যবৃন্দ:</p>
                  <div className="grid grid-cols-2 gap-x-1 gap-y-0 text-white/95 text-[7.5px]">
                    {(card.beneficiaries && card.beneficiaries.length > 0
                      ? card.beneficiaries
                      : [card.memberName || 'প্রধান সেবাপ্রাপ্ত সদস্য']
                    ).slice(0, 8).map((b, i) => (
                      <p key={i} className="truncate">• {b || `সদস্য ${i+1}`}</p>
                    ))}
                  </div>
                </div>
              )}

              <div className="text-[7.5px] text-white/80 leading-tight">
                {(isVisible('upazila') || isVisible('district')) && (() => {
                  const addressParts = [card.address, card.upazila, card.district]
                    .filter(Boolean)
                    .map(p => String(p).trim())
                    .filter(p => p.toLowerCase() !== 'main road' && p.toLowerCase() !== 'mainroad');
                  const formattedAddress = addressParts.join(', ');
                  return formattedAddress ? (
                    <p className="truncate"><span className="text-white font-semibold">Address:</span> {formattedAddress}</p>
                  ) : null;
                })()}
                {isVisible('disclaimerText') && (
                  <p className="text-[7.5px] text-amber-300 mt-0.5 leading-tight truncate">{disclaimerText}</p>
                )}
              </div>
            </div>

            {/* QR Code Container */}
            {isVisible('qrCode') && (
              <div className="flex flex-col items-center justify-center p-1 rounded-md bg-white text-slate-900 border border-slate-200 shadow-sm flex-shrink-0" style={{ width: '56px', height: '62px' }}>
                {card.qrCodeDataUrl ? (
                  <img
                    src={card.qrCodeDataUrl}
                    alt="QR Code"
                    className="w-11 h-11 object-contain"
                    style={{ width: '44px', height: '44px', minWidth: '44px', minHeight: '44px', maxWidth: '44px', maxHeight: '44px', objectFit: 'contain' }}
                  />
                ) : (
                  <img
                    src={`https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(
                      (typeof window !== 'undefined' && window.location && window.location.origin ? window.location.origin : 'https://health.nit.bd') + '/?verify=' + card.cardId
                    )}`}
                    alt="QR Code"
                    className="w-11 h-11 object-contain"
                    style={{ width: '44px', height: '44px', minWidth: '44px', minHeight: '44px', maxWidth: '44px', maxHeight: '44px', objectFit: 'contain' }}
                  />
                )}
                <span className="text-[6.5px] font-mono font-bold mt-0.5 text-slate-700">SCAN TO VERIFY</span>
              </div>
            )}
          </div>

          {/* Bottom Bar for Back Side */}
          {(isVisible('slogan') || isVisible('footerText') || isVisible('websiteUrl')) && (
            <div className="pt-0.5 border-t border-white/20 print:border-gray-300 flex items-center justify-between text-[7.5px] text-white/90 flex-shrink-0">
              <span className="truncate max-w-[180px]">
                {isVisible('slogan') ? slogan : isVisible('footerText') ? footerText : ''}
              </span>
              {isVisible('websiteUrl') && (
                <span className="font-mono text-emerald-300 font-bold">{websiteUrl}</span>
              )}
            </div>
          )}
        </div>

      </div>

      {showPrintButton && (
        <button
          onClick={handlePrint}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-medium text-sm shadow-md transition-colors print:hidden cursor-pointer"
        >
          <Printer className="w-4 h-4" /> Print / Download Medical Card
        </button>
      )}
    </div>
  );
};
