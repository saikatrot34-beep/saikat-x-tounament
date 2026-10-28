import React from 'react';
import { X, Trophy, Medal, Target, ShieldCheck, Sparkles, Award } from 'lucide-react';
import { Tournament, MatchResult } from '../types';
import { db } from '../services/firebaseSimulator';

interface MatchResultModalProps {
  tournament: Tournament;
  onClose: () => void;
}

export const MatchResultModal: React.FC<MatchResultModalProps> = ({
  tournament,
  onClose
}) => {
  const dbState = db.getState();
  const result: MatchResult | undefined = dbState.match_results[tournament.key];

  const winners = result?.winners || [];
  const topWinner = winners.find((w) => w.rank === 1);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-xl rounded-3xl bg-[#0f1422] border border-slate-800 shadow-2xl overflow-hidden max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="p-5 border-b border-slate-800/80 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center">
              <Trophy className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-gaming text-lg font-bold text-white tracking-wide">
                Match Results &amp; Leaderboard
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

        <div className="p-5 sm:p-6 overflow-y-auto space-y-4">
          {/* Security rule info */}
          <div className="p-3 rounded-2xl bg-indigo-950/40 border border-indigo-800/40 text-indigo-300 text-xs">
            <span className="font-bold text-indigo-200">Firebase Node: </span>
            <code className="font-mono-code text-[11px]">match_results/{tournament.key}</code>
            <p className="text-[11px] opacity-80 mt-0.5">
              Read: auth != null | Write: Admin only. Prizes automatically credited to players&apos; Win Balance.
            </p>
          </div>

          {/* Winner Banner / Champion Showcase */}
          {topWinner && (
            <div className="relative p-5 rounded-2xl bg-gradient-to-r from-amber-600/20 via-orange-600/30 to-amber-600/20 border border-amber-500/40 overflow-hidden text-center space-y-2">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500 text-slate-950 font-black text-xs uppercase tracking-wider shadow-md shadow-amber-500/30">
                <CrownIcon className="w-3.5 h-3.5" />
                <span>CHAMPION (RANK #1 WWCD)</span>
              </div>
              <h4 className="font-gaming text-2xl font-black text-white tracking-wide">
                {topWinner.ign}
              </h4>
              <p className="font-mono-code text-xs text-slate-300">
                Game UID: {topWinner.gameUid}
              </p>
              <div className="flex items-center justify-center gap-4 pt-1 font-mono-code">
                <span className="text-emerald-400 font-bold text-sm flex items-center gap-1">
                  <Target className="w-4 h-4" /> {topWinner.kills} Kills
                </span>
                <span className="text-amber-400 font-black text-lg">
                  Prize: ₹{topWinner.prize}
                </span>
              </div>
            </div>
          )}

          {/* Leaderboard Table */}
          <div className="rounded-2xl border border-slate-800 overflow-hidden bg-slate-900/60">
            <div className="px-4 py-2.5 bg-slate-800/80 border-b border-slate-800 flex items-center justify-between text-[11px] font-bold text-slate-400 uppercase tracking-wider">
              <span>Rank &amp; Player</span>
              <div className="flex items-center gap-6">
                <span>Kills</span>
                <span>Prize Won</span>
              </div>
            </div>

            <div className="divide-y divide-slate-800/80">
              {winners.map((w) => {
                const isFirst = w.rank === 1;
                const isSecond = w.rank === 2;
                const isThird = w.rank === 3;

                return (
                  <div
                    key={w.rank}
                    className="px-4 py-3 flex items-center justify-between text-xs hover:bg-slate-800/30 transition"
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-7 h-7 rounded-lg flex items-center justify-center font-bold text-xs ${
                        isFirst
                          ? 'bg-amber-500 text-slate-950'
                          : isSecond
                          ? 'bg-slate-300 text-slate-950'
                          : isThird
                          ? 'bg-amber-700 text-white'
                          : 'bg-slate-800 text-slate-400'
                      }`}>
                        #{w.rank}
                      </div>
                      <div>
                        <p className="font-bold text-slate-200">{w.ign}</p>
                        <p className="text-[10px] text-slate-400 font-mono-code">UID: {w.gameUid}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-6 font-mono-code">
                      <span className="text-slate-300 font-semibold">{w.kills} kills</span>
                      <span className="text-amber-400 font-bold text-sm min-w-[60px] text-right">
                        ₹{w.prize}
                      </span>
                    </div>
                  </div>
                );
              })}

              {winners.length === 0 && (
                <div className="p-6 text-center text-slate-400 text-xs">
                  Results are being compiled by the match referee. Please check back shortly.
                </div>
              )}
            </div>
          </div>

          {result?.note && (
            <div className="p-3 rounded-xl bg-slate-900/90 border border-slate-800 text-xs text-slate-400">
              <span className="font-bold text-slate-300">Referee Verification Note: </span>
              <span>{result.note}</span>
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

const CrownIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
    <path d="M5 16L3 5l5.5 5L12 4l3.5 6L21 5l-2 11H5zm14 3c0 .6-.4 1-1 1H6c-.6 0-1-.4-1-1v-1h14v1z"/>
  </svg>
);
