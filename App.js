import React, { useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import IntroSplashScreen from './screens/IntroSplashScreen';

export default function App() {
  const [isReady, setIsReady] = useState(false);

  if (!isReady) {
    return <IntroSplashScreen onFinish={() => setIsReady(true)} />;
  }

  // Your Main App Content
  return (
    <View style={styles.main}>
      <Text style={styles.welcome}>Kynect App Ready</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  main: {
    flex: 1,
    backgroundColor: '#000',
    justifyContent: 'center',
    alignItems: 'center',
  },
  welcome: {
    color: '#fff',
    fontSize: 20,
  },
});