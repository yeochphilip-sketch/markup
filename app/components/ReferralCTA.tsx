'use client';

import { useState, useEffect } from 'react';

interface ReferralCTAProps {
  userId: string | null;
}

const REFEREE_BONUS_DAYS = 2;
const REFERRER_BONUS_DAYS = 1;
const REFERRER_BONUS_CAP = 7;

export default function ReferralCTA({ userId }: ReferralCTAProps) {
  const [referralCode, setReferralCode] = useState('');
  const [referralCount, setReferralCount] = useState(0);
  const [bankedBonusDays, setBankedBonusDays] = useState(0);
  const [copied, setCopied] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!userId) {
      setLoading(false);
      return;
    }
    fetch(`/api/referral?userId=${userId}`)
      .then(r => r.json())
      .then(data => {
        setReferralCode(data.referralCode ?? '');
        setReferralCount(data.referralCount ?? 0);
        setBankedBonusDays(data.bankedBonusDays ?? 0);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [userId]);

  if (loading || !referralCode) return null;

 const shareText = `Join me on MARKUP — the AI-powered O-Level Humanities practice platform! Use my referral code: ${referralCode} — we both get free days `;
  const referralLink = `https://markup-five.vercel.app?ref=${referralCode}`;

  const handleCopy = () => {
    navigator.clipboard.writeText(referralCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Join MARKUP',
          text: shareText,
          url: referralLink,
        });
      } catch { /* user cancelled */ }
    } else {
      handleCopy();
    }
  };

  return (
    <div className="bg-indigo-950/30 border border-indigo-500/20 rounded-xl p-3 hover-lift">
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5 mb-1">
 <span className="text-[10px]">Gift</span>
            <span className="text-[9px] font-bold text-indigo-400 uppercase tracking-wider">
              Invite Friends — Get Free Days
            </span>
          </div>
          <p className="text-[9px] text-slate-500 leading-relaxed">
            Share your code: <strong className="text-indigo-300 font-mono tracking-wider">{referralCode}</strong>
            {referralCount > 0 && (
              <span className="text-emerald-400 ml-1">· {referralCount} friend{referralCount !== 1 ? 's' : ''} joined</span>
            )}
          </p>
        </div>
        <div className="flex items-center gap-1.5 shrink-0">
          <button
            onClick={handleCopy}
            className="bg-indigo-600/10 hover:bg-indigo-600/20 text-indigo-400 border border-indigo-500/20 text-[9px] font-bold px-2 py-1.5 rounded-lg transition"
          >
            {copied ? '✓ Copied!' : 'Copy'}
          </button>
          <button
            onClick={handleShare}
            className="bg-emerald-600/10 hover:bg-emerald-600/20 text-emerald-400 border border-emerald-500/20 text-[9px] font-bold px-2 py-1.5 rounded-lg transition"
          >
            Share
          </button>
        </div>
      </div>
      <p className="text-[8px] text-slate-600 mt-1.5">
        You earn <strong className="text-indigo-400">+{REFERRER_BONUS_DAYS} free day</strong> per friend
        (up to {REFERRER_BONUS_CAP} days) · your friend gets <strong className="text-emerald-400">+{REFEREE_BONUS_DAYS} free days</strong> — applied instantly.
        {bankedBonusDays > 0 && (
          <span className="text-amber-400"> · {bankedBonusDays} day{bankedBonusDays !== 1 ? 's' : ''} banked for your next unlock</span>
        )}
      </p>
    </div>
  );
}
