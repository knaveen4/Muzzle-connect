import React, { useState } from 'react';
import { 
  View, 
  Text, 
  TextInput, 
  TouchableOpacity, 
  Alert, 
  StyleSheet, 
  KeyboardAvoidingView,
  Platform,
  Image,
  ScrollView
} from 'react-native';
import { supabase } from '../../lib/supabase';

export default function SignupScreen({ navigation }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSignup = async () => {
    if (!email || !password || !confirmPassword) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    if (password !== confirmPassword) {
      Alert.alert('Error', 'Passwords do not match');
      return;
    }

    if (password.length < 6) {
      Alert.alert('Error', 'Password should be at least 6 characters');
      return;
    }

    setLoading(true);
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
      });

      if (error) {
        Alert.alert('Signup Error', error.message);
      } else {
        Alert.alert(
          'Signup Success', 
          'Please check your email to confirm your account.',
          [
            { text: 'OK', onPress: () => navigation.navigate('Login') }
          ]
        );
      }
    } catch (error) {
      Alert.alert('Error', 'An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <View style={styles.innerContainer}>
          <Image 
            source={require('../../assets/logo.png')} // Replace with your logo
            style={styles.logo}
            resizeMode="contain"
          />
          
          <Text style={styles.title}>Create Account</Text>
          <Text style={styles.subtitle}>Join us to get started</Text>

          <View style={styles.inputContainer}>
            <Text style={styles.label}>Email Address</Text>
            <TextInput 
              placeholder="Enter your email"
              placeholderTextColor="#999"
              style={styles.input} 
              onChangeText={setEmail}
              value={email}
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
            />
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.label}>Password</Text>
            <TextInput 
              placeholder="Create a password"
              placeholderTextColor="#999"
              style={styles.input} 
              onChangeText={setPassword}
              value={password}
              secureTextEntry
            />
            <Text style={styles.passwordHint}>Must be at least 6 characters</Text>
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.label}>Confirm Password</Text>
            <TextInput 
              placeholder="Re-enter your password"
              placeholderTextColor="#999"
              style={styles.input} 
              onChangeText={setConfirmPassword}
              value={confirmPassword}
              secureTextEntry
            />
          </View>

          <TouchableOpacity 
            style={[styles.signupButton, loading && styles.disabledButton]}
            onPress={handleSignup}
            disabled={loading}
          >
            <Text style={styles.buttonText}>
              {loading ? 'Creating Account...' : 'Create Account'}
            </Text>
          </TouchableOpacity>

          <View style={styles.loginContainer}>
            <Text style={styles.loginText}>Already have an account? </Text>
            <TouchableOpacity onPress={() => navigation.navigate('Login')}>
              <Text style={styles.linkText}>Sign In</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  scrollContainer: {
    flexGrow: 1,
    justifyContent: 'center',
  },
  innerContainer: {
    padding: 30,
  },
  logo: {
    width: 120,
    height: 120,
    alignSelf: 'center',
    marginBottom: 30,
    borderRadius: 60,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 5,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    marginBottom: 40,
    textAlign: 'center',
  },
  inputContainer: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    color: '#333',
    marginBottom: 8,
    fontWeight: '500',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    padding: 15,
    borderRadius: 8,
    fontSize: 16,
    backgroundColor: '#f9f9f9',
  },
  passwordHint: {
    fontSize: 12,
    color: '#999',
    marginTop: 5,
  },
  signupButton: {
    backgroundColor: '#6e45e2',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 20,
  },
  disabledButton: {
    backgroundColor: '#a18cd1',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  loginContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 30,
  },
  loginText: {
    color: '#666',
  },
  linkText: {
    color: '#6e45e2',
    fontWeight: 'bold',
  },
});