import React, { useState } from 'react';
import { X, Trophy, Wallet, ShieldAlert, CheckCircle2, AlertCircle, Sparkles } from 'lucide-react';
import { Tournament, UserProfile } from '../types';
import { db } from '../services/firebaseSimulator';
import confetti from 'canvas-confetti';

interface JoinTournamentModalProps {
  tournament: Tournament;
  currentUser?: UserProfile;
  onClose: () => void;
  onSuccess: () => void;
  onOpenDeposit: () => void;
}

export const JoinTournamentModal: React.FC<JoinTournamentModalProps> = ({
  tournament,
  currentUser,
  onClose,
  onSuccess,
  onOpenDeposit
}) => {
  const [ign, setIgn] = useState(currentUser?.defaultIgn || '');
  const [gameUid, setGameUid] = useState(currentUser?.defaultGameUid || '');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const walletBalance = currentUser?.walletBalance || 0;
  const hasSufficientFunds = walletBalance >= tournament.entryFee;
  const isBanned = !!currentUser?.banned;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (isBanned) {
      setError('Firebase Security Rule Violation: Banned users cannot register for tournaments.');
      return;
    }

    if (!ign.trim()) {
      setError('Please enter your exact In-Game Name (IGN).');
      return;
    }

    if (!gameUid.trim() || gameUid.trim().length < 5) {
      setError('Please enter a valid numeric Character ID / Game UID.');
      return;
    }

    if (!hasSufficientFunds) {
      setError(`Insufficient balance (₹${walletBalance}). Required: ₹${tournament.entryFee}`);
      return;
    }

    setLoading(true);
    const res = db.joinTournament(tournament.key, ign.trim(), gameUid.trim());
    setLoading(false);

    if (!res.success) {
      setError(res.message);
    } else {
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 }
      });
      onSuccess();
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-lg rounded-3xl bg-[#0f1422] border border-slate-800 shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="p-5 border-b border-slate-800/80 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center">
              <Trophy className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-gaming text-lg font-bold text-white tracking-wide">
                Join Tournament Lobby
              </h3>
              <p className="text-xs text-slate-400">
                {tournament.title}
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

        {/* Content Body */}
        <form onSubmit={handleSubmit} className="p-5 sm:p-6 space-y-4">
          {/* Rules Security Banner */}
          <div className="p-3 rounded-2xl bg-indigo-950/40 border border-indigo-800/40 text-indigo-300 text-xs space-y-1">
            <div className="font-bold flex items-center gap-1.5 text-indigo-200">
              <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
              <span>Firebase Security Rule Enforced:</span>
            </div>
            <p className="text-[11px] font-mono-code text-indigo-300/90 leading-relaxed">
              match_participants/$matchId/$uid: newData.hasChildren(['ign','gameUid','count']) && !users/$uid/banned
            </p>
          </div>

          {/* Account Banned Warning */}
          {isBanned && (
            <div className="p-3 rounded-2xl bg-red-950/60 border border-red-800 text-red-300 text-xs flex items-center gap-2">
              <ShieldAlert className="w-5 h-5 text-red-400 shrink-0" />
              <span>
                Your account is flagged as <strong>BANNED</strong>. The Realtime Database rule strictly denies tournament writes for banned accounts.
              </span>
            </div>
          )}

          {/* Entry Fee & Wallet Summary */}
          <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800/80 flex items-center justify-between">
            <div>
              <span className="text-xs text-slate-400 uppercase font-semibold">Entry Fee</span>
              <p className="font-gaming text-2xl font-black text-amber-400">
                ₹{tournament.entryFee}
              </p>
            </div>

            <div className="text-right">
              <span className="text-xs text-slate-400 uppercase font-semibold flex items-center gap-1 justify-end">
                <Wallet className="w-3.5 h-3.5 text-slate-400" />
                <span>Your Balance</span>
              </span>
              <p className={`font-mono-code text-lg font-bold ${hasSufficientFunds ? 'text-white' : 'text-red-400'}`}>
                ₹{walletBalance}
              </p>
            </div>
          </div>

          {!hasSufficientFunds && (
            <div className="flex items-center justify-between gap-3 p-3 rounded-xl bg-amber-950/40 border border-amber-800/40 text-amber-300 text-xs">
              <div className="flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-amber-400 shrink-0" />
                <span>Need ₹{tournament.entryFee - walletBalance} more to join.</span>
              </div>
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onOpenDeposit();
                }}
                className="px-3 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs uppercase"
              >
                Add Cash
              </button>
            </div>
          )}

          {/* Input: In-Game Name */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center justify-between">
              <span>Player In-Game Name (IGN)</span>
              <span className="text-[10px] text-amber-400 lowercase">Exact as in game</span>
            </label>
            <input
              type="text"
              required
              value={ign}
              onChange={(e) => setIgn(e.target.value)}
              placeholder="e.g. VIPER・Godz"
              className="w-full px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white placeholder-slate-500 focus:outline-none focus:border-amber-500 font-semibold text-sm"
            />
          </div>

          {/* Input: Game UID */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center justify-between">
              <span>Game Character ID / UID</span>
              <span className="text-[10px] text-slate-400">Profile ID number</span>
            </label>
            <input
              type="text"
              required
              value={gameUid}
              onChange={(e) => setGameUid(e.target.value)}
              placeholder="e.g. 5192847102"
              className="w-full px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white placeholder-slate-500 focus:outline-none focus:border-amber-500 font-mono-code text-sm"
            />
          </div>

          {/* Important Match Rules */}
          <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800 text-[11px] text-slate-400 space-y-1">
            <p className="font-semibold text-slate-300">Room Guidelines:</p>
            <ul className="list-disc list-inside space-y-0.5">
              <li>Custom Room ID &amp; Password are released 15 mins before match start.</li>
              <li>Only registered participants can access the Room credentials.</li>
              <li>Do not share Room ID; doing so leads to disqualification and forfeiture.</li>
            </ul>
          </div>

          {error && (
            <div className="p-3 rounded-xl bg-red-950/60 border border-red-800 text-red-300 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Submit Button */}
          <div className="pt-2">
            <button
              type="submit"
              disabled={loading || isBanned || !hasSufficientFunds}
              className={`w-full py-3 px-4 rounded-xl font-bold text-sm uppercase tracking-wider transition-all shadow-lg ${
                isBanned || !hasSufficientFunds
                  ? 'bg-slate-800 text-slate-500 cursor-not-allowed'
                  : 'bg-gradient-to-r from-amber-500 via-amber-400 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-slate-950 shadow-amber-500/20 active:scale-98'
              }`}
            >
              {loading ? 'Processing Registration...' : `Pay ₹${tournament.entryFee} & Confirm Slot`}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
