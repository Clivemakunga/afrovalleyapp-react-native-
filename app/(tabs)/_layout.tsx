import { Redirect, Tabs } from 'expo-router';
import { MaterialIcons, FontAwesome, Ionicons } from '@expo/vector-icons';
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { StatusBar } from 'react-native';
import React from 'react';

export default function TabLayout() {

  return (
    <>
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: '#6200ee', // Active tab color
        tabBarInactiveTintColor: '#666', // Inactive tab color
        headerShown: false,
        tabBarStyle: {
          backgroundColor: '#fff', // Tab bar background color
          borderTopWidth: 1,
          borderTopColor: '#eee',
        },
      }}
    >
      {/* Home Tab */}
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          headerShown: false,
          tabBarIcon: ({ color }) => (
            <MaterialIcons name="home" size={24} color={color} />
          ),
        }}
      />

      {/* Market Tab */}
      <Tabs.Screen
        name="market"
        options={{
          title: 'Market',
          tabBarIcon: ({ color }) => (
            <FontAwesome name="line-chart" size={24} color={color} />
          ),
        }}
      />

      {/* Portfolio Tab */}
      <Tabs.Screen
        name="portfolio"
        options={{
          title: 'Portfolio',
          tabBarIcon: ({ color }) => (
            <Ionicons name="wallet" size={24} color={color} />
          ),
        }}
      />

      {/* Events Tab */}
      <Tabs.Screen
        name="explore"
        options={{
          title: 'Tour Guide',
          tabBarIcon: ({ color }) => (
            <MaterialIcons name="travel-explore" size={24} color={color} />
          ),
        }}
      />

      {/* Settings Tab */}
      <Tabs.Screen
        name="settings"
        options={{
          title: 'Settings',
          tabBarIcon: ({ color }) => (
            <Ionicons name="settings" size={24} color={color} />
          ),
        }}
      />
    </Tabs>
    </>
  );
}