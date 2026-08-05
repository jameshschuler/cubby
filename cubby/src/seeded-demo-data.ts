import { AppData, Goal, ProgressEvent } from './types';

const DEMO_GOAL_IDS = {
  emergency: 'demo-emergency-fund',
  retirement: 'demo-retirement',
  house: 'demo-house-down-payment',
} as const;

const DEMO_GOALS: Goal[] = [
  {
    id: DEMO_GOAL_IDS.emergency,
    name: 'Emergency Fund',
    nickname: 'Cash Buffer',
    origin: 'High Yield Savings',
    category: 'short-term savings',
    accountType: 'hysa',
    cadence: 'monthly',
    isRecurring: true,
    recurringState: 'month',
    targetAmount: 20000,
    createdAt: '2025-01-01T12:00:00.000Z',
    updatedAt: '2026-08-01T12:00:00.000Z',
  },
  {
    id: DEMO_GOAL_IDS.retirement,
    name: 'Retirement',
    nickname: '401k + IRA',
    origin: 'Employer Plan',
    category: 'investing',
    accountType: '401k',
    cadence: 'monthly',
    isRecurring: true,
    recurringState: 'month',
    targetAmount: 150000,
    createdAt: '2025-01-01T12:00:00.000Z',
    updatedAt: '2026-08-01T12:00:00.000Z',
  },
  {
    id: DEMO_GOAL_IDS.house,
    name: 'House Down Payment',
    nickname: 'Future Home',
    origin: 'Brokerage',
    category: 'long-term savings',
    accountType: 'individual brokerage',
    cadence: 'monthly',
    isRecurring: true,
    recurringState: 'month',
    targetAmount: 100000,
    createdAt: '2025-01-01T12:00:00.000Z',
    updatedAt: '2026-08-01T12:00:00.000Z',
  },
];

const monthlyTotals2025 = [2600, 2800, 3000, 2700, 2900, 3000, 2850, 3100, 2800, 2950, 2750, 3050];
const monthlyTotals2026 = [2700, 2800, 2900, 3000, 2950, 3050, 3100, 3150];

function createEvent(id: string, goalId: string, amount: number, date: string): ProgressEvent {
  return {
    id,
    goalId,
    amount,
    eventDate: date,
    source: 'manual',
    createdAt: date,
  };
}

function splitMonthlyTotal(total: number): [number, number, number] {
  const emergency = Math.round((total * 0.28) / 10) * 10;
  const retirement = Math.round((total * 0.36) / 10) * 10;
  const house = total - emergency - retirement;
  return [emergency, retirement, house];
}

function buildYearEvents(year: number, totals: number[]): ProgressEvent[] {
  return totals.flatMap((total, index) => {
    const month = index + 1;
    const eventDate = `${year}-${String(month).padStart(2, '0')}-01T12:00:00.000Z`;
    const [emergency, retirement, house] = splitMonthlyTotal(total);

    return [
      createEvent(`demo-${year}-${month}-1`, DEMO_GOAL_IDS.emergency, emergency, eventDate),
      createEvent(`demo-${year}-${month}-2`, DEMO_GOAL_IDS.retirement, retirement, eventDate),
      createEvent(`demo-${year}-${month}-3`, DEMO_GOAL_IDS.house, house, eventDate),
    ];
  });
}

export function createSeededDemoData(): AppData {
  return {
    goals: DEMO_GOALS,
    progressEvents: [
      ...buildYearEvents(2025, monthlyTotals2025),
      ...buildYearEvents(2026, monthlyTotals2026),
    ],
    settings: {
      defaultView: 'month',
      targetSavingsRate: 0.25,
      savingsTargetMode: 'rate',
      yearlySavingsGoalAmount: 50000,
      incomeAmount: 200000,
      incomeFrequency: 'yearly',
      incomeIsGross: true,
      hasCompletedOnboarding: true,
      useSeededDemoData: true,
    },
  };
}
