import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, StyleSheet, ActivityIndicator, Image } from 'react-native';
import LottieView from 'lottie-react-native';
import { supabase } from '@/lib/supabase';

export default function AuctionScreen() {
  const [artPieces, setArtPieces] = useState([]);
  const [loading, setLoading] = useState(true);

  // Fetch art pieces from Supabase
  useEffect(() => {
    const fetchArtPieces = async () => {
      try {
        const { data, error } = await supabase
          .from('bids') // Replace with your table name
          .select('*')
          .is('buyer_id', null) // Only fetch art pieces that haven't been bought
          .order('created_at', { ascending: false }); // Sort by latest art pieces

        if (error) throw error;

        setArtPieces(data || []);
      } catch (error) {
        console.error('Error fetching art pieces:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchArtPieces();
  }, []);

  // Render loading state
  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#6200ee" />
      </View>
    );
  }

  // Render empty state
  if (artPieces.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <LottieView
          source={require('@/assets/animations/empty-events.json')} // Add your Lottie animation file
          autoPlay
          loop
          style={styles.animation}
        />
        <Text style={styles.emptyText}>No art pieces available for auction at the moment.</Text>
      </View>
    );
  }

  // Render art pieces list
  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Art Auctions</Text>
      {artPieces.map((artPiece) => (
        <View key={artPiece.id} style={styles.artCard}>
          <Image source={{ uri: artPiece.image_url }} style={styles.artImage} />
          <View style={styles.artDetails}>
            <Text style={styles.artTitle}>{artPiece.title}</Text>
            <Text style={styles.artDescription}>{artPiece.description}</Text>
            <Text style={styles.artPrice}>Starting Bid: ${artPiece.starting_bid}</Text>
          </View>
        </View>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#f5f5f5',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  animation: {
    width: 200,
    height: 200,
  },
  emptyText: {
    fontSize: 16,
    color: '#666',
    marginTop: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    color: '#333',
  },
  artCard: {
    backgroundColor: '#fff',
    borderRadius: 10,
    marginBottom: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  artImage: {
    width: '100%',
    height: 200,
    resizeMode: 'cover',
  },
  artDetails: {
    padding: 16,
  },
  artTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  artDescription: {
    fontSize: 14,
    color: '#666',
    marginTop: 8,
  },
  artPrice: {
    fontSize: 16,
    color: '#6200ee',
    marginTop: 8,
    fontWeight: 'bold',
  },
});