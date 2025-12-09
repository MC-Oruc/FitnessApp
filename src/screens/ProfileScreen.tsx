import React, { useEffect, useMemo, useState } from 'react';
import {
  Alert,
  Pressable,
  ScrollView,
  Share,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import * as FileSystem from 'expo-file-system';
import { DateTimePickerAndroid } from '@react-native-community/datetimepicker';
import { useTranslation } from '../i18n/I18nProvider';
import { Pill } from '../components/ui';
import { useThemedStyles } from '../theme/styles';
import { useTheme } from '../theme/ThemeProvider';
import type { ColorTokens } from '../theme/tokens';
import type { Language } from '../i18n/translations';

type EntryType = 'program' | 'set' | 'metrics' | 'composition' | 'goal' | 'custom';

type EntryPayload = {
  programType?: string;
  frequency?: string;
  note?: string;
  movement?: string;
  sets?: string;
  reps?: string;
  weight?: string;
  height?: string;
  bodyWeight?: string;
  shoulder?: string;
  waist?: string;
  chest?: string;
  hip?: string;
  neck?: string;
  water?: string;
  muscle?: string;
  bone?: string;
  fat?: string;
  phase?: string;
  customKey?: string;
  customValue?: string;
};

type Entry = {
  id: string;
  type: EntryType;
  timestamp: string;
  payload: EntryPayload;
};

const STORAGE_FILE = `${FileSystem.documentDirectory}profile_entries.json`;

const MONTH_NAMES: Record<Language, string[]> = {
  en: Array.from({ length: 12 }, (_, i) =>
    new Intl.DateTimeFormat('en-US', { month: 'long' }).format(new Date(2025, i, 1)),
  ),
  tr: Array.from({ length: 12 }, (_, i) =>
    new Intl.DateTimeFormat('tr-TR', { month: 'long' }).format(new Date(2025, i, 1)),
  ),
};

function toStoreDateString(date: Date, language: Language) {
  return formatDisplayDate(date, language);
}

function formatDisplayDate(date: Date, language: Language) {
  const locale = language === 'tr' ? 'tr-TR' : 'en-US';
  return date.toLocaleDateString(locale, {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
}

function parseDateString(value: string): Date | null {
  if (!value) return null;

  // stored legacy format yyyy-MM-dd
  const isoDateMatch = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);
  if (isoDateMatch) {
    const [, y, m, d] = isoDateMatch;
    const date = new Date(Number(y), Number(m) - 1, Number(d));
    return Number.isNaN(date.getTime()) ? null : date;
  }

  // Accept dd.MM.yy or dd.MM.yyyy (legacy)
  const dotParts = value.split('.');
  if (dotParts.length === 3) {
    const [dd, mm, yy] = dotParts.map((p) => parseInt(p, 10));
    if (Number.isFinite(dd) && Number.isFinite(mm) && Number.isFinite(yy)) {
      const fullYear = yy < 100 ? 2000 + yy : yy;
      const d = new Date(fullYear, mm - 1, dd);
      return Number.isNaN(d.getTime()) ? null : d;
    }
  }

  // Long month names (en or tr), e.g., "21 June 2025" / "21 Haziran 2025"
  const longMatch = /^(\d{1,2})\s+([^\d\s]+)\s+(\d{4})$/u.exec(value.trim());
  if (longMatch) {
    const [, dStr, monthNameRaw, yStr] = longMatch;
    const day = parseInt(dStr, 10);
    const year = parseInt(yStr, 10);
    const lowerName = monthNameRaw.toLowerCase();
    const findMonthIndex = () => {
      for (const lang of ['en', 'tr'] as Language[]) {
        const idx = MONTH_NAMES[lang].findIndex(
          (m) => m.toLowerCase() === lowerName,
        );
        if (idx >= 0) return idx;
      }
      return -1;
    };
    const monthIdx = findMonthIndex();
    if (monthIdx >= 0 && Number.isFinite(day) && Number.isFinite(year)) {
      const date = new Date(year, monthIdx, day);
      if (!Number.isNaN(date.getTime())) return date;
    }
  }

  // Fallback: native Date parse (old ISO strings)
  const iso = new Date(value);
  return Number.isNaN(iso.getTime()) ? null : iso;
}

function nowDateString(language: Language) {
  return toStoreDateString(new Date(), language);
}
function genId() {
  return `${Date.now()}-${Math.random().toString(16).slice(2, 8)}`;
}

function emptyPayload(): EntryPayload {
  return {
    programType: '',
    frequency: '',
    note: '',
    movement: '',
    sets: '',
    reps: '',
    weight: '',
    height: '',
    bodyWeight: '',
    shoulder: '',
    waist: '',
    chest: '',
    hip: '',
    neck: '',
    water: '',
    muscle: '',
    bone: '',
    fat: '',
    phase: '',
    customKey: '',
    customValue: '',
  };
}

function hasAny(keys: (keyof EntryPayload)[], payload: EntryPayload) {
  return keys.some((k) => (payload[k] ?? '').toString().trim().length > 0);
}

function timestampToMs(value: string) {
  const d = parseDateString(value);
  return d ? d.getTime() : 0;
}

function cleanPayload(payload: EntryPayload): EntryPayload {
  const result: EntryPayload = {};
  (Object.entries(payload) as [keyof EntryPayload, EntryPayload[keyof EntryPayload]][]).forEach(
    ([key, val]) => {
      const str = val?.toString().trim() ?? '';
      if (str.length > 0) {
        result[key] = val;
      }
    }
  );
  return result;
}

function summarize(entry: Entry, t: (key: string) => string) {
  const p = entry.payload;
  switch (entry.type) {
    case 'program':
      return [
        p.programType || t('profile.types.program'),
        p.frequency && `${p.frequency}x`,
        p.note,
      ]
        .filter(Boolean)
        .join(' • ');
    case 'set':
      return [
        p.movement,
        [p.sets, p.reps].filter(Boolean).join('x'),
        p.weight && `${p.weight} kg`,
      ]
        .filter(Boolean)
        .join(' • ');
    case 'metrics':
      return [
        p.bodyWeight && `${p.bodyWeight} kg`,
        p.height && `${p.height} cm`,
        p.waist && `${t('profile.fields.waist')} ${p.waist} cm`,
      ]
        .filter(Boolean)
        .join(' • ');
    case 'composition':
      return [
        p.fat && `${t('profile.fields.fat')} ${p.fat}%`,
        p.muscle && `${t('profile.fields.muscle')} ${p.muscle}%`,
        p.water && `${t('profile.fields.water')} ${p.water}%`,
      ]
        .filter(Boolean)
        .join(' • ');
    case 'goal':
      return p.phase || t('profile.types.goal');
    case 'custom':
    default:
      return [p.customKey, p.customValue].filter(Boolean).join(': ');
  }
}

export default function ProfileScreen() {
  const { t, language } = useTranslation();
  const themeStyles = useThemedStyles();
  const { colors } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const placeholder = (key: string) => t(`profile.placeholders.${key}`);
  const [entries, setEntries] = useState<Entry[]>([]);
  const [loading, setLoading] = useState(true);
  const [entryType, setEntryType] = useState<EntryType>('program');
  const [timestamp, setTimestamp] = useState(nowDateString(language));
  const [payload, setPayload] = useState<EntryPayload>(emptyPayload());
  const [editingId, setEditingId] = useState<string | null>(null);
  const [showAllHistory, setShowAllHistory] = useState(false);
  const [historyType, setHistoryType] = useState<EntryType | 'all'>('all');
  const [filterStart, setFilterStart] = useState('');
  const [filterEnd, setFilterEnd] = useState('');

  useEffect(() => {
    (async () => {
      try {
        const info = await FileSystem.getInfoAsync(STORAGE_FILE);
        if (info.exists) {
          const raw = await FileSystem.readAsStringAsync(STORAGE_FILE);
          const parsed = JSON.parse(raw) as Entry[];
          setEntries(
            parsed.sort(
              (a, b) =>
                timestampToMs(b.timestamp) - timestampToMs(a.timestamp)
            )
          );
        }
      } catch (err) {
        console.log('Profile data load failed', err);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const persist = async (list: Entry[]) => {
    try {
      await FileSystem.writeAsStringAsync(STORAGE_FILE, JSON.stringify(list, null, 2));
    } catch (err) {
      console.log('Profile data save failed', err);
    }
  };

  const resetForm = () => {
    setPayload(emptyPayload());
    setTimestamp(nowDateString(language));
    setEditingId(null);
  };

  const validate = () => {
    const parsedTs = parseDateString(timestamp.trim());
    if (!parsedTs) {
      Alert.alert(t('profile.validationMissing'));
      return false;
    }
    if (entryType === 'program' && !payload.programType?.trim()) {
      Alert.alert(t('profile.validationMissing'));
      return false;
    }
    if (entryType === 'set' && !payload.movement?.trim()) {
      Alert.alert(t('profile.validationMissing'));
      return false;
    }
    if (
      entryType === 'metrics' &&
      !hasAny(
        ['bodyWeight', 'height', 'shoulder', 'waist', 'chest', 'hip', 'neck'],
        payload
      )
    ) {
      Alert.alert(t('profile.validationMissing'));
      return false;
    }
    if (
      entryType === 'composition' &&
      !hasAny(['water', 'muscle', 'bone', 'fat'], payload)
    ) {
      Alert.alert(t('profile.validationMissing'));
      return false;
    }
    if (entryType === 'goal' && !payload.phase?.trim()) {
      Alert.alert(t('profile.validationMissing'));
      return false;
    }
    if (entryType === 'custom' && !payload.customKey?.trim()) {
      Alert.alert(t('profile.validationMissing'));
      return false;
    }
    return true;
  };

  const handleSave = async () => {
    if (!validate()) return;
    const newEntry: Entry = {
      id: editingId ?? genId(),
      type: entryType,
      timestamp: timestamp.trim(),
      payload: cleanPayload(payload),
    };
    const merged = editingId
      ? entries.map((e) => (e.id === editingId ? newEntry : e))
      : [...entries, newEntry];
    const sorted = merged.sort(
      (a, b) => timestampToMs(b.timestamp) - timestampToMs(a.timestamp)
    );
    setEntries(sorted);
    await persist(sorted);
    resetForm();
  };

  const handleEditLoad = (entry: Entry) => {
    setEntryType(entry.type);
    setPayload(entry.payload);
    setTimestamp(entry.timestamp);
    setEditingId(entry.id);
  };

  const handleDuplicate = (entry: Entry) => {
    setEntryType(entry.type);
    setPayload(entry.payload);
    setTimestamp(nowDateString(language));
    setEditingId(null);
  };

  const handleDelete = (entry: Entry) => {
    Alert.alert(t('profile.delete'), summarize(entry, t), [
      { text: 'Cancel', style: 'cancel' },
      {
        text: t('profile.delete'),
        style: 'destructive',
        onPress: async () => {
          const list = entries.filter((e) => e.id !== entry.id);
          setEntries(list);
          await persist(list);
          if (editingId === entry.id) resetForm();
        },
      },
    ]);
  };

  const filteredHistory = useMemo(() => {
    if (!showAllHistory) return entries;
    let list = entries;
    if (historyType !== 'all') {
      list = list.filter((e) => e.type === historyType);
    }
    const startMs = filterStart ? timestampToMs(filterStart) : Number.NEGATIVE_INFINITY;
    const endMs = filterEnd ? timestampToMs(filterEnd) : Number.POSITIVE_INFINITY;
    return list.filter((e) => {
      const ts = timestampToMs(e.timestamp);
      return ts >= startMs && ts <= endMs;
    });
  }, [entries, showAllHistory, historyType, filterStart, filterEnd]);

  const visibleEntries = showAllHistory
    ? filteredHistory
    : filteredHistory.slice(0, 3);

  const handleExport = async () => {
    const json = JSON.stringify(filteredHistory, null, 2);
    try {
      await Share.share({ message: json });
      Alert.alert(t('profile.exportReady'));
    } catch (err) {
      Alert.alert(t('profile.shareFailedTitle'), t('profile.shareFailedBody'));
    }
  };

  const openDatePicker = (current: string, onSelect: (val: string) => void) => {
    const parsed = parseDateString(current) ?? new Date();
    DateTimePickerAndroid.open({
      value: parsed,
      mode: 'date',
      display: 'calendar',
      onChange: (_event, date) => {
        if (date) {
          onSelect(toStoreDateString(date, language));
        }
      },
    });
  };

  const formatTimestamp = (value: string) => {
    const parsed = parseDateString(value);
    return parsed ? formatDisplayDate(parsed, language) : value;
  };

  const renderField = (
    key: keyof EntryPayload,
    label: string,
    placeholder?: string,
    numeric?: boolean
  ) => (
    <View key={key} style={styles.field}>
      <Text style={styles.fieldLabel}>{label}</Text>
      <TextInput
        style={styles.input}
        placeholder={placeholder}
        placeholderTextColor={colors.textSubtle}
        value={(payload[key] ?? '') as string}
        onChangeText={(text) => setPayload({ ...payload, [key]: text })}
        keyboardType={numeric ? 'numeric' : 'default'}
      />
    </View>
  );

  const fieldLabel = (key: string) => t(`profile.fields.${key}`);

  const renderFields = () => {
    if (entryType === 'program') {
      return (
        <>
          {renderField('programType', fieldLabel('programType'), placeholder('programType'))}
          {renderField('frequency', fieldLabel('frequency'), placeholder('frequency'))}
          {renderField('note', fieldLabel('note'), placeholder('note'))}
        </>
      );
    }
    if (entryType === 'set') {
      return (
        <>
          {renderField('movement', fieldLabel('movement'), placeholder('movement'))}
          {renderField('sets', fieldLabel('sets'), placeholder('sets'), true)}
          {renderField('reps', fieldLabel('reps'), placeholder('reps'), true)}
          {renderField('weight', fieldLabel('weight'), placeholder('weight'), true)}
        </>
      );
    }
    if (entryType === 'metrics') {
      return (
        <>
          {renderField('bodyWeight', fieldLabel('bodyWeight'), placeholder('bodyWeight'), true)}
          {renderField('height', fieldLabel('height'), placeholder('height'), true)}
          {renderField('shoulder', fieldLabel('shoulder'), placeholder('shoulder'), true)}
          {renderField('waist', fieldLabel('waist'), placeholder('waist'), true)}
          {renderField('chest', fieldLabel('chest'), placeholder('chest'), true)}
          {renderField('hip', fieldLabel('hip'), placeholder('hip'), true)}
          {renderField('neck', fieldLabel('neck'), placeholder('neck'), true)}
        </>
      );
    }
    if (entryType === 'composition') {
      return (
        <>
          {renderField('fat', fieldLabel('fat'), placeholder('fat'), true)}
          {renderField('muscle', fieldLabel('muscle'), placeholder('muscle'), true)}
          {renderField('water', fieldLabel('water'), placeholder('water'), true)}
          {renderField('bone', fieldLabel('bone'), placeholder('bone'), true)}
        </>
      );
    }
    if (entryType === 'goal') {
      return (
        <>
          {renderField('phase', fieldLabel('phase'), placeholder('phase'))}
          {renderField('note', fieldLabel('note'), placeholder('goalNote'))}
        </>
      );
    }
    return (
      <>
        {renderField('customKey', fieldLabel('customKey'), placeholder('customKey'))}
        {renderField('customValue', fieldLabel('customValue'), placeholder('customValue'))}
        {renderField('note', fieldLabel('note'), placeholder('note'))}
      </>
    );
  };

  return (
    <ScrollView
      style={[themeStyles.screen, styles.container]}
      contentContainerStyle={styles.content}
    >
      <View style={styles.header}>
        <Text style={[themeStyles.headerLabel, styles.headerLabel]}>
          {t('profile.headerLabel')}
        </Text>
        <Text style={themeStyles.titleMd}>{t('profile.title')}</Text>
        <Text style={[themeStyles.subtitle, styles.subtitle]}>
          {t('profile.subtitle')}
        </Text>
      </View>

      <View style={[themeStyles.card, styles.card]}>
        <View style={styles.cardHeader}>
          <Text style={styles.cardTitle}>
            {editingId ? t('profile.update') : t('profile.newEntry')}
          </Text>
          {editingId && (
            <Pressable onPress={resetForm} style={styles.cancelEdit}>
              <Text style={styles.cancelEditText}>{t('profile.cancelEdit')}</Text>
            </Pressable>
          )}
        </View>

        <Text style={styles.sectionLabel}>{t('profile.entryType')}</Text>
        <View style={styles.typeRow}>
          {(['program', 'set', 'metrics', 'composition', 'goal', 'custom'] as EntryType[]).map(
            (tKey) => (
              <Pill
                key={tKey}
                label={t(`profile.types.${tKey}`)}
                active={entryType === tKey}
                onPress={() => setEntryType(tKey)}
                style={styles.typePill}
                textStyle={styles.typePillText}
              />
            )
          )}
        </View>

        <Text style={styles.sectionLabel}>{t('profile.timestamp')}</Text>
        <View style={styles.row}>
          <TextInput
            style={[styles.input, styles.flex]}
            value={formatTimestamp(timestamp)}
            editable={false}
            placeholder={formatDisplayDate(new Date(), language)}
            placeholderTextColor={colors.textSubtle}
          />
          <Pressable
            style={({ pressed }) => [
              styles.nowButton,
              pressed && styles.pillPressed,
            ]}
            onPress={() => openDatePicker(timestamp, setTimestamp)}
          >
            <Text style={styles.nowButtonText}>{t('profile.calendar')}</Text>
          </Pressable>
        </View>

        <View style={styles.fieldsWrap}>{renderFields()}</View>

        <Pressable
          onPress={handleSave}
          style={({ pressed }) => [
            styles.saveButton,
            pressed && styles.saveButtonPressed,
          ]}
        >
          <Text style={styles.saveButtonText}>
            {editingId ? t('profile.update') : t('profile.save')}
          </Text>
        </Pressable>
      </View>

      <View style={[themeStyles.card, styles.card]}>
        <View style={styles.cardHeader}>
          <Text style={styles.cardTitle}>{t('profile.history')}</Text>
          <View style={styles.historyActions}>
            {loading && <Text style={styles.muted}>...</Text>}
            <Pressable
              onPress={() => setShowAllHistory((v) => !v)}
              style={({ pressed }) => [styles.historyToggle, pressed && styles.pillPressed]}
            >
              <Text style={styles.historyToggleText}>
                {showAllHistory ? t('profile.hideHistory') : t('profile.viewAll')}
              </Text>
            </Pressable>
          </View>
        </View>

        {showAllHistory && (
          <View style={styles.filterWrap}>
            <Text style={styles.sectionLabel}>{t('profile.filters')}</Text>
            <View style={styles.typeRow}>
              <Pill
                label={t('common.all')}
                active={historyType === 'all'}
                onPress={() => setHistoryType('all')}
                style={styles.typePill}
                textStyle={styles.typePillText}
              />
              {(['program', 'set', 'metrics', 'composition', 'goal', 'custom'] as EntryType[]).map(
                (tKey) => (
                  <Pill
                    key={tKey}
                    label={t(`profile.types.${tKey}`)}
                    active={historyType === tKey}
                    onPress={() => setHistoryType(tKey)}
                    style={styles.typePill}
                    textStyle={styles.typePillText}
                  />
                )
              )}
            </View>
            <View style={styles.row}>
              <View style={styles.fieldInline}>
                <Text style={styles.fieldLabel}>{t('profile.filterStart')}</Text>
                <View style={styles.row}>
                  <TextInput
                    style={[styles.input, styles.flex]}
                    placeholder={formatDisplayDate(new Date(), language)}
                    placeholderTextColor={colors.textSubtle}
                    value={filterStart ? formatTimestamp(filterStart) : ''}
                    editable={false}
                  />
                  <Pressable
                    style={({ pressed }) => [
                      styles.nowButton,
                      pressed && styles.pillPressed,
                    ]}
                    onPress={() => openDatePicker(filterStart, setFilterStart)}
                  >
                    <Text style={styles.nowButtonText}>{t('profile.calendar')}</Text>
                  </Pressable>
                </View>
              </View>
              <View style={styles.fieldInline}>
                <Text style={styles.fieldLabel}>{t('profile.filterEnd')}</Text>
                <View style={styles.row}>
                  <TextInput
                    style={[styles.input, styles.flex]}
                    placeholder={formatDisplayDate(new Date(), language)}
                    placeholderTextColor={colors.textSubtle}
                    value={filterEnd ? formatTimestamp(filterEnd) : ''}
                    editable={false}
                  />
                  <Pressable
                    style={({ pressed }) => [
                      styles.nowButton,
                      pressed && styles.pillPressed,
                    ]}
                    onPress={() => openDatePicker(filterEnd, setFilterEnd)}
                  >
                    <Text style={styles.nowButtonText}>{t('profile.calendar')}</Text>
                  </Pressable>
                </View>
              </View>
            </View>
            <Pressable
              onPress={handleExport}
              style={({ pressed }) => [
                styles.saveButton,
                styles.exportButton,
                pressed && styles.saveButtonPressed,
              ]}
            >
              <Text style={styles.saveButtonText}>{t('profile.exportButton')}</Text>
            </Pressable>
          </View>
        )}

        {entries.length === 0 && !loading ? (
          <Text style={styles.muted}>{t('profile.empty')}</Text>
        ) : (
          visibleEntries.map((entry) => (
            <View key={entry.id} style={styles.entryCard}>
              <View style={styles.entryTop}>
                <View style={styles.entryMeta}>
                  <Text style={styles.entryTypeText}>
                    {t(`profile.types.${entry.type}`)}
                  </Text>
                  <Text style={styles.entryTimestamp}>{formatTimestamp(entry.timestamp)}</Text>
                </View>
                <Text style={styles.entrySummary}>{summarize(entry, t)}</Text>
              </View>
              <View style={styles.entryActions}>
                <Pressable
                  onPress={() => handleEditLoad(entry)}
                  style={({ pressed }) => [styles.entryAction, pressed && styles.pillPressed]}
                >
                  <Text style={styles.entryActionText}>{t('profile.edit')}</Text>
                </Pressable>
                <Pressable
                  onPress={() => handleDuplicate(entry)}
                  style={({ pressed }) => [styles.entryAction, pressed && styles.pillPressed]}
                >
                  <Text style={styles.entryActionText}>{t('profile.duplicate')}</Text>
                </Pressable>
                <Pressable
                  onPress={() => handleDelete(entry)}
                  style={({ pressed }) => [styles.entryAction, pressed && styles.pillPressed]}
                >
                  <Text style={[styles.entryActionText, styles.danger]}>
                    {t('profile.delete')}
                  </Text>
                </Pressable>
              </View>
            </View>
          ))
        )}
      </View>
    </ScrollView>
  );
}

const createStyles = (colors: ColorTokens) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },
    content: {
      paddingHorizontal: 20,
      paddingTop: 12,
      paddingBottom: 36,
    },
    header: {
      paddingTop: 36,
      paddingBottom: 12,
      marginBottom: 4,
    },
    headerLabel: {
      marginBottom: 6,
    },
    subtitle: {
      marginTop: 6,
    },
    card: {
      padding: 16,
      marginTop: 14,
    },
    cardHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 8,
    },
    historyActions: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
    },
    historyToggle: {
      paddingHorizontal: 10,
      paddingVertical: 6,
      borderRadius: 10,
      backgroundColor: colors.surface,
      borderWidth: 1,
      borderColor: colors.border,
    },
    historyToggleText: {
      color: colors.accent,
      fontWeight: '700',
      fontSize: 12,
    },
    filterWrap: {
      marginBottom: 12,
      gap: 8,
    },
    cardTitle: {
      color: colors.textSecondary,
      fontSize: 16,
      fontWeight: '700',
    },
    sectionLabel: {
      color: colors.textSubtle,
      fontSize: 12,
      marginTop: 8,
      marginBottom: 6,
      letterSpacing: 0.5,
    },
    typeRow: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: 8,
    },
    typePill: {
      paddingHorizontal: 12,
      paddingVertical: 8,
      borderRadius: 10,
    },
    typePillText: {
      color: colors.textSecondary,
      fontSize: 12,
      fontWeight: '600',
    },
    row: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 10,
    },
    fieldsWrap: {
      marginTop: 4,
    },
    field: {
      marginBottom: 10,
    },
    fieldInline: {
      flex: 1,
    },
    fieldLabel: {
      color: colors.textSecondary,
      fontSize: 12,
      marginBottom: 4,
    },
    input: {
      backgroundColor: colors.surface,
      borderRadius: 10,
      borderWidth: 1,
      borderColor: colors.border,
      paddingHorizontal: 12,
      paddingVertical: 10,
      color: colors.textSecondary,
      fontSize: 14,
    },
    flex: {
      flex: 1,
    },
    nowButton: {
      paddingHorizontal: 12,
      paddingVertical: 10,
      borderRadius: 10,
      backgroundColor: colors.surface,
      borderWidth: 1,
      borderColor: colors.border,
    },
    nowButtonText: {
      color: colors.accent,
      fontWeight: '700',
      fontSize: 12,
    },
    saveButton: {
      marginTop: 8,
      backgroundColor: colors.accent,
      borderRadius: 12,
      paddingVertical: 14,
      alignItems: 'center',
    },
    exportButton: {
      marginTop: 12,
    },
    saveButtonPressed: {
      opacity: 0.8,
    },
    saveButtonText: {
      color: colors.background,
      fontSize: 15,
      fontWeight: '700',
    },
    pillPressed: {
      opacity: 0.7,
    },
    entryCard: {
      paddingVertical: 12,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
    },
    entryTop: {
      marginBottom: 8,
    },
    entryMeta: {
      flexDirection: 'row',
      justifyContent: 'space-between',
    },
    entryTypeText: {
      color: colors.accent,
      fontWeight: '700',
      fontSize: 13,
    },
    entryTimestamp: {
      color: colors.textSecondary,
      fontSize: 12,
    },
    entrySummary: {
      color: colors.textSecondary,
      fontSize: 14,
      marginTop: 4,
    },
    entryActions: {
      flexDirection: 'row',
      gap: 12,
    },
    entryAction: {
      paddingVertical: 6,
    },
    entryActionText: {
      color: colors.textSecondary,
      fontWeight: '600',
      fontSize: 12,
    },
    danger: {
      color: colors.danger,
    },
    muted: {
      color: colors.textFaint,
      fontSize: 12,
    },
    cancelEdit: {
      paddingHorizontal: 8,
      paddingVertical: 6,
    },
    cancelEditText: {
      color: colors.warning,
      fontWeight: '600',
      fontSize: 12,
    },
  });
