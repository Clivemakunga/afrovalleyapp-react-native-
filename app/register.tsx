import React, { useRef, useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, Image, Alert } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialIcons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { supabase } from '@/lib/supabase';

const SignUpScreen = () => {
  const [name, setName] = useState('');
  const [surname, setSurname] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleRegister = async () => {
    // Validate input fields
    if (!name.trim() || !surname.trim() || !email.trim() || !password.trim()) {
      Alert.alert('Sign Up', 'Please fill all the fields');
      return;
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      Alert.alert('Sign Up', 'Please enter a valid email address');
      return;
    }

    // Validate password strength (example: minimum 6 characters)
    if (password.length < 6) {
      Alert.alert('Sign Up', 'Password must be at least 6 characters long');
      return;
    }

    setLoading(true);

    try {
      // Attempt to sign up with Supabase
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            name,
            surname,
          },
        },
      });

      // Handle errors
      if (error) {
        throw error;
      }

      // If successful, navigate to the home screen
      Alert.alert('Success', 'Registration successful! Please check your email to confirm your account.');
      router.replace('/(tabs)');
    } catch (error) {
      // Display error message
      Alert.alert('Sign Up Error', error.message || 'An error occurred during registration.');
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
        <Text style={styles.title}>Create Account</Text>

        {/* Name Input */}
        <View style={styles.inputContainer}>
          <MaterialIcons name="person" size={24} color="#6200ee" />
          <TextInput
            style={styles.input}
            placeholder="Name"
            placeholderTextColor="#999"
            value={name}
            onChangeText={setName}
            autoCapitalize="words"
          />
        </View>

        {/* Surname Input */}
        <View style={styles.inputContainer}>
          <MaterialIcons name="person" size={24} color="#6200ee" />
          <TextInput
            style={styles.input}
            placeholder="Surname"
            placeholderTextColor="#999"
            value={surname}
            onChangeText={setSurname}
            autoCapitalize="words"
          />
        </View>

        {/* Email Input */}
        <View style={styles.inputContainer}>
          <MaterialIcons name="email" size={24} color="#6200ee" />
          <TextInput
            style={styles.input}
            placeholder="Email"
            placeholderTextColor="#999"
            value={email}
            onChangeText={setEmail}
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
            value={password}
            onChangeText={setPassword}
            secureTextEntry
          />
        </View>

        {/* Sign Up Button */}
        <TouchableOpacity style={styles.button} onPress={handleRegister} disabled={loading}>
          <Text style={styles.buttonText}>{loading ? 'Signing Up...' : 'Sign Up'}</Text>
        </TouchableOpacity>

        {/* Sign In Link */}
        <TouchableOpacity onPress={() => router.push('/login')}>
          <Text style={styles.linkText}>Already have an account? Sign In</Text>
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

export default SignUpScreen;