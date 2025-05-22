import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, ScrollView, ActivityIndicator, Image } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { supabase } from '@/lib/supabase';
import { router, useLocalSearchParams } from 'expo-router';

const EditPlaceScreen = () => {
  const { item } = useLocalSearchParams(); // Use useLocalSearchParams to get the item
  const parsedItem = JSON.parse(item); // Parse the item from the route params

  const [name, setName] = useState(parsedItem.name);
  const [description, setDescription] = useState(parsedItem.description);
  const [rating, setRating] = useState(parsedItem.rating.toString());
  const [category, setCategory] = useState(parsedItem.category);
  const [activities, setActivities] = useState(parsedItem.activities.join(', '));
  const [hotels, setHotels] = useState(parsedItem.hotels.join(', '));
  const [travelAgencies, setTravelAgencies] = useState(parsedItem.travel_agencies.join(', '));
  const [images, setImages] = useState(parsedItem.images);
  const [loading, setLoading] = useState(false);

  const pickImages = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission required', 'Please allow access to your photo library to upload images.');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsMultipleSelection: true,
      quality: 0.7,
    });

    if (!result.canceled) {
      setImages([...images, ...result.assets.map((asset) => asset.uri)]); // Append new images
    }
  };

  const uploadImages = async (imageUris) => {
    const uploadedImageUrls = [];

    for (const uri of imageUris) {
      const fileName = `${Date.now()}-${uri.split('/').pop()}`; // Add a timestamp to the filename
      const fileType = fileName.split('.').pop();
      const filePath = `images/${fileName}`; // Use the unique filename

      const { error } = await supabase.storage
        .from('tourist-attractions')
        .upload(filePath, {
          uri,
          name: fileName,
          type: `image/${fileType}`,
        });

      if (error) {
        console.error('Error uploading image:', error);
        throw error;
      }

      const { data: publicURL } = supabase.storage
        .from('tourist-attractions')
        .getPublicUrl(filePath);

      uploadedImageUrls.push(publicURL.publicUrl);
    }

    return uploadedImageUrls;
  };

  const handleSubmit = async () => {
    if (!name || !description || !rating || !category || !activities || !hotels || !travelAgencies || images.length === 0) {
      Alert.alert('Error', 'Please fill in all fields and select at least one image.');
      return;
    }

    setLoading(true);

    try {
      // Filter out images that are already URLs (previously uploaded)
      const newImages = images.filter((uri) => !uri.startsWith('http'));
      const existingImages = images.filter((uri) => uri.startsWith('http'));

      // Upload only new images
      const uploadedImageUrls = await uploadImages(newImages);

      // Combine existing and new image URLs
      const allImageUrls = [...existingImages, ...uploadedImageUrls];

      // Update the tourist attraction
      const { error } = await supabase
        .from('tourist_attractions')
        .update({
          name,
          description,
          rating: parseFloat(rating),
          category,
          activities: activities.split(',').map((activity) => activity.trim()),
          hotels: hotels.split(',').map((hotel) => hotel.trim()),
          travel_agencies: travelAgencies.split(',').map((agency) => agency.trim()),
          images: allImageUrls,
        })
        .eq('id', parsedItem.id);

      if (error) throw error;

      Alert.alert('Success', 'Tourist attraction updated successfully!');
      router.replace('/explore');
    } catch (error) {
      Alert.alert('Error', error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <TextInput style={styles.input} placeholder="Name of the place" value={name} onChangeText={setName} />
      <TextInput style={[styles.input, styles.multilineInput]} placeholder="Description" value={description} onChangeText={setDescription} multiline />
      <TextInput style={styles.input} placeholder="Rating (e.g., 4.5)" value={rating} onChangeText={setRating} keyboardType="numeric" />
      <View style={styles.radioGroup}>
        <Text style={styles.radioLabel}>Category:</Text>
        {['Recreational', 'Ghetto', 'Museum', 'Historical', 'Nature'].map((item) => (
          <TouchableOpacity key={item} style={styles.radioButtonContainer} onPress={() => setCategory(item.toLowerCase())}>
            <View style={[styles.radioButton, category === item.toLowerCase() && styles.radioButtonSelected]} />
            <Text>{item}</Text>
          </TouchableOpacity>
        ))}
      </View>
      <TextInput style={[styles.input, styles.multilineInput]} placeholder="Activities (comma-separated)" value={activities} onChangeText={setActivities} multiline />
      <TextInput style={[styles.input, styles.multilineInput]} placeholder="Hotels/Lodges nearby (comma-separated)" value={hotels} onChangeText={setHotels} multiline />
      <TextInput style={[styles.input, styles.multilineInput]} placeholder="Travel Agencies (comma-separated)" value={travelAgencies} onChangeText={setTravelAgencies} multiline />
      <TouchableOpacity style={styles.imagePickerButton} onPress={pickImages}>
        <Text style={styles.imagePickerText}>Select Images</Text>
      </TouchableOpacity>
      {images.length > 0 && (
        <View style={styles.imagePreviewContainer}>
          {images.map((uri, index) => (
            <Image key={index} source={{ uri }} style={styles.imagePreview} />
          ))}
        </View>
      )}
      <TouchableOpacity style={styles.submitButton} onPress={handleSubmit} disabled={loading}>
        {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.submitButtonText}>Update Tourist Attraction</Text>}
      </TouchableOpacity>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { padding: 20, backgroundColor: '#f5f5f5' },
  input: { backgroundColor: '#fff', padding: 15, borderRadius: 10, marginBottom: 15, fontSize: 16 },
  multilineInput: { height: 100, textAlignVertical: 'top' },
  imagePickerButton: { backgroundColor: '#6200ee', padding: 15, borderRadius: 10, alignItems: 'center', marginBottom: 15 },
  imagePickerText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
  imagePreviewContainer: { flexDirection: 'row', flexWrap: 'wrap', marginBottom: 15 },
  imagePreview: { width: 100, height: 100, borderRadius: 10, margin: 5 },
  submitButton: { backgroundColor: '#4CAF50', padding: 15, borderRadius: 10, alignItems: 'center' },
  submitButtonText: { color: '#fff', fontSize: 18, fontWeight: 'bold' },
  radioGroup: { marginBottom: 15 },
  radioLabel: { fontSize: 16, fontWeight: 'bold', marginBottom: 5 },
  radioButtonContainer: { flexDirection: 'row', alignItems: 'center', marginBottom: 5 },
  radioButton: { width: 20, height: 20, borderRadius: 10, borderWidth: 2, borderColor: '#000', marginRight: 10 },
  radioButtonSelected: { backgroundColor: '#000' },
});

export default EditPlaceScreen;