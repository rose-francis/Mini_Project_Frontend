import React from 'react';
import { View, Text ,StyleSheet} from 'react-native';

const DetailCard = ({ label, value, colors, delay }) => {
  return (
    <View
      style={[
        styles.detailCard,
        {
          backgroundColor: colors.card,
          borderColor: colors.border,
        },
      ]}
    >
      <View style={styles.detailTextGroup}>
        <Text style={[styles.detailLabel, { color: colors.textSecondary }]}>
          {label}
        </Text>
        <Text style={[styles.detailValue, { color: colors.text }]}>
          {value || '—'}
        </Text>
      </View>
    </View>
  );
};

const HlaRow = ({ label, val1, val2, colors }) => (
  <View style={[styles.hlaRow, { backgroundColor: colors.card, borderColor: colors.border }]}>
    <Text style={[styles.hlaLabel, { color: colors.textSecondary }]}>{label}</Text>
    <View style={styles.hlaValues}>
      <View style={[styles.hlaPill, { backgroundColor: colors.primary + '14', borderColor: colors.primary + '30' }]}>
        <Text style={[styles.hlaPillText, { color: colors.text }]}>{val1 || '—'}</Text>
      </View>
      <View style={[styles.hlaSep, { backgroundColor: colors.border }]} />
      <View style={[styles.hlaPill, { backgroundColor: colors.primary + '14', borderColor: colors.primary + '30' }]}>
        <Text style={[styles.hlaPillText, { color: colors.text }]}>{val2 || '—'}</Text>
      </View>
    </View>
  </View>
);

const SectionLabel = ({ text, colors }) => (
  <Text style={[styles.sectionLabel, { color: colors.textSecondary }]}>
    {text}
  </Text>
);

const Divider = ({ colors }) => (
  <View style={[styles.divider, { backgroundColor: colors.border }]} />
);

const PatientDetailsSection = ({
  fields,
  patient,
  colors,
  HLA_FIELD_META,
  styles,
}) => {
  return (
    <>
      {/* ── Personal Details ── */}
      <SectionLabel text="PERSONAL DETAILS" colors={colors} />
      <View style={styles.cardsWrap}>
        {fields.map(f => (
          <DetailCard
            key={f.key}
            label={f.label}
            value={f.value}
            colors={colors}
            delay={f.delay}
          />
        ))}
      </View>

      {/* ── HLA Typing ── */}
      <SectionLabel text="HLA TYPING" colors={colors} />
      <View style={styles.cardsWrap}>
        {HLA_FIELD_META.map(({ key1, key2, label }) => (
          <HlaRow
            key={label}
            label={label}
            val1={patient[key1]}
            val2={patient[key2]}
            colors={colors}
          />
        ))}
      </View>

      <Divider colors={colors} />
    </>
  );
};

export default PatientDetailsSection;

const styles = StyleSheet.create({
  container:      { flex: 1 },

  emptyContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 36 },
  emptyTitle:     { fontSize: 20, fontWeight: '700', marginBottom: 8 },
  emptySubtitle:  { fontSize: 14, textAlign: 'center', lineHeight: 20, marginBottom: 28 },
  emptyBackBtn:   { paddingHorizontal: 28, paddingVertical: 13, borderRadius: 50 },
  emptyBackBtnText: { color: '#fff', fontWeight: '600', fontSize: 15 },

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
  backArrow:    { fontSize: 28, lineHeight: 34, marginTop: -2, fontWeight: '300' },
  topBarTitle:  { fontSize: 16, fontWeight: '600', letterSpacing: 0.3 },

  scrollContent: { paddingBottom: 52 },

  sectionLabel: {
    fontSize: 11, fontWeight: '700', letterSpacing: 1.3,
    marginHorizontal: 20, marginBottom: 12, marginTop: 24,
  },

  cardsWrap:  { paddingHorizontal: 16, gap: 10, marginBottom: 8 },

  detailCard: {
    flexDirection: 'row', alignItems: 'center',
    borderWidth: StyleSheet.hairlineWidth, borderRadius: 16,
    padding: 14, gap: 14,
  },
  iconBadge:       { width: 46, height: 46, borderRadius: 13, alignItems: 'center', justifyContent: 'center' },
  iconText:        { fontSize: 21 },
  detailTextGroup: { flex: 1 },
  detailLabel:     { fontSize: 10, fontWeight: '700', letterSpacing: 1, marginBottom: 4 },
  detailValue:     { fontSize: 16, fontWeight: '600' },

  // HLA
  hlaRow: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    borderWidth: StyleSheet.hairlineWidth, borderRadius: 16,
    paddingHorizontal: 16, paddingVertical: 12,
  },
  hlaLabel:    { fontSize: 13, fontWeight: '600', letterSpacing: 0.3, flex: 1 },
  hlaValues:   { flexDirection: 'row', alignItems: 'center', gap: 8 },
  hlaPill:     { paddingHorizontal: 12, paddingVertical: 5, borderRadius: 8, borderWidth: 1 },
  hlaPillText: { fontSize: 13, fontWeight: '600' },
  hlaSep:      { width: StyleSheet.hairlineWidth, height: 20 },

  divider: { height: StyleSheet.hairlineWidth, marginHorizontal: 20, marginTop: 24 },

  // Input card
  inputCard: {
    marginHorizontal: 16, borderWidth: StyleSheet.hairlineWidth,
    borderRadius: 20, padding: 20, marginBottom: 8,
  },
  inputLabel: {
    fontSize: 10, fontWeight: '700', letterSpacing: 1.2, marginBottom: 8,
  },
  input: {
    borderWidth: 1, borderRadius: 14,
    paddingHorizontal: 14, paddingVertical: 13,
    marginBottom: 20, fontSize: 15,
  },

  submitBtn: {
    padding: 17, borderRadius: 16,
    alignItems: 'center', marginTop: 8, marginHorizontal: 16,
  },
  submitText: { color: '#fff', fontWeight: '700', fontSize: 16 },
});
