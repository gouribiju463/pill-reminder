import React, { useState, useEffect } from 'react';
import { 
  Pill, 
  Droplet, 
  Calendar, 
  Clock, 
  Flame, 
  Plus, 
  ArrowLeft, 
  Save, 
  X, 
  Bell, 
  Check, 
  Settings, 
  History, 
  CheckCircle2, 
  User, 
  Trash2, 
  Search, 
  Sparkles, 
  AlertCircle,
  CalendarDays,
  Activity,
  Heart,
  ChevronRight,
  PlusCircle,
  Smile,
  ShieldCheck,
  Volume2,
  RefreshCw,
  Info
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Medication, HistoryItem, Streak } from './types';
import { INITIAL_MEDICATIONS, INITIAL_HISTORY, HEALTH_TIPS } from './initialData';

export default function App() {
  // Navigation tabs: 'today' | 'schedule' | 'history' | 'settings' | 'add-medicine'
  const [currentTab, setCurrentTab] = useState<string>('today');
  
  // Medications list with local storage persistence
  const [medications, setMedications] = useState<Medication[]>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('premium_pill_reminders_v2');
      if (saved) {
        try {
          return JSON.parse(saved);
        } catch (e) {
          console.error("Failed to parse medications", e);
        }
      }
    }
    return INITIAL_MEDICATIONS;
  });

  // History logs database with persistence
  const [historyLogs, setHistoryLogs] = useState<HistoryItem[]>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('premium_pill_history_v2');
      if (saved) {
        try {
          return JSON.parse(saved);
        } catch (e) {
          console.error("Failed to parse history", e);
        }
      }
    }
    return INITIAL_HISTORY;
  });

  // Streak counter persistence
  const [streak, setStreak] = useState<Streak>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('premium_pill_streak_v2');
      if (saved) {
        try {
          return JSON.parse(saved);
        } catch (e) {
          console.error("Failed to parse streak", e);
        }
      }
    }
    return { currentStreak: 7, lastTakenDate: '2026-06-11' };
  });

  // Selected date ribbon (Default is TUE 19 to match aesthetic design request)
  const [selectedDay, setSelectedDay] = useState<number>(19);
  const [selectedMonth, setSelectedMonth] = useState<string>('TUE');

  // Form states for new medicine addition
  const [newMedName, setNewMedName] = useState('');
  const [newMedTime, setNewMedTime] = useState('08:00');
  const [newMedFrequency, setNewMedFrequency] = useState<'Daily' | 'Weekly' | 'As needed'>('Daily');
  const [newMedDosage, setNewMedDosage] = useState('');
  const [newMedIcon, setNewMedIcon] = useState<'pill' | 'medication' | 'droplet' | 'liquid'>('pill');
  const [newMedNotes, setNewMedNotes] = useState('');

  // Simulation Alert pop-up state
  const [activeAlertMed, setActiveAlertMed] = useState<Medication | null>(null);
  const [activeAlertTriggered, setActiveAlertTriggered] = useState(false);
  const [showSuccessOverlay, setShowSuccessOverlay] = useState(false);
  const [successAnimationStep, setSuccessAnimationStep] = useState(0);

  // Notifications HUD toaster
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Tip slider active index
  const [activeTipIndex, setActiveTipIndex] = useState(0);

  // Search/Filter query
  const [searchQuery, setSearchQuery] = useState('');

  // Active filter category for schedules/dashboard
  const [statusFilter, setStatusFilter] = useState<'all' | 'Taken' | 'Pending' | 'Missed'>('all');

  // Alarm Tone configuration
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [hapticsEnabled, setHapticsEnabled] = useState(true);

  // Write changes to disk
  useEffect(() => {
    localStorage.setItem('premium_pill_reminders_v2', JSON.stringify(medications));
  }, [medications]);

  useEffect(() => {
    localStorage.setItem('premium_pill_history_v2', JSON.stringify(historyLogs));
  }, [historyLogs]);

  useEffect(() => {
    localStorage.setItem('premium_pill_streak_v2', JSON.stringify(streak));
  }, [streak]);

  // Rotate health tips carousel
  useEffect(() => {
    const tipTimer = setInterval(() => {
      setActiveTipIndex((prev) => (prev + 1) % HEALTH_TIPS.length);
    }, 12000);
    return () => clearInterval(tipTimer);
  }, []);

  // Format helper: 24h string to 12h representation
  const convertTimeTo12h = (time24: string): string => {
    if (!time24) return '12:00 PM';
    const [hrs, mins] = time24.split(':');
    const hour = parseInt(hrs, 10);
    const suffix = hour >= 12 ? 'PM' : 'AM';
    let hour12 = hour % 12;
    if (hour12 === 0) hour12 = 12;
    return `${hour12.toString().padStart(2, '0')}:${mins} ${suffix}`;
  };

  // Toast notification system
  const triggerToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 4000);
  };

  // State transitions: Taken / Pending / Missed
  const updateMedicationStatus = (id: string, newStatus: 'Taken' | 'Pending' | 'Missed') => {
    const previousState = medications.find(m => m.id === id);
    const updated = medications.map((med) => {
      if (med.id === id) {
        if (newStatus === 'Taken' && med.status !== 'Taken') {
          // Log into history
          const now = new Date();
          const formatTime = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
          const formatDate = now.toISOString().split('T')[0];
          
          const log: HistoryItem = {
            id: `hist-${Date.now()}`,
            medicationId: med.id,
            medicationName: med.name,
            date: formatDate,
            time: formatTime,
            status: 'Taken',
            dosage: med.dosage || '1 unit'
          };
          setHistoryLogs(prev => [log, ...prev]);

          // Streak update
          const todayStr = now.toISOString().split('T')[0];
          if (streak.lastTakenDate !== todayStr) {
            setStreak(prev => ({
              currentStreak: prev.currentStreak + 1,
              lastTakenDate: todayStr
            }));
          }
        }
        return { ...med, status: newStatus };
      }
      return med;
    });

    setMedications(updated);
    
    if (newStatus === 'Taken') {
      triggerToast(`Great! ${previousState?.name || 'Medication'} marked as taken.`);
      // Activate congratulations sound check / step animation
      setSuccessAnimationStep(1);
      setShowSuccessOverlay(true);
      setTimeout(() => setShowSuccessOverlay(false), 2400);
    } else if (newStatus === 'Missed') {
      triggerToast(`Alert: ${previousState?.name || 'Medication'} marked as missed.`);
    } else {
      triggerToast(`${previousState?.name || 'Medication'} returned to upcoming queue.`);
    }
  };

  // Quick reset to allow infinite re-testing
  const handleResetSimulating = () => {
    const restored = medications.map(med => {
      // Alternate default statuses slightly for visual variety
      if (med.id === 'aspirin' || med.id === 'lisinopril') {
        return { ...med, status: 'Taken' as const };
      } else if (med.id === 'eye-drops') {
        return { ...med, status: 'Missed' as const };
      }
      return { ...med, status: 'Pending' as const };
    });
    setMedications(restored);
    triggerToast("Dashboard statuses reset for design demonstration!");
  };

  // Launch simulated phone push notification reminder
  const handleTriggerMockCall = (med: Medication) => {
    setActiveAlertMed(med);
    setActiveAlertTriggered(true);
  };

  // Confirm medication intake from alert
  const handleAcceptAlarm = () => {
    if (!activeAlertMed) return;
    updateMedicationStatus(activeAlertMed.id, 'Taken');
    setActiveAlertTriggered(false);
  };

  // Snooze medication alert by 10 minutes
  const handleSnoozeAlarm = () => {
    if (!activeAlertMed) return;
    triggerToast(`Snoozed ${activeAlertMed.name} alarm for 10 minutes.`);
    setActiveAlertTriggered(false);
  };

  // Skip medication alert
  const handleSkipAlarm = () => {
    if (!activeAlertMed) return;
    updateMedicationStatus(activeAlertMed.id, 'Missed');
    setActiveAlertTriggered(false);
  };

  // Save new medication reminder form
  const handleCreateMedication = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMedName.trim()) return;

    const formattedTime = convertTimeTo12h(newMedTime);
    const added: Medication = {
      id: `med-${Date.now()}`,
      name: newMedName,
      time: newMedTime,
      timeFormat: formattedTime,
      frequency: newMedFrequency,
      dosage: newMedDosage || '1 tablet',
      status: 'Pending',
      iconType: newMedIcon,
      dosageNotes: newMedNotes || undefined
    };

    setMedications(prev => [...prev, added]);

    // Reset fields
    setNewMedName('');
    setNewMedTime('12:00');
    setNewMedFrequency('Daily');
    setNewMedDosage('');
    setNewMedIcon('pill');
    setNewMedNotes('');

    triggerToast(`Success: Reminder for "${added.name}" registered!`);
    setCurrentTab('today');
  };

  const handleRemoveMedication = (id: string, name: string) => {
    setMedications(prev => prev.filter(m => m.id !== id));
    triggerToast(`Removed medication tracking pattern for ${name}.`);
  };

  // Compute stats
  const countTaken = medications.filter(m => m.status === 'Taken').length;
  const countTotal = medications.length;
  const progressRatio = countTotal > 0 ? (countTaken / countTotal) : 0;
  const percentComplete = Math.round(progressRatio * 100);

  // Weekdays date scroll banner (TUE 19 requested)
  const weekdays = [
    { dayNum: 18, label: 'MON' },
    { dayNum: 19, label: 'TUE' },
    { dayNum: 20, label: 'WED' },
    { dayNum: 21, label: 'THU' },
    { dayNum: 22, label: 'FRI' },
    { dayNum: 23, label: 'SAT' },
    { dayNum: 24, label: 'SUN' },
  ];

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 flex flex-col items-center antialiased pb-12 w-full">
      
      {/* Premium Notification Toaster */}
      <AnimatePresence>
        {toastMessage && (
          <motion.div 
            initial={{ opacity: 0, y: -20, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.9 }}
            className="fixed top-5 z-50 bg-slate-900/95 backdrop-blur-md text-white px-5 py-3.5 rounded-2xl shadow-xl flex items-center gap-2.5 text-sm font-medium border border-slate-700/30 max-w-sm"
          >
            <div className="flex-shrink-0 w-8 h-8 rounded-full bg-cyan-500/20 flex items-center justify-center text-cyan-400">
              <Sparkles className="w-4 h-4 animate-spin-slow" />
            </div>
            <span>{toastMessage}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Floating Success Celebration Overlay (Glassmorphic) */}
      <AnimatePresence>
        {showSuccessOverlay && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-slate-900/45 backdrop-blur-sm z-50 flex items-center justify-center p-6"
          >
            <motion.div 
              initial={{ scale: 0.85, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.85, y: -20 }}
              className="bg-white rounded-3xl p-8 max-w-sm w-full text-center shadow-2xl border border-white/50 relative overflow-hidden"
            >
              <div className="absolute inset-0 bg-gradient-to-tr from-indigo-50/40 via-cyan-50/20 to-teal-50/40 -z-10" />
              
              <div className="w-20 h-20 bg-gradient-to-tr from-emerald-400 to-teal-500 rounded-full flex items-center justify-center mx-auto mb-5 shadow-lg shadow-emerald-200 animate-bounce">
                <Check className="w-10 h-10 text-white stroke-[3px]" />
              </div>

              <h2 className="text-2xl font-bold bg-gradient-to-r from-indigo-600 to-cyan-500 bg-clip-text text-transparent">
                Adherence Logged!
              </h2>
              <p className="text-slate-600 text-sm mt-2 font-medium">
                Excellent choice. Maintaining consistency builds dynamic immunity and long-term health.
              </p>

              <div className="mt-5 text-xs text-indigo-500 font-bold bg-indigo-50 py-1.5 px-4 rounded-full inline-block">
                🔥 {streak.currentStreak} Day Perfect Streak
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* SMART ALERT popup: Reminders alarm screen simulator */}
      <AnimatePresence>
        {activeAlertTriggered && activeAlertMed && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-slate-900/60 backdrop-blur-md z-50 flex items-center justify-center p-4"
          >
            <motion.div 
              initial={{ scale: 0.9, y: 50 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 50 }}
              transition={{ type: 'spring', damping: 25, stiffness: 180 }}
              className="bg-white/95 backdrop-blur-xl rounded-[32px] p-6 max-w-sm w-full shadow-2xl border border-white/60 relative overflow-hidden text-center"
            >
              <div className="absolute top-4 right-4">
                <button 
                  onClick={() => setActiveAlertTriggered(false)}
                  className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-500 cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Pulsing ring around icon */}
              <div className="my-6 relative flex justify-center">
                <div className="absolute w-24 h-24 bg-indigo-500/10 rounded-full animate-ping pointer-events-none" />
                <div className="absolute w-20 h-20 bg-indigo-500/20 rounded-full animate-pulse pointer-events-none" />
                <div className="w-16 h-16 bg-indigo-600 rounded-2xl flex items-center justify-center shadow-lg shadow-indigo-200 text-white z-10">
                  <Bell className="w-8 h-8 animate-ring-alarm" />
                </div>
              </div>

              <div className="mb-4">
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-widest bg-slate-100 px-3 py-1 rounded-full">
                  Smart Medical Reminder
                </span>
                <h1 className="text-2xl font-bold text-slate-800 mt-3 tracking-tight">
                  Time for your medicine!
                </h1>
                <p className="text-xs text-slate-500 font-medium mt-1">
                  Keep your biological compliance strict & on time.
                </p>
              </div>

              {/* Medicine Summary Card */}
              <div className="bg-gradient-to-r from-slate-50 to-slate-100/50 rounded-2xl p-4 text-left border border-slate-200/40 shadow-xs mb-6 flex items-start gap-3.5">
                <div className="w-12 h-12 rounded-xl bg-indigo-50 flex items-center justify-center text-indigo-600 shrink-0">
                  <Pill className="w-6 h-6 text-indigo-600" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-800 text-base">{activeAlertMed.name}</h3>
                  <p className="text-xs text-slate-500 font-medium">{activeAlertMed.dosage} • {activeAlertMed.frequency}</p>
                  <div className="flex items-center gap-1.5 mt-2 text-indigo-600 font-semibold text-xs">
                    <Clock className="w-3.5 h-3.5" />
                    <span>Scheduled for {activeAlertMed.timeFormat}</span>
                  </div>
                </div>
              </div>

              {/* Interaction choices matching requested screenshot style */}
              <div className="space-y-3">
                <button 
                  onClick={handleAcceptAlarm}
                  className="w-full h-14 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white rounded-2xl font-bold shadow-lg shadow-emerald-100 active:scale-98 transition-all flex items-center justify-center gap-2 cursor-pointer text-sm"
                >
                  <CheckCircle2 className="w-5 h-5 stroke-[2.5]" />
                  <span>Mark as Taken</span>
                </button>

                <div className="grid grid-cols-2 gap-3">
                  <button 
                    onClick={handleSnoozeAlarm}
                    className="h-12 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-bold transition-all text-xs flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <Clock className="w-4 h-4 text-slate-500" />
                    <span>Snooze 10m</span>
                  </button>
                  <button 
                    onClick={handleSkipAlarm}
                    className="h-12 bg-red-50 hover:bg-red-100 text-red-600 rounded-xl font-bold transition-all text-xs flex items-center justify-center gap-1.5 cursor-pointer border border-red-200/50"
                  >
                    <X className="w-4 h-4 text-red-500" />
                    <span>Skip dose</span>
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Container constrained to premium smartphone feel */}
      <div className="w-full max-w-sm bg-white min-h-[92vh] sm:min-h-[860px] rounded-0 sm:rounded-[40px] shadow-2xl flex flex-col relative overflow-hidden sm:border-[8px] sm:border-slate-900 bg-slate-50/50 mt-0 sm:mt-6">
        
        {/* TOP STATUS BAR (Dynamic Ambient) */}
        <div className="bg-gradient-to-r from-indigo-600 to-cyan-500 text-white text-[11px] font-bold px-5 py-2.5 flex justify-between items-center z-10 shrink-0">
          <div className="flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-cyan-300" />
            <span>BIO-COMPLIATE ENCRYPTED v2026</span>
          </div>
          <div className="flex items-center gap-2">
            <span>STREAK: {streak.currentStreak}d</span>
            <div className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
          </div>
        </div>

        {/* ======================================= */}
        {/* TAB 1: TODAY REMINDERS LIST (DASHBOARD) */}
        {/* ======================================= */}
        {currentTab === 'today' && (
          <div className="flex-grow flex flex-col overflow-hidden pb-20">
            {/* Header section with gradient background matching mockup request */}
            <header className="bg-gradient-to-br from-indigo-600 via-indigo-700 to-cyan-500 text-white px-5 pt-5 pb-7 relative overflow-hidden shrink-0 shadow-lg">
              {/* Absolutes for calming glowing bubbles */}
              <div className="absolute right-[-20px] top-[-10px] w-40 h-40 bg-white/10 rounded-full blur-2xl pointer-events-none" />
              <div className="absolute left-[-20px] bottom-[-40px] w-32 h-32 bg-cyan-400/20 rounded-full blur-xl pointer-events-none" />

              <div className="flex justify-between items-center relative z-10 mb-4">
                <div className="flex items-center gap-2">
                  <div className="p-1 px-2.5 bg-white/20 hover:bg-white/30 rounded-full backdrop-blur-md text-[10px] uppercase font-bold tracking-wider flex items-center gap-1 transition-all cursor-pointer">
                    <Check className="w-3 h-3 text-emerald-300 stroke-[3px]" />
                    <span>Active Guardian</span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button 
                    onClick={handleResetSimulating}
                    className="p-1 px-2.5 bg-white/10 hover:bg-white/20 active:scale-95 rounded-full backdrop-blur-md text-[10px] font-extrabold flex items-center gap-1.5 transition-all text-cyan-200 hover:text-white cursor-pointer"
                    title="Reset simulation status parameters"
                  >
                    <RefreshCw className="w-3 h-3" />
                    <span>Reset test indicators</span>
                  </button>
                </div>
              </div>

              {/* Patient greetings header */}
              <div className="flex items-center justify-between mb-5 relative z-10">
                <div>
                  <h1 className="text-xl font-black tracking-tight text-white flex items-center gap-1.5">
                    <span>Clinical Intake</span>
                    <Activity className="w-4 h-4 text-cyan-300 animate-pulse" />
                  </h1>
                  <p className="text-xs text-white/80 font-medium">Patient Index: JD (John Doe)</p>
                </div>

                <div 
                  onClick={() => setCurrentTab('settings')}
                  className="w-10 h-10 rounded-xl bg-white/15 hover:bg-white/25 flex items-center justify-center transition-all cursor-pointer ring-1 ring-white/20"
                >
                  <Settings className="w-5 h-5 text-white" />
                </div>
              </div>

              {/* Interactive daily adherence progress ring card */}
              <div className="bg-white/10 backdrop-blur-md border border-white/15 rounded-2xl p-4 flex items-center justify-between shadow-lg relative z-10">
                <div>
                  <h3 className="text-sm font-bold text-white tracking-wide">Daily Adherence</h3>
                  <p className="text-xs text-cyan-100 font-medium mt-0.5">
                    {countTaken} of {countTotal} medications logged today
                  </p>
                  
                  {/* Micro task indicator checks */}
                  <div className="flex gap-1.5 mt-2">
                    {medications.map((m) => {
                      const isTaken = m.status === 'Taken';
                      const isMissed = m.status === 'Missed';
                      return (
                        <div 
                          key={m.id}
                          className={`w-3.5 h-3.5 rounded-full flex items-center justify-center text-[8px] font-black ${
                            isTaken 
                              ? 'bg-emerald-400 text-emerald-950' 
                              : isMissed 
                                ? 'bg-rose-400 text-rose-950'
                                : 'bg-white/25 text-white'
                          }`}
                          title={`${m.name}: ${m.status}`}
                        >
                          {isTaken ? '✓' : isMissed ? '!' : '•'}
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Progress Wheel inline */}
                <div className="relative w-14 h-14 shrink-0 flex items-center justify-center">
                  <svg className="w-full h-full transform -rotate-90">
                    <circle 
                      className="text-white/20" 
                      cx="28" 
                      cy="28" 
                      fill="transparent" 
                      r="24" 
                      stroke="currentColor" 
                      strokeWidth="5"
                    />
                    <circle 
                      className="text-cyan-300 transition-all duration-1000 ease-out" 
                      cx="28" 
                      cy="28" 
                      fill="transparent" 
                      r="24" 
                      stroke="currentColor" 
                      strokeWidth="5"
                      strokeDasharray="150.8" 
                      strokeDashoffset={150.8 - (150.8 * progressRatio)}
                      strokeLinecap="round"
                    />
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-[11px] font-black text-white">{percentComplete}%</span>
                  </div>
                </div>
              </div>
            </header>

            {/* DATE HORIZONTAL SCROLLER SLIDABLE */}
            <section className="bg-white py-3 px-5 border-b border-slate-100 shadow-xs shrink-0 select-none">
              <div className="flex overflow-x-auto gap-2 no-scrollbar">
                {weekdays.map((wk) => {
                  const isSel = wk.dayNum === selectedDay;
                  return (
                    <button
                      key={wk.dayNum}
                      onClick={() => {
                        setSelectedDay(wk.dayNum);
                        setSelectedMonth(wk.label);
                        triggerToast(`Date set to ${wk.label} ${wk.dayNum}`);
                      }}
                      className={`flex-shrink-0 w-11 h-16 rounded-xl flex flex-col items-center justify-center transition-all ${
                        isSel 
                          ? 'bg-gradient-to-b from-indigo-600 to-indigo-700 text-white font-extrabold shadow-md shadow-indigo-100 scale-102' 
                          : 'bg-slate-50 text-slate-500 hover:bg-slate-100 font-semibold'
                      }`}
                    >
                      <span className="text-[9px] tracking-wider uppercase opacity-80">{wk.label}</span>
                      <span className="text-base mt-0.5">{wk.dayNum}</span>
                    </button>
                  );
                })}
              </div>
            </section>

            {/* MEDICATION CARDS SCRATCHPAD AREA */}
            <main className="flex-grow overflow-y-auto px-5 pt-4 space-y-4">
              
              {/* Simulated Device Trigger Tool Banner */}
              <div className="bg-gradient-to-r from-teal-50 to-cyan-50/50 p-3 rounded-2xl border border-teal-100 flex justify-between items-center shadow-xs">
                <div className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-full bg-teal-500 animate-ping" />
                  <p className="text-[11px] text-teal-800 font-bold leading-none">
                    Trigger Smart Alert Simulation Sandbox
                  </p>
                </div>
                <button 
                  onClick={() => {
                    const target = medications.find(m => m.status === 'Pending') || medications[0];
                    if (target) handleTriggerMockCall(target);
                  }}
                  className="bg-teal-600 hover:bg-teal-700 text-white text-[10px] font-black px-3 py-1.5 rounded-xl uppercase transition-colors uppercase tracking-widest cursor-pointer"
                >
                  Test Alarm
                </button>
              </div>

              {/* Cards status section header */}
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-bold text-slate-400 tracking-wider uppercase text-left">
                  Today's Prescriptions & Vitamins
                </h3>
                <div className="flex items-center gap-1 bg-slate-100 p-1.5 rounded-xl border border-slate-200/50">
                  <span className="text-[10px] font-bold text-slate-500 px-1">Filter:</span>
                  {(['all', 'Taken', 'Pending', 'Missed'] as const).map((st) => (
                    <button
                      key={st}
                      onClick={() => setStatusFilter(st)}
                      className={`text-[9px] font-black px-2 py-1 rounded-lg transition-all ${
                        statusFilter === st 
                          ? 'bg-white text-slate-800 shadow-xs' 
                          : 'text-slate-500 hover:text-slate-800'
                      }`}
                    >
                      {st === 'all' ? 'All' : st}
                    </button>
                  ))}
                </div>
              </div>

              {/* CARDS LISTING STREAM */}
              <div className="space-y-3.5 pb-6">
                {medications
                  .filter(m => statusFilter === 'all' ? true : m.status === statusFilter)
                  .map((med) => {
                    // Status styling criteria from instructions: (green for taken, orange for upcoming, and red for missed doses)
                    const isTaken = med.status === 'Taken';
                    const isUpcoming = med.status === 'Pending';
                    const isMissed = med.status === 'Missed';

                    // Premium accent setup
                    let badgeBg = 'bg-orange-50 text-orange-600 border-orange-200/60';
                    let badgeText = 'Upcoming';
                    let statusDotPr = 'bg-orange-500';
                    let borderCol = 'border-slate-100 hover:border-orange-200/70';
                    let iconBgPr = 'bg-orange-50 text-orange-600';

                    if (isTaken) {
                      badgeBg = 'bg-emerald-50 text-emerald-600 border-emerald-200/60';
                      badgeText = 'Checked / Taken';
                      statusDotPr = 'bg-emerald-500';
                      borderCol = 'border-emerald-200/50 bg-emerald-50/20';
                      iconBgPr = 'bg-emerald-100 text-emerald-600';
                    } else if (isMissed) {
                      badgeBg = 'bg-rose-50 text-rose-600 border-rose-200/60';
                      badgeText = 'Missed';
                      statusDotPr = 'bg-rose-500';
                      borderCol = 'border-rose-200/50 hover:border-rose-200';
                      iconBgPr = 'bg-rose-100 text-rose-600';
                    }

                    return (
                      <div 
                        key={med.id}
                        className={`bg-white rounded-2xl p-4 border ${borderCol} transition-all duration-300 shadow-sm flex flex-col gap-3 relative`}
                        id={`dynamic-med-row-${med.id}`}
                      >
                        {/* Alarm Alert Simulation trigger spot */}
                        <button 
                          onClick={() => handleTriggerMockCall(med)}
                          className="absolute top-4 right-14 text-[10px] text-indigo-600 active:scale-95 bg-indigo-50 border border-indigo-100 hover:bg-indigo-100 rounded-lg px-2 py-1 font-bold z-10 transition-colors"
                          title="Simulate alarm call for this drug"
                        >
                          Simulate
                        </button>

                        <div className="flex items-start justify-between">
                          <div className="flex items-center gap-3">
                            {/* Shape categorized medicine icon */}
                            <div className={`w-11 h-11 rounded-xl flex items-center justify-center ${iconBgPr} shrink-0 shadow-xs`}>
                              {med.iconType === 'pill' ? (
                                <Pill className="w-5.5 h-5.5" />
                              ) : med.iconType === 'droplet' ? (
                                <Droplet className="w-5.5 h-5.5" />
                              ) : med.iconType === 'liquid' ? (
                                <Activity className="w-5.5 h-5.5" />
                              ) : (
                                <Pill className="w-5.5 h-5.5" />
                              )}
                            </div>

                            <div>
                              <h4 className="font-bold text-slate-800 text-base leading-tight">
                                {med.name}
                              </h4>
                              <div className="flex items-center gap-2 mt-1">
                                <span className="text-xs text-slate-500 font-semibold flex items-center gap-1 bg-slate-50 px-2 py-0.5 rounded-lg border border-slate-200/40">
                                  <Clock className="w-3.5 h-3.5 text-slate-400" />
                                  <span>{med.timeFormat}</span>
                                </span>
                                {med.dosage && (
                                  <span className="text-[11px] text-slate-500 font-bold">
                                    {med.dosage}
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>

                          {/* Interactive status badge dropdown */}
                          <div className={`text-[10px] font-black uppercase tracking-wider px-2.5 py-1 rounded-full border ${badgeBg} flex items-center gap-1.5`}>
                            <div className={`w-2 h-2 rounded-full ${statusDotPr} ${isUpcoming ? 'animate-pulse' : ''}`} />
                            <span>{badgeText}</span>
                          </div>
                        </div>

                        {/* Interactive toggle operations under card for maximum design showcase */}
                        <div className="pt-2 border-t border-slate-100 flex justify-between items-center gap-1.5">
                          <span className="text-[10px] font-bold text-slate-400">
                            Action controls:
                          </span>

                          <div className="flex gap-1">
                            {/* MARK TAKEN ACTION */}
                            <button 
                              onClick={() => updateMedicationStatus(med.id, 'Taken')}
                              className={`text-[10px] font-bold px-2.5 py-1.5 rounded-lg flex items-center gap-0.5 cursor-pointer transition-colors ${
                                isTaken 
                                  ? 'bg-emerald-600 text-white shadow-xs' 
                                  : 'bg-slate-100 text-slate-600 hover:bg-emerald-50 hover:text-emerald-600'
                              }`}
                            >
                              <Check className="w-3.5 h-3.5" />
                              <span>Taken</span>
                            </button>

                            {/* MARK UPCOMING ACTION */}
                            <button 
                              onClick={() => updateMedicationStatus(med.id, 'Pending')}
                              className={`text-[10px] font-bold px-2.5 py-1.5 rounded-lg flex items-center gap-0.5 cursor-pointer transition-colors ${
                                isUpcoming 
                                  ? 'bg-orange-500 text-white shadow-xs' 
                                  : 'bg-slate-100 text-slate-600 hover:bg-orange-50 hover:text-orange-500'
                              }`}
                            >
                              <Clock className="w-3.5 h-3.5" />
                              <span>Upcoming</span>
                            </button>

                            {/* MARK MISSED ACTION */}
                            <button 
                              onClick={() => updateMedicationStatus(med.id, 'Missed')}
                              className={`text-[10px] font-bold px-2.5 py-1.5 rounded-lg flex items-center gap-0.5 cursor-pointer transition-colors ${
                                isMissed 
                                  ? 'bg-rose-500 text-white shadow-xs' 
                                  : 'bg-slate-100 text-slate-600 hover:bg-rose-50 hover:text-rose-500'
                              }`}
                            >
                              <AlertCircle className="w-3.5 h-3.5" />
                              <span>Missed</span>
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}

                {medications.length === 0 && (
                  <div className="py-12 text-center bg-white rounded-2xl border border-dashed border-slate-200 p-6 shadow-sm">
                    <p className="text-slate-500 text-sm font-medium">No recorded prescriptions found.</p>
                    <button 
                      onClick={() => setCurrentTab('add-medicine')}
                      className="mt-3 inline-flex items-center gap-2 bg-gradient-to-r from-indigo-500 to-cyan-500 text-white text-xs font-bold px-4 py-2.5 rounded-full shadow-md"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Setup Medicine Reminder</span>
                    </button>
                  </div>
                )}
              </div>
            </main>

            {/* Quick Floating Creator FAB */}
            <button 
              onClick={() => setCurrentTab('add-medicine')}
              className="absolute bottom-24 right-5 w-14 h-14 bg-gradient-to-tr from-indigo-600 to-cyan-500 text-white rounded-full shadow-xl hover:shadow-indigo-200/50 active:scale-95 flex items-center justify-center transition-all cursor-pointer z-30 ring-4 ring-white"
              aria-label="Register new drug design"
              id="fab-adder-plus"
            >
              <Plus className="w-7 h-7 stroke-[2.5]" />
            </button>
          </div>
        )}

        {/* ======================================= */}
        {/* TAB 2: REGISTER REMINDER FORM CONTAINER */}
        {/* ======================================= */}
        {currentTab === 'add-medicine' && (
          <div className="flex-grow flex flex-col overflow-y-auto pb-24">
            <header className="sticky top-0 z-40 bg-white border-b border-slate-100 flex items-center justify-between px-5 h-14 w-full shrink-0">
              <div className="flex items-center gap-3">
                <button 
                  onClick={() => setCurrentTab('today')}
                  className="hover:bg-slate-50 transition-colors p-2 rounded-full flex items-center justify-center text-indigo-600 cursor-pointer"
                  aria-label="Back to listing dashboard"
                  id="quit-medform-back"
                >
                  <ArrowLeft className="w-5 h-5 stroke-[2.5]" />
                </button>
                <h1 className="text-base font-extrabold text-slate-800">Add Reminder</h1>
              </div>
              <div className="w-10" />
            </header>

            <main className="p-5 flex flex-col gap-6">
              <div>
                <span className="text-[10px] font-black text-indigo-500 bg-indigo-50 px-3 py-1 rounded-full uppercase tracking-wider">
                  2026 Treatment Plan
                </span>
                <h2 className="text-2xl font-black text-slate-800 mt-2 tracking-tight">New Reminder</h2>
                <p className="text-xs text-slate-500 font-semibold mt-1">
                  Specify details below to let the neural compliance engine monitor your schedule.
                </p>
              </div>

              {/* Add form */}
              <form onSubmit={handleCreateMedication} className="space-y-4" id="medicine-builder-form">
                
                {/* 1. Item name field */}
                <div className="flex flex-col gap-1.5">
                  <label htmlFor="input-medname" className="text-[11px] font-extrabold text-slate-400 uppercase tracking-widest ml-1">
                    MEDICINE NAME
                  </label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
                      <Pill className="w-5 h-5 text-slate-400" />
                    </span>
                    <input 
                      type="text"
                      id="input-medname"
                      required
                      placeholder="e.g. Vitamin B12 or Lipitor"
                      value={newMedName}
                      onChange={(e) => setNewMedName(e.target.value)}
                      className="w-full h-12 pl-12 pr-4 bg-white border border-slate-200 focus:border-indigo-500 rounded-2xl outline-none text-sm text-slate-800 font-semibold focus:ring-4 focus:ring-indigo-100 placeholder:text-slate-300 transition-all"
                    />
                  </div>
                </div>

                {/* 2. Shape Selector */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-[11px] font-extrabold text-slate-400 uppercase tracking-widest ml-1">
                    CHOOSE ICON CAP
                  </label>
                  <div className="grid grid-cols-4 gap-2">
                    {[
                      { icon: Pill, type: 'pill', label: 'Pill' },
                      { icon: Droplet, type: 'droplet', label: 'Drops' },
                      { icon: Activity, type: 'liquid', label: 'Liquid' },
                      { icon: ShieldCheck, type: 'medication', label: 'Protect' }
                    ].map((shp) => {
                      const IconLabelStr = shp.label;
                      const IconObj = shp.icon;
                      const isSelected = newMedIcon === shp.type;

                      return (
                        <button
                          key={shp.type}
                          type="button"
                          onClick={() => setNewMedIcon(shp.type as any)}
                          className={`h-16 rounded-xl flex flex-col items-center justify-center gap-1 text-[10px] uppercase font-extrabold border transition-all cursor-pointer ${
                            isSelected 
                              ? 'bg-gradient-to-b from-indigo-50 to-indigo-100/50 border-indigo-500 text-indigo-700 shadow-sm shadow-indigo-100' 
                              : 'bg-white border-slate-200 text-slate-505 text-slate-400 hover:bg-slate-50'
                          }`}
                        >
                          <IconObj className={`w-5 h-5 ${isSelected ? 'text-indigo-600' : 'text-slate-400'}`} />
                          <span>{IconLabelStr}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* 3. Time Picker Input */}
                <div className="flex flex-col gap-1.5">
                  <label htmlFor="input-medtime" className="text-[11px] font-extrabold text-slate-400 uppercase tracking-widest ml-1">
                    TIME ALARM
                  </label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
                      <Clock className="w-5 h-5 text-slate-400" />
                    </span>
                    <input 
                      type="time"
                      id="input-medtime"
                      required
                      value={newMedTime}
                      onChange={(e) => setNewMedTime(e.target.value)}
                      className="w-full h-12 pl-12 pr-4 bg-white border border-slate-200 focus:border-indigo-500 rounded-2xl outline-none text-sm text-slate-800 font-semibold focus:ring-4 focus:ring-indigo-100 transition-all cursor-pointer"
                    />
                  </div>
                </div>

                {/* 4. Frequency options */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-[11px] font-extrabold text-slate-400 uppercase tracking-widest ml-1">
                    FREQUENCY PERIOD
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {(['Daily', 'Weekly', 'As needed'] as const).map((freq) => {
                      const isSel = newMedFrequency === freq;
                      return (
                        <button
                          key={freq}
                          type="button"
                          onClick={() => setNewMedFrequency(freq)}
                          className={`h-11 rounded-xl text-xs font-bold uppercase transition-all tracking-wide cursor-pointer flex items-center justify-center border ${
                            isSel 
                              ? 'bg-indigo-600 border-indigo-600 text-white shadow-md' 
                              : 'bg-white border-slate-200 text-slate-500 hover:bg-slate-50'
                          }`}
                        >
                          {freq}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* 5. Dosage and amount input */}
                <div className="flex flex-col gap-1.5">
                  <label htmlFor="input-dosage" className="text-[11px] font-extrabold text-slate-400 uppercase tracking-widest ml-1">
                    DOSAGE AMOUNT
                  </label>
                  <input 
                    type="text"
                    id="input-dosage"
                    placeholder="e.g. 1 tablet (500mg) or 2 drops"
                    value={newMedDosage}
                    onChange={(e) => setNewMedDosage(e.target.value)}
                    className="w-full h-12 px-4 bg-white border border-slate-200 focus:border-indigo-500 rounded-2xl outline-none text-sm text-slate-800 font-semibold focus:ring-4 focus:ring-indigo-100 placeholder:text-slate-300 transition-all"
                  />
                </div>

                {/* 6. Extra Guidance Instruction */}
                <div className="flex flex-col gap-1.5">
                  <label htmlFor="input-notes" className="text-[11px] font-extrabold text-slate-400 uppercase tracking-widest ml-1">
                    ADMINISTRATION NOTES
                  </label>
                  <input 
                    type="text"
                    id="input-notes"
                    placeholder="e.g. Take with plenty of water after breakfast"
                    value={newMedNotes}
                    onChange={(e) => setNewMedNotes(e.target.value)}
                    className="w-full h-12 px-4 bg-white border border-slate-200 focus:border-indigo-500 rounded-2xl outline-none text-sm text-slate-800 font-semibold focus:ring-4 focus:ring-indigo-100 placeholder:text-slate-300 transition-all"
                  />
                </div>

              </form>

              {/* Tip Carousel / Decorative Google Hotlink Picture with premium treatment */}
              <div className="relative rounded-2xl overflow-hidden aspect-[21/9] shadow-md border border-slate-150 relative mt-2 group bg-slate-100">
                <img 
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuCpAhCl4GtwoYi30X4J4hZiAAASYKm1Nt4Jm3SkVVwShjc6K3RwB5RkssOEJRe7XRh9zrx6W1LKAMKdAoMP_3DkPZd4ykqFJoB5TvyZmrhEIAmtcm110h60OLunbzt7a7SGkiLJWZ5N08SIQjKJck-L7QI9d8eyW5YxuDO5uaCWO6DKULj1kUcSY9kcqyApsIDfYHHIvk0HxZPrrC-ElYlN0TPKhjnb7U23qDnIAqu7N7FJhdf09S0DI0j8BECUYdeWtn2cC2Zisv0"
                  alt="Healthy life clinical capsules" 
                  className="w-full h-full object-cover group-hover:scale-102 transition-transform duration-500 rounded-2xl"
                  referrerPolicy="no-referrer"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 via-slate-900/30 to-transparent" />
                <div className="absolute bottom-3 left-4 right-4 text-white">
                  <span className="text-[8px] font-black text-cyan-300 bg-cyan-900/40 px-2.5 py-0.5 rounded-full uppercase tracking-widest inline-flex items-center gap-1">
                    <Info className="w-3 h-3 text-cyan-300" />
                    <span>Consistency Tip</span>
                  </span>
                  <p className="text-[11px] font-bold text-white mt-1 leading-normal">
                    "{HEALTH_TIPS[activeTipIndex]}"
                  </p>
                </div>
              </div>

            </main>

            {/* Bottom floating absolute trigger for Save Medication */}
            <div className="absolute bottom-0 left-0 w-full p-4 bg-gradient-to-t from-white via-white/95 to-transparent pt-6 z-20">
              <button 
                type="submit"
                form="medicine-builder-form"
                className="w-full h-14 bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-700 hover:to-indigo-800 text-white font-bold rounded-full shadow-lg shadow-indigo-100 active:scale-98 transition-all flex items-center justify-center gap-2 cursor-pointer text-sm font-extrabold uppercase tracking-wider"
                id="summit-new-med-btn"
              >
                <Save className="w-5 h-5 text-white" />
                <span>Save Medicine reminder</span>
              </button>
            </div>
          </div>
        )}

        {/* ======================================= */}
        {/* TAB 3: SCHEDULES OVERVIEW (CALENDAR COMPASS) */}
        {/* ======================================= */}
        {currentTab === 'schedule' && (
          <div className="flex-grow flex flex-col overflow-hidden pb-20">
            <header className="sticky top-0 z-40 bg-white border-b border-slate-100 flex items-center px-5 h-14 w-full shrink-0">
              <h1 className="text-base font-extrabold text-slate-800 flex items-center gap-2">
                <CalendarDays className="w-5 h-5 text-indigo-600" />
                <span>Clinical Schedule</span>
              </h1>
            </header>

            <main className="flex-grow overflow-y-auto p-5 space-y-5">
              
              {/* Slidable Week Compass */}
              <div className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white p-4 rounded-3xl shadow-lg border border-slate-800">
                <div className="flex justify-between items-center mb-3">
                  <span className="text-xs font-bold text-slate-350 tracking-wider">JUNE 2026</span>
                  <span className="text-[9px] bg-indigo-500/30 text-indigo-200 border border-indigo-400/20 px-2.5 py-0.5 rounded-full font-extrabold">WEEK PATTERN</span>
                </div>
                
                <div className="grid grid-cols-7 gap-1.5 text-center">
                  {weekdays.map(wk => {
                    const isToday = wk.dayNum === selectedDay;
                    return (
                      <div 
                        key={wk.dayNum}
                        onClick={() => setSelectedDay(wk.dayNum)}
                        className={`p-2 rounded-xl flex flex-col items-center gap-1 transition-all cursor-pointer ${
                          isToday 
                            ? 'bg-gradient-to-b from-indigo-500 to-cyan-400 text-white font-black scale-102' 
                            : 'bg-white/5 hover:bg-white/10 text-slate-350'
                        }`}
                      >
                        <span className="text-[9px] opacity-75 font-semibold">{wk.label[0]}</span>
                        <span className="text-xs font-bold">{wk.dayNum}</span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Filtering layout searching */}
              <div className="relative">
                <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input 
                  type="text"
                  placeholder="Filter schedule list..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full h-11 pl-10 pr-4 bg-white border border-slate-200 text-slate-800 focus:border-indigo-500 focus:outline-none rounded-2xl text-xs font-semibold placeholder:text-slate-300"
                />
              </div>

              {/* Active Alarms */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-[11px] font-extrabold text-slate-400 tracking-wider uppercase text-left">
                    Registered schedules ({medications.length})
                  </h3>
                  <button 
                    onClick={() => setCurrentTab('add-medicine')}
                    className="text-xs text-indigo-600 font-extrabold hover:underline flex items-center gap-0.5"
                  >
                    <span>+ Register drug</span>
                  </button>
                </div>

                <div className="space-y-3 pb-6">
                  {medications
                    .filter(med => med.name.toLowerCase().includes(searchQuery.toLowerCase()))
                    .map((med) => {
                      const isTaken = med.status === 'Taken';
                      const isUpcoming = med.status === 'Pending';
                      const isMissed = med.status === 'Missed';

                      let statText = 'Upcoming';
                      let statColor = 'bg-orange-50 text-orange-600 border-orange-200/50';
                      if (isTaken) {
                        statText = 'Taken';
                        statColor = 'bg-emerald-50 text-emerald-600 border-emerald-250/50';
                      } else if (isMissed) {
                        statText = 'Missed';
                        statColor = 'bg-rose-50 text-rose-600 border-rose-250/50';
                      }

                      return (
                        <div key={med.id} className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm flex items-center justify-between gap-3">
                          <div className="flex items-center gap-3">
                            <span className="w-2.5 h-2.5 rounded-full bg-gradient-to-r from-indigo-500 to-cyan-500" />
                            <div>
                              <h4 className="font-bold text-slate-800 text-sm">{med.name}</h4>
                              <p className="text-[10px] text-slate-500 font-semibold mt-0.5 flex items-center gap-1">
                                <Clock className="w-3 h-3 text-slate-400" />
                                <span>{med.timeFormat} ({med.frequency})</span>
                              </p>
                            </div>
                          </div>

                          <div className="flex items-center gap-1.5 shrink-0">
                            {/* Fast trigger test alarm */}
                            <button 
                              onClick={() => handleTriggerMockCall(med)}
                              className="text-[10px] text-indigo-600 bg-indigo-50 hover:bg-indigo-100 rounded-lg px-2 py-1 font-bold transition-all border border-indigo-100"
                              title="Test trigger"
                            >
                              Test
                            </button>

                            <button 
                              onClick={() => handleRemoveMedication(med.id, med.name)}
                              className="p-1.5 text-rose-500 hover:bg-rose-50 rounded-lg transition-colors border border-transparent hover:border-rose-100/50"
                              title="De-register prescription"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      );
                    })}

                  {medications.length === 0 && (
                    <p className="text-center text-xs text-slate-400 font-bold py-6">No medications in index.</p>
                  )}
                </div>
              </div>
            </main>
          </div>
        )}

        {/* ======================================= */}
        {/* TAB 4: COMPREHENSIVE TIMELINE LOGS     */}
        {/* ======================================= */}
        {currentTab === 'history' && (
          <div className="flex-grow flex flex-col overflow-hidden pb-20">
            <header className="sticky top-0 z-40 bg-white border-b border-slate-100 flex items-center px-5 h-14 w-full shrink-0">
              <h1 className="text-base font-extrabold text-slate-800 flex items-center gap-2">
                <History className="w-5 h-5 text-indigo-600" />
                <span>Adherence History</span>
              </h1>
            </header>

            <main className="flex-grow overflow-y-auto p-5 space-y-5">
              
              {/* Streak info block */}
              <div className="bg-gradient-to-r from-emerald-500/10 via-teal-500/5 to-transparent p-4 rounded-3xl border border-emerald-500/10 flex items-center gap-3.5">
                <div className="w-12 h-12 bg-gradient-to-tr from-emerald-500 to-teal-500 rounded-2xl flex items-center justify-center text-white font-extrabold text-lg shadow-md shadow-emerald-100/50">
                  {streak.currentStreak}d
                </div>
                <div>
                  <h4 className="font-extrabold text-emerald-800 text-sm leading-tight">Bio-Compliance Stable</h4>
                  <p className="text-[11px] text-slate-500 font-semibold mt-1">
                    Your {streak.currentStreak}-day dosage compliance streak keeps your bloodstream indices within target parameters. Brilliant.
                  </p>
                </div>
              </div>

              {/* History index list */}
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <h3 className="text-[11px] font-extrabold text-slate-400 tracking-wider uppercase">
                    Past logs
                  </h3>
                  <button 
                    onClick={() => {
                      setHistoryLogs([]);
                      triggerToast("Adherence history logs cleared successfully.");
                    }}
                    className="text-xs text-rose-500 hover:text-rose-600 font-extrabold"
                  >
                    Clear history logs
                  </button>
                </div>

                <div className="space-y-3 pb-6">
                  {historyLogs.map((log) => (
                    <div key={log.id} className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm flex items-start justify-between gap-3">
                      <div className="flex items-start gap-3">
                        <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold text-sm shrink-0 mt-0.5">
                          ✓
                        </div>
                        <div>
                          <h4 className="font-bold text-slate-800 text-sm">{log.medicationName}</h4>
                          <p className="text-[11px] text-slate-500 mt-1 font-semibold">
                            Logged dose: <span className="text-slate-800">{log.dosage}</span>
                          </p>
                          <p className="text-[10px] text-slate-400 font-semibold mt-0.5">
                            Compliance: {log.date} @ {log.time}
                          </p>
                        </div>
                      </div>

                      <span className="text-[8px] font-black tracking-widest text-emerald-600 bg-emerald-50 border border-emerald-100 rounded-full px-2.5 py-1 uppercase shrink-0">
                        COMPLIANT
                      </span>
                    </div>
                  ))}

                  {historyLogs.length === 0 && (
                    <div className="py-12 text-center bg-white border border-dashed rounded-2xl p-6">
                      <p className="text-xs text-slate-400 font-bold">No registered ingestion events found today.</p>
                      <button 
                        onClick={() => handleResetSimulating()}
                        className="mt-3 text-xs bg-slate-100 text-slate-600 hover:bg-slate-200 font-bold py-1.5 px-3 rounded-lg"
                      >
                        Generate demo indicators
                      </button>
                    </div>
                  )}
                </div>

              </div>

            </main>
          </div>
        )}

        {/* ======================================= */}
        {/* TAB 5: PATIENT SPECIFICATIONS / SETTINGS */}
        {/* ======================================= */}
        {currentTab === 'settings' && (
          <div className="flex-grow flex flex-col overflow-hidden pb-12">
            <header className="sticky top-0 z-40 bg-white border-b border-indigo-50/10 flex items-center px-5 h-14 w-full shrink-0">
              <h1 className="text-base font-extrabold text-slate-800 flex items-center gap-2">
                <Settings className="w-5 h-5 text-indigo-600" />
                <span>Guardian Specifications</span>
              </h1>
            </header>

            <main className="flex-grow overflow-y-auto p-5 space-y-6">
              
              {/* Profile Card */}
              <div className="bg-gradient-to-r from-indigo-50/60 to-cyan-50/30 p-4 rounded-3xl border border-indigo-100/50 flex items-center gap-4 shadow-sm relative overflow-hidden">
                <div className="absolute right-0 bottom-0 text-indigo-500/10 pointer-events-none transform translate-y-3 select-none">
                  <User className="w-24 h-24 stroke-[3px]" />
                </div>

                <div className="w-12 h-12 rounded-2xl bg-indigo-600 text-white font-extrabold text-lg flex items-center justify-center shrink-0 shadow-md shadow-indigo-150">
                  JD
                </div>

                <div className="z-10 relative">
                  <h3 className="font-extrabold text-slate-800 text-base">John Doe (Primary)</h3>
                  <p className="text-[11px] text-slate-500 font-semibold mt-0.5">Clinical ID: ID-2026-X83A</p>
                  <p className="text-[10px] text-indigo-600 font-bold mt-1">Guardian Mode: Compliant (7d Streak)</p>
                </div>
              </div>

              {/* Simulation triggers console */}
              <div className="bg-white p-4 rounded-2xl border border-slate-200/50 shadow-xs">
                <h4 className="text-[11px] font-black text-indigo-500 uppercase tracking-widest mb-2 flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4" />
                  <span>Clinical Alarm Sandbox triggers</span>
                </h4>
                <p className="text-xs text-slate-500 leading-normal mb-3 font-semibold">
                  Select a medication from your schedule index to immediately test how the simulated smartwatch alert pop-up responds:
                </p>

                <div className="grid grid-cols-2 gap-2">
                  {medications.map((m) => (
                    <button
                      key={m.id}
                      onClick={() => handleTriggerMockCall(m)}
                      className="bg-slate-50 hover:bg-slate-100 border border-slate-200/50 rounded-xl p-2.5 text-left text-xs font-bold font-semibold transition-all flex items-center justify-between cursor-pointer group"
                    >
                      <span className="truncate text-slate-700 group-hover:text-indigo-600">{m.name}</span>
                      <Bell className="w-3.5 h-3.5 text-slate-400 group-hover:text-indigo-500 shrink-0 ml-1.5" />
                    </button>
                  ))}
                  <button 
                    onClick={() => {
                      const temp: Medication = {
                        id: 'temp-alert',
                        name: 'Lisinopril',
                        time: '12:00',
                        timeFormat: '12:00 PM',
                        frequency: 'Daily',
                        dosage: '10mg • 1 tablet',
                        status: 'Pending',
                        iconType: 'pill'
                      };
                      handleTriggerMockCall(temp);
                    }}
                    className="bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 rounded-xl p-2.5 text-left text-xs font-black transition-all flex items-center justify-between cursor-pointer col-span-2 text-indigo-700"
                  >
                    <span>Simulate Requested Mockup (Lisinopril Alert)</span>
                    <Bell className="w-4 h-4 text-indigo-600 animate-bounce" />
                  </button>
                </div>
              </div>

              {/* Patient configuration and toggles */}
              <div className="space-y-3.5">
                <h4 className="text-[11px] font-extrabold text-slate-400 tracking-wider uppercase ml-1">
                  Alert parameters
                </h4>

                <div className="bg-white border border-slate-200/60 rounded-2xl divide-y divide-slate-100 shadow-xs">
                  
                  {/* Alarm switch toggle */}
                  <div className="p-4 flex justify-between items-center text-sm">
                    <div>
                      <p className="font-bold text-slate-800">Alarm Tone Reminder</p>
                      <p className="text-xs text-slate-500 font-semibold mt-0.5">Play dynamic medical sound</p>
                    </div>
                    <button 
                      onClick={() => {
                        setSoundEnabled(!soundEnabled);
                        triggerToast(`Remind Sound Alerts: ${!soundEnabled ? 'ACTIVE' : 'MUTED'}`);
                      }}
                      className={`w-11 h-6 rounded-full relative transition-colors duration-200 cursor-pointer flex items-center px-0.5 ${
                        soundEnabled ? 'bg-indigo-600' : 'bg-slate-200'
                      }`}
                    >
                      <div className={`w-5 h-5 bg-white rounded-full transition-transform shadow-xs ${
                        soundEnabled ? 'translate-x-5' : 'translate-x-0'
                      }`} />
                    </button>
                  </div>

                  {/* Haptics Switch Toggle */}
                  <div className="p-4 flex justify-between items-center text-sm">
                    <div>
                      <p className="font-bold text-slate-800">Smart Pulsing Haptics</p>
                      <p className="text-xs text-slate-500 font-semibold mt-0.5">Vibrate browser container on alert popups</p>
                    </div>
                    <button 
                      onClick={() => {
                        setHapticsEnabled(!hapticsEnabled);
                        triggerToast(`Smart Pulsing Haptics: ${!hapticsEnabled ? 'ENABLED' : 'DISABLED'}`);
                      }}
                      className={`w-11 h-6 rounded-full relative transition-colors duration-200 cursor-pointer flex items-center px-0.5 ${
                        hapticsEnabled ? 'bg-indigo-600' : 'bg-slate-200'
                      }`}
                    >
                      <div className={`w-5 h-5 bg-white rounded-full transition-transform shadow-xs ${
                        hapticsEnabled ? 'translate-x-5' : 'translate-x-0'
                      }`} />
                    </button>
                  </div>

                  <div className="p-4 flex justify-between items-center text-sm font-semibold">
                    <div>
                      <p className="font-bold text-slate-800">Adherence Challenge target</p>
                      <p className="text-xs text-slate-500 mt-0.5">Perfect compliance streak reward goal</p>
                    </div>
                    <span className="text-indigo-600 font-black">15 Days</span>
                  </div>

                </div>
              </div>

              {/* System build reference */}
              <div className="text-center font-bold text-[10px] text-slate-400 py-3 uppercase tracking-widest bg-slate-100 rounded-xl">
                Clinical Health Companion • Build v4.9.2 (2026)
              </div>

            </main>
          </div>
        )}

        {/* ======================================= */}
        {/* APP FOOTER: PREMIUM TABS NAVIGATION BAR */}
        {/* ======================================= */}
        <nav className="absolute bottom-0 left-0 w-full bg-white/95 backdrop-blur-md border-t border-slate-200/60 shadow-[0_-4px_16px_rgba(0,0,0,0.02)] flex justify-around items-center h-[72px] px-3 z-30 shrink-0">
          
          {/* TAB ITEM: TODAY */}
          <button 
            onClick={() => {
              setCurrentTab('today');
              setStatusFilter('all');
            }}
            className={`flex flex-col items-center justify-center gap-1 w-16 h-12 transition-all rounded-xl cursor-pointer ${
              currentTab === 'today' 
                ? 'text-indigo-600 scale-102 font-bold' 
                : 'text-slate-400 hover:text-slate-600'
            }`}
            id="tab-today-selector"
          >
            <Pill className={`w-5.5 h-5.5 ${currentTab === 'today' ? 'stroke-[2.5px] text-indigo-600' : 'text-slate-400'}`} />
            <span className="text-[10px] uppercase tracking-wider font-extrabold font-headline-sm">Today</span>
          </button>

          {/* TAB ITEM: SCHEDULE */}
          <button 
            onClick={() => setCurrentTab('schedule')}
            className={`flex flex-col items-center justify-center gap-1 w-16 h-12 transition-all rounded-xl cursor-pointer ${
              currentTab === 'schedule' 
                ? 'text-indigo-600 scale-102 font-bold' 
                : 'text-slate-400 hover:text-slate-600'
            }`}
            id="tab-schedule-selector"
          >
            <Calendar className={`w-5.5 h-5.5 ${currentTab === 'schedule' ? 'stroke-[2.5px]' : ''}`} />
            <span className="text-[10px] uppercase tracking-wider font-extrabold">Alarms</span>
          </button>

          {/* TAB ITEM: HISTORY */}
          <button 
            onClick={() => setCurrentTab('history')}
            className={`flex flex-col items-center justify-center gap-1 w-16 h-12 transition-all rounded-xl cursor-pointer ${
              currentTab === 'history' 
                ? 'text-indigo-600 scale-102 font-bold' 
                : 'text-slate-400 hover:text-slate-600'
            }`}
            id="tab-history-selector"
          >
            <History className={`w-5.5 h-5.5 ${currentTab === 'history' ? 'stroke-[2.5px]' : ''}`} />
            <span className="text-[10px] uppercase tracking-wider font-extrabold">History</span>
          </button>

          {/* TAB ITEM: SETTINGS */}
          <button 
            onClick={() => setCurrentTab('settings')}
            className={`flex flex-col items-center justify-center gap-1 w-16 h-12 transition-all rounded-xl cursor-pointer ${
              currentTab === 'settings' 
                ? 'text-indigo-600 scale-102 font-bold' 
                : 'text-slate-400 hover:text-slate-605'
            }`}
            id="tab-settings-selector"
          >
            <Settings className={`w-5.5 h-5.5 ${currentTab === 'settings' ? 'stroke-[2.5px]' : ''}`} />
            <span className="text-[10px] uppercase tracking-wider font-extrabold">Config</span>
          </button>

        </nav>

      </div>
    </div>
  );
}
