import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Animated,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import { useAppTheme } from '../../src/Theme/ThemeContext';
import { SUPABASE_REST_URL as API_URL, SUPABASE_HEADERS as HEADERS } from '../config/api';

// ─── Confidence arc helpers ──────────────────────────────────────────────────

/**
 * Returns colour ramp based on confidence value (0–100).
 * High  ≥ 70 → green
 * Mid   ≥ 40 → amber
 * Low   <  40 → red / error tint
 */
function confidenceColor(pct, colors) {
  if (pct >= 70) return '#22c55e';
  if (pct >= 40) return '#f59e0b';
  return colors.error ?? '#ef4444';
}

// ─── Animated confidence ring ─────────────────────────────────────────────────
const ConfidenceRing = ({ confidence, colors }) => {
  const pct1 = parseFloat(confidence)  || 0;
  const pct= Math.max(0, Math.min(100, Math.round(pct1 * 5)))
  const anim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(anim, {
      toValue: pct,
      duration: 900,
      delay: 200,
      useNativeDriver: false,
    }).start();
  }, [pct]);

  const ringColor = confidenceColor(pct, colors);
  const SIZE = 110;
  const STROKE = 7;
  const R = (SIZE - STROKE) / 2;
  const CIRC = 2 * Math.PI * R;

  // SVG-style ring via a conic-gradient border trick using View rotation
  const fillDeg = anim.interpolate({
    inputRange: [0, 100],
    outputRange: ['0deg', '360deg'],
  });

  return (
    <View style={[styles.ringWrap, { width: SIZE, height: SIZE }]}>
      {/* Track circle */}
      <View
        style={[
          styles.ringTrack,
          {
            width: SIZE,
            height: SIZE,
            borderRadius: SIZE / 2,
            borderWidth: STROKE,
            borderColor: ringColor + '28',
          },
        ]}
      />

      {/* Rotating filled arc — simple approach: rotate a half-mask */}
      <Animated.View
        style={[
          styles.ringFill,
          {
            width: SIZE,
            height: SIZE,
            borderRadius: SIZE / 2,
            borderWidth: STROKE,
            borderColor: ringColor,
            borderTopColor: pct < 25 ? 'transparent' : ringColor,
            borderRightColor: pct < 50 ? 'transparent' : ringColor,
            borderBottomColor: pct < 75 ? 'transparent' : ringColor,
            borderLeftColor: pct < 100 ? 'transparent' : ringColor,
            transform: [{ rotate: fillDeg }],
            position: 'absolute',
          },
        ]}
      />

      {/* Centre label */}
      <View style={StyleSheet.absoluteFill} pointerEvents="none">
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
          <Text style={[styles.ringPct, { color: ringColor }]}>
            {Math.round(pct)}%
          </Text>
          <Text style={[styles.ringSub, { color: colors.textSecondary }]}>
            confidence
          </Text>
        </View>
      </View>
    </View>
  );
};

// ─── Symptom pill ─────────────────────────────────────────────────────────────
const SymptomPill = ({ label, colors, delay }) => {
  const fade = useRef(new Animated.Value(0)).current;
  const scale = useRef(new Animated.Value(0.85)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fade, { toValue: 1, duration: 300, delay, useNativeDriver: true }),
      Animated.spring(scale, { toValue: 1, delay, useNativeDriver: true, friction: 7 }),
    ]).start();
  }, []);

  return (
    <Animated.View
      style={[
        styles.pill,
        {
          backgroundColor: colors.primary + '18',
          borderColor: colors.primary + '35',
          opacity: fade,
          transform: [{ scale }],
        },
      ]}
    >
      <Text style={[styles.pillText, { color: colors.primary }]}>{label}</Text>
    </Animated.View>
  );
};

// ─── Single result card ───────────────────────────────────────────────────────
const ResultCard = ({ record, colors, index }) => {
  const slideY = useRef(new Animated.Value(24)).current;
  const fade = useRef(new Animated.Value(0)).current;
  const [expanded, setExpanded] = useState(index === 0); // first card open by default

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fade, { toValue: 1, duration: 380, delay: index * 90, useNativeDriver: true }),
      Animated.timing(slideY, { toValue: 0, duration: 340, delay: index * 90, useNativeDriver: true }),
    ]).start();
  }, []);

  const symptoms = Array.isArray(record.Symptoms)
    ? record.Symptoms
    : typeof record.Symptoms === 'string'
    ? JSON.parse(record.Symptoms)
    : [];

  //const pct = parseFloat(record.Confidence) || 0;
  const pct1 = parseFloat(record.Confidence)  || 0;
  const pct= Math.max(0, Math.min(100, Math.round(pct1 * 5)))
  const ringColor = confidenceColor(pct, colors);
  const date = record.created_at
    ? new Date(record.created_at).toLocaleDateString('en-GB', {
        day: '2-digit', month: 'short', year: 'numeric',
      })
    : null;

  return (
    <Animated.View
      style={[
        styles.card,
        {
          backgroundColor: colors.card,
          borderColor: colors.border,
          opacity: fade,
          transform: [{ translateY: slideY }],
        },
      ]}
    >
      {/* ── Card header ── */}
      <TouchableOpacity
        onPress={() => setExpanded(e => !e)}
        activeOpacity={0.75}
        style={styles.cardHeader}
      >
        {/* Left accent bar */}
        <View style={[styles.accentBar, { backgroundColor: ringColor }]} />

        <View style={{ flex: 1 }}>
          <Text style={[styles.diseaseName, { color: colors.text }]} numberOfLines={2}>
            {record.Predicted_disease || 'Unknown Disease'}
          </Text>
          {date && (
            <Text style={[styles.dateText, { color: colors.textSecondary }]}>
              {date}
            </Text>
          )}
        </View>

        {/* Compact confidence badge */}
        <View style={[styles.confBadge, { backgroundColor: ringColor + '20' }]}>
          <Text style={[styles.confBadgeText, { color: ringColor }]}>
            {Math.round(pct)}%
          </Text>
        </View>

        {/* Expand chevron */}
        <Text style={[styles.chevron, { color: colors.textSecondary }]}>
          {expanded ? '▲' : '▼'}
        </Text>
      </TouchableOpacity>

      {/* ── Expanded body ── */}
      {expanded && (
        <View style={[styles.cardBody, { borderTopColor: colors.border }]}>

          {/* Confidence ring + disease detail row */}
          <View style={styles.ringRow}>
            <ConfidenceRing confidence={record.Confidence} colors={colors} />

            <View style={styles.ringMeta}>
              <View style={[styles.metaChip, { backgroundColor: colors.background }]}>
                <Text style={[styles.metaChipLabel, { color: colors.textSecondary }]}>
                  PATIENT ID
                </Text>
                <Text style={[styles.metaChipValue, { color: colors.text }]}>
                  #{record.Patient_id}
                </Text>
              </View>
              <View style={[styles.metaChip, { backgroundColor: colors.background }]}>
                <Text style={[styles.metaChipLabel, { color: colors.textSecondary }]}>
                  NAME
                </Text>
                <Text style={[styles.metaChipValue, { color: colors.text }]} numberOfLines={1}>
                  {record.Name || '—'}
                </Text>
              </View>
            </View>
          </View>

          {/* Symptoms */}
          {symptoms.length > 0 && (
            <View style={styles.symptomsSection}>
              <Text style={[styles.symptomsTitle, { color: colors.textSecondary }]}>
                REPORTED SYMPTOMS
              </Text>
              <View style={styles.pillsWrap}>
                {symptoms.map((s, i) => (
                  <SymptomPill
                    key={i}
                    label={s}
                    colors={colors}
                    delay={i * 45}
                  />
                ))}
              </View>
            </View>
          )}
        </View>
      )}
    </Animated.View>
  );
};

// ─── Empty / error states ─────────────────────────────────────────────────────
const EmptyState = ({ colors }) => (
  <View style={styles.emptyWrap}>
    <Text style={styles.emptyIcon}>🩺</Text>
    <Text style={[styles.emptyTitle, { color: colors.text }]}>No Results Yet</Text>
    <Text style={[styles.emptySub, { color: colors.textSecondary }]}>
      Run a prediction above to see disease results here.
    </Text>
  </View>
);

// ─── Main exported component ──────────────────────────────────────────────────
/**
 * Usage in DiseasePredict.jsx — drop inside ScrollView after the submit button:
 *
 *   <DiseaseResult patientId={patient.Patient_id} refreshKey={predictions} />
 *
 * Pass `refreshKey={predictions}` so the list re-fetches after a new save.
 */
export default function DiseaseResult({ patientId, refreshKey }) {
  const { colors } = useAppTheme();
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState(null);

  const titleFade = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(titleFade, { toValue: 1, duration: 400, useNativeDriver: true }).start();
  }, []);

  useEffect(() => {
    if (!patientId) return;
    fetchRecords();
  }, [patientId, refreshKey]);

  const fetchRecords = async () => {
    setLoading(true);
    setFetchError(null);
    try {
      const res = await fetch(
        `${API_URL}/Patient-Disease?Patient_id=eq.${patientId}&order=created_at.desc`,
        { headers: HEADERS }
      );
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      setRecords(data || []);
    } catch (err) {
      console.error('DiseaseResult fetch error:', err);
      setFetchError('Could not load disease history.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.root}>
      {/* Section header */}
      <Animated.View style={[styles.sectionHeader, { opacity: titleFade }]}>
        <View style={styles.sectionTitleRow}>
          <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>
            DISEASE HISTORY
          </Text>
          {records.length > 0 && (
            <View style={[styles.countBadge, { backgroundColor: colors.primary + '20' }]}>
              <Text style={[styles.countBadgeText, { color: colors.primary }]}>
                {records.length}
              </Text>
            </View>
          )}
        </View>

        <TouchableOpacity onPress={fetchRecords} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
          <Text style={[styles.refreshLink, { color: colors.primary }]}>↻ Refresh</Text>
        </TouchableOpacity>
      </Animated.View>

      {/* States */}
      {loading ? (
        <View style={styles.loaderWrap}>
          <ActivityIndicator color={colors.primary} size="small" />
          <Text style={[styles.loaderText, { color: colors.textSecondary }]}>
            Loading history…
          </Text>
        </View>
      ) : fetchError ? (
        <View style={[styles.errorBox, { backgroundColor: (colors.error ?? '#ef4444') + '15', borderColor: (colors.error ?? '#ef4444') + '40' }]}>
          <Text style={[styles.errorText, { color: colors.error ?? '#ef4444' }]}>
            {fetchError}
          </Text>
          <TouchableOpacity onPress={fetchRecords} style={{ marginTop: 8 }}>
            <Text style={[styles.refreshLink, { color: colors.primary }]}>Try again</Text>
          </TouchableOpacity>
        </View>
      ) : records.length === 0 ? (
        <EmptyState colors={colors} />
      ) : (
        <View style={styles.cardsList}>
          {records.map((rec, i) => (
            <ResultCard key={rec.id} record={rec} colors={colors} index={i} />
          ))}
        </View>
      )}
    </View>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  root: {
    marginTop: 8,
    paddingHorizontal: 16,
    paddingBottom: 32,
  },

  // Section header
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 14,
    marginTop: 20,
  },
  sectionTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  sectionTitle: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 1.3,
  },
  countBadge: {
    borderRadius: 10,
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  countBadgeText: {
    fontSize: 11,
    fontWeight: '700',
  },
  refreshLink: {
    fontSize: 13,
    fontWeight: '600',
  },

  // Loader
  loaderWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingVertical: 20,
    justifyContent: 'center',
  },
  loaderText: {
    fontSize: 13,
  },

  // Error
  errorBox: {
    borderWidth: 1,
    borderRadius: 14,
    padding: 16,
    alignItems: 'center',
  },
  errorText: {
    fontSize: 13,
    fontWeight: '600',
    textAlign: 'center',
  },

  // Empty
  emptyWrap: {
    alignItems: 'center',
    paddingVertical: 36,
    gap: 8,
  },
  emptyIcon: { fontSize: 36 },
  emptyTitle: { fontSize: 16, fontWeight: '700' },
  emptySub: { fontSize: 13, textAlign: 'center', maxWidth: 240 },

  // Cards list
  cardsList: { gap: 12 },

  // Card
  card: {
    borderWidth: StyleSheet.hairlineWidth,
    borderRadius: 20,
    overflow: 'hidden',
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    paddingRight: 16,
    gap: 12,
  },
  accentBar: {
    width: 4,
    height: 44,
    borderRadius: 2,
    marginLeft: 14,
    flexShrink: 0,
  },
  diseaseName: {
    fontSize: 15,
    fontWeight: '700',
    letterSpacing: 0.1,
  },
  dateText: {
    fontSize: 11,
    marginTop: 3,
    fontWeight: '500',
  },
  confBadge: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 12,
    flexShrink: 0,
  },
  confBadgeText: {
    fontSize: 13,
    fontWeight: '800',
  },
  chevron: {
    fontSize: 10,
    flexShrink: 0,
  },

  // Card body
  cardBody: {
    borderTopWidth: StyleSheet.hairlineWidth,
    paddingHorizontal: 16,
    paddingTop: 18,
    paddingBottom: 20,
    gap: 20,
  },
  ringRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },

  // Ring
  ringWrap: {
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  ringTrack: {},
  ringFill: { position: 'absolute' },
  ringPct: {
    fontSize: 22,
    fontWeight: '800',
    letterSpacing: -0.5,
  },
  ringSub: {
    fontSize: 9,
    fontWeight: '600',
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },

  // Meta chips next to ring
  ringMeta: {
    flex: 1,
    gap: 8,
  },
  metaChip: {
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  metaChipLabel: {
    fontSize: 9,
    fontWeight: '700',
    letterSpacing: 1,
    marginBottom: 2,
  },
  metaChipValue: {
    fontSize: 14,
    fontWeight: '700',
  },

  // Symptoms
  symptomsSection: { gap: 10 },
  symptomsTitle: {
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 1.2,
  },
  pillsWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  pill: {
    borderWidth: 1,
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 5,
  },
  pillText: {
    fontSize: 12,
    fontWeight: '600',
    textTransform: 'capitalize',
  },
});