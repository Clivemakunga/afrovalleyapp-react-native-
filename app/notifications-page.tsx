import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Switch, TouchableOpacity, ActivityIndicator } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { supabase } from '@/lib/supabase'; // Import Supabase client

const NotificationsPage = () => {
  const [pushNotifications, setPushNotifications] = useState(true);
  const [emailNotifications, setEmailNotifications] = useState(false);
  const [smsNotifications, setSmsNotifications] = useState(false);
  const [loading, setLoading] = useState(true); // Loading state for fetching data

  // Fetch user preferences from Supabase on component mount
  useEffect(() => {
    fetchUserPreferences();
  }, []);

  // Function to fetch user preferences
  const fetchUserPreferences = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser(); // Get current user
      if (!user) throw new Error('User not logged in');

      // Fetch user preferences from Supabase
      const { data, error } = await supabase
        .from('user_preferences')
        .select('email_notifications')
        .eq('user_id', user.id)
        .single();

      if (error) throw error;

      // Update state with fetched preferences
      if (data) {
        setEmailNotifications(data.email_notifications);
      }
    } catch (error) {
      console.error('Error fetching user preferences:', error.message);
    } finally {
      setLoading(false); // Stop loading
    }
  };

  // Function to update email notifications preference in Supabase
  const updateEmailNotifications = async (value) => {
    try {
      const { data: { user } } = await supabase.auth.getUser(); // Get current user
      if (!user) throw new Error('User not logged in');

      // Update preference in Supabase
      const { error } = await supabase
        .from('user_preferences')
        .upsert({
          user_id: user.id,
          email_notifications: value,
        });

      if (error) throw error;

      // Update local state
      setEmailNotifications(value);
    } catch (error) {
      console.error('Error updating email notifications:', error.message);
    }
  };

  return (
    <View style={styles.container}>

      {/* Notification Options */}
      <View style={styles.optionContainer}>
        {/* Push Notifications */}
        <TouchableOpacity style={styles.option}>
          <MaterialIcons name="notifications" size={24} color="#6200ee" />
          <Text style={styles.optionText}>Push Notifications</Text>
          <Switch
            value={pushNotifications}
            onValueChange={() => setPushNotifications(!pushNotifications)}
          />
        </TouchableOpacity>

        {/* Email Notifications */}
        {/* <TouchableOpacity style={styles.option}>
          <MaterialIcons name="email" size={24} color="#6200ee" />
          <Text style={styles.optionText}>Email Notifications</Text>
          {loading ? (
            <ActivityIndicator size="small" color="#6200ee" />
          ) : (
            <Switch
              value={emailNotifications}
              onValueChange={(value) => updateEmailNotifications(value)}
            />
          )}
        </TouchableOpacity> */}

        {/* SMS Notifications */}
        <TouchableOpacity style={styles.option}>
          <MaterialIcons name="message" size={24} color="#6200ee" />
          <Text style={styles.optionText}>SMS Notifications</Text>
          <Switch
            value={smsNotifications}
            onValueChange={() => setSmsNotifications(!smsNotifications)}
          />
        </TouchableOpacity>
      </View>

      {/* Notification Settings */}
      <View style={styles.settingsContainer}>
        <Text style={styles.settingsTitle}>Notification Settings</Text>
        <TouchableOpacity style={styles.settingsOption}>
          <Text style={styles.settingsOptionText}>Manage Notification Sounds</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.settingsOption}>
          <Text style={styles.settingsOptionText}>Customize Notification Preferences</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    padding: 20,
    backgroundColor: '#6200ee',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
  },
  optionContainer: {
    marginTop: 20,
  },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 15,
    marginHorizontal: 20,
    marginBottom: 10,
    borderRadius: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  optionText: {
    flex: 1,
    fontSize: 16,
    color: '#333',
    marginLeft: 10,
  },
  settingsContainer: {
    marginTop: 20,
    paddingHorizontal: 20,
  },
  settingsTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 10,
  },
  settingsOption: {
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 10,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  settingsOptionText: {
    fontSize: 16,
    color: '#333',
  },
});

export default NotificationsPage;