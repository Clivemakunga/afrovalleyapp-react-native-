import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, ActivityIndicator } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'expo-router'; // Use Expo Router for navigation

const VerificationScreen = () => {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [isVerified, setIsVerified] = useState(false);
  const [createdAt, setCreatedAt] = useState(null);
  const [fetchingStatus, setFetchingStatus] = useState(true); // Loader for fetching verification status
  const router = useRouter(); // Initialize Expo Router

  // Fetch user verification status and created_at date
  useEffect(() => {
    const fetchVerificationStatus = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          const { data: profile, error } = await supabase
            .from('users') // Replace with your table name
            .select('is_verified, created_at')
            .eq('id', user.id)
            .single();

          if (error) throw error;

          if (profile?.is_verified) {
            setIsVerified(true);
            setCreatedAt(profile.created_at);
          }
        }
      } catch (error) {
        console.error('Error fetching verification status:', error);
      } finally {
        setFetchingStatus(false); // Stop loading after fetching
      }
    };

    fetchVerificationStatus();
  }, []);

  // Simulate a payment process
  const simulatePayment = () => {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve(true); // Simulate a successful payment
      }, 2000); // Simulate a 2-second delay
    });
  };

  // Handle the verification process
  const handleVerification = async () => {
    if (!firstName || !lastName || !email) {
      Alert.alert('Error', 'Please fill in all fields.');
      return;
    }

    setLoading(true);

    try {
      // Simulate payment
      const paymentSuccess = await simulatePayment();

      if (paymentSuccess) {
        // Update user profile in Supabase with verification status
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          const { error } = await supabase
            .from('users') // Replace with your table name
            .update({ is_verified: true, name: firstName, surname: lastName })
            .eq('id', user.id);

          if (error) throw error;

          setIsVerified(true);
          setCreatedAt(new Date().toISOString()); // Use the current timestamp as the verification date

          Alert.alert('Success', 'Your account has been verified!');
        }
      } else {
        throw new Error('Payment failed. Please try again.');
      }
    } catch (error) {
      Alert.alert('Error', error.message);
    } finally {
      setLoading(false); // Stop loading after payment process
    }
  };

  // Show a loader while fetching verification status
  if (fetchingStatus) {
    return (
      <View style={styles.loaderContainer}>
        <ActivityIndicator size="large" color="#6200ee" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Verification Card */}
      {isVerified && (
        <View style={styles.verificationCard}>
          <MaterialIcons name="verified" size={32} color="#4CAF50" />
          <Text style={styles.verificationText}>Your account is verified!</Text>
          <Text style={styles.verificationDate}>
            Verified on: {new Date(createdAt).toLocaleDateString()}
          </Text>
        </View>
      )}

      {/* Form */}
      {!isVerified && (
        <View>
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.headerTitle}>Account Verification</Text>
            <Text style={styles.headerSubtitle}>
              Verify your account to get a verified badge on your profile.
            </Text>
          </View>

          <View style={styles.form}>
            <TextInput
              style={styles.input}
              placeholder="First Name"
              value={firstName}
              onChangeText={setFirstName}
            />
            <TextInput
              style={styles.input}
              placeholder="Last Name"
              value={lastName}
              onChangeText={setLastName}
            />
            <TextInput
              style={styles.input}
              placeholder="Email"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize='none'
            />
          </View>
        </View>
      )}

      {/* Payment Button */}
      {!isVerified && (
        <TouchableOpacity
          style={styles.paymentButton}
          onPress={handleVerification}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <>
              <MaterialIcons name="payment" size={24} color="#fff" />
              <Text style={styles.paymentButtonText}>Pay $10 to Verify</Text>
            </>
          )}
        </TouchableOpacity>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#f5f5f5',
  },
  loaderContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    marginBottom: 30,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
  },
  headerSubtitle: {
    fontSize: 16,
    color: '#666',
    marginTop: 10,
  },
  verificationCard: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  verificationText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#4CAF50',
    marginTop: 10,
  },
  verificationDate: {
    fontSize: 14,
    color: '#666',
    marginTop: 5,
  },
  form: {
    marginBottom: 20,
  },
  input: {
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 10,
    marginBottom: 15,
    fontSize: 16,
  },
  paymentButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#6200ee',
    padding: 15,
    borderRadius: 10,
  },
  paymentButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
    marginLeft: 10,
  },
});

export default VerificationScreen;