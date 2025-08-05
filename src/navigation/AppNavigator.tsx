import React, { useEffect, useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import BottomTabs from './BottomTabs';
import AuthNavigator from './AuthNavigator';
import { supabase } from '../lib/supabase';
import AddBeneficiaryScreen from '../screens/beneficiary/AddBeneficiaryScreen';
import AddSellerScreen from '../screens/seller/AddSellerScreen';
import AddCattleScreen from '../screens/cattle/AddCattleScreen';
import BeneficiaryProfileScreen from '../screens/beneficiary/BeneficiaryProfileScreen';
import { RootStackParamList } from './types';

const Stack = createNativeStackNavigator<RootStackParamList>();

const AppNavigator = () => {
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const getSession = async () => {
      const { data, error } = await supabase.auth.getSession();
      setSession(data?.session ?? null);
      setLoading(false);
    };
    getSession();

    const { data: authListener } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, []);

  if (loading) return null; // Or splash screen

  return (
    <NavigationContainer>
      {session ? (
        <Stack.Navigator screenOptions={{ headerShown: false }}>
          <Stack.Screen name="MainTabs" component={BottomTabs} />
          <Stack.Screen name="AddBeneficiary" component={AddBeneficiaryScreen} />
          <Stack.Screen name="AddSeller" component={AddSellerScreen} />
          <Stack.Screen name="AddCattleScreen" component={AddCattleScreen} />
          <Stack.Screen name="BeneficiaryProfile" component={BeneficiaryProfileScreen} />
        </Stack.Navigator>
      ) : (
        <AuthNavigator />
      )}
    </NavigationContainer>
  );
};

export default AppNavigator;
