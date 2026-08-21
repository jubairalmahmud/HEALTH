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
  inlineBg: string;
  inlineColor: string;
  inlineBadgeBg: string;
  inlineBadgeColor: string;
  inlineBorderColor: string;
  inlineAccentColor: string;
}>> = {
  Silver: {
    classic_silver: {
      name: 'ক্লাসিক সিলভার (Classic Silver)',
      bgClass: 'bg-gradient-to-br from-slate-700 via-slate-600 to-slate-800 text-white',
      badgeClass: 'bg-slate-200 text-slate-950 border-slate-300',
      borderClass: 'border-slate-400/50',
      accentText: 'text-slate-200',
      badgeEmoji: '🥈',
      inlineBg: 'linear-gradient(135deg, #334155 0%, #475569 50%, #1e293b 100%)',
      inlineColor: '#ffffff',
      inlineBadgeBg: '#e2e8f0',
      inlineBadgeColor: '#020617',
      inlineBorderColor: 'rgba(148, 163, 184, 0.5)',
      inlineAccentColor: '#e2e8f0'
    },
    bright_metallic_silver: {
      name: 'ব্রাইট মেটালিক সিলভার (Bright Metallic)',
      bgClass: 'bg-gradient-to-br from-slate-600 via-zinc-500 to-slate-700 text-white',
      badgeClass: 'bg-white text-slate-900 border-slate-200',
      borderClass: 'border-slate-300/60',
      accentText: 'text-zinc-100',
      badgeEmoji: '🥈',
      inlineBg: 'linear-gradient(135deg, #475569 0%, #71717a 50%, #334155 100%)',
      inlineColor: '#ffffff',
      inlineBadgeBg: '#ffffff',
      inlineBadgeColor: '#0f172a',
      inlineBorderColor: 'rgba(203, 213, 225, 0.6)',
      inlineAccentColor: '#f4f4f5'
    },
    dark_chrome_silver: {
      name: 'ডার্ক ক্রোম সিলভার (Dark Chrome Silver)',
      bgClass: 'bg-gradient-to-br from-slate-900 via-slate-800 to-zinc-900 text-slate-100',
      badgeClass: 'bg-zinc-300 text-zinc-900 border-zinc-400',
      borderClass: 'border-zinc-500/50',
      accentText: 'text-slate-300',
      badgeEmoji: '🥈',
      inlineBg: 'linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #18181b 100%)',
      inlineColor: '#f1f5f9',
      inlineBadgeBg: '#d4d4d8',
      inlineBadgeColor: '#18181b',
      inlineBorderColor: 'rgba(113, 113, 122, 0.5)',
      inlineAccentColor: '#cbd5e1'
    }
  },
  Gold: {
    royal_gold: {
      name: 'রয়েল গোল্ড (Royal Gold)',
      bgClass: 'bg-gradient-to-br from-amber-800 via-amber-700 to-yellow-800 text-amber-50',
      badgeClass: 'bg-amber-300 text-slate-950 border-amber-200',
      borderClass: 'border-amber-400/60',
      accentText: 'text-amber-200',
      badgeEmoji: '🏆',
      inlineBg: 'linear-gradient(135deg, #92400e 0%, #b45309 50%, #854d0e 100%)',
      inlineColor: '#fffbeb',
      inlineBadgeBg: '#fcd34d',
      inlineBadgeColor: '#020617',
      inlineBorderColor: 'rgba(251, 191, 36, 0.6)',
      inlineAccentColor: '#fde68a'
    },
    sunrise_gold: {
      name: 'সানরাইজ গোল্ড (Sunrise Bright Gold)',
      bgClass: 'bg-gradient-to-br from-amber-700 via-yellow-600 to-amber-800 text-white',
      badgeClass: 'bg-yellow-300 text-slate-950 border-yellow-200',
      borderClass: 'border-yellow-300/70',
      accentText: 'text-yellow-100',
      badgeEmoji: '🏆',
      inlineBg: 'linear-gradient(135deg, #b45309 0%, #ca8a04 50%, #92400e 100%)',
      inlineColor: '#ffffff',
      inlineBadgeBg: '#fde047',
      inlineBadgeColor: '#020617',
      inlineBorderColor: 'rgba(253, 224, 71, 0.7)',
      inlineAccentColor: '#fef9c3'
    },
    metallic_amber_gold: {
      name: 'ডিপ আম্বার গোল্ড (Deep Amber Gold)',
      bgClass: 'bg-gradient-to-br from-amber-950 via-amber-800 to-yellow-900 text-amber-100',
      badgeClass: 'bg-amber-400 text-slate-950 border-amber-300',
      borderClass: 'border-amber-500/60',
      accentText: 'text-amber-300',
      badgeEmoji: '🏆',
      inlineBg: 'linear-gradient(135deg, #451a03 0%, #92400e 50%, #713f12 100%)',
      inlineColor: '#fef3c7',
      inlineBadgeBg: '#fbbf24',
      inlineBadgeColor: '#020617',
      inlineBorderColor: 'rgba(245, 158, 11, 0.6)',
      inlineAccentColor: '#fcd34d'
    }
  },
  Platinum: {
    royal_platinum: {
      name: 'রয়েল সাইবার প্লাটিনাম (Royal Cyber Platinum)',
      bgClass: 'bg-gradient-to-br from-slate-950 via-cyan-950 to-indigo-950 text-cyan-50',
      badgeClass: 'bg-cyan-400 text-slate-950 border-cyan-200',
      borderClass: 'border-cyan-400/60',
      accentText: 'text-cyan-200',
      badgeEmoji: '👑',
      inlineBg: 'linear-gradient(135deg, #020617 0%, #083344 50%, #1e1b4b 100%)',
      inlineColor: '#ecfeff',
      inlineBadgeBg: '#22d3ee',
      inlineBadgeColor: '#020617',
      inlineBorderColor: 'rgba(34, 211, 238, 0.6)',
      inlineAccentColor: '#a5f3fc'
    },
    dark_titanium_platinum: {
      name: 'ডার্ক টাইটেনিয়াম প্লাটিনাম (Dark Titanium Black)',
      bgClass: 'bg-gradient-to-br from-black via-slate-900 to-slate-950 text-slate-100',
      badgeClass: 'bg-cyan-300 text-slate-950 border-cyan-100',
      borderClass: 'border-slate-600/70',
      accentText: 'text-slate-300',
      badgeEmoji: '👑',
      inlineBg: 'linear-gradient(135deg, #000000 0%, #0f172a 50%, #020617 100%)',
      inlineColor: '#f8fafc',
      inlineBadgeBg: '#67e8f9',
      inlineBadgeColor: '#020617',
      inlineBorderColor: 'rgba(71, 85, 105, 0.7)',
      inlineAccentColor: '#cbd5e1'
    },
    platinum_chrome_blue: {
      name: 'প্লাটিনাম ক্রোম প্রিমিয়াম (Platinum Chrome Blue)',
      bgClass: 'bg-gradient-to-br from-sky-950 via-slate-900 to-blue-950 text-sky-100',
      badgeClass: 'bg-sky-300 text-slate-950 border-sky-100',
      borderClass: 'border-sky-400/60',
      accentText: 'text-sky-200',
      badgeEmoji: '👑',
      inlineBg: 'linear-gradient(135deg, #082f49 0%, #0f172a 50%, #172554 100%)',
      inlineColor: '#e0f2fe',
      inlineBadgeBg: '#7dd3fc',
      inlineBadgeColor: '#020617',
      inlineBorderColor: 'rgba(56, 189, 248, 0.6)',
      inlineAccentColor: '#bae6fd'
    }
  }
};

interface Props {
  card: MedicalCard;
  showPrintButton?: boolean;
  cardDesignSettings?: CardDesignSettings;
  isMemberView?: boolean;
}

export const MedicalCardPrint: React.FC<Props> = ({ card, showPrintButton = true, cardDesignSettings, isMemberView = false }) => {
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

  const inlineBgStyle = tierConfig?.customGradient && tierConfig.customGradient.trim().length > 0
    ? tierConfig.customGradient
    : presetStyle?.inlineBg || 'linear-gradient(135deg, #334155 0%, #475569 50%, #1e293b 100%)';

  const inlineColorStyle = presetStyle?.inlineColor || '#ffffff';
  const inlineBorderColorStyle = presetStyle?.inlineBorderColor || 'rgba(148, 163, 184, 0.5)';
  const inlineBadgeBgStyle = presetStyle?.inlineBadgeBg || '#e2e8f0';
  const inlineBadgeColorStyle = presetStyle?.inlineBadgeColor || '#020617';

  const badgeText = tierConfig?.badgeText || `${activeTierKey} Card`;
  const headerTitle = settings?.headerTitle || 'DIGITAL MEDI BRIDGE';
  const headerSubtitle = settings?.headerSubtitle || 'Healthcare Service Platform & Medical Network';
  const logoText = settings?.logoText || 'DMB';
  const logoUrl = settings?.logoUrl;
  const helpline = settings?.helpline || card.hotline || '+8809658887470';
  const slogan = settings?.slogan || 'YOUR TRUSTED DIGITAL HEALTHCARE NETWORK & PARTNER';
  const footerText = settings?.footerText || 'DMB Healthcare Network, Bangladesh';
  const websiteUrl = settings?.websiteUrl || 'www.health.nit.bd';
  const disclaimerText = settings?.disclaimerText || '⚠️ THIS CARD IS NON-TRANSFERABLE. PRESENT ORIGINAL CARD & VERIFY AT SERVICE TIME.';

  const memberLimit = card.memberLimit || (activeTierKey === 'Platinum' ? 8 : activeTierKey === 'Gold' ? 6 : 4);

  const isCardExpired = (): boolean => {
    if (card.status === 'EXPIRED') return true;
    const exp = card.expiryDate || card.validUntil;
    if (!exp) return false;
    if (exp.toLowerCase().includes('lifetime') || exp.includes('আজীবন')) return false;
    const expTime = new Date(exp).getTime();
    if (isNaN(expTime)) return false;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return expTime < today.getTime();
  };
  const expired = isCardExpired();

  const isVisible = (fieldKey: string) => {
    // When a member views their own card in the member dashboard, all essential member information is displayed
    if (isMemberView) return true;
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
          style={{
            width: '323px',
            height: '204px',
            minWidth: '323px',
            minHeight: '204px',
            maxWidth: '323px',
            maxHeight: '204px',
            boxSizing: 'border-box',
            background: inlineBgStyle,
            color: inlineColorStyle,
            borderColor: inlineBorderColorStyle,
            borderRadius: '12px',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            padding: '10px'
          }}
        >
          
          {/* Top Bar */}
          <div className="flex items-center justify-between pb-1 border-b border-white/20 flex-shrink-0" style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.25)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
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
                  <div className="w-6 h-6 rounded-md bg-white/10 backdrop-blur-md flex items-center justify-center border border-white/30 text-emerald-300 font-black text-[10px] flex-shrink-0" style={{ width: '24px', height: '24px', backgroundColor: 'rgba(255,255,255,0.15)', color: '#6ee7b7' }}>
                    {logoText}
                  </div>
                )
              )}
              {(isVisible('headerTitle') || isVisible('headerSubtitle')) && (
                <div className="min-w-0 leading-tight">
                  {isVisible('headerTitle') && (
                    <h3 className="font-extrabold text-[10px] sm:text-[11px] tracking-wide leading-tight text-white truncate" style={{ color: '#ffffff' }}>
                      {headerTitle}
                    </h3>
                  )}
                  {isVisible('headerSubtitle') && (
                    <p className="text-[7px] uppercase text-slate-200/90 font-medium tracking-wider truncate" style={{ color: '#e2e8f0' }}>
                      {headerSubtitle}
                    </p>
                  )}
                </div>
              )}
            </div>
            
            {(isVisible('tierBadge') || isVisible('district')) && (
              <div className="flex flex-col items-end flex-shrink-0 ml-1">
                {isVisible('tierBadge') && (
                  <span
                    className={`inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded-full ${badgeClass} text-[7.5px] font-extrabold uppercase shadow-sm border`}
                    style={{ backgroundColor: inlineBadgeBgStyle, color: inlineBadgeColorStyle }}
                  >
                    {badgeEmoji} {badgeText} ({memberLimit}P)
                  </span>
                )}
                {isVisible('district') && (
                  <span className="text-[7.5px] text-slate-200/80 mt-0.5 font-mono" style={{ color: '#e2e8f0' }}>
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
                  style={{ width: '48px', height: '56px', minWidth: '48px', minHeight: '56px', maxWidth: '48px', maxHeight: '56px', borderRadius: '6px', overflow: 'hidden', border: '2px solid rgba(255, 255, 255, 0.5)', backgroundColor: '#020617' }}
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
                  <div className="absolute -bottom-1 -right-1 bg-rose-600 text-white text-[7.5px] font-extrabold px-1 py-0.2 rounded shadow border border-white/50" style={{ backgroundColor: '#e11d48', color: '#ffffff' }}>
                    {card.bloodGroup}
                  </div>
                )}
              </div>
            )}
            {!isVisible('photoUrl') && isVisible('bloodGroup') && (card.bloodGroup) && (
              <div className="flex-shrink-0">
                <div className="bg-rose-600 text-white text-[9px] font-extrabold px-1.5 py-0.5 rounded shadow border border-white/50" style={{ backgroundColor: '#e11d48', color: '#ffffff' }}>
                  {card.bloodGroup}
                </div>
              </div>
            )}

            {/* Details */}
            <div className="flex-1 space-y-0.5 min-w-0">
              {isVisible('memberName') && (
                <div>
                  <span className={`text-[7.5px] ${accentTextClass} uppercase tracking-wider block font-medium leading-none`} style={{ color: '#e2e8f0' }}>MEMBER NAME:</span>
                  <p className="font-bold text-[11px] leading-tight text-white truncate" style={{ color: '#ffffff' }}>
                    {card.memberName || 'BLANK MEMBERSHIP CARD'}
                  </p>
                </div>
              )}

              {(isVisible('cardId') || isVisible('memberId') || isVisible('upazila')) && (
                <div style={{ display: 'flex', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', gap: '4px', fontSize: '9px' }}>
                  {(isVisible('cardId') || isVisible('memberId')) && (
                    <div style={{ flex: '1 1 0%', minWidth: 0 }}>
                      {isVisible('cardId') && (
                        <>
                          <span className={`text-[7.5px] ${accentTextClass} block leading-none`} style={{ color: '#e2e8f0' }}>CARD ID:</span>
                          <span className="font-mono font-extrabold text-amber-300 text-[9.5px] block truncate leading-tight" style={{ color: '#fcd34d' }}>
                            {card.cardId}
                          </span>
                        </>
                      )}
                      {isVisible('memberId') && card.memberId && (
                        <>
                          <span className={`text-[7.5px] ${accentTextClass} block leading-none mt-0.5`} style={{ color: '#e2e8f0' }}>MEMBER ID:</span>
                          <span className="font-mono text-white text-[8.5px] block truncate leading-tight" style={{ color: '#ffffff' }}>
                            {card.memberId}
                          </span>
                        </>
                      )}
                    </div>
                  )}
                  {isVisible('upazila') && (
                    <div style={{ flex: '1 1 0%', minWidth: 0, textAlign: 'right' }}>
                      <span className={`text-[7.5px] ${accentTextClass} block leading-none`} style={{ color: '#e2e8f0' }}>UPAZILA:</span>
                      <span className="font-semibold text-white truncate block text-[8.5px] leading-tight" style={{ color: '#ffffff' }}>
                        {card.upazila || 'Gopalganj Sadar'}
                      </span>
                    </div>
                  )}
                </div>
              )}

              {(isVisible('issueDate') || isVisible('expiryDate')) && (
                <div style={{ display: 'flex', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', gap: '4px', fontSize: '8.5px', paddingTop: '2px', borderTop: '1px solid rgba(255, 255, 255, 0.2)' }}>
                  {isVisible('issueDate') && (
                    <div>
                      <span className={`text-[7px] ${accentTextClass} block leading-none`} style={{ color: '#e2e8f0' }}>ISSUE:</span>
                      <span className="font-medium text-white leading-tight" style={{ color: '#ffffff' }}>{card.issueDate || '2026-08-08'}</span>
                    </div>
                  )}
                  {isVisible('expiryDate') && (
                    <div style={{ textAlign: 'right' }}>
                      <span className={`text-[7px] ${accentTextClass} block leading-none`} style={{ color: '#e2e8f0' }}>EXPIRY:</span>
                      {expired ? (
                        <span className="font-bold text-rose-300 leading-tight bg-rose-900/80 px-1 py-0.5 rounded text-[7.5px] border border-rose-400/50 inline-block" style={{ color: '#fca5a5' }}>
                          মেয়াদ শেষ (EXPIRED)
                        </span>
                      ) : (
                        <span className="font-medium text-amber-300 leading-tight" style={{ color: '#fcd34d' }}>{card.expiryDate || card.validUntil || '2027-08-08'}</span>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Bottom Bar / Security Stamp */}
          {(isVisible('helpline') || isVisible('footerText')) && (
            <div className="pt-0.5 border-t border-white/20 flex items-center justify-between text-[7.5px] text-white/90 flex-shrink-0" style={{ borderTop: '1px solid rgba(255, 255, 255, 0.25)', color: '#f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              {isVisible('helpline') ? (
                <div className="flex items-center gap-0.5" style={{ display: 'flex', alignItems: 'center', gap: '2px' }}>
                  <Phone className="w-2.5 h-2.5 text-emerald-300" style={{ width: '10px', height: '10px', color: '#6ee7b7' }} />
                  <span className="font-mono">Helpline: {helpline}</span>
                </div>
              ) : <div />}
              {isVisible('footerText') && (
                <div className="flex items-center gap-0.5 font-semibold text-emerald-300" style={{ color: '#6ee7b7', display: 'flex', alignItems: 'center', gap: '2px' }}>
                  <Award className="w-2.5 h-2.5" style={{ width: '10px', height: '10px' }} /> DMB HEALTH NETWORK
                </div>
              )}
            </div>
          )}
        </div>

        {/* CARD BACK SIDE (Standard CR80 International Card Size: 85.6mm x 53.98mm) */}
        <div
          className={`relative overflow-hidden rounded-xl ${cardBgClass} p-2.5 sm:p-3 w-[85.6mm] max-w-full h-[53.98mm] flex flex-col justify-between shadow-xl border ${borderClass} print:shadow-none cr80-card-box`}
          style={{
            width: '323px',
            height: '204px',
            minWidth: '323px',
            minHeight: '204px',
            maxWidth: '323px',
            maxHeight: '204px',
            boxSizing: 'border-box',
            background: inlineBgStyle,
            color: inlineColorStyle,
            borderColor: inlineBorderColorStyle,
            borderRadius: '12px',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            padding: '10px'
          }}
        >
          
          {/* Top Bar for Back Side */}
          {(isVisible('tierBadge') || isVisible('nidOrBirthCert')) && (
            <div className="flex items-center justify-between pb-1 border-b border-white/20 print:border-gray-300 flex-shrink-0" style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.25)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              {isVisible('tierBadge') ? (
                <div className="flex items-center gap-1 text-emerald-300 font-bold text-[8.5px] uppercase tracking-wider" style={{ color: '#6ee7b7', display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <ShieldCheck className="w-3 h-3 text-emerald-300" style={{ width: '12px', height: '12px', color: '#6ee7b7' }} /> Covered Beneficiaries ({memberLimit} Persons)
                </div>
              ) : <div />}
              {isVisible('nidOrBirthCert') && card.nidOrBirthCert && (
                <div className={`text-[7.5px] ${accentTextClass} font-mono`} style={{ color: '#e2e8f0' }}>
                  NID: {card.nidOrBirthCert}
                </div>
              )}
            </div>
          )}

          {/* Main Card Back Content */}
          <div className="my-auto py-0.5 flex items-center justify-between gap-2 flex-1 min-h-0" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px' }}>
            <div className="space-y-0.5 flex-1 text-[9px] min-w-0" style={{ flex: '1 1 0%', minWidth: 0 }}>
              {/* Beneficiaries List */}
              {isVisible('beneficiaries') && (
                <div
                  className="p-1 rounded-md border border-white/20 text-[8px] space-y-0.5"
                  style={{ backgroundColor: 'rgba(0, 0, 0, 0.35)', color: '#ffffff', borderColor: 'rgba(255, 255, 255, 0.25)', padding: '4px', borderRadius: '6px' }}
                >
                  <p className="font-bold text-amber-300 text-[7.5px] uppercase leading-none" style={{ color: '#fde047', margin: '0 0 2px 0' }}>FAMILY BENEFICIARIES (DISCOUNT ELIGIBLE):</p>
                  <div style={{ display: 'flex', flexDirection: 'row', flexWrap: 'wrap', gap: '2px 4px', fontSize: '7.5px' }}>
                    {(card.beneficiaries && card.beneficiaries.length > 0
                      ? card.beneficiaries
                      : [card.memberName || 'PRIMARY MEMBER']
                    ).slice(0, 8).map((b, i) => (
                      <p key={i} style={{ width: '47%', color: '#ffffff', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', margin: 0 }}>• {b || `MEMBER ${i+1}`}</p>
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
                    <p className="truncate" style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}><span className="text-white font-semibold" style={{ color: '#ffffff' }}>Address:</span> {formattedAddress}</p>
                  ) : null;
                })()}
                {isVisible('disclaimerText') && (
                  <p
                    className="text-[7.2px] text-amber-300 mt-0.5 leading-tight"
                    style={{
                      color: '#fcd34d',
                      overflow: 'hidden',
                      display: '-webkit-box',
                      WebkitLineClamp: 2,
                      WebkitBoxOrient: 'vertical',
                      lineHeight: '1.25',
                      wordBreak: 'break-word',
                      whiteSpace: 'normal',
                      maxHeight: '2.5em'
                    }}
                  >
                    {disclaimerText}
                  </p>
                )}
              </div>
            </div>

            {/* QR Code Container - Perfectly sized 56px x 56px with zero overflow */}
            {isVisible('qrCode') && (
              <div
                className="flex flex-col items-center justify-center p-1 rounded-md bg-white text-slate-900 border border-slate-200 shadow-sm flex-shrink-0 overflow-hidden"
                style={{
                  width: '56px',
                  height: '56px',
                  minWidth: '56px',
                  minHeight: '56px',
                  maxWidth: '56px',
                  maxHeight: '56px',
                  boxSizing: 'border-box',
                  backgroundColor: '#ffffff',
                  color: '#0f172a',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  padding: '3px',
                  borderRadius: '6px',
                  border: '1px solid #cbd5e1',
                  overflow: 'hidden'
                }}
              >
                {card.qrCodeDataUrl ? (
                  <img
                    src={card.qrCodeDataUrl}
                    alt="QR Code"
                    className="object-contain"
                    style={{ width: '38px', height: '38px', minWidth: '38px', minHeight: '38px', maxWidth: '38px', maxHeight: '38px', objectFit: 'contain' }}
                  />
                ) : (
                  <img
                    src={`https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(
                      cardDesignSettings?.qrCodeUrl || settings?.qrCodeUrl || 'https://health.nit.bd/?verify'
                    )}`}
                    alt="QR Code"
                    className="object-contain"
                    style={{ width: '38px', height: '38px', minWidth: '38px', minHeight: '38px', maxWidth: '38px', maxHeight: '38px', objectFit: 'contain' }}
                  />
                )}
                <span
                  className="font-mono font-bold text-slate-800 leading-none uppercase tracking-tighter"
                  style={{ fontSize: '6px', marginTop: '2px', lineHeight: '1', color: '#1e293b', whiteSpace: 'nowrap' }}
                >
                  SCAN TO VERIFY
                </span>
              </div>
            )}
          </div>

          {/* Bottom Bar for Back Side */}
          {(isVisible('slogan') || isVisible('footerText') || isVisible('websiteUrl')) && (
            <div className="pt-1 border-t border-white/20 print:border-gray-300 flex items-center justify-between text-[8px] text-white/95 flex-shrink-0 gap-2" style={{ borderTop: '1px solid rgba(255, 255, 255, 0.25)', color: '#f1f5f9' }}>
              <div className="flex-1 min-w-0">
                {isVisible('slogan') && (
                  <p
                    className="text-[8px] sm:text-[8.5px] font-semibold text-emerald-200 leading-tight"
                    style={{
                      color: '#a7f3d0',
                      overflow: 'hidden',
                      display: '-webkit-box',
                      WebkitLineClamp: 2,
                      WebkitBoxOrient: 'vertical',
                      lineHeight: '1.25',
                      wordBreak: 'break-word',
                      whiteSpace: 'normal',
                      maxHeight: '2.6em'
                    }}
                  >
                    {slogan}
                  </p>
                )}
                {!isVisible('slogan') && isVisible('footerText') && (
                  <span className="truncate block text-[8px]" style={{ color: '#f1f5f9', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {footerText}
                  </span>
                )}
              </div>
              {isVisible('websiteUrl') && (
                <span className="font-mono text-emerald-300 font-bold flex-shrink-0 text-[8.5px]" style={{ color: '#6ee7b7' }}>{websiteUrl}</span>
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
