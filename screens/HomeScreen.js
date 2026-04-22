import React from 'react';
import { StyleSheet, View, Text, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { auth } from '../firebase';
import { signOut } from 'firebase/auth';

const HomeScreen = () => {
  const handleLogout = () => signOut(auth);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.welcome}>Welcome Home,</Text>
        <Text style={styles.user}>{auth.currentUser?.displayName || 'Player'}</Text>
        
        <View style={styles.card}>
          <Text style={styles.cardText}>Your squad dashboard is being prepared.</Text>
        </View>

        <TouchableOpacity style={styles.logout} onPress={handleLogout}>
          <Text style={styles.logoutText}>Logout</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000' },
  content: { flex: 1, padding: 24, justifyContent: 'center' },
  welcome: { color: '#71717A', fontSize: 18, fontWeight: '600' },
  user: { color: '#FFF', fontSize: 42, fontWeight: '900', marginBottom: 30 },
  card: { backgroundColor: '#0A0A0A', padding: 30, borderRadius: 24, borderWidth: 1, borderColor: '#1A1A1A' },
  cardText: { color: '#8B5CF6', fontSize: 16, textAlign: 'center', fontWeight: '600' },
  logout: { marginTop: 40, alignSelf: 'center' },
  logoutText: { color: '#EF4444', fontWeight: '700' }
});

export default HomeScreen;