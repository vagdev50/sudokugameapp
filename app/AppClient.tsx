"use client";

import React, { useState, useEffect, useMemo } from 'react';
import {
  Timer, Heart, Trophy, ChevronRight, LayoutGrid, Pause, Play,
  RefreshCw, Hourglass, AlertCircle, Users, Star, Wallet, Plus, RotateCcw,
  Volume2, VolumeX, Music, Music2, Settings, X, MessageCircle, CheckCircle, Gift
} from 'lucide-react';
import SudokuGrid from '../components/SudokuGrid';
import Controls from '../components/Controls';
import LevelSelector from '../components/LevelSelector';
import Leaderboard from '../components/Leaderboard';
import LandingPage from '../components/LandingPage';
import AuthPage from '../components/AuthPage';
import PolicyPages from '../components/PolicyPages';
import ChatGroup from '../components/ChatGroup';
import ReviewsPage from '../components/ReviewsPage';
import ProfilePage from '../components/ProfilePage';
import PurchaseModal from '../components/PurchaseModal';
import PaymentPage from '../components/PaymentPage';
import AdminDashboard from '../components/AdminDashboard';
import ReferralPage from '../components/ReferralPage';
import PWAInstallPrompt from '../components/PWAInstallPrompt';
import KidsMode from '../components/KidsMode';
import { SudokuState, UserProfile, LeaderboardEntry, View, ChatMessage, Purchase, CreditPack, GlobalSettings } from '../types';
import { LEVELS, TOTAL_LEVELS, CREDIT_PACKS } from '../constants';
import { generatePuzzle } from '../services/sudokuLogic';
import { audioService } from '../services/audioService';
import { generateReferralCode } from '../utils/referralUtils';

const USER_KEY = 'sudoku-user-profile';
const CHAT_KEY = 'sudoku-chat-history';
const SETTINGS_KEY = 'sudoku-global-settings';

const DEFAULT_SETTINGS: GlobalSettings = {
  appName: 'sudokuhub.live',
  primaryColor: '#4f46e5',
  pointsPerLevel: 100,
  timeBonusMultiplier: 2.0,
  mistakePenalty: 50
};

const App: React.FC = () => {
  const [view, setView] = useState<View>('landing');
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [state, setState] = useState<SudokuState | null>(null);
  const [showLevelSelector, setShowLevelSelector] = useState(false);
  const [showLeaderboard, setShowLeaderboard] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [showChat, setShowChat] = useState(false);
  const [showPurchaseModal, setShowPurchaseModal] = useState(false);
  const [completedLevels, setCompletedLevels] = useState<number[]>([]);
  const [notesMode, setNotesMode] = useState(false);
  const [isLevelChanging, setIsLevelChanging] = useState(false);
  const [lastGainedPoints, setLastGainedPoints] = useState<number>(0);
  const [pendingPurchase, setPendingPurchase] = useState<string | null>(null);
  const [selectedPack, setSelectedPack] = useState<CreditPack | null>(null);

  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [lastSeenTimestamp, setLastSeenTimestamp] = useState<number>(0);
  const [settings, setSettings] = useState<GlobalSettings>(DEFAULT_SETTINGS);

  useEffect(() => {
    const savedSettings = localStorage.getItem(SETTINGS_KEY);
    if (savedSettings) setSettings(JSON.parse(savedSettings));

    // Force update CSS variable for primary color
    document.documentElement.style.setProperty('--primary-color', settings.primaryColor);
  }, [settings.primaryColor]);

  useEffect(() => {
    const savedUser = localStorage.getItem(USER_KEY);
    if (savedUser) setUserProfile(JSON.parse(savedUser));

    const savedLevels = localStorage.getItem('sudoku-progress');
    if (savedLevels) setCompletedLevels(JSON.parse(savedLevels));

    const savedChat = localStorage.getItem(CHAT_KEY);
    if (savedChat) setMessages(JSON.parse(savedChat));
  }, []);

  useEffect(() => {
    if (userProfile) {
      localStorage.setItem(USER_KEY, JSON.stringify(userProfile));
      if (userProfile.musicEnabled && (view === 'game' || view === 'landing')) {
        audioService.startBackgroundMusic(userProfile.selectedTrackIndex || 0);
      } else {
        audioService.stopBackgroundMusic();
      }
    }
  }, [userProfile?.musicEnabled, view, userProfile]);

  useEffect(() => {
    localStorage.setItem('sudoku-progress', JSON.stringify(completedLevels));
  }, [completedLevels]);

  useEffect(() => {
    localStorage.setItem(CHAT_KEY, JSON.stringify(messages));
  }, [messages]);

  useEffect(() => {
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
  }, [settings]);

  useEffect(() => {
    if (showChat) setLastSeenTimestamp(Date.now());
  }, [showChat, messages.length]);

  const unreadCount = useMemo(() => {
    if (showChat) return 0;
    return messages.filter(m => m.timestamp > lastSeenTimestamp).length;
  }, [messages, lastSeenTimestamp, showChat]);

  useEffect(() => {
    const bots = ["ZetaZen", "OmicronOwl", "KappaKing", "AlphaSolver", "MuMaster"];
    const greetings = [
      "Level 142 is really tricky!", "Finally reached LV. 150!", "Anyone stuck on the Expert levels?",
      "Just got 500 bonus points!", "Sudoku Pro is the best way to start the day.",
      "Hint: use your credits wisely on Hard levels.", "Just broke my personal record!"
    ];
    const interval = setInterval(() => {
      if (Math.random() > 0.8) {
        const newMessage: ChatMessage = {
          id: Math.random().toString(36).substr(2, 9),
          sender: bots[Math.floor(Math.random() * bots.length)],
          text: greetings[Math.floor(Math.random() * greetings.length)],
          timestamp: Date.now(),
        };
        setMessages(prev => [...prev.slice(-49), newMessage]);
      }
    }, 25000);
    return () => clearInterval(interval);
  }, []);

  const leaderboardData = useMemo(() => {
    const MOCK_NAMES = ["AlphaSolver", "BetaBrain", "GammaGrid", "DeltaDeduction", "EpsilonExpert", "MuMaster", "ZetaZen"];
    const entries: LeaderboardEntry[] = [];
    for (let i = 0; i < 99; i++) {
      entries.push({
        name: MOCK_NAMES[i % MOCK_NAMES.length] + " " + (Math.floor(i / MOCK_NAMES.length) + 1),
        score: 1250000 - (i * 12000),
        levels: TOTAL_LEVELS - Math.floor(i / 1.5)
      });
    }
    if (userProfile) {
      entries.push({ name: userProfile.name, score: userProfile.totalScore, levels: completedLevels.length, isCurrentUser: true });
    }
    return entries.sort((a, b) => b.score - a.score).slice(0, 100);
  }, [userProfile, completedLevels]);

  const toggleSound = () => {
    if (!userProfile) return;
    const updated = { ...userProfile, soundEnabled: !userProfile.soundEnabled };
    setUserProfile(updated);
    if (updated.soundEnabled) audioService.playClick();
  };

  const toggleMusic = () => {
    if (!userProfile) return;
    const updated = { ...userProfile, musicEnabled: !userProfile.musicEnabled };
    setUserProfile(updated);
  };

  const handleLogin = (userData: { name: string, email: string }) => {
    const referralCode = generateReferralCode(userData.email);
    const newUser: UserProfile = {
      ...userData,
      totalScore: 0,
      completedLevelCount: 0,
      credits: 50,
      soundEnabled: true,
      musicEnabled: true,
      selectedTrackIndex: 0,
      purchaseHistory: [],
      referralCode,
      referralData: {
        code: referralCode,
        userId: userData.email,
        createdAt: Date.now(),
        totalReferred: 0,
        totalEarned: 0,
        referredUsers: []
      },
      referralMilestones: []
    };
    setUserProfile(newUser);
    setView('game');
    initLevel(1);

    if (pendingPurchase) {
      const pack = LEVELS.find(p => (p as any).id === pendingPurchase) || (CREDIT_PACKS.find(p => p.id === pendingPurchase) as any);
      if (pack && pack.qty) {
        setSelectedPack(pack);
        setView('payment');
      } else {
        setShowPurchaseModal(true);
      }
      setPendingPurchase(null);
    }
  };

  const handlePurchase = (pack: CreditPack) => {
    if (!userProfile) return;
    const newPurchase: Purchase = {
      id: Math.random().toString(36).substr(2, 9),
      date: Date.now(),
      credits: pack.qty,
      amount: pack.price,
      currency: pack.amount.charAt(0),
      status: 'completed'
    };
    const updatedProfile = {
      ...userProfile,
      credits: userProfile.credits + pack.qty,
      purchaseHistory: [newPurchase, ...(userProfile.purchaseHistory || [])]
    };
    setUserProfile(updatedProfile);
    setView('game');
    setSelectedPack(null);
  };

  const initLevel = (levelId: number) => {
    const levelData = LEVELS.find(l => l.id === levelId) || LEVELS[0];
    const { initial, solution } = generatePuzzle(levelData.id, levelData.clues);
    let timeLimit = 20 * 60;
    if (levelData.difficulty === 'Medium') timeLimit = 15 * 60;
    else if (levelData.difficulty === 'Hard') timeLimit = 12 * 60;
    else if (levelData.difficulty === 'Expert') timeLimit = 10 * 60;

    setState({
      board: initial.map(row => [...row]),
      initialBoard: initial.map(row => [...row]),
      solution,
      notes: Array(9).fill(0).map(() => Array(9).fill(0).map(() => new Set<number>())),
      selectedCell: null,
      mistakes: 0,
      maxMistakes: 3,
      isComplete: false,
      level: levelId,
      timer: 0,
      timeLeft: timeLimit,
      isPaused: false,
      history: [initial.map(row => [...row])]
    });
    setLastGainedPoints(0);
    setShowLevelSelector(false);
  };

  const transitionToLevel = (levelId: number) => {
    if (userProfile?.soundEnabled) audioService.playClick();
    setIsLevelChanging(true);
    setTimeout(() => {
      initLevel(levelId);
      setIsLevelChanging(false);
    }, 400);
  };

  useEffect(() => {
    if (!state || state.isPaused || state.isComplete || state.timeLeft <= 0 || isLevelChanging) return;
    const interval = setInterval(() => {
      setState(s => s ? { ...s, timer: s.timer + 1, timeLeft: Math.max(0, s.timeLeft - 1) } : null);
    }, 1000);
    return () => clearInterval(interval);
  }, [state?.isPaused, state?.isComplete, state?.timeLeft, isLevelChanging]);

  const updateCell = (num: number) => {
    if (!state || !state.selectedCell || state.isComplete || state.isPaused || state.timeLeft <= 0 || state.mistakes >= state.maxMistakes) return;
    const [r, c] = state.selectedCell;
    if (state.initialBoard[r][c] !== null) return;

    if (notesMode) {
      setState(s => {
        if (!s) return null;
        const newNotes = s.notes.map((row, ri) => row.map((cellSet, ci) => {
          if (ri === r && ci === c) {
            const nextSet = new Set(cellSet);
            if (nextSet.has(num)) nextSet.delete(num);
            else nextSet.add(num);
            return nextSet;
          }
          return cellSet;
        }));
        return { ...s, notes: newNotes };
      });
      return;
    }

    setState(s => {
      if (!s) return null;
      if (s.board[r][c] === num) return s;
      const isCorrect = s.solution[r][c] === num;
      let newMistakes = s.mistakes;
      if (!isCorrect) {
        newMistakes += 1;
        if (userProfile?.soundEnabled) audioService.playIncorrect();
      } else {
        if (userProfile?.soundEnabled) audioService.playCorrect();
      }
      const newBoard = s.board.map((row, ri) => row.map((val, ci) => ri === r && ci === c ? num : val));
      const isComplete = newBoard.every((row, ri) => row.every((val, ci) => val === s.solution[ri][ci]));
      if (isComplete) {
        const points = settings.pointsPerLevel + (s.timeLeft * settings.timeBonusMultiplier);
        setLastGainedPoints(points);
        if (userProfile) setUserProfile({ ...userProfile, totalScore: userProfile.totalScore + points });
        setCompletedLevels(prev => [...new Set([...prev, s.level])]);
      }
      return { ...s, board: newBoard, mistakes: newMistakes, isComplete, history: [...s.history, newBoard] };
    });
  };

  const handleAction = (action: string) => {
    if (!state || isLevelChanging) return;
    if (userProfile?.soundEnabled) audioService.playClick();
    if (action === 'notes') setNotesMode(!notesMode);
    else if (action === 'pause') setState({ ...state, isPaused: !state.isPaused });
    else if (action === 'undo' && state.history.length > 1) {
      const h = [...state.history]; h.pop();
      setState({ ...state, board: h[h.length - 1], history: h });
    } else if (action === 'reset') transitionToLevel(state.level);
    else if (action === 'erase') {
      const [r, c] = state.selectedCell || [-1, -1];
      if (r !== -1 && state.initialBoard[r][c] === null) {
        const nb = state.board.map((row, ri) => row.map((v, ci) => ri === r && ci === c ? null : v));
        setState({ ...state, board: nb, history: [...state.history, nb] });
      }
    } else if (action === 'reveal') {
      if (!userProfile || userProfile.credits < 10) return alert("No credits!");
      const [r, c] = state.selectedCell || [-1, -1];
      if (r !== -1 && state.initialBoard[r][c] === null) {
        setUserProfile({ ...userProfile, credits: userProfile.credits - 10 });
        updateCell(state.solution[r][c]);
      }
    }
  };

  const renderContent = () => {
    if (view === 'landing') return <LandingPage appName={settings.appName} onAdmin={() => setView('admin')} onStart={(intent) => {
      if (intent) {
        // If they clicked buy, we want to show the purchase modal after login.
        // But first we need to get them to Auth. User might be logged out.
        // Simple way: pass intent to auth page or store in state? 
        // Better: Set a pending intent state.
        setPendingPurchase(intent);
        setView('auth');
      } else {
        setView('auth');
      }
    }} onNavigate={(v) => v === 'ranking' ? setShowLeaderboard(true) : setView(v)} />;
    if (view === 'auth') return <AuthPage onLogin={handleLogin} onBack={() => setView('landing')} />;
    if (view === 'privacy' || view === 'terms' || view === 'support') return <PolicyPages type={view as any} onBack={() => setView('landing')} />;
    if (view === 'reviews') return <ReviewsPage onBack={() => setView('landing')} />;
    if (view === 'profile' && userProfile) return <ProfilePage userProfile={userProfile} onSave={(p) => { setUserProfile(p); setView('game'); }} onBack={() => setView('game')} />;
    if (view === 'payment' && selectedPack) return <PaymentPage pack={selectedPack} onBack={() => { setView('game'); setSelectedPack(null); }} onComplete={() => handlePurchase(selectedPack)} />;
    if (view === 'referral' && userProfile) return <ReferralPage user={userProfile} onBack={() => setView('game')} />;
    if (view === 'kids') return <KidsMode onBack={() => setView('landing')} />;
    if (view === 'admin') {
      const now = Date.now();
      const mockUsers = [
        ...(userProfile ? [{ ...userProfile, id: 'current' }] : []),
        {
          id: 'u1', name: 'John Doe', email: 'john@example.com', totalScore: 12500, credits: 450, avatar: '', musicEnabled: true, soundEnabled: true, completedLevelCount: 45,
          purchaseHistory: [
            { id: 'p1', date: now - 86400000 * 2, credits: 500, amount: 9.99, currency: '$', status: 'completed' as const },
            { id: 'p2', date: now - 86400000 * 5, credits: 100, amount: 2.99, currency: '$', status: 'completed' as const }
          ],
          referralCode: 'JD123', referralData: { code: 'JD123', userId: 'u1', createdAt: now, totalReferred: 0, totalEarned: 0, referredUsers: [] }, referralMilestones: []
        },
        {
          id: 'u2', name: 'Maria Silva', email: 'maria@pt.com', totalScore: 8900, credits: 120, avatar: '', musicEnabled: false, soundEnabled: true, completedLevelCount: 32,
          purchaseHistory: [
            { id: 'p3', date: now - 86400000 * 1, credits: 2000, amount: 29.99, currency: '$', status: 'completed' as const }
          ],
          referralCode: 'MS456', referralData: { code: 'MS456', userId: 'u2', createdAt: now, totalReferred: 0, totalEarned: 0, referredUsers: [] }, referralMilestones: []
        },
        {
          id: 'u3', name: 'Robert King', email: 'king@uk.co', totalScore: 15400, credits: 890, avatar: '', musicEnabled: true, soundEnabled: true, completedLevelCount: 88,
          purchaseHistory: [
            { id: 'p4', date: now - 86400000 * 10, credits: 500, amount: 9.99, currency: '$', status: 'completed' as const },
            { id: 'p5', date: now - 86400000 * 15, credits: 500, amount: 9.99, currency: '$', status: 'completed' as const }
          ],
          referralCode: 'RK789', referralData: { code: 'RK789', userId: 'u3', createdAt: now, totalReferred: 0, totalEarned: 0, referredUsers: [] }, referralMilestones: []
        },
        {
          id: 'u4', name: 'Ana Costa', email: 'ana@dev.io', totalScore: 6700, credits: 50, avatar: '', musicEnabled: true, soundEnabled: true, completedLevelCount: 21,
          purchaseHistory: [
            { id: 'p6', date: now - 86400000 * 3, credits: 100, amount: 2.99, currency: '$', status: 'completed' as const }
          ],
          referralCode: 'AC000', referralData: { code: 'AC000', userId: 'u4', createdAt: now, totalReferred: 0, totalEarned: 0, referredUsers: [] }, referralMilestones: []
        },
      ];
      return (
        <AdminDashboard
          users={mockUsers}
          settings={settings}
          onUpdateSettings={setSettings}
          onUpdateUser={(id, updates) => {
            if (id === 'current' && userProfile) {
              setUserProfile({ ...userProfile, ...updates });
            }
          }}
          onBack={() => setView('game')}
        />
      );
    }

    if (!state) return null;

    const isGameOver = state.mistakes >= state.maxMistakes || state.timeLeft <= 0;

    return (
      <div className="min-h-screen bg-[#f8fafc] text-slate-900 pb-20">
        <header className="bg-white border-b border-slate-200 sticky top-0 z-40 px-4 py-3 shadow-sm">
          <div className="max-w-5xl mx-auto flex items-center justify-between">
            <div className="flex items-center gap-3">
              <button
                onClick={() => setView('landing')}
                onDoubleClick={() => setView('admin')}
                className="bg-white p-0.5 rounded-xl text-white shadow-lg overflow-hidden flex items-center justify-center border border-slate-100"
                title="Double click for Admin"
              >
                <img src="/favicon.png" alt="SudokuHub Logo" className="w-8 h-8 object-contain" />
              </button>
              <div onClick={() => setShowPurchaseModal(true)} className="flex flex-col text-xs font-black text-indigo-600 cursor-pointer hover:opacity-80 transition-opacity">
                <span className="text-slate-400">CREDITS</span>
                <div className="flex items-center gap-1"><Wallet size={12} /> {userProfile?.credits} <Plus size={10} className="bg-indigo-100 rounded-full p-0.5" /></div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <div className="bg-slate-100 px-3 py-1.5 rounded-full font-mono font-black text-indigo-600 text-sm">
                <Timer size={14} className="inline mr-1" /> {Math.floor(state.timeLeft / 60)}:{(state.timeLeft % 60).toString().padStart(2, '0')}
              </div>
              <button onClick={() => setShowChat(true)} className="p-2 bg-slate-50 rounded-full relative">
                <MessageCircle size={18} />
                {unreadCount > 0 && <span className="absolute -top-1 -right-1 bg-rose-500 text-white text-[9px] px-1 rounded-full">{unreadCount}</span>}
              </button>
              <button onClick={() => setShowLeaderboard(true)} className="p-2 bg-slate-50 rounded-full"><Trophy size={18} /></button>
              <button onClick={() => setView('referral')} className="p-2 bg-amber-50 text-amber-600 rounded-full hover:bg-amber-100 transition-colors" title="Convida Amigos">
                <Gift size={18} />
              </button>
              <button onClick={() => setView('profile')} className="p-2 bg-slate-50 rounded-full hover:bg-indigo-50 hover:text-indigo-600 transition-colors">
                <div className="w-[18px] h-[18px] flex items-center justify-center text-xs overflow-hidden rounded-full">
                  {userProfile?.avatar?.startsWith('http') ? <img src={userProfile.avatar} alt="P" className="w-full h-full object-cover" /> : (userProfile?.avatar || <Users size={18} />)}
                </div>
              </button>
              <button onClick={() => setShowSettings(true)} className="p-2 bg-slate-50 rounded-full"><Settings size={18} /></button>
              <button onClick={() => setShowLevelSelector(true)} className="bg-indigo-50 text-indigo-700 px-3 py-1.5 rounded-full font-black text-xs">LV. {state.level}</button>
            </div>
          </div>
        </header>

        <main className="max-w-2xl mx-auto mt-6 px-4 flex flex-col items-center gap-6">
          <div className="flex w-full gap-3">
            <div className="bg-white p-4 rounded-3xl border border-slate-100 shadow-sm flex-1 text-center">
              <span className="text-[9px] font-black text-slate-400 uppercase">Score</span>
              <div className="text-2xl font-black">{userProfile?.totalScore.toLocaleString()}</div>
            </div>
            <div className="bg-white p-4 rounded-3xl border border-slate-100 shadow-sm flex-1 text-center">
              <span className="text-[9px] font-black text-slate-400 uppercase">Mistakes</span>
              <div className="flex justify-center gap-1 mt-1">
                {[1, 2, 3].map(i => <Heart key={i} size={16} fill={i <= state.mistakes ? 'none' : 'currentColor'} className={i <= state.mistakes ? 'text-slate-200' : 'text-rose-500'} />)}
              </div>
            </div>
          </div>

          <div className={`relative transition-all duration-500 ${isLevelChanging ? 'opacity-0 scale-95' : 'opacity-100'}`}>
            {state.isPaused && !isGameOver && (
              <div className="absolute inset-0 z-20 bg-white/80 backdrop-blur-md rounded-3xl flex flex-col items-center justify-center">
                <Play size={64} className="text-indigo-600 cursor-pointer" onClick={() => handleAction('pause')} />
                <h3 className="text-xl font-black">PAUSED</h3>
              </div>
            )}
            {isGameOver && (
              <div className="absolute inset-0 z-30 bg-rose-600/90 backdrop-blur-md rounded-3xl flex flex-col items-center justify-center text-white p-10 text-center">
                <AlertCircle size={64} className="mb-4" />
                <h2 className="text-3xl font-black">GAME OVER</h2>
                <button onClick={() => transitionToLevel(state.level)} className="mt-6 px-8 py-3 bg-white text-rose-600 rounded-xl font-black">RETRY</button>
              </div>
            )}
            {state.isComplete && (
              <div className="absolute inset-0 z-30 bg-emerald-600/90 backdrop-blur-md rounded-3xl flex flex-col items-center justify-center text-white p-10 text-center">
                <Trophy size={64} className="mb-4 text-amber-400" />
                <h3 className="text-3xl font-black">WINNER! +{lastGainedPoints}</h3>
                <button onClick={() => transitionToLevel(state.level + 1 > TOTAL_LEVELS ? 1 : state.level + 1)} className="mt-6 px-8 py-3 bg-white text-emerald-600 rounded-xl font-black">NEXT LEVEL</button>
              </div>
            )}
            <SudokuGrid state={state} onCellClick={(r, c) => setState({ ...state!, selectedCell: [r, c] })} />
          </div>

          <Controls onNumberClick={updateCell} onAction={handleAction} notesMode={notesMode} canUndo={state.history.length > 1} />
        </main>
      </div>
    );
  };

  return (
    <>
      {renderContent()}

      {/* Global Modals */}
      {showSettings && (
        <div className="fixed inset-0 bg-slate-900/60 flex items-center justify-center z-[100] backdrop-blur-sm">
          <div className="bg-white rounded-3xl p-8 w-80 space-y-6 shadow-2xl animate-in zoom-in duration-200">
            <div className="flex justify-between items-center">
              <h2 className="font-black uppercase tracking-tight">Settings</h2>
              <X className="cursor-pointer text-slate-400" onClick={() => setShowSettings(false)} />
            </div>
            <button onClick={toggleMusic} className="w-full py-3 bg-slate-50 rounded-xl font-bold flex justify-between px-4">
              <span>Music</span>
              <span className={userProfile?.musicEnabled ? 'text-indigo-600' : 'text-slate-400'}>{userProfile?.musicEnabled ? 'ON' : 'OFF'}</span>
            </button>

            {userProfile?.musicEnabled && (
              <div className="space-y-2">
                <label className="text-xs font-black text-slate-400 uppercase tracking-widest pl-2">Select Track</label>
                <div className="bg-slate-50 rounded-xl overflow-hidden">
                  {audioService.tracks.map((track, i) => (
                    <button
                      key={i}
                      onClick={() => {
                        if (userProfile) {
                          setUserProfile({ ...userProfile, selectedTrackIndex: i });
                          audioService.setTrack(i);
                        }
                      }}
                      className={`w-full py-3 px-4 text-sm font-bold flex items-center justify-between transition-colors ${userProfile?.selectedTrackIndex === i ? 'bg-indigo-100 text-indigo-700' : 'hover:bg-slate-100 text-slate-600'}`}
                    >
                      <span className="flex items-center gap-2"><Music2 size={14} /> {track.name}</span>
                      {userProfile?.selectedTrackIndex === i && <CheckCircle size={14} />}
                    </button>
                  ))}
                </div>
              </div>
            )}
            <button onClick={toggleSound} className="w-full py-3 bg-slate-50 rounded-xl font-bold flex justify-between px-4">
              <span>SFX</span>
              <span className={userProfile?.soundEnabled ? 'text-emerald-600' : 'text-slate-400'}>{userProfile?.soundEnabled ? 'ON' : 'OFF'}</span>
            </button>
          </div>
        </div>
      )}

      {showLevelSelector && state && <LevelSelector currentLevel={state.level} completedLevels={completedLevels} onClose={() => setShowLevelSelector(false)} onSelect={transitionToLevel} />}
      {showLeaderboard && <Leaderboard entries={leaderboardData} onClose={() => setShowLeaderboard(false)} />}

      {showChat && (
        <ChatGroup
          messages={messages}
          userName={userProfile?.name || 'Guest'}
          onSendMessage={(t) => {
            const m = { id: Math.random().toString(36), sender: userProfile?.name || 'Guest', text: t, timestamp: Date.now(), isMe: true };
            setMessages(prev => [...prev, m]);
          }}
          onClose={() => setShowChat(false)}
        />
      )}

      {showPurchaseModal && (
        <PurchaseModal
          onClose={() => setShowPurchaseModal(false)}
          onSelectPack={(pack) => {
            setSelectedPack(pack);
            setShowPurchaseModal(false);
            setView('payment');
          }}
        />
      )}

      {/* PWA Install Prompt */}
      <PWAInstallPrompt />
    </>
  );
};

export default App;
