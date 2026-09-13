import React, { useEffect, useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Animated,
  Alert,           
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAppTheme } from '../../src/Theme/ThemeContext';
import { useSelector } from 'react-redux';
import { useNavigation } from '@react-navigation/native';
import SymptomSelector from '../components/Multiselect';
import { predictDisease } from '../services/diseaseService';
import PatientDetailsSection from '../components/PatientDetailsSection';
import DiseaseResult from '../components/DiseaseResult';
import { SUPABASE_REST_URL as API_URL, SUPABASE_HEADERS as HEADERS } from '../config/api';


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


const SectionLabel = ({ text, colors }) => (
  <Text style={[styles.sectionLabel, { color: colors.textSecondary }]}>{text}</Text>
);

// const PredictionCard = ({ disease, confidence, colors, delay }) => {
//   const fadeAnim = useRef(new Animated.Value(0)).current;
//   const slideAnim = useRef(new Animated.Value(20)).current;

//   useEffect(() => {
//     Animated.parallel([
//       Animated.timing(fadeAnim, { toValue: 1, duration: 400, delay, useNativeDriver: true }),
//       Animated.timing(slideAnim, { toValue: 0, duration: 350, delay, useNativeDriver: true }),
//     ]).start();
//   }, [delay]);

//   const getConfidenceColor = (conf) => {
//     if (conf >= 70) return '#10b981';
//     if (conf >= 50) return '#f59e0b';
//     return '#ef4444';
//   };

//   return (
//     <Animated.View
//       style={[
//         styles.predictionCard,
//         {
//           backgroundColor: colors.card,
//           borderColor: colors.border,
//           opacity: fadeAnim,
//           transform: [{ translateY: slideAnim }],
//         },
//       ]}
//     >
//       <View style={styles.predictionContent}>
//         <View style={styles.predictionInfo}>
//           <Text style={[styles.predictionDisease, { color: colors.text }]}>
//             {disease}
//           </Text>
//           <Text style={[styles.predictionConfidence, { color: colors.textSecondary }]}>
//             Predicted disease
//           </Text>
//         </View>
//         <View
//           style={[
//             styles.confidenceBadge,
//             { backgroundColor: getConfidenceColor(confidence) + '20' },
//           ]}
//         >
//           <Text style={[styles.confidenceText, { color: getConfidenceColor(confidence) }]}>
//             {confidence}%
//           </Text>
//         </View>
//       </View>
//       <View
//         style={[
//           styles.confidenceBar,
//           {
//             backgroundColor: colors.border,
//           },
//         ]}
//       >
//         <View
//           style={[
//             styles.confidenceFill,
//             {
//               width: `${confidence}%`,
//               backgroundColor: getConfidenceColor(confidence),
//             },
//           ]}
//         />
//       </View>
//     </Animated.View>
//   );
// };


export default function DiseasePredict() {
  const { colors } = useAppTheme();
  const navigation = useNavigation();
  const patient = useSelector(state => state.patient.selectedPatient);

  const headerFade = useRef(new Animated.Value(0)).current;
  const headerSlide = useRef(new Animated.Value(-12)).current;

  const [selectedSymptoms, setSelectedSymptoms] = useState([]);
  const [loading, setLoading] = useState(false);
  const [predictions, setPredictions] = useState(null);
  const [error, setError] = useState(null);

  const validateFields = () => {
    if (selectedSymptoms.length === 0)
      return "Please select at least one symptom";
    return null;
  };

  const [hasPriorPrediction, setHasPriorPrediction] = useState(false);

useEffect(() => {
  if (!patient?.Patient_id) return;
  const check = async () => {
    const res = await fetch(
      `${API_URL}/Patient-Disease?Patient_id=eq.${patient.Patient_id}&select=id&limit=1`,
      { headers: HEADERS }
    );
    const data = await res.json();
    setHasPriorPrediction(data.length > 0);
  };
  check();
}, [patient?.Patient_id]);

  const handleSubmit = async () => {
    const error = validateFields();
    if (error) {
      Alert.alert('Incomplete Form', error);
      return;
    }

    setLoading(true);
    setError(null);
    setPredictions(null);

    try {
      // Call Flask backend to get predictions
      const predictionResult = await predictDisease(selectedSymptoms);
      
      if (predictionResult && predictionResult.predictions) {
        setPredictions(predictionResult);
        
        // Show the top prediction
        const topPrediction = predictionResult.predictions[0];
        
        // Show warning if confidence is low
        // if (predictionResult.low_confidence) {
          Alert.alert(
            // 'Low Confidence',
            // `The model confidence is below 30%. Top prediction: ${topPrediction.disease} (${topPrediction.confidence}%)`,
            // [{ text: 'OK' }]
            'Predictions generated successfully'
          );
        // }

        // Show unrecognized symptoms warning if any
        if (predictionResult.unrecognised_symptoms && predictionResult.unrecognised_symptoms.length > 0) {
          Alert.alert(
            'Unrecognized Symptoms',
            `The following symptoms were not recognized: ${predictionResult.unrecognised_symptoms.join(', ')}`
          );
        }
      }
    } catch (err) {
      console.error('Prediction error:', err);
      setError(err.message || 'Failed to get predictions');
      Alert.alert(
        'Prediction Error',
        'Could not connect to the disease prediction service. Please check if the backend is running.',
        [{ text: 'OK' }]
      );
    } finally {
      setLoading(false);
    }
  };

  const handleSaveToDatabase = async () => {
    if (!predictions) {
      Alert.alert('Error', 'No predictions to save');
      return;
    }

    setLoading(true);
    try {
      // Save to Supabase
      const topPrediction = predictions.predictions[0];
      const diseaseRes = await fetch(`${API_URL}/Patient-Disease`, {
        method: 'POST',
        headers: { ...HEADERS, Prefer: 'return=minimal' },
        body: JSON.stringify({
          Name: patient.Name,
          Patient_id: patient.Patient_id,
          Symptoms: selectedSymptoms,
          Predicted_disease: topPrediction.disease,
          Confidence: topPrediction.confidence,
        }),
      });

      if (!diseaseRes.ok) {
        const err = await diseaseRes.text();
        console.error('Disease insert error:', err);
        Alert.alert('Error', 'Failed to save to database.');
        return;
      }

      Alert.alert('Success', `Saved! Predicted disease: ${topPrediction.disease}`, [
        { text: 'OK', onPress: () => navigation.navigate('MainTabs') },
      ]);
      // inside handleSaveToDatabase, after Alert confirm
      setHasPriorPrediction(true);
    } catch (err) {
      console.error(err);
      Alert.alert('Error', 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

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

  const initials = patient.Name
    ? patient.Name.trim().split(/\s+/).map(n => n[0]).slice(0, 2).join('').toUpperCase()
    : '?';

  const fields = Object.entries(FIELD_META).map(([key, meta], i) => ({
    ...meta, value: patient[key], key, delay: 120 + i * 65,
  }));

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top']}>

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

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>

        {/* ── Personal Details ─────────────────────────────────────── */}
        <PatientDetailsSection
          fields={fields}
          patient={patient}
          colors={colors}
          HLA_FIELD_META={HLA_FIELD_META}
          styles={styles}
        />

        {/* Prediction Results */}
        {/* {predictions && (
          <View>
            <SectionLabel text="DISEASE PREDICTIONS" colors={colors} />
            <View style={styles.predictionsContainer}>
              {predictions.predictions.map((pred, index) => (
                <PredictionCard
                  key={index}
                  disease={pred.disease}
                  confidence={pred.confidence}
                  colors={colors}
                  delay={100 + index * 100}
                />
              ))}
            </View>

            {predictions.unrecognised_symptoms && predictions.unrecognised_symptoms.length > 0 && (
              <View style={styles.warningBox}>
                <Text style={[styles.warningTitle, { color: colors.text }]}>⚠️ Unrecognized Symptoms</Text>
                <Text style={[styles.warningText, { color: colors.textSecondary }]}>
                  {predictions.unrecognised_symptoms.join(', ')}
                </Text>
              </View>
            )}

            {predictions.low_confidence && (
              <View style={styles.warningBox}>
                <Text style={[styles.warningTitle, { color: colors.text }]}>⚠️ Low Confidence</Text>
                <Text style={[styles.warningText, { color: colors.textSecondary }]}>
                  The model confidence is below 30%. Please consult a medical professional.
                </Text>
              </View>
            )}
          </View>
        )} */}

        {error && (
          <View style={[styles.errorBox, { backgroundColor: '#fee2e2' }]}>
            <Text style={{ color: '#991b1b', fontWeight: '600' }}>❌ Error</Text>
            <Text style={{ color: '#7f1d1d', marginTop: 4 }}>{error}</Text>
          </View>
        )}

        {/* Submit Buttons */}
{!hasPriorPrediction && (
  <>
  {/* Symptoms */}
        <SectionLabel text="SELECTED SYMPTOMS" colors={colors} />

        <SymptomSelector
          selected={selectedSymptoms}
          setSelected={setSelectedSymptoms}
        />

    {!predictions && (
      <TouchableOpacity
        style={[styles.submitBtn, { backgroundColor: loading ? colors.primary + '88' : colors.primary }]}
        onPress={handleSubmit}
        activeOpacity={0.8}
        disabled={loading}
      >
        <Text style={styles.submitText}>
          {loading ? 'Processing...' : 'Get Predictions'}
        </Text>
      </TouchableOpacity>
    )}

    {predictions?.predictions?.length > 0 && (
      <TouchableOpacity
        style={[styles.submitBtn, { backgroundColor: loading ? colors.primary + '88' : colors.primary }]}
        onPress={handleSaveToDatabase}
        activeOpacity={0.8}
        disabled={loading}
      >
        <Text style={styles.submitText}>
          {loading ? 'Saving...' : 'Save Symptoms'}
        </Text>
      </TouchableOpacity>
    )}
  </>
)}

        <DiseaseResult
          patientId={patient.Patient_id}
          refreshKey={predictions}   // re-fetches whenever a new prediction is saved
        />

      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },

  emptyContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 36 },
  emptyIcon: { fontSize: 48, marginBottom: 16 },
  emptyTitle: { fontSize: 20, fontWeight: '700', marginBottom: 8 },
  emptySubtitle: { fontSize: 14, textAlign: 'center', lineHeight: 20, marginBottom: 28 },
  emptyBackBtn: { paddingHorizontal: 28, paddingVertical: 13, borderRadius: 50 },
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
  backArrow: { fontSize: 28, lineHeight: 34, marginTop: -2, fontWeight: '300' },
  topBarTitle: { fontSize: 16, fontWeight: '600', letterSpacing: 0.3 },

  scrollContent: { paddingBottom: 48 },

  heroSection: {
    alignItems: 'center',
    paddingTop: 36,
    paddingBottom: 32,
    paddingHorizontal: 24,
  },
  avatar: {
    width: 90, height: 90, borderRadius: 45,
    borderWidth: 2, alignItems: 'center', justifyContent: 'center', marginBottom: 14,
  },
  avatarInitials: { fontSize: 34, fontWeight: '700' },
  heroName: { fontSize: 23, fontWeight: '700', marginBottom: 10, letterSpacing: 0.2 },
  heroPill: { paddingHorizontal: 16, paddingVertical: 6, borderRadius: 24 },
  heroPillText: { fontSize: 13, fontWeight: '600', letterSpacing: 0.4 },

  sectionLabel: {
    fontSize: 11, fontWeight: '700', letterSpacing: 1.3,
    marginHorizontal: 20, marginBottom: 15, marginTop: 24,
  },

  cardsWrap: { paddingHorizontal: 16, gap: 10, marginBottom: 24 },
  detailCard: {
    flexDirection: 'row', alignItems: 'center',
    borderWidth: StyleSheet.hairlineWidth, borderRadius: 16,
    padding: 14, gap: 14,
  },
  detailTextGroup: { flex: 1 },
  detailLabel: { fontSize: 10, fontWeight: '700', letterSpacing: 1, marginBottom: 4 },
  detailValue: { fontSize: 16, fontWeight: '600' },

  symptomsGrid: {
    flexDirection: 'row', flexWrap: 'wrap',
    gap: 10, marginBottom: 24, paddingHorizontal: 16,
  },
  symptomCard: {
    width: '47.5%', borderWidth: 1, borderRadius: 16,
    padding: 14, gap: 12,
  },
  symptomHeader: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  symptomIcon: { fontSize: 20 },
  symptomLabel: { fontSize: 13, fontWeight: '600', flex: 1 },

  pillRow: { flexDirection: 'row', gap: 6 },
  pill: {
    flex: 1, paddingVertical: 7, borderRadius: 8,
    borderWidth: 1, alignItems: 'center',
  },
  pillText: { fontSize: 13, fontWeight: '600' },

  submitBtn: {
    padding: 17, borderRadius: 16,
    alignItems: 'center', marginTop: 8, marginHorizontal: 16,
  },
  submitText: { color: '#fff', fontWeight: '700', fontSize: 16 },

  // Prediction Card Styles
  predictionsContainer: {
    paddingHorizontal: 16,
    marginBottom: 20,
    gap: 12,
  },
  // predictionCard: {
  //   borderWidth: 1,
  //   borderRadius: 16,
  //   padding: 16,
  //   gap: 12,
  // },
  predictionContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  predictionInfo: {
    flex: 1,
  },
  predictionDisease: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 4,
    textTransform: 'capitalize',
  },
  predictionConfidence: {
    fontSize: 12,
    fontWeight: '500',
  },
  confidenceBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    marginLeft: 12,
  },
  confidenceText: {
    fontWeight: '700',
    fontSize: 14,
  },
  confidenceBar: {
    height: 6,
    borderRadius: 3,
    overflow: 'hidden',
  },
  confidenceFill: {
    height: '100%',
    borderRadius: 3,
  },

  // Warning Box Styles
  warningBox: {
    marginHorizontal: 16,
    marginTop: 16,
    marginBottom: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderRadius: 12,
    backgroundColor: '#fef3c7',
    borderLeftWidth: 4,
    borderLeftColor: '#f59e0b',
  },
  warningTitle: {
    fontSize: 14,
    fontWeight: '700',
    marginBottom: 4,
  },
  warningText: {
    fontSize: 13,
    lineHeight: 18,
  },

  // Error Box Styles
  errorBox: {
    marginHorizontal: 16,
    marginTop: 16,
    marginBottom: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderRadius: 12,
  },
});