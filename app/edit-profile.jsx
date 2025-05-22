import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity, ScrollView, TextInput, Alert } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { supabase } from '@/lib/supabase';
import { router } from 'expo-router';

const EditProfilePage = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [bio, setBio] = useState('');
  const [idNumber, setIdNumber] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [address, setAddress] = useState('');
  const [image, setImage] = useState(null);
  const [uploading, setUploading] = useState(false);

  // Fetch user data from Supabase
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const { data: { user: authUser }, error: authError } = await supabase.auth.getUser();
        if (authError) throw authError;

        if (authUser) {
          const { data: profile, error: profileError } = await supabase
            .from('users') // Replace with your table name
            .select('bio, id_number, phoneNumber, address, image')
            .eq('id', authUser.id)
            .single();

          if (profileError) throw profileError;

          setUser(authUser);
          setBio(profile?.bio || '');
          setIdNumber(profile?.id_number || '');
          setPhoneNumber(profile?.phoneNumber || '');
          setAddress(profile?.address || '');
          setImage(profile?.image);
        }
      } catch (error) {
        console.error('Error fetching user data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, []);

  // Function to pick an image from the device
  const pickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission required', 'Please allow access to your photo library to upload an image.');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true, // Allow editing to select a single image
      aspect: [4, 3], // Aspect ratio for cropping
      quality: 0.7, // Image quality
    });

    if (!result.canceled) {
      setImage(result.assets[0].uri); // Set the single image URI
    }
  };

  // Function to upload the image to Supabase Storage
  const uploadImage = async (imageUri) => {
    if (!imageUri) return null; // Skip if no image is selected

    // Generate a unique filename using a timestamp
    const fileName = `image_${Date.now()}.${imageUri.split('.').pop()}`;
    const filePath = `images/${fileName}`;

    try {
      const { error } = await supabase.storage
        .from('profile-pictures')
        .upload(filePath, {
          uri: imageUri,
          name: fileName,
          type: `image/${imageUri.split('.').pop()}`,
        });

      if (error) throw error;

      const { data: publicURL } = supabase.storage
        .from('profile-pictures')
        .getPublicUrl(filePath);

      return publicURL.publicUrl;
    } catch (error) {
      console.error('Error uploading image:', error);
      throw new Error('Failed to upload image. Please try again.');
    }
  };

  // Function to validate unique fields (id_number and phoneNumber)
  const validateUniqueFields = async () => {
    if (idNumber !== user?.id_number) {
      const { data: existingIdNumber, error: idError } = await supabase
        .from('users')
        .select('id')
        .eq('id_number', idNumber)
        .neq('id', user.id) // Exclude the current user
        .single();

      if (existingIdNumber) {
        throw new Error('ID Number already exists.');
      }
    }

    if (phoneNumber !== user?.phoneNumber) {
      const { data: existingPhoneNumber, error: phoneError } = await supabase
        .from('users')
        .select('id')
        .eq('phoneNumber', phoneNumber)
        .neq('id', user.id) // Exclude the current user
        .single();

      if (existingPhoneNumber) {
        throw new Error('Phone Number already exists.');
      }
    }
  };

  // Function to handle saving the updated profile
  const handleSave = async () => {
    setUploading(true);
    try {
      // Validate unique fields
      await validateUniqueFields();

      // Upload the image only if it has changed
      let imageUrl = user.image; // Default to the existing image
      if (image && image !== user.image) {
        imageUrl = await uploadImage(image);
      }

      // Prepare the update object
      const updates = {
        bio,
        id_number: idNumber,
        phoneNumber,
        address,
        image: imageUrl,
      };

      // Filter out fields that haven't changed
      const changes = {};
      Object.keys(updates).forEach((key) => {
        if (updates[key] !== user[key]) {
          changes[key] = updates[key];
        }
      });

      // Only proceed with the update if there are changes
      if (Object.keys(changes).length > 0) {
        const { error } = await supabase
          .from('users')
          .update(changes)
          .eq('id', user.id);

        if (error) throw error;

        Alert.alert('Profile updated successfully!');
        router.back();
      } else {
        Alert.alert('No changes detected.');
      }
    } catch (error) {
      console.error('Error updating profile:', error);
      Alert.alert(error.message || 'Failed to update profile. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <Text>Loading...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        {/* Profile Picture */}
        <TouchableOpacity onPress={pickImage}>
          <Image
            source={{ uri: image || 'https://robohash.org/mail@ashallendesign.co.uk' }}
            style={styles.profileImage}
          />
          <Text style={styles.changePhotoText}>Change Photo</Text>
        </TouchableOpacity>

        {/* Bio */}
        <View style={styles.inputContainer}>
          <MaterialIcons name="info" size={24} color="#6200ee" />
          <TextInput
            style={styles.input}
            placeholder="Bio"
            value={bio}
            onChangeText={setBio}
          />
        </View>

        {/* ID Number */}
        <View style={styles.inputContainer}>
          <MaterialIcons name="assignment" size={24} color="#6200ee" />
          <TextInput
            style={styles.input}
            placeholder="ID Number"
            value={idNumber}
            onChangeText={setIdNumber}
          />
        </View>

        {/* Phone Number */}
        <View style={styles.inputContainer}>
          <MaterialIcons name="phone" size={24} color="#6200ee" />
          <TextInput
            style={styles.input}
            placeholder="Phone Number"
            value={phoneNumber}
            onChangeText={setPhoneNumber}
          />
        </View>

        {/* Address */}
        <View style={styles.inputContainer}>
          <MaterialIcons name="location-on" size={24} color="#6200ee" />
          <TextInput
            style={styles.input}
            placeholder="Address"
            value={address}
            onChangeText={setAddress}
          />
        </View>

        {/* Save Button */}
        <TouchableOpacity style={styles.saveButton} onPress={handleSave} disabled={uploading}>
          <Text style={styles.saveButtonText}>{uploading ? 'Saving...' : 'Save Changes'}</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  scrollContainer: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  profileImage: {
    width: 150,
    height: 150,
    borderRadius: 75,
    borderWidth: 3,
    borderColor: '#6200ee',
    marginBottom: 10,
  },
  changePhotoText: {
    color: '#6200ee',
    textAlign: 'center',
    marginBottom: 20,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
    borderRadius: 10,
    padding: 15,
    marginBottom: 15,
    width: '100%',
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: '#333',
    marginLeft: 10,
  },
  saveButton: {
    backgroundColor: '#6200ee',
    paddingVertical: 12,
    paddingHorizontal: 30,
    borderRadius: 25,
    marginTop: 20,
  },
  saveButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default EditProfilePage;