import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  Keyboard,
  TouchableWithoutFeedback,
  LayoutAnimation,
  UIManager,
  Platform,
  Animated,
  Dimensions,
} from 'react-native';
import { TabView, SceneMap, TabBar } from 'react-native-tab-view';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { useNavigation } from '@react-navigation/native';
import ShimmerPlaceHolder from 'react-native-shimmer-placeholder';
import LinearGradient from 'react-native-linear-gradient';

if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

interface Person {
  beneficiary_id?: string;
  seller_id?: string;
  name: string;
  phone_number: string;
}

const { width } = Dimensions.get('window');

const SkeletonItem = () => (
  <View style={styles.listItem}>
    <View style={{ flex: 1 }}>
      <ShimmerPlaceHolder 
        style={styles.shimmerName} 
        autoRun 
        shimmerColors={['#f0f0f0', '#e0e0e0', '#f0f0f0']}
      />
      <ShimmerPlaceHolder 
        style={styles.shimmerPhone} 
        autoRun 
        shimmerColors={['#f0f0f0', '#e0e0e0', '#f0f0f0']}
      />
    </View>
    <ShimmerPlaceHolder 
      style={styles.shimmerIcon} 
      autoRun 
      shimmerColors={['#f0f0f0', '#e0e0e0', '#f0f0f0']}
    />
  </View>
);

const BSTabScreen = () => {
  const navigation = useNavigation();
  const [index, setIndex] = useState(0);
  const [routes] = useState([
    { key: 'beneficiaries', title: 'Beneficiaries' },
    { key: 'sellers', title: 'Sellers' },
  ]);

  const [beneficiaries, setBeneficiaries] = useState<Person[]>([]);
  const [sellers, setSellers] = useState<Person[]>([]);
  const [searchText, setSearchText] = useState('');
  const [loading, setLoading] = useState(true);
  const fadeAnim = useState(new Animated.Value(0))[0];
  const searchAnim = useState(new Animated.Value(0))[0];

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [beneficiaryRes, sellerRes] = await Promise.all([
          fetch('http://107.210.222.39:8000/beneficiaries/all'),
          fetch('http://107.210.222.39:8000/sellers/all'),
        ]);

        const beneficiaryData = await beneficiaryRes.json();
        const sellerData = await sellerRes.json();

        LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
        setBeneficiaries(beneficiaryData);
        setSellers(sellerData);

        Animated.parallel([
          Animated.timing(fadeAnim, {
            toValue: 1,
            duration: 600,
            useNativeDriver: true,
          }),
          Animated.spring(searchAnim, {
            toValue: 1,
            friction: 5,
            useNativeDriver: true,
          })
        ]).start();
      } catch (error) {
        console.error('Fetch error:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const renderList = (data: Person[], type: 'beneficiary' | 'seller') => {
    const filtered = data.filter((item) =>
      item.phone_number.toLowerCase().includes(searchText.toLowerCase()) ||
      item.name.toLowerCase().includes(searchText.toLowerCase())
    );

    if (loading) {
      return (
        <FlatList
          data={Array.from({ length: 6 })}
          keyExtractor={(_, index) => `skeleton-${index}`}
          renderItem={() => <SkeletonItem />}
          scrollEnabled={true}
          contentContainerStyle={{ paddingBottom: 60 }}
        />
      );
    }

    if (filtered.length === 0) {
      return (
        <View style={styles.emptyState}>
          <Ionicons name="search-outline" size={48} color="#bbb" />
          <Text style={styles.noDataText}>No matching results found</Text>
          <Text style={styles.noDataSubText}>Try a different search term</Text>
        </View>
      );
    }

    return (
      <Animated.View style={{ opacity: fadeAnim, flex: 1 }}>
        <FlatList
          data={filtered}
          keyExtractor={(item, index) => item.phone_number + index}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={styles.listItem}
              activeOpacity={0.7}
              onPress={() => {
                if (type === 'beneficiary') {
                  navigation.navigate('BeneficiaryProfile', {
                    beneficiary_id: item.beneficiary_id,
                  });
                }
                // Add seller navigation if needed
              }}
            >
              <View style={styles.avatarContainer}>
                <LinearGradient
                  colors={['#6e45e2', '#88d3ce']}
                  style={styles.avatarGradient}
                >
                  <Text style={styles.avatarText}>
                    {item.name.charAt(0).toUpperCase()}
                  </Text>
                </LinearGradient>
              </View>
              <View style={styles.textContainer}>
                <Text style={styles.name} numberOfLines={1}>{item.name}</Text>
                <Text style={styles.phone}>{item.phone_number}</Text>
              </View>
              <Ionicons 
                name="chevron-forward" 
                size={20} 
                color="#888" 
                style={styles.arrowIcon}
              />
            </TouchableOpacity>
          )}
          contentContainerStyle={{ paddingBottom: 60 }}
          ItemSeparatorComponent={() => <View style={styles.separator} />}
        />
      </Animated.View>
    );
  };

  const renderScene = SceneMap({
    beneficiaries: () => renderList(beneficiaries, 'beneficiary'),
    sellers: () => renderList(sellers, 'seller'),
  });

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <View style={styles.container}>
        <Animated.View style={[
          styles.headerContainer,
          {
            transform: [{
              translateY: searchAnim.interpolate({
                inputRange: [0, 1],
                outputRange: [20, 0]
              })
            }]
          }
        ]}>
          <Text style={styles.header}>Search Contacts</Text>
          <Text style={styles.subHeader}>Find beneficiaries or sellers</Text>
        </Animated.View>

        <Animated.View style={[
          styles.searchContainer,
          {
            transform: [{
              scale: searchAnim.interpolate({
                inputRange: [0, 1],
                outputRange: [0.9, 1]
              })
            }]
          }
        ]}>
          <Ionicons name="search" size={20} color="#888" style={styles.searchIcon} />
          <TextInput
            style={styles.input}
            placeholder="Search by name or phone"
            value={searchText}
            onChangeText={setSearchText}
            keyboardType="default"
            placeholderTextColor="#aaa"
            autoCapitalize="words"
          />
          {searchText.length > 0 && (
            <TouchableOpacity 
              onPress={() => setSearchText('')}
              style={styles.clearButton}
            >
              <Ionicons name="close-circle" size={20} color="#888" />
            </TouchableOpacity>
          )}
        </Animated.View>

        <TabView
          navigationState={{ index, routes }}
          renderScene={renderScene}
          onIndexChange={setIndex}
          initialLayout={{ width }}
          renderTabBar={(props) => (
            <TabBar
              {...props}
              indicatorStyle={{ 
                backgroundColor: '#fff',
                height: 3,
                bottom: 5,
              }}
              style={styles.tabBar}
              labelStyle={{ 
                color: '#fff', 
                fontWeight: '600', 
                fontSize: 14,
                textTransform: 'none',
              }}
              tabStyle={{ width: 'auto' }}
              contentContainerStyle={{ paddingHorizontal: 16 }}
              pressColor="rgba(255,255,255,0.2)"
            />
          )}
        />
      </View>
    </TouchableWithoutFeedback>
  );
};

export default BSTabScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
    paddingTop: 20,
  },
  headerContainer: {
    paddingHorizontal: 24,
    marginBottom: 16,
  },
  header: {
    fontSize: 28,
    fontWeight: '800',
    color: '#333',
    marginBottom: 4,
  },
  subHeader: {
    fontSize: 16,
    color: '#666',
    fontWeight: '500',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    marginHorizontal: 24,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e1e1e1',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
    marginBottom: 16,
  },
  searchIcon: {
    marginRight: 12,
  },
  clearButton: {
    padding: 4,
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: '#333',
    fontWeight: '500',
  },
  listItem: {
    backgroundColor: '#fff',
    marginHorizontal: 24,
    padding: 16,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 1,
  },
  avatarContainer: {
    marginRight: 16,
  },
  avatarGradient: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    color: '#fff',
    fontSize: 20,
    fontWeight: 'bold',
  },
  textContainer: {
    flex: 1,
  },
  name: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  phone: {
    fontSize: 14,
    color: '#666',
  },
  arrowIcon: {
    marginLeft: 8,
  },
  separator: {
    height: 8,
  },
  noDataText: {
    textAlign: 'center',
    color: '#555',
    marginTop: 16,
    fontSize: 18,
    fontWeight: '600',
  },
  noDataSubText: {
    textAlign: 'center',
    color: '#888',
    fontSize: 14,
    marginTop: 4,
  },
  emptyState: {
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 40,
    paddingHorizontal: 40,
  },
  tabBar: {
    backgroundColor: '#6e45e2',
    marginHorizontal: 24,
    borderRadius: 10,
    marginBottom: 16,
    overflow: 'hidden',
    elevation: 0,
    shadowOpacity: 0,
  },
  shimmerName: {
    width: 150,
    height: 18,
    borderRadius: 6,
    marginBottom: 8,
  },
  shimmerPhone: {
    width: 100,
    height: 14,
    borderRadius: 6,
  },
  shimmerIcon: {
    width: 24,
    height: 24,
    borderRadius: 12,
  },
});