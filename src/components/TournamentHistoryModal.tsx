import React, { useState } from 'react';
import { 
  X, 
  History, 
  Trophy, 
  Target, 
  Award, 
  Calendar, 
  ArrowUpRight, 
  Coins, 
  CheckCircle2, 
  ExternalLink,
  ChevronRight,
  Sparkles,
  Gamepad2,
  Users
} from 'lucide-react';
import { UserProfile, Tournament, MatchResult } from '../types';
import { db } from '../services/firebaseSimulator';

interface TournamentHistoryModalProps {
  currentUser?: UserProfile;
  onClose: () => void;
  onViewResults: (tournamentKey: string) => void;
  onBrowseTournaments: () => void;
}

interface UserPastMatchRecord {
  tournamentKey: string;
  title: string;
  game: string;
  map: string;
  matchType: string;
  version: string;
  entryFee: number;
  prizePool: number;
  completedAt: number;
  slotNo?: number;
  placement?: number; // 1, 2, 3, etc.
  kills?: number;
  rewardsEarned: number;
  verified: boolean;
  refereeNote?: string;
}

export const TournamentHistoryModal: React.FC<TournamentHistoryModalProps> = ({
  currentUser,
  onClose,
  onViewResults,
  onBrowseTournaments
}) => {
  const [filterGame, setFilterGame] = useState<string>('all');
  const [filterPodiumOnly, setFilterPodiumOnly] = useState<boolean>(false);

  const dbState = db.getState();
  const user = currentUser || db.getCurrentUser();

  if (!user) return null;

  // Retrieve all resulted matches and check user's participation & results
  const resultedTournaments = Object.values(dbState.tournaments.resulted || {});
  
  const userPastMatches: UserPastMatchRecord[] = [];

  resultedTournaments.forEach((tourn) => {
    const participant = dbState.match_participants[tourn.key]?.[user.uid];
    const result: MatchResult | undefined = dbState.match_results[tourn.key];
    const winnerRecord = result?.winners.find(
      (w) => w.uid === user.uid || (user.defaultIgn && w.ign.toLowerCase() === user.defaultIgn.toLowerCase())
    );

    // If user participated or is in winner list
    if (participant || winnerRecord) {
      userPastMatches.push({
        tournamentKey: tourn.key,
        title: tourn.title,
        game: tourn.game,
        map: tourn.map,
        matchType: tourn.matchType,
        version: tourn.version,
        entryFee: tourn.entryFee,
        prizePool: tourn.prizePool,
        completedAt: result?.resultedAt || tourn.time,
        slotNo: participant?.slotNo,
        placement: winnerRecord?.rank,
        kills: winnerRecord?.kills ?? 0,
        rewardsEarned: winnerRecord?.prize ?? 0,
        verified: !!result,
        refereeNote: result?.note
      });
    }
  });

  // Sort by most recently completed
  userPastMatches.sort((a, b) => b.completedAt - a.completedAt);

  // Apply filters
  const filteredMatches = userPastMatches.filter((m) => {
    if (filterGame !== 'all' && m.game !== filterGame) return false;
    if (filterPodiumOnly && (!m.placement || m.placement > 3)) return false;
    return true;
  });

  // Calculate totals
  const totalTournamentsCount = userPastMatches.length;
  const totalRewardsAccumulated = userPastMatches.reduce((acc, m) => acc + m.rewardsEarned, 0);
  const totalVictories = userPastMatches.filter((m) => m.placement === 1).length;
  const podiumFinishes = userPastMatches.filter((m) => m.placement && m.placement <= 3).length;

  const getPlacementBadge = (rank?: number) => {
    if (rank === 1) {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-xl bg-amber-500 text-slate-950 font-black text-xs uppercase shadow-md shadow-amber-500/20">
          <Trophy className="w-3.5 h-3.5 fill-slate-950" />
          <span>#1 WWCD (Winner)</span>
        </span>
      );
    }
    if (rank === 2) {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-xl bg-slate-300 text-slate-950 font-black text-xs uppercase shadow-md">
          <Award className="w-3.5 h-3.5" />
          <span>#2 Runner Up</span>
        </span>
      );
    }
    if (rank === 3) {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-xl bg-amber-700 text-white font-black text-xs uppercase shadow-md">
          <Award className="w-3.5 h-3.5" />
          <span>#3 3rd Place</span>
        </span>
      );
    }
    if (rank && rank <= 10) {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-xl bg-slate-800 text-slate-300 font-bold text-xs uppercase border border-slate-700">
          <span>Rank #{rank}</span>
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-xl bg-slate-800/80 text-slate-400 font-semibold text-xs border border-slate-700/60">
        <span>Participant</span>
      </span>
    );
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/85 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-3xl rounded-3xl bg-[#0b0e17] border border-slate-800 shadow-2xl overflow-hidden max-h-[92vh] flex flex-col">
        {/* Header */}
        <div className="p-5 border-b border-slate-800 flex items-center justify-between bg-slate-900/60">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 text-white flex items-center justify-center shadow-lg shadow-purple-500/20">
              <History className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-gaming text-xl font-bold text-white tracking-wide">
                  Tournament History
                </h3>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 font-bold uppercase">
                  {user.username}
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Past tournament participation, rankings &amp; prize disbursements
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

        {/* Profile Stats Ribbon */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-4 sm:p-5 bg-slate-900/90 border-b border-slate-800/80">
          <div className="p-3 rounded-2xl bg-slate-800/40 border border-slate-700/60">
            <span className="text-[10px] uppercase font-bold text-slate-400 block">Total Matches</span>
            <p className="font-gaming text-xl font-black text-white mt-0.5">{totalTournamentsCount}</p>
          </div>
          <div className="p-3 rounded-2xl bg-slate-800/40 border border-slate-700/60">
            <span className="text-[10px] uppercase font-bold text-amber-400 block">1st Place Wins</span>
            <p className="font-gaming text-xl font-black text-amber-400 mt-0.5">{totalVictories}</p>
          </div>
          <div className="p-3 rounded-2xl bg-slate-800/40 border border-slate-700/60">
            <span className="text-[10px] uppercase font-bold text-slate-400 block">Podium Finishes</span>
            <p className="font-gaming text-xl font-black text-slate-200 mt-0.5">{podiumFinishes}</p>
          </div>
          <div className="p-3 rounded-2xl bg-emerald-950/30 border border-emerald-800/40">
            <span className="text-[10px] uppercase font-bold text-emerald-400 block">Total Rewards</span>
            <p className="font-gaming text-xl font-black text-emerald-400 mt-0.5">₹{totalRewardsAccumulated}</p>
          </div>
        </div>

        {/* Filters Bar */}
        <div className="px-5 py-3 border-b border-slate-800/80 bg-slate-900/40 flex items-center justify-between gap-3 flex-wrap">
          <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar">
            {['all', 'bgmi', 'freefire', 'codm'].map((g) => (
              <button
                key={g}
                onClick={() => setFilterGame(g)}
                className={`px-3 py-1 rounded-xl text-xs font-bold uppercase tracking-wider transition ${
                  filterGame === g
                    ? 'bg-amber-500 text-slate-950 shadow-sm'
                    : 'bg-slate-800 text-slate-400 hover:text-white'
                }`}
              >
                {g === 'all' ? 'All Games' : g.toUpperCase()}
              </button>
            ))}
          </div>

          <label className="flex items-center gap-2 text-xs text-slate-300 font-semibold cursor-pointer">
            <input
              type="checkbox"
              checked={filterPodiumOnly}
              onChange={(e) => setFilterPodiumOnly(e.target.checked)}
              className="rounded accent-amber-500"
            />
            <span>Podium Only (Top 3)</span>
          </label>
        </div>

        {/* Match List */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-3.5">
          {filteredMatches.length === 0 ? (
            <div className="text-center py-12 px-4 rounded-3xl bg-slate-900/40 border border-slate-800/80 space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-slate-800/80 text-slate-400 flex items-center justify-center mx-auto">
                <Gamepad2 className="w-6 h-6" />
              </div>
              <h4 className="font-gaming text-lg font-bold text-white">
                No Match History Found
              </h4>
              <p className="text-xs text-slate-400 max-w-sm mx-auto">
                You haven&apos;t participated in any completed tournaments under this filter. Join upcoming scrims to start building your record!
              </p>
              <div className="pt-2">
                <button
                  onClick={() => {
                    onClose();
                    onBrowseTournaments();
                  }}
                  className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 text-slate-950 font-bold text-xs uppercase tracking-wider shadow-lg shadow-amber-500/20"
                >
                  Browse Upcoming Tournaments
                </button>
              </div>
            </div>
          ) : (
            filteredMatches.map((m) => {
              const netProfit = m.rewardsEarned - m.entryFee;
              const isProfit = netProfit > 0;

              return (
                <div
                  key={m.tournamentKey}
                  className="p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-slate-900/90 via-[#0f1422] to-slate-900/90 border border-slate-800/90 hover:border-slate-700/80 transition shadow-lg space-y-3"
                >
                  {/* Top Bar: Title, Date, Placement */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30">
                          {m.game.toUpperCase()}
                        </span>
                        <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded bg-slate-800 text-slate-300">
                          {m.matchType} • {m.map}
                        </span>
                        <span className="text-xs text-slate-400 font-mono-code flex items-center gap-1">
                          <Calendar className="w-3 h-3 text-slate-500" />
                          {new Date(m.completedAt).toLocaleDateString('en-IN', {
                            day: 'numeric',
                            month: 'short',
                            year: 'numeric'
                          })}
                        </span>
                      </div>
                      <h4 className="font-gaming text-base sm:text-lg font-bold text-white">
                        {m.title}
                      </h4>
                    </div>

                    {/* Placement Badge */}
                    <div className="self-start sm:self-center">
                      {getPlacementBadge(m.placement)}
                    </div>
                  </div>

                  {/* Metrics Row: Kills, Rewards Earned, Entry Fee */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2 border-t border-slate-800/80 font-mono-code text-xs">
                    <div className="p-2.5 rounded-xl bg-slate-800/50">
                      <span className="text-[10px] text-slate-400 uppercase block">Kills Achieved</span>
                      <p className="font-bold text-emerald-400 text-sm flex items-center gap-1 mt-0.5">
                        <Target className="w-3.5 h-3.5" />
                        <span>{m.kills} Kills</span>
                      </p>
                    </div>

                    <div className="p-2.5 rounded-xl bg-slate-800/50">
                      <span className="text-[10px] text-slate-400 uppercase block">Entry Fee</span>
                      <p className="font-bold text-slate-300 text-sm mt-0.5">
                        ₹{m.entryFee}
                      </p>
                    </div>

                    <div className="p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/20">
                      <span className="text-[10px] text-amber-400 uppercase font-bold block">Reward Earned</span>
                      <p className="font-black text-amber-400 text-sm flex items-center gap-1 mt-0.5">
                        <Coins className="w-3.5 h-3.5 text-amber-400" />
                        <span>₹{m.rewardsEarned}</span>
                      </p>
                    </div>

                    <div className="p-2.5 rounded-xl bg-slate-800/50">
                      <span className="text-[10px] text-slate-400 uppercase block">Net Return</span>
                      <p className={`font-bold text-sm mt-0.5 ${isProfit ? 'text-emerald-400' : 'text-slate-400'}`}>
                        {isProfit ? `+₹${netProfit}` : `₹${netProfit}`}
                      </p>
                    </div>
                  </div>

                  {/* Action Link & Notes */}
                  <div className="flex items-center justify-between text-xs pt-1 text-slate-400">
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                      <span className="text-[11px] truncate max-w-xs">
                        {m.refereeNote || 'Verified match results logged to Firebase.'}
                      </span>
                    </div>

                    <button
                      onClick={() => {
                        onClose();
                        onViewResults(m.tournamentKey);
                      }}
                      className="flex items-center gap-1 text-amber-400 hover:text-amber-300 font-bold uppercase text-[11px] underline decoration-dotted transition"
                    >
                      <span>View Scoreboard</span>
                      <ArrowUpRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-800 flex items-center justify-between bg-slate-900/60">
          <span className="text-xs text-slate-400">
            Official match outcomes securely verified and recorded
          </span>
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
