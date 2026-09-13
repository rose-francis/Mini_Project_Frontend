import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Animated,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAppTheme } from '../../src/Theme/ThemeContext';
import { useNavigation, useRoute } from '@react-navigation/native';
import DonorTabs from '../components/DonorTabs.jsx';
import DiseaseResult from '../components/DiseaseResult.jsx';
import { SUPABASE_REST_URL as API_URL, SUPABASE_HEADERS as HEADERS } from '../config/api';

const DetailCard = ({ label, value, colors, delay }) => {
  const fade = useRef(new Animated.Value(0)).current;
  const slide = useRef(new Animated.Value(20)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fade, {
        toValue: 1,
        duration: 400,
        delay,
        useNativeDriver: true,
      }),
      Animated.timing(slide, {
        toValue: 0,
        duration: 350,
        delay,
        useNativeDriver: true,
      }),
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
      <View style={{ flex: 1 }}>
        <Text style={[styles.label, { color: colors.textSecondary }]}>
          {label}
        </Text>
        <Text style={[styles.value, { color: colors.text }]}>
          {value ?? '—'}
        </Text>
      </View>
    </Animated.View>
  );
};

export default function PatientDetail() {
  const { colors } = useAppTheme();
  const navigation = useNavigation();
  const route = useRoute();
  const { patient } = route.params;
   const [refreshing, setRefreshing] = useState(false);
   const [predictions, setPredictions] = useState(null);
  
    const onRefresh = async () => {
      setRefreshing(true);
      setRefreshing(false);
    };
  

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


  const headerFade = useRef(new Animated.Value(0)).current;
  const headerSlide = useRef(new Animated.Value(-12)).current;

  if (!patient) return null;

  const initials = patient.Name
    ? patient.Name.trim().split(' ').map(n => n[0]).slice(0, 2).join('').toUpperCase()
    : '?';

    useEffect(() => {
      Animated.parallel([
        Animated.timing(headerFade, { toValue: 1, duration: 500, useNativeDriver: true }),
        Animated.timing(headerSlide, { toValue: 0, duration: 420, useNativeDriver: true }),
      ]).start();
    }, []);

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

        <Text style={[styles.titleTop, { color: colors.text }]}>
          Patient Profile
        </Text>

        <View style={{ width: 40 }} />
      </View>

      <ScrollView
              contentContainerStyle={styles.scrollContent}
              refreshControl={
                <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
              }
            >

        {/* Hero Section */}
        <Animated.View
          style={[
            styles.hero,
            { opacity: headerFade, transform: [{ translateY: headerSlide }] },
          ]}
        >
          <View style={[styles.avatar, { backgroundColor: colors.primary + '1A', borderColor: colors.primary + '44' }]}>
            <Text style={[styles.avatarText, { color: colors.primary }]}>
              {initials}
            </Text>
          </View>

          <Text style={[styles.heroName, { color: colors.text }]}>
            {patient.Name}
          </Text>

          <View style={[styles.heroPill, { backgroundColor: colors.error + '20' }]}>
            <Text style={[styles.heroPillText, { color: colors.error }]}>
              ID: {patient.Patient_id} · {patient.RiskGroup || 'N/A'}
            </Text>
          </View>
        </Animated.View>

        {/* Section Label */}
        <Text style={[styles.sectionLabel, { color: colors.textSecondary }]}>
          CLINICAL DETAILS
        </Text>

        {/* Cards */}
        <View style={styles.cardsWrap}>
          <DetailCard label="Age" value={patient.Age} colors={colors} />
          <DetailCard label="Gender" value={patient.Gender} colors={colors} />
          <DetailCard label="Blood Group" value={patient.BloodGroup} colors={colors} />
          <DetailCard label="Body Mass" value={patient.BodyMass} colors={colors} />
          <DetailCard label="CMV Status" value={patient.CMVStatus} colors={colors} />
        </View>

        <Text style={[styles.sectionLabel, { color: colors.textSecondary }]}>
          DISEASE INFO
        </Text>

        <View style={styles.cardsWrap}>
          <DetailCard label="Disease Type" value={patient.DiseaseType} colors={colors} />
          <DetailCard label="Disease Group" value={patient.DiseaseGroup} colors={colors} />
          <DetailCard label="Risk Group" value={patient.RiskGroup} colors={colors} />
          <DetailCard label="Post Relapse" value={patient.PostRelapse} colors={colors} />
        </View>

        <Text style={[styles.sectionLabel, { color: colors.textSecondary }]}>
          BIOLOGICAL
        </Text>

        <View style={styles.cardsWrap}>
          <DetailCard label="Rh Factor" value={patient.RhFactor} colors={colors} />
          <DetailCard label="Contact" value={patient.Contact} colors={colors} />
        </View>

        <Text style={[styles.sectionLabel, { color: colors.textSecondary }]}>
          HLA TYPING
        </Text>

        <View style={styles.cardsWrap}>
          <DetailCard label="HLA-A" value={`${patient.Hla_a_1 || '-'} / ${patient.Hla_a_2 || '-'}`} colors={colors} />
          <DetailCard label="HLA-B" value={`${patient.Hla_b_1 || '-'} / ${patient.Hla_b_2 || '-'}`} colors={colors} />
          <DetailCard label="HLA-C" value={`${patient.Hla_c_1 || '-'} / ${patient.Hla_c_2 || '-'}`} colors={colors} />
          <DetailCard label="HLA-DRB1" value={`${patient.Hla_drb1_1 || '-'} / ${patient.Hla_drb1_2 || '-'}`} colors={colors} />
          <DetailCard label="HLA-DQB1" value={`${patient.Hla_dqb1_1 || '-'} / ${patient.Hla_dqb1_2 || '-'}`} colors={colors} />
        </View>

        <DiseaseResult
                  patientId={patient.Patient_id}
                  //refreshKey={predictions}   // re-fetches whenever a new prediction is saved
                />

 {!loadingDonors && donors.length > 0 && (
    <>
      <Text style={[styles.sectionLabel, { color: colors.textSecondary }]}>
        MATCHED DONORS
      </Text>
      <DonorTabs donors={donors} colors={colors} />
    </>
  )}
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
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },

  backArrow: { fontSize: 28, marginTop: -2 },
  titleTop: { fontSize: 16, fontWeight: '600' },

  scrollContent: { paddingBottom: 40 },

  hero: {
    alignItems: 'center',
    paddingTop: 36,
    paddingBottom: 30,
  },

  avatar: {
    width: 90,
    height: 90,
    borderRadius: 45,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 14,
  },

  avatarText: { fontSize: 34, fontWeight: '700' },
  heroName: { fontSize: 22, fontWeight: '700', marginBottom: 10 },

  heroPill: {
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 20,
  },

  heroPillText: { fontSize: 13, fontWeight: '600' },

  sectionLabel: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 1.3,
    marginHorizontal: 20,
    marginTop: 20,
    marginBottom:10,
  },

  cardsWrap: { paddingHorizontal: 16, gap: 10 },

  card: {
    borderWidth: StyleSheet.hairlineWidth,
    borderRadius: 16,
    padding: 14,
  },

  label: { fontSize: 10, fontWeight: '700', letterSpacing: 1, marginBottom: 4 },
  value: { fontSize: 16, fontWeight: '600' },
});