import React from 'react';
import { View, Text, StyleSheet, Image, ScrollView, TouchableOpacity } from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';

export default function ArtDetailsScreen() {
  const { art } = useLocalSearchParams(); // Access the passed art object
  const artPiece = JSON.parse(art);
  
  return (
    <ScrollView style={styles.container}>
      {/* Art Image */}
      <Image source={{ uri: artPiece.image }} style={styles.artImage} />

      {/* Art Details */}
      <View style={styles.artDetails}>
        <Text style={styles.artName}>{artPiece.name}</Text>
        <Text style={styles.artDescription}>{artPiece.description}</Text>
        <Text style={styles.artPrice}>{artPiece.price}</Text>
        <View style={styles.badgeContainer}>
          <Text
            style={[
              styles.badge,
              artPiece.badge === 'Premium' ? styles.premiumBadge : styles.economicBadge,
            ]}
          >
            {artPiece.badge}
          </Text>
        </View>
      </View>

      {/* Buy Now Button */}
      <TouchableOpacity
        style={styles.buyButton}
        onPress={() => router.push({ pathname: '/payment', params: { art } })}
      >
        <Text style={styles.buyButtonText}>Buy Now</Text>
      </TouchableOpacity>

      {/* More Information */}
      <View style={styles.moreInfo}>
        <Text style={styles.sectionTitle}>About This Art</Text>
        <Text style={styles.sectionText}>
          This is a stunning piece of art created by a talented artist. It captures the essence of
          beauty and creativity, making it a perfect addition to any collection.
        </Text>

        <Text style={styles.sectionTitle}>Artist Information</Text>
        <Text style={styles.sectionText}>
          The artist, John Doe, is known for their unique style and attention to detail. They have
          been creating art for over 10 years and have gained recognition worldwide.
        </Text>

        <Text style={styles.sectionTitle}>Shipping Information</Text>
        <Text style={styles.sectionText}>
          This art piece will be shipped securely and insured. Delivery typically takes 5-7 business
          days.
        </Text>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  artImage: {
    width: '100%',
    height: 300,
  },
  artDetails: {
    padding: 20,
    backgroundColor: '#fff',
  },
  artName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
  },
  artDescription: {
    fontSize: 16,
    color: '#666',
    marginTop: 10,
  },
  artPrice: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#6200ee',
    marginTop: 10,
  },
  badgeContainer: {
    marginTop: 10,
  },
  badge: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 5,
    fontSize: 14,
    fontWeight: 'bold',
    color: '#fff',
    alignSelf: 'flex-start',
  },
  economicBadge: {
    backgroundColor: '#4CAF50', // Green for Economic
  },
  premiumBadge: {
    backgroundColor: '#FFC107', // Yellow for Premium
  },
  buyButton: {
    backgroundColor: '#6200ee',
    padding: 15,
    borderRadius: 10,
    margin: 20,
    alignItems: 'center',
  },
  buyButtonText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
  },
  moreInfo: {
    padding: 20,
    backgroundColor: '#fff',
    marginTop: 10,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 10,
  },
  sectionText: {
    fontSize: 16,
    color: '#666',
    marginBottom: 20,
  },
});
