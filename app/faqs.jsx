import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';

const FAQsScreen = () => {
  const faqs = [
    { question: 'How do I reset my password?', answer: 'You can reset your password by going to the "Forgot Password" page and following the instructions.' },
    { question: 'How do I contact support?', answer: 'You can contact support by emailing us at support@example.com or using the live chat feature.' },
    { question: 'How do I update my profile?', answer: 'You can update your profile by navigating to the "Profile" section in the app.' },
    { question: 'What payment methods do you accept?', answer: 'We accept all major credit cards, PayPal, and bank transfers.' },
  ];

  return (
    <View style={styles.container}>
      <ScrollView>
        <Text style={styles.title}>Frequently Asked Questions</Text>
        {faqs.map((faq, index) => (
          <View key={index} style={styles.faqItem}>
            <Text style={styles.question}>{faq.question}</Text>
            <Text style={styles.answer}>{faq.answer}</Text>
          </View>
        ))}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  faqItem: {
    marginBottom: 20,
  },
  question: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#6200ee',
  },
  answer: {
    fontSize: 16,
    color: '#333',
    marginTop: 5,
  },
});

export default FAQsScreen;