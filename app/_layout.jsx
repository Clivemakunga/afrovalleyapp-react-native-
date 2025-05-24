import React, { useEffect, useState, useCallback } from 'react';
import { Redirect, Slot, Stack } from 'expo-router';
import { ActivityIndicator, View, StyleSheet } from 'react-native';
import * as SplashScreen from 'expo-splash-screen';
import { supabase } from '../lib/supabase';

// Prevent the splash screen from auto-hiding
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if the user is logged in
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setLoading(false);
    });

    // Listen for authentication changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => subscription.unsubscribe();
  }, []);

  const onLayoutRootView = useCallback(async () => {
    if (!loading) {
      // Hide the splash screen once the session check is complete
      await SplashScreen.hideAsync();
    }
  }, [loading]);

  if (loading) {
    // Return null or a loading indicator while waiting
    return null;
  }

  // Render the appropriate screen based on the session
  return (
    <View style={{ flex: 1 }} onLayout={onLayoutRootView}>
      {session ? <Redirect href="/(tabs)" /> : <Redirect href="/welcome" />}
      <Stack
        screenOptions={{
          headerShown: false,
          headerTitleStyle: {
            color: '#000',
            fontWeight: 'bold',
            fontSize: 20,
          },
          headerTintColor: '#000', // Back button and icons color
        }}
      >
        {/* Default screen */}
        <Stack.Screen
          name="add-art"
          options={{
            title: 'Add Art', // Custom title
            headerShown: true,
            headerBackTitle: 'Back'
          }}
        />

        {/* Art Details screen */}
        <Stack.Screen
          name="art-details"
          options={{
            title: 'Art Details', // Custom title
            headerShown: true,
            headerBackTitle: 'Back'
          }}
        />

        {/* Places screen */}
        <Stack.Screen
          name="places"
          options={{
            title: 'Places', // Custom title
            headerShown: true,
            headerBackTitle: 'Back'
          }}
        />

        {/* Details screen */}
        <Stack.Screen
          name="details"
          options={{
            title: 'Details', // Custom title
            headerShown: true,
            headerBackTitle: 'Back'
          }}
        />

        {/* Profile Page screen */}
        <Stack.Screen
          name="profile-page"
          options={{
            title: 'Profile', // Custom title
            headerShown: true,
            headerBackTitle: 'Back'
          }}
        />
        <Stack.Screen
          name="payment-page"
          options={{
            title: 'Settings', // Custom title
            headerShown: true,
            headerBackTitle: 'Back'
          }}
        />
         <Stack.Screen
          name="notifications-page"
          options={{
            title: 'Notifications', // Custom title
            headerShown: true,
            headerBackTitle: 'Back'
          }}
        />
        <Stack.Screen
          name="security-page"
          options={{
            title: 'Security', // Custom title
            headerShown: true,
            headerBackTitle: 'Back'
          }}
        />
        <Stack.Screen
          name="help-page"
          options={{
            title: 'Help', // Custom title
            headerShown: true,
            headerBackTitle: 'Back'
          }}
        />
        <Stack.Screen
          name="language-page"
          options={{
            title: 'Language', // Custom title
            headerShown: true,
            headerBackTitle: 'Back'
          }}
        />
        <Stack.Screen
          name="verification"
          options={{
            title: 'Verification', // Custom title
            headerShown: true,
            headerBackTitle: 'Back'
          }}
        />
        <Stack.Screen
          name="touristattractionscreen"
          options={{
            title: 'Tourist Attraction', // Custom title
            headerShown: true,
            headerBackTitle: 'Back'
          }}
        />
        <Stack.Screen
          name="category-places"
          options={{
            title: 'Categories', // Custom title
            headerShown: true,
            headerBackTitle: 'Back'
          }}
        />
        <Stack.Screen
          name="events"
          options={{
            title: 'Events', // Custom title
            headerShown: true,
            headerBackTitle: 'Back'
          }}
        />
        <Stack.Screen
          name="auction"
          options={{
            title: 'Auction', // Custom title
            headerShown: true,
            headerBackTitle: 'Back'
          }}
        />
        <Stack.Screen
          name="foundation"
          options={{
            title: 'Foundation', // Custom title
            headerShown: true,
            headerBackTitle: 'Back'
          }}
        />
        <Stack.Screen
          name="biometrics"
          options={{
            title: 'Biometrics', // Custom title
            headerShown: false,
            headerBackTitle: 'Back'
          }}
        />
         <Stack.Screen
          name="edit-profile"
          options={{
            title: 'Edit Profile', // Custom title
            headerShown: true,
            headerBackTitle: 'Back'
          }}
        />
        <Stack.Screen
          name="about"
          options={{
            title: 'About Us', // Custom title
            headerShown: true,
            headerBackTitle: 'Back'
          }}
        />
        <Stack.Screen
          name="support"
          options={{
            title: 'Support', // Custom title
            headerShown: true,
            headerBackTitle: 'Back'
          }}
        />
        <Stack.Screen
          name="faqs"
          options={{
            title: 'FAQs', // Custom title
            headerShown: true,
            headerBackTitle: 'Back'
          }}
        />
        <Stack.Screen
          name="live-chat"
          options={{
            title: 'Live Chat', // Custom title
            headerShown: true,
            headerBackTitle: 'Back'
          }}
        />
         <Stack.Screen
          name="edit-place"
          options={{
            title: 'Edit Place', // Custom title
            headerShown: true,
            headerBackTitle: 'Back'
          }}
        />
                 <Stack.Screen
          name="collaborations"
          options={{
            title: 'Collaborations', // Custom title
            headerShown: true,
            headerBackTitle: 'Back'
          }}
        />
        <Stack.Screen
          name="workshops"
          options={{
            title: 'Workshops', // Custom title
            headerShown: true,
            headerBackTitle: 'Back'
          }}
        />
        <Stack.Screen
          name="skills"
          options={{
            title: 'Professions', // Custom title
            headerShown: true,
            headerBackTitle: 'Back'
          }}
        />
        <Stack.Screen
          name="chat"
          options={{
            title: 'Chats', // Custom title
            headerShown: true,
            headerBackTitle: 'Back'
          }}
        />
      </Stack>
    </View>
  );
}