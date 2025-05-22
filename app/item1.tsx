import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

const Item1Screen = () => {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Item 1 Screen</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
  },
});

export default Item1Screen;