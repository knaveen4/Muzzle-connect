import React, { useRef } from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { StyleSheet, View, TouchableOpacity, Animated } from 'react-native';
import HomeScreen from '../screens/home/HomeScreen';
import BSTabScreen from '../screens/BSTabScreen';
import ScanScreen from '../screens/ScanScreen';
import NearbyScreen from '../screens/NearbyScreen';
import SettingsScreen from '../screens/SettingsScreen';

const Tab = createBottomTabNavigator();

const BottomTabs = () => {
  const scaleValue = useRef(new Animated.Value(1)).current;

  const handlePressIn = () => {
    Animated.spring(scaleValue, {
      toValue: 0.9,
      useNativeDriver: true,
    }).start();
  };

  const handlePressOut = () => {
    Animated.spring(scaleValue, {
      toValue: 1,
      friction: 3,
      tension: 40,
      useNativeDriver: true,
    }).start();
  };

  const ScanButton = ({ onPress }) => {
    return (
      <TouchableOpacity
        activeOpacity={0.9}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        onPress={onPress}
        style={styles.scanTouchable}
      >
        <Animated.View 
          style={[
            styles.scanButton, 
            { 
              transform: [{ scale: scaleValue }],
            }
          ]}
        >
          <Ionicons 
            name="scan" 
            size={24} 
            color="#fff" 
          />
        </Animated.View>
      </TouchableOpacity>
    );
  };

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName: string;

          switch (route.name) {
            case 'Home':
              iconName = focused ? 'home' : 'home-outline';
              break;
            case 'BSTab':
              iconName = focused ? 'people' : 'people-outline';
              break;
            case 'Nearby':
              iconName = focused ? 'location' : 'location-outline';
              break;
            case 'Settings':
              iconName = focused ? 'settings' : 'settings-outline';
              break;
            default:
              iconName = 'ellipse-outline';
          }

          return (
            <View style={styles.iconContainer}>
              <Ionicons 
                name={iconName} 
                size={24} 
                color={focused ? '#6e45e2' : '#888'} 
              />
            </View>
          );
        },
        tabBarActiveTintColor: '#6e45e2',
        tabBarInactiveTintColor: '#888',
        tabBarLabelStyle: { 
          fontSize: 12, 
          marginBottom: 4,
          fontWeight: '500',
        },
        tabBarStyle: {
          height: 80,
          paddingTop: 8,
          paddingBottom: 8,
          backgroundColor: '#fff',
          borderTopWidth: 0,
          elevation: 10,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: -3 },
          shadowOpacity: 0.1,
          shadowRadius: 8,
        },
        headerShown: false,
      })}
    >
      <Tab.Screen 
        name="Home" 
        component={HomeScreen} 
        options={{ tabBarLabel: 'Home' }}
      />
      <Tab.Screen 
        name="BSTab" 
        component={BSTabScreen} 
        options={{ tabBarLabel: 'B/S List' }}
      />
      <Tab.Screen 
        name="Scan" 
        component={ScanScreen} 
        options={{ 
          tabBarLabel: '',
          tabBarIcon: () => null,
          tabBarButton: (props) => (
            <ScanButton {...props} />
          ),
        }}
      />
      <Tab.Screen 
        name="Nearby" 
        component={NearbyScreen} 
        options={{ tabBarLabel: 'Nearby' }}
      />
      <Tab.Screen 
        name="Settings" 
        component={SettingsScreen} 
        options={{ tabBarLabel: 'Settings' }}
      />
    </Tab.Navigator>
  );
};

const styles = StyleSheet.create({
  iconContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 4,
    height: 40,
  },
  scanButton: {
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#6e45e2',
    borderWidth: 2,
    borderColor: '#6e45e2',
    shadowColor: '#6e45e2',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 5,
    marginBottom: 20,
  },
  scanTouchable: {
    top: -30,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default BottomTabs;