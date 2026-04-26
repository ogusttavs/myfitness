/**
 * Protocolo Gustavo — Modo Caverna
 * Fonte canônica: protocoloGustavo_modo_caverna.pdf
 * (será migrado pro Supabase quando o backend estiver pronto)
 */

export interface AthleteProfile {
  name: string;
  age: number;
  weightKg: number;
  heightM: number;
  level: string;
  goal: string;
  weeklyFrequency: number;
}

export interface Macros {
  kcal: number;
  proteinG: number;
  carbG: number;
  fatG: number;
}

export interface MealItem {
  description: string;
  quantity?: string;
  /** Calorias estimadas (kcal). Valores médios — referência, não medição precisa. */
  kcal: number;
  proteinG?: number;
  carbG?: number;
  fatG?: number;
}

export interface Meal {
  ord: number;
  name: string;
  time?: string;
  items: MealItem[];
  notes?: string;
}

export interface Exercise {
  name: string;
  sets: number;
  reps: string;
  restSeconds: number;
}

export interface WorkoutDay {
  index: number;
  code: 'PUSH' | 'PULL' | 'LEGS' | 'UPPER' | 'LOWER';
  name: string;
  focus: string;
  exercises: Exercise[];
  cardioMinutes: number;
  cardioOptions: string;
}

export interface Observation {
  topic: string;
  text: string;
}

// ─── PERFIL ────────────────────────────────────────────────────

export const profile: AthleteProfile = {
  name: 'Gustavo',
  age: 22,
  weightKg: 80,
  heightM: 1.75,
  level: 'Avançado',
  goal: 'Hipertrofia + Perda de Gordura',
  weeklyFrequency: 5,
};

// ─── DIETA ─────────────────────────────────────────────────────

export const macrosTarget: Macros = {
  kcal: 1800,
  proteinG: 160,
  carbG: 215,
  fatG: 67,
};

export const meals: Meal[] = [
  {
    ord: 1,
    name: 'Café da Manhã',
    time: '07:00',
    items: [
      { description: '3 ovos mexidos ou estrelados', kcal: 215, proteinG: 18, carbG: 1, fatG: 15 },
      { description: '2 fatias de pão integral', kcal: 160, proteinG: 8, carbG: 28, fatG: 3 },
      { description: '1 fruta (banana ou maçã)', kcal: 90, proteinG: 1, carbG: 23, fatG: 0 },
      { description: 'Café sem açúcar', kcal: 5, proteinG: 0, carbG: 0, fatG: 0 },
    ],
  },
  {
    ord: 2,
    name: 'Lanche',
    time: '10:00',
    items: [
      { description: '170g de iogurte grego natural', kcal: 170, proteinG: 17, carbG: 6, fatG: 8 },
      { description: '25g de aveia', kcal: 95, proteinG: 4, carbG: 17, fatG: 2 },
      { description: '1 fruta pequena', kcal: 60, proteinG: 1, carbG: 15, fatG: 0 },
    ],
  },
  {
    ord: 3,
    name: 'Almoço',
    time: '13:00',
    items: [
      { description: '150g de frango grelhado ou carne magra', kcal: 240, proteinG: 45, carbG: 0, fatG: 5 },
      { description: '3 colheres de arroz branco ou integral', kcal: 155, proteinG: 3, carbG: 33, fatG: 0 },
      { description: '1 concha de feijão', kcal: 75, proteinG: 5, carbG: 13, fatG: 0 },
      { description: 'Salada à vontade (folhas, tomate, pepino)', kcal: 30, proteinG: 1, carbG: 5, fatG: 0 },
    ],
  },
  {
    ord: 4,
    name: 'Pré-Treino',
    time: '16:00',
    notes: '1h antes do treino',
    items: [
      { description: '1 batata-doce média (120g)', kcal: 105, proteinG: 2, carbG: 24, fatG: 0 },
      { description: '80g de frango ou atum', kcal: 120, proteinG: 22, carbG: 0, fatG: 3 },
    ],
  },
  {
    ord: 5,
    name: 'Pós-Treino',
    time: '19:00',
    notes: 'Logo após o treino',
    items: [
      { description: '30g de whey com água ou leite desnatado', kcal: 120, proteinG: 24, carbG: 2, fatG: 1 },
      { description: '1 banana pequena', kcal: 75, proteinG: 1, carbG: 19, fatG: 0 },
      { description: 'Sem whey: substituir por 150g de frango ou 3 ovos', kcal: 0 },
    ],
  },
  {
    ord: 6,
    name: 'Jantar',
    time: '22:00',
    items: [
      { description: '150g de peixe, frango ou carne magra', kcal: 220, proteinG: 38, carbG: 0, fatG: 6 },
      { description: '2 colheres de arroz ou batata-doce', kcal: 100, proteinG: 2, carbG: 22, fatG: 0 },
      { description: 'Legumes refogados ou salada', kcal: 50, proteinG: 2, carbG: 8, fatG: 1 },
    ],
  },
];

// ─── TREINO ────────────────────────────────────────────────────

export const workoutDays: WorkoutDay[] = [
  {
    index: 0,
    code: 'PUSH',
    name: 'Dia 1 — Push',
    focus: 'Peito, Ombro e Tríceps',
    cardioMinutes: 20,
    cardioOptions: 'Bike ou esteira',
    exercises: [
      { name: 'Supino reto com barra', sets: 4, reps: '8-10', restSeconds: 90 },
      { name: 'Supino inclinado com haltere', sets: 3, reps: '10-12', restSeconds: 75 },
      { name: 'Desenvolvimento com halteres', sets: 3, reps: '10-12', restSeconds: 75 },
      { name: 'Elevação lateral', sets: 3, reps: '12-15', restSeconds: 60 },
      { name: 'Tríceps corda (polia)', sets: 3, reps: '12', restSeconds: 60 },
      { name: 'Tríceps testa', sets: 3, reps: '10', restSeconds: 60 },
    ],
  },
  {
    index: 1,
    code: 'PULL',
    name: 'Dia 2 — Pull',
    focus: 'Costas e Bíceps',
    cardioMinutes: 20,
    cardioOptions: 'Bike ou esteira',
    exercises: [
      { name: 'Barra fixa (pegada pronada)', sets: 4, reps: '6-10', restSeconds: 90 },
      { name: 'Remada curvada com barra', sets: 4, reps: '8-10', restSeconds: 90 },
      { name: 'Puxada frente (polia alta)', sets: 3, reps: '10-12', restSeconds: 75 },
      { name: 'Remada unilateral com haltere', sets: 3, reps: '10-12', restSeconds: 60 },
      { name: 'Rosca direta com barra', sets: 3, reps: '10', restSeconds: 60 },
      { name: 'Rosca martelo', sets: 3, reps: '12', restSeconds: 60 },
    ],
  },
  {
    index: 2,
    code: 'LEGS',
    name: 'Dia 3 — Legs',
    focus: 'Pernas Completo',
    cardioMinutes: 20,
    cardioOptions: 'Bike ou esteira',
    exercises: [
      { name: 'Agachamento livre', sets: 4, reps: '8-10', restSeconds: 90 },
      { name: 'Leg press 45 graus', sets: 3, reps: '10-12', restSeconds: 90 },
      { name: 'Cadeira extensora', sets: 3, reps: '12-15', restSeconds: 60 },
      { name: 'Mesa flexora', sets: 3, reps: '12-15', restSeconds: 60 },
      { name: 'Stiff com barra', sets: 3, reps: '10-12', restSeconds: 75 },
      { name: 'Panturrilha em pé', sets: 3, reps: '15-20', restSeconds: 60 },
    ],
  },
  {
    index: 3,
    code: 'UPPER',
    name: 'Dia 4 — Upper',
    focus: 'Superior Completo',
    cardioMinutes: 20,
    cardioOptions: 'Bike ou esteira',
    exercises: [
      { name: 'Supino inclinado com barra', sets: 4, reps: '8-10', restSeconds: 90 },
      { name: 'Remada baixa (polia)', sets: 3, reps: '10-12', restSeconds: 75 },
      { name: 'Desenvolvimento militar', sets: 3, reps: '10', restSeconds: 75 },
      { name: 'Crucifixo com haltere', sets: 3, reps: '12', restSeconds: 60 },
      { name: 'Elevação lateral', sets: 2, reps: '12-15', restSeconds: 60 },
      { name: 'Rosca direta', sets: 3, reps: '10', restSeconds: 60 },
      { name: 'Tríceps francês', sets: 3, reps: '10', restSeconds: 60 },
    ],
  },
  {
    index: 4,
    code: 'LOWER',
    name: 'Dia 5 — Lower',
    focus: 'Inferior e Core',
    cardioMinutes: 20,
    cardioOptions: 'Bike ou esteira',
    exercises: [
      { name: 'Agachamento sumo', sets: 4, reps: '10-12', restSeconds: 90 },
      { name: 'Avanço com halteres', sets: 3, reps: '12 cada', restSeconds: 75 },
      { name: 'Cadeira extensora', sets: 3, reps: '15', restSeconds: 60 },
      { name: 'Stiff unilateral', sets: 3, reps: '12', restSeconds: 60 },
      { name: 'Elevação de quadril', sets: 3, reps: '15', restSeconds: 60 },
      { name: 'Prancha', sets: 3, reps: '40-60s', restSeconds: 60 },
      { name: 'Abdominal infra', sets: 3, reps: '15-20', restSeconds: 60 },
    ],
  },
];

// ─── SUPLEMENTAÇÃO ─────────────────────────────────────────────

export type SupplementSchedule =
  | { kind: 'daily'; period: 'morning' | 'afternoon' | 'evening' | 'night' | 'any' }
  | { kind: 'weekly'; weekday: 0 | 1 | 2 | 3 | 4 | 5 | 6; period: 'morning' | 'evening' | 'any' };

export interface Supplement {
  id: string;
  name: string;
  dose: string;
  notes?: string;
  schedule: SupplementSchedule;
}

export const supplements: Supplement[] = [
  {
    id: 'creatina',
    name: 'Creatina',
    dose: '3-5g',
    notes: 'Pode ser tomada com qualquer refeição',
    schedule: { kind: 'daily', period: 'any' },
  },
  {
    id: 'vitamina-d',
    name: 'Vitamina D',
    dose: '1 cápsula',
    schedule: { kind: 'daily', period: 'morning' },
  },
  {
    id: 'biotina',
    name: 'Biotina',
    dose: '1 cápsula',
    schedule: { kind: 'daily', period: 'morning' },
  },
  {
    id: 'minoxidil',
    name: 'Minoxidil',
    dose: 'Aplicar conforme orientação',
    notes: 'Antes de dormir',
    schedule: { kind: 'daily', period: 'night' },
  },
  {
    id: 'durateston',
    name: 'Durateston',
    dose: 'Conforme protocolo',
    notes: 'Toda quarta-feira',
    schedule: { kind: 'weekly', weekday: 3, period: 'any' }, // 3 = quarta
  },
];

const WEEKDAY_NAMES = ['Domingo', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado'] as const;

/** Retorna apenas os suplementos do dia atual (ou de uma data específica). */
export function supplementsForDate(date = new Date()): Supplement[] {
  const dow = date.getDay();
  return supplements.filter((s) => {
    if (s.schedule.kind === 'daily') return true;
    return s.schedule.weekday === dow;
  });
}

export function supplementWeekdayLabel(s: Supplement): string {
  if (s.schedule.kind === 'weekly') return WEEKDAY_NAMES[s.schedule.weekday];
  return 'Diário';
}

// ─── ÁGUA ──────────────────────────────────────────────────────

export const WATER_TARGET_ML = 3000;
export const WATER_CUP_ML = 250; // 12 copos = 3L

// ─── OBSERVAÇÕES ───────────────────────────────────────────────

export const observations: Observation[] = [
  {
    topic: 'Progressão de carga',
    text: 'Tente aumentar a carga ou o número de repetições a cada semana para garantir sobrecarga progressiva.',
  },
  {
    topic: 'Cardio',
    text: 'Pode ser feito antes ou depois da musculação conforme preferência. Mantenha intensidade moderada.',
  },
  {
    topic: 'Hidratação',
    text: 'Mínimo de 3 litros de água por dia, especialmente nos dias de treino.',
  },
  {
    topic: 'Sono',
    text: 'Dormir entre 7 e 8 horas por noite é fundamental para a recuperação muscular e produção hormonal.',
  },
  {
    topic: 'Reavaliação',
    text: 'Reavaliar peso e medidas a cada 4 semanas para ajustar as calorias e o treino conforme necessário.',
  },
  {
    topic: 'Suplementação',
    text: 'O uso de whey é opcional. Priorize sempre a alimentação completa. Creatina pode ser considerada.',
  },
];

// ─── HELPERS ───────────────────────────────────────────────────

/**
 * Retorna o dia de treino baseado no dia da semana atual.
 * Seg-Sex = treino 1-5, Sáb/Dom = descanso (retorna null).
 */
export function getTodayWorkout(date = new Date()): WorkoutDay | null {
  const dow = date.getDay(); // 0=dom, 1=seg, ..., 6=sáb
  if (dow === 0 || dow === 6) return null;
  return workoutDays[dow - 1] ?? null;
}

/**
 * Retorna a próxima refeição prevista a partir do horário atual.
 * Se já passou de todas, retorna null (último jantar).
 */
export function getNextMeal(date = new Date()): Meal | null {
  const nowMinutes = date.getHours() * 60 + date.getMinutes();
  for (const meal of meals) {
    if (!meal.time) continue;
    const [h, m] = meal.time.split(':').map(Number);
    const mealMinutes = (h ?? 0) * 60 + (m ?? 0);
    if (mealMinutes > nowMinutes) return meal;
  }
  return null;
}

export function totalSetsInDay(day: WorkoutDay): number {
  return day.exercises.reduce((sum, e) => sum + e.sets, 0);
}

export function mealKcal(meal: Meal): number {
  return meal.items.reduce((sum, it) => sum + (it.kcal || 0), 0);
}

export function mealMacros(meal: Meal): Macros {
  return meal.items.reduce(
    (acc, it) => ({
      kcal: acc.kcal + (it.kcal || 0),
      proteinG: acc.proteinG + (it.proteinG || 0),
      carbG: acc.carbG + (it.carbG || 0),
      fatG: acc.fatG + (it.fatG || 0),
    }),
    { kcal: 0, proteinG: 0, carbG: 0, fatG: 0 },
  );
}

export function estimatedDurationMinutes(day: WorkoutDay): number {
  // ~60s por série + descanso médio + 20min cardio
  const totalSets = totalSetsInDay(day);
  const avgRest = day.exercises.reduce((s, e) => s + e.restSeconds, 0) / day.exercises.length;
  const muscleMin = (totalSets * (45 + avgRest)) / 60;
  return Math.round(muscleMin + day.cardioMinutes);
}
