import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

export function RegisterScreen() {
  return (
    <View style={styles.container}>
      <View style={styles.card}>
        <Text style={styles.title}>Create Account</Text>
        <Text style={styles.subtitle}>Start your fitness journey today</Text>
        <View style={styles.form}>
          <Text style={styles.label}>Name</Text>
          <Text style={styles.input} />
          <Text style={styles.label}>Email</Text>
          <Text style={styles.input} />
          <Text style={styles.label}>Password</Text>
          <Text style={styles.input} />
          <Text style={styles.label}>Confirm Password</Text>
          <Text style={styles.input} />
        </View>
        <View style={styles.button}>Create Account</View>
        <Text style={styles.footer}>Already have an account? <Text style={styles.link}>Log In</Text></Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8FAFC', justifyContent: 'center', padding: 24 },
  card: { backgroundColor: '#FFFFFF', borderRadius: 20, padding: 32, ...{ shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.1, shadowRadius: 16, elevation: 4 } },
  title: { fontSize: 28, fontWeight: '700', color: '#0F172A', textAlign: 'center', marginBottom: 8 },
  subtitle: { fontSize: 16, color: '#64748B', textAlign: 'center', marginBottom: 32 },
  form: { marginBottom: 24 },
  label: { fontSize: 14, fontWeight: '500', color: '#0F172A', marginBottom: 8 },
  input: { backgroundColor: '#F8FAFC', borderRadius: 8, padding: 16, fontSize: 16, color: '#0F172A', borderWidth: 1, borderColor: '#E2E8F0', marginBottom: 16, height: 56 },
  button: { backgroundColor: '#2563EB', paddingVertical: 16, borderRadius: 12, alignItems: 'center', marginBottom: 16 },
  footer: { fontSize: 14, color: '#64748B', textAlign: 'center' },
  link: { color: '#2563EB', fontWeight: '600' },
});