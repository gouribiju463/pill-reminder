export interface Medication {
  id: string;
  name: string;
  time: string; // HH:MM, e.g. "08:00"
  timeFormat: string; // e.g. "08:00 AM", "12:30 PM"
  frequency: 'Daily' | 'Weekly' | 'As needed';
  dosage: string; // optional, e.g. "1 pill", "500mg"
  status: 'Pending' | 'Taken' | 'Skipped' | 'Missed';
  iconType: 'pill' | 'medication' | 'droplet' | 'liquid'; // map to lucide icons
  dosageNotes?: string;
}

export interface DayProgress {
  taken: number;
  total: number;
  percentage: number;
}

export interface HistoryItem {
  id: string;
  medicationId: string;
  medicationName: string;
  date: string; // YYYY-MM-DD
  time: string; // "12:35 PM" when taken
  status: 'Taken' | 'Skipped';
  dosage: string;
}

export interface Streak {
  currentStreak: number;
  lastTakenDate: string; // YYYY-MM-DD
}
