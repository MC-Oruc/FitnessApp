import rawExercises from './exercises.json';

export type ExerciseTarget = {
  muscle: string;
  zone: string;
  activation: string;
};

export type Exercise = {
  id: number;
  name: string;
  equipment: string;
  cns_fatigue: 'Low' | 'Moderate' | 'High' | 'Very High';
  targets: ExerciseTarget[];
};

// Basit, okunabilir veri katmanı: ileride ihtiyaç olursa burada genişletilebilir.
export const exercises = rawExercises as Exercise[];

export function filterExercisesByMuscleKeyword(
  list: Exercise[],
  keyword?: string
): Exercise[] {
  if (!keyword) return list;
  const lower = keyword.toLowerCase();
  return list.filter((ex) =>
    ex.targets?.some(
      (t) =>
        t.muscle.toLowerCase().includes(lower) ||
        t.zone.toLowerCase().includes(lower)
    )
  );
}

export function getAllEquipments(list: Exercise[] = exercises): string[] {
  const set = new Set<string>();
  list.forEach((ex) => {
    if (ex.equipment) set.add(ex.equipment);
  });
  return Array.from(set).sort();
}

export function getAllMuscles(list: Exercise[] = exercises): string[] {
  const set = new Set<string>();
  list.forEach((ex) => {
    ex.targets?.forEach((t) => {
      const baseMuscle = t.muscle.split('(')[0].trim();
      if (baseMuscle) set.add(baseMuscle);
    });
  });
  return Array.from(set).sort();
}

// İki kademeli kas filtresi için kategori yapısı
export type MuscleCategory = {
  id: string;
  label: string;
  keywords: string[]; // Bu kategoriye ait kasları bulmak için kullanılan anahtar kelimeler
};

export const MUSCLE_CATEGORIES: MuscleCategory[] = [
  {
    id: 'chest',
    label: 'Göğüs',
    // Chest (Pectoralis)
    keywords: ['Chest', 'Pectoralis', 'Pectoralis Major'],
  },
  {
    id: 'back',
    label: 'Sırt',
    // Back (Lats, Traps, Erector Spinae, Teres Major)
    keywords: [
      'Back',
      'Latissimus Dorsi',
      'Lats',
      'Trapezius',
      'Erector Spinae',
      'Teres Major',
    ],
  },
  {
    id: 'shoulders',
    label: 'Omuz',
    // Shoulder (Deltoid)
    keywords: ['Shoulder', 'Deltoid'],
  },
  {
    id: 'biceps',
    label: 'Biseps',
    keywords: ['Biceps'],
  },
  {
    id: 'triceps',
    label: 'Triseps',
    keywords: ['Triceps'],
  },
  {
    id: 'forearms',
    label: 'Ön Kol',
    keywords: ['Forearms', 'Forearm', 'Flexors', 'Extensors', 'Pronator', 'Supinator'],
  },
  {
    id: 'quadriceps',
    label: 'Quadriceps',
    keywords: ['Quadriceps'],
  },
  {
    id: 'hamstrings',
    label: 'Hamstrings',
    keywords: ['Hamstrings'],
  },
  {
    id: 'glutes',
    label: 'Kalça',
    keywords: ['Glutes', 'Gluteus'],
  },
  {
    id: 'calves',
    label: 'Baldır',
    keywords: ['Calves', 'Gastrocnemius', 'Soleus', 'Tibialis Anterior'],
  },
  {
    id: 'abs',
    label: 'Karın',
    keywords: ['Abs', 'Rectus Abdominis', 'Obliques'],
  },
];

// Hiyerarşik kas yapısı: bazı kategorilerde (örneğin sırt ve karın)
// önce ana kas (Lats / Traps / Erector Spinae, Rectus Abdominis / Obliques),
// sonra daha ince bölge (Upper / Lower vb.) seçebilmek için kullanılır.
export type MuscleHierarchy = {
  mainMuscle: string; // UI'da görünen ana kas adı (ör. 'Lats', 'Traps')
  zones: string[]; // Bu ana kasa ait t.zone değerleri
};

export const HIERARCHY_BY_CATEGORY: Record<string, MuscleHierarchy[]> = {
  back: [
    {
      mainMuscle: 'Lats',
      zones: ['Upper Lats & Teres Major', 'Lower Lats'],
    },
    {
      mainMuscle: 'Traps',
      zones: ['Upper Trap', 'Middle Trap', 'Lower Trap'],
    },
    {
      mainMuscle: 'Erector Spinae',
      zones: ['Erector Spinae'],
    },
  ],
  abs: [
    {
      mainMuscle: 'Rectus Abdominis',
      zones: ['Upper Abs', 'Lower Abs'],
    },
    {
      mainMuscle: 'Obliques',
      zones: ['Obliques'],
    },
  ],
};

// Bir kategoriye ait tüm kasları egzersiz verisinden çıkar
export function getMusclesInCategory(
  categoryId: string,
  list: Exercise[] = exercises
): string[] {
  const category = MUSCLE_CATEGORIES.find((c) => c.id === categoryId);
  if (!category) return [];

  const set = new Set<string>();
  list.forEach((ex) => {
    ex.targets?.forEach((t) => {
      // Yeni veri modelinde: kas grubu t.muscle, spesifik kas ise t.zone
      const specific = t.zone.trim();
      const matchesCategory = category.keywords.some((kw) =>
        t.muscle.toLowerCase().includes(kw.toLowerCase())
      );
      if (matchesCategory && specific) {
        set.add(specific);
      }
    });
  });
  return Array.from(set).sort();
}

// Kategoriye göre egzersiz filtrele
export function filterExercisesByCategory(
  list: Exercise[],
  categoryId: string
): Exercise[] {
  const category = MUSCLE_CATEGORIES.find((c) => c.id === categoryId);
  if (!category) return list;

  return list.filter((ex) =>
    ex.targets?.some((t) =>
      category.keywords.some((kw) =>
        t.muscle.toLowerCase().includes(kw.toLowerCase())
      )
    )
  );
}
