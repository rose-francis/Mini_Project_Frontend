import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Animated,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAppTheme } from '../../src/Theme/ThemeContext';
import { useNavigation, useRoute } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { SUPABASE_REST_URL, SUPABASE_HEADERS as BASE_HEADERS } from '../config/api';

// ─── Reusable detail card ────────────────────────────────────────────────────
const DetailCard = ({ label, value, colors, delay = 0 }) => {
  const fade = useRef(new Animated.Value(0)).current;
  const slide = useRef(new Animated.Value(20)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fade, { toValue: 1, duration: 400, delay, useNativeDriver: true }),
      Animated.timing(slide, { toValue: 0, duration: 350, delay, useNativeDriver: true }),
    ]).start();
  }, []);

  return (
    <Animated.View
      style={[
        styles.card,
        {
          backgroundColor: colors.card,
          borderColor: colors.border,
          opacity: fade,
          transform: [{ translateY: slide }],
        },
      ]}
    >
      <Text style={[styles.label, { color: colors.textSecondary }]}>{label}</Text>
      <Text style={[styles.value, { color: colors.text }]}>{value ?? '—'}</Text>
    </Animated.View>
  );
};

// ─── Score pill ───────────────────────────────────────────────────────────────
const ScorePill = ({ label, value, color, colors }) => (
  <View style={[styles.scorePill, { backgroundColor: color + '18', borderColor: color + '40' }]}>
    <Text style={[styles.scorePillLabel, { color: colors.textSecondary }]}>{label}</Text>
    <Text style={[styles.scorePillValue, { color }]}>
      {value != null ? (typeof value === 'number' ? value.toFixed(1) + '%' : value) : '—'}
    </Text>
  </View>
);

// ─── Matched patient card ─────────────────────────────────────────────────────
const MatchedPatientCard = ({ match, patient, colors }) => {
  const fade = useRef(new Animated.Value(0)).current;
  const slide = useRef(new Animated.Value(24)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fade, { toValue: 1, duration: 450, delay: 100, useNativeDriver: true }),
      Animated.timing(slide, { toValue: 0, duration: 400, delay: 100, useNativeDriver: true }),
    ]).start();
  }, []);

  const compatScore = match.CompatabilityScore;
  const scoreColor =
    compatScore >= 80
      ? colors.success
      : compatScore >= 50
      ? '#F59E0B'
      : colors.error;

  const patientInitials = patient?.Name
    ? patient.Name.trim().split(' ').map((n) => n[0]).slice(0, 2).join('').toUpperCase()
    : '?';

  return (
    <Animated.View
      style={[
        styles.matchCard,
        {
          backgroundColor: colors.card,
          borderColor: colors.success + '55',
          opacity: fade,
          transform: [{ translateY: slide }],
        },
      ]}
    >
      {/* Header row */}
      <View style={styles.matchCardHeader}>
        <View style={[styles.patientAvatar, { backgroundColor: colors.primary + '18', borderColor: colors.primary + '44' }]}>
          <Text style={[styles.patientAvatarText, { color: colors.primary }]}>{patientInitials}</Text>
        </View>

        <View style={{ flex: 1 }}>
          <Text style={[styles.matchName, { color: colors.text }]}>{match.Patient_Name ?? patient?.Name ?? '—'}</Text>
          <Text style={[styles.matchId, { color: colors.textSecondary }]}>Patient ID: {match.Patient_id}</Text>
        </View>

        {/* Compatibility score badge */}
        <View style={[styles.compatBadge, { backgroundColor: scoreColor + '20' }]}>
          <Text style={[styles.compatScore, { color: scoreColor }]}>
            {compatScore != null ? compatScore + '%' : '—'}
          </Text>
          <Text style={[styles.compatLabel, { color: scoreColor }]}>Match</Text>
        </View>
      </View>

      {/* HLA / ABO match chips */}
      <View style={styles.chipRow}>
        {match.HlaMatch != null && (
          <View style={[styles.chip, { backgroundColor: colors.primary + '15' }]}>
            <Icon name="dna" size={12} color={colors.primary} />
            <Text style={[styles.chipText, { color: colors.primary }]}>HLA: {match.HlaMatch}</Text>
          </View>
        )}
        {match.AboMatch != null && (
          <View style={[styles.chip, { backgroundColor: colors.primary + '15' }]}>
            <Icon name="water" size={12} color={colors.primary} />
            <Text style={[styles.chipText, { color: colors.primary }]}>ABO: {match.AboMatch}</Text>
          </View>
        )}
        {match.Antigen != null && (
          <View style={[styles.chip, { backgroundColor: '#8B5CF620' }]}>
            <Text style={[styles.chipText, { color: '#8B5CF6' }]}>Ag: {match.Antigen}</Text>
          </View>
        )}
        {match.Allele != null && (
          <View style={[styles.chip, { backgroundColor: '#8B5CF620' }]}>
            <Text style={[styles.chipText, { color: '#8B5CF6' }]}>Al: {match.Allele}</Text>
          </View>
        )}
      </View>

      {/* Risk scores */}
      <View style={styles.scoreRow}>
        <ScorePill label="Survival" value={match.Survival} color={colors.success} colors={colors} />
        <ScorePill label="GvHD Risk" value={match.GvhdRisk} color={colors.error} colors={colors} />
        <ScorePill label="Relapse" value={match.RelapseRisk} color="#F59E0B" colors={colors} />
      </View>

      {/* Patient clinical info (if fetched) */}
      {patient && (
        <View style={[styles.patientMeta, { borderTopColor: colors.border }]}>
          <View style={styles.metaItem}>
            <Icon name="cake-variant" size={13} color={colors.textSecondary} />
            <Text style={[styles.metaText, { color: colors.textSecondary }]}>{patient.Age} yrs</Text>
          </View>
          <View style={styles.metaItem}>
            <Icon name="gender-male-female" size={13} color={colors.textSecondary} />
            <Text style={[styles.metaText, { color: colors.textSecondary }]}>{patient.Gender}</Text>
          </View>
          <View style={styles.metaItem}>
            <Icon name="water-outline" size={13} color={colors.textSecondary} />
            <Text style={[styles.metaText, { color: colors.textSecondary }]}>{patient.BloodGroup}</Text>
          </View>
          <View style={styles.metaItem}>
            <Icon name="hospital-box-outline" size={13} color={colors.textSecondary} />
            <Text style={[styles.metaText, { color: colors.textSecondary }]}>{patient.DiseaseType ?? '—'}</Text>
          </View>
          <View style={styles.metaItem}>
            <Icon name="alert-circle-outline" size={13} color={colors.textSecondary} />
            <Text style={[styles.metaText, { color: colors.textSecondary }]}>{patient.RiskGroup ?? '—'}</Text>
          </View>
        </View>
      )}
    </Animated.View>
  );
};

// ─── Main screen ──────────────────────────────────────────────────────────────
export default function DonorDetail() {
  const { colors } = useAppTheme();
  const navigation = useNavigation();
  const route = useRoute();
  const { donor } = route.params;

  const [matchData, setMatchData] = useState(null);   // array of Patient-Donor rows
  const [patientMap, setPatientMap] = useState({});   // { Patient_id: patientObj }
  const [matchLoading, setMatchLoading] = useState(true);

  const headerFade = useRef(new Animated.Value(0)).current;
  const headerSlide = useRef(new Animated.Value(-12)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(headerFade, { toValue: 1, duration: 500, useNativeDriver: true }),
      Animated.timing(headerSlide, { toValue: 0, duration: 420, useNativeDriver: true }),
    ]).start();

    fetchMatchData();
  }, []);

  const fetchMatchData = async () => {
    try {
      // 1. Get all Patient-Donor rows for this donor
      const matchRes = await fetch(
        `${SUPABASE_REST_URL}/Patient-Donor?Donor_id=eq.${donor.Donor_id}&select=*`,
        { headers: BASE_HEADERS }
      );
      const matches = await matchRes.json();
      setMatchData(matches);

      if (matches.length === 0) {
        setMatchLoading(false);
        return;
      }

      // 2. Fetch each matched patient's full record
      const patientIds = [...new Set(matches.map((m) => m.Patient_id).filter(Boolean))];
      const patientRes = await fetch(
        `${SUPABASE_REST_URL}/Patient?Patient_id=in.(${patientIds.join(',')})&select=*`,
        { headers: BASE_HEADERS }
      );
      const patients = await patientRes.json();
      const map = {};
      patients.forEach((p) => { map[p.Patient_id] = p; });
      setPatientMap(map);
    } catch (err) {
      console.log('Error fetching match data:', err);
    } finally {
      setMatchLoading(false);
    }
  };

  if (!donor) return null;

  const initials = donor.Name
    ? donor.Name.trim().split(' ').map((n) => n[0]).slice(0, 2).join('').toUpperCase()
    : '?';

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top']}>
      {/* Top Bar */}
      <View style={[styles.topBar, { borderBottomColor: colors.border }]}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={[styles.backBtn, { backgroundColor: colors.card, borderColor: colors.border }]}
        >
          <Text style={[styles.backArrow, { color: colors.text }]}>‹</Text>
        </TouchableOpacity>
        <Text style={[styles.titleTop, { color: colors.text }]}>Donor Profile</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Hero */}
        <Animated.View
          style={[styles.hero, { opacity: headerFade, transform: [{ translateY: headerSlide }] }]}
        >
          <View style={[styles.avatar, { backgroundColor: colors.primary + '1A', borderColor: colors.primary + '44' }]}>
            <Text style={[styles.avatarText, { color: colors.primary }]}>{initials}</Text>
          </View>
          <Text style={[styles.heroName, { color: colors.text }]}>{donor.Name}</Text>
          <View style={[styles.heroPill, { backgroundColor: colors.error + '20' }]}>
            <Text style={[styles.heroPillText, { color: colors.error }]}>
              ID: {donor.Donor_id} · {donor.RiskGroup || 'N/A'}
            </Text>
          </View>
        </Animated.View>

        {/* Clinical Details */}
        <Text style={[styles.sectionLabel, { color: colors.textSecondary }]}>CLINICAL DETAILS</Text>
        <View style={styles.cardsWrap}>
          <DetailCard label="Age" value={donor.Age} colors={colors} />
          <DetailCard label="Gender" value={donor.Gender} colors={colors} delay={50} />
          <DetailCard label="Blood Group" value={donor.BloodGroup} colors={colors} delay={100} />
          <DetailCard label="Body Mass" value={donor.BodyMass} colors={colors} delay={150} />
          <DetailCard label="CMV Status" value={donor.CMVStatus} colors={colors} delay={200} />
        </View>

        {/* HLA Typing */}
        <Text style={[styles.sectionLabel, { color: colors.textSecondary }]}>HLA TYPING</Text>
        <View style={styles.cardsWrap}>
          <DetailCard label="HLA-A" value={`${donor.Hla_a_1 || '-'} / ${donor.Hla_a_2 || '-'}`} colors={colors} />
          <DetailCard label="HLA-B" value={`${donor.Hla_b_1 || '-'} / ${donor.Hla_b_2 || '-'}`} colors={colors} delay={50} />
          <DetailCard label="HLA-C" value={`${donor.Hla_c_1 || '-'} / ${donor.Hla_c_2 || '-'}`} colors={colors} delay={100} />
          <DetailCard label="HLA-DRB1" value={`${donor.Hla_drb1_1 || '-'} / ${donor.Hla_drb1_2 || '-'}`} colors={colors} delay={150} />
          <DetailCard label="HLA-DQB1" value={`${donor.Hla_dqb1_1 || '-'} / ${donor.Hla_dqb1_2 || '-'}`} colors={colors} delay={200} />
        </View>

        {/* ── Matched Patients ─────────────────────────────────────────── */}
        <Text style={[styles.sectionLabel, { color: colors.textSecondary }]}>MATCHED PATIENTS</Text>

        {matchLoading ? (
          <ActivityIndicator size="small" color={colors.primary} style={{ marginVertical: 20 }} />
        ) : matchData && matchData.length > 0 ? (
          <View style={styles.cardsWrap}>
            {matchData.map((match) => (
              <MatchedPatientCard
                key={match.id}
                match={match}
                patient={patientMap[match.Patient_id] ?? null}
                colors={colors}
              />
            ))}
          </View>
        ) : (
          <View style={[styles.emptyBox, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <Icon name="account-off-outline" size={32} color={colors.textSecondary} />
            <Text style={[styles.emptyText, { color: colors.textSecondary }]}>No matched patients yet</Text>
          </View>
        )}

        <View style={{ height: 60 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },

  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },

  backBtn: {
    width: 40, height: 40, borderRadius: 20,
    borderWidth: 1, alignItems: 'center', justifyContent: 'center',
  },
  backArrow: { fontSize: 28, marginTop: -2 },
  titleTop: { fontSize: 16, fontWeight: '600' },

  scrollContent: { paddingBottom: 40 },

  hero: { alignItems: 'center', paddingTop: 36, paddingBottom: 30 },

  avatar: {
    width: 90, height: 90, borderRadius: 45,
    borderWidth: 2, alignItems: 'center', justifyContent: 'center', marginBottom: 14,
  },
  avatarText: { fontSize: 34, fontWeight: '700' },
  heroName: { fontSize: 22, fontWeight: '700', marginBottom: 10 },

  heroPill: { paddingHorizontal: 16, paddingVertical: 6, borderRadius: 20 },
  heroPillText: { fontSize: 13, fontWeight: '600' },

  sectionLabel: {
    fontSize: 11, fontWeight: '700', letterSpacing: 1.3,
    marginHorizontal: 20, marginTop: 24, marginBottom: 10,
  },

  cardsWrap: { paddingHorizontal: 16, gap: 10 },

  // Simple detail card
  card: {
    borderWidth: StyleSheet.hairlineWidth,
    borderRadius: 16, padding: 14,
  },
  label: { fontSize: 10, fontWeight: '700', letterSpacing: 1, marginBottom: 4 },
  value: { fontSize: 16, fontWeight: '600' },

  // Matched patient card
  matchCard: {
    borderWidth: 1.5,
    borderRadius: 18,
    padding: 16,
    gap: 12,
  },

  matchCardHeader: { flexDirection: 'row', alignItems: 'center', gap: 12 },

  patientAvatar: {
    width: 46, height: 46, borderRadius: 23,
    borderWidth: 1.5, alignItems: 'center', justifyContent: 'center',
  },
  patientAvatarText: { fontSize: 18, fontWeight: '700' },

  matchName: { fontSize: 15, fontWeight: '700' },
  matchId: { fontSize: 12, marginTop: 2 },

  compatBadge: {
    alignItems: 'center', paddingHorizontal: 12,
    paddingVertical: 6, borderRadius: 14,
  },
  compatScore: { fontSize: 18, fontWeight: '800' },
  compatLabel: { fontSize: 10, fontWeight: '600' },

  chipRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
  chip: {
    flexDirection: 'row', alignItems: 'center', gap: 4,
    paddingHorizontal: 10, paddingVertical: 4, borderRadius: 10,
  },
  chipText: { fontSize: 11, fontWeight: '600' },

  scoreRow: { flexDirection: 'row', gap: 8 },
  scorePill: {
    flex: 1, alignItems: 'center', paddingVertical: 8,
    borderRadius: 12, borderWidth: 1,
  },
  scorePillLabel: { fontSize: 10, fontWeight: '600', marginBottom: 2 },
  scorePillValue: { fontSize: 14, fontWeight: '800' },

  patientMeta: {
    flexDirection: 'row', flexWrap: 'wrap', gap: 10,
    borderTopWidth: StyleSheet.hairlineWidth, paddingTop: 10,
  },
  metaItem: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  metaText: { fontSize: 12 },

  emptyBox: {
    marginHorizontal: 16, borderWidth: 1, borderRadius: 16,
    padding: 24, alignItems: 'center', gap: 8,
  },
  emptyText: { fontSize: 14 },
});