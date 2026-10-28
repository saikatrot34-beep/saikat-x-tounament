import React, { useState } from 'react';
import { 
  Crown, 
  Trophy, 
  Plus, 
  Users, 
  ArrowDownLeft, 
  ArrowUpRight, 
  Settings, 
  ShieldAlert, 
  CheckCircle2, 
  XCircle, 
  Key, 
  Copy, 
  Check, 
  UserCheck, 
  Sliders, 
  Sparkles,
  AlertTriangle,
  RotateCcw,
  Target,
  ArrowRight
} from 'lucide-react';
import { db } from '../../services/firebaseSimulator';
import { Tournament, UserProfile, DepositRequest, WithdrawalRequest } from '../../types';
import confetti from 'canvas-confetti';

interface AdminDashboardProps {
  onClose: () => void;
  currentUser?: UserProfile;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({ onClose, currentUser }) => {
  const [activeTab, setActiveTab] = useState<'tournaments' | 'participants' | 'deposits' | 'withdrawals' | 'users' | 'staff' | 'config'>('tournaments');

  // Form states
  const [createTournOpen, setCreateTournOpen] = useState(false);
  const [newTourn, setNewTourn] = useState({
    title: '',
    game: 'bgmi',
    entryFee: 30,
    prizePool: 2400,
    totalSpots: 100,
    time: Date.now() + 3600000 * 2,
    matchType: 'SOLO' as 'SOLO' | 'DUO' | 'SQUAD',
    map: 'Erangel',
    version: 'TPP' as 'TPP' | 'FPP',
    perKill: 15
  });

  // Room Credentials Modal
  const [roomModalOpen, setRoomModalOpen] = useState(false);
  const [selectedTournKey, setSelectedTournKey] = useState<string>('');
  const [roomIdInput, setRoomIdInput] = useState('');
  const [passInput, setPassInput] = useState('');
  const [instructInput, setInstructInput] = useState('Search Room ID in BGMI Custom Room > Enter Password. Take screenshot of result.');

  // Finalize Results Modal
  const [resultModalOpen, setResultModalOpen] = useState(false);
  const [winnerRanks, setWinnerRanks] = useState([
    { rank: 1, uid: 'user_viper_01', ign: 'VIPER・Godz', gameUid: '5192847102', kills: 7, prize: 800 },
    { rank: 2, uid: 'user_ghost_02', ign: 'Ghost_OP7', gameUid: '6298104419', kills: 4, prize: 400 },
    { rank: 3, uid: '', ign: 'SniperWolf', gameUid: '510294821', kills: 3, prize: 200 }
  ]);
  const [resultNote, setResultNote] = useState('Official match room concluded. Verified screenshot submitted.');

  // Config State
  const [configForm, setConfigForm] = useState(db.getState().app_config);

  // New Staff State
  const [newStaffName, setNewStaffName] = useState('');
  const [newStaffEmail, setNewStaffEmail] = useState('');
  const [newStaffCanMatch, setNewStaffCanMatch] = useState(true);

  // Balance adjust modal
  const [adjustUid, setAdjustUid] = useState<string | null>(null);
  const [adjWallet, setAdjWallet] = useState<number>(0);
  const [adjWin, setAdjWin] = useState<number>(0);

  const [notification, setNotification] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const dbState = db.getState();
  const isAdmin = db.isAdmin();
  const isStaff = db.isStaffWithMatches();

  const allTournaments = [
    ...Object.values(dbState.tournaments.upcoming),
    ...Object.values(dbState.tournaments.ongoing),
    ...Object.values(dbState.tournaments.resulted)
  ];

  // Flatten deposits & withdrawals
  const allDeposits: DepositRequest[] = [];
  Object.values(dbState.deposits).forEach((uDeps) => {
    Object.values(uDeps).forEach((d) => allDeposits.push(d));
  });
  allDeposits.sort((a, b) => b.createdAt - a.createdAt);

  const allWithdrawals: WithdrawalRequest[] = [];
  Object.values(dbState.withdrawals).forEach((uWds) => {
    Object.values(uWds).forEach((w) => allWithdrawals.push(w));
  });
  allWithdrawals.sort((a, b) => b.createdAt - a.createdAt);

  const pendingDeposits = allDeposits.filter((d) => d.status === 'pending');
  const pendingWithdrawals = allWithdrawals.filter((w) => w.status === 'pending');

  const handleCreateTournament = (e: React.FormEvent) => {
    e.preventDefault();
    setNotification(null);

    const res = db.createTournament({
      title: newTourn.title,
      game: newTourn.game,
      entryFee: Number(newTourn.entryFee),
      prizePool: Number(newTourn.prizePool),
      totalSpots: Number(newTourn.totalSpots),
      time: newTourn.time,
      matchType: newTourn.matchType,
      map: newTourn.map,
      version: newTourn.version,
      perKill: Number(newTourn.perKill),
      prizeDistribution: [
        { rank: '1st', prize: Math.round(newTourn.prizePool * 0.45) },
        { rank: '2nd', prize: Math.round(newTourn.prizePool * 0.25) },
        { rank: '3rd', prize: Math.round(newTourn.prizePool * 0.15) }
      ],
      rules: [
        'Room ID & Password available 15 minutes before start.',
        'Emulators & iPads strictly banned.',
        'Play only in your registered slot.'
      ]
    });

    if (!res.success) {
      setNotification({ type: 'error', text: res.message });
    } else {
      confetti({ particleCount: 50, spread: 60 });
      setNotification({ type: 'success', text: res.message });
      setCreateTournOpen(false);
      setNewTourn({
        title: '',
        game: 'bgmi',
        entryFee: 30,
        prizePool: 2400,
        totalSpots: 100,
        time: Date.now() + 3600000 * 2,
        matchType: 'SOLO',
        map: 'Erangel',
        version: 'TPP',
        perKill: 15
      });
    }
  };

  const handleSaveRoomCredentials = (e: React.FormEvent) => {
    e.preventDefault();
    setNotification(null);
    if (!roomIdInput || !passInput) {
      setNotification({ type: 'error', text: 'Room ID and Password are required.' });
      return;
    }

    const res = db.updateMatchRoomCredentials(selectedTournKey, roomIdInput, passInput, instructInput);
    if (!res.success) {
      setNotification({ type: 'error', text: res.message });
    } else {
      setNotification({ type: 'success', text: 'Room credentials published! Match moved to Ongoing.' });
      setRoomModalOpen(false);
    }
  };

  const handleFinalizeMatchResults = (e: React.FormEvent) => {
    e.preventDefault();
    setNotification(null);

    const validWinners = winnerRanks.filter((w) => w.ign.trim().length > 0);
    const res = db.submitMatchResultsAndPrizes(selectedTournKey, validWinners, resultNote);
    if (!res.success) {
      setNotification({ type: 'error', text: res.message });
    } else {
      confetti({ particleCount: 90, spread: 80 });
      setNotification({ type: 'success', text: res.message });
      setResultModalOpen(false);
    }
  };

  const handleApproveDeposit = (d: DepositRequest) => {
    const res = db.approveDeposit(d.uid, d.id);
    setNotification({ type: res.success ? 'success' : 'error', text: res.message });
  };

  const handleRejectDeposit = (d: DepositRequest) => {
    const res = db.rejectDeposit(d.uid, d.id, 'UTR verification failed');
    setNotification({ type: res.success ? 'success' : 'error', text: res.message });
  };

  const handleApproveWithdrawal = (w: WithdrawalRequest) => {
    const res = db.approveWithdrawal(w.uid, w.id);
    setNotification({ type: res.success ? 'success' : 'error', text: res.message });
  };

  const handleRejectWithdrawal = (w: WithdrawalRequest) => {
    const res = db.rejectWithdrawal(w.uid, w.id, 'UPI verification failed');
    setNotification({ type: res.success ? 'success' : 'error', text: res.message });
  };

  const handleToggleBan = (uid: string) => {
    const res = db.toggleBanUser(uid);
    setNotification({ type: res.success ? 'success' : 'error', text: res.message });
  };

  const handleSaveBalance = (e: React.FormEvent) => {
    e.preventDefault();
    if (!adjustUid) return;
    const res = db.updateWalletBalance(adjustUid, Number(adjWallet), Number(adjWin));
    setNotification({ type: res.success ? 'success' : 'error', text: res.message });
    setAdjustUid(null);
  };

  const handleAddStaff = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newStaffName || !newStaffEmail) return;
    const res = db.createStaffMember(newStaffName, newStaffEmail, newStaffCanMatch);
    setNotification({ type: res.success ? 'success' : 'error', text: res.message });
    setNewStaffName('');
    setNewStaffEmail('');
  };

  const handleSaveConfig = (e: React.FormEvent) => {
    e.preventDefault();
    const res = db.updateAppConfig(configForm);
    setNotification({ type: res.success ? 'success' : 'error', text: res.message });
  };

  const handleCopySlotList = (tournKey: string) => {
    const parts = dbState.match_participants[tournKey] || {};
    const lines = Object.values(parts).map((p) => `Slot #${p.slotNo} - IGN: ${p.ign} (UID: ${p.gameUid})`);
    if (lines.length === 0) {
      alert('No participants registered yet.');
      return;
    }
    navigator.clipboard.writeText(lines.join('\n'));
    alert(`Copied ${lines.length} participant slots to clipboard!`);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/85 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-6xl rounded-3xl bg-[#0b0e17] border border-slate-800 shadow-2xl overflow-hidden max-h-[94vh] flex flex-col">
        {/* Header */}
        <div className="p-5 border-b border-slate-800 flex items-center justify-between bg-slate-900/60">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center border border-amber-500/30">
              <Crown className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-gaming text-xl font-bold text-white tracking-wide">
                  ArenaX Admin &amp; Staff Command Center
                </h3>
                <span className="text-[10px] px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 font-bold border border-amber-500/30">
                  {isAdmin ? 'Super Admin' : 'Staff Ops'}
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Tournament operations, cashiers, participant slotting &amp; rules enforcement
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs uppercase"
          >
            Exit Portal
          </button>
        </div>

        {/* Global Stats Ribbon */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-4 bg-slate-900/90 border-b border-slate-800/80">
          <div className="p-3 rounded-xl bg-slate-800/40 border border-slate-700/60">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Total Tournaments</span>
            <p className="font-gaming text-xl font-black text-white">{allTournaments.length}</p>
          </div>
          <div className="p-3 rounded-xl bg-slate-800/40 border border-slate-700/60">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Registered Players</span>
            <p className="font-gaming text-xl font-black text-amber-400">{Object.keys(dbState.users).length}</p>
          </div>
          <div className="p-3 rounded-xl bg-slate-800/40 border border-slate-700/60">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Pending Deposits</span>
            <p className="font-gaming text-xl font-black text-emerald-400">{pendingDeposits.length}</p>
          </div>
          <div className="p-3 rounded-xl bg-slate-800/40 border border-slate-700/60">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Pending Withdrawals</span>
            <p className="font-gaming text-xl font-black text-rose-400">{pendingWithdrawals.length}</p>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="px-5 pt-3 border-b border-slate-800 flex items-center gap-2 overflow-x-auto no-scrollbar bg-slate-900/40">
          {[
            { id: 'tournaments', label: 'Tournaments & Matches', icon: Trophy },
            { id: 'participants', label: 'Slot & Participant Host', icon: Users },
            { id: 'deposits', label: `Deposits (${pendingDeposits.length})`, icon: ArrowDownLeft },
            { id: 'withdrawals', label: `Withdrawals (${pendingWithdrawals.length})`, icon: ArrowUpRight },
            { id: 'users', label: 'User & Ban Control', icon: ShieldAlert },
            { id: 'staff', label: 'Staff Management', icon: UserCheck },
            { id: 'config', label: 'App Settings', icon: Settings }
          ].map((tab) => {
            const Icon = tab.icon;
            const isSelected = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center gap-2 pb-2.5 px-3 text-xs font-bold uppercase tracking-wider whitespace-nowrap border-b-2 transition ${
                  isSelected
                    ? 'border-amber-400 text-amber-400'
                    : 'border-transparent text-slate-400 hover:text-slate-200'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Notification Toast */}
        {notification && (
          <div className={`mx-5 mt-3 p-3 rounded-xl border text-xs flex items-center justify-between ${
            notification.type === 'success' ? 'bg-emerald-950/60 border-emerald-800 text-emerald-300' : 'bg-red-950/60 border-red-800 text-red-300'
          }`}>
            <div className="flex items-center gap-2">
              {notification.type === 'success' ? <CheckCircle2 className="w-4 h-4 shrink-0" /> : <AlertTriangle className="w-4 h-4 shrink-0" />}
              <span>{notification.text}</span>
            </div>
            <button onClick={() => setNotification(null)} className="text-slate-400 hover:text-white">✕</button>
          </div>
        )}

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-6">
          {/* TAB 1: TOURNAMENTS */}
          {activeTab === 'tournaments' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-gaming text-lg font-bold text-white">Tournaments Management</h4>
                  <p className="text-xs text-slate-400">Create matches with strict rule validation, release room keys, or declare results</p>
                </div>
                <button
                  onClick={() => setCreateTournOpen(true)}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs uppercase tracking-wider shadow-md shadow-amber-500/20"
                >
                  <Plus className="w-4 h-4" />
                  <span>Create Tournament</span>
                </button>
              </div>

              {/* Tournament List Table */}
              <div className="rounded-2xl border border-slate-800 overflow-hidden bg-slate-900/60">
                <div className="divide-y divide-slate-800">
                  {allTournaments.map((t) => {
                    const isUpcoming = t.status === 'upcoming';
                    const isOngoing = t.status === 'ongoing';
                    const isResulted = t.status === 'resulted';
                    const room = dbState.match_rooms[t.key];

                    return (
                      <div key={t.key} className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-slate-800/40 transition">
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30">
                              {t.game.toUpperCase()}
                            </span>
                            <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded ${
                              isUpcoming ? 'bg-blue-500/20 text-blue-300' : isOngoing ? 'bg-red-500/20 text-red-300' : 'bg-emerald-500/20 text-emerald-300'
                            }`}>
                              {t.status}
                            </span>
                            <span className="text-xs text-slate-400">Map: {t.map} ({t.matchType})</span>
                          </div>
                          <h5 className="font-gaming text-base font-bold text-white">{t.title}</h5>
                          <div className="text-xs text-slate-400 flex items-center gap-3 mt-1 font-mono-code">
                            <span>Entry: ₹{t.entryFee}</span>
                            <span>•</span>
                            <span>Prize Pool: ₹{t.prizePool}</span>
                            <span>•</span>
                            <span>Joined: {t.joined}/{t.totalSpots}</span>
                            {room && <span className="text-amber-400">• Room ID: {room.roomId}</span>}
                          </div>
                        </div>

                        {/* Actions */}
                        <div className="flex items-center gap-2">
                          {isUpcoming && (
                            <button
                              onClick={() => {
                                setSelectedTournKey(t.key);
                                setRoomModalOpen(true);
                              }}
                              className="px-3 py-1.5 rounded-lg bg-red-600 hover:bg-red-500 text-white font-bold text-xs uppercase"
                            >
                              Release Room &amp; Start
                            </button>
                          )}

                          {isOngoing && (
                            <>
                              <button
                                onClick={() => {
                                  setSelectedTournKey(t.key);
                                  setRoomModalOpen(true);
                                }}
                                className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-amber-400 text-xs font-bold uppercase"
                              >
                                Edit Room
                              </button>
                              <button
                                onClick={() => {
                                  setSelectedTournKey(t.key);
                                  setResultModalOpen(true);
                                }}
                                className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-slate-950 font-black text-xs uppercase"
                              >
                                Finalize &amp; Payout
                              </button>
                            </>
                          )}

                          {isResulted && (
                            <span className="text-xs text-emerald-400 font-bold px-2 py-1 rounded bg-emerald-950 border border-emerald-800">
                              Results Paid Out
                            </span>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: PARTICIPANTS & HOST */}
          {activeTab === 'participants' && (
            <div className="space-y-4">
              <div>
                <h4 className="font-gaming text-lg font-bold text-white">Participant &amp; Room Host Manager</h4>
                <p className="text-xs text-slate-400">View real-time slot bookings and export room list for in-game room admin</p>
              </div>

              <div className="space-y-3">
                {allTournaments.map((t) => {
                  const parts = dbState.match_participants[t.key] || {};
                  const partList = Object.values(parts);

                  return (
                    <div key={t.key} className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-3">
                      <div className="flex items-center justify-between">
                        <div>
                          <h5 className="font-bold text-white text-sm">{t.title}</h5>
                          <p className="text-xs text-slate-400 font-mono-code">Registered: {partList.length} / {t.totalSpots} spots</p>
                        </div>
                        <button
                          onClick={() => handleCopySlotList(t.key)}
                          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-amber-400 text-xs font-bold uppercase"
                        >
                          <Copy className="w-3.5 h-3.5" />
                          <span>Copy Slot List</span>
                        </button>
                      </div>

                      {partList.length > 0 ? (
                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
                          {partList.map((p) => (
                            <div key={p.uid} className="p-2.5 rounded-xl bg-slate-800/60 border border-slate-700 text-xs flex items-center justify-between">
                              <div>
                                <span className="font-mono-code font-bold text-emerald-400">Slot #{p.slotNo}: </span>
                                <span className="font-semibold text-slate-200">{p.ign}</span>
                                <p className="text-[10px] text-slate-400 font-mono-code">UID: {p.gameUid}</p>
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-xs text-slate-500 italic">No registrations yet for this match.</p>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* TAB 3: DEPOSITS APPROVAL */}
          {activeTab === 'deposits' && (
            <div className="space-y-4">
              <div>
                <h4 className="font-gaming text-lg font-bold text-white">Deposit Requests Queue</h4>
                <p className="text-xs text-slate-400">Review player UTR transaction IDs and credit wallet balances</p>
              </div>

              <div className="rounded-2xl border border-slate-800 overflow-hidden bg-slate-900/60 divide-y divide-slate-800">
                {allDeposits.length === 0 ? (
                  <div className="p-8 text-center text-slate-400 text-xs">No deposit requests recorded.</div>
                ) : (
                  allDeposits.map((d) => (
                    <div key={d.id} className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-bold text-white">{d.username}</span>
                          <span className="font-mono-code text-slate-400">({d.uid})</span>
                          <span className={`px-2 py-0.5 rounded text-[10px] uppercase font-bold ${
                            d.status === 'approved' ? 'bg-emerald-950 text-emerald-400' : d.status === 'pending' ? 'bg-amber-950 text-amber-400' : 'bg-red-950 text-red-400'
                          }`}>
                            {d.status}
                          </span>
                        </div>
                        <p className="font-mono-code text-slate-300">
                          Amount: <strong className="text-amber-400 font-bold text-sm">₹{d.amount}</strong> | UTR: <strong className="text-white">{d.utr}</strong>
                        </p>
                        <p className="text-[10px] text-slate-400 mt-0.5">Method: {d.method} • {new Date(d.createdAt).toLocaleString()}</p>
                      </div>

                      {d.status === 'pending' && (
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleApproveDeposit(d)}
                            className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-slate-950 font-black uppercase text-xs shadow-md shadow-emerald-600/20"
                          >
                            Approve &amp; Credit
                          </button>
                          <button
                            onClick={() => handleRejectDeposit(d)}
                            className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-rose-400 uppercase text-xs font-bold"
                          >
                            Reject
                          </button>
                        </div>
                      )}
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          {/* TAB 4: WITHDRAWALS APPROVAL */}
          {activeTab === 'withdrawals' && (
            <div className="space-y-4">
              <div>
                <h4 className="font-gaming text-lg font-bold text-white">Withdrawals &amp; Payout Queue</h4>
                <p className="text-xs text-slate-400">Verify winning payouts to players&apos; UPI handles</p>
              </div>

              <div className="rounded-2xl border border-slate-800 overflow-hidden bg-slate-900/60 divide-y divide-slate-800">
                {allWithdrawals.length === 0 ? (
                  <div className="p-8 text-center text-slate-400 text-xs">No withdrawal requests recorded.</div>
                ) : (
                  allWithdrawals.map((w) => (
                    <div key={w.id} className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-bold text-white">{w.username}</span>
                          <span className={`px-2 py-0.5 rounded text-[10px] uppercase font-bold ${
                            w.status === 'approved' ? 'bg-emerald-950 text-emerald-400' : w.status === 'pending' ? 'bg-amber-950 text-amber-400' : 'bg-red-950 text-red-400'
                          }`}>
                            {w.status}
                          </span>
                        </div>
                        <p className="font-mono-code text-slate-300">
                          Amount: <strong className="text-amber-400 font-bold text-sm">₹{w.amount}</strong> | Beneficiary UPI: <strong className="text-emerald-300">{w.upi}</strong>
                        </p>
                        <p className="text-[10px] text-slate-400 mt-0.5">{new Date(w.createdAt).toLocaleString()}</p>
                      </div>

                      {w.status === 'pending' && (
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleApproveWithdrawal(w)}
                            className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-slate-950 font-black uppercase text-xs"
                          >
                            Mark Paid
                          </button>
                          <button
                            onClick={() => handleRejectWithdrawal(w)}
                            className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-rose-400 uppercase text-xs font-bold"
                          >
                            Reject &amp; Refund
                          </button>
                        </div>
                      )}
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          {/* TAB 5: USERS & BAN CONTROL */}
          {activeTab === 'users' && (
            <div className="space-y-4">
              <div>
                <h4 className="font-gaming text-lg font-bold text-white">User Accounts &amp; Ban Enforcer</h4>
                <p className="text-xs text-slate-400">Enforce Firebase security rule root.child(&apos;users/&apos;+auth.uid+&apos;/banned&apos;)</p>
              </div>

              <div className="rounded-2xl border border-slate-800 overflow-hidden bg-slate-900/60 divide-y divide-slate-800">
                {Object.values(dbState.users).map((u) => (
                  <div key={u.uid} className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                    <div className="flex items-center gap-3">
                      <img src={u.avatar} alt={u.username} className="w-10 h-10 rounded-xl bg-slate-800 border border-slate-700" />
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-white text-sm">{u.username}</span>
                          {u.banned && (
                            <span className="text-[10px] px-1.5 py-0.2 rounded bg-red-950 text-red-400 border border-red-800 font-bold uppercase">
                              Banned
                            </span>
                          )}
                        </div>
                        <p className="font-mono-code text-slate-400">UID: {u.uid} • {u.email}</p>
                        <p className="text-amber-400 font-mono-code font-bold mt-0.5">
                          Wallet: ₹{u.walletBalance} | Win: ₹{u.winBalance} | Ref: {u.referralCode}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => {
                          setAdjustUid(u.uid);
                          setAdjWallet(u.walletBalance);
                          setAdjWin(u.winBalance);
                        }}
                        className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs"
                      >
                        Adjust Balance
                      </button>
                      <button
                        onClick={() => handleToggleBan(u.uid)}
                        className={`px-3 py-1.5 rounded-lg font-bold text-xs uppercase ${
                          u.banned
                            ? 'bg-emerald-600 hover:bg-emerald-500 text-slate-950'
                            : 'bg-red-600 hover:bg-red-500 text-white'
                        }`}
                      >
                        {u.banned ? 'Unban Account' : 'Ban Account'}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 6: STAFF MANAGEMENT */}
          {activeTab === 'staff' && (
            <div className="space-y-4">
              <div>
                <h4 className="font-gaming text-lg font-bold text-white">Staff Management &amp; Permissions</h4>
                <p className="text-xs text-slate-400">Matches rule root.child(&apos;staff/&apos;+auth.uid+&apos;/permissions/matches&apos;).val() === true</p>
              </div>

              {/* Add staff form */}
              <form onSubmit={handleAddStaff} className="p-4 rounded-2xl bg-slate-900 border border-slate-800 grid grid-cols-1 sm:grid-cols-4 gap-3 text-xs">
                <input
                  type="text"
                  required
                  placeholder="Staff Name"
                  value={newStaffName}
                  onChange={(e) => setNewStaffName(e.target.value)}
                  className="px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-white"
                />
                <input
                  type="email"
                  required
                  placeholder="Staff Email"
                  value={newStaffEmail}
                  onChange={(e) => setNewStaffEmail(e.target.value)}
                  className="px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-white"
                />
                <label className="flex items-center gap-2 text-slate-300">
                  <input
                    type="checkbox"
                    checked={newStaffCanMatch}
                    onChange={(e) => setNewStaffCanMatch(e.target.checked)}
                    className="rounded"
                  />
                  <span>Can Manage Matches</span>
                </label>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold uppercase"
                >
                  Add Staff Member
                </button>
              </form>

              {/* Staff list */}
              <div className="rounded-2xl border border-slate-800 overflow-hidden bg-slate-900/60 divide-y divide-slate-800">
                {Object.values(dbState.staff).map((st) => (
                  <div key={st.uid} className="p-4 flex items-center justify-between text-xs">
                    <div>
                      <p className="font-bold text-white text-sm">{st.name}</p>
                      <p className="text-slate-400 font-mono-code">{st.email} • UID: {st.uid}</p>
                    </div>
                    <span className="px-2 py-1 rounded bg-blue-500/20 text-blue-300 border border-blue-500/30 font-bold">
                      Match Permission: {st.permissions.matches ? 'ENABLED' : 'DISABLED'}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 7: APP CONFIG */}
          {activeTab === 'config' && (
            <form onSubmit={handleSaveConfig} className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-4 text-xs max-w-2xl">
              <h4 className="font-gaming text-lg font-bold text-white">Platform Settings (app_config node)</h4>
              
              <div className="space-y-1">
                <label className="font-bold text-slate-300 uppercase">App Name</label>
                <input
                  type="text"
                  value={configForm.appName}
                  onChange={(e) => setConfigForm({ ...configForm, appName: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-white"
                />
              </div>

              <div className="space-y-1">
                <label className="font-bold text-slate-300 uppercase">Support UPI ID</label>
                <input
                  type="text"
                  value={configForm.supportUpi}
                  onChange={(e) => setConfigForm({ ...configForm, supportUpi: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-white font-mono-code"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-bold text-slate-300 uppercase">Min Deposit (₹)</label>
                  <input
                    type="number"
                    value={configForm.minDeposit}
                    onChange={(e) => setConfigForm({ ...configForm, minDeposit: Number(e.target.value) })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-white"
                  />
                </div>
                <div className="space-y-1">
                  <label className="font-bold text-slate-300 uppercase">Min Withdrawal (₹)</label>
                  <input
                    type="number"
                    value={configForm.minWithdraw}
                    onChange={(e) => setConfigForm({ ...configForm, minWithdraw: Number(e.target.value) })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-white"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="font-bold text-slate-300 uppercase">Banner Announcement Text</label>
                <textarea
                  rows={2}
                  value={configForm.bannerAnnouncement || ''}
                  onChange={(e) => setConfigForm({ ...configForm, bannerAnnouncement: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-white"
                />
              </div>

              <button
                type="submit"
                className="px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold uppercase"
              >
                Save App Settings
              </button>
            </form>
          )}
        </div>

        {/* Modal: Create Tournament */}
        {createTournOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
            <form onSubmit={handleCreateTournament} className="w-full max-w-lg rounded-3xl bg-[#0f1422] border border-slate-800 p-5 space-y-4 text-xs">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <h4 className="font-gaming text-lg font-bold text-white">Create New Tournament</h4>
                <button type="button" onClick={() => setCreateTournOpen(false)} className="text-slate-400 hover:text-white">✕</button>
              </div>

              <div className="p-2.5 rounded-xl bg-indigo-950/40 border border-indigo-800/40 text-indigo-300 text-[11px] font-mono-code">
                Rule Validations: entryFee &gt;= 10 &amp;&amp; &lt;= 10000, prizePool &gt;= 50, totalSpots 2-100, title &gt; 2 chars
              </div>

              <div className="space-y-1">
                <label className="font-bold text-slate-300">Tournament Title</label>
                <input
                  type="text"
                  required
                  value={newTourn.title}
                  onChange={(e) => setNewTourn({ ...newTourn, title: e.target.value })}
                  placeholder="e.g. BGMI Squad War #150"
                  className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white"
                />
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="font-bold text-slate-300">Game</label>
                  <select
                    value={newTourn.game}
                    onChange={(e) => setNewTourn({ ...newTourn, game: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white"
                  >
                    <option value="bgmi">BGMI</option>
                    <option value="freefire">Free Fire</option>
                    <option value="codm">COD Mobile</option>
                  </select>
                </div>
                <div>
                  <label className="font-bold text-slate-300">Type</label>
                  <select
                    value={newTourn.matchType}
                    onChange={(e) => setNewTourn({ ...newTourn, matchType: e.target.value as any })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white"
                  >
                    <option value="SOLO">SOLO</option>
                    <option value="DUO">DUO</option>
                    <option value="SQUAD">SQUAD</option>
                  </select>
                </div>
                <div>
                  <label className="font-bold text-slate-300">Map</label>
                  <input
                    type="text"
                    value={newTourn.map}
                    onChange={(e) => setNewTourn({ ...newTourn, map: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="font-bold text-slate-300">Entry Fee (Min 10)</label>
                  <input
                    type="number"
                    min={10}
                    max={10000}
                    value={newTourn.entryFee}
                    onChange={(e) => setNewTourn({ ...newTourn, entryFee: Number(e.target.value) })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white font-mono-code"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-300">Prize Pool (Min 50)</label>
                  <input
                    type="number"
                    min={50}
                    value={newTourn.prizePool}
                    onChange={(e) => setNewTourn({ ...newTourn, prizePool: Number(e.target.value) })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white font-mono-code"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-300">Total Spots (2-100)</label>
                  <input
                    type="number"
                    min={2}
                    max={100}
                    value={newTourn.totalSpots}
                    onChange={(e) => setNewTourn({ ...newTourn, totalSpots: Number(e.target.value) })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white font-mono-code"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button type="button" onClick={() => setCreateTournOpen(false)} className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300">
                  Cancel
                </button>
                <button type="submit" className="px-5 py-2 rounded-xl bg-amber-500 text-slate-950 font-bold uppercase">
                  Publish Tournament
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Modal: Room Credentials Release */}
        {roomModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
            <form onSubmit={handleSaveRoomCredentials} className="w-full max-w-md rounded-3xl bg-[#0f1422] border border-slate-800 p-5 space-y-4 text-xs">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <h4 className="font-gaming text-lg font-bold text-white">Publish Room ID &amp; Password</h4>
                <button type="button" onClick={() => setRoomModalOpen(false)} className="text-slate-400 hover:text-white">✕</button>
              </div>
              <p className="text-xs text-slate-400">Match Key: <code className="text-amber-400 font-mono-code">{selectedTournKey}</code></p>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-bold text-slate-300">Custom Room ID</label>
                  <input
                    type="text"
                    required
                    value={roomIdInput}
                    onChange={(e) => setRoomIdInput(e.target.value)}
                    placeholder="e.g. 849201"
                    className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white font-mono-code"
                  />
                </div>
                <div className="space-y-1">
                  <label className="font-bold text-slate-300">Password</label>
                  <input
                    type="text"
                    required
                    value={passInput}
                    onChange={(e) => setPassInput(e.target.value)}
                    placeholder="e.g. 778"
                    className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white font-mono-code"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="font-bold text-slate-300">Host Instructions</label>
                <textarea
                  rows={2}
                  value={instructInput}
                  onChange={(e) => setInstructInput(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button type="button" onClick={() => setRoomModalOpen(false)} className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300">
                  Cancel
                </button>
                <button type="submit" className="px-5 py-2 rounded-xl bg-red-600 hover:bg-red-500 text-white font-bold uppercase">
                  Release to Registered Players
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Modal: Finalize Match Results & Payout */}
        {resultModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
            <form onSubmit={handleFinalizeMatchResults} className="w-full max-w-lg rounded-3xl bg-[#0f1422] border border-slate-800 p-5 space-y-4 text-xs max-h-[85vh] overflow-y-auto">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <h4 className="font-gaming text-lg font-bold text-white">Finalize Match &amp; Disburse Prizes</h4>
                <button type="button" onClick={() => setResultModalOpen(false)} className="text-slate-400 hover:text-white">✕</button>
              </div>
              <p className="text-xs text-slate-400">Prizes are credited directly to players&apos; Win Balance upon confirmation.</p>

              <div className="space-y-3">
                {winnerRanks.map((w, idx) => (
                  <div key={w.rank} className="p-3 rounded-xl bg-slate-900 border border-slate-800 space-y-2">
                    <span className="font-bold text-amber-400 uppercase text-[11px]">Rank #{w.rank} Prize Winner</span>
                    <div className="grid grid-cols-2 gap-2">
                      <input
                        type="text"
                        placeholder="Player IGN"
                        value={w.ign}
                        onChange={(e) => {
                          const updated = [...winnerRanks];
                          updated[idx].ign = e.target.value;
                          setWinnerRanks(updated);
                        }}
                        className="px-2.5 py-1.5 rounded-lg bg-slate-800 border border-slate-700 text-white"
                      />
                      <input
                        type="text"
                        placeholder="Game UID"
                        value={w.gameUid}
                        onChange={(e) => {
                          const updated = [...winnerRanks];
                          updated[idx].gameUid = e.target.value;
                          setWinnerRanks(updated);
                        }}
                        className="px-2.5 py-1.5 rounded-lg bg-slate-800 border border-slate-700 text-white font-mono-code"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <div className="flex items-center gap-1">
                        <span className="text-slate-400 text-[10px]">Kills:</span>
                        <input
                          type="number"
                          value={w.kills}
                          onChange={(e) => {
                            const updated = [...winnerRanks];
                            updated[idx].kills = Number(e.target.value);
                            setWinnerRanks(updated);
                          }}
                          className="w-full px-2 py-1 rounded-lg bg-slate-800 border border-slate-700 text-white font-mono-code"
                        />
                      </div>
                      <div className="flex items-center gap-1">
                        <span className="text-slate-400 text-[10px]">Prize (₹):</span>
                        <input
                          type="number"
                          value={w.prize}
                          onChange={(e) => {
                            const updated = [...winnerRanks];
                            updated[idx].prize = Number(e.target.value);
                            setWinnerRanks(updated);
                          }}
                          className="w-full px-2 py-1 rounded-lg bg-slate-800 border border-slate-700 text-white font-mono-code font-bold text-amber-300"
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="space-y-1">
                <label className="font-bold text-slate-300">Verification Note</label>
                <input
                  type="text"
                  value={resultNote}
                  onChange={(e) => setResultNote(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button type="button" onClick={() => setResultModalOpen(false)} className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300">
                  Cancel
                </button>
                <button type="submit" className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-slate-950 font-black uppercase">
                  Confirm &amp; Disburse Prizes
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Modal: Adjust User Balance */}
        {adjustUid && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
            <form onSubmit={handleSaveBalance} className="w-full max-w-sm rounded-3xl bg-[#0f1422] border border-slate-800 p-5 space-y-4 text-xs">
              <h4 className="font-gaming text-lg font-bold text-white">Adjust User Balances</h4>
              <p className="font-mono-code text-slate-400">UID: {adjustUid}</p>

              <div className="space-y-1">
                <label className="font-bold text-slate-300 uppercase">Wallet Balance (Play Balance)</label>
                <input
                  type="number"
                  min={0}
                  max={10000000}
                  value={adjWallet}
                  onChange={(e) => setAdjWallet(Number(e.target.value))}
                  className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white font-mono-code font-bold"
                />
              </div>

              <div className="space-y-1">
                <label className="font-bold text-slate-300 uppercase">Winning Balance (Withdrawable)</label>
                <input
                  type="number"
                  min={0}
                  value={adjWin}
                  onChange={(e) => setAdjWin(Number(e.target.value))}
                  className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white font-mono-code font-bold text-amber-400"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button type="button" onClick={() => setAdjustUid(null)} className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300">
                  Cancel
                </button>
                <button type="submit" className="px-5 py-2 rounded-xl bg-amber-500 text-slate-950 font-bold uppercase">
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  );
};
