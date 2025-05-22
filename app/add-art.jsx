import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, Alert, Image, ScrollView, ActivityIndicator, Modal } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { supabase } from '../lib/supabase';
import { router } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';

const AddArtScreen = () => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [rawPrice, setRawPrice] = useState(''); // Stores the raw numeric value
  const [certificateUrl, setCertificateUrl] = useState('');
  const [provenance, setProvenance] = useState('');
  const [width, setWidth] = useState('');
  const [height, setHeight] = useState('');
  const [exhibitionHistory, setExhibitionHistory] = useState('');
  const [images, setImages] = useState([]); // Array to store multiple images
  const [loading, setLoading] = useState(false);
  const [user, setUser] = useState(null);

  // Fetch user data from Supabase
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          const { data: profile, error } = await supabase
            .from('users')
            .select('name, surname, is_verified, image')
            .eq('id', user.id)
            .single();

          if (error) throw error;

          setUser({
            ...user,
            name: profile?.name || '',
            surname: profile?.surname || '',
            avatar_url: profile?.image || 'https://i.pravatar.cc/250?u=mail@ashallendesign.co.uk',
            is_verified: profile?.is_verified || false,
          });
        }
      } catch (error) {
        console.error('Error fetching user data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, []);

  // Function to handle price input changes
  const handlePriceChange = (text) => {
    // Remove non-numeric characters
    const numericValue = text.replace(/[^0-9.]/g, '');
    setRawPrice(numericValue); // Store the raw numeric value
  };

  // Function to format the price when the input loses focus
  const formatPrice = () => {
    if (rawPrice) {
      const numericValue = parseFloat(rawPrice);
      if (numericValue < 1) {
        Alert.alert('Invalid Amount', 'The price must be at least 1 USD.');
        setPrice('');
        setRawPrice('');
        return;
      }
      const formattedValue = numericValue.toFixed(2);
      setPrice(`$${formattedValue}`);
    } else {
      setPrice('');
    }
  };

  // Function to validate the description word count
  const validateDescription = () => {
    const words = description.trim().split(/\s+/).filter(Boolean); // Split into words and remove empty strings
    if (words.length < 20) {
      Alert.alert('Invalid Description', 'The description must contain at least 20 words.');
      return false;
    }
    return true;
  };

  // Function to pick multiple images from the device
  const pickImages = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission required', 'Please allow access to your photo library to upload images.');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsMultipleSelection: true, // Allow multiple image selection
      quality: 0.7, // Image quality
    });

    if (!result.canceled) {
      const selectedImages = result.assets.map((asset) => asset.uri);

      // Check if adding the new images would exceed the limit of 4
      if (images.length + selectedImages.length > 4) {
        Alert.alert('Image Limit Exceeded', 'You can only select up to 4 images.');
        // Only add the first few images to stay within the limit
        const remainingSlots = 4 - images.length;
        setImages([...images, ...selectedImages.slice(0, remainingSlots)]);
      } else {
        setImages([...images, ...selectedImages]);
      }
    }
  };

  // Function to upload an image to Supabase Storage
  const uploadImage = async (imageUris) => {
    const uploadedImageUrls = [];

    for (const uri of imageUris) {
      const fileName = uri.split('/').pop();
      const fileType = fileName.split('.').pop();
      const filePath = `images/${fileName}`;
      
      const { error } = await supabase.storage
        .from('art-images')
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
        .from('art-images')
        .getPublicUrl(filePath);

      uploadedImageUrls.push(publicURL.publicUrl);
    }

    return uploadedImageUrls;
  };

  // Function to add the art piece to Supabase
  const addArtPiece = async () => {
    if (!title || !description || !price || images.length === 0) {
      Alert.alert('Error', 'Please fill in all required fields and select at least one image.');
      return;
    }

    // Validate the description word count
    if (!validateDescription()) {
      return;
    }

    // Ensure the price is at least 1 USD
    const numericPrice = parseFloat(rawPrice);
    if (numericPrice < 1) {
      Alert.alert('Invalid Amount', 'The price must be at least 1 USD.');
      return;
    }

    setLoading(true);

    try {
      const imageUrls = await uploadImage(images);
      // Get the current user's ID
      const { data: { user: authUser } } = await supabase.auth.getUser();
      const userId = authUser?.id;

      if (!userId) {
        throw new Error('User not authenticated.');
      }

      // Determine the badge based on the price
      const badge = numericPrice < 100 ? 'Economic' : 'Premium';

      // Combine name and surname for owner_name
      const owner_name = `${user?.name || ''} ${user?.surname || ''}`.trim();

      // Insert the art piece into the database
      const { error } = await supabase
        .from('art-pieces')
        .insert([
          {
            title,
            description,
            price: numericPrice,
            badge,
            certificate_url: certificateUrl,
            provenance,
            dimensions: `${width}cm x ${height}cm`,
            exhibition_history: exhibitionHistory,
            owner_id: userId, // Set the owner_id to the current user's ID
            buyer_id: null, // Initially, the buyer_id is null
            is_available: true,
            images: imageUrls, // Art piece is available by default
            owner_name, // Add the owner's name and surname
          },
        ])
        .select()
        .single();

      if (error) throw error;

      // Show a success alert
      Alert.alert('Success', 'Art piece created successfully!');

      // Navigate back to the market screen
      router.replace('/market');
    } catch (error) {
      Alert.alert('Error', error.message);
    } finally {
      setLoading(false);
    }
  };

  // Function to remove an image from the selected images
  const removeImage = (index) => {
    setImages((prevImages) => prevImages.filter((_, i) => i !== index));
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.scrollContent}>
      <Text style={styles.title}>Add Art Piece</Text>

      {/* Title Input */}
      <TextInput
        style={styles.input}
        placeholder="Title"
        value={title}
        onChangeText={setTitle}
      />

      {/* Description Input */}
      <TextInput
        style={[styles.input, styles.descriptionInput]}
        placeholder="Description (minimum 20 words)"
        value={description}
        onChangeText={setDescription}
        multiline
        onBlur={validateDescription} // Validate on blur
      />

      {/* Price Input with Currency Icon */}
      <View style={styles.priceContainer}>
        <Text style={styles.currencyIcon}>$</Text>
        <TextInput
          style={styles.priceInput}
          placeholder="Price (USD)"
          value={rawPrice} // Use rawPrice for input
          onChangeText={handlePriceChange}
          onBlur={formatPrice} // Format when input loses focus
          keyboardType="numeric"
        />
      </View>

      {/* Dimensions Input */}
      <View style={styles.dimensionsContainer}>
        <TextInput
          style={[styles.input, styles.dimensionInput]}
          placeholder="Width (cm)"
          value={width}
          onChangeText={(text) => setWidth(text.replace(/[^0-9]/g, ''))}
          keyboardType="numeric"
        />
        <Text style={styles.dimensionSeparator}>x</Text>
        <TextInput
          style={[styles.input, styles.dimensionInput]}
          placeholder="Height (cm)"
          value={height}
          onChangeText={(text) => setHeight(text.replace(/[^0-9]/g, ''))}
          keyboardType="numeric"
        />
      </View>

      {/* Certificate URL Input */}
      <TextInput
        style={styles.input}
        placeholder="Certificate URL (optional)"
        value={certificateUrl}
        onChangeText={setCertificateUrl}
      />

      {/* Provenance Input */}
      <TextInput
        style={styles.input}
        placeholder="Provenance (optional)"
        value={provenance}
        onChangeText={setProvenance}
        multiline
      />

      {/* Exhibition History Input */}
      <TextInput
        style={styles.input}
        placeholder="Exhibition History (optional)"
        value={exhibitionHistory}
        onChangeText={setExhibitionHistory}
        multiline
      />

      {/* Image Picker */}
      <TouchableOpacity style={styles.imagePicker} onPress={pickImages}>
        <Text style={styles.imagePickerText}>
          {images.length > 0 ? 'Add More Images' : 'Select Images'}
        </Text>
      </TouchableOpacity>

      {/* Display Selected Images */}
      <View style={styles.imageContainer}>
        {images.map((imageUri, index) => (
          <View key={index} style={styles.imageWrapper}>
            <Image source={{ uri: imageUri }} style={styles.image} />
            <TouchableOpacity
              style={styles.removeImageButton}
              onPress={() => removeImage(index)}
            >
              <MaterialIcons name="close" size={20} color="#fff" />
            </TouchableOpacity>
          </View>
        ))}
      </View>

      {/* Create Button */}
      <TouchableOpacity style={styles.button} onPress={addArtPiece} disabled={loading}>
        <Text style={styles.buttonText}>Create Art Piece</Text>
      </TouchableOpacity>

      {/* Full-Screen Loader */}
      <Modal transparent visible={loading}>
        <View style={styles.loaderContainer}>
          <ActivityIndicator size="large" color="#6200ee" />
        </View>
      </Modal>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 40, // Add padding at the bottom to ensure the button is visible
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 20,
  },
  input: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 15,
    marginBottom: 15,
    fontSize: 16,
  },
  descriptionInput: {
    minHeight: 100, // Set a minimum height for the multiline input
    textAlignVertical: 'top', // Align text to the top
  },
  priceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 10,
    marginBottom: 15,
    paddingHorizontal: 15,
  },
  currencyIcon: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginRight: 10,
  },
  priceInput: {
    flex: 1,
    fontSize: 16,
    paddingVertical: 15,
  },
  dimensionsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 15,
  },
  dimensionInput: {
    flex: 1,
    marginRight: 10,
  },
  dimensionSeparator: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    alignSelf: 'center',
    marginHorizontal: 5,
  },
  imagePicker: {
    backgroundColor: '#6200ee',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
    marginBottom: 15,
  },
  imagePickerText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#fff',
  },
  imageContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 15,
  },
  imageWrapper: {
    position: 'relative',
    width: '48%',
    margin: '1%',
  },
  image: {
    width: '100%',
    height: 150,
    borderRadius: 10,
  },
  removeImageButton: {
    position: 'absolute',
    top: 5,
    right: 5,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    borderRadius: 10,
    padding: 5,
  },
  button: {
    backgroundColor: '#03DAC6',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
    marginBottom: 20, // Add margin at the bottom of the button
  },
  buttonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#fff',
  },
  loaderContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
});

export default AddArtScreen;