import React, { useState } from 'react';
import { X, Trophy, Gift, Copy, Check, Sparkles, ArrowRight, CheckCircle2, AlertCircle } from 'lucide-react';
import { UserProfile } from '../types';
import { db } from '../services/firebaseSimulator';
import confetti from 'canvas-confetti';

interface ReferralModalProps {
  currentUser?: UserProfile;
  onClose: () => void;
  onSuccess: () => void;
}

export const ReferralModal: React.FC<ReferralModalProps> = ({
  currentUser,
  onClose,
  onSuccess
}) => {
  const [newCodeInput, setNewCodeInput] = useState('');
  const [claimCodeInput, setClaimCodeInput] = useState('');
  const [copied, setCopied] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const user = currentUser || db.getCurrentUser();
  const referralCode = user?.referralCode || 'ARENA10';

  const handleCopy = () => {
    navigator.clipboard.writeText(referralCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleCreateCode = (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(null);
    const clean = newCodeInput.toUpperCase().trim();
    const res = db.createReferralCode(clean);
    if (!res.success) {
      setMessage({ type: 'error', text: res.message });
    } else {
      confetti({ particleCount: 40, spread: 60 });
      setMessage({ type: 'success', text: res.message });
      setNewCodeInput('');
      onSuccess();
    }
  };

  const handleClaim = (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(null);
    const clean = claimCodeInput.toUpperCase().trim();
    const res = db.claimReferral(clean);
    if (!res.success) {
      setMessage({ type: 'error', text: res.message });
    } else {
      confetti({ particleCount: 70, spread: 80 });
      setMessage({ type: 'success', text: res.message });
      setClaimCodeInput('');
      onSuccess();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-lg rounded-3xl bg-[#0f1422] border border-slate-800 shadow-2xl overflow-hidden max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="p-5 border-b border-slate-800/80 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
              <Gift className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-gaming text-lg font-bold text-white tracking-wide">
                Refer Friends &amp; Earn Cash
              </h3>
              <p className="text-xs text-slate-400">
                Get ₹25 added to your wallet for every gamer friend you invite
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-slate-800/60 hover:bg-slate-800 text-slate-400 hover:text-white transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-5 sm:p-6 overflow-y-auto space-y-4">
          {/* Security rule notice */}
          <div className="p-3 rounded-2xl bg-indigo-950/40 border border-indigo-800/40 text-indigo-300 text-xs space-y-1">
            <div className="font-bold flex items-center gap-1.5 text-indigo-200">
              <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
              <span>Firebase Security Rule Enforced:</span>
            </div>
            <p className="text-[11px] font-mono-code text-indigo-300/90 leading-tight">
              {"referralCodes/$code: $code.matches(/^[A-Z0-9]{4,10}$/) && newData.isString()"}
            </p>
          </div>

          {/* User's Referral Code Card */}
          <div className="p-5 rounded-2xl bg-gradient-to-r from-emerald-950/40 via-slate-900 to-emerald-950/40 border border-emerald-500/30 text-center space-y-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-400">
              Your Referral Code
            </span>
            <div className="flex items-center justify-center gap-3">
              <span className="font-mono-code text-3xl font-black text-white tracking-widest bg-slate-900/90 px-5 py-2 rounded-xl border border-slate-700">
                {referralCode}
              </span>
              <button
                onClick={handleCopy}
                className="p-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold transition shadow-lg shadow-emerald-500/20 active:scale-95"
                title="Copy code"
              >
                {copied ? <Check className="w-5 h-5" /> : <Copy className="w-5 h-5" />}
              </button>
            </div>
            <p className="text-xs text-slate-400">
              {copied ? 'Code copied to clipboard!' : 'Share this code with teammates & squad members'}
            </p>
          </div>

          {/* Customize / Set New Code Form */}
          <form onSubmit={handleCreateCode} className="p-4 rounded-2xl bg-slate-900/70 border border-slate-800 space-y-2">
            <label className="text-xs font-bold uppercase tracking-wider text-slate-300 block">
              Customize Your Code (4 to 10 Alphanumeric chars)
            </label>
            <div className="flex items-center gap-2">
              <input
                type="text"
                maxLength={10}
                value={newCodeInput}
                onChange={(e) => setNewCodeInput(e.target.value.toUpperCase())}
                placeholder="e.g. VIPER99"
                className="flex-1 px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white font-mono-code text-sm uppercase tracking-wider focus:outline-none focus:border-emerald-500"
              />
              <button
                type="submit"
                className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-emerald-400 border border-emerald-800/50 text-xs font-bold uppercase"
              >
                Save
              </button>
            </div>
          </form>

          {/* Claim Someone Else's Code */}
          {!user?.referredBy && (
            <form onSubmit={handleClaim} className="p-4 rounded-2xl bg-slate-900/70 border border-slate-800 space-y-2">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-300 block">
                Have an Invite Code? Claim ₹25 Bonus Cash
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  maxLength={10}
                  value={claimCodeInput}
                  onChange={(e) => setClaimCodeInput(e.target.value.toUpperCase())}
                  placeholder="Enter friend's code (e.g. GHOST07)"
                  className="flex-1 px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white font-mono-code text-sm uppercase tracking-wider focus:outline-none focus:border-amber-500"
                />
                <button
                  type="submit"
                  className="px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold uppercase tracking-wider"
                >
                  Claim
                </button>
              </div>
            </form>
          )}

          {user?.referredBy && (
            <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 text-xs text-slate-400 flex items-center justify-between">
              <span>Referred by:</span>
              <span className="font-mono-code font-bold text-amber-400">{user.referredBy} (Bonus Claimed)</span>
            </div>
          )}

          {message && (
            <div className={`p-3 rounded-xl border text-xs flex items-center gap-2 ${
              message.type === 'success' ? 'bg-emerald-950/60 border-emerald-800 text-emerald-300' : 'bg-red-950/60 border-red-800 text-red-300'
            }`}>
              {message.type === 'success' ? <CheckCircle2 className="w-4 h-4 shrink-0" /> : <AlertCircle className="w-4 h-4 shrink-0" />}
              <span>{message.text}</span>
            </div>
          )}
        </div>

        <div className="p-4 border-t border-slate-800/80 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs uppercase"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
