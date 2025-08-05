import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  ScrollView,
  Alert,
  TouchableOpacity,
  ToastAndroid,
  Dimensions,
  StatusBar,
  LogBox,
} from 'react-native';
import { RouteProp, useRoute, useNavigation } from '@react-navigation/native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import Clipboard from '@react-native-clipboard/clipboard';
import { RootStackParamList } from '../../navigation/types';
import LinearGradient from 'react-native-linear-gradient';

LogBox.ignoreAllLogs(true); // Ignore all log notifications
type ProfileRouteProp = RouteProp<RootStackParamList, 'BeneficiaryProfile'>;

interface Beneficiary {
  beneficiary_id: string;
  name: string;
  father_or_husband: string;
  village: string;
  mandal: string;
  district: string;
  state: string;
  phone_number: string;
}

const { width } = Dimensions.get('window');

const BeneficiaryProfileScreen = () => {
  const route = useRoute<ProfileRouteProp>();
  const navigation = useNavigation();
  const { beneficiary_id } = route.params;

  const [loading, setLoading] = useState(true);
  const [beneficiary, setBeneficiary] = useState<Beneficiary | null>(null);

  useEffect(() => {
    const fetchBeneficiary = async () => {
      try {
        const response = await fetch(
          `http://107.210.222.39:8000/beneficiaries/${beneficiary_id}`
        );
        const data = await response.json();
        if (response.ok) {
          setBeneficiary(data);
        } else {
          Alert.alert('Error', data.detail || 'Failed to load beneficiary');
        }
      } catch (error) {
        console.error('Fetch error:', error);
        Alert.alert('Error', 'Network error while fetching beneficiary');
      } finally {
        setLoading(false);
      }
    };

    fetchBeneficiary();
  }, [beneficiary_id]);

  const copyToClipboard = (value: string, label: string) => {
    Clipboard.setString(value);
    ToastAndroid.show(`${label} copied to clipboard`, ToastAndroid.SHORT);
  };

  const getIcon = (key: string) => {
    switch (key) {
      case 'beneficiary_id':
        return 'id-card';
      case 'name':
        return 'person';
      case 'father_or_husband':
        return 'man';
      case 'village':
        return 'home';
      case 'mandal':
        return 'map';
      case 'district':
        return 'business';
      case 'state':
        return 'flag';
      case 'phone_number':
        return 'call';
      default:
        return 'information-circle';
    }
  };

  if (loading) {
    return (
      <View style={styles.loaderContainer}>
        <ActivityIndicator size="large" color="#6e45e2" />
      </View>
    );
  }

  if (!beneficiary) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>Beneficiary not found.</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar backgroundColor="#6e45e2" barStyle="light-content" />
      
      {/* Compact Header with Gradient Background */}
      <LinearGradient
        colors={['#6e45e2', '#88d3ce']}
        style={styles.headerGradient}
      >
        <View style={styles.header}>
          <TouchableOpacity 
            onPress={() => navigation.goBack()}
            style={styles.backButton}
          >
            <Ionicons name="arrow-back" size={24} color="#fff" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Beneficiary Profile</Text>
          <View style={{ width: 24 }} /> {/* For balance */}
        </View>
      </LinearGradient>

      <ScrollView 
        contentContainerStyle={styles.scrollContainer}
        showsVerticalScrollIndicator={false}
      >
        {/* Profile Card */}
        <View style={styles.profileCard}>
          <View style={styles.avatarContainer}>
            <LinearGradient
              colors={['#6e45e2', '#88d3ce']}
              style={styles.avatarGradient}
            >
              <Text style={styles.avatarText}>
                {beneficiary.name.charAt(0).toUpperCase()}
              </Text>
            </LinearGradient>
            <Text style={styles.profileName}>{beneficiary.name}</Text>
            <Text style={styles.profileLocation}>
              {beneficiary.village}, {beneficiary.district}
            </Text>
          </View>

          {/* Add Cattle Button */}
          <TouchableOpacity
            style={styles.addButton}
            onPress={() => beneficiary && navigation.navigate('AddCattleScreen', { 
              beneficiary_id: beneficiary.beneficiary_id 
            })}
          >
            <Ionicons name="add" size={18} color="#fff" style={{ marginRight: 8 }} />
            <Text style={styles.addButtonText}>Add Cattle</Text>
          </TouchableOpacity>

          {/* Details Section */}
          <View style={styles.detailsSection}>
            <Text style={styles.sectionTitle}>Personal Information</Text>
            
            {Object.entries(beneficiary).map(([key, value]) => (
              <View key={key} style={styles.detailItem}>
                <View style={styles.labelRow}>
                  <Ionicons 
                    name={getIcon(key)} 
                    size={16} 
                    color="#6e45e2" 
                    style={styles.icon} 
                  />
                  <Text style={styles.label}>
                    {key.replace(/_/g, ' ').charAt(0).toUpperCase() + 
                     key.replace(/_/g, ' ').slice(1)}
                  </Text>
                </View>
                <View style={styles.valueRow}>
                  <Text 
                    style={styles.value} 
                    numberOfLines={1} 
                    ellipsizeMode="tail"
                  >
                    {value}
                  </Text>
                  {(key === 'beneficiary_id' || key === 'phone_number') && (
                    <TouchableOpacity 
                      onPress={() => copyToClipboard(value, key.replace(/_/g, ' '))}
                      style={styles.copyButton}
                    >
                      <Ionicons name="copy-outline" size={16} color="#6e45e2" />
                    </TouchableOpacity>
                  )}
                </View>
              </View>
            ))}
          </View>
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  loaderContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
  },
  scrollContainer: {
    paddingBottom: 20,
  },
  headerGradient: {
    paddingTop: StatusBar.currentHeight,
    paddingBottom: 15,
    paddingHorizontal: 16,
    borderBottomLeftRadius: 16,
    borderBottomRightRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 4,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    height: 44,
  },
  backButton: {
    padding: 6,
    marginLeft: -6,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#fff',
  },
  errorText: {
    fontSize: 16,
    color: 'red',
    textAlign: 'center',
    marginTop: 40,
  },
  profileCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    marginHorizontal: 16,
    marginTop: 20,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 2,
  },
  avatarContainer: {
    alignItems: 'center',
    marginBottom: 16,
  },
  avatarGradient: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  avatarText: {
    color: '#fff',
    fontSize: 32,
    fontWeight: 'bold',
  },
  profileName: {
    fontSize: 20,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
    textAlign: 'center',
  },
  profileLocation: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
  },
  detailsSection: {
    marginTop: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#444',
    marginBottom: 12,
    paddingBottom: 6,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  detailItem: {
    marginBottom: 14,
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#f5f5f5',
  },
  labelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  icon: {
    marginRight: 8,
  },
  label: {
    fontWeight: '500',
    color: '#555',
    fontSize: 13,
  },
  valueRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 4,
  },
  value: {
    fontSize: 15,
    color: '#222',
    flex: 1,
    marginRight: 8,
  },
  copyButton: {
    padding: 4,
  },
  addButton: {
    backgroundColor: '#6e45e2',
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 12,
    borderRadius: 8,
    elevation: 2,
    marginBottom: 16,
    shadowColor: '#6e45e2',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 5,
  },
  addButtonText: {
    color: '#fff',
    fontWeight: '500',
    fontSize: 15,
  },
});

export default BeneficiaryProfileScreen;