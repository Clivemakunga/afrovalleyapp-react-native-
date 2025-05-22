import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Alert, Animated, Easing } from 'react-native';
import { router } from 'expo-router';
import * as LocalAuthentication from 'expo-local-authentication';
import { MaterialIcons } from '@expo/vector-icons'; // For icons

const BiometricsPage = () => {
  const [isAuthenticating, setIsAuthenticating] = useState(true);
  const spinValue = new Animated.Value(0); // For animation

  // Spin animation for the biometric icon
  useEffect(() => {
    Animated.loop(
      Animated.timing(spinValue, {
        toValue: 1,
        duration: 1500,
        easing: Easing.linear,
        useNativeDriver: true,
      })
    ).start();
  }, []);

  const spin = spinValue.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'], // Rotate 360 degrees
  });

  // Handle biometric authentication
  useEffect(() => {
    const authenticateWithBiometrics = async () => {
      const { success } = await LocalAuthentication.authenticateAsync({
        promptMessage: 'Authenticate to continue',
      });

      if (success) {
        // Navigate to the home screen after successful biometric authentication
        router.replace('/(tabs)');
      } else {
        // If biometric authentication fails or is canceled, go back to the login screen
        Alert.alert('Biometric Authentication Failed', 'Please log in again.');
        router.replace('/login');
      }
      setIsAuthenticating(false);
    };

    authenticateWithBiometrics();
  }, []);

  return (
    <View style={styles.container}>
      {/* Biometric Icon with Animation */}
      <Animated.View style={{ transform: [{ rotate: spin }] }}>
        <MaterialIcons name="fingerprint" size={100} color="#6200ee" />
      </Animated.View>

      {/* Loading Text */}
      <Text style={styles.text}>
        {isAuthenticating ? 'Authenticating with Biometrics...' : 'Authentication Complete!'}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
  },
  text: {
    fontSize: 18,
    color: '#333',
    marginTop: 20,
  },
});

export default BiometricsPage;