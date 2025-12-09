import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  FlatList,
  Pressable,
  ScrollView,
  Modal,
} from 'react-native';
import DraggableBottomSheet from '../components/DraggableBottomSheet';
import { IconButton, Pill } from '../components/ui';
import {
  exercises,
  filterExercisesByMuscleKeyword,
  filterExercisesByCategory,
  getAllEquipments,
  getMusclesInCategory,
  MUSCLE_CATEGORIES,
  HIERARCHY_BY_CATEGORY,
  type Exercise,
} from '../data/exercises';
import ExerciseCard from '../components/ExerciseCard';
import type { RootTabParamList } from '../navigation/MainTabs';
import type { RouteProp } from '@react-navigation/native';
import { useThemedStyles } from '../theme/styles';
import { useTheme } from '../theme/ThemeProvider';
import type { ColorTokens } from '../theme/tokens';
import { useTranslation } from '../i18n/I18nProvider';

const CNS_ORDER: Exercise['cns_fatigue'][] = [
  'Low',
  'Moderate',
  'High',
  'Very High',
];

const ALL_EQUIPMENT = 'all';
const SHOULDER_ZONE_VALUES = [
  'Front Shoulder',
  'Lateral Shoulder',
  'Rear Shoulder',
] as const;

// Anatomi ekranından gelen kas anahtar kelimesini,
// mevcut kas kategorisi yapısına eşle.
function findCategoryIdForKeyword(keyword?: string): string | null {
  if (!keyword) return null;
  const lower = keyword.toLowerCase();

  // 1) Önce kategori tanımlarındaki anahtar kelimelerle eşle
  const matchFromCategory = MUSCLE_CATEGORIES.find((cat) =>
    cat.keywords.some((kw) => {
      const kwLower = kw.toLowerCase();
      // "Pectoralis" <-> "Pectoralis Major" gibi durumlar için iki yönlü includes kontrolü
      return kwLower.includes(lower) || lower.includes(kwLower);
    })
  );

  if (matchFromCategory) {
    return matchFromCategory.id;
  }

  // 2) Bulunamazsa, egzersiz verisindeki "zone" alanlarından kas grubunu tahmin et
  // Örn: "Upper Chest", "Rectus Femoris", "Hip Extensors" gibi ayrıntılı seçimler
  for (const ex of exercises) {
    for (const t of ex.targets ?? []) {
      const zoneLower = t.zone.toLowerCase();
      if (zoneLower.includes(lower) || lower.includes(zoneLower)) {
        const muscleLower = t.muscle.toLowerCase();

        const matchFromMuscle = MUSCLE_CATEGORIES.find((cat) =>
          cat.keywords.some((kw) => {
            const kwLower = kw.toLowerCase();
            return (
              muscleLower.includes(kwLower) || kwLower.includes(muscleLower)
            );
          })
        );

        if (matchFromMuscle) {
          return matchFromMuscle.id;
        }
      }
    }
  }

  return null;
}

// Belirli bir kas anahtar kelimesini, ilgili kategorideki "Spesifik Kas"
// filtresine karşılık gelecek etikete dönüştür (varsa).
function findSpecificMuscleForKeyword(
  keyword: string,
  categoryId: string
): string | null {
  const lower = keyword.toLowerCase();
  const category = MUSCLE_CATEGORIES.find((c) => c.id === categoryId);
  if (!category) return null;

  // Kas grubu adına (Chest, Back, Biceps, vb.) dokunulduysa sadece kategori filtresi yeterli
  const simpleBaseKeywords = [
    'chest',
    'back',
    'shoulder',
    'biceps',
    'triceps',
    'forearms',
    'forearm',
    'quadriceps',
    'hamstrings',
    'glutes',
    'calves',
    'abs',
    'rectus abdominis',
    'obliques',
  ];
  if (simpleBaseKeywords.includes(lower)) {
    return null;
  }

  // Omuz için özel 3'lü ayrım: ön / yan / arka omuz
  if (categoryId === 'shoulders') {
    if (lower.includes('posterior') || lower.includes('rear'))
      return 'Rear Shoulder';
    if (lower.includes('anterior') || lower.includes('front'))
      return 'Front Shoulder';
    if (lower.includes('lateral')) return 'Lateral Shoulder';
    // Sadece "Deltoid" / "Shoulder" seçildiyse sadece kategori filtresi uygulansın
    return null;
  }

  // 1) Ayrıntılı anatomi seçimleri için önce zone adına bak:
  //    Upper Chest, Lower Lats, Hip Extensors, Rectus Femoris, vb.
  for (const ex of exercises) {
    for (const t of ex.targets ?? []) {
      const muscleLower = t.muscle.toLowerCase();
      const zoneLower = t.zone.toLowerCase();

      // Önce bu target gerçekten ilgili kategoriye mi ait kontrol et
      const matchesCategory = category.keywords.some((kw) => {
        const kwLower = kw.toLowerCase();
        return (
          muscleLower.includes(kwLower) || kwLower.includes(muscleLower)
        );
      });
      if (!matchesCategory) continue;

      // Anatomi'den gelen anahtar kelime, zone ismiyle eşleşiyor mu?
      if (zoneLower.includes(lower) || lower.includes(zoneLower)) {
        // Spesifik kas filtresinde zone ismini göstermek istiyoruz
        const specific = t.zone.trim();
        if (specific) return specific;
      }
    }
  }

  // 2) Zone bazlı bir eşleşme bulunamazsa, kas adı tabanlı eski fallback
  for (const ex of exercises) {
    for (const t of ex.targets ?? []) {
      const muscleLower = t.muscle.toLowerCase();

      const matchesCategory = category.keywords.some((kw) =>
        muscleLower.includes(kw.toLowerCase())
      );
      if (!matchesCategory) continue;

      if (muscleLower.includes(lower) || lower.includes(muscleLower)) {
        const baseMuscle = t.muscle.split('(')[0].trim();
        if (baseMuscle) return baseMuscle;
      }
    }
  }

  return null;
}

type Props = {
  route: RouteProp<RootTabParamList, 'Exercises'>;
};

type Styles = ReturnType<typeof createStyles>;

export default function ExerciseListScreen({ route }: Props) {
  const { t } = useTranslation();
  const themeStyles = useThemedStyles();
  const { colors } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const params = route?.params ?? {};
  const [search, setSearch] = useState('');
  const [equipment, setEquipment] = useState<string>(ALL_EQUIPMENT);
  const [muscleCategory, setMuscleCategory] = useState<string | null>(null);
  const [primaryMuscle, setPrimaryMuscle] = useState<string | null>(null);
  const [specificMuscle, setSpecificMuscle] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState<'default' | 'name' | 'cns'>('default');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  const [selected, setSelected] = useState<Exercise | null>(null);
  const [filterPopupOpen, setFilterPopupOpen] = useState(false);
  const [filterButtonPos, setFilterButtonPos] = useState({ x: 0, y: 0 });
  const filterButtonRef = useRef<View>(null);

  const muscleKeywordFromRoute = params.muscleKeyword;
  const shoulderZoneLabels = useMemo<
    Record<(typeof SHOULDER_ZONE_VALUES)[number], string>
  >(
    () => ({
      'Front Shoulder': t('exercises.shoulderZones.front'),
      'Lateral Shoulder': t('exercises.shoulderZones.lateral'),
      'Rear Shoulder': t('exercises.shoulderZones.rear'),
    }),
    [t],
  );
  const cnsLevelLabels = useMemo<Record<Exercise['cns_fatigue'], string>>(
    () => ({
      Low: t('exercises.cnsLevels.low'),
      Moderate: t('exercises.cnsLevels.moderate'),
      High: t('exercises.cnsLevels.high'),
      'Very High': t('exercises.cnsLevels.veryHigh'),
    }),
    [t],
  );
  const cnsLevelShortLabels = useMemo<
    Partial<Record<Exercise['cns_fatigue'], string>>
  >(
    () => ({
      'Very High': t('exercises.cnsLevelsShort.veryHigh'),
    }),
    [t],
  );

  // Anatomi ekranından gelen seçimi kas grubu / spesifik kas filtrelerine yansıt
  useEffect(() => {
    if (!muscleKeywordFromRoute) return;

    const categoryId = findCategoryIdForKeyword(muscleKeywordFromRoute);
    if (!categoryId) return;

    setMuscleCategory(categoryId);

    const specific = findSpecificMuscleForKeyword(
      muscleKeywordFromRoute,
      categoryId
    );
    setSpecificMuscle(specific);

    // Eğer bu kategori için hiyerarşi varsa, spesifik kasa göre ana kası da ayarla
    const hierarchy = HIERARCHY_BY_CATEGORY[categoryId];
    if (hierarchy && specific) {
      const group = hierarchy.find((g) => g.zones.includes(specific));
      if (group) {
        setPrimaryMuscle(group.mainMuscle);
        return;
      }
    }

    // Spesifik bulunamadıysa, ana kası anahtar kelimeye göre tahmin et (örn. "Lats", "Traps")
    if (hierarchy) {
      const lowerKey = muscleKeywordFromRoute.toLowerCase();
      const group = hierarchy.find((g) =>
        lowerKey.includes(g.mainMuscle.toLowerCase().split(' ')[0])
      );
      setPrimaryMuscle(group?.mainMuscle ?? null);
    } else {
      setPrimaryMuscle(null);
    }
  }, [muscleKeywordFromRoute]);

  const equipmentOptions = useMemo(
    () => [ALL_EQUIPMENT, ...getAllEquipments(exercises)],
    []
  );

  // Seçili kategoriye göre "tek kademeli" spesifik kasları getir
  // (hiyerarşik kategorilerde bu listeyi kullanmıyoruz)
  const subMuscleOptions = useMemo(() => {
    if (!muscleCategory) return [];
    // Hiyerarşik kategoriler (back, abs) için bu listeyi kullanmayacağız
    if (HIERARCHY_BY_CATEGORY[muscleCategory]) return [];
    // Omuz için özel 3'lü ayrım: ön / yan / arka omuz
    if (muscleCategory === 'shoulders') {
      return SHOULDER_ZONE_VALUES;
    }
    return getMusclesInCategory(muscleCategory);
  }, [muscleCategory]);

  const filtered = useMemo(() => {
    let list: Exercise[] = exercises;
    if (equipment !== ALL_EQUIPMENT) {
      list = list.filter((ex) => ex.equipment === equipment);
    }

    // 1. kademe: Kas grubu filtresi
    if (muscleCategory) {
      list = filterExercisesByCategory(list, muscleCategory);
    }

    const hierarchy = muscleCategory
      ? HIERARCHY_BY_CATEGORY[muscleCategory]
      : undefined;

    // 2. / 3. kademe: Hiyerarşik kaslar (Back: Lats / Traps / Erector; Abs: Rectus / Obliques)
    if (hierarchy && primaryMuscle) {
      const group = hierarchy.find((g) => g.mainMuscle === primaryMuscle);
      if (group) {
        const zonesToMatch =
          specificMuscle && group.zones.includes(specificMuscle)
            ? [specificMuscle]
            : group.zones;

        list = list.filter((ex) =>
          ex.targets?.some((t) => zonesToMatch.includes(t.zone)),
        );
      }
    } else if (specificMuscle) {
      // Hiyerarşik olmayan kategoriler için tek kademeli spesifik kas filtresi
      if (muscleCategory === 'shoulders') {
        // Omuz için: yeni veri modelinde kas grubu "Shoulder", spesifik kas t.zone
        if (specificMuscle === 'Front Shoulder') {
          list = list.filter((ex) =>
            ex.targets?.some(
              (t) => t.muscle === 'Shoulder' && t.zone === 'Front Shoulder',
            ),
          );
        } else if (specificMuscle === 'Lateral Shoulder') {
          list = list.filter((ex) =>
            ex.targets?.some(
              (t) => t.muscle === 'Shoulder' && t.zone === 'Lateral Shoulder',
            ),
          );
        } else if (specificMuscle === 'Rear Shoulder') {
          list = list.filter((ex) =>
            ex.targets?.some(
              (t) => t.muscle === 'Shoulder' && t.zone === 'Rear Shoulder',
            ),
          );
        }
      } else {
        list = filterExercisesByMuscleKeyword(list, specificMuscle);
      }
    }
    if (search.trim()) {
      const s = search.toLowerCase();
      list = list.filter((ex) => ex.name.toLowerCase().includes(s));
    }

    if (sortBy === 'default') {
      if (sortDirection === 'desc') {
        return [...list].reverse();
      }
      return list;
    }

    if (sortBy === 'name') {
      const sorted = [...list].sort((a, b) =>
        a.name.localeCompare(b.name),
      );
      return sortDirection === 'asc' ? sorted : sorted.reverse();
    }

    if (sortBy === 'cns') {
      const sorted = [...list].sort(
        (a, b) =>
          CNS_ORDER.indexOf(a.cns_fatigue) - CNS_ORDER.indexOf(b.cns_fatigue),
      );
      return sortDirection === 'asc' ? sorted : sorted.reverse();
    }

    return list;
  }, [search, equipment, muscleCategory, specificMuscle, sortBy, sortDirection]);

  return (
    <View style={themeStyles.screen}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={[themeStyles.headerLabel, styles.headerLabel]}>
          {t('exercises.headerLabel')}
        </Text>
        <Text style={themeStyles.titleMd}>{t('exercises.title')}</Text>
        <Text style={styles.resultCount}>
          {t('exercises.resultCount', { count: filtered.length })}
        </Text>
      </View>

      {/* Search + Filter Button */}
      <View style={styles.searchRow}>
      <View style={styles.searchContainer}>
        <View style={styles.searchIcon}>
          <Text style={styles.searchIconText}>⌕</Text>
        </View>
        <TextInput
          placeholder={t('exercises.searchPlaceholder')}
          placeholderTextColor={colors.textSubtle}
          style={styles.searchInput}
          value={search}
          onChangeText={setSearch}
        />
        {search.length > 0 && (
          <Pressable onPress={() => setSearch('')} style={styles.clearButton}>
            <Text style={styles.clearButtonText}>✕</Text>
          </Pressable>
        )}
        </View>
        <View ref={filterButtonRef} collapsable={false}>
          <IconButton
            icon="⧩"
            active={equipment !== ALL_EQUIPMENT || sortBy !== 'default'}
            onPress={() => {
              filterButtonRef.current?.measureInWindow((x, y, width, height) => {
                setFilterButtonPos({ x: x + width, y: y + height + 8 });
                setFilterPopupOpen(true);
              });
            }}
          />
        </View>
      </View>

      {/* Exercise List - Filtreler ListHeaderComponent olarak listeyle birlikte kayar */}
      <FlatList
        data={filtered}
        keyExtractor={(item) => String(item.id)}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        ListHeaderComponent={
          <View style={styles.filtersSection}>
            {/* Muscle Category filter (1. kademe) */}
            <View style={styles.filterGroup}>
              <Text style={styles.filterLabel}>{t('exercises.muscleGroup')}</Text>
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.pillScroll}
              >
                <Pill
                  label={t('common.all')}
                  active={muscleCategory === null}
                  onPress={() => {
                    setMuscleCategory(null);
                    setPrimaryMuscle(null);
                    setSpecificMuscle(null);
                  }}
                />
                {MUSCLE_CATEGORIES.map((cat) => (
                  <Pill
                    key={cat.id}
                    label={t(`exercises.muscleCategories.${cat.id}`)}
                    active={muscleCategory === cat.id}
                    onPress={() => {
                      setMuscleCategory(cat.id);
                      setPrimaryMuscle(null);
                      setSpecificMuscle(null);
                    }}
                  />
                ))}
              </ScrollView>
            </View>

            {/* 2. kademe: Ana Kas (Back: Lats / Traps / Erector, Abs: Rectus / Obliques) veya düz spesifik kas */}
            {muscleCategory && (
              <>
                {HIERARCHY_BY_CATEGORY[muscleCategory] ? (
                  <View style={styles.filterGroup}>
                    <Text style={styles.filterLabel}>{t('exercises.muscle')}</Text>
                    <ScrollView
                      horizontal
                      showsHorizontalScrollIndicator={false}
                      contentContainerStyle={styles.pillScroll}
                    >
                      <Pill
                        label={t('common.all')}
                        active={primaryMuscle === null}
                        onPress={() => {
                          setPrimaryMuscle(null);
                          setSpecificMuscle(null);
                        }}
                      />
                      {HIERARCHY_BY_CATEGORY[muscleCategory].map((group) => (
                        <Pill
                          key={group.mainMuscle}
                          label={group.mainMuscle}
                          active={primaryMuscle === group.mainMuscle}
                          onPress={() => {
                            setPrimaryMuscle(group.mainMuscle);
                            setSpecificMuscle(null);
                          }}
                        />
                      ))}
                    </ScrollView>
                  </View>
                ) : (
                  subMuscleOptions.length > 0 && (
                    <View style={styles.filterGroup}>
                      <Text style={styles.filterLabel}>
                        {t('exercises.specificMuscle')}
                      </Text>
                      <ScrollView
                        horizontal
                        showsHorizontalScrollIndicator={false}
                        contentContainerStyle={styles.pillScroll}
                      >
                        <Pill
                          label={t('common.all')}
                          active={specificMuscle === null}
                          onPress={() => setSpecificMuscle(null)}
                        />
                        {subMuscleOptions.map((muscle) => (
                          <Pill
                            key={muscle}
                            label={
                              muscleCategory === 'shoulders'
                                ? shoulderZoneLabels[muscle] ?? muscle
                                : muscle
                            }
                            active={specificMuscle === muscle}
                            onPress={() => setSpecificMuscle(muscle)}
                          />
                        ))}
                      </ScrollView>
                    </View>
                  )
                )}
              </>
            )}

            {/* 3. kademe: Lats / Traps / Rectus gibi ana kaslar için alt bölge seçimi */}
            {muscleCategory &&
              HIERARCHY_BY_CATEGORY[muscleCategory] &&
              primaryMuscle &&
              (() => {
                const groups = HIERARCHY_BY_CATEGORY[muscleCategory]!;
                const group = groups.find(
                  (g) => g.mainMuscle === primaryMuscle,
                );
                if (!group || group.zones.length <= 1) return null;
                return (
                  <View style={styles.filterGroup}>
                    <Text style={styles.filterLabel}>{t('exercises.subArea')}</Text>
                    <ScrollView
                      horizontal
                      showsHorizontalScrollIndicator={false}
                      contentContainerStyle={styles.pillScroll}
                    >
                      <Pill
                        label={t('common.all')}
                        active={specificMuscle === null}
                        onPress={() => setSpecificMuscle(null)}
                      />
                      {group.zones.map((zone) => (
                        <Pill
                          key={zone}
                          label={zone}
                          active={specificMuscle === zone}
                          onPress={() => setSpecificMuscle(zone)}
                        />
                      ))}
                    </ScrollView>
                  </View>
                );
              })()}
          </View>
        }
        renderItem={({ item }) => (
          <ExerciseCard
            exercise={item}
            onPress={() => setSelected(item)}
            cnsBadgeText={
              cnsLevelShortLabels[item.cns_fatigue] ??
              cnsLevelLabels[item.cns_fatigue] ??
              item.cns_fatigue
            }
          />
        )}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Text style={styles.emptyStateIcon}>∅</Text>
            <Text style={styles.emptyStateTitle}>{t('exercises.emptyTitle')}</Text>
            <Text style={styles.emptyStateText}>{t('exercises.emptyText')}</Text>
          </View>
        }
      />

      {/* Detail Modal */}
      {selected && (
        <ExerciseDetailModal
          exercise={selected}
          onClose={() => setSelected(null)}
          styles={styles}
        />
      )}

      {/* Filter Popup */}
      <Modal
        visible={filterPopupOpen}
        transparent
        animationType="fade"
        onRequestClose={() => setFilterPopupOpen(false)}
      >
        <Pressable
          style={styles.popupOverlay}
          onPress={() => setFilterPopupOpen(false)}
        >
          <View
            style={[
              styles.popupContainer,
              { top: filterButtonPos.y, right: 20 },
            ]}
          >
            <Pressable onPress={(e) => e.stopPropagation()}>
              <View style={styles.popupArrow} />
              <View style={styles.popupContent}>
                {/* Equipment */}
                <View style={styles.popupSection}>
                  <Text style={styles.popupSectionLabel}>
                    {t('exercises.equipment')}
                  </Text>
                  <View style={styles.popupPillWrap}>
                    {equipmentOptions.map((item) => {
                      const label = item === ALL_EQUIPMENT ? t('common.all') : item;
                      return (
                        <Pill
                          key={item}
                          label={label}
                          active={equipment === item}
                          onPress={() => setEquipment(item)}
                        />
                      );
                    })}
                  </View>
                </View>

                {/* Sort */}
                <View style={styles.popupSection}>
                  <Text style={styles.popupSectionLabel}>{t('exercises.sort')}</Text>
                  <View style={styles.popupSortRow}>
                    <View style={styles.popupPillWrap}>
                  <Pill
                    label={t('exercises.sortDefault')}
                    active={sortBy === 'default'}
                    onPress={() => {
                      setSortBy('default');
                      setSortDirection('asc');
                    }}
                    style={styles.sortPill}
                    textStyle={styles.sortPillText}
                  />
                  <Pill
                    label={t('exercises.sortName')}
                    active={sortBy === 'name'}
                    onPress={() => {
                      setSortBy('name');
                      setSortDirection('asc');
                    }}
                    style={styles.sortPill}
                    textStyle={styles.sortPillText}
                  />
                  <Pill
                    label={t('exercises.sortCns')}
                    active={sortBy === 'cns'}
                    onPress={() => {
                      setSortBy('cns');
                      setSortDirection('desc');
                    }}
                    style={styles.sortPill}
                    textStyle={styles.sortPillText}
                  />
                </View>
                <Pressable
                  onPress={() =>
                    setSortDirection((prev) => (prev === 'asc' ? 'desc' : 'asc'))
                  }
                  style={styles.directionButton}
                >
                  <Text style={styles.directionIcon}>
                    {sortDirection === 'asc' ? '↑' : '↓'}
                  </Text>
                </Pressable>
              </View>
            </View>

                {/* Close button */}
                <Pressable
                  style={styles.popupCloseButton}
                  onPress={() => setFilterPopupOpen(false)}
                >
                  <Text style={styles.popupCloseText}>{t('common.done')}</Text>
                </Pressable>
          </View>
            </Pressable>
          </View>
        </Pressable>
      </Modal>
    </View>
  );
}

type DetailProps = {
  exercise: Exercise;
  onClose: () => void;
  styles: Styles;
};

const ACTIVATION_COLORS: Record<string, string> = {
  'Maximum Activation': '#00d4aa',
  'High Activation': '#3b82f6',
  'Moderate Activation': '#f97316',
  'Low Activation': '#71717a',
};

function ExerciseDetailModal({ exercise, onClose, styles }: DetailProps) {
  const { t } = useTranslation();
  const cnsLabelText = t('exercises.cnsLabel');
  const cnsLevelText =
    {
      Low: t('exercises.cnsLevels.low'),
      Moderate: t('exercises.cnsLevels.moderate'),
      High: t('exercises.cnsLevels.high'),
      'Very High': t('exercises.cnsLevels.veryHigh'),
    }[exercise.cns_fatigue] ?? exercise.cns_fatigue;
  const targets = exercise.targets || [];

  return (
    <DraggableBottomSheet visible={true} onClose={onClose}>
      {/* Header */}
      <View style={styles.modalHeader}>
        <View style={styles.modalHeaderContent}>
          <Text style={styles.modalTitle}>{exercise.name}</Text>
          <View style={styles.modalMetaRow}>
            <View style={styles.modalEquipmentBadge}>
              <Text style={styles.modalEquipmentText}>
                {exercise.equipment}
              </Text>
            </View>
            <View
              style={[
                styles.modalCnsBadge,
                {
                  backgroundColor:
                    exercise.cns_fatigue === 'Very High'
                      ? '#ef444420'
                      : exercise.cns_fatigue === 'High'
                      ? '#f9731620'
                      : exercise.cns_fatigue === 'Moderate'
                      ? '#3b82f620'
                      : '#00d4aa20',
                },
              ]}
            >
              <Text
                style={[
                  styles.modalCnsText,
                  {
                    color:
                      exercise.cns_fatigue === 'Very High'
                        ? '#f87171'
                        : exercise.cns_fatigue === 'High'
                        ? '#fb923c'
                        : exercise.cns_fatigue === 'Moderate'
                        ? '#60a5fa'
                        : '#00d4aa',
                  },
                ]}
              >
                {cnsLabelText}: {cnsLevelText}
              </Text>
            </View>
          </View>
        </View>
      </View>

      {/* Target Muscles */}
      <Text style={styles.modalSectionTitle}>
        {t('exercises.modalTargetHeader', { count: targets.length })}
      </Text>
      <ScrollView
        style={styles.modalTargets}
        contentContainerStyle={styles.modalTargetsContent}
        showsVerticalScrollIndicator={true}
        nestedScrollEnabled={true}
      >
        {targets.length > 0 ? (
          targets.map((t, index) => (
            <View key={`${t.muscle}-${index}`} style={styles.modalTargetItem}>
              <View style={styles.modalTargetHeader}>
                <View
                  style={[
                    styles.modalTargetDot,
                    {
                      backgroundColor:
                        ACTIVATION_COLORS[t.activation] || '#71717a',
                    },
                  ]}
                />
                <Text style={styles.modalTargetMuscle}>{t.muscle}</Text>
              </View>
              <Text style={styles.modalTargetZone}>{t.zone}</Text>
              <Text
                style={[
                  styles.modalTargetActivation,
                  {
                    color: ACTIVATION_COLORS[t.activation] || '#71717a',
                  },
                ]}
              >
                {t.activation}
              </Text>
            </View>
          ))
        ) : (
          <Text style={styles.noTargetsText}>{t('exercises.modalNoTargets')}</Text>
        )}
      </ScrollView>

      {/* Hint */}
      <View style={styles.sheetHint}>
        <Text style={styles.sheetHintText}>
          {t('exercises.sheetHint')}
        </Text>
      </View>
    </DraggableBottomSheet>
  );
}

const createStyles = (colors: ColorTokens) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },
    header: {
      paddingTop: 48,
      paddingHorizontal: 20,
      paddingBottom: 16,
    },
    headerLabel: {
      marginBottom: 6,
    },
    resultCount: {
      marginTop: 4,
      fontSize: 13,
      color: colors.textSubtle,
    },
    searchRow: {
      flexDirection: 'row',
      alignItems: 'center',
      marginHorizontal: 20,
      marginBottom: 16,
      gap: 10,
    },
    searchContainer: {
      flex: 1,
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: colors.surface,
      borderRadius: 12,
      borderWidth: 1,
      borderColor: colors.border,
      paddingHorizontal: 14,
    },
    searchIcon: {
      marginRight: 10,
    },
    searchIconText: {
      fontSize: 18,
      color: colors.textSubtle,
    },
    searchInput: {
      flex: 1,
      paddingVertical: 14,
      color: colors.textPrimary,
      fontSize: 15,
    },
    clearButton: {
      padding: 4,
    },
    clearButtonText: {
      fontSize: 14,
      color: colors.textSubtle,
    },
    filtersSection: {
      marginHorizontal: -20,
      paddingHorizontal: 12,
      marginBottom: 8,
    },
    filterGroup: {
      marginBottom: 14,
    },
    filterLabel: {
      fontSize: 11,
      fontWeight: '600',
      color: colors.textSubtle,
      letterSpacing: 0.5,
      marginBottom: 8,
      textTransform: 'uppercase',
      paddingHorizontal: 4,
    },
    pillScroll: {
      gap: 8,
      paddingHorizontal: 4,
    },
    sortContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 10,
      paddingHorizontal: 4,
    },
    sortOptions: {
      flexDirection: 'row',
      gap: 8,
      flex: 1,
    },
    sortPill: {
      paddingHorizontal: 12,
      paddingVertical: 8,
      borderRadius: 8,
      backgroundColor: colors.surface,
      borderWidth: 1,
      borderColor: colors.border,
    },
    sortPillText: {
      fontSize: 12,
      color: colors.textMuted,
      fontWeight: '500',
    },
    directionButton: {
      width: 36,
      height: 36,
      borderRadius: 8,
      backgroundColor: colors.surfaceAlt,
      borderWidth: 1,
      borderColor: colors.borderMuted,
      alignItems: 'center',
      justifyContent: 'center',
    },
    directionIcon: {
      fontSize: 16,
      color: colors.accent,
      fontWeight: '600',
    },
    listContent: {
      paddingHorizontal: 20,
      paddingBottom: 24,
      paddingTop: 8,
    },
    emptyState: {
      marginTop: 60,
      alignItems: 'center',
      paddingHorizontal: 40,
    },
    emptyStateIcon: {
      fontSize: 48,
      color: colors.borderMuted,
      marginBottom: 16,
    },
    emptyStateTitle: {
      fontSize: 18,
      fontWeight: '600',
      color: colors.textMuted,
      marginBottom: 8,
    },
    emptyStateText: {
      fontSize: 14,
      color: colors.textSubtle,
      textAlign: 'center',
      lineHeight: 20,
    },
    modalHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'flex-start',
      marginBottom: 20,
    },
    modalHeaderContent: {
      flex: 1,
    },
    modalTitle: {
      fontSize: 22,
      fontWeight: '700',
      color: colors.textPrimary,
      lineHeight: 28,
      marginBottom: 12,
    },
    modalMetaRow: {
      flexDirection: 'row',
      gap: 8,
      flexWrap: 'wrap',
    },
    modalEquipmentBadge: {
      backgroundColor: colors.borderMuted,
      paddingHorizontal: 10,
      paddingVertical: 4,
      borderRadius: 6,
    },
    modalEquipmentText: {
      fontSize: 12,
      color: colors.textSecondary,
      fontWeight: '500',
    },
    modalCnsBadge: {
      paddingHorizontal: 10,
      paddingVertical: 4,
      borderRadius: 6,
    },
    modalCnsText: {
      fontSize: 12,
      fontWeight: '600',
    },
    modalSectionTitle: {
      fontSize: 13,
      fontWeight: '600',
      color: colors.textMuted,
      letterSpacing: 0.5,
      textTransform: 'uppercase',
      marginBottom: 12,
    },
    modalTargets: {
      flex: 1,
      minHeight: 100,
    },
    modalTargetsContent: {
      paddingBottom: 24,
      flexGrow: 1,
    },
    modalTargetItem: {
      paddingVertical: 14,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
    },
    modalTargetHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 10,
      marginBottom: 4,
    },
    modalTargetDot: {
      width: 8,
      height: 8,
      borderRadius: 4,
    },
    modalTargetMuscle: {
      color: colors.textPrimary,
      fontSize: 15,
      fontWeight: '600',
      flex: 1,
    },
    modalTargetZone: {
      color: colors.textMuted,
      fontSize: 13,
      marginLeft: 18,
      marginBottom: 2,
    },
    modalTargetActivation: {
      fontSize: 12,
      fontWeight: '600',
      marginLeft: 18,
    },
    noTargetsText: {
      color: colors.textSubtle,
      fontSize: 14,
      textAlign: 'center',
      paddingVertical: 20,
    },
    sheetHint: {
      paddingVertical: 16,
      alignItems: 'center',
      borderTopWidth: 1,
      borderTopColor: colors.border,
      marginTop: 8,
    },
    sheetHintText: {
      fontSize: 11,
      color: colors.textSubtle,
    },
    // Filter Popup Styles
    popupOverlay: {
      flex: 1,
      backgroundColor: colors.overlay,
    },
    popupContainer: {
      position: 'absolute',
      maxWidth: 320,
    },
    popupArrow: {
      position: 'absolute',
      top: -8,
      right: 14,
      width: 0,
      height: 0,
      borderLeftWidth: 8,
      borderRightWidth: 8,
      borderBottomWidth: 8,
      borderLeftColor: 'transparent',
      borderRightColor: 'transparent',
      borderBottomColor: colors.surfaceAlt,
    },
    popupContent: {
      backgroundColor: colors.surfaceAlt,
      borderRadius: 16,
      borderWidth: 1,
      borderColor: colors.borderMuted,
      padding: 16,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 8 },
      shadowOpacity: 0.4,
      shadowRadius: 24,
      elevation: 16,
    },
    popupSection: {
      marginBottom: 16,
    },
    popupSectionLabel: {
      fontSize: 11,
      fontWeight: '600',
      color: colors.textSubtle,
      letterSpacing: 0.5,
      textTransform: 'uppercase',
      marginBottom: 10,
    },
    popupPillWrap: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: 8,
    },
    popupSortRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 10,
    },
    popupCloseButton: {
      backgroundColor: colors.accent,
      borderRadius: 10,
      paddingVertical: 12,
      alignItems: 'center',
      marginTop: 4,
    },
    popupCloseText: {
      fontSize: 14,
      fontWeight: '600',
      color: colors.background,
    },
  });
