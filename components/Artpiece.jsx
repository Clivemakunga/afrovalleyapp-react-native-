import React from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity } from 'react-native';
import { router } from 'expo-router';

const ArtPiece = ({ art }) => {
  return (
    <TouchableOpacity
      style={styles.artCard}
      onPress={() => router.push({ pathname: '/art-details', params: { art } })}
    >
      <Image source={{ uri: art.image }} style={styles.artImage} />
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
        <TouchableOpacity
          style={styles.buyButton}
          onPress={() => router.push({ pathname: '/payment', params: { art } })}
        >
          <Text style={styles.buyButtonText}>Buy Now</Text>
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  artCard: {
    backgroundColor: '#fff',
    borderRadius: 10,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  artImage: {
    width: '100%',
    height: 200,
    borderTopLeftRadius: 10,
    borderTopRightRadius: 10,
  },
  artDetails: {
    padding: 15,
  },
  artName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  artDescription: {
    fontSize: 14,
    color: '#666',
    marginTop: 5,
  },
  artPrice: {
    fontSize: 16,
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
    fontSize: 12,
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
    padding: 10,
    borderRadius: 5,
    marginTop: 10,
    alignItems: 'center',
  },
  buyButtonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
});

export default ArtPiece;