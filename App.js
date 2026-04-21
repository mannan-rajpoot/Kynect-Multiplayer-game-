import React, { useState, useRef } from 'react';
import { View, StyleSheet, StatusBar, Animated, Dimensions, Easing } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import IntroSplashScreen from './screens/IntroSplashScreen';
import WelcomeScreen from './screens/WelcomeScreen';
import AuthScreen from './screens/AuthScreen';

const { width } = Dimensions.get('window');

export default function App() {
  // 'splash' | 'welcome' | 'auth'
  const [screen, setScreen] = useState('splash');

  // Animation Refs
  const splashAnim = useRef(new Animated.Value(0)).current; // 0 to 1
  const welcomeAnim = useRef(new Animated.Value(0)).current; // 0 to 1
  const authAnim = useRef(new Animated.Value(0)).current; // 0 to 1

  const transition = (fromVar, toVar, nextScreen) => {
    Animated.parallel([
      Animated.timing(fromVar, {
        toValue: -width,
        duration: 500,
        easing: Easing.bezier(0.4, 0, 0.2, 1),
        useNativeDriver: true,
      }),
      Animated.timing(toVar, {
        toValue: 1, // Using 1 as a "visible" state
        duration: 600,
        easing: Easing.bezier(0.4, 0, 0.2, 1),
        useNativeDriver: true,
      }),
    ]).start(() => setScreen(nextScreen));
  };

  const handleSplashFinish = () => {
    // Initial entrance of Welcome
    Animated.timing(welcomeAnim, {
      toValue: 1,
      duration: 600,
      useNativeDriver: true,
    }).start(() => setScreen('welcome'));
  };

  const handleWelcomeFinish = () => {
    setScreen('auth');
    // We animate authAnim from 0 to 1
    Animated.spring(authAnim, {
      toValue: 1,
      tension: 20,
      friction: 7,
      useNativeDriver: true,
    }).start();
  };

  return (
    <SafeAreaProvider>
      <View style={styles.container}>
        <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />

        {screen === 'splash' && (
          <IntroSplashScreen onFinish={handleSplashFinish} />
        )}

        {screen === 'welcome' && (
          <Animated.View style={[StyleSheet.absoluteFill, { opacity: welcomeAnim }]}>
            <WelcomeScreen onFinish={handleWelcomeFinish} />
          </Animated.View>
        )}

        {screen === 'auth' && (
          <Animated.View 
            style={[
              StyleSheet.absoluteFill, 
              { 
                opacity: authAnim,
                transform: [{ 
                  translateY: authAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [50, 0]
                  }) 
                }] 
              }
            ]}
          >
            <AuthScreen onFinish={() => console.log('Main App Navigation')} />
          </Animated.View>
        )}
      </View>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0A0A0A',
  },
});