import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput, Alert, Switch } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { supabase } from '@/lib/supabase'; // Import Supabase client
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as LocalAuthentication from 'expo-local-authentication'; // or use react-native-biometrics

const SecurityPage = () => {
  const [isBiometricEnabled, setIsBiometricEnabled] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isChangingPassword, setIsChangingPassword] = useState(false);

  // Load biometric state from local storage on component mount
  useEffect(() => {
    const loadBiometricState = async () => {
      const biometricState = await AsyncStorage.getItem('isBiometricEnabled');
      if (biometricState === 'true') {
        setIsBiometricEnabled(true);
      }
    };
    loadBiometricState();
  }, []);

  // Handle biometric toggle
  const handleBiometricToggle = async (value) => {
    if (value) {
      const { success } = await LocalAuthentication.authenticateAsync();
      if (success) {
        await AsyncStorage.setItem('isBiometricEnabled', 'true');
        setIsBiometricEnabled(true);
      } else {
        Alert.alert('Error', 'Biometric authentication failed.');
      }
    } else {
      await AsyncStorage.setItem('isBiometricEnabled', 'false');
      setIsBiometricEnabled(false);
    }
  };

  // Function to handle password change
  const handleChangePassword = async () => {
    if (newPassword !== confirmPassword) {
      Alert.alert('Error', 'New password and confirm password do not match.');
      return;
    }

    setIsChangingPassword(true);

    try {
      const { data: { user }, error: userError } = await supabase.auth.getUser();

      if (userError || !user) {
        throw new Error('User not authenticated.');
      }

      const { error: authError } = await supabase.auth.signInWithPassword({
        email: user.email || '',
        password: currentPassword,
      });

      if (authError) {
        throw new Error('Incorrect current password.');
      }

      const { error: updateError } = await supabase.auth.updateUser({
        password: newPassword,
      });

      if (updateError) {
        throw new Error(updateError.message);
      }

      Alert.alert('Success', 'Password updated successfully.');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (error) {
      Alert.alert('Error', error.message || 'Failed to update password.');
    } finally {
      setIsChangingPassword(false);
    }
  };

  return (
    <View style={styles.container}>
      {/* Security Options */}
      <View style={styles.optionContainer}>
        {/* Change Password Form */}
        <View style={styles.option}>
          <MaterialIcons name="lock" size={24} color="#6200ee" />
          <Text style={styles.optionText}>Change Password</Text>
        </View>
        <TextInput
          style={styles.input}
          placeholder="Current Password"
          secureTextEntry
          value={currentPassword}
          onChangeText={setCurrentPassword}
        />
        <TextInput
          style={styles.input}
          placeholder="New Password"
          secureTextEntry
          value={newPassword}
          onChangeText={setNewPassword}
        />
        <TextInput
          style={styles.input}
          placeholder="Confirm New Password"
          secureTextEntry
          value={confirmPassword}
          onChangeText={setConfirmPassword}
        />
        <TouchableOpacity
          style={styles.changePasswordButton}
          onPress={handleChangePassword}
          disabled={isChangingPassword}
        >
          <Text style={styles.changePasswordButtonText}>
            {isChangingPassword ? 'Updating...' : 'Change Password'}
          </Text>
        </TouchableOpacity>

        {/* Biometric Login */}
        <TouchableOpacity style={styles.option}>
          <MaterialIcons name="fingerprint" size={24} color="#6200ee" />
          <Text style={styles.optionText}>Biometric Login</Text>
          <Switch
            value={isBiometricEnabled}
            onValueChange={handleBiometricToggle}
          />
        </TouchableOpacity>

        {/* Two-Factor Authentication */}
        <TouchableOpacity style={styles.option}>
          <MaterialIcons name="security" size={24} color="#6200ee" />
          <Text style={styles.optionText}>Two-Factor Authentication</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    padding: 20,
    backgroundColor: '#6200ee',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
  },
  optionContainer: {
    marginTop: 20,
    paddingHorizontal: 20,
  },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 15,
    marginBottom: 10,
    borderRadius: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  optionText: {
    flex: 1,
    fontSize: 16,
    color: '#333',
    marginLeft: 10,
  },
  input: {
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 10,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  changePasswordButton: {
    backgroundColor: '#6200ee',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
    marginBottom: 20,
  },
  changePasswordButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#fff',
  },
});

export default SecurityPage;