import React, { useState } from 'react';
import { View, StyleSheet, StatusBar } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import IntroSplashScreen from './screens/IntroSplashScreen';
import WelcomeScreen from './screens/WelcomeScreen';

export default function App() {
  const [isReady, setIsReady] = useState(false);

  return (
    <SafeAreaProvider>
      <View style={styles.container}>
        <StatusBar barStyle="light-content" />
        
        {!isReady ? (
          <IntroSplashScreen onFinish={() => setIsReady(true)} />
        ) : (
          <WelcomeScreen />
        )}
      </View>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
});