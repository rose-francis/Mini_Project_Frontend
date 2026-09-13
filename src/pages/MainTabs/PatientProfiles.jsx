import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useAppTheme } from '../../Theme/ThemeContext';
import { SUPABASE_REST_URL, SUPABASE_HEADERS } from '../../config/api';

export default function PatientProfiles({ navigation }) {
  const { colors } = useAppTheme();
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchPatients();
    setRefreshing(false);
  };

  useEffect(() => {
    fetchPatients();
  }, []);

  const fetchPatients = async () => {
  try {
    setLoading(true);
    const [patientsResponse, matchedIds] = await Promise.all([
      fetch(
        `${SUPABASE_REST_URL}/Patient?select=*`,
        { headers: SUPABASE_HEADERS }
      ).then((res) => res.json()),
      fetchMatchedPatients(),
    ]);

    // Add a flag to each patient
    const patientsWithMatch = patientsResponse.map((p) => ({
      ...p,
      donorMatched: matchedIds.includes(p.Patient_id),
    }));

    setPatients(patientsWithMatch);
    setLoading(false);
  } catch (error) {
    console.log('Error fetching patients:', error);
    setLoading(false);
  }
};

  const fetchMatchedPatients = async () => {
  try {
    const response = await fetch(
      `${SUPABASE_REST_URL}/Patient-Donor?select=Patient_id`,
      { headers: SUPABASE_HEADERS }
    );
    const data = await response.json();
    // store only the Patient IDs that have matched donors
    const matchedPatientIds = data.map((entry) => entry.Patient_id);
    return matchedPatientIds;
  } catch (error) {
    console.log('Error fetching matched patients:', error);
    return [];
  }
};

  const PatientCard = ({ patient }) => (
    <TouchableOpacity
        style={[
          styles.card,
          {
            backgroundColor: colors.card,
            borderColor: patient.donorMatched ? 'green' : colors.border,
            borderWidth: 2,
          },
        ]}
        onPress={() =>
          navigation.navigate('PatientDetail', { patient: patient })
        }
        activeOpacity={0.8}
      >
      <View style={styles.rowTop}>
        <View style={[styles.iconCircle, { backgroundColor: colors.primary + '15' }]}>
          <Icon name="account-injury" size={26} color={colors.primary} />
        </View>

        <View style={{ flex: 1 }}>
          <Text style={[styles.name, { color: colors.text }]}>
            {patient.Name}
          </Text>
          <Text style={[styles.idText, { color: colors.textSecondary }]}>
            Patient ID: {patient.Patient_id}
          </Text>
        </View>

        <View
          style={[
            styles.statusBadge,
            {
              backgroundColor:
                patient.RiskGroup === 'High'
                  ? colors.error + '20'
                  : colors.success + '20',
            },
          ]}
        >
          <Text
            style={{
              color:
                patient.RiskGroup === 'High'
                  ? colors.error
                  : colors.success,
              fontWeight: 'bold',
              fontSize: 12,
            }}
          >
            {patient.RiskGroup || 'N/A'}
          </Text>
        </View>
      </View>

      {/* Bottom Info */}
      <View style={styles.infoRow}>
        <View style={styles.infoItem}>
          <Icon name="virus" size={16} color={colors.textSecondary} />
          <Text style={[styles.infoText, { color: colors.textSecondary }]}>
            {patient.DiseaseType || 'Unknown'}
          </Text>
        </View>

        <View style={styles.infoItem}>
          <Icon name="chart-line" size={16} color={colors.textSecondary} />
          <Text style={[styles.infoText, { color: colors.textSecondary }]}>
            {patient.donorMatched 
              ? 'Donor Matched' 
              : (patient.OutcomeVariable || 'Pending')}
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: colors.background }]}
      edges={['top']}
    >
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        <View style={styles.header}>
          <Text style={[styles.title, { color: colors.text }]}>
            Patient Profiles
          </Text>
          <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
            Registered patients and disease records
          </Text>
        </View>

        {loading ? (
          <ActivityIndicator size="large" color={colors.primary} />
        ) : (
          patients.map((patient) => (
            <PatientCard key={patient.Patient_id} patient={patient} />
          ))
        )}

        <View style={{ height: 80 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scrollContent: { padding: 20 },

  header: { marginBottom: 20 },
  title: { fontSize: 26, fontWeight: 'bold' },
  subtitle: { fontSize: 14, marginTop: 4 },

  card: {
    borderWidth: 1,
    borderRadius: 18,
    padding: 16,
    marginBottom: 14,
  },

  rowTop: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  iconCircle: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14,
  },

  name: {
    fontSize: 16,
    fontWeight: '600',
  },

  idText: {
    fontSize: 12,
    marginTop: 2,
  },

  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },

  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 14,
  },

  infoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },

  infoText: {
    fontSize: 12,
  },
});