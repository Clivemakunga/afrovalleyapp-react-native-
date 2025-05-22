import React from 'react';
import { View, Text, ScrollView, StyleSheet, Image, TouchableOpacity, Linking } from 'react-native';

export default function FoundationScreen() {
  // Function to handle partner button press
  const handlePartnerPress = () => {
    Linking.openURL('mailto:admin@afrovalley.org'); // Open email client
  };

  return (
    <ScrollView style={styles.container}>
      {/* Header Section */}
      <View style={styles.header}>
        <Image
          source={require('@/assets/images/7.png')} // Add your logo image
          style={styles.logo}
        />
        <Text style={styles.headerTitle}>Purple Diamonds Foundation</Text>
        <Text style={styles.headerSubtitle}>Empowering Communities, Creating Change</Text>
      </View>

      {/* About Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>About Us</Text>
        <Text style={styles.sectionText}>
          The Purple Diamonds Foundation is a non-profit organization dedicated to empowering underserved communities through education, healthcare, and sustainable development initiatives. Our mission is to create a world where everyone has the opportunity to thrive.
        </Text>
      </View>

      {/* Mission Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Our Mission</Text>
        <Text style={styles.sectionText}>
          We believe in the power of collaboration and innovation to drive meaningful change. Our programs focus on:
        </Text>
        <View style={styles.missionList}>
          <Text style={styles.missionItem}>• Providing access to quality education for children.</Text>
          <Text style={styles.missionItem}>• Supporting healthcare initiatives in rural areas.</Text>
          <Text style={styles.missionItem}>• Promoting sustainable development and environmental conservation.</Text>
        </View>
      </View>

      {/* Partnership Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Partner With Us</Text>
        <Text style={styles.sectionText}>
          Join us in making a difference! Whether you're an individual, corporation, or organization, there are many ways to partner with Purple Diamonds:
        </Text>
        <View style={styles.partnershipList}>
          <Text style={styles.partnershipItem}>• Financial Contributions</Text>
          <Text style={styles.partnershipItem}>• Volunteer Opportunities</Text>
          <Text style={styles.partnershipItem}>• Corporate Sponsorships</Text>
          <Text style={styles.partnershipItem}>• Collaborative Projects</Text>
        </View>
        <TouchableOpacity style={styles.partnerButton} onPress={handlePartnerPress}>
          <Text style={styles.partnerButtonText}>Become a Partner</Text>
        </TouchableOpacity>
      </View>

      {/* Contact Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Contact Us</Text>
        <Text style={styles.sectionText}>
          Have questions or want to learn more? Reach out to us at:
        </Text>
        <Text style={styles.contactInfo}>Email: admin@afrovalley.org</Text>
        <Text style={styles.contactInfo}>Phone: (+263) 775 051 827</Text>
        <Text style={styles.contactInfo}>Address: 16 Edith Close, Arcadia Harare, Zimbabwe</Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    padding: 16,
  },
  header: {
    alignItems: 'center',
    marginBottom: 24,
  },
  logo: {
    width: 120,
    height: 120,
    borderRadius: 60,
    marginBottom: 16,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#6200ee',
    textAlign: 'center',
  },
  headerSubtitle: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginTop: 8,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 12,
  },
  sectionText: {
    fontSize: 16,
    color: '#666',
    lineHeight: 24,
  },
  missionList: {
    marginTop: 8,
  },
  missionItem: {
    fontSize: 16,
    color: '#666',
    lineHeight: 24,
  },
  partnershipList: {
    marginTop: 8,
  },
  partnershipItem: {
    fontSize: 16,
    color: '#666',
    lineHeight: 24,
  },
  partnerButton: {
    backgroundColor: '#6200ee',
    borderRadius: 10,
    padding: 16,
    alignItems: 'center',
    marginTop: 16,
  },
  partnerButtonText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
  },
  contactInfo: {
    fontSize: 16,
    color: '#666',
    marginTop: 8,
  },
});