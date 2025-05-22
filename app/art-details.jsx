import React from 'react';
import { View, Text, StyleSheet, Image, ScrollView, TouchableOpacity } from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';

const ArtDetailsScreen = () => {
  const { art } = useLocalSearchParams(); // Access the passed art object

  return (
    <ScrollView style={styles.container}>
      {/* Art Image */}
      <Image source={{ uri: art.image }} style={styles.artImage} />

      {/* Art Details */}
      <View style={styles.artDetails}>
        <Text style={styles.artName}>{art.name}</Text>
        <Text style={styles.artDescription}>{art.description}</Text>
        <Text style={styles.artPrice}>{art.price}</Text>
        <View style={styles.badgeContainer}>
          <Text
            style={[
              styles.badge,
              art.badge === 'Premium' ? styles.premiumBadge : styles.economicBadge,
            ]}
          >
            {art.badge}
          </Text>
        </View>
      </View>

      {/* Buy Now Button */}
      <TouchableOpacity
        style={styles.buyButton}
        onPress={() => router.push({ pathname: '/payment', params: { art } })}
      >
        <Text style={styles.buyButtonText}>Buy Nows</Text>
      </TouchableOpacity>
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

export default ArtDetailsScreen;