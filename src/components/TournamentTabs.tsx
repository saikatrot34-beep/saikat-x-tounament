import React from 'react';
import { Calendar, Radio, Trophy, CheckCircle2 } from 'lucide-react';

interface TournamentTabsProps {
  currentStatus: 'upcoming' | 'ongoing' | 'resulted';
  onSelectStatus: (status: 'upcoming' | 'ongoing' | 'resulted') => void;
  counts: {
    upcoming: number;
    ongoing: number;
    resulted: number;
  };
}

export const TournamentTabs: React.FC<TournamentTabsProps> = ({
  currentStatus,
  onSelectStatus,
  counts
}) => {
  return (
    <div className="grid grid-cols-3 gap-2 p-1.5 rounded-2xl bg-slate-900/90 border border-slate-800 shadow-inner">
      <button
        onClick={() => onSelectStatus('upcoming')}
        className={`flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl font-bold text-xs tracking-wider uppercase transition-all ${
          currentStatus === 'upcoming'
            ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20'
            : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
        }`}
      >
        <Calendar className="w-3.5 h-3.5" />
        <span>Upcoming</span>
        <span
          className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono-code ${
            currentStatus === 'upcoming' ? 'bg-slate-950/20 text-slate-950 font-extrabold' : 'bg-slate-800 text-slate-400'
          }`}
        >
          {counts.upcoming}
        </span>
      </button>

      <button
        onClick={() => onSelectStatus('ongoing')}
        className={`flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl font-bold text-xs tracking-wider uppercase transition-all ${
          currentStatus === 'ongoing'
            ? 'bg-red-500 text-white shadow-md shadow-red-500/20'
            : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
        }`}
      >
        <span className="relative flex h-2 w-2">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
          <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
        </span>
        <span>Ongoing</span>
        <span
          className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono-code ${
            currentStatus === 'ongoing' ? 'bg-white/20 text-white font-extrabold' : 'bg-slate-800 text-slate-400'
          }`}
        >
          {counts.ongoing}
        </span>
      </button>

      <button
        onClick={() => onSelectStatus('resulted')}
        className={`flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl font-bold text-xs tracking-wider uppercase transition-all ${
          currentStatus === 'resulted'
            ? 'bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/20'
            : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
        }`}
      >
        <Trophy className="w-3.5 h-3.5" />
        <span>Resulted</span>
        <span
          className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono-code ${
            currentStatus === 'resulted' ? 'bg-slate-950/20 text-slate-950 font-extrabold' : 'bg-slate-800 text-slate-400'
          }`}
        >
          {counts.resulted}
        </span>
      </button>
    </div>
  );
};
