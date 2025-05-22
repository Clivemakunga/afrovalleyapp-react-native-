import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

const Item2Screen = () => {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Item 2 Screen</Text>
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

export default Item2Screen;