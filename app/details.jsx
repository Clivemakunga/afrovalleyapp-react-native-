import React, { useState } from 'react';
import { View, Text, Image, StyleSheet, ScrollView, FlatList, Modal, TouchableOpacity, TouchableWithoutFeedback } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';

export default function DetailsScreen() {
  const { item } = useLocalSearchParams();
  const artPiece = JSON.parse(item);
  const [selectedImage, setSelectedImage] = useState(null); // Track the selected image for the modal

  return (
    <ScrollView style={styles.container}>
      {/* Main Image */}
      <Image source={{ uri: artPiece.images[0] }} style={styles.mainImage} />

      {/* Additional Images */}
      <Text style={styles.sectionTitle}>Art Gallery</Text>
      <FlatList
        horizontal
        data={artPiece.images}
        keyExtractor={(item, index) => index.toString()}
        renderItem={({ item }) => (
          <TouchableOpacity onPress={() => setSelectedImage(item)}>
            <Image source={{ uri: item }} style={styles.galleryImage} />
          </TouchableOpacity>
        )}
        contentContainerStyle={styles.galleryContainer}
      />

      {/* Art Piece Details */}
      <View style={styles.detailsContainer}>
        <Text style={styles.title}>{artPiece.title}</Text>
        <Text style={styles.description}>{artPiece.description}</Text>

        {/* Price and Badge */}
        <View style={styles.priceBadgeContainer}>
          <Text style={styles.price}>${artPiece.price}</Text>
          <View
            style={[
              styles.badge,
              artPiece.badge === 'Premium' ? styles.premiumBadge : styles.economicBadge,
            ]}
          >
            <Text style={styles.badgeText}>{artPiece.badge}</Text>
          </View>
        </View>

        {/* Dimensions */}
        <Text style={styles.detailLabel}>Dimensions</Text>
        <Text style={styles.detailValue}>{artPiece.dimensions}</Text>

        {/* Certificate URL */}
        <Text style={styles.detailLabel}>Certificate</Text>
        <Text style={styles.detailValue}>
          {artPiece.certificate_url || 'Not available'}
        </Text>

        {/* Provenance */}
        <Text style={styles.detailLabel}>Provenance</Text>
        <Text style={styles.detailValue}>
          {artPiece.provenance || 'Not available'}
        </Text>

        {/* Exhibition History */}
        <Text style={styles.detailLabel}>Exhibition History</Text>
        <Text style={styles.detailValue}>
          {artPiece.exhibition_history || 'Not available'}
        </Text>

        {/* Owner Name */}
        <Text style={styles.detailLabel}>Uploaded By</Text>
        <Text style={styles.detailValue}>{artPiece.owner_name}</Text>
      </View>

      {/* Modal for Full-Screen Image */}
      <Modal
        visible={!!selectedImage}
        transparent={true}
        onRequestClose={() => setSelectedImage(null)}
      >
        <TouchableWithoutFeedback onPress={() => setSelectedImage(null)}>
          <View style={styles.modalOverlay}>
            <TouchableWithoutFeedback>
              <View style={styles.modalContent}>
                <Image source={{ uri: selectedImage }} style={styles.fullImage} />
                <TouchableOpacity
                  style={styles.closeButton}
                  onPress={() => setSelectedImage(null)}
                >
                  <MaterialIcons name="close" size={30} color="#fff" />
                </TouchableOpacity>
              </View>
            </TouchableWithoutFeedback>
          </View>
        </TouchableWithoutFeedback>
      </Modal>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  mainImage: {
    width: '100%',
    height: 300,
  },
  galleryContainer: {
    paddingHorizontal: 10,
    marginTop: 10,
  },
  galleryImage: {
    width: 100,
    height: 100,
    borderRadius: 10,
    marginRight: 10,
  },
  detailsContainer: {
    padding: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 10,
  },
  description: {
    fontSize: 16,
    color: '#666',
    marginBottom: 20,
  },
  priceBadgeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  price: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#6200ee',
    marginRight: 10,
  },
  badge: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 5,
  },
  premiumBadge: {
    backgroundColor: '#FFC107', // Yellow for Premium
  },
  economicBadge: {
    backgroundColor: '#4CAF50', // Green for Economic
  },
  badgeText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#fff',
  },
  detailLabel: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginTop: 10,
  },
  detailValue: {
    fontSize: 16,
    color: '#666',
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginTop: 20,
    marginLeft: 20,
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
  },
  modalContent: {
    width: '90%',
    height: '80%',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  fullImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'contain',
    borderRadius: 10,
  },
  closeButton: {
    position: 'absolute',
    top: 10,
    right: 10,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    borderRadius: 20,
    padding: 5,
  },
});