import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router'; // Import useRouter from expo-router

const HelpPage = () => {
  const router = useRouter(); // Initialize the router

  // Help options with their respective routes
  const helpOptions = [
    { icon: 'help-outline', title: 'FAQs', screen: '/faqs' },
    { icon: 'email', title: 'Contact Support', screen: '/support' },
    { icon: 'chat', title: 'Live Chat', screen: '/live-chat' },
    { icon: 'info', title: 'About Us', screen: '/about' },
  ];

  return (
    <View style={styles.container}>
      {/* Help Options */}
      <View style={styles.helpContainer}>
        {helpOptions.map((option, index) => (
          <TouchableOpacity
            key={index}
            style={styles.helpOption}
            onPress={() => router.push(option.screen)} // Navigate to the respective screen
          >
            <MaterialIcons name={option.icon} size={24} color="#6200ee" />
            <Text style={styles.helpText}>{option.title}</Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  helpContainer: {
    marginTop: 20,
  },
  helpOption: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 15,
    marginHorizontal: 20,
    marginBottom: 10,
    borderRadius: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  helpText: {
    fontSize: 16,
    color: '#333',
    marginLeft: 10,
  },
});

export default HelpPage;