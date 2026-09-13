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
import { SUPABASE_REST_URL, SUPABASE_HEADERS as BASE_HEADERS } from '../../config/api';

export default function DonorProfiles({ navigation }) {
  const { colors } = useAppTheme();
  const [donors, setDonors] = useState([]);
  const [matchedDonorIds, setMatchedDonorIds] = useState(new Set());
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const onRefresh = async () => {
    setRefreshing(true);
    await loadAll();
    setRefreshing(false);
  };

  useEffect(() => {
    loadAll();
  }, []);

  const loadAll = async () => {
    // Run both fetches in parallel
    const [donorData, matchedIds] = await Promise.all([
      fetchDonors(),
      fetchMatchedDonorIds(),
    ]);
    setDonors(donorData);
    setMatchedDonorIds(new Set(matchedIds));
    setLoading(false);
  };

  const fetchDonors = async () => {
    try {
      const response = await fetch(
        `${SUPABASE_REST_URL}/Donor?select=*`,
        { headers: BASE_HEADERS }
      );
      return await response.json();
    } catch (error) {
      console.log('Error fetching donors:', error);
      return [];
    }
  };

  const fetchMatchedDonorIds = async () => {
    try {
      const response = await fetch(
        `${SUPABASE_REST_URL}/Patient-Donor?select=Donor_id`,
        { headers: BASE_HEADERS }
      );
      const data = await response.json();
      // Return array of Donor_ids that have at least one match
      return data.map((entry) => entry.Donor_id).filter(Boolean);
    } catch (error) {
      console.log('Error fetching matched donor IDs:', error);
      return [];
    }
  };

  const DonorCard = ({ donor }) => {
    const isMatched = matchedDonorIds.has(donor.Donor_id);

    return (
      <TouchableOpacity
        style={[
          styles.card,
          {
            backgroundColor: colors.card,
            // Green border if matched, normal border otherwise
            borderColor: isMatched ? colors.success : colors.border,
            borderWidth: isMatched ? 2 : 1,
          },
        ]}
        onPress={() => navigation.navigate('DonorDetail', { donor })}
        activeOpacity={0.8}
      >
        <View style={styles.rowTop}>
          <View
            style={[
              styles.iconCircle,
              { backgroundColor: colors.primary + '15' },
            ]}
          >
            <Icon name="account-heart" size={26} color={colors.primary} />
          </View>

          <View style={{ flex: 1 }}>
            <Text style={[styles.name, { color: colors.text }]}>
              {donor.Name}
            </Text>
            <Text style={[styles.idText, { color: colors.textSecondary }]}>
              Donor ID: {donor.Donor_id}
            </Text>
          </View>

          <View style={styles.rightBadges}>
            {/* "Matched" chip — only shown when donor has a match */}
            {isMatched && (
              <View
                style={[
                  styles.matchedBadge,
                  { backgroundColor: colors.success + '20' },
                ]}
              >
                <Icon name="check-circle" size={12} color={colors.success} />
                <Text style={[styles.matchedText, { color: colors.success }]}>
                  Matched
                </Text>
              </View>
            )}

            <View
              style={[
                styles.bloodBadge,
                { backgroundColor: colors.success + '20' },
              ]}
            >
              <Text style={[styles.bloodText, { color: colors.success }]}>
                {donor.BloodGroup}
              </Text>
            </View>
          </View>
        </View>

        {/* Bottom Info Row */}
        <View style={styles.infoRow}>
          <View style={styles.infoItem}>
            <Icon name="virus" size={16} color={colors.textSecondary} />
            <Text style={[styles.infoText, { color: colors.textSecondary }]}>
              CMV: {donor.CMVStatus}
            </Text>
          </View>

          <View style={styles.infoItem}>
            <Icon name="dna" size={16} color={colors.textSecondary} />
            <Text style={[styles.infoText, { color: colors.textSecondary }]}>
              {donor.StemCellSource}
            </Text>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

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
            Donor Profiles
          </Text>
          <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
            Registered stem cell donors
          </Text>
        </View>

        {loading ? (
          <ActivityIndicator size="large" color={colors.primary} />
        ) : (
          donors.map((donor) => (
            <DonorCard key={donor.Donor_id} donor={donor} />
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

  rightBadges: {
    alignItems: 'flex-end',
    gap: 6,
  },

  matchedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10,
  },

  matchedText: {
    fontSize: 11,
    fontWeight: '700',
  },

  bloodBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },

  bloodText: {
    fontWeight: 'bold',
    fontSize: 13,
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