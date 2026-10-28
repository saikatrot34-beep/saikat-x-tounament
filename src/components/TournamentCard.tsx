import React, { useState, useEffect } from 'react';
import { 
  Trophy, 
  Target, 
  Users, 
  Clock, 
  MapPin, 
  Key, 
  ShieldCheck, 
  Flame, 
  ArrowRight,
  Sparkles,
  Lock,
  CheckCircle2,
  Activity,
  Crosshair,
  TrendingUp,
  Info,
  Award,
  X,
  Share2,
  Check
} from 'lucide-react';
import { Tournament, MatchParticipant, UserProfile } from '../types';
import { db } from '../services/firebaseSimulator';

export type TournamentDifficultyLevel = 'Easy' | 'Medium' | 'Hard';

export interface TournamentDifficultyInfo {
  level: TournamentDifficultyLevel;
  ratio: number;
  badgeClass: string;
  dotClass: string;
  textClass: string;
  bgClass: string;
  borderClass: string;
  ratioFormatted: string;
  description: string;
}

/**
 * Calculates tournament difficulty based on entry fee and prize pool ratio:
 * - Ratio is (prizePool / entryFee) representing return multiple.
 * - Easy (Green): Low entry barrier (<= ₹25) and high reward multiple (>= 75x), or free entry.
 * - Medium (Amber): Moderate entry fee (₹30 - ₹44) or balanced reward multiple (50x - 74x).
 * - Hard (Red): High-stakes entry (>= ₹45) or tighter prize-to-fee ratio (< 50x) with elite competition.
 */
export function getTournamentDifficulty(entryFee: number, prizePool: number): TournamentDifficultyInfo {
  if (entryFee <= 0) {
    return {
      level: 'Easy',
      ratio: 100,
      badgeClass: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30',
      dotClass: 'bg-emerald-400 shadow-sm shadow-emerald-400/50',
      textClass: 'text-emerald-400',
      bgClass: 'bg-emerald-500/10',
      borderClass: 'border-emerald-500/30',
      ratioFormatted: 'Free Entry',
      description: 'Zero entry fee with guaranteed prizes. Best for beginners.'
    };
  }

  const ratio = Math.round((prizePool / entryFee) * 10) / 10;

  // Hard: Higher entry stakes (>= 45) or lower prize-to-fee ratio (< 50x)
  if (entryFee >= 45 || ratio < 50) {
    return {
      level: 'Hard',
      ratio,
      badgeClass: 'bg-rose-500/10 text-rose-400 border-rose-500/30',
      dotClass: 'bg-rose-500 shadow-sm shadow-rose-500/50',
      textClass: 'text-rose-400',
      bgClass: 'bg-rose-500/10',
      borderClass: 'border-rose-500/30',
      ratioFormatted: `${ratio}x`,
      description: `High stakes competition (${ratio}x ratio, ₹${entryFee} entry fee). Requires experienced gameplay.`
    };
  }

  // Medium: Moderate entry fee (30 - 44) or intermediate ratio (50x - 74x)
  if (entryFee >= 30 || ratio < 75) {
    return {
      level: 'Medium',
      ratio,
      badgeClass: 'bg-amber-500/10 text-amber-400 border-amber-500/30',
      dotClass: 'bg-amber-400 shadow-sm shadow-amber-400/50',
      textClass: 'text-amber-400',
      bgClass: 'bg-amber-500/10',
      borderClass: 'border-amber-500/30',
      ratioFormatted: `${ratio}x`,
      description: `Balanced risk & reward (${ratio}x ratio, ₹${entryFee} entry fee). Suitable for intermediate players.`
    };
  }

  // Easy: Low entry fee (< 30) and high multiplier (>= 75x)
  return {
    level: 'Easy',
    ratio,
    badgeClass: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30',
    dotClass: 'bg-emerald-400 shadow-sm shadow-emerald-400/50',
    textClass: 'text-emerald-400',
    bgClass: 'bg-emerald-500/10',
    borderClass: 'border-emerald-500/30',
    ratioFormatted: `${ratio}x`,
    description: `High return-to-risk ratio (${ratio}x ratio, ₹${entryFee} entry fee). Friendly for casual players.`
  };
}

interface TournamentCardProps {
  tournament: Tournament;
  currentUser?: UserProfile;
  participant?: MatchParticipant;
  onJoin: (tournament: Tournament) => void;
  onViewRoom: (tournament: Tournament) => void;
  onViewResults: (tournament: Tournament) => void;
  onInspectRule: (tournament: Tournament) => void;
}

export const TournamentCard: React.FC<TournamentCardProps> = ({
  tournament,
  currentUser,
  participant,
  onJoin,
  onViewRoom,
  onViewResults,
  onInspectRule
}) => {
  const [prizeModalOpen, setPrizeModalOpen] = useState(false);
  const [showPrizeTooltip, setShowPrizeTooltip] = useState(false);
  const [copied, setCopied] = useState(false);
  const [currentTime, setCurrentTime] = useState(Date.now());

  // Calculate difficulty based on entry fee and prize pool ratio
  const difficulty = getTournamentDifficulty(tournament.entryFee, tournament.prizePool);

  useEffect(() => {
    // Only update countdown timer for upcoming tournaments
    if (tournament.status !== 'upcoming') return;

    const timer = setInterval(() => {
      setCurrentTime(Date.now());
    }, 1000);

    return () => clearInterval(timer);
  }, [tournament.status]);

  const handleShare = async (e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      const url = new URL(window.location.href);
      url.searchParams.set('tournamentId', tournament.key);
      const deepLink = url.toString();

      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(deepLink);
      } else {
        const textArea = document.createElement('textarea');
        textArea.value = deepLink;
        textArea.style.position = 'fixed';
        textArea.style.left = '-999999px';
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();
        document.execCommand('copy');
        textArea.remove();
      }
      setCopied(true);
      setTimeout(() => setCopied(false), 2200);
    } catch (err) {
      console.error('Failed to copy tournament link:', err);
    }
  };

  const isJoined = !!participant;
  const isFull = tournament.joined >= tournament.totalSpots;
  const spotsLeft = Math.max(0, tournament.totalSpots - tournament.joined);

  // Countdown Timer: Calculate remaining time for upcoming tournaments within 24 hours
  const isUpcoming = tournament.status === 'upcoming';
  const msUntilStart = tournament.time - currentTime;
  const isWithin24Hours = isUpcoming && msUntilStart >= 0 && msUntilStart <= 24 * 60 * 60 * 1000;

  const formatCountdown = (ms: number) => {
    const totalSeconds = Math.max(0, Math.floor(ms / 1000));
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;
    const pad = (n: number) => String(n).padStart(2, '0');
    return `${pad(hours)}:${pad(minutes)}:${pad(seconds)}`;
  };
  
  // Calculate Fill Rate: (joined / totalSpots)
  const fillRate = tournament.totalSpots > 0 ? (tournament.joined / tournament.totalSpots) : 0;
  const fillRatePercentage = Math.min(100, Math.round(fillRate * 100));

  // Estimated prize calculation for top 3 positions based on total prize pool
  const estimatedPrizes = {
    first: Math.round(tournament.prizePool * 0.50),  // 50% for 1st
    second: Math.round(tournament.prizePool * 0.30), // 30% for 2nd
    third: Math.round(tournament.prizePool * 0.20),  // 20% for 3rd
  };

  // Mock historical data for calculating Average Kills Per Player
  const MOCK_HISTORICAL_DATA: Record<string, { totalKills: number; totalPlayers: number }> = {
    bgmi: { totalKills: 3580, totalPlayers: 940 },     // ~3.8 avg kills
    freefire: { totalKills: 2260, totalPlayers: 540 }, // ~4.2 avg kills
    codm: { totalKills: 2940, totalPlayers: 610 }      // ~4.8 avg kills
  };

  const historicalStats = MOCK_HISTORICAL_DATA[tournament.game] || { totalKills: 2600, totalPlayers: 720 };
  const avgKillsPerPlayer = (historicalStats.totalKills / historicalStats.totalPlayers).toFixed(1);

  const formatMatchTime = (timestamp: number) => {
    const date = new Date(timestamp);
    return date.toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });
  };

  const getGameLabel = (gameId: string) => {
    if (gameId === 'bgmi') return { name: 'BGMI', color: 'from-amber-600 to-yellow-600', text: 'text-amber-400' };
    if (gameId === 'freefire') return { name: 'FREE FIRE', color: 'from-orange-600 to-red-600', text: 'text-orange-400' };
    if (gameId === 'codm') return { name: 'COD MOBILE', color: 'from-blue-600 to-cyan-600', text: 'text-cyan-400' };
    return { name: gameId.toUpperCase(), color: 'from-purple-600 to-indigo-600', text: 'text-purple-400' };
  };

  const gameInfo = getGameLabel(tournament.game);
  const isActiveTournament = tournament.status === 'ongoing';
  const isResulted = tournament.status === 'resulted';

  return (
    <div
      id={`tournament-${tournament.key}`}
      className={`relative group rounded-2xl bg-gradient-to-b from-[#121724] to-[#0c101a] border transition-all duration-300 ease-out overflow-hidden flex flex-col justify-between transform hover:scale-[1.018] hover:-translate-y-1 ${
        isActiveTournament
          ? 'animate-glow-gold border-amber-500/60 shadow-xl shadow-amber-500/10 hover:border-amber-400 hover:shadow-2xl hover:shadow-amber-500/30'
          : isResulted
          ? 'border-slate-800/90 hover:border-emerald-500/50 hover:shadow-xl hover:shadow-emerald-950/40'
          : 'border-slate-800/90 hover:border-amber-500/70 hover:shadow-2xl hover:shadow-amber-500/20 hover:animate-glow-gold'
      }`}
    >
      {/* Floating Copied! Toast Notification Banner */}
      {copied && (
        <div className="absolute top-2 left-1/2 -translate-x-1/2 z-40 flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500 text-slate-950 font-bold text-xs shadow-xl shadow-emerald-500/40 animate-bounce pointer-events-none">
          <Check className="w-3.5 h-3.5 stroke-[2.5]" />
          <span>Copied!</span>
        </div>
      )}

      {/* Top Header Strip */}
      <div className="p-4 sm:p-5 pb-3">
        <div className="flex items-center justify-between gap-2 mb-2.5">
          <div className="flex items-center gap-2 flex-wrap">
            <span className={`text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-md bg-gradient-to-r ${gameInfo.color} text-white shadow-sm`}>
              {gameInfo.name}
            </span>
            <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md bg-slate-800 text-slate-300 border border-slate-700">
              {tournament.matchType}
            </span>
            <span className="text-[10px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded-md bg-slate-800/60 text-slate-400">
              {tournament.version}
            </span>

            {/* Difficulty Badge (Color-coded indicator based on entry fee and prize pool ratios) */}
            <span
              data-testid={`difficulty-badge-${tournament.key}`}
              className={`inline-flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md border shadow-sm transition-colors ${difficulty.badgeClass}`}
              title={`Difficulty: ${difficulty.level} • ${difficulty.description}`}
              aria-label={`Tournament difficulty: ${difficulty.level}`}
            >
              <span className={`w-1.5 h-1.5 rounded-full ${difficulty.dotClass}`} />
              <span>{difficulty.level}</span>
            </span>

            {isActiveTournament && (
              <span className="inline-flex items-center gap-1.5 text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-md bg-amber-500/20 text-amber-300 border border-amber-500/50 shadow-sm animate-pulse">
                <span className="relative flex h-1.5 w-1.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-amber-500"></span>
                </span>
                ACTIVE
              </span>
            )}
            {isWithin24Hours && (
              <span 
                data-testid="countdown-timer"
                className="inline-flex items-center gap-1.5 text-[10px] font-mono-code font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-md bg-amber-500/20 border border-amber-500/50 text-amber-300 shadow-sm shadow-amber-500/10 animate-pulse"
                title={`Starts in: ${formatCountdown(msUntilStart)}`}
              >
                <Clock className="w-3 h-3 text-amber-400 shrink-0" />
                <span>Starts in: {formatCountdown(msUntilStart)}</span>
              </span>
            )}
          </div>

          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1.5 text-xs text-slate-400 font-medium">
              <Clock className="w-3.5 h-3.5 text-slate-400" />
              <span className="font-mono-code text-[11px]">{formatMatchTime(tournament.time)}</span>
            </div>

            {/* Share Button */}
            <div className="relative">
              <button
                type="button"
                onClick={handleShare}
                className={`p-1.5 rounded-lg border transition-all duration-200 active:scale-95 flex items-center justify-center ${
                  copied
                    ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/50'
                    : 'bg-slate-800/80 hover:bg-slate-700 text-slate-400 hover:text-amber-400 border-slate-700/60'
                }`}
                title="Share tournament link"
                aria-label="Share tournament link"
              >
                {copied ? (
                  <Check className="w-3.5 h-3.5 text-emerald-400 stroke-[2.5]" />
                ) : (
                  <Share2 className="w-3.5 h-3.5" />
                )}
              </button>

              {/* Header Toast Dropdown */}
              {copied && (
                <div className="absolute right-0 top-full mt-1.5 z-30 flex items-center gap-1 px-2.5 py-1 rounded-lg bg-emerald-500 text-slate-950 font-bold text-[11px] shadow-lg shadow-emerald-500/30 whitespace-nowrap animate-fade-in pointer-events-none">
                  <Check className="w-3 h-3 stroke-[3]" />
                  <span>Copied!</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Title & Map */}
        <h3 className="font-gaming text-lg sm:text-xl font-bold text-white tracking-wide leading-snug group-hover:text-amber-300 transition-colors">
          {tournament.title}
        </h3>
        <div className="flex items-center gap-1.5 mt-1 text-xs text-slate-400">
          <MapPin className="w-3.5 h-3.5 text-amber-500/80" />
          <span>Map: <strong className="text-slate-200">{tournament.map}</strong></span>
          {tournament.perKill > 0 && (
            <>
              <span className="text-slate-600">•</span>
              <span className="text-emerald-400 font-semibold flex items-center gap-1">
                <Target className="w-3 h-3" /> ₹{tournament.perKill} / Kill
              </span>
            </>
          )}
        </div>
      </div>

      {/* Prize & Fee Metric Grid */}
      <div className="px-4 sm:px-5 py-3 grid grid-cols-3 gap-2 bg-slate-900/60 border-y border-slate-800/80">
        <div className="text-left">
          <p className="text-[10px] uppercase font-bold text-slate-400 flex items-center gap-1">
            <Trophy className="w-3 h-3 text-amber-400" />
            <span>Prize Pool</span>
          </p>
          <p className="font-gaming text-lg font-black text-amber-400 tracking-wide mt-0.5">
            ₹{tournament.prizePool}
          </p>
        </div>

        <div className="text-left">
          <p className="text-[10px] uppercase font-bold text-slate-400 flex items-center gap-1">
            <Target className="w-3 h-3 text-emerald-400" />
            <span>Per Kill</span>
          </p>
          <p className="font-gaming text-lg font-bold text-emerald-400 tracking-wide mt-0.5">
            {tournament.perKill > 0 ? `₹${tournament.perKill}` : 'Rank Only'}
          </p>
        </div>

        <div className="text-left">
          <div className="flex items-center justify-between">
            <p className="text-[10px] uppercase font-bold text-slate-400">
              <span>Entry Fee</span>
            </p>
            <span 
              className={`text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.2 rounded border ${difficulty.badgeClass}`}
              title={`${difficulty.level} difficulty (${difficulty.ratioFormatted} prize pool ratio)`}
            >
              {difficulty.level}
            </span>
          </div>
          <p className="font-gaming text-lg font-bold text-white tracking-wide mt-0.5">
            ₹{tournament.entryFee}
          </p>
        </div>
      </div>

      {/* Prize Distribution Section */}
      <div className="px-4 sm:px-5 py-2 bg-[#0c101a] border-b border-slate-800/80 flex items-center justify-between text-[11px]">
        <div className="flex items-center gap-1.5 text-slate-300 font-semibold">
          <Award className="w-3.5 h-3.5 text-amber-400" />
          <span>Prize Distribution:</span>
        </div>
        
        {/* Tooltip & Modal Link */}
        <div className="relative">
          <button
            type="button"
            onClick={() => setPrizeModalOpen(true)}
            onMouseEnter={() => setShowPrizeTooltip(true)}
            onMouseLeave={() => setShowPrizeTooltip(false)}
            className="group flex items-center gap-1 text-amber-400 hover:text-amber-300 font-mono-code font-bold text-[11px] underline decoration-dotted decoration-amber-500/50 transition cursor-pointer"
          >
            <span>Top 3: 1st ₹{estimatedPrizes.first}</span>
            <Info className="w-3 h-3 text-amber-400/80 group-hover:text-amber-300" />
          </button>

          {/* Small Tooltip showing estimated prize for top 3 positions */}
          {showPrizeTooltip && (
            <div className="absolute right-0 bottom-full mb-2 z-30 w-52 p-2.5 rounded-xl bg-slate-900 border border-amber-500/50 shadow-2xl text-[10px] text-slate-200 pointer-events-none animate-fade-in font-mono-code space-y-1">
              <p className="font-bold text-amber-300 uppercase text-[9px] tracking-wider">Top 3 Estimated Prizes:</p>
              <div className="flex justify-between items-center text-amber-200">
                <span>🥇 1st Place (50%):</span> <strong className="font-bold text-white">₹{estimatedPrizes.first}</strong>
              </div>
              <div className="flex justify-between items-center text-slate-300">
                <span>🥈 2nd Place (30%):</span> <strong className="font-bold text-white">₹{estimatedPrizes.second}</strong>
              </div>
              <div className="flex justify-between items-center text-amber-600">
                <span>🥉 3rd Place (20%):</span> <strong className="font-bold text-white">₹{estimatedPrizes.third}</strong>
              </div>
              <p className="text-[9px] text-slate-400 pt-1 border-t border-slate-800">
                Click link to open modal breakdown
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Tournament Stats Section */}
      <div className="px-4 sm:px-5 py-3 bg-[#0d121c]/90 border-b border-slate-800/80 space-y-2.5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div className="flex items-center gap-1.5">
            <Activity className="w-3.5 h-3.5 text-cyan-400" />
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-300">
              Tournament Stats
            </span>
            <span className="flex h-1.5 w-1.5 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-cyan-500"></span>
            </span>
          </div>

          {/* Average Kills Per Player Data Chip */}
          <div 
            className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-gradient-to-r from-emerald-500/20 via-teal-500/25 to-cyan-500/20 border border-emerald-400/50 text-emerald-300 text-[10px] font-mono-code font-bold shadow-md shadow-emerald-500/15 self-start sm:self-auto"
            title="Avg. Kills Per Player calculated from mock historical tournament data"
            aria-label="Avg. Kills Per Player"
          >
            <Crosshair className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
            <span>Avg. Kills Per Player: <strong className="text-white font-black">{avgKillsPerPlayer}</strong></span>
          </div>
        </div>

        {/* Current Fill Rate Progress Bar */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between text-[11px]">
            <span className="text-slate-300 font-semibold flex items-center gap-1.5">
              <span>Current Fill Rate</span>
              {fillRatePercentage >= 90 && (
                <span className="text-[9px] px-1.5 py-0.2 rounded bg-red-500/20 text-red-300 font-bold uppercase">
                  Almost Full
                </span>
              )}
            </span>
            <div className="flex items-center gap-1.5 font-mono-code">
              <span className="font-extrabold text-cyan-300 text-xs">
                {fillRatePercentage}%
              </span>
              <span className="text-[10px] text-slate-400">
                ({tournament.joined}/{tournament.totalSpots} spots)
              </span>
            </div>
          </div>
          
          <div className="w-full h-2 rounded-full bg-slate-800/90 overflow-hidden border border-slate-700/50">
            <div
              className={`h-full rounded-full transition-all duration-500 ${
                fillRatePercentage >= 90
                  ? 'bg-gradient-to-r from-amber-500 via-orange-500 to-red-500 shadow-sm shadow-red-500/30'
                  : fillRatePercentage >= 50
                  ? 'bg-gradient-to-r from-cyan-500 via-teal-400 to-emerald-400'
                  : 'bg-gradient-to-r from-blue-500 to-cyan-400'
              }`}
              style={{ width: `${fillRatePercentage}%` }}
            />
          </div>
        </div>
      </div>

      {/* Card Actions & Status */}
      <div className="p-4 sm:p-5 pt-3 space-y-3">
        {tournament.status === 'resulted' ? (
          <div className="flex items-center gap-2 p-2 rounded-xl bg-emerald-950/40 border border-emerald-800/40 text-emerald-300 text-xs">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>Match finished &amp; verified. Prizes credited to winning wallets.</span>
          </div>
        ) : (
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span className="flex items-center gap-1">
              <Users className="w-3.5 h-3.5 text-slate-400" />
              <span>Available Slots</span>
            </span>
            <span className="font-mono-code font-bold text-slate-200">
              {spotsLeft} remaining
            </span>
          </div>
        )}

        {/* Dynamic Action Buttons depending on user & status */}
        <div className="flex items-center gap-2 pt-1">
          {tournament.status === 'resulted' ? (
            <button
              onClick={() => onViewResults(tournament)}
              className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-slate-950 font-bold text-xs uppercase tracking-wider transition shadow-lg shadow-emerald-600/20 active:scale-98"
            >
              <Trophy className="w-4 h-4" />
              <span>View Results &amp; Winners</span>
            </button>
          ) : isJoined ? (
            <div className="w-full flex items-center gap-2">
              <div className="flex-1 flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl bg-slate-800/90 border border-slate-700 text-emerald-400 text-xs font-bold">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                <span>Slot #{participant.slotNo}</span>
              </div>
              <button
                onClick={() => onViewRoom(tournament)}
                className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl font-bold text-xs uppercase tracking-wider transition active:scale-98 ${
                  tournament.status === 'ongoing'
                    ? 'bg-red-500 hover:bg-red-400 text-white animate-pulse shadow-lg shadow-red-500/30'
                    : 'bg-amber-500 hover:bg-amber-400 text-slate-950 shadow-md shadow-amber-500/20'
                }`}
              >
                <Key className="w-3.5 h-3.5" />
                <span>Room ID &amp; Pass</span>
              </button>
            </div>
          ) : tournament.status === 'ongoing' ? (
            <button
              onClick={() => onViewRoom(tournament)}
              className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs uppercase tracking-wider transition border border-slate-700"
            >
              <Lock className="w-3.5 h-3.5 text-amber-400" />
              <span>Match Live (Locked Room)</span>
            </button>
          ) : isFull ? (
            <button
              disabled
              className="w-full py-2.5 px-4 rounded-xl bg-slate-800/50 text-slate-500 font-bold text-xs uppercase tracking-wider cursor-not-allowed"
            >
              Lobby Full
            </button>
          ) : (
            <button
              onClick={() => onJoin(tournament)}
              className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-gradient-to-r from-amber-500 via-amber-400 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-slate-950 font-black text-xs uppercase tracking-wider transition shadow-lg shadow-amber-500/20 active:scale-98"
            >
              <span>Join Match (₹{tournament.entryFee})</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          )}

          {/* Quick Rule Tag */}
          <button
            onClick={() => onInspectRule(tournament)}
            className="p-2.5 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-400 hover:text-slate-200 border border-slate-700/60 transition"
            title="Inspect Firebase Security Rule for this tournament"
          >
            <ShieldCheck className="w-4 h-4 text-indigo-400" />
          </button>

          {/* Share Action Button */}
          <button
            type="button"
            onClick={handleShare}
            className={`p-2.5 rounded-xl border transition-all duration-200 active:scale-95 ${
              copied
                ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/50'
                : 'bg-slate-800/80 hover:bg-slate-700 text-slate-400 hover:text-amber-400 border-slate-700/60'
            }`}
            title="Share tournament link"
            aria-label="Share tournament link"
          >
            {copied ? (
              <Check className="w-4 h-4 text-emerald-400 stroke-[2.5]" />
            ) : (
              <Share2 className="w-4 h-4" />
            )}
          </button>
        </div>
      </div>

      {/* Prize Distribution Modal */}
      {prizeModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in text-left">
          <div className="relative w-full max-w-sm rounded-3xl bg-[#0f1422] border border-slate-800 shadow-2xl p-5 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800/80 pb-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center">
                  <Trophy className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="font-gaming text-base font-bold text-white tracking-wide">
                    Prize Distribution
                  </h4>
                  <p className="text-[11px] text-slate-400 truncate max-w-[200px]">
                    {tournament.title}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setPrizeModalOpen(false)}
                className="p-1.5 rounded-lg bg-slate-800 text-slate-400 hover:text-white transition"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Total Prize Banner */}
            <div className="p-3 rounded-2xl bg-gradient-to-r from-amber-500/20 via-orange-500/10 to-amber-500/20 border border-amber-500/30 flex items-center justify-between">
              <div>
                <span className="text-[10px] text-slate-400 uppercase font-bold block">Total Prize Pool</span>
                <span className="font-gaming text-2xl font-black text-amber-400">₹{tournament.prizePool}</span>
              </div>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 font-bold border border-amber-500/30 uppercase">
                Guaranteed
              </span>
            </div>

            {/* Difficulty Rating & Ratio Breakdown */}
            <div className="p-2.5 rounded-xl bg-slate-900/80 border border-slate-800 flex items-center justify-between text-xs">
              <div className="flex items-center gap-2">
                <span className="text-slate-400 font-semibold text-[11px]">Difficulty Rating:</span>
                <span className={`inline-flex items-center gap-1.5 text-[10px] font-bold uppercase px-2 py-0.5 rounded-md border ${difficulty.badgeClass}`}>
                  <span className={`w-1.5 h-1.5 rounded-full ${difficulty.dotClass}`} />
                  <span>{difficulty.level}</span>
                </span>
              </div>
              <span className="font-mono-code text-[11px] text-slate-300">
                Multiple: <strong className="text-amber-400 font-bold">{difficulty.ratioFormatted}</strong>
              </span>
            </div>

            {/* Top 3 Positions Estimated Breakdown */}
            <div className="space-y-2 text-xs">
              <div className="p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-between">
                <div className="flex items-center gap-2 font-bold text-amber-300">
                  <span className="w-6 h-6 rounded-lg bg-amber-500 text-slate-950 flex items-center justify-center text-xs font-black shadow-sm">
                    1
                  </span>
                  <span>1st Place (50%)</span>
                </div>
                <span className="font-mono-code font-black text-amber-400 text-base">₹{estimatedPrizes.first}</span>
              </div>

              <div className="p-2.5 rounded-xl bg-slate-800/60 border border-slate-700 flex items-center justify-between">
                <div className="flex items-center gap-2 font-bold text-slate-200">
                  <span className="w-6 h-6 rounded-lg bg-slate-300 text-slate-950 flex items-center justify-center text-xs font-black shadow-sm">
                    2
                  </span>
                  <span>2nd Place (30%)</span>
                </div>
                <span className="font-mono-code font-bold text-white text-base">₹{estimatedPrizes.second}</span>
              </div>

              <div className="p-2.5 rounded-xl bg-amber-950/30 border border-amber-900/40 flex items-center justify-between">
                <div className="flex items-center gap-2 font-bold text-amber-500">
                  <span className="w-6 h-6 rounded-lg bg-amber-700 text-white flex items-center justify-center text-xs font-black shadow-sm">
                    3
                  </span>
                  <span>3rd Place (20%)</span>
                </div>
                <span className="font-mono-code font-bold text-amber-400 text-base">₹{estimatedPrizes.third}</span>
              </div>
            </div>

            {tournament.perKill > 0 && (
              <div className="p-2.5 rounded-xl bg-emerald-950/40 border border-emerald-800/40 text-emerald-300 text-xs flex items-center justify-between">
                <span className="font-semibold">Kill Bounty Reward:</span>
                <span className="font-mono-code font-bold text-emerald-400">₹{tournament.perKill} / kill</span>
              </div>
            )}

            <p className="text-[10px] text-slate-400 text-center leading-relaxed">
              Estimated prize calculation based on standard tournament prize pool ratios. Winnings are automatically credited to player wallets after the match.
            </p>

            <button
              type="button"
              onClick={() => setPrizeModalOpen(false)}
              className="w-full py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs uppercase tracking-wider transition"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
