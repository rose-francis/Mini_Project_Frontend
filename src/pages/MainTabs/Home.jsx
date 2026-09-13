import React, { useState ,useEffect} from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Modal,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useAppTheme } from '../../Theme/ThemeContext';
import AddDataModal from '../../components/AddData';
import PatientName from "../../components/PatientName"
import DonorMatch from "../../components/DonorMatch"
import { SUPABASE_REST_URL, SUPABASE_HEADERS } from '../../config/api';

export default function Home({ navigation }) {
  const { colors } = useAppTheme();
  const [showAddDataModal, setShowAddDataModal] = useState(false);
  const [PatientNameModal, setPatientNameModal] = useState(false);
  const [DonorMatchModal, setDonorMatchModal] = useState(false);
  const [totalPatients, setTotalPatients] = useState(0);
  const [activeDonors, setActiveDonors] = useState(0);

  const StatCard = ({ icon, title, value, color }) => (
    <View style={[styles.statCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
      <View style={[styles.iconContainer, { backgroundColor: color + '20' }]}>
        <Icon name={icon} size={28} color={color} />
      </View>
      <Text style={[styles.statValue, { color: colors.text }]}>{value}</Text>
      <Text style={[styles.statTitle, { color: colors.textSecondary }]}>{title}</Text>
    </View>
  );

  const QuickAction = ({ icon, title, description, onPress }) => (
    <TouchableOpacity
      style={[styles.actionCard, { backgroundColor: colors.card, borderColor: colors.border }]}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <View style={[styles.actionIcon, { backgroundColor: colors.primary + '15' }]}>
        <Icon name={icon} size={32} color={colors.primary} />
      </View>
      <View style={styles.actionContent}>
        <Text style={[styles.actionTitle, { color: colors.text }]}>{title}</Text>
        <Text style={[styles.actionDescription, { color: colors.textSecondary }]}>
          {description}
        </Text>
      </View>
      <Icon name="chevron-right" size={24} color={colors.textSecondary} />
    </TouchableOpacity>
  );

  useEffect(() => {
  fetchStats();
}, []);

  const fetchStats = async () => {
  try {
    // Patients count
    const patientsRes = await fetch(
      `${SUPABASE_REST_URL}/Patient?select=*`,
      { headers: { ...SUPABASE_HEADERS, Prefer: 'count=exact' } }
    );

    const patientCountHeader = patientsRes.headers.get('content-range');
    const totalPatientsCount = patientCountHeader
      ? parseInt(patientCountHeader.split('/')[1])
      : 0;

    // Matched donors count (PatientDonor table)
    const donorsRes = await fetch(
      `${SUPABASE_REST_URL}/Patient-Donor?select=*`,
      { headers: { ...SUPABASE_HEADERS, Prefer: 'count=exact' } }
    );

    const donorCountHeader = donorsRes.headers.get('content-range');
    const totalDonorsCount = donorCountHeader
      ? parseInt(donorCountHeader.split('/')[1])
      : 0;

    setTotalPatients(totalPatientsCount);
    setActiveDonors(totalDonorsCount);
  } catch (error) {
    console.log('Error fetching stats:', error);
  }
};

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top']}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={[styles.greeting, { color: colors.textSecondary }]}>Welcome back,</Text>
            <Text style={[styles.title, { color: colors.text }]}>Cure Connect</Text>
          </View>
        </View>

        {/* Stats */}
        <View style={styles.statsContainer}>
          <StatCard 
            icon="account-multiple" 
            title="Total Patients" 
            value={totalPatients} 
            color={colors.primary} 
          />

          <StatCard 
            icon="heart-pulse" 
            title="Matched Donors" 
            value={activeDonors} 
            color={colors.success} 
          />
        </View>

        {/* Quick Actions */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Quick Actions</Text>

          <QuickAction
            icon="virus"
            title="Disease Prediction"
            description="Predict diseases using ML models"
            onPress={() => setPatientNameModal(true)}
          />

          <QuickAction
            icon="dna"
            title="Donor Matching"
            description="HLA-based compatibility scoring"
            onPress={() => setDonorMatchModal(true)}
          />

          <QuickAction
            icon="database"
            title="Add Data"
            description="View and update patient/donor records"
            onPress={() => setShowAddDataModal(true)}
          />
        </View>

        <View style={{ height: 100 }} />
      </ScrollView>

      {/* ================= MODAL ================= */}
      <AddDataModal
        visible={showAddDataModal}
        onClose={() => setShowAddDataModal(false)}
        navigation={navigation}
        colors={colors}
      />
       <PatientName
        visible={PatientNameModal}
        onClose={() => setPatientNameModal(false)}
        navigation={navigation}
        colors={colors}
      />
      <DonorMatch
        visible={DonorMatchModal}
        onClose={() => setDonorMatchModal(false)}
        navigation={navigation}
        colors={colors}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scrollContent: { padding: 20 },

  header: {
    marginBottom: 24,
  },
  greeting: { fontSize: 17 },
  title: { fontSize: 28, fontWeight: 'bold' },

  statsContainer: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 24,
  },
  statCard: {
    flex: 1,
    padding: 20,
    borderRadius: 16,
    borderWidth: 1,
    alignItems: 'center',
  },
  iconContainer: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  statValue: { fontSize: 28, fontWeight: 'bold' },
  statTitle: { fontSize: 12 },

  section: { marginBottom: 24 },
  sectionTitle: { fontSize: 20, fontWeight: 'bold', marginBottom: 16 },

  actionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    marginBottom: 12,
  },
  actionIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  actionContent: { flex: 1 },
  actionTitle: { fontSize: 16, fontWeight: '600' },
  actionDescription: { fontSize: 13 },

  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalCard: {
    width: '85%',
    borderRadius: 20,
    padding: 20,
    elevation: 10,
  },
  modalTitle: { fontSize: 20, fontWeight: 'bold', marginBottom: 16 },
  modalOption: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    gap: 12,
  },
  modalText: { fontSize: 16, fontWeight: '500' },
  closeBtn: {
    marginTop: 16,
    paddingTop: 12,
    borderTopWidth: 1,
    alignItems: 'center',
  },
});
