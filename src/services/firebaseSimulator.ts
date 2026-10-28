import {
  AdminMap,
  StaffMember,
  AppConfig,
  EsportsGame,
  SliderBanner,
  NotificationItem,
  UserProfile,
  Tournament,
  MatchRoom,
  MatchParticipant,
  MatchResult,
  DepositRequest,
  WithdrawalRequest,
  Transaction,
  RuleValidationResult
} from '../types';

import {
  INITIAL_ADMINS,
  INITIAL_STAFF,
  INITIAL_APP_CONFIG,
  INITIAL_ESPORTS_GAMES,
  INITIAL_SLIDERS,
  INITIAL_NOTIFICATIONS,
  INITIAL_REFERRALS,
  INITIAL_USERS,
  INITIAL_TOURNAMENTS,
  INITIAL_MATCH_ROOMS,
  INITIAL_MATCH_PARTICIPANTS,
  INITIAL_MATCH_RESULTS,
  INITIAL_DEPOSITS,
  INITIAL_WITHDRAWALS,
  INITIAL_TRANSACTIONS
} from './seedData';

const STORAGE_KEY = 'arenax_firebase_db_v1';

export interface DatabaseState {
  admins: AdminMap;
  staff: Record<string, StaffMember>;
  app_config: AppConfig;
  esports_games: EsportsGame[];
  sliders: SliderBanner[];
  notifications: NotificationItem[];
  referralCodes: Record<string, string>;
  users: Record<string, UserProfile>;
  tournaments: {
    upcoming: Record<string, Tournament>;
    ongoing: Record<string, Tournament>;
    resulted: Record<string, Tournament>;
  };
  match_rooms: Record<string, MatchRoom>;
  match_participants: Record<string, Record<string, MatchParticipant>>;
  match_results: Record<string, MatchResult>;
  deposits: Record<string, Record<string, DepositRequest>>;
  withdrawals: Record<string, Record<string, WithdrawalRequest>>;
  transactions: Transaction[];
}

function loadInitialState(): DatabaseState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      // Ensure upcoming tournaments maintain future timestamps within 24h if expired
      if (parsed.tournaments?.upcoming) {
        const currentTime = Date.now();
        const fallbackOffsets = [30 * 60 * 1000, 2 * 60 * 60 * 1000, 5 * 60 * 60 * 1000];
        let offsetIndex = 0;
        Object.values(parsed.tournaments.upcoming).forEach((tourn: any) => {
          if (tourn && (!tourn.time || tourn.time < currentTime)) {
            tourn.time = currentTime + fallbackOffsets[offsetIndex % fallbackOffsets.length];
            offsetIndex++;
          }
        });
      }
      return parsed;
    }
  } catch (e) {
    console.error('Failed to parse localStorage DB state, using initial seeds', e);
  }

  return {
    admins: INITIAL_ADMINS,
    staff: INITIAL_STAFF,
    app_config: INITIAL_APP_CONFIG,
    esports_games: INITIAL_ESPORTS_GAMES,
    sliders: INITIAL_SLIDERS,
    notifications: INITIAL_NOTIFICATIONS,
    referralCodes: INITIAL_REFERRALS,
    users: INITIAL_USERS,
    tournaments: INITIAL_TOURNAMENTS,
    match_rooms: INITIAL_MATCH_ROOMS,
    match_participants: INITIAL_MATCH_PARTICIPANTS,
    match_results: INITIAL_MATCH_RESULTS,
    deposits: INITIAL_DEPOSITS,
    withdrawals: INITIAL_WITHDRAWALS,
    transactions: INITIAL_TRANSACTIONS
  };
}

class FirebaseSimulatorService {
  private state: DatabaseState;
  private listeners: Set<() => void> = new Set();
  public currentAuthUid: string = 'user_viper_01';

  constructor() {
    this.state = loadInitialState();
  }

  private persist() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(this.state));
    } catch (e) {
      console.warn('LocalStorage error:', e);
    }
    this.notify();
  }

  public subscribe(listener: () => void): () => void {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  }

  private notify() {
    this.listeners.forEach((listener) => {
      try {
        listener();
      } catch (err) {
        console.error('Listener notify error:', err);
      }
    });
  }

  public setAuthUser(uid: string) {
    this.currentAuthUid = uid;
    this.notify();
  }

  public getCurrentUser(): UserProfile | undefined {
    return this.state.users[this.currentAuthUid];
  }

  public getState(): DatabaseState {
    return this.state;
  }

  public resetAllData() {
    this.state = {
      admins: INITIAL_ADMINS,
      staff: INITIAL_STAFF,
      app_config: INITIAL_APP_CONFIG,
      esports_games: INITIAL_ESPORTS_GAMES,
      sliders: INITIAL_SLIDERS,
      notifications: INITIAL_NOTIFICATIONS,
      referralCodes: INITIAL_REFERRALS,
      users: INITIAL_USERS,
      tournaments: INITIAL_TOURNAMENTS,
      match_rooms: INITIAL_MATCH_ROOMS,
      match_participants: INITIAL_MATCH_PARTICIPANTS,
      match_results: INITIAL_MATCH_RESULTS,
      deposits: INITIAL_DEPOSITS,
      withdrawals: INITIAL_WITHDRAWALS,
      transactions: INITIAL_TRANSACTIONS
    };
    this.persist();
  }

  // ==========================================
  // REAL SECURITY RULES EVALUATOR METHODS
  // ==========================================

  public isAdmin(uid: string = this.currentAuthUid): boolean {
    return !!(uid && this.state.admins[uid] === true);
  }

  public isStaffWithMatches(uid: string = this.currentAuthUid): boolean {
    if (this.isAdmin(uid)) return true;
    const staff = this.state.staff[uid];
    return !!(staff && staff.active !== false && staff.permissions?.matches === true);
  }

  public canReadMatchRooms(matchId: string, uid: string = this.currentAuthUid): RuleValidationResult {
    if (!uid) {
      return { allowed: false, rulePath: 'match_rooms/$matchId', reason: 'Permission Denied: auth == null' };
    }
    if (this.isAdmin(uid)) {
      return { allowed: true, rulePath: 'match_rooms/$matchId', reason: 'Allowed: auth is Admin' };
    }
    const isParticipant = !!this.state.match_participants[matchId]?.[uid];
    if (isParticipant) {
      return { allowed: true, rulePath: 'match_rooms/$matchId', reason: 'Allowed: User is a registered participant in match_participants' };
    }
    return {
      allowed: false,
      rulePath: 'match_rooms/$matchId',
      reason: 'Permission Denied: User is neither an admin nor registered for this match room'
    };
  }

  public canWriteTournament(status: string, key: string, data: Partial<Tournament>, uid: string = this.currentAuthUid): RuleValidationResult {
    if (!uid) return { allowed: false, rulePath: `tournaments/${status}/${key}`, reason: 'auth != null required' };
    if (!['upcoming', 'ongoing', 'resulted'].includes(status)) {
      return { allowed: false, rulePath: `tournaments/${status}`, reason: "Validate failed: status must be upcoming, ongoing, or resulted" };
    }
    const hasPerm = this.isAdmin(uid) || (this.state.staff[uid]?.active !== false && this.state.staff[uid]?.permissions?.matches === true);
    if (!hasPerm) {
      return { allowed: false, rulePath: `tournaments/${status}/${key}`, reason: "Permission Denied: Requires admin or staff with 'matches' permission" };
    }

    if (data.title !== undefined && (typeof data.title !== 'string' || data.title.length <= 2)) {
      return { allowed: false, rulePath: `tournaments/${status}/${key}/title`, reason: "Validation Failed: title must be string and length > 2" };
    }
    if (data.entryFee !== undefined && (typeof data.entryFee !== 'number' || data.entryFee < 10 || data.entryFee > 10000)) {
      return { allowed: false, rulePath: `tournaments/${status}/${key}/entryFee`, reason: "Validation Failed: entryFee must be between 10 and 10,000" };
    }
    if (data.prizePool !== undefined && (typeof data.prizePool !== 'number' || data.prizePool < 50)) {
      return { allowed: false, rulePath: `tournaments/${status}/${key}/prizePool`, reason: "Validation Failed: prizePool must be >= 50" };
    }
    if (data.totalSpots !== undefined && (typeof data.totalSpots !== 'number' || data.totalSpots < 2 || data.totalSpots > 100)) {
      return { allowed: false, rulePath: `tournaments/${status}/${key}/totalSpots`, reason: "Validation Failed: totalSpots must be between 2 and 100" };
    }

    return { allowed: true, rulePath: `tournaments/${status}/${key}`, reason: 'Write Allowed & Schema Validated' };
  }

  public canReadUser(targetUid: string, uid: string = this.currentAuthUid): RuleValidationResult {
    // Security Rule: (auth != null && root.child('admins/'+auth.uid).val() === true) || (auth != null && auth.uid === $uid)
    if (!uid) {
      return { allowed: false, rulePath: `users/${targetUid}`, reason: 'Permission Denied: auth == null' };
    }
    const isAdmin = this.isAdmin(uid);
    const isOwner = uid === targetUid;
    if (isAdmin || isOwner) {
      return {
        allowed: true,
        rulePath: `users/${targetUid}`,
        reason: isAdmin
          ? "Allowed: root.child('admins/'+auth.uid).val() === true (Admin Access)"
          : "Allowed: auth.uid === $uid (Owner Profile Access)"
      };
    }
    return {
      allowed: false,
      rulePath: `users/${targetUid}`,
      reason: "Permission Denied: User is neither an admin nor the owner ($uid)"
    };
  }

  public canWriteUser(targetUid: string, _data?: any, uid: string = this.currentAuthUid): RuleValidationResult {
    // Security Rule: (auth != null && root.child('admins/'+auth.uid).val() === true) || (auth != null && auth.uid === $uid)
    if (!uid) {
      return { allowed: false, rulePath: `users/${targetUid}`, reason: 'Permission Denied: auth == null' };
    }
    const isAdmin = this.isAdmin(uid);
    const isOwner = uid === targetUid;
    if (isAdmin || isOwner) {
      return {
        allowed: true,
        rulePath: `users/${targetUid}`,
        reason: isAdmin
          ? "Allowed: root.child('admins/'+auth.uid).val() === true (Admin Write)"
          : "Allowed: auth.uid === $uid (Owner Write Access)"
      };
    }
    return {
      allowed: false,
      rulePath: `users/${targetUid}`,
      reason: "Permission Denied: User is neither an admin nor the owner ($uid)"
    };
  }

  // ==========================================
  // TOURNAMENT ACTIONS
  // ==========================================

  public joinTournament(matchKey: string, ign: string, gameUid: string): { success: boolean; message: string } {
    const uid = this.currentAuthUid;
    if (!uid) return { success: false, message: 'Please sign in to join matches' };

    const user = this.state.users[uid];
    if (!user) return { success: false, message: 'User record not found' };

    // Security Rule Check: root.child('users/'+auth.uid+'/banned').val() !== true
    if (user.banned) {
      return { success: false, message: 'Security Rule Violation: Banned accounts cannot participate in tournaments.' };
    }

    // Must exist in upcoming tournaments
    const tournament = this.state.tournaments.upcoming[matchKey];
    if (!tournament) {
      return { success: false, message: 'Tournament is not in upcoming state or does not exist.' };
    }

    if (tournament.joined >= tournament.totalSpots) {
      return { success: false, message: 'Tournament lobby is full.' };
    }

    // Check if already registered
    if (this.state.match_participants[matchKey]?.[uid]) {
      return { success: false, message: 'You have already joined this tournament.' };
    }

    // Check wallet balance
    if (user.walletBalance < tournament.entryFee) {
      return {
        success: false,
        message: `Insufficient wallet balance (₹${user.walletBalance}). Required: ₹${tournament.entryFee}. Please add cash to your wallet.`
      };
    }

    // Validation rule: ign, gameUid, count
    if (!ign.trim() || !gameUid.trim()) {
      return { success: false, message: 'In-Game Name (IGN) and Game UID are required.' };
    }

    // Deduct entryFee from user walletBalance
    user.walletBalance -= tournament.entryFee;
    user.totalMatches = (user.totalMatches || 0) + 1;
    user.defaultIgn = ign;
    user.defaultGameUid = gameUid;

    // Increment joined spots
    tournament.joined += 1;

    // Create participant entry
    if (!this.state.match_participants[matchKey]) {
      this.state.match_participants[matchKey] = {};
    }
    const slotNo = tournament.joined;
    this.state.match_participants[matchKey][uid] = {
      uid,
      ign,
      gameUid,
      count: 1,
      slotNo,
      registeredAt: Date.now()
    };

    // Add transaction
    this.state.transactions.unshift({
      id: `tx_${Date.now()}`,
      uid,
      type: 'entry_fee',
      amount: -tournament.entryFee,
      description: `Entry Fee for ${tournament.title} (Slot #${slotNo})`,
      timestamp: Date.now(),
      status: 'success'
    });

    // Notify user
    this.state.notifications.unshift({
      id: `notif_${Date.now()}`,
      title: 'Tournament Joined Successfully!',
      message: `You are booked in Slot #${slotNo} for ${tournament.title}. Room credentials will be unlocked in your lobby.`,
      date: 'Just now',
      type: 'match'
    });

    this.persist();
    return { success: true, message: `Successfully registered for ${tournament.title}! Assigned Slot #${slotNo}` };
  }

  public createTournament(data: Omit<Tournament, 'key' | 'joined' | 'status'>): { success: boolean; message: string; tournament?: Tournament } {
    const uid = this.currentAuthUid;
    const ruleCheck = this.canWriteTournament('upcoming', 'new_key', data, uid);
    if (!ruleCheck.allowed) {
      return { success: false, message: `${ruleCheck.rulePath}: ${ruleCheck.reason}` };
    }

    const key = `tourn_${data.game}_${Date.now()}`;
    const newTournament: Tournament = {
      ...data,
      key,
      status: 'upcoming',
      joined: 0
    };

    this.state.tournaments.upcoming[key] = newTournament;

    this.state.notifications.unshift({
      id: `notif_${Date.now()}`,
      title: `New Tournament: ${newTournament.title}`,
      message: `Registration open now! Entry: ₹${newTournament.entryFee} | Prize Pool: ₹${newTournament.prizePool}`,
      date: 'Just now',
      type: 'info'
    });

    this.persist();
    return { success: true, message: 'Tournament created successfully!', tournament: newTournament };
  }

  public updateMatchRoomCredentials(matchKey: string, roomId: string, password: string, instructions: string): { success: boolean; message: string } {
    const uid = this.currentAuthUid;
    if (!this.isAdmin(uid) && !this.isStaffWithMatches(uid)) {
      return { success: false, message: 'Permission Denied: Only Admins can set Room Credentials.' };
    }

    this.state.match_rooms[matchKey] = {
      matchId: matchKey,
      roomId: roomId.trim(),
      password: password.trim(),
      instructions: instructions || 'Join using BGMI/Free Fire custom room section. Strictly play from assigned slot.',
      releasedAt: Date.now()
    };

    // If tournament was upcoming, can move to ongoing
    if (this.state.tournaments.upcoming[matchKey]) {
      const tourn = this.state.tournaments.upcoming[matchKey];
      tourn.status = 'ongoing';
      delete this.state.tournaments.upcoming[matchKey];
      this.state.tournaments.ongoing[matchKey] = tourn;
    }

    this.state.notifications.unshift({
      id: `notif_${Date.now()}`,
      title: 'Match Room ID & Pass Released!',
      message: `Room ID and Password for tournament ${matchKey} are now live for participants.`,
      date: 'Just now',
      type: 'match'
    });

    this.persist();
    return { success: true, message: 'Room credentials updated and released to registered participants.' };
  }

  public submitMatchResultsAndPrizes(
    matchKey: string,
    winners: { rank: number; uid: string; ign: string; gameUid: string; kills: number; prize: number }[],
    note: string
  ): { success: boolean; message: string } {
    const uid = this.currentAuthUid;
    if (!this.isAdmin(uid)) {
      return { success: false, message: 'Permission Denied: Only Admin can finalize match results and payout prizes.' };
    }

    // Find tournament in ongoing or upcoming
    let tourn = this.state.tournaments.ongoing[matchKey] || this.state.tournaments.upcoming[matchKey];
    if (!tourn) {
      tourn = this.state.tournaments.resulted[matchKey];
    }
    if (!tourn) {
      return { success: false, message: 'Tournament not found' };
    }

    // Move to resulted
    delete this.state.tournaments.upcoming[matchKey];
    delete this.state.tournaments.ongoing[matchKey];
    tourn.status = 'resulted';
    this.state.tournaments.resulted[matchKey] = tourn;

    // Record result
    this.state.match_results[matchKey] = {
      matchId: matchKey,
      title: tourn.title,
      game: tourn.game,
      resultedAt: Date.now(),
      winners,
      note
    };

    // Credit prizes to winners' winBalance
    winners.forEach((w) => {
      const winnerUser = this.state.users[w.uid];
      if (winnerUser && w.prize > 0) {
        winnerUser.winBalance = (winnerUser.winBalance || 0) + w.prize;
        winnerUser.totalKills = (winnerUser.totalKills || 0) + w.kills;
        if (w.rank === 1) {
          winnerUser.totalWins = (winnerUser.totalWins || 0) + 1;
        }

        // Add transaction
        this.state.transactions.unshift({
          id: `tx_${Date.now()}_${w.uid}`,
          uid: w.uid,
          type: 'win_prize',
          amount: w.prize,
          description: `Tournament Prize Rank #${w.rank} (${w.kills} Kills) - ${tourn?.title}`,
          timestamp: Date.now(),
          status: 'success'
        });

        // Add notification
        this.state.notifications.unshift({
          id: `notif_${Date.now()}_${w.uid}`,
          title: `🏆 Victory Payout: ₹${w.prize} Credited!`,
          message: `Congratulations ${w.ign}! You achieved Rank #${w.rank} with ${w.kills} kills in ${tourn?.title}. Winnings credited to your Win Balance.`,
          date: 'Just now',
          type: 'reward'
        });
      }
    });

    this.persist();
    return { success: true, message: `Results published and ₹${winners.reduce((acc, c) => acc + c.prize, 0)} total prize distributed to winners!` };
  }

  // ==========================================
  // WALLET & DEPOSIT / WITHDRAWAL
  // ==========================================

  public submitDeposit(amount: number, utr: string, method: string = 'UPI QR'): { success: boolean; message: string } {
    const uid = this.currentAuthUid;
    if (!uid) return { success: false, message: 'Please sign in first' };

    if (!amount || amount < (this.state.app_config.minDeposit || 10)) {
      return { success: false, message: `Minimum deposit amount is ₹${this.state.app_config.minDeposit || 10}` };
    }

    if (!utr || utr.trim().length < 8) {
      return { success: false, message: 'Please provide a valid 12-digit UPI UTR / Transaction ID' };
    }

    const id = `dep_${Date.now()}`;
    const user = this.state.users[uid];

    if (!this.state.deposits[uid]) {
      this.state.deposits[uid] = {};
    }

    const newDep: DepositRequest = {
      id,
      uid,
      username: user?.username || 'Player',
      amount,
      utr: utr.trim(),
      status: 'pending',
      createdAt: Date.now(),
      method
    };

    this.state.deposits[uid][id] = newDep;

    this.state.transactions.unshift({
      id: `tx_${Date.now()}`,
      uid,
      type: 'deposit',
      amount,
      description: `UPI Deposit (${method}) - UTR: ${utr}`,
      timestamp: Date.now(),
      status: 'pending'
    });

    this.persist();
    return { success: true, message: 'Deposit request submitted for verification! Admin will verify and credit your wallet shortly.' };
  }

  public approveDeposit(uid: string, depId: string): { success: boolean; message: string } {
    if (!this.isAdmin()) {
      return { success: false, message: 'Only Admins can approve deposits.' };
    }
    const dep = this.state.deposits[uid]?.[depId];
    if (!dep) return { success: false, message: 'Deposit record not found' };
    if (dep.status === 'approved') return { success: false, message: 'Already approved' };

    dep.status = 'approved';
    const user = this.state.users[uid];
    if (user) {
      // Validate: newData.val() >= 0 && newData.val() <= 10000000
      const newBal = (user.walletBalance || 0) + dep.amount;
      if (newBal > 10000000) {
        return { success: false, message: 'Wallet balance limit exceeded (Max ₹10,000,000)' };
      }
      user.walletBalance = newBal;
    }

    // Update transaction status
    const tx = this.state.transactions.find((t) => t.uid === uid && t.description.includes(dep.utr));
    if (tx) {
      tx.status = 'success';
    }

    this.state.notifications.unshift({
      id: `notif_${Date.now()}`,
      title: 'Deposit Approved & Added!',
      message: `₹${dep.amount} deposit (UTR ${dep.utr}) has been approved and added to your wallet balance.`,
      date: 'Just now',
      type: 'reward'
    });

    this.persist();
    return { success: true, message: `Approved! ₹${dep.amount} added to ${user?.username || uid}'s wallet.` };
  }

  public rejectDeposit(uid: string, depId: string, reason: string = 'UTR invalid'): { success: boolean; message: string } {
    if (!this.isAdmin()) return { success: false, message: 'Only Admins can reject deposits.' };
    const dep = this.state.deposits[uid]?.[depId];
    if (!dep) return { success: false, message: 'Deposit record not found' };

    dep.status = 'rejected';
    dep.note = reason;

    const tx = this.state.transactions.find((t) => t.uid === uid && t.description.includes(dep.utr));
    if (tx) {
      tx.status = 'failed';
    }

    this.persist();
    return { success: true, message: 'Deposit marked as rejected.' };
  }

  public submitWithdrawal(amount: number, upi: string): { success: boolean; message: string } {
    const uid = this.currentAuthUid;
    if (!uid) return { success: false, message: 'Please sign in first' };

    const user = this.state.users[uid];
    if (!user) return { success: false, message: 'User not found' };

    const minWd = this.state.app_config.minWithdraw || 50;
    if (amount < minWd) {
      return { success: false, message: `Minimum withdrawal amount is ₹${minWd}` };
    }

    if (user.winBalance < amount) {
      return { success: false, message: `Insufficient Winning Balance (₹${user.winBalance}). Only prize winnings are withdrawable.` };
    }

    if (!upi || !upi.includes('@')) {
      return { success: false, message: 'Please enter a valid UPI ID (e.g., username@okhdfcbank or 9876543210@paytm)' };
    }

    // Deduct immediately from winBalance
    user.winBalance -= amount;

    const id = `wd_${Date.now()}`;
    if (!this.state.withdrawals[uid]) {
      this.state.withdrawals[uid] = {};
    }

    this.state.withdrawals[uid][id] = {
      id,
      uid,
      username: user.username,
      amount,
      upi: upi.trim(),
      status: 'pending',
      createdAt: Date.now()
    };

    this.state.transactions.unshift({
      id: `tx_${Date.now()}`,
      uid,
      type: 'withdrawal',
      amount: -amount,
      description: `Withdrawal to UPI ${upi}`,
      timestamp: Date.now(),
      status: 'pending'
    });

    this.persist();
    return { success: true, message: `Withdrawal request of ₹${amount} submitted! Funds will be transferred to ${upi} upon verification.` };
  }

  public approveWithdrawal(uid: string, wdId: string): { success: boolean; message: string } {
    if (!this.isAdmin()) return { success: false, message: 'Only Admins can approve withdrawals.' };
    const wd = this.state.withdrawals[uid]?.[wdId];
    if (!wd) return { success: false, message: 'Withdrawal not found' };

    wd.status = 'approved';
    wd.processedAt = Date.now();

    const tx = this.state.transactions.find((t) => t.uid === uid && t.description.includes(wd.upi));
    if (tx) {
      tx.status = 'success';
    }

    this.state.notifications.unshift({
      id: `notif_${Date.now()}`,
      title: 'Withdrawal Processed!',
      message: `₹${wd.amount} has been successfully transferred to your UPI ID ${wd.upi}.`,
      date: 'Just now',
      type: 'reward'
    });

    this.persist();
    return { success: true, message: `Withdrawal of ₹${wd.amount} approved and marked completed.` };
  }

  public rejectWithdrawal(uid: string, wdId: string, reason: string = 'Invalid UPI handle'): { success: boolean; message: string } {
    if (!this.isAdmin()) return { success: false, message: 'Only Admins can reject withdrawals.' };
    const wd = this.state.withdrawals[uid]?.[wdId];
    if (!wd) return { success: false, message: 'Withdrawal not found' };

    wd.status = 'rejected';
    wd.note = reason;

    // Refund winBalance
    const user = this.state.users[uid];
    if (user) {
      user.winBalance += wd.amount;
    }

    const tx = this.state.transactions.find((t) => t.uid === uid && t.description.includes(wd.upi));
    if (tx) {
      tx.status = 'failed';
    }

    this.state.transactions.unshift({
      id: `tx_${Date.now()}_refund`,
      uid,
      type: 'refund',
      amount: wd.amount,
      description: `Refunded withdrawal of ₹${wd.amount} (${reason})`,
      timestamp: Date.now(),
      status: 'success'
    });

    this.persist();
    return { success: true, message: `Withdrawal rejected. ₹${wd.amount} refunded back to player's Win Balance.` };
  }

  // ==========================================
  // REFERRAL CODE CREATION & CLAIM
  // ==========================================

  public createReferralCode(code: string): { success: boolean; message: string } {
    const uid = this.currentAuthUid;
    if (!uid) return { success: false, message: 'Please sign in first' };

    // Validation rule from JSON: $code.matches(/^[A-Z0-9]{4,10}$/) && newData.isString()
    const cleanCode = code.toUpperCase().trim();
    const regex = /^[A-Z0-9]{4,10}$/;
    if (!regex.test(cleanCode)) {
      return {
        success: false,
        message: 'Security Rule Validation Failed: Referral Code must be 4 to 10 uppercase letters or numbers (e.g. WIN99, VIPER01).'
      };
    }

    if (this.state.referralCodes[cleanCode] && this.state.referralCodes[cleanCode] !== uid) {
      return { success: false, message: 'This referral code is already taken. Please choose another one.' };
    }

    this.state.referralCodes[cleanCode] = uid;
    const user = this.state.users[uid];
    if (user) {
      user.referralCode = cleanCode;
    }

    this.persist();
    return { success: true, message: `Referral code "${cleanCode}" successfully registered to your account!` };
  }

  public claimReferral(code: string): { success: boolean; message: string } {
    const uid = this.currentAuthUid;
    if (!uid) return { success: false, message: 'Please sign in first' };

    const user = this.state.users[uid];
    if (!user) return { success: false, message: 'User not found' };

    if (user.referredBy) {
      return { success: false, message: `You have already used referral code ${user.referredBy}.` };
    }

    const cleanCode = code.toUpperCase().trim();
    const referrerUid = this.state.referralCodes[cleanCode];

    if (!referrerUid) {
      return { success: false, message: 'Invalid referral code.' };
    }

    if (referrerUid === uid) {
      return { success: false, message: 'You cannot refer yourself!' };
    }

    user.referredBy = cleanCode;
    user.walletBalance = (user.walletBalance || 0) + 25; // ₹25 joining bonus

    const referrer = this.state.users[referrerUid];
    if (referrer) {
      referrer.walletBalance = (referrer.walletBalance || 0) + 25; // ₹25 referrer bonus
    }

    this.state.transactions.unshift({
      id: `tx_${Date.now()}`,
      uid,
      type: 'referral_bonus',
      amount: 25,
      description: `Referral Welcome Bonus (Code: ${cleanCode})`,
      timestamp: Date.now(),
      status: 'success'
    });

    this.state.notifications.unshift({
      id: `notif_${Date.now()}`,
      title: '🎉 Referral Bonus Credited!',
      message: `You earned ₹25 wallet cash using referral code ${cleanCode}!`,
      date: 'Just now',
      type: 'reward'
    });

    this.persist();
    return { success: true, message: `Success! ₹25 referral bonus added to your wallet.` };
  }

  // ==========================================
  // USER & STAFF MANAGEMENT (ADMIN)
  // ==========================================

  public toggleBanUser(targetUid: string): { success: boolean; message: string } {
    if (!this.isAdmin()) return { success: false, message: 'Only Admins can ban/unban users.' };
    const user = this.state.users[targetUid];
    if (!user) return { success: false, message: 'User not found' };

    user.banned = !user.banned;
    this.persist();
    return { success: true, message: `User ${user.username} is now ${user.banned ? 'BANNED' : 'ACTIVE'}.` };
  }

  public updateWalletBalance(targetUid: string, walletBal: number, winBal: number): { success: boolean; message: string } {
    if (!this.isAdmin()) return { success: false, message: 'Only Admins can directly adjust balances.' };
    const user = this.state.users[targetUid];
    if (!user) return { success: false, message: 'User not found' };

    // Validation from json:
    // walletBalance: newData.isNumber() && newData.val() >= 0 && newData.val() <= 10000000
    // winBalance: newData.isNumber() && newData.val() >= 0
    if (typeof walletBal !== 'number' || walletBal < 0 || walletBal > 10000000) {
      return { success: false, message: 'Validation Failed: walletBalance must be 0 to 10,000,000' };
    }
    if (typeof winBal !== 'number' || winBal < 0) {
      return { success: false, message: 'Validation Failed: winBalance must be >= 0' };
    }

    user.walletBalance = walletBal;
    user.winBalance = winBal;
    this.persist();
    return { success: true, message: `Updated balances for ${user.username}: Wallet ₹${walletBal}, Win ₹${winBal}` };
  }

  public createStaffMember(name: string, email: string, canManageMatches: boolean): { success: boolean; message: string } {
    if (!this.isAdmin()) return { success: false, message: 'Only Admins can add staff members.' };
    const uid = `staff_${Date.now()}`;
    this.state.staff[uid] = {
      uid,
      name,
      email,
      active: true,
      permissions: {
        matches: canManageMatches
      },
      createdAt: Date.now()
    };
    this.persist();
    return { success: true, message: `Staff member ${name} created with match permissions: ${canManageMatches}` };
  }

  public updateAppConfig(config: Partial<AppConfig>): { success: boolean; message: string } {
    if (!this.isAdmin()) return { success: false, message: 'Only Admins can update app_config.' };
    this.state.app_config = {
      ...this.state.app_config,
      ...config
    };
    this.persist();
    return { success: true, message: 'Platform settings saved.' };
  }

  public claimInitialAdmin(): { success: boolean; message: string } {
    // Rule: "auth != null && auth.uid === $uid && newData.val() === true && !root.child('app_config/adminCreated').exists()"
    if (this.state.app_config.adminCreated) {
      return { success: false, message: 'Admin already initialized on this platform.' };
    }
    const uid = this.currentAuthUid;
    this.state.admins[uid] = true;
    this.state.app_config.adminCreated = true;
    this.persist();
    return { success: true, message: 'You have claimed primary Super Admin privileges!' };
  }
}

export const db = new FirebaseSimulatorService();
