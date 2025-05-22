import React from 'react';
import { ScrollView, View, Text, TouchableOpacity, StyleSheet, Dimensions } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { router } from 'expo-router'; // Import Expo Router
import { supabase } from '@/lib/supabase';

const { width } = Dimensions.get('window');

const SettingsScreen = () => {
  // Define the scrollable items and their corresponding routes
  const scrollableItems = [
    { name: 'Item 1', route: '/item1' },
    { name: 'Item 2', route: '/item2' },
    { name: 'Item 3', route: '/item3' },
    { name: 'Item 4', route: '/item4' },
  ];

  const handleSignOut = async () => {
    const { error } = await supabase.auth.signOut();

    if (error) {
      alert(error.message);
    } else {
      router.replace('/welcome'); // Navigate to the welcome screen after sign-out
    }
  };

  return (
    <ScrollView style={styles.container}>
      {/* Two Square Components */}
      <View style={styles.squareContainer}>
        <TouchableOpacity style={styles.square} onPress={() => router.push('/payment-page')}>
          <MaterialIcons name="payment" size={40} color="#000" />
          <Text style={styles.squareTitle}>Payments</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.square} onPress={() => router.push('/profile-page')}>
          <MaterialIcons name="account-circle" size={40} color="#000" />
          <Text style={styles.squareTitle}>Profile</Text>
        </TouchableOpacity>
      </View>

      {/* Four Rectangle Components */}
      <View style={styles.rectangleContainer}>
        {[
          { icon: 'notifications', title: 'Notifications', subtitle: 'Manage notifications', route: '/notifications-page' },
          { icon: 'verified', title: 'Verification', subtitle: 'Verify to sell your art', route: '/verification' },
          { icon: 'security', title: 'Security', subtitle: 'Account security settings', route: '/security-page' },
          { icon: 'language', title: 'Language', subtitle: 'App language settings', route: '/language-page' },
          { icon: 'help', title: 'Help', subtitle: 'Get help and support', route: '/help-page' },
        ].map((item, index) => (
          <TouchableOpacity
            key={index}
            style={styles.rectangle}
            onPress={() => router.push(item.route)} // Navigate to individual screens
          >
            <MaterialIcons name={item.icon} size={30} color="#000" />
            <View style={styles.rectangleTextContainer}>
              <Text style={styles.rectangleTitle}>{item.title}</Text>
              <Text style={styles.rectangleSubtitle}>{item.subtitle}</Text>
            </View>
          </TouchableOpacity>
        ))}
      </View>

      {/* Sign Out Button with Icon */}
      <TouchableOpacity style={styles.signOutButton} onPress={handleSignOut}>
        <MaterialIcons name="logout" size={24} color="#fff" />
        <Text style={styles.signOutButtonText}>Sign Out</Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    padding: 16,
  },
  squareContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
    marginTop: 39,
  },
  square: {
    width: width * 0.45,
    height: width * 0.45,
    backgroundColor: '#fff',
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  squareTitle: {
    marginTop: 10,
    fontSize: 16,
    fontWeight: 'bold',
  },
  rectangleContainer: {
    marginBottom: 20,
  },
  rectangle: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 15,
    marginBottom: 10,
  },
  rectangleTextContainer: {
    marginLeft: 15,
  },
  rectangleTitle: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  rectangleSubtitle: {
    fontSize: 14,
    color: '#666',
  },
  signOutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#ff4444', // Red color for sign-out button
    padding: 15,
    borderRadius: 10,
    marginBottom: 30,
  },
  signOutButtonText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
    marginLeft: 10, // Space between icon and text
  },
});

export default SettingsScreen;