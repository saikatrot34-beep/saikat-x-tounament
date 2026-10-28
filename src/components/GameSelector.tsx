import React from 'react';
import { EsportsGame } from '../types';
import { Flame, Target, Crosshair, Sparkles } from 'lucide-react';

interface GameSelectorProps {
  games: EsportsGame[];
  selectedGame: string;
  onSelectGame: (gameId: string) => void;
  selectedType: string;
  onSelectType: (type: string) => void;
}

export const GameSelector: React.FC<GameSelectorProps> = ({
  games,
  selectedGame,
  onSelectGame,
  selectedType,
  onSelectType
}) => {
  const matchTypes = ['ALL', 'SOLO', 'DUO', 'SQUAD'];

  return (
    <div className="space-y-3">
      {/* Game Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar">
        <button
          onClick={() => onSelectGame('all')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-xs uppercase tracking-wider whitespace-nowrap transition-all border ${
            selectedGame === 'all'
              ? 'bg-gradient-to-r from-amber-500 to-orange-600 text-slate-950 border-amber-400 shadow-md shadow-amber-500/20'
              : 'bg-slate-900/80 hover:bg-slate-800 text-slate-300 border-slate-800 hover:border-slate-700'
          }`}
        >
          <Sparkles className="w-3.5 h-3.5" />
          <span>All Games</span>
        </button>

        {games.map((g) => {
          const isSelected = selectedGame === g.id;
          return (
            <button
              key={g.id}
              onClick={() => onSelectGame(g.id)}
              className={`flex items-center gap-2.5 px-4 py-2.5 rounded-xl font-bold text-xs uppercase tracking-wider whitespace-nowrap transition-all border ${
                isSelected
                  ? 'bg-gradient-to-r from-amber-500 to-orange-600 text-slate-950 border-amber-400 shadow-md shadow-amber-500/20'
                  : 'bg-slate-900/80 hover:bg-slate-800 text-slate-300 border-slate-800 hover:border-slate-700'
              }`}
            >
              <span className="text-sm">{g.icon}</span>
              <span>{g.shortName}</span>
            </button>
          );
        })}
      </div>

      {/* Match Type Pills */}
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div className="flex items-center gap-1.5 bg-slate-900/60 p-1 rounded-xl border border-slate-800/80">
          {matchTypes.map((t) => (
            <button
              key={t}
              onClick={() => onSelectType(t)}
              className={`px-3 py-1 rounded-lg text-[11px] font-bold tracking-wider uppercase transition ${
                selectedType === t
                  ? 'bg-slate-700 text-amber-300 shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              {t}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
