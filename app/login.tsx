import React, { useRef, useState, useEffect } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, Image, Alert } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialIcons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { supabase } from '@/lib/supabase';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as LocalAuthentication from 'expo-local-authentication'; // For biometric authentication

const SignInScreen = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const emailRef = useRef('');
  const passwordRef = useRef('');

  // Function to check if biometrics is enabled and available
  const checkBiometrics = async () => {
    const isBiometricEnabled = await AsyncStorage.getItem('isBiometricEnabled');
    const isBiometricAvailable = await LocalAuthentication.hasHardwareAsync();

    return isBiometricEnabled === 'true' && isBiometricAvailable;
  };

  const handleLogin = async () => {
    // Validate input fields
    if (!emailRef.current || !passwordRef.current) {
      Alert.alert('Login', 'Please fill all the fields');
      return;
    }

    // Trim input values
    let email = emailRef.current.trim();
    let password = passwordRef.current.trim();

    setLoading(true);

    try {
      // Attempt to sign in with Supabase
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      // Handle errors
      if (error) {
        throw error;
      }

      // Check if biometrics is enabled and available
      const isBiometricReady = await checkBiometrics();

      if (isBiometricReady) {
        // Navigate to the biometrics page if biometrics is enabled and available
        router.push('/biometrics');
      } else {
        // Navigate to the home screen directly if biometrics is not enabled or not available
        router.replace('/(tabs)');
      }
    } catch (error) {
      // Display error message
      Alert.alert('Login Error', error.message || 'An error occurred during login.');
    } finally {
      // Reset loading state
      setLoading(false);
    }
  };

  return (
    <LinearGradient colors={['#6200ee', '#3700b3']} style={styles.container}>
      <View style={styles.content}>
        {/* Logo */}
        <Image source={{ uri: 'https://via.placeholder.com/100' }} style={styles.logo} />

        {/* Title */}
        <Text style={styles.title}>Welcome Back</Text>

        {/* Email Input */}
        <View style={styles.inputContainer}>
          <MaterialIcons name="email" size={24} color="#6200ee" />
          <TextInput
            style={styles.input}
            placeholder="Email"
            placeholderTextColor="#999"
            onChangeText={(value) => (emailRef.current = value)}
            keyboardType="email-address"
            autoCapitalize="none"
          />
        </View>

        {/* Password Input */}
        <View style={styles.inputContainer}>
          <MaterialIcons name="lock" size={24} color="#6200ee" />
          <TextInput
            style={styles.input}
            placeholder="Password"
            placeholderTextColor="#999"
            onChangeText={(value) => (passwordRef.current = value)}
            secureTextEntry
          />
        </View>

        {/* Sign In Button */}
        <TouchableOpacity style={styles.button} onPress={handleLogin} disabled={loading}>
          <Text style={styles.buttonText}>{loading ? 'Signing In...' : 'Sign In'}</Text>
        </TouchableOpacity>

        {/* Sign Up Link */}
        <TouchableOpacity onPress={() => router.push('/register')}>
          <Text style={styles.linkText}>Don't have an account? Sign Up</Text>
        </TouchableOpacity>
      </View>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    width: '90%',
    alignItems: 'center',
  },
  logo: {
    width: 100,
    height: 100,
    borderRadius: 50,
    marginBottom: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 30,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 15,
    marginBottom: 15,
    width: '100%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  input: {
    flex: 1,
    fontSize: 16,
    marginLeft: 10,
  },
  button: {
    backgroundColor: '#03DAC6',
    padding: 15,
    borderRadius: 10,
    width: '100%',
    alignItems: 'center',
    marginTop: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  buttonText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
  },
  linkText: {
    fontSize: 14,
    color: '#fff',
    marginTop: 20,
    textDecorationLine: 'underline',
  },
});

export default SignInScreen;