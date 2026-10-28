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
  Transaction
} from '../types';

export const INITIAL_ADMINS: AdminMap = {
  'admin_super_01': true
};

export const INITIAL_STAFF: Record<string, StaffMember> = {
  'staff_member_01': {
    uid: 'staff_member_01',
    name: 'Rohan Sharma (Tournament Ops)',
    email: 'ops.rohan@arenax.gg',
    active: true,
    permissions: {
      matches: true
    },
    createdAt: Date.now() - 86400000 * 10
  }
};

export const INITIAL_APP_CONFIG: AppConfig = {
  appName: 'ArenaX Esports',
  supportUpi: 'paytmqr2810050501011@paytm',
  supportPhone: '+91 98765 43210',
  supportTelegram: 'https://t.me/arenaxesports_official',
  minDeposit: 10,
  minWithdraw: 50,
  adminCreated: true,
  maintenanceMode: false,
  bannerAnnouncement: '🔥 Welcome to ArenaX! Daily BGMI & Free Fire Mega Scrims. Room ID releases 15 mins before match!',
  rulesNotice: 'Strict anti-cheat policy in place. Emulators, iPads, and third-party tools are permanently prohibited.'
};

export const INITIAL_ESPORTS_GAMES: EsportsGame[] = [
  {
    id: 'bgmi',
    name: 'Battlegrounds Mobile India',
    shortName: 'BGMI',
    genre: 'Battle Royale',
    banner: 'https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&w=1200&q=80',
    icon: '🎯',
    active: true
  },
  {
    id: 'freefire',
    name: 'Free Fire MAX',
    shortName: 'Free Fire',
    genre: 'Survival Shooter',
    banner: 'https://images.unsplash.com/photo-1538481199705-c710c4e965fc?auto=format&fit=crop&w=1200&q=80',
    icon: '🔥',
    active: true
  },
  {
    id: 'codm',
    name: 'Call of Duty: Mobile',
    shortName: 'COD Mobile',
    genre: 'Tactical FPS',
    banner: 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?auto=format&fit=crop&w=1200&q=80',
    icon: '⚡',
    active: true
  }
];

export const INITIAL_SLIDERS: SliderBanner[] = [
  {
    id: 'slider_1',
    title: 'BGMI Weekend Championship',
    subtitle: '₹10,000 Guaranteed Prize Pool • Erangel Squad',
    image: 'https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&w=1200&q=80',
    tag: 'MEGA TOURNAMENT',
    btnText: 'View Bracket',
    active: true
  },
  {
    id: 'slider_2',
    title: 'Free Fire Clash Squad Clash',
    subtitle: 'High Kill Bounties • ₹20 per confirmed kill',
    image: 'https://images.unsplash.com/photo-1511512578047-dfb367046420?auto=format&fit=crop&w=1200&q=80',
    tag: 'FAST ENTRY',
    btnText: 'Join Now',
    active: true
  },
  {
    id: 'slider_3',
    title: 'Invite Friends, Earn ₹25 Cash',
    subtitle: 'Share your referral code and get instant wallet credits',
    image: 'https://images.unsplash.com/photo-1563089145-599997674d42?auto=format&fit=crop&w=1200&q=80',
    tag: 'REFER & EARN',
    btnText: 'Get Code',
    active: true
  }
];

export const INITIAL_NOTIFICATIONS: NotificationItem[] = [
  {
    id: 'notif_1',
    title: 'Room ID & Password Released!',
    message: 'Custom Room for [BGMI Solo Night Rush] is now open in the lobby. Join slot promptly.',
    date: '10 mins ago',
    type: 'match'
  },
  {
    id: 'notif_2',
    title: 'Deposit Approved',
    message: '₹200 deposit via UPI UTR 420911843210 has been credited to your wallet balance.',
    date: '1 hour ago',
    type: 'reward'
  },
  {
    id: 'notif_3',
    title: 'Fair Play Reminder',
    message: 'Recording pov / screenshot of match results is mandatory for disputed claims.',
    date: 'Yesterday',
    type: 'info'
  }
];

export const INITIAL_REFERRALS: Record<string, string> = {
  'VIPER99': 'user_viper_01',
  'GHOST07': 'user_ghost_02',
  'TITAN44': 'user_titan_03'
};

export const INITIAL_USERS: Record<string, UserProfile> = {
  'admin_super_01': {
    uid: 'admin_super_01',
    username: 'ArenaMaster (Admin)',
    email: 'admin@arenax.gg',
    phone: '+91 99999 11111',
    avatar: 'https://api.dicebear.com/7.x/bottts/svg?seed=AdminBoss',
    walletBalance: 1500,
    winBalance: 2450,
    banned: false,
    createdAt: Date.now() - 86400000 * 30,
    referralCode: 'ADMIN88',
    totalMatches: 45,
    totalWins: 22,
    totalKills: 140
  },
  'staff_member_01': {
    uid: 'staff_member_01',
    username: 'Rohan (Staff Ops)',
    email: 'ops.rohan@arenax.gg',
    phone: '+91 98888 22222',
    avatar: 'https://api.dicebear.com/7.x/bottts/svg?seed=StaffRohan',
    walletBalance: 400,
    winBalance: 600,
    banned: false,
    createdAt: Date.now() - 86400000 * 20,
    referralCode: 'ROHAN55',
    totalMatches: 12,
    totalWins: 4,
    totalKills: 35
  },
  'user_viper_01': {
    uid: 'user_viper_01',
    username: 'ViperX',
    email: 'viper.esports@gmail.com',
    phone: '+91 91234 56789',
    avatar: 'https://api.dicebear.com/7.x/bottts/svg?seed=ViperX',
    walletBalance: 320,
    winBalance: 850,
    banned: false,
    createdAt: Date.now() - 86400000 * 15,
    referralCode: 'VIPER99',
    defaultIgn: 'VIPER・Godz',
    defaultGameUid: '5192847102',
    totalMatches: 28,
    totalWins: 9,
    totalKills: 84
  },
  'user_ghost_02': {
    uid: 'user_ghost_02',
    username: 'GhostRider',
    email: 'ghostrider@gmail.com',
    phone: '+91 98711 22334',
    avatar: 'https://api.dicebear.com/7.x/bottts/svg?seed=GhostRider',
    walletBalance: 50,
    winBalance: 0,
    banned: false,
    createdAt: Date.now() - 86400000 * 5,
    referralCode: 'GHOST07',
    referredBy: 'VIPER99',
    defaultIgn: 'Ghost_OP7',
    defaultGameUid: '6298104419',
    totalMatches: 6,
    totalWins: 1,
    totalKills: 14
  },
  'user_banned_01': {
    uid: 'user_banned_01',
    username: 'CheaterPro99',
    email: 'cheat@banned.gg',
    phone: '+91 90000 00000',
    avatar: 'https://api.dicebear.com/7.x/bottts/svg?seed=Cheater',
    walletBalance: 0,
    winBalance: 0,
    banned: true,
    createdAt: Date.now() - 86400000 * 25,
    referralCode: 'BANNED01',
    totalMatches: 3,
    totalWins: 0,
    totalKills: 2
  },
  'user_mortal_07': {
    uid: 'user_mortal_07',
    username: 'Mortal_OP',
    email: 'mortal@arenax.gg',
    phone: '+91 97777 33333',
    avatar: 'https://api.dicebear.com/7.x/bottts/svg?seed=MortalOP',
    walletBalance: 450,
    winBalance: 3200,
    banned: false,
    createdAt: Date.now() - 86400000 * 40,
    referralCode: 'MORTAL07',
    defaultIgn: 'SOUL・Mortal',
    defaultGameUid: '5120349811',
    totalMatches: 42,
    totalWins: 18,
    totalKills: 132
  },
  'user_jonathan_01': {
    uid: 'user_jonathan_01',
    username: 'Jonathan_God',
    email: 'jonathan@arenax.gg',
    phone: '+91 96666 44444',
    avatar: 'https://api.dicebear.com/7.x/bottts/svg?seed=JonathanGod',
    walletBalance: 200,
    winBalance: 2900,
    banned: false,
    createdAt: Date.now() - 86400000 * 35,
    referralCode: 'JONATHAN1',
    defaultIgn: 'GE・Jonathan',
    defaultGameUid: '5249103844',
    totalMatches: 38,
    totalWins: 15,
    totalKills: 145
  },
  'user_scout_09': {
    uid: 'user_scout_09',
    username: 'TX_ScoutOP',
    email: 'scout@arenax.gg',
    phone: '+91 95555 55555',
    avatar: 'https://api.dicebear.com/7.x/bottts/svg?seed=ScoutOP',
    walletBalance: 150,
    winBalance: 1750,
    banned: false,
    createdAt: Date.now() - 86400000 * 28,
    referralCode: 'SCOUT09',
    defaultIgn: 'TX・Scout77',
    defaultGameUid: '5391028477',
    totalMatches: 31,
    totalWins: 12,
    totalKills: 108
  }
};

const now = Date.now();
const in30Mins = now + 30 * 60 * 1000;
const in2Hours = now + 2 * 60 * 60 * 1000;
const in5Hours = now + 5 * 60 * 60 * 1000;
const past1Hour = now - 60 * 60 * 1000;
const past5Hours = now - 5 * 60 * 60 * 1000;

export const INITIAL_TOURNAMENTS: {
  upcoming: Record<string, Tournament>;
  ongoing: Record<string, Tournament>;
  resulted: Record<string, Tournament>;
} = {
  upcoming: {
    'tourn_bgmi_01': {
      key: 'tourn_bgmi_01',
      title: 'BGMI Erangel Solo King #140',
      game: 'bgmi',
      status: 'upcoming',
      entryFee: 30,
      prizePool: 2400,
      totalSpots: 100,
      joined: 68,
      time: in30Mins,
      matchType: 'SOLO',
      map: 'Erangel',
      version: 'TPP',
      perKill: 15,
      prizeDistribution: [
        { rank: '1st (Winner)', prize: 900 },
        { rank: '2nd Place', prize: 500 },
        { rank: '3rd Place', prize: 300 },
        { rank: '4th - 10th Place', prize: 100 }
      ],
      rules: [
        'Room ID & Password provided 15 minutes before match start.',
        'Emulators, Tablets, and Trigger attachments strictly prohibited.',
        'Level 35+ account required. Ping lock 120ms max.',
        'Keep match summary screenshot for kill verification.'
      ],
      bannerUrl: 'https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&w=800&q=80'
    },
    'tourn_ff_01': {
      key: 'tourn_ff_01',
      title: 'Free Fire Bermuda Rush Duo',
      game: 'freefire',
      status: 'upcoming',
      entryFee: 25,
      prizePool: 1200,
      totalSpots: 48,
      joined: 32,
      time: in2Hours,
      matchType: 'DUO',
      map: 'Bermuda',
      version: 'TPP',
      perKill: 12,
      prizeDistribution: [
        { rank: '1st (Booyah)', prize: 600 },
        { rank: '2nd Place', prize: 350 },
        { rank: '3rd Place', prize: 250 }
      ],
      rules: [
        'Character skills active. Gun property disabled.',
        'Teaming up with enemy teams results in instant forfeiture.',
        'Both teammates must enter accurate Game UIDs.'
      ],
      bannerUrl: 'https://images.unsplash.com/photo-1538481199705-c710c4e965fc?auto=format&fit=crop&w=800&q=80'
    },
    'tourn_codm_01': {
      key: 'tourn_codm_01',
      title: 'CODM Isolated Battle Royale Squad',
      game: 'codm',
      status: 'upcoming',
      entryFee: 50,
      prizePool: 3500,
      totalSpots: 80,
      joined: 45,
      time: in5Hours,
      matchType: 'SQUAD',
      map: 'Isolated',
      version: 'FPP',
      perKill: 20,
      prizeDistribution: [
        { rank: '1st (Squad Victory)', prize: 1800 },
        { rank: '2nd Place', prize: 1000 },
        { rank: '3rd Place', prize: 700 }
      ],
      rules: [
        'Mobile devices only (no gameloop emulator).',
        'Custom loadouts permitted. Flare guns active.'
      ],
      bannerUrl: 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?auto=format&fit=crop&w=800&q=80'
    }
  },
  ongoing: {
    'tourn_bgmi_live': {
      key: 'tourn_bgmi_live',
      title: 'BGMI Miramar Pro Scrims #88',
      game: 'bgmi',
      status: 'ongoing',
      entryFee: 40,
      prizePool: 3200,
      totalSpots: 100,
      joined: 100,
      time: past1Hour,
      matchType: 'SOLO',
      map: 'Miramar',
      version: 'TPP',
      perKill: 20,
      prizeDistribution: [
        { rank: '1st', prize: 1500 },
        { rank: '2nd', prize: 900 },
        { rank: '3rd', prize: 500 },
        { rank: '4th - 5th', prize: 150 }
      ],
      rules: [
        'Match is currently LIVE in custom room.',
        'Results will be processed within 20 mins after completion.'
      ],
      bannerUrl: 'https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&w=800&q=80'
    }
  },
  resulted: {
    'tourn_bgmi_done': {
      key: 'tourn_bgmi_done',
      title: 'BGMI Sanhok Blitz Rush #139',
      game: 'bgmi',
      status: 'resulted',
      entryFee: 20,
      prizePool: 1600,
      totalSpots: 100,
      joined: 92,
      time: past5Hours,
      matchType: 'SOLO',
      map: 'Sanhok',
      version: 'TPP',
      perKill: 10,
      prizeDistribution: [
        { rank: '1st Place', prize: 700 },
        { rank: '2nd Place', prize: 450 },
        { rank: '3rd Place', prize: 250 },
        { rank: '4th Place', prize: 200 }
      ],
      rules: ['Match successfully concluded and prizes disbursed.'],
      bannerUrl: 'https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&w=800&q=80'
    },
    'tourn_ff_done': {
      key: 'tourn_ff_done',
      title: 'Free Fire Bermuda Clash Squad #88',
      game: 'freefire',
      status: 'resulted',
      entryFee: 25,
      prizePool: 1200,
      totalSpots: 48,
      joined: 48,
      time: now - 86400000 * 2,
      matchType: 'DUO',
      map: 'Bermuda',
      version: 'TPP',
      perKill: 12,
      prizeDistribution: [
        { rank: '1st Place', prize: 600 },
        { rank: '2nd Place', prize: 350 },
        { rank: '3rd Place', prize: 250 }
      ],
      rules: ['Character skills active. Verified results published.'],
      bannerUrl: 'https://images.unsplash.com/photo-1538481199705-c710c4e965fc?auto=format&fit=crop&w=800&q=80'
    },
    'tourn_codm_done': {
      key: 'tourn_codm_done',
      title: 'CODM Isolated Warzone Scrims #44',
      game: 'codm',
      status: 'resulted',
      entryFee: 30,
      prizePool: 2000,
      totalSpots: 80,
      joined: 74,
      time: now - 86400000 * 4,
      matchType: 'SQUAD',
      map: 'Isolated',
      version: 'FPP',
      perKill: 15,
      prizeDistribution: [
        { rank: '1st Place', prize: 1000 },
        { rank: '2nd Place', prize: 600 },
        { rank: '3rd Place', prize: 400 }
      ],
      rules: ['Official screenshot verified by referee.'],
      bannerUrl: 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?auto=format&fit=crop&w=800&q=80'
    }
  }
};

export const INITIAL_MATCH_ROOMS: Record<string, MatchRoom> = {
  'tourn_bgmi_01': {
    matchId: 'tourn_bgmi_01',
    roomId: '8492011',
    password: '778',
    instructions: 'Open BGMI > Select Custom Room > Search ID > Enter Pass. Room closes strictly at match start time!',
    releasedAt: now - 300000
  },
  'tourn_bgmi_live': {
    matchId: 'tourn_bgmi_live',
    roomId: '9120448',
    password: '442',
    instructions: 'Live match ongoing. Spectating streaming on official channel.',
    releasedAt: past1Hour - 600000
  }
};

export const INITIAL_MATCH_PARTICIPANTS: Record<string, Record<string, MatchParticipant>> = {
  'tourn_bgmi_01': {
    'user_viper_01': {
      uid: 'user_viper_01',
      ign: 'VIPER・Godz',
      gameUid: '5192847102',
      count: 1,
      slotNo: 14,
      registeredAt: now - 3600000
    },
    'user_ghost_02': {
      uid: 'user_ghost_02',
      ign: 'Ghost_OP7',
      gameUid: '6298104419',
      count: 1,
      slotNo: 15,
      registeredAt: now - 1800000
    }
  },
  'tourn_bgmi_live': {
    'user_viper_01': {
      uid: 'user_viper_01',
      ign: 'VIPER・Godz',
      gameUid: '5192847102',
      count: 1,
      slotNo: 4,
      registeredAt: past1Hour - 7200000
    }
  },
  'tourn_bgmi_done': {
    'user_viper_01': {
      uid: 'user_viper_01',
      ign: 'VIPER・Godz',
      gameUid: '5192847102',
      count: 1,
      slotNo: 21,
      registeredAt: past5Hours - 7200000
    }
  },
  'tourn_ff_done': {
    'user_viper_01': {
      uid: 'user_viper_01',
      ign: 'VIPER・Godz',
      gameUid: '5192847102',
      count: 1,
      slotNo: 12,
      registeredAt: now - 86400000 * 2 - 3600000
    }
  },
  'tourn_codm_done': {
    'user_viper_01': {
      uid: 'user_viper_01',
      ign: 'VIPER・Godz',
      gameUid: '5192847102',
      count: 1,
      slotNo: 8,
      registeredAt: now - 86400000 * 4 - 3600000
    }
  }
};

export const INITIAL_MATCH_RESULTS: Record<string, MatchResult> = {
  'tourn_bgmi_done': {
    matchId: 'tourn_bgmi_done',
    title: 'BGMI Sanhok Blitz Rush #139',
    game: 'bgmi',
    resultedAt: past5Hours + 3600000,
    winners: [
      {
        rank: 1,
        uid: 'user_viper_01',
        ign: 'VIPER・Godz',
        gameUid: '5192847102',
        kills: 8,
        prize: 780 // 700 1st place + 8 * 10 per kill
      },
      {
        rank: 2,
        uid: 'user_ninja_99',
        ign: 'Soul_Ninja',
        gameUid: '5819023412',
        kills: 5,
        prize: 500
      },
      {
        rank: 3,
        uid: 'user_slayer_11',
        ign: 'TX_Slayer',
        gameUid: '5910248812',
        kills: 4,
        prize: 290
      }
    ],
    note: 'Official referee confirmed screenshot. Winner: VIPER・Godz (8 Kills + WWCD).'
  },
  'tourn_ff_done': {
    matchId: 'tourn_ff_done',
    title: 'Free Fire Bermuda Clash Squad #88',
    game: 'freefire',
    resultedAt: now - 86400000 * 2 + 1800000,
    winners: [
      {
        rank: 1,
        uid: 'user_mortal_07',
        ign: 'SOUL・Mortal',
        gameUid: '5120349811',
        kills: 9,
        prize: 708
      },
      {
        rank: 2,
        uid: 'user_viper_01',
        ign: 'VIPER・Godz',
        gameUid: '5192847102',
        kills: 5,
        prize: 410 // 350 + 5 * 12
      },
      {
        rank: 3,
        uid: 'user_ghost_02',
        ign: 'Ghost_OP7',
        gameUid: '6298104419',
        kills: 3,
        prize: 286
      }
    ],
    note: 'Booyah claimed by SOUL・Mortal. 2nd Place: VIPER・Godz.'
  },
  'tourn_codm_done': {
    matchId: 'tourn_codm_done',
    title: 'CODM Isolated Warzone Scrims #44',
    game: 'codm',
    resultedAt: now - 86400000 * 4 + 3600000,
    winners: [
      {
        rank: 1,
        uid: 'user_jonathan_01',
        ign: 'GE・Jonathan',
        gameUid: '5249103844',
        kills: 11,
        prize: 1165
      },
      {
        rank: 2,
        uid: 'user_scout_09',
        ign: 'TX・Scout77',
        gameUid: '5391028477',
        kills: 7,
        prize: 705
      },
      {
        rank: 3,
        uid: 'user_viper_01',
        ign: 'VIPER・Godz',
        gameUid: '5192847102',
        kills: 4,
        prize: 460 // 400 + 4 * 15
      }
    ],
    note: 'Victory confirmed by room arbiter. Excellent tactical squad play.'
  }
};

export const INITIAL_DEPOSITS: Record<string, Record<string, DepositRequest>> = {
  'user_viper_01': {
    'dep_101': {
      id: 'dep_101',
      uid: 'user_viper_01',
      username: 'ViperX',
      amount: 200,
      utr: '420911843210',
      status: 'approved',
      createdAt: now - 3600000,
      method: 'PhonePe UPI',
      note: 'Auto-verified with reference'
    }
  },
  'user_ghost_02': {
    'dep_102': {
      id: 'dep_102',
      uid: 'user_ghost_02',
      username: 'GhostRider',
      amount: 100,
      utr: '420999331824',
      status: 'pending',
      createdAt: now - 900000,
      method: 'Google Pay',
      note: 'Awaiting admin verification'
    }
  }
};

export const INITIAL_WITHDRAWALS: Record<string, Record<string, WithdrawalRequest>> = {
  'user_viper_01': {
    'wd_201': {
      id: 'wd_201',
      uid: 'user_viper_01',
      username: 'ViperX',
      amount: 300,
      upi: 'viper.esports@okhdfcbank',
      status: 'approved',
      createdAt: now - 86400000 * 2,
      note: 'Processed via IMPS / UPI transfer',
      processedAt: now - 86400000 * 2 + 1800000
    },
    'wd_202': {
      id: 'wd_202',
      uid: 'user_viper_01',
      username: 'ViperX',
      amount: 250,
      upi: 'viper.esports@okhdfcbank',
      status: 'pending',
      createdAt: now - 1800000,
      note: 'Pending Admin payout review'
    }
  }
};

export const INITIAL_TRANSACTIONS: Transaction[] = [
  {
    id: 'tx_1',
    uid: 'user_viper_01',
    type: 'deposit',
    amount: 200,
    description: 'UPI Deposit - UTR 420911843210',
    timestamp: now - 3600000,
    status: 'success'
  },
  {
    id: 'tx_2',
    uid: 'user_viper_01',
    type: 'entry_fee',
    amount: -30,
    description: 'Entry Fee: BGMI Erangel Solo King #140',
    timestamp: now - 3600000,
    status: 'success'
  },
  {
    id: 'tx_3',
    uid: 'user_viper_01',
    type: 'win_prize',
    amount: 780,
    description: 'Winner Prize (1st + 8 Kills): BGMI Sanhok Blitz #139',
    timestamp: past5Hours + 3600000,
    status: 'success'
  },
  {
    id: 'tx_4',
    uid: 'user_viper_01',
    type: 'withdrawal',
    amount: -250,
    description: 'Withdrawal to UPI viper.esports@okhdfcbank',
    timestamp: now - 1800000,
    status: 'pending'
  }
];
