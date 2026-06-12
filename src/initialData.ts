import { Medication, HistoryItem } from './types';

export const INITIAL_MEDICATIONS: Medication[] = [
  {
    id: 'aspirin',
    name: 'Aspirin',
    time: '08:00',
    timeFormat: '08:00 AM',
    frequency: 'Daily',
    dosage: '325mg',
    status: 'Taken',
    iconType: 'pill'
  },
  {
    id: 'lisinopril',
    name: 'Lisinopril',
    time: '08:30',
    timeFormat: '08:30 AM',
    frequency: 'Daily',
    dosage: '10mg • 1 tablet',
    status: 'Taken',
    iconType: 'pill'
  },
  {
    id: 'vitamin-d3',
    name: 'Vitamin D3',
    time: '12:30',
    timeFormat: '12:30 PM',
    frequency: 'Daily',
    dosage: '2000 IU',
    status: 'Pending',
    iconType: 'medication'
  },
  {
    id: 'eye-drops',
    name: 'Eye Drops',
    time: '16:00',
    timeFormat: '04:00 PM',
    frequency: 'As needed',
    dosage: '1 drop • each eye',
    status: 'Missed',
    iconType: 'droplet'
  },
  {
    id: 'metformin',
    name: 'Metformin',
    time: '20:00',
    timeFormat: '08:00 PM',
    frequency: 'Daily',
    dosage: '500mg',
    status: 'Pending',
    iconType: 'medication'
  }
];

export const INITIAL_HISTORY: HistoryItem[] = [
  {
    id: 'hist-1',
    medicationId: 'aspirin',
    medicationName: 'Aspirin',
    date: '2026-06-11',
    time: '08:02 AM',
    status: 'Taken',
    dosage: '325mg'
  },
  {
    id: 'hist-2',
    medicationId: 'lisinopril',
    medicationName: 'Lisinopril',
    date: '2026-06-11',
    time: '08:31 AM',
    status: 'Taken',
    dosage: '10mg • 1 tablet'
  },
  {
    id: 'hist-3',
    medicationId: 'vitamin-d3',
    medicationName: 'Vitamin D3',
    date: '2026-06-11',
    time: '12:35 PM',
    status: 'Taken',
    dosage: '2000 IU'
  },
  {
    id: 'hist-4',
    medicationId: 'metformin',
    medicationName: 'Metformin',
    date: '2026-06-11',
    time: '08:05 PM',
    status: 'Taken',
    dosage: '500mg'
  }
];

export const HEALTH_TIPS = [
  "Consistency is key to effectiveness.",
  "Always take antibiotics at the exact times prescribed for complete therapy.",
  "Avoid taking iron supplements with milk, calcium, or antacids.",
  "Keep your medications away from direct sunlight and humid bathrooms.",
  "Check with your doctor or pharmacist about potential food-drug interactions."
];
