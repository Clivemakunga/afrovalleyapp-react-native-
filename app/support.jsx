import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Linking } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';

const ContactSupportScreen = () => {
  const contactOptions = [
    { icon: 'email', title: 'Email Support', action: 'mailto:support@example.com' },
    { icon: 'phone', title: 'Call Support', action: 'tel:+1234567890' },
  ];

  const handlePress = (action) => {
    Linking.openURL(action);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Contact Support</Text>
      {contactOptions.map((option, index) => (
        <TouchableOpacity key={index} style={styles.option} onPress={() => handlePress(option.action)}>
          <MaterialIcons name={option.icon} size={24} color="#6200ee" />
          <Text style={styles.optionText}>{option.title}</Text>
        </TouchableOpacity>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
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
    fontSize: 16,
    color: '#333',
    marginLeft: 10,
  },
});

export default ContactSupportScreen;