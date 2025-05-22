import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, ScrollView, ActivityIndicator, Image } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { supabase } from '@/lib/supabase';
import { router } from 'expo-router';

const AddTouristAttractionScreen = ({ onSuccess }) => {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [rating, setRating] = useState('');
  const [category, setCategory] = useState('recreational');
  const [activities, setActivities] = useState('');
  const [hotels, setHotels] = useState('');
  const [travelAgencies, setTravelAgencies] = useState('');
  const [images, setImages] = useState([]);
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
      setImages(result.assets.map((asset) => asset.uri));
    }
  };

  const uploadImages = async (imageUris) => {
    const uploadedImageUrls = [];

    for (const uri of imageUris) {
      const fileName = `${Date.now()}-${uri.split('/').pop()}`; // Add a timestamp to the filename
      const fileType = fileName.split('.').pop();
      const filePath = `images/${fileName}`;

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
      // Get the current user's ID
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        throw new Error('User not authenticated');
      }

      const imageUrls = await uploadImages(images);

      const { error } = await supabase
        .from('tourist_attractions')
        .insert([
          {
            name,
            description,
            rating: parseFloat(rating),
            category,
            activities: activities.split(',').map((activity) => activity.trim()),
            hotels: hotels.split(',').map((hotel) => hotel.trim()),
            travel_agencies: travelAgencies.split(',').map((agency) => agency.trim()),
            images: imageUrls,
            created_by: user.id, // Add the current user's ID
          },
        ]);

      if (error) throw error;

      Alert.alert('Success', 'Tourist attraction added successfully!');
      setName('');
      setDescription('');
      setRating('');
      setCategory('recreational');
      setActivities('');
      setHotels('');
      setTravelAgencies('');
      setImages([]);

      // Call the onSuccess callback to trigger a re-fetch in the parent component
      if (onSuccess) {
        onSuccess();
      }

      // Navigate back to the previous screen
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
        {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.submitButtonText}>Add Tourist Attraction</Text>}
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

export default AddTouristAttractionScreen;