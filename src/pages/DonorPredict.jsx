import React, { useEffect, useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Animated,
  Alert,
  TextInput,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAppTheme } from '../../src/Theme/ThemeContext';
import { useSelector } from 'react-redux';
import { useNavigation } from '@react-navigation/native';
import { Dropdown } from 'react-native-element-dropdown';
import DonorTabs from '../components/DonorTabs.jsx';
import PatientDetailsSection from '../components/PatientDetailsSection.jsx';
import { SUPABASE_REST_URL as API_URL, SUPABASE_HEADERS as HEADERS, BACKEND_URL } from '../config/api';

const FIELD_META = {
  Name:       {label: 'FULL NAME' },
  Age:        {label: 'AGE' },
  Gender:     { label: 'GENDER' },
  BloodGroup: {label: 'BLOOD GROUP' },
  BodyMass:   {label: 'BODY MASS (kg)' },
  RhFactor:   {label: 'RH FACTOR' },
  CMVStatus:  {label: 'CMV STATUS' },
  Contact:    {label: 'CONTACT' },
};

const HLA_FIELD_META = [
  { key1: 'Hla_a_1',    key2: 'Hla_a_2',    label: 'HLA-A' },
  { key1: 'Hla_b_1',    key2: 'Hla_b_2',    label: 'HLA-B' },
  { key1: 'Hla_c_1',    key2: 'Hla_c_2',    label: 'HLA-C' },
  { key1: 'Hla_drb1_1', key2: 'Hla_drb1_2', label: 'HLA-DRB1' },
  { key1: 'Hla_dqb1_1', key2: 'Hla_dqb1_2', label: 'HLA-DQB1' },
];

const DISEASE_TYPE_OPTIONS = [
  { label: 'ALL', value: 'ALL' },
  { label: 'AML', value: 'AML' },
  { label: 'Chronic', value: 'Chronic' },
  { label: 'Non-malignant', value: 'Non-malignant' },
  { label: 'Lymphoma', value: 'Lymphoma' },
];

const DISEASE_GROUP_OPTIONS = [
  { label: 'Malignant', value: 'Malignant' },
  { label: 'Non-malignant', value: 'Non-malignant' },
];

const RISK_GROUP_OPTIONS = [
  { label: 'Low',    value: 'low' },
  { label: 'High',   value: 'high' },
];

const POST_RELAPSE_OPTIONS = [
  { label: 'Yes', value: 'yes' },
  { label: 'No',  value: 'no' },
];

// ─── Section Label ───────────────────────────────────────────────────────────
const SectionLabel = ({ text, colors }) => (
  <Text style={[styles.sectionLabel, { color: colors.textSecondary }]}>{text}</Text>
);

// ─── Main Screen ─────────────────────────────────────────────────────────────
export default function DonorPredict() {
  const { colors }   = useAppTheme();
  const navigation   = useNavigation();
  const patient      = useSelector(state => state.patient.selectedPatient);
  const isEmpty = (val) => val === null || val === undefined || val === '';

  const [diseaseType,  setDiseaseType]  = useState('');
  const [diseaseGroup, setDiseaseGroup] = useState('');
  const [riskGroup,    setRiskGroup]    = useState('');
  const [postRelapse,  setPostRelapse]  = useState('');
  const [loading,      setLoading]      = useState(false);
  const [donors, setDonors] = useState([]);
  const [loadingDonors, setLoadingDonors] = useState(true);
  
  
  useEffect(() => {
    const fetchDonors = async () => {
      try {
        const res = await fetch(
          `${API_URL}/Patient-Donor?Patient_id=eq.${patient.Patient_id}`,
          {
            headers: HEADERS,
          }
        );
  
        const data = await res.json();
        console.log("DATAAAAAAA: ",data)
        setDonors(data || []);
      } catch (err) {
        console.error('Error fetching donors:', err);
      } finally {
        setLoadingDonors(false);
      }
    };
  
    fetchDonors();
  }, []);

  useEffect(() => {
  setDiseaseType(patient.DiseaseType || '');
  setDiseaseGroup(patient.DiseaseGroup || '');
  setRiskGroup(patient.RiskGroup || '');
  setPostRelapse(patient.PostRelapse || '');
}, [patient]);

  // ── No patient guard ──────────────────────────────────────────────────────
  if (!patient) {
    return (
      <SafeAreaView style={[styles.emptyContainer, { backgroundColor: colors.background }]}>
        <Text style={styles.emptyIcon}>🔍</Text>
        <Text style={[styles.emptyTitle, { color: colors.text }]}>No Patient Selected</Text>
        <Text style={[styles.emptySubtitle, { color: colors.textSecondary }]}>
          Please go back and select a patient first.
        </Text>
        <TouchableOpacity
          style={[styles.emptyBackBtn, { backgroundColor: colors.primary }]}
          onPress={() => navigation.goBack()}
          activeOpacity={0.8}
        >
          <Text style={styles.emptyBackBtnText}>← Go Back</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  // ── Submit ────────────────────────────────────────────────────────────────
  const handleSubmit = async () => {
    if (isEmpty(patient.DiseaseType) && !diseaseType.trim()) {
      Alert.alert('Missing Field', 'Please enter Disease Type.');
      return;
    }
    if (isEmpty(patient.DiseaseGroup) && !diseaseGroup.trim() ) {
      Alert.alert('Missing Field', 'Please enter Disease Group.');
      return;
    }
    if (isEmpty(patient.RiskGroup) && !riskGroup) {
      Alert.alert('Missing Field', 'Please select a Risk Group.');
      return;
    }
    if (isEmpty(patient.PostRelapse) && !postRelapse) {
      Alert.alert('Missing Field', 'Please select Post Relapse status.');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(
        `${API_URL}/Patient?Patient_id=eq.${patient.Patient_id}`,
        {
          method: 'PATCH',
          headers: { ...HEADERS, Prefer: 'return=minimal' },
          body: JSON.stringify({
            DiseaseType:  diseaseType.trim(),
            DiseaseGroup: diseaseGroup.trim(),
            RiskGroup:    riskGroup,
            PostRelapse:  postRelapse,
          }),
        }
      );

      if (!res.ok) {
        const err = await res.text();
        console.error('PATCH error:', err);
        Alert.alert('Error', 'Failed to update patient record.');
        return;
      }
      let top5Data = [];
      try {
        const top5Res = await fetch(`${BACKEND_URL}/find-top5/${patient.Patient_id}`, { method: 'POST' });

        if (top5Res.ok) {
          top5Data = await top5Res.json();
          console.log("Top 5 matches:", top5Data.data);      // the array
          console.log("Message:", top5Data.message);          // success message
        } else {
          const err = await top5Res.text();
          console.error("Top5 error:", err);
          Alert.alert("Warning", "Patient updated but failed to generate matches.");
        }
      } catch (err) {
        console.error("Top5 fetch failed:", err);
        Alert.alert("Warning", "Patient updated but failed to generate matches.");
      }

      // ✅ show success anyway
      Alert.alert("Saved", "Patient updated ✅", [
        { text: "OK", onPress: () => navigation.navigate("MainTabs") },
      ]);
    } catch (err) {
      console.error(err);
      Alert.alert('Error', 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // ── Derived data ─────────────────────────────────────────────────────────
  const fields = Object.entries(FIELD_META).map(([key, meta], i) => ({
    ...meta, value: patient[key], key, delay: 80 + i * 55,
  }));

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: colors.background }]}
      edges={['top']}
    >
      {/* Top Navigation Bar */}
      <View style={[styles.topBar, { borderBottomColor: colors.border }]}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={[styles.backBtn, { backgroundColor: colors.card, borderColor: colors.border }]}
          activeOpacity={0.7}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <Text style={[styles.backArrow, { color: colors.text }]}>‹</Text>
        </TouchableOpacity>
        <Text style={[styles.topBarTitle, { color: colors.text }]}>Patient Profile</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* ── Personal Details ─────────────────────────────────────── */}
        <PatientDetailsSection
          fields={fields}
          patient={patient}
          colors={colors}
          HLA_FIELD_META={HLA_FIELD_META}
          styles={styles}
        />

        {/* ── Clinical Assessment ──────────────────────────────────── */}
        <SectionLabel text="CLINICAL ASSESSMENT" colors={colors} />

        <View style={[styles.inputCard, { backgroundColor: colors.card, borderColor: colors.border }]}>

        {/* Disease Type */}
        <Text style={[styles.inputLabel, { color: colors.textSecondary }]}>DISEASE TYPE</Text>
        {isEmpty(patient.DiseaseType) ? (
            <Dropdown
              style={[styles.input, { borderColor: colors.border }]}
              data={DISEASE_TYPE_OPTIONS}
              labelField="label"
              valueField="value"
              placeholder="Select disease type"
              value={diseaseType}
              onChange={item => setDiseaseType(item.value)}
              placeholderStyle={{ color: colors.textSecondary }}
              selectedTextStyle={{ color: colors.text }}
            />
        ) : (
            <Text style={[styles.detailValue, { color: colors.text, marginBottom: 20 }]}>
            {patient.DiseaseType}
            </Text>
        )}

        {/* Disease Group */}
        <Text style={[styles.inputLabel, { color: colors.textSecondary }]}>DISEASE GROUP</Text>
        {isEmpty(patient.DiseaseGroup) ? (
            <Dropdown
              style={[styles.input, { borderColor: colors.border }]}
              data={DISEASE_GROUP_OPTIONS}
              labelField="label"
              valueField="value"
              placeholder="Select disease group"
              value={diseaseGroup}
              onChange={item => setDiseaseGroup(item.value)}
              placeholderStyle={{ color: colors.textSecondary }}
              selectedTextStyle={{ color: colors.text }}
            />
        ) : (
            <Text style={[styles.detailValue, { color: colors.text, marginBottom: 20 }]}>
            {patient.DiseaseGroup}
            </Text>
        )}

        {/* Risk Group */}
        <Text style={[styles.inputLabel, { color: colors.textSecondary }]}>RISK GROUP</Text>
        {isEmpty(patient.RiskGroup) ? (
            <Dropdown
            style={[styles.input, { borderColor: colors.border }]}
            data={RISK_GROUP_OPTIONS}
            labelField="label"
            valueField="value"
            placeholder="Select risk level"
            value={riskGroup}
            onChange={item => setRiskGroup(item.value)}
            placeholderStyle={{ color: colors.textSecondary }}
            selectedTextStyle={{ color: colors.text }}
            />
        ) : (
            <Text style={[styles.detailValue, { color: colors.text, marginBottom: 20 }]}>
            {patient.RiskGroup}
            </Text>
        )}

        {/* Post Relapse */}
        <Text style={[styles.inputLabel, { color: colors.textSecondary }]}>POST RELAPSE</Text>
        {isEmpty(patient.PostRelapse) ? (
            <Dropdown
            style={[styles.input, { borderColor: colors.border, marginBottom: 4 }]}
            data={POST_RELAPSE_OPTIONS}
            labelField="label"
            valueField="value"
            placeholder="Select status"
            value={postRelapse}
            onChange={item => setPostRelapse(item.value)}
            placeholderStyle={{ color: colors.textSecondary }}
            selectedTextStyle={{ color: colors.text }}
            />
        ) : (
            <Text style={[styles.detailValue, { color: colors.text }]}>
            {patient.PostRelapse}
            </Text>
        )}

        </View>

        {!loadingDonors && donors.length > 0 && (
            <>
              <Text style={[styles.sectionLabel, { color: colors.textSecondary }]}>
                MATCHED DONORS
              </Text>
              <DonorTabs donors={donors} colors={colors} />
            </>
          )}

        {/* Submit */}
        {!loadingDonors && donors.length === 0  && <TouchableOpacity
          style={[
            styles.submitBtn,
            { backgroundColor: loading ? colors.primary + '88' : colors.primary },
          ]}
          onPress={handleSubmit}
          activeOpacity={0.8}
          disabled={loading}
        >
          <Text style={styles.submitText}>
            {loading ? 'Saving...' : 'Predict Donor'}
          </Text>
        </TouchableOpacity>}

      </ScrollView>
    </SafeAreaView>
  );
}

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
