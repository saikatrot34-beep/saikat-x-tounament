import React, { useState, useEffect } from 'react';
import { 
  Trophy, 
  Gamepad2, 
  Search, 
  Flame, 
  Target, 
  Wallet, 
  ShieldCheck, 
  Key, 
  Users, 
  Sparkles, 
  Zap, 
  HelpCircle,
  ExternalLink,
  Code2,
  BellRing,
  AlertTriangle,
  History
} from 'lucide-react';
import { db } from './services/firebaseSimulator';
import { Tournament, UserProfile } from './types';
import { Navbar } from './components/Navbar';
import { BannerSlider } from './components/BannerSlider';
import { GameSelector } from './components/GameSelector';
import { TournamentTabs } from './components/TournamentTabs';
import { TournamentCard } from './components/TournamentCard';
import { JoinTournamentModal } from './components/JoinTournamentModal';
import { MatchRoomModal } from './components/MatchRoomModal';
import { MatchResultModal } from './components/MatchResultModal';
import { WalletModal } from './components/WalletModal';
import { ReferralModal } from './components/ReferralModal';
import { NotificationsModal } from './components/NotificationsModal';
import { RulesInspectorModal } from './components/RulesInspectorModal';
import { AdminDashboard } from './components/AdminPanel/AdminDashboard';
import { GlobalLeaderboard } from './components/GlobalLeaderboard';
import { TournamentHistoryModal } from './components/TournamentHistoryModal';

export default function App() {
  const [, setDbVersion] = useState(0);

  // Filters & Tabs
  const [selectedGame, setSelectedGame] = useState<string>('all');
  const [selectedType, setSelectedType] = useState<string>('ALL');
  const [currentStatus, setCurrentStatus] = useState<'upcoming' | 'ongoing' | 'resulted'>('upcoming');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Modals
  const [activeJoinTourn, setActiveJoinTourn] = useState<Tournament | null>(null);
  const [activeRoomTourn, setActiveRoomTourn] = useState<Tournament | null>(null);
  const [activeResultTourn, setActiveResultTourn] = useState<Tournament | null>(null);
  const [walletModalOpen, setWalletModalOpen] = useState(false);
  const [walletInitialTab, setWalletInitialTab] = useState<'deposit' | 'withdraw' | 'history'>('deposit');
  const [referralModalOpen, setReferralModalOpen] = useState(false);
  const [notifsModalOpen, setNotifsModalOpen] = useState(false);
  const [rulesInspectorOpen, setRulesInspectorOpen] = useState(false);
  const [adminViewOpen, setAdminViewOpen] = useState(false);
  const [leaderboardModalOpen, setLeaderboardModalOpen] = useState(false);
  const [tournamentHistoryOpen, setTournamentHistoryOpen] = useState(false);

  // Subscribe to simulator updates
  useEffect(() => {
    const unsub = db.subscribe(() => {
      setDbVersion((v) => v + 1);
    });
    return unsub;
  }, []);

  // Deep link support for shared tournament links (?tournamentId=... or ?match=...)
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const tournamentId = params.get('tournamentId') || params.get('match');
    if (tournamentId) {
      const state = db.getState();
      const allTournaments = [
        ...Object.values(state.tournaments.upcoming || {}),
        ...Object.values(state.tournaments.ongoing || {}),
        ...Object.values(state.tournaments.resulted || {}),
      ];
      const matched = allTournaments.find((t) => t.key === tournamentId);
      if (matched) {
        setCurrentStatus(matched.status);
        setSelectedGame('all');
        setTimeout(() => {
          const el = document.getElementById(`tournament-${matched.key}`);
          if (el) {
            el.scrollIntoView({ behavior: 'smooth', block: 'center' });
          }
        }, 300);
      }
    }
  }, []);

  const dbState = db.getState();
  const currentUser = db.getCurrentUser();
  const config = dbState.app_config;
  const isAdmin = db.isAdmin();
  const isStaff = db.isStaffWithMatches();

  // Filter tournaments by status, game, matchType, and search query
  const rawTournamentsMap = dbState.tournaments[currentStatus] || {};
  const tournamentsList: Tournament[] = Object.values(rawTournamentsMap).filter((t) => {
    if (selectedGame !== 'all' && t.game !== selectedGame) return false;
    if (selectedType !== 'ALL' && t.matchType !== selectedType) return false;
    if (searchQuery.trim() && !t.title.toLowerCase().includes(searchQuery.toLowerCase()) && !t.map.toLowerCase().includes(searchQuery.toLowerCase())) {
      return false;
    }
    return true;
  });

  // Sort upcoming tournaments by earliest time, ongoing/resulted by recent
  tournamentsList.sort((a, b) => {
    if (currentStatus === 'upcoming') {
      return a.time - b.time;
    }
    return b.time - a.time;
  });

  const tournamentCounts = {
    upcoming: Object.keys(dbState.tournaments.upcoming || {}).length,
    ongoing: Object.keys(dbState.tournaments.ongoing || {}).length,
    resulted: Object.keys(dbState.tournaments.resulted || {}).length
  };

  const handleOpenWalletWithTab = (tab: 'deposit' | 'withdraw' | 'history') => {
    setWalletInitialTab(tab);
    setWalletModalOpen(true);
  };

  return (
    <div className="min-h-screen bg-[#080a0f] text-slate-100 flex flex-col selection:bg-amber-500 selection:text-slate-950">
      {/* Top Navigation */}
      <Navbar
        currentUser={currentUser}
        onOpenWallet={() => handleOpenWalletWithTab('deposit')}
        onOpenNotifications={() => setNotifsModalOpen(true)}
        onOpenRulesInspector={() => setRulesInspectorOpen(true)}
        onOpenReferral={() => setReferralModalOpen(true)}
        onOpenLeaderboard={() => setLeaderboardModalOpen(true)}
        onOpenHistory={() => setTournamentHistoryOpen(true)}
        onToggleAdminView={() => setAdminViewOpen(!adminViewOpen)}
        isAdminView={adminViewOpen}
      />

      {/* Announcement Marquee Bar */}
      {config.bannerAnnouncement && (
        <div className="bg-gradient-to-r from-amber-600/30 via-orange-600/40 to-amber-600/30 border-b border-amber-500/20 px-4 py-2 text-xs text-amber-200 flex items-center justify-center gap-2 text-center">
          <Zap className="w-3.5 h-3.5 text-amber-400 shrink-0 animate-bounce" />
          <span className="font-semibold">{config.bannerAnnouncement}</span>
        </div>
      )}

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-5 sm:py-7 space-y-6">
        {/* User Account Quick Stats & Hero Bar */}
        {currentUser && (
          <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-slate-900 via-[#111726] to-slate-900 border border-slate-800 p-4 sm:p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-xl">
            <div className="flex items-center gap-3.5">
              <img
                src={currentUser.avatar}
                alt={currentUser.username}
                className="w-12 h-12 rounded-2xl bg-slate-800 border-2 border-amber-500/50 shadow-md shadow-amber-500/10 object-cover"
              />
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="font-gaming text-xl font-bold text-white tracking-wide">
                    Welcome back, {currentUser.username}!
                  </h1>
                  {currentUser.banned && (
                    <span className="text-[10px] px-2 py-0.5 rounded bg-red-950 text-red-400 border border-red-800 font-bold uppercase">
                      Banned
                    </span>
                  )}
                </div>
                <p className="text-xs text-slate-400 flex items-center gap-2 mt-0.5">
                  <span>UID: <strong className="text-slate-300 font-mono-code">{currentUser.uid}</strong></span>
                  <span>•</span>
                  <span>IGN: <strong className="text-amber-400">{currentUser.defaultIgn || 'Not set'}</strong></span>
                </p>
              </div>
            </div>

            {/* Quick Player Stats */}
            <div className="flex items-center gap-2 sm:gap-4 flex-wrap">
              <div className="px-3 py-1.5 rounded-xl bg-slate-800/80 border border-slate-700/80 text-left">
                <span className="text-[10px] text-slate-400 uppercase font-bold block">Matches</span>
                <span className="font-mono-code text-sm font-bold text-white">{currentUser.totalMatches || 0}</span>
              </div>
              <div className="px-3 py-1.5 rounded-xl bg-slate-800/80 border border-slate-700/80 text-left">
                <span className="text-[10px] text-slate-400 uppercase font-bold block">Total Wins</span>
                <span className="font-mono-code text-sm font-bold text-amber-400">{currentUser.totalWins || 0}</span>
              </div>
              <div className="px-3 py-1.5 rounded-xl bg-slate-800/80 border border-slate-700/80 text-left">
                <span className="text-[10px] text-slate-400 uppercase font-bold block">Kills</span>
                <span className="font-mono-code text-sm font-bold text-emerald-400">{currentUser.totalKills || 0}</span>
              </div>
              <button
                onClick={() => setTournamentHistoryOpen(true)}
                className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-amber-300 font-bold text-xs uppercase tracking-wider transition active:scale-95 shadow-sm"
              >
                <History className="w-3.5 h-3.5 text-amber-400" />
                <span>Tournament History</span>
              </button>
              <button
                onClick={() => handleOpenWalletWithTab('deposit')}
                className="px-4 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-slate-950 font-black text-xs uppercase tracking-wider transition shadow-lg shadow-amber-500/20 active:scale-95"
              >
                + Add Cash
              </button>
            </div>
          </div>
        )}

        {/* Hero Banner Carousel (Sliders Node) */}
        <BannerSlider
          sliders={dbState.sliders}
          onOpenReferral={() => setReferralModalOpen(true)}
          onFilterGame={(gameId) => setSelectedGame(gameId)}
        />

        {/* Game Filters & Match Type Selectors */}
        <div className="space-y-4">
          <GameSelector
            games={dbState.esports_games}
            selectedGame={selectedGame}
            onSelectGame={(g) => setSelectedGame(g)}
            selectedType={selectedType}
            onSelectType={(t) => setSelectedType(t)}
          />

          {/* Search & Status Tabs Bar */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="sm:w-80">
              <TournamentTabs
                currentStatus={currentStatus}
                onSelectStatus={(s) => setCurrentStatus(s)}
                counts={tournamentCounts}
              />
            </div>

            {/* Search Input */}
            <div className="relative flex-1 sm:max-w-xs">
              <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search map or title..."
                className="w-full pl-9 pr-4 py-2 rounded-xl bg-slate-900/90 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-500/80 font-medium"
              />
            </div>
          </div>
        </div>

        {/* Tournaments Grid */}
        <div className="space-y-3">
          <div className="flex items-center justify-between text-xs text-slate-400 px-1 font-semibold">
            <span>Showing {tournamentsList.length} {currentStatus} matches</span>
            <span className="text-[11px] font-mono-code text-indigo-400">
              Protected by Firebase Realtime DB Rules
            </span>
          </div>

          {tournamentsList.length === 0 ? (
            <div className="text-center py-16 px-4 rounded-3xl bg-slate-900/40 border border-slate-800/80 space-y-3">
              <div className="w-14 h-14 rounded-2xl bg-slate-800/80 text-slate-400 flex items-center justify-center mx-auto">
                <Gamepad2 className="w-7 h-7" />
              </div>
              <h3 className="font-gaming text-lg font-bold text-white">
                No Tournaments Found
              </h3>
              <p className="text-xs text-slate-400 max-w-sm mx-auto">
                No matches match your current game or category filters. Try selecting &quot;All Games&quot; or check back shortly for newly scheduled scrims.
              </p>
              {(isAdmin || isStaff) && (
                <button
                  onClick={() => setAdminViewOpen(true)}
                  className="mt-2 px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs uppercase"
                >
                  Create Match in Admin Portal
                </button>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
              {tournamentsList.map((tournament) => {
                const participant = currentUser ? dbState.match_participants[tournament.key]?.[currentUser.uid] : undefined;

                return (
                  <TournamentCard
                    key={tournament.key}
                    tournament={tournament}
                    currentUser={currentUser}
                    participant={participant}
                    onJoin={(t) => setActiveJoinTourn(t)}
                    onViewRoom={(t) => setActiveRoomTourn(t)}
                    onViewResults={(t) => setActiveResultTourn(t)}
                    onInspectRule={() => setRulesInspectorOpen(true)}
                  />
                );
              })}
            </div>
          )}
        </div>

        {/* Global Leaderboard Section */}
        <section className="pt-2">
          <GlobalLeaderboard currentUser={currentUser} />
        </section>

        {/* Firebase Security Rules Overview Footer Box */}
        <div className="rounded-2xl bg-[#0d111a] border border-slate-800/80 p-4 sm:p-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-500/20 text-indigo-400 flex items-center justify-center shrink-0">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h4 className="font-bold text-slate-200 text-sm flex items-center gap-2">
                Firebase Realtime Database Rules Engine
                <span className="text-[10px] px-1.5 py-0.2 rounded bg-indigo-500/20 text-indigo-300 font-mono-code">14 Nodes Validated</span>
              </h4>
              <p className="text-xs text-slate-400 mt-0.5">
                Every lobby join, room lockbox query, wallet balance update, and payout follows the rules JSON.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setRulesInspectorOpen(true)}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-indigo-950 hover:bg-indigo-900 text-indigo-300 border border-indigo-700/50 text-xs font-bold uppercase tracking-wider transition"
            >
              <Code2 className="w-4 h-4" />
              <span>Launch Rules Simulator</span>
            </button>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="mt-auto border-t border-slate-800/80 py-6 px-4 bg-[#07090e] text-xs text-slate-400 text-center space-y-2">
        <p className="font-semibold text-slate-300">
          ArenaX Esports Tournament Platform • Built with Firebase Realtime Database
        </p>
        <p className="text-[11px] text-slate-400">
          Enforcing security rules for admins, staff, match participants, wallet transactions, and room credentials.
        </p>
      </footer>

      {/* MODALS */}
      {activeJoinTourn && (
        <JoinTournamentModal
          tournament={activeJoinTourn}
          currentUser={currentUser}
          onClose={() => setActiveJoinTourn(null)}
          onSuccess={() => {}}
          onOpenDeposit={() => handleOpenWalletWithTab('deposit')}
        />
      )}

      {activeRoomTourn && (
        <MatchRoomModal
          tournament={activeRoomTourn}
          currentUser={currentUser}
          participant={currentUser ? dbState.match_participants[activeRoomTourn.key]?.[currentUser.uid] : undefined}
          onClose={() => setActiveRoomTourn(null)}
          onOpenJoin={() => {
            const t = activeRoomTourn;
            setActiveRoomTourn(null);
            setActiveJoinTourn(t);
          }}
        />
      )}

      {activeResultTourn && (
        <MatchResultModal
          tournament={activeResultTourn}
          onClose={() => setActiveResultTourn(null)}
        />
      )}

      {walletModalOpen && (
        <WalletModal
          currentUser={currentUser}
          initialTab={walletInitialTab}
          onClose={() => setWalletModalOpen(false)}
          onSuccess={() => {}}
        />
      )}

      {referralModalOpen && (
        <ReferralModal
          currentUser={currentUser}
          onClose={() => setReferralModalOpen(false)}
          onSuccess={() => {}}
        />
      )}

      {notifsModalOpen && (
        <NotificationsModal
          notifications={dbState.notifications}
          onClose={() => setNotifsModalOpen(false)}
          onClear={() => {
            db.getState().notifications = [];
            setNotifsModalOpen(false);
          }}
        />
      )}

      {rulesInspectorOpen && (
        <RulesInspectorModal
          onClose={() => setRulesInspectorOpen(false)}
        />
      )}

      {adminViewOpen && (
        <AdminDashboard
          currentUser={currentUser}
          onClose={() => setAdminViewOpen(false)}
        />
      )}

      {leaderboardModalOpen && (
        <GlobalLeaderboard
          isModal={true}
          currentUser={currentUser}
          onClose={() => setLeaderboardModalOpen(false)}
        />
      )}

      {tournamentHistoryOpen && (
        <TournamentHistoryModal
          currentUser={currentUser}
          onClose={() => setTournamentHistoryOpen(false)}
          onViewResults={(tournKey) => {
            const found = dbState.tournaments.resulted[tournKey] || 
                          dbState.tournaments.ongoing[tournKey] || 
                          dbState.tournaments.upcoming[tournKey];
            if (found) {
              setActiveResultTourn(found);
            }
          }}
          onBrowseTournaments={() => {
            setTournamentHistoryOpen(false);
          }}
        />
      )}
    </div>
  );
}
