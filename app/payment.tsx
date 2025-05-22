import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useLocalSearchParams } from 'expo-router';

const PaymentScreen = () => {
  const { art } = useLocalSearchParams(); // Access the passed art object

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Complete Payment</Text>
      <Text style={styles.artName}>{art.name}</Text>
      <Text style={styles.artPrice}>{art.price}</Text>
      <TouchableOpacity style={styles.payButton}>
        <Text style={styles.payButtonText}>Pay Now</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    padding: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 20,
  },
  artName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#6200ee',
  },
  artPrice: {
    fontSize: 18,
    color: '#333',
    marginTop: 10,
  },
  payButton: {
    backgroundColor: '#6200ee',
    padding: 15,
    borderRadius: 10,
    marginTop: 20,
    width: '100%',
    alignItems: 'center',
  },
  payButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
});

export default PaymentScreen;