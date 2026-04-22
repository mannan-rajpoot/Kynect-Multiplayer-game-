import React, { useState, useRef, useEffect } from 'react';
import {
  StyleSheet, View, Text, TextInput, TouchableOpacity, 
  KeyboardAvoidingView, Platform, ScrollView, Animated, ActivityIndicator
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import { db, auth } from '../firebase';
import { doc, updateDoc } from 'firebase/firestore';

const SetupScreen = ({ onFinish }) => {
  const [fullName, setFullName] = useState('');
  const [bio, setBio] = useState('');
  const [loading, setLoading] = useState(false);
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(fadeAnim, { toValue: 1, duration: 800, useNativeDriver: true }).start();
  }, []);

  const handleComplete = async () => {
    if (!fullName.trim()) return;
    setLoading(true);
    try {
      const userRef = doc(db, 'users', auth.currentUser.uid);
      await updateDoc(userRef, {
        fullName: fullName.trim(),
        bio: bio.trim(),
        setupCompleted: true, // This flag is crucial
      });
      onFinish();
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={styles.scroll}>
          <Animated.View style={[styles.content, { opacity: fadeAnim }]}>
            <View style={styles.header}>
              <Text style={styles.title}>Complete your{'\n'}<Text style={{color: '#8B5CF6'}}>Profile.</Text></Text>
              <Text style={styles.subtitle}>Tell the squad a bit about yourself before you jump in.</Text>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>FULL NAME</Text>
              <TextInput
                style={styles.input}
                placeholder="John Doe"
                placeholderTextColor="#3F3F46"
                value={fullName}
                onChangeText={setFullName}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>BIO (OPTIONAL)</Text>
              <TextInput
                style={[styles.input, styles.textArea]}
                placeholder="The best player in the world..."
                placeholderTextColor="#3F3F46"
                multiline
                numberOfLines={4}
                value={bio}
                onChangeText={setBio}
              />
            </View>

            <TouchableOpacity 
              style={[styles.btn, !fullName.trim() && styles.btnDisabled]} 
              onPress={handleComplete}
              disabled={loading || !fullName.trim()}
            >
              {loading ? <ActivityIndicator color="#FFF" /> : <Text style={styles.btnText}>Finish Setup</Text>}
            </TouchableOpacity>
          </Animated.View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000' },
  scroll: { flexGrow: 1, padding: 24, justifyContent: 'center' },
  header: { marginBottom: 40 },
  title: { fontSize: 42, fontWeight: '900', color: '#FFF', lineHeight: 48 },
  subtitle: { fontSize: 16, color: '#71717A', marginTop: 12 },
  inputGroup: { marginBottom: 24 },
  label: { color: '#8B5CF6', fontSize: 12, fontWeight: '800', marginBottom: 8, letterSpacing: 1 },
  input: {
    backgroundColor: '#0A0A0A',
    borderWidth: 1.5,
    borderColor: '#1A1A1A',
    borderRadius: 16,
    padding: 18,
    color: '#FFF',
    fontSize: 16,
    fontWeight: '600',
  },
  textArea: { height: 120, textAlignVertical: 'top' },
  btn: {
    backgroundColor: '#8B5CF6',
    height: 64,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 20,
    shadowColor: '#8B5CF6',
    shadowOpacity: 0.3,
    shadowRadius: 10,
  },
  btnDisabled: { backgroundColor: '#161616' },
  btnText: { color: '#FFF', fontSize: 16, fontWeight: '800' }
});

export default SetupScreen;