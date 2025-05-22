import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Modal, TouchableOpacity } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { Image } from 'expo-image';

export default function PlaceDetailsScreen() {
  const { item } = useLocalSearchParams();
  const tour = JSON.parse(item);
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);

  const openModal = (image) => {
    setSelectedImage(image);
    setModalVisible(true);
  };

  const closeModal = () => {
    setModalVisible(false);
    setSelectedImage(null);
  };

  return (
    <ScrollView style={styles.container}>
      {/* Main Image */}
      <Image source={{ uri: tour.images?.[0] || 'https://via.placeholder.com/150' }} style={styles.placeImage} />

      {/* Details Container */}
      <View style={styles.detailsContainer}>
        {/* Name */}
        <Text style={styles.placeName}>{tour.name}</Text>

        {/* Description */}
        <Text style={styles.placeDescription}>{tour.description}</Text>

        {/* Rating */}
        <Text style={styles.placeRating}>⭐ {tour.rating}</Text>

        {/* Category */}
        <Text style={styles.sectionTitle}>Category</Text>
        <Text style={styles.category}>{tour.category}</Text>

        {/* More Images */}
        {tour.images?.length > 1 && (
          <>
            <Text style={styles.sectionTitle}>More Images</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              {tour.images.slice(1).map((image, index) => (
                <TouchableOpacity key={index} onPress={() => openModal(image)}>
                  <Image source={{ uri: image }} style={styles.moreImage} />
                </TouchableOpacity>
              ))}
            </ScrollView>
          </>
        )}

        {/* Activities */}
        {tour.activities?.length > 0 && (
          <>
            <Text style={styles.sectionTitle}>Activities</Text>
            {tour.activities.map((activity, index) => (
              <Text key={index} style={styles.activity}>- {activity}</Text>
            ))}
          </>
        )}

        {/* Nearby Hotels */}
        {tour.hotels?.length > 0 && (
          <>
            <Text style={styles.sectionTitle}>Nearby Hotels</Text>
            {tour.hotels.map((hotel, index) => (
              <Text key={index} style={styles.hotel}>- {hotel}</Text>
            ))}
          </>
        )}

        {/* Travel Agencies */}
        {tour.travel_agencies?.length > 0 && (
          <>
            <Text style={styles.sectionTitle}>Travel Agencies</Text>
            {tour.travel_agencies.map((agency, index) => (
              <Text key={index} style={styles.agency}>- {agency}</Text>
            ))}
          </>
        )}
      </View>

      {/* Modal for displaying the selected image */}
      <Modal
        transparent={true}
        visible={modalVisible}
        onRequestClose={closeModal}
      >
        <View style={styles.modalContainer}>
          <TouchableOpacity style={styles.closeButton} onPress={closeModal}>
            <Text style={styles.closeButtonText}>Close</Text>
          </TouchableOpacity>
          <Image source={{ uri: selectedImage }} style={styles.modalImage} />
        </View>
      </Modal>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  placeImage: {
    width: '100%',
    height: 250,
  resizeMode: 'cover',
  borderRadius: 10,
  },
  detailsContainer: {
    padding: 20,
  },
  placeName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
  },
  placeDescription: {
    fontSize: 16,
    color: '#666',
    marginTop: 10,
  },
  placeRating: {
    fontSize: 16,
    color: '#333',
    marginTop: 10,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginTop: 20,
  },
  category: {
    fontSize: 16,
    color: '#333',
    marginTop: 5,
  },
  moreImage: {
    width: 150,
    height: 100,
    borderRadius: 10,
    marginRight: 10,
    marginTop: 10,
  },
  activity: {
    fontSize: 16,
    color: '#333',
    marginTop: 5,
  },
  hotel: {
    fontSize: 16,
    color: '#333',
    marginTop: 5,
  },
  agency: {
    fontSize: 16,
    color: '#333',
    marginTop: 5,
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
  },
  modalImage: {
    width: '90%',
    height: '70%',
    resizeMode: 'contain',
    borderRadius: 10,
  },
  closeButton: {
    position: 'absolute',
    top: 40,
    right: 20,
    padding: 10,
    backgroundColor: '#fff',
    borderRadius: 5,
  },
  closeButtonText: {
    fontSize: 16,
    color: '#333',
  },
});