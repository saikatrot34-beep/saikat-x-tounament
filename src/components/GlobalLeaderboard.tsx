import React, { useState } from 'react';
import { 
  Trophy, 
  Crown, 
  Target, 
  Flame, 
  Medal, 
  Sparkles, 
  User, 
  X, 
  ArrowUpRight,
  TrendingUp,
  ShieldCheck,
  CheckCircle2
} from 'lucide-react';
import { UserProfile } from '../types';
import { db } from '../services/firebaseSimulator';

interface GlobalLeaderboardProps {
  currentUser?: UserProfile;
  onClose?: () => void;
  isModal?: boolean;
}

export const GlobalLeaderboard: React.FC<GlobalLeaderboardProps> = ({
  currentUser,
  onClose,
  isModal = false
}) => {
  const [sortBy, setSortBy] = useState<'both' | 'wins' | 'kills'>('both');

  const dbState = db.getState();
  const allUsers = Object.values(dbState.users);

  // Filter valid players and sort in descending order based on totalWins and totalKills
  const sortedPlayers = [...allUsers]
    .filter((u) => !u.banned)
    .sort((a, b) => {
      if (sortBy === 'wins') {
        if (b.totalWins !== a.totalWins) return b.totalWins - a.totalWins;
        return b.totalKills - a.totalKills;
      }
      if (sortBy === 'kills') {
        if (b.totalKills !== a.totalKills) return b.totalKills - a.totalKills;
        return b.totalWins - a.totalWins;
      }
      // Default: sorted based on their totalWins and totalKills in descending order
      if (b.totalWins !== a.totalWins) {
        return b.totalWins - a.totalWins;
      }
      return b.totalKills - a.totalKills;
    });

  // Top 5 players
  const top5Players = sortedPlayers.slice(0, 5);
  const champion = top5Players[0];
  const secondPlace = top5Players[1];
  const thirdPlace = top5Players[2];

  const content = (
    <div className="space-y-5">
      {/* Header with Badges */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500 via-orange-600 to-amber-700 text-slate-950 flex items-center justify-center shadow-lg shadow-amber-500/20 font-black">
            <Trophy className="w-5 h-5 text-slate-950" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-gaming text-xl sm:text-2xl font-black text-white tracking-wide">
                Global Leaderboard
              </h3>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30 font-bold uppercase tracking-wider">
                Top 5 Elite
              </span>
            </div>
            <p className="text-xs text-slate-400">
              Ranked in descending order by Total Wins &amp; Total Kills
            </p>
          </div>
        </div>

        {/* Sort Filter Tabs */}
        <div className="flex items-center gap-1 bg-slate-900/90 p-1 rounded-xl border border-slate-800 self-start sm:self-auto">
          <button
            onClick={() => setSortBy('both')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${
              sortBy === 'both'
                ? 'bg-amber-500 text-slate-950 shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Wins &amp; Kills
          </button>
          <button
            onClick={() => setSortBy('wins')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${
              sortBy === 'wins'
                ? 'bg-amber-500 text-slate-950 shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Top Wins
          </button>
          <button
            onClick={() => setSortBy('kills')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${
              sortBy === 'kills'
                ? 'bg-amber-500 text-slate-950 shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Top Kills
          </button>
        </div>
      </div>

      {/* Top 3 Visual Podium */}
      {top5Players.length >= 3 && (
        <div className="grid grid-cols-3 gap-2 sm:gap-4 pt-2">
          {/* #2 Silver */}
          <div className="order-1 sm:order-1 flex flex-col items-center justify-end p-3 sm:p-4 rounded-2xl bg-gradient-to-t from-slate-900/90 via-slate-800/40 to-transparent border border-slate-700/60 relative text-center">
            <div className="w-6 h-6 rounded-full bg-slate-300 text-slate-950 text-xs font-black flex items-center justify-center mb-1 shadow-md">
              2
            </div>
            <img
              src={secondPlace.avatar}
              alt={secondPlace.username}
              className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-slate-800 border-2 border-slate-400 object-cover shadow-md mb-2"
            />
            <p className="font-bold text-xs sm:text-sm text-white truncate max-w-full">
              {secondPlace.username}
            </p>
            <p className="text-[10px] text-slate-400 truncate max-w-full font-mono-code">
              {secondPlace.defaultIgn || secondPlace.username}
            </p>
            <div className="mt-2 pt-2 border-t border-slate-800/80 w-full flex items-center justify-around font-mono-code text-[11px]">
              <span className="text-amber-400 font-bold">{secondPlace.totalWins} Wins</span>
              <span className="text-emerald-400 font-bold">{secondPlace.totalKills} Kills</span>
            </div>
          </div>

          {/* #1 Champion Gold */}
          <div className="order-2 sm:order-2 flex flex-col items-center justify-end p-3 sm:p-4 rounded-2xl bg-gradient-to-t from-amber-950/40 via-amber-900/20 to-slate-900/80 border-2 border-amber-500/60 relative text-center shadow-xl shadow-amber-500/10">
            <div className="absolute -top-3 flex items-center justify-center w-7 h-7 rounded-full bg-amber-500 text-slate-950 shadow-lg shadow-amber-500/50">
              <Crown className="w-4 h-4 fill-slate-950" />
            </div>
            <img
              src={champion.avatar}
              alt={champion.username}
              className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-slate-800 border-2 border-amber-400 object-cover shadow-lg mb-2"
            />
            <span className="text-[9px] font-black uppercase px-2 py-0.5 rounded bg-amber-500 text-slate-950 mb-1">
              #1 CHAMPION
            </span>
            <p className="font-gaming text-sm sm:text-base font-extrabold text-white truncate max-w-full">
              {champion.username}
            </p>
            <p className="text-[10px] text-amber-300 truncate max-w-full font-mono-code">
              {champion.defaultIgn || champion.username}
            </p>
            <div className="mt-2 pt-2 border-t border-amber-500/30 w-full flex items-center justify-around font-mono-code text-xs">
              <span className="text-amber-400 font-black">{champion.totalWins} Wins</span>
              <span className="text-emerald-400 font-black">{champion.totalKills} Kills</span>
            </div>
          </div>

          {/* #3 Bronze */}
          <div className="order-3 sm:order-3 flex flex-col items-center justify-end p-3 sm:p-4 rounded-2xl bg-gradient-to-t from-slate-900/90 via-slate-800/40 to-transparent border border-amber-900/40 relative text-center">
            <div className="w-6 h-6 rounded-full bg-amber-700 text-white text-xs font-black flex items-center justify-center mb-1 shadow-md">
              3
            </div>
            <img
              src={thirdPlace.avatar}
              alt={thirdPlace.username}
              className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-slate-800 border-2 border-amber-700 object-cover shadow-md mb-2"
            />
            <p className="font-bold text-xs sm:text-sm text-white truncate max-w-full">
              {thirdPlace.username}
            </p>
            <p className="text-[10px] text-slate-400 truncate max-w-full font-mono-code">
              {thirdPlace.defaultIgn || thirdPlace.username}
            </p>
            <div className="mt-2 pt-2 border-t border-slate-800/80 w-full flex items-center justify-around font-mono-code text-[11px]">
              <span className="text-amber-400 font-bold">{thirdPlace.totalWins} Wins</span>
              <span className="text-emerald-400 font-bold">{thirdPlace.totalKills} Kills</span>
            </div>
          </div>
        </div>
      )}

      {/* Top 5 Ranked Table */}
      <div className="rounded-2xl border border-slate-800 overflow-hidden bg-slate-900/80 shadow-inner">
        <div className="px-4 py-2.5 bg-slate-800/80 border-b border-slate-800 flex items-center justify-between text-[11px] font-bold text-slate-400 uppercase tracking-wider">
          <div className="flex items-center gap-3">
            <span className="w-8">Rank</span>
            <span>Player / In-Game Name</span>
          </div>
          <div className="flex items-center gap-6 sm:gap-10">
            <span className="text-center min-w-[50px]">Total Wins</span>
            <span className="text-center min-w-[50px]">Total Kills</span>
            <span className="text-right min-w-[60px] hidden sm:block">Win Rate</span>
          </div>
        </div>

        <div className="divide-y divide-slate-800/80">
          {top5Players.map((player, index) => {
            const rank = index + 1;
            const isMe = currentUser?.uid === player.uid;
            const winRate = player.totalMatches > 0 
              ? Math.round((player.totalWins / player.totalMatches) * 100) 
              : 0;

            return (
              <div
                key={player.uid}
                className={`px-4 py-3.5 flex items-center justify-between text-xs transition ${
                  isMe 
                    ? 'bg-amber-500/10 border-l-4 border-amber-400' 
                    : 'hover:bg-slate-800/40'
                }`}
              >
                {/* Left: Rank & Avatar */}
                <div className="flex items-center gap-3">
                  <div className={`w-8 h-8 rounded-xl flex items-center justify-center font-gaming text-base font-black shrink-0 ${
                    rank === 1
                      ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20'
                      : rank === 2
                      ? 'bg-slate-300 text-slate-950'
                      : rank === 3
                      ? 'bg-amber-700 text-white'
                      : 'bg-slate-800 text-slate-400'
                  }`}>
                    #{rank}
                  </div>

                  <img
                    src={player.avatar}
                    alt={player.username}
                    className="w-9 h-9 rounded-xl bg-slate-800 border border-slate-700 object-cover shrink-0"
                  />

                  <div>
                    <div className="flex items-center gap-1.5">
                      <span className="font-bold text-white text-sm">
                        {player.username}
                      </span>
                      {isMe && (
                        <span className="text-[9px] px-1.5 py-0.2 rounded bg-amber-500/20 text-amber-300 font-bold uppercase border border-amber-500/40">
                          YOU
                        </span>
                      )}
                    </div>
                    <p className="text-[11px] text-slate-400 font-mono-code">
                      IGN: <span className="text-slate-300">{player.defaultIgn || 'Unregistered IGN'}</span>
                    </p>
                  </div>
                </div>

                {/* Right: Metrics */}
                <div className="flex items-center gap-6 sm:gap-10 font-mono-code">
                  <div className="min-w-[50px] text-center">
                    <span className="font-extrabold text-amber-400 text-sm flex items-center justify-center gap-1">
                      <Trophy className="w-3.5 h-3.5 text-amber-500" />
                      {player.totalWins}
                    </span>
                    <span className="text-[9px] text-slate-500 block">wins</span>
                  </div>

                  <div className="min-w-[50px] text-center">
                    <span className="font-extrabold text-emerald-400 text-sm flex items-center justify-center gap-1">
                      <Target className="w-3.5 h-3.5 text-emerald-500" />
                      {player.totalKills}
                    </span>
                    <span className="text-[9px] text-slate-500 block">kills</span>
                  </div>

                  <div className="min-w-[60px] text-right hidden sm:block">
                    <span className="font-bold text-cyan-300 text-xs">
                      {winRate}%
                    </span>
                    <span className="text-[9px] text-slate-500 block">
                      {player.totalMatches} matches
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );

  if (isModal) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/85 backdrop-blur-md animate-fade-in">
        <div className="relative w-full max-w-3xl rounded-3xl bg-[#0b0e17] border border-slate-800 shadow-2xl overflow-hidden max-h-[92vh] flex flex-col">
          {/* Modal Header */}
          <div className="p-5 border-b border-slate-800 flex items-center justify-between bg-slate-900/60">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center border border-amber-500/30">
                <Trophy className="w-5 h-5" />
              </div>
              <h3 className="font-gaming text-xl font-bold text-white tracking-wide">
                Tournament Global Leaderboard
              </h3>
            </div>
            {onClose && (
              <button
                onClick={onClose}
                className="p-2 rounded-xl bg-slate-800/60 hover:bg-slate-800 text-slate-400 hover:text-white transition"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          <div className="p-5 sm:p-6 overflow-y-auto">
            {content}
          </div>

          <div className="p-4 border-t border-slate-800 flex justify-end bg-slate-900/40">
            {onClose && (
              <button
                onClick={onClose}
                className="px-5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs uppercase"
              >
                Close
              </button>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-3xl bg-gradient-to-b from-[#101522] to-[#0c0f17] border border-slate-800 p-5 sm:p-6 shadow-2xl">
      {content}
    </div>
  );
};
